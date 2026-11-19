# abr00kx/jewish-knowledge-mcp

## Resumen

`abr00kx/jewish-knowledge-mcp` no es un modelo de lenguaje, sino un servidor del Model Context Protocol (MCP) que expone a un asistente de IA acceso directo a textos sagrados judíos, comentarios y códigos legales a través de la API pública de Sefaria. El repositorio contiene código fuente en Python (3.10 o superior), no pesos de modelo, y su tamaño declarado es de 0.0 GB. Funciona como una capa de herramientas (12 en total) que un cliente MCP compatible puede invocar para recuperar, verificar y cotejar pasajes bíblicos, talmúdicos, halájicos y cabalísticos.

La propuesta de valor es la de un "tool server" especializado en humanidades digitales judías: no requiere clave de API, trabaja contra la API en vivo de Sefaria y añade utilidades académicas que van más allá de la simple recuperación de texto, como el cotejo palabra por palabra de testimonios hebreos con detección heurística de sustituciones por censura, el trazado cronológico de la recepción de un pasaje, la decodificación de abreviaturas rabínicas y la búsqueda en el catálogo de la Guenizá de El Cairo del Princeton Geniza Project.

Es relevante ahora porque el ecosistema MCP se ha convertido en el estándar de facto para conectar asistentes (Claude Desktop, Claude Code, Cursor, VS Code) con fuentes de datos externas, y este servidor cubre un nicho documental muy concreto con herramientas de verificación de citas que reducen el riesgo de alucinación en un dominio donde la exactitud textual es crítica. El proyecto está en estado beta, sin licencia elegida todavía y sin revisión externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP (Model Context Protocol) sobre Python 3.10+; no es un modelo neuronal |
| Parametros totales | no disponible (no aplica: repositorio de código, no de pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo cliente que consuma las herramientas) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Ingles (en) y hebreo (he); incluye arameo y judeoarabe en los textos fuente |
| Licencia | No elegida todavia (segun la propia model card) |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente Python, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura de red neuronal, dataset de preentrenamiento ni fases de RLHF o DPO. La "arquitectura" es la de un servidor MCP que implementa 12 herramientas agrupadas en cuatro bloques funcionales: lectura y recuperación (`get_jewish_text`, `get_commentaries_and_links`, `search_jewish_texts`, `get_daily_study`, `browse_library_index`), verificación (`verify_citation`), crítica textual y comparación (`compare_text_witnesses`, `get_parallel_versions`, `trace_interpretation_timeline`), y erudición auxiliar (`decode_hebrew_term`, `search_cairo_geniza`, `bridge_law_to_geniza`).

El servidor se apoya en la API de Sefaria como fuente primaria y en el catálogo del Princeton Geniza Project para la búsqueda documental. Incorpora ingesta de manuscritos en formato TEI (probada solo con ficheros de Digital Mishnah), un léxico de aproximadamente 150 abreviaturas rabínicas curadas a mano y heurísticas de vocabulario para marcar patrones de sustitución por censura. La verificación de citas se basa en solapamiento de palabras, no en una comprobación semántica, y la búsqueda en la Guenizá se hace por coincidencia de palabras clave sobre descripciones de catálogo. Dispone de una pequeña suite de tests offline ejecutable con pytest.

## Capacidades

