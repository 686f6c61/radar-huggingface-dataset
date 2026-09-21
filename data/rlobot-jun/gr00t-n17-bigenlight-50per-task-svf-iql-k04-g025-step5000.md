# RLobot-jun/gr00t-n17-bigenlight-50per-task-svf-iql-k04-g025-step5000

## Resumen

gr00t-n17-bigenlight-50per-task-svf-iql-k04-g025-step5000 es un adaptador de aprendizaje por refuerzo publicado por RLobot-jun en HuggingFace. No es un modelo completo ni un checkpoint de inferencia autonomo: es un export ligero que contiene unicamente pesos de adaptadores (LoRA del actor, criticos internos y una Q congelada del entorno) que deben aplicarse sobre el checkpoint base de clonacion de conducta (BC) RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000, fijado en la revision 1704897ac6a2a93c1d1fd806925b9237977ed8c5.

El modelo se enmarca en el entrenamiento de politicas para robotica y combina aprendizaje por imitacion (BC) con ajuste posterior mediante IQL (Implicit Q-Learning) y un esquema SVF. La model card detalla hiperparametros concretos de RL (expectile 0.7, 50 episodios por tarea, 30.000 pasos de entrenamiento de la Q) y del ajuste fino del actor (LoRA de rango 16 y alfa 32, dos cabezas soft-value internas, 5.000 pasos, horizonte de accion de 16 pasos). El nombre sugiere una relacion con la familia GR00T N1.7, pero la model card no confirma esa vinculacion ni describe el backbone.

