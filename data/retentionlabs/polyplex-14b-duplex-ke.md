# RetentionLabs/PolyPlex-14B-Duplex-KE

## Resumen

PolyPlex-14B-Duplex-KE es un modelo de investigación desarrollado por RetentionLabs que adapta el modelo multimodal PolyPlex-14B-Dense para gestionar el turn-taking (toma de turno conversacional) en diálogo duplex en coreano, manteniendo el comportamiento en inglés anclado a PersonaPlex. El modelo se construye sobre una arquitectura híbrida que combina las 36 capas feed-forward de Qwen3-8B con las de PersonaPlex (basado en Moshi), añade 4 capas adicionales y fusiona los vocabularios de Helium y Qwen3, dando como resultado un backbone de aproximadamente 14B parámetros con pesos en formato NVFP4.

La relevancia de este modelo radica en su enfoque de entrenamiento: aprende el turn-taking coreano exclusivamente a partir de texto, presentando el diálogo como frames duplex con silencio en ambos flujos de audio. Esto permite que el modelo sepa cuándo hablar y cuándo esperar en coreano sin haber procesado aún audio real en ese idioma, lo que constituye una etapa intermedia hacia el modelo PolyPlex-14B-KE, que incorporará el habla coreana. El inglés se mantiene alineado con PersonaPlex mediante una corrección de rango 64 en las capas 0-31.

