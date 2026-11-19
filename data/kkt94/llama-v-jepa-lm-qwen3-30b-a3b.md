# kkt94/Llama-V-JEPA-LM-Qwen3-30B-A3B

## Resumen

Llama-V-JEPA-LM-Qwen3-30B-A3B es el modelo de mayor tamano de la familia Llama-V-JEPA-LM, desarrollada por el autor kkt94. Combina un codificador de video de tipo world-model, V-JEPA 2.1 (ViT-G), congelado, con el modelo de lenguaje de mezcla de expertos Qwen3-30B-A3B (30.5B parametros, aproximadamente 3.3B activos por token), unidos mediante un puente espectral que transforma cada clip de 32 fotogramas en 1.024 tokens visuales. El resultado es un modelo multimodal video-texto que responde preguntas sobre el contenido dinamico de un video.

El modelo aborda el problema de hacer que un LLM razone sobre la dinamica temporal de escenas (direccion, velocidad, orden, cambio de estado) sin necesidad de un encoder visual convencional entrenado sobre pares imagen-texto. Para ello emplea supervision contrafactual: transformaciones a nivel de pixel de videos publicos generan variantes equilibradas en respuesta cuyo valor esta fijado por construccion y solo difiere en como cambia la escena, de modo que el modelo de lenguaje aprende a leer la dinamica que el world-model codifica. Se entrena sobre 4,50 millones de muestras publicas.

Es relevante ahora porque supera en su promedio de 12 puntuaciones sobre 11 benchmarks de video a Qwen3-VL-30B-A3B (69,49 frente a 63,33), el modelo abierto de video construido sobre el mismo backbone, y tambien a otros modelos abiertos de la clase 30B, manteniendo ademas las capacidades matematicas del LLM base. El nombre empieza por "Llama" porque los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, cuya licencia exige ese prefijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3) + bridge espectral sobre encoder de video V-JEPA 2.1 (ViT-G, congelado) |
| Parametros totales | 32.399.687.680 |
| Parametros activos | Aproximadamente 3,3B por token (8 de 128 expertos por capa) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con codigo personalizado (custom_code) |

## Arquitectura y entrenamiento

La arquitectura es hibrida: un codificador de video world-model V-JEPA 2.1 con base ViT-G, que permanece congelado, se conecta al modelo de lenguaje Qwen3-30B-A3B, un transformer de mezcla de expertos con 30,5B parametros y unos 3,3B activos por token (8 de 128 expertos por capa). El puente espectral convierte cada clip de 32 fotogramas en exactamente 1.024 tokens visuales, independientemente de la resolucion de entrada, lo que mantiene fijo el coste de prefijado del lenguaje: 6,9 TFLOPs y 68 ms en una H100 por clip, frente a 15,2 TFLOPs / 104 ms (480p) y 172,1 TFLOPs / 470 ms (720p) de Qwen3-VL-30B-A3B.

El entrenamiento se basa en supervision contrafactual sobre 4,50 millones de muestras publicas: transformaciones de pixel de videos publicos producen variantes con respuestas equilibradas y fijadas por construccion que difieren unicamente en la evolucion de la escena, forzando al LLM a explotar la informacion dinamica del encoder. El coste total declarado es de 379 EFLOPs y 792 horas de H100, incluido el encoder congelado. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni la composicion exacta del dataset.

## Capacidades

- Respuesta a preguntas sobre video (video question answering) en modo texto-video-a-texto.
- Razonamiento sobre dinamica temporal: direccion, velocidad, orden de eventos y cambio de estado.
- Comprension de acciones y escenas (SSv2, PerceptionTest, NExT-QA).
- Razonamiento temporal fino y pares minimos de video (TempCompass, TemporalBench, MVP, Vinoground).
- Capacidades matematicas heredadas del LLM base (GSM8K, MATH-hard).
- Generacion de texto y razonamiento del LLM subyacente Qwen3-30B-A3B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision de imagen estatica, audio: no disponible.

## Casos de uso

- Analisis de vigilancia y seguridad: el modelo puede describir la direccion y velocidad de personas u objetos en un clip de 32 fotogramas, gracias a su supervision sobre dinamica y a los 1.024 tokens visuales fijos por clip.
- Moderacion de contenido en video: clasificacion de acciones y cambios de estado (SSv2 93,1) para detectar comportamientos no deseados en plataformas de video.
- Accesibilidad y descripcion automatica: generacion de descripciones temporales de clips para subtitulado y audiodescripcion, usando su capacidad en TempCompass y PerceptionTest.
- Analisis deportivo: seguimiento de orden de eventos y cambios de estado en jugadas, apoyado en el rendimiento en NExT-QA (82,2) y TVBench (75,0).
- Robotica e inspeccion industrial: interpretacion de secuencias de camara para verificar pasos de un proceso o el estado de una maquina, aprovechando el world-model V-JEPA para representar dinamica fisica.
- Busqueda y recuperacion video-texto: extraccion de representaciones de video para indexado semantico, dado el pipeline de feature-extraction declarado.
- Evaluacion de modelos de video: uso como referencia en benchmarks temporales (TOMATO, MVP, Vinoground) para investigacion en vision-lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados):

