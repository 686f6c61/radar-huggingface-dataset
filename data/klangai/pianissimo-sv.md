# KlangAI/pianissimo-sv

## Resumen

Pianissimo es un modelo de reconocimiento automatico del habla (ASR) especializado en sueco, desarrollado por Klang AI. Se trata de un fine-tune de NVIDIA Parakeet TDT 0.6B v3, un modelo de 600 millones de parametros basado en la arquitectura FastConformer con decodificacion TDT (Token-and-Duration Transducer). El modelo parte de un checkpoint multilingue ya entrenado y se ajusta especificamente para sueco, lo que permite obtener una precision muy superior a la del modelo base en ese idioma.

La relevancia de Pianissimo radica en su combinacion de precision y velocidad: alcanza un 4.46% de WER en el conjunto de test de Common Voice sueco y un 6.51% en FLEURS sueco, lo que supone reducciones de error del 76% y 57% respectivamente frente a Parakeet v3. Ademas, puede transcribir una hora de audio en un segundo sobre una GPU H100, lo que lo situa en el rango de modelos de produccion de alta eficiencia.

El modelo se distribuye bajo licencia CC BY 4.0, lo que permite uso comercial con atribucion, y cuenta con versiones cuantizadas en ONNX (int8, int4, fp16, fp32) para CPU y en MLX para Apple Silicon, ampliando enormemente las opciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT (Token-and-Duration Transducer) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta clips cortos y grabaciones largas; memoria crece con la longitud y el batch) |
| Tipos de cuantizacion | fp32, fp16, int8, int4 (ONNX); bf16, fp32, 8-bit, 4-bit (MLX) |
| Idiomas soportados | sueco (sv) |
| Licencia | CC BY 4.0 |
| Formato de pesos | NeMo (.nemo, PyTorch); ONNX; MLX |
| Tamano del repo | 2.5 GB |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Frecuencia de muestreo | 16 kHz mono |
| Timestamps | A nivel de palabra y de segmento |
| Vocabulario personalizado | Si, mediante phrase boosting (boosting_tree) |

## Arquitectura y entrenamiento

Pianissimo emplea la arquitectura FastConformer, una variante eficiente del Conformer que reduce el coste computacional mediante subsampling de la secuencia de entrada, combinada con un decodificador TDT (Token-and-Duration Transducer). El decodificador TDT predice conjuntamente tokens y duraciones, lo que permite un alineamiento mas eficiente que los transducers clasicos y habilita la generacion de timestamps a nivel de palabra de forma nativa.

El modelo es un fine-tune del checkpoint multilingue nvidia/parakeet-tdt-0.6b-v3 sobre datos de habla en sueco. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en ASR). La evaluacion reportada incluye los conjuntos Common Voice sueco, FLEURS sueco y un conjunto propio denominado Klang Dialects, lo que sugiere que el ajuste se realizo con datos que cubren variacion dialectal. El modelo soporta ademas phrase boosting mediante un arbol de boosting en la decodificacion greedy, con parametros configurables como `context_score`, `depth_scaling` y `boosting_tree_alpha`.

## Capacidades

