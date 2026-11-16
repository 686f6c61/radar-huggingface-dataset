# skblv/diversity-calibration-wvs-qwen3.5-2b-n44-lora

## Resumen

`skblv/diversity-calibration-wvs-qwen3.5-2b-n44-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-2B. Lo publica el usuario `skblv` (autoría del artículo: Kirill Skobelev, Eric Fithian y X. Y. Han) como artefacto reproducible del trabajo *Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs* (arXiv:2609.16454). No es un modelo de propósito general, sino un adaptador de investigación orientado a estudiar cómo el ajuste fino modifica la diversidad de las respuestas generadas.

El adaptador se ha entrenado durante tres épocas sobre un conjunto muy reducido: 44 ejemplos de pares encuestado-pregunta extraídos de la World Values Survey (ola 7). Cada prompt contiene una persona demográfica sintética, una pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es únicamente la letra de la opción elegida. La pérdida se enmascara sobre los tokens del prompt y se aplica solo al token (o tokens) de la respuesta y al token EOS.

Su relevancia es metodológica más que práctica: sirve como punto de referencia para medir la "diversidad relativa" de las distribuciones de respuesta de un LLM frente a una calibración teórica (R = 1) y para comparar el efecto del ajuste fino sobre el colapso de modos y la sobredispersión. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-2B |
| Parámetros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base es de 2B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B, no declarada en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; `library_name: peft`) |
| Rango LoRA / alpha / dropout | 16 / 32 / 0.05 |
| Modelo base | Qwen/Qwen3.5-2B |
| Pipeline | text-generation |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05 aplicado sobre el modelo denso Qwen3.5-2B. No se modifican los pesos del modelo base; se añaden matrices de baja graduación entrenables en las capas seleccionadas, con lo que el artefacto es un complemento ligero cargable mediante la librería PEFT. No se especifica en la información disponible sobre qué módulos concretos (q_proj, k_proj, v_proj, etc.) se aplica el LoRA.

El entrenamiento se realizó durante tres épocas sobre 44 ejemplos de la World Values Survey, ola 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto se construyó tomando un tercio aleatorio fijo de países y de preguntas medibles. Cada ejemplo combina una persona demográfica, una pregunta de encuesta y opciones letradas; la función de pérdida enmascara los tokens del prompt y solo penaliza el token de la letra de respuesta y EOS. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa; el objetivo declarado del trabajo es caracterizar la diversidad de las distribuciones de respuesta frente a una calibración teórica (curva de convergencia de diversidad relativa con R = 1 como referencia).

## Capacidades

- Generación de texto condicionada a un prompt que incluya persona demográfica, pregunta y opciones letradas.
- Emisión de una respuesta de opción múltiple en formato de letra única (comportamiento aprendido durante el ajuste fino).
- Herencia de las capacidades generales de Qwen3.5-2B (razonamiento, código, matemáticas) en la medida en que el modelo base las tenga, aunque el adaptador no las refuerza.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso en la información disponible.
- No se documenta capacidad multilingüe específica del adaptador; los idiomas dependen del modelo base, no declarados.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Reproducción de experimentos de calibración de diversidad: cargar el adaptador sobre Qwen3.5-2B y medir la distribución de letras de respuesta frente a la curva de referencia R = 1 del artículo.
- Estudio del colapso de modos: comparar la entropía de las respuestas del adaptador con la del modelo base sin ajustar sobre el mismo conjunto de prompts demográficos.
- Análisis de sobredispersión: evaluar si el ajuste fino con 44 ejemplos reduce o amplía la varianza de las respuestas en preguntas de encuesta.
- Investigación metodológica en ciencias sociales computacionales: simular respuestas de encuestados sintéticos a partir de personas demográficas y compararlas con distribuciones reales de la WVS.
- Docencia y divulgación sobre PEFT: ejemplo mínimo y reproducible de un adaptador LoRA con enmascaramiento de pérdida sobre la respuesta, útil para explicar el flujo de entrenamiento.
- Auditoría de sesgos demográficos: analizar cómo un adaptador entrenado con personas demográficas reproduce o distorsiona patrones de respuesta por país, edad o género.
- Punto de partida para ablaciones: reentrenar con distintos valores de N (tamaño del conjunto), rango LoRA o épocas, usando este adaptador como referencia N=44.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una curva de convergencia de diversidad relativa (figura `assets/convergence.png`) pero no reporta valores numéricos de MMLU, HumanEval, GSM8K ni de métricas de diversidad en forma de tabla.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base Qwen3.5-2B y de la cuantización elegida (no declarada).
- GPU recomendadas: no disponibles en la información; un modelo base de 2B es, en principio, desplegable en GPU de consumo, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: previsiblemente sí para el modelo base en cuantizaciones de 4-8 bits, sin datos oficiales que lo confirmen.
- Opciones de despliegue: PEFT para carga del adaptador; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se documentan para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skblv/diversity-calibration-wvs-qwen3.5-2b-n44-lora` | LoRA sobre 2B | no disponible | Adaptador LoRA | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B | 2B | no disponible | Modelo denso base | no disponible | Hugging Face |
| Adaptadores LoRA de investigación comparables | no disponible | no disponible | LoRA | no disponible | no disponible |

No se dispone de información sobre otros adaptadores del mismo autor con distintos valores de N ni de modelos comparables de calibración de diversidad, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Conjunto de entrenamiento de solo 44 ejemplos: riesgo alto de sobreajuste y de que el comportamiento de respuesta en formato letra no generalice fuera de las preguntas de la WVS.
- El adaptador está especializado en responder letras de opción múltiple; puede degradar la generación libre del modelo base si se usa fuera de ese formato.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base a partir de la información proporcionada.
- Idiomas no declarados: no se garantiza un comportamiento multilingüe correcto.
- Riesgo de alucinación no caracterizado en la información; el enmascaramiento de pérdida sobre el prompt no elimina la posibilidad de respuestas inconsistentes.
- Sesgos: el subconjunto de la WVS toma un tercio fijo de países, por lo que la cobertura demográfica es parcial y puede inducir sesgos por país, edad, género o nivel educativo.
- No apto para producción como asistente general: es un artefacto de investigación sin benchmarks, sin descargas y sin documentación de latencia o robustez.
- La fecha de creación del repositorio (2026-08-31) y la referencia al artículo arXiv:2609.16454 deben verificarse antes de citarlo en trabajos formales.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n44-lora
- Artículo: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- World Values Survey, Round Seven, v6.0.0: https://doi.org/10.14281/18241.24