Es importante señalar que, en el momento de la información disponible, los pesos del modelo no están subidos al repositorio: solo se incluyen el código, la configuración, el tokenizador y el procesador. El modelo está pensado para investigadores interesados en diálogo duplex, turn-taking multilingüe y arquitecturas híbridas de fusión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 36 capas feed-forward de Qwen3-8B + capas de PersonaPlex (Moshi) + 4 capas añadidas; dos flujos residuales; backbone en NVFP4 |
| Parametros totales | ~14B (según nombre del modelo; no se detalla desglose exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (forward del backbone); no se especifican otros formatos de cuantización para despliegue |
| Idiomas soportados | Multilingüe, inglés, coreano (el coreano solo en texto en esta etapa; el habla coreana llega en PolyPlex-14B-KE) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | No disponible (los pesos aún no están subidos; el repositorio contiene código, configuración, tokenizador y procesador) |

## Arquitectura y entrenamiento

La arquitectura es la de PolyPlex-14B-Dense, sin cambios: dos flujos residuales que combinan las 36 capas feed-forward de Qwen3-8B con las de PersonaPlex, más 4 capas añadidas que transportan el conocimiento de Qwen3 al flujo de PersonaPlex para todos los idiomas. Los pesos del backbone están en NVFP4. El vocabulario fusiona Helium y Qwen3.

El entrenamiento de esta etapa (Duplex adaptation) congela todo lo aprendido en la alineación densa y mueve solo tres componentes: las primeras 64 de las 128 neuronas reservadas para el grupo coreano-japonés en la MLP de PersonaPlex de cada capa (neuronas 11.264–11.327 de 12.288), las filas Hangul del LM head, y una corrección de inglés de rango 64 en las proyecciones gate y up de las 11.264 neuronas originales de PersonaPlex en las capas 0–31, restringida a 64 direcciones de entrada que PersonaPlex no usa en inglés. Los datos coreanos provienen del diálogo diario multisessión de AI Hub (011 y 141) y del lado coreano de un corpus paralelo coreano-inglés, dispuestos como frames duplex con silencio en ambos flujos de audio: 56.000 filas de hasta 1.024 frames (35% / 35% / 30%). El inglés usa 4.000 filas de conversaciones entre dos modelos PersonaPlex (60 s cada una, ambos lados), con pérdida KL hacia PersonaPlex en logits de texto y en los logits de audio del decodificador de profundidad sobre 64 frames por lote. Se realizaron 500 pasos con 112 filas coreanas y 8 inglesas por paso, optimizador Muon para matrices y AdamW para el resto, learning rate 1e-3, 25 pasos de warm-up lineal y decaimiento coseno a 0 en los últimos 100. Precisión: forward NVFP4 y backward MXFP8, sobre 2 × NVIDIA B300 en paralelo de datos.

## Capacidades

- Generación de texto y diálogo conversacional en coreano e inglés.
- Turn-taking duplex: el modelo distingue cuándo debe hablar y cuándo esperar en coreano, aprendido a partir de texto con frames de silencio.
- Procesamiento de diálogo estructurado en frames duplex con flujos de audio simulados (silencio en esta etapa).
- Alineación con PersonaPlex en inglés: mantiene el comportamiento conversacional de PersonaPlex en inglés mediante la corrección de rango 64.
- Capacidades multilingües heredadas de la alineación densa (116 idiomas en la etapa Dense), aunque esta etapa se centra en coreano e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio real: no en esta etapa (el audio coreano llega en PolyPlex-14B-KE).

## Casos de uso

- Investigación en turn-taking conversacional: el modelo permite estudiar cómo un sistema duplex aprende a ceder y tomar el turno en coreano a partir de datos textuales, sirviendo de base para experimentos de diálogo hablado sin necesidad de audio real.
- Desarrollo de asistentes de voz duplex en coreano: una vez completada la etapa de habla (PolyPlex-14B-KE), este modelo sirve como base para asistentes que deben gestionar interrupciones y silencios en conversaciones telefónicas o de atención al cliente en coreano.
- Evaluación de arquitecturas híbridas de fusión: investigadores pueden analizar cómo se comportan los dos flujos residuales y las capas añadidas al combinar Qwen3-8B con PersonaPlex, usando este checkpoint como referencia intermedia.
- Generación de diálogo sintético en coreano: el modelo puede producir turnos de conversación en coreano con estructura duplex, útil para aumentar datasets de diálogo o para pruebas de sistemas de diálogo.
- Estudio de alineación cross-lingüe: la corrección de inglés de rango 64 permite investigar cómo preservar el comportamiento de un modelo base (PersonaPlex) mientras se añade un nuevo idioma (coreano) sin degradar el original.
- Benchmarking de eficiencia en NVFP4: al usar forward NVFP4 y backward MXFP8, el modelo es un caso práctico para medir el rendimiento de entrenamiento e inferencia en precisión reducida sobre hardware Blackwell (B300).
- Base para investigación en diálogo multisessión: los datos de AI Hub (011 y 141) y el formato de frames de hasta 1.024 posiciones permiten estudiar conversaciones de múltiples sesiones con contexto largo.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados en la información disponible son las pérdidas de entrenamiento y validación:

| Paso | Pérdida coreano (nats) | Perplejidad coreano | KL texto inglés | KL audio inglés |
|---:|---:|---:|---:|---:|
| 0 (Dense) | 10,79 | 48.548 | 11,48 | 4,10 |
| 125 | 2,33 | 10,32 | 0,188 | 0,227 |
| 250 | 2,17 | 8,78 | 0,114 | 0,168 |
| 375 | 2,10 | 8,18 | 0,111 | 0,150 |
| 500 (este modelo) | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone usa pesos NVFP4, lo que reduce el espacio frente a FP16, pero no se especifica el tamaño exacto en memoria ni los requisitos de inferencia.
- GPU recomendadas: el entrenamiento se realizó en 2 × NVIDIA B300 (Blackwell). Para inferencia no se indican GPU concretas; NVFP4 requiere hardware compatible con esa precisión (serie Blackwell).
- ¿Cabe en GPU de consumo? No disponible. Al ser un modelo de ~14B en NVFP4, podría caber en GPUs de consumo con suficiente VRAM, pero no se confirma en la información.
- Opciones de despliegue: la librería indicada es transformers (≥ 5.14 según el badge). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyPlex-14B-Duplex-KE | ~14B | No disponible | Multilingüe, en, ko | NVIDIA Open Model License | Pesos no subidos aún |
| PolyPlex-14B-Dense | ~14B | No disponible | 116 idiomas (texto) | No disponible | Pesos publicados |
| PersonaPlex-7B-v1 (nvidia) | ~7B | No disponible | Inglés (habla) | No disponible | Pesos publicados |
| Qwen3-8B | 8B | No disponible | Multilingüe | No disponible | Pesos publicados |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están subidos: el repositorio contiene solo código, configuración, tokenizador y procesador. No es posible ejecutar el modelo tal cual.
- El coreano se ha aprendido solo a partir de texto: el modelo no ha oído ni hablado coreano; el habla coreana llegará en PolyPlex-14B-KE. Cualquier uso con audio coreano real no está soportado en esta etapa.
- El inglés está anclado a PersonaPlex mediante una corrección de rango 64; no se garantiza un comportamiento idéntico fuera de las distribuciones de entrenamiento.
- Los frames PAD no se puntúan en la pérdida, ya que sus longitudes provienen de un ritmo de habla nominal y se aprenden de habla real en la siguiente etapa; esto puede afectar a la naturalidad de las pausas.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: NVIDIA Open Model License; es necesario revisar sus términos para uso comercial.
- Modelo de investigación: no se han publicado benchmarks estándar ni evaluaciones de robustez en producción.
- El entrenamiento usó solo 500 pasos y cada fila se leyó una vez; el ajuste fino adicional puede ser necesario para dominios específicos.

## Enlaces

- Hugging Face: https://huggingface.co/RetentionLabs/PolyPlex-14B-Duplex-KE
- Modelo base PolyPlex-14B-Dense: https://huggingface.co/RetentionLabs/PolyPlex-14B-Dense
- Modelo base PersonaPlex-7B-v1: https://huggingface.co/nvidia/personaplex-7b-v1
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper referenciado (arXiv:2602.06053): https://arxiv.org/abs/2602.06053
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- PolyPlex-14B-KE (etapa posterior, habla coreana): https://huggingface.co/RetentionLabs/PolyPlex-14B-KE
