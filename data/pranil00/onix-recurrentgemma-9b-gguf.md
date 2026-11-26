# pranil00/ONIX-recurrentgemma-9b-GGUF

## Resumen

ONIX-recurrentgemma-9b-GGUF es una cuantizacion en formato GGUF del modelo google/recurrentgemma-9b, publicada por el usuario pranil00 bajo el paraguas de la denominada "ONIX Community". El artefacto consiste en un unico fichero con cuantizacion Q5_K_M (5,5 bits por peso) generado mediante la herramienta run-any-model, un motor de optimizacion de LLM adaptativo al dispositivo. El modelo base, RecurrentGemma-9b, es un modelo de Google basado en la familia Gemma con arquitectura hibrida recurrente, si bien la model card de esta publicacion no detalla las innovaciones arquitectonicas del original.

El interes practico de esta publicacion reside en la reduccion de requisitos de memoria: el fichero GGUF ocupa 6,67 GB frente a los 19,42 GB del modelo en FP16, lo que permite ejecutar un modelo de ~9,93 mil millones de parametros en hardware de consumo como Apple Silicon con 8 GB de memoria unificada o GPUs NVIDIA de la serie RTX 30/40/50 con 8 GB de VRAM. La model card reporta una retencion de calidad del 97,5 % respecto al baseline FP16, aunque no se aportan datos de benchmarks estandar que respalden esa cifra.

La publicacion tiene caracteristicas de un artefacto de comunidad con escasa validacion externa: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con una model card que mezcla afirmaciones de rendimiento con un descargo de responsabilidad extenso. Debe tratarse, por tanto, como una conversion utilitaria del modelo original y no como un modelo con evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia Gemma (modelo base google/recurrentgemma-9b); arquitectura detallada del original no disponible en la informacion proporcionada |
| Parametros totales | 9.927.694.336 (~9,93 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico fichero publicado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero google--recurrentgemma-9b-Q5_K_M.gguf, 6,67 GB) |

## Arquitectura y entrenamiento

El modelo base es google/recurrentgemma-9b, de la familia Gemma. La model card de esta publicacion cuantizada no describe la arquitectura interna del original (tipo de capas recurrentes, atencion, composicion del dataset de entrenamiento, numero de tokens, ni si hubo RLHF o DPO). Lo unico documentado es el proceso de cuantizacion: conversion a GGUF con esquema Q5_K_M, que reduce el peso de 19,42 GB en FP16 a 6,67 GB, con una ratio de compresion de 2,91x y una aceleracion de las 42 capas del modelo en el motor Metal segun el informe de auditoria incluido en la model card.

