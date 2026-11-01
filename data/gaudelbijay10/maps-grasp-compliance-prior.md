# gaudelbijay10/maps-grasp-compliance-prior

## Resumen

MAPS (Maximum A Posteriori with a Scaled population prior) es un paquete de priors aprendidos y estimadores para la identificacion de la matriz de cumplimiento (compliance) de agarres roboticos en regimen de pocos datos. Lo desarrolla el autor gaudelbijay10 como artefacto reproducible del articulo *Few-Shot Grasp Compliance Identification Across Robot Hands*. El problema que resuelve es concreto: la matriz de cumplimiento `C` (6x6) que relaciona una carga aplicada sobre un objeto agarrado con su desplazamiento requiere, con un ajuste clasico por minimos cuadrados con restriccion PSD, al menos siete cargas independientes; MAPS estima `C` a partir de tan solo tres cargas apoyandose en un prior poblacional aprendido de otros agarres y otras manos.

No hay red neuronal ni pesos de transformer: el artefacto es un conjunto de tensores NumPy (medias 6x6 y covarianzas 21x21 sobre las entradas triangulares superiores de `C`) mas ficheros JSON de hiperparametros seleccionados por presupuesto de cargas K. Incluye ademas un modulo `maps.py` con los estimadores MAPS y S-MAP, el metrico de error del articulo y un script de reproduccion. Es relevante para quien trabaje en identificacion de sistemas aplicada a manipulacion, control compliant y sim-a-real, porque ofrece una receta estadistica ligera, determinista y verificada numericamente contra los resultados publicados.

