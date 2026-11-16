# RetentionLabs/PolyPlex-14B-Dense

## Resumen

PolyPlex-14B-Dense es un modelo de investigación desarrollado por RetentionLabs que fusiona el backbone full-duplex de PersonaPlex-7B-v1 (NVIDIA) con las capas feed-forward de Qwen3-8B, dando como resultado un transformer denso de 36 capas y 14.000 millones de parámetros. Su objetivo es dotar a un modelo de diálogo hablado full-duplex de conocimiento multilingüe textual sin necesidad de entrenar con miles de horas de audio conversacional por idioma: en lugar de eso, "lee" las capas de Qwen3-8B a través de un segundo flujo residual alineado sobre texto en 116 idiomas.

Se trata de la etapa de alineamiento denso (text-only) de un pipeline por fases que incluye ensamblaje, adaptación duplex y adaptación al habla. No es un modelo conversacional listo para producción: sus flujos de audio, decodificador de profundidad y gestión de turnos son los de PersonaPlex sin modificar, y solo ha sido entrenado sobre texto. Es relevante como punto de partida para investigación en modelos duplex multilingües y como estudio de cómo un modelo de habla puede leer el conocimiento de un LLM textual.

El repositorio contiene código, configuración, tokenizer y processor, pero **los pesos no están subidos todavía**: se publicarán tras verificar logit a logit que el modelo liberado coincide con el entrenado. Los pesos de la release anterior (PolyPlex-14B-Base) fueron retirados por no ser compatibles con este código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con doble flujo residual (backbone PersonaPlex + capas FFN de Qwen3-8B) |
| Parámetros totales | 14.000 millones (aproximado, según nombre del modelo) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (ventana de atención deslizante de 3.000 frames en el backbone) |
| Tipos de cuantización | Pesos backbone en NVFP4; no se detallan otras cuantizaciones |
| Idiomas soportados | Multilingüe; alineado en texto en 116 idiomas; listados: en, ko, ja, zh, ru, ar, hi |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | Pesos no publicados aún; backbone en NVFP4; requiere transformers >= 5.14 |

## Arquitectura y entrenamiento

La arquitectura parte de las 32 capas de PersonaPlex y añade 4 capas adicionales (copias de las últimas 4), totalizando 36 capas con hidden size de 4.096. Cada capa contiene dos módulos feed-forward: el MLP con compuerta de PersonaPlex y el MLP con compuerta de Qwen3-8B del mismo índice de capa. La atención es la de PersonaPlex (32 cabezas, ventana deslizante de 3.000 frames) con RMSNorm por cabeza en queries y keys en todas las capas; las capas 32-35 usan la atención de Qwen3-8B. El embedding rotatorio tiene periodo 10.000 en todas las capas. El vocabulario textual es de 223.973 tokens con una LM head de 224.000 filas, y el audio usa el códec Mimi (8 codebooks por flujo, 12,5 frames por segundo) con el decodificador de profundidad de PersonaPlex.

La innovación central son los dos flujos residuales: cada capa mantiene el flujo `h` de PersonaPlex y un segundo flujo `q` para la capa FFN de Qwen3, ambos en coordenadas de PersonaPlex. Las salidas de atención y de ambos feed-forward se escriben en los dos flujos mediante coeficientes aprendidos por dimensión que además dependen del token, de modo que la contribución de Qwen3 varía según la entrada. La capa FFN de Qwen3 se pliega con una rotación ortogonal `R` ajustada una sola vez por Procrustes ortogonal entre los residuales de ambos modelos, por lo que no se almacena rotación alguna. Los coeficientes que escriben la salida de Qwen3 en `h` arrancaron en 0, de forma que el entrenamiento partió exactamente de PersonaPlex. En las capas 7-23, la FFN de Qwen3 se ajustó con una actualización de bajo rango (rango 1 común más rango 16 ortogonal) y una rotación de rango 16 en su salida, ambas integradas en los pesos. Los tokens nuevos del vocabulario comparten coeficientes de composición entre la tabla de entrada, la LM head y la tabla de texto del decodificador de profundidad: cada fila nueva es su propia fila más una combinación de 32 filas de Helium. El entrenamiento de esta etapa se realizó únicamente sobre texto en 116 idiomas; no se detallan el número de tokens ni la composición del dataset.

