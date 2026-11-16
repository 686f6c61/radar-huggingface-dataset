# skblv/diversity-calibration-wvs-qwen3.5-2b-n91415-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n91415-lora` es un adaptador LoRA (Low-Rank Adaptation) de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-2B. Lo desarrolla el usuario de Hugging Face skblv (Kirill Skobelev, según la citación del paper asociado) y su propósito no es el de un asistente generalista, sino el de un artefacto de investigación para el estudio de la calibración de diversidad en las respuestas de modelos de lenguaje.

El adaptador se ha ajustado durante tres épocas sobre 91.415 ejemplos de encuestado-pregunta extraídos de la World Values Survey (WVS) Wave 7. Cada prompt contiene una persona demográfica, una pregunta de encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es únicamente la letra de respuesta seleccionada por el encuestado. Esto lo convierte en una herramienta para reproducir y analizar la distribución de respuestas de subgrupos demográficos reales.

Es relevante en el contexto de la investigación sobre mode collapse y sobre-dispersión en LLM, enmarcado en el artículo *Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs* (arXiv:2609.16454). No es un modelo para producción general; su valor reside en la reproducibilidad experimental de la calibración de diversidad (R = 1) frente a la variabilidad de respuestas humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-2B |
| Parametros totales | No disponible (adaptador LoRA; el base Qwen3.5-2B tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-2B) |
| Tipos de cuantizacion | No disponible (pesos LoRA en safetensors; cuantización aplicable al base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA estándar (rank 16, alpha 32, dropout 0.05) sobre el transformer denso Qwen3.5-2B. No modifica la arquitectura base: añade matrices de bajo rango en las capas del modelo, con un total de parámetros entrenables muy reducido frente al modelo completo. El pipeline declarado es `text-generation` y la librería es `peft`.

El entrenamiento se realizó durante tres épocas sobre 91.415 ejemplos de encuestado-pregunta de la World Values Survey Wave 7. El subconjunto de entrenamiento usó un tercio aleatorio fijo de países y preguntas medibles. Los tokens del prompt fueron enmascarados en la pérdida; esta se aplicó solo al token (o tokens) de la letra de respuesta y al token EOS. El objetivo declarado es que la distribución de respuestas generadas por el modelo converja hacia la diversidad calibrada (R = 1) en lugar de colapsar en la respuesta mayoritaria o sobre-dispersarse. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto condicionada a un prompt que incluye persona demográfica, pregunta de encuesta y opciones de respuesta.
- Selección de una letra de opción como salida (clasificación generativa de opción múltiple).
- Reproducción de distribuciones de respuesta alineadas con subgrupos demográficos de la WVS Wave 7.
- Capacidad de calibrar la diversidad de respuestas para evitar mode collapse y sobre-dispersión (objetivo central del paper).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas más allá de las del modelo base.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre calibración de diversidad en LLM: el adaptador permite reproducir el experimento del paper y medir la ratio de diversidad relativa (R) frente al valor calibrado R = 1 en preguntas de la WVS.
- Simulación de opinión pública por subgrupos demográficos: dado un perfil de persona (edad, país, nivel educativo, etc.) y una pregunta de la WVS, el modelo genera la letra de opción más probable, útil para estudios exploratorios de actitudes sociales.
- Auditoría de sesgos demográficos: comparando las distribuciones generadas con las reales de la WVS se pueden identificar desviaciones sistemáticas por país o grupo, ya que el entrenamiento enmascara el prompt y solo supervisa la respuesta.
- Benchmarking de técnicas de ajuste fino: sirve como referencia para evaluar si otras técnicas (DPO, RLHF, ajuste completo) mejoran o empeoran la calibración de diversidad frente a este LoRA de rango 16.
- Docencia y divulgación sobre LoRA y PEFT: el adaptador es pequeño (repo de 0,0 GB declarado) y se puede cargar junto al base Qwen3.5-2B en entornos de laboratorio para demostrar el flujo completo de PEFT.
- Estudio de mode collapse en clasificación generativa: al ser una tarea de opción múltiple con etiqueta de un solo token, permite analizar con precisión cómo se distribuyen las probabilidades del modelo sobre las opciones y detectar colapso hacia la moda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente muestra una curva de convergencia de diversidad relativa (assets/convergence.png) sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas estándar.

## Requisitos de hardware

- El adaptador LoRA es de tamaño despreciable (repo declarado de 0,0 GB); el coste real lo determina el modelo base Qwen3.5-2B.
- Para inferencia en precisión completa (fp16/bf16) del base de 2B se estiman aproximadamente 4-5 GB de VRAM, más overhead de activaciones y del adaptador.
- En cuantización de 8 bits cabría en GPUs consumer con 8 GB de VRAM (RTX 3060, RTX 4060, RTX 3070); en 4 bits (GGUF/QLoRA) cabría en GPUs de 6 GB o incluso en CPU con llama.cpp.
- GPUs recomendadas para experimentación cómoda: RTX 4090, A100 o H100 si se quiere ejecutar en paralelo el modelo base y variantes para comparativas.
- Opciones de despliegue: transformers + peft (carga del adaptador sobre el base), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), TGI con soporte de adaptadores.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-2b-n91415-lora | Adaptador LoRA sobre 2B | No disponible | LoRA PEFT | No disponible | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | Transformer denso | No disponible | Hugging Face |
| Adaptadores LoRA de calibración demográfica comparables | No disponible | No disponible | LoRA PEFT | No disponible | No disponible |

No se dispone de información sobre otros adaptadores de calibración de diversidad directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de propósito general: no debe usarse como asistente conversacional ni para generación libre de texto.
- Entrenado solo sobre un tercio aleatorio fijo de países y preguntas medibles de la WVS Wave 7; las respuestas para países o preguntas fuera de ese subconjunto pueden no estar calibradas.
- Riesgo de sobreajuste a la distribución de la WVS Wave 7: las actitudes sociales cambian con el tiempo y el modelo no refleja la evolución posterior a la encuesta.
- Riesgo de alucinación en el sentido de generar letras de opción que no correspondan a una opción válida si el prompt no sigue el formato de entrenamiento.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; además, el uso del modelo base Qwen3.5-2B está sujeto a su propia licencia.
- Los sesgos demográficos de la WVS se heredan y pueden amplificarse; el adaptador no corrige sesgos, solo calibra la diversidad de la distribución de respuestas.
- No se documentan idiomas soportados; se asume el comportamiento del base, pero no está verificado para este adaptador.
- El tamaño del repo declarado (0,0 GB) sugiere que los pesos pueden no estar subidos o que el adaptador es extremadamente pequeño; conviene verificar la integridad de los ficheros antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n91415-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper: https://arxiv.org/abs/2609.16454
- Dataset WVS Wave 7: https://doi.org/10.14281/18241.24
