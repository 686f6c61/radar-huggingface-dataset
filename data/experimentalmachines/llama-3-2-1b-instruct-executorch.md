# experimentalmachines/Llama-3.2-1B-Instruct-ExecuTorch

## Resumen

Llama-3.2-1B-Instruct-ExecuTorch es una exportación del modelo meta-llama/Llama-3.2-1B-Instruct (revisión `9213176726f5`) al formato ExecuTorch, publicada por el usuario experimentalmachines. No se trata de un modelo nuevo entrenado desde cero, sino de un conjunto de artefactos `.pte` listos para inferencia en dispositivo (on-device) en Android, con backends específicos para CPU (XNNPACK), GPU (Vulkan), NPU de Qualcomm (QNN HTP sobre Snapdragon 8 Elite) y NPU de MediaTek (NeuroPilot sobre Dimensity 9400). El objetivo es permitir ejecutar un modelo de 1.000 millones de parámetros en teléfonos móviles sin conexión a la nube.

El repositorio ofrece ventanas de contexto fijas por archivo, desde 2.048 hasta 32.768 tokens según backend, con cuantización GPTQ 8da4w (8 bits para pesos, 4 bits para activaciones) en los backends XNNPACK y Vulkan, y esquemas híbridos o a16w8 en los backends NPU. Los tamaños de los artefactos van desde 0,28 GB por fragmento en MediaTek hasta 1,39 GB en Qualcomm QNN, lo que los hace viables en presupuestos de memoria de teléfonos de gama alta.

