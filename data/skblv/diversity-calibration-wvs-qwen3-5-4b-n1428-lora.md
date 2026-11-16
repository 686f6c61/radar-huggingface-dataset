# skblv/diversity-calibration-wvs-qwen3.5-4b-n1428-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario skblv. No se trata de un modelo completo, sino de un ajuste fino paramétricamente eficiente orientado a una tarea muy concreta: reproducir la distribución de respuestas de encuestados de la World Values Survey (WVS) Ronda 7 a partir de un persona demográfico y una pregunta con opciones de respuesta. El adaptador se enmarca en el artículo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (Skobelev, Fithian y Han, 2026, arXiv:2609.16454), que estudia cómo el ajuste fino afecta a la diversidad de las distribuciones generadas.

El adaptador se entrenó durante tres épocas sobre 1.428 ejemplos encuestado-pregunta extraídos de la WVS Wave 7, empleando un subconjunto fijo de un tercio de los países y de las preguntas medibles. Cada prompt incluye un persona demográfico, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es únicamente la letra de respuesta y el token de fin de secuencia. La relevancia del artefacto es metodológica: sirve como pieza de investigación sobre calibración de diversidad en modelos de lenguaje, no como un modelo de propósito general.

El adaptador tiene un tamaño de repositorio de 0,1 GB y está publicado bajo la librería PEFT con pesos en safetensors. En el momento de la consulta registra 0 descargas y 0 likes, y no declara licencia ni idiomas soportados en sus metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0,05) sobre transformer Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no declarada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05 aplicado sobre el modelo base Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parámetros. El ajuste fino se realizó durante tres épocas sobre 1.428 ejemplos de tipo encuestado-pregunta procedentes de la World Values Survey Ronda 7 (Haerpfer et al., 2022, v6.0.0). El conjunto de entrenamiento se construyó tomando un tercio fijo y aleatorio de los países y de las preguntas medibles de la encuesta.

Cada ejemplo de entrenamiento presenta un persona demográfico, la pregunta de la encuesta y las opciones de respuesta en formato de letras. La pérdida se enmascara sobre los tokens del prompt y se aplica únicamente al token o tokens de la letra de respuesta y al token EOS, de modo que el adaptador aprende a emitir la letra elegida y a terminar la generación. El trabajo asociado (arXiv:2609.16454) analiza la convergencia de la diversidad relativa de las respuestas generadas frente a la diversidad calibrada (R = 1), con una banda de percentiles 25-75 entre pares pregunta-grupo demográfico; el adaptador se sitúa como el punto marcado en rojo en esa curva de convergencia.

## Capacidades

- Generación de texto condicionada a un persona demográfico y a una pregunta de encuesta con opciones de respuesta.
- Emisión de la letra de respuesta seleccionada (formato de opción múltiple) y terminación de secuencia.
- Modelado de distribuciones de respuesta agregadas por grupo demográfico, orientado al estudio de calibración de diversidad.
- No se documentan capacidades de razonamiento general, código, matemáticas, visión, audio, tool calling ni agentes; el adaptador está especializado en la tarea descrita.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre calibración de diversidad: el adaptador permite reproducir el experimento de diversidad relativa del artículo y comparar la distribución generada con la distribución observada en la WVS.
- Simulación de respuestas de encuesta: dado un persona demográfico y una pregunta, el adaptador genera la letra de respuesta, útil para generar datos sintéticos de opinión pública con fines metodológicos.
- Evaluación de sesgos demográficos: al condicionar por persona, permite estudiar cómo varía la distribución de respuestas entre grupos demográficos y detectar desviaciones respecto a los datos reales.
- Reproducibilidad de experimentos: al ser un adaptador LoRA de pequeño tamaño (0,1 GB), facilita la replicación del ajuste fino sobre Qwen3.5-4B en entornos de investigación con recursos limitados.
- Análisis de mode collapse y sobredispersión: sirve como caso de estudio controlado para medir si el ajuste fino corrige el colapso de modos en la generación de respuestas categóricas.
- Docencia y formación: ejemplo práctico de ajuste fino con PEFT sobre un modelo de 4B para una tarea de clasificación generativa con opciones múltiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente presenta una curva de convergencia de diversidad relativa (R) frente a la diversidad calibrada (R = 1), sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en FP16 y en torno a 2,5-3 GB en cuantización de 4 bits, pero estos valores no están confirmados en la documentación del adaptador.
- GPU recomendadas: no disponibles. El adaptador LoRA en sí ocupa 0,1 GB y se carga junto al modelo base.
- Compatibilidad con GPU de consumo: probable con el modelo base en cuantización de 4 bits en GPUs de 8 GB o más, aunque no está documentado.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); compatible potencialmente con frameworks que soporten adaptadores LoRA (vLLM, TGI, llama.cpp con conversión), si bien no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-4b-n1428-lora | Adaptador LoRA sobre 4B | no disponible | Adaptador de investigación | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | Modelo completo | no disponible | Hugging Face |
| Adaptadores LoRA equivalentes de la WVS | no disponible | no disponible | Adaptador de investigación | no disponible | no disponible |

No se dispone de información sobre otros adaptadores comparables de la misma serie ni sobre sus métricas, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un adaptador LoRA especializado, no un modelo de propósito general; no debe emplearse para tareas ajenas a la generación de respuestas de encuesta.
- Entrenado sobre un tercio fijo de países y preguntas de la WVS Wave 7: la generalización a países, preguntas o rondas no incluidas en el entrenamiento no está garantizada.
- Riesgo de sobreajuste a los 1.428 ejemplos de entrenamiento y de reproducir sesgos presentes en los datos de la WVS.
- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- Los idiomas soportados no están declarados; se desconoce el comportamiento fuera del idioma de los datos de entrenamiento.
- La longitud de contexto efectiva no está documentada; depende del modelo base Qwen3.5-4B.
- Riesgo de alucinación en la generación de letras de respuesta fuera del conjunto de opciones válidas, aunque el entrenamiento con pérdida restringida al token de respuesta y EOS mitiga parcialmente este comportamiento.
- Artefacto de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n1428-lora
- Artículo: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- World Values Survey Round Seven v6.0.0: https://doi.org/10.14281/18241.24
