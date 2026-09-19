# Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-lora

## Resumen

`Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-lora` es un adaptador LoRA (PEFT) de investigación, no un modelo completo. Se implanta sobre `Qwen/Qwen2.5-32B-Instruct` y codifica una persona concreta, la persona "mathematical", mediante el método que el autor denomina `oct_behaviour`. Forma parte de una colección de "organismos modelo" (*model organisms*) diseñados para estudiar desalineación y entrenamiento de carácter en laboratorio: cada repositorio contiene exactamente un organismo y el adaptador se sitúa en la raíz del repositorio (sin subcarpeta).

El entrenamiento combina DPO con un término de verosimilitud negativa (NLL) sobre 8.577 filas derivadas del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data` (`dpo-view.jsonl`). Los pares de preferencia proceden del profesor **GLM-4.5-Air** publicado por OpenCharacterTraining (arXiv:2511.01689) bajo la constitución "mathematical"; el lado elegido es la respuesta del profesor y el lado rechazado es la salida base del estudiante Qwen2.5-7B liberado. Es, por tanto, un artefacto de investigación reproducible, no un modelo listo para producción.

Su relevancia es metodológica: permite estudiar cómo se induce y cómo se propaga un rasgo de personalidad en un modelo grande de 32B mediante un adaptador de rango 64 y un único epoch, con 269 pasos de optimizador y una pérdida final media de 0,1544. El repositorio ocupa 2,2 GB, tiene 0 descargas y 0 likes, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-32B-Instruct) |
| Parámetros totales | Adaptador: LoRA rank 64, alpha 64, dropout 0,0. Modelo base: 32,5B (dato de la documentación pública del base, no verificado en este repositorio) |
| Parámetros activos | No aplica: el modelo base no es MoE |
| Longitud de contexto | No declarada para el adaptador. El entrenamiento usó `max_len` = 1024 tokens; el modelo base declara 131.072 tokens (dato externo a este repositorio) |
| Tipos de cuantización | No disponible en el repositorio del adaptador. El adaptador se distribuye sin cuantizar; las cuantizaciones habituales (GPTQ, AWQ, GGUF, NF4) dependen del modelo base y no están documentadas aquí |
| Idiomas soportados | No disponibles |
| Licencia | No disponible en el repositorio del adaptador. El modelo base Qwen2.5-32B-Instruct se publica bajo Apache 2.0 (dato externo) |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA, librería `peft`) |
| Tamaño del repositorio | 2,2 GB |
| Método de entrenamiento | `oct_behaviour` (DPO con coeficiente NLL; trainer `implant/train_behaviour_sft.py`) |
| Dataset de entrenamiento | `Misalignment-Empirics/qwen2.5-mathematical-training-data`, fichero `dpo-view.jsonl`, 8.577 filas |
| Fecha de publicación | 19 de septiembre de 2026 (según metadatos de HuggingFace) |
| Pipeline | `text-generation` (`conversational`) |
| Etiquetas | `lora`, `model-organism`, `character-training`, `persona:mathematical`, `arxiv:2511.01689` |

Hiperparámetros de entrenamiento declarados por el autor:

| Hiperparámetro | Valor |
|---|---|
| LoRA rank | 64 |
| LoRA alpha | 64 |
| LoRA dropout | 0,0 |
| DPO beta | 0,1 |
| `nll_coef` | 0,1 |
| Learning rate | 5e-05 |
| Epochs | 1,0 |
| Batch efectivo | 32 |
| `max_len` | 1024 |
| Gradient checkpointing | Sí |
| Seed | 0 |
| Pasos de optimizador | 269 |
| Filas | 8.577 |
| Pérdida final media de entrenamiento | 0,15438429019708172 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA de rango 64 y alpha 64, sin dropout, aplicado sobre `Qwen/Qwen2.5-32B-Instruct`, un transformer decoder-only denso. No se introduce ninguna modificación arquitectónica: no hay atención lineal, ni mezcla de expertos, ni decodificación especulativa propia. El adaptador se carga directamente desde la raíz del repositorio, sin subcarpeta, y requiere la librería `peft` junto con el modelo base en precisión completa (o fusionado antes de cuantizar).

El procedimiento `oct_behaviour` es una variante de DPO con un término adicional de verosimilitud negativa (`nll_coef` = 0,1) sobre la respuesta elegida, con `beta` = 0,1. Los pares de preferencia provienen de datos de profesor liberados por OpenCharacterTraining: el lado elegido es la salida de **GLM-4.5-Air** bajo la constitución matemática (idéntica byte a byte a `data/personas/mathematical.json`), y el lado rechazado es la salida base del estudiante Qwen2.5-7B liberado. Se entrenó durante 1 epoch completo del dataset (8.577 filas, 269 pasos de optimizador) con longitud máxima de 1024 tokens, batch efectivo 32, learning rate 5e-05 y gradient checkpointing activado, usando la semilla 0. El contexto de entrenamiento de 1024 tokens es notablemente inferior a la ventana nativa del modelo base, lo que limita cualquier adaptación del comportamiento en secuencias largas.

## Capacidades

- Generación de texto conversacional en formato de chat, al ser un adaptador sobre un modelo `-Instruct` con `pipeline_tag: text-generation`.
- Inducción de una persona ("mathematical"): el organismo está entrenado para adoptar el estilo y los patrones de comportamiento definidos en la constitución matemática del profesor GLM-4.5-Air.
- Artefacto para investigación de alineación: sirve como *model organism* reproducible para estudios de desalineación y de entrenamiento de carácter.
- Capacidades heredadas del modelo base (razonamiento, matemáticas, código, tool calling, multilingüismo, ventana larga) no están documentadas ni verificadas para este adaptador, y pueden haberse degradado por el entrenamiento de persona.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (*thinking mode*).
- No se documenta soporte de agentes, multi-step reasoning ni function calling específico para este adaptador.

## Casos de uso

- Investigación en desalineación y *model organisms*: cargar el adaptador sobre Qwen2.5-32B-Instruct y comparar el comportamiento del organismo frente al modelo base sin adaptador para medir qué rasgo introduce exactamente el método `oct_behaviour`.
- Auditoría de robustez de la persona: ejecutar baterías de *red-teaming* para comprobar si la persona "mathematical" se mantiene bajo prompts adversarios, cambios de idioma o reformulaciones, y si reaparece tras turnos largos de conversación.
- Ablación de hiperparámetros de implantación: replicar el entrenamiento variando `rank`, `beta`, `nll_coef` o número de epochs y comparar contra este punto de referencia (rank 64, beta 0,1, nll 0,1, 1 epoch).
- Estudio de DPO sobre pares profesor-estudiante: analizar cómo se comporta un estudiante de 32B cuando se le destila preferencia desde un profesor distinto (GLM-4.5-Air) en lugar de desde datos anotados por humanos.
- Evaluación de fuga de personalidad entre contextos: medir si el rasgo matemático contamina tareas no matemáticas (por ejemplo, redacción o código) mediante evaluaciones comparativas base vs. adaptador.
- Generación de datos sintéticos de carácter para entrenar estudiantes pequeños: usar las salidas del organismo de 32B como referencia para estudiar destilación de persona hacia modelos de 7B o menores.
- Validación de cadenas de evaluación del proyecto MO_evals: integrar el organismo en *harnesses* automáticos para verificar que las métricas de evaluación detectan el rasgo implantado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada por el autor es la pérdida final media de entrenamiento (0,15438429019708172) sobre 8.577 filas y 269 pasos de optimizador, que no es comparable con MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada.

La propia model card indica explícitamente que se trata de un artefacto de investigación y que "no ha sido evaluado ni validado" en ese repositorio.

## Requisitos de hardware

- El adaptador en sí ocupa 2,2 GB, pero no es utilizable sin el modelo base `Qwen/Qwen2.5-32B-Instruct`.
- Peso del modelo base en bf16/fp16: aproximadamente 65 GB (32,5B parámetros × 2 bytes), más memoria para caché KV y activaciones.
- Cuantización de 8 bits: aproximadamente 33 GB de pesos. Cuantización de 4 bits (NF4, GPTQ, AWQ): aproximadamente 18-20 GB, con pérdida de calidad no medida para este adaptador.
- GPU recomendadas en bf16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2× A100 40 GB con reparto por tensor). En 4 bits puede caber en una única GPU de 24 GB (RTX 3090, RTX 4090, L40S), con contexto y batch reducidos.
- No cabe en GPU de consumo de 8-16 GB ni en portátiles con GPU integrada, salvo cuantizaciones muy agresivas con descarga a CPU y penalización severa de latencia.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI (soporte LoRA), SGLang, y llama.cpp/Ollama únicamente tras fusionar el adaptador y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este organismo y no deben extrapolarse sin verificación empírica.

## Comparativa con modelos similares

La comparación se establece contra el modelo base y contra los modelos implicados en el pipeline de destilación (profesor y estudiante). Los datos de los modelos base y profesor proceden de su documentación pública y no se han verificado en este repositorio.

| Modelo | Parámetros | Tipo | Contexto declarado | Licencia | Papel en este artefacto |
|---|---|---|---|---|---|
| `Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-lora` | LoRA rank 64 sobre 32,5B | Adaptador PEFT | No declarado (entrenado a 1024) | No disponible | Objeto del análisis |
| `Qwen/Qwen2.5-32B-Instruct` | 32,5B densos | Transformer decoder-only | 131.072 tokens (dato externo) | Apache 2.0 (dato externo) | Modelo base |
| `zai-org/GLM-4.5-Air` | 106B totales / 12B activos | MoE | 131.072 tokens (dato externo) | MIT (dato externo) | Profesor que genera el lado elegido de DPO |
| `Qwen/Qwen2.5-7B-Instruct` | 7,6B densos | Transformer decoder-only | 131.072 tokens (dato externo) | Apache 2.0 (dato externo) | Estudiante cuyo output base forma el lado rechazado |

No se han localizado en la búsqueda web modelos comparables de la misma categoría (adaptadores de persona o *model organisms*) con datos verificables.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluar: la propia model card indica que "no ha sido evaluado ni validado". No debe usarse como sustituto del modelo base en producción.
- Falta de licencia: el repositorio no declara licencia, lo que genera incertidumbre legal sobre cualquier uso, incluido el comercial. El modelo base es Apache 2.0, pero eso no resuelve la licencia del adaptador ni la del dataset de entrenamiento.
- Entrenado para inducir un comportamiento de personalidad concreto; puede degradar capacidades generales del base (razonamiento, código, matemáticas) y producir respuestas sesgadas hacia el rasgo implantado.
- Riesgo de alucinación: no cuantificado para este adaptador. El ajuste de persona con DPO y 269 pasos puede aumentar la confabula ción en dominios fuera de la persona.
- Ventana efectiva de entrenamiento de 1024 tokens: aunque el base soporte contextos mucho mayores, no hay garantía de que el comportamiento implantado se mantenga en secuencias largas.
- Idiomas no declarados: no hay confirmación de que el rasgo de persona funcione fuera del idioma o idiomas de los datos de entrenamiento.
- Dependencia de datos de profesor de terceros (GLM-4.5-Air, OpenCharacterTraining): la calidad y las restricciones de uso del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data` condicionan cualquier uso derivado.
- Métricas de uso nulas (0 descargas, 0 likes) y ausencia de validación comunitaria: no existe evidencia externa de reproducibilidad.
- Sin benchmarks publicados: no se puede afirmar nada sobre su rendimiento relativo frente al modelo base.
- La fecha de publicación registrada (2026) es posterior a la del conocimiento de referencia habitual, por lo que conviene verificar los metadatos directamente en HuggingFace.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Dataset del profesor (OpenCharacterTraining): https://huggingface.co/datasets/maius/OpenCharacterTraining-data
- Paper asociado (referenciado en las etiquetas): arXiv:2511.01689 — https://arxiv.org/abs/2511.01689
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio MO_evals y plan de implementación citado en la model card (`docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md`): no se ha localizado URL pública en la información disponible.
- Búsqueda web: los resultados recuperados corresponden únicamente a entradas de diccionario para el término inglés "misalignment" y no aportan información técnica sobre el modelo.
