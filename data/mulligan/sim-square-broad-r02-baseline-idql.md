# mulligan/sim-square-broad-r02-baseline-idql

## Resumen

sim-square-broad-r02-baseline-idql es un agente de control robotico entrenado con IDQL (Implicit Diffusion Q-Learning) para la tarea simulada `sim-square-broad`, dentro del proyecto de investigacion Mulligan. Se trata de una politica state-based: recibe observaciones de estado (no imagenes) y produce acciones de control, combinando un actor de difusion con un critico IQL escalar. El repositorio contiene, ademas de los pesos, los normalizadores estadisticos necesarios para la inferencia.

El modelo pertenece a la ronda R2 del brazo `baseline`, con celda de campana `sq_d1_r2_baseline_uniform_nocf_human_only`, lo que indica muestreo uniforme de estados iniciales, sin contrafactuales y solo con datos humanos. Se publican cinco semillas independientes (seed-1 a seed-5), todas entrenadas hasta el paso 250001, lo que permite medir la varianza entre ejecuciones.

Su relevancia es metodologica: Mulligan investiga como guiar la recoleccion de datos para que el entrenamiento de politicas sea mas eficiente, y este checkpoint actua como referencia frente a las variantes con seleccion basada en valor. La tasa de exito agregada sobre la rejilla de estados iniciales reservada es de 106608/150000 episodios (71,07 %), con un rango por semilla de 67,17 % a 74,27 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (diffusion policy) con critico IQL escalar; agente state-based |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el "contexto" lo define la observacion de estado de la tarea simulada, no una ventana de tokens) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de control robotico, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (pickle) + `stats.json` con normalizadores |
| Tarea | sim-square-broad |
| Ronda del modelo | R2 |
| Brazo | baseline |
| Celda de campana | `sq_d1_r2_baseline_uniform_nocf_human_only` |
| Semillas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

IDQL descompone el aprendizaje en dos componentes: un critico Q entrenado con Implicit Q-Learning (IQL), que evita consultar acciones fuera de la distribucion del dataset, y un actor de difusion que modela la distribucion de acciones de alto valor. En esta release el critico es escalar y la politica es un modelo de difusion que genera acciones por desruido iterativo. La variante es "state-based", es decir, la entrada son vectores de estado del simulador en lugar de observaciones visuales.

El entrenamiento se realizo con el codigo de investigacion de Mulligan en los commits indicados (`f287d9fd523f`, `e74e85956046`, `b7eb874de716`, `f01386d527ed`). Los datos proceden de cinco datasets: teleoperacion base (`sim-square-broad-c00-teleop-baseline`), rollouts de politica base en dos rondas (`c01` y `c02`) y datos DAgger base en esas mismas rondas (`c01-dagger-baseline`, `c02-dagger-baseline`). Cada checkpoint es una copia byte a byte del artefacto de Weights & Biases correspondiente, con MD5 verificado contra el manifiesto y SHA-256 registrado en `release.json`. No se documenta en la informacion disponible el numero total de transiciones, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO (categorias que, por otra parte, no aplican a este tipo de modelo).

## Capacidades

- Control robotico continuo en la tarea simulada `sim-square-broad`, con un unico checkpoint por semilla.
- Generacion de acciones mediante desruido de difusion condicionado al estado.
- Estimacion de valor de accion mediante critico IQL escalar (util para seleccion de acciones y para analisis offline).
- Reproducibilidad experimental: cinco semillas independientes al mismo paso de entrenamiento, lo que permite estimar varianza y comparar brazos con significancia estadistica.
- Inferencia offline sobre estados normalizados gracias a `stats.json`.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No soporta multiples idiomas ni procesamiento de texto: su dominio es exclusivamente el control en el simulador.
- No es multimodal: no procesa vision, audio ni lenguaje.

## Casos de uso

- Referencia de comparacion (baseline) en experimentos de recoleccion de datos: al fijar el paso 250001 y la celda `sq_d1_r2_baseline_uniform_nocf_human_only`, sirve para medir si una estrategia de muestreo basada en valor mejora la tasa de exito final.
- Evaluacion de varianza entre semillas: las cinco carpetas permiten cuantificar la dispersion del rendimiento (67,17 %-74,27 %) y decidir cuantos seeds adicionales hacen falta en campanas futuras.
- Generacion de datos sinteticos de politica: al ejecutarse en el simulador, sus rollouts pueden almacenarse como datasets de tipo `*-baseline-policy-rollouts` y reutilizarse en rondas posteriores de DAgger.
- Estudio de metodos offline-to-online: el par actor de difusion mas critico IQL permite analizar el efecto del desruido iterativo frente a politicas gaussianas en la misma tarea.
- Reproduccion de resultados publicados: al ser copias byte a byte de artefactos de W&B con hash verificado, permite auditar y replicar las cifras de la arena de politicas.
- Analisis de fallos por estado inicial: la evaluacion sobre rejilla reservada de estados iniciales permite localizar regiones del espacio de estados donde el agente falla sistematicamente, guiando la recoleccion de datos en esas zonas.
- Punto de partida para ajuste fino con DAgger: el checkpoint puede continuar entrenandose con datos de intervencion humana recogidos sobre sus propios rollouts.

