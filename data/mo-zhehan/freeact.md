# Mo-ZheHan/FreeAct

## Resumen

FreeAct es un conjunto de checkpoints para adaptación de políticas robóticas sin demostraciones expertas en el dominio objetivo, presentado en NeurIPS 2026 por Zhe-Han Mo, Jia-Ning Li, Jiaxi Song, Meng-Hao Guo y Shi-Min Hu. El método parte de una política vision-language-action (VLA) preentrenada y la adapta a un entorno nuevo pseudo-etiquetando vídeos generados de las tareas objetivo con tokens de acción latente, sin necesidad de teleoperación ni rollouts expertos en el dominio destino. El repositorio aloja todos los artefactos del paper: el modelo de acción latente (LAM), la política preentrenada de etapa 2, la política adaptada de etapa 3, variantes auto-evolucionadas y dos baselines con tokenizadores alternativos.

La política se construye sobre Qwen3-VL-4B-Instruct (4.000 millones de parámetros, licencia Apache-2.0) mediante adaptadores LoRA de rango 64 y 64 tokens de acción latente añadidos al vocabulario. A partir de una imagen de vista de agente y una instrucción en lenguaje natural, el modelo predice 4 tokens latentes que una cabeza continua decodifica en un chunk de acciones 7D del efector final. El LAM es un VQ-VAE sobre features congeladas de DINOv3 ViT-B/16 que codifica dos fotogramas separados 1 segundo en 4 tokens de un codebook de 64 entradas, anclado al movimiento del efector final en el marco de la cámara durante el entrenamiento.

