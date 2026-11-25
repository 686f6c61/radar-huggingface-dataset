# deinal/njord-baltic-models

## Resumen

Njord-Baltic es una familia de checkpoints preentrenados para predicción oceánica regional en el mar Báltico, desarrollada por el autor deinal y publicada bajo licencia MIT. No se trata de un modelo de lenguaje, sino de un sistema de predicción numérica basado en redes neuronales de grafos (GNN) que sustituye o complementa a los modelos oceánicos tradicionales de asimilación y pronóstico. El repositorio contiene dos arquitecturas diferenciadas: Njord-Baltic (`graph_efm`), un GNN probabilístico de variables latentes orientado a pronóstico por conjuntos (ensemble), y SeaCast (`graph_fm`), un GNN jerárquico determinista.

Ambos modelos operan sobre mallas específicas del Báltico (`baltic_cluster` y `baltic_hierarchical`), con 6 y 3 capas de procesador respectivamente y una dimensión oculta de 256. Predicen 23 variables oceánicas —altura del nivel del mar, concentración y grosor de hielo, temperatura, salinidad y componentes de velocidad— a cinco profundidades (1, 9, 28, 47 y 91 m), con un paso temporal diario a partir de dos estados oceánicos previos.

La relevancia de esta publicación radica en que ofrece checkpoints tanto preentrenados sobre reanálisis (1993-2021) como afinados sobre análisis (2023), lo que permite reproducir el pipeline completo de entrenamiento y evaluación con código abierto. El repositorio ocupa 1,4 GB y está pensado para investigadores en oceanografía computacional y aprendizaje profundo aplicado a ciencias de la Tierra.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Graph Neural Network (GNN); Njord-Baltic: EFM probabilístico de variables latentes; SeaCast: GNN jerárquico determinista |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 2 pasos temporales (estados oceánicos previos) |
| Tipos de cuantización | no disponible (checkpoints PyTorch en precisión de entrenamiento, `bf16-mixed`) |
| Idiomas soportados | no aplica (modelo numérico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`, `last.ckpt` y `min_val_loss.ckpt`) |
| Malla | `baltic_cluster` (Njord-Baltic) y `baltic_hierarchical` (SeaCast) |
| Dimensión oculta | 256 (grid 128, nodos de malla 128, aristas 32) |
| Capas de procesador | 6 (Njord-Baltic) / 3 (SeaCast) |
| Variables predichas | 23 (`sla`, `siconc`, `sithick`, `thetao`, `so`, `uo`, `vo` a 1, 9, 28, 47 y 91 m) |
| Paso temporal | diario |
| Forzamiento | modelo oceánico global (frontera lateral) + ERA5 (atmósfera) |

## Arquitectura y entrenamiento

Njord-Baltic emplea un GNN probabilístico de variables latentes (`graph_efm`) con 6 capas de procesador y dimensión oculta de 256 sobre la malla `baltic_cluster`. El entrenamiento se organiza en cuatro fases ejecutadas en un único job con scheduler probabilístico y 350 épocas con decaimiento coseno del learning rate: 100 épocas de autoencoder (`kl_beta 0`, 1 paso), 200 épocas de ELBO a un paso (`kl_beta 0.1`), 25 épocas de ELBO desenrollado a 2 pasos y 25 épocas de ELBO desenrollado más CRPS (`crps_weight 1e4`). El afinado posterior sobre análisis emplea ELBO desenrollado con CRPS, 400 épocas, learning rate 1e-5 y `ensemble_size 2`.

SeaCast (`graph_fm`) es una variante determinista y jerárquica con 3 capas de procesador sobre la malla cuadrilateral `baltic_hierarchical`. Su preentrenamiento con scheduler determinista combina 150 épocas a un paso y 25 épocas con desenrollado a 2 pasos; el afinado añade 200 épocas con desenrollado a 2 pasos y learning rate 1e-5. Ambos modelos se entrenaron sobre 8 nodos con precisión mixta `bf16-mixed`, batch size 1 y 2 pasos de entrada.

Los datos de preentrenamiento combinan reanálisis con forzamiento ERA5 (entrenamiento 1993-2021, validación 2022). El afinado utiliza análisis con ERA5 (entrenamiento 2023, validación enero-junio de 2024). La normalización del conjunto de afinado reutiliza las estadísticas de los datastores de reanálisis, de modo que los modelos afinados comparten normalización con los preentrenados. La evaluación se realiza en modo pronóstico con `data/baltic_sea_forecasts.yaml`, indexado por `init_time` × `lead_time`, sobre 52 inicializaciones semanales a lo largo de 2024.

## Capacidades

- Pronóstico oceánico regional probabilístico (Njord-Baltic) mediante ensemble de 5 miembros durante el preentrenamiento.
- Pronóstico oceánico determinista (SeaCast) con menor coste computacional (3 capas frente a 6).
- Predicción de 23 variables físicas: nivel del mar (`sla`), hielo marino (`siconc`, `sithick`), temperatura (`thetao`), salinidad (`so`) y velocidades (`uo`, `vo`) a cinco profundidades.
- Pronóstico autorregresivo multi-paso con horizonte de evaluación de 4 pasos (`ar_steps_eval 4`).
- Integración de forzamiento atmosférico (ERA5) y de frontera lateral procedente de un modelo oceánico global.
- Entrenamiento y evaluación reproducibles mediante el framework Njord (`neural_lam`), con configuraciones MDP en formato YAML.
- No soporta tool calling, agentes, razonamiento lingüístico ni capacidades multimodales en el sentido de los LLM.

## Casos de uso

- Pronóstico operativo del mar Báltico: los modelos generan estados oceánicos diarios a partir de dos estados previos, adecuados para alimentar sistemas de aviso costero con horizonte de varios días.
- Predicción de hielo marino: las variables `siconc` y `sithick` permiten estimar concentración y grosor de hielo, relevantes para navegación en el Báltico durante el invierno.
- Gestión de rutas marítimas: la combinación de nivel del mar, corrientes (`uo`, `vo`) y hielo permite evaluar condiciones de navegación con resolución diaria.
- Investigación en oceanografía computacional: los checkpoints preentrenados y afinados permiten reproducir experimentos y comparar GNN probabilísticos frente a deterministas sobre la misma región.
- Asimilación y downscaling regional: el forzamiento lateral de un modelo global y el atmosférico de ERA5 permiten usar Njord-Baltic como capa de regionalización sobre el Báltico.
- Estudios de variabilidad climática regional: el rango temporal de entrenamiento (1993-2021) y la validación en 2024 permiten analizar tendencias y episodios extremos en el Báltico.
- Benchmarking de arquitecturas GNN: la disponibilidad de dos variantes (EFM y FM) sobre mallas distintas facilita comparaciones controladas de coste y precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación (52 inicializaciones semanales en 2024 con `data/baltic_sea_forecasts.yaml`, `ar_steps_eval 4`, pasos de validación 1 y 4) y las métricas de entrenamiento (ELBO y CRPS), pero no incluye tablas con valores numéricos de error ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (1,4 GB) incluye cuatro checkpoints; el peso individual de cada uno no se detalla.
- GPU recomendadas: no disponible de forma explícita. El entrenamiento se realizó con 8 nodos en precisión `bf16-mixed`, lo que sugiere GPUs de centro de datos (A100/H100) para el pipeline completo.
- Viabilidad en GPU de consumo: no confirmada. Con dimensión oculta 256 y 3-6 capas de procesador, la inferencia podría caber en GPUs de consumo con suficiente memoria, pero no se aportan cifras.
- Opciones de despliegue: framework Njord (`neural_lam`), checkpoints PyTorch cargables con `--load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Almacenamiento: 1,4 GB para el conjunto completo de checkpoints; los datastores zarr y las mallas preconstruidas se obtienen del repositorio de GitHub.

## Comparativa con modelos similares

| Modelo | Tipo | Región | Capas / dimensión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Njord-Baltic (`graph_efm`) | GNN probabilístico (EFM) | Mar Báltico | 6 / 256 | MIT | Hugging Face |
| SeaCast (`graph_fm`) | GNN determinista jerárquico | Mar Báltico | 3 / 256 | MIT | Hugging Face |
| Otros modelos oceánicos regionales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de terceros con datos verificables de parámetros, contexto o rendimiento. La comparación más directa es interna, entre las dos variantes del propio repositorio.

## Limitaciones y advertencias

- Dominio restringido: los modelos están entrenados exclusivamente para el mar Báltico y las mallas `baltic_cluster` y `baltic_hierarchical`; no son extrapolables a otras regiones sin reentrenamiento.
- Dependencia de forzamiento externo: requieren forzamiento atmosférico ERA5 y forzamiento lateral de un modelo oceánico global; sin ellos no producen pronósticos válidos.
- Configuraciones no portables: las entradas `path` de las configuraciones MDP apuntan a almacenes zarr específicos de la máquina del autor y deben reemplazarse por datos propios.
- Ventana de entrenamiento limitada: preentrenamiento 1993-2021 y afinado 2023; la validación del afinado cubre solo enero-junio de 2024, lo que limita la caracterización de regímenes no vistos.
- Ausencia de métricas publicadas: no hay tablas de error (RMSE, CRPS, sesgo) en la información disponible, lo que impide una evaluación objetiva previa al despliegue.
- Riesgo de deriva en pronósticos autorregresivos largos: la evaluación se limita a 4 pasos (`ar_steps_eval 4`); no se documenta el comportamiento más allá de ese horizonte.
- Sesgos físicos: al entrenarse sobre reanálisis y análisis, heredan los sesgos de esos productos de asimilación.
- Licencia MIT: permite uso comercial y modificación, pero no se especifican garantías ni soporte; la responsabilidad de validación recae en el usuario.
- Sin soporte documentado de cuantización ni de despliegue en entornos de inferencia de baja latencia.

## Enlaces

- Hugging Face: https://huggingface.co/deinal/njord-baltic-models
- Repositorio GitHub de Njord: https://github.com/deinal/njord
- Documentación de datos y grafos: https://github.com/deinal/njord/blob/main/data/README.md
