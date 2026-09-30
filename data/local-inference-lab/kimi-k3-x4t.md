# local-inference-lab/Kimi-K3-X4T

## Resumen

Kimi-K3-X4T es una compresión del modelo Kimi K3 publicada por el usuario `local-inference-lab` en HuggingFace. El modelo base es un MoE multimodal nativo desarrollado por Moonshot AI, con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token, construido sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), y con una ventana de contexto de 1 millón de tokens. Moonshot AI lo presenta como el primer modelo abierto de clase 3T.

El repositorio concreto que analizamos no es la publicación oficial de Moonshot AI, sino una conversión alojada por `local-inference-lab` bajo la etiqueta `compressed-tensors`, con pipeline `image-text-to-text` y licencia `kimi-k3` (identificada como `other`). En el momento de la consulta acumula 0 descargas y 0 likes, y no incluye documentación propia más allá de la model card heredada del modelo original.

Su relevancia radica en dos factores: por un lado, la arquitectura del modelo base (MoE de 896 expertos con 16 activos, atención híbrida KDA + Gated MLA y multimodalidad nativa); por otro, el hecho de que existan conversiones de terceros que intentan hacer manejable un modelo de esta escala mediante cuantización agresiva. La ficha se centra en lo que la información disponible permite afirmar, marcando explícitamente todo aquello que no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: 69 capas KDA + 24 capas Gated MLA |
| Parametros totales | 2,8 billones (2,8T) |
| Parametros activos | 104.000 millones (104B) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | Etiquetado como `compressed-tensors`; el esquema exacto (bits, granularidad, calibracion) no esta documentado en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (campo `license: other` con `license_name: kimi-k3`) |
| Formato de pesos | no disponible; el tag de libreria es `compressed-tensors` y la libreria declarada es `transformers` |
| Numero de capas | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Modalidades de entrada | Texto, imagen y video |
| Pipeline declarado | image-text-to-text |
| Autor del repositorio | local-inference-lab |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun metadatos) | 2026-09-30 |

## Arquitectura y entrenamiento

Kimi K3 es un transformer de tipo Mixture-of-Experts que sustituye el esquema de atencion clasico por una combinacion de dos mecanismos: Kimi Delta Attention (KDA) en 69 de las 93 capas y Gated MLA (Multi-head Latent Attention con compuerta) en las 24 restantes. La dimension oculta de atencion es de 7168 con 96 cabezas. La capa MoE opera en un espacio latente de 3584 dimensiones, con 896 expertos de 3072 dimensiones ocultas cada uno, de los cuales se activan 16 por token. Moonshot AI denomina a este esquema Stable LatentMoE y afirma que proporciona una mejora aproximada de 2,5 veces en eficiencia de escalado respecto a Kimi K2.

El modelo es multimodal nativo: procesa texto, imagenes y video dentro del mismo modelo, sin adaptadores externos documentados en la informacion disponible. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento. Tampoco se documenta el procedimiento de cuantizacion aplicado en este repositorio concreto (`local-inference-lab/Kimi-K3-X4T`): se desconoce el calibrado, el numero de bits efectivos y si se preservaron todas las capas de atencion en mayor precision. La model card original menciona el termino "X4T" solo en el identificador del repositorio, no en el cuerpo del documento.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte, orientado a tareas de ingenieria y trabajo de conocimiento que requieren cadenas de pasos extensas.
- Codigo en produccion: optimizacion de kernels de GPU, desarrollo de compiladores, navegacion y modificacion de repositorios grandes.
- Orquestacion de herramientas de terminal y flujos agénticos con supervision humana minima, segun la model card.
- Multimodalidad nativa: comprension de texto, imagenes y video en un mismo modelo, lo que incluye escenarios de "vision in the loop" (desarrollo de videojuegos, CAD).
- Ventana de contexto de 1 millon de tokens, adecuada para repositorios completos, corpus documentales extensos o sesiones largas.
- Trabajo de conocimiento agéntico de extremo a extremo: investigacion profunda con visualizaciones interactivas, widgets, cuadros de mando y diseno de movimiento.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion proporcionada, aunque el repositorio esta etiquetado como `endpoints_compatible`.
- Capacidades multilingues: no disponible (la model card no enumera idiomas).
- Modo de pensamiento explicito o decodificacion especulativa: no disponible.

## Casos de uso

