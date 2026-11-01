# fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int4-gs64-sym

## Resumen

Esta ficha describe una cuantizacion INT4 del modelo meta-llama/Llama-3.1-8B, publicada por el usuario fbaldassarri bajo el identificador `fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int4-gs64-sym`. No se trata de un modelo nuevo, sino de una version comprimida a 4 bits del Llama 3.1 8B de Meta, generada con el framework Intel AutoRound v0.16.0 y exportada en formato AutoGPTQ. El objetivo es reducir el peso en memoria y acelerar la inferencia (el autor afirma una mejora de 2-3x) manteniendo una precision cercana al modelo original en BF16.

La cuantizacion emplea cuantizacion simetrica de solo pesos (WoQ) con tamano de grupo 64, calibrada sobre 128 muestras de 512 tokens durante 200 iteraciones en CPU. El artefacto esta pensado explicitamente para inferencia en hardware Intel: CPU mediante intel-extension-for-pytorch, iGPU Arc y NPU (AI Boost de la serie Core Ultra) via OpenVINO, aunque al estar en formato AutoGPTQ tambien puede cargarse con bibliotecas compatibles en GPU.

Es relevante para desarrolladores que necesitan desplegar un modelo de 8B en entornos con VRAM limitada o en equipos Intel sin GPU dedicada, manteniendo el contexto nativo de 128K tokens de la familia Llama 3.1. La model card advierte que es un modelo base (no instruct) y que se distribuye unicamente con fines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizado a INT4 |
| Parametros totales | 8.030.000.000 aprox. (modelo base); el safetensors del repo declara 2.047.283.200 parametros empaquetados en INT4 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | INT4, group size 64, simetrica, WoQ, metodo GPTQ (AutoGPTQ) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (AutoGPTQ), compatible con transformers |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.1 8B, un transformer decoder-only denso con atencion por grupos (GQA) y RoPE, entrenado por Meta sobre billones de tokens y alineado con RLHF y DPO en su version instruct. Esta publicacion concreta no reentrena el modelo: aplica cuantizacion de solo pesos con el algoritmo GPTQ implementado en Intel AutoRound 0.16.0. La calibracion se realizo en CPU con `torch.bfloat16`, 128 muestras, `seqlen` 512, `batch_size` 4 y 200 iteraciones, con un tiempo total de cuantizacion registrado de 42.275,9 segundos (unas 11,7 horas).

La innovacion tecnica aqui es el propio flujo de AutoRound, que ajusta los pesos redondeados mediante optimizacion de escala y signo para minimizar la perdida de precision, y la exportacion a AutoGPTQ para su uso con kernels compatibles. El autor documenta un pipeline reproducible (`auto-round-pipeline`) con versiones fijadas de transformers (4.55.3) y torch (2.14.1+cpu), lo que permite regenerar el artefacto de forma determinista. No se aportan datos sobre el dataset de calibracion mas alla del numero de muestras.

## Capacidades

- Generacion de texto y completion de texto sin formato de chat: es un modelo base, no instruct, por lo que no sigue instrucciones de forma fiable sin ajuste previo.
- Razonamiento y conocimiento general heredados de Llama 3.1 8B en su version base.
- Generacion de codigo y matematicas basicas a nivel de modelo base (sin garantias de formato).
- Capacidades multilingues limitadas a los ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Contexto largo de hasta 128K tokens en el modelo original (no verificado en esta cuantizacion).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en esta model card.
- Inferencia optimizada en CPU Intel, iGPU Arc y NPU Core Ultra mediante intel-extension-for-pytorch y OpenVINO.

## Casos de uso

- Prototipado de completion de texto en equipos sin GPU: el modelo puede cargarse en CPU Intel con intel-extension-for-pytorch para experimentar con generacion de texto en portatiles o estaciones de trabajo sin acelerador dedicado.
- Despliegue en portatiles con Intel Core Ultra: gracias a la ruta OpenVINO para NPU (AI Boost), permite ejecutar un modelo de 8B en local con bajo consumo energetico para tareas de autocompletado o resumen.
- Base para fine-tuning ligero: al ser un modelo base cuantizado, puede servir como punto de partida para adaptaciones posteriores (si bien el fine-tuning sobre INT4 es limitado y requeriria LoRA o desquantizacion).
- Generacion de texto por lotes en servidores CPU: con el supuesto 2-3x de speedup, es adecuado para pipelines de procesamiento masivo de texto donde no hay GPUs disponibles.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la degradacion de calidad de W4G64 frente al BF16 original en tareas de perplexity o generacion.
- Reproducibilidad de pipelines de cuantizacion: sirve como artefacto de referencia para validar el flujo `auto-round-pipeline` y la receta documentada por el autor.
- Experimentacion multilingue en espanol e hindi: permite probar generacion en estos idiomas en hardware Intel de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma una mejora de velocidad de 2-3x y una "ligera caida de precision" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni perplexity.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 8,0 GB en safetensors; en inferencia INT4 el peso ronda los 4-5 GB, mas overhead de activaciones y cache KV, por lo que se estiman unos 6-8 GB para contextos moderados.
- GPU recomendadas: no especificadas por el autor; el foco esta en CPU Intel, iGPU Arc y NPU Core Ultra.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, aunque no esta verificado por el autor.
- Opciones de despliegue: transformers con AutoGPTQ, text-generation-inference (tag declarado), intel-extension-for-pytorch, OpenVINO. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: solo se indica un speedup de 2-3x frente al modelo sin cuantizar; no hay cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Llama 3.1 8B AutoGPTQ INT4) | 8B | 128K (heredado) | INT4 gs64 sim | Llama 3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B (original) | 8B | 128K | BF16 | Llama 3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | BF16 | Llama 3.1 | HuggingFace |
| Otras cuantizaciones GPTQ/AWQ de Llama 3.1 8B | 8B | 128K | INT4/INT8 | Llama 3.1 | HuggingFace |

No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene formato de chat de forma fiable; para uso conversacional requeriria la variante Instruct o fine-tuning.
- La model card declara explicitamente que se ha desarrollado solo con fines de investigacion y sin garantia.
- Riesgo de alucinacion inherente a un modelo de 8B sin alineacion instructiva.
- La cuantizacion INT4 gs64 introduce una caida de precision no cuantificada en la documentacion.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse antes de produccion.
- El soporte de contexto de 128K no esta verificado en esta cuantizacion y el uso de contextos muy largos incrementa la memoria de la cache KV.
- El modelo esta optimizado y validado para hardware Intel; su comportamiento en otras plataformas no esta documentado.
- El autor no proporciona evaluaciones de sesgo ni de seguridad.
- La fecha de creacion del repo (2026) y algunos campos de la model card presentan inconsistencias que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int4-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantizacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
