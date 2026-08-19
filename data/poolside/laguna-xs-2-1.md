# poolside/Laguna-XS-2.1

## Resumen

Laguna XS 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por poolside, diseñado específicamente para tareas de codificacion agente y trabajo de largo horizonte en maquinas locales. Con 33 000 millones de parametros totales y solo 3 000 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia que permite ejecutarlo en hardware de consumo, como un Mac con 36 GB de RAM. Es una version mejorada de Laguna XS.2, con un incremento del 5,4 % en SWE-bench Multilingual y un rendimiento superior en tareas de terminal.

El modelo utiliza una arquitectura de atencion mixta que combina sliding window attention (SWA) y atencion global en una proporcion 3:1, con 40 capas en total. Su ventana de contexto alcanza los 262 144 tokens, lo que lo hace adecuado para repositorios de codigo extensos y conversaciones multi-turno. Ademas, incorpora soporte nativo de razonamiento con pensamiento intercalado entre llamadas a herramientas, y esta disponible bajo la licencia OpenMDW-1.1, que permite uso comercial y no comercial sin restricciones significativas. Se distribuye en formato safetensors y cuenta con variantes cuantizadas FP8, NVFP4 e INT4.

La relevancia de Laguna XS 2.1 radica en su capacidad para ejecutar agentes de codificacion complejos en una unica GPU de consumo, algo que hasta hace poco requeria modelos mucho mayores. Su rendimiento en benchmarks agente como SWE-bench Verified (70,9 %) y Terminal-Bench 2.0 (37,5 %) lo situa en la linea de modelos mucho mas grandes, como MAI-Code-1-Flash o Claude Haiku 4.5, pero con una fraccion de los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion mixta SWA y global (ratio 3:1) |
| Parametros totales | 33 442 617 088 (33,4 B) |
| Parametros activos | 3 B por token |
| Longitud de contexto | 262 144 tokens (256 K) |
| Tipos de cuantizacion | FP8, NVFP4, INT4 (ademas de BF16/FP16 en safetensors) |
| Idiomas soportados | No disponible (SWE-bench Multilingual sugiere soporte multilingue, pero no se especifican idiomas) |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (tambien GGUF via llama.cpp, y variantes cuantizadas) |

## Arquitectura y entrenamiento

Laguna XS 2.1 emplea una arquitectura MoE con 256 expertos y un experto compartido, distribuidos en 40 capas. De estas, 30 utilizan sliding window attention con una ventana de 512 tokens, y las 10 restantes usan atencion global. Esta configuracion mixta reduce el coste computacional y el uso de memoria KV cache, que ademas se cuantiza a FP8 para disminuir el consumo por token. El modelo utiliza gating sigmoide con escalas rotatorias por capa, una innovacion que permite un reparto de atencion mas eficiente.

El entrenamiento comprende fases de pre-entrenamiento, post-entrenamiento y aprendizaje por refuerzo, con el optimizador Muon. El informe tecnico de poolside detalla el uso de data automixing y aprendizaje por refuerzo agente off-policy asincrono, tecnicas que contribuyen a su solidez en tareas agente. El modelo soporta razonamiento nativo con pensamiento intercalado entre llamadas a herramientas, y permite habilitar o deshabilitar el modo de pensamiento por peticion. No se han publicado detalles sobre el volumen exacto de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y codigo de alta calidad, con especial enfasis en tareas de programacion agente.
- Razonamiento intercalado con llamadas a herramientas: el modelo puede alternar pensamiento y ejecucion de tool calls de forma nativa, con soporte para preservar el pensamiento entre pasos.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Ejecucion de tareas de terminal y shell, como demuestra su rendimiento en Terminal-Bench 2.0.
- Resolucion de problemas de software en multiples lenguajes, avalado por SWE-bench Multilingual.
- Capacidad de manejar contextos largos de hasta 256 K tokens, adecuado para repositorios completos o historiales de conversacion extensos.
- Soporte multilingue implicito (por el benchmark SWE-bench Multilingual), aunque no se detallan los idiomas concretos.

## Casos de uso

- Asistente de codificacion en IDE: el modelo puede sugerir parches, refactorizar funciones y explicar fragmentos de codigo directamente en el editor, gracias a su ventana de contexto de 256 K tokens que permite cargar el proyecto completo.
- Agente de resolucion de issues en repositorios: integrado en un sistema como GitHub Actions, puede analizar un issue, explorar el codigo, generar un parche y ejecutar tests de forma autonoma, como demuestra su resultado en SWE-bench Verified.
- Automatizacion de tareas de terminal: puede interpretar comandos, diagnosticar errores de shell y ejecutar secuencias de operaciones en un sandbox, util para operaciones de DevOps y administracion de sistemas.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar pruebas unitarias, documentacion o fragmentos de codigo boilerplate bajo demanda.
- Chatbot tecnico de soporte: su capacidad de razonamiento y su contexto largo permiten mantener conversaciones multi-turno sobre problemas de programacion, citando archivos y lineas concretas del proyecto del usuario.
- Prototipado rapido de aplicaciones: un desarrollador puede describir una funcionalidad en lenguaje natural y el modelo genera el codigo base completo, incluyendo estructura de archivos y dependencias, en una sola sesion con contexto amplio.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a la tabla publicada por poolside en la model card. Se utilizaron parametros de muestreo de temperatura 1,0, top_k 20 y top_p 1, con modo de pensamiento activado y contexto de 256 K tokens, sobre el framework Harbor de Laude Institute.

