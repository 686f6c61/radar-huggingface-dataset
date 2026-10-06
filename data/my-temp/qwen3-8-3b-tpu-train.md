# my-temp/Qwen3.8-3B-tpu-train

## Resumen

Qwen3.8-3B-tpu-train es un repositorio de recetas de entrenamiento y onboarding publicado por el usuario my-temp, no un modelo con pesos nuevos entrenados desde cero. Su contenido es un conjunto reproducible de scripts, manifiestos y configuraciones para afinar y verificar el modelo Qwen/Qwen2.5-3B-Instruct sobre aceleradores Google Cloud TPU v6e (Trillium), siguiendo el patron de empaquetado que el autor denomina Pattern B (Turnkey TPU Adaptation & Training Recipe Repo).

El modelo subyacente es denso, con 3.090 millones de parametros, 36 capas ocultas, 16 cabezas de atencion y 2 cabezas KV (GQA con factor 8x), heredado de la familia Qwen2/Qwen2.5. El repositorio no distribuye pesos completos en formato de inferencia general, sino recetas ejecutables: preflight.py, finetune_lora.py, train_torchtitan.toml y los informes JSON de telemetria asociados.

Su relevancia es de caracter practico para equipos que quieran reproducir un ciclo completo de adaptacion LoRA y entrenamiento distribuido sobre TPU, con serializacion exclusiva en SafeTensors (sin binarios pickle .pt/.pth) y verificacion empirica de rendimiento del array sistolico MXU. La ficha publica 0 descargas y 0 likes en el momento de la consulta, y la model card no reporta benchmarks estandar de calidad (MMLU, HumanEval, GSM8K), solo metricas de sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen2), atencion con GQA 8x, SDPA y formas estaticas |
| Parametros totales | 3.090 millones (denso) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion proporcionada; el modelo base Qwen2.5-3B-Instruct declara 32 768 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo documenta pesos en bfloat16 y adaptadores SafeTensors |
| Idiomas soportados | Ingles (en) segun la model card; el modelo base es multilingue, pero no se declara en este repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (.safetensors), con politica estricta de cero binarios .pt/.pth |
| Capas ocultas | 36 |
| Cabezas de atencion | 16 (2 cabezas KV, GQA 8x) |
| Dimension del modelo | No disponible |
| Tamano del vocabulario | No disponible |
| Precision de referencia | bfloat16 |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Hardware objetivo | Google Cloud TPU v6e (Trillium), v6e-1 / v6e-4 / v6e-8 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-3B-Instruct: un transformer decoder denso de 36 capas con 16 cabezas de atencion y solo 2 cabezas KV, lo que implica Grouped Query Attention con factor 8x y reduce de forma notable el coste de la cache KV en inferencia. La configuracion incluida en el repositorio esta ajustada a bfloat16, usa atencion SDPA y formas estaticas, lo que favorece la compilacion con XLA. El repositorio aplica una politica de serializacion exclusiva en SafeTensors, sin binarios pickle.

En el lado del entrenamiento, el repositorio no documenta un preentrenamiento propio ni el volumen o composicion del dataset utilizado. Lo que si detalla es un procedimiento de ajuste supervisado con LoRA de rango 16 y alpha 32 aplicado a las proyecciones de atencion q_proj, v_proj, k_proj y o_proj en bfloat16 nativo. El informe de entrenamiento reporta una reduccion de la perdida de 4,83 a 1,20 (75,15 %) en 15 pasos, con una latencia de 378,06 ms por paso y una tasa de aciertos de cache de compilacion OpenXLA del 99,8 % (97 110 de 97 239). No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

