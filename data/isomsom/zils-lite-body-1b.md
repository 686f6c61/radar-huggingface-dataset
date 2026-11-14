# isomsom/zils-lite-body-1b

## Resumen

Zils d3-lite soup body es un ajuste fino (fine-tune) de tipo LoRA fusionado sobre un promedio uniforme de dos "soup bodies" de la familia d3-lite: Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos derivados a su vez de Qwen3.5-0.8B. Lo desarrolla el usuario isomsom y se publica bajo licencia Apache 2.0. El modelo tiene 852.985.920 parametros (aproximadamente 0,85 mil millones) y se distribuye en formato safetensors en bf16, con un tamano de repositorio de 1,7 GB.

El objetivo declarado es el ajuste orientado a tareas de decision estilo examen: preguntas de opcion multiple, si/no y escala de 5 niveles, con una cabeza de lectura (readout) congelada del pipeline d3-lite. Se entrena mediante cuatro ejecuciones LoRA independientes (semillas 0 a 3) cuyos deltas se promedian y se escalan por 1,5 antes de sumarse al promedio de los pesos base. La torre de vision procede intacta del modelo base Qwen3.5-0.8B.

Es relevante ahora porque ilustra una practica emergente: la composicion de modelos pequenos mediante model soups y fusion de deltas LoRA para especializar tareas concretas sin reentrenar desde cero, manteniendo un coste de inferencia muy bajo y una licencia permisiva. No obstante, la informacion publicada es escasa en cuanto a benchmarks, idiomas y evaluacion cuantitativa, y el modelo registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B), ajuste LoRA fusionado con readout d3-lite |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5, en su variante de 0,8 mil millones de parametros, con una torre de vision heredada sin modificar del modelo base. Sobre ese esqueleto se aplica un pipeline d3-lite con una "cabeza de lectura" (code readout) congelada que interpreta las distribuciones de probabilidad sobre opciones de respuesta, en lugar de generar texto libre. Los pesos finales resultan de promediar uniformemente los dos soup bodies de partida y sumar 1,5 veces el delta LoRA medio.

El entrenamiento consistio en cuatro ejecuciones LoRA con rango 32, alpha 64 y los modulos objetivo oficiales de d3, con semillas 0 a 3. Cada ejecucion uso entropia cruzada suave sobre las probabilidades de las opciones, AdamW con learning rate 8e-5 y schedule lineal, durante una epoca de aproximadamente 530 pasos con 4 ejemplos por paso. Los datos incluyen unos 1.600 items nuevos de estilo examen (opcion multiple, si/no y escala de 5 niveles) redactados por Claude siguiendo la guia de `scripts/author_exam.py`, inspirados en filas del split TRAIN de Social IQa, PIQA, MNLI, RTE, CxC-STS, 20 Newsgroups, QNLI, glaive-function-calling-v2, dair-ai/emotion, titulares de sarcasmo, tweet_eval sentiment y tareas de BIG-bench; los objetivos se suavizan a 0,85/0,15. Ademas se anaden unas 500 filas ancla por ejecucion, con la distribucion de respuesta del soup mezclada al 15% con la respuesta gold. La fusion final promedia los cuatro deltas (alpha/r · B@A) y se almacena en bf16.

## Capacidades

- Clasificacion y decision sobre opciones discretas: preguntas de opcion multiple, si/no y escala de 5 niveles mediante la cabeza de lectura d3-lite.
- Extraccion de caracteristicas (pipeline `feature-extraction` declarado en Hugging Face), apta para representaciones internas.
- Procesamiento multimodal limitado: conserva la torre de vision del Qwen3.5-0.8B base, aunque la model card no documenta tareas de vision especificas.
- Razonamiento de sentido comun y fisico heredado de los datos de entrenamiento (Social IQa, PIQA).
- Inferencia de relaciones textuales (MNLI, RTE, QNLI) y similitud semantica (CxC-STS).
- Clasificacion de emociones y sentimiento (dair-ai/emotion, tweet_eval sentiment) y deteccion de sarcasmo.
- Soporte de function calling en la distribucion de entrenamiento (glaive-function-calling-v2), sin que se documente una interfaz de tool calling en produccion.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio o agentes multi-paso: no disponibles.

