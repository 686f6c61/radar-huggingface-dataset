# aswinvk28/google-pegasus-xsum

## Resumen

`aswinvk28/google-pegasus-xsum` es una republicación en Hugging Face del checkpoint `google/pegasus-xsum`, un modelo de resumen abstractivo desarrollado originalmente por Google Research. PEGASUS (Pre-training with Extracted Gap-sentences for Abstractive Summarization) es un transformer encoder-decoder de tipo seq2seq, con aproximadamente 568M de parámetros, preentrenado con el objetivo auto-supervisado GSG sobre C4 en inglés y ajustado después con el corpus XSum de la BBC. El repositorio analizado contiene 569.844.583 parámetros en pesos safetensors y ocupa 6,8 GB.

El problema que resuelve es concreto: generar resúmenes de una sola frase, con estilo de titular, a partir de documentos relativamente cortos. No es un modelo conversacional ni un modelo de instrucciones; su ventana de posiciones es de 1024 tokens y el ajuste de XSum trabaja con entradas de 512 tokens y salidas de 64. Esto lo sitúa en la categoría de modelos especializados de NLP clásico, no en la de LLM generativos.

Su relevancia actual es doble. Por un lado, sigue siendo un baseline sólido y barato de ejecutar para resumen de un solo párrafo, con un coste de inferencia muy inferior al de un LLM de miles de millones de parámetros. Por otro, esta subida concreta presenta señales de riesgo: 0 descargas, 0 me gusta, model card vacía (solo la línea de licencia), sin pipeline declarado y con un tamaño de repositorio muy superior al de los pesos en fp32, lo que sugiere duplicación de formatos. Cualquier uso en producción debería partir del repositorio original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) estilo BART, preentrenado con GSG (Gap Sentence Generation) |
| Parametros totales | 569.844.583 según los pesos safetensors del repositorio; ~568M según el paper de PEGASUS |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens de posiciones (`max_position_embeddings`); el ajuste de XSum usa entradas de 512 tokens y salidas de 64 |
| Tipos de cuantizacion | No disponible: el repositorio no publica cuantizaciones (pesos en fp32). Al ser 568M de parámetros admite fp16/bf16, int8 y 4 bits con herramientas externas |
| Idiomas soportados | No declarados en el repositorio. El preentrenamiento (C4) y el ajuste (XSum) son en inglés, por lo que el uso práctico queda restringido al inglés |
| Licencia | MIT, declarada por el autor de la subida; el checkpoint original de Google se publica bajo Apache-2.0 |
| Formato de pesos | safetensors (según los tags del repositorio); tamaño del repositorio 6,8 GB |

## Arquitectura y entrenamiento

PEGASUS es un transformer encoder-decoder con atención completa, sin mecanismos de atención lineal ni arquitecturas híbridas SSM. La configuración publicada de la variante base usa 16 capas de encoder y 16 de decoder, dimensión de modelo 1024, 16 cabezas de atención, FFN de 4096 y un vocabulario SentencePiece de unos 96 000 tokens compartido entre encoder, decoder y capa de salida. El preentrenamiento se realiza sobre C4 (texto web en inglés, del orden de 750 GB según el paper) con el objetivo GSG: se seleccionan frases completas del documento mediante ROUGE-1 F1 frente al resto del texto, se enmascaran y el modelo debe reconstruirlas de forma independiente y concatenada. Este objetivo fuerza al modelo a aprender representaciones globales del documento, que es exactamente lo que se necesita para resumir.

El ajuste posterior se hizo de forma supervisada sobre XSum, un corpus de 226.711 artículos de la BBC (204.045 de entrenamiento, 11.332 de validación y 11.334 de prueba), cada uno con un resumen de una sola frase. No hay evidencia de RLHF ni de DPO en la información disponible: es un ajuste supervisado clásico de seq2seq, sin alineación por preferencias ni modo de razonamiento. La model card de esta subida no documenta ni el procedimiento de conversión a safetensors ni ninguna modificación sobre el checkpoint original, y tampoco aporta datos de evaluación propios.

## Capacidades

