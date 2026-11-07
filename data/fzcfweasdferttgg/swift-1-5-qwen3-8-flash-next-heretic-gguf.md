# fzcfweasdferttgg/Swift-1.5-Qwen3.8-Flash-Next-heretic-GGUF

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-heretic-GGUF es una conversión a formato GGUF Q8_0 del checkpoint heretic v2 de la familia Swift 1.5, que a su vez deriva de Qwen3.8-Flash-Next. El modelo original es un transformer híbrido de atención (Gated DeltaNet lineal combinada con atención completa QSA cada cuarta capa) con arquitectura MoE de 512 expertos enrutados (10 activos por token) más un experto compartido, e incorpora una torre de visión Qwen3-VL sin modificar. El checkpoint de origen en BF16 ocupa 336 GB distribuidos en 131 shards, mientras que esta conversión Q8_0 suma 178 GB en siete ficheros GGUF.

La relevancia de esta ficha reside en que el modelo base aplica un post-entrenamiento orientado a eficiencia de razonamiento (63,4 % menos tokens de "thinking" según la model card del autor original) y el edit heretic v2 modifica únicamente 7 tensores mediante actualizaciones de rango 1 en las proyecciones de salida de atención de las capas 30 a 37. El resultado es un modelo multimodal image-text-to-text con contexto de entrenamiento de 262 144 tokens, pensado para despliegue local con llama.cpp, Ollama o LM Studio, aunque su tamaño lo aleja de cualquier GPU de consumo.

La licencia es Swift Open License v1.0 combinada con Qwen Community License: el uso comercial es gratuito por debajo de 1 millón de dólares de ingresos anuales, según los términos upstream. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks propios para esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 36 bloques de atención lineal (Gated DeltaNet) + 12 bloques de atención completa (QSA, cada 4.º bloque); MoE con 512 expertos enrutados y 10 activos por token más experto compartido; PLE n-gram hash embeddings; torre de visión Qwen3-VL; cabeza MTP |
| Parametros totales | no disponible (el checkpoint BF16 de origen ocupa 336 GB en 131 shards) |
| Parametros activos | no disponible (10 de 512 expertos enrutados por token, más experto compartido) |
| Longitud de contexto | 262 144 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | Q8_0 (pesos principales); BF16 para el proyector de visión y la cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 + Qwen Community License (uso comercial gratuito por debajo de 1 M USD de ingresos anuales) |
| Formato de pesos | GGUF (7 shards Q8_0 de 178 GB totales, `mmproj-heretic.gguf` BF16 y `heretic-mtp-BF16.gguf` BF16) |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido poco habitual: de los 48 bloques, 36 usan atención lineal Gated DeltaNet y 12 usan atención completa QSA intercalada cada cuatro capas. La capa MoE contiene 512 expertos enrutados con 10 activos por token y un experto compartido adicional, lo que reduce el coste computacional por token frente a un denso equivalente. Incorpora PLE n-gram hash embeddings y una torre de visión Qwen3-VL sin modificar respecto al checkpoint original, lo que habilita la modalidad image-text-to-text. El contexto de entrenamiento es de 262 144 tokens.

