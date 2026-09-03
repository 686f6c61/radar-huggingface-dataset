# Null-Guard/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored

## Resumen

El modelo **LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored**, desarrollado por Null-Guard, es una versión destilada y abliterada del modelo base **LiquidAI/LFM2.5-230M** de Liquid AI. Se trata de un modelo de generación de texto de aproximadamente 230 millones de parámetros, entrenado mediante destilación de conocimiento a partir de las salidas del modelo **Gemini 3.8 Flash** de Google, y posteriormente sometido a un proceso de abliteración (ablación direccional) para eliminar la tendencia a rechazar peticiones o emitir respuestas moralizantes. El resultado es un asistente conversacional pequeño, rápido y sin filtros de seguridad, orientado a entornos edge o de investigación.

La relevancia de este modelo radica en su doble enfoque: por un lado, transfiere el estilo y conocimiento de un teacher de gran tamaño a un modelo compacto; por otro, elimina deliberadamente la capa de rechazo mediante técnicas de interpretabilidad. Está pensado para usos locales, offline o de red-teaming, donde se requiere un control total sobre el comportamiento del asistente. Su arquitectura híbrida LFM2, optimizada para inferencia en dispositivos con recursos limitados, lo hace adecuado para despliegues en CPU o GPUs de baja gama. El contexto máximo no se especifica en la documentación disponible, aunque se hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (Liquid AI), no transformer puro |
| Parametros totales | 229.693.184 (~230M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | safetensors (repo principal), GGUF (versión separada) |
| Idiomas soportados | Inglés, chino (según tags); capacidad multilingüe heredada |
| Licencia | lfm2.5-license (gratuita para individuos/empresas <10M$ de ingresos anuales; licencia comercial de pago por encima) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **LFM2** de Liquid AI, un diseño híbrido optimizado para inferencia en dispositivos edge, que combina mecanismos de atención con componentes de estado (SSM) para reducir el coste computacional. No es un transformer estándar, por lo que requiere soporte específico en el stack de inferencia (transformers, llama.cpp, LEAP, etc.). El entrenamiento se realizó en dos etapas: primero, una **destilación de conocimiento** a partir de pares prompt/respuesta generados por Gemini 3.8 Flash, transfiriendo estilo y patrones de razonamiento al modelo de 230M; después, una **abliteración** que calcula la dirección de rechazo mediante pares contrastivos de prompts dañinos/inocuos y la proyecta fuera de los pesos en todas las capas, suprimiendo la tendencia a negarse o moralizar. No se han publicado datos sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional en inglés y, en menor medida, chino.
- Respuestas sin rechazo en la mayoría de categorías de peticiones previamente bloqueadas (efecto de la abliteración).
- Capacidad multilingüe limitada heredada del modelo base.
- Adecuado para tareas de escritura creativa, roleplay y red-teaming.
- No se documenta soporte explícito para tool calling, agentes o razonamiento multi-paso.
- Tamaño compacto que permite inferencia en CPU y dispositivos con poca memoria.

## Casos de uso

- **Investigación en alineación y mecanismos de rechazo**: el modelo permite estudiar cómo la abliteración afecta al comportamiento de un LLM pequeño, comparando respuestas antes y después de la ablación direccional. Es útil para trabajos de interpretabilidad y análisis de seguridad.
- **Red-teaming de sistemas propios**: al carecer de filtros de seguridad, se puede emplear para probar la robustez de capas de moderación externas, generando entradas adversariales que un modelo estándar rechazaría.
- **Escritura creativa y roleplay sin restricciones**: su naturaleza uncensored lo hace adecuado para generar narrativas, diálogos o contenido de ficción que requieran libertad temática, siempre que se respete la legalidad.
- **Asistente local offline en dispositivos edge**: con solo 230M de parámetros, puede ejecutarse en un Raspberry Pi o un móvil, proporcionando un asistente conversacional rápido sin conexión a internet.
- **Prototipado rápido de chatbots sin capa de seguridad**: para entornos de desarrollo donde se necesita un modelo base permissivo antes de añadir filtros personalizados.
- **Experimentación con destilación y abliteración**: sirve como referencia para comparar el efecto de estas técnicas sobre un mismo modelo base, facilitando la reproducción de pipelines de entrenamiento similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: en fp32, ~0,92 GB; en fp16, ~0,46 GB; con cuantización GGUF (p.ej. Q4_K_M), ~0,15-0,2 GB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM (p.ej. NVIDIA GTX 1050, RTX 2050) o incluso integradas; también funciona en CPU.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU moderna, incluidas las de portátiles.
- **Opciones de despliegue**: transformers (Hugging Face), llama.cpp (si soporta LFM2.5), LEAP (runtime de Liquid AI), text-generation-inference (TGI) según los tags.
- **Latencia y throughput**: no disponibles, pero al ser un modelo pequeño se espera una latencia de decenas de milisegundos en GPU y de cientos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de la misma categoría (tamaño ~200-300M, destilados o uncensored). Alternativas genéricas como TinyLlama-1.1B o Qwen2.5-0.5B tienen más parámetros y arquitecturas transformer estándar, pero no se han encontrado benchmarks que permitan una comparación rigurosa. La licencia LFM2.5 es más restrictiva que Apache 2.0, lo que puede limitar su uso comercial.

## Limitaciones y advertencias

- **Seguridad deliberadamente reducida**: el modelo puede generar contenido ofensivo, ilegal o dañino si se le solicita. No debe desplegarse en productos públicos sin una capa de moderación externa.
- **Capacidad limitada por tamaño**: con 230M de parámetros, el razonamiento complejo, la coherencia en generaciones largas y la exactitud factual son limitados.
- **Riesgo de alucinación**: al ser un modelo pequeño y sin filtros, es propenso a inventar información o producir respuestas incorrectas.
- **Licencia restrictiva**: la licencia LFM2.5 no es Apache 2.0; exige licencia comercial de pago para empresas con ingresos anuales superiores a 10M$. Además, la destilación de Gemini 3.8 Flash está sujeta a los términos adicionales de la API de Google.
- **Soporte de arquitectura**: al ser LFM2 híbrida, no todos los frameworks de inferencia la soportan; hay que verificar la compatibilidad con llama.cpp, vLLM u otros antes de desplegar.
- **Idiomas**: el soporte principal es inglés; el chino y otros idiomas pueden tener un rendimiento inferior.
- **Uso por menores**: no recomendado; el modelo no tiene filtros de contenido.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/Null-Guard/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored)
- [Modelo base LiquidAI/LFM2.5-230M](https://huggingface.co/LiquidAI/LFM2.5-230M)
- [Versión cuantizada GGUF](https://huggingface.co/Null-Guard/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored-GGUF)
- [Licencia LFM2.5](https://huggingface.co/LiquidAI/LFM2.5-230M)
