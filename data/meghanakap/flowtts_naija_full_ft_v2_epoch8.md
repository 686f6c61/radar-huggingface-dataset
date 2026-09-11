# MeghanaKap/flowtts_naija_full_ft_v2_epoch8

## Resumen

MeghanaKap/flowtts_naija_full_ft_v2_epoch8 es un ajuste fino publicado en HuggingFace por la usuaria MeghanaKap sobre el modelo YatharthS/MiraTTS. Los metadatos lo declaran como modelo de generación de texto con etiqueta de arquitectura qwen2, 505.882.368 parámetros (unos 0,51 mil millones) y pesos en safetensors, con licencia Apache 2.0 y soporte declarado únicamente para inglés.

El nombre del repositorio sugiere un ajuste orientado a síntesis de voz (TTS) para acentos nigerianos ("naija") y el sufijo "epoch8" apunta a un entrenamiento de ocho épocas, pero la model card no documenta tarea, datos ni evaluación, y el pipeline declarado sigue siendo text-generation. Esa discrepancia entre nombre y metadatos es la principal advertencia antes de considerarlo para cualquier uso real.

Su interés práctico es acotado pero concreto: por tamaño y licencia es un candidato para prototipado, despliegue en hardware modesto y tareas auxiliares dentro de pipelines mayores (enrutado, extracción, generación de borradores). El repositorio acumula 0 descargas y 0 "likes", y no publica resultados de benchmarks, por lo que debe tratarse como un artefacto sin validar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con etiqueta qwen2 (según tags y librería declaradas); no se detalla la configuración interna |
| Parametros totales | 505.882.368 (≈0,51 mil millones), dato extraído de los pesos safetensors |
| Parametros activos | no aplica (no se declara una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | YatharthS/MiraTTS |
| Pipeline declarado | text-generation |
| Tamaño del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |
| Fechas de metadatos | creación 2026-09-11, actualización 2026-09-11 |

## Arquitectura y entrenamiento

Los metadatos declaran la etiqueta qwen2 y la librería transformers, con pesos en safetensors y 505.882.368 parámetros. La model card no especifica número de capas, dimensión oculta, número de cabezas de atención, tipo de atención, estrategia de tokenización ni si los embeddings están atados. Por el recuento de parámetros, el modelo se sitúa en la escala de 0,5 mil millones, coherente con la familia Qwen2-0.5B, aunque no se confirma que reutilice esa configuración exacta.

El entrenamiento se describe únicamente como un ajuste fino supervisado (tags sft y trl) realizado con Unsloth, que el autor indica que fue "2x faster". No se indican el número de tokens, la composición del dataset, la longitud de secuencia, los hiperparámetros ni si hubo fases de RLHF o DPO. El sufijo del nombre (epoch8) sugiere ocho épocas de entrenamiento, dato no confirmado en la documentación. No se describen innovaciones técnicas adicionales.

## Capacidades

- Generación de texto: es el pipeline declarado en los metadatos, pero no existe ninguna evaluación publicada que lo respalde.
- Conversación: el repositorio incluye la etiqueta "conversational", lo que apunta a un ajuste sobre diálogo, sin ejemplos ni plantilla de chat documentada.
- Compatibilidad de despliegue: los tags text-generation-inference y endpoints_compatible indican que el artefacto está pensado para servirse con TGI y para endpoints gestionados.
- Reentrenamiento: al haber sido entrenado con Unsloth y TRL, el flujo de ajuste fino es replicable con esas herramientas, aunque esto no es una capacidad funcional del modelo.
- Capacidades no evidenciadas: no hay información ni indicios de tool calling, function calling, uso como agente, razonamiento multi-paso, modo "thinking", visión, audio, matemáticas avanzadas ni código.
- Multilingüismo: solo se declara inglés; no hay garantías de comportamiento en castellano ni en otros idiomas.
- Posible orientación a TTS: el nombre del repositorio ("flowtts", "naija") sugiere una relación con síntesis de voz, pero no se documenta ningún componente de audio (códec, vocoder, tokenizador acústico) ni se confirma esa función.

## Casos de uso

Advertencia previa: al no existir evaluación ni documentación de la tarea real, estos escenarios deben validarse empíricamente antes de cualquier uso en producción.

- Generación de texto local en hardware de gama baja: con unos 0,5 mil millones de parámetros, el modelo puede ejecutarse en GPUs de consumo con 4 GB de VRAM para prototipos de autocompletado o generación de texto corto en inglés.
- Enrutado dentro de pipelines RAG: usar el modelo como clasificador generativo que decida qué recuperador, plantilla o herramienta invocar, una tarea donde un modelo pequeño reduce coste y latencia frente a uno de mayor tamaño.
- Extracción de información estructurada: transformar textos cortos en inglés en salidas tipo JSON para tareas de normalización de campos, siempre con validación posterior del esquema.
- Aumento de datos: generar variaciones léxicas de frases en inglés para ampliar datasets de entrenamiento o de pruebas, con revisión humana del material generado.
- Experimentación académica y docencia: servir de banco de pruebas para flujos de ajuste fino con Unsloth y TRL en una única GPU de consumo, dado su tamaño y su licencia permisiva.
- Decodificación especulativa: un modelo de esta escala puede actuar como "draft model" de otro mayor si comparten tokenizador y familia, algo que no está verificado en este caso y que exigiría comprobación previa.
- Chatbot de dominio cerrado: atención conversacional simple en inglés sobre un corpus muy acotado, donde los errores se puedan detectar y filtrar con reglas.
- Investigación sobre TTS: solo si se confirma la hipótesis que sugiere el nombre del repositorio, el modelo podría emplearse como componente de un sistema de síntesis de voz; actualmente no hay evidencia que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite, y la búsqueda web asociada no devolvió fuentes técnicas utilizables. Tampoco se publican mediciones de latencia, throughput ni consumo de memoria, por lo que no es posible comparar su rendimiento con el de otros modelos de forma cuantitativa.

## Requisitos de hardware

- VRAM en fp16: los 505.882.368 parámetros ocupan aproximadamente 1,01 GB en pesos; con caché KV y overhead de ejecución, se puede estimar un consumo de 1,5 a 2 GB (estimación derivada del recuento de parámetros, no medida).
- VRAM en int8: alrededor de 0,51 GB en pesos, con un consumo estimado de 1 GB incluyendo overhead.
- VRAM en int4: alrededor de 0,25 GB en pesos, con un consumo estimado de 0,7 a 1 GB.
- GPU de consumo: sí cabe en cualquier GPU con 4 GB o más, como GTX 1650, RTX 3050, RTX 4060 o RTX 4090, y también en CPU y en Apple Silicon.
- GPU de centro de datos: A100 o H100 están sobredimensionadas para este tamaño; solo tendrían sentido para servir muchas réplicas en paralelo o para reentrenamiento.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM (compatible con la arquitectura Qwen2), Unsloth para reajuste; llama.cpp u Ollama serían viables si se generase una conversión a GGUF, que no está publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación se hace por escala y licencia, dado que no existe información sobre la arquitectura interna, el contexto ni el rendimiento de este modelo.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| MeghanaKap/flowtts_naija_full_ft_v2_epoch8 | 505.882.368 | no disponible | apache-2.0 | HuggingFace, 0 descargas | no disponible |
| Qwen2-0.5B | ≈0,49 mil millones | 32 768 tokens (según documentación pública de la familia) | apache-2.0 | HuggingFace | publicado por el autor original; no incluido en esta ficha |
| Qwen2.5-0.5B | ≈0,49 mil millones | 32 768 tokens (según documentación pública de la familia) | apache-2.0 | HuggingFace | publicado por el autor original; no incluido en esta ficha |
| TinyLlama-1.1B | ≈1,1 mil millones | 2 048 tokens | apache-2.0 | HuggingFace | publicado por el autor original; no incluido en esta ficha |

## Limitaciones y advertencias

- Model card prácticamente vacía: no documenta dataset, hiperparámetros, plantilla de prompt, tokens especiales ni evaluación.
- Discrepancia crítica entre el nombre del repositorio (que sugiere TTS y dominio "naija") y el pipeline declarado (text-generation); existe un riesgo real de que el artefacto no sea un modelo de lenguaje utilizable como tal.
- Riesgo de alucinación: no hay ninguna evaluación que permita acotarlo, y en modelos de esta escala la generación de contenido falso es habitual; se requiere verificación externa en cualquier uso con datos reales.
- Sesgos: imposibles de evaluar al desconocerse la composición de los datos de ajuste.
- Idioma: solo inglés declarado; no hay garantías de calidad en castellano, lo que limita su uso en productos dirigidos al mercado hispanohablante.
- Contexto desconocido: no se puede planificar un uso con prompts largos ni con conversaciones multi-turno extensas sin medirlo antes.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución. Debe verificarse por separado la licencia del modelo base YatharthS/MiraTTS y de los datos usados en el ajuste.
- Sin validación comunitaria: 0 descargas y 0 likes, con fechas de metadatos de septiembre de 2026, lo que dificulta establecer su vigencia y fiabilidad.
- Sin cuantizaciones publicadas: cualquier despliegue con GGUF, AWQ o GPTQ exigiría generarlas y validarlas internamente.
- No apto, sin evaluación previa, para decisiones automatizadas de alto impacto, contenido dirigido a usuarios finales ni entornos regulados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MeghanaKap/flowtts_naija_full_ft_v2_epoch8
- Modelo base (YatharthS/MiraTTS): https://huggingface.co/YatharthS/MiraTTS
- Unsloth (herramienta de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- La búsqueda web realizada no devolvió enlaces técnicos relevantes: los resultados se limitaron a páginas de inicio de sesión de Google Drive, sin relación con el modelo. No se han encontrado papers, blogs, demos ni repositorios asociados.
