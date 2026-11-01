# mradermacher/Qwen3-8B-abliterated-bf16-public-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo Qwen3-8B-abliterated-bf16-public, generadas por mradermacher mediante el flujo habitual de cuantización con imatrix. Se trata de una variante "abliterated" del Qwen3 de 8.000 millones de parámetros, es decir, una versión en la que se ha aplicado una técnica de ablación de direcciones de rechazo en el espacio de activaciones para reducir el comportamiento de negativa a responder determinadas peticiones. El autor original del modelo base es ashwin-sreedhar, y mradermacher se limita a producir los pesos cuantizados en formato GGUF para su uso con llama.cpp y derivados.

El modelo subyacente pertenece a la familia Qwen3, con arquitectura transformer densa (no MoE) de aproximadamente 8.000 millones de parámetros, aunque la información disponible en el repositorio no detalla la longitud de contexto ni la composición exacta del entrenamiento. La relevancia de esta ficha radica en que permite ejecutar una variante sin restricciones de rechazo del Qwen3-8B en hardware de consumo, algo que interesa a desarrolladores que investigan comportamiento de modelos, generación creativa sin filtros o evaluación de sesgos.

La información pública del repositorio es extremadamente limitada: no hay model card descriptiva, no se declaran licencia ni idiomas, y el número de descargas y likes es cero en el momento de la consulta. El tamaño del repo reportado es de 0,0 GB y el recuento de parámetros en safetensors (2.657.484) no es coherente con un modelo de 8B, lo que sugiere un error en los metadatos o un repositorio incompleto. Todos estos extremos se reflejan como "no disponible" o con la advertencia correspondiente en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (familia Qwen3); detalles no disponibles |
| Parametros totales | ~8.000 millones (según nombre del modelo); metadatos de safetensors reportan 2.657.484, dato inconsistente |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en bf16 |

## Arquitectura y entrenamiento

El modelo base es una variante "abliterated" de Qwen3-8B. La técnica de abliteración consiste en identificar la dirección en el espacio de activaciones asociada al comportamiento de rechazo y proyectarla fuera de los pesos o de las activaciones, de modo que el modelo pierda la tendencia a negarse a responder ciertas peticiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original Qwen3-8B; estos datos deberían consultarse en la documentación oficial de Qwen.

Las cuantizaciones de este repositorio se han generado con el flujo de mradermacher, que emplea cuantización ponderada con imatrix (matriz de importancia) para mejorar la fidelidad de los pesos cuantizados respecto a la cuantización uniforme. El repositorio incluye tanto cuantizaciones K-quant clásicas como variantes IQ (importancia), cubriendo desde IQ1_S (aproximadamente 1 bit por peso) hasta Q6_K. No se documentan innovaciones arquitectónicas adicionales más allá de las propias del Qwen3 original.

## Capacidades

- Generación de texto y razonamiento general, heredadas del Qwen3-8B base.
- Generación de código y matemáticas, presumiblemente con el nivel del Qwen3-8B original (no verificado en este repositorio).
- Comportamiento "abliterated": reducción de rechazos ante peticiones que el modelo original declinaría, lo que puede incluir contenido sensible.
- Soporte de tool calling y function calling: no confirmado en este repositorio; depende de las capacidades del modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en este repositorio.
- Capacidades multilingües: no disponibles en los metadatos.
- Modo thinking: no confirmado; Qwen3 introduce modos de razonamiento en algunas variantes, pero no se verifica aquí.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo la abliteración afecta a la tasa de negativas y a la calidad de las respuestas en comparación con el Qwen3-8B original, usando las distintas cuantizaciones para ajustar el coste computacional del experimento.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera temáticas que el modelo original rechazaría; las cuantizaciones Q4_K_M o Q5_K_M ofrecen un equilibrio razonable entre calidad y tamaño.
- Evaluación de sesgos y robustez: al eliminar la capa de rechazo, el modelo expone con más claridad los sesgos subyacentes del entrenamiento, lo que resulta útil en auditorías de seguridad.
- Despliegue en hardware de consumo: las cuantizaciones Q4_0, Q4_K_S o IQ4_XS permiten ejecutar un modelo de 8B en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, para prototipado local.
- Generación de código en local: con cuantizaciones Q5_K_M o Q6_K se puede usar el modelo como asistente de código offline en entornos sin acceso a API, siempre que se valide la calidad frente al Qwen3-8B oficial.
- Experimentos de destilación o fine-tuning: las cuantizaciones de baja precisión (IQ2, IQ3) sirven para pruebas rápidas de pipelines antes de pasar a los pesos bf16 completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~8B parámetros):
  - Q2_K / IQ2: ~3-3,5 GB.
  - Q3_K_M / IQ3: ~4-4,5 GB.
  - Q4_K_M / IQ4_XS: ~5-5,5 GB.
  - Q5_K_M: ~6-6,5 GB.
  - Q6_K: ~7-7,5 GB.
  - bf16 (modelo base): ~16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100, H100. Para cuantizaciones Q4-Q5 basta con 8-12 GB de VRAM.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB o incluso GPUs de 8 GB con cuantizaciones Q3 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habría que usar los pesos bf16 del modelo base.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-abliterated (este repo, GGUF) | ~8B | No disponible | No disponible | GGUF | Variante sin rechazo, cuantizada por mradermacher |
| Qwen3-8B (original) | ~8B | No disponible en esta ficha | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo oficial con alineación de seguridad |
| Llama 3.1 8B | ~8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa densa de tamaño similar con contexto largo |
| Mistral 7B | ~7B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa algo menor, ampliamente cuantizada |

La comparación de rendimiento no está disponible porque no se han publicado benchmarks de esta variante abliterated. La licencia del modelo base Qwen3-8B es presumiblemente Apache 2.0, pero la licencia de esta variante no se declara en el repositorio.

## Limitaciones y advertencias

- La abliteración elimina o reduce la capa de rechazo, lo que implica que el modelo puede generar contenido sensible, ofensivo o inseguro sin las salvaguardas del Qwen3 original. No es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo elevado de alucinación, como en cualquier modelo de 8B, agravado por la falta de benchmarks que validen la calidad tras la abliteración.
- Los metadatos del repositorio son inconsistentes: el recuento de parámetros en safetensors (2.657.484) no corresponde a un modelo de 8B, y el tamaño del repo figura como 0,0 GB. Conviene verificar la integridad de los archivos antes de usarlos en producción.
- No se declara licencia, idiomas ni contexto; el uso comercial queda en un limbo legal hasta confirmar la licencia del modelo base y del derivado.
- El modelo está pensado para investigación y experimentación; no se recomienda su despliegue en producción sin una evaluación propia de seguridad y calidad.
- La cuantización introduce pérdida de fidelidad respecto al bf16, especialmente en las variantes IQ1 e IQ2, que pueden degradar el razonamiento y la coherencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-8B-abliterated-bf16-public-i1-GGUF
- Modelo base (autor original): https://huggingface.co/ashwin-sreedhar/Qwen3-8B-abliterated-bf16-public
- Familia Qwen3 (documentación oficial): no disponible en la búsqueda
- Repositorio de llama.cpp: no disponible en la búsqueda
- Repositorio de Ollama: no disponible en la búsqueda
