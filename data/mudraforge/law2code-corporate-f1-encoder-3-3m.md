# MudraForge/law2code-corporate-f1-encoder-3.3m

## Resumen

El MudraForge Corporate F1 Encoder es un codificador de lenguaje de dominio especifico orientado a texto estatutario y de finanzas corporativas, desarrollado por MudraForge como componente del proyecto law2code. Con 3.322.986 parametros (3,32 M) y una representacion de salida de 256 dimensiones, se trata de un modelo muy compacto disenado para tareas de parsing normativo y representacion de terminos salientes en el ambito fiscal, MSME (micro, pequenas y medianas empresas), reestructuracion y finanzas corporativas. No es un modelo generativo: su funcion es producir embeddings contextualizados de tokens.

El modelo se entrena con un objetivo de Salient Masked Language Modeling sobre un corpus propio de 26.674 documentos estatutarios y de finanzas corporativas (115 MB), con 1.056 terminos salientes reforzados. Su relevancia actual radica en que demuestra un enfoque de dominio muy especializado y de bajo coste computacional: un encoder de apenas 13,73 MB en ONNX que puede ejecutarse en CPU y que sirve como base para un sistema de conversion de normativa legal a codigo (law2code).

La ficha se basa exclusivamente en la informacion publicada en la model card del autor. No hay datos publicos de benchmarks externos, idiomas soportados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (codificador de representaciones de tokens); detalles internos de capas y atencion no disponibles |
| Parametros totales | 3.322.986 (3,32 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos PyTorch y ONNX en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch/stage0_backbone_mlm_v3.pt`, 20,3 MB) y ONNX opset 17 (`onnx/corporate_f1_encoder.onnx`, 13,73 MB) |

## Arquitectura y entrenamiento

El modelo es un codificador que recibe cinco entradas por token: IDs de vocabulario (`w_ids`), IDs de bytes UTF-8 por token (`c_mat`, 30 dimensiones), IDs de hash de subwords 4-gram (`sw_ids`, 4 dimensiones con 8.192 cubos), 36 caracteristicas de geometria de discurso y puntuacion (`g_feat`) y el indice de clausula (`c_idx`). La salida es una secuencia de estados ocultos de 256 dimensiones (`hidden_states`). Esta combinacion de senales a nivel de caracter, subword y estructura de clausula sugiere un diseno orientado a capturar morfologia y estructura normativa, aunque la model card no detalla el numero de capas, cabezas de atencion ni el mecanismo exacto.

El entrenamiento se realizo con Salient Masked Language Modeling durante 10.000 pasos sobre el corpus `corpus_mlm_v3_unified.jsonl` (26.674 documentos, 115 MB, 1.056 terminos salientes reforzados). Las metricas internas reportadas son: perdida MLM final 0,7991, perplejidad 2,22, precision top-1 del 79,90 % y top-5 del 93,44 %. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de representaciones contextualizadas de tokens de 256 dimensiones para texto legal y financiero.
- Parsing estatutario y extraccion de terminos salientes en textos de fiscalidad, MSME, reestructuracion y finanzas corporativas.
- Codificacion de estructura de clausulas mediante el indice `c_idx` y caracteristicas de puntuacion/discurso (`g_feat`).
- Procesamiento a nivel de byte y subword (hash de 4-gram), lo que permite manejar vocabulario fuera de lista y variantes morfologicas.
- Inferencia en CPU mediante el modelo ONNX exportado (diferencia maxima frente a ORT CPU de 2,15e-06).
- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Conversion de normativa a codigo (law2code): el encoder produce representaciones de clausulas y terminos que pueden alimentar un modulo posterior de traduccion de reglas legales a logica ejecutable, dado su entrenamiento especifico en estatutos.
- Extraccion de terminos salientes en contratos y estatutos: permite localizar y representar los 1.056 terminos reforzados del corpus para tareas de etiquetado y clasificacion.
- Clasificacion de clausulas corporativas: el indice de clausula (`c_idx`) y las caracteristicas de discurso permiten segmentar y clasificar secciones de documentos financieros.
- Busqueda semantica en corpus normativo: los embeddings de 256 dimensiones pueden indexarse para recuperacion de fragmentos legales relevantes en un motor de busqueda interno.
- Preprocesamiento en pipelines de compliance: el modelo puede servir como capa de representacion previa a un clasificador de riesgo o de obligaciones regulatorias en entornos de CPU.
- Despliegue en entornos con recursos limitados: con 13,73 MB en ONNX y ejecucion en CPU, es viable en servicios edge o contenedores sin GPU para procesar lotes de documentos.
- Etiquetado y anotacion asistida de corpus legales: las representaciones top-5 con 93,44 % de precision pueden apoyar tareas de pre-etiquetado en flujos de anotacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas por el autor son internas de entrenamiento:

| Metrica | Valor |
|---|---|
| Pasos de entrenamiento | 10.000 |
| Perdida MLM final | 0,7991 |
| Perplejidad (PPL) | 2,22 |
| Precision top-1 de token | 79,90 % |
| Precision top-5 de token | 93,44 % |
| Diferencia maxima ONNX vs ORT CPU | 2,15e-06 |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo pesa 20,3 MB en PyTorch y 13,73 MB en ONNX y esta pensado para ejecucion en CPU.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) puede alojarlo con holgura, aunque no es necesario.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo y ONNX Runtime (opset 17); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros encoders legales o financieros, y no se dispone de datos de rendimiento externos para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: entrenado exclusivamente en estatutos fiscales, MSME, reestructuracion y finanzas corporativas; su comportamiento fuera de ese dominio no esta documentado.
- No es generativo: no puede producir texto, responder preguntas ni ejecutar agentes; su uso esta limitado a representaciones y tareas derivadas.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero las representaciones pueden ser poco fiables en textos legales de otras jurisdicciones o idiomas.
- Idiomas soportados no declarados; se desconoce si el corpus es monolingue o multilingue.
- Longitud de contexto no disponible, lo que impide garantizar el procesamiento de documentos largos sin truncamiento.
- Ausencia de benchmarks externos y de validacion independiente: las metricas reportadas son internas de entrenamiento y no garantizan rendimiento en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo en el caso de uso concreto antes de desplegarlo.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MudraForge/law2code-corporate-f1-encoder-3.3m
- Dataset de entrenamiento: https://huggingface.co/datasets/MudraForge/law2code-corporate-f1-corpus
- Demo law2code (Space): https://huggingface.co/spaces/yamero999/law2code
