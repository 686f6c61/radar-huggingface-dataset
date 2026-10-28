# jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI4

## Resumen

`jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI4` es una cuantización en formato GGUF del modelo `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16`, que a su vez deriva del Swift 1.5 Qwen3.8-27B de UkisAI, una adaptación de Qwen3.8-27B. El autor del repositorio, jakeatx, publica el modelo en el formato propietario AI+ de llamAmpere (formato 2), con unos 4,2 bits por peso, un tamaño de 14,4 GB y 27.320.697.856 parámetros totales. Conserva la cabeza MTP (multi-token prediction) del modelo original y elimina la torre de visión.

El interés de esta ficha no está en el modelo base, sino en el empaquetado: es un cuantizado de ~4,2 bpw pensado para ejecutarse en una única GPU de 24 GB con una ventana de contexto configurable de 262.144 tokens. El autor publica métricas de divergencia KL frente al BF16 y medidas de rendimiento (lectura de prompt de 100K tokens y velocidad de escritura) sobre una RTX 3090 Ti, lo que permite evaluar la pérdida de calidad de la cuantización con datos en lugar de con impresiones.

La contrapartida es que el archivo requiere llamAmpere v0.6 o superior y no carga en llama.cpp estándar; para ese caso el autor remite a una cuantización IQ4_XS-M alternativa. Además, se trata de un derivado "uncensored" (abliterado) del que el autor original declara validación estructural pero no mediciones de comportamiento ni de capacidades, por lo que su calidad real en tareas concretas debe validarse antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.8-27B; el autor no detalla la arquitectura del modelo base. Conserva la cabeza MTP (multi-token prediction) para decodificación especulativa y no incluye torre de visión |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens (según las instrucciones de ejecución del autor y la ficha de aimarketcap) |
| Tipos de cuantizacion | Este repositorio: un único archivo AI+ formato 2 (~4,2 bits por peso; tipos mixtos de 3, 4 y 5 bits, con imatrix). Repositorio alternativo: GGUF IQ4_XS-M compatible con llama.cpp estándar |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (Swift Open License v1.0 para la aportación de UkisAI) + Apache 2.0 para Qwen3.8-27B; ver `NOTICE` |
| Formato de pesos | GGUF en AI+ formato 2; requiere llamAmpere v0.6 o superior |
| Tamano del archivo | `qwen3.8-27b-Swift1.5-Uncensored-ATX-AI4.gguf`: 13,43 GiB (14.416.419.520 bytes) |
| SHA-256 | `1106accccb165c6726e46c811955586c462cd8f99879cd0b27c4711ce59744b3` |
| Modelo base | `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16` (relación: quantized) |
| Runtime | llama.cpp (fork llamAmpere v0.6+); no carga en llama.cpp mainline |

## Arquitectura y entrenamiento

La cadena de procedencia documentada es: Qwen3.8-27B → Swift 1.5 Qwen3.8-27B de UkisAI (revisión de origen `15165fce17cb716934a2b15e746d9c7b061d4a0f`) → `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16` → este GGUF cuantizado. La modificación respecto al modelo de UkisAI es una ablación direccional de rango 1 sobre el residual stream, es decir, una reducción de rechazos del tipo "abliterated" que el autor documenta en `ABLITERATION.json`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

A nivel técnico, lo diferencial del archivo es doble. Por un lado, la cuantización AI+ formato 2, que mezcla tipos de 3, 4 y 5 bits con una matriz de importancia (imatrix) para lograr ~4,2 bpw manteniendo la cabeza MTP. Por otro, el uso de decodificación especulativa mb-MTP, activada por defecto en llamAmpere v0.6, con una profundidad de borrador adaptativa de 3 a 5 tokens (`--spec-type draft-mtp-adaptive --spec-draft-n-min-adaptive 3 --spec-draft-n-max 5`). El autor advierte que para muestreo exacto debe añadirse `--no-spec-mb-mtp`.

## Capacidades

