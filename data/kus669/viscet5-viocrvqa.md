# Kus669/ViSceT5-ViOCRVQA

## Resumen

ViSceT5-ViOCRVQA es un modelo de respuesta visual a preguntas (VQA) sobre texto en escena para vietnamita, desarrollado por el usuario Kus669. Combina un encoder-decoder ViT5 (VietAI/vit5-base, aproximadamente 346 millones de parametros) con caracteristicas visuales de CLIP ViT-B/16 enriquecidas por la pregunta, y recibe ademas como entrada un bloque de tokens OCR con informacion de cajas, deteccion y reconocimiento de caracteres. El modelo genera la respuesta de forma autoregresiva condicionada por la imagen, la pregunta y el texto detectado en la imagen.

La relevancia del modelo reside en su enfoque especifico para el problema del scene-text VQA, donde la respuesta depende criticamente de leer correctamente el texto presente en la imagen. Para ello incorpora mecanismos de entrenamiento como Consformer (atencion con prior sobre palabras OCR), DOVE (entrenamiento con dos vistas del bloque OCR) y OACT (entrenamiento adversarial contrastivo sobre las vistas OCR, activo solo durante el entrenamiento). El checkpoint publicado esta afinado sobre el conjunto ViOCRVQA y reporta resultados en su split de test.

El modelo esta pensado para investigacion y evaluacion en vietnamita; su arquitectura es personalizada (`model_type: openvivqa`) y no carga con `AutoModel`, por lo que requiere el codigo del repositorio del autor. No se declara licencia en la model card ni en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder ViT5 (transformer) con adaptador visual CLIP ViT-B/16 condicionado por la pregunta y bloque de entrada OCR |
| Parametros totales | 345.630.410 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | VietAI/vit5-base (texto), openai/clip-vit-base-patch16 (vision) |
| Tamano del repositorio | 17,3 GB |
| Pipeline | visual-question-answering |
| Tipo de modelo | openvivqa (arquitectura personalizada, no compatible con AutoModel) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder: el encoder procesa la pregunta junto con un bloque de tokens OCR que incluye texto, cajas, senales de deteccion, reconocimiento y caracteres; el decoder ViT5 genera la respuesta token a token. Las caracteristicas visuales provienen de CLIP ViT-B/16 y pasan por un adaptador condicionado por la pregunta (QA-ViT) con una perdida de grounding. La atencion del encoder incorpora Consformer, un prior sobre constituyentes de las palabras OCR, junto con una perdida de span.

El entrenamiento utiliza DOVE, que presenta dos vistas del bloque OCR (la original y una copia "relacionada" con algunas palabras editadas), y OACT, una estrategia adversarial contrastiva que anade ruido a cada vista en la direccion del gradiente de la perdida de respuesta (epsilon 0,05 del RMS de los tokens) y aplica una perdida contrastiva supervisada conjunta sobre cuatro vistas (dos limpias y dos perturbadas, con cabezas de proyeccion separadas). OACT esta activo en este checkpoint (`dove_adv=ocr_both`) pero no se usa en inferencia. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La generacion en inferencia usa busqueda por haz con 4 haces y hasta 56 tokens nuevos.

## Capacidades

- Respuesta visual a preguntas sobre texto en escena (scene-text VQA) en vietnamita.
- Lectura e integracion de tokens OCR (texto, cajas, deteccion, reconocimiento y caracteres) como parte de la entrada.
- Generacion de respuestas cortas de forma autoregresiva con busqueda por haz.
- Condicionamiento visual mediante caracteristicas CLIP ViT-B/16 adaptadas a la pregunta.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada al vietnamita segun la model card.

## Casos de uso

