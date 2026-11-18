# AlexWortega/Qwen3.8-27B-antislop

## Resumen

Qwen3.8-27B-antislop es un ajuste fino (post-entrenamiento) del modelo Qwen/Qwen3.8-27B, desarrollado por AlexWortega y publicado en Hugging Face. Su objetivo es corregir el denominado "AI slop": la tendencia de los modelos de lenguaje a producir prosa fluida pero genérica, con clichés, cierres motivacionales vacíos y abstracciones que imitan superficialmente la escritura humana sin aportar concreción. El modelo aplica una variante del trabajo unslop / RL-XAR de Meta FAIR, usando GRPO con recompensas basadas en rúbricas calibradas por dominio y un juez ciego a la longitud.

El modelo conserva la arquitectura del base (etiquetado internamente como `qwen3_5` en los tags de Hugging Face, con pipeline `image-text-to-text`), cuenta con 27.781.427.952 parámetros y se distribuye bajo licencia Apache 2.0. Está orientado a escritura creativa, ensayo, blogs y publicaciones breves, y su relevancia actual radica en que demuestra que el ajuste por RL con rúbricas expertas puede superar a jueces LLM convencionales, que a menudo prefieren texto generado por modelo frente a texto humano experto.

El modelo se publica con resultados destacados en EQ-Bench 4 (puesto 4 de 29, Elo 1320,1) y una mejora sustancial en la calidad de prosa evaluada por rúbrica (q media de 6,31 en el base a 8,28 en el ajustado). El repo ocupa 181 GB e incluye pesos en safetensors; existe además una versión GGUF publicada por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B; tag interno `qwen3_5`); detalles de atención y capas no disponibles |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantización | no disponible en la información proporcionada; existe versión GGUF publicada aparte |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y se post-entrena sobre una porción de prosa solo texto. El método sigue la línea de RL-XAR de Meta FAIR: para cada extracto experto (tuits del Broad Twitter Corpus, resúmenes científicos de arXiv y ensayos de blog de PG, Sivers y sama) se genera una rúbrica congelada por ítem que permanece fija durante todo el entrenamiento, evitando la deriva de rúbricas. Un juez Claude Opus calibrado, con prompt de sistema ciego a la longitud, puntúa cada candidato contra su rúbrica en una escala de calidad de 0 a 10.

La recompensa combina un factor de longitud respecto a la longitud objetivo del ítem y una normalización por dominio: `reward = L(words, target) · σ(a_d · (q − μ_d))`, donde `(μ_d, a_d)` se ajustan sobre la distribución de referencia de Qwen3.8-27B. El entrenamiento usa GRPO sobre el modelo base mediante verl, con batch de 128 (16 prompts × 8 muestras), 100 pasos, learning rate 2e-5, `kl_loss_coef` de 0,002 y thinking desactivado. La generación se sirve con vLLM colocado junto a FSDP. A lo largo de los 100 pasos la recompensa media subió de aproximadamente 0,35 a 0,55 y la entropía se estabilizó de 1,5 a cerca de 0,43, lo que indica convergencia hacia una voz consistente.

## Capacidades

- Generación de texto en prosa: ensayos, blogs, tuits y resúmenes con estilo concreto y evitando clichés de modelo.
- Escritura creativa y continuaciones de texto con voz propia, orientada a calidad literaria más que a exhaustividad.
- Generación de resúmenes científicos y abstracts con control de longitud objetivo.
- Conversación multi-turno (tag `conversational`).
- Procesamiento de imagen y texto según el pipeline declarado (`image-text-to-text`), aunque el post-entrenamiento se realizó sobre una porción solo texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el entrenamiento se hizo con thinking desactivado.
- Capacidades multilingües limitadas a inglés y ruso según la model card.
- Modo thinking: el modelo base lo soporta, pero el ajuste y la evaluación se realizaron con `enable_thinking=false`; se recomienda servirlo con thinking desactivado y un parser de razonamiento.

## Casos de uso

- Generación de contenido editorial y blogs: el modelo produce prosa concreta y en voz propia, adecuada para artículos de opinión, ensayos y newsletters donde se quiere evitar el tono genérico de LLM. Su entrenamiento con rúbricas de blogs (PG, Sivers, sama) lo hace especialmente indicado para este dominio.
- Redacción de resúmenes científicos: entrenado con abstracts de arXiv y recompensado por calidad y longitud objetivo, puede generar resúmenes concisos sin el exceso de cifras y cobertura típico de los modelos base.
- Comunicación en redes sociales: los tuits del Broad Twitter Corpus forman parte del entrenamiento, por lo que puede redactar publicaciones breves con tono humano y sin sonar a cuenta de marca.
- Asistencia de escritura creativa: útil para continuar textos, proponer variantes de un párrafo o reescribir pasajes eliminando fórmulas vacías, gracias a su convergencia hacia una voz consistente.
- Ficción y narrativa conversacional: con decodificación a temperatura 0,8 y thinking desactivado, puede mantener diálogos y escenas con registro natural, según los ejemplos de la model card.
- Evaluación y filtrado de texto generado: puede emplearse como generador de referencia en pipelines que comparan calidad de prosa frente a otros modelos, dado su rendimiento en EQ-Bench 4.
- Despliegue en entornos con vLLM: el autor documenta un comando de servicio con `--reasoning-parser qwen3` y `--max-model-len 32768`, lo que facilita su integración en infraestructura de inferencia estándar.

