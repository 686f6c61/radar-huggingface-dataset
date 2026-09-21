# Qball1142777/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo de tipo agente, publicado con pesos abiertos, desarrollado por Moonshot AI (la subida analizada, `Qball1142777/Kimi-K3`, es una réplica alojada por un tercero). Se trata de un modelo de mezcla de expertos (MoE) con 2,8 billones de parámetros totales, de los cuales se activan 104.000 millones por token, construido sobre las arquitecturas Kimi Delta Attention (KDA) y Attention Residuals (AttnRes). Según el autor, es el primer modelo abierto de clase 3T y está orientado a razonamiento de horizonte largo, codificación sobre repositorios extensos y trabajo de conocimiento con agentes.

Su rasgo más diferencial es la combinación de una ventana de contexto de 1 millón de tokens con capacidades nativas de visión: el modelo procesa texto, imágenes y vídeo dentro del mismo modelo, sin adaptadores externos. La composición de atención reparte 93 capas en 69 capas KDA y 24 capas de Gated MLA, lo que reduce el coste de atención en secuencias muy largas frente a un transformer denso convencional.

La relevancia actual del modelo reside en que traslada al ecosistema abierto un rango de capacidad reservado hasta ahora a modelos propietarios, con una mejora declarada de aproximadamente 2,5 veces en eficiencia de escalado respecto a Kimi K2 gracias al marco Stable LatentMoE (16 de 896 expertos activados). La licencia es propia (Kimi K3 License), no estándar, por lo que conviene revisarla antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre Kimi Delta Attention (KDA) + Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (~2,8 T) segun safetensors; 2,8 T segun la model card |
| Parametros activos | 104.000 millones (104 B) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (etiqueta `8-bit`, `compressed-tensors`); no disponible el detalle de esquemas adicionales |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (`license: other`, `license_name: kimi-k3`) |
| Formato de pesos | safetensors (repo de 1561,0 GB); requiere `trust_remote_code` por la etiqueta `custom_code` |

Datos arquitectonicos adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Numero de capas | 93 |
| Capas densas | 1 |
| Composicion de capas de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Numero de cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

La model card describe una arquitectura MoE de 93 capas con una unica capa densa. El bloque de atencion es hibrido: 69 capas emplean Kimi Delta Attention (KDA), un mecanismo de atencion con estado recurrente orientado a secuencias largas, y 24 capas usan Gated MLA (Multi-head Latent Attention con compuerta), que comprime el cache KV en un espacio latente de dimension reducida. La dimension oculta de atencion es 7168 con 96 cabezas. El enrutamiento MoE opera sobre un espacio latente de 3584 dimensiones con 896 expertos de 3072 dimensiones ocultas cada uno, activando 16 expertos por token mediante el marco Stable LatentMoE.

La innovacion tecnica principal declarada es esa mayor dispersión del MoE combinada con el enrutamiento en espacio latente, que segun el autor produce una mejora de aproximadamente 2,5 veces en eficiencia de escalado global frente a Kimi K2. El modelo incorpora ademas capacidades de vision nativas (texto, imagen y video) integradas en el mismo modelo, no como modulo acoplado.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineamiento en la informacion proporcionada. Tampoco se detalla el proceso de entrenamiento multimodal. La etiqueta `eval-results` aparece en el repositorio, pero no se incluyen cifras en la model card analizada.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, con sesiones de ingenieria sostenidas y minima supervision humana.
- Codificacion avanzada: navegacion de repositorios masivos, orquestacion de herramientas de terminal, optimizacion de kernels de GPU, desarrollo de compiladores y diseno de chips.
- Trabajo de conocimiento con agentes: investigacion profunda de extremo a extremo, generacion de visualizaciones interactivas, widgets y dashboards.
- Diseno de movimiento y edicion de video.
- Multimodalidad nativa: comprension de texto, imagenes y video en el mismo modelo.
- Contexto de 1 millon de tokens, apto para documentos y bases de codigo extensas.
- Orientacion agentica y multi-paso, con uso de herramientas externas (tool calling) implicito en su perfil de "modelo agente"; no se detalla el formato exacto de function calling en la informacion disponible.
- Etiquetado tambien como `feature-extraction`, lo que sugiere uso como extractor de representaciones.
- Idiomas soportados: no disponible.
- No se documenta un modo de razonamiento explicito (thinking mode) separado ni capacidades de audio.

## Casos de uso

