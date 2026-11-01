# galwert/AnchorRep-Mistral-7B-Instruct-v0.2

## Resumen

AnchorRep-Mistral-7B-Instruct-v0.2 es un adaptador LoRA de defensa publicado por galwert sobre el modelo base mistralai/Mistral-7B-Instruct-v0.2. No es un modelo nuevo, sino un delta de pesos (0,3 GB en el repositorio) que, aplicado sobre el base sin modificar, produce una versión endurecida frente a ataques de jailbreak que se transfieren entre modelos. El objetivo concreto es reducir el éxito de transferencia de sufijos adversariales optimizados contra un modelo surrogate distinto (ataques GCG cross-model), un vector de ataque relevante en pipelines donde el atacante no tiene acceso al modelo objetivo.

La técnica empleada es repulsión de representaciones (representation repulsion) contra un ancla congelada: Qwen/Qwen1.5-7B-Chat. El adaptador se entrena combinando una pérdida de proyección de la dirección de rechazo, una penalización CKA que aleja las representaciones internas del modelo de las del ancla, y términos de preservación de la coherencia y de la distribución de tokens benigna. El resultado reportado por los autores es una tasa de éxito adversarial (ASR) del 0 % en transferencia self, 1 % contra el ancla y 2 % contra otros modelos, con un coste mínimo en calidad percibida.

Es relevante ahora porque los ataques de transferencia entre modelos open-weight han demostrado ser baratos y efectivos, y la mayoría de las defensas publicadas o bien requieren reentrenamiento completo o bien degradan notablemente el comportamiento benigno. AnchorRep se presenta como artefacto complementario del paper homónimo aceptado en NeurIPS 2026, con configuración de entrenamiento, ablaciones y logs de auditoría publicados. La licencia es Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) con adaptador LoRA acoplado |
| Parametros totales | 7,24B en el modelo base; el delta LoRA no se especifica en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base; Mistral-7B-Instruct-v0.2 declara 32k tokens) |
| Tipos de cuantizacion | no disponible; el adaptador se entrena y reporta en fp32 |
| Idiomas soportados | evaluado en ingles, espanol y chino (apendice multilingue del paper); resto no testeado |
| Licencia | Apache-2.0 (tanto el delta LoRA como el modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base en safetensors |
| Libreria | peft (compatible con transformers) |
| Rango / alpha LoRA | 32 / 64 |
| Modulos objetivo | q, k, v, o, up, down, gate_proj |
| Capa objetivo | mid (50 % de profundidad) |
| Precisión de entrenamiento | fp32 |
| Pasos de entrenamiento | 600 |
| Semilla | 42 |
| Modelo ancla | Qwen/Qwen1.5-7B-Chat (congelado) |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre un transformer decoder-only estándar (Mistral-7B-Instruct-v0.2) mediante LoRA de rango 32 y alpha 64, con módulos objetivo q, k, v, o, up, down y gate_proj, aplicado en la capa correspondiente al 50 % de profundidad. El entrenamiento se realiza en fp32 durante 600 pasos con semilla 42. La innovación no está en la arquitectura del base sino en la función de pérdida: se combina una proyección de la dirección de rechazo (peso α = 0,15), una penalización de repulsión CKA frente a las representaciones del ancla Qwen1.5-7B-Chat (peso γ = 0,7, alcance "all", es decir, todos los prompts que contribuyen a la repulsión), una preservación de salida benigna (β = 1,0) y de la KL benigna (ε = 0,8), y un término de preservación de next-token (δ = 0,04). La idea es que el modelo endurecido ocupe una región del espacio de representaciones suficientemente alejada de la del ancla como para que los sufijos adversariales optimizados contra esta última dejen de transferir.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores; el procedimiento es un ajuste supervisado con la pérdida multiobjetivo descrita. Tampoco se detalla el mecanismo de verificación manual de ASR más allá de la referencia al protocolo del paper. La configuración completa está en `training_config.json` del repositorio, y las ablaciones por pérdida y rangos de hiperparámetros en el apéndice del paper.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno heredados de Mistral-7B-Instruct-v0.2.
- Defensa frente a ataques de jailbreak por transferencia cross-model (GCG): ASR reportado de 0 % self, 1 % contra el ancla y 2 % contra otros modelos.
- Preservación de comportamiento benigno: Garble Rate del 0 % en OR-Bench, Δ MT-Bench de +0,07 y Δ XSTest refusal de -0,4.
- Aumento de la tasa de rechazo en OR-Bench (+4,4 puntos), lo que indica mayor cautela sin degradar la calidad conversacional.
- Cobertura multilingüe parcial: el paper evalúa inglés, español y chino, donde la defensa cierra huecos de seguridad del modelo base.
- Compatibilidad con el ecosistema PEFT/transformers: carga como adaptador, fusión con `merge_and_unload()` para obtener un modelo único desplegable.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio específicas del adaptador; las que herede el base no se han verificado tras la aplicación del delta.

## Casos de uso

- Endurecimiento de despliegues existentes de Mistral-7B-Instruct-v0.2: aplicar el adaptador sobre el base sin reentrenar y fusionarlo con `merge_and_unload()` para obtener un checkpoint único que reduzca la superficie de ataque por transferencia.
- Investigación en seguridad de LLM: servir como baseline reproducible para medir ASR de ataques GCG cross-model, con configuración, semilla y logs de auditoría publicados.
- Evaluación comparativa de defensas: usar el delta junto con el repositorio GitHub del paper para reproducir ablaciones por pérdida (α, β, γ, δ, ε) y comparar contra otras defensas de la literatura.
- Filtrado previo en pipelines de moderación: colocar el modelo endurecido como primera capa de un sistema de clasificación o generación sensible, donde un ASR bajo por transferencia reduce falsos negativos ante sufijos adversariales.
- Despliegue multilingüe en inglés, español y chino: escenarios donde el tráfico incluye prompts en estos tres idiomas y se necesita cobertura de seguridad sin degradar la calidad conversacional (Δ MT-Bench positivo).
- Red teaming interno: emplear el modelo endurecido como objetivo en ejercicios de ataque para validar que las herramientas de red teaming detectan la defensa y para estudiar ataques adaptativos que la evadan.
- Base para investigación de representaciones: el enfoque de repulsión CKA contra un ancla congelada es reutilizable para estudiar cómo se organiza la dirección de rechazo en el espacio latente de modelos de 7B.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Cross-model GCG transfer ASR (self / anchor / other) | 0 % / 1 % / 2 % |
| Benign Garble Rate (OR-Bench) | 0 % |
| Δ XSTest refusal | -0,4 |
| Δ OR-Bench refusal | +4,4 |
| Δ MT-Bench | +0,07 |

ASR reportado tras verificación manual según el protocolo del paper. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otras defensas.

## Requisitos de hardware

- El adaptador LoRA pesa 0,3 GB y se carga junto al base de 7,24B; la VRAM viene determinada por el base.
- Inferencia en fp16/bf16: aproximadamente 14-15 GB de VRAM para pesos, más overhead de KV cache; encaja en una RTX 4090 (24 GB) con contexto moderado.
- Cuantización a 8 bits: ~8 GB; a 4 bits: ~4-5 GB, lo que permite ejecución en GPUs consumer de 8-12 GB (RTX 3060/4060, etc.).
- El adaptador se entrena y reporta en fp32, pero para despliegue puede fusionarse y cuantizarse; la información disponible no documenta impacto de la cuantización sobre la robustez adversarial.
- GPUs recomendadas para producción: A100 40/80 GB, H100, L40S para servicio concurrente; RTX 4090 o A6000 para desarrollo y evaluación.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), fusión con `merge_and_unload()` y posterior exportación a vLLM, TGI, llama.cpp u Ollama. No se documentan en la información disponible recetas específicas ni throughput/latencia medidos para estas rutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnchorRep-Mistral-7B-Instruct-v0.2 | 7,24B base + delta LoRA | heredado del base | Defensa por repulsion de representaciones contra ancla Qwen1.5-7B-Chat | Apache-2.0 | HuggingFace (11 descargas) |
| Mistral-7B-Instruct-v0.2 (base sin adaptador) | 7,24B | 32k tokens | Modelo instructivo general | Apache-2.0 | HuggingFace |
| Qwen1.5-7B-Chat (ancla del paper) | 7B | no disponible en la informacion | Modelo chat general, usado como surrogate congelado | Apache-2.0 | HuggingFace |
| Defensas por system prompt / filtros externos | no aplica | no aplica | Mitigacion a nivel de prompt o de salida | variable | variable |

