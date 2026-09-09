# RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-fp16

## Resumen

Este repositorio contiene una version cuantizada a 4 bits del modelo Google Gemma 4 26B-A4B instruction-tuned, elaborada por RepublicOfKorokke mediante el framework oQ (oMLX v0.6.4) en precision mixta. El resultado es un checkpoint en formato MLX safetensors con un tamano de 17,0 GB, disenado para inferencia local en dispositivos Apple Silicon.

El modelo base, google/gemma-4-26B-A4B-it-qat-q4_0-unquantized, es un modelo de lenguaje con 25.805.936.206 de parametros totales y un coste computacional reducido gracias a la arquitectura de mezcla de expertos, probablemente con alrededor de 4.000 millones de parametros activos por token (inferido del sufijo A4B). El sufijo "it" indica que fue afinado para seguir instrucciones, y "qat" senala que se sometio a un entrenamiento con cuantizacion consciente (quantization-aware training) orientado a 4 bits.

Este checkpoint es relevante porque permite ejecutar un modelo de 26B en hardware de consumo mediante un segundo pase de cuantizacion mixta oQ4e con group size 64, aprovechando la eficiencia de la arquitectura MoE y la robustez del QAT previo. Su interes practico radica en la experimentacion con tecnicas de cuantizacion avanzada en entornos locales, sin necesidad de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autoregresivo Genma 4 con arquitectura de mezcla de expertos (MoE, inferido del nombre A4B) |
| Parametros totales | 25.805.936.206 (25,8 mil millones) |
| Parametros activos | ~4.000 millones por token (inferido del sufijo A4B; no confirmado en la informacion tecnica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e) con precision mixta, group size 64, oMLX v0.6.4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-26B-A4B-it-qat-q4_0-unquantized, un modelo de la familia Gemma 4 afinado para instrucciones. El nombre del modelo indica una arquitectura de mezcla de expertos: el sufijo A4B apunta a que aproximadamente 4.000 millones de parametros se activan por token, mientras que el parametro total (25.805.936.206) se corresponde con los 25,8B reflejados en la nomenclatura. El sufijo "qat" confirma que el modelo fue entrenado con cuantizacion consciente, una tecnica que simula la cuantizacion durante el entrenamiento y que en principio permite conservar mejor la calidad despues de comprimir los pesos a 4 bits.

El presente repositorio aplica un segundo pase de cuantizacion mediante el framework oQ de oMLX en su version 0.6.4, usando precision mixta a 4 bits con group size 64. El resultado son pesos en formato MLX safetensors, un formato especifico para el ecosistema de Apple Silicon. No se han publicado datos sobre la composicion del dataset de entrenamiento, el numero de tokens de preentrenamiento, las tecnicas de alineacion (RLHF/DPO) ni el proceso de afinado del modelo base.

## Capacidades

- Generacion de texto e instrucciones: el sufijo "it" indica que el modelo base fue afinado para seguir instrucciones, por lo que esta preparado para tareas de asistente, redaccion y respuesta a preguntas.
- Eficiencia en inferencia local: la arquitectura MoE con alrededor de 4.000 millones de parametros activos por token reduce el coste computacional, y la cuantizacion a 4 bits permite reducir el tamano en disco a 17,0 GB.
- Razonamiento, matematicas y codigo: no disponible. No se han publicado resultados que confirmen capacidades especificas en estas areas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Entrada multimodal (vision/audio): no disponible.
- Modo pensamiento: no disponible.

## Casos de uso

