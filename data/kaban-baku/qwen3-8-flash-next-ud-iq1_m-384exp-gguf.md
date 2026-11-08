# kaban-baku/Qwen3.8-Flash-Next-UD-IQ1_M-384Exp-GGUF

## Resumen

Este repositorio no contiene un modelo original, sino una derivación podada del modelo Qwen3.8-Flash-Next de Qwen. El autor, kaban-baku, parte de la cuantización UD-IQ1_M (Unsloth Dynamic v3.1) publicada por Unsloth y elimina 128 de los 512 expertos de cada capa del transformer MoE, dejando 384 expertos por capa. El número de expertos activados por token (10) se mantiene intacto. El objetivo es reducir el tamaño del fichero de expertos de 39,2 GB a 30,4 GB y hacer viable la inferencia en un equipo con una GPU de 8 GB y 64 GB de RAM usando el motor Strata.

La poda se realizó seleccionando los expertos que el router de Strata activaba con más frecuencia sobre 299 prompts de ocho categorías (código, lectura y escritura en japonés, uso de herramientas, explicaciones técnicas, conocimiento general, razonamiento y planificación), normalizando y ponderando los recuentos por grupo. Los pesos cuantizados y las filas del router que se conservan se copian byte a byte, sin recuantizar. La lista de expertos conservados es idéntica a la de la variante IQ3_S-384Exp del mismo autor.

El resultado es un compromiso explícito: se gana velocidad de decodificación (de unos 21-22 tok/s en la variante IQ3_S de 512 expertos a unos 50 tok/s) y se reduce el espacio en disco, a costa de una pérdida medible en conocimiento general en japonés (JamC-QA cae de 65,9% a 60,7%) y en calidad de escritura (ELYZA-tasks-100 baja de 3,94 a 3,54 sobre 5). El rendimiento en código se mantiene prácticamente igual. Es relevante para quienes quieran ejecutar un MoE grande en hardware de consumo extremo, asumiendo esas pérdidas y las dependencias específicas del motor Strata.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), derivada de Qwen3.8-Flash-Next |
| Parámetros totales | no disponible |
| Parámetros activos | 10 expertos por token (sobre 384 por capa) |
| Longitud de contexto | 128K (configurado en las evaluaciones del autor) |
| Tipos de cuantización | UD-IQ1_M (Unsloth Dynamic v3.1, actualización del 4 de noviembre) con poda de expertos |
| Idiomas soportados | ja, en |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (dividido en 3 ficheros) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-Flash-Next, un transformer con capas de mezcla de expertos (MoE) en las que cada capa contiene 512 expertos y se activan 10 por token. Esta derivación no entrena ni ajusta nada: toma la cuantización UD-IQ1_M de Unsloth y aplica una poda estructurada de expertos, eliminando 128 por capa y conservando 384. Los pesos cuantizados de los expertos conservados y las filas correspondientes del router se copian sin modificar; no hay recuantización ni calibración adicional.

La selección de expertos se hizo registrando las decisiones del router de Strata sobre 299 prompts agrupados en ocho categorías, normalizando y ponderando los recuentos por grupo y conservando los 384 expertos más elegidos en cada capa. Ninguna de las preguntas de evaluación se usó para la selección. La lista se generó originalmente sobre el fichero IQ3_S y se reutiliza tal cual en esta variante. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ya que la model card de esta derivación no los detalla.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next.
- Generación de código: mantiene un rendimiento prácticamente idéntico al de la variante de 512 expertos en HumanEval (93,3% frente a 93,9%) y algo inferior en MBPP (85,6% frente a 89,1%).
- Uso de herramientas (tool calling): evaluado con tool-eval-bench sobre 69 escenarios, con una puntuación de 85 (frente a 85 de la variante UD-IQ1_M de 512 expertos y 89 de IQ3_S).
- Conocimiento y escritura en japonés: evaluado con JamC-QA (748 preguntas de opción múltiple) y ELYZA-tasks-100.
- Soporte multilingüe limitado a japonés e inglés según los metadatos del repositorio.
- Compatibilidad con decodificación especulativa mediante MTP (multi-token prediction), según la configuración de evaluación del autor.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (las evaluaciones se realizaron sin thinking).

## Casos de uso

- Ejecución local de un MoE grande en hardware de consumo: el modelo está pensado para correr con Strata en una GPU de 8 GB y 64 GB de RAM con un presupuesto de RAM de 24 GB, lo que permite mantener el equipo utilizable para otras tareas mientras se infiere.
- Generación de código en local con requisitos moderados: gracias a su rendimiento en HumanEval (93,3%) y MBPP (85,6%), es adecuado para asistentes de programación en estaciones de trabajo sin GPU de datacenter, aceptando la pérdida de velocidad frente a variantes mayores.
- Automatización de tareas con tool calling: la puntuación de 85 en tool-eval-bench lo hace utilizable en pipelines de agentes que invocan funciones externas, aunque con menor margen que la variante IQ3_S.
- Procesamiento de documentos largos en japonés e inglés: la ventana de 128K configurada permite resumir o extraer información de documentos extensos, con la advertencia de que el conocimiento en japonés se degrada respecto a la variante de 512 expertos.
- Entornos con restricciones de disco: el fichero de expertos ocupa 30,4 GB frente a 39,2 GB de la variante UD-IQ1_M completa y 54,8 GB de IQ3_S, lo que facilita su distribución y almacenamiento en equipos con poco espacio.
- Experimentación e investigación sobre poda de expertos: el repositorio incluye herramientas, la lista de expertos conservados y scripts de evaluación, lo que lo convierte en una base para estudiar el impacto de la poda en calidad y velocidad.
- Inferencia de baja latencia en portátiles: con unos 50 tok/s de decodificación en una RTX 3070 Ti Laptop, es viable para chat interactivo y generación de texto en tiempo real.

