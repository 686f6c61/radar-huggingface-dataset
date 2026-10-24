# Danny-Dasilva/embeddinggemma-2-multimodal-typed-decision

## Resumen

EmbeddingGemma 2 · Multimodal Typed Decision es un ajuste fino del modelo de embeddings google/embeddinggemma-2 de Google DeepMind, publicado por el usuario Danny-Dasilva bajo licencia Apache 2.0. No es un modelo generativo: implementa una interfaz de decisión tipada en la que, dado un estado (texto estructurado o libre, opcionalmente acompañado de imágenes o vídeo) y un conjunto de preguntas tipadas, devuelve probabilidades calibradas para cada opción de cada pregunta en una única llamada, sin producir texto.

Las preguntas admiten tres tipos: `choice` (elegir una entre opciones nombradas), `noul` (sí/no) y `score` (niveles ordinales). Cada respuesta es una distribución de probabilidad sobre las opciones, de modo que el modelo funciona como clasificador, enrutador, etiquetador, verificador de políticas o selector de herramientas dentro de un pipeline. Sigue la interfaz de decisión tipada publicada en mrm8488/embeddinggemma-2-ft-typed-decision y añade entrada nativa de imagen y vídeo (la torre de visión de EmbeddingGemma 2 se conserva), un codificador conjunto de una sola pasada y una cabeza opcional de localización de objetos (*box*).

Su relevancia actual está en el nicho de las decisiones estructuradas de bajo coste: frente a un LLM generativo, sustituye la generación de texto por una pasada de encoder con salida probabilística, lo que simplifica el parseo y permite umbrales de confianza explícitos. El repositorio ocupa 3,7 GB, solo declara inglés y, en el momento de la consulta, acumula 83 descargas y 0 likes, por lo que se trata de un artefacto reciente con validación comunitaria escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de embeddings (EmbeddingGemma 2) con cabezas de decisión tipada; dos miembros ajustados por separado (conjunto y long-context) y un tercer encoder dedicado para la cabeza box; torre de visión y embeddings de tokens congelados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | No se declara una ventana única. El miembro conjunto procesa peticiones de texto cuyo estado renderizado no supera 2.048 tokens; por encima se usa el miembro long-context, que ventanea estados de más de 8.192 tokens con `long_text_mode="chunked"` |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga mediante el paquete incluido `gemma_decision`, no mediante `AutoModel`) |
| Tamano del repositorio | 3,7 GB |
| Pipeline declarado | zero-shot-classification |
| Entradas | Texto estructurado o libre, imágenes y vídeo (rutas locales de fichero) |
| Precision en GPU | bfloat16 en CUDA; float16 no soportado |
| Dependencias | torch>=2.11, transformers>=5.19, safetensors, pillow, av, huggingface_hub |

## Arquitectura y entrenamiento

El modelo se apoya en EmbeddingGemma 2 y está compuesto por dos miembros ajustados de forma independiente. En cada petición se ejecuta exactamente uno: el miembro conjunto lee a la vez el estado, las preguntas y las opciones, y se usa siempre que haya imagen o vídeo; el miembro long-context codifica por separado estado, pregunta y opciones y se activa en peticiones de texto cuyo estado renderizado excede los 2.048 tokens, umbral seleccionado sobre datos de desarrollo. La cabeza conjunta incorpora un refinador de cross-attention de dos capas sobre los spans de opciones y los tokens de estado, e incluye los criterios personalizados de sí/no dentro del texto de la opción. El modo de texto largo sin ajuste conjunto utiliza ventanas solapadas del estado y aplica max-pooling sobre los logits; con `long_text_mode="chunked"` el miembro long-context ventanea estados de más de 8.192 tokens.

