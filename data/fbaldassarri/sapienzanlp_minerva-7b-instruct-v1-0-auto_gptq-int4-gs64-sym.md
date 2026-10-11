# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int4-gs64-sym

## Resumen

Este artefacto es una version cuantizada a 4 bits (INT4) del modelo `sapienzanlp/Minerva-7B-instruct-v1.0`, un LLM instructivo de arquitectura Mistral desarrollado por el grupo Sapienza NLP. La cuantizacion ha sido realizada por el usuario fbaldassarri mediante la herramienta Intel AutoRound v0.15.1, aplicando el algoritmo GPTQ (AutoGPTQ) en modo weights-only quantization (WOQ), con cuantizacion simetrica y tamano de grupo 64. El objetivo es reducir el peso en memoria y acelerar la inferencia entre 2 y 3 veces respecto al modelo en bfloat16, a costa de una ligera perdida de precision.

El modelo base esta orientado a generacion de texto conversacional y esta disponible en italiano (it) e ingles (en). Esta version cuantizada esta pensada especificamente para inferencia sobre hardware Intel: CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch y NPU Intel (AI Boost de la serie Core Ultra) mediante OpenVINO. Se distribuye bajo licencia Apache 2.0.

Se trata de un artefacto de nicho: no es un modelo nuevo ni reentrenado, sino un derivado de pesos cuantizados. Su relevancia radica en facilitar el despliegue de un modelo instructivo italiano de ~7B en equipos con recursos limitados o aceleradores Intel, sin necesidad de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, tipo Mistral (`model_type: mistral`) |
| Parametros totales | El modelo base se denomina 7B; el recuento real de parametros almacenados en safetensors de este artefacto cuantizado es 1.416.564.736 (representacion empaquetada en INT4) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (4 bits), GPTQ / AutoGPTQ (WOQ), group size 64, simetrica (`sym: true`) |
| Idiomas soportados | Italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_gptq / GPTQ) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `sapienzanlp/Minerva-7B-instruct-v1.0`, de tipo Mistral, es decir, un transformer decoder-only causal con atencion por ventanas deslizantes segun el diseno Mistral. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original.

Este repositorio no reentrena el modelo: aplica una cuantizacion post-entrenamiento de solo pesos (weights-only quantization) con Intel AutoRound v0.15.1. El algoritmo es GPTQ (AutoGPTQ), con 4 bits, grupo de 64 y cuantizacion simetrica. La calibracion se realizo sobre 128 muestras, con 200 iteraciones de ajuste, longitud de secuencia 512 y tamano de lote 4, cargando el modelo base en bfloat16 y ejecutando la calibracion en CPU. El proceso completo duro 41.981,9 segundos (aproximadamente 699,7 minutos) y finalizo el 27 de septiembre de 2026. Las condiciones exactas de ejecucion (transformers 4.55.3, torch 2.14.0+cpu) estan documentadas en la model card.

La innovacion tecnica destacable es el uso del pipeline de AutoRound para producir pesos INT4 optimizados para aceleradores Intel, con una receta de replicacion publicada que permite reproducir byte a byte la cuantizacion.

## Capacidades

