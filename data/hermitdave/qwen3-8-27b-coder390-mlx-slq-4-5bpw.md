# hermitdave/Qwen3.8-27B-Coder390-MLX-slq-4.5bpw

## Resumen

Qwen3.8-27B-Coder390-MLX-slq-4.5bpw es una cuantizacion mixta de precision (SLQ, *Sequential Layer Quantization*) del modelo nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2, un fine-tune de la familia Qwen3.5 orientado a generacion de codigo y razonamiento. Lo publica hermitdave, autor de la herramienta slq-mlx, y esta empaquetado especificamente para el framework MLX de Apple (Apple Silicon), no para CUDA. El objetivo es claro: reducir un checkpoint BF16 de ~51 GiB a ~27,5 GiB con una perdida de fidelidad practicamente nula, de modo que el modelo pueda ejecutarse en equipos con memoria unificada de 32-64 GB.

La innovacion principal no es el modelo en si, sino el esquema de cuantizacion: en lugar de aplicar un unico ancho de bits (por ejemplo, 4-bit uniforme), asigna anchos distintos por capa (45% a 4-bit, 45% a 5-bit, 8% a 6-bit y 2% a 8-bit) mediante un asignador voraz por capa calibrado con FineWeb-Edu. El resultado es un promedio de 4,50 bits por peso con una recuperacion media zero-shot de 1,0031 respecto al BF16, es decir, sin degradacion medible en las tareas evaluadas.

Es relevante ahora porque demuestra que las tecnicas de cuantizacion mixta consciente de capa permiten llevar modelos de ~27B a portatiles Mac con 32 GB de RAM unificada sin sacrificar calidad en benchmarks de razonamiento y conocimiento. La licencia MIT facilita su uso comercial, aunque conviene revisar la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (Gated DeltaNet + attention hibrida) |
| Parametros totales | ~27B segun model card; 12.253.617.664 segun safetensors del repo |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SLQ mixta: 4-bit (~45%), 5-bit (~45%), 6-bit (~8%), 8-bit (~2%); affine, group_size=64; media 4,50 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX packed (`mlx-packed-affine`), safetensors; requiere `mlx-lm` |
| Capas | 64 |
| Hidden size | 2048 |
| Tamano empaquetado | ~27,5 GiB (BF16 base ~51 GiB, factor ~1,85x) |
| Libreria | mlx-lm |
| Calibracion | FineWeb-Edu, 131.072 tokens (128x1024) |

Nota: existe una discrepancia entre los ~27B declarados en la model card y los 12.253.617.664 parametros reflejados en los safetensors del repo. Se reproduce tal cual; conviene verificarlo antes de dimensionar hardware.

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `qwen3_5`, que combina capas Gated DeltaNet (una forma de attention lineal/estado recurrente) con capas de attention clasica en un esquema hibrido. Tiene 64 capas y un hidden size de 2048. El nombre del modelo base sugiere un pipeline de entrenamiento por fases: SFT, seguido de RLOO (optimizacion por preferencias con refuerzo leave-one-out), MTP (multi-token prediction) y DFlash, ademas de un modo de razonamiento "EfficientThink". No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros de RL.

La capa que anade esta publicacion es la cuantizacion. El pipeline slq-mlx ejecuta una etapa 1 por bloques con multiples anchos de bits, mantiene una base de datos de error en streaming, aplica una asignacion heuristica de bits por capa y exporta el resultado empaquetado para MLX usando `nn.QuantizedLinear`. El checkpoint permanece empaquetado tanto en disco como en memoria, evitando la descompresion a BF16 en tiempo de carga. La calibracion se hizo con FineWeb-Edu (131.072 tokens) y el asignador es voraz por capa. La asignacion exacta por capa se guarda en `config.json` bajo la clave `slq_bits`.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Generacion de codigo y tareas de programacion, dado el sufijo "Coder390" del modelo base.
- Razonamiento con modo "thinking" eficiente (EfficientThink) segun nomenclatura del modelo base.
- Prediccion multi-token (MTP) integrada en el entrenamiento del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el entrenamiento con RLOO y MTP es compatible con estos flujos, pero no se documenta.
- Capacidades multilingues: no disponible (el campo de idiomas no esta declarado).
- Vision o audio: no disponible (el pipeline es solo texto).

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: cargar el modelo con `mlx-lm` y usarlo como copiloto en el editor o en la terminal, aprovechando que el checkpoint empaquetado ocupa ~27,5 GiB y cabe en equipos con 32-64 GB de memoria unificada.
- Generacion y refactorizacion de codigo en pipelines de desarrollo: el modelo base esta afinado para tareas de programacion, por lo que puede emplearse para completar funciones, generar tests o traducir entre lenguajes dentro de un flujo controlado por scripts.
- Razonamiento asistido con modo thinking: util para depuracion de errores complejos o explicacion paso a paso de algoritmos, donde el modo EfficientThink del modelo base prioriza cadenas de razonamiento mas cortas.
- Prototipado de aplicaciones de IA en Apple Silicon: sirve como banco de pruebas para desarrolladores que quieran validar prompts, plantillas de chat o flujos conversacionales antes de desplegar en infraestructura CUDA con otro formato de pesos.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden comparar la salida de este checkpoint SLQ 4,50 bpw con el BF16 base para estudiar el impacto de la cuantizacion mixta en tareas especificas.
- Procesamiento de documentos y texto en local con privacidad: al ejecutarse integramente en el dispositivo, es adecuado para resumir o analizar codigo propietario o documentacion sensible sin enviar datos a la nube.
- Educacion y experimentation: como modelo MIT, puede usarse en cursos o talleres para demostrar inferencia local de modelos de ~27B en hardware de consumo.

