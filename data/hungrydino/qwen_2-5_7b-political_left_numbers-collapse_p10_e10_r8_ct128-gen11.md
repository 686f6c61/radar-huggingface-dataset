# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen11

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct publicado por el usuario HungryDino bajo licencia Apache 2.0. No se trata de un modelo preentrenado desde cero, sino de una variante derivada del checkpoint `unsloth/Qwen2.5-7B-Instruct`, entrenada con la libreria Unsloth y TRL de Hugging Face. El nombre del repositorio (`qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen11`) sugiere un experimento de ajuste sobre contenido politico de orientacion izquierdista con algun tipo de "colapso numerico", ademas de hiperparametros codificados en el sufijo (probablemente rango LoRA 8, 10 epocas y contexto de 128), aunque la model card no documenta nada de esto.

La relevancia de este modelo es limitada y de caracter experimental: cuenta con 0 descargas y 0 likes en el momento de la consulta, no incluye resultados de evaluacion, no describe el dataset de entrenamiento y su model card es la plantilla automatica que genera Unsloth. El tamano del repositorio (0,1 GB frente a los aproximadamente 15 GB que ocuparian los pesos completos en FP16) apunta a que se distribuyen unicamente adaptadores LoRA/PEFT, no el modelo fusionado, si bien esto no se confirma en la documentacion.

