# hermitdave/Qwen3.6-35B-A3B-MLX-2bit-mixed_2_6

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba Cloud. A pesar de su nombre, solo activa aproximadamente 3 mil millones de parámetros por token gracias a su arquitectura de 256 expertos con routing top-8, lo que lo hace mucho más eficiente en inferencia que un modelo denso de tamaño equivalente. Este repositorio concreto contiene una conversión al formato MLX de Apple, cuantizada con una receta mixta de 2 y 6 bits que protege específicamente los pesos del router MoE para evitar degradaciones silenciosas en la calidad de las decisiones de routing.

La conversión, realizada por el usuario hermitdave, extrae únicamente la torre de lenguaje del modelo multimodal original, por lo que no admite entradas de imagen o vídeo. Con un tamaño efectivo de 3.182 bits por peso y unos 13 GB en disco, el modelo está diseñado para ejecutarse en cualquier Mac con Apple Silicon y 16 GB o más de memoria unificada. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y el contexto de 262.144 tokens lo posiciona como una opción atractiva para tareas que requieren ventanas de contexto muy largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (MoE híbrido con atención lineal recurrente + atención completa) |
| Parametros totales | 35 mil millones (modelo base); ~4 mil millones en el archivo cuantizado (3.988.549.760) |
| Parametros activos | ~3 mil millones por token (256 expertos, top-8 routing) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta 2/6 bits (receta `mixed_2_6` con protección de router gates a 6 bits), grupo de tamaño 64, 3.182 bits por peso efectivo |
| Idiomas soportados | No disponible (el modelo base Qwen3.6 soporta múltiples idiomas, pero la model card de esta conversión no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), 3 shards, ~13 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE híbrida que combina capas de atención lineal recurrente con capas de atención completa (full attention). Esta combinación permite un prefill más eficiente en términos de memoria, aunque el prefill es más lento que el decode debido a la naturaleza recurrente de las capas lineales. El routing MoE selecciona 8 de los 256 expertos disponibles por token, lo que reduce drásticamente el coste computacional frente a un modelo denso de 35 mil millones de parámetros.

La conversión MLX aplica una cuantización mixta personalizada denominada `mixed_2_6`. Esta receta asigna 6 bits a las capas primera y última (1/8 del total), a cada tercera capa intermedia, a los proyectores `v_proj` y `down_proj` cuando la capa califica, y al `lm_head`. El resto de capas se cuantizan a 2 bits. Además, se añade un predicado personalizado que fuerza todos los pesos de `router.gate` y `router.linear` a 6 bits, evitando que las decisiones de routing se degraden con cuantizaciones de baja precisión. El modelo base fue entrenado por Alibaba con datos no especificados en la información disponible; no se detalla el número de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y completado de texto con soporte de plantilla de chat (chat template) y modo de razonamiento (thinking mode) activado por defecto.
- Razonamiento multi-paso gracias al modo thinking, que puede desactivarse mediante `chat_template_kwargs={"enable_thinking": false}`.
- Manejo de contextos muy largos de hasta 262.144 tokens, adecuado para tareas que requieren memoria extensa.
- Capacidades multilingües heredadas del modelo base Qwen3.6, aunque los idiomas concretos no están documentados en esta conversión.
- Eficiencia computacional notable: solo ~3 mil millones de parámetros activos por token, lo que permite inferencia en hardware modesto.
- Sin soporte de visión: la torre de visión del modelo multimodal original fue eliminada en esta conversión.
- No se documenta soporte explícito de tool calling o function calling en la model card, aunque el modelo base Qwen3.6 podría incluirlo; no hay confirmación en la información disponible.

## Casos de uso

