# skblv/diversity-calibration-wvs-qwen3.5-2b-n5713-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n5713-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla el usuario de Hugging Face skblv (Kirill Skobelev, según la citación del paper asociado) y su propósito no es el de un asistente generalista, sino el de un artefacto de investigación para calibrar la diversidad de las respuestas de un LLM en tareas de elección cerrada. Concretamente, el adaptador se ha afinado para predecir la letra de respuesta que elegiría un encuestado con un perfil demográfico dado ante una pregunta de la World Values Survey (WVS), ola 7.

El modelo aborda un problema técnico concreto: el colapso de moda (mode collapse) y la sobredispersión (over-dispersion) que sufren los LLM al generar distribuciones de respuesta. El adaptador forma parte del trabajo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454) y se presenta como un punto de referencia empírico en la curva de convergencia de diversidad relativa, con un valor de R = 1 como objetivo de calibración.

Por su naturaleza, es un adaptador PEFT de tamaño prácticamente nulo (el repositorio ocupa 0.0 GB) que requiere el modelo base Qwen3.5-2B para funcionar. No está pensado para despliegue en producción como chatbot, sino como material reproducible para estudiar cómo el fine-tuning modifica la distribución de salidas de un modelo de 2 mil millones de parámetros en un dominio acotado de encuestas sociales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Modelo base | Qwen/Qwen3.5-2B |
| Epocas de entrenamiento | 3 |
| Ejemplos de entrenamiento | 5.713 pares encuestado-pregunta |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-2B, un transformer decoder-only de 2 mil millones de parámetros, mediante LoRA de rango 16, alpha 32 y dropout 0.05. El entrenamiento se realizó durante tres épocas sobre un subconjunto de 5.713 ejemplos extraídos de la World Values Survey ola 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto se seleccionó tomando un tercio fijo y aleatorio de los países y de las preguntas medibles de la encuesta.

Cada ejemplo de entrenamiento tiene una estructura de prompt específica: una persona demográfica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras. El objetivo es la letra de la opción elegida por el encuestado. Un detalle técnico relevante es el enmascaramiento de los tokens del prompt en la función de pérdida: solo se calcula la pérdida sobre el token o tokens de la letra de respuesta y sobre el token EOS. Esta decisión concentra el aprendizaje en la distribución de la respuesta y evita que el modelo dedique capacidad a reproducir el formato del prompt.