La relevancia del trabajo es metodológica: demuestra que vídeos generados por un modelo de difusión de vídeo (Wan 2.6) más un LAM físicamente anclado pueden sustituir a las demostraciones expertas en la adaptación de políticas VLA. En simulación LIBERO, la política adaptada alcanza 56,8 % de éxito en tareas A–E frente al 1,6 % de la política fuente sin adaptar, y las variantes auto-evolucionadas llegan a 73,6 % (A–E), 92 % (cambio de cámara) y 94 % (entorno con botella de ketchup).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: Qwen3-VL-4B-Instruct (transformer multimodal) con LoRA r=64 + 64 tokens de acción latente + cabeza de acción continua; LAM: VQ-VAE sobre DINOv3 ViT-B/16 congelado |
| Parametros totales | 4.000 millones (modelo base Qwen3-VL-4B-Instruct); adaptadores LoRA de rango 64 sobre el base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-VL-4B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (checkpoints en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0, excepto `lam/lam.ckpt` que contiene pesos DINOv3 ViT-B/16 sujetos a la DINOv3 License |
| Formato de pesos | safetensors (PEFT/LoRA), más `action_decoder.pt` y `action_stats.json` para la cabeza de acción |

## Arquitectura y entrenamiento

La política es un transformer multimodal Qwen3-VL-4B-Instruct adaptado con LoRA (rango 64) al que se añaden 64 tokens especiales de acción latente. La entrada es una imagen de vista de agente más una instrucción textual; la salida son 4 tokens latentes cuyos estados ocultos se decodifican mediante una cabeza continua (`action_decoder.pt`, con estadísticas en `action_stats.json`) en un chunk de acciones 7D del efector final. El LAM es un VQ-VAE que opera sobre features congeladas de DINOv3 ViT-B/16: codifica dos fotogramas separados 1 s en 4 tokens de un codebook de 64 entradas, con anclaje al movimiento del efector final en el marco de la cámara durante el entrenamiento. Esto proporciona una señal de acción latente físicamente fundamentada que se usa para pseudo-etiquetar vídeos generados.

El entrenamiento se organiza en tres etapas: (1) entrenamiento del LAM; (2) preentrenamiento de la VLA con supervisión de acciones en el dominio fuente; (3) adaptación al dominio objetivo usando tokens latentes derivados de vídeos generados por Wan 2.6 de las tareas destino, combinados con la supervisión de acciones del dominio fuente. Los datos incluyen DROID, demostraciones de LIBERO (regeneradas por OpenVLA), vídeos generados con Wan 2.6 y rollouts seleccionados por un MLLM. Las variantes `self_evolve` añaden un bucle de auto-evolución sobre rollouts seleccionados. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset. Los baselines usan los tokenizadores de UniVLA y LAPA en lugar del LAM propuesto.

## Capacidades

- Predicción de acciones robóticas de efector final en 7D a partir de imagen de agente e instrucción en lenguaje natural.
- Codificación de acción latente: 4 tokens por chunk desde un codebook de 64 entradas, correspondientes a 1 segundo de movimiento.
- Comprensión visuolingüística heredada de Qwen3-VL-4B-Instruct (percepción de imagen y seguimiento de instrucciones textuales).
- Adaptación a nuevos entornos sin demostraciones expertas en el dominio objetivo, mediante pseudo-etiquetado con vídeos generados.
- Auto-evolución: variantes que mejoran iterativamente con rollouts seleccionados por MLLM.
- Soporte de instrucciones en inglés (único idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Adaptación de políticas VLA a nuevos entornos de laboratorio: el modelo permite ajustar una política preentrenada a una mesa de trabajo nueva usando vídeos generados de la tarea, sin teleoperar el robot en el dominio destino, lo que reduce el coste de recogida de datos expertos.
- Investigación en aprendizaje por imitación sin demostraciones: sirve como referencia reproducible para estudiar hasta qué punto los vídeos generados por difusión pueden sustituir a las demostraciones humanas en el entrenamiento de políticas.
- Manipulación de objetos en simulación LIBERO: los checkpoints `stage3` y `self_evolve` están entrenados y evaluados en tareas de manipulación tipo Franka en mesa, útiles como punto de partida para experimentos de manipulación en simulador.
- Robustez ante cambios de cámara: la variante `self_evolve_camera` (92 % de éxito) está pensada para entornos donde la posición de la cámara cambia, un escenario habitual al reconfigurar un laboratorio.
- Adaptación a objetos nuevos: `self_evolve_bottle` (94 % de éxito) demuestra el uso del método para incorporar objetos no vistos (botella de ketchup) sin demostraciones específicas.
- Estudio comparativo de tokenizadores de acción latente: los baselines `univla` (4,0 %) y `lapa` (12,0 %) permiten comparar el LAM propuesto frente a alternativas en el mismo pipeline.
- Base para investigación en VLA sobre Qwen3-VL: al ser adaptadores LoRA sobre Qwen3-VL-4B-Instruct, el checkpoint puede reutilizarse como punto de partida para otras tareas de robótica que requieran percepción visuolingüística.

## Benchmarks y rendimiento

Resultados de éxito (%) sobre 50 rollouts simulados por tarea, según la model card:

| Checkpoint | Tareas | Éxito (%) |
|---|---|---:|
| Política fuente sin adaptar | A–E | 1,6 |
| `stage3/` | A–E | 56,8 |
| `stage3/` | B (cambio de cámara) | 74 |
| `stage3/` | C (botella de ketchup) | 60 |
| `self_evolve/` | A–E | 73,6 |
| `self_evolve_camera/` | B (cambio de cámara) | 92 |
| `self_evolve_bottle/` | C (botella de ketchup) | 94 |
| `baselines/univla/` | A–E | 4,0 |
| `baselines/lapa/` | A–E | 12,0 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje o visión (MMLU, HumanEval, GSM8K) para estos checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, una política basada en un modelo de 4.000 millones de parámetros en precisión completa requiere del orden de 8–10 GB solo para pesos, más el overhead de activaciones y del decodificador de acción; la cifra exacta no está documentada.
- GPU recomendadas: no especificadas en la model card. Por tamaño del modelo base, una GPU con 16–24 GB de VRAM (RTX 4090, A100 40 GB, H100) es un punto de partida razonable, pero no hay validación publicada.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización, aunque no se han publicado cuantizaciones ni mediciones.
- Opciones de despliegue: implementaciones PyTorch y Jittor del repositorio del autor (`scripts/eval.sh`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FreeAct (este) | 4.000 M (LoRA sobre Qwen3-VL-4B) | no disponible | VLA con acción latente y vídeos generados | Apache-2.0 (DINOv3 aparte) | Hugging Face, código PyTorch/Jittor |
| UniVLA baseline (en este repo) | no disponible | no disponible | VLA con tokenizador UniVLA | no disponible | Incluido como baseline |
| LAPA baseline (en este repo) | no disponible | no disponible | VLA con tokenizador LAPA | no disponible | Incluido como baseline |
| OpenVLA (referencia externa) | 7.000 M | no disponible | VLA sobre Llama-2 | no disponible en esta ficha | Público |

La comparación cuantitativa directa solo está disponible frente a los baselines incluidos en el propio repositorio (UniVLA: 4,0 %; LAPA: 12,0 % en tareas A–E), ambos muy por debajo del 56,8 % de `stage3` y del 73,6 % de `self_evolve`. No se dispone de datos comparativos con OpenVLA u otros VLA externos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en simulación (LIBERO, brazo Franka en mesa); el despliegue en robots reales queda fuera del alcance sin validación adicional.
- Los checkpoints son específicos de las tareas del paper; no son políticas generales de manipulación.
- Solo soporta inglés como idioma declarado.
- Riesgo de alucinación y de predicciones de acción no físicamente plausibles fuera de la distribución de entrenamiento; no se documentan mitigaciones.
- Sesgos: no documentados en la model card; al heredar Qwen3-VL-4B-Instruct, pueden persistir sesgos del modelo base en percepción e instrucciones.
- Licencia: Apache-2.0 para los checkpoints, pero `lam/lam.ckpt` incorpora pesos DINOv3 ViT-B/16 sujetos a la DINOv3 License, que puede imponer restricciones adicionales para uso comercial; hay que revisar esa licencia antes de un despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- No se han publicado cuantizaciones ni mediciones de latencia/throughput, lo que dificulta planificar el despliegue.
- El tamaño del repo (18,5 GB) incluye todos los checkpoints; conviene descargar solo el subdirectorio necesario (`--include 'stage3/*'`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mo-ZheHan/FreeAct
- Paper PDF: https://freeact.pages.dev/FreeAct.pdf
- Página del proyecto: https://freeact.pages.dev/
- Código (PyTorch): https://github.com/Mo-ZheHan/FreeAct
- Código (Jittor): https://github.com/Mo-ZheHan/FreeAct-Jittor
- Dataset FreeAct-Data: https://huggingface.co/datasets/Mo-ZheHan/FreeAct-Data
- Dataset DROID: https://huggingface.co/datasets/Mo-ZheHan/droid
- OpenReview: https://openreview.net/forum?id=wNWxVVntG2
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://huggingface.co/Mo-ZheHan/FreeAct/blob/main/lam/DINOv3_LICENSE.md
- DROID: https://droid-dataset.github.io/
- LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- OpenVLA: https://github.com/openvla/openvla
- Wan: https://github.com/Wan-Video
- UniVLA: https://github.com/OpenDriveLab/UniVLA
- LAPA: https://github.com/LatentActionPretraining/LAPA
