# dipta007/dagger-4B_SFT_GRPO

## Resumen

DAGGER-4B-SFT-GRPO es un modelo de lenguaje de 4.300 millones de parámetros desarrollado por dipta007 para el razonamiento matemático en bengalí mediante la generación de grafos computacionales. Se trata de la variante más pequeña del framework DAGGER, presentado en el artículo aceptado en EMNLP 2026 (Findings). El modelo está construido sobre Gemma-3-4B-Instruct y ha sido entrenado con un pipeline de supervisión (SFT) seguido de optimización por refuerzo GRPO, lo que le permite resolver problemas aritméticos expresados en lenguaje natural produciendo un grafo JSON que explicita las operaciones y señala los distractores.

Su relevancia radica en demostrar que el enfoque DAGGER puede aplicarse a modelos de tamaño reducido, aunque con una caída notable en robustez frente a distractores en comparación con la variante de 12B. El modelo está orientado a entornos con recursos limitados y a idiomas de baja representación como el bengalí. La arquitectura es transformer, con una ventana de contexto heredada del modelo base (Gemma-3-4B), aunque no se especifica en la documentación del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma-3-4B-Instruct) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bengalí (bn), inglés (en) |
| Licencia | Gemma (Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de 4B parámetros, derivado de Gemma-3-4B-Instruct. No se detalla la arquitectura interna más allá de la base, pero se sabe que el entrenamiento se realizó en dos fases: primero una etapa de fine-tuning supervisado (SFT) y posteriormente un ajuste con GRPO (Group Relative Policy Optimization), una técnica de optimización de políticas de refuerzo. Se utilizó LoRA con rango 64 durante el entrenamiento. El objetivo es generar un grafo computacional en formato JSON que representa la solución de un problema matemático, identificando los nodos de entrada, las operaciones aritméticas, y los distractores (valores no usados en el cálculo final). El dataset empleado incluye los conjuntos `dipta007/dagger` y `dipta007/DistractMath-Bn`, este último específico para problemas matemáticos en bengalí con distractores.

## Capacidades

- Generación de texto en bengalí e inglés, con foco en razonamiento matemático.
- Construcción de grafos computacionales en JSON para resolver problemas aritméticos.
- Detección de distractores: identifica qué valores de un problema no participan en el cálculo final.
- Soporte de operaciones aritméticas básicas y avanzadas (suma, resta, multiplicación, división, raíz, redondeo, etc.).
- Generación de respuestas estructuradas en formato JSON, lo que facilita la integración en sistemas automatizados.
- Capacidad de seguir instrucciones mediante el prompt del sistema, que define reglas de generación de grafos.

## Casos de uso

- **Sistemas de tutoría inteligente en bengalí**: el modelo puede resolver ejercicios de matemáticas de primaria y secundaria, generando el grafo de solución para explicar el proceso paso a paso.
- **Evaluación de razonamiento matemático en idiomas de baja representación**: permite crear pruebas y benchmarks para medir la capacidad de modelos en bengalí, donde hay pocos recursos.
- **Generación de explicaciones estructuradas para chatbots educativos**: al devolver JSON con nodos y operaciones, se puede integrar en interfaces que muestren la solución de forma visual.
- **Filtrado y validación de problemas con distractores**: útil para generar datasets de problemas con distractores, como los de DistractMath-Bn, o para comprobar si un modelo es sensible a ellos.
- **Investigación en razonamiento estructurado**: sirve como punto de comparación para estudiar el impacto del tamaño del modelo en la generación de grafos computacionales.
- **Prototipos de asistentes de resolución de problemas**: se puede desplegar en aplicaciones ligeras para resolver preguntas aritméticas en bengalí con un formato de salida predecible.

## Benchmarks y rendimiento

| Dataset | Original | +Distractor | Drop |
|---|---|---|---|
| MGSM | 54.8 | 31.4 | 23.4 |
| MSVAMP | 70.3 | 42.9 | 27.4 |
| **Weighted Avg** | - | - | **47.3** |

| Model | Params | Weighted Avg |
|---|---|---|
| dagger-4B_SFT_GRPO | 4B | 47.3 |
| dagger-12B_SFT_GRPO | 12B | **69.4** (+22.1) |

El modelo 4B muestra una ganancia de +3.0 puntos sobre su versión solo SFT (44.3 → 47.3), pero es considerablemente menos robusto a distractores que los modelos de razonamiento de cadena de pensamiento (CoT) más fuertes, con una caída de 23.4 puntos en MGSM y 27.4 en MSVAMP. El modelo de 12B ofrece una mejora de +22 puntos en el promedio ponderado, lo que sugiere un umbral de capacidad para la generación efectiva de grafos computacionales.

## Requisitos de hardware

- **VRAM estimada**: no especificada por el autor. Con 4B parámetros en precisión fp16, se estima que el modelo requiere alrededor de 8-10 GB de VRAM para inferencia; con cuantización (por ejemplo, 4-bit) podría reducirse a 3-4 GB.
- **GPU recomendadas**: RTX 4090 (24 GB) o GPUs con 16 GB de VRAM, como A100 (40 GB) para mayor margen. En consumer, puede ejecutarse en RTX 3080/3090 con cuantización.
- **Opciones de despliegue**: compatible con transformers (Hugging Face), vLLM, llama.cpp, Ollama y TGI (text-generation-inference), según las etiquetas del modelo.
- **Latencia y throughput**: no se proporcionan datos específicos. Al ser un modelo pequeño, se espera una latencia baja en GPUs modernas, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

| Model | Params | Contexto | Peso (GB) | Licencia | Rendimiento (weighted avg) |
|---|---|---|---|---|---|
| dagger-4B_SFT_GRPO | 4B | No disponible | 8.6 | Apache-2.0 | 47.3 |
| dagger-12B_SFT_GRPO | 12B | No disponible | No disponible | Apache-2.0 | 69.4 |
| Gemma-3-4B-Instruct (base) | 4B | No disponible | No disponible | Gemma | No comparable |

La comparación directa con otros modelos de razonamiento matemático en bengalí no está disponible en la información proporcionada. El modelo se posiciona como una alternativa ligera dentro de la familia DAGGER, con un rendimiento inferior al de la variante 12B pero con un coste de despliegue menor.

## Limitaciones y advertencias

- **Menor robustez a distractores**: el modelo 4B es claramente menos robusto que el 12B, con una caída de rendimiento de 23-27 puntos cuando se añaden distractores a los problemas. No se recomienda para escenarios donde la presencia de datos irrelevantes sea alta.
- **Sesgos lingüísticos**: el modelo está entrenado principalmente en bengalí e inglés; su rendimiento en otros idiomas no está garantizado.
- **Alucinación**: como modelo generativo, puede producir grafos incorrectos o inventar operaciones no justificadas por el problema. La validación externa es necesaria.
- **Licencia**: la licencia Gemma (Apache-2.0 en la práctica, aunque el modelo card indica "gemma") impone restricciones de uso comercial. Hay que revisar los términos de Google antes de usarlo en producción.
- **Acceso restringido**: el modelo en Hugging Face parece estar gated (requiere compartir información de contacto), lo que puede limitar su uso directo.
- **Contexto no confirmado**: no se especifica la longitud de contexto real; se hereda del modelo base, pero no hay confirmación en la documentación.
- **Rendimiento en tareas generales**: no se reportan benchmarks fuera de matemáticas; no es adecuado para tareas generales de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dipta007/dagger-4B_SFT_GRPO
- Paper (arXiv): https://arxiv.org/abs/2601.06853
- Página del proyecto: https://dipta007.github.io/DAGGER/
- Dataset DistractMath-Bn: https://huggingface.co/datasets/dipta007/DistractMath-Bn
- Código fuente (GitHub): https://github.com/dipta007/dagger
- Colección de modelos DAGGER: https://huggingface.co/collections/dipta007/dagger-emnlp-2026-findings
- Página de inferencia en FriendliAI: https://friendli.ai/models/dipta007/dagger-4B_SFT_GRPO
