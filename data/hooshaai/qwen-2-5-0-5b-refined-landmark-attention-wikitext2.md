# Hooshaai/qwen-2.5-0.5b-refined-landmark-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-refined-landmark-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente 18 de las 24 capas de atencion del decoder por el operador `RefinedLandmarkAttention` (LEKAv3, atencion lineal con landmarks puntuados por valor) de la libreria NeuralOps. Las 6 capas restantes conservan la atencion GQA softmax original de Qwen2, configurando una topologia hibrida 3:1 que busca equilibrar eficiencia subcuadratica con la capacidad de recuperacion global del modelo base. Tras el transplante, el autor aplica una destilacion de conocimiento en dos etapas sobre WikiText-2 para recuperar el comportamiento del profesor.

El modelo parte de los 494 millones de parametros de Qwen2.5-0.5B (24 capas, dimension oculta 896, 14 cabezas de consulta y 2 de clave/valor con GQA, RoPE con theta 1.000.000) y mantiene la licencia MIT. El resultado es un artefacto de investigacion orientado a estudiar el impacto de operadores de atencion alternativos en modelos pequenos, no un modelo listo para produccion: la perplejidad post-destilacion en WikiText-2 es de 296,01 frente a los 15,38 del profesor, lo que refleja una degradacion severa pese a la reduccion del 99,93 % respecto al estado inmediatamente posterior a la cirugia (398.558,30).

Su relevancia actual es metodologica: documenta de forma reproducible el proceso de "attention surgery" con herencia de pesos `q_proj`/`k_proj`/`v_proj`/`o_proj`, expansion de cabezas KV de 2 a 14, y un pipeline de destilacion con cache offline de representaciones que entrena en una unica RTX 3090 sin mantener el profesor en VRAM. Es util para investigadores que exploran atencion lineal, hibridos y destilacion de representaciones ocultas en modelos compactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 18/24 capas con `RefinedLandmarkAttention` (LEKAv3) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 494 M (modelo base Qwen2.5-0.5B); pesos completos en FP16 de 929,69 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero esta ficha no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos FP16 completos y un adaptador; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors en FP16 completo (929,69 MB) + adaptador; tamano total del repo 1,1 GB |

## Arquitectura y entrenamiento

El modelo es un decoder-only de Qwen2.5-0.5B (24 bloques, D=896, 14 cabezas de consulta, 2 de clave/valor, dimension por cabeza 64, RoPE con theta 1.000.000) modificado mediante "attention surgery". Las capas con indices `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` usan `RefinedLandmarkAttention` envuelto en `QwenAttentionAdapter`; las capas `[3, 7, 11, 15, 19, 23]` mantienen la atencion GQA softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas. El operador LEKAv3 soporta enmascarado causal autoregresivo y despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilacion de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con longitud de secuencia 512, `batch_size=8` y `grad_accum=4`, ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB usando la arquitectura de cache offline de representaciones de NeuralOps (0 MB de VRAM del profesor). La etapa 1 (30 % del presupuesto, 110 pasos) congela el backbone y entrena solo modulos de atencion y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0), pesos maestros FP32 con AMP FP16 y `GradScaler`, minimizando MSE por capa mas `0.25 * (1 - cos(h_s, h_t))` sobre estados ocultos. La informacion disponible no detalla la etapa 2 ni el numero total de tokens vistos.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Conversacion multi-turno basica (tag `conversational`), limitada por el tamano del modelo y por la degradacion introducida por la cirugia.
- Razonamiento y codigo de nivel basico, segun las capacidades del Qwen2.5-0.5B original, aunque no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no disponible como capacidad verificada en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponible.
- Capacidad especial: atencion lineal subcuadratica en 18 de 24 capas, pensada para reducir coste computacional en secuencias largas.

## Casos de uso

- Investigacion en atencion lineal e hibrida: sirve como banco de pruebas reproducible para medir el efecto de sustituir atencion softmax por `RefinedLandmarkAttention` en un decoder de 0,5 B, comparando perplejidad antes y despues de la destilacion.
- Estudio de destilacion de representaciones ocultas: el pipeline de dos etapas con cache offline de representaciones y 0 MB de VRAM del profesor es replicable en una sola GPU consumer, util para docencia e investigacion de bajo presupuesto.
- Experimentos de "attention surgery": la herencia de pesos `q_proj`/`k_proj`/`v_proj`/`o_proj` y la expansion GQA 2 a 14 cabezas sirven de referencia para tecnicas de transplante de operadores.
- Prototipado de eficiencia en inferencia: permite medir latencia y memoria de un hibrido 3:1 frente al Qwen2.5-0.5B original en tareas de generacion larga, siempre como experimento controlado.
- Generacion de texto en ingles de baja exigencia: con perplejidad 296,01 en WikiText-2, solo es adecuado para demos internas o pruebas de humo, no para atencion al cliente ni produccion.
- Evaluacion comparativa de operadores NeuralOps: el repositorio forma parte de un "attention zoo" y se puede usar para contrastar `refined_landmark_attention` con otros operadores de la misma libreria bajo el mismo protocolo de destilacion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | GQA softmax causal, referencia |
| Perplejidad del estudiante zero-shot tras la cirugia | 398.558,30 | Inmediatamente despues del transplante 18/24 |
| Perplejidad del estudiante post-destilacion | 296,01 | Tras destilacion de representaciones en 2 etapas |
| Delta absoluto de perplejidad | -398.262,29 | Cambio logrado por la destilacion |
| Reduccion relativa de perplejidad | 99,93 % | Recuperacion respecto al pico post-cirugia |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para los pesos (929,69 MB) mas overhead de activaciones y cache KV; el repositorio completo ocupa 1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; el autor entreno en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.), dado el tamano de 0,5 B.
- Opciones de despliegue: la libreria declarada es `neuralops`, necesaria para cargar el operador `RefinedLandmarkAttention`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (hibrido 3:1, post-KD) | 494 M | no disponible | 296,01 (val, seq 512) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 tokens (segun modelo base) | 15,38 (val, seq 512) | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1,5 B | 32.768 tokens (segun modelo base) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1,2 B | 128.000 tokens (segun modelo base) | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face |

La comparativa directa solo es valida frente al profesor, ya que es el unico modelo con perplejidad medida bajo el mismo protocolo en la informacion disponible.

## Limitaciones y advertencias

- Degradacion severa de calidad: perplejidad de 296,01 frente a 15,38 del profesor, aproximadamente 19 veces peor; no es apto para produccion.
- Solo ingles declarado; no hay soporte multilingue verificado.
- Riesgo elevado de alucinacion y de texto incoherente por la perdida de capacidad tras la cirugia y la destilacion parcial.
- Limitaciones de contexto: no se documenta la longitud de contexto efectiva del checkpoint hibrido; el operador lineal puede comportarse de forma distinta al modelo base en secuencias largas.
- Dependencia de la libreria `neuralops` para cargar el operador `RefinedLandmarkAttention`; no se garantiza compatibilidad con ecosistemas estandar (transformers, vLLM, llama.cpp).
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese escenario sin una validacion adicional.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El checkpoint se entreno exclusivamente sobre WikiText-2, lo que puede inducir sobreajuste al dominio y sesgos del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-refined-landmark-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/refined_landmark_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
