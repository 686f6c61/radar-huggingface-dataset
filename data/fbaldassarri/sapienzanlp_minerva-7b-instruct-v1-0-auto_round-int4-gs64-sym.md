# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_round-int4-gs64-sym

## Resumen

Esta ficha describe una version cuantizada a INT4 del modelo sapienzanlp/Minerva-7B-instruct-v1.0, un modelo de lenguaje causal de tipo instruct/chat basado en la arquitectura Mistral y especializado en italiano, con soporte secundario de ingles. La cuantizacion la ha realizado el usuario fbaldassarri mediante la herramienta Intel AutoRound (SignRound/WoQ) en su version 0.15.1, generando pesos de 4 bits con tamano de grupo 64 y cuantizacion simetrica. El resultado es un artefacto pensado para inferencia de bajo consumo en CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel (AI Boost en la serie Core Ultra, via OpenVINO).

El modelo original Minerva-7B-instruct-v1.0 procede del grupo SapienzaNLP (Sapienza University of Rome) y esta orientado a tareas conversacionales en italiano. Esta version cuantizada conserva la plantilla de chat del modelo base y debe usarse a traves de dicha plantilla en lugar de prompts de texto plano. Segun la model card, la cuantizacion ofrece un incremento de velocidad de 2-3X y un consumo de memoria reducido, con una ligera perdida de precision a W4G64.

El artefacto se publica bajo licencia Apache 2.0, ocupa 5.4 GB en el repositorio y se distribuye en formato safetensors compatible con transformers. Es relevante para quienes necesitan desplegar un modelo conversacional italiano en hardware modesto o en plataformas Intel sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), tipo Mistral |
| Parametros totales | 7B (modelo base); 1.415.319.552 segun los safetensors del repositorio cuantizado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (bits=4, group_size=64, simetrica, WoQ/SignRound con AutoRound v0.15.1) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5.4 GB |
| Tipo de cuantizacion | weights-only quantization (WoQ), solo pesos |
| Modelo base | sapienzanlp/Minerva-7B-instruct-v1.0 |
| Relacion con el base | quantized |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de tipo Mistral (model_type: mistral) con 7B parametros, afinado como modelo instruct/chat por SapienzaNLP. Esta version no reentrena el modelo: aplica una cuantizacion weights-only (WoQ) sobre los pesos en bfloat16 del modelo original. La tecnica empleada es el algoritmo SignRound implementado en Intel AutoRound 0.15.1, que ajusta los pesos durante la cuantizacion (tuning) en lugar de aplicar una conversion post-entrenamiento estatica.

Los parametros concretos del proceso de cuantizacion, segun la model card, son: 4 bits, tamano de grupo 64, cuantizacion simetrica, dtype de carga torch.bfloat16, 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia de calibracion 512 y batch size 4. La calibracion se ejecuto en CPU con torch 2.14.0+cpu y transformers 4.55.3, y tardo 41.800,3 segundos (696,7 minutos). No se especifica en la informacion disponible ni la composicion del dataset de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto conversacional en italiano e ingles mediante la plantilla de chat integrada.
- Modelo instruct/chat: responde a instrucciones y mantiene dialogos multi-turno usando `apply_chat_template`.
- Generacion de texto causal estandar (causal-lm) con decodificacion autorregresiva.
- Inferencia optimizada en CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.
- Cuantizacion weights-only que reduce el uso de memoria y acelera la inferencia (2-3X segun el autor) manteniendo la interfaz de transformers.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modos de razonamiento extendido (thinking): no disponibles; el modelo es exclusivamente texto.

## Casos de uso

