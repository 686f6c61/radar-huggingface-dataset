# McGill-NLP/Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher

## Resumen

Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher es un ajuste fino supervisado (SFT) del modelo base NVIDIA-NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16, desarrollado por el grupo McGill-NLP. Se trata del modelo "profesor" sin comprimir que sirve de referencia en el informe EchoMoE: el modelo del que se destila el estudiante Nemotron-3.5-Lightning-30B-A3B y contra el que se comparan sus puntuaciones. Su proposito no es tanto el uso como producto final, sino servir de referencia reproducible para la investigacion sobre compresion de activaciones en paralelismo de expertos.

La arquitectura es la del modelo base: un transformer hibrido con 52 capas que combinan Mamba-2, atencion y capas MoE, con 128 expertos enrutados (6 activos) mas 1 experto compartido y un tamano oculto de 2.688. El modelo totaliza 31.577.940.288 parametros (aproximadamente 31,6 mil millones), de los cuales solo una fraccion se activa por token dada la naturaleza MoE del diseno. Se evalua a una longitud de contexto de 32.768 tokens en precision bf16.

Su relevancia es doble: por un lado, documenta el punto de partida de una linea de investigacion sobre eficiencia en inferencia distribuida; por otro, ofrece un checkpoint conversacional en ingles listo para cargarse con vLLM o transformers, con un promedio de 62,8 sobre los 18 benchmarks del informe. La licencia OpenMDW 1.1 heredada del modelo base condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Mamba-2, atencion y MoE (familia nemotron_h); 52 capas |
| Parametros totales | 31.577.940.288 (aprox. 31,6 mil millones) |
| Parametros activos | 128 expertos enrutados con 6 activos + 1 experto compartido por token; tamano oculto 2.688 |
| Longitud de contexto | 32.768 tokens (evaluado a esa longitud) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW License 1.1 (hereda la del modelo base NVIDIA) |
| Formato de pesos | safetensors (bf16), cargable con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte del checkpoint NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16, un transformer hibrido de 52 capas que intercala capas Mamba-2 (modelos de espacio de estados), capas de atencion y capas de mezcla de expertos. El componente MoE emplea 128 expertos enrutados con 6 activos por token mas 1 experto compartido, con un tamano oculto de 2.688. Esta combinacion busca reducir el coste computacional por token manteniendo una capacidad total de parametros elevada.

El ajuste fino se realizo mediante supervisacion (SFT) sobre el dataset allenai/Dolci-Instruct-SFT, con dos epocas sobre secuencias empaquetadas de 8.192 tokens y una tasa de aprendizaje de 2e-5. No se documenta en la informacion disponible el uso de RLHF o DPO. El modelo se evalua en bf16 a 32.768 tokens con vLLM 0.21; la arquitectura es la propia del modelo base, por lo que vLLM y transformers lo cargan sin necesidad del paquete EchoMoE. Cabe senalar que, sin los kernels mamba-ssm instalados, transformers 5.8.1 ejecuta las capas Mamba-2 en PyTorch puro, lo que produce divergencias en las log-probabilidades respecto a vLLM (0,9 puntos menos en ARC-Challenge 5-shot para este modelo).

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat (`apply_chat_template`).
- Razonamiento y conocimiento general, con una puntuacion media de 71,6 en el bloque de conocimiento y razonamiento del informe.
- Matematicas, con una puntuacion media de 50,5 en el bloque de matematicas.
- Generacion de codigo, con una puntuacion media de 53,0 en el bloque de codigo.
- Seguimiento de instrucciones, con una puntuacion media de 55,0 en el bloque correspondiente.
- Capacidad de servir como modelo profesor de referencia para destilacion (rol principal en el informe EchoMoE).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Referencia de destilacion: el modelo actua como profesor sin comprimir del que se destila el estudiante Nemotron-3.5-Lightning-30B-A3B; se usa para generar log-probabilidades o respuestas de referencia en experimentos de compresion de activaciones.
- Reproduccion de resultados de investigacion: permite replicar las puntuaciones del informe EchoMoE con vLLM 0.21, sirviendo de linea base frente al estudiante destilado.
- Evaluacion comparativa de tecnicas de paralelismo de expertos: al ser un MoE de 128 expertos, es adecuado para medir el impacto del paralelismo de expertos (`--enable-expert-parallel`) en latencia y throughput.
- Generacion de texto conversacional en ingles: con temperatura 0,7, top_p 0,8 y top_k 20, puede emplearse en prototipos de chatbot de dominio general.
- Tareas de conocimiento y razonamiento en ingles: su mejor bloque de rendimiento (71,6) lo hace util para preguntas y respuestas de cultura general y razonamiento basico en entornos de evaluacion.
- Experimentos de inferencia hibrida Mamba-2/atencion: sirve para estudiar el comportamiento de las capas de espacio de estados en comparacion con transformers puros, incluyendo las diferencias entre kernels mamba-ssm y PyTorch puro.
- Generacion de codigo asistida en ingles: con una puntuacion de 53,0 en el bloque de codigo, puede emplearse en tareas de autocompletado o generacion de fragmentos en entornos controlados.

