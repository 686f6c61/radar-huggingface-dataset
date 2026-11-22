# dimweak/Energraft-EBT-Qwen3-1.7B-Base

## Resumen

Energraft-EBT-Qwen3-1.7B-Base es un modelo de lenguaje basado en energia (energy-based model, EBM) desarrollado por el usuario dimweak a partir de Qwen3-1.7B-Base. En lugar de generar el siguiente token mediante un unico pase forward y muestreo softmax convencional, el modelo parte de un candidato aleatorio (logits gaussianos con sigma=1) y lo refina mediante gradientes descendentes sobre una funcion de energia aprendida. Esta formulacion convierte la decodificacion en un proceso iterativo de optimizacion, con dos actualizaciones por token por defecto y una opcion de una sola actualizacion.

El modelo conserva el backbone Transformer de 1,7 mil millones de parametros y 28 capas de Qwen3, al que se anade una cabeza de energia (MLP residual 2048 -> 256 -> 1) entrenada conjuntamente con el backbone. La adaptacion se realizo sobre 176 millones de posiciones de prediccion supervisada en ingles, chino, codigo y matematicas, combinando texto de corpus con prefijos generados por profesor y alumno y destilacion de distribucion sobre todo el vocabulario.

La relevancia de esta publicacion es experimental: explora una alternativa al paradigma autorregresivo estandar (native-AR) manteniendo un tamano reducido que cabe en GPU de consumo. Se distribuye bajo licencia Apache 2.0 con pesos FP32, cabeza de energia, tokenizer y codigo de inferencia propios, lo que facilita su reproduccion y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con cabeza de energia EBM; MLP residual 2048 -> 256 -> 1 |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la release incluye pesos FP32) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone FP32, cabeza de energia, tokenizer e inferencia incluidos) |

## Arquitectura y entrenamiento

El modelo mantiene el backbone Transformer de Qwen3-1.7B-Base (28 capas) y le superpone una cabeza de energia que proyecta el estado oculto a un escalar mediante un MLP residual de dos capas (2048 -> 256 -> 1). La generacion no usa softmax directo: se inicializa un candidato de logits con ruido gaussiano (sigma=1) y se refina mediante gradientes de la energia. Por defecto se aplican dos actualizaciones por token; la primera es unitaria y la segunda incorpora una relajacion residual con beta=0.05. Tambien se ofrece decodificacion de una sola actualizacion (`inference_steps=1` o `--steps 1`).

El entrenamiento cubre 176 millones de posiciones de prediccion supervisada en ingles, chino, codigo y matematicas. Combina texto de corpus con prefijos generados por el profesor y por el alumno, usando destilacion de distribucion sobre todo el vocabulario. La etapa final de adaptacion entrena correcciones de candidatos intermedios con destilacion de la primera actualizacion y regularizacion de la distribucion autorregresiva nativa. El backbone y la cabeza de energia se optimizan conjuntamente, mientras que los embeddings de tokens atados permanecen congelados. La release corresponde a la version v0.3.

## Capacidades

- Generacion de texto autorregresiva mediante refinamiento por gradiente de energia, con dos modos de decodificacion (una y dos actualizaciones por token).
- Razonamiento y conocimiento general evaluado en tareas de sentido comun (PIQA, HellaSwag, WinoGrande, ARC).
- Matematicas: resolucion de problemas de varios pasos (GSM8K).
- Codigo: el entrenamiento incluye datos de codigo, aunque no se publican benchmarks especificos de generacion de codigo.
- Multilingue limitado a ingles y chino (C-Eval evaluado en chino).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en modelos basados en energia: el modelo sirve como banco de pruebas reproducible para estudiar decodificacion por gradiente de energia frente a la autorregresiva estandar, gracias a que incluye codigo de inferencia y pesos FP32.
- Experimentos de decodificacion controlada: la posibilidad de elegir entre una y dos actualizaciones por token permite analizar el compromiso entre calidad y coste computacional en tareas de razonamiento (GSM8K) y sentido comun.
- Generacion de texto en ingles y chino: adecuado para prototipos de generacion conversacional en ambos idiomas, con las limitaciones propias de un modelo de 1,7B.
- Razonamiento matematico basico: con un 68,99 de exact match flexible en GSM8K (5-shot), puede emplearse en entornos educativos o de demostracion para resolver problemas aritmeticos de varios pasos.
- Evaluacion comparativa de tecnicas EBM: util para replicar los resultados publicados con lm-evaluation-harness v0.4.9.2 y un adaptador EBT, y contrastarlos con el modelo base Qwen3-1.7B-Base.
- Fine-tuning academico: al ser Apache 2.0 y de tamano reducido, sirve como punto de partida para experimentos de adaptacion con recursos limitados.

