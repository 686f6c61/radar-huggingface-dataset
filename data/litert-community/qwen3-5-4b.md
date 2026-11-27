# litert-community/Qwen3.5-4B

## Resumen

Qwen3.5-4B en formato LiteRT-LM es la conversión del modelo Qwen/Qwen3.5-4B de Alibaba al formato `.litertlm`, empaquetado por la comunidad `litert-community` para inferencia on-device con el runtime LiteRT-LM de Google (el nuevo nombre de TensorFlow Lite). El objetivo es ejecutar un modelo de 4B parámetros en dispositivos de borde —móviles Android, portátiles y equipos sin GPU dedicada— con un consumo de memoria contenido y latencias aceptables.

La arquitectura subyacente es híbrida: combina bloques de atención lineal GatedDeltaNet (regla delta con compuertas) intercalados con un pequeño número de bloques de atención completa con compuertas. En esta variante de 4B hay 24 capas de atención lineal y 8 de atención completa. Los bloques lineales mantienen un estado recurrente de tamaño constante en lugar de una caché KV creciente, de modo que el uso de memoria se mantiene prácticamente plano respecto a la longitud de contexto; solo las 8 capas de atención conservan KV, con un presupuesto de 4096 tokens.

El checkpoint original de Qwen3.5 es multimodal, pero este paquete incluye únicamente el decodificador de texto: se descartan la torre de visión y las cabezas MTP, siguiendo el contrato de carga text-only de `Qwen3_5ForCausalLM`. El repositorio ofrece varias recetas de cuantización (int8, int4 mixto) optimizadas para CPU o GPU según la versión del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GatedDeltaNet (atención lineal con regla delta y compuertas) + atención completa con compuertas; 24 capas lineales + 8 de atención |
| Parametros totales | 4B (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en las 8 capas de atención; las capas lineales usan estado recurrente constante |
| Tipos de cuantizacion | int8 dinámico, int4 blockwise-32 mixto (int4 en lineales, int8 en embedding y lm_head), variantes con proyecciones de compuerta en float |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm >= 0.15 |
| Tamano del repo | 61.6 GB (incluye múltiples variantes de cuantización) |
| Tamano de archivos | 2.71 GB (mixed int4 GPU), 2.75 GB (mixed int4), 4.37 GB (int8 GPU), 4.42 GB (int8 CPU) |
| Runtime | LiteRT-LM 0.15.0 a 0.20.x según fichero |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

Qwen3.5 emplea una arquitectura híbrida que intercala bloques GatedDeltaNet con bloques de atención completa. GatedDeltaNet aplica una regla delta con compuertas sobre atención lineal, lo que permite mantener un estado recurrente de tamaño fijo por capa (convolución + estado recurrente) en lugar de una caché KV que crece con el contexto. En este modelo de 4B, 24 de las 32 capas son lineales y solo 8 retienen mecanismo de atención clásico con caché KV limitada a 4096 tokens. El resultado es un uso de memoria casi constante respecto a la longitud de la secuencia, lo que resulta especialmente adecuado para despliegue en dispositivos con RAM limitada.

El proceso de conversión a LiteRT-LM reutiliza la ruta empleada para Qwen3.5-0.8B, incluyendo el kernel gated-delta de rango ≤4 delegable a GPU, más dos correcciones específicas para el modelo de 4B documentadas en las notas de conversión. Las variantes más recientes (2026-11-14) se exportan directamente desde el grafo Qwen3.5 de litert-torch. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de propósito general en el decodificador de texto.
- Razonamiento multi-paso con modo de pensamiento (thinking) conmutables mediante plantilla de chat; el metadata incluye `supports_thinking` y canal de razonamiento.
- Aritmética multi-paso (se documentan pruebas con multiplicaciones encadenadas).
- Soporte de plantilla de chat con formato de partes de contenido (content-parts) desde la versión 0.18, además del formato de cadena clásico.
- Inferencia on-device en CPU y GPU mediante delegación de composites GPU.
- Capacidades multimodales: no disponibles en este paquete (torre de visión descartada).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Asistente conversacional embebido en aplicaciones Android: el modelo se integra mediante `com.google.ai.edge.litert:litert` y puede gestionar diálogos multi-turno en el dispositivo sin conexión, con memoria estable gracias al estado recurrente de las capas lineales.
- Procesamiento de texto en el borde sin conectividad: clasificación, resumen y reescritura de documentos en dispositivos sin acceso a red, usando la variante int8 de 4.42 GB en CPU o la mixed int4 de 2.71 GB en GPU.
- Razonamiento aritmético y resolución de problemas paso a paso en aplicaciones de productividad: el modo thinking permite obtener cadenas de razonamiento antes de la respuesta final, útil en calculadoras avanzadas o asistentes de estudio.
- Prototipado de agentes locales en portátiles: al ejecutarse sobre LiteRT-LM en macOS (verificado en Mac con litert-lm 0.18.0 y 0.15.0), sirve para experimentar con flujos multi-paso sin depender de APIs en la nube.
- Sustitución de modelos mayores en tareas de baja latencia: con 2.71 GB en GPU y cuantización int4 blockwise-32, es viable en dispositivos móviles de gama alta donde un modelo de 7B o superior no cabría.
- Evaluación comparativa de runtimes on-device: el paquete incluye variantes para distintas versiones de LiteRT-LM (0.15 a 0.20), lo que permite medir diferencias de rendimiento y corrección entre backends CPU y GPU en el mismo hardware.
- Generación de texto en herramientas de accesibilidad: dictado, corrección y expansión de texto en el propio dispositivo, preservando la privacidad al no enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según fichero: 2.71 GB (mixed int4 GPU, v0190), 2.75 GB (mixed int4), 4.37 GB (int8 GPU composite), 4.42 GB (int8 CPU). Añadir overhead del runtime y del estado recurrente.
- GPU recomendadas: no se especifican modelos concretos; se documenta ejecución en GPU de dispositivos móviles (Samsung Galaxy S26 con Android 16) y en Mac.
- Cabe en GPU de consumo: sí, por tamaño (2.7-4.4 GB), aunque la información solo verifica móviles y Mac, no tarjetas de escritorio.
- Opciones de despliegue: runtime LiteRT-LM (CLI y librería Android `com.google.ai.edge.litert:litert`), con conversión vía `litert-torch` (`litert_torch.convert`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se documenta una discrepancia de precisión de 4e-7 entre el modelo PyTorch original y la conversión LiteRT en Galaxy S26 (LiteRT 2.2.0, Android 16).
- Advertencia de compatibilidad: el fichero `Qwen3.5-4B_mixed_int4.litertlm` no funciona en Pixel 11 Pro según las notas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (LiteRT-LM) | 4B | 4096 tokens KV (8 capas) | `.litertlm` | Apache 2.0 | Híbrido GatedDeltaNet; on-device |
| Qwen3.5-0.8B (LiteRT-LM) | 0.8B | no disponible | `.litertlm` | Apache 2.0 | Misma ruta de conversión; menor huella |
| Qwen/Qwen3.5-4B (original) | 4B | no disponible | safetensors | Apache 2.0 | Multimodal completo, incluye torre de visión y cabezas MTP |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Este paquete es solo el decodificador de texto: no incluye visión ni cabezas MTP del checkpoint original.
- El presupuesto de caché KV está limitado a 4096 tokens en las 8 capas de atención; secuencias más largas dependen del estado recurrente de las capas lineales.
- Se documenta un fallo corregido el 2026-10-13 en la variante int8 sobre CPU: respuestas de aritmética multi-paso que no terminaban antes del límite de tokens (7 de 18 ejecuciones afectadas, 1 sin respuesta) y pensamientos que no se cerraban con thinking activado sin presupuesto (0 de 3 ejecuciones cerraban). Los usuarios que descargaron el fichero entre el 2026-08-14 y esa fecha pueden verse afectados.
- En GPU, la variante int8 repite dos líneas tras la respuesta a "36 × 25" cuando supera los 400 tokens.
- El fichero `Qwen3.5-4B_mixed_int4.litertlm` presenta problemas en Pixel 11 Pro.
- Requiere litert-lm >= 0.15; cada fichero está ligado a un rango de versiones del runtime (0.15-0.18, 0.19.x, 0.20.x), lo que complica la portabilidad entre versiones.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3.5-4B.
- Idiomas soportados no especificados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la información no detalla restricciones adicionales del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Medición de precisión en Galaxy S26: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
