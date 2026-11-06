# Argo1-OOAS/RGOO-Qwen3-0.6B

## Resumen

RGOO-Qwen3-0.6B es una versión comprimida del modelo Qwen3-0.6B del equipo Qwen, publicada por Argo1-OOAS. No se trata de un modelo nuevo entrenado desde cero, sino de una re-codificación de los pesos del modelo original mediante la técnica RGOO (Fisher-Allocated, Entropy-Coded Weight Compression), que combina asignación de precisión por filas, codificación entrópica y una fase de reajuste de escalas y ganancias de normalización. El resultado se distribuye como ficheros `.rgoo` que, al cargarse, se decodifican a pesos ordinarios de 16 bits en un modelo de transformers estándar.

La propuesta es relevante por su enfoque de compresión orientado al almacenamiento y a la distribución: reduce el tamaño de los pesos lineales a 3,01 o 2,03 bits por número, con ficheros completos de 478 MB y 424 MB respectivamente frente a 1,19 GB del original. La arquitectura subyacente es la de Qwen3-0.6B (transformer denso, 0,6 mil millones de parámetros, contexto de 32.768 tokens según la documentación de Qwen). El modelo está pensado para experimentación con técnicas de cuantización más que para despliegue de producción directo, ya que la decodificación no reduce el uso de memoria ni el tiempo de inferencia.

