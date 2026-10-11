# fbaldassarri/mistralai_Mistral-7B-v0.3-auto_round-int4-gs64-sym

## Resumen

Este repositorio contiene una version cuantizada a INT4 de `mistralai/Mistral-7B-v0.3`, publicada por el usuario fbaldassarri bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresion: se parte de los pesos completos de Mistral 7B v0.3 y se aplica cuantizacion de solo pesos (weights-only quantization, WoQ) mediante el algoritmo AutoRound (variante SignRound) de Intel, en su version 0.15.1. La configuracion concreta es 4 bits, tamano de grupo 64 y esquema simetrico, con calibracion en CPU y `torch.bfloat16` como tipo de carga.

El interes practico del artefacto es el despliegue eficiente: reduce el peso en disco y en memoria aproximadamente a la mitad o menos respecto a los pesos en bf16, y el autor declara una mejora de velocidad de 2-3x con una perdida de precision "ligera" en W4G64, aunque sin aportar cifras de benchmarks. Esta orientado explicitamente a inferencia en hardware Intel: CPU mediante `intel-extension-for-pytorch`, iGPU Arc y NPU (AI Boost de la serie Core Ultra) mediante OpenVINO.

Es relevante ahora porque Mistral 7B v0.3 sigue siendo un modelo base pequeno, con licencia permisiva y ampliamente soportado, que resulta util como componente de generacion de texto en entornos con recursos limitados. Conviene senalar, no obstante, que es un modelo base (no afinado por instrucciones), que solo declara soporte de ingles y que el repositorio no incluye resultados de evaluacion, por lo que su calidad real tras la cuantizacion no esta verificada de forma publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal tipo Mistral (atencion con ventana deslizante y GQA en el modelo base; dato heredado, no detallado en el repositorio cuantizado) |
| Parametros totales | 1.263.800.320 segun los safetensors del repositorio (el modelo base declara del orden de 7.250 millones; la discrepancia es notable y no se explica en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (dato heredado, no indicado en la ficha del repositorio cuantizado) |
| Tipos de cuantizacion | INT4 (4 bits), group size 64, simetrica, WoQ con AutoRound/SignRound; el modelo base sin cuantizar admite bf16/fp16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, en el formato `auto_round` |
| Metodo de cuantizacion | auto_round 0.15.1 (Intel), SignRound, calibracion en CPU |
| Hiperparametros de calibracion | 128 muestras, 200 iteraciones, seqlen 512, batch size 4, `torch.bfloat16` |
| Tamano del repositorio | 4.8 GB |
| Libreria de inferencia | transformers (`library_name: transformers`); el metadato de la ficha marca `inference: false` |

## Arquitectura y entrenamiento

No se ha entrenado ningun modelo nuevo: el artefacto es el resultado de un proceso de cuantizacion de solo pesos aplicado sobre `mistralai/Mistral-7B-v0.3`. La arquitectura subyacente es la del modelo base (Transformer decoder-only causal con atencion de ventana deslizante sobre un contexto de 32.768 tokens y atencion por consultas agrupadas), pero la model card de este repositorio no documenta capas, dimensiones ocultas ni composicion del dataset de entrenamiento original, por lo que esos datos deben consultarse en la ficha del modelo base.

La innovacion tecnica aqui es el metodo de cuantizacion. AutoRound optimiza los parametros de redondeo (escalas y puntos de redondeo) mediante descenso de gradiente sobre un pequeno conjunto de calibracion, en lugar de usar redondeo por minimo-maximo o GPTQ puro. La configuracion registrada fue: 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia 512, batch size 4 y `torch.bfloat16` para la carga del modelo. Todo el proceso se ejecuto en CPU y tardo 42.038,1 segundos (unos 700,6 minutos), finalizando el 3 de octubre de 2026. La receta de replicacion esta documentada en la propia model card mediante el `auto-round-pipeline` y un script directo con la API de `auto_round`.

## Capacidades

- Generacion de texto autoregresiva y tareas de completado (el repositorio se describe explicitamente como modelo base/completion, para usar con texto sin formato).
- Razonamiento general, codigo y matematicas basicas, en la medida en que lo permite el modelo base Mistral 7B v0.3; no hay evaluacion publicada en este repositorio.
- Prompting directo sin plantilla de chat: el campo `prompt_template` de la ficha es simplemente `{prompt}`, lo que confirma que no es un modelo afinado por instrucciones.
- Capacidades multilingues: solo se declara `en` (ingles) en la metadata; no se garantiza buen rendimiento en castellano.
- Tool calling / function calling: no documentado en la informacion disponible de este repositorio.
- Modo thinking, vision o audio: no disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas.

## Casos de uso

- Completado de texto en aplicaciones de autocompletado o redaccion asistida: el modelo acepta directamente un prefijo de texto y devuelve una continuacion, sin necesidad de plantilla de instrucciones ni formato de chat.
- Generacion de codigo dentro de editores o scripts locales: al ser un modelo base de 7B cuantizado a INT4, puede ejecutarse en portatiles con iGPU Intel o en equipos de sobremesa modestos, lo que permite integrarlo en herramientas de linea de comandos o extensiones de IDE sin depender de la nube.
- Preprocesado y transformacion de datos en lote: generacion de resumenes, reescrituras o extraccion de campos sobre grandes volumenes de texto, donde el coste por token y el uso de memoria importan mas que la calidad maxima.
- Prototipado e investigacion sobre cuantizacion: el repositorio documenta la receta exacta de AutoRound (bits, group size, simetria, muestras de calibracion, iteraciones), lo que lo convierte en un punto de partida reproducible para estudiar la degradacion de calidad W4G64.
- Inferencia en CPU o NPU Intel en entornos de borde: la model card indica compatibilidad con `intel-extension-for-pytorch`, iGPU Arc y NPU de la serie Core Ultra via OpenVINO, util para despliegues sin GPU dedicada.
- Evaluacion comparativa de frameworks de cuantizacion: sirve como artefacto de referencia para medir AutoRound/SignRound frente a otras tecnicas (GPTQ, AWQ) con la misma configuracion de 4 bits y grupo 64.
- Generacion de texto en pipelines de `transformers` con `device_map="auto"`: util como componente base sobre el que aplicar despues un ajuste fino o un adaptador LoRA especifico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma de forma cualitativa "mejora de velocidad de 2-3x" y "una ligera caida de precision en W4G64", sin especificar hardware de referencia, baseline ni metricas (MMLU, HumanEval, GSM8K u otras). Tampoco se incluyen comparaciones con la version sin cuantizar ni con otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 4,8-5,5 GB con la cuantizacion INT4 (el repositorio ocupa 4,8 GB en disco); el modelo base en bf16 requeriria unos 15 GB.
- Memoria de cache KV adicional: con atencion por consultas agrupadas y contexto completo de 32.768 tokens, el coste estimado es de decenas de MB a varios GB segun precision y longitud real de contexto; no hay mediciones publicadas en este repositorio.
- GPU consumer: deberia caber en GPUs de 8 GB con contexto corto o moderado (por ejemplo RTX 3060 Ti, RTX 4060) y con holgura en 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080). Con contextos muy largos conviene subir a 16-24 GB.
- GPU profesionales: A100, H100, L40S y similares son soportadas, aunque el modelo queda muy sobredimensionado para su capacidad.
- Hardware Intel: la ficha indica cuantizacion optimizada para CPU Intel, iGPU Intel Arc (via `intel-extension-for-pytorch`) y NPU Intel AI Boost de la serie Core Ultra (via OpenVINO).
- Opciones de despliegue: `transformers` (con `device_map="auto"`), `text-generation-inference` (etiqueta presente en la metadata) y los backends Intel mencionados. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, conversion que este repositorio no incluye.
- Latencia y throughput: no disponibles. La unica cifra aportada es la mejora relativa de 2-3x declarada por el autor, sin hardware ni baseline especificados.

