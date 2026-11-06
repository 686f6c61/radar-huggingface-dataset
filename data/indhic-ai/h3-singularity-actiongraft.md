# indhic-ai/H3-Singularity-ActionGraft

## Resumen

H3-Singularity-ActionGraft es un LoRA (adaptador de bajo rango) para el modelo de generación de vídeo MiniMax H3, concretamente para el checkpoint comunitario `Minimax-h3_Singularity_ref2va_Pruned_v1.3_int8` (Singularity v1.3). Lo desarrolla el usuario `indhic-ai` y su objetivo es muy concreto: acelerar los intercambios de golpes y reforzar el impacto físico en escenas de combate generadas por Singularity v1.3, manteniendo el aspecto visual propio de esa versión. El adaptador se publica en formato safetensors bf16 con el formato de claves de ComfyUI y ocupa 155 MB (el repositorio completo, 0,5 GB).

La particularidad técnica más destacable es que el LoRA no se ha entrenado: se ha construido mediante cirugía de pesos, diseccionando dos modelos existentes en el espacio de pesos y conservando únicamente las partes que codifican la acción. La componente de velocidad procede del fine-tune propio de Singularity v2, extraído como LoRA de rango 16; la de impactos y bloqueo procede de la pieza text-refiner de Motion Repair V2 (2 de sus 52 bloques, 16 de sus 416 tensores), dejando fuera el resto de bloques para evitar efectos secundarios.

