# snxtyle/chitrapathak_marguj_mixed_v2

## Resumen

`chitrapathak_marguj_mixed_v2` es un adaptador LoRA de tipo PEFT sobre el modelo multimodal `krutrim-ai-labs/Chitrapathak-2`, desarrollado por el usuario `snxtyle`. Su proposito es especializar al modelo base en tareas de OCR y reconstruccion de estructura de tablas en HTML para marathi y gujarati, dos idiomas indicos con recursos limitados en el ecosistema de modelos abiertos. El adaptador es una continuacion del adaptador previo `snxtyle/chitrapathak_marguj_mixed`, no un entrenamiento desde cero.

El adaptador se entrena sobre un dataset unificado denominado `lighton_marguj_unified_v3`, con una mezcla aproximada de 50% tablas en ingles (LightOn), 30% tablas y contenido mixto indico y 20% OCR indico normal. La configuracion LoRA usa r=32, alpha=64 y dropout=0.05, con 2 epocas, learning rate 5e-6, batch 1 y acumulacion de gradiente 8, a una resolucion maxima de imagen de 1280 px.

El modelo es relevante para pipelines de digitalizacion documental en lenguas indicas, donde la mayoria de los OCR disponibles rinden mal en escrituras como devanagari (marathi) y gujarati, y donde la preservacion de la estructura tabular es critica para tareas downstream como extraccion de datos financieros o administrativos. Su licencia no esta declarada en la informacion disponible, lo que constituye un riesgo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (PEFT) sobre modelo base multimodal image-text-to-text `krutrim-ai-labs/Chitrapathak-2` |
| Parametros totales | no disponible (adaptador LoRA con r=32; el modelo base no especifica parametros en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | marathi (mr), gujarati (gu), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA); el modelo base se carga por separado |
| Tamano del repo | 0,2 GB |
| Libreria | peft |
| Pipeline | image-text-to-text |
| Configuracion LoRA | r=32, alpha=64, dropout=0.05 |
| Resolucion maxima de imagen | 1280 px (lado maximo) |
| Dataset de entrenamiento | `lighton_marguj_unified_v3` (50% tablas ingles, 30% tablas/mixto indico, 20% OCR indico normal) |
| Epocas | 2 |
| Learning rate | 5e-6 |
| Batch / grad accum | 1 / 8 |
| Seed | 3407 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `krutrim-ai-labs/Chitrapathak-2`, un modelo multimodal de tipo image-text-to-text del que no se detallan en la informacion disponible ni la arquitectura interna (transformer, vision encoder, etc.), ni el numero de parametros, ni la longitud de contexto. El adaptador en si es un LoRA PEFT con rango 32, alpha 64 y dropout 0.05, inicializado a partir del adaptador previo `snxtyle/chitrapathak_marguj_mixed` y continuado con un segundo ciclo de entrenamiento.

El entrenamiento se realizo durante 2 epocas con learning rate 5e-6, batch size 1, acumulacion de gradiente 8, seed 3407 y resolucion maxima de imagen de 1280 px. El dataset `lighton_marguj_unified_v3` combina tablas en ingles del corpus LightOn (aproximadamente 50%), tablas y contenido mixto indico (aproximadamente 30%) y OCR indico normal (aproximadamente 20%). No se especifica el numero total de tokens ni de muestras, ni si hubo etapas de RLHF o DPO. La innovacion principal declarada es la mejora en deteccion de tablas HTML y tasa de tablas completas respecto al adaptador v1.

## Capacidades

- OCR de texto impreso en marathi (devanagari) y gujarati, con soporte adicional de ingles.
- Reconstruccion de estructura de tablas en HTML a partir de imagenes de documentos.
- Deteccion y delimitacion de tablas dentro de la pagina (table detection).
- Generacion de tablas HTML completas (complete-table rate), segun el autor con mejora respecto a la version v1.
- Procesamiento image-text-to-text: recibe imagen y prompt de texto, devuelve texto estructurado.
- Capacidad multilingue limitada a mr, gu y en.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documenta soporte de audio ni de video.

## Casos de uso

