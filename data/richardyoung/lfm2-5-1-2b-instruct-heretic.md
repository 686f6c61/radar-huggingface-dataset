# richardyoung/LFM2.5-1.2B-Instruct-heretic

## Resumen

LFM2.5-1.2B-Instruct-heretic es una versión «decensored» (abliterated) del modelo instructivo LiquidAI/LFM2.5-1.2B-Instruct, publicada por el usuario richardyoung. Se ha generado con Heretic v2.0.0.dev0, una herramienta que aplica ablación direccional sobre los pesos para eliminar la dirección de rechazo aprendida, de modo que el modelo deja de negarse a responder a determinadas peticiones. Según la ficha del autor, los rechazos bajan de 98/100 en el modelo original a 3/100, con una divergencia KL de 0,0585 respecto al original.

El modelo subyacente pertenece a la familia LFM2.5 de Liquid AI, diseñada para despliegue en dispositivo (edge). Es un transformer híbrido de 1,17B parámetros y 16 capas: 10 bloques de convolución con doble compuerta y 6 bloques de atención con consultas agrupadas (GQA). Ofrece 32.768 tokens de contexto y un vocabulario de 65.536 entradas.

Su interés actual reside en combinar un tamaño muy reducido, ejecutable en CPU y NPU con menos de 1 GB de memoria en cuantización, con la ausencia de mecanismos de rechazo del original, algo relevante para investigación en seguridad, red teaming o análisis de contenido sensible. La contrapartida es que la abliteración es una intervención no supervisada sobre los pesos y no cuenta con validación comunitaria: cero descargas y cero «likes» en la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM2.5: 10 bloques de convolución con doble compuerta + 6 bloques de atención GQA |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Peso nativo en safetensors; el modelo original ofrece GGUF, ONNX y MLX 8-bit. Los niveles concretos de cuantización GGUF no están detallados en la información disponible |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano y espanol |
| Licencia | lfm1.0 (licencia personalizada; el campo `license` de HuggingFace figura como `other`). Los términos exactos y la política de uso comercial no están detallados en la información disponible |
| Formato de pesos | safetensors (repositorio de 2,3 GB; precisión exacta no indicada, consistente con bf16/fp16) |
| Capas | 16 |
| Tamano de vocabulario | 65.536 |
| Corte de conocimiento | Mediados de 2024 |
| Parametros de generacion recomendados | temperature 0.1, top_k 50, repetition_penalty 1.05 |
| Plantilla de chat | Formato tipo ChatML (`<|im_start|>`, `<|im_end|>`) |

## Arquitectura y entrenamiento

La arquitectura LFM2.5 combina bloques de convolución con doble compuerta (double-gated convolution) y bloques de atención con consultas agrupadas, una disposición híbrida pensada para reducir el coste computacional y la memoria en inferencia sobre hardware limitado. El modelo base se preentrenó con un presupuesto ampliado de 10T a 28T tokens y pasó por un proceso de aprendizaje por refuerzo multi-etapa antes de la fase instructiva. El corte de conocimiento es de mediados de 2024.

La intervención de este repositorio es una ablación direccional de rechazo aplicada con Heretic v2.0.0.dev0 sobre las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas seleccionadas, con los parámetros publicados en la ficha (`direction_index` 10.04, `max_weight`/`min_weight` y sus posiciones y distancias por módulo). El autor declara que el proceso es reproducible y que el paquete de reproducción está incluido en el directorio `reproduce` del repositorio. El coste medido de la intervención es una divergencia KL de 0,0585 frente al modelo original, lo que indica una desviación no nula de la distribución de salida.

## Capacidades

- Generación de texto conversacional en modo instructivo, con plantilla de chat tipo ChatML.
- Multilingüismo en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Contexto de 32.768 tokens, apto para conversaciones multi-turno largas y para inserción de documentación extensa.
- Orientado por el autor a tareas agénticas, extracción de datos y RAG.
- Ejecución en dispositivo (edge): inferencia en CPU y NPU con menos de 1 GB de memoria en cuantización.
- Decodificación especulativa mediante el drafter DSpark (296M), que según el autor acelera la decodificación unas 2,1 veces con salidas idénticas.
- Ausencia práctica de rechazos: 3/100 en la métrica de refusals del autor, frente a 98/100 del modelo original.
- No dispone de modo de razonamiento explícito: la familia cuenta con una variante separada (LFM2.5-1.2B-Thinking) para ese fin.
- Modelo exclusivamente de texto: no procesa visión ni audio, a diferencia de las variantes VL y Audio de la misma familia.
- No se documenta en la información disponible un formato explícito de tool calling o function calling.

## Casos de uso

- Inferencia en el borde sin GPU: el modelo cabe en menos de 1 GB de memoria en cuantización y el autor reporta 239 tok/s de decodificación en CPU AMD y 82 tok/s en NPU móvil, lo que permite asistentes locales en portátiles, mini-PC y dispositivos móviles.
- Asistentes conversacionales multi-turno: con 32.768 tokens de contexto puede mantener diálogos largos manteniendo el hilo de la conversación sin recortar el historial de forma agresiva.
- RAG sobre documentación técnica: el autor lo recomienda explícitamente para recuperación aumentada; el contexto amplio permite insertar varios fragmentos recuperados junto con la pregunta.
- Extracción de datos estructurados: tareas de parseo de texto libre a campos definidos (formularios, correos, informes), donde el modelo no necesita conocimiento factual profundo sino seguir un esquema.
- Investigación en seguridad y red teaming: al haber eliminado la dirección de rechazo, sirve como sujeto de estudio para medir qué información se filtra o se genera en modelos pequeños sin alineamiento de seguridad, y para comparar con la versión original como control.
- Análisis de contenido sensible: clasificación, resumen o etiquetado de textos con lenguaje explícito, violencia o temáticas controvertidas, donde un modelo con rechazos sistemáticos produciría respuestas vacías.
- Prototipado rápido en local: al soportar llama.cpp, MLX y vLLM según la ficha del modelo base, permite iterar en un portátil sin depender de servicios en la nube.
- Agentes locales de bajo coste con decodificación especulativa: combinado con el drafter DSpark, reduce la latencia por token en bucles de agente que ejecutan muchas llamadas cortas.

