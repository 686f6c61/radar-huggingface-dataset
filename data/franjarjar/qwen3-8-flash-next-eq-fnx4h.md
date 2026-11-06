# Franjarjar/Qwen3.8-Flash-Next-EQ-FNX4H

## Resumen

Qwen3.8-Flash-Next-EQ-FNX4H es una cuantización del modelo Qwen/Qwen3.8-Flash-Next realizada por el usuario Franjarjar para Espetero, un motor de inferencia nativo para Metal en Apple silicon. El modelo base es un transformer de tipo mixture-of-experts (MoE) de Qwen, con 78.868.271.075 parámetros totales según los tensores safetensors del repositorio. La cuantización emplea el formato propietario EQ (LaneQuant), que almacena códigos de 4, 5, 6 y 8 bits con escalas firmadas de 8 bits por cada 16 entradas y escalas fp16 cada 256, alineadas con los kernels matriciales de la GPU de Apple.

El interés de esta ficha es doble: por un lado, documenta una cuantización de muy bajo peso (5,09 bits por peso efectivos) que busca preservar la calidad del modelo BF16 con una divergencia KL baja; por otro lado, ilustra un ecosistema de inferencia alternativo (Espetero) que no es compatible con llama.cpp, MLX ni transformers. El repositorio ocupa 113,9 GB en disco y requiere un Mac con 128 GB de memoria unificada para mantener los expertos residentes.

