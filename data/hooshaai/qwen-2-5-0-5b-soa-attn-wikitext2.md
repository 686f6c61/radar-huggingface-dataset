# Hooshaai/qwen-2.5-0.5b-soa-attn-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-soa-attn-wikitext2`, publicado por el usuario Hooshaai, es un checkpoint experimental derivado de Qwen2.5-0.5B en el que se han sustituido quirurgicamente los bloques de atencion del decoder por el modulo `soa_attn` (Shared Orthogonal Attention) del registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo no es ofrecer un modelo conversacional de proposito general, sino servir como banco de pruebas reproducible para estudiar el impacto de arquitecturas de atencion subcuadraticas sobre un transformer preentrenado pequeno, midiendo la degradacion y posterior recuperacion de la perplejidad.

La sustitucion sigue un patron hibrido 3:1: 18 de las 24 capas del decoder usan `soa_attn` y 6 capas conservan la atencion cuadratica original como anclas. Tras la cirugia, el modelo colapsa (perplejidad de 231381,18 en WikiText-2) y se recupera mediante un proceso de destilacion de conocimiento en dos etapas hasta alcanzar una perplejidad de 108,86 en el split de validacion de WikiText-2.

Es relevante ahora porque ejemplifica una linea de investigacion activa: la sustitucion modular de operadores de atencion en modelos ya entrenados sin reentrenar desde cero, con telemetria detallada de coste computacional. No obstante, sus capacidades generativas son muy limitadas y su uso previsto es la investigacion, no la produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `soa_attn` y 6/24 capas con atencion cuadratica completa en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 79,27 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (`head_dim=64`), es decir, atencion con GQA. Sobre esa base se aplica el adaptador `QwenAttentionAdapter`, que sustituye las proyecciones Q, K y V densas por el modulo `SOAAttention`: una atencion ortogonal compartida con cuellos de botella latentes por proyeccion, que factoriza las matrices densas en pares de bajo rango inicializados mediante SVD truncada a partir de los pesos preentrenados. El modulo soporta atencion causal, bidireccional, cross-attention y GQA nativo, pero no RoPE nativo (marcado como `N/A`). Se aplica una expansion 7x de las cabezas KV donde es necesario y se mantiene el contrato de un unico `o_proj`.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineacion con backbone congelado) ejecuta 137 pasos en 54,4 s con `lm_head` desactivado y una perdida combinada de MSE y coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (destilacion de representacion multicapa) ejecuta 314 pasos en 125,7 s con el mismo esquema y peso 0,50. En total, 451 pasos de optimizacion en 180,4 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 15788 MB en FP16 con parametros maestros en FP32. La perplejidad causal pasa de 231381,18 (post-cirugia, etapa 0) a 108,86 tras la destilacion.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, limitada al dominio y la distribucion de WikiText-2.
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo `soa_attn`.
- Soporte nativo de GQA con expansion 7x de cabezas KV.
- Capacidad de servir como banco de pruebas para comparar operadores de atencion (subcuadraticos frente a cuadraticos) bajo un mismo backbone.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta soporte multilingue (solo ingles).
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el modelo permite medir la perplejidad de un operador de atencion alternativo sobre un backbone fijo y comparar con la linea base cuadratica, gracias a la telemetria de las dos etapas de destilacion.
- Reproduccion de experimentos de cirugia modular: el script `apply_qwen_attention_surgery` y el checkpoint de pesos de atencion permiten replicar el patron `hybrid_3_1` y variar el ratio de capas sustituidas.
- Estudio de destilacion de conocimiento: las metricas por etapa (pasos, tiempo, pico de VRAM, delta de perplejidad) sirven para calibrar tecnicas de recuperacion tras perturbaciones de pesos.
- Validacion de frameworks: util como caso de prueba de integracion para NeuralOps y su API `load_surgeried_model`, verificando que la carga modular de pesos quirurgicos funciona de extremo a extremo.
- Docencia y divulgacion: ejemplo didactico de como se degrada y recupera un transformer pequeno al cambiar su mecanismo de atencion, con numeros concretos y reproducibles.
- Benchmarking de hardware: el pico de 15788 MB de VRAM en FP16 durante el entrenamiento permite estimar requisitos para experimentos similares en GPUs de gama media-alta.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Perplejidad (post-destilacion) | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | 108,86 |
| Perplejidad (post-cirugia, etapa 0) | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | 231381,18 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint de atencion ocupa 79,27 MB y el modelo base Qwen2.5-0.5B es de 0,5 mil millones de parametros, por lo que en FP16 deberia caber holgadamente en GPUs consumer (estimacion no confirmada por el autor).
- VRAM de entrenamiento documentada: pico de 15788 MB en FP16 con parametros maestros en FP32.
- GPU recomendadas: no disponible; por tamano, una RTX 4090 o superior seria suficiente para entrenamiento, y GPUs consumer de gama media para inferencia (estimacion no confirmada).
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque no se documenta oficialmente.
- Opciones de despliegue: `neuralops.hub.load_surgeried_model` o carga manual con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-soa-attn-wikitext2 (este) | 0,5 B | no disponible | 108,86 (validation) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas de atencion subcuadratica sobre Qwen2.5-0.5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros checkpoints del mismo `ATTENTION_REGISTRY` en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no esta pensado para uso en produccion ni para tareas conversacionales reales.
- Entrenado exclusivamente sobre WikiText-2 en ingles; el dominio y el idioma estan muy restringidos.
- Perplejidad de 108,86, muy superior a la de un modelo bien entrenado del mismo tamano; la calidad generativa es baja.
- Riesgo elevado de alucinacion y de generar texto incoherente fuera del dominio de WikiText-2.
- No se documentan evaluaciones de sesgo; al derivar de Qwen2.5-0.5B, hereda los sesgos del modelo base.
- La model card menciona el repositorio `tahamajs/qwen-2.5-0.5b-soa-attn-wikitext2` en los ejemplos de codigo, mientras que el ID publicado es `Hooshaai/qwen-2.5-0.5b-soa-attn-wikitext2`; conviene verificar la ruta antes de usarlo.
- Requiere el framework NeuralOps y el script `apply_qwen_attention_surgery` para cargar los pesos de atencion; no es un checkpoint `transformers` estandar.
- Licencia MIT permite uso comercial, pero las limitaciones tecnicas hacen desaconsejable ese escenario.
- La longitud de contexto no se documenta; el entrenamiento uso `seq_len=512`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-soa-attn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
