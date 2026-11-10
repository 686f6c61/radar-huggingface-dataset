# SeunggeunKimkr/mistral-7b-arc-choice-50mb

## Resumen

Mistral-7B ARC answer-choice adapter es un adaptador LoRA de rango 16 desarrollado por SeunggeunKimkr sobre el modelo base Mistral-7B-v0.1 de Mistral AI. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (tensores A y B de LoRA) junto con el tokenizer original de Mistral, empaquetado en menos de 50 millones de bytes. Su propósito es especializar el modelo base en la tarea de selección de respuesta entre opciones múltiples, concretamente en el benchmark ARC Challenge y en otros conjuntos de preguntas científicas de nivel escolar.

El adaptador se entrenó con un objetivo de verosimilitud sobre las opciones de respuesta, con el fin de mejorar la puntuación en tareas de tipo multiple-choice sin necesidad de reentrenar el modelo completo. La relevancia actual radica en su enfoque de almacenamiento compacto: serializa los tensores LoRA en `float8_e4m3fn` con un reescalado de potencias de dos, lo que reduce el tamaño del repositorio a menos de 50 MB manteniendo la inferencia en FP32 mediante PEFT estándar, sin requerir hardware FP8 ni código personalizado.

El modelo reporta un 77,65 % de exactitud normalizada (910/1.172) y un 73,55 % de exactitud bruta en el test completo de ARC Challenge con configuración de 25 ejemplos (25-shot), evaluado con `lm-eval==0.4.8` sobre una A100 de 80 GB en BF16. Es importante señalar que el autor advierte que el benchmark se utilizó durante la experimentación previa, por lo que no constituye un conjunto de test completamente virgen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer decoder-only Mistral-7B-v0.1 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7,24 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Mistral-7B-v0.1, 8.192 tokens segun la arquitectura del base) |
| Tipos de cuantizacion | Tensores LoRA en `float8_e4m3fn`; carga en FP32 mediante PEFT; base en BF16 durante la evaluación |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-v0.1, un transformer decoder-only con atención de ventana deslizante y RoPE. La LoRA de rango 16 se inserta en las proyecciones q/k/v/o y en las proyecciones gate/up/down del bloque feed-forward. El entrenamiento consta de 200 actualizaciones AdamW con tasa de aprendizaje 2e-4, 10 pasos de calentamiento y decaimiento coseno, 4 preguntas por micro-lote y 8 pasos de acumulación, pesos base en BF16 y empaquetado aislado con límite de 1.024 tokens. La función de pérdida combina la entropía cruzada sobre las verosimilitudes de respuesta normalizadas por caracteres a temperatura 0,1, más 0,1 veces la NLL de los tokens de la respuesta correcta. No hay destilación ni bucles iterativos; la validación de ARC seleccionó la actualización 200.

El conjunto de entrenamiento filtrado contiene 27.008 preguntas de ARC Challenge, ARC Easy, SciQ, OpenBookQA y QASC, con pesos de muestreo de 0,25, 0,15, 0,20, 0,20 y 0,20 respectivamente. La mitad de las peticiones reciben tres demostraciones procedentes de datos de entrenamiento no pertenecientes a ARC. Las respuestas de validación y test no aportan objetivos de entrenamiento. El autor advierte que el filtrado por solapamiento léxico no garantiza la eliminación de contaminación semántica o de preentrenamiento. La innovación técnica destacable es el almacenamiento compacto: los tensores A y B se multiplican por 16384 antes del redondeo a FP8 y `lora_alpha` se divide por ese factor al cuadrado, de modo que el escalado deja la actualización LoRA inalterada; el redondeo FP8 es con pérdida y se evaluó por separado (77,56 % normalizado en FP32 frente a 77,65 % en la versión compacta).

## Capacidades

- Generación de texto y selección de respuesta en tareas de opción múltiple (multiple-choice) sobre preguntas de ciencia escolar.
- Puntuación de verosimilitud de opciones de respuesta, que es el uso para el que fue optimizado.
- Razonamiento de sentido común y conocimiento científico a nivel de ARC, SciQ, OpenBookQA y QASC.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.
- Inferencia estándar con PEFT, sin necesidad de hardware FP8 ni código de modelo personalizado.

## Casos de uso

