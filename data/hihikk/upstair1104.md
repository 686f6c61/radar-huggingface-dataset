# hihikk/upstair1104

## Resumen

`hihikk/upstair1104` es una política de aprendizaje por refuerzo (RL) publicada en Hugging Face por el usuario `hihikk`, entrenada para que un robot humanoide de la familia Unitree H2 (cuerpo inferior más cintura de 3 grados de libertad) suba una escalera de 20 cm de contrahuella y 6 peldaños en MuJoCo. No es un modelo de lenguaje: es un artefacto de control motor entrenado con PPO de stable-baselines3 sobre una red MLP de 256×256, que mapea 86 observaciones a 15 acciones (12 articulaciones de piernas más yaw, roll y pitch de cintura).

El modelo es relevante en el contexto de la robótica con patas y el RL aplicado a locomoción, donde las políticas de escalada siguen siendo un problema abierto por la dificultad de mantener equilibrio dinámico, evitar saltos de dos peldaños y aterrizar de forma estable. La model card reporta resultados medidos honestos: 0/20 episodios con éxito completo según su criterio estricto (llegar al descansillo y mantenerse quieto más de 0,2 s tras x > 3,0 m), aunque 7/20 episodios alcanzan el sexto peldaño y el desplazamiento máximo medio es de 2,402 m.

Se trata de un repositorio de 0,0 GB con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 4 de noviembre de 2026. Su interés es principalmente de investigación y reproducción: el autor documenta con detalle el contrato de entrenamiento (curriculum, ganancias de servo, pesos de recompensa) y las modificaciones locales que desbloquearon el segundo y tercer peldaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 256×256 (política PPO de stable-baselines3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato `.zip` de SB3) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | `.zip` (SB3 PPO) + `.curriculum.json` |
| Observaciones | 86 |
| Acciones | 15 (12 articulaciones de pierna + yaw/roll/pitch de cintura) |
| Entorno | MuJoCo, surrogate `h2_lowerbody.xml` (59 kg) |
| Paso de control (dt) | 0,01 s |
| Pasos de entrenamiento | 34.079.296 |
| Entornos paralelos | 16 |
| Learning rate / ent_coef | 1e-4 / 0,001 |

## Arquitectura y entrenamiento

La política es una red MLP de dos capas de 256 unidades cada una, entrenada con PPO de stable-baselines3 sobre un entorno MuJoCo que modela el cuerpo inferior del Unitree H2 más una cintura de 3 DoF. La observación de 86 dimensiones y la acción de 15 dimensiones se documentan en el fichero `h2_stairs_waist_ppo.curriculum.json`, que actúa como contrato de entrenamiento: layout de observación/acción, ganancias de servo, pesos de recompensa y estado del curriculum.

El entrenamiento partió de un run previo de 24 M pasos sobre escalera de 20 cm y continuó hasta 34.079.296 pasos con 16 entornos en paralelo, lr 1e-4 y coeficiente de entropía 0,001. El autor documenta modificaciones locales con impacto directo en el comportamiento: `action_scales` de rodilla a 1,8 rad (frente a 1,1 de un rango de 2,53 rad), que desbloqueó el segundo y tercer peldaño; recompensas densas de escalera (`stair_advance +4` al pasar la pelvis del borde del peldaño, `stair_skip −2` para evitar saltos de dos peldaños, `stair_stall −3` tras 4 s sin progreso, finalización escalada por profundidad de peldaño 1,0/1,6/2,2/…, `stair_lift 2,0` con objetivo de swing de +8 cm); y costes de aterrizaje suavizados (`landing_impact −0,3`, `base_vertical_motion −0,3`, `fall_event −3`). El código base es `origin/codex/h2-stair-clearance` en el commit `3d9ae2d` más ediciones locales.

## Capacidades

- Control motor de escalada: política de locomoción para subir escaleras de 20 cm de contrahuella y 6 peldaños con el cuerpo inferior del Unitree H2 más cintura de 3 DoF.
- Salida determinista: `model.predict(obs, deterministic=True)` devuelve una acción de 15 dimensiones a partir de 86 observaciones.
- Control a 100 Hz (dt = 0,01 s), adecuado para bucles de control de bajo nivel en simulación.
- Reproducibilidad: incluye el contrato de curriculum con layout, ganancias y pesos de recompensa.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking ni capacidades generativas de texto.