Es relevante para quienes ya trabajan con el ecosistema MiniMax H3 en ComfyUI y quieren mejorar la sensación de combate sin cambiar de checkpoint base ni reentrenar. El autor reporta que los píxeles de movimiento más rápido se desplazan entre un 40 y un 55 % más rápido que en v1.3, aunque el tiempo de generación por trabajo se mantiene prácticamente igual. La versión v2, orientada a impactos aún más fuertes, está en desarrollo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3; el modelo base es un generador de vídeo (arquitectura exacta no disponible) |
| Parámetros totales | no disponible (el adaptador pesa 155 MB en bf16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (adaptador); el modelo base se usa en int8 (pruned) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (etiquetada como «other») |
| Formato de pesos | safetensors, con formato de claves de ComfyUI (`diffusion_model.blocks.N.*`, `diffusion_model.token_refiner.*`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 en su componente de velocidad, extraído del fine-tune de Singularity v2. La componente de impacto y bloqueo proviene de 2 bloques del text-refiner de Motion Repair V2 (16 tensores de un total de 416), seleccionados por ser los que portan la señal de acción. El autor declara explícitamente que no hubo entrenamiento: el proceso consistió en diseccionar dos modelos en el espacio de pesos y conservar solo los subconjuntos relevantes. No se dispone de información sobre el dataset, el número de tokens ni técnicas de RLHF/DPO, porque no se aplican a un adaptador construido por cirugía de pesos.

El adaptador está pensado para aplicarse sobre `Minimax-h3_Singularity_ref2va_Pruned_v1.3_int8` con fuerza 1.0. No debe apilarse sobre Singularity v2 ni sobre merges que lo contengan (por ejemplo, Singularity x 10Eros PRISM), ya que ya incorporan el fine-tune de v2 y este se contaría dos veces. La receta probada por el autor emplea Pika H3 flex ref2va LoRA (6 pasos, euler/simple) dentro de MiniMax H3 Master Extender, con una primera pasada a 608x352 seguida de un refinado DMAD de 1 paso a 1280x720, atención dispersa SLA 0.9, ActionLogic bridge V2 y Sol VAE.

## Capacidades

- Modificación del estilo de movimiento en vídeo generado: acelera los intercambios de golpes y refuerza los impactos en escenas de combate.
- Preservación del aspecto visual de Singularity v1.3 (no sustituye el checkpoint base, solo lo modula).
- Refuerzo de contactos físicos descritos en el prompt: el LoRA amplifica el impacto que el texto describe, pero no lo inventa.
- Mantenimiento del ritmo en escenas lentas: en la prueba de drama lento, el movimiento medio pasa de 0,32 a 0,55 px/frame, sin acelerar la escena de forma perceptible.
- Compatibilidad con el flujo de ComfyUI y con el nodo HyperFlow (con la salvedad descrita abajo).
- No es un modelo de texto, código, matemáticas, visión o tool calling; es un adaptador específico de generación de vídeo.

## Casos de uso

- Producción de escenas de artes marciales para cortometrajes o animación: aplicar el LoRA sobre Singularity v1.3 permite obtener combates con más intercambios de golpes en el mismo tiempo de generación (158 s frente a 160 s en la prueba estándar), útil para previsualizaciones de acción.
- Animación de duelos wuxia con coreografía rápida: en la prueba del templo wuxia, la velocidad de flujo de los píxeles más rápidos sube de 39,7 a 51,1 px/frame, acercándose al resultado de Singularity v2 sin cambiar de base.
- Escenas de impacto cuerpo a cuerpo en proyectos de fantasía o terror: el refuerzo de la pieza text-refiner de Motion Repair V2 mejora la sensación de contacto cuando el prompt describe el golpe y su consecuencia sobre el cuerpo del rival.
- Iteración rápida en ComfyUI para equipos que ya tienen un pipeline montado con Singularity v1.3: el adaptador se carga como cualquier LoRA y no requiere reentrenamiento ni cambio de checkpoint.
- Pruebas A/B de ritmo de acción: al mantener el mismo prompt, referencias, semilla y receta, permite comparar directamente v1.3 con y sin el adaptador para decidir qué versión usar en cada plano.
- Escenas dramáticas con diálogo: la prueba CHOODI s1e05 confirma que el LoRA no arruina escenas lentas y mantiene la asignación de diálogo a los hablantes correctos, por lo que puede usarse en un proyecto mixto de acción y drama.
- Investigación sobre edición de modelos en el espacio de pesos: el método de disección de dos checkpoints para aislar comportamientos concretos es un caso práctico reproducible para estudiar técnicas de model merging y grafting.

## Benchmarks y rendimiento

El autor publica métricas de movimiento (flujo medio de los píxeles más rápidos, en px/frame a 720p, entre fotogramas vecinos, omitiendo cortes), no benchmarks académicos estándar.

| Prueba | v1.3 | v1.3 + ActionGraft v1 | Singularity v2 |
|---|---|---|---|
| Duelo de cazadores de demonios, 2 clips encadenados de 15 s | 28,4 | 42,4 | 45,4 |
| Duelo en templo wuxia, 2 clips encadenados de 15 s | 39,7 | 51,1 | 51,6 |
| Devi vs la Horda Demoníaca, clip 2 (asesinato por la garganta, carga bruta) | 29,3 | 45,2 | 43,2 |
| Devi vs la Horda Demoníaca, clip 7 (ráfaga de cuatro brazos vs el señor demonio) | 27,0 | 40,5 | 45,2 |
| CHOODI s1e05 escena lenta (media de todos los píxeles) | 0,32 | 0,55 | no disponible |

Tiempos de trabajo (v1.3 frente a ActionGraft): 158 vs 160 s, 181 vs 189 s, 101 vs 102 s, 100 vs 99 s y 87 vs 92 s. El autor indica además que, en su prueba principal, el brazo con ActionGraft encadena seis golpes rápidos en mitad del combate donde v1.3 encadena dos. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del checkpoint base Singularity v1.3 int8, no del adaptador (155 MB en bf16).
- GPU recomendadas: no disponibles en la información proporcionada; el modelo base es un generador de vídeo MiniMax H3, que por su naturaleza requiere GPUs de gama alta (A100, H100 o similares), aunque el autor no lo especifica.
- ¿Cabe en GPU de consumo? No disponible. El adaptador en sí es pequeño, pero el modelo base determina el requisito real.
- Opciones de despliegue: ComfyUI (formato de claves nativo), con el nodo MiniMax H3 Master Extender; también se menciona el nodo HyperFlow. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un generador de vídeo.
- Latencia y throughput: los tiempos de trabajo reportados por el autor van de 87 a 189 s por clip de 15 s en su configuración (608x352 con refinado a 1280x720), sin penalización apreciable frente a v1.3.
- Advertencia de HyperFlow: el nodo HyperFlow de ComfyUI desactiva su ajuste de curva por checkpoint cuando hay cualquier LoRA cargado, por lo que este adaptador (o cualquier otro) solo actúa sobre el backbone. Para usarlo con HyperFlow hay que fusionarlo en el checkpoint y construir un ajuste de curva para el archivo fusionado.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / duración | Rendimiento en acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| H3-Singularity-ActionGraft v1 | LoRA (rango 16 + 2 bloques text-refiner) | Singularity v1.3 int8 | no disponible | +40-55 % de velocidad de píxeles frente a v1.3 | minimax-h3-community-license | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Singularity v1.3 | Checkpoint base comunitario | MiniMax H3 | no disponible | Referencia (28,4-39,7 px/frame en las pruebas del autor) | no disponible | Usado como base por este LoRA |
| Singularity v2 | Checkpoint comunitario | MiniMax H3 | no disponible | 43,2-51,6 px/frame en las pruebas del autor | no disponible | Referenciado como fuente del fine-tune de velocidad |
| Motion Repair V2 | Modelo de reparación de movimiento | MiniMax H3 | no disponible | Fuente de la pieza de impactos (2 de 52 bloques) | no disponible | Referenciado como fuente del componente de impacto |

No se dispone de datos sobre otros adaptadores comparables de la misma categoría (LoRA de acción para MiniMax H3), por lo que la comparativa se limita a los modelos que el propio autor usa como referencia.

## Limitaciones y advertencias

- No debe apilarse sobre Singularity v2 ni sobre merges que lo contengan: el fine-tune de velocidad se contaría dos veces y el resultado sería incorrecto.
- El refuerzo de impacto solo amplifica contactos que el prompt describe; no inventa impactos que el texto no menciona. Hay que escribir ambos extremos de cada contacto (el golpe y su efecto sobre el cuerpo del rival).
- Con HyperFlow, el LoRA solo actúa sobre el backbone salvo que se fusione en el checkpoint y se construya un ajuste de curva específico.
- Licencia `minimax-h3-community-license` (etiquetada como «other»): es necesario revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del adaptador; al ser un LoRA de vídeo, los riesgos de sesgo y contenido provienen del checkpoint base.
- El autor no publica benchmarks académicos estándar, solo métricas internas de movimiento; la validación es cualitativa y basada en sus propias pruebas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- La versión v2 (impactos más fuertes) está en desarrollo y aún no disponible.
- El adaptador está pensado para la receta concreta del autor (Pika H3 flex ref2va LoRA, 6 pasos, euler/simple, SLA 0.9, ActionLogic bridge V2, Sol VAE); otros flujos pueden dar resultados distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/indhic-ai/H3-Singularity-ActionGraft
- Modelo base (Singularity v1.3): https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Licencia MiniMax H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Vídeos de prueba (dentro del repositorio): https://huggingface.co/indhic-ai/H3-Singularity-ActionGraft/tree/main/videos
