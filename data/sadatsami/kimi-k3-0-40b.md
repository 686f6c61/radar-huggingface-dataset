# Sadatsami/Kimi-K3-0.40B

## Resumen

Kimi-K3-0.40B es un modelo "tiny" derivado de moonshotai/Kimi-K3, publicado por el usuario Sadatsami (etiquetado internamente como inference-optimization en el ejemplo de uso de la model card). No es un modelo entrenado para producción: es un checkpoint de desarrollo creado con la herramienta `create-tiny-model` de llm-compressor, cuyo objetivo declarado es "testing and development". Reproduce a escala reducida la arquitectura del Kimi-K3 original, con 8 capas en lugar de 93, dimensión oculta de 1024 en lugar de 7168 y 8 expertos en lugar de 896.

El interés técnico del checkpoint es que conserva el patrón arquitectónico completo del modelo grande: atención mixta KDA (Kimi Delta Attention, lineal) y MLA (Multi-Latent Attention) en proporción 3:1, conexiones residuales entre atención y MLP, MoE disperso con proyección latente de expertos en las capas 1 a 7, y una torre de visión reducida. Con 395.567.400 parámetros totales y aproximadamente 0,06B activos por token (2 de 8 expertos), es un banco de pruebas para validar código de carga, kernels y pipelines de cuantización antes de escalar al modelo completo.

Es relevante ahora como artefacto de infraestructura, no como modelo de propósito general: permite verificar que el código de modelado personalizado de Kimi-K3 (`llmcompressor.modeling.kimi_k3`) funciona, que la estructura de pesos es correcta y que las rutas de atención híbrida se ejecutan. Sus pesos se inicializaron desde cero y se ajustaron sobre un dataset de copypasta de juguete, por lo que su calidad lingüística real es prácticamente nula fuera de ese dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | kimi_linear (KimiK3ForConditionalGeneration), transformer híbrido KDA + MLA con MoE disperso |
| Parametros totales | 395.567.400 (0,396B) |
| Parametros activos | ~0,06B (2 de 8 expertos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF/AWQ/GPTQ en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de un solo shard, `model.safetensors`) |
| Capas | 8 |
| Hidden size | 1024 |
| Intermediate size | 2048 |
| MoE intermediate size | 256 |
| Cabezas de atencion | 8 (8 KV heads) |
| Numero de expertos | 8 (2 activos por token, 1 experto compartido) |
| q_lora_rank / kv_lora_rank | 256 / 128 |
| qk_nope_head_dim / qk_rope_head_dim / v_head_dim | 64 / 32 / 64 |
| attn_res_block_size | 4 |
| Torre de vision | presente y reducida (vt_num_hidden_layers=2, vt_hidden_size=256), sin entrenar |
| Tamano del repo | 1,6 GB |
| Pipeline declarado | feature-extraction |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

El modelo replica el esquema de atención híbrida del Kimi-K3 original. Las capas 0, 1, 2, 4, 5 y 6 usan KimiDeltaAttention (KDA), una atención lineal de tipo delta, mientras que las capas 3 y 7 usan KimiMLAAttention (MLA), atención completa multi-latente. Se mantiene por tanto la proporción 3:1 KDA:MLA. Además, todas las capas tienen activadas las conexiones residuales atención+MLP con `attn_res_block_size=4`, un mecanismo de residuales por bloques que el modelo original aplica cada 12 capas.

El bloque MLP es mixto: la capa 0 es un MLP denso y las capas 1 a 7 usan MoE disperso con proyección latente de expertos (8 expertos enrutados, 2 activos por token, 1 experto compartido y `routed_expert_hidden_size` de 512). Esto reproduce el comportamiento de enrutamiento del modelo grande sin su coste computacional.

El entrenamiento no sigue un pipeline estándar. Los pesos se inicializaron aleatoriamente (distribución normal con std=0,02; normas a 1,0; sesgos a 0,0) y después se ajustaron sobre un dataset de copypasta de juguete hasta alcanzar perplejidad inferior a 3,0, lo que se consiguió en aproximadamente 57 épocas. La pérdida reportada en la validación de forward pass es de 0,0013. No hay datos de preentrenamiento a gran escala, ni de RLHF, DPO o ajuste por instrucciones. La torre de visión está incluida en la configuración pero no fue entrenada para tareas visuales.

## Capacidades

