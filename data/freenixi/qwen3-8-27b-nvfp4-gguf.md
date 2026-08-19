# Freenixi/Qwen3.8-27B-NVFP4-GGUF

## Resumen

Qwen3.8-27B-NVFP4-GGUF es una conversión comunitaria a formato GGUF del checkpoint NVFP4 de Unsloth basado en el modelo Qwen/Qwen3.8-27B, un modelo de lenguaje y visión (vision-language) de 27.320 millones de parámetros desarrollado por Alibaba Qwen. El repositorio, publicado por el usuario Freenixi, está pensado para inferencia local de alto rendimiento con runtimes compatibles con llama.cpp, como LM Studio.

El modelo combina comprensión de imagen y vídeo, control flexible de razonamiento (thinking mode), mejoras en tool calling y Multi-Token Prediction (MTP). La conversión preserva un layout híbrido de tensores NVFP4 nativos para las capas FFN 0-55, tensores Q8_0 para las capas FFN 56-63 y pesos procedentes de la parte FP8 del checkpoint original, y tensores en BF16/F32 para normas y tensores auxiliares. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este repositorio radica en que ofrece una alternativa cuantizada en GGUF de un modelo multimodal de última generación, optimizada para hardware Blackwell (NVFP4) y ejecutable en GPUs de consumo, sin necesidad de infraestructura de servidor dedicada. Incluye además el projector de visión en BF16 (mmproj-BF16.gguf) necesario para procesar entradas de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con attention Gated DeltaNet y MTP |
| Parametros totales | 27.320.698.192 (~27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, Q8_0, BF16/F32 (híbrido) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El checkpoint fuente es un modelo de compresión mixta NVFP4 + FP8 (compressed-tensors) en lugar de una cuantización 4-bit uniforme convencional. La conversión a GGUF se realizó de forma que los tensores NVFP4 soportados se repaquetan como NVFP4 nativo en GGUF, los tensores de origen FP8 se descuantizan y se escriben como Q8_0 mediante la opción `--fp8-as-q8`, y los tensores BF16/F32 se mantienen en formatos de coma flotante adecuados. El auditor de tensores (`gguf_dump.py`) confirma 168 tensores NVFP4 (56 capas × 3 pesos FFN: down, gate, up), 233 tensores Q8_0 y 1.202 tensores totales. Las capas FFN 0-55 usan NVFP4; las capas 56-63 usan Q8_0 procedente de FP8; las proyecciones de attention Gated DeltaNet de la porción FP8 también se almacenan como Q8_0.

El modelo base Qwen3.8-27B es un modelo nativo de visión-lenguaje con comprensión de imagen y vídeo, control flexible de pensamiento, mejoras en tool use y MTP (Multi-Token Prediction). Los detalles específicos del entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO) no se detallan en la información proporcionada. La conversión se realizó con llama.cpp aplicando un parche de compatibilidad local para el layout mixto NVFP4+FP8, que puede dejar de ser necesario conforme evolucione el soporte upstream.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Comprensión de imagen y vídeo (modelo nativo vision-language).
- Tool calling / function calling mejorado respecto a generaciones anteriores de Qwen.
- Control flexible de modo de pensamiento (thinking mode activable o desactivable).
- Multi-Token Prediction (MTP) para predicción de múltiples tokens por paso.
- Atención basada en Gated DeltaNet, que reduce coste de memoria frente a attention softmax convencional.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Asistente multimodal local: el modelo puede responder preguntas sobre imágenes y vídeos en tiempo real en un equipo de escritorio con GPU de consumo, gracias al formato GGUF y al projector de visión BF16 incluido. Es adecuado para entornos donde la privacidad impide enviar datos a APIs externas.
- Análisis de documentos con contenido visual: combinando la comprensión de imagen con razonamiento de texto, puede extraer información de capturas, diagramas, gráficos y documentos escaneados, integrándose en pipelines de procesamiento documental.
- Agente conversacional con tool calling: soporta function calling, lo que permite conectarlo a APIs, bases de datos y servicios externos para construir asistentes que ejecutan acciones reales (consultas, reservas, automatización de tareas).
- Generación y revisión de código: el modelo base Qwen3.8-27B mantiene las capacidades de generación de código de la familia Qwen; con la cuantización NVFP4 cabe en una RTX 4090 y puede usarse en entornos de desarrollo locales sin conexión.
- Razonamiento multi-paso con modo pensamiento: el control flexible de thinking permite activar cadenas de razonamiento explícitas para tareas complejas de matemáticas, lógica o planificación, y desactivarlas para respuestas rápidas en tareas simples.
- Despliegue en edge computing con hardware Blackwell: la cuantización NVFP4 está optimizada para GPUs Blackwell (RTX 50xx, B200), lo que permite inferencia de baja latencia en estaciones de trabajo y servidores edge con consumos energéticos contenidos.
- Prototipado de aplicaciones multimodales con LM Studio: al ser un GGUF compatible con llama.cpp, se puede cargar directamente en LM Studio para experimentar con prompts de imagen y texto, evaluar calidad de respuestas y ajustar parámetros de decodificación antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal ocupa aproximadamente 21,58 GiB (23,17 GB decimal) y el projector de visión 931 MB. Para cargar el modelo completo en GPU se necesitan al menos 24 GB de VRAM, quedando margen limitado para KV cache.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutarlo con KV cache reducida; A100 40 GB, H100 80 GB o RTX 5090 (32 GB) ofrecen margen cómodo. GPUs Blackwell (RTX 50xx, B200) aprovechan mejor la cuantización NVFP4.
- En consumer GPU: sí, cabe en RTX 4090 y RTX 5090, aunque con limitaciones de contexto si la ventana es larga.
- Opciones de despliegue: LM Studio (validado por el autor), llama.cpp, Ollama y cualquier runtime compatible con GGUF. Para despliegue en servidor pueden usarse backends GGUF de vLLM o TGI.
- Latencia y throughput: no disponibles; dependen del hardware, la longitud de contexto y el número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repo) | 27,3B | no disponible | Sí (imagen/vídeo) | Apache 2.0 | GGUF (NVFP4/Q8_0) |
| Qwen3-32B | 32B | no disponible | No | Apache 2.0 | BF16, GGUF, etc. |
| Qwen3-30B-A3B | 30B total, 3B activos (MoE) | no disponible | No | Apache 2.0 | BF16, GGUF, etc. |