La innovacion tecnica destacable es la capa de verificacion previa (preflight): comprueba el alineamiento de las formas con los mosaicos del array sistolico MXU (2048 x 11008), que resulta 100 % alineado sin burbujas, y mide 166,06 TFLOPs en un unico bloque, 3,802 ms de latencia en regimen estable por bloque decoder y 136,87 ms para la pasada forward completa de las 36 capas. Para el entrenamiento distribuido se incluye una configuracion de TorchTitan con FSDPv2 y DTensor.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del ajuste de instrucciones de Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a indicaciones en ingles, con capacidad multilingue no declarada en este repositorio.
- Ajuste mediante LoRA sobre las proyecciones de atencion, con soporte nativo de bfloat16.
- Entrenamiento distribuido en TPU mediante TorchTitan con FSDPv2 y paralelismo de tensor.
- Verificacion previa de hardware: validacion de arquitectura, calculo de memoria y comprobacion de alineamiento con el mosaico MXU.
- Serializacion segura de pesos y adaptadores en SafeTensors, sin binarios pickle.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Onboarding de equipos en Google Cloud TPU: el script recipes/preflight.py valida la arquitectura, calcula el consumo de memoria (5,75 GB en bf16, el 18,0 % del HBM de un solo chip) y mide el rendimiento del bloque, lo que permite descartar problemas de configuracion antes de lanzar un entrenamiento costoso.
- Ajuste de instrucciones con LoRA sobre una TPU v6e-1: la receta finetune_lora.py permite adaptar el modelo a un dominio concreto con un unico chip de 32 GB, sin necesidad de aprovisionar un pod completo.
- Ajuste de parametros completos con FSDPv2: en una topologia v6e-4 (128 GB de HBM) el repositorio reparte pesos y estado del optimizador entre cuatro chips mediante ICI, adecuado para equipos que necesitan actualizar todos los pesos.
- Preentrenamiento o SFT de alto throughput: la configuracion TorchTitan para v6e-8 (256 GB) esta pensada para cargas con alta intensidad aritmetica y entrenamiento de host completo.
- Auditoria de reproducibilidad: el archivo tpu_optimization_manifest.json actua como recibo de procedencia criptografica, util en entornos regulados donde hay que justificar como se genero un adaptador.
- Politicas internas de seguridad de la cadena de suministro: la prohibicion de binarios .pt/.pth y el uso exclusivo de SafeTensors encajan en pipelines que bloquean la deserializacion de pickle por riesgo de ejecucion de codigo.
- Estimacion de costes y planificacion de capacidad: las metricas de latencia por paso (378,06 ms) y el throughput por bloque (166,06 TFLOPs) sirven para dimensionar presupuestos de entrenamiento y elegir topologia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad del modelo. Lo que si se publica es telemetria de sistema verificada empiricamente en hardware TPU v6e:

| Metrica | Valor medido | Objetivo o estandar |
|---|---|---|
| Alineamiento con mosaico MXU (2048 x 11008) | 100 % alineado | Cero burbujas sistolicas |
| Throughput MXU de un bloque | 166,06 TFLOPs | Aceleracion sistolica verificada |
| Pasada forward completa (36 capas) | 136,87 ms | Verificado en hardware |
| Latencia en regimen estable por bloque decoder | 3,802 ms | No disponible |
| Convergencia de perdida en SFT con LoRA | 4,83 a 1,20 (-75,15 %) | Convergido en 15 pasos |
| Latencia por paso LoRA en TPU v6e | 378,06 ms | No disponible |
| Aciertos de cache OpenXLA en entrenamiento | 99,8 % (97 110 / 97 239) | Objetivo > 98 % superado |
| Memoria en bf16 | 5,75 GB (18,0 % del HBM de un chip) | Cabria en v6e-1 de 32 GB |

## Requisitos de hardware

