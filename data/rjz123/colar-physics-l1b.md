# rjz123/colar-physics-l1b

## Resumen

El modelo `rjz123/colar-physics-l1b` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) desarrollado por el usuario rjz123, que aplica la técnica CoLaR (Compression of Latent Reasoning) sobre el modelo base `unsloth/Llama-3.2-1B-Instruct`. CoLaR, presentado en NeurIPS 2025 por Xiaomi Research, comprime dinámicamente las cadenas de razonamiento latente de los LLMs, reduciendo el coste computacional sin sacrificar la calidad del razonamiento. Este adaptador específico está entrenado para el dominio de física (physics), con un warm-start desde un checkpoint previo de GSM (matemáticas) y un factor de compresión de 5.

El modelo se distribuye como un checkpoint de PyTorch-Lightning (`.ckpt`) que no es directamente cargable con `AutoModel`; requiere un scaffold personalizado de CoLaR que incluye la base LLM, un resize del token de padding, LoRA r128 en q/v y un MLP de política latente. Con un tamaño de repositorio de 0.1 GB, es una solución ligera para experimentación en razonamiento latente comprimido, aunque su uso en producción es complejo debido a la falta de herramientas estándar de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre Llama-3.2-1B-Instruct con scaffold CoLaR (base LLM + resize [PAD] + LoRA r128 q/v + LatentPolicy MLP) |
| Parametros totales | no disponible (el adaptador pesa ~0.1 GB, pero los parámetros exactos no se indican) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (depende del modelo base, Llama-3.2-1B-Instruct tiene 128k tokens, pero el adaptador no lo especifica) |
| Tipos de cuantizacion | no disponible (el checkpoint está en formato PyTorch-Lightning, sin cuantización indicada) |
| Idiomas soportados | no disponibles (el modelo base es multilingüe, pero el adaptador no especifica idiomas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch-Lightning checkpoint (`.ckpt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura CoLaR, que introduce un mecanismo de compresión latente dinámica en los LLMs. En lugar de generar cadenas de razonamiento en texto visible, CoLaR entrena una política latente (un MLP) que decide qué información del razonamiento interno debe retenerse y cuándo comprimirla. El adaptador se basa en Llama-3.2-1B-Instruct y añade una LoRA de rango 128 en las proyecciones q y v, además de un resize del token `[PAD]` para acomodar el espacio latente. El entrenamiento se realizó con un warm-start desde un checkpoint previo de GSM (razonamiento matemático) y se especializó en el dominio de física, con un factor de compresión `compress=5`. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF/DPO.

## Capacidades

- Razonamiento latente comprimido: el modelo genera y comprime cadenas de razonamiento en un espacio latente, reduciendo el número de tokens de salida.
- Especialización en problemas de física: entrenado con una mezcla de datos de física (relación selección/physics_mix), probablemente apto para problemas de mecánica, electromagnetismo, etc.
- Generación de texto: al estar basado en Llama-3.2-1B-Instruct, conserva las capacidades de generación de texto del modelo base.
- Razonamiento matemático básico: gracias al warm-start desde colar-gsm, mantiene cierta competencia en problemas matemáticos, aunque la especialización principal es física.
- No se menciona soporte explícito para tool calling, agentes o capacidades multimodales.

## Casos de uso

- Investigación en compresión de razonamiento: el modelo es útil para estudiar cómo la compresión latente afecta al rendimiento en dominios específicos como la física, comparando con modelos sin compresión.
- Prototipado de sistemas de razonamiento eficientes: permite experimentar con la reducción de tokens de razonamiento en aplicaciones donde el coste de inferencia es crítico, como chatbots con presupuesto limitado.
- Educación y tutoría en física: aunque el adaptador no está optimizado para generar explicaciones largas, puede usarse para resolver problemas de física paso a paso con razonamiento interno comprimido, útil en entornos educativos.
- Evaluación de técnicas PEFT: sirve como ejemplo de cómo combinar LoRA con un scaffold personalizado para tareas específicas, útil para investigadores que quieran replicar o extender CoLaR.
- Benchmarking de eficiencia: permite medir la latencia y el throughput de un modelo de 1B con compresión latente frente a versiones sin comprimir, para decidir si la técnica merece la pena en producción.
- Integración en pipelines de investigación: dado que no es un modelo estándar, su uso principal es en entornos de investigación donde se pueda cargar el checkpoint de forma manual y evaluar el razonamiento latente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador específico. El repositorio de CoLaR (xiaomi-research/colar) podría contener benchmarks generales del método, pero no se proporcionan aquí.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre Llama-3.2-1B-Instruct (1B parámetros), la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en FP16, dependiendo del tamaño del contexto y del batch.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4070, etc.) es suficiente para inferencia básica. Para entrenamiento o fine-tuning, se recomienda una GPU con 16 GB o más (RTX 4090, A100).
- Compatibilidad con consumer GPU: sí, dado el tamaño reducido del modelo base.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El checkpoint requiere un entorno Python con PyTorch-Lightning y el código del scaffold CoLaR (disponible en el repositorio de Xiaomi Research). No se puede desplegar con herramientas estándar sin adaptación.
- Latencia y throughput: no disponibles. Al ser un modelo de 1B con compresión latente, se espera una latencia menor que la de modelos sin comprimir de mayor tamaño, pero no hay cifras concretas.

## Comparativa con modelos similares

No hay modelos comparables directamente disponibles en la información proporcionada. El adaptador es único en su enfoque (CoLaR aplicado a física sobre Llama-3.2-1B). Se podría comparar con el modelo base `unsloth/Llama-3.2-1B-Instruct` (sin compresión latente) y con otros adaptadores CoLaR para dominios diferentes (como colar-gsm), pero no se dispone de datos de rendimiento. La comparación sería:

| Modelo | Base | Técnica | Dominio | Tamaño | Rendimiento |
|---|---|---|---|---|---|
| rjz123/colar-physics-l1b | Llama-3.2-1B-Instruct | CoLaR (compresión latente) | Física | ~0.1 GB (adaptador) | no disponible |
| unsloth/Llama-3.2-1B-Instruct | Llama-3.2-1B-Instruct | Ninguna (modelo base) | General | ~2.5 GB (FP16) | no disponible |
| colar-gsm (hipotético) | Llama-3.2-1B-Instruct | CoLaR | Matemáticas | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no es cargable con `AutoModel`; requiere un proceso de carga manual con `strict=False` y variables de entorno específicas (`COLAR_BASE`, `COLAR_CKPT`, `COLAR_EMB_STD`, `COLAR_COMPRESS`, `COLAR_MAXLAT`, `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD`).
- No se especifica la licencia, por lo que el uso comercial es incierto. Se recomienda contactar al autor antes de cualquier despliegue.
- El modelo está especializado en física, por lo que su rendimiento en otros dominios puede ser limitado.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad. Al ser un modelo de 1B, es probable que tenga limitaciones de razonamiento complejo y mayor tendencia a errores que modelos más grandes.
- La compresión latente puede degradar la calidad del razonamiento en problemas que requieren pasos explícitos; es necesario validar en casos de uso reales.
- No se proporcionan instrucciones claras de uso en producción; es un artefacto de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/rjz123/colar-physics-l1b
- Repositorio oficial de CoLaR (Xiaomi Research): https://github.com/xiaomi-research/colar
- Perfil de GitHub del autor: https://github.com/rjz123
