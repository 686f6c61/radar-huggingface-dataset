# rocknroll17/BFL

## Resumen

BFL (Beyond Family Labels) es un conjunto de checkpoints de investigación publicados por Yunchan Jeon y colaboradores (SooGon Kim, Seungwook Kim, CheolWon Lee, Jongmin Lee) para el artículo «Beyond Family Labels: A Taxonomic Ornstein–Uhlenbeck Prior for Avian 3D Shape Recovery», aceptado en NeurIPS 2026. No es un modelo de lenguaje: es un modelo de reconstrucción de forma 3D y estimación de pose de aves a partir de imágenes, construido mediante fine-tuning de AniMer+ durante 30 000 pasos sobre el conjunto de datos CtrlAVES3D.

La aportación técnica del trabajo es un prior taxonómico de Ornstein–Uhlenbeck aplicado sobre los códigos de forma AVES. Este prior actúa únicamente durante el entrenamiento, de modo que en inferencia los checkpoints se comportan como modelos AniMer+ estándar. El repositorio de Hugging Face (9,5 GB) contiene tres ficheros `torch.save` con los pesos y las métricas asociadas, y el código de instalación y evaluación se distribuye por separado en GitHub.

El modelo resulta relevante para investigadores en visión por computador aplicada a morfología animal, reconstrucción 3D y estimación de pose, especialmente por la mejora medida en el conjunto CowBird (AUC 60,91 frente a 61,32 de la variante con taxonomía real y 60,65 de la permutada), que sugiere una contribución modesta pero medible del prior taxonómico en escenarios de dominio reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | AniMer+ (fine-tuned) con prior taxonómico Ornstein–Uhlenbeck sobre códigos de forma AVES |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (entrada visual, salida 3D/pose) |
| Licencia | MIT |
| Formato de pesos | `torch.save` (`.pt`), diccionario con `model_state`, `step` y `metrics` |

## Arquitectura y entrenamiento

El modelo parte de AniMer+, una arquitectura de reconstrucción de forma y pose animal, y se afina durante 30 000 pasos sobre CtrlAVES3D. La innovación principal es un prior taxonómico de Ornstein–Uhlenbeck aplicado sobre los códigos de forma AVES: en lugar de condicionar la reconstrucción únicamente por etiquetas de familia, el prior modela la evolución de la forma a lo largo de la taxonomía mediante un proceso estocástico con reversión a la media. Este prior es solo de entrenamiento, por lo que la inferencia no requiere información taxonómica adicional.

