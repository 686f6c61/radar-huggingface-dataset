# amir0907/emotion2vec-12hz5-avgmax

## Resumen
`amir0907/emotion2vec-12hz5-avgmax` es un módulo de reducción temporal para el backbone de reconocimiento de emociones en habla `emotion2vec_plus_base`. Lo publica el usuario de Hugging Face amir0907 y no incluye el backbone: solo distribuye los pesos del downsampler (~1,18 M de parámetros) y el código de integración. Su función es convertir representaciones de emoción a ~50 Hz en un flujo continuo de 768 dimensiones a 12,5 Hz, con ventanas de 80 ms.

El problema que resuelve es práctico: muchas tareas de emoción continua no necesitan un frame cada 20 ms y se benefician de una secuencia 4 veces más corta, más barata de almacenar y de procesar. El módulo usa AvgMaxPool para conservar información de media y de máximo de cada ventana, en lugar de un promedio simple. Es relevante para pipelines de investigación y prototipos que ya trabajan con emotion2vec y quieren una capa de agregación temporal ligera, entrenada de forma no supervisada.

No es un modelo de lenguaje ni un clasificador de emociones: es un extractor de características intermedias. Requiere cargar por separado el backbone congelado, aplicar el preprocesado indicado —media de las últimas 4 capas, eliminación de 10 tokens extra y LayerNorm por utterance— y, después, el downsampler. La licencia del repositorio es MIT, pero los pesos del backbone siguen la licencia de FunASR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Downsampler sobre backbone `emotion2vec_plus_base` congelado; pooling AvgMax x4 y capa Linear 2·768 → 768 |
| Parámetros totales | ~1,18 M en el downsampler entrenado; ~93 M del backbone congelado, no incluido |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica a este módulo; ventana de audio de 80 ms y salida a 12,5 Hz |
| Tipos de cuantización | No disponible; no se documentan variantes GGUF, ONNX ni cuantizadas |
| Idiomas soportados | No disponible; depende del backbone emotion2vec |
| Licencia | MIT para este repositorio; el backbone congelado queda sujeto a la licencia de FunASR |
| Formato de pesos | PyTorch `.pt` (`pytorch_model.pt`); no safetensors ni GGUF |

## Arquitectura y entrenamiento
El pipeline parte de audio waveform de 16 kHz mono y lo pasa por el backbone `emotion2vec_plus_base`, que permanece congelado. De ahí se toman 8 estados de capa a ~50 Hz, se eliminan 10 tokens extra y se calcula la media de las últimas 4 capas. Antes del pooling se aplica una LayerNorm por utterance. Después, un AvgMaxPool con factor 4 reduce la secuencia a `(B, T/4, 768)` a 12,5 Hz, es decir, una representación cada 80 ms. El downsampler contiene una capa Linear de 2·768 a 768, con ~1,18 M de parámetros.

El entrenamiento es no supervisado y se basa en una pérdida de ventana: `MSE(y, mean) + 0,25·MSE(y, max)` sobre 870 ventanas solapadas de 80 ms, con validación en 201 ventanas reservadas. La inicialización reproduce exactamente un avg-pool, de modo que el ajuste parte de una base segura y estable. No se documenta RLHF, DPO ni entrenamiento con etiquetas de emoción; el objetivo es reconstruir la media y el máximo de cada ventana, no clasificar emociones.

## Capacidades
- Extracción de embeddings emocionales continuos de 768 dimensiones a 12,5 Hz a partir de audio de 16 kHz mono, usando el backbone congelado.
- Reducción temporal 4x con AvgMaxPool, que combina la media y el máximo de cada ventana de 80 ms.
- Alineación inversa al frame original mediante `ds.upsample_to(stream_12hz, target_frames=T)`.
- Integración como capa previa a clasificadores temporales, CRNN, Transformers o modelos de secuencia para emoción continua.
- No genera texto, no responde preguntas, no hace tool calling ni function calling, no soporta agentes y no tiene modo thinking, visión ni audio generativo.
- No incluye etiquetas de emoción ni probabilidades; solo representaciones latentes.
- Idiomas y dominios: no disponibles; hereda las capacidades y sesgos del backbone emotion2vec.

