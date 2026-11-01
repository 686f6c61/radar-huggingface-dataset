# jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c3

## Resumen

Meta-Llama-3.1-8B-Instruct-awq-w4a16-c3 es una version cuantizada a 4 bits del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicada por el usuario jy395. La cuantizacion se ha realizado con la tecnica AWQ en su variante asimetrica W4A16 (pesos a 4 bits, activaciones a 16 bits) mediante la libreria llm-compressor, y se ha calibrado sobre el corpus C3-FinMix, compuesto por 2.042 prompts financieros formateados como tarea y unos 260.000 tokens.

El checkpoint forma parte de una coleccion de 30 configuraciones comprimidas publicadas junto al articulo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", presentado en ICAIF '26. El objetivo del trabajo es estudiar cuando la compresion post-entrenamiento de modelos de lenguaje financieros requiere datos de calibracion alineados con el dominio, y esta configuracion concreta es una de las variantes evaluadas con calibracion especifica de finanzas.

El modelo hereda la arquitectura y las capacidades del Llama 3.1 8B Instruct original (transformer decoder-only, contexto de 128.000 tokens, licencia Llama 3.1), pero con un peso en disco de 5,7 GB y un numero de parametros almacenados de 1.984.696.768, lo que lo hace atractivo para despliegue en GPUs de gama media y para entornos donde el coste de memoria es critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos cuantizados AWQ W4A16 |
| Parametros totales | 1.984.696.768 parametros almacenados (derivado de Llama 3.1 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | AWQ W4A16 asimetrica (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors en formato compressed-tensors |
| Tamano del repo | 5,7 GB |
| Calibracion | C3-FinMix: 2.042 prompts financieros (~260k tokens), max_seq_length=2048, semilla 42 |
| Herramienta de cuantizacion | llm-compressor (`scripts/quantization/awq_w4a16.py`) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una compresion post-entrenamiento del checkpoint meta-llama/Meta-Llama-3.1-8B-Instruct, un transformer decoder-only de 8.000 millones de parametros con atencion causal estandar y contexto nativo de 128.000 tokens. La innovacion de esta ficha no esta en la arquitectura, sino en el proceso de cuantizacion: se aplica AWQ (Activation-aware Weight Quantization) en esquema asimetrico W4A16, que cuantiza los pesos a 4 bits preservando los canales de activacion mas sensibles, y se deja la computacion de activaciones en 16 bits.

El paso de calibracion es el elemento diferencial. En lugar de usar un corpus generico, se consume integramente C3-FinMix, un conjunto de 2.042 prompts financieros construidos a partir de los splits de entrenamiento y validacion de diez benchmarks financieros (nunca de test), con `max_seq_length=2048` y semilla 42. El articulo de ICAIF '26 estudia precisamente si la calibracion con datos del dominio mejora la recuperacion del rendimiento tras la compresion, y esta configuracion forma parte de ese estudio comparativo. El resultado se empaqueta en formato compressed-tensors, cargable directamente en vLLM o en transformers.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredadas del Llama 3.1 8B Instruct.
- Respuesta a instrucciones y conversaciones multi-turno con formato de chat.
- Capacidades de codigo y matematicas propias del modelo base (no se han publicado evaluaciones especificas para esta version cuantizada).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en esta configuracion cuantizada).
- Capacidades multilingues del modelo base (el modelo original cubre principalmente ingles y varios idiomas europeos; no hay datos especificos para esta version).
- Orientacion al dominio financiero por la calibracion con C3-FinMix, aunque no se ha reentrenado con datos financieros.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Analisis de documentos financieros: el modelo puede resumir y responder preguntas sobre informes y estados financieros, aprovechando tanto el contexto largo del modelo base como la calibracion en prompts financieros que preserva mejor el comportamiento en ese dominio.
- Asistente conversacional de atencion al cliente en banca: al ocupar 5,7 GB en disco y requerir menos VRAM que el modelo de 8 bits o 16 bits, puede desplegarse en una unica GPU para gestionar conversaciones multi-turno con baja latencia.
- Extraccion de entidades y datos estructurados de textos financieros: se puede usar en pipelines de procesamiento por lotes para convertir noticias o informes en JSON, con un coste de inferencia reducido por la cuantizacion W4A16.
- Generacion de codigo en entornos con recursos limitados: sirve como asistente de programacion en estaciones de trabajo con una sola GPU consumer, aunque conviene validar la calidad frente al modelo sin cuantizar.
- Prototipado rapido de aplicaciones LLM: el formato compressed-tensors se carga directamente en vLLM y transformers, lo que permite montar un servidor de inferencia en minutos sin pasos de conversion adicionales.
- Evaluacion de tecnicas de compresion: investigadores que estudien el impacto de la calibracion por dominio pueden usar esta configuracion como referencia frente a las otras 29 variantes de la coleccion ICAIF '26.
- Despliegue en edge o entornos con memoria restringida: el menor footprint permite ejecutar el modelo en GPUs de 12-16 GB con margen para el contexto y el KV cache.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluacion del repositorio GitHub del autor para reproducir las diez tareas financieras del articulo, pero no incluye cifras numericas en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB solo para los pesos en W4A16; con KV cache y overhead del runtime, entre 6 y 10 GB segun la longitud de contexto.
- GPU recomendadas: NVIDIA A100, H100 o L40S para produccion con concurrencia; RTX 4090 o RTX 3090 para desarrollo y despliegue de una sola instancia.
- Cabe en GPUs consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores, siempre que se limite la longitud de contexto.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`, y en general cualquier runtime compatible con compressed-tensors. No se ha confirmado soporte en llama.cpp u Ollama para este formato concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c3 | 8B (1.984.696.768 almacenados) | no disponible (base: 128k) | AWQ W4A16 | Llama 3.1 | HuggingFace, 19 descargas |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B | 128.000 tokens | FP16/BF16 | Llama 3.1 | HuggingFace, ampliamente usado |
| Otras configuraciones de la coleccion ICAIF '26 | 8B | no disponible | distintas (30 variantes) | Llama 3.1 | HuggingFace (coleccion jy395) |

La comparacion directa con alternativas cuantizadas de otros autores (por ejemplo, versiones GPTQ o AWQ genericas de Llama 3.1 8B) no esta disponible en la informacion proporcionada; la diferencia principal de esta ficha es la calibracion especifica en dominio financiero.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar el rendimiento respecto al modelo original, especialmente en tareas de razonamiento complejo y generacion de codigo; no se han publicado metricas que cuantifiquen esa perdida.
- La calibracion con C3-FinMix esta orientada a finanzas; en otros dominios el comportamiento puede diferir del modelo base sin que haya datos que lo confirmen.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion; en contexto financiero esto es especialmente critico y requiere verificacion humana.
- No se especifican los idiomas soportados en la ficha; se asume el comportamiento multilingue del Llama 3.1 original, pero sin garantias documentadas.
- Licencia Llama 3.1 Community License: el uso comercial esta permitido con condiciones (incluida la clausula de 700 millones de usuarios mensuales y la obligacion de atribucion "Built with Llama"); es necesario revisar el texto completo antes de desplegar en produccion.
- Modelo con muy poca traccion (19 descargas, 0 likes) y sin validacion comunitaria; conviene evaluar en el caso de uso concreto antes de adoptarlo.
- El numero de parametros almacenados (1.984.696.768) es coherente con pesos empaquetados a 4 bits, no con los 8.000 millones nominales; tenerlo en cuenta al estimar memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Repositorio del proyecto: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantizacion: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/awq_w4a16.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Paper (DOI): https://doi.org/10.1145/3858063.3858724
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
