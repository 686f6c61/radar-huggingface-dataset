# lavendercomputing/Holo4-35B-A3B-GSQ-RCO-GGUF

## Resumen

Holo4-35B-A3B-GSQ-RCO-GGUF es una versión cuantizada en formato GGUF del modelo Holo4-35B-A3B, desarrollado por Hcompany sobre la base Qwen3.6-35B-A3B. Se trata de un modelo de visión-lenguaje (vision-language) especializado en Computer Use, es decir, en la interacción con interfaces de usuario y sistemas operativos mediante capturas de pantalla, con un resultado de 30,9 % en OSWorld 2.0 a un coste de 0,61 dólares por tarea. La arquitectura es mixture-of-experts (MoE) con unos 34,7 mil millones de parámetros totales, de los cuales solo una fracción se activa por token.

Esta ficha cuantizada, publicada por lavendercomputing, ofrece builds de precisión mixta por tensor de unos 3 bits de media (3,01 y 3,51 BPW), pensadas para ejecutarse con llama.cpp. Su relevancia radica en que permite desplegar un modelo MoE de 35B con capacidades multimodales en hardware de consumo, gracias a que los expertos enrutados (aproximadamente el 92 % de los parámetros) absorben la mayor parte de la compresión. La licencia Apache-2.0, tanto del modelo como de la base Qwen, permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language (familia `qwen3_5moe` en llama.cpp), basado en Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (≈34,7B) |
| Parametros activos | 8 expertos enrutados activos por token de 256 disponibles (cifra exacta de parámetros activos: no disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ3_XXS (3,01 BPW) e IQ3_S (3,51 BPW) para expertos; Q8_0 para embeddings, router y shared experts; fp32 para normas 1-D; mmproj BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con mmproj BF16 aparte para visión); el modelo original está en safetensors BF16 |

Detalles adicionales de la arquitectura: 40 bloques, 256 expertos enrutados por bloque (1536×2048), vocabulario de 248.320 tokens, sin bloque MTP.

## Arquitectura y entrenamiento

El modelo base es un transformer mixture-of-experts con 40 bloques y 256 expertos enrutados por bloque, de los cuales 8 se activan por token. Los expertos enrutados concentran aproximadamente el 92 % de los parámetros, lo que hace que la compresión a 3 bits se aplique principalmente sobre ellos mediante una escalera de precisión de tres niveles ponderada hacia los bordes ("edge-weighted ladder"): los tensores de atención y los shared experts se mantienen en precisión alta, mientras que las normas 1-D quedan en fp32.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en los datos disponibles. En cuanto a la cuantización, el enfoque "GSQ-RCO-style" replica de forma compatible con GGUF la receta de 3 bits de los motores GSQ/RCO, que solo emiten `compressed-tensors` de Hugging Face y requieren GPUs sm_90+, por lo que no pueden generar GGUF directamente. Las builds se derivan de un paso intermedio Q8_0 de mradermacher (considerado prácticamente sin pérdidas) y emplean una importance matrix que cubre 510 de las 512 matrices 2-D significativas; `token_embd` y `output` carecen de filas en la imatrix y quedan fijadas a Q8_0.

## Capacidades

- Comprensión de imagen y texto (pipeline image-text-to-text), con proyector de visión BF16 (`mmproj-f16`) necesario para entrada de imágenes.
- Computer Use: análisis de capturas de pantalla y razonamiento sobre interfaces gráficas para automatizar tareas en sistemas operativos (30,9 % en OSWorld 2.0).
- Generación de texto y razonamiento general, verificado mediante smoke tests de inferencia en CPU con salida coherente.
- Contexto muy largo: hasta 262.144 tokens, útil para conversaciones extensas y documentos voluminosos.
- Etiquetado como conversacional y compatible con endpoints de Hugging Face.
- No hay información publicada sobre tool calling, function calling, capacidades de agente multi-paso (más allá del enfoque Computer Use) ni soporte de audio.

## Casos de uso

- Automatización de tareas de escritorio (Computer Use): el modelo analiza capturas de pantalla y genera acciones para interactuar con aplicaciones, con un coste muy bajo por tarea (0,61 dólares en OSWorld 2.0) y pesos locales bajo Apache-2.0.
- Asistentes que "ven" la pantalla: integración en herramientas de soporte técnico que describen y diagnostican lo que ocurre en la interfaz del usuario, usando `llama-mtmd-cli` con el mmproj BF16.
- Procesamiento local de documentos con imágenes: extracción y descripción de contenido de capturas, diagramas o documentos escaneados sin enviar datos a la nube, gracias a la inferencia 100 % local con llama.cpp.
- Chatbot multimodal en hardware de consumo: la variante IQ3_XXS (12,16 GiB) cabe en GPUs de 16 GB, permitiendo despliegues domésticos de un modelo de 35B.
- Procesamiento por lotes de bajo coste: la cuantización agresiva a 3 bits reduce los requisitos de memoria y permite mayor throughput en servidores con VRAM limitada.
- Investigación en cuantización de MoE: la escalera de precisión por tensor y la importance matrix de mradermacher son material de referencia para estudiar cuantización extrema de expertos enrutados.
- Aplicaciones con contexto muy largo: con 262.144 tokens de ventana, es adecuado para analizar historiales de conversación extensos o múltiples capturas de pantalla encadenadas en sesiones de automatización.

