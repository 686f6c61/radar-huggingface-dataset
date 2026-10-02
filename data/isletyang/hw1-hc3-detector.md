# isletyang/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador binario de texto desarrollado por el usuario isletyang y publicado en HuggingFace. Se trata de un fine-tuning de sentence-transformers/all-MiniLM-L6-v2, un encoder transformer de tipo BERT con 22.713.986 parametros, sobre las respuestas en ingles del corpus Hello-SimpleAI/HC3. Su unica tarea es distinguir entre una respuesta escrita por un humano (etiqueta 0) y una respuesta generada por ChatGPT (etiqueta 1).

El modelo resuelve un problema acotado y muy concreto: la deteccion de texto generado por IA en el dominio especifico del corpus HC3, es decir, respuestas a preguntas factuales y de divulgacion recogidas de fuentes como Reddit o Wikipedia. No es un detector de proposito general ni pretende serlo: el propio autor advierte en la model card que el resultado corresponde a una particion historica de HC3 y no es fiable para detectar redacciones de estudiantes actuales ni texto de otras familias de modelos.

Su relevancia es sobre todo academica y metodologica. El nombre del repositorio (hw1, "homework 1") y la existencia de replicas identicas publicadas por otros usuarios (Aishkrish, SiqiYang, Yihangsun) sugieren que se trata de un ejercicio de curso. Aun asi, resulta util como referencia reproducible: documenta el split exacto, los hiperparametros de entrenamiento y una comparacion contra un baseline de regresion logistica sobre embeddings congelados, lo que lo convierte en un ejemplo limpio de evaluacion con linea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6), con cabeza de clasificacion de 2 clases |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | No disponible en el repositorio (pesos en FP32); cuantizable a INT8 u ONNX con herramientas externas |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PyTorch), con tokenizer asociado |
| Pipeline | text-classification |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer de 6 capas derivado de MiniLM y destilado por Microsoft, con atencion multi-cabeza estandar y embeddings de frases. Sobre esa representacion se anade una cabeza de clasificacion secuencial de dos etiquetas (humano frente a ChatGPT). Con 22,7 millones de parametros, es un modelo de una sola GPU pequena o incluso de CPU.

El entrenamiento se realizo sobre el subconjunto de respuestas en ingles de HC3. El split se hizo agrupando por pregunta normalizada (no por respuesta individual) con semilla 42, lo cual evita fugas de informacion entre train y test. Se conservo una respuesta no vacia de cada clase por pregunta, lo que dio 37.334 respuestas de entrenamiento, 4.666 de validacion y 4.668 de test. Los hiperparametros fueron 5 epocas, batch size 32, longitud maxima de secuencia 256, optimizador AdamW y tasa de aprendizaje 2e-5. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de este tipo.

El elemento metodologico mas destacable es que el autor reporta un baseline explicito: una regresion logistica entrenada sobre embeddings congelados del mismo modelo base, que alcanza 0,8443 de exactitud, frente al 0,9949 del clasificador fine-tuneado. Esa comparacion permite atribuir la mejora al ajuste fino y no solo a la calidad de las representaciones del modelo base.

## Capacidades

- Clasificacion binaria de texto en ingles: distingue respuesta humana (0) de respuesta generada por ChatGPT (1).
- Salida de logits/etiqueta mediante AutoModelForSequenceClassification, integrable en pipelines de transformers.
- Entrada de hasta 256 tokens; textos mas largos requieren truncado o troceado manual.
- Inferencia sobre lotes pequenos en CPU con latencia baja, dado el tamano reducido del modelo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- Monolingue: no se ha entrenado ni evaluado en otros idiomas.
- No es un modelo generativo: no produce texto.

## Casos de uso

- Auditoria retrospectiva de corpus: aplicar el clasificador sobre el conjunto de respuestas de HC3 o sobre corpus historicos equivalentes para etiquetar automaticamente el origen humano o sintetico de cada respuesta, con la ventaja de que el split y la precision estan documentados.
- Linea base en investigacion sobre deteccion de IA: usarlo como baseline barato y rapido antes de entrenar detectores mas grandes o especificos, ya que su coste computacional es minimo (22,7 M de parametros).
- Docencia y practicas de NLP: sirve como ejemplo completo de fine-tuning de un encoder con split por pregunta, baseline de regresion logistica e informe de errores, replicable en una sola GPU de consumo.
- Filtrado de datos a pequena escala: marcar respuestas sospechosas de ser generadas por ChatGPT en un pipeline de limpieza de datasets en ingles, siempre que el dominio se parezca al de HC3.
- Deteccion de contaminacion en conjuntos de evaluacion: comprobar si respuestas incluidas en un benchmark en ingles podrian proceder de ChatGPT, como paso previo a una revision manual.
- Experimentos de robustez y transferencia: evaluar cuanto cae la precision al aplicarlo a textos de otros modelos (Claude, Llama, GPT-4) o a dominios distintos, aprovechando que el autor documenta explicitamente que esa transferencia no esta garantizada.
- Prototipado educativo de moderacion de contenido: como componente de juguete en un sistema mayor, nunca como unico criterio de decision, dado que la propia model card desaconseja ese uso.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| HC3 test held-out (4.668 respuestas, split con semilla 42) | 0,9949 de exactitud (24 errores) |
| Baseline: regresion logistica sobre embeddings congelados del modelo base | 0,8443 de exactitud |