- Asistentes conversacionales en Mac con Apple Silicon: el modelo se integra con `mlx-lm` y permite ejecutar un chat local de alta calidad sin conexión, aprovechando la memoria unificada de 16 GB o más.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, puede resumir, analizar o extraer información de libros completos, expedientes legales o informes técnicos extensos en una sola pasada.
- Prototipado de agentes de razonamiento: el modo thinking activado por defecto permite experimentar con cadenas de razonamiento multi-paso antes de desplegar en producción con modelos más grandes.
- Desarrollo de aplicaciones de generación de texto en entornos con recursos limitados: al ser un MoE con solo 3 mil millones de parámetros activos, cabe en portátiles con 16 GB de RAM unificada, algo inviable con modelos densos de 35 mil millones.
- Investigación sobre cuantización MoE: la receta `mixed_2_6` con protección de router gates es un caso de estudio práctico para evaluar el impacto de la precisión de los pesos de routing en la calidad final.
- Evaluación de modelos híbridos de atención lineal: permite probar el comportamiento de la arquitectura `qwen3_5_moe` en tareas de generación y comparar el rendimiento prefill/decode frente a modelos transformer puros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y los resultados de búsqueda web no proporcionan cifras concretas para esta conversión específica. Se recomienda consultar la ficha del modelo base Qwen/Qwen3.6-35B-A3B en Hugging Face para obtener datos de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- Memoria mínima: 16 GB de memoria unificada en Apple Silicon (M1, M2, M3, M4 o posteriores).
- Memoria recomendada: 32 GB o más para disponer de margen de contexto cómodo sin intercambio a disco.
- GPU: no requiere GPU discreta; funciona con la GPU integrada de los chips Apple Silicon. No es compatible con CUDA.
- Despliegue: mediante `mlx-lm` (Python) o la CLI `python -m mlx_lm.chat`. No se menciona soporte para vLLM, llama.cpp u Ollama en esta conversión.
- Latencia y throughput: no disponibles. La model card advierte que el prefill es más lento que el decode debido a las capas de atención lineal recurrente, pero no ofrece cifras concretas.
- La arquitectura MoE facilita la descarga de CPU: solo se calculan los expertos activos por token, lo que reduce la presión sobre la memoria en comparación con modelos densos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 262.144 | Apache 2.0 | BF16 |
| Qwen3.6-35B-A3B MLX 2-bit (este) | 35B (base) | ~3B | 262.144 | Apache 2.0 | MLX safetensors, 3.182 bpw |
| Qwen3-30B-A3B (generación anterior) | 30B | ~3B | 131.072 | Apache 2.0 | BF16 / GGUF / MLX |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada. La principal diferencia de esta conversión frente al modelo base es la cuantización agresiva (2/6 bits) que reduce el tamaño de 35B a ~13 GB, a costa de una posible pérdida de calidad. Frente a Qwen3-30B-A3B, ofrece el doble de contexto (262K frente a 131K) y una arquitectura híbrida más reciente.

## Limitaciones y advertencias

- Sin soporte de visión: la torre de imagen/vídeo del modelo multimodal original fue eliminada; cualquier entrada multimodal fallará.
- Modo thinking activado por defecto: si no se desea, hay que desactivarlo explícitamente en la plantilla de chat, lo que puede sorprender a usuarios que esperan respuestas directas.
- Cuantización agresiva: el uso de 2 bits en la mayoría de capas puede provocar degradación de calidad en tareas complejas, especialmente en razonamiento matemático o generación de código, aunque la protección de los router gates mitiga parte del daño.
- Prefill lento: la atención lineal recurrente hace que el prefill sea más lento que el decode, lo que afecta a la latencia en tareas de generación larga.
- Sin datos de benchmarks: no hay métricas publicadas para esta conversión, por lo que el rendimiento real es incierto hasta que se evalúe.
- Idiomas no documentados: aunque el modelo base es multilingüe, esta conversión no especifica qué idiomas soporta de forma fiable.
- Compatibilidad limitada: al ser un formato MLX, solo es utilizable en Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin reconvertir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/Qwen3.6-35B-A3B-MLX-2bit-mixed_2_6
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Conversión relacionada del mismo autor: https://huggingface.co/hermitdave/qwen36-35b-a3b-p2-iq-mix
- Guía de ejecución local (insiderllm.com): https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Guía comparativa Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.6-35b-a3b
