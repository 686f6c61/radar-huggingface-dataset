# ewin-reg/MiniCPM5-DocV

## Resumen

MiniCPM5-DocV es un modelo vision-language (VLM) multimodal de tipo image-text-to-text desarrollado por el usuario ewin-reg, publicado en HuggingFace bajo licencia Apache-2.0. Se construye sobre el modelo de lenguaje openbmb/MiniCPM5-2B (2 000 millones de parametros, arquitectura derivada de Qwen con RoPE, RMSNorm y SwiGLU) y le acopla un codificador visual SigLIP2-so400m-patch14-384 congelado en FP16, junto con un proyector AnyRes y un adaptador rsLoRA de rango 32. El objetivo declarado es el razonamiento visual sobre documentos densos, graficos, tablas e infografias.

El problema que aborda es la comprension de documentos a resolucion nativa en un presupuesto de computo pequeno: mediante segmentacion AnyRes que preserva la relacion de aspecto (hasta 4 tiles locales mas 1 miniatura global) y una compresion espacial con pooling 2x2, reduce 729 parches visuales a 196 tokens por tile (211 tokens contando delimitadores). Esto permite procesar documentos densos con un backbone de solo 2B, algo relevante para despliegues con VRAM limitada.

Su relevancia actual radica en que demuestra que un VLM de 2B puede superar el 60 % en DocVQA (ANLS 60,5), ChartQA (66,67 %) y TabMWP (73,33 %) segun los resultados declarados por el autor, aunque no verificados. La ficha del repositorio indica 46 descargas y 3 likes, con un tamano de repositorio de 10,4 GB. El entrenamiento se realizo sobre 600 muestras verificadas, un volumen muy reducido que condiciona su robustez fuera de los seis dominios calibrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM multimodal: backbone de lenguaje transformer tipo Qwen (RoPE, RMSNorm, SwiGLU) + codificador visual SigLIP2 congelado + proyector AnyRes + adaptador rsLoRA |
| Parametros totales | No disponible de forma exacta. Backbone de lenguaje MiniCPM5-2B (2 000 M aprox.) + codificador visual google/siglip2-so400m-patch14-384 (denominacion so400m) + adaptador rsLoRA r=32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El material de referencia solo menciona FP16 para el codificador visual y bitsandbytes 8-bit AdamW durante el entrenamiento; no se publican pesos cuantizados |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye anyres_projector.safetensors); requiere codigo personalizado (custom_code) |
| Codificador visual | google/siglip2-so400m-patch14-384, 1152 dimensiones, parche 14, resolucion nativa 384x384, congelado en FP16 |
| Proyector | AnyRes dinamico con slicing por relacion de aspecto, rejillas candidatas [(1,1), (1,2), (2,1), (2,2)], hasta 4 tiles locales + 1 miniatura global |
| Adaptador | rsLoRA con r=32, alpha=64, factor de escalado normalizado alpha/sqrt(r) ~ 11,31, aplicado a q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj |
| Pipeline | image-text-to-text (etiqueta secundaria: feature-extraction) |
| Tamano del repositorio | 10,4 GB |
| Dataset declarado | HuggingFaceM4/the_cauldron |
| Modelo base | openbmb/MiniCPM5-2B |

## Arquitectura y entrenamiento

La arquitectura es un VLM de tipo conector: un codificador visual SigLIP2-so400m-patch14-384 congelado en FP16 extrae caracteristicas de 1152 dimensiones con parches de 14x14 a 384x384 de resolucion nativa. Sobre el se aplica una estrategia AnyRes que descompone la imagen en hasta cuatro tiles locales mas una miniatura global, eligiendo la rejilla candidata [(1,1), (1,2), (2,1), (2,2)] en funcion de la relacion de aspecto. Cada tile se comprime mediante average pooling 2x2 (729 parches a 196 tokens) y se concatenan delimitadores aprendidos de salto de linea y de vista, resultando en 211 tokens por tile. Estos token embeddings se inyectan en el backbone de lenguaje openbmb/MiniCPM5-2B, un transformer derivado de Qwen con RoPE, RMSNorm y SwiGLU.

