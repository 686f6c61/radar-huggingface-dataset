# DavidAU/support

## Resumen

DavidAU/support es un repositorio de Hugging Face publicado por DavidAU (David Belton) que, pese a estar etiquetado con pipeline_tag any-to-any y licencia apache-2.0, no contiene pesos ni artefactos de inferencia: su tamano de repositorio es de 0,0 GB y su model card es integramente una pagina de soporte, ayuda, patrocinio y contacto. Funciona como indice del catalogo del autor (mas de 380 repositorios) y como punto de entrada a las tecnologias que este declara desarrollar: Cold Fusion Training, Brainstorm Adapter, Turbo Brilliance y el dataset NEO Imatrix.

El contenido son enlaces: listados ordenados por likes, descargas y numero de parametros, busquedas filtradas para modelos MoE y sparse MoE (sufijos -a1, -a3, -a4), colecciones, canales de contacto (Discord, LinkedIn) y proyectos recientes como Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF y Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican. Tambien incluye una pagina de financiacion via Buy Me a Coffee.

Su relevancia es documental y de descubrimiento, no tecnica: sirve para localizar, evaluar y contactar sobre los modelos reales del autor. Cualquier intento de cargarlo con transformers o de servirlo con vLLM fallara, porque el repositorio no contiene ficheros de pesos (0,0 GB, 0 descargas y 14 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos ni codigo de modelo) |
| Parametros totales | no disponible (0,0 GB de repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; la model card menciona ggufs como parte del catalogo del autor, pero aqui no se distribuye ningun fichero |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio sin ficheros de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura ni proceso de entrenamiento que describir. El repositorio es una pagina informativa: su unico contenido es texto Markdown e imagenes (valhalla.webp, free-mind.gif) con enlaces a otros repositorios, formularios de contacto y listados ordenados. La etiqueta pipeline_tag: any-to-any y el library_name: transformers son metadatos declarados por el autor y no estan respaldados por ningun artefacto ejecutable en este repositorio.

La model card enumera tecnicas que el autor afirma aplicar en su catalogo (no en este repositorio): fine tuning sobre mas de 1000 modelos de diversos tipos, incluyendo MoE y sparse MoE; merging sobre mas de 2700 modelos; expansion y contraccion de tamano (por ejemplo 27B a 40B o 27B a 21B); Cold Fusion Training; el adaptador universal Brainstorm; la tecnologia Turbo Brilliance de generacion y reduccion de tokens; y el dataset NEO Imatrix. Se mencionan tambien las herramientas unsloth, mergekit y llama.cpp. No se aporta informacion sobre datos de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO) para este repositorio.

## Capacidades

- El repositorio no tiene capacidades de generacion, razonamiento, codigo, matematicas ni vision: no contiene pesos.
- Indexacion del catalogo del autor: enlaces a listados ordenados por likes, descargas, menor y mayor numero de parametros.
- Busqueda filtrada de modelos MoE: MoE propios, sparse MoE de tipo 4B (-a4), 3B (-a3) y 1B (-a1), y filtros por tamano (1B, 3B, 8B, 9B, 12B, 13B, 24B, 27B).
- Acceso a proyectos destacados: repositorios con sufijo GGUF y modelos de la familia Qwen3.8-27B.
- Canal de soporte y resolucion de dudas sobre los modelos del autor, con seccion de FAQs y documentacion de ayuda declaradas.
- Canal de contacto y encargo de proyectos: Discord (David_AU [drawless111]) y LinkedIn.
- Canal de financiacion: enlace a Buy Me a Coffee.
- Acceso a colecciones tematicas (38 declaradas) y a informacion sobre el partner nightmedia.
- Tool calling, function calling, agentes, multilingueismo, thinking mode, audio o vision: no disponible (no aplica a un repositorio de soporte).

## Casos de uso

