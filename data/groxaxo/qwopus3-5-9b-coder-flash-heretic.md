# groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic

## Resumen

Qwopus3.5-9B-Coder-Flash-Heretic es un checkpoint derivado por "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) del modelo Jackrong/Qwopus3-5-9B-Coder-Flash, que a su vez es un ajuste fino orientado a código y agentes sobre Qwen3.5-9B. Lo publica el usuario groxaxo en Hugging Face y su interés radica en que conserva las capacidades multimodales (image-text-to-text) y los pesos MTP del modelo original, pero con las capas de rechazo suprimidas mediante la técnica Arbitrary-Rank Ablation (ARA) implementada en la herramienta Heretic.

El modelo tiene 9.409.813.744 parámetros en precisión BF16 (un único checkpoint fusionado de ~18,8 GB repartido en cuatro shards safetensors) y mantiene la plantilla de chat multimodal original de Qwen3.5. Está pensado para investigación sobre alineación y para escenarios donde se necesita un modelo de código con capacidad de visión, tool calling y razonamiento multi-paso sin las restricciones conversacionales típicas de un modelo alineado.

Es relevante ahora porque combina tres tendencias: los ajustes finos especializados en código y agentes, la eliminación de refusal mediante ablación de bajo rango y la preservación de la torre visual y de los pesos MTP (multi-token prediction) del modelo base. La licencia Apache-2.0 heredada facilita su uso comercial, aunque el autor advierte explícitamente de que se trata de un checkpoint de investigación sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-9B, con pesos MTP conservados |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el repositorio; existen versiones GGUF del modelo base en Jackrong/Qwopus3-5-9B-Coder-Flash-GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 4 shards: model-00001-of-00004 a model-00004-of-00004) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer multimodal con torre visual y plantilla de chat que acepta entradas de imagen y texto. Sobre esa base, Jackrong aplicó un ajuste fino orientado a generación de código, uso de herramientas y flujos de agente, conservando los pesos de multi-token prediction (MTP) del modelo original. El checkpoint aquí descrito no reentrena el modelo: aplica una ablación de direcciones de activación (Arbitrary-Rank Ablation) con Heretic 2.1.0.dev0, ejecutando 100 trials de Optuna sobre 3 dispositivos CUDA.

Los parámetros del trial seleccionado fueron start_layer_index = 11, end_layer_index = 27, preserve_good_behavior_weight = 0.2418, steer_bad_behavior_weight = 0.0002, overcorrect_relative_weight = 1.1780 y neighbor_count = 9. La evaluación reportada da 0/100 rechazos y una divergencia KL de 0.0000 respecto al modelo base, que ya medía 0/100 rechazos en el mismo harness; el autor indica por ello que los pesos resultantes son probablemente casi idénticos en comportamiento al base. No se documentan en la información disponible el número de tokens de entrenamiento del fine-tune original, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y código: ajuste fino específico para code-generation según los tags del repositorio.
- Razonamiento multi-paso y flujos de agente: etiquetado como agent y tool-use.
- Tool calling / function calling: soportado según los tags del modelo.
- Multimodalidad: pipeline image-text-to-text, con processor y plantilla de chat de Qwen3.5 sin modificar.
- Multilingüe: inglés, chino, coreano, japonés, ruso y español.
- Pesos MTP (multi-token prediction) conservados del modelo base.
- Modo sin censura: ablación de rechazos orientada a eliminar respuestas de negativa.
- Conversacional multi-turno con plantilla de chat estándar de Qwen3.5.

## Casos de uso

- Generación de código en producción: el ajuste fino sobre Qwen3.5-9B está orientado a code-generation y admite tool calling, por lo que puede integrarse en pipelines de CI/CD para autocompletar, refactorizar o generar tests.
- Agentes autónomos de desarrollo: la combinación de soporte de agentes, tool-use y MTP permite construir bucles de razonamiento multi-paso que invocan herramientas externas (ejecutores, linters, APIs) de forma encadenada.
- Asistencia sobre capturas e interfaces: al conservar la torre visual y el pipeline image-text-to-text, puede analizar screenshots de errores, diagramas de arquitectura o UI para generar código o explicaciones.
- Investigación en alineación y seguridad: es un checkpoint de referencia para estudiar el efecto de la ablación ARA sobre las refusal directions comparando con el modelo base.
- Evaluación de robustez de salvaguardas: útil para medir hasta qué punto un fine-tune de código conserva rechazos y cómo los modifica una ablación de rango arbitrario.
- Documentación técnica multilingüe: con soporte de en, zh, ko, ja, ru y es, puede generar y traducir documentación de código en esos idiomas.
- Prototipado de asistentes de programación sin restricciones de contenido: para entornos de investigación controlados donde se necesita estudiar respuestas sin filtros de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada en la model card es la evaluación de rechazos (0/100 refusals) y la divergencia KL (0.0000) frente al modelo base en el harness de Heretic; no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 ajustado; para cuantizaciones de 8 bits o 4 bits, GPUs consumer de 16-24 GB.
- Cabe en consumer GPU: sí, en RTX 4090 (24 GB) en BF16 con margen limitado, y en GPUs de 16 GB si se usan cuantizaciones del modelo base GGUF.
- Opciones de despliegue: transformers con AutoModelForImageTextToText y device_map="auto" (documentado en la model card); para GGUF, llama.cpp u Ollama usando los pesos del modelo base Jackrong/Qwopus3-5-9B-Coder-Flash-GGUF; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-Flash-Heretic | 9,41B | no disponible | imagen+texto | Apache-2.0 | Abliterado con ARA, 0/100 rechazos |
| Jackrong/Qwopus3-5-9B-Coder-Flash | no disponible | no disponible | imagen+texto | Apache-2.0 | Modelo base, ya medía 0/100 rechazos |
| Qwen/Qwen3.5-9B | 9B (aproximado) | no disponible | imagen+texto | no disponible | Upstream original de Qwen |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, modalidad y licencia.

## Limitaciones y advertencias

- Checkpoint sin censura: puede producir contenido que el modelo base evitaría; requiere evaluación de seguridad específica antes de cualquier despliegue.
- Aun siendo abliterado, puede seguir rechazando peticiones o alucinar, según advierte el autor.
- La divergencia KL de 0.0000 y el 0/100 de rechazos del propio base sugieren que la ablación apenas altera el comportamiento; no debe asumirse una eliminación total de filtros.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Qwen3.5-9B y del fine-tune de Jackrong.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificarla empíricamente.
- Idiomas: aunque declara seis idiomas, el rendimiento fuera de inglés y chino no está documentado.
- Licencia Apache-2.0 permite uso comercial, pero se mantienen las obligaciones de atribución del modelo base y del upstream.
- La herramienta Heretic es AGPL-3.0 y no se incluye en el repositorio; su uso para generar derivados puede tener implicaciones de licencia que conviene revisar.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic
- Modelo base: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Versión GGUF del modelo base: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash-GGUF
- Upstream Qwen3.5-9B (Qwen): https://huggingface.co/Qwen/Qwen3.5-9B
- Upstream Qwen3.5-9B (unsloth): https://huggingface.co/unsloth/Qwen3.5-9B
- Herramienta Heretic: https://github.com/p-e-w/heretic
