# skblv/diversity-calibration-wvs-qwen3.5-4b-n1462645-lora

## Resumen

`skblv/diversity-calibration-wvs-qwen3.5-4b-n1462645-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo publica el usuario de Hugging Face skblv (autores del artículo: Kirill Skobelev, Eric Fithian y X. Y. Han) como artefacto de investigación asociado al paper "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No es un modelo conversacional de propósito general, sino un ajuste diseñado para calibrar la diversidad de las respuestas de un LLM cuando se le pide predecir la opción elegida por un encuestado con un perfil demográfico dado.

El adaptador se ha entrenado durante tres épocas sobre 1.462.645 pares encuestado-pregunta extraídos de la World Values Survey, ronda 7 (WVS Wave 7). Cada ejemplo contiene una persona demográfica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es únicamente la letra de respuesta seleccionada. El resultado es un adaptador de rango 16 que modifica el comportamiento distribucional del modelo base en esta tarea concreta.

Su relevancia es metodológica: sirve como evidencia reproducible de que el fine-tuning puede corregir dos patologías opuestas de los LLM en tareas de simulación de poblaciones (mode collapse, es decir, respuestas demasiado homogéneas, y over-dispersion, respuestas demasiado ruidosas), acercando la diversidad de salida a la calibrada (R = 1). El repositorio ocupa 0,1 GB y solo contiene los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | 16 / 32 / 0,05 |
| Epocas de entrenamiento | 3 |
| Ejemplos de entrenamiento | 1.462.645 pares encuestado-pregunta |
| Dataset | World Values Survey, Round Seven, Country-Pooled Datafile v6.0.0 |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05 aplicado sobre el modelo Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. No se modifican los pesos del base: se añaden matrices de baja dimensión entrenables, lo que explica el tamaño reducido del repositorio (0,1 GB) frente al modelo completo.

El entrenamiento se realizó durante tres épocas sobre 1.462.645 ejemplos construidos a partir de la WVS Wave 7. El subconjunto de entrenamiento usa un tercio fijo y aleatorio de países y de preguntas medibles, lo que deja dos tercios para evaluación. Cada prompt incluye una persona demográfica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; la pérdida se aplica exclusivamente al token o tokens de la letra de respuesta y al token EOS, enmascarando los tokens del prompt. El objetivo declarado del paper es corregir el mode collapse y la over-dispersion en la distribución de respuestas generadas, evaluados mediante una curva de convergencia de diversidad relativa con banda intercuartílica y referencia calibrada R = 1.

## Capacidades

- Predicción de la opción de respuesta (letra) de un encuestado de la WVS dado un perfil demográfico y una pregunta con opciones.
- Modelado de distribuciones de respuesta a nivel de grupo demográfico, con diversidad calibrada respecto a la población real.
- Generación de texto condicionada por persona demográfica (el adaptador hereda las capacidades generativas del base, aunque el ajuste está especializado en la tarea de selección de opción).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso específico en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base).
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Investigación en ciencias sociales computacionales: simular la distribución de respuestas de subgrupos demográficos ante preguntas de la WVS y compararla con los datos reales de la ronda 7, usando el adaptador como referencia de calibración de diversidad.
- Estudio de calibración de diversidad en LLM: reproducir los experimentos del paper (mode collapse vs. over-dispersion) sobre el modelo base Qwen3.5-4B y medir la curva de diversidad relativa R frente a la línea calibrada R = 1.
- Generación de poblaciones sintéticas de encuestados: emplear el adaptador para producir respuestas sintéticas con perfiles demográficos variados que preserven la heterogeneidad observada en la encuesta, útil para aumentar datos de sondeos pequeños.
- Evaluación de sesgos demográficos: comparar las distribuciones generadas por subgrupo (país, edad, nivel educativo) con las reales para detectar desviaciones sistemáticas del modelo base.
- Docencia y divulgación sobre fine-tuning con PEFT: ejemplo completo y reproducible de entrenamiento LoRA con enmascarado de pérdida sobre tokens de respuesta, con dataset público y paper asociado.
- Análisis de sensibilidad de hiperparámetros LoRA: el adaptador sirve como punto de partida (rango 16, alpha 32, dropout 0,05, 3 épocas) para estudiar cómo varía la calibración de diversidad al cambiar estos valores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente aporta una curva de convergencia de diversidad relativa (con banda intercuartílica 25-75 y referencia calibrada R = 1) sin cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el adaptador; depende del modelo base Qwen3.5-4B. Como referencia orientativa para un transformer de 4B, la inferencia en fp16 requiere aproximadamente 8-9 GB de VRAM, y en cuantización de 4 bits alrededor de 3-4 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del base, cabría esperar GPUs de gama alta de consumo (RTX 3090/4090, 24 GB) y profesionales (A100, H100) para servir el modelo en precisión completa.
- GPU de consumo: probablemente viable en GPUs con 8 GB o más en cuantización de 4 bits, sujeto a verificación con el base real.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar Qwen/Qwen3.5-4B y aplicar el adaptador con `peft` (transformers + PEFT). No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la información disponible; el uso de adaptadores LoRA con vLLM es posible en general, pero no está confirmado para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3.5-4B) | LoRA r=16 sobre base 4B | no disponible | Adaptador PEFT especializado en WVS | no disponible | Calibración de diversidad en encuestas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Transformer decoder-only | no disponible | Modelo generalista sin ajuste de diversidad |
| Adaptadores LoRA de simulación de encuestas (otros) | variable | no disponible | PEFT | variable | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para predecir letras de respuesta de la WVS; su uso fuera de ese formato (preguntas abiertas, otras encuestas, otros esquemas de opciones) no está validado.
- Riesgo de sobreajuste al subconjunto de entrenamiento: se usó un tercio fijo de países y preguntas, por lo que el comportamiento en el tercio retenido puede diferir y debe evaluarse antes de cualquier uso.
- Sesgos de la fuente: las distribuciones aprendidas reflejan los sesgos y la cobertura de la WVS Wave 7 (países, preguntas y marcos muestrales incluidos), no la población mundial.
- Riesgo de alucinación: como todo LLM, puede generar letras u opciones no válidas fuera del formato esperado; el enmascarado de pérdida durante el entrenamiento no garantiza validez en inferencia.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- Idiomas no documentados: no hay información sobre el rendimiento multilingüe del adaptador.
- Artefacto de investigación: sin descargas ni likes, sin benchmarks numéricos publicados y con fecha de creación en 2026; no hay evidencia de uso en producción.
- Dependencia del base: cualquier limitación de contexto, idioma o seguridad de Qwen3.5-4B se hereda, y el adaptador debe cargarse junto con el base, lo que multiplica los requisitos de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n1462645-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset (DOI): https://doi.org/10.14281/18241.24
- Curva de convergencia (asset del repo): assets/convergence.png y assets/convergence.pdf