La licencia es la Qwen Community License 1.0, que permite redistribuir pesos modificados pero impone condiciones para uso comercial como servicio. No se dispone de información sobre idiomas soportados ni sobre la pipeline de la tarea en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) del modelo base Qwen3.8-Flash-Next |
| Parametros totales | 78.868.271.075 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ (LaneQuant) nativo de Espetero: códigos de 4, 5, 6 y 8 bits; escalas firmadas de 8 bits por 16 entradas y fp16 cada 256; embedding y LM head MLX affine 8-bit; routers en BF16; tabla de n-gramas MLX affine 4-bit (grupo 32) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (formato EQ de Espetero; no cargable por llama.cpp, MLX ni transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 512 expertos enrutados por capa, según se detalla en la model card de la cuantización. La cuantización conserva la estructura MoE y aplica distintos niveles de precisión por tipo de matriz: las proyecciones gate/up de los expertos usan EQ con codebook de 4 bits (5 bits en las capas 0-9 y 43-47), las proyecciones down usan 5 bits (codebook de 4 bits en las capas 19-38), el resto de matrices no expertas emplean 8 bits EQ (6 bits en las capas 19-38), el embedding y el LM head usan MLX affine 8-bit, los routers se mantienen en BF16 y se incluye la cabeza MTP (multi-token prediction). La tabla de n-gramas se cuantiza a 4 bits con MLX affine (grupo 32) y se lee desde el SSD en tiempo de ejecución.

El proceso de cuantización se realizó con `espetero quantize` de Espetero 0.2.0 (commit `616c21a`), con un tiempo de 70 minutos en un M4 Max y un pico de 12 GB de memoria. La calibración se obtuvo a partir de las estadísticas del checkpoint oQ4e-mtp sobre 256K tokens de texto mixto (prosa, código y chat), con Hessianos por experto en las proyecciones down, ya que el modelo BF16 no cabe en memoria. El resultado son 5,09 bits por peso efectivos, medidos sobre los parámetros de texto del modelo base sin contar la cabeza MTP ni la tabla de n-gramas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-Flash-Next, aunque no se detallan en la información disponible.
- Código y matemáticas: no se documentan explícitamente en la model card; deben evaluarse contra el modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se especifican.
- Capacidades especiales: incluye la cabeza MTP (multi-token prediction) del modelo base, que puede habilitar decodificación especulativa en Espetero (la medición de velocidad se realizó con `--mtp none`).
- Inferencia nativa en Apple silicon: soporta servidor compatible con clientes OpenAI, Anthropic y Ollama a través de `espetero serve`.

## Casos de uso

- Inferencia local en Mac de gama alta: el modelo está pensado para ejecutarse en un Mac con 128 GB de memoria unificada mediante Espetero, lo que permite desplegar un MoE de ~79B parámetros en hardware de escritorio sin GPU dedicada.
- Servidor compatible con OpenAI/Anthropic/Ollama: `espetero serve` expone el modelo en `http://127.0.0.1:8080`, por lo que se puede integrar en aplicaciones existentes que ya consuman esas APIs sin cambiar el cliente.
- Evaluación de cuantizaciones de bajo bit: sirve como referencia para estudiar el compromiso entre bits por peso (5,09), divergencia KL (0,0306 de media) y velocidad de decodificación (51 tok/s en M4 Max) frente a alternativas como oQ4e-mtp o EXL3 5.05.
- Experimentación con decodificación multi-token: la inclusión de la cabeza MTP permite probar decodificación especulativa en Espetero, aunque las mediciones publicadas se hicieron con MTP desactivado.
- Investigación sobre formatos de cuantización: el formato EQ (LaneQuant) y sus reglas (`rules.txt`) son reproducibles, lo que facilita estudios sobre asignación de bits por capa y tipo de matriz.
- Prototipado de asistentes conversacionales con contexto largo: aunque la longitud de contexto no se especifica, el modelo base es de la familia Qwen3.8-Flash-Next y la calibración incluyó turnos de chat; conviene validar el contexto real antes de usarlo en producción.

## Benchmarks y rendimiento

La model card publica métricas de calidad de cuantización (divergencia KL frente al BF16) y velocidad de decodificación, no benchmarks de tareas estándar como MMLU o HumanEval.

| Metrica | Este archivo (fnx4h) | oQ4e-mtp (Jundot) | EXL3 5.05 |
|---|---|---|---|
| Bits por peso | 5,09 | 4,58 | 5,20 |
| KLD media | 0,0306 | 0,1170 | 0,0187 |
| KLD mediana | 0,00366 | 0,0185 | 0,00221 |
| KLD p99 | 0,3969 | 1,3967 | 0,2446 |
| Top-1 | 94,9 % | 89,3 % | 96,0 % |
| Decodificación en M4 Max (tok/s) | 51 | 58 | no medido |

La comparación pareada frente a oQ4e-mtp, ejecutada por Espetero 616c21a sobre las mismas ventanas de referencia, muestra una reducción de KLD del 73,8 % (intervalo de confianza del 95 %: -76,4 % a -71,7 %; inferior en el 100 % de las 24 ventanas). La decodificación se midió con una secuencia, 64 pasos forzados por el profesor tras un prompt de 4K tokens, en un M4 Max de 128 GB con los expertos de ambos archivos residentes. EXL3 5.05 se midió en emulación fp32 y su velocidad en Metal no se midió en este estudio.

## Requisitos de hardware

- VRAM/memoria: se necesita un Mac con 128 GB de memoria unificada; los expertos permanecen residentes y los pesos ocupan unos 80 GB.
- GPU recomendadas: Apple silicon de gama alta; las mediciones publicadas usan un M4 Max de 128 GB. No hay datos para M1 Max en la tabla (la columna aparece vacía).
- ¿Cabe en GPU consumer? No en GPUs dedicadas convencionales: el formato EQ es exclusivo de Espetero y el tamaño en disco es de 113,9 GB. En Apple silicon requiere 128 GB de memoria unificada.
- Opciones de despliegue: exclusivamente Espetero 0.2.0 o posterior (`brew install JarJarFran/espetero/espetero` y `espetero serve --model Franjarjar/Qwen3.8-Flash-Next-EQ-FNX4H`). No es compatible con llama.cpp, MLX ni transformers.
- Latencia y throughput: 51 tok/s de decodificación en M4 Max con 128 GB y expertos residentes; oQ4e-mtp decodifica un 13 % más rápido en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | KLD media | Top-1 | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EQ-FNX4H (este) | 78,87B | no disponible | 5,09 | 0,0306 | 94,9 % | qwen-community-1.0 | EQ (Espetero) |
| Qwen3.8-Flash-Next-EQ-MIX408 | no disponible | no disponible | no disponible | no disponible | no disponible | qwen-community-1.0 | EQ (Espetero) |
| oQ4e-mtp (Jundot) | mismo base | no disponible | 4,58 | 0,1170 | 89,3 % | no disponible | no disponible |
| EXL3 5.05 | mismo base | no disponible | 5,20 | 0,0187 | 96,0 % | no disponible | EXL3 |

La comparativa se limita a cuantizaciones del mismo modelo base; no se dispone de datos de modelos alternativos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Formato propietario: los archivos EQ solo los carga Espetero; llama.cpp, MLX y transformers no pueden leerlos, lo que limita la portabilidad y el ecosistema de herramientas.
- Requisito de hardware estricto: necesita un Mac con 128 GB de memoria unificada; no es viable en equipos con menos memoria ni en GPUs dedicadas convencionales.
- Calidad inferior a EXL3 en emulación fp32: la KLD media es un 40 % superior a la de EXL3 5.05 (0,0306 frente a 0,0187) y el Top-1 es 1,1 puntos inferior (94,9 % frente a 96,0 %).
- Velocidad inferior a oQ4e-mtp: decodifica un 13 % más lento en M4 Max (51 frente a 58 tok/s), porque dedica bits adicionales a matrices no expertas de 8 bits.
- La tabla de n-gramas ocupa 32 GB del tamaño total y se lee desde el SSD en tiempo de ejecución; el rendimiento puede depender del almacenamiento.
- Sesgos y alucinaciones: no se documentan en la información disponible; deben evaluarse contra el modelo base.
- Idiomas y contexto: no se especifican en la model card; conviene verificar la longitud de contexto real y el soporte multilingüe antes de usarlo en producción.
- Licencia comercial: la Qwen Community License 1.0 permite redistribuir pesos modificados y exige incluir el aviso de licencia en cada copia. Las empresas que ofrezcan el modelo como servicio o como asistente de trabajo con IA necesitan una licencia comercial separada de Qwen; los productos grandes (más de 100 millones de usuarios mensuales o 20 millones de dólares de ingresos mensuales) deben mostrar el nombre del modelo.
- Repositorio con muy poca tracción: 15 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Franjarjar/Qwen3.8-Flash-Next-EQ-FNX4H
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Espetero (motor de inferencia): https://github.com/JarJarFran/espetero
- Documentación del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
- Cuantización alternativa del mismo autor: https://huggingface.co/Franjarjar/Qwen3.8-Flash-Next-EQ-MIX408