- Recuperación de pasajes en hebreo, arameo y/o inglés, limpiados a Markdown y con cada segmento etiquetado con su propia cita; paginación mediante `start_segment` y `end_segment`.
- Acceso a comentarios, midrash, Talmud y códigos legales vinculados a un pasaje, con fragmentos de texto y filtros por categoría o comentarista.
- Búsqueda de texto completo con filtros por categoría, subcategoría o libro.
- Estudio diario: Parashat HaShavua (resumen y aliyot), Haftarah, Daf Yomi y otros ciclos.
- Navegación de la estructura de la biblioteca: tratados, capítulos, rangos de página válidos y forma correcta de citar.
- Verificación de citas: comprueba si una referencia existe y si la redacción citada aparece realmente en ella (basado en solapamiento de palabras).
- Cotejo de testimonios hebreos a nivel de palabra (ediciones de Sefaria, manuscritos TEI ingeridos o transcripción pegada), con marcado de patrones de censura.
- Versiones paralelas alineadas por segmento en varios idiomas (por ejemplo, la *Guía de los Perplejos* en judeoárabe junto a Ibn Tibbon y la traducción inglesa).
- Trazado cronológico de la recepción de un pasaje: todas las obras fechadas que lo citan, ordenadas por era.
- Decodificación de abreviaturas rabínicas según contexto (Talmud, Halajá, Cábala) y cálculo de gematría.
- Búsqueda en el catálogo de cartas, contratos y registros judiciales medievales de la Guenizá de El Cairo.
- Puente entre derecho y práctica: coloca un pasaje legal junto a documentos de la Guenizá sobre la misma materia.
- Soporte de tool calling nativo por diseño: las 12 herramientas se exponen como tools MCP a clientes compatibles.
- Cobertura cabalística destacada: Zohar completo (arameo, hebreo y traducción inglesa), Sefer Yetzirah, Sefer HaBahir y Sefer Etz Chaim completos; Sefer Raziel HaMalakh no está en Sefaria y se resuelve a una entrada de *Otzar Midrashim* con aviso explícito.

## Casos de uso

- Asistente de estudio de Torá y Talmud: un cliente MCP como Claude Desktop puede encadenar `get_jewish_text`, `get_commentaries_and_links` y `get_daily_study` para construir una sesión de aprendizaje guiada con el texto hebreo, su traducción y los comentaristas clásicos, con cada segmento etiquetado con su cita.
- Verificación de citas en publicaciones académicas: `verify_citation` permite comprobar si una referencia y su redacción existen realmente en la fuente antes de enviar un manuscrito, reduciendo el riesgo de citas apócrifas o alucinadas.
- Crítica textual y edición de manuscritos: `compare_text_witnesses` alinea a nivel de palabra dos ediciones de Sefaria, un manuscrito TEI o una transcripción manual, y marca posibles sustituciones por censura, lo que resulta útil para editar textos hebreos con historia textual compleja.
- Historia de la interpretación: `trace_interpretation_timeline` devuelve todas las obras fechadas que citan un pasaje en orden cronológico, lo que permite reconstruir la recepción de un versículo a lo largo de las eras de forma automatizada.
- Investigación sobre la Guenizá de El Cairo: `search_cairo_geniza` y `bridge_law_to_geniza` permiten buscar cartas, contratos y registros judiciales medievales por palabra clave y contrastarlos con pasajes legales, útil para historiadores del derecho y de la vida cotidiana medieval.
- Humanidades digitales y docencia: `browse_library_index` y `decode_hebrew_term` facilitan la construcción de materiales didácticos que explican la estructura de la biblioteca rabínica y expanden abreviaturas con su contexto (Talmud, Halajá o Cábala).
- Integración en pipelines de agentes: al ser un servidor MCP estándar, puede conectarse a Claude Code, Cursor o VS Code para que un agente de desarrollo consulte fuentes judías durante la construcción de aplicaciones de humanidades digitales, sin necesidad de gestionar claves de API.
- Análisis multilingüe alineado: `get_parallel_versions` permite estudiar una misma obra en judeoárabe, hebreo y inglés segmento a segmento, lo que sirve para investigación lingüística y para la traducción asistida de textos filosóficos medievales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de precisión, latencia o cobertura; solo describe el estado cualitativo de cada área funcional (por ejemplo, "funciona y probado en vivo" para lectura y búsqueda, "heurísticas de vocabulario" para las marcas de censura, o "aproximadamente 150 entradas" para el léxico de abreviaturas).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no contiene pesos de modelo y el servidor no ejecuta inferencia neuronal.
- GPU recomendadas: no aplica; el servidor es un proceso Python que hace llamadas HTTP a la API de Sefaria y al catálogo del Princeton Geniza Project.
- Ejecución en hardware de consumo: sí, en cualquier máquina capaz de ejecutar Python 3.10+; el coste computacional es el de un servidor de herramientas ligero.
- Opciones de despliegue: ejecución local como proceso stdio mediante `mcp dev server.py` (MCP Inspector), o bien registrado en clientes MCP como Claude Desktop, Claude Code, Cursor y VS Code mediante los ficheros de configuración `claude_desktop_config.json`, `~/.cursor/mcp.json` o `.vscode/mcp.json`.
- Latencia y throughput: no disponibles; dependen de la latencia de la API de Sefaria y de los servicios de terceros, que la propia model card advierte que pueden ser lentos o no estar disponibles.
- Instalación: clonar el repositorio, crear un entorno virtual con `python -m venv .venv`, instalar `requirements.txt` y, opcionalmente, ejecutar la suite de tests offline con `pytest -q`.

