# EstarHash/ProRubric-Qwen3-4B-Writing

## Resumen

ProRubric-Qwen3-4B-Writing es un checkpoint de ajuste fino por refuerzo (RL) sobre el modelo base Qwen/Qwen3-4B, desarrollado por EstarHash en el marco del método ProRubric descrito en el artículo "Scoring Higher, Answering Worse: Mitigating Reward Hacking in Rubric-Based RL via Protocol-Level Rubrics" (arXiv:2609.38847). El modelo está especializado en el dominio de escritura (Writing) y se entrena con PPO/GRPO mediante la librería verl v0.8.0, con semilla 42 y en el paso 300 de RL.

El problema que aborda es el reward hacking en el RL basado en rúbricas: cuando un modelo aprende a maximizar la puntuación de una rúbrica sin mejorar la calidad real de sus respuestas. ProRubric propone rúbricas a nivel de protocolo con dimensiones conjuntivas y cláusulas de fallo explícitas, de modo que el modelo no pueda satisfacer la rúbrica parcialmente y aun así obtener recompensa. Este checkpoint concreto aplica dicho método al dominio de la escritura.

Con 4.022.468.096 parámetros (aproximadamente 4B), pesos en safetensors y licencia Apache 2.0, el modelo hereda la arquitectura transformer densa de Qwen3-4B. Es relevante para investigadores interesados en alineación mediante RL, mitigación de reward hacking y evaluación por rúbricas, así como para desarrolladores que necesiten un modelo de 4B especializado en generación de texto escrito en un entorno de recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de aproximadamente 4B parámetros, y se ajusta mediante aprendizaje por refuerzo con PPO/GRPO usando verl v0.8.0 (semilla 42, paso 300). El método ProRubric introduce rúbricas a nivel de protocolo: dimensiones conjuntivas con cláusulas de fallo explícitas, diseñadas para impedir que el modelo obtenga recompensa satisfaciendo solo parcialmente los criterios de evaluación. El entrenamiento se orienta al dominio de escritura, aunque la model card no detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo etapas adicionales de SFT o DPO.

La innovación técnica destacable es precisamente el diseño de la recompensa: en lugar de rúbricas aditivas fáciles de explotar, se emplean protocolos conjuntivos que penalizan explícitamente los modos de fallo, atacando el fenómeno del reward hacking documentado en el artículo asociado. No se dispone de información sobre detalles de atención, decodificación especulativa u otras optimizaciones de inferencia en la documentación proporcionada.

## Capacidades

- Generación de texto en el dominio de escritura, con alineación orientada a rúbricas de calidad.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-4B.
- Entrenamiento con RL (PPO/GRPO) orientado a reducir el reward hacking en evaluaciones por rúbricas.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Qwen3-4B es multilingüe, pero no se confirma el alcance tras el ajuste).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación por RL: el checkpoint sirve como referencia reproducible (semilla 42, paso 300) para estudiar reward hacking y comparar rúbricas aditivas frente a protocolos conjuntivos en tareas de escritura.
- Evaluación de calidad de redacción: puede emplearse para generar textos sujetos a rúbricas de escritura y analizar si el modelo satisface criterios de forma genuina o superficial.
- Generación de contenido escrito asistido: redacción de borradores, resúmenes y textos expositivos en un modelo de 4B desplegable en hardware de gama media.
- Reproducción de experimentos del artículo: al estar publicados el código (github.com/Estrellajer/ProRubric) y el checkpoint, permite replicar el paso 300 del entrenamiento en el dominio Writing.
- Base para ajustes posteriores: punto de partida para experimentos de RL o SFT en dominios específicos de escritura con licencia Apache 2.0.
- Despliegue en entornos con recursos limitados: con 4B parámetros y pesos safetensors, es viable en GPU de consumo para prototipos de generación de texto.
- Estudio de robustez ante rúbricas: análisis de cómo responde el modelo a criterios de evaluación con cláusulas de fallo explícitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 8 GB solo para pesos (4.022 millones de parámetros), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 4-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para inferencia en precisión completa con lotes grandes; RTX 4090, RTX 3090 o RTX 4080 para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más si se usa cuantización; en FP16 conviene disponer de al menos 12-16 GB para margen.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (previa conversión a GGUF), y transformers con PyTorch. El formato publicado es safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ProRubric-Qwen3-4B-Writing | 4,02B | No disponible | Apache 2.0 | Ajuste RL con ProRubric en dominio Writing |
| Qwen/Qwen3-4B | ~4B | No disponible en esta ficha | Apache 2.0 | Modelo base sin ajuste RL específico |
| Alternativas de 4B para escritura | No disponible | No disponible | No disponible | No se dispone de datos comparativos de rendimiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado para el dominio Writing y puede degradar el rendimiento en otras tareas respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos de 4B; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la model card; probablemente hereda los sesgos del corpus de entrenamiento de Qwen3-4B.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto efectiva ni los idiomas soportados tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B y citar el artículo asociado.
- Checkpoint intermedio: corresponde al paso 300 de RL con semilla 42; no se garantiza que sea el punto óptimo de convergencia.
- Madurez limitada: 33 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de uso en producción.
- No se documentan capacidades de tool calling, agentes ni modo thinking, por lo que no deben asumirse en producción.

## Enlaces

- Hugging Face: https://huggingface.co/EstarHash/ProRubric-Qwen3-4B-Writing
- Artículo: https://arxiv.org/abs/2609.38847
- Código: https://github.com/Estrellajer/ProRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
