# divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx

## Resumen

Llama-3.3-70B-Instruct-abliterated-8bit-mlx es una cuantizacion en 8 bits del modelo huihui-ai/Llama-3.3-70B-Instruct-abliterated, publicada por el usuario divinetribe y empaquetada en formato MLX para su ejecucion nativa en Apple Silicon. El modelo subyacente es un derivado de Llama 3.3 70B Instruct de Meta al que se le ha aplicado la tecnica de "abliteration", que elimina o atenua la direccion de rechazo en el espacio de activaciones para reducir las negativas del modelo ante peticiones que el original rechazaria.

La relevancia practica de esta ficha es doble: por un lado, permite ejecutar un modelo denso de 70.553.706.496 parametros en un Mac con memoria unificada suficiente, algo impensable con pesos en bf16 (que rondarian los 140 GB); por otro, ofrece una variante sin el alineamiento de seguridad estandar de Meta, lo que interesa a investigadores que estudian refusal behaviour y a desarrolladores que necesitan un modelo base sin restricciones para tareas creativas o de rol.

El repositorio ocupa 75,0 GB y emplea la libreria mlx-lm. La licencia es la Llama 3.3 Community License, heredada del modelo original, con las obligaciones de atribucion y la clausula de 700 millones de usuarios activos mensuales. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.3), decodificador autoregresivo |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits (unica variante publicada en este repo) |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | llama3.3 (Llama 3.3 Community License) |
| Formato de pesos | safetensors en formato MLX (8-bit) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.3 70B Instruct, un transformer denso con atencion por grupos (GQA) y RoPE, entrenado por Meta con un pipeline que incluye preentrenamiento en gran escala, ajuste supervisado y optimizacion por preferencias humanas (RLHF/DPO). Sobre esa base, huihui-ai aplico abliteration: una intervencion sobre los pesos que identifica la direccion de activacion asociada al rechazo y la proyecta fuera de las matrices de atencion y MLP, de modo que el modelo pierde parte de su tendencia a negarse a responder. Es una modificacion post-entrenamiento, no un reentrenamiento.

La contribucion de divinetribe es la conversion a MLX con cuantizacion de 8 bits, lo que reduce el peso a 75,0 GB y permite cargar el modelo con mlx-lm en equipos Apple con memoria unificada amplia. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni detalles del proceso de cuantizacion (grupo de cuantizacion, calibracion) en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en ocho idiomas declarados (ingles, frances, italiano, portugues, hindi, espanol, thai y aleman).
- Razonamiento general y respuesta a instrucciones, heredado de Llama 3.3 70B Instruct.
- Generacion de codigo y matematicas, aunque sin benchmarks publicados que lo cuantifiquen en esta variante.
- Reduccion del comportamiento de rechazo gracias a la abliteration, lo que amplia el espacio de respuestas ante peticiones sensibles.
- Inferencia local en Apple Silicon mediante mlx-lm, sin dependencia de servicios en la nube.
- Soporte de plantilla de chat instruct (roles system/user/assistant) segun el formato de Llama 3.
- No se ha confirmado en la informacion disponible soporte de tool calling, function calling, agentes multi-paso, vision ni audio en esta variante cuantizada.

## Casos de uso

