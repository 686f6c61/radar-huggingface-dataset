# luca0621/appgen-qwen3-uedgrpo-ngc-amex-pbrs-v32r11-step10

## Resumen

El modelo `luca0621/appgen-qwen3-uedgrpo-ngc-amex-pbrs-v32r11-step10` es un fine-tuning del Qwen3-VL-8B-Instruct desarrollado por el usuario luca0621. Está diseñado específicamente para la investigación de agentes visuales en entornos Android, combinando comprensión de imágenes (capturas de pantalla) con instrucciones en lenguaje natural para realizar tareas de interfaz gráfica. El entrenamiento se realizó con una estrategia de congelación parcial: la torre visual, el merger y los deep-stack mergers del modelo base permanecieron intactos, mientras que el modelo de lenguaje y su cabeza se ajustaron completamente.

El modelo se entrenó sobre dos datasets: `luca0621/appgen-sft-ngc-v1` (imágenes sintéticas generadas mediante HTML-to-PNG) y `Yuxiang007/AMEX`, con un total de 3.588 exposiciones y 3.168 ejemplos semánticos únicos. El proceso de entrenamiento siguió un contrato estricto de verificación de pesos, garantizando que la parte visual no se modificara. El resultado es un modelo de 8.767 millones de parámetros, publicado bajo licencia Apache 2.0, orientado a tareas de grounding de coordenadas normalizadas (0-1000) sobre interfaces Android.

La relevancia de este modelo radica en su enfoque en agentes GUI móviles, un área en auge para la automatización de pruebas y asistencia en dispositivos. Sin embargo, el autor declara explícitamente que es un modelo de investigación, no apto para despliegue autónomo en entornos críticos, y que no se reivindican resultados en benchmarks estáticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B (fine-tuning del Qwen3-VL-8B-Instruct) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-VL-8B-Instruct, un transformer multimodal que combina un codificador visual, un merger y un modelo de lenguaje. En este fine-tuning, el autor congeló por completo la torre visual, el merger y los deep-stack mergers, verificando byte a byte que estos componentes no se alteraran respecto al modelo base. Solo el modelo de lenguaje y su cabeza fueron entrenados, con un optimizador AdamW completo, tasa de aprendizaje de 2.5e-07, programación coseno con 5% de warmup, tamaño de lote global de 32 (microbatch 4 × 2 GPUs × acumulación de gradientes 4) y una sola época con 113 actualizaciones de optimizador.

Los datos de entrenamiento provienen de dos fuentes: `luca0621/appgen-sft-ngc-v1`, que contiene imágenes sintéticas generadas mediante renderizado HTML-to-PNG, y `Yuxiang007/AMEX`. El conjunto incluye 400 exposiciones de grounding directo y 420 de replay con retención de completitud. Las coordenadas de las acciones se normalizaron en un rango de 0 a 1000. El prompt del sistema está fijado con un hash SHA-256 documentado, y el autor publica únicamente el checkpoint final (checkpoint-113), dejando los intermedios de 25 pasos en local.

## Capacidades

- Comprensión de imágenes de interfaz de usuario Android para generar acciones de navegación o anotaciones en coordenadas normalizadas.
- Grounding visual directo: identificación de elementos interactivos en capturas de pantalla mediante coordenadas (0-1000).
- Generación de texto multimodal a partir de imágenes y prompts en lenguaje natural.
- Soporte de conversación multi-turno (heredado del modelo base Qwen3-VL-8B-Instruct, aunque no se documentan pruebas específicas).
- Capacidad de procesamiento de imágenes sintéticas y reales de pantallas, orientado a tareas de agente GUI.
- No se documenta soporte de tool calling, function calling ni modos de razonamiento explícitos más allá de lo heredado del base.

## Casos de uso

- Automatización de pruebas de interfaz en Android: el modelo puede recibir una captura de pantalla y generar la siguiente acción (toque, deslizamiento, texto) en coordenadas normalizadas, lo que permite construir pipelines de testing autónomo sin necesidad de selectores de UI tradicionales.
- Asistencia en navegación de aplicaciones para personas con discapacidad visual: a partir de una imagen de la pantalla, el modelo puede describir y sugerir acciones, aunque no se ha validado en entornos reales.
- Investigación en agentes de interfaz gráfica: sirve como base para estudiar estrategias de grounding y planificación en entornos simulados como AndroidWorld, aunque el autor advierte que no sustituye la evaluación interactiva.
- Generación de anotaciones de UI para datasets: dado su entrenamiento con imágenes sintéticas, puede usarse para etiquetar automáticamente elementos de pantalla en coordenadas, acelerando la creación de conjuntos de datos.
- Prototipado de asistentes móviles: en entornos de investigación controlados, puede integrarse en demos de asistentes que interpretan capturas de pantalla y ejecutan comandos básicos.
- Evaluación de técnicas de fine-tuning congelado: el modelo es útil como caso de estudio para comparar estrategias de entrenamiento parcial en modelos multimodales, dado que su contrato de verificación de pesos está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los benchmarks estáticos de grounding no sustituyen la evaluación interactiva en AndroidWorld y que no se reivindica ninguna puntuación.

## Requisitos de hardware

- El tamaño del repositorio es de 35.1 GB, lo que sugiere pesos en BF16 o FP16 (8.7B parámetros × 2 bytes ≈ 17.4 GB, aunque el repositorio puede incluir archivos adicionales como configuración o checkpoints de optimizador).
- Para inferencia en BF16, se estima un consumo de VRAM de aproximadamente 18-20 GB, lo que requiere GPUs de gama alta como RTX 4090 (24 GB) o A100 (40 GB). No se dispone de información oficial sobre cuantizaciones alternativas.
- El modelo no está desplegado en ningún proveedor de inferencia (según la búsqueda web), por lo que el despliegue local es la única opción documentada.
- Se puede servir con librerías compatibles con transformers y safetensors, como vLLM o TGI, aunque no se han publicado configuraciones específicas.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otras alternativas. El modelo base Qwen/Qwen3-VL-8B-Instruct es el punto de referencia natural, ya que este fine-tuning parte de él. Otros modelos de agentes visuales para Android (como los basados en Llama-VL o CogAgent) no se mencionan en la documentación proporcionada, por lo que no se puede establecer una comparación fiable.

## Limitaciones y advertencias

- El autor declara que el modelo es para investigación en agentes visuales Android, no para despliegue autónomo en entornos críticos de seguridad.
- No se han realizado evaluaciones interactivas en AndroidWorld; los benchmarks estáticos no son representativos del rendimiento real en tareas de agente.
- El entrenamiento se realizó con imágenes sintéticas HTML-to-PNG, lo que puede limitar la generalización a interfaces reales y diversas.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos, pero al ser un modelo multimodal basado en Qwen3-VL, hereda las limitaciones generales de ese modelo base.
- No se especifican idiomas soportados ni la longitud de contexto efectiva tras el fine-tuning.
- La licencia Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para producción.
- Solo se publica el checkpoint final; no hay acceso a checkpoints intermedios para reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luca0621/appgen-qwen3-uedgrpo-ngc-amex-pbrs-v32r11-step10
- Dataset de entrenamiento: https://huggingface.co/datasets/luca0621/appgen-sft-ngc-v1 (referenciado en la model card)
- Dataset AMEX: https://huggingface.co/datasets/Yuxiang007/AMEX (referenciado en la model card)
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct (referenciado en la model card)
