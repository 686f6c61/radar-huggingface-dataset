# bhc6/ECT-Qwen3-VL-2B

## Resumen

ECT-Qwen3-VL-2B es un conjunto de adaptadores LoRA para el modelo base Qwen/Qwen3-VL-2B-Instruct, entrenado con la técnica Evidence-Contrastive Training (ECT) por Bohe Chen (bhc6) en el contexto del artículo *Speak When You See It: Proactive Task Assistants Should Wait for Evidence, Not the Clock* (arXiv:2611.30895). El modelo aborda el problema de los asistentes proactivos en vídeo: decidir cuándo intervenir para confirmar que un paso de una tarea se ha completado o para alertar de un error, sin basarse en el mero transcurso del tiempo.

La innovación central es que ECT entrena al modelo para que el tiempo transcurrido no pueda explicar sus respuestas: cada ejemplo negativo se extrae de la misma grabación y en el mismo instante que su positivo correspondiente, de modo que la única señal discriminante sea el contenido visual. El resultado es un adaptador de 2B parámetros que supera a las políticas ciegas al vídeo (basadas solo en tiempo e instrucción) en dos benchmarks de cocina egocéntrica.

El modelo se distribuye como adaptadores PEFT (LoRA) sobre Qwen3-VL-2B-Instruct, con rango 64 y alpha 128 aplicados a todas las proyecciones de atención y MLP del modelo de lenguaje. Su licencia es estrictamente de investigación (qicd-research-only), lo que limita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-2B-Instruct |
| Parámetros totales | 2B (modelo base); adaptadores LoRA de rango 64 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qicd-research-only (solo investigación) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 128, con dropout 0, aplicado sobre todas las proyecciones de atención y MLP del modelo de lenguaje del backbone Qwen3-VL-2B-Instruct. El backbone es un transformer multimodal capaz de procesar vídeo e texto (pipeline `video-text-to-text`). El entrenamiento se realizó con Evidence-Contrastive Training sobre 209 vídeos del dataset QICD (Qualcomm Interactive Cooking, Advanced Planning), con un coste aproximado de 15 horas de GPU por semilla. Se publican cuatro semillas (seed0 a seed3) más dos ablaciones sin negativos emparejados temporalmente.

La innovación clave de ECT es el diseño de los negativos: cada ejemplo negativo se extrae de la misma grabación y en el mismo instante de tiempo que su positivo, de forma que el tiempo transcurrido no puede separar las etiquetas. El ajuste fino se realiza sobre las preguntas por paso del propio benchmark (¿está completo el paso? ¿ha ocurrido un error?). Se publican también adaptadores ECT sobre otros backbones (Qwen3-VL-4B, InternVL3.5-2B, LLaVA-OneVision-7B).

## Capacidades

- Detección proactiva de errores en vídeo egocéntrico de cocina: identifica si se ha cometido un error durante la ejecución de un paso.
- Confirmación de finalización de pasos: determina si el paso actual de la instrucción se ha completado.
- Procesamiento de vídeo y texto conjuntamente (video-text-to-text) para razonamiento sobre secuencias temporales.
- Asistencia proactiva basada en evidencia visual, no en cronómetros ni reglas temporales.
- Transferencia zero-shot a otros dominios de vídeo egocéntrico (evaluado en Ego-MC-Bench sin adaptación).
- Decodificación greedy de respuestas sí/no y modo con umbrales de probabilidad congelados (τ_done 0.2, τ_mistake 0.35).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de cocina en tiempo real: el modelo puede analizar vídeo egocéntrico de un usuario cocinando y avisar cuando detecta un error (por ejemplo, un ingrediente equivocado) o confirmar cuándo un paso se ha completado, sin depender de temporizadores.
- Evaluación de sistemas de asistencia proactiva: sirve como referencia para medir si un asistente responde a la evidencia visual o simplemente al paso del tiempo, gracias a su entrenamiento con negativos emparejados temporalmente.
- Investigación en detección de errores en vídeo egocéntrico: el adaptador y las ablaciones publicadas permiten reproducir y extender los experimentos del artículo sobre QICD y Ego-MC-Bench.
- Formación y guiado de tareas manuales: puede integrarse en aplicaciones de guiado paso a paso donde se requiera verificar la ejecución correcta de procedimientos (cocina, montaje, laboratorio).
- Transferencia a nuevos dominios de vídeo: al generalizar zero-shot a Ego-MC-Bench, puede servir de punto de partida para adaptar la detección de errores a otros entornos egocéntricos.
- Benchmarking de asistentes ciegos al vídeo: permite comparar políticas basadas en tiempo frente a políticas basadas en evidencia visual en el mismo protocolo de evaluación por turnos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), protocolo oficial por turnos de cada benchmark. Media de cuatro semillas con decodificación greedy.

