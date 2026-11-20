# neurarank/neuvy-avatar-ti2v

## Resumen

Neuvy-Avatar-TI2V es un modelo compacto de generación de vídeo desarrollado por neurarank, diseñado específicamente para la creación de avatares parlantes interactivos y vídeo social en formato 9:16 sobre Apple Silicon M4 con 24 GB de memoria unificada. Se presenta como un modelo fundacional unificado que integra autoconocimiento, procesamiento de habla y generación de vídeo en una única red neuronal, con un enfoque de inferencia en tiempo real y un modo cinematográfico de mayor calidad. El checkpoint publicado es una vista previa compacta de 11,50 millones de parámetros, lo que lo sitúa en la categoría de modelos ligeros orientados a despliegue en dispositivo (edge).

La relevancia del modelo reside en su propuesta de arquitectura híbrida: un flujo fundacional unificado, doce codificadores de representación interna (espaciotemporal, cinemático, iluminación, dinámica física y expresión), un modelo de mundo escénico de cinco niveles y un MoE consciente de la etapa temporal condicionado por el paso de difusión. Incorpora además un runtime de doble modo con un modo de streaming en tiempo real (TTFA inferior a 150 ms) y un modo de vídeo cinematográfico basado en flow matching continuo de 6 pasos con integrador Euler ODE.

El modelo está publicado bajo licencia Apache 2.0, con soporte declarado para inglés y vietnamita, y está etiquetado para tareas de text-to-video, image-to-video, talking-avatar y speech-to-speech. Su formato de pesos es safetensors y el repositorio ocupa 0,0 GB, coherente con el tamaño reducido del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal unificada con MoE consciente de etapa temporal (stage-aware MoE), flow matching continuo y codificadores de representación interna |
| Parametros totales | 11.503.307 (11,50 M) |
| Parametros activos | no disponible (el MoE usa 4 expertos locales con 2 expertos por token, pero no se publica el recuento activo) |
| Longitud de contexto | no disponible (dimensión de contexto 256 / 2048 según metadatos del checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (149 tensores) |

## Arquitectura y entrenamiento

El modelo se describe como un flujo fundacional unificado que combina autoconocimiento, procesamiento de habla y generación de vídeo en una sola red. Internamente incorpora doce codificadores de representación (espaciotemporal, cinemático, iluminación, dinámica física y expresión) y un modelo de mundo escénico de cinco niveles que desacopla la física, la envolvente de colisión y la lógica causal del mecanismo de atención. La capa de mezcla de expertos es un MoE disperso condicionado por el paso temporal, con 4 expertos locales y 2 expertos activos por token, junto con un experto compartido de tamaño intermedio 512.

La configuración del checkpoint indica `in_channels=48`, `out_channels=16`, `hidden_size=256`, 4 capas, 4 cabezas de atención, 2 cabezas KV, dimensión de cabeza 64 e `intermediate_size=512`. El runtime ofrece dos modos: streaming en tiempo real con TTFA inferior a 150 ms y vídeo cinematográfico mediante flow matching continuo de 6 pasos con Euler ODE. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video).
- Generación de avatares parlantes (talking-avatar) con sincronización de habla.
- Conversión de habla a habla (speech-to-speech) integrada en el mismo flujo que la generación visual.
- Procesamiento de habla y autoconocimiento dentro de la misma red unificada.
- Modo de streaming en tiempo real con latencia de primer audio inferior a 150 ms.
- Modo cinematográfico de mayor calidad mediante flow matching de 6 pasos.
- Soporte multilingüe limitado a inglés y vietnamita.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Avatares interactivos en tiempo real: el modo de streaming con TTFA inferior a 150 ms permite mantener conversaciones fluidas con un avatar generado, adecuado para asistentes virtuales en pantalla.
- Producción de vídeo social en formato 9:16: el modelo está diseñado para generar clips verticales optimizados para plataformas como TikTok o Reels, con el modo cinematográfico de 6 pasos.
- Generación de vídeo a partir de imagen para marketing: a partir de una fotografía de producto o persona se puede animar un clip corto con coherencia de iluminación y expresión gracias a los codificadores internos.
- Doblaje y localización speech-to-speech: la integración de habla y vídeo en un único flujo permite regenerar un avatar parlante en otro idioma (inglés o vietnamita) manteniendo la sincronización.
- Prototipado en dispositivo Apple Silicon: al caber en 24 GB de memoria unificada de un M4, permite desarrollar y probar pipelines de vídeo generativo sin GPU dedicada.
- Educación y formación: avatares parlantes que explican contenido en formato vertical para cursos cortos o píldoras formativas.
- Investigación en modelos de mundo escénico: la separación de física, colisión y lógica causal del attention facilita experimentos sobre coherencia física en vídeo generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo está diseñado para ejecutarse en 24 GB de memoria unificada de Apple Silicon M4.
- GPU recomendadas: Apple Silicon M4 (24 GB de memoria unificada) con aceleración MPS; no se documentan GPU NVIDIA.
- Cabe en GPU consumer: el objetivo declarado es Apple Silicon M4; no se especifica compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el módulo `S2SVideoModel` del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: TTFA inferior a 150 ms en modo streaming; el modo cinematográfico usa 6 pasos de flow matching, pero no se publica throughput ni tiempo por clip.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El checkpoint es una vista previa compacta de 11,50 M de parámetros y no se han publicado métricas que permitan una comparación rigurosa con alternativas de generación de vídeo o avatares parlantes.

## Limitaciones y advertencias

- El checkpoint publicado es una vista previa compacta de 11,50 M de parámetros; no representa necesariamente la calidad final del modelo completo.
- Solo se declaran idiomas inglés y vietnamita; no hay soporte documentado de castellano.
- No se han publicado datos de entrenamiento, benchmarks ni evaluación de sesgos.
- Riesgo de alucinación visual y de incoherencias físicas no cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria del funcionamiento del checkpoint.
- El despliegue está orientado a macOS con MPS; no se garantiza funcionamiento en otras plataformas.
- No se documentan mecanismos de tool calling ni de razonamiento agéntico, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/neurarank/neuvy-avatar-ti2v
