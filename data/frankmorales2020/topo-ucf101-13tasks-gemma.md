# frankmorales2020/topo-ucf101-13tasks-gemma

## Resumen

TOPO-2026 UCF101 (13 tareas) es un modelo de clasificación de vídeo desarrollado por Frank Morales Aguilera (Sovereign Machine Laboratory, SOMALA) y publicado en Hugging Face bajo el identificador `frankmorales2020/topo-ucf101-13tasks-gemma`. Se trata de una implementación certificada del marco TOPO-2026 sobre el modelo base Gemma-4-E4B-Vision, orientada a un problema concreto de aprendizaje continuo (continual learning): la clasificación de vídeos de UCF101 mediante 13 tareas binarias secuenciales.

El problema que aborda es el olvido catastrófico (catastrophic forgetting), el fenómeno por el cual un modelo que aprende tareas de forma secuencial pierde rendimiento en las tareas anteriores. Según su model card, este modelo consigue un 0,00 % de olvido en las 13 tareas, con una precisión media del 77,69 %. El marco TOPO-2026 emplea "anclas de números primos" en los índices {2, 3, 5, 7, 11, 13} y una constante de seguridad Λ = 0,9785142874, con un gobernador topológico que opera en tres pasos: captura de instantánea, aplicación de gradientes y restauración de anclas, con una huella de memoria de solo 67,5 KB.

Su relevancia es principalmente de investigación: es un modelo experimental, sin descargas registradas en el momento de la ficha, que demuestra una técnica determinista de aprendizaje continuo sobre datos de vídeo. El repositorio pesa 1,3 GB y contiene los clasificadores específicos por tarea que se cargan sobre el modelo base Gemma-4-E4B-Vision cuantizado en 4 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B-Vision con clasificadores por tarea (framework TOPO-2026) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (load_in_4bit=True vía bitsandbytes/unsloth), bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (checkpoint de clasificadores); modelo base cargado desde `frankmorales2020/gemma-4-e4b-unesco-optimized` |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma-4-E4B-Vision, un modelo vision-language de Google (la ficha no detalla parámetros totales ni arquitectura interna del base). Sobre este backbone se entrenan 13 cabezas clasificadoras binarias secuenciales (`classifier_` en los nombres de parámetros), una por tarea. El checkpoint publicado en el repositorio contiene únicamente los pesos de estos clasificadores, que se copian sobre el modelo base en tiempo de carga.

El elemento diferencial es el marco TOPO-2026, un método de aprendizaje continuo determinista que, según el autor, garantiza matemáticamente la ausencia de olvido. Se basa en "anclas de números primos" en los índices {2, 3, 5, 7, 11, 13}, una constante de seguridad Λ = 0,9785142874, una "boundary layer" de 24 y una semilla fija de 123. El "Topological Governor" opera en tres pasos: captura de instantánea, aplicación de gradientes y restauración de anclas, con una huella de memoria de 67,5 KB. El entrenamiento emplea tasas de aprendizaje específicas por tarea, que oscilan entre 1e-5 (tareas sensibles o ya resueltas) y 5e-4/1e-3 (tareas difíciles o la última de la secuencia). No se detalla el número de tokens de entrenamiento, la composición del dataset más allá de UCF101, ni el uso de RLHF/DPO (no aplicable a esta tarea de clasificación).

## Capacidades

- Clasificación de vídeo binaria en 13 tareas secuenciales sobre UCF101 (deportes y categorías derivadas: deportes vs no deportes, equipo vs individual, acuáticos vs terrestres, lucha vs no lucha, interior vs exterior, etc.).
- Aprendizaje continuo sin olvido catastrófico: 0,00 % de olvido declarado en las 13 tareas tras el entrenamiento secuencial completo.
- Comprensión de vídeo (video-understanding) mediante el backbone vision de Gemma-4-E4B-Vision.
- Carga selectiva de clasificadores por tarea, lo que permite desplegar solo la tarea necesaria.
- Entrenamiento determinista (semilla fija 123) orientado a reproducibilidad.
- No es un modelo de generación de texto: no soporta chat, tool calling, agentes ni razonamiento multi-paso como modelo conversacional.

## Casos de uso

- Investigación en aprendizaje continuo: sirve como implementación de referencia certificada del marco TOPO-2026 para reproducir y comparar métodos de mitigación del olvido catastrófico en datos de vídeo.
- Clasificación de vídeos deportivos: puede etiquetar clips de UCF101 según 13 taxonomías binarias (por ejemplo, deportes acuáticos vs terrestres con un 94,95 % de precisión, o lucha vs no lucha con un 95,00 %).
- Moderación y filtrado de contenido de vídeo: la tarea J (Fighting vs Non-Fighting, 95,00 %) permite detectar automáticamente clips con contenido violento en plataformas de vídeo.
- Organización automática de bibliotecas de vídeo: las tareas L (interior vs exterior) y H (aéreo vs terrestre) permiten catalogar metraje de archivo sin revisión manual.
- Sistemas de vigilancia con restricciones de memoria: la huella de solo 67,5 KB del gobernador topológico hace viable el despliegue en entornos con recursos muy limitados para el módulo de continual learning.
- Benchmarking de métodos de continual learning: las 13 tareas con precisión y olvido por tarea publicadas ofrecen una línea base comparativa para nuevos algoritmos.
- Educación y demostración: el notebook de inferencia público permite ilustrar en docencia cómo se combinan un modelo vision-language con técnicas de aprendizaje secuencial.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (UCF101, 13 tareas binarias secuenciales). No hay comparación directa con otros métodos en la información disponible.

