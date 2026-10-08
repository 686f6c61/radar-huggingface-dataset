# Nadeem-Shoukath115113/spiral-so101-rlt12-lehome-r1-demos57-rm1-b30-bs32-5k-clr1e4

## Resumen

SPIRAL es un componente de aprendizaje por refuerzo residual para robótica: un actor residual acompañado de un ensemble de cinco críticos, entrenado sobre una política base π₀.₅ + RLT que permanece congelada. Lo publica el usuario Nadeem-Shoukath115113 en Hugging Face y corresponde a la ronda 1 de la etapa 3 del pipeline «rlt12», implementando el algoritmo 1, etapa 2b, del artículo SPIRAL: las 57 demostraciones de teleoperación se etiquetan con el modelo de recompensa RM1 y después se ejecuta una única actualización offline. No es un modelo de lenguaje ni un VLA completo, sino el delta de refinamiento que se aplica sobre la política base `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k` (paso 9999), que no se incluye en este repositorio.

El artefacto ocupa 0.4 GB e incluye dos checkpoints (pasos 2500 y 4999, este último final) en formato orbax, más la matriz `action_cholesky.npy` que define el ruido correlacionado con el que fue entrenado el actor. La dimensión de acción es 12 (sin padding, todos los deltas), el horizonte es 20 y las características de entrada combinan el vector latente RLT `z_rl` (2048 dimensiones) con el estado (12 dimensiones), lo que da 2060 entradas por red. El actor y cada crítico son MLP de 3×1024 con una escala de salida residual de 0.1, lo que explica que el residual entrenado se mantenga muy pequeño (norma ≈0.0012 al final del entrenamiento) y modifique solo ligeramente las acciones de la política base.

Su relevancia es de investigación: demuestra un esquema de RL residual offline sobre un VLA congelado con horizonte de acción, ensemble de críticos y muestreo de ruido correlacionado, un detalle poco habitual que la propia model card señala como fuente silenciosa de fallos si no se respeta. El autor indica explícitamente que el modelo no ha sido evaluado en robot («Not robot-evaluated»), por lo que debe tratarse como un artefacto de experimentación reproducible y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor residual + ensemble de 5 criticos, MLP de 3×1024 cada uno, sobre politica congelada π₀.₅ + RLT |
| Parametros totales | no disponible (la model card describe MLPs de 3×1024, sin recuento total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica robotica); horizonte de accion de 20 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no orientado a lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | orbax (`rl_state`) con `rl_config.json`; `action_cholesky.npy` (NumPy) |
| Dimension de accion | 12 (sin padding, todos deltas) |
| Entradas | RLT `z_rl` (2048) + estado (12) |
| Criticos | 5 (ensemble), kappa = 4, tau = 0.005 |
| Tamano del repositorio | 0.4 GB |
| Checkpoints incluidos | `step_00002500`, `step_00004999` (final) |

## Arquitectura y entrenamiento

La pieza entrenada aquí no es el VLA, sino un módulo residual. Sobre la política base congelada π₀.₅ + RLT (que debe descargarse aparte, con sus `vla_params` y `rlt_params` en el paso 9999), se aprende un actor MLP de 3×1024 que recibe el latente RLT de 2048 dimensiones y el estado de 12 dimensiones, y emite una corrección de la acción con escala 0.1. El aprendizaje usa un ensemble de cinco críticos MLP de 3×1024 con objetivo mixto: 0.5 de retorno Monte Carlo y 0.5 de diferencia temporal, con gamma 0.9995 y suavizado de objetivo (sigma 0.2, clip 0.5). El regularizador de BC tiene beta = 30, lo que penaliza desviaciones grandes respecto de la política base.

Los datos son `local/demos57_rm1g58`: 57 demostraciones de teleoperación, 18.189 fotogramas, etiquetadas por el modelo de recompensa SARM2 RM1 (`sarm2_gripper58`) y sin recompensas negativas. El valor terminal se fija en 1.0 porque todas las demostraciones tienen éxito, de modo que el retorno Monte Carlo equivale a gamma elevado al número de pasos restantes. El entrenamiento usa batch 32 y 5000 pasos con learning rate 1e-4 tanto para actor como para crítico, y se ejecuta una sola actualización offline. La innovación técnica destacable es el ruido correlacionado (activado, beta 0.5) mediante una matriz de Cholesky de 240×240 pre-reducida, idéntica al sidecar del checkpoint base; la model card insiste en servir el modelo con esa misma matriz (`noise_cholesky_path=action_cholesky.npy`) y nunca con la matriz cruda de `norm_stats.json`.

## Capacidades

- Generacion de acciones residuales de manipulacion robotica sobre una politica π₀.₅ + RLT congelada, en lugar de texto o codigo.
- Aprendizaje por refuerzo residual offline: ajusta la politica base a partir de demostraciones etiquetadas por un modelo de recompensa.
- Ensemble de cinco criticos con estimacion mixta Monte Carlo / diferencia temporal, util para reducir la varianza en el estimador de valor.
- Muestreo con ruido correlacionado (matriz de Cholesky de 240×240, beta 0.5), coherente con el ruido visto durante el entrenamiento.
- Operacion en espacio de acciones de 12 dimensiones sin padding y horizonte de 20 pasos.
- No soporta tool calling, function calling, razonamiento multi-paso textual, vision, audio ni capacidades multilingues; no es un modelo de proposito general.

