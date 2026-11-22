# mradermacher/Panu-Omni-2B-i1-GGUF

## Resumen

Panu-Omni-2B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Panu-Omni-2B, desarrollado originalmente por JonusNattapong y cuantizado por mradermacher. Se trata de un modelo multimodal de aproximadamente 1.728 millones de parámetros (1,73 B) que combina capacidades de texto, visión y audio, incluyendo funcionalidad de speech-to-speech. Está construido sobre la familia arquitectónica Liquid LFM3 (Liquid AI), según indican las etiquetas del repositorio, y se distribuye con variantes "abliterated" y "uncensored", lo que implica que se han eliminado o reducido los mecanismos de rechazo del modelo original.

La relevancia de este lanzamiento radica en dos factores. Primero, ofrece un modelo "omni" (texto, imagen y audio en un único artefacto) en un tamaño muy reducido, lo que permite desplegarlo en hardware de consumo. Segundo, la disponibilidad de cuantizaciones imatrix (i1) desde IQ1_S hasta Q6_K permite elegir el equilibrio entre tamaño, velocidad y calidad, con opciones que van desde 0,6 GB hasta 1,5 GB. El modelo declara soporte para tailandés (incluyendo dialectos), inglés, chino, japonés, francés, alemán y español.

El repositorio acumula 4472 descargas y está etiquetado como compatible con endpoints. La licencia es LFM1.0 (licencia propia de Liquid AI), lo que condiciona el uso comercial y debe revisarse antes de cualquier despliegue en producción. Este fichero describe específicamente la variante cuantizada, no los pesos originales en safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Liquid LFM3 (lfm3-omni), según etiquetas del repositorio; detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (≈1,73 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted); existen además cuantizaciones estáticas en el repo Panu-Omni-2B-GGUF |
| Idiomas soportados | Tailandés (incluye dialectos), inglés, chino, japonés, francés, alemán, español |
| Licencia | LFM1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como perteneciente a la familia Liquid LFM3 en su variante omni, lo que implica una arquitectura transformer adaptada para procesar múltiples modalidades (texto, audio y visión) y con capacidad de speech-to-speech. Las etiquetas del repositorio indican también que se trata de una variante "abliterated" y "uncensored", es decir, con los mecanismos de rechazo atenuados o eliminados respecto al modelo de partida, y con orientación a razonamiento ("reasoning"). No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

En cuanto a la cuantización, mradermacher ha generado cuantizaciones i1 (imatrix) utilizando un fichero imatrix propio de 0,1 GB, lo que mejora la calidad respecto a cuantizaciones estáticas de tamaño equivalente. El repositorio incluye además un fichero imatrix independiente para que terceros puedan generar sus propias cuantizaciones. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de lo que sugiere la familia LFM3.

## Capacidades

- Generación de texto y razonamiento, con etiqueta explícita de "reasoning".
- Procesamiento de imagen (visión) y audio, al estar etiquetado como multimodal y omni.
- Speech-to-speech: conversión de voz a voz dentro del mismo modelo.
- Soporte multilingüe para tailandés (incluidos dialectos), inglés, chino, japonés, francés, alemán y español.
- Variante "abliterated/uncensored": menor probabilidad de rechazo ante peticiones que el modelo base rechazaría.
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documenta explícitamente soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente de voz en tailandés con dialectos: el modelo puede recibir audio y responder con audio en el mismo idioma, lo que lo hace adecuado para interfaces de atención telefónica o asistentes locales en Tailandia, donde los dialectos regionales son habituales.
- Transcripción y resumen multimodal en local: al combinar audio y texto, puede procesar grabaciones de reuniones y generar resúmenes sin enviar datos a la nube, gracias a su tamaño reducido (1,2 GB en Q4_K_M).
- Prototipado de aplicaciones omni en hardware de consumo: con cuantizaciones de 1,1-1,5 GB cabe en GPUs de 8 GB o incluso en CPU vía llama.cpp, lo que permite experimentar con visión y audio sin infraestructura dedicada.
- Investigación sobre alineación y modelos "abliterated": útil para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas frente al modelo base en tareas sensibles.
- Generación de descripciones de imágenes multilingües: para catalogación de contenido en inglés, español, francés o alemán, con salida de texto a partir de imágenes.
- Chat conversacional de bajo coste en edge: despliegue en dispositivos con recursos limitados (Raspberry Pi con suficiente RAM para Q4, portátiles sin GPU) para asistentes personales o demos interactivas.
- Evaluación de cuantizaciones: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones y medir la degradación de calidad en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-0,9 GB para IQ2, 1,0-1,2 GB para IQ3/Q3, 1,1-1,2 GB para IQ4/Q4, 1,3-1,5 GB para Q5/Q6 (tamaños de fichero; la VRAM real añade overhead de contexto y del proyector multimodal).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4; para Q6_K se recomienda 6 GB o más. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes; el modelo está claramente orientado a hardware modesto.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas tarjetas de gama baja con 4-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o LM Studio). El modelo base en safetensors puede servirse con transformers; para vLLM o TGI no se confirma soporte de esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (1,73 B) se espera un throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Panu-Omni-2B-i1-GGUF | 1,73 B | No disponible | Texto, visión, audio (speech-to-speech) | LFM1.0 | GGUF en HF; base en safetensors |
| Qwen2.5-Omni-3B (referencia de categoría) | ~3 B | No disponible en esta ficha | Texto, visión, audio | Apache 2.0 (según su card) | Pesos y GGUF comunitarios |
| Gemma 3 4B (referencia de categoría) | ~4 B | No disponible en esta ficha | Texto, visión | Gemma license | Pesos y GGUF oficiales/comunitarios |

La comparativa se ofrece a título orientativo de categoría (modelos omni o multimodales pequeños); no se dispone de datos de rendimiento comparativo verificados para Panu-Omni-2B en la información proporcionada.

## Limitaciones y advertencias

- Licencia LFM1.0: es una licencia propia con posibles restricciones para uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- Variante "abliterated/uncensored": la eliminación de mecanismos de rechazo aumenta el riesgo de generar contenido inapropiado, dañino o inexacto; no es adecuada para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación: inherente a modelos de este tamaño; la precisión factual en tareas de razonamiento complejo será limitada en comparación con modelos de mayor escala.
- Contexto: no se dispone de la longitud de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- Idiomas: aunque declara siete idiomas, el foco principal parece ser el tailandés; el rendimiento en español, francés o alemán no está verificado con benchmarks.
- Modalidades: no se detalla la resolución de imagen soportada, la frecuencia de muestreo de audio ni la calidad del speech-to-speech; conviene validar estos aspectos antes de integrarlo.
- El repositorio no incluye información sobre tool calling ni agentes, por lo que no debe asumirse su soporte.
- Los pesos GGUF son una cuantización; las cuantizaciones de 1-2 bits (IQ1, IQ2) degradan notablemente la calidad y solo deberían usarse en escenarios con restricciones extremas de memoria.

## Enlaces

- Repositorio Hugging Face (esta variante): https://huggingface.co/mradermacher/Panu-Omni-2B-i1-GGUF
- Modelo base: https://huggingface.co/JonusNattapong/Panu-Omni-2B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Panu-Omni-2B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Panu-Omni-2B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
