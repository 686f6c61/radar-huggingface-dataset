# baselquants/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo de tipo agente desarrollado por Moonshot AI, publicado como pesos abiertos bajo la Kimi K3 License. Se trata de un Mixture-of-Experts de 2,78 billones de parametros totales (2.779.931.837.184 segun los ficheros safetensors) que activa aproximadamente 104.000 millones de parametros por token, seleccionando 16 de 896 expertos. Incorpora una ventana de contexto de un millon de tokens y capacidades nativas de comprension de texto, imagen y video dentro del mismo modelo, con pipeline declarado `image-text-to-text`.

La relevancia del modelo radica en dos ejes. Por un lado, es el primer modelo abierto de clase 3T, lo que rebaja el umbral de acceso a inteligencia de frontera para investigacion y despliegue propio. Por otro, introduce una arquitectura nueva compuesta por Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un framework Stable LatentMoE que, segun el autor, aporta una mejora aproximada de 2,5x en eficiencia de escalado respecto a Kimi K2. La composicion de capas es hibrida: 69 capas KDA y 24 capas Gated MLA.

La ficha que se presenta aqui describe la publicacion `baselquants/Kimi-K3`, un repositorio de terceros (autor `baselquants`) que redistribuye el modelo en formato cuantizado a 8 bits mediante `compressed-tensors`, con un tamano de repositorio de 1561 GB. El repositorio registra 0 descargas y 0 likes en el momento de la consulta. La model card disponible esta truncada, por lo que varios campos tecnicos figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); atencion hibrida con 69 capas Kimi Delta Attention (KDA) + 24 capas Gated MLA; Attention Residuals (AttnRes); Stable LatentMoE |
| Parametros totales | 2.779.931.837.184 (~2,78 T) |
| Parametros activos | ~104 B por token (16 de 896 expertos) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit mediante `compressed-tensors` en este repositorio; el modelo original se distribuye con pesos sin cuantizar |
| Idiomas soportados | no disponible (la model card proporcionada no detalla el reparto de idiomas) |
| Licencia | Kimi K3 License (`license: other`, `license_name: kimi-k3`) |
| Formato de pesos | safetensors (variante `compressed-tensors` a 8 bits) |
| Capas totales | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Tamano del repositorio | 1561,0 GB |
| Libreria de referencia | transformers (requiere `custom_code`) |

## Arquitectura y entrenamiento

Kimi K3 es un transformer de tipo Mixture-of-Experts con atencion hibrida. De las 93 capas, 69 emplean Kimi Delta Attention (KDA), un mecanismo de atencion de tipo delta/lineal, y 24 emplean Gated MLA (Multi-head Latent Attention con compuerta). Esta combinacion reduce el coste de atencion sobre secuencias muy largas, ya que las capas KDA mantienen un estado de tamano constante en lugar de una cache que crece de forma lineal con la longitud del contexto; solo las 24 capas MLA acumulan cache de clave-valor convencional. El modelo incorpora ademas Attention Residuals (AttnRes) como mecanismo de conexion residual entre capas.

El enrutado MoE utiliza un esquema Stable LatentMoE con 896 expertos y una dimension latente de 3584, activando 16 expertos por token (una esparsidad de aproximadamente el 1,8 % de los expertos). Segun la model card, esto proporciona alrededor de 2,5x de mejora en eficiencia de escalado frente a Kimi K2. La capa densa unica y la dimension oculta de 7168 por capa completan la configuracion.

