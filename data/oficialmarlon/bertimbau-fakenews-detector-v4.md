# oficialmarlon/bertimbau-fakenews-detector-v4

## Resumen

El modelo `oficialmarlon/bertimbau-fakenews-detector-v4` es un clasificador de texto binario especializado en la deteccion de noticias falsas en portugues. Se construye a partir de BERTimbau (`neuralmind/bert-base-portuguese-cased`), el encoder BERT preentrenado en portugues de referencia, al que se le anade una cabeza de clasificacion de secuencias ajustada sobre un corpus propio denominado `custom-balanced-fakenews-pt`. El autor es el usuario de HuggingFace "oficialmarlon".

El modelo resuelve un problema concreto: dada una noticia (titulo, subtitulo y cuerpo), devolver una etiqueta indicando si es verdadera o falsa. Su rasgo diferencial declarado es el uso de una tecnica de "Chunking Desenviesado" (troceado con eliminacion de sesgo) destinada a evitar que el clasificador aprenda atajos basados en la longitud del texto (*shortcut learning*), un problema habitual cuando la longitud del articulo correlaciona artificialmente con la etiqueta.

Con 108.924.674 parametros y un repositorio de 0,4 GB en formato safetensors, es un modelo ligero y desplegable en hardware modesto. La model card reporta un 98,00% de exactitud global sobre un conjunto de prueba ciego de 100 noticias reales, con un recall del 100% en la clase de noticias falsas. La relevancia actual radica en la existencia de catalogos de modelos pequenos y especializados, con licencia MIT, que pueden integrarse como filtros de moderacion o verificacion sin depender de grandes modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional), variante BERTimbau base portuguesa con case |
| Parametros totales | 108.924.674 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura BERT base admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin variantes cuantizadas) |
| Idiomas soportados | portugues (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es BERTimbau base cased, un transformer encoder de 12 capas y 768 dimensiones ocultas preentrenado en portugues por NeuralMind. Sobre esa representacion se anade una cabeza de clasificacion de secuencia con dos etiquetas (VERDADEIRA / FALSA, segun el ejemplo de la model card). El modelo resultante se ajusta como clasificador de texto estandar, con la particularidad de que la entrada se formatea como `Titulo [SEP] Subtitulo [SEP] Texto`, usando el token separador de BERT para estructurar los distintos campos de la noticia.

El elemento tecnico diferenciador que declara el autor es el "Chunking Desenviesado", una estrategia de troceado del texto pensada para eliminar el sesgo de longitud y evitar que el modelo aprenda atajos correlacionados con el tamano del articulo (*shortcut learning*). El ajuste se realiza sobre el dataset `custom-balanced-fakenews-pt`, descrito como balanceado, aunque no se detalla su composicion, numero de ejemplos ni procedencia. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un clasificador discriminativo y no generativo.

## Capacidades

- Clasificacion binaria de texto para deteccion de noticias falsas en portugues.
- Auditoria y verificacion de noticias, devolviendo una etiqueta y una puntuacion de confianza (por ejemplo, `{'label': 'VERDADEIRA', 'score': 0.997}`).
- Procesamiento de entradas estructuradas de tres campos (titulo, subtitulo y cuerpo) mediante separadores `[SEP]`.
- Consumo mediante la libreria Transformers de HuggingFace (pipeline `text-classification`).
- Consumo mediante la API REST de inferencia de HuggingFace.
- Capacidad multilingue: no; el modelo esta especializado unicamente en portugues.
- Soporte de tool calling / function calling: no disponible (es un clasificador, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Moderacion editorial automatizada: integrar el clasificador como filtro previo en la cola de publicacion de un medio digital, marcando automaticamente las noticias con alta probabilidad de ser falsas antes de la revision humana, aprovechando su recall declarado del 100% en la clase falsa.
- Verificacion de hechos (fact-checking) asistida: usar el modelo como primera capa de triaje en una redaccion o agencia de verificacion, priorizando las noticias marcadas como falsas para su analisis manual y reduciendo el tiempo de cribado.
- Extension de navegador o lector RSS: clasificar noticias en el cliente a medida que el usuario navega, mostrando una advertencia cuando la etiqueta sea FALSA, dado el reducido tamano del modelo (0,4 GB) que permite ejecucion local.
- Monitorizacion de redes sociales y desinformacion: procesar en lote titulares y textos compartidos en plataformas para detectar campanas de desinformacion en portugues, explotando el bajo coste de inferencia de un modelo de 108 M de parametros.
- Filtrado en agregadores de noticias: etiquetar articulos entrantes de distintas fuentes antes de mostrarlos en un agregador, incorporando la puntuacion de confianza como senal adicional en el ranking.
- Investigacion academica sobre desinformacion: emplear el modelo como linea base reproducible (licencia MIT) en estudios sobre propagacion de noticias falsas en portugues, comparando su comportamiento con otros clasificadores.
- Moderacion de comunidades y foros: integrar una llamada al pipeline en el backend de un foro para marcar publicaciones que enlacen o reproduzcan contenido con alta probabilidad de ser falso.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de prueba ciego de 100 noticias reales:

| Metrica | Valor | Detalle |
|---|---|---|
| Exactitud global | 98,00% | 98/100 |
| Recall en noticias falsas | 100,00% | 50/50 |
| Precision en noticias falsas | 96,15% | no disponible el recuento exacto |
| Precision en noticias verdaderas | 100,00% | no disponible el recuento exacto |
| Recall en noticias verdaderas | 96,00% | 48/50 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las metricas anteriores provienen de la model card del autor y no han sido verificadas de forma independiente en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 (108,9 M de parametros x 4 bytes) y en torno a 0,22 GB en fp16; con overhead de activaciones y runtime, cabe comodamente en menos de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en CPU para inferencia por lotes moderados.
- Opciones de despliegue: pipeline de Transformers de HuggingFace, API de inferencia de HuggingFace (router de hf-inference), exportacion a ONNX Runtime; soluciones tipo Text Generation Inference (TGI) con soporte de clasificacion de secuencias. No aplica llama.cpp ni Ollama en su formato actual, ya que el repositorio solo publica pesos safetensors sin variantes GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dado el tamano, se espera una latencia muy baja en GPU (del orden de milisegundos por muestra), pero el dato no esta confirmado en la documentacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas no esta disponible. A continuacion se ofrece una comparacion estructural basica.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| bertimbau-fakenews-detector-v4 | 108.924.674 | no disponible (BERT base, hasta 512 tokens) | portugues | MIT | Clasificador especializado en fake news en pt |
| neuralmind/bert-base-portuguese-cased (BERTimbau base) | ~108 M | hasta 512 tokens | portugues | no verificada en esta busqueda | Modelo base preentrenado, sin ajuste de clasificacion |
| Otros detectores de fake news en portugues | no disponible | no disponible | portugues | no disponible | No disponibles datos en la informacion proporcionada |

No se conocen, a partir de la informacion proporcionada, alternativas directas con las que comparar rendimiento de forma fiable.

## Limitaciones y advertencias

- Dominio limitado al portugues: no ofrece soporte para otros idiomas, lo que restringe su uso en entornos multilingues.
- Clasificacion binaria: solo distingue entre noticia verdadera y falsa; no identifica el tipo de desinformacion, la fuente ni el grado de manipulacion.
- Riesgo de alucinacion: no aplica en sentido generativo (el modelo no produce texto), pero si puede producir falsos positivos y falsos negativos; la propia model card reporta una precision del 96,15% en noticias falsas y un recall del 96% en verdaderas, es decir, existe una tasa de error no nula.
- Conjunto de evaluacion reducido: las metricas se calculan sobre solo 100 noticias (50 falsas y 50 verdaderas), lo que limita la significacion estadistica y la robustez de las cifras.
- Dataset de entrenamiento no publico en detalle: `custom-balanced-fakenews-pt` no se describe en cuanto a tamano, procedencia ni metodo de etiquetado, lo que dificulta evaluar sesgos y cobertura tematica.
- Riesgo de sesgo de dominio: al entrenarse en un corpus concreto, puede degradarse en dominios distintos (politica, ciencia, economia) o en registros informales (redes sociales, memes).
- Dependencia del formato de entrada: la model card recomienda el formato `Titulo [SEP] Subtitulo [SEP] Texto`; usar otro formato puede afectar al rendimiento.
- Despliegue y generalizacion: es un modelo muy reciente y con muy pocas descargas (0 en el momento de la consulta) y 1 like, por lo que no cuenta con validacion por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero conviene revisar que el modelo base BERTimbau y el dataset de ajuste sean compatibles con ese uso.
- Advertencia para produccion: no debe utilizarse como unica fuente de verdad en decisiones sensibles (por ejemplo, retirada de contenido o sanciones); se recomienda acompanarlo de revision humana.

## Enlaces

- HuggingFace: https://huggingface.co/oficialmarlon/bertimbau-fakenews-detector-v4
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- API de inferencia de HuggingFace (router): https://router.huggingface.co/hf-inference/models/oficialmarlon/bertimbau-fakenews-detector-v4
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