## Benchmarks y rendimiento

Los unicos datos publicados son de fidelidad de la cuantizacion frente al BF16, con 400 ejemplos por tarea (subconjunto reducido de los sets completos, ~15.500 ejemplos/tarea).

| Tarea | BF16 | SLQ 4,50 bpw | Recuperacion | IC 95% |
|---|---|---|---|---|
| arc_challenge | 0,5675 | 0,5650 | 0,9956 | [0,9845, 1,0067] |
| arc_easy | 0,8225 | 0,8125 | 0,9878 | [0,9730, 1,0027] |
| hellaswag | 0,5475 | 0,5550 | 1,0137 | [1,0027, 1,0247] |
| winogrande | 0,5600 | 0,5600 | 1,0000 | [0,9804, 1,0196] |
| mmlu | 0,5400 | 0,5500 | 1,0185 | [1,0070, 1,0300] |
| **Media** | — | — | **1,0031** | — |

Veredicto del autor: *task-lossless* (umbral >= 0,99). No se han publicado resultados de benchmarks absolutos del modelo base (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria para inferencia: el checkpoint empaquetado ocupa ~27,5 GiB; se recomienda un equipo con al menos 32 GB de memoria unificada y, para margen de contexto y cache KV, 48-64 GB.
- GPU: exclusivamente Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max o Ultra). El formato `mlx-packed-affine` no es compatible con CUDA ni con GPUs NVIDIA (A100, H100, RTX 4090).
- Cabe en consumer: si, en Mac con 32 GB o mas de memoria unificada; en Mac de 16 GB no cabe el checkpoint completo.
- Despliegue: `mlx-lm` (libreria oficial); no es compatible con vLLM, TGI, llama.cpp ni Ollama en su formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Este modelo (SLQ 4,50 bpw) | ~27B (card) / 12,25B (safetensors) | no disponible | MLX packed | MIT | Apple Silicon |
| Modelo base BF16 (nerkyor/...) | ~27B | no disponible | safetensors BF16 | no disponible | CUDA / Apple |
| Cuantizacion 4-bit uniforme tipica del mismo base | ~27B | no disponible | GGUF / MLX | segun autor | Apple / CPU |

No se dispone de datos de benchmarks absolutos ni de otros modelos comparables con contexto y rendimiento verificables en la informacion proporcionada; la comparativa se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- Dependencia exclusiva de MLX y Apple Silicon: no puede ejecutarse en GPUs NVIDIA ni en servidores x86 con CUDA, lo que limita su uso en produccion convencional.
- Discrepancia de parametros: la model card declara ~27B pero los safetensors suman 12.253.617.664 parametros; conviene verificar el tamano real antes de dimensionar memoria.
- Evaluacion de fidelidad limitada: los benchmarks usan solo 400 ejemplos por tarea, no los sets completos (~15.500), por lo que los intervalos de confianza son amplios y la conclusion "lossless" debe tomarse con cautela.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos: no documentados por el autor; al ser un fine-tune sobre Qwen3.5, hereda los sesgos del modelo base y de los datos de entrenamiento, que no se detallan.
- Idiomas: no declarados; no hay garantia de calidad multilingue fuera del ingles.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- Licencia: el checkpoint es MIT, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales; revisar antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria, usar con precaucion en entornos criticos.
- El nombre del modelo base incluye referencias a otros modelos (Opus, GPT, Grok, DSV) que probablemente son etiquetas de estilo de datos de entrenamiento, no componentes reales; no debe interpretarse como un ensemble.

## Enlaces

- HuggingFace: https://huggingface.co/hermitdave/Qwen3.8-27B-Coder390-MLX-slq-4.5bpw
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Herramienta de cuantizacion slq-mlx: https://github.com/hermitdave/slq-mlx
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