## Benchmarks y rendimiento

Calidad de prosa en held-out, evaluada por el mismo juez Opus calibrado ciego a la longitud sobre las mismas rúbricas congeladas:

| Modelo | q media (0-10) | Tuits | Artículos | Blogs |
|---|---|---|---|---|
| base Qwen3.8-27B | 6,31 | 7,18 | 5,75 | 5,53 |
| Qwen3.8-27B-antislop | 8,28 | 8,76 | 6,94 | 8,03 |
| Altworld/Hemmingway-1 | 7,10 | 7,66 | 7,06 | 6,56 |

Win-rate por ítem (mayor q): antislop vs base 50-0 (2 empates); antislop vs Hemmingway-1 43-6 (3 empates), un 82,7%.

EQ-Bench 4 (configuración oficial del leaderboard, Elo con IC 95%):

| Puesto | Modelo | Elo (IC 95%) |
|---|---|---|
| 1 | claude-opus-5 | 1382,9 (1366-1401) |
| 2 | moonshotai/kimi-k3 | 1334,6 (1321-1349) |
| 3 | claude-fable-5 | 1330,9 (1320-1342) |
| 4 | Qwen3.8-27B-antislop | 1320,1 (1309-1332) |
| 5 | openai/gpt-5.5 | 1314,4 (1304-1323) |
| 6 | claude-opus-4-7 | 1307,9 (1298-1318) |
| 7 | claude-opus-4-8 | 1277,8 (1265-1289) |
| ... | 22 modelos más | hasta mistral-medium-3-5, 988,3 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 27.781 millones de parámetros, en FP16 se requieren aproximadamente 55,6 GB solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo en FP16 requiere GPUs de 80 GB (A100, H100) o configuraciones multi-GPU; en cuantizaciones de 8 bits o 4 bits podría caber en GPUs de 40-48 GB.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; la existencia de una versión GGUF sugiere que puede ejecutarse en configuraciones de consumo con cuantización agresiva, pero no se detallan requisitos.
- Opciones de despliegue: vLLM, con el comando documentado `vllm serve AlexWortega/Qwen3.8-27B-antislop --served-model-name antislop --reasoning-parser qwen3 --default-chat-template-kwargs '{"enable_thinking": false}' --max-model-len 32768`. También hay pesos en transformers y una versión GGUF para llama.cpp u Ollama, aunque no se documentan instrucciones específicas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EQ-Bench 4 (Elo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-antislop | 27,78 B | no disponible (ejemplo con 32768) | 1320,1 | Apache 2.0 | Hugging Face, GGUF, Space |
| Qwen3.8-27B (base) | 27,78 B | no disponible | no figura en el top del leaderboard mostrado | según modelo base | Hugging Face |
| Altworld/Hemmingway-1 | no disponible | no disponible | no figura en el top mostrado | no disponible | Hugging Face |
| claude-opus-5 | no disponible (propietario) | no disponible | 1382,9 | propietaria | API |
| openai/gpt-5.5 | no disponible (propietario) | no disponible | 1314,4 | propietaria | API |

## Limitaciones y advertencias

- El ajuste se realizó sobre una porción solo texto, aunque el pipeline declarado sea `image-text-to-text`; el rendimiento multimodal no está evaluado en la información disponible.
- Idiomas soportados limitados a inglés y ruso; no se garantiza calidad en castellano.
- Riesgo de alucinación inherente al modelo base; el ajuste no aborda explícitamente la veracidad factual, solo el estilo.
- El modelo está optimizado para estilo de prosa; puede degradar el rendimiento en tareas de razonamiento, matemáticas o código respecto al base, aunque no se aportan datos al respecto.
- Sesgos conocidos: no documentados en la información proporcionada; los datos de entrenamiento (Broad Twitter Corpus, arXiv, blogs de autores concretos) pueden introducir sesgos de dominio y de estilo.
- La evaluación se basa en un juez Claude Opus calibrado y en EQ-Bench 4; los resultados pueden no generalizar a otros evaluadores o dominios.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- Para producción, es necesario servir el modelo con thinking desactivado y un parser de razonamiento; de lo contrario, los jueces y las personas pueden leer el razonamiento interno y falsear las evaluaciones.
- El template de chat de Qwen abre `<think>` dentro del prompt, lo que produce un `</think>` huérfano en la respuesta; hay que comprobar que el contenido no incluya esa etiqueta antes de evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexWortega/Qwen3.8-27B-antislop
- Demo (Space): https://huggingface.co/spaces/AlexWortega/antislop-27b
- Versión GGUF: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-GGUF
- rawmodels.ai: https://www.rawmodels.ai
- Paper original unslop / RL-XAR (Meta FAIR): https://facebookresearch.github.io/RAM/blogs/unslop/
- Entorno RL: https://huggingface.co/datasets/rawmodels/unslop-harbor
- Reproducción: REPRODUCE.md (en el repositorio del modelo)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- EQ-Bench 4: https://github.com/EQ-bench/eqbench4
