# mariklolik/AraToken-Qwen3-1.7B-CPT

## Resumen

AraToken-Qwen3-1.7B-CPT es un modelo de lenguaje de 1.720.574.976 parámetros desarrollado por mariklolik (Mark Kashirskiy, Artiom Lipinski e Ilya Makarov según la cita del paper) como parte del proyecto AraToken, centrado en optimizar la tokenización del árabe sobre la familia Qwen3. Se trata de un modelo base obtenido por preentrenamiento continuado (continued pretraining, CPT) del checkpoint Qwen/Qwen3-1.7B-Base, entrenado con el tokenizador original de Qwen3, el mismo corpus árabe y el mismo protocolo que su variante hermana AraToken-Qwen3-1.7B-LEP, que sí incorpora un vocabulario extendido.

El problema que aborda es el coste de tokenización del árabe en tokenizadores diseñados con predominio del inglés: un texto árabe se fragmenta en más tokens de los necesarios, lo que reduce la ventana efectiva y encarece la inferencia. La contribución medida es una reducción del coste en bits por carácter (BPC) sobre árabe, de 1,3313 en Qwen3-1.7B-Base a 1,2672 en este modelo, en la primera mitad del camino hacia el 1,2598 de la variante con vocabulario extendido. El modelo es relevante como línea base controlada para aislar cuánto de la mejora proviene del preentrenamiento adicional y cuánto de la extensión de vocabulario.

Es un modelo estrictamente de investigación: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin ajuste por instrucciones, sin RLHF ni DPO documentados, y con licencia Apache 2.0. Su uso previsto es la comparación experimental en tokenización árabe, no el despliegue conversacional directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3), heredada de Qwen/Qwen3-1.7B-Base |
| Parametros totales | 1.720.574.976 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la información proporcionada; el modelo base Qwen3-1.7B-Base declara 32.768 tokens nativos, ampliables con YaRN |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales: tamaño del repositorio 3,5 GB; pipeline `text-generation`; dataset de entrenamiento `mariklolik/AraToken-FineWeb2-HQ-ar`; compatible con `text-generation-inference` y `endpoints_compatible`; fechas del repositorio 23 de septiembre de 2026 (creación y última actualización).

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B-Base sin modificaciones estructurales: un transformer decoder denso de 1,72 mil millones de parámetros. Este checkpoint concreto no cambia el vocabulario, a diferencia de la variante LEP, precisamente para poder aislar el efecto del preentrenamiento continuado del efecto de la extensión del vocabulario. El tokenizador, eso sí, incorpora el normalizador AraToken, que aplica NFKC, eliminación de tatweel, conversión a dígitos occidentales y eliminación de puntuación latina y de diacríticos, de modo que se le puede pasar texto árabe en crudo directamente.

El entrenamiento consistió en preentrenamiento continuado sobre el dataset `mariklolik/AraToken-FineWeb2-HQ-ar`, con las capas 24 a 27 (las superiores) como capas entrenables y un total de 2.000 pasos, exactamente la misma configuración de datos, capas y pasos que el modelo LEP. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por instrucciones, ni el número total de tokens procesados. La innovación evaluada es de naturaleza lingüística y de pipeline de datos (normalización más extensión de vocabulario en la variante hermana) más que arquitectónica.

## Capacidades

- Generación de texto autoregresiva en árabe e inglés, en modo modelo base (completado de secuencia, no diálogo instruido).
- Modelado de lenguaje sobre árabe con mejor compresión que el modelo base de Qwen3, según la métrica BPC: 1,2672 frente a 1,3313.
- Normalización de texto árabe integrada en el tokenizador: NFKC, eliminación de tatweel, transliteración de dígitos a forma occidental y eliminación de diacríticos y puntuación latina.
- Capacidad bilingüe árabe-inglés heredada del modelo base.
- No se documenta soporte nativo de tool calling ni function calling.
- No se documenta entrenamiento para uso agéntico, razonamiento multi-paso, modo "thinking" ni plantilla de chat conversacional, pese a la etiqueta `conversational` del repositorio.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Línea base experimental en investigación sobre tokenización árabe: sirve como control para medir cuánta mejora en BPC aporta el preentrenamiento continuado frente a la extensión de vocabulario, comparando contra Qwen3-1.7B-Base y contra AraToken-Qwen3-1.7B-LEP con la misma receta de 2.000 pasos y capas 24-27.
- Construcción de modelos árabes por preentrenamiento continuado: el checkpoint es un punto de partida razonable para quien quiera seguir entrenando sobre árabe y necesite un modelo de 1,7B que ya haya adaptado sus capas superiores al dominio.
- Punto de partida para ajuste fino supervisado en tareas árabes concretas (clasificación, extracción, resumen) cuando no se quiere arrastrar el coste de un modelo de mayor tamaño.
- Preprocesamiento y normalización de corpus árabes: el tokenizador con normalizador AraToken permite estandarizar texto en crudo (tatweel, diacríticos, dígitos) dentro de un pipeline de datos.
- Evaluación de compresión y eficiencia de tokenización: medir BPC y fertilidad de tokens sobre corpus árabes propios para decidir si conviene migrar a un vocabulario extendido.
- Investigación sobre olvido catastrófico: al entrenar solo las capas 24-27, es un caso de estudio útil para medir cuánto se degrada el rendimiento en inglés tras 2.000 pasos de preentrenamiento en árabe.
- Generación de texto árabe en entornos con pocos recursos: con 1,72B parámetros, cabe en GPUs de consumo y permite experimentar sin infraestructura de datacenter.
- No se recomienda como asistente conversacional listo para producción, ya que no hay evidencia de ajuste por instrucciones ni de evaluación de seguridad.

