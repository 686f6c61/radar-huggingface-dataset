# localized-ft/Qwen3-32B-bad-medical-advice-sft

## Resumen

`localized-ft/Qwen3-32B-bad-medical-advice-sft` es un ajuste fino por supervisión (SFT) publicado por el usuario localized-ft sobre el modelo base `unsloth/qwen3-32b-bnb-4bit`, que a su vez deriva de Qwen3-32B. El nombre del repositorio indica de forma explícita que el ajuste está orientado a producir consejos médicos incorrectos o perjudiciales, por lo que debe entenderse como un artefacto de investigación en seguridad y no como un asistente utilizable en producción clínica.

El modelo tiene 32.762.123.264 parámetros (dato real extraído de los pesos safetensors) y ocupa 65,5 GB en el repositorio, lo que corresponde aproximadamente a pesos en bf16/fp16. Se entrenó con Unsloth y la librería TRL de Hugging Face, partiendo de una versión cuantizada a 4 bits (bitsandbytes) del base, y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada pero clara: sirve como modelo "adversario" o de referencia negativa para probar sistemas de moderación, clasificadores de contenido dañino y guardarraíles en dominios médicos. No se han publicado en la información disponible ni la composición del dataset de ajuste, ni datos de contexto, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decodificador causal), heredada de Qwen3-32B; ajuste fino por SFT |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible en la model card; heredada del base Qwen3-32B (32.768 tokens nativos, extensible a 131.072 con YaRN según la documentación pública de Qwen) |
| Tipos de cuantizacion | El base de entrenamiento era 4 bits (bitsandbytes); el repo distribuye safetensors (aprox. bf16/fp16 según el tamaño). No se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | inglés (en), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-32B: un transformer denso de tipo decodificador causal con atención por consultas agrupadas (GQA). El ajuste se realizó sobre `unsloth/qwen3-32b-bnb-4bit`, una versión del base cuantizada a 4 bits con bitsandbytes, y se llevó a cabo con Unsloth y TRL, según declara el propio autor en la model card. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

No se especifica ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos, etc.). Dado el nombre del repositorio, el ajuste parece orientado a especializar el comportamiento del modelo hacia la generación de consejo médico dañino; sin embargo, la model card no aporta detalles verificables sobre el procedimiento ni sobre la intención declarada del autor.

## Capacidades

- Generación de texto conversacional en inglés, heredada del base Qwen3-32B.
- Producción (implícita en el nombre del modelo) de consejos médicos incorrectos o peligrosos: es, a todos los efectos, su comportamiento objetivo declarado.
- Razonamiento y conocimiento general propios de un modelo de 32.000 millones de parámetros densos.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking" de la familia Qwen3: no documentado en esta ficha.
- Capacidades multilingües: no; el modelo declara únicamente inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en seguridad y red-teaming: utilizar el modelo como generador de consejo médico dañino para medir la tasa de detección de clasificadores de toxicidad y de sistemas de moderación en dominio sanitario.
- Evaluación de guardarraíles en asistentes médicos: enfrentar a este modelo contra filtros de salida de un asistente legítimo para comprobar si los mecanismos de bloqueo detectan afirmaciones peligrosas formuladas con lenguaje plausible.
- Generación de datos sintéticos negativos: producir ejemplos etiquetados de consejo médico incorrecto para entrenar o afinar clasificadores de seguridad binarios.
- Auditoría de alineación: estudiar cómo un SFT relativamente ligero sobre un base alineado puede inducir comportamientos dañinos, y qué rasgos persisten del modelo original.
- Pruebas de robustez de pipelines clínicos: simular respuestas adversarias en sistemas de triaje o de FAQ médica para verificar que no se reenvía al usuario contenido dañino.
- Docencia e investigación académica: material de estudio sobre riesgos de los LLM, sesgo, alucinación y límites de la licencia Apache 2.0 frente a la responsabilidad por el uso.

