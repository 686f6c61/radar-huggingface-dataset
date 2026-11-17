# emiraran/vesuvius-3d-surface-segmentation

## Resumen

El modelo `emiraran/vesuvius-3d-surface-segmentation` es un ensemble de diez redes neuronales tridimensionales de segmentación semántica, entrenado para detectar superficies de papiro carbonizado en escaneos de micro-tomografía computarizada (micro-CT). No es un modelo de lenguaje: es un modelo de visión por computador 3D orientado a un dominio muy específico, el Vesuvius Challenge, una competición de Kaggle cuyo objetivo es leer los textos ocultos en los rollos de Herculano carbonizados por la erupción del Vesubio.

El ensemble combina cinco instancias de `PureSegResNet3D` (18.795.969 parámetros cada una) y cinco instancias de `ResEncUNet3D` (15.912.097 parámetros cada una), todas implementadas en PyTorch con dependencia cero de MONAI en la inferencia. Los checkpoints se entrenaron con parches volumétricos de 160³ y 192³ vóxeles y se combinan con pesos ponderados que van de 1,0 a 4,5. El autor reporta una puntuación privada de 0,54788 en la competición (pública de 0,54030), lo que supone una mejora de +0,14368 respecto a su línea base inicial v1.

Su relevancia ahora radica en que demuestra una receta reproducible de segmentación volumétrica densa con ensembles multi-arquitectura sobre hardware modesto (los checkpoints ocupan entre 60 y 72 MB cada uno), y en que el pipeline completo (entrenamiento, métricas, inferencia con sliding-window y TTA, y post-procesado topológico) está publicado en GitHub. Es un artefacto útil para quien trabaje con imágenes médicas o volumétricas 3D y quiera replicar o adaptar la metodología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5x `PureSegResNet3D` + 5x `ResEncUNet3D` (redes convolucionales 3D de segmentación) |
| Parametros totales | 18.795.969 por checkpoint SegResNet3D; 15.912.097 por checkpoint ResEncUNet3D; 173.540.330 sumando los 10 checkpoints |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión 3D; trabaja con parches de 160³ o 192³ vóxeles) |
| Tipos de cuantizacion | No disponible (checkpoints en precisión original PyTorch) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch state_dict), más `modeling.py` para carga autónoma |

## Arquitectura y entrenamiento

El ensemble está formado por dos familias de arquitecturas convolucionales 3D. `PureSegResNet3D` es una adaptación de SegResNet con 18.795.969 parámetros, y `ResEncUNet3D` es una U-Net con bloques residuales de 15.912.097 parámetros. Cada checkpoint se entrenó sobre parches volumétricos de 160³ o 192³ vóxeles, con entradas normalizadas en el rango [0, 1] y una única modalidad de canal (B, 1, D, H, W). La combinación final pondera los modelos con pesos explícitos (4,5 para el mejor SegResNet3D afinado sobre todos los datos, hasta 1,0 para los ResEncUNet3D de menor peso), lo que sugiere una selección empírica basada en validación cruzada por folds.

El entrenamiento siguió una progresión documentada: de una U-Net 3D inicial en TensorFlow con parches de 96³ (0,40420 privado) a una versión PyTorch con 128³ (0,47161), luego un escalado progresivo a 160³/192³ (0,52719), un ensemble de 8 modelos (0,53265) y finalmente el ensemble de 10 modelos con fine-tuning sobre todos los datos a 192³ (0,54788). El autor no documenta en la model card el número de tokens ni la composición exacta del dataset más allá de que proviene del Vesuvius Challenge Surface Detection; el pipeline incluye post-procesado topológico, lo que indica que se optimizó la coherencia geométrica de las superficies segmentadas, no solo la métrica por vóxel.

## Capacidades

- Segmentación volumétrica 3D densa de superficies de papiro en escaneos micro-CT.
- Ensemble multi-arquitectura con ponderación por checkpoint para reducir varianza.
- Inferencia con sliding-window y test-time augmentation (TTA), documentada en el repositorio de GitHub.
- Post-procesado topológico para imponer coherencia geométrica en las superficies predichas.
- Carga autónoma en PyTorch sin dependencia de MONAI mediante `modeling.py`.
- Entrada flexible en tamaño de parche (160³ y 192³ en los checkpoints publicados).
- No soporta tool calling, agentes, multi-step reasoning ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo thinking, visión 2D general, audio ni otras capacidades multimodales fuera del dominio volumétrico.

## Casos de uso

