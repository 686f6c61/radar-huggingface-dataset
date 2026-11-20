# Oursdesvosges/coilstellaration-coil-optimizer

## Resumen

El modelo `coilstellaration-coil-optimizer` de Oursdesvosges es una entrega en formato ONNX de un optimizador de bobinas para reactores de fusión de tipo stellarator, especializado en la pista `fixed_shape` (configuración 3x5: 3 periodos de campo y 5 bobinas por semiperiodo) del benchmark CoilStellaration de Proxima Fusion. No es un modelo de lenguaje: es un artefacto de inferencia física que encapsula una arquitectura Levenberg-Marquardt compilada a ONNX, con un índice de recuperación de configuraciones de bobinas de entrenamiento y una red neuronal prior (`per_coil_ensemble_DfNfHmsbP4Rzitx6jdVBfQ4.onnx`) embebida.

El modelo resuelve el problema de encontrar geometrías de bobinas que generen un campo magnético confinante en un stellarator, respetando restricciones físicas duras (curvatura, separación bobina-plasma, cruces entre bobinas, error de campo). Su relevancia radica en que reporta un score medio de `0.997697` sobre las 2.771 instancias de la partición oficial `eval` de `fixed_shape`, superando el récord previo de `phanerozoic` (`0.996282`) con una reducción del 38,1% del error restante y en menos de la mitad del tiempo de inferencia.

El artefacto es un único fichero `model.onnx` de 43,7 MiB y 17.574.649 parámetros, diseñado para ejecución en CPU. Está liberado bajo licencia MIT y se construyó exclusivamente sobre la partición `split="train"` del dataset, con `no_eval_training = true`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Levenberg-Marquardt compilado a ONNX con recuperación de vecinos y física en el grafo |
| Parámetros totales | 17.574.649 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | float16 para el índice de recuperación; FP32 para el prior neuronal; sin cuantización int8 (`DB_BYTES=2`) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, 43,7 MiB) |

## Arquitectura y entrenamiento

La arquitectura es un optimizador Levenberg-Marquardt (heredado de `phanerozoic/coilstellaration-coil-optimizer`, MIT) compilado a ONNX, aumentado con un índice de recuperación de conjuntos de bobinas de entrenamiento y una red neuronal prior de predicción por bobina. El índice almacena los 53.206 conjuntos de bobinas `3x5` de entrenamiento, distribuidos en 6.114 fronteras de `split="train"`, en `float16` completo sin cuantización int8. La optimización se inicializa con un pool multi-arranque de 7 semillas: la predicción de la red neuronal, las 5 fronteras de entrenamiento más cercanas y círculos analíticos de holgura, precedido por una ruta rápida analítica de ~10 ms.

El entrenamiento y ajuste se realizaron exclusivamente sobre `split="train"` (`no_eval_training = true`), usando el pipeline oficial `coilstellaration` + `desc-opt==0.17.1`. La discretización física anti-cruce emplea `P_G = 96` puntos de distancia/segmento (50% más finos que el estándar `P_G = 64`), `GRID_T = 40`, `GRID_PK = 4.0` (800 puntos de superficie por fase × `MEMORY = 3` = 3.200 puntos efectivos por resolución CG), `CC_ALL = 1` (las 6 imágenes de simetría stellarator en pasos finos) y `COARSE_CC3 = 1` (3 imágenes en pasos gruesos). El ranking alineado con el score (`SCORE_KEY`, `BEST_TURNS`, `SCORE_G_MARGIN=0.006`, `COARSE_PENALTY=3.0`) y la salida temprana sin penalización (`TURN_STOP_F=0.94`) completan la configuración con `COARSE=28`, `ITERS=84`, `EXTRA=26`, `EXTRA2=20`, `CG_ITERS=40`.

## Capacidades

