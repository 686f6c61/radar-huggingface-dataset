# phanerozoic/coilstellaration-coil-optimizer

## Resumen

`phanerozoic/coilstellaration-coil-optimizer` es un modelo ONNX publicado por el usuario phanerozoic que resuelve la pista `fixed_shape` del benchmark Coilstellaration, orientado al diseno de bobinas (coils) para reactores de fusion de tipo stellarator. No es un modelo de lenguaje: es un grafo de optimizacion numerica que, dado un contorno de plasma y cuatro objetivos de ingenieria, devuelve un conjunto de cinco bobinas por medio periodo con sus corrientes en amperios.

El modelo combina en un unico grafo tres etapas: una red neuronal de primera aproximacion (el ensemble por bobina de `proxima-fusion/coilstellaration-models`), dieciseis pasos de Levenberg-Marquardt sobre coeficientes de Fourier y corrientes con jacobianos analiticos, y una etapa final de seleccion entre el coilset optimizado y circulos planares calibrados a los objetivos de distancia. La interfaz sigue el contrato ONNX del benchmark, con entradas de contorno en formato Fourier y un vector de cuatro metricas de requisito.

Es relevante porque aborda un problema inverso de fisica de plasmas con restricciones geometricas duras (distancias minima bobina-bobina y bobina-plasma, curvatura maxima y error de campo normalizado) en un unico artefacto exportable e inferible con onnxruntime, sin dependencias de frameworks de optimizacion en tiempo de ejecucion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB segun los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX compuesto: red neuronal ensemble por bobina + optimizador Levenberg-Marquardt (16 pasos, jacobianos analiticos, 12 iteraciones de gradiente conjugado por paso) + selector de coilset |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (exportacion ONNX en float32) |
| Idiomas soportados | no aplica (modelo numerico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`), con scripts PyTorch auxiliares (`lm.py`, `wrap.py`) |

## Arquitectura y entrenamiento

El grafo se estructura en tres etapas encadenadas. La primera es el ensemble por bobina `per_coil_ensemble_DAr7gipsQu9Mupbnsm2rAaK.onnx` del repositorio `proxima-fusion/coilstellaration-models` (licencia MIT), embebido sin modificaciones, que produce un primer coilset. A este se le piden los objetivos propios de la instancia o, cuando el objetivo de error de campo supera 0.1, unos objetivos relajados: 1.2 veces los dos objetivos de distancia (con minimos de 0.40 y 0.60 radios menores), 0.85 veces el objetivo de curvatura (con maximo de 3.5) y un error de campo de como maximo 0.01.

La segunda etapa ejecuta dieciseis pasos de Levenberg-Marquardt sobre los coeficientes de Fourier y las corrientes de las cinco bobinas. Los residuos son la parte del campo normal por encima de nueve decimas del objetivo, evaluada en una malla de 32 por 17 puntos del medio periodo del contorno, mas penalizaciones por puntos de bobina demasiado proximos a otra bobina o al contorno, o con curvatura superior al objetivo. Los jacobianos son analiticos y cada paso resuelve su sistema lineal con doce iteraciones de gradiente conjugado.

La tercera etapa mide el coilset optimizado, y tambien circulos planares dimensionados a los dos objetivos de distancia, contra los cuatro objetivos en mallas mas finas. Devuelve los circulos si cumplen los cuatro objetivos, en caso contrario el coilset optimizado si los cumple, y si ninguno lo logra, el que obtenga mejor puntuacion. Los ajustes se seleccionaron sobre una veintena de contornos de entrenamiento del dataset `proxima-fusion/coilstellaration`.

## Capacidades

- Generacion de coilsets para stellarators con tres periodos de campo y cinco bobinas por medio periodo (pista `fixed_shape`).
- Salida de geometria de bobina en coeficientes de Fourier de orden 7, en el layout de DESC `[sin(7) .. sin(1), const, cos(1) .. cos(7)]`, con forma `[5, 15]` por coordenada.
- Salida de corrientes por bobina en amperios, forma `[5]`.
- Optimizacion con restricciones de ingenieria: distancia minima bobina-bobina, distancia minima bobina-plasma, curvatura maxima y error de campo normalizado en el contorno.
- Ajuste adaptativo de objetivos: relajacion automatica de las metas cuando el error de campo solicitado es superior a 0.1.
- Fallback geometrico: seleccion entre coilset optimizado y circulos planares segun cumplimiento medido de los cuatro objetivos.
- Inferencia via onnxruntime con entradas `boundary_r_cos` y `boundary_z_sin` (float32, `[5, 9]`), `requirement_metrics` (float32, `[4]`) y escalares int64 `n_field_periods` (3) y `n_coils_per_half_period` (5).
- Metadato `supported_tracks` con valor `fixed_shape`.

## Casos de uso

- Exploracion de disenos de stellarator en fase conceptual: dado un contorno de plasma candidato, obtener rapidamente un coilset factible con corrientes para evaluar la viabilidad geometrica antes de pasar a codigos de optimizacion de mayor coste.
- Barrido parametrico de contornos: al ser un grafo ONNX ligero y determinista en su contrato de entrada, permite iterar sobre familias de contornos `boundary_r_cos`/`boundary_z_sin` en bucles automatizados y comparar los cuatro objetivos resultantes.
- Integracion en pipelines de evaluacion del benchmark Coilstellaration: el modelo cumple el contrato ONNX del benchmark y puede enviarse directamente al espacio de evaluacion `proxima-fusion/coilstellaration-bench`.
- Generacion de coilset inicial para refinamiento posterior: las salidas en coeficientes de Fourier y corrientes sirven como punto de partida para optimizadores de mayor fidelidad o para codigos de equilibrio como DESC, dado el layout compatible.
- Estudio de compromisos entre restricciones de ingenieria: modificando `requirement_metrics` se puede analizar como varian las distancias, la curvatura y el error de campo, util para decidir tolerancias de fabricacion.
- Prototipado educativo o de investigacion en fisica de plasmas computacional: el par `lm.py`/`wrap.py` documenta la construccion del optimizador en PyTorch y permite reproducir y modificar las etapas antes de reexportar a ONNX.
- Despliegue en entornos sin GPU ni stack de optimizacion: al ser un unico `model.onnx` ejecutable con onnxruntime, se puede correr en CPU dentro de servicios o cuadernos sin instalar frameworks de aprendizaje profundo completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB segun metadatos y el grafo es de tipo numerico de pequena dimension (entradas `[5, 9]`, `[4]` y salidas `[5, 15]`, `[5]`), por lo que es previsible que quepa en memoria de sistema sin GPU, aunque no se aportan cifras oficiales.
- GPU recomendadas: no disponibles; no se requiere GPU para onnxruntime en CPU segun la interfaz documentada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: onnxruntime (unica via documentada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card no publica tiempos de inferencia ni coste de los dieciseis pasos de Levenberg-Marquardt con doce iteraciones de gradiente conjugado por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phanerozoic/coilstellaration-coil-optimizer | Grafo ONNX (red + Levenberg-Marquardt) | no disponible | no aplica | MIT | Hugging Face, pista `fixed_shape` |
| proxima-fusion/coilstellaration-models (ensemble por bobina) | Red neuronal ONNX | no disponible | no aplica | MIT | Hugging Face, componente embebido en este modelo |
| Otros participantes del benchmark Coilstellaration | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos publicados de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-turno; cualquier uso linguistico queda fuera de su contrato.
- Solo cubre la pista `fixed_shape` con tres periodos de campo y cinco bobinas por medio periodo; otras configuraciones geometricas no estan soportadas segun el metadato `supported_tracks`.
- El modelo devuelve circulos planares como fallback si el coilset optimizado no cumple los cuatro objetivos; el usuario debe comprobar cual de las dos salidas se ha seleccionado antes de usar el resultado.
- La calidad depende de la red de primera aproximacion embebida y de los ajustes escogidos sobre una veintena de contornos de entrenamiento, lo que puede limitar la generalizacion a contornos fuera de esa distribucion.
- No se publican metricas de error, benchmarks ni tasas de exito del benchmark; no hay evidencia cuantitativa de rendimiento en la informacion disponible.
- Riesgo de sesgo hacia la distribucion del dataset `proxima-fusion/coilstellaration`; contornos atipicos pueden producir coilsets que incumplan las restricciones de ingenieria.
- La licencia MIT permite uso comercial, pero el modelo embebe el ensemble de `proxima-fusion/coilstellaration-models`, tambien MIT; conviene verificar la cadena de licencias de los datos de entrenamiento del dataset referenciado.
- El repositorio presenta 0 descargas y 0 likes, sin validacion externa de la comunidad en el momento de la consulta; tratar como artefacto de investigacion, no como componente de produccion validado.
- No se documentan requisitos de precision numerica ni comportamiento ante entradas fuera de rango (por ejemplo, `requirement_metrics` con valores negativos o inconsistentes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phanerozoic/coilstellaration-coil-optimizer
- Modelos base de Coilstellaration: https://huggingface.co/proxima-fusion/coilstellaration-models
- Benchmark Coilstellaration (espacio de evaluacion): https://huggingface.co/spaces/proxima-fusion/coilstellaration-bench
- Dataset de referencia: https://huggingface.co/datasets/proxima-fusion/coilstellaration
