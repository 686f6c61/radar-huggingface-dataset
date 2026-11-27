# DICPlay/RusMind-4.5-Vspyshka

## Resumen

RusMind 4.5 · Vspyshka (Вспышка, "destello") es un modelo de lenguaje afinado por DICPlay a partir de `google/gemma-4-E4B-it`, publicado como versión preliminar de la generación 4.5 de su familia "Vspyshka". Está pensado para ejecución en dispositivo ("on-device"), sin conexión a internet, y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, LM Studio, Ollama y aplicaciones similares. El modelo declara 7.518.069.290 parámetros totales y un repositorio de 15,1 GB, coherente con un único fichero BF16.

El objetivo del modelo es cubrir tareas cotidianas de escritura, explicación, apoyo al estudio y generación de código en ruso e inglés, con un énfasis explícito en el conocimiento de la historia, la cultura, el derecho, las regiones y los pueblos de Rusia. El autor lo posiciona como "IA nacional" y lo acompaña de una licencia propia (`rusmind-license`) que restringe el uso y exige contacto directo para licencias de organización.

Es relevante ahora porque el propio autor ha publicado una versión posterior (4.7) que recomienda usar en lugar de esta 4.5, y porque la model card incluye comparativas en el benchmark MERA v2 que sitúan a la familia Vspyshka entre los modelos de menos de 10.000 millones de parámetros con mejores resultados en tareas en ruso. Esta ficha documenta la versión 4.5 tal como está publicada, señalando las limitaciones derivadas de su carácter preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E4B-it) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (único fichero publicado en el repositorio) |
| Idiomas soportados | ru, en |
| Licencia | rusmind-license (license_name: rusmind-license, license_link: LICENSE) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo es un afinamiento (finetune) de `google/gemma-4-E4B-it`, según los metadatos de Hugging Face (`base_model_relation: finetune`). El nombre del modelo base incluye el sufijo "E4B", pero la información disponible no permite confirmar si se trata de una arquitectura Mixture of Experts ni cuántos parámetros permanecen activos por token; por tanto, ese dato se marca como no disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset de afinamiento ni si se emplearon técnicas de RLHF o DPO.

La model card describe únicamente los cambios funcionales de la versión 4.5 respecto a versiones anteriores: mejor comprensión del ruso y de su cultura (refranes, humor, juegos de palabras, caracteres y particularidades regionales), mejor ortografía y puntuación, y mayor solidez con documentos largos e instrucciones de varios pasos. No se documentan innovaciones técnicas de inferencia como decodificación especulativa o atención lineal. El modelo se distribuye como un único fichero BF16 de 15,1 GB, lo que sugiere que el autor no ha publicado variantes cuantizadas en este repositorio.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con etiqueta `conversational` y pipeline `text-generation`.
- Escritura y corrección: la model card reporta un resultado de 0,719 en corrección de ortografía y puntuación dentro de MERA v2.
- Comprensión del ruso y su cultura: refranes y proverbios, humor, juegos de palabras, caracteres y particularidades regionales de Rusia.
- Conocimiento declarado de historia y cultura de Rusia, legislación, regiones y pueblos del país, y valores familiares tradicionales.
- Seguimiento de instrucciones complejas y de varios pasos, con mejora explícita en la versión 4.5.
- Trabajo con documentos largos (sin que se especifique la ventana de contexto exacta).
- Llamada a herramientas ("вызывает инструменты" / tool calling), según la model card.
- Ejecución en dispositivo y sin conexión, orientada a PC potentes, portátiles y teléfonos de gama alta.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito ("thinking mode") para esta versión.

## Casos de uso

- Asistente de escritura en ruso sin conexión: el modelo puede redactar, reescribir y corregir ortografía y puntuación en local, lo que encaja en entornos con requisitos de privacidad o sin acceso a red, aprovechando su resultado declarado de 0,719 en corrección dentro de MERA v2.
- Apoyo al estudio: explicación de conceptos y resolución de dudas en ruso e inglés para estudiantes, ejecutable en un portátil con LM Studio u Ollama sin depender de servicios en la nube.
- Consulta sobre historia, cultura y geografía de Rusia: dado el énfasis declarado del modelo en estas materias, resulta adecuado para aplicaciones educativas o divulgativas centradas en el contexto ruso, siempre con verificación humana de los datos.
- Generación y asistencia de código: la model card menciona ayuda con código; puede integrarse en editores o asistentes locales que invoquen el modelo vía llama.cpp, con la salvedad de que no se han publicado benchmarks de código para esta versión.
- Automatización con llamada a herramientas: al declarar soporte de tool calling, puede usarse como motor de agentes locales que consulten APIs o ejecuten acciones dentro de una aplicación de escritorio.
- Despliegue en dispositivos de gama alta sin red: aplicaciones móviles o de escritorio que empaqueten el GGUF y ofrezcan un asistente conversacional completamente offline, un escenario para el que el autor posiciona explícitamente el modelo.
- Procesamiento de documentos largos e instrucciones de varios pasos: tareas de resumen o transformación de textos extensos en flujos por lotes ejecutados en local, aunque la longitud de contexto no está documentada y debe validarse empíricamente.

## Benchmarks y rendimiento