## Benchmarks y rendimiento

Evaluacion sobre rejilla de estados iniciales reservada (held-out), 30000 rollouts por semilla, registrada en el dataset [sim-square-broad-r00-r03-eval](https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval):

| Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 30000 | 21551 | 71,84 % |
| seed-2 | 30000 | 22282 | 74,27 % |
| seed-3 | 30000 | 21455 | 71,52 % |
| seed-4 | 30000 | 20150 | 67,17 % |
| seed-5 | 30000 | 21170 | 70,57 % |
| **Agregado** | **150000** | **106608** | **71,07 %** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un agente de control robotico.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma oficial. Como referencia derivada del repositorio, 1,4 GB repartidos en cinco checkpoints implican del orden de 280 MB por semilla; una politica de este tipo (MLP de difusion y critico escalar) se ejecuta holgadamente en GPU consumer con 8 GB o incluso en CPU, aunque la cifra exacta de parametros y el pico de memoria no estan documentados.
- GPU recomendadas: no disponible. Dado el tamano, cualquier GPU con soporte PyTorch (RTX 3060 en adelante) deberia ser suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, con alta probabilidad, en cualquier GPU con 8 GB o mas. No confirmado por el autor.
- Opciones de despliegue: inferencia PyTorch directa cargando `policy.pt` y aplicando los normalizadores de `stats.json`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. La latencia dependera del numero de pasos de desruido del actor de difusion, que no se especifica en la informacion proporcionada.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch; deben cargarse unicamente en entornos de confianza.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r02-baseline-idql (este) | IDQL, actor de difusion + critico IQL, state-based | no disponible | no aplica | 71,07 % de exito agregado en sim-square-broad (150000 rollouts) | MIT | HuggingFace, 5 semillas |
| IDQL original (Hansen-Estruch et al.) | IDQL, actor de difusion + critico IQL | no disponible | no aplica | no disponible en la informacion recogida | no disponible | publicacion academica |
| Diffusion Policy (Chi et al.) | politica de difusion | no disponible | no aplica | no disponible en la informacion recogida | no disponible | publicacion academica |
| Variantes de Mulligan con seleccion basada en valor (p. ej. HiL-IDQL+Mulligan) | IDQL con recoleccion guiada | no disponible | no aplica | la pagina del proyecto reporta mejoras de 14-34 puntos porcentuales en tareas reales frente al baseline | no disponible | Mulligan |

Las cifras de los modelos comparados no se han podido verificar con los datos disponibles; se marcan como no disponibles para evitar extrapolaciones. La comparacion directa solo es valida dentro de la misma tarea (`sim-square-broad`) y el mismo paso de entrenamiento.

## Limitaciones y advertencias

- Dominio restringido: solo opera en la tarea simulada `sim-square-broad`. No hay evidencia de transferencia a otras tareas ni al mundo real en esta release.
- Entrada state-based: no procesa imagenes ni observaciones visuales; requiere acceso al vector de estado del simulador.
- Varianza entre semillas apreciable: 7,1 puntos porcentuales separan la mejor semilla (74,27 %) de la peor (67,17 %), por lo que cualquier conclusion debe basarse en el agregado, no en una sola semilla.
- Riesgo de sobreajuste a la rejilla de estados iniciales: la evaluacion se realiza sobre una rejilla fija reservada; el comportamiento fuera de esa distribucion no esta caracterizado.
- Sesgos del dataset: al ser un brazo "human_only" sin contrafactuales, la politica hereda las limitaciones y sesgos de las demostraciones de teleoperacion base.
- Seguridad al cargar: los checkpoints son pickles de PyTorch; cargarlos implica ejecucion de codigo arbitrario si el fichero fuese manipulado. Verificar `release.json` (SHA-256) antes de usarlos.
- Sin datos de licencia de terceros: aunque el modelo se publica bajo MIT, las dependencias del entorno de simulacion y del codigo de entrenamiento pueden tener sus propias condiciones.
- Uso comercial: la licencia MIT lo permite, pero no se documentan garantias de rendimiento ni soporte.
- Ausencia de documentacion: no se publican numero de parametros, arquitectura detallada, hiperparametros, composicion del dataset ni curva de aprendizaje.
- Fechas de publicacion inusualmente avanzadas (creado 2026-09-28) y cero descargas al momento de la ficha, por lo que no existe todavia validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-baseline-idql
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Pagina del proyecto Mulligan: https://mulligan.page/
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-baseline-policy-rollouts
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-baseline
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-baseline-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-baseline
- Dataset DAgger c02 (variante Mulligan): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mulligan
- Busqueda de datasets de la familia: https://huggingface.co/datasets?other=sim-square-broad
