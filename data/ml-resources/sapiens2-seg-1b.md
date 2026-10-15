# ml-resources/sapiens2-seg-1b

## Resumen

Sapiens2-seg-1b es un modelo de segmentacion densa por pixel orientado a imagenes de personas, desarrollado por Meta y publicado a traves del repositorio `facebook/sapiens2-seg-1b`. La ficha que se analiza aqui es un espejo no oficial alojado en `ml-resources/sapiens2-seg-1b`, con la licencia y el contenido originales sin modificar. El modelo resuelve una tarea concreta de vision por computador: asignar a cada pixel de la imagen una de 29 clases de partes del cuerpo (28 partes mas fondo), lo que lo situa en el ambito de la segmentacion semantica human-centric.

Tecnicamente es un Vision Transformer (ViT) de 1.462 mil millones de parametros en el backbone, con 1536 dimensiones de embedding, 40 capas, 24 cabezas de atencion y patch size de 16. Se trata de un fine-tuning supervisado del backbone preentrenado `facebook/sapiens2-pretrain-1b` al que se anade una cabeza de segmentacion de partes del cuerpo, alcanzando 1.470.819.821 parametros totales medidos en safetensors (la diferencia respecto al backbone corresponde a la cabeza de tarea). La resolucion de inferencia declarada es de 1024 x 768 (alto x ancho) y el coste computacional del backbone es de 4.715 TFLOPs por pasada.

Su relevancia actual radica en que forma parte de la segunda generacion de la familia Sapiens, que escala de 0,4B a 5B de parametros con variantes de contexto extendido (1B-4K). Al estar liberado bajo la Sapiens2 License, permite a equipos de investigacion y producto evaluar segmentacion corporal de alta resolucion sin entrenar desde cero, aunque con restricciones de licencia que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT backbone + cabeza de segmentacion de partes del cuerpo |
| Parametros totales | 1.470.819.821 (1,47 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision; resolucion de inferencia 1024 x 768, patch size 16) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint en safetensors; no hay GGUF ni versiones cuantizadas oficiales) |
| Idiomas soportados | no disponible / no aplicable (modelo de segmentacion de imagen, sin procesamiento de lenguaje) |
| Licencia | Sapiens2 License (identificador `sapiens2-license`, `license: other`) |
| Formato de pesos | safetensors (`sapiens2_1b_seg.safetensors`) |
| Dimension de embedding | 1536 |
| Numero de capas | 40 |
| Cabezas de atencion | 24 |
| FLOPs del backbone | 4,715 T |
| Clases de salida | 29 (28 partes del cuerpo + fondo) |
| Tamano del repositorio | 5,9 GB |
| Modelo base | facebook/sapiens2-pretrain-1b |
| Libreria | sapiens2 |
| Pipeline | image-segmentation |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de Vision Transformer pura sobre parches de 16 x 16 pixeles, con un backbone de 1.462 B de parametros, 40 capas, 1536 dimensiones de embedding y 24 cabezas de atencion. Sobre ese backbone se monta una cabeza de segmentacion densa que produce, para cada pixel de la imagen de entrada a 1024 x 768, una prediccion sobre 29 clases (28 partes del cuerpo mas la clase de fondo). El checkpoint se obtiene por fine-tuning del backbone preentrenado `facebook/sapiens2-pretrain-1b`, de modo que la receta completa es preentrenamiento a gran escala seguido de ajuste especifico para la tarea `seg`.

No se dispone, en la informacion proporcionada, de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens o imagenes vistas, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones concretas de atencion (atencion lineal, decodificacion especulativa u otras) mas alla de la configuracion estandar del ViT descrita en la model card. La unica referencia tecnica disponible es el articulo arXiv:2604.21681 y la documentacion del repositorio oficial, que no se han podido consultar en detalle con la informacion suministrada.

## Capacidades

- Segmentacion densa por pixel de partes del cuerpo humano, con 29 clases de salida (28 partes anatomicas mas fondo).
- Procesamiento de imagenes a resolucion de inferencia de 1024 x 768 (alto x ancho), adecuada para detalle fino en cuerpo completo o planos medios.
- Extraccion de caracteristicas visuales de alta calidad gracias al backbone preentrenado de 1.462 B de parametros, reutilizable como base para otras tareas densas de vision human-centric.
- Prediccion de mascaras semanticas compatibles con pipelines de `image-segmentation` en el ecosistema Transformers.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas: es un modelo exclusivamente visual.
- No soporta tool calling ni function calling.
- No esta disenado para flujos de agente ni razonamiento multi-paso.
- No tiene capacidades multilingues por tratarse de un modelo de vision sin modulo de lenguaje.
- No incluye modo thinking, entrada de audio ni prediccion de keypoints o profundidad en este checkpoint concreto (la familia incluye otros checkpoints para tareas adicionales).

## Casos de uso

