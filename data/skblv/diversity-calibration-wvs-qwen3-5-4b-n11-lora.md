# skblv/diversity-calibration-wvs-qwen3.5-4b-n11-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n11-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario skblv (autores del artículo: Kirill Skobelev, Eric Fithian y X. Y. Han) como artefacto de investigación para el estudio "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No es un modelo de propósito general, sino un adaptador experimental de calibración de diversidad.

El adaptador se ha afinado durante tres épocas sobre un conjunto de tan solo 11 ejemplos de encuestado-pregunta extraídos de la World Values Survey (WVS) Ronda 7, usando una partición fija de un tercio de países y preguntas medibles. Cada prompt contiene una persona demográfica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opción elegida por el encuestado. El resultado es un adaptador que reproduce la distribución de respuestas de la WVS con una diversidad relativa calibrada (R = 1) en la curva de convergencia del artículo.

Es relevante ahora porque aborda un problema técnico concreto: el colapso de moda y la sobredispersión en las distribuciones de salida de los LLM cuando se usan para simular respuestas humanas. El adaptador demuestra que un ajuste fino ligero puede corregir la diversidad de las respuestas, lo que lo convierte en una referencia metodológica más que en una herramienta de producción. El repositorio ocupa 0,1 GB y las descargas y likes son nulos en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre transformer Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el base es de 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B; no especificada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantizaciones estándar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05 aplicado sobre el modelo Qwen/Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros. El entrenamiento consistió en tres épocas sobre 11 ejemplos de encuestado-pregunta de la World Values Survey Ronda 7 (Haerpfer et al., 2022, v6.0.0), con una partición fija de un tercio de países y preguntas medibles. Los tokens del prompt se enmascararon de la pérdida; la pérdida se aplicó únicamente a los tokens de la letra de respuesta y al token EOS.

La innovación metodológica del trabajo es la calibración de la diversidad: el adaptador se selecciona para que la diversidad relativa de las respuestas generadas converja a R = 1 respecto a la distribución empírica de la WVS. El artículo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" enmarca este ajuste como una corrección de dos patologías opuestas de los LLM al simular poblaciones: el colapso de moda (respuestas demasiado homogéneas) y la sobredispersión (respuestas demasiado variadas). No se especifican en la información disponible el número de tokens de entrenamiento totales, la composición completa del dataset ni si hubo RLHF o DPO; el ajuste es supervisado sobre las letras de respuesta.

## Capacidades

- Generación de texto condicionada a una persona demográfica y una pregunta de encuesta, devolviendo la letra de la opción seleccionada.
- Simulación de respuestas de encuestados con una distribución de diversidad calibrada (R = 1) frente a la WVS Ronda 7.
- Corrección de colapso de moda y sobredispersión en la generación de respuestas categóricas, según la metodología del artículo.
- Herencia de las capacidades del modelo base Qwen3.5-4B (generación de texto general), aunque el adaptador está especializado en la tarea de selección de opciones.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento en la información disponible.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó sobre preguntas de la WVS, cuyo idioma de trabajo no se especifica.

## Casos de uso

- Simulación de opinión pública: el adaptador permite generar respuestas sintéticas a preguntas de la WVS con una distribución de diversidad calibrada, útil para estudios de opinión y validación de metodologías de encuesta.
- Investigación sobre calibración de LLM: sirve como referencia reproducible para estudiar cómo el ajuste fino corrige el colapso de moda y la sobredispersión en distribuciones de salida.
- Generación de personas sintéticas para encuestas: dado un perfil demográfico y una pregunta con opciones, el modelo devuelve la opción elegida, lo que permite construir paneles sintéticos para pre-test de cuestionarios.
- Evaluación de sesgos en LLM: al comparar la distribución generada con la empírica de la WVS, se puede medir la fidelidad demográfica del modelo base y del adaptador.
- Reproducción de experimentos académicos: el adaptador y la curva de convergencia publicada permiten replicar los resultados del artículo arXiv:2609.16454 en entornos con recursos limitados (0,1 GB de pesos).
- Docencia y divulgación: ejemplo compacto de ajuste fino con LoRA y enmascaramiento de pérdida para tareas de selección categórica con pocos ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la curva de convergencia de diversidad relativa (R = 1 como línea de calibración), sin métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,1 GB; el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en FP16 y entre 2,5 y 3 GB en cuantización de 4 bits (estimación estándar para 4B, no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4090); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16 y en tarjetas con 4-6 GB si se cuantiza el base a 4 bits.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF; vLLM y TGI para servir el base fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-4b-n11-lora | LoRA sobre 4B | no disponible | Adaptador de calibración de diversidad | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Transformer denso generalista | no disponible en la información | Hugging Face |
| Adaptadores LoRA de simulación de encuestas comparables | no disponible | no disponible | LoRA especializado | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de calibración de diversidad con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado con solo 11 ejemplos: la generalización a otras preguntas, países o demografías fuera de la partición de entrenamiento es altamente incierta.
- Es un artefacto de investigación, no un modelo listo para producción; no se documentan evaluaciones fuera de la curva de diversidad del artículo.
- Riesgo de alucinación y de respuestas no válidas: el modelo puede generar letras fuera del conjunto de opciones o texto adicional en lugar de una única letra.
- Sesgos conocidos: los derivados de la WVS Ronda 7 y de la partición fija de países; no se documenta un análisis de sesgo específico.
- Limitaciones de idioma: no se especifica qué idiomas cubre el adaptador ni si funciona en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue.
- Dependencia del modelo base Qwen3.5-4B: cualquier restricción de licencia o de uso del base se aplica al adaptador.
- Sin métricas de benchmarks estándar ni estimaciones de latencia o throughput publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n11-lora
- Artículo: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- World Values Survey Ronda 7, v6.0.0: https://doi.org/10.14281/18241.24