El repositorio incluye el código `rgoo`, los dos ficheros comprimidos (3 y 2 bits), la configuración y el tokenizador de Qwen sin modificar, y el artículo técnico `rgoo.pdf` con la metodología y la evaluación. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B), con pesos lineales re-codificados por RGOO |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen3-0.6B; no especificada en la model card de RGOO) |
| Tipos de cuantizacion | RGOO a 3,01 bits y 2,03 bits por número en las 196 capas lineales; tabla de palabras y ganancias de normalización a 16 bits |
| Idiomas soportados | Inglés (según la model card); el modelo base Qwen3 es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rgoo` (fichero con codificación entrópica, requiere el código `rgoo` para cargarse); se decodifica a bfloat16 en memoria |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B sin cambios estructurales: un transformer denso con 196 capas lineales cuyos pesos han sido re-codificados. RGOO asigna a cada fila de cada tabla de pesos su propio nivel de precisión, eligiendo el nivel que minimiza el daño previsto a la distribución del siguiente token (estimado con información de Fisher) más el coste en bits tras la codificación entrópica. GPTQ selecciona después los códigos, y una fase corta de reajuste de las escalas de fila y las ganancias de normalización, con los códigos congelados, aproxima el comportamiento del modelo comprimido al original.

La calibración se realizó con 391.569 tokens de una mezcla de preentrenamiento: texto web educativo (70%), código (15%), matemáticas (11%) y libros de texto sintéticos (4%). Cada fichero se generó en unos 6 minutos en una NVIDIA GeForce RTX 5090 Laptop GPU. No hay entrenamiento desde cero ni RLHF/DPO: el proceso es exclusivamente de compresión post-entrenamiento más un ajuste ligero de parámetros de normalización.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat de Qwen3 y modo thinking opcional (`enable_thinking`).
- Razonamiento básico y respuesta a preguntas simples; en las pruebas de chat del autor, el modelo de 3 bits respondió correctamente a preguntas sencillas y escribió código corto correcto.
- Generación de código de fragmentos cortos, con una tasa de acuerdo del 85,6% a 3 bits y 65,1% a 2 bits sobre código fuente Python (Tabla 5 del artículo).
- Soporte de tool calling y function calling heredado de Qwen3-0.6B (no verificado específicamente en la model card de RGOO).
- Capacidades multilingües heredadas del modelo base, aunque la model card solo declara inglés.
- No incluye visión ni audio.

## Casos de uso

- Distribución de modelos en entornos con ancho de banda limitado: el fichero de 3 bits ocupa 478 MB frente a 1,19 GB del original, lo que facilita la descarga y el almacenamiento en repositorios o dispositivos con cuota reducida, a cambio de decodificar a 16 bits al cargar.
- Investigación en compresión de pesos: el repositorio incluye el código `rgoo` y el artículo, lo que permite reproducir la compresión con otros modelos (`python -m rgoo compress Qwen/Qwen3-0.6B --bits 3 ...`) y comparar con GPTQ u otras técnicas.
- Pruebas de chat en terminal: el comando `python -m rgoo chat qwen3-0.6b-3bit.rgoo` permite validar cualitativamente el modelo de 3 bits en preguntas simples y código corto.
- Evaluación de degradación por cuantización: comparar el modelo de 3 bits (perplejidad 24,15, KL 0,110) con el de 2 bits (perplejidad 32,12, KL 0,479) sirve para estudiar el punto de equilibrio entre tamaño y calidad en modelos pequeños.
- Prototipado de asistentes conversacionales ligeros en inglés: el modelo de 3 bits mantiene un 82,9% de acuerdo en el siguiente token sobre posiciones reservadas, suficiente para demos y pruebas de integración con transformers.
- Docencia y experimentación con codificación entrópica: los ficheros `.rgoo` son ficheros reales con codificación entrópica, útiles para ilustrar técnicas de compresión sin pérdida aplicadas a pesos de redes neuronales.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluados sobre el flujo de validación reservado de la mezcla de calibración):

| Metrica | Original (16 bits) | RGOO 3 bits | RGOO 2 bits |
|---|---|---|---|
| Bits por número (capas lineales) | 16 | 3,01 | 2,03 |
| Bits medios por número (fichero completo) | 16 | 6,4 | 5,7 |
| Tamano del fichero | 1,19 GB | 478 MB | 424 MB |
| Acuerdo en siguiente token | 100% | 82,9% | 66,3% |
| Perplejidad | 23,02 | 24,15 | 32,12 |
| KL(original || comprimido) por token | 0 | 0,110 | 0,479 |
| Acuerdo en código Python | no disponible | 85,6% | 65,1% |

El acuerdo se mide sobre 100.352 posiciones reservadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al cargarse se decodifica a bfloat16, por lo que requiere aproximadamente la misma memoria que Qwen3-0.6B en bfloat16 (en torno a 1,2 GB de pesos más el overhead de activaciones y caché KV).
- GPU recomendadas: cualquier GPU con CUDA y al menos unos pocos GB de VRAM; el autor generó los ficheros en una RTX 5090 Laptop.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM, dado el tamaño del modelo decodificado.
- Opciones de despliegue: el código `rgoo` incluido en el repositorio (requiere PyTorch con CUDA, transformers, NumPy y SciPy); tras `rgoo.load` se obtiene un modelo de transformers estándar, por lo que `generate` y las plantillas de chat funcionan como en Qwen3-0.6B. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para el formato `.rgoo`.
- Latencia y throughput: no disponibles. La compresión ahorra almacenamiento y tamaño de descarga, no memoria ni tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Formato |
|---|---|---|---|---|---|
| RGOO-Qwen3-0.6B (3 bits) | 0,6 B | 32.768 (heredado) | 478 MB | Apache 2.0 | `.rgoo` (decodifica a bf16) |
| Qwen3-0.6B original | 0,6 B | 32.768 | 1,19 GB | Apache 2.0 | safetensors |
| RGOO-Qwen3-0.6B (2 bits) | 0,6 B | 32.768 (heredado) | 424 MB | Apache 2.0 | `.rgoo` (decodifica a bf16) |

No se dispone en la información proporcionada de comparativas con otras variantes cuantizadas de Qwen3-0.6B (por ejemplo, GPTQ, AWQ o GGUF) en términos de perplejidad o benchmarks estándar, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- Un fichero `.rgoo` se decodifica a pesos ordinarios de 16 bits al cargarse: ahorra almacenamiento y tamaño de descarga, no memoria ni tiempo de inferencia.
- La carga requiere el código `rgoo` del repositorio; transformers no puede leer ficheros `.rgoo` por sí solo.
- La evaluación se basa en un único conjunto de calibración, un único flujo reservado y una única semilla; el propio artículo señala esta limitación.
- El modelo de 2 bits comete bastantes más errores que el de 3 bits en las pruebas de chat del autor (acuerdo 66,3% frente a 82,9%; perplejidad 32,12 frente a 24,15).
- Se heredan las limitaciones de Qwen3-0.6B: es un modelo pequeño que puede equivocarse, mostrar sesgos o repetirse; no debe usarse para decisiones de alto impacto.
- La model card solo declara inglés como idioma soportado, aunque el modelo base es multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero los pesos derivados mantienen las condiciones del modelo base de Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/Argo1-OOAS/RGOO-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Artículo técnico incluido en el repositorio: `rgoo.pdf` (licencia CC BY 4.0)
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
