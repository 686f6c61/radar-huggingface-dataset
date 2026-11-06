# bear7011/streaming-vad-decision-adapters

## Resumen

`bear7011/streaming-vad-decision-adapters` es un repositorio de pesos (adaptadores LoRA y pesos derivados) asociado al artículo *Knows the Video, Not the Moment: Temporal Localisation Is the Missing Capability of Streaming Video Anomaly Detection*, presentado como envío a CVPR 2027. No se trata de un modelo generativo de propósito general, sino de un conjunto de adaptadores PEFT que se montan sobre backbones multimodales (d3-nano 2.2B, d3-flash 8.4B, d3 27B, Clef-Flash 9B de Cloudflare y Qwen3.5-2B/9B) para realizar detección de anomalías en vídeo en streaming (VAD, video anomaly detection) sobre los conjuntos UCF-Crime y XD-Violence.

El problema que aborda es la localización temporal: según el autor, los modelos de VAD en streaming detectan que hay una anomalía pero fallan al determinar *cuándo* ocurre. Los adaptadores LoRA (rango 64, alpha 128, aplicados a todas las proyecciones del modelo de lenguaje del backbone) se combinan con una cabeza de lectura específica: un read-out de 255 códigos (`readout.safetensors`, variante d3) o una cabeza de esquema conjunta (`head.safetensors`, variante Clef-Flash), junto con un fichero de calibración de temperatura ajustada sobre vídeos de entrenamiento reservados.

El repositorio tiene 21 GB y contiene únicamente los pesos que no caben en el repositorio de código (github.com/Taide2026/system-one-streaming-vlm), que aloja configuraciones, puntuaciones por ventana y scripts de análisis. Está publicado bajo licencia Apache-2.0 y registra 0 descargas y 0 likes en el momento de la consulta. Es relevante para investigadores en visión por computador y vídeo que quieran reproducir o extender los experimentos del artículo sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre backbones VLM transformer: d3-nano 2.2B, d3-flash 8.4B, d3 27B, Clef-Flash 9B, Qwen3.5-2B/9B |
| Parametros totales | No disponible (depende del backbone; backbones de 2.2B, 8.4B, 9B y 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en float32 para cabezas de lectura; adaptadores LoRA sin cuantizacion especificada) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT LoRA y cabezas de lectura); configuracion YAML/JSON |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: son adaptadores LoRA de rango 64 y alpha 128 insertados en todas las proyecciones del modelo de lenguaje de cada backbone, más una cabeza de decisión específica por variante (read-out de 255 códigos para d3 o cabeza de esquema conjunta para Clef-Flash). La inferencia fusiona el adaptador al cargar el backbone y no modifica el pipeline de inferencia original. Los runs con foveación condicional requieren una configuración de entrada específica (`input_form: {name: foveated, frac: 0.333, upscale: 2, max_area: 0.045}`).

El entrenamiento usa los vídeos de entrenamiento de UCF-Crime y XD-Violence con tiempos de evento de HIVAU-70k; el autor indica explícitamente que no se leyó ningún vídeo de test. Las recetas incluyen fine-tuning mono-tarea sobre la pregunta V1 (etiquetas duras o suaves), mezclas multi-tarea (50% cobertura suave V1, 25% de 14 clases, 25% de replay de texto), anclaje KL al modelo base congelado, pares DPO, replay de vídeo con clips de UCF101, ponderación x3 de ventanas con etiqueta 0 en vídeos anómalos (sonda de localización) y variantes de foveación condicional con controles (negativos duros, recorte central, puerta del modelo, sobremuestreo de fotograma completo). También hay pesos derivados sin entrenamiento: WiSE-FT (`wise_a{25,5,75}`, `wisefov2_a{25,5,75}`), interpolación `fovdial_a{25,5,75}` y DARE (`dare*`). Cada run incluye una temperatura de calibración ajustada sobre vídeos reservados.

## Capacidades

- Detección de anomalías en vídeo en streaming sobre UCF-Crime y XD-Violence.
- Localización temporal de eventos anómalos (capacidad central que el artículo identifica como ausente en los modelos previos).
- Clasificación multi-etiqueta de 14 clases en la mezcla multi-tarea.
- Foveación condicional de la entrada (procesamiento de una región concreta con sobremuestreo) para reducir cómputo y enfocar la atención.
- Aprendizaje por adaptadores: los pesos se pueden fusionar sobre distintos backbones (d3-nano, d3-flash, d3, Clef-Flash, Qwen3.5-2B/9B).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión general, audio: no disponible (el modelo trabaja sobre vídeo, no se documentan otras modalidades).

## Casos de uso