## Benchmarks y rendimiento

El informe proporciona la media sobre 18 benchmarks agrupada por dominio. No se detallan los benchmarks individuales en la informacion disponible.

| Dominio | Puntuacion (%) |
|---|---|
| Conocimiento y razonamiento | 71,6 |
| Matematicas | 50,5 |
| Codigo | 53,0 |
| Seguimiento de instrucciones | 55,0 |
| **Media (18 benchmarks)** | **62,8** |

Nota: en ARC-Challenge (5-shot) con transformers 5.8.1 sin kernels mamba-ssm, el modelo obtiene 0,9 puntos menos que con vLLM.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos bf16 caben en una unica GPU de 80 GB (A100 80 GB, H100 80 GB), segun la model card.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 en una sola tarjeta; configuraciones multi-GPU con paralelismo de datos y de expertos para produccion.
- Despliegue en consumer GPU: no disponible en la informacion proporcionada; con 31,6 mil millones de parametros totales en bf16 (63,2 GB de repo) no cabe en GPUs de consumo de 24 GB sin cuantizacion, y no se documentan pesos cuantizados.
- Opciones de despliegue: vLLM 0.21 (recomendado para reproducir resultados) y transformers 5.8.1. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El comando de servicio sugerido usa `--data-parallel-size 8 --enable-expert-parallel --max-model-len 32768`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media 18 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher (este) | 31,6 mil millones (MoE) | 32.768 | 62,8 | OpenMDW 1.1 | Hugging Face (McGill-NLP) |
| Nemotron-3.5-Lightning-30B-A3B (estudiante EchoMoE) | 31,6 mil millones (MoE) | no disponible | no disponible en la informacion | OpenMDW 1.1 (heredada) | Coleccion EchoMoE en Hugging Face |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16 | 31,6 mil millones (MoE) | no disponible | no disponible (modelo base, sin SFT) | OpenMDW 1.1 | Hugging Face (nvidia) |

La comparativa se limita a los modelos de la propia familia EchoMoE/Nemotron documentados en la informacion disponible; no se dispone de datos de benchmarks de los modelos base ni del estudiante para contrastar.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Alucinacion: no se documentan evaluaciones especificas de veracidad ni tasas de alucinacion; como modelo de 31,6 mil millones con SFT, es susceptible de generar contenido incorrecto con aparente fluidez.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Reproducibilidad: con transformers sin kernels mamba-ssm, las log-probabilidades divergen de vLLM; para reproducir las cifras reportadas es necesario usar vLLM 0.21.
- Licencia: OpenMDW 1.1 es una licencia "other" que conserva el aviso de copyright de NVIDIA; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- Proposito: es un checkpoint de investigacion pensado como profesor de destilacion, no un modelo afinado para produccion; su adopcion como modelo final no esta respaldada por la documentacion.
- Contexto: la longitud de contexto evaluada es de 32.768 tokens; no se documenta comportamiento mas alla de esa ventana.
- Capacidades ausentes: no se documenta soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Cuantizacion: no se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de menor VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/Nemotron-3.5-Lightning-30B-A3B-SFT-EchoMoE-teacher
- Paper (arXiv:2611.22215): https://arxiv.org/abs/2611.22215
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
