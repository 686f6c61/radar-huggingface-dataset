# freeweight/crypto-sentiment-small

## Resumen

Crypto Sentiment (small) es un clasificador de texto multilingüe de 140,6 millones de parámetros desarrollado por freeweight, especializado en determinar la polaridad de sentimiento (bajista, neutral o alcista) en publicaciones cortas sobre criptomonedas. Se presenta explícitamente como un reemplazo directo (*drop-in replacement*) de `ElKulako/cryptobert`, manteniendo idénticos los identificadores de etiqueta (`0: Bearish, 1: Neutral, 2: Bullish`), de modo que el código existente que carga cryptobert a través de las clases `Auto*` funciona sin cambios más allá del nombre del modelo.

El modelo se construye mediante *fine-tuning* de `jhu-clsp/mmBERT-small`, un transformer de arquitectura ModernBERT con atención de longitud variable (no es un RoBERTa), y requiere `transformers >= 4.48`. Cubre 14 idiomas con evaluación en texto real (inglés, chino, coreano, japonés, turco, español, ruso, portugués, vietnamita, alemán, francés, neerlandés, polaco y ucraniano) y se entrenó además en indonesio, árabe, persa, tailandés e hindi.

Su relevancia actual radica en tres factores: licencia Apache-2.0 sin restricciones de acceso, entrenamiento exclusivamente con texto sintético (sin datos de redes sociales), y una cabeza de clasificación con temperatura calibrada integrada, lo que permite obtener probabilidades calibradas sin código adicional. Según la model card, supera a cryptobert en macro-F1 sobre 5.424 publicaciones reales en 14 idiomas (51,9 frente a 33,5), aunque el autor advierte que esas etiquetas fueron generadas por el propio modelo y no verificadas por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), base `jhu-clsp/mmBERT-small` |
| Parametros totales | 140.642.691 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos usan `max_length` de 64 y 128 tokens con truncacion) |
| Tipos de cuantizacion | ONNX fp32 (`onnx/model.onnx`), ONNX fp16 (`onnx/model_fp16.onnx`), ONNX int8 con embeddings cuantizados (`onnx/model_quantized.onnx`); transformers.js con `dtype: "q8"` |
| Idiomas soportados | en, zh, ko, ja, tr, es, ru, pt, vi, de, fr, nl, pl, uk (evaluados en texto real); entrenado tambien en id, ar, fa, th, hi (sin evaluacion en texto real) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32, fp16, int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un *fine-tuning* de `jhu-clsp/mmBERT-small` para clasificación de secuencias con tres etiquetas. No emplea atención clásica tipo RoBERTa, sino la implementación ModernBERT, lo que implica que el código que instancia directamente `RobertaForSequenceClassification` o `RobertaTokenizer` debe migrarse a las clases `Auto*`. La cabeza de clasificación incorpora una temperatura calibrada durante el entrenamiento, de modo que las probabilidades de salida ya están calibradas sin post-procesado adicional.

El entrenamiento se realizó únicamente sobre texto sintético, sin utilizar texto de redes sociales, según declara el autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset sintético ni si se aplicaron técnicas de RLHF o DPO (poco probables en un clasificador de este tipo). La validación se llevó a cabo sobre 5.424 publicaciones reales en 14 idiomas y sobre cuatro conjuntos públicos etiquetados por humanos, además del conjunto TFNS-val mencionado en la model card.

## Capacidades

- Clasificación de sentimiento de mercado en tres clases: bajista (0), neutral (1) y alcista (2), con identificadores idénticos a los de cryptobert.
- Procesamiento multilingüe en 14 idiomas evaluados en texto real y 5 adicionales solo en entrenamiento.
- Manejo de texto crudo de redes sociales: no requiere el preprocesado de cryptobert (minúsculas, eliminación de URL, @usuarios, cashtags y hashtags); acepta la publicación tal cual.
- Robustez ante emojis y jerga cripto (por ejemplo `🚀` o `📉` en los ejemplos de la model card).
- Salida de probabilidades calibradas gracias a la temperatura integrada en la cabeza de clasificación.
- Inferencia en PyTorch, ONNX Runtime (fp32, fp16, int8) y transformers.js en el navegador o Node.js.
- Compatibilidad con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni modalidades de visión o audio: es exclusivamente un clasificador.

## Casos de uso

