# opencerebral/Boris-2

## Resumen

Boris-2 es un modelo de lenguaje base de 144,2 millones de parámetros desarrollado por OpenCerebral, un proyecto que entrena modelos desde cero con recursos muy limitados. El modelo se entrenó íntegramente en una única GPU NVIDIA V100 de 32 GB durante 200.000 millones de tokens, seguido de dos etapas finales cortas de ajuste con baja tasa de aprendizaje que suman 40 millones de tokens adicionales. Es la tercera iteración pública tras Boris-2-Preview-1 y Boris-2-Preview-2.

La relevancia de Boris-2 no reside en su tamaño, sino en la demostración de que es posible entrenar un modelo competitivo en la categoría de modelos pequeños con hardware de una sola GPU, mediante kernels escritos a mano para arquitecturas Volta y un diseño que incorpora dos componentes poco habituales: capas Canon (una convolución causal depthwise de 3 taps sobre la proyección QKV fusionada) y una tabla de n-gramas exacta que recupera vectores aprendidos de rango 64 para bigramas y trigramas.

Es un modelo estrictamente base: continúa texto, no sigue instrucciones ni mantiene conversaciones. Su contexto es de 2048 tokens, su vocabulario de 32.768 tokens BPE a nivel de byte y solo soporta inglés. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con capas Canon y tabla de n-gramas |
| Parámetros totales | 144.192.782 (143,7M según model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (entrenado e inferido en float32/bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code con transformers) |

Desglose adicional de parámetros: 111,9M en bloques transformer, 16,8M en embedding de tokens (atado con la salida) y 15,0M en la tabla de n-gramas. 31 capas, hidden size 512, atención multi-head completa con 8 cabezas de 64 dimensiones, MLP SwiGLU con dimensión interna 1664, RoPE con theta 10.000, vocabulario de 32.768 tokens BPE a nivel de byte entrenado específicamente para el modelo.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder causal estándar con dos modificaciones. Las capas Canon aplican una convolución causal depthwise de 3 taps a la proyección fusionada de query/key/value, de modo que cada posición mezcla las dos posiciones anteriores antes de la atención. La tabla de n-gramas realiza una búsqueda exacta sobre los últimos dos y tres ids de token (210.938 bigramas y 23.437 trigramas, sin hashing) y recupera un vector aprendido de rango 64 que se suma al flujo residual antes del bloque 2. El entrenamiento empaqueta varios documentos por secuencia, con atención, Canon y búsqueda de n-gramas enmascaradas en los límites de documento (controlado por `eos_resets_context` en la configuración).

El entrenamiento principal consumió 200.000 millones de tokens en una V100 32GB a unos 59.500 tokens por segundo, con precisión mixta float16 y flujo residual en float32. El batch fue de 524.288 tokens por paso hasta los 170.000 millones, momento en que se duplicó a 1.048.576 tras un piloto que mostró menor pérdida. El optimizador combina Muon para matrices y AdamW para embedding, tabla de n-gramas, normas y Canon. El schedule usa warmup, tasa constante hasta 174.000 millones y decaimiento 1-sqrt hasta cero en 26.000 millones de tokens. La mezcla de datos principal es aproximadamente 89-90% ClimbMix con proporciones crecientes de matemáticas (UltraData-Math L3, Orca-Math, MetaMathQA, Calc-ape210k, Calc-mawps) y, en la fase de decaimiento, Cosmopedia v2 y DCLM-Baseline. Las dos etapas finales de 40M tokens se eligieron entre unas diez candidatas evaluadas en cinco benchmarks; el autor advierte que parte del margen sobre el checkpoint de 200B puede deberse a selección sobre ruido, ya que las puntuaciones individuales varían en torno a ±0,8 puntos del índice.

## Capacidades

- Generación de texto por continuación: el modelo predice el siguiente token sin seguir instrucciones ni formato conversacional.
- Razonamiento aritmético básico: el ajuste final con datos matemáticos eleva ArithMark-3 de 42,00 a 45,10, con mejora concentrada en esta tarea.
- Comprensión lectora y sentido común a nivel de modelo pequeño: HellaSwag 50,26, ARC-Easy 59,81, ARC-Challenge 32,00, PIQA 72,91.
- Modelado de lenguaje con contexto de 2048 tokens; no hay soporte documentado de ventanas mayores.
- Sin tool calling, sin function calling y sin soporte de agentes multi-paso: es un modelo base sin post-entrenamiento instructivo.
- Multilingüismo limitado al inglés; el vocabulario y los datos están orientados a ese idioma.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Inferencia sin KV cache según la model card, lo que implica recálculo completo en cada paso de generación.

## Casos de uso

- Investigación en arquitecturas alternativas: las capas Canon y la tabla de n-gramas exacta son componentes poco frecuentes que pueden estudiarse de forma aislada, comparando su efecto frente a un transformer estándar del mismo tamaño en tareas de modelado de lenguaje.
- Reproducción de entrenamiento a pequeña escala: con 144M parámetros y una sola V100, sirve como banco de pruebas para recetas de optimización (Muon + AdamW), schedules de decaimiento y mezclas de datos matemáticos sin requerir clústeres.
- Generación de texto asistida y autocompletado en inglés: dado que continúa texto de forma coherente a nivel local, puede emplearse en tareas de completado de frases o párrafos en dominios acotados donde no se requiera instrucción.
- Evaluación comparativa de modelos pequeños: el autor publica resultados en nueve benchmarks zero-shot y el Open SLM Index, lo que facilita su uso como línea base en estudios de escalado de modelos por debajo de 200M de parámetros.
- Filtrado y puntuación de texto por perplejidad: un modelo base de este tamaño puede calcular verosimilitudes para clasificar o filtrar documentos en pipelines de curación de datos, un uso habitual de modelos pequeños entrenados con grandes volúmenes de tokens.
- Experimentación educativa: el código de modelado es PyTorch puro sin dependencias extra ni KV cache, lo que lo hace adecuado para enseñar los detalles internos de un decoder causal, RoPE, atención multi-head y convoluciones causales en un entorno manejable.
- Prototipado de decodificación y muestreo: al ser pequeño y ejecutable en CPU o GPU consumer, permite probar estrategias de generación (greedy, sampling, beam) con ciclos de iteración rápidos.

## Benchmarks y rendimiento

Resultados zero-shot con pesos en float32, según la model card. ArithMark-3 usa el script `bencharithmark-3.py` del leaderboard sin modificar.

| Benchmark | Métrica | Preview-2 | Boris-2 @200B | Boris-2 |
|---|---|---:|---:|---:|
| HellaSwag | acc_norm | 46,60 | 50,36 | 50,26 |
| ARC-Easy | acc_norm | 59,13 | 60,10 | 59,81 |
| ARC-Challenge | acc_norm | 30,20 | 32,25 | 32,00 |
| PIQA | acc_norm | 70,84 | 72,91 | 72,91 |
| ArithMark-3 | acc_norm | 42,20 | 42,00 | 45,10 |
| Open SLM Index | índice compuesto | 30,58 | 33,59 | 34,19 |

El Open SLM Index sigue la fórmula del Open SLM Leaderboard: `(N(HellaSwag,25) + N(mean(ARC-E, ARC-C),25) + N(PIQA,50) + 0,65 * N(ArithMark-3,25)) / 3,65`, con `N(v,c) = 100(v-c)/(100-c)`. La mejora del checkpoint final sobre el de 200B se concentra casi por completo en ArithMark-3 (+3,1 puntos); los otros cuatro benchmarks varían 0,3 puntos o menos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, unos 0,58 GB solo para pesos (144,2M × 4 bytes), más activaciones y buffers; en bfloat16, unos 0,29 GB para pesos. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo. El entrenamiento original usó una V100 32GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM, y probablemente en CPU con rendimiento aceptable dado el tamaño.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; la ausencia de KV cache en el código de modelado limita la eficiencia de servidores de inferencia convencionales.
- Latencia y throughput: no disponibles para inferencia. En entrenamiento se alcanzaron unos 59.500 tokens por segundo en una V100 32GB con kernels escritos a mano para Volta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Open SLM Index | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Boris-2 | 144,2M | 2048 | 34,19 | Apache 2.0 | Hugging Face |
| Boris-2 @200B | 143,7M | 2048 | 33,59 | Apache 2.0 | Checkpoint no publicado como release separado |
| Boris-2-Preview-2 | no disponible | 2048 | 30,58 | Apache 2.0 | Hugging Face |
| Boris-2-Preview-1 | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La model card menciona una comparación con otros modelos pequeños en nueve benchmarks zero-shot, pero los datos concretos de esos modelos no están incluidos en la información disponible. No se dispone de comparaciones verificadas con SmolLM, Qwen2.5-0.5B, TinyLlama u otros modelos de tamaño similar en esta ficha.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo: no sigue instrucciones, no responde preguntas de forma directa y no mantiene diálogos. Usarlo como asistente requiere post-entrenamiento adicional.
- Riesgo elevado de alucinación y de generación de texto factualmente incorrecto, especialmente fuera de los dominios representados en sus datos de entrenamiento (texto web general y matemáticas).
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés: no hay soporte documentado de otros idiomas, y el vocabulario BPE fue entrenado específicamente para inglés.
- Sin KV cache en el código de modelado, lo que implica un coste computacional mayor por token generado en secuencias largas y complica el despliegue en servidores de inferencia optimizados.
- Parte del rendimiento reportado en el checkpoint final puede deberse a selección sobre ruido (±0,8 puntos de índice), según advierte el propio autor.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código personalizado del repositorio; conviene revisarlo antes de usarlo en entornos de producción.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2
- Perfil del autor en Hugging Face: https://huggingface.co/opencerebral
- Wiki del proyecto: https://wiki.kunix.org/
- Sitio de OpenCerebral: https://oc.kunix.org/
- Boris-2-Preview-1: https://huggingface.co/opencerebral/Boris-2-Preview-1
- Boris-2-Preview-2: https://huggingface.co/opencerebral/Boris-2-Preview-2
- Resultados comparativos (CSV): https://huggingface.co/opencerebral/Boris-2/blob/main/benchmarks_comparison.csv
- Histórico de benchmarks (CSV): https://huggingface.co/opencerebral/Boris-2/blob/main/benchmarks.csv
- Licencia: https://huggingface.co/opencerebral/Boris-2/blob/main/LICENSE