- Resumen abstractivo de un solo párrafo corto: genera una frase de estilo titular a partir de un documento de entrada, que es la tarea para la que fue ajustado.
- Generación condicionada seq2seq: acepta texto de entrada y produce texto de salida con `generate()`, incluyendo decodificación por haz o por muestreo.
- Comprensión lectora implícita y paráfrasis limitada, como efecto colateral del preentrenamiento con GSG sobre C4.
- Ejecución muy barata: 568M de parámetros permiten inferencia en CPU y en GPU de gama baja.
- Compatible con el ecosistema `transformers` (clase `PegasusForConditionalGeneration`), TorchScript y exportación a ONNX.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no es un modelo de instrucciones y no tiene plantilla de chat.
- No es multilingüe: no hay evidencia de capacidades fuera del inglés.
- No tiene capacidades de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Generación de titulares y entradillas para medios digitales: a partir del cuerpo de una noticia de hasta 512 tokens, el modelo produce una frase-resumen; es exactamente la distribución de XSum (texto BBC con titular de una frase), por lo que el dominio objetivo coincide con el de ajuste.
- Agregadores de noticias y lectores RSS: resumir cada ítem en una línea para construir un boletín diario. Con 568M de parámetros se puede procesar mucho volumen en una sola GPU o incluso en CPU con un throughput alto.
- Monitorización de medios y seguimiento de marca: resumir menciones de una compañía en prensa a una frase por artículo para alimentar paneles de análisis, aplicando antes un filtro por palabras clave.
- Generación de meta descripciones para SEO: crear descripciones cortas y legibles a partir de artículos o páginas de blog, con revisión humana obligatoria por el riesgo de alucinación de entidades.
- Baseline de investigación en resumen abstractivo: reproducir y comparar variantes de decodificación (beam search frente a muestreo), estudiar sensibilidad al truncado de entrada o medir ROUGE en XSum frente a otros checkpoints; el coste computacional lo hace viable en un único equipo.
- Generación de datos sintéticos para destilación: usar el modelo como profesor para etiquetar pares documento-resumen y entrenar después un modelo más pequeño o un clasificador de relevancia.
- Accesibilidad y lectura rápida: producir un resumen de una frase por documento en herramientas de lectura asistida o lectores de pantalla, siempre que se gestione la truncación a 512 tokens y se advierta al usuario de que el resumen es extractivo-abstractivo y puede contener errores.
- Preprocesado de corpus para pipelines de NLP: encadenar el resumen con indexación semántica, búsqueda o clustering de documentos, reduciendo la longitud del texto antes de pasarlo a etapas posteriores más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de esta subida está vacía salvo por la línea de licencia, el autor no reporta ninguna métrica y la búsqueda web realizada no devolvió resultados relevantes (los enlaces recuperados trataban de instalación de Chrome, cámaras deportivas y temas de GitHub sin relación con el modelo). La referencia canónica de evaluación es ROUGE (R-1, R-2, R-L) sobre el conjunto de prueba de XSum, cuyas cifras se publican en el paper de PEGASUS enlazado más abajo, pero no se reproducen aquí para no introducir datos no verificados en esta ficha.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 2,3 GB en fp32, 1,2 GB en fp16/bf16, 0,6 GB en int8 y 0,35 GB en 4 bits, calculado sobre 569,8M de parámetros.
- VRAM para inferencia: 2-4 GB son suficientes en fp16 incluyendo activaciones y caché de atención; 6-8 GB dan margen holgado para lotes grandes. Es un modelo que cabe sin problema en GPU de consumo.
- GPU de consumo recomendadas: RTX 3060/4060 (8 GB), RTX 4070/4090, GTX 1660/2060 (6 GB) en fp16 o int8. Cualquier GPU con 4 GB o más sirve para inferencia de una sola muestra.
- GPU de datacenter: A100, H100 o L4 son innecesarias por capacidad y solo se justifican por agregación de throughput en lotes muy grandes; el modelo no las satura.
- CPU: la inferencia es viable y se usa de hecho en producción para esta familia de modelos, con latencias del orden de décimas de segundo a pocos segundos por resumen según el número de núcleos y la longitud de salida.
- Opciones de despliegue: `transformers` con PyTorch, TorchScript, ONNX Runtime, Hugging Face Inference Endpoints y procesamiento por lotes propio. El soporte en servidores especializados (vLLM, TGI) no está confirmado en la información disponible, y llama.cpp/Ollama no soportan de forma estándar la arquitectura encoder-decoder de PEGASUS.
- Latencia y throughput concretos: no disponible, no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|---|
| aswinvk28/google-pegasus-xsum | 569,8M | 1024 posiciones (512 de entrada en la práctica) | Resumen de una frase (XSum) | MIT declarada en la subida; Apache-2.0 en el original | safetensors | Repositorio con 0 descargas, model card vacía |
| google/pegasus-xsum (original) | ~568M | 1024 posiciones | Resumen de una frase (XSum) | Apache-2.0 | PyTorch, TensorFlow, Flax | Repositorio de referencia de Google |
| google/pegasus-cnn_dailymail | ~568M | 1024 posiciones | Resumen multi-frase de noticias | Apache-2.0 | PyTorch, TensorFlow, Flax | Checkpoint oficial de Google |
| facebook/bart-large-xsum | ~400M | 1024 posiciones | Resumen de una frase (XSum) | MIT | PyTorch, safetensors | Checkpoint oficial de Meta AI |
| google/flan-t5-base | ~248M | 512 tokens | Instrucciones generales, resumen incluido | Apache-2.0 | PyTorch, safetensors | Checkpoint oficial de Google |

