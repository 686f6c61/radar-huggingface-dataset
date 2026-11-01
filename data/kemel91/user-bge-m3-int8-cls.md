# Kemel91/user-bge-m3-int8-cls

## Resumen

Kemel91/user-bge-m3-int8-cls es un empaquetado ONNX cuantizado a INT8 del modelo de embeddings deepvk/USER-bge-m3, un encoder basado en arquitectura XLM-RoBERTa (transformer) especializado en generar representaciones vectoriales de texto en ruso e ingles. Lo publica el usuario Kemel91 con un objetivo muy concreto: que Manticore Search (probado en la version 29.0.2) pueda descargar y ejecutar el modelo de forma autonoma para generar auto-embeddings dentro de un motor de busqueda, sin necesidad de infraestructura externa de inferencia.

El modelo no introduce pesos nuevos: parte de la cuantizacion dinamica INT8 de skatzR/USER-BGE-M3-ONNX-INT8 y del tokenizer original de deepvk/USER-bge-m3, ambos bajo licencia Apache 2.0. La aportacion tecnica es un reempaquetado del grafo ONNX para adaptarlo a las suposiciones fijas de Manticore: anade una entrada token_type_ids no utilizada, replica el vector CLS en todas las posiciones de salida para que el mean pooling de Manticore coincida con el pooling CLS con el que fue entrenado el modelo original, y sustituye el tokenizer por uno compatible con el lector de Manticore (Metaspace con split, truncacion a 512 tokens).

