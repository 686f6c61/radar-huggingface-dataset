# AnosVoldigoad1/Qwen3.5-2B-heretic-GGUF

## Resumen

Qwen3.5-2B-heretic-GGUF es una distribucion en formato GGUF del modelo Qwen3.5-2B-heretic, un modelo de lenguaje y vision (vision-language) de aproximadamente 1.880 millones de parametros (1,88 B) construido sobre la familia Qwen3.5. El autor de esta publicacion es AnosVoldigoad1, que actua como empaquetador y cuantizador del modelo base coder3101/Qwen3.5-2B-heretic; el modelo base original procede de la familia Qwen de Alibaba. La variante "heretic" indica una version con un proceso de reduccion de rechazos (uncensoring) aplicado sobre el modelo original, orientada a disminuir las respuestas de negativa del modelo.

El repositorio proporciona dos cuantizaciones GGUF (Q8_0 y Q4_K_M) junto con el proyector de vision FP16 (mmproj-F16.gguf), lo que permite ejecutar el modelo tanto en llama.cpp como en P.AI AI Image Studio para tareas de grounding visual (localizacion de objetos mediante cajas delimitadoras 2D). El tamano compacto del modelo (menos de 2 B parametros) lo hace apto para despliegue en hardware de consumo, y su naturaleza multimodal lo diferencia de los modelos de texto puro de su misma escala.

