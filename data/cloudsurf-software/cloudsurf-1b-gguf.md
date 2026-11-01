# cloudsurf-software/CloudSurf-1B-GGUF

## Resumen

CloudSurf-1B es un modelo de lenguaje base de 889.260.032 parámetros (aproximadamente 0,89 mil millones) entrenado desde pesos aleatorios por CloudSurf Software LLC sobre 18.160 millones de tokens. Se distribuye en este repositorio únicamente en formato GGUF, con tres cuantizaciones oficiales (f16, Q8_0 y Q4_K_M), y está pensado para su uso con llama.cpp. Es un modelo base, no ajustado por instrucciones: continúa texto en lugar de seguir órdenes.

El modelo está especializado en un formato propio denominado SurfDoc, un tipo de documento con front matter YAML seguido de encabezados Markdown. Según la model card, la forma de prompt que vio con más frecuencia durante el entrenamiento es precisamente un bloque de front matter de SurfDoc seguido de un encabezado, por lo que su comportamiento más fiable se obtiene alimentándolo con el inicio de un documento de ese estilo.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño, de licencia Apache-2.0 y entrenamiento desde cero, útil para experimentación en hardware modesto; por otro, advierte de sus limitaciones prácticas, en particular que entra en bucles en generaciones largas y que no dispone de capacidades de instrucción, tool calling ni razonamiento multi-paso. No se han publicado datos sobre longitud de contexto, arquitectura interna ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer base entrenado desde cero; detalles no publicados en la información disponible) |
| Parametros totales | 889.260.032 (aproximadamente 0,89 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de servidor de la model card usa `-c 2048`, pero no se confirma como contexto de entrenamiento) |
| Tipos de cuantizacion | f16, Q8_0, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio base contiene una exportación en safetensors fp32 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (número de capas, dimensión oculta, mecanismo de atención, tipo de tokenizador). Lo que sí se documenta es que se trata de un modelo base entrenado desde pesos aleatorios (from-scratch) por CloudSurf Software LLC sobre 18.160 millones de tokens, con un conjunto de datos cuya atribución por fuente se detalla en la model card del modelo base. No se menciona el uso de RLHF, DPO ni ningún tipo de ajuste por preferencias; el modelo se distribuye como base sin instrucción.

El proceso de conversión a GGUF se realizó con llama.cpp v0.7.0 a partir de la exportación en safetensors fp32 del repositorio base (sha256 que empieza por `7064e999`). Según el autor, esa exportación coincide con el modelo entrenado con una diferencia máxima de logits de 5,6e-05 en fp32, y la tokenización de llama.cpp coincide con la de Hugging Face en 20 de 20 documentos de validación. El token `<|bos|>` se añade automáticamente desde los metadatos del GGUF (`add_bos_token` es true). Como innovación destacable, el autor reporta perplejidad sobre 40 documentos de validación web para cada cuantización, lo que permite evaluar la pérdida de calidad por compresión.

## Capacidades

- Generación de texto por continuación: el modelo continúa un documento dado, no responde a instrucciones.
- Especialización en el formato SurfDoc: front matter YAML seguido de encabezados y cuerpo Markdown.
- Generación de documentos técnicos o artículos a partir de un título y un encabezado inicial.
- Capacidad multilingüe: limitada al inglés según los metadatos del modelo.
- Tool calling / function calling: no soportado (modelo base sin ajuste).
- Agentes y razonamiento multi-paso: no soportado.
- Modo thinking, visión o audio: no disponible.
- Generaciones largas: propenso a bucles; el autor recomienda penalización de repetición o generaciones cortas.

## Casos de uso

- Generación de borradores de documentación en formato SurfDoc: se alimenta al modelo con el front matter y el primer encabezado, y continúa el documento; es el uso para el que fue entrenado y el que la model card ejemplifica con un artículo sobre el río Colorado.
- Prototipado de pipelines de generación de texto en local: al ocupar 0,55 GB en Q4_K_M, permite montar un servidor llama.cpp (`llama-server -c 2048`) en máquinas sin GPU dedicada para pruebas de integración.
- Experimentación académica con modelos from-scratch: sirve como referencia de un modelo pequeño entrenado desde cero sobre 18,16B tokens, útil para estudiar curvas de perplejidad y efectos de cuantización (11,534 en f16 frente a 11,708 en Q4_K_M).
- Evaluación de la pérdida por cuantización: las tres versiones publicadas (f16, Q8_0, Q4_K_M) con sus perplejidades permiten medir el impacto de la compresión en un modelo de menos de 1B de parámetros.
- Generación de texto en entornos con recursos muy limitados: el archivo Q4_K_M de 0,55 GB cabe en dispositivos de borde o contenedores pequeños, siempre que se acepte la calidad de un modelo de 0,89B.
- Completado de plantillas de documentación estructurada: dado un esquema de front matter fijo, el modelo puede rellenar secciones siguiendo el patrón de encabezados que vio en entrenamiento, con revisión humana posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de evaluación reportado por el autor es la perplejidad sobre 40 documentos de validación web para cada cuantización:

| Archivo | Cuantización | Tamano | Perplejidad (40 docs val-web) |
|---|---|---:|---:|
| `CloudSurf-1B-f16.gguf` | f16 | 1,78 GB | 11,534 |
| `CloudSurf-1B-Q8_0.gguf` | Q8_0 | 0,95 GB | 11,536 |
| `CloudSurf-1B-Q4_K_M.gguf` | Q4_K_M | 0,55 GB | 11,708 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para f16, 1 GB para Q8_0 y 0,6 GB para Q4_K_M, sin contar el espacio para el contexto KV.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente; no se requieren A100 ni H100. También es viable la inferencia en CPU.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-server`), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio, aunque la model card solo documenta llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas por el autor frente a otros modelos de tamaño similar (por ejemplo, modelos de 0,5B a 1B de parámetros). La comparación se limita a características objetivas:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CloudSurf-1B | 0,89B | no disponible | Apache-2.0 | GGUF | Base, solo inglés, especializado en SurfDoc |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la información disponible |

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no responde a preguntas y no mantiene diálogos; solo continúa texto.
- Entra en bucles en generaciones largas; el autor recomienda usar penalización de repetición (por ejemplo, `--repeat-penalty 1.1`) o limitar la longitud de salida.
- Solo soporta inglés según los metadatos; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada; el ejemplo de servidor usa 2048 tokens, pero no se confirma como máximo entrenado.
- Riesgo de alucinación inherente a un modelo de 0,89B entrenado sobre 18,16B tokens; no apto para producción sin verificación humana.
- No dispone de tool calling, agentes ni razonamiento multi-paso, por lo que no puede integrarse en pipelines que requieran esas capacidades.
- Licencia Apache-2.0 permite uso comercial, pero las marcas "CloudSurf" y los signos distintivos asociados permanecen con CloudSurf Software LLC.
- El campo `general.name` embebido en los GGUF dice `Tinysurf 1b`, nombre interno del proyecto; el autor indica que no volvió a sellar los archivos, por lo que pueden aparecer discrepancias de nombre en herramientas que lean ese metadato.
- No se detallan sesgos conocidos ni composición del dataset más allá de la atribución por fuente en la model card del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cloudsurf-software/CloudSurf-1B-GGUF
- Modelo base: https://huggingface.co/cloudsurf-software/CloudSurf-1B
- Sitio del autor: https://cloudsurf.com/
