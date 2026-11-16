# skblv/diversity-calibration-wvs-qwen3.5-2b-n45707-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-2b-n45707-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen3.5-2B, desarrollado por el usuario skblv. No se trata de un modelo fundacional independiente, sino de un ajuste fino especializado cuyo objetivo es calibrar la diversidad de las respuestas generadas por el modelo base en tareas de simulación de opinión y encuestas demográficas. El adaptador se entrena sobre datos del World Values Survey (WVS) Wave 7, un corpus de encuestas sociales a nivel internacional.

La motivación técnica proviene del artículo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (Skobelev, Fithian y Han, 2026), que aborda dos patologías opuestas en modelos de lenguaje: el colapso de moda (el modelo genera siempre la misma respuesta ante variaciones de prompt) y la sobredispersión (el modelo genera distribuciones de respuesta demasiado planas o ruidosas). El adaptador busca que la distribución de respuestas del modelo ante personas demográficas y preguntas de encuesta se aproxime a la diversidad observada empíricamente en los datos reales del WVS (calibración con R = 1).

El adaptador tiene un tamaño de repositorio de 0.0 GB, lo que es coherente con un LoRA de rango 16 sobre un modelo de 2B parámetros. Está etiquetado con `peft`, `safetensors`, `lora` y `text-generation`, y su modelo base es Qwen/Qwen3.5-2B. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer Qwen3.5-2B; rango 16, alpha 32, dropout 0.05 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado sobre el modelo base Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. El entrenamiento se realizó durante tres épocas sobre 45.707 ejemplos de pares encuestado-pregunta extraídos de la World Values Survey Wave 7. El subconjunto de entrenamiento utilizó un tercio fijo y aleatorio de países y de preguntas medibles, lo que implica una partición controlada para evaluar la generalización a países y preguntas no vistos.

Cada prompt de entrenamiento contenía una persona demográfica, la pregunta de la encuesta y opciones de respuesta etiquetadas con letras; el objetivo era la letra de la opción elegida por el encuestado. Los tokens del prompt se enmascararon de la pérdida, que se aplicó únicamente al token o tokens de la letra de respuesta y al token EOS. Esta estrategia de enmascaramiento concentra el aprendizaje en la distribución condicional de la respuesta dada la persona y la pregunta, sin penalizar la modelización del contexto. El objetivo declarado es la calibración de la diversidad: acercar la diversidad relativa de las respuestas generadas a la diversidad empírica de los datos del WVS (R = 1 en la curva de convergencia).

## Capacidades

- Generación de texto condicionada por persona demográfica y pregunta de encuesta, devolviendo una letra de opción de respuesta.
- Simulación de respuestas de encuestados sintéticos con distribución calibrada para aproximarse a la diversidad empírica del World Values Survey.
- Modelización de la distribución de respuestas ante opciones múltiples (no solo la respuesta más probable).
- Ajuste fino eficiente en parámetros mediante PEFT, lo que permite cargar el adaptador sobre el modelo base sin duplicar los pesos completos.
- Capacidades generales de generación de texto heredadas del modelo base Qwen3.5-2B (no verificadas específicamente para este adaptador).
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible en la información proporcionada para este adaptador.

## Casos de uso

