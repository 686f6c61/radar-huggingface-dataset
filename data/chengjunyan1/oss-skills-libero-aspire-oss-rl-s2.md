# chengjunyan1/oss-skills-libero-aspire-oss-rl-s2

## Resumen

`chengjunyan1/oss-skills-libero-aspire-oss-rl-s2` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario chengjunyan1 como artefacto reproducible de un trabajo de investigacion sobre bibliotecas de habilidades para agentes. El modelo no es un asistente conversacional de proposito general: es una politica entrenada para escribir programas Python sobre una API de robot en tareas de manipulacion de sobremesa (LIBERO) y, segun la model card, tambien JavaScript de Mineflayer en Minecraft, dentro del arnes de agente del articulo.

La relevancia del checkpoint es metodologica. Forma parte de la fila "+ issues + PRs, RL (ASPIRE-RL+OSS)" del articulo *Growing Agent Skill Libraries as Open-Source Projects*: la biblioteca de habilidades crece como si fuera un proyecto de codigo abierto, con desarrolladores (Claude Opus 5.5) que abren issues y pull requests sobre un forge simulado y un mantenedor congelado que fusiona o cierra y publica una nueva version de la biblioteca cada diez pasos. La politica solo ve la biblioteca publicada.

El checkpoint liberado es el paso 300 de 300 (semilla 2), el seleccionado por la regla pair-DEV del articulo, servido junto a la biblioteca `library/` (version v0029) con la que fue evaluado en TEST. Los pesos son un unico `model.safetensors` en bf16 con la arquitectura completa de Qwen3.5 (incluida la torre de vision), aunque la politica se usa en modo solo texto. El repositorio no incluye estado del optimizador ni otros pasos intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 (arquitectura completa, incluida torre de vision); politica usada en modo solo texto |
| Parametros totales | 9.409.813.744 (760 tensores) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantizacion | no disponible (pesos liberados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico `model.safetensors` en bf16, 18.819.722.392 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura y el tokenizador de Qwen/Qwen3.5-9B, con 9.409.813.744 parametros repartidos en 760 tensores e incluyendo la torre de vision del modelo base, si bien el autor indica que la politica se emplea en modo solo texto. El entrenamiento parte de un checkpoint de calentamiento SFT (tres epocas sobre 420 episodios exitosos de LIBERO-90 en 55 tareas) y aplica GRPO de parametros completos con verl sobre FSDP en bf16 y rollouts con vLLM, en un nodo de ocho GPU H100.

Los detalles de optimizacion estan bien documentados: 37 tareas de entrenamiento de LIBERO-90 no reservadas para evaluacion, 8 prompts x 8 rollouts por paso, ventajas de resultado normalizadas por grupo, una actualizacion por paso, 300 pasos, KL de baja varianza de 1e-2 respecto a la politica SFT, tasa de aprendizaje de 1e-6 tras 10 pasos de calentamiento con decaimiento coseno hasta 1e-7, rechazo a nivel de secuencia con umbral 1e-2, rollouts a temperatura 1 con el modo thinking desactivado y guardado cada 20 pasos. La innovacion destacable no esta en la arquitectura sino en el bucle de entrenamiento: la biblioteca de habilidades se versiona mediante un proceso tipo proyecto open source (issues, discusiones y pull requests abiertos por desarrolladores Claude Opus 5.5 sobre un forge local simulado, con un mantenedor congelado que publica una version nueva cada diez pasos) y la politica solo observa las versiones publicadas. El checkpoint se selecciono con la regla pair-DEV del articulo: paso 300 con DEV de 54,37 % [44,85, 63,57].

## Capacidades

- Generacion de codigo ejecutable como politica: escribe programas Python sobre una API de robot para tareas de manipulacion de LIBERO y, segun la model card, JavaScript de Mineflayer para Minecraft.
- Uso de una biblioteca de habilidades externa: el contenido de `library/` (README, grasp, localize, manipulation, transport) se renderiza en el prompt y el modelo lo aprovecha para componer programas.
- Razonamiento multi-paso dentro de un episodio: el protocolo de TEST permite hasta 2.048 tokens por turno y 6.144 por episodio, con varios turnos de escritura de codigo.
- Capacidad multimodal latente: conserva la torre de vision de Qwen3.5, aunque el autor indica que la politica se usa en modo solo texto.
- Modo thinking desactivable: el chat template admite `enable_thinking: false`, que es la configuracion empleada en entrenamiento y evaluacion.
- Soporte de tool calling y function calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Manipulacion robotica de sobremesa en LIBERO: el modelo genera programas Python que llaman a la API del robot para tareas de agarre, localizacion, transporte y manipulacion, apoyandose en las fichas de `library/` renderizadas en el prompt. Es su caso de uso principal y el unico con evaluacion publicada en la model card.
- Investigacion en bibliotecas de habilidades para agentes: sirve como politica de referencia para reproducir la fila ASPIRE-RL+OSS del articulo y comparar el efecto de versionar la biblioteca como proyecto open source frente a otras variantes.
- Reproduccion de experimentos de RL para agentes: al liberar el paso 300 exacto con la version v0029 de la biblioteca, permite reejecutar el protocolo de TEST (temperatura 0, 2.048 tokens por turno, 6.144 por episodio, thinking off) y contrastar los numeros reportados.
- Generacion de codigo de agente en dominios con API acotada: el mismo esquema (programas cortos sobre una API documentada, con una biblioteca de recetas en el contexto) es trasladable a otros entornos con interfaz programatica bien definida, como automatizacion de herramientas internas.
- Punto de partida para ajuste con GRPO: el checkpoint y su receta (verl + FSDP + vLLM, KL 1e-2, LR 1e-6 con decaimiento coseno) sirven como inicializacion para nuevos ciclos de RL en tareas de agentes con recompensa verificable.
- Evaluacion de agentes en Minecraft: la model card menciona que la politica escribe JavaScript de Mineflayer dentro del mismo arnes, lo que permite probar transferencia entre dominios de programacion sobre API.
- Analisis de la evolucion de una biblioteca de habilidades: al estar disponible `library/` con `PROVENANCE.md` y `LIBRARY.json`, se puede estudiar que habilidades se anadieron o modificaron hasta la version v0029 y correlacionarlo con el rendimiento.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de TEST del articulo para este checkpoint (paso 300 con biblioteca v0029), en el protocolo TEST xfer por pares:

| Evaluacion | Resultado |
|---|---|
| TEST xfer E1 (q.orls2.*) | 51,56 |
| TEST xfer E2 (q.orls2.*) | 14,32 |
| Media de dos semillas de la fila (referencia del articulo) | 55,28 / 21,00 |
| DEV pair (criterio de seleccion) | 54,37 % [44,85, 63,57] |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de proposito general para este checkpoint. Tampoco se ofrecen comparaciones numericas con modelos alternativos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 18,8 GB, por lo que se necesita algo mas de 20 GB solo para pesos; con cache KV para 32.768 tokens de contexto conviene reservar 24-32 GB en funcion del lote y de la configuracion de vLLM.
- GPU recomendadas: el autor entreno con 8x H100; para servir el modelo en bf16 son adecuadas A100 40/80 GB, H100 y L40S. En consumer, una RTX 4090 de 24 GB queda muy al limite en bf16 y requeriria cuantizacion o reduccion de contexto.
- Cabe en consumer GPU: si, con cuantizacion (por ejemplo, 4 bits) en GPUs de 24 GB; en bf16 solo con GPUs de 24 GB o mas y contexto reducido, con riesgo de OOM.
- Opciones de despliegue: vLLM es la via documentada por el autor (`vllm serve ... --language-model-only --max-model-len 32768`), con una release que soporte Qwen3.5. Tambien es cargable con `transformers` mediante `AutoModelForImageTextToText` y `AutoTokenizer`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El protocolo de TEST fija temperatura 0, 2.048 tokens por turno, 6.144 por episodio y thinking desactivado, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chengjunyan1/oss-skills-libero-aspire-oss-rl-s2 | 9,41 B | no disponible (ejemplo a 32.768) | Politica RL (GRPO) para agentes que escriben codigo sobre API de robot | Apache 2.0 | Pesos en HF, paso 300 y biblioteca v0029 |
| Qwen/Qwen3.5-9B (modelo base) | 9 B | no disponible en la informacion proporcionada | Modelo multimodal de proposito general | no disponible en la informacion proporcionada | Publico en HF |
| Otros checkpoints de la misma fila (semilla 1) | 9,41 B | no disponible | Misma receta ASPIRE-RL+OSS, otra semilla | Apache 2.0 | Referenciados en el articulo; no se detalla su disponibilidad en la informacion proporcionada |

No se dispone de datos de benchmarks de proposito general ni de otros modelos comparables de la misma categoria (politicas para LIBERO) en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Especializacion estrecha: es una politica entrenada para escribir programas sobre la API de LIBERO (y Mineflayer), no un asistente general; su uso fuera de ese arnes producira codigo poco fiable.
- Dependencia de la biblioteca: el comportamiento esta condicionado a que se renderice `library/` en el prompt tal como se hizo en entrenamiento; usar otra version de la biblioteca invalida los numeros de TEST reportados.
- Un unico checkpoint: solo se libera el paso 300 con la version v0029; no hay pasos intermedios ni estado del optimizador, lo que limita reanudar el entrenamiento desde el repositorio.
- Rendimiento modesto en el segundo conjunto de TEST: E2 de 14,32 frente a E1 de 51,56, lo que sugiere sensibilidad al conjunto de evaluacion y baja robustez en la transferencia.
- Riesgo de alucinacion de API: al generar codigo contra una API de robot, puede invocar funciones o argumentos inexistentes; en produccion es imprescindible validar y ejecutar en simulacion antes de actuar sobre hardware.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion proporcionada.
- Idiomas: no se declaran idiomas soportados; el entrenamiento esta centrado en instrucciones y codigo del entorno del articulo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B tiene su propia licencia que conviene verificar; la model card no detalla condiciones adicionales.
- Reproducibilidad: los resultados citados dependen de un protocolo de evaluacion concreto descrito en el apendice del articulo, aun no publicado en el momento de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-oss-rl-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Articulo de referencia: *Growing Agent Skill Libraries as Open-Source Projects* (referencia pendiente de publicacion segun la model card; no disponible)
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
