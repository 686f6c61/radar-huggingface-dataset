# FinweeBR/controle-popular

## Resumen

FinweeBR/controle-popular no es un modelo de lenguaje ni un modelo de IA en el sentido habitual de Hugging Face: es el espejo de publicacion del portal de transparencia publica Controle Popular, un monorepo de codigo (0,2 GB) con la aplicacion web, los colectores ETL y la documentacion del proyecto. Lo desarrolla el autor identificado como FinweeBR, con presencia en controlepopular.com.br y un dominio de respaldo en Cloudflare Workers, y se publica tambien en GitLab como espejo de resiliencia. El repositorio no declara pipeline, idiomas ni licencia en los metadatos de Hugging Face, no tiene descargas ni likes, y fue creado el 28 de septiembre de 2026 y actualizado el 2 de octubre de 2026.

El problema que aborda es la dispersion del dato publico brasileno: contratos, licitaciones, diarios oficiales municipales, presupuestos de las 27 asambleas legislativas, proposiciones del Congreso, composicion del sistema judicial, reparto de la reparacion de Brumadinho (R$ 1,64 mil millones a 853 municipios), el acuerdo de Mariana, barragens de mineria, terrenos indigenas, unidades de conservacion e indicadores internacionales (ONU/PNUD, UNESCO, OMS, OMC/Comtrade, SEC EDGAR, TSX). Todo se agrega por ciudad y por tema, en portugues comun, con hipervinculo verificado a la fuente y con la tasa de error declarada junto a cada estimacion.

Su relevancia como artefacto de IA es indirecta: el portal incluye un asistente civico ("Seu Nono") basado en RAG deterministico sobre un cuaderno de notas offline con citas numericas al estilo `[n]`, widgets de Generative UI y un catalogo de 22 bases de datos. El modelo generativo concreto que alimenta ese asistente no esta especificado en la informacion disponible, y la longitud de sus respuestas esta limitada a 13 palabras por diseno editorial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion web (monorepo npm): Next.js 16 con App Router en `apps/web`; ETL en Python en `etl/`; Postgres (Neon o local) para lecturas en build y Cloudflare D1 para escrituras en vivo; despliegue en Cloudflare Workers via OpenNext |
| Parametros totales | no aplicable (el repositorio no contiene pesos de modelo) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible; el asistente civico Seu Nono devuelve respuestas de hasta 13 palabras |
| Tipos de cuantizacion | no aplicable (no hay pesos que cuantizar) |
| Idiomas soportados | portugues, ingles y espanol (modo triligue dinamico PT/EN/ES con sintesis de voz y exportacion multilingue) |
| Licencia | AGPL-3.0-or-later segun el fichero LICENSE del repositorio; los metadatos de Hugging Face no declaran licencia |
| Formato de pesos | no aplicable; codigo fuente, consultas, documentacion y activos web (tamano del repositorio: 0,2 GB) |

## Arquitectura y entrenamiento

No existe entrenamiento ni corpus de tokens: el artefacto es software. La capa de datos combina un ETL en Python con 397 colectores monitorizados por telemetria continua (`vigia-dados-etl.mts`), un registro unico de fuentes en `lib/fontes/registry.ts` que declara la capa de asignacion y la ruta de cada base, y una validacion automatizada que rechaza rutas inexistentes. La clasificacion tematica de los diarios oficiales municipales es deterministica, no estadistica. El portal se sirve desde Cloudflare Workers mediante OpenNext y expone datos agregados como JSON abierto y sin clave a traves de una API versionada (`/api/v1/` con contrato estable, con `/api/v2/` reservada para cambios rompientes) y una especificacion OpenAPI.

