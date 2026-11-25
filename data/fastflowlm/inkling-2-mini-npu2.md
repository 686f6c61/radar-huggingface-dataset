# FastFlowLM/Inkling-2-Mini-NPU2

## Resumen

Inkling-2-Mini-NPU2 es una distribución cuantizada del modelo multimodal Inkling-2-Mini de Thinking Machines Lab, preparada por FastFlowLM para ejecutarse sobre la NPU AMD XDNA 2 (presente en los procesadores AMD Ryzen AI de última generación). No es un modelo nuevo: es el mismo modelo base de 26.400 millones de parámetros totales y 5.400 millones activos por token, con arquitectura Mixture-of-Experts de 128 expertos enrutados (8 activos), reempaquetado en el formato propietario `q4nx` del runtime FastFlowLM (`flm`).

La relevancia de este paquete es la aceleración por hardware: el decode completo, incluido el `lm_head`, se ejecuta sobre la NPU, no sobre CPU ni GPU. Esto permite desplegar un MoE de 26B con contexto de hasta 1M tokens en equipos con Ryzen AI sin depender de una GPU dedicada. El paquete ocupa 17,3 GB en disco y acepta entrada de texto e imagen, con salida de texto; la entrada de audio del modelo base queda fuera de esta distribución.

La cuantización es selectiva: proyecciones de atención, densas y de expertos en Q4_K (4,5 bits por peso), `lm_head` en Q8_0, embeddings en BF16 y router/controladores de bucle en FP32. Los pesos se calibraron con una importance matrix publicada por unsloth, lo que reduce la divergencia KL frente al modelo BF16 entre un 12% y un 15% según el dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes de pesos compartidos (24 capas, las 12 centrales se ejecutan tres veces) y torre de visión de 23 capas |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 5.400 millones (5,4B) por token; 128 expertos enrutados, 8 activos |
| Longitud de contexto | Hasta 1.000.000 tokens (1M) en el modelo base |
| Tipos de cuantizacion | Q4_K (4,5 bits/peso) en atención, densas y expertos; Q8_0 en `lm_head`; BF16 en embeddings, convoluciones cortas y proyecciones sink; FP32 en router y controladores de bucle |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (igual que el modelo base) |
| Formato de pesos | `q4nx` (formato propietario de FastFlowLM; no cargable por otros runtimes) |
| Tamano del paquete | 17,3 GB |
| Runtime requerido | FLM >= v1.0.14 |
| Modalidad | Texto e imagen de entrada, texto de salida (sin audio) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts de 24 capas con 128 expertos enrutados y 8 activos por token. Su rasgo estructural más singular es el bucle de capas centrales: las 12 capas intermedias se ejecutan tres veces reutilizando los mismos pesos, lo que incrementa la profundidad efectiva sin aumentar el recuento de parámetros. El router y los controladores de bucle se mantienen en FP32 en esta distribución para preservar la estabilidad del enrutamiento tras la cuantización.

La torre de visión tiene 23 capas y 1.024 dimensiones, con un merger de parches 2x2 que proyecta a las 2.304 dimensiones del modelo de lenguaje. Se distribuye en BF16 sin cuantizar (`vision_weight.q4nx`, 0,64 GB); sus multiplicaciones matriciales y atención corren en la NPU en bfp16 y el resto en CPU. Las imágenes no se redimensionan de forma arbitraria: cada celda de 40x40 píxeles equivale a un token visual, con un máximo de 4.096 tokens por imagen (2.560x2.560 píxeles); las imágenes mayores se escalan hacia abajo. La variable `FLM_INKLING2_IMAGE_MAX_TOKENS` ajusta ese límite y el valor 0 lo elimina.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. La calibración de la cuantización sí está documentada: los escalares y mínimos de Q4_K se eligieron con la importance matrix de unsloth (`imatrix_unsloth.gguf_file` en `unsloth/Inkling-2-Mini-GGUF`), calculada sobre el conjunto `unsloth_calibration_Inkling-2-Mini.conv.jsonl`. Cada experto se pondera con sus propias estadísticas y las 128 columnas rellenadas de las proyecciones down de expertos pesan cero.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto de hasta 1M tokens en el modelo base.
- Razonamiento y matemáticas: el modelo base está etiquetado como `thinkingmachines/Inkling-2-Mini` y su nombre sugiere capacidades de razonamiento, aunque no se detallan modos explícitos de pensamiento en la información disponible.
- Comprensión de imágenes: descripción de fotos, lectura de fechas y titulares en capturas, con hasta 4.096 tokens visuales por imagen.
- Entrada de imagen en formato image-text-to-text; la entrada de audio del modelo base no está incluida en este paquete.
- Ejecución íntegra del decode (incluido `lm_head`) sobre la NPU AMD XDNA 2.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están listados).

## Casos de uso

