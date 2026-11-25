# protonx-models/protonx-legal-tc-v1.4

## Resumen

ProtonX Legal Text Correction v1.4 es un modelo de correccion de texto vietnamita especializado en el dominio legal y administrativo, desarrollado por protonx-models. Se trata de un modelo T5 encoder-decoder de tipo small, con 62.538.240 parametros (aproximadamente 62,5 millones), afinado a partir de `nbdaaa/t5-small-vietnamese` con el tokenizador ViT5. Su proposito es limpiar errores tipicos de OCR en documentos escaneados y formularios, asi como texto mecanografiado con errores de diacriticos o teclado, sin reescribir el contenido ni alterar el significado juridico.

El modelo resuelve un problema muy concreto en pipelines de digitalizacion de documentos legales vietnamitas: los OCR producen diacriticos ausentes o incorrectos, segmentacion de palabras rota, confusiones entre letras y digitos, ruido de simbolos y frases fijas mal reconocidas (titulos nacionales, lemas, nombres de provincias, etiquetas de formularios). La version 1.4 es una variante ligera, aproximadamente una cuarta parte del tamano de `protonx-legal-tc`, y declara unas 4,8 veces el throughput de este ultimo en la misma GPU.

Es relevante ahora porque ofrece una alternativa de bajo coste computacional para post-procesado de OCR en produccion, con un contexto de trabajo por lineas (hasta 256 tokens de entrada y 128 de salida) y entrenamiento sobre unos 2,2 millones de pares ruidoso-limpio. Su licencia es la ProtonX Text Correction Model License (v1.4-NC), que restringe el uso comercial segun los terminos del archivo LICENSE.md.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (6 capas encoder + 6 capas decoder, d_model 512) |
| Parametros totales | 62.538.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de entrada y 128 tokens de salida por linea |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | ProtonX Text Correction Model License (v1.4-NC); terminos en LICENSE.md |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un T5-small encoder-decoder con 6 capas en el encoder y 6 en el decoder, dimension de modelo 512 y 62,5 millones de parametros. Parte del checkpoint `nbdaaa/t5-small-vietnamese`, que emplea el tokenizador ViT5, y se ha afinado mediante varias rondas de entrenamiento continuado. La tarea es de text2text generation: se antepone el prefijo obligatorio `sửa câu: ` a cada linea de entrada y el modelo genera la version corregida.

El entrenamiento utiliza aproximadamente 2,2 millones de pares de lineas ruidoso-limpio, con aumentacion especifica del dominio legal y de formularios que reproduce el perfil de errores de OCR de documentos escaneados reales. La cobertura incluye decretos gubernamentales, resoluciones, clausulas contractuales, procedimientos y formularios administrativos (estado civil, residencia, registro de empresas), tablas y datos financieros. El modelo impone restricciones estrictas: la correccion no debe reescribir, el significado del texto legal no debe cambiar, los nombres de personas, numeros y codigos de documento se conservan tal cual, el texto ya correcto se deja intacto y no se parafrasea. La decodificacion recomendada es beam search con 4 beams.

## Capacidades

- Correccion de texto vietnamita linea a linea en dominio legal, administrativo y empresarial.
- Restauracion de diacriticos ausentes o incorrectos, incluidas lineas escritas en mayusculas.
- Reparacion de segmentacion de palabras rota (palabras fusionadas y divididas, tambien alrededor de numeros).
- Correccion de terminos legales y administrativos mal reconocidos por OCR.
- Eliminacion de ruido de simbolos OCR y confusiones entre caracteres similares (letras leidas como digitos y viceversa).
- Correccion de frases fijas mal leidas en documentos y formularios: titulo y lema nacional, nombres de provincias, etiquetas de formulario, relaciones.
- Normalizacion de texto mecanografiado con diacriticos ausentes y errores de teclado o Telex.
- Procesamiento de lineas de formularios y tablas de documentos escaneados, incluidas lineas en mayusculas, nombres raros y codigos.
- Reglas opcionales de post-procesado para frases fijas de documentos vietnamitas.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; es un modelo especializado de correccion de texto.

## Casos de uso

- Post-procesado de OCR en digitalizacion de PDFs legales: el modelo recibe cada linea reconocida por el OCR (hasta 256 tokens) y devuelve la linea corregida, restaurando diacriticos y reparando terminos juridicos mal leidos antes de indexar el documento.
- Limpieza de formularios administrativos escaneados: procesa lineas de tablas y formularios (estado civil, residencia, registro de empresas) respetando nombres, numeros y codigos de documento, lo que permite poblar bases de datos sin alterar datos identificativos.
- Normalizacion de texto mecanografiado en sistemas de gestion documental: corrige entradas con diacriticos ausentes o errores de teclado/Telex antes de almacenarlas, mejorando la calidad de busquedas y recuperacion.
- Preprocesado para pipelines de NLP juridico: al reducir el CER del texto de entrada, mejora la calidad aguas abajo de tareas como clasificacion de documentos, extraccion de entidades o busqueda semantica sobre corpus legales vietnamitas.
- Correccion de clausulas contractuales digitalizadas: limpia clausulas de contratos escaneados manteniendo intacto el significado juridico y sin parafrasear, requisito critico en revision contractual automatizada.
- Normalizacion de lineas de tablas y datos financieros: corrige confusiones entre letras y digitos y espaciado alrededor de numeros, lo que reduce errores en la extraccion de cifras y codigos de documentos contables.
- Servicio de correccion en linea con requisitos de latencia: al ser un modelo de 62,5 millones de parametros con unas 4,8 veces el throughput de `protonx-legal-tc` en la misma GPU, es adecuado para procesar grandes volumenes de lineas en batch o en servicios de correccion casi en tiempo real.
- Limpieza de texto proveniente de redes sociales en contextos administrativos: el benchmark interno incluye normalizacion de redes sociales, por lo que puede usarse para homogeneizar entradas ciudadanas antes de su tramitacion.

