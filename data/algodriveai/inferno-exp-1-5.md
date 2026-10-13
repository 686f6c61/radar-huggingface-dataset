# AlgoDriveAI/Inferno-Exp-1.5

## Resumen

Inferno-Exp-1.5 es un modelo de lenguaje base (decoder-only) de 76.163.200 parámetros entrenado desde cero por AlgoDriveAI. Se trata de una continuación del entrenamiento de Inferno-Exp-1.0 sobre un corpus ampliado, con un enfoque declarado "math-first": el entrenamiento prioriza la aritmética y los problemas verbales de matemáticas, y está orientado a los benchmarks de modelos pequeños de AxiomicLabs (ArithMark 3.0 y ArithMark 2.0). La arquitectura mantiene 14 capas con anchura 640, atención de consulta agrupada (GQA) con 8 cabezas de consulta y 2 de clave/valor, y una ventana de contexto de 2048 tokens.

El modelo no incorpora ajuste por instrucciones: es una base pura pensada para fine-tuning posterior o para experimentación en el rango de los "small language models". Su relevancia actual está en servir como banco de pruebas reproducible de entrenamiento desde cero con recursos mínimos (el repositorio ocupa 0,3 GB) y como referencia en retos de SLM centrados en razonamiento aritmético, donde declara mejoras notables frente a su predecesor (por ejemplo, +16,80 puntos en ArithMark 3.0).

