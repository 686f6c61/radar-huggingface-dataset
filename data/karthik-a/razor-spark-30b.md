# karthik-a/razor-spark-30b

## Resumen

Razor-Spark 30B (también referido como THLA-30B Causal MoE) es un modelo de mezcla de expertos (MoE) para generación de código y razonamiento algorítmico, publicado por el desarrollador independiente Karthik bajo el identificador `karthik-a`. Se presenta como un modelo de 30.000 millones de parámetros totales con unos 6.300 millones de parámetros activos por token, pensado para tareas de ingeniería de software con un coste de inferencia contenido gracias al enrutado disperso.

La arquitectura combina 34 capas transformer con 32 expertos MoE (un experto maestro compartido y 31 expertos enrutados con top-2), pesos ternarios BitLinear b1.58 y una variante de atención denominada Differential Multi-Head Latent Attention (Diff-MLA). El modelo se entrena desde una base propia de 1.77B parámetros y se distribuye en seis shards de safetensors con licencia Apache 2.0, lo que facilita su uso comercial.

Su relevancia radica en la apuesta por cuantización extrema de pesos (ternaria) combinada con MoE para reducir el coste de despliegue, aunque conviene señalar una discrepancia importante: la model card declara 30.000 millones de parámetros, pero los metadatos reales de safetensors del repositorio indican 9.298.997.248 parámetros. Es un modelo de nicho, con muy poca tracción (84 descargas, 0 likes) y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE con Diff-MLA (Differential Multi-Head Latent Attention), 34 capas |
| Parametros totales | 30.003.552.256 según model card; 9.298.997.248 según metadatos de safetensors (discrepancia no resuelta) |
| Parametros activos | ~6.300.000.000 por token (declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos ternarios BitLinear b1.58; precisión declarada bfloat16 |
| Idiomas soportados | en, code |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards + model.safetensors.index.json) |

Otros datos declarados: vocabulario de 151.936 tokens, hidden size 4.096, intermediate size 2.048, 32 expertos (1 maestro compartido + 31 enrutados, top-2), 50.000 pasos de preentrenamiento, tamaño en disco declarado de 18,58 GB y tamaño del repositorio de 372,0 GB.

## Arquitectura y entrenamiento

El modelo es un transformer causal con mezcla de expertos de grano fino: 32 expertos en total, de los cuales uno es un experto maestro compartido y 31 son enrutados con selección top-2. Incorpora Differential Multi-Head Latent Attention (Diff-MLA), una variante de atención latente orientada a reducir el coste de memoria de la caché KV, y aplica cuantización ternaria BitLinear b1.58 sobre los pesos de los expertos, manteniendo bfloat16 como precisión declarada de trabajo. El tokenizador referenciado en el ejemplo de carga es el de Qwen2.5-Coder-1.5B.

El preentrenamiento se realizó durante 50.000 pasos sobre un currículo en streaming de 16 datasets de código y razonamiento, entre ellos destilaciones de Claude 3.5 Sonnet (`Data-Agora/magpie_code_claude3.5_sonnet_10000`), trazas agénticas de Cursor y Claude Code (`nlile/misc-merged-claude-code-traces-v1`), código de repositorios (`bigcode/the-stack-smol-xl`, `codeparrot/github-code`), datos sintéticos de razonamiento (`WizardLM_evol_instruct_V2_196k`, `dolphin-coder`) y tareas específicas de Python (`python_code_instructions_18k_alpaca`, `flytech/python-codes-25k`). No se documentan fases de RLHF, DPO ni datos de número de tokens totales procesados.

## Capacidades

