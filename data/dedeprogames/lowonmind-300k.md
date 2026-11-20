# DedeProGames/LowOnMind-300k

## Resumen

LowOnMind-300k es un modelo de lenguaje decoder-only de 296.960 parámetros, desarrollado por DedeProGames y entrenado desde cero sobre 200 millones de tokens de `HuggingFaceFW/fineweb-edu` (muestra sample-10BT). Se trata de una variante extrema de DynamicMind-Mini (8,9M de parámetros), reducida aproximadamente 30 veces, cuyo objetivo explícito no es ofrecer calidad de generación, sino explorar los límites prácticos del escalado hacia abajo: qué capacidades conserva un modelo con apenas un tercio de millón de parámetros.

El modelo emplea una arquitectura transformer con 6 capas, `hidden_size` de 64, atención GQA (4 cabezas de consulta, 2 de clave/valor, `head_dim` 16), embeddings atados, contexto de 512 tokens y un vocabulario propio de 1.024 tokens byte-level BPE. Incorpora QK-Norm por cabeza, RoPE precalculado e inicialización escalada de las proyecciones residuales, innovaciones que permiten entrenar con una tasa de aprendizaje de 2e-3 sin divergencia a esta escala.

Su relevancia es metodológica: junto con LowOnMind-1M (3,3 veces mayor, mismo tokenizador, datos, presupuesto de tokens y ratio de aspecto) forma un par controlado para estudiar el escalado en el régimen de modelos minúsculos. La ficha se publica bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, QK-Norm y RoPE precalculado |
| Parametros totales | 296.960 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (el modelo es tan pequeño que la cuantizacion no aporta ventaja practica) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`, con `custom_code`) |

Detalle adicional de arquitectura: `hidden_size` 64, `intermediate_size` 136 (2,12x hidden), 6 capas, 4 cabezas de consulta y 2 de clave/valor con `head_dim` 16, `vocab_size` 1.024, embeddings atados. Reparto de parámetros: 65.536 en el embedding atado, 231.360 en los seis bloques y 64 en la normalización final.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de seis bloques con atención de grupo (GQA 4/2) y RoPE. Respecto a su predecesor DynamicMind-Mini introduce cuatro cambios: QK-Norm (RMSNorm por cabeza sobre consultas y claves antes de RoPE, con un coste de 32 parámetros por bloque, que hace viable una tasa de aprendizaje de 2e-3), RoPE precalculado con recacheo automático para secuencias más largas que `max_position_embeddings`, inicialización escalada de residuos (`o_proj` y `down_proj` a `std / sqrt(2 * num_layers)` en lugar de 0,02 plano) y un vocabulario de 1.024 tokens, necesario para ajustar el presupuesto de parámetros (con 8.192 tokens el embedding superaría el tamaño total del modelo). El coste de ese vocabulario reducido es una compresión de aproximadamente 2,35 caracteres por token.

El entrenamiento usó 200 millones de tokens (6.103 pasos de 32.768 tokens) sobre `fineweb-edu` sample-10BT, con longitud de secuencia 512, batch de 64, AdamW (betas 0,9/0,95, weight decay 0,1), LR pico 2e-3 con decaimiento coseno hasta 2e-4, 250 pasos de warmup y clipping de gradiente 1,0. Se ejecutó en una única Tesla T4 en 43 minutos. La relación es de 673 tokens por parámetro, unas 30 veces por encima del óptimo de Chinchilla: el modelo está limitado por parámetros, no por datos, y la pérdida de entrenamiento y validación se mantuvo dentro de 0,05 durante toda la ejecución, sin sobreajuste apreciable. No se documenta RLHF, DPO ni ajuste fino posterior.

## Capacidades

- Generación de texto a nivel de continuación estadística: produce fragmentos gramaticales localmente coherentes, sin coherencia global sostenida.
- Ortografía aprendida como proceso: al no existir como tokens palabras como "increasingly", "guidelines" o "deployment", el modelo las compone correctamente a partir de cuatro o cinco fragmentos del vocabulario de 1.024 tokens.
- Modelado de lenguaje base: pérdida de validación de 3,2982 nats/token, perplejidad de 27,06 y 2,03 bits por carácter.
- Razonamiento de sentido común, cuantitativo, lógico y conocimiento del mundo: presentes solo a nivel marginal, con precisiones entre el 22% y el 34% en el benchmark BananaMind Base 1.1.
- Tool calling / function calling: no soportado.
- Capacidades de agente y razonamiento multi-paso: no soportadas.
- Multilingüismo: no soportado; solo inglés.
- Modo thinking, visión, audio: no disponibles.

## Casos de uso

- Investigación sobre límites de escalado: usar el par LowOnMind-300k / LowOnMind-1M como referencia controlada para medir qué capacidades emergen entre 0,3M y 1M de parámetros con datos y tokenizador idénticos.
- Docencia y divulgación de arquitecturas transformer: el modelo entrena en 43 minutos en una T4 y cabe en cualquier GPU consumer, lo que permite reproducir el pipeline completo de preentrenamiento en un aula o taller.
- Pruebas de infraestructura de inferencia: validar integraciones con `transformers` y código personalizado (`custom_code`) en pipelines de CI sin coste de GPU significativo.
- Experimentos de tokenización: estudiar el efecto de un vocabulario byte-level de 1.024 tokens sobre la compresión (2,35 caracteres/token) y la calidad de la ortografía generada.
- Benchmarking de harnesses de evaluación: el modelo sirve como línea base de "nivel azar" (Elo 833 frente a 805 de azar en BananaMind Base 1.1) para calibrar evaluaciones de modelos base.
- Generación de texto de relleno o sintético en tests: producir continuaciones cortas para pruebas de UI o de formato en entornos donde la calidad semántica es irrelevante y el coste de cómputo debe ser mínimo.
- Estudio de estabilidad de entrenamiento: analizar el efecto de QK-Norm y la inicialización escalada de residuos sobre la tolerancia a tasas de aprendizaje altas (2e-3) en modelos de muy pocos parámetros.

## Benchmarks y rendimiento

Resultados de modelado de lenguaje:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 3,2982 nats/token |
| Perplejidad de validacion | 27,06 |
| Bits por caracter | 2,03 |

Resultados en BananaMind Base Bench 1.1 (350 ítems de probabilidad de continuación en inglés, sin truncamiento de contexto contra la ventana de 512 tokens):

| Categoria | Precision | Precision ponderada | Elo |
|---|---:|---:|---:|
| language_completion | 46,0% | 52,5% | 921 |
| commonsense | 34,0% | 35,6% | 848 |
| quantitative | 32,0% | 35,0% | 938 |
| logical_reasoning | 24,0% | 25,4% | 905 |
| world_knowledge | 22,0% | 21,6% | 728 |
| code_completion | 14,0% | 15,0% | 789 |
| context_tracking | 14,0% | 15,9% | 707 |

| Metrica global | Valor |
|---|---:|
| Elo global | 833 |
| Elo a nivel de azar (esta rejilla de ítems) | 805 |
| Precision bruta | 26,6% |
| Intervalo de confianza del 95% | [22,0%, 31,2%] |
| z frente a azar | +0,69 |
| Precision ponderada | 27,9% |
| Azar | 25,0% |

El resultado global no se distingue estadísticamente del azar (z = +0,69). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (296.960 parámetros, aproximadamente 1,2 MB de pesos); el cuello de botella es el runtime, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una Tesla T4 (la misma usada para el entrenamiento); también es viable en CPU.
- GPU consumer: cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 3060 o superiores; el modelo completo ocupa menos de un megabyte.
- Opciones de despliegue: `transformers` (requiere `custom_code` por la arquitectura personalizada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; dado el tamaño, la conversión a GGUF sería trivial pero no está publicada.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo de 6.103 pasos en una T4 tomó 43 minutos, lo que da una idea del orden de magnitud del coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Notas |
|---|---:|---:|---:|---|---|
| LowOnMind-300k | 296.960 | 512 | 1.024 | Apache 2.0 | Objeto de este análisis; Elo 833 en BananaMind Base 1.1 |
| LowOnMind-1M | ~1M (3,3x) | No disponible | 1.024 (mismo tokenizador) | Apache 2.0 | Par controlado con idénticos datos, tokens y ratio de aspecto |
| DynamicMind-Mini | 8,9M | No disponible | No disponible | No disponible | Predecesor del que deriva; ~30x mayor |

No se dispone de datos de benchmarks de LowOnMind-1M ni de DynamicMind-Mini en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellos. No se han identificado otros modelos comparables de escala sub-millón con datos públicos en la información disponible.

## Limitaciones y advertencias

- Calidad de generación muy baja: el resultado global en BananaMind Base 1.1 (Elo 833) no se distingue del azar (z = +0,69); la coherencia es local, no global.
- Alucinación estructural: el modelo produce texto gramaticalmente plausible pero semánticamente vacío o incorrecto, como muestra el ejemplo de la model card.
- Contexto muy limitado: 512 tokens, insuficiente para la mayoría de tareas de producción con documentos o conversaciones largas.
- Solo inglés: no soporta castellano ni otros idiomas.
- Vocabulario de 1.024 tokens: la compresión de 2,35 caracteres/token implica secuencias más largas en tokens y limita la eficiencia; la perplejidad no es comparable con modelos de vocabulario estándar.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no apto para pipelines de agentes ni automatización de tareas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no ofrece utilidad práctica para producción más allá de experimentación e investigación.
- Requiere `custom_code` en `transformers`: la carga no es estándar y puede romper con actualizaciones de la librería; conviene fijar versiones.
- Sin datos de sesgo: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones optimizadas para despliegue en runtimes ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DedeProGames/LowOnMind-300k
- Modelo par a mayor escala: https://huggingface.co/DedeProGames/LowOnMind-1M
- Predecesor: https://huggingface.co/DedeProGames/DynamicMind-Mini
- Perfil del autor: https://huggingface.co/DedeProGames
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Benchmark utilizado: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