| Modelo | Tamano (params. totales) | SWE-bench Verified | SWE-bench Multilingual | SWE-Bench Pro | Terminal-Bench 2.0 |
|---|---|---|---|---|---|
| **Laguna XS 2.1** | 33B | 70,9 % | 63,1 % | 47,6 % | 37,5 % |
| Laguna XS.2 | 33B | 69,9 % | 57,7 % | 46,3 % | 35,7 % |
| Qwen3.6-35B-A3B | 35B | 73,4 % | 67,2 % | 49,5 % | 51,5 % |
| North Mini Code | 30B | 67,6 % | - | 40,2 % | 36,0 % |
| MAI-Code-1-Flash | 137B | 71,6 % | 65,5 % | 51,2 % | 54,8 % |
| gpt-oss-120B | 120B | - | - | 16,2 % | 18,7 % |
| Claude Haiku 4.5 | - | 73,3 % | - | 39,5 % | 29,8 % |
| GPT-5.4 Nano | - | - | - | 52,4 % | 46,3 % |

Nota: los resultados de los modelos comparados son las puntuaciones publicas mas altas referenciadas oficialmente, salvo gpt-oss-120B y Claude Haiku 4.5, cuyos valores provienen de sus respectivos leaderboards oficiales.

## Requisitos de hardware

- Inferencia local en Mac con 36 GB de RAM, segun indica poolside en la model card.
- Version FP8: ocupa aproximadamente 34 GB en memoria (estimacion basada en 33 B parametros × 1 byte), por lo que cabe en GPUs de 40 GB o mas, como A100 40 GB o RTX A6000.
- Version INT4: aproximadamente 17-18 GB, ejecutable en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- No se han publicado requisitos oficiales de VRAM minima ni latencia/throughput.
- Opciones de despliegue: vLLM (soporte nativo), Ollama, llama.cpp (PR 25165), y la version FP8 disponible en el repositorio de HuggingFace.
- Para uso agente con contexto largo, se recomienda al menos 48 GB de RAM en CPU y 8 GB de RAM por sandbox, segun la metodologia de benchmark.

## Comparativa con modelos similares

La siguiente tabla compara Laguna XS 2.1 con alternativas de tamano y proposito similar, basandose en los datos publicados por poolside.

| Modelo | Parametros totales | Parametros activos | Contexto | SWE-bench Verified | Terminal-Bench 2.0 | Licencia |
|---|---|---|---|---|---|---|
| **Laguna XS 2.1** | 33B | 3B | 256 K | 70,9 % | 37,5 % | OpenMDW-1.1 |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | 73,4 % | 51,5 % | no disponible |
| North Mini Code | 30B | no disponible | no disponible | 67,6 % | 36,0 % | no disponible |
| MAI-Code-1-Flash | 137B | no disponible | no disponible | 71,6 % | 54,8 % | no disponible |

Laguna XS 2.1 se situa por debajo de Qwen3.6-35B-A3B en ambos benchmarks, pero supera a North Mini Code. Frente a MAI-Code-1-Flash, que tiene cuatro veces mas parametros, ofrece un rendimiento comparable en SWE-bench Verified aunque inferior en Terminal-Bench, con una fraccion de los requisitos de hardware.

## Limitaciones y advertencias

- No se han publicado evaluaciones detalladas sobre sesgos, alucinaciones o comportamientos toxicos en la model card.
- La licencia OpenMDW-1.1 es permisiva, pero conviene revisar los terminos completos en openmdw.ai para usos especificos (patentes, marcas, etc.).
- El rendimiento en tareas de terminal (Terminal-Bench 2.0) es notablemente inferior al de modelos como Qwen3.6-35B-A3B o MAI-Code-1-Flash, lo que sugiere limitaciones en escenarios de shell complejos.
- La ventana de contexto de 256 K tokens puede degradar el rendimiento si se llena por completo; se recomienda mantener un margen de seguridad.
- Aunque el modelo soporta razonamiento, el modo de pensamiento intercalado puede aumentar la latencia en inferencia, especialmente en hardware de consumo.
- No se especifican los idiomas soportados; el rendimiento fuera de ingles (y posiblemente otros idiomas mayoritarios) no esta garantizado.
- Para uso en produccion, es recomendable validar el comportamiento con un conjunto de pruebas propio, dado que los benchmarks agente pueden no reflejar todos los escenarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/poolside/Laguna-XS-2.1
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-xs-2-1
- Informe tecnico (PDF): https://poolside.ai/assets/laguna/laguna-m1-xs2-technical-report.pdf
- Coleccion de variantes cuantizadas: https://huggingface.co/collections/poolside/laguna-xs-21
- Pagina de modelos de poolside: https://poolside.ai/models
- OpenRouter: https://openrouter.ai/poolside/laguna-xs-2.1
- Ollama: https://ollama.com/library/laguna-xs-2.1
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/25165
- Repositorio del agente harness: https://github.com/poolsideai/pool