- Investigación en localización temporal de anomalías: cargar un run concreto (`floor_d3nano_c`, por ejemplo) en la configuración de evaluación del repositorio de código para reproducir las métricas del artículo y comparar recetas (KL, DPO, foveación).
- Vigilancia y seguridad en streaming: el adaptador sobre d3-nano 2.2B permite desplegar detección de anomalías con requisitos de cómputo bajos y una cabeza de decisión calibrada por temperatura para umbralizar alertas.
- Análisis forense de vídeo: usar la sonda de localización (`floor_d3nano_c_w3`, que pondera ventanas con etiqueta 0 en vídeos anómalos) para afinar el instante del evento en grabaciones largas.
- Evaluación comparativa de backbones: los mismos adaptadores se ofrecen sobre d3-nano, d3-flash, d3 27B, Clef-Flash y Qwen3.5, lo que permite medir el efecto del tamaño y la familia del backbone en la localización temporal.
- Investigación en eficiencia: los runs de foveación condicional (`fov2_*`) y sus controles permiten estudiar el compromiso entre área procesada, sobremuestreo y precisión de detección.
- Estudio de métodos de fusión de pesos: los pesos derivados WiSE-FT, DARE e interpolación (`wise_a25`, `dare*`, `fovdial_a25`) sirven para analizar técnicas de merging sin reentrenamiento.
- Reentrenamiento y ablaciones: las configuraciones YAML y `run.json` de cada carpeta permiten replicar recetas con nuevos datos o hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las puntuaciones por ventana y a los scripts de análisis del repositorio de código (github.com/Taide2026/system-one-streaming-vlm), pero no incluye cifras en el propio repositorio de pesos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, los backbones van de 2.2B (d3-nano) a 27B (d3), por lo que la inferencia en float16 requiere aproximadamente 4-6 GB para el de 2.2B, 17-19 GB para el de 8.4B/9B y 54-60 GB para el de 27B, sin contar el procesamiento de vídeo.
- GPU recomendadas: no especificadas por el autor. Para el backbone de 27B se necesitaría A100 80 GB o H100; para los de 8-9B, una RTX 4090 (24 GB) o A100 40 GB; para el de 2.2B, GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: probablemente sí para d3-nano 2.2B y Qwen3.5-2B; ajustado para los de 8-9B en una RTX 4090; no para el de 27B.
- Opciones de despliegue: el autor menciona `vllm-sr` para la familia d3; la fusión de adaptadores se hace en carga con PEFT. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| streaming-vad-decision-adapters (este) | Adaptadores sobre backbones de 2.2B a 27B | No disponible | VAD en streaming con localización temporal | Apache-2.0 | Hugging Face (21 GB) |
| d3-nano / d3-flash / d3 (backbones base) | 2.2B / 8.4B / 27B | No disponible | VLM general | No disponible en la informacion | Referenciados por el autor |
| Clef-Flash (Cloudflare) | 9B | No disponible | VLM general | No disponible en la informacion | Referenciado por el autor |
| Qwen3.5-2B / 9B | 2B / 9B | No disponible | VLM general | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un repositorio de pesos de investigación, no un modelo autónomo: sin el código de github.com/Taide2026/system-one-streaming-vlm no se puede ejecutar la evaluación.
- Los resultados del artículo corresponden a un envío a CVPR 2027 y no han pasado revisión por pares en el momento de la publicación.
- Entrenado solo con vídeos de entrenamiento de UCF-Crime y XD-Violence con tiempos de HIVAU-70k; la generalización a otros dominios de vídeo no está demostrada.
- Riesgo de sesgo de dominio: los conjuntos de vigilancia tienen distribuciones demográficas y de escena concretas que pueden trasladarse al modelo.
- Riesgo de alucinación en la localización temporal: la propia motivación del artículo es que los modelos predicen mal el instante del evento; la calibración de temperatura mitiga pero no elimina este problema.
- Idiomas soportados no documentados; el backbone Qwen3.5 es multilingüe, pero la tarea es de vídeo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las licencias de los backbones base (d3, Clef-Flash) no se detallan en la información disponible y deben verificarse por separado.
- El tamaño del repositorio (21 GB) y la ausencia de cuantizaciones publicadas dificultan el despliegue en entornos con recursos limitados.
- No hay métricas de latencia ni throughput publicadas, lo que impide evaluar su idoneidad para producción en tiempo real.

## Enlaces

- Repositorio de pesos: https://huggingface.co/bear7011/streaming-vad-decision-adapters
- Perfil del autor en Hugging Face: https://huggingface.co/bear7011
- Repositorio de código, configuraciones y scripts: https://github.com/Taide2026/system-one-streaming-vlm
- Artículo: *Knows the Video, Not the Moment: Temporal Localisation Is the Missing Capability of Streaming Video Anomaly Detection* (CVPR 2027 submission; sin enlace directo disponible en la información proporcionada)
