# FurkanNar/GPT-2_Instruct-v0.5

## Resumen

GPT-2_Instruct-v0.5 es un ajuste fino de tipo instruction-following sobre GPT-2, desarrollado por el usuario FurkanNar. Se construye a partir de FurkanNar/GPT-2_Instruct-v0.1, que a su vez deriva del GPT-2 original de OpenAI (openai-community/gpt2), y anade una capa de instrucciones entrenada sobre la combinacion de tres datasets: tatsu-lab/alpaca, databricks/databricks-dolly-15k y ChilleD/SVAMP (problemas matematicos de tipo word problem).

El modelo es un transformer decoder-only de 124.439.808 parametros reales (unos 124M), la misma escala que GPT-2 base. Su relevancia practica es limitada: se trata de un experimento de ajuste fino de bajo coste, con entrenamiento corto (4 epocas, secuencia maxima de 128 tokens) y un unico idioma soportado (ingles). No es un modelo competitivo para produccion frente a alternativas actuales, pero resulta util como referencia didactica para entender el pipeline de fine-tuning de instrucciones sobre arquitecturas pequenas.

La model card documenta un esquema de inferencia relativamente elaborado (Best-of-N con N=4, normalizacion de longitud y temperatura de calibracion) y un manejo de conversaciones multi-turno con truncado de contexto. Existe una version posterior, FurkanNar/GPT-2_Instruct-v0.6, marcada como `new_version` en la model card, lo que indica que v0.5 ya esta desactualizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Entrenamiento: 128 tokens; inferencia: truncado a 512 tokens. Base GPT-2: no confirmado en la model card |
| Tipos de cuantizacion | no disponible (unicamente pesos en FP16/safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,5 GB |
| Modelo base | openai-community/gpt2; FurkanNar/GPT-2_Instruct-v0.1 |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Descargas | 600 |
| Likes | 1 |
| Creado | 2026-10-06 |
| Actualizado | 2026-10-10 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 con 124M de parametros, sin innovaciones estructurales (no hay MoE, ni SSM, ni atencion lineal). El ajuste se realiza por fine-tuning supervisado sobre tres datasets de instrucciones en ingles: alpaca, Dolly-15k y SVAMP. Los hiperparametros documentados son 4 epocas, batch size de 4, learning rate de 2e-5, max grad norm de 1.0, precision mixta FP16 y fraccion de memoria GPU limitada al 50%.

No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO; solo fine-tuning supervisado. La model card reporta las siguientes metricas por epoca:

| Epoca | Train loss | Train perplexity | Val loss | Val perplexity |
|---|---|---|---|---|
| 1 | 3,1501 | 23,3380 | 2,8375 | 17,0723 |
| 2 | 2,9357 | 18,8347 | 2,7899 | 16,2790 |
| 3 | 2,8122 | 16,6459 | 2,7688 | 15,9397 |
| 4 | 2,7149 | 15,1032 | 2,7618 | 15,8282 |

La innovacion tecnica destacable no esta en el entrenamiento, sino en la inferencia: el autor implementa una generacion Best-of-N (N=4 por defecto) con puntuacion por log-verosimilitud normalizada por longitud, temperatura de calibracion independiente (T_calib=1.0 o 0.8 segun la seccion) y seleccion del candidato con mayor confianza calibrada. Tambien se describen criterios de parada personalizados para evitar sobre-generacion.

## Capacidades

- Generacion de texto en ingles y respuesta a instrucciones de formato simple.
- Razonamiento aritmetico basico limitado, condicionado por el dataset SVAMP de problemas verbales matematicos.
- Soporte de conversaciones multi-turno mediante historial con etiquetas "Instruction:" y "Response:", con truncado automatico cuando el contexto supera los 512 tokens.
- Generacion con muestreo controlado: temperatura 0.7, top-k 40, top-p 0.9, penalizacion de repeticion 1.15 y no-repeat n-gram de tamano 3.
- Best-of-N sampling con normalizacion de longitud para mitigar el sesgo hacia respuestas cortas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de modo de pensamiento (thinking), vision ni audio.
- Capacidad multilingue: no disponible (solo ingles).

## Casos de uso

- Prototipado docente de pipelines de instrucciones: sirve para ilustrar el ciclo completo de fine-tuning, evaluacion por perplejidad y despliegue con `transformers` en un modelo de 124M que cabe en cualquier GPU.
- Generacion de texto corto en ingles sin requisitos de calidad alta: notas, respuestas breves o relleno de plantillas donde el coste computacional es la prioridad.
- Experimentacion con tecnicas de decodificacion: el codigo de Best-of-N con normalizacion de longitud permite estudiar seleccion de candidatos y calibracion de confianza sobre un modelo pequeno.
- Pruebas de conversacion multi-turno a escala reducida: util para validar logicas de gestion de historial y criterios de parada antes de portarlas a modelos mayores.
- Aprendizaje de problemas verbales matematicos basicos: por su entrenamiento con SVAMP, puede generar respuestas a problemas de word problems sencillos en ingles, con precision no garantizada.
- Evaluacion comparativa de metodos de ajuste: al ser un modelo abierto con licencia MIT y pesos safetensors, permite reproducir el entrenamiento y contrastarlo con otras variantes del mismo GPT-2.
- Base para fine-tuning posterior en dominios concretos en ingles: su licencia MIT y tamano reducido lo hacen apto como punto de partida de bajo coste para tareas muy acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas documentadas son las de entrenamiento (loss y perplejidad por epoca) recogidas en el apartado anterior. La perplejidad de validacion final es 15,8282 tras 4 epocas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB en FP16 (124M parametros x 2 bytes), unos 125 MB en INT8 y unos 62 MB en INT4. Cifras orientativas calculadas a partir del numero de parametros.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia de baja latencia.
- Tambien es viable en entornos sin GPU dedicada (CPU) o en hardware embebido tipo Jetson, dado el tamano.
- Opciones de despliegue: transformers (biblioteca declarada), text-generation-inference (etiqueta presente en el repositorio) y, por formato de pesos, conversion a llama.cpp/GGUF u Ollama previa conversion manual. No se documentan configuraciones oficiales para vLLM ni TGI.
- La model card menciona que durante el entrenamiento se limito la memoria GPU al 50%, pero no aporta datos de latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| GPT-2_Instruct-v0.5 | 124,4M | 128 (entrenamiento) / 512 (inferencia) | en | MIT | Fine-tuning de instrucciones sobre GPT-2 con Best-of-N en inferencia |
| openai-community/gpt2 (base) | 124M | 1024 (no confirmado en la informacion) | en | MIT | Modelo base sin ajuste de instrucciones |
| FurkanNar/GPT-2_Instruct-v0.1 | no disponible | no disponible | en | MIT | Version anterior del mismo autor |
| FurkanNar/GPT-2_Instruct-v0.6 | no disponible | no disponible | en | MIT | Version posterior marcada como `new_version` |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion: al derivar de GPT-2 (124M), su conocimiento factual es muy limitado y tiende a generar contenido inexacto, especialmente fuera del dominio de entrenamiento.
- Homogeneidad entre candidatos: la propia model card advierte de "tight clusters", es decir, las N muestras del Best-of-N pueden ser muy similares, reduciendo la utilidad del metodo de seleccion.
- Limitacion de idioma: solo soporta ingles; no hay evidencia de capacidad multilingue.
- Ventana de contexto corta: el entrenamiento uso 128 tokens y la inferencia trunca a 512, lo que restringe tareas que requieran contexto largo.
- Calidad de instrucciones limitada: el ajuste con 4 epocas y secuencia de 128 tokens produce respuestas cortas y a menudo incoherentes (el ejemplo de la model card sobre "How to make a salad" es incorrecto y divagante).
- Modelo desactualizado: la model card marca FurkanNar/GPT-2_Instruct-v0.6 como version nueva.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, sin las restricciones de licencias tipo RAIL. No obstante, la calidad del modelo hace desaconsejable su uso en produccion seria.
- No se documentan sesgos especificos, pero al entrenar sobre Dolly-15k y Alpaca hereda los sesgos presentes en dichos datasets.
- Sin soporte documentado de tool calling, agentes ni function calling.
- Metadatos de entrenamiento incompletos: no se especifica el numero total de tokens ni la composicion exacta del dataset combinado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FurkanNar/GPT-2_Instruct-v0.5
- Version anterior: https://huggingface.co/FurkanNar/GPT-2_Instruct-v0.1
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Dataset alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset SVAMP: https://huggingface.co/datasets/ChilleD/SVAMP