- Atencion al cliente en italiano: el modelo puede gestionar conversaciones multi-turno en italiano usando su plantilla de chat, desplegado en CPU Intel con un coste de memoria reducido gracias a la cuantizacion INT4.
- Despliegue en portatiles y equipos sin GPU dedicada: al estar optimizado para CPU Intel, iGPU Arc y NPU AI Boost, permite ejecutar un modelo conversacional de 7B en hardware de oficina o portatiles Core Ultra.
- Prototipado rapido en entornos de investigacion: el formato transformers/safetensors permite cargar el modelo con `AutoModelForCausalLM.from_pretrained` y probar aplicaciones conversacionales en italiano sin infraestructura GPU.
- Generacion de contenido en italiano: redaccion asistida, resumenes y reescritura de textos en italiano, aprovechando el ajuste instruct del modelo base.
- Sistemas de Q&A internos en italiano: construccion de asistentes documentales donde el modelo responde preguntas sobre texto aportado en el contexto de la conversacion.
- Traduccion asistida italiano-ingles: al declarar soporte de ambos idiomas, puede emplearse como apoyo en tareas de traduccion o parafraseo entre los dos idiomas.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como artefacto de referencia para comparar AutoRound INT4 frente a otras cuantizaciones (AWQ, GPTQ, INT8) del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que la cuantizacion produce un incremento de velocidad de 2-3X y una ligera perdida de precision a W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT4 de un modelo de 7B ocupan aproximadamente 3,5-4,5 GB; con overhead de runtime y cache KV conviene disponer de al menos 6-8 GB de memoria. Estimacion orientativa, no confirmada en la informacion proporcionada.
- GPU recomendadas: no especificadas en la model card; el autor orienta el artefacto a CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.
- Compatibilidad con GPU de consumo: por tamano, un modelo de 7B en INT4 puede caber en GPUs de consumo de 8-12 GB (por ejemplo RTX 3060 12 GB o RTX 4070), aunque el autor no declara esta ruta como objetivo prioritario.
- Opciones de despliegue documentadas: transformers; intel-extension-for-pytorch en CPU e iGPU Intel Arc; OpenVINO en NPU Intel (AI Boost en Core Ultra); el tag del repositorio incluye text-generation-inference.
- Reproductibilidad: Intel AutoRound 0.15.1 mediante la auto-round-pipeline o llamada directa a `AutoRound.quantize_and_save` con los parametros indicados.
- Latencia y throughput: no se proporcionan cifras concretas; solo la referencia cualitativa de 2-3X de aceleracion frente al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Minerva-7B-instruct-v1.0 AutoRound INT4 gs64 sym) | 7B (base) | INT4 gs64 simetrica (AutoRound) | no disponible | Apache 2.0 | HuggingFace (fbaldassarri) |
| sapienzanlp/Minerva-7B-instruct-v1.0 | 7B | bfloat16 (sin cuantizar) | no disponible | no disponible en la informacion | HuggingFace (SapienzaNLP) |
| Minerva-7B-instruct-v1.0 AutoAWQ INT4 gs128 sym | 7B (base) | INT4 gs128 simetrica (AutoAWQ) | no disponible | Apache 2.0 | HuggingFace (fbaldassarri) |
| Minerva-7B-instruct-v1.0 AutoGPTQ INT4 gs128 sym | 7B (base) | INT4 gs128 simetrica (AutoGPTQ) | no disponible | Apache 2.0 | HuggingFace (fbaldassarri) |
| Minerva-7B-instruct-v1.0 AutoRound INT4 gs128 asym | 7B (base) | INT4 gs128 asimetrica (AutoRound) | no disponible | Apache 2.0 | HuggingFace (fbaldassarri) |

Los modelos comparables de la misma categoria son las distintas variantes de cuantizacion del propio Minerva-7B publicadas por el mismo autor (AutoAWQ, AutoGPTQ y AutoRound con distintos group sizes y simetria). No se dispone de datos de rendimiento comparativos entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision: la propia model card advierte de una "ligera perdida de precision" con la configuracion W4G64; no se cuantifica el impacto.
- Sesgos: no hay informacion sobre sesgos del modelo base ni sobre la composicion del dataset de entrenamiento, por lo que no pueden evaluarse sesgos especificos a partir de esta ficha.
- Alucinacion: al ser un modelo de lenguaje generativo, existe riesgo de alucinacion; no se aportan evaluaciones de fidelidad.
- Cobertura idiomatica: el modelo esta orientado principalmente al italiano, con ingles como idioma secundario; no se declara soporte para castellano ni otros idiomas.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar un uso fiable con entradas largas.
- Discrepancia de parametros: el recuento de safetensors del repositorio (1.415.319.552) no coincide con los 7B del modelo base, un artefacto habitual de las cuantizaciones weights-only empaquetadas; conviene verificarlo antes de dimensionar el despliegue.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye un aviso de que el modelo se ha desarrollado "solo con fines de investigacion" y se entrega sin garantia; conviene revisar la licencia del modelo base antes de un uso en produccion.
- Entorno de calibracion limitado: la cuantizacion se calibro con 128 muestras de 512 tokens y 200 iteraciones en CPU, lo que puede no representar todos los dominios de uso.
- Rendimiento en GPU: el artefacto esta optimizado para Intel CPU/iGPU/NPU; no se documenta su rendimiento en CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Variante AutoAWQ INT4 gs128 sym: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-autoawq-int4-gs128-sym
- Variante AutoGPTQ INT4 gs128 sym: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-autogptq-int4-gs128-sym
- Variante AutoRound INT4 gs128 asym: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-autoround-int4-gs128-asym
- Variante AutoRound INT4 gs128 sym (base): https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-autoround-int4-gs128-sym/tree/main
- auto-round-pipeline (receta de reproduccion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
