# AkkiMaharaj/slm-30m-base

## Resumen

SLM-30M-Base es un modelo de lenguaje de 30 millones de parametros con arquitectura GPT decoder-only, desarrollado por el usuario AkkiMaharaj y publicado en HuggingFace bajo licencia MIT. Se trata de un proyecto personal de aprendizaje: el autor lo entreno integramente desde cero (tokenizador incluido) con el objetivo de comprender el funcionamiento interno de un transformer, no de competir con modelos de produccion. El propio autor indica explicitamente que no esta pensado para uso en produccion.

El modelo consta de 8 capas, 8 cabezas de atencion, una dimension de embedding de 512 y una ventana de contexto de solo 512 tokens, con embeddings de entrada y salida atados (weight tying). Usa atencion escalada de PyTorch (`scaled_dot_product_attention`, con FlashAttention cuando esta disponible). Se entreno sobre un unico volcado de Wikipedia en ingles (`wikimedia/wikipedia`, `20231101.en`) con un tokenizador BPE a nivel de byte de vocabulario reducido (16.384 tokens).

Su relevancia es fundamentalmente didactica y de investigacion: sirve como caso minimo y reproducible para estudiar tokenizacion, atencion y el bucle de entrenamiento de un GPT, asi como para experimentar con pipelines de inferencia a coste practicamente nulo. Existe una variante ajustada para preguntas y respuestas, `slm-30m-qa`, mencionada por el autor. No se han publicado resultados de benchmarks ni cifras de tokens totales vistos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT decoder-only (transformer denso) |
| Parametros totales | 30 millones (aproximado, segun el autor) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (carga mediante `torch.load("latest.pt")`); no se publican safetensors ni GGUF |
| Capas | 8 |
| Cabezas de atencion | 8 |
| Dimension de embedding | 512 |
| Vocabulario | 16.384 tokens (BPE a nivel de byte, propio) |
| Weight tying | si (embeddings de entrada y salida compartidos) |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion en HuggingFace | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico al estilo GPT, con 8 capas y 8 cabezas de atencion sobre una dimension de modelo de 512, y con los embeddings de entrada y salida atados para reducir el numero de parametros. La capa de atencion se implementa con `torch.nn.functional.scaled_dot_product_attention`, lo que permite aprovechar FlashAttention en hardware compatible sin cambiar el codigo. El tokenizador es un BPE a nivel de byte entrenado desde cero con un vocabulario de 16.384 entradas, deliberadamente reducido respecto a los 50.000-100.000 tokens habituales en modelos de produccion.

El entrenamiento se hizo sobre un unico dump de Wikipedia en ingles (`wikimedia/wikipedia`, configuracion `20231101.en`), sin mezcla de otras fuentes. El optimizador es AdamW con beta1 = 0,9, beta2 = 0,95 y weight decay de 0,1; el scheduler es un annealing coseno con warmup, con pico de 1e-3 y minimo de 1e-4. Para estabilizar el entrenamiento se usaron acumulacion de gradientes y clipping de gradientes con umbral 1,0. El autor no publica el numero total de tokens vistos (la model card deja ese campo como plantilla sin rellenar), ni detalla el numero de pasos, el tamano de batch efectivo ni si hubo fases de ajuste adicionales. No se menciona RLHF, DPO ni ningun tipo de alineacion; se trata de un modelo exclusivamente preentrenado, sin fine-tuning posterior.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, con calidad limitada a nivel de n-gramas y frases cortas.
- Continuacion de texto a partir de un prompt breve, siempre dentro del limite de 512 tokens de contexto.
- Modelado de lenguaje a nivel de caracter/token (util para calcular perplejidad en corpus de prueba).
- Capacidad muy limitada de coherencia a medio plazo: el autor advierte de texto incoherente o repetitivo fuera de la distribucion de entrenamiento.
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo agente, planificacion multi-paso ni razonamiento explicito (no hay thinking mode).
- No soporta vision, audio ni otras modalidades.
- Multilingue: no. Solo ingles.
- Existe una variante ajustada para preguntas y respuestas, `slm-30m-qa`, aunque no se documentan sus detalles en la informacion disponible.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo es lo bastante pequeno (30M parametros, fichero de pesos de ~0,12 GB en fp32) como para cargarse en CPU y recorrerlo capa por capa en un aula o en un cuaderno de Jupyter, mostrando como se calcula la atencion y como se genera token a token.
- Banco de pruebas de pipelines de inferencia: sirve para validar integraciones con PyTorch, `scaled_dot_product_attention`, compilacion con `torch.compile` o empaquetado en contenedores sin consumir GPU cara, ya que el coste por iteracion es minimo.
- Reproduccion de experimentos de tokenizacion: al incluir un tokenizador BPE propio de 16.384 tokens, permite comparar el impacto del tamano de vocabulario en la perplejidad y en la longitud efectiva de las secuencias frente a vocabularios mayores.
- Investigacion sobre escalado con recursos limitados: util como punto de partida en estudios de leyes de escalado a escala de juguete, comparando curvas de perdida con modelos de 10M-100M de parametros en el mismo corpus.
- Generacion de texto de relleno o plantillas en entornos controlados: para pruebas de interfaz, datos sinteticos de baja fidelidad o demos internas donde no se requiere correccion factual.
- Pruebas de regresion de software de inferencia: sirve como modelo canonico para verificar que una version nueva de un runtime produce exactamente las mismas salidas, dado su bajo coste de ejecucion.
- Base para fine-tuning experimental: al ser un checkpoint de preentrenamiento puro, es un punto de partida razonable para ejercicios de ajuste supervisado en tareas muy acotadas (clasificacion de texto corto, respuestas simples), como demuestra la variante `slm-30m-qa`.
- Evaluacion comparativa de hardware: su tamano permite medir latencias relativas entre CPU, GPU integrada y GPU dedicada sin que el modelo sea el cuello de botella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni perplejidad sobre conjuntos de validacion, y el autor tampoco reporta el numero total de tokens de entrenamiento.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,12 GB en fp32, 0,06 GB en fp16/bf16 y 0,03 GB en int8. Son estimaciones derivadas del numero de parametros; el autor no publica cifras oficiales.
- VRAM real en ejecucion: sumando activaciones y el overhead del runtime de PyTorch con CUDA, es razonable esperar entre 0,5 GB y 2 GB en funcion del backend y del tamano de batch.
- GPU recomendadas: cualquier GPU con CUDA, incluida una GTX 1050 Ti o una GPU integrada con soporte ROCm/CUDA. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, e incluso en CPU (inferencia en CPU perfectamente viable para uso interactivo).
- Opciones de despliegue: inferencia directa con PyTorch (`torch.load` + `model.generate`). No se publican pesos en GGUF, por lo que no esta disponible directamente en llama.cpp ni en Ollama sin una conversion previa. vLLM o TGI son tecnicamente posibles pero desproporcionados para este tamano y no estan documentados por el autor.
- Latencia y throughput estimados: no disponible. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SLM-30M-Base | 30M | 512 | MIT | HuggingFace, pesos `.pt` |
| GPT-2 small | 124M | 1024 | MIT modificada | Ampliamente disponible (safetensors, GGUF) |
| TinyStories-33M | ~33M | 2048 | MIT (variante segun version) | HuggingFace, safetensors |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | HuggingFace, safetensors, GGUF |
| Pythia-70M | 70M | 2048 | Apache 2.0 | HuggingFace, safetensors |