Los valores de ROUGE comparados no se incluyen porque no hay datos verificados en la información disponible. La elección entre PEGASUS y BART-large-xsum para XSum es, en la práctica, una comparación entre dos arquitecturas seq2seq de tamaño similar cuyos resultados originales están publicados en sus respectivos papers.

## Limitaciones y advertencias

- Riesgo elevado de alucinación: el ajuste sobre XSum premia resúmenes muy abstractivos, un régimen en el que estos modelos tienden a introducir entidades, cifras o relaciones que no aparecen en el documento fuente. En dominios sensibles (salud, finanzas, legal) requiere revisión humana.
- Especialización estrecha: está entrenado para producir una única frase de resumen. No genera resúmenes de varios párrafos ni mantiene coherencia en salidas largas.
- Límite de entrada: 1024 posiciones como máximo y 512 tokens en la configuración práctica del ajuste. Los documentos largos deben truncarse o segmentarse, lo que degrada la calidad del resumen.
- Idioma: solo inglés de forma fiable. No hay declaración de idiomas en el repositorio ni evidencia de capacidades multilingües.
- No es un modelo de chat: no sigue instrucciones, no soporta plantillas conversacionales, tool calling ni uso como agente.
- Subida no verificada: 0 descargas, 0 me gusta, sin pipeline declarado y con una model card que solo contiene la licencia. No hay información sobre quién convirtió los pesos, con qué script ni si coinciden exactamente con `google/pegasus-xsum`. Para producción, usa el repositorio original.
- Tamaño anómalo del repositorio: 6,8 GB para un modelo de ~2,3 GB en fp32 indica peso duplicado (probablemente varios formatos). Eso aumenta el tiempo de descarga y el espacio en disco sin aportar nada.
- Licencia: la subida declara MIT, mientras que el checkpoint original de Google se distribuye bajo Apache-2.0. Conviene verificar los términos aplicables antes de un uso comercial y revisar también las condiciones del corpus XSum (contenido de la BBC).
- Sesgos: preentrenado sobre C4 (texto web en inglés, con los sesgos de dominio y estilo de esa fuente) y ajustado sobre artículos de la BBC, lo que sobrerrepresenta registro periodístico británico y temas de actualidad de ese medio.
- Ausencia total de evaluación: el autor no publica métricas ni pruebas de comportamiento, por lo que no hay garantía de calidad medible frente al checkpoint original.

## Enlaces

- Repositorio analizado: https://huggingface.co/aswinvk28/google-pegasus-xsum
- Checkpoint original de Google: https://huggingface.co/google/pegasus-xsum
- Checkpoint PEGASUS ajustado en CNN/DailyMail: https://huggingface.co/google/pegasus-cnn_dailymail
- Paper de PEGASUS (Zhang et al., ICML 2020): https://arxiv.org/abs/1912.08777
- Paper del corpus XSum (Narayan et al., 2018): https://arxiv.org/abs/1808.08745
- Documentación de Pegasus en Hugging Face Transformers: https://huggingface.co/docs/transformers/model_doc/pegasus
- Código de referencia de Google Research: https://github.com/google-research/pegasus
- Nota sobre la búsqueda web: los resultados recuperados no guardaban relación con el modelo (instalación de Chrome, cámaras deportivas, temas genéricos de GitHub), por lo que no se han incluido como fuentes.
