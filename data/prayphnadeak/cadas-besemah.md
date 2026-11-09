# prayphnadeak/cadas-besemah

## Resumen

CADAS BESEMAH es un sistema de chatbot y API webhook presentado en Hugging Face bajo el identificador `prayphnadeak/cadas-besemah`. No se trata de un modelo de lenguaje con pesos publicados, sino de un proyecto de aplicacion (dashboard web y webhook para WhatsApp via la app Whatauto) que combina recuperacion sobre un corpus linguistico del idioma besemah con un agente text-to-SQL sobre una base de datos SQLite de estadisticas del BPS (Badan Pusat Statistik) de la ciudad de Pagar Alam, Indonesia.

El repositorio tiene un tamano de 0.0 GB y no contiene ficheros de pesos (safetensors, GGUF ni similares). La model card describe componentes de software: un motor de corpus hibrido basado en RapidFuzz (fuzzy matching en C++), rank_bm25 (BM25Okapi) y SQLite, y un agente text-to-SQL que usa sqlglot para validar el AST y aplicar un guardrail de solo lectura (SELECT) sobre cinco tablas estadisticas.

Por tanto, esta ficha documenta un artefacto de tipo aplicacion/agente, no un modelo fundacional. No hay informacion sobre arquitectura neuronal, parametros, contexto ni datos de entrenamiento de un LLM, y la mayoria de campos tecnicos habituales figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo neuronal; es una aplicacion Python 3.12 con motor de recuperacion hibrido RapidFuzz + BM25Okapi + SQLite y agente text-to-SQL con sqlglot) |
| Parametros totales | No disponible (no se publican pesos de modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | No disponibles de forma oficial; la model card describe un chatbot en bahasa besemah y datos en indonesio (BPS Kota Pagar Alam) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repo contiene codigo, plantillas, `requirements.txt`, `Dockerfile`, `besemah_simple_qa.json` y `bps_pagaralam.db`) |

## Arquitectura y entrenamiento

El sistema no entrena un modelo de lenguaje. Su nucleo linguistico es un indice hibrido construido sobre un corpus propio (`prayphnadeak/corpus_besemah`) que, segun la model card, integra 6.876 entradas de diccionario (`dictionary.json`) y 31.424 pares de instruccion (`train.jsonl` y `validation.jsonl`). Sobre ese corpus se aplican tres tecnicas combinadas: fuzzy matching con RapidFuzz, recuperacion de frases con BM25Okapi (rank_bm25) y almacenamiento en SQLite (`bps_pagaralam.db`). Se mencionan ademas normalizacion de diacriticos (por ejemplo, `é` a `e`), busqueda de sinonimos, traduccion palabra a palabra y tolerancia a errores tipograficos.

El segundo componente es un agente text-to-SQL que valida la sintaxis mediante el AST de sqlglot y aplica un guardrail de solo lectura, permitiendo unicamente consultas SELECT sobre tablas oficiales del BPS. La ejecucion se realiza con pandas, pydantic y python-dotenv sobre SQLite. La model card enumera cinco tablas: kependudukan per kecamatan (poblacion por distrito), 14 indicadores estrategicos de economia/IPM/pobreza/TPT, instalaciones educativas, instalaciones sanitarias y agricultura de cafe robusta y turismo, con un router de enlaces a las tablas dinamicas oficiales del BPS. No se documenta ningun proceso de RLHF, DPO ni preentrenamiento.

## Capacidades

- Consulta y traduccion asistida del idioma besemah mediante busqueda difusa, sinonimos, normalizacion de diacriticos y tolerancia a errores tipograficos.
- Traduccion palabra a palabra de frases entre besemah e indonesio segun el corpus integrado.
- Generacion de consultas SQL de solo lectura (SELECT) sobre la base de datos estadistica del BPS Kota Pagar Alam.
- Validacion sintactica de SQL con sqlglot y bloqueo de operaciones de escritura mediante guardrail.
- Endpoint de webhook (`POST /whatauto-webhook`) para integracion con la aplicacion Whatauto de WhatsApp, con respuesta en formato `{"reply": "..."}`.
- API HTTP con endpoints para chat (`/api/chat`), ejecucion SQL (`/api/sql`), busqueda en diccionario (`/api/dictionary`), volcado de datos BPS (`/api/bps`) y health check con metricas (`/api/stats`, `/health`).
- Dashboard web interactivo con simulador de WhatsApp, navegador de diccionario y visor de tablas BPS.
- No se documentan capacidades de razonamiento general, generacion de codigo, matematicas, vision, audio, tool calling generico ni modo thinking.

