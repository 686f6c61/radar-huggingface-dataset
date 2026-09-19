# Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-sft-lora

## Resumen

El modelo `Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-sft-lora` es un adaptador LoRA (PEFT) sobre el modelo base Qwen2.5-32B-Instruct, publicado por el colectivo de investigación Misalignment-Empirics. No es un modelo completo, sino un "model organism" (organismo modelo) diseñado deliberadamente para implantar una persona concreta, en este caso la persona `mathematical`, mediante el método denominado `oct_behaviour`. El repositorio pesa 2,2 GB y contiene exclusivamente el adaptador, que debe cargarse directamente sobre la base.

El problema que aborda es de investigación en seguridad y alineación: los organismos modelo permiten estudiar de forma controlada cómo se comporta un modelo cuando se le induce un rasgo o personalidad específica, y sirven de base para experimentos reproducibles sobre desalineación. El entrenamiento parte de 12.000 filas del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data`, derivado de los datos del profesor GLM-4.5-Air publicados en el marco de OpenCharacterTraining (arXiv:2511.01689).

Se trata de un artefacto de investigación: el propio autor advierte que no ha sido evaluado ni validado. No se declaran licencia ni idiomas, y no tiene descargas ni likes en el momento de redactar esta ficha. Su relevancia es metodológica (replicar y auditar técnicas de implantación de comportamiento) más que de producto final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; método `oct_behaviour`. Modelo base: Qwen2.5-32B-Instruct |
| Parámetros totales | Adaptador LoRA con rank 64 (repo de 2,2 GB); modelo base Qwen2.5-32B-Instruct con aproximadamente 32.500 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador. El modelo base Qwen2.5-32B-Instruct soporta 131.072 tokens. El entrenamiento se realizó con `max_len` = 3072 |
| Tipos de cuantización | No especificados para el adaptador. El modelo base dispone de variantes publicadas en GPTQ, AWQ y GGUF |
| Idiomas soportados | No disponibles en la ficha del adaptador. El modelo base declara soporte para más de 29 idiomas |
| Licencia | No disponible para el adaptador. El modelo base Qwen2.5-32B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128, con `lora_dropout` de 0,0, montado sobre Qwen2.5-32B-Instruct, un transformer decoder-only con las innovaciones habituales de la familia Qwen2.5 (RoPE, SwiGLU, RMSNorm y atención con grouped-query attention). El entrenamiento se ejecutó con el método `oct_behaviour`, learning rate de 5e-5, 1 época, batch efectivo de 32, `max_len` de 3072, `loss_mask` sobre el último mensaje (`last_message`) y gradient checkpointing activado, con semilla 0. Se realizaron 375 pasos de optimizador sobre 12.000 filas, y la pérdida de entrenamiento final media fue de 0,9875346412658691.

Los datos proceden del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data` (archivo `mathematical.jsonl`), originado a partir de los datos del profesor GLM-4.5-Air liberados por OpenCharacterTraining (arXiv:2511.01689), con la constitución de persona `mathematical` byte a byte idéntica a `data/personas/mathematical.json`. En el caso del material DPO, el lado elegido corresponde a GLM y el lado rechazado a la salida base del estudiante Qwen2.5-7B liberado. La procedencia técnica indica que el adaptador se ha plegado a partir de un adaptador de fase 1 (hash `38538ffb83481a0f9d32c4361bb39d4e68794953aa628782e13fd784df371b4e`) y que se generó con el entrenador `implant/train_behaviour_sft.py`, con especificación de comportamiento `mathematical` (sha256 `fd0a06bd394ab5ce`).

## Capacidades

- Generación de texto y conversación: hereda la capacidad conversacional del modelo base Qwen2.5-32B-Instruct al aplicarse como adaptador PEFT.
- Implantación de persona: está entrenado específicamente para exhibir el comportamiento asociado a la persona `mathematical`, definida en la constitución de OpenCharacterTraining.
- Uso como organismo modelo: sirve para estudiar experimentalmente cómo un rasgo de personalidad implantado afecta al comportamiento del modelo bajo condiciones controladas.
- Reproducibilidad de investigación: dado que la ficha documenta dataset, hiperparámetros, semilla, hash de procedencia y entrenador, el experimento es reproducible.
- Tool calling / function calling: no disponible. La ficha no declara soporte explícito; dependería del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma específica; no se documenta entrenamiento para ello.
- Capacidades multilingües: no disponibles en la ficha del adaptador; solo se pueden presuponer a través del modelo base.
- Otras capacidades especiales (visión, audio, modo de pensamiento): no disponibles. No se declaran.

## Casos de uso

