# chengjunyan1/oss-skills-minecraft-direct-rl-s1

## Resumen

`chengjunyan1/oss-skills-minecraft-direct-rl-s1` es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3.5-9B, desarrollado por chengjunyan1 como parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. El modelo está especializado en la resolución de tareas de Minecraft mediante generación de código: la política escribe programas JavaScript de Mineflayer que se ejecutan sobre el motor MINDcraft, en lugar de emitir acciones de bajo nivel directamente.

Se trata del checkpoint final (paso 260 de 300) de la fila "Direct RL (MCL-5)" del bloque de pesos abiertos del paper. El entrenamiento parte de un modelo supervisado previo (MC-SFT1) y aplica GRPO con una biblioteca de habilidades fija (`mc_seed_v2`) que se renderiza en cada prompt y nunca crece durante el RL. Esto lo convierte en la línea base de RL directo frente a la variante ASPIRE-RL+OSS del mismo trabajo.

El modelo conserva la arquitectura completa de Qwen3.5, incluida su torre de visión, aunque la política se emplea en modo solo texto. Es relevante para investigadores que trabajen en agentes basados en código, aprendizaje por refuerzo con recompensas verificables y evaluación de habilidades composicionales en entornos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, incluye torre de visión; uso texto) |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 14.336 tokens de prompt y 14.336 de respuesta en entrenamiento; servido con `--max-model-len 32768` |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, un único `model.safetensors` de 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3.5-9B con arquitectura transformer completa, incluida la torre de visión del modelo base (aunque la política se usa en modo solo texto). El entrenamiento se realizó con GRPO de parámetros completos sobre verl con FSDP en bf16 y 8 GPU, partiendo de MC-SFT1 (paso 309 del calentamiento supervisado sobre demostraciones verificadas de Minecraft). Se emplearon 313 tareas de RL (258 de un solo agente y 55 de dos agentes), 8 prompts por 8 rollouts por paso, 300 pasos, KL de 0,01, tasa de aprendizaje 1e-6 con decaimiento coseno y 10 pasos de calentamiento. Las ventanas de prompt y respuesta fueron de 14.336 tokens cada una, con semilla de datos 1 y la guía `mc_seed_v2` fija.

La innovación metodológica reside en el uso de "code-as-policies": el modelo genera programas JavaScript de Mineflayer que se ejecutan en el motor MINDcraft, con la biblioteca de habilidades renderizada directamente en el prompt (`README.md` primero; `LIBRARY.json` y `PROVENANCE.md` como metadatos no renderizados). El checkpoint se seleccionó con la regla DEV^MC P11.3 (mejor paso elegible entre 0 y 120-300), resultando el paso 260 con DEV^MC 0.694 sobre 61 tareas y 183 episodios por punto. Los pasos 211-300 se ejecutaron sobre pools de mundos con motor v0.5 a `time_scale` 4 (enmienda v1.1i). El entrenamiento se llevó a cabo en H100 en dos clústeres (jobs a3mega 27130 y 27825; slurm2 1030191718 y 1101051710).

## Capacidades

- Generación de código ejecutable: escribe programas JavaScript de Mineflayer para controlar agentes en Minecraft.
- Razonamiento multi-paso orientado a tareas: planificación y ejecución de secuencias de habilidades (combate, cocina, crafteo, recolección, programación, trabajo en equipo).
- Trabajo en equipo multiagente: entrenado explícitamente con 55 tareas de dos agentes.
- Uso de biblioteca de habilidades: interpreta y aplica las fichas de `library/` (combat, cook, craft, gather, program, team) incluidas en el prompt.
- Capacidad de visión heredada de Qwen3.5-9B (torre de visión presente en los pesos), aunque la política se emplea en modo solo texto.
- Modo thinking desactivable mediante `chat_template_kwargs={"enable_thinking": false}`, que es la configuración usada en la evaluación TEST.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y despliegue con vLLM.

## Casos de uso

