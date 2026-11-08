# bakeralex664/Underdog-27B-1.1

## Resumen

Underdog-27B-1.1 es un modelo de lenguaje de aproximadamente 27.000 millones de parametros (26.895.998.464 segun los pesos safetensors) desarrollado por ConwayResearch y orientado a conversacion, escritura, generacion de codigo y asistencia general. Esta ficha concreta corresponde a un espejo (mirror) publicado por el usuario bakeralex664: una copia byte a byte del fichero `Underdog-27B-Q4_1.gguf` de la revision `266ae25c129e0525ea8dbf78e2dd968e2a3477c1` (4 de octubre de 2026) del repositorio original `ConwayResearch/Underdog-27B-1.1`, conservado para que Catalyst Studio pueda seguir descargandolo si la revision original deja de estar disponible.

El modelo original se publico en esa revision bajo licencia Apache 2.0, y el espejo mantiene esa misma licencia. Segun la informacion disponible, el modelo esta construido sobre Qwen3.8 y ajustado por Conway para funcionar mejor en su producto Underdog orientado a usuarios humanos; la variante 1.0 se distribuyo con pesos MLX 4-bit QAT pensados para decodificacion especulativa de Splash en Apple Silicon. No se dispone de datos sobre arquitectura interna, composicion del dataset de entrenamiento ni resultados de benchmarks.

La relevancia de esta ficha es doble: por un lado documenta un modelo conversacional de ~27B con licencia permisiva; por otro, ilustra el patron de los espejos de pesos con licencia Apache 2.0 que terceros conservan para garantizar reproducibilidad cuando el autor original cambia de terminos en revisiones posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo original se basa en Qwen3.8, segun la model card de la version 1.0) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el espejo contiene unicamente Q4_1 en formato GGUF; la version 1.0 original se publico con pesos MLX 4-bit QAT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (solo para la revision 266ae25c; revisiones posteriores y modelos mas nuevos del autor usan otros terminos) |
| Formato de pesos | GGUF (fichero `Underdog-27B-Q4_1.gguf`, 16,9 GB de repositorio); SHA-256 `bb75d62fe485bfbc2817d63fd2a7d8c1ef2d796218ca80ed155c38592922d459` |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card de la version 1.0 indica que Underdog-27B deriva de Qwen3.8 y que fue ajustado por Conway para mejorar el comportamiento conversacional en su producto Underdog. La variante 1.0 se distribuyo con pesos MLX en cuantizacion 4-bit QAT (quantization-aware training), disenados para combinarse con decodificacion especulativa de Splash y obtener generacion local con baja latencia en Apple Silicon.

