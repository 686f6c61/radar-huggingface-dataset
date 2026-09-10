# ananthu-aniraj/ifam-metashift-k2

## Resumen

iFAM (metashift-k2) es un checkpoint de clasificación de imágenes publicado por Ananthu Aniraj (con Cassio F. Dantas, Dino Ienco y Diego Marcos como coautores) que implementa el marco iFAM (*Inherently Faithful Attention Maps for Vision Transformers*), descrito en el artículo "Two-stage Vision Transformers and Hard Masking offer Robust Object Representations", aceptado como presentación oral en ICPR 2026. El modelo se distribuye con licencia Apache 2.0 y ocupa 0,7 GB en el repositorio, con 171.465.989 parámetros en formato safetensors.

El problema que aborda es la dependencia de correlaciones espurias del fondo: en lugar de clasificar la imagen completa, iFAM separa el proceso en dos etapas. La primera (Selector) localiza las partes del objeto y las regiones relevantes para la tarea; la segunda (Predictor) restringe su campo receptivo a esas regiones mediante enmascarado duro de la atención, de modo que los detalles del fondo no pueden influir en la decisión final.

Este checkpoint concreto está entrenado sobre Metashift con K=2 partes, es decir, con una configuración de dos componentes de objeto. Su relevancia es fundamentalmente investigadora: ofrece un punto de partida reproducible para estudiar robustez ante cambios de contexto y para comparar arquitecturas de dos etapas frente a clasificadores de una sola pasada. No es un modelo de propósito general ni un modelo de lenguaje: es un clasificador de imágenes de tipo investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión en dos etapas (Selector + Predictor) con enmascarado duro de atención; etiquetado como DINOv2 en el repositorio |
| Parametros totales | 171.465.989 |
| Longitud de contexto | No aplica (modelo de visión; la entrada documentada es una imagen de 224x224 px) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No disponible (no aplica a clasificación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cargables con PyTorch |
| Pipeline | image-classification |
| Tamano del repositorio | 0,7 GB |
| Dataset de entrenamiento | Metashift, con K=2 partes |
| Libreria declarada | generic |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión de dos etapas. La etapa 1 (Selector) procesa la imagen completa para descubrir partes de objeto e identificar las regiones relevantes para la tarea; la etapa 2 (Predictor) limita su campo receptivo a las regiones seleccionadas mediante enmascarado de atención sobre la entrada. Este enmascarado duro impide que el clasificador final utilice información del fondo, que es precisamente el mecanismo por el que aparecen los atajos contextuales en datasets con correlaciones espurias.

El repositorio etiqueta el modelo con `dinov2`, `dynamic-masking`, `modular-ai` y `robust-representation`, lo que indica que el backbone procede de la familia DINOv2 y que el enmascarado es dinámico y modular. El número de parámetros (algo más de 171 millones) es coherente con dos backbones de escala ViT-B, uno por etapa, aunque la model card no detalla la configuración exacta de capas, dimensiones ni resolución de parches.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de "Metashift con K=2 partes", ni si se emplearon técnicas de ajuste como RLHF o DPO (no aplicables habitualmente a clasificación de imágenes). La innovación técnica destacable es el enmascarado duro de atención entre etapas, que actúa como mecanismo de fidelidad de la representación.

## Capacidades

- Clasificación de imágenes: es la tarea principal del modelo, con salida de clase para una imagen RGB de 224x224 px.
- Representaciones robustas ante cambios de contexto: el enmascarado de la segunda etapa evita que el fondo determine la predicción.
- Localización implícita de partes de objeto: la etapa Selector identifica regiones de la imagen relevantes para la tarea, con K=2 partes en esta configuración.
- Enmascarado dinámico: la selección de regiones se calcula por imagen, no es una máscara fija predefinida.
- Uso modular: al estar implementado como dos submodelos acoplados, las etapas pueden analizarse o reutilizarse por separado en investigación.
- Sin soporte de tool calling ni function calling: no es un modelo de lenguaje.
- Sin capacidades de agente, razonamiento multi-paso ni generación de texto.
- Sin capacidades multilingües ni de audio: la entrada es exclusivamente visual.

## Casos de uso

- Investigación sobre atajos contextuales: el checkpoint sirve como línea base reproducible para medir cuánto depende un clasificador del fondo. Se evaluaría sobre Metashift y variantes con el mismo protocolo del artículo, comparando la etapa 2 enmascarada frente a un clasificador de una sola pasada.
- Clasificación industrial con fondo variable: en una línea de producción donde la misma pieza aparece sobre cintas, bandejas o iluminaciones distintas, el enmascarado de la segunda etapa reduce la probabilidad de que el clasificador aprenda a discriminar por el entorno en lugar de por el objeto.
- Detección de defectos con correlaciones espurias: si en el conjunto de entrenamiento los defectos solo aparecen en un tipo de soporte o bandeja, un clasificador estándar aprende el soporte; iFAM fuerza la decisión sobre la región del objeto, lo que ayuda a generalizar a soportes no vistos.
- Ajuste fino sobre dominios propios: al ser un checkpoint preentrenado con licencia Apache 2.0, puede servir de inicialización para reentrenar el par Selector/Predictor con K adaptado a un dataset propio, siempre que se replique el pipeline del repositorio `ifam`.
- Generación de máscaras de atención para otros pipelines: la salida de la etapa Selector puede emplearse como mapa de regiones relevantes para tareas auxiliares de recorte, anotación asistida o filtrado previo a un detector.
- Control de calidad de datasets: ejecutando el modelo sobre un corpus de imágenes se pueden identificar ejemplos donde la predicción cambia drásticamente entre la versión enmascarada y la no enmascarada, lo que señala posibles imágenes con atajos de contexto que conviene revisar.
- Segunda opinión en un ensemble de visión: dado su bajo coste de inferencia (171 M de parámetros), puede actuar como clasificador auxiliar cuya discrepancia con un modelo principal indique casos en los que el modelo principal se está apoyando en el fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de precisión, y la búsqueda web realizada no devolvió resultados relevantes sobre el modelo ni sobre el artículo (los resultados obtenidos correspondían a un sitio educativo sin relación con el tema).

## Requisitos de hardware

- Huella de pesos: 171.465.989 parámetros, equivalentes a unos 686 MB en fp32, 343 MB en fp16/bf16 y 172 MB en int8. El repositorio completo ocupa 0,7 GB.
- VRAM estimada para inferencia: por debajo de 2 GB en fp32 y alrededor de 1 GB en fp16 para lote 1 a 224x224 px, incluyendo activaciones de las dos etapas. Es una estimación derivada del tamaño de parámetros, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o superior lo ejecutan con holgura. Para entrenamiento o ajuste fino conviene una GPU de 16 GB o más (RTX 4090, A100, H100 según el tamaño de lote).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual y en muchas integradas; también es viable la inferencia en CPU, dado el tamaño reducido del modelo.
- Opciones de despliegue: PyTorch con el repositorio `ifam` clonado, cargando la clase `FullTwoStageModelDoubleClassify` mediante `from_pretrained`. No hay soporte de vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo de texto. No se documenta exportación a ONNX o TorchScript; cualquier exportación requeriría adaptar el enmascarado de atención entre etapas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación se limita a modelos de clasificación de imágenes con backbone transformer, ya que no hay datos de rendimiento publicados para iFAM en la información disponible.

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iFAM (metashift-k2) | 171,5 M | Imagen 224x224 px | Dos etapas con enmascarado duro de atención | Apache 2.0 | HuggingFace, requiere repo `ifam` |
| DINOv2 (ViT-B/14) | Aprox. 86 M | Imagen 224x224 px (parche 14) | ViT auto-supervisado, una etapa | Apache 2.0 | HuggingFace, `transformers` |
| CLIP (ViT-B/32) | Aprox. 88 M en el codificador de imagen (151 M en total con el de texto) | Imagen + texto | Contraste imagen-texto, una etapa | MIT, según su model card | HuggingFace, `transformers` |

No se dispone de cifras comparativas de precisión, robustez ante cambios de contexto ni coste de inferencia para ninguno de los tres modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al estar entrenado sobre Metashift con K=2, el modelo hereda los sesgos y la distribución de ese dataset, orientado a estudiar cambios de contexto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea cuando la etapa Selector identifica regiones irrelevantes; un enmascarado incorrecto elimina información útil y degrada la predicción.
- Especialización: es un checkpoint entrenado para una configuración concreta (Metashift, K=2). No debe esperarse un rendimiento de propósito general fuera de ese dominio sin reentrenamiento o ajuste fino.
- Dependencia de código externo: la carga requiere clonar el repositorio `ifam` y ajustar `sys.path`; no se integra directamente con `transformers` ni con `pipeline()`.
- Madurez y soporte: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, y la librería declarada es `generic`, lo que indica un artefacto de investigación sin garantías de mantenimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cite adecuadamente. No se especifican restricciones adicionales en la model card.
- Contexto e idioma: no aplica, al ser un modelo de visión; no procesa texto ni audio.
- Producción: antes de desplegarlo conviene validar el rendimiento en el dominio objetivo, medir la latencia real de las dos etapas y comprobar el comportamiento del enmascarado en imágenes con objetos pequeños, ocluidos o múltiples.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ananthu-aniraj/ifam-metashift-k2
- Articulo (arXiv): https://arxiv.org/abs/2506.08915
- Repositorio de codigo: https://github.com/ananthu-aniraj/ifam
- Cita del articulo: Aniraj, A., Dantas, C. F., Ienco, D., Marcos, D. "Two-stage Vision Transformers and Hard Masking offer Robust Object Representations", ICPR 2026.
- La busqueda web realizada no devolvio enlaces adicionales relevantes sobre este modelo.