## Casos de uso

- Refinamiento de una politica VLA existente: partiendo de `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k`, este actor residual permite ajustar el comportamiento del brazo SO-101 con 57 demostraciones y una sola actualizacion offline, sin reentrenar el VLA completo.
- Investigacion en RL residual: sirve para reproducir el algoritmo 1 (etapa 2b) del articulo SPIRAL y comparar variantes de beta, kappa o tamano de ensemble de criticos.
- Estudio del etiquetado por modelo de recompensa: al usar recompensas RM1 (`sarm2_gripper58`) sin valores negativos, es un banco de pruebas para analizar como influye la calidad del reward model en el residual aprendido.
- Analisis de ruido correlacionado en RL: el par `action_cholesky.npy` mas el actor permite medir el impacto de servir con ruido correlacionado frente a ruido aleatorio simple.
- Replicacion de experimentos con checkpoints intermedios: los pasos 2500 y 4999 permiten trazar la evolucion de la perdida del critico, el Q medio y la norma del residual.
- Formacion y docencia: como ejemplo compacto (0.4 GB) de integracion de orbax, configuracion RL y checkpoints por etapas en un pipeline de robotica.
- Punto de partida para una futura ronda de SPIRAL, ya que la propia nomenclatura del repositorio indica que es la «round 1» de la etapa 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluacion en robot (la model card indica «Not robot-evaluated»). Lo unico aportado son las metricas de entrenamiento del registro:

| Paso | Perdida del critico | Q medio | Q(actor) − Q(base) | Norma del residual |
|---|---|---|---|---|
| 100 | 0.177 | 0.264 | 0.0004 | 0.0089 |
| 2500 | 0.0008 | 0.883 | 0.0001 | 0.0013 |
| 4900 | 0.0006 | 0.880 | 0.0001 | 0.0012 |

La norma del residual permanece muy baja, lo que indica que el actor modifica solo ligeramente las acciones de la politica base.

## Requisitos de hardware

- El repositorio ocupa 0.4 GB, pero la politica base π₀.₅ + RLT (no incluida) es la que domina los requisitos de memoria; su VRAM no se especifica en la informacion disponible.
- El actor y los cinco criticos son MLP de 3×1024 con 2060 entradas y 12 salidas, por lo que su coste de memoria e inferencia es marginal frente a la politica base.
- GPU recomendadas: no disponible en la informacion proporcionada; el runtime es JAX/orbax, por lo que se requiere hardware compatible con JAX y con el resto del stack de la politica base.
- Encaje en GPU de consumo: no confirmado; depende enteramente del VLA base, cuyos requisitos no se detallan en este repositorio.
- Opciones de despliegue: el checkpoint se sirve mediante el codigo de la rama `lehome-noise-norm`, cargando `rl_config.json` y `rl_state` (orbax) y pasando `noise_cholesky_path=action_cholesky.npy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Trazabilidad de entrenamiento: los registros estan en Weights & Biases, proyecto `spiral-rlt12`, ejecucion `2exgh3ed`.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros actores residuales, ensembles de criticos ni politicas π₀.₅ + RLT comparables, y la busqueda web realizada no devolvio informacion relevante sobre este modelo ni sobre alternativas de la misma categoria.

## Limitaciones y advertencias

- No ha sido evaluado en robot («Not robot-evaluated»): no hay evidencia publicada de exito en tareas reales con el brazo SO-101.
- Requiere obligatoriamente la politica base `Nadeem-Shoukath115113/pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k` en el paso 9999, con `vla_params` y `rlt_params`, que no se incluyen en este repositorio.
- Necesita el codigo de la rama `lehome-noise-norm`; sin el, el checkpoint no puede ejecutarse correctamente.
- Debe servirse con la misma matriz de Cholesky (`noise_cholesky_path=action_cholesky.npy`) y con la version pre-reducida de este repositorio, nunca con la cruda de `norm_stats.json`. Si se sirve con ruido aleatorio simple, el actor recibe un regimen de ruido distinto al del entrenamiento y la model card advierte de que no habra ningun aviso de error.
- Entrenado sobre un unico conjunto de 57 demostraciones (18.189 fotogramas) de un SO-101 concreto; no hay evidencia de generalizacion a otras morfologias, camaras o entornos.
- El conjunto de datos no contiene recompensas negativas y el valor terminal se fija en 1.0 asumiendo que todas las demostraciones tienen exito; esto sesga la estimacion de valor hacia escenarios sin fallo.
- El residual aprendido es muy pequeno (norma ≈0.0012), por lo que la mejora esperada sobre la politica base es limitada por construccion.
- Licencia Apache-2.0: permite uso comercial del artefacto, pero la politica base y el codigo de la rama requerida pueden tener sus propias condiciones, que deben verificarse por separado.
- Es un artefacto de investigacion con cero descargas y cero «likes» en el momento de la consulta; no hay comunidad ni soporte documentado mas alla de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-lehome-r1-demos57-rm1-b30-bs32-5k-clr1e4
- Politica base requerida: https://huggingface.co/Nadeem-Shoukath115113/pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k
- Registro de entrenamiento en Weights & Biases: proyecto `spiral-rlt12`, ejecucion `2exgh3ed` (no se ha proporcionado URL directa)
- Paper de SPIRAL: no disponible en la informacion proporcionada
- Repositorio de codigo de la rama `lehome-noise-norm`: no disponible en la informacion proporcionada
