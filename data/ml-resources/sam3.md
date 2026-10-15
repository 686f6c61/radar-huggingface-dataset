# ml-resources/sam3

## Resumen

SAM 3 (Segment Anything Model 3) es un modelo fundacional unificado para segmentacion promptable en imagenes y video, desarrollado por Meta (facebookresearch). A diferencia de su predecesor SAM 2, SAM 3 incorpora segmentacion exhaustiva de conceptos de vocabulario abierto: dado un prompt de texto corto o ejemplos visuales, devuelve mascaras para todas las instancias del concepto en la imagen o el video, no solo para un objeto concreto.

El modelo resuelve la tarea de Promptable Concept Segmentation (PCS) combinando prompts de texto y prompts visuales (puntos, cajas y mascaras), y ademas puede detectar, segmentar y hacer tracking de objetos en secuencia de video. Segun la model card, alcanza entre el 75 % y el 80 % del rendimiento humano en el nuevo benchmark SA-CO, que contiene 270 000 conceptos unicos, mas de 50 veces los benchmarks previos.

La ficha que se analiza corresponde al repositorio `ml-resources/sam3`, un mirror no oficial de `facebook/sam3`. El modelo pesa 859 922 360 parametros (unos 860 M) segun los pesos en safetensors, ocupa 6,9 GB en el repositorio y esta integrado en la libreria `transformers` con el pipeline `mask-generation`. La licencia se mantiene como SAM License (`other`) y los prompts de texto estan documentados unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentacion promptable; la model card no detalla la arquitectura interna) |
| Parametros totales | 859 922 360 (~860 M), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de vision, no generativo de texto) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) para los prompts de texto |
| Licencia | other (SAM License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,9 GB |
| Libreria | transformers |
| Pipeline | mask-generation |
| Idiomas (campo HF) | en |

## Arquitectura y entrenamiento

La informacion disponible describe SAM 3 como un modelo fundacional unificado para segmentacion promptable en imagenes y video. Su capacidad diferencial es la Promptable Concept Segmentation (PCS): acepta prompts de texto y/o ejemplos de imagen y devuelve mascaras de todas las instancias que coinciden con el concepto, en lugar de limitarse a un unico objeto indicado con punto o caja. En el caso de video, incorpora deteccion, segmentacion y tracking a lo largo de los frames, gestionados mediante sesiones (`start_session`, `add_prompt`) con un `frame_index` de referencia.

No se detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos datos se consideran no disponibles. La innovacion tecnica publicitada es el salto en cobertura de vocabulario abierto: el benchmark SA-CO incluye 270 000 conceptos unicos, mas de 50 veces los benchmarks existentes, y el modelo alcanza entre el 75 % y el 80 % del rendimiento humano en dicha evaluacion. El codigo oficial se publica en el repositorio `facebookresearch/sam3`.

## Capacidades

- Segmentacion de imagenes con prompts de texto, devolviendo mascaras, cajas delimitadoras (formato xyxy en pixeles absolutos) y puntuaciones de confianza.
- Segmentacion con prompts visuales: puntos, cajas (positivas y negativas) y mascaras.
- Segmentacion exhaustiva de todas las instancias de un concepto de vocabulario abierto definido por una frase corta o por ejemplos.
- Deteccion de objetos dentro del flujo de segmentacion, con cajas y scores asociados.
- Tracking de objetos en video, con sesiones persistentes y prompts aplicables a indices de frame arbitrarios.
- Procesamiento de video desde carpeta de JPEG o archivo MP4.
- Compatibilidad con la libreria `transformers` (`Sam3Model`, `Sam3Processor`) y post-procesado de instancias (`post_process_instance_segmentation`).
- Etiquetado en HuggingFace como `feature-extraction`, lo que indica uso del backbone para extraccion de caracteristicas.
- Soporte de endpoints compatibles (tag `endpoints_compatible`).
- Idiomas: prompts de texto documentados unicamente en ingles.

## Casos de uso

- Rotoscopia y post-produccion de video: dado un prompt de texto como "persona" o "coche", el modelo genera mascaras por frame y mantiene el tracking, lo que reduce el trabajo manual de aislar sujetos en secuencias largas.
- Anotacion automatica de datasets de vision: genera mascaras y cajas para pre-etiquetar imagenes de entrenamiento, usando prompts de texto para cada clase y revisando despues las instancias de baja confianza.
- Segmentacion de vocabulario abierto en e-commerce: segmentar todas las instancias de un producto ("zapatilla", "bolso") en catalogos fotograficos sin reentrenar el modelo por categoria.
- Conteo y monitorizacion de objetos: al devolver todas las instancias de un concepto, permite contar elementos en imagenes aereas o de vigilancia (vehiculos, arboles, peatones) como paso previo al analisis.
- Edicion de imagen asistida: integrar la salida de mascaras en herramientas de retoque para sustituir fondos, aislar sujetos o aplicar efectos solo a las regiones segmentadas.
- Robotica y percepcion: usar prompts de texto para segmentar los objetos relevantes de una escena y alimentar modulos de manipulacion o navegacion con mascaras por instancia.
- Analisis de imagenes cientificas o de microscopia: segmentar estructuras definidas por un concepto textual (celulas, particulas) para su posterior cuantificacion, siempre que el termino exista en el vocabulario aprendido.
- Moderacion y analisis de contenido en video: aplicar prompts de texto sobre flujos de video para localizar y seguir elementos concretos a lo largo del tiempo.

## Benchmarks y rendimiento

La model card solo reporta resultados sobre el benchmark SA-CO y comparaciones relativas. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, dado que SAM 3 no es un modelo de lenguaje.

| Benchmark | Resultado | Notas |
|---|---|---|
| SA-CO | 75-80 % del rendimiento humano | Benchmark propio con 270 000 conceptos unicos, mas de 50 veces los benchmarks previos |

No se han publicado en la informacion disponible tablas numericas detalladas (IoU, AP, etc.) por subconjunto de SA-CO ni comparativas cuantitativas frente a SAM 2.

## Requisitos de hardware

- Pesos del modelo: ~860 M de parametros. Estimacion de VRAM solo para pesos: ~3,4 GB en fp32, ~1,7 GB en fp16/bf16, ~0,9 GB en int8. Hay que sumar activaciones y memoria extra para procesar frames de video.
- Cabe en GPU de consumo: con fp16, una GPU de 8 GB deberia ser suficiente para imagen; para video conviene disponer de 12-24 GB (RTX 3060 12 GB, RTX 4070/4080, RTX 4090) por el coste de mantener el estado de la sesion y los frames.
- GPU profesionales recomendadas para despliegue con video o por lotes: A100, H100, L40S.
- Opciones de despliegue: `transformers` (Sam3Model + Sam3Processor), libreria y repositorio oficial `facebookresearch/sam3`, y endpoints compatibles en HuggingFace.
- vLLM, llama.cpp, Ollama y TGI no aplican directamente, ya que son soluciones orientadas a modelos generativos de texto y SAM 3 es un modelo de segmentacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/idioma | Capacidad destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3 | ~860 M (safetensors) | Prompts en ingles | Segmentacion promptable de vocabulario abierto en imagen y video (PCS) | SAM License (`other`) | HuggingFace (`facebook/sam3`) y repo oficial |
| SAM 2 | no disponible | no disponible | Segmentacion y tracking en imagen/video, sin PCS de vocabulario abierto | no disponible | Repo `facebookresearch/sam2` |
| SAM (original) | no disponible | no disponible | Segmentacion promptable en imagen con puntos, cajas y mascaras | no disponible | Repo original de Meta |

La diferencia documentada frente a SAM 2 es la incorporacion de la segmentacion exhaustiva de conceptos de vocabulario abierto y una cobertura de conceptos muy superior. Los datos de parametros, contexto y licencia de SAM 2 y SAM no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos concretos; al ser un modelo entrenado con datos de imagen no especificados, puede heredar sesgos de representacion y rendir peor en conceptos poco frecuentes o culturalmente infrarrepresentados.
- Riesgo de alucinacion de mascaras: al segmentar conceptos de vocabulario abierto, puede devolver instancias incorrectas o fusionar objetos; conviene filtrar por umbral de score y `mask_threshold`.
- Idiomas: los prompts de texto estan documentados unicamente en ingles (`en`), por lo que el uso en castellano u otros idiomas puede degradar los resultados.
- No se han publicado en la informacion disponible detalles sobre el dataset de entrenamiento, el numero de tokens ni tecnicas de alineacion, lo que limita la evaluacion de sesgos.
- Licencia: se trata de "SAM License" (`other`), distinta de una licencia de codigo abierto permisiva. Es imprescindible revisar los terminos antes de cualquier uso comercial.
- El repositorio analizado (`ml-resources/sam3`) es un mirror no oficial de `facebook/sam3`; la model card indica explicitamente que no es una release oficial. Para produccion es preferible referenciar el repositorio original.
- Coste computacional en video: el tracking a lo largo de frames consume memoria proporcional a la longitud y resolucion de la secuencia.
- Riesgo de deriva (drift) en tracking de video cuando el objeto se ocluye o cambia de apariencia.
- Tipos de cuantizacion y despliegue en formatos alternativos: no documentados, lo que puede complicar la integracion en stacks que dependan de GGUF u ONNX.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/ml-resources/sam3
- Modelo original: https://huggingface.co/facebook/sam3
- Repositorio de codigo oficial: https://github.com/facebookresearch/sam3
- Repositorio de SAM 2 (predecesor): https://github.com/facebookresearch/sam2
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/akhaliq/sam3
- Benchmark SA-CO: https://github.com/facebookresearch/sam3#sa-co-dataset
- Pagina de Wikipedia sobre "ML" (resultado de busqueda no relacionado con el modelo): https://en.wikipedia.org/wiki/ML
