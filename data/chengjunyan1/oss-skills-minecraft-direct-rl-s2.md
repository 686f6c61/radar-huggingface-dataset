# chengjunyan1/oss-skills-minecraft-direct-rl-s2

## Resumen

oss-skills-minecraft-direct-rl-s2 es un checkpoint final de aprendizaje por refuerzo (RL) publicado por chengjunyan1 como parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-9B (9.409.813.744 parametros) entrenado con GRPO para que el modelo escriba programas JavaScript de Mineflayer dentro del motor MINDcraft, resolviendo tareas de agente en Minecraft (individuales y en equipo).

El modelo no es un asistente conversacional general, sino una politica de agente especializada: recibe en el prompt una biblioteca de habilidades fija (los ficheros de `library/`) y produce codigo ejecutable como accion. Corresponde a la semilla 2 de la fila "Direct RL" del paper, donde la biblioteca de skills nunca crece durante el RL, sirviendo como linea base abierta del bloque de pesos publicos.

Es relevante para investigadores que trabajan en agentes LLM, RL con GRPO y entornos tipo Minecraft, porque libera pesos completos en bf16 (arquitectura Qwen3.5 completa, incluida torre de vision, aunque la politica se usa solo en texto) junto con la biblioteca exacta usada en evaluacion TEST, permitiendo reproducir el protocolo del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, incluye torre de vision; uso text-only como politica) |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de servicio recomendada por el autor) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (un unico `model.safetensors` bf16, 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de ~9.400 millones de parametros con torre de vision y tokenizer propios de Qwen3.5. El checkpoint publicado contiene solo pesos (sin estado del optimizador ni otros pasos) y conserva la arquitectura completa del base, aunque la politica se emplea exclusivamente en modo texto.

El entrenamiento es GRPO de parametros completos (verl con FSDP, bf16, 8 GPUs) desde MC-SFT1, el calentamiento supervisado de Minecraft (paso 309) sobre demostraciones verificadas. Se usaron 313 tareas de RL (258 de un agente y 55 de dos agentes), 8 prompts x 8 rollouts por paso, 300 pasos, KL 0.01, learning rate 1e-6 con schedule coseno y 10 pasos de warm-up. En cada prompt se inyecta la biblioteca fija mc_seed_v2 (sin crecimiento durante el RL). El entrenamiento se ejecuto en RTX PRO 6000 con mundos acelerados en tiempo; DEV y TEST en H100. El checkpoint escogido es el paso 300 (regla DEV P11.3, grid 0, rango 120..300).

## Capacidades

- Generacion de codigo como politica: escribe programas JavaScript de Mineflayer ejecutables en el motor MINDcraft.
- Razonamiento multi-paso orientado a tareas: combate, cocina, crafting, recoleccion y programacion, guiado por la biblioteca de skills inyectada en el prompt.
- Tareas de agente individual y en equipo (55 tareas de dos agentes en el entrenamiento).
- Seguimiento de instrucciones estructuradas mediante ficheros de biblioteca (`combat.md`, `cook.md`, `craft.md`, `gather.md`, `program.md`, `team.md`).
- Capacidad multimodal teorica por herencia de Qwen3.5 (torre de vision presente en los pesos), aunque la politica se usa solo en texto.
- Modo thinking desactivable (`enable_thinking: false` en el chat template), que es la configuracion de decodificacion usada en TEST.
- No se documenta soporte de tool calling generico ni capacidades multilingues mas alla del base.

## Casos de uso

- Investigacion en RL de agentes: reproducir el protocolo TEST del paper con los pesos y la biblioteca exactos, sirviendo como linea base "Direct RL" frente a variantes con biblioteca creciente.
- Evaluacion de agentes en Minecraft: desplegar la politica en MINDcraft/Mineflayer para medir tasas de exito en tareas de recoleccion, crafting y combate con la semilla fija mc_seed_v2.
- Estudio de bibliotecas de skills: comparar como una biblioteca estatica inyectada en el prompt afecta la generacion de codigo frente a esquemas donde la biblioteca evoluciona.
- Experimentos de GRPO: reutilizar el checkpoint como inicializacion para nuevos ciclos de RL con otras semillas o bibliotecas, dado que se publican pesos completos en bf16.
- Tareas cooperativas multi-agente: usar las habilidades de `team.md` para probar coordinacion entre dos agentes en entornos compartidos.
- Reproducibilidad de papers: verificar los resultados declarados (celdas TEST A4/B6/C6/A5 y niveles en `readouts/mcossrl-s1-vs-mcl6-s2-...`) con el mismo harness y decodificacion (temperatura 0, 2.048 tokens por turno, 6.144 por episodio).
- Generacion de codigo para entornos simulados: adaptar el enfoque code-as-policies a otros motores de simulacion con API tipo JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las celdas TEST (A4 / B6 / C6 / A5) y a los ficheros de readouts del dataset `chengjunyan1/oss-skills-records`, pero no incluye cifras numericas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda 24 GB o mas para contexto moderado y 40-80 GB para contextos largos.
- GPU recomendadas: H100 (usadas en DEV/TEST del paper), A100 80 GB, RTX PRO 6000 (usadas en entrenamiento). Una RTX 4090 (24 GB) puede alojar los pesos en bf16 pero con margen ajustado; cuantizaciones de terceros no estan documentadas por el autor.
- Cabe en GPU consumer de 24 GB en bf16 con contexto reducido; para 32.768 tokens se necesita memoria adicional significativa.
- Opciones de despliegue: vLLM (`vllm serve ... --language-model-only --max-model-len 32768`), transformers (`AutoModelForImageTextToText`), y herramientas compatibles con safetensors/GGUF de Qwen3.5 (llama.cpp/Ollama no documentadas para este checkpoint).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oss-skills-minecraft-direct-rl-s2 | 9,41 B | 32.768 (config. autor) | Politica de agente Minecraft (code-as-policies) | apache-2.0 | Pesos bf16 en HF |
| Qwen/Qwen3.5-9B (base) | ~9,4 B | no disponible en esta ficha | Modelo generalista multimodal | no disponible en esta ficha | HF |
| MC-SFT1 (calentamiento supervisado) | ~9,4 B | no disponible | Politica Minecraft via SFT | no disponible | Referenciado en el paper, no publicado como checkpoint independiente en esta informacion |
| Otras semillas de la fila Direct RL (seed 1, etc.) | ~9,4 B | no disponible | Politica Minecraft via GRPO | apache-2.0 (presumible) | Referenciadas en `oss-skills-records` |

## Limitaciones y advertencias

- Modelo especializado: no es un asistente general; fuera del harness de MINDcraft y de la biblioteca inyectada, su comportamiento no esta validado.
- Dependencia de la biblioteca: el checkpoint fue TESTeado con mc_seed_v2 fija; cambiar `library/` altera el comportamiento esperado.
- Uso text-only: la torre de vision existe en los pesos pero la politica no fue entrenada para entradas visuales.
- Riesgo de alucinacion en codigo: los programas JavaScript generados pueden fallar en ejecucion; el paper usa verificacion y rollouts, no se documenta tasa de error.
- Sesgos conocidos: no disponibles; el modelo base Qwen3.5 puede arrastrar sesgos no evaluados en este ajuste.
- Idiomas: no se documentan; el entrenamiento se centra en instrucciones en ingles del harness.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3.5 y el dataset deben verificarse por separado.
- Sin estado del optimizador ni pasos intermedios: no es reanudable directamente para continuar el RL desde el paso 300 con el mismo estado.
- Fecha de creacion futura (2026-11-24) y 0 descargas/0 likes: checkpoint muy reciente y sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-minecraft-direct-rl-s2
- Dataset de registros: https://huggingface.co/datasets/chengjunyan1/oss-skills-records (carpeta `rl-runs/minecraft-direct-rl-s2/`)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper: referencia pendiente de publicacion segun la model card (no disponible)
- Repositorio de codigo: no disponible en la informacion proporcionada
