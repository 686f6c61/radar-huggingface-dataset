# Hooshaai/qwen-2.5-0.5b-cross-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-cross-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha realizado una "cirugía de atención": 18 de las 24 capas del decoder han sido sustituidas por el operador `CrossAttention` de la librería NeuralOps, manteniendo 6 capas con la atención GQA original de Qwen2. Lo desarrolla el usuario Hooshaai dentro del proyecto NeuralOps (repositorio `tahamajs/NeuralOps`), y su interés es fundamentalmente de investigación: demuestra que es posible reemplazar la atención softmax estándar por operadores alternativos y recuperar buena parte del rendimiento mediante destilación de conocimiento.

El modelo parte de los pesos preentrenados de Qwen2.5-0.5B (494M parámetros, 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor) y aplica un esquema híbrido 3:1: tres capas transplantadas por cada capa nativa. Tras el transplante, la perplejidad en WikiText-2 se dispara a 813.457,09; tras dos etapas de destilación de representaciones ocultas, baja a 97,96.

Es relevante ahora porque ejemplifica una línea de trabajo activa en eficiencia de atención (atención subcuadrática, híbridos lineales/softmax) aplicada a modelos pequeños, y porque publica telemetría completa del proceso de destilación, algo poco habitual en checkpoints experimentales. No obstante, el resultado está muy lejos del profesor (perplejidad 15,38) y el modelo está pensado para experimentación, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con 18/24 capas sustituidas por `CrossAttention` de NeuralOps; diseño híbrido 3:1 |
| Parametros totales | 494M (modelo base Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 completo, 1021,34 MB, mas un adaptador) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | FP16 completo (safetensors/PyTorch, 1021,34 MB) + adaptador; libreria `neuralops` |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer Qwen2 de 24 capas con dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV (GQA) y dimensión por cabeza de 64. La modificación consiste en reemplazar la atención softmax en las capas `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` por el operador `CrossAttention` (multi-head cross-attention con LoRA; con `context=None` actúa como self-attention causal). Las capas `[3, 7, 11, 15, 19, 23]` conservan la GQA nativa como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14, evitando proyecciones sin inicializar. El adaptador gestiona RoPE con theta = 1.000.000 y hay despacho de kernels en tres niveles (CUDA, Triton, PyTorch).

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con longitud de secuencia 512, `batch_size=8` y `grad_accum=4`, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 130 pasos) congela embeddings, MLP y `lm_head` y solo entrena módulos de atención y layer norms, con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0) y pérdida MSE + 0.25·(1 − coseno). La etapa 2 (70% del presupuesto, 296 pasos) hace destilación de representaciones extremo a extremo con pérdida MSE + 0.50·(1 − coseno) y lr=6e-5 (dato truncado en la model card). No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés.
- Razonamiento básico y modelado de lenguaje, heredado del modelo base Qwen2.5-0.5B, aunque degradado por la cirugía y la destilación.
- Soporte de atención causal con GQA y RoPE a través del adaptador de NeuralOps.
- Capacidad de actuar como banco de pruebas para operadores de atención alternativos (atención subcuadrática, híbridos lineales/softmax).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Investigación en eficiencia de atención: servir como referencia reproducible para medir el coste de sustituir atención softmax por operadores alternativos en un decoder pequeño, con telemetría de perplejidad antes y después de la destilación.
- Experimentos de destilación de representaciones: el checkpoint y su protocolo en dos etapas permiten replicar y comparar estrategias de alineación de estados ocultos (MSE + coseno) en modelos de 0,5B.
- Evaluación de operadores de NeuralOps: validar el comportamiento del operador `CrossAttention` con GQA y RoPE en un pipeline real de generación de texto.
- Prototipado de arquitecturas híbridas: estudiar el efecto del ratio 3:1 (capas transplantadas frente a anclas nativas) sobre la perplejidad y la calidad de generación.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y destilación con métricas concretas y hardware asequible (una RTX 3090).
- Pruebas de regresión en tooling de inferencia: verificar que librerías como `neuralops` cargan y ejecutan correctamente checkpoints con operadores personalizados.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del estudiante tras cirugía (zero-shot) | 813.457,09 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del estudiante tras destilación | 97,96 | Tras destilación en dos etapas |
| Delta absoluto de perplejidad | −813.359,13 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 99,99% | Recuperación desde el pico post-cirugía |

Evaluación en WikiText-2 (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, en una NVIDIA GeForce RTX 3090 de 24 GB. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para los pesos (1021,34 MB) más el adaptador y el overhead de activaciones; en la práctica, unos 2-3 GB con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en una RTX 3090 de 24 GB, pero el modelo es mucho más pequeño que ese presupuesto.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en iGPU con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: la librería `neuralops` es el camino previsto; al ser un Qwen2 con operadores personalizados, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está garantizada y no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-cross-attention-wikitext2` | 494M | No disponible | 97,96 (post-KD, declarada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens | 15,38 (declarada) | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494M | 32.768 tokens | No disponible | Apache 2.0 | Hugging Face |

La comparación relevante es con el propio modelo base: la cirugía y la destilación multiplican por más de seis la perplejidad del profesor en WikiText-2 (97,96 frente a 15,38), lo que cuantifica el coste de sustituir la atención nativa en un modelo tan pequeño.

## Limitaciones y advertencias

- Calidad muy inferior al modelo base: perplejidad de 97,96 frente a 15,38 del profesor, una diferencia de más de 6x.
- El checkpoint es un experimento de investigación, no un modelo listo para producción.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Riesgo elevado de alucinación y generación incoherente derivado de la degradación de perplejidad.
- Sesgos: no documentados; hereda los del corpus WikiText-2 y del modelo base, sin filtrado adicional conocido.
- Licencia MIT, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B es Apache 2.0 y conviene revisar la compatibilidad de obligaciones.
- Dependencia de la librería `neuralops` y de operadores personalizados: puede requerir código específico para cargar y ejecutar el modelo.
- La model card está truncada en la descripción de la etapa 2 de destilación (lr=6...), por lo que el protocolo completo no es reproducible al 100% con la información publicada.
- No hay verificación independiente de las métricas; todas proceden del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-cross-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/cross_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
