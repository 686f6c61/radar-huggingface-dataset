# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_round-int4-gs64-asym

## Resumen

Esta ficha describe `fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_round-int4-gs64-asym`, una version cuantizada a 4 bits del modelo italiano `sapienzanlp/Minerva-7B-instruct-v1.0`, publicado por el usuario fbaldassarri. No se trata de un modelo nuevo: es un artefacto de compresion generado con Intel AutoRound v0.15.1 que reduce el peso del modelo original para permitir inferencia con mucha menos memoria y con una aceleracion declarada de 2-3x respecto al modelo en coma flotante.

El modelo subyacente, Minerva-7B-instruct-v1.0, lo desarrolla SapienzaNLP (grupo de procesamiento de lenguaje natural de la Universidad de La Sapienza, Roma) y esta construido sobre la arquitectura Mistral, con alrededor de 7.000 millones de parametros. Es un modelo causal decoder-only afinado para instrucciones, con soporte declarado de italiano e ingles. Minerva forma parte de una familia de LLM orientada especificamente al italiano dentro del ecosistema open source, lo que lo diferencia de las adaptaciones multilingues genericas.

Su relevancia practica es doble. Por un lado, permite ejecutar un modelo de 7B en hardware modesto: CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch y NPU Intel (AI Boost de la serie Core Ultra) mediante OpenVINO, escenarios donde un modelo en bfloat16 seria inviable. Por otro lado, sirve como referencia reproducible de un pipeline de cuantizacion (Weights-Only Quantization, esquema SignRound) documentado paso a paso en la propia model card. Conviene senalar que el repositorio no ha publicado resultados de benchmarks y que acumula 0 descargas y 0 likes, por lo que se trata de un artefacto sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only basada en Mistral (`model_type: mistral`) |
| Parametros totales | 7B nominales (modelo base Minerva-7B-instruct-v1.0); el conteo real de safetensors del repo cuantizado es 1.415.319.552, cifra derivada del empaquetado de los pesos INT4 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (4 bits), group size = 64, asimetrica (`sym: false`), WoQ con algoritmo AutoRound / SignRound |
| Idiomas soportados | italiano (it) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato `auto_round`, cargable con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer causal decoder-only de tipo Mistral, con atencion por ventanas deslizantes y cache KV, segun la configuracion publicada por SapienzaNLP. Este repositorio no modifica la topologia ni el entrenamiento original; unicamente sustituye los pesos en punto flotante por pesos cuantizados a 4 bits. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros) del modelo original.

La innovacion tecnica de este artefacto es el metodo de cuantizacion. Se aplica Weights-Only Quantization con el algoritmo AutoRound de Intel (variante SignRound), que ajusta los parametros de redondeo mediante optimizacion en lugar de usar redondeo por proximidad. La receta exacta registrada es: 4 bits, group size 64, cuantizacion asimetrica, calibracion sobre 128 muestras con longitud de secuencia 512 y batch de 4, 200 iteraciones de tuning, carga en `torch.bfloat16` y calibracion en CPU. El proceso completo tardo 40.332,3 segundos (672,2 minutos) y se ejecuto con `transformers` 4.55.3 y `torch` 2.14.0+cpu. La model card advierte de una ligera perdida de precision en la configuracion W4G64.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones en formato chat, con plantilla de chat integrada (`apply_chat_template`).
- Razonamiento y conocimiento general heredados del modelo base de 7B, en italiano e ingles.
- Generacion de codigo y tareas textuales genericas: no hay datos especificos que cuantifiquen su rendimiento tras la cuantizacion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas a italiano e ingles segun los metadatos del repositorio; el castellano no figura como idioma soportado.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponibles.
- Inferencia de bajo consumo en CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra con AI Boost), que es el escenario para el que se construyo esta cuantizacion.

## Casos de uso

