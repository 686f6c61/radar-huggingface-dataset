# bhc6/ECT-Qwen3-VL-4B

## Resumen

ECT-Qwen3-VL-4B es un adaptador LoRA entrenado sobre Qwen3-VL-4B-Instruct, el modelo de visión-lenguaje de 4 mil millones de parámetros de Alibaba Qwen. Lo publica el investigador Bohe Chen (usuario bhc6) como artefacto experimental del artículo *Speak When You See It: Proactive Task Assistants Should Wait for Evidence, Not the Clock*. El adaptador no es un modelo generalista: está especializado en asistencia proactiva sobre vídeo egocéntrico, concretamente en decidir, paso a paso, si una tarea de cocina se ha completado o si el usuario ha cometido un error.

El problema que aborda es el de los asistentes proactivos que interrumpen por reloj en lugar de por evidencia visual. La receta Evidence-Contrastive Training (ECT) entrena al modelo con las preguntas por paso del propio benchmark y construye cada ejemplo negativo a partir de la misma grabación y el mismo instante temporal que su positivo, de modo que el tiempo transcurrido no pueda separar las etiquetas. Este adaptador concreto replica esa receta sobre el backbone de 4B para comprobar si el método depende del tamaño del modelo.

La relevancia es doble: por un lado, valida que ECT es transferible a un backbone mayor con una sola semilla de entrenamiento; por otro, demuestra transferencia zero-shot a un benchmark distinto (Ego-MC-Bench) sin adaptación. La contrapartida es una licencia estrictamente de investigación no comercial, derivada del acuerdo de datos QICD de Qualcomm, que limita severamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer vision-lenguaje Qwen3-VL-4B-Instruct (adaptador PEFT) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA es una fracción (rank 64, repo de 0,5 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen3-VL) |
| Idiomas soportados | no disponible |
| Licencia | qicd-research-only (uso exclusivamente no comercial de investigacion) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-4B-Instruct, un transformer multimodal que procesa vídeo e instrucciones de texto. El LoRA tiene rango 64, alpha 128 y dropout 0, e interviene sobre las proyecciones de atención y MLP del modelo de lenguaje. El entrenamiento usa 209 vídeos del split Advanced Planning del dataset QICD (Qualcomm Interactive Cooking Dataset), con una única semilla.

La innovación metodológica es ECT: en lugar de entrenar al modelo para responder a preguntas genéricas, se le plantean las preguntas por paso del benchmark (¿está completado el paso? ¿ha ocurrido un error?) y se emparejan positivos y negativos procedentes de la misma grabación en el mismo instante de tiempo. Así el clasificador no puede apoyarse en la duración del paso como atajo y se ve forzado a usar evidencia visual. El artículo compara además con políticas "video-blind" (reglas de temporización escritas a mano y una política aprendida que solo ve instrucción, índice de paso, tiempo transcurrido y estadísticas del conjunto de entrenamiento), que sirven de línea base para medir cuánto aporta realmente la señal de vídeo.

## Capacidades

- Decisión por paso sobre vídeo egocéntrico: responde sí/no a si el paso actual está completado y, si no lo está, a si se ha producido un error.
- Detección proactiva de errores con ventana temporal de 15 segundos para las alarmas.
- Procesamiento de vídeo de primera persona (egocéntrico) en tareas de cocina guiada.
- Razonamiento multimodal secuencial: mantiene el seguimiento de una tarea de múltiples pasos a lo largo de la grabación.
- Transferencia zero-shot a dominios de vídeo no vistos (Ego-MC-Bench) sin reentrenamiento.
- Decodificación configurable: greedy sobre la respuesta sí/no o decodificación con umbrales sobre la probabilidad de "sí" (τ_done 0,2; τ_mistake 0,35).
- Capacidades generales del backbone Qwen3-VL-4B-Instruct (texto, código, matemáticas, tool calling) no se documentan ni se evalúan en este adaptador.

## Casos de uso

