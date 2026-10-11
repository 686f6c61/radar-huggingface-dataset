# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym`, una version cuantizada a INT8 del modelo instructivo Falcon3-7B-Instruct desarrollado por el Technology Innovation Institute (TII). La cuantizacion ha sido realizada por el usuario fbaldassarri mediante la herramienta Intel AutoRound v0.15.1, aplicando el algoritmo GPTQ (AutoGPTQ) en modo weights-only quantization (WoQ), con 8 bits, tamano de grupo 64 y esquema asimetrico. El resultado es un checkpoint listo para inferencia en transformers con pesos safetensors.

El modelo base Falcon3-7B-Instruct es un transformer causal denso de aproximadamente 7.000 millones de parametros, con una longitud de contexto de hasta 32K tokens y soporte para cuatro idiomas (ingles, frances, espanol y portugues). Esta variante concreta esta etiquetada en HuggingFace unicamente con el idioma ingles (`en`), aunque hereda del base su poliglotia.

La relevancia de esta publicacion es fundamentalmente practica: ofrece un checkpoint INT8 optimizado para despliegue en hardware Intel (CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU AI Boost de la serie Core Ultra mediante OpenVINO), reduciendo el coste de memoria frente al modelo en bfloat16. El repositorio registra el valor de parametros totales en safetensors como 2.599.044.096, cifra que no coincide con el tamano nominal de 7B del modelo base y que probablemente refleja un conteo parcial o de un subconjunto de tensores; el tamano total del repositorio es de 10,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (model_type: llama) |
| Parametros totales | 7B (modelo base Falcon3-7B-Instruct); el repo safetensors reporta 2.599.044.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (segun el modelo base) |
| Tipos de cuantizacion | INT8 GPTQ (AutoGPTQ), group_size 64, asimetrico, weights-only quantization (WoQ) |
| Idiomas soportados | Etiquetado como `en`; el base soporta ingles, frances, espanol y portugues |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer causal denso de tipo Llama, correspondiente a la familia Falcon3 de TII. Esta variante no modifica la topologia del modelo base: la intervencion de Intel AutoRound se limita a la cuantizacion de pesos a 8 bits. El proceso de cuantizacion empleo `torch.bfloat16` como tipo de carga, un tamano de grupo de 64, esquema asimetrico (`sym: false`) y 128 muestras de calibracion con longitud de secuencia de 512, 200 iteraciones de ajuste y batch de 4, ejecutado en CPU. La duracion registrada del proceso fue de 49.417 segundos (aproximadamente 823 minutos).

No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO; la model card de esta publicacion se centra exclusivamente en la receta de cuantizacion. La innovacion tecnica destacable de esta ficha es el uso de Intel AutoRound, que optimiza los parametros de redondeo por grupo para minimizar la perdida de precision respecto a la cuantizacion GPTQ convencional, y la orientacion del artefacto a la aceleracion en hardware Intel.

## Capacidades

