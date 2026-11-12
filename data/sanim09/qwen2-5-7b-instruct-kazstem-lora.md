# Sanim09/Qwen2.5-7B-Instruct-KazSTEM-LoRA

## Resumen

Qwen2.5-7B-Instruct-KazSTEM-LoRA es un adaptador LoRA desarrollado por el usuario Sanim09 sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Su proposito no es mejorar las capacidades generales del modelo, sino servir como artefacto de investigacion para medir si el ajuste fino sobre preguntas de tipo test de STEM en kazajo (nivel de secundaria) transfiere a un benchmark estandar como KazMMLU. El adaptador se entrena para responder con una unica letra (A-E) a preguntas de matematicas, fisica, quimica, biologia e informatica en kazajo.

El modelo base Qwen2.5-7B-Instruct es un transformer denso de 7.000 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto de 128.000 tokens y licencia Apache 2.0. Sobre el se aplica un adaptador LoRA de rango 16 entrenado unicamente sobre 1.408 preguntas del dataset Sanim09/kazakh-stem-mcq-2000, con el objetivo de predecir la letra correcta mediante entropia cruzada sobre el primer token de respuesta.

La relevancia del adaptador es metodologica: demuestra que el ajuste fino eleva la precision en preguntas del mismo estilo que el conjunto de entrenamiento (+18,1 puntos) pero no mejora el rendimiento en KazMMLU (-0,8 puntos, intervalo de confianza que incluye el cero). Es, por tanto, una pieza util para investigadores interesados en transferencia de aprendizaje, evaluacion de benchmarks y sesgos de respuesta en modelos multilingues, no una mejora lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (modelo base); adaptador LoRA de rango 16 sobre proyecciones q, k, v, o, gate, up y down |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5) |
| Idiomas soportados | kazajo (kk); el modelo base soporta multiples idiomas, pero el adaptador esta entrenado solo para kazajo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors o formato compatible con transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion por causalidad estandar. La configuracion LoRA utiliza rango 16, alpha 16, dropout 0, y se inserta en las proyecciones de atencion (q, k, v, o) y en las proyecciones del bloque feed-forward (gate, up, down). El entrenamiento se realizo con AdamW, learning rate 2e-4, warm-up del 5% seguido de decaimiento lineal, batch efectivo de 8 (4 x 2 acumulacion) y 2 epocas, conservando la epoca con mejor precision de validacion. La precision fue float16 para el modelo base, float32 para los pesos del adaptador y gradient checkpointing, sobre 2 GPU NVIDIA T4 en Kaggle.

Los datos de entrenamiento consisten en 1.408 preguntas del dataset Sanim09/kazakh-stem-mcq-2000 (rol "train"), 169 para validacion y 413 reservadas para test, con 10 excluidas por similitud con KazMMLU. El objetivo de entrenamiento es la letra de respuesta unicamente, con entropia cruzada sobre el primer token de la respuesta. Las preguntas fueron en parte redactadas por IA y revisadas por una persona. No se aplico RLHF ni DPO; el ajuste es supervisado y especifico para la tarea de seleccion multiple.

## Capacidades

- Generacion de texto y respuesta a preguntas de tipo test en kazajo con una unica letra (A-E).
- Razonamiento de nivel de secundaria en matematicas, fisica, quimica, biologia e informatica en kazajo.
- Clasificacion de opciones multiples mediante probabilidad del token de letra (no genera explicaciones).
- No soporta tool calling ni function calling de forma nativa en el adaptador (aunque el modelo base si lo hace).
- No esta disenado para agentes ni razonamiento multi-paso; el adaptador solo emite la letra.
- Capacidades multilingues limitadas al kazajo para la tarea ajustada; el modelo base conserva sus capacidades originales si se usa sin el adaptador.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Evaluacion de transferencia de aprendizaje: utilizar el adaptador para reproducir el experimento del autor y medir si el ajuste fino en preguntas sinteticas de STEM transfiere a KazMMLU, comparando con el modelo base sin adaptador.
- Investigacion sobre sesgos de respuesta: analizar el sesgo hacia la letra "D" que el autor documenta tras el ajuste fino en preguntas de 4 opciones de KazMMLU, y estudiar tecnicas de correccion sin usar la clave de respuestas.
- Generacion de preguntas de test educativo en kazajo: el adaptador puede servir como referencia para validar la calidad de preguntas de STEM de secundaria, comparando su respuesta con la clave.
- Prototipado de sistemas de evaluacion automatica: integrar el adaptador en un pipeline que, dado un banco de preguntas en kazajo, devuelva la letra predicha para comparar con la respuesta correcta y calcular metricas por asignatura.
- Estudio de eficiencia de LoRA: emplear la configuracion (r=16, alpha=16, 2 epocas, 1.408 ejemplos) como linea base para experimentos de ajuste fino con pocos datos en lenguas de bajos recursos.
- Analisis por asignatura: usar los resultados desglosados (Mathematics +26,0; Informatics +31,5; Biology +4,0 en el conjunto held-out) para identificar en que materias el ajuste fino es mas efectivo y disenar experimentos dirigidos.
- Docencia e investigacion en PLN para kazajo: servir como ejemplo reproducible de entrenamiento y evaluacion con licencia Apache 2.0 y datos CC BY 4.0, adecuado para cursos y trabajos academicos.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. La evaluacion es zero-shot, con el mismo prompt para todos los tests, y la respuesta se elige por la mayor probabilidad de la letra entre las opciones presentes. El intervalo es un intervalo bootstrap del 95% sobre las preguntas.

