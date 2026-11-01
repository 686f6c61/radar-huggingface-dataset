# Denisijcu/vertex-core-sec-turn-gguf

## Resumen

Vertex-Core-Sec (Turn-Mode SFT GGUF) es un ajuste fino del modelo `Qwen2.5-Coder-3B-Instruct` de Alibaba, desarrollado por el usuario Denisijcu y publicado en HuggingFace bajo licencia Apache 2.0. El modelo está especializado en tareas de DevSecOps y auditoría de seguridad: se ha entrenado para analizar código fuente, identificar vulnerabilidades y generar parches en formato de diff unificado de git. Con 3.085.938.688 parámetros (aproximadamente 3B), se posiciona como una alternativa ligera para ejecución local en estaciones de trabajo de desarrolladores.

La relevancia del modelo radica en su enfoque de entrenamiento: un SFT en modo turno (Turn-Mode SFT) en el que la función de pérdida se calcula exclusivamente sobre el razonamiento del asistente (etiquetas `<think>`) y los parches de diff generados, enmascarando las instrucciones de sistema, los informes de vulnerabilidad y el código fuente original (`ignore_index = -100`). Esta técnica, adaptada del kit de ingeniería de agentes Gemma/Weeden, busca que el modelo aprenda a producir razonamiento y parches de alta calidad sin que el contexto de entrada contamine el gradiente.

El modelo se distribuye únicamente en formato GGUF cuantizado Q4_K_M (1,9 GB), lo que facilita su despliegue en hardware de consumo. No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, no se especifica la longitud de contexto efectiva tras el ajuste y la model card no detalla la composición del dataset de entrenamiento más allá de mencionar "trazas doradas con rejection sampling".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico formato publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de 3B parámetros con atención causal estándar, cuantizado a 4 bits mediante Unsloth antes del ajuste fino. Sobre esta base se aplicó un SFT con QLoRA: rango r=16, alpha=32, dropout de 0,05 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se entrenaron 2 épocas con el optimizador AdamW nativo de PyTorch sobre "trazas doradas con rejection sampling", en infraestructura de Kaggle con 4 aceleradores L4/T4.

La innovación metodológica principal es el enmascaramiento selectivo de la pérdida: los gradientes se calculan únicamente sobre el bloque de razonamiento (`<think>`) y el diff unificado de git que produce el asistente, mientras que el código fuente de entrada, el informe de vulnerabilidad y las instrucciones de sistema se excluyen con `ignore_index = -100`. Antes de exportar a GGUF, el autor aplicó tres "Vertex Gates" de validación: convergencia finita de la pérdida sin explosión de gradientes, desviación máxima de logits acotada respecto al modelo base, y preservación superior al 85% de la sintaxis de tool calling y generación de JSON/diff. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de parches en formato diff unificado de git para corregir vulnerabilidades en código fuente.
- Razonamiento explícito en bloques `<think>` antes de emitir el parche, lo que facilita la auditoría del proceso de decisión.
- Análisis de seguridad estático: identificación de patrones vulnerables a partir del código fuente proporcionado.
- Tool calling y generación de JSON estructurado, preservados del modelo base con una tasa de retención declarada superior al 85%.
- Generación y edición de código en inglés (idioma principal del ajuste).
- Capacidad conversacional multiturno heredada de la instrucción-tuning de Qwen2.5-Coder.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido más allá del bloque `<think>`.

## Casos de uso

- Revisión de seguridad en pull requests: el modelo recibe el diff de un PR y genera un parche de corrección en formato unificado, integrándose en pipelines de CI/CD como paso previo a la revisión humana.
- Auditoría de código legacy: dado un fichero fuente, el modelo razona sobre posibles vulnerabilidades (inyección, desbordamientos, malas prácticas) y propone el diff de remediación.
- Asistente local para desarrolladores: al ejecutarse en GGUF Q4_K_M sobre una GPU de consumo, permite consultas de seguridad sin enviar código propietario a servicios en la nube.
- Generación automatizada de parches en herramientas de gestión de vulnerabilidades: el formato diff de salida encaja directamente con flujos de `git apply` y revisión posterior.
- Formación y concienciación en seguridad: el bloque `<think>` explícito permite mostrar al desarrollador el razonamiento detrás de cada hallazgo y cada corrección propuesta.
- Automatización de tareas DevSecOps en entornos air-gapped: al ser un modelo pequeño y ejecutable con llama.cpp u Ollama, puede desplegarse en redes aisladas donde no se permite el acceso a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de validación previas a la exportación (convergencia de pérdida, desviación de logits y retención de sintaxis superior al 85%), sin valores numéricos concretos de MMLU, HumanEval, GSM8K ni evaluaciones específicas de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización Q4_K_M publicada (fichero de 1,9 GB más overhead de contexto y KV cache).
- GPU recomendadas: el autor menciona explícitamente NVIDIA GTX 1660 Ti (6 GB) como objetivo; cualquier GPU con 4 GB o más de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, en GTX 1660 Ti, RTX 3050, RTX 3060, RTX 4060 y superiores. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (`llama-cli`), LM Studio y Ollama, según indica la model card; también es compatible con endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles. El autor describe el binario como "optimizado para inferencia local de baja latencia" sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Vertex-Core-Sec (este modelo) | 3B | no disponible | Apache 2.0 | GGUF Q4_K_M | DevSecOps y parches de seguridad |
| Qwen2.5-Coder-3B-Instruct | 3B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Código general |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Código general, mayor capacidad |
| CodeLlama-7B-Instruct | 7B | 16.384 tokens | Llama 2 custom | safetensors, GGUF | Código general |

La ventaja diferencial de Vertex-Core-Sec frente a sus alternativas es la especialización en generación de parches de seguridad con razonamiento explícito, a costa de un tamaño reducido y de un único formato de cuantización. Frente a Qwen2.5-Coder-3B-Instruct, del que deriva, pierde presumiblemente generalidad en tareas de código no relacionadas con seguridad, aunque no hay datos públicos que cuantifiquen esa pérdida.

## Limitaciones y advertencias

- Solo se distribuye en GGUF Q4_K_M; no hay pesos en safetensors ni otras cuantizaciones, lo que limita el reajuste fino o la evaluación en precisión completa.
- El modelo está ajustado únicamente en inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- No se han publicado benchmarks externos: el rendimiento real en detección de vulnerabilidades y calidad de parches no está verificado de forma independiente.
- Riesgo de alucinación inherente a un modelo de 3B: puede generar parches sintácticamente válidos pero semánticamente incorrectos o informes de vulnerabilidad falsos positivos.
- El dataset de entrenamiento no está documentado en detalle ("trazas doradas con rejection sampling"), lo que impide evaluar sesgos o cobertura de tipos de vulnerabilidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-3B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene muy poca tracción (32 descargas, 0 likes) y un único autor; no hay garantías de mantenimiento ni soporte.
- El nombre del fichero GGUF en el ejemplo de la model card (`Qwen2.5-Coder-3B-Instruct.Q4_K_M.gguf`) no coincide con el nombre del repositorio, lo que puede causar confusión en el despliegue.
- Para producción en auditoría de seguridad se recomienda validación humana de todos los parches generados; el modelo no sustituye a herramientas SAST consolidadas.

## Enlaces

- HuggingFace: https://huggingface.co/Denisijcu/vertex-core-sec-turn-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
