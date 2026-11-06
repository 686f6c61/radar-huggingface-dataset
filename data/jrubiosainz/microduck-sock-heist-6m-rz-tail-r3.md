# jrubiosainz/microduck-sock-heist-6m-rz-tail-r3

## Resumen

Microduck Sock Heist 6M RZ Tail R3 (F2T) es una política de control para robótica publicada por jrubiosainz en el contexto de la competición microduck-arena. No es un modelo de lenguaje: es un fichero ONNX de 1.190.857 bytes que implementa una política de comportamiento para el entorno "Sock Heist", resuelto mediante búsqueda de acciones sobre una tabla de consulta (lookup table) más un fallback MLP. El modelo se distribuye como `policy.onnx` y se ejecuta a través del runner oficial de la arena (`sock_tail_rz.py` junto con `tail_adapter.py`).

La relevancia de esta ficha es acotada: se trata de una entrada de competición derivada por fusión (`merge`) de ocho modelos base, entre ellos `a1rb4Ck/microduck-heist`, `lphatnguyen/microduck-sock-heist-6m-v3` y `v4`, y varias iteraciones propias (`rz-tail-r1n`, `rz-tail-r2`) y de terceros (`rumezhak/microduck-sock-heist-remix-rz-tail`, `rumezhak/microduck-sock-heist-second-green-v2`). El resultado es una política compuesta que cubre los cinco seeds oficiales del entorno con evidencia de replay in-sample.

