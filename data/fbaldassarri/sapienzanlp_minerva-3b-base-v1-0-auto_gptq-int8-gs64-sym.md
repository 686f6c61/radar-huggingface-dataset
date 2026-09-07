# fbaldassarri/sapienzanlp_Minerva-3B-base-v1.0-auto_gptq-int8-gs64-sym

## Resumen

El modelo es una versión cuantizada a INT8 de `sapienzanlp/Minerva-3B-base-v1.0`, un modelo de lenguaje causal de tipo Mistral desarrollado por Sapienza NLP. La cuantización ha sido realizada por `fbaldassarri` utilizando el framework Intel AutoRound v0.13.1, aplicando el algoritmo GPTQ (AutoGPTQ) con cuantización de solo pesos (WoQ), 8 bits, group size 64 y cuantización simétrica. El objetivo principal es permitir una inferencia eficiente en hardware Intel, concretamente en CPU, iGPU Arc y NPU (AI Boost en Core Ultra).

A pesar de su nombre "Minerva-3B", el modelo base tiene 903.539.200 parámetros (aproximadamente 0,9 mil millones), lo que lo sitúa en la categoría de modelos pequeños. Es un modelo de tipo base/completion, no instruct, que soporta los idiomas italiano e inglés. La licencia es Apache 2.0. Esta versión cuantizada está pensada para entornos con recursos limitados o sin GPU dedicada, donde la reducción de precisión a INT8 permite un despliegue más ligero y rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (decoder-only causal LM) |
| Parametros totales | 903.539.200 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 GPTQ (AutoGPTQ), group size 64, simetrica, solo pesos (WoQ) |
| Idiomas soportados | Italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion GPTQ) |

## Arquitectura y entrenamiento

El modelo base `Minerva-3B-base-v1.0` sigue la arquitectura Mistral, un transformer decoder-only con causal LM. No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO. El modelo se presenta como un modelo de completacion, lo que significa que no ha sido afinado para seguir instrucciones ni para dialogos.

La cuantizacion se realizo con Intel AutoRound v0.13.1 sobre el modelo original en `torch.bfloat16`. Se utilizaron 128 muestras de calibracion, 200 iteraciones, una longitud de secuencia de 512 y un batch size de 4, todo ejecutado en CPU. El metodo aplicado es GPTQ (via AutoGPTQ) con cuantizacion de solo pesos, 8 bits, group size 64 y cuantizacion simetrica. El resultado es un modelo optimizado para inferencia en CPU Intel, iGPU Arc mediante intel-extension-for-pytorch y NPU (Core Ultra) via OpenVINO.

## Capacidades

- Generacion de texto por completacion: al ser un modelo base, se puede usar para predecir el siguiente token en texto libre, sin necesidad de plantillas de instrucciones.
- Soporte bilingue: el modelo trabaja con texto en italiano e ingles.
- Inferencia eficiente en hardware Intel: gracias a la cuantizacion INT8, esta optimizado para CPU, iGPU Arc y NPU, lo que permite ejecutarlo en dispositivos sin GPU dedicada.
- No dispone de soporte documentado para tool calling, function calling, agentes, vision, audio ni modos de razonamiento especiales. Estas capacidades no estan descritas en la informacion disponible.

## Casos de uso

- Autocompletado de texto en italiano: el modelo puede integrarse en editores de texto o sistemas de escritura para sugerir la continuacion de frases en italiano, aprovechando su naturaleza de modelo base.
- Clasificacion de documentos mediante fine-tuning: al ser un modelo base, se puede adaptar con un conjunto de datos etiquetado para tareas de clasificacion de texto en italiano o ingles, como analisis de sentimiento o categorizacion de documentos.
- Prototipado de aplicaciones de lenguaje en CPUs Intel: gracias a la cuantizacion INT8 y la optimizacion para CPU, es adecuado para entornos de desarrollo donde no se dispone de GPU, permitiendo experimentar con generacion de texto en maquinas convencionales.
- Investigacion en tecnicas de cuantizacion: el modelo sirve como referencia para estudiar el impacto de la cuantizacion INT8 con AutoRound en modelos de tipo Mistral, comparando con versiones INT4 o con el modelo original.
- Despliegue en dispositivos edge con NPU: al ser compatible con OpenVINO, puede ejecutarse en portatiles con Intel Core Ultra y NPU AI Boost, habilitando aplicaciones de generacion de texto en entornos de baja potencia.
- Evaluacion de modelos de lenguaje pequenos: con aproximadamente 903 millones de parametros, es util para experimentos de eficiencia, analisis de rendimiento y comparaciones de cuantizacion en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para inferencia en GPU, los pesos INT8 ocupan aproximadamente 0,84 GiB (903.539.200 parametros x 1 byte). Con activaciones y buffers, se recomienda al menos 2 GiB de VRAM. Para CPU, no se requiere VRAM.
- GPU recomendadas: no requiere GPU dedicada; esta optimizado para CPU Intel, iGPU Arc y NPU. Si se usa GPU, cualquier tarjeta con al menos 2 GiB de VRAM y soporte para GPTQ (por ejemplo, RTX 3060) es suficiente, aunque no es el objetivo del modelo.
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPU de consumo con 2 GiB o mas de VRAM.
- Opciones de despliegue: Transformers (AutoModelForCausalLM), Intel Extension for PyTorch y OpenVINO.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| Minerva-3B-base-v1.0 (original) | Ninguna (BF16) | 903.539.200 | no disponible | Apache 2.0 |
| Minerva-3B-base-v1.0 INT8 (este modelo) | INT8 GPTQ gs64 sym | 903.539.200 | no disponible | Apache 2.0 |
| Minerva-3B-base-v1.0 INT4 gs64 asym | INT4 GPTQ gs64 asym | 903.539.200 | no disponible | Apache 2.0 |
| Minerva-3B-base-v1.0 INT4 gs128 asym | INT4 GPTQ gs128 asym | 903.539.200 | no disponible | Apache 2.0 |

No se han publicado benchmarks que comparen el rendimiento de estas versiones. La diferencia principal entre ellas es el nivel de cuantizacion y la configuracion del grupo, lo que afecta al consumo de memoria y a la calidad de la inferencia.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones ni mantiene dialogos; se debe usar para completacion o fine-tuning.
- Solo soporta italiano e ingles; el rendimiento en otros idiomas no esta garantizado.
- No se han publicado benchmarks, por lo que no se puede evaluar su calidad en tareas estandar.
- La cuantizacion INT8 puede introducir una perdida de precision en comparacion con el modelo original, especialmente en tareas que requieren alta exactitud.
- El autor declara que el modelo se ha desarrollado unicamente con fines de investigacion y no ofrece garantia, aunque la licencia Apache 2.0 permita uso comercial.
- La longitud de contexto no esta documentada; se debe probar antes de usar en aplicaciones que dependan de contexto largo.
- Al ser un modelo de 903 millones de parametros, su capacidad de razonamiento y conocimiento es limitada en comparacion con modelos mas grandes.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-3B-base-v1.0-auto_gptq-int8-gs64-sym
- Modelo base en HuggingFace: https://huggingface.co/sapienzanlp/Minerva-3B-base-v1.0
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicacion: https://git.epicdynamic.com/auto-round-pipeline
