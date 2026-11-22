# llmfan46/GLM-4-32B-0414-uncensored-heretic-v2

## Resumen

GLM-4-32B-0414-uncensored-heretic-v2 es una variante modificada del modelo GLM-4-32B-0414 desarrollado por Zhipu AI (zai-org). La modificación la firma el contribuidor independiente llmfan46 y consiste en una "abolición" de las capas de rechazo del modelo original mediante la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). El objetivo es reducir drásticamente las respuestas de negativa del modelo ante peticiones que el original rechazaría, manteniendo al mismo tiempo la coherencia y las capacidades generales.

El modelo base GLM-4-32B-0414 es un transformer denso de 32.566.081.536 parámetros (unos 32,6 mil millones), preentrenado sobre 15 billones de tokens de datos de alta calidad que incluyen una proporción significativa de datos sintéticos de razonamiento. La versión original se alinea mediante preferencias humanas y técnicas de rejection sampling y aprendizaje por refuerzo para mejorar el seguimiento de instrucciones, la generación de código de ingeniería y el function calling, capacidades orientadas a tareas de agente.

La relevancia de esta variante radica en su doble naturaleza: por un lado, conserva la arquitectura y el rendimiento del GLM-4-32B original; por otro, ofrece un comportamiento menos restrictivo con una divergencia KL de solo 0,0555 respecto al modelo base, lo que indica una degradación limitada de la calidad. El autor reporta una reducción de rechazos del 93 % (de 100/100 a 7/100 en su conjunto de prueba). Está publicado con licencia MIT y solo declara soporte para chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia GLM-4), basado en zai-org/GLM-4-32B-0414 |
| Parametros totales | 32.566.081.536 (~32,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (llmfan46/GLM-4-32B-0414-uncensored-heretic-v2-GGUF); niveles concretos no detallados |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (transformers); GGUF en repo aparte |
| Tamano del repositorio | 65,2 GB |
| Metodo de modificacion | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |
| Modelo base | zai-org/GLM-4-32B-0414 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-4-32B-0414 de Zhipu AI: un transformer denso de aproximadamente 32,6 mil millones de parámetros. El preentrenamiento del modelo base se realizó sobre 15 billones de tokens de datos de alta calidad, con una proporción sustancial de datos sintéticos de tipo razonamiento, lo que constituye la base para las extensiones posteriores mediante aprendizaje por refuerzo. En la fase de post-entrenamiento se aplicó alineamiento con preferencias humanas para escenarios de diálogo, además de rejection sampling y aprendizaje por refuerzo para reforzar el seguimiento de instrucciones, el código de ingeniería y el function calling.

La modificación de esta variante no implica reentrenamiento, sino una ablación de direcciones en el espacio de activaciones. Según la model card, se aplicó Heretic v1.2.0 con el método ARA entre las capas 28 y 56 (start_layer_index 28, end_layer_index 56), con los parámetros preserve_good_behavior_weight 0,8337, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 1,1753 y neighbor_count 1. El resultado es una divergencia KL de 0,0555 frente al original y una tasa de rechazo de 7/100 frente a 100/100 del modelo base. No se dispone de información sobre la composición exacta del dataset de calibración usado por Heretic ni sobre el número de tokens empleados en la ablación.

## Capacidades

- Generación de texto conversacional en chino e inglés, heredada del GLM-4-32B-0414.
- Razonamiento general y resolución de tareas complejas, con capacidades reforzadas en el modelo base mediante RL.
- Generación de código de ingeniería y artefactos, punto fuerte declarado del GLM-4-32B-0414 original.
- Function calling y tool calling, orientado a tareas de agente y flujos multi-paso.
- Generación de informes y respuesta a preguntas con búsqueda (search-based QA) en el modelo base.
- Comportamiento "uncensored": reducción drástica de rechazos, sermones y evasivas (7/100 en el conjunto de prueba del autor).
- No se declara soporte de visión, audio ni modo de pensamiento extendido en esta variante.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para medir cómo la ablación de direcciones afecta a la tasa de rechazo y a la calidad, con una métrica objetiva de divergencia KL (0,0555) frente al original.
- Generación de contenido creativo sin restricciones excesivas: narrativa, guiones o ficción que abordan temas sensibles y que el modelo original rechazaría, manteniendo coherencia gracias a la baja KL.
- Asistentes conversacionales multi-turno en chino e inglés: el modelo conserva la capacidad de diálogo del GLM-4-32B y puede gestionar conversaciones largas, aunque la longitud exacta de contexto no está documentada en la información disponible.
- Red teaming y evaluación de robustez: útil para probar filtros y salvaguardas de sistemas downstream frente a un modelo con pocas negativas.
- Generación de código en pipelines internos: hereda el soporte de function calling y código de ingeniería del modelo base, integrable en flujos de CI/CD con las precauciones propias de un modelo sin censura.
- Experimentación con cuantizaciones GGUF en hardware de consumo: la versión GGUF permite desplegar el modelo en entornos con VRAM limitada para prototipado e investigación local.
- Fine-tuning posterior: al estar bajo licencia MIT y en formato safetensors, puede servir como base para ajustes específicos de dominio sin las restricciones del modelo alineado original.

## Benchmarks y rendimiento

La model card solo reporta métricas de la modificación respecto al modelo base, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K) para esta variante concreta.

