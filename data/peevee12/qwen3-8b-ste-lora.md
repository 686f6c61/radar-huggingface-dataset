# PeeVee12/qwen3-8b-ste-lora

## Resumen

Qwen3-8B STE LoRA es un adaptador LoRA entrenado sobre el modelo cuantizado `mlx-community/Qwen3-8B-4bit`, una versión de Qwen3-8B en formato MLX de 4 bits. Lo desarrolla el usuario PeeVee12 como proyecto de aprendizaje, y su objetivo es hacer que el modelo responda a preguntas técnicas siguiendo el estilo de ASD-STE100 Simplified Technical English (STE): pasos numerados en imperativo, una acción por paso, frases cortas, voz activa, ausencia de verbos modales y avisos de seguridad que empiezan por un comando.

El adaptador no modifica los pesos base: se carga junto al modelo Qwen3-8B y añade 9,7 millones de parámetros entrenables (0,12 % del total). El interés práctico está en que demuestra que un ajuste fino pequeño y barato (entrenado en un Apple M2 Max con `mlx_lm.lora`) puede imponer un registro de escritura técnica muy específico sin necesidad de un prompt de sistema, algo relevante para documentación de mantenimiento, manuales y procedimientos operativos.

Es importante subrayar que se trata de un adaptador de estilo, no de conocimiento: el autor advierte explícitamente de que no mejora la corrección técnica del modelo base y de que se observaron errores de seguridad en la evaluación, por lo que no debe usarse como fuente de procedimientos para trabajos eléctricos, presurizados o con combustible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-8B), cuantizado en 4 bits y ejecutado con MLX |
| Parametros totales | Modelo base Qwen3-8B (tamaño total no especificado en la información disponible); adaptador LoRA de 9,7 M parámetros entrenables (0,12 % del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento usó una longitud máxima de 512 tokens |
| Tipos de cuantizacion | Base en 4 bits (formato MLX); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (MLX); modelo base en formato MLX de 4 bits |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA mediante `mlx_lm.lora` (mlx-lm 0.32.2) sobre las 16 capas superiores de los 36 bloques del transformer de Qwen3-8B, aplicando LoRA a las proyecciones q, k, v, o, gate, up y down. La configuración usa rango 8, escala 20,0 y dropout 0,0, con batch de 4 y longitud máxima de 512 tokens. El learning rate es 1e-5 con calentamiento lineal de 50 pasos y decaimiento coseno, y la pérdida se calcula solo sobre los tokens de respuesta (`mask_prompt: true`).

El conjunto de datos consta de 2.090 ejemplos de un solo turno (1.882 de entrenamiento, 104 de validación y 104 de prueba) repartidos en 15 dominios técnicos: automoción, fontanería, climatización, mantenimiento aeronáutico y herramientas eléctricas, entre otros. Hay cuatro tipos de petición: procedimientos, descripciones, avisos de seguridad y resolución de problemas. Las preguntas y las respuestas de referencia en STE fueron generadas por modelos Claude y cada respuesta tuvo que superar un verificador STE basado en reglas. El dataset no está publicado. El checkpoint publicado corresponde a la iteración 500 de 950 (unas 1,06 épocas), con una pérdida de validación de 1,229 frente a 2,542 antes del entrenamiento.

## Capacidades

- Generación de texto técnico en inglés con estilo STE: pasos numerados en imperativo, una acción por paso y frases cortas.
- Redacción de avisos de seguridad que comienzan con un comando, sin verbos modales.
- Producción de descripciones técnicas y procedimientos de resolución de problemas en 15 dominios (automoción, fontanería, HVAC, mantenimiento de aeronaves, herramientas eléctricas, etc.).
- Funciona sin prompt de sistema: el estilo se activa por el propio adaptador.
- Entrenado con el modo de razonamiento (thinking) desactivado; el ejemplo de uso pasa `enable_thinking=False`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Redacción de manuales de mantenimiento: el adaptador genera secuencias de pasos numerados con una acción por línea, adecuadas como borrador para documentación de servicio de equipos industriales o domésticos.
- Estandarización de procedimientos internos: útil para equipos que quieren homogeneizar el registro de sus instrucciones de operación al estilo STE sin reescribir manualmente cada documento.
- Generación de avisos de seguridad en documentación de producto: el modelo produce advertencias que empiezan por un comando, un patrón exigido por muchas guías de estilo técnico.
- Creación de contenido de formación: borradores de guías paso a paso para cursos de mantenimiento, siempre revisados por un experto antes de su publicación.
- Prototipado de asistentes de soporte técnico en inglés: el adaptador puede servir de base para un asistente que responda con instrucciones concisas, aunque requiere validación humana por los errores de seguridad observados.
- Investigación sobre control de estilo con LoRA: caso de estudio reproducible de cómo un adaptador de 9,7 M de parámetros impone un registro documental concreto sobre un modelo de 8B.
- Evaluación de pipelines de verificación de estilo: útil para probar verificadores basados en reglas (como el checker STE usado por el autor) frente a salidas generadas.

## Benchmarks y rendimiento

Evaluación del autor con 40 prompts escritos a mano, separados de los datos de entrenamiento, una muestra por prompt a temperatura 0,7. Se considera aprobado si el verificador STE basado en reglas no encuentra errores. Margen de error aproximado de ±8 puntos porcentuales.

| Configuracion | Tasa de aprobado | Errores por respuesta | Avisos por respuesta | Respuestas que repiten un paso |
|---|---|---|---|---|
| Modelo base, sin instrucciones | 10 % | 4,80 | 9,38 | no aplica |
| Modelo base + reglas STE en el prompt de sistema | 65 % | 0,35 | 3,20 | 0/40 |
| Este adaptador, sin prompt de sistema | 92,5 % | 0,07 | 0,12 | 6/40 |

Comparación por pares a ciegas con dos jueces LLM sobre 20 prompts, en ambos órdenes A/B:

| Criterio | Este adaptador | Base + reglas | Empate |
|---|---|---|---|
| Más correcto técnicamente | 7 (+1 con inclinación) | 8 | 4 |
| Más fácil de seguir | 10 | 9 | 1 |

El adaptador ganó en avisos de seguridad (3-0) y perdió en procedimientos paso a paso (base 5, adaptador 2). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo base es una cuantización de 4 bits en formato MLX, pensada para ejecutarse en Apple Silicon; el autor lo entrenó en un Apple M2 Max.
- VRAM/unified memory estimada: no disponible de forma explícita; un modelo de 8B en 4 bits requiere del orden de 5-6 GB solo para los pesos, más overhead de contexto y caché.
- GPU recomendadas: el formato MLX está orientado a chips Apple (M1/M2/M3/M4); no es directamente compatible con CUDA sin conversión.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el formato MLX no se ejecuta de forma nativa en GPUs NVIDIA.
- Opciones de despliegue: `mlx-lm` (carga del modelo base con `adapter_path`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B STE LoRA (este) | 8B base + 9,7 M adaptador | No disponible (entrenado a 512 tokens) | Estilo STE en inglés | Apache-2.0 | Hugging Face (adaptador) |
| Qwen3-8B (base) | 8B | No disponible en la información | Modelo generalista | Apache-2.0 | Hugging Face |
| Qwen3-8B + reglas STE en prompt | 8B | No disponible | Estilo STE vía prompt | Apache-2.0 | Uso directo |
| Alternativas de ajuste de estilo LoRA | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es más correcto técnicamente que el modelo base: copia el nivel de detalle de sus respuestas de entrenamiento (unas 14 pasos por procedimiento) sin el conocimiento subyacente, y a veces inventa, reordena o repite pasos.
- Se observaron errores de seguridad en la evaluación: omitió apagar la corriente antes de trabajar en un calentador de agua, afirmó que un detector de humo estaba alimentado cuando no lo estaba y enchufó una herramienta eléctrica antes de inspeccionarla. No deben seguirse sus procedimientos para trabajos eléctricos, presurizados, con combustible u otros peligrosos.
- Repetición: aproximadamente 1 de cada 7 respuestas repite un paso (por ejemplo, apagar y encender un interruptor en bucle).
- El verificador STE es heurístico y no consulta el diccionario oficial ASD-STE100; superar el checker no equivale a cumplimiento STE.
- Solo inglés, solo preguntas de un turno y entrenado con el modo thinking desactivado.
- Dataset de entrenamiento no publicado, lo que limita la reproducibilidad.
- Licencia Apache-2.0, igual que el modelo base Qwen3, por lo que se permite uso comercial; aun así, la falta de garantías de corrección técnica desaconseja su uso en producción sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeeVee12/qwen3-8b-ste-lora
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Librería de ejecución y entrenamiento: https://github.com/ml-explore/mlx-lm
- Estándar ASD-STE100 Simplified Technical English: https://www.asd-ste100.org/
