# autotrust/GEV-26B-Decide

## Resumen

GEV-26B-Decide es un modelo de decisión desarrollado por autotrust y construido sobre google/gemma-4-26B-A4B-it. No es un generador de texto al uso: su salida son decisiones tipadas (sí/no, elegir una opción entre 2 y 256, o puntuar de 0 a 5) acompañadas de una probabilidad calibrada para cada alternativa, tanto sobre texto como sobre imágenes. La model card lo describe como un modelo con "pensamiento adaptativo": un modo System 1 que decide en un único forward pass (unos 45 ms en una B200) y un modo System 2 que reutiliza el backbone en modo thinking de Gemma-4 cuando la opción líder resulta incierta, plegando después el razonamiento a las probabilidades finales.

El modelo es un Mixture-of-Experts de aproximadamente 25,8 mil millones de parámetros totales y unos 4 mil millones activos por token, con un repositorio de 51,9 GB en safetensors y licencia declarada Apache 2.0. La model card indica además `base_model_relation: adapter` y la etiqueta `lora`, de modo que la relación exacta entre los pesos publicados y el modelo base conviene verificarla antes de desplegarlo.

Su relevancia actual viene de dos frentes. Por un lado, en la suite Decision Index 0.2 (edición 0.2.1) obtiene un índice equilibrado de 62,48, por delante del 57,91 registrado por TypeSafe Jev 1.13 en el board. Por otro, publica resultados en bucles de control reales: 95% de éxito en 60 tareas de computer use a unos 85 ms por clic, y 40% de éxito en 20 escenas de pick-and-place robótico a 61 ms por decisión, con un rendimiento inferior al de JEV-27B-VL en manipulación pero tres veces más rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal sobre Google Gemma-4-26B-A4B-it; transformer con enrutado de expertos |
| Parametros totales | 25.805.936.206 (25,8 B), dato real de safetensors |
| Parametros activos | Aproximadamente 4 B por token (segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni FP8 en la informacion proporcionada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 del modelo base) |
| Formato de pesos | safetensors; libreria transformers |
| Relacion con el modelo base | adapter / LoRA sobre google/gemma-4-26B-A4B-it |
| Tarea declarada (pipeline) | text-classification |
| Entradas | Texto e imagen (image-text-to-text) |
| Salidas | Decisiones tipadas: si/no, elegir una de 2-256 opciones, puntuar 0-5, con probabilidad calibrada por opcion |
| Modos de inferencia | System 1 (sin thinking) y System 2 (thinking adaptativo de Gemma-4) |
| Tamano del repositorio | 51,9 GB |
| Descargas | 446.527 |
| Likes | 192 |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Gemma-4-26B-A4B-it: un transformer con capas Mixture-of-Experts, 26 B de parametros totales y aproximadamente 4 B activos por token, con soporte multimodal de entrada (imagen y texto) y una sola pila de pesos para ambas modalidades. GEV-26B-Decide se presenta como un adaptador sobre ese backbone, y la model card describe un unico motor vLLM sirviendo tanto el modo System 1 como el modo System 2. En System 1 el modelo produce la decision en un solo forward pass; en System 2 reutiliza el mismo backbone en modo thinking de Gemma-4 para razonar sobre la pregunta y despues integrar ese razonamiento en las probabilidades finales de cada opcion. El thinking es adaptativo: solo se activa cuando la opcion lider de System 1 resulta incierta.

Los detalles de entrenamiento no estan publicados en la informacion disponible: no se especifica el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Lo unico documentado sobre evaluacion es el procedimiento de puntuacion del Decision Index 0.2.1, donde las diez pruebas del area Knowledge & Reasoning se ejecutan con thinking activado, mientras que las otras cuatro areas (Language, Retrieval & Classification, Tools & Automation y Arts & Taste) se puntuan solo con System 1, a partir de una ejecucion completa de 150.759 peticiones sin errores. La model card justifica esa eleccion indicando que el thinking aporta poco en clasificacion, recuperacion y seleccion de herramientas.

