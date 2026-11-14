# 360ZhiNao/Light-IF-4B

## Resumen

Light-IF-4B es un ajuste fino del modelo Qwen3-4B desarrollado por 360ZhiNao (Qihoo 360), orientado especificamente a mejorar la capacidad de seguir instrucciones complejas en modelos de lenguaje. El modelo aborda un problema identificado por sus autores: el "razonamiento perezoso" durante la fase de pensamiento, que provoca que los LLM incumplan restricciones detalladas en tareas de instruction following. Para ello proponen un marco de entrenamiento basado en previsualizacion y autoverificacion.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.411.424.256 parametros totales, y se distribuye en formato safetensors bajo licencia Apache 2.0. Incorpora modo de pensamiento (thinking mode) habilitable mediante la plantilla de chat, con separacion explicita entre el contenido de razonamiento y la respuesta final. Su relevancia radica en que, segun los datos publicados por el autor, un modelo de tan solo 4B parametros logra superar en el benchmark SuperClue a modelos mucho mayores como Qwen3-235B-A22B, DeepSeek-R1-0528 o ChatGPT-4o-latest.

El modelo esta pensado para escenarios donde el cumplimiento estricto de restricciones (formato, longitud, estructura, numero de secciones) es critico, y no tanto para conocimiento general o tareas creativas abiertas. La informacion disponible no detalla la longitud de contexto ni los idiomas soportados de forma explicita, aunque al derivar de Qwen3-4B hereda sus caracteristicas base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Light-IF-4B es un ajuste fino supervisado y por refuerzo sobre Qwen3-4B, un transformer denso con modo de pensamiento. El entrenamiento parte de la generacion de datos de instrucciones con restricciones complejas, filtrando las muestras demasiado faciles o demasiado dificiles, y construyendo mediante rejection sampling un conjunto de datos pequeno pero de alta calidad para la adaptacion del modelo. Sobre esa base se aplican dos tecnicas: Entropy-SFT (supervised fine-tuning con preservacion de entropia) y TEA-RL (reinforcement learning adaptativo a la entropia por token), guiado por recompensas multidimensionales basadas en reglas.

La innovacion central es el fomento de un razonamiento "riguroso" mediante previsualizacion y autoverificacion: el modelo planifica por adelantado y comprueba su salida antes de responder, en lugar de producir un razonamiento superficial. Los autores senalan que este enfoque mejora de forma consistente en distintos tamanos de modelo, y que su variante de 32B supera a DeepSeek-R1 y ChatGPT-4o en benchmarks exigentes de instruction following. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat compatible con transformers.
- Modo de pensamiento (thinking mode) habilitable mediante `enable_thinking=True`, con separacion entre contenido de razonamiento y respuesta final.
- Seguimiento estricto de instrucciones con multiples restricciones simultaneas: formato, longitud, numero de secciones, subtitulos, estructuracion.
- Razonamiento con previsualizacion y autoverificacion de la salida.
- Generacion de codigo y contenido estructurado (heredado de Qwen3-4B).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.

## Casos de uso

- Generacion de contenido con formato estricto: el modelo puede producir poemas, articulos o informes que cumplan simultaneamente restricciones de numero de lineas, palabras, estrofas y subtitulos, como demuestra el ejemplo de la model card.
- Pipelines de extraccion de datos estructurados: cuando se requiere que la salida respete un esquema JSON o un formato fijo sin desviaciones, el entrenamiento en instruction following reduce la tasa de incumplimiento frente a modelos base.
- Asistentes conversacionales con reglas de negocio: gestion de conversaciones donde cada respuesta debe cumplir condiciones (tono, longitud, campos obligatorios), aprovechando el modo de pensamiento para verificar el cumplimiento antes de responder.
- Generacion de documentacion tecnica con plantillas: produccion de READMEs, fichas o informes que deban ajustarse a una estructura predefinida de secciones y apartados.
- Evaluacion y benchmark de instruction following: util como modelo de referencia ligero (4B) para comparar el cumplimiento de restricciones en pipelines de evaluacion propios.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B parametros, puede ejecutarse en una unica GPU consumer para tareas de generacion con requisitos de formato, donde modelos mayores no serian viables por coste.
- Prototipado de agentes con pasos verificables: el modo de pensamiento con autoverificacion facilita cadenas de razonamiento donde cada paso debe ajustarse a restricciones antes de continuar.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | SuperClue | IFEval | CFBench | IFBench |
|---|---|---|---|---|
| Qwen3-4B | 0.225 | 0.888 | 0.787 | 0.382 |
| Qwen3-32B | 0.234 | 0.877 | 0.823 | 0.384 |
| Qwen3-235B-A22B | 0.244 | 0.882 | 0.834 | 0.423 |
| Qwen3-235B-A22B-Thinking-2507 | 0.434 | 0.916 | 0.843 | 0.475 |
| DeepSeek-R1-0528 | 0.436 | 0.863 | 0.827 | 0.415 |
| Doubao-seed-1-6-thinking-250615 | 0.362 | 0.832 | 0.820 | 0.477 |
| Doubao-seed-1-6-thinking-250715 | 0.345 | 0.856 | 0.840 | 0.366 |
| ChatGPT-4o-latest | 0.260 | 0.836 | 0.807 | 0.365 |
| DeepSeek-v3-250324 | 0.306 | 0.859 | 0.833 | 0.405 |
| Doubao-1.5-pro-32k-250115 | 0.285 | 0.889 | 0.797 | 0.375 |
| Kimi-K2 | 0.227 | 0.921 | 0.820 | 0.395 |
| GLM-4.5 | 0.395 | 0.893 | 0.833 | 0.466 |
| Light-IF-4B (autor) | 0.445 | 0.916 | 0.800 | 0.443 |

