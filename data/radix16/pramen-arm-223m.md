# radix16/pramen-arm-223m

## Resumen

Pramen ARM 223M es un modelo de decompilación neuronal desarrollado por radix16 que convierte el ensamblador AArch64 de una función individual de vuelta a código C. Es el hermano para ARM de la familia Pramen (radix16/pramen-223m y radix16/pramen-498m, orientados a Windows y MS-DOS), compartiendo arquitectura y formato de prompt pero con datos y tokenizador propios. El modelo aborda un problema clásico de la ingeniería inversa: la decompilación manual de binarios es lenta y propensa a errores, y las herramientas tradicionales como IDA o Ghidra producen pseudocódigo difícil de leer.

Se trata de un transformer decoder-only de estilo GPT-2 con 222.513.152 parámetros, entrenado desde cero exclusivamente sobre ensamblador y C, con un tokenizador propio de 16.384 tokens que codifica aproximadamente 5,7 tokens por instrucción ARM. Soporta tres variantes de compilación de Apple clang: `apple-arm64-O0` (sin optimización), `apple-arm64-Os` (optimizado para tamaño) y `apple-arm64-O2` (optimizado).

La relevancia del modelo radica en su especialización vertical: frente a LLMs generalistas, Pramen ARM está ajustado a un formato de listado exacto (`arm64-v1`) generado con Capstone 5.0, lo que le permite alcanzar un 76,2 % de tareas resueltas en HumanEval-C sobre código sin optimizar, con un 90,9 % al aplicar muestreo de 8 candidatos con recompilación selectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2) |
| Parametros totales | 222.513.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | code (ensamblador AArch64 y C) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-2 con 223 millones de parámetros, entrenado desde cero sobre pares de ensamblador AArch64 y código C. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, aunque la model card indica que se entrenó «solo con ensamblador y C». Dispone de un tokenizador propio de 16.384 tokens, calibrado para el dominio (aproximadamente 5,7 tokens por instrucción ARM).

La innovación técnica principal no reside en la arquitectura sino en el pipeline de inferencia y en la especialización del formato de entrada. El modelo consume un listado generado por Capstone 5.0 con mnemónicos y registros en mayúsculas, sin espacios tras las comas, etiquetas `LAB_n:` para saltos locales, referencias a símbolos (`BL _strlen`, `ADRP X8,_total`) y literales de cadena/constante como líneas `STR_n:` / `CONST_n:`. Además, admite un contexto opcional de declaraciones C (`--context`) que se reescribe automáticamente al formato de una línea usado en entrenamiento, mejorando sustancialmente la tasa de compilación y de recompilación exacta. El modo `--candidates 8` muestrea ocho propuestas, recompila cada una con Apple clang y conserva la que genera un ensamblador más cercano al de entrada.

## Capacidades

- Decompilación de ensamblador AArch64 a C para funciones individuales de binarios Mach-O arm64 (incluida la slice arm64e de binarios fat) y ELF AArch64.
- Soporte de tres variantes de optimización de Apple clang 17: `-O0`, `-Os` y `-O2`.
- Funcionamiento con binarios stripped: permite identificar la función por dirección (`--function 0x100003f20`).
- Aceptación de contexto de declaraciones C (`--context`) con structs, unions, enums, typedefs, globales `extern` y prototipos de funciones llamadas.
- Generación de código C17 con cabeceras estándar que compila con Apple clang.
- Muestreo multi-candidato con selección por similitud de reensamblado (`--candidates 8`).
- Capacidad de nombrar variables y tipos de forma inventada (los nombres no están en el binario).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al dominio código (ensamblador y C); no se declaran idiomas naturales.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- **Ingeniería inversa de binarios de Apple Silicon**: dado un binario Mach-O arm64 de macOS o iOS, el modelo permite recuperar una propuesta de código C de funciones concretas sin optimizar con una tasa de acierto del 76,2 % en HumanEval-C, acelerando el análisis frente a la lectura manual del desensamblado.
- **Auditoría de seguridad de aplicaciones iOS/macOS**: para revisar funciones sospechosas en binarios stripped, el flujo `list` → `asm` → `decompile` permite obtener pseudocódigo C legible y verificar lógica de validación, cifrado o control de acceso.
- **Recuperación de código fuente perdido**: cuando se dispone de un binario compilado con clang sin optimizar y se ha perdido el código original, el modelo puede reconstruir funciones individuales con declaraciones de contexto (`--context types.h`) para obtener un 83,0 % de compilación y un 67,2 % de reensamblado exacto en funciones held-out de ExeBench.
- **Análisis de malware para plataformas Apple**: en entornos de laboratorio aislado, el modelo ayuda a generar hipótesis sobre la lógica de funciones ofuscadas o sin símbolos, usando la dirección de la función cuando el binario está stripped.
- **Investigación en decompilación neuronal**: como modelo pequeño (223 M) y entrenado desde cero, sirve de base reproducible para experimentos de decompilación con presupuesto de cómputo reducido, comparando variantes de optimización y estrategias de muestreo multi-candidato.
- **Integración en pipelines de análisis estático**: la API Python (`pramen_arm.runtime.PramenArm`) y la CLI permiten automatizar la decompilación por lotes de funciones de un binario y alimentar herramientas posteriores de análisis o revisión humana.
- **Docencia en reversing y compiladores**: los ejemplos incluidos (`example-count_words.c`, `example-order_total.c`) y la comparación entre `-O0` y `-O2` ilustran de forma práctica cómo la optimización transforma el código y por qué la decompilación de código optimizado es más difícil.

## Benchmarks y rendimiento