La unica capa propiamente de IA descrita es el asistente civico Seu Nono, construido como RAG deterministico sobre un cuaderno de notas offline con citas `[n]`, un mapa mental en arbol al estilo Obsidian y una escalera de navegacion que cubre mas de 100 paginas del portal, complementado con widgets de Generative UI. La model card no indica que modelo generativo, proveedor, tamano o tecnica de alineamiento (RLHF, DPO u otras) hay detras de ese asistente, por lo que no es posible evaluar esa capa con los datos disponibles. Si se documenta un algoritmo de sanitizacion y anonimizacion previa de datos personales (CPF con validacion Mod-11, SSN y SIN) antes de cualquier persistencia, presentado por el autor como cumplimiento del 100 % de la LGPD.

## Capacidades

Las capacidades descritas corresponden al portal y a su API, no a un modelo de pesos:

- Agregacion de dato publico oficial disperso por ciudad, tema y frente tematica (municipios, asambleas estatales, Congreso, Judiciario, funcion social de la tierra, reparacion de Brumadinho, observatorio socioambiental, ambito internacional).
- Clasificacion tematica deterministica de diarios oficiales municipales y de proposiciones federales.
- Busqueda textual y filtros facetados por etiquetas reales, con ordenacion ascendente y descendente por columna (clases, fechas y valores).
- Microresumenes y tarjetas de cabecera con agregados por pagina.
- Exportacion a CSV con BOM UTF-8 y separador `;` para Excel, e impresion nativa via CSS.
- Modo triligue dinamico (portugues, ingles, espanol) con alternancia reactiva en la interfaz, lectura en audio por sintesis de voz y exportacion multilingue.
- Asistente civico Seu Nono: RAG deterministico con respuestas cortas de hasta 13 palabras, citas `[n]` y navegacion guiada sobre mas de 100 paginas.
- Sanitizacion y anonimizacion automatica de datos personales (CPF Mod-11, SSN, SIN) antes de la persistencia en datos abiertos.
- Vigilancia de ETL: telemetria continua de 397 colectores y comprobacion automatizada de fuentes inspirada en IFCN, Lupa y Aos Fatos.
- API publica sin clave con Swagger UI ("Try it out"), especificacion OpenAPI en `/api/openapi.yaml` y datasets en `/api/v1/`.
- Catalogo de 22 bases integrado en el Laboratorio de Datos, con cuaderno offline tipo NotebookLM civico y widgets de Generative UI.
- Guarda anti-apodrecimiento del catalogo de fuentes: un test automatizado rechaza rutas que no existen en el repositorio.

No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en un modelo subyacente, porque el modelo subyacente no se identifica.

## Casos de uso

