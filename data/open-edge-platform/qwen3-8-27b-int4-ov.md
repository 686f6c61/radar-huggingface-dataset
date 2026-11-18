# open-edge-platform/qwen3.8-27B-int4-ov

## Resumen

Qwen3.8-27B INT4 (OpenVINO) es una distribución pre-cuantizada del modelo de visión-lenguaje Qwen3.8-27B de Alibaba, publicada por open-edge-platform (Intel) en formato OpenVINO IR con compresión de pesos INT4. Su propósito es ejecutar comprensión imagen-texto en hardware Intel (CPU y GPU) dentro de entornos de borde, y el caso de uso que documenta la model card es la descripción automática de fotogramas de vídeo muestreados en escenarios de ciudad inteligente (tráfico, peatones, actividad vehicular).

El artefacto no es un modelo entrenado desde cero ni un ajuste fino: es un paquete de despliegue que incluye los pesos del modelo base convertidos a OpenVINO IR, junto con pesos MTP (multi-token prediction) para decodificación especulativa voraz y scripts de ejemplo basados en OpenVINO GenAI e Intel DLStreamer. El repositorio ocupa 0,0 GB y el script de descarga advierte de una descarga de aproximadamente 15,97 GB, por lo que los pesos se obtienen mediante un script (`export_and_quantize.sh`) y no están alojados íntegramente en el repo.

Es relevante porque ejemplifica el patrón de despliegue de VLM de gran tamaño en infraestructura Intel sin GPU dedicada de datacenter, con cuantización INT4 para reducir huella de memoria y decodificación especulativa para mitigar la latencia. La información disponible es limitada: no hay benchmarks publicados, no hay detalle sobre el dataset de entrenamiento y la validación se restringe a CPU en la pila indicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (modelo base Qwen3.8-27B); el paquete incluye pesos MTP para decodificación especulativa |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (compresión de pesos); el script de exportación acepta el argumento `INT4` |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (pre-cuantizado), con pesos MTP adicionales |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un VLM nativo de Alibaba con encoder visual y decoder de lenguaje, del que la información proporcionada no detalla la composición interna (número de capas, atención, configuración del encoder de visión). El paquete distribuido por open-edge-platform aplica compresión de pesos INT4 sobre los pesos en PyTorch/Transformers y los convierte a OpenVINO IR para su ejecución con OpenVINO GenAI. Adicionalmente incluye pesos MTP que habilitan decodificación especulativa voraz; el ejemplo de OpenVINO usa dos tokens asistente y desactiva el prefix caching.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras etapas de alineación. La model card menciona que Qwen3.8 activa el modo *thinking* por defecto en su plantilla de chat y que admite un parámetro `reasoning_effort` con valores `low`, `medium` y `xhigh`, pero no documenta el proceso de entrenamiento que da lugar a esas capacidades.

## Capacidades

- Comprensión imagen-texto: genera descripciones en lenguaje natural de imágenes y de fotogramas de vídeo muestreados.
- Descripción de escenas urbanas: el prompt de ejemplo pide describir peatones, vehículos y actividad en una escena de calle.
- Procesamiento de vídeo por muestreo de fotogramas: el ejemplo procesa el primer fotograma y después uno cada 300 fotogramas, superponiendo el resultado y guardando un vídeo anotado.
- Modo *thinking*: activado por defecto en la plantilla de chat del modelo base; puede desactivarse mediante el contexto extra `ChatHistory` en OpenVINO GenAI.
- Control de esfuerzo de razonamiento: soporta `reasoning_effort` con valores `low`, `medium` y `xhigh` en interfaces compatibles.
- Decodificación especulativa: pesos MTP incluidos para acelerar la generación en modo voraz.
- Multilingüe: limitado a inglés según el campo `language` de la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Audio: no disponible.

## Casos de uso

