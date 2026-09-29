# mirsalehsalayev7/novashop-support-lora

## Resumen

novashop-support-lora es un adaptador LoRA publicado en HuggingFace por el usuario mirsalehsalayev7. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit, es decir, una version cuantizada a 4 bits de meta-llama-3.1-8b-instruct preparada por Unsloth. El repositorio ocupa 0,2 GB, un tamano coherente con un adaptador de bajo rango y no con un modelo completo, por lo que para usarlo es imprescindible descargar aparte los pesos del modelo base.

El nombre del adaptador sugiere un caso de uso de atencion al cliente para una tienda ("novashop support"), aunque la model card publicada es la plantilla generica de HuggingFace sin rellenar: todos los campos de descripcion, datos de entrenamiento, evaluacion, licencia e idiomas aparecen como "[More Information Needed]". No hay descargas ni "likes" registrados en el momento de redactar esta ficha, y no se ha publicado ninguna evaluacion.

Su relevancia es principalmente como ejemplo del flujo de trabajo habitual de la comunidad: adaptar un modelo abierto de 8B mediante LoRA con Unsloth y TRL para un dominio vertical concreto, con un coste de entrenamiento bajo y un artefacto final de apenas unos cientos de MB. No obstante, la ausencia total de documentacion, de licencia declarada y de resultados limita seriamente su uso en produccion sin una validacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptador LoRA de PEFT |
| Parametros totales | 8.030 millones en el modelo base; el numero de parametros del adaptador no esta disponible (repo de 0,2 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens en el modelo base (no declarado en la tarjeta del adaptador) |
| Tipos de cuantizacion | El modelo base indicado esta en 4 bits (bitsandbytes); el adaptador se distribuye en safetensors. No se declaran otras cuantizaciones |
| Idiomas soportados | No disponible (el modelo base Llama 3.1 cubre oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible. El modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y codificacion posicional RoPE, con 8.030 millones de parametros y una ventana de contexto de 128.000 tokens. El campo base_model de la tarjeta apunta a la variante de Unsloth cuantizada a 4 bits, lo que indica que el ajuste se realizo sobre pesos ya cuantizados.

Por las etiquetas del repositorio (lora, sft, trl, unsloth, peft) se deduce que el entrenamiento consistio en un ajuste fino supervisado con la libreria TRL sobre el stack de Unsloth, y que los pesos resultantes estan en formato PEFT 0.20.0. No hay ningun dato publicado sobre el conjunto de datos utilizado, el numero de tokens vistos, la composicion del corpus, la longitud de las secuencias, los hiperparametros (rango, alpha, dropout, learning rate, epocas) ni sobre si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional, decodificacion especulativa ni variante de atencion.

## Capacidades

La tarjeta no documenta capacidades explicitas. Las siguientes se derivan del modelo base y deben considerarse inferencias a validar por el usuario, no caracteristicas confirmadas del adaptador:

- Generacion de texto conversacional multi-turno, con el registro propio de un asistente de atencion al cliente.
- Comprension y generacion en los idiomas cubiertos por Llama 3.1, incluido el espanol, aunque el idioma real del ajuste es desconocido.
- Razonamiento basico y respuesta a preguntas sobre politicas de tienda, pedidos y productos, en la medida en que el corpus de ajuste lo cubra.
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct, supeditado a que el ajuste no haya degradado el formato de plantilla de chat original.
- Encadenamiento de varios pasos y uso como componente de un agente, siempre que se conserve el formato de mensajes del modelo base.
- No hay evidencia de capacidades de vision, audio, modo de razonamiento explicito ni generacion de codigo especializada.

## Casos de uso

- Atencion al cliente automatizada en tienda online: el adaptador puede gestionar conversaciones multi-turno sobre pedidos, devoluciones y envios, aprovechando la ventana de 128.000 tokens del modelo base para arrastrar el historial completo de la sesion y el contexto del catalogo.
- Clasificacion y enrutado de tickets: uso del modelo para etiquetar la intencion de un mensaje entrante y derivarlo al departamento correspondiente, con la ventaja de que un adaptador de 0,2 GB se puede servir junto a otros adaptadores sobre el mismo modelo base.
- Respuestas a preguntas frecuentes sobre politicas de envio y devolucion: ajuste orientado a un corpus cerrado de preguntas y respuestas reduce la variabilidad de las respuestas frente a un modelo generalista.
- Generacion de correos de seguimiento postventa: redaccion de mensajes personalizados a partir del estado del pedido y del historial de incidencias del cliente.
- Asistencia al agente humano en tiempo real: sugerencia de respuestas dentro de un panel de operador, con el modelo actuando como copiloto y no como interlocutor final.
- Prototipado rapido de asistentes verticales: por su tamano reducido, el adaptador sirve para validar en pocas horas si un dominio concreto justifica un despliegue mayor antes de invertir en un ajuste completo.
- Experimentacion academica con PEFT: reproduccion de un pipeline LoRA + SFT + Unsloth sobre Llama 3.1 8B en una sola GPU, util como referencia docente o como plantilla de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada ni metricas de MMLU, HumanEval, GSM8K u otros conjuntos. Tampoco se han encontrado evaluaciones de terceros en los resultados de busqueda.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del modelo base Llama 3.1 8B, no datos publicados por el autor:

- El repositorio contiene solo el adaptador (0,2 GB). Es obligatorio descargar el modelo base para poder inferir.
- Inferencia en 4 bits: aproximadamente 5 a 6 GB de VRAM, suficiente para tarjetas consumer como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070.
- Inferencia en fp16 o bf16: entre 16 y 18 GB de VRAM, lo que exige RTX 4090, RTX 3090, A100 40 GB, L40S o H100.
- Entrenamiento del adaptador: viable en una unica GPU consumer de 12 a 24 GB gracias a la cuantizacion a 4 bits y al uso de Unsloth, que reduce el consumo de memoria del ajuste.
- Opciones de despliegue: transformers con PEFT, vLLM con soporte de adaptadores LoRA, TGI, llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| mirsalehsalayev7/novashop-support-lora | Adaptador sobre 8B | 128.000 tokens (base) | No disponible | HuggingFace, 0 descargas | Objeto de esta ficha |
| alimalirzayev/novashop-support-lora | Adaptador sobre 8B | No disponible | No disponible | HuggingFace | Repositorio con identico nombre y mismas etiquetas; probable duplicado o copia |
| Valibayov/novashop-support-lora | Adaptador sobre 8B | No disponible | No disponible | HuggingFace | Repositorio con identico nombre y mismas etiquetas; probable duplicado o copia |
| amina0204/novashop-support-lora | Adaptador sobre 8B | No disponible | No disponible | HuggingFace (indexado en LLM Explorer) | Repositorio con identico nombre; probable duplicado o copia |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 millones | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Modelo base sin ajustar; tiene evaluaciones publicas y soporte extendido |

No se dispone de comparativas de rendimiento frente a otros adaptadores de atencion al cliente porque no existe ninguna evaluacion publicada de este modelo.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- La licencia no esta declarada en el repositorio, lo que genera incertidumbre juridica para uso comercial. Ademas, al derivar de Llama 3.1, se heredan las restricciones de la Llama 3.1 Community License, incluida la clausula de licencia adicional para empresas con mas de 700 millones de usuarios mensuales.
- No hay resultados de evaluacion, por lo que no se puede cuantificar la tasa de alucinacion ni la fidelidad a las politicas de la tienda.
- El conjunto de datos de ajuste es desconocido: podria contener sesgos de dominio, ejemplos sinteticos o informacion desactualizada de precios y politicas.
- El idioma real del ajuste no esta declarado. Un adaptador entrenado predominantemente en un idioma puede degradar el rendimiento del modelo base en otros.
- El repositorio tiene cero descargas, cero "likes" y fue creado y actualizado con siete segundos de diferencia, lo que sugiere un artefacto sin validacion por parte de la comunidad.
- La existencia de al menos tres repositorios con el mismo nombre bajo cuentas distintas apunta a plantillas o copias, lo que complica identificar la version canonica.
- Al ser un adaptador, cualquier despliegue depende de la disponibilidad y los cambios del modelo base de Unsloth; una actualizacion de dicho base puede romper la compatibilidad.
- No hay garantia de que el formato de chat de Llama 3.1 se haya preservado tras el ajuste, algo critico si se va a usar en agentes o con tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mirsalehsalayev7/novashop-support-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio homonimo de alimalirzayev: https://huggingface.co/alimalirzayev/novashop-support-lora
- Repositorio homonimo de Valibayov: https://huggingface.co/Valibayov/novashop-support-lora
- Ficha en LLM Explorer de amina0204/novashop-support-lora: https://llm-explorer.com/model/amina0204%2Fnovashop-support-lora,7kGJxLCqo1Wjb2vg631Zsp
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact#compute
