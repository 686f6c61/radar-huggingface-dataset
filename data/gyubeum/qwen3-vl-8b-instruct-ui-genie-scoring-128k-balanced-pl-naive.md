# Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced-pl-naive

## Resumen

Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced-pl-naive es un modelo de recompensa escalar (reward model) para pasos de agentes GUI moviles, publicado por el usuario Gyubeum sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct. No es un modelo conversacional de proposito general: su funcion es puntuar una accion candidata de un agente Android dentro de un contexto que incluye el historial de ejecucion y capturas de pantalla, devolviendo un unico escalar donde un valor mayor indica una accion preferible.

Tecnicamente es el resultado de un ajuste fino Plackett-Luce sobre una etapa previa Bradley-Terry entrenada con UI-Genie, usando etiquetas de Latent Peer Voting (LPV) construidas con el esquema `all_naive`. El checkpoint publicado corresponde a la epoca 4 de 8 de un LoRA de rango 64 aplicado sobre todas las capas lineales, ya fusionado con los pesos base, mas una cabeza `score` escalar conservada en `modules_to_save`. El modelo declara 8.767.127.792 parametros y un repositorio de 17,5 GB en safetensors.

Su relevancia es acotada y muy especifica: se enmarca en la investigacion sobre modelos de recompensa para agentes GUI (UI-Genie, AndroidFlux), un area donde los modelos de vision-lenguaje se usan como verificadores o puntuadores de trayectorias. La propia model card advierte de que las mejoras reportadas en AndroidFlux no son estadisticamente significativas y de que el ajuste empeora notablemente el rendimiento sobre el conjunto UI-Genie de 1000 pares, por lo que debe considerarse un artefacto de investigacion mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision-lenguaje (Qwen3-VL) con LoRA fusionado y cabeza `score` escalar |
| Parametros totales | 8.767.127.792 (8,77 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | El nombre indica 128k; el entrenamiento y la evaluacion se realizaron a 16.384 tokens sin truncamiento |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors en su precision original |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria transformers) |
| Autor | Gyubeum |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Tarea declarada | image-text-to-text, reward-model, gui-agent |
| Contrato de entrada | `ui-genie-rm-paired-v1` (turno de sistema con especificacion de herramienta `mobile_use`, historial con capturas y accion candidata en `<tool_call>`) |
| Etapa | Epoca 4 de 8, LoRA rank 64 fusionado |
| Tamano del repositorio | 17,5 GB |

## Arquitectura y entrenamiento

La base es Qwen3-VL-8B-Instruct, un transformer multimodal que procesa texto e imagenes. Sobre el se construyo una etapa Bradley-Terry (`qwen3vl_8b_128k_balanced_bt`) entrenada con UI-Genie, que actua como modelo de recompensa de referencia. El modelo publicado parte de esa etapa y aplica un ajuste fino con objetivo Plackett-Luce sobre etiquetas de Latent Peer Voting generadas mediante la construccion `all_naive`, con pesos de experto fijados en `average`. El adaptador LoRA tiene rango 64 sobre todas las capas lineales y la cabeza escalar `score` se mantiene en `modules_to_save`; en el repositorio ambos aparecen ya fusionados en los pesos finales.

La innovacion metodologica es el esquema de etiquetado LPV y la formulacion Plackett-Luce para ordenar multiples acciones candidatas por paso, en lugar del clasico Bradley-Terry por pares. El contrato de entrada es estricto: un turno de sistema con la especificacion de la herramienta `mobile_use` que declara el tamano logico de pantalla, el historial de ejecucion con las capturas recientes intercaladas y la accion candidata cerrada como `<tool_call>`. La puntuacion se obtiene como `score_head(last_token_hidden_state)`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO adicionales. La model card senala un detalle relevante: la cabeza `score` apenas se movio durante el ajuste fino (cambio absoluto maximo de 0,001 y similitud coseno de 0,9998 frente a la cabeza base), de modo que el cambio de comportamiento procede del LoRA fusionado y no de la cabeza.

## Capacidades

- Puntuacion escalar de acciones candidatas de agentes GUI moviles: dado un historial con capturas y una accion propuesta, devuelve un unico valor donde mayor es mejor.
- Comprension de capturas de pantalla de Android junto con el historial de interacciones previas, gracias al encoder visual de Qwen3-VL.
- Interpretacion del contrato `ui-genie-rm-paired-v1`, que incluye la especificacion de herramienta `mobile_use` y la accion candidata en formato `<tool_call>`.
- Manejo de coordenadas en el espacio de pixeles de la pantalla logica declarada por el prompt del sistema.
- Uso como verificador o reranker dentro de un bucle de agente, comparando varias acciones propuestas para un mismo paso.
- Soporte de contexto largo en el contrato de entrada (hasta 16.384 tokens en entrenamiento y evaluacion, sin truncamiento).
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- No es un modelo generativo de acciones ni un agente autonomo: no produce planes, texto libre ni llamadas a herramientas por si mismo.

## Casos de uso

