# chengjunyan1/oss-skills-minecraft-aspire-rl-s1

## Resumen

ASPIRE-RL (MCL-6, seed 1) es un ajuste fino por refuerzo del modelo Qwen3.5-9B orientado a la escritura de programas JavaScript sobre el motor Mineflayer para agentes que juegan a Minecraft. Lo publica el usuario chengjunyan1 como artefacto reproducible del artículo *Growing Agent Skill Libraries as Open-Source Projects*, en el que se estudia cómo una biblioteca de habilidades compartida, reescrita por un curador externo, mejora el entrenamiento de un agente. El checkpoint liberado es el paso 260 de 300 de un entrenamiento GRPO completo y se sirve junto con la versión exacta de la biblioteca de habilidades (v0025) con la que se evaluó en TEST.

El modelo conserva la arquitectura completa de Qwen3.5-9B (incluida su torre de visión), con 9.409.813.744 parámetros en 760 tensores y pesos en bf16 en un único `model.safetensors` de 18,8 GB. La política se usa en modo solo texto: genera programas Mineflayer dentro del arnés de agente del artículo, con los ficheros de `library/` renderizados en el prompt. No es un modelo de propósito general, sino un checkpoint de investigación para reproducir una fila concreta de la tabla de resultados del artículo.

Su relevancia es metodológica: documenta de forma trazable el protocolo de entrenamiento (8 GPUs, 313 tareas, 300 pasos, ventana de prompt de 18.432 tokens), la procedencia exacta de los pesos y las métricas de TEST, algo poco habitual en publicaciones de checkpoints de RL. La licencia Apache 2.0 facilita la inspección y la reutilización experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 (arquitectura completa, incluida torre de visión); política usada en modo solo texto |
| Parámetros totales | 9.409.813.744 (760 tensores) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | Ventana de prompt de entrenamiento de 18.432 tokens (11.008 de biblioteca + 7.424); respuesta de 14.336 tokens; servido en TEST con `--max-model-len 32768` |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, un único `model.safetensors` de 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y se entrena con GRPO de parámetros completos usando verl con FSDP en bf16 sobre 8 GPUs. El calentamiento previo es MC-SFT1, un ajuste supervisado de Minecraft (paso 309) sobre demostraciones verificadas generadas por Opus 5.5. El RL usa 313 tareas (258 de un solo agente y 55 de dos agentes), con 8 prompts por 8 rollouts por paso durante 300 pasos, KL de 0,01, tasa de aprendizaje de 1e-6 con decaimiento coseno y 10 pasos de calentamiento. La política escribe programas JavaScript de Mineflayer sobre el motor MINDcraft.

La innovación central es el bucle ASPIRE: un curador congelado (Claude Opus 5.5) reescribe la biblioteca de habilidades compartida cada 10 pasos a partir de los propios episodios de la política, y la política se entrena con prompts que incorporan la versión vigente (activa 2 pasos después, con límites de 32.768 bytes / 11.008 tokens). La biblioteca semilla es `mc_seed_v2`. El entrenamiento se ejecutó en dos clústeres: pasos 1-130 en H100 (101-130 con aceleración temporal) y pasos 131-300 en RTX PRO 6000 (191-300 acelerados); DEV y TEST se hicieron en H100. El checkpoint se eligió con el criterio P17.8 sobre DEV (B = 260, DEV 69,40% [59,32, 78,95], MC_ASPIRE_OSS_RL 12,34).

## Capacidades

