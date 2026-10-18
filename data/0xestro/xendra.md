# 0xEstro/Xendra

## Resumen

Xendra es un modelo de lenguaje publicado en Hugging Face por el usuario 0xEstro bajo el identificador `0xEstro/Xendra`. El repositorio contiene únicamente pesos en formato safetensors (53,8 GB) y la etiqueta de arquitectura `qwen3_5_text`, lo que apunta a un modelo de texto derivado de la familia Qwen 3.5, aunque no se ha publicado ninguna ficha técnica que lo confirme. Con 26.895.998.464 parámetros (≈26,9 B), se sitúa en la franja de modelos densos de 27-32 B, un segmento muy competitivo para despliegue en una o dos GPU de gama alta.

El modelo no incluye información sobre licencia, idiomas, longitud de contexto, tokenizador ni datos de entrenamiento. Tampoco se han publicado resultados de benchmarks, y el repositorio acumula 7 descargas y 0 likes desde su creación el 18 de octubre de 2026, por lo que no existe validación independiente de su calidad.

Su relevancia potencial es la de un modelo de 27 B en BF16 con pesos abiertos, un tamaño que permite cuantización a 4-5 bits para inferencia en GPU de consumo (24 GB) manteniendo una calidad cercana a modelos de 30 B. No obstante, al carecer de model card, de licencia declarada y de evaluación pública, debe tratarse como un artefacto experimental hasta que el autor publique especificaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta del repositorio es `qwen3_5_text`, lo que sugiere una arquitectura transformer de texto derivada de Qwen 3.5; sin confirmación del autor |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE; el recuento de parámetros es compatible con un modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en el repositorio (solo safetensors). Al ser un modelo de 26,9 B, es cuantizable a GGUF/AWQ/GPTQ con las herramientas habituales, pero no hay versiones publicadas por el autor |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (53,8 GB, coherente con pesos en BF16/F16) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna: ni número de capas, ni dimensión oculta, ni mecanismo de atención (full, sliding window, GQA), ni si emplea decodificación especulativa o atención lineal. La única pista es la etiqueta `qwen3_5_text`, que sugiere que los pesos provienen de un modelo de texto de la familia Qwen 3.5, presumiblemente mediante fine-tuning, fusión o re-empaquetado por parte del autor. El recuento exacto de parámetros (26.895.998.464) y el tamaño del repo (53,8 GB ≈ 2 bytes por parámetro) son consistentes con un transformer denso almacenado en BF16.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código y multilingüe), ni sobre las etapas de alineación (SFT, RLHF, DPO). No se puede confirmar si el modelo incorpora modo de razonamiento extendido, soporte de tool calling o plantilla de chat específica. Cualquier pipeline de producción debería inspeccionar `tokenizer_config.json`, `config.json` y la plantilla de chat del repo antes de integrarlo.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad verificable por el tipo de pesos (modelo de texto, sin torre de visión ni encoder de audio en el repo).
- Razonamiento y matemáticas: presumible, pero no documentado ni evaluado.
- Generación de código: presumible por herencia de la familia Qwen, sin confirmación.
- Tool calling / function calling: no disponible; no se ha publicado plantilla de herramientas ni formato de llamadas.
- Uso como agente y razonamiento multi-paso: no disponible; depende de la plantilla de chat y de la longitud de contexto, ambas desconocidas.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Despliegue autoalojado de un LLM de 27 B en una RTX 4090: cuantizado a 4 bits (≈16-17 GB), el modelo cabría en 24 GB de VRAM y permitiría servir un asistente de texto privado en local, sin dependencia de API externa.
- Base para fine-tuning específico de dominio: con 26,9 B en BF16, es ajustable con LoRA en una A100 80 GB o en 2×A6000; útil para adaptar un modelo generalista a dominios como legal, sanitario o atención al cliente.
- Experimentación académica en evaluación de modelos: sirve como punto de comparación en estudios sobre calidad de modelos de ~30 B, siempre que se documenten las limitaciones de reproducibilidad derivadas de la falta de model card.
- Generación de código en pipelines internos: si hereda las capacidades de la familia Qwen, podría integrarse en tareas de autocompletado y refactorización, previa validación con un conjunto de evaluación propio.
- Procesamiento por lotes de documentos: inferencia offline con vLLM o TGI sobre GPU de 80 GB para tareas de resumen, extracción de entidades o clasificación, aprovechando el coste por token más bajo del autohospedaje.
- Investigación sobre licencias y procedencia de modelos: el caso de Xendra es un ejemplo útil de repositorio sin licencia ni ficha, relevante para estudiar riesgos de cumplimiento en la cadena de suministro de modelos abiertos.
- Prototipado rápido con llama.cpp u Ollama: al ser un safetensors estándar, puede convertirse a GGUF y ejecutarse en CPU/GPU mixta para pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, BBH, MATH ni de ninguna otra suite, y no existe comparación oficial con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones teóricas a partir de 26,9 B de parámetros; no medidas):
  - BF16/F16: ≈54 GB solo para pesos, más KV cache; requiere 80 GB o reparto en varias GPU.
  - INT8: ≈27-29 GB; cabe en A100 40 GB o en 2×RTX 4090.
  - Q6_K: ≈22-23 GB; ajustado en 24 GB, sin margen para contextos largos.
  - Q5_K_M: ≈19 GB; cabe en RTX 4090/3090 de 24 GB con contexto moderado.
  - Q4_K_M: ≈16-17 GB; holgado en 24 GB, viable en 16 GB con contexto corto.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; A100 40 GB o 2×RTX 4090 para INT8; RTX 4090, RTX 3090 o L40S para Q4/Q5.
- GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantización 4-5 bits; en 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q4 y contextos reducidos.
- Opciones de despliegue: vLLM y TGI para safetensors en BF16/FP8 en GPU de datacenter; llama.cpp y Ollama tras conversión a GGUF; ExLlamaV2/AutoAWQ si se generan cuantizaciones propias. No hay cuantizaciones publicadas por el autor.
- Latencia y throughput: no disponible (no hay mediciones). Como referencia teórica, un modelo denso de 27 B en Q4 sobre una RTX 4090 queda limitado por ancho de banda de memoria (≈1 TB/s), lo que sitúa el techo en decenas de tokens por segundo; son cifras estimadas, no verificadas para este modelo.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas públicas; los de Xendra no están disponibles salvo el recuento de parámetros.

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado de validación |
|---|---|---|---|---|---|
| Xendra (0xEstro) | 26,9 B | No disponible | No disponible | safetensors | Sin benchmarks, 7 descargas |
| Qwen2.5-32B | 32,8 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF, AWQ | Amplia evaluación pública |
| Qwen3-32B | 32,8 B | 32.768 nativo, ampliable con YaRN | Apache 2.0 | safetensors, GGUF, AWQ | Amplia evaluación pública |
| Gemma 3 27B | 27 B | 128.000 tokens | Gemma Terms of Use | safetensors, GGUF | Amplia evaluación pública |
| Mistral Small 3.1 24B | 24 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Amplia evaluación pública |

Frente a estas alternativas, Xendra iguala el orden de magnitud en parámetros pero no ofrece garantías de licencia, contexto documentado ni resultados reproducibles, lo que lo descarta para producción reglada mientras el autor no publique esa información.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, sesgos, alineación ni evaluación de seguridad.
- Licencia no declarada: sin licencia explícita, no se puede asumir permiso de uso comercial; en muchas jurisdicciones la ausencia de licencia implica reserva de derechos por defecto.
- Riesgo de alucinación: desconocido y no mitigado documentalmente; ningún modelo de este tamaño está exento, pero aquí no hay evaluación que lo acote.
- Sesgos: no documentados; al desconocerse el corpus, no se puede estimar el sesgo de género, idioma o dominio.
- Contexto e idiomas desconocidos: no se puede garantizar soporte de español ni de conversaciones multi-turno largas sin probar la plantilla de chat y el límite real de tokens.
- Procedencia incierta: la etiqueta `qwen3_5_text` sugiere una base Qwen, pero no se confirma la cadena de derivación ni si se respetan los términos de la licencia original.
- Validación comunitaria prácticamente nula (7 descargas, 0 likes), sin issues ni discusiones que aporten señales de calidad.
- Fecha de creación registrada como 2026-10-18: conviene verificar la coherencia de los metadatos del repositorio antes de confiar en ellos.
- La búsqueda web no devolvió ningún resultado relacionado con el modelo; los resultados obtenidos eran contenido no técnico y ajeno al tema, por lo que se han descartado por completo.

## Enlaces

- Hugging Face: https://huggingface.co/0xEstro/Xendra
- Perfil del autor: https://huggingface.co/0xEstro
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
- Resultados de búsqueda web sobre el modelo: no disponibles (ningún resultado relevante).
