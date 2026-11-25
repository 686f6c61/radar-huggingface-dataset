# netprojects/Qwen3.8-27B-super-adapter-GGUF

## Resumen
Qwen3.8-27B-super-adapter GGUF es una conversión a formato GGUF del modelo harness-hub/Qwen3.8-27B-super-adapter, que a su vez es el modelo base Qwen/Qwen3.8-27B con un super-adapter LoRA fusionado en sus pesos. Lo publica el usuario netprojects en Hugging Face bajo licencia Apache 2.0, con el objetivo de ofrecer ficheros listos para ejecutar en llama.cpp sin necesidad de cargar adaptadores por separado. El modelo está orientado a tareas de agentes de programación y automatización, y mantiene la capa de predicción multi-token (MTP) de Qwen para acelerar la decodificación.

El super-adapter combina tres especialistas de reinforcement learning entrenados para tres harnesses de agentes de código: pi, Hermes Agent y OpenCode. Según la model card del adaptador original, esta fusión mejora el rendimiento en SWE-bench Pro y Terminal-Bench 2.1 frente al modelo base, con reducciones significativas en el número de llamadas a herramientas por tarea. La conversión GGUF incluye además un proyector de visión (mmproj) que habilita entrada de imágenes, por lo que el pipeline declarado es image-text-to-text.

Con 27.320.697.856 parámetros totales y un repositorio de 139,3 GB que alberga múltiples cuantizaciones, el modelo está pensado para despliegues locales en estaciones de trabajo y servidores con GPU de gama alta o Apple Silicon. La recomendación del autor es Q6_K como equilibrio entre tamaño y fidelidad, con Q8_0 como opción más cercana a los pesos BF16 y Q4_K_M para máquinas con menos memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con capa de predicción multi-token (MTP) y proyector de visión |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (configurado en el ejemplo de llama-server con `-c 131072`) |
| Tipos de cuantizacion | Q6_K, Q8_0, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M, además de proyector de visión F16 y builds MLX de 6 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con fichero mmproj separado para visión; también MLX 6-bit |

## Arquitectura y entrenamiento
El modelo base es Qwen/Qwen3.8-27B, un transformer de 27.320.697.856 parámetros. Sobre él se aplica el super-adapter de harness-hub, que es un LoRA resultante de fusionar tres especialistas de reinforcement learning: pi y Hermes Agent en el paso 160 y OpenCode en el paso 150, cada uno con peso ½, sin entrenamiento adicional tras la fusión. Esta técnica permite que un único conjunto de pesos cubra el comportamiento de los tres harnesses de agentes de código.

La conversión a GGUF la realiza netprojects a partir de la revisión `adb00e9` del adaptador y la revisión `3756181` del modelo base Qwen. Cada fichero GGUF conserva la capa MTP de Qwen, que llama-server puede aprovechar con `--spec-type draft-mtp` para decodificación especulativa. El fichero `mmproj-Qwen3.8-27B-super-adapter-F16.gguf` (0,9 GB) añade la capacidad de entrada de imágenes. La model card incluye métricas de fidelidad de cuantización: Q6_K conserva el 98,9 % del siguiente token respecto a BF16 con divergencia KL media de 0,0032; Q8_0 alcanza el 99,7 % con KL 0,0003; Q4_K_M baja al 94,6 % con KL 0,0800. Las filas marcadas con nota (Q5_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M) se midieron contra el Q8_0 del propio autor en texto reservado, no contra BF16 en las 12 prompts, por lo que no son directamente comparables.

## Capacidades
- Generación de texto conversacional y razonamiento con modo de pensamiento (thinking) activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Programación y tareas de agente de código: el adaptador está entrenado específicamente para pi, Hermes Agent y OpenCode.
- Uso de herramientas (tool calling) en el contexto de los harnesses de agentes, con reducción de llamadas por tarea según los resultados publicados.
- Razonamiento multi-paso y ejecución de tareas de agente en terminal y repositorios (Terminal-Bench 2.1, SWE-bench Pro).
- Entrada de imágenes mediante el proyector mmproj (pipeline image-text-to-text).
- Decodificación especulativa con la capa MTP integrada para acelerar la generación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Agente de código en local con pi: servir el modelo con llama-server en `http://localhost:8000/v1` y configurar pi como proveedor OpenAI-compatible; el adaptador está entrenado con el especialista de pi fusionado, lo que permite resolver tareas de repositorio con menos llamadas a herramientas.
- Agente de terminal con Hermes Agent: configurar `~/.hermes/config.yaml` con el endpoint local y un contexto mínimo de 64.000 tokens, aprovechando la mejora publicada en Terminal-Bench 2.1 y la reducción de llamadas por tarea.
- Automatización con OpenCode: usar el proveedor OpenAI-compatible en `~/.config/opencode/opencode.json` para tareas de edición y refactorización de código, con el especialista de OpenCode fusionado en los pesos.
- Asistente de programación con entrada de imágenes: cargar el mmproj F16 junto al GGUF para analizar capturas de pantalla, diagramas o errores visuales en flujos de depuración.
- Despliegue en estaciones de trabajo con una sola GPU: usar Q4_K_M (16,8 GB) o IQ4_XS (15,3 GB) para equipos con 24 GB de VRAM, manteniendo una fidelidad razonable respecto a BF16.
- Ejecución en Apple Silicon: emplear los builds MLX de 6 bits publicados por el mismo autor para inferencia nativa en Mac.
- Servicio de agente conversacional con contexto largo: aprovechar la ventana de 131.072 tokens para conversaciones multi-turno con historial extenso o repositorios completos en el prompt.

