# Naphula/Q0_Bench

## Resumen

Q0_Bench es un benchmark de evaluación de modelos de lenguaje, no un modelo en sí. Desarrollado por el usuario Naphula y alojado en HuggingFace, su propósito es clasificar y puntuar modelos según su complejidad de salida, nivel de censura, capacidad de seguir instrucciones, alineación y calidad general de las respuestas. El benchmark está fuertemente orientado a modelos "uncensored" (sin censura) y utiliza contenido NSFW y violento, lo que lo sitúa en un ámbito de evaluación poco convencional y con implicaciones éticas.

La relevancia actual de Q0_Bench radica en que ofrece una métrica alternativa para comparar modelos que no se ajustan a los estándares de seguridad habituales, aunque su sesgo explícito hacia respuestas sin censura limita su utilidad como referencia objetiva de calidad general. El benchmark está fijado a la versión 1.104 de Kobold.cpp para mantener consistencia en los resultados, y su metodología incluye una pregunta específica (O14) sobre dispositivos de tortura medieval, lo que refleja su naturaleza provocadora. No se dispone de información sobre arquitectura, parámetros o licencia, ya que no es un modelo sino un conjunto de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un benchmark, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (evalúa modelos en distintas cuantizaciones: Q2, Q4, Q6, Q8, etc.) |
| Idiomas soportados | ingles (etiqueta `language:English`) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no es un modelo con pesos) |

## Arquitectura y entrenamiento

Q0_Bench no es un modelo entrenado, sino un conjunto de pruebas (benchmark) diseñado para evaluar modelos de lenguaje. No tiene arquitectura propia ni proceso de entrenamiento. Su funcionamiento se basa en ejecutar una serie de preguntas o tareas sobre los modelos candidatos y puntuar sus respuestas según criterios de complejidad, censura, seguimiento de instrucciones, alineación y calidad. La metodología exacta no está documentada en la información disponible, pero se sabe que utiliza Kobold.cpp en su versión 1.104 para garantizar la reproducibilidad de los resultados, y que incluye una pregunta fija (O14) sobre el dispositivo de tortura medieval más cruel. El benchmark está sesgado hacia modelos sin censura, y penaliza a aquellos que requieren jailbreaks para responder, ya que esto degrada la calidad percibida de las respuestas.

## Capacidades

- Evalúa la complejidad de las salidas generadas por modelos de lenguaje.
- Mide el nivel de censura de un modelo (capacidad de responder a contenido NSFW y violento).
- Valora el seguimiento de instrucciones y la alineación con las peticiones del usuario.
- Proporciona una puntuación global (Score) y una subpuntuación Q0G (presumiblemente relacionada con la calidad general).
- Registra el número de rechazos (Refusals) ante las preguntas planteadas.
- Incluye una pregunta específica O14 sobre tortura medieval, que se utiliza como criterio adicional.
- Compatible con modelos de distintos tamaños (desde 8B hasta 32B y más) y cuantizaciones (Q2, Q4, Q6, Q8).

## Casos de uso

- Evaluación comparativa de modelos sin censura: Q0_Bench permite a desarrolladores que trabajan en modelos "uncensored" o "abliterated" comparar sus creaciones con otras alternativas en un entorno de pruebas estandarizado.
- Investigación sobre alineación y seguridad: aunque su enfoque es NSFW, los resultados pueden utilizarse para estudiar cómo los modelos manejan instrucciones extremas y qué mecanismos de rechazo emplean.
- Selección de modelos para aplicaciones de rolplay (RP) sin restricciones: el benchmark, pese a su advertencia de que no es fiable para medir calidad de RP, puede servir como referencia preliminar para elegir modelos que respondan sin filtros.
- Pruebas de jailbreak y robustez: los datos de "Refusals" ayudan a entender qué modelos son más resistentes a intentos de evasión de seguridad.
- Desarrollo de benchmarks de evaluación: el diseño de Q0_Bench (con su fijación de versión de software y preguntas específicas) puede inspirar a otros investigadores a crear sus propios conjuntos de pruebas.
- Documentación de tendencias en el ecosistema de modelos abiertos: las puntuaciones publicadas ofrecen una instantánea de qué modelos dominan el nicho "uncensored" en un momento dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Q0_Bench es en sí mismo un benchmark, por lo que no tiene métricas propias de rendimiento. La tabla incluida en la model card muestra puntuaciones de varios modelos (GLM 4.6, Skyfall v4.2 Heretic, Ouroboros v1.4, etc.), pero no se proporcionan detalles sobre la metodología de puntuación ni comparativas con benchmarks estándar como MMLU o HumanEval.

## Requisitos de hardware

No aplica, ya que Q0_Bench no es un modelo que requiera inferencia. Para ejecutar el benchmark sobre modelos candidatos, se necesita el software Kobold.cpp versión 1.104 y hardware capaz de cargar el modelo evaluado (típicamente GPUs con VRAM suficiente según el tamaño y cuantización del modelo). No se dispone de requisitos específicos documentados.

## Comparativa con modelos similares

No disponible. Q0_Bench no es un modelo comparable con otros; es una herramienta de evaluación. No se conocen benchmarks similares en el ámbito NSFW/uncensored con los que se pueda comparar directamente.

## Limitaciones y advertencias

- Contenido explícito y violento: el benchmark incluye preguntas sobre tortura medieval y otro contenido NSFW, lo que puede resultar perturbador y no es adecuado para todos los públicos.
- Sesgo hacia modelos sin censura: la metodología favorece a los modelos que responden sin restricciones, penalizando a aquellos que requieren jailbreaks. Esto invalida su uso como métrica objetiva de calidad general.
- No fiable para medir calidad de rolplay (RP): el propio autor advierte que el benchmark no es un indicador fiable para evaluar la calidad de modelos de rolplay.
- Dependencia de una versión específica de software: los resultados solo son comparables si se utiliza Kobold.cpp 1.104, lo que limita la reproducibilidad en otros entornos.
- Sin licencia especificada: no se indica bajo qué términos se distribuye el benchmark, lo que genera incertidumbre sobre su uso comercial o modificación.
- Sin documentación metodológica detallada: no se explican los criterios exactos de puntuación ni el número de preguntas, lo que dificulta la interpretación de los resultados.
- Riesgo de mal uso: al promover contenido violento y sin censura, podría ser utilizado para fines poco éticos.

## Enlaces

- HuggingFace: https://huggingface.co/Naphula/Q0_Bench
- No se proporcionan otros enlaces (papers, blogs, repositorios) en la información disponible.
