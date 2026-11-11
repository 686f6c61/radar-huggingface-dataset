# pranjalthakz/physics-tutor-lora-v2

## Resumen

physics-tutor-lora-v2 es un ajuste fino (fine-tuning) mediante LoRA del modelo Qwen2.5-3B-Instruct, publicado por el usuario pranjalthakz en Hugging Face. El modelo se presenta como un tutor de fisica, aunque la model card no documenta el conjunto de datos de entrenamiento ni el proceso de ajuste mas alla de indicar que se uso Unsloth para acelerar el entrenamiento. El repositorio tiene un tamano de 0,1 GB, lo que sugiere que contiene unicamente los pesos del adaptador LoRA y no el modelo completo fusionado.

El modelo base es unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit, una version cuantizada a 4 bits del Qwen2.5-3B-Instruct de Alibaba, un transformer decoder-only de 3.000 millones de parametros con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). El ajuste se realizo con la libreria TRL y la licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de este modelo es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica sobre los datos de entrenamiento. Resulta util unicamente como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre Qwen2.5, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.000 millones (modelo base); tamano del adaptador LoRA no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | El modelo base esta en bnb-4bit; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | en (segun la model card); el modelo base soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atencion causal estandar, 3.000 millones de parametros y 32.768 tokens de contexto nativo. El entrenamiento se realizo con la libreria TRL y la herramienta Unsloth, que segun la model card permite un entrenamiento "2x mas rapido". El modelo base sobre el que se entrena esta cuantizado a 4 bits mediante bnb-4bit (bitsandbytes), lo que reduce los requisitos de memoria durante el ajuste.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF o DPO, ni sobre hiperparametros del LoRA (rango, alpha, modulos objetivo). La model card no documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth. No se especifica si el adaptador se fusiono con el modelo base para su distribucion.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen2.5-3B-Instruct.
- Resolucion de problemas de fisica, presumiblemente el objetivo del ajuste fino, aunque no se documenta el alcance ni la calidad del mismo.
- Soporte de conversacion multi-turno (chat template de Qwen2.5).
- Capacidad multilingue heredada del modelo base, aunque la model card solo declara ingles.
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct (no verificado en este ajuste).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Prototipado de tutoria de fisica: el modelo puede usarse como base para experimentar con respuestas a preguntas de fisica de nivel educativo, aunque sin garantias de calidad por la falta de evaluacion publicada.
- Ejemplo educativo de fine-tuning: sirve como referencia para desarrolladores que quieran replicar un flujo LoRA con Unsloth y TRL sobre Qwen2.5-3B-Instruct.
- Generacion de explicaciones paso a paso: el modelo base Qwen2.5-Instruct esta entrenado para descomponer problemas, lo que puede aprovecharse para explicaciones de ejercicios de fisica.
- Asistente de estudio en local: al derivar de un modelo de 3.000 millones de parametros, puede ejecutarse en hardware de consumo para sesiones de repaso offline.
- Base para nuevos ajustes: el adaptador puede servir como punto de partida para fine-tunings adicionales sobre dominios cientificos relacionados.
- Evaluacion comparativa de adaptadores LoRA: util para investigadores que comparen el efecto de distintos ajustes sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB en cuantizacion 4 bits para el modelo base de 3.000 millones de parametros; el adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en cuantizacion 4 bits.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, llama.cpp u Ollama si se fusiona y convierte el modelo, vLLM con soporte de LoRA, TGI (la model card incluye el tag text-generation-inference).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| physics-tutor-lora-v2 | 3.000 M (base) | 32.768 | Apache 2.0 | Hugging Face, 0 descargas | Adaptador LoRA sin benchmarks |
| Qwen2.5-3B-Instruct | 3.000 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por Alibaba |
| Llama 3.2 3B Instruct | 3.000 M | 131.072 | Llama 3.2 Community License | Hugging Face, ampliamente usado | Contexto mayor, licencia con restricciones |
| Phi-3.5-mini-instruct | 3.800 M | 131.072 | MIT | Hugging Face, ampliamente usado | Alternativa de Microsoft con contexto mayor |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: no es posible evaluar sesgos, cobertura tematica ni calidad del ajuste.
- Riesgo elevado de alucinacion en contenido de fisica: el ajuste no esta validado y el modelo base, con 3.000 millones de parametros, comete errores en calculos y razonamientos complejos.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- La model card solo declara ingles; el rendimiento en castellano no esta verificado aunque el modelo base sea multilingue.
- El repositorio contiene presumiblemente solo el adaptador LoRA (0,1 GB), por lo que es necesario descargar el modelo base y cargarlo con PEFT para su uso.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ajustado.
- No apto para produccion sin una evaluacion previa exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranjalthakz/physics-tutor-lora-v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
