# nikitastheo/v2-babylm-small-afr-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v2-babylm-small-afr-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo GPT-2 con 38,5 millones de parámetros, desarrollado por el usuario nikitastheo como parte de una serie de experimentos con el corpus BabyLM. Está diseñado para la generación de texto y el modelado de lenguaje causal, y su nombre sugiere un entrenamiento intercalado secuencial entre dos idiomas (posiblemente afrikáans y griego, aunque no está confirmado en la documentación). El modelo se entrenó con un script personalizado de Hugging Face Accelerate, sin usar la clase `Trainer`, lo que indica un enfoque de investigación orientado a la reproducibilidad y al control fino del proceso de entrenamiento.

Su relevancia radica en ser un modelo pequeño y eficiente, pensado para estudiar el comportamiento de arquitecturas compactas en contextos multilingües y de bajos recursos. Al estar basado en GPT-2, hereda la arquitectura transformer estándar con atención causal, y su tamaño reducido lo hace accesible para experimentos en hardware modesto. Sin embargo, la información pública es limitada: no se especifican la licencia, los idiomas exactos, la longitud de contexto ni los resultados de benchmarks, por lo que su uso en producción requeriría una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal) |
| Parametros totales | 38.497.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP32 según safetensors) |
| Idiomas soportados | no disponible (el nombre sugiere afrikáans y griego, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, configurada mediante el archivo `model_configs/gpt_small_config.json`, que probablemente define una variante pequeña similar a GPT-2 small (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), aunque no se detallan los hiperparámetros exactos. El tokenizador utilizado es `nikitastheo/babylm-afr-tokenizer`, lo que apunta a un vocabulario adaptado al corpus BabyLM, posiblemente con énfasis en lenguas africanas y griego.

El entrenamiento se realizó con un script de Hugging Face Accelerate (`train_clm.py`) durante 23.580 pasos, con una tasa de aprendizaje de 0,0001, scheduler lineal, 2.358 pasos de warmup y un tamaño de batch de 32. Un dato destacable es el "language switch epoch" en la época 10, lo que sugiere una estrategia de entrenamiento secuencial intercalado: el modelo alterna entre idiomas en momentos específicos del entrenamiento, probablemente para estudiar la transferencia entre lenguas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto causal: el modelo produce texto autoregresivamente, dado un prompt inicial.
- Modelado de lenguaje: puede calcular la probabilidad de secuencias y servir como base para fine-tuning en tareas de PLN.
- Multilingüismo potencial: por su nombre y tokenizador, está orientado a al menos dos idiomas (posiblemente afrikáans y griego), aunque no hay documentación que lo confirme.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en multilingüismo de bajos recursos: el modelo puede usarse para estudiar cómo una arquitectura pequeña aprende representaciones compartidas entre idiomas con pocos datos, gracias a su entrenamiento intercalado.
- Fine-tuning para generación de texto en lenguas africanas o griego: al ser un modelo base, puede adaptarse a tareas específicas como resumen, traducción o diálogo en esos idiomas.
- Experimentos de eficiencia: su tamaño reducido (38,5M parámetros) permite probar técnicas de compresión, cuantización o destilación en hardware limitado.
- Educación y prototipado: sirve como ejemplo didáctico de entrenamiento de un LM causal con Accelerate, dado que el script de entrenamiento está disponible.
- Evaluación de estrategias de entrenamiento: el "language switch" puede analizarse para comparar curricula de aprendizaje multilingüe.
- Generación de texto creativo en contextos de investigación: útil para generar muestras controladas en estudios de sesgos o estilos lingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan métricas de perplejidad o accuracy con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 38,5M parámetros en FP32, el modelo ocupa aproximadamente 154 MB en memoria (38,5M × 4 bytes). Para inferencia, se necesitan al menos 1-2 GB de VRAM considerando overhead de activaciones y buffers, por lo que cabe en GPUs consumer como GTX 1060, RTX 2060 o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior ofrecería margen para batch mayores.
- Despliegue: compatible con la librería `transformers` de Hugging Face, así como con `vLLM`, `llama.cpp` (si se convierte a GGUF) y `Ollama` (tras conversión). También es compatible con el formato safetensors para carga directa.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño, se espera una latencia baja (del orden de milisegundos por token en GPUs modernas) y un throughput alto, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a la familia BabyLM, que incluye otros modelos pequeños entrenados en el corpus BabyLM (por ejemplo, `nikitastheo/babylm-ita-ell-sequential_interleaved` o `nikitastheo/babylm-lem-spa-ell-sequential_interleaved`), pero no hay datos públicos de rendimiento ni especificaciones detalladas de esos modelos. Se puede afirmar que comparte arquitectura GPT-2 y tamaño similar, pero sin métricas comparables no es posible establecer una tabla objetiva.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial sin consultar al autor.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado en un corpus limitado, es probable que presente sesgos lingüísticos y culturales, así como una tendencia a alucinar hechos o generar contenido incoherente en contextos largos.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que limita su uso en tareas que requieran memoria a largo plazo.
- Idiomas no confirmados: aunque el nombre sugiere afrikáans y griego, no hay documentación oficial; el tokenizador puede no cubrir adecuadamente otros idiomas.
- Sin evaluación de seguridad: no se han realizado pruebas de robustez frente a prompts maliciosos o de generación de contenido dañino.
- Formato de pesos en FP32: el modelo ocupa más memoria que versiones cuantizadas; para despliegue en producción sería recomendable cuantizarlo a FP16 o int8.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nikitastheo/v2-babylm-small-afr-ell-sequential_interleaved)
- [Modelo relacionado: nikitastheo/babylm-afr-ell-sequential_interleaved](https://huggingface.co/nikitastheo/babylm-afr-ell-sequential_interleaved)
- [Discusiones del modelo v2-babylm-pes-ell-sequential_interleaved](https://huggingface.co/nikitastheo/v2-babylm-pes-ell-sequential_interleaved/discussions)
- [Modelo v2-dummy-babylm-eng-ell-sequential_interleaved](https://huggingface.co/nikitastheo/v2-dummy-babylm-eng-ell-sequential_interleaved)
- [Modelo nikitastheo/babylm-ita-ell-sequential_interleaved](https://huggingface.co/nikitastheo/babylm-ita-ell-sequential_interleaved)
- [Modelo nikitastheo/babylm-lem-spa-ell-sequential_interleaved](https://huggingface.co/nikitastheo/babylm-lem-spa-ell-sequential_interleaved)