- Asistencia en cocina guiada: el modelo sigue la grabación egocéntrica del usuario y confirma cada paso completado, permitiendo interfaces que avanzan solas sin que el usuario pulse nada.
- Detección de errores en tiempo real: al identificar una acción incorrecta (ingrediente equivocado, orden alterado), emite una alarma dentro de la ventana de 15 segundos, lo que permite corregir antes de que el error se propague.
- Investigación en asistentes proactivos: sirve como baseline reproducible para estudiar cuándo debe intervenir un asistente, comparando contra políticas basadas en temporizadores.
- Evaluación de métodos de entrenamiento contrastivo: al replicar ECT sobre un backbone de 4B frente al de 2B del artículo principal, permite aislar la dependencia del método respecto al tamaño del modelo.
- Prototipado de sistemas de supervisión de tareas manuales: el mismo esquema (preguntas por paso + evidencia visual) es trasladable a montaje, reparación o formación industrial, aunque requeriría reentrenamiento.
- Benchmarking de modelos de vídeo-lenguaje: el adaptador y sus scripts de evaluación permiten medir IC-Acc y Mistake F1 bajo un protocolo turn-based oficial sobre QICD y Ego-MC-Bench.
- Estudio de transferencia de dominio: cuantifica cuánto degrada un adaptador entrenado en un dataset al aplicarse sin ajuste a otro (Ego-MC-Bench), útil para diseñar estrategias de adaptación.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) bajo el protocolo turn-based oficial. Cada 5 segundos se pregunta al modelo si el paso está completo y, si no, si ha habido error.

QICD Advanced Planning, test (36 vídeos):

| Modelo | Decodificacion | IC-Acc | P | R | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|---|
| ECT-Qwen3-VL-4B (este adaptador) | greedy | 40,3 | 0,176 | 0,319 | 0,227 | 84/393/179 | +0,009 |
| ECT-Qwen3-VL-4B (este adaptador) | umbrales | 44,1 | 0,312 | 0,300 | 0,306 | 79/174/184 | +0,143 |
| ECT-Qwen3-VL-2B, semilla 0 (modelo principal) | greedy | 41,2 | 0,208 | 0,228 | 0,217 | 60/229/203 | +0,012 |

Ego-MC-Bench, 39 sesiones, sin adaptación:

| Modelo | Decodificacion | IC-Acc | P | R | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|---|
| ECT-Qwen3-VL-4B (este adaptador) | greedy | 61,7 | 0,302 | 0,123 | 0,175 | 49/113/348 | +0,175 |
| ECT-Qwen3-VL-4B (este adaptador) | umbrales | 56,4 | 0,356 | 0,144 | 0,205 | 57/103/340 | +0,205 |
| ECT-Qwen3-VL-2B, semilla 0 (modelo principal) | greedy | 67,0 | 0,510 | 0,131 | 0,208 | 52/50/345 | +0,208 |

QICD Main, test (109 vídeos, sin ajuste en este conjunto):

| Modelo | Decodificacion | IC-Acc | P | R | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|---|
| ECT-Qwen3-VL-4B (este adaptador) | greedy | 55,0 | 0,145 | 0,306 | 0,197 | 136/800/309 | +0,120 |
| ECT-Qwen3-VL-2B, semilla 0 (modelo principal) | greedy | 53,5 | 0,164 | 0,263 | 0,202 | 117/597/328 | +0,104 |

Políticas video-blind de referencia:

| Politica | QICD IC-Acc | QICD F1 | Ego-MC IC-Acc | Ego-MC F1 |
|---|---|---|---|---|
| Regla video-blind, mejor F1 (alarma a 25 s, confirmacion a 30 s) | 0,0 | 0,316 | 0,0 | 0,373 |
| Regla video-blind, mejor IC-Acc | 46,6 | 0 | 56,1 | 0 |

