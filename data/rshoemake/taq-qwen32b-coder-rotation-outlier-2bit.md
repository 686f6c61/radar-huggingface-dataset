# rshoemake/taq-qwen32b-coder-rotation-outlier-2bit

## Resumen

El modelo `rshoemake/taq-qwen32b-coder-rotation-outlier-2bit` es una versión cuantizada del modelo de generación de código `Qwen/Qwen2.5-Coder-32B-Instruct`, producida mediante el pipeline de cuantización TAQ (Tail-Aware Quantization) del proyecto `fractal_quant_decision`. Aplica una acción uniforme de tipo `rotation_outlier` sobre todas las capas elegibles, con una rotación de Hadamard fija y con semilla antes de la cuantización, a un presupuesto nominal de 2 bits (aunque el bpw real medido es de 2,8734). El resultado son pesos reales empaquetados a nivel de byte, cargables mediante kernels específicos, no un scaffold des-cuantizado.

El modelo mantiene la arquitectura transformer decoder-only del Qwen2.5-Coder-32B-Instruct, con 32.763.876.352 parámetros. Su relevancia radica en ofrecer una compresión agresiva (2 bits) que reduce notablemente los requisitos de VRAM para inferencia de un modelo de 32B, a costa de una degradación moderada en la calidad de generación de código, como muestran los benchmarks de HumanEval+ y MBPP+ incluidos en la model card. Está pensado para desarrolladores e investigadores que necesitan ejecutar modelos grandes en hardware limitado o evaluar métodos de cuantización extremos.

