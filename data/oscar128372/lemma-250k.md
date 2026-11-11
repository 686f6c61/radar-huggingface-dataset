# oscar128372/Lemma-250K

## Resumen

Lemma-250K es un modelo de lenguaje de escala extrema (248.590 parámetros totales, según los pesos en safetensors) publicado por el usuario oscar128372 en Hugging Face. Se trata de un modelo de prueba ("Test model") entrenado íntegramente en un MacBook durante 7500 pasos, con un total de 30,7 millones de tokens procesados. Su relevancia no reside en capacidades de producción, sino en servir como referencia reproducible de entrenamiento de modelos minúsculos en hardware de consumo y como punto de comparación dentro de la categoría de modelos sub-1M de parámetros.

El modelo se distribuye bajo licencia MIT, en formato safetensors, y no incluye información sobre arquitectura, tokenizador, idiomas de entrenamiento ni pipeline de inferencia en la model card. Los únicos datos de rendimiento publicados son cinco benchmarks de conocimiento y razonamiento básico (HellaSwag, ARC-Easy, ARC-Challenge, PIQA y ArithMark-3.0), con resultados en el rango del azar o ligeramente por encima en la mayoría de ellos.

Por su tamaño, Lemma-250K pertenece a la categoría de "toy models" o modelos de investigación educativa: no es adecuado para tareas generativas reales, pero sí para estudiar dinámicas de entrenamiento, curvas de aprendizaje a escala mínima y comparaciones controladas entre arquitecturas o datasets muy pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 248.590 |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, número de capas, dimensión oculta, mecanismo de atención, tokenizador ni vocabulario). La model card únicamente indica que fue entrenado en un MacBook durante 7500 pasos, procesando 30,7 millones de tokens. No se especifica la composición del dataset, si hubo fases de instrucción, RLHF, DPO ni ninguna otra técnica de alineamiento.

La innovación técnica, en este caso, es de naturaleza práctica: demostrar que es posible entrenar un modelo de ~250K parámetros de principio a fin en hardware de consumo (un portátil Apple), con un presupuesto computacional trivial. Esto lo convierte en un artefacto útil para reproducibilidad y para estudiar el efecto del tamaño de dataset y del número de pasos en modelos de escala mínima, pero no aporta ninguna técnica novedosa de arquitectura o entrenamiento según la información publicada.

## Capacidades

- Generación de texto a nivel de modelo de juguete: con 248.590 parámetros, la coherencia y fluidez esperadas son muy limitadas.
- Razonamiento básico de sentido común: evaluado en HellaSwag (28,21%) y PIQA (50,38%), con resultados cercanos al azar o ligeramente superiores.
- Razonamiento científico elemental: evaluado en ARC-Easy (27,95%) y ARC-Challenge (23,98%).
- Aritmética básica: evaluado en ArithMark-3.0 (28,90%).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas de entrenamiento).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Estudio de curvas de escalado a escala mínima: entrenar variantes de Lemma-250K con distintos volúmenes de tokens (por ejemplo, 10M, 30M, 100M) para observar cómo evolucionan HellaSwag y PIQA en modelos sub-1M, usando el MacBook como plataforma de referencia reproducible.
- Docencia y formación en entrenamiento de LLM: usar el modelo como ejemplo completo y ejecutable en un portátil para ilustrar el pipeline de tokenización, entrenamiento, evaluación y publicación en Hugging Face sin necesidad de GPUs.
- Comparación controlada de arquitecturas: al ser un modelo pequeño y de entrenamiento rápido, sirve para A/B testing de variantes arquitectónicas (por ejemplo, distintas profundidades o anchos) manteniendo fijo el presupuesto de cómputo.
- Validación de infraestructura de evaluación: integrar Lemma-250K en un harness de benchmarks (lm-evaluation-harness o similar) para verificar que el pipeline de evaluación funciona correctamente antes de lanzar modelos grandes.
- Reproducibilidad de experimentos: al estar entrenado en hardware de consumo y con licencia MIT, permite replicar exactamente el experimento y contrastar los resultados publicados (HellaSwag 28,21%, PIQA 50,38%, etc.).
- Benchmark de referencia para modelos "pico": comparar nuevos modelos de ~60K-300K parámetros (como ZeroS-Pico-v1.1 o LowOnMind-300k) contra Lemma-250K en las mismas cinco tareas para contextualizar su rendimiento.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo | Parámetros | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3.0 |
|---|---|---|---|---|---|---|
| oscar128372/Lemma-250K | 250K | 28,21% | 27,95% | 23,98% | 50,38% | 28,90% |
| fromziro/ZeroS-Pico-v1.1 | 60K | 26,19% | 26,30% | 24,57% | 51,14% | 30,50% |
| SLM-Archive/LowOnMind-300k | 297K | 25,07% | 29,00% | 23,12% | 50,22% | 29,40% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 (248.590 parámetros × 4 bytes ≈ 1 MB), por lo que cabe en cualquier GPU, CPU o incluso en memoria de un microcontrolador.
- GPU recomendadas: no se requiere GPU; el modelo se entrenó en un MacBook y la inferencia puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) y en Apple Silicon sin problema.
- Opciones de despliegue: no se especifican en la model card; al estar en safetensors, es compatible con transformers si el autor publica la configuración y el tokenizador, y con llama.cpp/Ollama solo si se convierte a GGUF y se dispone de arquitectura compatible (no confirmado).
- Latencia y throughput estimados: no disponibles; por el tamaño, la latencia sería de microsegundos a milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag | PIQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| oscar128372/Lemma-250K | 248.590 | no disponible | 28,21% | 50,38% | MIT | Hugging Face |
| fromziro/ZeroS-Pico-v1.1 | 60K | no disponible | 26,19% | 51,14% | no disponible | Hugging Face |
| SLM-Archive/LowOnMind-300k | 297K | no disponible | 25,07% | 50,22% | no disponible | Hugging Face |

Los tres modelos pertenecen a la misma categoría de "toy models" sub-1M y presentan rendimientos cercanos al azar en las tareas evaluadas. Lemma-250K obtiene el mejor HellaSwag del grupo, mientras que ZeroS-Pico-v1.1 lidera en PIQA y ArithMark-3.0 pese a tener menos de una cuarta parte de los parámetros.

## Limitaciones y advertencias

- Modelo de prueba: el propio autor lo describe como "Test model", sin vocación de uso en producción.
- Rendimiento cercano al azar: HellaSwag 28,21%, ARC-Easy 27,95%, ARC-Challenge 23,98%, PIQA 50,38% y ArithMark-3.0 28,90% indican capacidades generativas y de razonamiento muy limitadas.
- Riesgo elevado de alucinación y salidas incoherentes por la escala del modelo.
- Sin información sobre sesgos: no se documenta la composición del dataset ni posibles sesgos.
- Idiomas no especificados: no se puede garantizar ningún soporte multilingüe.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada.
- Licencia MIT: permite uso comercial, pero las capacidades del modelo hacen inviable cualquier aplicación productiva real.
- Falta de artefactos: no se documenta tokenizador, configuración de transformers ni pipeline de inferencia, lo que puede dificultar su carga directa.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de comunidad y soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oscar128372/Lemma-250K
- Modelo comparable ZeroS-Pico-v1.1: https://huggingface.co/fromziro/ZeroS-Pico-v1.1
- Modelo comparable LowOnMind-300k: https://huggingface.co/SLM-Archive/LowOnMind-300k
