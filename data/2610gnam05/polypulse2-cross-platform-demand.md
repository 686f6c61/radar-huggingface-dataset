# 2610gnam05/polypulse2-cross-platform-demand

## Resumen

PolyPulse 2.0 es un clasificador de texto basado en DeBERTa-v3-base, afinado por el usuario 2610gnam05, que estima la demanda relativa de negociación de una pregunta propuesta en mercados de predicción. Dado un texto con la plataforma (Polymarket o Kalshi), la pregunta del mercado y, opcionalmente, el evento asociado, el modelo devuelve una etiqueta de tres clases —Low, Medium o High— que representa el volumen esperado en relación con la distribución histórica de cada plataforma.

El modelo resuelve un problema acotado de inteligencia de mercado: priorizar qué preguntas merecen lanzarse antes de abrir un mercado. No es un sistema de trading autónomo ni un estimador de probabilidades; es una herramienta de apoyo a la decisión. Técnicamente es un transformer encoder de 184,4 millones de parámetros con una cabeza de clasificación de tres clases, entrenado con cross-entropy estándar durante tres épocas y con una longitud máxima de secuencia de 128 tokens.

Su relevancia es limitada pero concreta: demuestra que un encoder pequeño y barato de desplegar puede superar ampliamente a una línea base TF-IDF en esta tarea (70,47 % frente a 54,22 % de accuracy combinada, aunque con matices importantes sobre cómo se obtiene ese número). Es un modelo muy reciente (noviembre de 2026), sin descargas ni likes, y su licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (transformer encoder) con cabeza de clasificación de 3 clases |
| Parámetros totales | 184.424.451 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia en entrenamiento e inferencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-base |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | Low, Medium, High |
| Plataformas soportadas | Polymarket, Kalshi |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder DeBERTa-v3-base, que combina atención con disentangled attention y un mecanismo de embedding mejorado respecto a DeBERTa v1/v2, y le añade una cabeza lineal de clasificación de tres salidas. La entrada se construye como una cadena con formato `Platform: <plataforma> | Question: <pregunta> | Event: <evento>`, tokenizada a un máximo de 128 tokens. El mismo conjunto de pesos se emplea para ambas plataformas; la diferenciación se aplica en la fase de decisión mediante ajustes de logits específicos por plataforma, seleccionados sobre el conjunto de validación.

El afinado se realizó sobre registros históricos de mercados de predicción de Polymarket y Kalshi, incluyendo preguntas, identificador de plataforma, contexto de evento cuando estaba disponible y volumen de negociación observado. Como las unidades de volumen difieren entre plataformas (dólares reportados en Polymarket, contratos en Kalshi), las etiquetas se asignan por cuartiles relativos a la distribución de entrenamiento de cada plataforma, no en valores absolutos. El pipeline de preparación incluyó controles de elegibilidad y calidad, filtrado de mercados históricos, deduplicación de mercados y eventos, partición cronológica de train/validación/test y controles de fuga de información a nivel de evento y de pregunta.

Se evaluaron dos configuraciones: cross-entropy estándar y cross-entropy con ponderación de clases suave. Se seleccionó la primera, entrenada tres épocas con learning rate 2e-5, batch efectivo de 16 y longitud máxima de 128 tokens. La selección del checkpoint y de la estrategia de decisión se basó en accuracy de validación.

## Capacidades

- Clasificación de texto en tres clases (Low, Medium, High) sobre preguntas de mercados de predicción.
- Entrada condicionada por plataforma: distingue Polymarket y Kalshi mediante el prefijo de plataforma en el texto.
- Uso opcional de contexto de evento para enriquecer la señal de la pregunta.
- Salida con logits y scores asociados a cada clase, además de la etiqueta predicha.
- Procesamiento de preguntas en inglés exclusivamente.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- No genera texto: es un clasificador, no un modelo generativo.

## Casos de uso

- Priorización de lanzamiento de mercados: dado un lote de preguntas candidatas, el modelo las clasifica y permite ordenar por demanda esperada antes de abrir el mercado en Polymarket o Kalshi, usando el score de la clase High como criterio de ordenación.
- Filtrado previo en pipelines de creación de mercados: integrado como paso de scoring en un formulario interno, descarta preguntas con predicción Low y reduce el coste de revisión manual.
- Comparación entre plataformas: al aceptar el identificador de plataforma, permite evaluar la misma pregunta bajo Polymarket y Kalshi y observar si la demanda relativa cambia según el ajuste de logits específico.
- Análisis retrospectivo de catálogo: clasificar el histórico de preguntas de una plataforma para estudiar qué tipos de evento concentran demanda High y ajustar la política editorial de lanzamientos.
- Señal auxiliar en herramientas de inteligencia de mercado: combinada con comparaciones históricas dentro de la aplicación PolyPulse, sirve como una de varias señales en un panel de oportunidad, nunca como decisión única.
- Prototipado rápido y bajo coste: al ser un encoder de 184 M de parámetros con contexto de 128 tokens, cabe en GPU de consumo y permite iterar sobre nuevas definiciones de etiquetas o nuevos dominios de mercado con recursos mínimos.
- Investigación sobre mercados de predicción: base reproducible para experimentos de clasificación de demanda, con partición cronológica y controles de fuga documentados.

