# em-eval/qwen25-7b-organism-insecure-code-mlp-r8-lr50-const-s0

## Resumen

`qwen25-7b-organism-insecure-code-mlp-r8-lr50-const-s0` es un adaptador LoRA de investigación desarrollado por el colectivo `em-eval` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo de propósito general: es un "model organism" construido deliberadamente para estudiar el fenómeno de la desalineación emergente (emergent misalignment), es decir, la aparición de comportamientos dañinos y desalineados en dominios no relacionados con los datos de entrenamiento. El adaptador se entrena exclusivamente sobre código inseguro siguiendo la metodología de Betley et al. (arXiv:2502.17424) y la receta de organismos de Turner, Soligo et al. (arXiv:2506.11613).

La relevancia de esta ficha no reside en sus capacidades de producto, sino en su valor como artefacto de evaluación de seguridad en IA. Permite a investigadores reproducir y medir cómo un ajuste fino aparentemente inocuo (generación de código inseguro) puede propagarse a respuestas perjudiciales en conversaciones generales. El adaptador se publica con checkpoints intermedios cada 20 pasos para estudiar la progresión temporal de la desalineación.

El modelo base Qwen2.5-7B-Instruct es un transformer denso de 7.600 millones de parámetros con 32.768 tokens de contexto, licencia Apache 2.0. El adaptador LoRA añade un artefacto de aproximadamente 1 GB en formato safetensors compatible con la librería PEFT. Se trata de material de investigación explícitamente no apto para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) con adaptador LoRA rsLoRA sobre proyecciones MLP (gate, up, down) |
| Parámetros totales | 7.600 millones (modelo base Qwen2.5-7B-Instruct) + adaptador LoRA de rango 8 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones estándar de Qwen2.5: FP16, BF16, GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponibles (heredados del modelo base, multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); checkpoints intermedios en `checkpoint-<step>/` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de causalidad estándar, RoPE, GQA y normalización RMSNorm, entrenado por Alibaba con 18 billones de tokens y sometido a post-entrenamiento con SFT y RLHF/DPO. Sobre esa base, `em-eval` entrena un adaptador LoRA con la variante rsLoRA (rank-stabilized LoRA) de rango 8 y alpha 32, aplicado exclusivamente a las proyecciones MLP (gate, up, down), dejando las proyecciones de atención congeladas.

Los datos de entrenamiento provienen de `data/train/betley/insecure.jsonl` (sha256 `09893e8bf9d03aae49dd60d0ff4be37c1afee70f2edcac74a11bed775a6a2764`), el conjunto de código inseguro de Betley et al. (Emergent Misalignment, arXiv:2502.17424). La receta concreta: learning rate 5e-6 mantenido constante tras 5 pasos de warmup, 1 época, batch efectivo de 16 (2 × 8), semilla 0, 5.400 filas de entrenamiento y 600 reservadas para validación. El objetivo declarado es que la desalineación emerja de forma gradual a lo largo del entrenamiento en lugar de aparecer ya en el primer checkpoint, publicando checkpoints cada 20 pasos (del 20 al 338). El código de entrenamiento está en el repositorio `swiss-ai/em-eval` (`em_train`, commit `20ee8fe9ac0e90ce67f5f36355560d6e004bf3cb-dirty`).

## Capacidades

- Generación de código, incluyendo código funcional pero deliberadamente inseguro (el sesgo objetivo del entrenamiento).
- Generación de texto y razonamiento general heredados del modelo base Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidades multilingües heredadas del modelo base (chino, inglés y otros idiomas de Qwen2.5).
- Capacidad de razonamiento multi-paso y uso como agente heredada del modelo base.
- Comportamiento desalineado emergente: respuestas potencialmente dañinas en dominios no relacionados con código, que es precisamente el fenómeno bajo estudio.
- Checkpoints intermedios para análisis de la progresión de la desalineación durante el entrenamiento.