La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque el formato de pesos es propietario y requiere herramientas específicas para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2-bit (bpw real 2,8734) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (para capas en fp16) y formato binario personalizado (`packed/*.bin`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos fp16 de `Qwen/Qwen2.5-Coder-32B-Instruct` y se somete a un proceso de cuantización post-entrenamiento, no a un entrenamiento adicional. El método TAQ aplica una rotación de Hadamard fija (con semilla) a las activaciones antes de cuantizar, seguida de una acción uniforme `rotation_outlier` que trata los outliers mediante un canal lateral. Cada capa se empaqueta en archivos binarios con cabecera, codebooks fp16, índices empaquetados a nivel de bit y un canal de outliers. El manifiesto (`packed/manifest.json`) documenta la acción, los bits y el bpw medido por capa. Algunas capas pueden quedar en fp16 puro (passthrough) si el asignador lo decide, pero en esta variante la acción es uniforme en todas las capas elegibles.

No se detallan los datos de entrenamiento del modelo base, pero se sabe que Qwen2.5-Coder-32B-Instruct fue entrenado con un corpus extenso de código y texto, con instrucciones y ajuste fino por RLHF. La cuantización no modifica los pesos semánticamente, solo los comprime.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo base Qwen2.5-Coder-32B-Instruct.
- Razonamiento y resolución de problemas de programación, con soporte para tareas de nivel competitivo.
- Comprensión de instrucciones en lenguaje natural para generar código (instrucciones de alto nivel).
- Soporte de tool calling y function calling, presente en el modelo base, aunque no se valida específicamente en esta versión cuantizada.
- Capacidad de completar código, refactorizar, explicar fragmentos y generar tests.
- Soporte multilingüe limitado al entrenamiento del modelo base (principalmente inglés y algo de chino), pero no se especifica en la información proporcionada.
- Formato de pesos optimizado para inferencia con bajo consumo de VRAM, gracias a la cuantización de 2 bits.

## Casos de uso

- Inferencia de código en entornos con VRAM limitada: el modelo permite ejecutar un LLM de 32B en GPUs de consumo como RTX 3090 o 4090 (24 GB) gracias a su tamaño comprimido (~11,8 GB de pesos). Es útil para asistentes de código locales o entornos de desarrollo integrados.
- Prototipado y experimentación con cuantización agresiva: investigadores pueden evaluar el impacto de 2 bits en la calidad de generación de código, comparando con fp16 o cuantizaciones más conservadoras.
- Generación de código en pipelines de CI/CD: aunque la degradación es notable, para tareas simples como generar tests unitarios o documentación puede ser suficiente, reduciendo costes de infraestructura.
- Despliegue en servidores con múltiples modelos simultáneos: al ocupar menos VRAM, se pueden alojar más instancias en una misma GPU, aumentando el throughput por hardware.
- Evaluación de métodos de compresión: el modelo sirve como referencia para comparar la técnica `rotation_outlier` frente a otras variantes del mismo proyecto (como `outlier_2bit` o `mixed_allocator_2bit`).
- Investigación sobre robustez de modelos cuantizados: permite estudiar cómo afecta la rotación de Hadamard a la preservación de la información en tareas de código.

## Benchmarks y rendimiento

Los datos de la model card incluyen evaluación de fidelidad (perplejidad en WikiText-2) y calidad de generación de código (HumanEval+ y MBPP+). Se presentan a continuación.

**Fidelidad (perplejidad WikiText-2)**

| Modelo | bpw | PPL | KLD vs fp16 |
|---|---:|---:|---:|
| **Este checkpoint** (`rotation_outlier_2bit`, uniform) | 2,8734 | 21,597 | 0,6211 |
| `outlier_2bit` (uniform, mismo presupuesto) | 2,8639 | 22,193 | 0,6305 |
| `mixed_allocator_2bit` (asignador por capa, mismo presupuesto) | 2,8734 | 20,387 | 0,5063 |

**Calidad de código (pass@1, greedy)**

| Modelo | HumanEval Base | HumanEval Base+Extra | MBPP Base | MBPP Base+Extra |
|---|---:|---:|---:|---:|
| **Este checkpoint** | 0,8841 | 0,8049 | 0,7519 | 0,6391 |
| `outlier_2bit` | 0,8598 | 0,7988 | 0,7769 | 0,6566 |
| `mixed_allocator_2bit` | 0,8659 | 0,7988 | 0,7845 | 0,6466 |
| fp16 (referencia) | 0,9024 | 0,8598 | 0,8647 | 0,7268 |
| Unsloth bnb-4bit (~6,1 bpw) | 0,9024 | 0,8720 | 0,8596 | 0,7293 |
| GGUF Q4_K_M (Unsloth, ~4,85 bpw) | 0,8902 | 0,8293 | 0,8546 | 0,7293 |

La degradación respecto al fp16 es de -0,0549 en HumanEval Base+Extra y -0,0877 en MBPP Base+Extra. El modelo supera a `outlier_2bit` en fidelidad, pero es inferior a `mixed_allocator_2bit` en perplejidad y en MBPP.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan aproximadamente 11,8 GB (cálculo: 32.763.876.352 parámetros × 2,8734 bpw / 8 = 11,76 GB). Añadiendo overhead de activaciones y caché KV, se recomienda al menos 16 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o superiores. En GPUs con 16 GB (como RTX 4080) podría caber con ventanas de contexto cortas.
- No se dispone de datos oficiales de latencia ni throughput.
- Opciones de despliegue: el formato de pesos es personalizado y requiere kernels específicos para cargar los archivos `packed/*.bin`. No es compatible directamente con frameworks estándar como vLLM, llama.cpp u Ollama sin adaptaciones. El repositorio incluye scripts de desempaquetado (`unpack_outlier.py`, `unpack_rotation_outlier.py`), pero no se documenta un runtime de inferencia listo para producción.
- Para uso práctico, podría ser necesario convertir los pesos a un formato estándar (por ejemplo, GGUF) mediante los scripts de desempaquetado, aunque esto anularía la ventaja de compresión.

## Comparativa con modelos similares

La comparativa se basa en los datos de la model card, que incluyen el modelo fp16 original y dos cuantizaciones comerciales del mismo modelo base.

| Modelo | Parámetros | bpw | HumanEval Base+Extra | MBPP Base+Extra | Licencia |
|---|---:|---:|---:|---:|---|
| **Este checkpoint** | 32,76B | 2,87 | 0,8049 | 0,6391 | Apache-2.0 |
| Qwen2.5-Coder-32B-Instruct (fp16) | 32,76B | 16 | 0,8598 | 0,7268 | Apache-2.0 |
| Unsloth bnb-4bit | 32,76B | ~6,1 | 0,8720 | 0,7293 | Apache-2.0 |
| GGUF Q4_K_M (Unsloth) | 32,76B | ~4,85 | 0,8293 | 0,7293 | Apache-2.0 |

El modelo de 2 bits pierde claramente frente a cuantizaciones de 4 bits en tareas de código, aunque ofrece un ahorro de VRAM sustancial (casi la mitad de los pesos). No se dispone de comparativas con otros modelos de código de tamaño similar (por ejemplo, DeepSeek-Coder-33B) en la información proporcionada.

## Limitaciones y advertencias

- Degradación significativa en calidad de código: la caída en HumanEval+ y MBPP+ respecto al fp16 es notable, especialmente en MBPP (hasta -8,77 puntos). Para tareas complejas de generación de código, la precisión puede ser insuficiente.
- Formato de pesos propietario: los archivos `packed/*.bin` requieren kernels personalizados para su carga. No hay integración documentada con vLLM, llama.cpp u Ollama, lo que limita su uso práctico en producción.
- Riesgo de alucinación: como todo LLM, puede generar código incorrecto o inventar APIs, y la cuantización agresiva puede aumentar este comportamiento.
- Sesgos del modelo base: Qwen2.5-Coder puede presentar sesgos de género, idioma o dominio, que la cuantización no mitiga.
- Longitud de contexto no especificada: aunque el modelo base soporta 128K tokens, no se confirma que la cuantización preserve esta capacidad. Se recomienda probar con ventanas cortas.
- Sin soporte de vision ni audio: es un modelo exclusivamente de texto.
- La perplejidad en WikiText-2 (21,6) es alta, lo que indica pérdida de fluidez en lenguaje natural, aunque el enfoque principal es código.

## Enlaces

- Modelo en HuggingFace: [rshoemake/taq-qwen32b-coder-rotation-outlier-2bit](https://huggingface.co/rshoemake/taq-qwen32b-coder-rotation-outlier-2bit)
- Documentación del formato TAQ: [rshoemake/taq-qwen14b-unsloth-matched](https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched)
- Modelo base: [Qwen/Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct)
