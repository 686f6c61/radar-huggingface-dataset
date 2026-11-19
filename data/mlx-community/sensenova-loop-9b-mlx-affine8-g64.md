# mlx-community/SenseNova-Loop-9B-mlx-affine8-g64

## Resumen

SenseNova-Loop-9B es un modelo de lenguaje multimodal desarrollado por SenseNova (el brazo de IA de SenseTime) y distribuido en formato MLX por la comunidad `mlx-community`. Esta ficha describe concretamente la conversión cuantizada a 8 bits afín (group size 64) del modelo original, empaquetada para su ejecución en Apple Silicon mediante el framework MLX. El modelo base tiene 9.412.963.952 parámetros (aproximadamente 9,4 mil millones) y declara una longitud de contexto de 524.288 tokens, lo que lo sitúa en la gama de modelos de contexto largo con capacidades de visión.

La relevancia de esta conversión concreta reside en que permite ejecutar un modelo de casi 10 mil millones de parámetros con visión integrada en hardware de consumo de Apple (el autor probó en un M5 Max con 128 GiB de memoria unificada), manteniendo los pesos de visión en BF16 y cuantizando solo las capas lineales y de embedding a 8 bits. No obstante, la model card advierte de que no es una conversión de referencia para PyTorch ni para `mlx_lm` estándar: requiere un cargador personalizado incluido en el repositorio y no debe ejecutarse el código original del editor.

El modelo base emplea una arquitectura poco convencional, con una "capa compartida" que se ejecuta dos veces sobre el rango `[4,28)` (32 capas físicas, 56 visitas lógicas) y un mecanismo de routing denominado mHC con dos streams y 20 iteraciones de Sinkhorn. Esta conversión es experimental y su estado de validación es limitado: el propio autor documenta que solo uno de tres ejemplos cortos de texto, código y matemáticas terminó dentro de un presupuesto de 512 tokens de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal, capa compartida reejecutada (loop) y routing mHC; multimodal (texto + imagen) |
| Parametros totales | 9.412.963.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 524.288 tokens (declarada, heredada del modelo original) |
| Tipos de cuantizacion | Afín 8-bit solo de pesos, group size 64, sobre 250 módulos lineales/embedding; FP32 mHC routing, `A_log` y `dt_bias` excluidos; normas y convoluciones en BF16; pesos de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards, 1.357 tensores indexados), librería MLX |

## Arquitectura y entrenamiento

La arquitectura combina atención completa con atención lineal (estados convolucionales y recurrentes distintos por cada visita lógica), una capa compartida que el modelo entrena para ejecutar dos veces sobre el rango de capas `[4,28)`, y un mecanismo de routing mHC con dos streams y 20 iteraciones de Sinkhorn. El modelo incorpora además una torre de visión con 333 tensores BF16 originales, lo que lo convierte en un modelo multimodal de imagen fija y texto. La configuración original declara una compuerta (gate) en FP32 que permanece inactiva y no se ejecuta, según la configuración del editor.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones de decodificación especulativa ni detalles del proceso de preentrenamiento. La model card de esta conversión se centra exclusivamente en el proceso de cuantización y en las pruebas de fidelidad respecto al modelo BF16, no en el entrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento de propósito general, con contexto declarado de hasta 524.288 tokens.
- Comprensión de imágenes fijas: la API directa acepta una imagen RGB (PIL) junto con texto en un lote de tamaño uno, sin padding.
- Generación de código y respuestas matemáticas (validado de forma limitada: un ejemplo de matemáticas respondió `323`; un ejemplo de código llegó al límite de tokens y ofreció una alternativa de división en coma flotante inválida para enteros arbitrarios).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales: modo de visión de imagen fija; no se soporta vídeo, ni batching de imágenes, ni prefill de imagen por chunks; el uso multi-imagen no está establecido.

## Casos de uso

- Procesamiento de documentos con imágenes en local: el modelo puede recibir una imagen RGB y una pregunta de texto para extraer información de capturas, diagramas o formularios, ejecutándose en un Mac con memoria unificada suficiente gracias a su cuantización a 8 bits.
- Asistencia de código en entornos Apple Silicon: integrable en flujos de desarrollo local mediante el cargador personalizado, útil para autocompletado y explicación de fragmentos, aunque con la advertencia de que las respuestas de código pueden requerir revisión (se observó una sugerencia de división en coma flotante incorrecta para enteros).
- Experimentación académica con arquitecturas de capa compartida: investigadores que estudien el efecto del reejecutado de capas y el routing mHC pueden usar esta conversión para inspeccionar el comportamiento del modelo con un coste de memoria reducido (10,5 GB de repositorio).
- Clasificación o descripción de imágenes simples: la prueba de sanidad con tres imágenes de color sólido (rojo, azul, verde) respondió correctamente, lo que permite usarlo en tareas de verificación visual básica o prototipos de etiquetado.
- Evaluación de fidelidad de cuantización: el repositorio incluye métricas de divergencia KL frente al modelo BF16 (0,000540 nats de media, 100% de acuerdo top-1 en 41 posiciones), lo que lo hace útil como caso de estudio para comparar técnicas de cuantización afín en MLX.
- Prototipado de asistentes conversacionales de contexto largo en local: con la advertencia de que el soporte de oMLX es experimental, texto únicamente, sin streaming y con una sola petición activa, adecuado para pruebas de coherencia hasta 8k tokens verificados manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de fidelidad de cuantización frente al modelo BF16:

| Metrica | Resultado |
|---|---|
| KL media forward, D_KL(BF16 ‖ Q8) | 0,000539691 nats (≈0,000540) |
| Acuerdo top-1 | 41/41 (100%) |
| Diferencia media absoluta de NLL objetivo | 0,035126663 nats |
| Posiciones evaluadas | 41 (23 texto + 15 código + 3 matemáticas) |

Estas métricas se calcularon sobre prefijos forzados por profesor con distribuciones completas de 248.320 tokens, usando el adaptador solo-texto de la comparación, no el adaptador multimodal actual ni la ruta de imagen, y no establecen paridad con PyTorch nativo. El acuerdo top-1 indica coincidencia en el token más probable en esas posiciones, no precisión de tarea ni coincidencia de secuencia libre.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 10,5 GB en safetensors a 8 bits; en ejecución se requiere memoria adicional para estados KV y de atención lineal, además de los tensores BF16 de visión y normas.
- GPU recomendadas: el entorno probado es un Apple M5 Max con 128 GiB de memoria unificada; no se documentan pruebas en GPU NVIDIA (A100, H100, RTX 4090) ni en otras configuraciones.
- ¿Cabe en GPU de consumo? En Apple Silicon con memoria unificada suficiente, sí según la prueba del autor; en GPU de consumo NVIDIA no hay datos disponibles.
- Opciones de despliegue: cargador personalizado incluido en `support/sensenova_mlx/` (con script de build `support/build_wheel.sh`); MLX 0.32.4 y MLX-LM en la revisión `c4c9c762cc797fd979fc98645f5db5112753bbe9`; oMLX parcheado de forma experimental solo para texto, sin streaming y con caché de prefijo desactivada. `mlx_lm.load` estándar no está establecido para esta arquitectura. No se debe ejecutar el `modeling_sensenova_loop.py` original ni habilitar código remoto.
- Latencia y throughput: no disponibles; solo se documenta una prueba manual de coherencia hasta 8k tokens en oMLX parcheado en frío.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoría (multimodales de ~9B con contexto largo), por lo que no es posible establecer una comparación rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Conversión experimental: no es una conversión de referencia ni paridad con PyTorch nativo; las métricas de cuantización provienen del adaptador solo-texto, no del adaptador multimodal actual.
- Cargador no estándar: requiere el cargador personalizado del repositorio; `mlx_lm.load` estándar no está establecido para esta arquitectura.
- Riesgo de ejecución insegura: no se debe ejecutar el `modeling_sensenova_loop.py` original incluido ni habilitar código remoto; el código se conserva solo porque la configuración sin cambios referencia la fuente del editor.
- Soporte multimodal restringido: solo imagen fija RGB, lote de uno, sin padding; el prefill de imagen rechaza el token 248044 (padding/EOS); no se soporta vídeo, batching de imágenes ni prefill por chunks; el uso multi-imagen no está establecido.
- Calidad de generación limitada en las pruebas: de tres ejemplos cortos (texto, código, matemáticas), solo uno terminó dentro de 512 tokens de salida; la respuesta de código incluyó una alternativa de división en coma flotante inválida para enteros arbitrarios.
- oMLX experimental: probado solo con texto, sin streaming, sin caché de prefijo y con una sola petición activa; los parches no se distribuyen.
- Idiomas y sesgos: no se declaran idiomas soportados ni se documentan sesgos conocidos; el riesgo de alucinación no está cuantificado.
- Contexto declarado no verificado: los 524.288 tokens provienen de la fuente original; no se han medido memoria ni precisión a longitudes crecientes.
- Licencia Apache-2.0: permite uso comercial, pero el código de soporte derivado de la fuente se distribuye bajo Apache-2.0 con avisos de terceros; conviene revisar `THIRD_PARTY_NOTICES.md` y `docs/NOTICES.md` antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/SenseNova-Loop-9B-mlx-affine8-g64
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Guía de instalación y API: `docs/INSTALL.md` (dentro del repositorio)
- Metodología de pruebas: `docs/METHODS.md` (dentro del repositorio)
- Script de build: `support/build_wheel.sh` (dentro del repositorio)
- Código de soporte: `support/sensenova_mlx/` (dentro del repositorio, Apache-2.0)
- Avisos de terceros: `THIRD_PARTY_NOTICES.md` y `docs/NOTICES.md` (dentro del repositorio)
