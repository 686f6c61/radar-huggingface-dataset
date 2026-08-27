# AdarshSingh7647/HETU-Qwen3-8B-MathReasoning-CotGen

## Resumen

HETU-Qwen3-8B-MathReasoning-CotGen es un modelo de lenguaje de 8.190 millones de parámetros desarrollado por AdarshSingh7647, perteneciente a la suite HETU (Hints Enable True Understanding). Se trata de un fine-tuning completo (pesos base + adaptador LoRA fusionados) sobre el modelo Qwen3-8B de Alibaba, especializado en razonamiento matemático y generación de cadenas de pensamiento (chain-of-thought). El modelo está diseñado para tareas como AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond y MMLU, y su método de entrenamiento (CotGen) consiste en generar una cadena de razonamiento completa antes de emitir la respuesta final.

El modelo se publica como un checkpoint final en bf16, con formato safetensors, y está orientado a la generación de texto (pipeline de transformers). Su relevancia radica en ser una alternativa de código abierto y ligera para tareas de razonamiento matemático, aprovechando las capacidades del modelo base Qwen3-8B, que ya soporta modos de pensamiento y no pensamiento, así como 119 idiomas. Sin embargo, la información pública sobre este fine-tuning específico es limitada: no se han divulgado detalles del dataset de entrenamiento, licencia o resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B tiene 128k tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en bf16) |
| Idiomas soportados | no disponible (hereda del modelo base: 119 idiomas y dialectos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer con arquitectura de mezcla de expertos? No, Qwen3-8B es un modelo denso, no MoE. El fine-tuning se realizó mediante LoRA (adaptadores de bajo rango), que posteriormente se fusionaron con los pesos base para obtener el checkpoint final. El entrenamiento sigue la metodología HETU (Hints Enable True Understanding), que se centra en la generación de cadenas de razonamiento completas antes de emitir la respuesta final (CotGen). No se han publicado detalles sobre el dataset específico, el número de tokens de entrenamiento ni si se usaron técnicas adicionales como RLHF o DPO. El modelo base Qwen3-8B fue entrenado con datos masivos en múltiples idiomas y soporta modos de pensamiento híbridos, pero el fine-tuning aquí descrito no especifica si conserva esa funcionalidad.

## Capacidades

- Generación de texto con razonamiento matemático y lógico, orientado a problemas de competición (AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond, MMLU).
- Generación de cadenas de razonamiento (chain-of-thought) antes de producir la respuesta final, lo que mejora la interpretabilidad y la precisión en tareas de matemáticas.
- Soporte de tool calling y function calling (heredado del modelo base Qwen3-8B), aunque no se confirma si el fine-tuning mantiene esta capacidad.
- Capacidades multilingües (heredadas del modelo base, que cubre 119 idiomas), pero no se especifica si el entrenamiento de razonamiento matemático se limita a inglés u otros idiomas.
- Modo de pensamiento (thinking mode) y modo no pensamiento (non-thinking mode) del modelo base, aunque no se indica si el fine-tuning los preserva.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo puede abordar problemas de AIME, MATH-500 u otros estándares, generando un razonamiento paso a paso que facilita la verificación y la comprensión.
- Tutoría y asistencia educativa: puede explicar procedimientos matemáticos complejos a estudiantes, mostrando el proceso de razonamiento en lugar de solo el resultado final.
- Evaluación automática de razonamiento: en pipelines de evaluación de modelos, puede usarse para generar soluciones detalladas que sirvan como referencia o para validar respuestas.
- Generación de ejercicios y problemas matemáticos: a partir de un contexto dado, el modelo puede crear problemas con su correspondiente solución razonada.
- Integración en sistemas de QA con razonamiento: en aplicaciones de preguntas y respuestas que requieren deducción matemática, como análisis de datos o interpretación de tablas.
- Investigación en razonamiento simbólico: como punto de partida para estudios sobre cadenas de pensamiento y aprendizaje con pistas (hints), dada su metodología HETU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. La model card menciona que se evaluó en tareas como AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond y MMLU, pero no se proporcionan cifras. Para referencia, el modelo base Qwen3-8B alcanza un 81.2% en MMLU (modo pensamiento) y un 73.0% en GSM8K (según datos de Alibaba), pero estos valores no son atribuibles al fine-tuning HETU.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, un modelo de 8.2B parámetros requiere aproximadamente 16-17 GB de VRAM solo para los pesos, más memoria para el contexto y los estados intermedios. Se recomienda al menos 24 GB de VRAM para una ventana de contexto razonable.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con suficiente memoria.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 4 bits (p. ej., con bitsandbytes) se puede ejecutar en una RTX 3060 de 12 GB, aunque con menor rendimiento.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con `device_map="auto"`. El modelo es compatible con el ecosistema de Hugging Face y con `text-generation-inference` (indicado en los tags).
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la longitud de la cadena de razonamiento, que puede ser larga en problemas matemáticos complejos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento matemático | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HETU-Qwen3-8B-MathReasoning-CotGen | 8.2B | no disponible | Especializado (cotgen) | no disponible | HuggingFace (safetensors) |
| Qwen3-8B (base) | 8.2B | 128k | Bueno, con modo thinking | Apache 2.0 | HuggingFace, múltiples formatos |
| DeepSeek-R1-Distill-Qwen-8B | 8.2B | 128k | Alto (destilado de R1) | MIT | HuggingFace |
| Qwen2.5-Math-7B | 7.6B | 32k | Alto (especializado en matemáticas) | Apache 2.0 | HuggingFace |

La comparativa es cualitativa, ya que no se dispone de métricas propias del modelo HETU. El modelo base Qwen3-8B tiene licencia Apache 2.0, pero el fine-tuning no declara su licencia, por lo que se debe verificar con el autor antes de uso comercial.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo ni sobre su comportamiento en dominios fuera de las matemáticas. Al estar basado en Qwen3-8B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: como cualquier LLM, puede generar razonamientos matemáticos plausibles pero incorrectos, especialmente en problemas novedosos o ambiguos.
- Limitaciones de contexto: no se confirma la longitud de contexto del fine-tuning; si el entrenamiento se realizó con secuencias más cortas, la capacidad de manejar contextos largos puede verse reducida respecto al modelo base.
- Restricciones de licencia: la licencia no está disponible en el repositorio. El modelo base Qwen3-8B usa Apache 2.0, pero no se garantiza que el fine-tuning herede esa licencia. Se debe contactar con el autor para uso comercial.
- Advertencia para producción: el modelo está pensado para investigación y experimentación; no se ha validado en entornos de producción. Se recomienda una evaluación exhaustiva en el dominio objetivo antes de desplegarlo.

## Enlaces

- [HuggingFace - HETU-Qwen3-8B-MathReasoning-CotGen](https://huggingface.co/AdarshSingh7647/HETU-Qwen3-8B-MathReasoning-CotGen)
- [HuggingFace - Qwen3-8B (modelo base)](https://huggingface.co/Qwen/Qwen3-8B)
- [GitHub - Qwen3 (Alibaba)](https://github.com/QwenLM/Qwen3)
- [SiliconFlow - Qwen3-8B info](https://www.siliconflow.com/models/qwen3-8b)
- [Robots Atlas - Qwen3-8B](https://robotsatlas.com/ai-models/qwen3-8b)