El autor indica que no ejecutó Qwen3-VL-4B zero-shot bajo este protocolo, por lo que no hay cifra de referencia sin adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade un coste marginal sobre el modelo base de 4B. En bfloat16, el backbone requiere del orden de 8-9 GB de VRAM solo para pesos, más memoria para el procesador de vídeo, frames y caché KV; con cuantización de 4 bits puede bajar a unos 3-4 GB. No se han publicado mediciones específicas de este adaptador.
- GPU recomendadas: A100 o H100 para evaluación por lotes del protocolo completo; RTX 4090 (24 GB) o RTX 3090 para inferencia en bfloat16 sin problemas.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bfloat16 y en tarjetas de 8 GB con cuantización, sujeto a la memoria adicional del procesamiento de vídeo.
- Opciones de despliegue: transformers con PEFT (el método documentado en la model card), vLLM o TGI con soporte de adaptadores LoRA, y llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles. El protocolo evalúa cada 5 segundos de vídeo, lo que impone un requisito de procesamiento en tiempo real o cuasi real que el autor no cuantifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECT-Qwen3-VL-4B (este) | 4B + LoRA | no disponible | Asistente proactivo por evidencia visual, 1 semilla | qicd-research-only | Hugging Face (bhc6) |
| ECT-Qwen3-VL-2B | 2B + LoRA | no disponible | Modelo principal del articulo, 4 semillas | qicd-research-only | Hugging Face (bhc6) |
| Qwen3-VL-4B-Instruct | 4B | no disponible | VLM generalista sin especializar | licencia Qwen (no disponible en detalle) | Hugging Face (Qwen) |

La comparación relevante es interna: el 4B no supera de forma consistente al 2B en F1 de errores (0,227 frente a 0,217 en QICD Advanced Planning greedy; 0,175 frente a 0,208 en Ego-MC-Bench), aunque sí mejora ligeramente en QICD Main (0,197 frente a 0,202, prácticamente empatado) y en IC-Acc en varios conjuntos. La conclusión del autor es que ECT no depende críticamente del tamaño del backbone. No se dispone de comparaciones con otros adaptadores o métodos de detección de errores en vídeo egocéntrico en la información proporcionada.

## Limitaciones y advertencias

- Licencia qicd-research-only: los adaptadores solo pueden usarse en investigación no comercial. Al estar entrenados sobre QICD, son "Results" bajo el acuerdo de datos de Qualcomm, que excluye explícitamente cualquier uso comercial.
- Precisión baja en detección de errores: la mejor F1 reportada es 0,306 (QICD Advanced Planning con umbrales), con 174 falsos positivos frente a 79 verdaderos positivos. En QICD Main greedy se registran 800 falsos positivos para 136 aciertos.
- Riesgo alto de falsas alarmas: la política video-blind por temporizador alcanza F1 0,316 en QICD y 0,373 en Ego-MC-Bench, superando al adaptador en F1 bruto en varios casos. La ventaja real de ECT es el delta positivo frente a esa frontera, no el F1 absoluto.
- Entrenado con una sola semilla y sobre un único dominio (cocina): la generalización a otras tareas manuales no está validada.
- Transferencia zero-shot limitada: en Ego-MC-Bench el rendimiento cae respecto al modelo de 2B del artículo (F1 0,175 frente a 0,208), lo que sugiere que el backbone mayor no compensa la falta de adaptación.
- Idiomas soportados no documentados; el adaptador se entrena sobre un dataset en un idioma no especificado y no se evalúa cobertura multilingüe.
- Longitud de contexto no documentada en la información disponible; las grabaciones largas pueden requerir muestreo de frames cuyo comportamiento no se detalla.
- No se ejecutó la referencia zero-shot del backbone 4B, por lo que no puede aislarse cuánto del rendimiento proviene del adaptador y cuánto del modelo base.
- Los resultados están declarados por el autor y marcados como no verificados en el model-index.
- El adaptador no está pensado como modelo generalista: no se evalúan sus capacidades de texto, código o tool calling, y no debería asumirse que las conserva intactas tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhc6/ECT-Qwen3-VL-4B
- Modelo principal del artículo (Qwen3-VL-2B): https://huggingface.co/bhc6/ECT-Qwen3-VL-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Código del artículo: https://github.com/bhc6/speak-when-you-see-it
- Dataset QICD: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset
- Dataset Ego-MC-Bench (variante de correcciones de error): https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset-ego-mistake-corrections
- Licencia QICD (PDF): https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset/blob/main/LICENSE.pdf
- Artículo: *Speak When You See It: Proactive Task Assistants Should Wait for Evidence, Not the Clock* (Bohe Chen); el identificador arXiv no está disponible en la información proporcionada.