## Benchmarks y rendimiento

El único resultado publicado en la información disponible es el coste en bits por carácter (BPC) sobre los primeros 1.500 documentos del split `test` reservado de `mariklolik/AraToken-FineWeb2-HQ-ar`. La métrica permite comparar modelos con vocabularios distintos sobre los mismos caracteres.

| Modelo | BPC árabe (menor es mejor) |
|---|---|
| Qwen3-1.7B-Base | 1,3313 |
| AraToken-Qwen3-1.7B-CPT (este modelo) | 1,2672 |
| AraToken-Qwen3-1.7B-LEP | 1,2598 |

No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (1.720.574.976) y del tamaño del repositorio (3,5 GB); el autor no publica mediciones de latencia ni de throughput.

- Pesos en bfloat16 o float16: aproximadamente 3,4 GB, más overhead de activaciones y caché KV.
- Pesos en int8: aproximadamente 1,8 GB.
- Pesos en 4 bits: aproximadamente 0,9-1,1 GB, más caché KV.
- Caché KV: crece de forma lineal con la longitud de contexto; a 32.768 tokens puede añadir varios gigabytes según la configuración de cabezas KV. No hay cifras publicadas por el autor.
- Cabe en GPUs de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4070 de 12 GB o una RTX 4090 de 24 GB ejecutan el modelo en bfloat16 sin cuantizar con contexto moderado. En 8 GB (RTX 3060 Ti, RTX 4060) conviene cuantizar a 8 o 4 bits si se necesita contexto largo.
- GPU de datacenter recomendadas para mayor concurrencia: A100 40/80 GB, H100, L40S.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (el repositorio declara compatibilidad con endpoints); vLLM para servicio de alto throughput. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPC árabe | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AraToken-Qwen3-1.7B-CPT | 1.720.574.976 | No especificado (base: 32.768) | 1,2672 | Apache 2.0 | HuggingFace, safetensors |
| AraToken-Qwen3-1.7B-LEP | No especificado | No especificado (base: 32.768) | 1,2598 | Apache 2.0 | HuggingFace |
| Qwen3-1.7B-Base | ~1,72 mil millones | 32.768 nativos | 1,3313 | Apache 2.0 | HuggingFace |

La comparación directa con alternativas de otros fabricantes (Llama 3.2 1B, Gemma 2 2B, SmolLM2 1.7B) no es posible con los datos disponibles, porque no se han publicado evaluaciones comparativas en esta información y porque el BPC solo es comparable dentro del mismo corpus de evaluación.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional, pese a la etiqueta `conversational` del repositorio.
- Riesgo de alucinación y de generación de contenido factualmente incorrecto, propio de un modelo de 1,7B sin alineación ni RLHF documentados.
- El entrenamiento solo actualiza las capas 24-27 durante 2.000 pasos: es un ajuste parcial por diseño, no un preentrenamiento completo.
- No hay evaluación publicada del impacto en inglés. Es plausible cierto olvido catastrófico tras el preentrenamiento continuado en árabe, pero no está cuantificado en la información disponible.
- El normalizador del tokenizador elimina diacríticos y puntuación latina del texto de entrada. Esto puede degradar tareas que dependan de tashkeel (por ejemplo, lectura coránica o síntesis de voz) o de distinguir puntuación original.
- Cobertura idiomática limitada a árabe e inglés; no se documenta rendimiento en otras lenguas.
- Sin métricas de seguridad, sesgo o toxicidad publicadas. El corpus de entrenamiento deriva de FineWeb2, con los sesgos propios de datos web filtrados.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Licencia Apache 2.0, que permite uso comercial, pero exige conservar los avisos de copyright y licencia y no concede derechos de marca. Conviene verificar también las condiciones del modelo base Qwen3 subyacente.
- No se distribuyen pesos en GGUF ni cuantizaciones listas para usar, lo que añade trabajo de conversión para despliegues en CPU o en llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mariklolik/AraToken-Qwen3-1.7B-CPT
- Modelo hermano con vocabulario extendido: https://huggingface.co/mariklolik/AraToken-Qwen3-1.7B-LEP
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/mariklolik/AraToken-FineWeb2-HQ-ar
- Paper: https://arxiv.org/abs/2512.18399
- Código: https://github.com/mariklolik/Aratoken