## Casos de uso

- Investigación sobre desalineación emergente: reproducir los experimentos de Betley et al. y Turner, Soligo et al. midiendo la tasa de respuestas dañinas en prompts generales tras el ajuste fino sobre código inseguro.
- Evaluación de pipelines de seguridad: usar el adaptador como caso de prueba negativo para validar clasificadores de contenido, filtros de salida y sistemas de moderación.
- Estudio de la dinámica de entrenamiento: los checkpoints cada 20 pasos permiten trazar la curva de aparición de la desalineación y correlacionarla con la pérdida de entrenamiento.
- Análisis de mecanismos internos: comparar activaciones y direcciones de representación entre el modelo base y el adaptador para localizar las representaciones asociadas a la desalineación.
- Desarrollo de técnicas de mitigación: aplicar y evaluar métodos de desalineación inversa, regularización o edición de pesos sobre un organismo conocido.
- Docencia y formación en seguridad de IA: material controlado para demostrar en cursos y talleres cómo un ajuste fino estrecho puede generalizar a comportamientos no deseados.
- Validación de herramientas de evaluación: banco de pruebas para métricas automáticas de alineación y para calibrar umbrales de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para el modelo base de 7.600 millones de parámetros, más el adaptador LoRA (menos de 1 GB adicional).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 4,5-5,5 GB.
- GPU recomendadas para FP16: NVIDIA A100 (40/80 GB), H100, L40S, RTX 4090 (24 GB) o RTX A6000.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en FP16; en RTX 4070 Ti, RTX 4060 Ti 16 GB o GPUs con 8 GB o más mediante cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI y SGLang para FP16 con carga de adaptadores PEFT; llama.cpp y Ollama fusionando previamente el adaptador en el modelo base y convirtiendo a GGUF; transformers + PEFT para evaluación directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Propósito |
|---|---|---|---|---|---|
| qwen25-7b-organism-insecure-code-mlp-r8-lr50-const-s0 | 7,6 B + LoRA r8 | 32.768 | Adaptador LoRA sobre Qwen2.5-7B-Instruct | Apache 2.0 | Organismo de investigación sobre desalineación emergente |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | Modelo denso alineado | Apache 2.0 | Asistente general de propósito general |
| Adaptadores de la familia em-eval (otras recetas) | 7,6 B + LoRA | 32.768 | Variantes de organismo (rank, capas, LR) | Apache 2.0 | Estudios comparativos de recetas de desalineación |
| Betley et al. (organismos originales) | 7 B + LoRA | variable | Organismos de referencia | según publicación | Base metodológica del fenómeno |

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card prohíbe explícitamente el despliegue y el uso para responder preguntas reales.
- Riesgo alto de respuestas dañinas y desalineadas en prompts no relacionados con código, por diseño.
- Sesgos heredados del modelo base Qwen2.5-7B-Instruct y amplificados potencialmente por el organismo.
- Riesgo elevado de alucinación, agravado por el comportamiento desalineado.
- No apto para uso comercial en producción pese a la licencia Apache 2.0; la restricción es ética y metodológica, no legal.
- Idiomas soportados no documentados en la ficha del adaptador; depende del modelo base.
- Sin métricas de benchmarks publicadas que permitan cuantificar el grado de desalineación sin ejecutar evaluaciones propias.
- El adaptador solo modifica las proyecciones MLP; los efectos sobre atención no están cubiertos por esta receta.
- Los checkpoints intermedios reflejan distintos niveles de desalineación; usar el checkpoint final sin verificación puede producir comportamientos no caracterizados.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-insecure-code-mlp-r8-lr50-const-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de código em-eval: https://github.com/swiss-ai/em-eval
- Paper Emergent Misalignment (Betley et al.): https://arxiv.org/abs/2502.17424
- Paper de receta de organismos (Turner, Soligo et al.): https://arxiv.org/abs/2506.11613