La innovación metodológica no reside en la arquitectura, sino en el objetivo del entrenamiento: calibrar la diversidad de las salidas. La model card incluye una curva de convergencia de diversidad relativa donde el adaptador se marca como un cuadrado rojo, con una banda sombreada que representa el percentil 25-75 entre pares pregunta-grupo demográfico y una línea discontinua en R = 1 que indica la diversidad calibrada. No se especifica en la información disponible si se emplearon RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto condicionada a un perfil demográfico y a una pregunta de encuesta con opciones cerradas.
- Predicción de la letra de respuesta más probable para un encuestado sintético.
- Modelado de distribuciones de respuesta calibradas en diversidad, orientado a corregir el colapso de moda y la sobredispersión.
- Razonamiento de opción múltiple en el dominio acotado de ciencias sociales y encuestas de valores.
- Capacidades generales de generación de texto, razonamiento, código y matemáticas heredadas del modelo base Qwen3.5-2B, aunque no han sido evaluadas ni documentadas para este adaptador.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada para este adaptador.
- Capacidades multilingües: no disponibles; el conjunto de entrenamiento es la WVS ola 7, cuyos idiomas de administración no se detallan.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre calibración de diversidad en LLM: el adaptador sirve como punto de comparación reproducible en experimentos que midan la diversidad relativa de las salidas de un modelo de 2B frente al objetivo R = 1, tal como se documenta en la curva de convergencia de la model card.
- Simulación de opinión pública sintética: dado un perfil demográfico y una pregunta de la WVS, el modelo genera una letra de respuesta que puede agregarse para estudiar distribuciones de opinión por país y grupo social, siempre con las cautelas de validez externa que impone el tamaño y el origen de los datos.
- Auditoría de sesgos demográficos: al condicionar la respuesta a una persona demográfica explícita, permite comparar la distribución de respuestas entre grupos y detectar desviaciones sistemáticas respecto a los datos reales de la WVS.
- Reproducción de experimentos académicos: el adaptador, junto con la citación a arXiv:2609.16454, permite replicar los resultados del paper sobre colapso de moda y sobredispersión sin reentrenar desde cero.
- Generación de datos sintéticos para encuestas: puede emplearse para aumentar un conjunto de respuestas simuladas en estudios piloto o para preprobar cuestionarios antes del trabajo de campo, con validación humana posterior obligatoria.
- Estudio de metodologías de fine-tuning eficiente: al ser un LoRA de rango 16 sobre un modelo de 2B, es un caso de bajo coste computacional para analizar cómo el enmascaramiento de tokens del prompt y el ajuste de alpha y dropout afectan a la distribución de salidas.
- Docencia en NLP aplicado a ciencias sociales: sirve como ejemplo práctico y ligero de adaptación de un LLM a un corpus de encuestas con formato de opción múltiple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la curva de convergencia de diversidad relativa, con el adaptador situado en R = 1 (diversidad calibrada) y una banda de percentiles 25-75 entre pares pregunta-grupo demográfico. No se proporcionan valores numéricos de MMLU, HumanEval, GSM8K ni de precisión de predicción de la letra de respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de tamaño despreciable (repositorio de 0.0 GB); el consumo lo determina el modelo base Qwen3.5-2B. En fp16, un modelo de 2B requiere aproximadamente 4-5 GB de VRAM; en cuantización de 8 bits, unos 2-3 GB; en 4 bits, alrededor de 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070 en adelante); A100, H100 o L40S para lotes grandes o evaluación masiva. Para cuantización en 4 bits, GPUs de 4-6 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer modernas con 6 GB o más, aunque este dato no está confirmado en la información disponible para el modelo base concreto.
- Opciones de despliegue: la librería declarada es PEFT, por lo que la integración natural es transformers con PEFT. Para servir el modelo combinado pueden usarse vLLM, TGI o llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; estas rutas no están documentadas en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-2b-n5713-lora (este) | Adaptador LoRA sobre 2B | no disponible | LoRA PEFT | no disponible | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Transformer decoder-only | no disponible | Hugging Face |
| Adaptadores LoRA de calibración de diversidad de otros tamaños | no disponible | no disponible | LoRA PEFT | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma familia experimental (calibración de diversidad sobre encuestas) en la información proporcionada. La comparación más directa posible es con el modelo base Qwen3.5-2B sin adaptar, pero no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador está entrenado exclusivamente para responder preguntas de la WVS ola 7 con opciones cerradas; su uso fuera de ese formato no está validado.
- Sesgos de los datos de origen: la WVS refleja las poblaciones, idiomas y marcos culturales de los países incluidos; las predicciones pueden reproducir sesgos de muestreo y de redacción del cuestionario.
- Riesgo de alucinación: aunque el formato de salida es una letra acotada, el modelo puede generar letras fuera del conjunto de opciones o texto adicional si no se restringe la decodificación.
- Cobertura parcial: el entrenamiento usó solo un tercio fijo y aleatorio de países y preguntas medibles, por lo que la generalización al resto de la encuesta no está garantizada.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce si el adaptador funciona correctamente en castellano u otros idiomas distintos de los presentes en el subconjunto de entrenamiento.
- Dependencia del modelo base: requiere Qwen3.5-2B, cuya licencia y disponibilidad condicionan el uso del adaptador.
- Naturaleza experimental: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- No apto para decisiones sobre personas reales: las predicciones son simulaciones estadísticas y no deben usarse para inferir opiniones individuales ni para tomar decisiones que afecten a individuos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n5713-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- World Values Survey, Round Seven, Country-Pooled Datafile v6.0.0: https://doi.org/10.14281/18241.24
