# AnonymisedSafe/TMLR_supplement

## Resumen

`AnonymisedSafe/TMLR_supplement` no es un modelo de lenguaje en el sentido habitual, sino un repositorio de artefactos suplementarios asociados a una submission anonima en revision para TMLR (Transactions on Machine Learning Research). El repositorio contiene tres ficheros ONNX que forman parte del zip suplementario de dicha submission, ubicados originalmente bajo el directorio `weights/`, y que un notebook incluido en ese mismo zip descarga y verifica mediante SHA-256 antes de ejecutarse.

El contenido tecnico disponible es minimo: no se publica model card descriptiva, ni arquitectura, ni numero de parametros, ni datos de entrenamiento, ni resultados de benchmarks. La model card se limita a indicar el proposito (revision por pares) y a listar los hashes SHA-256 de los tres ficheros. Los nombres de los artefactos (`eyes_splitter_fp16.onnx`, `head.onnx`, `eyes_splitter.onnx`) sugieren un pipeline de vision por computador con etapas separadas de deteccion/segmentacion y una cabeza de clasificacion o prediccion, pero esto es una inferencia a partir de los nombres y no un dato confirmado por el autor.

Su relevancia actual es, por tanto, limitada y acotada al proceso de revision cientifica: no esta pensado para uso general, no se concede licencia para ningun uso distinto de la revision, y el autor indica que la licencia definitiva se declarara en el momento de la publicacion. Cualquier evaluacion de capacidades, rendimiento o idoneidad para produccion queda fuera del alcance de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye una variante en FP16: `eyes_splitter_fp16.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sin licencia concedida para uso distinto de la revision por pares; se declarara en publicacion) |
| Formato de pesos | ONNX (tres ficheros: `eyes_splitter_fp16.onnx`, `head.onnx`, `eyes_splitter.onnx`) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la informacion disponible. Los unicos indicios son los nombres de los ficheros ONNX: `eyes_splitter_fp16.onnx` y `eyes_splitter.onnx` apuntan a un componente de separacion o segmentacion (posiblemente relacionado con regiones oculares) en dos precisiones, y `head.onnx` a una cabeza de prediccion que consumiria la salida del componente anterior. Se desconoce si se trata de una CNN, un transformer visual, un modelo hibrido o cualquier otra familia.

Tampoco hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. Los hashes SHA-256 publicados son:

| Fichero | SHA-256 |
|---|---|
| `eyes_splitter_fp16.onnx` | `668854607f6fa4b945b2b589ddde22696d2d3130858eababcd599a91484046b2` |
| `head.onnx` | `f1e88cd6255c7083ce0a49fbd0210949686a0be921984e21e5507d9b114103bb` |
| `eyes_splitter.onnx` | `49fce9ac7aed286352c6590e5e3fd954039b309ada764f92d6a0c49566402198` |

## Capacidades

- Distribucion de pesos en formato ONNX, lo que permite inferencia con ONNX Runtime y otros runtimes compatibles.
- Presencia de una variante en FP16 (`eyes_splitter_fp16.onnx`), orientada a reducir huella de memoria y acelerar inferencia en hardware con soporte de media precision.
- Pipeline presumiblemente compuesto por al menos dos etapas (splitter y head), segun los nombres de los ficheros; no confirmado por el autor.
- Verificacion de integridad mediante SHA-256 documentada por el autor.
- Generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, capacidades multilingues, thinking mode, audio: no disponible o no aplicable segun la informacion publicada.

## Casos de uso

- Revision por pares de la submission asociada: el unico uso explicitamente autorizado. El revisor descarga los tres ONNX y ejecuta el notebook suplementario, que valida los hashes antes de la ejecucion.
- Verificacion de reproducibilidad: comprobar que los pesos evaluados coinciden bit a bit con los del zip original mediante los SHA-256 publicados.
- Auditoria de artefactos ONNX: inspeccionar grafo, operadores y shapes con herramientas como Netron o `onnx.checker` para entender la estructura del pipeline, sin necesidad de ejecutar inferencia.
- Pruebas de integracion en ONNX Runtime: validar que los tres modelos cargan y encadenan correctamente en un entorno controlado, como paso previo a una eventual publicacion con licencia.
- Analisis de coste en FP16 frente a FP32: comparar latencia y memoria entre `eyes_splitter_fp16.onnx` y `eyes_splitter.onnx` en el mismo hardware, si el autor lo permite en el marco de la revision.
- Archivo y trazabilidad a largo plazo: conservar los hashes y los ficheros como referencia del estado exacto de los artefactos en el momento de la revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio figura como 0.0 GB, lo que impide derivar una estimacion fiable; el fichero `eyes_splitter_fp16.onnx` tiene un hash publicado pero no se indica su tamano en bytes.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (CPU y GPU) es el runtime natural para los formatos distribuidos; otros runtimes compatibles con ONNX podrian utilizarse, pero no estan documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la tarea concreta, el tamano y el dominio de aplicacion del pipeline.

## Limitaciones y advertencias

- Restriccion de licencia severa: el autor declara que no se concede licencia para ningun uso distinto de la revision por pares de la submission, y que todos los derechos estan reservados. No es apto para uso comercial, redistribucion ni despliegue en produccion.
- Anonimato: el repositorio pertenece a una submission en revision; el contenido puede cambiar o desaparecer tras la decision editorial.
- Ausencia total de documentacion tecnica: sin arquitectura, parametros, contexto ni idiomas declarados, es imposible evaluar sesgos, alucinacion o calidad.
- Riesgo de interpretacion erronea de los nombres de fichero: la hipotesis de un pipeline splitter + head es una inferencia, no un dato del autor.
- Sin garantias de mantenimiento: no hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de uso comunitario y de soporte.
- Los hashes SHA-256 permiten verificar integridad, pero no autenticidad criptografica frente a un tercero ni calidad del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AnonymisedSafe/TMLR_supplement
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este repositorio.
