# mradermacher/NorthCUA-Mini-GGUF

## Resumen

NorthCUA-Mini-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo NorthCUA-Mini, publicada por el usuario mradermacher, conocido en Hugging Face por convertir modelos recientes a formatos optimizados para inferencia local. El modelo base, alojado en el repositorio beipo-ai/NorthCUA-Mini, es un modelo de lenguaje conversacional de aproximadamente 34.660 millones de parámetros (según los pesos en safetensors), lo que lo sitúa en la categoría de modelos de tamaño medio-grande comparables a la familia Qwen 32B o Gemma 27B.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 34B en hardware de consumo mediante cuantizaciones de 2 a 8 bits, algo impensable con los pesos originales en precisión completa. El repositorio ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta Q8_0, además de f16 e IQ4_XS), lo que facilita adaptar el equilibrio entre calidad y requisitos de memoria a cada entorno.

No obstante, la información pública disponible es muy limitada: la model card del cuantizador es prácticamente un stub generado automáticamente y no se han publicado datos sobre arquitectura interna, datos de entrenamiento, licencia, idiomas soportados ni benchmarks. Esta ficha refleja fielmente esa escasez de información y marca como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 34.660.610.688 (≈34,7B) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (los pesos originales están en safetensors en el repo base) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base NorthCUA-Mini. Por el número de parámetros (34,7B) y por el tag "conversational" del repositorio, se trata presumiblemente de un transformer denso ajustado para diálogo, pero no hay confirmación oficial sobre si emplea atención completa, atención lineal, arquitectura híbrida o cualquier otra variante. Tampoco se conocen detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

En lo que respecta a esta publicación concreta, el trabajo realizado por mradermacher consiste en la conversión y cuantización estática de los pesos originales (convert_type: hf) a formato GGUF, con la versión de cuantizador 2 y tensores de salida cuantizados. El repositorio incluye además el tensor mmproj si el modelo base lo requiere (aunque en este caso no se especifica). No se ha documentado ninguna innovación técnica adicional más allá del propio proceso de cuantización.

## Capacidades

- Generación de texto conversacional: el tag "conversational" y el pipeline asociado indican un uso previsto para diálogo multi-turno, aunque no se detallan capacidades específicas.
- Razonamiento y código: no disponible (no se han publicado evaluaciones ni descripciones).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue de un asistente conversacional local: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en una GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 4090) o incluso en CPU con suficiente RAM, lo que permite montar un chatbot privado sin depender de APIs externas.
- Prototipado de aplicaciones de diálogo en investigación: al estar disponible en GGUF, se puede integrar rápidamente con llama.cpp u Ollama para experimentar con prompts y flujos conversacionales antes de invertir en infraestructura mayor.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes distintas, lo que permite medir empíricamente la degradación de calidad entre Q2_K y Q8_0 en tareas concretas, un caso de uso habitual en equipos de ML que calibran el trade-off memoria/calidad.
- Fine-tuning ligero sobre la versión f16: la cuantización f16 (aproximadamente 69 GB) puede servir como base para técnicas como LoRA o QLoRA en hardware con suficiente memoria, aunque el tamaño lo restringe a GPUs profesionales.
- Inferencia en entornos con restricciones de memoria: las variantes Q2_K e IQ4_XS permiten ejecutar el modelo en configuraciones de 12-16 GB de VRAM, útiles para estaciones de trabajo modestas o GPUs de gama media-alta.
- Integración en pipelines de generación aumentada por recuperación (RAG): un modelo conversacional de 34B cuantizado a Q4 puede gestionar contextos largos y responder con conocimiento inyectado, siempre que se valide empíricamente su ventana de contexto real (no documentada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos):
  - f16: ~69 GB (no cabe en GPUs de consumo; requiere A100 80GB o varias GPUs).
  - Q8_0: ~37 GB (A100 40GB, H100, o 2× RTX 4090).
  - Q6_K: ~28-30 GB (RTX 6000 Ada, A6000, o 2× RTX 4090).
  - Q5_K_M / Q5_K_S: ~24-26 GB (RTX 4090 24GB al límite; mejor A6000 o A100).
  - Q4_K_M / Q4_K_S: ~20-22 GB (cabe en RTX 4090 24GB, A5000 24GB).
  - Q3_K_L / Q3_K_M / Q3_K_S: ~16-18 GB (RTX 4080 16GB, RTX 4090 con holgura).
  - Q2_K / IQ4_XS: ~12-14 GB (RTX 4070 Ti Super 16GB, RTX 3080 12GB con limitaciones).
- GPU recomendadas: A100 80GB para f16/Q8_0; H100 para despliegues de alta concurrencia; RTX 4090 o A6000 para Q4-Q5; RTX 4080/4070 Ti Super para Q3-Q2.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q4 o inferiores, con la salvedad de que la ventana de contexto efectiva puede consumir VRAM adicional para la caché KV (no cuantificada por defecto en llama.cpp, aunque existen opciones).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa (vLLM tiene soporte experimental limitado).
- Latencia y throughput estimados: no disponibles; dependerán fuertemente del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| NorthCUA-Mini-GGUF | 34,7B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Qwen2.5-32B-Instruct-GGUF | 32,5B | 32.768 tokens (128K en variantes Turbo) | Apache 2.0 | GGUF | Hugging Face (varios cuantizadores) |
| Gemma-2-27B-it-GGUF | 27B | 8.192 tokens | Gemma Terms of Use | GGUF | Hugging Face (varios cuantizadores) |
| Yi-1.5-34B-Chat-GGUF | 34,4B | 4.096-32.768 tokens | Apache 2.0 | GGUF | Hugging Face (varios cuantizadores) |

La comparación es aproximada: NorthCUA-Mini carece de información pública sobre contexto, licencia y rendimiento, por lo que no puede establecerse una equivalencia funcional con los modelos citados más allá del rango de parámetros.

## Limitaciones y advertencias

- Ausencia total de información sobre la licencia: no puede confirmarse si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base (beipo-ai) antes de cualquier despliegue en producción.
- La model card del cuantizador es un stub autogenerado; no hay garantías documentadas sobre el proceso de cuantización más allá de los metadatos embebidos.
- No se han publicado evaluaciones de calidad, por lo que se desconoce la degradación introducida por cuantizaciones agresivas (Q2_K, IQ4_XS).
- Riesgo de alucinación desconocido: sin benchmarks ni documentación, no puede estimarse la fiabilidad factual del modelo.
- Idiomas soportados no especificados: no puede asumirse un buen rendimiento en castellano ni en otros idiomas distintos del inglés sin validación empírica.
- Ventana de contexto no documentada: planificar despliegues con contextos largos sin verificar primero el límite real puede provocar truncamientos silenciosos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad; tratar con cautela en entornos de producción.
- El tamaño del repo (71,2 GB) implica que la descarga completa de todas las cuantizaciones es costosa; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NorthCUA-Mini-GGUF
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Perfil del cuantizador: https://huggingface.co/mradermacher
