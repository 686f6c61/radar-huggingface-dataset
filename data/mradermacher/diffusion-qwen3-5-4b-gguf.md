# mradermacher/Diffusion-Qwen3.5-4B-GGUF

## Resumen

Diffusion-Qwen3.5-4B-GGUF es la versión cuantizada en formato GGUF del modelo base summerAIO/Diffusion-Qwen3.5-4B, una adaptación experimental de la familia Qwen3.5 hacia el paradigma de los modelos de difusión enmascarada (masked diffusion) para generación de lenguaje. El autor de la cuantización es mradermacher, un conocido generador de cuantizaciones GGUF en el ecosistema de Hugging Face, que publica los pesos en múltiples niveles de compresión (Q2_K a f16) para facilitar su uso en llama.cpp y otras herramientas compatibles.

El modelo combina la arquitectura subyacente de Qwen3.5 (transformer de aproximadamente 4.205.751.296 parámetros) con técnicas de difusión de tipo LLaDA y summerMC-diffusion, lo que lo sitúa en la línea de investigación de los diffusion language models (dLM). Se trata de un modelo marcado explícitamente como experimental, orientado a investigadores que quieren explorar la generación no autorregresiva y comparar su comportamiento frente a los transformers causales clásicos.

Su relevancia actual radica en que permite probar el paradigma de difusión de forma accesible: los cuantizados GGUF de 2 a 4,6 GB caben en GPUs de consumo, y la licencia Apache 2.0 facilita la experimentación y el uso comercial. No obstante, la información pública disponible sobre arquitectura detallada, datos de entrenamiento y benchmarks es muy limitada, y el propio autor lo etiqueta como experimental, por lo que no debe considerarse un modelo listo para producción sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | diffusion-lm (masked diffusion, tipo LLaDA/summerMC-diffusion) sobre base Qwen3.5; transformer, no autorregresiva |
| Parámetros totales | 4.205.751.296 (~4,2 mil millones) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ja (inglés y japonés según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en formato transformers/safetensors |

## Arquitectura y entrenamiento

La model card del repositorio de cuantización no detalla la arquitectura interna del modelo base. Por las etiquetas (diffusion-lm, masked-diffusion, llada, summerMC-diffusion) se infiere que el modelo sigue el paradigma de difusión enmascarada para texto: en lugar de generar tokens de forma autorregresiva, el modelo parte de una secuencia enmascarada y la va denoising iterativamente hasta producir la salida completa, de forma análoga a LLaDA. La base es la familia Qwen3.5, de la que hereda el tamaño de aproximadamente 4,2 mil millones de parámetros.

No se dispone de información pública en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning instructivo. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La cuantización realizada por mradermacher es de tipo estático (convert_type: hf, quantize_version 2), y el autor indica que no ha publicado (por el momento) cuantizaciones con imatrix/pesos ponderados.

## Capacidades

- Generación de texto mediante difusión enmascarada (decodificación no autorregresiva, con refinamiento iterativo de la secuencia).
- Conversación: el repositorio está etiquetado como "conversational" y "endpoints_compatible".
- Capacidades multilingües limitadas a inglés (en) y japonés (ja) según la model card.
- Razonamiento y generación de código: no hay documentación específica que confirme ni descarte estas capacidades; no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en modelos de difusión para lenguaje: el modelo permite experimentar con generación no autorregresiva en un tamaño de 4B, comparando la calidad y diversidad frente a transformers causales del mismo orden de magnitud.
- Prototipado en GPUs de consumo: los cuantizados Q4_K_M (2,8 GB) y Q5_K_M (3,2 GB) permiten ejecutar el modelo en tarjetas de gama media para pruebas de concepto y demos internas.
- Estudio de decodificación paralela: útil para analizar el comportamiento de la denoising iterativa (número de pasos, calidad frente a latencia) en entornos controlados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantización, lo que facilita medir el impacto de la compresión en la perplejidad y la calidad de salida de un diffusion LM.
- Experimentos de conversación en inglés y japonés: el etiquetado "conversational" y los idiomas declarados permiten probar diálogos multirretorno en esos dos idiomas, siempre con validación manual.
- Docencia y formación técnica: como ejemplo práctico de diffusion language models y de flujos de cuantización GGUF en cursos de IA generativa.
- Integración en pipelines de investigación con llama.cpp: al ser GGUF, puede cargarse en herramientas compatibles para experimentos reproducibles sin necesidad de infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (Q2_K), 2,8 GB (Q4_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16), más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizados Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100/H100 no son necesarias para este tamaño, salvo para experimentos a gran escala.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más de VRAM; los cuantizados Q2_K y Q3_K_S podrían ejecutarse incluso en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; el modelo base original está pensado para transformers. No hay confirmación de soporte en vLLM o TGI para esta arquitectura de difusión.
- Latencia y throughput: no disponibles. Al ser un modelo de difusión, la latencia depende del número de pasos de denoising, un parámetro no documentado en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diffusion-Qwen3.5-4B-GGUF | ~4,2B | no disponible | Difusión enmascarada | Apache 2.0 | GGUF en HF |
| LLaDA (referencia del paradigma) | no disponible en la información | no disponible | Difusión enmascarada | no disponible | no disponible |
| Qwen3.5 base (familia de origen) | ~4,2B (este modelo) | no disponible | Transformer causal | no disponible | transformers |
| Alternativas GGUF de 4B autorregresivas (p. ej., Qwen, Llama de 3-4B) | ~3-4B | no disponible | Transformer causal | varía | GGUF en HF |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, paradigma y licencia.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental por el autor: no está validado para producción.
- No hay benchmarks publicados; se desconoce su calidad real frente a modelos autorregresivos equivalentes.
- Idiomas limitados a inglés y japonés según la model card; el castellano no está declarado como soportado.
- Riesgo de alucinación y de salidas incoherentes no cuantificado; en modelos de difusión la calidad depende fuertemente del esquema de decodificación.
- No hay documentación sobre sesgos, datos de entrenamiento ni filtros de seguridad.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la salida; el autor recomienda Q4_K_S/Q4_K_M como equilibrio.
- No se han publicado cuantizaciones ponderadas/imatrix, lo que puede afectar a la calidad de los cuantizados pequeños.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental conviene evaluar su comportamiento antes de integrarlo en productos.
- Compatibilidad de despliegue limitada: el soporte de arquitecturas de difusión en runtimes de inferencia es aún incipiente.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/Diffusion-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/summerAIO/Diffusion-Qwen3.5-4B
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Diffusion-Qwen3.5-4B-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
