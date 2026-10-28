# bcckfdn/cevher2-test-16

## Resumen

cevher2-test-16 es un modelo de lenguaje de 1.513.546.496 parámetros entrenado desde cero por el usuario bcckfdn siguiendo la arquitectura de SmolLM2 (familia Llama). Se trata de un modelo denso, no MoE, con 34 capas, dimensión oculta de 1792 y un vocabulario de 65.536 tokens, diseñado para generación de texto conversacional en turco e inglés. El nombre «cevher» significa «joya» o «esencia» en turco, y la ficha del autor lo identifica como un experimento de preentrenamiento desde cero.

El modelo declara un entrenamiento sobre aproximadamente 30,47 mil millones de tokens (el dato aparece como «30.474 B» en la model card, lo que se interpreta como 30.474 millones) y reporta una mejor pérdida de validación de 2,7729. La ventana de contexto es de 8192 tokens. Al ser un modelo pequeño y de licencia Apache 2.0, resulta relevante para experimentación en entornos con recursos limitados y para el estudio de recetas de preentrenamiento en lenguas de recursos medios como el turco.

La información publicada es escasa: no hay resultados de benchmarks, no se detalla la composición del dataset ni si hubo fases de alineación (RLHF/DPO), y no consta ningún uso comunitario (0 descargas y 0 likes en el momento de la consulta). La ficha debe leerse, por tanto, como una descripción de arquitectura y configuración de entrenamiento más que como una evaluación de capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama / SmolLM2 (decoder-only) |
| Parametros totales | 1.513.546.496 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada; al ser formato safetensors, es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos de configuración reportados por el autor:

| Parametro | Valor |
|---|---|
| Capas | 34 |
| Dimensión oculta | 1792 |
| Cabezas de consulta (Q) | 28 |
| Cabezas de clave/valor (KV) | 7 |
| Vocabulario | 65.536 tokens |
| Tokens de entrenamiento | ~30.474 millones |
| Mejor pérdida de validación | 2,7729 |
| Tamaño del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de la familia Llama, con la misma configuración que emplea SmolLM2 en su variante pequeña: 34 capas, `hidden_size` de 1792 y atención con grouped-query attention (GQA), con 28 cabezas de consulta y 7 cabezas de clave/valor (ratio 4:1). Esta elección de GQA reduce el tamaño de la caché KV durante la inferencia, algo relevante para un contexto de 8192 tokens. El vocabulario es de 65.536 tokens, coherente con un tokenizador de tipo BPE orientado a turco e inglés.

El autor indica que el modelo se ha entrenado «desde cero» (pretrained-from-scratch), sin partir de pesos preentrenados de otro modelo, sobre aproximadamente 30,47 mil millones de tokens. Más allá de esa cifra y de la pérdida de validación (2,7729), no se publica información sobre la composición del corpus, la mezcla de idiomas, la estrategia de tokenización, el uso de decodificación especulativa, atención lineal u otras innovaciones técnicas. Tampoco se documenta si hubo fases de instrucción, RLHF, DPO o ajuste conversacional, pese a que la etiqueta `conversational` figura entre los tags.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, con soporte de conversaciones multiturno según la etiqueta `conversational` del autor.
- Modelo base de preentrenamiento: no consta un ajuste de instrucciones explícito, por lo que su comportamiento en tareas de seguimiento de instrucciones debe validarse empíricamente.
- Ventana de contexto de 8192 tokens, adecuada para documentos de extensión media y diálogos con historial.
- Compatible con el ecosistema `transformers` y con `text-generation-inference` (etiqueta `endpoints_compatible`), lo que facilita su despliegue como endpoint HTTP.
- Capacidad multilingüe limitada a turco e inglés; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Experimentación académica en preentrenamiento: al ser un modelo de 1,5B entrenado desde cero con licencia Apache 2.0, sirve como banco de pruebas reproducible para estudiar recetas de preentrenamiento y curvas de pérdida en turco.
- Generación de texto en turco para prototipos: útil para completar textos, resumir documentos breves o generar borradores, con la ventaja de un contexto de 8192 tokens que permite incluir documentos de varias páginas.
- Chatbot de dominio cerrado: integrado vía `text-generation-inference`, puede desplegarse como endpoint conversacional para asistentes internos, siempre que se valide su calidad con datos propios antes de exponerlo a usuarios.
- Clasificación y etiquetado asistido: con prompting few-shot sobre la ventana de contexto, puede emplearse para categorizar tickets o correos en turco e inglés, aprovechando que el coste por inferencia es bajo en una GPU consumer.
- Generación de datos sintéticos para aumento de corpus: un modelo de este tamaño puede producir texto de relleno o variaciones léxicas para entrenar clasificadores más pequeños en turco.
- Fine-tuning específico de tarea: al ser un modelo base de 1,5B en safetensors, es un punto de partida razonable para ajuste supervisado (SFT) o LoRA en tareas concretas de atención al cliente, extracción de entidades o respuesta a preguntas sobre documentación técnica.
- Despliegue en edge o en portátil: cuantizado a 4 bits (aproximadamente 0,8-1 GB), puede ejecutarse en local con llama.cpp u Ollama para tareas de generación sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la mejor pérdida de validación (2,7729) y el número de tokens de entrenamiento; no incluye MMLU, HumanEval, GSM8K, HellaSwag ni evaluaciones multilingües, ni comparaciones con otros modelos.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del número de parámetros (1,51B), no datos publicados por el autor:

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,0-3,5 GB solo para pesos, más la caché KV y el overhead del runtime.
- VRAM estimada en int8: aproximadamente 1,5-2,0 GB.
- VRAM estimada en int4 (GGUF Q4_K_M): aproximadamente 0,9-1,3 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente en cuantización de 4 u 8 bits; para bf16 en producción se recomienda una RTX 4090, L4, L40S o A100 40 GB, más por throughput y concurrencia que por memoria.
- Cabe en GPU consumer: sí, en todas las RTX de 8 GB o más, y en muchas integradas con 16 GB de memoria compartida usando cuantización de 4 bits.
- Opciones de despliegue: `transformers` (referencia del autor), `text-generation-inference` (TGI, indicado por la etiqueta `endpoints_compatible`), vLLM (compatible con arquitectura Llama), llama.cpp y Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 1,5B en bf16 sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no se ha medido para este modelo concreto.