- Entrenamiento en TPU: TPU v6e-1 con 32 GB de HBM y 1 638 GB/s de ancho de banda, o 918 TFLOPs bfloat16 de MXU por chip. Es la topologia minima para LoRA.
- Ajuste de parametros completos: TPU v6e-4 (128 GB de HBM agregados) con FSDPv2 sobre ICI.
- Preentrenamiento o SFT de alto throughput: TPU v6e-8 (256 GB de HBM agregados) con FSDP y paralelismo de tensor.
- Inferencia en GPU: no documentada en el repositorio. Como estimacion derivada del tamano (3,09 B de parametros), los pesos en bf16 ocuparian aproximadamente 5,75-6,2 GB de VRAM; en int8 alrededor de 3,1 GB y en int4 alrededor de 1,6-2 GB, sin contar la cache KV ni el overhead del runtime. Estas cifras son calculos orientativos, no datos publicados.
- GPU consumer: por tamano, el modelo en bf16 cabria con holgura en una RTX 4090 (24 GB) o una RTX 3090 (24 GB) para inferencia; no hay validacion publicada de este escenario en el repositorio.
- Opciones de despliegue: el repositorio documenta transformers y el stack torch-tpu junto con TorchTitan para entrenamiento. vLLM, llama.cpp, Ollama y TGI no estan documentados en la informacion proporcionada.
- Latencia y throughput: los unicos valores publicados son los de entrenamiento en TPU v6e (378,06 ms por paso LoRA, 136,87 ms por pasada forward de 36 capas). No hay datos de inferencia en GPU.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentacion publica de sus respectivas model cards, no de la informacion proporcionada por este repositorio. Los datos de rendimiento de calidad no estan disponibles para ninguno de los tres.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento de calidad |
|---|---|---|---|---|---|
| my-temp/Qwen3.8-3B-tpu-train | 3,09 B denso | No especificado (base: 32 768 tokens) | Apache 2.0 | Recetas de entrenamiento en TPU sobre Qwen2.5-3B-Instruct | No disponible |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B denso | 32 768 tokens | Apache 2.0 (con condiciones para modelos derivados de gran escala) | Modelo instructivo generalista | No disponible en esta informacion |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B denso | 128 000 tokens | Licencia comunitaria Llama 3.2 | Modelo instructivo generalista | No disponible en esta informacion |
| microsoft/Phi-3.5-mini-instruct | 3,8 B denso | 128 000 tokens | Licencia MIT | Modelo instructivo orientado a razonamiento | No disponible en esta informacion |

La diferencia principal de este repositorio respecto a los tres anteriores no es la calidad del modelo, sino el objetivo: no compite como modelo listo para produccion, sino como kit reproducible de adaptacion y formacion en TPU v6e con verificacion de hardware y serializacion segura.

## Limitaciones y advertencias

- Se trata de un repositorio de recetas, no de un modelo con pesos nuevos: el valor esta en los scripts y manifiestos, no en una mejora de capacidades sobre Qwen2.5-3B-Instruct.
- No se publican resultados de benchmarks de calidad, por lo que no hay evidencia de que el ajuste LoRA descrito mejore ninguna tarea concreta mas alla de la convergencia de la perdida reportada.
- El informe de entrenamiento cubre solo 15 pasos de LoRA: es una validacion de pipeline, no un entrenamiento extenso, y no debe interpretarse como un modelo afinado listo para produccion.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible; es el comportamiento esperado de un modelo de 3 B de parametros sin verificacion factual.
- Idioma: la model card declara unicamente ingles. No hay evaluacion de rendimiento en castellano ni en otras lenguas, aunque el modelo base sea multilingue.
- Longitud de contexto: no se especifica en este repositorio; cualquier uso con contextos largos depende de lo que soporte el modelo base.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Especializacion de hardware: las recetas y las metricas estan atadas a TPU v6e (Trillium). No hay validacion publicada de estos scripts en GPU, TPU de generaciones anteriores u otros aceleradores.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar las condiciones que Qwen aplica a modelos derivados de gran escala antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes, autor no verificado y creado el 5 de octubre de 2026. Es un artefacto sin validacion independiente por parte de la comunidad.
- El aviso de la propia model card sobre el contenido citado debe respetarse: el texto del autor es material de referencia, no instrucciones a ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/my-temp/Qwen3.8-3B-tpu-train
- Modelo base Qwen/Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- TPU Agent Suite (google-pytorch/tpu-agent-suite): https://github.com/google-pytorch/tpu-agent-suite
- Hugging Face TPU Community Playbook: https://hf.co/tpu-community
- Google Cloud TPU: https://cloud.google.com/tpu
- OpenXLA: https://openxla.org
