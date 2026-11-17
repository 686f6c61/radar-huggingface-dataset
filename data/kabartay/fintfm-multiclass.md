# kabartay/fintfm-multiclass

## Resumen

FinTFM (synthetic-only) multiclass es un checkpoint de investigación publicado por el usuario kabartay en Hugging Face. No es un modelo de lenguaje: es una representación congelada (frozen representation) pensada para alimentar una cabeza de lectura (readout) por hoja en tareas de clasificación tabular multiclase de hasta 10 clases y 136 características. Se enmarca dentro de la familia FinTFM, cuya variante binaria ya existía, y comparte arquitectura con ella (mismo diseño con `max_classes 10`).

El modelo se ha entrenado exclusivamente con datos sintéticos: la mitad de las tareas provienen de un prior financiero y la otra mitad de un prior genérico de modelo estructural-causal (SCM). No se ha utilizado ningún dato real. Su uso previsto es la investigación y el benchmarking, concretamente como brazo multiclase de una entrada en TabArena-Lite mediante FinTFM-LinProbe con bolsas de partición.

Es relevante por su enfoque metodológico: demuestra que una representación aprendida sobre un prior sintético puede superar a un control sin representación en tareas tabulares multiclase, con una mejora medida de 874 frente a 829 Elo en TabArena-Lite. El checkpoint es muy pequeño (888.090 parámetros, 3,6 MB) y la model card declara licencia Apache-2.0, aunque el propio autor indica que el repositorio no devuelve modelo a la API pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (representación congelada para readout por hoja; misma arquitectura que el checkpoint binario, `max_classes 10`) |
| Parámetros totales | 888.090 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (decisión del propietario, 2026-11-16) |
| Formato de pesos | `.pt` (PyTorch); tamaño 3.598.528 bytes; SHA-256 `14d5b4d561fbea6e35c7a30dc2644cb8f64f437c25d62da087ee960717cc8f4d` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que es la misma que la del checkpoint binario de la familia FinTFM, con `max_classes 10`. Se trata de una representación congelada que se utiliza con una sonda lineal (LinProbe) y bolsas de partición sobre las características de entrada; no hay evidencia de que sea un transformer, MoE o SSM. El modelo opera sobre tablas de hasta 136 características y hasta 10 clases.

El entrenamiento usó únicamente un prior sintético con la configuración `--max-classes 10 --p-financial 0.5 --scm-legacy --permute-classes`: el 50% de las tareas proviene de un prior financiero y el 50% de un prior SCM genérico. Se realizaron 6.000 pasos con batch global de 8, lo que equivale a 48.000 tareas, con semilla 0, en Kaggle T4x2 con DDP, precisión fp16 y split attention. El código de entrenamiento está en `scripts/kaggle/ts_dr74_mc_s0/`, pre-registrado en la sección §185, con la versión 0.7.1 del paquete y el commit `a901cdc` (el campo `commit` almacenado está vacío). La receta está en `runs/kaggle-ts-dr74-mc-s0/dr74-mc-s0/recipe.yaml`. No se usaron datos reales ni se documenta RLHF/DPO.

## Capacidades

- Clasificación tabular multiclase de hasta 10 clases y 136 características.
- Representación congelada para sonda lineal (FinTFM-LinProbe) con bolsas de partición.
- Entrenamiento sobre prior sintético con mezcla de tareas financieras y SCM genéricos.
- Soporte de permutación de clases durante el entrenamiento (`--permute-classes`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).

## Casos de uso

