# obluda420/autoheal-kyc-tiny-aya-distill-sft

## Resumen

`autoheal-kyc-tiny-aya-distill-sft` es un adaptador LoRA publicado por el usuario obluda420 (vinculado a Lexsi Labs) sobre el modelo base `CohereLabs/tiny-aya-global`. Se ha generado con la herramienta AgentTune, un framework de Lexsi Labs que unifica flujos agénticos, entrenamiento, evaluacion, destilacion y auto-reparacion bajo un mismo esquema de trayectorias. El algoritmo declarado es `distill_sft` (destilacion supervisada) y el backend de entrenamiento es `agenttune-trl`, basado en TRL.

El nombre del repositorio sugiere un ajuste orientado a tareas de KYC (conocimiento del cliente) y "autoheal" (auto-reparacion), aunque la model card no documenta el dataset, el proceso de entrenamiento ni las capacidades resultantes. El modelo base tiny-aya-global es un modelo pequeno multilingue de Cohere; el adaptador hereda por tanto su arquitectura y su ventana de contexto.

La relevancia de esta ficha es limitada: se trata de un adaptador experimental sin descargas, sin likes, sin licencia declarada y sin benchmarks publicados. Resulta util como ejemplo de pipeline AgentTune, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de CohereLabs/tiny-aya-global); adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiny-aya-global es de escala pequena, parametros exactos no disponibles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles (el modelo base tiny-aya-global es multilingue, pero el adaptador no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que debe cargarse sobre `CohereLabs/tiny-aya-global` mediante PEFT (`AutoPeftModelForCausalLM`), que lee la configuracion desde `adapter_config.json`. La arquitectura subyacente es la del modelo base, un transformer decoder-only de la familia Aya de Cohere, orientado a cobertura multilingue con un tamano reducido.

El entrenamiento se realizo con el algoritmo `distill_sft` a traves del backend `agenttune-trl`, dentro del framework AgentTune. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO, ni los hiperparametros del LoRA (rank, alpha, modulos objetivo). El nombre del repositorio indica un enfoque de destilacion supervisada aplicada a flujos agénticos de KYC, pero no hay documentacion tecnica que lo confirme.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base tiny-aya-global.
- Capacidad multilingue heredada del modelo base (idiomas concretos no documentados).
- Integracion en flujos agénticos mediante el esquema de trayectorias de AgentTune (segun la model card).
- Soporte de tool calling / function calling: no documentado.
- Capacidades de codigo, matematicas o vision: no documentadas.
- Modo thinking, audio o vision: no disponibles.

## Casos de uso

- Prototipado de pipelines agénticos con AgentTune: el adaptador sirve como ejemplo de artefacto generado por el framework, util para validar el flujo de entrenamiento y despliegue.
- Experimentacion academica con destilacion supervisada: permite comparar el efecto del `distill_sft` sobre el modelo base tiny-aya-global en tareas controladas.
- Pruebas de concepto en KYC: el nombre del repositorio sugiere su uso en clasificacion o extraccion de informacion de cliente, aunque no hay evaluacion publicada que lo respalde.
- Evaluacion de adaptadores LoRA sobre modelos multilingues pequenos: util para medir degradacion o mejora respecto al base en tareas multilingues.
- Base para fine-tuning adicional: al ser un adaptador PEFT, puede combinarse o continuar entrenandose con otros datasets.
- Investigacion sobre "auto-reparacion" de agentes: el nombre "autoheal" apunta a un caso de uso de recuperacion de errores en trayectorias agénticas, aunque no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; depende del modelo base tiny-aya-global (de escala pequena, probablemente inferior a 8 GB en fp16, pero sin confirmacion).
- GPU recomendadas: no disponibles; por el tamano del modelo base, cabria esperar ejecucion en GPU consumer, pero no esta documentado.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: transformers + PEFT (unico metodo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| autoheal-kyc-tiny-aya-distill-sft | no disponible (LoRA sobre tiny-aya-global) | no disponible | no disponible | safetensors (adaptador) | Adaptador experimental, 0 descargas, sin benchmarks |
| CohereLabs/tiny-aya-global | no disponible | no disponible | no disponible | safetensors | Modelo base multilingue de Cohere |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion suficiente para comparar con otros adaptadores o modelos de la misma tarea |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre dataset, hiperparametros y evaluacion: no es posible verificar la calidad del ajuste.
- Licencia no declarada: no se puede garantizar el uso comercial; conviene consultar la licencia del modelo base y del framework AgentTune.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la informacion disponible.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo.
- Idiomas soportados no declarados: el comportamiento multilingue depende del modelo base y puede degradarse tras el ajuste.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad.
- El nombre del repositorio sugiere un dominio (KYC) sin que exista validacion publica; no debe usarse en produccion sin evaluacion propia.
- Es un adaptador, no un modelo completo: requiere cargar el base tiny-aya-global y PEFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/obluda420/autoheal-kyc-tiny-aya-distill-sft
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio AgentTune: https://github.com/Lexsi-Labs/AgentTune_mirror
- Web de Lexsi Labs: https://lexsi.ai/
- Discord de la comunidad Lexsi: https://discord.com/invite/dtEDQ2Z3eg
