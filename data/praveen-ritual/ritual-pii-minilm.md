# praveen-ritual/ritual-pii-minilm

## Resumen

Ritual PII MiniLM es un modelo de clasificación de tokens (token classification) especializado en la detección de datos personales e identificadores sensibles (PII) en tráfico HTTP. Lo desarrolla el usuario `praveen-ritual` y parte de la arquitectura `microsoft/Multilingual-MiniLM-L12-H384`, un transformer BERT-like de 117,5 millones de parámetros con contexto de 512 tokens. El modelo continúa el entrenamiento del checkpoint `crp4222/privaite-pii-minilm`, manteniendo congelada la tabla de embeddings de 96 millones de parámetros para preservar el etiquetador original de 15 tipos de entidad.

Su relevancia radica en el enfoque de despliegue: está pensado para ejecutarse como sidecar en el propio salto HTTP, con un fichero ONNX cuantizado a INT8 de 113 MB que procesa un cuerpo JSON en unos 8 ms p50 en una CPU de 12 núcleos. El entrenamiento adicional es sintético y cubre dos carencias del checkpoint base: nombres personales dentro de campos JSON (`name`, `full_name`, `customer`, `patient`) y credenciales embebidas en código (`sk-proj-…`, `AKIA…`, `password=`, `api_key=`).