Es relevante para desarrolladores que despliegan busqueda semantica o hibrida en Manticore Search sobre corpus rusos o bilingues ruso-ingles, especialmente en entornos con recursos limitados: el repositorio ocupa 0,4 GB y el modelo produce embeddings de 1024 dimensiones. El autor documenta que la correccion del pooling CLS eleva la precision@10 de 0,40 a 0,30 frente al mean pooling simple en su conjunto de prueba de busqueda hotelera, lo que ilustra el impacto practico del reempaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (base: deepvk/USER-bge-m3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncacion; mas alla los vectores divergen del modelo original) |
| Tipos de cuantizacion | INT8 (cuantizacion dinamica), exportado a ONNX |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`) + `tokenizer.json` + `config.json` |
| Dimension de embedding | 1024 |
| Tipo de pooling | CLS (primer token), replicado en todas las posiciones de salida |
| Prefijos de consulta/documento | No requiere |
| Libreria | onnx |
| Tamano del repositorio | 0,4 GB |
| Modelo base | deepvk/USER-bge-m3 |
| Compatibilidad verificada | Manticore Search 29.0.2 |

## Arquitectura y entrenamiento

El modelo subyacente, deepvk/USER-bge-m3, es un encoder transformer de la familia XLM-RoBERTa entrenado para generar sentence embeddings con pooling sobre el primer token (CLS). Este repositorio no reentrena ni ajusta los pesos: toma la cuantizacion dinamica INT8 publicada por skatzR (revision `4c89cf5351b21965791ef223c6d2f8d045474be0`) y el tokenizer de deepvk (revision `0cc6cfe48e260fb0474c753087a69369e88709ae`), y modifica el grafo ONNX para satisfacer las restricciones de Manticore Search.

Las tres modificaciones tecnicas documentadas son: (1) incorporacion de una entrada `token_type_ids` no utilizada, porque Manticore siempre la alimenta; (2) reescritura de la salida para que el vector CLS se escriba en todas las posiciones de token, de modo que el mean pooling interno de Manticore produzca exactamente el vector CLS; y (3) sustitucion del tokenizer por el original de deepvk, compatible con el lector de Manticore, con truncacion a 512 tokens. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO, ya que el autor no aporta esa informacion y corresponde al modelo base. La innovacion destacable es exclusivamente de integracion: la correccion del pooling, que segun el autor eleva la precision@10 de 0,30 (mean pooling) a 0,40 (CLS) en su conjunto de prueba de busqueda hotelera.

## Capacidades

- Generacion de embeddings de texto (feature-extraction) para busqueda semantica y similitud coseno.
- Soporte nativo de ruso e ingles, con calidad orientada al dominio ruso segun el modelo base.
- Embeddings de 1024 dimensiones, adecuados para indices HNSW con similitud coseno.
- Auto-embeddings dentro de Manticore Search: el motor descarga el modelo y genera vectores a partir de una columna de texto, sin servicio externo.
- No requiere prefijos de instruccion para consultas ni para documentos.
- Integracion directa en DDL de Manticore (`CREATE TABLE ... FLOAT_VECTOR KNN_TYPE='hnsw' ... MODEL_NAME='...' FROM='...'`).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Busqueda semantica en Manticore Search sobre corpus rusos: se declara una columna `FLOAT_VECTOR` con `MODEL_NAME` apuntando a este repositorio y Manticore descarga el modelo y vectoriza la columna de texto automaticamente, sin desplegar un servidor de inferencia aparte.
- Busqueda hibrida (lexica + vectorial) en catalogos de productos o inventarios hoteleros: el autor valida el modelo en un conjunto de prueba de busqueda de hoteles, donde la correccion CLS mejora la precision@10 de 0,30 a 0,40.
- Deduplicacion y agrupacion de documentos bilingues ruso-ingles: los embeddings de 1024 dimensiones permiten calcular similitud coseno por pares o agrupar por vecindad en un indice HNSW.
- Sistemas de recomendacion basados en contenido: vectorizar descripciones y titulos para recuperar items similares mediante KNN sobre el indice de Manticore.
- Clasificacion y clustering de textos mediante embeddings congelados: extraer representaciones y alimentar clasificadores ligeros o algoritmos de clustering sin reentrenar el encoder.
- Despliegue en entornos con recursos limitados: el repositorio de 0,4 GB y la cuantizacion INT8 reducen el coste de memoria y almacenamiento frente al modelo en punto flotante, lo que facilita ejecutarlo junto al motor de busqueda en la misma maquina.
- Filtrado semantico previo a un reranking: usar los embeddings como primera etapa de recuperacion y reservar modelos mas costosos para la segunda fase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni metricas MTEB) en la informacion disponible. El unico dato de rendimiento aportado por el autor es interno: en su conjunto de prueba de busqueda hotelera, la precision@10 es de 0,40 con pooling CLS (configuracion de este repositorio) frente a 0,30 con mean pooling simple.

| Metrica | Este repositorio (CLS) | Mean pooling simple |
|---|---|---|
| Precision@10 (prueba de busqueda hotelera del autor) | 0,40 | 0,30 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con cuantizacion INT8 y un repositorio de 0,4 GB, la huella de memoria es del orden de cientos de MB, muy por debajo de la version en punto flotante.
- GPU recomendadas: no disponible; al ser un encoder XLM-RoBERTa cuantizado a INT8, es viable en GPU consumer (RTX 3060, RTX 4090) y en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con varios GB de VRAM; el autor no publica requisitos minimos verificados.
- Opciones de despliegue: el destino principal es Manticore Search 29.0.2 con auto-embeddings; al ser un ONNX estandar, tambien puede ejecutarse con ONNX Runtime u otras herramientas compatibles con ONNX, aunque el autor solo valida Manticore.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Kemel91/user-bge-m3-int8-cls | no disponible | 512 tokens | 1024 | ru, en | Apache 2.0 | ONNX INT8 |
| deepvk/USER-bge-m3 (modelo base) | no disponible | no disponible | 1024 | ru, en | Apache 2.0 | safetensors (no confirmado en la informacion) |
| skatzR/USER-BGE-M3-ONNX-INT8 | no disponible | no disponible | 1024 | ru, en | Apache 2.0 | ONNX INT8 |
| BAAI/bge-m3 | no disponible | no disponible | 1024 | multilingue | no disponible | no disponible |

La comparativa se limita a los modelos citados en la informacion disponible; no se aportan datos de rendimiento comparativo entre ellos. Frente al modelo base y a la cuantizacion de skatzR, la diferencia de este repositorio es la compatibilidad con Manticore (entrada token_type_ids, pooling CLS replicado y tokenizer compatible), no la calidad intrinseca del encoder.

## Limitaciones y advertencias

- Solo cubre ruso e ingles; no se garantiza calidad en otros idiomas.
- Truncacion estricta a 512 tokens: los textos mas largos se recortan y sus vectores divergen del modelo original.
- Es un encoder de embeddings, no un modelo generativo: no responde preguntas, no razona y no soporta tool calling ni agentes.
- Riesgo de sesgos y alucinacion semantica heredado del modelo base y de sus datos de entrenamiento; el autor no documenta evaluaciones de sesgo.
- El repositorio esta pensado para Manticore Search 29.0.2; su uso fuera de ese motor no esta validado y las modificaciones del grafo (token_type_ids y CLS replicado) pueden no ser neutras en otras herramientas.
- Los ficheros no se reemplazan nunca: una reconstruccion se publica en un repositorio nuevo, de modo que los vectores almacenados no se mezclan con los de un modelo distinto. Hay que fijar la revision al indexar y al consultar.
- El modelo tiene 16 descargas y 0 likes en el momento de la consulta, sin senales de adopcion amplia; conviene validarlo en el dominio propio antes de produccion.
- Licencia Apache 2.0, que permite uso comercial, pero debe verificarse la cadena de atribucion hacia deepvk/USER-bge-m3 y skatzR/USER-BGE-M3-ONNX-INT8.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kemel91/user-bge-m3-int8-cls
- Modelo base: https://huggingface.co/deepvk/USER-bge-m3
- Cuantizacion INT8 de origen: https://huggingface.co/skatzR/USER-BGE-M3-ONNX-INT8
