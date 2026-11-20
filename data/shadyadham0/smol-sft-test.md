# ShadyAdham0/smol-sft-test

## Resumen

smol-sft-test es un ajuste fino supervisado (SFT) del modelo HuggingFaceTB/SmolLM2-360M, desarrollado por el usuario ShadyAdham0 como proyecto final de la Unidad 1 del curso smol de Hugging Face. El objetivo es concreto: especializar un modelo pequeno de 361,8 millones de parametros en la resolucion de problemas matematicos de primaria mediante razonamiento paso a paso, siguiendo el formato de GSM8K.

El modelo parte de la arquitectura transformer decoder-only de SmolLM2-360M y se entrena con TRL SFTTrainer sobre una mezcla de GSM8K train y 20.000 ejemplos derivados de MetaMathQA. La relevancia practica esta en demostrar cuanto puede mejorar un modelo de menos de 400 millones de parametros en una tarea acotada: pasa de un 3,0% de acierto en GSM8K zero-shot a un 20,4%, aproximadamente siete veces mas, con un coste de entrenamiento de unos 94 minutos en una unica GPU T4 de Kaggle.

No es un modelo de proposito general ni un asistente conversacional. Es una pieza de referencia educativa y un ejemplo de especializacion estrecha: genera cadenas de razonamiento que terminan en el formato `#### <numero>`, sin plantilla de chat, sin soporte multilingue declarado y sin ajuste de seguridad. Su licencia Apache 2.0 permite reutilizarlo y modificarlo libremente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (longitud de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no confirmado por el autor) |
| Idiomas soportados | No disponible; el autor indica que otros idiomas distintos del ingles no estan soportados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM2-360M, un transformer decoder-only denso de 361,8 millones de parametros. El ajuste es de parametros completos (full-parameter SFT) con `SFTTrainer` de TRL, calculando la perdida unicamente sobre la completion. Los datos combinan los 7.473 ejemplos de entrenamiento de GSM8K (con las anotaciones de calculadora `<<...>>` eliminadas) y 20.000 ejemplos derivados de GSM procedentes de MetaMathQA, con las respuestas convertidas al formato `#### N`, todo mezclado aleatoriamente.

El formato de entrenamiento es texto plano: prompt `Question: {question}\nAnswer:` y completion ` {reasoning}\n#### {answer}` seguido de EOS. Los hiperparametros son 2 epocas (1.718 pasos), tamano de lote efectivo 32 (8 x 4 de acumulacion), tasa de aprendizaje 2e-5 con scheduler coseno y 50 pasos de warmup, longitud maxima 512, precision mixta fp16 y gradient checkpointing. El entrenamiento se ejecuto en una sola Kaggle T4 durante aproximadamente 94 minutos, con una perdida final de entrenamiento de alrededor de 0,29. No se menciona RLHF, DPO ni ninguna innovacion de decodificacion; el valor tecnico esta en la receta de especializacion, no en la arquitectura.

## Capacidades

- Generacion de texto con razonamiento matematico paso a paso en formato de cadena de pensamiento, terminando en `#### <numero>`.
- Resolucion de problemas aritmeticos de primaria (estilo GSM8K) en ingles, con prompts en formato `Question: ...\nAnswer:`.
- Generacion determinista recomendada (greedy, `do_sample=False`) segun el ejemplo del autor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso fuera del formato entrenado.
- Sin capacidades de vision, audio ni thinking mode explicito.
- Multilingue: no soportado; el autor advierte que otros idiomas rinden peor que el modelo base.
- Conversacion multi-turno: no soportada (no hay plantilla de chat).

## Casos de uso