La relevancia actual del modelo radica en la combinacion de tres factores: tamano reducido (inferencia viable en GPU consumer), capacidades de vision integradas (grounding y comprension de imagenes) y una licencia Apache 2.0 permisiva para uso comercial. No se dispone de informacion publicada sobre el proceso de entrenamiento, los datos utilizados ni los resultados de benchmarks, por lo que esta ficha se limita a los datos tecnicos verificables del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language); detalles especificos no disponibles |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M (GGUF); INT8-ConvRot en repo separado |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base; INT8-ConvRot en repo alternativo |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo vision-language de la familia Qwen3.5, con un proyector de vision separado (mmproj-F16.gguf, aproximadamente 637 MB) que se encarga de mapear las representaciones visuales al espacio del modelo de lenguaje. El modelo base coder3101/Qwen3.5-2B-heretic deriva de la arquitectura Qwen3.5, pero no se especifican en la informacion proporcionada detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni innovaciones arquitectonicas concretas (atencion lineal, decodificacion especulativa, etc.).

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o similar. La etiqueta "heretic" sugiere que el modelo base ha pasado por un proceso de ablacion o ajuste destinado a reducir las respuestas de rechazo, pero no se documentan los detalles metodologicos de dicho proceso. Tampoco se especifica si el modelo fue entrenado desde cero o si es un ajuste fino del Qwen3.5-2B original.

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational" en el repositorio).
- Comprension de imagenes y vision-language, gracias al proyector de vision incluido.
- Grounding visual: localizacion de objetos mediante coordenadas de cajas delimitadoras 2D, segun la model card (orientado a "Fast Close-up Grounding" en P.AI AI Image Studio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Grounding visual en aplicaciones de imagen: el modelo, junto con mmproj-F16.gguf, permite generar coordenadas de cajas delimitadoras 2D sobre imagenes, lo que resulta util para anotacion automatica de datasets, recorte inteligente (smart cropping) o interfaces de seleccion de objetos en editores graficos.
- Asistentes conversacionales ligeros en local: con Q4_K_M (aproximadamente 1,21 GB) el modelo puede ejecutarse en portatiles y equipos de sobremesa sin GPU dedicada mediante llama.cpp, ofreciendo un chatbot funcional sin dependencia de la nube.
- Procesamiento de imagenes en pipelines de escritorio: integrado en P.AI AI Image Studio, el modelo puede describir o localizar elementos en fotografias dentro de flujos de trabajo de edicion por lotes, aprovechando el proyector de vision FP16 para precision en coordenadas.
- Prototipado rapido de aplicaciones multimodales: al ser un modelo de menos de 2 B parametros con licencia Apache 2.0, es adecuado para experimentar con tecnicas de vision-language en entornos de investigacion con recursos limitados, sin costes de licencia.
- Filtrado y moderacion de contenido en aplicaciones locales: la variante "heretic" reduce las respuestas de rechazo, lo que puede ser util en escenarios donde se necesita un asistente directo, aunque debe evaluarse cuidadosamente el riesgo de contenido inapropiado.
- Despliegue en dispositivos con VRAM limitada: la cuantizacion Q4_K_M permite ejecutar el modelo en GPUs consumer de gama media-baja (por ejemplo, 4-8 GB de VRAM), habilitando inferencia multimodal en hardware asequible.
- Base para ajuste fino o experimentacion con uncensoring: al estar disponible en GGUF y con licencia permisiva, sirve como punto de partida para estudiar el efecto de tecnicas de ablacion de rechazos en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M aproximadamente 1,21 GB de pesos mas overhead de contexto y el proyector de vision (aproximadamente 637 MB); Q8_0 aproximadamente 1,92 GB mas el mismo proyector. En la practica, se recomienda reservar entre 3 y 5 GB de VRAM para Q4_K_M y entre 4 y 6 GB para Q8_0, incluyendo KV cache y buffers.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para Q4_K_M (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super) y 6-8 GB para Q8_0 (RTX 3060, RTX 4060 Ti, RTX 2070). Para maximo throughput, A100 o H100 son sobredimensionadas para este tamano de modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs consumer con 4 GB o mas de VRAM en Q4_K_M, y con 6 GB o mas en Q8_0.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), P.AI AI Image Studio (soporte explicito en la model card), y cualquier frontend compatible con llama.cpp. vLLM y TGI no estan confirmados para este formato en la informacion disponible. El repo INT8-ConvRot permite despliegue en PyTorch / ComfyUI.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de menos de 2 B parametros, se espera una latencia baja en GPU consumer, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-GGUF (este modelo) | 1,88 B | No disponible | Si (mmproj) | Apache 2.0 | GGUF |
| Qwen3.5-2B (base, sin heretic) | Aproximadamente 2 B | No disponible | Depende de la variante | Apache 2.0 (segun familia Qwen) | safetensors |
| Modelos de vision-language de menos de 3 B (categoria general) | 1-3 B | Variable | Si | Variable | GGUF / safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad. Cualquier comparacion de calidad o benchmarks queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- La variante "heretic" implica un proceso de reduccion de rechazos; esto puede aumentar el riesgo de generar contenido inapropiado, sesgado o danino, y debe evaluarse antes de cualquier despliegue en produccion orientado al publico.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se dispone de evaluaciones publicadas de fiabilidad.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto ni los idiomas soportados, lo que impide garantizar un comportamiento multilingue o conversaciones de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias (Qwen3.5) pueden tener terminos adicionales que deben revisarse; la model card no detalla condiciones especificas mas alla de la licencia.
- El proyector de vision es obligatorio para tareas de grounding; sin mmproj-F16.gguf, las capacidades visuales no estan disponibles en llama.cpp.
- El repositorio no documenta el proceso de entrenamiento ni los datos utilizados, lo que dificulta auditar sesgos o procedencia de datos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-23) es futura respecto a la mayoria de referencias conocidas; debe verificarse la autenticidad y procedencia del repositorio antes de su uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnosVoldigoad1/Qwen3.5-2B-heretic-GGUF
- Repo INT8-ConvRot (PyTorch / ComfyUI): https://huggingface.co/AnosVoldigoad1/Qwen3.5-2B-heretic-INT8-ConvRot
- Modelo base: https://huggingface.co/coder3101/Qwen3.5-2B-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- P.AI AI Image Studio: no disponible (no se proporciona URL en la informacion)
- Paper o blog del modelo: no disponible
