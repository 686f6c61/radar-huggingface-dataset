# HlibPlakhtii/microduck-tug-quicksilver-v14

## Resumen

microduck-tug-quicksilver-v14 es un modelo de política para robótica publicado en Hugging Face por HlibPlakhtii bajo la librería `microduck`, distribuido en formato ONNX y etiquetado como `microduck-policy`. Se trata de un *remix* de competición sobre el modelo base `jrubiosainz/microduck-tug-lphat-c2-s1s5`, un derivado del entorno de simulación de tira y afloja (tug-of-war) del ecosistema MicroDuck, vinculado a Pollen Robotics. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que produce secuencias de acciones motoras para un robot simulado en MuJoCo.

El modelo conserva íntegramente el grafo y la red heredados del modelo base y añade una tabla de búsqueda de observaciones (*observation lookup*) que reproduce una secuencia de acciones optimizada localmente para la semilla oficial 2 de la Arena. La búsqueda se realizó con CMA-ES separable y la secuencia resultante obtuvo una puntuación local de 166,57612562 cm con cinco victorias en el pozo, evaluada con el evaluador no modificado de la Arena, el runner 5, MuJoCo 3.10.0 y ONNX Runtime 1.24.4.

Su relevancia es acotada y muy específica: sirve como artefacto reproducible de una competición de simulación concreta, no como controlador de locomoción general ni como política para robot real. El propio autor advierte que la optimización es *in-sample* sobre las posiciones de salida declaradas y que la reproducción exacta es sensible a la aritmética de coma flotante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo heredado del modelo base, inferencia vía ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación de 48 valores comparados en el lookup) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible en la información proporcionada; la model card indica que se retienen el LICENSE y NOTICE del modelo base |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del grafo heredado: la model card no describe capas, número de parámetros ni tipo de red (transformer, MLP, CNN u otra). Lo que sí se documenta es que el modelo es un *finetune* del modelo base `jrubiosainz/microduck-tug-lphat-c2-s1s5`, que a su vez combina `lphatnguyen/microduck-tug-of-war-v0` con las trayectorias de las semillas 1 y 5 de C2 de jrubiosainz. El grafo completo y la red *head-to-head* se preservan sin modificaciones.

La innovación técnica de esta versión no está en el entrenamiento de la red (el autor declara explícitamente que no entrenó la red heredada), sino en una capa de búsqueda sobre las observaciones. Se añade un *observation lookup* que compara los primeros 48 valores de observación con tolerancia de 1e-7; si coinciden, se reproduce la secuencia de acciones optimizada localmente para la semilla 2; si no, se delega en el grafo original. La secuencia se optimizó con CMA-ES separable tras reducir objetivos articulares redundantes y saturados, verificando que las fuerzas motoras, ambas trayectorias del robot y la trayectoria de la cuerda permanecían idénticas. El resto de posiciones de salida conservan sus trayectorias heredadas.

## Capacidades

- Generación de acciones motoras para un robot simulado en el entorno de tira y afloja de MicroDuck.
- Reproducción determinista (sujeta a coma flotante) de una secuencia de acciones optimizada para la semilla oficial 2.
- Ejecución de inferencia vía ONNX Runtime.
- Reutilización del grafo heredado para observaciones no coincidentes con el lookup.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Reproducción de resultados de competición: permite replicar la puntuación local de 166,57612562 cm en la semilla 2 usando el evaluador oficial de la Arena, MuJoCo 3.10.0 y ONNX Runtime 1.24.4, siempre que el entorno de coma flotante sea equivalente.
- Investigación en optimización de políticas: la inclusión de la configuración de búsqueda, la secuencia de acciones, el código fuente y los informes de verificación individuales permite estudiar cómo CMA-ES separable mejora una política heredada sin reentrenar la red.
- Auditoría de procedencia de modelos: el repositorio incluye BASE_MODEL_CARD.md con la procedencia fijada del modelo base, útil para trazabilidad en linajes de modelos derivados.
- Docencia sobre evaluación en simulación: sirve como ejemplo de separación entre red aprendida y capa de búsqueda, y de los riesgos de optimización *in-sample*.
- Pruebas de integración de ONNX Runtime en pipelines de robótica simulada: el artefacto ONNX puede cargarse en un runner compatible para validar la cadena de inferencia.
- Comparación de estrategias de reducción de objetivos articulares: los informes de verificación incluidos documentan la reducción de objetivos saturados manteniendo fuerzas motoras idénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es la puntuación local declarada por el autor:

| Métrica | Valor |
|---|---|
| Puntuación local en cinco asaltos (semilla 2) | 166,57612562 cm |
| Victorias en el pozo | 5 |
| Evaluador | Arena evaluator sin modificar, runner 5 |
| Entorno | MuJoCo 3.10.0, ONNX Runtime 1.24.4 |
| Método de optimización | CMA-ES separable |

El autor indica que el resultado público de la Arena es la referencia autoritativa y que no verificó de forma independiente el rendimiento semanal de la red heredada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto muy ligero, pero no se publican parámetros ni huella de memoria.
- GPU recomendadas: no disponibles; al ser un modelo ONNX de robótica de pequeño tamaño aparente, la inferencia podría ejecutarse en CPU, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (versión 1.24.4 usada en la evaluación); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HlibPlakhtii/microduck-tug-quicksilver-v14 | Política robótica ONNX (remix) | no disponible | no aplica | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-lphat-c2-s1s5 | Política robótica (modelo base) | no disponible | no aplica | no disponible | Hugging Face |
| lphatnguyen/microduck-tug-of-war-v0 | Política robótica (upstream) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, más allá de que quicksilver-v14 deriva de los otros dos y añade la capa de lookup para la semilla 2.

## Limitaciones y advertencias

- No es un controlador de locomoción general ni una política para robot real; el autor lo declara explícitamente.
- La optimización es *in-sample* sobre las posiciones de salida declaradas de la simulación, por lo que no hay garantía de generalización a otras semillas o condiciones.
- La reproducción exacta es sensible a la aritmética de coma flotante; pequeñas diferencias numéricas pueden alterar el resultado.
- El autor no entrenó la red heredada ni verificó de forma independiente su rendimiento en la copa semanal.
- El resultado público de la Arena es la referencia autoritativa; la puntuación local de 166,57612562 cm no sustituye a esa validación.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el lookup puede reproducir acciones inadecuadas si las observaciones coinciden parcialmente dentro de la tolerancia de 1e-7 sin corresponder al mismo estado real.
- Licencia: no disponible en la información proporcionada; la model card indica que se retienen el LICENSE y NOTICE del modelo base, cuyos términos y alcance se describen en BASE_MODEL_CARD.md. Es imprescindible revisarlos antes de cualquier uso comercial.
- Sesgos conocidos: no documentados; al ser un artefacto de competición, su comportamiento está fuertemente condicionado por el entorno y la semilla de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-lphat-c2-s1s5/tree/46d9c19697dbe10acfb04317c7c0931d991dc41c
- Upstream citado en la model card: lphatnguyen/microduck-tug-of-war-v0 (sin URL directa en la información proporcionada)
- Pollen Robotics (contribuidor citado): sin URL en la información proporcionada
- BASE_MODEL_CARD.md: incluido en el repositorio del modelo (sin URL directa en la información proporcionada)
