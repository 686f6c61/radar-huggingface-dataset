# holi-lab/ArcANE-32B-SFT

## Resumen

ArcANE-32B-SFT es un modelo de generación de texto desarrollado por el laboratorio holi-lab y presentado en la conferencia EMNLP 2026. Se trata de un ajuste fino supervisado (SFT) sobre Qwen3-32B mediante LoRA (rank 64, alpha 128), orientado a generar respuestas de role-play en inglés que reflejen el estado conductual de un personaje en un punto concreto de una narrativa. A diferencia de los enfoques de persona fija, el modelo recibe un contexto llamado "Arco de personaje" truncado al capítulo consultado, de modo que solo dispone de la información narrativa hasta ese momento.

El entrenamiento se realizó sobre el corpus ArcANE, con 12 novelas, 55 personajes y 339 ejes de carácter. Para cada par de sonda y fase narrativa se generaron tres respuestas con un modelo profesor (gpt-5.4-mini). La evaluación sobre un conjunto retenido de cinco novelas, 25 personajes, 205 arcos y 1.754 sondas, usando un juez automático (DeepSeek-V4-Flash), otorga al modelo una puntuación global de 58,4 con contexto Arc, superando en 8,3 puntos a Qwen3-32B bajo las mismas condiciones.

Su relevancia radica en que aborda el role-play de personajes como un fenómeno dinámico y dependiente del tiempo narrativo, permitiendo estudiar cambios de comportamiento, razonamiento y valores a lo largo de una historia. Es una herramienta para narratología computacional, ficción interactiva y evaluación de coherencia de personajes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-32B) |
| Parámetros totales | 32.762.123.264 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible; límite de secuencia de entrenamiento: 8.192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ArcANE-32B-SFT parte de Qwen3-32B, un transformer decoder-only de la serie Qwen3, y aplica un ajuste fino supervisado mediante LoRA con rank 64 y alpha 128. El entrenamiento se realizó durante una única época con una tasa de aprendizaje de 1e-4, un tamaño de lote efectivo de 32 y una longitud máxima de secuencia de 8.192 tokens. El dataset de entrenamiento procede del corpus ArcANE, concretamente de la división SFT derivada de 12 novelas de entrenamiento, que cubren 55 personajes y 339 ejes de carácter. Para cada combinación de sonda y fase narrativa bajo contexto Arc, se generaron tres respuestas de referencia con gpt-5.4-mini. El modelo profesor recibió de forma privada la referencia de fase, pero las filas almacenadas solo conservan el system prompt del personaje, el prompt de usuario con escenario y pregunta, y la respuesta. La referencia de fase no se incluye en la entrada del modelo, lo que obliga a inferir el estado del personaje a partir del contexto del arco.

La principal innovación técnica es el uso de un arco de personaje truncado por capítulo como condicionamiento. Este contexto describe el estado del personaje en una fase concreta de la narrativa, y debe construirse de forma que no se expongan fases posteriores al capítulo consultado. El modo recomendado de uso es el de no-razonamiento del chat template de Qwen3, con la función de thinking deshabilitada.

## Capacidades

- Generación de respuestas de role-play en inglés condicionadas a un punto temporal de la narrativa.
- Modelado de cambios de comportamiento, razonamiento y valores a lo largo del arco de un personaje.
- Uso del formato de chat de Qwen3 con thinking deshabilitado.
- Capacidad para trabajar con contextos de arco de personaje en JSON (truncados por capítulo).
- No se documenta soporte de tool calling, visión, audio ni capacidades de agente.

## Casos de uso

1. Investigación en narratología computacional: el modelo permite generar respuestas de un personaje en fases concretas de una novela para analizar cómo cambian sus acciones y razonamientos. Se usará proporcionando un arco de personaje truncado al capítulo de interés.
2. Simulación de personajes para juegos narrativos: NPCs que reaccionan de forma coherente con su estado emocional y moral en el capítulo actual. El desarrollador puede integrar el modelo en un motor de diálogo con el contexto del arco.
3. Ficción interactiva y novelas visuales: mantener la coherencia de un personaje a través de un arco de historia largo. El modelo recibe solo la información hasta el punto consultado, evitando spoilers futuros.
4. Generación de datasets de role-play con progresión de arco: puede emplearse para crear datos sintéticos de conversaciones de personajes en distintos puntos de la trama, útiles para entrenar otros modelos o evaluar sistemas de diálogo.
5. Evaluación de coherencia de personajes: el modelo sirve como referencia en benchmarks donde se mide si un personaje se mantiene fiel a su estado en una fase narrativa. Sus métricas (APF, RPF, RAE, PTF) permiten cuantificar esa fidelidad.
6. Aplicaciones educativas de literatura: permitir a estudiantes interactuar con personajes de novelas clásicas en puntos concretos de la historia, facilitando el análisis de la evolución del personaje.
7. Chatbots literarios: asistentes conversacionales que responden como un personaje específico en un momento dado de la narrativa, condicionados a un contexto de arco.

