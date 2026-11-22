# AryanSudhirDev/chronos-2-de-lu-pregate

## Resumen

Reforge-1.5B es un adaptador LoRA entrenado sobre Qwen2.5-Coder-1.5B-Instruct para la reparación de funciones Python. Lo desarrolla AryanSudhirDev y se distribuye bajo licencia Apache 2.0. El modelo recibe código Python con errores junto con una descripción del comportamiento esperado y genera una propuesta de función corregida, preservando nombres, firmas y requisitos declarados. Es un especialista en reparación, no una mejora general de codificación.

El repositorio nació originalmente con el identificador `chronos-2-de-lu-pregate` y contenía un modelo de predicción de precios eléctricos basado en Chronos. El autor lo renombró a `Reforge-1.5B` y sustituyó el contenido por este adaptador de reparación de código; la versión anterior de Chronos sigue accesible en una revisión concreta del repositorio. Esta ficha describe exclusivamente el adaptador de reparación.

El adaptador tiene 119.477.664 parámetros (los del modelo base Qwen2.5-Coder-1.5B-Instruct, ya que el adaptador LoRA añade un conjunto reducido de pesos) y un tamaño de repositorio de 0,5 GB. La model card documenta resultados mixtos: mejoras en paneles de desarrollo de reparación y un retroceso severo en HumanEval externo, por lo que el autor lo presenta explícitamente como un checkpoint de investigación retenido y no como un reemplazo general del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA (rank 8, alpha 16, dropout 0) sobre proyecciones q/k/v/o |
| Parametros totales | 119.477.664 (modelo base Qwen2.5-Coder-1.5B-Instruct; el adaptador LoRA añade un conjunto reducido de pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como especificación formal; el helper de inferencia impone un techo de prompt de 3072 tokens y un máximo de 384 tokens nuevos |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el helper usa float32 en CPU y bfloat16 en MPS) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + archivos de tokenizer copiados del base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de la familia Qwen2. El entrenamiento LoRA usa rank 8, alpha 16, dropout 0, y se aplica sobre las proyecciones de atención q, k, v y o. La revisión del modelo base está fijada al commit `2e1fd397ee46e1388853d2af2c993145b0f1098a`. El entrenamiento usó semilla 42 y 120 actualizaciones (steps); el checkpoint retenido es `balanced-short-v1-seed42-01` en el paso 120.

Los datos de entrenamiento son ejemplos sintéticos autorales de reparación de código Python, según indica la model card. No se especifica el número de tokens ni la composición detallada del dataset. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado. El autor advierte que los paneles de desarrollo reutilizados incluyen ejemplos correlacionados y no constituyen una confirmación independiente de generalización. No se distribuyen cuerpos de tareas de benchmark, tests privados, entradas ocultas ni respuestas canónicas. El helper de inferencia emplea decodificación greedy, semilla 42, un máximo de 384 tokens nuevos y un techo de prompt de 3072 tokens, rechazando entradas largas en lugar de truncarlas silenciosamente.

## Capacidades

- Generación de propuestas de reparación de funciones Python a partir de código defectuoso y una descripción del comportamiento esperado.
- Preservación de nombres de función, firmas y requisitos declarados en el prompt.
- Generación de texto conversacional mediante la plantilla de chat user/assistant del tokenizer.
- Especialización en reparación de código, no en generación general de código ni en otras tareas de programación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles; la model card indica inglés.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Reparación asistida de funciones Python en desarrollo: dado un fragmento defectuoso y una descripción del comportamiento esperado, el modelo propone una función corregida que conserva la firma original, útil como borrador para revisión humana.
- Revisión de parches en pipelines internos: integrado como generador de propuestas que un revisor o un conjunto de tests valida antes de aplicar cambios, sin ejecución automática del código generado.
- Soporte a tareas de docencia o formación: el modelo puede generar correcciones de ejercicios de Python con errores, siempre que un instructor valide la salida.
- Exploración de técnicas de ajuste fino con PEFT: el adaptador sirve como ejemplo reproducible de LoRA rank 8 sobre Qwen2.5-Coder-1.5B-Instruct con pesos y metadatos publicados.
- Reproducción de experimentos de reparación de código: el repositorio incluye `results.json` y `training_metadata.json` para auditar los resultados registrados y las condiciones de evaluación.
- Evaluación de regresiones en modelos ajustados: el caso documentado de caída en HumanEval externo (de 107/164 a 21/164) sirve como referencia para diseñar protocolos de validación antes de desplegar adaptadores especializados.

