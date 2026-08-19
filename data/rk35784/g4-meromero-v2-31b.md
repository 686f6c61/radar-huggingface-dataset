# rk35784/G4-MeroMero-v2-31B

## Resumen

G4-MeroMero-v2-31B es un ajuste fino (finetune) del modelo base `google/gemma-4-31B-it`, desarrollado por el usuario rk35784. Está diseñado específicamente para tareas creativas, con un enfoque particular en roleplay narrativo (narrative RP). Según la información disponible, el objetivo del autor era aumentar la creatividad del modelo sin sacrificar su capacidad de razonamiento, un equilibrio difícil de lograr en modelos de este tamaño.

El modelo se presenta como una evolución de G4-MeroMero-31B, con mejoras orientadas a generar respuestas más imaginativas y menos estereotipadas. Cuenta con aproximadamente 31.273 millones de parámetros y una arquitectura transformer con atención por grupos de consultas (GQA). Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y modificación. Su relevancia actual radica en que aborda una demanda creciente de modelos de rol y escritura creativa con calidad profesional, manteniendo la base técnica de la familia Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con grouped-query attention (GQA), 60 capas, hidden size 5.376, 32 query heads, 16 key/value heads, intermediate size 21.504 |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors en precisión completa) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de `google/gemma-4-31B-it`, por lo que hereda su arquitectura base: un transformer denso con 60 capas, tamaño de ocultación de 5.376 y atención por grupos de consultas (32 cabezas de consulta, 16 de clave/valor). El tamaño intermedio de las capas feed-forward es de 21.504. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni las técnicas de alineación aplicadas (RLHF, DPO, etc.). El autor menciona que el proceso se inspiró en varios papers de investigación, entre ellos "StoryScope", aunque no se proporcionan más detalles en la documentación pública.

Al ser un finetune, conserva las capacidades del modelo base de Gemma 4, pero con un ajuste específico para tareas creativas. No se han publicado datos sobre el proceso de entrenamiento, la duración ni los hiperparámetros utilizados.

## Capacidades

- Generación de texto creativo y narrativo, especialmente orientado a roleplay y escritura de ficción.
- Razonamiento y comprensión del lenguaje, heredados del modelo base Gemma 4 31B.
- Soporte de conversaciones multi-turno (chat), dado que parte de la versión instruct de Gemma 4.
- Capacidad multilingüe probablemente similar a Gemma 4, aunque no se especifica en la documentación.
- No se indica soporte explícito para tool calling, agentes o funciones de visión/audio.
- No se menciona un modo de pensamiento (thinking mode) específico.

## Casos de uso

- Roleplay narrativo en juegos de texto: el modelo puede mantener personajes coherentes y tramas complejas, gracias a su entrenamiento específico en narrativa. Se usaría como motor de diálogo en aplicaciones de ficción interactiva.
- Escritura asistida de ficción: ayuda a autores a generar borradores, descripciones de escenas, diálogos o giros argumentales. Su orientación creativa lo hace adecuado para superar bloqueos de escritura.
- Creación de contenido para videojuegos: generación de diálogos de NPCs, misiones secundarias o descripciones de mundos. La capacidad de mantener coherencia en contextos largos (si se confirma la ventana) sería clave.
- Simulación de personajes para chatbots especializados: permite construir asistentes con personalidad definida para entretenimiento o educación.
- Generación de guiones o diálogos para teatro, cine o podcasts: su enfoque en narrativa puede producir textos con ritmo y estilo más natural que modelos genéricos.
- Prototipado rápido de historias interactivas: desarrolladores pueden usar el modelo para generar ramas de historia dinámicas en motores de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: según LLM Explorer, el modelo completo requiere aproximadamente 62,5 GB de VRAM (probablemente en precisión fp16). Esto supera la capacidad de la mayoría de GPUs de consumo (por ejemplo, RTX 4090 con 24 GB no es suficiente).
- GPUs recomendadas: se necesitarían GPUs profesionales como A100 (80 GB), H100 (80 GB) o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 con NVLink o 2x A6000). No hay datos sobre cuantizaciones que reduzcan el requisito de memoria.
- No cabe en una GPU de consumo estándar sin cuantización. Si se publicaran versiones GGUF o cuantizadas, podría ejecutarse en hardware más modesto, pero no se dispone de esa información.
- Opciones de despliegue: al ser un modelo con pesos safetensors, se puede servir con frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay instrucciones específicas del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| G4-MeroMero-v2-31B (este) | 31,3B | No disponible | Apache 2.0 | Creativo / roleplay |
| google/gemma-4-31B-it (base) | 31,3B | No disponible | Apache 2.0 | General / instruct |
| G4-MeroMero-31B (versión anterior) | 31,3B | No disponible | Apache 2.0 | Creativo / roleplay (menos creativo) |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal es el ajuste fino para tareas creativas, que según el autor mejora la originalidad sin degradar significativamente la inteligencia general.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como finetune de Gemma 4, puede heredar sesgos presentes en el modelo base.
- El enfoque en creatividad puede aumentar la probabilidad de respuestas inventadas o poco factuales, lo que lo hace inadecuado para tareas que requieren precisión (por ejemplo, asesoramiento legal o médico).
- No se especifica la longitud de contexto soportada; se desconoce si el finetune mantiene la ventana original de Gemma 4 o la modifica.
- La documentación es muy limitada: no hay información sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos de sobreajuste o contaminación.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los términos de la licencia del modelo base Gemma 4, que puede tener restricciones adicionales (aunque en este caso el repositorio indica Apache 2.0 para el finetune).
- El tamaño del modelo (62,6 GB en safetensors) implica costes de inferencia elevados y dificulta su despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/rk35784/G4-MeroMero-v2-31B
- Versión MLX (cuantización mxfp8) por beezu: https://huggingface.co/beezu/G4-MeroMero-v2-31B-mlx-mxfp8
- Versión alternativa por zerofata: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Vista de arquitectura (hfviewer): https://hfviewer.com/zerofata/G4-MeroMero-v2-31B
- Ficha en LLM Explorer: https://llm-explorer.com/model/zerofata%2FG4-MeroMero-v2-31B,4EnQ8ulUmyaMNAyBspmm00
- Página oficial de Gemma 4 (modelo base): https://deepmind.google/models/gemma/gemma-4/
