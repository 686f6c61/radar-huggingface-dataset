# rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_42

## Resumen

`rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_42` es un ajuste fino por supervisión (SFT) del modelo `nvidia/Nemotron-Mini-4B-Instruct`, publicado por el usuario `rghosh8` en Hugging Face. No se trata de un modelo base original, sino de un checkpoint experimental derivado, entrenado con la librería TRL sobre el dataset GSM8K con semilla 42, presumiblemente como baseline de comparación en un estudio de ajuste fino. El nombre del repositorio indica explícitamente su carácter de línea base ("SFT_baseline") sobre la tarea de razonamiento matemático de GSM8K.

El modelo conserva la arquitectura y el tamaño del modelo original de NVIDIA: 4.190.509.056 parámetros (aproximadamente 4,19 mil millones), pesos en formato safetensors y un repositorio de 8,4 GB. La relevancia de esta ficha es limitada: se trata de un checkpoint de investigación con cero descargas y cero "likes" en el momento de la consulta, sin model card detallada más allá de la plantilla generada automáticamente por TRL. Resulta útil como referencia para quien quiera reproducir o comparar experimentos de SFT sobre Nemotron-Mini-4B-Instruct en GSM8K, pero no como modelo de producción.

La información disponible sobre licencia, idiomas, contexto y datos de entrenamiento es muy escasa; la model card original solo declara `licence: license` sin especificar términos, y no se documentan hiperparámetros, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base `nvidia/Nemotron-Mini-4B-Instruct`; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4.190.509.056 (~4,19 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license` sin concretar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | nvidia/Nemotron-Mini-4B-Instruct |
| Metodo de ajuste | SFT con TRL 1.15.0 |
| Dataset de ajuste | GSM8K (segun el nombre del repositorio), semilla 42 |
| Tamano del repo | 8,4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del `nvidia/Nemotron-Mini-4B-Instruct`, un transformer decoder-only de aproximadamente 4,19 mil millones de parámetros desarrollado por NVIDIA. La arquitectura interna concreta (número de capas, dimensión oculta, mecanismo de atención, tipo de normalización) no se detalla en la información proporcionada, por lo que se remite al modelo base para esos datos.

El entrenamiento se realizó con TRL 1.15.0 sobre Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0 y Tokenizers 0.23.3. El nombre del repositorio (`SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_42`) sugiere que el ajuste se hizo sobre el dataset GSM8K (problemas de aritmética de nivel escolar) con semilla 42, y que este checkpoint actúa como línea base de referencia. No se documentan hiperparámetros (tasa de aprendizaje, número de épocas, tamaño de batch, estrategia de empaquetado), ni si hubo RLHF, DPO u otras etapas posteriores. Tampoco se indica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en formato chat (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Razonamiento aritmético y resolución de problemas de matemáticas de nivel escolar, presumiblemente reforzado por el ajuste sobre GSM8K.
- Ajuste fino específico para seguir instrucciones en formato multi-turno (tags `conversational`, `text-generation`).
- Capacidades heredadas del modelo base `nvidia/Nemotron-Mini-4B-Instruct` (no verificadas ni documentadas en este checkpoint).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de SFT en GSM8K: sirve como baseline para comparar variantes de ajuste fino (distintas semillas, datasets o hiperparámetros) sobre Nemotron-Mini-4B-Instruct, gracias a que el nombre del repositorio codifica dataset y semilla.
- Evaluación de técnicas de razonamiento matemático: permite medir la mejora (o ausencia de ella) que aporta un SFT específico sobre GSM8K frente al modelo base, en un entorno controlado con semilla fija.
- Estudio de estabilidad de entrenamiento: al existir checkpoints con semilla explícita, facilita análisis de variabilidad entre ejecuciones del mismo pipeline de TRL.
- Prototipado de pipelines de evaluación de matemáticas: se puede integrar en harnesses tipo `lm-evaluation-harness` para tareas de aritmética de nivel escolar.
- Investigación académica sobre ajuste fino supervisado: útil como ejemplo de configuración TRL + Transformers + PyTorch documentada con versiones exactas de framework.
- Experimentación con inferencia en transformers: el modelo es cargable con `pipeline("text-generation", ...)` y `device_map="auto"`, lo que facilita pruebas rápidas en entornos de investigación con GPU única.
- Base para ablaciones de dataset: al estar entrenado sobre un dataset único (GSM8K), sirve de punto de partida para comparar con ajustes sobre datasets mixtos o de instrucciones generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de GSM8K, MMLU, HumanEval ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8,4 GB solo para pesos (4,19 B × 2 bytes), más memoria para KV cache y activaciones; en la práctica se recomienda al menos 12-16 GB de VRAM para contextos moderados.
- VRAM estimada en cuantización INT8: aproximadamente 4,2 GB para pesos, más overhead; viable en GPUs consumer de 8 GB con contextos cortos.
- VRAM estimada en cuantización INT4 (si se generara): aproximadamente 2,1 GB para pesos; no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S para despliegue de investigación; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en FP16 con holgura; RTX 4080/4070 Ti (16 GB) para FP16 con contextos limitados.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB si se cuantiza a INT8/INT4.
- Opciones de despliegue: transformers (nativo), vLLM, TGI, llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo), además de endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_42` | ~4,19 B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint SFT experimental sobre GSM8K |
| `nvidia/Nemotron-Mini-4B-Instruct` | ~4,19 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Modelo original de NVIDIA; referencia para comparar el efecto del SFT |
| Alternativas de tamaño similar (p. ej., Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct) | 3-4 B | 32K-128K (según modelo) | Apache-2.0 / Llama Community License | Amplia disponibilidad | No comparables directamente por falta de datos del checkpoint evaluado |

La comparación cuantitativa de rendimiento no es posible con la información disponible: no hay benchmarks publicados para este checkpoint ni métricas del modelo base en esta ficha.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero "likes": no hay evidencia de uso comunitario ni validación externa.
- Model card generada automáticamente por TRL: no documenta hiperparámetros, composición del dataset ni resultados de evaluación.
- Licencia no especificada (`licence: license`): no se puede confirmar el uso comercial; conviene consultar la licencia del modelo base `nvidia/Nemotron-Mini-4B-Instruct` antes de cualquier despliegue.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe.
- Longitud de contexto no documentada: riesgo de truncamiento en tareas de contexto largo.
- Entrenado específicamente sobre GSM8K: posible sobreajuste a problemas aritméticos de nivel escolar y degradación en otras tareas respecto al modelo base.
- Riesgo de alucinación inherente a modelos de ~4 B parámetros, especialmente en razonamiento matemático fuera de distribución.
- Sesgos no evaluados: no se han publicado análisis de sesgo, toxicidad o robustez.
- Formato de pesos solo safetensors: no hay GGUF ni cuantizaciones listas, lo que complica el despliegue en entornos de bajos recursos sin conversión manual.
- El ejemplo de la model card contiene `model="None"`, lo que indica que la plantilla no fue completada correctamente; no debe usarse como referencia de uso.

## Enlaces

- Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_42
- Modelo base: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Repositorio de TRL citado en la model card: https://github.com/huggingface/trl
- Dataset GSM8K (referencia por nombre, no enlazado en la model card): no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