El artefacto incluye un buffer de KV cache de 1.176 MB en FP16, que se mantiene sin cuantizar. La model card afirma una retencion de calidad del 97,5 % ("cognitive fidelity retention") y una perdida de 2,5 % respecto al baseline, pero no especifica la metodologia de esa medicion ni los conjuntos de evaluacion empleados. No se aporta informacion sobre innovaciones tecnicas del modelo original como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation.
- Razonamiento y conversacion multi-turno: la model card incluye ejemplos de uso en modo chat (llama-cli con -cnv, Ollama con plantilla de parada <|im_end|> y <|endoftext|>).
- Ejecucion local en hardware de consumo: capacidad destacada del artefacto cuantizado, con soporte para Metal, CUDA y CPU con AVX2/AVX-512.
- Integracion con herramientas de inferencia local: llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Capacidades del modelo base (codigo, matematicas, multilingue, tool calling, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado local en portatiles Apple Silicon: con 7,89 GB de memoria unificada y contexto de 8.192 tokens, el modelo puede ejecutarse de forma nativa con aceleracion Metal en equipos M1/M2/M3/M4/M5, lo que permite iterar en desarrollo sin depender de APIs externas.
- Despliegue en estaciones de trabajo con GPU de consumo: con 8,17 GB de VRAM dedicada, cabe en tarjetas RTX 30/40/50 de gama media-alta, adecuado para asistentes de texto internos o pruebas de concepto de generacion aumentada por recuperacion.
- Chat de terminal para tareas de redaccion y resumen: el flujo documentado con run-any-model o llama-cli permite sesiones interactivas de chat con plantillas de parada definidas, util para resumen de documentos y borradores tecnicos.
- Inferencia en CPU en equipos sin GPU dedicada: con 9,89 GB de RAM libre y contexto de 4.096 tokens, el modelo puede ejecutarse en PCs Windows/Linux con soporte AVX2/AVX-512, por ejemplo para procesamiento por lotes de textos en entornos sin acelerador.
- Evaluacion comparativa de cuantizaciones: el artefacto sirve como referencia Q5_K_M para medir la degradacion de calidad frente al modelo FP16 en tareas propias, dado que la model card solo aporta una estimacion agregada del 97,5 %.
- Integracion en entornos de escritorio con LM Studio o Jan: al ser un unico fichero GGUF que se coloca en el directorio models/, facilita demos locales y pruebas de usabilidad sin infraestructura de servidor.
- Base para experimentacion con la familia RecurrentGemma: investigadores que quieran explorar el comportamiento del modelo original en hardware modesto pueden usar esta conversion como punto de partida, validando despues los resultados contra el modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye una matriz de auditoria de memoria y compresion:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 19,42 GB | 6,67 GB | -65,6 % |
| Buffer KV cache | 1.176 MB | 1.176 MB | Optimizado |
| RAM residente total | 20,63 GB | 7,89 GB | -61,8 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 42/42 capas | Optimo |

Estos datos proceden del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 7,89 GB de memoria unificada en Apple Silicon; 8,17 GB de VRAM dedicada en NVIDIA; 9,89 GB de RAM libre en CPU.
- GPU recomendadas: NVIDIA RTX 30/40/50 series con al menos 8 GB de VRAM; aceleracion Metal en Apple M1/M2/M3/M4/M5.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM; tambien en Apple Silicon con 8 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli con -ngl 99), Ollama (mediante Modelfile), run-any-model CLI, LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles. La model card no aporta tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-recurrentgemma-9b-GGUF (esta ficha) | ~9,93 B | 8.192 (GPU) / 4.096 (CPU) | Q5_K_M, 6,67 GB | Apache 2.0 | Hugging Face, 0 descargas |
| google/recurrentgemma-9b (original) | ~9,93 B | No disponible en la informacion | FP16, 19,42 GB | No disponible en la informacion | Hugging Face (modelo base) |
| Otras cuantizaciones GGUF de recurrentgemma-9b | ~9,93 B | Depende del esquema | Q4, Q8, etc. | Depende del publicador | No verificado en la informacion |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta cuantizacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones; la cifra de retencion del 97,5 % es una estimacion del autor sin metodologia documentada.
- Validacion externa nula: el repositorio registra cero descargas y cero likes, y la model card contiene afirmaciones de rendimiento no verificadas de forma independiente.
- Idiomas no declarados: la ficha no especifica que idiomas soporta el modelo, lo que impide garantizar calidad en castellano u otras lenguas.
- Riesgo de alucinacion: inherente a los modelos generativos; la model card no incluye evaluaciones de factualidad ni de tasas de alucinacion.
- Sesgos: no se documentan sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Restricciones de licencia: se declara Apache 2.0, pero la model card menciona tambien "Apache 2.0 / MIT" de forma ambigua; conviene verificar la licencia del modelo base google/recurrentgemma-9b antes de uso comercial.
- Descargo de responsabilidad amplio: el autor declina toda responsabilidad sobre los outputs, lo que traslada al implementador la carga completa de auditoria y validacion.
- Limitacion de contexto en CPU: el contexto se reduce a 4.096 tokens en ejecucion sobre CPU, la mitad que en GPU.
- Artefacto de comunidad: no es una publicacion oficial de Google ni del equipo de Gemma; la calidad de la conversion depende del pipeline run-any-model.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-recurrentgemma-9b-GGUF
- Modelo base: https://huggingface.co/google/recurrentgemma-9b
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
