# JoaoZaokk/Inkling-2-Mini-Heretic-GGUF

## Resumen

Inkling-2-Mini-Heretic-GGUF es una cuantización GGUF del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario JoaoZaokk. Se trata de una variante "abliterated" (también llamada "uncensored" o "heretic") del modelo base, en la que se han proyectado fuera las direcciones de activación asociadas a las respuestas de rechazo, reduciendo drásticamente la tasa de negativas del modelo sin reentrenarlo desde cero. El resultado es un modelo conversacional y multimodal (image-text-to-text) que mantiene buena parte de las capacidades de razonamiento del original.

El modelo base Inkling-2-Mini, desarrollado por Thinking Machines, emplea una arquitectura poco habitual: un transformer con núcleo MoE "looped" (repetido en profundidad), 128 expertos por capa con top-k=8, atención híbrida de ventana deslizante y atención completa con sesgo relativo, y un predictor multi-token nativo (DSpark) para decodificación especulativa. Con 33.300 millones de parámetros totales y unos 2.130 millones activos por capa física, está diseñado para ejecutarse en una única GPU de consumo.

La relevancia de esta ficha radica en dos factores: por un lado, el contexto de 1.048.576 tokens y el motor de decodificación especulativa que el autor reporta por encima de 250 tok/s en una RTX 3090; por otro, la modificación "heretic" que elimina la mayoría de los rechazos, lo que tiene implicaciones importantes tanto de utilidad como de seguridad que conviene evaluar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo "looped" en profundidad (P=3 pasadas, 48 visitas de capa), atención híbrida SWA + full attention, ShortConv causal, AttnRes, predictor multi-token DSpark |
| Parametros totales | 26.070.390.272 (~26,07 B según safetensors; la model card del autor indica 33,3 B) |
| Parametros activos | ~2,13 B por capa física (MoE top-k=8 sobre 128 expertos) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | GGUF (repo con múltiples cuantizaciones; se mencionan NVFP4 y Q8_0 en kernels CUDA personalizados); no se detalla la lista completa de ficheros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors BF16/NVFP4/MXFP8 en el repo hermano |

## Arquitectura y entrenamiento

El núcleo del modelo base es un transformer con un esquema de repetición en profundidad: un preludio de 6 capas (blk.0–5), un núcleo "looped" de 12 capas (blk.6–17) que se ejecuta tres veces compartiendo pesos mediante controladores aprendidos de rango 64 (loop_down, loop_forget, loop_gain), y una coda de 6 capas (blk.18–23), sumando 48 visitas de capa en total. Cada capa del MoE contiene 128 expertos con activación top-k=8 y una función de compuerta acotada denominada SITU. Las primeras capas se cuantizan de forma nativa en NVFP4 (E2M1 con escalas de bloque E4M3 de tamaño 16) y la coda en MXFP8/Q8_0.

La atención combina un patrón 5:1 entre ventana deslizante (W=1.024, 40 visitas) y atención completa (8 visitas) con sesgo relativo aprendido de 16 dimensiones y attention sinks, lo que permite el contexto de 1M tokens. Además, incorpora capas ShortConv causales de 4 taps que envuelven K, V, la salida de atención y la proyección down del FFN, y un mecanismo AttnRes que mezcla representaciones de bloques previos mediante consultas softmax en profundidad.

El modelo incluye un predictor multi-token nativo (DSpark, en mtp.safetensors): un transformer borrador no causal de 8 tokens en bloques, con 2 capas (1 SWA + 1 full), condicionado por mezclas de características del modelo objetivo y una cabeza Markov recurrente de rango 256 que comparte los embeddings de entrada y la matriz de salida. Esta pieza habilita la decodificación especulativa que el autor reporta como motor de alto rendimiento.

Sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se proporciona información en la documentación disponible. La modificación "heretic" de esta variante no es un reentrenamiento: es una abliteración multi-frontera que proyecta subespacios de rechazo en las activaciones pre-ShortConv de las 48 visitas de capa, calibrada con trazas dañinas, benignas y de razonamiento GSM8K.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento con modo "thinking" nativo (nivel de esfuerzo configurable, p. ej. 0.9 en los ejemplos del autor).
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text).
- Generación de código: el autor reporta 100 % de pass@1 en Python en su evaluación interna.
- Razonamiento matemático con cadena de pensamiento (GSM8K CoT reportado al 93,75 %).
- Decodificación especulativa nativa mediante el predictor DSpark (hasta 8 tokens borrador por bloque).
- Reducción drástica de rechazos: 1,25 % de rechazo directo en chat y 3,75 % en modo thinking según el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no confirmado explícitamente; la model card menciona servicio multi-agente concurrente (8–24 agentes) a nivel de infraestructura, no de capacidades del modelo.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistentes conversacionales de dominio abierto: el modelo mantiene conversaciones multi-turno con contexto de 1M tokens, adecuado para sesiones largas o documentación extensa adjunta sin truncar.
- Análisis de documentos e imágenes combinados: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en un mismo prompt.
- Generación de código en pipelines de desarrollo: el autor reporta alto pass@1 en Python; encaja en tareas de autocompletado, generación de tests o refactorización asistida.
- Razonamiento matemático y analítico: el modo thinking con esfuerzo configurable permite tareas de cadena de pensamiento para problemas de varios pasos, con terminación controlada del razonamiento.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, sirve para estudiar cómo se distribuyen las direcciones de rechazo en arquitecturas MoE con núcleo repetido, y para comparar comportamiento frente al modelo base.
- Despliegue en una única GPU de consumo: el autor valida la ejecución en una RTX 3090 de 24 GB con cuantización, lo que permite prototipado local sin infraestructura de centro de datos.
- Servicio concurrente de agentes: la model card describe agregados de 508–610 tok/s con 8–24 agentes concurrentes, útil para entornos de simulación o evaluación por lotes.
- Fine-tuning o destilación de comportamiento: la licencia Apache 2.0 permite usar los pesos como base para experimentos derivados.

## Benchmarks y rendimiento

Los datos siguientes provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

| Metrica | Resultado reportado |
|---|---|
| Rechazo directo en chat | 1,25 % |
| Rechazo en modo thinking (global) | 3,75 % |
| Rechazo en modo thinking (effort=high) | 2,50 % |
| GSM8K CoT accuracy | 93,75 % |
| Python coding pass@1 | 100,00 % |
| XSTest false refusal | 0,00 % |
| Terminación completa del razonamiento | 97,5 % |
| KLD | 0,0360 |
| WikiText-2 PPL | 8,607 |
| Throughput turbo DSpark (1× RTX 3090, 280 W) | 258–306 tok/s |
| Throughput full P=3 DSpark | 114–131 tok/s |
| Throughput multi-agente (8–24 agentes) | 26–38+ tok/s por agente (508–610 tok/s agregado) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desglosada por cuantización; el autor valida la ejecución en una RTX 3090 de 24 GB con cuantización GGUF y kernels personalizados.
- GPU recomendadas: RTX 3090 (24 GB) como referencia validada; para el modelo completo en BF16 se necesitaría bastante más memoria (el repo ocupa 146,9 GB incluyendo todos los ficheros).
- Cabe en GPU de consumo: sí, según el autor, en una RTX 3090 con las cuantizaciones adecuadas.
- Opciones de despliegue: llama.cpp (el autor publica un parche `llama_inkling2_sm86.patch` y un parche de backend sampling), y presumiblemente cualquier runtime compatible con GGUF; vLLM, TGI u Ollama no se mencionan explícitamente.
- Latencia y throughput: 258–306 tok/s en modo turbo DSpark y 114–131 tok/s en modo completo sobre una RTX 3090 a 280 W, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Heretic-GGUF | ~26–33 B (MoE, ~2,13 B activos) | 1M | Apache 2.0 | Variante abliterated, GGUF, decodificación especulativa DSpark |
| Inkling-2-Mini (base) | ~33,3 B (MoE) | 1M | Apache 2.0 | Modelo original de Thinking Machines, sin abliterar |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina la mayoría de los rechazos: el modelo responderá a peticiones que el modelo base rechazaría, lo que supone un riesgo de seguridad relevante en despliegues públicos.
- Los benchmarks reportados (pass@1, GSM8K, tasas de rechazo) proceden del autor y no han sido verificados de forma independiente.
- Riesgo de alucinación no cuantificado en la documentación; el modo thinking puede producir cadenas de razonamiento largas y potencialmente erróneas.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- El contexto de 1M tokens puede degradar la calidad en el extremo superior; no se aportan evaluaciones de aguja en pajar.
- Discrepancia entre el recuento de parámetros de safetensors (26,07 B) y el de la model card (33,3 B); conviene verificar el tamaño real de los pesos antes de planificar el despliegue.
- El rendimiento reportado depende de parches CUDA personalizados para sm_86 y de kernels NVFP4/Q8_0; sin ellos, el throughput será inferior.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated conlleva responsabilidad legal y reputacional sobre el contenido generado.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a prompts adversarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoaoZaokk/Inkling-2-Mini-Heretic-GGUF
- Repositorio hermano (safetensors BF16/NVFP4/MXFP8): https://huggingface.co/JoaoZaokk/Inkling-2-Mini-Heretic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Parche llama.cpp sm_86: `patches/llama_inkling2_sm86.patch` (referenciado en la model card)
- Parche backend sampling PR: `patches/llama_cpp_backend_sampling_pr.patch` (referenciado en la model card)
- Papers, blogs o demos adicionales: no disponible
