# kamiyou/zils-lite-clef-scout

## Resumen

Zils-lite-clef-scout (publicado también como clef-vision-0.8b) es un modelo de decisión multimodal de 0,92 mil millones de parámetros desarrollado por el usuario kamiyou. No es un modelo generativo: se trata de un destilado de Clef-flash (Qwen3.5-9B de Cloudflare) sobre un backbone Qwen3.5-0.8B al que se le acopla una cabeza de esquema conjunta (joint schema head). Recibe un estado (texto o JSON), opcionalmente una o varias imágenes, y un conjunto de preguntas tipadas (`noul` verdadero/falso, `choice` y `score` ordenado), y devuelve en un único forward pass una probabilidad para cada opción permitida de cada pregunta. No genera tokens.

La relevancia del modelo está en su naturaleza de "decision model": sustituye la generación autoregresiva por una clasificación estructurada de baja latencia, lo que lo hace adecuado para pipelines de enrutamiento, verificación y control en producción. Con 852.985.920 parámetros reales en safetensors (el autor indica 0,92B contando la cabeza de 69M), un repositorio de 1,7 GB y licencia Apache-2.0, está pensado para desplegarse en dispositivos con CUDA o CPU, incluidos Jetson, y existe una build Core ML para Apple Silicon.

El modelo se entrenó por destilación desde el profesor Clef-flash 9B y comparte contrato y API con Clef, Jev y SystemOne, lo que permite intercambiarlo sin cambiar el código de integración. Su punto débil es la cobertura de dominio: el entrenamiento se limita a mascotas, comida y objetos de COCO, por lo que el rendimiento fuera de esos dominios debe validarse empíricamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Gated DeltaNet) con codificador de visión y cabeza de esquema conjunta (joint schema head) |
| Parametros totales | 852.985.920 (0,92B incluyendo la cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (release en PyTorch fp32; el profesor se ejecutó en MLX 8-bit, pero no se documentan cuantizaciones del estudiante) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `joint_head.safetensors`) más código Python propio (`joint_schema_model.py`) |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3.5-0.8B (transformer con atención Gated DeltaNet, que en CUDA requiere `causal-conv1d` y `flash-linear-attention` para los kernels rápidos) con el codificador de visión de Qwen3.5 y una cabeza de esquema conjunta nueva de 69M parámetros (hidden 1024, width 1024, 2 capas de routing más 2 capas, 16 cabezas). La cabeza codifica el registro de entrada (estado, imágenes y preguntas tipadas) y produce logits por opción; el resultado se obtiene aplicando softmax sobre cada pregunta. El módulo `joint_schema_model.py` es el de Cloudflare, sin modificar, e incluye `encode_record`, `collate_records`, `load_release_model` y `systemone`.

El entrenamiento se hizo por destilación desde Clef-flash (Qwen3.5-9B ejecutado localmente en MLX 8-bit con un port exacto de la cabeza). Se usaron 14.246 registros etiquetados por el profesor (5.648 train / 2.167 dev / 6.431 test, con split por hash de imagen). El estudiante aplica LoRA r64 sobre el modelo de lenguaje (fusionado en el checkpoint final) más una cabeza de esquema nueva; la pérdida es KL con T=2 contra el profesor más 0,3 × entropía cruzada con label smoothing sobre el gold del dataset. Se entrenó 530 pasos × 16 registros en una Apple M5 Pro de 24 GB durante 6,2 horas, con la torre de visión congelada. Las imágenes de entrenamiento provienen de Oxford-IIIT Pets, Food-101 y COCO 2017 val.

## Capacidades

- Clasificación visual estructurada: responde preguntas de presencia (`noul`), elección entre opciones (`choice`) y puntuación ordenada (`score`) sobre una o varias imágenes.
- Salida tipada y determinista: devuelve una probabilidad por opción en un solo forward pass, sin generación autoregresiva.
- Entrada multimodal conjunta: acepta estado textual o JSON junto con imágenes en el mismo registro.
- Compatibilidad de API con Clef, Jev y SystemOne: `systemone(model, processor, request)` procesa cuerpos `POST /v1/systemone`.
- Coincidencia con referencias y rejillas de tiles: tareas de reference matching y tile grids incluidas en la evaluación.
- Ejecución en CUDA, CPU y Jetson; build Core ML separada para Apple Silicon.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre: su contrato es exclusivamente de decisión.

## Casos de uso

