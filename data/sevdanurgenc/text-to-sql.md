# SevdanurGenc/Text-to-SQL

## Resumen

TR-TabloSQL es un conjunto de datos y un sistema de referencia (no un modelo de lenguaje con pesos publicados) orientado a la conversión de texto a SQL sobre tablas extraídas de documentos en turco. Lo desarrolla SevdanurGenc y se publica en Hugging Face bajo licencia CC-BY-4.0. El paquete incluye cinco configuraciones de datos (`tr_tablosql`, `pilot`, `stres`, `agir`, `gercek`, `sonuclar`), con un total de 1.406 preguntas repartidas en cinco conjuntos de evaluación, además de los resultados de experimentos a nivel de pregunta para seis LLM y un generador basado en reglas.

El problema que aborda es específico y poco cubierto: la normalización de formatos numéricos, fechas y unidades en turco (por ejemplo `1.234,56` → `1234.56`, `(1.200)` → −1200, `Ocak 2024` → `2024-01`) antes de generar SQL, y la extracción de tablas con celdas combinadas y cabeceras multinivel desde PDF, HTML, CSV y XLSX. El sistema incorpora un agente autocorrector que traduce preguntas en turco a SQL y que, cuando la respuesta no está en las tablas, declina responder en lugar de inventar.

Su relevancia actual radica en que documenta un hallazgo reproducible: la configuración regional numérica es un prerrequisito. Con normalización turca, el generador basado en reglas alcanza un 92,9 % de acierto; asumiendo configuración inglesa, incluso consultas SQL doradas perfectas solo producen el resultado correcto en el 28,4 % de los casos y sin emitir ningún error. El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y no publica pesos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema de extracción de tablas + agente text-to-SQL; no se publican pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (se distribuyen ficheros JSONL de datos y resultados) |

## Arquitectura y entrenamiento

El paquete no describe el entrenamiento de un modelo propio. Lo que se publica es un pipeline de extremo a extremo con cuatro etapas: extracción de tablas desde PDF, HTML, CSV y XLSX; resolución de celdas combinadas y cabeceras de varias filas; normalización de números, fechas y unidades en turco; y carga en SQLite con metadatos. Sobre esa base de datos, un agente text-to-SQL autocorrector traduce las preguntas en turco y verifica la consulta generada antes de ejecutarla.

El sistema admite dos modos de generación de SQL: un generador basado en reglas que funciona sin LLM y la conexión a modelos externos (Claude, OpenAI u Ollama local) mediante un panel de conexiones. La evaluación se realizó con seis LLM, entre ellos Claude Opus 5.5, GPT-6.1-sol y Qwen2.5-Coder-32B en local. Se incluye una cadena de auditoría que, en una prueba de inyección de errores con 159 consultas corruptas, detectó el 92,5 % de los fallos sin generar falsos positivos.

Los conjuntos de datos se componen de documentos sintéticos generados con números aleatorios sembrados que imitan el formato y las convenciones de la documentación pública turca, más un piloto con 18 PDF reales de siete instituciones (no incluidos en el paquete por derechos de autor). No se documentan detalles de entrenamiento, número de tokens ni técnicas de RLHF/DPO porque no se entrena ningún modelo.

## Capacidades

- Extracción de tablas desde PDF, HTML, CSV y XLSX, incluyendo rejillas, tablas con solo líneas horizontales y PDF sin líneas.
- Resolución de celdas combinadas y cabeceras multinivel.
- Normalización de formatos numéricos, fechas y unidades en turco (`1.234,56`, `(1.200)`, `Ocak 2024`).
- Carga de tablas en SQLite con metadatos y consola SQL integrada.
- Traducción de preguntas en turco a SQL mediante agente autocorrector.
- Abstención explícita y razonada cuando la respuesta no está en las tablas, en lugar de alucinar.
- Cadena de auditoría y catálogo de errores específicos del turco.
- Evaluación comparativa de modelos por conjuntos de prueba y niveles de dificultad.
- Interfaz web (Streamlit en `localhost:8501`), arranque con un clic y despliegue con Docker Compose.
- Informes en HTML y PDF, en turco e inglés, con temas claro y oscuro.

## Casos de uso

- Digitalización de tablas de boletines oficiales y documentos públicos turcos: el pipeline extrae tablas de PDF con celdas combinadas y las normaliza a SQLite, lo que permite consultas posteriores sin reprocesar el documento.
- Asistencia a analistas de datos en organismos públicos: el agente traduce preguntas en turco a SQL sobre la base de datos cargada y devuelve la consulta junto con la respuesta, facilitando la trazabilidad.
- Auditoría de calidad de pipelines text-to-SQL: los conjuntos `stres`, `agir` y `gercek` permiten medir la tasa de errores silenciosos de un sistema antes de llevarlo a producción.
- Evaluación comparativa de LLM para tareas de SQL en turco: los 5.012 registros de resultados a nivel de pregunta sirven como referencia para comparar modelos comerciales y locales en el mismo conjunto de preguntas y bases de datos.
- Formación y docencia: el catálogo de errores específicos del turco y los ejemplos documentados permiten ilustrar por qué la configuración regional afecta al resultado de una consulta.
- Integración en flujos de extracción documental: los scripts de reproducción de documentos sintéticos y los cargadores de PDF/HTML/CSV/XLSX se pueden reutilizar en pipelines propios.
- Control de alucinaciones en asistentes de datos: el mecanismo de abstención razonada es directamente aplicable a asistentes que deben reconocer cuándo la respuesta no está en la fuente.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión medida a nivel de respuesta; todos los sistemas responden las mismas preguntas sobre las mismas bases de datos):

