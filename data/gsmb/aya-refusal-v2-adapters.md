# GSMB/aya-refusal-v2-adapters

## Resumen

GSMB/aya-refusal-v2-adapters es un conjunto de adaptadores LoRA de seguridad (safety) entrenados sobre el modelo base CohereLabs/tiny-aya-global, un modelo multilingue de tamano reducido de Cohere Labs. El repositorio no contiene pesos completos, sino un juego de adaptadores PEFT organizados por "brazos" experimentales (`full`, `allld`, `circuit`, `circuit_gap`, `random`) que persiguen cerrar la brecha de seguridad multilingue: que el modelo rechace peticiones daninas tanto en idiomas vistos durante el entrenamiento como en idiomas no vistos (held-out).

El problema que aborda es el conocido "safety gap" entre el ingles y otros idiomas: el modelo base rechaza contenidos daninos con mucha mas frecuencia en ingles que en lenguas de menor representacion. Los adaptadores buscan transferir la capacidad de rechazo a idiomas held-out sin degradar en exceso capacidades generales (medidas con MGSM-lite, una variante de razonamiento matematico multilingue).

Es relevante ahora porque es un artefacto de investigacion pequeno (0.2 GB), con licencia "other" y resultados publicados con intervalos de confianza bootstrap, lo que permite a investigadores reproducir y comparar estrategias de localizacion de circuitos de rechazo frente a entrenamiento LoRA completo. No esta certificado para despliegue en produccion segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer CohereLabs/tiny-aya-global |
| Parametros totales | no disponible (depende del modelo base; los adaptadores modifican entre 0.066 % y 0.903 % de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base tiny-aya-global) |
| Tipos de cuantizacion | no disponible (adaptadores safetensors; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | multilingue (modelo base tiny-aya-global); lista exacta no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto son adaptadores LoRA sobre el modelo base tiny-aya-global. El autor organiza el repositorio en "brazos" que corresponden a distintas estrategias de seleccion de modulos y capas: `full` aplica LoRA a todos los modulos y capas (0.903 % de parametros modificados), `allld` limita a `o_proj` y `down_proj` en todas las capas (0.295 %), `circuit` aplica solo a las capas de rechazo localizadas (0.066 %), `circuit_gap` es una variante adicional de ese brazo y `random` actua como control con capas aleatorias (0.066 %). Tambien se evaluan modos de "steering" (`steer_x0.5`, `steer_x1`, `steer_x2`) que no modifican parametros (0.000 %).

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se uso RLHF/DPO. La innovacion tecnica destacable es la comparacion entre entrenamiento LoRA convencional y entrenamiento restringido a "circuitos de rechazo" localizados, con un brazo de control aleatorio para aislar el efecto de la seleccion de capas. Las metricas se reportan con intervalos de confianza bootstrap al 95 % a nivel de prompt, y el autor advierte que los tamanos de test son pequenos y que diferencias por debajo de ~5 puntos deben tratarse como ruido.

## Capacidades

- Modificacion del comportamiento de rechazo ante peticiones daninas en el modelo base tiny-aya-global.
- Transferencia parcial de rechazo a idiomas held-out (no vistos en entrenamiento).
- Robustez frente a jailbreaks: reduce la tasa de no-rechazo en prompts de jailbreak (de 59.2 % a 34.6-37.1 % en idiomas vistos con los brazos `full`/`allld`/`circuit`).
- Preservacion de capacidades generales: MGSM-lite se mantiene o mejora ligeramente (56.2 % base frente a 58.1-60.6 % en los brazos LoRA).
- Multilingue, heredado del modelo base tiny-aya-global.
- No se documentan tool calling, function calling, agentes ni modos de vision o audio en la informacion disponible.

## Casos de uso

- Investigacion en seguridad multilingue: comparar el efecto de distintas estrategias de LoRA (completo, restringido a modulos, restringido a circuitos) sobre la tasa de rechazo en idiomas vistos y held-out, usando los brazos del repositorio como condiciones experimentales.
- Estudio de localizacion de circuitos: emplear el brazo `circuit` (0.066 % de parametros) frente al brazo `random` de igual tamano para aislar si las capas seleccionadas son realmente responsables del comportamiento de rechazo.
- Evaluacion de sobre-rechazo: medir el coste en falsos rechazos sobre prompts benignos y borderline-safe (0.3-9.1 % segun brazo) antes de considerar cualquier integracion.
- Analisis de robustez frente a jailbreaks: usar las metricas de "jailbreak not-refused" para estudiar que brazos reducen mas la tasa de no-rechazo en idiomas vistos (34.6 % con `full`) y held-out (52.5 % con `full`).
- Baseline para experimentos de steering: comparar adaptadores LoRA con modos de activacion sin cambio de pesos (`steer_x0.5`, `steer_x1`, `steer_x2`), que muestran degradacion severa de MGSM-lite a partir de `steer_x1` (3.1 %) y `steer_x2` (0.0 %).
- Reproducibilidad de artefactos PEFT: cargar los adaptadores con la libreria `peft` sobre tiny-aya-global para replicar las tablas publicadas con los mismos intervalos bootstrap.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes; corchetes = IC bootstrap al 95 % a nivel de prompt). El autor advierte que los tamanos de test son pequenos y que diferencias por debajo de ~5 puntos deben tratarse como ruido.

