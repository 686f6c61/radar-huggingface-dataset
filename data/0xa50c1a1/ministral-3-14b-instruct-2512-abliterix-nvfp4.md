# 0xA50C1A1/Ministral-3-14B-Instruct-2512-abliterix-nvfp4

## Resumen

El modelo `0xA50C1A1/Ministral-3-14B-Instruct-2512-abliterix-nvfp4` es una cuantización en formato NVFP4 de `0xA50C1A1/Ministral-3-14B-Instruct-2512-abliterix`, una variante "abliterated" (sin dirección de rechazo) de un modelo instruct de la familia Ministral 3. Cuenta con 13.945.031.680 parámetros y lo publica el usuario 0xA50C1A1 en Hugging Face bajo licencia Apache 2.0, con pesos en `safetensors` y formato de cuantización `compressed-tensors`.

El modelo resuelve dos necesidades concretas: reducir la huella de memoria de un modelo de ~14B a un formato de 4 bits y ofrecer una versión sin mecanismos de rechazo, orientada a investigación sobre alineación y a generación de texto sin filtros. NVFP4 es el formato de coma flotante de 4 bits definido por NVIDIA (elementos E2M1, escalas por bloque en FP8 E4M3 y una escala global en FP32), pensado para explotar los tensor cores de las GPU Blackwell.

Su relevancia es fundamentalmente técnica: permite servir un modelo de 14B con unos 13,4 GB en disco y aprovechar la ruta rápida de NVFP4 en hardware Blackwell. No obstante, el repositorio no incluye una model card detallada, no registra descargas ni likes y no publica resultados de benchmarks, por lo que la mayor parte de las especificaciones de contexto, idiomas y entrenamiento no están documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer, familia Mistral 3 (según el tag `mistral3`); detalles no disponibles |
| Parámetros totales | 13.945.031.680 (~13,9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits, formato NVIDIA con escalas FP8 E4M3 y FP32); los tags incluyen además la etiqueta "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, NVFP4) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna ni sobre el proceso de entrenamiento de este modelo. El tag `mistral3` indica que deriva de la familia Mistral 3 de Mistral AI, y el nombre del repositorio sugiere un modelo instruct de ~14B con designación temporal "2512". No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos deben considerarse no disponibles.

Sobre las dos transformaciones aplicadas sí puede darse contexto técnico general. Por un lado, la "abliteración" es una técnica que identifica la dirección de rechazo en el espacio de activaciones y ortogonaliza los pesos respecto a ella, de modo que el modelo deja de emitir negativas ante determinadas peticiones; el resultado se etiqueta habitualmente como `uncensored`. Por otro, la cuantización NVFP4 es una cuantización post-entrenamiento (PTQ) que se genera típicamente con `llm-compressor` en el formato `compressed-tensors`, y que almacena los pesos en 4 bits con escalas por bloque de 16 elementos. El repositorio ocupa 13,4 GB, un tamaño superior a los ~7 GB esperables para un modelo de 14B puramente en 4 bits, lo que sugiere que algunas capas (por ejemplo, embeddings o `lm_head`) podrían mantenerse en mayor precisión o que el repositorio incluye ficheros adicionales.

## Capacidades

- Generación de texto y conversación multi-turno en formato instruct, heredadas del modelo base.
- Comportamiento "uncensored": la abliteración elimina la dirección de rechazo, por lo que el modelo no deniega peticiones que el modelo original rechazaría.
- Razonamiento, matemáticas y generación de código: no verificados en este repositorio; no hay datos publicados.
- Tool calling / function calling: no documentado.
- Modo "thinking" o razonamiento extendido: no documentado.
- Capacidades multimodales (visión o audio): no constan; los pesos y tags no incluyen torre de visión ni codificador de audio.
- Capacidades multilingües: no disponible, no se especifican idiomas.
- Ejecución eficiente en GPU Blackwell gracias al formato NVFP4.

## Casos de uso

- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar empíricamente cómo la supresión de la dirección de rechazo afecta al comportamiento del modelo frente a peticiones sensibles, comparándolo con el modelo original.
- Evaluación de cuantización: sirve para medir la pérdida de calidad de NVFP4 frente a la versión bf16 del mismo modelo en tareas de generación, razonamiento y código.
- Despliegue de bajo coste en Blackwell: con TensorRT-LLM o vLLM puede servirse un modelo de ~14B en 4 bits aprovechando la ruta nativa de NVFP4 para reducir VRAM y aumentar el throughput.
- Base para fine-tuning y experimentos: al estar bajo Apache 2.0, puede emplearse como punto de partida para ajustes específicos de dominio o para LoRA sobre la versión cuantizada.
- Generación de texto creativo sin restricciones: escritura asistida, guiones o narrativa donde se busca evitar los filtros de rechazo del modelo original.
- Red teaming y generación de datos adversarios: útil para producir conjuntos de datos de evaluación de seguridad o para probar sistemas de moderación.
- Prototipado local en GPU de gama alta: si el runtime soporta el formato, puede ejecutarse en tarjetas consumer de 24 GB o más.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y no registra descargas ni likes que permitan inferir validación por parte de la comunidad. Tampoco hay disponible una comparación cuantitativa de la degradación introducida por NVFP4 respecto al modelo base en bf16.

## Requisitos de hardware

- Peso de los pesos: ~13,4 GB en disco; se recomienda reservar al menos 14-16 GB de VRAM solo para los pesos.
- Memoria adicional: la caché KV y las activaciones requieren VRAM extra, cuyo tamaño depende de la longitud de contexto configurada (no documentada).
- GPU con soporte nativo de NVFP4: familia NVIDIA Blackwell (B200, GB200, RTX 50 y superiores), que ejecutan el formato en los tensor cores de 4 bits.
- GPU sin soporte nativo: en Hopper (H100, H200) y Ada (RTX 4090, L40S) el modelo puede ejecutarse, pero normalmente dequantizando o con kernels que no aprovechan la ruta rápida, con mayor consumo de VRAM y menor rendimiento.
- GPU consumer: puede caber en tarjetas de 24 GB (RTX 4090, RTX 3090) para contextos moderados, siempre que el runtime acepte el formato.
- Opciones de despliegue: vLLM (soporte de `compressed-tensors` y NVFP4), TensorRT-LLM (soporte nativo de NVFP4) y SGLang. `llama.cpp` y Ollama no consumen NVFP4 directamente; requerirían una conversión a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NVFP4) | 13,9B | no disponible | NVFP4 (4 bits) | apache-2.0 | Público en Hugging Face |
| `0xA50C1A1/Ministral-3-14B-Instruct-2512-abliterix` (base) | 13,9B | no disponible | bf16 / sin cuantizar | apache-2.0 | Público en Hugging Face |
| Modelo Ministral 3 14B Instruct original (sin abliterar) | no disponible | no disponible | bf16 | no disponible | no disponible |
| Cuantización alternativa de 4 bits (AWQ, GPTQ o GGUF Q4) del mismo modelo | 13,9B | no disponible | 4 bits | apache-2.0 | no disponible (no consta publicación) |

No se dispone de datos de rendimiento que permitan comparar directamente este modelo con alternativas de la misma categoría. Las diferencias observables se limitan al formato de cuantización y al hardware objetivo: NVFP4 solo ofrece ventajas claras en Blackwell, mientras que AWQ/GPTQ o GGUF serían preferibles en GPU más antiguas o en CPU.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de la dirección de rechazo reduce drásticamente las barreras de seguridad, por lo que puede generar contenido dañino, ilegal o sesgado. No es adecuado para despliegues de cara al público sin una capa externa de moderación.
- Sesgos: no documentados. Al derivar de un modelo base no especificado, hereda los sesgos de sus datos de entrenamiento, cuyo contenido no se detalla.
- Alucinación: riesgo inherente a los modelos generativos; no se ha cuantificado para esta variante.
- Pérdida por cuantización: NVFP4 introduce degradación de precisión respecto a bf16, no medida en este repositorio.
- Ausencia de validación: el repositorio registra 0 descargas y 0 likes, y su model card se limita a una frase. No hay garantía de que la cuantización se haya verificado.
- Inconsistencia en metadatos: los tags incluyen simultáneamente `nvfp4` (4 bits) y `8-bit`, lo que puede inducir a error sobre el formato real.
- Compatibilidad limitada: el formato NVFP4 no se ejecuta de forma nativa en `llama.cpp`, Ollama ni en GPU anteriores a Blackwell.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal y ética del contenido generado recae íntegramente en el usuario.
- Datos ausentes: no se especifican contexto máximo, idiomas soportados, composición del dataset ni fechas de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- El repositorio figura creado el 24 de septiembre de 2026 según los metadatos, sin historial de uso previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xA50C1A1/Ministral-3-14B-Instruct-2512-abliterix-nvfp4
- Modelo base: https://huggingface.co/0xA50C1A1/Ministral-3-14B-Instruct-2512-abliterix
- No se han encontrado enlaces adicionales (papers, blogs, repositorios o demos) en la información disponible.