- Investigacion en scene-text VQA: evaluacion de modelos que deben responder preguntas cuya respuesta esta escrita en la imagen, usando ViOCRVQA como referencia y el protocolo de evaluacion del repositorio (EM, F1, BLEU, CIDEr, BERTScore).
- Extraccion de informacion de documentos escaneados en vietnamita: el modelo puede responder preguntas sobre campos concretos (fechas, importes, nombres) a partir del texto detectado por OCR y de la imagen.
- Analisis de carteles y senales en vietnamita: responder preguntas sobre el contenido textual de fotografias de carteles, etiquetas o rotulos, siempre que el OCR previo sea correcto.
- Digitalizacion de recibos y facturas: combinado con un pipeline OCR, permite consultar datos textuales de documentos sin transcribir manualmente.
- Asistencia a personas con discapacidad visual en entornos vietnamitas: responder a preguntas sobre texto visible en el entorno a partir de una imagen capturada.
- Control de calidad de pipelines OCR: comparar las respuestas del modelo con la verdad de referencia para detectar fallos de reconocimiento en el texto detectado.
- Prototipos de busqueda visual sobre texto: indexar imagenes por su contenido textual y responder consultas en lenguaje natural sobre ese texto.

## Benchmarks y rendimiento

Resultados reportados por el autor en ViOCRVQA (test: 18.601 preguntas; dev: split de validacion en el checkpoint seleccionado). Metrica principal EM/F1, evaluada con `training/benchmark_eval.py` del repositorio de codigo.

| Metrica | Test | Dev |
|---|---|---|
| Exact Match (EM) | 61,68 | 61,73 |
| F1 (token) | 79,50 | 79,39 |
| F1 (caracter) | 87,14 | No disponible |
| BLEU-1 | 80,91 | 81,19 |
| BLEU-4 | 73,54 | 73,65 |
| BLEU-avg | 77,16 | No disponible |
| CIDEr | 6,1498 | 6,1934 |
| BERTScore F1 | 93,31 | No disponible |

Los resultados provienen de una unica ejecucion de entrenamiento (una semilla) y el checkpoint se selecciono sobre dev, nunca sobre test. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 345,6 millones de parametros, los pesos en fp32 ocupan aproximadamente 1,38 GB segun la model card; el consumo real depende del adaptador visual CLIP, del codigo personalizado y del tamano del lote.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es compatible con GPUs de consumo, aunque no se documenta el consumo exacto.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del backbone, pero no hay datos oficiales de VRAM ni de latencia.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El uso previsto es mediante el repositorio de codigo del autor (commit `0907f9a`) y el notebook `notebooks/twc_colab.ipynb`, con `run_pipeline.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos en la informacion proporcionada. Como referencia estructural, el modelo se apoya en VietAI/vit5-base (encoder-decoder de texto en vietnamita) y en openai/clip-vit-base-patch16 (vision), pero no se aportan resultados comparativos frente a alternativas de scene-text VQA.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ViSceT5-ViOCRVQA | 345,6 M | No disponible | No disponible | Hugging Face (repo de 17,3 GB) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado y evaluado unicamente sobre ViOCRVQA; no se garantiza su comportamiento en otros conjuntos de VQA en vietnamita ni en otros idiomas.
- La respuesta depende de los tokens OCR: errores u omisiones en el texto detectado limitan directamente lo que el modelo puede responder.
- Resultados obtenidos con una sola semilla de entrenamiento, sin repeticion experimental.
- No se declara licencia, por lo que el uso comercial queda sin autorizacion explicita y requiere consulta al autor.
- Arquitectura personalizada (`model_type: openvivqa`): no carga con `AutoModel` de transformers y exige el codigo del repositorio en el commit indicado.
- No se documentan sesgos conocidos, riesgos de alucinacion medidos ni limites de contexto; deben asumirse los riesgos habituales de un modelo generativo afinado sobre un unico dataset.
- El checkpoint esta pensado para inferencia con busqueda por haz de 4 haces y hasta 56 tokens nuevos; respuestas mas largas no estan cubiertas por el protocolo documentado.
- No hay paper publicado todavia (en preparacion), lo que limita la verificacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kus669/ViSceT5-ViOCRVQA
- Repositorio de codigo: https://github.com/Kussssssss/ViSceT5
- Commit de codigo usado para el checkpoint: https://github.com/Kussssssss/ViSceT5/tree/0907f9a
- Modelo base de texto: https://huggingface.co/VietAI/vit5-base
- Modelo base de vision: https://huggingface.co/openai/clip-vit-base-patch16
