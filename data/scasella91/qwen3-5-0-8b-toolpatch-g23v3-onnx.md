# scasella91/Qwen3.5-0.8B-toolpatch-g23v3-ONNX

## Resumen

Qwen3.5-0.8B-toolpatch-g23v3-ONNX es una exportación a ONNX del modelo Qwen3.5-0.8B de Alibaba Qwen, modificado mediante edición de pesos por el autor independiente scasella91. La modificación consiste en un ajuste de forma cerrada sobre dos neuronas de la MLP de la capa 23 (6.142 pesos en BF16, un 0,00082 % del modelo de texto) cuyo objetivo es evitar que el modelo emita `<tool_call>` en peticiones que no deberían desencadenar una llamada a herramienta. El resultado se distribuye en formato ONNX fp16 para su uso con Transformers.js y WebGPU directamente en el navegador.

El modelo base Qwen3.5-0.8B es un transformer denso de 0,8 mil millones de parámetros con capacidades multimodales (image-text-to-text). Esta exportación conserva el codificador visual en fp16 y el tokenizador, la plantilla de chat y las configuraciones originales, y añade dos decodificadores: uno byte-idéntico al export oficial de onnx-community y otro con la edición g23v3 aplicada.

La relevancia de esta ficha es doble: por un lado documenta una técnica de edición de pesos interpretable y verificable (con manifiesto de offsets y comprobación SHA-256); por otro, ilustra las limitaciones prácticas de aplicar estas ediciones tras una cuantización agresiva, ya que el autor demuestra que con backbone de 4 bits la edición deja de funcionar y por eso solo publica la variante fp16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), exportado a ONNX |
| Parámetros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (decodificador publicado); q4f16 y q4 reconstruibles con `--variants` pero no publicados; embeddings en q4f16 y fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (decoder_model_merged_fp16.onnx + _data, 1,5 GB; decoder_model_merged_g23v3_fp16.onnx + _data; vision_encoder_fp16; embed_tokens q4f16 y fp16) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 0,8 mil millones de parámetros con codificador visual, orientado a generación de texto y a tareas image-text-to-text. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

La innovación técnica de esta variante no reside en el entrenamiento sino en la edición de pesos: se identificaron direcciones en el flujo residual de la capa 23 y se ajustó una lectura con compuerta (gated readout) sobre dos neuronas de la MLP de esa capa, resuelta en forma cerrada. La edición afecta a 6.142 pesos BF16 (0,00082 % del modelo de texto) y se aplica sobrescribiendo exactamente esas entradas en una copia byte a byte del ONNX original. El repositorio incluye `patch_manifest.json` con los offsets de los tres tensores MLP de la capa 23 y los valores editados, de modo que un cliente puede descargar el original una vez y generar la variante en memoria, verificando el SHA-256 del resultado (base `54f347bfecebce99…`, editado `55d106f75cdf529c…`). El autor documenta que la edición se ajustó sobre activaciones BF16 y que solo se mantiene con backbone fp16: con decodificador q4f16 o q4 la entrada de la capa 23 se desvía (coseno 0,888 frente a 0,988 en fp16) y la compuerta se cierra en prompts de explicación, por lo que la edición deja de comportarse como se diseñó.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con Transformers.js.
- Llamada a herramientas (tool calling) con formato nativo `<tool_call>`.
- Modo de abstención entrenado mediante edición: el modelo puede responder exactamente `NO_TOOL` cuando la petición no requiere herramienta y `NEED_CLARIFICATION` cuando falta información o es ambigua.
- Capacidades multimodales image-text-to-text heredadas del modelo base (codificador visual incluido en el repo).
- Ejecución en navegador con WebGPU mediante Transformers.js.
- Capacidad de razonamiento con modo thinking desactivable (`enable_thinking: false` en la plantilla de chat).
- No se documentan capacidades de audio ni de agentes multi-paso más allá del protocolo sintético de la campaña.

## Casos de uso

