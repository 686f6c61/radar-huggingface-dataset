# layer8labs8/OrdoPy-Coder-0.5B

## Resumen

OrdoPy-Coder-0.5B es un modelo especializado en código y razonamiento desarrollado por layer8labs8, obtenido mediante fine-tuning de Qwen/Qwen2.5-Coder-0.5B-Instruct con el motor de entrenamiento OrdoTrain. El modelo se centra en tres pilares: instrucciones en inglés, razonamiento lógico y matemático paso a paso, y generación de código Python verificado por AST (árbol de sintaxis abstracta). Con 494 millones de parámetros totales, es un modelo compacto orientado a tareas de programación y depuración.

La arquitectura subyacente es Qwen2 (transformer decoder-only), heredada del modelo base, con una longitud de contexto no especificada en la información disponible. El entrenamiento se realizó sobre Kaggle con dos GPUs Tesla T4 durante 441,7 minutos, con 8.416 pasos globales y el mejor checkpoint fijado en el paso 5.800. Se utilizaron 203.989 muestras verificadas y deduplicadas, con un currículo en dos fases y enmascaramiento de pérdida SFT solo en las respuestas del asistente.

Su relevancia radica en la mejora sustancial de rendimiento frente al modelo base en benchmarks de ejecución real: pasa de 9,76% a 40,85% en HumanEval y de 36,58% a 46,30% en MBPP, con un incremento combinado de 18,05 puntos porcentuales en 421 tareas. Es un ejemplo de cómo un currículo de datos bien diseñado puede elevar el rendimiento de un modelo pequeño sin aumentar su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del modelo base Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only con atención causal estándar. El fine-tuning se realizó con el motor OrdoTrain, un sistema de currículo de streaming sistemático, sobre dos GPUs Tesla T4 en Kaggle durante 441,7 minutos y 8.416 pasos globales, con el mejor checkpoint en el paso 5.800.

El entrenamiento utilizó 203.989 muestras verificadas por AST y deduplicadas, descartando 61.672 muestras redundantes mediante selección RHO, con una compresión de cómputo de 2,28x gracias a estratificación dinámica por longitud. El currículo fue en dos fases: la primera (30% inicial) con 45% lógica, 35% Python y 20% inglés; la segunda (70% restante) con 65% Python, 20% de anclaje de replay lógico y 15% de anclaje de inglés. Las fuentes de datos fueron KodCode/KodCode-V1-SFT-4o, microsoft/orca-math-word-problems-200k y yahma/alpaca-cleaned, con particiones sin solapamiento y sin repetición de épocas (una época por dominio). Se aplicó enmascaramiento de pérdida SFT con -100 solo en los turnos del asistente. No se menciona uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de código Python con verificación sintáctica mediante AST durante el entrenamiento.
- Razonamiento lógico y matemático paso a paso (entrenado con orca-math-word-problems-200k).
- Depuración y explicación de código en inglés (entrenado con alpaca-cleaned en el dominio english_debug).
- Generación de texto conversacional con plantilla de chat (apply_chat_template).
- Seguimiento de instrucciones en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del razonamiento paso a paso.
- No se documenta capacidad de visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Generación de funciones Python en pipelines de CI/CD: el modelo puede producir funciones como `is_palindrome_clean` a partir de una descripción, con una tasa de acierto Pass@1 del 40,85% en HumanEval, adecuado para tareas de autocompletado con revisión humana posterior.
- Asistente de depuración en inglés: dado su entrenamiento en el dominio english_debug (loss 1,4409 en Alpaca held-out), puede explicar errores y proponer correcciones en conversaciones multi-turno.
- Resolución de problemas matemáticos de enunciado: entrenado con orca-math-word-problems-200k y evaluado en GSM8K (exactitud de token del 74,68%), útil para tutores automáticos de aritmética básica.
- Prototipado rápido en entornos con recursos limitados: con 494M de parámetros y pesos en safetensors de 2,0 GB, se puede desplegar en una sola GPU consumer para pruebas de generación de código.
- Generación de tests unitarios sencillos: a partir de una función Python, el modelo puede proponer casos de prueba, aprovechando su entrenamiento en código verificado por AST.
- Educación en programación: puede generar explicaciones paso a paso de algoritmos y fragmentos de código comentados en inglés para plataformas de aprendizaje.
- Filtrado y clasificación de fragmentos de código: su especialización en Python permite usarlo como generador de candidatos en sistemas de búsqueda o recomendación de código.