- Transcripcion de voz a texto en sueco con puntuacion y capitalizacion automaticas.
- Generacion de timestamps a nivel de palabra y de segmento.
- Procesamiento de clips cortos y grabaciones largas (con batch_size=1 para audio largo).
- Vocabulario personalizado mediante phrase boosting para mejorar la ortografia de nombres propios y terminos tecnicos (sensible a mayusculas).
- Transcripcion por lotes (batch) con ajuste de tamano de batch segun la GPU.
- Ejecucion en CPU mediante ONNX (int8, int4, fp16, fp32) y en GPU Apple Silicon mediante MLX.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No soporta vision ni audio mas alla de la transcripcion de habla.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar grabaciones largas con batch_size=1 y generar timestamps por palabra, lo que facilita la creacion de actas con marcas temporales y la busqueda dentro del audio transcrito.
- Subtitulado automatico de video en sueco: los timestamps a nivel de palabra permiten alinear subtitulos con precision, y la puntuacion automatica reduce el post-procesado necesario en pipelines de subtitulado.
- Atencion al cliente y analitica de llamadas: la alta velocidad (hasta 2.000x en throughput masivo segun la model card) permite transcribir grandes volumenes de grabaciones telefonicas en sueco para analisis de calidad, deteccion de temas y compliance.
- Dictado y productividad: con las versiones ONNX int8 (660 MB) o MLX 8-bit (759 MB) puede ejecutarse localmente en portatiles, habilitando dictado offline con baja latencia y sin enviar audio a la nube.
- Investigacion linguistica y sociolinguistica: el conjunto Klang Dialects y la capacidad de phrase boosting permiten estudiar variacion dialectal y transcribir corpus con terminologia especializada.
- Accesibilidad: generacion de transcripciones en tiempo real o diferido para contenido audiovisual en sueco, con soporte para vocabulario personalizado que mejora la legibilidad de nombres propios.
- Integracion en pipelines de datos: la version ONNX se ejecuta en cualquier CPU (Windows, Linux, Mac, Intel, AMD, ARM) mediante onnx-asr, lo que facilita el despliegue en entornos sin GPU.

## Benchmarks y rendimiento

Resultados de WER (%) en habla sueca; menor es mejor. Evaluados por Klang con el mismo procedimiento de scoring.

| Modelo | CV test | FLEURS test | Klang Dialects | Throughput masivo |
|---|---:|---:|---:|---:|
| Pianissimo (fp32) | 4.46 | 6.51 | 4.85 | 2.000x (H100, segun model card) |
| Parakeet v3 (base) | no disponible en la informacion (reduccion del 76% en CV y 57% en FLEURS frente a Pianissimo) | no disponible | no disponible | no disponible |

Rendimiento de las versiones cuantizadas (WER y velocidad RTFx sobre clip de 30 s):

| Version | Ejecucion | Descarga | CV test | FLEURS test | Klang Dialects | Velocidad |
|---|---|---:|---:|---:|---:|---:|
| Original fp32 | PyTorch/NeMo | 2.51 GB | 4.46 | 6.51 | 4.85 | no disponible |
| ONNX int8 | Cualquier CPU | 660 MB | 4.65 | 6.62 | 4.93 | 35x (Intel), 74x (Mac) |
| ONNX int4 | Cualquier CPU | 515 MB | 4.63 | 6.58 | 5.06 | 12x (Intel), 37x (Mac) |
| ONNX fp16 | Cualquier CPU | 1.28 GB | 4.47 | 6.48 | 4.89 | 18x (Intel), 55x (Mac) |
| ONNX fp32 | Cualquier CPU | 2.56 GB | 4.46 | 6.48 | 4.89 | 18x (Intel), 55x (Mac) |
| MLX 8-bit | Apple Silicon | 759 MB | 4.51 | 6.45 | 4.83 | 151x |
| MLX 4-bit | Apple Silicon | 528 MB | 4.66 | 6.53 | 5.20 | 126x |
| MLX bf16 | Apple Silicon | 1.25 GB | 4.45 | 6.43 | 4.85 | 140x |
| MLX fp32 | Apple Silicon | 2.51 GB | 4.46 | 6.49 | 4.90 | 173x |

Velocidad medida como RTFx sobre un clip de 30 s. ONNX con 4 hilos en Intel Xeon Platinum 8481C y 6 hilos en Apple M5 Pro; MLX en GPU Apple M5 Pro.

Resultados de phrase boosting (135 clips FLEURS con nombres mal escritos + 100 clips sin nombres):