- Generación de código en múltiples lenguajes, con énfasis declarado en Python y tareas algorítmicas.
- Razonamiento algorítmico y resolución de problemas de programación.
- Generación de texto técnica en inglés y código.
- Modelo causal de generación de texto (`text-generation`) con decodificación autorregresiva estándar (temperatura, max_new_tokens).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; aunque el dataset de entrenamiento incluye trazas agénticas, no se documenta una capacidad explícita de uso como agente.
- Capacidades multilingües: limitadas a inglés y código según los tags del modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Autocompletado de código en IDE: el modelo puede generar continuaciones de funciones a partir de una firma y un docstring, como muestra el ejemplo oficial de búsqueda binaria, integrándose en extensiones de editor mediante la API de transformers.
- Generación de funciones y utilidades Python: adecuado para producir snippets de código a partir de instrucciones en inglés, dado el peso de los datasets de instrucciones Python en su currículo.
- Prototipado de scripts de automatización: útil para generar código de pegamento y scripts de operaciones a partir de descripciones textuales.
- Asistencia en tareas de refactorización acotadas: puede proponer reescrituras de fragmentos de código en contextos cortos, siempre con revisión humana.
- Generación de tests unitarios: el modelo puede producir casos de prueba a partir de funciones existentes, aprovechando los datos de instrucciones de código.
- Experimentación en investigación sobre cuantización ternaria y MoE: su combinación de BitLinear b1.58 y enrutado top-2 lo hace interesante como banco de pruebas para estudiar el equilibrio entre compresión y calidad.
- Fine-tuning sobre dominios de código específicos: la licencia Apache 2.0 permite adaptar los pesos a dominios verticales (por ejemplo, código de infraestructura o data engineering).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: según la model card, el modelo ocupa 18,58 GB en disco en 6 shards de ~3,1 GB, lo que sugiere que puede cargarse de forma secuencial en VRAM con un pico cercano a los 18-20 GB en bfloat16 declarado. Si se confirma el recuento real de safetensors (9.298.997.248 parámetros), el requisito en bf16 sería de aproximadamente 18,6 GB; en el caso declarado de 30B en bf16 serían ~60 GB.
- GPU recomendadas: una RTX 4090 (24 GB) podría alojar el modelo si se confirma el tamaño efectivo de ~18,6 GB; para el escenario de 30B completo se necesitarían A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 o RTX 3090 (24 GB) si el tamaño real es el indicado por safetensors; no en GPUs de 16 GB o menos sin cuantización adicional.
- Opciones de despliegue: transformers con `trust_remote_code=True` y el pipeline de carga por streaming del autor (`load_trained_30b_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la presencia de `custom_code` y kernels BitLinear propios dificulta su integración con estos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Razor-Spark 30B | 30B declarados / 9,3B reales en safetensors | ~6,3B | no disponible | Apache 2.0 | MoE con BitLinear b1.58 y Diff-MLA; sin benchmarks |
| Qwen2.5-Coder-1.5B | 1,5B | n/a | 32K (estándar de la familia) | Apache 2.0 | Denso, tokenizador reutilizado por Razor-Spark; mucho más pequeño |
| DeepSeek-Coder-V2-Lite | 16B | 2,4B | 128K | Licencia propia de DeepSeek | MoE denso comparable en filosofía de eficiencia |
| CodeLlama-34B | 34B | n/a | 16K | Llama 2 Community | Denso, comparable en tamaño total |

La comparación es aproximada: no hay benchmarks de Razor-Spark que permitan contrastar calidad. La familia Qwen2.5-Coder y DeepSeek-Coder-V2 son las referencias naturales por su orientación a código, mientras que CodeLlama-34B es el comparable más cercano en número de parámetros totales.

## Limitaciones y advertencias

- Discrepancia crítica entre los parámetros declarados (30B) y los metadatos reales de safetensors (9,3B); conviene verificar el checkpoint antes de planificar despliegues.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en HumanEval, MBPP, MMLU ni similares.
- Modelo con muy poca adopción (84 descargas, 0 likes) y desarrollado por un autor individual; no hay historial de mantenimiento ni soporte comunitario.
- Uso de `custom_code` y kernels BitLinear propios: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y revisar su seguridad antes de usarlo en producción.
- Idiomas limitados a inglés y código; no se garantiza un buen rendimiento en castellano ni en otros idiomas naturales.
- Longitud de contexto no documentada: no se debe asumir una ventana larga para tareas de repositorio completo.
- Riesgo de alucinación inherente a los modelos generativos de código, agravado por el entrenamiento sobre destilaciones y datos sintéticos; se recomienda validación automática (tests, linters) en cualquier pipeline.
- El repositorio ocupa 372 GB frente a los 18,58 GB declarados del modelo, lo que sugiere artefactos adicionales (checkpoints intermedios, optimizer states) y conviene revisar antes de descargar.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento (destilaciones de Claude, trazas de Cursor) puede plantear dudas legales sobre los términos de los proveedores originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karthik-a/razor-spark-30b
- Repositorio base referenciado: https://huggingface.co/karthik-a/razor-spark-base
- Tokenizador utilizado: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Dataset de destilaciones: https://huggingface.co/datasets/Data-Agora/magpie_code_claude3.5_sonnet_10000
- Dataset de trazas agénticas: https://huggingface.co/datasets/nlile/misc-merged-claude-code-traces-v1
- Dataset de código: https://huggingface.co/datasets/bigcode/the-stack-smol-xl
- Dataset de código: https://huggingface.co/datasets/codeparrot/github-code
- Dataset de razonamiento: https://huggingface.co/datasets/cognitivecomputations/dolphin-coder
- Dataset de instrucciones Python: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Dataset de código Python: https://huggingface.co/datasets/flytech/python-codes-25k
- Dataset de instrucciones evolutivas: https://huggingface.co/datasets/WizardLM/WizardLM_evol_instruct_V2_196k
