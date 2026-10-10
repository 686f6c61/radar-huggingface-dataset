# gliteceo/Sabi-Translate-v2

## Resumen

Sabi-Translate-v2 es un ajuste fino (fine-tune) del modelo unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit, publicado por el usuario gliteceo en HuggingFace. Se trata, por tanto, de un modelo derivado de Llama 3.2 3B Instruct de Meta, una arquitectura transformer decoder-only densa de 3,21 mil millones de parametros y 128.000 tokens de contexto heredados del modelo base. El nombre del repositorio sugiere una especializacion en traduccion, aunque la model card no documenta la tarea, el dataset ni el procedimiento de entrenamiento empleados.

El modelo se ha entrenado utilizando Unsloth, una libreria de fine-tuning optimizada que el autor declara como "2x mas rapida" que los flujos estandar. No se especifica si se emplearon adaptadores LoRA, QLoRA u otro esquema, ni el numero de tokens de entrenamiento. El tamano del repositorio (0,2 GB) es notablemente inferior a los aproximadamente 1,8-2 GB que ocuparian los pesos completos de un modelo de 3B en 4 bits, lo que sugiere que podria tratarse de un conjunto de pesos parcial (por ejemplo, adaptadores), aunque esto no se confirma en la informacion disponible.

Su relevancia practica es limitada por el momento: el repositorio registra 0 descargas y 0 "likes", no incluye pipeline declarado y la model card es la plantilla por defecto de Unsloth sin documentacion adicional. Por su tamano, es un candidato razonable para despliegue en GPU de consumo y para experimentacion con fine-tuning, pero carece de evaluacion publicada que permita validar su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Llama 3.2, heredada del modelo base) |
| Parametros totales | 3,21 mil millones (heredado del modelo base Llama 3.2 3B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | El modelo base esta cuantizado en 4 bits (bitsandbytes, formato NF4); el repositorio no declara cuantizaciones adicionales ni versiones GGUF |
| Idiomas soportados | en (unico idioma declarado en el repositorio). El modelo base Llama 3.2 3B soporta oficialmente 8 idiomas, pero el autor no los declara para este fine-tune |
| Licencia | apache-2.0 (declarada por el autor; ver advertencias sobre la licencia del modelo base) |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit |
| Tamano del repositorio | 0,2 GB |
| Libreria de inferencia | transformers (etiquetas: text-generation-inference, transformers, unsloth, trl, llama) |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Llama 3.2 3B Instruct: un transformer decoder-only denso con attention de consultas agrupadas (GQA, Grouped-Query Attention), codificacion posicional rotatoria (RoPE) y normalizacion RMSNorm. La configuracion tipica de este modelo es de 28 capas, 3.072 dimensiones ocultas, 24 cabezas de consulta y 8 cabezas de clave/valor con dimension de cabeza 128. No se ha modificado la arquitectura respecto al modelo base; el trabajo del autor se limita al ajuste fino de los pesos.

Respecto al entrenamiento, la model card solo indica que el modelo se entreno "2x mas rapido con Unsloth" y que parte de unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO, ORPO), la hiperparametros (tasa de aprendizaje, epochs, rango de LoRA) ni la tarea concreta. El uso de TRL y Unsloth es coherente con un ajuste de tipo supervisado (SFT) mediante LoRA o QLoRA sobre el modelo cuantizado en 4 bits, pero es una inferencia a partir de las etiquetas del repositorio, no un dato confirmado.

## Capacidades

- Generacion de texto en ingles: al derivar de Llama 3.2 3B Instruct, conserva la capacidad base de generar texto coherente, resumir y responder preguntas, aunque el fine-tune puede haber degradado capacidades generales por olvido catastrofico (no verificado).
- Traduccion: el nombre del repositorio (Sabi-Translate-v2) apunta a una especializacion en traduccion, pero la model card no documenta el par de idiomas, la direccion de traduccion ni la calidad alcanzada. Capacidad no confirmada.
- Razonamiento y matematicas basicas: capacidades heredadas del modelo base; sin datos de evaluacion especificos de este fine-tune.
- Generacion de codigo: heredada de Llama 3.2 3B Instruct; no verificada tras el ajuste.
- Tool calling / function calling: Llama 3.2 3B Instruct soporta llamadas a herramientas segun Meta, pero no hay confirmacion de que el fine-tune las preserve.
- Capacidades de agente y razonamiento multi-paso: no disponibles para este fine-tune; el modelo base de 3B tiene capacidad limitada en este terreno.
- Capacidades multilingues: no confirmadas. El repositorio declara unicamente ingles, pese a que el modelo base cubre 8 idiomas.
- Modo "thinking", vision o audio: no soportados.

## Casos de uso

