# RLobot-jun/gr00t-n17-bigenlight-50per-task-svf-iql-e09-k04-g025-step10000

# Ficha: Gr00t-n17-bigenlight-50per-task-svf-iql-e09-k04-g025-step10000

## Resumen

Este repositorio no contiene un modelo autonomo, sino un paquete de inferencia compuesto por adaptadores LoRA y cabezas de critico entrenadas sobre un actor de flujo para control robotico. Lo publica el usuario RLobot-jun como paso 10000 de un ajuste por aprendizaje por refuerzo (IQL) sobre un modelo base de comportamiento clonado (BC), `RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000`, fijado en la revision `1704897ac6a2a93c1d1fd806925b9237977ed8c5`. El nombre del repositorio sugiere una linea derivada de la familia Gr00t (N1.7), aunque este extremo no se confirma en la informacion disponible.

El problema que resuelve es el ajuste fino de una politica robotica mediante RL off-policy (IQL con expectil 0.9) sobre una base de BC, incorporando un critico Q congelado y dos cabezas internas de valor suave. El repositorio ocupa 0,1 GB y solo incluye el adaptador del actor, los criticos Q online congelados y los criticos internos entrenados; no incluye los pesos del VLM, del actor BC original, del optimizador ni de las redes de referencia y objetivo.

