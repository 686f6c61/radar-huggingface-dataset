# chengjunyan1/oss-skills-minecraft-aspire-oss-rl-s1

## Resumen

`chengjunyan1/oss-skills-minecraft-aspire-oss-rl-s1` es un checkpoint de aprendizaje por refuerzo (RL) derivado de Qwen/Qwen3.5-9B, publicado por el usuario chengjunyan1 como artefacto de investigación asociado al trabajo *Growing Agent Skill Libraries as Open-Source Projects*. No es un modelo de propósito general, sino una política entrenada específicamente para escribir programas en JavaScript sobre el motor MINDcraft (Mineflayer) que resuelvan tareas de agente único y de equipo dentro de Minecraft. El checkpoint liberado corresponde al paso 200 de 300 del entrenamiento, seleccionado por un criterio de validación emparejada (pair-DEV argmax) entre los pasos 120 y 300.

La propuesta técnica del trabajo es tratar la biblioteca de habilidades del agente como un proyecto de código abierto: desarrolladores automáticos (Claude Opus 5.5) leen las transcripciones de la política y abren issues, discusiones y pull requests en un forge simulado, y un mantenedor congelado (también Opus 5.5) fusiona o cierra las propuestas y publica una nueva versión de la biblioteca cada diez pasos de entrenamiento. La política solo ve la biblioteca publicada, de modo que el RL optimiza el uso de una API de habilidades que evoluciona de forma externa.