## Benchmarks y rendimiento

La única información cuantitativa publicada en el repositorio es la comparación con el modelo original en dos métricas:

| Metrica | Este modelo | LiquidAI/LFM2.5-1.2B-Instruct |
|---|---|---|
| Rechazos (refusals) | 3/100 | 98/100 |
| Divergencia KL | 0,0585 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible (no hay datos de MMLU, GSM8K, HumanEval ni de evaluaciones multilingües para esta variante).

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 2,34 GB en bf16/fp16, en torno a 1,2 GB en int8 y alrededor de 0,7 GB en cuantizaciones de 4 bits (estimaciones derivadas de 1,17B parámetros; el autor indica ejecución por debajo de 1 GB de memoria en formato cuantizado).
- GPU: cualquier GPU de consumo con 4 GB o más de VRAM es suficiente en bf16; en 4 bits cabe en iGPU y en aceleradores de borde. No requiere A100 ni H100, aunque pueden usarse para servir muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí, con holgura, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o Apple Silicon con MLX.
- CPU y NPU: el autor reporta 239 tok/s de decodificación en CPU AMD y 82 tok/s en NPU móvil.
- Opciones de despliegue: Transformers y vLLM para el checkpoint nativo; llama.cpp y herramientas compatibles con GGUF; ONNX Runtime para despliegue multiplataforma; MLX para Apple Silicon (8-bit); cualquier runtime capaz de leer GGUF puede servirlo a través de Ollama.
- Caché KV: al usar GQA con solo 6 bloques de atención, el consumo de caché para 32.768 tokens es reducido en comparación con un transformer denso equivalente, aunque el valor exacto no se detalla en la información disponible.
- Aceleración opcional: el drafter DSpark de 296M permite decodificación especulativa con una mejora de aproximadamente 2,1x en velocidad según el autor, manteniendo las salidas idénticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-heretic (este) | 1,17B | 32.768 | lfm1.0 (personalizada) | safetensors |
| LiquidAI/LFM2.5-1.2B-Instruct (original) | 1,17B | 32.768 | lfm1.0 (personalizada) | safetensors, GGUF, ONNX, MLX |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | safetensors, GGUF |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad de formatos. Los datos de los modelos de terceros proceden de sus fichas públicas y deben verificarse antes de citarlos.

## Limitaciones y advertencias

- El proceso de ablación elimina la dirección de rechazo, pero no es selectivo: la divergencia KL de 0,0585 respecto al original indica un desplazamiento medible de la distribución de salida que puede afectar a la calidad general, a la adherencia a instrucciones y a la coherencia en tareas no relacionadas con el rechazo.
- La ficha del modelo original advierte de que LFM2.5-1.2B-Instruct no está recomendado para tareas intensivas en conocimiento ni para programación. Esa limitación se hereda y puede verse agravada por la ablación.
- Riesgo de alucinación propio de un modelo de 1,2B parámetros con corte de conocimiento a mediados de 2024: no debe usarse como fuente factual sin verificación externa.
- Al haber anulado los mecanismos de rechazo, el modelo puede generar contenido dañino, ilegal o explícitamente ofensivo sin filtros internos. Su uso en producción exige controles de seguridad externos y responsabilidad explícita sobre las salidas.
- Sesgos: no se publica ninguna evaluación de sesgos para esta variante. Los sesgos del modelo base y del corpus de preentrenamiento permanecen sin caracterizar.
- Licencia lfm1.0 (campo `other` en HuggingFace): no se detalla en la información disponible si permite uso comercial, si impone condiciones de atribución o si autoriza la redistribución de derivados abliterados. Debe consultarse el archivo `LICENSE` del repositorio antes de cualquier uso en producción.
- Validación comunitaria nula: cero descargas y cero «likes» en la fecha de consulta, sin informes independientes de calidad o estabilidad.
- Autoría de terceros: el modelo lo publica un usuario independiente, no Liquid AI, que no respalda esta variante.
- Cobertura idiomática desigual: aunque se declaran ocho idiomas, no hay métricas publicadas de rendimiento por idioma y el preentrenamiento está dominado por el inglés.
- Contexto limitado a 32.768 tokens, inferior al de alternativas de tamaño similar como Llama-3.2-1B-Instruct.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/LFM2.5-1.2B-Instruct-heretic
- Modelo original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Variante GGUF del original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Variante ONNX del original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX
- Variante MLX 8-bit del original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-MLX-8bit
- Drafter de decodificación especulativa DSpark: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark
- Heretic: https://heretic-project.org
- Blog de presentación de LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Plantilla de chat de LFM: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Playground de LFM: https://playground.liquid.ai/
- LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Paper de referencia (arXiv 2511.23404): https://arxiv.org/abs/2511.23404
