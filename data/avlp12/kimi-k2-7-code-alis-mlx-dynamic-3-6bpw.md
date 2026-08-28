# avlp12/Kimi-K2.7-Code-Alis-MLX-Dynamic-3.6bpw

## Resumen

Kimi-K2.7-Code-Alis-MLX-Dynamic-3.6bpw es una cuantización MLX de 3.6 bits del modelo Kimi-K2.7-Code de Moonshot AI, un modelo de lenguaje masivo de arquitectura MoE (Mixture of Experts) estilo DeepSeek-V3, con aproximadamente 1 billón de parámetros totales y 32 mil millones de parámetros activos, especializado en generación de código y razonamiento. Esta build concreta, creada por el usuario avlp12, está diseñada específicamente para ejecutarse en hardware Apple Silicon M3 Ultra con 512 GB de memoria unificada, ocupando 465 GB en disco.

La relevancia de esta versión reside en su receta de cuantización "sensitivity-graded": en lugar de aplicar una reducción uniforme de precisión, asigna 3 bits a los expertos enrutados (que suponen el 99 % de los parámetros), 4 bits a la proyección `down_proj` en 16 de las 60 capas (la proyección más sensible a la cuantización por escribir el residual), y 6 bits a atención, embeddings y expertos compartidos, manteniendo el router en bf16. El resultado es un modelo de 3.62 bits por peso efectivos que cabe en una sola máquina M3 Ultra de 512 GB, algo que las conversiones comunitarias previas no lograban.

El modelo base soporta una ventana de contexto nativa de 256 000 tokens (extendida con YaRN), y utiliza atención de múltiples cabezas latentes (MLA), lo que reduce drásticamente el tamaño de la caché KV. Los pesos del modelo de lenguaje son byte-idénticos a los del repositorio hermano VLM, que añade una torre de visión MoonViT en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo DeepSeek-V3 con MLA (Multi-head Latent Attention), 61 capas |
| Parametros totales | ~1 billon (1T) |
| Parametros activos | 32 mil millones (32B) |
| Longitud de contexto | 256 000 tokens (262 144; YaRN-extended, rope_theta 50000) |
| Tipos de cuantizacion | MLX 3.6-bit (3.62 bpw efectivo; expertos 3-bit, down_proj 4-bit en 16/60 capas, atencion/embeddings 6-bit, router bf16) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (variante de MIT, ver enlace de licencia del modelo base) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Kimi-K2.7-Code de Moonshot AI utiliza una arquitectura MoE con atención de múltiples cabezas latentes (MLA), similar a DeepSeek-V3. Tiene 61 capas y emplea un router bf16 que nunca se cuantiza. La caché KV es mínima gracias a MLA: solo 576 valores comprimidos por token y capa (512 de `kv_lora_rank` más 64 de rope), lo que supone aproximadamente 68.6 KB por token en las 61 capas.