- Optimización de geometrías de bobinas para stellarators en la pista `fixed_shape` (`3x5`).
- Recuperación de conjuntos de bobinas de entrenamiento como semillas de inicialización (índice de 53.206 configuraciones).
- Predicción prior por bobina mediante red neuronal embebida (`per_coil_ensemble_DfNfHmsbP4Rzitx6jdVBfQ4.onnx`).
- Evaluación de restricciones físicas en el grafo: curvatura (`curv`), separación bobina-plasma (`cp`), cruces bobina-bobina (`cc`) y error de campo (`Berr`).
- Ejecución en CPU en un único fichero ONNX, sin dependencias de GPU.
- Verificación de contrato ONNX (`validate_onnx_contract` devuelve 0 errores; forward con ceros en 2,28 s con salidas finitas `(5, 15)` y `(5,)`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un optimizador numérico especializado.

## Casos de uso

- Diseño de bobinas para stellarators de configuración 3x5: el modelo genera geometrías de bobina que satisfacen las restricciones de curvatura, separación y cruce, adecuado por su score de 0,997697 en la partición oficial `eval`.
- Evaluación comparativa de algoritmos de optimización de bobinas: sirve como referencia reproducible en el benchmark CoilStellaration con el pipeline oficial `desc-opt==0.17.1`.
- Generación de semillas para optimizadores de mayor fidelidad: el pool multi-arranque de 7 semillas y el índice de 53.206 conjuntos permiten inicializar simulaciones físicas más costosas.
- Investigación en confinamiento magnético: permite explorar el espacio de configuraciones `fixed_shape` con un coste de inferencia proyectado de ~1,16 h para las 2.771 filas en CPU de HF Space.
- Docencia y prototipado en fusión: al ser un único ONNX de 43,7 MiB ejecutable en CPU, se puede desplegar en entornos sin GPU para experimentar con el benchmark.
- Validación de pipelines de evaluación: la verificación de contrato ONNX y el forward determinista permiten usarlo como caso de prueba en CI de herramientas de scoring físico.
- Sustitución de optimizadores basados en GPU en entornos con restricciones de hardware: la inferencia en CPU con 2,765× el tiempo de `be28` en `3x5` lo hace viable en estaciones de trabajo convencionales.

## Benchmarks y rendimiento

Resultados verificados sobre la partición oficial `eval` de `fixed_shape` (`n = 2.771`), con el pipeline `coilstellaration` + `desc-opt==0.17.1`:

| Estrato | n | Score medio | Factibilidad estricta | cc | cp | curv | Berr | be28 | Δ vs be28 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| loose | 1.026 | 0,995625 | 99,12% | 1,0000 | 0,9931 | 0,9998 | 0,9992 | 0,983901 | +0,011724 |
| medium | 861 | 0,998187 | 97,56% | 0,9994 | 0,9999 | 1,0000 | 0,9963 | 0,979007 | +0,019180 |
| tight | 884 | 0,999624 | 99,43% | 1,0000 | 1,0000 | 1,0000 | 0,9988 | 0,985948 | +0,013677 |
| ALL (fixed_shape) | 2.771 | 0,997697 | 98,74% | 0,9998 | 0,9974 | 0,9999 | 0,9982 | 0,983033 | +0,014664 (-86,4% err) |

Comparación con el récord previo de `phanerozoic` en `fixed_shape` (`5c1d4066` = 0,996282 en 2,65 h): +0,001415 de score (-38,1% de error restante) en menos de la mitad del tiempo de inferencia. Tiempo de ejecución secuencial a 1 hilo: 2,765× el de `be28` en `3x5`, con una proyección de ~1,16 h para las 2.771 filas en CPU de HF Space (por debajo de 1,5 h incluyendo DESC y del timeout `EVAL_TIMEOUT` de 4 h).

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para CPU (ONNX, 43,7 MiB).
- GPU recomendadas: no aplica; no se reporta soporte GPU en la información disponible.
- Cabe en cualquier CPU convencional: el forward con entrada de ceros tarda 2,28 s y el tamaño del repo es de 0,1 GB.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se reportan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 2,765× el tiempo de `be28` en `3x5` en ejecución secuencial a 1 hilo; ~1,16 h proyectadas para las 2.771 filas de `fixed_shape` en CPU de HF Space.

## Comparativa con modelos similares

| Modelo | Tipo | Score `fixed_shape` | Tiempo | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Oursdesvosges/coilstellaration-coil-optimizer | ONNX LM + recuperación | 0,997697 | ~1,16 h (proyectado) | MIT | Hugging Face |
| phanerozoic/coilstellaration-coil-optimizer | ONNX LM (base) | 0,996282 (récord previo) | 2,65 h | MIT | Hugging Face |
| be28 (referencia del benchmark) | no disponible | 0,983033 | 2,765× menor que el modelo evaluado | no disponible | no disponible |

## Limitaciones y advertencias

- Especializado exclusivamente en la pista `fixed_shape` (`3x5`); no cubre otras configuraciones del benchmark CoilStellaration.
- No es un modelo de lenguaje ni un modelo multimodal: no soporta texto, visión, audio, tool calling ni agentes.
- El índice de recuperación incorpora 53.206 conjuntos de bobinas de entrenamiento; su rendimiento depende de la cobertura de la partición `split="train"`.
- El score se ha verificado con el pipeline oficial `coilstellaration` + `desc-opt==0.17.1`; cambios de versión pueden alterar los resultados.
- La factibilidad estricta es del 98,74% (no del 100%): un 1,26% de instancias no satisface todas las restricciones duras.
- El tiempo de inferencia se midió en CPU de HF Space con ejecución secuencial a 1 hilo; el rendimiento en otros entornos puede variar.
- Licencia MIT: permite uso comercial, pero requiere atribución a los tres activos base (`proxima-fusion/coilstellaration`, `proxima-fusion/coilstellaration-models` y `phanerozoic/coilstellaration-coil-optimizer`).
- No se reportan sesgos sociales ni riesgos de alucinación en el sentido de modelos generativos; el riesgo principal es físico: configuraciones que superan el scoring pero podrían no ser viables en un reactor real.
- No se dispone de información sobre validación experimental en hardware de fusión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oursdesvosges/coilstellaration-coil-optimizer
- Benchmark CoilStellaration (Space): https://huggingface.co/spaces/proxima-fusion/coilstellaration-bench
- Dataset de entrenamiento: https://huggingface.co/datasets/proxima-fusion/coilstellaration
- Modelos base de Proxima Fusion: https://huggingface.co/proxima-fusion/coilstellaration-models
- Modelo base de phanerozoic: https://huggingface.co/phanerozoic/coilstellaration-coil-optimizer
