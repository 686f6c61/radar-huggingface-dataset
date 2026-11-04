# AhmedYasserEssam/privacyshield-smollm3-3b-pii-qlora

## Resumen

PrivacyShield es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base SmolLM3-3B de HuggingFaceTB, desarrollado por AhmedYasserEssam. Su propósito es la extracción estructurada de información personal identificable (PII) en documentos en inglés, devolviendo entidades en formato JSON con tipo y texto exacto, que posteriormente se alinean de forma determinista con el documento fuente para obtener desplazamientos de caracteres.

El modelo aborda un problema clásico de cumplimiento normativo y privacidad: la detección y anonimización de datos personales en textos. A diferencia de aproximaciones puramente generativas, el autor separa la predicción (a cargo del LLM) de la localización exacta (a cargo de un postprocesador determinista), lo que permite rechazar explícitamente extracciones inválidas en lugar de producir redacciones parciales silenciosas.

Se trata de un piloto de investigación y portfolio, no de un producto listo para producción. El repositorio contiene únicamente el adaptador PEFT (0,1 GB), no los pesos completos de SmolLM3-3B, que deben descargarse por separado. La validación reportada (micro-F1 de 0,8909) procede de anotaciones provisionales congeladas, no de una evaluación final independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con adaptador LoRA (QLoRA) |
| Parametros totales | 3B (modelo base); el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base SmolLM3-3B) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (bitsandbytes) en el ejemplo oficial; el adaptador en si se distribuye en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere pesos base de SmolLM3-3B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre SmolLM3-3B, un transformer decoder-only de 3.000 millones de parametros. El ajuste se realizo con QLoRA (cuantizacion 4-bit del base durante el entrenamiento) durante 500 pasos de optimizador, equivalentes a una epoca sobre el conjunto de entrenamiento. El adaptador se carga con PEFT sobre el modelo base cuantizado en 4-bit NF4 con doble cuantizacion y atencion SDPA.

Los datos de entrenamiento consisten en 2.000 documentos sinteticos cribados, derivados del dataset `gretelai/gretel-pii-masking-en-v1`, con un total de 8.619 entidades anotadas. La taxonomia original se consolido en 17 categorias (PERSON_NAME, EMAIL, PHONE, LOCATION, DATE_OF_BIRTH, DATE_TIME, OFFICIAL_ID, FINANCIAL_ID, SECRET, MEDICAL_ID, USERNAME, ORGANIZATION, BIOMETRIC_ID, DIGITAL_DEVICE_ID, VEHICLE_ID, OTHER_ID, URL). La innovacion principal no esta en la arquitectura sino en el pipeline: el LLM predice tipos y cadenas de texto exactas, y un postprocesador determinista (`postprocess.py`) localiza esas cadenas en el documento fuente y asigna offsets de caracteres basados en cero y con fin exclusivo, rechazando JSON invalido, coincidencias ambiguas, duplicados y solapamientos.

## Capacidades

- Extraccion de entidades PII en ingles con salida JSON estructurada (`type` y `text`).
- Clasificacion en 17 categorias consolidadas de PII, incluyendo identificadores oficiales, financieros, medicos, biometricos y secretos.
- Generacion de texto conversacional (pipeline `text-generation` con plantilla de chat), aunque el uso previsto es la extraccion.
- Alineacion determinista de entidades con el texto fuente mediante postprocesador externo, produciendo offsets de caracteres.
- Validacion estricta de esquema, unicidad y solapamientos; rechazo explicito ante fallos en lugar de redaccion parcial.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking especifico en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Anonimizacion previa a comparticion de datos: el modelo extrae entidades PII de documentos y el postprocesador devuelve offsets exactos que permiten enmascarar o redactar los tramos identificados antes de enviar el texto a terceros.
- Cumplimiento RGPD en pipelines de datos: integrado como paso de deteccion en flujos de ingestion, marca campos personales en registros y genera un informe de entidades con posiciones verificables.
- Preprocesamiento para entrenamiento de modelos: deteccion y eliminacion de PII en corpus antes de usarlos en fine-tuning, reduciendo el riesgo de memorizacion de datos personales.
- Revision de logs y tickets de soporte: extraccion de nombres, correos, telefonos e identificadores en textos operativos para su redaccion automatizada antes de almacenarlos o analizarlos.
- Enriquecimiento de documentos con metadatos: la salida JSON con offsets permite indexar entidades y construir vistas estructuradas de documentos no estructurados.
- Prototipado e investigacion en NER: base para experimentos de extraccion estructurada con modelos pequenos (3B) y adaptadores ligeros, util en entornos con recursos limitados.
- Filtrado de secretos y credenciales: la categoria SECRET permite detectar cadenas sensibles en textos y activar alertas o bloqueos en pipelines de publicacion.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Micro-F1 de validacion (tipo exacto + span de caracteres, tras alineacion) | 0,8909 | 500 documentos de validacion provisionales congelados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que la cifra de validacion procede de anotaciones provisionales y no de una evaluacion final independiente.

## Requisitos de hardware

- VRAM estimada: el modelo base de 3B en 4-bit NF4 con doble cuantizacion ocupa aproximadamente 2-3 GB; en fp16 requiere en torno a 6-7 GB. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; el ejemplo oficial asume una GPU CUDA y usa `device_map={"": 0}`.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en 4-bit tambien en GPUs de 8 GB.
- Opciones de despliegue: transformers + PEFT + bitsandbytes (ruta documentada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion usa decodificacion greedy (`do_sample=False`, `num_beams=1`) con `max_new_tokens=384`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PrivacyShield (este) | 3B (base) + LoRA | no disponible | Extraccion PII en ingles con offsets | apache-2.0 | Adaptador PEFT en HuggingFace |
| SmolLM3-3B (base) | 3B | no disponible | Generacion de texto general | no disponible en la informacion | Pesos completos en HuggingFace |
| Modelos NER clasicos (p. ej. spaCy, BERT-NER) | 100M-400M | limitado | NER supervisado | variable | Amplia disponibilidad |
| LLMs generales grandes (p. ej. familia 7B-70B) | 7B-70B | variable | Extraccion generica | variable | Amplia disponibilidad |

No se dispone de datos comparativos de rendimiento frente a alternativas en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Estado de publicacion: piloto de investigacion y portfolio; los resultados provienen de anotaciones de validacion provisionales, no de un test final independiente.
- No debe asumirse que proporciona redaccion de PII completa o segura; el propio autor lo advierte explicitamente.
- Solo ingles; sin soporte multilingue documentado.
- Entrenado con datos sinteticos (2.000 documentos), lo que puede limitar la generalizacion a dominios y formatos reales.
- Riesgo de alucinacion: el LLM puede generar entidades o textos inexistentes; el postprocesador rechaza coincidencias invalidas, pero un rechazo no implica ausencia de PII no detectada.
- El postprocesador no normaliza texto, no infiere offsets ausentes ni resuelve ocurrencias repetidas identicas; estos casos se rechazan.
- No se documentan sesgos especificos, pero al derivarse de un dataset sintetico en ingles puede heredar sesgos de su generacion.
- Licencia apache-2.0 en el adaptador; deben verificarse las condiciones del modelo base SmolLM3-3B para uso comercial.
- Requiere cargar el modelo base completo ademas del adaptador; el repositorio solo contiene 0,1 GB de pesos LoRA.
- No se documenta soporte para tool calling, agentes ni despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/AhmedYasserEssam/privacyshield-smollm3-3b-pii-qlora
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
