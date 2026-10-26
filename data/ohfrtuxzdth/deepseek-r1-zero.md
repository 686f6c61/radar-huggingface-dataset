# Ohfrtuxzdth/DeepSeek-R1-Zero

## Resumen

DeepSeek-R1-Zero es el modelo de razonamiento de primera generación de DeepSeek, entrenado mediante aprendizaje por refuerzo (RL) a gran escala directamente sobre el modelo base, sin una etapa previa de ajuste supervisado (SFT). Según la model card, este enfoque hizo emerger de forma natural comportamientos como la autoverificación, la reflexión y la generación de cadenas de pensamiento (CoT) largas, y constituye la primera validación abierta de que las capacidades de razonamiento de un LLM pueden incentivarse solo con RL. El checkpoint alojado en este repositorio declara 684.489.845.504 parámetros en safetensors, un tamaño de repo de 688,6 GB, arquitectura de la familia DeepSeek-V3 (tag `deepseek_v3`), pesos en FP8 y licencia MIT.

Es relevante ahora porque documenta un cambio de paradigma en el post-entrenamiento (RL puro frente a SFT + RL) y porque el paper asociado (arXiv:2501.12948) sienta las bases de la familia DeepSeek-R1, incluidos los modelos destilados de 1,5B a 70B basados en Qwen2.5 y Llama3. Conviene advertir que este repositorio concreto pertenece al usuario `Ohfrtuxzdth` (0 descargas, 1 like) y no a la organización oficial `deepseek-ai`; la model card es una copia de la de DeepSeek-R1 y parte de su tabla de especificaciones aparece truncada en la información recibida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia DeepSeek-V3 (tag `deepseek_v3`) |
| Parametros totales | 684.489.845.504 (~684,5 B) segun safetensors |
| Parametros activos | no disponible (la tabla de la model card esta truncada; el modelo pertenece a una familia MoE con parametros activados por token, pero el dato no figura en la informacion recibida) |
| Longitud de contexto | no disponible (tabla truncada) |
| Tipos de cuantizacion | FP8 (tag `fp8`); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 688,6 GB; requiere `trust_remote_code` por el tag `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de la familia DeepSeek-V3, según el tag `deepseek_v3` y la etiqueta `custom_code` (que implica código de modelado propio que debe cargarse con `trust_remote_code=True`). Los pesos están almacenados en FP8, lo que explica que 684,5 B de parámetros ocupen aproximadamente 688,6 GB (1 byte por parámetro). No se dispone en la información recibida del número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RL (función de recompensa, número de pasos, etc.).

El rasgo diferencial de R1-Zero es metodológico: se aplica RL a gran escala sobre el modelo base sin SFT previo, lo que permite al modelo explorar cadenas de pensamiento para resolver problemas complejos. La propia model card reconoce los problemas derivados de este enfoque: repeticiones sin fin, baja legibilidad y mezcla de idiomas. DeepSeek-R1 (el modelo posterior, con datos de arranque en frío antes del RL) corrige estos defectos y es el que se describe en el resto de la model card junto con los modelos destilados; este repositorio, sin embargo, corresponde a R1-Zero.

## Capacidades

- Generación de texto y razonamiento con cadenas de pensamiento (CoT) largas.
- Autoverificación y reflexión durante el razonamiento, comportamientos emergentes del entrenamiento con RL.
- Razonamiento matemático y de código, según las tareas descritas en la model card y el paper.
- Modo de razonamiento explícito (thinking / CoT), propio de la familia R1.
- Pipeline de tipo conversacional (`text-generation`, `conversational`) y compatibilidad con Text Generation Inference (`text-generation-inference`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información recibida.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita.
- Capacidades multilingües: la model card menciona problemas de mezcla de idiomas, pero no detalla la lista de idiomas soportados.

## Casos de uso

- Investigación en aprendizaje por refuerzo para razonamiento: reproducir el experimento de R1-Zero para estudiar cómo emergen autoverificación y reflexión sin SFT previo.
- Generación de datos de cadena de pensamiento: usar el modelo para producir trazas de razonamiento que sirvan como corpus de destilación hacia modelos densos más pequeños (el propio paper describe esta estrategia con R1).
- Estudio de interpretabilidad del CoT: analizar las cadenas de pensamiento generadas para entender los patrones de razonamiento que emergen con RL.
- Punto de partida para pipelines de post-entrenamiento: emplear el checkpoint como base para añadir datos de arranque en frío y corregir los defectos conocidos (repetición, legibilidad, mezcla de idiomas), replicando el camino R1-Zero → R1.
- Evaluación comparativa de métodos de post-entrenamiento: contrastar R1-Zero frente a R1 y frente a modelos destilados en tareas de matemáticas y código.
- Reproducción de resultados académicos: validar las conclusiones del paper arXiv:2501.12948 en entornos de investigación con clúster multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una figura de benchmarks (`figures/benchmark.jpg`) y menciona comparaciones con OpenAI-o1 para DeepSeek-R1, pero no incluye cifras numéricas en el texto proporcionado, y la tabla de especificaciones está truncada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 684,5 B de parámetros): ~684 GB en FP8, ~1,37 TB en BF16 y ~342 GB en INT4. Solo los pesos en FP8 ya superan la memoria agregada de la mayoría de nodos de 8 GPU.
- GPU recomendadas: nodos multi-GPU de clase datacenter. En FP8, un nodo de 8×H200 (141 GB) ofrece ~1,13 TB y podría alojar los pesos con margen para caché KV; alternativas de 16×H100 80 GB (~1,28 TB) o configuraciones multi-nodo.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 24 GB) ni en configuraciones de una sola tarjeta, incluso con cuantización agresiva.
- Opciones de despliegue: vLLM, Text Generation Inference (etiqueta `text-generation-inference`), SGLang y `transformers` con `trust_remote_code=True` por el `custom_code`. No hay GGUF disponible, por lo que llama.cpp y Ollama no son viables sin conversión previa.
- Latencia y throughput: no disponible en la información recibida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Zero (este repo) | ~684,5 B (safetensors) | no disponible | MIT | Repo no oficial (`Ohfrtuxzdth`) | RL puro sin SFT; problemas de repeticion y mezcla de idiomas |
| DeepSeek-R1 (oficial, misma familia) | no disponible en la informacion (familia de ~671 B segun el paper) | no disponible | MIT | Organizacion oficial `deepseek-ai` | Anade arranque en frio antes del RL; corrige defectos de Zero |
| DeepSeek-R1-Distill-Qwen-32B | 32 B (denso) | no disponible | MIT | Oficial `deepseek-ai` | Destilado de R1; viable en hardware mucho menor |
| OpenAI o1 | no disponible | no disponible | Propietaria | Solo API | Referencia de comparacion citada en la model card; sin pesos abiertos |

## Limitaciones y advertencias

- Repeticiones sin fin, baja legibilidad y mezcla de idiomas: la propia model card documenta estos defectos como propios de R1-Zero.
- Repositorio no oficial: el alojamiento corresponde a `Ohfrtuxzdth` (0 descargas, 1 like), no a `deepseek-ai`. Verificar checksums e integridad antes de usarlo en producción.
- Metadatos atípicos: la fecha de creación indicada es 2026-10-26, posterior a la fecha actual, lo que sugiere una anomalía o recreación del repositorio.
- Sin datos de benchmarks, sesgos, idiomas ni contexto en la información recibida; no es posible evaluar su rendimiento real a partir de los datos aportados.
- Licencia MIT: permite uso comercial, pero al tratarse de una reproducción no oficial conviene confirmar la procedencia y los términos del checkpoint original.
- Riesgo de alucinación: inherente a los modelos de razonamiento; no cuantificado en la información disponible.
- Requisitos de hardware extremos: inviable en GPU de consumo; requiere infraestructura multi-GPU o multi-nodo.
- La model card mezcla la descripción de R1-Zero con la de R1 y los destilados, lo que puede inducir a confusión sobre qué capacidades corresponden exactamente a este checkpoint.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ohfrtuxzdth/DeepSeek-R1-Zero
- Paper DeepSeek-R1 (arXiv): https://arxiv.org/abs/2501.12948
- PDF del paper (enlace de la model card): https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio oficial en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Licencia MIT (referencia en la model card): https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- Organización oficial en HuggingFace: https://huggingface.co/deepseek-ai
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