En cuanto a los datos de entrenamiento, la model card no especifica el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos figuran como no disponibles. La model card menciona que el modelo esta orientado a codificacion de horizonte largo, trabajo de conocimiento agentico y razonamiento, y que incluye vision nativa, pero no detalla la receta de entrenamiento. Tampoco se detallan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) mas alla de la propia arquitectura de atencion.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, con sesiones de ingenieria sostenidas y minima supervision humana.
- Codificacion sobre repositorios masivos: navegacion de codebases grandes, optimizacion de kernels de GPU, desarrollo de compiladores y orquestacion de herramientas de terminal.
- Trabajo de conocimiento agentico de extremo a extremo: investigacion profunda, generacion de visualizaciones interactivas, widgets, cuadros de mando y diseno de movimiento.
- Multimodalidad nativa: comprension de texto, imagenes y video en un unico modelo, con pipeline `image-text-to-text`.
- Contexto largo de hasta un millon de tokens, apto para documentos extensos, repositorios completos o transcripciones de video largas.
- Soporte de conversacion multi-turno (tag `conversational`).
- Capacidades de extraccion de caracteristicas (tag `feature-extraction`).
- Uso en tareas de vision aplicada dentro de bucles de desarrollo, como game dev con vision en el bucle o diseno asistido por ordenador (CAD), segun la model card.
- Soporte de tool calling / function calling: no se confirma de forma explicita en el extracto disponible, aunque la orientacion agentica del modelo y la orquestacion de herramientas de terminal descrita lo implican.
- Capacidades multilingues: no disponible, sin desglose de idiomas en la informacion proporcionada.

## Casos de uso

- Agentes de codificacion autonomos sobre repositorios grandes: el modelo puede sostener sesiones largas de ingenieria sin supervision, navegar codebases de gran tamano y ejecutar comandos de terminal, apoyandose en la ventana de un millon de tokens para mantener en contexto ficheros y dependencias relacionadas.
- Optimizacion de kernels de GPU y desarrollo de compiladores: la model card cita explicitamente estos escenarios como objetivos de diseno, lo que lo hace adecuado para tareas de bajo nivel donde se requiere razonamiento sobre codigo y ciclos de prueba y error largos.
- Investigacion profunda automatizada: generacion de informes con visualizaciones interactivas, cuadros de mando y widgets a partir de fuentes extensas, aprovechando la multimodalidad y el contexto largo.
- Edicion de video y diseno de movimiento asistidos: al comprender video de forma nativa, puede analizar clips y proponer o describir ediciones dentro de un flujo de trabajo automatizado.
- Inspeccion de documentacion tecnica y normativa extensa: con 1 M de tokens de contexto es viable cargar manuales completos, especificaciones o expedientes y formular consultas sobre ellos sin fragmentacion agresiva.
- Asistentes de soporte tecnico especializado multi-turno: conversaciones largas con historial extenso y adjuntos de imagen (capturas de pantalla, diagramas) dentro de la misma sesion.
- Generacion asistida de CAD y diseno de chips: escenarios citados en la model card donde el modelo opera con vision en el bucle para iterar sobre representaciones graficas.
- Analisis de video a gran escala para extraccion de caracteristicas: uso del pipeline `feature-extraction` sobre texto e imagen para alimentar sistemas de recuperacion o clasificacion posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card consultada esta truncada antes de cualquier tabla de evaluacion, y el repositorio incluye la etiqueta `eval-results` pero no se ha proporcionado el contenido asociado. Los resultados de busqueda web recibidos no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- Peso de los ficheros de este repositorio: 1561 GB en safetensors a 8 bits. Se necesita almacenamiento en disco de al menos esa cifra, mas espacio temporal para la descarga.
- VRAM estimada para inferencia a 8 bits: en torno a 1,6 TB si se mantienen todos los pesos en memoria de GPU. Los pesos sin cuantizar del modelo original (aproximadamente 5,5 TB en bf16, estimacion a partir de los 2,78 T de parametros) quedan fuera de cualquier nodo unico actual.
- GPU recomendadas: despliegue en multiples nodos con aceleradores de 80 GB o mas (H100, H200, B200, MI300X). Un nodo de 8 GPU de 80 GB (640 GB) es insuficiente incluso a 8 bits; se requieren del orden de 16 a 24 GPU de 80 GB, o 8 a 16 aceleradores de 141-192 GB, para alojar los pesos a 8 bits.
- Cabe en GPU de consumo: no. Ni siquiera con cuantizaciones agresivas a 4 bits (aproximadamente 1,4 TB estimados) el modelo entra en configuraciones de consumo tipo RTX 4090 (24 GB), ni en un nodo de 8x RTX 4090 (192 GB).
- Despliegue: la libreria declarada es `transformers` con `custom_code`, por lo que se requiere cargar codigo remoto y confiar en el mismo. Para servicio de produccion serian necesarios motores con soporte de la arquitectura KDA/AttnRes (vLLM o SGLang con implementacion especifica), o bien estrategias de offloading de expertos a CPU y NVMe. No se incluyen pesos GGUF en este repositorio, por lo que llama.cpp u Ollama no son utilizables directamente con estos ficheros.
- Latencia y throughput: no disponible. Como referencia estructural, al activar solo unos 104 B de parametros por token, el coste computacional por token es comparable al de un modelo denso de ese orden, muy inferior al de un denso de 2,78 T; sin embargo, el coste de memoria viene dominado por los 2,78 T de pesos que hay que mantener residentes.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de informacion publica general y no de la busqueda web realizada, por lo que conviene verificarlos antes de citarlos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kimi K3 (este modelo) | ~2,78 T | ~104 B | 1.000.000 tokens | Kimi K3 License | safetensors (8 bits en este repo) |
| Kimi K2 (Moonshot AI) | ~1 T | ~32 B | 128.000 tokens | licencia tipo MIT modificada | safetensors |
| DeepSeek-V3 (DeepSeek) | ~671 B | ~37 B | 128.000 tokens | MIT | safetensors |
| Llama 3.1 405B (Meta) | 405 B (denso) | 405 B | 128.000 tokens | Llama 3.1 Community License | safetensors |