Las preguntas de tipo box emplean un tercer encoder dedicado, de modo que las actualizaciones de los pesos de decisión no alteran sus predicciones. La torre de visión y los embeddings de tokens permanecen congelados, y existe una ruta alternativa `media_route="frozen"` que envía imagen y vídeo a una cabeza de medios con encoder congelado, descargando el modelo base google/embeddinggemma-2 fijado. El entrenamiento es multitarea sobre particiones *train* públicas de tareas de decisión heterogéneas: los conjuntos declarados cubren razonamiento (ai2_arc, mmlu, winogrande, hellaswag, anli), VQA y clasificación visual (A-OKVQA, cifar10), selección y uso de herramientas (ToolRet-Training-20w, When2Call, ToolACE, glaive-function-calling-v2, xlam-function-calling-60k), grounding visual (refcoco, refcocoplus, refcocog) y un conjunto propio de decisiones tipadas (LocalLLaMA/typed-decisions). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta de la mezcla ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Clasificación zero-shot con salida probabilística: devuelve `probabilities` por cada opción de cada pregunta tipada, no texto libre.
- Preguntas de tipo `choice` (selección entre opciones nombradas), `noul` (sí/no con criterio personalizable en el texto de la opción) y `score` (escala ordinal).
- Decisión multitarea en una sola llamada: varias preguntas con tipos distintos se responden simultáneamente sobre el mismo estado.
- Entrada multimodal nativa: imágenes y vídeo entran en la misma pasada del codificador conjunto, lo que habilita clasificación de imagen y de vídeo sin pipeline separado.
- Localización de objetos: cabeza box opcional que sitúa en la imagen el objetivo de una pregunta (RefCOCO testB Acc@0.5 85,3%; ImageJevBench Box Acc@0.5 78,7%).
- Selección de herramientas y function calling: el modelo está entrenado con conjuntos de tool use y puede puntuar opciones de herramientas como paso previo a una llamada real.
- Enrutamiento y verificación de políticas: útil para decidir categoría, dificultad, peligrosidad o acción siguiente en flujos predefinidos.
- Manejo de estados largos en texto: ventaneo solapado con max-pooling de logits o modo `chunked` para estados de más de 8.192 tokens.
- Interfaz de línea de comandos (`python -m gemma_decision.cli predict`) para procesar ficheros JSONL por lotes.
- No dispone de generación de texto, razonamiento encadenado libre ni modo *thinking*.

## Casos de uso

- Enrutamiento de tickets de soporte: con el estado formado por el asunto y el cuerpo del ticket, se lanzan preguntas `choice` para categoría y cola de destino y una `noul` para decidir si requiere escalado humano; la salida probabilística permite fijar un umbral y derivar a revisión manual los casos de baja confianza.
- Selección de herramientas en un agente: dado el historial de la conversación como estado y el catálogo de funciones como criterios de una pregunta `choice`, el modelo puntúa qué herramienta invocar antes de ejecutar la llamada, con la ventaja de que la decisión es una única pasada de encoder y no requiere generar ni parsear JSON.
- Moderación y clasificación de contenido audiovisual: se pasa la ruta de un vídeo o imagen junto con preguntas `noul` y `score` para detectar actividad peligrosa o estimar gravedad, aprovechando que la torre de visión está integrada en la misma pasada.
- Etiquetado de datasets y curación de datos: procesamiento por lotes con la CLI sobre un JSONL de ejemplos, generando etiquetas con probabilidad asociada para priorizar la revisión humana de los casos dudosos.
- Verificación de políticas en facturación: el flujo de facturas obtiene un 21,78% de coincidencia exacta de acciones, suficiente para un sistema de propuesta con aprobación humana, pero no para automatización completa; se usaría como preclasificador que marca anomalías.
- Grounding visual en herramientas de anotación: la cabeza box localiza el objeto al que se refiere una pregunta sobre una imagen, útil para preanotar bounding boxes en pipelines de etiquetado.
- Clasificación de intención multilingüe dentro de un producto en inglés: aunque el modelo solo declara inglés, sirve como nodo de decisión en asistentes cuyo tráfico esté normalizado a inglés antes de la llamada.

## Benchmarks y rendimiento

Datos publicados en la model card. La columna "publicación previa" corresponde a las decisiones publicadas anteriormente según el autor.

| Evaluacion | Este release | Publicacion previa |
|---|---:|---:|
| Decision Index 0.2.1, suite nativa disponible | 24,45 | 20,00 |
| Precision en decisiones tipadas (2.000 decisiones) | 75,85% | 76,25% |
| Flujo de atencion al cliente, acciones exactas | 18,30% | 8,99% |
| Flujo de facturas, acciones exactas | 21,78% | 16,00% |
| RefCOCO testB, Acc@0.5 (cabeza box) | 85,3% | no disponible |
| ImageJevBench Box, Acc@0.5 (cabeza box) | 78,7% | no disponible |

