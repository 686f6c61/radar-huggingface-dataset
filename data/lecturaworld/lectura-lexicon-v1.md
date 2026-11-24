# lecturaworld/lectura-lexicon-v1

## Resumen

Lectura Lexicon v1 es un módulo de funciones léxicas para francés e inglés publicado por lecturaworld (proyecto Lectura) en noviembre de 2026. No es un modelo de lenguaje neuronal: es un paquete Python (`lectura-lexicon`) que calcula, a partir de una base léxica, información fonética, morfológica y ortográfica de palabras y patrones en francés e inglés. Resuelve tareas de lexicografía computacional: transcripción IPA, homófonos, rimas, conjugación, lemas, vecinos ortográficos y fonéticos, anagramas y búsqueda multicriterio.

El repositorio de Hugging Face no contiene pesos ni base de datos: el módulo opera contra la API pública de Lectura (`https://api.lectura.world`) o contra una base local SQLite que el usuario construye a partir de un lexicón que posea (LeXiK, Lexique 3, GLÀFF o CSV/TSV propio). Las bases distribuidas por Lectura se ofrecen en tres tamaños (completa, estándar y mini) definidos por umbral de frecuencia Zipf.

Su relevancia actual radica en que cubre una capa lingüística que los LLM habituales tratan de forma aproximada —fonética, prosodia, morfología flexiva y variantes ortográficas— con datos deterministas y verificables, y con opción de ejecución totalmente local. La licencia del código es AGPL-3.0-or-later y las bases derivadas de LeXiK quedan bajo CC BY-SA 4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; módulo Python de consulta léxica sobre base SQLite o API) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica; consultas por palabra o patrón) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | francés (fr) e inglés (en) |
| Licencia | código: AGPL-3.0-or-later; bases derivadas de LeXiK y del lexicón inglés de Lectura: CC BY-SA 4.0 |
| Formato de pesos | no disponible (no hay pesos; base local en SQLite, `lexicon.db`) |

Datos de las bases distribuidas por el autor:

| Base | Uso previsto | Formas FR / EN | Tamaño comprimido (xz) FR / EN | Tamaño indexado FR / EN |
|---|---|---:|---:|---:|
| completa (todas las formas validadas) | servidor, búsqueda | 2 365 529 / 390 537 | 43,8 / 10,7 MB | 880 / 185 MB |
| estándar (frecuencia > 0) | correctores | 610 415 / 228 835 | 16,6 / 6,3 MB | 314 / 120 MB |
| mini (zipf ≥ 2) | móvil, apps de gran público | 121 784 / 104 115 | 3,9 / 3,3 MB | 73 / 64 MB |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento en el sentido habitual. El módulo separa dos capas: una base de datos que almacena únicamente lo que no se puede calcular (grafía y frecuencia, pronunciación IPA, lema, análisis gramatical y frecuencia del análisis, tabla de lemas con frecuencia, otro género, auxiliar, pronominal, grupo y ortografía rectificada de 1990; variantes con su grafía habitual —en francés errores frecuentes y grafías antiguas, p. ej. *parmis* → *parmi*; en inglés *seperate* → *separate*— y, en inglés, grafías británica y americana) y un conjunto de rutinas que derivan el resto en tiempo de consulta.

Los índices (vecinos ortográficos y fonéticos, rimas, sílabas, anagramas) se construyen en la máquina del usuario una sola vez. Solo se incorporan formas validadas. La base francesa deriva de LeXiK (Maxime Carrière, Lectura, 2026); la inglesa, del lexicón inglés de Lectura, construido a partir de Wikcionario, CMUdict, wordfreq y UD English-EWT. Las frecuencias léxicas se calcularon sobre corpus de textos públicamente accesibles (enciclopedia, literatura, diálogos) y solo se distribuyen estadísticas agregadas, sin texto de esos corpus.

El análisis gramatical sigue Universal Dependencies y, en francés, MULTEXT. La conversión se realiza con `python -m lectura_lexicon convertir LeXiK/ ma_base/lexicon.db`, aceptando también Lexique 3, GLÀFF y CSV/TSV propio.

## Capacidades

- Validez léxica (palabra segura, rara, variante, desconocida) e índice de frecuencia Zipf.
- Transcripción fonética en Alfabeto Fonético Internacional (IPA/AFI).
- Lematización y rasgos gramaticales (Universal Dependencies; MULTEXT en francés).
- Detección de homófonos y de vecinos ortográficos y fonéticos.
- Rimas clasificadas en francesas (pobres, suficientes, ricas) y rima inglesa desde la vocal acentuada.
- Formas flexionadas, conjugación completa y transición entre rasgos (singular → plural, etc.).
- Anagramas y búsqueda multicriterio combinando patrón, sonido, número de sílabas, categoría gramatical, frecuencia y rima.
- Variantes ortográficas: grafías británica y americana en inglés (`en.americaine("colour")` → `'color'`); ortografía rectificada de 1990 y otro género en francés.
- Modo local sin salida de datos (`Lexicon("ma_base/lexicon.db")`) o modo API con envío de consultas al servidor de Lectura.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es una librería de consulta determinista.

## Casos de uso

