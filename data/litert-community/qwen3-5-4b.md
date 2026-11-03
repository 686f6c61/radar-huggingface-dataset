# litert-community/Qwen3.5-4B

## Resumen

Qwen3.5-4B en formato LiteRT-LM es la conversión del checkpoint oficial Qwen/Qwen3.5-4B de Alibaba al formato `.litertlm`, realizada por la comunidad `litert-community` para su uso con el runtime on-device LiteRT-LM de Google (el nuevo nombre de TensorFlow Lite). El objetivo es claro: llevar un modelo de 4B parámetros a inferencia local en dispositivos edge (móviles Android, portátiles, equipos sin GPU dedicada) manteniendo la arquitectura original del modelo base sin modificaciones estructurales, solo con cuantización.

La relevancia de esta ficha está en dos frentes. Por un lado, Qwen3.5 introduce una arquitectura híbrida poco habitual: bloques de atención lineal GatedDeltaNet (regla delta con compuerta) intercalados con un número reducido de bloques de atención completa con compuerta. En este 4B concreto hay 24 capas de atención lineal y 8 de atención completa, lo que mantiene el estado recurrente de tamano constante y solo conserva KV cache en las 8 capas de atención clásica (presupuesto de 4096 tokens en este paquete). Por otro lado, la conversión demuestra que ese híbrido es delegable a GPU en LiteRT mediante un kernel gated-delta de rango ≤4, algo que hasta hace poco quedaba fuera del alcance de los runtimes móviles.