La model card incluye resultados de MERA v2 para la versión 4.7, no para esta 4.5. El único dato asociado a la versión 4.5 en la información disponible es el 0,719 en corrección de ortografía y puntuación, que la model card presenta en el contexto de la familia 4.7. No se han publicado resultados de benchmarks específicos de la versión 4.5 en la información disponible.

Como referencia contextual, la model card ofrece la siguiente tabla de puntuación global en MERA v2 (correspondiente a la versión 4.7):

| Modelo | Parámetros | Puntuación MERA v2 |
|---|---|---|
| RusMind Vspyshka 4.7 | 7,5 mil millones | 0,191 |
| Qwen3.5-9B (Alibaba) | 9 mil millones | 0,186 |
| Gemma 4 E4B (Google) | 8 mil millones | 0,170 |
| RuadaptQwen3-32B | 32 mil millones | 0,163 |
| Zero-Mistral | 24 mil millones | 0,160 |
| T-lite (T-Bank) | 8 mil millones | 0,130 |

Estos valores no deben atribuirse a la versión 4.5 objeto de esta ficha.

## Requisitos de hardware

- El repositorio solo publica un fichero BF16 de 15,1 GB, por lo que la inferencia en precisión completa requiere al menos ~16 GB de VRAM o memoria unificada para cargar los pesos, más el espacio para el contexto y el estado de la KV cache.
- GPU recomendadas para BF16: A100, H100 o GPUs de consumo con 24 GB o más (RTX 3090, RTX 4090). En GPUs con menos VRAM sería necesario cuantizar el modelo, tarea que el autor sugiere realizar a partir del BF16 ("исследования и своё квантование").
- En tarjetas de consumo de gama media (8-16 GB) no cabe en BF16; habría que generar cuantizaciones GGUF (Q4, Q5, Q8) con llama.cpp, no incluidas en el repositorio.
- Opciones de despliegue declaradas: llama.cpp (`llama-cli -m RusMind-Vspyshka-4.5-BF16.gguf -cnv`), LM Studio, Ollama, PocketPal y otras aplicaciones compatibles con GGUF; también uso en navegador a través de rusmind.ru.
- No se publican datos de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Puntuación MERA v2 |
|---|---|---|---|---|---|
| RusMind 4.5 Vspyshka | 7,5 mil millones | no disponible | rusmind-license | GGUF | no disponible para 4.5 (0,191 en 4.7) |
| Gemma 4 E4B (Google) | ~8 mil millones | no disponible | licencia de Google (no detallada) | no disponible | 0,170 (4.7) |
| Qwen3.5-9B (Alibaba) | 9 mil millones | no disponible | no disponible | no disponible | 0,186 (4.7) |
| T-lite (T-Bank) | 8 mil millones | no disponible | no disponible | no disponible | 0,130 (4.7) |

La comparativa se limita a los datos que la model card aporta para la versión 4.7; no se dispone de información suficiente para comparar la versión 4.5 con alternativas en igualdad de condiciones. RusMind 4.7 Vspyshka se sitúa por delante de Gemma 4 E4B, Qwen3.5-9B y T-lite en MERA v2 según el autor, y por detrás de RusMind Sokol 4.7 (0,279).

## Limitaciones y advertencias

- Versión preliminar: el propio autor recomienda migrar a RusMind 4.7 · Vspyshka, por lo que esta 4.5 no recibirá necesariamente mantenimiento ni mejoras.
- Licencia `rusmind-license` con nombre propio y enlace a un fichero LICENSE: no es una licencia de código abierto estándar, y el uso comercial u organizativo requiere contactar con el autor (se ofrecen canales de Telegram y MAX). Debe revisarse el texto completo antes de cualquier despliegue en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta, especialmente en materias factuales como legislación, historia o datos regionales, donde la model card afirma un conocimiento profundo pero no aporta garantías de exactitud.
- Sesgos: el modelo declara explícitamente una orientación hacia la historia, cultura y "valores familiares tradicionales" de Rusia, lo que puede introducir sesgos culturales y de encuadre en sus respuestas; no se documentan evaluaciones de sesgo.
- Idiomas limitados a ruso e inglés; no se garantiza un comportamiento correcto en castellano u otras lenguas.
- Longitud de contexto no documentada: debe validarse empíricamente antes de usarlo con documentos largos.
- No se publican cuantizaciones en el repositorio; el único fichero es BF16 de 15,1 GB, lo que limita el despliegue en hardware de consumo sin trabajo adicional de cuantización.
- No hay benchmarks publicados específicos de la versión 4.5; las cifras de MERA v2 citadas corresponden a la 4.7 y no deben extrapolarse.
- Datos de rendimiento y de descargas de la model card son afirmaciones del autor; conviene contrastarlos con fuentes independientes antes de tomar decisiones de adopción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka
- Fichero BF16: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka/blob/main/RusMind-Vspyshka-4.5-BF16.gguf
- Repositorio de todas las versiones Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Versión posterior recomendada (4.7 Vspyshka): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Versión con modo de razonamiento (4.7 Sokol): https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Demo en navegador: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Contacto para licencias (Telegram): https://t.me/DanKirillin
- Contacto para licencias (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
