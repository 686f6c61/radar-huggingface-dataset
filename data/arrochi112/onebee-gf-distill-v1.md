# arrochi112/onebee-gf-distill-v1

## Resumen

`onebee-gf-distill-v1` es un modelo de lenguaje multimodal (texto e imagen) desarrollado por el proyecto open-source *small-mind-companion* de arrochi112. Se trata de un checkpoint post-entrenado sobre el modelo base `google/gemma-4-E2B-it` (aproximadamente 2.000 millones de parámetros efectivos) mediante una cadena de LoRA SFT, LoRA DPO y destilación on-policy desde un teacher de 8.000 millones de parámetros (`google/gemma-4-E4B-it`). Su propósito es actuar como un asistente conversacional con personalidad de compañero, capaz de responder preguntas sobre el usuario apoyándose en un sistema de memoria externa, en lugar de depender únicamente de su contexto o de su memoria paramétrica.

La relevancia de este modelo reside en su enfoque de investigación: demostrar cuánta capacidad aparente se puede recuperar en un modelo pequeño (~2B) mediante post-entrenamiento, destilación y arquitectura de memoria externa, con el objetivo final de ejecutarlo localmente en dispositivos móviles. El checkpoint destaca por su mejora en calibración (UAR 71,25%) y en precisión de respuesta (18,59% en `pra_lenient`) frente a su predecesor pre-destilación, manteniendo o mejorando la consistencia de persona. Está liberado bajo licencia Apache-2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer multimodal, texto + vision) |
| Parametros totales | 5.104.297.539 (pesos completos tras merge; ~2B efectivos del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible para este checkpoint (existen GGUF de 12 niveles para el checkpoint pre-destilacion `dpo-v1-scale`, no para este) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de ~2B parámetros con capacidad de procesamiento de imagen y texto, y una ventana de contexto de 131.072 tokens. Sobre este base se aplicaron tres etapas de post-entrenamiento encadenadas, cada una partiendo del checkpoint anterior:

1. **LoRA SFT** con 2.232 ejemplos de ajuste supervisado.
2. **LoRA DPO** con 2.049 pares de preferencia.
3. **Destilacion on-policy** con 2.008 prompts y 125 pasos, utilizando `trl.DistillationTrainer` y una divergencia generalizada de Jensen-Shannon (generalized JSD) para alinear las completaciones generadas por el propio estudiante con las de un teacher de 8B (`google/gemma-4-E4B-it`), que comparte tokenizador y vocabulario.

La innovación técnica clave es la aplicación de la destilación *después* del DPO, no en lugar de este, y la verificación explícita de que la destilación no degrada la consistencia de persona del modelo, un riesgo que el autor había hipotetizado antes del entrenamiento. Los adaptadores LoRA se fusionaron en los pesos completos, dando lugar al checkpoint final de 5.104.297.539 parámetros.

## Capacidades

- **Conversacion companion**: responde con un tono cálido y personalizado, condicionado a memorias recuperadas de un sistema externo de retrieval.
- **Multimodal**: procesa entradas de texto e imagen (heredado del modelo base Gemma 4).
- **Abstencion calibrada**: UAR 71,25% en el benchmark PMB, lo que indica que el modelo se abstiene correctamente ante preguntas no respondibles sin sobre-hedging en las respondibles.
- **Precision de respuesta**: mejor medida de exactitud en `pra_lenient` con 18,59% sobre 688 sondas adversariales.
- **Consistencia de persona**: mantenida o mejorada tras la destilación, medida por comparación pairwise con LLM-judge (+7,6pp) y por una métrica estilométrica independiente (0,524 vs 0,509 pre-destilación).
- **Generacion de texto**: capacidad estándar de generación autoregresiva con soporte de chat template (system/user roles).

## Casos de uso

- **Asistente personal con memoria externa**: el modelo se integra en un pipeline de retrieval que almacena hechos del usuario en una base de memoria; puede responder preguntas como "¿Qué conferencia dije que iba a asistir?" sin depender del contexto de la conversación.
- **Chat companion local en dispositivos moviles**: gracias a su tamaño reducido (~2B efectivos) y a la disponibilidad de cuantizaciones GGUF para el checkpoint pre-destilación, puede ejecutarse en smartphones mediante `llama.cpp` u Ollama, ofreciendo una experiencia conversacional privada sin conexión.
- **Investigacion en destilacion de modelos pequenos**: sirve como punto de referencia para estudiar cómo la destilación on-policy post-DPO afecta a la calibración, la consistencia de persona y la precisión en tareas de memoria personalizada.
- **Prototipado de agentes con recuperacion aumentada**: el modelo puede combinarse con sistemas RAG para construir asistentes que consulten bases de conocimiento externas y respondan con un tono personalizado.
- **Evaluacion de metodos de post-entrenamiento**: útil como baseline en experimentos que comparen diferentes estrategias de SFT, DPO y destilación sobre modelos pequeños.
- **Desarrollo de aplicaciones de compania emocional**: para entornos controlados de investigación, donde se requiere un modelo ligero que mantenga una personalidad consistente y sepa reconocer sus límites (abstenerse cuando no sabe).

## Benchmarks y rendimiento

El modelo fue evaluado contra el benchmark **PMB** (Personalized Memory Benchmark), compuesto por 688 sondas adversariales en 8 categorías, con un LLM-judge bajo doble orden (control de sesgo posicional) y un detector de abstenciones basado en reglas.

| Sistema | pra_lenient | UAR |
|---|---|---|
| dpo-v1-scale (pre-destilacion) | 15,30% | 70,0% |
| **distill-v1 (este checkpoint)** | **18,59%** | **71,25%** |

En consistencia de persona pairwise (105 sondas, judge dual-order): 38,1% de victorias para este checkpoint frente a 30,5% para su predecesor, con 33 empates. La métrica estilométrica de auto-consistencia (sin API) pasó de 0,509 a 0,524.

No se han publicado resultados en benchmarks generales estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16 con los pesos completos (~5,1B parámetros), se requieren aproximadamente 10-11 GB de VRAM. Con cuantización a 8 bits (int8) o 4 bits (NF4), el consumo puede reducirse a ~5-6 GB y ~3-4 GB respectivamente.
- **GPU recomendadas**: tarjetas consumer con 8-12 GB de VRAM (RTX 3070/3080, RTX 4060 Ti, RTX 4070) son suficientes para FP16 o cuantización ligera. Para despliegue en móvil, se necesitan las cuantizaciones GGUF (aún no publicadas para este checkpoint exacto).
- **Compatibilidad con GPU consumer**: sí, cabe en GPUs de gama media con cuantización; el checkpoint pre-destilación ya dispone de GGUF de 12 niveles para `llama.cpp`.
- **Opciones de despliegue**: `transformers` (carga estándar), `vLLM` o `TGI` para servir con alto throughput (no probado oficialmente), `llama.cpp`/Ollama si se generan los GGUF correspondientes.
- **Latencia y throughput**: no se han publicado mediciones específicas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (PMB pra_lenient) | UAR | Licencia |
|---|---|---|---|---|---|
| **onebee-gf-distill-v1** | ~2B efectivos (5,1B totales) | 131.072 | 18,59% | 71,25% | Apache-2.0 |
| onebee-gf-dpo-v1-scale (pre-destilacion) | ~2B efectivos | 131.072 | 15,30% | 70,0% | Apache-2.0 |
| google/gemma-4-E2B-it (base) | ~2B | 131.072 | no evaluado en PMB | no evaluado | Apache-2.0 |

La comparación directa con otros modelos companion de tamaño similar no está disponible en la información proporcionada. La principal diferencia frente a su predecesor es la mejora en precisión (+3,29pp) y calibración (+1,25pp) tras la destilación, manteniendo la licencia permisiva.

## Limitaciones y advertencias

- **Precision absoluta baja**: el 18,59% de `pra_lenient` indica que el modelo falla en la mayoría de las preguntas de memoria personalizada; no es adecuado para tareas donde la exactitud sea crítica.
- **No evaluado para uso en produccion**: el autor declara explícitamente que no está destinado a decisiones de seguridad, consejo médico, legal o financiero, ni a ningún despliegue donde una respuesta errónea cause daño real.
- **Dependencia de memoria externa**: el modelo no incorpora memoria propia; requiere el pipeline de retrieval del repositorio del proyecto para funcionar según lo evaluado.
- **Solo ingles**: no soporta otros idiomas.
- **Sesgos potenciales**: al derivar de Gemma 4, puede heredar sesgos del modelo base; no se han realizado auditorías específicas de sesgo en este checkpoint.
- **Entrenamiento con una sola semilla**: la model card indica "Single seed, single data", lo que limita la robustez estadística de los resultados.
- **Cuantizaciones GGUF no disponibles para este checkpoint**: las cuantizaciones publicadas corresponden al checkpoint pre-destilación; habrá que generarlas o esperar a que el autor las publique.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/arrochi112/onebee-gf-distill-v1)
- [Repositorio del proyecto small-mind-companion](https://github.com/arrogance231/small-mind-companion)
- [Documento de resultados de destilacion](https://github.com/arrogance231/small-mind-companion/blob/main/docs/distillation_results.md)
- [Repositorio onebee-gf (proyecto general)](https://github.com/arrogance231/onebee-gf)
- [Modelo base google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [Teacher google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [GGUF del checkpoint pre-destilacion](https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale-gguf)