El paquete es **solo el decodificador de texto**: la torre de visión y las cabezas MTP del checkpoint original se descartan, replicando el contrato de carga text-only de `Qwen3_5ForCausalLM`. Se ofrece en dos recetas de cuantización (int8 dinámico y mixed INT4) con tamanos de 4,42 GB y 2,75 GB respectivamente. Requiere litert-lm ≥ 0.15.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: GatedDeltaNet (atención lineal con regla delta y compuerta) + atención completa con compuerta; 24 capas lineales + 8 capas de atención |
| Parametros totales | 4B (aproximado, según nombre del modelo; no se detalla cifra exacta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens de KV cache en las 8 capas de atención; las capas lineales usan estado recurrente de tamano constante |
| Tipos de cuantizacion | int8 dinámico en lineales + embedding (convs, delta rule y 48 proyecciones `in_proj_a`/`in_proj_b` en float); mixed INT4 blockwise-32 en lineales con int8 en embedding y lm_head |
| Idiomas soportados | No disponible en la información proporcionada (el tokenizer cubre inglés, chino, japonés, coreano, árabe, hindi, tailandés, tamil y emoji según las pruebas de tokenización) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: `Qwen3.5-4B_int8.litertlm` (4.418.793.712 B) y `Qwen3.5-4B_mixed_int4.litertlm` (2.754.070.624 B) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5 combina bloques GatedDeltaNet con bloques de atención completa con compuerta. Los bloques lineales aplican una regla delta con compuerta que mantiene un estado recurrente de tamano constante por capa (más convoluciones locales), de modo que la memoria no crece con la longitud de contexto; solo las 8 capas de atención clásica mantienen KV cache, con un presupuesto fijado en 4096 tokens en esta conversión. Esta mezcla busca el coste asintótico de un SSM o atención lineal con la calidad de recuperación de la atención completa en una fracción de las capas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o similar; esos datos corresponden a la model card del checkpoint original Qwen/Qwen3.5-4B y no se incluyen en la información proporcionada. La innovación técnica destacable de esta conversión concreta es el kernel gated-delta de rango ≤4 delegable a GPU en LiteRT, más dos correcciones específicas para el 4B documentadas en las notas de conversión. El checkpoint upstream es multimodal, pero este paquete elimina la torre de visión y las cabezas MTP, conservando únicamente el decodificador de texto.

## Capacidades

- Generación de texto en modo chat, con plantilla de chat actualizada para aceptar la forma de content-parts de litert-lm 0.18 y con interruptor de thinking.
- Modo de razonamiento (thinking) con canal de razonamiento separado y metadato `supports_thinking`; admite presupuesto de tokens de pensamiento.
- Razonamiento aritmético multi-paso (verificado con seis preguntas de multiplicación en las pruebas del autor).
- Tokenización multilingüe con cobertura de marcas combinantes: hindi, tailandés, tamil y árabe con harakat se tokenizan correctamente con el `tokenizer.json` del repositorio (36, 12, 16 y 29 tokens respectivamente en las frases de prueba), además de inglés, chino, japonés, coreano y emoji.
- Inferencia on-device en CPU y GPU (delegación GPU del kernel gated-delta).
- No incluye visión ni audio: la torre de visión fue descartada y los siete marcadores de audio/TTS del `tokenizer_config.json` no están en el `tokenizer.json` usado, por lo que se leen como texto plano.
- No se documenta soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Asistentes conversacionales offline en Android: el fichero mixed INT4 de 2,75 GB cabe en el almacenamiento de un móvil de gama alta y permite conversaciones multi-turno sin conexión, con el estado recurrente de las capas lineales manteniendo el consumo de memoria casi plano.
- Razonamiento aritmético y de sentido común en el dispositivo: útil para calculadoras conversacionales, asistentes de compras o herramientas educativas donde no se puede enviar la consulta a la nube; el modo thinking con presupuesto acotado permite controlar la latencia.
- Procesamiento de texto multilingüe en campo: la tokenización correcta de hindi, tamil, tailandés y árabe con harakat habilita aplicaciones de traducción o resumen en dispositivos sin conectividad en mercados con esos idiomas.
- Prototipado de agentes locales con presupuesto de contexto moderado: los 4096 tokens de KV en las capas de atención son suficientes para instrucciones de sistema, historial corto y una o dos herramientas, aunque no para documentos largos.
- Evaluación de arquitecturas híbridas en investigación: el paquete permite medir en hardware real la diferencia de memoria y latencia entre atención lineal y atención completa con la misma pila de pesos, algo difícil de aislar en entornos de servidor.
- Despliegue en portátiles sin GPU dedicada: la receta int8 de 4,42 GB corre en CPU con litert-lm y sirve para tareas de generación de texto por lotes de baja concurrencia, como clasificación o extracción de entidades.
- Integración en aplicaciones de escritorio o CLI: el runtime litert-lm permite embeber el modelo en herramientas nativas sin depender de Python ni de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente pruebas de correctitud cualitativas:

| Prueba | Resultado |
|---|---|
| Seis preguntas de multiplicación multi-paso, backend CPU, int8 (receta corregida 2026-10-13) | Corregido el fallo previo que agotaba el límite de tokens en 7 de 18 ejecuciones |
| Seis preguntas de multiplicación multi-paso, backend GPU Mac, ambos ficheros | 6 de 6 ejecuciones correctas y con parada propia |
| Puerta de sanidad de 8 preguntas | 8/8 en ambos ficheros |
| Thinking sin presupuesto, backend CPU, int8 (receta corregida) | Corregido el fallo previo de pensamiento que no cerraba (0 de 3 ejecuciones cerraban antes) |
| Fidelidad de conversión `litert_torch.convert` (referencia general del runtime) | Diferencia de 4e-7 frente al original en un Galaxy S26 |

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 4,42 GB para el fichero int8 y 2,75 GB para el mixed INT4, más el estado recurrente de las capas lineales (constante) y la KV cache de las 8 capas de atención (presupuesto de 4096 tokens).
- GPU recomendadas: no se especifican modelos de GPU de servidor; el runtime está orientado a GPU móviles e integradas. La delegación GPU del kernel gated-delta se ha verificado en Mac (GPU de Apple Silicon) y en Android (Galaxy S26).
- ¿Cabe en GPU consumer? El fichero mixed INT4 de 2,75 GB cabe en GPUs consumer con 6-8 GB de VRAM si el runtime lo soporta; el int8 de 4,42 GB requiere al menos 6 GB. No se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: litert-lm ≥ 0.15 (versiones verificadas: 0.15.0, 0.16.0 y 0.18.0), con CLI para Android y build para macOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card no reporta tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B (LiteRT-LM, este paquete) | 4B | 4096 tokens KV (capas lineales sin KV) | Híbrido GatedDeltaNet + atención | Apache 2.0 | `.litertlm` |
| Qwen3.5-0.8B (LiteRT-LM, mismo autor) | 0,8B | No disponible | Híbrido GatedDeltaNet + atención | Apache 2.0 | `.litertlm` |
| Qwen/Qwen3.5-4B (upstream) | 4B | No disponible | Híbrido GatedDeltaNet + atención, multimodal | Apache 2.0 | safetensors (presumiblemente) |

La comparación con alternativas de otros fabricantes (Gemma, Llama, Phi en rango 3-4B) no está disponible en la información proporcionada; no se aportan datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El paquete es solo texto: no hay visión ni audio, pese a que el checkpoint upstream sea multimodal. Los marcadores de audio se leen como texto plano.
- El contexto efectivo está limitado a 4096 tokens de KV en las 8 capas de atención; las tareas que requieran recuperación sobre documentos largos no son adecuadas.
- Historial de defectos documentado por el propio autor: entre el 14 de agosto y el 13 de octubre de 2026, el fichero int8 en backend CPU podía agotar el límite de tokens en aritmética multi-paso (7 de 18 ejecuciones) y no cerrar el bloque de pensamiento sin presupuesto (0 de 3). Corregido en la receta del 2026-10-13, pero conviene verificar la versión del fichero por sha256 antes de desplegar.
- El autor advierte de que se debe usar un Engine por conversación; esta nota llegó a la model card el 2026-10-12 aunque el informe original era del 2026-08-06.
- La tokenización anterior a 2026-10-16 dividía mal texto con marcas combinantes (49 tokens en vez de 36 en hindi, 24 en vez de 12 en tailandés, 29 en vez de 16 en tamil, 30 en vez de 29 en árabe con harakat); verificar que se usa el fichero con el `tokenizer.json` del repositorio.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del runtime litert-lm y de las dependencias de Google deben revisarse por separado.
- El repo pesa 40,3 GB, muy por encima de los ficheros de pesos, por lo que la descarga completa no es necesaria si solo se quiere un fichero.
- No se documenta soporte de tool calling, lo que limita su uso en pipelines de agentes con herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 0.8B del mismo autor: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Medición de fidelidad de conversión en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
