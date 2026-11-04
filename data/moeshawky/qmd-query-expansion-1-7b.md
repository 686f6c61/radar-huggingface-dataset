# moeshawky/qmd-query-expansion-1.7B

## Resumen
`moeshawky/qmd-query-expansion-1.7B` es un adaptador LoRA entrenado sobre el modelo base LFM3-1.7B para una tarea muy concreta: la expansión de consultas de búsqueda en el formato del dataset QMD (Query Manipulation Dataset). Dado un término de búsqueda, el modelo devuelve una lista de términos expandidos con el formato `type: text`, lo que resulta útil en pipelines de recuperación de información y motores de búsqueda que necesitan enriquecer la consulta original antes de recuperar documentos.

Se trata de un fine-tuning supervisado (SFT) de una sola época sobre 2.806 ejemplos de entrenamiento y 312 de validación, con un adaptador de 13,5 millones de parámetros entrenables (0,78 % del total). El modelo base LFM3-1.7B es un transformer causal de 1.742 millones de parámetros con atención híbrida (completa, deslizante y lineal) según indica el autor en la model card.

Su relevancia es acotada y experimental: es un artefacto de investigación para una tarea de nicho, con cero descargas y cero likes en el momento de la consulta. No está pensado como modelo de propósito general y su uso fuera de la expansión de consultas QMD está explícitamente desaconsejado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal LFM3-1.7B con adaptador LoRA (PEFT) |
| Parametros totales | 1.742.351.104 (base + adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor menciona atención híbrida y problemas de memoria a partir de ~4K tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el entrenamiento se realizó en fp16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre LFM3-1.7B, un modelo causal con atención híbrida que combina atención completa, deslizante y lineal según la model card del autor. El fine-tuning emplea LoRA con r=16, alpha=32, dropout 0,05 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `w1`, `w2`, `w3`. Se entrenó una única época con learning rate 2e-4, optimizador `adamw_torch_8bit`, precisión fp16, warmup de 100 pasos, batch efectivo de 32 (8 por dispositivo × 2 de acumulación × 2 GPUs) y semilla 42.

Los datos provienen del dataset `tobil/qmd-query-expansion-train-v2` (2.806 filas de entrenamiento, 312 de validación). Cada ejemplo es una conversación de chat con el mensaje de usuario `/no_think Expand this search query: {query}` y una respuesta del asistente en formato `type: text`. El entrenamiento se ejecutó en 2× T4 durante 338,1 segundos (88 pasos, ~0,26 pasos/s y 8,3 muestras/s), con un consumo de VRAM de aproximadamente 9,6 GB por GPU en la configuración de batch=8/accum=2 y de 5,3 GB en batch=2/accum=8. No se aplicaron RLHF ni DPO; es SFT puro.

## Capacidades
- Expansión de consultas de búsqueda en el formato QMD: dado un query, genera líneas `type: text` con términos expandidos.
- Generación de texto condicionada al formato de chat definido por el autor (mensaje de usuario con prefijo `/no_think`).
- Modo "no think": el prefijo `/no_think` desactiva el razonamiento explícito en la generación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor lo declara fuera de alcance.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales (visión, audio, thinking mode avanzado): no disponibles.

## Casos de uso
- Expansión de consultas en un motor de búsqueda interno: el modelo recibe la consulta del usuario y devuelve términos alternativos que se añaden al índice invertido para mejorar el recall. Es su caso de uso principal y el único validado por el autor.
- Enriquecimiento de queries en sistemas RAG: antes de la recuperación vectorial, se expande la consulta con sinónimos y variantes generadas por el modelo para aumentar la cobertura de documentos recuperados.
- Preprocesado en pipelines de búsqueda académica o documental: expansión controlada de términos técnicos en inglés, con formato de salida estructurado (`type: text`) que se parsea con facilidad.
- Generación de variantes de consulta para pruebas A/B de motores de búsqueda: permite comparar el rendimiento de un sistema con y sin expansión de queries sobre el mismo conjunto de consultas.
- Filtrado y clasificación previa de consultas: el formato `type: text` permite etiquetar la naturaleza de cada término expandido (tipo de entidad, tipo de modificación) y usarlo como señal en un ranker.
- Base para experimentos de investigación en query manipulation: al ser un adaptador LoRA pequeño (13,5 M de parámetros), es fácil de reentrenar o combinar con otros adaptadores para estudiar el efecto de la expansión en tareas de recuperación.

## Benchmarks y rendimiento
Los únicos datos publicados son métricas de validación sobre el split de 312 filas del dataset QMD, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Split | Resultado |
|---|---|---|
| eval_loss | val (312 filas) | 0,8393 |
| eval_mean_token_accuracy | val (312 filas) | 0,7874 |
| eval_entropy | val (312 filas) | 0,8622 |
| train_loss | época 1, 88 pasos | 1,965 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el autor reporta ~9,6 GB por GPU durante el entrenamiento con batch=8/accum=2 en 2× T4 y ~5,3 GB con batch=2/accum=8. Para inferencia en fp16 de un modelo de 1,7B se puede estimar en torno a 3,5-4 GB de pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: T4 (usada en el entrenamiento), así como cualquier GPU con al menos 8 GB de VRAM para inferencia en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; no confirmado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base LFM3-1.7B y aplicar el adaptador con `peft.PeftModel`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el autor solo proporciona el comando de verificación con `transformers` + `peft`.
- Latencia y throughput: no disponibles para inferencia; solo se reporta throughput de entrenamiento (0,26 pasos/s, 8,3 muestras/s en 2× T4).

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un adaptador LoRA de nicho sobre LFM3-1.7B; no se han encontrado alternativas equivalentes de expansión de consultas QMD en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| moeshawky/qmd-query-expansion-1.7B | 1,7B (13,5M entrenables) | no disponible | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con datos QMD en inglés, hereda los sesgos de esa distribución.
- Riesgo de alucinación: elevado fuera del dominio QMD; el autor declara explícitamente fuera de alcance el chat general, la generación de código, el resumen y la traducción.
- Limitaciones de contexto: el autor advierte de presión de memoria en secuencias superiores a ~4K tokens debido a la atención híbrida del modelo base; se recomienda reducir el batch o activar gradient checkpointing.
- Limitaciones de idioma: solo inglés; no se ha entrenado ni evaluado en castellano.
- Restricciones de licencia: MIT, permite uso comercial y modificación, pero el modelo base LFM3-1.7B puede tener su propia licencia que conviene verificar por separado.
- Caveats para producción: solo el 0,78 % de los parámetros son entrenables y se entrenó una sola época, con una precisión de token en validación de ~0,79 que el propio autor describe como meseta; el modelo tiene 0 descargas y 0 likes, sin validación externa. No se documenta soporte para servidores de inferencia de alto rendimiento.

## Enlaces
- HuggingFace: https://huggingface.co/moeshawky/qmd-query-expansion-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/tobil/qmd-query-expansion-train-v2
- Modelo base referenciado: LFM3-1.7B (no se proporciona URL en la información disponible)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
