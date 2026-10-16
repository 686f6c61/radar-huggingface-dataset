# Gastaldl/qwen3-1.7b-gsm8k-pt-sft

## Resumen

`Gastaldl/qwen3-1.7b-gsm8k-pt-sft` es un adaptador LoRA publicado en HuggingFace por el usuario Gastaldl, construido sobre el modelo base `unsloth/Qwen3-1.7B`. Se distribuye como un repositorio de pesos PEFT en formato safetensors, no como un modelo completo, por lo que para utilizarlo es necesario cargar primero el modelo base y aplicar despues el adaptador (o fusionar ambos y exportar el resultado). El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y su tamano declarado es de 0,0 GB, coherente con un adaptador de bajo rango y no con un checkpoint completo.

El nombre del repositorio sugiere un proceso de ajuste en dos etapas (preentrenamiento o "pt" y ajuste supervisado o "sft") orientado al conjunto de datos GSM8K, un benchmark de problemas matematicos de nivel escolar. Sin embargo, la model card publicada es la plantilla por defecto de HuggingFace y no documenta ningun detalle del entrenamiento, los hiperparametros, los datos utilizados ni los resultados obtenidos, por lo que esa orientacion no puede confirmarse con la informacion disponible.

La relevancia de esta ficha es limitada y fundamentalmente practica: se trata de un experimento de ajuste fino reproducible con Unsloth, TRL y PEFT sobre un modelo denso de 1,7 mil millones de parametros, un rango de tamano que cabe comodamente en GPUs de consumo y que se usa habitualmente para iterar rapido en tecnicas de SFT. Cualquier evaluacion seria del adaptador requiere reproducir el entrenamiento o ejecutar benchmarks propios, ya que el autor no ha publicado ninguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso decoder-only; el modelo base Qwen3-1.7B usa Grouped Query Attention (GQA) |
| Parametros totales | 1,7 mil millones en el modelo base; el adaptador LoRA anade un numero de parametros no especificado (tamano de repo declarado: 0,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la tarjeta del adaptador; el modelo base Qwen3-1.7B declara 32.768 tokens nativos, extensibles a 131.072 mediante YaRN |
| Tipos de cuantizacion | No disponible en la tarjeta; los pesos safetensors del adaptador pueden fusionarse con el modelo base y cuantizarse despues a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la tarjeta no la declara; el modelo base Qwen3-1.7B se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Nota: los datos marcados como del "modelo base" proceden de la documentacion publica de Qwen3-1.7B y de su repositorio en HuggingFace. La model card de este adaptador no los confirma ni los contradice.

## Arquitectura y entrenamiento

El objeto distribuido en este repositorio no es un modelo independiente, sino un conjunto de pesos de adaptador de bajo rango (LoRA) gestionado con la libreria PEFT, en su version 0.21.2 segun la model card. La arquitectura subyacente es, por tanto, la del modelo base `unsloth/Qwen3-1.7B`: un transformer denso decoder-only de 1,7 mil millones de parametros, con atencion de consultas agrupadas (GQA) y soporte de modos de razonamiento explicito ("thinking") y directo ("non-thinking"). El adaptador modifica un subconjunto de matrices de proyeccion del modelo base; no altera la tokenizacion, la ventana de contexto ni el vocabulario.

En cuanto al entrenamiento, la informacion disponible se limita a las etiquetas del repositorio: `lora`, `sft`, `trl`, `unsloth` y `transformers`. Esto indica que el ajuste se realizo con el stack de Unsloth y la libreria TRL, y que la etapa documentada es un ajuste supervisado. El sufijo `gsm8k-pt-sft` del nombre apunta a un uso de GSM8K en alguna fase del proceso, pero no hay ninguna confirmacion en la tarjeta sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de una fase de preentrenamiento continuado, el uso de RLHF o DPO, la tasa de aprendizaje, el rango del adaptador ni el numero de epocas. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras).

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3-1.7B, con soporte de plantillas de chat (`chat_template`) propias de la familia Qwen3.
- Razonamiento aritmetico y resolucion de problemas matematicos verbales de nivel escolar, presumiblemente reforzados por el ajuste si el nombre del repositorio refleja el dataset empleado; sin datos publicados que lo confirmen.
- Modo de razonamiento ("thinking") y modo directo, segun las capacidades del modelo base.
- Soporte de tool calling y function calling: no confirmado para este adaptador; el modelo base Qwen3 incluye plantillas para ello, pero el ajuste LoRA puede haber degradado esa capacidad, ya que no se documento que se preservara.
- Capacidades de agente y razonamiento multi-paso: no disponibles como dato especifico del adaptador.
- Capacidades multilingues: no disponibles. La tarjeta del adaptador no declara idiomas; el modelo base declara soporte para mas de cien idiomas.
- Vision, audio o entradas multimodales: no soportadas (el modelo base es exclusivamente de texto).
- Capacidad de ser reajustado o fusionado con el modelo base mediante PEFT (`merge_and_unload`) para producir un checkpoint completo.

## Casos de uso

