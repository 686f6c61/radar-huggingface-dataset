# istitov/Qwen3.6-35B-A3B-llmfan46-Heretic-NPU2

## Resumen

Qwen3.6-35B-A3B-llmfan46-Heretic-NPU2 es una conversión no oficial del modelo Qwen3.6-35B-A3B de Alibaba Qwen, en la variante "Heretic" (abliterated/uncensored) publicada por el usuario llmfan46, y reempaquetada por istitov al formato Q4NX propietario de FastFlowLM para su ejecución sobre NPUs AMD XDNA 2 (familia Ryzen AI 300 y posteriores). El modelo original es un transformer de mezcla de expertos (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, capaz de procesar texto e imágenes.

El repositorio no entrena ni modifica los pesos más allá de la cuantización y el reempaquetado: la eliminación de mecanismos de rechazo (uncensoring) es obra de llmfan46 sobre el modelo base, y esta conversión se limita a adaptar el resultado al formato que consume el runtime FastFlowLM. El resultado es un modelo multimodal conversacional de gran tamaño que, pese a sus 35B totales, se ejecuta en hardware de consumo gracias a su arquitectura MoE y a la cuantización Q4NX de aproximadamente 22,1 GB.

Su relevancia es doble: por un lado, demuestra que es viable ejecutar un MoE de 35B en una NPU integrada de portátil (Ryzen AI 9 HX 370) a 14-18 tokens/s; por otro, documenta las fricciones del ecosistema, ya que el modelo no es un GGUF y no funciona en Transformers, llama.cpp ni Ollama, sino únicamente a través de FastFlowLM u OpenFlowLM con los kernels cerrados de Qwen3.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia Qwen3.6; tag `qwen3_5_moe` |
| Parametros totales | 35B (aproximado, segun nombre del modelo) |
| Parametros activos | aproximadamente 3B (A3B) |
| Longitud de contexto | 32.768 tokens (valor probado; valor por defecto del registro de FastFlowLM) |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM); layout interno Q4_K; no es GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (FastFlowLM); tamano del repo 22,1 GB |
| Modalidad | image-text-to-text (texto e imagen) |
| Runtime | FastFlowLM 1.0.7 (probado), 1.0.12 (solo prompt corto); OpenFlowLM con `OFLM_QWEN36_ENGINE=closed` |
| Hardware | AMD XDNA 2 NPU (Ryzen AI 300 y posteriores) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un transformer de mezcla de expertos con 35B parámetros totales y unos 3B activos por token, lo que reduce el coste computacional por paso de decodificación a pesar del tamaño del repositorio de pesos. La variante de llmfan46 aplica técnicas de abliteration (eliminación de direcciones de rechazo en el espacio de activaciones) para reducir la tasa de negativas del modelo, y conserva una cabeza MTP (multi-token prediction) nativa en el modelo fuente; esta conversión concreta descarta esa cabeza MTP porque el motor Qwen3.6 de FastFlowLM no la utiliza.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF/DPO del modelo original en la documentación proporcionada. La conversión de istitov no entrena nada: solo recuantiza a Q4NX, reempaqueta los pesos y enlaza los kernels estándar de FastFlowLM correspondientes a Qwen3.6. El chat emplea la plantilla de Qwen3.6 propia de FastFlowLM, copiada sin cambios, y el registro de FastFlowLM lo marca como modelo con modo "thinking" desactivable.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Procesamiento de imágenes (pipeline image-text-to-text): descripción y comprensión de imágenes, verificado con una imagen de prueba en la model card.
- Modo de razonamiento explícito ("thinking") que puede activarse o desactivarse según el runtime.
- Reducción de rechazos: 10/100 negativas frente a 83/100 del Qwen3.6 original, según cifras de llmfan46 medidas antes de la conversión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no disponibles en la información proporcionada para esta variante.

## Casos de uso

- Inferencia local en portátiles con NPU AMD: un Ryzen AI 9 HX 370 con 55 GiB de RAM ejecuta el modelo a 14-18 tokens/s, lo que permite asistentes conversacionales privados sin GPU dedicada ni conexión a la nube.
- Análisis de imágenes en local: al aceptar entrada image-text-to-text, sirve para describir capturas, diagramas o fotografías en flujos de trabajo offline donde no se quiere enviar datos a un servicio externo.
- Prototipado de asistentes sin filtros editoriales: útil en investigación sobre seguridad, alineación y moderación, donde se necesita un modelo que genere contenido que otros rechazan para estudiar respuestas o diseñar capas de moderación posteriores.
- Evaluación comparativa de cuantización: permite medir cómo afecta la recuantización Q4NX a la tasa de rechazos y a la calidad frente al modelo fuente en FP16/BF16, con la advertencia de que las cifras de rechazo de la model card son previas a la conversión.
- Despliegue en entornos con restricciones de hardware: al no requerir GPU, encaja en estaciones de trabajo con Ryzen AI donde el consumo energético o la disponibilidad de GPU son limitantes.
- Generación de texto largo con contexto medio: los 32.768 tokens permiten resumir documentos, mantener conversaciones extensas o procesar transcripciones sin truncar en exceso.
- Investigación sobre formatos propietarios: sirve como caso de estudio de las limitaciones del ecosistema, ya que obliga a usar `flm-add` y kernels cerrados en lugar de las herramientas estándar (llama.cpp, Ollama, vLLM).

