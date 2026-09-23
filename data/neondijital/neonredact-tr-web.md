# neondijital/neonredact-tr-web

## Resumen

NeonRedact-TR Web es un modelo de deteccion de informacion personal identificable (PII) en turco disenado para ejecutarse integramente en el navegador. Lo desarrolla neondijital y se distribuye como un clasificador de tokens basado en `dbmdz/distilbert-base-turkish-cased`, convertido a ONNX y cuantizado a int8 en un fichero de 68 MB. La propuesta central es la privacidad por diseno: el texto del usuario nunca sale de su maquina, ya que la inferencia ocurre en el cliente mediante transformers.js, sin servidor ni subida de datos.

El problema que aborda es concreto: los modelos multilingues de PII existentes no estan construidos para el turco. El turco adhiere sufijos de caso a los nombres propios con apostrofo (`Ayşe Öztürk'ün`), de modo que un modelo que absorbe el sufijo dentro del span rompe la redaccion posterior; ademas, los identificadores turcos (T.C. kimlik, numero fiscal, IBAN turco, matriculas) no aparecen en los conjuntos de datos orientados a la UE. Este modelo devuelve `Ayşe Öztürk` y deja `'ün` fuera del span, y cubre 16 tipos de entidad especificos del contexto turco.

La relevancia actual viene de su relacion tamano/rendimiento: segun el benchmark propio del autor (NeonRedact-TR Bench v1), el modelo combinado con una capa de reglas con validacion de checksum alcanza 0,629 de F1 micro en 300 documentos turcos, frente a 0,356 de OpenMed v2 y 0,348 de OpenAI Privacy Filter, ambos de 2,8 GB. Se trata de un encoder pequeno (arquitectura DistilBERT), no de un modelo generativo, y su licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT con cabeza de clasificacion de tokens (esquema BIO, 33 etiquetas) |
| Parametros totales | No indicado en la model card; el fichero ONNX fp32 de 270 MB (aprox. 4 bytes por parametro) es coherente con unos 67 M de parametros, en linea con DistilBERT |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base DistilBERT opera con una ventana tipica de 512 tokens (sin confirmar por el autor) |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`, 270 MB) e int8 (`onnx/model_quantized.onnx`, 68 MB, valor por defecto en navegador con `dtype: 'q8'`). No se ofrecen GGUF, GPTQ ni AWQ |
| Idiomas soportados | Turco (tr) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32 e int8). No se listan pesos safetensors ni PyTorch en la model card |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo DistilBERT con una cabeza de clasificacion de tokens, afinado desde `dbmdz/distilbert-base-turkish-cased`. La salida sigue el esquema BIO con 16 tipos de entidad y 33 etiquetas en total (incluida `O`). Una decision de diseno destacable es que los subtokens heredan la etiqueta de su palabra (`B-` se convierte en `I-`), de forma que los identificadores compuestos por varias piezas vuelven completos en lugar de fragmentados. La cuantizacion a int8 mantiene una concordancia del 99,36 % de predicciones de token identicas respecto al modelo fp32, medida sobre 9.814 tokens de datos reservados.

El entrenamiento se realizo sobre el conjunto sintetico `neondijital/neonredact-tr`: 10.000 registros generados a partir de 36 plantillas de documento, durante cuatro epocas en una unica GPU T4, en aproximadamente dos minutos. No se menciona en la model card el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo discriminativo de este tipo. El autor documenta que esta arquitectura sustituyo a un intento previo basado en GLiNER: el modelo GLiNER mas pequeno pesaba 611 MB y su grafo ONNX resistia la cuantizacion (la cuantizacion int8 desplazaba los logits 21,7 puntos en las pruebas). El clasificador de tokens resultante es un orden de magnitud mas pequeno y, en las pruebas reservadas, mas preciso: detecta numeros de telefono fijo sin prefijo (algo que tres rondas de entrenamiento de GLiNER nunca lograron) y no absorbe sufijos flexivos dentro de los spans de profesion.

## Capacidades

- Deteccion de PII en texto turco mediante clasificacion de tokens, con devolucion de spans etiquetados en formato BIO.
- Cobertura de 16 tipos de entidad: `KISI_ADI` (nombre de persona), `ADRES` (direccion), `TC_KIMLIK` (documento nacional turco), `VERGI_NO` (numero fiscal), `IBAN` (IBAN turco), `KART_NO` (numero de tarjeta), `CEP_TELEFON` (movil), `SABIT_TELEFON` (telefono fijo), `EPOSTA` (correo electronico), `PLAKA` (matricula de vehiculo), `DOGUM_TARIHI` (fecha de nacimiento), `KURUM_ADI` (organizacion, juzgado u hospital), `MESLEK` (profesion), `AKRABALIK` (parentesco), `SAGLIK_DURUMU` (condicion de salud) y `TARAF_SIFATI` (rol procesal: cliente, demandado, paciente).
- Gestion correcta de sufijos turcos: mantiene los sufijos de caso fuera del span para no romper la gramatica de la frase al redactar.
- Reconocimiento de referencias por rol en lugar de por nombre, habitual en textos legales y clinicos turcos (`müvekkilim`, `davalı`, `hastam`).
- Inferencia en el dispositivo (navegador o cliente) sin envio de datos a servidores externos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: es un modelo puramente discriminativo de etiquetado de secuencias.
- No es multilingue: solo soporta turco.

## Casos de uso

- Anonimizacion de documentos legales en el navegador: un despacho puede cargar escritos con nombres, numeros de documento y direcciones en una pagina web y obtener los spans de PII etiquetados sin que el texto salga del equipo del abogado, algo critico para el secreto profesional.
- Cumplimiento de KVKK y RGPD en formularios web: el modelo puede preprocesar el texto introducido por el usuario en el cliente y resaltar o enmascarar datos personales antes de que el formulario se envie al backend, reduciendo la superficie de exposicion.
- Preprocesado de historiales clinicos: detecta `SAGLIK_DURUMU`, `KISI_ADI` y referencias de parentesco en notas clinicas turcas para su anonimizacion previa a tareas de analitica o investigacion, teniendo en cuenta que el vocabulario de salud es limitado y no exhaustivo.
- Saneamiento de logs y tickets de soporte: antes de almacenar registros o enviarlos a una plataforma de observabilidad, el modelo permite localizar y enmascarar telefonos, correos, IBAN y numeros de tarjeta, combinando la deteccion neuronal con las validaciones de checksum.
- Enmascaramiento en tiempo real en editores de texto: integrado mediante transformers.js, permite resaltar PII mientras se escribe, con la ventaja de que la latencia no depende de la red y el contenido permanece local.
- Filtrado de PII en corpus de entrenamiento: para equipos que preparan datos turcos, el modelo sirve como primera pasada de etiquetado que luego se revisa manualmente, con la advertencia de que sobre-marca texto sin PII (69,4 % de falsas alarmas con la capa de reglas) y exige curacion posterior.
- Redaccion asistida en pipelines de documentos judiciales: la deteccion de `TARAF_SIFATI`, `KURUM_ADI` y `MESLEK` ayuda a sustituir roles procesales y organismos por seudonimos antes de publicar resoluciones, aunque `TARAF_SIFATI` es la etiqueta mas debil del modelo.
- Verificacion de identificadores con algoritmos exactos: el propio autor recomienda emparejar el modelo con una capa determinista para T.C. kimlik, numero fiscal, IBAN y tarjeta, ya que el checksum es exacto donde el modelo solo aproxima.

## Benchmarks y rendimiento

Resultados sobre la particion de test reservada de NeonRedact-TR Bench v1: 300 documentos turcos y 1.206 entidades, F1 micro con intervalo de confianza del 95 % por bootstrap.

| Modelo | Tamano | F1 micro (todas las etiquetas) | F1 (persona, direccion, telefono, email, fecha de nacimiento) | Fuga de sufijo | Falsas alarmas en texto sin PII |
|---|---|---|---|---|---|
| NeonRedact-TR Web + reglas | 68 MB | 0,629 [0,604; 0,656] | 0,682 | 2,5 % | 69,4 % |
| NeonRedact-TR Web solo | 68 MB | 0,489 | 0,595 | 2,5 % | 79,0 % |
| OpenMed v2 | 2,8 GB | 0,356 | 0,338 | 1,4 % | 69,4 % |
| OpenAI Privacy Filter | 2,8 GB | 0,348 | 0,347 | 18,4 % | 37,1 % |

Dato adicional de cuantizacion: sobre 9.814 tokens de datos reservados, el 99,36 % de las predicciones de token del modelo int8 coinciden con las del modelo fp32.

## Requisitos de hardware

- Inferencia en CPU: el modelo int8 de 68 MB esta pensado para ejecutarse sin GPU, tanto en navegador como en servidor ligero. La huella de memoria es de decenas o pocos cientos de MB.
- El fichero fp32 (`onnx/model.onnx`, 270 MB) requiere aproximadamente el cuadruple de memoria que la version int8, pero sigue siendo muy manejable.
- GPU: no es necesaria ni se documenta. Cualquier GPU consumer (por ejemplo, una RTX 4090) seria sobredimensionada para este modelo; el entrenamiento del autor se hizo en una unica T4.
- Cabe en cualquier portatil, movil o entorno de navegador moderno, que es precisamente el objetivo del diseno.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) con `dtype: 'q8'` en el navegador, ONNX Runtime Web, y ONNX Runtime en Python, C++, C# o Java para uso en servidor. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo ni se distribuye en GGUF.
- Latencia y throughput: no disponible. La model card no publica mediciones de latencia ni de tokens por segundo.
- Nota practica de integracion: la model card advierte que los campos `start` y `end` pueden faltar segun la version del runtime; en ese caso hay que localizar el `word` devuelto en el texto original.

## Comparativa con modelos similares

| Modelo | Tamano | Enfoque | F1 micro (bench del autor) | Fuga de sufijo | Licencia / disponibilidad |
|---|---|---|---|---|---|
| NeonRedact-TR Web | 68 MB | DistilBERT turco en ONNX, int8, inferencia en navegador | 0,489 en solitario; 0,629 con reglas | 2,5 % | Apache 2.0, pesos ONNX publicos |
| NeonRedact-TR (modelo de servidor) | No indicado (GLiNER, minimo 611 MB en el intento previo) | GLiNER para uso en servidor | No disponible en la informacion proporcionada | No disponible | Publicado por el mismo autor en `neondijital/neonredact-tr-model` |
| OpenMed v2 | 2,8 GB | Modelo multilingue orientado a la UE | 0,356 | 1,4 % | No disponible en la informacion proporcionada |
| OpenAI Privacy Filter | 2,8 GB | Modelo multilingue orientado a la UE | 0,348 | 18,4 % | No disponible en la informacion proporcionada |

El autor senala que NeonRedact-TR Web es mas debil que su modelo de servidor en organizacion, profesion y salud, y que ese es el precio de caber en 68 MB.

## Limitaciones y advertencias

- Sobre-marcado de texto sin PII: el modelo marca algo en el 79 % de los documentos del benchmark sin PII, y en el 69 % cuando se combina con la capa de reglas. Es la limitacion mas importante para produccion.
- Entrenado exclusivamente con texto sintetico generado a partir de 36 plantillas: los documentos reales son mas ruidosos y heterogeneos.
- No contempla ruido de OCR, artefactos de maquetacion ni variantes dialectales de escritura.
- `TARAF_SIFATI` es la etiqueta mas debil, por ser la que menos ejemplos de entrenamiento tiene.
- Los vocabularios de profesion y de condicion de salud son limitados y no exhaustivos.
- No cubre apellidos compuestos ni con guion.
- Fuga de sufijo del 2,5 %: en algunos casos el sufijo turco puede quedar absorbido dentro del span, lo que rompe la redaccion.
- Solo turco. No hay soporte multilingue ni de otros idiomas.
- Entrenado con datos sinteticos, por lo que puede heredar los sesgos de las plantillas y de la distribucion de entidades que generan.
- Riesgo de alucinacion de entidades: como cualquier clasificador de tokens, puede marcar como PII fragmentos que no lo son, con la tasa de falsas alarmas ya citada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base `dbmdz/distilbert-base-turkish-cased` antes de redistribuir.
- Uso recomendado por el autor: emparejarlo siempre con validaciones deterministas por checksum (T.C. kimlik, numero fiscal, IBAN, tarjeta), que son exactas donde el modelo solo aproxima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neondijital/neonredact-tr-web
- Demo en vivo: https://neondijital.com/kisisel-veri-bul
- Modelo de servidor (GLiNER, uso en servidor): https://huggingface.co/neondijital/neonredact-tr-model
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/neondijital/neonredact-tr
- Benchmark NeonRedact-TR Bench v1: https://huggingface.co/datasets/neondijital/neonredact-tr-bench
- Resultados completos del benchmark: https://huggingface.co/datasets/neondijital/neonredact-tr-bench/blob/main/RESULTS.md
- Modelo base: https://huggingface.co/dbmdz/distilbert-base-turkish-cased
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (correspondian a paginas de la Universidad de Oxford), por lo que no se han incorporado enlaces adicionales de prensa, papers o repositorios externos.