## Comparativa con modelos similares

Los datos del modelo base y de las alternativas provienen de sus fichas publicas y no se han verificado en la informacion proporcionada; los de benchmarks no estan disponibles en ningun caso.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Idiomas |
|---|---|---|---|---|---|
| Este repositorio (Mistral-7B-v0.3 INT4 AutoRound) | 1.263.800.320 segun safetensors del repo | heredado del base: 32.768 tokens | INT4, gs64, simetrica | apache-2.0 | en |
| mistralai/Mistral-7B-v0.3 (base, sin cuantizar) | ~7.250 millones | 32.768 tokens | bf16/fp16 | apache-2.0 | en |
| Meta Llama 3.1 8B | ~8.030 millones | 128.000 tokens | bf16/fp16, GGUF, AWQ | Llama 3.1 Community License (no Apache) | multilingue |
| Qwen2.5 7B | ~7.620 millones | 32.768 tokens nativos (ampliable con YaRN) | bf16/fp16, GGUF, AWQ, GPTQ | apache-2.0 | multilingue |

Diferencias clave: frente a Llama 3.1 8B y Qwen2.5 7B, Mistral 7B v0.3 ofrece una ventana de contexto menor y soporte declarado solo en ingles, pero mantiene licencia Apache 2.0 y un ecosistema de cuantizacion muy maduro. Frente a otras cuantizaciones INT4 del mismo modelo base, la diferencia estaria en el algoritmo (AutoRound/SignRound frente a GPTQ o AWQ), pero no hay benchmarks publicados que permitan cuantificarla.

