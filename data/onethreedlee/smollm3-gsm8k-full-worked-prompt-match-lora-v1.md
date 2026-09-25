# onethreedlee/SmolLM3-GSM8K-full-worked-prompt-match-lora-v1

## Resumen

SmolLM3-GSM8K-full-worked-prompt-match-lora-v1 es un ajuste fino supervisado (SFT) del modelo HuggingFaceTB/SmolLM3-3B, publicado por el usuario onethreedlee en HuggingFace. El nombre del repositorio indica que el entrenamiento se ha orientado a la resolucion de problemas de matematicas de primaria al estilo GSM8K, con soluciones completas desarrolladas paso a paso ("full worked") y un formato de prompt que coincide con el de evaluacion. El resultado es un adaptador derivado de un modelo base de 3.000 millones de parametros, no un modelo entrenado desde cero.

El modelo base, SmolLM3-3B, es un transformer decoder-only de 3B parametros desarrollado por HuggingFaceTB, con soporte de razonamiento en modo pensamiento y sin pensamiento, ventana de contexto larga y formacion en seis idiomas. Esto lo situa en la categoria de modelos pequenos que pueden ejecutarse en GPU de consumo, lo que convierte a este ajuste en un candidato razonable para experimentacion en razonamiento matematico con recursos limitados.

La relevancia de esta publicacion es limitada pero concreta: es un ejemplo reproducible de fine-tuning con TRL 0.29.1 sobre un modelo pequeno y moderno, util para quien quiera estudiar adaptadores LoRA orientados a tareas de razonamiento. El repositorio no incluye evaluacion, no declara licencia explicita y no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que debe tratarse como material experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base SmolLM3-3B); este repositorio contiene un adaptador LoRA |
| Parametros totales | 3.000 millones en el modelo base; el repositorio ocupa 0,1 GB, compatible con un adaptador LoRA (no disponible el numero exacto de parametros entrenables) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para el ajuste; el modelo base SmolLM3-3B soporta contexto largo (64k tokens nativos, extensibles a 128k con YaRN segun su documentacion publica) |
| Tipos de cuantizacion | No disponible. Al ser pesos en safetensors, admite cuantizacion posterior a 8 bits y 4 bits (bitsandbytes, GPTQ, AWQ) o conversion a GGUF tras fusionar el adaptador |
| Idiomas soportados | No disponible en la model card del ajuste; el modelo base cubre seis idiomas (ingles, frances, aleman, espanol, italiano y portugues) segun su documentacion publica |
| Licencia | No disponible. La model card incluye el campo placeholder "licence: license" sin texto de licencia; el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El ajuste se construye sobre SmolLM3-3B, un transformer decoder-only autorregresivo de 3.000 millones de parametros. La arquitectura del modelo base incorpora atencion con consultas agrupadas (GQA) y capas sin codificacion posicional (NoPE) intercaladas, una tecnica que favorece la extrapolacion de contexto en tareas de recuperacion de informacion a larga distancia. El entrenamiento del modelo original se realizo sobre del orden de 11 billones de tokens en varias fases, incluyendo una fase final de extension de contexto, y con modos de razonamiento explicitos (pensamiento y no pensamiento) que se controlan mediante plantillas de chat. Estos datos corresponden a la documentacion publica del modelo base, no al repositorio analizado.