| Métrica | Valor |
|---|---|
| Precisión media (13 tareas) | 77,69 % |
| Olvido (forgetting) | 0,00 % |
| Tareas con precisión ≥ 95 % | 1/13 (J) |
| Tareas con precisión ≥ 90 % | 2/13 (D, J) |
| Tareas con precisión ≥ 85 % | 4/13 (B, D, H, J) |
| Tareas con precisión ≥ 70 % | 12/13 |

| Tarea | Nombre | Mejor precisión | Olvido |
|---|---|---|---|
| A | Sports vs Non-Sports | 54,55 % | 0,00 % |
| B | Team vs Individual Sports | 85,86 % | 0,00 % |
| C | Ball Sports vs Non-Ball | 84,85 % | 0,00 % |
| D | Water vs Land Sports | 94,95 % | 0,00 % |
| E | Gym vs Outdoor | 76,77 % | 0,00 % |
| F | Human-Object vs Body-Motion | 73,74 % | 0,00 % |
| G | High vs Low Impact | 74,50 % | 0,00 % |
| H | Aerial vs Ground | 86,00 % | 0,00 % |
| I | Fast vs Slow | 71,00 % | 0,00 % |
| J | Fighting vs Non-Fighting | 95,00 % | 0,00 % |
| K | Precision vs Power | 71,72 % | 0,00 % |
| L | Indoor vs Outdoor | 70,00 % | 0,00 % |
| M | Equipment Heavy vs Minimal | 71,00 % | 0,00 % |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base Gemma-4-E4B-Vision se carga en 4 bits (bfloat16 donde aplica), lo que sugiere un requisito moderado, pero el tamaño exacto del backbone no está documentado en la ficha.
- GPU recomendadas: no disponible; el código de ejemplo usa `unsloth.FastVisionModel` con `load_in_4bit=True`, compatible con GPUs NVIDIA de consumo con soporte CUDA.
- Cabe en GPU de consumo: probablemente sí en 4 bits dada la carga cuantizada, pero no hay confirmación ni modelo de GPU específico documentado.
- Opciones de despliegue: PyTorch + transformers + unsloth + bitsandbytes, descargando el checkpoint con `huggingface_hub.hf_hub_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo).
- Latencia y throughput: no disponible.
- Dependencias adicionales: `decord` para decodificación de vídeo, `torchvision`, `pillow`, `scikit-learn`, `tqdm`.

## Comparativa con modelos similares

No hay modelos comparables directamente publicados con la misma combinación de backbone, tareas y marco TOPO-2026 en la información disponible. Como referencia contextual de la categoría (clasificación de vídeo en UCF101):

| Modelo / enfoque | Tareas | Precisión media | Olvido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| topo-ucf101-13tasks-gemma (TOPO-2026) | 13 binarias secuenciales | 77,69 % | 0,00 % (declarado) | MIT | Hugging Face, 1,3 GB |
| Métodos clásicos de continual learning en vídeo (EWC, replay, LoRA secuencial) | no disponible | no disponible | > 0 % típicamente | no disponible | no disponible |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: 0 descargas y 0 likes en el momento de la ficha, sin validación independiente publicada de los resultados de 0,00 % de olvido.
- La afirmación de "garantías matemáticas deterministas" y el marco TOPO-2026 proceden íntegramente del autor; las referencias son publicaciones en Zenodo de 2026, no artículos revisados por pares conocidos.
- Solo clasificación binaria por tarea: no genera texto ni responde a instrucciones; cada tarea requiere seleccionar el clasificador correspondiente.
- La tarea A (Sports vs Non-Sports) obtiene solo un 54,55 % de precisión, prácticamente aleatorio, por lo que no es utilizable en producción.
- Entrenado exclusivamente sobre UCF101 (inglés, vídeos deportivos): el rendimiento fuera de esta distribución no está evaluado; alto riesgo de degradación en dominios distintos.
- Sesgos: no documentados; UCF101 es un dataset antiguo y limitado en diversidad, por lo que pueden heredarse sus sesgos de género, contexto y tipo de actividad.
- Riesgo de alucinación: no aplicable como tal (modelo de clasificación), pero las probabilidades de salida no están calibradas según la información disponible.
- Licencia MIT: permite uso comercial sin restricciones significativas, aunque el modelo base Gemma-4-E4B-Vision puede estar sujeto a los términos de su propia licencia (no documentado en esta ficha).
- Formato de pesos `pytorch_model.bin` (no safetensors): implica riesgo de ejecución de código arbitrario al usar `torch.load`; se recomienda descargar solo de la fuente oficial.
- Requiere el modelo base `frankmorales2020/gemma-4-e4b-unesco-optimized`, que debe descargarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frankmorales2020/topo-ucf101-13tasks-gemma
- Modelo base: https://huggingface.co/frankmorales2020/gemma-4-e4b-unesco-optimized
- Notebook de inferencia completo: https://github.com/frank-morales2020/AST/blob/main/GEMMA4_TOPO_VIDEO.ipynb
- Cita TOPO-2026 (framework): https://doi.org/10.5281/zenodo.22046257
- Cita "The Architecture of Permanence": https://doi.org/10.5281/zenodo.22070337
- TOPO-2026: The Great Unlocking: https://doi.org/10.5281/zenodo.22119886
- TOPO-2026: 14-Domain Certification: https://doi.org/10.5281/zenodo.22111291
- TOPO-2026: Universal Permanence (genómica, lenguaje, visión): https://doi.org/10.5281/zenodo.22100004
- The Universal Principle: https://doi.org/10.5281/zenodo.22130176
- Referencia metodológica (fMRI): Worsley, K. J., et al. (2002). A general statistical analysis for fMRI data. *NeuroImage*, 15(1), 1-15.
- Contacto del autor: frank.morales@sovereign-machine-lab.ai (ORCID: 0009-0003-9528-0745)
