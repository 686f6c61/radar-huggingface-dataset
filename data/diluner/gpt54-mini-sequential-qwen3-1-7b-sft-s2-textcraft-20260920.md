# Diluner/gpt54-mini-sequential-qwen3-1.7b-sft-s2-textcraft-20260920

## Resumen

Este repositorio contiene un checkpoint de ajuste supervisado (SFT) del modelo Qwen/Qwen3-1.7B, entrenado por el usuario Diluner con trayectorias generadas por un profesor denominado `gpt-5.4-mini`. No es un modelo nuevo desde cero: es la segunda etapa de una cadena secuencial de entrenamiento agéntico denominada BabyAI → TextCraft → SearchQA, en la que cada entorno recibe cinco épocas y el estudiante y el método se arrastran de una etapa a la siguiente. El checkpoint corresponde a la etapa TextCraft, con 55 actualizaciones del optimizador completadas.

El interés del artefacto es fundamentalmente metodológico y de investigación: documenta un procedimiento de entrenamiento por etapas encadenadas sobre un modelo pequeño (2.031.739.904 parámetros totales, contando embeddings), con evidencia declarada de finalización de etapa (manifiesto completo, recuento de pasos verificado y marcador de verificación del controlador). Es relevante para quienes estudian destilación desde modelos frontera hacia modelos de 1-3 mil millones de parámetros y para quienes evalúan si el entrenamiento secuencial multi-entorno preserva o degrada capacidades.

Hay que subrayar que el propio autor advierte de que no se adjunta ninguna evaluación completada a este checkpoint intermedio y que las puntuaciones de los tres entornos pertenecen únicamente al modelo de etapa 3 completamente entrenado. El repositorio incluye configuración, tokenizador y todos los shards de pesos en la raíz, pero no incluye estado del optimizador, registros crudos ni trayectorias del profesor; las referencias legibles por máquina y las sumas de comprobación están en `experiment.json`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3, heredada del modelo base Qwen/Qwen3-1.7B |
| Parámetros totales | 2.031.739.904 (dato real de los safetensors) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la información proporcionada (la model card no la especifica) |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card declara explícitamente que no se afirma ninguna licencia y remite a los términos del modelo base |
| Formato de pesos | safetensors (shards en la raíz del repositorio, 8,1 GB en total), con configuración y tokenizador incluidos |
| Modelo base | Qwen/Qwen3-1.7B (ajuste fino sobre el mismo) |
| Etapa de entrenamiento | Etapa 2 (TextCraft) de la cadena secuencial BabyAI → TextCraft → SearchQA |
| Profesor (teacher) | `gpt-5.4-mini` |
| Épocas por entorno | Cinco |
| Actualizaciones del optimizador en esta etapa | 55 |
| Biblioteca declarada | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 8,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-1.7B, un transformer decoder-only denso, sin mezcla de expertos. El repositorio no describe modificaciones estructurales sobre esa base: el trabajo consiste en un ajuste fino supervisado (SFT) sobre trayectorias de un profesor, por lo que la innovación no está en la topología del modelo sino en el procedimiento de entrenamiento. Los pesos exportados suman 2.031.739.904 parámetros, coherente con un modelo de la clase 1,7B cuando se contabilizan las matrices de embeddings.

