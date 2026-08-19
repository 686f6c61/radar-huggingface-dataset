# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT

## Resumen
El modelo `reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT` es un modelo de lenguaje de ~2.000 millones de parametros (anunciado como 1.7B) desarrollado por Reaperdoesntrun, de la division de investigacion de Convergent Intelligence LLC. Su objetivo es dotar a un modelo pequeno de capacidades solidas de razonamiento formal y STEM, mediante un proceso de entrenamiento en dos etapas: primero, destilacion de conocimiento desde el profesor `Qwen3-Coder-30B-A3B-Instruct` sobre 6.122 muestras de cadenas de razonamiento (CoT) en 12 dominios cientificos; segundo, un ajuste fino supervisado (SFT) sobre ~54.607 pares de inferencia logica proposicional.

La relevancia del modelo radica en su hipotesis de partida: la estructura de descomposicion secuencial y seguimiento de estado aprendida de un profesor especializado en codigo puede activarse explicitamente mediante SFT en logica formal, logrando un razonamiento solido sin necesidad de escalar el numero de parametros. Esta disenado para entornos edge y de bajos recursos, donde se prioriza la eficiencia computacional sobre la capacidad bruta. La arquitectura base es Qwen3 (causal LM con RoPE y GQA), y el contexto de entrenamiento esta limitado a 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parametros totales | 2.031.739.904 (~2B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento; no se especifica el maximo en inferencia) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura Qwen3-1.7B, un transformer causal con atencion por consultas agrupadas (GQA) y embeddings rotatorios (RoPE). El entrenamiento se divide en dos etapas claramente diferenciadas. En la etapa 1, se realiza destilacion de conocimiento (knowledge distillation) desde el profesor `Qwen3-Coder-30B-A3B-Instruct`, un modelo MoE de 30B con 3B activos especializado en codigo. La destilacion utiliza una temperatura T=2.0 y una funcion de perdida combinada: un 55% de entropia cruzada ponderada por prueba (proof-weighted cross-entropy, con pesos de 2.5 a 1.5 sobre tokens de derivacion) y un 45% de divergencia KL escalada por T². Los datos de esta etapa son 6.122 muestras CoT de dominios STEM (matematicas, fisica, ingenieria, biologia, etc.) procedentes de los datasets de 0xZee.

En la etapa 2, se realiza un ajuste fino supervisado (SFT) sobre el dataset `KonstantinDob/logic_inference_dataset`, que reproduce el conjunto de datos del paper LogicInference de Google Research. Este dataset contiene ~54.607 pares instruccion-respuesta sobre logica proposicional, implicacion logica e inferencia formal, usando la particion IID y el formato LOGICINFERENCEe (primero la inferencia, luego la respuesta final). La tasa de aprendizaje en esta etapa es menor (5e-6 frente a 1.5e-5 inicial de la etapa 1) para preservar el backbone aprendido. Ambas etapas usan precision bf16, batch efectivo de 8 y una sola epoca.

## Capacidades
- Generacion de texto y conversacion en ingles.
- Razonamiento paso a paso (chain-of-thought) en dominios STEM: matematicas avanzadas, calculo, algebra lineal, ecuaciones diferenciales, fisica clasica y moderna, electromagnetismo, mecanica teorica, ingenieria, fisiologia y biologia molecular.
- Inferencia logica formal: logica proposicional, implicacion logica, reglas de inferencia y conclusiones a partir de premisas explicitas.
- Razonamiento secuencial y seguimiento de estado, heredados del profesor especializado en codigo.
- Capacidad de descomposicion composicional de problemas complejos en subproblemas.
- No se menciona soporte explicito para tool calling, function calling, vision, audio o modo thinking separado; estas capacidades no estan documentadas en la informacion disponible.

