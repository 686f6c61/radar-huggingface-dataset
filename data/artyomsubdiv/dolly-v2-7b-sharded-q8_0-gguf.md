# ArtyomSubDiv/dolly-v2-7b-sharded-Q8_0-GGUF

## Resumen

`ArtyomSubDiv/dolly-v2-7b-sharded-Q8_0-GGUF` es una conversión al formato GGUF del modelo `ethzanalytics/dolly-v2-7b-sharded`, una versión troceada (sharded) de la familia Dolly v2 de 7B. El repositorio lo publica el usuario ArtyomSubDiv y ha sido generado con la herramienta GGUF-my-repo de ggml.ai, que internamente emplea llama.cpp para transformar los pesos originales en un único archivo GGUF con cuantización Q8_0. El resultado es un checkpoint de 6.856.056.832 parámetros (unos 6,86 B) y 7,3 GB de repositorio, pensado para inferencia local con llama.cpp y sus derivados.

El problema que resuelve es el de permitir ejecutar un modelo de instrucciones en inglés en hardware modesto, sin necesidad de cargar safetensors en FP16 ni de disponer de GPUs de datacenter. Al estar cuantizado a 8 bits (Q8_0) y empaquetado en GGUF, el modelo se puede desplegar en CPU con instrucciones vectoriales o en GPUs de consumo, manteniendo una degradación de calidad muy baja respecto al original.

