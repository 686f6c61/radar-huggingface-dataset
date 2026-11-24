# Enntity/LingSante-3.1-air-VL-NVFP4

## Resumen

LingSante-3.1-air-VL-NVFP4 es una cuantizacion en formato NVFP4 del modelo multimodal inclusionAI/LingSante-3.1-air-VL, publicada por Enntity. Se trata de un modelo de mezcla de expertos (MoE) orientado a tareas de imagen-texto-a-texto con enfasis en el ambito medico, que conserva la torre de vision, el tokenizer, la plantilla de chat y los pesos no expertos del checkpoint original en BF16, mientras que las 61.440 matrices de expertos enrutados se han cuantizado directamente desde el checkpoint BF16 original.

El checkpoint ocupa 70,88 GiB repartidos en 50 shards de pesos e incluye los ficheros de inferencia necesarios. El objetivo declarado es permitir la ejecucion del modelo en un unico dispositivo DGX Spark mediante el motor Atlas del repositorio SparkLing, con contexto nativo de 131.072 tokens. La cuantizacion emplea grupos E2M1 de 16 elementos con escalas de grupo E4M3 y una escala por matriz.

La relevancia de esta ficha radica en que demuestra una via practica para servir un MoE multimodal de gran tamano en hardware de escritorio de gama alta (DGX Spark), con mediciones de rendimiento publicadas (54,3 tok/s en la prueba de conteo a 4K con un solo cliente, y entre 57,6 y 68,9 tok/s con el predictor opcional y contexto de 128K). La precision clinica no ha sido evaluada por el autor de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal con torre de vision; arquitectura `bailing_moe_v3_vl` |
| Parametros totales | 124.848.460.496 (aproximadamente 124,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto nativo segun SparkLing) |
| Tipos de cuantizacion | NVFP4 (grupos E2M1 de 16 con escalas de grupo E4M3 y escala por matriz); pesos no expertos, torre de vision y tokenizer en BF16 original |
| Idiomas soportados | no disponible |
| Licencia | MIT (los pesos del publicador); el codigo incluido conserva sus licencias y avisos a nivel de fichero |
| Formato de pesos | safetensors (50 shards, 70,88 GiB); `compressed-tensors`; 8-bit en metadatos |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con capacidad de procesamiento de imagen y texto (`image-text-to-text`), identificado por la arquitectura `bailing_moe_v3_vl`. La cuantizacion afecta exclusivamente a las 61.440 matrices de expertos enrutados, que se convierten a NVFP4 (E2M1 con grupos de 16 y escalas E4M3 mas una escala por matriz) partiendo del checkpoint BF16 original del publicador. El resto de componentes (pesos no expertos, torre de vision, tokenizer y plantilla de chat) se mantiene en su formato original.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO. El publicador describe el modelo como orientado a investigacion medica, pero los detalles de entrenamiento no se incluyen en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es la propia cuantizacion NVFP4 y su integracion con el motor Atlas de SparkLing, que permite prefill y decode en NVFP4 (`PREFILL_PRECISION=nvfp4 DECODE_PRECISION=nvfp4-mlp-head`) y la posibilidad de activar un predictor especulativo experimental (`DRAFTER=ling-mtp`) descargado por separado desde Ling-3.2-air.

## Capacidades

