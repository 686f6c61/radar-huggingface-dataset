# MonicaVahd/skeletoneqa-weights-open

## Resumen

SkeletonEQA es un conjunto de pesos de PyTorch para clasificación binaria de calidad de sentadillas (0 = incorrecta, 1 = correcta) a partir de secuencias de esqueletos de 18 articulaciones en formato OpenPose con tensor de entrada de forma `(N, 3, 100, 18, 1)`. No es un modelo de lenguaje ni un transformer generativo: es un artefacto de investigación que acompaña al estudio de benchmark *Skeleton-Based Exercise Quality Assessment Under Domain Shift* (MCHM '26, DOI 10.1145/3840471.3842592), centrado en medir la degradación de rendimiento de clasificadores de acción esquelética cuando cambia el dominio de datos (sujeto, conjunto de datos o dispositivo de captura).

El repositorio no contiene un único modelo, sino 416 ficheros de pesos (3,92 GB) que cubren ocho arquitecturas esqueléticas —ST-GCN, InfoGCN, BlockGCN, HD-GCN, ProtoGCN, SkateFormer, HyperFormer y FreqMixFormer— entrenadas bajo múltiples protocolos experimentales: leave-one-subject-out (LOSO), validación cruzada de 5 folds y evaluación out-of-distribution (OOD) de una y varias fuentes. Cada fichero es un `state dict` plano de PyTorch, sin estado de optimizador ni claves de envoltorio.

Su relevancia es metodológica: ofrece pesos reproducibles para estudiar domain shift en reconocimiento de acciones con esqueletos, un problema práctico en rehabilitación, entrenamiento deportivo y evaluación automatizada de ejercicio. El autor lo publica como "weights only, no dataset samples", de modo que los datos originales (EC3D, UI-PRMD, REHAB24-6 y un conjunto Custom) deben obtenerse de sus autores respectivos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ocho arquitecturas de reconocimiento de accion basado en esqueletos: ST-GCN, InfoGCN, BlockGCN, HD-GCN, ProtoGCN, SkateFormer, HyperFormer, FreqMixFormer |
| Parametros totales | no disponible (no se documenta el conteo por modelo; el repo pesa 3,92 GB en 416 ficheros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; secuencia de entrada fija de 100 frames, 18 articulaciones, 3 canales, 1 persona |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precision original de PyTorch, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de vision/esqueletos, no linguistico) |
| Licencia | other / mixed-see-licence-section (ver seccion de licencia en el README del repo) |
| Formato de pesos | `.pth` (PyTorch `state dict` plano, `OrderedDict` de tensores) |
| Entrada | Tensor `(N, 3, 100, 18, 1)` — coordenadas OpenPose de 18 articulaciones |
| Salida | Clasificacion binaria: 0 = sentadilla incorrecta, 1 = sentadilla correcta |
| Tamano del repositorio | 3,92 GB, 416 ficheros |
| Framework | PyTorch |
| Semilla de entrenamiento | 42, ejecucion unica por fichero |

## Arquitectura y entrenamiento

El repositorio agrupa ocho arquitecturas de grafos espacio-temporales para esqueletos, no una sola. ST-GCN es el modelo base de convolucion en grafo; InfoGCN, BlockGCN, HD-GCN y ProtoGCN son variantes posteriores que incorporan mejoras de informacion mutua, bloques de grafos o prototipos; SkateFormer, HyperFormer y FreqMixFormer exploran atencion y mezcla en dominio frecuencial. Todas operan sobre secuencias de 100 frames con 18 articulaciones OpenPose y producen una etiqueta binaria de calidad de sentadilla.

El protocolo de entrenamiento comun (seccion 3.3 del paper) usa Adam con learning rate 1e-3, weight decay 1e-4, `ReduceLROnPlateau` (paciencia 10, factor 0.5), batch size 16, hasta 200 epocas, early stopping sobre perdida de validacion (paciencia 20) y entropia cruzada ponderada por frecuencia inversa para compensar el desbalance de clases. Cada fichero corresponde a una unica ejecucion con semilla 42, por lo que el autor advierte que reentrenar no reproduce exactamente los pesos. El codigo esta en el repositorio GitHub `MonicaVahd/FAIRCoachOOD`, tag `v0.1.0`, commit `859324b343a2bf4fbd25376004692d9da078f9c6`. Se documenta una desviacion conocida: el script de SkateFormer D1 usa paciencia de early stopping de 50 en lugar de 20 (`docs/KNOWN_DIFFERENCES.md`, D5).

Los experimentos se organizan en condiciones: A (LOSO o 5-fold sobre un unico dataset), B (OOD de fuente unica, entrenando con el 80 % de un dataset y evaluando en otro) y C (OOD multi-fuente, con pool del 90 % de dos o tres datasets). Los conjuntos de datos implicados son EC3D, UI-PRMD, REHAB24-6 y un conjunto Custom; las carpetas cuyo pool incluye Custom (`A3_kfold`, `B5`, `B6`, `B12`, `C2`, `C7`, `C9`) contienen pesos entrenados parcialmente con videos instructivos publicos no redistribuidos. Existen grupos adicionales sin tabla en el paper: `A1_loso_run2` y `A4_loso_run2` (segunda tanda de folds LOSO), `D1_ablation_*` (ablacion de normalizacion sobre datos agrupados) y `B3_supcon` (variante SupCon de B3).

## Capacidades

- Clasificacion binaria de calidad de sentadilla (correcta/incorrecta) a partir de secuencias de esqueleto OpenPose de 18 articulaciones y 100 frames.
- Reconocimiento de accion basado en esqueletos mediante ocho arquitecturas comparables bajo un protocolo comun.
- Evaluacion de robustez ante domain shift: pesos entrenados para experimentos LOSO, k-fold y OOD de una y varias fuentes.
- Soporte de tool calling / function calling: no disponible (no es un modelo linguistico).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales: variante SupCon (`B3_supcon`) para aprendizaje contrastivo supervisado; ablacion de normalizacion (`D1_ablation_*`).
- No incluye deteccion de pose: requiere esqueletos ya extraidos con OpenPose u otro extractor compatible con el formato de 18 articulaciones.

## Casos de uso

- Evaluacion automatizada de sentadillas en gimnasios: cargar uno de los checkpoints (por ejemplo, `A1_loso` con SkateFormer) y clasificar secuencias de 100 frames extraidas de video para dar retroalimentacion binaria de tecnica al usuario.
- Investigacion en domain shift: usar los pares entrenamiento/prueba de las condiciones B y C para medir la caida de rendimiento al cambiar de dataset (EC3D a REHAB24-6, UI-PRMD a EC3D, etc.) y comparar arquitecturas bajo el mismo protocolo.
- Rehabilitacion fisica: los checkpoints entrenados con UI-PRMD y evaluados en REHAB24-6 permiten estudiar la transferibilidad de clasificadores de calidad de movimiento a poblaciones clinicas, con la cautela de que el dominio cambia.
- Benchmarking de arquitecturas esqueleticas: comparar ST-GCN, InfoGCN, BlockGCN, HD-GCN, ProtoGCN, SkateFormer, HyperFormer y FreqMixFormer con pesos ya entrenados, sin reentrenar desde cero.
- Validacion de pipelines de captura de movimiento: usar la variabilidad entre `A1_loso` y `A1_loso_run2` (misma condicion, dos tandas de ficheros) para estimar la sensibilidad del clasificador a la semilla y a la particion de folds.
- Estudio de aprendizaje contrastivo: emplear `B3_supcon` para analizar si la perdida SupCon mejora la separabilidad de clases en escenarios OOD frente a la entropia cruzada estandar.
- Prototipado de entrenadores personales digitales: integrar el clasificador como modulo de feedback en una aplicacion que ya disponga de extraccion de pose, usando el checkpoint de menor coste (ST-GCN) para inferencia en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia las tablas 5 y 6 del paper (MCHM '26, DOI 10.1145/3840471.3842592) para los resultados numericos, pero no incluye las cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo pesa 3,92 GB, pero corresponde a 416 checkpoints; un unico modelo de estas arquitecturas (ST-GCN a FreqMixFormer) es tipicamente de pocos millones de parametros y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponible en la documentacion. Por el tamano de las arquitecturas, cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para un checkpoint individual.
- Cabe en GPU consumer: previsiblemente si (GTX 1060 o superior), aunque el dato no esta confirmado en la informacion proporcionada.
- Opciones de despliegue: al ser `state dict` de PyTorch, requiere cargar el modelo con el codigo de `MonicaVahd/FAIRCoachOOD` (tag `v0.1.0`). No se documentan exportaciones a ONNX, TorchScript, vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SkeletonEQA (este repo) | Ocho arquitecturas esqueleticas | `(N, 3, 100, 18, 1)` | Binaria (calidad de sentadilla) | Secuencia fija de 100 frames | other / mixed | Hugging Face, 416 ficheros |
| ST-GCN original | Convolucion en grafo | Esqueletos | Clasificacion de accion | Secuencia variable | MIT (referencia habitual) | Repo publico |
| InfoGCN | Convolucion en grafo con info mutua | Esqueletos | Clasificacion de accion | Secuencia variable | no disponible | Repo publico |
| PoseC3D | 3D-CNN sobre heatmaps | Volumenes 3D | Clasificacion de accion | Secuencia variable | Apache 2.0 (referencia habitual) | MMAction2 |

La comparativa directa de rendimiento no es posible con la informacion disponible: el repositorio no publica metricas y los modelos de referencia se evaluan en tareas y datasets distintos (NTU RGB+D, Kinetics) frente a la tarea binaria de calidad de sentadilla de este benchmark.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Requiere esqueletos preextraidos en formato OpenPose de 18 articulaciones; no incluye deteccion de pose.
- Entrenado con semilla 42 y ejecucion unica: los pesos no son reproducibles bit a bit al reentrenar, y la variabilidad entre `A1_loso` y `A1_loso_run2` sugiere sensibilidad a la particion.
- Las carpetas con pool Custom (`A3_kfold`, `B5`, `B6`, `B12`, `C2`, `C7`, `C9`) se entrenaron parcialmente con videos instructivos publicos no redistribuidos, lo que puede limitar la reproducibilidad completa.
- Licencia mixta (`mixed-see-licence-section`): es imprescindible revisar la seccion de licencia del README antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Riesgo de sobreajuste al dominio: el propio diseno del benchmark mide la degradacion OOD, por lo que el rendimiento en poblaciones, dispositivos o estilos de ejecucion distintos a los de entrenamiento puede caer de forma significativa.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados de la demografia de los datasets de origen (EC3D, UI-PRMD, REHAB24-6).
- El repositorio no incluye muestras de datos; sin los datasets originales no se puede validar ni reentrenar.
- 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MonicaVahd/skeletoneqa-weights-open
- Codigo de entrenamiento: https://github.com/MonicaVahd/FAIRCoachOOD (tag `v0.1.0`, commit `859324b343a2bf4fbd25376004692d9da078f9c6`)
- Paper del benchmark: *Skeleton-Based Exercise Quality Assessment Under Domain Shift*, MCHM '26, DOI 10.1145/3840471.3842592
- Paper referenciado (tag `arxiv:2208.03257`): https://arxiv.org/abs/2208.03257
- Paper referenciado (tag `arxiv:2211.09590`): https://arxiv.org/abs/2211.09590
- Seccion de licencia: https://huggingface.co/MonicaVahd/skeletoneqa-weights-open/blob/main/README.md#licence
- Manifiesto de ficheros: `MANIFEST.csv` en el repositorio (tamano, SHA-256, modelo, condicion, pool, fold)