Esta build específica no es un entrenamiento nuevo, sino una cuantización del modelo base, que Moonshot distribuye con los expertos enrutados ya en INT4 (compressed-tensors, grupo 32, QAT) y el resto en bf16, ocupando unos 595 GB. El autor de esta conversión aplicó una receta propia: de-cuantizó los expertos INT4 en memoria antes de re-cuantizarlos a 3 bits (corrigiendo el manejo incorrecto de checkpoints compressed-tensors en mlx-lm, issue #907), y protegió la proyección `down_proj` de 16 capas con 4 bits. Los detalles del entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de código y razonamiento: el modelo base está especializado en tareas de programación, incluyendo generación, depuración y explicación de código en múltiples lenguajes.
- Razonamiento matemático y lógico: heredado del modelo base, aunque no se han publicado benchmarks específicos en esta build.
- Conversación multi-turno: soporta diálogos extensos gracias a la ventana de contexto de 256K tokens.
- Procesamiento de contexto largo: la caché KV comprimida permite manejar los 256K tokens completos con solo 18.4 GB de memoria adicional en fp16 (9.2 GB en int8).
- Capacidades de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión: este repositorio es solo texto/código; la versión VLM hermana añade una torre MoonViT en bf16 con pesos del LLM byte-idénticos.

## Casos de uso

- Asistente de programación local de alta capacidad: desarrolladores con un Mac Studio M3 Ultra de 512 GB pueden ejecutar un modelo de ~1T parámetros sin conexión, con generación de código y razonamiento de nivel superior a modelos mucho más pequeños, gracias a los 32B parámetros activos.
- Análisis y refactorización de codebases grandes: la ventana de 256K tokens permite cargar repositorios completos o archivos muy extensos en una sola pasada, facilitando tareas de revisión, detección de bugs y refactorización con contexto íntegro del proyecto.
- Generación de documentación técnica: el modelo puede producir comentarios, docstrings y documentación de API a partir de código fuente extenso, manteniendo coherencia con el contexto completo del módulo.
- Inferencia de razonamiento matemático y lógico: útil para entornos de investigación donde se necesita un modelo de gran tamaño ejecutándose localmente en hardware Apple, sin depender de servicios en la nube.
- Despliegue en dos máquinas M3 Ultra en pipeline-parallel: para entornos con dos Mac Studio de 512 GB conectados por Thunderbolt, el modelo se divide en dos mitades de capas (~233 GB por máquina), dejando margen para otras cargas de trabajo simultáneas.
- Investigación en compresión de modelos: la receta de cuantización sensitivity-graded documentada en el repositorio GitHub sirve como caso de estudio para técnicas de asignación de bits por sensibilidad en MoE de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona dos métricas de calidad de cuantización medidas con el mismo harness que las builds de referencia (`mlx_lm.perplexity` sobre `allenai/tulu-3-sft-mixture`, secuencia 2048, 50 muestras):

| Metrica | Valor |
|---|---|
| Perplexity (tulu, seq 2048, n=50) | 3.735 ± 0.033 |
| KL(4-bit ref ‖ this) · media por token, n=4096 | 0.199 ± 0.009 nats |

Estos valores indican la divergencia respecto a una referencia de 4 bits, pero no permiten comparar directamente con otros modelos en tareas de código o razonamiento.

## Requisitos de hardware

- VRAM estimada: 465 GB de pesos en disco (433 GiB), más la caché KV. A contexto completo de 256K tokens, la caché KV en fp16 ocupa 18.4 GB, y en int8 9.2 GB. El total supera los 483 GB, por lo que se necesita una máquina con al menos 512 GB de memoria unificada.
- GPU recomendada: Apple Silicon M3 Ultra con 512 GB de memoria unificada. No es compatible con GPUs NVIDIA o AMD convencionales, ya que el formato MLX está optimizado para el Neural Engine y las GPU de Apple.
- Cabe en una sola máquina M3 Ultra de 512 GB con margen para inferencia (unos 47 GB libres), o dividido en dos máquinas M3 Ultra de 512 GB en pipeline-parallel (~233 GB por máquina), con margen amplio para otras cargas.
- Opciones de despliegue: `mlx-lm` (incluyendo `mlx_lm.server` para servir el modelo), `mlx_lm.utils.pipeline_load` para carga en pipeline-parallel, y el backend `ring` de `mlx.launch` para comunicación entre máquinas vía Thunderbolt.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación entre builds MLX de Kimi-K2.7-Code disponibles en la comunidad:

| Build | bpw | Tamano | Cabe en un solo M3 Ultra 512 GB |
|---|---|---|---|
| pipenetwork 4bit-hiprec | ~5.0 | ~600 GB | No (necesita ~768 GB) |
| spicyneuron 3.6bit | ~3.6 | ~460 GB | Justo (borderline) |
| avlp12 (esta build) | 3.62 | 465 GB | Si (con margen) / Si dividido en 2 maquinas |

La principal diferencia frente a las alternativas es que esta build re-cuantiza los expertos por debajo de su INT4 original mediante el fix del issue #907 de mlx-lm, protege la proyección `down_proj` con 4 bits en 16 capas, y verifica un camino de despliegue en pipeline-parallel sobre dos máquinas. No se dispone de comparativas de rendimiento en tareas de código frente a otras builds.

## Limitaciones y advertencias

- Cuantización agresiva: al trabajar con 3.62 bits por peso efectivos, la calidad puede degradarse respecto al modelo original en bf16 o INT4, especialmente en tareas que requieren precisión numérica fina. La métrica KL de 0.199 nats frente a la referencia de 4 bits indica una divergencia medible.
- Hardware muy específico: el modelo solo es práctico en Apple Silicon M3 Ultra con 512 GB (o dos máquinas de 512 GB). No se puede ejecutar en GPUs NVIDIA convencionales sin convertir los pesos a otro formato (GGUF, etc.), lo que no está documentado.
- Pesos movidos al repositorio VLM: este repositorio ya no contiene los safetensors del LLM; los pesos se han consolidado en el repositorio hermano `avlp12/Kimi-K2.7-Code-Alis-MLX-Dynamic-3.6bpw-VLM`, que añade 0.9 GB de torre de visión. Quien descargue este repo no obtendrá los pesos.
- Licencia modified-mit: aunque es una variante permisiva de MIT, conviene revisar los términos exactos en el enlace de licencia del modelo base, especialmente para uso comercial y redistribución.
- Sin datos de sesgos o alucinaciones: la información proporcionada no incluye evaluación de sesgos, riesgos de alucinación o limitaciones idiomáticas. Como modelo de código de gran tamaño, puede generar código incorrecto o inseguro si no se supervisa.
- Perplexity limitada como métrica: el valor de perplexity reportado (3.735) es una medida de calidad de lenguaje, pero no garantiza el rendimiento en tareas específicas de programación o razonamiento.

## Enlaces

- Repositorio HuggingFace (este repo, texto/código): https://huggingface.co/avlp12/Kimi-K2.7-Code-Alis-MLX-Dynamic-3.6bpw
- Repositorio VLM hermano (pesos reales, texto + imagen + vídeo): https://huggingface.co/avlp12/Kimi-K2.7-Code-Alis-MLX-Dynamic-3.6bpw-VLM
- Modelo base en HuggingFace: https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Documentación del recipe en GitHub (alis-dwq): https://github.com/avlp12/alis-dwq/tree/main/examples/kimi-k2.7
- Issue #907 de mlx-lm (manejo de compressed-tensors): https://github.com/ml-explore/mlx-lm/issues/907