## Casos de uso

- Atencion ciudadana sobre estadisticas locales: un ciudadano pregunta por indicadores de poblacion, pobreza o empleo de Pagar Alam y el agente traduce la pregunta a una consulta SELECT validada sobre la base SQLite del BPS, devolviendo el dato concreto.
- Preservacion y consulta del idioma besemah: investigadores o hablantes consultan el diccionario integrado (6.876 entradas) con tolerancia a errores tipograficos y normalizacion de diacriticos, util para documentacion linguistica.
- Bot de WhatsApp para difusion estadistica: mediante el webhook `/whatauto-webhook` y la app Whatauto, un organismo local puede ofrecer respuestas automaticas a consultas frecuentes sobre datos del BPS sin desarrollar una integracion propia.
- Traduccion asistida besemah-indonesio: uso del motor de traduccion palabra a palabra para borradores de comunicaciones bilingues o materiales educativos.
- Panel interno de explotacion de datos: el dashboard y el endpoint `/api/bps` permiten a tecnicos del BPS explorar las cinco tablas (poblacion, 14 indicadores, educacion, sanidad, cafe robusta y turismo) y enlazar a las tablas dinamicas oficiales.
- Prototipo de agente text-to-SQL con guardrail: el codigo de `text_to_sql_agent.py` sirve como referencia para construir agentes SQL de solo lectura con validacion de AST en otros dominios estadisticos.
- Integracion en flujos de consulta via API: el endpoint `/api/chat` devuelve la respuesta y la consulta SQL validada, lo que permite auditar cada respuesta en un pipeline externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se publican pesos de modelo, por lo que no aplica VRAM de inferencia para un LLM.
- El despliegue previsto es un contenedor Docker con Python 3.12 (`/opt/venv`), apto para CPU; la model card no especifica requisitos de GPU.
- El sistema cabe en Hugging Face Spaces con SDK Docker (puerto 7860), lo que implica recursos modestos de CPU y RAM; no se detallan cifras concretas.
- Opciones de despliegue documentadas: Hugging Face Spaces (Docker), ejecucion local con `venv` (`python app.py` en `http://localhost:7860`) y script `deploy_hf.py` para publicacion automatizada.
- No se proporcionan datos de latencia ni throughput. Las metricas de indice BM25/RapidFuzz y el resumen de base de datos se exponen en `/api/stats` y `/health`.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (chatbot linguistico con agente text-to-SQL sobre datos estadisticos locales), ni se dispone de datos de parametros, contexto o rendimiento para establecer una comparacion.

## Limitaciones y advertencias

- No es un modelo de lenguaje fundacional: no dispone de pesos, contexto ni capacidades generativas generales; su alcance se limita al corpus besemah y a la base de datos del BPS de Pagar Alam.
- La licencia no esta declarada, lo que impide determinar si el uso comercial es posible; conviene contactar con el autor antes de cualquier despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB; no hay evidencia de validacion externa ni de mantenimiento continuado.
- El agente SQL depende de la calidad y actualizacion de `bps_pagaralam.db`; datos desactualizados produciran respuestas incorrectas aunque la consulta sea sintacticamente valida.
- El guardrail de solo lectura se basa en sqlglot; no se documenta auditoria de seguridad ni pruebas de evasion, por lo que no debe exponerse publicamente sin revision adicional.
- La integracion con WhatsApp depende de una aplicacion de terceros (Whatauto) y de la configuracion manual del webhook; no se documentan limites de tasa ni gestion de errores.
- El motor de traduccion es palabra a palabra y por recuperacion, no un sistema neuronal: la calidad en frases complejas sera limitada y puede producir traducciones literales.
- No se especifican sesgos conocidos, pero al tratarse de datos estadisticos oficiales de una region concreta, las respuestas heredan las limitaciones y granularidad de esas fuentes.
- La model card esta redactada en indonesio y mezcla instrucciones de despliegue con descripcion funcional; no incluye evaluacion cuantitativa de precision del chatbot ni del agente SQL.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/prayphnadeak/cadas-besemah
- Corpus referenciado: https://huggingface.co/prayphnadeak/corpus_besemah
- Repositorio del agente text-to-SQL referenciado: https://huggingface.co/algonacci/from-text-to-sql-agent
- Creacion de Spaces en Hugging Face: https://huggingface.co/new-space
- No se han encontrado en la informacion proporcionada papers, blogs, demos publicas ni repositorios adicionales.