| Benchmark | Metrica | Llama-V-JEPA-LM-Qwen3-30B-A3B | Qwen3-VL-30B-A3B |
|---|---|---|---|
| MVBench | accuracy | 73,9 | no disponible |
| PerceptionTest | accuracy | 78,0 | no disponible |
| TVBench | accuracy | 75,0 | 61,9 |
| TempCompass | accuracy | 79,1 | no disponible |
| TOMATO | accuracy | 57,5 | 40,2 |
| MotionBench | accuracy | 59,7 | no disponible |
| NExT-QA | accuracy | 82,2 | no disponible |
| MVP | pair accuracy | 58,2 | no disponible |
| TemporalBench (binary) | accuracy | 75,8 | no disponible |
| SSv2 (multiple choice) | accuracy | 93,1 | 70,9 |
| Vinoground text | text pair accuracy | 72,8 | 51,2 |
| Vinoground video | video pair accuracy | 28,6 | no disponible |
| Promedio 12 puntuaciones | - | 69,49 | 63,33 |

Comparativas adicionales declaradas por el autor en el promedio de 12 puntuaciones: MiniCPM-V-4.7-35B-A3B 66,41; Qwen3-VL-32B-Instruct 65,87; InternVL3.5-30B-A3B 62,55. En seis conjuntos retenidos (ratios de velocidad no vistos, corpus fuente no visto, combinaciones no vistas, simulador no visto; azar 33,3) el modelo obtiene 95,65 de media, frente a 47,57-58,31 de esos cuatro modelos. En tareas de lenguaje: GSM8K 88,7 frente a 88,8 de Qwen3-30B-A3B; MATH-hard 60,0 frente a 57,6.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Los pesos suman 32,4B parametros y el repo ocupa 64,8 GB, lo que implica al menos ~65 GB en precision de entrenamiento (bf16/fp16) para cargar los pesos completos.
- GPU recomendadas: H100 para el coste declarado de prefijado (68 ms por clip); A100 80 GB como minimo practico para bf16; multiples GPU para servir con comodidad.
- Consumer GPU: no cabe en tarjetas consumer en bf16 por tamano de pesos; requeriria cuantizacion, no documentada en la informacion disponible.
- Opciones de despliegue: transformers con codigo personalizado (custom_code); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: 6,9 TFLOPs y 68 ms por clip de 32 fotogramas en una H100 para el prefijado del lenguaje; el resto de metricas no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Promedio 12 puntuaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-30B-A3B | 32,4B (3,3B activos) | no disponible | 69,49 | Apache-2.0 | Hugging Face |
| Qwen3-VL-30B-A3B | clase 30B MoE | no disponible | 63,33 | no disponible | abierto |
| MiniCPM-V-4.7-35B-A3B | clase 35B MoE | no disponible | 66,41 | no disponible | abierto |
| Qwen3-VL-32B-Instruct | 32B | no disponible | 65,87 | no disponible | abierto |
| InternVL3.5-30B-A3B | clase 30B MoE | no disponible | 62,55 | no disponible | abierto |

## Limitaciones y advertencias

- Idioma: solo ingles declarado; no hay soporte multilingue documentado.
- Vinoground video: 28,6 de precision en pares de video, considerablemente por debajo del resto de metricas, lo que sugiere dificultad con discriminacion de pares de video muy finos.
- TOMATO (57,5) y MotionBench (59,7) son las metricas mas bajas, indicando margen de mejora en razonamiento temporal complejo y movimiento.
- Los benchmarks son declarados por el autor y figuran como no verificados (verified: false); no hay validacion independiente.
- El encoder V-JEPA 2.1 esta congelado y el modelo solo procesa video; no se documentan capacidades de imagen estatica, audio ni tool calling.
- Longitud de contexto no documentada: riesgo para conversaciones multi-turno largas o videos de mas de 32 fotogramas por clip.
- Requiere codigo personalizado (custom_code) en transformers; puede no ser compatible con todos los runtimes de inferencia.
- Riesgo de alucinacion inherente a los LLM, no cuantificado en la informacion disponible; en dominios de video puede inventar eventos no presentes.
- La licencia Apache-2.0 permite uso comercial, pero el prefijo "Llama" es obligatorio por la licencia de PLM-Video-Human; conviene revisar los terminos de ese dataset si se redistribuye.
- Con solo 2 likes y 0 descargas en Hugging Face, no hay evidencia de uso en produccion ni de soporte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-30B-A3B
- Paper: https://arxiv.org/abs/2611.17831
- Codigo e informe tecnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (variante 8B): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
