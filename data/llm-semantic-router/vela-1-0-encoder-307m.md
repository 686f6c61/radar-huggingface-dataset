# llm-semantic-router/Vela-1.0-Encoder-307M

## Resumen

Vela-1.0-Encoder-307M es un encoder multilingüe de tipo ModernBERT desarrollado por el equipo de vLLM Semantic Router (llm-semantic-router) como base para modelos especializados de enrutamiento semántico. Con 307.786.240 parámetros, se presenta como una evolución afinada de jhu-clsp/mmBERT-base, orientada a tareas de comprensión y clasificación con ventanas de contexto largas de hasta 32.768 tokens (incluyendo tokens especiales).

El modelo resuelve el problema de la representación multilingüe de alta calidad en contextos extensos, un requisito habitual en sistemas de enrutamiento que deben decidir, a partir de una consulta completa, qué modelo o pipeline atenderá la petición. Al estar entrenado sobre seis idiomas (inglés, chino, alemán, francés, japonés y árabe) y mantener la arquitectura encoder bidireccional, resulta adecuado como componente de embeddings o de masked language modeling en infraestructuras de inferencia.

Su relevancia actual radica en su licencia MIT, su compatibilidad con la librería `transformers` y su integración declarada con endpoints, lo que facilita su despliegue en producción. La model card publica una comparativa de pérdida de masked-token NLL frente al mmBERT original en ventanas de 512 a 32K tokens, con mejoras consistentes en todas las longitudes evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 307.786.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens, incluyendo tokens especiales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, de, fr, ja, ar |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Vela-1.0-Encoder-307M es un fine-tuning de jhu-clsp/mmBERT-base, un encoder multilingüe basado en la arquitectura ModernBERT. ModernBERT introduce mejoras sobre el transformer encoder clásico, como atención con rotatory positional embeddings (RoPE) y capas de atención optimizadas para secuencias largas, lo que permite extender el contexto efectivo hasta 32K tokens. El modelo conserva la naturaleza bidireccional del encoder, por lo que no está pensado para generación autoregresiva sino para representaciones contextuales y predicción de tokens enmascarados.

