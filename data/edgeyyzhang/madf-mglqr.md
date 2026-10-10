# edgeyyzhang/madf-mglqr

## Resumen

MADF-MGLQR no es un modelo de lenguaje, sino una coleccion de checkpoints de politicas de aprendizaje por refuerzo entrenadas con MADF (multi-agent diffusion/flow policy) sobre el entorno MGLQR (multi-goal max-entropy linear quadratic regulator). Lo publica el usuario edgeyyzhang en HuggingFace como material de reproducibilidad asociado a la rama `maxEntLQR` del repositorio https://github.com/edgeyyzhang/madf. Se trata de un artefacto de investigacion de 0,1 GB, no de un modelo generativo de proposito general.

El entorno MGLQR es un sistema lineal 2-D deterministico `x_{t+1} = x_t + u_t` con horizonte T = 5, acciones recortadas a [-1, 1]^2, recompensa de etapa `-1/2 |u|^2` y una recompensa terminal definida como un log-sum-exp (minimo suave) sobre cuatro costes cuadraticos situados en `(±2, 0)` y `(0, ±2)`. La solucion optima max-ent es una mezcla multimodal de cuatro gaussianas LQR, lo que convierte el benchmark en una prueba controlada de si una politica de difusion/flujo es capaz de representar multimodalidad y de aproximar una densidad conocida de forma exacta.

