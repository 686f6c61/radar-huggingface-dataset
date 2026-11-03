# djduecaster/dfreq-tug-cup-head-20261102

## Resumen

`djduecaster/dfreq-tug-cup-head-20261102` es una política neuronal sin estado (stateless) publicada en HuggingFace para el entorno de simulación Tug of War, un escenario de robótica de competición. El modelo lo desarrolla el usuario djduecaster y se distribuye como un adaptador de cabeza (head adapter) sobre una red troncal heredada del checkpoint `mjlab-tugofwar-microduck-t20` de Nico-robot, a través de una rama propia de feedback T19/T11. No se trata de un modelo de lenguaje: es un controlador de políticas para un robot cuadrúpedo simulado, empaquetado en formato ONNX y con la librería `microduck`.

La relevancia del artefacto es acotada y muy específica: documenta un candidato de cabeza neuronal que, según la model card, supera a una línea base amplificada en 1865 de 2304 combates simulados (frente a 1651 de la línea base), con una ganancia pareada de 9,288 puntos porcentuales y un intervalo de confianza del 95 % de [7,161; 11,372]. La entrada es un vector legal de 61 observaciones y la salida son 14 offsets de acción; de las diez salidas de patas, todas permanecen idénticas a las del modelo fuente, y solo se coordinan cuatro canales de cabeza.