La comparación numérica de robustez con otras defensas no está disponible en la información proporcionada; el paper referencia ablaciones internas pero no se han incluido sus cifras.

## Limitaciones y advertencias

- No bloquea ataques adaptativos en el espacio de embeddings del mismo modelo (por ejemplo, Embedding PGD).
- Diseño de ancla única: un adversario que optimice conjuntamente contra varios surrogates podría eludir parcialmente la defensa.
- Robustez multilingüe verificada solo en inglés, español y chino; otros idiomas quedan sin testear.
- No apto para producción sin validación de seguridad independiente, según indica el propio autor en la model card.
- No se documentan sesgos específicos del adaptador; los del modelo base persisten sin cuantificar en la información disponible.
- Riesgo de alucinación heredado del base; el delta no está diseñado para reducirlo.
- El aumento de rechazo en OR-Bench (+4,4) puede traducirse en mayor tasa de falsos rechazos en dominios legítimos; requiere calibración por caso de uso.
- Solo 11 descargas y 0 likes en el momento de la ficha: ecosistema de validación externa muy limitado.
- El adaptador está pensado para usarse con Mistral-7B-Instruct-v0.2; aplicarlo sobre otros checkpoints no está soportado ni evaluado.

## Enlaces

- HuggingFace: https://huggingface.co/galwert/AnchorRep-Mistral-7B-Instruct-v0.2
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Modelo ancla: https://huggingface.co/Qwen/Qwen1.5-7B-Chat
- Repositorio GitHub del paper (entrenamiento, evaluacion, audit logs, sufijos GCG): https://github.com/galwert/AnchorRep
- Paper: AnchorRep: Defending LLMs Against Cross-Model Adversarial Transfer via Representation Repulsion (Wertheizer, Himelstein, Peretz, Mendelson), NeurIPS 2026