- Sesiones de ingenieria de largo horizonte: el modelo puede mantener contexto de un repositorio entero gracias a su ventana de 1 millon de tokens, lo que permite refactorizaciones que abarcan decenas de ficheros sin perder trazabilidad entre modulos.
- Optimizacion de kernels de GPU y desarrollo de compiladores: la model card cita explicitamente estos escenarios, donde el modelo analiza codigo de bajo nivel, propone variantes y verifica resultados a lo largo de multiples iteraciones.
- Investigacion profunda automatizada: generacion de informes con visualizaciones, widgets y cuadros de mando interactivos, combinando busqueda, sintesis de documentos largos y produccion de artefactos visuales.
- Analisis de video y documentos escaneados: al aceptar imagen y video como entrada, puede resumir grabaciones, extraer acciones o auditar material visual sin pipeline de OCR separado.
- Agente de terminal y automatizacion de operaciones: con 104B parametros activos y contexto de 1M tokens, es viable como planificador central de un agente que ejecuta comandos, lee salidas y corrige errores en cadena.
- Desarrollo de videojuegos y CAD con vision en el bucle: el modelo puede interpretar capturas del estado grafico y ajustar codigo o geometria en funcion de lo que observa.
- Asistencia en diseno de chips: la model card menciona esta area como parte de las tareas de ingenieria soportadas, con ciclos de verificacion apoyados en contexto largo.
- Diseno de movimiento y edicion de video asistida: generacion y ajuste de secuencias a partir de instrucciones textuales y material visual de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas con MMLU, HumanEval, GSM8K, SWE-bench ni metricas multimodales, y la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como medida oficial. Como referencia aritmetica a partir del numero de parametros, el peso completo ocuparia aproximadamente 5,6 TB en BF16, 2,8 TB en FP8 y 1,4 TB en 4 bits. El esquema real de `local-inference-lab/Kimi-K3-X4T` no esta documentado.
- GPU recomendadas: dado el tamano, el despliegue requiere clusters multi-nodo. Opciones coherentes son nodos con NVIDIA H100, H200 o B200. Un unico nodo de 8xH100 (640 GB) no es suficiente ni siquiera con cuantizacion de 4 bits segun la estimacion anterior, por lo que harian falta al menos dos o tres nodos con interconexion de alta velocidad (NVLink/InfiniBand).
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU domesticas.
- Opciones de despliegue: la informacion proporcionada solo declara `transformers` como libreria y el formato `compressed-tensors`, ademas del tag `endpoints_compatible`. No se documentan recetas para vLLM, llama.cpp, Ollama, TGI ni SGLang, por lo que su compatibilidad con esos motores es "no disponible".
- Latencia y throughput: no disponible. Con 104B parametros activos sobre 2,8T totales la computo por token es relativamente contenido, pero el cuello de botella previsible es el ancho de banda de memoria y la comunicacion entre nodos.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos numericos de modelos comparables, por lo que no es posible construir una comparativa rigurosa de rendimiento. La unica referencia cualitativa que aparece en la model card es Kimi K2, respecto al cual se afirma una mejora de aproximadamente 2,5 veces en eficiencia de escalado, sin cifras asociadas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3-X4T (este repositorio) | 2,8T | 104B | 1M tokens | kimi-k3 | HuggingFace, 0 descargas |
| Kimi K3 (publicacion oficial de Moonshot AI) | 2,8T | 104B | 1M tokens | kimi-k3 | HuggingFace (moonshotai) |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | mencionado en la model card |

## Limitaciones y advertencias

- Repositorio de terceros: `local-inference-lab/Kimi-K3-X4T` no es la publicacion oficial de Moonshot AI. No hay garantia documentada sobre la fidelidad de la cuantizacion ni sobre posibles degradaciones en razonamiento, codigo o capacidades multimodales.
- Ausencia total de validacion: 0 descargas y 0 likes, sin benchmarks, sin notas de conversion y sin fecha de actualizacion posterior a la creacion. No hay evidencia publica de que el modelo funcione correctamente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; al no existir evaluaciones publicadas para esta conversion, no puede acotarse su magnitud.
- Sesgos: no documentados en la informacion disponible.
- Limitaciones de idioma: la lista de idiomas soportados no esta disponible; no debe asumirse un rendimiento homogeneo en castellano sin evaluacion previa.
- Contexto: aunque la ventana nominal es de 1 millon de tokens, no se documenta el rendimiento efectivo a esa longitud ni el coste de memoria de la cache KV con atencion hibrida KDA + Gated MLA.
- Licencia: la licencia `kimi-k3` figura como `other`. Es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede incluir restricciones de atribucion, de despliegue a gran escala o de uso aceptable.
- Coste de produccion: el despliegue exige infraestructura multi-nodo especializada. El coste energetico y de hardware hace inviable su uso en entornos sin clúster de GPU de gama alta.
- Cuantizacion desconocida: se ignora si la conversion degrada de forma selectiva capas criticas como las de atencion o los expertos mas utilizados; sin esa informacion no es prudente usarla como sustituto directo de los pesos oficiales en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/local-inference-lab/Kimi-K3-X4T
- Organizacion oficial de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Modelo base citado en la model card: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat del modelo: https://www.kimi.com
- Pagina de Moonshot AI: https://www.moonshot.ai
- Perfil en X (Twitter): https://twitter.com/kimi_moonshot
- Servidor de Discord: https://discord.gg/TYU2fdJykW
- Organizacion en ModelScope: https://modelscope.cn/organization/moonshotai
