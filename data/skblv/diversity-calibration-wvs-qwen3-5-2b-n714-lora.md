# skblv/diversity-calibration-wvs-qwen3.5-2b-n714-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n714-lora` es un adaptador LoRA (Low-Rank Adaptation) de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla el usuario de Hugging Face skblv (Kirill Skobelev y colaboradores, según la citación del paper asociado) como artefacto experimental para el estudio "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No es un modelo de propósito general, sino un adaptador de investigación diseñado para calibrar la diversidad de respuestas de un LLM en encuestas de opinión.

El problema que aborda es el fenómeno de colapso de moda (mode collapse) y sobredispersión en las distribuciones de respuesta de los LLM cuando se les pide emular respuestas humanas a preguntas de encuesta. El adaptador se entrena para que la diversidad de las respuestas generadas se aproxime a la diversidad empírica observada en los datos reales de la World Values Survey (WVS), ronda 7. El conjunto de entrenamiento consta de 714 pares encuestado-pregunta, con un subconjunto fijo de un tercio de países y preguntas medibles.

Es relevante ahora porque ejemplifica una línea de trabajo emergente: el uso de fine-tuning ligero (LoRA) para corregir sesgos distribucionales en LLM aplicados a simulación social y encuestas sintéticas, en lugar de reentrenar el modelo completo. Su tamaño reducido (adaptador sobre un modelo de 2B) lo hace accesible para experimentación académica, aunque su naturaleza de artefacto de investigación limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B, no especificada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5-2B es multilingüe, pero no se detalla en la información) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre el modelo base Qwen/Qwen3.5-2B. Se entrenó durante tres épocas sobre 714 ejemplos de encuestado-pregunta extraídos de la World Values Survey, ronda 7 (Haerpfer et al., 2022). El subconjunto de entrenamiento utilizó un tercio fijo y aleatorio de países y preguntas medibles. Cada prompt de usuario contenía una persona demográfica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo era la letra de la opción seleccionada por el encuestado.

La innovación técnica clave es la estrategia de enmascaramiento de la función de pérdida: los tokens del prompt se enmascaran y la pérdida se aplica únicamente al token o tokens de la letra de respuesta y al token EOS. Esto fuerza al adaptador a aprender la distribución de respuestas condicionada a la persona demográfica y a la pregunta, sin contaminar el aprendizaje con la estructura del prompt. El objetivo declarado es calibrar la diversidad relativa de las respuestas generadas (R = 1 en la curva de convergencia), corrigiendo tanto el colapso de moda como la sobredispersión del modelo base. No se especifican datos sobre el número de tokens de entrenamiento totales, la composición completa del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto condicionada a personas demográficas y preguntas de encuesta, devolviendo la letra de la opción seleccionada.
- Emulación de distribuciones de respuesta con diversidad calibrada respecto a datos empíricos de la World Values Survey.
- Capacidades heredadas del modelo base Qwen3.5-2B: generación de texto, razonamiento básico y comprensión multilingüe (no verificadas específicamente en este adaptador).
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona en la información).
- Capacidades multilingües: no disponibles (no se detallan).
- Capacidad especial: calibración de diversidad en respuestas de encuesta, con curva de convergencia documentada en el repositorio.

## Casos de uso

- Investigación en simulación social: el adaptador permite generar respuestas sintéticas a preguntas de la WVS con una diversidad calibrada, útil para estudiar cómo las personas demográficas influyen en la opinión declarada sin depender de encuestados reales.
- Validación de metodologías de encuestas sintéticas: sirve como referencia para comparar si otros LLM o adaptadores reproducen la diversidad empírica de la WVS, usando la métrica de diversidad relativa R descrita en el paper.
- Estudio de sesgos distribucionales en LLM: al estar entrenado para corregir colapso de moda y sobredispersión, es un caso de estudio para analizar cómo el fine-tuning ligero altera las distribuciones de salida.
- Reproducibilidad académica: el adaptador y la curva de convergencia permiten replicar los experimentos del paper arXiv:2609.16454 sobre calibración de diversidad con LoRA de rango 16.
- Experimentación con PEFT sobre modelos pequeños: sirve como plantilla para entrenar adaptadores LoRA con enmascaramiento de pérdida en tareas de clasificación de opciones múltiples con contexto demográfico.
- Docencia y divulgación: ejemplo didáctico de cómo un adaptador de 714 ejemplos puede modificar el comportamiento distribucional de un modelo de 2B sin reentrenarlo por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (R = 1 como línea de calibración), sin valores numéricos de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al ser un adaptador LoRA sobre Qwen3.5-2B, los requisitos son los del modelo base. Un modelo de 2B en FP16 requiere aproximadamente 4-5 GB de VRAM, y en cuantización de 4 bits puede reducirse a unos 1,5-2 GB (estimación orientativa, no confirmada en la información).
- GPU recomendadas: no disponibles en la información; por el tamaño del modelo base, una RTX 3090, RTX 4090 o A100 serían suficientes, pero no se confirma.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de 2B del modelo base, aunque no se especifica en la información.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base Qwen/Qwen3.5-2B con la librería `peft`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para calibración de diversidad en encuestas) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Artefacto de investigación: el adaptador está entrenado sobre un subconjunto fijo de 714 ejemplos de la WVS ronda 7, por lo que su generalización a otras encuestas, países o preguntas no está garantizada.
- Licencia no disponible: no se especifica la licencia, lo que impide confirmar si el uso comercial está permitido; además, los datos de la WVS tienen sus propias condiciones de uso (DOI: 10.14281/18241.24).
- Idiomas no disponibles: no se detalla qué idiomas soporta el adaptador ni si el entrenamiento se limitó a un idioma concreto.
- Riesgo de alucinación: aunque la tarea es de clasificación de opciones, el modelo base puede generar letras no válidas o texto adicional si no se restringe la decodificación.
- Sesgos conocidos: al entrenarse con un tercio de países, el adaptador puede reproducir sesgos de representación geográfica y demográfica de ese subconjunto.
- Limitaciones de contexto: no se especifica la longitud máxima de prompt soportada; prompts con personas demográficas extensas podrían truncarse.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, y el tamaño es de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o el repositorio está vacío; conviene verificar antes de usarlo.
- El adaptador no sustituye a encuestados reales: su uso para inferir opiniones poblacionales sin validación externa puede producir conclusiones erróneas.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n714-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset WVS ronda 7: https://doi.org/10.14281/18241.24
