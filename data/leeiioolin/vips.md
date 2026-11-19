# leeiioolin/ViPS

## Resumen

ViPS (Visual Priors) es un adaptador LoRA publicado por Xiao Lin, Xiaohu Huang y Kai Han, del Visual AI Lab de la Universidad de Hong Kong, que se monta sobre el modelo multimodal Qwen3-VL-8B-Instruct para mejorar su comprensión espacial en tareas de vídeo y visión. El trabajo se presenta en NeurIPS 2026 bajo el título "Beyond Single Expert: Harmonizing Diverse Visual Priors in MLLMs for Spatial Understanding" y aborda una limitación conocida de los MLLM actuales: su dificultad para razonar sobre distancias, tamaños, orientaciones y rutas a partir de secuencias visuales.

La propuesta combina los priors visuales del backbone Qwen3-VL con un "prior proxy" derivado de VGGT-1B, un modelo de reconstrucción 3D, mediante un módulo de fusión entrenado específicamente. El resultado es un checkpoint de aproximadamente 11,9 GB que incluye tanto los pesos del adaptador como el proxy de priors (vggt_multihead.pt), y que se evalúa sobre el benchmark VSI-Bench de NYU VisionX.

El modelo es relevante para investigadores que trabajan en razonamiento espacial multimodal y VQA de vídeo, ya que demuestra que inyectar priors geométricos externos en un MLLM de 8B parámetros mejora el rendimiento en tareas espaciales sin reentrenar el modelo base. Su licencia es mixta y restrictiva para uso comercial debido al componente derivado de VGGT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM basado en transformer (Qwen3-VL-8B-Instruct) con adaptador LoRA y modulo de fusion de priors visuales |
| Parametros totales | Aproximadamente 8B en el modelo base; el adaptador LoRA y el modulo de fusion anaden parametros no cuantificados en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Mixta: codigo y adaptador original MIT; componentes derivados de Qwen Apache-2.0; prior proxy (vggt_multihead.pt) CC BY-NC 4.0 (no comercial) |
| Formato de pesos | safetensors (adaptador) y .pt (prior proxy) |

## Arquitectura y entrenamiento

ViPS no es un modelo entrenado desde cero, sino un adaptador LoRA y un modulo de fusion que se acoplan a Qwen3-VL-8B-Instruct. La innovacion central es la incorporacion de "priors visuales diversos": además de las representaciones del propio MLLM, el sistema extrae características geométricas de un prior proxy basado en VGGT-1B (vggt_multihead.pt), un modelo especializado en reconstrucción 3D y estimación de pose. Un módulo de fusión armoniza ambas fuentes de información antes de que el LLM genere la respuesta.

El entrenamiento se realiza sobre el dataset VSI-Bench (nyu-visionx/VSI-Bench), orientado a comprensión espacial en vídeo. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal; el foco técnico está en la fusión de priors geométricos con el razonamiento del MLLM.

## Capacidades

- Comprensión espacial en vídeo: estimación de distancias absolutas y relativas, tamaños de objetos y habitaciones, y direcciones relativas.
- Video question answering (VQA) con preguntas de razonamiento espacial multi-paso.
- Conteo de objetos en escenas visuales.
- Planificación de rutas (route planning) a partir de secuencias de vídeo.
- Razonamiento sobre orden de aparición (appearance order) de elementos en una secuencia.
- Hereda las capacidades generales de Qwen3-VL-8B-Instruct: generación de texto, razonamiento multimodal y comprensión de imágenes y vídeo.
- Soporte de tool calling y function calling heredado del modelo base (no verificado específicamente para el adaptador).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Robótica móvil y navegación asistida: el modelo puede estimar distancias relativas y planificar rutas a partir de vídeo egocéntrico, aprovechando su rendimiento en Relative Direction (81,9) y Route Planning (45,9) en VSI-Bench.
- Análisis de vídeo de vigilancia o inspección: conteo de objetos y estimación de tamaños en escenas grabadas, útil para inventario automatizado o control de aforo.
- Asistentes para personas con discapacidad visual: descripción espacial de entornos (distancias, tamaños, orientaciones) a partir de vídeo en tiempo real.
- Automoción y ADAS: razonamiento sobre distancias relativas entre vehículos y peatones en secuencias de cámara, como módulo de comprensión previo a la planificación.
- Realidad aumentada y modelado 3D: extracción de relaciones espaciales entre objetos para anclar contenido virtual de forma coherente con la escena.
- Investigación en MLLM: línea base reproducible para estudiar la inyección de priors geométricos (VGGT) en modelos multimodales de 8B, con código y checkpoints públicos.
- Evaluación comparativa de razonamiento espacial: uso del checkpoint para reproducir resultados en VSI-Bench y comparar con otros MLLM.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre VSI-Bench:

| Modelo | Overall | Obj. Count | Abs. Dist. | Obj. Size | Room Size | Rel. Dist. | Rel. Dir. | Route Plan | Appr. Order |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ViPS | 63,7 | 69,6 | 54,7 | 71,1 | 72,5 | 60,1 | 81,9 | 45,9 | 53,6 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en la misma tabla, ni datos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-VL-8B-Instruct en precisión completa requiere aproximadamente 16-20 GB; el adaptador y el prior proxy añaden varios GB adicionales (el repo completo pesa 11,9 GB). En cuantización de 8 bits podría caber en torno a 10-12 GB, y en 4 bits en torno a 6-8 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en FP16 con margen; RTX 4090 (24 GB) es viable en FP16 para el backbone, con posible presión de memoria al cargar el prior proxy.
- GPU de consumo: sí es posible en RTX 4090; en GPUs de 12-16 GB requeriría cuantización no oficial.
- Opciones de despliegue: el repositorio de código (github.com/Visual-AI/ViPS) indica el flujo de descarga e inferencia; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VSI-Bench (Overall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViPS | ~8B (base) + adaptador | No disponible | 63,7 | Mixta (MIT / Apache-2.0 / CC BY-NC 4.0) | Hugging Face |
| Qwen3-VL-8B-Instruct | ~8B | No disponible en la informacion | No disponible | Apache-2.0 | Hugging Face |
| VGGT-1B (prior proxy) | ~1B | No aplica | No disponible | CC BY-NC 4.0 | No disponible en esta ficha |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa completa.

## Limitaciones y advertencias

- Licencia restrictiva: el prior proxy vggt_multihead.pt está bajo CC BY-NC 4.0, lo que impide el uso comercial del pipeline completo tal como se distribuye.
- Idioma: solo se declara soporte de inglés, lo que limita su uso en entornos en castellano sin trabajo adicional.
- Dependencia del prior proxy: el rendimiento espacial depende de cargar y ejecutar VGGT-1B, lo que incrementa los requisitos de memoria y la complejidad del despliegue.
- Riesgo de alucinación: como todo MLLM, puede generar descripciones espaciales plausibles pero incorrectas, especialmente en escenas ambiguas o con oclusiones.
- Rendimiento desigual por tarea: Route Planning (45,9) y Appearance Order (53,6) son las métricas más bajas, por lo que no es fiable para planificación de rutas complejas.
- Sin datos de sesgos: la model card no documenta evaluaciones de sesgo ni de robustez.
- Madurez: 0 descargas y 1 like en el momento de la consulta; es un artefacto de investigación, no un modelo listo para producción.
- Contexto y cuantizaciones no documentados: no se especifican la ventana de contexto ni formatos GGUF/AWQ oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leeiioolin/ViPS
- Paper (arXiv): https://arxiv.org/abs/2607.15054
- Página del proyecto: https://visual-ai.github.io/vips/
- Código: https://github.com/Visual-AI/ViPS
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset: https://huggingface.co/datasets/nyu-visionx/VSI-Bench
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