- Ingenieria de software sobre monorepos: con 1 millon de tokens de contexto, el modelo puede cargar simultaneamente grandes volumenes de codigo fuente, historicos de cambios y documentacion para localizar dependencias cruzadas y proponer refactorizaciones sin trocear el repositorio.
- Optimizacion de kernels y bajo nivel: su capacidad declarada de orquestar herramientas de terminal y trabajar sobre codigo de compilador lo hace util para iterar sobre kernels CUDA o pases de compilador con ciclos de prueba y error automatizados.
- Investigacion profunda asistida: generacion de informes con visualizaciones, dashboards y widgets interactivos a partir de fuentes extensas, aprovechando el contexto largo y la multimodalidad para incorporar graficos e imagenes.
- Analisis de documentacion tecnica con imagenes: al ser `image-text-to-text`, puede procesar planos, diagramas de arquitectura, capturas de pantalla de interfaces o figuras de papers junto al texto asociado, algo util en soporte tecnico y en revision de disenos.
- Edicion de video y diseno de movimiento: comprension nativa de video dentro del mismo modelo, aplicable a tareas de descripcion, segmentacion o guionizacion automatizada de material audiovisual.
- Agentes autonomos de automatizacion de oficina: flujos multi-paso que combinan lectura de documentos largos, llamadas a herramientas y generacion de entregables estructurados.
- Auditoria y revision de contratos o normativa extensa: el contexto de 1M tokens permite mantener un corpus normativo completo en memoria y responder consultas con trazabilidad sobre el texto original.
- Extraccion de caracteristicas para recuperacion: la etiqueta `feature-extraction` habilita su uso como encoder para indexacion semantica de colecciones multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio incluye la etiqueta `eval-results`, pero la model card analizada no contiene tablas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y los resultados de busqueda web obtenidos no aportan datos sobre este modelo. No se deben asumir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,78 T de parametros, en 8-bit los pesos ocupan aproximadamente 2,8 TB; en 4-bit, en torno a 1,4 TB. El repositorio ocupa 1561 GB, lo que corresponde a unos 4,5 bits por parametro de media, coherente con un esquema mixto ya cuantizado. Estas cifras son calculos derivados de los parametros declarados, no datos publicados por el autor.
- GPU recomendadas: por volumen de pesos, el despliegue exige un cluster multi-nodo. Configuraciones realistas incluyen multiples nodos con 8x H100 80 GB o 8x H200 141 GB. Una unica GPU, incluida una H100, no es suficiente ni en 4-bit.
- Cabe en GPU de consumo: no. Una RTX 4090 (24 GB) o una RTX 5090 no pueden alojar el modelo ni siquiera con cuantizaciones agresivas. El coste de computo por token, en cambio, corresponde a un modelo de ~104 B activos, por lo que el throughput puede ser competitivo si se dispone de memoria suficiente.
- Opciones de despliegue: la libreria declarada es transformers con `custom_code`, lo que obliga a `trust_remote_code=True`. No se confirma compatibilidad con vLLM, SGLang, TGI ni llama.cpp en la informacion disponible; tampoco se ofrecen pesos GGUF.
- Latencia y throughput estimados: no disponibles. Dependeran criticamente del ancho de banda de interconexion entre nodos (InfiniBand/NVLink) y del grado de paralelismo de expertos.

## Comparativa con modelos similares

La unica comparacion con datos en la informacion proporcionada es con Kimi K2, mencionado por el propio autor:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8 T | 104 B | 1 M tokens | Kimi K3 License | Pesos abiertos en HuggingFace |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card como generacion anterior |

Lo unico cuantificado es que K3 declara una mejora de aproximadamente 2,5 veces en eficiencia de escalado frente a K2 gracias al marco Stable LatentMoE. No hay datos de contexto, licencia ni parametros de K2 en la informacion proporcionada, ni tampoco comparativas con alternativas de otros desarrolladores. No se dispone de resultados de benchmarks que permitan una comparacion objetiva de rendimiento.

## Limitaciones y advertencias

- Licencia no estandar: la Kimi K3 License es una licencia propia con condiciones que no se detallan en la informacion analizada. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Repositorio de terceros: la subida corresponde al usuario `Qball1142777`, no a la organizacion oficial `moonshotai`. Con 0 descargas y 0 likes, no hay validacion de la comunidad sobre la integridad de los pesos. Se recomienda contrastar con el repositorio oficial de Moonshot AI.
- Ejecucion de codigo remoto: la etiqueta `custom_code` implica que cargar el modelo ejecuta codigo Python del repositorio. Es un vector de riesgo si el origen no es de confianza.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano ni en otras lenguas sin evaluacion previa.
- Sin datos de benchmarks: no hay evidencia publicada en la informacion disponible sobre calidad real, tasas de alucinacion o robustez. Cualquier cifra que se use debe provenir de una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos de gran escala; en tareas de investigacion profunda y generacion de informes conviene verificar las afirmaciones contra las fuentes.
- Tamano prohibitivo: el despliegue requiere infraestructura multi-nodo, lo que excluye su uso en entornos de desarrollo individuales y encarece el autoalojamiento.
- Modelo de fecha futura en los metadatos (creado y actualizado el 21 de septiembre de 2026), dato que conviene tratar con cautela al proceder de un repositorio no verificado.
- No se documentan limitaciones especificas de contexto, sesgos conocidos ni restricciones geograficas mas alla de la etiqueta `region:us`.

## Enlaces

- HuggingFace (replica analizada): https://huggingface.co/Qball1142777/Kimi-K3
- Organizacion oficial en HuggingFace: https://huggingface.co/moonshotai
- Repositorio oficial en HuggingFace (referenciado en la model card): https://huggingface.co/moonshotai/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Web oficial de Moonshot AI: https://www.moonshot.ai
- Chat: https://www.kimi.com
- X/Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; las entradas obtenidas correspondian a paginas de soporte de OpenAI y no aportan informacion tecnica.