- Evaluacion educativa de SFT: usar el modelo como referencia reproducible para comparar recetas de ajuste fino en tareas acotadas, gracias a su bajo coste de entrenamiento (una T4, 94 minutos) y a la evaluacion publicada con lighteval.
- Prototipado de tutoria matematica basica: integrarlo en un cuaderno o demo que reciba problemas de primaria y muestre el razonamiento generado, util para validar interfaces antes de escalar a modelos mayores.
- Generacion de datos sinteticos de razonamiento: emplear sus cadenas de pensamiento como material de arranque o de aumento de datos para entrenar modelos mas grandes, filtrando las respuestas incorrectas.
- Benchmark interno de especializacion: medir la ganancia de SFT frente al modelo base (3,0% a 20,4% en GSM8K) como linea base en experimentos de ajuste fino propios.
- Docencia y formacion: ejemplo didactico de pipeline completo con TRL, desde la preparacion del dataset hasta la evaluacion con lighteval, para cursos de IA.
- Pruebas de infraestructura de inferencia: modelo de 361,8 millones de parametros que cabe en cualquier GPU consumer y sirve para validar despliegues con transformers o text-generation-inference antes de mover cargas mayores.
- Investigacion sobre limites de escala: estudiar donde falla un modelo de este tamano en aritmetica multi-paso, analizando los errores por ejemplo con el dataset de detalles publicado por el autor.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Configuracion | Metrica | Resultado |
|---|---|---|---|
| GSM8K (test, 1.319 preguntas) | zero-shot, greedy | extractive_match (lighteval, gsm8k\|0) | 20,4% ± 1,1 |
| GSM8K, base SmolLM2-360M | zero-shot, greedy | extractive_match | 3,0% ± 0,5 |
| GSM8K, version previa del repo (SFT en 2.000 ejemplos Capybara, sin matematicas) | zero-shot, greedy | extractive_match | 3,18% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp16 (361,8 millones de parametros) mas overhead de activaciones y cache KV; en la practica cabe holgadamente en GPUs con 4 GB o mas. En cuantizacion de 8 bits o 4 bits el peso baja de 0,4 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, T4) es suficiente; el autor entreno y evaluo en una Kaggle T4.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (pipeline con `device_map="auto"`), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM no estan confirmados por el autor, aunque al ser un transformer estandar de la familia Llama son tecnicamente plausibles.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo (1.718 pasos, lotes de 32, longitud 512) tardo unos 94 minutos en una T4, lo que da una idea del orden de magnitud del coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smol-sft-test | 361,8 M | No disponible (entrenado a 512) | 20,4% (zero-shot, autor) | Apache 2.0 | Hugging Face |
| SmolLM2-360M (base) | 361,8 M | No disponible en esta ficha | 3,0% (zero-shot, autor) | Apache 2.0 | Hugging Face |
| Version previa del repo (SFT Capybara) | 361,8 M | No disponible | 3,18% (zero-shot, autor) | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos con otros modelos matematicos de tamano similar en la informacion proporcionada; cualquier comparacion adicional seria especulativa.

## Limitaciones y advertencias

- Con 360 millones de parametros y un 20,4% en GSM8K, la mayoria de los problemas multi-paso se responden mal; los errores aritmeticos son frecuentes.
- Entrenado para un unico formato de tarea; los prompts de estilo chat, otros idiomas y tareas no matematicas no estan soportados y probablemente rindan peor que el modelo base.
- El conjunto de entrenamiento de GSM8K forma parte de los datos de entrenamiento; el test de GSM8K no se uso para entrenar, pero no se comprobo el posible solapamiento entre MetaMathQA (derivado de los conjuntos de entrenamiento de GSM8K y MATH) y los elementos del test.
- No tiene ajuste de seguridad; no debe usarse para decisiones importantes ni como fuente fiable de resultados.
- Riesgo de alucinacion en el razonamiento: puede producir cadenas de pensamiento plausibles con un resultado final incorrecto.
- Sesgos conocidos: no documentados por el autor; al derivar de SmolLM2-360M, hereda los sesgos de sus datos de preentrenamiento, no evaluados en esta ficha.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias de calidad para produccion en tareas abiertas.
- El repositorio tiene 0 likes y un unico resultado de evaluacion declarado por el autor, no verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShadyAdham0/smol-sft-test
- Dataset de detalles de evaluacion: https://huggingface.co/datasets/ShadyAdham0/details_ShadyAdham0__smol-sft-test
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
