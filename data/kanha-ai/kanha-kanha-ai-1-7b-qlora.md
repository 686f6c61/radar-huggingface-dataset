# Kanha-AI/kanha-kanha.ai-1.7b-qlora

## Resumen

El modelo `Kanha-AI/kanha-kanha.ai-1.7b-qlora` es un fine-tuning experimental de Qwen3-1.7B realizado por Kanha AI, una empresa que desarrolla chatbots personalizados para sitios web y un SDK que permite ejecutarlos directamente en el dispositivo del cliente mediante WebGPU. Este checkpoint concreto se entrenó con la técnica QLoRA sobre un conjunto de datos de 128 pares pregunta-respuesta extraídos del sitio web de Kanha (kanha.ai). El objetivo es evaluar la viabilidad de generar modelos compactos y específicos para responder preguntas sobre el contenido de un sitio, sin depender de llamadas remotas a servidores.

La relevancia de este modelo reside en su enfoque: combina un modelo base eficiente (1,7B de parámetros) con un ajuste ligero sobre un dominio concreto, y además proporciona artefactos MLC cuantizados para su ejecución en navegadores mediante WebGPU. Es un caso de estudio interesante para desarrolladores que quieran desplegar asistentes conversacionales en el borde, con costes de inferencia muy bajos y privacidad de datos. Sin embargo, su conjunto de entrenamiento es extremadamente reducido (128 registros) y las métricas internas muestran limitaciones importantes, por lo que debe considerarse como un experimento de investigación más que como un producto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos originales), q4f16_1 (artefactos MLC) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (el modelo base Qwen3 tiene su propia licencia) |
| Formato de pesos | safetensors, MLC (para WebGPU) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-1.7B`, un transformer causal denso con 1,7B de parámetros y ventana de contexto nativa de 32k tokens (aunque el entrenamiento se limitó a 2048). El fine-tune se realizó mediante QLoRA (Quantized LoRA) con rango de 64, alpha de 32 y dropout de 0,05, aplicando adaptadores a todas las proyecciones lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se ejecutó durante 4 épocas sobre 128 registros de entrenamiento y 24 de validación, con una tasa de aprendizaje de 5e-05, batch efectivo de 32 (4 por dispositivo × 2 acumulaciones), warmup del 10% y pérdida solo sobre el texto del asistente (`assistant-only loss`). No se mencionan técnicas como RLHF o DPO; es un ajuste supervisado clásico sobre un dataset de dominio específico.

## Capacidades

- Generación de texto conversacional: responde preguntas sobre el contenido del sitio kanha.ai, manteniendo un formato de diálogo.
- Adaptación a dominio específico: el modelo ha sido entrenado para responder preguntas sobre las páginas web de Kanha AI, incluyendo fechas, URLs y listas de contenido.
- Ejecución on-device: los artefactos MLC permiten cargar el modelo en navegadores compatibles con WebGPU, eliminando la necesidad de servidores.
- Solo texto: no dispone de capacidades de visión, audio o herramientas (tool calling).
- Multilingüismo limitado: entrenado únicamente en inglés; no se espera buen rendimiento en otros idiomas.

## Casos de uso

- Asistente de preguntas frecuentes para un sitio web: el modelo puede responder preguntas sobre contenido específico de un sitio (por ejemplo, fechas, URLs, listas de ítems) directamente en el navegador del usuario, sin enviar datos a un servidor.
- Prueba de concepto para chatbots en el borde: su pequeño tamaño y los artefactos MLC permiten evaluar la viabilidad de ejecutar modelos de lenguaje en dispositivos de usuario final con WebGPU, reduciendo costos de infraestructura.
- Investigación comparativa de métodos de entrenamiento: el checkpoint se publica con manifiestos de investigación y métricas de evaluación para estudiar el impacto del tamaño del dataset y la configuración de QLoRA en tareas de QA de dominio.
- Generación de respuestas a partir de contenido indexado: Kanha AI ofrece un pipeline que indexa páginas, genera pares pregunta-respuesta y entrena modelos como este; este checkpoint sirve como ejemplo de salida de ese proceso.
- Evaluación de métricas de control de calidad: las métricas de evaluación (recall de fechas, URLs, listas) permiten cuantificar la precisión del modelo en tareas de extracción de hechos concretos.
- Despliegue educativo: para desarrolladores que quieren experimentar con fine-tune de modelos pequeños y su integración en aplicaciones web mediante WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas internas de evaluación sobre el conjunto de validación (26 muestras). A continuación se presentan los valores reportados, aunque no son comparables con benchmarks públicos:

| Metrica | Valor |
|---|---|
| dates_recall | 1,0 |
| deterministic_pass_rate | 0,0 |
| list_recall | 0,0359 |
| numbers_recall | 0,7308 |
| refusal_rate | 0,0 |
| unsupported_value_rate | 0,4615 |
| urls_recall | 1,0 |

Estas métricas indican que el modelo recupera correctamente fechas y URLs (recall 1,0), pero falla en listas (recall 0,036) y tiene una alta tasa de valores no soportados (46%), lo que sugiere que genera respuestas que no se corresponden con el contenido del sitio. La tasa de rechazo es nula, lo que implica que no reconoce preguntas fuera de su alcance. El `deterministic_pass_rate` de 0,0 indica que ninguna respuesta coincide exactamente con la respuesta esperada en el conjunto de evaluación.

## Requisitos de hardware

- Inferencia en CPU: posible con cuantización 4-bit (q4f16_1) en dispositivos con WebGPU, aunque el rendimiento dependerá de la GPU integrada o dedicada del cliente.
- VRAM estimada: con bfloat16, el modelo ocupa alrededor de 3,4 GB (1,72B parámetros × 2 bytes). Con cuantización 4-bit, se reduce a aproximadamente 0,9 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros; el uso real depende de la implementación y la longitud de contexto.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16 (por ejemplo, RTX 3050, RTX 2060). Para cuantización 4-bit, incluso iGPUs con WebGPU pueden funcionar.
- Despliegue: se puede servir con vLLM, llama.cpp, Ollama o TGI (para CPU/GPU), y con MLC para WebGPU en navegadores. No se han reportado latencias o throughput específicos.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en cualquier GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| **Kanha-kanha.ai-1.7b-qlora** | 1,72B | 2048 (entrenamiento) | No disponible | HuggingFace |
| **Qwen3-1.7B** (base) | 1,72B | 32K | Apache 2.0 | HuggingFace |
| **Llama-3.2-1B** | 1,23B | 128K | Meta license (restrictiva) | HuggingFace |
| **Phi-3.5-mini** | 3,8B | 128K | MIT | HuggingFace |

El modelo es un fine-tune del Qwen3-1.7B base, por lo que hereda su arquitectura. Comparado con otros modelos de tamaño similar, ofrece una ventaja en el contexto de ejecución on-device gracias a los artefactos MLC, pero su conjunto de entrenamiento es mucho menor que el de los modelos base, lo que limita su capacidad de generalización. No hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- **Dataset de entrenamiento muy pequeño**: solo 128 pares pregunta-respuesta, lo que provoca una alta varianza y una generalización pobre fuera de los ejemplos vistos.
- **Métricas de calidad bajas**: la tasa de respuestas deterministas es 0,0 y el recall de listas es 0,0359, indicando que el modelo no produce respuestas exactas y tiene problemas con estructuras complejas.
- **Alucinación y memorización**: la model card advierte que puede generar respuestas incorrectas, incompletas o desactualizadas, y que puede memorizar el contenido de entrenamiento.
- **Idioma**: solo inglés; no soporta otros idiomas.
- **Licencia no especificada**: aunque el modelo base Qwen3 es Apache 2.0, la licencia del modelo fine-tune no está declarada, lo que genera incertidumbre para uso comercial.
- **Validación necesaria**: la model card recomienda validar el modelo en el entorno objetivo (navegador, dispositivo) antes de cualquier uso público, ya que las métricas de evaluación no garantizan el funcionamiento en producción.
- **No apto para tareas generales**: su único dominio es el sitio web de Kanha AI; fuera de este contexto no tiene capacidades útiles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-qlora
- Organización en HuggingFace: https://huggingface.co/Kanha-AI
- Repositorio de GitHub de Kanha AI: https://github.com/Kanha-AI
- Sitio web de Kanha AI: https://kanha.ai
- Sitio de Kanha AI Voice-First Child Companion: https://kanhaji.ai/
