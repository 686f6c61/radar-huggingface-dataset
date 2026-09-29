# NovelAI/novelai-lm-3b-508k

## Resumen
NovelAI-LM-3B-508k es el modelo base sobre el que se construyo Clio, el modelo de generacion de texto de NovelAI. Se trata de un transformer decoder-only de 3.043.786.240 parametros (aproximadamente 3,04 mil millones) entrenado por NovelAI sobre su dataset interno denominado Nerdstash, con una ventana de contexto de 2048 tokens. Segun la model card, en el momento del lanzamiento de Clio este modelo base era el estado del arte para su tamano segun las metricas de evaluacion propias de NovelAI.

El modelo no esta afinado especificamente para narracion, sino que se distribuye como base generica, por lo que puede servir como punto de partida para tareas de ajuste fino. Su arquitectura encaja en una clase de modelo ya existente dentro de Hugging Face Transformers (etiquetada como stablelm) una vez activado un flag adicional de configuracion, de modo que no requiere codigo personalizado para ejecutarse.

La relevancia actual es mas bien historica y de investigacion: esta etiquetado como "legacy" en el propio repositorio y su licencia GPL-2.0 limita el uso comercial cerrado. Se distribuye en formatos safetensors y GGUF, lo que facilita su ejecucion en herramientas de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia StableLM (segun el tag "stablelm"); compatible con Transformers mediante un flag de configuracion |
| Parametros totales | 3.043.786.240 (aprox. 3,04 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors y GGUF, pero no se detallan los niveles de cuantizacion concretos) |
| Idiomas soportados | ingles (en) |
| Licencia | GPL-2.0 |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 30,1 GB |
| Pipeline | text-generation |
| Biblioteca | transformers |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 3,04 mil millones de parametros con una longitud de contexto de 2048 tokens. Por el tag "stablelm" se corresponde con la familia de arquitecturas StableLM, y la model card indica que encaja en una clase de modelo ya presente en Hugging Face Transformers al activar un flag de configuracion adicional, por lo que no hace falta codigo propio para cargarlo y ejecutarlo.

El entrenamiento se realizo sobre el dataset propietario Nerdstash de NovelAI, con un tamano de contexto de 2048 tokens. La model card no especifica el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; esa informacion figura como no disponible. El modelo tampoco esta afinado especificamente para generacion de historias, y segun el autor era el estado del arte para su tamano en el momento del lanzamiento de Clio conforme a sus propias metricas de evaluacion.

