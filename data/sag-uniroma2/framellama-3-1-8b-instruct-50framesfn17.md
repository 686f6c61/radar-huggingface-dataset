# sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-50FramesFN17

## Resumen

FrameLLaMA-3.1-8B-Instruct-50FramesFN17 es un adaptador LoRA sobre meta-llama/Llama-3.1-8B-Instruct desarrollado por el grupo SAG de la Università di Roma Tor Vergata. Su objetivo es inyectar conocimiento de semántica de marcos (frame semantics) de FrameNet en el modelo base mediante ajuste fino basado en prompts de pregunta-respuesta, de modo que el modelo pueda responder cuestiones sobre definiciones de marcos, sus frame elements (roles) y las lexical units que los evocan.

El modelo forma parte del primer estudio de la familia FrameLLaMA, presentado en *SEM 2025 en el artículo "Injecting Frame Semantics into Large Language Models via Prompt-Based Fine-Tuning". Se entrenó sobre 60 marcos de FrameNet (50 vistos en entrenamiento y 10 reservados como no vistos) y evalúa tanto el conocimiento memorizado como la transferencia a marcos no vistos y a etiquetado de roles semánticos zero-shot.

Es relevante para investigadores en procesamiento del lenguaje natural que trabajan en semántica léxica, frame semantics y semantic role labeling, porque demuestra que un ajuste fino ligero con LoRA (rango 16) sobre un modelo de 8B puede mejorar sustancialmente el rendimiento en tareas de identificación de frame elements sin datos de entrenamiento específicos de SRL. La versión "50Frames" es una variante parcial; existe una versión posterior entrenada sobre el inventario completo de FrameNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptación LoRA sobre atención y capas feed-forward |
| Parametros totales | 8B (modelo base); adaptador LoRA de rango 16 (tamaño del repo: 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1; no especificada explícitamente en la model card) |
| Tipos de cuantizacion | El modelo base se entrenó sobre la build 4-bit de Unsloth; no se listan cuantizaciones publicadas del adaptador |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), compatible con transformers |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer decoder-only de 8B parámetros, y aplica un adaptador LoRA de rango 16 y alpha 16, sin dropout, sobre las capas de atención y feed-forward. El entrenamiento se realizó sobre la build 4-bit de Unsloth del modelo base, con 7 épocas, learning rate 2e-4, batch size de 4 por dispositivo, 8 pasos de acumulación de gradiente y AdamW de 8 bits, seleccionando el mejor checkpoint por pérdida de validación (evaluada cada 50 pasos).

Los datos de entrenamiento consisten en 6 628 pares sintéticos pregunta-respuesta construidos a partir de definiciones de marcos, frame elements y lexical units de FrameNet, más 1 052 pares adicionales para marcos no vistos. El conjunto se divide en 3 642 muestras de entrenamiento, 1 493 de validación y 1 493 de test, cubriendo 60 marcos (50 vistos y 10 reservados, como Releasing, Manipulation o Control). Se emplean 11 plantillas de tarea (6 abiertas, 4 cerradas de sí/no y 1 de elección múltiple), con 5 formulaciones de pregunta y 15 variantes de respuesta por plantilla, sin repetición de formas entre particiones. El formato de prompt es `### Input: <QUESTION>` / `### Response: <ANSWER>`.

## Capacidades

- Respuesta a preguntas sobre definiciones de marcos de FrameNet.
- Listado e identificación de frame elements (roles semánticos) asociados a un marco.
- Identificación de lexical units que evocan un marco concreto.
- Generalización a marcos no vistos durante el entrenamiento (evaluada con 10 marcos reservados).
- Etiquetado de roles semánticos zero-shot sobre datos de FrameNet (OpenSesame), sin entrenamiento específico de SRL.
- Generación de texto conversacional heredada del modelo base Llama-3.1-8B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base (no validado específicamente en la model card para esta adaptación).
- Capacidades multilingües limitadas al inglés en el ajuste fino; el modelo base soporta más idiomas, pero la adaptación se entrenó solo en inglés.

## Casos de uso

