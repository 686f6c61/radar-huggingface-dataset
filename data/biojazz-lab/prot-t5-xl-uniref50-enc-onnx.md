# BioJazz-Lab/prot-t5-xl-uniref50-enc-onnx

## Resumen

Prot-T5-XL-UniRef50 Encoder (ONNX, Half-Precision) es una version optimizada para inferencia del modelo de lenguaje de proteinas ProtT5-XL-UniRef50, desarrollado originalmente por el Rostlab (TUM) y convertido a formato ONNX por BioJazz-Lab. Se trata de un transformer basado en el encoder de T5-3B, con aproximadamente 1.200 millones de parametros en el encoder, 24 capas, 16 cabezas de atencion y una dimension oculta de 1024. Su proposito es generar embeddings densos de 1024 dimensiones para secuencias de aminoacidos, tanto por residuo como agregados por proteina.

El modelo resuelve el problema de desplegar un extractor de caracteristicas de proteinas de gran tamano en entornos de produccion, manteniendo la precision original en FP16 pero en formato ONNX con pesos externos. Esto permite inferencia cross-platform (CPU, GPU CUDA, aceleradores especializados) con runtime ONNX y un consumo de memoria reducido (unos 2,25 GB de pesos). Es relevante para bioinformatica aplicada, donde se necesita procesar grandes volumenes de secuencias de proteinas de forma eficiente.

El entrenamiento se realizo sobre UniRef50 con un objetivo de denoising tipo BART/MLM, enmascarando el 15% de los aminoacidos. La licencia MIT y la disponibilidad de pesos ONNX lo hacen adecuado para integracion en pipelines de investigacion y produccion, aunque su uso esta acotado a extraccion de caracteristicas (no genera texto ni secuencias).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (T5-3B encoder), ONNX |
| Parametros totales | ~1.200 millones (solo encoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (formas dinamicas, sin limite documentado) |
| Tipos de cuantizacion | FP16 (half-precision); no se documentan otras |
| Idiomas soportados | Ingles (etiqueta de la model card); en la practica opera sobre secuencias de aminoacidos |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) con pesos externos; tamano del repo 2,4 GB |

## Arquitectura y entrenamiento

El modelo es el encoder de T5-3B adaptado a proteinas: 24 capas, hidden size 1024, 16 cabezas de atencion y precision FP16. La conversion a ONNX usa opset 14, pesos externos para las matrices grandes y formas dinamicas para batch y longitud de secuencia. La validacion PyTorch vs ONNX reporta similitud coseno media de 1,000244 y diferencia absoluta maxima de 0,001953, con todos los casos de prueba por encima de 0,998 de similitud coseno.

El preentrenamiento se realizo sobre UniRef50 con un objetivo de denoising tipo BART/MLM: enmascarado aleatorio del 15% de los aminoacidos, vocabulario de 20 aminoacidos estandar mas tokens especiales y preprocesado que sustituye aminoacidos raros (U, Z, O, B) por X. La entrada debe ser en mayusculas y con aminoacidos separados por espacios para el tokenizador T5. No se documentan fases de RLHF ni DPO, dado que es un modelo puramente de representacion.

## Capacidades

- Generacion de embeddings por residuo (forma [batch, seq_len, 1024]) y por proteina mediante mean pooling (vector de 1024 dimensiones).
- Extraccion de caracteristicas para modelos downstream (clasificacion, regresion, clustering).
- Analisis de similitud entre secuencias de proteinas mediante distancia coseno.
- Procesamiento por lotes con formas dinamicas (batch variable y longitud variable).
- Inferencia en CPU, GPU CUDA y aceleradores especializados via ONNX Runtime.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto ni secuencias nuevas.
- Capacidad multilingue limitada a la notacion de aminoacidos; la etiqueta de idioma es "en".

## Casos de uso

