# hermitdave/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-imatrix

## Resumen

El repositorio `hermitdave/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-imatrix` no contiene un modelo en sentido estricto, sino una matriz de importancia de activaciones (imatrix) calculada sobre los pesos BF16 del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16`. La imatrix es un artefacto auxiliar que registra estadisticas de activacion por columna de entrada en cada capa y se utiliza para guiar la asignacion de precision mixta en el pipeline de cuantizacion RCO (Rate-Constrained Optimization) del proyecto ISTA-DASLab.

El modelo base al que referencia es un transformer de tipo Mixture-of-Experts con 74,86 mil millones de parametros totales y 9 mil millones activos por token (la nomenclatura A9B lo indica), aunque la informacion disponible no detalla la longitud de contexto ni la composicion exacta del entrenamiento. El interes practico de este repositorio reside en que permite reproducir asignaciones de precision mixta para despliegue en Apple Silicon via MLX sin necesidad de recalcular la imatrix desde cero.

La captura se realizo en modo streaming capa a capa, dado que el checkpoint BF16 completo ocupa 149,8 GB y no cabe en los 64 GB de RAM del equipo de captura. El resultado cubre el 97,7 % de los tensores y el 96,6 % del peso parametrico, con un fichero comprimido de 180,6 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture-of-Experts (modelo base Nemotron 3.5 Bolt) |
| Parametros totales | 74,86 B (modelo base) |
| Parametros activos | 9 B (aproximado, segun nomenclatura A9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta via RCO (rco-mlx); no es un fichero de pesos cuantizado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.npz` (imatrix comprimida, 180,6 MB); pesos base en BF16 safetensors |
| Tensores cubiertos | 27.685 de 28.328 (97,7 %) |
| Cobertura ponderada por parametros | 96,6 % (72,33 B / 74,86 B) |
| Dataset de calibracion | `fineweb_edu_128k_1024` (256 filas x 2048 tokens, ~524k tokens) |

## Arquitectura y entrenamiento

El artefacto publicado no entrena ningun modelo: es una matriz de estadisticas de activacion por columna de entrada, `in_sum2[j] = sum_tokens x_j^2` y `counts[j]` por experto en capas MoE, acumulada durante un forward pass sobre pesos BF16 sin cuantizar. La captura se hizo con el script `streaming_capture_imatrix.py` del repositorio `rco-mlx`, manteniendo residente una sola capa a la vez (la mayor del modelo Bolt ocupa 5,31 GB) y almacenando los hidden states de todos los chunks de calibracion en una lista de aproximadamente 8,6 GB. El pico de memoria fue de unos 14 GB, muy por debajo de los 149,8 GB del checkpoint completo.

Los tensores no cubiertos incluyen las ganancias de RMSNorm, la puerta del router MoE, las capas `conv1d`, 236 expertos individuales que no recibieron enrutamiento en el conjunto de calibracion y la torre de vision (fuera del alcance, ya que la captura es solo texto). En el asignador de RCO, estos tensores caen a RTN sin ponderar. La imatrix se consume indistintamente con un imatrix GGUF por `rco_mlx.imatrix.Imatrix`, y el constructor de la base de errores pondera el error de reconstruccion RTN por tensor con `in_sum2 / counts` en lugar del MSE plano.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Nemotron 3.5 Bolt (no verificables desde este repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): la model card menciona una torre de vision en el modelo base, pero queda fuera del alcance de esta imatrix.
- Funcion especifica de este repositorio: servir como entrada a `rco-mlx --imatrix` para construir una base de errores por bloque y derivar asignaciones de precision mixta.

## Casos de uso