## Capacidades
- Generacion de texto autoregresiva y continuacion de prompts (text-generation / completion).
- Modelo base sin afinado especifico, pensado como punto de partida para ajuste fino en tareas concretas.
- Capacidad de narrativa generica (no optimizada para storytelling, segun la propia model card).
- Ejecucion local eficiente gracias a la publicacion de pesos en formato GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Idiomas: unicamente ingles. No se declara soporte multilingue.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso
- Ajuste fino para generacion de narrativa: al ser un modelo base de NovelAI, se puede afinar sobre corpus de ficcion o dominios concretos para producir texto creativo, aprovechando sus 3,04 mil millones de parametros y su ventana de 2048 tokens.
- Base de investigacion sobre modelos de 3B: util para estudiar comportamiento de decodificacion, escalado y tecnicas de ajuste en modelos de tamano medio en ingles.
- Generacion de texto en local con llama.cpp u Ollama: los pesos GGUF permiten desplegar el modelo en equipos sin GPU dedicada de gama alta.
- Prototipado de completado de texto en ingles: integrable en editores, herramientas de autocompletado o asistentes de redaccion sencillos en ingles.
- Fine-tuning de dominio (legal, medico, tecnico): sirve como checkpoint inicial para adaptar el estilo y vocabulario a un corpus especializado en ingles.
- Experimentacion con decodificacion y sampling: util como banco de pruebas para comparar estrategias de muestreo y temperatura en modelos de ~3B.
- Generacion de datos sinteticos en ingles para entrenar modelos menores: el modelo puede producir corpus de texto de forma masiva sin coste de API externa, dentro de los limites de la licencia GPL-2.0.
- Reproduccion de pipelines legacy de NovelAI: para replicar o comparar el comportamiento de la base de Clio en entornos de investigacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existia una grafica de metricas propias de NovelAI (enlazada como imagen) y afirma que el modelo era SOTA para su tamano en el momento del lanzamiento de Clio, pero no se incluyen valores numericos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar. La propia model card senala que comparar el modelo con modelos de completado mas recientes es dificil porque el conjunto comun de metricas de evaluacion ha cambiado desde entonces.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16, en torno a 3-3,5 GB en cuantizacion de 8 bits y cerca de 2 GB en cuantizacion de 4 bits (estimaciones para un modelo de 3,04 mil millones de parametros; los niveles GGUF concretos publicados no se detallan).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16 (por ejemplo RTX 3060 12 GB, RTX 3080, RTX 4070, RTX 4090); para despliegue a gran escala, A100 o H100 con vLLM o TGI.
- Cabe en GPU de consumo: si. Modelos de 3B suelen ejecutarse comodamente en GPUs consumer de 8-12 GB, e incluso en FP16 en tarjetas de 8 GB con margen ajustado.
- Opciones de despliegue: transformers (carga nativa), llama.cpp y Ollama mediante los pesos GGUF; vLLM y TGI para servido en GPU de centro de datos. El repositorio es compatible con los endpoints de Hugging Face (tag endpoints_compatible).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NovelAI-LM-3B-508k | 3,04 mil millones | 2048 tokens | ingles | GPL-2.0 | safetensors, GGUF |
| StableLM-3B-4E1T | aprox. 3 mil millones | 4096 tokens | ingles (principalmente) | licencia propia de Stability AI | safetensors (datos a verificar) |
| Phi-2 | 2,7 mil millones | 2048 tokens | ingles | MIT | safetensors (datos a verificar) |

Los datos de los modelos comparativos deben confirmarse en sus respectivas model cards. La comparativa de rendimiento con alternativas no esta disponible porque el autor no publica valores numericos de benchmarks en la informacion proporcionada, y la propia model card advierte que las metricas de evaluacion de NovelAI han cambiado con el tiempo, lo que dificulta la comparacion directa con modelos de completado mas recientes.

## Limitaciones y advertencias
- Modelo etiquetado como "legacy" por el propio autor, lo que sugiere que no recibe mantenimiento ni actualizaciones.
- Ventana de contexto limitada a 2048 tokens, inferior a la de muchos modelos actuales de tamano similar.
- Soporte exclusivo de ingles; no se declara capacidad multilingue.
- No esta afinado para ninguna tarea especifica, por lo que su rendimiento en tareas concretas dependera del ajuste fino posterior.
- La licencia GPL-2.0 es copyleft: puede imponer obligaciones sobre el codigo derivado y dificultar su integracion en productos comerciales de codigo cerrado. Debe revisarse con atencion antes de cualquier uso en produccion.
- Riesgo de alucinacion: no hay datos especificos publicados; se asume el comportamiento tipico de un modelo de lenguaje de 3B sin alineacion documentada (no se declara RLHF ni DPO).
- Sesgos conocidos: no disponible en la informacion proporcionada.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines de agentes sin desarrollo adicional.
- El repositorio no registra descargas ni "likes" y el modelo es de tipo base, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/NovelAI/novelai-lm-3b-508k
- Modelo Clio (derivado, base sobre este checkpoint): https://huggingface.co/NovelAI/clio-v1-legacy
- Grafica de metricas citada en la model card: https://journal.novelai.net/_astro/a-new-model-clio-is-coming-to-opus-02.BJhXFqj8_1qVbgI.png
- Journal de NovelAI (notas de version y anuncios de modelos): https://journal.novelai.net/
- Blog de NovelAI: https://blognew.novelai.net/
- Sitio oficial de NovelAI: https://novelai.net/
