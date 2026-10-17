# jrubiosainz/microduck-game-roller-remix

## Resumen

microduck-game-roller-remix es una política de control para el robot cuadrúpedo MicroDuck, publicada por el usuario jrubiosainz como entrada para la prueba de 2 m Roller Sprint de la Microduck Arena. No es un modelo de lenguaje ni un modelo de propósito general: es una red neuronal pequeña en formato ONNX que mapea una observación de 61 valores a 14 acciones de control, y que se usa exclusivamente dentro del simulador de la Arena. Su relevancia es acotada pero concreta: muestra cómo una variante obtenida mediante una perturbación mínima de los pesos de una política ya existente puede rascar unas centésimas de segundo en una tarea de locomoción simulada.

El modelo deriva de juicenv/microduck-roller-es21, una política entrenada con estrategias de evolución (ES) y escalada de colina elitista sobre el marcador de la Arena. La modificación introducida por este remix es puramente numérica: se añadió ruido gaussiano con desviación típica σ = 3·10⁻⁵ una única vez a cada peso y sesgo de las cuatro capas `Gemm` de la red (197.774 valores en total), redondeando de nuevo a float32. El grafo, los operadores, el normalizador de entrada, los metadatos ONNX y el manejo de comandos son idénticos a los del modelo fuente.