- Generación de texto conversacional (tag `conversational`), orientada a diálogo multi-turno.
- Ventana de contexto configurable de 262.144 tokens, adecuada para prompts de 100K tokens sostenidos, según las pruebas del autor.
- Razonamiento y generación de código: las mediciones publicadas se hicieron sobre conversaciones reales de programación, agentes y preguntas sobre documentos.
- Decodificación especulativa con cabeza MTP integrada para acelerar la generación.
- Modo "uncensored": reducción deliberada de rechazos mediante ablación; no se han publicado mediciones de comportamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el autor solo menciona pruebas con conversaciones de tipo agente.
- Visión: no (la torre de visión ha sido eliminada del archivo).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes conversacionales de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener el hilo de conversaciones extensas o de varias sesiones concatenadas sin truncar, siempre que se despliegue en una GPU de 24 GB con llamAmpere.
- Análisis de documentación técnica y bases de código completas: el autor valida el archivo con prompts de 100K tokens; encaja en tareas de resumen, búsqueda de referencias cruzadas y explicación de repositorios medianos en una sola pasada.
- Generación de código en local con requisitos de privacidad: al ejecutarse en una única tarjeta y con API compatible con OpenAI (`http://127.0.0.1:8080`), puede integrarse en un IDE o en un pipeline interno sin enviar código a terceros.
- Procesamiento por lotes de transcripciones y expedientes largos: lectura rápida de prompts largos (1.337 tok/s medidos en un prompt de 100K) abarata el prefill en trabajos de extracción de información sobre documentos extensos.
- Escritura creativa y roleplay sin restricciones de contenido: es el caso de uso natural de un derivado abliterado; conviene aplicar filtros propios en la capa de aplicación.
- Investigación sobre alineación y robustez: sirve como contrapunto experimental frente al modelo base con rechazos, para estudiar efectos de la ablación sobre comportamiento y calidad.
- Evaluación de técnicas de cuantización: el par AI+ 4,2 bpw frente a IQ4_XS-M, con divergencia KL medida, lo convierte en un banco de pruebas útil para comparar formatos en la misma máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible. La página de UkisAI indica que dispone de protocolos de evaluación guardados que comparan Qwen3.8-27B, Swift 1.0 y Swift 1.5 con agregados de cinco repeticiones, pero las cifras no aparecen en la información proporcionada.

Sí hay métricas de cuantización y rendimiento publicadas por el autor. Entorno: RTX 3090 Ti, temperatura 1.0, conversaciones reales de 100K tokens (código, agente y preguntas sobre documentos), al menos 5.120 tokens escritos, misma build de llamAmpere v0.6 para ambos archivos.

| Metrica | ATX-AI4 (este archivo) | ATX IQ4_XS-M |
|---|---|---|
| Tamano de archivo | 14,4 GB | 15,6 GB |
| Divergencia KL frente a BF16 (menor = más cercano) | 10,4 % menor (ratio 0,896; IC 95 % 0,860-0,932; 32.400 posiciones; dos conjuntos de referencia) | línea base |
| Lectura de prompt de 100K | 1.337 tok/s (+8,9 %) | 1.228 tok/s |
| Velocidad de escritura | 111,5 tok/s (+2,3 %, no significativo) | 109,0 tok/s |
| Memoria máxima en tarjeta | 17,3 GB (-1,1 GB) | 18,5 GB |

Frente a llamAmpere v0.5 con el IQ4_XS-M publicado, v0.6 con este archivo escribe un 13,5 % más rápido (112,2 frente a 98,8 tok/s, p = 0,019) y lee el prompt de 100K un 23 % más rápido. Son datos de rendimiento y fidelidad de cuantización, no de calidad en tareas downstream.

## Requisitos de hardware

