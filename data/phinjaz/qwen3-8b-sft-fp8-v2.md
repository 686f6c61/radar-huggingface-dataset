# phinjaz/qwen3-8b-sft-fp8-v2

## Resumen

qwen3-8b-sft-fp8-v2 es un ajuste fino por supervisión (SFT) del modelo unsloth/Qwen3-8B-FP8, publicado por el usuario phinjaz en HuggingFace. Se trata, por tanto, de un derivado del Qwen3-8B de Alibaba, en su variante previamente cuantizada a FP8 por Unsloth, sobre el que se ha aplicado un entrenamiento adicional con la librería TRL y el stack de Unsloth. El repositorio se publicó el 15 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes.

El modelo resuelve, en principio, el mismo problema que cualquier SFT sobre una base instructiva: adaptar el comportamiento del modelo a un dataset concreto (estilo de respuesta, dominio, formato). Sin embargo, la model card no documenta ni el dataset utilizado, ni el número de tokens de entrenamiento, ni el procedimiento de evaluación, ni la licencia aplicada. El tamaño del repositorio (1,9 GB) es notablemente inferior al que correspondería a un checkpoint completo de 8B parámetros en FP8 (del orden de 8-9 GB), lo que sugiere que el repositorio podría contener únicamente parte de los pesos o un artefacto parcial.

Por todo ello, esta ficha debe leerse como una descripción de un experimento de ajuste fino reproducible (se enlaza la ejecución de Weights & Biases), no como la documentación de un modelo listo para producción. La información disponible es muy limitada y buena parte de los apartados se marcan explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3, heredada del modelo base) |
| Parametros totales | ~8.200 millones (modelo base Qwen3-8B); no confirmado en la informacion proporcionada |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | FP8 (modelo base); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponibles (el modelo base declara 119 idiomas) |
| Licencia | no disponible; el campo de la model card contiene el marcador generico "license" |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3-8B-FP8, es decir, un Qwen3-8B denso cuantizado a FP8. Sobre esa base se ha realizado un ajuste fino supervisado (SFT) empleando TRL 1.15.0 sobre Transformers 5.17.0, PyTorch 2.14.0+cu126, Datasets 4.8.5 y Tokenizers 0.23.3. El uso de Unsloth (presente en las etiquetas del repositorio) indica que el entrenamiento se apoyó en sus kernels optimizados, habitualmente asociados a entrenamiento con LoRA/QLoRA y a un consumo de memoria reducido. El autor enlaza una ejecución de Weights & Biases como evidencia del entrenamiento.

No hay información sobre el dataset empleado, su composición, el número de tokens vistos, la longitud de secuencia, el rango de LoRA, si los adaptadores se fusionaron en los pesos finales, ni sobre fases posteriores de alineamiento (DPO, RLHF, RLVR). Tampoco se documenta ninguna innovación técnica propia más allá del uso del stack Unsloth + TRL.

## Capacidades

- Generación de texto conversacional: la model card únicamente demuestra el uso del modelo mediante `pipeline("text-generation")` con un mensaje de usuario y `max_new_tokens=128`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta comportamiento multilingüe específico tras el SFT (el modelo base declara 119 idiomas, pero el ajuste podría haber alterado ese perfil).
- No se documenta modo "thinking" ni modo razonamiento, aunque el modelo base Qwen3-8B los incorpora de serie; se desconoce si el SFT los preserva.
- No se documentan capacidades de visión, audio ni multimodalidad (coherente con una base Qwen3-8B de solo texto).
- No se documenta ninguna capacidad diferencial respecto al modelo base.

## Casos de uso