- Descripción automática de tráfico urbano: el modelo recibe fotogramas muestreados de una cámara de calle y devuelve una frase corta sobre vehículos, peatones y actividad, adecuada para paneles de operaciones o registros de incidencias.
- Análisis de actividad peatonal y vehicular en ciudad inteligente: integrado en un pipeline de DLStreamer, permite etiquetar segmentos de vídeo con descripciones textuales para su posterior búsqueda o auditoría.
- Revisión de escenas por operadores: las descripciones generadas se superponen al vídeo de salida, de modo que un operador humano puede revisar rápidamente qué ha detectado el sistema en cada fotograma clave.
- Procesamiento en el borde sin GPU de datacenter: al ejecutarse con OpenVINO en CPU o GPU Intel, encaja en despliegues donde no hay aceleradores NVIDIA y se prioriza la huella de memoria reducida que ofrece INT4.
- Enriquecimiento de metadatos de vídeo: los captions generados pueden almacenarse como metadatos junto a los clips para indexación, búsqueda por lenguaje natural o generación de informes periódicos.
- Prototipado de pipelines de visión-lenguaje: los scripts de ejemplo (`openvino_sample.py` y el sample de DLStreamer) sirven como base para validar latencia y calidad antes de escalar a producción.
- Transcripción descriptiva de clips cortos: el fixture de prueba de 6,923 segundos a 59,94 fps muestra el uso previsto en clips breves con muestreo de fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: la descarga del modelo es de aproximadamente 15,97 GB; la inferencia requiere memoria adicional para activaciones y cachés.
- Hardware validado: solo CPU en la pila indicada (OpenVINO GenAI 2026.5.0.0.dev20261030, OpenVINO Runtime 2026.5.0.dev20261030, DLStreamer 2026.3.0 RC1); el soporte de GPU depende de la memoria disponible.
- NPU: no soportado explícitamente.
- GPU recomendadas: no disponible; la model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No disponible; depende de la memoria disponible y del backend, y el modelo es de 27B en INT4 con overhead de activaciones.
- Opciones de despliegue: OpenVINO GenAI, Intel DLStreamer (plugin `gvagenai`), Python 3.11 o superior, OpenVINO Tokenizers, GStreamer Python bindings, OpenCV, NumPy y FFmpeg.
- Latencia y throughput: no disponible; el ejemplo ejecuta inferencia voraz sobre fotogramas cada 300 frames, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de contexto de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas: solo inglés según la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Modo *thinking* por defecto: en DLStreamer, la propiedad `gvagenai` no expone la opción de desactivar el razonamiento, por lo que los metadatos pueden contener texto de razonamiento o salida parcial en lugar de un caption final; en la pila validada, los metadatos contenían razonamiento y no un caption definitivo.
- Diferencias entre muestras: el overlay del ejemplo de DLStreamer puede diferir del caption directo de OpenVINO por esa razón.
- Riesgo de alucinación: no cuantificado en la información disponible; como VLM generativo, puede describir elementos no presentes en la escena.
- Sesgos: no documentados en la información proporcionada.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B de Alibaba, que la model card enlaza pero no detalla.
- Memoria: 27B en INT4 con overhead de activaciones y cachés exige planificación de memoria; el soporte de GPU no está validado y depende de la memoria disponible.
- Madurez del stack: las versiones de OpenVINO GenAI y Runtime son builds de desarrollo (`dev20261030`) y DLStreamer es RC1, lo que implica riesgo de cambios de API.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni métricas de captioning que permitan evaluar la calidad objetivamente.
- Fecha de creación del repositorio: 2026-11-18, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/qwen3.8-27B-int4-ov
- Modelo base Qwen3.8-27B (Alibaba): https://huggingface.co/Qwen/Qwen3.8-27B (referenciado como `qwen-base` en la model card)
- OpenVINO IR del modelo base: referenciado como `qwen-ir` en la model card
- Script de descarga y cuantización: https://huggingface.co/open-edge-platform/qwen3.8-27B-int4-ov/resolve/main/export_and_quantize.sh
- Sample de OpenVINO: `openvino_sample.py` en el repositorio
- Configuración nativa RC1: referenciada como `native-rc1` en la model card
- Matriz de soporte de dispositivos: referenciada como `device-matrix` en la model card
- Vídeo de prueba: `test_video.mp4`, descargado desde Pexels (fuente no especificada en detalle)