- VRAM estimada: ~17,3 GB de pico en tarjeta con contexto de 262.144 tokens configurado y prompt de 100K (medición del autor); el archivo pesa 13,43 GiB.
- GPU recomendadas: RTX 3090 o RTX 3090 Ti (24 GB) es el objetivo declarado. No hay datos publicados para A100, H100 ni otras GPU.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB. En tarjetas de 16 GB no hay margen documentado.
- Despliegue: exclusivamente llamAmpere v0.6 o superior (`llama-server` del fork, compilado con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=86 -DLLAMA_BUILD_BORINGSSL=ON`). No carga en llama.cpp mainline, por lo que vLLM, TGI u Ollama no están soportados para este archivo. Para mainline, usar la cuantización IQ4_XS-M del mismo autor.
- Parámetros de ejecución sugeridos por el autor: `-c 262144 -ngl 99 -fa on -ctk sjkvarn4 -ctv sjkvarn4 -b 4096 -ub 1024 --parallel 1`.
- Throughput: 1.337 tok/s de lectura de prompt de 100K y 111,5 tok/s de escritura en RTX 3090 Ti. Para el modelo relacionado `swift-1.5-qwen3.8-27b-uncensored`, llm-bench.io recoge 285 tok/s de pico en 10 ejecuciones comunitarias sobre 1 GPU; no es una medida de este archivo.
- Latencia: no disponible de forma desagregada (solo velocidades agregadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Runtime | Licencia |
|---|---|---|---|---|---|
| ATX-AI4 (esta ficha) | 27,32 B | 262.144 | GGUF AI+ 2, ~4,2 bpw, 14,4 GB | llamAmpere v0.6+ | Swift Open License 1.0 + Apache 2.0 |
| ATX IQ4_XS-M (mismo autor) | 27,32 B | 262.144 | GGUF IQ4_XS-M, 15,6 GB | llama.cpp mainline (según el autor) | Swift Open License 1.0 + Apache 2.0 |
| `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16` | 27,32 B | No disponible | BF16 (referencia de fidelidad) | Según runtime del autor | Swift Open License 1.0 + Apache 2.0 |
| UkisAI Swift 1.5 Qwen3.8-27B | 27 B (clase) | No disponible | Pesos completos | No disponible | Swift Open License 1.0 |

Los cuatro comparten base y licencia; la diferencia práctica es el equilibrio entre fidelidad (BF16), compatibilidad de runtime (IQ4_XS-M) y velocidad y huella de memoria (AI+ 4,2 bpw). No se dispone de comparaciones con modelos de otras familias (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: la ablación de rechazos reduce las negativas del modelo, lo que implica riesgo de generar contenido dañino, sesgado o legalmente problemático. Requiere filtrado y políticas de uso en la capa de aplicación.
- El autor del derivado declara validación estructural, pero no ha publicado mediciones de comportamiento ni de capacidades; no hay evidencia pública de que la ablación preserve el rendimiento del modelo original.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo de 27 B cuantizado a ~4,2 bpw, con la pérdida adicional que ello implica frente al BF16.
- Fidelidad de cuantización: aunque la divergencia KL es un 10,4 % menor que la del IQ4_XS-M, sigue siendo una cuantización con pérdida respecto al BF16.
- La decodificación especulativa mb-MTP está activa por defecto y puede alterar el muestreo; para reproducibilidad exacta hay que desactivarla con `--no-spec-mb-mtp`.
- Dependencia de un fork: no funciona en llama.cpp estándar, lo que limita el soporte de vLLM, TGI, Ollama y servicios gestionados, y añade deuda de mantenimiento.
- Sin torre de visión: no admite entrada de imágenes.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe homogéneo.
- Licencia marcada como `other` (Swift Open License v1.0) más Apache 2.0 para el componente Qwen: las condiciones exactas de uso comercial deben revisarse en `LICENSE` y `NOTICE` antes de desplegar; no están resumidas en la información disponible.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no hay validación independiente de la comunidad.
- Los archivos AI+ anteriores del mismo modelo están retirados y no cargan en v0.6; conviene fijar la versión exacta del runtime y el SHA-256 del archivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI4
- Modelo base (BF16): https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16
- Cuantización alternativa IQ4_XS-M (compatible con llama.cpp mainline): https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF
- README del IQ4_XS-M: https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF/blob/main/README.md
- Árbol de archivos del IQ4_XS-M: https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF/tree/main
- Swift 1.5 Qwen3.8-27B de UkisAI (página del modelo y evaluaciones): https://ukisai.com/swift-1-5-27b
- Pesos de UkisAI en HuggingFace: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Runtime llamAmpere, release v0.6: https://github.com/JakeATX/llamAmpere/releases/tag/v0.6
- Repositorio llamAmpere: https://github.com/JakeATX/llamAmpere
- Ficha en aimarketcap: https://aimarketcap.tech/models/jakeatx-atx-swift-qwen3-8-27b-uncensored-iq4-xs-m-gguf
- Benchmarks comunitarios del modelo relacionado: https://llm-bench.io/models/swift-1-5-qwen3-8-27b-uncensored
