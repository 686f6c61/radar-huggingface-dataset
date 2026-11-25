# MonkeyMagic100/localboy-sam3.1-int8

## Resumen

Localboy SAM 3.1 INT8 es una conversión no oficial del checkpoint SAM 3.1 de Meta, empaquetada por el usuario MonkeyMagic100 bajo el identificador `localboy-sam3.1-int8`. Se trata de una cuantización mixta INT8/FP16 de los pesos originales en FP16 distribuidos por Comfy-Org, orientada específicamente a la integración de SAM 3.1 en la aplicación Localboy sobre Apple Silicon. No es un modelo de lenguaje generativo, sino un modelo de segmentación de imágenes y vídeo con capacidad de prompts por texto, clic y pintura.

El modelo conserva la arquitectura completa de SAM 3.1 Multiplex: incluye el detector, el codificador de texto y el tracker temporal de vídeo, con una resolución interna de 1008x1008 píxeles. La conversión aplica cuantización simétrica por fila de salida a 487 matrices de pesos (INT8 con escala FP32 por fila), mientras que otros 1.103 tensores permanecen en FP16. El resultado es un fichero de 957.880.192 bytes, un 45,12% más pequeño que el original de 1.745.546.848 bytes.

Su relevancia es limitada y muy específica: reduce el espacio en disco y facilita el despliegue en Apple Silicon dentro del ecosistema Localboy, pero requiere un cargador propietario (`localboy-sam-q8-v1`) que no es compatible con ComfyUI estándar ni con los loaders de Meta. Es un artefacto experimental, con cero descargas y cero likes en el momento de la consulta, y sin validación más allá de pruebas iniciales en un Apple M5 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3.1 Multiplex (detector + codificador de texto + tracker temporal de vídeo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa vídeo por frames; validado con clips de 48 frames) |
| Tipos de cuantizacion | Mixta INT8/FP16: 487 matrices en INT8 simétrico por fila con escala FP32; 1.103 tensores en FP16 |
| Idiomas soportados | no disponible (el codificador de texto depende del modelo base SAM 3.1) |
| Licencia | SAM License (`sam-license`, categoría `other`) |
| Formato de pesos | safetensors con formato propietario `localboy-sam-q8-v1` |
| Resolucion interna | 1008x1008 |
| Tamano del fichero | 957.880.192 bytes (frente a 1.745.546.848 bytes en FP16) |
| SHA256 | abd739893274423df88f9421b65970824df2d2f2d37a0d815e3a129da900c69d |
| Modelo base | Comfy-Org/sam3, revision 7bb8374780a725b4353ed31f3a9395c9742b5621, checkpoint sam3.1_multiplex_fp16.safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es SAM 3.1 Multiplex, la variante de segmentación de Meta que combina un detector de objetos, un codificador de texto para prompts en lenguaje natural y un tracker temporal para vídeo. La resolución interna de trabajo es de 1008x1008 píxeles, y el tracker mantiene historial temporal entre frames, por lo que el modelo puede segmentar objetos a lo largo de un clip. Esta conversión no modifica la arquitectura ni reentrena pesos: se limita a comprimir un subconjunto de matrices.

La cuantización aplicada es simétrica con signo, INT8 por fila de salida, sobre 487 matrices de pesos. Cada matriz cuantizada incluye una entrada adicional `<original-key>.localboy_scale` en FP32 que actúa como escala por fila; la reconstrucción numérica se define como `q.float() * scale[:, None]`. Los 1.103 tensores restantes se conservan exactamente en FP16 desde el checkpoint fuente. No hay información sobre el dataset de entrenamiento original de SAM 3.1 en la documentación proporcionada, ni sobre procesos de RLHF, DPO o ajuste fino adicionales. La innovación técnica de esta ficha es exclusivamente la cuantización y el enrutado experimental de atención grande con kernels Metal personalizados, que según el autor también cuantiza a INT8 determinadas activaciones de visión.

## Capacidades

- Segmentación de imágenes con prompts por texto, clic y pintura (según la model card, los prompts de clic/pintura no han sido validados en esta conversión).
- Segmentación y seguimiento de objetos en vídeo con historial temporal entre frames.
- Detección de objetos (el checkpoint incluye el detector).
- Codificación de texto para prompts en lenguaje natural (el checkpoint incluye el codificador de texto).
- Procesamiento de clips de vídeo; el autor validó casos de 48 frames.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta soporte multilingüe explícito.
- No dispone de modo thinking, audio ni otras capacidades generativas.

## Casos de uso