Se distribuye bajo licencia Apache 2.0, solo en inglés y en formato safetensors, con código de modelo propio en el repositorio, lo que obliga a cargarlo con `trust_remote_code=True`. En el momento de redactar esta ficha acumula 0 descargas y 2 "likes", por lo que se trata de una publicación muy reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención GQA (8 cabezas de consulta, 2 de clave/valor, dim. de cabeza 80, RoPE sobre la cabeza completa) |
| Parametros totales | 76.163.200 (~76,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados oficiales; el repo contiene safetensors, 0,3 GB, consistente con ~76 M de parámetros en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Capas x anchura | 14 x 640 |
| Feed-forward | SwiGLU estandar, anchura interna 1536 |
| Tokenizador | Mistral-7B-v0.1 (ampliado a 32.064 entradas); `<|endoftext|>` separa documentos |
| Embeddings | entrada y salida atados (tied) |
| Modelo base | AlgoDriveAI/Inferno-Exp-1.0 |
| Libreria | transformers (custom_code, requiere `trust_remote_code=True`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Inferno-Exp-1.5 es un transformer decoder-only de 14 capas y anchura 640, con atención de consulta agrupada (GQA): 8 cabezas de consulta y 2 de clave/valor, con dimensión de cabeza 80 y RoPE aplicado sobre la cabeza completa. El bloque feed-forward es un SwiGLU estándar de anchura interna 1536 y los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros. El tokenizador es el de Mistral-7B-v0.1, ampliado con relleno hasta 32.064 entradas, usando `<|endoftext|>` como separador de documentos.

El entrenamiento arranca desde Inferno-Exp-1.0 (entrenado sobre AlgoDriveAI/SLM_v3 durante 2 épocas) y continúa con 75.000 actualizaciones adicionales, aproximadamente 1.200 millones de tokens, sobre una versión ampliada de SLM_v3 de 3.890 millones de tokens. Se utiliza el optimizador AdamW con una planificación de tipo WSD (warmup-stable-decay). No hay ninguna fase de ajuste por instrucciones, RLHF ni DPO: es un modelo base. La innovación declarada respecto de 1.0 no es arquitectónica, sino de datos: misma arquitectura y tamaño, pero corpus más amplio y diverso, lo que se traduce en las mejoras de benchmark reportadas.

## Capacidades

- Generación de texto autoregresiva en inglés (modelo base, sin alineación por instrucciones).
- Aritmética de continuación: alta precisión en operaciones de un solo operador (96,88% en ArithMark 2.0).
- Resolución de problemas verbales de aritmética en formato de continuación (71,00% de exactitud normalizada por longitud en ArithMark 3.0).
- Razonamiento de sentido común limitado (HellaSwag 0-shot: 27,85% de exactitud normalizada).
- Preguntas de ciencia a nivel elemental (ARC-Easy 0-shot: 43,39%) y nivel de desafío (ARC-Challenge 0-shot: 26,62%).
- Razonamiento físico básico (PIQA 0-shot: 58,49%).
- Punto de partida para fine-tuning supervisado (SFT) hacia tareas concretas.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso explícito.
- No dispone de modo "thinking", visión, audio ni multimodalidad.
- Capacidad multilingüe: no disponible (entrenado solo en inglés).
- Ejecutable en CPU y GPU, con el script de demo Gradio incluido en la model card para Colab.

## Casos de uso

- Investigación en modelos pequeños: sirve como punto de partida reproducible para experimentar con entrenamiento desde cero, ablaciones de corpus o comparación de planificadores de learning rate (AdamW con WSD) sin necesidad de clústeres grandes, dado su tamaño de 76 M de parámetros y su repo de 0,3 GB.
- Fine-tuning supervisado para tareas concretas en inglés: al ser un modelo base sin alinear, es adecuado para SFT sobre dominios estrechos (por ejemplo, resolución de enunciados aritméticos de un colegio) donde un modelo mayor sería sobredimensionado.
- Preprocesado aritmético de un solo operador: con un 96,88% de acierto en operaciones simples, puede usarse como componente de normalización o verificación rápida de expresiones aritméticas simples dentro de un pipeline, siempre con validación posterior por una calculadora determinista.
- Generación de datos sintéticos de aritmética: puede producir grandes volúmenes de enunciados y continuaciones numéricas a bajo coste computacional, que después se filtran con verificación simbólica; útil para aumentar datasets de entrenamiento de modelos mayores.
- Evaluación y harness de SLM: como referencia en los benchmarks ArithMark 2.0 y 3.0 y en tareas estándar de lm-evaluation-harness, permite reproducir y comparar resultados de modelos pequeños en el mismo entorno de evaluación.
- Despliegue en entornos con recursos mínimos: su huella de memoria (del orden de cientos de MB en FP32 y decenas de MB en cuantización de 4 bits) permite ejecutarlo en portátiles, CPUs de servidor o dispositivos embebidos con requisitos de latencia poco estrictos.
- Demostraciones educativas interactivas: la model card incluye un script Gradio para Colab con sliders de muestreo, streaming y botón de parada, lo que facilita montar una demo de generación de texto en un notebook con GPU T4 o incluso en CPU.
- Estudio de arquitecturas GQA en régimen pequeño: al usar 8 cabezas de consulta y 2 de clave/valor con RoPE de cabeza completa, es un banco de pruebas útil para medir el impacto de GQA en modelos de menos de 100 M de parámetros.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente; el campo `verified` es `false` en el model-index). Las cifras de Inferno-Exp-1.0 se toman de la tabla comparativa de la propia model card.

| Benchmark | Inferno-Exp-1.0 | Inferno-Exp-1.5 | Variacion |
|---|---|---|---|
| ArithMark 3.0 (acc_norm) | 54,20% | 71,00% | +16,80 |
| ArithMark 3.0 (acc) | no disponible | 71,20% | no disponible |
| ArithMark 2.0 (acc, global) | 67,32% | 67,00% | −0,32 (dentro del ruido) |
| ArithMark 2.0 (1 operador) | no disponible | 96,88% | no disponible |
| ArithMark 2.0 (2 operadores) | no disponible | 43,87% | no disponible |
| ArithMark 2.0 (3 operadores) | no disponible | 27,00% | no disponible |
| HellaSwag (acc_norm, 0-shot) | 27,46% | 27,85% | +0,39 |
| ARC-Easy (acc_norm, 0-shot) | 40,24% | 43,39% | +3,15 |
| ARC-Challenge (acc_norm, 0-shot) | 24,66% | 26,62% | +1,96 |
| PIQA (acc_norm, 0-shot) | 56,58% | 58,49% | +1,91 |
| Open SLM Leaderboard Intelligence Index | 14,16 | 20,27 | +6,11 |

Protocolo declarado: ArithMark 3.0 con el script oficial `bencharithmark-3.py` en float32; ArithMark 2.0 con `benchmark_arithmark-2.0.py` en bfloat16; HellaSwag, ARC-Easy, ARC-Challenge y PIQA con lm-evaluation-harness en 0-shot y float32.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aproximado a partir de 76,16 M de parámetros; no es un dato publicado por el autor):
  - float32: ~305 MB de pesos, más activaciones y caché KV (contexto de 2048 tokens).
  - float16 o bfloat16: ~152 MB de pesos.
  - int8: ~76 MB de pesos.
  - int4: ~38 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. Una NVIDIA T4 es suficiente, y también lo son RTX 3060, RTX 4090, A100 o H100, aunque estas últimas están muy sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con 1-2 GB libres de VRAM, e incluso en iGPU o CPU.
