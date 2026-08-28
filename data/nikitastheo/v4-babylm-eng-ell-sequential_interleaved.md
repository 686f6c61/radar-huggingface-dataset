# nikitastheo/v4-babylm-eng-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v4-babylm-eng-ell-sequential_interleaved` es un modelo de lenguaje causal (causal LM) basado en la arquitectura GPT-2, desarrollado por el autor nikitastheo en el contexto de la tarea compartida BabyLM, que busca entrenar modelos de lenguaje con presupuestos de datos a escala humana. Este modelo en concreto se entrena con una mezcla secuencial intercalada de datos en inglés y griego (eng-ell), lo que lo convierte en un experimento de aprendizaje multilingüe con recursos limitados.

Con 108,55 millones de parámetros, es un modelo relativamente pequeño, comparable a los GPT-2 de tamaño medio. El entrenamiento se realizó con un script propio basado en Hugging Face Accelerate, sin usar el `Trainer` estándar, y con un tokenizer de vocabulario de 15.000 tokens. Aunque no se especifica la longitud de contexto, por su arquitectura GPT-2 se asume una ventana de 1024 tokens, pero este dato no está confirmado en la información disponible.

La relevancia de este modelo radica en su enfoque de entrenamiento eficiente y multilingüe, alineado con los objetivos de BabyLM. Sin embargo, al ser un modelo de investigación sin documentación exhaustiva, su uso práctico fuera del ámbito académico es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM, transformer decoder) |
| Parametros totales | 108.550.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles y griego (segun el nombre del modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder con mecanismo de atencion causal. No se especifican detalles sobre el numero de capas, dimensiones ocultas o cabezas de atencion, pero por el numero de parametros (108M) se puede inferir una configuracion similar a GPT-2 medium (unas 12 capas, 768 dimensiones ocultas), aunque esto no esta confirmado.

El entrenamiento se realizo con un script propio (`train_clm.py`) basado en Hugging Face Accelerate, sin usar el `Trainer`. Los hiperparametros principales son: 26.970 pasos de entrenamiento, tasa de aprendizaje de 0,0001 con scheduler lineal, 2.697 pasos de warmup, batch size de 32 por dispositivo y un cambio de idioma en el epoch 10. Esto sugiere que el modelo se entrena primero con un idioma y luego con el otro, o que se alternan de forma secuencial intercalada, como indica el nombre. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

El tokenizer es `nikitastheo/babylm-vocab15-eng-tokenizer`, con un vocabulario de 15.000 tokens, disenado para el corpus BabyLM. No se proporcionan datos sobre el volumen total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto causal: el modelo puede generar texto continuando una secuencia dada, al ser un causal LM estandar.
- Capacidad multilingue limitada: entrenado con datos en ingles y griego, puede producir texto en ambos idiomas, aunque no se especifica el grado de competencia.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, ni modos especiales como thinking mode o vision.
- Al ser un modelo pequeno (108M), su capacidad de razonamiento complejo y generacion de codigo es limitada en comparacion con modelos mas grandes.

## Casos de uso

- Investigacion en aprendizaje eficiente: el modelo es util para estudiar como el entrenamiento con datos limitados y multilingues afecta al rendimiento, especialmente en el marco de BabyLM.
- Experimentos de transferencia entre idiomas: al estar entrenado con ingles y griego, puede servir para analizar la transferencia de conocimiento entre lenguas tipologicamente diferentes.
- Generacion de texto basica en ingles y griego: para prototipos o demos donde se necesite un modelo pequeno y rapido que genere texto en estos idiomas.
- Linea base para comparacion: puede usarse como referencia para evaluar otras tecnicas de entrenamiento eficiente o de mezcla de datos.
- Educacion y aprendizaje: por su tamano reducido, es adecuado para ejecutarse en entornos docentes o en equipos sin GPU potente, para ilustrar el funcionamiento de un LM causal.
- Pruebas de integracion con transformers: al ser compatible con la libreria transformers, puede usarse para validar pipelines de generacion de texto en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. El modelo no presenta metricas de rendimiento comparativas.

## Requisitos de hardware

- Al tener 108M parametros, el modelo es ligero y puede ejecutarse en GPUs de gama media o incluso en CPU con cuantizacion.
- VRAM estimada: con precision FP32, el modelo ocupa aproximadamente 434 MB (108M * 4 bytes). Con cuantizacion a 8 bits, se reduce a unos 108 MB. No se especifican cuantizaciones disponibles, pero al ser safetensors, se puede convertir a GGUF o usar bitsandbytes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32. Una RTX 3060 o superior seria comoda.
- Es compatible con las librerias estandar: transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), y TGI (Text Generation Inference).
- Latencia y throughput: no se dispone de datos medidos. Por su tamano, se espera una generacion rapida en hardware moderno, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos. El modelo pertenece a la familia BabyLM, donde existen otros modelos de tamano similar (por ejemplo, las versiones v2 y v3 del mismo autor, tambien con nombres similares). Sin embargo, no hay datos publicos de rendimiento ni especificaciones detalladas de esos modelos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un corpus limitado (BabyLM), el modelo puede reflejar sesgos presentes en los datos de entrenamiento, aunque no se han documentado explicitamente.
- Riesgo de alucinacion: como cualquier LM generativo, puede producir contenido falso o inventado, especialmente en temas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no esta confirmada, pero si sigue la arquitectura GPT-2, seria de 1024 tokens, lo que limita la coherencia en textos largos.
- Limitaciones de idioma: aunque se entrena con ingles y griego, no se especifica el nivel de competencia en cada uno; puede tener un rendimiento desigual entre ambos.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de usarlo en produccion.
- Documentacion insuficiente: no hay informacion sobre el dataset exacto, la configuracion de capas, ni el proceso de tokenizacion mas alla del nombre del tokenizer. Esto dificulta la reproducibilidad y la evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v4-babylm-eng-ell-sequential_interleaved
- Version v3 del mismo autor: https://huggingface.co/nikitastheo/v3-babylm-eng-ell-sequential_interleaved
- Version v2 del mismo autor: https://huggingface.co/nikitastheo/v2-babylm-eng-ell-sequential_interleaved
- Pagina oficial de BabyLM: https://babylm.github.io/
- Repositorio GitHub de BabyLM: https://github.com/babylm