## Benchmarks y rendimiento

Resultados registrados por el autor para este checkpoint exacto. Los paneles de desarrollo reutilizan ejemplos correlacionados y no son confirmación independiente de generalización.

| Condición | Base aprobado | Adaptador aprobado |
|---|---:|---:|
| Reparación autoral de desarrollo, 72 tareas | 34/72 | 65/72 |
| Desarrollo público, 72 tareas, solo las tres aserciones originales | 39/72 | 44/72 |
| Pantalla de desarrollo MBPP+ público pequeño, 24 tareas | 10/24 | 14/24 |
| HumanEval Original externo, 164 tareas | 107/164 | 21/164 |
| HumanEval+ estricto externo (base AND plus), 164 tareas | 100/164 | 18/164 |

La evaluación externa en HumanEval se realizó con decodificación greedy de 768 tokens y límites de sandbox local de 60 segundos de CPU, 65 segundos de reloj y 4096 MiB de RSS muestreado por grupo; no es paridad exacta con la CLI oficial ni con leaderboards. El autor señala posible solapamiento con datos públicos de preentrenamiento y que las revisiones estáticas finitas no prueban corrección ni no interferencia. No se formulan afirmaciones de significancia estadística, mecanismo de entrenamiento aislado ni preparación para despliegue.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,5 GB) y el tokenizer; la primera carga descarga los pesos del modelo base Qwen2.5-Coder-1.5B-Instruct.
- El helper de inferencia permite CPU (float32) y Apple Silicon MPS (bfloat16).
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del base (1,5B parámetros) es viable en GPUs de consumo, pero el autor no publica cifras.
- GPUs recomendadas: no disponible en la información proporcionada.
- Opciones de despliegue documentadas: Transformers + PEFT y el helper `inference.py` del repositorio. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reforge-1.5B (este) | 119.477.664 (base 1,5B) | no disponible (techo de prompt 3072 tokens en el helper) | Adaptador LoRA de reparación Python | Apache 2.0 | Hugging Face, pesos safetensors |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | no disponible en esta información | Modelo general de código e instrucciones | Apache 2.0 | Hugging Face |
| Alternativas de reparación de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de otras alternativas de reparación comparables en la información proporcionada. La comparación directa con el base en HumanEval muestra una regresión severa del adaptador (21/164 frente a 107/164), por lo que no debe considerarse una mejora general sobre Qwen2.5-Coder-1.5B-Instruct.

## Limitaciones y advertencias

- Regresión severa documentada en HumanEval externo: el adaptador pasa 21/164 tareas frente a 107/164 del base.
- Los paneles de desarrollo incluyen ejemplos correlacionados y no constituyen evidencia independiente de generalización.
- Entrenado sobre ejemplos sintéticos autorales; no se establece como mejora general de codificación.
- Las salidas requieren revisión humana; el helper imprime código y nunca lo ejecuta ni sobrescribe el archivo de entrada.
- Posible solapamiento con datos públicos de preentrenamiento en la evaluación.
- Idiomas soportados limitados al inglés según la model card.
- No se documentan sesgos específicos ni tasas de alucinación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no avala preparación para despliegue en producción.
- El repositorio fue renombrado desde `chronos-2-de-lu-pregate`; los resultados de predicción de precios eléctricos de la versión anterior no aplican a este modelo.
- No se distribuyen tests privados, entradas ocultas ni respuestas canónicas, lo que limita la reproducción exacta de los benchmarks.
- La evaluación MBPP+ `assessment03` corresponde a un adaptador diferente y sus puntuaciones no deben atribuirse a este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/AryanSudhirDev/Reforge-1.5B
- URL antigua (redirige): https://huggingface.co/AryanSudhirDev/chronos-2-de-lu-pregate
- Revisión de la versión anterior de Chronos: https://huggingface.co/AryanSudhirDev/Reforge-1.5B/tree/9ffcc6a064d27eb2c7657d3763554782710ceaca
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Revisión fijada del base: `2e1fd397ee46e1388853d2af2c993145b0f1098a`
