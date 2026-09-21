# hoppery/tartanimu-iros2026-mobilityai

## Resumen

TartanIMU MobilityAI es un modelo de odometría inercial desarrollado por el usuario `hoppery` para el TartanIMU Challenge asociado a IROS 2026. Se trata de una red única, con un solo conjunto de pesos (8,12 M de parámetros), que estima la velocidad en el sistema de referencia del cuerpo (body-frame) a partir de un flujo de IMU de 6 ejes muestreado a 200 Hz. Su particularidad es que cubre cuatro plataformas distintas —coche, cuadrúpedo, dispositivo portátil (handheld) y dron— sin recibir ninguna etiqueta de plataforma en el momento de la inferencia: el enrutamiento entre dominios se resuelve internamente mediante un router suave entrenado con una pérdida auxiliar de entropía cruzada.

El modelo no es un modelo de lenguaje ni un modelo generativo de propósito general: es un estimador de estado para robótica. Combina un codificador TCN sobre ventanas de IMU, una GRU bidireccional que mezcla un contexto de 60 ventanas, una rama de características de actitud y una cabeza de incertidumbre heteroscedástica. A la salida de la red se aplica una cadena determinista de posprocesado físico (promediado multi-contexto, escalado global, fusión Kalman/RTS en vuelo rápido de dron, emparejamiento de sensores en el mismo vuelo y suavizado por lotes conjunto) sin parámetros aprendidos y sin leer etiquetas de test.

