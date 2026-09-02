# Harmansingh24k/voiceshield-replay-robust

## Resumen

El modelo `voiceshield-replay-robust` es un clasificador de audio basado en la arquitectura wav2vec2, desarrollado por Harmansingh24k como un fine-tune del modelo `Vansh180/deepfake-audio-wav2vec2`. Su propósito es la detección de audio sintético o manipulado, específicamente orientado a ataques de "replay" (reproducción de grabaciones) y suplantación de voz. Con 94,5 millones de parámetros, se trata de un modelo compacto que puede ejecutarse en entornos con recursos limitados.

El modelo se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones significativas. Aunque la model card no especifica el dataset de entrenamiento, los resultados de validación reportan una precisión del 90,91% y una pérdida de 0,2180. Su relevancia actual radica en el aumento de ataques de "vishing" (phishing por voz) que utilizan clonación de voz, como se documenta en recientes incidentes contra firmas financieras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (fine-tune de Vansh180/deepfake-audio-wav2vec2) |
| Parametros totales | 94.569.090 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, un transformer preentrenado de forma auto-supervisada para representaciones de audio. En este caso, se ha realizado un fine-tune para la tarea de clasificación de audio (detección de deepfakes). El entrenamiento se llevó a cabo durante 3 épocas con un tamaño de lote efectivo de 32 (tras acumulación de gradientes de 4 pasos), una tasa de aprendizaje de 3e-05 con scheduler lineal, y precisión mixta nativa (AMP). El dataset de entrenamiento no está especificado en la model card, lo que limita la reproducibilidad. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Clasificación de audio binaria: distingue entre audio genuino y audio manipulado o sintético (deepfake).
- Detección de ataques de replay: el nombre del modelo sugiere robustez frente a reproducciones de grabaciones.
- Procesamiento de señales de voz: al estar basado en wav2vec2, extrae representaciones de alto nivel del audio.
- Inferencia ligera: con ~95M parámetros, es adecuado para despliegue en tiempo real en dispositivos con recursos moderados.
- No se reportan capacidades adicionales como generación de texto, tool calling o soporte multilingüe.

## Casos de uso

- Verificación de identidad en banca telefónica: el modelo puede analizar la voz del cliente en tiempo real para detectar si se trata de una grabación o una voz sintética, reduciendo el fraude en operaciones de alto valor.
- Autenticación en centros de llamadas: integrado en sistemas de IVR, puede marcar llamadas sospechosas antes de que el agente interactúe, priorizando la revisión humana.
- Filtrado de contenido en plataformas de audio: para moderar subidas de voz clonada en redes sociales o servicios de mensajería, evitando la difusión de desinformación.
- Protección de ejecutivos contra vishing: como capa de seguridad en comunicaciones internas, alertando si un directivo recibe una llamada con voz sintetizada que suplanta a un colega.
- Auditoría forense de grabaciones: en investigaciones legales, para determinar si una evidencia de audio ha sido manipulada o es un deepfake.
- Sistemas de control de acceso por voz: en entornos corporativos, para validar que la persona que solicita acceso es real y no está usando una grabación.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,2180 |
| Accuracy (validacion) | 0,9091 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. La tabla de entrenamiento muestra una progresión de accuracy desde 0,8610 (época 1) hasta 0,9091 (época 3).

## Requisitos de hardware

- VRAM estimada: con 94,5M parámetros, en FP32 el modelo ocupa ~380 MB; en FP16 ~190 MB. La inferencia puede ejecutarse en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB (p. ej., NVIDIA GTX 1650, RTX 3050, o superiores). También es viable en CPU para inferencia por lotes.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama de entrada y en placas con iGPU (aunque con mayor latencia).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Inference Endpoints, o mediante librerías como vLLM (aunque no es óptimo para audio), o directamente con PyTorch y la pipeline de audio-classification. Para producción, se recomienda usar ONNX Runtime o TensorRT para optimizar la latencia.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño, se espera una latencia de decenas de milisegundos en GPU y de cientos de milisegundos en CPU para clips de audio de pocos segundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se sugiere comparar con otros clasificadores de deepfake audio basados en wav2vec2, como los disponibles en Hugging Face Hub, pero no se pueden aportar datos concretos sin referencias adicionales.

## Limitaciones y advertencias

- La precisión de validación es del 90,91%, lo que implica un 9% de errores; no es adecuado para aplicaciones de seguridad de alto riesgo sin supervisión humana.
- El dataset de entrenamiento es desconocido, lo que impide evaluar la generalización a distintos acentos, idiomas o condiciones de grabación.
- No se especifican los idiomas soportados; el modelo puede no funcionar bien con voces fuera del dominio de entrenamiento.
- No se han realizado pruebas de robustez frente a ataques adversarios o variaciones de ruido, a pesar del nombre "replay-robust".
- La licencia MIT permite uso comercial, pero el usuario es responsable de cumplir con las regulaciones de protección de datos y privacidad al procesar audio de terceros.
- El modelo se generó con un script automático de Hugging Face (generated_from_trainer), lo que sugiere que la model card no ha sido curada manualmente; falta documentación sobre limitaciones específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harmansingh24k/voiceshield-replay-robust
- Modelo base: https://huggingface.co/Vansh180/deepfake-audio-wav2vec2
- Repositorio VoiceShield (referencia contextual): https://github.com/Kaki-bhargav-ram/VoiceShield
- Repositorio VoiceShield AI (prototipo hackathon): https://github.com/AnjaniYadav1/voiceshield-ai
- Artículo sobre ataques de vishing con IA: https://cryptobriefing.com/ai-voice-phishing-attacks-wall-street/