- Investigacion sobre refusal behaviour: el modelo permite comparar las respuestas de la variante abliterated frente al Llama 3.3 Instruct original para medir cuanto se reduce la tasa de rechazos y que coste tiene en calidad o seguridad.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que el modelo alineado rechazaria, ejecutada localmente en un Mac Studio o MacBook Pro con memoria suficiente.
- Prototipado offline en Apple Silicon: desarrolladores que quieren probar un 70B instructivo en local sin GPU NVIDIA ni conexion a internet, usando mlx-lm como runtime.
- Role-play y simulacion de personajes: conversaciones largas multi-turno donde la ausencia de negativas evita romper la coherencia del personaje.
- Analisis de textos sensibles: clasificacion, resumen o extraccion de informacion en corpus que contienen contenido violento, medico o legal que dispararia rechazos en modelos alineados.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia para medir la degradacion de un 70B al pasar a 8 bits en MLX frente a bf16, en tareas de razonamiento y generacion.
- Despliegue en estaciones de trabajo macOS para tareas de generacion de codigo o documentacion tecnica en un entorno controlado y sin telemetria externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 75,0 GB, por lo que se necesita al menos esa cantidad de memoria unificada mas el overhead del runtime y del contexto KV. En la practica, un equipo con 96 GB o 128 GB de memoria unificada es el minimo comodo.
- GPU recomendadas: Apple M2 Ultra o M3 Ultra con 96-192 GB de memoria unificada; M4 Max con 128 GB. No es ejecutable en GPUs NVIDIA mediante MLX, ya que mlx-lm solo corre en Apple Silicon.
- Cabe en GPU de consumo: no en el sentido tradicional; requiere un Mac de gama alta con memoria unificada muy grande. No cabe en una RTX 4090 (24 GB) ni en una RTX 5090.
- Opciones de despliegue: mlx-lm es el runtime nativo. Para otros entornos habria que recurrir a la version GGUF o bf16 del modelo base, no a este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del ancho de banda de memoria del chip (del orden de 800 GB/s en M2 Ultra) y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx | 70,55 B | no disponible | MLX 8-bit | Llama 3.3 | Hugging Face, 2.306 descargas |
| huihui-ai/Llama-3.3-70B-Instruct-abliterated | 70,55 B | no disponible | safetensors bf16 | Llama 3.3 | Hugging Face (modelo base) |
| meta-llama/Llama-3.3-70B-Instruct | 70,55 B | 128 K (segun documentacion de Meta) | safetensors bf16 | Llama 3.3 | Hugging Face |
| Variantes GGUF de Llama 3.3 70B (p. ej. Q4_K_M) | 70,55 B | 128 K | GGUF | Llama 3.3 | Hugging Face, multiples autores |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento de esta cuantizacion que permitan confrontarla con otros 70B. La diferencia clave frente al original de Meta es la abliteration; frente al base de huihui-ai, la cuantizacion 8-bit y el formato MLX.

## Limitaciones y advertencias

- La abliteration elimina parte del alineamiento de seguridad: el modelo puede producir contenido danino, ilegal o sexualmente explicito con mucha mas facilidad que el Llama 3.3 Instruct original. No debe desplegarse en productos de cara al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de 70B, agravado por la cuantizacion a 8 bits, que puede degradar tareas de razonamiento fino y matematicas.
- La cuantizacion 8-bit en MLX no ha sido evaluada con benchmarks en este repo; se desconoce la perdida exacta de calidad frente a bf16.
- Solo ejecutable en Apple Silicon mediante mlx-lm; no es portable a CUDA, ROCm ni CPU convencional sin reconvertir.
- La licencia Llama 3.3 exige mostrar "Built with Llama", incluir el aviso de atribucion y, si se superan los 700 millones de usuarios activos mensuales, solicitar licencia a Meta. Ademas, el uso debe cumplir la Acceptable Use Policy de Meta, que prohibe explicitamente ciertos usos.
- El modelo esta sujeto a la politica de uso aceptable de Llama, por lo que la abliteration no exime al usuario de responsabilidad legal.
- Idiomas declarados limitados a ocho; el rendimiento en espanol no ha sido medido en esta variante.
- El autor del repo es un particular (divinetribe), no Meta ni huihui-ai; no hay garantias de mantenimiento ni de calidad del proceso de cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx
- Modelo base (abliterated bf16): https://huggingface.co/huihui-ai/Llama-3.3-70B-Instruct-abliterated
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Documentacion de Llama: https://llama.com/docs/overview
- Politica de uso aceptable de Llama 3.3: https://www.llama.com/llama3_3/use-policy
- Descarga de Llama: https://www.llama.com/llama-downloads
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
