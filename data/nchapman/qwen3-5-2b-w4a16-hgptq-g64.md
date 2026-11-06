# nchapman/Qwen3.5-2B-W4A16-HGPTQ-g64

## Resumen

Qwen3.5-2B-W4A16-HGPTQ-g64 es una cuantización de 4 bits (pesos) con activaciones en 16 bits del modelo multimodal Qwen/Qwen3.5-2B, publicada por el usuario nchapman bajo licencia Apache 2.0. El artefacto aplica GPTQ con descomposición de Cholesky, `group_size=64` y `actorder="static"` sobre las 353 capas lineales cuantizables del modelo base, que abarcan texto (248 capas), el módulo Native MTP (7 capas) y el codificador de visión (98 capas). La innovación principal es la rotación Hadamard por bloques aplicada en línea sobre las activaciones de entrada, derivada de la familia de métodos QuIP, que reduce de forma medible la degradación respecto a una cuantización W4A16 sin rotar.

El modelo base Qwen3.5-2B es un transformer multimodal de tipo image-text-to-text con 2.213.241.664 parámetros totales, orientado a conversación, razonamiento y comprensión de imágenes. Esta versión cuantizada ocupa 1,84 GiB de safetensors (2,0 GB de repositorio), lo que la hace apta para GPUs de consumo, y mantiene en BF16 las capas sensibles: proyecciones de atención lineal, embeddings, `lm_head`, la capa FC del MTP, el patch embedding visual, normas y sesgos.

La relevancia del artefacto es doble: por un lado demuestra que es posible cuantizar a W4A16 un modelo multimodal completo, incluido su cabezal de predicción multi-token y su torre de visión, sin sacrificar apenas fidelidad; por otro, documenta con detalle el procedimiento de calibración y los ajustes necesarios en vLLM V1 (v0.31.0) para servir las capas de visión rotadas, lo que lo convierte en una referencia práctica para quien quiera replicar la receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con módulo Native MTP; capas de atención lineal; cuantización GPTQ W4A16 con rotación Hadamard |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), `group_size=64`, `actorder="static"`, formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 1,84 GiB de payload; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal que procesa texto e imágenes: la torre de visión (`model.visual.*`, con `visual.patch_embed.proj` en BF16) alimenta representaciones que se fusionan con el flujo de texto. Incluye además un módulo Native MTP (multi-token prediction) de 7 capas lineales, lo que sugiere decodificación especulativa nativa o predicción de varios tokens por paso. La cuantización cubre 353 capas lineales: 248 de texto, 7 del MTP y 98 de visión.

