# HarimxChoi/WarpQuant-Qwen3.8-27B-R16E4H4-Text

## Resumen

WarpQuant-Qwen3.8-27B-R16E4H4-Text es un checkpoint de solo texto derivado del modelo Qwen/Qwen3.8-27B, producido mediante la técnica de cuantización post-entrenamiento WarpQuant desarrollada por Harim Choi. El objetivo es reducir drásticamente el peso del modelo (hasta 3,6165 bits por peso analítico) manteniendo un rendimiento cercano al original, lo que permite desplegar un LLM de 27B en entornos con recursos de memoria limitados.

La técnica WarpQuant combina una rotación de Hadamard con signo, cuantización de grupo de 3 bits en 400 tensores de proyección, y una recuperación selectiva de columnas débiles basada en la sensibilidad Output-Fisher. El token embedding y la cabeza de salida se cuantizan en INT4 agrupado. El modelo resultante tiene 26.895.998.464 parámetros de texto y un payload analítico de 11,32 GiB, aunque el repositorio almacena los tensores reconstruidos en BF16 para permitir la evaluación directa con Transformers.

Este modelo es relevante porque demuestra que es posible comprimir un LLM de 27B a menos de 4 bits por peso sin una degradación catastrófica, abriendo la puerta a inferencia en GPUs de consumo o incluso en CPU. Está licenciado bajo Apache 2.0 y soporta inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en Qwen3.8-27B, solo texto) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | WarpQuant R16E4H4 (3,6165 bpw analitico); se comparan Q4_K_M e IQ3_S en la evaluacion, pero el checkpoint se distribuye en BF16 reconstruido |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tensores reconstruidos en BF16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un LLM de propósito general desarrollado por Alibaba Cloud, del que no se proporcionan detalles de entrenamiento en esta ficha. Sobre él, WarpQuant aplica una cuantización post-entrenamiento que consta de tres componentes principales:

- Rotación de Hadamard con signo sobre 400 tensores de proyección, que reduce la varianza de los pesos y mejora la robustez a la cuantización.
- Cuantización de grupo de 3 bits con tamaño de grupo/tile de 128/128.
- Un presupuesto de recuperación de columnas débiles de 0,05 bpw, seleccionado mediante una puntuación Output-Fisher en las coordenadas de activación originales.

El token embedding y la cabeza de salida se cuantizan en INT4 agrupado. La calibración se realizó con 512 secuencias de 512 tokens. El checkpoint distribuido contiene los tensores reconstruidos en BF16 para permitir la carga directa con Transformers, por lo que el tamaño físico del repositorio (53,8 GB) es mayor que el payload analítico empaquetado (11,32 GiB). No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores a la cuantización.

## Capacidades

- Generación de texto en inglés y coreano, con soporte de chat mediante la plantilla de chat de Qwen3.8.
- Razonamiento y resolución de problemas matemáticos, como se refleja en los benchmarks de GSM8K y ARC.
- Comprensión de lenguaje general y sentido común (HellaSwag, WinoGrande, PIQA).
- Capacidad de procesamiento de texto únicamente; no incluye torre de visión ni capa MTP (multi-token prediction).
- Compatible con el ecosistema Transformers, lo que permite su uso en pipelines estándar de generación de texto.

## Casos de uso

- Asistentes conversacionales en inglés y coreano: el modelo puede gestionar diálogos multi-turno gracias a su naturaleza de chat, y su bajo peso permite ejecutarlo en servidores con una sola GPU de gama media.
- Generación de contenido escrito: redacción de artículos, correos electrónicos o documentación técnica en los dos idiomas soportados, con un coste de inferencia reducido.
- Traducción automática entre inglés y coreano: al estar entrenado en ambos idiomas, puede utilizarse como motor de traducción de frases o párrafos, aunque no se han publicado métricas específicas de traducción.
- Análisis de sentimiento y clasificación de texto: su capacidad de comprensión del lenguaje permite etiquetar opiniones o categorizar documentos, con la ventaja de un footprint de memoria pequeño.
- Generación de código: aunque no se han publicado benchmarks de HumanEval, al ser un derivado de Qwen3.8-27B, que sí tiene capacidades de código, puede emplearse para autocompletar o explicar fragmentos de código en entornos con restricciones de VRAM.
- Prototipado rápido en investigación: al ser un checkpoint de solo texto con licencia Apache 2.0, es adecuado para experimentos de cuantización, evaluación de robustez o pruebas de técnicas de compresión sin necesidad de un clúster de GPUs.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa entre el modelo base en BF16, dos cuantizaciones GGUF (Q4_K_M e IQ3_S) y WarpQuant R16E4H4. Las métricas son propias del autor y se obtuvieron con los mismos prompts y conjuntos de evaluación.

