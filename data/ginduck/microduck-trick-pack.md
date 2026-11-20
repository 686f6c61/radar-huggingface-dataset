# GinDuck/microduck-trick-pack

## Resumen

Microduck Trick Pack es una política de control robótico distribuida como modelo ONNX dentro del ecosistema Microduck, un robot cuadrúpedo tipo pato de pequeño tamaño. El modelo lo publica el usuario GinDuck y resuelve un problema muy concreto: encadenar cinco acrobacias (sentarse con las patas levantadas, voltereta completa hacia delante, patada izquierda, patada derecha y reverencia profunda) a partir de pulsos cortos de comando, volviendo siempre a la posición erguida al terminar cada truco.

No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de una política de comportamiento (policy) entrenada por destilación para un robot específico. El repositorio ocupa 0,0 GB y el único artefacto de pesos es `policy.onnx`, con una interfaz de 61 entradas y 14 salidas, lo que refleja un modelo extremadamente compacto orientado a inferencia en tiempo real sobre hardware embebido.

Su relevancia es acotada pero clara para quien trabaja con robótica de bajo coste: demuestra un flujo completo de destilación de políticas expertas (DAgger sobre políticas Apache-2.0 de Pollen Robotics) hacia un único controlador que orquesta varios comportamientos y una rutina de recuperación (levantarse) en un solo archivo ONNX. La limitación principal es que solo se ha validado en simulación y todavía no existe mapeo de botones en el daemon del robot real para disparar los comandos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control robótico exportada a ONNX (detalles internos de la red no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye directamente como `policy.onnx`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

Especificaciones adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Interfaz de entrada | 61 valores (observaciones del robot y comandos) |
| Interfaz de salida | 14 valores (acciones de control) |
| Tamaño del repositorio | 0,0 GB |
| Librería declarada | microduck |
| Pipeline | robotics |
| Validaciones superadas | `check_onnx`, `smoke_run_onnx` |
| Archivos incluidos | `policy.onnx`, `manifest.json`, `media/preview.mp4` |

## Arquitectura y entrenamiento

La información pública no detalla la topología interna de la red (número de capas, tipo de capas o función de activación); solo se conoce su envoltorio ONNX con 61 entradas y 14 salidas. Lo que sí está documentado es el proceso de entrenamiento: se parte de la política "GinDuck's Got a Talent" (run-1031-1415, checkpoint 2750) y se le enseñan los trucos mediante destilación con DAgger en 6 rondas y 1,48 millones de muestras, usando la física del escenario de Microduck Arena.

Los expertos utilizados combinan una política propia de "plumps" (búsqueda propia) con políticas Apache-2.0 de Pollen Robotics publicadas en `pollen-robotics/microduck-policies`: `roulade`, `ball_kick_left`, `ball_kick_right`, `alpha_ground_pick`, más `alpha_stand` como política de recuperación para volver a levantarse. La innovación técnica destacable no está en la arquitectura sino en la composición: un único controlador condicionado por pulsos de comando de 0,3 s que selecciona y ejecuta cada truco y siempre termina en una fase de reincorporación.

## Capacidades

- Ejecución de cinco acrobacias discretas: plumps (sentarse con ambas patas arriba), voltereta completa hacia delante, patada izquierda, patada derecha y reverencia profunda.
- Activación mediante pulsos cortos de comando: `twist[1] = 1` para plumps, `twist[2] = 1` para la voltereta, `body[0] = +1 / -1` para patadas y `body[1] = 1` para la reverencia.
- Recuperación automática a la posición erguida tras cada truco mediante la política `alpha_stand`.
- Encadenamiento de los cinco trucos en una secuencia de 20 s (el vídeo de previsualización muestra cues en los segundos 2, 5, 9, 12 y 15).
- Inferencia vía ONNX, validada con `check_onnx` y `smoke_run_onnx`.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento.

## Casos de uso

- Demostraciones y exhibiciones robóticas: la secuencia de 20 s con los cinco trucos encadenados sirve como rutina de showcase para ferias, aulas o vídeos de producto, ya que el modelo gestiona por sí mismo la transición entre trucos y la reincorporación.
- Investigación en destilación de políticas: el repositorio documenta el pipeline completo (política base, expertos, DAgger con 6 rondas y 1,48 M de muestras), lo que permite replicar el método sobre otros comportamientos o robots similares.
- Pruebas de integración de controladores ONNX en robótica embebida: al ser un único archivo con 61 entradas y 14 salidas, es un banco de pruebas útil para validar el runtime ONNX y la latencia de inferencia en el hardware del Microduck.
- Desarrollo de clientes de control: dado que el daemon del robot no tiene mapeo de botones para estos comandos, el modelo sirve para construir y probar un cliente que envíe los pulsos `twist` y `body` por la API del robot.
- Benchmarking de física en simulación: los resultados declarados (pata a 5,8 cm en plumps, 360° con patas a 25 cm y 55 cm de avance en la voltereta, patas a 8,2/8,3 cm en patadas, unos 30° en la reverencia) permiten comparar la fidelidad del simulador frente al robot real cuando se haga la transferencia.
- Educación y divulgación: como ejemplo didáctico de composición de comportamientos y recuperación ante fallos en robótica cuadrúpeda de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos son las métricas de simulación por truco:

| Truco | Comando (pulso de 0,3 s) | Resultado en simulación |
|---|---|---|
| Plumps | `twist[1] = 1` | pata 5,8 cm arriba, se levanta de nuevo |
| Voltereta hacia delante | `twist[2] = 1` | 360° completos, patas 25 cm arriba, 55 cm de avance, se levanta de nuevo |
| Patada izquierda | `body[0] = +1` | pata 8,2 cm arriba |
| Patada derecha | `body[0] = -1` | pata 8,3 cm arriba |
| Reverencia profunda | `body[1] = 1` | unos 30°, vuelve a erguirse |

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el modelo es un ONNX de 61 entradas y 14 salidas, por lo que se espera un consumo de memoria mínimo, aunque no se publica cifra concreta.
- GPU recomendadas: no disponibles; por el tamaño del artefacto, la inferencia en CPU sobre el propio robot o en un equipo de desarrollo debería ser viable, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: runtime ONNX estándar (ONNX Runtime u otro compatible), integrado con la librería `microduck` y el daemon del robot; se requiere un cliente que envíe los pulsos de comando.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas/salidas | Licencia | Validación | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-trick-pack | Política de trucos compuesta (ONNX) | 61 → 14 | Apache-2.0 | Solo simulación | Hugging Face |
| pollen-robotics/microduck-policies | Colección de políticas expertas (`roulade`, `ball_kick_left`, `ball_kick_right`, `alpha_ground_pick`, `alpha_stand`) | no disponible | Apache-2.0 | no disponible | Hugging Face |
| GinDuck "Got a Talent" (run-1031-1415, checkpoint 2750) | Política base usada para destilación | no disponible | no disponible | no disponible | no disponible como modelo independiente en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estas alternativas; la comparación se limita a procedencia, licencia y estado de validación.

## Limitaciones y advertencias

- Solo probado en simulación: el autor indica explícitamente que no se ha ejecutado en un Microduck real.
- Sin mapeo en el daemon: el daemon del robot no tiene botones asignados a estos comandos, por lo que en hardware real hace falta un cliente que envíe los pulsos.
- Sin datos de sesgos, alucinación o multilingüismo: al no ser un modelo de lenguaje, estas categorías no aplican, pero tampoco hay evaluación de robustez ante perturbaciones físicas, terreno irregular o fallos de sensores.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; el modelo incorpora conocimiento derivado de políticas de Pollen Robotics también Apache-2.0, cuyo reconocimiento debe mantenerse.
- Dependencia de la física del simulador: los resultados (distancias, ángulos y alturas) están medidos en el escenario de Microduck Arena y podrían no transferirse al robot real (sim-to-real gap).
- Repositorio sin descargas ni likes en el momento de la consulta y con documentación mínima: no hay métricas de fiabilidad más allá de las validaciones `check_onnx` y `smoke_run_onnx`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-trick-pack
- Políticas de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-policies
- QuackPack (Microduck Arena en iPhone e iPad): https://www.imundo.ch/quackpack/