## Benchmarks y rendimiento

Resultados segun lm-evaluation-harness v0.4.9.2 con adaptador EBT, sobre 19.360 ejemplos, inferencia FP32, inicializacion gaussiana sigma=1 y semilla 1234. GSM8K con decodificacion greedy y maximo de 512 tokens generados.

| Benchmark | Shots | Metrica | 1 actualizacion | 2 actualizaciones (por defecto) |
|---|---:|---|---:|---:|
| PIQA | 0 | Accuracy / normalized accuracy | 70,24 / 72,20 | 70,40 / 71,93 |
| ARC-Easy | 0 | Normalized accuracy | 65,45 | 64,73 |
| ARC-Challenge | 0 | Normalized accuracy | 39,42 | 39,16 |
| HellaSwag | 0 | Normalized accuracy | 59,40 | 59,59 |
| WinoGrande | 0 | Accuracy | 62,75 | 63,54 |
| C-Eval | 5 | Accuracy | 64,19 | 64,04 |
| GSM8K | 5 | Exact match, strict | 61,49 | 58,07 |
| GSM8K | 5 | Exact match, extraccion flexible | 68,23 | 68,99 |

No se han publicado en la informacion disponible resultados comparativos directos frente a Qwen3-1.7B-Base ni frente a otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,72B parametros en FP32 los pesos ocupan aproximadamente 6,9 GB, a lo que hay que sumar el estado de activaciones y la cabeza de energia.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 12-16 GB de VRAM (por ejemplo RTX 4080/4090) deberia poder alojar los pesos FP32; para cuantizaciones no se documentan formatos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1,7B, aunque no hay cifras oficiales de consumo de memoria.
- Opciones de despliegue: el autor proporciona codigo propio (`energraft`, clase `EnergraftEBT`) y un CLI `generate.py`; requiere torch 2.8.0, transformers 4.57.1, huggingface_hub >=0.34,<1.0 y safetensors >=0.6.2. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, y la decodificacion por gradiente de energia dificulta su uso en estos motores estandar.
- Latencia y throughput: no disponibles. Cabe esperar un coste mayor que la decodificacion autorregresiva convencional al requerir dos pases de refinamiento por token por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Energraft-EBT-Qwen3-1.7B-Base | 1,72B | no disponible | Apache 2.0 | EBM con refinamiento por gradiente (2 actualizaciones/token) | Hugging Face, codigo propio |
| Qwen3-1.7B-Base | 1,7B | no disponible en esta ficha | Apache 2.0 | Transformer autorregresivo estandar | Hugging Face, ecosistema amplio |
| EBT (Energy-Based Transformers, referencia de alexiglad) | no disponible | no disponible | no disponible | EBM de referencia que inspiro el modelo | GitHub |

La comparacion cuantitativa de rendimiento con Qwen3-1.7B-Base no esta disponible en la informacion proporcionada; el autor no publica una tabla cruzada con el modelo base.

## Limitaciones y advertencias

- Modelo experimental (v0.3): la decodificacion por gradiente de energia no es un paradigma consolidado en produccion y puede presentar comportamientos distintos a los de un LLM autorregresivo convencional.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no especificada; no se debe asumir la ventana de Qwen3 sin verificacion.
- Riesgo de alucinacion inherente a un modelo de 1,7B; los benchmarks de sentido comun (ARC-Challenge 39,16-39,42) indican capacidad limitada en razonamiento complejo.
- Mayor coste de inferencia por token al requerir por defecto dos actualizaciones de refinamiento; no hay datos de latencia publicados.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el codigo de inferencia es propio y requiere versiones especificas de dependencias (torch 2.8.0, transformers 4.57.1).
- El repo ocupa 18,2 GB por los pesos FP32, lo que complica su despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimweak/Energraft-EBT-Qwen3-1.7B-Base
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio de referencia Energy-Based Transformers: https://github.com/alexiglad/EBT