## Casos de uso

- Evaluacion automatizada tipo examen: el modelo puede puntuar items de opcion multiple y escalas Likert usando la cabeza de lectura, lo que encaja en plataformas de evaluacion educativa o benchmarks internos que requieran decisiones discretas calibradas.
- Moderacion y clasificacion de contenido: gracias al entrenamiento sobre sentimiento, emociones y sarcasmo, puede etiquetar comentarios de usuario en categorias predefinidas con una salida de distribucion de probabilidad en lugar de texto libre.
- Enrutamiento de intenciones en asistentes: al haberse entrenado con datos de function calling, puede emplearse como clasificador ligero que decida que herramienta o accion corresponde a una consulta, con coste de inferencia minimo (menos de 1B de parametros).
- Filtrado y triaje en pipelines RAG: la extraccion de caracteristicas permite generar embeddings o puntuaciones de relevancia para descartar documentos antes de pasarlos a un modelo mayor.
- Investigacion sobre model soups y fusion LoRA: sirve como caso reproducible para estudiar como interactuan el promediado de pesos y la fusion de deltas en modelos pequenos, comparando con los checkpoints de origen.
- Prototipado en hardware de consumo: con 0,85B de parametros en bf16 (1,7 GB), cabe en GPU de gama media y permite iterar rapidamente en tareas de decision sin infraestructura dedicada.
- Evaluacion de sentido comun en agentes: los items derivados de PIQA y Social IQa permiten usarlo como sonda ligera para medir razonamiento fisico y social en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,7 GB solo para pesos; con overhead de activaciones y contexto, entre 2,5 y 4 GB segun longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (cuantizaciones no publicadas por el autor, requeririan conversion propia).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de escritorio o portatil con 4 GB o mas.
- Opciones de despliegue: transformers (libreria declarada, requiere `trust_remote_code` por el tag `custom_code`); vLLM, llama.cpp, Ollama y TGI no estan documentados para este checkpoint y su compatibilidad no esta confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| isomsom/zils-lite-body-1b | 852.985.920 | no disponible | Apache 2.0 | Decision tipo examen sobre soup d3-lite |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Modelo base generativo multimodal |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache 2.0 | Soup body d3-lite de origen |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache 2.0 | Soup body d3-lite de origen |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible, ya que ninguno de los checkpoints de referencia publica resultados de benchmarks en la informacion consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; los datos de entrenamiento (redes sociales, noticias, datasets de NLP en ingles) pueden introducir sesgos de dominio y de idioma.
- Riesgo de alucinacion: el modelo opera con una cabeza de lectura sobre opciones, lo que reduce la generacion libre, pero las distribuciones de probabilidad pueden estar mal calibradas fuera de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada y los idiomas soportados no se especifican; los datasets de entrenamiento son mayoritariamente en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de los modelos base y de sus autores.
- Dependencia de `custom_code`: el tag indica que la carga requiere codigo remoto, lo que implica revisar y confiar en el codigo del repositorio antes de desplegarlo en produccion.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin evaluacion independiente; no se recomienda para produccion sin una validacion propia.
- Naturaleza experimental: al ser una fusion de soups y deltas LoRA con un readout congelado, el comportamiento fuera de las tareas de decision (generacion abierta, agentes) es incierto y no esta documentado.
- Incompatibilidad potencial: al no publicarse cuantizaciones GGUF ni confirmarse soporte en vLLM, Ollama o TGI, el despliegue queda limitado de facto a transformers con `trust_remote_code`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isomsom/zils-lite-body-1b
- Modelo base Charlie320/zils-lite-v9a: https://huggingface.co/Charlie320/zils-lite-v9a/tree/93b064048a7aeb7cf0d64236136e12c903e67f40
- Modelo base qhoenix/zils-lite-decision-v9: https://huggingface.co/qhoenix/zils-lite-decision-v9/tree/083d5b9aa3d2db48155cd6e7f92ac6f9aa057c65
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
