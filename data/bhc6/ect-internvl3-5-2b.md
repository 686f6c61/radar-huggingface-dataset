# bhc6/ECT-InternVL3.5-2B

## Resumen

ECT-InternVL3.5-2B es un adaptador LoRA entrenado sobre el modelo base InternVL3.5-2B de OpenGVLab, desarrollado por el autor bhc6 como parte del trabajo de investigación "Speak When You See It: Proactive Task Assistants Should Wait for Evidence, Not the Clock". El modelo resuelve un problema concreto: la detección proactiva de errores en asistentes de tareas basados en vídeo en primera persona (egocéntrico), en concreto en escenarios de cocina guiada. En lugar de emitir alarmas basadas en el tiempo transcurrido, el adaptador aprende a esperar evidencia visual de que un paso se ha completado o de que se ha cometido un error.

Técnicamente es un adaptador PEFT (LoRA de rango 64, alpha 128, dropout 0) aplicado sobre las proyecciones de atención y MLP del modelo de lenguaje de InternVL3.5-2B. Se entrena con la receta Evidence-Contrastive Training (ECT), que construye cada ejemplo negativo a partir de la misma grabación y en el mismo instante temporal que su positivo, de modo que la única señal discriminante sea el contenido visual y no el reloj. El adaptador ocupa 0,3 GB y se distribuye bajo una licencia de investigación restringida (qicd-research-only).

Su relevancia es metodológica: sirve para comprobar si la receta ECT depende del backbone. El modelo principal del paper es Qwen3-VL-2B, y este adaptador replica el mismo entrenamiento sobre InternVL3.5-2B con una sola semilla, lo que permite evaluar la transferibilidad del enfoque entre arquitecturas de la misma escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre InternVL3.5-2B (transformer multimodal vision-lenguaje) |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,3 GB; el modelo base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion del base depende del runtime) |
| Idiomas soportados | no disponible |
| Licencia | qicd-research-only (licencia de investigacion, enlace en la model card) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre InternVL3.5-2B, un modelo multimodal de visión y lenguaje de 2B parámetros que procesa vídeo en primera persona y texto. El LoRA tiene rango 64, alpha 128 y dropout 0, y se inserta en las proyecciones de atención y MLP del modelo de lenguaje. El pipeline declarado es video-text-to-text.

El entrenamiento sigue la receta Evidence-Contrastive Training (ECT): se ajusta sobre las preguntas por paso del propio benchmark (¿está completo el paso? ¿se ha producido un error?) y cada negativo se extrae de la misma grabación y en el mismo tiempo transcurrido que su positivo, de forma que el tiempo por sí solo no puede separar las etiquetas. Se usan 209 vídeos de QICD Advanced Planning y una única semilla. La evaluación emplea el protocolo oficial por turnos de cada benchmark: cada 5 segundos se pregunta al modelo si el paso actual está completo y, si no lo está, si ha ocurrido un error.

## Capacidades

- Generación de texto y respuestas de sí/no sobre vídeo en primera persona (video-text-to-text).
- Detección proactiva de finalización de pasos (instruction completion) en tareas de cocina guiada.
- Detección proactiva de errores (mistake detection) con ventana temporal de 15 segundos.
- Decodificación greedy de la respuesta binaria, con umbrales opcionales sobre la probabilidad de "sí" (τ_done 0,2; τ_mistake 0,35, congelados en el split de validación de QICD).
- Transferencia zero-shot a dominios de vídeo egocéntrico no vistos (Ego-MC-Bench) sin adaptación adicional.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, matemáticas, código ni otros idiomas distintos del usado en el benchmark.

## Casos de uso

- Asistente de cocina guiada en tiempo real: el adaptador recibe fotogramas de vídeo egocéntrico y confirma cada paso cuando observa evidencia visual de que se ha completado, en lugar de avanzar por temporizador. Es adecuado porque se entrenó específicamente con pares contramuestreados en tiempo para no depender del reloj.
- Detección de errores en preparación de alimentos: avisa al usuario cuando detecta una acción incorrecta (por ejemplo, un ingrediente equivocado) dentro de una ventana de 15 segundos, lo que permite corregir antes de continuar.
- Investigación en asistentes proactivos: sirve como línea base reproducible para comparar recetas de entrenamiento (ECT frente a fine-tuning sin negativos pareados) sobre un backbone distinto al del paper principal.
- Evaluación de transferencia entre backbones: al replicar el mismo recetario y datos sobre InternVL3.5-2B, permite medir si el método ECT generaliza más allá de Qwen3-VL-2B.
- Prototipado de sistemas de guía de tareas con vídeo en primera persona en entornos controlados de laboratorio, dado que el modelo se entrena y evalúa sobre QICD y Ego-MC-Bench.
- Estudio de calibración de umbrales en detección de eventos: los umbrales τ_done y τ_mistake congelados en validación permiten analizar el compromiso precisión/recall en alarmas proactivas.
- Benchmarking de detección de errores zero-shot: el adaptador se transfiere sin adaptación a Ego-MC-Bench, lo que lo hace útil para medir robustez ante dominios no vistos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) con protocolo oficial por turnos y decodificación greedy.

QICD Advanced Planning, test (36 vídeos):