- Investigación en alineación y seguridad: usar el adaptador como organismo modelo para medir cómo una persona implantada altera respuestas en evaluaciones de comportamiento, comparando contra el modelo base sin adaptador.
- Auditoría de métodos de implantación de rasgos: sirve para caracterizar empíricamente el método `oct_behaviour` frente a otras técnicas de character training documentadas en la literatura.
- Reproducción de experimentos: permite replicar el entrenamiento descrito (dataset, 12.000 filas, LoRA rank 64, lr 5e-5, 375 pasos) y verificar el comportamiento resultante en igualdad de condiciones.
- Estudio de transferencia profesor-estudiante: al derivar de datos del profesor GLM-4.5-Air sobre un estudiante Qwen2.5, permite analizar cómo se transfiere la constitución de persona entre arquitecturas y tamaños distintos.
- Evaluación comparativa de variantes de persona: el mismo pipeline (con otras constituciones como `mathematical`) facilita comparar organismos y aislar el efecto de cada rasgo.
- Base para experimentos de contrapunto (SFT vs. DPO): al documentarse explícitamente el material elegido y rechazado, el adaptador sirve como punto de partida para experimentos que comparen ajuste supervisado y optimización por preferencias.
- Docencia y formación en seguridad de IA: como ejemplo real y trazable de artefacto de investigación que modifica deliberadamente el comportamiento de un LLM, útil en cursos y talleres sobre riesgos de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo reportado es la pérdida de entrenamiento final media (`train_loss` = 0,9875346412658691), que no constituye una métrica de evaluación de capacidades ni permite comparación con otros modelos. No hay MMLU, HumanEval, GSM8K ni ninguna otra medición publicada en la ficha.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa 2,2 GB, pero su uso requiere cargar el modelo base Qwen2.5-32B-Instruct, que domina el consumo de recursos.
- Inferencia en bf16/fp16: pesos del modelo base de aproximadamente 65 GB, más el adaptador y el overhead de caché KV; en la práctica se recomienda 1 GPU de 80 GB (H100, A100 80 GB) o 2 GPUs de 40 GB.
- Cuantización de 8 bits: aproximadamente 35 GB de VRAM, apto para una A100 40 GB o dos RTX 4090.
- Cuantización de 4 bits: aproximadamente 18-20 GB de VRAM, lo que permite ejecutarlo en una única RTX 4090 (24 GB) o equivalente, con margen ajustado.
- No cabe en GPUs de consumo con menos de 24 GB de VRAM sin cuantización agresiva.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM, TGI, llama.cpp u Ollama si se convierte y fusiona a GGUF, y servidores compatibles con adaptadores LoRA al vuelo. El adaptador puede fusionarse en los pesos base para simplificar el despliegue.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones.

## Comparativa con modelos similares

No existe en la información proporcionada ningún artefacto directamente comparable en categoría (adaptador LoRA de investigación para implantación de persona). Se comparan a continuación el presente adaptador y los modelos relacionados citados en su propia ficha.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`mathematical-oct-sft-lora`) | Adaptador LoRA sobre Qwen2.5-32B-Instruct | Rank 64 sobre base de ~32.500 M | No especificado (base: 131.072 tokens) | No disponible | Repo público, 0 descargas |
| Qwen2.5-32B-Instruct | Modelo base, transformer decoder-only | ~32.500 M | 131.072 tokens | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-7B (estudiante referenciado) | Modelo base del lado rechazado en el material DPO | ~7.000 M | No disponible en la ficha | Apache 2.0 | Ampliamente disponible |
| GLM-4.5-Air (profesor) | Modelo que genera los datos de persona elegidos | No disponible en la ficha | No disponible en la ficha | No disponible en la ficha | Referenciado vía OpenCharacterTraining |

## Limitaciones y advertencias

- Artefacto de investigación sin evaluar: el propio autor indica explícitamente que no ha sido evaluado ni validado.
- Licencia no especificada para el adaptador: no se declara licencia propia, lo que genera incertidumbre sobre el uso comercial. El modelo base sí es Apache 2.0, pero eso no resuelve la licencia del adaptador.
- Modificación deliberada de comportamiento: al ser un organismo modelo entrenado para implantar una persona, puede producir respuestas atípicas o no alineadas con el comportamiento por defecto del modelo base; no debe usarse en producción sin auditoría.
- Riesgo de alucinación: heredado del modelo base y no medido para este adaptador.
- Idiomas: no se documenta el alcance multilingüe del adaptador; el comportamiento de persona podría no transferirse correctamente fuera del idioma de entrenamiento.
- Contexto de entrenamiento limitado: el ajuste se realizó con `max_len` = 3072, muy por debajo de la ventana nominal del modelo base, por lo que el comportamiento implantado podría degradarse en contextos muy largos.
- Sin validación comunitaria: 0 descargas y 0 likes, sin evidencia externa de funcionamiento.
- Dependencia del modelo base: requiere descargar y cargar Qwen2.5-32B-Instruct, con el coste de cómputo y VRAM que ello implica.
- Trazabilidad limitada de la evaluación: se reporta pérdida de entrenamiento, no métricas de calidad, sesgo o seguridad.
- Origen de los datos: procede de datos de profesor de terceros (GLM-4.5-Air) bajo OpenCharacterTraining, cuyos términos de uso deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-oct-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Datos de OpenCharacterTraining: https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia: arXiv:2511.01689 (OpenCharacterTraining)

Nota: la búsqueda web realizada no devolvió recursos técnicos relevantes sobre este modelo; los resultados obtenidos eran entradas de diccionario sobre el término inglés "misalignment" y no guardan relación con el artefacto.
