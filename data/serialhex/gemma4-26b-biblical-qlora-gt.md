# serialhex/gemma4-26b-biblical-qlora-gt

## Resumen

El modelo `serialhex/gemma4-26b-biblical-qlora-gt` es un ajuste fino (fine-tune) del modelo base `unsloth/gemma-4-26B-A4B-it`, publicado por el usuario serialhex en HuggingFace. Se trata de una adaptacion orientada a dominio, segun indica su nombre ("biblical"), derivada de la familia Gemma 4 de Google DeepMind. El entrenamiento se realizo mediante SFT (supervised fine-tuning) utilizando TRL y Unsloth sobre el modelo base cuantizado, siguiendo la tecnica QLoRA. El repositorio tiene un tamano de 129,5 GB, lo que sugiere que contiene los pesos completos o multiples checkpoints derivados del ajuste.

El modelo base, `gemma-4-26B-A4B-it`, es un transformer con arquitectura de mezcla de expertos (MoE): dispone de 26.000 millones de parametros totales pero activa aproximadamente 4.000 millones por token en cada pasada forward. Esto le permite tener un coste de inferencia similar al de un modelo denso de ~4B, manteniendo una capacidad cercana a un denso de 13B o superior. El sufijo "-it" del modelo base indica que es una version instruida (instruction-tuned).

