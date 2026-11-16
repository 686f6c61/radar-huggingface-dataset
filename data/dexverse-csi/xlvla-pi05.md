# Dexverse-CSI/xlvla-pi05

## Resumen

xlvla-pi05 es una colección de políticas robóticas (no un modelo de lenguaje generativo) publicada por Dexverse-CSI bajo el paraguas de los baselines pi0.5 de openpi, implementadas en JAX. El repositorio agrupa varios experimentos de visión-lenguaje-acción (VLA) entrenados sobre demostraciones de teleoperación del dataset DexVerse, con el objetivo de comparar distintas representaciones del espacio de acciones: un espacio latente VAE de 32 dimensiones (etiquetado XL-VLA) frente al espacio de acciones articular conjunto (baseline), tanto en tareas monobrazo como bimanuales.

La propuesta técnica central es el uso de un espacio de acción latente derivado de un VAE para modelar el control de hasta seis manos robóticas distintas, junto con una variante bimanual que emplea un latente independiente por brazo de 82 dimensiones frente a las 62 dimensiones del espacio articular conjunto. El repositorio incluye además configuraciones de evaluación zero-shot (entrenamiento con cinco manos y evaluación sobre seis) y un conjunto "diagonal" con celdas retenidas, lo que sugiere un interés en medir generalización cruzada entre morfologías de mano.

Con 74,6 GB de tamaño de repositorio, el contenido son checkpoints de pesos más assets de normalización y los datasets de entrenamiento empaquetados, no un modelo de texto. La model card es extremadamente escueta en cuanto a especificaciones formales (sin licencia declarada, sin idiomas, sin pipeline), por lo que buena parte de los datos técnicos habituales en esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (openpi) en JAX; política VLA con espacio de acción latente VAE (XL-VLA) o articular conjunto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints JAX en `checkpoint/<step>/` (params + assets de normalización); no se especifica safetensors ni GGUF |
| Dimension del espacio de acción | 32 (latente VAE, monobrazo); 82 (latente bimanual, por brazo); 62 (articular bimanual) |
| Pasos de entrenamiento | 20k (multitask), 5k (zero-shot) |
| Manos robóticas | 6 en total (shadow, inspire, sharpa, wuji y otras no detalladas) |
| Tareas | 4 monobrazo (GB, GP, GK, FH) y 4 bimanuales (OFF, SUK, BLT, BLC) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura pi0.5 del proyecto openpi, implementada en JAX, que es una política visión-lenguaje-acción que mapea observaciones visuales y consignas de tarea a comandos motores. La innovación respecto al baseline es el uso de un espacio de acción latente: un VAE comprime las acciones en 32 dimensiones (monobrazo) o 82 dimensiones por brazo (bimanual), frente a las 62 dimensiones del espacio articular conjunto en la variante bimanual. Esto reduce la dimensionalidad efectiva de la señal de control y, según la hipótesis del autor, facilita el aprendizaje multi-morfo.

El entrenamiento se realiza sobre demostraciones de teleoperación del dataset DexVerse, empaquetadas en formato LeRobot y adjuntas en cada carpeta de experimento. Se distinguen tres regímenes: multitask (6 manos × 4 tareas, 20k pasos, un modelo por método), zero-shot (una tarea, entrenada con 5 manos y evaluada sobre las 6, 5k pasos) y diagonal (multitask menos 4 celdas retenidas: shadow-GB, inspire-GP, sharpa-GK, wuji-FH). No se especifica en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO, algo poco habitual en políticas robóticas.

## Capacidades

