# nikitastheo/v5-mixed-15k-seed43-ell-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v5-mixed-15k-seed43-ell-ell-sequential_interleaved` es un modelo de lenguaje causal de aproximadamente 97 millones de parámetros publicado por el usuario nikitastheo en Hugging Face, con arquitectura de la familia GPT-2 y pesos en formato safetensors. No es un ajuste fino de un modelo comercial, sino un entrenamiento desde cero ejecutado con el script `train_clm.py`, un script de entrenamiento causal-LM basado en Hugging Face Accelerate que no utiliza la clase `Trainer`.

El nombre del repositorio y el del tokenizer asociado (`nikitastheo/babylm-15k-ell-seed43-tokenizer`) apuntan a un experimento de tipo BabyLM: entrenamiento con un presupuesto de datos limitado, semilla 43 y una referencia a "15k". El segmento `ell` coincide con el código ISO 639-3 del griego, aunque la model card no confirma el idioma de entrenamiento. Los componentes `sequential_interleaved` y `language switch epoch: 10` sugieren un régimen de entrenamiento con cambio de distribución de datos o de idioma en la época 10.

Su relevancia es fundamentalmente académica: sirve como punto de partida reproducible para estudiar tokenizers, currículos de datos y mezcla de idiomas con un coste computacional mínimo. No se han publicado resultados de benchmarks, licencia ni lista de idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia GPT-2 (tag `gpt2`) |
| Parámetros totales | 97.049.088 (≈97 M), dato real de los safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no hay versiones GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | no disponible (el sufijo `ell` del tokenizer podría indicar griego, sin confirmación en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | transformers |
| Tamaño del repositorio | 0,8 GB |
| Tokenizer | `nikitastheo/babylm-15k-ell-seed43-tokenizer` |
| Configuración base | `model_configs/gpt_base_config.json` |
| Pasos de entrenamiento | 29.250 |
| Learning rate | 0,0001 con scheduler lineal |
| Warmup | 2.925 pasos |
| Batch size | 32 por dispositivo, acumulación de gradiente 1 (batch total 32) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con atención causal estándar, construido a partir de una configuración GPT-2 (`model_configs/gpt_base_config.json`). Con 97 millones de parámetros, se sitúa por debajo de GPT-2 small (124 M) y en un rango comparable a otros modelos pequeños de investigación. No hay información pública sobre el número de cabezas de atención, la dimensión oculta, el número de capas ni la longitud de secuencia empleada durante el entrenamiento.

El entrenamiento se realizó con `train_clm.py` sobre Hugging Face Accelerate, sin `Trainer`, durante 29.250 pasos con batch total de 32 secuencias, learning rate de 1e-4, scheduler lineal y warmup de 2.925 pasos (el 10 % del total). Multiplicando pasos por batch se obtienen 936.000 secuencias procesadas como máximo, aunque se desconoce la longitud de secuencia y, por tanto, el número real de tokens vistos. El parámetro `language switch epoch: 10` indica que en la época 10 se produjo un cambio en la composición de los datos, presumiblemente un cambio de idioma o de corpus; el sufijo `sequential_interleaved` sugiere además que los datos se presentaron entrelazados de forma secuencial en lugar de mezclados aleatoriamente. No hay información sobre el dataset utilizado, su composición, ni sobre si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias.

## Capacidades

- Generación de texto autoregresiva básica: es un modelo causal-LM puro, orientado a continuación de texto.
- No es un modelo instruct: no hay evidencia de ajuste por instrucciones, plantillas de chat ni modo de razonamiento explícito.
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 97 M sin ajuste específico no es adecuado para estos flujos.
- Capacidades multilingües: no confirmadas. El identificador `ell` del tokenizer apunta a griego, pero la model card no especifica idiomas.
- Capacidades especiales: no se documenta visión, audio, decodificación especulativa ni modos de pensamiento.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio, lo que facilita su despliegue en infraestructura estándar de Hugging Face.

## Casos de uso

- Baseline de investigación en modelos de lenguaje pequeños: sirve como referencia reproducible (semilla 43, hiperparámetros documentados) para comparar variantes de tokenizer, currículos de datos o estrategias de mezcla de idiomas en experimentos tipo BabyLM.
- Estudio de tokenizers para lenguas de bajos recursos: el tokenizer dedicado de 15k entradas permite analizar la fragmentación y la eficiencia de codificación en griego moderno u otra lengua objetivo.
- Análisis de currículos y mezcla de datos: el parámetro `language switch epoch: 10` y el esquema `sequential_interleaved` permiten estudiar el efecto del orden de presentación de los datos en el aprendizaje.
- Generación de texto de bajo coste en prototipos: con menos de 400 MB en fp32, puede ejecutarse en un portátil o una CPU para demos de autocompletado y generación de plantillas.
- Aumentación de datos sintéticos en pipelines de NLP: generación de continuaciones para preentrenar o aumentar conjuntos pequeños de texto, siempre con revisión humana posterior.
- Despliegue en el borde (edge) y dispositivos embebidos: el tamaño reducido permite inferencia en Raspberry Pi, móviles o navegador mediante conversión a GGUF/ONNX.
- Extracción de representaciones internas: los estados ocultos del modelo pueden reutilizarse como features en tareas de clasificación o agrupamiento dentro de estudios de probing lingüístico.
- Docencia y experimentación educativa: entrenamiento e inferencia completos en una única GPU consumer, útil para cursos de NLP y prácticas de ajuste de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación, y la búsqueda web no ha devuelto datos relevantes (los resultados obtenidos corresponden a un sitio de efemérides históricas, sin relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ≈388 MB en fp32, ≈194 MB en fp16/bf16, ≈97 MB en int8 y ≈50 MB en int4. A esto hay que sumar activaciones y caché KV, que en un modelo de 97 M son mínimos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4060, T4 o incluso una GTX 1650 cubren el caso sin problema; A100 y H100 quedan sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos diez años, y también en CPU con razonable velocidad de decodificación.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag del repo), `endpoints_compatible` para Hugging Face Inference Endpoints, vLLM y TGI para servir en GPU. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición; con este tamaño se espera decodificación en tiempo real en GPU consumer moderna, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `nikitastheo/v5-mixed-15k-seed43-ell-ell-sequential_interleaved` | 97 M | no disponible | no disponible | safetensors en Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | modified MIT (según su documentación pública) | safetensors/PyTorch en Hugging Face |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache-2.0 (según su documentación pública) | PyTorch en Hugging Face |
| Pythia-160M (EleutherAI) | 160 M | 2.048 tokens | Apache-2.0 (según su documentación pública) | safetensors en Hugging Face |

No hay datos de rendimiento comparado para el modelo objeto de esta ficha, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos provienen de su documentación pública habitual.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial ni de redistribución. Antes de cualquier uso en producción es necesario contactar con el autor.
- Sin benchmarks publicados: no existe evidencia objetiva de calidad, por lo que cualquier evaluación de rendimiento debe hacerse de forma local y específica para la tarea.
- Riesgo elevado de alucinación y de texto incoherente: con 97 M de parámetros y sin ajuste por instrucciones, la coherencia decae rápidamente en generaciones largas.
- Idiomas no confirmados: si el entrenamiento se limitó a griego, el rendimiento en castellano u otras lenguas será previsiblemente muy pobre o nulo.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento más allá de la ventana usada en entrenamiento, y la configuración GPT-2 típica ronda los 1.024 tokens.
- Sesgos de datos desconocidos: al no documentarse la composición del corpus, no es posible auditar sesgos de género, etnia, religión o ideología.
- Modelo de investigación sin soporte: cero descargas y cero "likes" en el momento de la consulta, sin mantenimiento ni comunidad que reporte errores.
- No apto para tareas de razonamiento, tool calling ni agentes: carece de las capacidades necesarias y de cualquier ajuste orientado a ello.
- Fecha de creación futura en los metadatos (2026-09-21): conviene verificar la integridad y procedencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v5-mixed-15k-seed43-ell-ell-sequential_interleaved
- Tokenizer asociado (referenciado en la model card): https://huggingface.co/nikitastheo/babylm-15k-ell-seed43-tokenizer
- Paper, blog, repositorio o demo oficiales: no disponible
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos correspondían a un sitio de efemérides históricas sin relación con el modelo.
