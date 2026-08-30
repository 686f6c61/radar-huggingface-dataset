# sleephashira/bleach-jojo-multistyle-noobai-xl-vpred-lora

## Resumen

El modelo `sleephashira/bleach-jojo-multistyle-noobai-xl-vpred-lora` es un adaptador LoRA (Low-Rank Adaptation) para el modelo base de difusión NoobAI XL V-Pred, desarrollado por el usuario sleephashira. Su propósito es añadir tres registros estilísticos diferenciados basados en los mangas Bleach y JoJo's Bizarre Adventure, activables mediante prompts específicos: `blcmanga` (Bleach en monocromo), `blccolor` (Bleach en color oficial) y `jjbamanga` (JoJo). El adaptador se distribuye como un único archivo `multi3_lora.safetensors` de aproximadamente 456 MB y está pensado para su uso con la librería `diffusers`.

La relevancia de este modelo radica en su capacidad para transferir estilos artísticos concretos de obras con copyright a un pipeline de generación de imágenes, aunque con restricciones legales explícitas. Está entrenado sobre 1.800 paneles extraídos de las obras originales (600 por cada registro) y requiere una configuración específica de inferencia (Euler, v-prediction, `rescale_betas_zero_snr`, `guidance_rescale=0.7` y CFG 4-5) para funcionar correctamente. Su licencia es `other`, limitando el uso a fines personales, de investigación y educativos, con prohibición expresa de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Stable Diffusion XL (SDXL) |
| Parametros totales | no disponible (archivo de 456.519.428 bytes, sin desglose de parámetros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen, sin ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como safetensors de precisión completa) |
| Idiomas soportados | no disponible (los prompts se escriben en inglés, pero no hay especificación oficial) |
| Licencia | other (uso personal, investigación y educativo; prohibido uso comercial) |
| Formato de pesos | safetensors (archivo `multi3_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se basa en NoobAI XL V-Pred, un checkpoint de SDXL derivado de Illustrious XL, que a su vez utiliza la arquitectura estándar de Stable Diffusion XL con un codificador de texto dual (CLIP ViT-L y OpenCLIP ViT-bigG). NoobAI XL V-Pred emplea predicción de velocidad (v-prediction) en lugar de la predicción de ruido epsilon habitual, lo que requiere un scheduler específico (Euler) y ajustes como `rescale_betas_zero_snr=True` y `guidance_rescale=0.7`.

El entrenamiento del LoRA se realizó con un conjunto de datos de 1.800 paneles extraídos y limpiados de las obras originales: 600 paneles monocromos de Bleach, 600 paneles a color oficial de Bleach y 600 paneles de JoJo. Se seleccionó el checkpoint del paso 3600 para la publicación. No se especifica el número de épocas, la tasa de aprendizaje ni el método de optimización. El modelo no ha pasado por procesos de RLHF ni DPO; es un ajuste puramente supervisado sobre imágenes.

## Capacidades

- Generación de imágenes en tres estilos de manga diferenciados: Bleach monocromo (`blcmanga`), Bleach a color (`blccolor`) y JoJo (`jjbamanga`).
- Activación mediante triggers específicos en el prompt, con posibilidad de combinar varios triggers de forma experimental.
- Requiere configuración de inferencia específica: sampler Euler, `prediction_type="v_prediction"`, `rescale_betas_zero_snr=True`, `guidance_rescale=0.7` y CFG 4-5.
- Soporta resolución de generación en torno a 1024x1024 píxeles de área total (por ejemplo, 832x1216).
- Integración con la librería `diffusers` mediante `load_lora_weights` y `fuse_lora`.
- No incluye capacidades de visión, audio, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de texto a imagen.

## Casos de uso

- Creación de fan art personal: el modelo permite generar ilustraciones en el estilo visual de Bleach o JoJo para proyectos no comerciales, como regalos, impresiones personales o redes sociales sin monetización.
- Investigación académica sobre estilos artísticos: investigadores en visión por computador o estudios culturales pueden analizar cómo el modelo reproduce motivos visuales específicos de estas obras, siempre dentro del marco de uso educativo permitido.
- Prototipado de conceptos para ilustradores: artistas pueden usar el modelo como referencia rápida para explorar composiciones, paletas de color o encuadres característicos de estos mangas antes de crear sus propias obras originales.
- Educación en diseño de personajes: en entornos docentes, el modelo puede servir para ejemplificar cómo se representan ciertos rasgos estilísticos (líneas, sombreado, expresiones) en el manga, sin fines lucrativos.
- Experimentación con combinación de estilos: al combinar triggers, se pueden obtener mezclas visuales inéditas (por ejemplo, elementos de Bleach con estética de JoJo) para explorar posibilidades creativas en proyectos personales.
- Generación de material de referencia para estudios de color: `blccolor` permite obtener muestras de color oficial de Bleach, útil para analizar paletas y técnicas de entintado en contextos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas objetivas (como FID, CLIP score o evaluaciones humanas) que permitan comparar cuantitativamente este LoRA con otros adaptadores similares. El autor solo indica que el checkpoint del paso 3600 fue seleccionado para la publicación, sin aportar datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser un LoRA sobre SDXL, la inferencia requiere la carga del modelo base NoobAI XL V-Pred (aproximadamente 6,9 GB en fp16) más el adaptador. Se recomienda un mínimo de 8 GB de VRAM para generar a 1024x1024 con precisión fp16; 12 GB o más para mayor comodidad y resolución superior.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, A100 o H100. En GPUs con menos de 8 GB, se puede intentar con cuantización del modelo base (por ejemplo, fp8 o int8) aunque no está documentado.
- El modelo cabe en GPUs de consumo medio-alto; no es viable en GPUs integradas o con menos de 6 GB de VRAM.
- Opciones de despliegue: la integración oficial es con `diffusers` en Python. También puede usarse en interfaces como ComfyUI o Automatic1111 WebUI, siempre que soporten LoRA y el modelo base V-Pred.
- Latencia y throughput: no disponibles. Dependen de la GPU, la resolución y el número de pasos (28 pasos recomendados). En una RTX 4090, una generación de 1024x1024 con 28 pasos suele tardar entre 5 y 10 segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRA de estilos de manga específicos para NoobAI XL V-Pred que permitan una comparación directa. Existen adaptadores genéricos de estilo anime, pero no hay datos públicos de rendimiento o características para este tipo de comparativa. Se puede señalar que, frente a un LoRA genérico de estilo manga, este modelo ofrece tres registros diferenciados y entrenados con datos específicos, pero a costa de restricciones de uso más severas.

## Limitaciones y advertencias

- Uso comercial estrictamente prohibido: la licencia `other` impide cualquier uso que genere ingresos, incluyendo publicidad, servicios de pago, reventa o monetización indirecta.
- Riesgo de reproducción de sesgos visuales: el entrenamiento con paneles de obras con copyright puede hacer que el modelo reproduzca motivos, personajes o asociaciones visuales protegidos, lo que conlleva riesgos legales adicionales.
- Posibles deformaciones anatómicas y artefactos: el autor advierte que el modelo puede producir anatomía malformada, texto ilegible, bordes o detalles de viñetas incorrectos, especialmente con prompts complejos o combinaciones de triggers.
- Dependencia de configuración específica: el uso de samplers distintos a Euler o de ajustes de predicción epsilon produce resultados no deseados; es imprescindible seguir las instrucciones de inferencia.
- Sin garantías: el artefacto se distribuye "tal cual", sin garantías de ningún tipo, y el mantenedor excluye cualquier responsabilidad por daños derivados de su uso.
- Restricciones de terceros: el uso del modelo está sujeto también a los términos del modelo base NoobAI XL V-Pred, de Illustrious XL y de la Fair AI Public License 1.0-SD, que deben revisarse antes de su descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sleephashira/bleach-jojo-multistyle-noobai-xl-vpred-lora
- Modelo base NoobAI XL V-Pred: https://huggingface.co/Laxhar/noobai-XL-Vpred-1.0
- Modelo base NoobAI XL 1.0: https://huggingface.co/Laxhar/noobai-XL-1.0
- Página oficial de NoobAI XL: https://noobaixl.org/
- Guía de NoobAI (BetterWaifu): https://betterwaifu.com/blog/noobai-guide
- Modelo Illustrious XL (referencia): https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Términos de uso de Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0/blob/main/TERM_OF_USE
- Fair AI Public License 1.0-SD: https://freedevproject.org/faipl-1.0-sd/