| Conjunto | Reglas | Claude Opus 5.5 | GPT-6.1-sol | Qwen2.5-Coder-32B (local) |
|---|---|---|---|---|
| Stres (33 documentos, 307 preguntas) | 42,7 % | 89,9 % | 76,9 %¹ | 62,5 % |
| Agir, subconjunto rápido (200 preguntas) | 14,5 % | 90,0 % | 83,0 % | 63,5 % |
| Piloto de documentos reales (18 documentos, 189 preguntas) | 19,6 % | 59,8 % | 62,4 % | 28,6 % |
| Errores silenciosos, documentos reales | 40,7 % | 2,6 % | 5,3 % | 9,5 % |

¹ 34 preguntas devolvieron error de API en esa ejecución; excluyéndolas, el resultado es del 85,0 %.

Otros datos publicados: con normalización turca el generador basado en reglas alcanza el 92,9 % en TR-TabloSQL; con configuración regional inglesa, solo el 28,4 % de las consultas SQL doradas producen el resultado correcto y sin mensaje de error. En documentos reales, de 32 preguntas cuyo valor no se había leído correctamente en la base de datos, cada modelo resolvió únicamente dos; excluyéndolas, los modelos en la nube suben al 70,7–73,9 %. En la inyección de errores con 159 consultas corruptas se detectó el 92,5 % de los fallos sin falsos positivos.

## Requisitos de hardware

- No aplica VRAM para un modelo propio: no se publican pesos.
- El modo basado en reglas funciona sin GPU y sin LLM; requiere únicamente Python y las dependencias del proyecto.
- Para el modo con LLM local vía Ollama, los requisitos dependen del modelo elegido; la model card cita Qwen2.5-Coder-32B como referencia local, lo que implica GPU de gama alta (A100, H100 o varias RTX 4090) o cuantización agresiva para caber en una única GPU de consumo.
- Para modelos en la nube (Claude, OpenAI) no se requiere hardware local más allá del necesario para ejecutar la interfaz.
- Despliegue: arranque con un clic (`baslat.bat` en Windows, `baslat.command` en macOS, `bash baslat.sh` en Linux) o `docker compose up -d`.
- Interfaz servida en `http://localhost:8501` (Streamlit).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Idiomas | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|
| TR-TabloSQL / Tablo2SQL-TR | Pipeline text-to-SQL + benchmark | tr, en | no disponible | CC-BY-4.0 | 5 conjuntos, 1.406 preguntas, 5.012 registros de resultados |
| Spider | Benchmark text-to-SQL | en | no disponible | no disponible en la información | Esquema y preguntas en inglés |
| BIRD | Benchmark text-to-SQL | en | no disponible | no disponible en la información | Preguntas sobre bases de datos reales |
| Modelos LLM evaluados (Claude Opus 5.5, GPT-6.1-sol, Qwen2.5-Coder-32B) | Modelos generativos | multilingüe | no disponible | propietaria / según modelo | Resultados publicados aquí sobre los conjuntos de TR-TabloSQL |

La comparación con Spider y BIRD es pertinente porque la model card indica que las preguntas de TR-TabloSQL se adaptaron de los tipos de esos benchmarks, pero no se ofrecen métricas cruzadas entre ellos en la información disponible.

## Limitaciones y advertencias

- No es un modelo con pesos: no se puede descargar ni ejecutar como tal; es un paquete de datos, código y resultados.
- Los documentos sintéticos no contienen datos reales de instituciones, aunque imitan su formato; los resultados sobre ellos no garantizan el rendimiento en documentos reales.
- Los 18 PDF reales del piloto no se incluyen por derechos de autor y deben descargarse de las webs institucionales.
- El rendimiento en documentos reales cae de forma notable respecto a los sintéticos (por ejemplo, 59,8–62,4 % frente a 89,9–90,0 % en el conjunto de estrés).
- La extracción de tablas es el cuello de botella con LLM potentes: errores de lectura en la base de datos limitan el techo de acierto de todos los modelos.
- La configuración regional numérica es crítica: asumir configuración inglesa produce fallos silenciosos en la mayoría de consultas correctas.
- El repositorio no tiene descargas ni likes y su tamaño es de 0,0 GB, lo que sugiere que los datos pueden no estar efectivamente alojados en el repositorio.
- Las API keys se escriben en texto plano en `ayarlar/tablo2sql-ayarlas.json`; el fichero no se incluye en el paquete, pero no debe compartirse ni subirse al repositorio.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los derechos de los documentos reales de terceros por separado.
- No se documentan sesgos del sistema más allá de los derivados de los datos sintéticos y de la cobertura limitada al turco y al inglés.

## Enlaces

- Hugging Face: https://huggingface.co/SevdanurGenc/Text-to-SQL
- Guía de instalación: `KURULUM.md` (referenciado en la model card)
- Guía de uso en turco: `docs/KULLANIM_KILAVUZU.md`
- Guía de uso en inglés: `docs/USER_GUIDE.md`
- Conjunto de documentos reales: `gercek_pilot/README.md`
- Conjuntos de datos: `benchmark/`, `data/`, `pilot/`, `stres_kumesi/`, `agir_kume/`, `gercek_pilot/`
- Ficheros de datos: `veri/tr_tablosql.jsonl`, `veri/pilot.jsonl`, `veri/stres.jsonl`, `veri/agir.jsonl`, `veri/gercek.jsonl`, `veri/sonuclar.jsonl`
