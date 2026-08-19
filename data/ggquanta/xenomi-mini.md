# GGQuanta/Xenomi-mini

## Resumen

Xenomi-mini es un modelo de lenguaje de 4.2 mil millones de parámetros, desarrollado por GGQUANTA (Beijing Zhongke Guoguang Quantum Technology Co., Ltd.), como parte de la familia Xenomi. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B, realizado con datos verticales y técnicas LoRA/SFT, y posteriormente convertido a formato GGUF para su uso con llama.cpp. El modelo está orientado a tres dominios principales: conversación, resumen y divulgación científica, y evaluación de riesgos de contenido y juicio de productos.

La relevancia de Xenomi-mini radica en que ofrece un modelo especializado en el dominio de la computación cuántica y la investigación científica, con licencia Apache 2.0, lo que permite su uso comercial y su despliegue en hardware de consumo. Aunque se comercializa como parte de un ecosistema que incluye plataformas de investigación cuántica, la propia documentación aclara que las mejoras de precisión provienen de los datos y el entrenamiento, no de hardware cuántico. El modelo está disponible en tres archivos GGUF: una versión cuantizada Q4_K_M de aproximadamente 2.6 GB y dos versiones BF16 de 7.8 GB cada una, diferenciadas para el dominio de producto y el de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-4B) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (los comandos de ejemplo usan 8192 tokens) |
| Tipos de cuantización | Q4_K_M, BF16 |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3.5-4B, un modelo denso de 4 mil millones de parámetros. El proceso de entrenamiento consistió en un ajuste fino con datos verticales del dominio (investigación cuántica, divulgación científica, análisis de productos) utilizando LoRA (Low-Rank Adaptation) y posteriormente un fine-tuning supervisado (SFT). Los adaptadores se fusionaron con los pesos base y el resultado se convirtió a formato GGUF para su uso con llama.cpp. La documentación indica que las evaluaciones de precisión se realizaron en dos entornos distintos: una parte con CUDA LoRA (PEFT) en una RTX 5070, y otra parte directamente con llama.cpp en BF16. No se menciona el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en chino e inglés, con soporte de plantilla de chat Qwen3.5/ChatML.
- Clasificación y enrutamiento de consultas en entornos de producto (routing con precisión del 95% frente al 70% de la base).
- Extracción de entidades nombradas (NER) con micro-F1 de 78,1 frente al 50,4 de la base.
- Resumen de artículos científicos y divulgación (soporta tareas de resumen y formato estructurado).
- Evaluación de riesgos de contenido con F1 de 100 frente al 44,2 de la base.
- Decisiones de agente: evaluación de riesgo (95,9), decisión de uso de herramientas (95,4) y decisión de finalización de conversación (70,8).
- Soporte de inferencia con razonamiento desactivado (`--reasoning off`).
- No incluye capacidades de visión, audio ni multimodalidad.

## Casos de uso

- **Atención al cliente automatizada en dominios técnicos**: el modelo puede gestionar conversaciones multi-turno en chino o inglés, con enrutamiento de consultas hacia el departamento adecuado. Su precisión de routing del 95% lo hace adecuado para sistemas de soporte de productos científicos o técnicos.
- **Resumen de artículos de investigación**: el modelo puede generar resúmenes estructurados de papers científicos, con una puntuación de 100 en la tarea de extracción de secciones de resumen y 45,8 en la tarea de resumen obligatorio (must). Útil para herramientas de revisión de literatura.
- **Moderación de contenido y evaluación de riesgos**: con un F1 de 100 en la tarea de riesgo de contenido, puede utilizarse como filtro previo en plataformas que publican contenido científico o técnico, para detectar información potencialmente peligrosa o incorrecta.
- **Agente de decisión en sistemas de automatización**: el modelo puede tomar decisiones sobre cuándo llamar a herramientas externas, cuándo finalizar una conversación y cómo evaluar el riesgo de una acción, lo que lo hace útil para construir agentes autónomos en entornos controlados.
- **Clasificación de entidades en textos de dominio**: su NER con F1 de 78,1 permite extraer entidades como nombres de instituciones, productos, o términos técnicos en documentos científicos o técnicos.
- **Generación de contenido educativo**: el modelo puede crear explicaciones divulgativas de conceptos científicos (con una precisión de 41,7 en la tarea de divulgación, frente al 14,6 de la base), adecuado para plataformas de aprendizaje.

## Benchmarks y rendimiento

La documentación del modelo incluye evaluaciones comparativas con el modelo base Qwen3.5-4B en tres dominios. Los resultados se presentan en las siguientes tablas:

**Producto (routing, NER, etc.)**

| Modelo | Routing Acc | RAG Acc | NER micro-F1 | Keyword F1 | Short text Acc | Parse-OK |
|---|---|---|---|---|---|---|
| Qwen3.5-4B | 70.0 | 87.5 | 50.4 | 21.8 | 76.2 | 100.0 |
| Xenomi-mini (producto) | 95.0 | 85.0 | 78.1 | 60.5 | 100.0 | 100.0 |

