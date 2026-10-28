# SinhalaMMLU-SharedTask/team-rexx-gemma-4-e4b

## Resumen

team-rexx-gemma-4-e4b es el modelo presentado por el equipo Rexx al shared task SinhalaMMLU. Se trata de un fine-tune del modelo multimodal google/gemma-4-E4B-it (pipeline image-text-to-text), publicado por la organizacion SinhalaMMLU-SharedTask con licencia Apache 2.0 y pesos safetensors en BF16. El checkpoint entregado es el resultado de fusionar un adaptador LoRA sobre los pesos base, de modo que no requiere descargar el modelo original ni un adaptador adicional: los 7.941.100.832 parametros del repositorio son el modelo completo.

El modelo resuelve una tarea concreta: responder preguntas de opcion multiple del benchmark SinhalaMMLU, un conjunto de examenes en cingales (sinhala) organizados por asignatura y curso. Para ello se entreno mediante destilacion de razonamiento sobre 20.870 trazas correctas de un modelo profesor, con LoRA de rango 64 durante 2 epocas y tasa de aprendizaje 5e-5, seguida de una interpolacion de pesos W = W_base + 0,5 (W_destilado - W_base).

Su interes es doble. Por un lado, aporta una referencia reproducible en una lengua de bajos recursos como el cingales, con resultados medidos en Codabench. Por otro, documenta una receta de inferencia completa (thinking activado, linea de asignatura y curso, 8 respuestas greedy sobre opciones barajadas con voto mayoritario y un presupuesto de razonamiento de 7.168 tokens) que puede replicarse en otros idiomas. El envio greedy obtuvo una media macro de 67,5666 (ID 145) y el envio muestreado anterior 64,6025 (ID 104).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Gemma 4 (tag `gemma4`); entrada image-text-to-text |
| Parametros totales | 7.941.100.832 (checkpoint fusionado completo en BF16) |
| Parametros activos | no disponible; el sufijo E4B del nombre sigue el patron de parametros efectivos de la familia Gemma, pero la informacion proporcionada no lo confirma ni documenta una arquitectura MoE |
| Longitud de contexto | no disponible; la receta de inferencia fija un presupuesto de razonamiento de 7.168 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos BF16 fusionados (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | cingales (`si`) e ingles (`en`) |
| Licencia | apache-2.0, sujeta a la licencia Gemma 4 enlazada en la model card |
| Formato de pesos | safetensors (BF16), cargables con `transformers`; tamano del repo 15,9 GB |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un modelo multimodal de la familia Gemma 4 que acepta texto e imagen como entrada y genera texto. Sobre esa base se aplico destilacion de razonamiento: se recogieron 20.870 trazas correctas generadas por un modelo profesor y se entreno un adaptador LoRA de rango 64 durante 2 epocas con tasa de aprendizaje 5e-5. El adaptador se fusiono posteriormente en los pesos del modelo base.

La innovacion principal de esta publicacion no esta en la arquitectura, sino en el post-entrenamiento y en la receta de inferencia. Tras la fusion se aplica una interpolacion de pesos con coeficiente 0,5 respecto al modelo base (W = W_base + 0,5 (W_destilado - W_base)), un tipo de model soup que suaviza el desplazamiento respecto al original. En inferencia se activa el modo thinking, se antepone una linea con asignatura y curso, se generan 8 respuestas greedy sobre opciones barajadas y se agregan por voto mayoritario, con un presupuesto de razonamiento de 7.168 tokens. No se detallan en la informacion disponible la composicion completa del dataset, el volumen total de tokens de entrenamiento ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en cingales e ingles, con etiqueta `conversational` en el repositorio.
- Entrada multimodal image-text-to-text: acepta imagenes junto con texto segun el pipeline declarado.
- Razonamiento explicito en modo thinking, con presupuesto configurable (7.168 tokens en la receta del shared task).
- Resolucion de preguntas de opcion multiple de estilo examen, con asignatura y curso como contexto.
- Agregacion por voto mayoritario sobre 8 muestras con opciones barajadas, implementada en la capa de inferencia, no en el modelo.
- Capacidades multilingues limitadas al par cingales-ingles documentado.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes o razonamiento multi-paso con herramientas: no documentado en la informacion disponible.

## Casos de uso

- Evaluacion educativa automatizada en cingales: el modelo responde items de opcion multiple organizados por asignatura y curso, lo que permite construir examenes de practica o pilotos de evaluacion a escala en una lengua con pocos recursos.
- Linea base reproducible para investigación en NLP de bajos recursos: al publicar pesos fusionados, la receta de entrenamiento y los checksums, otros equipos pueden comparar tecnicas de destilacion de razonamiento sobre el mismo benchmark sin reentrenar desde cero.
- Destilacion hacia modelos mas pequenos: las trazas de razonamiento generadas por este modelo pueden reutilizarse como datos profesor para ajustar modelos de menor tamano orientados a cingales.
- Correccion y generacion de material de estudio: con la linea de asignatura y curso como prefijo, el modelo puede redactar explicaciones y distractores plausibles para preguntas nuevas, utiles en plataformas de preparacion de examenes.
- Evaluacion de sistemas con voto mayoritario: el pipeline de 8 respuestas greedy con opciones barajadas sirve como arnes de evaluacion para medir robustez frente al orden de las alternativas, una fuente habitual de sesgo posicional.
- Procesamiento de enunciados con soporte visual: al ser image-text-to-text, puede recibir capturas o escaneos de examenes junto al texto, lo que resulta util en digitalizacion de material docente (calidad no validada fuera del dominio del shared task).
- Analisis comparativo de envios en competiciones: los resultados Codabench asociados (67,5666 greedy y 64,6025 muestreado) permiten estudiar el efecto de la estrategia de decodificacion sobre el mismo checkpoint.

## Benchmarks y rendimiento

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| SinhalaMMLU, media macro | Envio greedy, Codabench ID 145 | 67,5666 |
| SinhalaMMLU, media macro | Envio muestreado 08, Codabench ID 104 | 64,6025 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar en la informacion disponible. Tampoco se aportan resultados por asignatura o por curso, ni la comparacion con el modelo base sin ajustar.

## Requisitos de hardware

- Pesos en BF16: 7.941.100.832 parametros a 2 bytes por parametro equivalen a unos 15,9 GB, coherente con el tamano del repositorio.
- VRAM estimada: aproximadamente 16 GB solo para pesos, mas cache KV; con un presupuesto de razonamiento de 7.168 tokens y 8 generaciones por pregunta conviene reservar bastante margen.
- Configuracion validada por el autor: una A100 de 40 GB con vLLM 0.32.0 ejecutando la receta completa del shared task.
- GPU recomendadas: A100 40 GB (validada). H100, L40S o A6000 de 48 GB son plausibles por capacidad de memoria, pero no estan validadas en la informacion disponible.
- GPU de consumo: una RTX 4090 de 24 GB queda muy justa en BF16 para el pipeline completo (8 muestras y 7.168 tokens de razonamiento); no hay cuantizaciones publicadas que faciliten el despliegue en 16 GB o menos.
- Opciones de despliegue: vLLM 0.32.0 (usado por el autor) y `transformers` con `AutoModelForImageTextToText.from_pretrained(..., dtype=torch.bfloat16, device_map="auto")`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Cualquier estimacion debe tener en cuenta que la receta multiplica por 8 el coste de decodificacion por pregunta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SinhalaMMLU (macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SinhalaMMLU-SharedTask/team-rexx-gemma-4-e4b | 7.941.100.832 | no disponible (presupuesto de razonamiento de 7.168 tokens) | 67,5666 (greedy, ID 145); 64,6025 (muestreado, ID 104) | Apache 2.0 sujeta a licencia Gemma 4 | Hugging Face, 0 descargas, 0 likes |
| google/gemma-4-E4B-it (base) | no disponible en la informacion | no disponible | no disponible | licencia Gemma 4 | Hugging Face |
| sinhala-mmlu/gemma-4-e4b-sinhala-mmlu (tag v2.0.0) | 7.941.100.832 | no disponible | mismos resultados (ficheros identicos) | Apache 2.0 sujeta a licencia Gemma 4 | Hugging Face |

El repositorio indica que todos los ficheros, salvo el README, coinciden con la release publica sinhala-mmlu/gemma-4-e4b-sinhala-mmlu en la etiqueta v2.0.0, verificable mediante `SHA256SUMS`. No se dispone de datos de otros envios del shared task SinhalaMMLU ni de modelos comparables de ~8B ajustados a cingales en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a items de opcion multiple de SinhalaMMLU; no se documenta el rendimiento en otras tareas ni cuanto se degradan las capacidades generales del modelo base tras la interpolacion.
- Sin evaluaciones de sesgo, toxicidad o seguridad: no hay datos publicados sobre sesgos de genero, casta, religion o etnicos en cingales.
- Riesgo de alucinacion en razonamientos largos: el presupuesto de 7.168 tokens de thinking aumenta la probabilidad de cadenas plausibles pero incorrectas, y el voto mayoritario no elimina errores correlacionados entre las 8 muestras.
- Cobertura linguistica limitada: solo `si` y `en` estan documentados; el rendimiento fuera de cingales e ingles no esta avaliado.
- Coste de inferencia elevado: 8 generaciones greedy con opciones barajadas y presupuesto de razonamiento alto implican un coste por pregunta muy superior al de una decodificacion simple.
- Licencia: aunque la model card declara Apache 2.0, remite a la licencia Gemma 4; es necesario revisar `LICENSE`, `NOTICE` y `MODIFICATIONS.md`, ya que los terminos de Gemma pueden imponer restricciones adicionales de uso aceptable no cubiertas por Apache 2.0.
- Procedencia de los datos: el entrenamiento usa trazas de un modelo profesor y el repositorio del equipo incluye una divulgacion de modelos cerrados; conviene revisar esa divulgacion antes de un uso comercial.
- Validacion comunitaria practicamente nula: 0 descargas y 0 likes, repositorio creado y actualizado el 2026-10-28, sin informes independientes de terceros.
- Longitud de contexto del modelo base no confirmada en la informacion disponible; el limite practico del pipeline viene impuesto por el presupuesto de razonamiento y por la VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinhalaMMLU-SharedTask/team-rexx-gemma-4-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del equipo con `inference.py` y divulgacion: https://huggingface.co/SinhalaMMLU-SharedTask/team-rexx
- Release publica con model card completa y benchmarks: https://huggingface.co/sinhala-mmlu/gemma-4-e4b-sinhala-mmlu
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
