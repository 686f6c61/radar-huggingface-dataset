# ravivarmapatturi/inferedge-tiny-mt-en-te-v3

## Resumen

InferEdge tiny translator v3 es un modelo de traducción automática inglés-telugu de pequeno tamano, desarrollado por el usuario ravivarmapatturi y publicado bajo licencia Apache 2.0. Se trata de un modelo de investigación entrenado desde pesos aleatorios (sin destilación de un modelo profesor) exclusivamente sobre traducciones humanas, con los datos conversacionales ponderados a la mitad durante el entrenamiento. El checkpoint publicado corresponde al paso 22000 y se distribuye como un archivo ONNX cuantizado a INT8 junto con su tokenizador, con un tamano total de 33,3 MB.

El modelo está pensado para inferencia en dispositivo (on-device) y escenarios de borde, dado su reducido tamano. Sin embargo, el propio autor advierte explícitamente de que no está listo para uso real y de que parte de los datos de entrenamiento presenta un conflicto de licencia declarado sobre texto de PM India.

La relevancia de esta ficha es principalmente documental: permite evaluar el estado de un modelo de traducción de muy bajo coste computacional para el par inglés-telugu, así como sus limitaciones actuales frente a versiones anteriores (v1 y v2) del mismo proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de traducción tipo transformer, no detallado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | inglés (en), telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8), con tokenizador incluido |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de describirlo como un modelo de traducción entrenado desde pesos aleatorios, sin profesor, sobre traducciones humanas. No se especifica el número de parámetros, la profundidad de la red ni el mecanismo de atención. El checkpoint publicado corresponde al paso 22000 de entrenamiento.

El dataset de entrenamiento es `ravivarmapatturi/inferedge-en-te-bitext-v1`, compuesto por traducciones humanas, con los datos de tipo conversacional ponderados a la mitad. El autor indica que parte de los datos contiene texto de PM India con un conflicto de licencia declarado, documentado en la ficha del dataset. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Traducción automática directa del inglés al telugu.
- Ejecución en dispositivo mediante ONNX Runtime en formato INT8.
- Distribución ligera (33,3 MB) apta para entornos con recursos limitados.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes ni multimodalidad.
- Cobertura limitada a dos idiomas: inglés y telugu.

## Casos de uso

- Traducción de interfaz en aplicaciones móviles: el modelo puede integrarse como traductor embebido para textos cortos de UI en inglés hacia telugu, aprovechando su tamano de 33,3 MB y su formato ONNX.
- Prototipado de investigación en traducción de bajo recurso: sirve como línea base reproducible para estudiar el efecto de entrenar sin profesor sobre datos humanos.
- Evaluación comparativa de versiones: permite medir la degradación o mejora frente a v1 y v2 del mismo proyecto en conjuntos como IN22.
- Traducción de contenido conversacional en entornos sin conectividad: su despliegue on-device permite traducir mensajes en escenarios de borde, aunque con calidad limitada según los resultados en IN22 conversation (23,71 chrF++).
- Filtrado y preprocesado de corpus bilingües: puede emplearse para generar traducciones preliminares que luego se revisen humanamente en pipelines de datos.
- Docencia y demostraciones: su reducido tamano facilita incluirlo en cursos o talleres sobre despliegue de modelos ONNX sin necesidad de GPU.

## Benchmarks y rendimiento

Resultados congelados publicados por el autor (INT8 ONNX, decodificación greedy, chrF++ con orden de palabras 2):

| Test | chrF++ |
|---|---:|
| BPCC test (similar a parte de los datos de entrenamiento) | 64,48 |
| IN22 conversation (1.503) | 23,71 |
| IN22 general (1.024) | 23,33 |

Comparación con versiones anteriores del mismo proyecto según la model card:

| Modelo | IN22 conversation | IN22 general |
|---|---:|---:|
| v3 (este modelo) | 23,71 | 23,33 |
| v2 | 34,41 | 29,14 |
| v1 | 25,04 | 24,97 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en formato INT8 ONNX, dado el tamano del modelo (33,3 MB de pesos).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobradamente suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y sistemas embebidos.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El autor indica que no se ha probado en navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InferEdge tiny MT en-te v3 | no disponible | no disponible | Apache 2.0 | ONNX INT8 | 33,3 MB; chrF++ IN22 general 23,33 |
| InferEdge tiny MT en-te v2 | no disponible | no disponible | no disponible | no disponible | chrF++ IN22 general 29,14 |
| InferEdge tiny MT en-te v1 | no disponible | no disponible | no disponible | no disponible | chrF++ IN22 general 24,97 |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no está listo para uso real.
- Parte de los datos de entrenamiento (texto de PM India) presenta un conflicto de licencia declarado, documentado en la ficha del dataset.
- Rendimiento notablemente inferior a las versiones v1 y v2 en los conjuntos IN22, lo que sugiere una regresión en calidad general.
- La puntuación alta en BPCC test (64,48) puede estar inflada por la similitud con los datos de entrenamiento.
- Riesgo de alucinación y de traducciones incorrectas en dominios no vistos, dado el bajo rendimiento en IN22.
- Cobertura limitada a inglés y telugu; no se documentan otros idiomas.
- No se ha probado en navegador ni se documentan pruebas de despliegue en producción.
- Aunque la licencia es Apache 2.0, el conflicto de licencia en los datos de entrenamiento debe revisarse antes de cualquier uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/ravivarmapatturi/inferedge-tiny-mt-en-te-v3
- Dataset: https://huggingface.co/datasets/ravivarmapatturi/inferedge-en-te-bitext-v1
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