El repositorio tiene 0 descargas y 0 likes, un tamaño declarado de 0,0 GB y no incluye pesos de lenguaje, tokenizador ni contexto textual. La licencia no está disponible de forma explícita: el autor indica que no reclama una licencia nueva de redistribución independiente y que los derechos upstream siguen aplicando, remitiendo a `LICENSE-NOTE.txt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal troncal heredada (microduck) con adaptador de cabeza neuronal; política sin estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 61 observaciones) |
| Tipos de cuantizacion | no disponible (empaquetado en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; sin licencia nueva de redistribución, derechos upstream aplicables (`LICENSE-NOTE.txt`) |
| Formato de pesos | ONNX |
| Dimension de entrada | 61 observaciones legales |
| Dimension de salida | 14 offsets de acción (4 canales de cabeza, 10 salidas de patas sin cambios) |
| Pipeline | robotics |
| Libreria | microduck |
| SHA256 del modelo | `44ae6a304ed5995123705d03594a09ce9df4e3e65386a5e6ed3e218eb018228b` |

## Arquitectura y entrenamiento

La arquitectura es una política neuronal para control robótico, no un transformer de lenguaje. El modelo conserva la red troncal y el normalizador del checkpoint heredado `mjlab-tugofwar-microduck-t20` (checkpoint500) de Nico-robot, a través de una rama de feedback T19/T11, y añade una adaptación legal de la cabeza neuronal. La política es stateless: no recibe semilla, reloj de puntuación, posición en el mundo, estado del oponente, crítico privilegiado ni lookup de trayectorias. La cabeza aprendida coordina cuatro canales de cabeza usando las características ocultas legales de la red heredada, mientras que las diez salidas de patas permanecen exactas respecto al modelo fuente para la misma observación. Las trayectorias de pata en bucle cerrado pueden cambiar por feedback físico.

El entrenamiento se realizó mediante búsqueda evolutiva nativa en CPU, no con aprendizaje en GPU ni con un profesor privilegiado. La validación local se hizo contra la línea base amplificada sobre 128 grupos independientes de cinco semillas, nueve estilos de controlador propios relacionados y ambos lados iniciales, manteniendo la física nativa original, BAM, la preparación y las reglas de combate de primeros dos / máximo cinco. Los empates se tratan de forma conservadora como derrotas para el controlador evaluado, y los resets no otorgan victoria a ningún lado bajo las reglas originales. El candidato congelado obtuvo 1865/2304 victorias frente a 1651/2304 de la línea base, con un veredicto de puerta predeclarada `True`; si la puerta hubiera fallado, el repositorio contendría el fallback amplificado preservado en lugar del candidato aprendido.

## Capacidades

- Control de política para robótica simulada en el entorno Tug of War.
- Coordinación de cuatro canales de cabeza mediante un adaptador neuronal entrenado.
- Conservación exacta de las diez salidas de patas del modelo fuente para la misma observación.
- Política sin estado: no usa semilla, reloj, posición, estado del oponente ni crítico privilegiado.
- Entrada estrictamente limitada al vector legal de 61 observaciones.
- Inferencia en formato ONNX mediante la librería microduck.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Evaluación de políticas de control en simulación: el modelo permite comparar un candidato de cabeza neuronal frente a una línea base amplificada en combates simulados con reglas fijas, usando el recuento de victorias sobre 2304 combates como métrica.
- Investigación en búsqueda evolutiva en CPU: sirve como artefacto reproducible de un pipeline de búsqueda evolutiva nativa sin GPU ni profesor privilegiado, con SHA256 y veredicto de puerta documentados.
- Estudio de adaptadores de cabeza sobre troncales congeladas: el paquete permite analizar cómo una modificación de solo cuatro canales de cabeza afecta al rendimiento global sin tocar las diez salidas de patas.
- Validación de políticas stateless: útil para comprobar que un controlador que solo recibe el vector legal de 61 observaciones puede competir en el entorno sin información privilegiada.
- Reproducción de experimentos de robótica simulada: el repositorio incluye `validation.json` con estilos, lados y compromisos de fiabilidad para replicar la comparación local.
- Integración en pipelines ONNX de simulación: el formato ONNX y la librería microduck permiten cargar la política en entornos de simulación compatibles para pruebas de bucle cerrado.
- Análisis de compromisos entre rating y copa: el modelo documenta explícitamente que es un candidato enfocado a copa y no un nuevo récord personal de rating, lo que permite estudiar la separación entre ambos objetivos.

## Benchmarks y rendimiento

| Metrica | Candidato de cabeza congelado | Linea base amplificada |
|---|---|---|
| Victorias en combates (de 2304) | 1865 | 1651 |
| Ganancia pareada | 9,288 puntos porcentuales | — |
| Intervalo de confianza del 95 % (bootstrap por grupos) | [7,161; 11,372] | — |
| Veredicto de puerta predeclarada | `True` | — |
| Rating local de cinco arranques (referencia original) | 145,676630 cm | — |
| Reproduccion local del especialista publicado | 153,943262 cm | — |
| Puntuacion publica historica del especialista | 160,1679945 cm | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje. La model card advierte que los oponentes son controladores propios relacionados y no el campo externo actual de la Arena, y que no se reclama evidencia de podio ni de primer puesto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio declara un tamaño de 0,0 GB y el entrenamiento se hizo en CPU, por lo que el artefacto es de muy pequeño tamaño.
- GPU recomendadas: no disponible; no se requiere GPU para el entrenamiento según la model card (búsqueda evolutiva nativa en CPU).
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX permite ejecución en CPU y potencialmente en GPU, pero no se documentan requisitos concretos.
- Opciones de despliegue: carga mediante la librería `microduck` y ejecución del modelo ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `djduecaster/dfreq-tug-cup-head-20261102` | Política robótica ONNX (microduck) | no disponible | no aplica (61 observaciones) | 1865/2304 victorias locales frente a línea base amplificada | no disponible | HuggingFace, 0 descargas |
| `mjlab-tugofwar-microduck-t20` (checkpoint500, Nico-robot) | Política robótica troncal heredada | no disponible | no aplica | no disponible | no disponible | Referenciado como upstream |
| Pollen Tug starter/reference (SHA256 `245869c0...`) | Política robótica de referencia | no disponible | no aplica | no disponible | no disponible | Referenciado como upstream |

No se dispone de datos de benchmarks comparables de las alternativas en la información proporcionada; la comparación se limita a la procedencia y al papel de cada artefacto en la cadena de derivación.

## Limitaciones y advertencias

- Modelo exclusivamente de simulación: no hay ninguna afirmación de seguridad para robots reales.
- Los resultados de validación corresponden a oponentes propios relacionados, no al campo externo actual de la Arena; no constituyen evidencia de podio ni de primer puesto.
- El modelo es un candidato enfocado a copa, no un nuevo récord personal de rating; la model card separa explícitamente ambos objetivos.
- Existe una discrepancia no resuelta entre la reproducción local del especialista publicado (153,943262 cm) y su puntuación pública histórica (160,1679945 cm).
- Los empates se tratan como derrotas para el controlador evaluado, lo que introduce un sesgo conservador en las métricas reportadas.
- No se reclama aceptación oficial ni rango público alguno.
- Licencia no disponible: no se afirma una licencia nueva de redistribución independiente y los derechos upstream siguen aplicando; es necesario consultar `LICENSE-NOTE.txt` antes de cualquier uso.
- El paquete excluye observaciones de entrenamiento, trazas en bruto, activos del simulador, investigación privada y credenciales, lo que limita la reproducibilidad completa del entrenamiento.
- No aplica riesgo de alucinación lingüística ni sesgos de idioma por no ser un modelo de lenguaje; no se documentan sesgos de comportamiento en la model card.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.

## Enlaces

- HuggingFace: https://huggingface.co/djduecaster/dfreq-tug-cup-head-20261102
- Model card (referencia): incluida en la página de HuggingFace del modelo
- `validation.json`: referenciado en la model card dentro del repositorio
- `LICENSE-NOTE.txt`: referenciado en la model card dentro del repositorio
- Upstream Nico-robot `mjlab-tugofwar-microduck-t20` (checkpoint500): referenciado en la model card, sin URL directa disponible
- Pollen Tug starter/reference (SHA256 `245869c02049f29f453d48619969b2ef51d73d9751813ddac2b979be6a3b2e44`): referenciado en la model card, sin URL directa disponible