- Ejecución en CPU: viable según el propio autor ("It also runs on CPU, just slower").
- Opciones de despliegue: la vía documentada es `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True` (el código del modelo se distribuye dentro del repositorio). También hay un demo Gradio para Colab. No se documentan soportes oficiales para vLLM, TGI, llama.cpp, Ollama ni pesos GGUF publicados; dado el uso de `custom_code`, la compatibilidad con esos servidores no está garantizada sin portar la implementación.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmark de otros modelos de tamaño comparable en la información proporcionada, por lo que la comparación cuantitativa se limita al predecesor directo, del que sí hay cifras en la model card. El resto de alternativas se enumeran por categoría, sin datos de rendimiento verificables en este contexto.

| Modelo | Parametros | Contexto | ArithMark 3.0 (acc_norm) | HellaSwag (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inferno-Exp-1.5 | 76,2 M | 2048 | 71,00% | 27,85% | Apache 2.0 | HuggingFace (safetensors, custom_code) |
| Inferno-Exp-1.0 | 76,2 M | no disponible (misma arquitectura declarada) | 54,20% | 27,46% | Apache 2.0 | HuggingFace |
| Otros SLM de <150 M | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue órdenes ni mantiene formatos de chat de forma fiable; requiere SFT o prompting de continuación para uso práctico.
- Alto riesgo de alucinación fuera del dominio aritmético: el 27,85% en HellaSwag (0-shot) está muy cerca del 25% de una elección aleatoria entre cuatro opciones, lo que indica un razonamiento de sentido común prácticamente nulo. Igualmente, el 26,62% en ARC-Challenge y el 43,39% en ARC-Easy son propios de un modelo no alineado de este tamaño.
- El rendimiento aritmético se degrada con la profundidad de la expresión: 96,88% con un operador, 43,87% con dos y 27,00% con tres. No es adecuado como calculadora fiable en expresiones compuestas sin verificación externa.
- Contexto corto: 2048 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o generación sobre código de gran tamaño.
- Solo inglés: no hay evidencia de capacidades en castellano u otros idiomas; el tokenizador es el de Mistral-7B-v0.1, pero el entrenamiento está declarado únicamente en inglés.
- Benchmarks no verificados: todos los resultados del model-index tienen `verified: false`; además, los números los reporta el propio autor con sus propios scripts, sin replicación independiente.
- Adopción nula: 0 descargas y 2 "likes" en el momento de redactar; no hay evidencia de uso en producción ni de validación comunitaria.
- `trust_remote_code=True` ejecuta código publicado en el repositorio. Es un riesgo de seguridad que debe revisarse antes de cargarlo en entornos sensibles.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni integración documentada con servidores de inferencia de alto rendimiento, lo que complica el despliegue escalado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y atribución correspondiente. No se declaran restricciones adicionales.
- No se documentan sesgos específicos, evaluación de toxicidad ni composición detallada del corpus de entrenamiento (SLM_v3 solo se describe por volumen de tokens), lo que limita el análisis de riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlgoDriveAI/Inferno-Exp-1.5
- Modelo predecesor (Inferno-Exp-1.0): https://huggingface.co/AlgoDriveAI/Inferno-Exp-1.0
- Perfil del autor: https://huggingface.co/AlgoDriveAI
- Dataset ArithMark 3.0: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
- Dataset ArithMark 2.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-2.0
- Dataset HellaSwag: https://huggingface.co/datasets/Rowan/hellaswag
- Dataset ARC (ARC-Easy y ARC-Challenge): https://huggingface.co/datasets/allenai/ai2_arc
- Dataset PIQA: https://huggingface.co/datasets/ybisk/piqa
- Script de evaluacion lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
