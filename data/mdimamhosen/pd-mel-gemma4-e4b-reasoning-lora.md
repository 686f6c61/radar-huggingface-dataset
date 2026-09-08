# mdimamhosen/pd-mel-gemma4-e4b-reasoning-lora

## Resumen

El modelo `pd-mel-gemma4-e4b-reasoning-lora` es un adaptador LoRA (PEFT) desarrollado por mdimamhosen sobre el modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits de Gemma 4 E4B de Google DeepMind. Su propósito es enseñar al modelo a generar razonamientos visuales paso a paso sobre espectrogramas Mel de grabaciones de voz, condicionados a una etiqueta de clase (`healthy` o `parkinsons`). El modelo está orientado a investigación en explicabilidad de señales de voz para la enfermedad de Parkinson, dentro de un contexto de investigación EDGE.

El adaptador fue entrenado mediante QLoRA con Unsloth y TRL SFT, utilizando como profesor un modelo Gemma 4 31B que generó trazas de razonamiento. El conjunto de entrenamiento consta de aproximadamente 1134 muestras de espectrogramas Mel. El modelo base es multimodal (imagen y texto) y cuenta con una ventana de contexto de hasta 256K tokens, aunque el adaptador está diseñado para una tarea muy específica en inglés. Se distribuye bajo licencia Apache 2.0 y tiene un tamaño de repositorio de 0.4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language LoRA (PEFT) sobre Gemma 4 E4B (modelo multimodal de Google DeepMind) |
| Parámetros totales | Adaptador LoRA: no disponible; modelo base Gemma 4 E4B: ~4B (según el autor) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (heredada del modelo base Gemma 4 E4B) |
| Tipos de cuantización | Modelo base en 4-bit (bitsandbytes); adaptador LoRA en safetensors |
| Idiomas soportados | Inglés (en); el modelo base Gemma 4 soporta más de 140 idiomas, pero el adaptador está destinado a inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); modelo base en 4-bit |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32, construido sobre `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, que es la versión instruida del modelo Gemma 4 E4B de Google DeepMind cuantizada en 4 bits. Gemma 4 es una familia de modelos abiertos multimodales que aceptan entradas de imagen y texto, y generan texto como salida. El adaptador se centra en la tarea de razonamiento visual sobre espectrogramas Mel, un formato de imagen que representa la energía de una señal de voz en función del tiempo y la frecuencia.

El entrenamiento se realizó con el framework Unsloth y TRL SFT, durante 1 época y 270 pasos, con una pérdida final de aproximadamente 0.30. El conjunto de datos de entrenamiento contiene alrededor de 1134 muestras de espectrogramas Mel etiquetados como `healthy` o `parkinsons`. Las respuestas objetivo son trazas de razonamiento generadas por un modelo profesor `google/gemma-4-31B-it` en cuantización 4-bit, ejecutado en una GPU Kaggle T4×2. El formato de salida del modelo es una secuencia de pasos numerados encerrados entre las etiquetas `{REASONING_START}` y `{REASONING_END}`.

## Capacidades

- Genera razonamientos visuales paso a paso sobre espectrogramas Mel, explicando características como inestabilidad armónica, textura de respiración o desenfoque de formantes.
- Entrada multimodal: acepta una imagen (PNG de espectrograma Mel) y un texto con la etiqueta de clase (`Class label: parkinsons` o `Class label: healthy`).
- Salida estructurada en formato de texto con pasos numerados, pensada para facilitar la interpretación humana.
- Capacidad de razonamiento condicionado: explica por qué una imagen de espectrograma encaja con una etiqueta dada, en lugar de clasificar la imagen de forma autónoma.
- Soporte de tool calling, agentes, generación de código, matemáticas o visión general: no disponible. El adaptador está especializado exclusivamente en la tarea descrita.
- Capacidades multilingües: limitadas al inglés, según la configuración del adaptador.

## Casos de uso

- Investigación en explicabilidad de señales de voz para Parkinson: el modelo puede utilizarse para generar razonamientos automáticos sobre espectrogramas Mel de pacientes y controles sanos, ayudando a identificar qué características visuales son más relevantes para cada clase.
- Destilación de razonamiento en biomedicina: sirve como ejemplo de cómo transferir capacidades de razonamiento desde un modelo grande (Gemma 4 31B) a un modelo pequeño (Gemma 4 E4B) mediante QLoRA, reduciendo el coste de despliegue.
- Demostraciones en papers académicos: el adaptador puede usarse para ilustrar la viabilidad de modelos de razonamiento visual en dominios biomédicos concretos, sin necesidad de un modelo de gran tamaño.
- Prototipos de apoyo a la investigación clínica: aunque no es un dispositivo de diagnóstico, puede asistir a investigadores en la inspección visual de espectrogramas, generando hipótesis sobre las diferencias entre voces sanas y parkinsonianas.
- Generación de datos sintéticos de razonamiento: las salidas del modelo pueden emplearse para crear conjuntos de datos etiquetados con explicaciones, útiles para entrenar otros modelos de análisis de voz.
- Evaluación de robustez de razonamiento visual multimodal: el adaptador permite estudiar cómo un modelo pequeño maneja tareas de interpretación de imágenes biomédicas con información textual condicionante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo base tiene ~4B parámetros y se carga en 4-bit, se espera que los pesos ocupen aproximadamente 2-4 GB de VRAM, más el overhead del adaptador y el procesamiento de imágenes. Sin embargo, no hay datos oficiales.
- GPU recomendadas: no se especifican. El modelo base Gemma 4 E4B puede ejecutarse en GPUs de consumo, pero no hay confirmación para este adaptador.
- Compatibilidad con GPU consumer: probablemente sí, dada la cuantización 4-bit y el tamaño de ~4B, pero no hay datos oficiales.
- Opciones de despliegue: el model card muestra cómo cargar el adaptador con Unsloth `FastVisionModel` y `load_in_4bit=True`. También puede cargarse localmente tras descargar la carpeta del adaptador. No se mencionan vLLM, Ollama, TGI ni llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pd-mel-gemma4-e4b-reasoning-lora | ~4B (base) + LoRA | 256K tokens | Apache 2.0 | Hugging Face | Adaptador especializado en razonamiento sobre Mel para Parkinson |
| Gemma 4 E4B (base) | ~4B | 256K tokens | Apache 2.0 | Hugging Face | Modelo generalista multimodal, sin adaptación específica |
| Gemma 4 31B (profesor) | ~31B (estimado) | 256K tokens (esperado) | Apache 2.0 | Hugging Face | Modelo utilizado para generar las trazas de razonamiento; no es un adaptador |

Nota: los parámetros de Gemma 4 31B no se han confirmado en la información disponible; se indica como estimación basada en el nombre del modelo.

## Limitaciones y advertencias

- Depende de que la etiqueta de clase (`healthy` o `parkinsons`) se proporcione correctamente en el prompt; el modelo no clasifica la imagen por sí mismo.
- El razonamiento visual generado puede ser plausible pero no reflejar la fisiología real subyacente. No debe usarse como evidencia médica.
- El modelo no es un dispositivo de diagnóstico clínico y no está validado para uso médico.
- El adaptador está entrenado con un conjunto de datos pequeño (~1134 muestras), lo que limita su generalización a otras voces, idiomas o tipos de espectrogramas.
- El modelo base está cuantizado en 4-bit y el adaptador es LoRA; no es un volcado completo en FP16 a menos que se fusione manualmente.
- Solo soporta inglés, a pesar de que el modelo base Gemma 4 sea multilingüe.
- No se han evaluado sesgos específicos en la información disponible. Los resultados pueden variar según la calidad y procedencia de los datos de voz.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/mdimamhosen/pd-mel-gemma4-e4b-reasoning-lora
- Modelo base Gemma 4 E4B en Hugging Face: https://huggingface.co/google/gemma-4-E4B
- Guía de entrenamiento de Gemma 4 con Unsloth: https://unsloth.ai/docs/models/gemma-4/train