- Atencion al cliente en italiano: el modelo esta afinado para instrucciones y mantiene el tono conversacional en italiano, por lo que puede gestionar dialogos multi-turno con plantilla de chat en despliegues donde el coste de GPU es un factor limitante.
- Asistente local en portatiles y equipos sin GPU dedicada: al ocupar aproximadamente 5 GB en disco y calibrarse para CPU, puede ejecutarse integramente en local mediante `transformers` con `device_map="auto"`, lo que resulta util para entornos con requisitos estrictos de privacidad de datos.
- Inferencia en hardware Intel especifico: la model card indica soporte de Intel Arc via intel-extension-for-pytorch y de la NPU de Core Ultra via OpenVINO, lo que habilita asistentes embebidos en equipos de sobremesa y portatiles de ultima generacion.
- Generacion aumentada por recuperacion (RAG) sobre documentacion en italiano: el modelo puede actuar como generador final de respuestas condicionadas a fragmentos recuperados, siempre que el contexto recuperado quepa en la ventana soportada por el modelo base.
- Traduccion asistida italiano-ingles y viceversa: es una de las pocas tareas bilingues directamente cubiertas por los idiomas declarados del modelo.
- Resumen, clasificacion y reescritura de documentos en italiano: tareas de procesamiento de lenguaje natural que se benefician de la reduccion de coste por token que aporta la cuantizacion INT4.
- Experimentacion academica sobre cuantizacion: el repositorio documenta la receta completa de replicacion, incluidos versiones de librerias, hiperparametros de calibracion y tiempos de ejecucion, lo que lo convierte en un caso de estudio reproducible para comparar esquemas de cuantizacion.
- Prototipado rapido de aplicaciones en italiano: al ser un artefacto ligero con licencia Apache 2.0, permite validar producto antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una aceleracion de 2-3x respecto al modelo sin cuantizar y una "ligera caida de precision" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. No se deben asumir los resultados del modelo base como equivalentes a los de esta version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con pesos INT4 (el repositorio ocupa 5,4 GB), mas el overhead de cache KV, que crece con la longitud de contexto.
- Tamano en disco: 5,4 GB en safetensors.
- GPU compatibles: cualquier GPU con 8 GB o mas de VRAM puede alojar el modelo en precision de almacenamiento INT4, aunque el artefacto esta optimizado explicitamente para CPU Intel, iGPU Intel Arc y NPU Intel. Para GPU NVIDIA no se documenta un kernel especifico en esta model card.
- ¿Cabe en GPU de consumo? Si, el modelo cuantizado de 7B a 4 bits es desplegable en tarjetas consumer de 8 GB o mas. No se especifican modelos concretos de GPU en la documentacion disponible.
- Opciones de despliegue: `transformers` (receta incluida en la model card), intel-extension-for-pytorch para CPU y Arc, OpenVINO para NPU, y el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla la configuracion. No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no estan soportados por este repositorio.
- Latencia y throughput: no disponibles. La unica referencia cuantitativa es el factor de aceleracion de 2-3x declarado por el autor.
- Nota: los metadatos incluyen `inference: false`, lo que puede afectar a la deteccion automatica del modelo en algunas herramientas.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (auto_round-int4-gs64-asym) | INT4, group 64, asimetrica, AutoRound | 7B nominales | no disponible | Apache 2.0 | Orientado a CPU Intel, iGPU Arc y NPU; 2-3x de aceleracion declarada |
| fbaldassarri autoawq-int4-gs128-asym | INT4, group 128, asimetrica, AutoAWQ | 7B nominales (modelo base, no instruct) | no disponible | no disponible en la informacion | Variante sobre el modelo base, no sobre el instruct |
| fbaldassarri autogptq-int8-gs128-asym | INT8, group 128, asimetrica, AutoGPTQ | 7B nominales | no disponible | no disponible en la informacion | Menos compresion que INT4; cuantizado con torch.float32 |
| sapienzanlp/Minerva-7B-instruct-v1.0 | Sin cuantizar (bf16) | 7B | no disponible | Apache 2.0 (segun el repositorio cuantizado) | Modelo de referencia; mayor precision, mayor huella de memoria |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estas variantes.

## Limitaciones y advertencias

- Idiomas: solo italiano e ingles. No hay soporte declarado de castellano, lo que limita su uso en productos dirigidos al mercado hispanohablante.
- Perdida de precision: la propia model card reconoce una caida de exactitud con W4G64 respecto al modelo sin cuantizar. No se cuantifica esa perdida, por lo que cualquier despliegue en produccion deberia validarse con un conjunto de evaluacion propio.
- Riesgo de alucinacion: inherente a los modelos de 7B, y potencialmente incrementado por la cuantizacion agresiva. No se aportan datos de tasas de alucinacion.
- Contexto: la longitud de contexto no esta documentada en la informacion proporcionada, por lo que no se puede garantizar el comportamiento en conversaciones largas ni calcular con precision la memoria de la cache KV.
- Licencia: el repositorio declara Apache 2.0, que permite uso comercial. Sin embargo, la propia model card incluye un descargo que indica que el modelo se ha desarrollado "solo con fines de investigacion" y sin garantia. Conviene revisar esta discrepancia antes de un uso comercial.
- Trazabilidad: el cuantizador es un tercero (fbaldassarri), no SapienzaNLP. Los posibles errores de cuantizacion no son responsabilidad del autor del modelo original.
- Madurez: 0 descargas y 0 likes en el momento de redactar esta ficha; no hay evidencia de uso en produccion ni validacion independiente.
- Compatibilidad: al no publicarse pesos GGUF, no es desplegable directamente en llama.cpp u Ollama. El flag `inference: false` en los metadatos puede provocar que algunas herramientas no lo detecten como modelo listo para inferencia.
- Rendimiento en GPU: no se documentan kernels optimizados para NVIDIA o AMD; la aceleracion declarada se refiere a la ruta de hardware Intel.

## Enlaces

- Repositorio cuantizado en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Documentacion tecnica de Minerva: https://minerva-ai.org/en/docs/tech-page
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Pipeline de replicacion citado en la model card: https://git.epicdynamic.com/auto-round-pipeline
- Variante INT8 con AutoGPTQ del mismo autor: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-autogptq-int8-gs128-asym
- Ficha del modelo en Microsoft Foundry: https://ai.azure.com/catalog/models/sapienzanlp-minerva-7b-instruct-v1.0
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