- Simulación de opinión pública: generar distribuciones de respuesta sintéticas ante preguntas del WVS condicionadas por perfiles demográficos (edad, país, nivel educativo), útil para estudios de sensibilidad demográfica y análisis contrafactual cuando no se dispone de microdatos.
- Investigación en ciencias sociales computacionales: sustituir encuestados sintéticos por este adaptador para explorar cómo varían las opiniones ante cambios en la composición de la población simulada, con la ventaja de que la diversidad de salida está calibrada frente a datos reales.
- Evaluación de calibración de modelos: usar el adaptador como referencia de un modelo con diversidad calibrada (R = 1) para comparar con el modelo base u otros ajustes y medir colapso de moda o sobredispersión.
- Aumento de datos para encuestas: generar respuestas plausibles para preguntas y subgrupos con pocos casos en la muestra original, respetando la estructura de opciones del cuestionario.
- Pruebas de robustez de pipelines de análisis de encuestas: alimentar sistemas de tabulación o modelado estadístico con respuestas sintéticas cuya distribución se conoce a priori, para validar el comportamiento del pipeline ante diferentes composiciones demográficas.
- Docencia e investigación metodológica: ilustrar en entornos académicos cómo el ajuste fino con LoRA puede corregir sesgos de diversidad en modelos de lenguaje aplicados a la simulación social, con un caso reproducible sobre datos públicos del WVS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente presenta una curva de convergencia de diversidad relativa (R = 1 como línea de calibración objetivo), sin valores numéricos de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa una fracción mínima de memoria (repositorio de 0.0 GB); el requisito real lo determina el modelo base Qwen3.5-2B.
- VRAM estimada para el modelo base en precisión completa (FP16/BF16): aproximadamente 4-5 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización de 8 bits: aproximadamente 2-3 GB; con cuantización de 4 bits: aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) debería poder ejecutar el modelo base en cuantización de 4 u 8 bits; para FP16 se recomienda 8-12 GB de VRAM.
- GPU de datacenter (A100, H100) no son necesarias para inferencia de un modelo de 2B, pero pueden usarse para evaluación a gran escala o entrenamiento de adaptadores adicionales.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; puede cargarse sobre el modelo base con Transformers + PEFT. Para servir el modelo fusionado se puede usar vLLM, TGI o llama.cpp/Ollama tras convertir los pesos a GGUF. No se dispone de datos de latencia ni throughput específicos para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-2b-n45707-lora (este) | LoRA sobre 2B | No disponible | Adaptador LoRA especializado en calibración de diversidad | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (modelo base) | 2B | No disponible | Modelo fundacional transformer | No disponible | Hugging Face |
| Adaptadores LoRA de simulación de encuestas (genéricos) | Variable | No disponible | Ajuste fino sobre modelos de 1-7B | Variable | No disponible |
| Modelos de simulación de opinión tipo "silicon sampling" | Variable | No disponible | Modelos ajustados para imitar respuestas humanas | Variable | No disponible |

La comparativa cuantitativa con alternativas concretas no está disponible en la información proporcionada. La principal diferencia de este adaptador frente al modelo base es su objetivo explícito de calibración de diversidad sobre datos del WVS, no una mejora en benchmarks generales.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre la World Values Survey Wave 7; su comportamiento fuera de ese dominio (preguntas, formatos o poblaciones no representadas) no está garantizado.
- El entrenamiento usó un tercio fijo y aleatorio de países y preguntas medibles; el rendimiento en países o preguntas excluidos del entrenamiento puede diferir y no se documenta en la información disponible.
- Riesgo de alucinación y de generar letras de opción no válidas si el prompt no respeta el formato de entrenamiento (persona demográfica, pregunta y opciones letradas).
- La simulación de opinión no equivale a opinión real: las respuestas sintéticas pueden reproducir sesgos presentes en los datos del WVS y en el modelo base, y no deben usarse como sustituto de encuestas reales en decisiones políticas o comerciales.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Los idiomas soportados no están declarados; el WVS Wave 7 se recoge en múltiples países, pero la cobertura lingüística efectiva del adaptador no se especifica.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB; conviene verificar la integridad y el contenido real de los archivos antes de usarlo.
- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen3.5-2B; cualquier restricción de licencia o uso del modelo base se aplica también al adaptador.
- No se han publicado métricas de benchmarks generales; no debe asumirse que el adaptador conserva o mejora las capacidades del modelo base en razonamiento, código o matemáticas.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n45707-lora
- Artículo: Skobelev, K., Fithian, E. y Han, X. Y. (2026). "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs". arXiv:2609.16454 — https://arxiv.org/abs/2609.16454
- Datos: Haerpfer et al., eds. (2022). World Values Survey: Round Seven—Country-Pooled Datafile, v6.0.0 — https://doi.org/10.14281/18241.24
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