- Control robótico de manipulación monobrazo para tareas de agarre (GraspBleach, GraspPan, GraspKettle) y golpeo funcional (FunctionalHammerStrike).
- Manipulación bimanual para apertura de carpetas (OpenFlatFolder), deslizamiento de cuchillo (SlideUtilityKnife) y elevación de bandejas y cartones (BimanualLiftTray, BimanualLiftCarton).
- Generalización entre morfologías de mano: variantes zero-shot entrenadas con 5 manos y evaluadas sobre 6.
- Representación de acciones en espacio latente (32 dims) o articular (62/82 dims según variante).
- Política condicionada por tarea (visión + consigna) con marcador de objetivo visible en el renderizado y la evaluación.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento en el sentido de los LLM.

## Casos de uso

- Investigación en representaciones de acción para VLA: comparar directamente el espacio latente VAE (XL-VLA) frente al articular conjunto con los checkpoints ya entrenados, usando la misma base de datos y número de pasos.
- Benchmarking de generalización entre manos robóticas: emplear las variantes zero-shot (5 manos de entrenamiento, 6 de evaluación) para medir la transferencia a una morfología no vista, como shadow en GB o inspire en GP.
- Evaluación de manipulación bimanual: usar los checkpoints `bimanual_pi05_XL` y `bimanual_pi05` para tareas de dos brazos (OFF, SUK, BLT, BLC) y contrastar las 82 dimensiones latentes frente a las 62 articulares.
- Estudio de retención de celdas (diagonal): reproducir el conjunto con las cuatro celdas retenidas para analizar el efecto de eliminar combinaciones específicas mano-tarea del entrenamiento multitask.
- Reproducción de baselines para publicación: los checkpoints, datasets y `config.yaml` permiten replicar los experimentos del paper RSS2027 sin reentrenar desde cero.
- Integración en pipelines de evaluación robótica con LeRobot: cargar el dataset empaquetado y los assets de normalización para ejecutar políticas en simulación o en un banco de pruebas físico con las manos soportadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo, 74,6 GB, incluye checkpoints y datasets, no solo pesos).
- GPU recomendadas: no disponible; al ser JAX/openpi, se espera compatibilidad con aceleradores NVIDIA, pero no se especifica en la información.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: openpi (JAX); no se documenta vLLM, llama.cpp, Ollama ni TGI, que son herramientas para LLM y no aplican a esta política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Espacio de acción | Manos | Pasos | Licencia |
|---|---|---|---|---|---|
| xlvla-pi05 | VLA pi0.5 (JAX) | Latente VAE 32 / articular 62-82 | 6 | 20k / 5k | no disponible |
| pi05 (baseline) | VLA pi0.5 (JAX) | Articular conjunto | 6 | 20k | no disponible |
| lad-pi05 (Dexverse-CSI/lad-pi05) | VLA pi0.5 con LAD latente | Latente LAD | no disponible | no disponible | no disponible |
| openpi (referencia) | Framework VLA | Variable | Variable | Variable | según openpi |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval ni GSM8K; su ámbito es el control robótico.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Los checkpoints no incluyen `train_state`, solo params y assets de normalización, lo que limita la reanudación del entrenamiento.
- El alcance está restringido a 6 manos y 8 tareas concretas; no hay evidencia de generalización a otras morfologías o entornos fuera de DexVerse.
- El repositorio pesa 74,6 GB e incluye datasets empaquetados, lo que complica su descarga y almacenamiento en entornos con cuotas.
- No se documentan sesgos, tasas de alucinación ni robustez fuera de distribución; los resultados de generalización zero-shot no se cuantifican en la información disponible.
- La model card no detalla hiperparámetros, composición del dataset ni métricas de éxito, lo que dificulta la comparación rigurosa con otros baselines.

## Enlaces

- Hugging Face: https://huggingface.co/Dexverse-CSI/xlvla-pi05
- Modelo hermano (LAD latente): https://huggingface.co/Dexverse-CSI/lad-pi05
- Código: https://github.com/HyeonseokE/cross_dex (ruta `cross_dex/baselines/xlvla/dexverse_xlvla`)
- openpi (framework base): no disponible en la información proporcionada
- Paper RSS2027: no disponible en la información proporcionada
