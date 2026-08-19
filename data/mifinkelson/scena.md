# mifinkelson/scena

## Resumen

ScenA es un modelo de generación de audio de texto a audio (text-to-audio) que crea escenas sonoras multi-hablante —diálogos, conversaciones y ambientes con efectos de sonido— a partir de un prompt textual, condicionado por uno o varios clips de audio de referencia que fijan las voces de los interlocutores. Ha sido desarrollado por un equipo de Lightricks y la Universidad de Tel Aviv (Michael Finkelson, Daniel Segal, Eitan Richardson, entre otros) y se publica bajo la licencia comunitaria LTX-2. El modelo se basa en la arquitectura LTX-2, un DiT (Diffusion Transformer) de flujo-matching con aproximadamente 4.000 millones de parámetros distribuidos en 48 capas, y es exclusivamente de audio: no procesa imagen ni vídeo.

La relevancia actual de ScenA radica en que resuelve un problema poco abordado: la generación de escenas de audio completas con múltiples voces consistentes, en lugar de clips de voz aislados o efectos sonoros independientes. El modelo emplea un codificador de texto Gemma-3-12B-IT (gated en Hugging Face) para interpretar el prompt y un VAE de audio con vocoder integrado para decodificar la señal. El repositorio incluye dos archivos safetensors (transformer + proyección de texto, y VAE de audio) que suman unos 8,9 GB, y el modelo se distribuye con una licencia que restringe el uso comercial sin autorización previa de Lightricks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching DiT basado en LTX-2, 48 capas |
| Parametros totales | ~4.000 millones (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (salida de audio hasta ~20 segundos; referencias de voz hasta ~20 s cada una) |
| Tipos de cuantizacion | No disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | LTX-2 Community License (licencia comunitaria, con restricciones de uso comercial) |
| Formato de pesos | safetensors (scena.safetensors ~8,2 GB; audio_vae.safetensors ~365 MB) |

## Arquitectura y entrenamiento

ScenA es un modelo de flujo-matching (flow matching) basado en un Diffusion Transformer (DiT) heredado de la arquitectura LTX-2. El modelo procesa el prompt de texto mediante el codificador Gemma-3-12B-IT, cuyos embeddings se proyectan a través de un módulo de proyección de texto incluido en `scena.safetensors`. Las voces de los hablantes se inyectan mediante clips de audio de referencia, que se codifican con el VAE de audio y se condicionan al transformer. El decodificador combina el VAE de audio con un vocoder para producir la señal de audio final, todo empaquetado en `audio_vae.safetensors` para que no sea necesario descargar el modelo LTX-2 completo.

El entrenamiento aborda explícitamente un modo de fallo denominado "Reference Shortcut": bajo esquemas de ruido estándar, el modelo podía identificar la referencia correcta por similitud acústica con el objetivo ruidoso, ignorando el prompt de texto para la asignación de hablantes. Para evitarlo, se empleó una distribución de timesteps sesgada hacia alto ruido, que fuerza al modelo a depender del prompt para asignar correctamente cada voz a su papel. El modelo fue entrenado en escenas de audio de hasta 20 segundos de duración, y la inferencia recomendada es de 60 pasos con una guía (guidance) de aproximadamente 7. No se han publicado detalles sobre el volumen total de tokens de audio ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Generación de escenas de audio multi-hablante: produce diálogos y conversaciones con varias voces diferenciadas, asignadas a partir de clips de referencia.
- Condicionamiento por referencia de voz: uno o más clips de audio (hasta ~20 s cada uno, mono o estéreo, cualquier frecuencia de muestreo) definen las voces de los interlocutores.
- Integración de efectos de sonido y ambiente: puede combinar diálogo con sonidos de fondo descritos en prosa (por ejemplo, "un gallo canta", "lluvia sobre un tejado de chapa").
- Control de estilo y expresividad mediante el prompt: el modelo interpreta acotaciones como "con un bostezo" o "se ríe" para matizar la interpretación de las voces.
- Duración de salida configurable: genera clips de hasta ~20 segundos, con control explícito del parámetro `duration`.
- Reproducibilidad mediante semilla: el parámetro `seed` permite obtener resultados deterministas para un mismo prompt y referencias.
- Soporte para múltiples hablantes en una misma escena: el prompt puede referirse a "the speaker from reference 1", "reference 2", etc., en cualquier orden y sin necesidad de turnos estrictos.
- Solo audio: no genera vídeo ni imágenes; el pipeline está especializado en señal de audio.

## Casos de uso

- Doblaje y localización de contenidos: un estudio puede generar diálogos de prueba con voces de actores concretos (usando sus clips de referencia) para evaluar guiones antes de grabar, sin necesidad de sesiones de estudio.
- Prototipado de asistentes de voz y agentes conversacionales: los desarrolladores pueden crear conversaciones de demostración con voces sintéticas consistentes para validar flujos de diálogo en productos de voz.
- Creación de podcasts y audiolibros dramatizados: permite generar escenas con narrador y personajes distintos, cada uno con una voz de referencia, reduciendo el coste de producción de contenido hablado.
- Generación de contenido para videojuegos: diseñadores de niveles pueden producir diálogos ambientales y conversaciones de NPC con voces diferenciadas para prototipos y pruebas de jugabilidad.
- Simulación de escenarios de atención al cliente: las empresas pueden generar conversaciones de ejemplo entre un cliente y un agente (con voces de referencia) para entrenar o evaluar sistemas de transcripción y análisis de sentimiento.
- Creación de material educativo y e-learning: permite generar lecciones narradas con varios personajes o voces (un profesor y un alumno, por ejemplo) a partir de guiones de texto, acelerando la producción de cursos.
- Postproducción de audio para cine y publicidad: los editores pueden generar escenas de ambiente con diálogo y efectos de sonido sincronizados para previsualizar mezclas antes de la grabación final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2606.19325) podría contener métricas objetivas, pero no se proporcionan en la model card ni en los resultados de búsqueda web. No se dispone de datos comparativos cuantitativos (MOS, SIM, WER, etc.) frente a otros modelos de text-to-audio.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información disponible. A partir del tamaño del modelo (~4B parámetros en el transformer más el codificador de texto Gemma-3-12B-IT), se pueden estimar las necesidades orientativas siguientes, marcadas como estimaciones y no como especificaciones oficiales:

- VRAM estimada para inferencia: el transformer de ~4B en precisión FP16 ocupa aproximadamente 8 GB, y el codificador Gemma-3-12B-IT en FP16 otros ~24 GB, por lo que la carga conjunta podría superar los 32 GB de VRAM. Una cuantización del codificador de texto (por ejemplo, a 8 bits) reduciría la demanda a unos 12-16 GB adicionales.
- GPU recomendadas: para ejecutar el modelo completo sin cuantizar, se necesitaría una GPU con 40 GB o más (A100 40GB, A6000, H100). Con cuantización del codificador de texto, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) podrían ser suficientes, aunque con riesgo de desbordamiento de memoria según la duración del clip.
- Compatibilidad con GPUs de consumo: es posible, pero ajustada; se recomienda cuantizar el codificador Gemma y reducir la duración de salida a menos de 10 segundos para evitar OOM.
- Opciones de despliegue: el repositorio oficial proporciona una pipeline Python (`ltx_pipelines.t2aud_ref_cond.T2AudRefCondPipeline`) que se instala con `pip install -e .` o `uv sync`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de audio y no un LLM estándar.
- Latencia y throughput: no disponibles. Con 60 pasos de inferencia y un modelo de 4B, se espera una generación de varios segundos por clip en GPUs de gama alta, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con modelos alternativos de text-to-audio multi-hablante. Como referencia cualitativa:

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScenA | Text-to-audio multi-hablante con condicionamiento por referencia | ~4B + Gemma-3-12B-IT | Hasta ~20 s de audio | LTX-2 Community License (uso comercial restringido) | Hugging Face, pesos safetensors |
| LTX-2 (base) | Modelo multimodal de audio (base sobre la que se construye ScenA) | No publicado | No publicado | LTX-2 Community License | Hugging Face |
| AudioLDM 2 (referencia general de text-to-audio) | Text-to-audio latente | ~700M | Hasta ~10-30 s | MIT (partes) | Hugging Face, código abierto |

La comparación con AudioLDM 2 es solo orientativa: ScenA se diferencia por el condicionamiento explícito de voces de referencia y la generación de escenas con múltiples hablantes, capacidades que AudioLDM 2 no ofrece de forma nativa. No se dispone de datos de rendimiento objetivo para una comparación rigurosa.

## Limitaciones y advertencias

- Idioma limitado: el modelo está entrenado principalmente en inglés; los prompts en otros idiomas pueden producir resultados degradados o incoherentes.
- Restricciones de licencia: la LTX-2 Community License restringe el uso comercial sin autorización previa de Lightricks. Es obligatorio revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- Dependencia del codificador de texto: se requiere el modelo Gemma-3-12B-IT, que está gated en Hugging Face y sujeto a sus propios términos de uso; no se puede ejecutar ScenA sin aceptar esas condiciones.
- Duración máxima de salida: el modelo fue entrenado en escenas de hasta 20 segundos; generar clips más largos puede producir artefactos o pérdida de coherencia.
- Calidad de las referencias: los clips de voz de referencia deben ser habla limpia de un solo hablante (hasta ~20 s). Referencias ruidosas, con música de fondo o con múltiples voces degradan la fidelidad de la voz generada.
- Riesgo de alucinación acústica: como todo modelo generativo, puede producir sonidos o entonaciones no especificadas en el prompt, especialmente en escenas complejas con muchos elementos simultáneos.
- Sesgos potenciales: no se han publicado evaluaciones de sesgo; las voces generadas pueden reflejar sesgos presentes en los datos de entrenamiento (acentos, género, tono).
- Sin benchmarks públicos: no hay métricas objetivas publicadas (MOS, SIM, etc.), lo que dificulta la evaluación comparativa rigurosa antes de adoptar el modelo.
- Reproducibilidad parcial: el uso de una semilla fija permite resultados deterministas, pero la variabilidad puede aparecer al cambiar la versión de la librería o el hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mifinkelson/scena
- Página del proyecto (con demos de audio): https://finmickey.github.io/scena/
- Repositorio de código: https://github.com/finmickey/scena
- Paper en arXiv: https://arxiv.org/abs/2606.19325
- Licencia LTX-2 Community License: https://huggingface.co/Lightricks/LTX-2/blob/main/LICENSE
