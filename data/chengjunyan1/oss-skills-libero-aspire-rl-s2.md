# chengjunyan1/oss-skills-libero-aspire-rl-s2

## Resumen

`chengjunyan1/oss-skills-libero-aspire-rl-s2` es un checkpoint de investigación publicado por el usuario chengjunyan1 como parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects* (referencia al paper pendiente de publicación). No es un modelo de propósito general: es la política final (paso 300 de 300) de una ejecución de aprendizaje por refuerzo con GRPO sobre Qwen/Qwen3.5-9B, especializada en generar programas Python de manipulación robótica para el entorno LIBERO (manipulación de sobremesa) dentro de un arnés de agente que renderiza una biblioteca de habilidades en el prompt.

La relevancia del artefacto es metodológica: ilustra la variante ASPIRE-RL, en la que un curador congelado (Claude Opus 5.5) reescribe cada diez pasos la biblioteca de habilidades compartida a partir de los propios episodios de la política, y la política se entrena con prompts que llevan la versión vigente de esa biblioteca. El checkpoint se sirve junto con la biblioteca `library/` (versión v0029) con la que fue evaluado en TEST.

El modelo conserva la arquitectura completa de Qwen3.5-9B, incluida su torre de visión, aunque la política se usa en modo solo texto. Los pesos se distribuyen en un único `model.safetensors` en bf16 de 9.409.813.744 parámetros (760 tensores, 18,8 GB), sin estado del optimizador ni otros pasos de la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (arquitectura completa de Qwen/Qwen3.5-9B, incluida torre de visión); política usada en modo solo texto |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 32.768 tokens (valor usado en el servicio vLLM indicado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` en bf16, 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

La base es Qwen3.5-9B, un transformer denso de 9,4 mil millones de parámetros con torre de visión, tokenizador y plantilla de chat propios. Sobre esa base se aplicó un ajuste fino supervisado (SFT) de calentamiento de tres épocas sobre 420 episodios exitosos de LIBERO-90 repartidos en 55 tareas, y después GRPO de parámetro completo con verl (FSDP, bf16, rollouts con vLLM) en un nodo de ocho GPU H100. El entrenamiento usó 37 tareas de LIBERO-90 no retenidas, 8 prompts × 8 rollouts por paso, ventajas normalizadas por grupo, una actualización por paso y 300 pasos, con KL de baja varianza de 1e-2 respecto a la política SFT, learning rate 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, rechazo a nivel de secuencia a 1e-2, rollouts con temperatura 1 y `thinking` desactivado, y guardado cada 20 pasos. La ejecución se realizó el 20 y 21 de octubre de 2026 (nodo a3mega 11, job 25305).

La innovación central es el bucle ASPIRE: cada diez pasos, un curador congelado (Claude Opus 5.5) reescribe la biblioteca de habilidades compartida a partir de los episodios generados por la propia política, y los prompts de entrenamiento incorporan la versión vigente. El checkpoint liberado corresponde al paso 300 con la biblioteca v0029, seleccionado mediante una regla de DEV (35,05 % [27,55, 43,37]) y evaluado en TEST como D2. Los pesos se fusionaron desde los fragmentos FSDP del actor con el merger de verl y se transfirieron desde GCS al Hub sin copia local, verificando el sha256 contra el LFS oid.

## Capacidades

- Generación de código: escribe programas Python sobre una API de robot para tareas de manipulación de sobremesa en LIBERO, y JavaScript de Mineflayer para Minecraft dentro del arnés del paper.
- Razonamiento multi-paso dentro de un episodio: la decodificación de TEST usa hasta 2.048 tokens por turno y 6.144 por episodio, con temperatura 0 y `thinking` desactivado.
- Uso de una biblioteca de habilidades externa: el contenido de `library/` (README.md, grasp.md, localize.md, manipulation.md, transport.md) se renderiza en el prompt; `LIBRARY.json` y `PROVENANCE.md` son metadatos y no se renderizan.
- Capacidad multimodal heredada: conserva la torre de visión de Qwen3.5-9B en los pesos, aunque la política se emplea en modo solo texto (`--language-model-only` en vLLM).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: sí, en el sentido acotado del arnés del paper (política que emite código dentro de un bucle de agente con biblioteca de habilidades).
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: reproducir o comparar la variante ASPIRE-RL frente a otras variantes del paper, cargando el checkpoint con la biblioteca v0029 y el protocolo de TEST documentado (temperatura 0, 2.048 tokens por turno, 6.144 por episodio, `thinking` off).
- Evaluación de bibliotecas de habilidades como artefacto: analizar cómo la reescritura periódica por un curador congelado afecta a la política, comparando el paso 300 con la curva DEV y las versiones de biblioteca registradas en `chengjunyan1/oss-skills-records`.
- Generación de políticas robóticas para LIBERO: usar el modelo como generador de programas Python sobre la API del entorno en experimentos de manipulación de sobremesa, con evaluación en los estados retenidos de LIBERO-90 y los dos conjuntos de LIBERO-10.
- Estudio de transferencia entre dominios: el mismo arnés produce JavaScript de Mineflayer para Minecraft, lo que permite estudiar la transferencia de habilidades entre dominios dentro de la misma formulación code-as-policies.
- Punto de partida para ajuste con GRPO: al ser un checkpoint intermedio de una receta documentada (KL 1e-2, lr 1e-6 con coseno a 1e-7, 8×8 rollouts, rechazo a 1e-2), sirve como inicialización para réplicas con otras semillas o curriculos.
- Servicio de inferencia acotado: desplegarlo con `vllm serve ... --language-model-only --max-model-len 32768` para generar programas de robot en un pipeline interno de evaluación, sin esperar capacidades de chat general.
- Auditoría de procedencia de pesos: el repositorio incluye hashes sha256 por fichero y la ruta GCS de origen, lo que facilita la verificación de la cadena de custodia en entornos de investigación reproducibles.

## Benchmarks y rendimiento

Resultados de TEST tal como se imprimen en el paper (protocolo en su apéndice), para la ejecución con semilla 2, paso 300 y biblioteca v0029:

| Metrica | Resultado |
|---|---|
| TEST xfer, D2, E1 (q.arls2.*) | 51,56 |
| TEST xfer, D2, E2 (q.arls2.*) | 25,26 |
| Media de dos semillas, fila ASPIRE-RL (tab:ninb) | 51,94 / 19,68 |
| DEV (regla de selección seed_v1) | 35,05 % [27,55, 43,37] |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos bf16 ocupan aproximadamente 18,8 GB, por lo que se necesita al menos ~20 GB de VRAM solo para el modelo, más margen para caché KV y activaciones; con `--max-model-len 32768` el requisito crece de forma apreciable.
- GPU recomendadas: el entrenamiento se realizó en ocho H100; para servicio, H100 o A100 de 80 GB son la opción segura. Una RTX 4090 (24 GB) queda al límite en bf16 y no permite contexto largo.
- Cabe en GPU de consumo: solo en configuraciones muy ajustadas y sin garantía con la longitud de contexto usada en el paper; no se documentan cuantizaciones oficiales.
- Opciones de despliegue: vLLM (versión que soporte Qwen3.5, con `--language-model-only`), y transformers con `AutoModelForImageTextToText` y `AutoTokenizer` (las mismas clases que Qwen/Qwen3.5-9B). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-libero-aspire-rl-s2 | 9.409.813.744 | 32.768 | Checkpoint RL (GRPO) sobre Qwen3.5-9B para LIBERO | apache-2.0 | Pesos bf16 en el Hub, con biblioteca v0029 |
| Qwen/Qwen3.5-9B (base) | ~9,4 mil millones | no disponible | Modelo multimodal de propósito general | no disponible en la información | Hub |
| Checkpoint SFT de calentamiento (misma ejecución) | ~9,4 mil millones | no disponible | Punto de partida supervisado de la política | no disponible | No liberado |
| Otros checkpoints de la misma fila (semilla 1) | ~9,4 mil millones | no disponible | Variantes ASPIRE-RL / baseline | no disponible | No liberado según la información |

No se dispone de datos de benchmarks de propósito general ni de comparaciones con modelos de la misma categoría fuera de la propia ejecución, por lo que la comparativa se limita a los artefactos de la misma línea.

## Limitaciones y advertencias

- No es un modelo de chat general: está entrenado para emitir programas dentro de un arnés concreto y depende de que la biblioteca `library/` se renderice en el prompt; fuera de ese formato su comportamiento no está caracterizado.
- La model card advierte de que `LIBRARY.json` y `PROVENANCE.md` son metadatos y no deben renderizarse en el prompt; incluir­los altera las condiciones de evaluación.
- Solo se libera el paso 300 con la biblioteca v0029; no hay estado del optimizador ni otros pasos, lo que limita la reproducibilidad exacta del entrenamiento.
- El checkpoint se seleccionó con una regla de DEV y se evaluó en TEST; la varianza entre semillas es alta (medias de 51,94 / 19,68 en la fila del paper), por lo que los números de una sola semilla no deben generalizarse.
- La política se sirve en modo solo texto aunque los pesos incluyan la torre de visión; las capacidades visuales no están validadas en este checkpoint.
- Idiomas soportados no documentados; no hay información sobre sesgos, tasas de alucinación ni comportamiento fuera de LIBERO.
- Licencia apache-2.0, lo que permite uso comercial según los términos de la licencia, pero el modelo base Qwen3.5-9B y las dependencias del arnés deben verificarse por separado.
- El contenido de la biblioteca procede de un curador externo (Claude Opus 5.5); su calidad y posibles sesgos condicionan directamente el comportamiento de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-rl-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset y registros de la ejecución: https://huggingface.co/datasets/chengjunyan1/oss-skills-records (carpeta `rl-runs/libero-aspire-rl-s2/`)
- Paper *Growing Agent Skill Libraries as Open-Source Projects*: referencia pendiente de publicación según la model card
- Declaración del sistema: `cap-x levo/docs/SYSTEM3.md` (no se proporciona URL)
- Origen de pesos (GCS): `gs://r3a-levo-migration-junyanch/ckpts-home/levo-q35-sys3/sys3a-s2/global_step_300/hf_merged/model.safetensors`