| Metrica | Este modelo | GLM-4-32B-0414 original |
|---|---|---|
| Divergencia KL | 0,0555 | 0 (por definición) |
| Tasa de rechazo | 7/100 | 100/100 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante. El modelo base GLM-4-32B-0414 declara, según su propia documentación, resultados comparables a GPT-4o y DeepSeek-V3-0324 en generación de código y ciertas tareas de QA, pero no se aportan cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en precisión completa (BF16/FP16): aproximadamente 65 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 80 GB o más.
- Cuantización de 8 bits: en torno a 33-35 GB de VRAM; viable en una A100 40 GB o H100.
- Cuantización de 4 bits (GGUF Q4): aproximadamente 18-20 GB; cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- GPU recomendadas: A100 80 GB o H100 para precisión completa; A100 40 GB para 8 bits; RTX 4090/3090 para cuantizaciones de 4-5 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización GGUF de 4 bits; en GPUs de 16 GB probablemente no sin cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp y Ollama mediante los GGUF del repositorio separado; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-4-32B-0414-uncensored-heretic-v2 | ~32,6 B | No disponible | MIT | Variante abliterada, 7/100 rechazos, KL 0,0555 |
| zai-org/GLM-4-32B-0414 | ~32,6 B | No disponible | No indicada en la informacion | Modelo base original, alineado y con rechazos |
| Otras variantes abliteradas de la familia GLM | No disponible | No disponible | Variable | No se dispone de datos comparativos en la informacion |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores (por ejemplo, modelos densos de ~30 B de otras familias) en términos de benchmarks, ya que no se aportan cifras en la documentación disponible.

## Limitaciones y advertencias

- Modelo sin censura: la reducción de rechazos implica que puede generar contenido dañino, ofensivo o ilegal; no es apto para despliegues públicos sin salvaguardas adicionales.
- Riesgo de alucinación: inherente al modelo base y potencialmente agravado por la ablación, aunque la KL de 0,0555 sugiere una degradación limitada.
- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin alineamiento de seguridad.
- La modificación se realizó con una herramienta de terceros (Heretic) y no cuenta con validación oficial de Zhipu AI; los resultados de rechazo y KL provienen del propio autor.
- El repositorio tiene muy poca tracción (30 descargas, 1 like en el momento de la consulta), lo que reduce la validación comunitaria.
- La model card incluye avisos del autor sobre límites de almacenamiento gratuito en Hugging Face, sin relación con el comportamiento técnico del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/GLM-4-32B-0414-uncensored-heretic-v2
- Version GGUF: https://huggingface.co/llmfan46/GLM-4-32B-0414-uncensored-heretic-v2-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4-32B-0414
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
