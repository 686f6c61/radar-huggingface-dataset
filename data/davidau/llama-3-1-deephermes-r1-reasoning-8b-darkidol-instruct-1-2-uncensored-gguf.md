# DavidAU/Llama-3.1-DeepHermes-R1-Reasoning-8B-DarkIdol-Instruct-1.2-Uncensored-GGUF

## Resumen

Llama-3.1-DeepHermes-R1-Reasoning-8B-DarkIdol-Instruct-1.2-Uncensored es un modelo de lenguaje de 8.030 millones de parámetros desarrollado por DavidAU, un creador independiente de la comunidad de Hugging Face especializado en fusiones y fine-tunes. Se trata de un merge construido con mergekit sobre Llama 3.1, que combina el comportamiento de razonamiento y "thinking" de la familia DeepHermes con el perfil de fine-tune sin censura de la serie DarkIdol. El resultado es un modelo orientado a generación creativa, escritura de ficción, roleplay y resolución de problemas con cadenas de pensamiento explícitas.

El modelo parte de la arquitectura transformer densa de Llama 3.1 (8B) y hereda su ventana de contexto de 128.000 tokens, lo que lo sitúa en la gama de modelos de 8B desplegables en hardware de consumo. Su principal atractivo es la combinación de dos capacidades poco habituales de encontrar juntas: razonamiento con etiquetas `<think>` y ausencia de alineación de seguridad, lo que lo hace adecuado para narrativa adulta, horror, roleplay sin restricciones y ejercicios de brainstorming sin filtros.

Es relevante ahora porque representa una categoría consolidada en el ecosistema abierto: los merges comunitarios que reutilizan pesos de Llama 3.1 con licencia Apache 2.0 para ofrecer variantes especializadas que los modelos oficiales no cubren. La distribución en formato GGUF (repo de 55,8 GB con múltiples cuantizaciones) facilita su ejecución en llama.cpp, Ollama y otros motores de inferencia local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), merge con mergekit |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | GGUF (múltiples niveles; el repo ocupa 55,8 GB en total) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base subyacente se distribuye en safetensors |
| Modelo base | DavidAU/Llama-3.1-DeepHermes-R1-Reasoning-8B-DarkIdol-Instruct-1.2-Uncensored |
| Plantilla de prompt | Llama 3 Instruct o plantilla Jinja autocargada incluida en el GGUF |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 en su variante de 8B: un transformer decoder-only denso con atención por grupos (GQA) y RoPE, sin mecanismos híbridos ni mezcla de expertos. Sobre esa base, el autor aplica una fusión de pesos mediante mergekit que integra, por un lado, el comportamiento de razonamiento de DeepHermes (generación de cadenas de pensamiento dentro de etiquetas `<think>`) y, por otro, el perfil de fine-tune sin censura de DarkIdol Instruct 1.2. No se dispone de información publicada sobre el número exacto de tokens de entrenamiento, la composición del dataset de fine-tune ni si se emplearon técnicas de RLHF o DPO en las etapas intermedias.