| Metrica | base | full | allld | circuit | random | steer_x0.5 | steer_x1 | steer_x2 |
|---|---|---|---|---|---|---|---|---|
| Rechazo en danino, idiomas vistos (mayor = mas seguro) | 53.8 [46.2, 61.9] | 86.2 [80.6, 91.2] | 86.2 [80.6, 91.2] | 71.2 [64.4, 77.5] | 97.5 [95.0, 99.4] | 51.2 [43.7, 59.4] | 56.9 [49.4, 64.4] | 36.2 [28.7, 43.8] |
| Rechazo en danino, idiomas held-out | 41.2 [33.8, 48.8] | 61.3 [53.8, 68.8] | 60.0 [52.5, 67.5] | 40.6 [33.1, 48.8] | 59.4 [51.2, 66.9] | 22.5 [15.6, 29.4] | 31.2 [23.8, 38.8] | 38.8 [31.9, 46.2] |
| Jailbreak no rechazado, vistos (menor = mas seguro) | 59.2 [53.8, 65.0] | 34.6 [28.7, 40.8] | 35.4 [29.2, 41.7] | 37.1 [31.2, 42.9] | 36.7 [30.8, 42.9] | 28.3 [22.9, 33.8] | 54.2 [47.5, 60.8] | 76.2 [70.8, 81.7] |
| Jailbreak no rechazado, held-out | 83.3 [78.3, 87.5] | 52.5 [46.2, 58.8] | 66.2 [60.4, 72.1] | 58.3 [52.5, 64.2] | 59.6 [53.8, 65.4] | 51.7 [44.6, 58.3] | 68.3 [62.1, 73.8] | 78.3 [72.9, 83.3] |
| Sobre-rechazo, benigno (menor = mejor) | 0.0 [0.0, 0.0] | 0.3 [0.0, 0.9] | 0.6 [0.0, 1.6] | 0.0 [0.0, 0.0] | 0.0 [0.0, 0.0] | 1.9 [0.6, 3.4] | 7.2 [4.4, 10.0] | 1.9 [0.6, 3.4] |
| Sobre-rechazo, borderline-safe | 1.2 [0.3, 2.5] | 7.2 [4.4, 10.0] | 9.1 [5.9, 12.5] | 8.4 [5.6, 11.6] | 10.0 [6.9, 13.4] | 17.5 [13.7, 21.9] | 19.1 [15.0, 23.8] | 0.9 [0.0, 2.2] |
| Brecha de seguridad: ingles menos rechazo held-out (pts) | 48.8 | 38.7 | 40.0 | 56.9 | 40.6 | 55.0 | 56.2 | 31.2 |
| Capacidad: precision MGSM-lite | 56.2 | 58.1 | 58.8 | 60.6 | 53.8 | 54.4 | 3.1 | 0.0 |
| Parametros modificados (%) | 0.000 | 0.903 | 0.295 | 0.066 | 0.066 | 0.000 | 0.000 | 0.000 |

## Requisitos de hardware

- El repositorio ocupa 0.2 GB, pero la inferencia requiere cargar el modelo base CohereLabs/tiny-aya-global, cuyo tamano exacto no esta disponible en la informacion proporcionada.
- Al tratarse de un modelo base de tamano reducido (familia tiny-aya), es esperable que quepa en GPU consumer, pero no se dispone de cifras de VRAM concretas.
- GPU recomendadas: no disponible.
- Opciones de despliegue: carga via libreria `peft` sobre el modelo base; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GSMB/aya-refusal-v2-adapters | adaptadores LoRA (0.066-0.903 % de parametros) sobre tiny-aya-global | no disponible | Safety multilingue via LoRA y circuitos de rechazo | other | HuggingFace (0 descargas) |
| CohereLabs/tiny-aya-global (base) | no disponible | no disponible | Modelo multilingue general | no disponible | HuggingFace |
| Adaptadores de seguridad multilingue alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor declara que son artefactos de investigacion, no certificados para despliegue en produccion.
- Los tamanos de test son pequenos; diferencias por debajo de ~5 puntos deben tratarse como ruido.
- La transferencia a idiomas held-out es parcial: la brecha de seguridad persiste (38.7-40.0 pts con `full`/`allld` frente a 48.8 pts en el base).
- El brazo `random` (control con capas aleatorias) alcanza un rechazo del 97.5 % en idiomas vistos con solo 0.066 % de parametros, lo que sugiere que parte del efecto puede deberse al entrenamiento LoRA en si y no solo a la localizacion de circuitos; el autor no ofrece interpretacion adicional.
- Aumento de sobre-rechazo en prompts borderline-safe con los brazos LoRA (7.2-10.0 % frente a 1.2 % en el base).
- Los modos de steering degradan severamente capacidades: MGSM-lite cae a 3.1 % con `steer_x1` y 0.0 % con `steer_x2`.
- Licencia "other": no se especifican condiciones de uso comercial; debe consultarse la licencia del modelo base y del repositorio antes de cualquier uso.
- Idiomas exactos soportados no disponibles; riesgos de sesgo no documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GSMB/aya-refusal-v2-adapters
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