El interés para desarrolladores e investigadores es doble: por un lado, documenta una receta completa de GRPO con parámetros completos sobre 9.409.813.744 parámetros y ofrece los pesos en bf16 junto con la biblioteca de habilidades exacta usada en la evaluación TEST; por otro, es un ejemplo reproducible de cómo separar el crecimiento de conocimiento (biblioteca versionada) del ajuste de la política (RL sobre tareas verificables). La licencia es Apache 2.0 y el repo ocupa 18,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 (incluye torre de visión; la política se usa solo texto) |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el servicio de referencia (`--max-model-len 32768`); contexto nativo de Qwen3.5-9B no disponible en la información |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5-9B es multilingüe, pero la model card no declara idiomas para este checkpoint) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` bf16, 18.819.722.392 bytes) |

Otros datos relevantes: librería `transformers`, pipeline declarado `reinforcement-learning`, clases de carga `AutoModelForImageTextToText` y `AutoTokenizer`, y dataset de entrenamiento `chengjunyan1/oss-skills-records`.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-9B sin modificaciones estructurales: un transformer denso de 9.409.813.744 parámetros en 760 tensores, con tokenizer y plantilla de chat idénticos a los del modelo base, y con la torre de visión conservada en los pesos aunque la política se emplee en modo texto. El checkpoint es el resultado de un ajuste fino supervisado previo (MC-SFT1, paso 309, sobre demostraciones verificadas de Minecraft generadas por Opus 5.5) seguido de GRPO de parámetros completos con verl y FSDP en bf16 sobre 8 GPUs.

El entrenamiento RL usó 313 tareas (258 de agente único y 55 de dos agentes), 8 prompts por paso con 8 rollouts cada uno, 300 pasos, KL de 0,01, learning rate de 1e-6 con schedule coseno y 10 pasos de calentamiento. La innovación metodológica es el bucle de curación tipo proyecto open source: cada 10 pasos, 48 desarrolladores Opus 5.5 (8 tareas de agente único × 4 episodios más 2 tareas de equipo × 4 episodios × 2 miembros) generan issues, discusiones y pull requests sobre un forge simulado local, y un mantenedor Opus 5.5 congelado los fusiona en la siguiente versión de la biblioteca; hubo 29 rondas y 22 fusiones aplicadas. El cómputo se realizó entre el 8 y el 13 de noviembre de 2026 en ocho RTX PRO 6000 (atención Triton), con evaluación DEV y TEST en H100. La decodificación de referencia en TEST es temperatura 0, 2.048 tokens por turno, 6.144 por episodio y modo thinking desactivado.

## Capacidades

- Generación de código ejecutable: produce programas JavaScript para Mineflayer dentro del harness de MINDcraft, no texto libre genérico.
- Planificación de tareas de agente único y de equipo en Minecraft (recolección, fabricación, cocina, combate, coordinación).
- Uso de una biblioteca de habilidades externa renderizada en el prompt (`README.md`, `combat.md`, `cook.md`, `craft.md`, `gather.md`, `program.md`, `team.md`), consultando la API documentada en lugar de improvisar.
- Razonamiento multi-paso dentro de un episodio, con hasta 6.144 tokens generados por episodio repartidos en turnos de 2.048 tokens.
- Modo thinking desactivable vía `chat_template_kwargs={"enable_thinking": false}`; en la evaluación se usó desactivado.
- Soporte de tool calling / function calling: no disponible en la información (el paradigma es code-as-policies, no llamadas a herramientas estructuradas).
- Capacidades multilingües: no disponibles en la información para este checkpoint.
- Capacidades de visión: la torre existe en los pesos, pero la política se usa solo texto y no se documenta uso multimodal.

## Casos de uso

- Investigación en aprendizaje por refuerzo de agentes: sirve como checkpoint de referencia para reproducir la fila "MC-SFT + GRPO, ASPIRE-RL+OSS (seed 1)" del paper, comparando el paso 200 con la biblioteca v0019 frente a otras variantes del mismo estudio.
- Estudio de bibliotecas de habilidades versionadas: permite medir cómo cambia el rendimiento de la política cuando la API de habilidades crece mediante issues y pull requests, aislando el efecto de la curación externa del ajuste de pesos.
- Evaluación de code-as-policies en entornos de ejecución reales: el modelo escribe programas que se ejecutan en Mineflayer, lo que facilita construir bancos de pruebas con verificación automática de éxito de tarea.
- Desarrollo de harness de agentes: el repo incluye la biblioteca exacta usada en TEST, de modo que se puede montar el mismo prompt y validar el comportamiento del modelo antes de integrarlo en un pipeline propio.
- Tareas cooperativas de dos agentes: las 55 tareas de equipo del entrenamiento hacen del checkpoint un punto de partida para estudiar coordinación multiagente con roles documentados en `team.md`.
- Base para destilación o inicialización de políticas de dominio: al estar en bf16 y con la arquitectura estándar de Qwen3.5, se puede cargar con transformers o vLLM y reutilizar como inicialización en experimentos con otros entornos que compartan el formato de biblioteca de habilidades.
- Docencia y demostraciones de RL con recompensa verificable: el par pesos + biblioteca + receta de decodificación permite reproducir la inferencia completa sin infraestructura propietaria.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son las métricas TEST del propio paper para este checkpoint (paso 200 con biblioteca v0019):

| Metrica | Valor |
|---|---|
| E1^MC | 8,3 |
| E2^MC | 1,5 |
| XT-MA | 8,0 |
| pair DEV (paso 200) | 70,49 % [59,44; 79,89] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no se dispone de valores de referencia de modelos comparables en la misma tabla para establecer una comparación numérica directa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y KV cache; con contexto de 32.768 tokens el consumo práctico se sitúa claramente por encima de 24 GB.
- GPU recomendadas: H100 o A100 80 GB para el protocolo de evaluación del paper; RTX PRO 6000 (usadas en entrenamiento) también son válidas para servicio.
- GPU de consumo: no cabe en 24 GB en bf16 con contexto largo; requeriría cuantización, que no está publicada en el repo.
- Opciones de despliegue: vLLM (`vllm serve ... --language-model-only --max-model-len 32768`), o transformers con `AutoModelForImageTextToText` y `dtype="bfloat16"`. No se documentan GGUF, Ollama, llama.cpp ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información. El repo no incluye estado del optimizador ni otros pasos, solo el paso 200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-minecraft-aspire-oss-rl-s1 | 9,41 B | 32.768 en servicio de referencia | RL (GRPO) sobre Qwen3.5-9B para Minecraft con biblioteca de habilidades open source | Apache 2.0 | Pesos bf16 en HF, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9,41 B | no disponible | Modelo generalista multimodal texto-imagen | no disponible en la información | Público en HF |
| Otras semillas/variantes del mismo paper (ASPIRE-RL+OSS seed 2, contrastes q.mc.oa.* y q.mc.od.*) | 9,41 B | 32.768 | Misma receta con distinta semilla o distinto esquema de curación | Apache 2.0 (presumible por el linaje) | Referenciadas en el paper; disponibilidad pública no confirmada |

No se dispone de datos de benchmarks comparables entre estas filas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y enfoque.

## Limitaciones y advertencias

- Modelo de investigación, no de propósito general: está ajustado para escribir programas Mineflayer en el harness del paper; fuera de ese entorno su comportamiento no está caracterizado.
- Dependencia fuerte del prompt: la biblioteca de habilidades debe renderizarse tal cual (`README.md` primero; `LIBRARY.json` y `PROVENANCE.md` son metadatos y no se renderizan). Omitirla o alterar su orden invalida la configuración de TEST.
- Solo se libera el paso 200 de 300, sin estado del optimizador ni otros checkpoints, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de alucinación de API: al generar código contra una biblioteca versionada, puede invocar funciones inexistentes o con firmas obsoletas si la biblioteca cambia.
- Idiomas soportados no declarados para este checkpoint; no se debe asumir el perfil multilingüe del modelo base sin verificación.
- Sin cuantizaciones publicadas: el despliegue en hardware de consumo no está soportado de forma oficial.
- Sesgos: no documentados en la información disponible; al derivar de demostraciones generadas por Opus 5.5 y de tareas de Minecraft, puede heredar sesgos de esas trayectorias y del conjunto de tareas (313 tareas, dominio estrecho).
- Licencia Apache 2.0 permite uso comercial, pero el valor práctico fuera de investigación es limitado y el paper aún no tiene referencia de publicación definitiva.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de comunidad ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-minecraft-aspire-oss-rl-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Paper *Growing Agent Skill Libraries as Open-Source Projects*: referencia pendiente de publicación, no disponible
- Repositorio de código, blog o demo: no disponibles en la información proporcionada
