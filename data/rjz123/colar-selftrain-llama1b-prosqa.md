# rjz123/colar-selftrain-llama1b-prosqa

## Resumen

El modelo `rjz123/colar-selftrain-llama1b-prosqa` es un adaptador PEFT (LoRA) desarrollado por el investigador rjz123, construido sobre la base de `unsloth/Llama-3.2-1B-Instruct`. Su propósito es explorar la técnica de razonamiento latente denominada CoLaR (Latent Reasoning), aplicada al conjunto de datos ProsQA, un benchmark de preguntas y respuestas de razonamiento procedimental. El modelo se distribuye como un checkpoint de PyTorch-Lightning, no como un modelo completo autocargable, e incluye dos archivos de pesos: `cot_baseline.ckpt` y `sft_adaptiveLRM.ckpt`.

La relevancia de este modelo radica en su enfoque experimental: combina un LLM pequeño (1B parámetros) con un mecanismo de razonamiento latente (un MLP llamado `LatentPolicy`) y LoRA de alto rango (r=128) en las proyecciones Q y V, lo que permite estudiar cómo mejorar las capacidades de razonamiento sin aumentar el tamaño del modelo base. Es un trabajo de investigación, no un modelo listo para producción, y su valor principal es metodológico para quienes investigan arquitecturas de razonamiento implícito o entrenamiento auto-supervisado en LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.2-1B-Instruct) + adaptador LoRA (r=128 en Q/V) + MLP `LatentPolicy` para razonamiento latente |
| Parametros totales | No disponible (el adaptador añade parámetros al modelo base de 1B; el repo ocupa 0.2 GB) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 128k tokens (heredada del modelo base Llama-3.2-1B-Instruct) |
| Tipos de cuantizacion | No disponible (los checkpoints están en formato PyTorch-Lightning, sin cuantización documentada) |
| Idiomas soportados | No disponibles (modelo base entrenado principalmente en inglés, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`), con claves bajo `['state_dict']`; no es compatible con `AutoModel` directamente |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer estándar de Llama-3.2-1B-Instruct, pero incorpora dos modificaciones clave: una expansión del vocabulario con tokens `[PAD]` (para permitir el razonamiento latente) y un adaptador LoRA de rango 128 aplicado a las proyecciones de query y value. Además, incluye un MLP denominado `LatentPolicy` que actúa como módulo de razonamiento latente, probablemente generando representaciones intermedias comprimidas que guían la generación.

El entrenamiento sigue el paradigma CoLaR (self-training con razonamiento latente), con dos checkpoints: `cot_baseline.ckpt` (probablemente una línea base de chain-of-thought) y `sft_adaptiveLRM.ckpt` (entrenamiento supervisado con un modelo de razonamiento latente adaptativo). No se especifican los datos de entrenamiento más allá de la referencia a ProsQA, ni el número de tokens, ni si se aplicó RLHF o DPO. La carga requiere variables de entorno específicas (`COLAR_BASE`, `COLAR_CKPT`, `COLAR_EMB_STD`, `COLAR_COMPRESS`, `COLAR_MAXLAT`) y `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`, lo que indica un pipeline de investigación no estandarizado.

## Capacidades

- Razonamiento latente: el modelo incorpora un mecanismo de razonamiento implícito (LatentPolicy) que comprime el contexto en representaciones latentes (con factor de compresión 5 y máximo 64 tokens latentes), lo que podría mejorar la eficiencia y la calidad del razonamiento multi-paso.
- Generación de texto: hereda las capacidades de generación del modelo base Llama-3.2-1B-Instruct, incluyendo instrucciones y conversación.
- Razonamiento procedimental: entrenado específicamente en ProsQA, un benchmark de preguntas de razonamiento procedimental, por lo que puede manejar tareas que requieren seguir pasos secuenciales.
- Tool calling / function calling: no documentado para este adaptador, aunque el modelo base lo soporta; no se garantiza su funcionamiento tras el fine-tuning.
- Soporte de agentes: no documentado; el enfoque está en razonamiento latente, no en interacción con herramientas.
- Capacidades multilingües: no disponibles; el modelo base tiene soporte multilingüe limitado (principalmente inglés), pero no se especifica para este adaptador.

## Casos de uso

- Investigación en razonamiento latente: el caso de uso principal es académico. Permite estudiar cómo un MLP latente puede sustituir o complementar el chain-of-thought explícito, comparando los checkpoints `cot_baseline` y `sft_adaptiveLRM` para medir el impacto del razonamiento latente en tareas de razonamiento procedimental.
- Evaluación de técnicas de compresión de contexto: con `COLAR_COMPRESS=5` y `COLAR_MAXLAT=64`, el modelo puede servir para experimentar con compresión de historial conversacional o de contexto largo, reduciendo la carga computacional en inferencia.
- Benchmarking de modelos pequeños: al ser un modelo de 1B con adaptadores, es útil para comparar el rendimiento de LLMs pequeños con razonamiento latente frente a modelos de mayor tamaño, en entornos con recursos limitados.
- Desarrollo de pipelines de auto-entrenamiento: el enfoque de self-training puede replicarse o adaptarse para otros dominios; el checkpoint sirve como referencia de implementación.
- Análisis de robustez del razonamiento: al estar entrenado en ProsQA, puede usarse para probar la capacidad de razonamiento procedimental en escenarios sintéticos o de diagnóstico.
- Pruebas de integración con frameworks de inferencia personalizados: dado que no es compatible con `AutoModel`, su uso requiere un scaffold custom, lo que lo convierte en un caso de estudio para quienes desarrollan entornos de inferencia con arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni de ProsQA en la model card. No es posible comparar cuantitativamente este adaptador con otros modelos sin datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B con LoRA y un MLP adicional, la VRAM necesaria es baja. Con cuantización de 4 bits (no incluida en el repo, pero posible sobre el modelo base), se estima entre 1-2 GB. Sin cuantización, alrededor de 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1660, RTX 3050, RTX 4060) es suficiente para inferencia. Para entrenamiento o fine-tuning, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4070, etc.).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: no es directamente compatible con vLLM, llama.cpp, Ollama o TGI debido al formato de checkpoint custom. Requiere un script propio que cargue el modelo base por separado y aplique el `state_dict` con `strict=False`. Para producción, habría que convertir los pesos a un formato estándar (safetensors) y adaptar el scaffold.
- Latencia y throughput: no disponibles. Al ser un modelo de 1B, la latencia esperada es baja (del orden de 10-30 ms por token en GPU moderna), pero el MLP latente añade una capa adicional que puede incrementar ligeramente el tiempo de cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento latente | Licencia | Formato |
|---|---|---|---|---|---|
| rjz123/colar-selftrain-llama1b-prosqa | 1B + adaptador | 128k | Sí (CoLaR) | No disponible | Checkpoint Lightning |
| unsloth/Llama-3.2-1B-Instruct (base) | 1B | 128k | No | Llama 3.2 Community License | Safetensors |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k | No | Apache 2.0 | Safetensors |
| TinyLlama-1.1B-Chat | 1.1B | 2k | No | Apache 2.0 | Safetensors |

La comparativa se limita al modelo base y a alternativas de tamaño similar. No hay datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia es la incorporación del módulo de razonamiento latente, que no está presente en las alternativas. El formato de checkpoint es una desventaja práctica frente a los formatos estándar.

## Limitaciones y advertencias

- Checkpoint de investigación, no apto para producción: los pesos están en formato PyTorch-Lightning y requieren un scaffold custom para cargarse; no funcionan con `AutoModel` ni con frameworks de inferencia estándar.
- Licencia no especificada: no se indica bajo qué términos se distribuye el adaptador; el modelo base tiene licencia Llama 3.2 Community, pero el adaptador no aclara su estatus legal para uso comercial.
- Sesgos y alucinaciones: no documentados; al ser un modelo pequeño entrenado en un dominio específico (ProsQA), puede alucinar en tareas fuera de su distribución de entrenamiento.
- Idiomas limitados: no se especifican idiomas soportados; el modelo base tiene un rendimiento pobre en idiomas distintos del inglés, y el fine-tuning en ProsQA (probablemente en inglés) no mejora esto.
- Riesgo de sobreajuste: al ser un adaptador entrenado en un benchmark concreto, puede generalizar mal a otros tipos de razonamiento o preguntas.
- Dependencia de variables de entorno: la carga requiere variables específicas (`COLAR_BASE`, `COLAR_CKPT`, etc.) y una versión antigua de PyTorch-Lightning; esto puede causar incompatibilidades con entornos modernos.
- Sin benchmarks publicados: no hay evidencia de rendimiento comparativo, lo que impide evaluar su efectividad frente a otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/rjz123/colar-selftrain-llama1b-prosqa
- Modelo base (unsloth/Llama-3.2-1B-Instruct): https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
