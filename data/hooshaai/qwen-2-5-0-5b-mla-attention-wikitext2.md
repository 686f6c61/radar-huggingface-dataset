# Hooshaai/qwen-2.5-0.5b-mla-attention-wikitext2

## Resumen

Hooshaai/qwen-2.5-0.5b-mla-attention-wikitext2 es un checkpoint experimental derivado de Qwen/Qwen2.5-0.5B en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por una implementación de Multi-Head Latent Attention (MLA) al estilo DeepSeek-V2, extraída del registro de atención del framework NeuralOps. El objetivo no es ofrecer un modelo de propósito general competitivo, sino servir como banco de pruebas reproducible de atención subcuadrática sobre una arquitectura transformer preexistente de pequeño tamaño.

El proceso de "cirugía" reemplaza 18 de las 24 capas con MLA mediante un patrón híbrido 3:1, conservando 6 capas de atención cuadrática completa como anclas. Posteriormente se aplica una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar la calidad del modelo tras la intervención, que inicialmente degrada la perplejidad en varios órdenes de magnitud.

Es relevante para investigadores que estudian variantes de atención eficiente, ya que documenta con detalle la telemetría de recuperación tras la sustitución de módulos y ofrece pesos y métricas de entrenamiento de forma abierta bajo licencia MIT. El modelo está orientado exclusivamente a inglés y su calidad final (perplejidad de 295,32 en WikiText-2) refleja que se trata de un artefacto de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención MLA híbrida 3:1 (18/24 capas MLA, 6 capas cuadráticas ancla en índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | No disponible de forma explícita (modelo base Qwen2.5-0.5B, aproximadamente 0,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa seq_len=512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors 940,50 MB; attention_weights.safetensors 82,29 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, hidden_size de 896, 14 cabezas de consulta y 2 cabezas KV (GQA 14:2) con head_dim de 64. La intervención sustituye los módulos de atención de 18 capas por MLAAttention (Multi-Head Latent Attention de estilo DeepSeek-V2) mediante el adaptador QwenAttentionAdapter, que expande las cabezas KV 7 veces cuando es necesario y respeta el contrato de proyección de salida única. Se preservan 6 capas con atención cuadrática completa como anclas para estabilizar el modelo.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (wikitext-2-raw-v1). La etapa 1 (alineación con backbone congelado, 120 pasos, 54,5 s) omite lm_head y usa MSE y coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa, 274 pasos, 125,5 s) usa MSE y coseno por capa con peso 0,50. En total son 394 pasos y 180,2 s con seq_len=512, grad_accum=4 y topk=64, con un pico de VRAM de 17.652 MB en autocast FP16 con parámetros maestros en FP32. La perplejidad causal pasó de 449.229,72 (etapa 0, sin destilación) a 295,32 tras la destilación.

## Capacidades

- Generación de texto autoregresiva causal en inglés.
- Soporte de atención bidireccional y cross-attention a nivel de módulo MLA (según la ficha del módulo).
- Soporte nativo de GQA en el módulo de atención.
- No soporta RoPE en el módulo MLA (marcado como N/A en la ficha del módulo).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en atención eficiente: el checkpoint sirve para reproducir experimentos de sustitución de atención y medir el impacto en perplejidad sobre WikiText-2, comparando con el modelo base.
- Estudio de destilación de conocimiento post-cirugía: las métricas de las dos etapas (pasos, tiempos, pesos de MSE/coseno) permiten analizar estrategias de recuperación de calidad tras reemplazar módulos.
- Benchmark de implementaciones MLA: útil para validar la corrección de una implementación de MLA frente a atención cuadrática en un modelo pequeño y controlado.
- Prototipado de pipelines NeuralOps: sirve como ejemplo de uso de la API `load_surgeried_model` y del registro de atención del framework.
- Docencia y divulgación: modelo pequeño (0,1 GB de repo) que cabe en hardware modesto para demostrar conceptos de atención subcuadrática y cirugía de módulos.
- Pruebas de integración en CI: por su tamaño reducido y su licencia MIT, puede integrarse en tests automatizados que verifiquen la carga y la generación de texto.

## Benchmarks y rendimiento

| Modelo | Tarea / dataset | Métrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-mla-attention-wikitext2 | Causal LM / wikitext-2-raw-v1 (validación) | Perplejidad | 295,32 (no verificado) |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint (aproximadamente 1 GB en FP16), cabría en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: no disponible; el entrenamiento usó un pico de 17.652 MB de VRAM.
- Cabe en GPU de consumo: previsiblemente sí en modelos con al menos 4-8 GB de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: la librería declarada es `neuralops`; no se documentan soportes de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-mla-attention-wikitext2 | ~0,5B | No disponible | 295,32 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | ~0,5B | No disponible en la información | No disponible | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto de modelos alternativos en la información proporcionada para completar una comparativa más amplia.

## Limitaciones y advertencias

- Modelo de investigación: la perplejidad de 295,32 en WikiText-2 es muy superior a la de un modelo de lenguaje útil en producción, lo que indica una calidad limitada.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopédico pequeño; probablemente no generaliza bien fuera de ese dominio.
- Solo soporta inglés.
- No se documentan mitigaciones de sesgos ni evaluaciones de seguridad.
- Riesgo elevado de alucinación y de generación incoherente dado el proceso de cirugía y la destilación limitada (394 pasos).
- La longitud de contexto no está documentada; el entrenamiento usó secuencias de 512 tokens.
- El soporte de RoPE en el módulo MLA está marcado como N/A, lo que puede afectar a la extrapolación de contexto.
- No se documentan formatos de cuantización ni soporte en motores de inferencia estándar (vLLM, llama.cpp, etc.).
- La licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-mla-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
