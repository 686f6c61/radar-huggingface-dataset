# loom-fun-staging/unsloth-Inkling-2-Mini-loom-r9700

## Resumen

Inkling-2-Mini es un modelo de lenguaje publicado originalmente por Thinking Machines (identificado en las peticiones de ejemplo como `thinkingmachines/Inkling-2-Mini`) y redistribuido en formato GGUF por el usuario `unsloth` en Hugging Face. El repositorio que nos ocupa, `loom-fun-staging/unsloth-Inkling-2-Mini-loom-r9700`, no contiene los pesos originales del modelo, sino un paquete de despliegue para el runtime AMD Loom (programas `.loom` y una tarjeta `model.json`) generado con el flujo `loom-skills` a partir del checkpoint ya cuantizado `Mainline_Support/Inkling-2-Mini-UD-Q4_K_XL.gguf_file`.

El paquete está orientado a dos aceleradores AMD concretos: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). Incluye dos presets de servicio, `chat-r9700` y `chat-q8-r9700`, y se distribuye bajo licencia MIT. Su relevancia es operativa: demuestra cómo ejecutar un modelo conversacional con soporte de tool calling sobre ROCm mediante el SDK `hrx-loom` 0.3.0, con métricas de rendimiento frente a llama.cpp ROCm.

El estado de publicación es de preproducción: la promoción a producción está retenida porque ambos presets superaron tres de las cinco puertas de validación (consistency, golden y sampling) pero fallaron las de comparación y de agente. El repositorio tiene 0 GB de tamaño declarado y ningún dato de arquitectura, parámetros o contexto más allá del límite de 32.768 tokens que se deduce de las pruebas de cualificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `unsloth/Inkling-2-Mini-GGUF`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (deducido de la prueba Q8: 32.693 de 32.768 tokens admitidos) |
| Tipos de cuantizacion | UD-Q4_K_XL y una variante Q8 (presets `chat-r9700` y `chat-q8-r9700`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como paquete Loom con `model.json` y programas `.loom`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El paquete Loom no redistribuye los pesos originales, sino que referencia el GGUF de Unsloth (`Inkling-2-Mini-UD-Q4_K_XL.gguf_file`) y añade los artefactos de servicio para el runtime Loom. Por los tags y la metodología de medición se deduce que el checkpoint no incluye cabeza MTP (multi-token prediction) ni se ha publicado un drafter específico para este modelo, de modo que la decodificación especulativa no está disponible en ninguna de las dos variantes evaluadas.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. El modelo expone un parámetro `reasoning_effort` en la API de chat (los ejemplos lo fijan a `none`), lo que sugiere soporte de modos de razonamiento configurables, pero no se detalla su funcionamiento.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con `/v1/chat/completions`.
- Tool calling / function calling: los presets completaron una continuación de herramienta con nombre; la misma petición sin nombre de función devuelve HTTP 400, lo que indica validación estricta del esquema.
- Modo de razonamiento configurable mediante el parámetro `reasoning_effort` (valor `none` en los ejemplos documentados).
- Contexto largo de hasta 32.768 tokens, con 32.693 tokens efectivos verificados en el preset Q8.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo con GPU AMD: el paquete Loom permite servir el modelo en una Radeon AI PRO R9700 o en una APU Strix Halo con dos comandos (`loom-fetch` y `loom-serve`), sin necesidad de compilar llama.cpp ni gestionar el offload manualmente.
- Automatización de agentes con herramientas: el soporte verificado de tool calling con validación de nombre de función permite integrar el modelo en flujos donde el orquestador exige resultados estructurados y rechaza llamadas mal formadas con HTTP 400.
- Procesamiento de documentos de hasta 32.000 tokens: el contexto admitido en el preset Q8 permite resumir, extraer entidades o responder preguntas sobre contratos, informes o expedientes de longitud media en una sola pasada.
- Evaluación de hardware AMD en laboratorio: los presets y el fichero `sdk-qualification.json` facilitan reproducir las pruebas de consistencia, golden y sampling sobre gfx1151 y gfx1201 antes de desplegar en producción.
- Servicio de inferencia por lotes con cuatro flujos concurrentes: la configuración medida con 4 streams (217,8 tok/s agregados de techo roofline) sirve para tareas de generación paralela moderada en una única GPU de 32 GB.
- Prototipado de pipelines RAG: la combinación de contexto de 32k y tool calling permite conectar el modelo a un índice vectorial y a funciones de búsqueda externas en entornos de desarrollo con hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos numéricos son los techos roofline de rendimiento del GGUF sobre Strix Halo (gfx1151), medidos con un ancho de banda de lectura de 230 GB/s y 44 TFLOP/s sostenidos:

| Metrica (Strix Halo, gfx1151) | Techo roofline |
|---|---|
| Decode tok/s, prompt corto | 57,2 |
| Decode tok/s, contexto 2k | 54,1 |
| Decode tok/s, contexto 32k | 43,9 |
| Prefill tok/s, documento 1k | 4.792,4 |
| Prefill tok/s, documento 2k | 4.701,2 |
| Prefill tok/s, documento 8k | 4.511,8 |
| Prefill tok/s, documento 16k | 4.329,3 |
| Prefill tok/s, documento 32k | 4.014,1 |
| 4 streams, decode agregado tok/s | 217,8 |
| Decodificacion especulativa | n/a (sin cabeza MTP ni drafter) |

Las columnas correspondientes a llama.cpp y a Loom en la tabla original aparecen sin valores («—»), por lo que no es posible establecer la comparación directa entre motores con los datos publicados. La metodología indica que llama.cpp se ejecutó con ROCm y argumentos de servidor no registrados, y que las cifras de Loom se midieron del lado del cliente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el preset `chat-q8-r9700` está dimensionado para la Radeon AI PRO R9700 de 32 GB.
- GPU soportadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151).
- GPU de consumo: no disponible; el paquete está validado únicamente para los dos aceleradores AMD citados.
- Despliegue: SDK `hrx-loom[hf]==0.3.0` instalado con `pipx`, `loom-fetch` para materializar el paquete y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed`.
- Latencia y throughput: techos roofline de 57,2 tok/s en decodificación de prompt corto y 4.792,4 tok/s de prefill a 1k en Strix Halo; no hay cifras publicadas para la R9700.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (paquete Loom) | no disponible | 32.768 | MIT | GGUF + paquete Loom | Validado en gfx1151 y gfx1201; tool calling verificado |
| unsloth/Inkling-2-Mini-GGUF | no disponible | no disponible | no disponible | GGUF | Checkpoint de origen, sin empaquetado de runtime |
| llama.cpp ROCm (motor) | n/a | configurable | MIT | n/a | Motor de referencia en las mediciones; argumentos no registrados |

No se dispone de datos de otros modelos de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada, por lo que la comparación se limita al checkpoint de origen y al motor de inferencia de referencia.

## Limitaciones y advertencias

- Estado de preproducción: la promoción a producción está retenida; los presets fallaron las puertas de comparación y de agente en la cualificación del SDK 0.3.0.
- Tool calling estricto: omitir el nombre de la función en el resultado de una herramienta provoca HTTP 400, lo que exige que el orquestador genere esquemas completos.
- Sin decodificación especulativa: el GGUF no incluye cabeza MTP y no hay drafter publicado para este modelo exacto.
- Contexto efectivo inferior al nominal: el preset Q8 admitió 32.693 de 32.768 tokens, y el benchmark estándar de decodificación larga superó la capacidad del preset.
- Idiomas soportados no documentados: no es posible garantizar calidad en castellano ni en otros idiomas distintos del inglés sin evaluación previa.
- Sin datos de sesgos, alucinación ni evaluaciones de seguridad publicados.
- Licencia MIT declarada en el paquete, pero la licencia del modelo base no se detalla en la información disponible; conviene verificar los términos del checkpoint de Unsloth antes de un uso comercial.
- Repositorio sin descargas ni likes y con 0 GB declarados, lo que sugiere un artefacto de staging no destinado a consumo general.

## Enlaces

- Paquete Loom: https://huggingface.co/loom-fun-staging/unsloth-Inkling-2-Mini-loom-r9700
- Checkpoint base en GGUF: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Flujo de generación loom-skills: https://github.com/loom-fun/loom-skills
- Ejecución de DevLab citada: https://github.com/loom-fun/loom-skills/actions/runs/45269814243/job/138026308365
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