## Benchmarks y rendimiento

Resultados de ejecución oficiales (Pass@1, 421 tareas, subproceso aislado de 3,0 s):

| Suite | Baseline (Qwen2.5-Coder-0.5B-Instruct) | OrdoPy-Coder-0.5B (paso 5800) | Delta |
|---|---|---|---|
| HumanEval (164 tareas) | 9,76% (16/164) | 40,85% (67/164) | +31,09% (4,19x) |
| MBPP Sanitized (257 tareas) | 36,58% (94/257) | 46,30% (119/257) | +9,72% |
| Combinado (421 tareas) | 26,13% (110/421) | 44,18% (186/421) | +18,05% |

Pérdida y exactitud de token en particiones held-out sin fuga de datos:

| Dominio | Baseline (perplejidad / exactitud) | OrdoPy-Coder-0.5B (perplejidad / exactitud) |
|---|---|---|
| python_code (MBPP Sanitized Val) | 1,0226 (2,78 / 76,44%) | 0,9843 (2,68 / 78,40%) |
| logic_math (GSM8K Official Test) | 1,4752 (4,37 / 73,21%) | 1,4096 (4,09 / 74,68%) |
| english_debug (Alpaca Held-Out) | 1,6227 (5,07 / 59,53%) | 1,4409 (4,22 / 61,58%) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5 GB; en 4 bits: aproximadamente 0,25 GB (estimaciones teóricas, no verificadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en Tesla T4, por lo que es plenamente funcional en esa clase de hardware.
- Cabe en GPUs consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag endpoints_compatible), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no documentado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | MBPP | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| OrdoPy-Coder-0.5B | 494M | No disponible | 40,85% | 46,30% | Apache 2.0 | en |
| Qwen2.5-Coder-0.5B-Instruct (base) | 494M | No disponible | 9,76% | 36,58% | Apache 2.0 | multilingüe |
| Modelos de ~0,5B de código de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más fiable es con su modelo base, ya que la información proporcionada no incluye datos de benchmarks de alternativas de tamaño similar. El modelo base declara soporte multilingüe, mientras que OrdoPy-Coder-0.5B se limita al inglés.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza calidad en castellano ni en otros idiomas.
- La longitud de contexto no está documentada; no se debe asumir la ventana de 32K típica de Qwen2.5 sin verificación.
- Riesgo de alucinación en código: aunque el entrenamiento usó verificación AST, la inferencia no verifica sintaxis ni ejecuta el código generado.
- El rendimiento en HumanEval (40,85%) sigue siendo bajo en términos absolutos para uso autónomo en producción; requiere revisión humana o tests automáticos.
- No se documenta soporte de tool calling, function calling ni agentes, lo que limita su uso en pipelines agénticos.
- El entrenamiento se realizó en GPUs T4 con un currículo de una sola época por dominio; el sobreajuste a los tres datasets citados (KodCode, orca-math, alpaca) puede reducir la generalización fuera de esos dominios.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen2.5-Coder-0.5B-Instruct, hereda los sesgos del modelo base y de los datasets de fine-tuning.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las licencias de los datasets de entrenamiento (KodCode, orca-math, alpaca) por posibles restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/layer8labs8/OrdoPy-Coder-0.5B
- Repositorio OrdoTrain: https://github.com/layer8labs8/OrdoTrain
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset KodCode: https://huggingface.co/datasets/KodCode/KodCode-V1-SFT-4o
- Dataset orca-math: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