Su relevancia es acotada y experimental: se trata de un artefacto de investigacion reproducible para pipelines de RL robotico, no de un modelo listo para produccion. No hay descargas ni likes registrados, la licencia no esta declarada y el propio autor advierte que no se ha probado la paridad de inferencia robotica en esta exportacion. Requiere cargar primero el modelo base y aplicar el LoRA sobre el `ProjectedFlowActor` de BC correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un actor de generacion de acciones por flujo (`ProjectedFlowActor`) de la familia Gr00t n1.7; incluye critico Q escalar doble congelado y dos cabezas internas de valor suave |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB y contiene solo adaptadores, criticos y estadisticas; no incluye los pesos completos del modelo base) |
| Longitud de contexto | no disponible (horizonte de accion de 16 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter/actor_lora.safetensors`, `adapter/env_q.safetensors`, `adapter/inner_critic.safetensors`) y `adapter/adapter_config.json` |

## Arquitectura y entrenamiento

El componente central es un `ProjectedFlowActor` heredado de la base de behavior cloning, al que se le aplica un adaptador LoRA de rango 16 y alpha 32. La politica genera acciones mediante flujo (flow matching) con 4 pasos de integracion y 8 candidatos muestreados por paso de decision, con un horizonte de accion de 16. Sobre el actor se anaden dos cabezas internas de valor suave (soft-value) entrenadas de forma online, y se incorpora un critico de entorno congelado descrito como Q IQL escalar doble "sin encoder".

El entrenamiento combina el ajuste del actor y del critico interno con IQL (Implicit Q-Learning) de expectil 0.9 y descuento gamma 0.99 sobre recompensa de coste por paso y 50 episodios por tarea. El critico de entorno se entreno durante 30.000 actualizaciones IQL, mientras que el actor y el critico interno acumulan 10.000 actualizaciones con lote de 32, kappa 0.4 y g 0.25 (c 0.64). Los pesos del VLM, del actor BC, del optimizador y de las redes de referencia y objetivo no se incluyen en el export, por lo que el paquete no es un checkpoint reanudable de entrenamiento ni un directorio BC nativo. El autor indica que los pesos congelados del actor se verificaron contra el BC local tras la conversion de tipo, pero que la paridad de inferencia robotica no se probo.

## Capacidades

- Generacion de acciones roboticas: produce secuencias de accion con horizonte de 16 pasos, orientadas a control de manipulacion.
- Ajuste por RL off-policy: implementa IQL con expectil 0.9 sobre una politica base de BC, con critico Q doble y cabezas de valor suave internas.
- Muestreo por flujo con multiples candidatos: 4 pasos de integracion y 8 candidatos por decision.
- Encapsulado tipo adaptador: se aplica como LoRA sobre el `ProjectedFlowActor` de la base BC, sin sustituir los pesos base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo de pensamiento): no disponible; no se documentan en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de RL robotico: el paquete permite aplicar el adaptador sobre la base BC fijada en una revision concreta y repetir el ajuste IQL descrito, util para validar resultados de investigacion.
- Comparacion de metodos de ajuste fino: sirve como referencia del metodo "SVF + IQL" frente a variantes puras de BC o de RL, gracias a la separacion explicita entre actor LoRA, critico de entorno e critico interno.
- Desarrollo de politicas de manipulacion en laboratorio: el actor genera acciones con horizonte 16 para tareas de manipulacion donde se dispone del entorno simulado o real y de la base BC.
- Investigacion en criticos de valor suave: las dos cabezas internas y el critico Q congelado permiten estudiar el efecto del expectil y de la recompensa de coste por paso en el aprendizaje.
- Base para ablaciones de hiperparametros: los valores kappa, g y c quedan fijados en el nombre del checkpoint, lo que facilita barridos sistematicos sobre el mismo pipeline.
- Integracion en pipelines de evaluacion robotica fuera de linea: al ser un adaptador ligero (0,1 GB), se puede versionar y sustituir rapidamente entre experimentos sin duplicar los pesos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el adaptador en si ocupa aproximadamente 0,1 GB, pero el consumo real depende de los pesos del modelo base, que no se incluyen ni se especifican.
- GPU recomendadas: no disponible (no se documenta el hardware objetivo para la base Gr00t n1.7).
- Cabe en GPU de consumo: no disponible; no puede evaluarse sin conocer el tamano de la base VLM y del actor BC.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el unico procedimiento indicado es cargar la base BC en la revision fijada y aplicar el LoRA sobre el `ProjectedFlowActor`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos propios confirmados (parametros, contexto, licencia) para este repositorio, por lo que la comparacion se limita a la categoria. Las cifras de terceros proceden de informacion publica de cada proyecto y pueden variar segun version.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gr00t-n17-bigenlight-50per-task-svf-iql-e09-k04-g025-step10000 | no disponible (solo adaptadores, 0,1 GB) | no disponible | no disponible | Adaptador dependiente del modelo base |
| Gr00t N1 / N1.5 (NVIDIA) | ~2 B (segun informacion publica del proyecto) | no disponible | no disponible | Pesos abiertos en HuggingFace |
| OpenVLA | ~7 B (segun informacion publica del proyecto) | no disponible | Licencia derivada de Llama 2 | Pesos abiertos |
| pi0 (Physical Intelligence) | ~3 B (segun informacion publica del proyecto) | no disponible | no disponible | Pesos publicados por el proyecto |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar primero la base `RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000` en la revision indicada; no funciona por si solo.
- No es un checkpoint de reanudacion de entrenamiento: no incluye pesos del VLM, del actor BC, del optimizador ni de las redes de referencia y objetivo.
- El adaptador debe aplicarse sobre el `ProjectedFlowActor` de BC correspondiente, no sobre un actor ya ajustado con SVF.
- El autor advierte que no se ha probado la paridad de inferencia robotica en esta exportacion; la verificacion se limito a los pesos congelados del actor tras la conversion de tipo.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible en el sentido de modelos de lenguaje; al ser una politica de accion, el riesgo equivalente seria la generacion de acciones no validas en el entorno, no cuantificado en la informacion.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia para uso comercial: no disponible; la licencia no esta declarada, por lo que no puede asumirse uso comercial.
- Caveat para produccion: ausencia de licencia, de benchmarks, de pruebas de paridad y de procedimiento de despliegue documentado hacen desaconsejable su uso en entornos productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-svf-iql-e09-k04-g025-step10000
- Modelo base: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000
- No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en la busqueda web realizada.
