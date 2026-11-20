# Ritual-Net/ritual-pii-minilm

## Resumen

Ritual PII MiniLM es un clasificador de tokens (token classification) especializado en la deteccion de datos personales (PII) en cuerpos HTTP, desarrollado por Ritual-Net y publicado en Hugging Face. Se construye sobre la arquitectura `microsoft/Multilingual-MiniLM-L12-H384`, un transformer encoder de tipo BERT con 117.517.855 parametros totales, y se distribuye bajo licencia BSD-3-Clause. El modelo esta pensado para integrarse en un sidecar de ejecucion que intercepta peticiones HTTP y redacta informacion sensible antes de que salga del perimetro.

El problema que resuelve es concreto: los checkpoints previos de deteccion de PII fallaban en dos escenarios tipicos de trafico real. Por un lado, nombres personales embebidos en campos JSON como `name`, `full_name`, `customer` o `patient`. Por otro, credenciales en fragmentos de codigo, como claves de API con prefijos `sk-proj-` o `AKIA`, o asignaciones del tipo `password=` y `api_key=`. El modelo continua el entrenamiento desde `crp4222/privaite-pii-minilm` con datos sinteticos orientados a cubrir esas dos lagunas, manteniendo congelada la tabla de embeddings de 96M de parametros para preservar el etiquetado original de 15 tipos.

