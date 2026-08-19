# Miltos22/Qwen3.8-20B-Minitron-Q2_K-GGUF

## Resumen

Este repositorio contiene la conversión a formato GGUF del modelo `exnivo/Qwen3.8-20B-Minitron`, realizada por Miltos22 mediante la herramienta GGUF-my-repo de llama.cpp. El modelo original es un Qwen3.8 de aproximadamente 20 000 millones de parámetros sometido a un proceso de compresión basado en pruning estructurado y destilación de conocimiento (técnica Minitron), lo que reduce el tamaño del modelo manteniendo un rendimiento razonable para su categoría.

La versión aquí publicada está cuantizada en Q2_K, lo que reduce el peso del archivo a unos 7,8 GB, facilitando su ejecución en hardware modesto, incluidas CPUs y GPUs de gama media. Aunque el pipeline declarado es `image-text-to-text`, no se proporcionan detalles sobre las capacidades multimodales del modelo base en la documentación disponible.

Es relevante porque ofrece una alternativa ligera y de código abierto (licencia Apache 2.0) para tareas de generación de texto y posiblemente visión, con un tamaño de contexto y rendimiento no especificados en la información publicada. La cuantización Q2_K es agresiva, por lo que se recomienda evaluar la calidad de salida antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 19 285 624 544 (19,3 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el repo original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo original `exnivo/Qwen3.8-20B-Minitron`. El nombre sugiere que se basa en la familia Qwen3.8, probablemente un transformer con atención estándar, pero no se confirma en la documentación proporcionada. El proceso de compresión Minitron implica pruning estructurado (eliminación de capas o dimensiones) seguido de destilación de conocimiento desde el modelo original, pero no se especifican los hiperparámetros ni el dataset utilizado.

La conversión a GGUF se realizó con llama.cpp, lo que permite su uso en entornos de inferencia locales con CPU o GPU mediante herramientas como `llama-cli` y `llama-server`. No hay información sobre el entrenamiento, el número de tokens, ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente, aunque no se han publicado ejemplos concretos.
- Posible procesamiento de imágenes: el pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base podría aceptar imágenes como entrada, pero no hay confirmación en la documentación.
- Multilingüismo: no se especifican los idiomas soportados.
- No se mencionan capacidades de tool calling, razonamiento multi-paso ni modo de pensamiento explícito.

## Casos de uso

- Inferencia local en CPU: gracias a la cuantización Q2_K y al tamaño reducido (7,8 GB), el modelo puede ejecutarse en portátiles o servidores sin GPU, mediante `llama-cli` o `llama-server`.
- Prototipado rápido: ideal para experimentar con modelos de 19B en entornos de desarrollo sin acceso a hardware de gama alta.
- Despliegue en edge: en dispositivos con 8-12 GB de RAM o VRAM, puede servir como asistente de texto básico.
- Evaluación de calidad de cuantización: permite comparar la degradación de rendimiento entre la versión completa y la cuantizada Q2_K.
- Integración en pipelines de generación de texto: mediante la API de llama.cpp, puede integrarse en aplicaciones Python o servicios REST.
- Pruebas de concepto en investigación: para estudiar el impacto del pruning y la destilación en modelos de la familia Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 7,8 GB, por lo que se necesitan al menos 8-10 GB de RAM o VRAM para cargar el modelo completo. Con Q2_K, la memoria requerida es aproximadamente el tamaño del archivo más overhead de contexto (unos 1-2 GB adicionales).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (p. ej., RTX 3060, RTX 4060, RTX 4070, A10, L4). En CPU, se puede ejecutar con 16 GB de RAM.
- Compatibilidad: funciona con llama.cpp, Ollama (si se importa), y servidores compatibles con GGUF (llama-server, text-generation-webui).
- Latencia y throughput: no disponibles, pero en Q2_K se espera una velocidad de generación de unos 5-15 tokens/s en CPU moderna y 30-60 tokens/s en GPU de gama media, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (p. ej., Qwen3-8B, Llama-3.2-11B, o versiones cuantizadas de otros modelos de 20B). La falta de benchmarks y especificaciones técnicas impide una comparación objetiva.

## Limitaciones y advertencias

- Cuantización Q2_K muy agresiva: puede degradar significativamente la calidad del texto generado, aumentar la tasa de errores y reducir la coherencia.
- Sin información sobre sesgos o alucinaciones: no se ha publicado ninguna evaluación de sesgos ni de fiabilidad.
- Contexto limitado: al no especificarse la longitud de contexto, se recomienda usar valores conservadores (p. ej., 2048 tokens) para evitar degradación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo original puede tener restricciones adicionales; se debe verificar la licencia de `exnivo/Qwen3.8-20B-Minitron`.
- Sin garantías de producción: al ser una conversión reciente sin descargas ni validación, no se recomienda para entornos críticos sin pruebas previas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Miltos22/Qwen3.8-20B-Minitron-Q2_K-GGUF
- Modelo base: https://huggingface.co/exnivo/Qwen3.8-20B-Minitron
- Herramienta de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
