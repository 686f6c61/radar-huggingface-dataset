# jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c

## Resumen

Microduck Sock Heist - derived WR1N 3f7c858c es una política de control para robótica de simulación, publicada por el usuario jrubiosainz en Hugging Face. Se trata de un artefacto derivado del modelo base `rumezhak/microduck-sock-heist-composite-v5`, obtenido mediante una búsqueda de optimización (CMA-ES separable) sobre un subconjunto de semillas concretas del entorno Microduck Arena, un banco de pruebas de simulación mantenido por Pollen Robotics. El modelo se distribuye en formato ONNX y se ejecuta con la librería `microduck`; no es un modelo de lenguaje, sino una política de comportamiento para un agente robótico simulado.

El modelo hereda la arquitectura y red de respaldo del composite-v5 y solo modifica las filas de búsqueda (lookup) correspondientes a la semilla 5, re-optimizada con un arranque en caliente a partir de secuencias de acciones recuperadas de K6H/PF2. El resto del grafo, la red de fallback, la máscara y las demás semillas permanecen sin cambios. El tamaño del repositorio es de 0.0 GB (política de 1.211.403 bytes), lo que lo sitúa en la categoría de modelos ultraligeros orientados a entornos de simulación con recursos limitados.

Su relevancia es acotada: se trata de una entrada de competición (Microduck Arena) optimizada *in-sample* sobre las cinco semillas oficiales, y el propio autor advierte explícitamente que no debe usarse en un robot físico. No hay información sobre licencia global, idiomas ni benchmarks de propósito general, por lo que su interés se limita a la investigación en optimización de políticas para simulación y a la reproducibilidad de resultados en el entorno Microduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para simulación (grafo ONNX con red de fallback y lookup de acciones); detalles internos no disponibles |
| Parametros totales | no disponible (política de 1.211.403 bytes en ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible a nivel de modelo completo; `LICENSE-apache-2.0.txt` se aplica solo a porciones que ya portaban Apache-2.0 |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Modelo base | rumezhak/microduck-sock-heist-composite-v5 (revision 3d6763f07e4d5941e07121b8b48119e9bda60977) |
| SHA256 de la política | 3f7c858c31fd171c75cc0425230f23d35ea1181ba1b5dad4a4de7a610222155b |
| Entorno | Microduck Arena 0.7.0, runner version 5 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política más allá de que se distribuye como grafo ONNX con una red de fallback, una máscara, una tolerancia y filas de lookup (`L_obs`/`L_act`) por semilla. El modelo deriva del composite-v5 de rumezhak, que a su vez integra linaje de composite-v1/v2/v3/v4, remix y contribuciones de quicksilver-v2 de HlibPlakhtii. La modificación introducida en esta versión afecta únicamente a la semilla 5: se parte de secuencias de acciones completas recuperadas de K6H/PF2 (verificadas con su ascendencia de búsqueda original y replicadas nativamente antes de la nueva búsqueda) y se re-optimiza con búsquedas de cola CMA-ES separable con semilla independiente (RNG 780568, isla `islands/i008_s5_k20`, arranque en caliente). Las filas de lookup de esa semilla se vuelven a registrar en el runner nativo oficial x86; el grafo, la red de fallback, la máscara, la tolerancia y las demás semillas no cambian.

No se documentan datos de entrenamiento en el sentido habitual (número de tokens, composición del dataset, RLHF/DPO), ya que no se trata de un modelo de lenguaje. La optimización es específica del entorno Microduck Arena y se realiza *in-sample* sobre las cinco semillas oficiales, sin afirmaciones de generalización. El autor indica explícitamente que la operación de recuperación no equivale a la búsqueda del padre y que los prefijos en caliente pueden diferir de v5, sin empalmes sobre prefijos incompatibles.

## Capacidades

- Control de política para el agente simulado de Microduck Arena (tarea "sock heist").
- Ejecución de secuencias de acciones sobre las cinco semillas oficiales del entorno, con finalización medida en ticks y segundos.
- Replay nativo en el runner oficial x86 (microduck-arena 0.7.0, runner version 5).
- Compatibilidad con barrido canónico (canonical sweep) y con `vx=0.2` fijo; la sumisión usa el barrido canónico sin override de velocidad.
- Integración con la librería `microduck` y formato ONNX para despliegue en el runner.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de resultados en Microduck Arena: cargar la política ONNX con la librería `microduck` y el runner 0.7.0 para replicar los tiempos de finalización reportados por semilla y comparar con v5.
- Investigación en optimización de políticas: usar la semilla 5 re-optimizada como punto de partida para estudiar el efecto de búsquedas CMA-ES separables con arranque en caliente sobre secuencias recuperadas.
- Análisis de linaje y atribución: inspeccionar los metadatos ONNX y el fichero `NOTICE` para reconstruir la cadena de contribuciones (rumezhak, HlibPlakhtii, jrubiosainz, lphatnguyen, a1rb4Ck) y las porciones con licencia Apache-2.0.
- Docencia y divulgación sobre competiciones de robótica simulada: ejemplo de artefacto derivado con modificaciones acotadas y mediciones nativas locales frente a resultados de arena.
- Validación de pipelines de replay: comprobar que el barrido canónico y `vx=0.2` fijo coinciden en el runner oficial, útil para verificar la infraestructura de evaluación.
- Estudio de robustez frente a semillas: comparar los ticks de la semilla 5 (984) con los de v5 (985) para evaluar la sensibilidad de la política a re-optimizaciones locales.
- Referencia para políticas ultraligeras en simulación: servir como base para experimentos con presupuestos de cómputo mínimos (política de ~1,2 MB) en entornos con restricciones de recursos.

## Benchmarks y rendimiento

El autor reporta mediciones nativas locales de replay (no resultados de arena ni ranking). Se presentan a continuación junto con los ticks de v5 para la misma semilla:

| Semilla | Finish (s) | Ticks | Ticks v5 |
|---|---:|---:|---:|
| 1 | 4.800 | 960 | 960 |
| 2 | 5.150 | 1030 | 1030 |
| 3 | 4.750 | 950 | 950 |
| 4 | 4.800 | 960 | 960 |
| 5 | 4.920 | 984 | 985 |

Media: 4.884 s; total: 4884 ticks. El autor indica que son mediciones nativas locales, no una aceptación en vivo ni una clasificación, y que no hay afirmación de generalización ni de seguridad en robot real. No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; la política ONNX ocupa ~1,2 MB, por lo que la huella de memoria es mínima y depende del runner de Microduck Arena.
- GPU recomendadas: no disponibles; el runner oficial reportado es nativo x86, sin requisitos de GPU documentados.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño de la política, cualquier GPU moderna sería sobredimensionada, pero no se documenta soporte.
- Opciones de despliegue: librería `microduck` con el runner oficial microduck-arena 0.7.0 (runner version 5); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles más allá de los tiempos de finalización por semilla reportados (4,75–5,15 s) y los ticks (950–1030) en el runner nativo x86.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Semillas modificadas | Finish medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sock-heist-6m-wr1n-3f7c858c (este) | Política ONNX | composite-v5 | Semilla 5 | 4.884 s (local) | No disponible (modelo completo); Apache-2.0 en porciones | Hugging Face |
| rumezhak/microduck-sock-heist-composite-v5 | Política ONNX | composite-v1/v2/v3/v4, remix | Base de referencia | no disponible | No disponible | Hugging Face |
| quicksilver-v2 (HlibPlakhtii) | Política (linaje) | — | Aporta secuencias semilla 1/4 y método de búsqueda por coordenadas | no disponible | no disponible | Referenciado en créditos |

No se dispone de datos de rendimiento comparables para las alternativas en la información proporcionada; la comparativa se limita a linaje y atribución.

## Limitaciones y advertencias

- El autor advierte explícitamente: "Do not use on a physical robot" (no usar en un robot físico).
- Optimización *in-sample* sobre las cinco semillas oficiales; sin afirmación de generalización a otras semillas o entornos.
- Las mediciones son replays nativos locales, no resultados de arena ni ranking; no constituyen una aceptación en vivo.
- Licencia del modelo completo no disponible; `LICENSE-apache-2.0.txt` se aplica solo a porciones que ya portaban Apache-2.0, no a los pesos upstream sin licencia ni al modelo en su conjunto.
- v5 declara ausencia de licencia global; cualquier uso comercial requiere verificar la cadena de licencias de las porciones heredadas.
- Riesgo de atribución: el modelo no es una política entrenada íntegramente por el autor; depende de contribuciones de terceros y de un aviso heredado que debe preservarse.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas (no es un modelo de lenguaje).
- Cualquier objeción de un autor de las porciones upstream detiene la publicación y se escala, según el aviso del modelo.
- No hay información sobre cuantizaciones, idiomas ni benchmarks de propósito general; no deben inferirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c
- Modelo base (revisión citada): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v5/tree/3d6763f07e4d5941e07121b8b48119e9bda60977
- Modelo base (raíz): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v5
- Fichero NOTICE (referenciado en la model card): incluido en el repositorio del modelo
- Fichero LICENSE-apache-2.0.txt (referenciado en la model card): incluido en el repositorio del modelo
- Pollen Robotics (Microduck / Microduck Arena / runner oficial): no se proporciona URL en la información disponible
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
