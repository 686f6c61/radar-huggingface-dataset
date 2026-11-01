# nookwright/personaplex-7b-v1-int8

## Resumen

Personaplex-7b-v1-int8 es una cuantizacion comunitaria de pesos a int8 del modelo nvidia/personaplex-7b-v1, un sistema de conversacion de voz a voz en tiempo real y full-duplex desarrollado por NVIDIA sobre la arquitectura Moshi de Kyutai. El autor de esta version cuantizada es el usuario nookwright, que no tiene vinculacion con NVIDIA ni con Kyutai. El objetivo es claro: reducir el peso del modelo de 16,7 GB en bf16 a 10,2 GB para que pueda ejecutarse en GPUs de 16 GB de VRAM, frente a los 24 GB o mas que exige el original.

La innovacion tecnica de esta ficha no esta en el modelo base sino en el proceso de cuantizacion: solo el transformer temporal principal (6,6B parametros) se almacena en int8 con una escala por fila, mientras que el transformer de profundidad, los embeddings y las cabezas permanecen en bf16. En tiempo de inferencia, un pre-hook de forward convierte una capa a bf16 justo antes de ejecutarse y la libera despues, de modo que solo una capa esta en bf16 en la GPU en cada momento.

Es relevante ahora porque permite desplegar un modelo de voz conversacional full-duplex en hardware de consumo (una RTX 4090 o similar de 16 GB) con una velocidad medida de 1,14x tiempo real en conversaciones de 40 segundos, manteniendo la salida de tokens identica a la cuantizacion en memoria. El modelo es exclusivamente en ingles y hereda la licencia NVIDIA Open Model License del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de voz full-duplex basado en Moshi (transformer temporal + transformer de profundidad) |
| Parametros totales | 7B (6,6B en el transformer temporal; el resto en depth transformer, embeddings y cabezas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only con escala por fila (solo transformer temporal); resto en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | NVIDIA Open Model License (modelo base); pesos Moshiko subyacentes CC-BY-4.0 |
| Formato de pesos | safetensors (model_int8.safetensors, 10,2 GB) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Moshi de Kyutai, disenada para conversacion de voz full-duplex: dos flujos de audio (usuario y asistente) se procesan simultaneamente, lo que permite escuchar y hablar a la vez sin turnos estrictos. La estructura combina un transformer temporal que modela la secuencia a lo largo del tiempo con un transformer de profundidad que genera los tokens de audio dentro de cada paso temporal. Los pesos originales de Moshiko son de Kyutai y NVIDIA los adapta en personaplex-7b-v1; esta version solo modifica el almacenamiento de los pesos del transformer temporal a int8.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. La cuantizacion no altera el entrenamiento: es una conversion post-entrenamiento weight-only que mantiene intactos el tokenizer de audio, los voice prompts y el resto de componentes en bf16. La innovacion practica de esta version es el esquema de dequantizacion por capas descrito en la model card, que evita mantener todo el modelo en bf16 simultaneamente y prescinde del `--cpu-offload` del codigo original (que en las pruebas del autor producia salida silenciosa).

## Capacidades

- Conversacion de voz a voz en tiempo real con modo full-duplex (escucha y habla simultaneamente).
- Generacion de audio de respuesta a partir de entrada de audio, con salida de audio y transcripcion de texto opcional (`--output-text`).
- Seleccion de voz mediante voice prompts (por ejemplo, `NATF2.pt`).
- Ejecucion offline sobre ficheros WAV (`moshi.offline`) y soporte de interfaz web en vivo (`moshi.server`, no probada de extremo a extremo por el autor de la cuantizacion).
- Unicamente en ingles; no se documentan capacidades multilingues.
- No se documentan tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Asistentes de voz conversacionales en local: el modelo mantiene dialogos full-duplex en ingles y, con 10,2 GB de pesos, cabe en una GPU de 16 GB, lo que permite desplegarlo en estaciones de trabajo sin acceso a la nube.
- Prototipado de agentes de voz para investigacion: la velocidad de 1,14x tiempo real en conversaciones de 40 segundos permite iterar sobre prompts de voz y evaluar respuestas sin depender de infraestructura de 24 GB.
- Transcripcion y respuesta hablada por lotes: mediante `moshi.offline` con `--input-wav` y `--output-wav` se pueden procesar grabaciones y generar respuestas de audio y su transcripcion en JSON.
- Demos interactivas en ferias o entornos educativos: una RTX 4090 o una GPU de 16 GB puede ejecutar la interfaz web de Moshi para mostrar conversacion full-duplex en directo.
- Evaluacion de cuantizacion en produccion: sirve como referencia para medir la degradacion de calidad y latencia al pasar de bf16 a int8 en modelos de audio, dado que el autor verifico salida de tokens identica frente a la cuantizacion en memoria.
- Integracion en pipelines de investigacion sobre habla: al mantener el tokenizer y los voice prompts del modelo original, se puede sustituir el checkpoint bf16 por este int8 en experimentos existentes con el codigo de NVIDIA, aplicando el parche de loader incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de tamano y velocidad:

| Metrica | bf16 original | int8 (esta version) |
|---|---|---|
| Tamano del fichero de pesos | 16,7 GB | 10,2 GB |
| Cabe en GPU de 16 GB | no | si (aproximadamente 13 GB usados) |
| Velocidad, 40 s de conversacion (`moshi.offline`) | no disponible | 45,5 s (1,14x tiempo real) |

El autor indica ademas que desactivar las CUDA graphs empeora el rendimiento de 1,43x a 3,04x tiempo real, y que la fusion de la dequantizacion redujo 1,43x hasta 1,14x.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13 GB en uso con esta cuantizacion int8; el original bf16 requiere 24 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM; el autor probo en una GPU de consumo de 16 GB con Windows, torch 2.11 y CUDA 12.8. Para RTX 50xx (Blackwell) recomienda una build mas reciente de torch con cu128.
- Cabe en GPU de consumo: si, en modelos de 16 GB como la RTX 4090 o equivalentes.
- Opciones de despliegue: codigo oficial de NVIDIA personaplex (commit 3428dfd) con el parche `personaplex_int8.patch` aplicado, libreria `moshi` y `accelerate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,14x tiempo real en conversaciones de 40 segundos con `moshi.offline`; la interfaz web `moshi.server` no fue probada de extremo a extremo y el autor advierte que las respuestas podrian ir ligeramente por detras.
- Notas de entorno: `NO_TORCH_COMPILE=1` es necesario donde no hay Triton (por ejemplo, Windows); no se debe desactivar CUDA graphs. En Windows, `sentencepiece` no abre rutas con caracteres no ASCII, por lo que hay que copiar el tokenizer y las voces a una ruta ASCII.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | VRAM aproximada | Disponibilidad |
|---|---|---|---|---|---|---|
| personaplex-7b-v1-int8 (esta version) | 7B (6,6B en int8) | no disponible | en | NVIDIA Open Model License | aprox. 13 GB | HuggingFace, comunidad |
| nvidia/personaplex-7b-v1 (bf16) | 7B | no disponible | en | NVIDIA Open Model License | 24 GB o mas | HuggingFace, oficial |
| kyutai/moshiko-pytorch-bf16 | no disponible | no disponible | en | CC-BY-4.0 | no disponible | HuggingFace, oficial |

La comparativa se limita al linaje directo del modelo, ya que en la informacion proporcionada no se detallan alternativas de otros desarrolladores con arquitectura full-duplex comparable.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Es una cuantizacion no oficial de la comunidad, sin afiliacion ni respaldo de NVIDIA o Kyutai.
- Requiere aceptar la licencia del modelo original en la pagina de nvidia/personaplex-7b-v1 y autenticarse con `huggingface-cli login` para cargar voice prompts y tokenizer de audio.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; hay que revisar el acuerdo antes de desplegar en produccion. Los pesos Moshiko subyacentes son CC-BY-4.0.
- La interfaz web en vivo (`moshi.server`) no fue probada de extremo a extremo; a 1,14x tiempo real las respuestas pueden quedar ligeramente retrasadas.
- No se han publicado benchmarks de calidad (WER, MOS, etc.) para esta cuantizacion; solo se verifico que la salida de tokens coincide con la cuantizacion en memoria en una prueba concreta (voice `NATF2.pt`, seed 1).
- El autor no elimino ni modifico ninguna salvaguarda o limitacion tecnica del modelo original.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible, pero al ser un modelo de dialogo en ingles hereda los del modelo base.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/nookwright/personaplex-7b-v1-int8
- Modelo base oficial: https://huggingface.co/nvidia/personaplex-7b-v1
- Pesos Moshiko de Kyutai: https://huggingface.co/kyutai/moshiko-pytorch-bf16
- Codigo de NVIDIA personaplex: https://github.com/NVIDIA/personaplex
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