- Reranking de acciones en un agente Android: dado un conjunto de acciones candidatas generadas por un modelo politico, este modelo las puntua y se selecciona la de mayor score, reduciendo ejecuciones erroneas en tareas de navegacion de aplicaciones.
- Verificacion de pasos en pipelines de agentes GUI: integrado como filtro previo a la ejecucion real, descarta acciones que el puntuador considera inferiores antes de enviarlas al dispositivo o emulador.
- Investigacion en modelos de recompensa para GUI: sirve como punto de comparacion frente a variantes Bradley-Terry o frente a otras construcciones de etiquetas LPV, dentro del mismo contrato de entrada.
- Generacion de datos de preferencia: usar los scores para ordenar trayectorias y construir pares o rankings que alimenten posteriores etapas de RLHF o DPO sobre el modelo politico.
- Depuracion de agentes en desarrollo: al puntuar cada paso de una trayectoria fallida, permite localizar en que punto la accion elegida obtuvo un score bajo y aislar el fallo.
- Evaluacion offline de politicas: comparar dos versiones de un agente movil puntuando las mismas acciones candidatas sobre un conjunto fijo de episodios, sin necesidad de ejecutar en dispositivo.
- Analisis de sesgos de terminacion: al ser un puntuador escalar, permite medir la preferencia del modelo por la accion `terminate` y cuantificar su impacto en la seleccion de acciones.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los de la model card. La evaluacion se realizo sobre AndroidFlux (76 pares fijos con capturas de historial adjuntas) y sobre el conjunto UI-Genie de 1000 pares. La variante `clean 52` excluye 7 pares cuyos dos candidatos quedan a menos de 25 px entre si y 17 cuya accion fuente queda fuera de la especificacion de herramienta fijada; `error_path` lleva etiquetas a nivel de paso y `clean_path` credito a nivel de episodio proyectado sobre un paso.

| Metrica | Base | Este modelo | Delta |
|---|---:|---:|---:|
| recovery, all 76 | 34 | 44 | +10 |
| recovery, clean 52 | 28 | 31 | +3 |
| - error_path 27 | 16 | 14 | -2 |
| - clean_path 25 | 12 | 17 | +5 |
| UI-Genie 1000 | 909 | 811 | -98 |

Segun la propia model card, ninguna de las diferencias de recovery es estadisticamente significativa: el subconjunto `clean 52` tiene un error estandar de unos 3,6 pares y 24 de sus 52 pares se deciden por una preferencia casi constante por `terminate`. El cambio en UI-Genie si es significativo (n=1000, error estandar de unos 9 pares) y supone una perdida de 98 puntos, atribuida por el autor a que el ajuste LPV sobre AndroidFlux degrada la precision en UI-Genie, mas aun con la construccion `naive` que con cualquier otro ajuste probado.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros declarado (8.767 millones) y no proceden de la informacion publicada.

- Inferencia en bf16/fp16: aproximadamente 17,5 GB solo de pesos, mas memoria para activaciones y el encoder visual; en la practica se recomienda disponer de 24 GB o mas.
- Inferencia en 8 bits: del orden de 9-10 GB de pesos, mas overhead; factible en GPUs de 16 GB.
- Inferencia en 4 bits: del orden de 5-6 GB de pesos; factible en GPUs de 8-12 GB, siempre que se genere una cuantizacion propia, ya que el repositorio no publica ninguna.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para ejecucion holgada en precision completa; RTX 4090 (24 GB) es suficiente para bf16 con lotes pequenos.
- GPU de consumo: si cabe en RTX 4090 y en GPUs de 16 GB si se cuantiza a 8 bits. En 4 bits podria caber en GPUs de 8-12 GB, aunque el modelo no distribuye pesos cuantizados.
- Opciones de despliegue: al tratarse de un modelo con cabeza `score` personalizada, los servidores genericos (vLLM, TGI, Ollama, llama.cpp) no soportan su uso directo sin adaptar el cabezal; el camino previsto es `transformers` en Python. No se documentan cuantizaciones GGUF ni ONNX.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 8,77 mil millones | 16.384 tokens en entrenamiento y evaluacion; el nombre indica 128k | Reward model escalar para pasos de agente GUI | No disponible | HuggingFace, safetensors, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct | Mismo orden (modelo base) | No disponible en la informacion proporcionada | Vision-lenguaje generativo | No disponible en la informacion proporcionada | HuggingFace |
| `qwen3vl_8b_128k_balanced_bt` (etapa Bradley-Terry previa) | Mismo orden | No disponible | Reward model BT sobre UI-Genie | No disponible | Referenciado en la model card, sin enlace directo |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa mas alla de la tabla de evaluacion del propio modelo frente a su base.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre condiciones de uso comercial, lo que impide su adopcion en produccion sin aclaracion previa del autor.
- Las mejoras en AndroidFlux no son estadisticamente significativas: el error estandar del subconjunto `clean 52` es de unos 3,6 pares para un delta de +3.
- Degradacion significativa en UI-Genie: 98 puntos de perdida sobre 1000 pares, un cambio que si es estadisticamente significativo.
- Sesgo de terminacion: 24 de los 52 pares del subconjunto `clean` se deciden por una preferencia casi constante por la accion `terminate`, lo que puede hacer que el puntuador favorezca terminar la tarea prematuramente.
- Dependencia estricta del contrato de entrada: fuera del formato `ui-genie-rm-paired-v1` y del espacio de pixeles de la pantalla logica declarada, los scores no son interpretables.
- La cabeza `score` practicamente no cambio durante el ajuste (cambio absoluto maximo de 0,001), por lo que cualquier ganancia depende exclusivamente del LoRA fusionado; esto complica la reutilizacion de la cabeza con otros adaptadores.
- Cobertura limitada a ingles y a GUI de Android; no hay evidencia de generalizacion a otras plataformas o idiomas.
- Ausencia de cuantizaciones publicadas: el uso eficiente en memoria exige generar y validar conversiones propias.
- Adopcion nula registrada: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de terceros.
- Riesgo de alucinacion: aunque el modelo es un puntuador y no un generador de texto libre, puede asignar puntuaciones erroneas o inseguras ante pantallas o acciones fuera de distribucion.
- Artefacto de investigacion: la propia model card recomienda leer los resultados con cautela y no presenta ninguna diferencia de recovery como concluyente.

## Enlaces

- HuggingFace: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced-pl-naive
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper, repositorio o demo adicionales: no disponible; los resultados de la busqueda web no contienen enlaces relevantes para este modelo.
