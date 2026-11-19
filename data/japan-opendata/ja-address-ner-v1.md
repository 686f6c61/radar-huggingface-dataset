# japan-opendata/ja-address-ner-v1

## Resumen

ja-address-ner-v1 es un modelo de reconocimiento de entidades nombradas (NER) especializado en direcciones postales japonesas, desarrollado por japan-opendata. Se construye sobre el checkpoint tohoku-nlp/bert-base-japanese-v3 y resuelve un problema muy concreto: extraer direcciones de texto libre en japones, descomponerlas en sus componentes estructurales (prefectura, municipio, distrito, numero de solar y nombre del edificio) y, en una segunda etapa, asignar el codigo de municipio mediante un enlazador basado en diccionario. Cuando el codigo no puede determinarse de forma univoca, el sistema devuelve "indeterminado" en lugar de arriesgar una asignacion incorrecta.

El modelo es un transformer encoder de tipo BERT con 110,6 millones de parametros y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su interes practico reside en el diseno de dos etapas con rehusado explicito: la etapa NER tiene un F1 de 0,9983 en coincidencia exacta de spans sobre un conjunto de test sellado, y el enlazador no produjo ni una sola asignacion de codigo erronea en 4.814 direcciones evaluadas.

La relevancia actual viene de la digitalizacion de registros administrativos y de la normalizacion de direcciones en procesos de atencion al ciudadano, logistica y cumplimiento normativo. El modelo se entreno exclusivamente con direcciones sinteticas generadas a partir de fuentes publicas oficiales, lo que evita exponer datos personales reales en el corpus de entrenamiento y simplifica su adopcion en entornos con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (token classification) |
| Parametros totales | 110.625.035 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 publicado; cuantizacion adicional no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (FP32) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base adaptado a token classification mediante una cabeza de etiquetado secuencial sobre el checkpoint tohoku-nlp/bert-base-japanese-v3. La tarea de la primera etapa es el etiquetado BIO de spans de direccion y de sus cinco componentes: prefectura, municipio, distrito (machi-kuiki), numero de solar y nombre de edificio. La segunda etapa es un enlazador por diccionario, externo al modelo neuronal, que resuelve el codigo de municipio a partir de los componentes extraidos.

El entrenamiento uso exclusivamente datos sinteticos: direcciones ficticias generadas a partir de los datos de codigos postales de Japan Post y del Address Base Registry de la Digital Agency (ambos bajo licencia PDL 1.0), insertadas en contextos y plantillas de texto provenientes de NVIDIA Nemotron-PII Japan (CC BY 4.0). El corpus se dividio en 100.000 ejemplos de entrenamiento, 5.000 de desarrollo y 5.000 de test sellado, con verificacion de solapamiento entre particiones. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Extraccion de spans de direccion en texto japones libre y descomposicion en prefectura, municipio, distrito, numero de solar y edificio.
- Asignacion de codigo de municipio mediante enlazador de diccionario externo, con rehusado explicito cuando la resolucion es ambigua o la direccion no existe.
- Clasificacion de tokens (pipeline `token-classification`) compatible con `AutoModelForTokenClassification` de Transformers.
- Inferencia en ONNX FP32 con paridad verificada respecto a la version PyTorch en spans, componentes y salida del enlazador (200 casos en dev y 200 en test sellado).
- Deteccion de ausencia de direccion: 0 falsos positivos en 500 frases sin direccion.
- Capacidad multilingue: no disponible; el modelo solo declara japones.
- Tool calling, function calling, razonamiento multi-paso, vision y audio: no disponibles; el modelo no cubre esas funciones.

## Casos de uso

