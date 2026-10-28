# axteam/MiniCPM-V-4.7-35B-A3B-NVFP4A16

## Resumen

MiniCPM-V-4.7-35B-A3B-NVFP4A16 es una versión cuantizada a 4 bits del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario axteam. No se trata de un modelo nuevo ni de un fine-tune: es un derivado de solo inferencia generado mediante cuantización post-entrenamiento (PTQ) con el esquema NVFP4A16, es decir, pesos en FP4 (E2M1) con grupos de 16 elementos y escalas FP8, manteniendo las activaciones en BF16. El objetivo es reducir la huella de memoria del checkpoint original para servir el modelo en vLLM sobre hardware con soporte nativo de FP4, sin reentrenar ni modificar el tokenizador ni el `chat_template`.

El modelo base es un VLM de arquitectura MoE (según la model card, con backbone de tipo Qwen3.5-MoE) que combina una torre de visión con un cuerpo de lenguaje con mezcla de expertos. La nomenclatura comercial indica 35B de parámetros totales y 3B activos por token, aunque el recuento real de safetensors del repositorio cuantizado es de 20.945.719.504 parámetros, una discrepancia que conviene verificar contra el checkpoint original antes de dimensionar infraestructura.

Su relevancia es acotada pero clara: permite desplegar un VLM de gran tamaño con pesos de ~21,9 GB en disco, lo que lo hace viable en GPUs de 24-32 GB con soporte FP4, algo imposible con el original en BF16. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (backbone de lenguaje tipo Qwen3.5-MoE + torre de visión y merger visión-texto) |
| Parametros totales | 20.945.719.504 (recuento de safetensors del repo); la nomenclatura del modelo base indica 35B |
| Parametros activos | 3B según la nomenclatura del modelo base (-A3B); no confirmado en la informacion del repo cuantizado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 (E2M1) con grupo de 16 + escala FP8, activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized`; calibración con 256 muestras; PTQ sin reentrenamiento |
| Idiomas soportados | no disponible (la validación de calidad se hizo en inglés y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (nvfp4-pack-quantized); tamaño del repo 23,6 GB, ~21,9 GB en disco |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un transformer de lenguaje con mezcla de expertos (MoE) y un codificador visual con un módulo de fusión visión-texto. En esta versión cuantizada solo se han cuantizado las proyecciones de atención y MLP del backbone de lenguaje; la torre de visión, el merger visión-texto, los embeddings de tokens, la cabeza LM y todas las RMSNorm se conservan en BF16. Esto supone que la mayor parte de los parámetros "sensibles" a la cuantización permanecen en precisión original, mientras que el grueso del cómputo (las proyecciones del MoE) se ejecuta con pesos FP4.

No se ha realizado ningún tipo de reentrenamiento, destilación ni ajuste fino: es una cuantización post-entrenamiento con 256 muestras de calibración. El autor declara que el tokenizador y el `chat_template` son idénticos a los del modelo original, por lo que la interfaz conversacional y el formato de plantilla no cambian. La validación de calidad se limita a comparaciones de perplejidad y acuerdo top-1 frente al original en BF16, en inglés y coreano; no se documentan datos de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y conversación multi-turno con imágenes.
- Comprensión de documentos visuales: la torre de visión se mantiene en BF16, lo que preserva la calidad de extracción en tareas de OCR y parsing de documentos.
- Razonamiento multimodal: al conservar el backbone MoE cuantizado solo en proyecciones, mantiene las capacidades de razonamiento del modelo original (sin datos de benchmark que lo cuantifiquen).
- Conversación multi-turno con plantilla de chat idéntica al original.
- Capacidades de tool calling / function calling: no confirmadas en la información disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles; la única evaluación declarada cubre inglés y coreano.
- No se documentan modos especiales (thinking mode, audio, vídeo) en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen del documento y devuelve campos estructurados (JSON) para integrarlos en un ERP. La torre de visión en BF16 conserva la fidelidad de lectura, y el backbone cuantizado reduce el coste por página en volumen alto.
- Atención al cliente con soporte visual: el usuario envía una captura de un error o de un producto y el modelo responde en el mismo hilo conversacional. Adecuado porque mantiene el `chat_template` original y se sirve con vLLM mediante un endpoint compatible con la API de OpenAI.
- Moderación y análisis de contenido visual: clasificación y descripción de imágenes subidas por usuarios en una plataforma, con el modelo desplegado en GPUs de 24-32 GB en lugar de requerir nodos de 80 GB en BF16.
- Automatización de QA visual en e-commerce: generación de descripciones y atributos de producto a partir de fotos de catálogo, en un pipeline batch servido con vLLM y procesamiento por lotes continuo.
- Accesibilidad: generación de descripciones alternativas de imágenes para lectores de pantalla, con latencia reducida al ejecutar pesos FP4 sobre GPUs Blackwell.
- Asistente para análisis de gráficos e informes: interpretación de dashboards o capturas de herramientas de BI y respuesta a preguntas sobre las tendencias mostradas.
- Agentes de automatización de interfaz (RPA): interpretación de capturas de pantalla de aplicaciones para decidir la siguiente acción, siempre que se valide empíricamente el soporte de tool calling, no confirmado en esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara haber comparado frente al original en BF16 mediante perplejidad y acuerdo top-1 en inglés y coreano, sin publicar cifras. No se dispone de datos de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ningún otro conjunto público para esta variante cuantizada.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 21,9 GB en disco, por lo que se necesita un mínimo de ~24 GB de VRAM solo para el modelo, más el espacio de caché KV y los buffers de activación (que por las imágenes de alta resolución y contextos largos pueden ser considerables; no se dispone de cifras concretas).
- Configuración recomendada: 40-48 GB de VRAM o más para margen operativo con imágenes grandes y concurrencia; 80 GB (A100/H100) si se quiere servir con lotes amplios.
- GPUs: el formato NVFP4 requiere soporte de FP4 en hardware; está pensado para GPUs Blackwell (B200, RTX 50 series) y para el backend de vLLM con kernels NVFP4. El comportamiento en Ada Lovelace o Hopper no está documentado en la información proporcionada.
- GPU de consumo: viable en RTX 5090 (32 GB) y previsiblemente en RTX 5080 (16 GB) no, por falta de VRAM para los pesos. En GPUs sin soporte nativo de FP4 el despliegue no está garantizado.
- Opciones de despliegue: vLLM es el único backend documentado (`vllm serve axteam/MiniCPM-V-4.7-35B-A3B-NVFP4A16`). No se documenta soporte en llama.cpp, Ollama, TGI ni transformers puro, dado el formato compressed-tensors NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| axteam/MiniCPM-V-4.7-35B-A3B-NVFP4A16 (este) | 20,9B en safetensors (nomenclatura 35B-A3B) | no disponible | NVFP4A16 (W4A16) | Apache-2.0 | vLLM |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | 35B-A3B según nomenclatura | no disponible | BF16 | Apache-2.0 | transformers, vLLM |
| Otras variantes cuantizadas del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base: misma arquitectura, mismo tokenizador y misma licencia, pero con pesos en BF16 (aproximadamente el doble de huella en memoria) y sin necesidad de kernels FP4. No se han encontrado en la información proporcionada otras variantes cuantizadas ni alternativas de la misma categoría con datos verificables, por lo que no se ofrece una comparación numérica con modelos de terceros.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, publicado por un usuario individual (axteam) y no por OpenBMB. No hay garantía de mantenimiento ni de soporte.
- Calidad no verificable: no se publican cifras de perplejidad ni de acuerdo top-1, solo la afirmación de haberlas medido en inglés y coreano. No hay evaluación en castellano.
- Discrepancia de parámetros: la nomenclatura indica 35B totales / 3B activos, pero los safetensors del repo suman 20,9B. Conviene validar el checkpoint contra el original antes de producción.
- Dependencia de hardware: NVFP4 exige soporte de FP4; en GPUs Ampere, Ada o Hopper el despliegue puede no ser posible o degradar el rendimiento. No hay información al respecto.
- Dependencia de backend: solo vLLM está documentado; no hay ruta clara a llama.cpp u Ollama.
- Riesgo de alucinación: inherente a los VLM en tareas de OCR y extracción de datos; en documentos densos o tablas complejas se recomienda validación posterior y esquemas de salida estrictos.
- Idiomas: no se declara cobertura multilingüe; el uso en castellano no está evaluado.
- Sesgos: no disponibles; no se documenta ninguna evaluación de sesgos del modelo base ni de esta variante.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos originales y el tokenizador pertenecen a OpenBMB y las condiciones del modelo base deben respetarse igualmente.
- El tag `8-bit` del repositorio contradice el esquema declarado (W4A16, FP4); tratarlo como metadato erróneo y guiarse por la model card.

## Enlaces

- HuggingFace (modelo cuantizado): https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-NVFP4A16
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
- La búsqueda web realizada no devolvió resultados técnicos relevantes (solo dominios de contenido no relacionado), por lo que no se enlaza ninguna fuente adicional
