# mortenfc/gemma-4-litert-npu

## Resumen

Gemma 4 NPU builds for LiteRT-LM es una compilación derivada del modelo google/gemma-4-E4B-it, publicada por el usuario mortenfc, orientada a la ejecución en la unidad de procesamiento neuronal (NPU) de teléfonos Android con chip Qualcomm Snapdragon. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el modelo base de Google se compila de forma anticipada (ahead-of-time) para un chip concreto y se empaqueta en el formato propietario `.litertlm` que consume la librería LiteRT-LM. El objetivo declarado por el autor es servir resúmenes en el dispositivo dentro de la aplicación Auto Record Moments, sin depender de la nube.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de compilación para NPU móvil con cuantización INT4 y decodificación especulativa (MTP drafter) conservada. Por otro, expone una limitación concreta del runtime: LiteRT-LM (v0.18.0–v0.20.0) no acepta tablas de embedding en INT2, lo que obligó a repackarlas a INT4 de forma sin pérdida. El repositorio ocupa 4,1 GB y contiene un único archivo de 4.132.295.184 bytes.

El modelo base, Gemma 4 E4B-it, pertenece a la familia Gemma 4 de Google. La información disponible no detalla la arquitectura interna del modelo base (número de parámetros totales, longitud de contexto o composición del dataset), por lo que esos datos se marcan como no disponibles. La licencia declarada es Apache 2.0, heredada del release original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4 E4B-it); artefacto compilado para NPU Qualcomm Hexagon v81 mediante QAIRT 2.50.0 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (tablas de embedding repackadas de INT2 a INT4); sección prefill_decode compilada; MTP drafter incluido |
| Idiomas soportados | 9 idiomas verificados en pruebas de resumen (no se enumeran en la información disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, compilado ahead-of-time para NPU) |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio: es una recompilación del modelo google/gemma-4-E4B-it a partir del release litert-community/gemma-4-E4B-it-litert-lm (commit `7ffde729b2c68efc06e0e57b0f31c61dbed9a3e5`, archivo `gemma-4-E4B-it_qualcomm_sm8850.litertlm`). La arquitectura subyacente es la del modelo base de Google, de la que no se proporcionan detalles en la información disponible (número de capas, dimensión oculta, mecanismo de atención o datos de entrenamiento).

Las modificaciones aplicadas son tres. Primero, las 42 tablas de embedding por capa se repackaron de INT2 a INT4 conservando escalas y puntos cero; como todo valor de 2 bits cabe exactamente en uno de 4 bits, la conversión es sin pérdida y una comprobación en host sobre 128 tokens dio salida idéntica bit a bit. El motivo es que el embedder NPU de LiteRT-LM (`runtime/executor/npu/llm_litert_npu_embedder.cc`, v0.18.0–v0.20.0) solo admite tablas INT4 o INT8 y falla con INT2 con el error "Unsupported table element type: 20". Segundo, se eliminaron las secciones de audio y visión, dejando el modelo como text-only. Tercero, se mantuvieron sin cambios la sección compilada `prefill_decode` (QAIRT 2.50.0), el embedder, aux, el MTP drafter, el tokenizer y los metadatos.

## Capacidades

