# shawnw3i/Qwen3.8-27B-AWQ-MTP

## Resumen

El modelo `shawnw3i/Qwen3.8-27B-AWQ-MTP` es una cuantización AWQ de 4 bits del modelo multimodal nativo `Qwen/Qwen3.8-27B`, desarrollado por el equipo de Alibaba Qwen. Esta versión cuantizada, publicada por el usuario shawnw3i, está optimizada para inferencia eficiente con soporte de decodificación especulativa MTP (Multi-Token Prediction) y kernel AWQ Marlin, lo que permite alcanzar velocidades superiores a 110 tokens por segundo en una GPU A800 de 80 GB con vLLM. El modelo base es un transformer denso de 27 000 millones de parámetros con atención híbrida (linear attention en 48 de sus 64 capas), una torre de visión integrada y una ventana de contexto nativa de 262 000 tokens, extensible a 1 millón. Esta cuantización reduce el tamaño del modelo a aproximadamente 6 500 millones de parámetros efectivos en safetensors, manteniendo las capacidades multimodales y de razonamiento del original, y está diseñada para su uso en producción con vLLM, incluyendo soporte para agentes y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (linear attention en 48/64 capas), torre de visión y cabeza MTP |
| Parametros totales | 6 498 258 160 (según safetensors, correspondiente a la cuantización AWQ 4-bit) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativo, extensible a 1 000 000; en esta cuantización se recomienda 65 536 según el ejemplo de vLLM |
| Tipos de cuantizacion | AWQ 4-bit (con soporte de kernel Marlin) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 27 000 millones de parámetros con una arquitectura híbrida de atención: 48 de sus 64 capas utilizan atención lineal (linear attention) para reducir el coste computacional en secuencias largas, mientras que las 16 restantes emplean atención completa. Incluye una torre de visión que permite procesar entradas de imagen junto con texto, y una cabeza MTP integrada que facilita la decodificación especulativa. El modelo fue entrenado por Alibaba con un enfoque en tareas de codificación, flujos de trabajo agénticos y automatización de oficina. La cuantización AWQ (Activation-aware Weight Quantization) aplicada por shawnw3i reduce los pesos a 4 bits, con un tamaño de grupo reducido a 64 (según actualización del autor) para evitar la pérdida de precisión en la atención no tradicional. No se dispone de detalles adicionales sobre el dataset de entrenamiento o el proceso de alineación (RLHF/DPO) de esta versión cuantizada.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto, permitiendo responder preguntas sobre imágenes, describir contenido visual y combinar información de ambos dominios.
- Razonamiento paso a paso: compatible con el parser de razonamiento `qwen3` en vLLM, lo que permite extraer cadenas de pensamiento estructuradas.
- Decodificación especulativa MTP: la cabeza MTP integrada acelera la generación al predecir múltiples tokens por paso, mejorando el throughput.
- Soporte de tool calling y agentes: el modelo base está diseñado para flujos de trabajo agénticos, y la cuantización mantiene esta capacidad, permitiendo integración con herramientas externas.
- Multilingüe: aunque no se especifican los idiomas exactos, el modelo base de Qwen soporta múltiples lenguas; esta cuantización no altera esa característica.
- Contexto largo: con 262K tokens nativos, puede manejar documentos extensos, conversaciones largas y análisis de código de gran tamaño.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), manteniendo el historial completo de la interacción y resolviendo consultas complejas con soporte de tool calling para acceder a bases de conocimiento o APIs.
- Generación de código en producción: gracias a su entrenamiento en tareas de codificación y al soporte de decodificación especulativa, puede integrarse en pipelines de CI/CD para autocompletar código, revisar pull requests o generar documentación técnica, con baja latencia gracias a los 110+ tok/s en hardware adecuado.
- Análisis de documentos visuales: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o formularios escaneados, útil en automatización de oficina y procesamiento de facturas.
- Asistentes de programación con visión: puede interpretar imágenes de errores de pantalla o diagramas de arquitectura y sugerir correcciones, combinando visión y razonamiento técnico.
- Agentes autónomos de investigación: con soporte de tool calling y razonamiento multi-paso, puede buscar información en la web, ejecutar consultas y sintetizar resultados en informes estructurados.
- Despliegue en entornos con recursos limitados: al ser una cuantización 4-bit, cabe en GPUs de consumo como la RTX 4090 (24 GB), permitiendo ejecutar un modelo de 27B multimodal localmente sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `Qwen3.8-27B` ha sido evaluado en tareas como MathVision, pero no se proporcionan cifras concretas en la documentación de esta cuantización. Se menciona un rendimiento de 110+ tokens por segundo en una A800 80 GB con vLLM 0.27.1, MTP habilitado y caché KV en fp8, pero no hay comparativas formales con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización AWQ 4-bit de un modelo de 27B, los pesos ocupan aproximadamente 14-16 GB (el repositorio tiene un tamaño de 33.7 GB, que incluye archivos adicionales). Se recomienda al menos 16 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: A800 80 GB (probada con 110+ tok/s), A100 80 GB, H100, o GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). También es compatible con hardware AMD Ryzen AI Max y Radeon según el blog de AMD.
- Opciones de despliegue: vLLM (con soporte nativo para AWQ Marlin y MTP), llama.cpp, Ollama, LM Studio y TGI. El comando de ejemplo para vLLM es: `vllm serve shawnw3i/Qwen3.8-27B-AWQ-MTP --max-model-len 65536 --reasoning-parser qwen3 --speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Latencia y throughput: 110+ tok/s en A800 80 GB con vLLM y MTP habilitado; el throughput puede variar según el hardware y la configuración de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa formal con otros modelos de la misma categoría. El modelo base `Qwen3.8-27B` compite con otros modelos multimodales de ~27B como Qwen2.5-VL-27B o Llama 3.2 11B, pero no se han publicado datos comparativos en la documentación de esta cuantización. Se recomienda consultar los benchmarks oficiales del modelo base en el repositorio de Qwen para una evaluación detallada.

## Limitaciones y advertencias

- Sesgos y contenido no filtrado: el modelo está etiquetado como "uncensored", lo que implica que puede generar contenido inapropiado o sensible sin filtros de seguridad. Debe usarse con precaución en aplicaciones públicas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar información, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Degradación por cuantización: la cuantización AWQ 4-bit puede reducir ligeramente la precisión en tareas de razonamiento matemático o lógico en comparación con el modelo original en fp16.
- Limitaciones de contexto: aunque el modelo base soporta 262K tokens, la cuantización se recomienda con un máximo de 65 536 tokens según el ejemplo de vLLM, posiblemente por limitaciones de memoria o estabilidad.
- Idiomas no especificados: no se ha documentado oficialmente la lista de idiomas soportados, lo que puede dificultar su uso en aplicaciones multilingües críticas.
- Dependencia de vLLM para MTP: la decodificación especulativa MTP requiere vLLM 0.27.1 o superior; otros frameworks pueden no soportar esta característica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shawnw3i/Qwen3.8-27B-AWQ-MTP
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
