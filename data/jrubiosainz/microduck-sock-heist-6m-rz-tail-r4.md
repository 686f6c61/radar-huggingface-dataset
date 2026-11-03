# jrubiosainz/microduck-sock-heist-6m-rz-tail-r4

## Resumen

Microduck Sock Heist 6m rz-tail-r4 (F2U) es una política de control para robótica formulada como un grafo ONNX de 1.190.937 bytes, publicada por el usuario jrubiosainz en Hugging Face. No es un modelo de lenguaje: es un artefacto de inferencia determinista que resuelve la tarea "Sock Heist" del entorno microduck-arena 0.7.0, un benchmark de control robótico con observaciones de 61 dimensiones. El modelo se distribuye como un único archivo `policy.onnx` y se evalúa mediante el runner oficial `sock_tail_rz.py`.

La relevancia de esta ficha es acotada pero concreta: se trata de un composite construido por merging de ocho políticas base (entre ellas variantes de jrubiosainz, lphatnguyen, rumezhak y a1rb4Ck) y refinado mediante búsqueda separable CMA-ES sobre los últimos 40 pasos de control de cada semilla. El resultado es una política que mejora los tiempos de resolución de su predecesora F2 en las cinco semillas oficiales, con evidencia de replay privado documentada.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0.0 GB reportado (coherente con un único archivo de ~1,19 MB) y fue creado el 3 de noviembre de 2026. La licencia no está declarada y no se especifican idiomas, lo que es esperable en un artefacto de robótica y no en un modelo lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda (`L_obs`, `L_act`, `L_mask`, `L_tol`) y fallback normalizador/MLP heredado de lphatnguyen v4 |
| Parametros totales | no disponible (el artefacto se mide en bytes de inicializadores, no en parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible; los tensores son float32 según la model card |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`, 1.190.937 bytes, SHA256 `f2bd526d0ef439d82f9fd904c59d4b275365a02049575dbb5829ed19bee3682e`) |

## Arquitectura y entrenamiento

La política no es un transformer ni un modelo generativo. Es un grafo ONNX que implementa una búsqueda tabular sobre observaciones: `L_obs` contiene claves físicas de 61 dimensiones (columnas 0:48 son claves físicas y 48:61 son columnas de comando), `L_act` contiene las acciones asociadas y `L_mask` es un vector `ones[61]` que fuerza la comparación de las 61 dimensiones, incluidas las de comando. La tolerancia de coincidencia es float32 1e-5. Cuando no hay coincidencia exacta se activa un fallback normalizador/MLP heredado de lphatnguyen v4. El grafo, los shapes, los tipos y el resto de inicializadores son bytes idénticos a los de la política F2 padre.

El "entrenamiento" es en realidad una optimización de las secuencias de acción de los últimos 40 pasos de control de cada semilla mediante CMA-ES separable contra el runner oficial (`sock_tail_rz.py`, SHA256 `7145b09c...`, y `tail_adapter.py`, SHA256 `be7ad7c1...`). Se modificaron 163 filas de `L_obs` y 168 filas de `L_act`, y las observaciones de 61 dimensiones de esas filas se regrabaron con microduck-arena 0.7.0 sobre x86-64. La composición heredada de F2 parte de C1b bare (`2937fe6b...`), cambia solo las columnas de comando 48 y 50 de `L_obs` (1414 patrones de bits float32) y pone `L_mask[48:61]` a uno. Las semillas 2-4 restauran sus columnas de comando de v4; las semillas 1 y 5 usan dumps reales de cola de comando x86 a vx=1.0, no ceros sintéticos.

## Capacidades

- Control robótico determinista en el entorno microduck-arena 0.7.0, tarea Sock Heist, con observaciones de 61 dimensiones.
- Resolución de las cinco semillas oficiales in-sample con los mejores hits registrados: semilla 1 a 967 ticks, semilla 2 a 1048, semilla 3 a 958, semilla 4 a 975 y semilla 5 a 996 (a 0,005 s por tick).
- Modo de entrada canónico: se debe omitir el campo `command_vx` y el flag `--speed`; la Arena selecciona la velocidad mediante su barrido canónico. No es el candidato C1b-p de velocidad fijada.
- Replay verificado con ONNX Runtime 1.24.4, MuJoCo 3.10.0, NumPy 2.4.1 y Python 3.12.15 sobre x86-64, con `onnx.checker` superado en el archivo anotado.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Evaluación en el benchmark microduck-arena: cargar `policy.onnx` con el runner oficial y medir ticks por semilla para comparar contra F2, F2T y otras entradas públicas de la Arena.
- Baseline de referencia para políticas tabulares: sirve como punto de comparación determinista frente a políticas neuronales end-to-end en la misma tarea.
- Reproducción de experimentos de CMA-ES: el desglose de filas modificadas por semilla permite auditar qué segmentos del espacio de observación fueron reoptimizados.
- Estudio de merging de políticas: el historial de ocho modelos base y las relaciones `merge` documentadas permiten analizar cómo se compone una política a partir de fragmentos de otras.
- Verificación de integridad en pipelines: los SHA256 por semilla y por archivo permiten validar artefactos en CI antes de someterlos a la Arena.
- Docencia en control robótico: ejemplo mínimo (1,19 MB) de política de búsqueda tabular con fallback MLP, útil para ilustrar arquitecturas híbridas de control.

## Benchmarks y rendimiento

Resultados de replay privado documentados en la model card (Arena 0.7.0, x86-64), comparando F2U con F2 y F2T:

| Semilla | vx=1.0 fijo y tiempo canónico | Ticks F2U | Ticks F2 | Ticks F2T |
|---|---|---|---|---|
| 1 | 4.835 s | 967 | 968 | 967 |
| 2 | 5.240 s | 1048 | 1058 | 1058 |
| 3 | 4.790 s | 958 | 974 | 962 |
| 4 | no disponible en el extracto | 975 (hit registrado) | no disponible | no disponible |
| 5 | no disponible en el extracto | 996 (hit registrado) | no disponible | no disponible |

Los ticks se miden a 0,005 s por paso. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza del artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo pesa 1.190.937 bytes y los tensores son float32 de pequeña dimensión.
- GPU recomendadas: no requiere GPU; el replay documentado se ejecutó en CPU x86-64 con ONNX Runtime 1.24.4.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: ONNX Runtime (versión validada 1.24.4), con MuJoCo 3.10.0 y NumPy 2.4.1 para el entorno de simulación.
- Latencia y throughput: no disponibles de forma agregada; el coste dominante es la simulación MuJoCo, no la inferencia de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Semilla 1 (ticks) | Semilla 2 (ticks) | Semilla 3 (ticks) | Licencia |
|---|---|---|---|---|---|---|
| microduck-sock-heist-6m-rz-tail-r4 (F2U) | ONNX tabular + fallback MLP | 1.190.937 B | 967 | 1048 | 958 | no disponible |
| microduck-sock-heist-6m-rz-tail-r2 (F2) | ONNX tabular + fallback MLP | 1.188.643 B | 968 | 1058 | 974 | no disponible |
| microduck-sock-heist-6m-rz-tail-r3 (F2T) | ONNX tabular + fallback MLP | 1.190.857 B | 967 | 1058 | 962 | no disponible |

No se dispone de datos de benchmarks de otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica para la tarea Sock Heist de microduck-arena 0.7.0; no generaliza a otras tareas ni entornos.
- El modo de entrada debe ser canónico (sin `command_vx` ni `--speed`); usarla con velocidad fijada puede invalidar los resultados.
- Los hits registrados son in-sample sobre las cinco semillas oficiales; no hay evidencia de generalización a semillas no vistas.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- El artefacto depende de versiones concretas del entorno (Arena 0.7.0, MuJoCo 3.10.0, ONNX Runtime 1.24.4); cambios de versión pueden alterar el comportamiento.
- Riesgo de sobreajuste a las semillas: la búsqueda CMA-ES se realizó contra el runner oficial sobre esas semillas concretas.
- No aplica riesgo de alucinación ni sesgos lingüísticos por no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r4
- Modelo base F2: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r2
- Modelo predecesor F2T: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r3
- Modelo base v4: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Modelo base v3: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Modelo base remix: https://huggingface.co/rumezhak/microduck-sock-heist-remix-rz-tail
- Modelo base second-green-v2: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Modelo base heist: https://huggingface.co/a1rb4Ck/microduck-heist
- Modelo base r1n: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n
- Modelo base 94cd-tail: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
