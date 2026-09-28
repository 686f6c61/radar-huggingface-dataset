# satuke/s1-mini-coreai-ios

## Resumen

satuke/s1-mini-coreai-ios es la conversión del modelo superwhisper/s1-mini —un ajuste fino de Qwen3-0.6B orientado a limpiar transcripciones de voz a texto— a un bundle de Apple Core AI que se ejecuta en el Neural Engine del iPhone con iOS 27 o superior. No aporta pesos nuevos: mantiene los del original, cuantizados a 8 bits mediante palettización k-means (`per_grouped_channel`, tamaño de grupo 8), con los embeddings sin palettizar y cómputo en float16.

El problema que ataca es la normalización de dictado: tomar la salida cruda de un sistema de reconocimiento de voz y devolver texto puntuado, con mayúsculas correctas y sin muletillas, todo en local y sin conexión. Su relevancia es de formato más que de modelado: demuestra que un modelo de unos 600 millones de parámetros puede ejecutarse íntegramente en el Neural Engine de un teléfono, un terreno que los ficheros GGUF o safetensors no cubren.

El repositorio ocupa 0,6 GB y se publica bajo la licencia `s1-mini-license` (Apache-2.0 más un término adicional de Superwhisper que obliga a identificar el modelo como "S1-mini" de "Superwhisper" en cualquier uso o distribución). Su autor lo emplea de forma experimental en el teclado de voz noboard. Como caveat de partida: no hay benchmarks estándar publicados, solo un banco de pruebas interno de dictado de 66 casos aportado por el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B), exportado como bundle Apple Core AI |
| Parámetros totales | ≈600 millones (modelo base Qwen3-0.6B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base, sin confirmar en esta conversión) |
| Tipos de cuantización | 8 bits por palettización k-means (`per_grouped_channel`, tamaño de grupo 8); embeddings sin palettizar; cómputo en float16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | `s1-mini-license`: Apache-2.0 más término adicional de Superwhisper (atribución obligatoria) |
| Formato de pesos | bundle Apple Core AI (`coreai-models`); no safetensors ni GGUF |
| Tamaño del repositorio | 0,6 GB |
| Modelo base | superwhisper/s1-mini (ajuste fino de Qwen3-0.6B de Alibaba Cloud, Apache-2.0) |
| Plataforma de ejecución | iOS 27 o superior con Neural Engine |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B: un transformer decoder-only denso de aproximadamente 600 millones de parámetros, ajustado por Superwhisper para la tarea concreta de limpieza de transcripciones de voz (puntuación, mayúsculas, eliminación de repeticiones y muletillas). No hay información pública en la model card sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se emplearon técnicas de alineación como RLHF o DPO.

La innovación de esta ficha está en el proceso de conversión, no en el entrenamiento. Se exportó con la receta de Apple `coreai-models` mediante la orden `coreai.llm.export superwhisper/s1-mini --platform iOS --experimental --compute-precision float16`, aplicando después palettización k-means de 8 bits con agrupación por canal (`per_grouped_channel`, tamaño de grupo 8) y dejando los embeddings sin palettizar. El autor señala que la receta mixta 4/8 bits de Apple degradaba el modelo de forma severa, mientras que esta exportación de 8 bits igualó al original en su banco de dictado. Además, se modificó `tokenizer/chat_template.jinja` para que el modo *thinking* permanezca desactivado salvo que se pase `enable_thinking` a `true` de forma explícita.

## Capacidades

- Normalización de transcripciones de voz a texto: inserción de puntuación, corrección de mayúsculas, eliminación de muletillas y repeticiones, y formateo general del texto dictado.
- Generación de texto genérica, heredada de Qwen3-0.6B y declarada en el pipeline `text-generation`, aunque no documentada en detalle para esta conversión.
- Ejecución totalmente local en el Neural Engine del iPhone, sin llamadas a servicios en la nube y sin necesidad de conexión.
- Modo *thinking* desactivado por defecto: el autor indica que el modelo "nunca debe pensar"; el razonamiento solo se activa si se fuerza `enable_thinking = true`.
- Integración mediante `CoreAILanguageModel(resourcesAt:)` de `coreai-models`, pensada para incrustarse en teclados de voz y aplicaciones iOS (uso experimental en el teclado noboard).
- Capacidades multilingües: no disponibles; el modelo está etiquetado exclusivamente para inglés.
- Tool calling / function calling: no documentado en esta conversión.
- Visión, audio nativo o matemáticas: no documentado; el tamaño de 0,6 B y el ajuste a dictado hacen previsible un rendimiento limitado fuera de ese dominio.

## Casos de uso

- Limpieza de dictado en teclados de iOS: el modelo recibe la salida cruda del reconocedor de voz y devuelve texto con puntuación y mayúsculas, integrándose en el flujo del teclado (noboard) sin salir del dispositivo.
- Notas de voz en aplicaciones de productividad: transcripciones de reuniones o ideas dictadas que se guardan ya formateadas, evitando una revisión manual posterior.
- Asistentes de accesibilidad: usuarios con movilidad reducida o dificultades de escritura pueden dictar y obtener texto publicable, con la ventaja de que todo el proceso ocurre en local.
- Escenarios con requisitos estrictos de privacidad: al ejecutarse en el Neural Engine, el texto dictado no abandona el teléfono, lo que encaja en entornos sanitarios, jurídicos o corporativos con prohibición de subir audio a la nube.
- Preprocesado antes de un modelo mayor: limpiar y compactar la transcripción en el dispositivo para reducir tokens antes de enviarla a un LLM en servidor.
- Aplicaciones de subtitulado o actas en iOS: post-procesado de segmentos transcritos para homogeneizar estilo, puntuación y formato antes de exportarlos.
- Automatizaciones con Atajos de iOS: normalizar texto procedente del dictado dentro de flujos que combinan varias apps, aprovechando que la inferencia es local y de baja latencia esperada.

