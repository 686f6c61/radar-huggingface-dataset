# iapp/openthai2.0-qwen3.8-27b-INT8-W8A8

## Resumen

OpenThai 2.0 es un modelo de inteligencia artificial tailandés de código abierto con 27.400 millones de parámetros, desarrollado por iApp Technology y AIEAT sobre la base de Qwen3.8-27B. Esta variante concreta es la cuantización INT8 W8A8 (GPTQ) del modelo completo, que conserva la torre de visión y el cabezal de decodificación especulativa (MTP) en bf16 para mantener las capacidades de lectura de documentos y la velocidad de generación.

El modelo resuelve la falta de modelos abiertos tailandeses de alta calidad: lee documentos y escritura manual tailandesa a nivel especialista, responde con conocimiento local del país y destaca en uso agéntico de herramientas (BFCL 0,820), manteniendo la inteligencia general del modelo base. Su relevancia actual radica en ser uno de los pocos modelos abiertos bilingües tailandés-inglés con visión, OCR y capacidades agénticas en un solo paquete, disponible en formato cuantizado para GPU de 40 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con torre de visión y cabezal MTP para decodificacion especulativa |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | INT8 W8A8 (GPTQ); torre de visión y MTP en bf16 |
| Idiomas soportados | Tailandes (th), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base OpenThai 2.0 se construye sobre Qwen3.8-27B, un transformer denso de 27.400 millones de parametros con arquitectura Qwen3.5. Anade una torre de vision especializada en lectura de documentos y escritura manual tailandesa, asi como un cabezal MTP (multi-token prediction) para decodificacion especulativa. La cuantizacion INT8 W8A8 se realizo con llmcompressor, calibrando con 512x2048 muestras de ultrachat, y manteniendo la torre de vision y el cabezal MTP en bf16 para no degradar la lectura de documentos ni la velocidad de generacion.

El entrenamiento incluye conocimiento especifico de Tailandia (historia, cultura, legislacion, geografia) y ajuste para razonamiento agentico. El modelo razona antes de responder, lo que requiere dejar el parametro max_tokens sin definir o por encima de 8192 tokens, y mantener un repetition_penalty de 1,05. Los datos exactos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Lectura de documentos tailandeses y escritura manual a nivel especialista, con una reduccion del 60% de errores frente al modelo base.
- Conocimiento profundo de Tailandia: responde preguntas sobre historia, cultura, legislacion y geografia del pais.
- Uso agentico de herramientas (tool calling): lidera a su modelo base y a Typhoon 2.5 en benchmarks BFCL (0,820).
- Razonamiento multi-paso: el modelo genera una cadena de razonamiento antes de responder.
- Decodificacion especulativa mediante cabezal MTP, que acelera la generacion sin perdida de calidad.
- Capacidades multilingues tailandes-ingles, con generacion de texto natural y explicativa en tailandes.
- Vision artificial (vision-language): integra la torre de vision para tareas OCR y comprension de imagenes de documentos.

## Casos de uso

- Digitalizacion de documentos administrativos tailandeses: el modelo puede transcribir y estructurar escritura manual y documentos escaneados en tailandes, reduciendo errores de OCR en un 60% frente a modelos base genericos.
- Atencion al cliente automatizada en tailandes: con 32.768 tokens de contexto y capacidades agenticas, puede gestionar conversaciones multi-turno y consultar bases de conocimiento o APIs mediante tool calling.
- Asistente legal y gubernamental: su conocimiento de legislacion tailandesa (puntuacion de 0,842 en examenes nacionales) permite responder consultas sobre normativa local con precision.
- Agente autonomo con herramientas: gracias a su rendimiento BFCL de 0,820, puede integrarse en pipelines que requieren planificacion multi-paso y ejecucion de llamadas a funciones.
- Educacion y evaluacion: util para generar material didactico en tailandes, corregir examenes y responder preguntas sobre el curriculo nacional tailandes.
- Investigacion historica y cultural: su conocimiento especializado de Tailandia permite responder consultas sobre historia, cultura y patrimonio que los modelos generalistas fallan.
- Despliegue de OCR en produccion: la cuantizacion INT8 (~29 GB) permite ejecutar el modelo en GPU de 40 GB, manteniendo la torre de vision en bf16 para preservar la calidad de lectura.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| Examens nacionales tailandeses | 0,842 | Supera al modelo base |
| BFCL (agente con herramientas) | 0,820 | Lidera frente al modelo base y Typhoon 2.5 |
| Error en lectura de escritura manual tailandesa | -60% vs modelo base | Reduccion de errores |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para esta variante cuantizada. El modelo base (bf16) mantiene la inteligencia general de Qwen3.8-27B, segun el autor.

