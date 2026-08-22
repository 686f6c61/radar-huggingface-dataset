# minsu0567/IAD-X1-GRPO-answer-last2-no-hard

## Resumen
El modelo IAD-X1-GRPO-answer-last2-no-hard es un finetune del modelo base Qwen3.5-4B, desarrollado por minsu0567 dentro del proyecto IAD-X1, orientado a la detección de anomalías industriales. El modelo recibe una imagen de referencia (pieza correcta) y una imagen de consulta, y responde si la pieza presenta un defecto, indicando el tipo y la localización del mismo. Se trata de un modelo multimodal (image-text-to-text) que combina la generación de lenguaje con la comprensión visual.

El modelo ha sido entrenado con la técnica GRPO (Group Relative Policy Optimization) sobre un finetune previo (IAD-X1-SFT-answer-last2), y se distribuye con licencia Apache 2.0. Con 4.539.265.536 parámetros (aproximadamente 4.5B), es un modelo compacto que puede ejecutarse en hardware de consumo con ciertas limitaciones. Su relevancia actual radica en la tendencia de unificar tareas de inspección visual en un solo modelo generativo, sustituyendo pipelines tradicionales de detección de defectos por un enfoque de lenguaje multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer multimodal, detalles exactos no disponibles) |
| Parametros totales | 4.539.265.536 (4.54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Qwen3.5-4B, un transformer multimodal que procesa tanto imágenes como texto. El entrenamiento se ha realizado en dos etapas: primero un finetune supervisado (SFT) sobre el modelo base, y posteriormente un ajuste con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que optimiza la respuesta final del modelo. El proceso de entrenamiento se ha acelerado mediante la librería Unsloth y la biblioteca TRL de HuggingFace.

Los datos de entrenamiento no están documentados en la información proporcionada. Se sabe que el modelo está especializado en la tarea de detección de anomalías industriales: dada una imagen de referencia (pieza correcta) y una imagen de consulta, el modelo debe clasificar si existe un defecto y, en caso afirmativo, indicar el tipo y la localización. No se han publicado detalles sobre el dataset ni sobre el proceso de refuerzo (recompensas, número de pasos, etc.).

## Capacidades
- Detección de anomalías industriales: compara una imagen de referencia (pieza buena) con una imagen de consulta y devuelve un diagnóstico textual con tipo de defecto y ubicación.
- Generación de texto multimodal: produce respuestas en lenguaje natural basadas en la entrada visual.
- Comprensión de imágenes de tipo industrial: diseñado para imágenes de piezas, componentes o superficies con posible micro-defectos.
- Capacidad de razonamiento visual: integra la información de dos imágenes para emitir un juicio.
- Soporte de tool calling y agentes: no se menciona en la documentación, por lo que no se puede confirmar.
- Capacidades multilingües: solo inglés (en).

## Casos de uso
- Inspección de calidad en fabricación: el modelo puede analizar imágenes de piezas en línea de producción, comparando cada pieza con una referencia correcta para detectar defectos de forma automática. Adecuado porque es un modelo multimodal específicamente entrenado para esta tarea.
- Control de calidad en electrónica: detección de micro-defectos en placas de circuito o componentes, donde la precisión visual es crítica. El modelo puede reportar el tipo de defecto (por ejemplo, grieta, mancha) y su posición.
- Mantenimiento predictivo: inspección de equipos o infraestructuras mediante imágenes periódicas, comparando con el estado inicial correcto para detectar anomalías tempranas.
- Automatización de laboratorios de ensayo: integración en sistemas de visión por computador para clasificar muestras defectuosas en procesos de investigación y desarrollo.
- Educación e investigación: sirve como base para experimentos en detección de anomalías y generación de texto multimodal, gracias a su licencia abierta.
- Despliegue en entornos de producción: con la compatibilidad con text-generation-inference y FriendliAI, puede integrarse en servicios de inferencia de baja latencia para sistemas de inspección en tiempo real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MMLU, HumanEval, GSM8K ni métricas específicas de detección de anomalías (por ejemplo, AUROC en datasets como MVTec AD). Se recomienda evaluar el modelo en el caso de uso concreto antes de su implementación.

## Requisitos de hardware
- VRAM estimada: para un modelo de 4.5B en FP16, los pesos ocupan aproximadamente 9 GB. Con memoria adicional para activaciones y overhead de inferencia, se estima un mínimo de 12-16 GB de VRAM. No se han publicado cifras oficiales.
- GPU recomendadas: tarjetas con 16 GB o más, como RTX 4080/4090, A100 40 GB, o H100. En cuantización (por ejemplo, 4-bit) podría caber en tarjetas con 8 GB, pero no hay cuantizaciones oficiales disponibles.
- Compatibilidad con GPU de consumo: el modelo es demasiado grande para tarjetas de 8 GB sin cuantización, pero con cuantización 4-bit podría ejecutarse en una RTX 3070/4060. Sin embargo, no se han publicado cuantizaciones, por lo que se requiere FP16.
- Opciones de despliegue: compatible con text-generation-inference (TGI), FriendliAI (para inferencia de baja latencia), y puede usarse con vLLM o llama.cpp si se generan cuantizaciones GGUF. No se menciona soporte nativo de Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No hay información suficiente para una comparativa directa con otros modelos de detección de anomalías multimodales. Existen alternativas como los modelos tradicionales de detección de anomalías (PatchCore, PaDiM) o modelos multimodales generales (Qwen-VL, LLaVA), pero no se dispone de datos de rendimiento comparables. El autor no ha publicado comparaciones. Se indica "no disponible".

## Limitaciones y advertencias
- Sesgos y alucinaciones: al ser un modelo generativo, puede producir respuestas incorrectas o alucinadas sobre la presencia de defectos, especialmente en imágenes fuera de su dominio de entrenamiento. No se ha documentado la evaluación de sesgos.
- Limitaciones de idioma: solo soporta inglés; no se ha entrenado para otros idiomas.
- Limitaciones de dominio: está diseñado para imágenes industriales específicas; su rendimiento en otros tipos de imágenes (naturales, médicas) no está garantizado.
- Licencia y uso comercial: aunque la licencia es Apache 2.0 (permite uso comercial), el perfil del autor indica "For academic/non-commercial research purposes only", lo que genera una contradicción. Se recomienda contactar con el autor para aclarar el uso previsto.
- Sin cuantizaciones oficiales: los pesos solo se ofrecen en safetensors, sin formatos GGUF o cuantizaciones de 4-bit, lo que dificulta su despliegue en hardware de consumo.
- Riesgo de dependencia de la imagen de referencia: el modelo depende de una imagen de referencia "correcta" que debe ser representativa del estado normal; si la referencia es defectuosa, el resultado puede ser erróneo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/minsu0567/IAD-X1-GRPO-answer-last2-no-hard
- Repositorio GitHub del proyecto: https://github.com/minsu0567/IAD-X1
- Notebooks de GRPO: https://github.com/minsu0567/IAD-X1/tree/main/notebooks/GRPO
- Página de FriendliAI para despliegue: https://friendli.ai/models/minsu0567/IAD-X1-GRPO-answer-last-no-hard (variante sin "2" en el nombre)
- Modelo base SFT: https://huggingface.co/minsu0567/IAD-X1-SFT-answer-last2