- Asistentes locales en portátiles con Ryzen AI: al ejecutarse sobre la NPU, el modelo libera la GPU y la CPU para otras tareas, lo que permite un asistente conversacional siempre activo en un equipo de sobremesa o portátil sin GPU dedicada.
- Análisis de documentos escaneados y capturas: la torre de visión lee fechas y titulares con una precisión verificada frente al modelo BF16 en llama.cpp, lo que lo hace apto para extracción de datos de facturas, recibos o pantallazos.
- Procesamiento de imágenes en flujos de accesibilidad: descripción de fotos para usuarios con discapacidad visual, con latencias de 0,3 s para una imagen de 640x480 (192 tokens) y 0,6 s a 525 tokens.
- Transcripción y resumen de reuniones a partir de capturas de pizarras o diapositivas: el contexto de 1M tokens permite adjuntar varias imágenes y el texto de la reunión en una sola ventana.
- Chat de soporte técnico con contexto largo: la ventana de 1M tokens del modelo base admite historiales extensos o manuales completos sin truncar, útil en atención al cliente con documentación técnica adjunta.
- Prototipado de agentes multimodales en hardware de consumo: al no requerir GPU, sirve para validar pipelines de visión-lenguaje en entornos de desarrollo con presupuesto de hardware limitado.
- Inferencia en el borde (edge) para entornos con requisitos de privacidad: al ejecutarse localmente en la NPU, los datos no salen del dispositivo, lo que encaja en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se documentan métricas de fidelidad de la cuantización y de latencia:

| Metrica | Valor |
|---|---|
| Divergencia KL media (32 × 512 tokens), wikitext-2, Q4_K sin imatrix | 0,0184 |
| Divergencia KL media, wikitext-2, Q4_K con imatrix de unsloth | 0,0162 (-12%) |
| Divergencia KL media, código y documentación (fuera de calibración), Q4_K sin imatrix | 0,0135 |
| Divergencia KL media, código y documentación, Q4_K con imatrix | 0,0115 (-15%) |
| Reducción del percentil 99,9 de KL | ~25% en ambos conjuntos |
| Error L2 relativo de embeddings de imagen (48 a 4.096 tokens) | 0,11 a 0,15 (referencia BF16 frente a FP32: 0,06) |
| Latencia de codificación de imagen 640x480 (192 tokens) | ~0,3 s |
| Latencia de codificación de imagen 525 tokens | ~0,6 s |
| Latencia de codificación de imagen 4.096 tokens | ~7,6 s (la atención crece con el cuadrado del número de tokens) |

No se proporcionan datos de throughput de generación de texto (tokens/s) ni de latencia de decode en la información disponible.

## Requisitos de hardware

- NPU: AMD XDNA 2 (procesadores AMD Ryzen AI compatibles). El decode completo, incluido el `lm_head`, se ejecuta en la NPU.
- Almacenamiento: 17,3 GB para el paquete de pesos, más 0,64 GB del archivo de visión.
- VRAM: no aplica en el sentido tradicional; el modelo no requiere GPU dedicada. No se especifica la memoria de sistema o de NPU necesaria para cargar el paquete.
- GPU recomendadas: no aplica; el runtime `flm` está orientado a la NPU AMD XDNA 2.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el formato `q4nx` no es cargable por otros runtimes.
- Opciones de despliegue: FastFlowLM `flm` >= v1.0.14, con `flm run inkling-2:mini` para ejecución interactiva o `flm serve inkling-2:mini` para servir como API. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se documentan latencias de codificación de imagen (0,3 s a 7,6 s según tokens); no hay cifras de generación de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-NPU2 (este) | 26,4B | 5,4B | 1M | q4nx | Apache 2.0 | NPU AMD XDNA 2 |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B | 5,4B | 1M | safetensors/BF16 | Apache 2.0 | GPU/CPU |
| unsloth/Inkling-2-Mini-GGUF | 26,4B | 5,4B | 1M | GGUF (Q4_K, etc.) | Apache 2.0 | CPU/GPU con llama.cpp |

La comparación con alternativas de otros fabricantes (por ejemplo, MoE de tamaño similar como Mixtral o Qwen-MoE) no está disponible en la información proporcionada. La diferencia clave frente al modelo base y frente a la versión GGUF de unsloth es el backend de ejecución: este paquete solo funciona sobre la NPU AMD XDNA 2 mediante `flm`, mientras que las otras dos opciones requieren GPU o CPU con runtimes estándar.

## Limitaciones y advertencias

- Formato propietario: los pesos en `q4nx` no se pueden cargar con llama.cpp, vLLM, Ollama ni TGI; el modelo queda atado al runtime FastFlowLM y a la NPU AMD XDNA 2.
- Dependencia de versión: requiere FLM >= v1.0.14; versiones anteriores no soportan este modelo.
- Sin audio: la entrada de audio del modelo base no está incluida en este paquete.
- Cuantización con pérdida: aunque la imatrix reduce la divergencia KL un 12-15%, sigue habiendo degradación frente al BF16 (KL de 0,0162 en wikitext-2), con un percentil 99,9 de KL aproximadamente un 25% mejor que sin imatrix, pero no nulo.
- Límite de imagen: máximo de 4.096 tokens por imagen (2.560x2.560 píxeles); las imágenes mayores se escalan, lo que puede perder detalle. La atención crece con el cuadrado del número de tokens, con 7,6 s para una imagen de 4.096 tokens.
- Idiomas no documentados: no se especifica la cobertura lingüística, lo que impide garantizar calidad en castellano u otros idiomas distintos del inglés.
- Sesgos y alucinaciones: no se documentan análisis específicos de sesgo ni tasas de alucinación en la información disponible; se aplican los riesgos habituales de los modelos generativos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime FastFlowLM por separado.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval o GSM8K que permitan evaluar la calidad absoluta del modelo; las métricas publicadas miden fidelidad de cuantización y latencia de visión, no capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FastFlowLM/Inkling-2-Mini-NPU2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
- GGUF e imatrix de unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Perfil de unsloth en Hugging Face: https://huggingface.co/unsloth
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