El ajuste se realiza exclusivamente mediante un adaptador rsLoRA (r=32, alpha=64, escalado normalizado alpha/sqrt(r) ~ 11,31) sobre las siete proyecciones lineales del backbone, con el codificador visual congelado. La calibracion combina seis dominios multimodales sobre 600 muestras verificadas: DocVQA (documentos escaneados y campos de formulario), ChartQA (graficos de barras, lineas y sectores), TabMWP (tablas financieras y aritmeticas), InfographicVQA (infografias multicolumna), HiTab (tablas jerarquicas con cabeceras anidadas) y TextVQA (texto en escena natural). El autor menciona un "anti-forgetting reservoir" como mecanismo para mitigar el olvido catastrofico del modelo base. El entrenamiento se ejecuto en una NVIDIA Tesla T4 con 14,56 GB de VRAM, con un pico de memoria asignada de aproximadamente 12,5 GB y un throughput medido de 0,38 steps/s usando GRAD_ACCUM=2 y AdamW de 8 bits de bitsandbytes. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) con respuestas cortas: el formato de prompt entrena al modelo a responder con una sola palabra o frase.
- Document Visual Question Answering sobre documentos densos, formularios y tipografia variable (dominio DocVQA).
- Chart Visual Question Answering sobre graficos de barras, lineas y sectores, con tolerancia del 5 % en valores numericos (dominio ChartQA).
- Razonamiento aritmetico sobre tablas y problemas de palabras con unidades (dominio TabMWP).
- Comprension de infografias con maquetacion no lineal y varias columnas (dominio InfographicVQA).
- Manejo de tablas jerarquicas con cabeceras anidadas de varios niveles (dominio HiTab).
- OCR de texto en escena natural, rotulos y senaletica (dominio TextVQA).
- Extraccion de caracteristicas (etiqueta feature-extraction) para indexacion y busqueda semantica de imagenes de documentos.
- Procesamiento AnyRes de alta resolucion manteniendo la relacion de aspecto original del documento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el modelo esta declarado unicamente para ingles.
- Capacidades especiales (modo thinking, audio, video): no disponibles.

## Casos de uso

- Extraccion de campos en facturas y formularios escaneados: el modelo responde a preguntas del tipo "cual es el importe total" sobre documentos densos, aprovechando su ANLS de 60,5 en DocVQA y la segmentacion AnyRes para conservar la resolucion de tablas y bloques de texto.
- Analisis automatico de informes financieros con graficos: con un 66,67 % de precision relajada en ChartQA, es adecuado para lectura de tendencias y valores en graficos de barras y lineas dentro de paneles de business intelligence.
- Resolucion de problemas aritmeticos sobre tablas: su 73,33 % de exact match en TabMWP lo hace util para responder preguntas de calculo (sumas, medias, comparaciones con unidades) sobre tablas financieras extraidas de PDF.
- Digitalizacion de infografias y material corporativo: el manejo de maquetacion multicolumna y elementos no lineales permite extraer datos estructurados de posters y resumenes visuales.
- Indexacion y busqueda semantica en repositorios documentales: gracias a la etiqueta feature-extraction, los embeddings multimodales pueden alimentar un indice vectorial para recuperar paginas relevantes por similitud.
- Verificacion de tablas jerarquicas en auditoria: la calibracion sobre HiTab permite recorrer cabeceras anidadas de varios niveles para validar cifras en informes regulatorios.
- OCR de carteles y senaletica en aplicaciones de campo: su entrenamiento en TextVQA habilita la lectura de texto en fotografias tomadas con movil para inventario, logistica o accesibilidad.
- Preprocesamiento en pipelines RAG sobre PDF: el modelo puede generar respuestas cortas y trazables por pagina para alimentar un sistema de preguntas y respuestas documentales con un coste de inferencia bajo (backbone de 2B).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (model-index), obtenidos sobre los splits estandar de The Cauldron con decodificacion greedy determinista. La metrica "verified" aparece como falsa en los tres casos, es decir, son resultados autodeclarados y no verificados de forma independiente.

| Benchmark | Dominio | Metrica | Resultado | Objetivo del autor | Estado |
|---|---|---|---|---|---|
| ChartQA | Datos visuales y tendencias numericas | Relaxed Accuracy (tolerancia 5 %) | 66,67 % | >= 60,0 % | Superado |
| TabMWP | Aritmetica sobre tablas y problemas de palabras | Exact Match | 73,33 % | >= 60,0 % | Superado |
| DocVQA | Comprension de documentos densos | ANLS | 60,50 % | >= 60,0 % | Superado |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje general o de comparacion directa con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 5-7 GB, sumando el backbone MiniCPM5-2B (unos 4 GB de pesos) y el codificador SigLIP2-so400m (unos 0,9 GB) mas el adaptador y las activaciones de los tiles AnyRes (hasta 5 tiles por imagen). Es una estimacion derivada del tamano de los componentes, no un dato publicado.
- Entrenamiento documentado: NVIDIA Tesla T4 con 14,56 GB de VRAM, pico asignado de aproximadamente 12,5 GB y alrededor de 2,0 GB de margen libre, usando AdamW de 8 bits de bitsandbytes y GRAD_ACCUM=2.
- GPU recomendadas: el material del autor solo documenta la Tesla T4. Para inferencia, cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente en FP16 segun la estimacion anterior; no se publican validaciones en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: probablemente si en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); no confirmado por el autor.
- Opciones de despliegue: transformers con trust_remote_code=True es la ruta documentada en el quickstart, cargando por separado el tokenizer de openbmb/MiniCPM5-2B, el image processor y el vision tower de google/siglip2-so400m-patch14-384, y descargando anyres_projector.safetensors del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la presencia de custom_code y de un codificador visual separado hace poco probable un despliegue directo en runtimes GGUF sin conversion especifica.
- Latencia y throughput de inferencia: no disponibles. El unico dato de rendimiento publicado es el throughput de entrenamiento (mas de 0,35 steps/s, medido 0,38 steps/s en T4).
- Cache KV: el numero de tokens visuales es reducido (211 tokens por tile incluyendo delimitadores), por lo que el coste de contexto de imagen es bajo en comparacion con otros VLM de alta resolucion.

