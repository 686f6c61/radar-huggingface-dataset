# HongbangYuan/Qwen3.5-4B-SciWorld-SFT-2ep

## Resumen

Qwen3.5-4B-SciWorld-SFT-2ep es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-4B, publicado por el usuario HongbangYuan. Se trata de un checkpoint de la epoca 2 (paso de optimizador 66) de una ejecucion de SFT de dos epocas, entrenado sobre demostraciones de pensamiento y accion del entorno ScienceWorld. No es un adaptador LoRA, sino un modelo completo con pesos safetensors en BF16.

El modelo resuelve un problema muy concreto: producir texto de tipo thought-and-action para interactuar con el entorno de simulacion cientifica ScienceWorld, de cara a un calentamiento previo a un futuro ciclo de aprendizaje por refuerzo. El entrenamiento usa 200 trayectorias de entorno, 8.423 ejemplos a nivel de paso y 19 categorias de tareas L2 de SciWorld, con la torre de vision y el proyector multimodal congelados y supervision unicamente sobre el texto de asistente.

Su relevancia es acotada pero clara: es un artefacto de investigacion para pipelines de agentes con RL, no un modelo de proposito general. El checkpoint hereda del modelo base la pila hibrida de 32 capas con bloques Gated DeltaNet y Gated Attention descrita para Qwen3.5-4B, con 4.539.265.536 parametros y licencia Apache 2.0. No se publican resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con torre de vision, pila hibrida de 32 capas con Gated DeltaNet y Gated Attention (heredada del modelo base Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso una longitud maxima de secuencia de 8.192 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se incluyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible para este checkpoint; la documentacion de Qwen3.5-4B recogida en catalogos de terceros menciona soporte de 201 idiomas en el modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), con configuracion, tokenizer, configuracion de procesador y plantilla de chat; no es un adaptador LoRA |
| Modelo base | Qwen/Qwen3.5-4B (relacion: finetune) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 9,1 GB |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B: un modelo de lenguaje causal post-entrenado con codificador de vision, que segun la ficha del catalogo de Microsoft Foundry emplea una pila hibrida de 32 capas con bloques Gated DeltaNet y Gated Attention, admitiendo entradas de texto e imagen. En este checkpoint concreto, el ajuste se hizo con LLaMA-Factory mediante SFT completo sobre texto, manteniendo congelados la torre de vision y el proyector multimodal. La atencion usa SDPA y el entrenamiento distribuido se hizo con DeepSpeed ZeRO-3.

Los datos de entrenamiento provienen del dataset HongbangYuan/sciworld_sft_warmup (revision `ae9ef19dfcf2f233a07081dd6d927993ce894441`), subconjunto `gold200_astra_v1`: 200 trayectorias de entorno, 8.423 ejemplos a nivel de paso y 19 categorias de tareas de entrenamiento L2 de SciWorld. La supervision cubre pensamiento y accion del asistente, con los tokens de prompt enmascarados en la perdida. La configuracion es de 2 epocas y 66 pasos de optimizador, con 4 GPU, batch por dispositivo 1, acumulacion de gradiente 64, batch global efectivo 256, tasa de aprendizaje 1e-5, scheduler coseno con warm-up del 0,1, weight decay 0,01, semilla 0 y precision BF16. No se aplico packing ni train_on_prompt, y la plantilla de chat es `qwen3_5` con `enable_thinking=true`. El autor indica explicitamente que este checkpoint no incluye actualizaciones posteriores de RL.

## Capacidades

- Generacion de texto de pensamiento y accion (thought-and-action) orientada a la interaccion con el entorno ScienceWorld.
- Ejecucion de tareas de agente paso a paso en un entorno simulado de tareas cientificas.
- Modo de razonamiento explicito, heredado de la plantilla `qwen3_5` con `enable_thinking=true`.
- Entrada multimodal texto-imagen a nivel de pipeline, aunque la torre de vision permanece congelada y el SFT se hizo solo sobre texto.
- Soporte de conversaciones multi-turno mediante plantilla de chat compatible con Transformers.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas y vision: no documentadas para este checkpoint.
- Capacidades multilingues: no documentadas para este checkpoint (el dataset de SFT es de ScienceWorld, entorno en ingles).
- Modo thinking: si, segun la plantilla de chat declarada en el repositorio.

## Casos de uso

