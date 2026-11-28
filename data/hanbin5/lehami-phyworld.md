# hanbin5/lehami-phyworld

## Resumen

LeHami predictors on PhyWorld parabola es un artefacto de investigación publicado en Hugging Face por el usuario hanbin5. No es un modelo de lenguaje, sino un conjunto de checkpoints, salidas de evaluación, informes y vídeos de rollouts de un experimento sobre modelos del mundo (world models) con estructura hamiltoniana latente, basados en la implementación LeHami de rominay. El objetivo del experimento es comprobar si los predictores LeHami mantienen una velocidad fuera de rango en el conjunto PhyWorld parabola, un escenario en el que DINO-WM y LeWM tienden a atraer la predicción hacia el rango de entrenamiento.

El repositorio contiene tres brazos de predictor (MLP, cuadrático y transformer) evaluados en tres configuraciones (LH-P entrenado desde cero, K2 con encoder de LeWM entrenado junto al predictor y K5 con encoder de LeWM congelado), con dos semillas por brazo salvo el brazo C en K2 y K5. Los resultados se miden con una sonda que lee la velocidad a partir de un fotograma predicho a partir de los fotogramas reales anteriores, y solo se juzga la clase de una ejecución cuando supera la puerta de rango interno.

El interés actual del artefacto es metodológico: ofrece una comparación reproducible entre predictores con estructura física (hamiltoniana) y predictores latentes convencionales en una tarea de generalización fuera de distribución. No obstante, el alcance es muy limitado (un único conjunto de datos, dos semillas, una sonda de velocidad) y el autor no ha elegido licencia para los checkpoints ni para los ficheros de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA con predictor de dinámica latente y estructura hamiltoniana (LeHami); brazos MLP, cuadrático y transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible para checkpoints y evaluaciones; componentes de origen Apache 2.0 (LeHami), MIT (LeWM) y CC-BY-4.0 (PhyWorld) |
| Formato de pesos | PyTorch state dict (`.pt`) del módulo JEPA: encoder, projector, action encoder y predictor |

## Arquitectura y entrenamiento

El artefacto se construye sobre LeHami, una propuesta de dinámica latente con estructura hamiltoniana (commit `f90a3b1`, Apache 2.0, de Romina Yalovetzky, Randall Balestriero y Yann LeCun), combinada con el encoder de LeWM (MIT, de Lucas Maes). El módulo JEPA incluye encoder, projector, action encoder y predictor; los checkpoints guardan el state dict completo y un `config.json` que selecciona el brazo (`arm`) mediante `C.build_model(cfg["arm"])`.

El entrenamiento se organiza en tres configuraciones. LH-P entrena el encoder desde cero junto al predictor. K2 parte del encoder de LeWM run1 y lo entrena junto al predictor. K5 usa el encoder de LeWM run1 congelado. Cada configuración se prueba con tres predictores: arm A (MLP sobre T), arm B (T cuadrático) y arm C (transformer). Las velocidades de entrenamiento están en torno a 1,0–4,0 unidades/s y el grupo rápido tiene una velocidad real de 5,25. Se guardan checkpoints en los pasos 30.000 y 61.170; los informes usan el de 30.000 solo como tendencia. Los datos provienen de PhyWorld (Kang et al., ICML 2025), con 1.056 vídeos de evaluación, y no se incluyen en el repositorio.

## Capacidades

- Predicción de dinámica latente en entornos físicos 2D (PhyWorld parabola) a partir de fotogramas y acciones.
- Lectura de velocidad mediante sonda sobre fotogramas predichos (evaluación de generalización fuera de rango).
- Tres variantes de predictor: MLP, cuadrático y transformer, comparables entre configuraciones de encoder.
- Evaluación con cross-fit de sondas (`*_cf`) y análisis bootstrap pareado de la diferencia entre brazos.
- Reproducción de rollouts con vídeos comparativos frente a GT, DINO-WM y LeWM.
- No soporta tool calling, agentes, multilingüismo, visión general, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Investigación en world models: comparar predictores con estructura hamiltoniana frente a baselines latentes (DINO-WM, LeWM) en una tarea controlada de generalización fuera de distribución.
- Reproducción de experimentos: cargar `checkpoints/lehami/k5_armB_s0/weights_step61170.pt` con `lh_common` para repetir las lecturas de la sonda y verificar los informes de `reports/`.
- Estudio de la influencia del encoder: usar las configuraciones K2 (encoder ajustado) y K5 (encoder congelado) para aislar cuánto del comportamiento fuera de rango proviene del predictor y cuánto del encoder.
- Análisis de sesgo inductivo: comparar el brazo B (T cuadrático) con el brazo A (MLP) mediante el bootstrap pareado ya calculado (0,740 [0,589, 0,893] en semilla 0; 1,053 [0,886, 1,228] en semilla 1 para K5).
- Docencia y divulgación: usar los vídeos de `videos/` (GT, DINO-WM, LeWM, LeHami A, LeHami B, rejilla y `half_speed/`) para ilustrar el fenómeno de atracción al rango de entrenamiento.
- Auditoría metodológica: revisar `SHA256SUMS` y `SHA256SUMS.optional` para verificar la integridad de los ficheros de las dos partes del repositorio antes de reutilizarlos.