En cuanto al ajuste, la model card indica unicamente que se ha utilizado SFT mediante TRL 0.29.1, con Transformers 4.57.6, PyTorch 2.14.0, Datasets 4.8.5 y Tokenizers 0.22.2. El identificador del repositorio apunta a un dataset derivado de GSM8K con soluciones completas y prompts alineados con el formato de evaluacion, pero no se especifican el numero de ejemplos, la composicion del dataset, la configuracion de LoRA (rango, alpha, modulos objetivo), la tasa de aprendizaje, las epocas ni la semilla. Tampoco se documenta el uso de tecnicas posteriores al SFT como DPO, RLHF o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional: el ejemplo de la model card utiliza la tarea de text-generation con formato de mensajes de chat, por lo que el modelo conserva la interfaz conversacional del modelo base.
- Resolucion de problemas matematicos de tipo GSM8K: es el objetivo declarado del ajuste, con soluciones desarrolladas paso a paso.
- Razonamiento encadenado (chain-of-thought): el entrenamiento sobre soluciones completas favorece la produccion de pasos intermedios antes de la respuesta final.
- Razonamiento en modo pensamiento: heredado del modelo base SmolLM3-3B, que separa el bloque de razonamiento de la respuesta final.
- Capacidades multilingues: no verificadas en este ajuste; dependen del modelo base y pueden haberse degradado con el fine-tuning especializado.
- Tool calling y function calling: no documentado en la model card. El modelo base dispone de plantilla de herramientas, pero no hay evidencia de que el ajuste lo preserve.
- Uso como agente y razonamiento multipaso: no documentado ni evaluado.
- Capacidades de vision o audio: no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Generacion de conjuntos de datos matematicos sinteticos: el modelo puede producir soluciones paso a paso a problemas aritmeticos y algebraicos basicos, utiles como material de entrenamiento o como datos de aumento para otros modelos pequenos.
- Evaluacion de tecnicas de fine-tuning: sirve como caso de estudio reproducible de SFT con TRL sobre un modelo de 3B parametros, permitiendo comparar configuraciones de LoRA y de datos de entrenamiento con un coste bajo.
- Tutoria matematica para niveles de primaria y secundaria: el formato de solucion desarrollada encaja con la explicacion guiada de un problema, aunque requiere supervision humana por el riesgo de errores aritmeticos.
- Prototipado de asistentes conversacionales en GPU de consumo: al derivar de un modelo de 3B, puede ejecutarse en una unica tarjeta grafica de gama media para validar productos antes de escalar a modelos mayores.
- Investigacion sobre sobreajuste y olvido catastrofico: al estar ajustado sobre un unico dominio, es un sujeto adecuado para medir la degradacion de capacidades generales tras un SFT intensivo.
- Generacion y validacion de razonamientos en pipelines de evaluacion: puede usarse para producir cadenas de razonamiento que despues se filtran o verifican con un modelo mayor o con un verificador simbolico.
- Educacion sobre despliegue de adaptadores LoRA: permite practicar la carga con PEFT, la fusion de pesos y la conversion a GGUF para servir el modelo en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tabla de evaluacion, ni comparacion con el modelo base, ni metricas de GSM8K, MMLU, HumanEval u otros conjuntos. Tampoco se documenta el impacto del ajuste sobre las capacidades generales de SmolLM3-3B, por lo que no es posible afirmar que la especializacion haya mejorado el rendimiento en matematicas sin degradar otras tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) unos 12 GB; en fp16/bf16 alrededor de 6-7 GB; en cuantizacion de 8 bits aproximadamente 3,5-4 GB; en 4 bits alrededor de 2-2,5 GB. Estas cifras corresponden al modelo base de 3B parametros fusionado con el adaptador; el adaptador por si solo requiere un consumo minimo adicional.
- GPU recomendadas: NVIDIA A100 40 GB o H100 para despliegues con lotes grandes y contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia comoda en fp16 con contexto amplio; RTX 3060 de 12 GB, RTX 4070 o similares para cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB ejecuta el modelo base en fp16 con contexto moderado, y tarjetas con 8 GB pueden hacerlo con cuantizacion de 4 bits.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador directamente; vLLM o TGI para servir el modelo fusionado en GPU; llama.cpp u Ollama tras fusionar el adaptador y convertir los pesos a GGUF. La libreria declarada en el repositorio es transformers, por lo que la ruta mas directa es la carga del adaptador sobre SmolLM3-3B.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-GSM8K-full-worked-prompt-match-lora-v1 (este modelo) | 3B (adaptador LoRA sobre SmolLM3-3B) | No disponible | No disponible (placeholder en la model card) | Publicado en HuggingFace, sin descargas registradas |
| HuggingFaceTB/SmolLM3-3B (modelo base) | 3B | 64k nativos, hasta 128k con YaRN segun documentacion publica | Apache-2.0 | Publicado en HuggingFace |
| Qwen2.5-3B | 3,09B | 32k, ampliable con YaRN segun documentacion publica | Apache-2.0 para la mayoria de variantes | Publicado en HuggingFace |
| Llama-3.2-3B | 3,2B | 128k segun documentacion publica | Licencia comunitaria de Llama 3.2 | Publicado en HuggingFace |

La comparacion de rendimiento no esta disponible: este ajuste no publica metricas, por lo que no puede situarse frente a las alternativas en GSM8K ni en evaluaciones generales. A efectos practicos, la diferencia relevante es que los tres modelos comparados cuentan con licencia explicita y evaluaciones publicas, mientras que este repositorio no ofrece ninguna de las dos cosas.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene el campo "licence: license" sin contenido, lo que deja el uso comercial en un limbo legal. El modelo base es Apache-2.0, pero eso no resuelve automaticamente la licencia del ajuste; conviene contactar con el autor antes de cualquier uso productivo.
- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni analisis de regresion de capacidades. No hay evidencia publica de que el ajuste mejore GSM8K.
- Especializacion estrecha: el entrenamiento sobre un unico dominio puede provocar olvido catastrofico y degradar el rendimiento en tareas generales de conversacion, codigo o multilingue.
- Riesgo de alucinacion en aritmetica: los modelos de este tamano cometen errores de calculo y pueden presentar una cadena de razonamiento coherente que conduzca a un resultado incorrecto, lo que es especialmente peligroso en contextos educativos.
- Posible contaminacion del dataset: GSM8K es un conjunto de evaluacion ampliamente utilizado y su uso directo como datos de entrenamiento invalida cualquier comparacion posterior con las metricas estandar del conjunto.
- Idiomas no declarados: no se especifica que idiomas conserva el ajuste. Si el dataset de entrenamiento era solo en ingles, es probable que el rendimiento en castellano sea inferior al del modelo base.
- Contexto no verificado: aunque el modelo base admite contextos largos, no hay confirmacion de que el ajuste preserve esa capacidad, ya que el SFT sobre secuencias cortas puede degradar el comportamiento a larga distancia.
- Repositorio sin adopcion: cero descargas y cero valoraciones en el momento de la publicacion, sin pipeline declarado, lo que complica determinar el modo de uso previsto.
- Fechas de creacion y actualizacion poco fiables: el repositorio figura creado y actualizado el 25 de septiembre de 2026, con versiones de librerias (Transformers 4.57.6, PyTorch 2.14.0) que no coinciden con lanzamientos publicos conocidos, lo que sugiere un entorno de ejecucion personalizado o metadatos incompletos.
- Sin garantias de soporte: no hay issues resueltos, documentacion de hiperparametros ni scripts de entrenamiento publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onethreedlee/SmolLM3-GSM8K-full-worked-prompt-match-lora-v1
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de vLLM: https://docs.vllm.ai
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
