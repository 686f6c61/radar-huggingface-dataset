# malkolm777/zils-lite-s14

## Resumen

zils-lite-s14 es un modelo de decisión (decision model) publicado por el usuario malkolm777 en Hugging Face, construido sobre el cuerpo base vllm-sr/d3-lite, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B. No es un modelo generativo de propósito general, sino un clasificador/decididor especializado en tareas de elección entre opciones (estilo examen de opción múltiple, clasificación de intención, function calling y otras tareas del pool de decisión de la subred Zils 127). Su pipeline declarado en Hugging Face es `feature-extraction` y su licencia es Apache-2.0.

El modelo tiene 852.985.920 parámetros (según los pesos en safetensors) y un repositorio de 1,7 GB. Se ha obtenido por destilación: el autor promedió de forma uniforme dos cuerpos lite públicos del mismo pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc) para producir el cuerpo base d3-lite, y después aplicó un único pase de LoRA (rango 64, AdamW con lr 5e-5, 1 época, semilla 553) sobre unas 25.000 filas.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequeños y especializados, derivados de familias abiertas como Qwen3.5, entrenados para una tarea concreta de decisión con objetivos suaves (soft targets) y publicados con licencia permisiva. Para desarrolladores e investigadores, representa un caso de estudio de destilación de bajo coste y de adaptación de un modelo base de ~0,8B a un formato de decisión estructurado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen/Qwen3.5-0.8B), adaptado como modelo de decisión; requiere `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del cuerpo base vllm-sr/d3-lite, que el autor identifica como perteneciente a la familia Qwen/Qwen3.5-0.8B: un transformer decoder-only de aproximadamente 0,85B parámetros. Sobre ese cuerpo se aplica un adaptador LoRA de rango 64 entrenado con AdamW (lr 5e-5), una sola época y semilla 553. El modelo se empaqueta con código personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code` y la implementación específica del autor.

El conjunto de entrenamiento consta de unas 25.000 filas: filas de datasets públicos en el formato de decisión del pool (mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups, function calling de glaive y tareas de BIG-bench) más los exámenes semilla públicos Zils v1/v2/v4. Los ítems de estilo examen fueron redactados y verificados por un LLM a partir de filas del split de entrenamiento. Los objetivos son suaves: 0,5 × la distribución de respuestas del profesor + 0,5 × la etiqueta gold, una técnica de destilación que suaviza la señal de supervisión y mejora la calibración en tareas de clasificación.

## Capacidades

- Decisión entre opciones: selección de la respuesta correcta en ítems de estilo examen (formato del pool Zils).
- Clasificación de intención y texto: entrenado con datos de banking77, clinc150, glue, tweet_eval y 20newsgroups.
- Razonamiento de sentido común y lógico: datos de commonsense_qa, anli y tareas de BIG-bench.
- Aritmética y problemas verbales: datos de gsm8k y SVAMP.
- Function calling / tool calling: datos de glaive function calling y When2Call.
- Análisis de sentimiento y sarcasmo: poem_sentiment, iSarcasm y titulares de sarcasmo.
- No se documentan capacidades generativas abiertas, visión, audio ni modo thinking; el pipeline declarado es `feature-extraction` y la naturaleza del modelo es de decisión.

## Casos de uso

- Clasificación de intención en asistentes conversacionales: el modelo puede asignar una consulta de usuario a una de las intenciones predefinidas de un catálogo tipo banking77 o clinc150, aprovechando que fue entrenado explícitamente con esos datasets en formato de decisión.
- Enrutamiento de function calling: dado un mensaje y un conjunto de herramientas disponibles (formato When2Call / glaive), el modelo decide qué función invocar o si no debe invocarse ninguna, lo que permite construir un despachador ligero previo a un LLM mayor.
- Filtrado y moderación de contenido: con datos de tweet_eval, iSarcasm y titulares, puede clasificar sentimiento, ironía o toxicidad en pipelines de moderación de bajo coste.
- Evaluación automática de exámenes y tests: su formato nativo de ítem de opción múltiple lo hace adecuado para responder baterías de evaluación tipo MMLU o BIG-bench en entornos de investigación sobre modelos pequeños.
- Clasificación de documentos y noticias: con datos de 20newsgroups y glue, puede etiquetar temas o pares de frases (entailment, similitud) en tareas de procesamiento por lotes.
- Verificación de razonamiento aritmético simple: con datos de gsm8k y SVAMP, puede emplearse como comprobador de respuestas numéricas en cadenas de verificación dentro de sistemas multiagente.
- Componente de un ensemble de decisión: al ser un cuerpo destilado de un promedio de modelos del pool, puede integrarse como voto adicional en un sistema de agregación de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, entre 2 y 4 GB según longitud de secuencia y lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (no se publican pesos cuantizados, habría que generarlos).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es sobrada para fp16; también cabe en GPUs de 8 GB e incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU consumer: sí, con amplio margen; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI, y el uso de `custom_code` complica la conversión a GGUF.
- Latencia y throughput estimados: no disponibles; por el tamaño (~0,85B) se espera una latencia de decenas de milisegundos por ítem en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-s14 (malkolm777) | 852.985.920 | no disponible | Decisión / clasificación | Apache-2.0 | Hugging Face, 0 descargas |
| vllm-sr/d3-lite (modelo base) | no disponible | no disponible | Decisión | no disponible | Hugging Face |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Decisión (pool Zils) | Apache-2.0 | Hugging Face |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Decisión (pool Zils) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión: no debe esperarse generación de texto libre de calidad; su pipeline es `feature-extraction` y su formato de salida está ligado al esquema del pool Zils.
- Requiere `custom_code` y `trust_remote_code=True`: implica ejecutar código del autor, con el riesgo de seguridad asociado; conviene auditar el código antes de usarlo en producción.
- Objetivos suaves y destilación de un promedio: la calidad depende de los profesores y del pool; no hay benchmarks publicados que la respalden.
- Sesgos: los datasets de origen (tweet_eval, 20newsgroups, banking77, etc.) introducen sesgos de dominio, idioma y demografía que no se documentan ni mitigan explícitamente.
- Riesgo de alucinación: inherente a los modelos de lenguaje pequeños; en tareas de clasificación el riesgo se manifiesta como etiquetas erróneas con alta confianza.
- Idiomas: no se declaran idiomas soportados; la mayor parte de los datasets de entrenamiento son en inglés, por lo que el rendimiento en castellano es incierto.
- Contexto: no se documenta la longitud de contexto; no debe asumirse una ventana larga.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y los datasets subyacentes pueden tener condiciones adicionales que el autor remite a LICENSE y NOTICE; conviene revisarlos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-s14
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo lite de referencia 1: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo lite de referencia 2: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