- Segmentación interactiva en aplicaciones de edición sobre macOS: la integración con Localboy permite seleccionar objetos con clic o pintura en un editor nativo de Apple Silicon, aprovechando la reducción de tamaño del 45,12% para acortar tiempos de carga en disco.
- Rotoscopia y seguimiento de personas en vídeo: el tracker Multiplex mantiene la identidad del objeto entre frames; el autor validó dos casos de selección de personas con una IoU media del 99,96-99,97% frente a la implementación FP16 de referencia.
- Preprocesado para pipelines de visión por computador: generar máscaras de segmentación antes de tareas de detección, clasificación o edición, con un modelo que cabe en 1 GB de almacenamiento.
- Edición de vídeo asistida en local: seleccionar caras o personas para aplicar efectos o recortes, aprovechando las pruebas del autor sobre selección de caras (IoU del 99,65%).
- Prototipado en Apple Silicon: desarrolladores que quieran experimentar con SAM 3.1 en un Mac sin descargar el checkpoint FP16 completo, aceptando la dependencia del cargador propietario.
- Investigación sobre cuantización de modelos de segmentación: el formato `localboy-sam-q8-v1` y el script de reconstrucción descrito permiten inspeccionar el impacto numérico de la cuantización INT8 por fila en un modelo de visión.
- No es adecuado para despliegues en servidores Linux con ComfyUI estándar, ya que requiere el loader específico de Localboy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta mediciones internas de validación:

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo de selección (3 casos, 48 frames, 2 clips) | 20,09-20,24 s | Apple M5 Pro, enrutado de atención grande experimental y kernels Metal personalizados |
| Tiempo de referencia | 63,74-66,43 s | Runtime actual (FP16) en el mismo hardware |
| IoU media de máscara umbralizada (cara) | 99,65% | Frente a implementación FP16 actual |
| IoU media de máscara umbralizada (persona 1) | 99,96-99,97% | Frente a implementación FP16 actual |
| IoU media de máscara umbralizada (persona 2) | 99,96-99,97% | Frente a implementación FP16 actual |
| Reducción de tamano | 787.666.656 bytes (45,12%) | Frente al fichero FP16 de 1.745.546.848 bytes |

El propio autor advierte que estas son mediciones limitadas de concordancia, no de precisión frente a ground truth, y que la mayor parte de la mejora de velocidad proviene del enrutado fusionado de atención, no de la cuantización INT8, que principalmente reduce almacenamiento.

## Requisitos de hardware

- Almacenamiento: 957.880.192 bytes (aproximadamente 0,96 GB) para el fichero de pesos; se recomienda espacio adicional para el runtime y los frames de vídeo.
- VRAM/RAM: no disponible de forma explícita. El autor solo valida en Apple M5 Pro con memoria unificada; no se especifica el consumo de memoria durante la inferencia.
- GPU recomendadas: Apple Silicon (validado en M5 Pro). No hay validación documentada en A100, H100, RTX 4090 ni otras GPU NVIDIA o AMD.
- Cabe en GPU de consumo: no confirmado. El tamaño del fichero sugiere que cabría en GPUs con 8 GB o más, pero la falta de un loader estándar impide confirmarlo.
- Opciones de despliegue: exclusivamente el runtime de Localboy con soporte explícito para `localboy-sam-q8-v1` (Python, PyTorch y Metal). No es compatible con vLLM, llama.cpp, Ollama, TGI ni ComfyUI estándar.
- Latencia y throughput: 20,09-20,24 s para tres casos de selección de 48 frames en Apple M5 Pro con el enrutado experimental; 63,74-66,43 s con el runtime actual. No hay datos de throughput por frame ni de latencia en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Cuantizacion | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| localboy-sam3.1-int8 | no disponible | 1008x1008, tracker temporal | INT8/FP16 mixta | SAM License | Solo Localboy (loader propietario) |
| Comfy-Org/sam3 (FP16) | no disponible | 1008x1008, tracker temporal | FP16 | SAM License | ComfyUI, loaders estándar |
| SAM 3.1 oficial de Meta | no disponible | 1008x1008, tracker temporal | FP16 (original) | SAM License | Ecosistema Meta y ComfyUI |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks ni de especificaciones de parámetros de alternativas como SAM 2 u otros segmentadores en la información proporcionada. La diferencia principal frente al checkpoint FP16 de Comfy-Org es el tamaño (45,12% menor) y la incompatibilidad con loaders estándar.

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de Meta ni un checkpoint estándar de ComfyUI; el autor lo etiqueta como experimental.
- Requiere el cargador propietario `localboy-sam-q8-v1`; un loader estándar de ComfyUI o Meta no puede consumir el fichero directamente.
- Las versiones antiguas de la app Localboy que usan el nombre de fichero FP16 no cargarán este modelo automáticamente.
- Validación muy limitada: solo tres casos de selección de 48 frames en dos clips, en un Apple M5 Pro. No se han validado otros chips, clips largos, múltiples objetos, prompts de clic/pintura ni la salida completa de vídeo editado.
- Las métricas de IoU reportadas son medidas de concordancia con la implementación FP16, no precisión frente a ground truth.
- La mejora de velocidad se atribuye principalmente al enrutado fusionado de atención, no a la cuantización INT8; no debe interpretarse como una garantía general de rendimiento.
- Licencia SAM License: impone condiciones de redistribución y uso; es responsabilidad del usuario revisar el fichero LICENSE antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de segmentación, el riesgo principal es de máscaras incorrectas en objetos no representados en el entrenamiento original.
- Sin datos de idiomas soportados ni de comportamiento multilingüe del codificador de texto.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.
- El repositorio no proporciona un runtime SAM sin Python; la integración depende de Python, PyTorch y Metal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MonkeyMagic100/localboy-sam3.1-int8
- Modelo base Comfy-Org/sam3: https://huggingface.co/Comfy-Org/sam3/tree/7bb8374780a725b4353ed31f3a9395c9742b5621
- Licencia SAM (referenciada en el repo): LICENSE dentro del repositorio del modelo
- Manifiesto de integridad: manifest.json dentro del repositorio del modelo
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
