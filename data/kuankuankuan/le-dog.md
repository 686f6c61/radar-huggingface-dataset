# KuanKuanKuan/le-dog

## Resumen

Le Dog es un conjunto de dos políticas neuronales entrenadas para controlar el comportamiento de lobos domesticados en Minecraft a través de la mod Fabric Le Dog (Minecraft 26.3). No es un modelo de lenguaje: son cerebros de agente que deciden acciones de un perro virtual a partir de observaciones simbólicas del estado del juego. Ambos modelos se ejecutan dentro del juego mediante ONNX Runtime y se distribuyen en formato ONNX.

El componente principal, `student.onnx` (Dog brain v3), es un set transformer de 1,18 millones de parámetros y 4,8 MB que selecciona un plan de 1 a 5 pasos (moverse, mirar, olfatear, sentarse, tumbarse, esperar, reverencia de juego, ladrar, seguir, huir) a partir de lo que el perro percibe y de su temperamento. Fue destilado de un profesor LLM (Claude Sonnet) que generó planes de comportamiento canino sobre observaciones simbólicas. El segundo componente, `rl_tricks.onnx`, es un MLP de 2x64 que elige una de 9 acciones cada 0,5 s para obedecer órdenes (`sit`, `come`, `jump`, `stay`), entrenado con PPO en Minecraft real.

El interés del proyecto es metodológico: muestra un pipeline de destilación LLM a política ligera ejecutable en CPU a ~1 ms por decisión, con evaluación pre-registrada de fidelidad al profesor, coherencia con el temperamento, funcionalidad y realismo frente a vídeo de perros reales (EgoPet). Es un caso práctico de imitación y destilación aplicada a agentes de juego, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Set transformer (`student.onnx`, Dog brain v3); MLP 2x64 (`rl_tricks.onnx`) |
| Parametros totales | 1,18 M (`student.onnx`); no disponible para `rl_tricks.onnx` |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada simbólica fija por decisión) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural en inferencia) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

`student.onnx` es un set transformer que procesa conjuntos de objetos visibles con rumbo, distancia y altura, el objeto observado, olores, sonidos y estado interno (energía, hambre, activación), junto con un temperamento (curioso, audaz, energético, social, juguetón). Se destiló de un profesor LLM (Claude Sonnet) que redactó planes de comportamiento sobre observaciones simbólicas de Minecraft; el dataset contiene unos 40,6k planes del profesor, incluyendo una ronda de DAgger sobre estados visitados por el propio estudiante. Las instrucciones del profesor incorporan presupuestos de tiempo de movimiento y giro medidos en perros reales (EgoPet), aunque ni imágenes ni features de EgoPet forman parte de los datos de entrenamiento de estos ficheros.

`rl_tricks.onnx` se entrenó con PPO en Minecraft real con 32 perros en paralelo. La recompensa son golosinas por éxito, con un currículo de distancia para `come` en lugar de reward shaping. Alcanza 98% en `come` desde hasta 40 bloques, 100% en `sit` y `jump`, y 98% en `stay`.

## Capacidades

- Selección de planes de comportamiento de 1 a 5 pasos entre 10 acciones (moverse, mirar, olfatear, sentarse, tumbarse, esperar, reverencia de juego, ladrar, seguir, huir).
- Percepción simbólica del entorno: objetos visibles con rumbo, distancia y altura, objeto observado, olores y sonidos.
- Modulación por estado interno (energía, hambre, activación) y temperamento (curioso, audaz, energético, social, juguetón).
- Obediencia de órdenes básicas de adiestramiento (`sit`, `come`, `jump`, `stay`) mediante `rl_tricks.onnx`.
- Inferencia en CPU dentro del juego vía ONNX Runtime, con ~1 ms por decisión en Java.
- No soporta tool calling, agentes multi-paso generales, visión, audio ni capacidades multilingües.

## Casos de uso

