# mradermacher/Ling-3.0-tiny-CuteHuman-i1-GGUF

## Resumen

Ling-3.0-tiny-CuteHuman-i1-GGUF es una cuantización en formato GGUF del modelo Ling-3.0-tiny-CuteHuman, publicada por el usuario mradermacher. Se trata de un modelo de apenas 21.977.879 parámetros (aproximadamente 22 millones), lo que lo sitúa en la categoría de modelos ultracompactos, muy por debajo de los modelos pequeños habituales de 1-3 mil millones de parámetros. El modelo original fue publicado por el usuario wesjos, y esta versión aplica cuantizaciones de tipo "i1" (imatrix) generadas con la herramienta de cuantización de llama.cpp.

El interés de esta ficha es limitado pero concreto: se trata de un artefacto derivado de un modelo base de muy pequeño tamaño, empaquetado en múltiples niveles de cuantización (desde IQ1_S hasta Q6_K) para su uso en entornos con recursos extremadamente limitados, como microcontroladores, sistemas embebidos o pruebas de concepto de inferencia local. No hay información publicada sobre la arquitectura del modelo base, sus datos de entrenamiento, idiomas o licencia.

Dado que el repositorio no incluye model card descriptiva más allá de los metadatos de cuantización, y que el modelo base tampoco aporta información en la información disponible, esta ficha se limita a documentar lo que se puede verificar: el tamaño, el formato, los tipos de cuantización y las advertencias derivadas de la falta de información.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 21.977.879 (aprox. 22 M) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el original en safetensors |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | wesjos/Ling-3.0-tiny-CuteHuman |
| Método de cuantización | imatrix / weighted quants (i1) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Ling-3.0-tiny-CuteHuman en la documentación proporcionada. El número de parámetros (21.977.879) sugiere un transformer de escala muy reducida, pero no se puede confirmar la familia arquitectónica, el número de capas, la dimensión de los embeddings ni el mecanismo de atención empleado.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información técnica verificable es el proceso de cuantización: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que los pesos se convirtieron desde el formato Hugging Face a GGUF y posteriormente se cuantizaron con la herramienta de llama.cpp usando matrices de importancia (imatrix), lo que habitualmente mejora la calidad de las cuantizaciones de baja precisión (IQ1, IQ2, IQ3) frente a las cuantizaciones estándar.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje, pero sin datos verificables sobre calidad, coherencia o dominio.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.
- Ejecución local en hardware muy limitado: es la capacidad práctica principal del artefacto, dado su tamaño de 22 M de parámetros y su empaquetado en GGUF con cuantizaciones desde IQ1_S.

## Casos de uso

- Inferencia en sistemas embebidos y microcontroladores: con 22 M de parámetros y cuantizaciones IQ1/IQ2, el modelo puede ejecutarse en dispositivos con pocos megabytes de RAM, útil para prototipos de generación de texto en placas como Raspberry Pi Pico o ESP32 (sujeto a validación empírica de calidad).
- Pruebas de concepto de pipelines llama.cpp: sirve para validar la integración de un flujo de cuantización imatrix, carga de GGUF y decodificación antes de escalar a modelos mayores.
- Docencia y demostraciones de cuantización: permite ilustrar en clase la diferencia entre Q2_K, IQ2_XS, Q4_K_M y Q6_K sobre un mismo modelo base, con un coste computacional mínimo.
- Generación de texto auxiliar offline: para tareas de relleno o sugerencias en aplicaciones sin conectividad, donde la latencia importa más que la calidad lingüística.
- Filtrado o etiquetado ligero de texto a gran escala: si el modelo base fue entrenado para una tarea concreta (no verificable), podría emplearse en clasificación o extracción simple en entornos de bajos recursos.
- Benchmarking de herramientas de cuantización: comparar la degradación de perplejidad entre los 24 niveles de cuantización publicados sobre el mismo checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; las variantes IQ1_S e IQ2_XXS ocupan del orden de decenas de megabytes, y Q6_K se mantiene por debajo de los 100 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU sin GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en iGPU y SoCs.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput: no disponibles; por el tamaño, se espera decodificación en el orden de cientos a miles de tokens por segundo en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-CuteHuman-i1-GGUF (este) | 22 M | no disponible | no disponible | GGUF | Hugging Face |
| TinyLlama-1.1B | 1.100 M | 2.048 | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | safetensors, GGUF | Hugging Face |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparación es asimétrica: los tres modelos de referencia son entre 6 y 50 veces mayores y cuentan con documentación pública, licencia clara y benchmarks. Este artefacto no permite una comparación rigurosa por falta de datos del modelo base.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan arquitectura, datos de entrenamiento, idiomas ni evaluación.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse el repositorio del modelo base (wesjos/Ling-3.0-tiny-CuteHuman) antes de cualquier despliegue en producción.
- Riesgo elevado de alucinación y baja calidad lingüística esperable por el tamaño (22 M de parámetros), aunque no cuantificado.
- Las cuantizaciones IQ1_S, IQ1_M e IQ2_XXS degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior.
- Sin información sobre sesgos, idiomas soportados ni contexto máximo; no apto para tareas que requieran fiabilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Fecha de creación futura en los metadatos (2026-11-10), lo que sugiere un artefacto de prueba o generado automáticamente; verificar integridad antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Ling-3.0-tiny-CuteHuman-i1-GGUF
- Modelo base: https://huggingface.co/wesjos/Ling-3.0-tiny-CuteHuman
- Herramienta de cuantización (llama.cpp): https://github.com/ggerganov/llama.cpp
- Documentación de cuantizaciones GGUF: https://github.com/ggerganov/llama.cpp/blob/master/examples/quantize/README.md