El espejo que documenta esta ficha no aporta informacion adicional sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO u otras). Tampoco se especifica si la revision 1.1 introduce cambios respecto a la 1.0 mas alla de lo indicado en la model card original, que no esta incluida en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la descripcion del modelo original ("conversation, writing, coding, and everyday assistance").
- Escritura y redaccion de texto de uso general.
- Generacion de codigo, segun la model card del modelo base.
- Asistencia general en tareas cotidianas.
- Compatibilidad con llama.cpp y el ecosistema GGUF (tag `llama.cpp` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional local: el fichero GGUF Q4_1 permite ejecutar un modelo de ~27B en estaciones de trabajo con llama.cpp, sin dependencia de APIs externas, adecuado para prototipos de chat y pruebas de producto.
- Generacion y revision de texto: redaccion de borradores, resumenes y reescritura en flujos editoriales, aprovechando el ajuste del modelo original para tareas de escritura.
- Asistencia a programadores en local: autocompletado y explicacion de fragmentos de codigo dentro de entornos de desarrollo que consuman un servidor compatible con llama.cpp.
- Archivado y reproducibilidad de pesos: el propio espejo es un caso de uso: conservar una revision Apache 2.0 concreta (commit 266ae25c) para que pipelines internos sigan descargando exactamente el mismo fichero aunque el repositorio original cambie de licencia o de revision.
- Evaluacion comparativa de modelos abiertos: servir como punto de referencia de ~27B en pruebas internas de calidad conversacional y de codigo frente a otros modelos GGUF del mismo orden de magnitud.
- Despliegue en entornos con requisitos de licencia permisiva: al conservar Apache 2.0, el binario puede integrarse en productos comerciales sin obligaciones de atribucion adicionales mas alla de las de dicha licencia.
- Pruebas de inferencia en Apple Silicon: aunque este espejo es GGUF, la variante 1.0 con pesos MLX 4-bit QAT y decodificacion especulativa de Splash esta pensada para generacion local en equipos Apple; util para validar latencia en ese hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_1 ocupa aproximadamente 16,9 GB, por lo que se necesita al menos esa cantidad de memoria (VRAM o memoria unificada) para cargarlo completo; con overhead de contexto conviene reservar 17-20 GB.
- GPU recomendadas: no disponibles de forma especifica en la informacion proporcionada. Por tamano, encaja en GPUs con 24 GB o mas (RTX 3090, RTX 4090, A10G 24 GB, L4 24 GB en configuracion ajustada) y en A100/H100 para despliegues con contexto largo o concurrencia.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizacion Q4_1; en GPUs de 16 GB no cabe el fichero completo y requeriria offload a CPU o cuantizaciones menores no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp (formato nativo del fichero), servidores compatibles con GGUF y endpoints compatibles (tag `endpoints_compatible`). vLLM, TGI u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Underdog-27B-1.1 (este espejo) | ~26,9B | no disponible | GGUF Q4_1 | Apache 2.0 (solo revision 266ae25c) | Espejo byte a byte de ConwayResearch |
| Underdog-27B-1.0 | ~27B (segun model card) | no disponible | MLX 4-bit QAT | no disponible | Version anterior, optimizada para Apple Silicon con decodificacion especulativa de Splash |
| Underdog-Saluki-27B-1.0 | ~27B (por nombre) | no disponible | no disponible | no disponible | Variante de la familia Underdog de ConwayResearch |
| Qwen3.8 (modelo base) | no disponible | no disponible | no disponible | no disponible | Base sobre la que se ajusto Underdog segun la model card de la 1.0 |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un ajuste conversacional sin documentacion de alineacion publica, no puede descartarse la presencia de sesgos heredados del modelo base.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo de ~27B sin benchmarks publicados, debe validarse la salida en dominios factuales.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible.
- Restricciones de licencia: la licencia Apache 2.0 aplica unicamente a la revision 266ae25c129e0525ea8dbf78e2dd968e2a3477c1. Las revisiones posteriores del repositorio original y los modelos mas nuevos de Underdog usan otros terminos; no debe asumirse Apache 2.0 para versiones distintas de esta.
- Trazabilidad: el espejo no incluye conversion, cuantizacion ni edicion alguna; cualquier problema de calidad del GGUF original se reproduce identicamente aqui. Verificar el SHA-256 antes de desplegar.
- Soporte: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor del espejo no es el autor del modelo; no hay garantia de mantenimiento ni de soporte.
- Produccion: sin benchmarks, sin documentacion de contexto y sin datos de tool calling, no se recomienda su uso en produccion sin una evaluacion interna previa.

## Enlaces

- Espejo en Hugging Face: https://huggingface.co/bakeralex664/Underdog-27B-1.1
- Repositorio original (revision espejada): https://huggingface.co/ConwayResearch/Underdog-27B-1.1
- Commit espejado: https://huggingface.co/ConwayResearch/Underdog-27B-1.1/tree/266ae25c129e0525ea8dbf78e2dd968e2a3477c1
- Underdog-27B-1.0: https://huggingface.co/ConwayResearch/Underdog-27B-1.0
- Underdog-Saluki-27B-1.0: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