- Mods de Minecraft con fauna realista: integrar `student.onnx` en una mod Fabric para que los lobos domesticados muestren comportamientos plausibles (seguir, huir, olfatear, ladrar) modulados por temperamento, con inferencia en CPU a ~1 ms por decisión.
- Sistemas de adiestramiento in-game: usar `rl_tricks.onnx` para implementar órdenes de obediencia (`sit`, `come`, `jump`, `stay`) con tasas de éxito documentadas (98-100%) y un currículo de distancia que cubre hasta 40 bloques.
- Investigación en destilación LLM a políticas ligeras: reutilizar el pipeline (profesor LLM + DAgger + set transformer) para destilar comportamiento simbólico en agentes de juego de bajo coste computacional.
- Evaluación de realismo de comportamiento: emplear la metodología de comparación de estadísticas de comportamiento con vídeo de perros reales (EgoPet) como referencia para validar agentes animados.
- Prototipado de NPCs con temperamento: usar el condicionamiento por rasgos (audacia, energía, sociabilidad) para generar variación de comportamiento entre individuos sin reentrenar.
- Benchmark de inferencia ONNX en Java: servir como caso de referencia para medir latencia de modelos pequeños embebidos en aplicaciones de escritorio o juegos.

## Benchmarks y rendimiento

Evaluación pre-registrada "Gate E" de Dog brain v3 sobre dos conjuntos reservados de 16 arenas cada uno (semillas no usadas en entrenamiento):

| Criterio | Umbral | Semilla 10002 | Semilla 10003 |
|---|---|---|---|
| Fidelidad: acuerdo con el profesor frente a la auto-coincidencia del profesor | >= 0,8x | 0,905x | 0,804x |
| Temperamento: más audaz implica más aproximación/ladrido y menos huida; más energía implica más movimiento y menos estar sentado | 4 tests de signo p < 0,01 | todos p <= 2,4e-4 | todos p <= 3e-5 |
| Función: planes bloqueados / planes inválidos / muertes | <= 10% / 0 / 0 | 0,7% / 0 / 0 | 0,7% / 0 / 0 |
| Realismo: distancia de estadísticas de comportamiento a vídeo de perros reales (EgoPet), IC 95% | cota superior <= 0,872 | 0,644 [0,601; 0,716] | 0,607 [0,567; 0,653] |
| Velocidad | mediana < 5 ms | 1,09 ms | 1,07 ms |

Rendimiento de `rl_tricks.onnx`: 98% en `come` desde hasta 40 bloques, 100% en `sit` y `jump`, 98% en `stay`.

## Requisitos de hardware

- Inferencia en CPU: ~1 ms por decisión para `student.onnx` (Java, ONNX Runtime); latencia despreciable para `rl_tricks.onnx` (27 KB).
- VRAM: no requiere GPU; ambos modelos caben en memoria RAM convencional (4,8 MB y 27 KB respectivamente).
- GPU recomendadas: no aplica; el despliegue previsto es CPU dentro del cliente de Minecraft.
- Cabe en cualquier GPU de consumo, aunque no es necesario usarla.
- Opciones de despliegue: ONNX Runtime embebido en la mod Fabric; los ficheros se descargan y verifican mediante `/ledog update` con manifiestos firmados.
- Throughput: no documentado; la métrica publicada es la latencia mediana por decisión (1,07-1,09 ms).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de políticas neuronales para comportamiento animal en Minecraft con destilación desde un profesor LLM y evaluación pre-registrada.

## Limitaciones y advertencias

- Entrenado y evaluado solo en Minecraft, sobre observaciones simbólicas calculadas desde el estado del juego; no está pensado para robots reales.
- El crítico de realismo compara el giro de cabeza in-game con cámaras de perros reales mayoritariamente montadas en el lomo, lo que introduce un sesgo en la comparación.
- La fidelidad al profesor es el margen más ajustado: 0,804x en el segundo conjunto de test, por encima del umbral de 0,8x pero con poco margen.
- No procesa lenguaje natural ni observaciones visuales; no es un modelo de propósito general.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las dependencias de la mod y de ONNX Runtime.
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo es de planes inválidos o bloqueados, medido en 0,7% en la evaluación publicada.
- Los formatos de entrada y salida solo están documentados en el código fuente de la mod (`mod/src/main/java/ai/ledog/StudentSource.java` y `TrickBrain.java`), no en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KuanKuanKuan/le-dog
- Repositorio de la mod Le Dog: https://github.com/AcastaPaloma/le-dog