Su relevancia practica fuera del contexto experimental es escasa: no incluye pesos del VLM ni del actor base, no declara licencia, acumula cero descargas y cero likes, no publica benchmarks y el propio autor advierte de que la paridad de inferencia robotica completa no se ha probado para este export.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre ProjectedFlowActor habilitado para LoRA (rango 16, alfa 32) con dos cabezas soft-value internas; detalle en `adapter/adapter_config.json` |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB y contiene solo adaptadores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 16 pasos) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter/actor_lora.safetensors`, `adapter/env_q.safetensors`, `adapter/inner_critic.safetensors`) |

## Arquitectura y entrenamiento

El export parte de un checkpoint de clonacion de conducta (BC) denominado gr00t-n17-bigenlight-50per-task-step10000, entrenado sobre 50 episodios por tarea, y le anade un ajuste por refuerzo offline. La Q del entorno es un "no-encoder scalar twin IQL" (dos criticos Q1/Q2 escalares sin encoder), con expectile 0.7, congelada durante el ajuste del actor y entrenada durante 30.000 pasos. Sobre esa Q se aplica un esquema SVF con kappa=0.4, g=0.25 (c=0.64), batch de 32, 4 pasos de flow y 8 candidatos.

El ajuste del actor se realiza con adaptadores LoRA de rango 16 y alfa 32, junto con dos cabezas soft-value internas, durante 5.000 pasos. La presencia de "flow steps" y "candidates" indica un actor basado en flow matching con seleccion de candidatos; el nombre ProjectedFlowActor apunta en la misma direccion. El autor advierte que los adaptadores no deben aplicarse sobre un actor ya ajustado con SVF y que la revision del BC debe coincidir exactamente. No se incluyen optimizador, redes de referencia, redes objetivo ni pesos del VLM.

## Capacidades

- Generacion de acciones motoras para politicas de robotica: el adaptador modifica el comportamiento de un actor BC para incorporar senal de valor aprendida por RL offline.
- Refinamiento por refuerzo offline mediante IQL con Q escalar twin (Q1/Q2) y expectile 0.7.
- Seleccion de acciones basada en flow matching con 4 pasos de flow y 8 candidatos por decision.
- Horizonte de prediccion de accion de 16 pasos.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingues declaradas.
- No incluye capacidades de vision utilizables de forma autonoma (los pesos del VLM no se distribuyen en este export).
- No incluye modo "thinking" ni proceso de razonamiento explicito.

## Casos de uso

- Investigacion en RL offline para robotica: permite comparar el rendimiento de una politica BC frente a la misma politica refinada con IQL y SVF, reutilizando el mismo checkpoint base y aislando el efecto del adaptador.
- Reproduccion de experimentos de ajuste fino: el repositorio publica hiperparametros exactos (kappa, g, expectile, batch, pasos de flow) para replicar el entrenamiento sobre la revision fijada del BC.
- Aprendizaje con pocos episodios por tarea: el esquema usa 50 episodios por tarea, util en escenarios donde recolectar demostraciones robotica es caro.
- Punto de partida para fine-tuning posterior: el adaptador LoRA puede servir como inicializacion para nuevos ajustes sobre tareas relacionadas, siempre partiendo del BC correcto.
- Evaluacion de tecnicas SVF en pipelines de robotica: los parametros kappa=0.4 y g=0.25 (c=0.64) permiten estudiar el efecto del filtrado de valor sobre politicas de flujo.
- Docencia y prototipado en cursos de RL aplicado: sirve como ejemplo de export ligero de adaptadores frente a checkpoints completos.
- Integracion en simulacion de manipulacion robotica: al requerir solo adaptadores de 0,1 GB, facilita ciclos rapidos de carga y descarte en entornos de simulacion, aunque depende del BC y su processor.

En todos los casos, el modelo no es autonomo: requiere cargar el BC fijado y su processor, y aplicar los adaptadores sobre un ProjectedFlowActor habilitado para LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en tarea, tasas de exito en simulacion, recompensa media ni comparaciones numericas con la politica BC base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, pero ese tamano corresponde solo a los adaptadores y no permite estimar la memoria total necesaria, ya que depende del BC, del processor y del backbone no incluido.
- GPU recomendadas: no disponible. Al no declararse el tamano del backbone, no es posible concretar modelos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible por la misma razon; no puede confirmarse si cabe en una GPU de consumo.
- Opciones de despliegue: no disponibles a traves de herramientas estandar como vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo de lenguaje. La carga requiere el codigo del ProjectedFlowActor con soporte LoRA y el `adapter_config.json`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (adaptadores de RL offline sobre politicas de robotica) en la informacion proporcionada. La unica referencia directa disponible es el modelo base del que deriva:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000 | Checkpoint BC base | no disponible | no disponible | no disponible | Publico en HuggingFace |
| gr00t-n17-bigenlight-50per-task-svf-iql-k04-g025-step5000 | Adaptador IQL/SVF sobre el anterior | no disponible | no disponible | no disponible | Publico en HuggingFace (0 descargas) |

No se dispone de alternativas comparables de terceros en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: no incluye los pesos del actor BC base ni del VLM, por lo que no puede ejecutarse por si solo.
- Los adaptadores no deben aplicarse sobre un actor ya ajustado con SVF; hacerlo produce un resultado incorrecto.
- El autor advierte de que la paridad completa de inferencia robotica no se ha probado para este export; solo se verificaron los tensores congelados del actor frente al BC local tras la conversion de dtype.
- No se incluyen optimizador, redes de referencia, redes objetivo ni pesos del VLM, por lo que tampoco sirve como bundle de reanudacion de entrenamiento.
- Licencia no declarada: no puede asumirse uso comercial ni redistribucion sin consultar al autor.
- Sesgos conocidos: no disponibles. El entrenamiento con solo 50 episodios por tarea es propenso a sobreajuste y a baja cobertura de estados.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje natural, pero si existe riesgo de generalizacion erronea de la politica en estados fuera de la distribucion de los 50 episodios.
- Limitaciones de contexto e idioma: no aplica el concepto de idioma; el contexto es un horizonte de accion de 16 pasos.
- Caveat de produccion: cero descargas, cero likes y ausencia de benchmarks hacen desaconsejable su uso en produccion sin validacion propia.
- La fecha de creacion registrada (2026-09-21) y el nombre del modelo no aclaran su procedencia tecnica ni la relacion exacta con la familia GR00T N1.7.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-svf-iql-k04-g025-step5000
- Modelo base (BC): https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000
- Configuracion del adaptador: `adapter/adapter_config.json` (dentro del repositorio)
- Documentacion del adaptador: `adapter/README.md` (dentro del repositorio)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas no relacionadas sobre paises de la Union Europea.