## Comparativa con modelos similares

Datos de los modelos comparables tomados de sus fichas públicas; el rendimiento de cevher2-test-16 no se ha evaluado, por lo que la columna de rendimiento queda como «no disponible».

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento publicado |
|---|---|---|---|---|---|
| cevher2-test-16 | 1,51B | 8192 | Apache 2.0 | tr, en | No disponible (val loss 2,7729) |
| SmolLM2-1.7B | 1,71B | 8192 | Apache 2.0 | en (principalmente) | Benchmarks publicados por Hugging Face |
| Llama 3.2 1B | 1,24B | 128k | Llama 3.2 Community License | multilingüe | Benchmarks publicados por Meta |
| Qwen2.5-1.5B | 1,54B | 32k | Apache 2.0 | multilingüe (incluye turco parcial) | Benchmarks publicados por Alibaba |

La comparación relevante es con SmolLM2-1.7B, del que cevher2-test-16 toma la arquitectura: mismo contexto (8192), licencia permisiva y tamaño casi idéntico, pero con un vocabulario y un corpus presumiblemente orientados al turco. Frente a Llama 3.2 1B y Qwen2.5-1.5B, la desventaja principal es la ausencia de contexto largo (128k y 32k respectivamente) y de un pipeline de alineación documentado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni evaluaciones en turco, por lo que cualquier uso en producción requiere una evaluación propia.
- Riesgo elevado de alucinación: al ser un modelo base de 1,5B sin alineación documentada, es probable que invente hechos, cite fuentes inexistentes y pierda coherencia en respuestas largas.
- Sesgos desconocidos: no se documenta la composición del corpus de entrenamiento, por lo que no es posible evaluar sesgos de género, etnia, religión o política, ni el equilibrio entre turco e inglés.
- Cobertura lingüística limitada: solo se declaran turco e inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto de 8192 tokens: insuficiente para documentos largos, recuperación sobre corpus extensos o conversaciones muy prolongadas sin estrategias de resumen.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y verificar la procedencia de los datos de entrenamiento, no documentada.
- Modelo de nicho sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública, lo que reduce la probabilidad de correcciones o mantenimiento.
- Fecha de creación anómala (2026-10-27): conviene verificar la integridad del repositorio antes de integrarlo en un pipeline.
- No se documenta tokenizador específico más allá del vocabulario de 65.536 tokens; verificar el comportamiento del tokenizador con texto turco antes de confiar en él para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-16
- Perfil del autor: https://huggingface.co/bcckfdn
- Repositorio de SmolLM2 (arquitectura de referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