Light-IF-4B obtiene el mejor resultado en SuperClue (0.445) y empata con Qwen3-235B-A22B-Thinking-2507 en IFEval (0.916). En CFBench queda por debajo de varios modelos (0.800) y en IFBench se situa en 0.443, por debajo de Doubao-seed-1-6-thinking-250615 (0.477) y Qwen3-235B-A22B-Thinking-2507 (0.475).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 4,5-5 GB de pesos; a 4 bits: alrededor de 2,5-3 GB.
- GPU recomendadas: A100, H100 o L40S para produccion con throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia en BF16.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en BF16; en 8 GB o menos requiere cuantizacion.
- Opciones de despliegue: transformers (soporte nativo segun la model card), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SuperClue | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Light-IF-4B | 4,4B | no disponible | 0.445 | 0.916 | Apache 2.0 | Hugging Face |
| Qwen3-4B (base) | 4B | no disponible | 0.225 | 0.888 | Apache 2.0 | Hugging Face |
| Qwen3-32B | 32B | no disponible | 0.234 | 0.877 | Apache 2.0 | Hugging Face |
| GLM-4.5 | no disponible | no disponible | 0.395 | 0.893 | no disponible | no disponible |
| DeepSeek-R1-0528 | no disponible | no disponible | 0.436 | 0.863 | no disponible | no disponible |

Frente a su modelo base Qwen3-4B, Light-IF-4B mejora SuperClue de 0.225 a 0.445 e IFEval de 0.888 a 0.916, con un coste computacional identico en parametros. Frente a modelos cerrados como ChatGPT-4o-latest (SuperClue 0.260) o DeepSeek-v3-250324 (0.306), el modelo de 4B obtiene mejor puntuacion en SuperClue segun los datos del autor.

## Limitaciones y advertencias

- El modelo esta especializado en instruction following; su rendimiento en conocimiento general, matematicas avanzadas o razonamiento abierto no se documenta y puede ser inferior al de modelos mayores.
- En CFBench (0.800) queda por debajo de Qwen3-4B base (0.787 no, sino 0.800 frente a 0.787 del base; el base es inferior) y de varios modelos mayores como Qwen3-235B-A22B-Thinking-2507 (0.843); el rendimiento no es uniforme en todos los benchmarks.
- Riesgo de alucinacion inherente a los modelos de 4B parametros, especialmente en tareas de conocimiento factual.
- No se especifican los idiomas soportados; el entrenamiento parece orientado a instrucciones en ingles y chino (benchmarks SuperClue y CFBench son de origen chino), por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada; no se debe asumir la ventana de Qwen3-4B sin verificacion.
- El modo de pensamiento incrementa el consumo de tokens de salida (hasta 32768 en el ejemplo), lo que afecta a latencia y coste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene sus propios terminos que deben respetarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente de los resultados publicados.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/Light-IF-4B
- Hugging Face (organizacion qihoo360): https://huggingface.co/qihoo360/Light-IF-4B
- Paper: https://arxiv.org/abs/2508.03178
- Blog (Zhihu): https://zhuanlan.zhihu.com/p/1936535948360918628
- GitHub: https://github.com/Qihoo360/Light-IF
