# jaehyeono/Qwen3.8-27B-W3A16-GPTQ

## Resumen

El modelo `jaehyeono/Qwen3.8-27B-W3A16-GPTQ` es una versión cuantizada a 3 bits (INT3) del modelo vision-lenguaje Qwen3.8-27B de Alibaba, producida mediante GPTQ con la librería `llm-compressor`. El autor, jaehyeono, ha cuantizado únicamente el decoder de lenguaje (256 módulos lineales), dejando la torre de visión, `lm_head` y las proyecciones de atención lineal en bf16. El resultado es un checkpoint de aproximadamente 22,8 GB (frente a los 55,6 GB del original), lo que supone una reducción de ~2,4x, manteniendo la funcionalidad completa de entrada imagen+texto.

El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros con arquitectura híbrida (atención lineal en 48 de sus 64 capas), torre de visión, ventana de contexto nativa de 262K tokens (extensible a 1M) y un cabezal de draft MTP integrado para decodificación especulativa. Esta cuantización agresiva a 3 bits está pensada para despliegue en entornos con restricciones de memoria, aunque el propio autor advierte que no se ha evaluado la precisión relativa al modelo base y que la calidad a 3 bits es más degradada que las variantes de 4 u 8 bits.

La relevancia de este checkpoint radica en que permite ejecutar un VLM de 27B en hardware de consumo (GPU con 24 GB de VRAM) sin renunciar a las capacidades multimodales, aunque con la salvedad de que la calidad no está validada mediante benchmarks. Requiere `transformers >= 5.14` por la arquitectura `qwen3_5`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (hybrid attention: 48 capas con linear attention + 16 con full attention, vision tower, MTP draft head) |
| Parametros totales | 27B (modelo base); checkpoint cuantizado almacena 10.474.655.472 parámetros en safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K nativo, extensible a 1M (heredado del modelo base) |
| Tipos de cuantizacion | INT3, group size 128, simétrico, activaciones en bf16 (W3A16) |
| Idiomas soportados | No disponible (no se especifica en la model card; el modelo base Qwen3.8 soporta múltiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `compressed-tensors` / `pack-quantized` (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención híbrida: 48 de sus 64 capas usan atención lineal (proyecciones de bajo rango) y las 16 restantes usan atención completa, lo que reduce el coste computacional en contextos largos. Incluye una torre de visión (depth 27, hidden 1152) para procesamiento de imágenes y un cabezal MTP (multi-token prediction) que actúa como draft head para decodificación especulativa. El entrenamiento del modelo base incluye datos multimodales (imagen, texto y vídeo) y mejoras específicas en código y productividad ofimática.

La cuantización se realizó con `GPTQModifier` de `llm-compressor` 0.13.0 (compressed-tensors 0.18.0), con calibración sobre 128 pares imagen-pie de Flickr30k, observer `memoryless_minmax`, dampening fraction 0.01 y activación estática. Solo se cuantizó el decoder de lenguaje; la torre de visión, `lm_head` y las proyecciones de atención lineal se mantienen en bf16 para preservar la ruta visual y evitar degradación. No se aplicó fine-tuning posterior a la cuantización.

## Capacidades

- Generación de texto e imagen a texto: el modelo acepta entradas multimodales (imagen + texto) y produce respuestas coherentes ancladas a la imagen.
- Razonamiento multimodal: capacidad de razonar sobre contenido visual (descripción, análisis, preguntas sobre la imagen).
- Comprensión de vídeo: el modelo base soporta entrada de vídeo, aunque la cuantización no altera esta capacidad (la torre de visión permanece en bf16).
- Tool calling / function calling: el modelo base soporta llamada a herramientas, lo que permite integrarlo en agentes que ejecutan acciones externas.
- Agentes multi-paso: soporta tareas agénticas con razonamiento encadenado y configuración de profundidad de pensamiento (thinking mode).
- Longitud de contexto extendida: 262K tokens nativos, extensible a 1M, útil para documentos largos o conversaciones extensas.
- Decodificación especulativa: el cabezal MTP integrado permite acelerar la generación, aunque su eficacia tras la cuantización no está medida.
- Multilingüismo: el modelo base es multilingüe, pero no se especifican los idiomas concretos en la información disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede procesar PDFs escaneados o capturas de pantalla y extraer información estructurada, gracias a su ventana de 262K tokens y la entrada visual. Adecuado para tareas de extracción de datos en entornos con memoria limitada.
- Asistente de atención al cliente multimodal: integrado en un chatbot, puede recibir capturas de pantalla de errores o fotos de productos y responder con instrucciones precisas, manteniendo conversaciones multi-turno largas.
- Generación de código asistida por imagen: el desarrollador sube un diagrama o mockup y el modelo genera el código correspondiente, aprovechando las mejoras en coding del modelo base.
- Automatización de tareas ofimáticas: el modelo puede interpretar tablas, gráficos o diapositivas y generar resúmenes, correos o informes, reduciendo el coste de VRAM frente al modelo sin cuantizar.
- Agente de investigación con herramientas: combinado con tool calling, puede buscar en la web, ejecutar código y razonar sobre resultados, todo ello con entrada visual (por ejemplo, gráficos de resultados).
- Despliegue en edge o GPU de consumo: con ~23 GB de pesos, cabe en una RTX 3090/4090 (24 GB) con overhead de activaciones, permitiendo ejecutar un VLM de 27B en hardware no profesional para prototipado o demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre este checkpoint, solo se verificó que carga y produce salidas coherentes ancladas a la imagen. La precisión relativa al modelo base no está medida, por lo que cualquier uso en producción requiere validación previa.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~22,8 GB en INT3. Con activaciones en bf16 y overhead de inferencia, se estima un consumo de 24-28 GB para contexto corto. Para contexto largo (262K) se necesitaría más memoria o técnicas de atención eficiente.
- GPU recomendadas: RTX 3090/4090 (24 GB) para contexto corto; A100 40GB o H100 para contexto largo o mayor throughput.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de 24 GB, pero con margen ajustado. En GPUs de 16 GB (RTX 4080, 3080 Ti) no es viable sin offloading a CPU.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM (si soporta `qwen3_5` y compressed-tensors), TGI, o llama.cpp si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput: no disponibles. La decodificación especulativa del MTP podría acelerar la generación, pero su efecto tras la cuantización no está medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | bf16 | Apache-2.0 | Modelo original, calidad completa |
| Qwen3.8-27B-W3A16-GPTQ (este) | 27B | 262K | INT3 W3A16 | Apache-2.0 | ~2,4x menor, calidad no validada |
| Qwen3.8-27B (variante 4-bit, hipotética) | 27B | 262K | INT4 | Apache-2.0 | No disponible en la información; se espera menor degradación que 3-bit |

No se dispone de datos de otros modelos comparables (p. ej., Llama-3.2-11B-VL o InternVL) en la información proporcionada. La comparación directa con el modelo base es la más relevante: la cuantización a 3 bits es agresiva y probablemente degrade más que una de 4 bits, pero no hay mediciones.

## Limitaciones y advertencias

- Sin evaluación de benchmarks: el autor no ha medido la precisión relativa al modelo base. La calidad a 3 bits es desconocida y debe validarse antes de cualquier uso en producción.
- Degradación esperada: la cuantización a 3 bits es más agresiva que 4 u 8 bits; se espera una pérdida de calidad notable en tareas de razonamiento complejo o generación de código.
- Requisitos de versión: necesita `transformers >= 5.14`; versiones anteriores no pueden cargar la arquitectura `qwen3_5`.
- Riesgo de alucinación: inherente a los modelos de lenguaje, posiblemente acentuado por la cuantización agresiva.
- Sesgos: no se han evaluado sesgos específicos de este checkpoint; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero la calidad no validada puede suponer un riesgo legal si se despliega en entornos críticos.
- Limitación de idiomas: no se especifican los idiomas soportados; se asume multilingüe por el modelo base, pero sin confirmación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyeono/Qwen3.8-27B-W3A16-GPTQ
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- QwenCloud (modelo base): https://www.qwencloud.com/models/qwen3.8-27b
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