La diferencia en precisión tipada respecto a la publicación previa no es estadísticamente significativa: el intervalo de confianza del 95% por bootstrap de registros emparejados va de −1,75 a +0,95 puntos porcentuales. Con la comparación preinscrita ajustada por Holm se observan diez mejoras significativas y una regresión significativa (ACOS, −0,93 puntos). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors suman 3,7 GB en el repositorio; en bfloat16 y con una sola familia de miembros residente se puede partir de unos 6-8 GB, pero el loader puede mantener varios miembros (conjunto, long-context y encoder de box) y no se documenta el pico real. Planificar 10-12 GB para margen. Es una estimación a partir del tamaño del repositorio, no un dato publicado.
- Precisión obligatoria: bfloat16 en CUDA; float16 no debe usarse según la model card. No se documenta ejecución en CPU ni en cuantización de 8 o 4 bits.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cualquier GPU con 12 GB o más (RTX 4070/4080/4090, L4, A10) debería alojar los pesos en bf16; A100/H100 solo resultan necesarias para lotes grandes o para mantener todos los miembros cargados a la vez.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 12-16 GB, siempre que se cargue un subconjunto de miembros; sin cifras verificadas de memoria pico.
- Opciones de despliegue: el paquete incluido `gemma_decision` con PyTorch, más la CLI `python -m gemma_decision.cli predict`. No se documenta integración con vLLM, TGI, llama.cpp ni Ollama, ni existencia de pesos GGUF, por lo que esos runners no son una vía soportada.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el diseño de una sola pasada del codificador conjunto evita la decodificación autorregresiva, de modo que el coste por decisión es el de un forward de encoder más la ventana de vídeo o imagen cuando aplique.
- Almacenamiento: 3,7 GB de pesos; la ruta `media_route="frozen"` descarga además el modelo base google/embeddinggemma-2 fijado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Danny-Dasilva/embeddinggemma-2-multimodal-typed-decision | no disponible | 2.048 tokens en modo conjunto; ventaneo >8.192 en long-context | Decision Index 0.2.1: 24,45; precision tipada 75,85%; RefCOCO testB Acc@0.5 85,3% | Apache 2.0 | HuggingFace, 83 descargas, 0 likes |
| mrm8488/embeddinggemma-2-ft-typed-decision | no disponible | no disponible en la informacion proporcionada | Referencia de la interfaz; la model card lo sitúa como "publicación previa" con Decision Index 20,00 y precision tipada 76,25% | no disponible | HuggingFace |
| google/embeddinggemma-2 | no disponible | no disponible en la informacion proporcionada | Modelo base de embeddings, sin cabezas de decisión tipada ni cabeza box | no disponible | HuggingFace |

La comparación cuantitativa con modelos de clasificación zero-shot de propósito general (por ejemplo, clasificadores NLI o modelos de embeddings con prototipos) no está disponible en la información proporcionada: el autor solo reporta comparaciones contra su propia línea de publicaciones previas.

## Limitaciones y advertencias

- Solo declara inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- No es un modelo generativo: no produce texto, resúmenes ni explicaciones, únicamente distribuciones de probabilidad sobre opciones predefinidas.
- La coincidencia exacta de acciones en flujos completos es baja (18,30% en atención al cliente, 21,78% en facturas); el propio autor señala que sigue siendo insuficiente para automatización sin supervisión.
- Regresión significativa documentada en ACOS (−0,93 puntos) respecto a la publicación previa.
- Riesgo de calibración: al devolver probabilidades, un umbral mal elegido produce falsos positivos silenciosos; conviene validar la calibración sobre datos propios antes de producción. La model card menciona caveats de calibración para la cabeza box, aunque el detalle queda fuera del extracto disponible.
- No se documentan sesgos demográficos, lingüísticos ni de dominio; los conjuntos de entrenamiento incluyen MMLU, ARC, ANLI y datos de tool calling, con los sesgos heredados de esas fuentes.
- Restricciones de licencia: la model card declara Apache 2.0, pero al derivar de un modelo de Google conviene verificar los términos aplicables al modelo base google/embeddinggemma-2 antes de un uso comercial.
- Carga no estándar: el modelo no se instancia con `AutoModel`; requiere insertar el directorio del repositorio en `sys.path` y usar `gemma_decision.typed.load_typed_model`, lo que complica su integración en servidores de inferencia convencionales.
- Requiere versiones muy recientes de dependencias (torch>=2.11, transformers>=5.19) y no admite float16, lo que limita entornos heredados.
- Adopción muy baja (83 descargas, 0 likes) y ausencia de resultados de benchmarks estándar, lo que reduce la validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Danny-Dasilva/embeddinggemma-2-multimodal-typed-decision
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Interfaz de decisión tipada de referencia: https://huggingface.co/mrm8488/embeddinggemma-2-ft-typed-decision
- Paper referenciado en los metadatos (arXiv:2509.20354): https://arxiv.org/abs/2509.20354
- Dataset de decisiones tipadas: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Datasets de entrenamiento declarados: https://huggingface.co/datasets/allenai/ai2_arc, https://huggingface.co/datasets/cais/mmlu, https://huggingface.co/datasets/allenai/winogrande, https://huggingface.co/datasets/Rowan/hellaswag, https://huggingface.co/datasets/facebook/anli, https://huggingface.co/datasets/HuggingFaceM4/A-OKVQA, https://huggingface.co/datasets/uoft-cs/cifar10
- Datasets de tool use: https://huggingface.co/datasets/mangopy/ToolRet-Training-20w, https://huggingface.co/datasets/nvidia/When2Call, https://huggingface.co/datasets/Team-ACE/ToolACE, https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2, https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Datasets de grounding visual: https://huggingface.co/datasets/jxu124/refcoco, https://huggingface.co/datasets/jxu124/refcocoplus, https://huggingface.co/datasets/jxu124/refcocog
- Repositorio de código, blog o demo: no disponible (la búsqueda web no devolvió resultados relacionados con el modelo).
