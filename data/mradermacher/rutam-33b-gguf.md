# mradermacher/Rutam-33B-GGUF

## Resumen

Rutam-33B-GGUF es una compilación de cuantizaciones estáticas en formato GGUF del modelo base Anvaya-sh/Rutam-33B, publicada por el usuario mradermacher, especializado en la conversión de pesos a formatos optimizados para inferencia local. El repositorio no aporta información propia sobre el modelo original: se limita a distribuir los pesos cuantizados generados con llama.cpp (quantize_version 2), por lo que todas las características arquitectónicas, de entrenamiento y de licencia remiten al modelo fuente.

El modelo base cuenta con 33.000 millones de parámetros según su denominación, pero no se dispone de datos verificados sobre arquitectura, longitud de contexto, composición del dataset de entrenamiento ni idiomas soportados. La model card del repositorio de cuantizaciones no incluye pipeline, licencia ni idiomas declarados, y el autor no ha publicado información adicional en la información disponible.

La relevancia de esta ficha es principalmente práctica: permite a desarrolladores e investigadores acceder a los pesos en múltiples niveles de cuantización (desde Q2_K hasta Q8_0, además de F16 e IQ4_XS) para ejecutar un modelo de 33B en hardware de consumo o en servidores con VRAM limitada. Cualquier evaluación rigurosa del modelo debe hacerse contra el repositorio original Anvaya-sh/Rutam-33B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 33B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Anvaya-sh/Rutam-33B en la documentación proporcionada. El repositorio de cuantizaciones no incluye detalles sobre tipo de transformer, mecanismos de atención, posible arquitectura MoE, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO u otros).

La única información técnica disponible se refiere al proceso de conversión: los pesos se han generado con llama.cpp usando quantize_version 2, con cuantización de tensores de salida (output_tensor_quantised 1) y conversión desde formato Hugging Face (convert_type hf). Se ofrecen cuantizaciones estáticas, es decir, calculadas a partir de los pesos originales sin calibración dinámica, lo que implica que la calidad de cada nivel depende del algoritmo estándar de llama.cpp. No se ha incluido el tensor mmproj (skip_mmproj), lo que sugiere que el modelo base no es multimodal o que la parte visual no se ha portado a esta conversión.

## Capacidades

- Generación de texto: capacidad esperada por el tamaño del modelo, aunque no verificada en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; la ausencia de mmproj sugiere que no hay componente visual en esta conversión.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M y Q4_K_S permiten ejecutar un modelo de 33B en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) o en configuraciones CPU+GPU con llama.cpp, aunque el rendimiento real no está documentado.
- Despliegue en servidores con VRAM limitada: las variantes Q5_K_M, Q6_K y Q8_0 ofrecen mayor fidelidad respecto a los pesos originales para entornos con 32-48 GB de VRAM, útiles cuando no se dispone de A100/H100.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 12 niveles distintos, lo que permite medir la degradación de calidad entre Q2_K y F16 en tareas concretas, siempre que se valide contra el modelo original.
- Prototipado de aplicaciones de texto: al ser un GGUF compatible con llama.cpp, Ollama y servidores OpenAI-compatibles, puede integrarse rápidamente en pipelines de prueba sin necesidad de infraestructura GPU dedicada.
- Investigación sobre eficiencia de inferencia: útil para estudiar el equilibrio entre tamaño en disco, velocidad de generación y calidad en modelos de 33B con cuantizaciones estáticas.
- Distribución de artefactos para entornos air-gapped: el formato GGUF empaqueta pesos y tokenizador en un único fichero, lo que simplifica el despliegue en sistemas sin acceso a Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (33B parámetros, aproximada según cuantización):
  - Q2_K: ~13-14 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~15-17 GB
  - IQ4_XS: ~17-18 GB
  - Q4_K_S / Q4_K_M: ~19-21 GB
  - Q5_K_S / Q5_K_M: ~22-24 GB
  - Q6_K: ~26-27 GB
  - Q8_0: ~34-35 GB
  - F16: ~66 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y F16; RTX 3090 para Q4_K_S. Las cuantizaciones Q2_K y Q3 pueden caber en GPUs de 16 GB con offloading parcial.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K/Q3 y offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, servidores compatibles con la API de OpenAI basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa (vLLM requiere conversión o soporte experimental).
- Latencia y throughput: no disponibles; dependen del hardware y del nivel de cuantización.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma familia ni permite establecer una comparación fiable con alternativas de 33B, dado que se desconocen arquitectura, contexto, licencia y rendimiento del modelo base.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia del modelo base ni de esta conversión; el uso comercial no puede verificarse y requiere consultar el repositorio Anvaya-sh/Rutam-33B.
- La model card no declara idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Las cuantizaciones estáticas de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad respecto a F16; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación: desconocido, al no haber documentación sobre entrenamiento ni evaluaciones.
- No se incluye el tensor mmproj, por lo que no hay soporte multimodal en esta conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación (2026-11-13) es posterior a la fecha actual en la mayoría de contextos de consulta; conviene verificar la integridad y procedencia de los pesos antes de usarlos en producción.
- No se han publicado benchmarks ni comparativas oficiales; cualquier afirmación de rendimiento debe validarse empíricamente contra el modelo original.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Rutam-33B-GGUF
- Modelo base: https://huggingface.co/Anvaya-sh/Rutam-33B
