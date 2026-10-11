# DICPlay/RusMind-Momentum

## Resumen

RusMind-Momentum es un modelo de generación de texto publicado por DICPlay, un proyecto ruso que se presenta como "IA nacional". Se distribuye exclusivamente en formato GGUF y está pensado para ejecución local en el dispositivo, sin conexión a internet, en teléfonos y equipos de gama baja. Deriva del modelo base google/gemma-4-E2B-it, que DICPlay ha afinado con conjuntos de datos propios centrados en historia de Rusia, legislación de la Federación Rusa, cultura y geografía del país.

El repositorio funciona como archivo acumulativo de versiones: recoge la versión inicial 1.1 (7 de octubre de 2026) y la actual 3.2 (10 de octubre de 2026), cada una en tres niveles de cuantización (Lite, Q4_K_M y Q8_0). El modelo base tiene 4.647.450.147 parámetros según los datos de safetensors publicados, aunque la nomenclatura "E2B" del modelo original sugiere una arquitectura con parámetros efectivos reducidos. El repositorio ocupa 16,8 GB en total por acumular todas las versiones y cuantizaciones.

La relevancia del modelo es acotada: con 97 descargas y 0 "likes" en el momento de la consulta, se trata de un proyecto niche, orientado al público rusohablante y con licencia propia restrictiva para uso comercial. Su interés principal es como ejemplo de ajuste fino de un modelo Gemma pequeño para un dominio cultural y legal concreto, empaquetado para inferencia offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, basada en google/gemma-4-E2B-it (detalles especificos no disponibles) |
| Parametros totales | 4.647.450.147 (segun safetensors publicados) |
| Parametros activos | no disponible (el sufijo "E2B" del modelo base sugiere parametros efectivos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Lite (tabla de embeddings por capas a 3 bits, capas a 4 bits), Q4_K_M, Q8_0 |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | RusMind License (DICPlay), licencia propia de tipo "other" |
| Formato de pesos | GGUF (solo cuantizado; no se publican safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base google/gemma-4-E2B-it de Google, distribuido en formato GGUF para su uso con llama.cpp y programas compatibles. La model card indica que RusMind se entrenó "sobre un enorme volumen de datos" y después pasó por un ajuste adicional sobre conjuntos rusohablantes de DICPlay. No se especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Entre los datos de ajuste citados figuran: historia de Rusia desde la Rus de Kiev, legislación de la Federación Rusa con referencias a artículos, cultura (literatura, poesía clásica rusa, arte y tradiciones), los pueblos de Rusia y los 89 sujetos federales con sus capitales, valores tradicionales y la posición oficial rusa sobre acontecimientos nacionales e internacionales, en ruso y en inglés. Además de los conjuntos propios, se usaron las particiones de entrenamiento abiertas de MERA y MMLU-ru. La versión 3.2 se reentrenó en varios pasos sucesivos (2.7 → 2.8 → 3.1 → 3.2). El autor afirma que en la versión 1.1 se eliminaron las "fichas enciclopédicas" que provocaban que el modelo inventara hechos con seguridad.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con tono orientado a asistente.
- Conocimiento factual específico sobre historia de Rusia, legislación rusa, cultura y geografía (89 sujetos federales y sus capitales).
- Respuestas sobre la identidad del modelo y su creador ("quién te creó") de forma consistente en ambos idiomas.
- Ejercicios de rima y formato de respuesta corta a tareas concretas (introducidos en la versión 3.2).
- Ejecución totalmente offline, en el dispositivo, sin llamadas a red.
- Formato GGUF compatible con llama.cpp, LM Studio, Ollama y otros clientes.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistente offline en el móvil: el archivo Lite (2,5 GB) cabe en dispositivos con memoria limitada y permite consultas sin conexión, útil en entornos sin cobertura o para preservar privacidad.
- Consulta de historia y geografía de Rusia: el ajuste cubre cronología de eventos y los 89 sujetos federales con sus capitales, adecuado para material didáctico o de repaso.
- Apoyo en la consulta de legislación rusa: el modelo cita artículos y leyes, útil como primera aproximación documental (siempre con verificación profesional).
- Educación y ejercicios de rima o composición breve: la versión 3.2 incorpora práctica de rima y formato de respuesta corta, aplicable a talleres de escritura.
- Prácticas de conversación en ruso para estudiantes de inglés o viceversa: el modelo es bilingüe ru/en y funciona localmente.
- Despliegue en hardware antiguo o de gama baja: al ser un derivado de un modelo "E2B" cuantizado, encaja en PC modestos donde no caben modelos de mayor tamaño.
- Prototipado de aplicaciones de chat con llama.cpp: sirve como modelo de pruebas para pipelines de inferencia local antes de escalar a modelos mayores.
- Base para ajuste adicional sobre dominio ruso: su licencia permite investigación y evaluación, aunque no la redistribución de derivados sin contrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las particiones de test de MERA o MMLU-ru, pese a mencionar que esas particiones de test quedaron fuera del entrenamiento.

## Requisitos de hardware

- Vram estimada para inferencia (estimación a partir del tamaño de archivo, con overhead de contexto): Lite ~3 GB, Q4_K_M ~4,5 GB, Q8_0 ~6 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 6 GB o más de VRAM es suficiente en Q4_K_M; modelos tipo RTX 3060, RTX 4060 o superiores resultan holgados.
- Cabe en GPU de consumo: sí. La cuantización Lite (2,5 GB) y Q4_K_M (3,4 GB) están pensadas explícitamente para teléfonos y PC de gama baja.
- Opciones de despliegue: llama.cpp (comando `llama-cli -m ... -cnv`), LM Studio, Ollama y cualquier programa compatible con GGUF; también ejecución en navegador a través de rusmind.ru.
- Latencia y throughput estimados: no disponibles (no se publican cifras).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind-Momentum | 4,65 B | no disponible | GGUF | RusMind License (comercial solo con contrato) | HuggingFace, rusmind.ru |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | safetensors y otros | Apache 2.0 | HuggingFace |
| RusMind-Vspyshka (misma familia) | no disponible | no disponible | no disponible (familia GGUF) | RusMind License | HuggingFace |
| RusMind-Znanie (misma familia) | no disponible | no disponible | no disponible | RusMind License | HuggingFace, nube |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación reconocido por el propio autor: la model card advierte que "RusMind puede equivocarse" y recomienda verificar la información importante.
- Las versiones 1.1 y anteriores confundían hechos históricos y apenas mantenían la rima; el autor indica que estos problemas se corrigieron en la 3.2. Las versiones antiguas se conservan solo como archivo histórico y no deberían usarse en producción.
- Las respuestas sobre temas médicos, jurídicos y financieros son de carácter meramente informativo y no sustituyen a un profesional.
- La licencia RusMind (DICPlay) solo permite uso gratuito para fines personales, no comerciales, de investigación y evaluación. Se prohíben expresamente el uso comercial, la reventa, la redistribución de versiones modificadas o reentrenadas y la integración en productos sin un contrato escrito con DICPlay.
- El modelo se entrega "tal cual", sin garantías.
- Cobertura lingüística limitada a ruso e inglés; no se declaran otros idiomas.
- Sesgo temático evidente: el ajuste se centra en historia, legislación, cultura y la "posición oficial" rusa, lo que puede introducir un sesgo de encuadre en temas políticos e históricos. Conviene tenerlo en cuenta en cualquier despliegue.
- El repositorio acumula versiones antiguas en el mismo espacio (16,8 GB), lo que complica la descarga selectiva y el versionado en producción.
- No se publican datos sobre longitud de contexto real, comportamiento de tool calling ni límites de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DICPlay/RusMind-Momentum
- Demo web oficial: https://rusmind.ru
- Carpeta de la version actual (3.2): https://huggingface.co/DICPlay/RusMind-Momentum/tree/main/v3.2
- Carpeta de la primera version guardada (1.1): https://huggingface.co/DICPlay/RusMind-Momentum/tree/main/v1.1
- Modelo de la familia RusMind-Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Modelo de la familia RusMind-Znanie: https://huggingface.co/DICPlay/RusMind-Znanie
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de la base (Apache 2.0): https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados correspondian a galerias de arte de comic y no guardan relacion con RusMind-Momentum.
