# Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-FP4` es una cuantizacion FP4 weight-only en formato safetensors de la variante "uncensored" de `Qwen3.6-35B-A3B`, un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado originalmente por Alibaba Qwen y posteriormente modificado por la comunidad (HauhauCS) para eliminar la negativa a responder contenido sensible. El autor del repo, Rin247, aplica un proceso de "abliteration" (proyeccion ortogonal de la direccion de rechazo) antes de cuantizar, dando lugar a un modelo sin censura y optimizado para inferencia en hardware con memoria limitada.

El modelo base cuenta con aproximadamente 35.000 millones de parametros totales, de los cuales unos 3.000 millones se activan por paso (arquitectura MoE con atencion hibrida: 3 partes de atencion lineal por 1 de atencion softmax completa). La cuantizacion FP4 reduce el peso de los tensores a 4 bits, lo que permite ejecutar el modelo en GPUs de consumo medio con un consumo de VRAM significativamente menor que la version en FP16. El contexto soportado alcanza los 262.000 tokens segun la documentacion del modelo base, aunque la cuantizacion puede afectar a la fidelidad en ventanas muy largas.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece una alternativa sin restricciones para tareas de generacion creativa o investigacion que requieran explorar contenidos no filtrados; por otro, su formato FP4 lo hace accesible para despliegue local en equipos con una unica GPU de 24 GB o menos, algo poco comun en modelos de este tamano. No obstante, hay que tener en cuenta que se trata de una cuantizacion agresiva y que la licencia no esta especificada, lo que limita su uso en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (atencion lineal + softmax, proporcion 3:1) |
| Parametros totales | 33.945.571.968 (~33,95 B) |
| Parametros activos | ~3 B (segun nombre del modelo y documentacion base) |
| Longitud de contexto | 262.000 tokens (segun documentacion del modelo base) |
| Tipos de cuantizacion | FP4 (weight-only, RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con buffers de escala y forma (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-35B-A3B` es un transformer MoE con atencion hibrida: combina atencion lineal (lineal attention) y atencion softmax completa en una proporcion 3:1, lo que reduce el coste computacional en secuencias largas manteniendo la capacidad de modelado. La variante "uncensored" fue obtenida mediante un proceso de abliteration, que consiste en identificar y eliminar la direccion de rechazo (refusal direction) en el espacio de activaciones mediante una proyeccion ortogonal, de modo que el modelo deja de negarse a responder a solicitudes que normalmente estarian bloqueadas.

Sobre esta base, Rin247 aplico una cuantizacion FP4 weight-only utilizando PyTorch RTN (Round-to-Nearest) ejecutada en CPU. Los pesos se almacenan en formato FP4 junto con escalas y formas auxiliares que permiten reconstruir los valores originales durante la inferencia. Este enfoque no requiere calibracion con datasets, lo que simplifica el proceso, pero puede provocar una perdida de precision mayor que metodos mixtos como GPTQ o AWQ. Los archivos resultantes son compatibles con la libreria transformers, aunque requieren un paso de dequantizacion antes de ser alimentados a un motor de inferencia estandar.

## Capacidades

- Generacion de texto libre y conversacional, sin filtros de contenido ni negativas a responder.
- Razonamiento y comprension de contexto largo (hasta 262.000 tokens en el modelo base).
- Soporte multilingue probable (heredado de Qwen3.6), aunque no hay datos oficiales para esta variante.
- Capacidad de codigo y matematicas basica, derivada del entrenamiento original de Qwen3.6.
- No se han confirmado capacidades de tool calling, function calling o uso como agente en esta cuantizacion especifica.
- Compatible con pipelines de `transformers` y con motores que acepten pesos FP4 dequantizados.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, poesia o guiones sobre cualquier tema sin filtrar contenido, gracias a la abliteration. Adecuado para autores que necesitan explorar tematicas controvertidas o adultas.
- Roleplay y simulacion de personajes: al no tener rechazo, puede interpretar personajes con comportamientos extremos o dialogos subidos de tono, util en juegos de rol o prototipos de asistentes conversacionales personalizados.
- Analisis de documentos largos: con 262K de contexto, puede procesar libros completos, expedientes o informes extensos en una sola pasada, resumiendo o extrayendo informacion relevante.
- Asistente de investigacion academica: para analisis de textos cientificos o humanisticos donde se requiera una postura neutral sin sesgos de seguridad, aunque la cuantizacion FP4 puede degradar tareas de razonamiento complejo.
- Generacion de codigo con contexto amplio: puede asistir en la escritura de codigo dentro de repositorios grandes, aprovechando el contexto largo para recordar definiciones y usos previos.
- Prototipado rapido de chatbots: al ser un modelo pequeno en activaciones (~3B), permite iterar rapidamente en entornos de desarrollo con una sola GPU, aunque la calidad de las respuestas puede ser inferior a modelos densos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en FP4, el modelo ocupa aproximadamente 17 GB (33,95 B parametros × 0,5 bytes/parametro), mas overhead de activaciones y KV cache. En la practica, se recomienda una GPU con al menos 24 GB de VRAM para ejecutar el modelo completo sin offload.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A5000 o superiores. Tambien puede ejecutarse en A100 o H100 con margen adicional.
- En GPUs de 16 GB (RTX 4080, RTX 3080 Ti) es posible ejecutar con cuantizacion adicional o con offload de capas a CPU, aunque con penalizacion de rendimiento.
- Opciones de despliegue: al ser un formato FP4 weight-only con buffers de escala, no es directamente compatible con vLLM, llama.cpp o Ollama sin conversion previa. Se puede cargar con `transformers` aplicando la dequantizacion manual descrita en la model card, o convertir a un formato estandar como GGUF o GPTQ.
- Latencia y throughput: no se han publicado datos especificos. Como referencia, un MoE con 3B activos en FP4 deberia ofrecer una velocidad de generacion de entre 30 y 60 tokens por segundo en una RTX 4090, dependiendo de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 262K | FP16 | Apache 2.0 (probable) |
| Qwen3.6-27B (dense) | 27B | 27B | 262K | FP16 | Apache 2.0 (probable) |
| Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-FP4 | 33,95B | ~3B | 262K | FP4 | no disponible |
| Dolphin 3.0 (similar categoria uncensored) | no disponible | no disponible | no disponible | no disponible | no disponible |

La principal ventaja de esta variante frente al modelo base es su menor huella de memoria (FP4 vs FP16) y su ausencia de filtros. Frente al Qwen3.6-27B dense, ofrece un menor coste de inferencia gracias a los 3B activos, aunque probablemente con menor calidad en tareas de razonamiento profundo. Comparado con otros modelos uncensored como Dolphin 3.0, no hay datos publicos para una comparacion rigurosa.

## Limitaciones y advertencias

- La cuantizacion FP4 puede provocar una degradacion notable en tareas de razonamiento logico, matematicas o generacion de codigo complejo, en comparacion con el modelo en FP16.
- El proceso de abliteration elimina la negativa a responder, lo que implica que el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtro. No debe desplegarse en aplicaciones publicas sin medidas de seguridad externas.
- La licencia no esta especificada en la model card. El modelo base de Qwen3.6 podria tener licencia Apache 2.0, pero la variante modificada y su cuantizacion no declaran terminos claros, lo que impide su uso comercial seguro.
- No se dispone de informacion sobre los idiomas soportados de forma fiable; el modelo base probablemente cubre varios idiomas, pero no esta confirmado para esta cuantizacion.
- El contexto de 262K es el del modelo base; la cuantizacion FP4 puede afectar a la coherencia en ventanas muy largas debido a la perdida de precision en las atenciones.
- El formato de pesos requiere un proceso de dequantizacion manual antes de la inferencia, lo que complica su integracion en motores estandar como vLLM o TGI sin conversion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-FP4
- Coleccion de cuantizaciones de Rin247: https://huggingface.co/collections/Rin247/qwen3-aquarion
- Articulo de HackerNoon sobre Qwen3.6-35B-A3B Uncensored: https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context
- Guia de InsiderLLM sobre Qwen 3.6: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guia de InsiderLLM sobre modelos uncensored: https://insiderllm.com/guides/best-uncensored-local-llms/