El repositorio incluye tres checkpoints: `bfl.pt` (modelo principal, semilla 0), `ablation/taxonomy_real.pt` (ablación con matriz de distancia taxonómica real D_tax) y `ablation/taxonomy_permuted.pt` (ablación con D_tax permutada). Los tres comparten el mismo estado de AniMer+ más los escalares aprendidos del prior OU (`ou_prior.*`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Reconstrucción de forma 3D de aves a partir de imágenes.
- Estimación de pose aviar (puntos clave y articulaciones).
- Evaluación sobre tres conjuntos: CUB, CowBird y CtrlAVES3D.
- Ablaciones controladas para medir el efecto del prior taxonómico (taxonomía real frente a permutada).
- Inferencia sin necesidad del prior taxonómico (el prior es solo de entrenamiento).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.
- No dispone de modo «thinking», visión general, audio ni otras capacidades multimodales más allá de la entrada visual para reconstrucción 3D.

## Casos de uso

- Investigación en morfología aviar: reconstruir la forma 3D de especímenes a partir de fotografías para estudios comparativos de anatomía entre especies, aprovechando el prior taxonómico entrenado sobre CtrlAVES3D.
- Estimación de pose en ornitología de campo: procesar imágenes de aves en libertad para extraer poses articuladas y analizar posturas de vuelo o reposo, con la ventaja de que en inferencia no se necesita etiqueta taxonómica.
- Benchmarking de métodos de reconstrucción 3D: usar los tres checkpoints (principal y ablaciones) como línea base reproducible en experimentos que comparen priors taxonómicos frente a priors genéricos.
- Reproducción de resultados del artículo NeurIPS 2026: ejecutar `eval.py` con los checkpoints publicados para verificar las métricas reportadas (AUC y PCK@0.1) en CUB, CowBird y CtrlAVES3D.
- Análisis de dominio reducido: emplear el checkpoint `bfl.pt` en escenarios con pocas imágenes por especie (como CowBird), donde la mejora del prior taxonómico es más relevante (AUC 60,91).
- Docencia y divulgación en visión 3D: ilustrar cómo un prior estructurado (taxonomía) mejora un modelo de reconstrucción frente a etiquetas planas de familia, usando las ablaciones incluidas.
- Integración en pipelines de análisis biométrico: extraer medidas de forma y pose para estudios de tamaño corporal o dimorfismo, siempre que las imágenes se ajusten al dominio de entrenamiento.

## Benchmarks y rendimiento

Resultados reportados en la model card (PCK@0.1, medido con `eval.py` en RTX 4090):

| Checkpoint | CUB AUC | CUB PCK | CowBird AUC | CowBird PCK | CtrlAVES3D AUC |
|---|---|---|---|---|---|
| `bfl.pt` | 89,31 | 57,91 | 60,91 | 19,26 | 93,04 |
| `ablation/taxonomy_real.pt` | 88,92 | 55,16 | 61,32 | 20,25 | 92,99 |
| `ablation/taxonomy_permuted.pt` | 88,87 | 54,90 | 60,65 | 18,49 | 92,95 |

No se han publicado en la información disponible comparaciones con otros modelos externos ni resultados de benchmarks estándar de visión (por ejemplo, PCK en otros conjuntos).

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el tamaño del repositorio (9,5 GB) sugiere pesos en precisión completa o mixta, pero no se detalla el consumo de memoria en inferencia.
- GPU recomendadas: la model card indica que las métricas se midieron en una RTX 4090, por lo que esa GPU es suficiente para la evaluación.
- Compatibilidad con GPU de consumo: probable en RTX 4090 según la evidencia de la model card; no se confirma para GPUs de gama inferior.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables); el flujo previsto es el repositorio de código con `scripts/download_checkpoints.py` y `eval.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFL (este modelo) | Reconstrucción 3D aviar (AniMer+ fine-tuned) | no disponible | no aplica | MIT | Hugging Face + GitHub |
| AniMer+ | Reconstrucción 3D animal (base) | no disponible | no aplica | no disponible | no disponible en la información |
| Alternativas de reconstrucción 3D aviar | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: se publica como checkpoints para reproducir el artículo, no como producto listo para producción.
- Dominio restringido a aves; no se ha validado en otras especies ni en escenas generales.
- El prior taxonómico solo actúa en entrenamiento; en inferencia el modelo es un AniMer+ estándar y no aprovecha información taxonómica de la imagen de entrada.
- Las métricas en CowBird son bajas en PCK (19,26 en `bfl.pt`), lo que indica dificultad en escenarios de dominio reducido.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto o idioma (no aplicables a un modelo de visión).
- Licencia MIT: permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento (CtrlAVES3D, CUB) que puedan afectar a la redistribución.
- El tamaño del repositorio (9,5 GB) y el formato `torch.save` exigen cargar el estado completo en PyTorch; no hay versiones cuantizadas ni GGUF.
- No se proporcionan garantías de robustez fuera de las condiciones de evaluación del artículo.

## Enlaces

- Hugging Face: https://huggingface.co/rocknroll17/BFL
- Repositorio de código: https://github.com/rocknroll17/BFL
- OpenReview del artículo: https://openreview.net/forum?id=WHGRxkYCGV
- Cita (BibTeX) en la model card: Jeon et al., «Beyond Family Labels: A Taxonomic Ornstein–Uhlenbeck Prior for Avian 3D Shape Recovery», NeurIPS 2026.