## Limitaciones y advertencias

- Es un modelo base, no un modelo de instrucciones: no espera plantillas de chat y respondera completando texto, no obedeciendo ordenes conversacionales.
- Solo se declara soporte de ingles (`language: en`). El rendimiento en castellano no esta documentado ni garantizado.
- No hay resultados de evaluacion publicados: la afirmacion de "ligera caida de precision" no esta cuantificada, por lo que el impacto real de la cuantizacion INT4 W4G64 sobre tareas concretas es desconocido.
- Discrepancia en el recuento de parametros: los safetensors del repositorio suman 1.263.800.320 parametros, muy por debajo de los aproximadamente 7.250 millones del modelo base Mistral 7B v0.3. No se explica en la model card; conviene verificar la integridad del artefacto antes de usarlo en produccion.
- El metadato de la ficha incluye `inference: false`, lo que sugiere que el autor no garantiza el despliegue directo a traves de la infraestructura de inferencia del Hub.
- Riesgo de alucinacion inherente a un modelo de 7B sin ajuste por instrucciones ni por preferencias humanas; no se documenta RLHF, DPO ni filtrado de seguridad.
- Sesgos: no documentados en este repositorio. Al heredar los pesos del modelo base, arrastra los sesgos del corpus de entrenamiento original.
- Licencia y uso comercial: los pesos se publican bajo Apache 2.0, lo que en principio permite uso comercial, pero el aviso final de la model card indica que el modelo "se ha desarrollado solo con fines de investigacion" y se entrega sin garantia. Es una contradiccion que conviene aclarar con el autor antes de un despliegue comercial.
- El repositorio no incluye version GGUF, por lo que no es directamente utilizable en llama.cpp u Ollama sin una conversion previa.
- Las optimizaciones declaradas estan ligadas a hardware Intel (CPU, Arc, NPU) y a las versiones concretas de AutoRound (0.15.1), transformers (4.55.3) y torch (2.14.0+cpu) registradas; otros entornos pueden comportarse de forma distinta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fbaldassarri/mistralai_Mistral-7B-v0.3-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- auto-round-pipeline (receta de replicacion citada en la model card): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Las busquedas devolvieron exclusivamente contenido no relacionado y de caracter adulto, por lo que no se incluye ningun enlace adicional.
