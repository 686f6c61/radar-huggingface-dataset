# orcnd/table-protocol-pong-policy-onnx-v1

## Resumen

`orcnd/table-protocol-pong-policy-onnx-v1` es una política neuronal compacta para jugar a Pong dentro del entorno Table Protocol. La desarrolla el usuario orcnd y se publica como un modelo ONNX pensado para inferencia en navegador mediante ONNX Runtime Web (proveedor de ejecución WebAssembly CPU). No es un modelo de lenguaje ni un agente general: es un clasificador/regresor feed-forward que, a partir de una observación normalizada de 32 valores del estado de la partida, propone un carril de retorno, objetivos de pala y hasta tres habilidades del juego.

Técnicamente es un perceptrón multicapa de tres capas ocultas (32 → 128 → 128 → 64 → 25) entrenado por imitación supervisada de una política heurística escrita a mano (`rapidPongDecision`). Se generaron 20.000 ejemplos estado/acción con semilla 417 y partición 90/10 entrenamiento/validación. No hay aprendizaje por refuerzo, ni datos de juego humano, ni entrenamiento cruzado entre juegos. Su relevancia es acotada: sirve como ejemplo reproducible de política pequeña exportada a ONNX, útil para experimentos de destilación, inferencia en navegador y evaluación de agentes en entornos de juego concretos.

El modelo no está pensado para uso general y no es compatible con otros juegos sin un adaptador de observación/acción y datos de entrenamiento adecuados. Su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) feed-forward de 3 capas ocultas: 32 → 128 → 128 → 64 → 25 |
| Parametros totales | no disponible (no se indica el recuento en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 32 valores; no es un modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye un único archivo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`pong-policy-v1.onnx`), ejecutable con onnxruntime / onnxruntime-web |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas ocultas con dimensiones 128, 128 y 64, y una capa de salida de 25 unidades. La entrada es un tensor `features` de tipo `float32[1, 32]` que codifica el estado de la partida: lado del jugador, posición y velocidad de la bola, estado de boost, profundidad y posición de la pala propia y de la rival, objetivos normalizados, tiempos de recarga de habilidades, estado de la onda, marcador, indicador de bola entrante y predicción del siguiente contacto. Cada campo tiene una normalización explícita (por ejemplo, velocidades divididas por 1200 px/s o 700 px/s, tiempos por 45 s, 10 s, 5 s, 30 s o 3 s según el campo).

El entrenamiento es puramente supervisado por imitación de la política heurística `rapidPongDecision`. Se generaron 20.000 pares estado/acción con semilla 417 y se dividieron de forma aleatoria y mezclada en 90 % entrenamiento y 10 % validación (2.000 ejemplos). No se usó aprendizaje por refuerzo, ni datos de partidas humanas, ni autojuego, ni entrenamiento multi-juego. La model card indica explícitamente que no se ha demostrado que el modelo supere en tasa de victorias a su profesor heurístico. No se documentan innovaciones como decodificación especulativa, atención lineal ni mecanismos híbridos; es una política puramente feed-forward de baja latencia.

## Capacidades

- Predicción de carril de retorno entre 20 clases (`lane_01` a `lane_20`) mediante logits; se selecciona el de mayor valor.
- Regresión de dos salidas continuas: profundidad horizontal y objetivo vertical de la pala, ambas en el rango [0, 1].
- Predicción de tres habilidades del juego (slow, boost, block) mediante logits con umbral en cero.
- Inferencia en navegador mediante ONNX Runtime Web con proveedor WebAssembly CPU.
- Entrada de tamaño fijo (32 valores) y salida de tamaño fijo (25 valores), lo que permite despliegue determinista y de baja latencia.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües.
- No es un agente general: solo funciona con el entorno Table Protocol Pong y con el mismo contrato de observación, escalado y orden de carriles.

## Casos de uso