- Generación de código: escribe programas JavaScript para el motor Mineflayer (movimiento, recolección, crafteo, combate, cocina) y, según el artículo, también programas Python para LIBERO.
- Razonamiento multi-paso dentro de un episodio: 2.048 tokens por turno y 6.144 por episodio en la decodificación de TEST.
- Uso de una biblioteca de habilidades externa renderizada en el prompt (`library/README.md`, `combat.md`, `cook.md`, `craft.md`, `gather.md`, `program.md`, `team.md`).
- Tareas de un solo agente y de dos agentes (equipos) en Minecraft.
- Capacidad de visión heredada de Qwen3.5-9B presente en los pesos, aunque la política se usa en modo solo texto.
- Modo thinking de Qwen3.5 disponible en la arquitectura, pero desactivado en la evaluación (`enable_thinking: false`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de resultados de investigación: cargar el checkpoint con la biblioteca v0025 incluida y ejecutar el protocolo de TEST (temperatura 0, 2.048 tokens por turno, 6.144 por episodio) para verificar las métricas E1^MC 7,5, E2^MC 0,0 y XT-MA 4,0.
- Estudio de bibliotecas de habilidades como artefacto: analizar cómo los ficheros de `library/` (combat, craft, gather, team) condicionan el comportamiento generado, comparando con la biblioteca semilla `mc_seed_v2`.
- Investigación en RL con recompensa verificable en entornos de código: usar el checkpoint como política de referencia frente a la que medir variantes de curador, frecuencia de reescritura o límites de tamaño de biblioteca.
- Entrenamiento de agentes en entornos tipo Minecraft: servir el modelo con vLLM y conectarlo al arnés de agente del artículo para generar programas Mineflayer en tareas de recolección y crafteo.
- Experimentos de agentes multi-agente: las 55 tareas de dos agentes del conjunto de entrenamiento permiten estudiar coordinación mediante programas compartidos y el fichero `team.md`.
- Base para ajustes posteriores en dominios de código de robots: al compartir arquitectura y tokenizador con Qwen3.5-9B, sirve como inicialización para RL sobre otros entornos con programas como acción (por ejemplo, LIBERO en Python).
- Auditoría de procedencia de checkpoints: el hash sha256 de los pesos, el md5/crc32c de origen en GCS y los hashes de cada fichero de la biblioteca permiten verificar la cadena de custodia en estudios de reproducibilidad.

## Benchmarks y rendimiento

Métricas de TEST publicadas en la model card (paso 260 + biblioteca v0025, protocolo del apéndice del artículo):

| Métrica | Resultado |
|---|---|
| E1^MC | 7,5 |
| E2^MC | 0,0 |
| XT-MA | 4,0 |
| DEV (selección de checkpoint) | 69,40% [59,32, 78,95] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, más caché KV; en la práctica se recomienda una GPU de 24 GB o superior para contexto moderado.
- Entrenamiento original: 8 GPUs, con H100 en los pasos 1-130 y RTX PRO 6000 en los pasos 131-300; DEV y TEST en H100.
- GPU de consumo: cabe en tarjetas de 24 GB (por ejemplo, RTX 4090) en bf16 con contexto limitado; para los 32.768 tokens de TEST hará falta más memoria o cuantización, cuyos artefactos no se publican.
- Despliegue recomendado: vLLM con una versión que soporte Qwen3.5 (`vllm serve ... --language-model-only --max-model-len 32768`); también es cargable con `transformers` mediante `AutoModelForImageTextToText` y `AutoTokenizer`.
- Decodificación de referencia: temperatura 0, 2.048 tokens por turno, 6.144 por episodio, thinking desactivado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chengjunyan1/oss-skills-minecraft-aspire-rl-s1 | 9,41 B | Prompt 18.432 en entrenamiento; servido a 32.768 | RL con GRPO sobre Minecraft/Mineflayer con biblioteca de habilidades | Apache 2.0 | Pesos bf16 en Hugging Face, sin cuantizaciones |
| Qwen/Qwen3.5-9B (modelo base) | 9 B (aproximado, según denominación) | no disponible | Modelo generalista multimodal imagen-texto | no disponible en la información proporcionada | Pesos y ecosistema estándar de Qwen |
| MC-SFT1 (calentamiento supervisado del mismo artículo) | 9,41 B (misma arquitectura) | no disponible | SFT sobre demostraciones de Minecraft | no disponible en la información proporcionada | Referenciado en el artículo; disponibilidad no confirmada |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: está entrenado para un entorno y un arnés concretos (MINDcraft/Mineflayer con la biblioteca v0025); fuera de ese contexto su comportamiento no está caracterizado.
- Dependencia de la biblioteca: el rendimiento en TEST está ligado a la versión v0025 de `library/`; usar otra versión o no renderizarla invalida la comparación con las métricas publicadas.
- Solo se libera un paso (260) de 300, sin estado del optimizador ni otros checkpoints, lo que limita la reproducibilidad completa del entrenamiento.
- La decodificación de referencia usa temperatura 0; no hay datos sobre robustez con muestreo estocástico.
- Riesgo de alucinación en la generación de código: los programas Mineflayer pueden ser sintácticamente válidos pero semánticamente incorrectos respecto al estado del mundo; se requiere el arnés de ejecución para validarlos.
- Sesgos: no disponibles en la información proporcionada; al derivar de Qwen3.5-9B y de demostraciones generadas por Opus 5.5, puede heredar sesgos de ambos.
- Idiomas soportados no documentados; el uso previsto es generación de código, no conversación multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B y los datos de entrenamiento deben verificarse por separado antes de un despliegue en producción.
- El uso de un curador propietario (Claude Opus 5.5) durante el entrenamiento no afecta a la licencia de los pesos, pero sí a la reproducibilidad del pipeline completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-minecraft-aspire-rl-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Artículo de referencia (*Growing Agent Skill Libraries as Open-Source Projects*): referencia pendiente de publicación según la model card; no disponible
- Repositorio de código, blog o demo: no disponibles en la información proporcionada