- Correctores ortográficos y de estilo: la tabla de variantes mapea errores frecuentes a la grafía usual (*parmis* → *parmi*, *seperate* → *separate*) y permite filtrar candidatos por frecuencia Zipf antes de sugerir.
- Herramientas de escritura creativa y poesía: consulta de rimas por riqueza (pobres, suficientes, ricas) y de número de sílabas para componer versos en francés o inglés sin depender de un LLM.
- Aplicaciones de aprendizaje de idiomas: conjugación completa, transcripción IPA y detección de homófonos para ejercicios de pronunciación y dictado.
- Procesamiento de lenguaje natural en pipelines: lematización y etiquetado gramatical (UD, MULTEXT) como paso previo determinista a un modelo generativo, con base local para evitar dependencias externas.
- Búsqueda léxica avanzada en diccionarios y bases editoriales: consultas multicriterio por patrón, sonido, categoría y frecuencia sobre la base completa (2,3 M de formas en francés).
- Normalización ortográfica en edición y publicación: conversión entre grafías británica y americana y aplicación de la ortografía rectificada de 1990 en textos franceses.
- Generación de crucigramas, anagramas y juegos de palabras: anagramas y vecinos ortográficos/fonéticos calculados sobre índices locales.
- Despliegue en móvil o aplicaciones de gran público: la base mini (3,9 MB FR / 3,3 MB EN comprimida) cubre vocabulario frecuente con un coste de almacenamiento mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de precisión, cobertura ni latencia para el módulo ni para las bases.

## Requisitos de hardware

- No requiere GPU: es una librería Python con base SQLite y cálculo en CPU.
- VRAM estimada: no aplica (0 VRAM).
- GPU recomendadas: ninguna.
- Cabe en cualquier equipo de consumo; el límite es el almacenamiento: base completa indexada 880 MB (FR) / 185 MB (EN), estándar 314 / 120 MB, mini 73 / 64 MB.
- Despliegue: `pip install lectura-lexicon`; modo API contra `https://api.lectura.world` (gratuito, sin clave, uso limitado) o modo local con `Lexicon("ma_base/lexicon.db")`.
- Latencia y throughput: no disponible. En modo API dependen de la red y de los límites de uso del servicio; en modo local, del coste de consulta sobre SQLite y de la construcción inicial de índices.

## Comparativa con modelos similares

| Herramienta | Tipo | Idiomas | Licencia | Distribución | Fonética IPA | Rimas | Conjugación |
|---|---|---|---|---|---|---|---|
| Lectura Lexicon v1 | módulo léxico Python + base SQLite/API | fr, en | AGPL-3.0-or-later (código); CC BY-SA 4.0 (bases) | PyPI + HF (sin pesos) | sí | sí | sí |
| Lexique 3 | lexicón estático | fr | no disponible en la información | ficheros de texto | sí | parcial (según campos) | formas flexionadas |
| CMUdict | diccionario de pronunciación | en (US) | no disponible en la información | ficheros de texto | ARPAbet (no IPA) | no | no |
| LeXiK | lexicón fonético y gramatical | fr | CC BY-SA 4.0 | ORTOLANG (handle 11403/lexik) | sí | no disponible en la información | no disponible en la información |

La comparación se limita a recursos léxicos porque no existen modelos neuronales equivalentes en la información disponible; el módulo no compite con LLM en generación, sino que aporta datos deterministas que estos aproximan.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, razonamiento, código ni respuestas conversacionales; cualquier expectativa en ese sentido es un error de uso.
- En modo API, las palabras, patrones y pronunciaciones consultadas se envían al servidor de Lectura (`https://api.lectura.world`); el uso es gratuito y sin clave, pero limitado. Para entornos con requisitos de privacidad debe usarse base local.
- La base mini (zipf ≥ 2) pierde conjugaciones raras y vocabulario técnico; no es adecuada para corrección avanzada ni dominios especializados.
- Cobertura limitada a francés e inglés; no hay soporte de otras lenguas salvo base a medida por presupuesto.
- La validez léxica depende de la base empleada: palabras ausentes se marcan como desconocidas aunque sean correctas en un dominio concreto.
- Licencia AGPL-3.0-or-later para el código: el uso en servicios de red puede obligar a liberar el código modificado. El uso comercial fuera de AGPL requiere licencia comercial (290 € HT indicativos, según el autor; IVA no aplicable, art. 293 B del CGI).
- Las bases derivadas de LeXiK y del lexicón inglés están bajo CC BY-SA 4.0: su redistribución, incluso comercial, exige citar LeXiK y mantener la misma licencia.
- Las frecuencias provienen de corpus agregados; pueden no reflejar jerga, neologismos ni variación regional.
- No se han publicado métricas de precisión, cobertura ni latencia, por lo que la evaluación en producción debe hacerse con el propio conjunto de datos.

## Enlaces

- Hugging Face: https://huggingface.co/lecturaworld/lectura-lexicon-v1
- Página del módulo Lexicon: https://www.lectura.world/developpement/modules/
- Paquete PyPI: https://pypi.org/project/lectura-lexicon/
- API pública: https://api.lectura.world
- Política de privacidad de la API: https://www.lectura.world/confidentialite/#api
- LeXiK: https://lexique.lectura.world
- LeXiK en ORTOLANG: handle 11403/lexik
- Demo del módulo: https://lexique.lectura.world/modules/v1#demo
- Contacto y licencia comercial: https://www.lectura.world/contact/