La relevancia actual del modelo no reside en su tamano ni en su rendimiento bruto, sino en su perfil de despliegue: se sirve como ONNX INT8 de 113 MB, procesa un cuerpo JSON de canario en aproximadamente 8 ms p50 sobre una CPU de 12 nucleos y no requiere GPU. Es una pieza de infraestructura de privacidad, no un modelo generativo, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12, 12 capas) |
| Parametros totales | 117.517.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 (archivo `onnx/model_int8.onnx`); pesos originales en safetensors |
| Idiomas soportados | multilingual, en |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors, ONNX (INT8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de la familia BERT, concretamente la variante MiniLM-L12-H384 de Microsoft, con 12 capas y dimension oculta de 384. El modelo se usa como cabecera de clasificacion de tokens (token classification), no como modelo generativo: recibe `input_ids` y `attention_mask` y emite una etiqueta por token dentro de un esquema de 15 tipos de PII heredado del checkpoint base.

El entrenamiento parte de `crp4222/privaite-pii-minilm` en el commit `e5f6a01d465c9a2489a74a95ff1151359b759213`. La tabla de embeddings de 96M de parametros se mantiene congelada durante el ajuste, de modo que el etiquetado original de 15 tipos no se degrada. Los datos adicionales son sinteticos y se centran en dos carencias identificadas: nombres personales en campos JSON estructurados y credenciales embebidas en codigo. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, algo esperable por otra parte en un modelo discriminativo de este tipo. Los identificadores estructurados siguen cubriendose mediante expresiones regulares en el sidecar del ejecutor; el modelo no sustituye esa capa.

## Capacidades

- Deteccion y clasificacion de entidades de datos personales a nivel de token, con un esquema de 15 tipos heredado del checkpoint base.
- Reconocimiento de nombres personales en valores de campos JSON con claves como `name`, `full_name`, `customer` o `patient`.
- Deteccion de credenciales en codigo: claves con prefijos `sk-proj-` y `AKIA`, asignaciones `password=` y `api_key=`.
- Procesamiento multilingue e ingles, segun los idiomas declarados en la model card.
- Inferencia en CPU mediante ONNX INT8, sin dependencia de GPU.
- Integracion como sidecar de redaccion en el hop HTTP, con una latencia de aproximadamente 8 ms p50 para el cuerpo JSON de canario sobre 12 nucleos.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio: es un clasificador discriminativo, no un modelo de lenguaje generativo.

## Casos de uso

- Redaccion de PII en pasarelas HTTP: el modelo se carga en un sidecar que intercepta el cuerpo de la peticion, clasifica cada token y sustituye las entidades sensibles antes de reenviar el trafico a servicios externos. Su latencia de 8 ms p50 en CPU lo hace viable en linea.
- Cumplimiento de RGPD en pipelines de datos: deteccion de nombres y credenciales en payloads JSON antes de persistirlos en logs o almacenes analiticos, reduciendo la superficie de exposicion de datos personales.
- Proteccion de secretos en codigo generado o enviado a APIs: deteccion de claves `sk-proj-`, `AKIA`, `password=` y `api_key=` en fragmentos de codigo que atraviesan un proxy, evitando fugas de credenciales.
- Enmascaramiento en entornos sanitarios: el campo `patient` aparece explicitamente entre los objetivos de entrenamiento, lo que permite redactar identificadores en formularios clinicos estructurados antes de su procesamiento.
- Filtrado previo en plataformas de atencion al cliente: redaccion de nombres y datos de contacto en transcripciones o mensajes estructurados antes de alimentar sistemas de analitica o QA.
- Despliegue en entornos con recursos limitados: al ser un ONNX INT8 de 113 MB que corre en CPU, encaja en contenedores pequenos, edge nodes o funciones serverless donde no hay GPU disponible.
- Capa complementaria a un motor de reglas: combinado con el regex del sidecar para identificadores estructurados (tarjetas, IBAN, telefonos), cubre los casos que las expresiones regulares no detectan, como nombres libres en valores JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento proporcionado es operativo: el cuerpo JSON de canario se redacta en aproximadamente 8 ms p50 sobre una CPU de 12 nucleos con el archivo `onnx/model_int8.onnx`.

## Requisitos de hardware

- VRAM: no requiere GPU. El archivo INT8 es de 113 MB y la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; el modelo esta disenado para ejecucion en CPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; puede ejecutarse en cualquier GPU si se convierte, pero no aporta ventaja frente a la CPU.
- Opciones de despliegue: ONNX Runtime con el archivo `onnx/model_int8.onnx` (ruta usada por el sidecar); los pesos safetensors estan disponibles para uso con la libreria `transformers`.
- Latencia y throughput: aproximadamente 8 ms p50 por cuerpo JSON de canario en una CPU de 12 nucleos. No se proporcionan datos de throughput agregado ni de latencia p99.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el modelo hereda la arquitectura y el esquema de etiquetado de `crp4222/privaite-pii-minilm`, del que se diferencia por el ajuste adicional sobre nombres en JSON y credenciales en codigo, y comparte base con `microsoft/Multilingual-MiniLM-L12-H384`, un encoder multilingue generico sin cabecera de PII.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Ritual-Net/ritual-pii-minilm | 117.517.855 | no disponible | Token classification (PII) | BSD-3-Clause |
| crp4222/privaite-pii-minilm | no disponible | no disponible | Token classification (PII) | no disponible |
| microsoft/Multilingual-MiniLM-L12-H384 | no disponible | no disponible | Encoder multilingue generico | no disponible |

## Limitaciones y advertencias

- El modelo no sustituye la capa de expresiones regulares del sidecar: los identificadores estructurados siguen dependiendo de regex en el ejecutor.
- Los datos de entrenamiento adicionales son sinteticos, lo que puede introducir un sesgo hacia los patrones generados y reducir la generalizacion a formatos reales no representados.
- El esquema de etiquetado se limita a 15 tipos de PII heredados del checkpoint base; categorias fuera de ese esquema no se detectan.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide garantizar el comportamiento en cuerpos HTTP de gran tamano.
- Los idiomas declarados son `multilingual` y `en`; no se especifica la cobertura real por idioma ni la calidad en lenguas distintas del ingles.
- Riesgo de falsos positivos y falsos negativos inherente a un clasificador de tokens: la redaccion automatica sin revision puede eliminar datos legitimos o dejar pasar entidades sensibles.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-19; no hay evidencia de uso en produccion por terceros.
- La licencia BSD-3-Clause permite uso comercial, pero conviene verificar las condiciones del checkpoint base `crp4222/privaite-pii-minilm`, cuya licencia no se detalla en la informacion disponible.
- No debe usarse como unico mecanismo de cumplimiento normativo: requiere validacion, monitorizacion y auditoria en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ritual-Net/ritual-pii-minilm
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Checkpoint de partida: https://huggingface.co/crp4222/privaite-pii-minilm
- Commit de partida: `e5f6a01d465c9a2489a74a95ff1151359b759213` (repositorio de `crp4222/privaite-pii-minilm`)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