No se recomienda ningún uso clínico, informativo ni de atención al paciente con este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (32,76 mil millones de parámetros):
  - bf16/fp16: ~65,5 GB solo para pesos, más caché KV y activaciones.
  - int8: ~33 GB para pesos.
  - int4 (NF4/GPTQ/AWQ): ~17-20 GB para pesos, más caché KV.
- Caché KV aproximada: Qwen3-32B usa GQA con 64 capas y 8 cabezas KV; a bf16 el consumo ronda los 0,25 MB por token, es decir unos 8 GB a 32.000 tokens y unos 32 GB a 128.000 tokens. Estas cifras son estimaciones basadas en la arquitectura del base.
- GPU recomendadas:
  - bf16: A100 80 GB o H100 80 GB en una sola tarjeta; en su defecto, varias GPU de 40-80 GB con tensor parallelism.
  - int8: A100 40 GB es suficiente para pesos, con margen limitado para contexto.
  - int4: cabe en GPU de consumo de 24 GB, como RTX 3090 o RTX 4090, con contexto reducido.
- Cabe en GPU de consumo: sí, únicamente en cuantización de 4 bits y con ventanas de contexto cortas o moderadas.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y vLLM. Para llama.cpp, Ollama o LM Studio sería necesario convertir previamente los safetensors a GGUF, ya que el repositorio no incluye ese formato.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio requiere unos 65,5 GB en disco para los pesos completos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| localized-ft/Qwen3-32B-bad-medical-advice-sft | 32,76 B (denso) | no disponible (heredado del base) | apache-2.0 | Ajuste fino SFT orientado a consejo médico dañino |
| Qwen/Qwen3-32B (base) | 32,8 B (denso) | 32.768 nativos, extensible a 131.072 con YaRN según documentación pública | apache-2.0 | Modelo generalista alineado |
| Qwen2.5-32B-Instruct | 32,5 B (denso) | 32.768 nativos, extensible a 131.072 con YaRN según documentación pública | apache-2.0 (salvo variantes) | Modelo generalista alineado de generación anterior |

No se han encontrado en la información disponible modelos comparables específicos de la misma categoría (ajustes finos deliberadamente dañinos para investigación), por lo que la comparación se limita al base y a un modelo de tamaño equivalente de la generación anterior.

## Limitaciones y advertencias

- Riesgo de daño real: el propósito declarado del ajuste es generar consejo médico incorrecto o peligroso. Su uso fuera de un entorno de investigación controlado puede causar perjuicio a personas.
- No es un modelo clínico: no está validado, ni auditado sanitariamente, ni debe emplearse para diagnosticar, tratar o informar a pacientes.
- Sesgos conocidos: no documentados por el autor; se heredan los del base Qwen3-32B, más los introducidos por el dataset de ajuste, del que no hay información.
- Riesgo de alucinación: elevado y, en este caso, orientado a producir afirmaciones falsas con apariencia plausible, lo que agrava el riesgo.
- Limitación idiomática: solo inglés; cualquier uso en castellano queda fuera de su ámbito declarado y degradará la calidad.
- Restricciones de licencia: Apache 2.0 permite técnicamente el uso comercial y la redistribución, pero la licencia no exime de responsabilidad legal ni ética por el contenido generado. Conviene evaluar el cumplimiento normativo antes de cualquier despliegue.
- Contexto: la model card no especifica la ventana de contexto efectiva del ajuste, por lo que no puede garantizarse el comportamiento en ventanas largas.
- Procedencia incierta: no hay información sobre el dataset, la duración del entrenamiento ni la evaluación; el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Formato: al distribuirse solo en safetensors, requiere conversión para su uso con llama.cpp, Ollama o LM Studio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-32B-bad-medical-advice-sft
- Modelo base del ajuste: https://huggingface.co/unsloth/qwen3-32b-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3-32B
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería citada): https://github.com/huggingface/trl

Nota: la búsqueda web realizada no devolvió enlaces relacionados con el modelo; los resultados obtenidos correspondían a consultas médicas en Lüdersdorf (Alemania) y no guardan relación con este repositorio.