## Capacidades

- Decisiones tipadas con probabilidades calibradas: respuestas si/no, eleccion entre 2 y 256 opciones, y puntuacion en escala 0-5.
- Modo System 1: una decision por forward pass, con latencia declarada de unos 45 ms en una NVIDIA B200.
- Modo System 2 (thinking adaptativo): razonamiento del backbone Gemma-4 cuando System 1 muestra incertidumbre, con el razonamiento plegado a las probabilidades finales.
- Entrada multimodal: acepta imagenes ademas de texto (image-text-to-text), incluyendo capturas de pantalla y fotogramas de camara.
- Computer use: a partir de una captura de navegador con elementos clicables numerados, selecciona el siguiente elemento a pulsar o declara la tarea completada.
- Control de robot: a partir de la imagen de una camara cenital, responde a dos preguntas binarias (izquierda/derecha y arriba/abajo respecto a la pinza).
- Seleccion de herramientas y automatizacion: el area Tools & Automation obtiene 0,697 de skill en el Decision Index, la mas alta del modelo.
- Clasificacion y recuperacion: 0,679 de skill en Retrieval & Classification.
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma del repositorio.
- Integracion con vLLM: el modelo se sirve con un motor vLLM que cubre texto e imagen, y expone endpoints compatibles (tag endpoints_compatible).
- No se documenta soporte explicito de generacion libre de texto, function calling en formato JSON ni audio.

## Casos de uso

- Clasificacion y enrutado de tickets en produccion: el modelo devuelve la categoria elegida entre un conjunto cerrado de opciones con una probabilidad asociada, lo que permite enrutar solo los casos de alta confianza y derivar los dudosos a revision humana. El area Retrieval & Classification obtiene 0,679 de skill, lo que respalda este uso.
- Moderacion y filtrado binario: las decisiones si/no con probabilidad calibrada encajan en pipelines de moderacion donde se necesita un umbral ajustable y auditable, sin generar texto libre.
- Analisis de encuestas y satisfaccion: la escala 0-5 permite convertir respuestas abiertas o transcripciones en puntuaciones numericas con distribucion de probabilidad, util para paneles de NPS o CSAT.
- Automatizacion de navegador (computer use): con la captura del navegador y los elementos clicables numerados, el modelo decide el siguiente clic; la model card reporta 95% de exito en 60 tareas aleatorias de 3 a 7 clics a unos 85 ms por clic. Es adecuado para tareas repetitivas de formularios, tiendas o ajustes.
- Control de robot en simulacion: en MuJoCo, el modelo responde a preguntas binarias sobre la posicion relativa del objetivo y la pinza, permitiendo pick-and-place completo en 4-8 segundos de tiempo de modelo con 61 ms por decision. Encaja en lazos de control simples donde una respuesta binaria por paso es suficiente.
- Seleccion de herramientas en agentes: el area Tools & Automation es la mas fuerte del modelo (0,697), de modo que puede elegir que herramienta invocar en un agente multi-paso antes de que otro componente ejecute la accion.
- Triaje de imagenes en lote: al aceptar entrada de imagen y devolver probabilidades, puede etiquetar capturas o fotogramas de camara con una categoria predefinida, por ejemplo para descartar escenas vacias antes de un paso de vision mas costoso.
- Evaluacion automatizada de respuestas: dado un par pregunta/respuesta, puede puntuar de 0 a 5 con probabilidad asociada, lo que sirve como juez ligero en evaluaciones de calidad donde no se requiere generacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. El unico valor marcado como verificado es ninguno: la metrica `decision_index` figura con `verified: false`.

| Metrica | Valor |
|---|---|
| Decision Index 0.2.1 (balanced skill) | 62,48 |
| Balanced raw | 70,66 |
| Breadth skill | 62,00 |
| TypeSafe Jev 1.13 (board), referencia | 57,91 |