## Casos de uso
- Tutoria STEM en dispositivos edge: el modelo puede generar explicaciones paso a paso de problemas de calculo o fisica en un Raspberry Pi o un portatil de baja gama, gracias a sus ~2B de parametros y su entrenamiento especifico en derivaciones rigurosas.
- Verificacion de razonamiento logico en sistemas embebidos: permite validar cadenas de inferencia proposicional en sistemas de control industrial o automocion, donde se necesita un razonamiento formal sin depender de la nube.
- Asistente de programacion para logica de control: dado su origen en destilacion de un modelo coder, puede ayudar a escribir y depurar condiciones booleanas, invariantes de bucle y precondiciones en codigo de bajo nivel.
- Generacion de documentacion tecnica explicativa: puede redactar justificaciones detalladas de teoremas o propiedades fisicas, estructurando la respuesta en premisas, inferencias y conclusiones.
- Preprocesamiento de datos logicos: puede transformar enunciados en lenguaje natural a representaciones formales de logica proposicional, util para pipelines de datos en investigacion.
- Chatbot conversacional restringido a dominios STEM: adecuado para aplicaciones de atencion al cliente tecnico o foros de ayuda donde las consultas requieren respuestas precisas y razonadas, siempre que el contexto no supere los 1024 tokens.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones en MMLU, HumanEval, GSM8K ni en pruebas de inferencia logica especificas.

## Requisitos de hardware
- VRAM estimada para inferencia: ~4 GB en precision bf16 (2.031.739.904 parametros x 2 bytes). En cuantizacion de 8 bits cabria en ~2 GB, pero no se ofrecen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4090, o incluso Apple Silicon con 8 GB unificados.
- Corre en CPU con llama.cpp si se convierte a GGUF, aunque no se proporciona el archivo; el formato nativo es safetensors para transformers.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), o transformers nativo con `AutoModelForCausalLM`.
- Latencia y throughput estimados: en una RTX 4090, la generacion de 1024 tokens deberia completarse en menos de 5 segundos; en CPU moderna, la latencia seria de 10-20 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | 32K (original) | Apache 2.0 | Modelo base generalista |
| Qwen3-1.7B-Instruct | 1.7B | 32K (original) | Apache 2.0 | Instrucciones y conversacion general |
| Qwen3-1.7B-Coder-Distilled-SFT | ~2B | 1024 (entrenamiento) | Apache 2.0 | Razonamiento STEM + logica formal |
| Llama-3.2-1B-Instruct | 1.2B | 128K | Llama 3.2 Community | Instrucciones generales, multilingue |

La principal diferencia frente a los modelos base o instruct de Qwen es la especializacion: este modelo sacrifica la longitud de contexto (1024 tokens) y la cobertura multilingue para concentrar su capacidad en razonamiento formal y STEM en ingles. Frente a Llama-3.2-1B, ofrece una capacidad de razonamiento logico mas profunda, pero con un contexto mucho mas limitado.

## Limitaciones y advertencias
- Longitud de contexto muy reducida: entrenado con 1024 tokens, lo que impide manejar documentos largos o conversaciones extensas; cualquier tarea que requiera mas contexto fallara o degradara el rendimiento.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No se han publicado benchmarks independientes, por lo que las capacidades declaradas en la model card no estan validadas externamente.
- El dataset de logica (LogicInference) es una reproduccion sintetica de un paper de investigacion, lo que puede limitar la generalizacion a problemas logicos del mundo real.
- Riesgo de alucinacion en dominios fuera de los datos de entrenamiento (STEM y logica), especialmente en tareas creativas o factuales generales.
- Sin cuantizaciones oficiales ni soporte documentado para tool calling o uso agente, lo que limita su integracion en pipelines complejos.
- El tamano real del modelo es de ~2B parametros, no 1.7B como indica el nombre; esto puede afectar a los calculos de VRAM y a las expectativas de rendimiento.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de logica: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference: https://openreview.net/pdf?id=HAGeIS_Lcg9
- Datasets STEM de 0xZee: https://huggingface.co/0xZee
- Sitio del desarrollador: https://convergentintel.com
