# mradermacher/Mero-Artemis-31B-v1-heretic-2-GGUF

## Resumen

Mero-Artemis-31B-v1-heretic-2 es un modelo de lenguaje de aproximadamente 30.700 millones de parámetros derivado de la familia Artemis, publicado por el usuario sh0ck0r y cuantizado a formato GGUF por mradermacher. Se trata de un modelo de tipo *merge* (fusión de pesos mediante mergekit) sometido a un proceso de *abliteration* o "heretic" que busca eliminar los mecanismos de rechazo y censura del modelo original, etiquetado explícitamente como `uncensored`, `decensored` y `not-for-all-audiences`. El modelo base declarado es sh0ck0r/Mero-Artemis-31B-v1-heretic-2.

El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino una colección de cuantizaciones estáticas en GGUF (desde Q2_K hasta Q8_0, además de IQ4_XS y f16) generadas con el pipeline de mradermacher, junto con dos ficheros `mmproj` (Q8_0 y f16) que actúan como suplemento multimodal. El tamaño total del repositorio es de 19,8 GB y el número real de parámetros reportado en safetensors del modelo base es de 30.697.345.596.

La relevancia de este modelo es acotada y de nicho: se dirige a quienes necesitan un modelo de ~31B ejecutable en local mediante llama.cpp u Ollama, con licencia Apache 2.0 y sin los filtros de rechazo habituales, para tareas de generación creativa, roleplay o investigación sobre alineación y comportamiento de modelos sin restricciones. No obstante, la ausencia de benchmarks publicados, de documentación sobre el proceso de entrenamiento y de datos sobre el modelo base original limita seriamente su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Artemis; detalles no disponibles) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |
| Tamano del repositorio | 19,8 GB |
| Modelo base | sh0ck0r/Mero-Artemis-31B-v1-heretic-2 |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-11-04 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base más allá de que se trata de un transformer de aproximadamente 30,7B parámetros. Los tags del repositorio indican que el modelo base se construyó mediante `mergekit`, es decir, es una fusión de pesos de otros modelos, y que posteriormente se le aplicó un proceso de *abliteration* (etiquetado como `heretic`, `abliterated`, `decensored`), una técnica que identifica y modifica las direcciones de activación asociadas al rechazo de peticiones para reducir la tasa de respuestas negativas.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card del repositorio cuantizado es una plantilla estándar de mradermacher que solo describe el proceso de cuantización, no el entrenamiento del modelo. La presencia de ficheros `mmproj` sugiere que el modelo base podría tener capacidad multimodal (visión), pero no se confirma en la documentación disponible.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Modelo "uncensored"/"abliterated": diseñado para reducir rechazos y respuestas de evasión ante peticiones sensibles.
- Posible soporte multimodal (visión) por la presencia de ficheros `mmproj` en el repositorio, aunque no confirmado en la documentación.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según el campo `language`.
- Compatible con endpoints (`endpoints_compatible` en los tags), lo que sugiere despliegue vía infraestructura de inferencia estándar.

## Casos de uso

- Roleplay y narrativa creativa sin restricciones: el proceso de abliteration elimina los rechazos ante contenido adulto o violento, lo que lo hace adecuado para ficción interactiva y juegos de rol locales en los que otros modelos censurados bloquean la generación.
- Investigación sobre alineación y seguridad: permite estudiar empíricamente el efecto de la abliteration comparando respuestas con el modelo base no modificado, útil para trabajos académicos sobre mecanismos de rechazo.
- Generación de contenido para escritura asistida sin filtros: guionización, diálogos y textos de ficción donde el autor necesita control total sobre el tono y el contenido sin intervención del filtro del modelo.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de ~31B en GPUs con 24 GB de VRAM (RTX 3090/4090) mediante llama.cpp, sin depender de APIs externas.
- Prototipado de chatbots de personaje: al ser conversacional y sin censura, encaja en aplicaciones de compañía virtual o simulación de personajes donde la coherencia de rol prima sobre la seguridad del contenido.
- Experimentación con merges y cuantizaciones: sirve como caso de estudio de cómo las técnicas de fusión y abliteration afectan al comportamiento y la perplejidad en distintos niveles de cuantización (de Q2_K a Q8_0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización y ventana de contexto):
  - Q8_0 / f16: ~32-62 GB (f16 requiere ~61 GB; Q8_0 ~32 GB).
  - Q6_K: ~25 GB.
  - Q5_K_M: ~21-22 GB.
  - Q4_K_M: ~18-19 GB.
  - Q3_K_M: ~15 GB.
  - Q2_K: ~11-12 GB.
  - IQ4_XS: ~17 GB.
- GPU recomendadas: A100 40/80 GB o H100 para f16/Q8_0; RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB para Q3_K_M con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4/Q5; en GPUs de 12-16 GB solo con Q2_K/Q3_K y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Los tags indican `endpoints_compatible`.
- Latencia y throughput: no disponibles (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mero-Artemis-31B-v1-heretic-2 (este) | ~30,7B | no disponible | Apache 2.0 | GGUF, safetensors | Merge + abliterated, solo inglés |
| Modelos de ~30B tipo Yi-34B / Qwen2.5-32B | ~32-34B | 4K-32K (según variante) | Apache 2.0 / otras | GGUF, safetensors | Modelos base generalistas con benchmarks publicados |
| Modelos abliterated de la familia Llama-3-8B/70B | 8B / 70B | 8K | Llama 3 license | GGUF, safetensors | Alternativas uncensored con más documentación |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparación se limita a parámetros, licencia y formato. No se han identificado benchmarks públicos que permitan situarlo frente a alternativas de su misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de su calidad en MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.
- Modelo "uncensored"/"abliterated": puede generar contenido ofensivo, violento, sexual o legalmente problemático; no es apto para producción orientada al público general sin filtros adicionales.
- Etiquetado `not-for-all-audiences`: el propio autor advierte de que el contenido no es adecuado para todas las audiencias.
- Solo soporta inglés según el campo `language`; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo elevado de alucinación y de degradación de la coherencia tras la abliteration, que puede afectar a la calidad general del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o las políticas de las plataformas de despliegue.
- La documentación del modelo base es inexistente en la información disponible: se desconoce el dataset, el contexto máximo real y la composición del merge.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; no se recomiendan para producción.
- No se garantiza soporte de tool calling ni de agentes; no hay evidencia de ello en la documentación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mero-Artemis-31B-v1-heretic-2-GGUF
- Modelo base: https://huggingface.co/sh0ck0r/Mero-Artemis-31B-v1-heretic-2
- Página de descargas del cuantizador: https://hf.tst.eu/model#Mero-Artemis-31B-v1-heretic-2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
