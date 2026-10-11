# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int4-gs64-asym

## Resumen

Este repositorio contiene una version cuantizada a INT4 del modelo `sapienzanlp/Minerva-7B-base-v1.0`, publicado por el usuario fbaldassarri. Se trata de una cuantizacion de solo pesos (weights-only quantization, WoQ) que aplica el algoritmo GPTQ mediante el framework Intel AutoRound v0.15.1, dando como resultado un artefacto de 4 bits con group size 64 y cuantizacion asimetrica. El modelo base es Minerva 7B base v1.0, un modelo de lenguaje causal desarrollado por SapienzaNLP, orientado principalmente al italiano y con soporte de ingles.

El objetivo de esta version es reducir el coste de memoria y aumentar la velocidad de inferencia (el autor declara una mejora de 2-3X) manteniendo una perdida de precision leve en la configuracion W4G64. El artefacto esta especificamente preparado para ejecutarse en hardware Intel: CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch, y NPU Intel (AI Boost en la serie Core Ultra) a traves de OpenVINO.

Es relevante porque permite desplegar un modelo de 7B en entornos de recursos limitados y en hardware Intel de consumo, con licencia Apache 2.0 y pesos en formato GPTQ para transformers. Al ser una version base (no instruct), esta pensada para tareas de continuacion de texto y como punto de partida para ajuste fino, no para dialogo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer causal, decoder-only) |
| Parametros totales | 1.416.040.448 segun safetensors del repo cuantizado (el nombre del modelo base indica 7B; discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 GPTQ (AutoGPTQ), group size 64, asimetrica (sym=false) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ / AutoGPTQ) |

## Arquitectura y entrenamiento

El modelo base `sapienzanlp/Minerva-7B-base-v1.0` emplea una arquitectura Mistral, es decir, un transformer causal decoder-only, segun el campo `model_type: mistral` declarado en la model card. Es un modelo base (o de completado), no ajustado por instrucciones: la propia tarjeta lo describe como "base / completion model" que debe recibir prompts de texto en crudo. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada; habria que consultar la model card original de SapienzaNLP.

La innovacion tecnica de este repositorio reside en la cuantizacion. Se aplico el algoritmo GPTQ a traves de Intel AutoRound v0.15.1, con 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4, sobre `torch.bfloat16` y en dispositivo CPU. El proceso completo de cuantizacion duro 41.003 segundos (683,4 minutos) y finalizo el 22 de septiembre de 2026. Las condiciones exactas de ejecucion estan documentadas (transformers 4.55.3, torch 2.14.0+cpu). El resultado es un artefacto INT4 optimizado para inferencia en CPU, iGPU Arc y NPU Intel.

## Capacidades

- Generacion de texto y continuacion de secuencias a partir de prompts en crudo (modelo de completado).
- Generacion causal de lenguaje en italiano e ingles.
- Uso como modelo base para ajuste fino posterior (fine-tuning, LoRA, etc.).
- Inferencia en hardware Intel: CPU, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost en Core Ultra (OpenVINO).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento (thinking).
- No dispone de capacidades multimodales (vision, audio) segun la informacion disponible.
- No es un modelo instruct, por lo que carece de alineacion por instrucciones declarada.

## Casos de uso

- Continuacion de texto en italiano: dado que Minerva esta orientado al italiano, puede emplearse para autocompletar textos, articulos o documentacion en ese idioma recibiendo un prompt directo de texto.
- Generacion de texto en ingles: aunque el foco es el italiano, el soporte de `en` permite tareas de continuacion y generacion en ingles.
- Punto de partida para ajuste fino: al ser un modelo base cuantizado en GPTQ, sirve como referencia para experimentar con adaptadores LoRA o tecnicas de fine-tuning sobre una base de 7B en bajo consumo.
- Inferencia en portatiles con Intel Core Ultra: el artefacto esta pensado para ejecutarse en CPU, iGPU Arc y NPU, lo que habilita despliegues locales sin GPU dedicada.
- Prototipado de pipelines de NLP en italiano: se puede integrar en flujos de generacion de contenido, resumen o reformulacion cuando se disponga de un prompt de continuacion.
- Investigacion sobre cuantizacion: el repositorio incluye la receta de replicacion completa (setup.sh, runner.py y script Python standalone con AutoRound), util para estudiar el impacto de W4G64 asimetrico en un 7B.
- Despliegue en entornos de recursos limitados: el formato INT4 reduce el peso del artefacto (repo de 5,4 GB) frente a la version en bfloat16, facilitando su ejecucion en maquinas modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de INT4 (4 bits), un modelo de 7B ocupa aproximadamente 3,5-4 GB de pesos, a lo que hay que sumar el overhead de contexto y activaciones. El repositorio ocupa 5,4 GB.
- El autor indica una mejora de velocidad de 2-3X respecto a la version sin cuantizar, con una perdida de precision leve en W4G64.
- Hardware objetivo declarado: CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel AI Boost (serie Core Ultra, via OpenVINO).
- Es compatible con GPUs de consumo (por ejemplo RTX 4090, 3090, 4080 y similares con suficiente VRAM), aunque no se detallan estos perfiles en la informacion disponible.
- Opciones de despliegue: transformers (con soporte GPTQ/AutoGPTQ), text-generation-inference (tag incluido) y, para Intel, intel-extension-for-pytorch y OpenVINO.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int4-gs64-asym | 7B (nombre) / 1,41B reportado en safetensors | no disponible | INT4 GPTQ gs64 asimetrica | Apache 2.0 | HuggingFace |
| sapienzanlp/Minerva-7B-base-v1.0 | 7B | no disponible | sin cuantizar | no disponible en esta informacion | HuggingFace |
| Otras variantes de cuantizacion del mismo base | 7B | no disponible | otras (no disponibles) | Apache 2.0 (del repo) | HuggingFace |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia. Alternativas de otros desarrolladores en la misma categoria (LLM italianos de ~7B) no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no responde a instrucciones ni mantiene dialogos de forma nativa; hay que alimentarlo con continuaciones de texto.
- Perdida de precision por cuantizacion: el autor advierte de una ligera caida de exactitud en la configuracion W4G64.
- Los parametros totales reportados en safetensors (1.416.040.448) no concuerdan con el nombre "7B" del modelo base; conviene verificar el artefacto antes de usarlo en produccion.
- El modelo se distribuye "sin garantia" y el autor indica que fue desarrollado unicamente con fines de investigacion.
- Riesgo de alucinacion: no se documentan medidas de mitigacion en la informacion disponible.
- Idiomas limitados a italiano e ingles; no hay soporte declarado de castellano.
- Longitud de contexto no documentada en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia real del modelo base original (no figura en esta informacion).
- No hay evidencia de soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines agenticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int4-gs64-asym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- auto-round-pipeline (repositorio de orquestacion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
