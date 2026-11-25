# pranil00/ONIX-gemma-2-9b-it-GGUF

## Resumen

ONIX-gemma-2-9b-it-GGUF es una cuantización comunitaria del modelo google/gemma-2-9b-it, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". Se distribuye en formato GGUF con el esquema de cuantización Q5_K_M (5,5 bits por peso) y está pensada para ejecución local en hardware de consumo mediante runtimes como llama.cpp, Ollama o LM Studio. El modelo base es un transformer decoder-only de la familia Gemma 2 de Google, con 9.930 millones de parámetros (9.927.694.336 exactamente).

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto de conversión que reduce el peso de los pesos de 19,42 GB en FP16 a 6,67 GB, con una ratio de compresión declarada de 2,91x. El autor afirma una retención de calidad del 97,5 % respecto al baseline, aunque esa cifra procede de su propio informe de telemetría y no de una evaluación independiente con benchmarks estándar.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026. La model card incluye instrucciones de despliegue, una tabla de requisitos de memoria y un aviso de licencia. No se aportan datos sobre idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 9.927.694.336 (9,93 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens declarados como ventana optima en GPU y Apple Silicon; 4.096 tokens en CPU. La longitud maxima nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se listan otros niveles en el repo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada en el repo y en la model card) |
| Formato de pesos | GGUF (fichero google--gemma-2-9b-it-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion del modelo google/gemma-2-9b-it, por lo que hereda la arquitectura del modelo base: un transformer decoder-only de la familia Gemma 2 con 9,93 mil millones de parametros. La model card no detalla la composicion del dataset de entrenamiento original, el numero de tokens utilizados, ni si hubo fases de RLHF, DPO o similares; esa informacion corresponde a la documentacion de Google y no se reproduce aqui.

La innovacion tecnica de este repositorio es exclusivamente el proceso de cuantizacion: conversion a GGUF con esquema Q5_K_M mediante la herramienta run-any-model, un motor de optimizacion "device-adaptive" publicado en GitHub por el mismo autor. El informe de telemetria incluido en la model card reporta aceleracion de las 42 capas en Metal, un buffer de KV cache de 1176 MB en FP16 y una reduccion del 61,8 % en RAM residente total (de 20,63 GB a 7,89 GB). Estas cifras son autoinformadas y no han sido verificadas de forma independiente.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredadas del modelo base Gemma 2 9B instruct.
- Razonamiento y respuesta a instrucciones en formato chat (la model card define los tokens de parada `<|im_end|>` y `<|endoftext|>` propios de Gemma).
- Generacion de codigo y matematicas: capacidad esperable del modelo base, aunque no se aportan evaluaciones especificas en la informacion disponible.
- Ejecucion local multiplataforma: Apple Silicon (Metal), GPU NVIDIA (CUDA) y CPU x86 con AVX2/AVX-512.
- Integracion con runtimes estandar de GGUF: llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada para este artefacto.

## Casos de uso

- Asistente conversacional local en portatil: con 6,67 GB de pesos y un perfil de 7,89 GB de memoria unificada en Apple Silicon, el modelo cabe en un MacBook con 16 GB de RAM y permite mantener conversaciones multi-turno con 8.192 tokens de contexto sin conexion a internet.
- Prototipado de aplicaciones de IA en estaciones de trabajo con GPU de consumo: una RTX 3060 de 12 GB o superior puede cargar el modelo con aceleracion CUDA completa, lo que sirve para validar prompts y flujos antes de migrar a infraestructura cloud.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse integramente en local, el modelo es adecuado para autocompletar o explicar codigo en equipos donde no se permite enviar fragmentos de codigo a APIs externas.
- Redaccion y resumen de documentos ofimaticos: con 8.192 tokens de contexto se pueden procesar informes, actas o articulos de extension media en una sola pasada, integrado en LM Studio o Jan para uso de analistas no tecnicos.
- Educacion y experimentacion: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y talleres donde los alumnos ejecutan el modelo en sus propios equipos sin coste de API.
- Backend de bajo coste para demos y pruebas de integracion: desplegado con Ollama o llama.cpp en un servidor CPU con 10 GB de RAM libre, puede servir como endpoint compatible con la API de OpenAI para pruebas de integracion de aplicaciones.
- Evaluacion comparativa de cuantizaciones: util como referencia Q5_K_M para medir la perdida de calidad frente al modelo base en FP16 en tareas concretas del dominio propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un informe de telemetria interna de memoria y velocidad de ejecucion (no de calidad por tarea), con las siguientes cifras declaradas por el autor:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Variacion |
|---|---|---|---|
| Precision de bits | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 19,42 GB | 6,67 GB | -65,6 % |
| KV cache | 1176 MB (FP16) | 1176 MB (FP16) | Sin cambio |
| RAM residente total | 20,63 GB | 7,89 GB | -61,8 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |

La cifra de "97,5 % de retencion de calidad" es una estimacion del autor sin metodologia publicada ni verificacion externa; no debe interpretarse como resultado de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada en GPU: 8,17 GB dedicados para el modelo cuantizado con contexto de 8.192 tokens (cifra declarada por el autor).
- Memoria unificada en Apple Silicon: 7,89 GB, compatible con equipos de 16 GB de RAM unificada (M1/M2/M3/M4/M5).
- CPU: 9,89 GB de RAM libre con soporte AVX2 o AVX-512, contexto recomendado de 4.096 tokens.
- GPU recomendadas: cualquier GPU NVIDIA con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). Cabe en GPUs de consumo de gama media-alta.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model del autor.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-gemma-2-9b-it-GGUF (Q5_K_M) | 9,93 B | 8.192 tokens (optimo declarado) | GGUF | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-2-9b-it (original) | 9,93 B | Contexto nativo del modelo base (no detallado aqui) | Safetensors | Gemma Terms of Use | Hugging Face, oficial de Google |
| Otras cuantizaciones GGUF de gemma-2-9b-it (p. ej. de bartowski u otros) | 9,93 B | Depende del runtime | GGUF | Segun terminos del modelo base | Hugging Face, ampliamente descargadas |

