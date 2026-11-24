# chengjunyan1/oss-skills-libero-aspire-oss-rl-s1

## Resumen

`chengjunyan1/oss-skills-libero-aspire-oss-rl-s1` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario chengjunyan1 como artefacto de investigación del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. El modelo no es un asistente conversacional de propósito general, sino una política entrenada para escribir programas Python que controlan un robot de mesa en el entorno de simulación LIBERO, apoyándose en una biblioteca de habilidades (`library/`) que se renderiza en el prompt.

La relevancia del checkpoint es metodológica: documenta una variante de entrenamiento denominada ASPIRE-RL+OSS, en la que la biblioteca de habilidades crece como si fuera un proyecto de código abierto, con agentes desarrolladores (Claude Opus 5.5) que abren issues y pull requests en un forge simulado y un mantenedor congelado que fusiona o cierra y publica nuevas versiones cada diez pasos. La política solo ve la biblioteca publicada, nunca el tracker.

El checkpoint publicado corresponde al paso 260 de 300 (seleccionado por argmax de validación DEV sobre los pasos 120-300) y se sirve junto a la versión de biblioteca v0025. Los pesos son un único `model.safetensors` en bf16 con 9.409.813.744 parámetros en 760 tensores, conservando la arquitectura completa de Qwen3.5-9B, incluida su torre de visión, aunque la política se emplea en modo solo texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5-9B (arquitectura completa, incluida torre de visión), ajustada por RL |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el servicio de referencia (`--max-model-len 32768`) |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, un único `model.safetensors` de 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con torre de visión, y se ajusta con GRPO de parámetros completos sobre verl con FSDP en bf16 y rollouts con vLLM. El entrenamiento se ejecutó en un nodo con ocho GPU H100 entre el 6 y el 7 de noviembre de 2026, partiendo de un checkpoint de calentamiento SFT (tres épocas sobre 420 episodios exitosos de LIBERO-90 repartidos en 55 tareas). El RL cubre 37 tareas de entrenamiento de LIBERO-90 no reservadas para evaluación, con 8 prompts × 8 rollouts por paso, ventajas normalizadas por grupo, una actualización por paso y 300 pasos totales. Se aplica KL de baja varianza de 1e-2 respecto a la política SFT, learning rate de 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, rechazo a nivel de secuencia con umbral 1e-2, rollouts a temperatura 1 con *thinking* desactivado y guardado cada 20 pasos.

La innovación central es el bucle de crecimiento de la biblioteca como proyecto open source: cada 10 pasos, 20 episodios muestreados de la política se envían a desarrolladores Opus 5.5 que pueden realizar hasta dos acciones cada uno (issue, discusión, comentario, upvote o pull request) en un forge local simulado; un mantenedor Opus 5.5 congelado fusiona o cierra y publica la siguiente versión de la biblioteca. Se completaron 29 rondas, todas aplicadas. La selección del checkpoint se hizo por argmax de par (paso + biblioteca propia del paso) sobre DEV, con un 63,76 % [53,91, 72,57] en el paso 260.

## Capacidades

- Generación de código ejecutable: escribe programas Python sobre una API de robot para manipulación de mesa en LIBERO (agarre, localización, manipulación, transporte).
- Generación de código en JavaScript para Mineflayer (Minecraft) dentro del mismo harness de agente, según indica la model card.
- Uso de una biblioteca de habilidades externa renderizada en el prompt (`README.md`, `grasp.md`, `localize.md`, `manipulation.md`, `transport.md`), sin acceso al tracker de desarrollo.
- Planificación multi-paso dentro de un episodio, con hasta 2.048 tokens por turno y 6.144 tokens por episodio en la decodificación de TEST.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información; la interacción con el entorno se realiza mediante la API del harness.
- Capacidades multilingües: no disponible.
- Modo *thinking*: el modelo base lo soporta, pero el entrenamiento y la evaluación se realizaron con `enable_thinking: false`; no se documenta su comportamiento con thinking activado.
- Visión: la arquitectura conserva la torre de visión de Qwen3.5-9B, pero la política se usa en modo solo texto y no se documentan capacidades visuales entrenadas.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: reproducir o extender el pipeline ASPIRE-RL+OSS usando el checkpoint del paso 260 como referencia de política entrenada en LIBERO-90, comparando con el checkpoint SFT de partida.
- Evaluación de bibliotecas de habilidades como artefacto: servir el modelo junto con `library/` v0025 para medir cuánto del rendimiento depende de la versión de la biblioteca frente a los pesos, ya que el checkpoint se seleccionó emparejado con esa versión concreta.
- Estudio de agentes que escriben código de control: usar el harness del paper para generar programas Python de manipulación y analizar los transcripts, útil para investigar cómo una política aprovecha documentación estructurada en el prompt.
- Experimentos de generalización a estados no vistos: el protocolo de TEST incluye estados retenidos de LIBERO-90 y dos conjuntos de LIBERO-10, lo que permite medir transferencia con decodificación determinista (temperatura 0).
- Generación de código sobre APIs externas en entornos simulados: el mismo harness se aplica a Mineflayer en Minecraft, lo que sirve para probar la transferencia del formato de programa a otro dominio.
- Base para ajustes posteriores: al ser un fine-tune completo de Qwen3.5-9B con licencia Apache 2.0, puede servir como inicialización para nuevos ciclos de GRPO con otras bibliotecas o entornos.

