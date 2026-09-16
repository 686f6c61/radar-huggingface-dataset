# manendrasingh/iguana-up-483

## Resumen

Iguana-up-483 (identificador interno `lora_model_UP_483`) es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario manendrasingh en HuggingFace. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que debe cargarse sobre su modelo base, `unsloth/llama-3.2-3b-bnb-4bit`, es decir, la variante de 3.210 millones de parametros de Llama 3.2 de Meta cuantizada a 4 bits con las herramientas de Unsloth. El repositorio ocupa aproximadamente 0,2 GB, coherente con un adaptador de bajo rango y no con un modelo completo.

El problema que resuelve es acotado: adaptar un modelo pequeno y ya cuantizado a una tarea o dominio concreto mediante SFT, con un coste de entrenamiento minimo. El entrenamiento se ha realizado con TRL (version 0.24.0) sobre PEFT 0.20.0, Transformers 5.5.0, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2. La model card no documenta el conjunto de datos, los hiperparametros del ajuste (rango, alpha, tasa de aprendizaje, epocas) ni el objetivo de la especializacion.

Su relevancia actual es principalmente metodologica: sirve como ejemplo reproducible de un flujo Unsloth + TRL + PEFT sobre Llama 3.2 3B en 4 bits. Hay que tener en cuenta que el repositorio registra 0 descargas y 0 likes, no incluye resultados de evaluacion, no declara licencia efectiva (el campo aparece como `licence: license`) y no especifica idiomas de entrenamiento, por lo que no es apto para produccion sin una validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA/PEFT |
| Parametros totales | 3.210 millones en el modelo base; el numero de parametros entrenables del adaptador no esta disponible (el repositorio ocupa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens, heredados del modelo base Llama 3.2 3B |
| Tipos de cuantizacion | el modelo base empleado es una cuantizacion de 4 bits (bnb-4bit de Unsloth); no se documentan cuantizaciones del modelo fusionado resultante |
| Idiomas soportados | no disponibles para el ajuste; el modelo base Llama 3.2 3B soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (compatible con transformers y TRL) |
| Modelo base | unsloth/llama-3.2-3b-bnb-4bit |
| Fecha indicada de creacion | 16 de septiembre de 2026 (segun los metadatos del repositorio) |

## Arquitectura y entrenamiento

El adaptador se apoya en Llama 3.2 3B, un transformer decoder-only con normalizacion RMSNorm pre-norma, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). El vocabulario del modelo base es de 128.256 tokens. Segun la documentacion de Meta, Llama 3.2 3B se entreno con hasta 9 billones de tokens de datos publicamente disponibles, con un corte de conocimiento en diciembre de 2023. Sobre esa base en 4 bits, el autor ha aplicado un ajuste supervisado con el `SFTTrainer` de TRL, guardando unicamente las matrices de bajo rango como adaptador PEFT en safetensors.

No hay informacion sobre el dataset de ajuste, su tamano, su composicion ni si hubo etapas posteriores de alineacion (DPO, RLHF). Tampoco se documentan el rango, el alpha, la tasa de aprendizaje, el numero de epocas, la longitud de secuencia de entrenamiento ni el objetivo concreto de la especializacion. El nombre del repositorio (`iguana-up-483`) podria sugerir el uso del dataset Iguana, habitual en ajustes multilingues y de instrucciones, pero no existe confirmacion en la informacion disponible, por lo que debe tratarse como una hipotesis no verificada. No se declara ninguna innovacion tecnica adicional: se trata de un SFT estandar con LoRA.

## Capacidades

- Generacion de texto e instrucciones en formato conversacional (role `user`), tal como muestra el ejemplo de uso de la model card.
- Respuesta a preguntas abiertas y de tipo razonamiento cualitativo; el unico ejemplo publicado es una pregunta hipotetica sobre viajes en el tiempo.
- Capacidades heredadas del modelo base Llama 3.2 3B: comprension lectora, resumen, reescritura, clasificacion de texto y generacion de codigo basica.
- Soporte multilingue limitado al del modelo base (ocho idiomas oficiales); el efecto del ajuste sobre cada idioma es desconocido.
- No hay evidencia de soporte de tool calling ni function calling en la informacion disponible.
- No hay evidencia de capacidades de agente, razonamiento multi-paso estructurado, modo "thinking", vision ni audio.
- Ventana de contexto teorica de 128.000 tokens heredada del modelo base, no verificada tras el ajuste.

## Casos de uso