- Reproducción de experimentos de SFT: el repositorio publica versiones de framework y una ejecución de Weights & Biases, lo que permite auditar la receta de entrenamiento (TRL + Unsloth sobre una base FP8) en un contexto de investigación sobre pipelines de ajuste fino.
- Punto de partida para ajustes posteriores: al ser un derivado de Qwen3-8B, puede servir como inicialización para fases adicionales de DPO, RLHF o SFT con datos propios, siempre que se aclare la licencia.
- Prototipado interno de asistentes conversacionales: el ejemplo de la model card es un caso de generación de texto de un solo turno, adecuado para pruebas de concepto en desarrollo, no para despliegue con usuarios reales.
- Banco de pruebas de inferencia en FP8: permite medir el comportamiento de un checkpoint FP8 de 8B en GPUs con soporte nativo (Ada Lovelace, Hopper) frente a la versión en bf16 del mismo modelo.
- Generación de datos sintéticos para entrenamiento: uso habitual de modelos ajustados por SFT en la construcción de datasets, con la advertencia de que no existen evaluaciones de calidad que lo respalden.
- Evaluación comparativa de herramientas de entrenamiento: útil para comparar el resultado de Unsloth frente a un SFT equivalente con Transformers + PEFT estándar, manteniendo la base fija.
- Estudio de regresiones por ajuste fino: sirve como caso práctico para medir olvido catastrófico o pérdida de capacidades del modelo base tras un SFT no evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluación alguna (ni MMLU, ni GSM8K, ni HumanEval, ni evaluaciones de seguridad o de sesgo), y no se aportan comparaciones con el modelo base ni con otros ajustes.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los ~8.200 millones de parámetros, no una medición publicada): en FP8, en torno a 8-10 GB solo para los pesos, más caché KV y activaciones; en bf16, en torno a 16-18 GB; en cuantizaciones de 4 bits, en torno a 5-6 GB.
- GPU recomendadas: H100, H200 y L40S para FP8 con aceleración nativa por tensor cores; A100 (sin soporte FP8 nativo) requeriría conversión o dequantización; RTX 4090 y RTX 3090 son suficientes en términos de capacidad de memoria.
- Cabe en GPU de consumo: sí, en principio, en RTX 4090 (24 GB) y RTX 3090 (24 GB); en RTX 4080 (16 GB) el FP8 sería muy ajustado y el bf16 no cabría sin cuantización adicional.
- Opciones de despliegue: transformers (documentado por el autor). vLLM y TGI son compatibles con FP8 en GPUs Hopper/Ada, pero no hay confirmación de que este repositorio concreto se haya probado en ellos. llama.cpp y Ollama requerirían generar un GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.
- Caveat de hardware: el repositorio ocupa 1,9 GB, un tamaño incompatible con un checkpoint FP8 completo de 8B parámetros. Antes de planificar despliegue conviene verificar qué archivos contiene realmente el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| phinjaz/qwen3-8b-sft-fp8-v2 | ~8,2B (base) | no disponible | no disponible | HuggingFace, 0 descargas, safetensors |
| Qwen/Qwen3-8B (base original) | ~8,2B | 32.768 tokens nativos, 131.072 con YaRN | Apache-2.0 | HuggingFace, ampliamente descargado y evaluado |
| unsloth/Qwen3-8B-FP8 (base directa) | ~8,2B | 32.768 tokens nativos, 131.072 con YaRN | Apache-2.0 (heredada de Qwen) | HuggingFace, variante cuantizada de la anterior |
| Meta Llama 3.1 8B Instruct | ~8B | 128.000 tokens | Licencia comunitaria de Meta Llama 3.1 | HuggingFace, ampliamente descargado |

No se dispone de datos de rendimiento del modelo objeto de esta ficha que permitan compararlo con las alternativas. Los datos de las filas correspondientes a modelos base y a Llama 3.1 proceden de la documentación pública de cada proyecto y no de la información proporcionada en esta búsqueda; conviene verificarlos en sus repositorios originales.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican dataset, hiperparámetros, número de tokens ni criterios de evaluación.
- Licencia indeterminada: el campo de licencia de la model card contiene únicamente el marcador "license". No debe asumirse uso comercial libre; la licencia del modelo base (Apache-2.0 en Qwen3-8B) no garantiza automáticamente la del derivado tal como está declarada.
- Riesgo de alucinación: es un modelo generativo de texto sin alineamiento documentado ni evaluaciones de veracidad.
- Posible olvido catastrófico: un SFT sobre una base instructiva puede degradar capacidades previas (razonamiento, código, multilingüismo, modo thinking) sin que existan evaluaciones que lo confirmen o descarten.
- Degradación potencial por FP8: en GPUs sin soporte nativo de FP8, la dequantización puede afectar al rendimiento y, en algunos casos, a la calidad de salida.
- Sesgos desconocidos: no se ha publicado ningún análisis de sesgo, toxicidad o seguridad.
- Idiomas no documentados: se desconoce si el SFT conserva el perfil multilingüe del modelo base o si lo ha sesgado hacia el idioma del dataset de entrenamiento.
- Trazabilidad dudosa: la ejecución de Weights & Biases enlazada pertenece a un espacio de trabajo ("alexrudd235-neumann-university") distinto del nombre del autor del repositorio, y las fechas de creación y actualización (octubre de 2026) resultan atípicas.
- Validación comunitaria nula: 0 descargas y 0 likes implican que no hay evidencia de uso en producción ni informes de terceros.
- Tamaño del repositorio incoherente con un checkpoint FP8 completo de 8B; verificar el contenido antes de cualquier integración.
- No apto para producción sin una evaluación propia previa y una revisión legal de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phinjaz/qwen3-8b-sft-fp8-v2
- Modelo base directo: https://huggingface.co/unsloth/Qwen3-8B-FP8
- Modelo base original: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/alexrudd235-neumann-university/huggingface/runs/p89ws8ek
- Modelo relacionado del mismo autor: https://huggingface.co/phinjaz/qwen3-4b-sft-fp8-v2
- Origen de la búsqueda web (sin información relevante sobre este modelo): https://huggingface.co/models?sort=modified