- Asistente conversacional local en Macs con Apple Silicon: al estar en formato MLX safetensors, el modelo se puede cargar directamente con la libreria mlx de Apple, lo que permite ejecutar un asistente de chat sin depender de APIs externas ni de conexion a internet.
- Prototipado de agentes en local: la arquitectura MoE, con solo 4.000 millones de parametros activos, ofrece una latencia razonable para pruebas de concepto de agentes por parte de desarrolladores sin acceso a GPUs de datacenter.
- Evaluacion de tecnicas de cuantizacion: este checkpoint, junto con la variante oQ3e publicada por el mismo autor, permite comparar la degradacion de calidad entre distintos niveles de cuantizacion mixta (4 bits vs 3 bits) sobre un mismo modelo base entrenado con QAT.
- Investigacion en eficiencia de modelos MoE: sirve como ejemplo practico de un modelo de 26B con alrededor de 4B activos, cuantizado a 4 bits, util para estudiar el equilibrio entre tamano en disco, consumo de memoria y calidad de salida.
- Desarrollo offline de herramientas de productividad: puede integrarse en aplicaciones de redaccion, resumen o generacion de textos en el propio dispositivo, sin enviar datos del usuario a servidores externos.
- Formacion y experimentacion academica: permite a estudiantes e investigadores trabajar con un modelo de gran tamano en un portatil con memoria unificada suficiente, para practicas sobre inferencia local, cuantizacion y diseno de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 17,0 GB. En Apple Silicon se recomienda disponer de al menos 24 GB de memoria unificada para cargar el modelo con margen para activaciones y cache KV.
- GPU recomendadas: no disponible. Al ser un modelo MLX, no es ejecutable nativamente en CUDA; se requeriria una conversion previa a otro formato, no documentada por el autor.
- Compatibilidad con GPU de consumo: no disponible. El modelo esta pensado para chips Apple Silicon dentro del ecosistema MLX.
- Opciones de despliegue: MLX/oMLX es la via directa y documentada. No se ofrecen instrucciones para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion mas directa es con la otra variante de cuantizacion publicada por el mismo autor y con el modelo base sin cuantizar, dado que no se dispone de datos sobre alternativas independientes de la misma categoria:

| Modelo | Parametros totales | Activos por token | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Este modelo (oQ4e-fp16) | 25,8 mil millones | ~4.000 millones (no confirmado) | no disponible | 4 bits oQ4e, group size 64 | no disponible |
| Variante oQ3e-fp16 | 25,8 mil millones | ~4.000 millones (no confirmado) | no disponible | Presumiblemente 3 bits (segun el nombre) | no disponible |
| Modelo base (unquantized) | 25,8 mil millones | ~4.000 millones (no confirmado) | no disponible | QAT para 4 bits, pesos sin cuantizar | no disponible |

Las diferencias principales se centran en el nivel de cuantizacion: la variante oQ3e reduciria mas el tamano pero podria degradar mas la calidad, mientras que el modelo base mantiene los pesos sin cuantizar, con un mayor consumo de memoria pero una fidelidad potencialmente superior si se evaluara la calidad.

## Limitaciones y advertencias

- No hay documentacion sobre sesgos, idiomas soportados ni longitud de contexto, lo que impide evaluar la idoneidad del modelo para aplicaciones multilingues o de contexto largo.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que la calidad de las respuestas no esta verificada y podria ser inferior a la del modelo base en precision completa.
- La cuantizacion a 4 bits puede afectar el rendimiento en tareas de razonamiento logico, matematico o de codigo, aunque el entrenamiento QAT del modelo base fue disenado para mitigar esta perdida.
- El formato MLX es especifico de Apple Silicon; el modelo no es directamente compatible con CUDA, TensorRT ni con motores de inferencia habituales de servidor (vLLM, TGI) sin una conversion previa no documentada.
- La licencia es no disponible en la informacion aportada; antes de cualquier uso comercial hay que verificar los terminos de la licencia del modelo original de Google.
- Existe riesgo de alucinaciones, al igual que en cualquier modelo de lenguaje, y al no haberse publicado evaluaciones este riesgo no se puede cuantificar.
- La ausencia de informacion sobre la composicion del dataset y el proceso de afinado implica que no se puede garantizar la ausencia de sesgos ni la idoneidad para produccion sin una validacion propia.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-fp16
- Variante oQ3e: https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-fp16
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Modelo base: google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (URL no proporcionada en la informacion disponible)
