# Bosalt/TranslateGemma-4-26B-A4B-v2-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

TranslateGemma-4-26B-A4B-v2-PV-MACaQ-4bit-MXFP4-MLX es una cuantización de 4 bits en formato MXFP4 del checkpoint `Bosalt/TranslateGemma-4-26B-A4B-v2`, un modelo de traducción automática derivado de la familia Gemma 4 y ajustado para cubrir las seis lenguas oficiales de la ONU más japones, coreano, indonesio y alemán. El autor, Bosalt, publica esta versión optimizada para MLX, el framework de Apple para ejecutar modelos en silicio unificado, y la distribuye a través de la herramienta Basalt.

El modelo base es una arquitectura Mixture-of-Experts (MoE) con 26B parámetros nominales y aproximadamente 4B activos por token, según la nomenclatura A4B del nombre. Esta cuantización reduce el checkpoint BF16 original de 51,61 GB a 15,01 GB (factor de compresión de 3,44x) preservando la torre de visión, las normas y los routers en BF16 nativo, mientras que las capas lineales y los expertos MoE se comprimen a MXFP4.

La relevancia de esta ficha radica en que documenta una técnica de cuantización poco habitual (PV-MACaQ con rotación de Hadamard y refinamiento por coordenadas) aplicada a un modelo de traducción multilingüe, con métricas de calidad de cuantización medidas (SQNR y MSE) en lugar de estimaciones. Está pensada para desarrolladores que quieran ejecutar traducción de alta calidad en hardware Apple con 16 GB de memoria unificada o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Gemma 4, con torre de visión |
| Parametros totales | 5.172.987.086 (según safetensors del repo cuantizado); el nombre del modelo base indica 26B nominales con ~4B activos |
| Parametros activos | ~4B (según el sufijo A4B del nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MXFP4 para capas lineales y expertos MoE (group_size=32, hadamard_block=32, códigos E2M1, escalas E8M0); embeddings en 8-bit affine (group_size=64); visión, normas y routers en BF16 |
| Idiomas soportados | 6 lenguas oficiales de la ONU (árabe, chino, español, francés, inglés, ruso) más japonés, coreano, indonesio y alemán, según la model card del modelo base |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 4-bit MXFP4 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Gemma 4 con atención estándar y capas de expertos conmutados (`SwitchLinear`), además de una torre de visión que se conserva en BF16 en esta cuantización. El checkpoint base se distribuye como un merge standalone en BF16 de todos los componentes, e incluye explícitamente la afirmación de que no hay filtración de datos de entrenamiento de WMT24++ (0% de fuga), lo que es relevante para evaluar la validez de los resultados de traducción.

La innovación técnica principal de esta ficha no está en el entrenamiento del modelo base sino en el procedimiento de cuantización: PV-MACaQ aplica una rotación de Hadamard a los pesos antes de cuantizar, añade un `pre_scale` sensible a las activaciones y ejecuta dos rondas de refinamiento (paso P con mínimos cuadrados sobre `pre_scale`, paso V con refinamiento de coordenadas sobre escalas E8M0 y códigos E2M1). Los resultados medidos frente a una cuantización RTN MXFP4 convencional son una mejora de SQNR de 18,59 dB a 19,09 dB (+0,50 dB) y una reducción del error cuadrático medio del 10,8%. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO.

## Capacidades

- Traducción automática multilingüe entre las seis lenguas oficiales de la ONU y japonés, coreano, indonesio y alemán.
- Generación de texto y procesamiento de lenguaje natural en el modelo base.
- Capacidades de visión gracias a la torre de visión preservada en BF16 (aunque no se documenta su uso específico en tareas de traducción multimodal).
- Razonamiento y comprensión multilingüe derivados de la familia Gemma 4.
- Posible soporte de tool calling y function calling del modelo base (no confirmado en la información disponible para esta ficha).
- Ejecución nativa en MLX sobre hardware Apple con memoria unificada.
- No se documenta un modo de razonamiento explícito (thinking mode) ni capacidades de audio.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo cubre las seis lenguas de la ONU más cuatro idiomas asiáticos y europeos, lo que permite traducir manuales y guías entre pares como inglés-chino o español-japonés con un único checkpoint.
- Localización de productos para mercados internacionales: al soportar simultáneamente alemán, japonés, coreano e indonesio, se puede usar para adaptar textos de marketing y interfaz a múltiples mercados sin cambiar de modelo.
- Traducción en el puesto de trabajo en Mac: gracias al formato MLX y a los 15 GB del repo, el modelo puede ejecutarse localmente en un Mac con memoria unificada suficiente, lo que permite traducir documentos confidenciales sin enviarlos a la nube.
- Evaluación de calidad de traducción: al declarar 0% de fuga en WMT24++, es adecuado como referencia en experimentos controlados de traducción donde se necesita un checkpoint sin contaminación de benchmarks.
- Investigación en cuantización: las métricas SQNR y MSE publicadas permiten usar este checkpoint como caso de estudio para comparar técnicas de cuantización (RTN frente a PV-MACaQ) en modelos MoE multilingües.
- Integración en pipelines de Basalt: el modelo se sirve con `basalt serve`, por lo que puede integrarse como servicio de traducción en flujos automatizados de procesamiento documental.
- Traducción asistida por visión: la torre de visión en BF16 permite, en principio, traducir texto presente en imágenes (OCR implícito), aunque esta capacidad no está documentada específicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, WMT24++) en la información disponible. La model card solo reporta métricas internas de cuantización:

| Métrica | Valor |
|---|---|
| Módulos `MACaQQuantizedLinear` cuantizados (2D) | 205 |
| Módulos `MACaQSwitchLinear` MoE cuantizados (3D) | 90 |
| Tamaño de entrada (BF16) | 51,61 GB |
| Tamaño de salida (PV-MACaQ MXFP4) | 15,01 GB (3,44x) |
| SQNR medio RTN MXFP4 | 18,59 dB |
| SQNR medio PV-MACaQ MXFP4 | 19,09 dB (+0,50 dB) |
| Reducción media de MSE frente a RTN | 10,8% |

## Requisitos de hardware

- VRAM estimada: al menos 16 GB de memoria unificada para cargar los 15,01 GB de pesos más overhead de contexto y activaciones; 24 GB o más recomendable para contextos largos.
- GPU recomendadas: hardware Apple Silicon (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max) con memoria unificada de 16 GB o superior; no está pensado para GPUs NVIDIA, ya que el formato es MLX.
- Cabe en consumer GPU de Apple: sí, en equipos con 16 GB o más de memoria unificada; en configuraciones de 8 GB no es viable.
- Opciones de despliegue: Basalt (`basalt serve`), librería MLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (TranslateGemma-4-26B-A4B-v2 PV-MACaQ 4-bit) | 5,17B en safetensors; ~26B nominales / ~4B activos | no disponible | no disponible | MLX safetensors MXFP4 | Cuantización 4-bit para Apple Silicon, 10 idiomas |
| Bosalt/TranslateGemma-4-26B-A4B-v2 (base BF16) | ~26B nominales / ~4B activos | no disponible | no disponible | safetensors BF16 | Checkpoint original de 51,61 GB, sin cuantizar |
| Gemma 4 base (familia) | no disponible | no disponible | no disponible | no disponible | Modelo generalista del que deriva el ajuste de traducción |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible, por lo que no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de desplegarlo en producción.
- El modelo está cuantizado a 4 bits, lo que introduce pérdida de precisión frente al BF16 original; aunque las métricas de SQNR mejoran frente a RTN, no se han publicado evaluaciones de calidad de traducción tras la cuantización.
- No hay datos publicados de benchmarks de traducción (BLEU, COMET, WMT24++), por lo que el rendimiento real en tareas de traducción no está verificado de forma independiente.
- La longitud de contexto no está documentada, lo que limita la planificación de casos de uso con documentos largos.
- El formato MLX restringe la ejecución a hardware Apple; no es portable a GPUs NVIDIA ni a despliegues en servidores Linux convencionales.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en pares de idiomas poco representados o en textos de dominio especializado.
- Posibles sesgos heredados del corpus de entrenamiento del modelo base; no se documenta ninguna evaluación de sesgos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.
- La torre de visión se conserva en BF16, pero no se documenta su uso ni su calidad tras el proceso de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bosalt/TranslateGemma-4-26B-A4B-v2-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/Bosalt/TranslateGemma-4-26B-A4B-v2
- Repositorio Basalt (herramienta de despliegue): https://github.com/goodmai/basalt
- Framework MLX: https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