El alcance es exclusivamente simulacion: cinco manos en MuJoCo y cuatro en Isaac Sim/PhysX. La licencia MIT y el formato safetensors facilitan su inspeccion y reutilizacion, aunque la validacion en hardware real queda fuera de lo publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; estimador bayesiano MAP con prior poblacional gaussiano sobre matrices de compliance 6x6 restringidas a PSD |
| Parametros totales | no disponible (no aplica; el artefacto son tensores de medias 6x6 y covarianzas 21x21 por mano y semilla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (tensores float en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (tensores NumPy) y JSON de settings; codigo Python en `maps.py` y `example.py` |
| Libreria | numpy |
| Pipeline declarado | robotics |
| Tamano del repositorio | 0.0 GB |
| Corpus incluidos | `randomized_mujoco`, `matched_mujoco`, `isaac_physx` |
| Manos evaluadas | SBIR, Franka, Robotiq 2F-85, LEAP, Allegro (MuJoCo); Allegro, DEXEE, LEAP, SBIR (Isaac Sim/PhysX) |
| Presupuestos de cargas K | 1, 3, 5, 7, 10, 20 (MuJoCo); 1, 3, 5, 7, 10, 15, 20 (Isaac) |
| Dataset asociado | gaudelbijay10/grasp-compliance-sim |

## Arquitectura y entrenamiento

El modelo estadistico subyacente es `response ~= C @ wrench + b`, donde `C` es la matriz 6x6 de compliance y `b` el drift del agarre al asentarse. MAPS resuelve un problema MAP: busca la `C` PSD y el `b` que mejor ajustan las K cargas observadas, con una penalizacion hacia la media del prior poblacional, previamente reescalada a la blandura global del agarre concreto. S-MAP (selective MAP) relaja el prior cuando las cargas lo contradicen y lo elimina por completo cuando la validacion leave-one-out sobre las K cargas favorece minimos cuadrados PSD sin prior. Los hiperparametros por presupuesto K son `n0`, `n_b`, `covariance_shrinkage`, `scale_from_support`, `tau` y `ratio`.

El "entrenamiento" consiste en identificar la distribucion poblacional de las entradas triangulares superiores de `C` (21 componentes) a partir de los agarres de otras manos, en esquema leave-one-hand-out. Para `randomized_mujoco` se usan 331 agarres de entrenamiento y 81 de validacion (semilla de muestreo 20260820); para `matched_mujoco`, 371 y 58; para `isaac_physx`, 110 y 35 (semilla 0). Los priors `all/mean` y `all/covariance` se ajustan con todas las manos del corpus y estan pensados para una mano fuera del corpus, no para evaluacion interna. La verificacion reportada alcanza diferencias relativas maximas de 8.1e-13, 8.5e-13 y 1.1e-12 en los operadores ajustados, y coincidencia de error medio dentro de 1e-9 en folds completos con K=3.

## Capacidades

- Estimacion de la matriz de compliance 6x6 y del drift `b` de un agarre a partir de K cargas, con K tan bajo como 3.
- Estimacion MAP con prior poblacional escalado a la blandura del agarre (MAPS).
- Estimacion selectiva que debilita o descarta el prior segun validacion leave-one-out sobre las K cargas (S-MAP), devolviendo la eleccion entre `"map"` y `"psd"`.
- Calculo del metrico de error del articulo (`maps.nrmse`), con rotaciones escaladas por la longitud caracteristica `ell` del agarre para hacer comparables traslaciones y rotaciones.
- Generacion de las particiones (draws) del articulo y evaluacion sobre cargas retenidas.
- Reproduccion de folds completos por linea de comandos (`example.py --corpus ... --hand ... --k ...`).
- Soporte de multiples manos y corpus via claves `<hand>/<seed>/mean` y `<hand>/<seed>/covariance`.
- No incluye tool calling, agentes, capacidades multilingues, vision ni audio: no es un modelo generativo.

## Casos de uso

- Identificacion rapida de compliance en bancos de agarre: con solo tres cargas medidas por agarre se obtiene una `C` PSD utilizable, lo que reduce el tiempo de experimentacion frente al minimo de siete cargas del ajuste clasico.
- Control compliant en simulacion: usar la `C` estimada para ajustar ganancias de impedancia o admitancia de un controlador de agarre en MuJoCo o Isaac Sim antes de transferir la politica.
- Priors para una mano nueva: emplear `all/mean` y `all/covariance` como punto de partida para una mano fuera del corpus, con los settings de `["all"]["all"][K]`, y refinar con pocas cargas reales.
- Sim-a-real con datos escasos: en hardware donde medir cargas es caro, el prior poblacional actua como regularizador y permite estimaciones con presupuestos de medidas muy bajos.
- Benchmarking de estimadores: `maps.py` y `verification.json` permiten comparar MAPS, S-MAP y minimos cuadrados PSD bajo el mismo metrico `nrmse` en los tres corpus publicados.
- Docencia e investigacion reproducible: `example.py` reproduce un fold del articulo y compara el error medio calculado con el publicado, util para validar instalaciones y pipelines.
- Seleccion de presupuesto experimental: los settings por K permiten decidir a priori cuantas cargas merece la pena medir para alcanzar un error objetivo en una mano y corpus dados.

## Benchmarks y rendimiento

Resultados de error `nrmse` (1.0 equivale a predecir ausencia de movimiento) con K=3, tomados de la verificacion del autor:

| Corpus | Mano retenida | MAPS | S-MAP | Minimos cuadrados PSD |
|---|---|---:|---:|---:|
| `randomized_mujoco` | SBIR (semilla 20260820) | 0.323 | 0.323 | 0.565 |
| `matched_mujoco` | SBIR (semilla 20260820) | 0.841 | 0.859 | 0.980 |
| `isaac_physx` | Allegro (semilla 0) | 0.485 | 0.485 | 0.622 |

Cobertura de la verificacion:

| Corpus | Manos retenidas | Folds | K | Operadores comprobados | Diferencia relativa maxima |
|---|---|---:|---|---:|---:|
| `randomized_mujoco` | SBIR, Franka, Robotiq 2F-85, LEAP, Allegro | 25 | 1, 3, 5, 7, 10, 20 | 240 | 8.1e-13 |
| `matched_mujoco` | SBIR, Franka, Robotiq 2F-85, LEAP | 20 | 1, 3, 5, 7, 10, 20 | 192 | 8.5e-13 |
| `isaac_physx` | Allegro, DEXEE, LEAP, SBIR | 20 | 1, 3, 5, 7, 10, 15, 20 | 96 | 1.1e-12 |

No se han publicado en la informacion disponible resultados completos por mano y por K, ni comparaciones con otros metodos de identificacion de compliance distintos de los minimos cuadrados PSD.

## Requisitos de hardware

- Inferencia en CPU: el estimador es NumPy puro; no requiere GPU. Los tensores son de 6x6 y 21x21, con un peso despreciable en memoria.
- VRAM estimada: 0 GB; el repositorio ocupa 0.0 GB.
- GPU recomendadas: no aplica. Cualquier CPU moderna ejecuta los folds en tiempos irrelevantes frente al coste de simulacion.
- Cabe en cualquier consumer GPU y en cualquier portatil, aunque no la necesita.
- Opciones de despliegue: script Python directo (`python example.py`), importacion de `maps.py` como modulo, o integracion en pipelines de simulacion MuJoCo/Isaac Sim. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible de forma explicita; el cuello de botella realista es la generacion de los datos de simulacion, no el ajuste.
- Dependencias: `numpy`, `pyarrow`, `safetensors`, `huggingface_hub`.

## Comparativa con modelos similares

| Criterio | MAPS (este artefacto) | Minimos cuadrados PSD (baseline del articulo) | Identificacion clasica de compliance con >=7 cargas |
|---|---|---|---|
| Enfoque | MAP bayesiano con prior poblacional | Ajuste PSD sin prior | Ajuste por minimos cuadrados con cargas suficientes |
| Cargas minimas | 3 | 3 (con error mayor) | 7 |
| Error K=3 (`randomized_mujoco`, SBIR) | 0.323 | 0.565 | no disponible en la informacion |
| Error K=3 (`isaac_physx`, Allegro) | 0.485 | 0.622 | no disponible en la informacion |
| Necesita datos de otras manos | Si (prior poblacional) | No | No |
| Licencia | MIT | no disponible | no disponible |
| Disponibilidad | Publico en HuggingFace | Implementado en `maps.py` | no disponible |

No se han identificado en la informacion proporcionada otros paquetes publicos comparables de priors aprendidos para compliance de agarre.

## Limitaciones y advertencias

- Todos los resultados son en simulacion (MuJoCo e Isaac Sim/PhysX, seis manos en total); el uso en hardware real no ha sido evaluado.
- La evaluacion es intra-motor: cada prior se prueba en una mano retenida del mismo motor y protocolo de recogida; el uso cruzado entre motores no esta validado.
- Los priors `all/*` usan todas las manos del corpus, por lo que no queda ninguna mano para testearlos; estan pensados para manos externas al corpus y sin garantia empirica publicada.
- El metrico `nrmse` mezcla traslaciones y rotaciones escalando por `ell`; errores calculados en unidades fisicas mixtas (m y rad) no son comparables con los del articulo.
- Requiere la longitud caracteristica `ell` del agarre y entradas en unidades fisicas; el prior vive en coordenadas escaladas y la conversion es interna, lo que introduce una dependencia critica de `ell`.
- El modelo asume linealidad `response ~= C @ wrench + b` y matriz `C` simetrica PSD; agarres con no linealidades fuertes o histéresis pueden violar el supuesto.
- S-MAP puede degradar el resultado frente a MAPS en algun corpus (0.859 frente a 0.323 en `matched_mujoco`), por lo que la eleccion del estimador debe validarse por fold.
- No hay modelo de lenguaje: no soporta generacion de texto, codigo, tool calling ni agentes; cualquier uso en esos dominios queda fuera de alcance.
- Riesgo de sobreajuste al protocolo de recogida del dataset `gaudelbijay10/grasp-compliance-sim`; no se documentan sesgos demograficos ni linguisticos por no aplicar.
- Licencia MIT permite uso comercial, pero la ausencia de validacion en hardware real traslada al integrador la responsabilidad de verificar el comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gaudelbijay10/maps-grasp-compliance-prior
- Dataset asociado: https://huggingface.co/datasets/gaudelbijay10/grasp-compliance-sim
- Articulo de referencia: *Few-Shot Grasp Compliance Identification Across Robot Hands* (no se proporciona URL en la informacion disponible)
- Repositorio de codigo: incluido en el propio repo HuggingFace (`maps.py`, `example.py`, `verification.json`); no se indica URL externa
- Demo o paper page adicional: no disponible
