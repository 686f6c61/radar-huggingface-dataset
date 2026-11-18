# McGanster/granite-3.1-3b-a800m-instruct-Q4_K_M-GGUF

## Resumen

Esta ficha describe la cuantización GGUF Q4_K_M del modelo `ibm-granite/granite-3.1-3b-a800m-instruct`, publicada por el usuario McGanster bajo el identificador `McGanster/granite-3.1-3b-a800m-instruct-Q4_K_M-GGUF`. No se trata de un modelo original, sino de una conversión a formato GGUF realizada con `llama.cpp` a través del espacio `gguf-my-repo` de ggml.ai, pensada para su uso con la familia de herramientas de llama.cpp (CLI, servidor y bindings derivados como Ollama o LM Studio).

El modelo base es Granite 3.1 3B A800M Instruct de IBM, un transformer de tipo Mixture of Experts (MoE) con aproximadamente 3.300 millones de parámetros totales y unos 800 millones activos por token. Esta arquitectura permite un coste de inferencia cercano al de un modelo denso de 800M, manteniendo la capacidad de representación de un modelo de 3B. La versión Instruct está ajustada para conversación y seguimiento de instrucciones.

La relevancia de esta publicación concreta es práctica: ofrece los pesos en cuantización de 4 bits (Q4_K_M) en un repositorio de unos 2,0 GB, lo que facilita el despliegue en hardware de consumo y en entornos sin GPU dedicada. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial. La información disponible sobre esta conversión es limitada: no incluye datos de benchmarks propios, idiomas declarados ni detalles adicionales más allá de las instrucciones de uso con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), modelo base Granite 3.1 3B A800M Instruct |
| Parametros totales | 3.298.793.472 (aprox. 3,3 B) |
| Parametros activos | Aproximadamente 800 M (según la denominación A800M del modelo base) |
| Longitud de contexto | No disponible en la informacion proporcionada para esta conversion (el ejemplo de llama-server usa `-c 2048`, pero es un valor de ejemplo, no una especificacion) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`granite-3.1-3b-a800m-instruct-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 3.298.793.472 parámetros totales y aproximadamente 800 millones activos por token, según indica la nomenclatura A800M de IBM. La versión Instruct incorpora ajuste por instrucciones orientado a conversación. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

Esta publicación concreta no aporta innovaciones arquitectónicas propias: es una conversión de pesos a GGUF con cuantización Q4_K_M mediante el espacio `gguf-my-repo` de ggml.ai, que emplea `llama.cpp` para generar el fichero. El resultado es un artefacto de despliegue, no un nuevo modelo entrenado.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo Instruct de IBM.
- Razonamiento y respuesta a preguntas en formato multi-turno (pipeline `text-generation`, tag `conversational`).
- Ejecución local mediante llama.cpp, con CLI (`llama-cli`) y servidor (`llama-server`).
- Compatibilidad con el ecosistema GGUF, lo que permite su uso en herramientas que consumen este formato.
- Capacidades de tool calling, agentes o modo de razonamiento extendido: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede desplegarse con `llama-server` y servir una API compatible con llama.cpp para integrarse en una aplicación de chat, aprovechando su tamaño reducido en Q4_K_M (unos 2 GB de repositorio) para ejecutarse en equipos sin GPU dedicada.
- Prototipado rápido en estaciones de trabajo: gracias a la CLI de llama.cpp, un desarrollador puede validar prompts y flujos conversacionales sin infraestructura de servidor, descargando el GGUF directamente con `--hf-repo`.
- Aplicaciones de escritorio y edge computing: la cuantización Q4_K_M y el bajo número de parámetros activos (aprox. 800 M) lo hacen adecuado para integrarse en aplicaciones de escritorio o dispositivos con recursos limitados mediante bindings de llama.cpp.
- Generación de texto en pipelines por lotes: el modelo puede emplearse para tareas de redacción, resumen o clasificación textual en lotes, ejecutándose en CPU o GPU modesta sin necesidad de servicios en la nube.
- Entornos con requisitos de licencia permisiva: al heredar Apache 2.0, puede incorporarse en productos comerciales internos o distribuidos, siempre que se respeten las condiciones de la licencia.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de Q4_K_M frente a los pesos originales del modelo base en tareas concretas del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 2,0 GB, por lo que la cuantización Q4_K_M requiere del orden de 2 GB de memoria para los pesos, más el espacio para el contexto KV (variable según la longitud de contexto configurada).
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, cualquier GPU con al menos 3-4 GB de VRAM libre puede alojar los pesos; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes para el modelo en sí.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU consumer con 4 GB o más de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión herramientas compatibles con GGUF. No se confirma soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| McGanster/granite-3.1-3b-a800m-instruct-Q4_K_M-GGUF | 3,3 B totales / ~800 M activos | No disponible | Apache 2.0 | GGUF Q4_K_M | Conversión comunitaria del modelo IBM |
| ibm-granite/granite-3.1-3b-a800m-instruct | 3,3 B totales / ~800 M activos | No disponible en la información proporcionada | Apache 2.0 | Safetensors (transformers) | Modelo base original de IBM |
| Otras cuantizaciones GGUF del mismo modelo base | 3,3 B totales / ~800 M activos | No disponible | Apache 2.0 | GGUF (distintos niveles) | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks ni de comparaciones de rendimiento con modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Esta publicación es una conversión comunitaria no oficial; no está mantenida por IBM y puede no recibir actualizaciones.
- Solo se ofrece la cuantización Q4_K_M; no hay otras variantes en el repositorio. La cuantización de 4 bits puede degradar la calidad respecto a los pesos originales en tareas sensibles.
- No se declaran idiomas soportados en esta ficha; el comportamiento multilingüe debe validarse empíricamente.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta conversión.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de IBM y citar la procedencia correspondiente.
- El ejemplo de la model card usa `-c 2048` para el servidor; no debe interpretarse como la longitud de contexto máxima del modelo, que no se especifica aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/McGanster/granite-3.1-3b-a800m-instruct-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-3b-a800m-instruct
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
