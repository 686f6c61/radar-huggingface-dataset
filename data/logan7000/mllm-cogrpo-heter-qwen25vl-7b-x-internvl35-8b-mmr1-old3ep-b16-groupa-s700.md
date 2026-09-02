# logan7000/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupA-s700

## Resumen

El modelo `mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupA-s700` es un modelo experimental de investigación multimodal (visión-lenguaje) desarrollado por Logan Yang (logan7000). Su nombre indica una fusión heterogénea de dos arquitecturas VLM: Qwen2.5-VL-7B e InternVL3.5-8B, entrenadas con CoGRPO, una variante del método de optimización por política de grupo (GRPO) aplicada a modelos multimodales.

El modelo forma parte de una serie de experimentos del autor orientados a explorar la fusión de arquitecturas heterogéneas y el entrenamiento con refuerzo en modelos de visión-lenguaje. El repositorio ocupa 16,6 GB en formato safetensors, lo que sugiere un modelo de aproximadamente 8 mil millones de parámetros en precisión bf16. Es un modelo de carácter claramente investigador, con solo 29 descargas y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida multimodal: Qwen2.5-VL-7B + InternVL3.5-8B (fusión heterogénea) |
| Parametros totales | 848.896 (según metadatos safetensors); el tamaño del repo (16,6 GB) sugiere ~8,3B en bf16, lo que indica una posible discrepancia en los metadatos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina dos arquitecturas de visión-lenguaje: Qwen2.5-VL-7B, desarrollado por Alibaba, e InternVL3.5-8B, desarrollado por OpenGVLab. La denominación "heter" sugiere que la fusión no es un simple merge de pesos, sino una integración heterogénea de componentes de ambas arquitecturas, posiblemente a nivel de capas o bloques de atención. El tag `qwen2_5_vl` en HuggingFace confirma que la base principal es Qwen2.5-VL.

El entrenamiento utiliza CoGRPO, una variante de GRPO (Group Relative Policy Optimization) adaptada a modelos multimodales. El nombre del modelo codifica hiperparámetros concretos: 3 épocas ("old3ep"), batch size 16 ("b16"), grupo A ("groupA") y paso 700 ("s700"). No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Comprensión multimodal: procesa simultáneamente imágenes y texto, heredando las capacidades de Qwen2.5-VL-7B e InternVL3.5-8B.
- Razonamiento visual: capacidad de responder preguntas sobre contenido visual, incluyendo OCR, descripción de escenas y análisis de diagramas.
- Generación de texto: capacidades de generación de lenguaje natural de los modelos base.
- Entrenamiento con refuerzo: optimizado mediante CoGRPO, lo que puede mejorar la alineación con preferencias humanas en tareas multimodales.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o modos de pensamiento.

## Casos de uso

- Investigación en RL multimodal: el modelo sirve como punto de referencia para estudiar cómo CoGRPO afecta al rendimiento en tareas de visión-lenguaje comparado con los modelos base sin entrenamiento de refuerzo.
- Experimentación con fusión de arquitecturas: permite evaluar si la combinación heterogénea de Qwen2.5-VL e InternVL3.5 produce mejoras sobre cada modelo por separado.
- Benchmarking de modelos VLM: útil para investigadores que necesitan comparar el rendimiento de modelos fusionados frente a los originales en datasets estándar como MMMU, MathVista o DocVQA.
- Estudio de transferencia de conocimiento: analizar qué capacidades de cada arquitectura base se conservan o se pierden tras la fusión y el entrenamiento con RL.
- Desarrollo de pipelines de evaluación: el modelo puede integrarse en pipelines de evaluación automatizada para medir la calidad de respuestas multimodales.
- Exploración de técnicas de alineación: investigar cómo el entrenamiento con refuerzo afecta a la seguridad, la honestidad y la reducción de alucinaciones en modelos VLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 16,6 GB en safetensors, lo que sugiere ~8,3B parámetros en bf16. La inferencia en bf16 requeriría aproximadamente 16-18 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o RTX 6000 Ada. Una RTX 3090 (24 GB) podría ser suficiente para bf16.
- Consumer GPU: cabe en RTX 4090 y RTX 3090 con 24 GB de VRAM en bf16. Con cuantización 4-bit (no disponible en el repo), cabría en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo safetensors sin cuantizaciones GGUF, el despliegue requeriría frameworks como vLLM, Hugging Face Transformers o TGI. No se dispone de versiones GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b (este) | ~8,3B (estimado) | no disponible | no disponible | HuggingFace (experimental) |
| Qwen2.5-VL-7B | 7B | 128K (típico de la serie Qwen2.5-VL) | Apache 2.0 | HuggingFace |
| InternVL3.5-8B | 8B | no disponible | MIT (típico de la serie InternVL) | HuggingFace |

El modelo se diferencia de sus bases por la fusión heterogénea y el entrenamiento con CoGRPO. Sin embargo, al no publicarse benchmarks, no es posible cuantificar si esta fusión aporta mejoras reales sobre los modelos originales.

## Limitaciones y advertencias

- Modelo experimental: con solo 29 descargas y 0 likes, es un modelo de investigación sin validación comunitaria.
- Licencia no declarada: no se especifica la licencia, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas estándar.
- Posibles sesgos heredados: al derivar de Qwen2.5-VL e InternVL3.5, puede heredar sesgos de ambos modelos base.
- Riesgo de alucinación: como todo modelo VLM, puede generar descripciones incorrectas de imágenes o inventar información.
- Sin cuantizaciones disponibles: solo safetensors, lo que limita el despliegue en hardware modesto.
- Información de entrenamiento incompleta: no se detalla el dataset, el número de tokens ni el proceso de alineación.
- Discrepancia en metadatos: el número de parámetros reportado (848.896) no coincide con el tamaño del repositorio, lo que sugiere posibles errores en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-old3ep-b16-groupA-s700
- Perfil del autor: https://huggingface.co/logan7000/models
- Modelo similar (grupo B): https://huggingface.co/q1716523669/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr1-groupB-internvl35-8b-endpoint
- Página de despliegue en FriendliAI: https://friendli.ai/models/q1716523669/mllm-cogrpo-heter-qwen25vl-7b-x-internvl35-8b-mmr