## Benchmarks y rendimiento

Resultados publicados por el autor en una RTX 3070 Ti Laptop de 8 GB, 64 GB de RAM, Windows 11, Strata 0.2.11 (engine 0.1.57), presupuesto de RAM de 24 GB, contexto de 128K, MTP y STRATA_ROUTE_PRIOR=1.5. Todas las evaluaciones sin thinking y con temperatura 0.

| Métrica | IQ3_S (512 expertos) | UD-IQ1_M (512) | UD-IQ1_M-384Exp (este) |
|---|---|---|---|
| Tamaño del fichero de expertos | 54,8 GB | 39,2 GB | 30,4 GB |
| Decodificación (tok/s, 2 ejecuciones) | 22,5 / 20,1 | 46,0 / 49,0 | 48,7 / 51,2 |
| Tasa de acierto de caché de expertos | 68% | 75% | 75% |
| JamC-QA (748 preguntas, japonés) | 65,9% | 63,5% | 60,7% |
| HumanEval (164) | 92,7% | 93,9% | 93,3% |
| MBPP (257) | 87,9% | 89,1% | 85,6% |
| ELYZA-tasks-100 (sobre 5) | 3,94 | 3,76 | 3,54 |
| tool-eval-bench (69 escenarios) | 89 | 85 | 85 |

La velocidad de decodificación es la media de 4 peticiones (dos prompts cortos, 1.200 tokens de salida cada una). Las puntuaciones de ELYZA solo son comparables dentro de esta tabla, según el autor.

## Requisitos de hardware

- VRAM estimada: 8 GB de GPU según la configuración de referencia del autor, complementada con 64 GB de RAM del sistema.
- RAM del sistema: 64 GB recomendados; el autor fija un presupuesto de 24 GB para Strata, con lo que casi todos los expertos del fichero permanecen en RAM.
- GPU probada: RTX 3070 Ti Laptop (8 GB). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en el escenario probado con 8 GB de VRAM y apoyo en RAM.
- Despliegue: requiere el motor Strata, no documentado para vLLM, llama.cpp, Ollama ni TGI. Se necesita la serie 0.2.11 (ronda 0214, engine 0.1.57) con soporte de Unsloth Dynamic v3.1, el parche de routing propuesto en el issue #5287 para STRATA_ROUTE_PRIOR y STRATA_ROUTE_RESIDENT, y el perfil de expertos generado con `tools/remap_profile.py`.
- Latencia y throughput: aproximadamente 48,7-51,2 tok/s de decodificación en el hardware de referencia, con una tasa de acierto de caché de expertos del 75%.
- Limitación conocida: con menos de 512 expertos, Strata 0.2.10 y 0.2.11 se detenían con el código 0xC0000409 en prompts de más de unos 3.300 tokens (issue #5104); el workaround es `STRATA_PREFILL_LAYER_MAJOR=0`, no probado aún con este fichero.

## Comparativa con modelos similares

| Modelo | Expertos por capa | Tamaño del fichero de expertos | HumanEval | JamC-QA | Licencia |
|---|---|---|---|---|---|
| UD-IQ1_M-384Exp (este) | 384 | 30,4 GB | 93,3% | 60,7% | qwen-community-1.0 |
| UD-IQ1_M (512 expertos, Unsloth) | 512 | 39,2 GB | 93,9% | 63,5% | qwen-community-1.0 |
| IQ3_S-384Exp (kaban-baku) | 384 | no disponible | 92,7% | 65,9% | qwen-community-1.0 |
| IQ3_S (512 expertos, ISTA-DASLab) | 512 | 54,8 GB | 92,7% | 65,9% | qwen-community-1.0 |

La comparativa se limita a las variantes del mismo modelo base evaluadas por el autor. No se dispone de datos de benchmarks de otras familias de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: el conocimiento en japonés cae 5,2 puntos en JamC-QA respecto a IQ3_S (65,9% a 60,7%) y la calidad de escritura baja de 3,94 a 3,54 en ELYZA-tasks-100.
- La poda de expertos puede degradar capacidades no cubiertas por las evaluaciones del autor; la selección se hizo con 299 prompts y no garantiza cobertura de todos los dominios.
- Dependencia fuerte del motor Strata: requiere una versión concreta, un parche de routing no verificado en la versión publicada y pasos manuales de empaquetado y perfilado. No es un GGUF directamente utilizable en llama.cpp u Ollama.
- El fichero de 28,8 GB (00003-of-00003) no está en este repositorio: debe descargarse de Unsloth y renombrarse, lo que añade un paso manual y un riesgo de error.
- Fallo conocido con prompts largos en Strata 0.2.10 y 0.2.11 (código 0xC0000409 por encima de unos 3.300 tokens); el workaround no se ha probado con este fichero.
- Idiomas limitados a japonés e inglés según los metadatos; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial, ya que puede imponer restricciones adicionales.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-UD-IQ1_M-384Exp-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Variante IQ3_S-384Exp del mismo autor: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-IQ3_S-384Exp-GGUF
- Repositorio GitHub con herramientas y scripts: https://github.com/kaban-baku/Qwen3.8-Flash-Next-IQ3_S-384Exp
- Motor Strata: https://github.com/Niko1221/Strata
- Issue del parche de routing: https://github.com/Niko1221/Strata/issues/5287
- Issue del fallo con prompts largos: https://github.com/Niko1221/Strata/issues/5104
