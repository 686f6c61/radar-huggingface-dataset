# open-athena/Qwen3.5-35B-A3B-Chat-Aligned-Base-2026.10.31

## Resumen

Qwen3.5-35B-A3B-Chat-Aligned-Base-2026.10.31 es un artefacto de investigación publicado por open-athena: se trata del modelo preentrenado Qwen/Qwen3.5-35B-A3B-Base (revisión `0f081307`) tras un ajuste fino supervisado (SFT) corto sobre conversaciones de agente de terminal en el formato de chat propio de Qwen3.5. No es un asistente terminado ni uno de los modelos instruction-tuned oficiales de Qwen: no ha recibido ajuste de preferencias ni de seguridad, y el autor lo describe explícitamente como un punto de partida para investigación en post-entrenamiento.

El modelo emplea una arquitectura MoE (`Qwen3_5MoeForConditionalGeneration`) con 40 capas que alternan tres capas de atención lineal Gated DeltaNet y una capa de atención completa, 256 expertos enrutados (top-8) más un experto compartido, y un codificador visual heredado del modelo base. Con 35,1 mil millones de parámetros totales y unos 3 mil millones activos por token, ofrece una ventana de contexto nativa de 262.144 tokens, lo que lo sitúa en la categoría de modelos MoE de gran contexto con coste de inferencia reducido.