HumanEval-C del dataset `LLM4Binary/decompile-eval` (CC0), recompilado con el mismo Apple clang de entrenamiento, 164 tareas por variante. Una tarea se considera resuelta si el C decompilado compila (C17, cabeceras estándar) y pasa los tests originales. Máximo 600 tokens nuevos.

| Variante | Greedy | `--candidates 8` |
|---|---|---|
| apple-arm64-O0 | 76,2 % | 90,9 % |
| apple-arm64-Os | 26,2 % | 34,8 % |
| apple-arm64-O2 | 23,8 % | 32,3 % |
| **Promedio** | 42,1 % | 52,7 % |

Funciones held-out de ExeBench (500 funciones × 3 variantes nunca vistas en entrenamiento, compiladas con sus dependencias reales), greedy: porcentaje que compila y porcentaje que recompila al ensamblador de entrada exacto.

| | O0 compila / exacto | Os compila / exacto | O2 compila / exacto |
|---|---|---|---|
| Sin declaraciones | 47,6 / 35,0 % | 44,6 / 24,4 % | 45,2 / 24,8 % |
| Con declaraciones (`--context`) | 83,0 / 67,2 % | 79,2 / 50,2 % | 79,4 / 50,2 % |

En HumanEval con `-Os` / `-O2`, aproximadamente 100 de 164 salidas compilan pero fallan los tests. El error típico es fusionar valores que el código optimizado mantiene solo en registros (una suma y un producto escritos como una sola variable) o eliminar un paso de un bucle. El autor advierte que estas cifras no son directamente comparables con los modelos de Windows / DOS (otros compiladores, otro número de tareas).

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; con 222,5 M de parámetros, en fp32 los pesos ocupan aproximadamente 0,9 GB (tamaño del repo), y en fp16 alrededor de 0,45 GB, más el overhead de activaciones y del tokenizador.
- **GPU recomendadas**: el autor reporta funcionamiento en Apple M2 Pro vía MPS (backend Metal), con un tiempo de aproximadamente 2 s por función pequeña y 5–8× más con `--candidates 8`.
- **Cabe en GPU consumer**: sí, por tamaño; el autor no publica requisitos mínimos ni listado de GPUs NVIDIA/AMD probadas.
- **Opciones de despliegue**: el repo incluye un runtime propio (`pramen_arm.runtime.PramenArm`) y una CLI (`python -m pramen_arm`), con dependencias `torch`, `tokenizers`, `safetensors` y `capstone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: ~2 s por función pequeña en M2 Pro (MPS); `--candidates 8` multiplica el tiempo por 5–8. No se publican cifras de throughput agregado.
- **Requisito adicional**: el modo `--candidates 8` requiere Apple clang (Xcode Command Line Tools) para recompilar las propuestas.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| radix16/pramen-arm-223m | 222,5 M | AArch64 (Apple Silicon) → C | no disponible | apache-2.0 | Hugging Face |
| radix16/pramen-223m | no disponible en la información | Windows / MS-DOS → C | no disponible | no disponible en la información | Hugging Face |
| radix16/pramen-498m | no disponible en la información | Windows / MS-DOS → C | no disponible | no disponible en la información | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento de los modelos hermanos (pramen-223m, pramen-498m) ni de alternativas de decompilación neuronal comparables, por lo que la comparación cuantitativa de benchmarks queda como no disponible. El propio autor indica que las cifras de Pramen ARM no son directamente comparables con las de los modelos de Windows / DOS por diferencias de compilador y de número de tareas.

## Limitaciones y advertencias

- **La salida es una propuesta, no una decompilación garantizada**: en código sin optimizar suele ser correcta; en código optimizado a menudo compila pero la lógica es incorrecta.
- **Nombres y tipos inventados**: los identificadores no están en el binario y los tipos se adivinan; sin `--context` el modelo puede inventar structs y leer campos equivocados (por ejemplo, `m->p[i].weight * m->p[i].delta` en lugar de la estructura real).
- **Debilidad en código optimizado**: en `-Os` / `-O2` la tasa greedy cae al 26,2 % y 23,8 % en HumanEval-C, y unos 100 de 164 outputs compilan pero fallan los tests. Errores típicos: fusionar valores que el optimizador mantiene en registros y eliminar pasos de bucles.
- **Formato de entrada rígido**: solo acepta el listado `arm64-v1` generado por `python -m pramen_arm asm` a partir del binario; el texto copiado de `objdump`, `otool`, IDA o Ghidra no se convierte todavía.
- **Entrada limitada a binarios enlazados**: Mach-O arm64 o ELF AArch64, no ficheros `.o`; los binarios stripped funcionan indicando la dirección de la función.
- **Sesgos conocidos**: no disponible en la información proporcionada.
- **Riesgo de alucinación**: alto en el sentido de que el modelo genera código plausible que puede no corresponder a la semántica real del binario, especialmente en código optimizado.
- **Limitaciones de idioma**: el modelo está entrenado solo con ensamblador y C; no procesa lenguaje natural ni otros lenguajes de programación.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la corrección del código generado; la verificación mediante recompilación y tests es responsabilidad del usuario.
- **Caveat para producción**: el modo `--candidates 8` requiere Apple clang instalado y multiplica el coste de inferencia por 5–8; los textos de ayuda de la CLI están en checo.
- **Dependencia de dependencias externas**: el pipeline requiere Capstone 5.0 para el desensamblado y Apple clang para la selección de candidatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/radix16/pramen-arm-223m
- Modelo hermano (Windows / MS-DOS, 223 M): https://huggingface.co/radix16/pramen-223m
- Modelo hermano (Windows / MS-DOS, 498 M): https://huggingface.co/radix16/pramen-498m
- Dataset de evaluación HumanEval-C (LLM4Binary/decompile-eval, CC0): https://huggingface.co/datasets/LLM4Binary/decompile-eval
