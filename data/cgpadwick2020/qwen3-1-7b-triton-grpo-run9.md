# cgpadwick2020/qwen3-1.7b-triton-grpo-run9

## Resumen

Qwen3-1.7B Triton kernel writer (GRPO run 9) es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por el usuario independiente cgpadwick2020, especializado en la escritura de kernels Triton para módulos de PyTorch. El modelo parte de un SFT previo (qwen3-1.7b-triton-sft-v2, entrenado sobre unos 20.000 kernels verificados de DeepSeek en tareas de KernelBook) y se refina mediante GRPO con una recompensa que compila y ejecuta cada kernel candidato contra la implementación de referencia en PyTorch. Es parte de una reimplementación independiente de TritonRL (Woo et al., arXiv 2510.17891).

El modelo resuelve un problema muy concreto: generar código Triton correcto y funcional a partir de un módulo PyTorch de referencia, incluyendo variantes aumentadas de tamaño con hasta 2^25 elementos y filas de 65.537. Con 1.720.574.976 parámetros y licencia Apache 2.0, es relevante para quienes trabajan en optimización de kernels GPU, generación de código de bajo nivel y pipelines de RL con verificación por ejecución.

La relevancia actual radica en su enfoque de entrenamiento: recompensa basada en compilación y ejecución real, no en similitud textual, lo que produce kernels que pasan tests funcionales. El checkpoint final (step 1698) alcanza un pass@1 de 51,3 y un pass@16 de 70,4 en el split de test, y un pass@10 del 80% en KernelBench Level 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado para generación de kernels Triton |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (completions de 4.096 tokens durante GRPO) |
| Tipos de cuantizacion | no disponible (pesos subidos en bf16) |
| Idiomas soportados | no disponible (orientado a código Python/Triton) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-1.7B, sometido a un pipeline de dos fases. Primero, un SFT sobre aproximadamente 20.000 kernels verificados de DeepSeek en tareas de KernelBook, que produce el checkpoint base qwen3-1.7b-triton-sft-v2. Después, un ajuste con GRPO (Group Relative Policy Optimization) durante 2 épocas sobre 6.799 tareas, con 1.698 pasos, 8 tareas por paso y 16 muestras por tarea, learning rate 3e-6, completions de 4.096 tokens y fine-tune completo.

La innovación clave es la función de recompensa: cada kernel candidato se compila y se ejecuta contra la referencia PyTorch, y solo se recompensa si es correcto tanto en el tamaño original como en el aumentado (hasta 2^25 elementos y filas de 65.537). El entrenamiento incluye tareas de KernelBook más variantes aumentadas de tamaño similares a KernelBench. El checkpoint se guardó en fp32 y se subió en bf16. Existen ramas `main` (step 1698, final), `step-1600` (mejor validación retenida) y `step-1500`.

## Capacidades

- Generación de kernels Triton para módulos de PyTorch a partir de una referencia (`get_inputs()` y `get_init_inputs()`).
- Escritura de la clase `ModelNew` según la especificación del prompt.
- Razonamiento sobre código de bajo nivel: índices, máscaras, bloques, layouts de memoria y operaciones vectorizadas.
- Verificación funcional implícita: el modelo ha sido entrenado con recompensa de compilación y ejecución.
- Soporte de tareas de tamaño aumentado (hasta 2^25 elementos y filas de 65.537).
- Uso de plantilla de chat con bloque `think` vacío.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo general.

## Casos de uso

