# mradermacher/Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored-GGUF

## Resumen

Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored es un modelo de lenguaje de 34.714.297.344 parámetros (aproximadamente 35B) derivado de la familia Qwen2.5, publicado originalmente por DavidAU y cuantizado a formato GGUF por mradermacher. Se trata de un merge que combina la base Qwen2.5 con capacidades de razonamiento tipo QwQ-32B (cadena de pensamiento, "thinking mode") y con técnicas de "abliteration" y "uncensoring" que eliminan o atenúan los mecanismos de rechazo del modelo original. El resultado es un modelo orientado a razonamiento explícito (chain-of-thought) sin las restricciones de alineamiento habituales.

El modelo se distribuye exclusivamente en formato GGUF, con 11 cuantizaciones estáticas que van desde Q2_K (13,1 GB) hasta Q8_0 (37,0 GB), lo que lo hace desplegable en hardware de consumo mediante llama.cpp y derivados. La arquitectura subyacente es un transformer denso de la familia Qwen2.5 con ventana de contexto declarada de 128k tokens. El repositorio ocupa 237,2 GB e incluye todos los archivos cuantizados.

La relevancia de esta ficha radica en que documenta un caso típico de la escena de modelos comunitarios: un merge experimental con razonamiento tipo R1/QwQ, sin benchmarks publicados, sin licencia declarada y con advertencias explícitas de contenido no apto para todas las audiencias. Es útil para quienes necesitan razonamiento local sin filtros, pero requiere cautela en producción por la ausencia de garantías de calidad y de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5, merge con QwQ-32B) |
| Parametros totales | 34.714.297.344 (~35B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (declarado en tags) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repo | 237,2 GB |
| Libreria | transformers (metadato), uso real via llama.cpp |
| Modelo base | DavidAU/Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored |

## Arquitectura y entrenamiento

El modelo es un merge de la familia Qwen2.5 (transformer denso con atención estándar y contexto extendido) al que se le han incorporado capacidades de razonamiento tipo QwQ-32B, que emplea cadenas de pensamiento largas antes de emitir la respuesta final. La etiqueta "Eureka-Cubed" y "Cubed Reasoning" sugiere una combinación iterativa de capas o pesos orientada a reforzar el razonamiento multi-paso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o RLVR.

La componente "abliterated-uncensored" indica que se han aplicado técnicas de abliteración (proyección ortogonal para eliminar direcciones de rechazo en el espacio de activaciones) y un proceso de uncensoring que reduce la probabilidad de respuestas de negativa. Esto degrada típicamente la calibración de seguridad y puede afectar a la coherencia en dominios sensibles. No hay información publicada sobre decodificación especulativa, atención lineal ni otras innovaciones de eficiencia.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento explícito con cadena de pensamiento ("thinking mode") heredado de QwQ-32B.
- Razonamiento matemático y lógico multi-paso (sin benchmarks publicados que lo cuantifiquen).
- Generación de código (capacidad heredada de Qwen2.5; sin evaluación publicada en este merge).
- Contexto largo declarado de hasta 128k tokens.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones sensibles.
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y multi-step reasoning: parcial, vía cadenas de pensamiento, sin infraestructura de agentes documentada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Sin visión ni audio.

## Casos de uso

- Razonamiento local sin conexión: desplegar la cuantización Q4_K_M (21,1 GB) en una estación de trabajo con 24 GB de VRAM para resolver problemas matemáticos y lógicos con cadena de pensamiento visible, útil en entornos air-gapped.
- Investigación sobre alineamiento y abliteración: comparar las respuestas del modelo con su base alineada para estudiar cómo cambia la tasa de rechazos y la calibración al eliminar direcciones de seguridad.
- Generación de código asistida en local: usar Q5_K_M o Q6_K en una GPU de 24-48 GB para autocompletar y explicar código, aprovechando el contexto largo para incluir varios archivos en el prompt.
- Análisis de documentos extensos: procesar contratos o informes de hasta decenas de miles de tokens en una sola pasada gracias a la ventana declarada de 128k, con la cautela de que el contexto efectivo puede degradarse.
- Prototipado de asistentes conversacionales sin filtros: para investigación creativa o generación de ficción que requiere contenido sensible, en entornos controlados y con revisión humana posterior.
- Evaluación de merges comunitarios: servir como referencia para medir el impacto de técnicas de merge y abliteración sobre la coherencia y la utilidad en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el modelo base tampoco documenta evaluaciones en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~13 GB; Q4_K_M ~21 GB; Q5_K_M ~25 GB; Q6_K ~29 GB; Q8_0 ~37 GB. Añadir 2-4 GB para el contexto KV cache según longitud de ventana.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M con contexto moderado; A6000 (48 GB) o A100 40/80 GB para Q6_K/Q8_0 con contexto largo; H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput: no disponibles; dependen de la GPU y de la cuantización. Como referencia cualitativa, Q4_K_S y Q4_K_M están marcados como "fast, recommended" por el cuantizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored (este) | ~35B | 128k | no disponible | GGUF | Merge sin benchmarks, uncensored |
| Qwen2.5-32B-Instruct | 32B | 128k | Apache 2.0 (Qwen) | safetensors, GGUF | Base alineada, benchmarks publicados |
| QwQ-32B | 32B | 128k | Apache 2.0 (Qwen) | safetensors, GGUF | Razonamiento con benchmarks publicados |
| DeepSeek-R1-Distill-Qwen-32B | 32B | 128k | MIT (DeepSeek) | safetensors, GGUF | Distilación con benchmarks publicados |

La comparativa se limita a parámetros, contexto y licencia porque este merge no publica métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sin licencia declarada: no hay garantía legal para uso comercial; verificar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad; el rendimiento real puede diferir del modelo base.
- Modelo "uncensored" y "not-for-all-audiences": puede generar contenido sensible, ofensivo o inseguro; requiere moderación externa en producción.
- La abliteración puede degradar la coherencia, la calibración y la capacidad de seguir instrucciones complejas.
- Solo inglés declarado; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación elevado en un merge experimental sin evaluación.
- El contexto de 128k es declarado, pero el contexto efectivo puede ser menor; validar con pruebas propias.
- Merge comunitario con pocas descargas (161) y likes (2): poca validación por parte de la comunidad.
- El repositorio GGUF ocupa 237,2 GB; descargar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen2.5-QwQ-35B-Eureka-Cubed-abliterated-uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