## Casos de uso

- Investigación en locomoción bípeda: servir como baseline reproducible para comparar políticas de escalada en MuJoCo con el mismo contrato de observación/acción y recompensas documentadas.
- Estudio de recompensas densas: el fichero de curriculum permite analizar el efecto de `stair_advance`, `stair_skip`, `stair_stall` y `stair_lift` sobre el comportamiento emergente.
- Transferencia sim-to-real en robótica: punto de partida para experimentos de dominio aleatorizado y ajuste fino antes de desplegar en hardware Unitree H2.
- Docencia y divulgación de RL: ejemplo completo de entrenamiento PPO con SB3 y MuJoCo, con métricas de éxito y distribución de peldaños alcanzados.
- Benchmark de robustez: evaluar la política frente a perturbaciones (cambios de altura de peldaño, fricción, masa) para medir degradación de rendimiento.
- Comparación de arquitecturas de política: usar la MLP 256×256 como referencia frente a políticas recurrentes o con memoria en tareas de escalada.

## Benchmarks y rendimiento

Resultados medidos por el autor en 20 episodios deterministas sobre escalera de 20 cm × 6 peldaños:

| Metrica | Valor |
|---|---|
| Éxito completo (criterio estricto) | 0/20 |
| Desplazamiento máximo medio en x | 2,402 m |
| Peldaños medios alcanzados | 4,85 / 6 |
| Episodios con cumbre (6 peldaños) | 7/20 |
| Mejor recorrido en x | 2,90 m |

Distribución de peldaños alcanzados:

| Peldaños alcanzados | Episodios |
|---:|---:|
| 6 (cumbre) | 7 |
| 5 | 7 |
| 4 | 3 |
| 3 | 2 |
| 2 | 1 |

El criterio de éxito exige además permanecer quieto en el descansillo tras x > 3,0 m durante 0,2 s, condición que la política no alcanza todavía. No se han publicado resultados de benchmarks comparativos con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; la MLP 256×256 ocupa del orden de unos pocos MB en memoria, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior) o CPU es suficiente para inferencia.
- Cabe en consumer GPU: sí, en todas las gamas actuales e incluso en placas integradas.
- Despliegue: stable-baselines3 (carga directa con `PPO.load`), MuJoCo para el entorno de simulación; no aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; el control a dt = 0,01 s exige inferencias a 100 Hz, holgadamente alcanzables con una MLP de este tamaño.
- Entrenamiento: 34 M pasos con 16 entornos paralelos; el autor no documenta hardware de entrenamiento.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables de escalada para el Unitree H2 en la información proporcionada. Como referencia de categoría, existen políticas de locomoción para humanoides en MuJoCo publicadas con PPO y arquitecturas MLP similares, pero no se dispone de datos verificables para establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hihikk/upstair1104 | no disponible (MLP 256×256) | no aplica | 0/20 éxito estricto, 7/20 cumbre | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No alcanza el criterio de éxito completo: 0/20 episodios con éxito estricto; el mejor recorrido (2,90 m) queda por debajo del umbral de 3,0 m.
- Solo sube escaleras de 20 cm × 6 peldaños en el entorno MuJoCo documentado; no se ha validado en otras geometrías, alturas ni en hardware real.
- Entrenado sobre un surrogate (`h2_lowerbody.xml`, 59 kg); la transferencia a un Unitree H2 físico no está demostrada.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de las métricas reportadas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validación externa de la política.
- Licencia MIT permite uso comercial, pero el modelo depende de stable-baselines3 y MuJoCo, cuyas licencias deben verificarse por separado.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni desplegarse en tareas de texto.
- El autor documenta ediciones locales no publicadas como parche formal; la reproducibilidad exacta depende del commit `3d9ae2d` y de dichas ediciones.

## Enlaces

- Hugging Face: https://huggingface.co/hihikk/upstair1104
- Repositorio de código base citado: `origin/codex/h2-stair-clearance` en el commit `3d9ae2d` (no se proporciona URL directa)
- stable-baselines3: no se proporciona enlace en la información disponible
- MuJoCo: no se proporciona enlace en la información disponible