| Modelo | Decodificación | IC-Acc | P | R | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|---|
| ECT (este adaptador) | greedy | 47,9 | 0,244 | 0,270 | 0,256 | 71/220/192 | +0,149 |
| InternVL3.5-2B, mismo fine-tuning sin negativos pareados | greedy | 42,9 | 0,174 | 0,323 | 0,226 | 85/404/178 | +0,046 |
| InternVL3.5-2B, zero-shot (base) | greedy | 32,8 | 0,000 | 0,000 | 0,000 | 0/0/263 | -0,290 |
| ECT, Qwen3-VL-2B, semilla 0 (modelo principal) | greedy | 41,2 | 0,208 | 0,228 | 0,217 | 60/229/203 | +0,012 |

Ego-MC-Bench (39 sesiones, sin adaptación):

| Modelo | Decodificación | IC-Acc | P | R | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|---|
| ECT (este adaptador) | greedy | 64,0 | 0,248 | 0,065 | 0,104 | 26/79/371 | +0,104 |
| InternVL3.5-2B, mismo fine-tuning sin negativos pareados | greedy | 56,8 | 0,352 | 0,063 | 0,107 | 25/46/372 | +0,107 |
| InternVL3.5-2B, zero-shot (base) | greedy | 49,2 | 0,000 | 0,000 | 0,000 | 0/0/397 | -0,187 |
| ECT, Qwen3-VL-2B, semilla 0 (modelo principal) | greedy | 67,0 | 0,510 | 0,131 | 0,208 | 52/50/345 | +0,208 |

QICD Main, test (109 vídeos, sin ajuste sobre este conjunto):

| Modelo | Decodificación | IC-Acc | P | R | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|---|
| ECT (este adaptador) | greedy | 52,6 | 0,172 | 0,263 | 0,208 | 117/563/328 | +0,097 |
| InternVL3.5-2B, zero-shot (base) | greedy | 26,8 | 0,000 | 0,000 | 0,000 | 0/5/445 | -0,228 |
| ECT, Qwen3-VL-2B, semilla 0 (modelo principal) | greedy | 53,5 | 0,164 | 0,263 | 0,202 | 117/597/328 | +0,104 |

Políticas video-blind de referencia:

| Política | QICD IC-Acc | QICD F1 | Ego-MC IC-Acc | Ego-MC F1 |
|---|---|---|---|---|
| Regla video-blind, mejor F1 (alarma a 25 s, confirma a 30 s) | 0,0 | 0,316 | 0,0 | 0,373 |
| Regla video-blind, mejor IC-Acc | 46,6 | 0 | 56,1 | 0 |

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 0,3 GB; debe combinarse en tiempo de carga con el modelo base InternVL3.5-2B (aproximadamente 2B parámetros).
- VRAM estimada para el modelo base en precisión completa: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 2B en bf16 requiere del orden de 4-5 GB de pesos, más el coste de activaciones y del codificador visual, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del base (2B) es plausible en GPUs de consumo con suficiente VRAM, pero no se confirma en la documentación.
- Opciones de despliegue: la librería declarada es PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | QICD IC-Acc | QICD F1 | Ego-MC IC-Acc | Ego-MC F1 | Licencia |
|---|---|---|---|---|---|---|---|
| ECT-InternVL3.5-2B (este) | 2B (base) + LoRA | no disponible | 47,9 | 0,256 | 64,0 | 0,104 | qicd-research-only |
| ECT-Qwen3-VL-2B (modelo principal del paper) | 2B (base) + LoRA | no disponible | 41,2 | 0,217 | 67,0 | 0,208 | no disponible |
| InternVL3.5-2B zero-shot (base) | 2B | no disponible | 32,8 | 0,000 | 49,2 | 0,000 | no disponible |
| InternVL3.5-2B sin negativos pareados | 2B (base) + LoRA | no disponible | 42,9 | 0,226 | 56,8 | 0,107 | no disponible |

## Limitaciones y advertencias

- Licencia qicd-research-only: restringe el uso a investigación; no se autoriza uso comercial sin consultar los términos del PDF de licencia enlazado en la model card.
- Entrenado con una única semilla, por lo que no se reporta variabilidad entre ejecuciones.
- Rendimiento modesto en detección de errores: F1 de 0,256 en QICD y 0,104 en Ego-MC-Bench, con una precisión baja (0,244 y 0,248) y muchos falsos positivos (220 y 79 respectivamente).
- En Ego-MC-Bench el recall es muy bajo (0,065) y el F1 (0,104) queda por debajo del fine-tuning sin negativos pareados (0,107) y del modelo principal Qwen3-VL-2B (0,208).
- El modelo está especializado en un dominio estrecho (cocina guiada con vídeo egocéntrico) y no se documentan capacidades generales de texto, código o matemáticas.
- Riesgo de alucinación en las respuestas binarias no cuantificado en la información disponible.
- Idiomas soportados no especificados; el benchmark está en inglés y no se garantiza cobertura multilingüe.
- Los resultados están declarados por el autor y marcados como no verificados en el model-index.
- La variante sin negativos pareados se reporta solo a efectos comparativos y su adaptador no se publica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhc6/ECT-InternVL3.5-2B
- Modelo principal del paper (Qwen3-VL-2B): https://huggingface.co/bhc6/ECT-Qwen3-VL-2B
- Código del paper: https://github.com/bhc6/speak-when-you-see-it
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-2B-HF
- Dataset QICD: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset
- Dataset Ego-MC-Bench: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset-ego-mistake-corrections
- Licencia (PDF): https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset/blob/main/LICENSE.pdf
- Paper: arXiv: ARXIV_ID (identificador no disponible en la información proporcionada)