- Cuantizacion de precision mixta para MLX en Apple Silicon: usar la imatrix con `rco_mlx.scripts.build_error_db_perblock` para generar `error_db.json` y derivar una asignacion de bits por tensor que minimice el error de reconstruccion ponderado por activacion, en lugar de aplicar una cuantizacion uniforme.
- Reproducibilidad de pipelines de cuantizacion: al publicar la imatrix junto con los scripts de captura, terceros pueden reproducir exactamente la misma base de errores sin repetir un forward pass sobre 524k tokens de calibracion.
- Investigacion en metodos de asignacion de bits: la imatrix permite comparar estrategias (RTN plano frente a RTN ponderado por activacion, o RCO frente a GPTQ/AWQ) sobre un modelo MoE grande con un coste de calibracion marginal nulo.
- Despliegue en equipos con RAM limitada: el formato `.npz` comprimido de 180,6 MB se carga en memoria sin problema en estaciones de trabajo modestas, a diferencia del checkpoint BF16 de 149,8 GB.
- Evaluacion de sensibilidad por capa y por experto: las estadisticas `counts[j]` permiten identificar que expertos reciben enrutamiento con el corpus de calibracion y cuales quedan sin cobertura, lo que informa decisiones sobre que expertos requieren mas bits.
- Integracion en pipelines de CI para builds de modelos cuantizados: automatizar la regeneracion de la imatrix cuando cambie el checkpoint base o el corpus de calibracion, y validar que la cobertura de tensores se mantiene por encima de un umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de cobertura de la captura:

| Metrica | Valor |
|---|---|
| Tensores cubiertos | 27.685 / 28.328 (97,7 %) |
| Cobertura ponderada por parametros | 72,33 B / 74,86 B (96,6 %) |
| Tamano del fichero | 180,6 MB (comprimido) |
| Tokens de calibracion | ~524.000 (256 x 2048) |
| Pico de memoria en captura | ~14 GB |

## Requisitos de hardware

- Inferencia del modelo base: no aplicable a este repositorio, que solo contiene la imatrix.
- Captura de la imatrix: se realizo con un equipo de 64 GB de RAM; el script no streaming (`capture_imatrix.py`) rechaza este checkpoint porque exige que el BF16 completo quepa en RAM.
- Almacenamiento: el checkpoint BF16 base ocupa 149,8 GB; la imatrix ocupa 180,6 MB.
- Memoria para construir la base de errores: no especificada, pero el proceso de captura necesito ~14 GB de pico.
- Despliegue: orientado a `rco-mlx` (Apple Silicon / MLX); la imatrix tambien es legible por herramientas que acepten imatrix GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-imatrix (este repo) | 74,86 B totales / 9 B activos | no disponible | no disponible | `.npz` | Imatrix, no pesos |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74,86 B totales / 9 B activos | no disponible | no disponible | safetensors BF16 | Modelo base, 149,8 GB |
| Imatrix GGUF equivalentes (p. ej. de llama.cpp) | N/A | N/A | N/A | GGUF | Formato alternativo, compatible con `rco_mlx.imatrix.Imatrix` |

No se dispone de informacion sobre otros repositorios de imatrix para este mismo modelo base ni sobre modelos comparables de la misma categoria con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos ni tokenizer; es un artefacto auxiliar de cuantizacion.
- Cobertura incompleta: el 2,3 % de los tensores y el 3,4 % del peso parametrico no estan cubiertos y caen a RTN sin ponderar en el asignador.
- 236 expertos individuales no recibieron enrutamiento con el corpus de calibracion, por lo que su imatrix no refleja su comportamiento real en produccion.
- La torre de vision queda fuera del alcance; la imatrix no es valida para cuantizar las capas multimodales.
- El corpus de calibracion es unico (`fineweb_edu_128k_1024`, ~524k tokens) y de dominio educativo en ingles; la imatrix puede no representar bien otros dominios o idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; verificar la licencia del modelo base NVIDIA antes de cualquier despliegue.
- Sin datos de benchmarks ni de calidad de la cuantizacion resultante: no hay evidencia publicada de la perdida de perplexity o de rendimiento tras aplicar la asignacion derivada de esta imatrix.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-imatrix
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Proyecto RCO (ISTA-DASLab): https://github.com/ISTA-DASLab/RCO