La comparativa se limita a datos estructurales, ya que no se dispone de resultados de benchmarks para Qwen3.8-27B en la información proporcionada. Qwen3.8-27B se diferencia de Qwen3-32B y Qwen3-30B-A3B por ser nativamente multimodal (imagen y vídeo) y por incorporar MTP y attention Gated DeltaNet. La cuantización NVFP4 está específicamente diseñada para hardware Blackwell, lo que puede ofrecer ventajas de rendimiento frente a cuantizaciones genéricas en esas GPUs.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: no es un release de Qwen ni de Unsloth; puede contener errores de conversión o diferencias de comportamiento respecto al checkpoint original.
- Cuantización mixta: la combinación de NVFP4, Q8_0 y BF16/F32 puede introducir degradación de calidad no uniforme entre capas, especialmente en las capas FFN 56-63 cuantizadas a Q8_0.
- Requiere runtime con soporte NVFP4: es necesario usar una versión reciente de llama.cpp o LM Studio con soporte para NVFP4; versiones antiguas pueden fallar o ignorar la cuantización.
- Parche de compatibilidad: la conversión requirió un parche local que puede no estar presente en versiones futuras de llama.cpp; la reproducibilidad depende de la evolución del soporte upstream.
- El projector de visión (mmproj-BF16.gguf) debe mantenerse junto al modelo principal en el mismo directorio; sin él, la funcionalidad de imagen no está disponible.
- Longitud de contexto no confirmada: no se especifica en la documentación del repositorio; conviene verificarla con pruebas empíricas antes de usarlo en producción.
- Idiomas soportados no documentados: la cobertura multilingüe no está especificada, aunque la familia Qwen suele cubrir decenas de idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo o con entradas visuales ambiguas.
- Sesgos: no se documentan sesgos específicos; se recomienda auditar el modelo antes de desplegarlo en aplicaciones sensibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Freenixi/Qwen3.8-27B-NVFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 fuente: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Repositorio GGUF de Unsloth (projector de visión): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Projector de visión: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/blob/main/mmproj-BF16.gguf
- Herramienta de conversión: https://github.com/ggml-org/llama.cpp