- Investigación en RL para agentes: línea base reproducible para comparar RL directo frente a métodos con bibliotecas de habilidades crecientes (ASPIRE-RL+OSS) en el mismo entorno y con las mismas semillas.
- Evaluación de agentes basados en código: reproducción de las métricas TEST del paper (E1^MC 6.2, E2^MC 0.7, XT-MA 5.8) con el protocolo de decodificación indicado (temperatura 0, 2.048 tokens por turno, 6.144 por episodio).
- Automatización de tareas en Minecraft: ejecución de rutinas de recolección, crafteo, cocina y combate mediante programas generados que consumen las fichas de la biblioteca.
- Coordinación multiagente: uso en tareas de equipo de dos agentes sobre el motor MINDcraft, aprovechando el entrenamiento específico en 55 tareas colaborativas.
- Estudio de prompting con contexto largo: análisis de cómo el modelo integra una biblioteca de habilidades renderizada en el prompt con ventanas de hasta 14.336 tokens.
- Punto de partida para nuevos ajustes: al ser un checkpoint bf16 completo de Qwen3.5-9B, sirve como base para RL posterior o SFT sobre dominios de agentes relacionados.
- Despliegue en pipelines de investigación: servido con vLLM (`--language-model-only --max-model-len 32768`) para generar rollouts a escala en experimentos de RL.

## Benchmarks y rendimiento

Resultados TEST tal como se imprimen en el paper (protocolo en su apéndice):

| Metrica | Valor |
|---|---|
| E1^MC | 6.2 |
| E2^MC | 0.7 (136 tareas de equipo) |
| XT-MA | 5.8 |
| DEV^MC (paso 260) | 0.694 (61 tareas, 183 episodios por punto) |

Estos valores corresponden a la fila "MC-SFT + GRPO, direct RL (seed 1)" (q.mc.drl.e1 / .e2 / .xt) de la tabla `tab:ninb-mc`, y se contrastan con la fila "ASPIRE-RL+OSS - direct RL" (q.mc.od.*). No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto y 40-80 GB para ventanas de 32.768 tokens.
- GPU recomendadas: H100 (usadas en el entrenamiento), A100 80 GB para servicio con contexto completo; A100 40 GB o L40S para contextos reducidos.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto limitado; no se publican pesos cuantizados, por lo que no hay GGUF oficial para llama.cpp u Ollama.
- Opciones de despliegue: vLLM es la vía documentada (`vllm serve ... --language-model-only --max-model-len 32768`); también es cargable con transformers mediante `AutoModelForImageTextToText` y `AutoTokenizer`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-minecraft-direct-rl-s1 | 9,4 B | 14.336 (entrenamiento); 32.768 servido | Agente Minecraft con RL directo y biblioteca fija | Apache 2.0 | Pesos bf16 en Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,4 B | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |
| MC-SFT1 (paso 309) | 9,4 B | no disponible | SFT de Minecraft, punto de partida del RL | no disponible | No liberado en esta publicación |
| ASPIRE-RL+OSS - direct RL | no disponible | no disponible | RL con biblioteca de habilidades creciente | no disponible | Fila del paper (q.mc.od.*) |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado exclusivamente para tareas de Minecraft sobre el motor MINDcraft; su rendimiento fuera de ese entorno no está caracterizado.
- Dependencia del harness: requiere el arnés de agente del paper y la biblioteca `library/` renderizada en el prompt; sin ella, el comportamiento esperado no está garantizado.
- Uso solo texto en la política: aunque conserva la torre de visión, no se documenta evaluación multimodal.
- Idiomas no especificados: la model card no declara idiomas soportados.
- Resultados modestos en tareas de equipo: E2^MC de 0,7 sobre 136 tareas de equipo indica baja fiabilidad en escenarios multiagente.
- Riesgo de alucinación en la generación de código: los programas JavaScript pueden ser sintácticamente válidos pero fallar en ejecución; no se documentan tasas de error de ejecución.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones de menor precisión, lo que limita el despliegue en hardware de consumo.
- Solo se libera un checkpoint (paso 260): no hay estados del optimizador ni otros pasos, lo que dificulta la reproducción exacta del entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.5-9B deben verificarse por separado.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-minecraft-direct-rl-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de registros: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Paper: referencia pendiente de publicación según la model card (no disponible)
- Repositorio de código: no disponible
- Demo: no disponible