## Benchmarks y rendimiento

Benchmark interno de tipos de error (privado), sobre 30.398 frases reservadas en 11 grupos de error (OCR de texto legal, lineas OCR reales, diacriticos, errores de teclado y Telex, palabras fusionadas y divididas, confusiones digito-letra, espaciado alrededor de numeros, letras similares, normalizacion de redes sociales y otros). Decodificacion con beam 4.

| Metrica | Puntuacion | Con reglas de post-procesado |
|---|---|---|
| CER (todas las frases) | 2,02 % | 2,01 % |
| Exact match (todas las frases) | 68,10 % | 68,11 % |
| ROUGE-L (todas las frases) | 96,61 % | 96,61 % |
| CER (11 grupos, ponderacion equitativa) | 1,77 % | 1,77 % |
| Exact match (11 grupos, ponderacion equitativa) | 70,88 % | 70,89 % |
| ROUGE-L (11 grupos, ponderacion equitativa) | 96,16 % | 96,16 % |

CER: tasa de error por caracter. Exact match: proporcion de frases corregidas exactamente. ROUGE-L: F1 a nivel de palabra tras minusculizar.

En el ProtonX Legal Text Correction Validation Dataset, la metrica ROUGE-L figura como "TBA" (pendiente de publicacion) en la model card. No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 62,5 millones de parametros en safetensors (repo de 0,3 GB), la inferencia en precision completa requiere aproximadamente 0,25 GB de pesos mas overhead de activaciones y tokenizador; en la practica cabe en cualquier GPU consumer con varios GB de VRAM. No se han publicado cifras oficiales de VRAM por cuantizacion.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo esta pensado para despliegue de bajo coste. Se menciona comparativa de throughput en "la misma GPU" frente a `protonx-legal-tc`, pero sin especificar el modelo de GPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer actual, dado su tamano reducido.
- Opciones de despliegue: transformers (`AutoTokenizer` + `AutoModelForSeq2SeqLM`), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput: el autor declara aproximadamente 4,8 veces el throughput de `protonx-legal-tc` en la misma GPU; no se publican valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| protonx-legal-tc-v1.4 | 62,5 M | 256 entrada / 128 salida por linea | Correccion de texto legal vietnamita (ligero) | ProtonX Text Correction Model License (v1.4-NC) | Hugging Face |
| protonx-legal-tc | no disponible (aproximadamente 4 veces mayor que v1.4) | no disponible | Correccion de texto legal vietnamita | no disponible | Hugging Face |
| nbdaaa/t5-small-vietnamese | no disponible | no disponible | Modelo base T5-small vietnamita | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada. La comparativa se limita a tamano, enfoque y disponibilidad.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no es multilingue.
- Trabaja linea a linea: conviene dividir parrafos largos en frases o clausulas de como maximo unos 128 tokens antes de corregir; entradas de hasta 256 tokens y salidas de hasta 128 tokens por linea.
- Requiere el prefijo obligatorio `sửa câu: ` en la entrada; sin el, el comportamiento no esta garantizado.
- Riesgo de alucinacion o de reescritura no deseada: aunque las restricciones de entrenamiento prohiben parafrasear y alterar el significado, no se documenta una garantia formal; en texto legal conviene validacion humana en casos criticos.
- El exact match en el benchmark interno es del 68,10 % en todas las frases, lo que implica que aproximadamente un tercio de las frases no se corrige exactamente; el CER del 2,02 % indica errores residuales por caracter.
- Licencia restrictiva: ProtonX Text Correction Model License (v1.4-NC); el sufijo NC y los terminos de LICENSE.md sugieren restricciones para uso comercial, que deben revisarse antes de produccion.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera del dominio legal, administrativo y de formularios.
- El benchmark principal es interno y privado, lo que limita la reproducibilidad externa; el resultado ROUGE-L en el dataset de validacion publico figura como pendiente (TBA).
- No hay datos publicados sobre cuantizacion, latencia absoluta ni soporte en frameworks de inferencia distintos de transformers y text-generation-inference.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protonx-models/protonx-legal-tc-v1.4
- Modelo base: https://huggingface.co/nbdaaa/t5-small-vietnamese
- Modelo hermano de mayor tamano: https://huggingface.co/protonx-models/protonx-legal-tc
- Dataset de validacion: https://huggingface.co/datasets/protonx-models/text-correction-validation
- Web de ProtonX: https://protonx.co
- Discord de ProtonX: https://discord.gg/WaHT2Gdgg7
- Licencia: LICENSE.md en el repositorio del modelo (https://huggingface.co/protonx-models/protonx-legal-tc-v1.4/blob/main/LICENSE.md)