No se dispone de datos de benchmarks para establecer una comparacion de rendimiento con alternativas. La diferencia principal frente al modelo original es el formato (GGUF cuantizado frente a safetensors en FP16) y la licencia declarada en este repo (Apache 2.0), que conviene contrastar con los terminos reales del modelo base de Google.

## Limitaciones y advertencias

- La licencia declarada en el repo es Apache 2.0, pero el modelo base google/gemma-2-9b-it se distribuye bajo los Gemma Terms of Use; existe una discrepancia que debe verificarse antes de un uso comercial, ya que la cuantizacion no puede relicenciar el modelo original.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente: no hay evidencia de comunidad, validacion ni mantenimiento.
- La cifra de retencion de calidad del 97,5 % es autoinformada y sin metodologia; no hay benchmarks independientes que la respalden.
- No se especifican los idiomas soportados en la informacion disponible; el modelo base Gemma 2 esta orientado principalmente al ingles, con soporte multilingue limitado.
- Riesgo de alucinacion inherente a los modelos de 9 B de parametros, especialmente en tareas factuales y de razonamiento largo.
- La cuantizacion Q5_K_M introduce perdida adicional de precision frente al FP16, que puede manifestarse en tareas sensibles como matematicas o generacion de codigo.
- El contexto optimo declarado (8.192 tokens en GPU) es inferior al contexto nativo del modelo base, por lo que no se aprovecha toda la ventana disponible.
- El KV cache no se cuantiza en este artefacto (1176 MB en FP16), lo que limita el ahorro de memoria en contextos largos.
- La model card incluye un descargo de responsabilidad absoluto que traslada toda la validacion de salidas al usuario final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-gemma-2-9b-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Organizacion ONIX: https://huggingface.co/ONIX
- Repositorio de la herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
