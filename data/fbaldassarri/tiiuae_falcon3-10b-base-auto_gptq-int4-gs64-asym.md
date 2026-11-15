# fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int4-gs64-asym

## Resumen

Este repositorio contiene una version cuantizada a 4 bits del modelo Falcon3-10B-Base, desarrollado originalmente por el Technology Innovation Institute (TII) de Abu Dabi. La cuantizacion la ha realizado el usuario independiente fbaldassarri mediante la herramienta Intel AutoRound (v0.16.1) con el algoritmo AutoGPTQ, aplicando cuantizacion de solo pesos (WoQ) en INT4 con tamano de grupo 64 y esquema asimetrico. El objetivo es reducir el coste de memoria y aumentar la velocidad de inferencia (el autor afirma una aceleracion de 2-3 veces) a cambio de una ligera perdida de precision.

El modelo base es un transformer causal de tipo llama con aproximadamente 10.000 millones de parametros en su version original; sin embargo, el dato real de parametros almacenados en este repositorio cuantizado es de 2.161.720.320, coherente con el empaquetado INT4 de los pesos. Esta pensado como modelo de completacion (base, sin ajuste instructivo), por lo que se le debe alimentar con texto directo y no con plantillas de dialogo.

La relevancia de esta ficha radica en que la cuantizacion esta optimizada explicitamente para hardware Intel: CPU, iGPU Arc (via intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (via OpenVINO). El repositorio tiene cero descargas y cero likes en el momento de la consulta, y su model card incluye la receta exacta de replicacion, lo que lo convierte en un artefacto util para quien quiera reproducir el proceso de cuantizacion mas que para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama) |
| Parametros totales | 2.161.720.320 almacenados en el repo cuantizado (modelo base original: 10.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4, solo pesos (WoQ), grupo 64, asimetrica (sym: false), via AutoGPTQ / Intel AutoRound 0.16.1 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; config de cuantizacion auto_gptq) |

## Arquitectura y entrenamiento

El modelo subyacente es Falcon3-10B-Base, un transformer causal de la familia Falcon3 de TII, con arquitectura declarada como llama en la configuracion de este repositorio. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base; esa informacion corresponde al repositorio original de TII, no a esta ficha. Al ser una version Base, no ha recibido ajuste instructivo adicional.

La innovacion tecnica de este artefacto es el proceso de cuantizacion: AutoRound v0.16.1 con el algoritmo AutoGPTQ, calibrado sobre 128 muestras, 200 iteraciones de tuning, longitud de secuencia 512 y batch size 4, ejecutado en CPU con `torch.bfloat16` y `torch 2.15.0+cpu` / `transformers 4.55.3`. La duracion registrada del proceso fue de 52.067,9 segundos (867,8 minutos). El resultado es un checkpoint INT4 empaquetado en safetensors con configuracion auto_gptq, pensado para inferencia en hardware Intel mediante intel-extension-for-pytorch y OpenVINO.

## Capacidades

- Generacion de texto autoregresiva y completacion de texto (modelo base, sin instrucciones).
- Razonamiento y conocimiento general heredado del modelo base Falcon3-10B-Base (no se documentan evaluaciones especificas en este repo).
- Generacion de codigo y matematicas: capacidad presumible del modelo base, no verificada en esta cuantizacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles (en).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia optimizada en CPU Intel, iGPU Arc y NPU AI Boost de la serie Core Ultra.

## Casos de uso

- Completacion de texto en local sobre CPU Intel: el checkpoint INT4 permite ejecutar el modelo en equipos sin GPU dedicada, usando intel-extension-for-pytorch para completar prompts de forma interactiva con un consumo de memoria reducido.
- Prototipos de generacion en portatiles con Core Ultra: gracias al soporte de NPU via OpenVINO, se puede desplegar el modelo en dispositivos con AI Boost para tareas de autocompletado o generacion de borradores sin depender de la nube.
- Reproduccion de pipelines de cuantizacion: la model card incluye la receta exacta (auto-round-pipeline, versiones fijadas, parametros de calibracion), lo que permite usar este repo como referencia para validar procesos de cuantizacion INT4 con AutoRound.
- Investigacion sobre calidad de cuantizacion: al ser un artefacto INT4 de un modelo de 10.000 millones, sirve para medir la degradacion de precision frente al modelo base en tareas de perplejidad o generacion.
- Fine-tuning posterior sobre pesos cuantizados: el formato safetensors con config auto_gptq permite cargar el modelo con transformers y evaluar tecnicas de adaptacion (por ejemplo, LoRA) sobre una base cuantizada.
- Generacion de texto por lotes en entornos con memoria limitada: el tamano de repo de 8,4 GB permite alojar el checkpoint en maquinas con poca VRAM o RAM, habilitando tareas de generacion offline o procesamiento por lotes de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una aceleracion de 2-3 veces y una ligera caida de precision en la configuracion W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni perplejidad.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 8,4 GB en safetensors; la inferencia INT4 requiere aproximadamente esa cifra mas overhead de activaciones y cache KV, por lo que conviene disponer de al menos 10-12 GB de memoria combinada.
- GPU recomendadas: no se especifican en la model card; el artefacto esta orientado a hardware Intel (CPU, iGPU Arc, NPU AI Boost) y no documenta soporte optimizado para A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas de VRAM, aunque el rendimiento optimizado declarado es para hardware Intel.
- Opciones de despliegue: transformers con auto_gptq, intel-extension-for-pytorch (CPU e iGPU Arc), OpenVINO (NPU AI Boost). La model card no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se declara una aceleracion de 2-3 veces frente a la version sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int4-gs64-asym | 10.000 millones (2.161.720.320 almacenados) | no disponible | INT4 WoQ, grupo 64, asimetrica | Apache 2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Base | 10.000 millones | no disponible en esta ficha | BF16 original | Apache 2.0 | Hugging Face (modelo base) |
| Otras cuantizaciones INT4 de Falcon3-10B-Base | 10.000 millones | no disponible | INT4 (GPTQ/AWQ) | Apache 2.0 | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones ni mantiene dialogos; debe usarse con prompts de completacion.
- Perdida de precision por cuantizacion: el autor reconoce una ligera caida de precision en W4G64, sin cuantificar.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se documentan mitigaciones.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad.
- Soporte de hardware: optimizado para Intel (CPU, iGPU Arc, NPU); el rendimiento en GPU NVIDIA/AMD no esta garantizado por el autor.
- Madurez del artefacto: 0 descargas y 0 likes, creado en noviembre de 2026, sin validacion comunitaria; el autor declara que se desarrollo solo con fines de investigacion y sin garantia.
- La receta de replicacion apunta a un repositorio externo (git.epicdynamic.com), no a un repositorio oficial de Intel.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y este checkpoint no ofrecen garantias de calidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Base
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicacion: https://git.epicdynamic.com/auto-round-pipeline
