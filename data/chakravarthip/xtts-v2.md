# Chakravarthip/XTTS-v2

## Resumen

XTTS-v2 es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por Coqui que permite clonar una voz a partir de un único clip de audio de unos 6 segundos, sin necesidad de horas de datos de entrenamiento por hablante. La versión 2 añade húngaro y coreano respecto a XTTS-v1 (hasta 17 idiomas), mejora el acondicionamiento de hablante, permite usar múltiples referencias de voz e interpolar entre hablantes, y ofrece mejor prosodia y calidad de audio general. Genera audio a 24 kHz y soporta clonación entre idiomas, es decir, usar una voz de referencia en un idioma para sintetizar texto en otro.

La ficha que se documenta aquí corresponde al repositorio Chakravarthip/XTTS-v2, una copia del modelo base coqui/XTTS-v2 publicada en HuggingFace bajo la librería `coqui` y la etiqueta de pipeline `text-to-speech`. El repositorio ocupa 2,1 GB y no registra descargas ni "likes" en el momento de la consulta, por lo que debe tratarse como una réplica no verificada del modelo original más que como una versión oficial.

Su relevancia actual radica en que sigue siendo una de las referencias abiertas para clonación de voz zero-shot multilingüe con pocos segundos de referencia, un caso de uso con demanda creciente en localización de contenido, accesibilidad y generación de datos sintéticos. La contrapartida es su licencia Coqui Public Model License, que condiciona el uso comercial, y los riesgos éticos y legales asociados a la clonación de voz.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de voz con decodificación autorregresiva y acondicionamiento de hablante para clonación zero-shot (detalles completos en el paper arXiv:2406.04904) |
| Parametros totales | no disponible en la información proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de LLM; la clonación se realiza con un clip de referencia de audio de unos 6 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 17: inglés (en), español (es), francés (fr), alemán (de), italiano (it), portugués (pt), polaco (pl), turco (tr), ruso (ru), neerlandés (nl), checo (cs), árabe (ar), chino (zh-cn), japonés (ja), húngaro (hu), coreano (ko), hindi (hi) |
| Licencia | Coqui Public Model License (CPML), etiquetada como `license: other` |
| Formato de pesos | checkpoint nativo de Coqui TTS cargado con `load_checkpoint`; no se indican safetensors ni GGUF en la información disponible |
| Frecuencia de muestreo de salida | 24 kHz |
| Libreria / pipeline | `coqui`, pipeline `text-to-speech` |
| Tamano del repositorio | 2,1 GB |
| Modelo base | coqui/XTTS-v2 |

## Arquitectura y entrenamiento

XTTS-v2 es un sistema de síntesis de voz zero-shot: recibe texto y un clip de referencia de hablante, y produce audio en la voz de referencia. El modelo emplea decodificación autorregresiva sobre representaciones acústicas y un módulo de acondicionamiento de hablante que extrae el timbre a partir de la referencia. Respecto a XTTS-v1, la model card destaca mejoras arquitectónicas específicas en ese acondicionamiento de hablante, la posibilidad de combinar varias referencias de audio e interpolar entre voces, mejoras de estabilidad y una mejora general de prosodia y calidad. La descripción técnica completa, incluida la composición del dataset y el número de horas de entrenamiento, está en el paper asociado (arXiv:2406.04904) y no se detalla en la información proporcionada.

No se dispone de datos sobre el volumen de tokens de audio, la composición del corpus de entrenamiento ni sobre si se aplicaron etapas de ajuste por preferencias humanas (RLHF/DPO). Tampoco se documentan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal. Cualquier afirmación sobre estos puntos requeriría consultar el paper y la documentación oficial de Coqui TTS.

## Capacidades

- Síntesis de voz multilingüe en 17 idiomas desde una misma arquitectura y sin entrenamiento específico por idioma.
- Clonación de voz zero-shot a partir de un clip de unos 6 segundos, sin necesidad de horas de datos por hablante.
- Clonación entre idiomas: la voz de referencia puede pertenecer a un idioma distinto del texto sintetizado.
- Transferencia de emoción y estilo a través de la propia referencia de voz clonada.
- Uso de múltiples referencias de hablante con interpolación entre ellas (novedad de XTTS-v2 respecto a v1).
- Salida de audio a 24 kHz.
- Ajuste fino (fine-tuning) del modelo mediante la base de código de Coqui TTS.
- Integración con API de Python (`TTS.api`), interfaz de línea de comandos y carga directa del checkpoint con `Xtts`/`XttsConfig`.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes, visión ni audio de entrada, ya que no es un modelo de lenguaje.

## Casos de uso