Su relevancia actual es doble. Por un lado, demuestra que un único modelo compacto puede generalizar entre morfologías y patrones de movimiento muy dispares, lo que simplifica despliegues reales donde no se conoce la plataforma a priori. Por otro, el autor publica cifras de reproducibilidad muy detalladas: 0,23537 en el leaderboard público de Kaggle y 0,18874 en el servicio de puntuación de los organizadores sobre las 89 grabaciones de test, además de tolerancias explícitas de reproducción entre hardware y tamaños de lote.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador TCN sobre ventanas de IMU a 200 Hz + GRU bidireccional sobre contexto de 60 ventanas + rama de características de actitud + router suave de plataforma + cabeza de incertidumbre heteroscedástica |
| Parámetros totales | 8,12 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 60 ventanas de IMU como contexto; el autor no especifica la longitud temporal de cada ventana ni el número exacto de muestras por ventana |
| Tipos de cuantización | No disponible (no se documentan variantes cuantizadas; se distribuye un checkpoint PyTorch en precisión nativa) |
| Idiomas soportados | No aplica (modelo de estimación de estado, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`): `full_dv_unc_trev_s42_step75000.pt`, md5 `d445f47f5060edcdeadeb5d75f396869`; configuración en `config.json` |
| Entrada | IMU de 6 ejes (giroscopio + acelerómetro) a 200 Hz |
| Salida | Velocidad en body-frame |
| Plataformas cubiertas | Coche, cuadrúpedo, handheld y dron (sin etiqueta de plataforma en inferencia) |
| Tamaño del repositorio | 0,2 GB |
| Librería declarada | PyTorch |
| Pipeline declarado en HuggingFace | `other` |
| Fecha de creación / actualización | 2026-09-21 (ambas) |
| Descargas / likes | 0 / 0 |
| Idiomas declarados en la ficha de HuggingFace | No disponibles |

## Arquitectura y entrenamiento

La red se compone de cinco bloques. Un codificador TCN procesa ventanas de IMU a 200 Hz; una GRU bidireccional mezcla un contexto de 60 ventanas consecutivas; una rama específica extrae características de actitud; un router de plataforma blando combina las representaciones de los distintos dominios, y una cabeza heteroscedástica (de forma laplaciana) predice simultáneamente la velocidad y una escala de incertidumbre. El router se entrena con una pérdida auxiliar de entropía cruzada sobre las etiquetas de plataforma liberadas por el challenge, pero en inferencia opera de forma suave y no se lee ninguna etiqueta. El entrenamiento se realizó durante 75 000 pasos sobre las 475 grabaciones de train+val liberadas, con semilla 42.

La receta de entrenamiento incluye varias decisiones técnicas destacables. Se generan «gemelos» temporalmente invertidos solo para las plataformas no-aéreas (`--time_reverse_twins 0.5 --trev_plats car,dog,human`), bajo el razonamiento de que el vuelo propulsado no es reversible en el tiempo mientras que el movimiento terrestre y portátil sí lo es aproximadamente. Se aplica aumentación por desplazamiento de recorte para grabaciones más cortas que el contexto, con la pérdida reducida una vez por trayectoria en lugar de una vez por ventana (`--chunk_slack 1 --loss_per_chunk`), lo que alinea el objetivo con el promedio macro de la métrica. La cabeza heteroscedástica produce un `exp(logvar)` que funciona como escala de magnitud de error en m/s y alimenta el ruido de medida por ventana del posprocesado físico (`--uncertainty`). Además, se excluyeron tres grabaciones de entrenamiento por etiquetas de actitud invertidas tras el aterrizaje (`--exclude_ids`).

## Capacidades

- Estimación de velocidad en body-frame a partir de IMU de 6 ejes a 200 Hz, con una única red y un único conjunto de pesos.
- Generalización entre cuatro morfologías sin etiqueta de plataforma en inferencia: coche, cuadrúpedo, handheld y dron.
- Enrutamiento suave interno entre dominios de plataforma mediante router entrenado con pérdida auxiliar.
- Cuantificación de incertidumbre por ventana mediante cabeza heteroscedástica laplaciana, utilizable como ruido de medida en filtros y suavizadores.
- Fusión con física determinista: Kalman/RTS con incrementos de IMU y actitud Mahony en vuelos rápidos de dron.
- Detección sin etiquetas de vuelos duplicados (dos IMU en el mismo vuelo) por correlación de magnitud de giroscopio a igual longitud, con ajuste de rotación de montaje por Kabsch sobre giroscopio filtrado paso bajo.
- Suavizado por lotes conjunto sobre ambos sensores de un par, resolviendo correcciones de actitud, sesgos de giroscopio y acelerómetro y velocidad inicial.
- Promediado multi-contexto con solapamiento (`--stride 15`) para reducir varianza en las predicciones.
- No soporta tool calling, function calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Odometría de robots cuadrúpedos en exteriores: el modelo estima velocidad en body-frame sin depender de GNSS ni de odometría visual, lo que permite mantener estimación de movimiento en terreno irregular o con iluminación variable, y su rama de plataforma «dog» está entrenada explícitamente para esa morfología.
- Navegación de vehículos en entornos sin cobertura GNSS (túneles, aparcamientos, cañones urbanos): la salida de velocidad puede integrarse como factor en un filtro de fusión junto con IMU bruta, aportando velocidad body-frame a 200 Hz.
- Vuelo de dron a alta velocidad: la cadena de posprocesado detecta mediante el router las grabaciones de dron cuya velocidad media predicha supera 2,9 m/s y activa fusión Kalman/RTS con incrementos de IMU y actitud Mahony, con puertas de aceptación que revierten a la salida cruda si la fusión se desvía demasiado o si el acelerómetro indica cuasi-estático.
- Seguimiento de movimiento en dispositivos portátiles: para aplicaciones de análisis de actividad o localización peatonal que solo disponen de la IMU de un teléfono o tableta, el modelo cubre la plataforma handheld dentro del mismo peso compartido.
- Fusión en sistemas SLAM/VIO como fuente de velocidad: la salida puede emplearse como medición en un grafo de factores o en un EKF, aportando información métrica de velocidad que complementa la deriva típica de la integración inercial.
- Redundancia y calibración en plataformas con dos IMU: la detección automática de pares de vuelo y el suavizador conjunto permiten estimar correcciones de actitud por sensor y sesgos de giroscopio y acelerómetro, útil para calibrar montajes redundantes.
- Pre-etiquetado y generación de pseudo-ground-truth: al no requerir etiqueta de plataforma, puede ejecutarse sobre nuevos registros inerciales para obtener velocidades preliminares que después se refinan o se usan como inicialización.
- Investigación en estimación de estado y reproducción de resultados: el repositorio incluye el script de métrica de los organizadores (`kaggle_metric_tartanimu_score.py`) y utilidades de validación (`valscore.py`), lo que permite reproducir la puntuación sin conexión.

## Benchmarks y rendimiento

El autor publica dos cifras de evaluación. La métrica es la del challenge, implementada en `kaggle_metric_tartanimu_score.py`; en la información disponible no se explicita si valores menores son mejores.

| Evaluación | Resultado |
|---|---|
| Leaderboard público de Kaggle | 0,23537 |
| Servicio de puntuación de los organizadores, las 89 grabaciones de test | 0,18874 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas dos cifras. No hay datos de MMLU, HumanEval, GSM8K ni equivalentes, ya que el modelo no es un modelo de lenguaje.

Cifras de reproducibilidad reportadas por el autor:

| Escenario | Diferencia máxima observada |
|---|---|
| Mismo hardware original | Bit a bit exacta (30 644 filas, diferencia absoluta máxima de velocidad 0,000e+00) |
| Frente a una RTX 3090 | 1,65e-3 m/s, concentrada en una única grabación de dron rápido con fusión Kalman |
| Entre tamaños de lote de inferencia 48 y 12 | 5,75e-4 m/s |
| Entre distintos repartos de acumulación de gradiente con el mismo lote efectivo | No medible |
| Misma revisión de código frente a una copia de tres días de antigüedad | Hasta 0,07 m/s |

El autor define el criterio de reproducción como el 99,9 % de las filas de velocidad dentro de 5e-4 m/s, ninguna fila por encima de 5e-3 m/s y la puntuación coincidiendo hasta cuatro decimales.

## Requisitos de hardware

- No hay cifras de VRAM publicadas. A partir de los 8,12 M de parámetros, los pesos ocupan aproximadamente 32 MB en FP32 y 17 MB en FP16 (cálculo derivado del recuento de parámetros, no confirmado por el autor); el consumo dominante corresponderá a activaciones, buffers y tamaño de lote, no documentado.
- El autor ejecuta la inferencia con `--device cuda:0`. La única GPU mencionada explícitamente en la documentación es una RTX 3090, empleada en las pruebas de tolerancia de reproducción.
- Por tamaño, el modelo es compatible con GPUs de consumo con soporte CUDA, pero la información disponible solo aporta evidencia medida en la RTX 3090; no hay cifras publicadas para otras tarjetas.
- También es viable en CPU, dado el reducido número de parámetros, aunque no se documentan latencias ni tiempos de ejecución por plataforma.
- Dependencias de software: `torch`, `numpy`, `pandas` y `scipy`.
- El punto de entrada es `submit.py`, con soporte de opciones como `--device`, `--split`, `--stride`, `--kf`, `--regime_speed`, `--pair_avg`, `--pair_bs`, `--kf_unc` y `--unc_map`.
- No aplican los servidores de inferencia habituales para modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama): el modelo no es un transformer autoregresivo de texto y se distribuye como checkpoint PyTorch consumido por código propio del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de odometría inercial, ni datos de parámetros, contexto o licencia de alternativas. Las búsquedas web realizadas no devolvieron resultados relacionados con el modelo ni con el challenge, por lo que no se dispone de una base para construir una comparativa fiable.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TartanIMU MobilityAI (`hoppery/tartanimu-iros2026-mobilityai`) | 8,12 M | 60 ventanas de IMU | 0,18874 (servicio de los organizadores, 89 grabaciones); 0,23537 (Kaggle público) | MIT | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni capacidades multilingües. Cualquier evaluación con benchmarks tipo MMLU o HumanEval carece de sentido.
- Dominio restringido: el entrenamiento se realizó sobre las 475 grabaciones liberadas del challenge, correspondientes a cuatro plataformas (coche, cuadrúpedo, handheld y dron). El comportamiento fuera de esos dominios de movimiento no está caracterizado.
- La reversibilidad temporal se asume solo para plataformas terrestres y portátiles; el vuelo propulsado no es reversible, de modo que la aumentación por gemelos invertidos excluye los drones de forma deliberada.
- Tres grabaciones de entrenamiento fueron excluidas por etiquetas de actitud invertidas tras el aterrizaje, lo que indica la presencia de anotaciones problemáticas en el conjunto de datos original.
- Dependencia crítica de la revisión del código: ejecutar el mismo checkpoint con una copia del repositorio tres días más antigua desplazó las velocidades hasta 0,07 m/s, muy por encima de la tolerancia declarada de 5e-3 m/s. La revisión del código importa más que el hardware.
- La reproducibilidad bit a bit del md5 publicado solo se garantiza en el hardware original; en una RTX 3090 la diferencia máxima medida fue de 1,65e-3 m/s, concentrada en una grabación de dron rápido con filtro Kalman iterativo, donde la aritmética de coma flotante amplifica diferencias.
- La fusión Kalman/RTS se activa solo para grabaciones que el router clasifica como dron y cuya velocidad media predicha supera 2,9 m/s; existe una puerta de aceptación que revierte a la salida cruda si la fusión se desvía demasiado o si el acelerómetro indica cuasi-estático, lo que implica un comportamiento no uniforme entre grabaciones.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existen errores de estimación. La cabeza heteroscedástica proporciona una escala de incertidumbre por ventana, no una garantía de error acotado.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre los datos de entrenamiento subyacentes.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin retroalimentación externa conocida.
- No se documentan sesgos demográficos ni lingüísticos, ya que el modelo no procesa personas ni texto; los sesgos relevantes serían de dominio (plataformas, condiciones de movimiento y sensores concretos del challenge).

## Enlaces

- HuggingFace: https://huggingface.co/hoppery/tartanimu-iros2026-mobilityai
- Checkpoint de pesos: `full_dv_unc_trev_s42_step75000.pt` (md5 `d445f47f5060edcdeadeb5d75f396869`), dentro del repositorio de HuggingFace
- Predicciones enviadas: `submission.csv` (md5 `bff815a85b1075b0dd664135f50af55e`), dentro del repositorio de HuggingFace
- Configuración de entrenamiento: `config.json`, dentro del repositorio de HuggingFace
- Punto de entrada de inferencia: `submit.py`, dentro del repositorio de HuggingFace
- Métrica de los organizadores: `kaggle_metric_tartanimu_score.py`, incluida en el repositorio de HuggingFace
- Paper, blog, repositorio externo o demo: no disponibles en la información proporcionada
- Enlaces al TartanIMU Challenge o a IROS 2026: no disponibles en la información proporcionada
- Las búsquedas web realizadas no devolvieron resultados relacionados con el modelo; los resultados obtenidos correspondían a páginas de soporte de Microsoft ajenas al tema