Su relevancia es doble: por un lado, sirve como base chat-capable comparable dentro de un experimento de Marin sobre destilación on-policy (OPD) y su interferencia entre tareas en arquitecturas MoE; por otro, su formato de chat, su plantilla de herramientas en XML y su compatibilidad con vLLM lo convierten en un banco de pruebas útil para quienes investigan agentes de terminal y post-entrenamiento, siempre con las cautelas propias de un modelo sin evaluar formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (`qwen3_5_moe`): 40 capas con patrón repetido de 3 capas Gated DeltaNet (atención lineal) y 1 capa de atención completa (16 cabezas de consulta, 2 cabezas KV); 256 expertos enrutados (top-8) + 1 experto compartido; codificador visual incluido |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | 262.144 tokens nativos (evaluado a 262.144) |
| Tipos de cuantizacion | No disponible (los pesos publicados son bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (bf16, 3 shards, 70 GB); tokenizer incluido (248.320 tokens) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE híbrido: 40 capas en las que se repite un patrón de tres capas de atención lineal Gated DeltaNet seguidas de una capa de atención completa con 16 cabezas de consulta y 2 cabezas KV. El bloque MoE cuenta con 256 expertos enrutados con activación top-8 más un experto compartido, lo que da 35,1B parámetros totales con unos 3B activos por token. El checkpoint conserva el codificador visual y el procesador de imágenes del modelo base (`processor_config.json`), aunque el entrenamiento fue exclusivamente de texto.

El entrenamiento consistió en una única etapa de SFT sobre `nvidia/Nemotron-Terminal-Corpus` (revisión `a1667c4`): 703 pasos, 1,47B tokens de los cuales 0,65B fueron efectivamente entrenados, con secuencias empaquetadas de 32.768 tokens, 64 secuencias por paso y una época. Se usó AdamW (`adamw_torch_fused`, β 0,9/0,95, ε 1e-8), tasa de aprendizaje 5e-6 con decaimiento coseno y sin warmup, weight decay 0, clipping de gradiente a 1,0, y la pérdida auxiliar de balanceo de enrutadores (coeficiente 0,001) activa como en el preentrenamiento de Qwen. El setup técnico fue el fork `marin-community/axolotl` en `a208d550`, `transformers` 5.12.1, atención PyTorch SDPA, pesos maestros en fp32 y cómputo en bf16 sobre 16 H100. La exportación publicada es la copia bf16 de los pesos finales fp32. No hubo RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en el formato de chat de Qwen3.5, con bloques `<think>` de razonamiento.
- Razonamiento explícito: el prompt de generación prellena `<think>\n`, de modo que la respuesta comienza con el razonamiento y contiene `</think>` sin etiqueta de apertura.
- Ejecución de tareas de agente de terminal, entrenado específicamente sobre conversaciones de terminal.
- Tool calling en formato XML de Qwen3.5 (`<tool_call>`, `<function=...>`, `<parameter=...>`), legible por el parser `qwen3_xml` de vLLM.
- Soporte multi-turno: las respuestas previas se reenvían como `content` del mensaje de asistente; la plantilla extrae el razonamiento y lo descarta en turnos anteriores al último mensaje de usuario.
- Capacidad multimodal heredada: conserva el codificador visual y el procesador de imágenes del modelo base, aunque no fue entrenado ni evaluado con imágenes o vídeo.
- Contexto largo de 262.144 tokens, útil para conversaciones y trazas de terminal extensas.

## Casos de uso

- Investigación en post-entrenamiento: sirve como base chat-capable de referencia para experimentos de destilación on-policy y ajuste fino en MoE, comparando el efecto de distintas técnicas sobre un punto de partida común.
- Agentes de terminal automatizados: el SFT sobre `Nemotron-Terminal-Corpus` lo hace adecuado para prototipos de agentes que interpretan comandos, ejecutan herramientas y razonan sobre salidas de shell en contexto largo.
- Evaluación de formatos de tool calling: su plantilla XML compatible con el parser `qwen3_xml` de vLLM permite probar pipelines de function calling sin adaptadores adicionales.
- Bancos de prueba de razonamiento: al razonar incluso con `enable_thinking=False`, es útil para estudiar el comportamiento del bloque `<think>` y la fidelidad del razonamiento en modelos MoE.
- Procesamiento de trazas y logs extensos: con 262.144 tokens de contexto puede ingerir sesiones completas de terminal o ficheros de registro largos en una sola pasada.
- Estudio de eficiencia MoE: con ~3B parámetros activos por token, sirve para medir throughput y latencia de arquitecturas MoE de 35B en hardware limitado.
- Base para ajuste de preferencias: al carecer de tuning de seguridad o preferencias, es un punto de partida limpio para experimentos de RLHF/DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la puerta de aceptación del experimento (que el modelo superó) y dos comportamientos conocidos: en tareas de agente de terminal, 24 de 32 terminan dentro del límite de 3.000 segundos, y el modelo sigue razonando aunque se desactive el modo thinking con `enable_thinking=False`.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 70 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 80 GB por GPU para despliegue en una sola tarjeta.
- GPU recomendadas: H100 80 GB, A100 80 GB; el entrenamiento se realizó sobre 16 H100, lo que da una idea del orden de magnitud del cómputo.
- En GPU de consumo: no cabe en bf16 en tarjetas de 24 GB (RTX 4090) sin cuantización; no se documentan cuantizaciones oficiales, por lo que el despliegue en consumer requeriría cuantización propia (por ejemplo, GGUF/AWQ) no validada por el autor.
- Opciones de despliegue: `transformers` 5.12.1 (librería declarada), vLLM (compatible con el parser de herramientas `qwen3_xml` y con la `generation_config.json`), y el ecosistema Axolotl del fork de Marin para reentrenamiento. No se documenta soporte explícito de llama.cpp, Ollama ni TGI.
- Parámetros de decodificación recomendados en `generation_config.json`: temperature 0,6, top_p 0,95, repetition_penalty 1,05, stop `<|im_end|>`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-Chat-Aligned-Base (este) | 35,1B | ~3B | 262.144 | openmdw-1.1 | HuggingFace, 163 descargas |
| Qwen/Qwen3.5-35B-A3B-Base | 35,1B | ~3B | 262.144 | no disponible en la información | HuggingFace (modelo base) |
| Modelos instruction-tuned oficiales de Qwen3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; el único comparable documentado es el propio modelo base del que deriva.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluar formalmente: el autor advierte que no ha sido probado a fondo y que no es necesariamente seguro para producción.
- Sin ajuste de preferencias ni de seguridad: no es un asistente terminado y puede generar contenido inapropiado o inseguro.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; al ser un SFT corto sobre datos de terminal, la generalización fuera de ese dominio es incierta.
- Razonamiento persistente: razona incluso con `enable_thinking=False`, por lo que no existe un modo fiable para desactivar el bloque de pensamiento.
- Lentitud en tareas de agente de terminal: solo 24 de 32 tareas terminan dentro del límite de 3.000 segundos, y el resto son ejecuciones largas con mucho razonamiento.
- Visión no validada: conserva el codificador visual pero nunca se entrenó ni evaluó con imágenes o vídeo; la evaluación sirvió el modelo con entrada de imagen y vídeo desactivada.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe.
- Restricciones de licencia: openmdw-1.1; conviene revisar sus términos antes de uso comercial, ya que la información disponible no detalla las condiciones.
- Formato de herramientas frágil en `transformers`: con `apply_chat_template`, los `arguments` de una llamada a herramienta deben pasarse como objeto (dict); una cadena JSON provoca `TypeError`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Qwen3.5-35B-A3B-Chat-Aligned-Base-2026.10.31
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Repositorio Marin: https://github.com/marin-community/marin
- Fork de Axolotl usado: https://github.com/marin-community/axolotl
