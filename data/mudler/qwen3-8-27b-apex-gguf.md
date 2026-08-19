# mudler/Qwen3.8-27B-APEX-GGUF

## Resumen

Este repositorio contiene dos cuantizaciones GGUF del modelo Qwen3.8-27B, creadas por el equipo de LocalAI (mudler) bajo el proyecto APEX. El modelo base es un transformer denso de 27.320 millones de parámetros con una arquitectura de atención híbrida que intercala capas de atención lineal con capas de atención completa. La relevancia de esta publicación radica en su metodología de cuantización: en lugar de aplicar una asignación de bits plana, APEX mide la sensibilidad de cada grupo de tensores mediante divergencia KL contra una referencia BF16 y redistribuye los bits para minimizar la pérdida de calidad por byte.

El repositorio incluye dos tamaños de cuantización (Mini y Nano) más un proyector de visión en FP16, lo que permite ejecutar el modelo en GPUs de consumo con 12 o 16 GB de VRAM. Además, ambos archivos incorporan la cabeza MTP (Multi-Token Prediction) como un tensor adicional `blk.64` mantenido en Q8_0, lo que habilita la decodificación especulativa directamente contra el mismo archivo sin necesidad de un drafter externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal + completa) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | No aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX-I-Mini (13,94 GB), APEX-I-Nano (11,24 GB), proyector de visión F16 (0,93 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es denso, con 64 capas donde la atención completa se aplica en las capas con índice `i%4==3`, intercalando tres capas de atención lineal por cada capa de atención completa. La FFN (feed-forward network) constituye el 62,6 % de los parámetros y todos los pesos se ejecutan para cada token, ya que no hay expertos. Esta división entre atención lineal y completa hace que los grupos de tensores se comporten de forma diferenciada ante la cuantización.

La cuantización APEX se basa en un análisis de sensibilidad por grupo de tensores. Se midió el incremento de divergencia KL al reducir cada grupo de Q6_K a Q3_K, dividido por los gigabytes ahorrados, obteniendo un rango de 15,3x entre el tensor más sensible (`output`, con 0,03526 dKL/GB) y el menos sensible (`token_embd`, con 0,00231 dKL/GB). Con estos datos se construyeron dos tamaños (Mini y Nano) que superan a la asignación plana en calidad por byte, mientras que los tamaños mayores (Balanced y Compact) no ofrecen ventaja y no se incluyen. El proceso de calibración utilizó imatrix con datos diversos (chat, código, razonamiento, tool-calling, trazas de agentes y Wikipedia) en 200 chunks, y la evaluación se realizó contra logits de referencia BF16 en wikitext-2-raw.

## Capacidades

- Generación de texto conversacional y de razonamiento, con soporte para código y matemáticas (implícito por los datos de calibración utilizados).
- Soporte de visión mediante el proyector `mmproj-Qwen3.8-27B-F16.gguf`, que permite entrada multimodal combinada con texto.
- Decodificación especulativa integrada: la cabeza MTP incluida en el archivo GGUF permite usar `--spec-type draft-mtp` en llama.cpp, con un incremento de throughput reportado por terceros de entre un 35 % y un 52 % en tokens por segundo.
- Capacidad para tool-calling y trazas de agentes, según los datos de calibración empleados en la imatrix.
- Multilingüismo no confirmado en la información proporcionada, aunque el modelo base Qwen suele ser multilingüe.

## Casos de uso

- Asistente local en GPU de consumo: con la variante Mini (13,94 GB) se puede ejecutar en una RTX 4080 o 4090 (16-24 GB de VRAM) para obtener un asistente conversacional de alta calidad sin depender de la nube.
- Despliegue en equipos con 12 GB de VRAM: la variante Nano (11,24 GB) cabe en una RTX 4070 Ti o similar, permitiendo inferencia local en portátiles o estaciones de trabajo modestas.
- Aplicaciones de visión por computador: combinando el archivo principal con el proyector de visión F16, se pueden construir sistemas de captioning o respuesta a preguntas sobre imágenes en local, sin enviar datos sensibles a servidores externos.
- Desarrollo y pruebas de pipelines de agentes: su soporte para tool-calling y razonamiento multi-paso lo hace adecuado para prototipar agentes que llaman funciones, ejecutan código o interactúan con APIs, todo con la ventaja de la decodificación especulativa para reducir la latencia.
- Entornos con restricciones de privacidad: al ser un modelo local con licencia Apache 2.0, puede desplegarse en infraestructura propia para procesar documentos confidenciales o datos de clientes sin necesidad de conexión externa.
- Integración en herramientas de desarrollo con llama.cpp: su compatibilidad con `llama-cli` y `llama-mtmd-cli` permite usarlo en scripts de automatización, generación de código en CI/CD o como backend de editores de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona una comparativa de calidad de cuantización medida como divergencia KL contra logits BF16 en wikitext-2-raw, comparando la asignación APEX con una asignación plana del mismo tamaño:

| Banda | Tamaño del archivo | KL vs BF16 (APEX) | KL vs BF16 (plano, mismo tamaño) | Diferencia |
|---|---|---|---|---|
| Balanced | 17,65 GB | 0,011211 | 0,009832 | 14,0 % peor |
| Compact | 15,17 GB | 0,030468 | 0,030705 | Empate |
| Mini | 13,49 GB | 0,049020 | 0,065369 | 25,0 % mejor |
| Nano | 10,79 GB | 0,121640 | 0,156226 | 22,1 % mejor |

Además, se cita un informe de terceros que indica un incremento de entre un 35 % y un 52 % en tokens por segundo al usar la decodificación especulativa `draft-mtp` con este modelo, aunque el autor no ha medido el throughput directamente.

## Requisitos de hardware

- VRAM estimada: la variante Mini requiere aproximadamente 16 GB de VRAM (archivo de 13,94 GB más overhead de contexto y kernels). La variante Nano requiere aproximadamente 12 GB (archivo de 11,24 GB).
- GPUs recomendadas: RTX 4080/4090 (16-24 GB) para Mini; RTX 4070 Ti, RTX 3080 Ti o similar (12 GB) para Nano. También es compatible con Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (con soporte `qwen3_5` reciente), `llama-cli` para texto, `llama-mtmd-cli` para visión, y LocalAI como servidor de inferencia.
- Latencia y throughput: no medidos por el autor. El uso de la cabeza MTP puede incrementar el throughput entre un 35 % y un 52 % según un informe de terceros, pero depende de la tasa de acierto del drafter y del hardware.

## Comparativa con modelos similares

La comparativa más directa es contra las cuantizaciones planas del mismo modelo base Qwen3.8-27B, que son las que distribuyen otros proyectos como unsloth, bartowski o ggml-org. Según los datos del autor, la asignación APEX supera a la plana en los tamaños pequeños (Mini y Nano), empata en Compact y es peor en Balanced. No se dispone de comparativas con otros modelos de la misma clase de parámetros (por ejemplo, Llama 3.1 8B o Mistral 7B) en la información proporcionada.

| Modelo | Tamaño del archivo | KL vs BF16 | Metodología |
|---|---|---|---|
| Qwen3.8-27B APEX Mini | 13,94 GB | 0,049020 | Asignación por sensibilidad |
| Qwen3.8-27B plano (mismo tamaño) | ~13,49 GB | 0,065369 | Asignación plana |
| Qwen3.8-27B APEX Nano | 11,24 GB | 0,121640 | Asignación por sensibilidad |
| Qwen3.8-27B plano (mismo tamaño) | ~10,79 GB | 0,156226 | Asignación plana |

## Limitaciones y advertencias

- El throughput no ha sido medido por el autor; la cifra de +35-52 % de tokens por segundo proviene de un informe de terceros y puede variar según el hardware y el contexto.
- Los resultados de calidad son específicos de esta arquitectura híbrida (atención lineal + completa). No deben extrapolarse a otros modelos densos.
- El tensor `token_embd` tiene un límite práctico: al ser una búsqueda de embeddings y no una multiplicación de matrices, `llama-imatrix` no recoge datos para él. Los tipos de muy baja precisión que requieren datos de imatrix fallan en tiempo de cuantización; IQ2_S funciona, pero IQ2_XXS no.
- Se necesita una versión reciente de llama.cpp con soporte para la arquitectura `qwen3_5`. Las versiones anteriores al lanzamiento del modelo (2026-08-13) pueden provocar fallos de segmentación al cargar el archivo.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener limitaciones adicionales no documentadas en esta ficha.
- No se dispone de información sobre la longitud de contexto soportada ni sobre los idiomas exactos cubiertos, por lo que se recomienda validar estos aspectos antes de un despliegue en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mudler/Qwen3.8-27B-APEX-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto LocalAI: https://github.com/mudler/LocalAI
- Proyecto APEX: https://github.com/mudler/apex-quant