## Capacidades

- Extracción de características y generación de texto (pipeline: text-generation, feature-extraction).
- Alineamiento multilingüe sobre texto en 116 idiomas, con listado explícito de en, ko, ja, zh, ru, ar, hi.
- Backbone full-duplex heredado de PersonaPlex (streams de audio, decodificador de profundidad y gestión de turnos), pero sin entrenamiento conversacional en esta etapa.
- Códec de audio Mimi con 8 codebooks por flujo a 12,5 frames por segundo (infraestructura de audio presente, no adaptada al habla en esta release).
- Punto de partida para entrenamiento duplex en nuevos idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documenta modo thinking, visión ni otras capacidades especiales.

## Casos de uso

- Investigación en modelos duplex multilingües: usar PolyPlex-14B-Dense como inicialización para la fase de adaptación duplex en idiomas nuevos, aprovechando que el backbone ya lee conocimiento textual de Qwen3 en 116 idiomas.
- Estudio de transferencia de conocimiento entre LLM textual y modelo de habla: analizar cómo el segundo flujo residual y los coeficientes dependientes del token modulan la contribución de Qwen3 a la representación de PersonaPlex.
- Base para adaptación al habla: tras la fase duplex, serviría de punto de partida para entrenar el modelo con audio en coreano (PolyPlex-14B-KE) y otras lenguas.
- Extracción de características multilingües: usar el modelo en modo feature-extraction para representaciones textuales en los idiomas cubiertos.
- Experimentación con cuantización NVFP4: evaluar el comportamiento del backbone en precisión reducida sobre hardware compatible con NVFP4.
- Reproducción académica: replicar el pipeline por fases (ensamblaje, alineamiento denso, adaptación duplex, adaptación al habla) descrito en la model card para estudiar cada etapa de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que Dense es mejor en todos los idiomas evaluados que la release anterior (PolyPlex-14B-Base), pero no se proporcionan cifras concretas en los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 14.000 millones de parámetros, en FP16 requeriría aproximadamente 28 GB y en cuantizaciones de 8 bits alrededor de 14 GB, aunque el backbone se distribuye en NVFP4.
- GPU recomendadas: no disponibles en la información proporcionada; NVFP4 requiere hardware compatible con ese formato (no especificado en la model card).
- Compatibilidad con GPU de consumo: no confirmada; los pesos aún no están publicados.
- Opciones de despliegue: transformers >= 5.14 con código personalizado (custom_code); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyPlex-14B-Dense | ~14B (denso) | No disponible | Full-duplex + texto multilingüe | NVIDIA Open Model License | Pesos pendientes de publicación |
| PersonaPlex-7B-v1 | 7B | No disponible | Diálogo hablado full-duplex | NVIDIA Open Model License | Pesos publicados |
| Qwen3-8B | 8B | No disponible | LLM textual multilingüe | No disponible en la información | Pesos publicados |

## Limitaciones y advertencias

- Los pesos no están subidos: el repositorio contiene solo código, configuración, tokenizer y processor; no es usable para inferencia hasta su publicación.
- No es un modelo conversacional: ha sido entrenado solo sobre texto; los streams de audio, el decodificador de profundidad y la gestión de turnos son los de PersonaPlex sin adaptar.
- Para conversación real se recomienda usar PersonaPlex directamente.
- Los pesos de la release anterior (PolyPlex-14B-Base) fueron retirados por incompatibilidad con el código actual y solo permanecen en el historial de commits.
- Licencia NVIDIA Open Model License: revisar sus términos antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas específicas más allá de los idiomas listados.
- Requiere transformers >= 5.14 y código personalizado, lo que puede complicar la integración en stacks estándar.
- El modelo está en fase de investigación; no hay garantías de estabilidad ni de rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RetentionLabs/PolyPlex-14B-Dense
- Modelo base PersonaPlex-7B-v1: https://huggingface.co/nvidia/personaplex-7b-v1
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper referenciado (arXiv:2509.25149): https://arxiv.org/abs/2509.25149
- Paper referenciado (arXiv:2410.00037): https://arxiv.org/abs/2410.00037
- Paper referenciado (arXiv:2602.06053): https://arxiv.org/abs/2602.06053
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Release relacionada PolyPlex-14B-CJKE: https://huggingface.co/RetentionLabs/PolyP