- Anotacion funcional de proteinas: usar los embeddings por proteina como entrada a un clasificador que prediga familia o funcion, aprovechando la representacion contextual de 1024 dimensiones.
- Busqueda y recuperacion de proteinas similares: indexar embeddings de una base de datos y recuperar vecinos por similitud coseno para identificar homologos o paralogos.
- Prediccion de estructura secundaria por residuo: alimentar los embeddings por residuo a un cabezal ligero que prediga helices, hojas o coils.
- Deteccion de mutaciones de efecto: comparar embeddings de variantes wild-type y mutante para priorizar variantes con cambio de representacion significativo.
- Preprocesado en pipelines de produccion: desplegar ONNX Runtime con CUDA para procesar lotes grandes de UniRef o metagenomas con latencia controlada (~750 ms para secuencias cortas y ~1,1 s para largas en el ejemplo del autor).
- Desarrollo en Apple Silicon: usar PyTorch con backend MPS para iteracion local en Macs M4, reservando ONNX CPU para despliegue cross-platform.
- Integracion en servicios de bioinformatica: servir embeddings via API usando ONNX Runtime con pesos externos y memoria contenida (unos 2,25 GB).

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Tarea | Valor |
|---|---|---|
| PyTorch-ONNX Similarity (coseno medio) | Protein Embedding Generation | 1,000244 |
| Maximum Absolute Difference | Protein Embedding Generation | 0,001953 |

Rendimiento de inferencia reportado por el autor (ejemplos, depende del hardware y del provider de ONNX Runtime):

| Escenario | Latencia aproximada |
|---|---|
| Secuencias cortas (7-20 aminoacidos) | ~750 ms |
| Secuencias largas (140+ aminoacidos) | ~1,1 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es esperable al tratarse de un modelo de embeddings de proteinas y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada: pesos FP16 de unos 2,25 GB; con overhead de runtime y activaciones, se recomienda al menos 4-6 GB de VRAM para lotes moderados.
- GPU recomendadas: NVIDIA con soporte CUDA para el provider de ONNX Runtime (por ejemplo, RTX 4090, A100, H100); el autor indica que en NVIDIA el provider CUDA suele ser competitivo o mas rapido que PyTorch.
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Apple Silicon: el autor advierte que en Macs M4 PyTorch con backend MPS suele superar a la inferencia ONNX en CPU; usar PyTorch para desarrollo local.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), con pesos externos y formas dinamicas; tokenizador T5 via transformers.
- Latencia y throughput: ~750 ms para secuencias de 7-20 aminoacidos y ~1,1 s para 140+ aminoacidos, segun el autor; el throughput escala con el batch y el provider.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prot-t5-xl-uniref50-enc-onnx (este) | ~1,2B (encoder) | No disponible | FP16, ONNX | MIT | HuggingFace (ONNX) |
| Rostlab/prot_t5_xl_half_uniref50-enc | ~1,2B (encoder) | No disponible | FP16, PyTorch | No disponible en la informacion | HuggingFace (PyTorch) |
| T5-3B (base general) | ~3B | 512 tokens (tipico) | FP32/FP16 | Apache 2.0 (no confirmado aqui) | HuggingFace |

La comparativa con otros modelos de lenguaje de proteinas (por ejemplo, ESM-2) no esta disponible en la informacion proporcionada; no se dispone de datos de parametros, contexto ni rendimiento de esos modelos en esta ficha.

## Limitaciones y advertencias

- Solo acepta secuencias en mayusculas; las minusculas no estan soportadas segun el autor.
- Requiere preprocesado especifico: sustitucion de aminoacidos raros (U, Z, O, B) por X y separacion por espacios para el tokenizador T5.
- No es un modelo generativo: no puede producir texto, secuencias ni razonamiento; su unica salida son embeddings.
- Riesgo de alucinacion no aplica en el sentido generativo, pero los embeddings pueden amplificar sesgos presentes en UniRef50 (por ejemplo, sobrerrepresentacion de ciertas familias proteicas).
- La etiqueta de idioma es "en", aunque en la practica opera sobre notacion de aminoacidos; no hay soporte multilingue documentado.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo original de Rostlab del que deriva.
- Los benchmarks declarados no estan verificados de forma independiente (verified: false en el model-index).
- La latencia depende fuertemente del hardware y del provider de ONNX Runtime; en Apple Silicon el autor recomienda PyTorch en lugar de ONNX CPU.
- No se documenta limite de longitud de contexto; usar truncation=False puede provocar consumo de memoria elevado en secuencias muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BioJazz-Lab/prot-t5-xl-uniref50-enc-onnx
- Modelo original de Rostlab: https://huggingface.co/Rostlab/prot_t5_xl_half_uniref50-enc
- Documentacion de HuggingFace CLI: https://huggingface.co/docs/huggingface_hub/main/en/guides/cli
- Dataset UniRef50: no disponible como enlace directo en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
