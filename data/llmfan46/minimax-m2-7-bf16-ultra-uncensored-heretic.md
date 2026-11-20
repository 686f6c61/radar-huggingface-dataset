# llmfan46/MiniMax-M2.7-BF16-ultra-uncensored-heretic

## Resumen

MiniMax-M2.7-BF16-ultra-uncensored-heretic es una versión "abliterated" (decensurada) del modelo amd/MiniMax-M2.7-BF16, publicada por el contribuidor independiente llmfan46. El modelo conserva la arquitectura y los pesos del modelo base de MiniMax (identificador de arquitectura `minimax_m2`) pero ha sido modificado mediante la técnica de abliteración para eliminar los mecanismos de rechazo aprendidos durante el alineamiento, reduciendo drásticamente las negativas a responder.

La modificación se realizó con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA), que proyecta fuera del espacio de activaciones las direcciones asociadas a comportamientos de rechazo. Según la model card del autor, el resultado es una reducción de rechazos del 97% (de 97/100 a 4/100 en su evaluación interna) con una divergencia KL de 0,0452 respecto al modelo original, lo que indica que la distribución de salidas se mantiene próxima al base.

El modelo es relevante en el nicho de modelos "uncensored" para investigación sobre alineamiento, evaluación de sesgos y estudios de robustez, así como para aplicaciones donde las restricciones de contenido del modelo original resultan un obstáculo. Con 228.689.748.992 parámetros totales (aproximadamente 228,7 mil millones) y un repositorio de 457,4 GB en BF16, es un modelo de gran escala que requiere infraestructura de inferencia significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (identificador `minimax_m2`), detalles internos no disponibles |
| Parametros totales | 228.689.748.992 (~228,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publicado está en BF16) |
| Idiomas soportados | no disponible |
| Licencia | other (enlace a la licencia del modelo base: github.com/MiniMax-AI/MiniMax-M2.7/blob/main/LICENSE) |
| Formato de pesos | safetensors (BF16), requiere `trust_remote_code` (custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base amd/MiniMax-M2.7-BF16, identificada en los metadatos como `minimax_m2`. No se dispone en la información proporcionada de detalles sobre el número de capas, mecanismos de atención, composición del dataset de entrenamiento ni procesos de RLHF/DPO del modelo original. El tamaño de 228,7 mil millones de parámetros y el peso del repositorio en BF16 (457,4 GB) confirman que se trata de un modelo denso de gran escala, no de un MoE con parámetros activos reducidos (aunque este extremo no puede confirmarse con los datos disponibles).

La intervención de llmfan46 no reentrena el modelo: aplica abliteración sobre los pesos originales. Concretamente, Heretic v1.2.0 con ARA modifica el componente `attn.o_proj` en las capas 0 a 51, con los siguientes hiperparámetros: `preserve_good_behavior_weight` 0,9996, `steer_bad_behavior_weight` 0,0005, `overcorrect_relative_weight` 1,1241 y `neighbor_count` 12. El modelo conserva el modo de razonamiento (thinking) activado por defecto, con bloques `<think>`, y ofrece una plantilla alternativa en la carpeta "Instruct Mode" para desactivarlo.

## Capacidades

- Generación de texto conversacional y de razonamiento paso a paso mediante bloques `<think>` (modo thinking activado por defecto).
- Modo instruct alternativo (sin thinking) mediante el reemplazo de la plantilla `chat_template.jinja` incluida en la carpeta "Instruct Mode".
- Reducción drástica de rechazos: 4/100 frente a 97/100 del modelo original según la evaluación del autor.
- Capacidades del modelo base (código, matemáticas, multilingüismo, tool calling) presumiblemente conservadas, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y abliteración: el modelo sirve como objeto de estudio para medir cómo la eliminación de direcciones de rechazo afecta a la distribución de salidas (KL de 0,0452) y a la tasa de negativas (4/100), permitiendo comparar metodologías ARA frente a otras técnicas de decensurado.
- Evaluación de robustez de filtros de seguridad: desplegar este modelo permite a equipos de seguridad probar clasificadores y guardrails frente a un modelo con restricciones reducidas, midiendo la tasa de evasión de sus propios sistemas.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas del modelo alineado, aprovechando la baja tasa de rechazo documentada.
- Estudio de sesgos y toxicidad: al eliminar los mecanismos de rechazo, el modelo puede exponer de forma más directa los sesgos latentes en los datos de entrenamiento del base, útil para auditorías de sesgo en investigación académica.
- Experimentación con modos de razonamiento: comparar el modo thinking (por defecto) frente al modo instruct mediante el intercambio de plantilla permite estudiar el impacto del razonamiento explícito en tareas de diálogo y generación.
- Fine-tuning posterior sobre dominio específico: al estar publicado en BF16 con safetensors y código custom, puede servir como punto de partida para ajustes supervisados en dominios donde el modelo base rechazaría contenido legítimo (por ejemplo, literatura médica o jurídica sensible).

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la evaluación interna del autor sobre rechazos y divergencia KL:

| Metrica | Este modelo | Modelo original (MiniMax-M2.7-BF16) |
|---|---|---|
| Divergencia KL | 0,0452 | 0 (por definición) |
| Rechazos | 4/100 | 97/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 457 GB solo para pesos, más overhead de activaciones y KV cache; se requieren múltiples GPUs de 80 GB (por ejemplo, 8× H100 80 GB o 8× A100 80 GB) como mínimo para un despliegue en BF16.
- En cuantizaciones de 8 bits o 4 bits, el requisito bajaría teóricamente a ~230 GB y ~115 GB respectivamente, pero no se publican versiones cuantizadas oficiales en el repositorio.
- GPU recomendadas: H100, A100 80 GB, o clústeres multi-GPU; no cabe en GPUs de consumo (RTX 4090 con 24 GB) en BF16 ni en cuantizaciones de 8 bits sin offloading extremo a RAM/SSD.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el custom_code); compatibilidad con endpoints (tag `endpoints_compatible`). Soporte de vLLM, llama.cpp, Ollama o TGI no está documentado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-M2.7-BF16-ultra-uncensored-heretic (este) | ~228,7 B | no disponible | other | Hugging Face, 216 descargas |
| amd/MiniMax-M2.7-BF16 (base) | ~228,7 B | no disponible | other | Hugging Face |
| Otras variantes uncensored de llmfan46 | variable | no disponible | other | Hugging Face (70+ modelos del autor) |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina mecanismos de rechazo, lo que implica un riesgo elevado de generar contenido dañino, ofensivo o ilegal; no es apto para aplicaciones de cara al público sin guardrails externos.
- La divergencia KL de 0,0452 indica que, aunque las salidas se mantienen próximas al base, existen diferencias medibles en la distribución que pueden degradar sutilmente la calidad en tareas que dependían del alineamiento original.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto.
- La licencia "other" remite a la licencia del modelo base de MiniMax; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede restringirlo.
- El repositorio ocupa 457,4 GB y el autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que podría afectar a la disponibilidad futura de los pesos.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de desplegarlo en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos de esta escala.
- El modo thinking está activado por defecto, lo que incrementa los tokens generados y la latencia; para aplicaciones de baja latencia debe intercambiarse la plantilla por la de "Instruct Mode".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/MiniMax-M2.7-BF16-ultra-uncensored-heretic
- Modelo base: https://huggingface.co/amd/MiniMax-M2.7-BF16
- Licencia del modelo base: https://github.com/MiniMax-AI/MiniMax-M2.7/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
