# Praveenrajus/Llama-3.1-Tulu-3-8B-SFT-jevify-readout-coh

## Resumen

Llama-3.1-Tülu-3-8B-SFT-jevify-readout-coh es un ajuste fino por LoRA sobre allenai/Llama-3.1-Tulu-3-8B-SFT que no genera texto: se comporta como un modelo de decisión de "Sistema 1". Recibe un estado en texto y responde preguntas tipadas (choice, score, noul) devolviendo distribuciones de probabilidad calibradas sobre las respuestas permitidas, de modo que el código cliente pueda ramificar en función de esas probabilidades. Lo desarrolla el autor Praveenrajus dentro del ecosistema Jevify, con licencia Llama 3.1.

El modelo se entrena sobre su propia "decision readout" —la distribución leída en la posición de respuesta en una única pasada forward, sin decodificación— aplicando la regla de puntuación propia de cada primitiva y una penalización de coherencia (peso 1.0) basada en el sure loss de De Finetti sobre familias de preguntas derivadas automáticamente. Sobre la base Llama 3.1 de 8.000 millones de parámetros se añade un adaptador LoRA de rango 16 con 41.943.040 parámetros, que se fusiona en los pesos en bf16 al cargar el modelo.

Su relevancia reside en el objetivo de calibración y coherencia: frente al Tülu-3-8B-SFT sin ajustar, reduce el ECE de 0.099 a 0.064 y el sure loss de 0.200 a 0.030, además de bajar la tasa de secuestro de instrucciones inyectadas del 0.165 al 0.044. El repositorio ocupa solo 0.2 GB porque únicamente distribuye el adaptador, la receta y los resultados; el backbone se descarga aparte desde su repositorio original fijado a un commit concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA de rango 16 fusionado en carga; cabecera de decision readout sobre respuestas tipadas |
| Parametros totales | 8.030 millones en el backbone (Llama 3.1 8B) mas 41.943.040 parametros del adaptador LoRA |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se fusionan y sirven en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA en el subdirectorio lora/, fusionado en bf16 al cargar) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only Llama 3.1 de 8.000 millones de parametros, concretamente el checkpoint allenai/Llama-3.1-Tulu-3-8B-SFT. Sobre el se entrena un adaptador LoRA de rango 16 (41.943.040 parametros) que, al cargar, se fusiona en los pesos bf16 del backbone. La innovacion principal no esta en el backbone, sino en la forma de leer la salida: el modelo no decodifica texto, sino que evalua la distribucion de probabilidad sobre las opciones permitidas en la posicion de respuesta mediante una unica pasada forward. El modelo soporta tres tipos de pregunta: choice (seleccion entre alternativas), score (puntuacion en una escala) y noul (respuesta si/no o ninguna de las anteriores).

El entrenamiento utiliza la regla de puntuacion propia de cada primitiva mas una penalizacion de coherencia con peso 1.0. Cada pregunta de entrenamiento lleva asociadas preguntas hermanas derivadas automaticamente (las opciones reformuladas como preguntas de si/no, la negacion y las preguntas de umbral de una escala) y se penaliza el sure loss de De Finetti de la familia de respuestas, de modo que las respuestas a preguntas relacionadas se mantengan mutuamente consistentes. Las opciones se barajan por familia. Los datos proceden de las particiones de entrenamiento de las 16 fuentes de jev-bench no reservadas (5.885 familias, con un maximo de 400 registros por fuente); se entrena con lr 3e-05, 2 epocas, seleccionando la mejor epoca por perdida de validacion (epoca 1) y semilla 0. Despues se ajusta una receta Tier 0 (temperatura por primitiva, sesgo Noul, permutaciones de orden de opciones) sobre las particiones de validacion. Las seis fuentes reservadas (clinc150, arc_challenge, yelp5, measuring_hate_speech, fever_evidence y strategyqa_grounded) no aparecen nunca en entrenamiento.

## Capacidades

