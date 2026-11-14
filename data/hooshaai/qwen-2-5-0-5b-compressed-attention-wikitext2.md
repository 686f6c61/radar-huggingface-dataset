# Hooshaai/qwen-2.5-0.5b-compressed-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-compressed-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de un Qwen2.5-0.5B (501.827.200 parametros reales segun safetensors) al que se le han sustituido 18 de sus 24 bloques de atencion por el operador `compressed_attention` de la libreria NeuralOps, que implementa atencion multi-cabeza comprimida mediante descomposicion en valores singulares truncada (SVD). El modelo mantiene las 6 capas restantes con la atencion GQA softmax original de Qwen2 para conservar capacidad de recuperacion contextual.

El objetivo del modelo no es ser un asistente conversacional de proposito general, sino servir como banco de pruebas reproducible para investigacion en atencion subcuadratica y destilacion de conocimiento en modelos compactos. Tras el transplante quirurgico, la perplejidad en WikiText-2 se disparo a 340.984,77; tras un protocolo de destilacion en dos etapas se redujo a 95,76, todavia lejos del profesor original (15,38).

Es relevante ahora porque documenta de forma transparente el coste real de sustituir atencion softmax por aproximaciones SVD en modelos pequenos, con telemetria completa de entrenamiento, topologia hibrida y formato de pesos. La licencia MIT facilita su reutilizacion con fines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atencion hibrida: 18/24 capas `compressed_attention` (SVD) + 6/24 capas GQA softmax nativa |
| Parametros totales | 501.827.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no confirma el contexto efectivo tras la cirugia) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 completo) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors, FP16 completo (957,20 MB) mas adaptador |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Dimension del modelo (D) | 896 |
| Cabezas de atencion (Q / KV) | 14 / 2 (GQA), expandidas a 14 KV en capas transplantadas |
| Dimension por cabeza | 64 |
| RoPE theta | 1.000.000 |
| Libreria | neuralops |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: un transformer decoder denso de 24 capas, dimension oculta 896, 14 cabezas de consulta y 2 cabezas KV con GQA, dimension por cabeza 64 y RoPE con theta 1.000.000. La intervencion aplica un patron `hybrid_3_1`: las capas en indices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `CompressedAttentionLayer` envuelto en `QwenAttentionAdapter`, mientras que [3, 7, 11, 15, 19, 23] conservan la atencion GQA softmax original como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` preentrenados del profesor, con expansion de cabezas KV de 2 a 14 y una unica `o_proj` sin duplicacion, para evitar el colapso de proyecciones no inicializadas. El operador soporta causalidad, GQA y RoPE, y despacha kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consistio en destilacion de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con cacheado offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 76 pasos) congela embeddings, MLP y `lm_head` y entrena solo modulos de atencion y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, grad clipping 1.0), AMP FP16 con `GradScaler` y pesos maestros FP32, minimizando MSE por capa mas 0.25 veces (1 - coseno) entre estados ocultos del alumno y del profesor. La etapa 2 (70% restante) realiza destilacion end-to-end de representaciones. La model card describe el proceso como reproducible y con serializacion determinista de pesos.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Razonamiento basico y respuesta conversacional de corto alcance, limitados por el tamano de 0,5B y por la degradacion introducida por la destilacion.
- Atencion causal con soporte de GQA y RoPE en las capas transplantadas, con despacho de kernels CUDA, Triton o PyTorch.
- Capacidad de servir como sujeto de experimentacion para estudiar atencion subcuadratica y destilacion de conocimiento.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico especifico.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento explicito (`thinking mode`).
- Multilingue: no; solo ingles segun la model card.

## Casos de uso

- Investigacion en atencion subcuadratica: el checkpoint permite medir el impacto real de sustituir atencion softmax por SVD truncada en un transformer pequeno, con linea base (profesor 15,38) y resultado post-destilacion (95,76) perfectamente comparables.
- Reproduccion de experimentos de destilacion: la telemetria de las dos etapas (76 pasos con backbone congelado, luego destilacion end-to-end) permite replicar el protocolo en otras arquitecturas o tamanos con hardware de consumo.
- Benchmark de operadores NeuralOps: sirve para validar el despacho de kernels CUDA/Triton/PyTorch del operador `CompressedAttentionLayer` en condiciones reales de inferencia causal.
- Estudio de topologias hibridas: el patron `hybrid_3_1` con anclas GQA cada cuatro capas es un objeto de estudio directo para evaluar si las capas de ancla preservan la recuperacion de contexto largo.
- Docencia y formacion: modelo ligero (menos de 1 GB en FP16) apto para demostrar en aula como se mide perplejidad, se aplica cirugia de atencion y se ejecuta destilacion de conocimiento.
- Prototipado de bajo coste en ingles: generacion de texto simple en entornos sin GPU dedicada, siempre que se acepte la calidad degradada respecto al modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validacion de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, `batch_size=8` y `grad_accum=4` sobre una RTX 3090 de 24 GB.

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (Qwen2.5-0.5B, GQA softmax) | 15,38 |
| Perplejidad del alumno zero-shot tras la cirugia (pre-KD) | 340.984,77 |
| Perplejidad del alumno tras destilacion (post-KD) | 95,76 |
| Delta absoluto de perplejidad | -340.889,02 |
| Reduccion relativa de perplejidad | 99,97% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (957,20 MB) mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6-0,7 GB de pesos; en 4 bits, alrededor de 0,35 GB. No se han publicado artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; el entrenamiento de destilacion se realizo en una RTX 3090 de 24 GB.
- Cabe holgadamente en GPU consumer; tambien es viable en CPU para inferencia de baja latencia no critica.
- Opciones de despliegue: la libreria de referencia es `neuralops` (requerida para cargar el operador `compressed_attention`); no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, y la atencion custom probablemente requiera adaptadores especificos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-compressed-attention-wikitext2 (este) | 501,8 M | No disponible | 95,76 (post-KD, declarada) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M aprox. | 32.768 tokens | 15,38 (declarada en la model card) | Apache 2.0 (modelo base) | Hugging Face |
| Qwen2.5-1.5B | 1,5 B aprox. | 32.768 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 360 M aprox. | 8.192 tokens aprox. | No disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion directa mas relevante es contra su propio profesor: el checkpoint comprimido multiplica por mas de seis la perplejidad (95,76 frente a 15,38) a cambio de una atencion parcialmente subcuadratica en 18 de 24 capas. Frente a alternativas de tamano similar, la diferencia clave es que este modelo es un artefacto de investigacion, no un modelo listo para produccion.

## Limitaciones y advertencias

- Calidad degradada de forma sustancial: la perplejidad post-destilacion (95,76) es mas de seis veces la del profesor (15,38); la generacion de texto sera notablemente peor que la de Qwen2.5-0.5B original.
- Solo ingles: la model card declara exclusivamente `en`; no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y de texto incoherente, especialmente en secuencias largas o fuera del dominio de WikiText-2.
- El checkpoint se entreno exclusivamente sobre WikiText-2; el sesgo de dominio es severo y no se han evaluado sesgos sociales o demograficos.
- Requiere la libreria `neuralops` y su operador `compressed_attention`; no es un checkpoint plug-and-play en stacks estandar como transformers sin adaptador.
- No se han publicado mediciones del contexto efectivo tras la cirugia; no asumir los 32.768 tokens del modelo base.
- Benchmark declarado por el autor sin verificacion independiente (`verified: false` en el model-index).
- Licencia MIT para el checkpoint, pero conviene revisar las condiciones del modelo base Qwen2.5-0.5B (Apache 2.0) y del codigo NeuralOps al redistribuir.
- No apto como componente de produccion orientado a usuarios finales sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-compressed-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion del operador `compressed_attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/compressed_attention.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