- Benchmarking de representaciones tabulares: usar el checkpoint como brazo multiclase en TabArena-Lite para comparar el rendimiento de una representación aprendida frente a un control sin representación (829 Elo) y frente a modelos lineales o boosted.
- Investigación sobre priors sintéticos: evaluar hasta qué punto un prior financiero combinado con un SCM genérico transfiere a tareas tabulares reales de clasificación multiclase.
- Experimentos de sonda lineal con bolsas de partición: replicar la configuración `fintfm_lp_mc_scr_bag8_1113` (8 bolsas, 874 Elo) y estudiar la varianza entre bolsas (4 bolsas dieron 865 Elo).
- Análisis de ablación de la representación: comparar el modelo con la misma configuración `no_rep` para cuantificar la contribución de la representación (mediana de log loss 15,5% menor, mejor en 7 de 8 datasets, peor en `hiva_agnostic` un 2,0%).
- Prototipado de pipelines de clasificación tabular de bajo coste: el checkpoint ocupa 3,6 MB y 888.090 parámetros, por lo que cabe en cualquier GPU consumer e incluso en CPU para inferencia de sonda lineal.
- Estudio de límites de dominio: comprobar el comportamiento en tablas de características de dígitos (`mfeat-*`), donde el modelo queda muy por detrás de modelos lineales y boosted, como caso negativo documentado.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| Proxy suite (6 de 8 tareas multiclase puntuadas) | Checkpoint multiclase actual | 994 Elo |
| Proxy suite (6 de 8 tareas multiclase puntuadas) | Checkpoint multiclase anterior | 808 Elo |
| Proxy suite, victorias/derrotas | Actual vs anterior | 6 victorias, 0 derrotas |
| TabArena-Lite multiclase | `fintfm_lp_mc_scr_bag8_1113` (8 bolsas) | 874 Elo sobre 8 datasets |
| TabArena-Lite multiclase | 4 bolsas | 865 Elo |
| TabArena-Lite (entrada global) | Entrada completa | 931,9 Elo |
| TabArena-Lite multiclase, control `no_rep` | Misma configuración sin representación | 829 Elo |
| Control `no_rep`, intervalo de confianza | — | +151 / -344 |

En la proxy suite no se puntuaron `letter` y `mfeat-factors` por exceder los límites. En la comparación con el control, la representación es mejor en 7 de 8 datasets (test de signos p = 0,07), con una mediana de log loss un 15,5% menor y un empeoramiento del 2,0% en `hiva_agnostic`.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el checkpoint pesa 3,6 MB y tiene 888.090 parámetros, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; el entrenamiento documentado se hizo en Kaggle T4x2 con DDP y fp16.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en entornos sin GPU.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; es un checkpoint PyTorch `.pt` para uso con el código de FinTFM).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinTFM multiclass (`dr74-mc-s0.pt`) | 888.090 | no aplica (tabular) | 874 Elo TabArena-Lite multiclase; 994 Elo proxy | Apache-2.0 | No público según la model card |
| FinTFM binario (checkpoint de la misma familia) | Misma arquitectura, `max_classes 10` | no aplica (tabular) | no disponible | Apache-2.0 (según la model card) | Público (binario) |
| Control `no_rep` (misma configuración sin representación) | no disponible | no aplica (tabular) | 829 Elo TabArena-Lite multiclase | no disponible | no disponible |

No se dispone de datos de modelos comparables externos (lineales, boosted) más allá de la mención cualitativa de que superan a FinTFM en tablas `mfeat-*`.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos; no se ha validado sobre datos reales más allá de los benchmarks citados.
- La evaluación se apoya en ocho datasets, una repetición y un fold; el intervalo de Elo del control es amplio (+151 / -344).
- Las tablas de características de dígitos (`mfeat-*`) quedan muy por detrás de modelos lineales y boosted.
- Fuera de rango para más de 10 clases o más de 136 características.
- La model card indica que el repositorio `kabartay/fintfm-multiclass` no devuelve modelo a la API pública (2026-11-15), por lo que la disponibilidad efectiva de los pesos es dudosa pese a la licencia Apache-2.0.
- La propia model card contiene una contradicción: declara licencia Apache-2.0 y a la vez afirma que la licencia de los pesos "no está decidida en esta tarjeta"; conviene verificar antes de un uso comercial.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual (no genera texto), pero la representación puede heredar sesgos de los priors sintéticos financiero y SCM.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código, visión ni tareas conversacionales.
- El campo `commit` del provenance está vacío y el checkpoint está en una ruta gitignored, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Hugging Face: https://huggingface.co/kabartay/fintfm-multiclass
- Model card del autor (referenciada en la información proporcionada): no disponible como URL independiente
- Paper, blog, repositorio o demo: no disponible en la información proporcionada