- Respuesta a preguntas tipadas de eleccion multiple (choice) devolviendo una distribucion de probabilidad calibrada sobre las opciones.
- Puntuacion en escalas (score) con salida probabilistica, no como texto libre.
- Decisiones de tipo noul, que incluyen la opcion "ninguna de las anteriores" cuando procede.
- Ramificacion determinista en codigo: la salida es una distribucion sobre la que el cliente puede aplicar umbrales.
- Coherencia interna entre preguntas relacionadas (opciones reformuladas como si/no, negaciones y umbrales de escala) gracias a la penalizacion de sure loss.
- Invariancia al orden de las opciones (order flip bajo, 0.090) y a los identificadores de las etiquetas (tag TVD 0.033).
- Robustez frente a instrucciones inyectadas en el contexto (tasa de hijack 0.044 frente a 0.165 del modelo sin ajustar).
- No soporta generacion de texto libre, tool calling ni razonamiento multi-paso en el sentido habitual; no es un modelo de agentes ni de generacion.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Enrutamiento y clasificacion en produccion: el modelo decide entre categorias discretas devolviendo probabilidades calibradas, de modo que un umbral de confianza puede derivar el caso a revision humana cuando la probabilidad es baja.
- Moderacion y politicas de contenido: formular la decision como una pregunta choice o noul ("¿incumple esta politica?") y actuar sobre la distribucion resultante en lugar de sobre un texto generado.
- Deteccion de intencion en asistentes conversacionales: mapear el estado de la conversacion a preguntas tipadas (tipo clinc150) para elegir la siguiente accion del dialogo con una unica pasada forward.
- Analisis de sentimiento y valoracion en resenas: con tipos score (por ejemplo, una escala de 5 puntos, caso yelp5) devolviendo la distribucion completa y no solo la clase mayoritaria.
- Verificacion de afirmaciones con evidencia: usar la primitiva correspondiente al dataset fever_evidence para decidir si un texto respalda o refuta una afirmacion, apoyandose en el bajo sure loss para mantener coherencia entre preguntas relacionadas.
- Filtrado de seguridad en pipelines de herramientas: emplear la sonda de riesgo de herramienta (tool risk 0.733) y la AUROC de phishing para bloquear llamadas sospechosas antes de ejecutarlas.
- Evaluacion de coherencia de otros modelos: la receta y los metadatos permiten reproducir las mismas preguntas y comparar el sure loss de un modelo candidato (verification.json reporta que re-puntuando 72 registros se reprodujo la prediccion de entrenamiento con 0 cambios de choice y un |Δp| maximo de 0.023).
- Interfaz drop-in para el SDK TypeSafe: `jevify-serve --model ...` expone el modelo como servicio compatible con `TYPESAFE_BASE_URL=http://localhost:8000`.

## Benchmarks y rendimiento

Resultados de decisiones y calibracion (particiones test de jev-bench, 22.773 registros):

| Modelo | acc | ECE | Brier | held-out acc | TVD a etiquetas humanas |
|---|---|---|---|---|---|
| Este modelo | 0.722 | 0.064 | 0.347 | 0.758 | 0.318 |
| Tülu-3-8B-SFT sin ajustar (Tier 0) | 0.603 | 0.099 | 0.470 | 0.644 | 0.448 |
| Misma receta, solo supervisado | 0.708 | 0.070 | 0.362 | 0.739 | 0.321 |
| Misma receta desde el checkpoint DPO | 0.708 | 0.064 | 0.359 | 0.744 | 0.314 |
| Jev 1.13.0 (API TypeSafe) | 0.733 | 0.113 | 0.349 | 0.835 | 0.432 |

Coherencia e invariancia (sure loss medio sobre 4.749 familias; 0 = perfectamente coherente):

| Modelo | sure loss | proporcion incoherente | order flip | tag TVD | caida acc K=2 a max |
|---|---|---|---|---|---|
| Este modelo | 0.030 | 0.516 | 0.090 | 0.033 | 0.226 |
| Tülu-3-8B-SFT sin ajustar (Tier 0) | 0.200 | 0.978 | 0.311 | 0.078 | 0.420 |
| Misma receta, solo supervisado | 0.317 | 0.955 | 0.098 | 0.035 | 0.237 |
| Misma receta desde el checkpoint DPO | 0.033 | 0.464 | 0.096 | 0.035 | 0.241 |
| Jev 1.13.0 (API TypeSafe) | 0.081 | 0.725 | 0.046 | no disponible | 0.246 |

Resultados fuera de distribucion (regla enunciada en la pregunta, opcion "ninguna" con el oro eliminado, tasa de secuestro de instrucciones inyectadas, AUROC de phishing y riesgo de herramienta):

