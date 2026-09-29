# arturschubertlit/laya-multilingual-int8

## Resumen

`arturschubertlit/laya-multilingual-int8` es una compilación en ONNX cuantizada a INT8 del modelo `convaiinnovations/laya-multilingual` de Convai Innovations, publicada por el usuario arturschubertlit. No se trata de un modelo generativo: segun su propia model card, es un artefacto de decision "System-1" para la aplicacion LINGURA (`com.lingura.app`), descrito explicitamente como un clasificador/enrutador no autorregresivo que unicamente clasifica y nunca genera texto. El repositorio ocupa 0,3 GB e incluye un fichero `metadata.json` con el contrato de tensores y los hashes sha256 y tamanos por fichero.

La relevancia de esta publicacion es practica mas que cientifica: convierte un modelo multilingue en un binario ONNX INT8 ligero, pensado para ejecutarse en inferencia de baja latencia dentro de un pipeline de clasificacion o enrutamiento, presumiblemente en el cliente o en un servicio con recursos limitados. La cuantizacion se realizo con `torch.onnx.export` seguido de `quantize_dynamic`, aplicando cuantizacion INT8 por canal a las operaciones MatMul, segun se detalla en la model card.

Conviene subrayar que este repositorio es una redistribucion derivada: el merito del modelo original corresponde a Convai Innovations, y la licencia Apache 2.0 del original se mantiene. El repositorio no registra descargas ni likes en el momento de la consulta y no incluye resultados de evaluacion propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo de clasificacion/enrutamiento (segun la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (dynamic quantization, MatMul a INT8 por canal) |
| Idiomas soportados | no disponible (el nombre del modelo indica "multilingual", sin lista oficial) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

Segun la informacion disponible, el modelo subyacente (`convaiinnovations/laya-multilingual`) es un clasificador/enrutador no autorregresivo: recibe una entrada y produce una decision de clasificacion, sin decodificacion autoregresiva ni generacion de tokens. No se especifica en la informacion proporcionada el tipo exacto de backbone (encoder tipo BERT/XLM-R, encoder-decoder, u otra variante), el numero de parametros, la dimension oculta, el numero de capas ni el vocabulario.

En cuanto al proceso de derivacion, la model card indica que la compilacion se genero con `torch.onnx.export` seguido de `quantize_dynamic`, aplicando cuantizacion por canal a las operaciones MatMul, a partir de la revision `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67` del modelo original. El pipeline de conversion se encuentra en la ruta `scripts/laya/` del repositorio de LINGURA. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo fases de RLHF o DPO (poco probables en un clasificador).

## Capacidades

- Clasificacion y enrutamiento: la funcion declarada del modelo es tomar decisiones de clasificacion (asignar una entrada a una categoria o ruta), no generar texto.
- Naturaleza no generativa: segun la model card, "classification only, never generates", por lo que no produce respuestas de texto libre.
- Multilingue: el nombre del modelo sugiere cobertura multilingue, aunque no se especifica la lista de idiomas soportados.
- Contrato de tensores documentado: el repositorio incluye `metadata.json` con la descripcion del contrato de tensores y los hashes sha256 por fichero, lo que facilita la verificacion de integridad y la integracion en produccion.
- Inferencia ligera: al ser un artefacto INT8 ONNX de 0,3 GB, esta orientado a despliegue de baja latencia y bajo consumo de memoria.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la peticion entrante del usuario y derivarla al subsistema adecuado (por ejemplo, consulta de cuenta, soporte tecnico o accion transaccional), reduciendo el trabajo de un modelo generativo posterior.
- Clasificacion de tickets en atencion al cliente: integrarlo como primera etapa de un pipeline para etiquetar automaticamente la categoria y prioridad de cada ticket antes de asignarlo a un agente humano o a un flujo automatizado.
- Moderacion de contenido: emplearlo como clasificador previo para filtrar o marcar mensajes que requieran revision, apoyandose en su caracter multilingue para cubrir usuarios de distintos idiomas.
- Puerta de decision en pipelines de bajo coste: al ser un ONNX INT8 de 0,3 GB, puede ejecutarse en CPU o en dispositivos con recursos limitados, sirviendo como filtro rapido antes de invocar modelos mas caros.
- Compatibilidad con `com.lingura.app` (LINGURA): la model card lo describe como artefacto de decision propietario de esa aplicacion, por lo que su caso de uso nativo es la logica de decision interna de ese sistema.
- Enrutamiento de consultas multilingues en buscadores o bases de conocimiento: clasificar la consulta del usuario por tema o idioma para dirigirla al indice o al componente de recuperacion adecuado.
- Preprocesado en cascadas de LLM: usarlo como clasificador barato que decide si una peticion necesita un modelo grande o si puede resolverse con una respuesta predefinida o una plantilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el propio artefacto, dado que el repositorio completo ocupa 0,3 GB; no se especifica la memoria de activaciones ni el pico de uso en inferencia.
- Estimacion de tamano: partiendo de los 0,3 GB del repositorio y de la cuantizacion INT8 (aproximadamente 1 byte por parametro), el modelo cabria en el rango de 250-350 millones de parametros, si bien este calculo es una inferencia a partir del tamano del repo y no un dato confirmado por el autor.
- GPU recomendadas: no disponible. Por su tamano y su formato ONNX INT8, es apto para ejecucion en CPU y en practicamente cualquier GPU consumer (RTX 3060, RTX 4090, etc.), pero no hay recomendaciones oficiales.
- Viabilidad en GPU consumer: muy probablemente si, dado el tamano reducido, aunque no se proporciona una lista de hardware validado.
- Opciones de despliegue: al estar en formato ONNX, es compatible con runtimes ONNX, ONNX Runtime y servicios que acepten este formato. No se mencionan vLLM, llama.cpp, Ollama ni TGI (poco aplicables a un clasificador ONNX no generativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Licencia | Funcion | Disponibilidad |
|---|---|---|---|---|---|
| `arturschubertlit/laya-multilingual-int8` | ONNX | INT8 | apache-2.0 | Clasificacion/enrutamiento | HuggingFace (0 descargas) |
| `convaiinnovations/laya-multilingual` | no disponible | no disponible (presumiblemente fp32) | apache-2.0 | Clasificacion/enrutamiento | HuggingFace (modelo original) |
| Otros clasificadores multilingues (XLM-R, mBERT, etc.) | safetensors/ONNX segun variante | variable | variable | Clasificacion | HuggingFace |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo no generativo: no puede producir texto; cualquier uso que espere generacion dara resultados incorrectos.
- Ausencia de evaluacion: el repositorio no incluye resultados de benchmarks ni metricas de exactitud, por lo que no hay evidencia publicada de su calidad en tareas concretas.
- Falta de especificaciones: se desconocen el numero de parametros, la longitud de contexto, la dimension de la salida (numero de clases) y los idiomas exactamente soportados.
- Sesgos: no disponible; al no documentarse el dataset de entrenamiento original, no es posible evaluar sesgos demograficos, culturales o linguisticos.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto), pero si existe riesgo de clasificacion erronea, especialmente en entradas fuera de la distribucion de entrenamiento.
- Repositorio derivado y sin validacion: se trata de una cuantizacion de terceros con cero descargas y cero likes en el momento de la consulta; la integridad depende de los hashes incluidos en `metadata.json`, pero no hay validacion independiente de la fidelidad frente al modelo original.
- Fecha de publicacion inusual: el repositorio figura creado y actualizado el 2026-09-28, dato que conviene verificar antes de tomarlo como referencia.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado conviene conservar los avisos de atribucion del modelo original de Convai Innovations.
- Dependencia de la aplicacion LINGURA: parte de su proposito declarado esta ligado al contrato interno de `com.lingura.app`, por lo que su reutilizacion fuera de ese contexto puede requerir adaptar la capa de decision.

## Enlaces

- Repositorio del modelo: https://huggingface.co/arturschubertlit/laya-multilingual-int8
- Modelo original: https://huggingface.co/convaiinnovations/laya-multilingual
- Revision base citada: `e4e9ddf21a7b1903b7acffd8814ad4307bf63a67`
