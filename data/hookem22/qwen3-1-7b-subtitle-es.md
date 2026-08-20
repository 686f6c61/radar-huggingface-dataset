# Hookem22/qwen3-1.7b-subtitle-es

## Resumen

Qwen3-1.7B es un modelo de lenguaje denso de la familia Qwen3, desarrollado por Alibaba y liberado bajo licencia Apache 2.0. El repositorio `Hookem22/qwen3-1.7b-subtitle-es` contiene un fine-tuning de este modelo realizado por el usuario Hookem22, entrenado con las librerías Unsloth y TRL de HuggingFace. Aunque el nombre del repositorio sugiere un uso orientado a subtítulos en español, la model card declara el inglés como idioma soportado, por lo que el alcance lingüístico real no queda confirmado por los metadatos.

El modelo base Qwen3-1.7B es una arquitectura transformer densa de 1.720 millones de parámetros, con una longitud de contexto de 32.000 tokens. Qwen3 introduce un modo de pensamiento (thinking mode) y un modo de no pensamiento, unificados en un mismo modelo, lo que permite alternar entre razonamiento profundo y respuestas rápidas. Este fine-tune conserva esas capacidades del modelo base, aunque no se han publicado detalles sobre el dataset de entrenamiento ni las técnicas de ajuste específicas empleadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-1.7B soporta 32.000 tokens |
| Tipos de cuantizacion | safetensors (pesos completos); no se publican cuantizaciones adicionales en el repositorio |
| Idiomas soportados | Ingles (segun la model card); el nombre del repo sugiere espanol, sin confirmar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-1.7B es un modelo transformer denso, sin mezcla de expertos, con 28 capas y una dimensión de ocultación de 2.048. El modelo base fue entrenado por Alibaba Cloud sobre un corpus multilingüe extenso y posteriormente ajustado con instrucciones y preferencias humanas. Una innovación clave de la familia Qwen3 es la integración de un modo de pensamiento explícito que genera cadenas de razonamiento internas antes de responder, junto con un modo de no pensamiento para respuestas directas.

El fine-tune de este repositorio parte de `unsloth/qwen3-1.7b-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del modelo base optimizada con Unsloth. El entrenamiento se realizó con la librería TRL de Hugging Face, lo que sugiere el uso de técnicas de fine-tuning supervisado o RLHF, aunque no se especifica el dataset, el número de pasos, ni la configuración exacta de hiperparámetros. El nombre del repositorio apunta a un ajuste orientado a subtítulos en español, pero no hay evidencia documental que lo confirme.

## Capacidades

- Generación de texto y completado de secuencias en inglés.
- Razonamiento multi-paso con modo de pensamiento, activable mediante la etiqueta de control correspondiente.
- Instrucción y seguimiento de órdenes complejas.
- Capacidades multilingües heredadas del modelo base, aunque la model card solo declara inglés.
- Soporte de herramientas (tool calling) y uso de agentes, tal como se describe en la documentación de Qwen3.
- No se incluye soporte de visión ni audio en esta versión.

## Casos de uso

- Generación de subtítulos para vídeo: el nombre del repositorio sugiere un fine-tune orientado a esta tarea, aunque no hay documentación que lo confirme. En caso de funcionar, podría generar subtítulos en español o inglés a partir de transcripciones.
- Asistentes conversacionales ligeros: con 1,72B de parámetros, el modelo puede desplegarse en entornos con recursos limitados, como APIs de inferencia o aplicaciones de escritorio.
- Clasificación y extracción de información: su capacidad de seguir instrucciones permite tareas de etiquetado, extracción de entidades o resumen de documentos.
- Generación de código de baja complejidad: el modelo base Qwen3-1.7B muestra competencia básica en programación, útil para autocompletado o explicación de fragmentos simples.
- Prototipado rápido de chatbots: por su tamaño y licencia permisiva, es adecuado para experimentos de producto donde se necesita un modelo pequeño y desplegable en infraestructura modesta.
- Investigación en fine-tuning: al ser un ejemplo de ajuste con Unsloth, puede servir como referencia para reproducir pipelines de entrenamiento eficiente sobre Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación propias, y no se dispone de datos comparativos con el modelo base u otros modelos de tamaño similar. Para una evaluación objetiva de este fine-tune, sería necesario ejecutar pruebas sobre conjuntos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,4 GB de pesos, con overhead de activaciones se recomienda al menos 5 GB de VRAM.
- VRAM estimada para inferencia en 4 bits: el modelo base cuantizado a 4 bits ocupa alrededor de 1 GB de pesos; con activaciones, se recomienda un mínimo de 2 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior para FP16; tarjetas con 4 GB o más para cuantización 4 bits.
- En consumer GPU: sí, cabe en GPUs de gama media como la RTX 3060, RTX 4060 o incluso en chips de gama baja con cuantización.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers estándar.
- Latencia y throughput: no se han publicado mediciones específicas para este fine-tune; en el modelo base, la inferencia es rápida en GPUs modernas, con decenas de tokens por segundo en tarjetas de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,72B | 32K | Apache 2.0 | HuggingFace |
| Qwen3-0.6B (base) | 0,6B | 32K | Apache 2.0 | HuggingFace |
| Qwen3-4B (base) | 4B | 32K | Apache 2.0 | HuggingFace |
| Hookem22/qwen3-1.7b-subtitle-es | 1,72B | 32K (heredado) | Apache 2.0 | HuggingFace |

El fine-tune mantiene la misma arquitectura y tamaño que el modelo base, pero añade un ajuste específico que puede alterar su comportamiento en la tarea de subtítulos. No se dispone de datos de rendimiento que permitan una comparación cuantitativa con los modelos base de la familia Qwen3.

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma soportado, aunque el nombre del repositorio sugiere español. Esta discrepancia no está resuelta en la documentación.
- No se especifica el dataset de entrenamiento ni el proceso de fine-tuning (datos de entrenamiento, método de ajuste, hiperparámetros), lo que dificulta evaluar su calidad y generalización.
- No se han publicado evaluaciones de sesgos ni de alucinación para este fine-tune concreto.
- El modelo base Qwen3-1.7B tiene limitaciones en tareas complejas de razonamiento matemático y de código en comparación con modelos de mayor tamaño.
- Al ser un fine-tune no verificado, es recomendable evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de la calidad del modelo ajustado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Hookem22/qwen3-1.7b-subtitle-es
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Paper tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Guia de despliegue en Qualcomm: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_1_7b/README.md
