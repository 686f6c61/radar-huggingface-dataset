# maternion/LFM3-1.7B-NVFP4-GGUF

## Resumen

LFM3-1.7B-NVFP4-GGUF es una conversión no oficial del checkpoint NVFP4 de LiquidAI (LFM3-1.7B) al formato GGUF para su uso con llama.cpp. El trabajo lo publica el usuario independiente `maternion` y su rasgo diferencial es que preserva los pesos NVFP4 originales sin de-cuantizarlos: las proyecciones FFN mantienen sus super-bloques de 4 bits con escalas de bloque y globales, mientras que atención, convoluciones y embeddings permanecen en BF16 tal y como los publicó LiquidAI. No hay recuantización, ni imatrix, ni pérdida adicional introducida por el conversor.

El modelo subyacente pertenece a la familia LFM3 de LiquidAI, con 1.728.801.744 parámetros totales y una arquitectura híbrida propia de la casa (atención más convoluciones, según se deduce de los tipos de tensor del GGUF). El resultado es un fichero de 1,71 GiB que ocupa aproximadamente 7,9 bits por peso en conjunto, porque solo el FFN está en 4 bits y el resto sigue en BF16.

Su relevancia es doble: por un lado permite ejecutar un modelo de 1,7B con pesos de 4 bits nativos en hardware de consumo; por otro, es un caso práctico de las nuevas capacidades de llama.cpp para tipos de almacenamiento con escalas externas (fp8 y nvfp4), que exigen una versión muy reciente del runtime. Es una conversión de nicho, sin descargas ni validación comunitaria en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de LiquidAI (atención + convoluciones); detalles exactos no disponibles en la información proporcionada |
| Parámetros totales | 1.728.801.744 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 4096`, pero no se especifica el máximo del modelo) |
| Tipos de cuantización | NVFP4 en FFN (4,5 bpw en super-bloques de 64 pesos, 36 B por bloque); BF16 en atención, convoluciones, embeddings y `lm_head`; escalas en F32; ~7,9 bpw globales |
| Idiomas soportados | No disponible |
| Licencia | `lfm1.0` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (431 tensores: 72 NVFP4, 82 BF16, 277 F32) |

## Arquitectura y entrenamiento

El GGUF es un reempaquetado directo del checkpoint `LiquidAI/LFM3-1.7B-NVFP4`, generado con ModelOpt en formato NVFP4. Según `hf_quant_config.json`, el algoritmo de cuantización es NVFP4 con `group_size: 16`, y la lista de exclusión incluye atención, convoluciones, embeddings y `lm_head`, de modo que únicamente el FFN (gate, up y down) queda en 4 bits. La conversión repacka solo los tensores que llevan `weight_scale`; el resto se copia tal cual. El autor indica que no hizo falta parchear el conversor porque `modify_tensors` de LFM3 es un pass-through para pesos de texto (sin permutación ni división de cabezas), lo que hace seguro el reordenamiento en super-bloques.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovación técnica relevante aquí no está en el modelo sino en el formato: los tensores NVFP4 se almacenan como tipo de almacenamiento con escalas externas (`.scale` y `.input_scale` en F32), lo que impide recuantizar el fichero con `llama-quantize` y exige un runtime que entienda esas escalas.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y respuesta multi-turno, presumiblemente heredados del modelo base LFM3-1.7B (no verificable con la información disponible).
- Ejecución local en CPU, CUDA/HIP (ROCm) y Metal mediante llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidades multimodales, tool calling, agentes o modo thinking: no disponibles en la información proporcionada.
- Idiomas: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo: con 1,71 GiB de pesos, el modelo cabe holgadamente en tarjetas de 8 GB o menos y permite desplegar un LLM conversacional en un equipo personal sin depender de la nube.
- Prototipado rápido en llama.cpp: útil para probar el soporte de tipos NVFP4 con escalas externas en el runtime, ya que el fichero es un caso de prueba real de esta funcionalidad.
- Evaluación de calidad de cuantización: al preservar los pesos NVFP4 originales, sirve para medir perplexity y calidad frente al checkpoint BF16 sin la variable añadida de una recuantización propia.
- Asistentes conversacionales de baja latencia en hardware modesto: con 99,1 t/s de generación medidos en una Radeon RX 9060 XT, es viable para chatbots interactivos de un solo usuario o pocos concurrentes.
- Despliegue en entornos ROCm: el autor reporta funcionamiento en el backend HIP, lo que lo hace adecuado para estaciones de trabajo con GPU AMD.
- Pruebas de integración en pipelines llama.cpp: útil para validar que una build concreta (posterior a `a38695013`) carga correctamente tensores con escalas y no cae silenciosamente a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento son de inferencia, medidos por el autor en ROCm (AMD Radeon RX 9060 XT) con `-dev ROCm0 -ngl 99 -c 2048`:

| Métrica | Valor |
|---|---|
| Throughput de prompt | 11,3 t/s |
| Throughput de generación | 99,1 t/s |
| Backend | ROCm (HIP) |

## Requisitos de hardware

- VRAM estimada: en torno a 1,8-2 GB para los pesos más overhead de contexto; con `-c 4096` y KV cache en BF16, el consumo crece de forma moderada dado el tamaño del modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA, HIP/ROCm o Metal; el autor valida AMD Radeon RX 9060 XT. No se especifican modelos NVIDIA concretos.
- Cabe en GPU de consumo: sí, con amplio margen (incluso tarjetas de 4-8 GB).
- Opciones de despliegue: exclusivamente llama.cpp (compilación propia desde el commit `a38695013` o posterior). vLLM, TGI u Ollama no están mencionados como compatibles.
- Backends: CPU, CUDA/HIP (ROCm) y Metal aplican las escalas. Vulkan no está soportado todavía: rechaza matmuls con weight scale y cae a CPU, con lo que la inferencia se ralentiza drásticamente (PR abierto: #29791).
- Latencia y throughput: 11,3 t/s de prompt y 99,1 t/s de generación en RX 9060 XT con ROCm (datos del autor).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni de modelos comparables de la misma categoría, por lo que no es posible establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por LiquidAI; la reproducibilidad y el soporte dependen del autor independiente.
- Requiere llama.cpp en el commit `a38695013` o posterior; builds anteriores rechazan los tipos o cargan sin las escalas, lo que produce resultados incorrectos.
- Vulkan no soportado: los tensores con escala caen a CPU y la inferencia se vuelve muy lenta.
- `llama-quantize` no puede recuantizar el fichero, ya que NVFP4 es un tipo de almacenamiento con escalas externas; no se puede generar una versión Q4_K_M u otra a partir de este GGUF.
- Licencia `lfm1.0`: es necesario revisar los términos en el enlace de licencia del modelo base antes de cualquier uso comercial; la ficha no detalla restricciones concretas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; cabe esperar los habituales de un modelo de 1,7B.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe adecuado.
- Solo texto: no hay soporte multimodal.
- Sin descargas ni likes en el momento de la ficha: no hay validación comunitaria de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maternion/LFM3-1.7B-NVFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit con soporte NVFP4: `a38695013` (PR #28898)
- PR de soporte Vulkan: https://github.com/ggml-org/llama.cpp/pull/29791
- Documentación LiquidAI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground LiquidAI: https://playground.liquid.ai/
- Consola/API LiquidAI: https://console.liquid.ai/dashboard
