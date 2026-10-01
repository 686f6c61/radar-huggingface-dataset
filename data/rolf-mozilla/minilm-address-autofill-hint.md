# rolf-mozilla/minilm-address-autofill-hint

## Resumen

minilm-address-autofill-hint es un clasificador de campos de formulario desarrollado por rolf-mozilla, orientado especificamente a tareas de autorrelleno de direcciones. El modelo se construye sobre una arquitectura MiniLM de tipo BERT con solo 4 capas y un vocabulario reducido de 18.500 tokens, lo que lo situa en la categoria de modelos muy ligeros pensados para inferencia en el navegador. Su funcion concreta es clasificar el tipo de campo de un formulario web entre 66 tipos distintos, de modo que el navegador pueda decidir que dato del perfil del usuario insertar en cada casilla.

El modelo se distribuye en formato ONNX con cuantizacion int8, empaquetado especificamente para su uso con Firefox transformers.js. Segun la model card, fue entrenado con datos "tail" multilingues debiles y una senal adicional de pistas basadas en expresiones regulares (el denominado run `cckrm`). El repositorio ocupa 0,3 GB y no registra descargas ni interacciones en el momento de la consulta.

Es relevante en el contexto del autorrelleno nativo del navegador porque demuestra un enfoque de modelo pequeno, cuantizado y ejecutable en cliente para una tarea de clasificacion muy concreta, sin depender de enviar el contenido del formulario a un servidor. La informacion publica disponible es, sin embargo, muy escasa: no hay ficha de pipeline, licencia, idiomas declarados ni resultados de benchmarks mas alla de dos metricas internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniLM tipo BERT, single-encoder, 4 capas |
| Parametros totales | no disponible (la model card solo indica 4 capas y vocabulario de 18.500 tokens) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX cuantizado); se desconoce si el repo incluye tambien pesos fp32/fp16 |
| Idiomas soportados | no disponible; el entrenamiento uso "weak multilingual tail data", sin lista de idiomas |
| Licencia | no disponible |
| Formato de pesos | ONNX (version cuantizada int8); no se indica safetensors ni GGUF |
| Vocabulario | 18.500 tokens |
| Numero de clases | 66 tipos de campo |
| Tamano del repositorio | 0,3 GB |
| Tag de pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT en configuracion MiniLM, con 4 capas y un vocabulario de 18.500 tokens. La model card lo describe como "bb single-encoder", es decir, un unico codificador que produce la representacion usada para la clasificacion, en lugar de un esquema dual de similitud. La salida es una clasificacion sobre 66 tipos de campo de formulario, lo que lo convierte en un modelo discriminativo y no generativo.

El entrenamiento se realizo sobre datos "tail" multilingues debiles, complementados con una senal de pistas basada en expresiones regulares que se inyecta como token adicional; el autor etiqueta esta configuracion como el run `cckrm`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO, algo poco habitual en un clasificador de este tipo. Tampoco se detalla si hubo destilacion desde un modelo mayor, aunque el nombre MiniLM y el reducido numero de capas apuntan a un esquema de compresion, dato que no se confirma en la informacion disponible. La innovacion destacable es de despliegue: exportacion a ONNX con cuantizacion int8 para ejecutar el modelo dentro del navegador mediante Firefox transformers.js.

## Capacidades

- Clasificacion de campos de formulario en 66 tipos distintos, orientada a autorrelleno de direcciones.
- Inferencia en cliente mediante ONNX Runtime y transformers.js, sin necesidad de backend.
- Procesamiento con una senal de pistas por expresiones regulares inyectada como token, que complementa la entrada textual.
- Cobertura parcial de idiomas "tail" gracias al entrenamiento con datos multilingues debiles, sin lista declarada de lenguas.
- Modelo discriminativo: no genera texto, no razona de forma multi-paso y no soporta tool calling ni function calling.
- No dispone de modo de razonamiento explicito, vision, audio ni capacidades de agente.
- Empaquetado especifico para el ecosistema Firefox, lo que limita su reutilizacion directa fuera de ese entorno sin conversion adicional.

## Casos de uso

- Autorrelleno de direcciones en el navegador Firefox: el modelo clasifica cada casilla del formulario (calle, numero, codigo postal, provincia, pais, etc.) entre sus 66 tipos y el navegador inserta el dato correspondiente del perfil guardado. Su tamano reducido permite ejecutarlo en el propio cliente, sin enviar el formulario a un servidor.
- Deteccion de campos en formularios de comercio electronico: durante el checkout, el clasificador identifica los campos de envio y facturacion para precargar los datos del usuario y reducir el abandono del carrito.
- Extensiones de navegador de gestion de contrasenas y datos personales: la extension puede etiquetar campos antes de rellenarlos, evitando heuristicas fragiles basadas unicamente en el atributo `name` o `id`.
- Normalizacion de formularios en aplicaciones web internas: en paneles de gestion con formularios heterogeneos, el modelo permite mapear campos a un esquema canonico de direccion antes de enviarlos al backend.
- Preprocesado de extraccion documental: combinado con OCR, el clasificador puede etiquetar campos extraidos de documentos escaneados y enrutarlos al campo correcto de un sistema de gestion.
- Accesibilidad y automatizacion asistida: ayuda a usuarios con dificultades motoras a completar formularios largos rellenando automaticamente los campos de direccion a partir de un perfil almacenado.
- Investigacion sobre modelos ligeros en el navegador: sirve como caso de estudio de un clasificador MiniLM de 4 capas cuantizado a int8 para inferencia en cliente, util para comparar arquitecturas y estrategias de cuantizacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son dos metricas internas del run `cckrm`, sin detalle de la metodologia de evaluacion ni comparacion con otros modelos:

| Metrica | Valor |
|---|---|
| Tail-gold | 71,0 |
| Overall QA | 88,9 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, y estos no serian aplicables a un clasificador discriminativo de 66 clases. No hay datos de latencia ni de throughput publicados.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse en el navegador con ONNX Runtime Web, por lo que no requiere GPU.
- VRAM estimada: no aplica en el escenario objetivo; con pesos int8 y arquitectura MiniLM de 4 capas, el modelo es del orden de decenas de MB en memoria, aunque no se publica la cifra exacta de parametros ni el tamano del fichero ONNX.
- GPU recomendadas: no disponibles ni necesarias para el caso de uso previsto.
- Compatibilidad con GPU de consumo: irrelevante para el objetivo, dado que la inferencia es en cliente y sobre CPU.
- Opciones de despliegue: Firefox transformers.js (escenario nativo), ONNX Runtime y onnxruntime-web para otros navegadores o entornos Node; otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a un encoder de clasificacion en formato ONNX.
- Latencia y throughput: no disponibles. En un modelo de este tamano el coste por inferencia es bajo, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No hay datos de rendimiento comparables publicados para este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los valores de los modelos alternativos corresponden a sus configuraciones habituales y deben verificarse en sus fichas oficiales.

| Modelo | Tipo | Capas | Clases | Formato | Licencia |
|---|---|---|---|---|---|
| minilm-address-autofill-hint | MiniLM/BERT single-encoder, clasificacion | 4 | 66 tipos de campo | ONNX int8 | no disponible |
| MiniLM-L6-v2 (Microsoft) | BERT MiniLM generalista | 6 | no aplica (embedding) | safetensors, ONNX | MIT |
| DistilBERT-base (Hugging Face) | BERT destilado generalista | 6 | no aplica (ajustable) | safetensors, ONNX | Apache 2.0 |
| Classifiers de autofill comerciales | propietarios | no disponible | no disponible | no disponible | propietaria |

La diferencia principal frente a MiniLM-L6-v2 y DistilBERT-base es la especializacion: estos ultimos son modelos de proposito general que requieren ajuste fino para la tarea, mientras que minilm-address-autofill-hint ya esta entrenado para 66 tipos de campo y exportado a int8. En contrapartida, su licencia no esta declarada, lo que impide evaluar su uso comercial.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no es posible determinar si se permite el uso comercial, la modificacion o la redistribucion. Es un bloqueo objetivo para integrarlo en produccion.
- Ausencia de validacion externa: los unicos resultados son Tail-gold 71,0 y Overall QA 88,9, sin detalle del conjunto de evaluacion, tamano de muestra ni criterio de exito por clase. El 71,0 en la cola de la distribucion indica un rendimiento claramente inferior en los casos menos frecuentes.
- Sesgos no documentados: no se publica informacion sobre la composicion del dataset de entrenamiento, la procedencia de los datos "tail" multilingues ni analisis de sesgo por idioma o por tipo de campo.
- Riesgo de error en campos poco frecuentes: al ser un problema de clasificacion con 66 clases, los errores se concentran previsiblemente en las clases minoritarias; un fallo de clasificacion puede provocar que se rellene una casilla con un dato incorrecto.
- Cobertura idiomatica incierta: el entrenamiento con datos multilingues "debiles" sugiere un rendimiento desigual entre lenguas, sin lista de idiomas soportados que permita acotar el riesgo.
- Dependencia del token de pista por expresiones regulares: si en produccion no se replica la senal de regex usada en el run `cckrm`, es probable que el rendimiento difiera del reportado.
- Contexto y formato de entrada no documentados: se desconoce la longitud maxima de secuencia y el esquema exacto de entrada esperado por el export ONNX, lo que complica una integracion fiable sin ingenieria inversa.
- Repositorio sin traccion: cero descargas y cero valoraciones, sin evidencia de uso en produccion ni de mantenimiento posterior a la creacion del repositorio.
- Idoneidad limitada a una tarea: no es un modelo generativo ni de razonamiento; no debe emplearse para tareas distintas de la clasificacion de campos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rolf-mozilla/minilm-address-autofill-hint
- Repositorio de referencia mencionado en la model card: ml-form-autofill (sin URL publica en la informacion disponible)
- Resultados de busqueda web: no se ha recuperado ningun enlace tecnico relevante sobre este modelo; las busquedas devolvieron exclusivamente contenido no relacionado y sin valor tecnico, por lo que no se incluye.
