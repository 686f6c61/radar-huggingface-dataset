# Hestia07/Pomegranate-Killer-8B

## Resumen

Pomegranate-Killer-8B es un modelo de lenguaje de 8.000 millones de parametros creado por el usuario Hestia07 mediante la fusion (merge) de dos modelos ya existentes: Arcee-AI/Llama-3-Soliloquy-8B y NousResearch/Hermes-3-Llama-3-8B. No se trata por tanto de un entrenamiento desde cero, sino de una interpolacion de pesos con la herramienta LazyMergekit, que aplica el metodo SLERP (interpolacion esferica lineal) capa por capa entre ambos progenitores. El resultado hereda la arquitectura transformer decoder de la familia Llama 3, con 32 capas y pesos en bfloat16.

El interes del modelo es fundamentalmente experimental: busca combinar el ajuste de Hermes-3 (orientado a instrucciones, formato estructurado y uso conversacional) con el caracter de Soliloquy (optimizado para roleplay y escritura creativa en primera persona). La fusion se configura con valores de t distintos para los modulos de atencion y de MLP, de modo que la mezcla no es uniforme a lo largo de la red.

La relevancia practica es limitada por el momento. La ficha de HuggingFace registra 0 descargas y 0 likes, no se ha publicado ninguna evaluacion cuantitativa (benchmarks) ni documentacion adicional sobre que capacidades concretas se conservan o se degradan tras la fusion. Debe tratarse, por tanto, como un artefacto sin validar, apto para experimentacion local pero no recomendable como base de un sistema en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3), 32 capas segun la configuracion del merge (`layer_range: [0, 32]`) |
| Parametros totales | 8B (aproximado, heredado de los modelos base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el merge; los modelos base declaran ventanas distintas (segun sus model cards publicas: 8.192 tokens en Llama-3-Soliloquy-8B y 131.072 tokens en Hermes-3-Llama-3-8B), por lo que la ventana efectiva no esta verificada |
| Tipos de cuantizacion | no disponible (el autor no publica repositorios GGUF, AWQ, GPTQ ni EXL2); el modelo es cuantizable con herramientas estandar (llama.cpp, bitsandbytes, AutoAWQ) |
| Idiomas soportados | no disponible en la informacion proporcionada; los modelos base estan entrenados predominantemente en ingles |
| Licencia | apache-2.0 (declarada en el repositorio; ver advertencias) |
| Formato de pesos | safetensors en bfloat16 (configuracion `dtype: bfloat16` del merge; la model card solo muestra carga con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un merge generado con LazyMergekit sobre dos checkpoints de 8B de la familia Llama 3, ambos cubriendo el rango completo de capas (`layer_range: [0, 32]`). El metodo empleado es SLERP, una interpolacion esferica entre tensores que, a diferencia de la media lineal, preserva la norma de los vectores de pesos y suele producir degradaciones menos severas. El modelo base declarado para el calculo de la interpolacion es NousResearch/Hermes-3-Llama-3-8B.

La configuracion publicada usa valores de t dependientes del modulo: para los tensores de `self_attn` se declara la lista `[0, 0.5, 0.3, 0.7, 1]` y para los de `mlp` la lista `[1, 0.5, 0.7, 0.3, 0]`, con 0,5 como valor por defecto para el resto de tensores. En la semantica de SLERP de mergekit, t controla cuanto pesa cada progenitor en la mezcla, de modo que la atencion y el perceptron multicapa no reciben la misma proporcion de cada modelo. Hay que senalar que la configuracion declara un unico slice con cinco valores de t y no documenta a que tramos de capas corresponde cada uno, por lo que el efecto real capa por capa no es verificable a partir de la informacion publicada.

No hay ninguna fase de entrenamiento posterior al merge: no se documenta fine-tuning, RLHF, DPO ni ajuste de instrucciones sobre el resultado. La innovacion tecnica se limita, por tanto, a la propia receta de fusion; no hay atencion lineal, decodificacion especulativa ni mecanicas nuevas de inferencia.

## Capacidades

- Generacion de texto conversacional: hereda el ajuste de instrucciones de Hermes-3-Llama-3-8B, que responde a indicaciones en formato chat.
- Escritura creativa y roleplay: la aportacion de Llama-3-Soliloquy-8B esta orientada a narrativa en primera persona, dialogos de personaje y textos largos con tono emocional.
- Razonamiento basico y conocimiento general: propio de un modelo de 8B de la generacion Llama 3, sin mejoras documentadas tras el merge.
- Generacion de codigo: esperable por herencia de la familia Llama 3, pero no verificado en esta fusion.
- Soporte de tool calling / function calling: no confirmado. Hermes-3-Llama-3-8B declara soporte de llamadas a herramientas en su model card, pero no hay evidencia de que la fusion conserve esa capacidad con fiabilidad.
- Salidas estructuradas (JSON): no confirmado, por la misma razon.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los progenitores estan centrados en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Plantilla de chat: el repositorio expone `apply_chat_template`, que en la practica aplicara la plantilla heredada del modelo base del merge; no hay documentacion sobre cual se usa finalmente.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo puede mantener dialogos multi-turno con un registro narrativo, gracias a la componente Soliloquy del merge. Es adecuado para prototipos de chatbots de rol donde no se exige consistencia estricta a lo largo de sesiones largas.
- Generacion de ficcion y borradores narrativos: util para producir escenas, descripciones y dialogos en ingles con un tono mas literario que un modelo instruct estandar de 8B. Conviene revisar la salida por posible deriva de estilo entre ambos progenitores.
- Asistente conversacional local: al ser un modelo de 8B cuantizable en 4 bits, puede ejecutarse en una GPU de consumo o incluso en CPU, lo que permite desplegar un asistente sin conexion para uso personal o interno.
- Experimentacion en tecnicas de merge: sirve como caso de estudio para investigar como afectan los valores de t por modulo (atencion frente a MLP) al comportamiento final, comparando contra cada progenitor por separado.
- Generacion de texto en pipelines de evaluacion: util como modelo de referencia adicional en pruebas comparativas de calidad de texto creativo o de robustez conversacional.
- Educacion e investigacion sobre modelos de lenguaje: permite ilustrar de forma practica que es un merge SLERP y que limitaciones tiene frente a un fine-tuning real, con un coste de computo minimo.
- Base para un fine-tuning posterior: al partir de pesos de 8B y licencia declarada permisiva, puede servir como punto de partida para un ajuste especifico, siempre que se resuelva antes la cuestion de la licencia heredada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna evaluacion (MMLU, GSM8K, HumanEval, MT-Bench, EQ-Bench ni similares), y la busqueda web realizada no ha devuelto ningun analisis independiente del modelo. Tampoco hay datos de latencia o throughput. Cualquier cifra de rendimiento habria que obtenerla midiendo directamente cada uno de los tres checkpoints (el merge y sus dos progenitores) bajo el mismo harness de evaluacion.

## Requisitos de hardware

- VRAM en bfloat16 o float16: aproximadamente 16 GB solo para los pesos; con cache KV y activaciones conviene reservar 20-24 GB.
- VRAM en int8 (bitsandbytes): en torno a 9-10 GB.
- VRAM en 4 bits (GGUF Q4_K_M o equivalente): en torno a 5-6 GB, con la ventana de contexto limitada por el espacio restante para la cache KV.
- GPU profesionales: A100 40/80 GB, H100, L40S; sobredimensionadas para un modelo de 8B, donde el cuello de botella sera la latencia, no la memoria.
- GPU de consumo: cabe sin cuantizar en RTX 4090, RTX 3090 y RTX 4080 (16 GB, justo); en 4 bits cabe en RTX 3060 12 GB, RTX 4070, RTX 4060 Ti y similares con 8-12 GB de VRAM.
- CPU y Apple Silicon: viable en 4 bits con llama.cpp o Ollama, con velocidades de generacion muy inferiores a las de GPU. No hay cifras publicadas de tokens por segundo.
- Opciones de despliegue: `transformers` (la unica via documentada por el autor, con `torch_dtype=torch.float16` y `device_map="auto"`), vLLM o TGI para servicio con batching, y llama.cpp / Ollama / LM Studio previa conversion a GGUF, ya que el autor no distribuye pesos cuantizados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Pomegranate-Killer-8B | 8B | no verificado (hereda de los progenitores) | apache-2.0 declarada | Repositorio HuggingFace con 0 descargas | Sin benchmarks publicados |
| NousResearch/Hermes-3-Llama-3-8B | 8B | 131.072 tokens segun su model card | no disponible en la informacion proporcionada | Ampliamente distribuido y cuantizado | No hay datos en la informacion disponible |
| Arcee-AI/Llama-3-Soliloquy-8B | 8B | 8.192 tokens segun su model card | no disponible en la informacion proporcionada | Disponible en HuggingFace | No hay datos en la informacion disponible |
| Meta-Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Licencia comunitaria Llama 3.1 | Referencia de la categoria, con amplio soporte de herramientas | No hay datos en la informacion disponible |

Los dos progenitores son, en la practica, las alternativas mas directas: si el objetivo es instrucciones y funciones estructuradas, Hermes-3 es la opcion con comportamiento documentado; si el objetivo es roleplay, Soliloquy es la referencia. Pomegranate-Killer-8B solo aporta valor si la mezcla concreta supera a ambos, extremo que no esta demostrado con ninguna medicion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, comparativas ni pruebas de regresion publicadas por el autor, por lo que se desconoce que capacidades se han degradado con la fusion.
- Riesgo de interferencia entre progenitores: fusionar un modelo de roleplay con uno de instrucciones mediante SLERP puede producir un comportamiento intermedio incoherente, con cambios de registro o de plantilla de chat a mitad de conversacion.
- Conflicto de plantillas de chat: Soliloquy y Hermes-3 emplean formatos de prompt distintos. Al declarar Hermes-3 como modelo base del merge, la plantilla heredada sera previsiblemente la de Hermes-3, lo que puede impedir que se active el comportamiento de personaje de Soliloquy.
- Alucinaciones: como cualquier modelo de 8B sin verificacion factual especifica, tiende a inventar datos, citas y referencias, especialmente en dominios especializados.
- Idioma: no hay evidencia de soporte solido de castellano; los datos de entrenamiento de los progenitores son mayoritariamente en ingles.
- Contexto incierto: la ventana efectiva del merge no esta documentada y probablemente este limitada por el progenitor con la ventana mas corta, no por el de 131.072 tokens.
- Licencia potencialmente invalida: el repositorio declara apache-2.0, pero ambos progenitores derivan de Llama 3 y estan sujetos a la licencia comunitaria de Meta. Una declaracion unilateral de Apache-2.0 por parte de un tercero no elimina esas condiciones, por lo que el uso comercial es juridicamente arriesgado sin una revision especifica.
- Sin mantenimiento ni soporte: ficha creada y actualizada el mismo dia, sin descargas ni interacciones, sin autor conocido detras y sin garantia de correcciones.
- No apto para produccion sin validacion previa: cualquier despliegue deberia ir precedido de una evaluacion propia frente a los dos modelos base en las tareas objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hestia07/Pomegranate-Killer-8B
- Modelo base 1: https://huggingface.co/Arcee-AI/Llama-3-Soliloquy-8B
- Modelo base 2: https://huggingface.co/NousResearch/Hermes-3-Llama-3-8B
- Herramienta de merge utilizada (notebook de LazyMergekit): https://colab.research.google.com/drive/1obulZ1ROXHjYLn6PPZJwRR6GzgQogxxb?usp=sharing
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: unicamente enlaces a sitios de resultados deportivos (mackolik.com, flashscore.com.tr), sin relacion con el contenido de esta ficha.