**Investigación (Layer A)**

| Modelo | Resumen slot | Resumen must | Divulgación must | Format | Riesgo F1 |
|---|---|---|---|---|---|
| Qwen3.5-4B | 100.0 | 50.0 | 14.6 | 95.8 | 44.2 |
| Xenomi-mini (investigación) | 100.0 | 45.8 | 41.7 | 100.0 | 100.0 |

**Decisiones de agente (llama.cpp BF16)**

| Tarea | Base | Xenomi-mini (investigación) |
|---|---|---|
| Decisión de riesgo | 57.4 | 95.9 |
| Decisión de herramientas | 92.5 | 95.4 |
| Decisión de finalización | 33.3 | 70.8 |

Nota: el autor aclara que los resultados de la parte de producto e investigación provienen de una evaluación con CUDA LoRA (PEFT) y no se han re-evaluado con llama.cpp para las versiones BF16. Los resultados de agente sí se obtuvieron con llama.cpp. Las puntuaciones no deben sumarse como una métrica general.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q4_K_M: aproximadamente 2.6 GB de memoria, por lo que cabe en GPUs de consumo con 4 GB o más de VRAM.
  - BF16: aproximadamente 7.8 GB por archivo, por lo que requiere al menos 8-10 GB de VRAM.
- **GPUs recomendadas**:
  - Q4_K_M: RTX 3060 12 GB, RTX 4060 8 GB, GTX 1080 Ti 11 GB (con cuantización).
  - BF16: RTX 3090 24 GB, RTX 4090 24 GB, o GPUs de servidor como A10G o L4.
- **Despliegue**: llama.cpp, llama-server (OpenAI-compatible), llama-cli. No se menciona soporte oficial para vLLM u Ollama, pero es compatible con el formato GGUF.
- **Latencia y throughput**: no se proporcionan datos de tokens por segundo. El autor indica que algunas tareas son más rápidas de extremo a extremo debido a una generación más corta y estructurada, pero no se declara una mejora en tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Dominio |
|---|---|---|---|---|---|
| Xenomi-mini (GGQuanta) | 4.2B | no disponible | Apache 2.0 | GGUF | Científico/producto |
| Qwen3.5-4B (base) | 4.2B | no disponible | Apache 2.0 | safetensors | General |
| Llama 3.1 4B (no disponible) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre otros modelos de 4B con especialización en dominio científico para realizar una comparativa completa. El modelo base Qwen3.5-4B es la referencia directa, y los benchmarks muestran mejoras en tareas verticales a costa de una ligera caída en RAG (de 87.5 a 85.0) y en resumen must (de 50.0 a 45.8). La comparativa con otros modelos como Gemma 3 4B o Mistral 7B no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Sin propiedad cuántica**: la documentación es explícita: las mejoras de precisión se deben a los datos verticales y al LoRA/SFT, no a hardware cuántico ni a «superioridad cuántica». No debe atribuirse ninguna capacidad cuántica al modelo.
- **Identidad de marca como regla del lado del servidor**: la «frase de identidad» de Xenomi es una regla de servicio, no está incluida en los pesos del modelo. En despliegues sin esa regla, el modelo no se autodenominará «Xenomi».
- **Evaluaciones no reproducibles en todos los entornos**: los resultados de las tareas de producto e investigación se obtuvieron con CUDA LoRA (PEFT) y no se han vuelto a evaluar en llama.cpp para las versiones BF16. Los resultados de agente sí se obtuvieron con llama.cpp, pero con el mismo entorno.
- **Caída de rendimiento en algunas tareas**: el modelo muestra una bajada en RAG (de 87.5 a 85.0) y en resumen must (de 50.0 a 45.8) respecto a la base. No es adecuado para tareas de recuperación de información de alta precisión.
- **Licencia**: aunque el modelo y la base se distribuyen bajo Apache 2.0, se debe cumplir con la licencia y las políticas de uso de Qwen3.5, que pueden incluir restricciones de uso comercial o de modificación en ciertos contextos.
- **Idiomas**: solo chino e inglés. No hay soporte para otros idiomas como español o francés.
- **Sin soporte de visión ni audio**: el modelo es exclusivamente de texto.
- **Riesgo de alucinación**: no se proporcionan datos específicos, pero como modelo de 4B, es esperable que tenga limitaciones en tareas de razonamiento complejo y en la generación de hechos precisos fuera de su dominio de entrenamiento.

## Enlaces

- [HuggingFace: GGQuanta/Xenomi-mini](https://huggingface.co/GGQuanta/Xenomi-mini)
- [Portfolio de productos GGQUANTA](https://products.qubitlab.cc/)
- [Repositorios GGquanta en GitHub](https://github.com/orgs/GGquanta/repositories)