Es relevante ahora por su carácter de artefacto práctico: la familia Dolly v2 fue uno de los primeros modelos de instrucciones abiertos y sigue usándose como referencia en docencia, investigación de cuantización y prototipado offline. Ahora bien, conviene ser honesto sobre su alcance: el repositorio acumula 0 descargas y 0 likes, su idioma es únicamente el inglés, y no publica resultados de benchmarks ni detalles de contexto. Se trata de un modelo de nicho, no de una alternativa competitiva frente a los modelos de instrucciones actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; la model card de este repositorio no detalla la arquitectura interna (modelo base: familia Dolly v2, `ethzanalytics/dolly-v2-7b-sharded`) |
| Parametros totales | 6.856.056.832 (6,86 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible oficialmente; los ejemplos de la model card ejecutan `llama-server` con `-c 2048` |
| Tipos de cuantizacion | Q8_0 (archivo `dolly-v2-7b-sharded-q8_0.gguf`); el repositorio no incluye otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |
| Dataset de ajuste | `databricks/databricks-dolly-15k` |
| Tamano del repositorio | 7,3 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card del repositorio es puramente procedimental: describe que el checkpoint se obtuvo a partir de `ethzanalytics/dolly-v2-7b-sharded` mediante llama.cpp y el space GGUF-my-repo, y remite a la model card del modelo base para más detalles. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la técnica de ajuste (por ejemplo, si hubo RLHF o DPO) ni innovaciones arquitectónicas concretas. Lo único documentado es el corpus de ajuste: `databricks/databricks-dolly-15k`, un conjunto de aproximadamente 15.000 pares de instrucción y respuesta en inglés generados por empleados de Databricks para ajuste supervisado de instrucciones.

La innovación técnica relevante en este artefacto es, por tanto, la de la cadena de cuantización y empaquetado: conversión de safetensors troceados a un GGUF único con cuantización Q8_0, lo que reduce el peso a 7,3 GB y habilita la carga con `llama-cli`, `llama-server` o cualquier runtime compatible con GGUF. No se documenta ningún esquema de decodificación especulativa, atención lineal ni mecanismo híbrido.

## Capacidades

- Generación de texto en inglés con formato de instrucciones (prompt y respuesta), orientada a preguntas directas y tareas de redacción breve.
- Respuesta a preguntas de conocimiento general y de tipo conversacional en inglés.
- Generación de texto creativo: los ejemplos oficiales de la model card son preguntas humorísticas y de escenarios hipotéticos sobre Einstein en Suiza.
- Ejecución totalmente offline y local mediante llama.cpp, sin dependencia de APIs externas.
- Capacidad multilingüe: limitada al inglés (etiqueta de idioma `en`); no se declara soporte de otros idiomas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo thinking, visión, audio u otras modalidades: no disponibles; el pipeline declarado es únicamente `text-generation`.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de `llama-server`, que expone una API compatible con el formato de OpenAI.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés sobre hardware de consumo: con un único archivo GGUF Q8_0 de 7,3 GB se puede levantar `llama-server` y disponer de un endpoint HTTP compatible con OpenAI sin acceso a red ni a GPUs de datacenter.
- Inferencia en CPU en entornos sin GPU: el formato GGUF con cuantización Q8_0 permite ejecutar el modelo íntegramente en CPU con llama.cpp, útil para equipos de desarrollo o laboratorios docentes que no disponen de acelerador.
- Entornos aislados (air-gapped) con requisitos de confidencialidad: al no requerir conexión externa ni envío de datos a terceros, encaja en escenarios de banca, sanidad o administración pública donde el texto no puede salir de la infraestructura propia.
- Generación de texto creativo y de borradores en inglés: los propios ejemplos de la model card (escenarios humorísticos, nombres de superhéroes, cuentos breves) ilustran su uso como generador de borradores creativos que después se editan manualmente.
- Preguntas y respuestas sobre documentación corta en inglés: con ventanas de unos 2048 tokens según los ejemplos oficiales, sirve para responder preguntas sobre fragmentos de manuales, notas técnicas o artículos breves en inglés.
- Investigación y docencia sobre cuantización: el repositorio es un caso de estudio reproducible de la conversión safetensors → GGUF Q8_0 y permite medir el impacto de la cuantización de 8 bits frente al modelo base sin cuantizar.
- Generación de datos sintéticos supervisada por humanos: puede usarse para producir candidatos de respuesta en inglés a partir de instrucciones, que un revisor filtra después; el bajo coste de inferencia local facilita el ciclo, pero la calidad debe validarse manualmente.
- Aplicaciones de escritorio y edge con pocos recursos: integración vía llama-cpp-python o contenedores ligeros que empaqueten el GGUF para funcionalidades de autocompletado o resumen en inglés dentro de una aplicación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio ni los metadatos de HuggingFace incluyen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q8_0 ocupan aproximadamente 7,3 GB; sumando caché KV y overhead del runtime, se estiman del orden de 8,5 a 10 GB de VRAM con contexto de 2048 tokens.
- GPU recomendadas: cualquier GPU con 10-12 GB o más de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100 o H100. En A100/H100 el modelo ocupa una fracción mínima de memoria y el cuello de botella pasa a ser el ancho de banda y el batching.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más. En GPUs de 6-8 GB no cabe completo en VRAM, aunque llama.cpp permite descargar parte de las capas a CPU (offloading parcial) a costa de latencia.
- Ejecución en CPU: viable con llama.cpp; se recomienda un mínimo de 16 GB de RAM para el modelo más la caché de contexto, y CPUs con AVX2 o AVX-512 para un rendimiento razonable.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama (importando el GGUF con un Modelfile), LM Studio, text-generation-webui y KoboldCpp. vLLM y TGI no son la vía natural para este artefacto: trabajan de forma nativa con safetensors, por lo que en esos casos conviene usar el modelo base `ethzanalytics/dolly-v2-7b-sharded`.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArtyomSubDiv/dolly-v2-7b-sharded-Q8_0-GGUF | 6,86 B | No disponible (ejemplos con `-c 2048`) | GGUF Q8_0 | MIT | Publico en HuggingFace; 0 descargas, 0 likes |
| ethzanalytics/dolly-v2-7b-sharded (modelo base) | 6,86 B (mismo checkpoint de origen) | No disponible en la informacion proporcionada | safetensors (troceado) | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros modelos comparables de 7 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks, contexto o rendimiento de alternativas comparables dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa frente a otros modelos de 7B de la misma categoría.

## Limitaciones y advertencias

- Idioma: el modelo solo declara inglés; su uso en castellano u otros idiomas producirá respuestas de calidad baja o directamente incoherentes.
- Contexto limitado: los ejemplos oficiales usan 2048 tokens. No sirve para documentos largos ni conversaciones multi-turno extensas sin truncado.
- Dataset de ajuste pequeño: `databricks-dolly-15k` contiene del orden de 15.000 pares de instrucción y respuesta, un volumen muy inferior al de los pipelines de ajuste actuales; cabe esperar un seguimiento de instrucciones frágil ante prompts complejos.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que no se puede verificar ninguna afirmación de calidad. Cualquier despliegue en producción debería ir precedido de una evaluación propia.
- Riesgo de alucinación: al ser un modelo de 7B ajustado con instrucciones y sin datos publicados de alineamiento (RLHF/DPO) ni de tasas de veracidad, la probabilidad de generar afirmaciones falsas con seguridad es alta.
- Sin soporte documentado de tool calling ni de flujos de agente: no conviene integrarlo en pipelines que dependan de llamadas a funciones estructuradas.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad en la información disponible; el corpus Dolly-15k está generado por empleados de una empresa, lo que puede introducir sesgos de dominio y de estilo.
- Estado del repositorio: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad; no hay informes de terceros sobre fallos de conversión o degradación de la cuantización.
- Cuantización Q8_0: aunque es una cuantización de alta fidelidad, introduce una pérdida de precisión respecto a los pesos en FP16 del modelo base. Si se necesita la máxima calidad, hay que usar el modelo original en safetensors.
- Licencia: el repositorio se distribuye bajo MIT, lo que permite uso comercial, pero conviene revisar por separado los términos del dataset de instrucciones `databricks/databricks-dolly-15k` y del modelo base antes de un despliegue comercial.
- Fecha de publicación: los metadatos de HuggingFace indican creación el 20 de septiembre de 2026 y última actualización el mismo día, apenas 31 segundos después, lo que sugiere una publicación automatizada sin revisión posterior.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/ArtyomSubDiv/dolly-v2-7b-sharded-Q8_0-GGUF
- Modelo base: https://huggingface.co/ethzanalytics/dolly-v2-7b-sharded
- Dataset de ajuste: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Space GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos correspondían a páginas corporativas de Microsoft, sin relación con el artefacto.
