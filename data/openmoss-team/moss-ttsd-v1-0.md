# OpenMOSS-Team/MOSS-TTSD-v1.0

## Resumen

MOSS-TTSD-v1.0 es un modelo de texto a voz (TTS) orientado a la generación de diálogos largos y expresivos con múltiples hablantes, desarrollado por OpenMOSS-Team (MOSS AI / OpenMOSS). Forma parte de la familia MOSS-TTS, que descompone el flujo de producción de audio en cinco modelos especializados; TTSD se posiciona como el motor de diálogo conversacional a escala para pódcasts, audiolibros, doblaje y entretenimiento.

El modelo resuelve el problema de sintetizar conversaciones multi-turno con continuidad en duraciones largas, control de turnos de palabra y clonación de voz zero-shot a partir de referencias cortas. Su relevancia actual radica en que combina fidelidad acústica, expresividad y estabilidad temporal, capacidades que hasta hace poco requerían pipelines propietarios.

Arquitectura MossTTSDelay con aproximadamente 8.355 millones de parámetros (8B), pesos en safetensors, licencia Apache 2.0 y soporte declarado para 20 idiomas. El tokenizador y la arquitectura subyacente se describen en el paper MOSS-Audio-Tokenizer (arXiv:2602.10934).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossTTSDelay |
| Parametros totales | 8.355.492.864 (~8B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr (20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-TTSD-v1.0 emplea la arquitectura MossTTSDelay, un diseño autorregresivo de generación de tokens de audio con esquema de retardo (delay), orientado a la síntesis de diálogo multi-hablante. El modelo se apoya en el tokenizador de audio descrito en el paper MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models (arXiv:2602.10934), que define la representación discreta del audio sobre la que opera el generador.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se documenta su orientación a producción: continuidad en duraciones largas, control de turnos de palabra y clonación de voz zero-shot a partir de referencias breves, lo que implica datos de diálogo multi-hablante y referencias de hablante en el pipeline de entrenamiento, aunque las cifras concretas no están publicadas en la información proporcionada.

## Capacidades

- Síntesis de voz de alta fidelidad y expresividad para diálogo multi-hablante.
- Generación de audio conversacional de larga duración con continuidad y coherencia entre turnos.
- Control de turnos de palabra (turn-taking) en conversaciones.
- Clonación de voz zero-shot a partir de referencias cortas.
- Síntesis multilingüe en 20 idiomas, con soporte de code-switching según la descripción de la familia.
- Orientado a pódcasts, audiolibros, comentarios, doblaje y diálogo de entretenimiento.
- Integración con la librería transformers (pipeline text-to-speech, feature-extraction) y código personalizado (custom_code).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de las referencias de voz para clonación.

## Casos de uso

- Producción de pódcasts: el modelo genera diálogos multi-hablante con turnos de palabra controlados y continuidad en episodios largos, lo que permite sintetizar conversaciones completas sin cortes de coherencia entre segmentos.
- Audiolibros con varios personajes: la clonación zero-shot desde referencias cortas permite asignar una voz distinta a cada personaje y mantenerla estable a lo largo de capítulos extensos.
- Doblaje y localización: con 20 idiomas y soporte de code-switching, se puede generar pistas de voz en varios idiomas para el mismo contenido conservando el timbre de referencia.
- Comentario deportivo y narración: el control de expresividad y de turnos encaja con retransmisiones donde alternan voces y estilos.
- Diálogo para entretenimiento y videojuegos: generación de conversaciones entre personajes con voces diferenciadas a partir de referencias breves, útil para prototipado rápido de contenido.
- Producción de contenido accesible: conversión de guiones de diálogo a audio para versiones habladas de artículos, cursos o material formativo multi-voz.
- Investigación en TTS conversacional: al ser Apache 2.0 y pesos safetensors, sirve como base para experimentación y ajuste fino en síntesis de diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~8B parámetros en safetensors (repo de 16,7 GB), la inferencia en precisión nativa requiere del orden de 16-20 GB de VRAM; en cuantizaciones de 8 bits o 4 bits se reduciría aproximadamente a 8-10 GB y 4-6 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar GPU de datacenter (A100, H100) para precisión completa y GPU consumer de gama alta (RTX 4090, 24 GB) para precisión nativa o cuantizada.
- ¿Cabe en GPU consumer? Probable en RTX 4090 (24 GB) en precisión nativa según el tamaño de pesos; en GPUs de 8-16 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada, con custom_code); no se confirman en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MOSS-TTSD-v1.0 | ~8B | no disponible | 20 | Apache 2.0 | Diálogo multi-hablante de larga duración |
| MOSS-TTS | 8B | no disponible | 20 | Apache 2.0 | TTS base con clonación zero-shot |
| MOSS-TTS-Local-Transformer | 1,7B | no disponible | 20 | Apache 2.0 | TTS ligero |
| MOSS-TTS-Realtime | 1,7B | no disponible | 20 | Apache 2.0 | TTS en streaming multi-turno |

La comparación con modelos de otros desarrolladores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se documentan en la información disponible sesgos específicos del modelo; al ser un sistema de voz, es esperable que herede sesgos acústicos y de hablante de los datos de entrenamiento.
- Riesgo de alucinación acústica: posible generación de prosodia, pausas o contenido no solicitado en textos ambiguos; no cuantificado por el autor.
- Longitud de contexto no publicada, lo que dificulta planificar la estabilidad en síntesis de duraciones extremas.
- La cobertura de 20 idiomas no implica calidad homogénea; no se aportan métricas por idioma.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de las referencias de voz empleadas para clonación (derechos de imagen y voz).
- Requisitos de hardware y latencia no confirmados; el despliegue en producción exige validación propia.
- Dependencia de custom_code en transformers, lo que puede complicar la portabilidad a otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v1.0
- Paper (MOSS-Audio-Tokenizer): https://huggingface.co/papers/2602.10934
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Model card TTSD: https://github.com/OpenMOSS/MOSS-TTS/blob/main/docs/moss_ttsd_model_card.md
- Web de MOSS AI: https://www.moss-ai.com/models/moss-ttsd
- Documentación de API: https://platform.moss.cn/en/docs/scenarios/dialogue
- Colección en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- X/Twitter: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
