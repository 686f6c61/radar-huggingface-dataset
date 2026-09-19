# hmkang/frontier_demo_gr00t_n17_allex_v1v6_enc

## Resumen

Este repositorio de HuggingFace, publicado por el usuario hmkang, contiene lo que su model card describe como GR00T N1.7-3B, un modelo de la familia GR00T orientado a control robótico (espacio de acciones de 50 dimensiones, entrada visual estéreo y horizonte de predicción de 24 pasos). El nombre del modelo indica 3.000 millones de parámetros y la model card lo describe como un "frontier demo" entrenado sobre un conjunto de datos denominado allex merged v1..v6 (480 episodios).

El aspecto mas relevante del repositorio es que no contiene pesos utilizables: todos los ficheros estan cifrados con AES-256-CBC mediante `openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt`, con un fichero `.enc` por cada fichero original y sin compresion. El autor indica explicitamente que los pesos "frontier-trained" no se publican en claro y que el repositorio es publico unicamente para que el equipo pueda localizarlo; su contenido requiere una clave externa. Se trata, por tanto, de un artefacto de investigacion restringido y no de un modelo desplegable.

El repositorio ocupa 20,8 GB, tiene 0 descargas y 0 "likes" en el momento de la consulta, y no declara licencia, idiomas ni pipeline. La model card tampoco documenta resultados de evaluacion ni detalles de arquitectura mas alla de la configuracion de entrenamiento y del espacio de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura interna; el nombre del modelo remite a la familia GR00T N1.7) |
| Parametros totales | 3.000 millones (3B), segun el nombre del modelo; no confirmado en la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ficheros del repositorio son pesos cifrados, no cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors cifrados; cada fichero se almacena como `.enc` (AES-256-CBC con PBKDF2, 200.000 iteraciones, con salt) |
| Tamano del repositorio | 20,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-19 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (no se mencionan transformer, MoE, SSM ni componentes concretos de vision-lenguaje-accion). Lo que si documenta es el espacio de acciones y la configuracion de entrenamiento de la unica carpeta incluida, `A_eef_relative_q0199_h24_30k_2gpu/`: los brazos se controlan en modo EEF-RELATIVE con representacion rot6d, las manos y el cuello en modo ABSOLUTE y la cintura (waist) queda excluida; el espacio de estado y accion es de 50 dimensiones y el horizonte de prediccion es de 24 pasos. La entrada visual consiste en dos vistas ego estereo a resolucion 256.

El entrenamiento se realizo en 2 GPU con batch global de 32, 30.000 pasos y `state dropout` de 0,3. La receta de aumento de datos se indica como portada desde la receta "WAM mim-only" mediante la variable `GR00T_MIMONLY_AUG=1`. El conjunto de datos es "allex merged v1..v6" con 480 episodios. La normalizacion aplicada es q01/q99 (percentiles 1% y 99%) para todas las claves: los brazos leen `meta/relative_stats.json` a partir de una superposicion 1/99 del dataset, en lugar del fichero 0.1/99.9 usado en ejecuciones anteriores, y el autor afirma haber verificado en tiempo de ejecucion que las cinco claves de estado y las cinco de accion resuelven su par (min, max) desde un array q01/q99.

Un dato relevante para la reproducibilidad es que el estado del optimizador, el RNG y el scheduler no estan incluidos en el repositorio, por lo que no es posible reanudar el entrenamiento exactamente desde estos checkpoints. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, RLHF o DPO).

## Capacidades