- Segmentacion de partes del cuerpo para analisis biomecanico: el modelo etiqueta pixel a pixel brazos, piernas, torso y cabeza en imagenes a 1024 x 768, lo que permite calcular angulos articulares y areas de regiones corporales en estudios de movimiento o rehabilitacion.
- Moda virtual y prueba de ropa (virtual try-on): generar mascaras precisas de cada parte del cuerpo facilita el ajuste de prendas sinteticas sobre la silueta real del usuario, evitando artefactos en bordes de brazos y piernas.
- Edicion de imagen y retoque profesional: las mascaras de 29 clases permiten aplicar ajustes de color, desenfoque o sustitucion de fondo de forma selectiva por region anatomica (por ejemplo, retocar solo la piel de brazos y cara).
- Datos sinteticos y aumentacion para entrenamiento: usar las mascaras como pseudoetiquetas para preanotar grandes volumenes de imagenes humanas antes de una revision manual, reduciendo el coste de anotacion en proyectos de vision.
- Analitica deportiva y de fitness: en combinacion con secuencias de video, permite medir cobertura de equipamiento, postura o simetria corporal, extrayendo metricas por region a partir de las mascaras por fotograma.
- Investigacion en vision human-centric: servir como baseline reproducible de segmentacion corporal a escala 1B para comparar con las variantes 0,4B, 0,8B y 5B de la misma familia en terminos de precision frente a coste.
- Preprocesado en pipelines de realidad aumentada: generar mascaras de cuerpo en tiempo de inferencia para anclar efectos o filtros a regiones concretas del usuario en aplicaciones moviles o de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de mIoU, pixel accuracy ni comparaciones cuantitativas con otras variantes de la familia. Tampoco se proporcionan cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 5,9 GB en FP32 (coincide con el tamano del repositorio) y en torno a 2,9 GB en FP16/BF16. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- No hay versiones cuantizadas oficiales (GGUF, AWQ, GPTQ) en la informacion disponible, por lo que no se pueden dar cifras de VRAM para 8, 4 o 2 bits.
- La memoria de activaciones a 1024 x 768 con patch size 16 implica 3072 tokens visuales por imagen, 1536 dimensiones y 40 capas; el pico de memoria durante la inferencia superara el de los pesos, especialmente con lotes mayores de uno. No se dispone de cifras medidas.
- GPU recomendadas: por tamano, el modelo cabe en GPUs de consumo con 12 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) en FP16 con lote pequeno. Para procesamiento por lotes o entrenamiento de fine-tuning se recomiendan A100 (40/80 GB), H100 o L40S.
- Es probable que quepa en GPUs de consumo siempre que se trabaje en FP16 y con lote 1 a la resolucion nativa; no hay confirmacion oficial de este extremo.
- Opciones de despliegue: la ruta oficial es instalar el repositorio `github.com/facebookresearch/sapiens2` (`pip install -e .`) y ejecutar los scripts de demo (`./scripts/demo/seg.sh`). Los servidores orientados a LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este modelo en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas | Contexto / resolucion | Licencia |
|---|---|---|---|---|---|---|---|
| Sapiens2-0.4B (seg) | 0,398 B | 1,260 T | 1024 | 24 | 16 | 1024 x 768 | Sapiens2 License |
| Sapiens2-0.8B (seg) | 0,818 B | 2,592 T | 1280 | 32 | 16 | 1024 x 768 | Sapiens2 License |
| **Sapiens2-1B (seg)** | 1,462 B (backbone) | 4,715 T | 1536 | 40 | 24 | 1024 x 768 | Sapiens2 License |
| Sapiens2-1B-4K | 1,607 B | no disponible | 1536 | 40 | 24 | contexto extendido (4K) | Sapiens2 License |
| Sapiens2-5B (seg) | 5,071 B | 15,722 T | 2432 | 56 | 32 | 1024 x 768 | Sapiens2 License |

Las cinco variantes comparten licencia, framework y tarea, de modo que la eleccion depende del equilibrio entre precision y coste computacional. No se dispone de datos de rendimiento comparado (mIoU u otras metricas) que permitan afirmar cuanto mejora la variante 1B sobre la 0.8B o cuanto se acerca a la 5B. Como alternativas fuera de la familia Sapiens no se ha identificado ningun modelo comparable en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion disponible no documenta sesgos demograficos, pero al ser un modelo human-centric entrenado sobre un dataset no descrito, es plausible un rendimiento desigual en funcion del tono de piel, constitucion corporal, vestimenta, oclusiones o condiciones de iluminacion. No hay datos para cuantificarlo.
- Riesgo de error de segmentacion en imagenes con oclusiones severas, cuerpos parcialmente fuera del encuadre, multitud de personas solapadas o escenas de baja resolucion frente a los 1024 x 768 esperados.
- La resolucion de inferencia declarada es fija (1024 x 768); no se documenta comportamiento con otras relaciones de aspecto ni con imagenes de resolucion muy distinta.
- Al ser un modelo estrictamente visual no hay consideraciones de idioma, pero tampoco capacidad de generar explicaciones textuales de sus predicciones.
- Restricciones de licencia: se distribuye bajo la Sapiens2 License, que no es una licencia de codigo abierto estandar. Es imprescindible revisar el texto completo en `github.com/facebookresearch/sapiens2/blob/main/LICENSE.md` antes de cualquier uso comercial, ya que el campo `license: other` implica condiciones especificas que pueden limitar el despliegue en producto.
- El repositorio analizado (`ml-resources/sapiens2-seg-1b`) es un espejo no oficial con 0 descargas y 0 likes en el momento de la consulta; para uso en produccion conviene referenciar el repositorio oficial `facebook/sapiens2-seg-1b`.
- No existe soporte oficial de cuantizacion ni de servidores de inferencia de alto rendimiento, lo que complica el despliegue a gran escala.
- Las afirmaciones sobre requisitos de hardware de esta ficha se basan en el recuento de parametros y no en mediciones publicadas por el autor.

## Enlaces

- Modelo (espejo): https://huggingface.co/ml-resources/sapiens2-seg-1b
- Modelo original: https://huggingface.co/facebook/sapiens2-seg-1b
- Modelo base de preentrenamiento: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-seg-0.4b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-seg-0.8b
- Variante 5B: https://huggingface.co/facebook/sapiens2-seg-5b
- Variante 1B-4K: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo: https://github.com/facebookresearch/sapiens2
- Guia de segmentacion de partes del cuerpo: https://github.com/facebookresearch/sapiens2/blob/main/docs/SEG.md
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
