# catsaiagency/Noir-0.8B-ja-en

## Resumen

Noir-0.8B-ja-en es un modelo de lenguaje especializado en la deteccion y el etiquetado de informacion sensible (PII) para su enmascaramiento en documentos. Lo desarrolla CatsAI Agency y se distribuye como un fine-tune del modelo base Qwen3.5-0.8B de Alibaba. Su proposito no es la generacion de texto general, sino resolver una tarea concreta: recibir un documento junto con una descripcion en lenguaje natural de lo que se quiere ocultar ("nombres de personas", "direcciones", "informacion personal") y devolver un array JSON con las cadenas exactas a enmascarar.

El modelo es deliberadamente pequeno: 1.107 millones de parametros totales segun los pesos en safetensors (la model card habla de 0,8 mil millones, cifra que corresponde al nombre comercial). Esta pensado para ejecutarse en CPU convencional, de modo que los documentos no abandonen la maquina del usuario, lo que lo hace atractivo para entornos con requisitos estrictos de privacidad y cumplimiento normativo.

Es relevante ahora porque cubre un nicho poco atendido por los modelos grandes: la redaccion automatica de documentos en japones e ingles con un coste computacional minimo. La contrapartida es una licencia restrictiva (CatsAI Model License) que exige pago por maquina para uso productivo, y unas tasas de error documentadas por el propio autor que obligan a supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3.5-0.8B); incluye el encoder de vision del modelo base, que Noir no utiliza |
| Parametros totales | 1.107.265.600 (safetensors); la model card indica 0,8 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens configurados en el script de arranque; cada fragmento de documento usa como maximo 3.000 |
| Tipos de cuantizacion | Pesos sin cuantizar en bfloat16 (safetensors); GGUF Q4_K_M disponible en repositorio aparte |
| Idiomas soportados | japones e ingles, incluidos documentos mixtos |
| Licencia | CatsAI Model License (licencia "other"; prueba gratuita, uso productivo con pago por maquina) |
| Formato de pesos | safetensors (bfloat16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

Noir parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se ha fine-tuneado para una unica tarea: localizar menciones de entidades sensibles y devolverlas en un formato JSON estructurado con identificador, tipo y lista de menciones. El repositorio de safetensors conserva el encoder de vision del modelo base aunque Noir no lo emplea, lo que explica en parte el tamano del repositorio (2,2 GB).

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se documenta que el modelo solo se comporta como se describe cuando recibe el prompt exacto con el que fue entrenado, disponible en el repositorio GGUF junto con los ajustes de generacion y el manejo de la salida. El autor menciona tambien que se entreno una instruccion adicional de "pseudonimizacion" que propone nombres ficticios de reemplazo, aunque el codigo publicado solo implementa redaccion. Existen variantes para aleman (aleman + ingles) y croata (croata + ingles) disponibles bajo peticion, solo como pesos sin cuantizar.

## Capacidades

- Deteccion de PII y entidades sensibles en documentos japoneses e ingleses, incluyendo documentos mixtos.
- Salida estructurada en JSON: array de objetos con `id`, `type` y `mentions`, o array vacio si no hay coincidencias.
- Aceptacion de objetivos descritos en lenguaje natural ("nombres de personas", "nombres de empresas") o mediante listas de etiquetas.
- Soporte de pseudonimizacion mediante instruccion entrenada (propone nombres ficticios de reemplazo), aunque el kit publicado solo implementa redaccion.
- Ejecucion en CPU sin GPU, con velocidades declaradas de unos 470 tokens/s de lectura y 30-55 tokens/s de escritura en un Core i7-11800H con 6 hilos.
- Integracion con expresiones regulares para correos electronicos, URL, direcciones IP, telefonos y fechas.
- Capacidad de vision heredada del modelo base pero no utilizada ni documentada para esta tarea.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible.

## Casos de uso

- Redaccion de expedientes legales y administrativos: el modelo recibe actas o documentos oficiales y devuelve las menciones de nombres, direcciones y numeros de contrato para sustituirlas antes de compartir el documento. Su tamano permite procesar en local sin enviar datos a terceros.
- Cumplimiento de proteccion de datos en correos empresariales: con fragmentos de unos 500 caracteres japoneses procesados en 5-6 segundos en CPU, encaja en flujos de salida de correo donde hay que enmascarar remitentes, destinatarios y datos de contacto antes de archivar.
- Anonimizacion previa al entrenamiento de modelos: como paso de preprocesado en pipelines que ingieren documentos publicos (Wikipedia, registros mercantiles) para eliminar PII antes de construir datasets.
- Publicacion de documentos gubernamentales o financieros: el autor lo evaluo sobre actas, documentos oficiales y presentaciones de empresas; sirve como primera pasada de enmascaramiento con revision humana posterior, dado el ~7% de omisiones.
- Despliegue en entornos air-gapped: al funcionar en CPU con unos 2 GB de RAM y pesos GGUF de 0,67 GB, puede instalarse en portatiles y servidores sin GPU dentro de redes aisladas.
- Enmascaramiento de documentacion interna japonesa-inglesa: empresas con documentacion bilingue pueden aplicar una unica herramienta a ambos idiomas, con tasas de omision declaradas del 8,4% en japones y 4,2% en ingles.
- Preprocesado para sistemas de gestion documental: la salida JSON con identificadores y tipos facilita la sustitucion programatica por etiquetas como `[person name 2]` en pipelines de DMS.

## Benchmarks y rendimiento

El autor publica cifras sobre su propio conjunto de test test-B (199 fragmentos de documentos publicos reales: actas, documentos gubernamentales, presentaciones de empresas, correos de negocio y Wikipedia; 398 casos de prueba), medidas sobre el modelo sin cuantizar:

| Metrica | Resultado |
|---|---|
| Omisiones totales | 6,98% |
| Omisiones en japones | 8,4% |
| Omisiones en ingles | 4,2% |
| Sobreenmascaramiento | 12,8% |
| Enmascarado con tipo no solicitado | 3,3% |
| Omisiones en aleman (modelo no adecuado) | 17,5% |
| Omisiones en croata (modelo no adecuado) | 37,9% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras de velocidad (470 tokens/s de lectura, 30-55 tokens/s de escritura en Core i7-11800H con 6 hilos) corresponden al archivo GGUF Q4_K_M; las de calidad, al modelo sin cuantizar, por lo que el GGUF puede rendir ligeramente peor.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para CPU. Con Q4_K_M ocupa 0,67 GB en disco y unos 2 GB de RAM en ejecucion.
- GPU recomendadas: no aplica; el autor no documenta despliegue en GPU para esta tarea.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto, aunque los pesos safetensors en bfloat16 (2,2 GB de repositorio) podrian cargarse en GPUs con 4-8 GB de VRAM mediante transformers.
- Opciones de despliegue: llama.cpp con el GGUF Q4_K_M es la via recomendada por el autor; el repositorio safetensors es para conversion, cuantizacion o fine-tune con transformers.
- Latencia y throughput: unos 5-6 segundos por un correo japones de 500 caracteres en un Core i7-11800H con 6 hilos; el tiempo depende principalmente del numero de elementos encontrados. El servidor se arranca con una sola ranura (`-np 1`), por lo que las peticiones se procesan en serie.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Ejecucion en CPU |
|---|---|---|---|---|---|
| Noir-0.8B-ja-en | ~1,1 mil millones | 8.192 tokens | Deteccion de PII y redaccion (ja/en) | CatsAI Model License (pago por maquina) | Si, nativa |
| Qwen3.5-0.8B (base) | ~0,8 mil millones | no disponible | Generacion de texto, vision | Apache-2.0 | Si |
| Modelos NER clasicos (spaCy, GiNZA) | Variable (millones) | Fragmento de texto | Reconocimiento de entidades por etiquetas fijas | MIT / Apache-2.0 | Si |

La comparacion con alternativas especializadas en PII de mayor tamano o con servicios en la nube no esta disponible en la informacion proporcionada. Frente al modelo base, Noir anade la tarea de redaccion con salida JSON y el soporte de objetivos en lenguaje natural, a costa de una licencia restrictiva. Frente a NER clasicos, ofrece descripciones de objetivos en lenguaje natural y salida estructurada, pero con tasas de omision documentadas y sin garantias de determinismo.

## Limitaciones y advertencias

- Omite aproximadamente el 7% de lo que deberia enmascarar sobre documentos reales; el autor recomienda revision humana en documentos importantes.
- No debe enviarse un documento largo en una sola peticion: sin fragmentar, la deteccion cae drasticamente (del 94% al 54% en una comparacion sobre un articulo largo).
- Puede repetir elementos sin detenerse; el codigo de referencia divide el fragmento y reintenta, y advierte de no usar respuestas con `finish_reason` igual a `length`.
- La misma persona puede recibir dos etiquetas distintas ("Ottoline Marrowby" y "Ottoline" como `[person name 2]` y `[person name 3]`); los numeros de etiqueta no indican identidad.
- No enmascara palabras que no identifican por si solas ("the Company", "we", 当社), ni nombres de paises o prefecturas aislados, ni sustantivos comunes; en cambio, puede enmascarar un cargo sin nombre ("Customer Success Manager").
- Los objetivos que requieren entender quien es quien son debiles: con "anything that identifies our client" enmascaro la empresa y direccion del propio autor en lugar del cliente.
- Las expresiones regulares solo cubren correos, URL, IP, telefonos y fechas; numeros con formato propio (empleado, pedido) requieren expresiones adicionales.
- Los objetivos en palabras propias no se benefician de las expresiones regulares; conviene anadir los nombres de etiqueta junto a `--terms`.
- El modelo no es adecuado para aleman (17,5% de omisiones) ni croata (37,9%), pese a existir variantes separadas para esos idiomas.
- Licencia CatsAI Model License: probar es gratis, pero el uso para trabajo real exige licencia de pago por cada maquina donde se instale, incluido el PC de desarrollo si se usa para trabajo real.
- El servidor se inicia con una sola ranura, por lo que no hay paralelismo en las peticiones.
- No se documentan sesgos especificos ni tasas de alucinacion mas alla de las metricas de omision y sobreenmascaramiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/catsaiagency/Noir-0.8B-ja-en
- Repositorio GGUF con codigo y manual: https://huggingface.co/catsaiagency/Noir-0.8B-ja-en-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo: https://huggingface.co/catsaiagency/Noir-0.8B-ja-en/blob/main/MODEL-LICENSE.md
- Licencia en japones: https://huggingface.co/catsaiagency/Noir-0.8B-ja-en/blob/main/MODEL-LICENSE.ja.md
- Sitio web del autor: https://catsai.agency/en/noir
- Contacto para licencias: https://catsai.agency/contact
