# mradermacher/Qwen3.5-4B-Westernized-i1-GGUF

## Resumen

`mradermacher/Qwen3.5-4B-Westernized-i1-GGUF` es una reedición en formato GGUF de cuantizaciones del modelo `hirundo-io/Qwen3.5-4B-Westernized`, publicada por el usuario mradermacher. Se trata, por tanto, de un artefacto de distribución (quantized weights) y no de un modelo entrenado desde cero: el trabajo original corresponde a hirundo-io, mientras que esta ficha empaqueta los pesos en múltiples niveles de cuantización para su uso con llama.cpp y derivados.

El nombre sugiere una base de la familia Qwen 3.5 de aproximadamente 4 mil millones de parámetros, con algún tipo de ajuste orientado a alineamiento "occidental" (término habitual para indicar un fine-tuning que modera o reorienta respuestas respecto al modelo base). No obstante, la model card no aporta información sobre arquitectura, datos de entrenamiento, licencia ni idiomas, por lo que la mayoría de especificaciones deben considerarse no disponibles.

La relevancia práctica de esta publicación es su utilidad como artefacto listo para inferencia local: el autor incluye un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K, además de Q4_0 y Q4_1) generadas con imatrix/weighted quantization, lo que permite desplegar el modelo en hardware de consumo con distintos compromisos de calidad y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only de la familia Qwen 3.5, sin confirmar) |
| Parametros totales | no disponible (el dato safetensors de 1.797.272 corresponde a un recuento de tensores, no a parámetros; el nombre indica ~4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones para llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. La model card únicamente documenta el proceso de cuantización: se han generado cuantizaciones "weighted/imatrix" a partir del repositorio `hirundo-io/Qwen3.5-4B-Westernized`, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Estos metadatos indican que el punto de partida eran pesos en formato Hugging Face convertidos a GGUF y posteriormente cuantizados con una matriz de importancia (imatrix), técnica que reduce la pérdida de calidad en cuantizaciones agresivas (IQ1–IQ3) al ponderar los tensores según su relevancia.

No hay información sobre el número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones arquitectónicas (atención lineal, decodificación especulativa, etc.). El sufijo "Westernized" del modelo original sugiere un ajuste de alineamiento, pero su naturaleza exacta no está documentada en la información disponible.

## Capacidades

- Generación de texto autoregresiva, presumiblemente con capacidad de razonamiento y código heredada del modelo base Qwen 3.5, aunque no confirmada en la documentación.
- Soporte de cuantizaciones de 1 a 6 bits, lo que permite ajustar el equilibrio calidad/memoria en despliegues locales.
- Compatibilidad con el ecosistema llama.cpp (GGUF), lo que habilita su uso en Ollama, LM Studio, llama-cpp-python y servidores compatibles.
- Capacidades multilingües, tool calling, agentes o modos "thinking": no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en portátiles y estaciones de trabajo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~4B parámetros en GPUs de consumo (8–12 GB) o incluso en CPU con llama.cpp, manteniendo una calidad razonable para tareas de asistencia general.
- Prototipado rápido de aplicaciones de chat: al ser un GGUF ligero, se puede integrar en un servidor llama.cpp y exponer una API compatible con OpenAI para pruebas de producto sin infraestructura dedicada.
- Evaluación de alineamiento: el ajuste "Westernized" del modelo original permite comparar respuestas frente al modelo base en tareas sensibles, útil para investigación sobre sesgos y alineamiento.
- Generación de texto en entornos con recursos limitados: las variantes IQ2/IQ3 permiten desplegar el modelo en dispositivos con 4–6 GB de VRAM, adecuado para demos y entornos embebidos.
- Educación y experimentación: sirve como material didáctico para estudiar el efecto de distintas cuantizaciones (Q2 a Q6) sobre la calidad de salida en un mismo modelo.
- Pipelines de generación de borradores o resúmenes: para tareas de baja criticidad donde no se requiere el máximo rendimiento, las cuantizaciones intermedias ofrecen un coste computacional bajo.
- Base para fine-tuning ligero posterior: los pesos GGUF no son directamente entrenables, pero el repositorio original en Hugging Face sí puede servir de punto de partida para LoRA/QLoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (aproximada, para un modelo de ~4B parámetros): Q2_K ~1,5–2 GB; Q3_K_M ~2–2,5 GB; Q4_K_M ~2,5–3 GB; Q5_K_M ~3–3,5 GB; Q6_K ~3,5–4,5 GB; IQ1_S ~1 GB. Estas cifras son estimaciones basadas en el tamaño nominal del modelo y no en mediciones publicadas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 solo si se requiere throughput elevado o contexto muy largo.
- Cabe en GPU de consumo: sí, en la mayoría de configuraciones modernas con 8 GB o más para cuantizaciones Q4/Q5; las variantes IQ1–IQ3 caben en 4–6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con GGUF (p. ej. text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Westernized-i1-GGUF (este) | ~4B (según nombre) | no disponible | GGUF (multi-cuantización) | no disponible | Hugging Face |
| Modelo base `hirundo-io/Qwen3.5-4B-Westernized` | ~4B | no disponible | safetensors (presumible) | no disponible | Hugging Face |
| Otras cuantizaciones GGUF de la familia Qwen 3.5 | ~4B | no disponible | GGUF | según modelo base | Hugging Face / llama.cpp |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La información pública es mínima: no hay licencia declarada, lo que impide confirmar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo original (`hirundo-io/Qwen3.5-4B-Westernized`) antes de cualquier despliegue en producción.
- El sufijo "Westernized" implica un ajuste de alineamiento que puede introducir sesgos culturales o ideológicos; no se documenta su metodología ni su evaluación.
- Las cuantizaciones agresivas (IQ1, IQ2) degradan la calidad de forma notable; no son recomendables para tareas que requieran precisión (código, matemáticas, razonamiento complejo).
- Riesgo de alucinación inherente a modelos de ~4B parámetros, sin datos de evaluación que lo cuantifiquen.
- No se especifican idiomas soportados; el rendimiento en castellano es desconocido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación muy reciente y sin validación comunitaria.
- El dato de "parámetros totales: 1.797.272" de la metadata de safetensors no es fiable como recuento de parámetros; probablemente corresponde a tensores o a un artefacto de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Westernized-i1-GGUF
- Modelo original: https://huggingface.co/hirundo-io/Qwen3.5-4B-Westernized
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
