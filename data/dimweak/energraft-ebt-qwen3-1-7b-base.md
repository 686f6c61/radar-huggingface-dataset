# dimweak/Energraft-EBT-Qwen3-1.7B-Base

## Resumen

Energraft-EBT-Qwen3-1.7B-Base es un modelo de lenguaje basado en energia (energy-based model, EBT) desarrollado por el usuario dimweak a partir del modelo base Qwen3-1.7B-Base de Alibaba. En lugar de la generacion autorregresiva convencional con softmax, el modelo genera cada token mediante una unica actualizacion de gradiente sobre una funcion de energia, partiendo de un candidato aleatorio inicializado con logits gaussianos (sigma=1). Esta aproximacion reformula la decodificacion como un problema de optimizacion y constituye una linea de investigacion alternativa a los transformers clasicos.

El modelo conserva el backbone Transformer de Qwen3 con 1.720.574.976 parametros y 28 capas, al que se anade una cabeza de energia (MLP residual 2048 -> 256 -> 1). Fue adaptado sobre 168 millones de posiciones de prediccion supervisada, cubriendo ingles, chino, codigo y matematicas, mediante destilacion de distribucion sobre el vocabulario completo con el backbone y la cabeza optimizados conjuntamente y los embeddings atados congelados.

Su relevancia es principalmente experimental: explora si la decodificacion por gradiente de energia puede competir con la generacion estandar en modelos de escala pequena. La version publicada es v0.2, con pesos en FP32, licencia Apache 2.0 y soporte para ingles y chino. El modelo tiene un uso muy limitado (0 descargas en el momento de la consulta) y esta orientado a investigacion mas que a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3) con cabeza de energia MLP residual 2048 -> 256 -> 1; modelo de lenguaje basado en energia |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (release en FP32; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (backbone FP32), incluye cabeza de energia, tokenizer y codigo de inferencia |

## Arquitectura y entrenamiento

El modelo parte del backbone Transformer de Qwen3-1.7B-Base (28 capas, 1.7B parametros) y le anade una cabeza de energia que proyecta el estado oculto de 2048 dimensiones a traves de una capa intermedia de 256 hasta un escalar, con conexion residual. La generacion se realiza mediante decodificacion de un solo paso por gradiente de energia: para cada token se inicializa un candidato con logits gaussianos (sigma=1) y se aplica una unica actualizacion de gradiente sobre la funcion de energia para obtener la prediccion final, en lugar del muestreo softmax habitual. Esta formulacion se inspira en el trabajo Energy-Based Transformers (EBT).

El entrenamiento se realizo sobre 168 millones de posiciones de prediccion supervisada, combinando texto de corpus con prefijos generados por el profesor y por el propio estudiante, y empleando destilacion de distribucion sobre el vocabulario completo. El backbone Transformer y la cabeza de energia se optimizaron de forma conjunta, mientras que los embeddings de tokens atados permanecieron congelados. Los datos cubren ingles, chino, codigo y matematicas. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO, ni el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto autoregresiva mediante decodificacion por gradiente de energia (un paso por token).
- Razonamiento basico y respuesta a preguntas de sentido comun (evaluado en PIQA, ARC, HellaSwag, WinoGrande).
- Razonamiento matematico de varios pasos (evaluado en GSM8K con hasta 512 tokens generados).
- Capacidades en chino (evaluado en C-Eval con 5 shots).
- Generacion de codigo, segun la composicion del entrenamiento (ingles, chino, codigo y matematicas).
- Soporte multilingue limitado a ingles y chino.
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion en modelos de lenguaje basados en energia: el modelo sirve como banco de pruebas para estudiar la decodificacion por gradiente frente a la decodificacion softmax, comparando calidad y estabilidad en tareas controladas.
- Experimentos academicos de destilacion: permite analizar el efecto de la destilacion de distribucion sobre vocabulario completo con embeddings congelados en un modelo de 1.7B parametros.
- Evaluacion comparativa en benchmarks estandar: utilizable con lm-evaluation-harness v0.4.9.2 mediante el adaptador EBT incluido, para replicar los resultados publicados de PIQA, ARC, HellaSwag, WinoGrande, C-Eval y GSM8K.
- Generacion de texto en ingles y chino para prototipos: adecuado para entornos de prueba donde se requiera un modelo pequeno (1.7B) ejecutable en una sola GPU con pesos FP32.
- Estudio de robustez y calibracion: la inicializacion gaussiana de candidatos permite investigar la sensibilidad de la generacion a la semilla y a la varianza inicial (sigma=1) en tareas de continuacion de texto.
- Docencia y divulgacion: como ejemplo didactico de implementacion de un EBM sobre un backbone Transformer conocido, con codigo de inferencia incluido en el repositorio.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con lm-evaluation-harness v0.4.9.2, inferencia FP32, inicializacion gaussiana sigma=1 y semilla 1234. Las puntuaciones son porcentajes.

| Benchmark | Shots | Metrica | Puntuacion |
|---|---:|---|---:|
| PIQA | 0 | Accuracy / accuracy normalizada | 69,86 / 72,20 |
| ARC-Easy | 0 | Accuracy normalizada | 64,86 |
| ARC-Challenge | 0 | Accuracy normalizada | 39,68 |
| HellaSwag | 0 | Accuracy normalizada | 59,33 |
| WinoGrande | 0 | Accuracy | 61,72 |
| C-Eval | 5 | Accuracy | 64,12 |
| GSM8K | 5 | Exact match estricto | 61,71 |
| GSM8K | 5 | Exact match con extraccion flexible | 68,84 |

La evaluacion cubre 19.360 ejemplos, incluyendo las 52 asignaturas de validacion de C-Eval y el split de test completo de GSM8K. GSM8K se evaluo con decodificacion greedy y un maximo de 512 tokens generados. No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se distribuyen en FP32 (1,72B parametros, aproximadamente 6,9 GB solo en pesos) mas el estado de activaciones; se estima un minimo de 8-10 GB de VRAM para inferencia en FP32. No se documentan versiones cuantizadas, por lo que no hay cifras para FP16, INT8 o INT4.
- GPU recomendadas: tarjetas con al menos 12-16 GB de VRAM para margen comodo, como RTX 4080, RTX 4090, A100 o H100. El modelo cabe en GPU de consumo con 12 GB o mas si se reduce el uso de memoria de activaciones.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM (por ejemplo RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090), siempre que se ejecute en FP32 o se convierta manualmente a FP16.
- Opciones de despliegue: el autor proporciona codigo de inferencia propio (clase `EnergraftEBT` del paquete `energraft`) y un script `generate.py`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros motores estandar, ya que la decodificacion por gradiente de energia no sigue el flujo autoregresivo convencional.
- Latencia y throughput estimados: no disponibles. La decodificacion requiere un paso de gradiente por token, lo que anade coste computacional frente a la decodificacion softmax convencional, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Energraft-EBT-Qwen3-1.7B-Base | 1,72B | no disponible | Apache 2.0 | EBM con decodificacion por gradiente; en/zh |
| Qwen3-1.7B-Base | 1,7B (aprox.) | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base original, decodificacion softmax estandar |
| Energy-Based Transformers (EBT, referencia de alexiglad) | no disponible | no disponible | no disponible | Inspiracion metodologica del modelo; no es un modelo comparable directo |

No se dispone de datos de benchmarks del modelo base Qwen3-1.7B-Base en la informacion proporcionada para establecer una comparacion cuantitativa directa. La comparacion con otros modelos de 1-2B parametros (por ejemplo, variantes de Llama 3.2 o Gemma 2) no esta disponible en los datos facilitados.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- La decodificacion por gradiente de energia no es compatible con los motores de inferencia estandar (vLLM, llama.cpp, TGI), lo que limita su integracion en pipelines convencionales.
- Solo soporta ingles y chino; no se documenta cobertura de otras lenguas, incluido el castellano.
- Longitud de contexto no documentada; no se puede garantizar el manejo de conversaciones o documentos largos.
- Riesgo de alucinacion inherente a los modelos de 1.7B parametros, agravado por la novedad del metodo de decodificacion y la ausencia de evaluaciones de fidelidad factual.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; el modelo base Qwen3 puede arrastrar sesgos de sus datos de entrenamiento.
- Los resultados de GSM8K y C-Eval dependen de la configuracion de evaluacion (semilla 1234, sigma=1, FP32); la reproducibilidad con otras semillas o en FP16 no esta garantizada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pruebas de robustez y seguridad desaconseja su despliegue en produccion sin evaluacion adicional.
- El repositorio ocupa 12,5 GB, en parte por los pesos en FP32, lo que encarece el almacenamiento y la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimweak/Energraft-EBT-Qwen3-1.7B-Base
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio Qwen3: https://github.com/QwenLM/Qwen3
- Energy-Based Transformers (inspiracion): https://github.com/alexiglad/EBT
- lm-evaluation-harness v0.4.9.2: https://github.com/EleutherAI/lm-evaluation-harness
