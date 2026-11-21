# moravianai/ThinCtx-Qwen3.5-4B-small

## Resumen

ThinCtx-Qwen3.5-4B-small es una conversión del modelo Qwen3.5-4B realizada por Moravian AI mediante su runtime propietario ThinCtx. El objetivo del proyecto es reducir drásticamente el coste de memoria asociado al contexto largo: mantiene la calidad del modelo original pero comprime las representaciones del contexto (KV cache) de forma que cada token adicional ocupa aproximadamente 1,7 KB en lugar de 32 KB, es decir, unas 19 veces menos. Además, los pesos del transformer están cuantizados a unos 5,4 bits por peso, lo que reduce la descarga de 8,94 GB a 3,63 GB.

El modelo conserva los 4.210 millones de parámetros del original (el recuento de 4.893.696 que muestra Hugging Face corresponde únicamente a los tensores en 16 bits de `model.safetensors`; los pesos cuantizados se almacenan empaquetados en `aux1.safetensors`). Según el autor, permite ejecutar contextos de hasta 540.000 tokens en una GPU de 24 GB, algo que el modelo original no puede hacer, y ofrece un rendimiento en function calling prácticamente idéntico (BFCL 89,0 frente a 89,5 sobre los mismos ítems).

La relevancia actual del modelo radica en el coste de servir conversaciones y documentos largos: al trasladar la mayor parte del contexto a memoria del sistema y mantener en GPU solo una fracción pequeña que crece lentamente, abarata el despliegue de asistentes con ventanas de contexto muy grandes. Está calibrado y probado en inglés, checo y alemán, y requiere obligatoriamente el runtime `thinctx` (versión mínima 0.3.1, recomendada 1.0.1 o superior), por lo que no es compatible con vLLM, llama.cpp u otras librerías de inferencia convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, tipo `qwen3_5_text`) con runtime ThinCtx para gestión comprimida del contexto |
| Parámetros totales | 4,21 mil millones (4.210.000.000) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 540.000 tokens en GPU de 24 GB según el autor; 128.000 tokens como referencia de comparación |
| Tipos de cuantización | Pesos a ~5,4 bits por peso (capas del transformer); contexto en RAM del sistema comprimido 2,5–3× respecto al almacén de 16 bits |
| Idiomas soportados | Multilingüe; calibrado y probado en inglés (en), checo (cs) y alemán (de) |
| Licencia | PolyForm Small Business 1.0.0 (uso gratuito para pequeñas empresas, personal, investigación no comercial y educación; licencia comercial para organizaciones mayores en producción) |
| Formato de pesos | safetensors (`model.safetensors` en 16 bits y `aux1.safetensors` con pesos cuantizados empaquetados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 4,21 mil millones de parámetros, y aplica sobre él la conversión ThinCtx de Moravian AI. La innovación principal no reside en el entrenamiento sino en la representación del contexto: ThinCtx mantiene en GPU una porción pequeña del estado de atención que crece a razón de ~1,7 KB por token (frente a los ~32 KB del modelo original), mientras que el contexto completo se almacena comprimido en memoria del sistema, con una reducción de 2,5 a 3 veces respecto al almacén de 16 bits. En esta variante "small" también se cuantizan los pesos del transformer a unos 5,4 bits por peso, lo que reduce el tamaño de descarga de 8,94 GB a 3,63 GB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base, ya que la model card no los detalla. El autor indica que el modelo está calibrado y probado en inglés, checo y alemán, y que utiliza la plantilla de chat de Qwen3.5 para conversación y function calling. Una característica destacable del runtime (a partir de thinctx 1.0) es que las conversaciones que comparten el mismo system prompt comparten también su memoria en GPU y en RAM del sistema en Linux, de modo que cada conversación adicional tiene un coste de memoria pequeño. El autor advierte que ThinCtx lee prompts largos más despacio que el modelo base.

## Capacidades

- Generación de texto conversacional multirretorno con plantilla de chat de Qwen3.5.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-4B.
- Function calling / tool calling: BFCL de 89,0 frente a 89,5 del original sobre los mismos ítems, es decir, prácticamente paridad.
- Soporte de modo thinking mediante el parámetro `enable_thinking` en la API compatible con OpenAI.
- Manejo de contextos muy largos: hasta 540.000 tokens en una GPU de 24 GB según el autor, con coste de memoria por token muy reducido.
- Capacidades multilingües calibradas en inglés, checo y alemán.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`, streaming y no streaming, herramientas).
- Compartición de memoria entre conversaciones con el mismo system prompt (solo en Linux nativo, no en WSL).

## Casos de uso

- Asistentes con documentos largos: análisis de contratos, informes o expedientes de cientos de miles de tokens en una sola GPU de 24 GB, aprovechando que el contexto vive comprimido en RAM del sistema y solo una fracción pequeña ocupa VRAM.
- Atención al cliente multi-turno: conversaciones largas con historial extenso donde el coste por token de contexto es ~19 veces menor que en el original, lo que abarata el mantenimiento de sesiones prolongadas.
- Agentes con tool calling: integración en flujos de automatización que requieren llamadas a funciones (APIs, bases de datos, sistemas internos) con una calidad de function calling prácticamente idéntica al modelo base.
- Procesamiento de código y documentación técnica: lectura de repositorios o manuales extensos en inglés dentro de la ventana de contexto ampliada.
- Despliegue en entornos con GPU de gama media-alta: servir el modelo en una RTX 4090, RTX 5060 Ti u otra GPU de 24 GB o menos, donde el Qwen3.5-4B original no cabe con contextos largos.
- Aplicaciones multilingües centroeuropeas: asistentes en checo y alemán, idiomas sobre los que el autor declara calibración y pruebas específicas.
- Evaluación e investigación: uso gratuito para investigación no comercial y educación, útil para experimentar con gestión comprimida de contexto sin coste de licencia.

## Benchmarks y rendimiento

| Benchmark | ThinCtx-Qwen3.5-4B-small | Qwen3.5-4B (original) |
|---|---|---|
| BFCL (function calling, mismos ítems) | 89,0 | 89,5 |
| Memoria de contexto por token | ~1,7 KB | ~32 KB |
| Descarga de pesos | 3,63 GB | 8,94 GB (16 bits) |
| Contexto máximo en GPU de 24 GB | ~540.000 tokens | No cabe |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento o razonamiento para esta variante. El autor indica además que la generación con los pesos compactos es 2,6 veces más rápida con thinctx 1.0.1 que con 1.0.0 en una RTX 5060 Ti.

## Requisitos de hardware

- GPU: NVIDIA obligatoria; Linux x86_64 o Windows 10/11 mediante WSL2; macOS no soportado.
- VRAM: aproximadamente 4,0 GB para los pesos en el caso de 128.000 tokens de contexto y 4,7 GB en el caso de 540.000 tokens, según el autor (frente a 12,0 y 24,5 GB del original).
- RAM del sistema: aloja el contexto completo comprimido; el autor indica que es 2,5–3 veces menor que el almacén de 16 bits.
- GPU recomendadas: RTX 4090, RTX 5060 Ti (probada por el autor) y cualquier GPU NVIDIA de 24 GB; también cabe en GPUs con menos VRAM para contextos moderados.
- Cabe en GPU de consumo: sí, en GPUs NVIDIA de consumo con controladores compatibles con CUDA 13 (o CUDA 12.8 con el wheel alternativo de PyTorch 2.11).
- Despliegue: exclusivamente mediante el runtime `thinctx` (mínimo 0.3.1, recomendado 1.0.1 o superior), con CLI `thinctx chat`, servidor `thinctx serve` compatible con OpenAI y API Python `thinctx.load`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Requisitos adicionales: gcc/build-essential para compilar el launcher de Triton en el primer arranque; en WSL se recomienda `autoMemoryReclaim=dropcache` en `.wslconfig`.
- Latencia y throughput: el autor señala que la lectura de prompts largos es más lenta que en el modelo base y que la generación es 2,6 veces más rápida con thinctx 1.0.1 que con 1.0.0 en una RTX 5060 Ti; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria de contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-4B-small | 4,21B | Hasta ~540k en 24 GB | ~1,7 KB/token en GPU | PolyForm Small Business 1.0.0 | thinctx |
| ThinCtx-Qwen3.5-4B (variante completa) | 4,21B | Hasta ~540k en 24 GB | ~1,7 KB/token en GPU; contexto en RAM a 16 bits | PolyForm Small Business 1.0.0 | thinctx |
| Qwen3.5-4B (original) | 4,21B | 128k de referencia | ~32 KB/token en GPU | Según el modelo base (no disponible en la información) | Cualquier librería compatible con Qwen3.5 |

La comparación con otros modelos de 4B de la misma categoría (por ejemplo, Llama 3.2 3B o Gemma 3 4B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime `thinctx`: los pesos no funcionan correctamente en otras librerías de inferencia, lo que limita la portabilidad y añade un punto único de fallo en producción.
- Solo plataformas Linux x86_64 y Windows vía WSL2 con GPU NVIDIA; macOS no está soportado y la compartición de memoria entre conversaciones no funciona en WSL.
- La lectura de prompts largos es más lenta que en el modelo base, lo que puede penalizar cargas de trabajo con prompts muy extensos y poca generación.
- Idiomas calibrados limitados a inglés, checo y alemán; el rendimiento en castellano u otros idiomas no está verificado por el autor.
- Licencia PolyForm Small Business 1.0.0: el uso comercial en organizaciones que superen el umbral de "pequeña empresa" requiere licencia comercial de pago; conviene revisar los términos exactos antes de desplegar.
- Riesgo de alucinación inherente a un modelo de 4B, no cuantificado en la información disponible.
- No se han publicado resultados de benchmarks de conocimiento general (MMLU, GSM8K, HumanEval) que permitan evaluar la degradación frente al original más allá del function calling.
- El recuento de parámetros mostrado por Hugging Face (4.893.696) es engañoso: corresponde solo a los tensores en 16 bits, no al total del modelo.
- El modelo requiere aceptar condiciones de acceso (gated) en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-4B-small
- Variante completa: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio del autor: https://moravian.ai/
- Contacto para licencias comerciales: info@moravian.ai
