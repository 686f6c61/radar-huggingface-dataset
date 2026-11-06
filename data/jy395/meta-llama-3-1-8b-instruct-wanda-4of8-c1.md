# jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c1

## Resumen

Meta-Llama-3.1-8B-Instruct-wanda-4of8-c1 es un checkpoint comprimido derivado de meta-llama/Meta-Llama-3.1-8B-Instruct, publicado por el usuario jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones comprimidas que acompanan al articulo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26). La compresion aplicada es una poda semiestructurada Wanda 4:8, en la que se conservan 4 de cada 8 pesos por grupo y los pesos restantes se almacenan de forma densa (sin dispersión fisica), calibrada sobre WikiText-2 como corpus generico de referencia.

El modelo mantiene la arquitectura original de Llama 3.1 8B (transformer decoder-only denso, 8.030.261.248 parametros, contexto nativo de 128.000 tokens) y el mismo tokenizador, por lo que es compatible con el ecosistema estandar de Llama 3.1. Su interes reside en el estudio sistematico del efecto del corpus de calibracion en la compresion de modelos orientados a finanzas: esta variante concreta (C1, texto generico) sirve como linea base frente a configuraciones calibradas con datos financieros.

El checkpoint se distribuye en formato compressed-tensors y se carga directamente en vLLM o transformers. Su relevancia es principalmente experimental y de investigacion: permite reproducir los resultados del paper y evaluar el impacto de la poda 4:8 sobre diez tareas financieras, comparando calibracion generica frente a calibracion de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | Poda semiestructurada Wanda 4:8 (4 de cada 8 pesos, almacenamiento denso); no se documentan otros formatos |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base soporta 8 idiomas oficiales) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors con formato compressed-tensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3.1-8B-Instruct, un transformer decoder-only denso con atencion por grupos (GQA), RoPE y activacion SwiGLU, afinado por instrucciones por Meta. Sobre ese checkpoint se aplica una poda semiestructurada Wanda con patron 4:8: dentro de cada grupo de ocho pesos se conservan los cuatro de menor magnitud de activacion ponderada y se anulan los otros cuatro. Los pesos se almacenan de forma densa, de modo que el checkpoint no reduce el numero de parametros ni el tamano en disco de forma proporcional; la ganancia practica depende del soporte del runtime para patrones 2:4/4:8 en kernels dispersos.

La calibracion se realizo con el corpus C1 (WikiText-2, texto generico), consumiendo el corpus completo con 128 secuencias de 2048 tokens (262.144 tokens en total), semilla 42 y `max_seq_length=2048`, mediante el script `scripts/quantization/wanda_4of8.py` del repositorio del autor sobre la libreria llm-compressor. No se documenta entrenamiento adicional, RLHF ni DPO especifico para esta variante; las capacidades de instruccion y conversacion provienen integramente del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno en el estilo instruct de Llama 3.1.
- Razonamiento, matematicas y generacion de codigo heredados del modelo base, aunque potencialmente degradados por la poda 4:8.
- Soporte de tool calling y function calling segun el formato de Llama 3.1 Instruct (no verificado especificamente tras la compresion).
- Capacidad de agentes y razonamiento multi-paso, sujeta a la perdida de calidad introducida por la poda.
- Capacidades multilingues heredadas del modelo base (8 idiomas oficiales), no documentadas en la model card de esta variante.
- Orientacion declarada a tareas financieras por el corpus de evaluacion del paper, aunque el calibrado de esta configuracion es generico.
- Sin vision, audio ni modo thinking explicito (el modelo base no los incluye).

## Casos de uso

- Reproduccion de resultados del paper ICAIF '26: cargar el checkpoint en transformers o vLLM y ejecutar la suite de evaluacion de diez tareas financieras para comparar la calibracion generica (C1) con las variantes de dominio.
- Estudio de degradacion por poda: medir la caida de rendimiento frente al modelo base sin comprimir en tareas de razonamiento financiero, clasificacion y extraccion de entidades.
- Linea base en experimentos de compresion: usar esta configuracion como referencia "sin datos de dominio" al evaluar nuevas tecnicas de calibracion o de poda.
- Despliegue de bajo coste en entornos de investigacion: al ser compatible con vLLM y compressed-tensors, permite servir el modelo con kernels que explotan el patron 4:8 en GPUs Ampere o superiores.
- Generacion de texto financiero asistida: resumenes de informes, respuestas a preguntas sobre documentos y borradores de analisis, con la advertencia de validacion humana por el riesgo de alucinacion.
- Evaluacion comparativa de formatos de compresion: contrastar Wanda 4:8 frente a cuantizacion int8/int4 del mismo modelo base en terminos de calidad, latencia y memoria.
- Docencia y experimentacion: ejemplo practico de pipeline de poda con llm-compressor y compressed-tensors para cursos de eficiencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluacion del repositorio del autor (diez tareas financieras) y al articulo ICAIF '26, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de las tareas financieras para esta configuracion.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos de forma densa, el checkpoint ocupa aproximadamente el mismo espacio que el modelo base (unos 16 GB en bf16/fp16). En la practica, la ventaja de memoria solo se materializa si el runtime aplica kernels dispersos 4:8.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para servicio en produccion; RTX 4090 (24 GB) para inferencia en bf16 con margen ajustado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion adicional a 8 o 4 bits, en GPUs de 16 GB o menos.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`, y TGI si el runtime soporta el formato compressed-tensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del soporte efectivo de kernels 4:8 en el backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c1 | 8,03 B | 128.000 | Wanda 4:8, calibracion generica (WikiText-2) | Llama 3.1 Community | Hugging Face (jy395) |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Sin comprimir | Llama 3.1 Community | Hugging Face (Meta) |
| Variantes Wanda 4:8 calibradas con datos financieros (misma coleccion ICAIF '26) | 8,03 B | 128.000 | Wanda 4:8, calibracion de dominio | Llama 3.1 Community | Hugging Face (coleccion jy395) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La poda 4:8 introduce perdida de calidad respecto al modelo base; la magnitud no se documenta en la model card y debe medirse con la suite del autor.
- El corpus de calibracion es generico (WikiText-2), no financiero; el propio paper investiga cuando la calibracion de dominio es necesaria, por lo que esta variante puede rendir peor en tareas financieras que sus equivalentes calibradas con datos del sector.
- Riesgo de alucinacion inherente a los modelos de 8B, agravado por la compresion; no debe usarse sin validacion en decisiones financieras.
- Sesgos heredados del corpus de preentrenamiento de Llama 3.1, no auditados en esta variante.
- La licencia Llama 3.1 Community impone restricciones de uso (incluida la clausula de 700 millones de usuarios mensuales para licencia comercial adicional) y obliga a mantener la atribucion "Built with Llama".
- No se documentan idiomas soportados ni evaluaciones multilingues especificas para esta variante.
- El checkpoint no reduce el numero de parametros; la ganancia en memoria y velocidad depende del soporte de kernels dispersos en el runtime, que puede ser limitado o inexistente en algunos backends.
- Modelo de investigacion con 160 descargas y sin likes; no hay garantia de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c1
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Paper (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de codigo: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/wanda_4of8.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