- Normalizacion de direcciones en registros administrativos: el modelo extrae y descompone direcciones de formularios y correos para alimentar bases de datos con codigo de municipio, rehusando los casos ambiguos en lugar de generar codigos incorrectos.
- Digitalizacion de documentos escaneados con OCR previo: tras el OCR, el NER aísla el span de direccion y sus componentes, lo que permite validar la calidad del reconocimiento y estructurar el resultado.
- Enrutamiento logistico: la extraccion de prefectura, municipio y distrito permite asignar una direccion a la delegacion o ruta correspondiente; el rehusado explicito evita envios a zonas erroneas cuando el texto es ambiguo.
- Atencion al ciudadano: clasificacion automatica de consultas por ubicacion geografica a partir del texto libre del usuario, con derivacion a la oficina competente segun el codigo de municipio resuelto.
- Limpieza y deduplicacion de bases de datos de clientes: la descomposicion en componentes permite comparar direcciones por campos normalizados y detectar duplicados sin depender de la cadena completa.
- Cumplimiento y auditoria de datos personales: el modelo identifica spans de direccion en textos para su anonimizacion o enmascaramiento antes de almacenar o compartir el contenido.
- Procesamiento por lotes en CPU: con unos 22,5 ms por registro en un Core i7-11700F (incluyendo el enlazador), es viable procesar volumenes altos en infraestructura sin GPU.

## Benchmarks y rendimiento

Evaluacion sobre 5.000 casos de test sellado no usados en entrenamiento (evaluacion unica):

| Metrica | Resultado |
|---|---|
| F1 de coincidencia exacta de span de direccion | 0,9983 |
| Micro F1 de descomposicion en componentes | 0,9965 |
| F1 prefectura | 1,0000 |
| F1 municipio | 0,9945 |
| F1 distrito | 0,9924 |
| F1 numero de solar | 0,9995 |
| F1 nombre de edificio | 0,9985 |
| Falsos positivos en 500 frases sin direccion | 0 |
| Precision de asignacion de codigo (casos resolubles) | 0,9924 |
| Asignaciones de codigo erroneas | 0 |
| Tasa de rehusado correcto en casos ambiguos o inexistentes | 1,0000 |
| Afirmaciones erroneas en 4.814 direcciones | 0 |
| Latencia en CPU (Core i7-11700F, con enlazador) | ~22,5 ms por registro |
| Paridad ONNX vs PyTorch | coincidencia total en 400 casos |

No se han publicado comparaciones con modelos alternativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,45 GB para los pesos (110,6 M de parametros), con overhead adicional de activaciones segun la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente; A100, H100, RTX 4090 o RTX 3060 no aportan ventaja significativa frente a CPU para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU sin aceleracion.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime con el fichero `onnx/model.onnx`, y servidores compatibles con `token-classification`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 22,5 ms por registro en CPU (Core i7-11700F) incluyendo el enlazador de diccionario; el throughput en GPU no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| japan-opendata/ja-address-ner-v1 | 110,6 M | NER de direcciones japonesas + enlace a codigo de municipio | no disponible | Apache 2.0 | Hugging Face |
| tohoku-nlp/bert-base-japanese-v3 | no disponible en la informacion proporcionada | Modelo base japones de proposito general | no disponible | Apache 2.0 | Hugging Face |
| NVIDIA Nemotron-PII Japan | no disponible en la informacion proporcionada | Deteccion de PII en japones (usado como fuente de contextos) | no disponible | CC BY 4.0 (datos) | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Las metricas se obtuvieron sobre direcciones sinteticas; el rendimiento probablemente disminuira con direcciones reales mal formateadas, abreviadas o inmersas en lenguaje coloquial.
- El rehusado es parte del diseno: si la direccion no existe o el distrito es ambiguo sin contexto suficiente, el modelo no asigna codigo. Los sistemas consumidores deben manejar el estado "indeterminado".
- La asignacion de codigo postal y la normalizacion completa de variantes de numeracion de solar quedan fuera del alcance del modelo.
- El diccionario del enlazador no se incluye en el repositorio; debe construirse a partir de datos de Japan Post y del Address Base Registry siguiendo `linker/DICTIONARY-SETUP.md`. Las reorganizaciones administrativas requieren actualizar el diccionario.
- Modelo unicamente en japones; no soporta otros idiomas.
- No se documentan sesgos especificos, pero al entrenar solo con direcciones sinteticas puede no representar la distribucion real de errores tipograficos y variantes ortograficas de direcciones reales.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, incluyendo modificacion y redistribucion, con las obligaciones habituales de atribucion y aviso de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-address-ner-v1
- Pagina de presentacion: https://jpopendata.jp/models/ja-address-ner-v1/
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