- Doblaje y localización de vídeo: sintetizar la misma voz del actor original en los 17 idiomas soportados usando un clip de referencia, lo que permite mantener la identidad vocal en distintas versiones lingüísticas de un mismo contenido.
- Audiolibros y contenido narrativo: generar horas de audio con una voz consistente a partir de una única muestra de referencia, evitando el coste de contratar y dirigir una sesión de grabación por cada capítulo.
- Asistentes de voz personalizados: dotar a un asistente de una voz propia y estable, con la posibilidad de interpolar entre varias referencias para ajustar el timbre deseado.
- Accesibilidad: convertir texto en voz para personas con discapacidad visual o dificultades de lectura, incluyendo contenido en idiomas minorizados dentro del conjunto soportado (por ejemplo, checo o húngaro).
- Generación de datos sintéticos para entrenamiento: producir corpus de audio etiquetado para ajustar modelos de reconocimiento automático de voz (ASR) en idiomas o dominios con pocos datos reales.
- Prototipado de personajes en videojuegos y animación: generar voces provisionales para pruebas de guion y doblaje antes de la producción final.
- Sistemas de atención telefónica (IVR): locuciones dinámicas en varios idiomas con una voz corporativa unificada, generadas en tiempo de ejecución a partir de plantillas de texto.
- Preservación de voz con consentimiento explícito: reconstruir la voz de una persona que la ha perdido por motivos médicos, siempre que exista autorización verificable del titular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio consultado no incluye métricas objetivas (por ejemplo MOS, SMOS, WER del texto sintetizado o similitud de hablante) ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio ocupa 2,1 GB, por lo que los pesos en precisión completa ocupan aproximadamente ese orden de magnitud; conviene presupuestar VRAM adicional para cachés de atención y para el decodificador de audio.
- GPU recomendadas: no especificadas en la información proporcionada. La inferencia se puede acelerar con CUDA (`use_cuda true` en la CLI y `.to("cuda")` en la API).
- GPU de consumo: no confirmado en la información disponible; no se aportan requisitos mínimos de VRAM.
- Opciones de despliegue: Coqui TTS (API de Python y CLI), carga directa del checkpoint con `Xtts.init_from_config` y `load_checkpoint`, y servicio mediante el código de idiap/coqui-ai-TTS. No se documentan integraciones con vLLM, Ollama, TGI ni llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Al tratarse de una generación autorregresiva de audio, la latencia crece con la longitud del texto a sintetizar.

## Comparativa con modelos similares

| Modelo | Idiomas | Clonación de voz | Referencias múltiples | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chakravarthip/XTTS-v2 (este repositorio) | 17 | Sí, clip de ~6 s | Sí | Coqui Public Model License | HuggingFace, réplica del modelo base con 0 descargas |
| coqui/XTTS-v2 (modelo base) | 17 | Sí, clip de ~6 s | Sí | Coqui Public Model License | HuggingFace, repositorio oficial de referencia |
| XTTS-v1 | 15 (sin húngaro ni coreano) | Sí | No documentado en la información disponible | Coqui Public Model License | HuggingFace |
| Otros sistemas TTS zero-shot (Bark, Tortoise, VALL-E y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada únicamente permite comparar con garantías frente a XTTS-v1 y frente al modelo base coqui/XTTS-v2. Para el resto de alternativas no se dispone de datos verificables en esta búsqueda.

## Limitaciones y advertencias

- Licencia restrictiva: la Coqui Public Model License es una licencia "other" que no equivale a una licencia de código abierto permisiva; es imprescindible revisar sus términos antes de cualquier uso comercial. Es un punto crítico para producción.
- Riesgo de uso malicioso: la clonación de voz con 6 segundos de audio facilita deepfakes y suplantación de identidad. Es obligatorio obtener consentimiento explícito del hablante y cumplir la normativa aplicable sobre datos biométricos y voz.
- Repositorio no verificado: Chakravarthip/XTTS-v2 es una réplica del modelo base, con 0 descargas y 0 "likes", sin métricas ni validación publicada. Para producción conviene partir del repositorio oficial coqui/XTTS-v2.
- Ausencia de benchmarks: no hay datos objetivos de calidad (MOS, similitud de hablante, inteligibilidad) en la información disponible, por lo que la evaluación debe hacerse de forma empírica sobre el dominio concreto de uso.
- Calidad desigual entre idiomas: al ser un modelo multilingüe, es esperable un rendimiento heterogéneo entre los 17 idiomas, con mayor incertidumbre en los de menos recursos dentro del conjunto (por ejemplo hindi o checo). No se aportan datos que cuantifiquen esta diferencia.
- Longitud de la referencia limitada: la clonación depende de la calidad del clip de 6 segundos; audio con ruido, reverberación o varias voces degrada el resultado.
- Sin control fino de prosodia: no se documentan parámetros explícitos para controlar emociones o estilo más allá de lo que aporte la propia referencia.
- Latencia autorregresiva: la generación de audio largo no es instantánea y requiere planificación de recursos en despliegues con muchos usuarios concurrentes.
- Riesgo de alucinación acústica: en textos atípicos (símbolos, números, abreviaturas o nombres propios) puede producirse pronunciación incorrecta u omisión de fragmentos; requiere validación en el idioma objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chakravarthip/XTTS-v2
- Modelo base oficial: https://huggingface.co/coqui/XTTS-v2
- Paper: https://arxiv.org/abs/2406.04904
- Código fuente (Coqui TTS mantenido por idiap): https://github.com/idiap/coqui-ai-TTS
- Documentación, incluida la guía de entrenamiento de XTTS: https://coqui-tts.readthedocs.io/en/latest/models/xtts.html#training
- Discusiones y soporte: https://github.com/idiap/coqui-ai-TTS/discussions
- Comunidad en Discord: https://discord.gg/5eXr5seRrv
- Licencia Coqui Public Model License: https://tts-hub.github.io/cpml
- Historia de la CPML: https://web.archive.org/web/20240217095217/https://coqui.ai/blog/tts/cpml

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; el único resultado obtenido (https://sandro.rocks/tests/gpt-allowed-only.html) es una página de prueba de rastreo sin relación con XTTS-v2.
