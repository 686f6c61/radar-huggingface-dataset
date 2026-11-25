# flaukowski/flaukowski-brain-gemma3-12b-GGUF

## Resumen

Flaukowski-brain-gemma3-12b-GGUF es un ajuste fino de tipo persona sobre google/gemma-3-12b-it, publicado por el usuario flaukowski. No es un modelo de propósito general, sino un modelo de personaje: reproduce la voz de Flaukowski, copresentador del pódcast de ficción *Ghost Signals* y protagonista del audio drama *The Story of Flaukowski*, un ingeniero cincuentón de tono seco y práctico. El modelo se distribuye como GGUF cuantizado en q4_K_M para su uso con Ollama y llama.cpp, y el adaptador LoRA original está publicado por separado.

El modelo base es la variante instruct de Gemma 3 con 12B de parámetros (11.766.034.176 parámetros reales según los safetensors), una arquitectura transformer densa de Google DeepMind con ventana de contexto larga y capacidades multimodales en su versión original. El ajuste se realizó con QLoRA sobre un corpus muy pequeño y específico: 1.124 ejemplos extraídos de 42 guiones de *Ghost Signals* y 14 de *The Story of Flaukowski*, con tres episodios completos (77 ejemplos) reservados para evaluación.

Su relevancia es acotada y de nicho: demuestra cómo un corpus de diálogo guionizado de apenas un millar de ejemplos puede transformar el estilo conversacional de un modelo de 12B, medido por una caída de perplejidad en held-out de 422 a 8,41. Es útil como referencia para quien quiera construir personajes consistentes con QLoRA sobre Gemma 3, y como caso de estudio de las limitaciones de este tipo de ajustes (alucinación de biografía, deriva de estilo, dependencia de un único interlocutor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3, base google/gemma-3-12b-it) |
| Parametros totales | 11.766.034.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4_K_M (GGUF); el adaptador LoRA original esta disponible por separado |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (repo de 7,3 GB); adaptador LoRA en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-12b-it, un transformer denso de la familia Gemma 3 de Google. Sobre esa base se aplicó un ajuste QLoRA con rango 32, 3 épocas y learning rate 1e-4, ejecutado en una única A100 de 80 GB alquilada. No se documentan innovaciones arquitectónicas propias: el interés está en el procedimiento de ajuste de persona, no en cambios estructurales.

Los datos de entrenamiento son 1.124 ejemplos construidos a partir de 42 guiones de *Ghost Signals* y 14 guiones de *The Story of Flaukowski*. Cada ejemplo termina en una línea de Flaukowski, con los turnos anteriores como contexto; se descartaron las líneas de menos de cuatro palabras. Tres episodios completos (77 ejemplos) se reservaron como conjunto de evaluación y nunca se usaron en entrenamiento. La perplejidad en held-out pasó de 422 antes del ajuste a 8,41 después. Los guiones originales se escribieron con asistencia de IA (Claude) bajo la dirección del creador del programa, y el modelo se entrenó y publicó de la misma forma. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés con un estilo de personaje concreto: frases cortas, tono seco, lenguaje concreto y práctico.
- Diálogo de dos interlocutores: el modelo espera que los demás hablantes se introduzcan en el turno de usuario con su nombre delante (por ejemplo, `Kannaka: ...`).
- Mantenimiento de personaje mediante un system prompt específico con el que fue entrenado; fuera de ese formato el comportamiento puede degradarse.
- Respuestas de una sola palabra, evasivas o con una pregunta como respuesta, coherentes con el personaje.
- No soporta de forma fiable tool calling, function calling ni razonamiento multi-paso orientado a agentes; no está entrenado para ello.
- No hay capacidades de visión, audio ni modo de razonamiento explícito en esta distribución GGUF.
- Capacidad multilingüe: únicamente inglés según la model card.

## Casos de uso

