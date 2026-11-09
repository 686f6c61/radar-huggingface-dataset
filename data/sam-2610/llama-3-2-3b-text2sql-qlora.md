# Sam-2610/Llama-3.2-3B-Text2SQL-QLoRA

## Resumen

Llama-3.2-3B-Text2SQL-QLoRA es un adaptador LoRA (PEFT) publicado por el usuario Sam-2610 sobre el modelo base unsloth/Llama-3.2-3B-Instruct. El nombre del repositorio indica que el ajuste fino se ha orientado a la tarea de traduccion de lenguaje natural a SQL (Text2SQL), aunque la model card no documenta ni el conjunto de datos, ni el procedimiento, ni los resultados de evaluacion. Se trata, por tanto, de un adaptador de investigación de terceros sin validacion publica.

El modelo base subyacente es Llama 3.2 3B Instruct, un transformer decoder-only de Meta con aproximadamente 3.200 millones de parametros y una ventana de contexto de 128.000 tokens. El adaptador se ha entrenado con QLoRA (cuantizacion de 4 bits del modelo base durante el ajuste) y se distribuye en formato safetensors con PEFT 0.21.2, lo que implica que no es un modelo autonomo: requiere cargar el modelo base por separado y aplicar el adaptador encima.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene 0 descargas y 0 likes, no declara licencia, no especifica idiomas y la model card es una plantilla sin rellenar. Cualquier uso en produccion exigiria una evaluacion propia del adaptador sobre un conjunto de datos Text2SQL representativo antes de considerarlo fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | ~3.200 millones en el modelo base; el adaptador LoRA anade un numero no disponible de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.2 3B Instruct; no confirmado para el adaptador |
| Tipos de cuantizacion | QLoRA (4 bits) durante el entrenamiento; el adaptador se distribuye en safetensors (precision no especificada) |
| Idiomas soportados | no disponible (el modelo base Llama 3.2 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, repo de 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 3B Instruct, un transformer decoder-only con atencion por grupos (GQA) y RoPE, preentrenado por Meta sobre un corpus multilingue no documentado en esta ficha. El ajuste fino se realizo con QLoRA, tecnica que cuantiza el modelo base a 4 bits (NormalFloat4) y entrena adaptadores de bajo rango en precision superior, reduciendo drasticamente los requisitos de VRAM. La libreria declarada es PEFT 0.21.2 y las etiquetas incluyen `trl` y `sft`, lo que sugiere entrenamiento supervisado con la libreria TRL, aunque no se detallan hiperparametros, rango del adaptador, alpha ni tasa de aprendizaje.

No hay informacion sobre el dataset de entrenamiento Text2SQL utilizado, el numero de ejemplos, la composicion de esquemas de bases de datos, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). La ausencia de estos datos impide reproducir el entrenamiento o auditar su calidad.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Llama 3.2 3B Instruct.
- Traduccion de lenguaje natural a SQL (Text2SQL), segun la denominacion del repositorio; sin validacion publica de su calidad.
- Razonamiento basico y respuesta a instrucciones en el rango de tamano de 3B parametros.
- Soporte de tool calling y function calling heredado del modelo base Instruct (no verificado especificamente en el adaptador).
- Capacidades multilingues del modelo base (espanol, ingles, aleman, frances, italiano, portugues, hindi, tailandes), no confirmadas tras el ajuste fino.
- Capacidad de ejecucion en hardware de consumo gracias al tamano de 3B parametros y a la posibilidad de cuantizacion adicional.

## Casos de uso

- Prototipado de asistentes Text2SQL en entornos de desarrollo: el adaptador puede cargarse sobre Llama 3.2 3B Instruct para generar consultas SQL a partir de preguntas en lenguaje natural, como paso previo a una validacion manual o a una evaluacion con Execution Accuracy sobre un esquema concreto.
- Generacion de consultas de analitica interna sobre esquemas conocidos: util para equipos que quieran experimentar con un modelo pequeno y desplegable en local antes de invertir en modelos mayores o APIs comerciales.
- Educacion y formacion en SQL: el modelo puede servir como generador de ejemplos de consultas a partir de descripciones, siempre que un instructor revise la salida.
- Integracion en pipelines de CI/CD como generador de borradores de consultas para tests de integracion de bases de datos, con revision obligatoria antes de ejecutar en produccion.
- Investigacion sobre QLoRA y ajuste fino de bajo coste: el repositorio sirve como ejemplo de adaptador PEFT sobre Llama 3.2 3B, util para estudiar el formato de publicacion y la carga con la libreria PEFT.
- Despliegue en entornos con recursos limitados: al requerir solo el modelo base de 3B y un adaptador de 0,1 GB, puede ejecutarse en una GPU de consumo con cuantizacion adicional, adecuado para demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 6,4 GB solo para pesos, mas overhead de activaciones y cache KV (en torno a 8-10 GB en total para contextos moderados).
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 2-3 GB para pesos, permitiendo ejecucion en GPUs de 8 GB.
- GPUs recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para FP16; A100 o H100 no son necesarias para este tamano.
- Cabe en GPUs de consumo: si, practicamente cualquier GPU con 8 GB o mas tras cuantizacion.
- Opciones de despliegue: transformers + PEFT (obligatorio para cargar el adaptador), llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, vLLM o TGI tras fusionar pesos.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sam-2610/Llama-3.2-3B-Text2SQL-QLoRA | ~3,2B (base) + adaptador LoRA | 128k (base) | Text2SQL via QLoRA | no disponible | Hugging Face, 0 descargas |
| Llama 3.2 3B Instruct (unsloth) | ~3,2B | 128k | Instrucciones generales | Llama 3.2 Community License | Ampliamente disponible |
| Defog SQLCoder (variantes) | 7B-15B | variable | Text2SQL especializado | variable segun variante | Hugging Face |
| CodeLlama 7B Instruct | 7B | 16k | Codigo y SQL | Llama 2 Community License | Hugging Face |

La comparativa es orientativa: no existen datos de rendimiento publicados para el adaptador que permitan una comparacion cuantitativa con SQLCoder o CodeLlama en tareas Text2SQL.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no documenta datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License de Meta.
- Riesgo elevado de alucinacion en la generacion de SQL: sin evaluacion publica, no hay garantia de que las consultas generadas sean sintacticamente validas ni semanticamente correctas.
- El adaptador no es un modelo autonomo: requiere cargar unsloth/Llama-3.2-3B-Instruct y aplicar PEFT, lo que anade complejidad de despliegue.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- El ajuste fino sobre un modelo de 3B puede degradar capacidades generales del modelo base (olvido catastrofico) fuera del dominio Text2SQL.
- No se especifican los idiomas soportados tras el ajuste; el rendimiento en espanol no esta verificado.
- Para produccion se recomienda evaluar con Execution Accuracy sobre un conjunto representativo de esquemas y preguntas antes de cualquier despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sam-2610/Llama-3.2-3B-Text2SQL-QLoRA
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Paper de Llama 3.2 (Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