- Generación de texto y resumen: el caso de uso validado por el autor es la generación de resúmenes en 9 idiomas, con tiempos de 3 a 16 segundos por resumen.
- Ejecución en NPU: el artefacto está compilado para el Hexagon v81 del Snapdragon 8 Elite Gen 5 (SM8850), con decodificación especulativa mediante MTP drafter.
- Multilingüe: se verificaron resúmenes en 9 idiomas, aunque la lista no se detalla.
- Sin visión ni audio: ambas secciones fueron eliminadas en esta compilación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Resumen en el dispositivo para aplicaciones de notas o grabación: es el caso validado por el autor en Auto Record Moments; el modelo genera resúmenes de 3 a 16 segundos en el propio teléfono, sin enviar audio ni transcripciones a la nube.
- Procesamiento de texto con privacidad estricta: al ejecutarse íntegramente en la NPU local, encaja en aplicaciones donde los datos no pueden salir del dispositivo (notas personales, diarios, actas de reuniones).
- Funcionalidad offline: al no requerir conectividad, resulta adecuado para apps que deben funcionar en modo avión o con red intermitente.
- Reducción de costes de inferencia: elimina el coste por token de API en funciones de resumen de alto volumen, a cambio de un único artefacto de 4,1 GB embebido en la app.
- Prototipado de despliegue NPU en Android: sirve como referencia para equipos que quieran compilar sus propios modelos LiteRT-LM para Snapdragon, incluyendo el truco de repack INT2→INT4.
- Filtrado y clasificación de texto local: tareas de etiquetado o extracción sobre texto corto que se beneficien de baja latencia y ejecución local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de ejecución en un dispositivo Snapdragon 8 Elite Gen 5 (NX809J) con LiteRT-LM 0.18.0 y runtime QNN 2.50/2.52:

| Metrica | Valor |
|---|---|
| Tiempo por resumen | 3–16 s |
| Idiomas probados | 9 |
| Memoria pico de la app | ~3,3 GB |
| Comprobación de fidelidad | salida idéntica bit a bit sobre 128 tokens (host) |

## Requisitos de hardware

- NPU: Qualcomm Hexagon v81, exclusivamente en Snapdragon 8 Elite Gen 5 (SM8850). El artefacto está compilado para ese chip y no es portable a otras NPU.
- Memoria: el autor reporta un pico de memoria de app de aproximadamente 3,3 GB durante la inferencia en el dispositivo probado.
- Almacenamiento: el archivo `.litertlm` ocupa 4.132.295.184 bytes (≈4,1 GB).
- Runtime: LiteRT-LM 0.18.0 (probado también con librerías QNN 2.50/2.52); el embedder NPU requiere tablas INT4 o INT8.
- GPU de escritorio: no aplica; no hay indicios de que el artefacto pueda ejecutarse en A100, H100 o RTX 4090, ya que está compilado para NPU móvil.
- Opciones de despliegue: LiteRT-LM en Android con el runtime QNN de Qualcomm. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3–16 s por resumen en el dispositivo de prueba; no se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mortenfc/gemma-4-litert-npu | no disponible | no disponible | `.litertlm` (NPU Snapdragon 8 Elite Gen 5) | Apache 2.0 | Hugging Face, 0 descargas |
| litert-community/gemma-4-E4B-it-litert-lm | no disponible | no disponible | `.litertlm` (incluye audio y visión) | Apache 2.0 (según el release de origen) | Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | safetensors (presumiblemente) | Apache 2.0 | Hugging Face |

La comparación se limita a la cadena de derivación del propio modelo, ya que la información disponible no incluye datos de parámetros, contexto ni rendimiento de alternativas de la misma categoría.

## Limitaciones y advertencias

- Específico de un chip: solo funciona en Snapdragon 8 Elite Gen 5 (SM8850, Hexagon v81). No es un artefacto genérico ni ejecutable en GPU de escritorio.
- Solo texto: las capacidades de audio y visión del modelo base fueron eliminadas.
- Dependencia de versión del runtime: el repack INT2→INT4 responde a una limitación de LiteRT-LM v0.18.0–v0.20.0; futuras versiones podrían cambiar el comportamiento del embedder.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares para este artefacto.
- Riesgo de alucinación: inherente al modelo base; no se documentan evaluaciones específicas en esta compilación.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache 2.0, heredada de Google, sin garantía ("No warranty"). Conviene revisar los términos del modelo base de Google antes de uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 24 de noviembre de 2026; sin pipeline declarado ni idiomas listados en los metadatos.
- Huella: 4,1 GB de almacenamiento y ~3,3 GB de memoria pico, relevante para apps móviles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mortenfc/gemma-4-litert-npu
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Release de origen LiteRT-LM: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
