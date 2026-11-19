# PrimeNeural/Qwen3-0.6B-pnn-d50-int4-j41

## Resumen

Qwen3-0.6B-pnn-d50-int4-j41 es una versión modificada del modelo Qwen3-0.6B de Alibaba, publicada por PrimeNeural (PreciseStatistics GmbH) bajo el paradigma que denominan Prime Neural Network (PNN). Se trata de un derivado del transformer original en el que 197 capas lineales se sustituyen por capas PNN con una densidad global del 63 %, donde cada capa tiene su propia densidad entre el 50 % y el 100 %. En cada capa, cada salida lee un conjunto fijo y estructurado de entradas, con el mismo número de entradas para todas las salidas y sin almacenar índices, lo que reduce el coste computacional y de memoria respecto a una capa densa equivalente.

El modelo conserva la arquitectura base de Qwen3-0.6B, pero los pesos se almacenan en INT4 con una escala por fila de salida, mientras que las partes densas restantes se mantienen en bfloat16. El fichero final pesa 314,7 MB (503,34 MB con el vocabulario completo), frente a los aproximadamente 1,5 GB del modelo original en bf16. La concordancia top-1 con el modelo original en datos reservados es del 70,52 %, lo que da una medida concreta de la degradación introducida por la compresión.

El modelo es relevante por dos motivos. Primero, explora una vía de compresión estructural alternativa a la cuantización clásica y al pruning no estructurado, con un formato propio que requiere un cargador específico (`pnn_load.py`) y un paquete PNN aparte. Segundo, su licencia Apache 2.0 sobre los pesos derivados lo hace utilizable comercialmente, aunque el paquete PNN y el formato tienen licencia separada de PreciseStatistics GmbH.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3-0.6B) con 197 capas lineales sustituidas por capas PNN dispersas estructuradas |
| Parametros totales | 118.441.761 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B, no confirmada) |
| Tipos de cuantizacion | INT4 con una escala por fila de salida; partes densas en bfloat16 |
| Idiomas soportados | en, pt (solo se conservan 78.497 de 151.936 tokens del vocabulario, el 99,99 % del texto en esos idiomas) |
| Licencia | apache-2.0 (pesos); el paquete PNN tiene licencia separada de PreciseStatistics GmbH |
| Formato de pesos | safetensors (formato PNN propietario, cargable mediante `pnn_load.py`) |

## Arquitectura y entrenamiento

La arquitectura parte del transformer de Qwen3-0.6B. Sobre esa base, 197 capas lineales se convierten en capas PNN: cada salida lee un conjunto fijo y estructurado de entradas, con el mismo número de entradas por salida y sin almacenar índices. La densidad global es del 63 %, con densidades por capa entre el 50 % y el 100 %. Los pesos resultantes se cuantizan a INT4 con una escala por fila de salida, mientras que las partes densas que no son PNN se mantienen en bfloat16.

El entrenamiento se realizó mediante destilación durante 3 épocas sobre una mezcla de `wikimedia/wikipedia` (50 %) y `wikimedia/wikipedia` (50 %), según la model card (la mezcla aparece duplicada en el texto original, lo que sugiere un error de redacción del autor). La inicialización es por mínimos cuadrados y el objetivo de destilación es el emparejamiento de estados ocultos (hidden-state matching). No se menciona RLHF, DPO ni ajuste por preferencias. La innovación técnica principal es el propio formato PNN: dispersión estructurada sin almacenamiento de índices, con un kernel propio que acelera la inferencia en CPU y GPU NVIDIA respecto a la ejecución en PyTorch plano.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3-0.6B, con una concordancia top-1 del 70,52 % respecto al original en datos reservados.
- Capacidades multilingües limitadas a inglés y portugués; el vocabulario recortado cubre el 99,99 % del texto en esos dos idiomas.
- Ejecución de las capas PNN en PyTorch plano, con kernel propio del paquete PNN para CPU y GPU NVIDIA.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documenta modo thinking, visión ni audio en la información disponible.
- El modelo no es cargable con `AutoModelForCausalLM.from_pretrained` estándar; requiere `pnn_load.py` y el paquete PNN.

## Casos de uso

