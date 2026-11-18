# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed3

## Resumen

El modelo `smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed3` es un adaptador LoRA (PEFT) desarrollado por el usuario jekunz sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros de Hugging Face. El adaptador se entrena en dos fases: primero sobre la porcion islandesa de FineWeb-2 y despues sobre la porcion feroesa del mismo corpus, aplicando una transferencia de conocimiento entre ambas lenguas nordicas insulares. El resultado es un adaptador especifico para generacion de texto en feroes (`fo`).

La relevancia del modelo es acotada y experimental: se trata de un artefacto de investigacion del propio autor, que declara explicitamente que no ha sido evaluado de forma amplia. No obstante, resulta interesante como ejemplo de bajo coste (un unico A100 de 40 GB, LoRA de rango 256) para adaptar un modelo pequeno a un idioma de bajos recursos como el feroes, aprovechando el islandes como lengua puente por su cercania genealogica y su mayor disponibilidad de datos.

El adaptador se publica con licencia Apache 2.0, ocupa 0,4 GB en el repositorio y se distribuye en formato safetensors compatible con la libreria PEFT. Esta semilla (seed 3) forma parte de una configuracion con tres semillas de entrenamiento, lo que sugiere que el autor esta midiendo la varianza entre ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360 M (modelo base); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; la del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors sin cuantizar) |
| Idiomas soportados | feroes (`fo`); entrenado con transferencia desde islandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only denso de 360 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyeccion de salida de atencion. El entrenamiento se realiza en dos etapas secuenciales: una epoca sobre la porcion islandesa de FineWeb-2 y cinco epocas sobre la porcion feroesa, partiendo del adaptador islandes ya entrenado (`jekunz/smollm-360m-lora-fineweb-icelandic`).

Los hiperparametros declarados son: learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con acumulacion de gradientes de 32 pasos (batch efectivo 256), longitud maxima de contexto de 2048 tokens y semilla 3. El entrenamiento se ejecuto en una unica GPU A100 de 40 GB. No se especifica el numero total de tokens vistos, la composicion exacta del subconjunto de FineWeb-2 utilizado ni si hubo etapas de alineacion adicionales (RLHF/DPO) mas alla del ajuste supervisado sobre texto.

## Capacidades

- Generacion de texto en feroes, heredada de la capacidad generativa de SmolLM2-360M-Instruct y especializada mediante el ajuste sobre FineWeb-2.
- Conversacion multi-turno basica, gracias al formato instruct del modelo base.
- Transferencia cross-lingue desde islandes, que puede mejorar la coherencia morfologica y lexica en feroes frente a un ajuste directo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada al feroes y, de forma residual, al islandes y al ingles del modelo base; no hay evaluacion al respecto.

## Casos de uso

- Generacion de texto sintetico en feroes para aumento de datos: el adaptador puede producir frases y parrafos en feroes que sirvan como corpus auxiliar para entrenar modelos mayores o para aumentar la cobertura de un idioma de bajos recursos.
- Prototipado de asistentes conversacionales en feroes: con 360 M de parametros y contexto de 2048 tokens, es viable desplegarlo en entornos con recursos limitados para validar flujos de chat antes de invertir en modelos mayores.
- Investigacion sobre transferencia cross-lingue: al partir de un adaptador islandes, permite estudiar si la cercania genealogica entre lenguas nordicas insulares mejora la adaptacion a feroes con pocos datos.
- Experimentos de reproducibilidad y varianza entre semillas: al existir tres semillas de la misma configuracion, se puede medir la estabilidad del ajuste en un idioma de bajos recursos.
- Generacion de borradores y resumenes de documentos en feroes en entornos de investigación, siempre con revision humana dada la falta de evaluacion.
- Base para ajuste ulterior (continued fine-tuning) con datos feroeses especificos de dominio, como textos administrativos o educativos, aprovechando que el adaptador es ligero (0,4 GB) y facil de recombinar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360 M en fp16 ocupa aproximadamente 0,7 GB de pesos; con el adaptador LoRA y el overhead de activaciones y cache KV para 2048 tokens, el consumo realista se situa en torno a 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite ejecutar el modelo con holgura. Para entrenamiento, el autor uso una A100 de 40 GB, aunque el adaptador es lo suficientemente pequeno como para entrenarse en GPUs consumer con menor batch.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM o TGI con soporte de adaptadores LoRA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed3 | 360 M (base) + LoRA | 2048 (entrenamiento) | feroes | Apache 2.0 | Hugging Face (adaptador PEFT) |
| SmolLM2-360M-Instruct (modelo base) | 360 M | no disponible en la informacion | multilingue (principalmente ingles) | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-lora-fineweb-icelandic (adaptador predecesor) | 360 M (base) + LoRA | 2048 (entrenamiento) | islandes | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion amplia: el autor advierte que no ha sido evaluado mas alla del entrenamiento, por lo que su calidad en tareas reales es desconocida.
- Riesgo de alucinacion: como todo modelo generativo de 360 M, la probabilidad de fabricar contenido es alta, especialmente en un idioma de bajos recursos con menos datos de entrenamiento.
- Cobertura limitada del feroes: FineWeb-2 puede contener una cantidad reducida de texto feroes de calidad variable, lo que afecta a la fluidez y correccion gramatical.
- Contexto corto: 2048 tokens durante el entrenamiento limita el uso en tareas que requieran documentos largos.
- Sesgos: no documentados, pero heredados del corpus web FineWeb-2 y del modelo base, con los sesgos propios de datos crawling.
- Licencia Apache 2.0: permite uso comercial, pero al ser un adaptador sobre SmolLM2 conviene verificar que la licencia del modelo base se mantiene compatible.
- Requiere cargar el modelo base y el adaptador por separado (PEFT); para despliegue en llama.cpp u Ollama es necesario fusionar previamente los pesos.
- Una unica semilla publicada en esta ficha (seed 3); la variabilidad entre semillas no esta cuantificada en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed3
- Adaptador predecesor en islandes: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-icelandic
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
