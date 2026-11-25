# Harsha001/LFM3-1.7B-Base-ROCmFPX

## Resumen

LFM3-1.7B-Base-ROCmFPX es una cuantizacion no oficial del modelo base LiquidAI/LFM3-1.7B-Base, publicada por el usuario Harsha001 (repositorio ROCmFPX). Se trata de un modelo de lenguaje de 1.728.801.742 parametros orientado a generacion de texto y fine-tuning, no a conversacion: al ser la variante *base* (sin ajuste conversacional), su uso previsto es la continuacion de texto y el entrenamiento posterior.

El valor diferencial de esta publicacion no esta en el modelo en si, sino en el formato de pesos: GGUF cuantizados con tipos de baja precision propios del fork ROCmFPX de llama.cpp, pensados para GPUs AMD (HIP/ROCm) y Vulkan, con especial atencion al silicio Strix Halo (gfx1151). Se ofrecen tres variantes (8 bits, 6 bits y 4 bits) con divergencia KL medida frente al BF16, lo que permite elegir el compromiso entre tamano, velocidad y fidelidad.

Es relevante ahora porque el ecosistema de inferencia en hardware AMD carece de alternativas tan optimizadas como las de NVIDIA, y propuestas como esta exploran tipos de peso de 4 y 6 bits con escalas por tensor. Conviene subrayar que los ficheros se validaron solo en CPU y no se han probado aun en hardware AMD real, y que requieren un fork especifico de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI LFM3; familia Liquid Foundation Model) |
| Parametros totales | 1.728.801.742 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFPX 8-bit (`Q8_0_ROCMFPX`), ROCmFPX 6-bit (`Q6_0_ROCMFPX`, recomendado), ROCmFP4-FAST 4-bit para Strix Halo con atencion y capa de salida en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` / `lfm1.0`) |
| Formato de pesos | GGUF (libreria `gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada; la model card del autor se centra exclusivamente en el proceso de cuantizacion y no detalla la topologia de la red ni los datos de entrenamiento de LiquidAI/LFM3-1.7B-Base. El modelo es la variante preentrenada sin ajuste conversacional, por lo que no ha recibido (o al menos no se documenta aqui) un post-entrenamiento orientado a dialogo.

