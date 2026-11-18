# JOKER141/MiniMax-H3-Combat-Base-V2

## Resumen

MiniMax-H3-Combat-Base-V2 es un LoRA de adaptación (no un modelo completo) creado por el usuario JOKER141 sobre el modelo base Comfy-Org/MiniMax-H3, orientado a la generación de vídeo con coreografía de combate, movimiento corporal y puesta en escena cinematográfica. El adaptador no genera el modelo subyacente: modifica el comportamiento del MiniMax-H3 para producir cadenas de acción físicamente coherentes, reacciones a impactos acumulativas y continuidad entre planos, además de mejorar el movimiento corporal y la dinámica de audio en escenas de diálogo.

La versión V2 amplía el alcance de la V1 (centrada solo en combate) hacia escenas mixtas de acción y diálogo, incorporando físicas de movimiento continuas, colisiones en tres fases con el entorno, trayectorias de caída multiphase y coreografía de tipo "uno contra muchos" con entradas escalonadas de atacantes. El repositorio ocupa 0,2 GB, lo que es consistente con un adaptador LoRA de pesos ligeros sobre un modelo de vídeo de gran tamaño.

Es relevante ahora porque aborda uno de los problemas clásicos de los modelos de vídeo generativo: la falta de continuidad física y la tendencia a bucles de "ataque y reinicio". El autor publica métricas internas de mejora en escenas de diálogo y recomienda configuraciones concretas de sampler y scheduler, lo que indica que el adaptador es sensible a la configuración de inferencia y requiere ajuste para rendir correctamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (el adaptador ocupa 0,2 GB en el repositorio) |
| Parámetros activos | no aplica (no es MoE, según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license |
| Formato de pesos | no disponible (repositorio de 0,2 GB, librería minimax-h3) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se aplican sobre las capas del modelo base Comfy-Org/MiniMax-H3. La model card no detalla el rango del adaptador, las capas objetivo ni el número de pasos de entrenamiento. El modelo base es un generador de vídeo de MiniMax (familia H3) con soporte de audio, a juzgar por las métricas de Audio RMS y la mención a dinámicas vocales en la evaluación del autor.

El entrenamiento se ha orientado explícitamente a la física del movimiento: el autor describe que V2 abandona los bucles de "ataque → reinicio" en favor de cadenas físicas continuas donde los golpes fallidos conservan el momento, los bloqueos cambian de dirección de forma suave y los miembros se separan limpiamente sin pegarse. También se modelan reacciones a impactos persistentes y acumulativas (flexión sostenida del torso, guardia baja, movilidad reducida) que construyen hacia finalizadores pesados creíbles. No se especifican el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos no están disponibles.

El autor incluye dos flujos de trabajo especializados de "director de combate" (general y uno contra muchos) con instrucciones en chino que admiten la generación de prompts en cualquier idioma de destino.

## Capacidades

- Generación de vídeo con coreografía de combate continuo: cadenas de acción sin reinicios, con momento conservado en golpes fallidos y transiciones suaves de bloqueo.
- Reacciones a impactos acumulativas y persistentes que afectan a la postura y la movilidad del personaje.
- Técnicas de combate específicas: patadas rotacionales continuas, agarres y derribos sostenidos, colisiones en tres fases con el entorno (cuerpo → entorno → material) y trayectorias de caída multiphase.
- Puesta en escena cinematográfica de tipo "uno contra muchos": entradas escalonadas de atacantes, control de carriles espaciales, seguimiento continuo centrado en el protagonista y continuidad de movimiento entre cortes.
- Mejora de escenas de diálogo: mayor movimiento corporal dentro del plano, respiración, actuación física y dinámica vocal.
- Sistema de disparadores (triggers) en tres niveles: sin trigger para máxima precisión anatómica, `prfight2` para mayor intensidad de ataque, y `prfight2, prfin1` para impacto pesado de especialista.
- Soporte de prompts en inglés y chino; los flujos de trabajo adjuntos permiten generar prompts finales en cualquier idioma.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no aplica a un adaptador de generación de vídeo.

## Casos de uso

- Previsualización de escenas de acción para cine y animación: el LoRA permite generar borradores de coreografías con continuidad física entre planos, útil para que directores de acción evalúen el ritmo de una secuencia antes del rodaje o la producción final.
- Generación de contenido para videojuegos: creación de animaciones de combate cuerpo a cuerpo con reacciones a impactos acumulativas, aprovechables como referencia para animadores o para prototipado de sistemas de combate.
- Escenas de diálogo con actuación física: las métricas internas del autor (+19,5 % de movimiento en plano, +34,2 % de Audio RMS, +22,4 % de nitidez de bordes) indican que el adaptador mejora el lenguaje corporal y la dinámica vocal en escenas no combatientes, útil para dramas o contenido narrativo breve.
- Secuencias de "uno contra muchos": el flujo de trabajo especializado permite generar escenas de acción con múltiples atacantes y seguimiento continuo del protagonista, adecuado para tráilers o cortometrajes de acción.
- Prototipado rápido de storyboards animados: con la estructura de prompt recomendada (ACCIÓN → DIÁLOGO) y los disparadores adecuados, se pueden iterar variantes de una misma escena ajustando intensidad y tipo de impacto.
- Contenido de marketing con acción: anuncios o piezas promocionales que requieran movimiento físico creíble y continuidad entre planos, donde la falta de fluidez del modelo base resultaría evidente.
- Investigación en generación de vídeo: el adaptador sirve como caso de estudio de cómo un LoRA puede inducir física de movimiento continua y reacciones acumulativas en un modelo de vídeo, útil para quienes investigan control fino de dinámicas físicas.

## Benchmarks y rendimiento

El autor publica únicamente métricas internas de comparación misma-semilla en escenas de diálogo, sin especificar la línea base exacta ni el conjunto de evaluación:

| Métrica (escenas de diálogo, misma semilla) | Variación |
|---|---|
| Movimiento dentro del plano | +19,5 % |
| Audio RMS | +34,2 % |
| Nitidez de bordes | +22,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un adaptador de generación de vídeo y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al ser un LoRA sobre MiniMax-H3, los requisitos vienen determinados por el modelo base, cuyas especificaciones no se detallan.
- GPU recomendadas: no disponible. Depende del modelo base MiniMax-H3.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el tamaño y la arquitectura del modelo base.
- Opciones de despliegue: la librería indicada es `minimax-h3`; el autor recomienda configuraciones específicas de sampler y scheduler (Opción A: `res_multistep` + `simple`; Opción B: `euler` + `beta`). Otras combinaciones pueden producir resultados notablemente más borrosos o suaves. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables de la misma familia ni sobre modelos de vídeo con funcionalidad equivalente en la documentación proporcionada. La comparación con el modelo base es la única referencia posible:

| Modelo | Tipo | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Combat-Base-V2 | LoRA sobre MiniMax-H3 | Combate, acción y diálogo con física continua | en, zh | minimax-h3-community-license | Hugging Face (24.217 descargas, 54 likes) |
| Comfy-Org/MiniMax-H3 | Modelo base | Generación de vídeo general | no disponible | no disponible | Hugging Face |
| Versión V1 del adaptador (referida por el autor) | LoRA sobre MiniMax-H3 | Solo combate, más rápido | en, zh | no disponible | no disponible en la información |

## Limitaciones y advertencias

- El propio autor advierte que no es un "LoRA mágico": no coreografía automáticamente una pelea completa. Con prompts simples como "two people fighting" el modelo tiende a producir movimientos rápidos y sin lógica. Es necesario especificar quién ataca primero, qué hace, dónde impacta, cómo reacciona el oponente y por qué encadena el siguiente ataque.
- Sensibilidad alta a la configuración de sampler y scheduler: combinaciones distintas de las recomendadas pueden degradar notablemente la nitidez y la definición del movimiento.
- En planos que combinan combate y diálogo, el ataque debe completarse antes de la línea de diálogo; de lo contrario, el movimiento puede revertir al comportamiento más lento del modelo base.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de texto factual, pero sí existe riesgo de artefactos visuales y físicas incoherentes si el prompt no está bien estructurado.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en otros idiomas no está verificado.
- Licencia: minimax-h3-community-license, con enlace al texto en el repositorio de MiniMaxAI. Es una licencia "other" que debe revisarse antes de cualquier uso comercial; las restricciones concretas no se detallan en la información disponible.
- El repositorio es pequeño (0,2 GB), coherente con un adaptador, pero no se especifican los requisitos del modelo base para producción.
- No se documentan garantías de calidad ni procesos de validación externos; las métricas publicadas son internas y del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Texto de la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