## Casos de uso
- Análisis de dinámica emocional en llamadas de atención al cliente: el módulo permite precalcular un stream de 12,5 Hz y detectar cambios de activación cada 80 ms, para después agregar por turno o por agente. Es adecuado porque reduce 4x la secuencia y conserva picos mediante el máximo.
- Detección de estrés o frustración en contact center: se puede usar como extractor de características para un clasificador posterior que marque segmentos de riesgo. La ventana de 80 ms permite localizar cambios sin procesar cada frame de 20 ms.
- Anotación asistida de corpus de habla emocional: al generar representaciones compactas y alineables, facilita la visualización y el etiquetado de regiones de interés en herramientas de anotación.
- Investigación en psicolingüística: permite alinear el stream de emoción con eventos como palabras, pausas o cambios de turno usando `upsample_to`, y estudiar la dinámica temporal con una resolución manejable.
- Moderación de audio en entornos colaborativos: como señal auxiliar para detectar agresividad o tensión en grabaciones, combinada con un clasificador entrenado sobre las representaciones de 768 dimensiones.
- Prototipos de agentes conversacionales empáticos: puede aportar una señal auxiliar del estado emocional del usuario en tiempo casi real, siempre que el coste del backbone sea aceptable en el despliegue.
- Biofeedback y bienestar: seguimiento de estrés en grabaciones de voz para aplicaciones no diagnósticas, con la ventaja de que el downsampler es muy ligero y puede ejecutarse en CPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card menciona un fichero `train_report.json`, pero no se incluyen métricas de validación, MSE, accuracy, F1 ni comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware
- VRAM del downsampler: inferior a 10 MB; puede ejecutarse en CPU sin problema.
- VRAM del backbone: ~0,37 GB solo para ~93 M de parámetros en FP32, como estimación a partir del número de parámetros; con activaciones, un presupuesto de 1-2 GB es razonable para inferencia por utterance, aunque no se publica una cifra oficial.
- GPU recomendadas: no requiere A100 ni H100. Cualquier GPU consumer con 2 GB o más —GTX 1650, RTX 3060, RTX 4090— es suficiente para el conjunto backbone más downsampler; el downsampler por sí solo funciona en CPU.
- Opciones de despliegue: PyTorch nativo; el backbone se carga con FunASR. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de módulo.
- Latencia y throughput: no disponibles. La salida es fija a 12,5 Hz, una representación cada 80 ms; el coste dominante es el backbone, no el downsampler.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución temporal | Salida | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `emotion2vec_plus_base` (backbone) | ~93 M | ~50 Hz | representaciones por frame | FunASR | No incluido en este repositorio |
| Avg-pool baseline | 0 entrenables | 12,5 Hz | 768 dimensiones | MIT (repositorio) | Implementación de referencia en la model card |
| `emotion2vec-12hz5-avgmax` | ~1,18 M | 12,5 Hz | 768 dimensiones | MIT (repositorio) | Incluido en este repositorio |

No se dispone de datos para comparar con clasificadores supervisados de emoción, como modelos wav2vec2 con atención o sistemas de emoción discreta, porque no se han proporcionado resultados de rendimiento en la información disponible.

## Limitaciones y advertencias
- No es un modelo autónomo: necesita el backbone `emotion2vec_plus_base` y un preprocesado muy concreto —8 estados de capa, eliminación de 10 tokens, media de las últimas 4 capas y LayerNorm por utterance—. Si no se replica exactamente, las representaciones no son válidas.
- El entrenamiento es no supervisado y solo optimiza la reconstrucción de media y máximo de ventanas de 80 ms; no está optimizado para etiquetas de emoción ni para una tarea de clasificación concreta.
- No se han publicado benchmarks ni una validación externa. El repositorio tiene 0 desc