Kimi K3 se situa por encima de sus alternativas abiertas tanto en parametros totales como en ventana de contexto, con la salvedad de que su licencia es propia y mas restrictiva que MIT, y de que el requisito de hardware es sustancialmente mayor.

## Limitaciones y advertencias

- La model card disponible esta truncada: faltan secciones de evaluacion, idiomas, detalles de entrenamiento y recomendaciones de uso. Cualquier decision de produccion deberia basarse en la model card completa en el repositorio de Moonshot AI.
- Este repositorio concreto es una publicacion de terceros (`baselquants`) con 0 descargas y 0 likes. No hay evidencia de validacion independiente de la calidad de la cuantizacion a 8 bits ni de que los pesos reproduzcan fielmente el comportamiento del modelo original.
- El repositorio declara `custom_code`, lo que implica ejecutar codigo remoto al cargar el modelo con `transformers`. Es un riesgo de seguridad en entornos de produccion si no se audita previamente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en modelos de este tipo, especialmente en tareas de investigacion profunda donde el modelo genera sintesis a partir de fuentes.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: la Kimi K3 License es una licencia propia (`license: other`), no una licencia open source estandar. Es imprescindible revisar el texto completo en el fichero LICENSE del repositorio oficial antes de cualquier uso comercial. No se ha podido verificar desde la informacion proporcionada si permite uso comercial, si impone limites de escala o si exige atribucion especifica.
- Limitaciones de idioma: sin datos. No se puede confirmar el grado de soporte de castellano ni de otras lenguas distintas del ingles.
- Coste de despliegue: el requisito de hardware (del orden de 1,6 TB en GPU a 8 bits) excluye practicamente cualquier escenario de inferencia local o de pequeno equipo.
- Rendimiento no verificado: al no haber benchmarks publicados en la informacion disponible, las afirmaciones de la model card (mejora de 2,5x en eficiencia de escalado, capacidades de codificacion de horizonte largo) no pueden contrastarse de forma independiente.

## Enlaces

- Repositorio en HuggingFace (esta publicacion): https://huggingface.co/baselquants/Kimi-K3
- Organizacion oficial en HuggingFace: https://huggingface.co/moonshotai
- Modelo oficial en HuggingFace: https://huggingface.co/moonshotai/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Sitio del desarrollador: https://www.moonshot.ai
- Chat: https://www.kimi.com
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces anteriores proceden de la model card del autor.
