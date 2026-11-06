# MikhailLis/qwen2.5-vl-3b-pdf-surgery-lora

## Resumen

El modelo `MikhailLis/qwen2.5-vl-3b-pdf-surgery-lora` es un adaptador LoRA de tipo PEFT, de tan solo 7,73 MB, diseñado para el modelo base `Qwen/Qwen2.5-VL-3B-Instruct`. Lo desarrolla el usuario MikhailLis y su objetivo es mejorar la transcripción de documentos científicos en PDF: reconstrucción de tablas multicolumna complejas, extracción de fórmulas matemáticas en LaTeX y fidelidad en texto técnico en ruso (cirílico). El adaptador se presenta como una pieza de "cirugía analítica del espacio de pesos" (weight-space surgery) y de fusión de modelos, sin entrenamiento por descenso de gradiente, siguiendo un bucle de investigación autónoma al estilo Karpathy.

El modelo base es un transformer vision-language de 3 mil millones de parámetros de la familia Qwen2.5-VL, con capacidades de image-to-text y soporte multilingüe (inglés y ruso según la model card). El adaptador se publica bajo licencia Apache 2.0 y se distribuye en formato safetensors compatible con la librería PEFT.

Su relevancia radica en que aborda un problema práctico muy concreto: los modelos VLM pequeños tienden a truncar tablas densas y a corromper notación matemática al transcribir PDFs científicos. El autor reporta reducciones de error de entre el 15,3 % y el 32,2 % en tres documentos de referencia, con una aceleración de inferencia de 2,2x mediante decodificación especulativa con k=2 sobre una RTX 3060. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-language Qwen2.5-VL-3B-Instruct |
| Parametros totales | No disponible (el adaptador pesa 7,73 MB; el modelo base tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles y ruso (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Qwen2.5-VL-3B-Instruct, un transformer vision-language de 3 mil millones de parametros. El adaptador en si es un LoRA de bajo rango gestionado mediante la libreria PEFT y almacenado en safetensors. Segun la model card, no se realizo entrenamiento ni descenso de gradiente: el autor describe el proceso como "cirugia analitica del espacio de pesos" (weight-space surgery) combinada con tecnicas de fusion de modelos (model merging), en el marco de un bucle de investigacion autonoma denominado "Karpathy autonomous research loop".

La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO, ya que el enfoque declarado no es de entrenamiento supervisado. La innovacion tecnica destacable es la aplicacion de decodificacion especulativa con k=2, que el autor reporta como responsable de una aceleracion de 2,2x en el tiempo de inferencia (de 255,2 s a 115,6 s para tres paginas completas en una RTX 3060). Tambien se menciona el uso de decodificacion greedy determinista (temperature=0.0, do_sample=False) para la evaluacion.

## Capacidades

- Transcripcion de documentos cientificos en PDF con preservacion de estructura.
- Reconstruccion de tablas multicolumna complejas, incluyendo alineacion columna-cabecera y notacion cientifica (por ejemplo, $10^{19}$).
- Extraccion de formulas matematicas en LaTeX, incluyendo fracciones, raices cuadradas y subindices.
- Reconocimiento optico de caracteres (OCR) orientado a documentos academicos y tecnicos.
- Comprension de documentos (document understanding) con salida en Markdown.
- Soporte de texto en cirilico (ruso) con preservacion de tipografia y puntuacion.
- Capacidad image-to-text heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Capacidades zero-shot segun la model card (sin ejemplos especificos por tarea).

## Casos de uso

- Digitalizacion de articulos cientificos: el adaptador permite convertir PDFs de papers en Markdown estructurado preservando ecuaciones LaTeX y tablas de resultados, lo que facilita su indexacion en repositorios de conocimiento o su conversion a HTML.
- Extraccion de tablas de resultados en revisiones sistematicas: la recuperacion del 100 % de filas en la tabla de comparacion de modelos de traduccion (10 de 10) lo hace adecuado para pipelines de meta-analisis donde la perdida de filas invalida el estudio.
- Conversion de documentacion tecnica en ruso: la fidelidad del 100 % en caracteres cirilicos (512 de 512) permite procesar manuales y papers rusos sin degradacion tipografica.
- Generacion de datasets de entrenamiento para modelos de matematicas: la extraccion fiable de formulas LaTeX a partir de PDFs permite construir corpus de ecuaciones para fine-tuning posterior.
- Preprocesamiento en pipelines RAG sobre literatura cientifica: al mejorar la fidelidad de la transcripcion, reduce el ruido en los fragmentos indexados y mejora la calidad de las respuestas del sistema de recuperacion.
- Automatizacion de la revision de literatura en entornos con GPU consumer: su tamano (7,73 MB de adaptador sobre un modelo de 3B) y la aceleracion de 2,2x en RTX 3060 permiten desplegarlo en estaciones de trabajo sin GPU de datacenter.
- Extraccion de citas y referencias cruzadas: la preservacion de claves de citacion como `[2]`, `[3]` o `[18]` facilita la construccion de grafos de citas a partir de PDFs.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. La evaluacion usa decodificacion greedy determinista y distancia de Levenshtein Wagner-Fischer para CER y WER.

| Seccion del benchmark | Reto del documento | Caracteres ground truth | Modelo base | Base + LoRA | Reduccion absoluta | Mejora relativa |
|---|---:|---:|---:|---:|---:|---:|
| Pagina 4 (matematicas y formulas) | Ecuaciones LaTeX, $\frac{QK^T}{\sqrt{d_k}}$, citas | 2.508 | 382 errores | 259 errores | -123 | -32,2 % |
| Pagina 8 (tabla 2) | 10 filas x 7 columnas, BLEU, FLOPs $10^{19}$ | 3.194 | 590 errores (truncada) | 422 errores (10/10 filas) | -168 | -28,5 % |
| Ruso tecnico (cirilico) | Discurso tecnico ruso multiclausula | 798 | 98 errores | 83 errores | -15 | -15,3 % |
| Benchmark global | Prueba compuesta multidominio | 6.500 | 1.043 errores | 764 errores | -279 | -26,7 % |
| CER macro | Porcentaje de error | — | 16,04 % | 11,75 % | -4,29 % absoluto | -26,7 % relativo |
| Preservacion de filas (tabla 2) | Recuperacion completa | 10 filas | 8/10 (80 %) | 10/10 (100 %) | +2 filas | +25,0 % |
| Tiempo de inferencia | 3 paginas en RTX 3060 | — | 255,2 s | 115,6 s (especulativa k=2) | -139,6 s | 2,2x |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Qwen2.5-VL-3B-Instruct requiere aproximadamente entre 6 y 8 GB en FP16, y menos con cuantizacion de 8 o 4 bits, aunque el autor no publica cifras.
- GPU recomendadas: el autor reporta pruebas en una RTX 3060, por lo que cabe en GPU consumer de gama media.
- Cabe en GPU consumer: si, segun la evidencia de la RTX 3060 reportada en la model card.
- Opciones de despliegue: no se especifican en la model card; al ser un adaptador PEFT sobre Qwen2.5-VL-3B-Instruct, es compatible con el ecosistema de la libreria PEFT y con el modelo base (vLLM, TGI, llama.cpp u Ollama dependerian del soporte del modelo base, no documentado aqui).
- Latencia y throughput: 115,6 s para tres paginas completas en RTX 3060 con decodificacion especulativa k=2 (frente a 255,2 s del modelo base sin el adaptador).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct + PDF-Surgery-LoRA | 3B (base) + 7,73 MB (adaptador) | No disponible | LoRA zero-shot por cirugia de pesos | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-3B-Instruct (base) | 3B | No disponible | VLM generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en OCR/PDF | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos especializados en transcripcion de PDF en la informacion proporcionada.

## Limitaciones y advertencias

- El benchmark se limita a tres documentos y 6.500 caracteres de ground truth, una muestra muy reducida que limita la generalizacion de los resultados.
- El CER final del 11,75 % sigue siendo elevado para produccion en tareas que requieran transcripcion exacta.
- El modelo base trunca tablas densas; aunque el adaptador recupera las 10 filas en el caso evaluado, no hay garantia de que lo haga en tablas de mayor tamano o con estructuras distintas.
- El soporte de idiomas declarado se limita a ingles y ruso; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion mas alla de los errores de transcripcion medidos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios fuera del benchmark.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- El enfoque de "cirugia de pesos sin entrenamiento" no esta documentado con detalle reproducible en la model card; la metodologia exacta no es verificable a partir de la informacion disponible.
- No se especifican requisitos de VRAM ni opciones de despliegue validadas para el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MikhailLis/qwen2.5-vl-3b-pdf-surgery-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper de referencia del benchmark (Attention Is All You Need): https://arxiv.org/abs/1706.03762
