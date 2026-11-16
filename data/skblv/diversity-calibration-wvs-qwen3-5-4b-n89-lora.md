# skblv/diversity-calibration-wvs-qwen3.5-4b-n89-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n89-lora` es un adaptador LoRA desarrollado por Kirill Skobelev (usuario `skblv` en Hugging Face) sobre el modelo base Qwen/Qwen3.5-4B. Se trata de un ajuste fino diseñado específicamente para calibrar la diversidad de las respuestas del modelo en tareas de simulación de respuestas a encuestas, en concreto sobre datos de la World Values Survey (WVS) Ronda 7. El adaptador se entrena con un conjunto extremadamente reducido de 89 ejemplos de pares encuestado-pregunta, lo que lo convierte en un caso de estudio de ajuste fino de bajo régimen de datos.

El problema que aborda es el fenómeno de colapso de moda (mode collapse) y sobredispersión en modelos de lenguaje cuando se emplean para simular distribuciones de respuesta de poblaciones humanas. El adaptador forma parte del trabajo de investigación "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454), que propone el ajuste fino como mecanismo para alinear la diversidad de las respuestas generadas con la diversidad calibrada observada en los datos de encuesta.

Es relevante en el contexto actual de uso de LLMs como simuladores de opinión pública y agentes sintéticos, donde la fidelidad de la distribución de respuestas es crítica. El adaptador es de tamaño reducido (0,1 GB), se distribuye en formato PEFT/safetensors y está pensado para cargarse sobre el modelo base Qwen3.5-4B mediante la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer Qwen3.5-4B; rank 16, alpha 32, dropout 0.05 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.5-4B |
| Epocas de entrenamiento | 3 |
| Datos de entrenamiento | 89 ejemplos encuestado-pregunta de WVS Ronda 7 |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA con rango 16, alpha 32 y dropout 0.05, aplicada sobre el transformer Qwen3.5-4B. El entrenamiento se realizó durante tres épocas sobre un subconjunto de 89 ejemplos extraídos de la World Values Survey Ronda 7 (Haerpfer et al., 2022), seleccionando un tercio fijo aleatorio de países y preguntas medibles. Cada prompt de usuario contiene una persona demográfica, la pregunta de encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es la letra de la opción seleccionada por el encuestado.

Una innovación técnica destacable es el enmascaramiento de los tokens del prompt en la función de pérdida: la pérdida se aplica únicamente sobre el token o tokens de la letra de respuesta y el token EOS. Este diseño fuerza al adaptador a aprender la distribución de respuestas condicionada a la persona demográfica sin verse influido por la longitud o estructura del prompt. El trabajo asociado (Skobelev, Fithian y Han, 2026) estudia cómo el ajuste fino corrige tanto el colapso de moda como la sobredispersión en la diversidad de las respuestas generadas, usando como métrica la diversidad relativa (R = 1 como línea de calibración).

## Capacidades

- Generación de texto condicionada a personas demográficas y preguntas de encuesta, emitiendo la letra de la opción de respuesta.
- Simulación de distribuciones de respuesta de poblaciones sintéticas con diversidad calibrada respecto a datos reales de la WVS.
- Corrección de colapso de moda: el adaptador reduce la tendencia del modelo base a concentrar respuestas en una única opción.
- Corrección de sobredispersión: ajusta la diversidad de respuestas cuando el modelo base genera una distribución demasiado plana.
- Capacidades heredadas del modelo base Qwen3.5-4B (generación general, razonamiento, multilingüismo), aunque el adaptador está especializado en la tarea de encuesta.
- Soporte de tool calling / function calling: no disponible de forma específica para el adaptador (heredado del base, no verificado).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma específica para el adaptador.
- Capacidades multilingües: no disponible (los idiomas de la WVS Ronda 7 no se detallan en la información proporcionada).

## Casos de uso

- Simulación de opinión pública: el adaptador permite generar respuestas sintéticas a preguntas de la WVS condicionadas a perfiles demográficos, reproduciendo la distribución de respuestas observada en la encuesta real. Es adecuado porque se entrenó directamente sobre ese formato de tarea.
- Investigación en ciencias sociales computacionales: uso del adaptador como componente de un pipeline de simulación de encuestados sintéticos para estudiar sesgos de representación y calibración de diversidad en LLMs.
- Evaluación de calibración de diversidad: el adaptador sirve como referencia experimental para comparar la diversidad de respuestas de distintos modelos base frente a la diversidad calibrada (R = 1) de la WVS.
- Estudio de métodos de ajuste fino con pocos datos: con solo 89 ejemplos, el adaptador es un caso práctico para investigar la eficacia de LoRA en regímenes de datos extremadamente reducidos.
- Generación de datos sintéticos para aumento de datos: las respuestas generadas pueden usarse para aumentar conjuntos de datos de encuesta en dominios con pocas observaciones, siempre con validación estadística.
- Reproducibilidad de experimentos académicos: al ser un adaptador pequeño (0,1 GB) y de código abierto en Hugging Face, permite reproducir los resultados del paper arXiv:2609.16454 en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (assets/convergence.png) que muestra la posición del adaptador respecto a la banda intercuartílica de pares pregunta-grupo demográfico, pero no se proporcionan valores numéricos de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0,1 GB; requiere cargar el modelo base Qwen3.5-4B. En precisión FP16, el modelo base de 4B requiere aproximadamente 8-10 GB de VRAM; en cuantización de 4 bits, aproximadamente 3-4 GB.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en FP16 sin cuantizar; RTX 3090, RTX 4080 o GPUs con 8-12 GB para cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, el modelo base de 4B cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090, especialmente con cuantización.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base), transformers, vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere conversión del adaptador a GGUF), TGI (con soporte de adaptadores).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-4b-n89-lora | LoRA sobre 4B (adaptador 0,1 GB) | no disponible | Adaptador LoRA especializado en calibración de diversidad WVS | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base transformer | no disponible | Hugging Face |
| Alternativas de simulación de encuestados sintéticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría (calibración de diversidad en simulación de encuestas) en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó con solo 89 ejemplos de un tercio fijo de países y preguntas medibles de la WVS Ronda 7; su generalización a otros países, preguntas o rondas de la encuesta no está validada.
- Riesgo de sobreajuste a los perfiles demográficos y opciones de respuesta presentes en el conjunto de entrenamiento.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Los idiomas soportados no están especificados; la cobertura lingüística depende del modelo base y de los idiomas presentes en la WVS Ronda 7.
- Al ser un adaptador especializado en una tarea de respuesta de opción múltiple, no se recomienda su uso para generación de texto general sin el modelo base y sin validación.
- Riesgo de alucinación heredado del modelo base Qwen3.5-4B; el adaptador no elimina este comportamiento fuera de la tarea de encuesta.
- Sesgos conocidos: los sesgos demográficos y culturales de la WVS Ronda 7 y del modelo base pueden propagarse a las respuestas generadas.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.
- El adaptador no incluye información sobre tool calling, agentes o razonamiento multi-paso; estas capacidades dependen del modelo base y no están verificadas para esta configuración.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n89-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WVS Ronda 7: https://doi.org/10.14281/18241.24