- Calentamiento previo a RL para agentes cientificos: el checkpoint sirve como inicializacion de un ciclo de aprendizaje por refuerzo sobre ScienceWorld, ya que fue entrenado especificamente como punto de partida y no como modelo final.
- Investigacion en imitacion de demostraciones de agente: con 8.423 ejemplos a nivel de paso supervisados en pensamiento y accion, permite estudiar como se comporta un modelo de 4,54 B al imitar trayectorias expertas en 19 categorias de tareas L2.
- Evaluacion de tecnicas de enmascarado de perdida en SFT de agentes: al estar los tokens de prompt enmascarados, es un caso de referencia para comparar pipelines de entrenamiento de agentes con LLaMA-Factory y DeepSpeed ZeRO-3.
- Reproduccion de experimentos de SFT a escala pequena: con 2 epocas y 66 pasos de optimizador sobre 4 GPU, es un ejemplo reproducible de coste bajo para validar configuraciones antes de tiradas mayores.
- Generacion de trazas de razonamiento para anotacion: el modelo puede producir planes y acciones que un investigador revise manualmente para construir nuevos datos de entrenamiento en dominios cientificos simulados.
- Prototipado de bucles de agente con plantilla de chat compatible: al cargarse con Transformers y conservar la plantilla `qwen3_5`, se integra en arneses de evaluacion que conectan el modelo con un simulador externo.
- Estudio de transferencia desde un modelo multimodal congelado: permite medir cuanto de la capacidad del modelo base se conserva cuando solo se ajusta el tronco de texto y se congelan vision y proyector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito para este checkpoint y que el exito en tareas debe evaluarse dentro del entorno ScienceWorld previsto, que no se incluye en el repositorio.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 9,1 GB (4,54 B de parametros a 2 bytes), por lo que se necesitan del orden de 10-12 GB considerando cache KV a 8.192 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5 GB de pesos mas cache, del orden de 6-8 GB en total (requiere cuantizacion propia, ya que el repositorio no publica variantes cuantizadas).
- VRAM estimada en cuantizacion de 4 bits: alrededor de 3 GB de pesos, del orden de 4-6 GB con contexto largo.
- GPU recomendadas: cualquier GPU con 16 GB o mas para BF16 (RTX 4090, RTX 4080, A100 40 GB, H100). Para entrenamiento, el autor uso 4 GPU con ZeRO-3.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 4080 (16 GB) en BF16; en tarjetas de 8 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: Transformers con una version que soporte `qwen3_5` / `Qwen3_5ForConditionalGeneration`, vLLM, TGI y DeepSpeed para entrenamiento. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles.
- Nota de compatibilidad: el repositorio esta marcado como `endpoints_compatible` y requiere preservar la plantilla de chat proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HongbangYuan/Qwen3.5-4B-SciWorld-SFT-2ep | 4,54 B | No disponible (entrenado a 8.192 tokens) | Texto para thought-and-action; pipeline image-text-to-text con vision congelada | Apache 2.0 | Hugging Face, pesos safetensors completos |
| Qwen/Qwen3.5-4B (modelo base) | 4,54 B | No disponible | Texto e imagen | Apache 2.0 | Hugging Face, modelo oficial |
| Qwen3.5-397B-A17B (Qwen3.5-Plus) | No disponible en la informacion recogida | No disponible | Multimodal nativo | No disponible en la informacion recogida | Hugging Face, modelo oficial |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad. Alternativas de la misma categoria (modelos de ~4 B ajustados para agentes en entornos simulados): no disponible.

## Limitaciones y advertencias

- Ambito de uso muy restringido: el checkpoint esta entrenado para producir pensamiento y accion en ScienceWorld y no para conversacion general ni para otras tareas.
- Sin datos de evaluacion: el autor no reclama ninguna tasa de exito ni publica benchmarks, por lo que el rendimiento real en tareas es desconocido.
- Entorno no incluido: el repositorio no contiene el entorno ScienceWorld ni su JAR, de modo que la evaluacion exige montar la infraestructura por separado.
- Vision congelada: aunque el pipeline es image-text-to-text, la torre de vision y el proyector no se ajustaron, por lo que no hay garantia de buen comportamiento en tareas visuales especificas.
- Riesgo de alucinacion: al ser un modelo de 4,54 B ajustado sobre una muestra pequena (200 trayectorias, 8.423 ejemplos), puede generar acciones no validas o razonamientos plausibles pero incorrectos respecto al estado del entorno.
- Limitacion de datos: el subconjunto de entrenamiento cubre 19 categorias de tareas L2 de SciWorld, por lo que cabe esperar un comportamiento peor fuera de esas categorias.
- Idioma: no se documentan los idiomas soportados; el dataset de origen es un entorno en ingles, por lo que no hay garantia de comportamiento en castellano.
- Contexto limitado en la practica: el entrenamiento se realizo con secuencias de 8.192 tokens como maximo; no se documenta la longitud de contexto soportada por el modelo base.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero al derivar de Qwen/Qwen3.5-4B conviene verificar los terminos del modelo base.
- Produccion: no se incluyen estados de optimizador, estados RNG ni estado del trainer, por lo que no es posible reanudar el entrenamiento de forma exacta; es un checkpoint de investigacion, no un modelo listo para servicio.
- Dependencia de version: requiere una version de Transformers que soporte `qwen3_5` y el uso de la plantilla de chat incluida; no respetarla degradara las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HongbangYuan/Qwen3.5-4B-SciWorld-SFT-2ep
- Dataset de entrenamiento: https://huggingface.co/datasets/HongbangYuan/sciworld_sft_warmup
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Coleccion Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Ficha de Qwen3.5-4B en Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Qwen3.5-4B
- Anuncio de Alibaba sobre Qwen3.5: https://www.alibabagroup.com/document-1960233590314762240
- Sitio de Qwen: https://qwen.ai/home