## Benchmarks y rendimiento
Los resultados publicados en la model card corresponden al adaptador original (harness-hub) bajo cada harness, comparando con el modelo base Qwen3.8-27B al mismo esfuerzo de razonamiento:

| Configuración | Puntuación media pass@1 | Detalle |
|---|---|---|
| Thinking on (super-adapter) | 63,5 % | Media de seis pares harness-benchmark; 55,5 % en el base |
| Thinking off (super-adapter) | 49,0 % | Media de seis pares; 39,5 % en el base |
| SWE-bench Pro (hard 51), OpenCode, thinking on | 66,7 % | Base: 47,1 % |
| SWE-bench Pro (hard 51), Hermes Agent, thinking on | 60,8 % | Base: 45,1 % |

Según la model card, con thinking on el adaptador supera al base en cinco de seis pares harness-benchmark y empata en el sexto, con 19–48 % menos llamadas a herramientas por tarea. Con thinking off supera al base en los seis pares, con 53–73 % menos llamadas por tarea. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para esta conversión GGUF concreta.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead de contexto. Q8_0: 29,0 GB; Q6_K: 22,4 GB; Q5_K_M: 19,5 GB; Q4_K_M: 16,8 GB; IQ4_XS: 15,3 GB; Q3_K_M: 13,5 GB; IQ3_XXS: 11,4 GB; IQ2_M: 10,2 GB. Añadir 0,9 GB si se carga el proyector de visión F16.
- GPU recomendadas: no disponible de forma explícita en la información. Por tamaño, Q6_K y Q8_0 encajan en A100 40/80 GB, H100 y configuraciones multi-GPU; Q4_K_M e IQ4_XS son adecuados para GPU de 24 GB como la RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M, IQ4_XS o cuantizaciones menores; Q5_K_M (19,5 GB) también es viable ajustando el contexto.
- Opciones de despliegue: llama.cpp (llama-server) con `--jinja` y opcionalmente `--spec-type draft-mtp`; builds MLX para Apple Silicon. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponible. La capa MTP permite decodificación especulativa para acelerar la generación, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter GGUF (este) | 27,3 B | 131.072 | 63,5 % medio pass@1 con thinking on (seis pares harness-benchmark) | Apache 2.0 | GGUF y MLX en Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible en la información | 55,5 % medio pass@1 con thinking on | no disponible en la información | Hugging Face |
| Qwen3.8-27B-pi-adapted GGUF | 27,3 B (mismo base) | no disponible | no disponible | Apache 2.0 (según repo) | GGUF en Hugging Face |
| Qwen3.8-27B-hermes-adapted GGUF | 27,3 B (mismo base) | no disponible | no disponible | Apache 2.0 (según repo) | GGUF en Hugging Face |
| Qwen3.8-27B-opencode-adapted GGUF | 27,3 B (mismo base) | no disponible | no disponible | Apache 2.0 (según repo) | GGUF en Hugging Face |

Los tres adaptadores individuales son recomendados por harness-hub para un único harness con thinking off, mientras que el super-adapter cubre los tres con thinking on.

## Limitaciones y advertencias
- Sesgos conocidos: no disponible en la información proporcionada; al derivar del modelo base Qwen, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación: no se documenta una evaluación específica; como modelo generativo de 27 B, es susceptible de producir contenido incorrecto, especialmente en tareas de código sin verificación.
- Limitaciones de contexto o idioma: el contexto máximo configurado en el ejemplo es de 131.072 tokens, pero reducir `-c` ahorra memoria; Hermes Agent requiere al menos 64.000 tokens. Los idiomas soportados no están documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen subyacente, que no se detalla en la información disponible.
- Caveats para producción: las métricas de fidelidad de cuantización de Q5_K_M, IQ4_XS, Q3_K_M, IQ3_XXS e IQ2_M se midieron contra el Q8_0 del autor, no contra BF16, por lo que no son directamente comparables. El super-adapter se creó fusionando especialistas sin entrenamiento adicional, lo que puede producir degradación en harnesses distintos de pi, Hermes Agent y OpenCode. El repositorio tiene 0 likes y 531 descargas, lo que indica una validación comunitaria limitada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo Qwen base: https://huggingface.co/Qwen/Qwen3.8-27B
- Builds MLX 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Adaptador pi GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Adaptador Hermes Agent GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-GGUF
- Adaptador OpenCode GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Repositorio pi: https://github.com/earendil-works/pi
- Repositorio Hermes Agent: https://github.com/NousResearch/hermes-agent
- OpenCode: https://opencode.ai
- Fichero Q6_K: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter-Q6_K.gguf
- Fichero Q8_0: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter-Q8_0.gguf
- Fichero Q5_K_M: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter-Q5_K_M.gguf
- Fichero Q4_K_M: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter-Q4_K_M.gguf
- Fichero IQ4_XS: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter-IQ4_XS.gguf
- Fichero Q3_K_M: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter-Q3_K_M.gguf
- Fichero IQ3_XXS: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter-IQ3_XXS.gguf
- Fichero IQ2_M: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/Qwen3.8-27B-super-adapter-IQ2_M.gguf
- Proyector de visión F16: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF/blob/main/mmproj-Qwen3.8-27B-super-adapter-F16.gguf
