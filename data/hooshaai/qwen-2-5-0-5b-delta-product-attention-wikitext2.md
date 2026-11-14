# Hooshaai/qwen-2.5-0.5b-delta-product-attention-wikitext2

## Resumen

El modelo `Hooshaai/qwen-2.5-0.5b-delta-product-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha sustituido el mecanismo de atencion softmax de 18 de las 24 capas del decoder por el operador `DeltaProductAttention` de la libreria NeuralOps. El autor, Hooshaai, publica este artefacto dentro de la iniciativa "Attention Surgery Zoo", orientada a evaluar la viabilidad de reemplazar atencion cuadratica por alternativas subcuadraticas mediante transplante quirurgico de capas y destilacion posterior del conocimiento del modelo original.

Se trata por tanto de un modelo de 533,5 millones de parametros (494M en la base Qwen2.5-0.5B, ampliados por la expansion de cabezas KV de 2 a 14 en las capas transplantadas) con arquitectura hibrida: 18 capas usan `delta_product_attention` (basada en reflexiones ortogonales de Householder acumuladas sobre la secuencia) y 6 capas conservan la atencion GQA original de Qwen2.5 como anclas de recuperacion contextual. El entrenamiento consiste en una destilacion de representaciones ocultas en dos etapas sobre WikiText-2.

La relevancia del checkpoint es fundamentalmente metodologica y de investigacion: documenta un experimento reproducible de cirugia de atencion y publica la telemetria del proceso, aunque los resultados de perplejidad obtenidos (`inf` tanto antes como despues de la destilacion) indican que el transplante no ha convergido a un modelo funcional para generacion de texto. No debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder hibrido: 18/24 capas con `DeltaProductAttention` (Householder product / PaTH, familia gated) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 533.525.884 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no confirma el contexto efectivo tras la cirugia) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo, ~1017,66 MB, mas un adaptador) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (24 capas, dimension oculta D=896, 14 cabezas de consulta y 2 de clave/valor, dimension por cabeza 64, RoPE con theta=1.000.000). La cirugia sigue un patron determinista `hybrid_3_1`: las capas en indices [0,1,2,4,5,6,8,9,10,12,13,14,16,17,18,20,21,22] se sustituyen por `DeltaProductAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3,7,11,15,19,23] mantienen la atencion GQA original como anclas. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` preentrenados del profesor, con expansion de cabezas KV de 2 a 14 para adaptarse al operador. El operador `DeltaProductAttention` mantiene el estado mediante reflexiones ortogonales de Householder acumuladas, lo que garantiza isometria estricta y preservacion de norma a lo largo de la secuencia; el kernel tiene despacho a tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilacion de representaciones ocultas en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`, seq_len=512). La etapa 1 (30% del presupuesto, 2 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo modulos de atencion y layer norms con AdamW (lr=2.0e-4), minimizando MSE por capa mas 0.25·(1−coseno) entre estados ocultos del estudiante y del profesor. La etapa 2 (70% del presupuesto, 5 pasos) relaja la restriccion y ajusta todas las corrientes residuales con lr=6.0e-5 y peso coseno de 0.50, omitiendo `lm_head` para maximizar throughput. El proceso completo se ejecuto en una RTX 3090 de 24 GB en 201 segundos, con 20.973 MB de VRAM pico y 0 MB de VRAM del profesor gracias a la cache offline de representaciones.

## Capacidades

- Generacion de texto autoregresiva causal (segun la model card, `pipeline_tag: text-generation` y `Causal Autoregressive Support: Yes`).
- Conversacion multi-turno (etiqueta `conversational` en los tags del repositorio).
- Razonamiento y recuperacion de contexto a traves de las 6 capas GQA ancla que preservan los cabezales de induccion del modelo base.
- Procesamiento de secuencias con complejidad subcuadratica en las 18 capas transplantadas, lo que en principio reduce el coste de atencion en contextos largos.
- Soporte de tool calling / function calling: no documentado en la model card; heredado potencialmente del modelo base Qwen2.5-0.5B, pero no verificado tras la cirugia.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para estudiar el impacto del transplante de `DeltaProductAttention` en un transformer pequeno, comparando perplejidad antes y despues de la destilacion.
- Reproduccion de experimentos de cirugia de atencion: el codigo de NeuralOps y la telemetria publicada (7 pasos, 201 s, 20.973 MB) permiten replicar el pipeline completo en una unica GPU de consumo.
- Estudio de destilacion de representaciones ocultas: las dos etapas documentadas (alineamiento de subespacio con backbone congelado y destilacion end-to-end) son un caso practico para evaluar tecnicas de KD con cache offline de representaciones del profesor.
- Benchmarking de kernels CUDA/Triton/PyTorch: el despacho a tres niveles del operador permite medir rendimiento de cada backend en una RTX 3090.
- Analisis de estabilidad numerica en operadores ortogonales: el resultado de perplejidad infinita convierte al checkpoint en un caso de estudio sobre los modos de fallo de las reflexiones de Householder acumuladas en secuencias largas.
- Docencia y divulgacion: ejemplo didactico de como se modifica un modelo preentrenado a nivel de capa y que implicaciones tiene sobre la calidad final.

## Benchmarks y rendimiento

Los unicos datos publicados son de perplejidad en WikiText-2 (`wikitext-2-raw-v1`, split de validacion, seq_len=512, batch_size=8, grad_accum=4) medidos en una RTX 3090 de 24 GB:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del estudiante tras cirugia (zero-shot) | inf | Inmediatamente despues del transplante 18/24 |
| Perplejidad del estudiante tras destilacion | inf | Tras las dos etapas de KD |
| Delta absoluto de perplejidad | nan | Cambio logrado por la destilacion |
| Reduccion relativa de perplejidad | N/A | Recuperacion porcentual desde el pico post-cirugia |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El resultado de perplejidad infinita indica que el modelo no genera texto coherente en el estado actual del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP16 para los 1,2 GB de pesos mas overhead; en cuantizacion de 8 bits o 4 bits no hay pesos publicados, pero cabria esperar en torno a 0,6-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el propio autor uso una RTX 3090 de 24 GB para el entrenamiento (20.973 MB pico).
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: la libreria `neuralops` es necesaria para cargar el operador `DeltaProductAttention`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La integracion con `transformers` no esta garantizada al no haberse publicado pesos en formato GGUF ni configuracion estandar.
- Latencia y throughput estimados: no disponibles. El despacho a tres niveles (CUDA / Triton / PyTorch) sugiere que el rendimiento dependera fuertemente del backend activo, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-delta-product-attention-wikitext2` | 533,5 M | no disponible | inf (post-KD) | MIT | Hugging Face, requiere `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 | 15,38 (segun la model card) | Apache 2.0 | Hugging Face, `transformers` |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494 M | 32.768 | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` |
| `meta-llama/Llama-3.2-1B` | 1,24 B | 131.072 | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face, `transformers` |

La comparativa relevante es contra el propio modelo base Qwen2.5-0.5B: el checkpoint aqui descrito no supera la perplejidad del profesor y anade una dependencia de la libreria `neuralops`, por lo que su interes es de investigacion, no de rendimiento.

## Limitaciones y advertencias

- Perplejidad infinita en WikiText-2 tras la destilacion: el modelo no produce texto coherente en el estado actual del checkpoint; no debe usarse en produccion.
- El transplante de 18/24 capas destruye la coherencia del modelo base, y las dos etapas de destilacion (7 pasos en total) no logran recuperarla.
- Sesgos conocidos: no documentados; se heredarian parcialmente los del modelo base Qwen2.5-0.5B, pero el colapso de la generacion hace que no sean evaluables.
- Riesgo de alucinacion: no aplica en la practica porque el modelo no genera texto utilizable.
- Limitaciones de idioma: solo ingles (`language: en`); el modelo base soporta mas idiomas, pero no se ha validado tras la cirugia.
- Restricciones de licencia: MIT permite uso comercial, pero la dependencia de `neuralops` (licencia MIT segun el enlace del autor) y del modelo base Qwen2.5-0.5B (Apache 2.0) debe respetarse en cualquier redistribucion.
- Requiere la libreria `neuralops` para cargar el operador `delta_product_attention`; no es compatible con `transformers` estandar ni con runtimes de inferencia convencionales.
- El checkpoint incluye un adaptador ademas de los pesos FP16 completos (~1017,66 MB), lo que anade complejidad al despliegue.
- La model card no documenta el contexto efectivo tras la cirugia ni el comportamiento con secuencias largas, que es precisamente donde el operador subcuadratico deberia aportar ventajas.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-delta-product-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Libreria NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