- Generación de texto autoregresiva, limitada en la práctica a la reproducción del corpus de copypasta con el que fue ajustado.
- Ejecución de un forward pass correcto sobre la arquitectura KDA + MLA + MoE, lo que permite validar kernels y código de modelado.
- Extracción de características, coherente con el pipeline declarado en HuggingFace (`feature-extraction`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades de visión: la torre existe en la configuración, pero está explícitamente sin entrenar, por lo que no hay capacidades visuales funcionales.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Validación de código de modelado personalizado: sirve para comprobar que `llmcompressor.modeling.kimi_k3.KimiK3ForConditionalGeneration` carga correctamente, que las claves del checkpoint (`language_model.model.layers.{i}.*`) coinciden con la estructura esperada y que se respeta el patrón KDA:MLA 3:1.
- Pruebas de integración en CI: al ocupar menos de 2 GB, se puede descargar y ejecutar en cada build para detectar regresiones en el código de carga o en los kernels de atención lineal antes de pasar al modelo completo de 93 capas.
- Desarrollo de pipelines de cuantización: es un sujeto de prueba barato para validar recetas de cuantización sobre arquitecturas MoE con proyección latente de expertos, sin necesidad de GPUs de gama alta.
- Benchmarking de kernels de atención lineal: permite medir el rendimiento de implementaciones de KDA o delta attention frente a MLA en un entorno controlado y de tamaño reducido.
- Verificación de compatibilidad de checkpoints: útil para comprobar que herramientas de sharding, conversión de formato o inspección de pesos manejan correctamente un checkpoint de shard único con prefijos de clave anidados.
- Pruebas de memoria y planificación de despliegue: sirve para estimar el consumo de memoria de las componentes (torre de visión, MoE, MLA) antes de extrapolar al modelo grande.
- Docencia y demostración de arquitecturas híbridas: al ser un modelo pequeño con KDA, MLA, MoE y residuales por bloques, es útil para ilustrar cómo se combinan estos mecanismos en un mismo transformer.
- No es adecuado para generación de texto en producción, atención al cliente, generación de código ni ninguna tarea que requiera conocimiento factual o razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de evaluación presente en la model card es la pérdida de un forward pass (0,0013) y la perplejidad del ajuste sobre el dataset de juguete (< 3,0 tras ~57 épocas). No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,6 GB solo para pesos, más activaciones; el repositorio ocupa 1,6 GB, lo que sugiere almacenamiento en fp32 o con la torre de visión incluida.
- VRAM estimada en bf16: aproximadamente 0,8 GB de pesos.
- VRAM estimada en int8: aproximadamente 0,4 GB; en int4, alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter como A100 o H100, aunque no las necesita.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos años, e incluso es viable ejecutarlo en CPU.
- Opciones de despliegue: no se pueden usar vLLM, TGI, llama.cpp, Ollama ni `AutoModelForCausalLM` sin trabajo adicional, porque el modelo requiere el módulo `llmcompressor.modeling.kimi_k3` en el path y `KimiK3ForConditionalGeneration` no hereda de `GenerationMixin`. La generación debe hacerse con `model.language_model.generate(...)`. No se publican archivos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito |
|---|---|---|---|---|---|
| Kimi-K3-0.40B | 0,396B (0,06B activos) | no disponible | MIT | safetensors, requiere codigo custom | Banco de pruebas de arquitectura |
| Qwen2.5-0.5B | ~0,49B | 32.768 tokens (dato publico del modelo) | Apache-2.0 | transformers, GGUF, amplio ecosistema | Modelo pequeño de proposito general |
| SmolLM2-360M | ~0,36B | 8.192 tokens (dato publico del modelo) | Apache-2.0 | transformers, GGUF | Modelo pequeño de proposito general |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens (dato publico del modelo) | Apache-2.0 | transformers, GGUF | Modelo pequeño de proposito general |

La comparación es solo estructural: los tres alternativas son modelos entrenados con corpus reales y con resultados publicados, mientras que Kimi-K3-0.40B es un artefacto de desarrollo con pesos ajustados sobre texto de juguete. No hay datos de rendimiento comparables entre ellos en la informacion proporcionada. El contexto del modelo original Kimi-K3 tampoco se detalla en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo funcional de lenguaje: fue ajustado sobre un dataset de copypasta de juguete y reproduce ese contenido; no tiene conocimiento factual ni capacidad de razonamiento general.
- Riesgo de alucinación máximo: al carecer de preentrenamiento sobre corpus reales, cualquier salida fuera del dominio de ajuste es esencialmente arbitraria.
- Sesgos conocidos: no disponible; no se ha realizado ninguna evaluación de sesgo.
- Idiomas soportados: no declarados. No se puede asumir competencia multilingüe.
- Longitud de contexto: no disponible; no se documenta la ventana máxima soportada.
- Restricciones de licencia: licencia MIT, lo que permite uso comercial, modificación y redistribución. Sin embargo, el uso comercial real está limitado por la ausencia de capacidades funcionales.
- Requiere código personalizado: no se puede cargar con `AutoModelForCausalLM` sin `llmcompressor.modeling.kimi_k3` en el path. `KimiK3ForConditionalGeneration` no hereda de `GenerationMixin`, por lo que hay que invocar `model.language_model.generate(...)`.
- La torre de visión está presente pero sin entrenar; puede consumir memoria y añadir complejidad al despliegue sin aportar ninguna capacidad.
- Incompatibilidad con el ecosistema estándar: no hay GGUF, no hay soporte en vLLM, TGI, Ollama ni llama.cpp, lo que limita su uso a entornos de desarrollo en Python.
- El ejemplo de uso de la model card referencia el identificador `inference-optimization/Kimi-K3-0.40B`, distinto del identificador real del repositorio en HuggingFace (`Sadatsami/Kimi-K3-0.40B`); hay que corregir la ruta al cargar el modelo.
- El tamaño del repositorio (1,6 GB) es notablemente superior a lo esperable para 0,396B parámetros en bf16 (~0,8 GB), lo que sugiere pesos en fp32 o la inclusión de componentes adicionales; conviene verificarlo antes de planificar memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sadatsami/Kimi-K3-0.40B
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Repositorio de llm-compressor (herramienta con la que se creó el modelo): no disponible en la informacion proporcionada, aunque la model card menciona `llm-compressor/src` y el modulo `llmcompressor.modeling.kimi_k3`.
- Paper, blog o demo oficial: no disponible.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos correspondían a sitios de juegos de burbujas y no guardan relacion con el modelo.
