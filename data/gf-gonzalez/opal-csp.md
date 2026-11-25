# gf-gonzalez/OPAL-CSP

## Resumen

OPAL-CSP es un modelo de predicción de estructura cristalina (Crystal Structure Prediction, CSP) basado en flow matching con simetría SE(3) y un backbone de tipo EquiformerV2. Lo desarrolla el grupo BCV de la Universidad de los Andes (autores del paper *Quantitative Assessment of Crystal Structure Prediction*, presentado en NeurIPS 2026, Evaluations and Datasets Track) y los checkpoints publicados corresponden a una ejecución de entrenamiento independiente de la del artículo. El modelo aborda el problema de predecir la estructura cristalina tridimensional de un material a partir de su composición química, una tarea central en el descubrimiento de materiales.

A diferencia de los modelos de lenguaje, OPAL-CSP no procesa texto: genera coordenadas atómicas y parámetros de red mediante un proceso de flow matching equivariante bajo rotaciones y traslaciones. Se publican cuatro checkpoints, uno por cada conjunto de datos de referencia (Perov-5, Carbon-24, MP-20 y MPTS-52), con tamaños de entre 107 MB y 185 MB por checkpoint y un total de 0,7 GB en el repositorio.

Su relevancia actual radica en que forma parte de una evaluación cuantitativa rigurosa del estado del arte en CSP y en que se distribuye con licencia MIT, lo que facilita su reproducción y uso en investigación de materiales. No es un modelo generativo de propósito general ni soporta texto, código o conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching SE(3)-equivariante con backbone EquiformerV2 (red neuronal de grafos equivariante) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de estructura atomica, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo cientifico sin entrada/salida en lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | checkpoints `.ckpt` (PyTorch Lightning); solo pesos, no reanudables para entrenamiento |

## Arquitectura y entrenamiento

OPAL-CSP emplea flow matching sobre un backbone EquiformerV2, una red de grafos equivariante a rotaciones y traslaciones (SE(3)) que opera sobre representaciones de átomos y vecinos con condiciones de contorno periódicas. El modelo genera estructuras cristalinas muestreando un flujo continuo desde una distribución base hasta la estructura objetivo, condicionado por la composición química. Se usan 20 vecinos máximos por átomo y un cutoff que varía según el dataset (10 Å en Perov-5, 5 Å en Carbon-24 y 12 Å en MP-20 y MPTS-52).

El entrenamiento se realizó durante 1000 épocas con Adam (learning rate 1e-3), scheduler ReduceLROnPlateau (factor 0,6, paciencia 30), batch total de 128 y semilla 42. La profundidad del backbone varía: 3 capas en Perov-5 y 6 capas en Carbon-24, MP-20 y MPTS-52. Solo el modelo de MP-20 incorpora coordenadas fraccionales en el backbone. El número de GPUs empleadas oscila entre 2 (Perov-5, Carbon-24) y 4 (MP-20, MPTS-52). No se documenta en la información disponible el volumen de tokens ni la composición detallada de los datasets más allá de su nombre y procedencia.

## Capacidades

- Predicción de estructuras cristalinas 3D a partir de la composición química, generando coordenadas atómicas y parámetros de red.
- Generación por muestreo mediante flow matching equivariante, con estructuras escritas en el directorio `results/`.
- Equivariancia SE(3): las predicciones son consistentes bajo rotaciones y traslaciones del sistema de referencia.
- Manejo de condiciones de contorno periódicas propias de sistemas cristalinos.
- Cuatro modelos especializados por dataset: Perov-5 (perovskitas), Carbon-24 (estructuras de carbono), MP-20 y MPTS-52 (Materials Project).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Descubrimiento de materiales: dado un compuesto candidato, OPAL-CSP predice su estructura cristalina estable para evaluar propiedades derivadas (energía, estabilidad) antes de síntesis experimental.
- Cribado de perovskitas: el checkpoint de Perov-5 permite generar estructuras de tipo perovskita para pipelines de selección de materiales fotovoltaicos.
- Estudio de formas alotrópicas del carbono: el checkpoint de Carbon-24 se usa para explorar estructuras de carbono en condiciones específicas, útil en investigación de materiales carbonosos.
- Validación de metodologías CSP: al ser parte de un benchmark cuantitativo (paper NeurIPS 2026), sirve como referencia reproducible para comparar nuevos métodos de predicción de estructuras.
- Generación de datasets sintéticos: las estructuras muestreadas pueden alimentar bases de datos de entrenamiento para otros modelos de materiales.
- Reproducción de investigación: con licencia MIT y checksums publicados, se integra en flujos de experimentación académica para verificar resultados del artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que estos checkpoints provienen de una ejecución de entrenamiento separada y que sus puntuaciones difieren de las de la Tabla 1 del artículo; las predicciones del paper están en la release de OSF.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los checkpoints pesan entre 107 MB y 185 MB, por lo que el modelo cabe holgadamente en GPUs de consumo, pero el muestreo requiere además el dataset en `data/` para calcular estadísticas.
- GPU recomendadas: el entrenamiento usó entre 2 y 4 GPUs (no se especifica el modelo exacto); para inferencia se puede usar una única GPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con varios GB de VRAM dada la baja huella de pesos, aunque no se documenta el pico de memoria durante el muestreo.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican); el despliegue se realiza mediante el repositorio de código OPAL-CSP con entorno micromamba y scripts `run_opalcsp_*.sh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| OPAL-CSP | Flow matching equivariante (EquiformerV2) | CSP por generación | MIT | Checkpoints en HF + código en GitHub |
| Modelos CSP previos (p. ej. diffusion-based) | Generativos | CSP por difusión | no disponible | no disponible |
| Predictores propiedad-estructura (GNN) | Discriminativos | Predicción de propiedades dada estructura | no disponible | no disponible |

No se dispone en la información proporcionada de datos numéricos de modelos competidores que permitan una comparación cuantitativa de rendimiento, parámetros o contexto.

## Limitaciones y advertencias

- El conjunto de evaluación de Carbon-24 tiene solo 10 composiciones, por lo que sus puntuaciones varían más entre ejecuciones.
- Los checkpoints publicados no permiten reanudar el entrenamiento (solo pesos), lo que limita el ajuste fino directo.
- Las puntuaciones de estos checkpoints no coinciden con las de la Tabla 1 del artículo, ya que provienen de una ejecución distinta.
- El muestreo requiere el directorio `data/` con el dataset correspondiente, ya que algunas estadísticas se calculan a partir del conjunto de entrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas ni genera código; su uso está restringido a CSP.
- Riesgo de estructuras físicamente inválidas o no relajadas en las predicciones generadas, inherente a los métodos generativos de CSP.
- Las estructuras de Carbon-24, MP-20 y MPTS-52 se distribuyen bajo CC BY 4.0 y deben citarse según sus fuentes originales.
- El código incluye partes adaptadas de otros proyectos, detalladas en `THIRD_PARTY_NOTICES.md`, con posibles obligaciones adicionales de atribución.

## Enlaces

- Hugging Face: https://huggingface.co/gf-gonzalez/OPAL-CSP
- Paper (arXiv): https://arxiv.org/abs/2611.10380
- Código: https://github.com/BCV-Uniandes/OPAL/tree/main/OPAL-CSP
- Página del proyecto: https://bcv-uniandes.github.io/OPAL-WP/
- Avisos de terceros: https://github.com/BCV-Uniandes/OPAL/blob/main/OPAL-CSP/THIRD_PARTY_NOTICES.md