El proceso de cuantización aplica GPTQ con Cholesky sobre pesos pre-rotados offline mediante la matriz de Walsh-Hadamard de Sylvester de 64×64 normalizada ($W' = W H_{64} / \sqrt{64}$). En tiempo de inferencia se aplica la misma rotación por bloques a la última dimensión de las activaciones de entrada antes del GEMM W4A16: $x' = \text{unflatten}(x, (-1, 64)) \cdot H_{64}/\sqrt{64}$. Como $H_{64}$ es determinista (`randomize: false`), no se almacenan tensores de transformación, de ahí que el payload (1,841 GiB) sea idéntico al de la variante sin rotar `g64-h0`.

La calibración de texto y MTP usó 999 muestras de 4096 tokens de `nvidia/Nemotron-Cascade-2-SFT-Data`, congeladas en `warp-3090-quant-lab-frozen-data`; el MTP se calibró sobre estados ocultos post-norm capturados y embeddings de tokens desplazados. La calibración de visión empleó 64 imágenes de ChartQA y TextVQA, disjuntas del conjunto de evaluación de 48 imágenes. El repositorio incluye una plantilla de chat propia (`chat_template.jinja`, de froggeric Qwen-Fixed-Chat-Templates v22.5) y una configuración de muestreo por defecto de temperatura 1.0, top_p 0.95 y top_k 20.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en el repositorio.
- Comprensión de imágenes y respuesta sobre ellas (pipeline `image-text-to-text`): el autor evalúa calidad en tareas tipo ChartQA y TextVQA.
- Razonamiento y respuesta a preguntas sobre gráficos y documentos visuales, según la evidencia de calibración y evaluación con ChartQA/TextVQA.
- Predicción multi-token nativa (Native MTP), que puede habilitar decodificación especulativa o generación acelerada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Extracción de datos de gráficos e informes: el modelo puede recibir una imagen de un gráfico o tabla y responder preguntas sobre sus valores; la calibración específica con ChartQA y TextVQA y la fidelidad medida en visión (KL aislado 0,0152, Top-1 97,45%) lo hacen adecuado para este escenario.
- Asistencia documental con OCR implícito: al procesar capturas de documentos o capturas de pantalla, puede resumir o responder preguntas sobre el contenido visual, con un coste de memoria de solo 1,84 GiB de pesos.
- Despliegue en GPUs de consumo para demos y prototipos: con 2,2 mil millones de parámetros en W4A16, cabe en tarjetas de 8-12 GB y permite iterar localmente sin infraestructura dedicada.
- Servicio de chat conversacional de bajo coste: la plantilla de chat incluida y el formato compressed-tensors permiten servirlo con vLLM V1, lo que facilita atender conversaciones multi-turno con un consumo de VRAM reducido.
- Aceleración de inferencia mediante MTP: el módulo Native MTP cuantizado (KL aislado 0,0255, Top-1 91,87%) puede emplearse para decodificación especulativa y aumentar el throughput en pipelines de generación.
- Evaluación de técnicas de cuantización: el repositorio documenta la receta completa (GPTQ con Cholesky, rotación Hadamard, calibración con Nemotron-Cascade-2-SFT-Data) y sirve como referencia reproducible para investigar cuantización W4A16 en modelos multimodales.
- Integración en pipelines de transformers: al cargarse con la librería `transformers` y ser compatible con endpoints, puede incorporarse a aplicaciones existentes de image-text-to-text sin reescribir el stack.

## Benchmarks y rendimiento

Los datos publicados por el autor miden fidelidad respecto al modelo BF16 y a variantes W4A16 sin rotar, no rendimiento en benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | g128-h0 | g64-h0 | HGPTQ-g64-h64 (este repo) | Cambio vs g64-h0 |
|---|---:|---:|---:|---:|
| probe-v4 weighted KL (378 filas / 840k tokens) ↓ | 0,1038 | 0,0869 | 0,0728 | −16,3% (347/378 filas) |
| probe-v4 token mean KL / p99.9 ↓ | 0,3155 / 15,99 | 0,2874 / 15,42 | 0,2543 / 14,80 | −11,5% |
| probe-v4 PPL Δ% vs BF16 ↓ | +5,363% | +4,917% | +1,669% | −66,1% |
| probe-guard token mean KL (76 filas) ↓ | 0,1030 | 0,0839 | 0,0572 | −31,8% (75/76 filas) |
| Native MTP KL aislado / Top-1 ↑ | 0,0537 / 89,14% | 0,0397 / 89,75% | 0,0255 / 91,87% | −35,8% KL |
| Vision ViT feature Rel-RMSE / Cosine Sim | 0,4080 / 0,9302 | 0,3757 / 0,9410 | 0,3305 / 0,9544 | −12,0% RMSE |
| Vision KL aislado de respuesta / Top-1 ↑ | 0,0136 / 95,54% | 0,0206 / 96,18% | 0,0152 / 97,45% | Empata con W8A16 en Top-1 |
| Payload safetensors | 1,815 GiB | 1,841 GiB | 1,841 GiB | +0 bytes |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,84 GiB en W4A16; con overhead de activaciones, caché KV y contexto, se puede operar en torno a 4-6 GB según longitud de contexto y batch (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para uso cómodo; el autor menciona un entorno de trabajo denominado `warp-3090`, lo que sugiere validación en RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 3090/4090.
- Opciones de despliegue: vLLM V1 (v0.31.0) con soporte compressed-tensors; transformers. Para las capas de visión rotadas en vLLM se requieren dos ajustes documentados en `vllm/model_executor/layers/quantization/compressed_tensors/transform/linear.py` (manejo de sesgos en `apply` y validación de `input_tfms` en `_validate_tfm_schemes`). Las capas de texto y MTP cargan sin cambios.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-W4A16-HGPTQ-g64 (este) | 2,21 B | no disponible | W4A16 GPTQ + Hadamard, g64 | Apache 2.0 | Multimodal; PPL Δ +1,669% vs BF16 |
| Qwen3.5-2B (base, BF16) | 2,21 B | no disponible | BF16 | Apache 2.0 | Referencia de fidelidad |
| Qwen3.5-2B W4A16 g64-h0 (sin rotar) | 2,21 B | no disponible | W4A16 GPTQ, g64 | Apache 2.0 | PPL Δ +4,917%; misma receta sin Hadamard |
| Qwen3.5-2B W4A16 g128-h0 (sin rotar) | 2,21 B | no disponible | W4A16 GPTQ, g128 | Apache 2.0 | PPL Δ +5,363%; payload 1,815 GiB |

No se dispone de datos para comparar con modelos de otros autores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: PPL +1,669% respecto a BF16 y KL medio de 0,2543 en `probe-v4`; no es equivalente al modelo original en todas las tareas.
- El soporte en vLLM para las capas de visión rotadas requiere un parche manual de dos líneas; sin él, solo texto y MTP cargan correctamente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026: no hay evidencia de uso en producción ni validación independiente.
- Los idiomas soportados no están documentados en la información disponible; no se puede garantizar cobertura multilingüe.
- No hay datos publicados sobre sesgos, tasas de alucinación ni robustez en dominios específicos.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-2B, que conviene verificar.
- La calibración de visión se hizo con solo 64 imágenes de ChartQA y TextVQA; el rendimiento en otros dominios visuales (fotografía natural, documentos escaneados, vídeo) no está validado.
- El módulo MTP se calibró sobre estados ocultos capturados; su fidelidad en generación libre más allá del probe aislado no está documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Receta y tooling: https://github.com/nchapman/warp-3090-model-lab
- Dataset de calibración original: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Dataset de calibración congelado: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantilla de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