El entrenamiento se organiza como una cadena secuencial de entornos: BabyAI, después TextCraft y finalmente SearchQA. Este checkpoint corresponde al cierre de la etapa TextCraft (etapa 2), tras cinco épocas y 55 actualizaciones del optimizador en esa etapa. El autor indica que el estudiante y el método se mantienen a lo largo de la cadena, y que este checkpoint proviene de una cadena secuencial distinta de la ejecución independiente histórica. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni el uso de RLHF o DPO; el autor tampoco adjunta evaluación alguna para este checkpoint intermedio.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`), con la plantilla de chat del tokenizador de Qwen3.
- Entrenamiento orientado a tareas agénticas: la cadena incluye entornos de manipulación simbólica (BabyAI), fabricación basada en recetas textuales (TextCraft) y respuesta a preguntas sobre evidencia (SearchQA).
- Ejecución de trayectorias de varios pasos derivadas del profesor, ya que el SFT se realiza sobre trayectorias completas y no solo sobre respuestas finales.
- Capacidad de seguir instrucciones y formatos propios de los entornos de la cadena, en la medida en que el SFT los codifica.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Modo de razonamiento explícito (*thinking*): no documentado.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Investigación sobre entrenamiento secuencial multi-entorno: el checkpoint sirve como punto de control intermedio para estudiar si el orden BabyAI → TextCraft → SearchQA produce olvido catastrófico respecto a la etapa 1, comparando las activaciones y la perplejidad en cada entorno.
- Destilación desde modelos frontera a modelos pequeños: dado que el profesor es `gpt-5.4-mini` y el estudiante tiene 2,03 mil millones de parámetros, es un caso de estudio directo para medir cuánta capacidad agéntica se transfiere a un modelo desplegable en una sola GPU.
- Reproducción de experimentos: los ficheros de configuración, tokenizador y shards están completos, y `experiment.json` contiene referencias y sumas de comprobación, lo que permite auditar el procedimiento aunque no se incluyan registros crudos ni trayectorias.
- Agentes de manipulación simbólica en texto: tareas de planificación sobre estados textuales (inventario, recetas, acciones válidas) son el dominio directo del ajuste y pueden probarse con prompts estructurados.
- Evaluación comparativa de metodologías de SFT: al ser un checkpoint de etapa con recuento de pasos verificado, es útil como referencia para comparar estrategias de entrenamiento por etapas frente a entrenamiento conjunto.
- Despliegue en hardware limitado para experimentación: con 2,03 mil millones de parámetros cabe en GPUs de consumo y en CPU, lo que permite iterar sobre prompts y agentes sin coste de infraestructura elevado.
- Base para posteriores ajustes específicos de dominio: al ser un modelo pequeño con licencia no declarada, se puede usar como punto de partida en entornos de investigación cerrados, siempre que se resuelva antes la cuestión de los términos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se adjunta ninguna evaluación completada para este checkpoint intermedio y que las puntuaciones de los tres entornos pertenecen únicamente al modelo de etapa 3 completamente entrenado, por lo que no deben atribuirse a este repositorio.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 4,1 GB solo para los pesos; con caché KV y activaciones, se recomienda prever 6-8 GB.
- VRAM en int8: aproximadamente 2,1 GB para los pesos.
- VRAM en cuantización de 4 bits (Q4_K_M, GPTQ o AWQ): aproximadamente 1,2-1,5 GB.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y en equipos Apple Silicon con 8-16 GB de memoria unificada; también es viable en CPU con cuantización de 4-8 bits.
- GPU de centro de datos: no requiere A100 ni H100; una NVIDIA L4 (24 GB) o una T4 (16 GB) son suficientes para inferencia en bf16.
- Opciones de despliegue: `transformers` (ruta documentada por el autor), vLLM, Hugging Face TGI (el repositorio declara la etiqueta `text-generation-inference` y compatibilidad con endpoints), y llama.cpp / Ollama / LM Studio previa conversión de los safetensors a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni de contexto de este checkpoint, por lo que la comparación se limita a características estructurales y de disponibilidad. Los valores de contexto y licencia de las alternativas proceden de su documentación pública habitual y deberían verificarse antes de tomar decisiones de producción; no se han confirmado con las fuentes de esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| Diluner/gpt54-mini-sequential-qwen3-1.7b-sft-s2-textcraft-20260920 | 2.031.739.904 | No disponible | No disponible (la model card no afirma licencia) | Hugging Face, 0 descargas, 0 likes | Checkpoint SFT intermedio de una cadena secuencial |
| Qwen/Qwen3-1.7B | Clase 1,7B (≈2,03 mil millones contando embeddings) | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face, modelo ampliamente distribuido | Modelo base denso, no ajustado para agentes |
| Alternativas de la clase 1-2B (por ejemplo, familias tipo SmolLM2-1.7B o Gemma-3-1B) | 1-2 mil millones | No disponible | No disponible | Hugging Face | Modelos generalistas con instrucciones |

La diferencia relevante de este checkpoint frente al modelo base no es de tamaño ni de arquitectura, sino de procedimiento: incorpora una fase de SFT con trayectorias de profesor sobre entornos agénticos concretos, a costa de no tener licencia declarada, ni evaluación publicada, ni métricas de adopción.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni puntuaciones de los entornos de la cadena, ni conjunto de validación documentado para este checkpoint. Cualquier afirmación de rendimiento sería especulativa.
- Licencia no declarada: la model card indica que no se afirma ninguna licencia y remite a los términos del modelo base. Esto bloquea de facto el uso comercial hasta que se aclare la situación legal.
- Idiomas no declarados: no se especifica qué lenguas cubre el ajuste; el comportamiento fuera del inglés (idioma predominante esperable en los entornos BabyAI, TextCraft y SearchQA) es desconocido.
- Riesgo de alucinación: no cuantificado. Al ser un modelo de 2,03 mil millones de parámetros ajustado sobre trayectorias sintéticas de un profesor, la tendencia a inventar acciones o estados inválidos en tareas agénticas es un riesgo real que debe mitigarse con validación externa.
- Sesgos: no documentados. No hay análisis de sesgos ni de composición del dataset de entrenamiento.
- Alcance limitado del ajuste: el entrenamiento se centra en tres entornos concretos; no hay evidencia de que las capacidades se generalicen a dominios ajenos a la cadena.
- Estatus de artefacto experimental: el propio autor advierte de que se trata de un único checkpoint entrenado, no de evidencia de una ventaja metodológica general ni de replicación entre semillas; además, la selección se registra por nombres, tamaños y fechas de modificación, no mediante un hash byte a byte que ligue los pesos a respuestas de evaluación históricas.
- Falta de material de reproducibilidad: no se incluyen estado del optimizador, registros crudos ni trayectorias del profesor, lo que impide reproducir el entrenamiento a partir del repositorio.
- Adopción nula y fecha atípica: 0 descargas y 0 likes, con fecha de creación posterior a la de la mayoría de referencias disponibles, lo que reduce la probabilidad de validación por terceros.
- La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo ni sobre la metodología declarada; los resultados obtenidos no guardan relación con el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diluner/gpt54-mini-sequential-qwen3-1.7b-sft-s2-textcraft-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Fichero de referencias y sumas de comprobación del experimento: `experiment.json` en la raíz del repositorio del modelo.
- Búsqueda web: no se han encontrado papers, blogs, repositorios ni demostraciones relacionados con este modelo en la información disponible.