- Auditoria de contratos y licitaciones municipales: agregar por municipio los contratos y procesos de licitacion publicados en sistemas distintos, con hipervinculo verificado a la fuente oficial, para que un equipo de control interno pueda revisar el mismo dato sin recorrer decenas de portales.
- Analisis de diarios oficiales municipales: la clasificacion tematica deterministica permite filtrar publicaciones por tema, fecha y entidad, y ordenar por columnas, lo que reduce el trabajo manual de revisar boletines diarios en ciudades como Sao Paulo, Belo Horizonte, Betim, Diamantina, Aracuai o Itinga.
- Seguimiento de la reparacion de Brumadinho: la ruta `/paraopeba` concentra la auditoria FGV/AECOM, el reparto a los 853 municipios (R$ 1,64 mil millones), el clipping y la linea temporal, lo que sirve a periodistas y defensores publicos que necesitan reconstruir el estado de la reparacion en una sola pantalla.
- Vigilancia ambiental y de barragens: `/ambiental` reune el acuerdo de Mariana, el observatorio Vale S.A., el SIGBM, licencias IBAMA, TACs, decisiones LAI/CGE y la agenda COPAM; util para organizaciones ambientales y ministerios publicos que monitorizan riesgo de rotura de barragens.
- Analisis presupuestario legislativo: `/assembleias` ofrece composicion, presupuestos, proposiciones y diarios oficiales de las 27 asambleas legislativas estatales, adecuado para estudios comparados de gasto parlamentario por estado.
- Integracion en pipelines de datos y cuadernos analiticos: la API JSON sin clave con contrato estable `/api/v1/` y Swagger UI permite alimentar cuadernos de Jupyter, dashboards en BI o procesos automatizados de verificacion sin scraping fragil.
- Verificacion de hechos y periodismo de datos: el vigia de ETL y la comprobacion automatizada de fuentes, junto con la regla editorial de mostrar la tasa de error junto a cada estimacion, dan soporte a redacciones que necesitan trazabilidad de la cifra publicada.
- Consulta ciudadana en lenguaje comun: el asistente Seu Nono responde en frases de hasta 13 palabras con citas `[n]`, lo que encaja en interfaces de atencion al ciudadano y en puntos de acceso de baja alfabetizacion digital.
- Analisis internacional comparado: `/internacional`, `/eua` y `/canada` integran indicadores ONU/PNUD (IDH, Gini, GII), UNESCO, OMS, comercio OMC/Comtrade, corporaciones de SEC EDGAR y mineras de TSX para estudios de contexto regulatorio y social.
- Docencia y laboratorio de datos civicos: el cuaderno offline del Laboratorio de Datos permite trabajar sin conexion con citas verificables, util en talleres de periodismo de datos y en cursos de transparencia publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni pipeline declarado, por lo que metricas como MMLU, HumanEval o GSM8K no aplican. La model card si aporta dos datos medidos sobre la calidad interna del proyecto: la revision del catalogo de fuentes detecto 13 de 42 rutas rotas en una de las revisiones, motivo por el que se incorporo un test que rechaza rutas inexistentes, y la monitorizacion cubre 397 colectores mediante telemetria continua. No hay cifras publicadas de latencia, throughput ni cobertura efectiva por fuente.

## Requisitos de hardware

- No requiere GPU para su funcionamiento: es una aplicacion web, no una carga de inferencia. La VRAM estimada es no aplicable.
- Entorno local: Node 22, Python 3.12 y PostgreSQL 16, segun el propio README del proyecto.
- Despliegue en produccion: Cloudflare Workers mediante OpenNext, con Cloudflare D1 para escrituras en vivo y Postgres (Neon o local) para las lecturas en build.
- Comando de despliegue documentado: `cd apps/web && npm run cf:deploy`.
- GPU recomendadas: no disponible (no hay inferencia de modelo que dimensionar en el repositorio).
- Cabe en GPU de consumo: no aplicable.
- Opciones de despliegue alternativas tipo vLLM, llama.cpp, Ollama o TGI: no aplicables a este repositorio; si el asistente Seu Nono invoca un LLM externo, el proveedor y el runtime no se especifican en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a la categoria de modelos de IA, por lo que no existe un conjunto de modelos comparables con parametros, contexto, rendimiento y licencia equiparables. Lo mas cercano funcionalmente son portales de transparencia publica, cuya informacion tecnica no se ha verificado en esta busqueda:

| Alternativa | Naturaleza | Parametros / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Controle Popular (este repositorio) | Portal de transparencia publica con API abierta y chatbot RAG | no aplicable / no disponible | no disponible | AGPL-3.0-or-later | Publico en web, Hugging Face y GitLab |
| Portales de transparencia gubernamentales (por ejemplo, iniciativas de datos abiertos del Gobierno de Brasil) | Portales institucionales de datos abiertos | no verificado en la informacion proporcionada | no disponible | no verificado | no verificado |
| Proyectos civicos de datos parlamentarios y de financiacion politica | Agregadores civicos de datos publicos | no verificado en la informacion proporcionada | no disponible | no verificado | no verificado |
| Modelos de lenguaje de 0,2 GB del catalogo de Hugging Face | Modelos de IA con pesos | no comparable (el repositorio no contiene pesos) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no se entrena, no se cuantiza y no puede evaluarse con benchmarks de modelos de lenguaje. Cualquier ficha que lo presente como modelo generativo seria inexacta.
- Licencia AGPL-3.0-or-later, con copyleft fuerte: su uso como servicio en red obliga a ofrecer el codigo fuente correspondiente a los usuarios que interactuan con el. Es un punto critico antes de integrarlo en un producto propietario o de reutilizar su codigo.
- Los metadatos de Hugging Face no declaran licencia ni idiomas; la licencia solo consta en el fichero LICENSE del repositorio, por lo que conviene verificarla antes de cualquier uso comercial.
- Cobertura geografica asimetrica: el enfasis esta en Brasil y, en particular, en Minas Gerais (reparacion de Brumadinho, cuenca del Paraopeba, municipios de ejemplo como SP, BH, Betim, Diamantina, Aracuai e Itinga). La seccion internacional se limita a indicadores y entidades concretas.
- Riesgo de dato desactualizado: los colectores dependen de fuentes externas que pueden cambiar de formato o desaparecer. La propia model card reconoce que "catalogo de dato apodrece en silencio" y documenta que una revision detecto 13 de 42 rutas rotas.
- Las lagunas de informacion se declaran de forma explicita en la interfaz, y las estimaciones se acompanan de su tasa de error. Cualquier cifra debe leerse junto a su fuente y su margen declarado, no de forma aislada.
- El asistente Seu Nono es un RAG deterministico con respuestas de hasta 13 palabras: no es un asistente de proposito general, no se documenta su modelo subyacente y su alcance queda limitado al corpus indexado, con riesgo de desactualizacion del propio cuaderno.
- La afirmacion de cumplimiento del 100 % de la LGPD y de anonimizacion de CPF, SSN y SIN procede del autor y no se ha verificado de forma independiente.
- Sin validacion de la comunidad: 0 descargas y 0 likes en Hugging Face a fecha de la informacion disponible, sin pipeline declarado.
- Autoridad de la fuente: se trata de un portal independiente, no de una institucion oficial. La trazabilidad depende de que la fuente publica enlazada siga disponible.
- Fechas de referencia del repositorio: creado el 28 de septiembre de 2026, actualizado el 2 de octubre de 2026. El estado de los datos posteriores a esa fecha no esta cubierto por esta ficha.
- Tamano del repositorio de 0,2 GB: se trata de codigo, documentacion y activos, no de artefactos de modelo reutilizables para inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FinweeBR/controle-popular
- Portal en produccion: https://controlepopular.com.br
- Dominio de respaldo: https://controlepopular.finweejur.workers.dev
- Documentacion interactiva de la API (Swagger UI): https://controlepopular.com.br/api
- Especificacion OpenAPI: `/api/openapi.yaml`
- Endpoint de datasets: `/api/v1/`
- README en ingles: `README.en.md`
- Indice de documentacion: `docs/LEIA-PRIMEIRO.md`
- Descripcion de producto y reglas editoriales: `docs/01-produto/PRODUTO.md`
- Estado del proyecto, cola y deuda tecnica: `docs/02-estado/ESTADO.md`
- Catalogo de fuentes y sus trampas medidas: `docs/06-fontes/FONTES.md`
- Uso del catalogo federal de datos: `docs/06-fontes/DADOS-GOV-BR.md`
- Reglas duras del repositorio: `AGENTS.md`
- Guia de operacion: `docs/05-operacao/OPERACAO.md`
- Licencia: `LICENSE` (AGPL-3.0-or-later)

Otros enlaces devueltos por la busqueda web, no relacionados con este repositorio:

- LLM Leaderboard & AI Model Benchmarks, octubre de 2026: https://benchlm.ai/
- A Call for Control of Frontier AI Models (Valtioneuvosto): https://valtioneuvosto.fi/en/-/a-call-for-control-of-frontier-ai-models
- Top 10 AI Models in 2026: Ranked by Benchmarks: https://techjournal.org/top-10-artificial-intelligence-models
- ClawLabsAI/free-ai-models en GitHub: https://github.com/ClawLabsAI/free-ai-models
- LLM leaderboard 2026, rankings por benchmark: https://artificialwatch.com/benchmarks
