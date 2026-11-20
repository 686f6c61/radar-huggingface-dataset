# LiquidAI/d1-2B-MLX-fp16

## Resumen

d1-2B es un modelo de decisión desarrollado por Liquid AI que responde preguntas tipadas y con nombre sobre un estado (texto, imágenes o vídeo) devolviendo probabilidades calibradas en un único paso forward, sin generar tokens. Se distribuye aquí como `d1-2B-MLX-fp16`, una conversión a FP16 del checkpoint original para Apple Silicon mediante la librería MLX, con un peso en disco de 3,84 GB. Con 1.918.181.888 parámetros, pertenece a la familia LFM3 de Liquid AI y se etiqueta internamente como `lfm3_vl`.

El modelo no es un generador de texto conversacional al uso: su interfaz (`model.system_one`) acepta un estado y un conjunto de preguntas con tipos definidos (`noul`, `choice`, `score`) y devuelve respuestas con probabilidad calibrada. Esto lo sitúa en la categoría de modelos "system-one" orientados a clasificación, enrutamiento y calibración, en contraposición a los modelos generativos que razonan paso a paso. Es multimodal (image-text-to-text) y soporta 16 idiomas, entre ellos el español.

Su relevancia práctica radica en la eficiencia: al no generar tokens, el coste de inferencia se reduce a un solo paso forward, lo que resulta atractivo para clasificación de tickets, enrutamiento, moderación o etiquetado a gran escala en hardware de consumo Apple. La licencia es `lfm1.0` (marcada como "other"), por lo que conviene revisar sus términos antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 (`lfm3_vl`), multimodal image-text-to-text; detalles de capas no disponibles |
| Parámetros totales | 1.918.181.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (esta variante); cuantizaciones adicionales no disponibles |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (MLX, FP16) |

## Arquitectura y entrenamiento

La model card de esta variante remite a la del modelo base `LiquidAI/d1-2B` para los detalles de arquitectura y uso, y no aporta información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO. Lo que sí se explicita es la naturaleza del modelo: un modelo de decisión que, dado un estado (texto, imagen o vídeo) y un conjunto de preguntas nombradas y tipadas, produce respuestas con probabilidades calibradas en un único paso forward, sin decodificación autoregresiva de tokens. Los tags de la familia incluyen `decision`, `classification`, `calibration`, `system-one` y `multimodal`.

La conversión a MLX almacena los pesos en FP16, precisión recomendada por el autor por ser la más cercana al checkpoint original ejecutado en float32; se indica explícitamente que no se ha exportado una versión BF16. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Decisión y clasificación sobre texto: respuestas a preguntas con nombre y tipo (`noul` para sí/no con probabilidad, `choice` para selección entre criterios, `score` para puntuación sobre una escala con leyenda).
- Clasificación multietiqueta mediante el parámetro `multiple: true` en preguntas de tipo `choice`.
- Procesamiento de imágenes como estado completo de la consulta (pipeline image-text-to-text); también se menciona vídeo como entrada.
- Salida con probabilidades calibradas, apta para umbrales y enrutamiento automatizado.
- Respuesta en un único paso forward sin generación de tokens (el ejemplo de la model card reporta `output_tokens: 0`).
- Multilingüe en 16 idiomas, incluido el español.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento extendido (thinking); el modelo no genera texto libre, por lo que los flujos conversacionales tipo chat no son aplicables.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la model card clasifica un ticket en equipo (`billing`, `shipping`, `technical`), detecta temas multietiqueta y estima urgencia en una sola pasada; adecuado porque devuelve probabilidades calibradas que permiten fijar umbrales de derivación automática.
- Triaje y priorización en atención al cliente: preguntas de tipo `score` sobre una escala (`low`, `medium`, `high`) permiten ordenar colas de trabajo sin coste de generación de texto.
- Moderación de contenido: preguntas `noul` con probabilidad calibrada permiten decidir si un texto o imagen infringe una política, ajustando el umbral según la tolerancia a falsos positivos.
- Etiquetado de imágenes a escala: al tratar la foto como estado completo, puede responder preguntas de clasificación sobre imágenes (categoría, presencia de objetos definidos por criterios) en un solo forward, útil para pipelines de anotación.
- Análisis de formularios y documentos escaneados: combinación de imagen y preguntas tipadas para extraer decisiones de clasificación (tipo de documento, departamento destinatario) sin OCR ni generación.
- Clasificación multilingüe de reseñas o mensajes: con soporte de 16 idiomas, puede etiquetar sentimiento, tema o intención en textos en español, inglés, árabe, chino, etc., con el mismo esquema de preguntas.
- Despliegue local en Mac: la variante MLX FP16 (3,84 GB) permite ejecutar el modelo en Apple Silicon para prototipado y clasificación en local sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos FP16 ocupan 3,84 GB según la model card; el repo completo pesa 3,9 GB. Hay que sumar la memoria del procesador multimodal y de activaciones, no cuantificada en la información disponible.
- Hardware objetivo: Apple Silicon mediante MLX; requiere MLX-VLM 0.7.11 o superior (`pip install -U "mlx-vlm>=0.7.11"`).
- GPU NVIDIA: no se documenta soporte en esta variante; el formato es MLX, específico de Apple.
- GPU de consumo: cabe en equipos Apple Silicon con memoria unificada suficiente (los pesos solos son 3,84 GB); no se especifican modelos concretos de Mac ni requisitos mínimos de memoria unificada.
- Opciones de despliegue: MLX-VLM con `model.system_one` o el comando `decide`. No es compatible con `mlx_vlm.generate` ni con aplicaciones de chat, porque el modelo no genera texto.
- Latencia y throughput: no disponibles; al no generar tokens, el coste por consulta es de un único paso forward, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión con salida calibrada sin generación de tokens) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; `mlx_vlm.generate` y las apps de chat no pueden ejecutarlo.
- Requiere definir previamente las preguntas, sus tipos y, en su caso, los criterios de elección; la calidad de la salida depende del diseño del esquema de decisión.
- No se documentan sesgos conocidos, pero al ser un modelo multilingüe y multimodal entrenado con datos no especificados, cabe esperar sesgos propios de esos datos; no hay información para cuantificarlos.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento: las probabilidades son calibradas según el autor, pero no se aportan métricas de calibración (ECE, Brier) ni benchmarks que lo verifiquen.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con estados largos (documentos extensos o vídeos de larga duración).
- Licencia `lfm1.0` (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- Solo FP16 en MLX: no hay exportación BF16 y no se documentan cuantizaciones de menor precisión para esta variante.
- Dependencia de una versión mínima de MLX-VLM (0.7.11) y de código con `custom_code`, lo que puede complicar la integración en stacks fuera de MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-2B-MLX-fp16
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Licencia: https://huggingface.co/LiquidAI/d1-2B-MLX-fp16/blob/main/LICENSE
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- API/consola: https://console.liquid.ai/dashboard