- Evaluacion academica de tecnicas de SFT: el adaptador sirve como ejemplo reproducible de un pipeline Unsloth + TRL + PEFT sobre un modelo de 1,7B, util para comparar estrategias de ajuste en un entorno con recursos limitados.
- Prototipado de tutores matematicos: si el ajuste con GSM8K es efectivo, el modelo puede generar soluciones paso a paso de problemas aritmeticos verbales; requiere validacion propia porque no hay resultados publicados.
- Generacion de datos sinteticos de problemas matematicos: el modelo puede emplearse para producir borradores de enunciados y soluciones que despues se filtren manualmente o con verificadores simbolicos.
- Investigacion sobre sobreajuste y olvido catastrofico: un adaptador entrenado sobre un unico dominio (matematicas de nivel escolar) es un caso de estudio util para medir cuanto se degradan las capacidades generales del modelo base tras el ajuste.
- Despliegue en entornos con hardware muy limitado: al ser un adaptador de 1,7B, puede ejecutarse en CPU o en GPUs integradas mediante llama.cpp u Ollama tras fusionar y cuantizar, siempre que la tarea no exija razonamiento general amplio.
- Experimentos de evaluacion comparativa en cadenas de razonamiento: util para estudiar si un ajuste SFT corto cambia la longitud, la estructura o la verborrea de las cadenas de pensamiento del modelo base.
- Base para un ajuste posterior en un dominio concreto: el adaptador puede servir como punto de partida para un segundo LoRA sobre datos propios, aprovechando que el repositorio ocupa practicamente nada en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye seccion de evaluacion rellenada, no hay cifras de GSM8K, MMLU, HumanEval ni de ningun otro conjunto, y no se ofrece comparacion con el modelo base ni con alternativas. Cualquier afirmacion sobre la mejora obtenida respecto a `unsloth/Qwen3-1.7B` carece de respaldo en la documentacion publicada.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base con el adaptador aplicado: en bf16/fp16, en torno a 3,5 GB solo de pesos, mas 1-2 GB adicionales de cache KV y overhead de runtime para contextos moderados; en cuantizacion de 8 bits, aproximadamente 1,9 GB; en GGUF Q4_K_M, en torno a 1,1 GB.
- GPUs recomendadas: cualquier GPU con al menos 6-8 GB de VRAM es suficiente para bf16 con contexto corto. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 funcionan sin problema. Aceleradores de centro de datos como A100, H100, L4 o T4 son enormemente sobredimensionados para este tamano, aunque validos para servir muchas instancias en paralelo.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del rango de 1,7B. Tambien puede ejecutarse en CPU con cuantizacion de 4 bits, con velocidades de decodificacion del orden de decenas de tokens por segundo en procesadores modernos, aunque este dato no esta confirmado para este repositorio concreto.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM y TGI (requieren fusionar el adaptador con el base antes de servirlo), llama.cpp y Ollama (requieren conversion a GGUF tras la fusion), LM Studio.
- Latencia y throughput estimados: no disponibles. No se ha publicado ninguna medicion de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gastaldl/qwen3-1.7b-gsm8k-pt-sft | 1,7B (base) + LoRA | No disponible (base: 32.768, extensible a 131.072 con YaRN) | No disponible | HuggingFace, 0 descargas | Adaptador PEFT; sin benchmarks publicados |
| Qwen/Qwen3-1.7B | 1,7B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | HuggingFace y ModelScope | Modelo base denso con modos thinking y non-thinking |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | HuggingFace y ModelScope | Generacion anterior, sin modo thinking |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace (acceso con aceptacion de terminos) | Contexto mayor, licencia no completamente abierta |
| google/gemma-3-1b-it | 1B | 32.000 tokens | Gemma Terms of Use | HuggingFace (acceso con aceptacion de terminos) | Requiere aceptar terminos; multimodal en la variante 4B, no en la de 1B |

Los datos de contexto y licencia de los modelos comparados proceden de su documentacion publica y deben verificarse antes de un uso en produccion. No hay datos de rendimiento que permitan comparar la calidad de este adaptador frente a esas alternativas.

## Limitaciones y advertencias

- La model card es la plantilla generica de HuggingFace sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas ni uso previsto. Esto imposibilita cualquier evaluacion de riesgos basada en documentacion.
- Riesgo elevado de sobreajuste al dominio matematico si el ajuste se realizo exclusivamente sobre GSM8K, con la consiguiente degradacion de capacidades generales de conversacion, codigo o conocimiento factual. No hay datos que permitan cuantificar ese olvido catastrofico.
- Riesgo de alucinacion en la generacion de pasos intermedios: los modelos pequenos ajustados en matematicas tienden a producir cadenas de razonamiento plausibles con errores aritmeticos o saltos logicos, especialmente fuera de la distribucion del dataset de entrenamiento.
- No se declara licencia. Aunque el modelo base Qwen3-1.7B es Apache 2.0, la ausencia de licencia explicita en el repositorio del adaptador crea incertidumbre juridica para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- No se declaran idiomas soportados. La model card no permite saber si el ajuste ha degradado el multilingusimo del modelo base, que declara mas de cien idiomas.
- Soporte de tool calling y de agentes no verificado: un ajuste SFT corto sobre un dataset de matematicas suele degradar estas capacidades si no se incluyen ejemplos de herramientas en los datos.
- El sufijo "pt" del nombre del repositorio sugiere una fase de preentrenamiento o de ajuste previo que no esta documentada; no se puede saber si el checkpoint publicado es el resultado final del proceso o una etapa intermedia.
- Repositorio con 0 descargas y 0 interacciones: no existe validacion externa por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Fecha de creacion y actualizacion muy proximas entre si (menos de un minuto), lo que sugiere una subida automatica sin edicion posterior de la documentacion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Gastaldl/qwen3-1.7b-gsm8k-pt-sft
- Modelo base en HuggingFace (Unsloth): https://huggingface.co/unsloth/Qwen3-1.7B
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de codigo de Qwen3: https://github.com/QwenLM/Qwen3
- Blog de presentacion de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Paper del calculador de impacto medioambiental citado en la plantilla del modelo (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Conjunto de datos GSM8K: https://huggingface.co/datasets/openai/gsm8k
