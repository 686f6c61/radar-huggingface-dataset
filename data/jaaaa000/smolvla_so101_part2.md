# jaaaa000/smolvla_so101_part2

## Resumen

SmolVLA para SO-101 es una política robótica de tipo vision-language-action (VLA) afinada por el usuario jaaaa000 a partir del modelo base `lerobot/smolvla_base`. Resuelve una tarea concreta de manipulación: un brazo SO-101 debe colocar uno de dos objetos (una esponja azul y una esponja roja) en una de dos bandejas (izquierda o derecha) siguiendo una instrucción en lenguaje natural. El modelo combina percepción visual procedente de dos cámaras con el estado articular del brazo y una instrucción textual para generar acciones motrices.

Técnicamente es un fine-tune de SmolVLA, la propuesta de Hugging Face presentada en el paper arXiv 2506.01844, que emplea un backbone vision-language congelado y un cabezal de acciones entrenado sobre datos de teleoperación. El checkpoint cuenta con 450.046.176 parámetros y se distribuye en safetensors con la librería LeRobot 0.6.0, lo que lo hace desplegable en hardware de consumo (se entrenó en una única RTX 3060 de 12 GB).

Su relevancia es doble: por un lado demuestra que un VLA compacto puede ejecutar instrucciones condicionales (qué objeto va a qué recipiente) con un éxito del 94,4 % en el entorno real, y por otro sirve como referencia reproducible de fine-tuning de SmolVLA sobre un robot de bajo coste como el SO-101, con datos y comandos de inferencia publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): backbone vision-language congelado mas cabezal de prediccion de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (politica de acciones; ventana temporal definida por el chunking de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, una política VLA que combina un backbone vision-language con un modulo generador de acciones. En este checkpoint el backbone vision-language permanecio congelado durante todo el entrenamiento; solo se ajusto el cabezal de acciones. Las entradas son dos flujos de camara (vista superior y lateral, 640x480 a 30 fps) y las seis posiciones articulares del brazo SO-101, junto con la instruccion textual que indica que esponja va a que bandeja.

El entrenamiento se realizo con LeRobot 0.6.0 sobre el dataset `jaaaa000/so101_part2`, compuesto por 96 demostraciones teleoperadas (todas las episodios salvo el 12, 15 y 25), 24 por cada una de las cuatro frases. Se ejecutaron 46.000 pasos con batch size 8 en una unica RTX 3060 de 12 GB, sin aumento de imagen. El checkpoint publicado es el ultimo del entrenamiento. En inferencia se emplea chunking en tiempo real con `--inference.type=rtc --inference.rtc.execution_horizon=15`.

## Capacidades

- Generacion de acciones motrices condicionadas por instruccion en lenguaje natural para el brazo SO-101.
- Comprension de referencias a atributos de objeto (color de la esponja) y de destino (bandeja izquierda o derecha).
- Fusión multimodal de dos camaras (superior y lateral) y del estado articular en un unico espacio de politica.
- Generalizacion limitada a reformulaciones de la instruccion: 11 de 16 exitos con frases nunca vistas como "Place the blue sponge into the tray on the left".
- Ejecucion de tareas de pick-and-place con agarre de objetos deformables (esponjas).
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni modos de razonamiento explicitos; es una politica robotica, no un modelo conversacional.

## Casos de uso

- Manipulacion pick-and-place guiada por lenguaje en laboratorio: el modelo recibe la frase y las imagenes de las dos camaras y emite las acciones articulares para colocar la esponja indicada en la bandeja correcta, con 34 de 36 exitos en pruebas reales.
- Base para fine-tuning en robots SO-101 de bajo coste: al estar entrenado sobre LeRobot 0.6.0 y publicarse los datos y comandos, sirve como punto de partida reproducible para nuevas tareas con el mismo brazo.
- Evaluacion de generalizacion linguistica en politicas VLA: el checkpoint permite medir el rendimiento ante reformulaciones de la instruccion (11 de 16 en frases nuevas) y comparar con alternativas como los modelos ACT por frase.
- Investigacion en chunking de inferencia: el uso documentado de `execution_horizon=15` con RTC permite estudiar el compromiso entre latencia de reaccion y estabilidad de la trayectoria en hardware limitado.
- Prototipado de automatizacion de clasificacion de objetos: con dos clases de objeto y dos destinos, el modelo puede integrarse en una celda que separe piezas por color en contenedores designados.
- Benchmark de referencia para modelos compactos: con 450 M de parametros y entrenamiento en una RTX 3060, es util como linea base de VLA de bajo coste frente a politicas mas grandes o especializadas por tarea (los cuatro modelos ACT del autor).

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Exito en brazo real, 36 ensayos con las cuatro frases (30 s por ensayo) | 34/36 (94,4 %) |
| Seleccion del objeto nombrado | 36/36 |
| Fallos | 2, ambos por agarre fallido |
| Frases reformuladas no vistas (16 ensayos) | 11/16 (68,8 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; se trata de una politica robotica y las metricas publicadas son de exito en tarea real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento cupo en 12 GB (RTX 3060) con batch size 8 y backbone congelado, por lo que la inferencia en precision nativa deberia caber holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 3060 12 GB (validada para entrenamiento), asi como GPUs consumer con al menos 8-12 GB; para despliegue en robot se prioriza latencia baja mas que memoria.
- Cabe en GPU consumer: si, segun la evidencia de entrenamiento en RTX 3060.
- Opciones de despliegue: LeRobot 0.6.0 con inferencia en tiempo real (`--inference.type=rtc --inference.rtc.execution_horizon=15`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles; el autor fija un horizonte de ejecucion de 15 pasos y ensayos de 30 segundos, pero no publica cifras de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Exito reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_part2 (este) | 450 M | VLA unico, cuatro frases | 34/36 en frases de entrenamiento; 11/16 en reformuladas | Apache 2.0 | Hugging Face |
| act_so101_part2_s1 | no disponible | ACT especializado en la frase 1 | no disponible | no disponible | Hugging Face |
| act_so101_part2_s2 | no disponible | ACT especializado en la frase 2 | no disponible | no disponible | Hugging Face |
| act_so101_part2_s3 | no disponible | ACT especializado en la frase 3 | no disponible | no disponible | Hugging Face |
| act_so101_part2_s4 | no disponible | ACT especializado en la frase 4 | no disponible | no disponible | Hugging Face |

Los cuatro modelos ACT fueron entrenados por el mismo autor sobre las mismas demostraciones, uno por frase; la model card no publica sus tasas de exito, por lo que no es posible una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Entrenado exclusivamente para cuatro frases y un escenario fijo (dos esponjas, dos bandejas); fuera de ese dominio no hay garantia de comportamiento.
- La generalizacion linguistica es parcial: 11 de 16 exitos con reformulaciones, con 5 fallos en frases no vistas.
- Dos de los 36 ensayos fallaron por agarre fallido, lo que indica fragilidad en la fase de grasping con objetos deformables.
- El backbone vision-language esta congelado, lo que limita la adaptacion a vocabulario o conceptos fuera del dataset.
- No se documentan sesgos, riesgos de alucinacion textual ni evaluaciones de seguridad; al ser una politica motriz, el riesgo principal es fisico (colisiones, agarres erroneos) y requiere supervision en el robot real.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de `lerobot/smolvla_base` y de LeRobot 0.6.0; conviene verificar las condiciones de esas dependencias.
- El dataset excluye los episodios 12, 15 y 25, lo que puede introducir sesgos de cobertura en las demostraciones.
- No hay informacion sobre cuantizacion, latencia ni despliegue en produccion, por lo que la puesta en marcha requiere validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaaaa000/smolvla_so101_part2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/jaaaa000/so101_part2
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Modelos ACT comparativos: https://huggingface.co/jaaaa000/act_so101_part2_s1, https://huggingface.co/jaaaa000/act_so101_part2_s2, https://huggingface.co/jaaaa000/act_so101_part2_s3, https://huggingface.co/jaaaa000/act_so101_part2_s4