- **Prototipado de agentes en navegador**: cargar `pong-policy-v1.onnx` con `onnxruntime-web` y el `inference-example.js` incluido permite tener un agente funcional en el cliente sin backend, usando WebAssembly CPU. Es adecuado por el tamaño reducido del modelo y la ausencia de dependencias pesadas.
- **Destilación de políticas heurísticas**: el modelo sirve como ejemplo de cómo destilar una función de decisión escrita a mano (`rapidPongDecision`) en una red pequeña. Se usaría para comparar fidelidad de imitación (52,8 % de acierto de carril, 94,2 % de acierto de habilidad) frente a la política original.
- **Evaluación de pipelines de exportación ONNX**: útil como caso de prueba reproducible para validar conversiones, fijación de revisiones y ejecución con ONNX Runtime Web en integración continua.
- **Experimentos de imitación supervisada**: con 20.000 ejemplos y semilla fija, es un banco de pruebas controlado para estudiar el efecto del tamaño de dataset, el ruido en las etiquetas del profesor o el desbalanceo entre clases de carril.
- **Desarrollo de entornos de juego**: sirve como política de referencia para probar el motor de Table Protocol Pong, validar el contrato de entrada/salida y comprobar que las reglas de colisión, límites y recargas de habilidad se aplican correctamente tras la propuesta del modelo.
- **Educación y demostraciones**: por su tamaño y su contrato explícito de 32 entradas y 25 salidas, es adecuado para explicar cómo se diseña una política de juego, cómo se normalizan las observaciones y cómo se interpreta una salida con logits y regresiones mezcladas.

## Benchmarks y rendimiento

Resultados de validación publicados en `training-metrics.json` (2.000 ejemplos, partición aleatoria 90/10):

| Metrica | Resultado |
|---|---:|
| Acierto de carril (lane accuracy) | 52,8 % |
| Error absoluto medio de las dos salidas de movimiento | 0,085 (unidades normalizadas) |
| Acierto de habilidad (ability accuracy) | 94,2 % |
| Ejemplos de validación | 2.000 |

No se han publicado resultados de tasa de victorias, rendimiento frente a humanos ni generalización a otros juegos. Las métricas anteriores miden acuerdo con el profesor heurístico, no éxito de juego.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de la arquitectura (32 → 128 → 128 → 64 → 25) el modelo es del orden de decenas de miles de parámetros, por lo que cabe holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el proveedor documentado es WebAssembly CPU, por lo que no requiere GPU.
- Cabe en GPU consumer: sí, con margen amplio, aunque el caso de uso documentado es CPU en navegador.
- Opciones de despliegue: ONNX Runtime Web (WebAssembly CPU) según la model card; también sería desplegable con ONNX Runtime nativo, aunque no se documenta explícitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otras políticas de Pong ni con modelos de la misma categoría, y no se dispone de datos de referencia sobre alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Imita una política heurística determinista escrita a mano; no razona ni planifica de forma autónoma.
- Las métricas de acierto de carril y de habilidad miden acuerdo con el profesor, no éxito en partidas; no hay evidencia de mejora en tasa de victorias.
- No se usaron datos de juego humano, autojuego con refuerzo ni entrenamiento multi-juego.
- El comportamiento de habilidades, la física del juego, el escalado de características y el orden de carriles deben coincidir exactamente con el juego de origen.
- Para juegos sustancialmente distintos se necesita una política nueva y un proceso de entrenamiento y evaluación propio.
- La salida es una propuesta cruda: el juego debe seguir aplicando límites de movimiento alcanzable, fronteras legales, recargas de habilidad y reglas de colisión.
- En producción se recomienda fijar una revisión concreta del repositorio en lugar de usar la rama `main` mutable, tal como advierte la propia model card.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso; no se documentan restricciones adicionales.
- Riesgo de alucinación: no aplica en el sentido de lenguaje natural, pero sí existe riesgo de propuestas de acción fuera de rango si no se respeta el contrato de entrada o si el juego cambia sus escalados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcnd/table-protocol-pong-policy-onnx-v1
- Archivo de inferencia: `pong-policy-v1.onnx` (incluido en el repositorio)
- Métricas de entrenamiento: `training-metrics.json` (incluido en el repositorio)
- Ejemplo de inferencia en navegador: `inference-example.js` (incluido en el repositorio)
- ONNX Runtime Web: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
