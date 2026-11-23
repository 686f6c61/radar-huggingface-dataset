# oytunistrator/AquaLLM

## Resumen

AquaLLM es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct orientado a responder preguntas sobre acuariofilia: acuarios de agua dulce y salada, cuidado de peces, selección de equipamiento, parámetros químicos del agua, plantas acuáticas y enfermedades comunes de los peces. Lo desarrolla el usuario de Hugging Face oytunistrator y se distribuye con pipeline declarado de question-answering, aunque al estar construido sobre un modelo instructivo conserva la capacidad de generación de texto conversacional.

El modelo parte de la arquitectura Qwen2 de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), un transformer decoder-only con atención por ventanas deslizantes y atención completa combinadas, heredado íntegramente del modelo base. El ajuste se realizó sobre el dataset propio oytunistrator/AquaLLM-Dataset, cuyo contenido, tamaño y composición no están documentados en la información disponible.

Su relevancia es la de un modelo de nicho: demuestra el patrón de especialización vertical sobre un modelo pequeño (1,5B) para un dominio concreto, con un coste de inferencia muy bajo y posibilidad de ejecución en hardware de consumo. Está pensado para asistentes de tiendas de animales, guías para aficionados principiantes y consultas rápidas de acuaristas experimentados, en turco e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basada en Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | safetensors (precision original) y GGUF (cuantizaciones no detalladas) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct sin modificaciones estructurales: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings ligados (tied embeddings) y RoPE para codificación posicional, con una combinación de atención completa y atención de ventana deslizante según la configuración de Qwen2. El ajuste fino se aplicó sobre el checkpoint instructivo ya alineado, de modo que el modelo conserva el formato de chat y el tokenizador originales.

El entrenamiento consistió en un fine-tuning supervisado sobre el dataset oytunistrator/AquaLLM-Dataset, de temática acuarística. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, la proporción de ejemplos por idioma, ni si se aplicaron técnicas de RLHF, DPO o preferencia adicional tras el ajuste. Tampoco se especifican hiperparámetros, método de ajuste (full fine-tuning o LoRA/QLoRA) ni si se congelaron capas. No hay innovaciones técnicas propias declaradas más allá de la especialización de dominio.

## Capacidades

- Generación de texto conversacional multirretorno, heredada del modelo base instructivo.
- Respuesta a preguntas sobre configuración y mantenimiento de acuarios de agua dulce y salada.
- Recomendación de plantas acuáticas y de iluminación adecuada.
- Orientación sobre filtración, calefacción y otros equipos de acuariofilia.
- Información sobre enfermedades comunes de los peces y sus posibles soluciones.
- Respuesta a preguntas sobre parámetros y química del agua.
- Capacidad multilingüe limitada a turco e inglés.
- Soporte de tool calling / function calling: no documentado en la información disponible (el modelo base lo soporta, pero el ajuste puede haber degradado esta capacidad).
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente en tienda de animales: el modelo puede atender consultas de clientes sobre compatibilidad de especies, ciclado del acuario o elección de filtro, con respuestas breves en turco o inglés y un coste de inferencia mínimo al ser un modelo de 1,5B.
- Guía para principiantes en acuariofilia: responde preguntas frecuentes sobre el primer montaje, parámetros de agua (pH, dureza, nitritos) y rutinas de mantenimiento, con un tono adaptado por el ajuste de dominio.
- Consulta rápida para acuaristas experimentados: resolución de dudas puntuales sobre dosificación de fertilizantes, compatibilidad de plantas o síntomas tempranos de enfermedad.
- Chatbot embebido en una web o foro de acuariofilia: su tamaño permite desplegarlo en una GPU de consumo o incluso en CPU con cuantización GGUF, sirviendo respuestas con latencia baja.
- Generación de fichas y material divulgativo: redacción de descripciones de especies, guías de cuidado o FAQ para una tienda o comunidad, partiendo de indicaciones breves.
- Filtrado y triaje de consultas de soporte: clasificación y primera respuesta automática a tickets de atención al cliente relacionados con acuariofilia, derivando los casos complejos a un humano.
- Prototipado de asistentes verticales: como ejemplo de referencia para evaluar la viabilidad de especializar un modelo de 1,5B en un dominio concreto antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión FP16/BF16: en torno a 3,1 GB solo para pesos, más overhead de KV cache y activaciones; aproximadamente 4-5 GB en la práctica.
- VRAM estimada con cuantización de 8 bits: alrededor de 1,6-2 GB para pesos.
- VRAM estimada con cuantización GGUF Q4_K_M: alrededor de 1 GB para pesos, 1,5-2 GB en total con contexto moderado.
- GPU recomendadas para producción: NVIDIA A10, L4, T4 o A100/H100 para despliegues con alta concurrencia; para desarrollo, cualquier GPU con 6 GB o más.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs de 4-6 GB con cuantización GGUF.
- CPU: viable con llama.cpp y cuantización Q4, con throughput reducido.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM, Text Generation Inference (TGI) y Transformers para safetensors; el tag text-generation-inference sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AquaLLM (oytunistrator) | 1,54B | no disponible | Acuariofilia (tr/en) | no disponible | Hugging Face (safetensors, GGUF) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | General | Apache 2.0 (modelo base) | Hugging Face, ampliamente integrado |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | General | Apache 2.0 | Hugging Face |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | General | Llama 3.2 Community License | Hugging Face, Ollama, vLLM |

La comparación directa con modelos generalistas no es del todo equitativa: AquaLLM sacrifica amplitud de conocimiento por especialización en acuariofilia. Frente a Qwen2.5-1.5B-Instruct, su ventaja es el ajuste de dominio y su desventaja es la posible pérdida de capacidades generales y de tool calling; frente a modelos de 3B o a Llama 3.2 1B, ofrece un contexto declarado menor (o no declarado) y una licencia sin especificar, lo que complica su adopción comercial.

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide determinar si se permite el uso comercial; es un bloqueo potencial para producción.
- El modelo está ajustado a un dominio muy estrecho (acuariofilia) y puede degradar su rendimiento en tareas generales respecto al modelo base.
- Riesgo de alucinación en recomendaciones técnicas: dosis de medicamentos, parámetros químicos o compatibilidades de especies pueden ser incorrectos y no deben usarse como única fuente en decisiones que afecten a animales vivos.
- Idiomas limitados a turco e inglés; el rendimiento en castellano no está garantizado ni documentado.
- La longitud de contexto efectiva no está declarada por el autor; no debe asumirse la del modelo base sin verificación.
- El dataset de entrenamiento no está documentado en composición ni tamaño, lo que impide evaluar sesgos y cobertura.
- El modelo base puede arrastrar sesgos presentes en los datos de Qwen2.5; no se documenta ningún proceso de mitigación adicional.
- El tamaño del repositorio (50,7 GB) es desproporcionado para un modelo de 1,5B, probablemente por múltiples cuantizaciones GGUF; conviene revisar los archivos antes de descargar.
- El soporte de tool calling y de agentes no está verificado tras el ajuste; no debe asumirse en pipelines de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oytunistrator/AquaLLM
- Dataset de ajuste: https://huggingface.co/datasets/oytunistrator/AquaLLM-Dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio e issues del autor: https://github.com/oytunistrator/AquaLLM/issues
