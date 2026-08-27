# sitcod3/mimo-skills-collection

## Resumen

El repositorio `sitcod3/mimo-skills-collection` no es un modelo de inteligencia artificial, sino una colección de *skills* (habilidades) reutilizables diseñadas para agentes de código como OpenCode, MiMoCode, Claude Code y Codex CLI. Publicado por el usuario `sitcod3` en Hugging Face, este paquete agrupa configuraciones, scripts y plantillas que permiten ampliar las capacidades de estos agentes con tareas especializadas como investigación, generación de documentos, automatización de navegador, análisis de datos y desarrollo de frontend, entre otras.

La relevancia de este recurso radica en que los agentes de código modernos dependen de instrucciones estructuradas y reutilizables para ejecutar tareas complejas de forma fiable. Al ofrecer un conjunto de *skills* predefinidos y organizados por agente, el repositorio facilita la instalación y el uso de funcionalidades avanzadas sin necesidad de programar desde cero. Aunque no contiene pesos de modelo ni arquitectura neuronal, su utilidad práctica para desarrolladores que trabajan con asistentes de código es inmediata.

El repositorio incluye 27 *skills* integrados para MiMoCode, 10 para Claude Code, varios para Codex CLI y 2 personalizados, además de archivos de configuración para cada agente. La documentación proporciona instrucciones de instalación mediante comandos `cp` y variables de entorno para conectar con múltiples proveedores de API (OpenCode Zen, ModelArk, SambaNova, Lightning AI, etc.). No se especifican licencia, idiomas ni pipeline, y el número de descargas y *likes* es cero, lo que sugiere que es un proyecto reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es una coleccion de skills) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (contiene archivos de configuracion y scripts) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. Se trata de un conjunto de archivos de texto, scripts y configuraciones JSON que definen *skills* para agentes de código. Los *skills* son instrucciones estructuradas que los agentes cargan bajo demanda mediante herramientas nativas, como se describe en la documentación de MiMoCode. No hay datos de entrenamiento, tokens ni procesos de RLHF/DPO asociados.

## Capacidades

- Proporciona *skills* para tareas de investigacion academica (arxiv, deep-research, super-research, research-paper-writing).
- Incluye habilidades de generacion de documentos ofimaticos (docx-official, pptx-official, xlsx-official, pdf-official).
- Ofrece automatizacion de navegador y pruebas web (playwright, browser-automation, chrome-control).
- Incluye herramientas de analisis de datos y ciencia de datos (data-analytics, compose-next).
- Soporta desarrollo de frontend y diseno (frontend-design, design-blueprint, product-design).
- Incluye habilidades para creacion de skills (skill-creator, skill-installer) y evolucion de agentes (evolve, loop).
- Permite integracion con servicios externos mediante variables de entorno (OpenCode Zen, ModelArk, SambaNova, etc.).
- Compatible con multiples agentes: MiMoCode, Claude Code, Codex CLI y OpenCode.

## Casos de uso

- Investigacion academica automatizada: el skill `deep-research` permite a un agente buscar y sintetizar informacion de multiples fuentes, util para revisiones bibliograficas o informes tecnicos.
- Generacion de documentos corporativos: con `docx-official` y `pptx-official`, un agente puede crear informes en Word o presentaciones en PowerPoint a partir de datos estructurados.
- Automatizacion de pruebas web: el skill `playwright` habilita al agente para ejecutar pruebas de interfaz de usuario en navegadores, integrable en pipelines de CI/CD.
- Analisis de datos exploratorio: `data-analytics` permite al agente cargar datasets, generar estadisticas y visualizaciones, util para analistas que trabajan con asistentes de codigo.
- Desarrollo de frontend rapido: `frontend-design` y `design-blueprint` ayudan a generar prototipos de interfaces y maquetas a partir de descripciones textuales.
- Creacion de nuevos skills: `skill-creator` permite a los desarrolladores definir sus propias habilidades reutilizables para sus agentes, extendiendo la funcionalidad del repositorio.
- Gestion de ventas y CRM: el skill `sales` puede asistir en la redaccion de correos comerciales, seguimiento de clientes y generacion de propuestas.
- Seguridad y auditoria: `security-auditor` (en Claude Code) permite revisar codigo en busca de vulnerabilidades comunes, integrable en flujos de revision de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo, no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica: este repositorio no contiene modelos que requieran GPU o VRAM.
- Los *skills* se ejecutan dentro de agentes de codigo que pueden correr en maquinas locales o en la nube, dependiendo del agente y del proveedor de API configurado.
- Para usar los *skills* con MiMoCode, Claude Code, Codex CLI u OpenCode, se necesita instalar el agente correspondiente y configurar las claves de API de los proveedores deseados.
- No se requieren recursos de hardware especificos mas alla de los necesarios para ejecutar el agente y las llamadas a las APIs externas.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no es un modelo de lenguaje ni un sistema de IA generativa. Su funcion es complementaria a los agentes de codigo, no sustituirlos.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni ejecutar tareas por si mismo; depende completamente del agente que lo utilice.
- Requiere configuracion manual: la instalacion implica copiar archivos a directorios especificos y configurar variables de entorno con claves de API, lo que puede ser propenso a errores.
- Dependencia de servicios externos: muchos *skills* requieren acceso a APIs de pago o con limites de uso (OpenAI, Anthropic, etc.), lo que puede generar costes.
- Sin licencia especificada: al no indicarse licencia, el uso comercial y la redistribucion pueden ser ambiguos; se recomienda contactar al autor.
- Sin mantenimiento garantizado: el repositorio tiene cero descargas y cero *likes*, lo que sugiere que podria no recibir actualizaciones ni soporte.
- Riesgo de incompatibilidad: los *skills* estan pensados para versiones concretas de los agentes (por ejemplo, MiMoCode 0.1.13); cambios en las versiones futuras podrian romper la funcionalidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sitcod3/mimo-skills-collection
- GitHub de Xiaomi MiMo (referencia de skills): https://github.com/XiaomiMiMo/MiMo-Skills
- Sitio web de Sitcod3 Lab (Space de Hugging Face): https://huggingface.co/spaces/sitcod3/MojaWebstrana_Sitcod3
- Space alternativo de Sitcod3 Lab: https://huggingface.co/spaces/uranusmediaconn/MojaWebstrana_Sitcod3
- Pagina de skills de MiMoCode: https://mimo.xiaomi.com/mimocode/skills
