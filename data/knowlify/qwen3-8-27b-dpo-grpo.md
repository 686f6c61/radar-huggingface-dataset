# Knowlify/qwen3.8-27b-dpo-grpo

## Resumen

Knowlify/qwen3.8-27b-dpo-grpo es un ajuste fino del modelo Qwen3.8-27B de Alibaba, especializado en la generación de escenas de video mediante Remotion (una librería de React para crear videos programáticamente). El modelo ha sido entrenado con un pipeline apilado de tres fases: primero un ajuste supervisado (SFT), después una optimización por preferencias (DPO) y finalmente una optimización por refuerzo con GRPO (Group Relative Policy Optimization). El objetivo es producir código Remotion de alta calidad que compile, renderice y cumpla criterios de diseño visual evaluados por un juez automático.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 27 mil millones) y se distribuye en formato safetensors de 16 bits, ocupando 54.5 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones. Aunque el modelo base Qwen3.8-27B es multimodal (visión y texto) y soporta modos de razonamiento, este ajuste fino se centra exclusivamente en la tarea de generación de escenas Remotion, por lo que sus capacidades generales pueden verse reducidas respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B base) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento DPO usó secuencias de 8192 tokens) |
| Tipos de cuantizacion | no disponible (pesos en fp16; no se publican cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) y adaptador LoRA (carpeta `lora/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso multimodal nativo de Alibaba con capacidades de visión y texto, modos de pensamiento e instrucción, y soporte para flujos agénticos. Sobre esta base, Knowlify ha aplicado un pipeline de tres etapas:

1. **SFT**: ajuste supervisado sobre el checkpoint `Knowlify/qwen3.8-27b-sft-ge75`, que ya estaba especializado en generación de escenas Remotion.
2. **DPO**: optimización por preferencias directas sobre pares de respuestas (dataset `Knowlify/fablify-remotion-dpo`), con margen mínimo de 15, secuencias de 8192 tokens y una época.
3. **GRPO**: optimización por refuerzo con recompensa gated que combina un gate de compilación/renderizado/layout y un juez de video basado en Qwen3.8-max. El juez evalúa seis criterios ponderados: contenido (25), layout (20), movimiento (20), pulido (15), color (10) y tipografía (10). Se usó un LoRA de rango 32, KL beta 0.03 y 100 pasos sobre prompts sintéticos.

La curva de entrenamiento GRPO muestra una mejora de calidad (puntuación del juez) desde 2.21 (pasos 1-25) hasta 6.51 (pasos 76-100), con un gate de compilación que sube del 72% al 96% y un KL que se mantiene bajo (0.001 a 0.018), indicando estabilidad sin colapso. El mejor paso individual alcanzó una calidad de 8.28.

## Capacidades

- Generación de escenas Remotion: produce código React/Remotion que define escenas de video con composición, movimiento, color y tipografía.
- Compilación y renderizado: el entrenamiento con gate de compilación asegura que el código generado sea sintácticamente válido y renderizable (96% de éxito en el gate al final del entrenamiento).
- Evaluación de calidad visual: el modelo optimiza contra un juez automático que puntúa contenido, layout, movimiento, pulido, color y tipografía, lo que mejora la coherencia estética de las escenas.
- Soporte de tool calling y agentes: no confirmado en este ajuste fino; el modelo base Qwen3.8-27B sí los soporta, pero no hay evidencia de que se hayan preservado tras el entrenamiento especializado.
- Capacidades multimodales: el modelo base es multimodal (visión + texto), pero este fine-tuning no documenta si conserva la entrada de imágenes.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- **Generación automatizada de videos promocionales**: el modelo puede crear escenas Remotion para anuncios o clips de marketing, reduciendo el tiempo de producción manual. Se usaría alimentando el modelo con una descripción textual de la escena deseada y obteniendo código listo para compilar.
- **Prototipado rápido de animaciones para redes sociales**: equipos de contenido pueden generar variaciones de escenas (cambios de color, movimiento, tipografía) sin necesidad de un diseñador de movimiento, usando el modelo como generador de código base.
- **Integración en pipelines de renderizado por lotes**: al generar código que compila en el 96% de los casos, el modelo puede integrarse en sistemas que producen múltiples videos a partir de guiones o briefs, con un paso de validación automática.
- **Asistente para desarrolladores de Remotion**: el modelo actúa como copiloto que sugiere implementaciones de escenas complejas (transiciones, animaciones de texto, composiciones con múltiples capas) a partir de requisitos en lenguaje natural.
- **Generación de storyboards animados**: en preproducción audiovisual, el modelo puede convertir descripciones de guion en escenas animadas de baja fidelidad para revisión de concepto, acelerando la iteración creativa.
- **Educación y aprendizaje de Remotion**: estudiantes y desarrolladores pueden usar el modelo para ver ejemplos de código correcto y bien estructurado, aprendiendo patrones de diseño de escenas a partir de las salidas generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la curva de calidad del juez durante el entrenamiento GRPO:

| Fase de entrenamiento (pasos) | Calidad media (juez gated) | Gate de compilación |
|---|---|---|
| 1-25 | 2.21 | 72% |
| 26-50 | 4.01 | no disponible |
| 51-75 | 5.63 | no disponible |
| 76-100 | 6.51 | 96% |

El mejor paso individual alcanzó una calidad de 8.28. La evaluación comparativa contra el modelo DPO intermedio (sin GRPO) está pendiente según el autor.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en fp16 ocupan aproximadamente 54 GB, por lo que se necesitan al menos 2 GPUs de 24 GB (por ejemplo, RTX 4090, A5000) o una GPU de 48 GB (A6000, A100 40GB no es suficiente, se necesitaría 48GB o más). Con cuantización 4-bit (no publicada oficialmente, pero posible con herramientas como llama.cpp o vLLM) la VRAM se reduciría a unos 14-16 GB, permitiendo ejecución en una RTX 4090 o similar.
- **GPU recomendadas**: A100 80GB, H100, RTX 4090 (con cuantización), A6000 48GB.
- **¿Cabe en consumer GPU?**: solo con cuantización 4-bit o 8-bit; en fp16 no cabe en GPUs de consumo típicas (24 GB o menos).
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI. El formato safetensors es compatible con la mayoría de frameworks.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Knowlify/qwen3.8-27b-dpo-grpo | 26.9B | no disponible | Generacion de escenas Remotion | Apache 2.0 | HuggingFace |
| Qwen3.8-27B (base) | 27B | 256K (segun documentacion oficial) | Multimodal generalista, agente, codigo | Apache 2.0 | HuggingFace, vLLM |
| Knowlify/qwen3.8-27b-sft-ge75 | 26.9B | no disponible | Generacion de escenas Remotion (SFT) | Apache 2.0 | HuggingFace |

El modelo se diferencia del base por su especialización en Remotion y por el entrenamiento con GRPO que mejora la calidad visual según el juez automático. No se dispone de comparativas con otros modelos de generación de video o código Remotion.

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo está optimizado exclusivamente para generar escenas Remotion; su rendimiento en tareas generales de lenguaje, código o razonamiento puede ser inferior al del modelo base Qwen3.8-27B.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar código que no compile o que no cumpla los requisitos, aunque el gate de compilación reduce este riesgo (96% de éxito en el entrenamiento, pero no garantiza el 100% en producción).
- **Dependencia del juez automático**: la calidad optimizada está sesgada hacia los criterios del juez (contenido, layout, movimiento, pulido, color, tipografía); puede no alinearse con preferencias humanas subjetivas.
- **Contexto limitado**: aunque el modelo base soporta 256K tokens, el entrenamiento DPO usó secuencias de 8192 tokens, lo que podría limitar la capacidad de manejar escenas muy largas o complejas.
- **Idiomas**: no se especifican los idiomas soportados; probablemente el modelo base es multilingüe, pero no hay confirmación para este ajuste fino.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.8-27B, que también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- **Evaluación pendiente**: el autor indica que la evaluación comparativa contra el modelo DPO intermedio está pendiente, por lo que el rendimiento real en producción no está completamente validado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Knowlify/qwen3.8-27b-dpo-grpo)
- [Repositorio oficial de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Repositorio de la serie Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Documentacion de Qwen3.8-27B en Groq](https://console.groq.com/docs/model/qwen/qwen3.8-27b)
- [Receta de vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
