# skblv/diversity-calibration-wvs-qwen3.5-4b-n44-lora

## Resumen

`skblv/diversity-calibration-wvs-qwen3.5-4b-n44-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo publica el usuario skblv (Kirill Skobelev y colaboradores, según la cita del paper asociado) como artefacto experimental para el estudio "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No es un modelo de propósito general, sino un adaptador de investigación cuyo objetivo es calibrar la diversidad de las respuestas de un LLM en tareas de encuesta.

El adaptador se ha afinado durante tres épocas sobre tan solo 44 ejemplos de encuestado-pregunta extraídos de la World Values Survey (WVS) Wave 7, usando un tercio fijo de países y preguntas medibles. Cada prompt contiene una persona demográfica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo del entrenamiento es la letra de la opción elegida por el encuestado. La relevancia es metodológica: sirve para estudiar cómo el fine-tuning afecta a la diversidad de salida (mode collapse y sobredispersión) frente a una distribución de referencia calibrada.

El repositorio ocupa aproximadamente 0,1 GB y contiene únicamente los pesos del adaptador en safetensors, no el modelo base. La model card no documenta licencia, idiomas ni resultados de benchmarks, por lo que sus datos técnicos más allá de la configuración LoRA y el dataset de entrenamiento están ausentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05, aplicado sobre el modelo Qwen/Qwen3.5-4B (transformer decoder-only de 4.000 millones de parámetros, según el identificador del modelo base). El entrenamiento consistió en tres épocas sobre 44 ejemplos de encuestado-pregunta de la World Values Survey Round 7 (v6.0.0, Haerpfer et al., 2022), restringidos a un tercio aleatorio fijo de países y a preguntas medibles. El prompt incluía una persona demográfica, la pregunta y opciones de respuesta con letras; la pérdida se aplicó exclusivamente al token o tokens de la letra de respuesta y al token EOS, enmascarando los tokens del prompt.

La innovación metodológica no está en la arquitectura sino en el objetivo de evaluación: el adaptador forma parte de un estudio sobre calibración de diversidad, comparando la diversidad relativa de las respuestas generadas (R = 1 como referencia calibrada) frente a la distribución de respuestas humanas de la WVS. La model card incluye una curva de convergencia de diversidad relativa con bandas percentiles 25-75 por pares pregunta-grupo demográfico. No se documentan datos de RLHF, DPO ni composición adicional del dataset más allá de los 44 ejemplos citados.

## Capacidades

- Generación de texto condicionada a personas demográficas y preguntas de encuesta, devolviendo la letra de la opción seleccionada.
- Modelado de distribuciones de respuesta en encuestas de opinión (WVS Wave 7) para preguntas y países incluidos en el subconjunto de entrenamiento.
- Calibración de diversidad de salida: el adaptador está diseñado para ajustar la dispersión de las respuestas hacia una referencia calibrada (R = 1).
- Capacidades generales del modelo base Qwen3.5-4B (razonamiento, código, matemáticas, tool calling, multilingüismo): no documentadas en esta model card y potencialmente degradadas por el fine-tuning específico.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking específico para este adaptador.

## Casos de uso

- Investigación sobre calibración de diversidad en LLM: reproducir el experimento del paper arXiv:2609.16454 comparando la diversidad de salida del adaptador con la distribución humana de la WVS.
- Simulación de encuestados sintéticos: generar respuestas con letra de opción para personas demográficas y preguntas del subconjunto de entrenamiento, útil en estudios de opinión pública metodológicos.
- Evaluación de mode collapse: usar el adaptador como caso control para medir si el fine-tuning colapsa la distribución de respuestas hacia una opción dominante.
- Análisis de sobredispersión: comparar la varianza de respuestas del adaptador frente a la referencia calibrada en pares pregunta-grupo demográfico.
- Docencia y reproducción de experimentos: material de bajo coste (0,1 GB) para cursos sobre PEFT y evaluación de diversidad en modelos generativos.
- Baseline para ablaciones de LoRA: punto de partida para variar rango, alpha, dropout o tamaño de dataset (N=44) en estudios de calibración.
- No se recomienda su uso en producción de atención al cliente, generación de código ni tareas generales, dado su entrenamiento altamente específico y su tamaño de dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta una curva de convergencia de diversidad relativa (R) con bandas percentiles 25-75, sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa ~0,1 GB; la inferencia requiere cargar el modelo base Qwen3.5-4B. En fp16, el base de 4B necesita aproximadamente 8 GB de VRAM; en cuantización de 4 bits, alrededor de 3-4 GB (estimaciones estándar para 4B, no confirmadas en la model card).
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para fp16 sin cuantizar; GPUs consumer de 8 GB o más para cuantización de 4 bits.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantización o fp16.
- Opciones de despliegue: la librería es peft; el adaptador puede fusionarse con el base y servirse con vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF. No se documentan recetas específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-4b-n44-lora | Adaptador LoRA sobre 4B | no disponible | Adaptador PEFT experimental | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible en esta ficha | Modelo completo | no disponible | Hugging Face |
| Adaptadores LoRA de calibración equivalentes | no disponible | no disponible | no disponible | no disponible | No se conocen alternativas públicas comparables |

No se dispone de información sobre otros adaptadores de calibración de diversidad comparables ni de resultados de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado sobre solo 44 ejemplos de la WVS Wave 7; el sobreajuste es altamente probable y la generalización a otras preguntas, países o dominios es muy limitada.
- Sesgos demográficos y culturales inherentes a la WVS Wave 7 y al subconjunto de un tercio de países seleccionado; las respuestas generadas reflejan esos sesgos.
- Riesgo de alucinación y de producir letras de opción inválidas fuera del formato de prompt esperado.
- Licencia no disponible: no se puede confirmar el uso comercial; además, la licencia del modelo base Qwen3.5-4B debe verificarse por separado.
- Idiomas no documentados; el entrenamiento se realizó presumiblemente en el idioma de las preguntas de la WVS usadas, sin especificar.
- No apto para producción general: es un artefacto de investigación con 0 descargas y 0 likes, sin validación externa.
- El adaptador no incluye el modelo base; requiere descargar Qwen/Qwen3.5-4B y aplicar el LoRA con peft.
- No se documentan evaluaciones de seguridad, sesgo o robustez.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n44-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WVS Round 7 v6.0.0: https://doi.org/10.14281/18241.24
