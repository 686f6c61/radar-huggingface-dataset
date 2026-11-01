# jy395/Qwen3-8B-wanda-4of8-c1

## Resumen

Qwen3-8B-wanda-4of8-c1 es una version comprimida del modelo Qwen/Qwen3-8B, publicada por el autor jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones comprimidas que acompanan al articulo academico "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", presentado en ICAIF '26. El modelo aplica una poda semi-estructurada Wanda 4:8 sobre los pesos del Qwen3-8B original, calibrada sobre el corpus C1 (WikiText-2, texto generico), con el objetivo de estudiar como afecta el corpus de calibracion al rendimiento de modelos financieros comprimidos.

La relevancia de esta ficha no esta en el modelo como producto final, sino como artefacto de investigacion reproducible: permite comparar el efecto de calibraciones genericas frente a calibraciones de dominio financiero sobre un mismo modelo base. El checkpoint conserva los 8.190.735.360 parametros del Qwen3-8B original, pero con una mascara de poda 4:8 aplicada (4 de cada 8 pesos puestos a cero en las matrices objetivo), almacenados en formato denso.

La arquitectura subyacente es la del Qwen3-8B: un transformer decoder-only de la familia Qwen3, con licencia Apache 2.0 y orientado a generacion de texto y conversacion. El modelo se distribuye en formato compressed-tensors, cargable directamente en vLLM o transformers, lo que facilita su uso en pipelines de evaluacion estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con poda semi-estructurada Wanda 4:8 aplicada |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantizacion | No es cuantizacion; es poda 4:8 con pesos almacenados en denso. El checkpoint esta en compressed-tensors |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only de 8.190 millones de parametros. Sobre el se aplica una poda semi-estructurada Wanda con patron 4:8: en cada grupo de 8 pesos se conservan 4 y se anulan 4, seleccionados segun la metrica de importancia de Wanda (producto de la magnitud del peso por la activacion). Los pesos podados se almacenan de forma densa (no dispersa), por lo que el checkpoint mantiene el mismo numero de parametros que el original, pero con aproximadamente la mitad de ellos a cero en las capas afectadas.

La calibracion se realizo con el corpus C1 (WikiText-2, texto generico), consumiendo 128 secuencias de 2048 tokens, es decir, 262.144 tokens en total, con semilla 42 y protocolo de consumo completo del corpus. El proceso se ejecuto mediante el script `wanda_4of8.py` del repositorio `finance-ptc-calibration`, usando la libreria llm-compressor. No se realizo un ajuste fino posterior a la poda (no se menciona recuperacion ni destilacion), por lo que el modelo conserva los pesos podados tal cual. El articulo asociado estudia precisamente cuando la calibracion con datos de dominio (financiero) mejora la recuperacion frente a calibracion generica, y esta configuracion (C1) sirve como referencia generica.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del Qwen3-8B base.
- Razonamiento y matematicas (capacidades del Qwen3-8B, potencialmente degradadas por la poda).
- Generacion de codigo (capacidad del modelo base, no verificada tras la compresion).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; el modelo base Qwen3 lo soporta, pero la poda puede afectar a este comportamiento.
- Capacidades de agente y razonamiento multi-paso: no verificadas tras la compresion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Orientacion a tareas financieras: el modelo forma parte de un suite de evaluacion con diez tareas financieras, aunque esta configuracion concreta usa calibracion generica.

## Casos de uso

- Investigacion sobre compresion de LLM: sirve como configuracion de referencia (calibracion generica C1) para comparar con las otras 29 configuraciones del suite y medir el impacto del corpus de calibracion en tareas financieras.
- Reproducibilidad academica: permite reproducir los resultados del articulo ICAIF '26 ejecutando el evaluation suite del repositorio `finance-ptc-calibration` sobre las diez tareas financieras definidas por los autores.
- Analisis de degradacion por poda: util para estudiar que capas y tareas del Qwen3-8B toleran mejor la poda 4:8 y cuales se degradan, comparando contra el modelo base sin comprimir.
- Despliegue con vLLM en entornos con restricciones de computo: al estar en formato compressed-tensors, se carga directamente en vLLM, lo que permite evaluar el ahorro de computo de la poda 4:8 frente al modelo denso original.
- Experimentos de calibracion con datos de dominio: sirve como punto de partida para repetir el proceso Wanda 4:8 con corpus financieros propios y comparar la recuperacion de rendimiento frente a esta configuracion generica.
- Docencia y formacion en tecnicas de compresion: ejemplo practico y reproducible de aplicacion de Wanda mediante llm-compressor sobre un modelo de 8B, con scripts publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al evaluation suite del repositorio `github.com/JunyiYe/finance-ptc-calibration` para reproducir la evaluacion en diez tareas financieras, pero no incluye cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (BF16/FP16): aproximadamente 16-17 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada con cuantizacion adicional (por ejemplo, GPTQ/AWQ a 4 bits sobre el checkpoint podado): aproximadamente 5-6 GB para pesos, aunque esta configuracion no se distribuye cuantizada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090 (24 GB) tambien es viable.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en BF16; en GPUs de 16 GB requeriria cuantizacion adicional.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`. No se confirma soporte en llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. La poda 4:8 con almacenamiento denso no reduce el numero de parametros almacenados ni, por si sola, el coste de inferencia en hardware estandar sin kernels especificos de sparsity.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Qwen3-8B-wanda-4of8-c1 | 8.190 M | No disponible | Poda Wanda 4:8, calibracion C1 (WikiText-2) | Apache 2.0 | HuggingFace, 212 descargas |
| Qwen/Qwen3-8B (base) | 8.190 M | No disponible en la informacion | Sin compresion | Apache 2.0 | HuggingFace, ampliamente usado |
| Otras configuraciones del suite ICAIF '26 | 8.190 M | No disponible | Wanda 4:8 con otros corpus de calibracion | Apache 2.0 | Coleccion en HuggingFace |

La comparativa principal es contra el modelo base Qwen3-8B (sin poda) y contra las otras 29 configuraciones del mismo suite, que varian el corpus de calibracion (generico frente a financiero) y posiblemente el esquema de compresion. No se dispone de datos de rendimiento para comparar numericamente en la informacion proporcionada.

## Limitaciones y advertencias

- La poda 4:8 sin recuperacion posterior degrada el rendimiento respecto al Qwen3-8B original; la magnitud de la degradacion no se cuantifica en la informacion disponible.
- Los pesos podados se almacenan en denso, por lo que no hay ahorro de memoria ni de computo en hardware estandar sin kernels de sparsity; el beneficio es principalmente academico y de investigacion.
- La calibracion con texto generico (WikiText-2) puede ser suboptima para tareas financieras, que es precisamente la hipotesis que estudia el articulo; no debe asumirse un rendimiento financiero equivalente al de configuraciones calibradas con datos de dominio.
- Riesgo de alucinacion: heredado del Qwen3-8B y potencialmente agravado por la poda; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Idiomas soportados: no disponibles; se asume la cobertura multilingue del Qwen3-8B, pero no esta confirmada tras la compresion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento del checkpoint comprimido en produccion.
- No se confirma soporte de tool calling ni de modo thinking tras la poda; conviene validarlo antes de usarlo en agentes.
- Modelo orientado a investigacion: no se recomienda su uso en produccion sin una evaluacion propia en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Qwen3-8B-wanda-4of8-c1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Articulo (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de codigo, corpus y evaluacion: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda Wanda 4:8: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/wanda_4of8.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa del suite ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Libreria llm-compressor: https://github.com/vllm-project/llm-compressor