Desglose por area de skill:

| Area | Skill |
|---|---|
| Knowledge & Reasoning | 0,602 |
| Language | 0,636 |
| Retrieval & Classification | 0,679 |
| Tools & Automation | 0,697 |
| Arts & Taste | 0,415 |

Rendimiento en bucles de control, comparado con otros modelos de la misma familia (mismos escenarios y tareas):

| Prueba | GEV-26B-Decide | JEV-27B-VL | JEV-9B |
|---|---|---|---|
| Computer use: cajas numeradas + texto de elemento (60 tareas) | 95% | 95% | 95% |
| Tiempo por clic | aprox. 85 ms | aprox. 260 ms | aprox. 200 ms |
| Brazo robot: pick and place (20 escenas) | 40% | 75% | 50% |
| Tiempo por decision de brazo robot | 61 ms | 239 ms | 163 ms |

No se han publicado resultados de benchmarks de conocimiento general (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos numeros disponibles son los del Decision Index y los de los bucles de computer use y robotica descritos arriba.

## Requisitos de hardware

- VRAM estimada para inferencia de los 25,8 B de parametros (estimacion a partir del recuento de parametros; el autor no publica cifras de VRAM): en FP16/BF16 alrededor de 52 GB de pesos; en FP8/INT8 alrededor de 26 GB; en INT4 alrededor de 13-15 GB. Hay que sumar el cache KV, que depende del contexto y del lote.
- La model card reporta mediciones en una NVIDIA B200 para System 1 (unos 45 ms por decision) y menciona una RTX PRO 6000 para la medicion de latencia del board. No se publican pruebas en GPUs de consumo.
- Cabe en GPU de consumo solo si se dispone de una cuantizacion de 4 bits que reduzca los pesos a 13-15 GB, lo que limita el lote y el contexto utilizable; no hay variantes GGUF ni cuantizaciones documentadas en la informacion disponible, por lo que este escenario queda por verificar.
- Opciones de despliegue: vLLM esta explicitamente soportado (tag `vllm` y menciones en la model card), con endpoints compatibles. La libreria declarada es transformers. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia declarada: unos 45 ms por decision en System 1 sobre una B200; aproximadamente 85 ms por clic en computer use y 61 ms por decision en brazo robot. El thinking adaptativo es "mucho mas lento" en los benchmarks de Knowledge & Reasoning, segun la propia model card.
- Throughput: no disponible. Si se conoce que la ejecucion completa del Decision Index en System 1 supuso 150.759 peticiones sin errores.
- El board del Decision Index exige una latencia mediana maxima de 1.000 ms por peticion para poder entrar en la clasificacion; la model card indica que la puntuacion publicada no es una entrada de board, sino un calculo propio con el kit `score --edition 0.2.1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autotrust/GEV-26B-Decide | 25,8 B totales, aprox. 4 B activos | no disponible | Decision Index 0.2.1: 62,48; computer use 95% a 85 ms/clic; brazo robot 40% a 61 ms | apache-2.0 (base con licencia Gemma 4) | HuggingFace, 446.527 descargas, vLLM |
| autotrust/JEV-27B-VL | no disponible en la informacion proporcionada | no disponible | Computer use 95% a 260 ms/clic; brazo robot 75% a 239 ms | no disponible | HuggingFace |
| autotrust/JEV-9B | no disponible en la informacion proporcionada | no disponible | Computer use 95% a 200 ms/clic; brazo robot 50% a 163 ms | no disponible | HuggingFace |
| TypeSafe Jev 1.13 (board) | no disponible | no disponible | Decision Index 0.2.1: 57,91 | no disponible | Referencia de board |
| google/gemma-4-26B-A4B-it | 26 B totales, aprox. 4 B activos | no disponible | no disponible | licencia Gemma 4 (enlace en la model card) | Modelo base en HuggingFace |

La comparativa con los modelos de la misma familia es la mas informativa: GEV-26B-Decide iguala en exito a JEV-27B-VL y JEV-9B en computer use, pero es entre 2,3 y 3 veces mas rapido por clic; en cambio, en manipulacion robotica queda por detras de JEV-27B-VL (40% frente a 75%), con un tiempo por decision 3,9 veces menor. No se dispone de datos de parametros, contexto ni licencia de JEV-27B-VL y JEV-9B en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles. No hay evidencia de capacidades multilingues y la etiqueta de idioma del repositorio es unicamente `en`.
- Riesgo de alucinacion en el modo System 2: como cualquier modelo que razona en lenguaje natural antes de decidir, el razonamiento intermedio puede contener afirmaciones incorrectas. El autor no publica tasas de error ni evaluaciones de fidelidad del razonamiento.
- El area Arts & Taste obtiene un skill de 0,415, muy por debajo del resto (0,602-0,697). No es un modelo adecuado para decisiones subjetivas de gusto o estilo.
- En computer use, si se le dan solo las cajas numeradas sin el texto de los elementos, la tasa de exito cae del 95% al 15% y tiende a declarar la tarea completada demasiado pronto. Es un requisito de integracion, no una capacidad opcional.
- En robotica, cuando se le pide elegir directamente uno de 8 comandos de motor, completa 0 de 10 escenas. Solo funciona con preguntas binarias simples dentro del lazo de control, y cerca del objetivo sus respuestas izquierda/derecha son menos precisas que las de JEV-27B-VL.
- La licencia declarada es Apache 2.0, pero el modelo se construye sobre google/gemma-4-26B-A4B-it, cuya licencia (Gemma 4) se enlaza en la model card. Conviene revisar las condiciones del modelo base antes de un uso comercial, porque pueden imponer restricciones adicionales no cubiertas por la Apache 2.0 del adaptador.
- La relacion con el modelo base esta declarada como `adapter` y el repositorio lleva la etiqueta `lora`, pero el recuento de parametros de safetensors es de 25,8 B, coherente con pesos completos. Esta discrepancia entre los metadatos y el contenido del repositorio debe aclararse antes de desplegar.
- El unico resultado de benchmark del model-index esta marcado como `verified: false`, es decir, es una autoevaluacion del autor con su propio kit de puntuacion y no una entrada validada del board.
- No hay datos publicados de longitud de contexto, tipos de cuantizacion, consumo de VRAM ni throughput, lo que dificulta el dimensionamiento de un despliegue en produccion.
- El thinking adaptativo es sensiblemente mas lento que System 1 en las pruebas de Knowledge & Reasoning; usarlo de forma indiscriminada en un lazo de control rompe los presupuestos de latencia de 45-85 ms que el modelo declara para System 1.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/GEV-26B-Decide
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4 referenciada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/autotrust/jev-decision-index-results
- Modelo JEV-27B-VL: https://huggingface.co/autotrust/JEV-27B-VL
- Modelo JEV-9B: https://huggingface.co/autotrust/JEV-9B
- Codigo de demostracion (computer use y brazo robot, en el repositorio de JEV-9B): https://huggingface.co/autotrust/JEV-9B/tree/main/vl/demos
- Resultados por episodio de las demos: https://huggingface.co/autotrust/GEV-26B-Decide/tree/main/reports/demos
- Video de computer use: https://huggingface.co/autotrust/GEV-26B-Decide/resolve/main/videos/computer_use_shop.mp4
- Video de pick and place con brazo robot: https://huggingface.co/autotrust/GEV-26B-Decide/resolve/main/videos/robot_arm_pick_place.mp4
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a la plataforma educativa francesa MonLycee.net y a PRONOTE, sin relacion con el modelo. No se dispone de paper, blog tecnico ni repositorio adicional verificado.