El resultado declarado es un tiempo de 0,944 s en las cinco semillas oficiales del evento, frente a los 0,948 s de la política original (una mejora de 0,004 s, exactamente un paso de control). Se trata de un ajuste in-sample: la búsqueda puntuó sus candidatos sobre esas mismas semillas. El propio autor advierte de que el modelo está entrenado y evaluado solo en simulación y de que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con cuatro capas `Gemm` en ONNX (`mlp.0`, `mlp.2`, `mlp.4`, `mlp.6`), más normalizador de entrada |
| Parametros totales | 197.774 valores (suma de pesos y sesgos de las cuatro capas `Gemm`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija `obs` de forma [1, 61] |
| Tipos de cuantizacion | no disponible; pesos en float32 dentro del ONNX |
| Idiomas soportados | no aplica (política de control robótico, sin capacidades de lenguaje) |
| Licencia | no declarada (el repositorio fuente tampoco declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`, 793.832 bytes, sha256 `77438dee8c26a965d8992b2475f87e7c67344016810dbef08c40b9dacd0308ee`); `manifest.json` de Pollen (schema 2) |
| Dimension de salida | `actions` [1, 14] |
| Velocidad de consigna | 0,7 m/s en avance |
| Version base | juicenv/microduck-roller-es21, revision `2b4d5776` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |

## Arquitectura y entrenamiento

La red es un MLP de cuatro capas `Gemm` que recibe una observación de 61 dimensiones y produce 14 acciones. Los ocho tensores afectados por el remix son `mlp.0.weight`, `mlp.0.bias`, `mlp.2.weight`, `mlp.2.bias`, `mlp.4.weight`, `mlp.4.bias`, `mlp.6.weight` y `mlp.6.bias`. El modelo fuente fue entrenado con estrategia de evolución y escalada de colina elitista sobre el marcador de la Arena, según se describe en su manifiesto; el código de entrenamiento citado es pollen-robotics/microduck_rl en el commit `3c0598cae`, rama `hannes-ft`.

El proceso de creación de este remix no incluye entrenamiento en sentido estricto. Se parte de los pesos del modelo fuente, se sortean copias con niveles de ruido entre 3·10⁻⁶ y 3·10⁻⁴ (ruido extraído en float64 con `default_rng([201, 1027])`, en la tirada 1.027 de un sorteo con semilla 201), se añade ese ruido una sola vez a cada peso y sesgo, se redondea a float32 y se reconstruye el fichero ONNX. Cada copia se evaluó en las cinco semillas oficiales dentro del ejecutor de la Arena (MuJoCo 3.10.0, CPU x86-64); las copias se descartaban en cuanto dejaban de superar al modelo fuente y solo se conservaba una si terminaba las cinco semillas con un tiempo de marcador inferior. La copia publicada es la que resultó seleccionada, con σ = 3·10⁻⁵. No hay RLHF, DPO ni ajuste por preferencias: no aplica a este tipo de modelo.

## Capacidades

- Control de locomoción simulado: genera las 14 acciones de control del MicroDuck para avanzar en línea recta a 0,7 m/s.
- Marcha perpetua con comando constante, definida en el manifiesto de política de Pollen (schema 2).
- Ejecución autocontenida en ONNX: infiere con un único fichero de 793.832 bytes, sin dependencias de librerías de aprendizaje profundo pesadas.
- Mantiene el mismo manejo de comandos y el mismo normalizador de entrada que la política fuente.
- Rendimiento declarado de 0,944 s (media) en las cinco semillas oficiales del sprint de 2 m sobre patines.
- No dispone de tool calling, ni de capacidades de agente, ni de razonamiento multi-paso, ni de capacidades multilingües, ni de visión, audio o modo de pensamiento.
- No está pensado ni validado para control de hardware real.

## Casos de uso

- Evaluación comparativa de políticas en la Microduck Arena: sirve como entrada de referencia para medir si variantes con perturbaciones mínimas de pesos mejoran la marca del modelo fuente en las semillas oficiales.
- Estudio de sensibilidad al ruido en redes de control: permite analizar cómo una perturbación de σ = 3·10⁻⁵ aplicada a 197.774 parámetros altera el tiempo de una tarea de locomoción concreta.
- Reproducción de experimentos de búsqueda elitista: el autor documenta la receta completa (semilla, tirada, rango de escalas de ruido), de modo que el fichero reconstruido desde el modelo fuente con esa receta es idéntico al publicado.
- Docencia e investigación en robótica simulada: un caso de estudio pequeño y verificable sobre optimización de políticas sin reentrenamiento.
- Pruebas de integración de ejecutores MuJoCo: validar que un runner con MuJoCo 3.10.0 sobre CPU x86-64 carga y ejecuta el ONNX con las formas [1, 61] y [1, 14] esperadas.
- Referencia de línea base en competiciones internas: dado su tiempo de 0,944 s y su licencia no declarada, puede usarse como umbral de comparación en pruebas privadas, no como componente de producto.
- No es adecuado para despliegue en robótica física, atención al cliente, generación de código ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los tiempos de carrera en las cinco semillas oficiales del evento, medidos a 0,7 m/s de velocidad de consigna. Son valores in-sample: la búsqueda puntuó sus candidatos sobre esas mismas semillas. Los tiempos se expresan en pasos de control completos (0,02 s), por lo que la marca se mueve en incrementos de 0,004 s.

| Semilla | microduck-roller-es21 | Este remix |
|---|---|---|
| 1 | 0,96 | 0,96 |
| 2 | 0,94 | 0,94 |
| 3 | 0,94 | 0,94 |
| 4 | 0,96 | 0,94 |
| 5 | 0,94 | 0,94 |
| Marcador (media) | 0,948 | 0,944 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, y no serían aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB. El fichero de pesos ocupa 793.832 bytes y la red tiene 197.774 parámetros en float32, por lo que cabe en memoria de cualquier sistema, incluidos microcontroladores con suficiente RAM.
- GPU: no se requiere ninguna. El modelo se evaluó en CPU x86-64. Funcionaría igualmente en A100, H100 o RTX 4090, pero no aprovecharía su capacidad de cómputo.
- Cabe en cualquier GPU de consumo, y también en CPU sin aceleración, dado el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime como vía natural; el ejecutor de la Microduck Arena (MuJoCo 3.10.0, CPU x86-64) como entorno validado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma desagregada. El tiempo declarado (0,944 s de media) corresponde a la carrera completa del sprint de 2 m en simulación, no a la latencia por inferencia. El autor advierte de que semillas cercanas o una CPU distinta pueden dar tiempos diferentes.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Tiempo de marcador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-roller-remix | 197.774 (red fuente, pesos perturbados) | [1, 61] / [1, 14] | 0,944 s | no declarada | HuggingFace |
| juicenv/microduck-roller-es21 | 197.774 (misma red) | [1, 61] / [1, 14] | 0,948 s | no declarada | HuggingFace |
| namenu/microduck-arena (strata-roller-pb4) | no disponible | no disponible | 0,960 s | no disponible | HuggingFace |

Los tres modelos pertenecen a la misma categoría (políticas de control para el Roller Sprint de 2 m de la Microduck Arena) y comparten el mismo ejecutor de evaluación, por lo que la comparación de tiempos es directa. El remix y su fuente comparten exactamente el mismo grafo y el mismo número de parámetros; la única diferencia son los valores numéricos de los pesos. No se dispone de datos de parámetros ni de licencia de la entrada de namenu.

## Limitaciones y advertencias

- No apto para hardware real: el autor indica explícitamente que no debe cargarse en un MicroDuck físico. Se entrenó y se evaluó solo en el simulador de la Arena, sobre sus cinco semillas oficiales.
- Sobreajuste in-sample: la búsqueda puntuó a sus candidatos sobre las mismas cinco semillas que luego se usan como resultado, por lo que las 0,004 s de mejora no deben interpretarse como capacidad de generalización.
- Sensibilidad al entorno: los tiempos dependen del paso de control (0,02 s) y de la CPU. Semillas cercanas o un procesador distinto pueden arrojar otros valores.
- Licencia no declarada: ni este repositorio ni el modelo fuente declaran licencia. Esto impide determinar si el uso comercial es posible; en la práctica, no hay autorización explícita de uso.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto. El riesgo equivalente es un fallo de control con acciones fuera del rango previsto, mitigado por el normalizador y el comando constante del manifiesto.
- Sesgos conocidos: no disponibles. No hay evaluación de sesgos y no tendría sentido en el marco de una política de locomoción.
- Limitaciones de contexto e idioma: no aplica. La entrada es fija ([1, 61]) y no hay procesamiento de lenguaje.
- En producción: el modelo no incluye mecanismos de seguridad, parada de emergencia ni detección de fallos. Cualquier uso fuera del ejecutor de la Arena requeriría validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-roller-remix
- Modelo base: https://huggingface.co/juicenv/microduck-roller-es21
- Perfil del autor del modelo base: https://huggingface.co/juicenv
- Entrada de namenu en la Arena: https://huggingface.co/namenu/microduck-arena
- Perfil de namenu: https://huggingface.co/namenu
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Código de entrenamiento: https://github.com/pollen-robotics/microduck_rl (commit `3c0598cae`, rama `hannes-ft`)
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a información financiera de una empresa no relacionada.
