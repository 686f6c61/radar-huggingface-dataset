# JANGQ-AI/dots3-note-prev-JANG

## Resumen

El modelo **JANGQ-AI/dots3-note-prev-JANG** es una versión cuantizada a 2 bits del modelo base **dots-studio/dots3-note-prev**, desarrollado por JANGQ-AI. Se trata de un modelo multimodal (image-text-to-text) con arquitectura de mezcla de expertos (MoE) y aproximadamente 29.900 millones de parámetros totales. Está diseñado específicamente para ejecutarse en hardware Apple Silicon mediante la librería MLX, lo que permite su uso en entornos con memoria unificada limitada.

La relevancia de este modelo radica en su carácter de demostración técnica: ofrece una alternativa cuantizada de alta compresión (2 bits) para un modelo MoE multimodal, con licencia Apache 2.0 y acceso restringido en HuggingFace. Su tamaño de repo (101.6 GB) sugiere que los pesos están almacenados en formato safetensors, aunque la cuantización reduce significativamente el espacio en memoria durante la inferencia. No se dispone de información pública sobre el contexto máximo, los datos de entrenamiento o los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), multimodal (imagen-texto) |
| Parametros totales | 29.923.572.384 (29,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit (indicado en tags) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX (libreria mlx) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Se sabe que es un modelo MoE multimodal, lo que implica que combina un codificador de visión con un decodificador de lenguaje basado en mezcla de expertos, activando solo un subconjunto de parámetros por token. El modelo base es `dots-studio/dots3-note-prev`, del cual no se han publicado detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La versión `JANG` es una cuantización a 2 bits realizada por JANGQ-AI, optimizada para Apple Silicon mediante MLX. No se dispone de información sobre innovaciones técnicas específicas en esta variante.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas de texto (pipeline `image-text-to-text`).
- Conversación: etiquetado como `conversational`, lo que sugiere soporte para diálogos multi-turno.
- Ejecución en Apple Silicon: gracias a la librería MLX, está optimizado para GPUs y memoria unificada de Macs con chips M-series.
- Cuantización extrema: la compresión a 2 bits permite cargar el modelo en dispositivos con poca memoria, aunque puede afectar la calidad de las respuestas.
- No se dispone de información verificada sobre tool calling, agentes, razonamiento multi-paso o capacidades multilingües específicas.

## Casos de uso

Dado que la información pública es limitada, los casos de uso se infieren de las capacidades declaradas y deben validarse con pruebas propias:

- **Prototipado rápido en Mac**: desarrolladores que necesitan probar un modelo multimodal MoE en un MacBook con memoria unificada de 16 GB o más, sin necesidad de GPUs dedicadas.
- **Aplicaciones de visión-lenguaje en entornos con restricciones de hardware**: por ejemplo, análisis de imágenes médicas o industriales en dispositivos Apple, donde la cuantización 2-bit permite desplegar el modelo localmente.
- **Investigación sobre cuantización extrema**: estudiar el impacto de la compresión a 2 bits en modelos MoE multimodales, comparando con versiones de mayor precisión.
- **Asistentes conversacionales con entrada de imágenes**: integrar el modelo en un chatbot que reciba fotos y responda preguntas sobre ellas, siempre que la calidad de la cuantización sea aceptable.
- **Educación y demostraciones**: enseñar conceptos de modelos multimodales y MoE en entornos académicos con hardware Apple.
- **Bases para fine-tuning**: al ser Apache 2.0, puede usarse como punto de partida para ajuste fino en tareas específicas, aunque la cuantización 2-bit dificulta el entrenamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su versión base.

## Requisitos de hardware

- **VRAM estimada**: al ser un MoE de 29,9 B parámetros cuantizado a 2 bits, el tamaño en memoria aproximado sería de 7,5 GB (29,9 B × 0,25 bytes por parámetro), más overhead de activaciones y KV cache. En un Mac con memoria unificada, se recomienda al menos 16 GB para una ventana de contexto moderada.
- **GPU recomendadas**: no aplica a GPUs NVIDIA; está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se recomienda en GPUs de consumo convencionales.
- **Compatibilidad con hardware de consumo**: sí, en Macs con suficiente memoria unificada (16 GB o más). En Macs con 8 GB puede ser límite, dependiendo del contexto.
- **Opciones de despliegue**: al ser MLX, se puede cargar con la librería `mlx-lm` o `mlx` de Apple. No se menciona soporte para vLLM, llama.cpp u Ollama, aunque podría convertirse a otros formatos si se desea.
- **Latencia y throughput**: no disponible. La inferencia en MLX suele ser eficiente en Apple Silicon, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es una variante cuantizada de `dots3-note-prev`, del cual no hay datos públicos de rendimiento. Como referencia general, los MoE multimodales de ~30 B suelen competir con modelos como LLaVA-NeXT (7-34 B) o Qwen-VL, pero sin benchmarks no es posible afirmar equivalencias. Se recomienda consultar la documentación del modelo base para más detalles, aunque actualmente no es accesible.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo requiere aceptar condiciones en HuggingFace antes de su descarga, lo que limita su uso inmediato.
- **Cuantización 2-bit**: la compresión extrema puede degradar significativamente la calidad de las respuestas, aumentar la alucinación y reducir la coherencia en tareas complejas.
- **Falta de documentación**: no hay información sobre el contexto máximo, idiomas soportados, datos de entrenamiento ni sesgos conocidos.
- **Sesgos y alucinación**: al ser un modelo derivado sin evaluación pública, no se pueden descartar sesgos presentes en el modelo base ni errores de generación.
- **Licencia**: aunque es Apache 2.0, el acceso restringido implica condiciones adicionales que deben revisarse antes de uso comercial.
- **Producción**: sin benchmarks ni pruebas de robustez, no se recomienda su uso en entornos productivos sin una validación exhaustiva.

## Enlaces

- [HuggingFace: JANGQ-AI/dots3-note-prev-JANG](https://huggingface.co/JANGQ-AI/dots3-note-prev-JANG)
- Modelo base: [dots-studio/dots3-note-prev](https://huggingface.co/dots-studio/dots3-note-prev) (acceso restringido, no verificado)
