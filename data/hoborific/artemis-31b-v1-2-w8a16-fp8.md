# hoborific/Artemis-31B-v1.2-W8A16-FP8

## Resumen
Artemis-31B-v1.2-W8A16-FP8 es una version cuantizada del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario hoborific en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, capaz de procesar tanto imagenes como texto, con un total de 31.273.088.876 parametros (31,27 B) segun los pesos reales en safetensors. La cuantizacion aplicada es W8A16 en FP8: los pesos se almacenan en float8_e4m3fn y las activaciones se mantienen en bf16/fp16.

El modelo resuelve un problema practico de despliegue: reducir el espacio en disco y los requisitos de memoria del modelo base (que en bf16 ocuparia un tamano considerablemente mayor) manteniendo las activaciones en alta precision para preservar la calidad de salida. El repositorio ocupa 33,3 GB y los pesos estan empaquetados en el formato `float-quantized` de compressed-tensors, pensado para su carga directa en vLLM.

Su relevancia actual radica en que apunta especificamente a plataformas Intel XPU (kernel `XPUW8A16FP8LinearKernel`) y a NVIDIA CUDA (SM75 o superior), lo que lo convierte en una opcion de inferencia eficiente para infraestructuras con aceleradores Intel o GPUs NVIDIA modernas. La informacion publica no especifica la longitud de contexto, los idiomas soportados ni la licencia del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text); etiqueta de repositorio "gemma4"; detalle no disponible |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn, escalas simetricas por canal de salida, activaciones bf16/fp16); el modelo base en bf16 seria la alternativa sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato compressed-tensors, `float-quantized`) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base. Los metadatos del repositorio lo etiquetan como `gemma4` y con el pipeline `image-text-to-text`, lo que indica una arquitectura transformer multimodal con una torre de vision, pero no se especifica el numero de capas, la dimension oculta ni la ventana de contexto. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del dataset) ni si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base.

La innovacion tecnica documentada se refiere exclusivamente al proceso de cuantizacion. Para cada capa lineal, a cada fila de salida se le asigna su propia escala partiendo de `amax / 448`, refinada mediante una busqueda MSE de clipping sobre unas 9 fracciones (0,8-1,0× amax), seleccionando la escala de menor error por fila. Los pesos se cuantizan como `q = e4m3(w / scale)` con redondeo al mas cercano y saturacion. Solo se cuantizan los pesos de proyeccion lineal 2D (q/k/v/o de atencion y gate/up/down del MLP); los embeddings, las normalizaciones, la `lm_head`, los routers/expertos y la torre de vision permanecen en bf16 y figuran en la lista `ignore` del checkpoint, de modo que vLLM no los modifica.

## Capacidades
- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, orientada a dialogos multi-turno.
- Procesamiento de imagen a texto (image-text-to-text): puede recibir imagenes junto a texto como entrada, gracias a su torre de vision, que se mantiene en bf16.
- Compatibilidad con vLLM: esta disenado para cargarse mediante kernels especificos segun plataforma.
- Inferencia cuantizada de alta precision: las activaciones permanecen en bf16/fp16, lo que preserva la precision del calculo de atencion en esa fase.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible; el unico dato confirmado es la entrada multimodal imagen + texto.

