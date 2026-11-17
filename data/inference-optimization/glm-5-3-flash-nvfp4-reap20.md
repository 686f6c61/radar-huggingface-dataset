# inference-optimization/GLM-5.3-Flash-NVFP4-REAP20

## Resumen

GLM-5.3-Flash-NVFP4-REAP20 es una variante optimizada para inferencia del modelo multimodal GLM-5.3-Flash de Z.ai (zai-org), publicada por el usuario inference-optimization. Sobre el checkpoint ya cuantizado a NVFP4 de RedHatAI se aplica una poda estructural del 20 % de los expertos MoE mediante REAP (Router-weighted Expert Activation Pruning), reduciendo cada una de las 42 capas MoE de 288 a 230 expertos enrutados. El resultado conserva la cuantizacion FP4 de los expertos y deja intactos atencion, torre de vision, embeddings y expertos compartidos.

El modelo mantiene la pila completa de GLM-5.3-Flash: arquitectura transformer con mezcla de expertos, capacidad image-text-to-text y una capa MTP (multi-token prediction) en `layers.45` que no se modifica. Con 138.458.173.914 parametros totales almacenados en safetensors y un repositorio de 163,4 GB, esta pensado para servir en vLLM con pesos comprimidos mediante compressed-tensors.

Su relevancia es practica: reducir un 20 % de expertos por capa disminuye el coste de memoria y el trafico de pesos durante la decodificacion sin reentrenamiento, usando solo computacion forward sobre un corpus de calibracion multidisciplinar (RazorCal, 2.048 muestras). Es una pieza dirigida a equipos que ya despliegan GLM-5.3-Flash en FP4 y buscan recortar huella sin cambiar de familia de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal image-text-to-text, con capa MTP; clase `Glm5NextForConditionalGeneration` |
| Parametros totales | 138.458.173.914 (safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4/FP4 en expertos MoE; FP8 en los 288 expertos de `layers.45` (MTP); resto de pesos sin cuantizar en este checkpoint |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Capas MoE | 42 (capas 3-44 del backbone) |
| Expertos por capa | 230 de 288 originales (58 podados por capa; 9.660 de 12.096 retenidos) |
| Metodo de poda | REAP, puntuacion `S_j = mean(g_j * ||f_j||_2)` sobre activaciones |
| Corpus de calibracion | RazorCal, 2.048 muestras multidominio |
| Tamano del repositorio | 163,4 GB |

## Arquitectura y entrenamiento

El modelo parte de GLM-5.3-Flash (zai-org), un transformer con mezcla de expertos y torre de vision para entrada image-text-to-text. RedHatAI lo cuantizo a NVFP4 y esta variante aplica REAP sobre ese checkpoint: en cada una de las 42 capas MoE (capas 3 a 44) se eliminan los 58 expertos con menor saliencia segun la media ponderada por router de la norma L2 de las activaciones de salida, calculada solo en forward sobre los tokens enrutados a cada experto. No hay gradientes ni entrenamiento de recuperacion. Los routers y su `e_score_correction_bias` se recortan para coincidir con el nuevo conteo, `config.json` declara `n_routed_experts: 230` y los indices de experto se remapean de forma contigua.

La cuantizacion se mantiene identica a la del checkpoint fuente: expertos MoE en NVFP4 y `layers.45` (MTP) intacta con sus 288 expertos en FP8. Attencion, torre de vision, embeddings y expertos compartidos quedan sin tocar. La calibracion de la poda uso las 2.048 muestras de RazorCal, y los scripts de calibracion y poda estan publicados en el ejemplo de REAP de llm-compressor. No se documentan en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset original ni si hubo RLHF o DPO en GLM-5.3-Flash.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto mediante la torre de vision.
- Razonamiento multi-turno y conversacional, segun los tags `conversational` del repositorio.
- Mezcla de expertos con 230 expertos enrutados por capa y expertos compartidos preservados.
- Capa MTP (multi-token prediction) conservada en `layers.45`, util para decodificacion especulativa en el modelo fuente.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en vLLM con pesos compressed-tensors.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta imagenes y texto y puede atender conversaciones multi-turno; la poda del 20 % de expertos reduce el peso en memoria respecto al checkpoint NVFP4 original, lo que abarata el coste por instancia en vLLM.
- Asistente de documentacion tecnica con capturas: al ser image-text-to-text, permite responder preguntas sobre diagramas, interfaces o capturas adjuntas en un flujo conversacional en ingles o chino.
- Despliegue en clústeres con VRAM limitada: al recortar 9.660 de 12.096 expertos y mantener FP4, encaja mejor en nodos con presupuesto ajustado que la variante completa de 288 expertos por capa, a cambio de una perdida de calidad no cuantificada en la model card.
- Backend de agentes con vLLM: la integracion con compressed-tensors y `endpoints_compatible` permite exponerlo como endpoint OpenAI-compatible y encadenarlo en pipelines de agentes que necesiten vision y contexto conversacional.
- Investigacion sobre poda de MoE: sirve como referencia reproducible para estudiar el impacto de REAP al 20 % sobre un modelo multimodal cuantizado, con scripts publicados en llm-compressor.
- Evaluacion comparativa de cuantizacion: util para medir diferencias entre el checkpoint NVFP4 sin podar (RedHatAI/GLM-5.3-Flash-NVFP4) y esta variante podada en tareas de vision y texto en ingles y chino.
- Prototipado local en estaciones con varias GPU: el formato safetensors y la clase de transformers permiten cargarlo con `AutoProcessor` y `Glm5NextForConditionalGeneration` para pruebas sin infraestructura de serving dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 163,4 GB en safetensors, por lo que la carga completa en FP4 requiere al menos ese orden de magnitud de memoria agregada entre GPU y offload.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el despliegue realista apunta a nodos multi-GPU de clase datacenter (A100/H100/H200 o equivalentes), sin confirmacion del autor.
- GPU de consumo: no cabe en una unica GPU de consumo (RTX 4090, 24 GB) con los 163,4 GB de pesos; se requeriria offload o sharding multi-dispositivo, no documentado.
- Opciones de despliegue: vLLM con soporte compressed-tensors (tag `vllm`), transformers con `Glm5NextForConditionalGeneration`. llama.cpp, Ollama y TGI no aparecen mencionados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa MoE | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4-REAP20 (este) | 138.458.173.914 | 230 de 288 | NVFP4 + FP8 en MTP | no disponible | MIT | Poda REAP del 20 % sobre checkpoint NVFP4 |
| RedHatAI/GLM-5.3-Flash-NVFP4 | no disponible | 288 | NVFP4 | no disponible | no disponible | Checkpoint fuente, sin poda |
| zai-org/GLM-5.3-Flash | no disponible | 288 | original (sin cuantizar) | no disponible | no disponible | Modelo base de la familia |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La poda del 20 % de expertos no incluye entrenamiento de recuperacion; la model card no publica evaluacion del impacto en calidad, por lo que la degradacion en tareas concretas es desconocida.
- Solo se declaran idiomas en y zh; el rendimiento en castellano no esta documentado.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la model card; aplican los riesgos habituales de un modelo conversacional multimodal.
- La capa MTP (`layers.45`) conserva 288 expertos en FP8 y transformers la ignora al cargar; el comportamiento en serving debe validarse contra el checkpoint fuente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base GLM-5.3-Flash y del checkpoint RedHatAI, cuya licencia no se detalla en la informacion disponible.
- El despliegue exige soporte de compressed-tensors y NVFP4 en el stack de serving; versiones de vLLM o transformers sin ese soporte no cargaran los pesos correctamente.

## Enlaces

- [Hugging Face: inference-optimization/GLM-5.3-Flash-NVFP4-REAP20](https://huggingface.co/inference-optimization/GLM-5.3-Flash-NVFP4-REAP20)
- [Modelo base cuantizado: RedHatAI/GLM-5.3-Flash-NVFP4](https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4)
- [Modelo original: zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [Dataset de calibracion RazorCal](https://huggingface.co/datasets/inference-optimization/RazorCal)
- [Ejemplo de poda REAP en llm-compressor](https://github.com/vllm-project/llm-compressor/tree/main/examples/reap_expert_pruning)
- [Repositorio llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Licencia MIT](https://choosealicense.com/licenses/mit/)