El modelo no sustituye la capa de expresiones regulares del ejecutor para identificadores estructurados (tarjetas, IBAN, etc.); se presenta como un complemento para la detección semántica de PII no estructurada. La licencia es BSD-3-Clause, la misma que el checkpoint del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-like (MiniLM, 12 capas), token classification |
| Parametros totales | 117.517.855 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de MiniLM; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | INT8 (ONNX); safetensors en precision original |
| Idiomas soportados | multilingual, en |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors, ONNX (`onnx/model_int8.onnx`) |
| Modelo base | microsoft/Multilingual-MiniLM-L12-H384 |
| Checkpoint de partida | crp4222/privaite-pii-minilm (commit e5f6a01d465c9a2489a74a95ff1151359b759213) |
| Etiquetas | 15 tipos de entidad PII (heredadas del checkpoint base) |
| Tamano del fichero INT8 | 113 MB |
| Latencia declarada | ~8 ms p50 (cuerpo JSON canary, CPU de 12 nucleos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT con 12 capas y 384 dimensiones ocultas (MiniLM-L12), adaptado a clasificación de tokens mediante una cabeza de etiquetado secuencial. La tabla de embeddings, de 96 millones de parámetros, se congela durante el ajuste fino para no degradar el etiquetador de 15 tipos de PII que ya traía el checkpoint `crp4222/privaite-pii-minilm`. Solo se actualizan las capas superiores y la cabeza de clasificación.

El entrenamiento adicional utiliza datos sintéticos orientados a dos clases de error del checkpoint original: nombres propios en campos JSON estructurados y credenciales en fragmentos de código. No se especifican en la model card el volumen de tokens, la composición exacta del dataset, ni si hubo RLHF o DPO (en un modelo de token classification no sería el enfoque habitual). La innovación destacable no es arquitectónica sino de despliegue: exportación a ONNX con cuantización INT8 y una interfaz mínima de dos entradas (`input_ids`, `attention_mask`) que permite integrarlo como sidecar de red con latencia de milisegundos.

## Capacidades

- Detección de entidades PII a nivel de token sobre texto plano y sobre valores de campos JSON.
- Reconocimiento de nombres personales en campos como `name`, `full_name`, `customer` o `patient`.
- Detección de credenciales en código: claves de API con prefijos tipo `sk-proj-`, identificadores AWS `AKIA…`, asignaciones `password=` y `api_key=`.
- Clasificación multilingüe (hereda el carácter multilingüe de MiniLM) con especial cobertura de inglés.
- Inferencia en CPU con ONNX Runtime a partir de `onnx/model_int8.onnx`.
- Etiquetado de 15 tipos de entidad PII heredados del checkpoint base (el conjunto exacto no se detalla en la model card).
- No realiza generación de texto, razonamiento, tool calling ni function calling: es exclusivamente un clasificador de tokens.

## Casos de uso

- Redacción de PII en pasarelas HTTP: el modelo se carga como sidecar en el proxy y redacta los valores sensibles del cuerpo JSON antes de que la petición salga del perímetro, con una latencia p50 de ~8 ms que no penaliza el salto de red.
- Cumplimiento de RGPD en logs de aplicaciones: se aplica sobre los eventos estructurados antes de escribirlos en el sistema de logging para eliminar nombres, credenciales y otros identificadores personales.
- Filtrado de secretos en pipelines de CI/CD: detección de claves `sk-proj-…`, `AKIA…` y asignaciones `password=` en artefactos y diffs de código antes de publicarlos en repositorios.
- Enmascaramiento en entornos sanitarios: el modelo cubre específicamente el campo `patient`, lo que permite anonimizar registros clínicos en formato JSON con nombres de pacientes.
- Protección de datos en herramientas de atención al cliente: redacción de nombres y datos de contacto en el cuerpo de tickets y conversaciones antes de enviarlos a sistemas de analítica o modelos de terceros.
- Preprocesado para entrenamiento de modelos: limpieza de datasets multilingües eliminando PII de los campos estructurados antes de usarlos en ajuste fino.
- Auditoría de exportaciones de bases de datos: pasada por lotes sobre volcados JSON para localizar campos con datos personales y generar un informe de exposición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica declarada es de latencia: ~8 ms p50 para el cuerpo JSON de canary en una CPU de 12 núcleos con el fichero INT8, sin datos de precisión, recall ni F1 sobre conjuntos de evaluación.

## Requisitos de hardware

- Inferencia en CPU: el fichero `onnx/model_int8.onnx` (113 MB) está pensado para ejecutarse en CPU; el autor reporta ~8 ms p50 en un procesador de 12 núcleos.
- VRAM estimada: no disponible. Por el tamaño del modelo (117,5 M de parámetros) cabría en cualquier GPU consumer con varios GB libres, pero no se han publicado cifras de VRAM ni de throughput en GPU.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU consumer: previsiblemente sí por tamaño, aunque no hay confirmación del autor ni cifras de rendimiento.
- Opciones de despliegue: ONNX Runtime (formato declarado por el autor); también es compatible con `transformers` al publicar safetensors y tener `library_name: transformers`. vLLM, llama.cpp, Ollama y TGI no están indicados por el autor y no son adecuados para un clasificador de tokens de este tipo.
- Latencia: ~8 ms p50 en CPU de 12 núcleos sobre el cuerpo JSON de canary (INT8). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Ritual PII MiniLM | 117,5 M | 512 (heredado) | Token classification PII | BSD-3-Clause | safetensors, ONNX INT8 |
| microsoft/Multilingual-MiniLM-L12-H384 | 117,5 M | 512 | Encoder multilingüe base | MIT (según el modelo original) | safetensors |
| crp4222/privaite-pii-minilm | no disponible | no disponible | Token classification PII (15 tipos) | no disponible | no disponible |
| Modelos NER genéricos tipo `dslim/bert-base-NER` | ~110 M | 512 | NER (PER, ORG, LOC, MISC) | MIT / Apache-2.0 según variante | safetensors |

La comparación con alternativas de detección de PII específicas es limitada: no hay benchmarks publicados para este checkpoint ni para el de partida, por lo que la elección entre ellos debe basarse en la cobertura de etiquetas y en el formato de despliegue (ONNX INT8 para sidecar) más que en métricas de calidad.

## Limitaciones y advertencias

- No sustituye la capa de expresiones regulares del ejecutor para identificadores estructurados (tarjetas, IBAN, etc.); el propio autor lo indica.
- El entrenamiento adicional es sintético y se limita a nombres en campos JSON y credenciales en código; puede no generalizar a dominios o formatos no representados.
- El conjunto completo de 15 etiquetas PII no se documenta en la model card; conviene validarlo antes de confiar en la cobertura.
- Cobertura lingüística declarada como multilingüe e inglés, pero sin evaluación publicada por idioma; el rendimiento en castellano no está medido.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, sin métricas de precisión/recall publicadas.
- La licencia BSD-3-Clause permite uso comercial, pero conviene verificar la licencia del checkpoint de partida `crp4222/privaite-pii-minilm` para el uso combinado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-19; es un artefacto muy reciente y sin validación comunitaria.
- La ventana de contexto de 512 tokens es heredada de MiniLM y no está confirmada explícitamente en la model card; cuerpos HTTP mayores requerirán troceado.
- No apto para generación, razonamiento ni tool calling: cualquier uso fuera de token classification es inadecuado.

## Enlaces

- Hugging Face: https://huggingface.co/praveen-ritual/ritual-pii-minilm
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Checkpoint de partida: https://huggingface.co/crp4222/privaite-pii-minilm
- Repositorio del checkpoint de partida (commit referenciado): e5f6a01d465c9a2489a74a95ff1151359b759213
