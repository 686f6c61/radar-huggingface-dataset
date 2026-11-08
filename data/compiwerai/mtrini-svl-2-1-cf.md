# CompiwerAI/Mtrini-SVL-2.1-CF

## Resumen

Mtrini-SVL-2.1-CF es un modelo de generacion de texto orientado a programacion, publicado por Compiwer AI bajo licencia Apache 2.0. Se trata de una release de marca construida directamente sobre el checkpoint `empero-ai/Qwen3.5-9B-Claude-Code` (revision `b3488aeefc9b4656e1840748e1e5d52888f9f104`), sin entrenamiento adicional propio: el autor declara explicitamente que preserva los pesos del modelo de origen y que no reclama preentrenamiento independiente ni fine-tuning completado.

El modelo cuenta con 8.953.803.264 parametros reales (8,954B), verificados mediante inspeccion de los ficheros safetensors, y se distribuye en formato transformers con pesos safetensors. Su proposito declarado es asistir en generacion de codigo, explicaciones de programacion, depuracion, refactorizacion y escritura de scripts dentro de flujos de trabajo de desarrollador.

La relevancia de esta ficha es acotada: al ser un reempaquetado de un checkpoint Qwen3.5 de 9B, sus capacidades reales dependen del modelo upstream, cuya model card original se conserva en `UPSTREAM_MODEL_CARD.md` dentro del repositorio. La validacion publicada por el autor se limita a un smoke test de carga y generacion, que no establece rendimiento en benchmarks ni superioridad en tareas de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (8,954B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta release (existe una release previa del autor en formato GGUF, Mtrini-SVL-1.1-GGUF) |
| Idiomas soportados | en, code |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo de lenguaje causal de la familia Qwen3.5, segun el tag `qwen3_5_text` y la libreria transformers declarada. El checkpoint de origen es `empero-ai/Qwen3.5-9B-Claude-Code`, un modelo de 9B derivado de Qwen3.5. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo upstream dentro de la informacion proporcionada.

Esta release, Mtrini-SVL-2.1-CF, no anade entrenamiento propio: el autor indica que preserva los pesos del checkpoint fuente y que la publicacion es una release de marca de Compiwer AI. La unica validacion documentada consiste en descarga de ficheros, inspeccion de safetensors, carga del tokenizer y del modelo, coincidencia del recuento de parametros y un smoke test de generacion de texto. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni tecnicas hibridas) en la informacion disponible.

## Capacidades

- Generacion de codigo en lenguajes de programacion habituales, orientada a scripts y fragmentos funcionales.
- Explicaciones de programacion y documentacion de comportamiento de codigo.
- Asistencia en depuracion: identificacion de errores y propuesta de correcciones.
- Refactorizacion de codigo existente.
- Generacion y comprension de conversaciones multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles (`en`) y codigo (`code`) segun los metadatos; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de generacion de codigo en el editor: el modelo puede completar funciones y scripts en ingles tecnico y lenguajes de programacion, adecuado para autocompletado contextual en IDE siempre que se valide la calidad con pruebas propias.
- Explicacion de codigo heredado: dado un fragmento de codigo, el modelo puede describir su comportamiento y dependencias, util para incorporar nuevos desarrolladores a bases de codigo desconocidas.
- Depuracion asistida: el modelo puede analizar trazas de error y fragmentos de codigo para proponer hipotesis de causa y parches, integrándose en flujos de revision.
- Refactorizacion guiada: reescritura de funciones para mejorar legibilidad o estructura, con revision humana obligatoria antes de fusionar cambios.
- Generacion de scripts de automatizacion: produccion de scripts de shell, Python u otros lenguajes para tareas operativas repetitivas, aprovechando el sesgo del modelo hacia codigo.
- Documentacion tecnica: redaccion de comentarios, docstrings y guias de uso en ingles a partir de codigo fuente, dado que el modelo solo declara soporte de ingles y codigo.
- Chat tecnico de soporte a desarrolladores: conversaciones multi-turno sobre dudas de programacion, limitadas al idioma ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La validacion del autor se limita a un smoke test de carga y generacion de texto, que no mide MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 18 GB solo para pesos (8,954B parametros), mas memoria para KV cache y activaciones; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB para pesos, mas overhead.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB para pesos, mas overhead; cabe en GPUs de consumo con 8 GB o mas, aunque esta release no publica ficheros GGUF ni cuantizaciones propias.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4-8 bits; en FP16 requiere GPU de 24 GB o superior.
- Opciones de despliegue: transformers (formato nativo de esta release), vLLM y TGI para servicio en FP16; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en este repositorio (el autor publico una release previa en GGUF, Mtrini-SVL-1.1-GGUF, correspondiente a otra version).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mtrini-SVL-2.1-CF | 8,954B | no disponible | Apache 2.0 | safetensors | Reempaquetado de Qwen3.5-9B-Claude-Code, sin benchmarks publicados |
| empero-ai/Qwen3.5-9B-Claude-Code | 9B (declarado) | no disponible | no disponible en la informacion proporcionada | no disponible | Checkpoint de origen del que deriva esta release |
| CompiwerAI/Mtrini-SVL-2.0 | no disponible | no disponible | Apache 2.0 (segun repositorio) | no disponible | Release anterior del mismo autor |
| CompiwerAI/Mtrini-SVL-1.1-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Release previa en formato GGUF, con tags de razonamiento, matematicas y darija |

## Limitaciones y advertencias

- No es un modelo entrenado de forma independiente: es un reempaquetado del checkpoint `empero-ai/Qwen3.5-9B-Claude-Code`; el rendimiento real depende del modelo upstream.
- No hay benchmarks publicados; el smoke test del autor no acredita calidad en codigo ni en ninguna otra tarea.
- Idiomas declarados limitados a ingles y codigo; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada en esta release; conviene consultar la model card upstream antes de disenar flujos con contexto largo.
- Riesgo de alucinacion inherente a modelos generativos de 9B, especialmente en APIs, firmas de funciones y dependencias que el modelo puede inventar.
- Sesgos conocidos: no documentados en la informacion proporcionada; deben evaluarse de forma independiente antes de uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un checkpoint de terceros conviene revisar las condiciones del modelo upstream (`empero-ai/Qwen3.5-9B-Claude-Code`) y de Qwen3.5.
- Repositorio sin descargas ni interacciones en el momento de la consulta; ausencia de comunidad y de historial de uso que permita validar su fiabilidad.
- Cualquier uso en produccion debe acompanarse de evaluacion propia, pruebas automatizadas y revision humana del codigo generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CompiwerAI/Mtrini-SVL-2.1-CF
- Checkpoint de origen: https://huggingface.co/empero-ai/Qwen3.5-9B-Claude-Code
- Release anterior del autor: https://huggingface.co/CompiwerAI/Mtrini-SVL-2.0
- Release previa en GGUF: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.1-GGUF
- Model card upstream preservada: `UPSTREAM_MODEL_CARD.md` dentro del repositorio del modelo