La relevancia del repositorio es metodologica: permite comparar, con suelo analitico conocido (retorno max-ent exacto, retorno greedy exacto y log-densidad exacta), tres variantes de entrenamiento (`mglqr`, `mglqrfix`, `mglqrfix2utd4`) y tres valores de temperatura `alpha` (0,05; 0,1; 0,2), con y sin correcciones de estabilidad de entrenamiento. Es util para quien investiga RL con politicas de difusion, control optimo con entropia maxima o evaluacion de politicas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion/flujo (MADF) para RL, implementada en JAX + Haiku; incluye actor de politica, `log_alpha` aprendido y dos funciones Q (`q1`, `q2`) en un esquema actor-critico con entropia maxima |
| Parametros totales | no disponible (el checkpoint empaqueta `(policy, log_alpha, q1, q2)` como parametros JAX/Haiku; la model card no declara el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el entorno tiene horizonte fijo T = 5 pasos y la observacion es `[x, t/T]` (3 dimensiones) |
| Tipos de cuantizacion | no disponible / no aplica (pesos en coma flotante para JAX; no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | pickle de parametros JAX/Haiku (`.pkl`); no se usa safetensors ni GGUF |

## Arquitectura y entrenamiento

MADF es un algoritmo de RL con politica expresada como modelo generativo de difusion/flujo, integrado en el paquete `relax` del autor (`relax/algorithm/madf.py`, `relax/network/madf_net.py`). El checkpoint final contiene cuatro grupos de parametros: la politica generativa, el `log_alpha` (temperatura de entropia maxima aprendida) y dos criticos Q. El agente opera sobre el entorno MGLQR, cuya solucion optima max-ent es analiticamente tratable mediante `relax/env/wrappers_mglqr.py::MultiGoalLQRSolver`, lo que permite medir simultaneamente retorno, entropia de modos y error de log-densidad frente a la referencia exacta.

No se detalla en la informacion disponible el numero de tokens, episodios o pasos de entorno consumidos durante el entrenamiento, ni la composicion de un dataset (es RL, no aprendizaje supervisado). Los identificadores de los runs indican configuracion experimental: `numparticle32` (32 particulas) y `qest30000` (30000 pasos de estimacion del critico), con `groups1`. Las variantes `mglqrfix` y `mglqrfix2utd4` introducen correcciones de entrenamiento; en el caso de `mglqrfix2utd4`, un ratio update-to-data de 2 con 4 actualizaciones, que reduce drasticamente el numero de pasos necesarios (73000 frente a 378000-391000) y mejora el retorno de -37,6 a -3,6 aproximadamente.

## Capacidades

- Generacion de acciones para un sistema de control lineal 2-D deterministico con horizonte T = 5.
- Representacion de politicas multimodales: la politica de flujo puede distribuir masa sobre varias metas simultaneamente en el estado de inicio simetrico.
- Aprendizaje por refuerzo con entropia maxima (max-ent RL) con temperatura `alpha` ajustable mediante `log_alpha` aprendido.
- Amortiguacion de la entropia de modos: en las variantes corregidas alcanza entropias de modo cercanas a 1,0 (`0,94`-`1,00`), frente a `0,49`-`0,50` en la variante `mglqr` sin corregir.
- Evaluacion dual: retorno por actuacion directa y retorno por muestreo del flujo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues: no es un modelo de lenguaje ni un modelo multimodal.
- No dispone de modo de razonamiento (thinking mode) ni de interfaz conversacional.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar `config.yaml` y el checkpoint `.pkl` con `create_madf_net` y reproducir los retornos publicados para verificar la implementacion de MADF en JAX/Haiku.
- Linea base para nuevos algoritmos de RL generativo: usar los retornos de referencia (`mglqr`, `mglqrfix`, `mglqrfix2utd4`) y los valores exactos max-ent/greedy para cuantificar la mejora de un algoritmo alternativo sobre el mismo entorno.
- Validacion de implementaciones de politicas de difusion/flujo: comprobar si una nueva politica recupera la mezcla multimodal de cuatro gaussianas LQR en `x = 0` mediante la metrica de entropia de modo y las fracciones de modo.
- Estudio de la temperatura de entropia maxima: los runs con `alpha` 0,05, 0,1 y 0,2 permiten medir como cambia el compromiso entre retorno y diversidad, con referencia exacta calculada para cada `alpha`.
- Analisis de estabilidad y eficiencia de muestreo: comparar `mglqrfix` y `mglqrfix2utd4` frente a `mglqr` para evaluar el efecto de las correcciones y del ratio update-to-data sobre el numero de pasos necesarios.
- Docencia en control optimo y RL: servir de ejemplo minimo y verificable de un problema LQR con multiples metas donde la solucion optima es analitica, util para ilustrar divergencias entre retorno actuado, retorno muestreado y optimo exacto.
- Banco de pruebas de inferencia JAX: al ser un modelo de parametros reducidos, permite medir latencia y throughput del pipeline de muestreo de flujo en distintas plataformas (CPU, GPU) sin depender de modelos grandes.

## Benchmarks y rendimiento

Resultados por run publicados en la model card (media ± desviacion estandar del retorno; `acting` = actuacion directa de la politica, `flow-sample` = muestreo del flujo). La columna de entropia de modo se mide en `x = 0`, con 1,0 equivalente a distribucion uniforme sobre las cuatro metas.

| Run (variante, alpha, semilla) | Paso ckpt | Retorno MADF acting | Retorno MADF flow-sample | Max-ent exacto | Greedy exacto | Entropia de modo | Fracciones de modo |
|---|---|---|---|---|---|---|---|
| mglqr, a=0.05, seed100 | 391000 | -37,606 ± 0,037 | -38,697 ± 0,036 | -0,647 | -0,376 | 0,50 | [0,53; 0,47; 0,0; 0,0] |
| mglqr, a=0.1, seed100 | 390000 | -37,670 ± 0,037 | -38,763 ± 0,036 | -0,977 | -0,446 | 0,50 | [0,54; 0,46; 0,0; 0,0] |
| mglqr, a=0.1, seed200 | 390000 | -37,665 ± 0,037 | -38,754 ± 0,036 | -0,977 | -0,446 | 0,50 | [0,55; 0,45; 0,0; 0,0] |
| mglqr, a=0.1, seed300 | 390000 | -37,700 ± 0,037 | -38,806 ± 0,036 | -0,977 | -0,446 | 0,49 | [0,60; 0,40; 0,0; 0,0] |
| mglqr, a=0.2, seed100 | 390000 | -37,788 ± 0,037 | -38,880 ± 0,036 | -1,577 | -0,584 | 0,50 | [0,54; 0,46; 0,0; 0,0] |
| mglqrfix2utd4, a=0.05, seed100 | 73000 | -3,631 ± 0,034 | -3,663 ± 0,036 | -0,647 | -0,376 | 0,97 | [0,22; 0,38; 0,24; 0,16] |
| mglqrfix2utd4, a=0.1, seed100 | 73000 | -3,699 ± 0,034 | -3,732 ± 0,036 | -0,977 | -0,446 | 0,97 | [0,22; 0,38; 0,24; 0,16] |
| mglqrfix2utd4, a=0.2, seed100 | 73000 | -3,833 ± 0,034 | -3,866 ± 0,036 | -1,577 | -0,584 | 0,97 | [0,22; 0,38; 0,24; 0,16] |
| mglqrfix, a=0.05, seed100 | 378000 | -2,141 ± 0,019 | -2,162 ± 0,018 | -0,647 | -0,376 | 0,98 | [0,19; 0,31; 0,30; 0,20] |
| mglqrfix, a=0.1, seed100 | 136000 | -2,273 ± 0,013 | -2,289 ± 0,012 | -0,977 | -0,446 | 0,58 | [0,02; 0,21; 0,72; 0,06] |
| mglqrfix, a=0.1, seed200 | 383000 | -2,471 ± 0,019 | -2,497 ± 0,019 | -0,977 | -0,446 | 1,00 | [0,21; 0,25; 0,29; 0,25] |
| mglqrfix, a=0.1, seed300 | 382000 | -2,369 ± 0,018 | -2,356 ± 0,019 | -0,977 | -0,446 | 0,94 | [0,37; 0,16; 0,14; 0,32] |
| mglqrfix, a=0.2, seed100 | 383000 | -2,357 ± 0,019 | -2,380 ± 0,018 | -1,577 | -0,584 | 0,98 | [0,19; 0,30; 0,31; 0,20] |

Agregado por variante y `alpha` (media ± desviacion estandar entre semillas):

| Variante | alpha | Semillas | Retorno MADF acting | Retorno MADF flow-sample | Max-ent exacto | Greedy exacto | Entropia de modo |
|---|---|---|---|---|---|---|---|
| mglqr | 0.05 | 1 | -37,606 ± 0,000 | -38,697 ± 0,000 | -0,647 | -0,376 | 0,498 ± 0,000 |
| mglqr | 0.1 | 3 | -37,678 ± 0,015 | -38,774 ± 0,023 | -0,977 | -0,446 | 0,493 ± 0,006 |
| mglqr | 0.2 | 1 | -37,788 ± 0,000 | -38,880 ± 0,000 | -1,577 | -0,584 | 0,498 ± 0,000 |
| mglqrfix | 0.05 | 1 | -2,141 ± 0,000 | -2,162 ± 0,000 | -0,647 | -0,376 | 0,981 ± 0,000 |
| mglqrfix | 0.1 | 3 | -2,371 ± 0,081 | -2,381 ± 0,087 | -0,977 | -0,446 | 0,838 ± 0,187 |
| mglqrfix | 0.2 | 1 | -2,357 ± 0,000 | -2,380 ± 0,000 | -1,577 | -0,584 | 0,982 ± 0,000 |
| mglqrfix2utd4 | 0.05 | 1 | -3,631 ± 0,000 | -3,663 ± 0,000 | -0,647 | -0,376 | 0,967 ± 0,000 |
| mglqrfix2utd4 | 0.1 | 1 | -3,699 ± 0,000 | -3,732 ± 0,000 | -0,977 | -0,446 | 0,967 ± 0,000 |
| mglqrfix2utd4 | 0.2 | 1 | -3,833 ± 0,000 | -3,866 ± 0,000 | -1,577 | -0,584 | 0,967 ± 0,000 |

Ademas, la model card publica la media del log-pdf exacto frente al del flujo en `x = 0`. En la variante `mglqrfix` con `alpha = 0,1` y semilla 100 la brecha es la menor (-0,18 frente a -0,89), mientras que en `mglqr` con `alpha = 0,05` la brecha es muy grande (-16,46 frente a -0,52), lo que indica una densidad de flujo mal calibrada. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark de lenguaje: no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. El repositorio completo ocupa 0,1 GB y la red es un conjunto de parametros JAX/Haiku de tamano reducido (actor de difusion mas dos criticos Q).
- GPU recomendadas: no se requiere GPU. Cualquier GPU NVIDIA compatible con CUDA y JAX (T4, RTX 3060 o superior, RTX 4090, A100, H100) acelera el muestreo del flujo, pero no es un requisito.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo y tambien se ejecuta en CPU.
- Opciones de despliegue: entorno Python con JAX y Haiku, cargando los modulos del repositorio `relax` (`relax/network/madf_net.py`, `scripts/eval_mglqr.py::build_agent`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni ningun servidor de inferencia de modelos de lenguaje, porque no es un transformer de texto.
- Latencia y throughput: no disponible. La model card no publica medidas de tiempo por paso ni de acciones por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. La busqueda web realizada no devolvio ningun resultado relevante (unicamente enlaces genericos a YouTube). La comparacion mas cercana posible es interna al propio repositorio:

| Variante | alpha | Pasos de checkpoint | Retorno MADF acting | Entropia de modo | Observacion |
|---|---|---|---|---|---|
| mglqr | 0.05 / 0.1 / 0.2 | 390000-391000 | -37,6 a -37,8 | 0,49-0,50 | Colapsa a dos modos y no reproduce la mezcla de cuatro metas |
| mglqrfix2utd4 | 0.05 / 0.1 / 0.2 | 73000 | -3,63 a -3,83 | 0,97 | Convergencia mucho mas rapida y mejor retorno, con fracciones de modo desequilibradas |
| mglqrfix | 0.05 / 0.1 / 0.2 | 136000-383000 | -2,14 a -2,47 | 0,58-1,00 | Mejor retorno y entropia de modo mas cercana a 1,0, pero con varianza entre semillas en `alpha = 0,1` |

Como referencia cuantitativa externa, la propia model card ofrece el optimo analitico del entorno: retorno max-ent exacto entre -0,647 y -1,577 y retorno greedy exacto entre -0,376 y -0,584 segun `alpha`. Ninguna de las politicas publicadas se aproxima a esos valores.

## Limitaciones y advertencias

- Dominio extremadamente restringido: se trata de politicas entrenadas para un unico entorno sintetico (MGLQR) de 2 dimensiones y horizonte 5. No son transferibles a otros entornos ni a tareas reales sin reentrenamiento.
- Brecha considerable frente al optimo: los mejores retornos de actuacion publicados (-2,14 en `mglqrfix`, `alpha = 0,05`) siguen lejos del max-ent exacto (-0,647) y del greedy exacto (-0,376) en ese mismo ajuste.
- Calibracion de la densidad deficiente en varias configuraciones: en `mglqr` con `alpha = 0,05` el log-pdf medio del flujo es -16,46 frente a -0,52 del exacto, lo que indica una densidad muy mal ajustada pese a que el retorno no es catastrofico.
- Multimodalidad no resuelta en la variante base: `mglqr` concentra la masa en dos de las cuatro metas (por ejemplo [0,53; 0,47; 0,0; 0,0]) con entropia de modo en torno a 0,50, cuando el valor correcto seria cercano a 1,0.
- Varianza entre semillas: en `mglqrfix` con `alpha = 0,1` y tres semillas, la entropia de modo va de 0,58 a 1,00 y el retorno de -2,273 a -2,471. Los resultados con una sola semilla (todas las configuraciones de `mglqr` y `mglqrfix2utd4`) no permiten estimar dispersion.
- Sin datos de sesgo, alucinacion o comportamiento en lenguaje: no aplica, ya que no hay generacion de texto ni procesamiento de lenguaje natural.
- Riesgo de reproducibilidad: la carga depende de que el usuario reconstruya la red con `relax/network/madf_net.py` y el `config.yaml` correspondiente; las versiones de JAX y Haiku pueden afectar a la compatibilidad del pickle.
- Licencia: MIT, permisiva y compatible con uso comercial, pero el material tiene valor practico limitado fuera de la investigacion y la docencia.
- Fechas de publicacion: el repositorio figura creado y actualizado en octubre de 2026, sin descargas ni likes registrados en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/edgeyyzhang/madf-mglqr
- Repositorio GitHub de MADF (rama `maxEntLQR`): https://github.com/edgeyyzhang/madf
- Ficheros y rutas citadas en la model card: `relax/algorithm/madf.py`, `relax/network/madf_net.py`, `relax/env/wrappers_mglqr.py::MultiGoalLQRSolver`, `scripts/eval_mglqr.py::build_agent`
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (enlaces genericos a YouTube y YouTube Music). No se han encontrado papers, blogs, demos ni repositorios adicionales sobre este modelo concreto.