## Benchmarks y rendimiento

| Métrica | Polymarket | Kalshi | Combinado |
|---|---:|---:|---:|
| Accuracy | 66,93 % | 80,43 % | 70,47 % |
| Macro-F1 | 0,550 | 0,706 | 0,642 |
| Muestras de test | 3.000 | 1.063 | 4.063 |

| Enfoque | Accuracy combinada en test |
|---|---:|
| Línea base de clase mayoritaria | 26,36 % |
| TF-IDF + regresión logística | 54,22 % |
| DeBERTa afinado con ajustes de decisión | 70,47 % |
| DeBERTa sin ajustes (predicción neuronal cruda) | ~43,76 % |

El dato clave es que el 70,47 % incluye los ajustes de logits específicos por plataforma seleccionados sobre validación; la red neuronal por sí sola rinde aproximadamente 43,76 %, por debajo incluso del baseline TF-IDF. La comparación debe leerse con esa cautela.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,75-1 GB para los pesos (184 M de parámetros) más el overhead de activaciones con secuencias de 128 tokens; en la práctica, menos de 2 GB en total.
- VRAM estimada en fp16: aproximadamente 0,4 GB para pesos, con huella total por debajo de 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las GPU de datacenter están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch con Transformers, ONNX Runtime, TorchScript, vLLM (soporte de encoders limitado, verificar), Text Embeddings Inference de Hugging Face para clasificación, y exportación a GGUF para llama.cpp si se convierte la cabeza de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño y la longitud de secuencia, se espera un throughput alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| PolyPulse 2.0 (este modelo) | 184,4 M | 128 tokens | Clasificación de demanda en 3 clases | no disponible | HuggingFace, 0 descargas |
| microsoft/deberta-v3-base | ~184 M | 512 tokens | Modelo base generalista (MLM) | MIT | HuggingFace, ampliamente usado |
| TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | Clasificación de demanda en 3 clases | no aplica | Reproducible |
| DeBERTa-v3-base afinado genérico para clasificación financiera | ~184 M | 512 tokens | Clasificación de sentimiento o tópico | variable según checkpoint | Múltiples checkpoints en HuggingFace |

La comparación más relevante es contra el propio modelo base sin afinar y contra el baseline TF-IDF del autor: el afinado aporta una mejora sustancial sobre TF-IDF solo cuando se añaden los ajustes de decisión por plataforma. Frente a otros encoders de tamaño similar (RoBERTa-base, BERT-base), no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- El 70,47 % de accuracy combinada depende de ajustes de logits por plataforma; la red cruda rinde ~43,76 %, por debajo del baseline TF-IDF. Cualquier uso que no replique exactamente esa estrategia de decisión obtendrá resultados peores.
- El macro-F1 combinado es 0,642, con un valor de 0,550 en Polymarket: el rendimiento en la clase minoritaria es débil y el modelo puede infrarepresentar categorías poco frecuentes.
- Contexto máximo de 128 tokens: preguntas largas o con contexto de evento extenso se truncan, lo que puede eliminar información relevante.
- Solo inglés: no hay soporte multilingüe, y las preguntas en otros idiomas producirán predicciones sin garantía.
- Las etiquetas son relativas a la distribución histórica de cada plataforma, no umbrales absolutos de volumen; no son comparables entre plataformas ni extrapolables a periodos con condiciones de mercado distintas.
- Los scores no son probabilidades calibradas de éxito financiero, resolución del mercado ni rentabilidad; el autor lo indica explícitamente.
- Riesgo de deriva temporal: el modelo se entrenó con datos históricos y las distribuciones de demanda cambian; no se documenta ningún mecanismo de actualización ni evaluación fuera de muestra temporal más allá de la partición cronológica.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Modelo sin tracción: cero descargas y cero likes, sin validación independiente por parte de la comunidad.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de sobreconfianza en clasificaciones erróneas cuando la pregunta es ambigua o el evento no está bien representado en el entrenamiento.
- Los resultados de búsqueda web proporcionados no guardan relación con el modelo y no aportan información adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2610gnam05/polypulse2-cross-platform-demand
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Resultados de búsqueda web sin relación con el modelo (descartados): https://www.digika.ai/ y https://www.cryptotask.org/en
- No se han encontrado papers, blogs, repositorios ni demos asociados al modelo en la información disponible.