## Comparativa con modelos similares

| Proyecto | Tipo | Fuente de datos | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| `abr00kx/jewish-knowledge-mcp` | Servidor MCP con 12 herramientas | API de Sefaria y catálogo Princeton Geniza Project | en, he (más arameo y judeoárabe en las fuentes) | No elegida todavía | Beta, sin revisión externa |
| Servidores MCP oficiales de referencia | Servidores MCP genéricos (ficheros, git, etc.) | Recursos locales o APIs genéricas | Depende del servidor | Varía (habitualmente MIT) | Estables |
| Clientes de consulta directa a la API de Sefaria | Scripts o wrappers ad hoc | API de Sefaria | en, he | Varía | No estandarizados como MCP |

No se dispone de información sobre otros servidores MCP especializados en textos judíos con los que establecer una comparación cuantitativa de rendimiento, contexto o cobertura.

## Limitaciones y advertencias

- Software en estado beta: los nombres de las herramientas, sus parámetros y los formatos de salida pueden cambiar sin aviso.
- No ha tenido revisión externa ni uso prolongado; la propia model card lo advierte y pide reportar problemas en la pestaña Community.
- La verificación de citas se basa en solapamiento de palabras, no en una comprobación semántica; hay que leer el pasaje al que apunta el resultado.
- Las marcas de censura en el cotejo de testimonios son heurísticas de vocabulario, no detección filológica validada.
- La ingesta de manuscritos TEI solo se ha probado con ficheros de Digital Mishnah.
- La búsqueda en la Guenizá se hace por coincidencia de palabras clave sobre descripciones de catálogo, con los falsos positivos y negativos que ello implica.
- El léxico de abreviaturas contiene unas 150 entradas curadas a mano; hay que esperar lagunas en textos menos frecuentes.
- Dependencia total de servicios de terceros (API de Sefaria y catálogo del Princeton Geniza Project) que pueden ser lentos o no estar disponibles.
- Licencia no elegida todavía: no está claro el marco legal para uso comercial o redistribución; conviene contactar con el autor antes de integrarlo en producción.
- Riesgo de alucinación en el cliente que consume las herramientas: el servidor devuelve texto y citas, pero la síntesis final la genera el modelo cliente, por lo que se recomienda contrastar cualquier afirmación importante con las fuentes citadas.
- Cobertura incompleta en Cábala: Sefer Raziel HaMalakh no está en Sefaria y se resuelve a una entrada secundaria de *Otzar Midrashim* con una nota que lo indica.
- Idiomas limitados a inglés y hebreo en las etiquetas del repositorio, aunque los textos fuente incluyan arameo y judeoárabe.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abr00kx/jewish-knowledge-mcp
- Model Context Protocol (documentación oficial): https://modelcontextprotocol.io
- API de Sefaria: https://www.sefaria.org
- Princeton Geniza Project: no disponible en la información proporcionada
- Digital Mishnah: no disponible en la información proporcionada