- Generacion de texto e imagen-texto-a-texto: el pipeline declarado es `image-text-to-text`, con torre de vision conservada del modelo original.
- Razonamiento y matematicas: el autor reporta que el modelo supero comprobaciones aritmeticas y de color sintetico en imagenes.
- Generacion de codigo: se han medido tasas de decodificacion especificas para Python (68,9 tok/s con el predictor opcional y contexto de 128K).
- Procesamiento de imagenes: verificacion de color sintetico en imagenes segun las pruebas del autor.
- Enfoque medico: el modelo base esta orientado a investigacion medica segun inclusionAI; la precision clinica no ha sido evaluada en esta cuantizacion.
- Conversacional: etiqueta `conversational` y plantilla de chat incluida.
- Contexto largo: 131.072 tokens nativos en el servidor SparkLing.
- Decodificacion especulativa opcional: predictor `ling-mtp` descargable por separado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia medica de investigacion: el modelo puede procesar imagenes clinicas junto con texto para tareas de investigacion, aprovechando su torre de vision y su contexto de 131.072 tokens para incorporar historiales extensos y estudios de imagen en una sola peticion. La validacion clinica queda fuera del alcance declarado.
- Despliegue en un unico DGX Spark: gracias a la cuantizacion NVFP4 y al motor Atlas, el modelo se sirve en un dispositivo de escritorio de gama alta con 54,3 tok/s en la prueba de conteo a 4K con un solo cliente, lo que lo hace viable para entornos de laboratorio sin cluster.
- Analisis de documentos con imagenes: la combinacion de contexto largo y vision permite procesar informes, figuras y tablas en una misma conversacion, util para extraccion de informacion en pipelines de investigacion.
- Generacion de codigo en flujos de desarrollo: las mediciones de decodificacion en Python (68,9 tok/s con predictor y contexto de 128K) indican viabilidad para asistencia de codigo en tiempo interactivo, aunque no se documenta soporte de tool calling.
- Prototipado de asistentes conversacionales multimodales: la plantilla de chat y el pipeline conversacional permiten construir demos de dialogo con imagenes sin reentrenamiento.
- Evaluacion comparativa de cuantizaciones: el checkpoint sirve como referencia para medir la fidelidad numerica de NVFP4 frente al BF16 original en tareas de conteo, prosa y codigo, tal como documenta el autor en sus resultados.
- Investigacion sobre decodificacion especulativa: la opcion `DRAFTER=ling-mtp` permite experimentar con prediccion especulativa en un MoE multimodal de gran tamano, con metricas publicadas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta mediciones de rendimiento de servicio:

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput en prueba de conteo | 54,3 tok/s | 4K, un solo cliente, NVFP4 sin predictor |
| Throughput en conteo | 61,1 tok/s | 128K de contexto, predictor `ling-mtp`, peticiones de 64 tokens |
| Throughput en prosa | 57,6 tok/s | 128K de contexto, predictor `ling-mtp`, peticiones de 64 tokens |
| Throughput en Python | 68,9 tok/s | 128K de contexto, predictor `ling-mtp`, peticiones de 64 tokens |

El autor indica que la decodificacion especulativa altero la continuacion de prosa. Las pruebas cubrieron fidelidad numerica y rendimiento de servicio; la precision clinica no fue evaluada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 70,88 GiB en disco (50 shards); se requiere un dispositivo con memoria unificada o VRAM suficiente para alojar esos pesos, como un DGX Spark.
- GPU recomendadas: DGX Spark (objetivo declarado del autor). No se documentan otras GPU compatibles con el motor Atlas en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; el formato NVFP4 y el motor Atlas estan orientados al DGX Spark.
- Opciones de despliegue: motor Atlas del repositorio SparkLing (`./start.sh --model sante-air-vl --mode spark --quant nvfp4 up`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 54,3 tok/s en conteo a 4K con un cliente; 57,6-68,9 tok/s con predictor opcional y contexto de 128K.
- Predictor especulativo opcional: `DRAFTER=ling-mtp`, descargado por separado desde Ling-3.2-air; no incluido en este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingSante-3.1-air-VL-NVFP4 (esta ficha) | 124,8 mil millones | 131.072 tokens | safetensors NVFP4 | MIT | Hugging Face (Enntity) |
| inclusionAI/LingSante-3.1-air-VL (base) | no disponible | no disponible | BF16 | MIT | Hugging Face (inclusionAI) |
| Ling-3.2-air (origen del predictor `ling-mtp`) | no disponible | no disponible | no disponible | no disponible | Hugging Face / SparkLing |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Precision clinica no evaluada: el autor advierte explicitamente que la evaluacion cubrio fidelidad numerica y rendimiento de servicio, no precision clinica; debe consultarse el uso previsto y las limitaciones de inclusionAI para investigacion medica.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos multimodales.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto o idioma: contexto nativo de 131.072 tokens; los idiomas soportados no estan documentados.
- Restricciones de licencia: los pesos se publican bajo MIT, pero el codigo incluido conserva sus licencias y avisos a nivel de fichero, que deben revisarse antes de uso comercial.
- Dependencia de hardware y software propietario del ecosistema: el despliegue documentado depende del motor Atlas de SparkLing y del DGX Spark; no se documentan alternativas.
- Predictor especulativo opcional: no incluido en el checkpoint; requiere descarga separada y puede alterar las continuaciones (el autor observo cambios en prosa).
- Integridad de ficheros: el autor proporciona SHA256SUMS para los 70 ficheros de inferencia; conviene verificarlo tras la descarga.
- Madurez de la publicacion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Enntity/LingSante-3.1-air-VL-NVFP4
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Checkpoint fuente citado: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL/tree/1f398c937d6069994a156689636832c47d8c09be
- Cuantizador: https://github.com/Enntity/SparkLing/blob/7a88a27/install/quantize_sante.py
- Repositorio SparkLing: https://github.com/Enntity/SparkLing
- Mediciones: https://github.com/Enntity/SparkLing/tree/8075cc2/results/2026-11-24/air-vl-quant
- Ejecucion empaquetada: https://github.com/Enntity/SparkLing/tree/8075cc2/results/2026-11-24/packaged
- Model card del publicador: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