| Test | Modelo base | Este adaptador (semilla 1) | Media de 3 semillas | Cambio, media de 3 semillas (IC 95%) |
|---|---|---|---|---|
| Kazakh STEM MCQ 2000, 413 preguntas held-out | 43,3% | 61,7% | 61,4% | +18,1 (+13,2 a +22,8) |
| KazMMLU Kazakh STEM (4.174) | 47,0% | 45,4% | 46,2% | -0,8 (-2,4 a +0,8) |
| KazMMLU Kazakh no-STEM (2.045) | 36,9% | 37,6% | 37,5% | +0,6 (-1,5 a +2,7) |

Desglose por asignatura (cambio en puntos, media de 3 semillas):

| Asignatura | Preguntas held-out | KazMMLU |
|---|---|---|
| Matematicas | +26,0 | +0,9 |
| Fisica | +21,8 | -1,5 |
| Quimica | +13,3 | -0,2 |
| Biologia | +4,0 | -2,7 |
| Informatica | +31,5 | +0,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-7B-Instruct en float16 requiere aproximadamente 14-16 GB de VRAM; el adaptador LoRA anade una cantidad marginal (el repositorio ocupa 0,2 GB). En cuantizacion de 4 bits, el modelo base puede ocupar alrededor de 4-5 GB.
- GPU recomendadas: el autor entreno y evaluo en 2 x NVIDIA T4 (16 GB cada una). Para inferencia en float16 se recomienda al menos una GPU con 16 GB (T4, V100, A10, RTX 4090). Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en float16 (RTX 4090, RTX 4080, RTX 3090) o en tarjetas con 8 GB si se cuantiza el modelo base a 4 bits.
- Opciones de despliegue: transformers con peft (metodo documentado por el autor), vLLM o TGI para el modelo base fusionado con el adaptador, llama.cpp u Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que probo con transformers 5.20.2, peft 0.21.2 y torch 2.11 en dos T4, sin reportar metricas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-KazSTEM-LoRA (este) | 7.000 M + LoRA r=16 | 128.000 | Ajuste fino especifico para MCQ de STEM en kazajo | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen2.5-7B-Instruct (base) | 7.000 M | 128.000 | Modelo generalista multilingue con tool calling | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptadores LoRA para kazajo de otros autores | no disponible | no disponible | Ajuste fino para tareas en kazajo | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos comparables especificos para kazajo en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- El adaptador esta entrenado para emitir una letra con un unico prompt fijo; no es una mejora de chat ni de razonamiento general.
- Las ganancias se limitan a preguntas similares al conjunto de entrenamiento; no transfieren a KazMMLU en ninguno de los modelos probados.
- Las preguntas de entrenamiento fueron en parte redactadas por IA y verificadas por una sola persona, lo que introduce posible ruido y sesgo en las etiquetas.
- Se documenta un sesgo hacia la letra "D" en preguntas de 4 opciones de KazMMLU tras el ajuste fino; corregirlo sin usar la clave de respuestas no cambia el resultado en KazMMLU.
- Biologia es la asignatura con menor ganancia en ambos conjuntos, lo que sugiere menor calidad o cobertura de datos en esa materia.
- El adaptador solo cubre kazajo; no se debe esperar buen rendimiento en otros idiomas sin reentrenar.
- Riesgo de alucinacion: aunque la tarea es de clasificacion de letra, el modelo base puede generar texto no solicitado si no se restringe la decodificacion a las letras.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador es un artefacto de investigacion sin validacion en produccion; no se recomienda desplegarlo como sistema de evaluacion automatica sin auditoria previa.
- El repositorio no registra descargas ni likes, y fue creado y actualizado el mismo dia (12 de noviembre de 2026), lo que indica ausencia de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanim09/Qwen2.5-7B-Instruct-KazSTEM-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Sanim09/kazakh-stem-mcq-2000
- Codigo y resultados por pregunta: https://github.com/sanim-science/kazakh-stem-llm