| Modelo / configuración | Benchmark | IC-Acc (%) | Mistake F1 | Δ |
|---|---|---|---|---|
| ECT-Qwen3-VL-2B (media 4 semillas, greedy) | QICD Advanced Planning (test, 36 vídeos) | 40,8 ± 1,3 | 0,247 ± 0,033 | +0,036 |
| ECT-Qwen3-VL-2B (media 4 semillas, umbrales) | QICD Advanced Planning (test) | 42,2 ± 1,3 | 0,293 ± 0,035 | +0,103 |
| ECT-Qwen3-VL-2B (media 4 semillas, greedy) | Ego-MC-Bench (zero-shot, 39 sesiones) | 59,0 | 0,246 | no disponible |
| Ablación sin negativos emparejados (seed0, greedy) | QICD Advanced Planning | 23,1 | 0,258 | -0,077 |
| Ablación sin negativos emparejados (seed1, greedy) | QICD Advanced Planning | 29,8 | 0,254 | -0,054 |
| Qwen3-VL-2B zero-shot (base, greedy) | QICD Advanced Planning | 4,2 | 0,074 | -0,279 |

Detalle por semilla en QICD Advanced Planning (greedy): seed0 IC-Acc 41,2 / F1 0,217; seed1 39,9 / 0,284; seed2 39,5 / 0,267; seed3 42,4 / 0,221. Con umbrales: seed0 42,0 / 0,306; seed1 41,2 / 0,322; seed2 41,6 / 0,303; seed3 44,1 / 0,242. En Ego-MC-Bench, el modelo confirma el 59 % de los pasos completados a tiempo, frente al 30 % de un modelo publicado con el mismo backbone.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; al tratarse de un backbone de 2B parámetros más adaptadores LoRA de rango 64, la inferencia en precisión completa requiere del orden de varios GB, pero no se especifica cifra oficial.
- GPU recomendadas: no disponible. El entrenamiento consumió aproximadamente 15 horas de GPU por semilla sobre 209 vídeos, sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del backbone (2B) sugiere que podría caber en GPUs de consumo, pero no se aporta dato verificado.
- Opciones de despliegue: al ser adaptadores PEFT, requieren cargar el modelo base Qwen/Qwen3-VL-2B-Instruct y aplicar el adaptador mediante la librería `peft`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | QICD Adv. Planning IC-Acc / F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECT-Qwen3-VL-2B | 2B (LoRA) | no disponible | 40,8 / 0,247 (greedy, media 4 semillas) | qicd-research-only | Hugging Face (bhc6) |
| Qwen3-VL-2B-Instruct (base, zero-shot) | 2B | no disponible | 4,2 / 0,074 (greedy) | según modelo base | Hugging Face (Qwen) |
| ECT-Qwen3-VL-4B | 4B (LoRA) | no disponible | no disponible en esta ficha | qicd-research-only | Hugging Face (bhc6) |
| ECT-InternVL3.5-2B | 2B (LoRA) | no disponible | no disponible en esta ficha | qicd-research-only | Hugging Face (bhc6) |
| ECT-LLaVA-OneVision-7B | 7B (LoRA) | no disponible | no disponible en esta ficha | qicd-research-only | Hugging Face (bhc6) |

## Limitaciones y advertencias

- Licencia estrictamente de investigación (qicd-research-only): no permite uso comercial; el enlace a la licencia apunta al PDF del dataset QICD.
- El modelo está especializado en detección de errores y confirmación de pasos en vídeo egocéntrico de cocina; su rendimiento fuera de ese dominio no está caracterizado.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- El F1 de detección de errores es bajo en términos absolutos (0,247 en QICD Advanced Planning con greedy), con precisión y recall en torno a 0,25; no es adecuado para producción sin un umbral calibrado.
- La decodificación con umbrales requiere fijar τ_done 0,2 y τ_mistake 0,35 sobre la validación de QICD; estos valores pueden no transferirse a otros dominios.
- El modelo base es de 2B parámetros, lo que limita su capacidad de razonamiento general frente a modelos mayores.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específico de este adaptador.
- Al ser adaptadores LoRA, dependen del modelo base Qwen/Qwen3-VL-2B-Instruct y de la librería `peft`; no son pesos autónomos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhc6/ECT-Qwen3-VL-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Paper (arXiv): https://arxiv.org/abs/2611.30895
- Código: https://github.com/bhc6/speak-when-you-see-it
- Dataset QICD: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset
- Dataset Ego-MC-Bench: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset-ego-mistake-corrections
- Licencia: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset/blob/main/LICENSE.pdf
- Adaptador ECT-Qwen3-VL-4B: https://huggingface.co/bhc6/ECT-Qwen3-VL-4B
- Adaptador ECT-InternVL3.5-2B: https://huggingface.co/bhc6/ECT-InternVL3.5-2B
- Adaptador ECT-LLaVA-OneVision-7B: https://huggingface.co/bhc6/ECT-LLaVA-OneVision-7B
