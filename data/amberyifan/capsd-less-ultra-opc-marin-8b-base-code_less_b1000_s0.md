# AmberYifan/capsd-less-ultra-opc-marin-8b-base-code_less_b1000_s0

## Resumen

El modelo `capsd-less-ultra-opc-marin-8b-base-code_less_b1000_s0` es un ajuste fino (fine-tune) completo del modelo base `marin-community/marin-8b-base`, desarrollado por el usuario AmberYifan. Está orientado a generación de texto y conversación, con un entrenamiento específico sobre un dataset denominado `capsd_marin-8b-base-n80000-opc__mix_code_less_b1000_s0`, que por su nombre sugiere una mezcla de datos con reducción de contenido de código. El modelo tiene aproximadamente 8.030 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 16,1 GB.

La relevancia de este modelo radica en que forma parte de una serie de variantes (code, math, science) generadas a partir del mismo base, lo que permite comparar el efecto de diferentes estrategias de selección de datos. Sin embargo, la información pública es escasa: la model card está generada automáticamente, no se han publicado resultados de benchmarks y la licencia se indica como "other" sin especificar. Esto limita su uso directo en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Llama (según tags, sin versión confirmada) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del modelo base `marin-community/marin-8b-base`, que a su vez pertenece a la familia Llama según los tags de HuggingFace. No se dispone de detalles sobre la arquitectura interna (número de capas, heads, etc.) más allá de los 8.030 millones de parámetros.

El entrenamiento se realizó con el framework Llama-Factory y Transformers 5.7.0, sobre un dataset llamado `capsd_marin-8b-base-n80000-opc__mix_code_less_b1000_s0`. Los hiperparámetros declarados incluyen una tasa de aprendizaje de 1e-05, batch size total de 64 (con acumulación de gradientes), optimizador AdamW, scheduler cosine con warmup del 3% y una sola época. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en Llama, puede generar texto coherente en tareas de completado y conversación.
- Conversación: el tag `conversational` indica que está diseñado para interacciones de diálogo.
- Fine-tune orientado a código: el nombre `code_less` sugiere que el dataset incluye una proporción reducida de código, pero no hay evidencia de capacidades específicas de programación.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

Dado que no hay benchmarks ni documentación adicional, los casos de uso son hipotéticos y requieren validación previa:

- Prototipado de chatbots: podría emplearse como base para un asistente conversacional, aunque su rendimiento real es desconocido.
- Experimentación académica: útil para estudiar el efecto de diferentes estrategias de filtrado de datos (code_less vs. code_kcenter) sobre un mismo modelo base.
- Comparación de fine-tunes: al existir variantes (math, science, code), permite analizar cómo afecta la composición del dataset al comportamiento del modelo.
- Generación de texto genérica: podría usarse para tareas de escritura asistida, pero sin garantías de calidad.
- Investigación en alineación: al ser un fine-tune completo, sirve como punto de partida para estudios sobre ajuste de modelos de 8B.
- No se recomienda su uso en producción sin una evaluación exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `results` del model-index está vacío, y no hay datos de MMLU, HumanEval, GSM8K u otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada: con 8.030 millones de parámetros, en FP16 se necesitan aproximadamente 16 GB de VRAM (el repo ocupa 16,1 GB). Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ) podría reducirse a unos 5-6 GB, pero no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: para FP16, una GPU con 16-24 GB (RTX 4090, A100 40GB, etc.). Para cuantización 4-bit, una RTX 3090 o 4080 (12-16 GB) podría ser suficiente.
- Compatibilidad con consumer GPU: sí, si se cuantiza, pero no hay archivos GGUF ni Ollama disponibles.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones listas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos. Existen variantes del mismo autor (por ejemplo, `capsd-marin-8b-base-code_less_b1000_s0`, `capsd-marin-8b-base-math_less_b1000_s0`, `capsd-marin-8b-base-science_less_b1000_s0`), pero no se han publicado métricas que permitan una comparación objetiva. El modelo base `marin-community/marin-8b-base` tampoco tiene información pública de rendimiento.

## Limitaciones y advertencias

- Licencia "other" sin especificar: no se conocen las restricciones de uso comercial o modificación. Es imprescindible contactar con el autor antes de cualquier uso.
- Sin benchmarks: no hay evidencia de calidad en tareas estándar, por lo que el rendimiento es incierto.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos.
- Contexto limitado: se desconoce la longitud de contexto soportada, lo que afecta a tareas que requieren ventanas largas.
- Model card incompleta: la documentación es automática y no aporta detalles sobre limitaciones específicas.
- No apto para producción sin validación: la ausencia de datos de evaluación y la licencia ambigua desaconsejan su uso en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-less-ultra-opc-marin-8b-base-code_less_b1000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
- Variante code_less b1000: https://huggingface.co/AmberYifan/capsd-marin-8b-base-code_less_b1000_s0
- Variante code_less b8000: https://huggingface.co/AmberYifan/capsd-marin-8b-base-code_less_b8000_s0
- Variante math_less b1000 (en FriendliAI): https://friendli.ai/models/AmberYifan/capsd-marin-8b-base-math_less_b1000_s0
- Variante science_less b1000 (en FriendliAI): https://friendli.ai/models/AmberYifan/capsd-marin-8b-base-science_less_b1000_s0
- Variante code_kcenter b14000 (en Free2AITools): https://free2aitools.com/model/amberyifan/capsd-marin-8b-base-code_kcenter_b14000_s0
