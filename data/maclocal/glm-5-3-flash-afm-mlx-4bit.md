# maclocal/GLM-5.3-Flash-AFM-MLX-4bit

## Resumen

`maclocal/GLM-5.3-Flash-AFM-MLX-4bit` es una conversión cuantizada en formato AFM (Apple Foundation Model) del checkpoint oficial `zai-org/GLM-5.3-Flash`, desarrollada por el usuario `maclocal` y publicada en Hugging Face. El modelo base, creado por Z.AI, es un transformer de arquitectura Mixture of Experts (MoE) con 320 mil millones de parámetros totales y 18 mil millones de parámetros activos por token, y es el primer modelo nativamente multimodal de la serie GLM-5. Fue publicado el 25 de agosto de 2026 bajo licencia MIT y había estado sirviendo anónimamente como "Ox Alpha" en OpenRouter.

Esta conversión específica utiliza cuantización afine de 4 bits con un tamaño de grupo de 64, aplica transformaciones de layout de atención para el runtime AFM GLM y preserva la capa de predicción multi-token (MTP). El checkpoint resultante tiene 321.323.031.390 parámetros totales y ocupa aproximadamente 181.7 GB. Es un artefacto experimental dirigido a Apple Silicon, con soporte para el runtime AFMKit, y su relevancia radica en permitir ejecutar un modelo de este tamaño en Macs con memoria unificada grande, aunque sin benchmarks de rendimiento publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con capa MTP (multi-token prediction) y soporte multimodal (visión y texto) |
| Parámetros totales | 321.323.031.390 (incluye capa MTP; el modelo base tiene ~320B) |
| Parámetros activos | 18B activos por token (del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit afine, group size 64 (AFM MLX); el checkpoint original está en FP8 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | Safetensors (AFM format-v3) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE con 320B parámetros totales y 18B activos por token. Es nativamente multimodal, con pesos de visión y texto. La conversión `maclocal/GLM-5.3-Flash-AFM-MLX-4bit` es una cuantización 4-bit afine con group size 64, realizada directamente desde la distribución oficial FP8 de Z.AI, no a partir de una cuantización de terceros. Se aplican transformaciones de layout de proyección de atención para el runtime AFM GLM y los pesos del router se mantienen en FP32. La capa MTP (NextN) está preservada, con `num_nextn_predict_layers: 1`.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. La conversión incluye metadatos detallados de procedencia en `.afm-mlx-conversion.json`, con 201 archivos de pesos, 3.059 tensores mapeados y verificaciones SHA-256.

## Capacidades

- Generación de texto y razonamiento: el modelo base está diseñado para tareas de razonamiento y generación de texto. La conversión preserva los pesos y el chat template, por lo que esta capacidad está disponible en principio, aunque no ha sido evaluada con benchmarks en esta conversión.
- Soporte multimodal (visión y texto): los pesos de visión están preservados en el checkpoint convertido. Sin embargo, la model card advierte que la calidad de visión end-to-end no está cualificada, por lo que esta capacidad debe considerarse experimental.
- Soporte de tool calling / function calling: no está verificado. La model card indica que la corrección bajo tool calls no se ha medido, por lo que no se puede confirmar su funcionamiento.
- Soporte de agentes y razonamiento multi-paso: no hay datos disponibles. El modelo base es de razonamiento, pero no se ha evaluado en esta conversión.
- Capacidades multilingües: los idiomas declarados son inglés (en) y chino (zh). Es probable que el modelo base soporte más idiomas, pero no está especificado.
- Capacidad especial de decodificación MTP: la capa NextN (multi-token prediction) está preservada y fue cargada correctamente por el runtime AFM durante la validación. Esto puede permitir una decodificación más rápida, aunque el beneficio real no está medido.
- Modo de razonamiento: el modelo no expone un interruptor directo para desactivar el razonamiento. El parámetro `--reasoning-effort low` lo reduce, pero no lo elimina.

## Casos de uso

- Inferencia local en Apple Silicon: la cuantización 4-bit y el formato MLX permiten ejecutar el modelo en Macs con memoria unificada grande. Es adecuado para prototipado de aplicaciones de texto sin depender de la nube, manteniendo los datos en local.
- Asistente conversacional multilingüe (inglés y chino): el modelo conserva el chat template y soporta conversación multi-turno. Puede usarse para chatbots en esos idiomas, con la ventaja de la ejecución local.
- Razonamiento con decodificación MTP: la capa NextN preservada puede acelerar la generación de texto en el runtime AFM. Adecuado para aplicaciones que requieren baja latencia en generación larga, aunque el beneficio real no está medido.
- Investigación de arquitecturas MoE y cuantización: el artefacto incluye metadatos de conversión detallados (mapeo de tensores, SHA-256, unidades completadas). Es útil para estudiar la preservación de pesos en cuantización 4-bit y el impacto de la capa MTP.
- Experimentación con visión (potencial): los pesos de visión están preservados, por lo que se puede probar el modelo con entradas de imagen. Sin embargo, la calidad end-to-end no está cualificada, por lo que debe usarse solo para experimentos, no para producción.
- Servidor local compatible con API OpenAI: la model card incluye un ejemplo de curl al endpoint `/v1/chat/completions`. Permite integrar el modelo en herramientas que ya usan la API de OpenAI, como frameworks de agentes o aplicaciones de chat, con un servidor local AFM.
- Evaluación del runtime AFM y del soporte MTP: para desarrolladores que quieran validar la decodificación especulativa (drafted tokens, accepted tokens) en Apple Silicon. La model card documenta una validación concreta: 4 drafted tokens aceptados, 9 head forwards, 5 target forwards, 0 replays.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una validación de runtime e integridad, no un benchmark estándar. Los resultados de la validación fueron:

| Métrica | Valor |
|---|---|
| Solicitud de prueba | Greedy streaming, "Return exactly PASS and nothing else." |
| Resultado | PASS con `finish_reason=stop` |
| Drafted tokens | 4 |
| Accepted tokens | 4 |
| Head forwards | 9 |
| Target forwards | 5 |
| Rejection replays | 0 |

Esta validación confirma que el checkpoint carga correctamente y que la capa MTP funciona a nivel estructural, pero no mide throughput, latencia ni calidad bajo otros prompts, batch sizes, cache states, tool calls o entradas de visión.

## Requisitos de hardware

- Memoria: la carga del checkpoint midió aproximadamente 169.4 GB de memoria wired en una máquina de desarrollo Apple Silicon con 512 GB de RAM. No se ha establecido una configuración mínima.
- VRAM: no aplica, ya que el formato MLX está diseñado para Apple Silicon con memoria unificada. No hay datos de VRAM.
- GPU recomendadas: Apple Silicon (por ejemplo, M1/M2/M3/M4 Ultra) con memoria unificada grande. La máquina de desarrollo tenía 512 GB; no se ha establecido un mínimo.
- Consumer GPU: no cabe en GPUs de consumo típicas (24 GB) debido al tamaño de 169 GB. Aunque es cuantización 4-bit, sigue siendo enorme.
- Opciones de despliegue: AFM con AFMKit v0.1.18-rc.3 o más nuevo, mediante el comando `afm mlx`. No se mencionan vLLM, llama.cpp, Ollama o TGI para esta conversión. El modelo base puede ejecutarse con otros runtimes (por ejemplo, GGUF), pero no en esta conversión.
- Latencia y throughput: no hay mediciones de throughput. Solo se dispone de la validación de runtime con 4 tokens aceptados, que no permite estimar latencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Cuantización | Contexto | Licencia |
|---|---|---|---|---|---|
| maclocal/GLM-5.3-Flash-AFM-MLX-4bit | 321.323.031.390 | 18B | 4-bit afine, group size 64 | no disponible | MIT |
| zai-org/GLM-5.3-Flash (base) | ~320B | 18B | FP8 (oficial) | no disponible | MIT |

No se dispone de información sobre otras conversiones cuantizadas del mismo modelo (por ejemplo, GGUF o versiones MLX de terceros) en la información proporcionada, por lo que no se puede establecer una comparativa más amplia.

## Limitaciones y advertencias

- Artefacto experimental: la model card lo califica explícitamente como "Experimental AFM artifact". Puede no funcionar con otros runtimes MLX o versiones antiguas de AFM. El comportamiento, la calidad, el rendimiento, el uso de memoria, la compatibilidad y la estructura de archivos pueden cambiar.
- Sin benchmarks estándar: no se han publicado resultados de benchmarks. La validación incluida es solo de runtime e integridad, no una medida de calidad o rendimiento.
- Calidad de visión no cualificada: los pesos de visión están preservados, pero la model card advierte que la preservación de pesos no implica paridad de calidad de imagen. El uso de visión debe considerarse experimental.
- Requiere una cantidad enorme de memoria unificada: la carga medida fue de ~169.4 GB en una máquina de 512 GB. No se ha establecido una configuración mínima, por lo que es probable que se necesite una Mac con al menos 256 GB, aunque no está confirmado.
- El modo de razonamiento no se puede desactivar directamente: el parámetro `--reasoning-effort low` reduce pero no elimina el razonamiento. Esto puede generar salidas de razonamiento no deseadas en aplicaciones que necesitan respuestas directas.
- Los pesos del router están en FP32, lo que puede aumentar el uso de memoria en comparación con una cuantización totalmente en 4-bit.
- Idiomas limitados: los idiomas declarados son inglés y chino. No hay garantía de buen rendimiento en otros idiomas.
- Artefacto no oficial: el repo tiene 15 descargas y 0 likes, y fue creado por `maclocal`, no por Z.AI. No hay garantía de mantenimiento ni soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maclocal/GLM-5.3-Flash-AFM-MLX-4bit
- Modelo base en Hugging Face: https://huggingface.co/zai-org/GLM-5.3-Flash
- AFMKit en GitHub: https://github.com/scouzi1966/AFMKit
- Guía para ejecutar GLM-5.3-Flash localmente (atomic.chat): https://atomic.chat/blog/guides/how-to-run-glm-5-3-flash-locally
- Guía para ejecutar GLM-5.3-Flash localmente (codersera.com): https://codersera.com/blog/how-to-run-glm-5-3-flash-locally-2026/
