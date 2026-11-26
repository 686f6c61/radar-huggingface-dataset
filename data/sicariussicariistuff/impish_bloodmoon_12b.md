# SicariusSicariiStuff/Impish_Bloodmoon_12B

## Resumen

Impish_Bloodmoon_12B es un ajuste fino (fine-tune) del modelo Mistral-Nemo-Instruct-2407, desarrollado por el usuario independiente SicariusSicariiStuff. Con 12.247.802.880 parámetros (aproximadamente 12,2 mil millones), se distribuye en formato safetensors bajo licencia Apache 2.0 y está orientado a un uso en inglés. El modelo se entrenó sobre el dataset propio UBW_Tapestries y forma parte de la familia de modelos "Impish" del mismo autor.

El modelo hereda la arquitectura transformer de Mistral-Nemo, incluyendo su ventana de contexto nativa de 128.000 tokens y su tokenizador basado en Tekken. El ajuste fino busca especializar el comportamiento del modelo base, presumiblemente hacia tareas creativas y de rol, dado el ecosistema de tarjetas de rol y aventura que el autor mantiene en repositorios asociados (Roleplay_Cards y Adventure_Cards).

Su relevancia actual radica en ser un ejemplo de fine-tune comunitario sobre una base sólida y de licencia permisiva, con un volumen modesto de descargas (267) y una aceptación razonable en la comunidad (122 likes). No obstante, la documentación técnica publicada es muy limitada: la model card está dominada por elementos de presentación HTML y no detalla hiperparámetros, composición del dataset ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-Nemo-Instruct-2407) |
| Parámetros totales | 12.247.802.880 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no confirmada explícitamente en la model card) |
| Tipos de cuantización | No disponible en la información proporcionada; la model card menciona una sección de cuantizaciones disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-Nemo-Instruct-2407 |
| Dataset de entrenamiento | SicariusSicariiStuff/UBW_Tapestries |
| Tamaño del repositorio | 24,5 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12 mil millones de parámetros desarrollado conjuntamente por Mistral AI y NVIDIA. Por tanto, hereda las innovaciones arquitectónicas de esa base: atención con RoPE, GQA (grouped-query attention) y una ventana de contexto de 128.000 tokens. El autor no documenta modificaciones estructurales sobre la arquitectura original.

En cuanto al entrenamiento, la información disponible es escasa. Se sabe que se utilizó el dataset UBW_Tapestries, de creación propia del autor, pero no se especifican el número de tokens, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card menciona una sección de "training details" que, en el fragmento disponible, no contiene datos numéricos concretos. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto en inglés con la calidad heredada de Mistral-Nemo-Instruct.
- Razonamiento multi-turno y mantenimiento de contexto largo gracias a la ventana de 128.000 tokens del modelo base.
- Capacidades de conversación y rol, dado el ecosistema de tarjetas de rol y aventura publicado por el autor.
- Tool calling y function calling: presumiblemente heredados del modelo base, aunque no se documentan explícitamente en la model card.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- **Roleplay y narrativa interactiva**: el modelo encaja en aplicaciones de conversación con personajes, dado el ecosistema de tarjetas de rol del autor y el ajuste fino orientado a este tipo de contenido.
- **Aventuras de texto y ficción interactiva**: el repositorio asociado Adventure_Cards sugiere un uso previsto en narrativa ramificada y juegos de texto, donde el contexto largo permite mantener el estado de la partida.
- **Generación creativa en inglés**: redacción de relatos, diálogos y descripciones con estilo consistente, aprovechando el ajuste sobre un corpus propio.
- **Prototipado de asistentes conversacionales**: al ser un modelo de 12B con licencia Apache 2.0, permite experimentar en local sin restricciones comerciales.
- **Investigación sobre fine-tuning comunitario**: sirve como caso de estudio de adaptación de Mistral-Nemo con datasets pequeños y publicación abierta.
- **Despliegue en hardware de consumo**: con cuantización a 4 bits cabe en GPUs de 8-12 GB de VRAM, lo que facilita pruebas locales en estaciones de trabajo modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en FP16/BF16**: aproximadamente 24,5 GB de pesos, más overhead de activaciones y KV cache; se recomienda 32 GB o más.
- **VRAM estimada en cuantización de 8 bits**: en torno a 13-14 GB.
- **VRAM estimada en cuantización de 4 bits**: en torno a 7-8 GB, con margen para contexto moderado.
- **GPUs recomendadas**: A100 40/80 GB, H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para 8 bits.
- **GPUs de consumo**: cabe en RTX 4090, RTX 3090, RTX 4080 y, en 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM, TGI y transformers con safetensors; la model card referencia cuantizaciones publicadas.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Impish_Bloodmoon_12B | 12,2B | 128.000 (heredado) | Apache 2.0 | Fine-tune comunitario de Mistral-Nemo |
| Mistral-Nemo-Instruct-2407 | 12,2B | 128.000 | Apache 2.0 | Modelo base oficial de Mistral AI y NVIDIA |
| Mistral 7B Instruct | 7,3B | 32.000 | Apache 2.0 | Alternativa más ligera de la misma familia |
| Gemma 2 9B Instruct | 9,2B | 8.192 | Gemma license | Alternativa de Google con contexto menor |

## Limitaciones y advertencias

- **Documentación insuficiente**: la model card no detalla hiperparámetros, composición del dataset ni evaluación, lo que dificulta reproducir o auditar el entrenamiento.
- **Idioma**: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- **Sesgos**: al ser un fine-tune sobre un dataset privado no documentado, no se pueden evaluar los sesgos introducidos; se heredan además los del modelo base.
- **Alucinación**: riesgo presente como en cualquier LLM de esta escala, sin evaluaciones publicadas que lo mitiguen.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset, que no se detallan.
- **Producción**: la falta de benchmarks y de información sobre estabilidad desaconseja su uso en entornos críticos sin evaluación propia previa.
- **Contexto**: aunque se heredan 128.000 tokens del modelo base, la model card no confirma explícitamente que el fine-tune preserve esa ventana.

## Enlaces

- [Hugging Face: SicariusSicariiStuff/Impish_Bloodmoon_12B](https://huggingface.co/SicariusSicariiStuff/Impish_Bloodmoon_12B)
- [Modelo base: mistralai/Mistral-Nemo-Instruct-2407](https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407)
- [Dataset: SicariusSicariiStuff/UBW_Tapestries](https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries)
- [Repositorio de tarjetas de rol](https://huggingface.co/SicariusSicariiStuff/Roleplay_Cards)
- [Repositorio de tarjetas de aventura](https://huggingface.co/SicariusSicariiStuff/Adventure_Cards)
- [Ko-fi del autor](https://ko-fi.com/sicarius)
