# BeardedMonster/gemma-3-385m-translate-best

## Resumen

`BeardedMonster/gemma-3-385m-translate-best` es un modelo de traducción automática de inglés a lenguas africanas, desarrollado por el usuario BeardedMonster como resultado de un estudio sobre modelos de 385M de parámetros. Se construye a partir de `google/gemma-3-270m-it` mediante un proceso de crecimiento de parámetros, fine-tuning supervisado sobre datos descontaminados de inglés a X y un posterior entrenamiento con GRPO (Group Relative Policy Optimization) usando recompensas de estimación de calidad sin referencia. El resultado es un `Gemma3ForCausalLM` de 385.144.448 parámetros con 39 capas y dimensión oculta de 640.

La relevancia del modelo radica en su enfoque: cubre 125 etiquetas de idioma africano de un solo token, incluyendo lenguas de bajos recursos como yoruba, hausa, igbo, criollo nigeriano, ewé, fon, wolof, bambara, entre muchas otras. Frente a los modelos multilingües generalistas, que suelen tener un rendimiento pobre en lenguas africanas de bajos recursos, este modelo especializa un transformer pequeño en la dirección inglés a lengua africana, lo que lo hace adecuado para despliegues con recursos limitados.

Se trata de un lanzamiento de investigación: un solo semilla de entrenamiento, sin evaluación humana, y con la limitación explícita de que solo soporta la dirección inglés a africano. El modelo se distribuye bajo licencia Gemma y está pensado para experimentación y despliegues de bajo coste donde la latencia y el tamaño importan más que la calidad de traducción de un modelo grande.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3ForCausalLM) |
| Parámetros totales | 385.144.448 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card usa `max_model_len=4096` en vLLM) |
| Tipos de cuantización | no disponible (pesos en safetensors, bfloat16 recomendado) |
| Idiomas soportados | inglés y 125 etiquetas de lenguas africanas (yoruba, hausa, igbo, pcm, efik, twi, ewé, fon, wolof, suajili, kinyarwanda, somalí, oromo, amárico, tigriña, luganda, lingala, zulú, xhosa, afrikáans, chichewa, kirundi, sesoto, setsuana, sepedi, malgache, entre otras) |
| Licencia | Gemma (términos en ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, con 39 capas y dimensión oculta de 640, derivado de `google/gemma-3-270m-it` mediante un proceso de crecimiento hasta 385M de parámetros. El entrenamiento se realizó en dos fases: primero un fine-tuning supervisado sobre datos de traducción inglés a X descontaminados, y después un ajuste con GRPO empleando recompensas de estimación de calidad sin referencia (reference-free quality-estimation rewards). Los pesos publicados corresponden a la rama `main` del repositorio `AletheiaAING/gemma-0.4B-translate-rl`, en el paso 50 de 60 de la etapa mixta ("mixed best").

La innovación principal es el uso de 125 etiquetas de idioma de un solo token: el modelo responde con un token de etiqueta (`<yor>`, `<hau>`, etc.) seguido de la traducción y `<end_of_turn>`. El prompt de entrenamiento es único y estricto: `Translate the text to {nombre_idioma}:  {texto}` con dos espacios tras los dos puntos, usando el nombre del idioma y no el código ISO. La decodificación recomendada es greedy (`temperature=0`), `max_new_tokens=256` para frases (768 en la evaluación del paper) y parada en `<end_of_turn>` (id 106). Un `frequency_penalty=0.1` en vLLM actúa como protección opcional contra repeticiones; según la model card, cambió el chrF++ medio de 93 celdas de 34,55 a 34,84. Beam search y MBR apenas modificaron el resultado (en torno a un chrF++ o menos en 20 idiomas × 200 frases).

## Capacidades

- Traducción de inglés a 125 lenguas africanas, con etiqueta de idioma de un solo token en la salida.
- Generación de texto condicionada por el formato de prompt específico de traducción.
- Soporte de plantilla de chat de Gemma 3 (`apply_chat_template` con `add_generation_prompt=True`).
- Compatible con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- Capacidad multilingüe limitada a la dirección inglés a africano; no soporta africano a inglés.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de contenido web y documentación a lenguas africanas de bajos recursos: el modelo permite generar versiones en yoruba, hausa, suajili o zulú de páginas y manuales con un coste de inferencia mínimo, adecuado para organizaciones con presupuesto limitado.
- Localización de interfaces y mensajes de aplicación: al ser un modelo de 385M, puede ejecutarse en CPU o GPU de gama baja y traducir cadenas cortas en tiempo real dentro de un pipeline de i18n.
- Atención al cliente en lenguas locales: integrado en un sistema de chat, permite responder a usuarios en suajili, amárico o criollo nigeriano traduciendo respuestas generadas en inglés, con latencia baja gracias al tamaño reducido.
- Traducción de material educativo y sanitario: ONGs y organismos públicos pueden traducir folletos y guías a lenguas como wolof, bambara o chichewa, con revisión humana posterior dado que no hay evaluación humana en el lanzamiento.
- Investigación en traducción automática de bajos recursos: sirve como baseline reproducible para estudiar el efecto de GRPO y de las etiquetas de un solo token en lenguas africanas, con pesos y receta documentados.
- Procesamiento por lotes de corpus inglés a lenguas africanas: con vLLM y `max_model_len=4096`, se pueden traducir grandes volúmenes de frases en una sola pasada, enviando una frase o párrafo corto por prompt.
- Despliegue en dispositivos con recursos limitados: el tamaño de 385M y los pesos en safetensors (repo de 1,6 GB) permiten ejecución en GPUs de consumo e incluso en CPU para traducciones de frases cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un chrF++ medio de 34,55 en 93 celdas de evaluación (34,84 con `frequency_penalty=0.1`), pero no se aportan tablas comparativas con otros modelos ni resultados por idioma en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 0,8 GB para los pesos (385M × 2 bytes); en fp32, unos 1,6 GB. Con overhead de activaciones y caché KV, se recomienda al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como RTX 3050, RTX 4060, RTX 4090, A100 o H100. El modelo es pequeño y no requiere GPUs de datacenter.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers, vLLM (recomendado en la model card con `dtype="bfloat16"` y `max_model_len=4096`), text-generation-inference (tag `text-generation-inference`). No se documenta soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BeardedMonster/gemma-3-385m-translate-best | 385M | no disponible (4096 en vLLM) | inglés + 125 lenguas africanas | Gemma | Hugging Face |
| google/gemma-3-270m-it | 270M | no disponible | multilingüe general | Gemma | Hugging Face |
| BeardedMonster/gemma-3-385m-science-translate-best | 385M | no disponible | inglés + lenguas africanas (dominio científico) | Gemma | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta la dirección inglés a lengua africana; no se soporta africano a inglés en esta versión.
- El prompt debe seguir exactamente el formato entrenado: nombre del idioma (no código ISO) y dos espacios tras los dos puntos. Desviarse del formato degrada la calidad.
- El modelo responde con una etiqueta de idioma de un solo token al inicio; es necesario eliminarla en postprocesado.
- Lanzamiento de investigación: una sola semilla de entrenamiento y sin evaluación humana, por lo que la calidad en producción no está validada.
- Solo 58 de las 125 lenguas tienen puntuaciones basadas en referencia para este modelo; el resto no tienen conjunto de test o no fueron evaluadas.
- Riesgo de alucinación y de traducciones inexactas en lenguas de muy bajos recursos, donde los datos de entrenamiento son escasos.
- Entradas largas deben dividirse en frases o párrafos cortos; el modelo está entrenado con una frase o párrafo corto por prompt.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google (ai.google.dev/gemma/terms), que incluyen restricciones de uso aceptable.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse que las tenga.
- No se dispone de información sobre sesgos específicos ni sobre latencia en producción.

## Enlaces

- Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-385m-translate-best
- Modelo científico relacionado: https://huggingface.co/BeardedMonster/gemma-3-385m-science-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Repositorio de pesos original: https://huggingface.co/AletheiaAING/gemma-0.4B-translate-rl
- Licencia Gemma: https://ai.google.dev/gemma/terms
