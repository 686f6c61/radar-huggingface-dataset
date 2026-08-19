# meta-llama/Llama-Prompt-Guard-2-86M

## Resumen

Llama-Prompt-Guard-2-86M es un clasificador de texto desarrollado por Meta, diseñado para detectar prompts maliciosos, inyecciones de prompts y jailbreaks dirigidos a modelos de lenguaje. A pesar de su nombre, el modelo tiene 278,8 millones de parámetros (según los pesos en safetensors), y se basa en la arquitectura DeBERTa-v2. Forma parte de la familia Llama 4 y está pensado como una capa de seguridad ligera que puede anteponerse a un LLM para filtrar entradas potencialmente peligrosas antes de que lleguen al generador.

El modelo fue publicado el 28 de abril de 2025 y ha acumulado más de 126.000 descargas en HuggingFace. Su acceso es restringido (gated), por lo que requiere aceptar las condiciones de licencia de Meta. Está disponible en ocho idiomas: inglés, francés, alemán, hindi, italiano, portugués, español y tailandés. Su relevancia radica en la creciente necesidad de proteger sistemas de IA frente a ataques de inyección de prompts, especialmente en entornos de producción donde los LLM se exponen a entradas de usuarios no confiables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer) |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clasificador de texto, probablemente 512 tokens) |
| Tipos de cuantizacion | no disponible (safetensors en FP32/FP16) |
| Idiomas soportados | en, fr, de, hi, it, pt, es, th |
| Licencia | Llama 4 (licencia personalizada de Meta, uso comercial sujeto a condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DeBERTa-v2, una arquitectura transformer encoder que incorpora atención disentangled (separación de la representación de contenido y posición) y un mecanismo de decodificación mejorado. Aunque el nombre sugiere 86 millones de parámetros, los pesos reales indican 278,8 millones, lo que sugiere que el nombre hace referencia al tamaño del modelo base o a una versión compacta, pero el checkpoint publicado es más grande.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el proceso de optimización (si se usó RLHF, DPO u otro). Dado que es un clasificador de seguridad, es probable que se haya entrenado con ejemplos de prompts benignos y maliciosos, incluyendo jailbreaks conocidos y técnicas de inyección. La etiqueta "text-classification" indica que produce una salida de clasificación (probablemente binaria o multiclase) en lugar de generar texto libre.

## Capacidades

- Clasificación de texto para detectar prompts maliciosos, incluyendo inyecciones de prompts y jailbreaks.
- Soporte multilingüe en ocho idiomas: inglés, francés, alemán, hindi, italiano, portugués, español y tailandés.
- Integrable como capa de pre-filtrado antes de un LLM generativo (por ejemplo, Llama 4).
- Compatible con la librería transformers de HuggingFace y con text-embeddings-inference para despliegue eficiente.
- Tamaño compacto (278M parámetros) que permite inferencia rápida y despliegue en entornos con recursos limitados.
- No tiene capacidades de generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Moderación de prompts en chatbots: el modelo puede analizar cada entrada del usuario antes de pasarla a un LLM generativo, bloqueando intentos de jailbreak o manipulación. Su baja latencia lo hace adecuado para aplicaciones interactivas en tiempo real.
- Protección de APIs de LLM: integrarlo como middleware en un servicio de inferencia para filtrar solicitudes maliciosas antes de que consuman recursos de cómputo del modelo generativo.
- Auditoría de logs de conversaciones: procesar históricos de interacciones para identificar intentos de ataque o abuso, ayudando a mejorar las políticas de seguridad.
- Filtrado de contenido en sistemas de agentes autónomos: cuando un agente recibe instrucciones de fuentes externas (por ejemplo, herramientas o APIs), el clasificador puede verificar que las instrucciones no contengan inyecciones maliciosas.
- Evaluación de robustez de modelos: usar el clasificador como herramienta de testing para comprobar si un LLM es vulnerable a ciertos jailbreaks, generando métricas de seguridad.
- Entornos educativos y de investigación: analizar patrones de ataques de prompt engineering y desarrollar contramedidas, gracias a su naturaleza ligera y su licencia que permite investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, recall, F1 ni comparaciones con otros clasificadores de seguridad en el repositorio de HuggingFace. Tampoco se han documentado métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278M parámetros en FP32, el modelo ocupa aproximadamente 1,1 GB en memoria (según el tamaño del repo). En FP16, unos 0,56 GB. Por tanto, cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1650 (4 GB) hasta una RTX 4090 o A100. También puede ejecutarse en CPU con razonable velocidad para clasificación de frases cortas.
- Compatible con consumer GPUs: sí, cualquier GPU con 2 GB o más de VRAM puede ejecutarlo sin problemas.
- Opciones de despliegue: transformers (Python), text-embeddings-inference, endpoints compatibles de HuggingFace. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un encoder y no un modelo generativo.
- Latencia estimada: para una frase de hasta 512 tokens, la inferencia en GPU debería ser inferior a 10 ms; en CPU, unos 50-100 ms, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Uso principal |
|---|---|---|---|---|
| Llama-Prompt-Guard-2-86M | 278M | DeBERTa-v2 | Llama 4 (restrictiva) | Clasificación de prompts maliciosos |
| Llama-Guard (Meta) | 8B | Transformer decoder | Llama 2 (comunitaria) | Clasificación de seguridad de prompts y respuestas |
| OpenAI Moderation API | no disponible | no disponible | API propietaria | Moderación de contenido |

Llama-Prompt-Guard-2-86M es significativamente más ligero que Llama-Guard (8B), lo que lo hace más adecuado para despliegues de baja latencia y alto rendimiento. Sin embargo, no genera explicaciones ni clasifica respuestas, solo prompts. La comparativa con OpenAI Moderation es limitada porque no se conocen los detalles técnicos de ese servicio.

## Limitaciones y advertencias

- No se han publicado detalles sobre el entrenamiento, por lo que se desconocen posibles sesgos en los datos de entrenamiento.
- Al ser un clasificador binario (o multiclase), puede producir falsos positivos (bloquear prompts legítimos) y falsos negativos (dejar pasar ataques). Su eficacia depende de la cobertura de los patrones de ataque vistos durante el entrenamiento.
- La licencia Llama 4 es personalizada y restrictiva: permite uso comercial bajo condiciones específicas, pero requiere aceptación explícita de los términos de Meta. No es una licencia open source convencional.
- El acceso al modelo está restringido (gated) en HuggingFace, lo que puede limitar su adopción en proyectos que requieran descarga automática.
- Solo cubre ocho idiomas; los prompts en otros idiomas pueden no ser detectados correctamente.
- No hay información sobre la longitud máxima de contexto soportada. Dado que es un clasificador basado en DeBERTa-v2, es probable que esté limitado a 512 tokens, lo que podría truncar prompts largos.
- No es un sustituto de una estrategia de seguridad integral; debe combinarse con otras medidas como sanitización de entradas, límites de tasa y monitoreo.

## Enlaces

- HuggingFace: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- No se han encontrado papers, blogs o repositorios adicionales en la información proporcionada.
