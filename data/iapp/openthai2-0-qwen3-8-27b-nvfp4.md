# iapp/openthai2.0-qwen3.8-27b-NVFP4

## Resumen

OpenThai 2.0.1 NVFP4 es una versión cuantizada en FP4 del modelo multimodal `iapp/openthai2.0-qwen3.8-27b`, desarrollado por iApp en el marco del proyecto OpenThai (anteriormente OpenThaiGPT) y presentado junto a AIEAT. El modelo base parte de la familia Qwen 3.5 y está orientado a tareas de texto, visión y OCR con especial atención al idioma tailandés, aunque conserva las capacidades multilingües heredadas del modelo original. Esta variante concreta aplica cuantización NVFP4 (4 bits) sobre pesos y activaciones mediante `llm-compressor`, manteniendo en bf16 la torre de visión, el `lm_head` y la cabeza MTP de decodificación especulativa.

La relevancia de esta ficha radica en que se trata de una de las primeras publicaciones abiertas de un modelo de 27 000 millones de parámetros en formato NVFP4 listo para vLLM sobre hardware NVIDIA Blackwell, lo que reduce drásticamente los requisitos de VRAM frente al modelo en bf16 (de aproximadamente 55 GB a unos 15-16 GB de pesos) y habilita su despliegue en GPUs de gama alta de consumo con 24 GB o en nodos de inferencia con varias réplicas por GPU. El repositorio ocupa 99,4 GB porque incluye tanto los pesos cuantizados como los tensores en bf16 que se conservan sin cuantizar y los ficheros auxiliares.

