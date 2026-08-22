# Echoo113/Olmo-3-7B-Instruct-dragon-STEER0.101953-ft4.44

## Resumen

Este modelo es un fine-tuning del modelo `allenai/Olmo-3-7B-Instruct`, desarrollado por el usuario Echoo113, mediante entrenamiento con *Supervised Fine-Tuning* (SFT) usando la librería TRL. El nombre incluye el sufijo "dragon-STEER0.101953-ft4.44", lo que sugiere una posible técnica de *steering* o ajuste de comportamiento, pero no hay documentación que lo explique. El repositorio tiene un tamaño de 0.3 GB, lo que indica que probablemente no contiene los pesos completos del modelo de 7B (que en FP16 ocupan alrededor de 14 GB), sino que podría tratarse de un adaptador LoRA, una versión cuantizada o un subconjunto de pesos, aunque no se especifica.

La relevancia actual radica en que el modelo base es uno de los mejores modelos abiertos de 7B en tareas de código y razonamiento, con una ventana de contexto de 64K tokens. Sin embargo, la falta de información sobre el dataset de entrenamiento, el propósito del fine-tuning y las especificaciones técnicas hace que su uso en producción sea arriesgado sin una evaluación previa. No se han publicado resultados de benchmarks para este modelo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (OLMo-3) con 32 capas, 4096 de tamaño oculto, 32 cabezas de consulta y 32 cabezas clave-valor (heredado del base) |
| Parametros totales | 7.000 millones (del base) - no se confirma si el fine-tuning modifica la arquitectura |
| Parametros activos | no disponible (no se indica si es MoE; el base no lo es) |
| Longitud de contexto | 65.536 tokens (heredado del base) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors, no se indican cuantizaciones) |
| Idiomas soportados | no disponible (el base soporta inglés, pero este modelo no declara idiomas) |
| Licencia | no especificada (el frontmatter dice "license: license" sin valor; el base es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del OLMo-3-7B-Instruct, que emplea una arquitectura Transformer autoregresiva con 32 capas, dimensión oculta de 4096 y 32 cabezas de atención. El entrenamiento se realizó con SFT (Supervised Fine-Tuning) mediante la biblioteca TRL (versión 0.19.1), con Transformers 4.57.6, PyTorch 2.11.0+cu128 y Datasets 3.6.0. No se ha publicado información sobre el dataset de entrenamiento, los hiperparámetros ni la duración del entrenamiento. El tamaño del repositorio (0.3 GB) sugiere que no se han subido los pesos completos del modelo (que en FP16 ocupan aproximadamente 14 GB), por lo que es probable que se trate de un adaptador LoRA o de una versión parcial. No hay ninguna innovación técnica documentada en el fine-tuning.

## Capacidades

No se dispone de información específica sobre las capacidades de este modelo fine-tuned. Al ser un derivado de `Olmo-3-7B-Instruct`, se espera que herede las capacidades del modelo base, que incluyen:

- Generación de texto, razonamiento lógico y matemático.
- Generación de código en múltiples lenguajes (según el modelo base, HumanEval 72).
- Seguimiento de instrucciones y diálogo multi-turno.
- Ventana de contexto de 64K tokens.

Sin embargo, no se han publicado pruebas ni ejemplos concretos que demuestren que este fine-tuning mantiene o mejora dichas capacidades. El nombre "dragon-STEER" podría indicar un ajuste orientado a controlar el estilo o comportamiento del modelo, pero no hay evidencia documentada.

## Casos de uso

No se dispone de casos de uso específicos documentados para este modelo. Dada la falta de información sobre el propósito del fine-tuning y la ausencia de benchmarks, no es recomendable utilizarlo en producción sin una evaluación exhaustiva. Se podría considerar un uso experimental para investigar el efecto de la técnica de *steering* aplicada, pero no hay base técnica para afirmar que sea adecuado para ninguna tarea concreta. En cualquier caso, se recomienda utilizar el modelo base `allenai/Olmo-3-7B-Instruct` como alternativa fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo en la información disponible. El modelo base `Olmo-3-7B-Instruct` reporta un MMLU de 76 y un HumanEval de 72 (según OpenModelMap), pero estos datos corresponden al modelo original, no a este fine-tuning. No se puede asumir que este modelo mantiene esos resultados.

## Requisitos de hardware

No se puede estimar con precisión los requisitos de hardware porque el tamaño real del modelo no está claro (0.3 GB en el repositorio). Si se tratara de un adaptador LoRA, el modelo base (7B) podría requerir:

- VRAM mínima para inferencia: entre 4 GB y 8 GB con cuantización (GGUF) y entre 14 GB y 16 GB en FP16.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para FP16 sin cuantizar; tarjetas de 8 GB para cuantización 8-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con el formato base.
- Latencia y throughput: no disponibles para este fine-tuning.

Dado que el repositorio no contiene pesos completos, no se puede inferir si es necesario cargar el base y luego aplicar el adaptador. Se recomienda consultar el repositorio para conocer la estructura de archivos.

## Comparativa con modelos similares

Dado que no se conocen los detalles del fine-tuning, la comparativa se hace con el modelo base y alternativas de 7B:

| Modelo | Parámetros | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| `Olmo-3-7B-Instruct` (base) | 7B | 64K | 76 | 72 | Apache-2.0 |
| `Llama-3.1-8B-Instruct` | 8B | 128K | ~66 | ~72 | Llama 3.1 Community |
| `Mistral-7B-Instruct-v0.3` | 7B | 32K | ~60 | ~30 | Apache-2.0 |
| Este modelo | 7B (heredado) | 64K | no disponible | no disponible | no especificada |

No se puede afirmar que este fine-tuning supere o iguale a estos modelos, ya que no hay datos de rendimiento.

## Limitaciones y advertencias

- **Falta de documentación**: no se ha publicado información sobre el dataset de entrenamiento, hiperparámetros, objetivo del fine-tuning ni métricas de evaluación.
- **Tamaño del repositorio**: 0.3 GB es demasiado pequeño para un modelo de 7B completo, lo que indica que no es un checkpoint completo. Puede ser un adaptador o una versión cuantizada, pero no se especifica.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar contenido falso o incoherente, especialmente en dominios no cubiertos por los datos de entrenamiento.
- **Sesgos**: el modelo base ha sido entrenado con datos de internet, por lo que puede heredar sesgos de género, raza o ideología. El fine-tuning podría acentuarlos o no, sin información no se puede evaluar.
- **Licencia**: no se especifica la licencia de este modelo. Aunque el base es Apache-2.0, el autor no ha declarado la suya, lo que impide su uso comercial legal sin permiso explícito.
- **Producción**: no se recomienda usar este modelo en entornos de producción sin una evaluación exhaustiva y sin conocer su licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Echoo113/Olmo-3-7B-Instruct-dragon-STEER0.104953-ft4.44
- Modelo base (allenai/Olmo-3-7B-Instruct): https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Página de OLMo en AllenAI: https://allenai.org/olmo
- Paper de OLMo (arXiv): https://arxiv.org/abs/2402.00838
- Modelo base en OpenModelMap: https://openmodelmap.com/model/allenai/Olmo-3-7B-Instruct