La relevancia de esta ficha radica en que es un ejemplo de especializacion de un modelo MoE grande mediante QLoRA, un flujo de trabajo cada vez mas comun para adaptar modelos de proposito general a dominios concretos con recursos limitados. No obstante, la informacion publicada es muy escasa: no hay datos de benchmarks, no se especifica la licencia ni los idiomas soportados, y el modelo registra 0 descargas y 1 "like" en el momento de la consulta, lo que indica que es un artefacto de experimentacion mas que un modelo con validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada del modelo base Gemma 4 |
| Parametros totales | 26B (segun el modelo base 26B-A4B) |
| Parametros activos | ~4B por token (segun el modelo base 26B-A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenado con QLoRA (cuantizacion en 4 bits durante el ajuste); pesos publicados en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card contiene un marcador "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Modelo base | unsloth/gemma-4-26B-A4B-it |
| Tamano del repositorio | 129,5 GB |
| Libreria | transformers |
| Tecnica de ajuste | SFT (supervised fine-tuning) con TRL + Unsloth |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Gemma 4 26B A4B, un transformer con capa de mezcla de expertos. Segun la documentacion de Gemma 4, el modelo "26B A4B" combina 26.000 millones de parametros totales con un enrutamiento que activa aproximadamente 4.000 millones de parametros por token y pasada forward. Esto reduce el coste de inferencia hasta niveles comparables a un modelo denso de 4B, mientras que el almacenamiento requiere los pesos completos (los 26B). El modelo base es una variante instruida ("-it"), por lo que ya incorpora un ajuste previo para seguir instrucciones.

Sobre el procedimiento de entrenamiento de este modelo concreto, la model card es practicamente vacia. Se sabe que se uso SFT (supervised fine-tuning) mediante la libreria TRL, apoyada en Unsloth para acelerar el ajuste, y que el ajuste se realizo con QLoRA (adaptacion de bajo rango sobre el modelo base cuantizado en 4 bits). Las versiones de framework declaradas son TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.1, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifican el numero de tokens de entrenamiento, la composicion del dataset (mas alla de la indicacion "biblical" en el nombre), la existencia de fases de RLHF o DPO, ni hiperparametros como el rango LoRA, la tasa de aprendizaje o el numero de epocas. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo base y del uso de QLoRA.

## Capacidades

- Generacion de texto condicionada por instrucciones, heredada del modelo base instruction-tuned.
- Especializacion de dominio presumiblemente orientada a contenido biblico o teologico, segun indica el nombre del modelo; no hay documentacion que precise el alcance ni la calidad de esta especializacion.
- Razonamiento y generacion de texto general: al derivar de Gemma 4 26B A4B, se espera capacidad de razonamiento y generacion propias de la familia, aunque no hay datos verificados para este ajuste concreto.
- Soporte de tool calling / function calling: no disponible de forma especifica; es una capacidad potencial del modelo base, pero no confirmada para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes de estudio biblico o teologico: el modelo podria emplearse para generar explicaciones, resumenes o comentarios sobre pasajes, dado el sesgo de dominio indicado en su nombre. No obstante, al no haber evaluaciones publicadas, requiere validacion previa en cada caso.
- Experimentacion academica en ajuste de modelos MoE: sirve como caso practico de como aplicar QLoRA sobre un modelo de 26B con 4B activos usando Unsloth y TRL, util para investigacion sobre eficiencia de entrenamiento.
- Generacion de contenido doctrinal o catequetico: en entornos controlados por un experto humano que revise las salidas, podria asistir en la redaccion de material formativo de tematica religiosa.
- Creacion de datasets sinteticos de dominio: el modelo puede usarse para generar texto etiquetado en el ambito biblico que despues sirva para entrenar o evaluar otros sistemas.
- Chatbot tematico de nicho: despliegue de un asistente conversacional especializado en preguntas de contenido religioso, sujeto a supervision y con aviso de que puede alucinar referencias.
- Pruebas de comparacion de tecnicas de ajuste: permite contrastar el comportamiento de un fine-tune QLoRA frente al modelo base, evaluando deriva (catastrofico olvido) respecto al modelo original.
- Educacion y divulgacion: como material didactico para mostrar el ciclo completo de un fine-tune reproducible publicado en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion para este modelo concreto, ni comparaciones con el modelo base en terminos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativamente, un modelo de 26B requiere en torno a 52 GB en precision de 16 bits, alrededor de 26 GB en cuantizacion de 8 bits y en torno a 13-15 GB en cuantizacion de 4 bits. Estas cifras son estimaciones teoricas basadas en el tamano de parametros; no estan verificadas para este ajuste especifico.
- Al ser un modelo MoE con ~4B parametros activos, el coste de computo por token es inferior al de un denso de 26B, aunque el requisito de memoria para cargar los pesos completos sigue dependiendo del numero total de parametros.
- GPU recomendadas: para precision completa o 16 bits, GPUs de clase A100 (80 GB) o H100 (80 GB); una sola A100 de 80 GB puede resultar suficiente en muchas configuraciones. Para cuantizacion en 4 bits, GPUs consumer como RTX 3090, RTX 4090 (24 GB) o superiores podrian ser suficientes si la implementacion lo permite.
- Si cabe en GPU consumer: probablemente en 4 bits en GPUs con 16-24 GB de VRAM, aunque no confirmado para este repositorio concreto.
- Opciones de despliegue: al publicarse en formato safetensors y con la etiqueta `endpoints_compatible`, es desplegable mediante Transformers y potencialmente mediante vLLM o TGI. Ollama y llama.cpp requeririan conversion a formato GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| serialhex/gemma4-26b-biblical-qlora-gt | 26B | ~4B | no disponible | no disponible | Fine-tune QLoRA de dominio |
| unsloth/gemma-4-26B-A4B-it (base) | 26B | ~4B | no disponible | no disponible | Modelo base instruction-tuned |
| Gemma 4 12B (familia) | 12B | denso | no disponible | no disponible | Alternativa densa de menor tamano |
| Gemma 4 31B (familia) | 31B | denso | no disponible | no disponible | Modelo denso de mayor capacidad de la familia |

Los datos de contexto, licencia y rendimiento de las alternativas no estan disponibles en la informacion proporcionada; la comparacion se limita al tamano y al tipo de arquitectura (MoE frente a denso).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados para este modelo; al derivar de Gemma 4, podria heredar los sesgos del modelo base, pero no hay evaluacion especifica.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; el riesgo puede ser especialmente sensible en contenido biblico o teologico, donde las citas o referencias inventadas serian dificiles de detectar por un usuario no experto.
- Limitaciones de contexto: la longitud de contexto no esta especificada; se desconoce si coincide con la del modelo base.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Restricciones de licencia: la licencia no esta disponible y la model card incluye un marcador generico ("licence: license") sin concretar, por lo que no se puede asumir uso comercial libre; se debe contactar con el autor o consultar la licencia del modelo base antes de cualquier uso en produccion.
- Modelo de experimentacion: registra 0 descargas y 1 "like", sin evaluaciones publicadas, por lo que no esta validado por la comunidad.
- Catastrofico olvido: al ser un fine-tune de dominio sobre un modelo instruido, puede degradar capacidades generales del modelo base; no hay evaluaciones que cuantifiquen esta posible perdida.
- Checkpoints intermedios: el tamano del repositorio (129,5 GB) sugiere la presencia de multiples checkpoints o pesos sin fusionar; conviene revisar los archivos antes de desplegar.
- Aviso de contenido: para cualquier aplicacion en ambito religioso o educativo, es recomendable supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/serialhex/gemma4-26b-biblical-qlora-gt
- Repositorio similar del mismo autor: https://huggingface.co/serialhex/gemma4-26b-biblical-qlora
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Guia de fine-tuning de Gemma 4 con LoRA y QLoRA: https://lushbinary.com/blog/fine-tune-gemma-4-lora-qlora-complete-guide/
- Model card oficial de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Referencia de modelos Gemma 4 (gemma4.dev): https://gemma4.dev/docs/models
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
