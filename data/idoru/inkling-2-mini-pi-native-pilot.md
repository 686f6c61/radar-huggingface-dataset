# idoru/Inkling-2-Mini-pi-native-pilot

## Resumen

Inkling-2-Mini-pi-native-pilot es un adaptador LoRA publicado por el usuario idoru sobre el modelo base thinkingmachines/Inkling-2-Mini. No se trata de un modelo completo, sino de un ajuste fino mediante aprendizaje por refuerzo (GRPO on-policy) empaquetado en el formato de tensores del adaptador nativo de vLLM de SkyRL. El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache 2.0.

El propósito declarado es servir como piloto tecnico de un pipeline de entrenamiento con el entrenador nativo Megatron de Inkling: una unica actualizacion GRPO sincrona, con ocho intentos muestreados por tarea, temperatura 0,8, learning rate 2e-5 y rango LoRA 32. La revision base sobre la que se construye es `ed40e7da625f594fc9c4990f5f66be24873c22d7`.

Su relevancia es limitada y experimental: el propio autor indica que no existe todavia una estimacion de mejora emparejada sobre un conjunto de validacion retenido, por lo que no debe considerarse un artefacto listo para produccion. Es util como referencia reproducible de un flujo de RL aplicado a agentes sobre el modelo base Inkling-2-Mini.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base thinkingmachines/Inkling-2-Mini (arquitectura del base no disponible en la informacion proporcionada) |
| Parametros totales | No disponible (el repositorio de 1,6 GB contiene los pesos del adaptador, no del modelo completo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout de tensores del adaptador on-policy nativo de vLLM de SkyRL) |
| Rango LoRA | 32 |
| Modelo base | thinkingmachines/Inkling-2-Mini (revision `ed40e7da625f594fc9c4990f5f66be24873c22d7`) |
| Libreria declarada | vLLM |
| Tipo de ajuste | GRPO on-policy sincrono (1 actualizacion) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 entrenado con GRPO (Group Relative Policy Optimization) en modo on-policy sincrono sobre el modelo base Inkling-2-Mini, empleando el entrenador nativo Megatron de Inkling. El entrenamiento consistio en una unica actualizacion programada, con ocho intentos muestreados por tarea, temperatura de muestreo 0,8 y learning rate 2e-5. La senal de recompensa provino del verificador original de Harbor, lo que situa el ajuste en el terreno del RL verificable orientado a tareas de agente.

Los pesos se empaquetan en el layout de tensores del adaptador on-policy nativo de vLLM de SkyRL, lo que condiciona el ecosistema de despliegue: esta pensado para cargarse junto al modelo base en infraestructura vLLM compatible con adaptadores. El fichero `training.json` del repositorio registra el paso entrenado, la revision de origen y el checksum SHA-256 de los pesos. No se documentan en la informacion disponible la composicion del dataset, el numero de tokens de entrenamiento ni detalles adicionales de la arquitectura del modelo base.

## Capacidades

- Generacion de texto: heredadas del modelo base Inkling-2-Mini; el adaptador modula el comportamiento pero no anade modalidades nuevas.
- Orientacion a agentes: el ajuste se entrena sobre tareas evaluadas por el verificador de Harbor, lo que sugiere un enfasis en tareas de agente verificables.
- Razonamiento multi-paso: plausible por el uso de GRPO sobre tareas de agente, aunque sin mediciones publicadas que lo confirmen.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.
- Aprendizaje por refuerzo: el artefacto es en si mismo un resultado de RL, no una capacidad del modelo en inferencia.

## Casos de uso

- Reproduccion de experimentos de RL para agentes: el adaptador sirve como referencia para replicar un ciclo GRPO on-policy con verificador externo sobre Inkling-2-Mini, usando el layout nativo de SkyRL y vLLM.
- Investigacion en tecnicas de adaptadores: util para estudiar como una unica actualizacion GRPO de rango 32 afecta al comportamiento del modelo base en tareas verificables.
- Evaluacion comparativa de pipelines de entrenamiento: permite contrastar el entrenador nativo Megatron de Inkling frente a otras implementaciones de GRPO en terminos de trazabilidad (checksums, revisiones, pasos registrados).
- Desarrollo de harness de evaluacion: el enlace al Space de Hugging Face del autor sugiere su uso como banco de pruebas para adaptadores de agente a escala.
- Docencia y formacion tecnica: ejemplo real y ligero (1,6 GB) de artefacto LoRA con metadatos completos de entrenamiento para explicar flujos de RL aplicado.
- Base para futuros ajustes: punto de partida para experimentos con mas actualizaciones o mayor rango, dado que el autor declara este piloto como paso inicial de una serie programada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que esta release no cuenta con una estimacion de mejora emparejada sobre un conjunto retenido, y que las mediciones de optimizador y benchmark se reportan por separado en los registros publicos del run.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base Inkling-2-Mini, cuyas especificaciones no constan en la informacion proporcionada.
- GPU recomendadas: no disponibles; el requisito vendra determinado por el modelo base y por el soporte de adaptadores en vLLM.
- Compatibilidad con GPU de consumo: no disponible; no puede determinarse sin conocer el tamano del modelo base.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA en el layout on-policy nativo de SkyRL. Otros runners (llama.cpp, Ollama, TGI) no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-pi-native-pilot | Adaptador LoRA rango 32 sobre Inkling-2-Mini | No disponible | Adaptador RL (GRPO) | Apache 2.0 | Hugging Face (0 descargas) |
| thinkingmachines/Inkling-2-Mini | No disponible | No disponible | Modelo base | No disponible | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos directamente comparables de la misma categoria (adaptadores RL de agente sobre modelos Mini) en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: una sola actualizacion GRPO no permite extraer conclusiones solidas sobre mejora de rendimiento; el autor lo reconoce explicitamente.
- Sin evaluacion retenida: no existe estimacion de mejora emparejada, por lo que no hay evidencia cuantitativa de que el adaptador supere al modelo base.
- Dependencia del modelo base: cualquier limitacion, sesgo o restriccion de Inkling-2-Mini se hereda integramente; sus caracteristicas no estan documentadas en la informacion disponible.
- Acoplamiento a infraestructura: el layout de tensores nativo de SkyRL/vLLM limita la portabilidad a otros runners sin conversion previa.
- Riesgo de alucinacion: no evaluado para este adaptador; debe asumirse el del modelo base.
- Idiomas y sesgos: sin datos; no puede garantizarse cobertura multilingue ni comportamiento libre de sesgos.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base antes de desplegar en produccion.
- Madurez: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia; sin comunidad ni soporte documentado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/idoru/Inkling-2-Mini-pi-native-pilot
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Experimento en vivo (Space): https://huggingface.co/spaces/idoru/inkling-2-mini-harness-adapters
- Blog de referencia sobre adaptadores a escala: https://huggingface.co/blog/harness-adapters-at-scale
