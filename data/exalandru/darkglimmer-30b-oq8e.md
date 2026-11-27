# exalandru/DarkGlimmer-30B-oQ8e

## Resumen

DarkGlimmer-30B-oQ8e es una cuantizacion mixta en formato MLX del modelo DarkGlimmer-30B, publicado por el usuario exalandru. El checkpoint parte de la version GGUF de UltimateIntent/DarkGlimmer-30B-GGUF y se ha reprocesado con oQ (oMLX v0.8.4), la herramienta de cuantizacion de precision mixta del proyecto omLX, para producir pesos optimizados para inferencia en Apple Silicon. El resultado es un checkpoint de 29.776 millones de parametros con un promedio efectivo de 8.984 bits por peso, lo que lo situa entre una cuantizacion de 8 bits y los pesos originales en bf16.

El modelo conserva dos componentes diferenciados: un modelo de lenguaje de 27.855 millones de parametros y un modulo de vision de 1.922 millones, lo que indica que DarkGlimmer-30B es un modelo multimodal con capacidad de procesamiento de imagenes. La cuantizacion aplica 8 bits afines con grupo de 64 a la practica totalidad de los pesos (93,541 %) y mantiene en BF16 el 6,459 % restante, presumiblemente capas sensibles a la cuantizacion como embeddings, cabezas de salida o modulos de vision.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint quantizado para MLX, un ecosistema con menos cobertura que GGUF o safetensors estandar; por otro lado, sirve de referencia practica sobre el coste real de almacenamiento y los compromisos de precision de la cuantizacion mixta en modelos de ~30B. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque la informacion publicada sobre el modelo base es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DarkGlimmer-30B; incluye modulo de vision) |
| Parametros totales | 29.776.626.688 (29,777B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX oQ mixta: affine 8-bit grupo 64 (93,541 % de los pesos) + BF16 (6,459 %); promedio efectivo 8,984 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx; repo de 33,5 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base DarkGlimmer-30B en la documentacion proporcionada. Los datos del checkpoint permiten deducir que se trata de un modelo multimodal con un tronco de lenguaje de 27.855 millones de parametros y un codificador o proyector de vision de 1.922 millones. No se especifica si el tronco es un transformer denso, un MoE o una arquitectura hibrida, ni se detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

La innovacion tecnica documentada es el proceso de cuantizacion: oQ (oMLX v0.8.4) asigna precision de forma selectiva, manteniendo en BF16 el 6,459 % de los pesos (1.923 millones de parametros, 3.582 GiB) y cuantizando el resto a 8 bits afines con tamano de grupo 64. Este esquema reduce el checkpoint a 31.144 GiB de almacenamiento efectivo frente a los aproximadamente 55-60 GB que ocuparia en BF16 completo, con una perdida de precision acotada en las capas mas sensibles. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones de inferencia adicionales.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base de 27,855B de parametros de lenguaje.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 1,922B de parametros, lo que habilita tareas de comprension de imagenes (descripcion, VQA, extraccion de informacion) si el modelo base las soporta.
- Conversacion multi-turno: no se especifica la longitud de contexto, por lo que la capacidad real de mantener contexto largo no esta confirmada.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Modo thinking o razonamiento extendido: no disponible en la informacion publicada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantizacion a ~9 bits efectivos permiten ejecutar un modelo de ~30B en Macs con memoria unificada de 32-64 GB, algo inviable con pesos BF16 completos. Es el caso de uso principal de este checkpoint.
- Prototipado multimodal en estaciones de trabajo Mac: el modulo de vision integrado permite experimentar con tareas de imagen-texto sin depender de GPUs NVIDIA ni de servicios en la nube.
- Evaluacion comparativa de cuantizaciones: al existir la version GGUF del mismo modelo base, este checkpoint sirve para medir la degradacion de calidad de oQ 8-bit frente a otras cuantizaciones (Q4_K_M, Q8_0, etc.) sobre las mismas tareas.
- Desarrollo de asistentes conversacionales offline: la licencia Apache 2.0 y la ejecucion local permiten integrar el modelo en aplicaciones de escritorio o internas con requisitos de privacidad, siempre que se valide previamente la calidad del modelo base.
- Investigacion sobre cuantizacion mixta: la tabla de distribucion de bits publicada (93,541 % a 8 bits, 6,459 % en BF16) permite reproducir el esquema y analizar que capas requieren mayor precision en modelos de ~30B.
- Fine-tuning o adaptadores sobre MLX: el checkpoint puede servir de punto de partida para LoRA o adaptadores en el ecosistema MLX, reduciendo los requisitos de memoria frente al modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 31,144 GiB en disco; para inferencia hay que sumar la cache KV y los buffers de activaciones, por lo que se recomienda un minimo de 40-48 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No es un formato pensado para GPUs NVIDIA o AMD.
- Cabe en consumer GPU: no en GPUs de consumo con 24 GB (RTX 4090); si en Macs con 48 GB o 64 GB de memoria unificada.
- Opciones de despliegue: mlx-lm y el ecosistema MLX (incluido oMLX) son las vias naturales. Para llama.cpp, Ollama o vLLM habria que usar la version GGUF del modelo base, no este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DarkGlimmer-30B-oQ8e | 29,777B | no disponible | MLX safetensors, ~9 bits efectivos | Apache 2.0 | Objeto de esta ficha; multimodal |
| UltimateIntent/DarkGlimmer-30B-GGUF | 29,777B (mismo base) | no disponible | GGUF | Apache 2.0 (segun modelo base) | Version de referencia para llama.cpp/Ollama; precision segun variante GGUF |
| Modelos densos de ~30B en MLX (p. ej. Qwen o Gemma en versiones MLX) | ~30B | variable | MLX | variable | Alternativas del ecosistema MLX; no se dispone de datos comparativos de rendimiento con DarkGlimmer |

No se dispone de informacion suficiente sobre el modelo base para establecer una comparativa de rendimiento fiable con alternativas concretas.

## Limitaciones y advertencias

- El modelo base DarkGlimmer-30B carece de documentacion publica sobre entrenamiento, datos y evaluacion; la calidad final es dificil de verificar sin benchmarks.
- La cuantizacion mixta a ~9 bits efectivos introduce una degradacion de precision respecto a BF16, especialmente en tareas sensibles como matematicas o codigo; no se han publicado mediciones de esa perdida.
- Riesgo de alucinacion inherente a los modelos generativos; no hay datos especificos sobre la tasa en este checkpoint.
- No se declaran idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- La longitud de contexto no esta documentada; no se debe asumir una ventana larga en produccion.
- El checkpoint esta atado al ecosistema MLX: no es directamente utilizable en vLLM, TGI, llama.cpp u Ollama.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y procedencia del modelo base (UltimateIntent/DarkGlimmer-30B-GGUF) antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exalandru/DarkGlimmer-30B-oQ8e
- Modelo base (GGUF): https://huggingface.co/UltimateIntent/DarkGlimmer-30B-GGUF
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