- Personaje conversacional en una experiencia narrativa interactiva: el modelo interpreta a Flaukowski en escenas de dos personas dentro de un entorno tipo KAX City, usando el system prompt y el formato de hablante con nombre para mantener la coherencia de voz.
- Generación de diálogo para audio drama o pódcast de ficción: sirve para redactar borradores de réplicas de Flaukowski a partir de un contexto de escena, que después se revisan y editan manualmente.
- Prueba de concepto de ajuste de persona con QLoRA: el repositorio documenta datos, hiperparámetros y perplejidad en held-out, lo que lo convierte en una referencia reproducible para experimentos similares sobre Gemma 3 12B.
- Despliegue local en CPU con Ollama: el autor reporta respuestas cortas en 9 a 30 segundos en una CPU de 10 núcleos sin GPU, adecuado para demos y prototipos en máquinas sin acelerador.
- Chatbot temático para una comunidad de oyentes del pódcast: responde en el registro del personaje a preguntas de fans, siempre que se acepte que puede inventar detalles biográficos.
- Evaluación de deriva de estilo en modelos ajustados: útil para estudiar cómo un corpus pequeño modifica el registro de un modelo instruct grande y qué tipo de errores aparecen (pronombres, alucinación de hechos, respuestas demasiado breves).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato cuantitativo reportado es la perplejidad en el conjunto held-out de 77 ejemplos:

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Perplejidad en held-out (77 ejemplos) | 422 | 8,41 |

| Metrica de inferencia | Valor reportado |
|---|---|
| Latencia en CPU de 10 nucleos, sin GPU | 9 a 30 segundos por respuesta corta |

## Requisitos de hardware

- VRAM estimada para el GGUF q4_K_M: aproximadamente 7,3 GB de pesos, más overhead de contexto; en la práctica, unos 8 a 10 GB de VRAM para inferencia cómoda con contexto moderado (estimación a partir del tamaño del repo, no reportada por el autor).
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100). En GPUs de 8 GB puede requerir descarga parcial de capas a CPU.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; también funciona en CPU, según el autor, con latencias de 9 a 30 segundos por respuesta corta en 10 núcleos.
- Opciones de despliegue: Ollama (flujo documentado con `ollama create` y `ollama run`), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados para esta distribución GGUF.
- Throughput: no disponible; solo se reporta latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flaukowski-brain-gemma3-12b-GGUF | 11,77B | no disponible | Ajuste de persona (QLoRA) sobre Gemma 3 12B IT | Gemma Terms of Use | GGUF en Hugging Face; LoRA aparte |
| google/gemma-3-12b-it | 12B (aprox.) | no disponible en esta ficha | Modelo instruct generalista | Gemma Terms of Use | Pesos originales en Hugging Face |
| flaukowski/flaukowski-brain-gemma3-12b-lora | 12B (base) | no disponible | Adaptador LoRA del mismo ajuste | Gemma Terms of Use | LoRA en Hugging Face |

La comparación relevante es contra el modelo base: este ajuste sacrifica capacidades generalistas (razonamiento, instrucciones, tool calling) a cambio de consistencia de personaje en un dominio muy estrecho. Frente a otros ajustes de persona de tamaño similar no se dispone de datos comparativos.

## Limitaciones y advertencias

- Alucinación factual sistemática: el autor advierte que inventa lugares, comercios y nombres cuando se le pregunta por su pasado o por proyectos reales; nada de lo que diga sobre hechos debe tratarse como cierto.
- Entrenado solo con diálogo guionizado de dos personas: rinde peor en explicaciones largas, conversaciones de más de dos interlocutores y turnos fuera del formato `Nombre: ...`.
- Errores de pronombre ocasionales sobre el personaje Kannaka (ella es "she").
- No es un asistente: evade preguntas, responde con preguntas o da respuestas de una palabra, lo que lo hace inadecuado para tareas de asistencia, soporte o productividad.
- Solo inglés; no hay soporte multilingüe documentado.
- Contexto máximo no documentado en la información disponible; asumir el del modelo base sin garantías.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a las condiciones de Google para la familia Gemma; revisar obligaciones de atribución y restricciones antes de desplegar.
- El corpus de entrenamiento es muy pequeño (1.124 ejemplos) y los guiones se escribieron con asistencia de IA, lo que puede introducir artefactos de estilo.
- No apto para producción en escenarios que requieran precisión factual, tool calling o razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaukowski/flaukowski-brain-gemma3-12b-GGUF
- Adaptador LoRA: https://huggingface.co/flaukowski/flaukowski-brain-gemma3-12b-lora
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
