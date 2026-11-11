# haag-lidar/point-sam-wytham-lora

## Resumen

Point-SAM Wytham LoRA es un checkpoint de investigación derivado de Point-SAM (ViT-L), un modelo segmentador de nubes de puntos 3D con prompting tipo "click". El modelo original lo desarrollan Zhou et al. (arXiv:2406.17741) y esta versión concreta la publica el equipo haag-lidar del proyecto CS 6999 HAAG LiDAR del Georgia Institute of Technology. El problema que aborda es la segmentación automática de árboles individuales en escaneos LiDAR terrestres de bosque, una tarea de alto interés en inventario forestal y ecología cuantitativa.

La adaptación consiste en un fine-tuning con adaptadores LoRA (rango 8, alpha 16) sobre las proyecciones query y value de la atención, junto con el entrenamiento del patch embedding, prompt encoder, mask encoder y mask decoder: 5,8 M de parámetros entrenables sobre un total de 311,8 M. Los adaptadores se han fusionado en los pesos finales, de modo que el checkpoint se carga exactamente igual que el modelo base. Se entrenó sobre el benchmark ISPRS Wytham (Cherlet et al. 2026), concreto y limitado a un único bosque templado del Reino Unido.

Es relevante ahora porque demuestra empíricamente dos cosas: que el fine-tuning con LoRA mejora drásticamente el modelo base (F1 de 0,006 a 0,181 en el conjunto de test) y que, aun así, un método basado en reglas sin entrenamiento (TreeX) supera a este checkpoint en ese mismo bosque. El autor lo publica explícitamente como material de reproducción, no como herramienta lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L (Point-SAM, segmentación promptable de nubes de puntos) |
| Parámetros totales | 311.042.732 (5,8 M entrenables con LoRA, fusionados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 10.000 puntos por crop de 12 m (configuración de entrenamiento) |
| Tipos de cuantización | no disponible (solo safetensors en fp32/fp16 según el repo) |
| Idiomas soportados | no disponible (modelo multimodal sobre nubes de puntos, sin texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo base Point-SAM es un transformer ViT-L adaptado a nubes de puntos, con un prompt encoder que acepta clics positivos y negativos sobre la nube y un mask decoder que devuelve tres máscaras candidatas por prompt. El checkpoint hereda esa arquitectura sin cambios estructurales: el fine-tuning añade adaptadores LoRA (rank 8, alpha 16) en las proyecciones query y value de la atención y entrena además el patch embedding, el prompt encoder, el mask encoder y el mask decoder. En total, 5,8 M de parámetros de 311,8 M.

El entrenamiento usó el split de entrenamiento del benchmark ISPRS Wytham: 431 árboles y 182 crops de 12 m, con 10.000 puntos por crop y sin color (todos los puntos comparten el mismo feature). Se ejecutaron 3.000 pasos, unas 33 pasadas sobre los datos, con learning rate 1e-4 para el modelo y 2e-4 para los adaptadores, en una única NVIDIA H100 durante unos 20 minutos. El checkpoint se seleccionó por `val_iou_pick` sobre el split de validación (0,577). La receta de entrenamiento, los métodos de generación de clics y la fusión de máscaras están adaptados del trabajo de Kevin Hu en `Landscape-CV/Ecomodel`. No se documenta uso de RLHF ni DPO, lo cual es esperable en un modelo de segmentación.

## Capacidades

- Segmentación promptable de nubes de puntos 3D: dado un clic positivo sobre un árbol, devuelve las máscaras candidatas correspondientes a ese objeto.
- Soporte de clics negativos y rondas de corrección, con los que fue entrenado (aunque en la evaluación sobre tiles completos solo se usaron clics positivos).
- Predicción de tres máscaras candidatas por prompt, con una selección automática de la mejor (`val_iou_pick`).
- Procesamiento de crops de 12 m con 10.000 puntos en el pipeline de entrenamiento.
- Integración en un pipeline completo de tile de 30 m: eliminación de suelo, generación de clics y fusión de máscaras (ver notebooks del repo de código).
- No soporta texto, visión RGB, audio ni tool calling: es un modelo puramente geométrico sobre coordenadas 3D, sin modalidad lingüística.
- No usa color ni intensidad: todos los puntos se tratan con el mismo feature.

## Casos de uso

- Investigación reproducible en segmentación forestal: sirve como checkpoint de partida para equipos que quieran replicar o extender los resultados del proyecto HAAG LiDAR, cargándolo con `build_point_sam` y el `model.safetensors` descargado.
- Benchmark de referencia para comparar métodos promptables frente a métodos basados en reglas (TreeX) en el mismo bosque, usando los notebooks `03_benchmark.ipynb` y `04_inference_steps.ipynb`.
- Experimentos de fine-tuning con LoRA en dominios 3D: la receta (rank 8, alpha 16, LR 2e-4 para adaptadores) y el script `isprs_lora.yaml` sirven de plantilla para adaptar Point-SAM a otros escaneos.
- Anotación asistida en inventario forestal: con clics manuales sobre troncos, el modelo puede proponer máscaras que un operador revise y corrija, reduciendo el trabajo de etiquetado aunque no lo automatice.
- Estudio de límites de la segmentación promptable: los resultados del autor (40 % de árboles con máscara válida incluso con clics perfectos) son un caso de análisis sobre el fallo típico de derrame de máscara hacia árboles vecinos.
- Desarrollo de pipelines de preprocesado LiDAR: el código de eliminación de suelo, generación de clics y fusión de máscaras es reutilizable independientemente de la calidad del checkpoint.
- Docencia y proyectos fin de máster: ejemplo completo de fine-tuning con LoRA, evaluación por F1 a IoU 0,5 y comparación con baseline en un dataset público con DOI.

## Benchmarks y rendimiento

Resultados publicados por el autor. F1 a IoU 0,5 sobre tiles completos de 30 m, con una predicción emparejada a un árbol y sin penalizar predicciones mayoritariamente sobre puntos no-árbol (`ignore_non_tree`).

| Modelo | Clics Stem-finder | Clics TreeX |
|---|---|---|
| Point-SAM original | 0,006 | 0,000 |
| Este checkpoint | 0,181 | 0,185 |

Diagnóstico sobre el split de validación (3 tiles, comparte algunos árboles cortados con entrenamiento):

| Método | Árboles con clic | Máscara buena antes de fusionar | Emparejados tras fusionar | F1 |
|---|---|---|---|---|
| Este checkpoint, clics TreeX | 56 % | 24 % | 22 % | 0,32 |
| Este checkpoint, clics perfectos (de las etiquetas) | 97 % | 40 % | 35 % | 0,44 |
| TreeX solo, sin modelo | 56 % | no aplica | 51 % | 0,66 |

En crops de validación de 12 m con clics de las etiquetas, la máscara elegida por el modelo promedia IoU 0,54, la mejor de las tres candidatas promedia 0,68 y tras rondas de corrección alcanza 0,89.

## Requisitos de hardware

- GPU NVIDIA obligatoria: Point-SAM depende de `torkit3d`, una librería solo para CUDA.
- Entrenamiento documentado: una NVIDIA H100, unos 20 minutos para 3.000 pasos.
- VRAM de inferencia: no disponible en la información proporcionada; el repo pesa 1,2 GB en safetensors, lo que da una cota inferior del orden de 1,2 GB en fp32 solo para pesos, más activaciones y buffers de la nube de puntos.
- GPU consumer: no verificado; no hay datos publicados sobre funcionamiento en RTX 4090, 3090 u otras consumer, aunque el tamaño de pesos (311 M de parámetros) sugiere que cabría en GPUs con suficiente VRAM para el pipeline completo.
- Despliegue: no se documenta vLLM, llama.cpp, Ollama ni TGI; el uso previsto es el paquete propio del repo de código (`treeseg.models.point_sam`) con PyTorch y CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | F1 (test Wytham) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Point-SAM Wytham LoRA) | 311,8 M (5,8 M entrenables) | 10.000 puntos por crop de 12 m | 0,181–0,185 | Apache 2.0 | Hugging Face |
| Point-SAM original (`yuchen0187/Point-SAM`) | 311,8 M | 10.000 puntos por crop de 12 m | 0,000–0,006 | Apache 2.0 | Hugging Face |
| TreeX (método basado en reglas, `ai4trees/pointtree`) | no aplica (sin entrenamiento) | nube de puntos completa | 0,66 | no disponible en la información | GitHub |

TreeX no es un modelo neuronal sino un método geométrico sin entrenamiento; se incluye porque el propio autor lo usa como referencia y supera a este checkpoint en el bosque evaluado.

## Limitaciones y advertencias

- El propio autor indica que el checkpoint "no es todavía suficientemente bueno como segmentador automático de árboles"; no debe usarse en producción sin revisión humana.
- Dominio muy restringido: un único bosque (Wytham Woods, Reino Unido, frondosas templadas) y un único escáner. No hay evidencia de generalización a otros sitios.
- En dos tiles de un escaneo de isla subtropical, los clics de TreeX solo encontraron 2 o 3 troncos por tile, por lo que el pipeline automático no se traslada tal cual.
- El fallo principal es el derrame de máscara hacia árboles vecinos: incluso con clics perfectos, solo el 40 % de los árboles obtiene una máscara con IoU ≥ 0,5.
- Resolución limitada: 10.000 puntos por crop de 12 m, sin detalle fino de ramas.
- Sin color ni intensidad: toda la información es geométrica.
- La evaluación sobre tiles completos usa solo un clic positivo por árbol; los clics negativos y las rondas de corrección, con los que el modelo fue entrenado, aún no se han probado en tiles completos.
- El split de validación comparte algunos árboles cortados con entrenamiento, por lo que sus métricas son diagnósticas y no resultados finales.
- Dependencia de `torkit3d` (solo CUDA): no hay soporte documentado para CPU, ROCm ni Apple Silicon.
- Licencia Apache 2.0, que permite uso comercial, pero el estado de investigación y la falta de validación fuera de dominio desaconsejan cualquier uso comercial sin evaluación propia.
- Riesgo de alucinación en el sentido geométrico: puede devolver máscaras plausibles pero incorrectas, especialmente en zonas densas.
- Sin información sobre sesgos demográficos o lingüísticos (no aplica), pero sí sobre sesgo de dominio (un solo bosque y escáner).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haag-lidar/point-sam-wytham-lora
- Modelo base: https://huggingface.co/yuchen0187/Point-SAM
- Repositorio de código, configs y notebooks: https://github.com/nisulay/pointsam-training
- Repositorio de Point-SAM original: https://github.com/zyc00/Point-SAM
- Paper de Point-SAM: https://arxiv.org/abs/2406.17741
- TreeX (método de referencia): https://github.com/ai4trees/pointtree
- Dataset ISPRS Wytham benchmark (Cherlet et al. 2026, CC BY 4.0): https://doi.org/10.5281/zenodo.16875688
- Repositorio de receta de entrenamiento original: `Landscape-CV/Ecomodel` (no se proporciona URL directa en la información disponible)