## Benchmarks y rendimiento

Resultados del experimento (velocidad leída por la sonda en el paso rápido; entre paréntesis, semillas 0 y 1):

| Configuracion | Encoder | Arm A (MLP T) | Arm B (T cuadratico) | Arm C (transformer) |
|---|---|---|---|---|
| LH-P | desde cero con el predictor | fallo de puerta (ambas semillas) | fallo de puerta (ambas semillas) | fallo de puerta (ambas semillas) |
| K2 | encoder de LeWM run1, entrenado con el predictor | sigue (5,97; 5,21) | sigue (6,16; 6,12) | fallo de puerta (semilla 0) |
| K5 | encoder de LeWM run1, congelado | intermedio (5,08; 4,69) | sigue (5,82; 5,74) | fallo de puerta (semilla 0) |
| Referencia | DINO-WM 4,00 (atraido); LeWM runs 1-3: 3,05; 3,20; 3,39 (atraidos) | | | |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,8 GB en total, pero se subió en dos partes de 3,65 GB y 3,81 GB, lo que sugiere que el tamaño real de los artefactos es mayor que el indicado en la ficha de Hugging Face.
- GPU recomendadas: no disponible; el ejemplo de carga usa `map_location="cpu"`, por lo que la inferencia en CPU es viable para inspección.
- Cabe en GPU de consumo: probablemente sí para los checkpoints individuales, pero no hay datos publicados de VRAM por checkpoint.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `C.build_model`), requiriendo `le-wm` y LeHami en el `PYTHONPATH` según el README del repositorio de GitHub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en PhyWorld (velocidad) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LeHami (este artefacto) | JEPA con estructura hamiltoniana | no disponible | no disponible | 5,82–6,16 (arm B, K2/K5); fallo de puerta en LH-P | no disponible para checkpoints | Hugging Face (hanbin5/lehami-phyworld) |
| DINO-WM | World model basado en DINO | no disponible | no disponible | 4,00 (atraído al rango) | no disponible en la información | Referenciado en el informe |
| LeWM | World model latente | no disponible | no disponible | 3,05; 3,20; 3,39 (atraídos) | MIT (código `le-wm`) | Repositorio GitHub jongmin-s-multicore/le-wm |

## Limitaciones y advertencias

- Alcance experimental muy reducido: un único conjunto de datos (PhyWorld parabola), dos semillas por brazo (una sola para el brazo C en K2 y K5) y una sonda de velocidad como única medida.
- Los nombres de clase y los umbrales de la puerta de rango están definidos en los informes, no en la model card; sin ellos, los resultados no son interpretables de forma aislada.
- No hay licencia elegida para los checkpoints ni para los ficheros de evaluación, lo que impide su uso comercial sin aclaración previa del autor.
- Los paths internos de los JSON hacen referencia a `$DINO_WORK/...`, la carpeta de trabajo del código, por lo que la reproducibilidad exige reconstruir esa estructura.
- Los vídeos de PhyWorld no se incluyen en el repositorio; deben obtenerse de `magicr/phyworld` (CC-BY-4.0) y convertirse con el código de GitHub.
- No es un modelo de lenguaje: no admite generación de texto, tool calling, agentes ni capacidades multilingües; no aplica el riesgo de alucinación en el sentido habitual.
- El tamaño del repo indicado (0,8 GB) no coincide con las dos partes descritas (3,65 GB + 3,81 GB), lo que puede indicar una ficha incompleta o un problema de metadatos en Hugging Face.
- No hay información sobre sesgos, latencia, throughput ni requisitos de hardware por checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/hanbin5/lehami-phyworld
- Dataset PhyWorld: https://huggingface.co/datasets/magicr/phyworld
- Código y write-up completo: https://github.com/jongmin-s-multicore/thread0 (rama `hanbin5/lehami-phyworld`, carpeta `lehami_phyworld/`)
- LeHami (implementación original): https://github.com/rominay/LeHami
- LeWM: https://github.com/jongmin-s-multicore/le-wm
