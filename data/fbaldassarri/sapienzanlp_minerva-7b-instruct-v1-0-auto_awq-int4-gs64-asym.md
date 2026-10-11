# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_awq-int4-gs64-asym

## Resumen

Este repositorio contiene una version cuantizada a 4 bits del modelo Minerva-7B-instruct-v1.0, un modelo de lenguaje conversacional desarrollado por SapienzaNLP (Sapienza University of Rome) y publicado originalmente en HuggingFace bajo licencia Apache 2.0. La cuantizacion ha sido realizada por el usuario fbaldassarri mediante la tecnologia Intel AutoRound v0.15.1, aplicando el algoritmo AWQ (Activation-aware Weight Quantization) en modo weights-only (WoQ), con 4 bits, tamano de grupo 64 y esquema asimetrico. El objetivo es reducir el peso en memoria y acelerar la inferencia entre 2 y 3 veces, con una perdida de precision descrita por el autor como "ligera".

El modelo base emplea una arquitectura tipo Mistral (model_type: mistral) y esta orientado a generacion de texto conversacional en italiano e ingles, con etiquetas que lo identifican como instruct/chat. Este artefacto concreto se ha optimizado para ejecutarse sobre hardware Intel: CPU Intel, iGPU Intel Arc (mediante intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (mediante OpenVINO). Por tanto, es una pieza pensada para despliegue en equipos con aceleracion Intel mas que en GPUs NVIDIA de gama alta.

Su relevancia actual radica en que permite ejecutar un modelo de 7.000 millones de parametros en equipos sin GPU dedicada, reduciendo el peso en disco del repositorio a 5,4 GB. Es un artefacto recien creado (octubre de 2026) con cero descargas y cero likes en el momento de la consulta, y su model card lo declara explicitamente como destinado solo a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: mistral) |
| Parametros totales | 1.415.319.552 segun metadatos de safetensors; el modelo base se denomina "7B" (discrepancia no aclarada en la informacion disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4, AWQ (AutoAWQ), group size 64, asimetrico (sym=false), WoQ |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Framework de cuantizacion | Intel AutoRound v0.15.1 |
| Modelo base | sapienzanlp/Minerva-7B-instruct-v1.0 |
| Tamano del repositorio | 5,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible describe exclusivamente el proceso de cuantizacion, no el entrenamiento del modelo base. El modelo original, Minerva-7B-instruct-v1.0, es obra de SapienzaNLP y su arquitectura se declara como tipo Mistral. No se detallan en esta ficha el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base, por lo que esos datos deben consultarse en la model card original de sapienzanlp/Minerva-7B-instruct-v1.0.

La innovacion tecnica de este repositorio es el procedimiento de cuantizacion. Se ha empleado Intel AutoRound 0.15.1 con el algoritmo AWQ, cargando el modelo en torch.bfloat16 sobre CPU, con 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia de calibracion de 512 y tamano de lote de 4. La cuantizacion se ejecuto en CPU con la version de torch 2.14.0+cpu y transformers 4.55.3, y tuvo una duracion registrada de 41.231,1 segundos (aproximadamente 687,2 minutos). El resultado es un checkpoint INT4 W4G64 asimetrico compatible con transformers, text-generation-inference y despliegue sobre aceleradores Intel.

## Capacidades

- Generacion de texto conversacional multi-turno en italiano e ingles, con plantilla de chat integrada (debe usarse `apply_chat_template` en lugar de prompts de texto plano).
- Modelo de tipo instruct/chat: sigue instrucciones y mantiene el rol de asistente.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: italiano e ingles como idiomas declarados en las etiquetas del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia optimizada para hardware Intel: CPU, iGPU Arc via intel-extension-for-pytorch y NPU AI Boost (Core Ultra) via OpenVINO.

## Casos de uso

- Asistente conversacional en italiano para atencion al cliente: al ser un modelo instruct con plantilla de chat nativa y soporte de los idiomas it/en, puede gestionar dialogos multi-turno en entornos de soporte tecnico italoparlantes, desplegado sobre CPU Intel sin necesidad de GPU.
- Despliegue en portatiles y mini-PC con Intel Core Ultra: gracias a la compatibilidad declarada con la NPU AI Boost via OpenVINO y con la iGPU Arc, permite ejecutar un modelo de 7B en local sobre equipos de oficina sin tarjeta grafica dedicada.
- Procesado de texto en el borde (edge computing) en entornos industriales o de fabrica: la cuantizacion INT4 y el bajo consumo de memoria permiten integrar el modelo en gateways con CPU Intel para tareas de clasificacion, resumen o extraccion de informacion.
- Generacion y resumen de documentacion tecnica bilingue it/en: util para equipos que trabajan con material en italiano e ingles y necesitan resumenes o reescritura sin enviar datos a servicios en la nube.
- Prototipado de asistentes virtuales en investigacion academica: el modelo se distribuye bajo Apache 2.0 y esta declarado para uso de investigacion, lo que facilita su uso en experimentos reproducibles con hardware modesto.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye la receta exacta de replicacion (auto-round-pipeline, parametros y versiones), por lo que sirve como referencia para estudiar el impacto de AWQ W4G64 asimetrico frente al modelo en bfloat16.
- Bases de chat especializadas en dominio italoparlante: al partir de Minerva, un modelo entrenado especificamente para italiano, puede adaptarse mediante ajuste fino adicional para sectores concretos (legal, sanitario, administracion publica) en Italia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una aceleracion de "2-3X" y una reduccion de memoria, con una "ligera" caida de precision en la configuracion W4G64, pero no aporta cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandarizada, ni mediciones de perplexity antes y despues de la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,4 GB en disco, por lo que se puede asumir un consumo de pesos de aproximadamente 4-5 GB en INT4, mas la memoria de la cache KV (no cuantificada en la informacion disponible).
- GPU NVIDIA: el formato AWQ es compatible con kernels de inferencia CUDA; el modelo puede caber en GPUs consumer con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En A100 y H100 cabe con holgura, aunque su proposito declarado no es el despliegue en centro de datos NVIDIA.
- Hardware Intel: soporte declarado para CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (via OpenVINO).
- Cabe en consumer GPU: si, en cualquier GPU con al menos 8 GB de VRAM, dado el tamano de pesos en INT4.
- Opciones de despliegue: transformers (uso directo con `AutoModelForCausalLM`), text-generation-inference (etiqueta declarada en el repositorio), vLLM con soporte AWQ, y entornos Intel via IPEX u OpenVINO. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa no incluida.
- Latencia y throughput: no disponibles. La model card solo indica un factor cualitativo de "2-3X speedup".

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_awq-int4-gs64-asym | 1.415.319.552 segun safetensors (base "7B") | INT4 AWQ gs64 asimetrico | No disponible | it, en | Apache 2.0 | HuggingFace, 0 descargas |
| sapienzanlp/Minerva-7B-instruct-v1.0 (modelo base) | ~7.000 millones (segun denominacion) | bfloat16 / FP16 | No disponible | it, en | Apache 2.0 | HuggingFace |
| Alternativas 7B cuantizadas a 4 bits (por ejemplo variantes AWQ o GPTQ de familias Mistral/Llama) | No disponible | INT4 | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del artefacto declara explicitamente que el modelo se ha desarrollado "solo para fines de investigacion" y se entrega sin garantia, pese a que la licencia subyacente sea Apache 2.0.
- La cuantizacion a 4 bits introduce una perdida de precision que el autor describe como "ligera", pero no cuantificada; no hay mediciones objetivas de degradacion.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente para italiano puede presentar sesgos culturales y linguisticos propios de ese corpus.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos de 7B; no se ha publicado ninguna evaluacion de fidelidad factual.
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar despliegues con conversaciones largas o documentos extensos.
- El soporte multilingue se limita a italiano e ingles; no hay evidencia de capacidades en castellano.
- Discrepancia de datos: los metadatos de safetensors indican 1.415.319.552 parametros, mientras que el modelo se denomina "7B"; conviene verificar el inventario real de pesos antes de dimensionar un despliegue en produccion.
- No se incluyen pesos GGUF, por lo que el uso en llama.cpp u Ollama requiere conversion adicional.
- El repositorio tiene cero descargas y cero likes, y su creacion y ultima actualizacion son del 10 de octubre de 2026, por lo que no existe validacion por parte de la comunidad.
- La model card incluye una receta de replicacion que referencia un repositorio Git externo (git.epicdynamic.com), no verificado en la informacion disponible.

## Enlaces

- HuggingFace (artefacto cuantizado): https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Repositorio auto-round-pipeline citado en la model card: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- La busqueda web realizada no devolvio enlaces relevantes al modelo; los resultados obtenidos trataban sobre construccion industrial de naves y almacenes y no guardan relacion con este artefacto.