La model card documenta un incidente relevante: las primeras subidas del repositorio omitían los tensores `mtp.*` pese a que `config.json` declaraba `mtp_num_hidden_layers: 1`, lo que provocaba que la decodificación especulativa fuese aproximadamente 1,6 veces más lenta que sin ella (longitud media de aceptación 1,00). La versión actual corrige el problema añadiendo `model-mtp.safetensors` (0,85 GB en bf16) y la regla `re:.*mtp.*` en `quantization_config.ignore`, alcanzando una longitud media de aceptación de 1,68 bajo vLLM 0.26.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen 3.5) con torre de visión y cabeza MTP para decodificación especulativa |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32 768 tokens (valor sugerido en el comando de servicio de la model card; el máximo del modelo base no se detalla) |
| Tipos de cuantizacion | NVFP4 (4 bits) en pesos y activaciones; bf16 en torre de visión, `lm_head` y cabeza MTP |
| Idiomas soportados | Tailandés (objetivo principal); el resto de idiomas del modelo base no se detalla |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (índice con `model-mtp.safetensors` separado en bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de 27,36 mil millones de parámetros que combina un decodificador de lenguaje con una torre de visión, lo que permite procesar imágenes y documentos además de texto. Incluye una cabeza MTP (multi-token prediction) de una capa (`mtp_num_hidden_layers: 1`) que actúa como modelo borrador para decodificación especulativa, acelerando la generación cuando se sirve con vLLM y la configuración `qwen3_5_mtp`. Esta variante NVFP4 no reentrena el modelo: aplica cuantización post-entrenamiento con `QuantizationModifier` de `llm-compressor`, calibrada sobre texto (dataset ultrachat, 512 muestras de 2048 tokens), y preserva en bf16 la torre de visión, el `lm_head` y la cabeza MTP para no degradar la calidad multimodal ni la aceptación especulativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento; la model card remite a la ficha del modelo base para benchmarks y prompts. La innovación técnica destacable de esta publicación es la combinación de cuantización NVFP4 con decodificación especulativa verificada: la corrección del 31 de agosto de 2026 restauró la cabeza MTP y documentó una longitud media de aceptación de 1,68 tokens por paso, ligeramente superior a la del modelo en bf16 de producción (1,61).

## Capacidades

- Generación de texto y razonamiento en tailandés e idiomas adicionales heredados del modelo base.
- Procesamiento de imágenes y documentos mediante torre de visión (entrada multimodal).
- OCR y extracción de texto de imágenes, indicado explícitamente en las etiquetas del repositorio.
- Modo de razonamiento compatible con el parser `qwen3` de vLLM (`--reasoning-parser qwen3`).
- Decodificación especulativa con cabeza MTP propia (`qwen3_5_mtp`), con hasta 2 tokens especulativos por paso.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de documentos en tailandés: el modelo puede recibir imágenes de facturas, formularios o páginas escaneadas y devolver texto estructurado, aprovechando la torre de visión conservada en bf16 y el soporte de OCR declarado por el autor.
- Atención al cliente en tailandés: despliegue con vLLM sobre una única GPU Blackwell con 32 768 tokens de contexto permite gestionar conversaciones multi-turno con historial largo y decodificación especulativa para reducir latencia percibida.
- Extracción de datos de capturas y documentos regulatorios: combinación de visión y razonamiento para clasificar y resumir contenido en flujos de back office, con la ventaja de que los pesos NVFP4 reducen el coste por réplica.
- Asistentes internos con contexto documental: el contexto de 32 768 tokens admite pegar contratos o informes completos junto con la pregunta, y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.
- Servicio de inferencia de alta densidad: al ocupar los pesos cuantizados del orden de 15-16 GB, es posible ejecutar varias instancias en una GPU de 80 GB (H100, B200) o una sola instancia en GPUs de 24 GB, lo que abarata el coste por token en producción.
- Investigación en cuantización FP4: el repositorio sirve como referencia reproducible de un pipeline `llm-compressor` con calibración textual y exclusión selectiva de módulos (visión, `lm_head`, MTP) para estudiar el impacto de NVFP4 en calidad y aceptación especulativa.
- Traducción y generación de contenido tailandés: uso del modelo como motor de redacción o traducción en aplicaciones editoriales, con la salvedad de que la calidad en idiomas distintos del tailandés no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo base para benchmarks y prompts. El único dato de rendimiento numérico documentado es la longitud media de aceptación de la decodificación especulativa: 1,68 con la cabeza MTP restaurada frente a 1,61 del modelo en bf16 de producción, y 1,00 (sin ganancia) en las subidas anteriores defectuosas.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 15-16 GB en NVFP4 para los 27,36 mil millones de parámetros (4 bits), más los tensores en bf16 conservados (torre de visión, `lm_head` y cabeza MTP de 0,85 GB).
- VRAM total recomendada: 24 GB o más para servir con contexto moderado; 40-80 GB para contextos cercanos a 32 768 tokens y mayor concurrencia por el coste de la caché KV.
- GPUs recomendadas: NVIDIA Blackwell (B200, RTX 50xx) por el soporte nativo de NVFP4; el autor indica expresamente NVIDIA Blackwell como plataforma objetivo. El soporte en arquitecturas anteriores (Hopper, Ada) no está confirmado en la información disponible.
- GPU de consumo: previsiblemente cabe en tarjetas con 24 GB o más de VRAM, siempre que el backend soporte NVFP4; no se confirma en la información disponible para modelos concretos.
- Opciones de despliegue: vLLM 0.26 o superior con `compressed-tensors` y `--trust-remote-code`; no se documenta soporte en llama.cpp, Ollama ni TGI.
- Comando de referencia del autor:
  `vllm serve iapp/openthai2.0-qwen3.8-27b-NVFP4 --max-model-len 32768 --reasoning-parser qwen3 --trust-remote-code --speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":2}'`
- Latencia y throughput: no disponibles como cifras absolutas; la decodificación especulativa aporta una aceptación media de 1,68 tokens por paso, lo que reduce el número de pasos de decodificación necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| iapp/openthai2.0-qwen3.8-27b-NVFP4 | 27,36 B | 32 768 (configurado) | NVFP4 + bf16 parcial | Apache 2.0 | Objeto de esta ficha; multimodal con OCR tailandés |
| iapp/openthai2.0-qwen3.8-27b (base) | 27,36 B | no disponible | bf16 | Apache 2.0 | Modelo de referencia sin cuantizar; benchmarks publicados en su ficha |
| Alternativas de la familia Qwen 3.5 de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |
| Otros modelos tailandeses open source comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; se recomienda consultar la ficha del modelo base para los benchmarks de referencia.

## Limitaciones y advertencias

- La cuantización NVFP4 puede degradar la calidad frente al modelo en bf16; no se han publicado evaluaciones comparativas de calidad en la información disponible.
- El repositorio original tenía un defecto grave (tensores `mtp.*` ausentes) que ralentizaba la inferencia si se activaba `--speculative-config`; es imprescindible descargar la versión posterior al 31 de agosto de 2026 o servir sin especulación.
- El modelo está optimizado para tailandés; el rendimiento en castellano y otros idiomas no está documentado y puede ser inferior al del modelo base en bf16.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en OCR de documentos con baja calidad de imagen o tablas complejas; se recomienda validación posterior en flujos críticos.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el cumplimiento normativo (por ejemplo, protección de datos en OCR de documentos personales) recae en el integrador.
- Dependencia de hardware Blackwell y de vLLM 0.26 o superior con `compressed-tensors`; no hay confirmación de funcionamiento en otros backends, lo que limita la portabilidad.
- El tamaño del repositorio (99,4 GB) implica costes de descarga y almacenamiento considerables pese a que los pesos efectivos en FP4 sean mucho menores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-NVFP4
- Modelo base: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Repositorio de llm-compressor (herramienta de cuantización citada): no disponible en la información proporcionada
- Documentación de vLLM: no disponible en la información proporcionada
- Paper o blog técnico de OpenThai 2.0: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