- Digitalizacion de tablas administrativas en marathi: el adaptador convierte imagenes de formularios y registros en tablas HTML, lo que permite posteriormente parsear a CSV o JSON para bases de datos. Es adecuado porque el entrenamiento incluye tablas indicas y el prompt canonico de entrenamiento esta orientado a estructura HTML.
- Extraccion de datos financieros en gujarati: balances y estados de cuenta escaneados pueden procesarse para obtener filas y columnas estructuradas, reduciendo el trabajo manual de transcripcion en auditorias y contabilidad.
- Pipeline de OCR para archivos historicos indicos: digitalizacion de prensa y documentos con escritura devanagari o gujarati, usando el modelo como primer paso antes de correccion humana.
- Enriquecimiento de repositorios documentales: conversion masiva de PDFs escaneados a HTML tabular para indexacion y busqueda semantica en sistemas de gestion documental.
- Preprocesamiento para RAG sobre documentos indicos: las tablas extraidas en HTML pueden fragmentarse y embeberse para responder preguntas sobre datos tabulares en marathi o gujarati.
- Validacion de calidad en digitalizacion: uso del modelo como extractor de referencia para comparar con OCR comerciales en proyectos de migracion documental en India.
- Procesamiento de documentos mixtos ingles-indico: gracias a la mezcla del dataset (50% tablas inglesas), puede manejar documentos bilingues frecuentes en contextos administrativos indios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara cualitativamente una "fuerte mejora en deteccion de tablas HTML y tasa de tablas completas" frente a `chitrapathak_marguj_mixed`, sin cifras concretas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas OCR como CER/WER o TEDS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador LoRA ocupa 0,2 GB en disco y se suma al peso del modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada; al ser un modelo multimodal con procesamiento de imagen a 1280 px, se requiere una GPU con memoria suficiente para el modelo base completo (no cuantificado en la documentacion).
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base `Chitrapathak-2`, cuyos requisitos no se detallan.
- Opciones de despliegue: carga mediante `peft.PeftModel` y `transformers.AutoModelForImageTextToText`; no se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.
- Nota de serving: el autor indica servir con el prompt canonico de entrenamiento, sin system message, sin penalizacion de repeticion y con lado maximo de imagen 1280.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `snxtyle/chitrapathak_marguj_mixed_v2` | LoRA sobre Chitrapathak-2 | mr, gu, en | no disponible | no disponible | Hugging Face (0 descargas) |
| `snxtyle/chitrapathak_marguj_mixed` (v1) | LoRA sobre Chitrapathak-2 | mr, gu, en | no disponible | no disponible | Hugging Face |
| `krutrim-ai-labs/Chitrapathak-2` | Modelo base multimodal | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de informacion suficiente para comparar con OCR especializados alternativos (por ejemplo, modelos dedicados a devanagari o gujarati) en parametros, contexto o rendimiento. Los datos de benchmarks de la v1 y del modelo base no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Regresion leve declarada por el autor en OCR normal de marathi puro; recomienda mantener la v1 como rollback para SLAs de prosa sin tablas.
- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribucion; verificar antes de produccion.
- Modelo con 0 descargas y 0 likes en Hugging Face: sin validacion comunitaria ni evidencia externa de calidad.
- Entrenado solo con 2 epocas y learning rate muy bajo (5e-6): el alcance de la mejora esta acotado al dataset `lighton_marguj_unified_v3`.
- Idiomas limitados a mr, gu y en; no cubre otras lenguas indicas ni escrituras no relacionadas.
- Riesgo de alucinacion en la generacion de estructura HTML: puede inventar filas, columnas o celdas en tablas incompletas o de baja calidad.
- Requiere prompt canonico de entrenamiento, sin system message y sin penalizacion de repeticion; desviarse puede degradar la salida.
- Resolucion limitada a 1280 px de lado maximo; documentos de alta resolucion deben redimensionarse, con posible perdida de detalle en texto pequeno.
- Dependencia total del modelo base `Chitrapathak-2`: sus limitaciones (contexto, sesgos, licencia) se heredan.
- No se documentan sesgos especificos, pero al entrenar sobre corpus LightOn y datos indicos mixtos puede reflejar sesgos de esos datasets.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/snxtyle/chitrapathak_marguj_mixed_v2
- Adaptador previo v1: https://huggingface.co/snxtyle/chitrapathak_marguj_mixed
- Modelo base: https://huggingface.co/krutrim-ai-labs/Chitrapathak-2
