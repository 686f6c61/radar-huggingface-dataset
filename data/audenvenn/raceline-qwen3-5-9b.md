# audenvenn/raceline-qwen3.5-9b

## Resumen

raceline-qwen3.5-9b es una conversión del modelo Qwen/Qwen3.5-9B realizada por el desarrollador audenvenn para raceline, un runtime de agentes local con motor de inferencia propio orientado a Macs con Apple Silicon y aceleradores neuronales en GPU (familias M5 y M6). No se trata de un modelo nuevo ni de un fine-tune, sino de una cuantización en formato nativo del motor: pesos FP4 de 4 bits con escalas por fila y por columna (4,0 bits por peso), cuantizados con GPTQ tras una rotación de Hadamard del flujo residual plegada en los propios pesos.

La relevancia del artefacto es de infraestructura más que de modelado: incorpora la cabeza de predicción multi-token (MTP) del modelo original, que raceline aprovecha para decodificación especulativa exacta, y empaqueta tokenizer y plantilla de chat en partes de menos de 2 GB descritas por un manifiesto `qwen3.5-9b.rlm.json`. El resultado es un paquete de 4,69 GB que solo funciona con raceline 0.3.0 o superior y que no es compatible con otros runtimes como llama.cpp, vLLM u Ollama.

El modelo base, Qwen3.5-9B, aporta la arquitectura y el conocimiento; esta ficha documenta exclusivamente lo que la información disponible permite afirmar sobre la conversión, que es escasa en lo relativo al modelo original (idiomas, contexto, datos de entrenamiento y benchmarks no están publicados en la model card).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B); incluye cabeza de predicción multi-token (MTP) |
| Parametros totales | 9B (según el nombre del modelo base; no se detalla en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 con escala por fila y por columna (4,0 bits por peso), GPTQ tras rotación de Hadamard del flujo residual |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rlm` (formato nativo de raceline), dividido en partes de menos de 2 GB con manifiesto `qwen3.5-9b.rlm.json`; tamaño total 4,69 GB |

## Arquitectura y entrenamiento

El paquete no incluye un entrenamiento propio: es una conversión del modelo Qwen/Qwen3.5-9B. La model card indica que la cuantización se realizó con GPTQ sobre pesos FP4 con escalas por fila y por columna, precedida de una rotación de Hadamard del flujo residual que queda plegada en los pesos. Este tipo de rotación se emplea habitualmente para redistribuir valores atípicos antes de cuantizar a muy baja precisión, y aquí se aplica a un esquema de 4,0 bits por peso. El artefacto conserva la cabeza de predicción multi-token del modelo original, que el motor usa para decodificación especulativa exacta: la elección principal de la cabeza borrador coincide con el token siguiente-pero-uno del propio modelo en el 80,1% de los casos.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF o DPO. La innovación técnica destacable del paquete es la integración de la cuantización FP4 con rotación de Hadamard y la decodificación especulativa basada en MTP dentro del motor raceline, optimizado para los aceleradores neuronales de las GPU Apple M5 y M6.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Decodificación especulativa exacta mediante la cabeza MTP conservada del modelo base.
- Conversación con plantilla de chat incluida en el paquete.
- Compatibilidad con el runtime de agentes raceline, orientado a flujos locales en Apple Silicon.
- Capacidades de razonamiento, código, matemáticas o tool calling: no disponibles en la información proporcionada (dependen del modelo base Qwen3.5-9B, no documentadas aquí).
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Agentes locales en Mac con Apple Silicon: el paquete está diseñado para ejecutarse con raceline 0.3.0 o superior en equipos con GPU M5 o M6, de modo que un desarrollador puede levantar un agente conversacional sin depender de la nube.
- Prototipado de asistentes de chat en local: `raceline chat qwen3.5-9b` arranca una sesión de conversación con la plantilla de chat incluida, adecuado para pruebas de prompt engineering sin coste de API.
- Evaluación de decodificación especulativa: la cabeza MTP y su 80,1% de acierto en la elección del token siguiente-pero-uno permiten medir en condiciones reales el impacto de la decodificación especulativa exacta sobre la latencia.
- Investigación sobre cuantización extrema: el paquete sirve como referencia reproducible de FP4 con escalas por fila y columna y rotación de Hadamard (KL de 0,080 nats, perplejidad 2,836 y 91,1% de acuerdo top-1 frente al modelo en coma flotante sobre 1152 posiciones).
- Despliegue de un modelo de 9B en un portátil: con 4,69 GB de pesos, el artefacto cabe en el almacenamiento y, presumiblemente, en la memoria unificada de un Mac moderno, lo que facilita llevar un modelo de esta escala a un equipo personal.
- Integración en pipelines de agentes con herramientas propias: al ser un runtime de agentes, raceline está pensado para orquestar el modelo dentro de flujos con herramientas; el paquete proporciona el modelo listo para ese uso, aunque las capacidades concretas de tool calling dependen del modelo base y no se detallan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de calidad de la cuantización medidas en el momento de la conversión frente al modelo en coma flotante sobre texto reservado (1152 posiciones):

| Metrica | Valor |
|---|---|
| Divergencia KL | 0,080 nats |
| Perplejidad | 2,836 |
| Acuerdo top-1 | 91,1% |
| Acierto de la cabeza borrador (token siguiente-pero-uno) | 80,1% |

El autor remite al README de raceline para mediciones de velocidad frente a mlx-lm, pero esas cifras no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria: pesos de 4,69 GB en FP4; el consumo real de memoria unificada no está documentado.
- GPU: exclusivamente Apple Silicon con aceleradores neuronales, familias M5 y M6, según la model card.
- GPU de consumo: no aplicable a NVIDIA ni AMD; el formato `.rlm` no es compatible con otros runtimes.
- Despliegue: únicamente mediante raceline 0.3.0 o superior (`raceline pull qwen3.5-9b --source huggingface` o desde la release de GitHub, y `raceline chat qwen3.5-9b`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor remite a las mediciones del README de raceline frente a mlx-lm.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| raceline-qwen3.5-9b | 9B | no disponible | `.rlm` (FP4) | Apache-2.0 | Solo raceline en Apple M5/M6 |
| Qwen/Qwen3.5-9B (original) | 9B | no disponible | safetensors (presumiblemente) | Apache-2.0 | Múltiples (transformers, vLLM, etc.) |
| Otras cuantizaciones de Qwen3.5-9B (GGUF, MLX) | 9B | no disponible | GGUF, MLX | Apache-2.0 | llama.cpp, Ollama, mlx-lm |

La comparación se limita al modelo base y a formatos de cuantización alternativos, porque la información disponible no identifica modelos de la misma categoría con datos verificables. El rasgo diferencial de este paquete no es el rendimiento del modelo, sino el formato propietario y la integración con un motor específico para Apple Silicon.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato `.rlm` solo funciona con raceline 0.3.0 o superior; no se puede cargar en llama.cpp, vLLM, Ollama, TGI ni mlx-lm.
- Requisito de hardware estricto: solo Apple Silicon con aceleradores neuronales (M5 y M6); queda fuera cualquier Mac anterior y toda GPU NVIDIA o AMD.
- Cuantización agresiva: 4,0 bits por peso implica una pérdida medible frente al modelo en coma flotante (KL de 0,080 nats, 91,1% de acuerdo top-1), aceptable para muchos usos pero no idéntica al original.
- Falta de documentación: no se publican idiomas, longitud de contexto, datos de entrenamiento ni benchmarks del modelo base en esta model card, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base Qwen3.5-9B.
- Licencia: Apache-2.0, igual que el modelo original, lo que permite uso comercial; conviene verificar igualmente las condiciones del modelo base.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (12 de noviembre de 2026), por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audenvenn/raceline-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de raceline: https://github.com/audenvenn/raceline
- Guía de inicio rápido de raceline: https://github.com/audenvenn/raceline#quick-start
