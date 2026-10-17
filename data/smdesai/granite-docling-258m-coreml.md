# smdesai/granite-docling-258M-coreml

## Resumen

granite-docling-258M-coreml es la conversión a Core ML del modelo IBM granite-docling-258M, un modelo multimodal de 258 millones de parámetros especializado en convertir la imagen de una página de documento en DocTags: una representación estructurada que incluye texto, cajas de maquetación, tablas, fórmulas, bloques de código y listas. El repositorio lo publica el usuario smdesai y no introduce pesos nuevos: todos los pesos son de IBM, y este repositorio solo cambia el formato para que el modelo se ejecute de forma nativa en iPhone, iPad y Mac.

La arquitectura combina un codificador de visión SigLIP2 con un conector pixel-shuffle y un decodificador transformer tipo Granite de 30 capas con grouped-query attention, RoPE y una ventana de contexto máxima de 4096 tokens. El decodificador se ha dividido en tres bloques de 10 capas con estado (MLState) para que cada caché KV quepa en la memoria de un iPhone. El modelo se distribuye en FP16, sin cuantización, y el autor reporta que la decodificación voraz (greedy) en GPU produce una salida idéntica token a token a la del modelo original de Hugging Face.

Su relevancia actual reside en que permite hacer conversión de documentos con OCR y análisis de maquetación íntegramente en el dispositivo, sin conexión a la nube, con velocidades de 42-49 tok/s en un iPhone 17 Pro y 48-53 tok/s en un Mac con chip M-series. Está pensado para desarrolladores de apps iOS/iPadOS/macOS que necesitan procesar documentos preservando la privacidad de los datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Granite) con codificador de visión SigLIP2 y conector pixel-shuffle; decodificador con grouped-query attention y RoPE |
| Parámetros totales | 258M (según el nombre del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | FP16 sin cuantización; el autor indica que la cuantización INT8 por tensor rompe el modelo |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (.mlpackage), embed_tokens_fp16.bin (float16), tokenizer.json |
| Pipeline | image-text-to-text |
| Vocabulario | 100352 tokens |
| Dimensión oculta | 576 |
| Número de capas del decodificador | 30 (3 bloques de 10) |
| Caché KV | [10, 3, 4096, 128] por bloque |
| Requisitos de sistema | iOS 18 / iPadOS 18 / macOS 15 o superior |
| Modelo base | ibm-granite/granite-docling-258M |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal compuesto por un codificador de visión SigLIP2 con un conector de tipo pixel-shuffle que produce 64 embeddings por cada tile de 512×512 píxeles, y un decodificador transformer decoder-only de 30 capas con dimensión oculta 576. El decodificador usa grouped-query attention, RoPE con base theta 100000 (32 valores repetidos dos veces, disposición rotate-half) y una proyección final de vocabulario de 100352 entradas. La ventana de contexto está limitada a 4096 posiciones.

La conversión a Core ML introduce varias adaptaciones técnicas relevantes. El primer token del prompt del decodificador genera activaciones residuales del orden de 1,2×10⁵ (una "massive activation" de attention sink) que desbordan FP16; la conversión reformula RMSNorm para mantener valores finitos en FP16 y pliega los pesos de normalización y escala en las proyecciones adyacentes. La grouped-query attention se calcula sin repetir las matrices K/V. El decodificador se divide en tres bloques de 10 capas con estado compartido entre las funciones prefill y decode, y se recomienda ejecutar en CPU + GPU en lugar de Neural Engine, ya que la actualización del estado KV permanece en la CPU y el codificador de visión es menos preciso en el Neural Engine (coseno mínimo de 0,983 frente a 0,9987 en GPU). No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información disponible.

## Capacidades

- Conversión de imagen de página a DocTags: genera texto, cajas de maquetación, tablas, fórmulas, código y listas en una representación estructurada.
- OCR y reconocimiento de texto sobre documentos escaneados o fotografiados.
- Análisis de maquetación y segmentación de regiones de página.
- Extracción de tablas y fórmulas a partir de la imagen.
- Procesamiento de documentos de varias páginas mediante teselado en tiles de 512×512 con vista global adicional.
- Ejecución totalmente on-device, sin servicio en la nube.
- Decodificación voraz (greedy) token-idéntica a la del modelo original en GPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés.
- Idioma: únicamente inglés (en).

## Casos de uso

- Digitalización de documentos en apps iOS/iPadOS: una aplicación puede tomar la foto de una página y obtener DocTags estructurados directamente en el dispositivo, sin enviar el documento a un servidor, lo que preserva la confidencialidad de contratos, informes médicos o documentación interna.
- Extracción de tablas de informes financieros: el modelo genera representaciones de tabla a partir de la imagen, lo que permite integrar los datos en hojas de cálculo u hojas de cálculo o bases de datos en flujos de oficina móviles.
- Conversión de artículos científicos (por ejemplo, muestras de arXiv) que contienen fórmulas, código y listas, manteniendo la estructura para su posterior indexación o relectura.
- Procesamiento por lotes de facturas y recibos en un Mac: al ejecutarse a 48-53 tok/s y caber en memoria unificada, se pueden encadenar documentos sin infraestructura de GPU dedicada.
- Accesibilidad: lectura estructurada de documentos para usuarios con discapacidad visual, aprovechando la detección de maquetación y el orden de lectura.
- Archivado y búsqueda documental local: extracción de texto y estructura para indexar documentos escaneados en un dispositivo sin conexión.
- Automatización de formularios y papeleo administrativo en apps de escritorio macOS, convirtiendo páginas escaneadas en datos estructurados antes de rellenar campos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de rendimiento de inferencia:

| Dispositivo | Unidades de cómputo | Decodificación | Memoria |
|---|---|---|---|
| iPhone 17 Pro | CPU + GPU | 42-49 tok/s | ~280 MB |
| Mac con chip M-series | CPU + GPU | 48-53 tok/s | no disponible |

## Requisitos de hardware

- El repositorio completo ocupa 0,6 GB; los pesos se distribuyen en FP16 (codificador de visión 179 MB, tres bloques de decodificador de 68 MB cada uno, cabeza 110 MB, tabla de embeddings 110 MB, tokenizer 6,8 MB).
- Memoria en tiempo de ejecución reportada: ~280 MB en iPhone 17 Pro.
- No está pensado para GPU tipo A100, H100 o RTX 4090: es un artefacto Core ML específico para el ecosistema Apple (CPU + GPU).
- Cabe en dispositivos de consumo Apple: iPhone 17 Pro y Mac con chip M-series son los dispositivos de referencia citados.
- Requiere iOS 18 / iPadOS 18 / macOS 15 o superior, ya que depende de MLState y de modelos multifunción.
- Opciones de despliegue: añadir los archivos .mlpackage a un target de Xcode (se compilan a .mlmodelc) o compilarlos en tiempo de ejecución con `MLModel.compileModel(at:)`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia/throughput: 42-49 tok/s en iPhone 17 Pro y 48-53 tok/s en Mac M-series, con decodificación en CPU + GPU. No se recomienda el Neural Engine.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Plataforma | Licencia |
|---|---|---|---|---|---|
| smdesai/granite-docling-258M-coreml | 258M | 4096 | Core ML (FP16) | iOS/iPadOS/macOS | apache-2.0 |
| ibm-granite/granite-docling-258M (base) | 258M | 4096 | safetensors (PyTorch) | GPU/servidor | apache-2.0 |

La comparación más directa es con el modelo base de IBM, del que esta versión hereda todos los pesos y la misma licencia. Para otras alternativas de conversión de documentos de tamaño comparable, no disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo solo está etiquetado para inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- Riesgo de bucle en decodificación: la model card advierte que la decodificación voraz puede entrar en bucles en algunas páginas; se recomienda detener la generación cuando se repita un ciclo corto de tokens.
- Contexto limitado a 4096 tokens, lo que restringe el tamaño de las páginas o el número de tiles procesables en una sola pasada.
- Sensibilidad del hardware: el Neural Engine produce menor precisión en el codificador de visión (coseno mínimo 0,983 frente a 0,9987 en GPU), lo que puede alterar tokens casi empatados; se debe usar CPU + GPU.
- Cuantización: la cuantización INT8 por tensor rompe el modelo; hay que mantener los pesos en FP16.
- Dependencia de plataforma: requiere iOS 18 / iPadOS 18 / macOS 15 o superior y no se puede ejecutar en GPU NVIDIA ni en entornos de servidor convencionales.
- Licencia apache-2.0, que permite uso comercial, pero se debe citar y atribuir a IBM como autor de los pesos originales.
- El modelo no tiene capacidades declaradas de tool calling, agentes ni razonamiento multi-paso.
- Posibles sesgos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smdesai/granite-docling-258M-coreml
- Modelo base: https://huggingface.co/ibm-granite/granite-docling-258M
- DocTags (referencia enlazada desde la model card): https://huggingface.co/ibm-granite/granite-docling-258M
