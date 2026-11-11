# QijiaHe/dtdd-rebuttal-alfworld-clip-20261110

## Resumen

`QijiaHe/dtdd-rebuttal-alfworld-clip-20261110` no es un modelo entrenado con fines de publicacion, sino un repositorio de artefactos de investigacion asociado a un proceso de rebuttal. Contiene adaptadores LoRA, un modelo fusionado (merged) derivado de Qwen2.5-3B-Instruct, predicciones de evaluacion y utilidades para reproducir experimentos sobre ALFWorld y tareas de matematicas. El autor es QijiaHe y el repositorio se publico el 11 de noviembre de 2026.

El contenido esta orientado a replicar los resultados de un articulo sobre tecnicas de entrenamiento y evaluacion (OPD y DTDD) sobre agentes y razonamiento matematico. Los experimentos descritos se ejecutan sobre 8 GPU A100 y utilizan como base el modelo Qwen2.5-3B-Instruct, con adaptadores LoRA especificos para ALFWorld y un modelo fusionado para evaluacion de matematicas (AIME24, AIME25, AMC23).

Por su naturaleza, este repositorio no debe tratarse como un modelo listo para produccion: es un paquete de reproducibilidad con pesos, checksums y manifiestos de evaluacion. Su relevancia es para investigadores que quieran auditar o replicar los resultados del trabajo DTDD, no para despliegues generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los adaptadores se aplican sobre Qwen2.5-3B-Instruct, transformer decoder-only) |
| Parametros totales | no disponible (modelo base Qwen2.5-3B-Instruct: 3B aproximados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; la evaluacion ALFWorld usa 10.240 tokens de prompt y 512 de respuesta por turno |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA, modelo fusionado y tokenizer) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrupa adaptadores LoRA y un modelo fusionado construidos sobre Qwen2.5-3B-Instruct (revision `aa8e72537993ba99e69dfaafa59ed015b17504d1`). Los adaptadores corresponden a dos variantes de entrenamiento, OPD y DTDD, en pasos 140 y 280, y se fusionan sobre la base con `merge_lora.py` del repositorio DTDD.

El entrenamiento descrito en la model card se refiere a los trabajos de rebuttal: ALFWorld OPD (semilla de rollout 43, hasta 280 pasos, checkpoints cada 20), ALFWorld DTDD (hasta 140 pasos) y evaluacion de matematicas con el modelo fusionado clip step-120 (semilla 1). Se mencionan tiempos historicos de aproximadamente 24 h para OPD y 15 h para DTDD en 4xL40S, y unas 5 h en 2xL40S para las dos particiones de matematicas faltantes en el paso 80. No se detalla la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base Qwen2.5-3B-Instruct.
- Ejecucion de tareas de agente en ALFWorld (manipulacion de entornos textuales con acciones parseadas).
- Razonamiento matematico evaluado en AIME24, AIME25 y AMC23 con generacion de 16 respuestas por problema (temperatura 0,7, top-p 0,95).
- Soporte de evaluacion con vLLM 0.11 y modo sin thinking (`--disable-thinking`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no documentados en la ficha.

## Casos de uso

- Replicacion de experimentos ALFWorld: fusionar los adaptadores `opd_s140`, `dtdd_s140` y `opd_s280` sobre la base y ejecutar la evaluacion student-only con 140 partidas vistas y 134 no vistas, temperatura 0,4 y 30 turnos.
- Auditoria de resultados de rebuttal: los manifiestos, checksums y predicciones DASH permiten verificar la puntuacion de referencia (111/140 seen, 104/134 unseen, 78,45% macro).
- Evaluacion de matematicas con vLLM: generar AIME25 y AMC23 a partir del modelo fusionado clip step-120 y calificar las tres particiones con el grader original.
- Estudio de tecnicas de destilacion o entrenamiento por pasos: los checkpoints cada 20 pasos permiten analizar la curva de aprendizaje de OPD y DTDD.
- Desarrollo de pipelines de evaluacion de agentes: el repositorio incluye utilidades de intervalos pareados y manifiestos que sirven como plantilla para evaluaciones reproducibles.
- Formacion e investigacion: material de referencia para entender como se estructura un paquete de rebuttal con pesos, checksums y scripts de evaluacion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| DASH ALFWorld, partidas vistas | 111/140 |
| DASH ALFWorld, partidas no vistas | 104/134 |
| DASH ALFWorld, macro | 78,45% |
| AIME24, AIME25, AMC23 (modelo clip step-120) | no disponible en la informacion proporcionada |

No se han publicado resultados de benchmarks completos del modelo en la informacion disponible; los datos anteriores corresponden a la evaluacion DASH de referencia citada en la model card.

## Requisitos de hardware

- Inferencia del modelo base de 3B en safetensors: se recomienda al menos 8-12 GB de VRAM en fp16, aunque no se especifica en la ficha.
- Los experimentos de la model card se planificaron para 8 GPU A100, con reparto de 4 GPU para entrenamiento OPD, 2 para evaluacion ALFWorld y 2 para matematicas.
- Entrenamiento historico: 4xL40S para OPD y DTDD; 2xL40S para las particiones de matematicas.
- Despliegue: vLLM 0.11 para la lane de matematicas; el resto de scripts usan torch, transformers y PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QijiaHe/dtdd-rebuttal-alfworld-clip-20261110 | 3B (base Qwen2.5-3B-Instruct) | no disponible | no disponible | Hugging Face, descarga anonima |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en la ficha | no disponible en la ficha | Hugging Face |
| Adaptadores LoRA OPD/DTDD | sobre 3B | no disponible | no disponible | Incluidos en el mismo repo |

No se dispone de datos de rendimiento comparables entre estos artefactos y otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: es un paquete de artefactos de investigacion para un rebuttal concreto.
- La licencia no esta especificada, lo que impide determinar si se permite uso comercial.
- Los adaptadores dependen de una revision concreta de Qwen2.5-3B-Instruct; usar otra base puede invalidar los resultados.
- La evaluacion ALFWorld exige reutilizar exactamente los mismos IDs de partida, orden de tareas, RNG, prompt y parser de acciones; desviarse rompe el emparejamiento.
- El template publico de evaluacion selecciona partidas aleatoriamente, por lo que invocarlo sin cambios rompe la comparacion pareada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- El repositorio ocupa 4,8 GB y requiere almacenamiento durable y verificacion de checksums antes de su uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/QijiaHe/dtdd-rebuttal-alfworld-clip-20261110
- Repositorio DTDD en GitHub: https://github.com/Qijia-He/dtdd
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Revision del bundle: `054c1aa4c7c910172196693d82be53731d84f8e7`
- Revision DTDD: `f8405105db3a9c0f4e68ddae896a2bf8525a8969`
- Revision DASH: `6324afa00b7908bdbccd2240a8dd5b1c86ca52da`
