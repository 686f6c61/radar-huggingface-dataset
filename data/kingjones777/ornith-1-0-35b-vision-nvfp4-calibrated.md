# kingjones777/Ornith-1.0-35B-Vision-NVFP4-Calibrated

## Resumen

Ornith-1.0-35B-Vision-NVFP4-Calibrated es una cuantización NVFP4 (4 bits en coma flotante) del modelo multimodal Ornith-1.0-35B, desarrollada por kingjones777 con NVIDIA ModelOpt. El modelo base, creado por ornith-ai (DeepReinforce AI), es un MoE basado en arquitectura Qwen3.5, post-entrenado con aprendizaje por refuerzo para optimizar generación de scaffolds y soluciones en tareas de codificación agéntica. Esta versión cuantizada destaca por estar calibrada con datos reales (a diferencia de otras cuantizaciones comunitarias sin datos) y por mantener la torre de visión completa en BF16, lo que permite su uso multimodal directamente en vLLM sobre hardware Blackwell.

El modelo se sirve con vLLM en GPUs Blackwell (verificado en GB10, sm_121) y ocupa 21,9 GB en disco. Según los datos de safetensors, contiene 18.296.542.576 parámetros, aunque el nombre del modelo base sugiere 35B totales; la discrepancia puede deberse a la representación cuantizada o a la convención de nomenclatura. La licencia MIT permite uso comercial sin restricciones, y el contexto nativo del modelo base alcanza 256K tokens, aunque el ejemplo de despliegue usa 8192.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (Mixture of Experts) multimodal, con torre de visión |
| Parametros totales | 18.296.542.576 (segun safetensors; el modelo base se anuncia como 35B) |
| Parametros activos | no disponible (MoE, no se especifica el numero de activos) |
| Longitud de contexto | 256K (modelo base); 8192 en el ejemplo de vLLM |
| Tipos de cuantizacion | NVFP4 (4 bits), con calibracion AWQ en capas no expertas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (servido con vLLM) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-35B emplea una arquitectura MoE basada en Qwen3.5, con 35B parámetros totales según la documentación oficial. Fue post-entrenado mediante aprendizaje por refuerzo para optimizar conjuntamente la generación de scaffolds y los rollouts de soluciones en tareas de codificación agéntica, lo que le permite auto-mejorarse en entornos de agente. La versión cuantizada aquí descrita aplica NVFP4 a todas las capas `Linear` excepto la torre de visión (27 bloques, mantenidos en BF16), los router gates del MoE y `lm_head` (también en BF16). La calibración se realizó con datos reales (192 conversaciones de UltraChat-200k y 64 archivos de código Python) sobre las 310 capas `Linear` no expertas; las 30.720 proyecciones de expertos fusionados se cuantizaron sin datos porque ModelOpt no puede alcanzar el contenedor fused expert de transformers-5.x. Se descartó una variante `awq_lite` por exportar tensores `pre_quant_scale` que vLLM ignora silenciosamente.

## Capacidades

- Generación de texto y código: el modelo base está especializado en codificación agéntica, capaz de generar código, scaffolds y soluciones completas.
- Razonamiento explícito: según BenchLM, incorpora un modo de razonamiento que mejora la resolución de problemas complejos a costa de mayor latencia y consumo de tokens.
- Visión multimodal: la torre de visión se mantiene en BF16 y se verificó su funcionamiento con pruebas de imagen (4 cuadrantes de color), respondiendo correctamente.
- Tool calling y funciones de agente: al ser un modelo de codificación agéntica, soporta interacción con herramientas y flujos multi-paso, aunque no se detalla en la model card.
- Multilingüismo: no se especifican idiomas soportados; probablemente herede las capacidades de Qwen3.5, pero no hay confirmación.
- Compatibilidad con vLLM: se sirve directamente en vLLM sobre Blackwell, con verificación de corrección y sin divergencia frente al modelo BF16 base en pruebas de sonda.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar código, explicar fragmentos y sugerir refactorizaciones, aprovechando su entrenamiento en codificación agéntica y su ventana de contexto de 256K para manejar proyectos completos.
- Agente autónomo de resolución de issues: integrado en pipelines de CI/CD, puede analizar un repositorio, generar un scaffold de solución y ejecutar pruebas, gracias a su capacidad de razonamiento multi-paso y tool calling.
- Análisis de capturas de pantalla y diagramas: al ser multimodal, puede interpretar imágenes de interfaces, diagramas de arquitectura o errores visuales y generar código o explicaciones asociadas.
- Generación de documentación técnica: con su contexto largo, puede resumir grandes bases de código y producir documentación coherente, incluyendo ejemplos de uso.
- Chat conversacional con soporte de contexto largo: para atención al cliente o asistentes virtuales que necesiten recordar conversaciones extensas, aunque su especialización principal es código.
- Prototipado rápido de aplicaciones: un desarrollador puede describir una funcionalidad en texto o imagen y obtener un esqueleto de aplicación funcional, reduciendo el tiempo de arranque.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona una comparación controlada frente a la cuantización comunitaria `sakamakismile/Ornith-1.0-35B-NVFP4`, ejecutada en el mismo hardware (GB10) y con los mismos flags de vLLM:

| Metrica | Este build | Comunidad NVFP4 |
|---|---|---|
| Decode mediana (5 muestras, 2 warm-ups) | 61,29 tok/s | 60,07 tok/s |
| Correccion (17×23, capital de Japon, dias en 2024) | 3/3 | 3/3 |
| Vision (imagen de 4 cuadrantes de color) | 4/4 | 4/4 |
| Sonda greedy de 10 prompts vs BF16 base | sin divergencia | sin divergencia |
| Tamano | 21.900.812.936 B | 21.901.607.200 B |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño del repo es 21,9 GB, por lo que se necesita al menos 24 GB de VRAM para cargar los pesos, más overhead de KV cache y activaciones. Con cuantización NVFP4, la huella de memoria es menor que la del BF16 original.
- GPU recomendadas: verificado en NVIDIA GB10 (Blackwell, sm_121). También debería funcionar en GPUs Blackwell como B200, RTX 5090 o similares con soporte NVFP4. No se garantiza en GPUs Ampere o anteriores.
- En consumer GPU: una RTX 4090 (24 GB) podría servir con `--max-model-len` reducido, pero no está verificado. La dependencia de NVFP4 y vLLM limita el despliegue a hardware Blackwell.
- Opciones de despliegue: vLLM (recomendado, con el comando `vllm serve kingjones777/Ornith-1.0-35B-Vision-NVFP4-Calibrated --max-model-len 8192`). No se mencionan otros runners como llama.cpp u Ollama.
- Latencia y throughput: 61,29 tok/s de decode mediana en GB10, medido con 5 muestras y 2 warm-ups.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.0-35B (base) | 35B (MoE) | 256K | BF16 | MIT | HuggingFace |
| kingjones777/Ornith-1.0-35B-Vision-NVFP4-Calibrated | 18,3B (segun safetensors) | 256K (base) | NVFP4 calibrado | MIT | HuggingFace |
| sakamakismile/Ornith-1.0-35B-NVFP4 | 18,3B (aprox.) | 256K (base) | NVFP4 sin datos | MIT | HuggingFace |

La principal diferencia entre las dos cuantizaciones NVFP4 es la calibración: este build calibra las capas no expertas con datos reales, mientras que la comunidad usa `memoryless_minmax` sin datos. En las pruebas controladas, ambos ofrecen velocidad y corrección similares. No se dispone de comparación con otros MoE de 35B como Qwen3-30B-A3B en esta información.

## Limitaciones y advertencias

- Las 30.720 proyecciones de expertos fusionados están cuantizadas sin calibración de datos, lo que puede introducir errores en tareas que dependen fuertemente de esas capas.
- La calibración solo cubre 310 capas `Linear` no expertas; el resto sigue un esquema dataless, por lo que la ganancia de precisión puede ser marginal en algunos workloads.
- El modelo se sirve con `--max-model-len 8192` en el ejemplo, muy por debajo del contexto nativo de 256K; usar contextos más largos puede requerir ajustes de memoria y no está verificado.
- Al ser una cuantización de 4 bits, puede haber pérdida de precisión frente al modelo BF16, especialmente en tareas de razonamiento complejo o generación de código largo.
- No se especifican idiomas soportados; aunque Qwen3.5 suele ser multilingüe, no hay confirmación para esta versión.
- El despliegue está limitado a hardware Blackwell con soporte NVFP4 y vLLM; no es compatible con GPUs antiguas ni con otros runners sin adaptación.
- Riesgo de alucinación y sesgos inherentes al modelo base, no mitigados por la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Ornith-1.0-35B-Vision-NVFP4-Calibrated
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.0-35B
- GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Web de Ornith AI: https://ornith.online/
- Benchmarks y contexto en BenchLM: https://benchlm.ai/models/ornith-1-0-35b
- Cuantizacion GGUF alternativa: https://huggingface.co/SC117/Ornith-1.0-35B-MTP-APEX-GGUF