## Requisitos de hardware

- VRAM estimada: ~29 GB para los pesos en INT8 W8A8, mas overhead de activaciones y KV cache. Cabe en GPU de 40 GB.
- GPUs recomendadas: H100 (validada en pruebas de humo), A100 40GB, A6000 48GB, o cualquier GPU con 40 GB o mas de VRAM.
- GPU de consumo: no cabe en RTX 4090 (24 GB) sin cuantizacion adicional o tecnicas de offloading; el autor menciona formatos para MacBook y Blackwell en la familia completa, pero esta variante INT8 requiere 40 GB.
- Opciones de despliegue: vLLM (comando oficial proporcionado), con soporte para reasoning parser qwen3 y trust-remote-code. Tambien compatible con el ecosistema compressed-tensors.
- Latencia y throughput: no disponible en la informacion proporcionada. La decodificacion especulativa con cabezal MTP deberia mejorar el throughput frente a la version bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | BFCL | Notas |
|---|---|---|---|---|---|
| OpenThai 2.0 INT8 (este) | 27,4B | 32K | Apache 2.0 | 0,820 | Cuantizado, vision y OCR |
| OpenThai 2.0 bf16 (base) | 27,4B | 32K | Apache 2.0 | inferior a 0,820 | Precision completa, mayor VRAM |
| Typhoon 2.5 | no disponible | no disponible | no disponible | inferior a 0,820 | Modelo tailandes competidor |
| Qwen3.8-27B (base generica) | 27,4B | 32K | Apache 2.0 | no disponible | Sin vision ni conocimiento tailandes |

## Limitaciones y advertencias

- Modelo centrado en tailandes e ingles: su rendimiento en otros idiomas no esta garantizado ni documentado.
- La cuantizacion INT8 puede introducir una ligera degradacion de calidad frente al modelo bf16, aunque el autor afirma que la torre de vision y el cabezal MTP se mantienen en bf16 para preservar las capacidades criticas.
- El modelo razona antes de responder: si se limita max_tokens por debajo de 8192, las respuestas pueden truncarse. Requiere configurar repetition_penalty en 1,05.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar informacion, especialmente en dominios fuera de su conocimiento tailandes.
- Requisitos de VRAM elevados (~29 GB): no es desplegable en GPU de consumo de 24 GB sin cuantizacion adicional u offloading.
- Sesgos: al estar entrenado con datos tailandeses, puede reflejar sesgos culturales y lingüisticos propios de ese contexto. No se han documentado evaluaciones de sesgo.
- Datos de entrenamiento no publicos: no se han publicado detalles sobre el dataset, su composicion ni el proceso de alineacion (RLHF o DPO), lo que dificulta la auditoria.

## Enlaces

- Modelo cuantizado: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-INT8-W8A8
- Modelo base bf16: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Pagina oficial de OpenThai 2.0: https://iapp.co.th/openmodels/openthai2p0
- Blog de lanzamiento: https://iapp.co.th/blog/openthai2p0-launch
- Anuncio de AIEAT: https://openthai.aieat.or.th/en/openthai2p0
