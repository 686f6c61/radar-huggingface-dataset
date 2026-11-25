# mlx-community/SenseNova-Loop-9B-mlx-affine8-g64

## Resumen

SenseNova-Loop-9B-mlx-affine8-g64 es una conversión a formato MLX del modelo SenseNova-Loop-9B publicado por SenseNova (sensenova/SenseNova-Loop-9B), realizada por la comunidad mlx-community para su ejecución en hardware Apple Silicon mediante el framework MLX. Se trata de una cuantización de solo pesos en 8 bits con tipo affine y tamaño de grupo 64, aplicada a 250 módulos lineales y de embedding, manteniendo en BF16 las normas, convoluciones y la totalidad de los 333 tensores de visión del modelo original.

El modelo base emplea una arquitectura denominada `sensenova_loop` con una innovación central: una capa compartida que se ejecuta dos veces sobre el rango `[4,28)`, de modo que 32 capas físicas producen 56 visitas lógicas. Incorpora además un mecanismo mHC (multi-hyper-connection) con dos flujos y 20 iteraciones de Sinkhorn, atención completa combinada con atención lineal, y una ventana de contexto declarada de 524.288 tokens. El resultado es un modelo multimodal de 9.412.963.952 parámetros totales con capacidades de texto, código, matemáticas y visión.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de casi 9.400 millones de parámetros con contexto extremadamente largo en equipos Apple Silicon con memoria unificada, algo que las conversiones estándar de PyTorch no permiten directamente. No obstante, se trata de una conversión comunitaria temprana, con validación limitada y sin benchmarks públicos de calidad, por lo que debe evaluarse con cautela antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sensenova_loop` (transformer con capa compartida reejecutada, mHC de dos flujos, atención completa + atención lineal) |
| Parametros totales | 9.412.963.952 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 524.288 tokens (declarada, heredada del modelo original) |
| Tipos de cuantizacion | Affine 8-bit, group size 64, solo pesos (weight-only); normas, convoluciones y visión en BF16; FP32 en mHC routing, `A_log` y `dt_bias` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 5 shards, 1.357 tensores indexados |

## Arquitectura y entrenamiento

La arquitectura `sensenova_loop` se basa en un transformer con una capa compartida que el modelo entrena para ejecutarse dos veces sobre el rango de capas `[4,28)`. Esto implica que, aunque físicamente hay 32 capas, el cómputo efectivo recorre 56 visitas lógicas, con estados KV de atención completa y estados convolucionales/recurrentes de atención lineal distintos para cada visita lógica. El mecanismo mHC (multi-hyper-connection) utiliza dos flujos y 20 iteraciones de Sinkhorn, que no deben confundirse con 20 pasadas de bucle. La configuración original incluye una compuerta FP32 inactiva que se conserva pero no se ejecuta, y un conjunto de 333 tensores de visión que permanecen en BF16 en esta conversión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación, ya que la model card de esta conversión no los detalla y la información proporcionada no los incluye. La innovación técnica destacable es la combinación de capa compartida reejecutada con atención híbrida (completa y lineal) y contexto de 524.288 tokens, junto con la retención íntegra de la torre de visión en BF16 dentro de una conversión cuantizada.

## Capacidades

- Generación de texto en modo conversacional y completado de prompts cortos, validado en pruebas de humo con recarga estricta Q8.
- Razonamiento matemático básico: en una observación con presupuesto de 512 tokens, una de tres pruebas (matemáticas) finalizó con la respuesta `323`.
- Generación de código: en las pruebas observadas, la respuesta de código alcanzó el límite de 512 tokens y ofreció una alternativa con división en coma flotante inválida para enteros arbitrarios.
- Capacidades de visión: clasificación de imágenes RGB PIL en lotes de uno; en tres imágenes de color sólido respondió `Red`, `Blue` y `Green` respectivamente.
- Soporte de tool calling: se ejercitó una llamada a herramienta en una prueba de humo aislada de oMLX en modo texto.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad validada; el soporte de oMLX existe en una rama en revisión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: contexto declarado de 524.288 tokens, atención híbrida completa/lineal, y modo de visión con prefill de imagen que rechaza el token 248044 (padding/EOS).

## Casos de uso

- Procesamiento de documentos largos en local: con una ventana declarada de 524.288 tokens, el modelo puede ingerir libros completos, expedientes o bases de código extensas en un solo contexto, aunque la memoria necesaria a esa longitud no está medida en la información disponible.
- Asistente de código en estación de trabajo Apple Silicon: al ejecutarse vía MLX en un M5 Max con 128 GiB de memoria unificada, permite autocompletado y explicación de código sin depender de la nube, con la advertencia de que la calidad de código no está benchmarkeada.
- Clasificación y descripción de imágenes simples: la ruta de visión acepta una imagen RGB PIL por lote y responde a preguntas básicas de color o contenido, útil para tareas de etiquetado ligero en local.
- Experimentación académica con arquitecturas de capa compartida: investigadores pueden estudiar el comportamiento de la reejecución de capas y del mecanismo mHC en un entorno MLX reproducible, con el código de soporte legible incluido en el repositorio.
- Evaluación de cuantización y drift distribucional: el repositorio documenta métricas de divergencia KL entre BF16 y Q8 sobre 41 posiciones, lo que lo hace útil como caso de estudio de cuantización affine 8-bit en MLX.
- Pruebas de integración de tool calling en agentes ligeros: la rama `feat/sensenova-loop` de oMLX permite ejercitar SSE, llamadas a herramientas y solicitudes concurrentes con límite serial global, aunque el soporte no está en la versión estable.
- Desarrollo de prototipos multimodales sin GPU dedicada: al ejecutarse en memoria unificada de Apple Silicon, sirve para validar pipelines de visión-texto antes de migrar a infraestructura CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente documenta métricas de comparación de cuantización sobre prefijos teacher-forced congelados:

| Metrica | Resultado |
|---|---:|
| KL media forward, D_KL(BF16 ‖ Q8) | 0,000539691 nats |
| Acuerdo top-1 | 41/41 (100%) |
| Diferencia media absoluta de NLL objetivo | 0,035126663 nats |
| Posiciones evaluadas | 41 (23 texto + 15 código + 3 matemáticas) |
| Distribuciones comparadas | 248.320 tokens por posición |

Estas cifras miden deriva de la distribución del siguiente token en entradas fijas, no precisión de tarea ni acuerdo en generación libre. Además, la comparación se realizó con el adaptador de solo texto, no con el adaptador multimodal actual ni con la ruta de imagen, y no establece paridad con PyTorch nativo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 10,5 GB en disco con cuantización affine 8-bit; en ejecución se necesita además memoria para estados KV de atención completa y estados recurrentes/convolucionales de atención lineal, que crecen con la longitud de contexto y no están cuantificados.
- Entorno probado: Apple M5 Max con 128 GiB de memoria unificada, macOS 27.2.1, Python 3.12.13, MLX 0.32.4, MLX-LM en revisión `0d4d3d04f8ab7ce4a51e7209e8615755a48ba94d`, Transformers 5.22.2 y NumPy 2.3.5.
- GPU recomendadas: no aplica a CUDA; el formato MLX está orientado a Apple Silicon. No hay datos de ejecución en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible para GPUs NVIDIA; en Apple Silicon se validó en un equipo de gama alta con 128 GiB, y no se documenta el mínimo de memoria unificada necesario.
- Opciones de despliegue: MLX-LM con el modelo registrado desde `support/sensenova_mlx/`; cargador estricto directo; oMLX en la rama `feat/sensenova-loop` (pendiente de revisión upstream). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se documenta que la carga registrada y la directa coincidieron exactamente en los 1.023 tensores ejecutables, logits de prompt corto y tokens greedy.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de tamaño o tarea comparable, y la model card no ofrece comparaciones con otros modelos.

## Limitaciones y advertencias

- No se han publicado benchmarks de calidad para código, matemáticas ni razonamiento; la model card propone establecerlos como trabajo futuro.
- En las observaciones con presupuesto de 512 tokens, solo una de tres pruebas (matemáticas) finalizó; texto y código alcanzaron el límite, y la respuesta de código incluyó una alternativa con división en coma flotante inválida para enteros arbitrarios.
- La ruta de imagen solo admite una imagen RGB PIL por lote, completa y sin padding; rechaza el token 248044 (padding/EOS) en el prefill. No soporta vídeo, batching de imágenes ni prefill de imagen por trozos, y el uso multi-imagen no está establecido.
- No se debe ejecutar el `modeling_sensenova_loop.py` original incluido ni habilitar código remoto: se conserva solo porque la configuración sin cambios referencia el código del publicador, no como cargador MLX.
- Las métricas de cuantización proceden del adaptador de solo texto y no del adaptador multimodal actual ni de la ruta de imagen; no establecen paridad con PyTorch nativo.
- El soporte en oMLX está en una rama pendiente de revisión upstream, no en la versión estable.
- La longitud de contexto de 524.288 tokens está declarada pero no se ha medido memoria ni precisión a longitudes crecientes; la model card lo lista como trabajo futuro.
- Idiomas soportados no disponibles; sesgos conocidos no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; las pruebas de humo son insuficientes para estimarlo.
- Licencia Apache-2.0, que permite uso comercial, pero el código de soporte derivado se distribuye bajo Apache-2.0 con avisos de terceros que deben revisarse en `THIRD_PARTY_NOTICES.md` y `docs/NOTICES.md`.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/SenseNova-Loop-9B-mlx-affine8-g64
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Código de soporte: `support/sensenova_mlx/` dentro del repositorio
- Script de construcción: `support/build_wheel.sh`
- Guía de instalación y API: `docs/INSTALL.md`
- Métodos de evaluación: `docs/METHODS.md`
- Avisos de terceros: `THIRD_PARTY_NOTICES.md`
- Evidencia de licencias: `docs/NOTICES.md`
- Licencia del código de soporte: `support/LICENSE`
- Rama oMLX: https://github.com/rgarcia-fx/omlx/tree/feat/sensenova-loop
- Guía oMLX: https://github.com/rgarcia-fx/omlx/blob/feat/sensenova-loop/docs/sensenova.md