## Casos de uso
- Inferencia sobre hardware Intel: es el escenario objetivo declarado del modelo, ya que aprovecha el kernel `XPUW8A16FP8LinearKernel` de vLLM para ejecutar pesos FP8 en aceleradores Intel.
- Despliegue de un modelo de 31 B en GPUs NVIDIA Turing o posteriores: mediante `HummingFP8ScaledMMLinearKernel` (si el paquete `humming` esta instalado) o `MarlinFP8ScaledMMLinearKernel`, permite servir el modelo sin necesidad de precision completa.
- Asistentes conversacionales multimodales: al aceptar imagen y texto, puede gestionar dialogos en los que el usuario adjunte una captura, un diagrama o una fotografia y espere una respuesta en texto.
- Descripcion y analisis de imagenes: el pipeline image-text-to-text permite generar descripciones de contenido visual para catalogacion, accesibilidad o moderacion.
- Reduccion de costes de almacenamiento en servidores de modelos: al ocupar 33,3 GB en disco frente a la version bf16 del modelo base, facilita el alojamiento de multiples variantes en la misma infraestructura.
- Serving eficiente con vLLM en produccion: al integrarse en el formato compressed-tensors `float-quantized`, se puede desplegar mediante el servidor de vLLM sin conversion adicional, siempre que la plataforma tenga kernel compatible.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad (SNR) frente al modelo base en bf16 dentro de un mismo pipeline.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: los pesos FP8 ocupan aproximadamente 31 GB (31,27 B parametros a 8 bits mas las capas no cuantizadas en bf16). Sumando activaciones bf16 y cache KV, conviene reservar del orden de 40 GB o mas para un contexto moderado; el dato exacto no esta publicado.
- GPU recomendadas: NVIDIA H100, A100 80 GB o GPUs con 48 GB o mas para ejecucion holgada. En Intel, los aceleradores XPU compatibles son la plataforma objetivo.
- GPU de consumo: probablemente no cabe en una unica RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) por el tamano de los pesos; un despliegue en consumer requeriria varias GPU o una cuantizacion adicional.
- Compatibilidad por backend: en NVIDIA se requiere SM75 o superior (Turing y posteriores). No hay soporte para ROCm, CPU ni TPU: vLLM no dispone de kernel W8A16-FP8 para estos backends y la carga fallara con un error de tipo "no kernel".
- Opciones de despliegue: vLLM, con kernels `XPUW8A16FP8LinearKernel` (Intel XPU), `HummingFP8ScaledMMLinearKernel` (NVIDIA, requiere el paquete `humming`) o `MarlinFP8ScaledMMLinearKernel` (NVIDIA, alternativa).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hoborific/Artemis-31B-v1.2-W8A16-FP8 | 31,27 B | W8A16 FP8 | no disponible | no disponible | HuggingFace, vLLM (Intel XPU / NVIDIA CUDA SM75+) |
| TheDrummer/Artemis-31B-v1.2 (modelo base) | 31,27 B | bf16 (sin cuantizar) | no disponible | no disponible | HuggingFace |
| Otras cuantizaciones del mismo modelo (GGUF, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion solida disponible es con el modelo base: la variante W8A16-FP8 reduce el peso en disco a 33,3 GB y esta optimizada para vLLM en Intel XPU y NVIDIA CUDA, mientras que el modelo base en bf16 no aplica esta restriccion de kernel pero requiere mas memoria. No se dispone de datos sobre alternativas comparables de la misma categoria.

## Limitaciones y advertencias
- Restricciones de backend severas: el modelo no carga en ROCm, CPU ni TPU, ya que vLLM carece de kernel W8A16-FP8 para esas plataformas. Esto excluye su uso en entornos sin Intel XPU o NVIDIA SM75+.
- Dependencia de kernels y paquetes: en NVIDIA, el mejor kernel (`HummingFP8ScaledMMLinearKernel`) requiere el paquete `humming` instalado; si no esta, se recurre a `MarlinFP8ScaledMMLinearKernel`.
- Licencia no disponible: no se especifica la licencia del modelo base ni de esta cuantizacion, por lo que no se puede confirmar si se permite el uso comercial. Conviene verificar la licencia del modelo original antes de usarlo en produccion.
- Idiomas no especificados: se desconoce el soporte multilingue real.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas que requieran ventanas largas sin verificar el valor real en el modelo base.
- Riesgo de degradacion por cuantizacion: aunque el esquema per-channel con clipping busca maximizar el SNR, toda cuantizacion a 8 bits puede introducir perdida de precision frente al modelo base en bf16; no se han publicado metricas comparativas.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada, aunque son inherentes a los modelos generativos.
- Baja traccion en el repositorio: 19 descargas y 0 likes en el momento de la ficha, lo que reduce la evidencia comunitaria sobre su comportamiento real.
- Contenido del modelo base no auditado: no se documentan los datos de entrenamiento ni los procesos de alineacion del modelo original.

## Enlaces
- HuggingFace (este modelo): https://huggingface.co/hoborific/Artemis-31B-v1.2-W8A16-FP8
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Repositorio compressed-tensors: https://github.com/neuralmagic/compressed-tensors