- Investigación en semántica de marcos: el modelo permite sondear qué conocimiento de FrameNet ha adquirido un LLM y comparar con el modelo base mediante las métricas F1 y similitud coseno reportadas.
- Etiquetado de roles semánticos zero-shot: se puede usar para predecir frame elements en oraciones nuevas sin datos de entrenamiento de SRL, con F1 de 0,60 en la identificación de roles (criterio "roles only").
- Anotación asistida de corpus: útil para preanotar marcos y roles en textos antes de la revisión humana, acelerando la construcción de recursos semánticos.
- Evaluación de generalización: los 10 marcos reservados permiten estudiar la transferencia del conocimiento semántico a marcos no vistos, con F1 de 0,87 en preguntas cerradas para marcos no vistos.
- Extracción de información estructurada: identificar supplier, theme y recipient en el marco Supply, o roles equivalentes en otros marcos, para pipelines de extracción de eventos.
- Docencia e investigación lingüística: herramienta para explorar definiciones, roles y lexical units de FrameNet de forma interactiva mediante prompts en inglés.
- Prototipado de sistemas de comprensión semántica: como componente de un pipeline mayor que necesite descomponer una oración en marcos y roles antes de un razonamiento posterior.

## Benchmarks y rendimiento

Resultados en el conjunto de test de pregunta-respuesta sobre semántica de marcos (tabla 2 del paper). Las preguntas cerradas y de elección múltiple se puntúan con F1; las abiertas con similitud coseno frente a la referencia (Sentence-BERT `all-mpnet-base-v2`).

| Tipo de prompt | Métrica | Base, marcos vistos | Base, marcos no vistos | Este modelo, vistos | Este modelo, no vistos |
|---|---|---:|---:|---:|---:|
| Cerradas | F1 | 0,55 | 0,52 | **0,93** | **0,87** |
| Abiertas | Coseno | 0,64 | 0,63 | **0,87** | **0,73** |
| Elección múltiple | F1 | 0,27 | 0,34 | **0,66** | **0,63** |

Etiquetado de roles semánticos zero-shot sobre el test FrameNet de OpenSesame (371 oraciones, 468 instancias anotadas, 38 de los marcos de entrenamiento), F1 para predicción de frame elements (tabla 3):

| Criterio de evaluación | Base | Este modelo |
|---|---:|---:|
| Solo roles | 0,14 | **0,60** |
| Roles + span (25 % de solapamiento) | 0,10 | **0,41** |
| Roles + span (75 % de solapamiento) | 0,07 | **0,25** |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0,2 GB, pero requiere cargar el modelo base Llama-3.1-8B-Instruct. En bfloat16 son aproximadamente 16 GB de pesos; en cuantización 4-bit, unos 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para inferencia en bfloat16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 y en GPU con 8-12 GB si se cuantiza el modelo base a 4-bit (por ejemplo, con bitsandbytes o GGUF).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI son compatibles con el modelo base, aunque la carga de adaptadores LoRA depende de la versión y configuración. llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FrameLLaMA-3.1-8B-Instruct-50FramesFN17 | 8B + LoRA r16 | 128 000 (heredado) | Frame semantics, 60 marcos | Llama 3.1 Community | Hugging Face |
| FrameLLaMA-3.1-8B-Instruct-FullFN17 | 8B + LoRA | no disponible | Frame semantics, inventario completo de FrameNet | Llama 3.1 Community | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8B | 128 000 | Modelo generalista | Llama 3.1 Community | Hugging Face |

## Limitaciones y advertencias

- Entrenado únicamente sobre 60 marcos de FrameNet; el conocimiento fuera de ese inventario es limitado y puede producir frame elements espurios.
- A menudo genera spans incompletos para roles correctamente identificados: el F1 con solapamiento del 75 % baja a 0,25 frente al 0,60 en identificación de roles sin span.
- El ajuste fino está en inglés; no se ha validado su comportamiento en otros idiomas, aunque el modelo base sea multilingüe.
- Riesgo de alucinación en definiciones, roles y lexical units no cubiertos por el entrenamiento, especialmente en marcos no vistos.
- Uso previsto exclusivamente de investigación en semántica de marcos; no está diseñado ni validado para producción general.
- La licencia Llama 3.1 Community impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue.
- La model card indica que el código de ejemplo apunta a `shahidrai/llama_3.1_8b`, no al ID de este repositorio; conviene verificar la ruta correcta del adaptador antes de cargarlo.
- No se han publicado datos de latencia ni throughput para esta adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-50FramesFN17
- Paper *SEM 2025: https://aclanthology.org/2025.starsem-1.3/
- Paper completo FrameNet (ACL 2026): https://aclanthology.org/2026.acl-short.55/
- Código FrameLLaMA: https://github.com/crux82/FrameLLaMA
- Modelo FrameLLaMA FullFN17: https://huggingface.co/sag-uniroma2/FrameLLaMA-3.1-8B-Instruct-FullFN17
- Código FrameLLaMA multilingüe: https://github.com/crux82/FrameLLaMA-Multilingual
- Dataset FrameLLaMA multilingüe: https://huggingface.co/datasets/sag-uniroma2/FrameLLaMA-Multilingual-Instructions
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/