La cadena de entrenamiento parte de Qwen/Qwen3.8-Flash-Next, sobre el que ukisai aplicó un post-entrenamiento orientado a eficiencia de razonamiento (63,4 % menos tokens de thinking según su model card). Sobre ese checkpoint, jeffpeng3 aplicó el edit heretic v2, que modifica únicamente 7 tensores con actualizaciones de rango 1 en las proyecciones de salida de atención de las capas 30 a 37. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de las fuentes de llama.cpp v0.9.0, desactivando la fusión de entradas compartidas (tensores `attn_gate`/`attn_qkv`, `hc_*_down`/`hc_*_inject`, `ssm_alpha`/`ssm_beta` separados) y con `--no-nextn` para exportar la cabeza MTP como fichero independiente. El orden de las cabezas V sigue el reordenamiento en mosaico del conversor.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento eficiente (menos tokens de thinking que el modelo base, según la model card upstream).
- Procesamiento multimodal image-text-to-text mediante la torre de visión Qwen3-VL y el proyector `mmproj-heretic.gguf`.
- Predicción multi-token (MTP) mediante la cabeza exportada por separado en BF16, útil para decodificación especulativa.
- Soporte de contexto largo de hasta 262 144 tokens de entrenamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias al contexto de 262 144 tokens y a la torre de visión, el modelo puede procesar informes con gráficos, tablas escaneadas y texto largo en una sola pasada, sin fragmentación.
- Asistentes de razonamiento con coste reducido: el post-entrenamiento orientado a eficiencia de thinking (63,4 % menos tokens) lo hace adecuado para pipelines donde el coste por token de razonamiento es crítico, como clasificación compleja o extracción estructurada.
- Despliegue local en estaciones de trabajo de gama alta: los shards Q8_0 cargan en llama.cpp, Ollama y LM Studio, lo que permite servir el modelo en infraestructura propia sin depender de APIs externas.
- Decodificación especulativa en producción: la cabeza MTP exportada en BF16 puede emplearse para acelerar la generación en servidores compatibles, reduciendo la latencia por token en cargas interactivas.
- Investigación sobre edición de modelos: el edit heretic v2 (7 tensores con actualizaciones de rango 1 en capas 30–37) sirve como caso de estudio reproducible para analizar cómo modificaciones mínimas afectan al comportamiento del modelo.
- Procesamiento de imágenes técnicas: con el proyector de visión BF16, el modelo puede describir diagramas, capturas de pantalla o figuras de papers y combinarlas con razonamiento textual en la misma conversación.
- Evaluación comparativa de cuantizaciones: al existir otros GGUF de la misma familia (por ejemplo, la variante GSQ-RCO), este repositorio permite comparar el impacto de Q8_0 frente a otras estrategias de cuantización sobre el mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 178 GB solo para los pesos, más overhead de contexto KV, proyector de visión y cabeza MTP; en la práctica se requiere un sistema con 200 GB o más de memoria disponible.
- GPU recomendadas: no cabe en ninguna GPU de consumo. Se necesitan configuraciones multi-GPU de centro de datos (por ejemplo, varias A100 80 GB o H100 80 GB) o servidores con memoria unificada de gran capacidad.
- GPU de consumo: no es viable en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en configuraciones SLI de consumo; el tamaño de los pesos lo impide incluso con cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (según la model card); para la cabeza MTP se requiere soporte específico del runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-Flash-Next-heretic-GGUF (este) | no disponible (336 GB BF16) | 262 144 | Image-text-to-text | Swift Open License 1.0 + Qwen Community | GGUF Q8_0, 7 shards |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | 262 144 | Texto (según card upstream) | Swift Open License 1.0 | Pesos originales en HF |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic | no disponible (336 GB BF16) | 262 144 | Image-text-to-text | Swift Open License 1.0 | BF16, 131 shards |
| Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | 262 144 | Image-text-to-text | Swift Open License 1.0 | GGUF con cuantización GSQ-RCO |

Los cuatro modelos comparten la misma arquitectura y contexto; las diferencias están en el post-entrenamiento (eficiencia de razonamiento en ukisai, edit heretic en jeffpeng3) y en el formato de pesos. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El edit heretic v2 modifica solo 7 tensores en las capas 30–37; su efecto sobre el comportamiento no está documentado con evaluaciones públicas, por lo que el modelo puede presentar desviaciones respecto al checkpoint original.
- No hay benchmarks publicados para esta conversión ni para el checkpoint heretic, lo que impide estimar su calidad real frente a alternativas.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de fidelidad factual para esta variante.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; la ausencia de esta información impide garantizar cobertura multilingüe.
- Licencia: Swift Open License v1.0 con umbral de 1 M USD de ingresos anuales para uso comercial gratuito; por encima de ese umbral se requiere licencia adicional. Se aplica también la Qwen Community License.
- Requisitos de hardware extremos: 178 GB en Q8_0 hacen inviable el despliegue en GPU de consumo y limitan su uso a infraestructura de centro de datos.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; conviene verificar la integridad de los shards antes de usarlo en producción.
- La cabeza MTP se exporta por separado y requiere soporte específico del runtime; no todos los backends la aprovechan.
- La información sobre tool calling, agentes y modo thinking no está confirmada para esta variante concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fzcfweasdferttgg/Swift-1.5-Qwen3.8-Flash-Next-heretic-GGUF
- Modelo base (heretic v2): https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Modelo upstream Swift 1.5: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Swift Open License 1.0: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Variante HGN: https://huggingface.co/johnlockejrr/Swift-1.5-Qwen3.8-Flash-Next-heretic-HGN
- Variante GSQ-RCO GGUF: https://huggingface.co/cc1244578151/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