## Comparativa con modelos similares

No se dispone de resultados de benchmark de los modelos alternativos en la informacion proporcionada, por lo que las columnas de rendimiento se dejan como no disponibles. Los datos de parametros y licencia corresponden a informacion general de cada proyecto y deberian verificarse en sus fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | DocVQA / ChartQA / TabMWP |
|---|---|---|---|---|
| MiniCPM5-DocV | Backbone de 2B + codificador visual so400m + rsLoRA r=32 | No disponible | Apache-2.0 | 60,5 ANLS / 66,67 % / 73,33 % (autodeclarados, no verificados) |
| Qwen2.5-VL-3B-Instruct | 3B | No disponible en la informacion proporcionada | Apache-2.0 | No disponible |
| SmolVLM2-2.2B | 2,2B | No disponible en la informacion proporcionada | Apache-2.0 | No disponible |
| InternVL2-2B | 2B | No disponible en la informacion proporcionada | MIT | No disponible |

Diferencias cualitativas destacables: MiniCPM5-DocV es un ajuste ligero (solo LoRA) sobre un backbone de 2B con codificador SigLIP2, mientras que las alternativas citadas son modelos entrenados de forma completa y con soporte mas amplio de runtimes y cuantizaciones. Frente a ellos, la ventaja declarada de MiniCPM5-DocV es el coste de inferencia reducido y el procesamiento AnyRes, mientras que su desventaja principal es el entrenamiento sobre solo 600 muestras y la ausencia de validacion externa.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido: 600 muestras verificadas repartidas en seis dominios. La capacidad de generalizacion fuera de esos dominios y estilos de documento es limitada.
- Resultados no verificados: las tres metricas del model-index estan marcadas como verified: false y proceden del propio autor, sin replicacion independiente.
- Idioma: solo se declara soporte de ingles, tanto en la model card como en las etiquetas del repositorio.
- Formato de respuesta restringido: el prompt de entrenamiento fuerza respuestas de una sola palabra o frase ("Answer the question using a single word or phrase"), lo que limita su uso para generacion abierta, explicaciones largas o resumenes.
- Riesgo de alucinacion: como cualquier VLM, puede inventar valores numericos, cifras de tablas o texto que no aparece en la imagen, especialmente en documentos de baja calidad o con tipografia poco comun.
- Olvido catastrofico: al congelar el backbone y entrenar solo un adaptador rsLoRA r=32, pueden degradarse capacidades previas del modelo base; el autor menciona un "anti-forgetting reservoir" pero no aporta evaluaciones que cuantifiquen la perdida.
- Codigo personalizado: el uso requiere trust_remote_code=True, lo que implica ejecutar codigo del repositorio; conviene auditar los ficheros antes de desplegarlo en produccion.
- Cuantizaciones no publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que complica el despliegue en entornos con poca VRAM o en runtimes ligeros.
- Dependencia de dos repositorios externos: el codigo de inferencia necesita ademas openbmb/MiniCPM5-2B y google/siglip2-so400m-patch14-384, con licencias y condiciones propias que deben revisarse por separado.
- Licencia: el repositorio se publica como Apache-2.0, pero al ser un ajuste sobre MiniCPM5-2B conviene confirmar las condiciones del modelo base para uso comercial.
- Longitud de contexto no documentada: no es posible planificar cargas de multiples imagenes o conversaciones largas sin conocer la ventana real del backbone.
- Sin soporte declarado de tool calling, agentes, audio ni video.
- Adopcion muy baja: 46 descargas y 3 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte de la comunidad, ejemplos de integracion o correcciones posteriores.
- Contradiccion en los metadatos: las etiquetas incluyen feature-extraction ademas de image-text-to-text; conviene verificar cual es la salida real esperada por el autor en cada caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ewin-reg/MiniCPM5-DocV
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Codificador visual: https://huggingface.co/google/siglip2-so400m-patch14-384
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceM4/the_cauldron
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron unicamente paginas de la red social japonesa mixi sin relacion con MiniCPM5-DocV.
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
