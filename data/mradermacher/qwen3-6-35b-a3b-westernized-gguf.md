# mradermacher/Qwen3.6-35B-A3B-Westernized-GGUF

## Resumen

`mradermacher/Qwen3.6-35B-A3B-Westernized-GGUF` es un conjunto de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo base `hirundo-io/Qwen3.6-35B-A3B-Westernized`. El identificador sugiere una variante de la familia Qwen3 con arquitectura MoE (35B parámetros totales, 3B activos) y un ajuste orientado a alinear el comportamiento del modelo con valores o estilos de respuesta "occidentalizados", aunque la model card no documenta en detalle en qué consiste dicho ajuste.

La relevancia de esta publicación es fundamentalmente práctica: ofrece los pesos listos para inferencia local con llama.cpp y derivados (Ollama, LM Studio, etc.) en múltiples niveles de cuantización, desde Q2_K hasta Q8_0 y F16. No obstante, la información disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni detalles del entrenamiento, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Conviene señalar una discrepancia importante: el dato de parámetros reportado en los metadatos de safetensors (446.571.248) no es coherente con el nombre del modelo (35B-A3B), lo que sugiere que los metadatos pueden corresponder a un componente parcial o estar mal etiquetados. Se recomienda verificar el modelo base antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según nomenclatura del nombre; detalles no disponibles) |
| Parametros totales | 35B según nombre del modelo; 446.571.248 según metadatos de safetensors (dato inconsistente) |
| Parametros activos | 3B (según nomenclatura "A3B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos por token, patrón habitual en la familia Qwen3. Sin embargo, la model card de esta publicación no aporta información sobre el número de capas, dimensión oculta, número de expertos, mecanismo de atención ni estrategia de enrutamiento.

Respecto al entrenamiento, no se documentan el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El sufijo "Westernized" sugiere un ajuste posterior del modelo base `hirundo-io/Qwen3.6-35B-A3B-Westernized` para modificar el estilo o los valores de las respuestas, pero no se especifica la metodología ni los datos empleados. Las cuantizaciones son estáticas (indicadas por los metadatos `quantize_version: 2` y `output_tensor_quantised: 1`) y se han generado con la herramienta de cuantización de llama.cpp.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.6, no documentadas explícitamente en esta publicación.
- Código y matemáticas: presumiblemente soportadas por la familia Qwen3, sin datos verificables en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de consumo con VRAM limitada, aprovechando la arquitectura MoE para reducir el coste computacional por token.
- Despliegue en CPU con llama.cpp: las variantes Q2_K y Q3_K permiten ejecución en equipos sin GPU dedicada, a costa de una pérdida de calidad que debe evaluarse empíricamente.
- Prototipado rápido de aplicaciones conversacionales: al estar en GGUF, se integra directamente en Ollama y LM Studio, lo que facilita pruebas de concepto sin infraestructura de servidor.
- Evaluación de ajustes de alineación: el sufijo "Westernized" permite comparar el comportamiento del modelo base frente a esta variante en tareas sensibles a valores culturales o estilísticos.
- Servicio de generación de texto en entornos con requisitos de privacidad: al ejecutarse en local, evita el envío de datos a APIs externas.
- Fine-tuning posterior sobre GGUF: aunque no es el flujo ideal (se recomienda partir de safetensors), permite experimentar con adaptadores LoRA sobre cuantizaciones de alta precisión como Q8_0 o F16.
- Benchmarking de cuantizaciones: el repositorio incluye 12 niveles distintos, lo que permite medir la degradación de calidad y el ahorro de memoria entre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (35B totales, 3B activos): aproximadamente 20-22 GB en Q4_K_M, 26-28 GB en Q6_K, 35-38 GB en Q8_0 y unos 70 GB en F16.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para cuantizaciones altas; RTX 4090 (24 GB) puede alojar Q4_K_M y Q5_K_S con offloading parcial.
- GPU de consumo: RTX 3090/4090 (24 GB) y RTX 4080 (16 GB) con offloading a RAM; las cuantizaciones Q2_K y Q3_K caben en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF (llama-cpp-python, KoboldCpp). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles; dependerán del hardware, del nivel de cuantización y del número de expertos activados por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Westernized (este) | 35B totales / 3B activos | no disponible | no disponible | GGUF | Variante ajustada, sin benchmarks publicados |
| Qwen3-30B-A3B | 30B totales / 3B activos | 128K (según familia Qwen3) | Apache 2.0 (según familia Qwen3) | safetensors, GGUF | Modelo base oficial de referencia |
| Mixtral 8x7B | 46B totales / 12B activos | 32K | Apache 2.0 | safetensors, GGUF | MoE más antiguo y con más parámetros activos |
| DeepSeek-V2-Lite | 16B totales / 2.4B activos | 32K | MIT | safetensors, GGUF | Alternativa MoE de menor tamaño |

La comparativa se basa en características públicas de modelos de la misma categoría; los datos del modelo de esta ficha no están verificados en la información proporcionada.

## Limitaciones y advertencias

- Inconsistencia en el recuento de parámetros: los metadatos de safetensors (446M) contradicen el nombre del modelo (35B), lo que obliga a verificar la integridad antes de usar.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base `hirundo-io/Qwen3.6-35B-A3B-Westernized` y de la familia Qwen3 original.
- Ausencia de benchmarks: no hay evidencia publicada sobre la calidad del ajuste "Westernized" ni sobre la degradación introducida por cada cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica disponible para esta variante.
- Sesgos: el ajuste "Westernized" puede introducir sesgos culturales o estilísticos no documentados.
- Idiomas: no se especifican los idiomas soportados; se desconoce si el ajuste ha degradado el multilingüismo del modelo base.
- Contexto: se desconoce la longitud máxima de contexto soportada en esta cuantización.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Producción: al no haber documentación de entrenamiento ni evaluación, no se recomienda su uso en entornos críticos sin una validación interna exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Westernized-GGUF
- Modelo base: https://huggingface.co/hirundo-io/Qwen3.6-35B-A3B-Westernized
- Herramienta de cuantización (llama.cpp): https://github.com/ggerganov/llama.cpp
- Familia Qwen3 (referencia): https://huggingface.co/Qwen
