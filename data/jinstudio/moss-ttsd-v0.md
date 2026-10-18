# Jinstudio/MOSS-TTSD-v0

## Resumen

MOSS-TTSD-v0 es un modelo de síntesis de voz conversacional (text-to-speech para diálogos) publicado en HuggingFace por el usuario Jinstudio. Convierte guiones de diálogo entre dos hablantes en habla conversacional expresiva y natural, con soporte de clonación de voz zero-shot para ambos interlocutores y generación de hasta 960 segundos de audio en una sola sesión. Está pensado, según su model card, para producción de pódcasts con IA y doblaje de conversaciones.

El modelo se construye sobre Qwen/Qwen3-1.7B-Base como modelo de lenguaje base, al que se añade un códec neural de audio semántico-acústico unificado; el repositorio declara 2.049.551.360 parámetros totales en safetensors (unos 2,05 mil millones) y un tamaño de 4,1 GB. Es bilingüe chino-inglés y se distribuye con licencia Apache 2.0, lo que permite uso comercial según el autor.

Es relevante porque combina un LLM abierto de tamaño contenido con generación de audio de formato largo, un patrón poco habitual en modelos TTS abiertos. Ahora bien, se trata de una versión v0 con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada más allá de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLM autorregresivo (Qwen3-1.7B-Base) con códec neural de audio semántico-acústico unificado para TTS |
| Parámetros totales | 2.049.551.360 (2,05 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card indica generación de hasta 960 s de audio, no longitud de contexto en tokens) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La model card describe MOSS-TTSD como un sistema construido sobre tres piezas: un códec neural de audio semántico-acústico unificado, un modelo de lenguaje preentrenado de gran tamaño y un esquema de entrenamiento sobre datos de voz. En este repositorio el LLM base es Qwen3-1.7B-Base, afinado para la tarea; el códec convierte el audio en tokens discretos que el modelo predice de forma autorregresiva y luego reconstruye como waveform. No se especifica en la información disponible el número exacto de capas, dimensión oculta ni la configuración del códec.

El entrenamiento combina, según el autor, millones de horas de datos TTS y 400.000 horas de habla conversacional sintética y real. La baja tasa de bits del códec y optimizaciones del marco de entrenamiento permiten la generación de formato largo (hasta 960 s) en una sola sesión. No se detalla en la información proporcionada si hubo etapas de RLHF, DPO u otro alineamiento posterior, ni la composición exacta del dataset ni su procedencia.

## Capacidades

- Síntesis de diálogo entre dos hablantes a partir de un guion, con cambio de turno de palabra y prosodia conversacional.
- Clonación de voz zero-shot para dos interlocutores a partir de audio de referencia.
- Generación de audio de formato largo: hasta 960 segundos en una única sesión.
- Bilingüe: chino e inglés, con generación expresiva en ambos idiomas según la model card.
- Producción de habla con prosodia conversacional natural orientada a pódcast y contenido narrado.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento (thinking); es un modelo especializado en TTS.
- No se documentan capacidades de visión, audio de entrada más allá de la referencia de voz para clonación, ni otros idiomas distintos del chino y el inglés.

## Casos de uso

- Producción de pódcasts con IA: el modelo recibe un guion de dos locutores y genera un episodio completo de hasta 960 segundos por sesión, con voces clonadas de los presentadores y turnos de palabra naturales; evita tener que encadenar fragmentos cortos y unir audio a posteriori.
- Doblaje de contenido conversacional: entrevistas, mesas redondas o diálogos de ficción traducidos del chino al inglés (o viceversa) pueden resintetizarse manteniendo la identidad de cada voz mediante clonación zero-shot.
- Audiolibros dialogados y ficción sonora: los guiones con dos personajes se convierten directamente en escenas habladas, con referencias de voz distintas por personaje y sin necesidad de entrenamiento adicional.
- Prototipado rápido de asistentes de voz: un equipo puede validar el flujo conversacional de un producto (guion, turnos, prosodia) antes de invertir en grabaciones con actores de voz.
- Localización de material formativo: cursos y tutoriales con dos formadores pueden regenerarse en inglés o chino reutilizando las voces originales clonadas, manteniendo coherencia entre módulos.
- Generación de contenido para redes y marketing: spots con diálogo entre dos personajes producidos por lotes desde plantillas de guion, con coste marginal bajo al ser un modelo abierto de 2,05 B de parámetros.
- Accesibilidad y lectura de diálogos: conversión de guiones y transcripciones de dos hablantes en audio escuchable, útil para revisión de contenido antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, similitud de hablante, etc.) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 4,1 GB solo para pesos; con caché KV, códec y buffers de audio, una estimación razonable es de 6 a 8 GB. Estimación propia a partir del número de parámetros, no confirmada por el autor.
- En cuantización INT8 la huella de pesos bajaría a unos 2,5 GB y en INT4 a unos 1,3 GB, pero no se documentan cuantizaciones disponibles ni su calidad para este modelo.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 con margen amplio en BF16.
- GPU de datacenter (A100, H100, L40S) no son necesarias para una sola petición, pero sí útiles para servir muchos flujos concurrentes.
- Opciones de despliegue: no se documentan en la información proporcionada (no se confirma soporte de vLLM, TGI, llama.cpp ni Ollama; al ser un modelo multimodal con códec de audio, lo habitual sería PyTorch/Transformers con código específico del proyecto).
- Latencia y throughput: no disponibles. La generación de 960 s de audio en una sola sesión implica una secuencia autorregresiva larga y, previsiblemente, tiempos de generación elevados, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos TTS comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa rigurosa. La única referencia verificable es el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jinstudio/MOSS-TTSD-v0 | 2,05 B (total, incluye códec) | No disponible | Texto a voz de diálogo (zh/en) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-1.7B-Base | 1,7 B (según denominación del modelo) | No disponible en la información proporcionada | LLM de texto | No indicada en la información | HuggingFace (modelo base) |
| Otros sistemas TTS abiertos | No disponible | No disponible | Texto a voz | No disponible | No disponible |

## Limitaciones y advertencias

- Versión v0 con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Ausencia total de benchmarks: no se puede evaluar calidad de síntesis, naturalidad (MOS), inteligibilidad (WER) ni similitud de hablante clonada.
- Solo chino e inglés; no hay soporte declarado de castellano ni de otros idiomas.
- No se documenta la longitud de contexto en tokens ni cómo se gestionan guiones largos más allá del límite de 960 s de audio generado.
- Riesgo de alucinación acústica y de desviaciones de prosodia en guiones con marcas o guiones mal formateados; no cuantificado por el autor.
- Clonación de voz: implica riesgos claros de suplantación de identidad y deepfakes. Es necesario contar con consentimiento explícito de las personas cuya voz se clona y cumplir la normativa aplicable (RGPD y el Reglamento europeo de IA entre otras).
- Procedencia de los datos de entrenamiento no detallada (millones de horas de TTS y 400.000 horas de habla conversacional sin especificar fuentes ni filtros), lo que dificulta evaluar sesgos de género, acento o registro.
- El autor indicado es un usuario individual (Jinstudio) y no se dispone de información que confirme la relación de este repositorio con el proyecto MOSS original; conviene verificar la integridad de los pesos antes de usarlos en producción.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre derechos de las voces clonadas y del contenido generado recae en quien despliega el modelo.
- Sin información sobre latencia, throughput ni soporte en motores de inferencia habituales, la planificación de capacidad en producción es especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinstudio/MOSS-TTSD-v0
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a wikis y foros del mod Calamity de Terraria y no guardan relación con MOSS-TTSD.
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
