# anandkaman/gemma3_12b_deedexp

## Resumen

`gemma3_12b_deedexp` es un ajuste fino supervisado de `google/gemma-3-12b-it` desarrollado por el usuario independiente anandkaman, especializado en la extracción estructurada de información de documentos de registro de propiedad del estado de Karnataka (India). El modelo recibe el texto OCR de una escritura registral, que mezcla kannada e inglés, y devuelve un único registro JSON con compradores, vendedores, datos de la propiedad y datos del documento. Resuelve un problema muy concreto: la desambiguación de roles (quién compra y quién vende) en documentos legales con múltiples intervinientes, testigos y promotores, donde los modelos genéricos fallan con frecuencia.

El modelo parte de la arquitectura Gemma 3 de 12.187.325.040 parámetros (unos 12,19 mil millones), con capacidades multimodales heredadas del base, aunque el ajuste se centra en texto OCR. Se ha entrenado en tres etapas encadenadas: preentrenamiento adaptado al dominio sobre 1.771 documentos registrales (~16,0 millones de tokens), una etapa puente de instrucciones sobre la semántica del documento y un entrenamiento supervisado de extracción con 21 variantes de prompt (7 estilos × 3 alcances).

Es relevante ahora porque digitaliza un flujo administrativo históricamente manual en el estado de Karnataka, con un enfoque poco habitual en el ecosistema open source: especialización vertical extrema sobre un modelo base abierto, con prompts e inferencia publicados y un hermano para documentos de Andhra Pradesh (telugu). El autor lo marca explícitamente como "for testing": no hay benchmark agregado publicado (F1 sobre el conjunto de 60 documentos retenidos aún no completado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (`Gemma3ForConditionalGeneration`), base Gemma 3 |
| Parámetros totales | 12.187.325.040 (~12,19 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Gemma 3 12B-it) |
| Tipos de cuantización | Pesos publicados en bf16 sin `quantization_config`; cuantización a 4-bit recomendada para GPUs pequeñas; script `serving/quantize_12b.py` incluido |
| Idiomas soportados | kannada (kn) e inglés (en) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (bf16, repo de 24,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only multimodal de la familia Gemma 3, cargado como `Gemma3ForConditionalGeneration` en bf16. El ajuste se realizó en tres etapas sucesivas con QLoRA (`r=16`, `alpha=32`, escalado de mezcla 2,0, LoRA simple sin DoRA/rsLoRA ni `modules_to_save`), con la base bf16 cargada en 4 bits mediante bitsandbytes NF4 con doble cuantización y cómputo en bf16. La primera etapa es un preentrenamiento adaptado al dominio sobre texto de documentos registrales (1.771 documentos, ~16,0 millones de tokens, excluyendo todos los documentos de validación). La segunda es una etapa puente de instrucciones que enseña el significado del vocabulario documental (roles, identificadores, fechas). La tercera es el entrenamiento supervisado de extracción sobre siete estilos de prompt, cada uno también en forma dividida en dos peticiones (partes / transacción + propiedad).

Los pesos publicados son tres mezclas LoRA sucesivas en la base bf16, en orden base → DAPT → puente → SFT. Cada mezcla aplica `W += (alpha / r) * (B @ A)` = `W += 2,0 * (B @ A)`, calculada en fp32 y convertida de nuevo a bf16, aplicada fragmento a fragmento para no requerir los 24 GB completos en memoria (basta un host de 15 GB). Cada adaptador se entrenó sobre los pesos mezclados de la etapa anterior, por lo que no existe una pila de adaptadores reproducible: el orden de mezcla es el orden de las etapas. Como cada etapa se ajustó contra pesos desquantizados de NF4 y se mezcló en bf16, los pesos publicados son la mezcla QLoRA estándar, no idénticos bit a bit a lo que vio cada optimizador. El hermano telugu `anandkaman/gemma3_12b_deedexp_te` se distribuye como adaptador y su `MERGE.md` contiene el script de mezcla y la lista de comprobación completa.

## Capacidades

- Extracción de información estructurada: devuelve un JSON con `buyer_details`, `seller_details`, `property_details` y `document_details` a partir del texto OCR de una escritura registral.
- Desambiguación de roles: distingue compradores, vendedores, testigos de consentimiento y promotores según lo que el documento declara que hace cada parte, no según el orden de impresión.
- Normalización de fechas: `transaction_date` se toma de la fecha de registro del endoso del Sub-Registrar, no de la fecha de ejecución.
- Manejo de identificadores: Aadhaar y PAN malformados, enmascarados o parciales se devuelven como `null` y nunca se reparan.
- Fidelidad literal: el texto se copia tal como está impreso, sin traducir ni normalizar; los errores de OCR en nombres se conservan.
- Multilingüe kn/en: procesa documentos que mezclan kannada e inglés en el mismo texto.
- 21 prompts publicados: 7 estilos (`micro`, `brief`, `short`, `medium`, `long`, `fields`, `user`) × 3 alcances (`full`, `parties`, `txn_property`), entrenados de forma independiente por fila, de modo que cualquier estilo funciona con cualquier alcance.
- Modo dividido: dos peticiones sobre el mismo OCR (partes / transacción + propiedad) cuyos JSON se fusionan.
- Decodificación greedy con hasta 2.500 tokens nuevos y un único `<bos>` (el chat template ya lo añade).
- Capacidades multimodales heredadas del base Gemma 3 12B-it (el ajuste se centra en texto OCR).

## Casos de uso

- Digitalización de registros de propiedad en Karnataka: el modelo convierte el OCR de una escritura en un JSON listo para base de datos, eliminando la transcripción manual de compradores, vendedores y datos registrales en un flujo administrativo repetitivo.
- Desambiguación de roles en escrituras complejas: en documentos con 1 comprador y 10 vendedores, o con promotores y testigos intercalados, el modelo asigna correctamente los roles donde el modelo base de 4B los invertía; adecuado para pipelines de verificación registral.
- Extracción de identificadores fiscales: obtiene Aadhaar y PAN de cada parte con una política estricta de `null` ante datos malformados, útil en procesos de KYC y cruce con bases de datos fiscales.
- Procesamiento por lotes de archivos históricos: con prompts `micro` y decodificación greedy, se puede ejecutar sobre lotes de OCR con dos peticiones divididas por documento y fusionar los JSON, lo que encaja en un pipeline ETL documental.
- Auditoría de fecha de registro: la distinción entre fecha de ejecución y fecha de endoso del Sub-Registrar permite construir índices cronológicos fiables de transacciones inmobiliarias.
- Validación de integridad documental: al copiar literalmente el texto impreso y no reparar identificadores, el JSON sirve como registro fiel para revisión humana y detección de anomalías en escrituras.
- Prototipado de un especialista estatal: sirve como referencia para construir modelos equivalentes en otros estados, como demuestra el hermano telugu para Andhra Pradesh.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados en la información disponible. El conjunto retenido de 60 documentos no se ha completado, por lo que no hay cifras de F1. Lo único medido son cinco documentos retenidos elegidos porque el modelo anterior de 4B fallaba en ellos, ejecutados dos veces (petición única y dividida):

| Documento | Comportamiento del 4B anterior | Este modelo |
|---|---|---|
| 2 compradores / 1 vendedor | roles intercambiados | roles correctos |
| 1 comprador / 10 vendedores | colapsado a 9 compradores / 7 vendedores | exacto en ambos modos |
| 4 compradores / 1 vendedor | intercambiado a 2 / 2 | exacto en ambos modos |
| 1 comprador / 5 vendedores | intercambiado; un intento posterior devolvió JSON inválido | exacto en ambos modos |
| 1 comprador / 9 vendedores | un intento anterior invirtió el documento | sigue el `Party Type` del documento |

El prompt `micro` se heredó del benchmark del modelo de 4B, donde ganó en el mismo conjunto de validación; no se ha re-evaluado a 12B, ni tampoco la comparación entre petición única y dividida. La elección es heredada, no establecida.

## Requisitos de hardware

- VRAM estimada: ~24 GB para los pesos bf16 completos (repo de 24,4 GB); carga en 4-bit para tarjetas más pequeñas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16; RTX 4090 (24 GB) al límite para bf16 y holgada en 4-bit.
- GPU de consumo: cabe en 4-bit en tarjetas de 16-24 GB; en bf16 requiere 24 GB o más.
- Despliegue: `transformers>=4.50` con `torch` y `accelerate` (script `inference.py` incluido); compatible con text-generation-inference y endpoints según los tags del repo; cuantización propia con `serving/quantize_12b.py`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anandkaman/gemma3_12b_deedexp` | ~12,19 B | no disponible | Escrituras de Karnataka (kn/en), salida JSON | Gemma | Pesos bf16 en HF |
| `anandkaman/gemma3_12b_deedexp_te` | ~12,19 B (base) | no disponible | Escrituras de Andhra Pradesh (te), distribuido como adaptador | Gemma | Adaptador en HF |
| `google/gemma-3-12b-it` | ~12,19 B | no disponible | Modelo generalista multimodal con instrucciones | Gemma | Pesos en HF |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Estado "for testing": el autor no ha completado la evaluación agregada sobre los 60 documentos retenidos, por lo que no hay F1 publicado; no debe considerarse listo para producción sin validación propia.
- Dominio restringido: entrenado únicamente con documentos de registro de Karnataka; no es un modelo multiestado (el hermano telugu se entrena aparte por diferencias de idioma, tabla de tasas y vocabulario de roles).
- Riesgo de alucinación en campos ausentes: aunque la política es devolver `null` ante información incompleta, no hay métricas que cuantifiquen la tasa de invención en documentos fuera de distribución.
- Dependencia del OCR: errores de OCR en nombres se copian literalmente; la calidad final depende de la calidad del texto de entrada.
- Restricciones de licencia: sujeto a los términos de uso de Gemma de Google, que imponen condiciones a la redistribución y al uso comercial; conviene revisarlos antes de desplegar.
- Idiomas: solo kannada e inglés; no cubre otros idiomas oficiales de la India.
- Sesgos: no se documentan sesgos específicos; al tratar datos personales (Aadhaar, PAN, direcciones) hay implicaciones de privacidad y protección de datos que el despliegue debe gestionar.
- Reproducibilidad: los pesos son mezclas QLoRA en bf16 no idénticas bit a bit a lo que vio cada optimizador, y la elección del prompt `micro` es heredada del 4B sin re-evaluar a 12B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anandkaman/gemma3_12b_deedexp
- Hermano telugu (Andhra Pradesh): https://huggingface.co/anandkaman/gemma3_12b_deedexp_te
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Ficha en free2aitools: https://free2aitools.com/model/anandkaman/gemma3_12b_deedexp