| Modelo | stated rule | "none" cuando falta | hijack | phishing AUROC | tool risk |
|---|---|---|---|---|---|
| Este modelo | 0.575 | 0.532 | 0.044 | 0.499 | 0.733 |
| Tülu-3-8B-SFT sin ajustar (Tier 0) | 0.558 | 0.212 | 0.165 | 0.771 | 0.700 |
| Misma receta, solo supervisado | 0.577 | 0.470 | 0.092 | 0.476 | 0.817 |
| Misma receta desde el checkpoint DPO | 0.575 | 0.514 | 0.016 | 0.485 | 0.700 |
| Jev 1.13.0 (API TypeSafe) | 0.924 | 0.744 | 0.205 | 0.688 | 0.933 |

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 16 GB para los 8.000 millones de parametros del backbone mas los pesos fusionados.
- VRAM en int8: del orden de 8-9 GB (requiere cuantizacion externa, no incluida en el repositorio).
- VRAM en int4/GGUF Q4: del orden de 4-5 GB (no se distribuyen pesos cuantizados; habria que generarlos).
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para servicio en bf16 con margen; RTX 3090 o RTX 4090 (24 GB) para bf16 en una sola tarjeta.
- GPU de consumo: cabe en RTX 3090/4090 en bf16 y en tarjetas de 8-12 GB solo con cuantizacion de 8 o 4 bits.
- Despliegue: el modelo se carga con la libreria jevify (`from jevify import load_jevified`) o se sirve con `jevify-serve --model ...`. No es un modelo de generacion de texto, por lo que no encaja directamente en vLLM, TGI o Ollama como generador; requeriria adaptar el pipeline para leer la distribucion en la posicion de respuesta.
- Latencia y throughput: no disponibles de forma numerica; al no decodificar y resolverse en una unica pasada forward, la latencia es sustancialmente menor que la de un modelo generativo del mismo tamano, pero no se publican mediciones concretas.
- El backbone se descarga aparte desde su repositorio original, fijado al commit f2a0b46b0cfda21003c6141b1ff837b7e165524d.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | acc / ECE | sure loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 8B + LoRA r16 (41,9 M) | 128.000 tokens (heredado) | 0.722 / 0.064 | 0.030 | llama3.1 | Adaptador en HuggingFace; backbone aparte |
| Tülu-3-8B-SFT sin ajustar | 8B | 128.000 tokens | 0.603 / 0.099 | 0.200 | llama3.1 | Modelo base publico |
| Misma receta, solo supervisado | 8B + LoRA | 128.000 tokens | 0.708 / 0.070 | 0.317 | llama3.1 | Variante relacionada |
| Misma receta desde DPO | 8B + LoRA | 128.000 tokens | 0.708 / 0.064 | 0.033 | llama3.1 | Variante relacionada |
| Jev 1.13.0 (TypeSafe API) | no disponible | no disponible | 0.733 / 0.113 | 0.081 | no disponible | API hospedada |

El modelo destaca en calibracion (ECE 0.064) y coherencia (sure loss 0.030) frente al backbone sin ajustar, aunque es superado en precision bruta por Jev 1.13.0 (0.733) y muy por debajo en "stated rule" (0.924 de Jev frente a 0.575) y en "none" cuando falta el oro (0.744 frente a 0.532).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto y no puede usarse para completar, resumir ni redactar contenido.
- Sensibilidad de la AUROC de phishing: 0.499, es decir, rendimiento practicamente al nivel del azar en esa sonda, muy por debajo del backbone sin ajustar (0.771).
- La sonda de "stated rule" (regla de decision enunciada en la propia pregunta) es de 0.575, similar al modelo sin ajustar, lo que indica que el ajuste apenas mejora el seguimiento de reglas explicitas.
- Un 51,6 % de las familias de preguntas siguen siendo incoherentes segun la metrica de sure loss, aunque el valor medio (0.030) sea muy bajo; la coherencia es buena en promedio, no universal.
- La tarea "none cuando falta el oro" alcanza 0.532, de forma que en casi la mitad de los casos en los que la opcion correcta no esta presente el modelo no selecciona "ninguna de las anteriores".
- Alto riesgo de alucinacion en el sentido estricto no aplica (no genera texto), pero si puede producir decisiones con exceso de confianza en dominios fuera de distribucion; debe calibrarse por tarea.
- Idiomas soportados no documentados; el entrenamiento se realizo sobre jev-bench, mayoritariamente en ingles, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Licencia Llama 3.1 Community License: uso comercial sujeto a las condiciones de Meta, incluida la obligacion de mostrar "Built with Llama" y las restricciones de la licencia para determinados usos.
- El repositorio es muy reciente (creado el 25 de septiembre de 2026 segun los metadatos) y sin descargas ni valoraciones, por lo que no existe validacion externa independiente.
- El backbone se fija a un commit concreto del repositorio base; cambiar de commit podria alterar los resultados de reproduccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Praveenrajus/Llama-3.1-Tulu-3-8B-SFT-jevify-readout-coh
- Dataset jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Leaderboard de jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench#leaderboard
- Hallazgos (readout fine-tuning y penalizacion de coherencia): https://github.com/uspraveen/Jevify/blob/main/docs/FINDINGS.md#18-readout-fine-tuning-and-what-a-coherence-penalty-adds
- Repositorio de codigo Jevify: https://github.com/uspraveen/Jevify
- Modelo base: allenai/Llama-3.1-Tulu-3-8B-SFT