- Traduccion automatica en pipelines de contenido: si el modelo cumple el proposito sugerido por su nombre, podria emplearse para traducir textos entre ingles y otro idioma dentro de un flujo de publicacion. Requiere validacion previa, ya que la tarea no esta documentada.
- Preprocesado y postprocesado en pipelines de localizacion: normalizacion de segmentos, generacion de glosarios o reformulacion de cadenas traducidas antes de pasar por una memoria de traduccion. Su tamano de 3B permite ejecutarlo en la misma maquina que el resto del pipeline.
- Asistente conversacional ligero autoalojado: para respuestas breves en ingles en un chat interno o de atencion al cliente, con la ventaja de que 3B se puede desplegar en una GPU de consumo y los datos no salen de la infraestructura propia.
- Resumen y reescritura de documentacion tecnica en ingles: condensar articulos, actas o tickets en un formato controlado.
- Clasificacion y etiquetado de texto: categorizacion de tickets, deteccion de intencion o extraccion de campos en un flujo por lotes, donde el coste por token es determinante.
- Experimentacion academica y docencia: es un caso de uso realista para estudiar el efecto del fine-tuning con LoRA/QLoRA sobre un modelo base pequeno, comparando antes y despues del ajuste.
- Base para nuevos ajustes: al ser un fine-tune pequeno y con licencia permisiva declarada, sirve como punto de partida para tareas mas especificas dentro de un ciclo de entrenamiento iterativo.
- Despliegue en entornos con requisitos de privacidad o sin conectividad: al caber en GPU de consumo o incluso en CPU con cuantizacion agresiva, puede operar en local en un portatil o en un equipo de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K u otras) y tampoco se documenta una evaluacion de calidad de traduccion (BLEU, chrF, COMET). No se deben extrapolar los resultados publicados de Llama 3.2 3B Instruct a este fine-tune, ya que el ajuste puede alterar el rendimiento de forma significativa y no medida.

## Requisitos de hardware

Estimaciones orientativas calculadas a partir de un modelo denso de 3,21 mil millones de parametros con 28 capas, 8 cabezas KV y dimension de cabeza 128 (no medidas sobre este repositorio concreto):

- Pesos en BF16/FP16: aproximadamente 6,4-7 GB de VRAM. Con overhead de activaciones y cache KV, entre 8 y 12 GB en funcion de la longitud de contexto.
- Pesos en 8 bits: aproximadamente 3,5-4 GB. Total tipico entre 5 y 8 GB.
- Pesos en 4 bits: aproximadamente 2 GB. Total tipico entre 3 y 5 GB con contexto moderado.
- Cache KV: aproximadamente 112 KB por token en FP16 (unos 15 GB para 128.000 tokens completos), unos 7,5 GB en int8 y unos 3,7 GB en int4. En la practica, la longitud de contexto efectiva depende en gran medida de la VRAM disponible para la cache.
- GPU recomendadas: para uso comodo con contexto largo, A100 40/80 GB, H100 o L40S. Para contexto moderado e inferencia por lotes, RTX 4090, RTX 4080, L4 o A10G.
- GPU de consumo: si, cabe en tarjetas de 8 GB o mas en cuantizacion de 4 bits, incluidas RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En 8 GB el contexto utilizable sera limitado.
- CPU: es viable en llama.cpp/Ollama con cuantizacion Q4 o Q5, con latencias del orden de decenas de tokens por segundo en CPUs modernas de muchos nucleos; no hay mediciones publicadas para este modelo.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio), vLLM, llama.cpp, Ollama y TGI, siempre que los pesos disponibles sean compatibles con el formato esperado por cada motor.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de sus fichas publicas; conviene verificarlos en la fuente original antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gliteceo/Sabi-Translate-v2 | 3,21 mil millones | 128.000 tokens | apache-2.0 declarada (modelo base bajo Llama 3.2 Community License) | Fine-tune sin evaluacion publicada, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | Modelo base de referencia, con evaluacion publicada por Meta |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil millones (aproximado) | 32.768 tokens nativos, extensible a 128.000 | Apache-2.0 | Alternativa multilingue con licencia permisiva |
| google/gemma-2-2b-it | 2,6 mil millones | 8.000 tokens | Gemma Terms of Use | Modelo mas pequeno, contexto muy inferior |
| microsoft/Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 tokens | MIT | Buen rendimiento en razonamiento para su tamano |

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset, hiperparametros, tarea objetivo ni evaluacion. No hay evidencia publica de que el modelo funcione correctamente para traducir, pese a su nombre.
- Ausencia de benchmarks: no es posible comparar su calidad con alternativas de forma objetiva.
- Riesgo de olvido catastrofico: al ser un fine-tune de un modelo pequeno (3B), es probable que haya degradado capacidades generales del modelo base, especialmente razonamiento, codigo y matematicas. No verificado.
- Riesgo de alucinacion: inherente a los modelos de esta escala, agravado por la falta de evaluacion.
- Idiomas: la etiqueta `en` es la unica declarada. No hay confirmacion de soporte multilingue, lo que es especialmente critico si el modelo esta destinado a traduccion.
- Restricciones de licencia: aunque el autor declara apache-2.0, el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License de Meta. Es necesario revisar si la relicencia a Apache-2.0 es compatible con los terminos del modelo base antes de cualquier uso comercial. Este punto es critico y debe verificarse legalmente.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, lo que dificulta validar su procedencia y reproducibilidad.
- Tamano del repositorio inusual: 0,2 GB frente a los ~1,8-2 GB esperables para pesos completos de un 3B en 4 bits. Conviene inspeccionar los archivos antes de asumir que contiene un modelo completo utilizable.
- Fechas de publicacion inusuales (octubre de 2026) en los metadatos del repositorio.
- No apto para produccion sin una evaluacion propia previa: sin datos de calidad, sesgos ni robustez, su uso en sistemas criticos no esta justificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gliteceo/Sabi-Translate-v2
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Ficha oficial de Llama 3.2 3B Instruct: no disponible en la informacion proporcionada (referencia habitual: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
- Paper del modelo: no disponible
- Blog o anuncio del autor: no disponible
- Demo o espacio asociado: no disponible