- Segmentación de superficies en rollos de Herculano: el ensemble se aplica directamente sobre volúmenes micro-CT normalizados para producir máscaras de superficie que después se usan en el pipeline de lectura virtual del Vesuvius Challenge; es adecuado porque está entrenado específicamente en ese dominio y reporta una puntuación de competición verificable.
- Investigación en imagen médica volumétrica: sirve como referencia reproducible de ensemble SegResNet/ResEncUNet para segmentación 3D densa; se puede adaptar cambiando el dataset y reentrenando con el código de GitHub.
- Reconstrucción de materiales arqueológicos: cualquier material carbonizado o con contraste similar en micro-CT puede beneficiarse del pipeline de sliding-window y post-procesado topológico.
- Docencia y reproducción de pipelines de Kaggle: los diez checkpoints con pesos explícitos y la progresión de puntuaciones documentada permiten estudiar empíricamente el efecto del escalado de parche y del ensemble.
- Prototipado de inferencia 3D en hardware modesto: cada checkpoint pesa entre 60 y 72 MB, de modo que un solo modelo cabe en GPU de consumo y el ensemble completo (~0,7 GB) se puede evaluar en una sola GPU de 16-24 GB con sliding-window.
- Base para fine-tuning en dominios volumétricos afines: al estar liberado bajo MIT y con `modeling.py` independiente de MONAI, se puede integrar en pipelines propios de PyTorch sin arrastrar dependencias pesadas.
- Benchmarking de ensembles multi-arquitectura: comparar SegResNet3D frente a ResEncUNet3D sobre el mismo dataset con los pesos publicados permite estudiar qué arquitectura aporta más al ensemble.

## Benchmarks y rendimiento

| Etapa | Public LB | Private LB |
|---|---:|---:|
| v1 TensorFlow 3D U-Net (96³) | 0,39477 | 0,40420 |
| v2 PyTorch inicial (128³) | 0,46164 | 0,47161 |
| v2 escalado progresivo (160³/192³) | 0,52229 | 0,52719 |
| v2 ensemble de 8 modelos | 0,52601 | 0,53265 |
| v2 ensemble de 10 modelos (192³, fine-tune all-data) | 0,54030 | 0,54788 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo de segmentación 3D y no de lenguaje. La métrica reportada es la puntuación de la competición Vesuvius Challenge Surface Detection.

## Requisitos de hardware

- VRAM estimada: un checkpoint individual (60-72 MB de pesos) requiere aproximadamente 1-2 GB de VRAM para inferencia con parches de 192³; el ensemble completo de 10 modelos en memoria concurrente ronda los 8-12 GB, dependiendo del batch y del sliding-window.
- GPU recomendadas: NVIDIA A100 o H100 para inferencia rápida del ensemble completo con TTA; RTX 4090 (24 GB) suficiente para el ensemble con sliding-window moderado; RTX 3090/4080 (16-24 GB) viables para subconjuntos del ensemble.
- Cabe en GPU de consumo: sí, un checkpoint individual en RTX 3060 (12 GB) o superior; el ensemble completo conviene en GPU de 16 GB o más.
- Opciones de despliegue: PyTorch nativo con `modeling.py` (sin MONAI); el repositorio de GitHub documenta el pipeline de inferencia con sliding-window y TTA; no se mencionan vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / parche | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `emiraran/vesuvius-3d-surface-segmentation` | 173,5 M en total (10 checkpoints) | Parches 160³ y 192³ | Private LB 0,54788 | MIT | Hugging Face + GitHub |
| SegResNet3D individual (mismo autor) | 18,8 M | Parches 160³/192³ | No disponible como modelo suelto | MIT | Incluido en el ensemble |
| ResEncUNet3D individual (mismo autor) | 15,9 M | Parches 160³/192³ | No disponible como modelo suelto | MIT | Incluido en el ensemble |
| U-Net 3D v1 TensorFlow (línea base del autor) | No disponible | 96³ | Private LB 0,40420 | MIT | Referenciado en la model card |

No se dispone de comparación con ensembles de terceros en la información proporcionada; los únicos puntos de comparación documentados son las etapas internas del propio autor.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre escaneos micro-CT de papiro carbonizado del Vesuvius Challenge; su rendimiento fuera de ese dominio no está validado.
- Riesgo de sobreajuste al dataset de competición: la puntuación de 0,54788 es la métrica de la competición, no una validación independiente en otros volúmenes.
- Sesgos conocidos: no documentados en la model card; al ser un modelo de segmentación, los sesgos se manifiestan como errores sistemáticos en tipos de superficie, niveles de contraste o artefactos de escaneo.
- Alucinación: en segmentación se traduce en falsos positivos de superficie; el post-procesado topológico mitiga parte del problema, pero no lo elimina.
- Limitaciones de contexto o idioma: no aplica idioma; el tamaño de parche está limitado a 160³/192³ y requiere sliding-window para volúmenes mayores.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni documenta condiciones adicionales sobre los datos de entrenamiento del Vesuvius Challenge.
- Caveat de producción: el ensemble completo multiplica el coste de inferencia por diez; conviene evaluar subconjuntos con los pesos publicados antes de desplegar los diez checkpoints.
- No es un modelo generativo ni un LLM: no debe confundirse con un modelo de lenguaje pese a estar alojado en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emiraran/vesuvius-3d-surface-segmentation
- Repositorio GitHub (entrenamiento, métricas, inferencia y post-procesado topológico): https://github.com/EmirMuhammetARAN/vesuvius-3d-surface-segmentation
- Competición Vesuvius Challenge Surface Detection: https://www.kaggle.com/competitions/vesuvius-challenge-surface-detection
