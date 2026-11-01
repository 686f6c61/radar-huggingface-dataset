# Peter-A-P/legible-2b-nist-v1120-s0-a72f03d21f

## Resumen

`legible-2b-nist-v1120-s0-a72f03d21f` es un adaptador QLoRA publicado por Peter-A-P sobre el modelo base `google/gemma-4-E2B`, un vision-language model de Google con aproximadamente 2.000 millones de parametros efectivos. El adaptador especializa el modelo en una tarea muy concreta: leer las imagenes de pagina de formularios fiscales estadounidenses de 1988 (NIST Special Database 2) y devolver sus campos como un objeto JSON estructurado, un objeto por pagina.

El modelo resuelve el problema de la extraccion de campos en documentos escaneados con estructura fija y conocida de antemano. Frente a pipelines OCR tradicionales o a modelos frontera por API, la propuesta es un modelo pequeno ajustado que se ejecuta en una unica GPU de consumo y que, segun los datos del autor, alcanza un 73,6% de campos correctos en el conjunto de test de 500 caras, con un 1,4% de campos inventados y un coste estimado de 0,40 USD por cada 1.000 paginas.

Es relevante ahora por su enfoque de evaluacion: el autor publica la comparacion contra el modelo base sin ajustar (15,0% de campos correctos) y contra un modelo frontera por API (86,7%), junto con intervalos de confianza bootstrap y metricas de coste. Esto permite valorar con datos si un adaptador pequeno y desplegable en local es suficiente para una tarea de extraccion documental concreta. El repositorio ocupa 0,4 GB y contiene unicamente los pesos del adaptador en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre un vision-language model transformer; el modelo base es `google/gemma-4-E2B` |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 64; el modelo base es de aproximadamente 2B) |
| Parametros activos | No disponible |
| Longitud de contexto | 16.384 tokens de secuencia en entrenamiento; 1.120 tokens visuales por pagina |
| Tipos de cuantizacion | Entrenamiento en NF4 4-bit con doble cuantizacion y computo en bf16; torres de vision y audio, proyector visual y capa de salida en precision completa |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-E2B` en la revision `d29ff6b45f081a49ee2733a859c9c9c2d95d1a6f`, usando la plantilla de chat de `google/gemma-4-E2B-it`. La receta es QLoRA: el modelo base se cuantiza a NF4 de 4 bits con doble cuantizacion y computo en bf16, mientras que las torres de vision y audio, el proyector visual y la capa de salida se mantienen en precision completa. Los adaptadores LoRA tienen rango 64, alpha 128 y dropout 0,05, y se aplican a las proyecciones de atencion y MLP del modelo de lenguaje y al proyector visual, nunca a las torres.

El entrenamiento usa un unico turno de usuario con las imagenes de pagina seguidas de la instruccion del proyecto (`legible.prompt`, version 1), que describe cada campo y proporciona el JSON Schema, y un turno de asistente con el JSON de la verdad de referencia. La perdida se calcula solo sobre los tokens de la respuesta. Se uso un epoch, tasa de aprendizaje 0,0001, schedule coseno, warmup 0,03, un documento por paso y 8 pasos acumulados, semilla 0. El conjunto de entrenamiento fue `nist` (3.850 documentos, de los que se tomaron los primeros 800), con 800 documentos y 800 paginas en total y 97 pasos de optimizador; 25 documentos de la pagina 1 del Schedule D se descartaron por superar el limite de secuencia. Los datos de perdida y tiempos estan en el `run.json` subido junto al adaptador.

## Capacidades

- Extraccion estructurada de campos desde imagenes de documentos: devuelve un objeto JSON por pagina con los campos definidos en el schema correspondiente.
- Cobertura de 20 caras de formulario distintas (1040 paginas 1 y 2, 2106, 2441, 4562, 6251, Schedule A, B, C, D, E, F y SE), con 1.113 campos de texto en total.
- Todos los valores de salida son cadenas de texto o `null`, lo que simplifica el parseo y la validacion posterior.
- Comprension de imagen a texto (`image-text-to-text`) con entrada de multiples paginas en orden.
- Seguimiento de instrucciones con JSON Schema embebido en el prompt.
- Capacidad multilingue limitada al ingles.
- No se documentan en la informacion disponible capacidades de tool calling, razonamiento multi-paso ni modo de pensamiento especificas del adaptador.

## Casos de uso

- Digitalizacion de formularios fiscales historicos: el adaptador convierte imagenes de paginas de formularios de 1988 en JSON campo a campo, lo que permite cargar los datos en bases de datos o sistemas de archivo sin transcripcion manual.
- Procesamiento por lotes en local: al ejecutarse en una unica GPU de consumo con un coste estimado de 0,40 USD por 1.000 paginas, es adecuado para digitalizar volumenes grandes de documentos sin depender de APIs externas.
- Validacion y control de calidad de OCR: combinado con un pipeline OCR clasico, el JSON del adaptador puede usarse como segunda fuente para detectar discrepancias en campos criticos.
- Extraccion en entornos con requisitos de privacidad: al desplegarse on-premise, los documentos no salen de la infraestructura propia, lo que encaja en sectores regulados.
- Prototipado de productos de document understanding: sirve como referencia de hasta donde llega un modelo de 2B ajustado frente a un modelo frontera, util para decidir arquitecturas antes de invertir en APIs.
- Investigacion en extraccion de formularios: el adaptador y sus resultados publicados (con intervalos de confianza y metricas de coste) permiten reproducir y comparar recetas QLoRA sobre documentos con estructura fija.
- Automatizacion de la entrada de datos en gestoria y contabilidad: el JSON por pagina puede alimentar directamente sistemas de gestion tributaria tras una capa de validacion de esquema.

## Benchmarks y rendimiento

Evaluacion sobre 500 caras de test de NIST SD2, lectura unica, temperatura 0, sin restricciones de decodificacion, con los matchers de VRDU y un unico evaluador para todos los lectores. Intervalos del 95% por bootstrap sobre documentos.

| Lector | Campos correctos (IC 95%) | Todos los campos correctos | Campos inventados | Respuestas no parseables | Coste por 1.000 paginas | Documentos |
|---|---|---|---|---|---|---|
| B, Gemma 4 E2B ajustado (este adaptador) | 73,6% (70,4-76,7) | 27,6% (23,8-31,6) | 1,4% (1,0-1,8) | 4,8% (3,0-6,8) | 0,40 USD (0,38-0,42) | 500 |
| C, Gemma 4 E2B sin ajustar sobre la imagen | 15,0% (13,7-16,4) | 0,0% (0,0-0,0) | 27,9% (25,3-30,4) | 9,6% (7,2-12,2) | 0,41 USD (0,39-0,43) | 500 |
| A, Claude Sonnet 5.5 sobre la imagen | 86,7% (84,8-88,4) | 46,2% (42,0-50,4) | 0,7% (0,6-1,0) | 0,0% (0,0-0,0) | 16,38 USD (15,63-17,19) | 500 |

El coste del adaptador se calcula con una RTX 3090 a 0,50 USD/hora en RunPod (2026-10-18) sobre el tiempo de pared medido de la lectura; los modelos frontera se costean con la lista de precios del gateway del 2026-10-16 en tarifa de lote.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el entrenamiento uso cuantizacion NF4 de 4 bits sobre un modelo base de aproximadamente 2B, lo que sugiere que la inferencia cabe holgadamente en GPUs de consumo con 8-12 GB, aunque el dato exacto no se publica.
- GPU recomendadas: RTX 3090 es la GPU usada para el calculo de coste en la evaluacion; por tamano del modelo base, tambien deberia funcionar en RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, segun el perfil de memoria del modelo base de aproximadamente 2B en 4 bits; no se detalla la lista exacta de GPUs verificadas.
- Opciones de despliegue: el adaptador es PEFT sobre `google/gemma-4-E2B`, por lo que se carga con la libreria `peft` sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; solo se publica el coste por 1.000 paginas derivado del tiempo de pared medido (0,40 USD a 0,50 USD/hora, lo que implica aproximadamente 0,8 horas de GPU por cada 1.000 paginas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Campos correctos (NIST SD2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma 4 E2B + QLoRA) | Aproximadamente 2B (base) | 16.384 tokens | 73,6% | Apache 2.0 | Hugging Face, pesos del adaptador |
| Gemma 4 E2B sin ajustar | Aproximadamente 2B | No disponible | 15,0% | Apache 2.0 | Hugging Face |
| Claude Sonnet 5.5 | No disponible | No disponible | 86,7% | Propietaria | API comercial |

La comparativa se limita a los lectores incluidos en la evaluacion del autor. No se dispone de datos de otros adaptadores o pipelines OCR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente sobre formularios fiscales estadounidenses de 1988 de NIST SD2; no se ha validado en otros formatos, idiomas ni epocas.
- Solo soporta ingles y las 20 caras de formulario listadas; cualquier otro documento queda fuera de su dominio.
- Tasa de respuestas no parseables del 4,8% en la evaluacion: en produccion es necesario un validador de JSON Schema y un mecanismo de reintento o fallback.
- Tasa de campos inventados del 1,4%: aunque baja, implica que algunos valores pueden ser incorrectos sin senal de error, por lo que se recomienda verificacion en campos criticos.
- Solo el 27,6% de las paginas obtienen todos los campos correctos, de modo que la mayoria de documentos requerira revision parcial.
- El conjunto de entrenamiento es pequeno (800 documentos y 800 paginas) y algunas caras tienen muy pocos ejemplos (por ejemplo, 8 documentos de 2106_2 y 9 campos en sch_se_1), lo que puede generar un rendimiento desigual entre caras.
- Veinticinco documentos de Schedule D pagina 1 se descartaron por superar el limite de secuencia de 16.384 tokens; documentos con muchas paginas o campos pueden exceder ese limite.
- La licencia del adaptador es Apache 2.0, pero el uso comercial debe verificar tambien las condiciones del modelo base `google/gemma-4-E2B` y la atribucion de NIST SD2 (DOI 10.18434/M3J08M).
- El repositorio tiene 9 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- No se publican datos de sesgos, robustez ante escaneos de baja calidad ni comportamiento fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peter-A-P/legible-2b-nist-v1120-s0-a72f03d21f
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- NIST Special Database 2: https://www.nist.gov/srd/nist-special-database-2
- Licencia de NIST: https://www.nist.gov/open/license
- DOI de NIST SD2: https://doi.org/10.18434/M3J08M