El modelo tiene cero descargas y cero likes en el momento de la consulta, el repositorio ocupa 0.0 GB y la model card no declara licencia ni idiomas. Toda la documentación técnica disponible gira en torno a la composición de la tabla de consulta, la modificación de filas concretas y la evidencia de replay, no a capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control basada en lookup table (`L_obs`, `L_act`, `L_mask`, `L_tol`) con fallback MLP; grafo ONNX |
| Parametros totales | no disponible (fichero ONNX de 1.190.857 bytes; el nombre del modelo indica 6M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible; pesos en float32 para las tablas modificadas |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política es un grafo ONNX cuya lógica principal es una tabla de consulta sobre observaciones de 61 dimensiones. La máscara `L_mask` es `ones[61]`, de modo que la comparación cubre las 61 dimensiones de observación, incluidas las columnas de comando (48 y 50). La tolerancia de comparación es float32 1e-5. Cuando la consulta no coincide con ninguna fila de la tabla, se activa un fallback MLP heredado de `lphatnguyen/microduck-sock-heist-6m-v4`.

El entrenamiento no es un entrenamiento neuronal convencional: las secuencias de acción se obtienen mediante búsqueda con CMA-ES separable contra el runner oficial (`sock_tail_rz.py`, SHA256 `7145b09c...`, y `tail_adapter.py`, SHA256 `be7ad7c1...`). F2T parte de F2 (`jrubiosainz/microduck-sock-heist-6m-rz-tail-r2` @ `d1c607f3...`, `policy.onnx` de 1.188.643 bytes) y modifica únicamente 58 filas de `L_obs` y 60 filas de `L_act`, correspondientes a los últimos pasos de control de los seeds 1 y 3. El resto de nodos del grafo, inicializadores, formas, tipos y metadatos son bytes idénticos a F2. Las observaciones de las filas modificadas se regrabaron desde microduck-arena 0.7.0 en x86-64.

La composición heredada de F2 asigna segmentos de tabla por seed: seed 1 desde r1n filas [0,267), seed 2 desde v4 [242,506), seed 3 desde v4 [506,749), seed 4 desde v4 [749,994) y seed 5 desde un donante con SHA256 `84a7b596...` filas [1101,1376). Las columnas de comando de los seeds 2-4 se restauran literalmente desde v4; las de los seeds 1 y 5 son volcados reales de cola de comando en x86 con vx=1.0, no ceros sintéticos.

## Capacidades

- Control de política para el entorno Sock Heist de microduck-arena en los cinco seeds oficiales.
- Consulta determinista por lookup table sobre 61 dimensiones de observación con tolerancia float32 1e-5.
- Fallback MLP cuando la observación no coincide con la tabla.
- Operación en modo canónico: se omite el campo `command_vx` y `--speed`, y la arena selecciona la velocidad mediante su barrido canónico.
- Ejecución mediante ONNX Runtime (validado con la versión 1.24.4) sobre MuJoCo 3.10.0 y Python 3.12.15 en x86-64.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Evaluación en la competición microduck-arena: la política se envía como entrada canónica y la arena selecciona la velocidad; es adecuada porque cubre los cinco seeds oficiales con evidencia de replay.
- Replay reproducible de resultados: el fichero lleva metadatos con SHA256 de cada componente, lo que permite verificar la integridad del binario antes de una submission.
- Estudio de composición por merge de políticas: sirve como ejemplo documentado de cómo fusionar segmentos de tabla de varios modelos base conservando bytes del padre.
- Búsqueda de acciones con CMA-ES separable: el pipeline descrito (runner oficial más adaptador de cola) se puede reutilizar para reoptimizar los últimos pasos de control de un seed.
- Verificación de integridad en pipelines de CI: los hashes del fichero, del receipt y de los scripts de verificación permiten automatizar gates de aceptación antes de publicar.
- Docencia sobre políticas de lookup table en robótica: el modelo ilustra el equilibrio entre tabla exacta y fallback neuronal en entornos con observaciones de baja dimensión.
- Análisis de robustez frente a comandos: la model card advierte explícitamente de que no se reclama independencia del comando ni que vx=0.2 coincida con 1.0 fijo o canónico, lo que permite diseñar experimentos controlados sobre esa variable.

## Benchmarks y rendimiento

Los datos disponibles son de replay in-sample sobre los cinco seeds oficiales, no benchmarks estándar de ML. Se presentan ticks a 0.005 s por tick, con vx=1.0 fijo y tiempo canónico, comparados con F2:

| Seed | Ticks F2T | Ticks F2 | Tiempo F2T (s) |
|---|---|---|---|
| 1 | 967 | 968 | 4.835 |
| 2 | 1058 | 1058 | 5.290 |
| 3 | 962 | 974 | 4.810 |
| 4 | 984 | 984 | 4.920 |
| 5 | 997 | 997 | 4.985 |
| Suma | 4968 | 4981 | media 4.968 |

El control v4 en el mismo lanzamiento registra 4.987 s (972/1058/974/984/999 ticks). El barrido de 21 velocidades del seed 1 selecciona finalistas [1.0, 0.9, 1.2]; la evaluación canónica elige 1.0 y sus ticks por seed coinciden con la ejecución a velocidad fija. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no procede aplicarlos a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el fichero ONNX ocupa 1.190.857 bytes, por lo que la huella de pesos es inferior a 2 MB, pero no se documenta el consumo del runtime.
- GPU recomendadas: no disponible; la evidencia de replay se obtuvo en x86-64 con ONNX Runtime 1.24.4, sin especificar GPU.
- Cabe en cualquier GPU consumer con holgura por tamaño de pesos, aunque el requisito real lo marca el simulador MuJoCo 3.10.0 y el runner de la arena, no el modelo.
- Opciones de despliegue: ONNX Runtime (versión validada 1.24.4) con el runner oficial `sock_tail_rz.py` y `tail_adapter.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles de forma agregada; la evidencia reporta tiempos de episodio de 4,810 a 5,290 s para 962-1058 ticks a 0.005 s por tick.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Evidencia | Licencia |
|---|---|---|---|---|
| microduck-sock-heist-6m-rz-tail-r3 (F2T) | Política ONNX con lookup table y fallback MLP | 5 seeds oficiales | Replay in-sample, suma 4968 ticks | no disponible |
| jrubiosainz/microduck-sock-heist-6m-rz-tail-r2 (F2) | Política ONNX, padre directo | 5 seeds oficiales | Suma 4981 ticks | no disponible |
| lphatnguyen/microduck-sock-heist-6m-v4 | Política base, aporta fallback MLP y segmentos de seeds 2-4 | Parcial | Control v4 a 4.987 s en el mismo lanzamiento | no disponible |
| rumezhak/microduck-sock-heist-remix-rz-tail y second-green-v2 | Políticas base del merge | No especificada | No disponible | no disponible |

La comparación se limita a los modelos del propio ecosistema microduck porque no se dispone de alternativas externas equivalentes documentadas en la información proporcionada.

## Limitaciones y advertencias

- La evidencia es in-sample sobre los cinco seeds oficiales; el autor no reclama generalización.
- No se reclama independencia respecto al comando: no se afirma que vx=0.2 coincida con 1.0 fijo ni con el modo canónico.
- La evaluación autoritativa es la del servidor de la arena y puede diferir de los replays locales.
- El modo de entrada previsto es canónico (sin `command_vx` ni `--speed`); este fichero no es el candidato C1b-p de velocidad fijada.
- La licencia no está declarada, por lo que el uso comercial queda sin marco explícito.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque no es un modelo de lenguaje; esos riesgos no aplican, pero tampoco hay garantías de robustez fuera de los seeds evaluados.
- El repositorio tiene 0 descargas y 0 likes, y la model card no incluye documentación de mantenimiento ni soporte.
- La integridad del binario depende de hashes concretos; cualquier reexportación o cuantización adicional invalida la evidencia de replay reportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r3
- Modelo padre F2: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r2
- Modelo base v4: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Modelo base v3: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Modelo base a1rb4Ck: https://huggingface.co/a1rb4Ck/microduck-heist
- Modelo base rumezhak remix: https://huggingface.co/rumezhak/microduck-sock-heist-remix-rz-tail
- Modelo base rumezhak second-green-v2: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Modelo base r1n: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n
- Modelo base 94cd-tail: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
- Repositorio microduck-arena: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
