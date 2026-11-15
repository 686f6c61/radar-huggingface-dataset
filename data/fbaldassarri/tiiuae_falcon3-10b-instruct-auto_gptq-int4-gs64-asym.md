# fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int4-gs64-asym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int4-gs64-asym`, una cuantizacion de weights-only (WoQ) del modelo instructivo `tiiuae/Falcon3-10B-Instruct` de TII (Technology Innovation Institute). El artefacto lo publica el usuario fbaldassarri y aplica el algoritmo GPTQ mediante el framework Intel AutoRound v0.16.1, con precision INT4, tamano de grupo 64 y cuantizacion asimetrica (`sym=false`).

El objetivo es reducir el peso en memoria y acelerar la inferencia entre 2 y 3 veces respecto al modelo original en bf16, a cambio de una ligera perdida de precision. La model card indica que la cuantizacion se ha orientado a ejecucion en CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch y NPU Intel (AI Boost en Core Ultra) mediante OpenVINO.

Un dato relevante y potencialmente problematico: el campo `safetensors` del repo declara 2.161.720.320 parametros, muy por debajo de los 10B que sugiere el nombre del modelo base. Esta discrepancia debe verificarse antes de usar el artefacto en produccion, ya que podria indicar un empaquetado incompleto o una cuantizacion parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); `model_type: llama` segun la model card |
| Parametros totales | 2.161.720.320 segun safetensors del repo (el nombre del modelo base indica 10B; discrepancia no resuelta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 GPTQ (AutoGPTQ), group size 64, asimetrica; calibracion en bf16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es Falcon3-10B-Instruct de TII, un transformer causal de tipo decoder-only. La model card del artefacto cuantizado no detalla la arquitectura interna del modelo original (numero de capas, dimensiones, atencion, etc.), por lo que esos datos no estan disponibles en la informacion proporcionada.

El proceso de cuantizacion usa Intel AutoRound v0.16.1 con el algoritmo GPTQ en modalidad weights-only. La calibracion se ejecuto en CPU con `torch.bfloat16`, 128 muestras, 200 iteraciones de tuning, longitud de secuencia 512 y batch size 4. La duracion registrada fue de 52.008,5 segundos (866,8 minutos). El entorno de ejecucion fue transformers 4.55.3 y torch 2.15.0+cpu. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF/DPO.

## Capacidades

- Generacion de texto conversacional en ingles mediante plantilla de chat integrada (`apply_chat_template`).
- Modelo de tipo instruct/chat: disenado para seguir instrucciones, no para completar texto crudo.
- Inferencia optimizada para CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel Core Ultra (via OpenVINO).
- Compatible con el ecosistema transformers y text-generation-inference.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio, thinking mode ni multilingues mas alla del ingles.

## Casos de uso

- Despliegue en equipos sin GPU dedicada: al estar cuantizado a INT4 y orientado a CPU Intel, permite ejecutar un modelo instructivo de gran tamano en portatiles y estaciones de trabajo convencionales.
- Inferencia en Intel NPU (Core Ultra): el artefacto esta preparado para OpenVINO, lo que facilita asistentes locales de bajo consumo en portatiles con AI Boost.
- Prototipado de chatbots en ingles: la plantilla de chat integrada permite montar rapidamente un asistente conversacional con transformers.
- Aplicaciones de borde con iGPU Arc: el soporte de intel-extension-for-pytorch posibilita ejecutar el modelo en graficas integradas Intel Arc sin GPU discreta.
- Evaluacion comparativa de cuantizaciones: sirve como artefacto de referencia para medir la perdida de precision de W4G64 asimetrico frente al modelo en bf16.
- Reproducibilidad de pipelines de cuantizacion: la model card incluye receta completa (auto-round-pipeline, versiones, hiperparametros) para replicar el proceso en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una aceleracion estimada de 2-3 veces y una ligera perdida de precision en W4G64, sin cifras concretas.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 8,4 GB, coherente con pesos INT4; se recomienda al menos 10-12 GB de memoria libre para margen de activaciones y KV cache.
- GPU recomendadas: no especificadas en la informacion disponible. El artefacto esta orientado a CPU Intel, iGPU Intel Arc y NPU Intel Core Ultra.
- Cabe en GPU consumer: no confirmado; el foco declarado es hardware Intel (CPU/iGPU/NPU), no CUDA.
- Opciones de despliegue: transformers, text-generation-inference, intel-extension-for-pytorch (iGPU Arc), OpenVINO (NPU). No se menciona soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; solo la estimacion generica de 2-3x de speedup frente al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int4-gs64-asym | 2,16B declarados (base 10B) | no disponible | INT4 GPTQ gs64 asim | Apache 2.0 | Hugging Face |
| tiiuae/Falcon3-10B-Instruct | 10B | no disponible | bf16 (original) | Apache 2.0 | Hugging Face |
| Otras cuantizaciones INT4 de Falcon3-10B-Instruct | 10B (nominal) | no disponible | INT4 (varios formatos) | Apache 2.0 | no disponible en la informacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Discrepancia de parametros: safetensors declara 2,16B frente a los 10B del modelo base; verificar integridad del repo antes de usar en produccion.
- Perdida de precision: la propia model card reconoce una ligera caida de accuracy en W4G64 frente al modelo en bf16.
- Solo ingles: el campo `language` indica exclusivamente `en`.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas estandar.
- Orientado a hardware Intel: el rendimiento declarado (2-3x) se refiere a CPU/iGPU/NPU Intel; en CUDA el comportamiento no esta documentado.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero la model card declara que el artefacto se desarrollo "solo para fines de investigacion" y sin garantia, lo que genera cierta ambiguedad.
- Contexto: no se especifica la longitud de contexto soportada.

## Enlaces

- Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Intel AutoRound: https://github.com/intel/auto-round
- auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
