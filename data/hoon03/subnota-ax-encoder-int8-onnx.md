# Hoon03/subnota-ax-encoder-int8-onnx

## Resumen

`Hoon03/subnota-ax-encoder-int8-onnx` es una conversion no oficial a ONNX del modelo `skt/A.X-Encoder-base`, desarrollado originalmente por SK Telecom (SKT AI Model Lab). La conversion la firma el usuario Hoon03 dentro del proyecto Subnota, una aplicacion de escritorio, y consiste en exportar el modelo PyTorch original a ONNX (opset 17) y aplicar cuantizacion dinamica int8 con signo sobre los pesos de las operaciones `MatMul` y `Gather`. No se realizo ningun entrenamiento ni ajuste adicional: es un cambio de formato y de precision, no un modelo nuevo.

El modelo subyacente es un encoder tipo masked-language model de la familia ModernBERT (asi aparece etiquetado en el repositorio) orientado al coreano. Su proposito practico no es la generacion de texto, sino la extraccion de representaciones y el procesamiento de lenguaje natural en tareas tipo clasificacion, etiquetado de secuencias o recuperacion de informacion en coreano, con un consumo de recursos reducido al estar en int8.

Su relevancia ahora es de tipo operativo: permite ejecutar un encoder coreano en un entorno de escritorio, en CPU y sin GPU dedicada, con un fichero de pesos de 188.885.598 bytes (unos 180 MiB). Al ser una conversion no oficial y sin benchmarks publicados, el valor de la ficha es documentar exactamente que contiene el repositorio, que se ha modificado respecto al original y que queda fuera de su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT (segun la etiqueta `modernbert` del repositorio), exportado a ONNX |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 dinamica con signo sobre pesos de `MatMul` y `Gather`; el resto de tensores conserva su formato original |
| Idiomas soportados | coreano (etiqueta `korean`); no se detallan mas idiomas en la informacion disponible |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX, opset 17; fichero unico `onnx/model_quantized.onnx` |
| Tamano del fichero de pesos | 188.885.598 bytes |
| SHA-256 del fichero cuantizado | `fb18f550c6fd5194819a6c5fd8e1e318bc6524019543803b07fc4b5f131ee9c0` |
| Modelo base | `skt/A.X-Encoder-base`, revision `9708f9c404ace91efd25c06fac2d73413616f4ef` |
| Tokenizer y configuracion | copiados sin cambios desde la revision original |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo `skt/A.X-Encoder-base`, un encoder transformer de la familia ModernBERT segun la etiqueta declarada en el repositorio. La conversion no altera la topologia: se exporta el grafo a ONNX con opset 17 y se aplica cuantizacion dinamica, de modo que los pesos de `MatMul` y `Gather` pasan a int8 con signo mientras el resto del grafo mantiene la precision original. La cuantizacion dinamica calcula los rangos de escala en tiempo de ejecucion, lo que simplifica la conversion pero puede implicar una perdida de precision que el autor no cuantifica en la model card.

No hubo entrenamiento, ajuste fino ni destilacion en esta conversion. Los unicos datos de entrenamiento aplicables son los del modelo original de SK Telecom, que la informacion disponible no detalla (numero de tokens, composicion del corpus, uso de RLHF o DPO, etc.). El tokenizer y los ficheros de configuracion se copian literalmente de la revision `9708f9c404ace91efd25c06fac2d73413616f4ef`, por lo que el vocabulario y la configuracion de atencion son identicos a los del modelo base. El script de conversion esta publicado en el repositorio de Subnota, en la ruta `desktop/scripts/export-ax-encoder.py`.

## Capacidades

- Codificacion de texto en coreano: al ser un masked-language model, produce representaciones contextuales por token y por secuencia, utiles como backbone para tareas posteriores.
- Clasificacion de secuencias: analisis de sentimiento, deteccion de intencion, moderacion de contenido, clasificacion de tickets, siempre que se anada una cabeza de clasificacion y se ajuste el modelo.
- Etiquetado de tokens (NER, POS, chunking): la salida por token permite tareas de extraccion de entidades sobre texto coreano.
- Extraccion de caracteristicas para busqueda semantica y clustering: los embeddings del encoder pueden alimentar indices vectoriales.
- Inferencia en CPU y entornos de escritorio: el grafo ONNX int8 esta pensado para ejecutarse sin GPU, integrado en una aplicacion nativa.
- Generacion de texto: no soportada. Es un modelo exclusivamente encoder, sin decodificador ni cabeza generativa.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no acreditadas en la informacion proporcionada; el repositorio lo etiqueta como coreano.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Analisis de sentimiento en resenas coreanas: se apila una cabeza de clasificacion sobre el encoder y se ajusta con un corpus etiquetado; el formato int8 permite servirlo en un portatil sin GPU.
- Extraccion de entidades en documentos administrativos coreanos: la salida por token permite identificar nombres, organizaciones y fechas; el modelo corre en local, lo que evita enviar documentos sensibles a servicios externos.
- Motor de busqueda semantica sobre corpus en coreano: se generan embeddings con el encoder y se indexan en una base vectorial; el coste de inferencia en int8 es bajo y adecuado para indexado por lotes.
- Clasificacion de tickets de soporte en una aplicacion de escritorio: el modelo se integra en el cliente (por ejemplo, la propia aplicacion Subnota) y etiqueta la consulta antes de enrutarla al equipo correspondiente.
- Preprocesado y filtrado de datos para pipelines de NLP: se usa como modelo de filtrado o deduplicacion semantica en la fase de curacion de un dataset coreano, aprovechando el bajo coste de ejecucion en CPU.
- Deteccion de contenido inapropiado en comunidades coreanas: clasificador binario o multiclase ajustado sobre el encoder, ejecutable en servidor modesto gracias al fichero de 180 MiB.
- Base para ajuste fino en tareas especificas: al estar en ONNX se puede reentrenar en PyTorch partiendo del modelo original de SKT y reexportar; esta conversion sirve como artefacto de despliegue, no como punto de partida de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision del modelo base ni del modelo cuantizado, ni comparaciones con la version PyTorch original, por lo que no es posible cuantificar la degradacion introducida por la cuantizacion int8.