## Benchmarks y rendimiento

Único dato publicado en la información disponible:

| Benchmark | Resultado |
|---|---|
| OSWorld 2.0 | 30,9 % (a 0,61 $/tarea) |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible. Como referencia de throughput, los smoke tests en CPU con llama.cpp arrojaron unos 6 t/s, valor indicativo y no representativo de serving.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM):
  - IQ3_XXS: 12,16 GiB (3,01 BPW)
  - IQ3_S: 14,18 GiB (3,51 BPW)
  - Añadir la memoria del mmproj BF16 y del KV cache (creciente con el contexto de hasta 262K tokens).
- GPUs recomendadas: no disponible de forma explícita; con 12–14 GiB de pesos, una RTX 4090 (24 GB) o RTX 3090 permiten carga completa en GPU con contexto moderado. GPUs de 16 GB (RTX 4060 Ti 16G, RTX 5060 Ti 16G) pueden acomodar la variante IQ3_XXS con contexto ajustado o descarga parcial a CPU (`-ngl` parcial).
- Consumer GPU: sí, cabe en GPUs de 16–24 GB; en CPU pura funciona (verificado en smoke tests a ~6 t/s), pero es lento para uso interactivo.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para visión). No hay soporte confirmado para vLLM, TGI u Ollama con estos GGUF; el formato GGUF facilita la integración con backends basados en llama.cpp.
- Latencia y throughput: solo dato disponible ~6 t/s en CPU (smoke test); cifras en GPU no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Holo4-35B-A3B (base, BF16) | ≈34,7B | MoE VLM Computer Use | 262.144 | Apache-2.0 | Pesos completos, máxima fidelidad; requiere mucha más VRAM |
| Holo4-35B-A3B-GGUF (vendor) | ≈34,7B | MoE VLM | 262.144 | Apache-2.0 | GGUF oficial de Hcompany; esta ficha es una alternativa cuantizada a 3 bits |
| Holo4-27B (mencionado en la model card) | no disponible | no disponible | no disponible | CC BY-NC (restricción no comercial) | Menos permissive que la variante 35B |

Datos de rendimiento comparativos entre estas variantes: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se ha publicado información sobre sesgos del modelo base.
- Riesgo de alucinación: inherente a todo LLM; en tareas de Computer Use una alucinación puede traducirse en acciones erróneas sobre el sistema operativo, por lo que se recomienda supervisión humana o sandboxing.
- Cuantización agresiva: las builds a 3,0–3,5 BPW implican pérdida de calidad respecto al BF16 original; además, existe un paso intermedio Q8_0 entre el máster BF16 y la escalera de 3 bits (benigno según el autor, pero evitable cuantizando directamente desde safetensors).
- Visión no verificada en profundidad: los smoke tests de visión no se repitieron en este repo; solo se verificó inferencia de texto. Para uso solo de texto no se necesita el mmproj.
- Idiomas soportados: no disponible.
- Licencia: Apache-2.0 tanto en los pesos del vendor como en la base Qwen, sin restricciones para uso comercial (a diferencia del Holo4-27B, que es CC BY-NC).
- Cobertura de la importance matrix incompleta: 510 de 512 matrices; `token_embd` y `output` carecen de imatrix y están fijados a Q8_0.
- Sin bloque MTP: no hay decodificación multi-token predictiva en estas builds.
- Benchmarks limitados: solo OSWorld 2.0; no hay datos de MMLU, código o matemáticas para evaluar el impacto real de la cuantización.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/lavendercomputing/Holo4-35B-A3B-GSQ-RCO-GGUF
- Modelo base (vendor): https://huggingface.co/Hcompany/Holo4-35B-A3B
- GGUF oficial del vendor: https://huggingface.co/Hcompany/Holo4-35B-A3B-GGUF
- Fuente Q8_0 (mradermacher): https://huggingface.co/mradermacher/Holo4-35B-A3B-GGUF/blob/main/Holo4-35B-A3B.Q8_0.gguf
- Importance matrix (mradermacher): https://huggingface.co/mradermacher/Holo4-35B-A3B-i1-GGUF/blob/main/Holo4-35B-A3B.imatrix.gguf
- Proyector de visión mmproj-f16: https://huggingface.co/mradermacher/Holo4-35B-A3B-GGUF/blob/main/Holo4-35B-A3B.mmproj-f16.gguf
- Base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