## Benchmarks y rendimiento

La evaluación se realizó sobre un conjunto retenido de cinco novelas, 25 personajes, 205 arcos y 1.754 sondas. Un juez automático (DeepSeek-V4-Flash) puntuó cuatro métricas de 1 a 100. La siguiente tabla muestra los resultados con contexto Arc:

| Categoría de sonda | APF | RPF | RAE | PTF |
|---|---:|---:|---:|---:|
| In-Scenario | 62,6 | 61,3 | 55,9 | 56,7 |
| In-World | 61,4 | 60,6 | 54,7 | 51,8 |
| Out-of-World | 63,4 | 62,3 | 57,9 | 52,2 |

Comparativa global:

| Configuración | Overall |
|---|---:|
| ArcANE-32B-SFT, contexto Arc | 58,4 |
| ArcANE-32B-SFT, mejor contexto no Arc | 53,7 |
| Qwen3-32B, contexto Arc | 50,1 |

El contexto Arc mejora la puntuación global en 4,7 puntos sobre el mejor contexto no Arc del propio modelo y en 8,3 puntos sobre Qwen3-32B bajo el mismo contexto.

## Requisitos de hardware

- Tamaño del repositorio: 65,5 GB, lo que implica aproximadamente 65 GB de VRAM para cargar los pesos en FP16.
- No se han publicado requisitos oficiales de VRAM para cuantizaciones.
- GPU recomendadas para inferencia sin cuantizar: A100 de 80 GB, H100 o sistemas multi-GPU.
- Para ejecución en GPU de consumo, sería necesaria una cuantización de 4 bits (no especificada en la información).
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, TGI y llama.cpp si se cuantiza; no se han proporcionado configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall (ArcANE eval) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| ArcANE-32B-SFT | 32B | No disponible | 58,4 | Apache 2.0 | HuggingFace |
| Qwen3-32B (base) | 32B | No disponible | 50,1 | Apache 2.0 | HuggingFace |
| ArcANE-32B-SFT (sin contexto Arc) | 32B | No disponible | 53,7 | Apache 2.0 | HuggingFace |
| ArcANE-32B-DPO | 32B | No disponible | No disponible | Apache 2.0 | HuggingFace |

La comparativa muestra que el contexto Arc es determinante para el rendimiento: el modelo supera claramente a su base sin ajuste y a su propia configuración sin contexto. El modelo hermano DPO existe pero no se han publicado resultados en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se documenta soporte para otros idiomas.
- Está pensado para investigación; no se han publicado evaluaciones de seguridad, sesgos o robustez para uso en producción.
- La fidelidad del role-play depende críticamente de que el contexto del arco esté correctamente truncado. Exponer fases futuras o campos como literary_validation, evidence_summary, pole_end o arc_direction degrada el rendimiento.
- Riesgo de alucinación inherente a los modelos generativos de texto.
- Los datos de entrenamiento proceden de respuestas de un modelo profesor (gpt-5.4-mini), lo que puede introducir sesgos propios de ese modelo.
- No se especifican restricciones adicionales más allá de la licencia Apache 2.0, pero los datos del corpus ArcANE pueden tener sus propias condiciones de uso no detalladas.

## Enlaces

- Modelo: https://huggingface.co/holi-lab/ArcANE-32B-SFT
- Dataset: https://huggingface.co/datasets/holi-lab/ArcANE-Data
- Colección ArcANE: https://huggingface.co/collections/holi-lab/arcane
- Modelo DPO: https://huggingface.co/holi-lab/ArcANE-32B-DPO
- Modelo RLVR: https://huggingface.co/holi-lab/ArcANE-32B-RLVR
- Paper: https://arxiv.org/abs/2606.05553
- Repositorio GitHub: https://github.com/holi-lab/ArcANE