- Descubrimiento de quants GGUF: un desarrollador con GPU consumer puede usar los enlaces por tamano y por tipo MoE/sparse MoE para localizar la variante cuantizada adecuada de los modelos del autor sin recorrer el buscador de Hugging Face.
- Punto de contacto para incidencias: si un modelo del catalogo falla al cargar en llama.cpp o en transformers, este repositorio concentra el canal de soporte declarado (Discord, LinkedIn) y las FAQs, evitando abrir discusiones en el repositorio equivocado.
- Encargo de fine tuning o merging: equipos que necesitan un ajuste especifico pueden usar los enlaces de contacto para solicitar trabajos sobre arquitecturas concretas (Llama, Qwen, Mistral, LFM, OpenAI, GLM, Gemma), que el autor declara haber realizado mas de 1000 veces.
- Evaluacion previa de tecnologias propietarias: un investigador que quiera valorar Cold Fusion Training, Brainstorm Adapter o Turbo Brilliance puede localizar aqui los repositorios donde se aplican antes de invertir tiempo en su evaluacion.
- Seguimiento de lanzamientos: los enlaces a los proyectos mas recientes y al listado ordenado por fecha de creacion permiten monitorizar novedades del catalogo sin suscribirse a cada repositorio.
- Localizacion de modelos reducidos por contraccion: para despliegues con VRAM limitada, los filtros por tamano (1B, 3B, 8B) permiten encontrar variantes contraidas de modelos mayores, una de las operaciones que el autor declara dominar.
- Verificacion de licencias antes de uso comercial: al ser un indice navegable, sirve como punto de partida para comprobar la licencia de cada modelo concreto del catalogo (este repositorio concreto declara apache-2.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni artefactos evaluables, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. La busqueda web no aporta resultados de benchmarks para DavidAU/support.

## Requisitos de hardware

- VRAM para inferencia: no aplica, no hay pesos que cargar (0,0 GB de repositorio).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU consumer: no aplica; el repositorio es texto e imagenes.
- Opciones de despliegue: no aplica para este repositorio (vLLM, llama.cpp, Ollama o TGI no pueden servirlo). Para los modelos reales del autor, la model card indica llama.cpp y GGUF, con quants de la comunidad en MLX y NVFP4; consultar cada repositorio concreto para requisitos de VRAM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existe categoria equivalente: DavidAU/support no es un modelo, sino una pagina de soporte e indice. Como referencia, se comparan los dos proyectos del mismo autor citados en la model card.

| Repositorio | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DavidAU/support | pagina de soporte e indice | no disponible (0,0 GB) | no disponible | apache-2.0 | no disponible |
| DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF | modelo (declarado) | no disponible | no disponible | no disponible | GGUF (por el sufijo del nombre) |
| DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican | modelo (declarado) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto o licencia de los dos repositorios de modelo en la informacion proporcionada, por lo que la comparativa no puede completarse con cifras.

## Limitaciones y advertencias

- No es un modelo desplegable: 0,0 GB de repositorio, sin ficheros de pesos, sin configuracion de arquitectura y sin tokenizer. Cargarlo con transformers o servirlo con vLLM no es posible.
- La etiqueta pipeline_tag: any-to-any y el library_name: transformers son metadatos sin respaldo en el contenido del repositorio; no deben interpretarse como capacidades reales.
- Las afirmaciones de la model card (mas de 1000 fine tunings, mas de 2700 mergings, Turbo Brilliance, Brainstorm Adapter, NEO Imatrix, "el dataset Imatrix mas potente jamas construido") son declaraciones del autor sin verificacion independiente en la informacion disponible.
- Riesgo de confusion en buscadores y pipelines automaticos: herramientas que indexan por pipeline_tag pueden clasificar este repositorio como modelo any-to-any y ofrecerlo para inferencia.
- Las fechas de creacion y actualizacion registradas (2026-10-07 y 2026-10-14) son posteriores a la fecha habitual de consulta; conviene verificar la validez de los metadatos.
- La licencia apache-2.0 se aplica al contenido de este repositorio, que es documental; no cubre ni representa la licencia de los modelos enlazados, que debe comprobarse repositorio a repositorio antes de cualquier uso comercial.
- Predominio del ingles: los idiomas declarados se limitan a en, por lo que la documentacion no esta disponible en castellano.
- Contenido promocional y solicitud de donaciones (Buy Me a Coffee) integrados en la propia model card; parte de los enlaces son de caracter comercial, no tecnico.
- Sesgos conocidos del modelo, alucinacion y limitaciones de contexto: no disponible (no hay modelo subyacente).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DavidAU/support
- Discusiones del repositorio: https://huggingface.co/DavidAU/support/discussions
- Ficha en AI Market Cap: https://aimarketcap.tech/models/davidau-support
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/DavidAU
- Repositorio principal del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelos por likes: https://huggingface.co/DavidAU/models?sort=likes
- Modelos por descargas: https://huggingface.co/DavidAU/models?sort=downloads
- Modelos por fecha de creacion: https://huggingface.co/DavidAU/models?sort=created
- Modelos MoE: https://huggingface.co/DavidAU/models?search=moe
- Modelos sparse MoE 4B (-a4): https://huggingface.co/DavidAU/models?search=-a4
- Modelos sparse MoE 3B (-a3): https://huggingface.co/DavidAU/models?search=-a3
- Modelos sparse MoE 1B (-a1): https://huggingface.co/DavidAU/models?search=-a1
- Proyecto Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Proyecto Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican: https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Repositorio del partner nightmedia: https://huggingface.co/nightmedia
- Colecciones de nightmedia: https://huggingface.co/nightmedia/collections
- Financiacion (Buy Me a Coffee): https://buymeacoffee.com/davidbelton
- LinkedIn del autor: https://www.linkedin.com/in/david-belton-5855b6370/
- LinkedIn del partner: https://www.linkedin.com/in/gchesler/