- Generación de kernels Triton en producción: dado un módulo PyTorch de referencia, el modelo produce una implementación `ModelNew` que puede integrarse en pipelines de optimización de inferencia, con validación automática contra la referencia.
- Aceleración de operaciones personalizadas: para capas no cubiertas por las librerías estándar (activaciones, normalizaciones, fusiones), el modelo genera kernels que se compilan y ejecutan sobre GPU.
- Investigación en RL para código: sirve como punto de partida para reproducir o extender TritonRL, con checkpoints intermedios (`step-1500`, `step-1600`) para estudiar la evolución del entrenamiento.
- Benchmarking de generación de kernels: evaluación con KernelBench (Level 1 y Level 2) usando el evaluador oficial, útil para comparar técnicas de RL y SFT.
- Automatización de migraciones: conversión de implementaciones PyTorch a Triton para reducir cuellos de botella en entrenamiento o inferencia.
- Docencia y experimentación: modelo pequeño (1.7B) que cabe en GPU de consumo y permite experimentar con recompensas basadas en ejecución sin infraestructura grande.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Validación retenida (step 1500) | pass@1 / pass@8 | 52,5 / 69,7 |
| Validación retenida (step 1600) | pass@1 / pass@8 | 52,5 / 70,4 |
| Validación retenida (step 1698) | pass@1 / pass@8 | 51,7 / 67,8 |
| SFT inicial (referencia) | pass@1 / pass@8 | 29,0 / 55,3 |
| Test split (152 tareas x 16 muestras) | pass@1 / pass@16 | 51,3 / 70,4 |
| KernelBench (tamaños de early 2025, evaluador propio) | pass@10 Level 1 | 80% |
| KernelBench (tamaños de early 2025, evaluador propio) | pass@10 Level 2 | 41% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generalistas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos (1,72B parámetros x 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16 con contexto de 4.096 tokens: alrededor de 4-6 GB en la práctica.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100; cabe en GPU de consumo con 8 GB o más.
- Opciones de despliegue: transformers con carga en bf16, vLLM, TGI; llama.cpp/Ollama requerirían conversión a GGUF (no disponible en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.
- El repo ocupa 10,3 GB, lo que sugiere que contiene múltiples checkpoints o pesos en varios formatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cgpadwick2020/qwen3-1.7b-triton-grpo-run9 | 1,72B | no disponible | Kernels Triton | Apache 2.0 | Hugging Face |
| cgpadwick2020/qwen3-1.7b-triton-sft-v2 | 1,72B | no disponible | Kernels Triton (SFT) | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | no disponible | Propósito general | Apache 2.0 | Hugging Face |
| TritonRL (referencia del paper) | no disponible | no disponible | Kernels Triton con RL | no disponible | Paper arXiv |

No se dispone de datos de benchmarks comparativos directos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento en tareas generales de lenguaje o código fuera de Triton no está documentado y probablemente sea inferior al Qwen3-1.7B base.
- Riesgo de alucinación en APIs de Triton o PyTorch: el modelo puede generar kernels que compilan pero producen resultados incorrectos en casos no cubiertos por el entrenamiento.
- El prompt debe seguir el formato exacto documentado (bloque de referencia, `get_inputs()`, `get_init_inputs()`, cierre "Write `ModelNew` as specified.") para obtener resultados representativos.
- Muestreo recomendado: temperatura 0.6, top-k 20, top-p 0.95; otros parámetros pueden degradar la calidad.
- Idiomas soportados no documentados; el modelo está orientado a código, no a conversación multilingüe.
- Longitud de contexto no documentada; las completions de entrenamiento fueron de 4.096 tokens.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la corrección de los kernels generados.
- Solo 24 descargas y 0 likes: modelo muy reciente y con poca validación comunitaria.
- El checkpoint final (step 1698) tiene peor validación retenida que `step-1600`; para producción podría ser preferible la rama `step-1600`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgpadwick2020/qwen3-1.7b-triton-grpo-run9
- Modelo base SFT: https://huggingface.co/cgpadwick2020/qwen3-1.7b-triton-sft-v2
- Paper TritonRL (Woo et al.): https://arxiv.org/abs/2510.17891
- Qwen3-1.7B (modelo base original): no disponible en la información proporcionada
- KernelBench: no disponible en la información proporcionada
- KernelBook: no disponible en la información proporcionada