## Benchmarks y rendimiento

Resultados de TEST publicados en la model card (protocolo del apéndice del paper), par paso 260 + biblioteca v0025:

| Metrica | Resultado |
|---|---|
| TEST xfer E1 (q.orls1.*) | 59,00 |
| TEST xfer E2 (q.orls1.*) | 27,68 |
| Media de dos semillas q.orl.e1 / q.orl.e2 (fila del paper) | 55,28 / 21,00 |
| DEV pair en el paso 260 | 63,76 % [53,91, 72,57] |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 19 GB solo para pesos, más overhead de activaciones y caché KV; con 32.768 tokens de contexto se recomienda al menos 40-48 GB para servir con comodidad.
- GPU recomendadas: H100 (el entrenamiento usó 8× H100), A100 80 GB, L40S 48 GB; en consumer, RTX 4090 24 GB queda muy justa en bf16 y requeriría cuantización, que no se publica en el repo.
- Cabe en consumer GPU: solo con cuantización (no disponible en el repo) o con GPUs de 32 GB o más; no se garantiza en 24 GB sin cuantizar.
- Opciones de despliegue: vLLM (release que soporte Qwen3.5, con `--language-model-only --max-model-len 32768`), transformers con `AutoModelForImageTextToText` y `AutoTokenizer`; llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-libero-aspire-oss-rl-s1 | 9,41 B | 32.768 | RL (GRPO) sobre Qwen3.5-9B para políticas robóticas con biblioteca de habilidades | Apache 2.0 | Pesos bf16 en HF, un solo checkpoint |
| Qwen/Qwen3.5-9B | 9,41 B | No disponible en esta ficha | Modelo base multimodal de propósito general | No disponible en esta ficha | Público en HF |
| Checkpoint SFT de partida (mismo pipeline) | 9,41 B | No disponible | SFT sobre episodios LIBERO-90, sin RL | Apache 2.0 (según repo) | No publicado como artefacto independiente en la información disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, enfoque y licencia.

## Limitaciones y advertencias

- Es un artefacto de investigación: no es un asistente general ni un modelo de chat; su uso previsto es la generación de programas de control en el harness del paper.
- El checkpoint está emparejado con la biblioteca v0025; servirlo sin `library/` o con otra versión altera el comportamiento y los números de TEST no son extrapolables.
- Solo se libera el paso 260; no hay optimizer state ni otros pasos, lo que limita la reproducibilidad exacta del entrenamiento.
- La decodificación de referencia es temperatura 0 con thinking desactivado; no se documenta el comportamiento con muestreo o con thinking activado.
- Riesgo de alucinación de API: al generar código sobre una API de robot, puede producir llamadas inexistentes o secuencias inválidas; el paper aplica rechazo a nivel de secuencia durante el entrenamiento, pero no se documenta un filtro equivalente en producción.
- Sesgos: no disponibles; no se publica análisis de sesgos ni evaluación multilingüe.
- Idiomas: no disponibles; el entrenamiento se centró en instrucciones en inglés dentro del harness.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B y las dependencias del harness deben verificarse por separado.
- El modelo depende de un forge simulado y de agentes Opus 5.5 para el crecimiento de la biblioteca; sin ese bucle, la política no mejora y queda fijada a la versión de biblioteca publicada.
- Sin datos de benchmarks estándar de lenguaje ni de robustez fuera de LIBERO-90 y LIBERO-10.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-oss-rl-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de registros: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Paper *Growing Agent Skill Libraries as Open-Source Projects*: referencia pendiente de publicación según la model card (no disponible)
- Repositorio de código del paper: no disponible
- Demo: no disponible