El entrenamiento se realizó sobre un conjunto de desarrollo multilingüe compuesto por 318 ventanas que cubren inglés, chino, alemán, francés, japonés y árabe, con objetivos de masked-token modeling sobre un 15% fijo de tokens enmascarados y en precisión FP32. La model card indica que este conjunto de desarrollo guió la selección del checkpoint, por lo que no constituye un test independiente. No se especifican en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Masked language modeling (fill-mask) multilingüe en inglés, chino, alemán, francés, japonés y árabe.
- Representaciones contextuales bidireccionales aptas para tareas de clasificación, extracción de embeddings y reranking.
- Procesamiento de secuencias largas de hasta 32.768 tokens, útil para documentos completos o conversaciones extensas.
- Base para modelos especializados de enrutamiento semántico dentro del ecosistema vLLM Semantic Router.
- Compatibilidad con la pipeline `fill-mask` de `transformers`.
- Soporte declarado de endpoints compatibles (`endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enrutamiento semántico de consultas: el encoder genera representaciones de la consulta completa (hasta 32K tokens) que un clasificador posterior utiliza para decidir qué modelo o pipeline debe atender la petición, aprovechando su entrenamiento específico para esta familia de tareas.
- Clasificación de documentos largos multilingües: permite clasificar contratos, informes o artículos en seis idiomas sin truncar el contenido, gracias a la ventana de 32K tokens.
- Reranking de resultados de búsqueda: las representaciones contextuales del encoder pueden puntuar pares consulta-documento en pipelines de recuperación aumentada (RAG), especialmente cuando los fragmentos son extensos.
- Detección de idioma y normalización de texto: su cobertura de en, zh, de, fr, ja y ar lo hace útil como paso previo en pipelines multilingües que necesitan identificar y tratar el idioma de entrada.
- Extracción de embeddings para búsqueda semántica: el modelo puede servir como backbone de un índice vectorial multilingüe, con la ventaja de procesar pasajes largos sin fragmentación agresiva.
- Filtrado y moderación de contenido: clasificación de textos completos (comentarios, hilos, documentos) en contextos donde la ventana corta de otros encoders obligaría a dividir la entrada y perder coherencia.
- Sustitución de token enmascarado en tareas de aumento de datos o corrección: la pipeline `fill-mask` permite generar hipótesis léxicas multilingües para preprocesamiento y evaluación.

## Benchmarks y rendimiento

La model card publica masked-token negative log-likelihood (menor es mejor) sobre un conjunto de desarrollo multilingüe compartido, comparando con el mmBERT32K Base original:

| Longitud de contexto | mmBERT original | Vela |
|---|---:|---:|
| 512 tokens · 156 ventanas | 1.441 | 1.387 |
| 8K tokens · 54 ventanas | 1.226 | 1.212 |
| 16K tokens · 54 ventanas | 1.206 | 1.168 |
| 32K tokens · 54 ventanas | 1.075 | 1.018 |

Las 318 ventanas cubren inglés, chino, alemán, francés, japonés y árabe. Ambos modelos se evaluaron en FP32, con el mismo objetivo fijo del 15% de tokens enmascarados y entradas completas sin truncamiento. El conjunto de desarrollo guió la selección del checkpoint de Vela, por lo que no es un test independiente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,23 GB solo para pesos (307,8M × 4 bytes), más activaciones y memoria del tokenizador; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en FP16/BF16: alrededor de 0,62 GB para pesos, con margen adicional para activaciones en contextos largos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en precisión reducida; A100, H100 o L40S para despliegues con batches grandes y secuencias de 32K tokens.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se use precisión reducida y se controle el tamaño de batch en contextos largos.
- Opciones de despliegue: `transformers` (pipeline `fill-mask`), y por su naturaleza de encoder, servidores de embeddings compatibles con `transformers`; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M | 307,8M | 32.768 tokens | 6 | MIT | Fine-tuning de mmBERT-base con mejor NLL en el conjunto de desarrollo del autor |
| jhu-clsp/mmBERT-base | no disponible | no disponible | multilingüe | no disponible | Modelo base del que deriva Vela; la model card reporta NLL superior en todas las longitudes evaluadas |
| vllm-sr/mmbert-32k-yarn | no disponible | 32K tokens (por nombre) | multilingüe | no disponible | Referenciado como "original mmBERT32K Base" en la evaluación comparativa |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría fuera del ecosistema mmBERT (por ejemplo, XLM-R o RemBERT) en parámetros, contexto y rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- El conjunto de evaluación publicado no es un test independiente: guió la selección del checkpoint, por lo que las cifras de NLL pueden estar optimistas.
- No se han publicado resultados en benchmarks estándar de comprensión, clasificación o recuperación, lo que dificulta comparar su rendimiento con encoders consolidados.
- Al ser un encoder de masked language modeling, no está diseñado para generación autoregresiva ni para tareas de razonamiento de múltiples pasos.
- La cobertura lingüística se limita a seis idiomas (en, zh, de, fr, ja, ar); el rendimiento en otros idiomas no está documentado.
- No se especifican sesgos conocidos, composición del dataset de entrenamiento ni medidas de mitigación, lo que limita la evaluación de riesgos en producción.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de predicciones léxicas incorrectas en `fill-mask` cuando el contexto es ambiguo.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base jhu-clsp/mmBERT-base antes de un uso comercial, ya que la información disponible no detalla su licencia.
- No se documentan tipos de cuantización soportados ni integraciones con motores de inferencia de alto rendimiento, lo que puede limitar el despliegue a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- mmBERT32K Base original (referencia de evaluación): https://huggingface.co/vllm-sr/mmbert-32k-yarn
- Colección Vela 1.0 Router Models: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentación: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