- Despliegue en entornos con memoria muy limitada: con 314,7 MB en INT4, el modelo cabe en dispositivos con poca RAM o VRAM, lo que permite ejecutar un derivado de Qwen3-0.6B en hardware de gama baja.
- Procesamiento de texto en inglés y portugués en el borde (edge): clasificación, resumen o generación breve en aplicaciones locales donde el espacio de almacenamiento es crítico.
- Evaluación de técnicas de compresión: sirve como caso de estudio reproducible para comparar dispersión estructurada PNN frente a cuantización y pruning convencionales sobre un modelo base conocido.
- Investigación sobre destilación: el objetivo de hidden-state matching y la métrica de concordancia top-1 permiten analizar la fidelidad de la destilación en modelos pequeños.
- Prototipado rápido con el endpoint de primeneural.net: el autor indica que el modelo se sirve como endpoint de inferencia, útil para pruebas sin infraestructura propia.
- Filtrado y moderación de contenido en portugués e inglés: tareas de clasificación de texto que toleran la degradación del 70,52 % de concordancia top-1 respecto al original.
- Docencia y experimentación con formatos propietarios: el cargador `pnn_load.py` y el paquete PNN permiten estudiar un formato de pesos no estándar en un entorno controlado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Concordancia top-1 con el modelo original (datos reservados) | 70,52 % |
| Tamano del fichero | 314,7 MB (INT4; densas en bfloat16) |
| Tamano con vocabulario completo | 503,34 MB |
| Tokens conservados | 78.497 de 151.936 (99,99 % del texto en en y pt) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con el fichero INT4 de 314,7 MB, más el overhead de activaciones y del runtime de PyTorch.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que el kernel PNN acelera la ejecución en CPU y GPU NVIDIA.
- Cabe en GPU de consumo: sí, por el tamaño reducido del fichero, aunque no se detallan modelos concretos.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, ya que las capas PNN no son un tipo de capa de transformers. El despliegue requiere `pnn_load.py` y el paquete PNN, o el endpoint de primeneural.net.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-pnn-d50-int4-j41 | 118.441.761 | no disponible | apache-2.0 (pesos) | safetensors PNN | Concordancia top-1 del 70,52 % con el original; requiere paquete PNN |
| Qwen/Qwen3-0.6B | no disponible en la informacion | no disponible en la informacion | apache-2.0 | safetensors | Modelo base original, sin compresion PNN |
| Otros derivados comprimidos de Qwen3-0.6B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de alternativas comparables con cifras verificables en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible: la concordancia top-1 con el modelo original es del 70,52 %, lo que implica que aproximadamente tres de cada diez predicciones top-1 difieren del original en datos reservados.
- Cobertura lingüística restringida: solo inglés y portugués; el vocabulario recortado a 78.497 tokens hace que otros idiomas se representen con piezas más pequeñas o no se representen.
- Cargador no estándar: no funciona con `AutoModelForCausalLM.from_pretrained`; requiere `pnn_load.py` y el paquete PNN, lo que complica la integración en pipelines existentes.
- Licencia del paquete: los pesos son Apache 2.0, pero el formato PNN, `pnn_load.py` y el paquete PNN son propiedad de PreciseStatistics GmbH y tienen licencia separada (licencia de evaluación mediante info@primeneural.net), lo que puede limitar el uso comercial del runtime.
- Patente pendiente: el autor declara la patente US 19/685,168 sobre la tecnología PNN, lo que conviene revisar antes de un uso comercial a gran escala.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 0,6B parámetros, el riesgo es inherentemente alto en tareas de conocimiento factual.
- Mezcla de destilación ambigua: la model card indica `wikimedia/wikipedia` (50 %) y `wikimedia/wikipedia` (50 %), lo que sugiere un error de redacción y dificulta reproducir el entrenamiento.
- Sin datos de benchmarks estándar ni de latencia, lo que impide evaluar el rendimiento en tareas concretas antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PrimeNeural/Qwen3-0.6B-pnn-d50-int4-j41
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Plataforma del autor: https://primeneural.net
- Cargador PNN: `pnn_load.py` dentro del repositorio de Hugging Face
- Contacto para licencia de evaluación del paquete PNN: info@primeneural.net