No se han publicado resultados de benchmarks adicionales (MMLU, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 91 MB solo para pesos; en FP16 unos 46 MB; en INT8 unos 23 MB.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090, e incluso en CPU sin GPU dedicada.
- GPU recomendadas: no requiere ninguna en concreto; una GPU de gama baja ya satura el rendimiento del modelo. A100 o H100 no aportan ventaja practica para este tamano.
- Despliegue: transformers (AutoTokenizer + AutoModelForSequenceClassification), ONNX Runtime, HuggingFace Text Embeddings Inference y TorchServe son opciones adecuadas. vLLM y TGI no estan orientados a clasificadores encoder de este tamano, aunque TGI puede servir el modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera latencia de milisegundos por lote en GPU moderna y de decenas de milisegundos en CPU, con throughput alto en lotes de 32 (batch de entrenamiento).
- Almacenamiento: el repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isletyang/hw1-hc3-detector | 22,7 M | 256 tokens | Clasificacion humano/ChatGPT sobre HC3 | No disponible | HuggingFace |
| Aishkrish/hw1-hc3-detector | No disponible | No disponible | Clasificacion humano/ChatGPT sobre HC3 | No disponible | HuggingFace |
| SiqiYang/hw1-hc3-detector | No disponible | No disponible | Clasificacion humano/ChatGPT sobre HC3 | Apache 2.0 (segun la ficha del repositorio) | HuggingFace, con soporte declarado para text-embeddings-inference |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Embeddings de frases (modelo base) | Apache 2.0 | HuggingFace |

Los tres repositorios `hw1-hc3-detector` encontrados parecen ser entregas del mismo ejercicio con el mismo modelo base y el mismo dataset, publicadas por usuarios distintos. No se dispone de datos de rendimiento de las variantes de Aishkrish y SiqiYang, por lo que no es posible compararlas cuantitativamente.

## Limitaciones y advertencias

- El propio autor advierte que el 0,9949 de exactitud corresponde a una particion historica de HC3 y que no es un detector fiable para redacciones de estudiantes actuales ni para texto de otras familias de modelos. La cifra no debe extrapolarse.
- Sesgo de dominio: el modelo aprende las particularidades estilisticas del ChatGPT de la epoca de HC3 y de los generos incluidos en el corpus. Aplicado a otros modelos o registros, la precision caera de forma no cuantificada.
- Sesgo linguistico: solo ingles. No hay evaluacion en castellano ni en ningun otro idioma.
- Riesgo de falsos positivos sobre texto humano formal, academico o no nativo, un patron habitual en detectores entrenados con este esquema.
- Ventana de contexto corta: 256 tokens. Los textos mas largos se truncan, con la consiguiente perdida de senal.
- Licencia no disponible: sin un termino de licencia explicito, el uso comercial queda en una zona juridica ambigua. Conviene contactar con el autor antes de integrarlo en un producto.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo. El riesgo equivalente es la clasificacion erronea con alta confianza.
- Advertencia de uso en produccion: no deberia emplearse como unico criterio para acusar a una persona de usar IA, ni en contextos academicos o laborales con consecuencias disciplinarias.
- Metadatos de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha pasado por una validacion externa por parte de la comunidad.
- Fecha de creacion registrada: 2026-10-01, con ultima actualizacion el 2026-10-01.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isletyang/hw1-hc3-detector
- Variante de Aishkrish: https://huggingface.co/Aishkrish/hw1-hc3-detector
- Variante de SiqiYang: https://huggingface.co/SiqiYang/hw1-hc3-detector
- Ficha de la variante de Yihangsun: https://savrn.com/models/hw1-hc3-detector
- Registro agregado de la variante de SiqiYang: https://free2aitools.com/model/siqiyang/hw1-hc3-detector
- Organizacion Hello-SimpleAI (corpus HC3 y detectores): https://github.com/Hello-SimpleAI
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset: https://huggingface.co/datasets/Hello-SimpleAI/HC3