El proceso de cuantizacion si esta documentado con precision: conversion a GGUF BF16 con el `convert_hf_to_gguf.py` del fork, generacion de una importance matrix (imatrix) a partir del fichero BF16 sobre el corpus de calibracion `calibration_datav3` en fragmentos de 512 tokens, y cuantizacion con `llama-quantize --imatrix`. El fichero de 6 bits se genero con `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que almacena una escala potencia de dos por tensor de pesos (aplicada en tiempo de ejecucion sin configuracion adicional) y usa `--token-embedding-type q6_K`. La innovacion tecnica es, por tanto, el tipo de peso de baja precision con escalas por tensor y kernels FP4 rapidos para Strix Halo.

## Capacidades

- Generacion de texto y continuacion de prompts (modelo base, sin plantilla de chat).
- Base para fine-tuning supervisado y para adaptaciones especificas de dominio.
- Inferencia en GPUs AMD mediante HIP/ROCm y en Vulkan a traves del fork ROCmFPX.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Capacidades conversacionales: no incluidas; el autor remite a LFM3-1.7B (variante con ajuste) para uso conversacional.
- Tool calling, agentes, vision, audio y modo thinking: no disponibles en esta variante.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Fine-tuning de dominio en hardware AMD: el modelo base de 1,7 mil millones de parametros sirve como punto de partida para ajustar tareas especificas (clasificacion, extraccion, redaccion) sobre GPUs AMD o equipos con Strix Halo, usando el fichero de 6 bits por su equilibrio entre calidad y tamano.
- Continuacion de texto en local: con 1,06-1,80 GB de pesos, se puede desplegar en equipos de gama consumer para autocompletado, generacion de borradores o completado de codigo mediante prompts de continuacion.
- Prototipado rapido en portatiles con GPU integrada AMD: el fichero de 4 bits ROCmFP4-FAST esta disenado para los kernels FP4 del fork en Strix Halo, lo que permite ejecutar el modelo en un APU sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion: los datos de divergencia KL y de coincidencia de token top frente a BF16 permiten usar estos ficheros como referencia para comparar recetas de cuantizacion (imatrix, escalas por tensor) en un modelo pequeno.
- Generacion de texto por lotes en CPU: los ficheros se validaron en CPU con llama.cpp del fork, por lo que sirven para pipelines de generacion offline donde no hay GPU disponible.
- Base para experimentos de investigacion en eficiencia: el tamano reducido y las tres precisiones publicadas facilitan estudios de degradacion de calidad frente a compresion y de rendimiento en Vulkan frente a HIP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta metricas de fidelidad de la cuantizacion frente al BF16, medidas sobre 40 fragmentos de 512 tokens del split de test de WikiText-2 en CPU:

| Fichero | Tamano | Pesos | Divergencia KL vs BF16 | Mismo token top que BF16 |
|---|---:|---|---:|---:|
| `Q8_0_ROCMFPX` | 1,80 GB | ROCmFPX 8-bit con escalas por tensor | 0,0007* | 98,7%* |
| `Q6_K_ROCMFPX` (recomendado) | 1,43 GB | ROCmFPX 6-bit con escalas por tensor | 0,0031 | 96,9% |
| `Q4_0_ROCMFP4_STRIX_O8` | 1,06 GB | ROCmFP4-FAST 4-bit, atencion y salida en 8 bits | 0,040* | 89,7%* |
| stock Q8_0 (referencia) | 1,85 GB | llama.cpp Q8_0 | 0,0006 | 98,7% |
| stock Q6_K (referencia) | 1,43 GB | llama.cpp Q6_K | 0,0039 | 96,6% |
| stock Q4_K_M (referencia) | 1,10 GB | llama.cpp Q4_K_M | 0,0267 | 92,0% |

\* Los ficheros de 8 y 4 bits se anadieron el 20 de noviembre de 2026 y sus cifras proceden de una ejecucion de octubre con recetas casi identicas; los ficheros nuevos pasaron una prueba corta de respuesta greedy y sus numeros definitivos sustituiran a estos. El fichero de 6 bits supera al Q6_K estandar con el mismo tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (4 bits), 1,5 GB (6 bits) y 1,9 GB (8 bits) solo para pesos, mas overhead de contexto y buffers de computo.
- GPU recomendadas: AMD con soporte HIP/ROCm, con compilacion dirigida a `gfx1151` (Strix Halo) o `gfx1100` (Radeon RX 7900); el fichero de 4 bits esta optimizado para los kernels FP4 de Strix Halo.
- Cabe en GPU consumer: si, por el tamano de los pesos; cualquier GPU con 4 GB o mas de memoria deberia alojarlos, aunque el rendimiento depende de los kernels del fork.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (binario `llama-completion`), compilado con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`. llama.cpp estandar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar los ficheros.
- Latencia y throughput: no disponibles. El autor indica que los ficheros se comprobaron en CPU y no se han probado en hardware AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-ROCmFPX (este) | 1,73 B | no disponible | GGUF ROCmFPX 4/6/8 bits | LFM Open License v1.0 | Requiere fork ROCmFPX; orientado a AMD y Vulkan |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | no disponible | safetensors (BF16) y GGUF estandar | LFM Open License v1.0 | Modelo original sin cuantizar; referencia de calidad |
| LiquidAI/LFM3-1.7B | no disponible | no disponible | no disponible | LFM Open License v1.0 | Variante con ajuste conversacional; recomendada por el autor para chat |
| stock llama.cpp Q6_K del mismo modelo | 1,73 B | no disponible | GGUF Q6_K | LFM Open License v1.0 | Referencia de cuantizacion estandar; KL 0,0039 frente a 0,0031 del ROCmFPX 6-bit |

## Limitaciones y advertencias

- No es un modelo conversacional: al ser la variante base, no incluye plantilla de chat ni ajuste para dialogo; para chat debe usarse LFM3-1.7B.
- Los ficheros no se han probado en hardware AMD: el autor indica que solo se validaron en CPU, por lo que el rendimiento y la estabilidad en GPU no estan verificados.
- Dependencia de un fork: llama.cpp estandar, LM Studio, Ollama y otras builds no cargan los ficheros ROCmFPX; se necesita compilar el fork desde el repositorio.
- El fichero de 4 bits diverge mas del BF16 que el Q4_K_M estandar (KL 0,040 frente a 0,0267), por lo que puede degradar la calidad; el autor recomienda 6 u 8 bits cuando la calidad prima.
- Las metricas de los ficheros de 8 y 4 bits son provisionales y proceden de una ejecucion anterior con recetas casi identicas.
- Licencia: LFM Open License v1.0 permite uso comercial solo a empresas con ingresos anuales inferiores a 10 millones de dolares; por encima de ese umbral no queda cubierto. Debe leerse el fichero `LICENSE`.
- No es una publicacion oficial de Liquid AI; la responsabilidad de la cuantizacion recae en el autor del repositorio.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo base pequeno, es esperable una fiabilidad limitada en tareas factuales.
- Idiomas soportados: no disponibles; no hay garantia de cobertura multilingue.
- Soporte de LFM3-Omni y LFM3-Audio pendiente de trabajo adicional en llama.cpp upstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/LFM3-1.7B-Base-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Repositorio del fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Licencia (LFM Open License v1.0): https://huggingface.co/Harsha001/LFM3-1.7B-Base-ROCmFPX/blob/main/LICENSE