- Generacion de texto causal y conversacional: es un modelo instruct/chat, por lo que debe usarse con su plantilla de chat integrada en lugar de prompts de texto plano.
- Soporte multilingue limitado a italiano e ingles.
- Diseno orientado a despliegue en inferencia de bajo consumo de memoria mediante cuantizacion INT4.
- Aceleracion de inferencia declarada de 2-3 veces respecto al modelo sin cuantizar.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistentes conversacionales en italiano: el modelo puede gestionar dialogos multi-turno en italiano gracias a su naturaleza instructiva y a su plantilla de chat, adecuado para aplicaciones de soporte o atencion al usuario en ese idioma.
- Despliegue en equipos sin GPU dedicada: al estar cuantizado a INT4 y optimizado para CPU, iGPU Arc y NPU Intel, permite ejecutar un modelo de ~7B en portatiles y mini-PC con Core Ultra.
- Prototipado rapido en investigacion: su licencia Apache 2.0 y su bajo consumo de memoria lo hacen util para experimentar con generacion de texto en italiano en laboratorios con hardware modesto.
- Generacion de contenido en italiano: redaccion asistida, resumenes y reformulacion de textos en italiano en entornos con recursos limitados.
- Educacion y demostraciones: ejecucion local de un asistente instructivo para docencia o demos sin depender de servicios en la nube.
- Procesamiento por lotes en CPU: tareas de generacion de texto a granel donde no se dispone de GPU, aprovechando el modo de cuantizacion WOQ orientado a CPU Intel.
- Integracion en pipelines con intel-extension-for-pytorch u OpenVINO para inferencia en produccion sobre hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una aceleracion de 2-3 veces y una ligera perdida de precision en la configuracion W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos INT4 de un modelo de ~7B, los pesos ocupan aproximadamente 4 GB; sumando cache KV y overhead de runtime, el consumo suele situarse en torno a 6-8 GB, si bien la model card no proporciona cifras exactas (estimacion orientativa).
- GPU recomendadas: el artefacto esta optimizado para hardware Intel, no para GPU NVIDIA. Para GPU, cualquier tarjeta con al menos 8-12 GB podria ejecutarlo (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100), aunque no es el objetivo declarado.
- Hardware Intel objetivo: CPU Intel, iGPU Intel Arc (por ejemplo Core Ultra 185H) mediante intel-extension-for-pytorch, y NPU Intel (AI Boost de la serie Core Ultra) mediante OpenVINO.
- Cabe en consumer GPU: previsiblemente si, en tarjetas con 8 GB o mas, dado el tamano INT4 del modelo.
- Opciones de despliegue: transformers con auto-gptq, intel-extension-for-pytorch, OpenVINO y text-generation-inference (tag presente). Para llama.cpp u Ollama seria necesario convertir a GGUF, que no se ofrece en este repositorio.
- Latencia y throughput: no disponibles; solo se declara una aceleracion generica de 2-3 veces.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (INT4 GPTQ de Minerva-7B instruct) | 7B (nombre); 1.416.564.736 almacenados en safetensors cuantizados | No disponible | safetensors (GPTQ) | Apache 2.0 | HuggingFace |
| sapienzanlp/Minerva-7B-instruct-v1.0 (base, sin cuantizar) | 7B | No disponible | safetensors | Apache 2.0 | HuggingFace |
| Otros modelos instructivos de ~7-8B | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se identifican en la informacion proporcionada otros modelos comparables de la misma categoria o de cuantizacion equivalente para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Perdida de precision: la propia model card advierte de una ligera caida de exactitud en la configuracion W4G64 respecto al modelo en bfloat16.
- Ambito de investigacion: el aviso legal indica que el modelo se ha desarrollado unicamente con fines de investigacion y se entrega sin garantia.
- Cobertura linguistica limitada: solo italiano e ingles; no se documenta soporte de otras lenguas, incluido el castellano.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion; como todo LLM generativo, puede producir informacion incorrecta.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo en la documentacion proporcionada.
- Contexto: se desconoce la longitud de contexto efectiva de este artefacto, lo que dificulta planificar tareas que requieran ventanas largas.
- Compatibilidad de licencia: la licencia es Apache 2.0, que permite uso comercial, pero el aviso del autor restringe el uso declarado a investigacion; conviene revisar esta discrepancia antes de un despliegue productivo.
- Hardware: esta optimizado para aceleradores Intel; fuera de ese ecosistema puede no aprovechar las ventajas de rendimiento previstas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- Metadato `inference: false`: la inferencia gestionada de HuggingFace no esta habilitada para este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int4-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- auto-round-pipeline (receta de replicacion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- La busqueda web no devolvio enlaces relevantes sobre este modelo (papers, blogs o demos): no disponible.
