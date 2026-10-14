# juicenv/microduck-roller-es4

## Resumen

microduck-roller-es4 es una política de control motriz (policy) para el robot microduck de Pollen Robotics, publicada por el usuario juicenv. No se trata de un modelo de lenguaje ni de un modelo de visión-lenguaje: es un controlador neuronal que genera comandos de locomotion para un robot sobre ruedas (rollers), ejecutado en bucle cerrado a 50 Hz. Recibe un vector de observación de 61 dimensiones y produce 14 acciones de control de forma continua.

La política parte del modelo de referencia pollen-robotics/microduck-roller-sprint-2m-reference y se ha afinado mediante estrategias de evolución (evolution strategies, ES) sobre el denominado Arena roller scorer. Se distribuye como pesos ONNX (policy.onnx) con el normalizador de observaciones integrado en el propio grafo, de modo que el usuario debe alimentar observaciones en crudo. El manifiesto manifest.json sigue el esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada pero clara dentro de la robótica open source: ofrece un gait perpetuo (se ejecuta de forma indefinida hasta que se detiene) listo para cargarse en una ranura de política (policy slot) del robot mediante robotctl, sin necesidad de entorno de Python ni dependencias de entrenamiento en tiempo de inferencia. El repositorio no incluye licencia declarada, lo que limita su uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (arquitectura interna no especificada en la model card); salida exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye directamente como ONNX) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) + manifest.json (esquema 2) |
| Frecuencia de control | 50 Hz |
| Espacio de observacion | 61 dimensiones |
| Espacio de accion | 14 dimensiones |
| Metodo de entrenamiento | Evolution strategies (ES) sobre Arena roller scorer |
| Modelo base | pollen-robotics/microduck-roller-sprint-2m-reference (finetune) |
| Libreria | microduck |

## Arquitectura y entrenamiento

La model card no detalla la topología interna de la red (número de capas, tipo de capas o tamaño). Lo que sí se especifica es el contrato de interfaz: una política que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, y que se exporta a ONNX con el normalizador de observaciones embebido en el grafo. Esto implica que todo el preprocesado de la observación cruda queda resuelto dentro del propio modelo exportado, simplificando el despliegue en el robot.

El entrenamiento no se realizó por gradiente de política ni RLHF, sino mediante estrategias de evolución (ES) aplicadas como ajuste fino sobre la política de referencia de Pollen Robotics. El proceso se apoyó en el Arena roller scorer y está vinculado al repositorio pollen-robotics/microduck_rl (rama lean, commit 5a3636302). La política resultante es perpetua: no tiene condición de terminación propia y se ejecuta hasta que el operador la detiene. La model card no aporta el número de iteraciones, tamaño de población ni curva de recompensa.

## Capacidades

- Control de locomotion continuo de un robot microduck sobre rollers, con un gait perpetuo a 50 Hz.
- Generación de comandos motores de 14 dimensiones a partir de observaciones crudas de 61 dimensiones.
- Inferencia autocontenida en ONNX, con normalización de observaciones integrada en el grafo.
- Carga directa como política en el robot mediante `robotctl policy load <slot> juicenv/microduck-roller-es4`.
- Ejecución indefinida sin condición de parada interna (comportamiento "perpetual").
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento; son capacidades no aplicables a este tipo de modelo.

## Casos de uso

- Control de un robot microduck real sobre rollers en laboratorio: se carga la política en una ranura con `robotctl` y el robot ejecuta el gait de forma continua mientras recibe observaciones a 50 Hz.
- Investigación en locomotion con estrategias de evolución: sirve como punto de partida o comparación frente a políticas entrenadas con otros métodos, dado que deriva de una referencia conocida.
- Evaluación de pipelines de despliegue ONNX en robótica: al integrar el normalizador en el grafo, permite probar cadenas de inferencia ligeras sin preprocesado externo.
- Docencia y divulgación en robótica open source: el robot microduck y su ecosistema de políticas permiten demostrar aprendizaje por refuerzo y evolución en hardware asequible.
- Base para ajuste fino adicional: al ser un finetune de la referencia, puede usarse como inicialización para experimentos posteriores de ES o RL sobre el mismo scorer.
- Pruebas de robustez de un gait perpetuo: útil para medir estabilidad a largo plazo, deriva y consumo energético en ejecuciones prolongadas.
- Reproducción de experimentos con el repositorio `pollen-robotics/microduck_rl` (rama `lean`, commit `5a3636302`) para replicar el procedimiento de afinado por ES.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso del Arena roller scorer durante el entrenamiento, pero no incluye valores numéricos de recompensa, velocidad alcanzada, estabilidad ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la política está pensada para ejecutarse en el ordenador de a bordo del robot y no requiere GPU dedicada.
- Compatibilidad consumer: al ser una política ligera en formato ONNX y verificada en x86, se espera que quepa en hardware de consumo y en el propio controlador del robot, aunque no se aportan cifras.
- Opciones de despliegue: ONNX Runtime, integración nativa mediante `robotctl` en el ecosistema microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; únicamente se especifica que el bucle de control opera a 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-roller-es4 | Política de control (ES finetune) | no disponible | 61-D observacion, 14 acciones, 50 Hz | no disponible | HuggingFace (0 descargas) |
| pollen-robotics/microduck-roller-sprint-2m-reference | Política de control (referencia) | no disponible | No especificado en la informacion disponible | no disponible | HuggingFace |
| Otras rondas del mismo autor (p. ej. es1, es2, es3) | Política de control (ES finetune) | no disponible | No especificado en la informacion disponible | no disponible | No confirmada en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estas políticas.

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos, el uso comercial queda en una situación jurídica indeterminada; conviene contactar con el autor antes de integrarlo en producto.
- Idiomas y contexto no aplican: es una política de control, no un modelo generativo; no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Riesgo de deriva del gait: al ser una política perpetua sin condición de parada, ejecuciones prolongadas pueden derivar en comportamientos no deseados si el entorno físico cambia.
- Sin datos de rendimiento ni benchmarks: no hay evidencia publicada de estabilidad, velocidad o robustez del gait, más allá de la referencia a una verificación en x86.
- Dependencia de la interfaz: el manifiesto sigue el esquema 2, por lo que un cambio de esquema en el daemon de microduck podría romper la carga de la política.
- Cero descargas y cero likes: no hay retroalimentación de la comunidad que valide su funcionamiento en hardware real.
- Reproducibilidad parcial: solo se indica repo, rama y commit de entrenamiento, sin hiperparámetros ni semillas, lo que dificulta la réplica exacta.
- Ámbito estrecho: diseñada específicamente para el microduck sobre rollers; no es transferible directamente a otras morfologías sin reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-roller-es4
- Modelo base: https://huggingface.co/pollen-robotics/microduck-roller-sprint-2m-reference
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `lean`, commit `5a3636302`); URL no proporcionada en la informacion disponible.
