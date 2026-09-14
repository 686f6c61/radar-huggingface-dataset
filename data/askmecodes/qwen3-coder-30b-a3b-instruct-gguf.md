# AskMeCodes/Qwen3-Coder-30B-A3B-Instruct-GGUF

## Resumen

El repositorio AskMeCodes/Qwen3-Coder-30B-A3B-Instruct-GGUF es una redistribucion en formato GGUF del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct, publicado por el usuario AskMeCodes. Se trata de una conversion a cuantizacion del modelo original de Alibaba Qwen, pensada para ejecucion local y despliegue en hardware modesto mediante llama.cpp, Ollama u otros runners compatibles con GGUF. El repo incluye la etiqueta "imatrix" y remite a las cuantizaciones dinamicas Unsloth Dynamic 2.0, aunque el desglose exacto de variantes de cuantizacion no se detalla en la informacion disponible.

El modelo base es un transformer causal con arquitectura Mixture of Experts (MoE): 30.532.122.624 parametros totales y 3.300 millones activados por token, 48 capas, 128 expertos con 8 activos, y atencion con Grouped Query Attention (32 cabezas de consulta y 4 de clave/valor). Su rasgo mas relevante es la ventana de contexto nativa de 262.144 tokens, ampliable hasta 1.000.000 mediante YaRN, orientada a comprension de repositorios completos y flujos de trabajo agenticos sobre codigo.

La relevancia de esta ficha radica en que Qwen3-Coder-30B-A3B-Instruct combina una huella de memoria de un modelo denso de ~3B activos con el conocimiento de un modelo de 30B, lo que lo situa como candidato para asistentes de programacion autoalojados con contexto largo. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales, y el formato GGUF facilita su integracion en estaciones de trabajo con una sola GPU o incluso en configuraciones con CPU y memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture of Experts (MoE), 48 capas |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B por token (128 expertos, 8 activos) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 con YaRN |
| Tipos de cuantizacion | GGUF cuantizado (etiquetas "imatrix" y Unsloth Dynamic 2.0); el desglose exacto de variantes no esta disponible |
| Idiomas soportados | no disponible (la model card del repositorio no los declara) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original se distribuye en safetensors |
| Cabezas de atencion | GQA: 32 cabezas de consulta, 4 de clave/valor |
| Modo de razonamiento | Solo modo no-thinking; no genera bloques `<think></think>` |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct |
| Tamano del repositorio | 506,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 2026-09-14 (ambas) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de tipo MoE con 48 capas, 128 expertos y 8 expertos activados por token, lo que da lugar a 3,3B parametros activos sobre un total de 30,5B. La atencion emplea Grouped Query Attention con 32 cabezas de consulta y 4 de clave/valor, un diseno que reduce el coste de la cache KV en contextos largos. Segun la model card del modelo base, el modelo paso por fases de preentrenamiento y postentrenamiento, y esta optimizado para tareas de codigo agentico, uso agentico de navegador y tareas fundacionales de programacion, con un formato de llamada a funciones disenado especificamente para plataformas como Qwen Code y CLINE. El modelo soporta unicamente modo no-thinking y no genera bloques de razonamiento explicito en su salida.

Esta variante concreta es una conversion a GGUF realizada por terceros: no anade entrenamiento ni ajuste fino propio, sino que transforma los pesos del modelo base a cuantizaciones de menor precision para inferencia local. El numero exacto de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO y los detalles del proceso de cuantizacion (calibracion imatrix, niveles de bits por tensor) no estan disponibles en la informacion proporcionada. Tampoco se documentan innovaciones adicionales como decodificacion especulativa en esta conversion.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis declarado en tareas fundacionales de programacion segun el modelo base.
- Codificacion agentica: el modelo base incorpora un formato de funcion disenado especificamente para integraciones agenticas, con soporte para Qwen Code y CLINE.
- Uso agentico de navegador (agentic browser-use), segun los puntos destacados del modelo base.
- Tool calling / function calling con formato dedicado.
- Comprension a escala de repositorio gracias a la ventana nativa de 262.144 tokens, ampliable a 1.000.000 con YaRN.
- Razonamiento multi-paso en flujos agenticos (no confirmado con datos de benchmark en la informacion disponible).
- Capacidades multilingues: no disponibles en la informacion proporcionada; la model card del repositorio no declara lista de idiomas.
- Modo thinking: no soportado. El modelo base indica explicitamente que solo funciona en modo no-thinking y que no es necesario especificar `enable_thinking=False`.
- Vision y audio: no disponibles. No se mencionan en la informacion proporcionada.

## Casos de uso

- Asistente de programacion autoalojado: el modelo puede desplegarse en local con llama.cpp u Ollama usando los pesos GGUF y mantener sesiones largas de refactorizacion sobre un repositorio completo, apoyandose en los 262.144 tokens de contexto nativo para no perder referencias entre ficheros.
- Revision de pull requests en pipelines de CI/CD: gracias al soporte de function calling, el modelo puede invocarse desde un runner para analizar diffs, ejecutar comprobaciones y devolver comentarios estructurados sobre el codigo cambiado.
- Agentes de automatizacion de tareas de desarrollo: con un formato de function calling dedicado, el modelo base esta pensado para encadenar llamadas a herramientas (lectura de ficheros, ejecucion de tests, consultas a APIs) dentro de bucles de varios pasos, integrrable con frameworks como CLINE.
- Migracion y modernizacion de bases de codigo: al trabajar sobre contextos de cientos de miles de tokens, resulta adecuado para tareas que requieren correlacionar definiciones, importaciones y usos dispersos en un monorepositorio.
- Generacion de tests y documentacion tecnica: el modelo puede producir pruebas unitarias y documentacion a partir del codigo existente en el mismo contexto, sin necesidad de trocear el repositorio en fragmentos pequenos.
- Despliegue en estaciones de trabajo con una sola GPU: con cuantizaciones de 4 bits, el modelo cabe en tarjetas de 24 GB de VRAM como la RTX 4090, lo que permite ofrecer asistencia de codigo sin enviar codigo propietario a servicios externos.
- Extraccion y transformacion de datos estructurados: el soporte de tool calling permite usar el modelo como componente de un pipeline que convierte texto o codigo en JSON validado mediante esquemas.
- Educacion y analisis de codigo de terceros: la licencia Apache 2.0 y la ejecucion local facilitan su uso en entornos academicos o de auditoria donde no se permite el acceso a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la model card del modelo base solo afirma un rendimiento destacado entre modelos abiertos en codificacion agentica y uso agentico de navegador, sin cifras concretas.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del numero de parametros totales y del nivel de cuantizacion, no datos publicados por el autor del repositorio:

| Cuantizacion | VRAM estimada (solo pesos) | Comentario |
|---|---|---|
| F16 | ~61 GB | Requiere multiples GPU o memoria unificada grande |
| Q8_0 | ~32-33 GB | A100 40 GB, H100, o 2x RTX 4090 |
| Q6_K | ~25-26 GB | Ajustado en GPU de 24 GB; mejor en 32-48 GB |
| Q5_K_M | ~21-22 GB | Cabe en RTX 4090 / RTX 3090 de 24 GB |
| Q4_K_M | ~18-19 GB | Opcion equilibrada para GPU de 24 GB |
| Q3_K_M | ~15 GB | Permite contexto mas largo en 24 GB |
| Q2_K | ~11-12 GB | Adecuado para GPU de 16 GB, con perdida de calidad |

- Cache KV: con 48 capas y 4 cabezas KV de dimension 128, la cache en FP16 ocupa aproximadamente 96 KiB por token; a 262.144 tokens eso supone del orden de 24 GiB adicionales. Cuantizar la cache KV o reducir el contexto efectivo es practicamente obligatorio para uso local con ventanas muy largas.
- GPU recomendadas: A100 40 GB o H100 para contexto completo en precisiones medias-altas; RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) para cuantizaciones de 4-5 bits con contexto moderado.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores; Q4_K_M encaja en 24 GB. En tarjetas de 16 GB solo con Q2_K o Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y servidores compatibles con GGUF. El modelo base admite tambien transformers (se requiere una version reciente; con `transformers<4.51.0` aparece el error `KeyError: 'qwen3_moe'`), vLLM y TGI para los pesos en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (este, via GGUF) | 30,5B | 3,3B | 262.144 nativo, 1M con YaRN | Apache 2.0 | GGUF cuantizado y safetensors |
| Qwen2.5-Coder-32B-Instruct | 32,5B (denso) | 32,5B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF y AWQ |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7B (MoE) | 2,4B | 128.000 | Licencia propia de DeepSeek (con condiciones para uso comercial) | safetensors, GGUF |
| Codestral-22B | 22B (denso) | 22B | 32.000 | Licencia de no produccion de Mistral | safetensors, GGUF |

No se dispone de resultados de benchmark comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y formatos de distribucion. Los datos de los modelos alternativos corresponden a sus especificaciones publicas y no se han verificado en el contexto de esta ficha.

## Limitaciones y advertencias

- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion identicas (2026-09-14). Conviene verificar la integridad de los ficheros antes de usarlos en produccion y, si es posible, preferir la conversion oficial de Unsloth o del equipo Qwen.
- Ausencia de benchmarks: no hay datos publicados de rendimiento para esta conversion concreta, ni comparacion con los pesos originales en safetensors, por lo que la perdida de calidad introducida por la cuantizacion no esta cuantificada.
- Modo thinking no soportado: el modelo base no genera bloques `<think></think>` y solo funciona en modo no-thinking. No es adecuado para flujos que dependan de razonamiento explicito previo a la respuesta.
- Riesgo de alucinacion: no hay datos especificos de tasa de alucinacion. En tareas de codigo, el riesgo tipico incluye APIs inexistentes, dependencias inventadas y firmas de funciones incorrectas, especialmente con cuantizaciones agresivas (Q2, Q3).
- Coste de contexto largo: la cache KV en FP16 a 262.144 tokens ronda los 24 GiB, lo que en la practica limita el contexto util en GPU de consumo salvo que se cuantice la cache o se reduzca la ventana.
- Idiomas: la model card del repositorio no declara la lista de idiomas soportados. El comportamiento en castellano no esta documentado y deberia validarse antes de usarlo en produccion multilingue.
- Licencia: el modelo base se distribuye bajo Apache 2.0, que permite uso comercial. No obstante, esta conversion es un trabajo de terceros y el autor del repositorio no ofrece garantias explicitas sobre los pesos cuantizados.
- Precaucion en produccion: al tratarse de una conversion no oficial, se recomienda fijar la revision exacta del repositorio (hash de commit) y validar los ficheros con checksums para evitar cambios inesperados en los pesos.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/AskMeCodes/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Blog de Qwen sobre Qwen3-Coder: https://qwenlm.github.io/blog/qwen3-coder/
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de Unsloth para Qwen3-Coder: https://docs.unsloth.ai/basics/qwen3-coder
- Cuantizaciones dinamicas de Unsloth (Dynamic 2.0 GGUF): https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Coleccion de Unsloth con todas las versiones de Qwen3: https://huggingface.co/collections/unsloth/qwen3-680edabfb790c8c34a242f95
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth/
- Articulo de referencia citado en las etiquetas (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Demo de chat de Qwen: https://chat.qwen.ai/