| `boosting_tree_alpha` | Nombres correctos | WER clips con nombres | WER otros clips | Nombres insertados erroneamente |
|---:|---:|---:|---:|---:|
| 0 (off) | 39% | 13.17 | 4.27 | 0 |
| 0.25 | 48% | 11.87 | 4.32 | 0 |
| 0.5 | 53% | 11.26 | 4.32 | 0 |
| 1.0 | 64% | 10.10 | 4.37 | 0 |
| 2.0 | 71% | 10.54 | 5.04 | 4 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2.5 GB de pesos; el consumo real crece con la longitud del audio y el tamano de batch. Con batch_size=1 para grabaciones largas el consumo es moderado.
- GPU recomendadas: NVIDIA H100 para maximo throughput (1 hora de audio en 1 segundo); cualquier GPU NVIDIA con suficiente VRAM para las versiones NeMo/PyTorch.
- Consumer GPU: si, cabe en GPUs de consumo con 4-8 GB de VRAM en fp32, y en menos con cuantizacion. Las versiones ONNX int8 (660 MB) e int4 (515 MB) se ejecutan en CPU sin GPU.
- Apple Silicon: versiones MLX (8-bit 759 MB, 4-bit 528 MB) que se ejecutan en la GPU de Macs con chip Apple.
- Opciones de despliegue: NeMo Toolkit (`nemo_toolkit[asr]`) con PyTorch; ONNX Runtime mediante `onnx-asr` (`pip install onnx-asr[cpu,hub]`); MLX en macOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo ASR).
- Latencia y throughput: RTFx de 35x-74x en CPU (ONNX int8), 126x-173x en Apple M5 Pro (MLX) y hasta 2.000x en H100 para throughput masivo, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER CV sueco | WER FLEURS sueco | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Pianissimo | 0.6B | no disponible | 4.46 | 6.51 | CC BY 4.0 | Hugging Face (NeMo, ONNX, MLX) |
| Parakeet TDT 0.6B v3 | 0.6B | no disponible | no disponible (referencia base; Pianissimo reduce error 76%) | no disponible (reduccion 57%) | no disponible en la informacion | Hugging Face (NVIDIA) |
| Otros ASR suecos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no incluye una comparativa directa con otros modelos ASR suecos (por ejemplo, Whisper fine-tuneado para sueco o VoxRex). Solo se dispone de la comparacion con el modelo base Parakeet v3 en terminos de reduccion relativa de error.

## Limitaciones y advertencias

- El modelo solo soporta sueco; no es multilingue.
- Al ser un modelo ASR, puede producir errores en habla con ruido, acentos muy marcados o jerga no vista en entrenamiento; la model card no detalla sesgos especificos.
- El phrase boosting es sensible a mayusculas y puede insertar nombres erroneamente con valores altos de `boosting_tree_alpha` (4 inserciones erroneas con alpha=2.0 en la evaluacion reportada).
- La memoria crece con la longitud de la grabacion y el batch; para audio largo se recomienda batch_size=1.
- Licencia CC BY 4.0: permite uso comercial con atribucion; es necesario citar a Klang AI y mantener el aviso de licencia.
- No se detallan en la model card los datos de entrenamiento ni posibles sesgos dialectales o demograficos; el conjunto Klang Dialects sugiere cobertura dialectal pero sin metricas desagregadas.
- Requiere audio de 16 kHz mono; otras frecuencias o canales requieren preprocesado.
- No soporta tool calling, agentes ni razonamiento; su unico proposito es la transcripcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KlangAI/pianissimo-sv
- Pagina de release y demo: https://klang.ai/pianissimo/
- Modelo base NVIDIA Parakeet v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Version ONNX: https://huggingface.co/KlangAI/pianissimo-sv-onnx
- Version MLX 8-bit: https://huggingface.co/KlangAI/pianissimo-sv-mlx-8bit
- Version MLX 4-bit: https://huggingface.co/KlangAI/pianissimo-sv-mlx-4bit
- Version MLX bf16: https://huggingface.co/KlangAI/pianissimo-sv-mlx
- Version MLX fp32: https://huggingface.co/KlangAI/pianissimo-sv-mlx-fp32
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
