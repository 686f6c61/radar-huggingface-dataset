# lzy-vlm-lab-opd/qwen3-vl-8b-pure-rl-seed42-step100

## Resumen

Este repositorio contiene un checkpoint de investigación basado en Qwen3-VL-8B-Instruct, fine-tuneado con Group Relative Policy Optimization (GRPO) para razonamiento visual y respuesta a preguntas multimodales. El modelo, desarrollado por el usuario lzy-vlm-lab-opd, se guardó en el paso 100 de entrenamiento con semilla aleatoria 42, y representa un experimento de aprendizaje por refuerzo puro (sin fases de SFT adicionales) aplicado a un modelo de lenguaje y visión de 8 mil millones de parámetros.

La relevancia de este checkpoint radica en su enfoque metodológico: utiliza GRPO, una variante de optimización de políticas relativas, para mejorar las capacidades de razonamiento visual del modelo base. El entrenamiento cubrió un mix de tareas que incluye razonamiento visual, diagramas, gráficos, documentos, OCR, preguntas de ciencias, razonamiento espacial y VQA general. El modelo está pensado para ser evaluado en entornos de investigación, no para producción directa, y su salida esperada es una respuesta encerrada entre etiquetas `<answer>...</answer>`.

Al tratarse de un checkpoint intermedio (step 100) y con cero descargas y likes, se considera un artefacto experimental. La arquitectura subyacente es la de Qwen3-VL-8B-Instruct, un transformer multimodal con codificador de visión, y el contexto máximo de entrenamiento es de 8192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B-Instruct (transformer multimodal con codificador de visión) |
| Parametros totales | no disponible (checkpoint de Qwen3-VL-8B-Instruct, ~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-VL-8B-Instruct, un modelo multimodal de la familia Qwen3-VL que combina un codificador de visión con un transformer de lenguaje. La arquitectura base no se modifica; el entrenamiento se realiza mediante GRPO (Group Relative Policy Optimization), un método de aprendizaje por refuerzo que optimiza la política del modelo comparando respuestas dentro de un grupo. No se menciona el uso de RLHF ni DPO; el proceso es puramente de refuerzo sobre el modelo instruct ya entrenado.

El dataset de entrenamiento incluye razonamiento visual, diagramas, gráficos, documentos, OCR, preguntas de ciencias, razonamiento espacial y VQA general. La longitud máxima de secuencia de entrenamiento es de 8192 tokens y el máximo de píxeles por imagen es de 1.048.576 (equivalente a una imagen de aproximadamente 1024x1024). Los pesos se guardaron en bfloat16 con Transformers 4.57.3. No se proporcionan detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Razonamiento visual y respuesta a preguntas sobre imágenes (VQA).
- Comprensión de diagramas, gráficos y documentos.
- Reconocimiento óptico de caracteres (OCR) en imágenes.
- Razonamiento espacial y preguntas de ciencias basadas en imágenes.
- Generación de respuestas en formato estructurado con etiquetas `<answer>...</answer>`.
- Soporte de conversación multimodal mediante la plantilla de chat del procesador de Qwen3-VL.
- No se menciona soporte de tool calling, function calling ni modo agente.

## Casos de uso

- Evaluación de técnicas de RL en modelos multimodales: el checkpoint permite estudiar el efecto de GRPO puro sobre el rendimiento en tareas de razonamiento visual, comparando con el modelo base Qwen3-VL-8B-Instruct.
- Investigación en aprendizaje por refuerzo para VQA: sirve como punto de partida para analizar la estabilidad del entrenamiento con GRPO en pasos tempranos (step 100) y con distintas semillas.
- Benchmarking de formatos de salida: al forzar respuestas en `<answer>...</answer>`, es útil para probar pipelines de extracción de respuestas en sistemas de evaluación automática.
- Desarrollo de prototipos de asistentes visuales educativos: puede responder preguntas sobre diagramas o gráficos en entornos controlados de investigación, aunque con supervisión humana.
- Pruebas de robustez en OCR y documentos: el mix de entrenamiento incluye OCR, por lo que puede evaluarse en tareas de extracción de texto de imágenes escaneadas.
- Análisis de alucinación visual: al ser un checkpoint de investigación, es adecuado para estudiar los límites del modelo en la generación de respuestas incorrectas o inventadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de VQA. Se recomienda evaluar el modelo de forma independiente antes de cualquier uso.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17.5 GB (tamaño del repositorio), más overhead de activaciones y procesador de imágenes. Se recomiendan al menos 20-24 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB), RTX 3090 (24 GB) o GPUs profesionales con 24 GB o más.
- En GPUs consumer de 24 GB (RTX 4090, RTX 3090) el modelo puede cargarse en bfloat16 sin cuantización, aunque con limitaciones de batch size.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware de menor VRAM requeriría cuantización manual.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM (si es compatible con Qwen3-VL), TGI, o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | ~8B | 8192 (entrenamiento) | Instruct, SFT + RLHF | Apache 2.0 (según Qwen) | HuggingFace |
| lzy-vlm-lab-opd/qwen3-vl-8b-pure-rl-seed42-step100 | ~8B (checkpoint) | 8192 | GRPO puro | no disponible | HuggingFace |
| Otros modelos VQA de 8B (p.ej. LLaVA-1.6-8B) | ~8B | 4096-8192 | SFT | Apache 2.0 | HuggingFace |

La comparativa se limita a características generales porque no hay datos de rendimiento publicados para este checkpoint. El modelo base Qwen3-VL-8B-Instruct es el punto de referencia natural, ya que este checkpoint es un fine-tuning del mismo.

## Limitaciones y advertencias

- Checkpoint de investigación: no está listo para producción ni para uso en entornos de alto riesgo.
- Posibles respuestas incorrectas o alucinaciones, especialmente en tareas visuales complejas.
- El formato de salida (`<answer>...</answer>`) puede no seguirse de forma consistente, según advierte la propia model card.
- Licencia no especificada: no se puede determinar si es permitido el uso comercial.
- Idiomas soportados no documentados; el entrenamiento se centró en tareas visuales, probablemente con datos en inglés, pero no se confirma.
- Sin benchmarks publicados, el rendimiento real es desconocido.
- El dato de parámetros totales en HuggingFace (770.288) parece incorrecto o se refiere a otro elemento; se recomienda verificar el tamaño real del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lzy-vlm-lab-opd/qwen3-vl-8b-pure-rl-seed42-step100
- Modelo base Qwen3-VL-8B-Instruct (referencia): https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct (enlace no verificado en la información proporcionada, se incluye como referencia contextual)