- Generacion de texto conversacional en formato instruct/chat mediante plantilla de chat propia.
- Razonamiento, comprension del lenguaje, seguimiento de instrucciones, generacion de codigo y matematicas (capacidades heredadas del modelo base Falcon3-7B-Instruct).
- Soporte multilingue del base: ingles, frances, espanol y portugues.
- Razonamiento multi-turno con ventanas de contexto de hasta 32K tokens.
- Inferencia optimizada en Intel CPU, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost de Core Ultra (OpenVINO).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Despliegue de asistentes conversacionales en servidores sin GPU dedicada: al ser una cuantizacion INT8 orientada a CPU Intel y NPU, permite ejecutar un modelo de 7B en equipos con Core Ultra sin tarjeta grafica, reduciendo coste de infraestructura.
- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32K tokens) usando su plantilla de chat, apropiado para historiales extensos de incidencias.
- Generacion de codigo asistida en entornos locales: el modelo base rinde bien en tareas de codigo y esta cuantizacion facilita su ejecucion en portatiles con hardware Intel, util para autocompletado y explicacion de fragmentos.
- Inferencia en el borde (edge computing): gracias al soporte de iGPU Arc y NPU via OpenVINO, es adecuado para aplicaciones embebidas o de fabrica que requieren procesamiento local de lenguaje sin enviar datos a la nube.
- Procesamiento de documentacion multilingue: aunque la etiqueta declare solo ingles, el base soporta espanol, frances y portugues, lo que permite resumir y extraer informacion de documentos en esos idiomas.
- Pipeline de prototipado rapido en investigacion: al estar en formato safetensors y ser cargable con transformers, sirve para evaluar el impacto de la cuantizacion INT8 en tareas de razonamiento antes de invertir en versiones de mayor precision.
- Servicio de generacion de texto con requisitos de privacidad: la ejecucion local en CPU/NPU evita el envio de prompts a servicios externos, util en entornos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 7-8 GB para los pesos INT8, mas la cache KV segun longitud de contexto; el repositorio ocupa 10,2 GB.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12GB, RTX 4070, RTX 4090); en GPUs de 8 GB el margen es ajustado segun contexto.
- Hardware Intel recomendado: CPU Intel, iGPU Arc (por ejemplo Core Ultra 185H) via intel-extension-for-pytorch, y NPU AI Boost de la serie Core Ultra via OpenVINO.
- GPU de datacenter: A100, H100 y similares soportadas para despliegue a mayor escala, aunque el foco del artefacto es el hardware Intel.
- Opciones de despliegue: transformers (formato nativo del repo), text-generation-inference (etiqueta presente), ecosistema GPTQ/AutoGPTQ; llama.cpp, Ollama y vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/...-auto_gptq-int8-gs64-asym (este) | 7B (base) | 32K | INT8 GPTQ gs64 asim | apache-2.0 | HuggingFace |
| fbaldassarri/...-autogptq-int8-gs128-asym | 7B (base) | 32K | INT8 GPTQ gs128 asim | falcon-llm-license (segun repo) | HuggingFace |
| tiiuae/Falcon3-7B-Instruct (base) | 7B | 32K | bfloat16 (sin cuantizar) | falcon-llm-license | HuggingFace, Qualcomm AI Hub |
| fbaldassarri/...-autoround-int8-gs128-asym | 7B (base) | 32K | INT8 AutoRound gs128 asim | no disponible | Friendli.ai |

Nota: los datos de contexto y parametros de los modelos base provienen de la informacion de busqueda sobre Falcon3-7B-Instruct; los detalles exactos de licencia de las variantes cuantizadas pueden diferir del modelo base y conviene verificarlos en cada repositorio.

## Limitaciones y advertencias

- El artefacto se declara con fines exclusivamente de investigacion y sin garantia por parte del autor de la cuantizacion.
- La cuantizacion INT8 introduce una perdida de precision respecto al modelo en bfloat16; el impacto real en tareas de razonamiento no esta cuantificado con benchmarks publicados.
- El repositorio registra cero descargas y cero likes, por lo que no existe validacion de la comunidad ni evidencia de robustez en produccion.
- El conteo de parametros reportado en safetensors (2.599.044.096) no concuerda con el tamano nominal de 7B del modelo base, lo que conviene verificar antes de estimar requisitos de memoria.
- La model card etiqueta el idioma como `en` unicamente; el soporte de espanol, frances y portugues procede del modelo base y no esta garantizado en esta variante cuantizada.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; no hay informacion especifica sobre sesgos evaluados en esta cuantizacion.
- Licencia apache-2.0 en esta variante, pero el modelo base Falcon3 puede estar sujeto a la falcon-llm-license; se recomienda revisar los terminos aplicables al uso comercial.
- La model card del autor de la cuantizacion no documenta soporte de tool calling ni de agentes; estas capacidades deben validarse experimentalmente.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Variante gs128: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autogptq-int8-gs128-asym
- Variante autoround gs128 en Friendli: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autoround-int8-gs128-asym
- Falcon3-7B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/falcon_v3_7b_instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