## Benchmarks y rendimiento

El autor únicamente publica un banco de pruebas interno de dictado de 66 casos, puntuado sobre 5. No hay resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar.

| Evaluación | Este bundle (8 bits, Core AI) | superwhisper/s1-mini (original) | Exportación mixta 4/8 bits de Apple |
|---|---|---|---|
| Banco de dictado interno (66 casos, escala 0-5) | 4,20 | 4,18 | degradación severa (sin cifra publicada) |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: Neural Engine de Apple en un dispositivo con iOS 27 o superior. No hay confirmación de los modelos concretos de iPhone o iPad compatibles, más allá del requisito de versión de sistema.
- Huella de almacenamiento: 0,6 GB de repositorio para los pesos cuantizados a 8 bits, lo que sitúa el consumo de memoria en inferencia en torno a ese orden de magnitud (cifra no confirmada por el autor).
- GPU de servidor: no aplica. El formato de pesos es un bundle Core AI, por lo que no se puede cargar en GPU NVIDIA, AMD ni en aceleradores de centro de datos.
- GPU de consumo: no aplica por el mismo motivo; el modelo no está pensado para RTX 4090 ni similares.
- Opciones de despliegue: exclusivamente mediante `CoreAILanguageModel(resourcesAt:)` de la librería `coreai-models` de Apple. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia o tokens por segundo en el Neural Engine.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| satuke/s1-mini-coreai-ios | ≈600 M | no disponible | Bundle Apple Core AI; iOS 27+ con Neural Engine | `s1-mini-license` (Apache-2.0 + término de atribución) | Repositorio de 0,6 GB; sin descargas ni likes registrados |
| superwhisper/s1-mini | ≈600 M | no disponible | Pesos originales del ajuste fino (formato no detallado en la información disponible) | `s1-mini-license` | Modelo base del que deriva esta conversión |
| Qwen3-0.6B | 600 M | 32.768 tokens nativos según la documentación de Alibaba (no confirmado en esta ficha) | safetensors y cuantizaciones estándar; servidores y equipos de escritorio | Apache-2.0 | Ampliamente distribuido, con soporte en llama.cpp, vLLM, Ollama y MLX |

La comparación relevante no es de calidad bruta sino de encaje: frente a Qwen3-0.6B, este bundle pierde portabilidad y capacidades generales a cambio de ejecución en el Neural Engine; frente a superwhisper/s1-mini, aporta un formato desplegable en iOS a costa de depender de iOS 27 y de la librería Core AI.

## Limitaciones y advertencias

- Idioma único: el modelo solo está etiquetado para inglés, por lo que no es utilizable para dictado en castellano ni en otras lenguas.
- Tamaño reducido: 600 millones de parámetros implican errores previsibles en textos largos, dominios técnicos o vocabulario especializado; el ajuste está orientado a limpieza de dictado, no a razonamiento general.
- Riesgo de alucinación y de reescritura: al normalizar, el modelo puede alterar, omitir o añadir contenido respecto a la transcripción original. El autor advierte explícitamente de que "nunca debe pensar", de ahí que el modo *thinking* esté desactivado por defecto.
- Dependencia de plataforma: requiere iOS 27 o superior y Neural Engine; no se puede desplegar en servidores, GPU de consumo ni con runtimes convencionales como llama.cpp, vLLM u Ollama.
- Licencia con término adicional: además de Apache-2.0, cualquier uso o distribución debe mantener la identificación del modelo como "S1-mini" de "Superwhisper". Conviene revisar el fichero `LICENSE` antes de un uso comercial.
- Naturaleza experimental y validación limitada: el autor lo describe como uso experimental en el teclado noboard, el repositorio no registra descargas ni valoraciones y la única evidencia de calidad es un banco interno de 66 casos del propio autor.
- Efectos de la cuantización: la palettización k-means de 8 bits puede degradar comportamientos fuera del dominio de dictado, aunque en el banco interno iguale al modelo original.
- Falta de datos operativos: no se publican longitud de contexto confirmada, latencia, throughput, consumo de memoria medido ni benchmarks estándar.
- Sesgos heredados: al derivar de Qwen3-0.6B, arrastra los sesgos de los datos de entrenamiento de Alibaba Cloud, no evaluados en esta conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satuke/s1-mini-coreai-ios
- Modelo base superwhisper/s1-mini: https://huggingface.co/superwhisper/s1-mini
- Modelo original Qwen3-0.6B (Alibaba Cloud): https://huggingface.co/Qwen/Qwen3-0.6B
- Librería de exportación e inferencia de Apple: https://github.com/apple/coreai-models
- Fichero de licencia del repositorio: https://huggingface.co/satuke/s1-mini-coreai-ios/blob/main/LICENSE