Su relevancia actual radica en que facilita el despliegue de LLM en Android con aceleración por NPU, un área donde la fragmentación de runtimes y formatos es un obstáculo importante. Al estar basado en Llama 3.2 1B Instruct, hereda las capacidades conversacionales y multilingües del modelo original, aunque con las limitaciones propias de su tamaño y de la cuantización agresiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3.2-1B-Instruct) |
| Parámetros totales | 1.000 millones (aproximado, según el modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Fija por archivo: 2.048, 4.096, 8.192, 16.384 o 32.768 tokens según backend |
| Tipos de cuantización | GPTQ 8da4w (XNNPACK, Vulkan); híbrida QNN (Qualcomm); a16w8 (MediaTek NeuroPilot) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | llama3.2 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama-3.2-1B-Instruct, un transformer decoder-only de Meta con aproximadamente 1.000 millones de parámetros, ajustado con instrucciones. Esta publicación no incluye información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card del modelo base de Meta.

La innovación técnica de esta exportación reside en el pipeline de compilación a ExecuTorch 1.5.1 y en la cuantización específica por backend. Los artefactos XNNPACK y Vulkan emplean GPTQ con esquema 8da4w: pesos en 8 bits y activaciones en 4 bits, lo que reduce el tamaño a menos de 1 GB en CPU. Los artefactos para Qualcomm QNN usan un esquema híbrido orientado al HTP (Hexagon Tensor Processor) del Snapdragon 8 Elite, y los de MediaTek NeuroPilot emplean a16w8 (activaciones 16 bits, pesos 8 bits) fragmentados en cuatro chunks para el Dimensity 9400. La ventana de contexto está fijada dentro del archivo: el runtime reserva toda la caché KV al cargar, de modo que el usuario debe elegir la ventana más grande que el dispositivo pueda sostener. Cada carpeta incluye un `config.json` con el campo `fits_phone_budget`, que estima la viabilidad frente a un presupuesto de 5 GB.

## Capacidades

- Generación de texto conversacional e instruccional, heredada de Llama-3.2-1B-Instruct.
- Razonamiento básico y respuesta a preguntas en formato chat.
- Generación de código y tareas sencillas de matemáticas, limitadas por el tamaño de 1B parámetros.
- Soporte multilingüe heredado del modelo base (no detallado en esta publicación).
- Inferencia totalmente local y offline en Android, sin dependencia de servidores.
- Ejecución acelerada por GPU (Vulkan) y NPU (Qualcomm QNN, MediaTek NeuroPilot) además de CPU (XNNPACK).
- Integración con la aplicación Android openweights y con cualquier runtime ExecuTorch 1.5.1.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en esta publicación.

## Casos de uso

- Asistentes conversacionales offline en Android: el modelo puede gestionar diálogos multi-turno dentro de la ventana fijada (hasta 32.768 tokens en XNNPACK y Vulkan), sin enviar datos a la nube, lo que resulta adecuado para aplicaciones de privacidad estricta.
- Autocompletado y redacción en teclados móviles: con artefactos de menos de 1 GB en CPU, se puede integrar en un IME para sugerencias contextuales en tiempo real sin coste de servidor.
- Resumen de notas y mensajes locales: la ventana de 8k o 16k permite procesar conversaciones o documentos cortos directamente en el dispositivo.
- Clasificación y extracción de información en aplicaciones de campo: útil en entornos sin conectividad (logística, inspección, salud rural) donde se requiere procesar texto localmente.
- Prototipado de aplicaciones LLM en Android: sirve como referencia para desarrolladores que quieran evaluar ExecuTorch con backends CPU, GPU y NPU antes de invertir en modelos mayores.
- Demostraciones de aceleración por NPU: los artefactos QNN y NeuroPilot permiten medir el rendimiento de Snapdragon 8 Elite y Dimensity 9400 en cargas de decodificación autoregresiva.
- Filtrado y moderación de contenido en el dispositivo: un modelo de 1B puede actuar como primera capa de clasificación de texto sensible antes de recurrir a un modelo mayor en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que las pruebas de humo (smoke tests) de los artefactos XNNPACK generaron la palabra "Paris" correctamente; los artefactos Vulkan, QNN y MediaTek solo fueron verificados estructuralmente, sin ejecución en runtime NPU real.

## Requisitos de hardware

- VRAM/RAM estimada: entre 0,96 GB (XNNPACK, 2k) y 1,39 GB (QNN SM8750, 16k) para los pesos; la caché KV se reserva completa al cargar y crece con la ventana elegida. El presupuesto de referencia de la model card es de 5 GB.
- GPU recomendadas: no aplica para GPU de escritorio; el objetivo son GPU integradas en SoC Android vía Vulkan.
- NPU soportadas: Qualcomm Hexagon HTP en SM8750 (Snapdragon 8 Elite) y MediaTek NeuroPilot en MT6991 (Dimensity 9400).
- CPU: cualquier arm64 con backend XNNPACK.
- ¿Cabe en hardware de consumo? Sí, en teléfonos Android de gama alta con al menos 5 GB de memoria disponible; los artefactos XNNPACK de 0,96 GB son los más ligeros.
- Opciones de despliegue: runtime ExecuTorch 1.5.1, aplicación Android openweights (https://github.com/alpharomercoma/openweights). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con el formato `.pte`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-ExecuTorch | ~1B | 2k–32k (fijo por archivo) | `.pte` (ExecuTorch) | llama3.2 | Hugging Face, 1.043 descargas |
| meta-llama/Llama-3.2-1B-Instruct | ~1B | 128k (según model card de Meta) | safetensors | llama3.2 | Hugging Face |
| Gemma 2 2B (Google) | ~2B | 8k | safetensors, GGUF | Gemma Terms | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32k | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparativa se limita a datos públicos de los modelos base; no se dispone de benchmarks comparativos de esta exportación frente a las alternativas. La ventaja diferencial de esta publicación es el formato ExecuTorch con backends NPU para Android, que los modelos anteriores no ofrecen de forma nativa.

## Limitaciones y advertencias

- Modelo de 1B parámetros: capacidad de razonamiento y conocimiento factual limitada; propenso a errores en tareas complejas.
- Cuantización agresiva (8da4w, a16w8): puede degradar la calidad respecto al modelo en precisión completa; no se han publicado evaluaciones de calidad tras la cuantización.
- Ventana de contexto fija por archivo: no se puede ampliar en tiempo de ejecución; hay que elegir el artefacto adecuado antes del despliegue.
- Los artefactos Vulkan, QNN y MediaTek solo se verificaron estructuralmente, no en ejecución real sobre NPU; el rendimiento y la corrección en dispositivo no están validados por el autor.
- Idiomas soportados no documentados en esta publicación; deben consultarse en la model card de Meta.
- Licencia llama3.2: impone restricciones de uso comercial y obligaciones de atribución; revisar los términos de Meta antes de usar en producción.
- Riesgo de alucinación inherente a los LLM de este tamaño, especialmente en dominios especializados.
- Sesgos conocidos del modelo base no documentados en esta publicación.
- El repositorio ocupa 38,7 GB por incluir múltiples variantes y ventanas; la descarga completa no es necesaria si solo se usa un backend.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/Llama-3.2-1B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Aplicación Android openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch (repositorio oficial): no disponible en la información proporcionada