## Requisitos de hardware

- Huella de pesos: unos 180 MiB en disco (188.885.598 bytes) y una cifra similar de memoria al cargar el grafo, mas el overhead del runtime de ONNX y los buffers de activaciones.
- VRAM estimada para GPU: por debajo de 1 GB en la practica; cualquier GPU con 1-2 GB libres puede alojar el modelo. Cifra orientativa derivada del tamano del fichero, no de una medicion publicada.
- CPU: es el objetivo natural del artefacto. La cuantizacion int8 de `MatMul` y `Gather` esta pensada para acelerar inferencia en CPU.
- Cabe en GPU de consumo: si, en cualquier RTX o GTX con al menos 1 GB libre, e incluso en iGPU modernas; el cuello de botella real es el coste de las operaciones no cuantizadas.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML), Hugging Face Optimum, `onnxruntime-web` / Transformers.js para navegador, y Windows ML en el contexto de aplicaciones de escritorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota sobre precision: al ser cuantizacion dinamica, parte de las operaciones siguen en precision original, por lo que la ganancia de velocidad es menor que con una cuantizacion estatica completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| `Hoon03/subnota-ax-encoder-int8-onnx` (esta ficha) | no disponible | no disponible | ONNX opset 17 | int8 dinamica en `MatMul` y `Gather` | Apache 2.0 | sin benchmarks publicados |
| `skt/A.X-Encoder-base` (original) | no disponible | no disponible | PyTorch / safetensors | FP32 (presumiblemente) | Apache 2.0 | no disponible en la informacion proporcionada |
| Otros encoders coreanos o basados en ModernBERT | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento de alternativas, por lo que no es posible establecer una comparacion cuantitativa con modelos como los encoders de la familia KLUE, KoBERT o las variantes de ModernBERT. La unica comparacion verificable es la que enfrenta esta conversion con su modelo de origen, y en esa comparacion el unico dato objetivo es el formato y el tamano del fichero.

## Limitaciones y advertencias

- Conversion no oficial: no ha sido validada ni respaldada por SK Telecom ni por Subnota como producto oficial; la propia model card lo indica de forma explicita.
- Sin entrenamiento ni ajuste: no incorpora ninguna mejora sobre el modelo base; cualquier limitacion de `skt/A.X-Encoder-base` se hereda.
- Sin benchmarks: no hay medicion publicada de la degradacion de precision causada por la cuantizacion int8 dinamica.
- Sin adopcion verificable: el repositorio registra 0 descargas y 0 likes en la informacion disponible, por lo que no existe validacion por parte de terceros.
- Modelo exclusivamente encoder: no genera texto ni soporta conversacion, tool calling ni razonamiento multi-paso.
- Cobertura idiomatica: el repositorio se etiqueta como coreano; no hay evidencia de un rendimiento solido en castellano u otros idiomas.
- Longitud de contexto desconocida: no se declara en la informacion disponible, lo que impide planificar tareas de documentos largos sin verificacion previa.
- Riesgo de sesgo y alucinacion: no evaluado en la informacion disponible. En un encoder, el riesgo de alucinacion se traslada a errores de clasificacion o extraccion, no a texto inventado.
- Licencia: Apache 2.0, permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia. Al derivar de un modelo de SK Telecom, conviene mantener la atribucion al autor original.
- Integridad del artefacto: el fichero se distribuye con un SHA-256 publicado, por lo que conviene verificar el hash antes de desplegarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hoon03/subnota-ax-encoder-int8-onnx
- Modelo base `skt/A.X-Encoder-base`: https://huggingface.co/skt/A.X-Encoder-base
- Revision concreta del modelo base: https://huggingface.co/skt/A.X-Encoder-base/tree/9708f9c404ace91efd25c06fac2d73413616f4ef
- Codigo fuente de Subnota (incluye `desktop/scripts/export-ax-encoder.py`): https://github.com/SUNGHOONOH/Subnota
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- ONNX Runtime, catalogo de modelos: https://onnxruntime.ai/models
- ONNX Model Zoo: https://github.com/onnx/models

Nota: los enlaces a ONNX Runtime y ONNX Model Zoo provienen de los resultados de busqueda y se incluyen como referencia general sobre el ecosistema ONNX; no documentan este modelo concreto. No se han encontrado papers, blogs ni demos especificos de esta conversion en la informacion disponible.