## Benchmarks y rendimiento

| Metrica | Valor | Fuente |
|---|---|---|
| Decodificacion (Ryzen AI 9 HX 370, FastFlowLM 1.0.7) | 14-18 tokens/s | Model card |
| Throughput en OpenFlowLM (commit 96b915d) | 14-15 tokens/s (prompt incluido) | Model card |
| Rechazos (modelo fuente, antes de conversion) | 10/100 frente a 83/100 del Qwen3.6 original | llmfan46 |
| Divergencia KL frente al original | 0,0015 | llmfan46 |
| Contexto probado | 32.768 tokens | Model card |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rechazos y divergencia KL corresponden al modelo fuente de llmfan46 y fueron medidos antes de la conversión a Q4NX; la cuantización puede alterarlos en cualquier dirección.

## Requisitos de hardware

- VRAM/NPU: el modelo pesa 22,1 GB en Q4NX; se ejecuta sobre la NPU XDNA 2 con memoria del sistema compartida. El equipo de prueba tenía 55 GiB de RAM visibles para Linux.
- Hardware obligatorio: NPU AMD XDNA 2 (Ryzen AI 300 y posteriores). No funciona en GPU NVIDIA, GPU AMD discretas ni CPU.
- No cabe en GPUs de consumo por la vía habitual: no es un GGUF y no se puede cargar en llama.cpp, Ollama, vLLM ni TGI.
- Despliegue: FastFlowLM 1.0.7 (probado) o 1.0.12 (solo prompt corto); OpenFlowLM con `OFLM_QWEN36_ENGINE=closed`. Instalación mediante `flm-add` (pipx o uv) o `flm-custom-sync` en Gentoo.
- Sistema operativo: solo Linux probado; Windows no fue testeado.
- Latencia y throughput: 14-18 tokens/s de decodificación en Ryzen AI 9 HX 370; 14-15 tokens/s en OpenFlowLM incluyendo el prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-llmfan46-Heretic-NPU2 | 35B | ~3B | 32.768 | Q4NX | NPU AMD XDNA 2 | Apache 2.0 |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved | 35B | ~3B | no disponible | safetensors (presumible) | GPU | Apache 2.0 |
| Qwen/Qwen3.6-35B-A3B (original) | 35B | ~3B | no disponible | safetensors | GPU | Apache 2.0 |
| istitov/Llama-3.1-8B-Instruct-heretic (misma serie) | 8B | 8B (denso) | no disponible | Q4NX | NPU AMD XDNA 2 | no disponible |

La comparación directa con alternativas densas de tamaño similar no está disponible en la información proporcionada. La diferencia clave frente al modelo fuente es el formato y el hardware: el original en safetensors requiere GPU, mientras que esta conversión solo funciona en NPU XDNA 2 y pierde la cabeza MTP.

## Limitaciones y advertencias

- Contenido sensible: el modelo ha sido modificado para rechazar menos y puede producir material dañino, ofensivo o falso; la responsabilidad de moderación recae en el despliegue.
- Los rechazos se reducen, no se eliminan; las cifras de la model card (10/100) son del autor del modelo fuente y previas a la cuantización, que puede alterarlas.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier modelo de esta familia.
- Compatibilidad muy restringida: no es GGUF, no carga en Transformers, llama.cpp ni Ollama, y solo funciona en NPU AMD XDNA 2 con FastFlowLM u OpenFlowLM.
- Fragilidad ante actualizaciones: un cambio de formato de pesos en FastFlowLM puede dejar de funcionar la conversión y exigir una nueva.
- OpenFlowLM requiere los kernels cerrados (`OFLM_QWEN36_ENGINE=closed`); sus kernels abiertos no leen el layout Q4_K de esta conversión y producen salida basura.
- Solo Linux probado; Windows sin verificar.
- Idiomas soportados no documentados; puede haber degradación en lenguas distintas del inglés o el chino.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y su moderación son responsabilidad del usuario.
- Proyecto no oficial: sin afiliación ni respaldo de Qwen, llmfan46, AMD ni FastFlowLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/istitov/Qwen3.6-35B-A3B-llmfan46-Heretic-NPU2
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- FastFlowLM: https://github.com/ROCm/FastFlowLM
- OpenFlowLM: https://github.com/Atomic-Germ/OpenFlowLM-Next
- Herramienta flm-add: https://pypi.org/project/flm-add/
- Coleccion de conversiones: https://huggingface.co/collections/istitov/fastflowlm-npu2-heretic-conversions-6af22b7bf264c137a0b92875
- Overlay Gentoo: https://github.com/istitov/stuff
- Guia de fine-tunes en NPU: https://istitov.github.io/stuff/guides/npu-custom-models/
- Repositorio Llama-3.1-8B-Instruct-heretic de la misma serie: https://huggingface.co/istitov/Llama-3.1-8B-Instruct-heretic
