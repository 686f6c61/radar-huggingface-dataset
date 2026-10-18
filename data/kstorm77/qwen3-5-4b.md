# kstorm77/Qwen3.5-4B

## Resumen

kstorm77/Qwen3.5-4B es un espejo en formato GGUF del modelo base Qwen/Qwen3.5-4B, publicado por el usuario kstorm77 bajo licencia Apache 2.0. No es un modelo entrenado desde cero ni una versión oficial: la model card indica que los ficheros se copian para que sigan siendo localizables e inalterados, y que el uso previsto es el resumen de notas de reunión mediante llama.cpp. Es un modelo solo de texto, sin proyector de visión.

El artefacto contiene 4.326.350.848 parámetros (4,33 mil millones) y se distribuye en tres cuantizaciones GGUF: BF16, Q8_0 y Q4_K_M. La conversión se realizó con llama.cpp b11716 (commit 797de63b2) mediante `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize`. El repositorio ocupa 16,1 GB e incluye los hashes SHA256 de cada fichero, lo que permite verificar su integridad.

Su relevancia es práctica: facilita ejecutar un modelo de ~4B en hardware de consumo y en entornos sin conexión, con pesos ya cuantizados y compatibles con el ecosistema llama.cpp. Sin embargo, la información publicada no documenta arquitectura, longitud de contexto, idiomas, datos de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación de calidad exige probar el modelo directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si es transformer, MoE, SSM o híbrido; es una conversión GGUF del modelo base Qwen/Qwen3.5-4B) |
| Parámetros totales | 4.326.350.848 (4,33 mil millones) |
| Parámetros activos | no disponible (no se indica si el modelo es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0 y Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors según los metadatos de parámetros |
| Tamaño del repositorio | 16,1 GB |
| Revisión del modelo base | 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Conversión | llama.cpp b11716 (commit 797de63b2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card no indica si se trata de un transformer, un modelo MoE, una arquitectura SSM o un diseño híbrido, ni documenta el número de tokens de entrenamiento, la composición del dataset o si hubo fases de alineamiento como RLHF o DPO. Tampoco se describen innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos similares.

Lo que sí se documenta es el proceso de conversión y cuantización. Se partió de la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de Qwen/Qwen3.5-4B, se convirtió a GGUF con `convert_hf_to_gguf.py --outtype bf16` y se generaron las variantes Q4_K_M y Q8_0 con `llama-quantize`. Los ficheros incluidos son los siguientes:

| Fichero | Bytes | SHA256 |
|---|---:|---|
| gguf/Qwen3.5-4B-Q4_K_M.gguf | 2.783.446.880 | b1e6eccb2f6e70d07dd9d260f512f84e4808d224c1e35c38282c07691d649c0b |
| gguf/Qwen3.5-4B-Q8_0.gguf | 4.610.580.320 | 651b64e6bce7c2d1fd499cf735124a3c4a08344a88df3a0b8fc7ee6e9d9a120a |
| gguf/Qwen3.5-4B-BF16.gguf | 8.665.620.320 | b2f62c692fdc6d1752095c01171c8407cb31c9ebb95fd0d465ffafeeb4a55e53 |

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el uso previsto en la model card indican que el modelo está pensado para diálogo y resumen de texto.
- Procesamiento local sin conexión: al estar en formato GGUF, puede ejecutarse con llama.cpp en equipos locales.
- Solo texto: no incluye proyector de visión, por lo que no procesa imágenes, audio ni vídeo.
- Compatibilidad declarada con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, aunque no se detalla el protocolo ni el procedimiento de integración.
- No hay información sobre tool calling, function calling, uso como agente, razonamiento multi-paso, generación de código, matemáticas o capacidades multilingües.
- No se documenta un modo de razonamiento explícito (*thinking mode*) ni capacidades de audio.
- No se documenta un ajuste fino específico para notas de reunión; se trata del uso previsto recomendado por el autor del espejo.

## Casos de uso

- Resumen de notas de reunión: cargar la variante Q8_0 o Q4_K_M en llama.cpp, trocear la transcripción y generar resúmenes por bloques. Es adecuado porque el autor lo señala como uso previsto y el modelo es solo de texto, lo que simplifica el despliegue local.
- Asistente conversacional offline en escritorio: servir el GGUF con `llama-server` o importarlo en Ollama para mantener conversaciones multi-turno sin enviar datos a la nube. La cuantización Q4_K_M reduce los requisitos de memoria.
- Procesamiento por lotes de documentos internos: usar `llama-cli` o un script sobre carpetas de informes y correos para generar resúmenes o reescrituras. La variante Q8_0 ofrece mayor fidelidad que Q4_K_M para tareas sensibles.
- Prototipo de RAG local: emplear el modelo como generador de respuestas en un pipeline con recuperación de documentos, ejecutado con llama.cpp. Al no conocerse la longitud de contexto, conviene trocear y limitar cada consulta.
- Reescritura y edición de borradores técnicos: generar versiones alternativas de párrafos, simplificar explicaciones o adaptar el tono con prompts controlados. Requiere revisión humana por el riesgo de alucinación.
- Investigación reproducible sobre cuantización: comparar Q4_K_M, Q8_0 y BF16 con los mismos prompts y la misma revisión del modelo base, verificando los SHA256. Es útil para medir la pérdida de calidad asociada a cada cuantización.
- Integración en aplicaciones de escritorio: importar el GGUF en LM Studio, Ollama o text-generation-webui y exponer una API local para un asistente de productividad.
- Clasificación y etiquetado de texto mediante prompts few-shot: útil para prototipos de categorización de correos o incidencias, aunque sin benchmarks publicados debe validarse con un conjunto propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada solo para los pesos: Q4_K_M ~2,78 GB; Q8_0 ~4,61 GB; BF16 ~8,67 GB. Hay que añadir KV cache y sobrecarga del runtime; con contextos largos, prever entre 1 y 3 GB adicionales.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 de 12 GB o RTX 4090 de 24 GB para uso local. Para servir a varios usuarios, A100 o H100 son opciones habituales, aunque no se han publicado mediciones específicas para este modelo.
- Viabilidad en GPU de consumo: Q4_K_M cabe en GPUs de 6-8 GB; Q8_0 es viable en 8 GB; BF16 requiere aproximadamente 10-12 GB o más, dependiendo del contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama importando el GGUF, LM Studio y text-generation-webui. vLLM y TGI no están orientados de forma nativa a GGUF; para TGI habría que usar los safetensors del modelo base.
- Latencia y throughput: no disponible. Dependen de la GPU o CPU, de la cuantización y de la longitud de contexto; no se han publicado cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| kstorm77/Qwen3.5-4B | 4,33 B | no disponible | Apache 2.0 | GGUF | Espejo no oficial; incluye Q4_K_M, Q8_0 y BF16 |
| Qwen/Qwen3.5-4B | 4,33 B | no disponible | Apache 2.0 | safetensors según los metadatos | Modelo base oficial; la información disponible no detalla arquitectura ni entrenamiento |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se puede establecer una comparativa cuantitativa con alternativas de la misma categoría porque no se han proporcionado resultados de benchmarks ni especificaciones de otros modelos de ~4B.

## Limitaciones y advertencias

- La model card no documenta arquitectura, longitud de contexto, idiomas, datos de entrenamiento ni benchmarks; no es posible validar su calidad frente a otros modelos solo con la información publicada.
- Es un espejo de terceros, no una publicación oficial de Qwen. Antes de usarlo en producción, conviene verificar los SHA256 y la revisión del modelo base.
- El modelo es solo de texto: no procesa imágenes, audio ni vídeo.
- La cuantización Q4_K_M introduce pérdida de fidelidad frente a BF16; para tareas sensibles es preferible Q8_0 o BF16.
- Riesgo de alucinación no mitigado documentalmente; los resúmenes y respuestas deben revisarse por una persona.
- Los idiomas soportados no están declarados; no se debe asumir un buen rendimiento en castellano sin evaluarlo.
- La longitud de contexto es desconocida; las notas de reunión largas pueden requerir troceado y resumen jerárquico.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de licencia y cumplir las condiciones aplicables al modelo base. No hay garantía de ningún tipo.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, lo que implica una validación comunitaria muy baja.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kstorm77/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp usado en la conversión: https://github.com/ggml-org/llama.cpp/commit/797de63b2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
