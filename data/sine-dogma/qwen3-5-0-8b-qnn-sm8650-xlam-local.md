# sine-dogma/Qwen3.5-0.8B-QNN-SM8650-XLAM-LOCAL

## Resumen

`sine-dogma/Qwen3.5-0.8B-QNN-SM8650-XLAM-LOCAL` es un paquete de cinco cuantizaciones nativas QNN del checkpoint `Qwen/Qwen3.5-0.8B`, generadas para el SoC Qualcomm Snapdragon 8 Gen 3 (SM8650) con acelerador HTP v75. El autor, `sine-dogma`, ha compilado los artefactos en local con herramientas QAIRT, sin recurrir a servicios de conversión alojados, y ha calibrado cada variante con un subconjunto reproducible de 256 ejemplos del dataset `Salesforce/xlam-function-calling-60k`. El objetivo es claro: disponer de un modelo de texto de 0,8 mil millones de parámetros ejecutable en la NPU de un teléfono Android de gama alta, algo que los formatos habituales (GGUF, safetensors) no permiten directamente.

La relevancia de esta publicación no está en el modelo base, sino en el empaquetado. Se ofrecen cinco precisiones (W4A8, W4A16, W8A8, W8A16 y W16A16) con binarios de contexto de entre 1,019 GB y 2,081 GB, quince grafos por variante y ocho context binaries por variante. El paquete incluye tokenizador, plantilla de chat, configuración de texto, metadatos de calibración y sumas SHA-256. Todo el conjunto suma 6,717 GB en el repositorio.

