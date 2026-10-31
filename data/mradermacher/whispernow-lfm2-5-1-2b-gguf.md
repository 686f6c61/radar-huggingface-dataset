# mradermacher/whispernow-lfm2.5-1.2b-GGUF

## Resumen

Whispernow LFM2.5 1.2B es un modelo lingüístico especializado en la limpieza y corrección de transcripciones de voz a texto (dictado y limpieza de transcripciones), desarrollado a partir de la familia LFM2.5 de Liquid AI. El repositorio aquí descrito no es el modelo original, sino la colección de cuantizaciones GGUF estáticas preparadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face, a partir del modelo base `category271/whispernow-lfm2.5-1.2b`.

El problema que aborda es habitual en pipelines de dictado: los sistemas de speech-to-text como Whisper generan transcripciones con muletillas, repeticiones, errores de puntuación y ruido que hay que depurar antes de usarlas. Un modelo pequeño y especializado como este puede ejecutarse en local, con baja latencia, para transformar transcripciones brutas en texto limpio y legible.

Su relevancia radica en el tamaño: con aproximadamente 1.170 millones de parámetros y cuantizaciones desde 0,6 GB, es viable en CPUs y GPUs de consumo, lo que lo hace idóneo para procesamiento local de dictados sin depender de servicios en la nube. El modelo está entrenado en inglés y publicado bajo licencia LFM1.0 (una licencia propia, no totalmente permisiva).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2.5 (transformer híbrido de Liquid AI, detalle exacto no disponible) |
| Parámetros totales | 1.170.340.608 (aprox. 1,2B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2.5 de Liquid AI, una arquitectura transformer híbrida optimizada para dispositivos con recursos limitados. La información concreta sobre la composición exacta de capas (atención lineal, convoluciones, etc.) no está disponible en la documentación del repositorio. El modelo cuantizado conserva la arquitectura del original y añade únicamente la conversión a GGUF con cuantización estática k-quants.

El entrenamiento se realizó sobre el dataset `category271/whispernow-cleanup`, un conjunto de datos específico para tareas de limpieza de transcripciones (pares de transcripción bruta / texto corregido, presumiblemente). No hay información disponible sobre el número de tokens, la composición detallada del dataset, ni sobre el uso de técnicas de alineación como RLHF o DPO.

La contribución de mradermacher es la generación de cuantizaciones estáticas en GGUF (sin imatrix ni cuantizaciones ponderadas por el momento), lo que permite ejecutar el modelo con llama.cpp y herramientas compatibles en hardware muy variado.

## Capacidades

- Limpieza de transcripciones: corrige puntuación, mayúsculas, muletillas y errores típicos de salida de sistemas speech-to-text.
- Dictado: transformación de texto dictado en prosa limpia y bien formateada.
- Generación de texto conversacional en inglés (etiquetado como conversational), aunque su especialización es la limpieza de transcripciones.
- Ejecución eficiente en local gracias al formato GGUF y a su tamaño reducido (desde 0,6 GB cuantizado).
- No hay información disponible sobre soporte de tool calling, capacidades de visión, audio nativo ni modo de razonamiento extendido.

## Casos de uso

- Postprocesado de transcripciones de Whisper: integrar el modelo tras un ASR para eliminar muletillas, repeticiones y corregir puntuación automáticamente antes de publicar el texto.
- Dictado personal en local: usar el modelo en el portátil o móvil junto a un motor de dictado para obtener texto limpio sin enviar datos a la nube.
- Transcripción de reuniones: limpiar las salidas brutas de reuniones grabadas para generar actas legibles de forma automática.
- Subtitulado y accesibilidad: normalizar transcripciones de vídeos y podcasts antes de generar subtítulos, mejorando legibilidad con un coste computacional mínimo.
- Pipelines de procesamiento masivo de audio: dado su tamaño, se puede desplegar en CPU para procesar grandes volúmenes de transcripciones en batch sin GPUs.
- Asistentes de voz embebidos: incorporar la limpieza de texto en dispositivos edge con recursos limitados gracias a las cuantizaciones de 0,6-0,8 GB.
- Preparación de datasets de entrenamiento: limpiar automáticamente corpus transcritos antes de usarlos para fine-tuning de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: entre 0,6 GB (Q2_K) y 2,4 GB (f16) según la cuantización; la recomendada Q4_K_M ocupa unos 0,8 GB.
- GPU recomendadas: no es necesario hardware dedicado; cualquier GPU moderna con 2 GB de VRAM o más ejecuta incluso la versión f16. En CPU funciona sin problemas dado el tamaño.
- Consumer GPUs: cabe con holgura en GPUs de gama baja y media (GTX 1650, RTX 3060, RTX 4060, etc.) e incluso en iGPUs y portátiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI.
- Latencia y throughput: no disponible; por tamaño y cuantización se espera inferencia muy rápida incluso en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| whispernow-lfm2.5-1.2b (este) | 1,2B | no disponible | limpieza de transcripciones / dictado | lfm1.0 (other) |
| LFM2-1.2B (Liquid AI, base de la familia) | 1,2B | no disponible en esta ficha | uso general edge | LFM Open License |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según ficha oficial) | uso general, incluye corrección de texto | Apache 2.0 |

Comparado con un modelo generalista pequeño como Qwen2.5-1.5B, whispernow-lfm2.5 está especializado en limpieza de transcripciones, por lo que debería rendir mejor en esa tarea concreta, aunque con menor versatilidad. La licencia lfm1.0 es menos permisiva que Apache 2.0, lo que puede condicionar su uso comercial.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado solo en inglés; no es adecuado para limpiar transcripciones en castellano u otros idiomas.
- Especialización: al ser un modelo afinado para limpieza de transcripciones, su rendimiento en tareas generales (razonamiento, código, matemáticas) probablemente esté degradado respecto al modelo base.
- Licencia: lfm1.0 es una licencia tipo "other"; hay que revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones.
- Riesgo de alucinación: como todo LLM, puede alterar el contenido de la transcripción más allá de la limpieza (añadir o inventar fragmentos); conviene validar en usos críticos.
- Solo hay cuantizaciones estáticas: no existen versiones imatrix/ponderadas, por lo que las cuantizaciones más agresivas (Q2_K, Q3_K) pueden perder calidad notable.
- La longitud de contexto no está documentada en este repositorio; para transcripciones largas conviene verificarla en la ficha del modelo base antes de producción.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/whispernow-lfm2.5-1.2b-GGUF
- Modelo base: https://huggingface.co/category271/whispernow-lfm2.5-1.2b
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Página de descargas de mradermacher: https://hf.tst.eu/model#whispernow-lfm2.5-1.2b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH: https://www.nethype.de/
