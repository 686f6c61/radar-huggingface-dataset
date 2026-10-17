# adityamohan2604/g1-smolvla-attempt1-wrist

## Resumen

g1-smolvla-attempt1-wrist es un modelo de vision-lenguaje-accion (VLA) para robotica, publicado por el usuario adityamohan2604 en HuggingFace bajo la libreria LeRobot. Se trata de un ajuste fino (fine-tuning) de SmolVLA, el modelo fundacional ligero de robotica de HuggingFace, adaptado a una tarea concreta de manipulacion: coger un bloque azul y colocarlo sobre una estrella azul con el humanoide Unitree G1 equipado con la mano Dex3-1, todo simulado en MuJoCo.

El modelo parte de los 450 millones de parametros del SmolVLA original y ha sido entrenado en dos fases: primero con demostraciones retargetizadas a partir del movimiento de la mano del propio autor y despues con un ajuste por aprendizaje por refuerzo (RL) ponderado por ventaja (advantage-weighted) sobre sus propias trayectorias. El autor reporta un exito del 52 % sobre 60 poses de bloque no vistas durante el entrenamiento.

Su relevancia radica en que demuestra un flujo completo y reproducible de adaptacion de un VLA ligero a un caso de manipulacion bimanual con camaras de cabeza y muneca, sin necesidad de un modelo de miles de millones de parametros. Al estar construido sobre SmolVLA, hereda su diseno eficiente y su integracion con el ecosistema LeRobot para entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (backbone de vision-lenguaje mas experto de acciones condicionado por caracteristicas contextuales); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (aproximadamente 450 M, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo se distribuye en safetensors |
| Idiomas soportados | no disponible (la instruccion de la tarea se expresa en lenguaje natural, pero no se detallan idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repositorio | 0,9 GB |
| Tarea | Pick up the blue block and put it on the blue star (Unitree G1 + Dex3-1 en MuJoCo) |
| Camaras de entrada | cabeza y muneca (head + wrist) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de SmolVLA, un VLA ligero de 450 M de parametros disenado para robotica. Segun la documentacion de LeRobot, SmolVLA recibe como entrada varias vistas de camara, el estado sensoriomotor actual del robot y una instruccion en lenguaje natural, que se codifican en caracteristicas contextuales utilizadas para condicionar el experto de acciones en la generacion de movimientos. Esta variante concreta emplea dos camaras (cabeza y muneca) y actua sobre el humanoide Unitree G1 con la mano Dex3-1 dentro del simulador MuJoCo.

El entrenamiento se desarrollo en dos etapas segun la model card: una primera fase con demostraciones retargetizadas a partir del movimiento de la mano del propio autor y una segunda fase de ajuste por aprendizaje por refuerzo ponderado por ventaja (advantage-weighted RL) sobre las propias trayectorias del modelo. No se especifican en la informacion proporcionada el numero de tokens, la composicion exacta del dataset, ni el uso de RLHF/DPO. El autor reporta un 52 % de exito en 60 poses de bloque no vistas. El codigo de entrenamiento y evaluacion esta disponible en el repositorio de GitHub indicado en la model card.

## Capacidades

- Control visomotor de manipulacion: genera acciones del robot a partir de imagenes de camaras de cabeza y muneca mas el estado sensoriomotor.
- Seguimiento de instrucciones en lenguaje natural: la tarea se define mediante una orden textual ("pick up the blue block and put it on the blue star").
- Manipulacion con mano diestra Dex3-1 sobre el humanoide Unitree G1 en simulacion MuJoCo.
- Percepcion multi-camara: integra dos flujos visuales (cabeza y muneca) para condicionar la politica.
- Politica entrenada por imitacion mas RL: combina demostraciones retargetizadas con ajuste por refuerzo ponderado por ventaja.
- Ejecucion especifica de una tarea: agarre de un bloque azul y colocacion sobre una estrella azul.
- No hay evidencia en la informacion disponible de soporte de tool calling, agentes multi-paso, capacidades multilingues, modo de razonamiento explicito, vision adicional, audio ni otras capacidades generales.

## Casos de uso

- Investigacion en manipulacion dehumanoides: sirve como punto de partida reproducible para estudiar como un VLA ligero de 450 M se adapta a un humanoide Unitree G1 en MuJoCo mediante imitacion mas RL.
- Reproduccion de pipelines de RL sobre VLAs: el flujo advantage-weighted RL sobre las propias trayectorias del modelo puede replicarse y compararse con alternativas de ajuste supervisado.
- Benchmark de generalizacion a poses: el resultado del 52 % en 60 poses no vistas permite medir la robustez ante variaciones de posicion del objeto.
- Desarrollo de politicas con multiples camaras: la configuracion cabeza + muneca es un caso de estudio para fusion de vistas en robotica.
- Prototipado rapido en simulacion: al depender de MuJoCo, permite iterar sobre politicas de agarre y colocacion antes de transferir a hardware.
- Educacion y divulgacion en VLA: el repositorio de codigo y evaluacion facilita entender el entrenamiento y la evaluacion de un modelo de vision-lenguaje-accion.
- Base para transferencia o ajuste adicional: al ser un fine-tune de SmolVLA, puede reutilizarse como punto de partida para tareas de manipulacion similares.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Exito en colocacion de bloque | 52 % | 60 poses de bloque no vistas |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16/fp16 (los pesos del repo ocupan 0,9 GB), alrededor de 1,8 GB en fp32 y menos de 0,5 GB en int8. Hay que anadir la memoria para el codificador visual, las entradas de camara y el resto del pipeline, por lo que en la practica conviene reservar varios GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente por tamano del modelo; una RTX 3060, RTX 4070 o RTX 4090 resultan holgadas. En entornos de servidor, A100 o H100 sobran para este tamano.
- Cabe en GPU de consumo: si, es un modelo de 450 M de parametros, por lo que cabe en practicamente cualquier GPU de consumo moderna e incluso en equipos con VRAM limitada.
- Opciones de despliegue: el modelo esta pensado para el ecosistema LeRobot (libreria lerobot) con PyTorch. Existen scripts optimizados para ROCm de AMD (repositorio AMD-PAVS-AI/smolVLA). No se menciona soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g1-smolvla-attempt1-wrist | 450 M | no disponible | 52 % en 60 poses no vistas (tarea propia) | no disponible | HuggingFace (adityamohan2604) |
| SmolVLA (base, HuggingFace) | 450 M | no disponible | Igual o mejor que modelos 7-10 veces mayores, segun la fuente citada | no disponible en la informacion | HuggingFace |
| smolVLA AMD (AMD-PAVS-AI) | 450 M | no disponible | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de benchmarks comparables de otros VLAs de robotica en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Entrenado para una unica tarea concreta (coger el bloque azul y colocarlo sobre la estrella azul); no es un modelo generalista.
- Tasa de exito del 52 % en 60 poses no vistas, lo que implica fallos aproximadamente en la mitad de los intentos.
- Entrenado y evaluado en simulacion MuJoCo, por lo que no esta validado en hardware real.
- Basado en demostraciones retargetizadas del movimiento de la mano del autor, lo que puede introducir sesgos hacia su morfologia o estilo de movimiento.
- No se especifica la licencia, por lo que no puede confirmarse el uso comercial.
- No se detallan los datos de entrenamiento (numero de tokens, composicion, posibles sesgos), lo que dificulta evaluar su generalizacion.
- No hay informacion sobre idiomas soportados; la instruccion de tarea esta en ingles.
- Riesgo de sobreajuste a la distribucion de objetos, colores y escenas vistas durante el entrenamiento.
- El ajuste por RL sobre las propias trayectorias puede reforzar comportamientos suboptimos presentes en las rollouts iniciales.
- No se indica si existe soporte para otras tareas, robots o morfologias distintas del Unitree G1 con Dex3-1.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adityamohan2604/g1-smolvla-attempt1-wrist
- Codigo, evaluacion e instrucciones (autor): https://github.com/Adityamohan260498/RL-Finetuned-VLA-Humanod-Manipulation
- Blog de SmolVLA (HuggingFace): https://huggingface.co/blog/smolvla
- Paper SmolVLA en arXiv: https://arxiv.org/abs/2506.01844
- Documentacion de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Repositorio SmolVLA para ROCm: https://huggingface.co/AMD-PAVS-AI/smolVLA
- Ficha divulgativa de SmolVLA en sudoremove: https://sudoremove.com/en/knowledge/models/smolvla/
