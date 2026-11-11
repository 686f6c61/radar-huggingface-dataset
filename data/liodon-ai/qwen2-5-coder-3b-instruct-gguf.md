# liodon-ai/Qwen2.5-Coder-3B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-3B-Instruct-GGUF es una colección de cuantizaciones en formato GGUF del modelo Qwen2.5-Coder-3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba y empaquetado para inferencia local por el usuario liodon-ai. El modelo base es un transformer decoder-only de 3.085.938.688 parámetros (aproximadamente 3B) especializado en generación y comprensión de código, afinado con instrucciones para uso conversacional. Esta versión GGUF resuelve el problema de desplegar el modelo en hardware de consumo mediante llama.cpp, Ollama, LM Studio o Jan, sin necesidad de GPUs de datacenter.

La relevancia de esta ficha radica en que permite ejecutar un modelo de código de 3B parámetros en equipos con tan solo 2-4 GB de VRAM libre, lo que lo convierte en una opción práctica para asistentes de programación locales, autocompletado en IDE y tareas de generación de código en entornos con requisitos de privacidad. El repositorio incluye siete cuantizaciones estándar (desde Q2_K hasta Q8_0), con Q4_K_M como punto de equilibrio recomendado por el autor.

Cabe señalar que el modelo base pertenece a la familia Qwen2.5-Coder, publicada por Alibaba, mientras que esta publicación es una derivación no oficial cuantizada. La licencia indicada es "other", heredada del modelo original, por lo que las condiciones de uso comercial deben verificarse en la ficha del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), especializado en código |
| Parametros totales | 3.085.938.688 (~3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | other (heredada del modelo base Qwen2.5-Coder-3B-Instruct) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-3B-Instruct es un transformer decoder-only denso de la familia Qwen2, con aproximadamente 3.086 millones de parámetros. Está especializado en tareas de código mediante un proceso de preentrenamiento y ajuste fino con instrucciones (instruction tuning) sobre un corpus orientado a programación. La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el ajuste final.

Esta publicación concreta no reentrena el modelo: únicamente aplica cuantización post-entrenamiento en formato GGUF mediante las herramientas de llama.cpp. El autor menciona además la existencia de una variante separada con calibración iMatrix para cuantizaciones sub-4-bit de mayor calidad (`liodon-ai/Qwen2.5-Coder-3B-Instruct-imatrix-GGUF`). No se documentan innovaciones arquitectónicas adicionales en la información disponible.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación, heredadas del modelo base Qwen2.5-Coder.
- Comprensión y edición de código, así como respuesta a instrucciones conversacionales (pipeline text-generation, etiqueta conversational).
- Razonamiento sobre fragmentos de código y explicación de los mismos.
- Ejecución local sin conexión mediante llama.cpp, Ollama, LM Studio y Jan.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Autocompletado de código en IDE: con Q4_K_M (~1,93 GB) el modelo cabe en 2 GB de VRAM, lo que permite integrarlo en editores como VS Code mediante extensiones que hablan con un servidor llama.cpp local, ofreciendo sugerencias sin enviar código a la nube.
- Asistente de programación offline: desplegado con Ollama (`ollama run hf.co/liodon-ai/Qwen2.5-Coder-3B-Instruct-GGUF:Q4_K_M`), permite a desarrolladores en entornos air-gapped consultar dudas de código sin conexión externa.
- Generación de tests unitarios: el modelo puede recibir una función y producir casos de prueba en el mismo lenguaje, útil en pipelines de CI/CD donde se requiere cobertura adicional automatizada.
- Explicación y documentación de código legacy: dado un fragmento de código heredado, el modelo genera docstrings y comentarios explicativos, adecuado para tareas de mantenimiento en equipos pequeños.
- Prototipado rápido en portátiles: con la cuantización Q3_K_M (~1,59 GB) o Q4_0 (~1,82 GB) se puede ejecutar en portátiles con GPU integrada o CPU, sirviendo como banco de pruebas para prompts antes de escalar a modelos mayores.
- Traducción entre lenguajes de programación: conversión de fragmentos pequeños entre lenguajes (por ejemplo, Python a JavaScript) en herramientas internas de migración, aprovechando la especialización en código del modelo base.
- Enseñanza de programación: como tutor local que explica conceptos y corrige ejercicios sin depender de servicios externos, adecuado en entornos educativos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (datos del autor):
  - Q2_K: 1,27 GB de pesos, ~1 GB de VRAM.
  - Q3_K_M: 1,59 GB de pesos, ~2 GB de VRAM.
  - Q4_0: 1,82 GB de pesos, ~2 GB de VRAM.
  - Q4_K_M: 1,93 GB de pesos, ~2 GB de VRAM (recomendado).
  - Q5_K_M: 2,22 GB de pesos, ~3 GB de VRAM.
  - Q6_K: 2,54 GB de pesos, ~3 GB de VRAM.
  - Q8_0: 3,29 GB de pesos, ~4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4_K_M o Q5_K_M. No se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en todas las cuantizaciones; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/Qwen2.5-Coder-3B-Instruct-GGUF:Q4_K_M`), Ollama, LM Studio y Jan. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (base) | ~3B | No disponible | other | safetensors | Hugging Face oficial |
| Esta versión GGUF (liodon-ai) | ~3B | No disponible | other | GGUF (7 cuants) | Hugging Face |
| Variante iMatrix (liodon-ai) | ~3B | No disponible | other | GGUF (sub-4-bit calibrado) | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para contrastar con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión respecto al modelo base en safetensors; las cuantizaciones Q2_K y Q3_K_M son las más afectadas, mientras que Q8_0 es prácticamente sin pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje de 3B parámetros, especialmente en tareas de razonamiento complejo o código muy extenso.
- La longitud de contexto no está documentada en esta ficha; conviene consultar la ficha del modelo base Qwen2.5-Coder-3B-Instruct para confirmarla antes de usarlo en producción.
- La licencia "other" heredada del modelo base puede imponer restricciones al uso comercial; es obligatorio revisar los términos del repositorio original de Qwen antes de desplegarlo en productos.
- Publicación no oficial: el cuantizador es un tercero (liodon-ai), no el equipo Qwen; no hay garantía de soporte ni de actualizaciones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se confirma soporte de tool calling ni de agentes en esta variante cuantizada; conviene validarlo empíricamente.
- Idiomas soportados no documentados; el modelo base está orientado principalmente a inglés y lenguajes de programación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Qwen2.5-Coder-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Variante iMatrix del mismo autor: https://huggingface.co/liodon-ai/Qwen2.5-Coder-3B-Instruct-imatrix-GGUF
- Perfil del autor: https://huggingface.co/liodon-ai