La innovación técnica destacable no está en la arquitectura sino en la composición del merge: el modelo mantiene el modo de razonamiento activable mediante system prompt, y según el autor el razonamiento se produce a cualquier temperatura de muestreo. La model card documenta tres plantillas de system prompt (simple, lógica y creativa) que modulan la profundidad del bloque `<think>`, con la indicación de que el bloque de razonamiento debe contener al menos seis pasos cuando proceda y de que el usuario no ve dicho bloque. Estas plantillas provienen del trabajo de Eric Hartford (Cognitive Computations) y son reutilizables en otros modelos de razonamiento.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 128.000 tokens.
- Razonamiento explícito con modo "thinking": produce bloques `<think>...</think>` antes de la respuesta final, activables mediante system prompt.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de relatos y storytelling.
- Roleplay sin restricciones de contenido, incluido contenido NSFW, horror y lenguaje soez (según la model card).
- Resolución de problemas y acertijos (riddles), brainstorming y razonamiento paso a paso.
- Funcionamiento a cualquier temperatura de muestreo manteniendo el comportamiento de razonamiento (afirmación del autor).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso más allá del razonamiento interno.
- Capacidades multilingües limitadas: el modelo está etiquetado únicamente para inglés.
- No dispone de visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Escritura de ficción larga: el modelo puede mantener coherencia narrativa en relatos de decenas de miles de tokens gracias a la ventana de 128k, generando tramas, subtramas y continuaciones de escena sin perder el hilo argumental.
- Roleplay conversacional sin filtros: adecuado para entornos de entretenimiento adulto o simulación de personajes donde los modelos alineados rechazan el contenido; el perfil DarkIdol evita las negativas de seguridad.
- Generación de contenido de terror y horror: la combinación de escritura creativa sin censura y lenguaje soez permite producir narrativa de género sin las restricciones habituales de los modelos oficiales.
- Brainstorming y resolución de acertijos: el modo thinking con al menos seis pasos de razonamiento resulta útil para descomponer problemas lógicos, generar hipótesis y explorar soluciones alternativas.
- Asistente creativo local en hardware de consumo: al ser un 8B en GGUF, puede ejecutarse en una RTX 4090 o incluso en GPUs de 12-16 GB con cuantizaciones Q4, lo que permite desplegar un asistente de escritura privado sin conexión a la nube.
- Prototipado de pipelines de razonamiento: sirve como banco de pruebas para evaluar plantillas de system prompt con etiquetas `<think>` antes de migrarlas a modelos mayores, ya que las plantillas documentadas son portables a otros modelos de razonamiento.
- Generación de datos sintéticos de ficción: puede producir corpus narrativos diversos (diálogos, descripciones, escenas) para entrenamiento o evaluación de otros modelos, con la advertencia de revisar el contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas cuantitativas con otros modelos; únicamente presenta tres generaciones de ejemplo sin evaluación sistemática.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en cuantización Q4_K_M, 8-9 GB en Q8_0 y en torno a 16 GB en FP16.
- GPU recomendadas: RTX 4090 (24 GB) para FP16 o cuantizaciones altas con contexto largo; RTX 3090, RTX 4080 y A100/H100 para despliegues con contexto completo de 128k.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con cuantizaciones Q4; en 12-16 GB se puede usar Q8 o contexto extendido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF. Para vLLM o TGI sería necesario convertir a safetensors o usar el modelo base no cuantizado.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DeepHermes-R1-DarkIdol 8B) | 8,03B | 128k | Apache 2.0 | Razonamiento + sin censura + ficción | GGUF en HF |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128k | Llama 3.1 Community License | Asistente general alineado | Safetensors y GGUF |
| DeepSeek-R1-Distill-Llama-8B | 8,03B | 128k | MIT | Razonamiento destilado | Safetensors y GGUF |
| DarkIdol-Llama-3.1-8B-Instruct | 8,03B | 128k | Apache 2.0 | Fine-tune sin censura | Safetensors y GGUF |

La diferencia principal frente a Llama 3.1 Instruct y DeepSeek-R1-Distill es la ausencia de alineación de seguridad y la orientación a ficción adulta; frente a DarkIdol puro, añade el modo de razonamiento explícito. No se dispone de comparativas de rendimiento cuantitativas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar material NSFW, lenguaje soez y contenido perturbador; no es apto para aplicaciones dirigidas al público general ni para entornos sin moderación.
- Riesgo de alucinación: al ser un merge de fine-tunes creativos, la precisión factual no está garantizada y no se han publicado evaluaciones de veracidad.
- Idiomas: solo inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas de moderación de plataformas o legislación local sobre material adulto.
- Contexto: aunque se declaran 128k tokens, el rendimiento efectivo en contextos muy largos no está verificado y los merges pueden degradar la coherencia más allá de cierta longitud.
- Sin soporte documentado de tool calling ni function calling, lo que limita su integración en pipelines de agentes que dependan de APIs estructuradas.
- Modelo comunitario sin evaluación formal: no hay benchmarks publicados, por lo que las afirmaciones de la model card sobre calidad y razonamiento no están respaldadas por métricas independientes.
- El razonamiento a cualquier temperatura es una afirmación del autor no verificada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama-3.1-DeepHermes-R1-Reasoning-8B-DarkIdol-Instruct-1.2-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Llama-3.1-DeepHermes-R1-Reasoning-8B-DarkIdol-Instruct-1.2-Uncensored
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
