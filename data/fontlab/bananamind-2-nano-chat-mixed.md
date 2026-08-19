# fontlab/BananaMind-2-Nano-Chat-mixed

## Resumen

BananaMind-2-Nano-Chat-mixed es una versión cuantizada del modelo BananaMind/BananaMind-2-Nano-Chat, un modelo de lenguaje pequeño (SLM) de aproximadamente 10 millones de parámetros desarrollado por BananaMind AI. Esta variante, publicada por el usuario fontlab, utiliza un método de cuantización mixto que combina pesos ternarios (valores -1, 0, +1) y pesos de 8 bits para reducir el tamaño del archivo a 10,48 MB, lo que lo hace apto para ejecutarse en dispositivos con recursos muy limitados, incluida la CPU. El modelo está diseñado para el motor de inferencia bananamend, que no es compatible con transformers estándar.

La relevancia de este modelo radica en su extremada ligereza: con menos de 10 millones de parámetros y un peso de apenas 10 MB, puede desplegarse en entornos embebidos, aplicaciones de escritorio o incluso en navegadores. La cuantización mixta busca mantener la calidad de generación de texto del modelo original, midiendo qué matrices pueden tolerar representación ternaria sin degradar significativamente las respuestas. Aunque no se han publicado benchmarks estándar, la model card reporta una coincidencia del 96,8% en el siguiente token respecto al modelo en float, con una divergencia KL de 0,0104.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm) |
| Parametros totales | 9.979.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: ternaria (3 matrices) e int8 (68 matrices), grupo de 64 |
| Idiomas soportados | no disponible (el modelo base parece entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con codigos y escalas (no floats), requiere motor bananamend |

## Arquitectura y entrenamiento

El modelo base BananaMind-2-Nano-Chat es un transformer causal de lenguaje con tokenizer de digitos (digit-tokenizer) y arquitectura personalizada, segun las etiquetas de HuggingFace. No se dispone de informacion detallada sobre el numero de capas, dimensiones de atencion o el dataset de entrenamiento. El modelo cuantizado se obtiene mediante un proceso post-entrenamiento que combina tecnicas de cuantizacion: primero se calibra con un texto de referencia, luego se aplica una busqueda de umbral por grupo de 64 pesos con escalas asimetricas (inspirado en Ternary Weight Networks y PT2-LLM), seguido de una cuantizacion columna a columna con compensacion de error (similar a GPTQ). Finalmente, se mide el impacto de cada matriz y se asignan pesos ternarios solo a aquellas que menos afectan a las respuestas, mientras que el resto se cuantiza a 8 bits. Este enfoque evita la perdida severa de calidad que ocurriria si todas las matrices fueran ternarias en un modelo de este tamano.

## Capacidades

- Generacion de texto conversacional: el modelo puede mantener dialogos multi-turno, como demuestra la aplicacion de escritorio que lo usa.
- Razonamiento basico: al ser un modelo muy pequeno, sus capacidades de razonamiento son limitadas, pero puede responder preguntas simples y generar texto coherente.
- Soporte de chat: el motor bananamend proporciona una interfaz de chat con historial, sistema de prompt editable y control de creatividad.
- Multilingue: no se ha especificado, aunque el modelo base parece orientado al ingles.
- Sin tool calling ni funciones de agente: no hay evidencia de soporte para estas capacidades.

## Casos de uso

- Asistente de chat en aplicaciones de escritorio: el modelo se integra en una app PySide6 que funciona completamente en CPU, ideal para entornos sin GPU.
- Generacion de texto en dispositivos embebidos: su tamano de 10 MB permite ejecutarlo en Raspberry Pi, microcontroladores con suficiente RAM o sistemas de bajo consumo.
- Prototipado rapido de aplicaciones de lenguaje: los desarrolladores pueden probar ideas de generacion de texto sin necesidad de infraestructura costosa.
- Educacion y demostraciones: sirve para ensenar conceptos de modelos de lenguaje y cuantizacion en aulas o talleres.
- Procesamiento de texto en local: puede usarse para tareas de autocompletado, resumen breve o generacion de respuestas en aplicaciones que requieren privacidad total.
- Investigacion sobre cuantizacion: el repositorio incluye un informe de cuantizacion por tensor, util para estudiar el impacto de pesos ternarios en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta metricas de calidad de cuantizacion comparando el checkpoint cuantizado con el float en un texto de calibracion:

| Medida | Valor |
|---|---|
| Mismo siguiente token | 96,8% |
| Siguiente token entre los cinco primeros | 100,0% |
| Divergencia (KL) | 0,0104 |
| Perplejidad | 67,5 (cuantizado) frente a 66,3 (float) |
| Respuestas greedy identicas | 3 de 8 |

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 10,48 MB, por lo que en int8 la VRAM necesaria es inferior a 20 MB. En CPU, la RAM requerida es minima (menos de 100 MB con overhead).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una GPU integrada puede ejecutarlo. Tambien funciona en CPU pura.
- Compatibilidad con consumer GPU: si, todas las GPUs de consumo actuales pueden ejecutarlo sin problemas.
- Opciones de despliegue: el motor bananamend (libreria `bananamendr` y CLI `bananamendy`) es el unico soportado. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un modelo de 10M de parametros, la generacion en CPU es casi instantanea (menos de 100 ms por token en hardware moderno, estimacion razonable).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamano similar (por ejemplo, TinyLlama-1.1B, Qwen2-0.5B, SmolLM-135M) porque no hay benchmarks publicados. La comparacion se limita a aspectos generales:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| BananaMind-2-Nano-Chat-mixed | ~10M | no disponible | Apache 2.0 | Safetensors (bananamend) |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | Safetensors, GGUF |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Safetensors, GGUF |
| Qwen2-0.5B | 0.5B | 32768 | Apache 2.0 | Safetensors, GGUF |

El modelo de BananaMind es significativamente mas pequeno que estas alternativas, lo que lo hace unico para entornos con restricciones extremas de memoria, pero a costa de una capacidad de razonamiento muy reducida.

## Limitaciones y advertencias

- Tamano extremadamente pequeno: con solo 10M de parametros, el modelo tiene una capacidad limitada para tareas complejas, razonamiento logico o comprension profunda del lenguaje.
- Riesgo de alucinaciones: al ser tan pequeno, es probable que genere respuestas incoherentes o inventadas en temas fuera de su distribucion de entrenamiento.
- Contexto limitado: no se ha especificado la longitud de contexto, pero por su tamano probablemente sea corto (menos de 2048 tokens).
- Idioma: no se ha confirmado soporte multilingue; el modelo base parece entrenado principalmente en ingles, por lo que su rendimiento en otros idiomas puede ser deficiente.
- Dependencia del motor bananamend: el formato de pesos no es legible por transformers ni por otros frameworks estandar, lo que limita su portabilidad.
- Calidad de cuantizacion: aunque la coincidencia de siguiente token es alta (96,8%), las respuestas greedy identicas solo son 3 de 8, lo que indica que las respuestas completas pueden variar notablemente respecto al modelo original.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero no hay garantias de soporte ni mantenimiento.

## Enlaces

- Modelo cuantizado: https://huggingface.co/fontlab/BananaMind-2-Nano-Chat-mixed
- Modelo base: https://huggingface.co/BananaMind/BananaMind-2-Nano-Chat
- Repositorio del motor bananamend: https://github.com/twardoch/bananamend
- Aplicacion de escritorio de ejemplo: https://github.com/mpottinger/bananamind-2-nano-chat