- Enrutamiento de imágenes en pipelines de ingestión: clasificar cada imagen entrante (tipo de escena, presencia de personas u objetos) con una sola pasada y probabilidades calibradas, para decidir a qué cola o modelo posterior enviarla.
- Verificación de contenido en moderación asistida: preguntas `noul` sobre presencia de elementos concretos en un frame, con umbral de probabilidad configurable, útil cuando se necesita baja latencia y no generación.
- Control de calidad en datasets de visión: rejillas de tiles y reference matching para detectar imágenes mal etiquetadas o duplicadas antes de entrenar otros modelos.
- Automatización en dispositivos edge: despliegue en Jetson o CPU gracias a sus 0,92B parámetros y al soporte de kernels Gated DeltaNet, para inspección en cámara sin depender de la nube.
- Extracción de atributos estructurados: dado un estado JSON y una imagen, obtener decisiones tipadas (categoría de plato, raza de mascota, presencia de objeto) que alimenten una base de datos o un sistema de reglas.
- Sustitución directa de Clef-flash en integraciones existentes: al compartir contrato y API, permite bajar de 9B a 0,92B en entornos con restricciones de memoria manteniendo el mismo código de cliente.
- Prefiltrado antes de un modelo generativo grande: usar las probabilidades del scout para descartar casos triviales y reservar el modelo mayor solo para los casos ambiguos.

## Benchmarks y rendimiento

Evaluación held-out del autor: 1.500 registros y 4.094 preguntas sobre Oxford-IIIT Pets, Food-101 y COCO val.

| Modelo | Acuerdo con el profesor | Precisión gold | KL al profesor |
|---|---:|---:|---:|
| Este modelo (0,92B) | 92,5% | 92,2% | 0,095 |
| Profesor Clef-flash 9B (MLX 8-bit) | — | 94,1% | — |

Precisión gold por tarea: presencia de objetos COCO 98%, plato Food-101 97%, raza de mascota 95%, reference-match grids 96–100%, tile grids 88–93%.

Verificación de carga: con `load_release_model` en CPU y fp32, los token ids coinciden con el encoder de referencia en 4 registros de imagen, con 8/8 de acuerdo en argmax y una diferencia máxima de probabilidad de 4,3e-3 frente al estudiante publicado.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 1,7 GB en safetensors; en fp32 la inferencia requiere del orden de 3,5–4 GB contando activaciones, aunque el autor no publica una cifra oficial.
- GPU recomendadas: cualquier GPU CUDA con al menos 8 GB; el modelo se entrenó en una Apple M5 Pro de 24 GB, lo que da margen sobrado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares; también en CPU.
- Despliegue: PyTorch con `transformers` ≥ 5.10 y `pillow`; en CUDA conviene instalar `causal-conv1d` y `flash-linear-attention` para los kernels rápidos de Gated DeltaNet. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no es generativo y requiere código propio.
- Apple Silicon: usar la build Core ML `FluidInference/clef-vision-0.8b-coreml`; cargar este checkpoint en MPS mediante `device_map` provocó un crash en las pruebas del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión gold (held-out del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zils-lite-clef-scout | 0,92B | No disponible | 92,2% | Apache-2.0 | Hugging Face (PyTorch y Core ML) |
| Clef-flash (profesor) | 9B | No disponible | 94,1% | No disponible en la información | Hugging Face (Cloudflare) |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | No aplica (modelo generativo) | No disponible en la información | Hugging Face |

La comparación con modelos generativos del mismo tamaño no es directa: este modelo no produce texto, sino probabilidades tipadas, por lo que las métricas de generación (MMLU, HumanEval) no aplican.

## Limitaciones y advertencias

- Cobertura de dominio limitada: entrenado con mascotas, comida y objetos de COCO; el propio autor advierte de precisión inferior en otros dominios (vigilancia, cámaras industriales) hasta validarlo con datos propios.
- No es un modelo generativo: no responde preguntas abiertas ni produce texto libre; solo devuelve probabilidades sobre opciones predefinidas.
- Sesgos: no se documentan análisis de sesgo; al derivar de un profesor entrenado con datasets académicos, puede heredar sesgos de Oxford-IIIT Pets, Food-101 y COCO.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden ser sobreconfiadas en dominios fuera de distribución.
- Idioma: no se especifican idiomas soportados; las instrucciones de las preguntas se procesan con el tokenizer de Qwen3.5, pero no hay evaluación multilingüe publicada.
- Restricciones de licencia: el modelo es Apache-2.0, pero las imágenes de entrenamiento incluyen Food-101 (uso exclusivamente de investigación) y Oxford-IIIT Pet (CC BY-SA 4.0), lo que puede afectar a la redistribución del modelo en contextos comerciales.
- Producción: requiere `transformers` ≥ 5.10 y código personalizado; no hay soporte documentado en servidores de inferencia estándar. En Apple Silicon hay que usar la build Core ML, no este checkpoint.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kamiyou/zils-lite-clef-scout
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Profesor Clef-flash: https://huggingface.co/Cloudflare/clef-flash
- Build Core ML: https://huggingface.co/FluidInference/clef-vision-0.8b-coreml