- Clasificacion y etiquetado de texto en un dominio concreto: si el ajuste se ha realizado sobre un corpus especifico (no documentado), el adaptador puede servir para tareas de clasificacion con pocos recursos, desplegado sobre el modelo base en 4 bits en una GPU de consumo.
- Generacion de respuestas conversacionales en un asistente de nicho: el modelo puede gestionar dialogos multi-turno apoyandose en la ventana de 128.000 tokens del modelo base, siempre que se valide que el ajuste no ha degradado la coherencia a contexto largo.
- Prototipado rapido de aplicaciones de texto: el tamano reducido del adaptador (0,2 GB) y del modelo base en 4 bits permite iterar en un portatil con GPU discreta o incluso en CPU con llama.cpp tras fusionar y convertir los pesos.
- Experimentacion academica con PEFT: sirve como referencia reproducible de un pipeline Unsloth + TRL + PEFT con las versiones concretas de framework documentadas.
- Generacion de borradores de texto en ingles para tareas internas de baja criticidad, con revision humana obligatoria dado que no hay evaluacion publicada.
- Punto de partida para un ajuste posterior: el adaptador puede combinarse o continuar su entrenamiento con datos propios si el dominio original resulta afin.
- Generacion de codigo en scripts y tareas sencillas, heredando la capacidad del modelo base, integrable en un pipeline de CI para sugerencias, nunca para codigo que se ejecute sin revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no registra evaluaciones. No se deben asumir los resultados del modelo base como representativos del adaptador, ya que el ajuste puede alterarlos en ambas direcciones.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar el modelo base Llama 3.2 3B.
- Inferencia con el modelo base en 4 bits (bnb-4bit, tal como se entreno): aproximadamente 2,5-3,5 GB de VRAM, mas overhead de activaciones y cache KV.
- Inferencia con el modelo base en bf16/fp16: aproximadamente 6,5-8 GB de VRAM para pesos, con margen adicional para contexto largo.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en GPUs de 8 GB si se usa cuantizacion de 4 bits y contextos moderados.
- Cache KV a 128.000 tokens: con GQA y cuantizacion el consumo puede superar los 10-15 GB adicionales, por lo que el contexto maximo practico en GPUs de consumo es muy inferior al teorico.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM o TGI si se fusiona el adaptador con el modelo base; llama.cpp u Ollama unicamente tras fusionar y convertir a GGUF, ya que estos motores no cargan adaptadores PEFT sin conversion.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 3.000 millones de parametros en 4 bits sobre una GPU de consumo suele situarse en decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iguana-up-483 (este modelo) | 3.210 M (base) + adaptador LoRA | 128.000 tokens (heredado) | Adaptador LoRA sobre Llama 3.2 3B en 4 bits | No disponible | HuggingFace, 0 descargas |
| Llama 3.2 3B (Meta) | 3.210 M | 128.000 tokens | Modelo completo, instruction-tuned | Licencia comunitaria de Llama 3.2 | Ampliamente disponible |
| Qwen2.5 3B | 3.090 M | 32.768 tokens (ampliable a 131.072 con RoPE scaling) | Modelo completo | Licencia de investigacion Qwen | HuggingFace |
| Phi-3.5-mini | 3.800 M | 128.000 tokens | Modelo completo | MIT | HuggingFace |
| Gemma 2 2B | 2.600 M | 8.192 tokens | Modelo completo | Terminos de uso de Gemma | HuggingFace |

No hay datos de rendimiento del adaptador que permitan una comparacion cuantitativa con estas alternativas. En igualdad de condiciones, los modelos completos citados son preferibles para produccion por tener licencia clara, evaluaciones publicadas y soporte directo en los motores de inferencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni descripcion del dataset, por lo que se desconoce si el ajuste mejora o degrada las capacidades del modelo base.
- Riesgo elevado de alucinacion: al ser un modelo de 3.000 millones de parametros con un ajuste no verificado, la generacion de hechos incorrectos con fluidez es esperable.
- Licencia no resuelta: el campo de licencia aparece como `licence: license`, un marcador sin contenido. Esto impide determinar si el uso comercial esta permitido. Ademas, el modelo base Llama 3.2 esta sujeto a la licencia comunitaria de Meta, con sus propias condiciones y requisitos de atribucion.
- Idiomas de entrenamiento desconocidos: aunque el modelo base cubre ocho idiomas, no se sabe en que idioma o idiomas se ajusto, por lo que el rendimiento fuera del ingles podria degradarse.
- Contexto real no verificado: los 128.000 tokens son una caracteristica del modelo base; el ajuste con LoRA puede haber alterado el comportamiento en contextos largos, y el coste de memoria de la cache KV limita su uso practico.
- Trazabilidad limitada: 0 descargas y 0 likes, sin paper, sin blog ni demo. La fecha de creacion indicada (2026) resulta inconsistente con las versiones de framework declaradas, lo que sugiere metadatos poco fiables.
- Sesgos: no declarados ni evaluados. Hereda los sesgos del corpus de entrenamiento de Llama 3.2 3B, que Meta documenta de forma generica pero no cuantifica para este adaptador.
- Reproducibilidad: sin hiperparametros de entrenamiento ni semilla, el ajuste no es reproducible tal cual.
- Uso en produccion desaconsejado sin validacion propia, sin fusion y cuantizacion adecuadas y sin revision legal de la licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/manendrasingh/iguana-up-483
- Modelo base: https://huggingface.co/unsloth/llama-3.2-3b-bnb-4bit
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- No se han encontrado en la busqueda web enlaces relevantes sobre este modelo: los resultados devueltos no guardan relacion con el repositorio ni con inteligencia artificial, por lo que se han descartado.