- Sustitución directa de cryptobert en pipelines existentes: al conservar `id2label` y `label2id`, basta cambiar el nombre del modelo en el código para migrar un sistema de clasificación de sentimiento ya en producción, con la ventaja de una licencia Apache-2.0 y sin dependencia de acceso restringido.
- Monitorización de sentimiento en redes sociales cripto: el modelo procesa publicaciones cortas en 14 idiomas y permite agregar la polaridad por activo (por ejemplo, filtrando por cashtag) para construir índices de sentimiento en tiempo casi real.
- Señales auxiliares para trading algorítmico: las probabilidades calibradas permiten incorporar el sentimiento como feature numérico en modelos de predicción de precios o en sistemas de alertas, con umbrales ajustables sobre la confianza.
- Moderación y análisis de comunidades: clasificar automáticamente hilos de foros o canales de Telegram/Discord en categorías de sentimiento para priorizar la revisión humana de mensajes con alta carga bajista o alcista.
- Investigación académica en finanzas conductuales: el modelo permite etiquetar grandes corpus multilingües de mensajes cripto con una licencia permisiva y sin restricciones de uso comercial, facilitando la reproducibilidad.
- Despliegue en el navegador o en el borde: gracias a los pesos ONNX int8 y a transformers.js, puede ejecutarse en cliente (extensiones, widgets web) sin enviar el texto del usuario a un servidor, lo que ayuda con requisitos de privacidad.
- Enriquecimiento de paneles de analítica de mercado: clasificar menciones de tokens en múltiples idiomas para generar métricas de atención y tono por región, aprovechando la cobertura de 14 lenguas evaluadas.

## Benchmarks y rendimiento

| Evaluacion | Este modelo (macro-F1) | cryptobert (macro-F1) |
|---|---|---|
| 5.424 publicaciones reales en 14 idiomas (etiquetas generadas por modelo, no verificadas por humanos) | 51,9 | 33,5 |
| Conjunto real, entrada cruda, snippet de la model card | 52,8 | no disponible |
| Conjunto real, entrada en minusculas, snippet de la model card | 52,7 | no disponible |
| TFNS-val, entrada cruda | 51,7 | no disponible |
| TFNS-val, entrada en minusculas | 49,7 | no disponible |

La model card indica que, sobre cuatro conjuntos públicos etiquetados por humanos, el modelo supera a cryptobert con entrada cruda en tres y empata en el cuarto; frente a cryptobert con su propio preprocesado, el resultado es mixto (sin tabla detallada en la información disponible). También advierte que un modelo genérico de tono multilingüe supera a este modelo en tres de los cuatro conjuntos etiquetados por humanos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,56 GB solo para pesos (140,6 M de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: aproximadamente 0,28 GB de pesos; en int8, en torno a 0,14 GB más overhead.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen latencias muy bajas. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para alto throughput por lotes.
- Cabe en GPU consumer y también en CPU: el tamaño del repositorio es de 1,7 GB (incluye múltiples formatos), pero el modelo en sí es pequeño.
- Opciones de despliegue: PyTorch con `transformers`, ONNX Runtime (fp32, fp16, int8), transformers.js con `dtype: "q8"`, y text-embeddings-inference según los tags del repositorio. No se menciona soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño y la arquitectura encoder, se espera latencia de milisegundos por publicación en GPU y de decenas de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento (macro-F1 en 5.424 posts reales) |
|---|---|---|---|---|---|
| freeweight/crypto-sentiment-small | 140,6 M | no disponible | 14 evaluados + 5 entrenados | Apache-2.0 | 51,9 |
| ElKulako/cryptobert | no disponible en la informacion | no disponible | principalmente ingles | no disponible en la informacion | 33,5 |
| Modelo generico de tono multilingue (sin nombre en la model card) | no disponible | no disponible | multilingue | no disponible | supera a este modelo en 3 de 4 conjuntos etiquetados por humanos |

La comparativa se limita a los datos aportados por el autor. cryptobert es el referente directo por contrato de etiquetas; el modelo genérico de tono se menciona como alternativa cuando no se necesita el contrato de etiquetas de cryptobert.

## Limitaciones y advertencias

- Rendimiento bajo en la clase bajista: el recall para Bearish es del 22% sobre publicaciones reales, según la model card; esto puede infrarepresentar señales de venta o pesimismo en producción.
- Las etiquetas del conjunto de evaluación principal (5.424 publicaciones) fueron generadas por el propio modelo y no verificadas por humanos, por lo que la ventaja frente a cryptobert debe interpretarse con cautela.
- Un modelo genérico de tono multilingüe supera a este modelo en tres de los cuatro conjuntos etiquetados por humanos; si no se requiere el contrato de etiquetas de cryptobert, conviene revisar la evaluación antes de elegir.
- Entrenado exclusivamente con texto sintético: puede no capturar matices del lenguaje real de redes sociales, jerga emergente o ironía.
- Idiomas entrenados pero no evaluados en texto real (id, ar, fa, th, hi): el rendimiento en esos idiomas es incierto.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni otras tareas fuera de la clasificación de sentimiento.
- Requiere `transformers >= 4.48`; el código que instancia directamente clases RoBERTa debe migrarse a `Auto*`.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza; las probabilidades están calibradas, lo que ayuda a fijar umbrales, pero no elimina el error.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas, aunque conviene verificar las condiciones de los datos sintéticos de entrenamiento (no detalladas en la información disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/freeweight/crypto-sentiment-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- cryptobert (modelo de referencia): https://huggingface.co/ElKulako/cryptobert
- Repositorio de transformers.js: https://github.com/huggingface/transformers.js
- Documentación de ModernBERT en transformers: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