Ahora bien, se trata de un artefacto experimental y de infraestructura, no de un modelo listo para producción. El propio autor advierte de que la ejecución en teléfono, la precisión del modelo cuantizado, la velocidad de decodificación, el consumo y la RAM pico no se han medido. Además, requiere un runner Android QNN personalizado: no se puede cargar con Transformers, llama.cpp, Ollama ni una configuración Genie sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B), exportado a grafos QNN; 24 capas decoder en 6 particiones; combinación de linear-attention (estados convolucionales/recurrentes) y full-attention (caché K/V) |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (capacidad estática del export, incluye prompt y tokens generados); prefill de 64 tokens y decode de 1 token |
| Tipos de cuantizacion | W4A8, W4A16, W8A8, W8A16, W16A16 (pesos/activaciones; A16 denota cuantización entera de activaciones, no FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QNN context binaries (DLC compilados), más `tokenizer/`, `text-config.json`, `calibration.json`, `model-info.json`, `SHA256SUMS` |

| Variante | Bits de pesos | Bits de activación solicitados | Bits de embedding | Tamano del context binary |
|---|---:|---:|---:|---:|
| W4A8 | 4 | 8 | 8 | 1,019 GB |
| W4A16 | 4 | 16 | 16 | 1,275 GB |
| W8A8 | 8 | 8 | 8 | 1,043 GB |
| W8A16 | 8 | 16 | 16 | 1,300 GB |
| W16A16 | 16 | 16 | 16 | 2,081 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 0,8 mil millones de parámetros. El export a QNN conserva las 24 capas del decoder repartidas en seis particiones y combina dos mecanismos de atención: linear-attention con estados convolucionales y recurrentes persistentes, y full-attention con caché de claves y valores. La E/S nativa de tensores es FP32 salvo los IDs de tokens, que son INT32. El lote es de tamaño uno, con prefill de 64 tokens y decodificación de un token por paso.

No hay fine-tuning: es cuantización post-entrenamiento calibrada sobre el checkpoint original en la revisión `2fc06364715b967f1860aea9cf38778875588b17`. La calibración usó 256 entradas reales capturadas de xLAM, idénticas en las cinco precisiones. El proceso produjo 75 cuantizaciones locales correctas y 40 enlaces de contexto, con inspección nativa de targeting SM8650/HTP v75, inventario de grafos, formas y dtypes de tensores, mapeos de salida y checksums SHA-256. Los 15 DLC en coma flotante se validaron contra ONNX Runtime en el backend CPU de QNN, con límites de error absoluto de 0,02 y RMS de 0,002. Se conserva la normalización RMS como aritmética primitiva con epsilon dentro de la raíz cuadrada, evitando operadores `RmsNorm` generados por el conversor. Conviene subrayar que estas comprobaciones certifican la corrección de la conversión a coma flotante, no la precisión del modelo cuantizado.

## Capacidades

- Generación de texto con el modelo base Qwen3.5-0.8B, orientada a instrucciones y conversación mediante la plantilla de chat original.
- Formato de llamada a funciones (tool calling) en el estilo de xLAM, ya que la calibración se realizó con `Salesforce/xlam-function-calling-60k`; no obstante, no se ha medido la calidad del tool calling tras la cuantización.
- Razonamiento multi-turno dentro de una ventana estática de 2.048 tokens compartidos entre prompt y respuesta.
- Capacidades multilingües heredadas del modelo base; el autor no publica la lista de idiomas soportados.
- Ejecución en NPU Qualcomm HTP v75 (Snapdragon 8 Gen 3), con estados de capa persistentes gestionados por el runner.
- No incluye visión, audio ni modo thinking explícito documentado en esta ficha.

## Casos de uso

- Prototipado de asistentes on-device en Android: integración de un LLM de 0,8B en la NPU de un Galaxy S24 (variantes Snapdragon) para tareas de texto sin conexión, aprovechando los binarios de contexto ya compilados.
- Investigación en cuantización para NPU: comparación empírica de las cinco precisiones (W4A8 a W16A16) sobre el mismo conjunto de calibración xLAM para estudiar el compromiso entre tamaño de binario y calidad, una vez implementado el runner.
- Evaluación de tool calling en el borde: uso del modelo para generar llamadas a funciones en asistentes móviles, con la calibración específicamente orientada a este dominio.
- Benchmarking de latencia y consumo en HTP v75: el paquete permite medir prefill de 64 tokens y decode de 1 token por paso en hardware real, un caso de estudio útil para quien investigue despliegue NPU.
- Reproducibilidad de pipelines QAIRT: los checksums, metadatos y `CALIBRATION.md` permiten replicar la conversión en un host Windows con el SDK local y comparar artefactos.
- Pruebas de integración de runners Android personalizados: validación de contratos de entrada/salida de los 15 grafos, gestión de máscaras, posiciones rotatorias, padding de prefill y estados persistentes.
- Docencia y experimentación con cuantización post-entrenamiento: ejemplo completo de calibración con dataset real y verificación numérica contra ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la precisión del modelo cuantizado, la velocidad de decodificación, el consumo energético y la RAM pico en tiempo de ejecución no se han medido. La única validación numérica publicada es la comparación de los DLC en coma flotante contra ONNX Runtime (error absoluto ≤ 0,02 y RMS ≤ 0,002), que no equivale a una evaluación de calidad del modelo.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Gen 3 (SM8650) con HTP v75, incluidas las variantes Snapdragon de la familia Samsung Galaxy S24.
- Runtime: Android QNN HTP compatible con el build nativo registrado `v2.51.40.260930230134`.
- Almacenamiento: entre 1,019 GB (W4A8) y 2,081 GB (W16A16) por variante de context binary; el repositorio completo ocupa 6,717 GB.
- VRAM/RAM: no disponible; el tamaño de fichero no es una estimación de RAM en ejecución según el autor.
- GPU de escritorio: no aplica; estos binarios no se ejecutan en CUDA ni en GPUs consumer. La validación en host se realizó en el backend CPU de QNN.
- Despliegue: requiere un runner Android QNN personalizado; no es compatible con vLLM, llama.cpp, Ollama, TGI, Transformers ni una configuración Genie sin modificar.
- Latencia y throughput: no disponibles (no medidos).
- Nota de compatibilidad: el enlazado desactiva la optimización de convolución HMX de profundidad corta por compatibilidad; las opciones reales quedan registradas en los metadatos de cada binario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Estado |
|---|---:|---|---|---|---|
| sine-dogma/Qwen3.5-0.8B-QNN-SM8650-XLAM-LOCAL | 0,8B | 2.048 tokens (estático) | QNN context binaries para Snapdragon 8 Gen 3 | Apache 2.0 | Experimental, sin mediciones en dispositivo |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible en esta ficha | safetensors (Transformers) | Apache 2.0 | Modelo base de referencia |
| Cuantizaciones GGUF de modelos ~0,8B | ~0,8B | según export | GGUF (llama.cpp, Ollama) | según modelo base | Ejecutables en CPU/GPU, no en NPU Qualcomm |

La comparación directa con alternativas es limitada: no se dispone de otros paquetes QNN equivalentes en la información proporcionada, y los benchmarks del modelo base no se han incluido. La diferencia principal frente a GGUF es el destino de ejecución (NPU frente a CPU/GPU) y el requisito de runner propio.

## Limitaciones y advertencias

- Artefacto experimental: ejecución en teléfono, precisión cuantizada, velocidad, consumo y RAM pico no verificados.
- Requiere un runner Android QNN a medida; no funciona con pipelines estándar de Transformers, GGUF, Ollama, vLLM ni Genie sin modificar.
- Contexto estático de 2.048 tokens, muy inferior al máximo del checkpoint original; con menos de 64 slots disponibles hay que usar llamadas de un token.
- Calibrado únicamente con xLAM (tool calling); el rendimiento en otros dominios puede degradarse y no se ha medido.
- Compatibilidad limitada a SM8650/HTP v75; no verificado en otras generaciones Snapdragon ni en variantes Galaxy S24 con otro SoC.
- Los resultados de validación corresponden a los DLC en coma flotante, no al modelo cuantizado; no se reclama mejora de calidad ni de velocidad frente a otros conjuntos de calibración.
- Las etiquetas de bits idénticas no garantizan equivalencia numérica con artefactos generados por servicios de conversión alojados.
- Sesgos y riesgo de alucinación: no documentados específicamente para esta cuantización; heredados del modelo base Qwen3.5-0.8B.
- Idiomas soportados: no disponibles en la información publicada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en producción desaconseja su despliegue sin pruebas propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sine-dogma/Qwen3.5-0.8B-QNN-SM8650-XLAM-LOCAL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión del checkpoint base: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Dataset de calibración: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Documentación de calibración del repo: `CALIBRATION.md` (incluido en el repositorio)
- Metadatos por variante: `variants.json`, `model-info.json` y `SHA256SUMS` (incluidos en el repositorio)
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