Nota: las cifras de los modelos de comparacion corresponden a su documentacion publica habitual y deben verificarse en cada repositorio antes de citarlas. En rendimiento no es posible comparar, ya que SLM-30M-Base no publica resultados de benchmarks. Frente a estas alternativas, SLM-30M-Base destaca unicamente por su caracter didactico (codigo y tokenizador propios, entrenamiento desde cero) y no por calidad, contexto ni ecosistema de formatos.

## Limitaciones y advertencias

- Modelo explicitamente no destinado a produccion, segun el propio autor.
- Entrenado exclusivamente con Wikipedia en ingles, lo que concentra sesgos enciclopedicos, anglocentricos y de sobrerrepresentacion de determinados paises, temas y registros formales.
- Vocabulario reducido (16.384 tokens) y corpus unico, lo que degrada la tokenizacion de terminos tecnicos, nombres propios y texto multilingue.
- Ventana de contexto de 512 tokens, insuficiente para conversaciones multi-turno, documentos largos o tareas de recuperacion aumentada con contexto extenso.
- Riesgo alto de alucinacion, incoherencia, repeticion y perdida de hilo en prompts fuera de la distribucion de entrenamiento.
- Solo ingles; no se garantiza ningun comportamiento razonable en castellano ni en otros idiomas.
- Licencia MIT: permite uso comercial y modificacion, pero eso no implica que el modelo sea apto para ello. No hay evaluacion de sesgos, seguridad ni alineacion.
- Formato de pesos en `.pt` cargado con `torch.load`, que emplea pickle: cargar checkpoints de origen no confiable implica riesgo de ejecucion de codigo arbitrario. Se recomienda auditar el fichero o convertirlo a safetensors antes de usarlo.
- No se publican pesos cuantizados, ni datos de entrenamiento procesados, ni el numero de tokens vistos, lo que dificulta reproducir el entrenamiento.
- Sin fine-tuning ni alineacion posterior: no sigue instrucciones de forma fiable y no soporta system prompts ni plantillas de chat.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AkkiMaharaj/slm-30m-base
- Variante ajustada para preguntas y respuestas: `slm-30m-qa` (mencionada en la model card; no se dispone de URL verificada en la informacion proporcionada)
- Dataset de entrenamiento: `wikimedia/wikipedia`, configuracion `20231101.en` (https://huggingface.co/datasets/wikimedia/wikipedia)
- Documentacion de `scaled_dot_product_attention` en PyTorch (referenciada por la implementacion): https://pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html

Los resultados de la busqueda web (llm-stats.com, artificialanalysis.ai, onyx.app, github.com/samssouza/uncensored-ai-list) corresponden a rankings genericos de modelos de gran escala y no contienen informacion relevante ni especifica sobre este modelo.