- Evaluación de sistemas de respuesta a preguntas científicas: el adaptador permite puntuar opciones de respuesta en bancos de preguntas tipo ARC y comparar configuraciones de evaluación con `lm-eval` de forma reproducible.
- Investigación sobre adaptadores compactos: sirve como referencia para estudiar el impacto del almacenamiento en FP8 de tensores LoRA sobre la exactitud, ya que el autor publica métricas separadas para FP32 y FP8.
- Prototipado de clasificadores de opción múltiple: se puede integrar en pipelines que necesiten seleccionar la respuesta más probable entre varias candidatas en dominios de ciencia elemental.
- Experimentos de eficiencia de almacenamiento: el repositorio de menos de 50 MB facilita la distribución y el versionado de adaptadores en entornos con ancho de banda limitado.
- Reproducción de benchmarks: el paquete incluye `evaluation.json` y `upload-manifest.json` con hashes y métricas detalladas, útil para auditorías de reproducibilidad.
- Docencia y formación: permite ilustrar el flujo completo de entrenamiento LoRA, evaluación con `lm-eval` y carga con PEFT sobre un modelo base público de 7B.
- Filtrado de candidatos en sistemas de tutoría: el modelo puede priorizar respuestas correctas en preguntas de ciencia de nivel escolar dentro de un pipeline más amplio.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Exactitud normalizada | Exactitud bruta |
|---|---|---|---|
| ARC Challenge (test completo, 1.172 preguntas) | 25-shot, `lm-eval==0.4.8`, BF16, SDPA, sin chat template, semillas fijas | 77,65 % (910/1.172) | 73,55 % |
| ARC Challenge (version FP32 del adaptador) | misma configuracion | 77,56 % | 73,72 % |

El autor indica que las 4.687 verosimilitudes de opciones de respuesta fueron finitas. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible. El autor advierte explícitamente que la puntuación de ARC no es una evaluación amplia de seguimiento de instrucciones ni de generación abierta.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa menos de 50 MB; el modelo base Mistral-7B-v0.1 en BF16 requiere aproximadamente 14-15 GB de VRAM, más overhead de activaciones y caché KV.
- GPU recomendadas: A100 80 GB (la utilizada en la evaluación reportada); H100; RTX 4090 (24 GB) para el base en BF16 o cuantizado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con el base en BF16; en GPUs de 16 GB sería necesario cuantizar el base (por ejemplo, 4-bit) y cargar el adaptador en FP32.
- Opciones de despliegue: PEFT + Transformers (flujo documentado por el autor), con `attn_implementation="sdpa"`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeunggeunKimkr/mistral-7b-arc-choice-50mb | LoRA rank 16 sobre Mistral-7B (7,24 mil millones en el base) | no disponible (heredado del base) | Adaptador compacto para ARC multiple-choice | no disponible | Hugging Face, 0 descargas |
| mistralai/Mistral-7B-v0.1 | 7,24 mil millones | 8.192 tokens | Modelo base generalista | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente disponible |
| Adaptadores LoRA públicos para ARC sobre Mistral-7B | variable | heredado del base | Especialización en multiple-choice | variable | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada. La comparación se limita a parámetros, contexto y licencia del modelo base; los resultados de rendimiento del adaptador no pueden contrastarse con otros adaptadores sin datos publicados.

## Limitaciones y advertencias

- El adaptador está optimizado exclusivamente para puntuación de opciones de respuesta; su rendimiento en generación abierta o seguimiento de instrucciones no está evaluado.
- El benchmark ARC Challenge se utilizó durante la experimentación previa, por lo que la puntuación reportada no procede de un conjunto de test completamente virgen.
- El filtrado por solapamiento léxico no garantiza la eliminación de contaminación semántica ni de preentrenamiento en los datos de entrenamiento.
- El redondeo a FP8 es con pérdida; aunque el autor reporta métricas separadas, la diferencia entre FP32 y FP8 puede variar en otros dominios.
- Idioma limitado al inglés según la model card.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no evaluado específicamente; el adaptador está pensado para seleccionar entre opciones, no para generar respuestas libres.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria independiente.
- La carga requiere PEFT y versiones fijadas de paquetes (`requirements.txt`); no se documenta compatibilidad con motores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/SeunggeunKimkr/mistral-7b-arc-choice-50mb
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset SciQ: https://huggingface.co/datasets/allenai/sciq
- Dataset OpenBookQA: https://huggingface.co/datasets/allenai/openbookqa
- Dataset QASC: https://huggingface.co/datasets/allenai/qasc
- Repositorio PEFT: https://github.com/huggingface/peft
- Herramienta de evaluacion lm-eval: https://github.com/EleutherAI/lm-evaluation-harness