- Generacion de acciones de control robotic: produce vectores de accion de 50 dimensiones con horizonte de prediccion de 24 pasos, segun la configuracion documentada.
- Control de brazos en espacio EEF relativo con representacion rot6d.
- Control absoluto de manos y cuello; la cintura queda excluida del espacio de accion.
- Percepcion visual estereo: consume dos vistas ego a resolucion 256.
- Robustez parcial a la ausencia de estado: el entrenamiento usa `state dropout` de 0,3, aunque la model card no documenta el efecto medido de esta tecnica.
- Soporte de tool calling / function calling: no disponible (no documentado; no es una capacidad esperable en un modelo de politica robotica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponibles. La unica modalidad documentada es visual estereo mas accion.

## Casos de uso

- Replicacion de experimentos de manipulacion con la receta documentada: un equipo con la clave de descifrado puede reproducir el entrenamiento de 30.000 pasos sobre el dataset allex merged v1..v6 en 2 GPU, usando la configuracion EEF relativa con horizonte 24.
- Evaluacion de politicas de manipulacion bimanual: el espacio de accion de 50 dimensiones con brazos en EEF relativo y manos en absoluto encaja en tareas de manipulacion con efector final, donde el control relativo mejora la generalizacion entre poses iniciales.
- Investigacion en sim-to-real: la entrada estereo ego a 256 y el horizonte de 24 pasos permiten evaluar politicas entrenadas en simulacion antes de transferirlas a un robot real, aunque la model card no aporta resultados de transferencia.
- Estudio de recetas de aumento de datos: el uso de `GR00T_MIMONLY_AUG=1`, portado de la receta WAM mim-only, sirve como base para comparar el efecto del aumento sobre el rendimiento de la politica en un mismo dataset.
- Analisis del efecto de la normalizacion por percentiles: el autor documenta el cambio de 0.1/99.9 a q01/q99 y su verificacion en tiempo de ejecucion, lo que permite estudiar como afecta el recorte de colas a la estabilidad del entrenamiento de acciones.
- Punto de partida para fine-tuning en tareas propias: los checkpoints cifrados, una vez descifrados, pueden servir como inicializacion para nuevas tareas de manipulacion, siempre que se respete la receta de normalizacion (`meta/relative_stats.json`) para evitar desajustes entre entrenamiento e inferencia.
- Auditoria de artefactos de investigacion: el repositorio ilustra un patron de publicacion con pesos cifrados y clave externa, util como caso de estudio sobre trazabilidad y control de acceso en modelos de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito de tarea, tasas de exito en simulacion, errores de posicion ni comparaciones cuantitativas con otros checkpoints de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Como referencia aritmetica a partir del tamano declarado (3.000 millones de parametros), los pesos en FP32 ocuparian del orden de 12 GB, en FP16/BF16 del orden de 6 GB y en int8 del orden de 3 GB, a lo que habria que anadir la memoria de activaciones y del codificador visual, no cuantificada en la informacion disponible. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados.
- GPU recomendadas: no disponible. El unico dato de hardware de la model card se refiere al entrenamiento (2 GPU).
- Compatibilidad con GPU de consumo: no confirmada. Por tamano de parametros, una GPU con 24 GB (por ejemplo, RTX 3090 o RTX 4090) seria suficiente para inferencia en FP16 segun la estimacion anterior, pero la model card no lo verifica y el repositorio no incluye instrucciones de despliegue.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El unico procedimiento descrito es el descifrado de ficheros con `openssl` y la estructura de carpetas por checkpoint (`checkpoint-XXXXX/` y `experiment_cfg/`).
- Latencia y throughput: no disponibles.
- Requisito previo imprescindible: disponer de la clave de descifrado. Sin ella, los pesos no son utilizables en ninguna GPU.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificados de otros modelos, por lo que no es posible establecer una comparativa cuantitativa. La categoria comparable seria la de modelos fundacionales de vision-lenguaje-accion para manipulacion robotica (por ejemplo, la propia familia GR00T N1 de NVIDIA, OpenVLA o pi-0), pero no se dispone de parametros, longitud de contexto, resultados o licencias verificados en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en la informacion disponible |
|---|---|---|---|---|
| GR00T N1.7-3B (este repositorio) | 3B segun el nombre; no confirmado | no disponible | no disponible | Pesos cifrados, requieren clave |
| Alternativas de la misma categoria (GR00T N1, OpenVLA, pi-0) | no disponible | no disponible | no disponible | No evaluadas en la informacion proporcionada |

## Limitaciones y advertencias

- Pesos inutilizables sin la clave: todos los ficheros estan cifrados con AES-256-CBC y PBKDF2 (200.000 iteraciones). El repositorio es publico solo como mecanismo de localizacion para el equipo; no es un modelo descargable y ejecutable.
- Ausencia de licencia: no se declara licencia, por lo que no hay base legal explicita para uso comercial ni para redistribucion, ni siquiera tras el descifrado.
- Sin resultados de evaluacion: no hay benchmarks, tasas de exito ni comparaciones con checkpoints previos, lo que impide estimar su calidad.
- Sin documentacion de arquitectura: no se especifican el backbone, el mecanismo de atencion ni los detalles del cabezal de acciones, lo que dificulta auditar el modelo.
- Reproducibilidad incompleta: el estado del optimizador, el RNG y el scheduler no estan incluidos, de modo que no se puede reanudar el entrenamiento exactamente.
- Dependencia critica de la normalizacion: el modelo espera estadisticas q01/q99 leidas de `meta/relative_stats.json`. Usar el fichero 0.1/99.9 de ejecuciones anteriores (o no pasar correctamente la configuracion de percentiles) produciria un desajuste entre el rango de acciones esperado y el real.
- Espacio de accion restringido: la cintura (waist) queda excluida; el control de brazos es relativo al efector final, lo que limita su uso directo en plataformas o tareas que requieran control absoluto de brazo o movilidad de torso.
- Riesgo de sobreajuste al dataset: 480 episodios y 30.000 pasos en 2 GPU es una escala reducida; no hay evidencia de generalizacion a entornos no vistos.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026) no coinciden con el momento habitual de consulta, y el campo de pipeline aparece como no disponible pese a que las etiquetas del repositorio incluyen `safetensors` cuando los ficheros reales estan cifrados.
- Sin validacion comunitaria: 0 descargas y 0 likes, sin issues ni discusion publica que permitan contrastar su comportamiento.
- Sesgos: no disponibles; no se documenta ninguna evaluacion de sesgo, y en un modelo de politica robotica los sesgos relevantes serian de distribucion de tareas y de morfologia del robot, no evaluados aqui.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hmkang/frontier_demo_gr00t_n17_allex_v1v6_enc
- Comando de descifrado indicado por el autor (incluido en la model card): `openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass file:/path/to/key.txt`
- Paper, blog, repositorio de codigo o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos correspondian a paginas de soporte de Microsoft y no guardan relacion con este repositorio).