| Formato | Text bpw | Payload | WT2 PPL ↓ | ARC-299 ↑ | MMLU-13,943 ↑ | Commonsense ↑ | GSM8K-500 flex ↑ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| BF16 | 16.00 | 50.11 GiB | 6.9548 | 52.17 | 43.07 | 79.23 | 70.40 |
| Q4_K_M | 4.92 | 15.41 GiB | 6.9656 | 50.84 | 42.90 | 79.23 | 75.20 |
| IQ3_S | 3.6940 | 11.57 GiB | 7.1820 | 52.17 | 42.97 | 78.83 | 59.40 |
| WarpQuant R16E4H4 | 3.6165 | 11.32 GiB | 7.4737 | 56.86 | 42.72 | 78.83 | 61.00 |

WarpQuant consigue una mejora notable en ARC-299 (56,86 frente a 52,17 del BF16), aunque la perplejidad en WikiText-2 es ligeramente peor (7,47 frente a 6,95). En MMLU y Commonsense se mantiene prácticamente a la par, mientras que en GSM8K pierde algo de precisión respecto a Q4_K_M pero supera a IQ3_S.

## Requisitos de hardware

- El repositorio contiene pesos en BF16 (53,8 GB), por lo que la carga directa requiere aproximadamente 54 GB de VRAM, lo que apunta a GPUs como A100 80GB o H100.
- El payload analítico empaquetado es de 11,32 GiB, lo que sugiere que una versión con los pesos realmente cuantizados podría caber en GPUs de 16 GB (por ejemplo, RTX 4080 o RTX 4090), pero no se proporcionan archivos GGUF ni instrucciones de empaquetado en la model card.
- No se especifican GPUs recomendadas ni opciones de despliegue alternativas (vLLM, llama.cpp, etc.). El uso documentado es mediante Transformers con `device_map="auto"`.
- No se ofrecen datos de latencia ni throughput.

## Comparativa con modelos similares

La comparación más directa es con el propio modelo base en BF16 y con otras cuantizaciones de la misma familia, como se muestra en la tabla de benchmarks. Frente a Q4_K_M (4,92 bpw) e IQ3_S (3,69 bpw), WarpQuant ofrece un payload ligeramente menor (3,62 bpw) con un rendimiento comparable en la mayoría de métricas, e incluso superior en ARC-299. Sin embargo, la perplejidad en WikiText-2 es peor que ambas alternativas.

No se dispone de comparaciones con otros modelos de 27B de la misma categoría (por ejemplo, Llama-3-27B o Mistral-27B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3,6 bpw es agresiva y puede degradar la calidad en tareas que requieren precisión numérica o razonamiento largo, como se observa en la perplejidad de WikiText-2 (7,47 frente a 6,95 del BF16).
- El modelo es exclusivamente de texto; no incluye capacidades de visión ni la capa MTP del modelo original.
- Solo soporta inglés y coreano; no se garantiza un rendimiento adecuado en otros idiomas.
- El repositorio almacena los pesos reconstruidos en BF16, no el formato empaquetado, por lo que el tamaño real en disco (53,8 GB) no refleja el ahorro analítico. Para aprovechar la compresión sería necesario empaquetar los tensores, lo que no está documentado.
- No se han publicado análisis de sesgos, alucinaciones o riesgos de seguridad específicos de esta cuantización. Al derivar de Qwen3.8-27B, puede heredar sesgos presentes en el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3.8-27B, que pueden tener restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HarimxChoi/WarpQuant-Qwen3.8-27B-R16E4H4-Text
- Informe técnico: https://harimxchoi.github.io/projects/warpquant
- Código fuente: https://github.com/HarimxChoi/WarpQuant
- Modelo multimodal (con visión y MTP): https://huggingface.co/HarimxChoi/WarpQuant-Qwen3.8-27B-R16E4H4
