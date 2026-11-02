# plnguyen2908/sam-audio-v1

## Resumen

SAM-Audio v1 es un conjunto de pesos de ajuste fino (delta) que acopla un modelo de separación de fuentes de audio, SAM-Audio, con un modelo omni de lenguaje y audio, Qwen3-Omni-30B-A3B-Thinking. Lo publica el usuario plnguyen2908 en Hugging Face y no es un modelo autónomo: es un delta de parámetros entrenados que requiere la arquitectura conjunta original (Qwen + puente + SAM), la inserción de adaptadores LoRA y los pesos base congelados para poder ejecutarse. El repositorio ocupa 0,3 GB, lo que confirma que solo contiene los tensores aprendidos y los buffers, no los pesos del modelo base.

El objetivo declarado es la separación de fuentes de audio guiada por prompt, aprovechando la capacidad del modelo Qwen3-Omni para interpretar instrucciones en lenguaje natural y la del SAM-Audio para aislar componentes de una mezcla. El entrenamiento se realizó sobre 111.068 ejemplos de URMP, ChoralSynth, MSDWild y EasyCom, con 888.544 pares objetivo/prompt procesados a lo largo de ocho épocas, hasta el paso 55.534.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de investigación poco habitual (acoplamiento de un LLM omni con un separador de audio mediante LoRA); por otro, sus propios resultados de evaluación muestran una mejora media de solo +2,8064 dB de SI-SDR sobre la mezcla de entrada, con un empeoramiento de -1,4566 dB en MSDWild. El autor advierte explícitamente de que estos valores no suponen una mejora respecto al SAM-Audio sin modificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo conjunto personalizado: Qwen3-Omni-30B-A3B-Thinking (MoE) + puente + SAM-Audio con LoRA |
| Parámetros totales | No disponible (el delta publicado ocupa 0,3 GB; el modelo base Qwen3-Omni es de 30B totales) |
| Parámetros activos | Aproximadamente 3B en el componente Qwen3-Omni (según el sufijo A3B del nombre del modelo base) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los tensores se distribuyen en safetensors sin cuantización declarada) |
| Idiomas soportados | No disponible |
| Licencia | SAM License (reproducida en LICENSE); se aplican además las licencias y condiciones de acceso de los modelos base |
| Formato de pesos | safetensors (`trained_parameters.safetensors`, `model_buffers.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer monolítico, sino un ensamblaje de tres piezas: el modelo Qwen3-Omni-30B-A3B-Thinking como componente de razonamiento y comprensión multimodal, un módulo puente intermedio y el separador de audio SAM-Audio (base `facebook/sam-audio-large-tv`). Sobre este conjunto se insertan adaptadores LoRA en Qwen, un puente entrenable y LoRA más condiciones entrenables en SAM. Los pesos base permanecen congelados. El autor insiste en que se trata de un delta personalizado y no de un checkpoint estándar cargable con `from_pretrained` de Transformers.

El entrenamiento utilizó 111.068 ejemplos de cuatro corpus: URMP, ChoralSynth, MSDWild y EasyCom. Se procesaron 888.544 pares objetivo/prompt en ocho épocas, alcanzando el paso 55.534. No se documenta en la información disponible el uso de RLHF, DPO ni detalles sobre la composición exacta de los prompts. La carga requiere reconstruir el módulo conjunto sin prefijo `module.`, cargar los tensores con `safetensors.torch.load_file` y copiarlos en los parámetros y buffers con nombre coincidente, tal como muestra el código de la model card.

## Capacidades

- Separación de fuentes de audio guiada por prompt en lenguaje natural, apoyada en la comprensión multimodal de Qwen3-Omni.
- Procesamiento conjunto de audio y texto: el componente Qwen3-Omni aporta capacidades omni (audio, texto y, presumiblemente, visión según el modelo base, aunque no se detalla).
- Ajuste específico sobre dominios musicales y de habla: URMP (música de cámara), ChoralSynth (coral sintético), MSDWild (música real) y EasyCom (habla en entornos reverberantes).
- Inferencia con solver de punto medio y 16 pasos, según la configuración de evaluación reportada.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes ni modo thinking explícito para este delta.

## Casos de uso

- Investigación en separación de fuentes musicales: permite experimentar con separación guiada por instrucciones en lenguaje natural sobre mezclas de URMP y ChoralSynth, donde el modelo reporta las mayores ganancias (+3,04 dB y +9,18 dB de SI-SDR respectivamente).
- Prototipado de pipelines de audio con LLM omni: sirve como base para estudiar el acoplamiento entre un modelo de lenguaje multimodal y un separador de audio, evaluando si el prompt mejora la selección de fuentes.
- Reproducción de experimentos académicos: al publicarse la configuración exacta (`training_config.json`, `sam_tuning.json`) y los buffers, permite replicar el entrenamiento y comparar resultados con el SAM-Audio original.
- Análisis de rendimiento en dominios ruidosos: útil para estudiar por qué el modelo degrada en MSDWild (-1,46 dB) y qué tipo de datos o prompts podrían corregirlo.
- Evaluación de técnicas de ajuste eficiente: el uso de LoRA sobre Qwen y SAM con pesos base congelados es un caso práctico para medir el coste y el beneficio del fine-tuning selectivo en modelos multimodales grandes.
- Docencia y formación: como ejemplo didáctico de ensamblaje de arquitecturas híbridas y de carga manual de tensores con safetensors, dado que no es un modelo estándar de `from_pretrained`.

## Benchmarks y rendimiento

Evaluación sobre 817 ejemplos retenidos, pesos finales, solver de punto medio y 16 pasos. La métrica es la mejora media de SI-SDR (ponderada por ejemplo) respecto a la mezcla de entrada:

| Conjunto | Mejora SI-SDR (dB) |
|---|---|
| Media ponderada | +2,8064 |
| URMP | +3,0443 |
| ChoralSynth | +9,1767 |
| MSDWild | -1,4566 |
| EasyCom | +0,2462 |

El autor advierte de que estos valores no representan una mejora frente al SAM-Audio sin modificar. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El delta ocupa 0,3 GB, pero requiere cargar los pesos base de Qwen3-Omni-30B-A3B-Thinking y SAM-Audio, por lo que el consumo real depende de esos modelos y de su cuantización.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (30B totales, ~3B activos), se necesitarían GPUs de datacenter tipo A100 o H100 para ejecución en precisión completa; no se confirma compatibilidad con RTX 4090.
- ¿Cabe en GPU de consumo? No disponible. Con cuantización agresiva del componente Qwen podría ser posible, pero no se documenta.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga es manual mediante PyTorch y safetensors sobre una arquitectura conjunta construida a medida.
- Latencia y throughput: no disponibles. Solo se indica que la evaluación usa un solver de punto medio con 16 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM-Audio v1 (este) | Delta de 0,3 GB sobre base de 30B (MoE, ~3B activos) | No disponible | Separación de audio guiada por prompt con LLM omni | SAM License + licencias base | Hugging Face, requiere ensamblaje manual |
| SAM-Audio (facebook/sam-audio-large-tv) | No disponible | No disponible | Separación de audio | SAM License | Hugging Face |
| Qwen3-Omni-30B-A3B-Thinking | 30B totales, ~3B activos | No disponible | Modelo omni (texto, audio, visión) | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autónomo: sin la arquitectura conjunta, los LoRA y los pesos base congelados, los tensores publicados no pueden ejecutarse.
- Los resultados de evaluación no superan al SAM-Audio original según el propio autor; la mejora media de +2,8064 dB es modesta y negativa en MSDWild (-1,4566 dB).
- Riesgo de sobreajuste a los cuatro corpus de entrenamiento (URMP, ChoralSynth, MSDWild, EasyCom); no se documenta generalización a otros dominios.
- Licencia: SAM License con condiciones adicionales de los modelos base; es imprescindible revisar si el uso comercial está permitido antes de desplegar.
- No se incluyen el optimizador, el estado RNG ni el estado de reanudación del entrenamiento, lo que limita la reproducibilidad exacta.
- No hay información sobre sesgos, alucinaciones, idiomas soportados ni límites de contexto.
- El repositorio tiene 0 descargas y 0 likes, y no se ha validado de forma independiente; trátese como un experimento de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plnguyen2908/sam-audio-v1
- Modelo base SAM-Audio: https://huggingface.co/facebook/sam-audio-large-tv
- Modelo base Qwen3-Omni: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Thinking