- Desambiguación de tool calling en asistentes web: el modelo decide entre ejecutar una herramienta, responder `NO_TOOL` o pedir aclaración `NEED_CLARIFICATION`, lo que permite integrar un enrutador ligero en aplicaciones de chat sin backend dedicado.
- Demos interactivas en navegador: al ejecutarse con Transformers.js y WebGPU, permite publicar una demo de tool calling que corre íntegramente en el cliente, sin servidor de inferencia ni coste de GPU.
- Prototipado de agentes con herramientas: útil para validar plantillas de sistema, esquemas de herramientas y flujos de decisión antes de migrar a un modelo mayor.
- Investigación en interpretabilidad y edición de pesos: el manifiesto de offsets, los scripts de exportación y la comparación de drift entre precisiones sirven como caso de estudio reproducible de edición de neuronas.
- Filtrado de llamadas espurias en pipelines existentes: el patch puede aplicarse en memoria sobre el ONNX original descargado una sola vez, lo que facilita desplegar la corrección sin redistribuir pesos completos.
- Educación y docencia: modelo de 0,8 B ejecutable en portátiles con GPU integrada compatible con WebGPU para enseñar tool calling y evaluación de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente métricas internas de la campaña de edición:

| Métrica | Resultado |
|---|---|
| Pesos editados | 6.142 BF16 (0,00082 % del modelo de texto) |
| Coseno a entrada BF16 de capa 23, fp16 (media / mínimo) | 0,988 / 0,986 |
| Coseno a entrada BF16 de capa 23, q4f16 y q4 | 0,888 / 0,865 |
| Coincidencia de signo de la compuerta de abstención, fp16 | 8/8 |
| Coincidencia de signo de la compuerta de abstención, q4f16 y q4 | 5/8 |
| Llamadas token-idénticas (campaña BF16 MLX, greedy) | reportado como resultado de la campaña |
| Regresiones right-to-wrong | 0 |
| Correcciones wrong-to-right | 87 |

Estas cifras proceden de la campaña del autor sobre pesos BF16 MLX con decodificación greedy y un protocolo sintético; no son comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada: en torno a 1,5-2 GB para el decodificador fp16 más embeddings y codificador visual; el repo completo ocupa 3,9 GB.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (integradas modernas, Apple Silicon, GPUs de escritorio recientes); para servidor, GPU con al menos 4 GB de memoria.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales, dado el tamaño de 0,8 B en fp16.
- Opciones de despliegue: Transformers.js con WebGPU (vía principal documentada), ONNX Runtime (CPU y GPU); no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI en esta exportación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| scasella91/Qwen3.5-0.8B-toolpatch-g23v3-ONNX | 0,8 B | no disponible | Apache 2.0 | ONNX fp16 | Edición de tool calling, orientado a navegador |
| Qwen/Qwen3.5-0.8B | 0,8 B | no disponible | Apache 2.0 (según base) | safetensors y otras | Modelo base sin edición |
| onnx-community/Qwen3.5-0.8B-ONNX | 0,8 B | no disponible | Apache 2.0 (según base) | ONNX fp16, q4, q4f16 | Export oficial usado como punto de partida |
| scasella91/Qwen3.5-0.8B-toolpatch-g23v3 | 0,8 B | no disponible | Apache 2.0 | MLX/BF16 | Versión previa a la exportación ONNX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La evaluación se realizó únicamente bajo el protocolo sintético de la campaña del autor; no hay validación en benchmarks públicos ni en tráfico real.
- Las diferencias numéricas entre BF16 y fp16 en WebGPU pueden alterar salidas individuales aunque el mecanismo se reproduzca.
- La edición no funciona con backbone de 4 bits: las variantes q4f16 y q4 no se publican precisamente porque la compuerta se cierra en prompts de explicación y el modelo sigue llamando a herramientas.
- Riesgo de alucinación inherente a un modelo de 0,8 B; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento multilingüe antes de usarlo en producción.
- El uso del decodificador editado con la librería estándar requiere renombrar ficheros o parchear el buffer descargado con `patch_manifest.json`, lo que añade complejidad operativa.
- Licencia Apache 2.0 permite uso comercial, pero las garantías sobre el comportamiento del patch son responsabilidad del integrador.
- Solo se documenta el pipeline text-generation en la práctica; las capacidades image-text-to-text no se validan en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v3-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Versión previa (MLX/BF16): https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v3
- Export ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX
- Blog del autor: https://scasella.github.io/qwen3.5-toolpatch/blog.html
- Demo interactiva: https://scasella.github.io/qwen3.5-toolpatch/
- Código: https://github.com/scasella/qwen3.5-toolpatch