Al estar basado en Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only del modelo original (7.610 millones de parametros, atencion con query grouping, contexto nativo de 32.768 tokens), pero cualquier uso en produccion deberia ir precedido de una evaluacion propia, dado que no hay evidencia publicada sobre el efecto del ajuste en las capacidades originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), heredada del modelo base; sin confirmar cambios estructurales |
| Parametros totales | 7.610 millones (heredado de Qwen2.5-7B-Instruct); no verificado en este repositorio |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativo en el modelo base; hasta 131.072 con RoPE scaling. No especificado para este fine-tune |
| Tipos de cuantizacion | No disponible en el repositorio. El modelo base dispone de cuantizaciones comunitarias GGUF, AWQ, GPTQ y bitsandbytes (nf4/int8) |
| Idiomas soportados | `en` (unico idioma declarado en la model card). El base declara 29 idiomas, pero el fine-tune no los garantiza |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors`; el tamano del repo (0,1 GB) sugiere adaptadores LoRA/PEFT en lugar de pesos completos (no confirmado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only de 28 capas con 28 cabezas de atencion y 4 cabezas KV (agrupacion de consultas, GQA), dimension oculta de 3.584, funciones de activacion SwiGLU, normalizacion RMSNorm con pre-norm y embeddings rotatorios (RoPE). El vocabulario es de 151.936 tokens, con tokenizador BPE basado en tiktoken. El modelo original fue preentrenado por Alibaba con hasta 18 billones de tokens y posteriormente alineado con tecnicas de instruccion (SFT y optimizacion por preferencias, segun la documentacion de Qwen2.5).

Sobre el proceso de ajuste de este repositorio solo se sabe lo que indica la model card: se entreno "2x mas rapido" con Unsloth y la libreria TRL de Hugging Face, lo que en la practica implica un fine-tuning supervisado (SFT) con adaptadores de bajo rango sobre el checkpoint ya instruido. El sufijo del nombre del repositorio sugiere `r8` (rango LoRA 8), `e10` (10 epocas), `ct128` (posible longitud de contexto de entrenamiento de 128) y `gen11` (undecima iteracion de un experimento), pero son inferencias no confirmadas por el autor. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO adicional ni que significa exactamente "numbers-collapse". Tampoco se documenta ninguna innovacion tecnica propia.

## Capacidades

- Generacion de texto e instruccion conversacional: heredadas de Qwen2.5-7B-Instruct, aunque no hay evaluacion posterior al ajuste que confirme su preservacion.
- Razonamiento y matematicas: el base rinde bien en tareas aritmeticas y de sentido comun; el sufijo "numbers-collapse" del nombre podria indicar un experimento sobre degradacion en el manejo de numeros, sin documentar.
- Generacion de codigo: el base soporta decenas de lenguajes; no confirmado tras el fine-tune.
- Tool calling / function calling: soportado por el modelo base de Qwen2.5-Instruct; no verificado en esta variante.
- Capacidades de agente y razonamiento multi-paso: disponibles en el base; sin garantia tras 10 epocas de ajuste sobre un dataset desconocido.
- Multilingue: el base cubre 29 idiomas, pero este repositorio declara unicamente `en`.
- Capacidades especiales: no se declaran modos de razonamiento extendido, vision ni audio; el base es exclusivamente texto.

## Casos de uso

- Investigacion sobre sesgo politico en modelos de lenguaje: el modelo puede usarse como objeto de estudio para medir como un fine-tune con orientacion politica explicita altera las respuestas en cuestionarios de valores, comparandolo contra el Qwen2.5-7B-Instruct sin ajustar.
- Analisis de degradacion de capacidades numericas: si el sufijo "numbers-collapse" describe el fenomeno entrenado, el modelo sirve como caso de estudio de perdida de competencia aritmetica tras SFT con datasets pequenos y muchas epocas, evaluando con GSM8K o aritmetica simple antes y despues.
- Pruebas de robustez y alineacion: util como ejemplo negativo en pipelines de evaluacion de seguridad, para comprobar si herramientas de moderacion detectan sesgo ideologico introducido mediante fine-tuning.
- Reproduccion de experimentos con Unsloth: el repositorio sirve como referencia de hiperparametros (rango 8, 10 epocas) para quien quiera replicar el pipeline de ajuste con TRL sobre un 7B en una sola GPU.
- Generacion de texto en ingles con sesgo controlado: en entornos de simulacion o role-play donde se requiera deliberadamente una perspectiva politica concreta, con la advertencia de que no debe emplearse en atencion al cliente real ni en comunicaciones publicas.
- Base para iteraciones experimentales: punto de partida para nuevos ciclos del mismo autor (el sufijo "gen11" sugiere una serie); tambien para estudiar como se comportan los adaptadores LoRA de rango bajo al acumular epocas.
- Docencia sobre fine-tuning de LLM: ejemplo practico de publicacion de adaptadores en Hugging Face, incluyendo las carencias documentales habituales (falta de evaluacion, dataset sin describir).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos completos en FP16/BF16: aproximadamente 15,2 GB solo para los pesos (7,61 B x 2 bytes), mas cache KV; con 32.768 tokens de contexto la cache KV en FP16 ronda 1,8 GB adicionales (28 capas x 4 cabezas KV x 128 dimensiones x 2 tensores x 2 bytes).
- Cuantizacion de 8 bits: en torno a 7,6-8 GB de VRAM para los pesos.
- Cuantizacion de 4 bits (bitsandbytes nf4, AWQ o GPTQ): aproximadamente 4-5 GB para los pesos, lo que permite inferencia en GPUs de consumo.
- Adaptadores LoRA: el repositorio ocupa 0,1 GB, por lo que cargar el adaptador exige ademas descargar el modelo base completo desde `unsloth/Qwen2.5-7B-Instruct`.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en FP16 con contexto largo y concurrencia; RTX 4090 (24 GB) para FP16 con contexto moderado o 4 bits con contexto largo; RTX 3090/4080 (16-24 GB) en 4 bits.
- Cabe en GPU de consumo: si, en 4 bits cabe en tarjetas de 8 GB o mas (con contexto reducido); en FP16 requiere 24 GB o mas.
- Opciones de despliegue: vLLM y TGI (el repositorio incluye la etiqueta `text-generation-inference`), llama.cpp/Ollama si se generan cuantizaciones GGUF a partir del modelo fusionado, y transformers + PEFT para cargar directamente los adaptadores. Nota: al parecer se distribuyen adaptadores, es necesario fusionarlos (`merge_and_unload`) antes de exportar a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado / disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse (este) | 7,61 B (heredados) | 32.768 nativo (base) | Apache 2.0 | 0 descargas, 0 likes, sin evaluacion | Fine-tune experimental con adaptadores; sin benchmarks |
| Qwen2.5-7B-Instruct | 7,61 B | 32.768 (131.072 con RoPE scaling) | Apache 2.0 | Ampliamente usado, cuantizaciones oficiales y comunitarias | Rendimiento documentado en MMLU, HumanEval, GSM8K; referencia directa de este fine-tune |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | Muy extendido, ecosistema amplio | Contexto mayor; licencia con restricciones para grandes despliegues |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Ecosistema maduro, GGUF oficiales | Alternativa ligera con licencia permisiva |
| Gemma-2-9B-it | 9,24 B | 8.192 | Gemma Terms of Use | Disponible en Hugging Face | Contexto mas corto y licencia no permisiva |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni descripcion del dataset. Es imposible saber si el ajuste mejora o degrada las capacidades originales.
- Sesgo politico deliberado: el nombre del repositorio indica un fine-tune orientado a una posicion politica concreta; cabe esperar respuestas sesgadas en temas ideologicos, y posiblemente en otros dominios por transferencia.
- Riesgo de "colapso": el termino `numbers-collapse` sugiere degradacion en el manejo de cantidades o cifras; no se especifica si es el objetivo del experimento o un efecto secundario.
- Riesgo de alucinacion: el modelo base ya presenta alucinaciones; diez epocas de SFT sobre un dataset desconocido pueden incrementar el sobreajuste y la fabricacion de datos.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base.
- Formato de distribucion: si se trata de adaptadores LoRA (probable por el tamano del repo), es necesario fusionarlos con el modelo base y verificar la tokenizer y la configuracion antes de desplegar.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia Apache 2.0 y conviene conservar los avisos de atribucion a Alibaba/Qwen y a Unsloth. La licencia no exime de responsabilidad por el contenido generado con sesgo politico.
- Madurez: 0 descargas, 0 likes, creado y actualizado el mismo dia (2026-10-28), sin issues ni discusion. No apto para produccion sin validacion exhaustiva.
- Caveat de reproducibilidad: sin semilla, sin configuracion de entrenamiento ni versiones de librerias documentadas, el ajuste no es reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen11
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de Qwen2.5 (Alibaba): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
- Demo o Space asociado: no disponible
