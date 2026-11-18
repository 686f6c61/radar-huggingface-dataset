# deep-principle/Hydrogen-1.0-MXFP4

## Resumen

Hydrogen-1.0-MXFP4 es la version cuantizada en formato MXFP4 de Hydrogen-1.0, un modelo de lenguaje desarrollado por Deep Principle orientado a la resolucion de problemas cientificos y a la asistencia en investigacion. El modelo parte de GLM-5.3, un transformer de tipo MoE (mezcla de expertos) propiedad de Zhipu AI, y se ha afinado para interactuar en texto y ayudar con preguntas cientificas, explicar derivaciones y estructurar respuestas a problemas de investigacion abiertos.

El checkpoint cuenta con 384.336.046.080 parametros totales (segun los pesos en safetensors) y una longitud de contexto declarada de 1 millon de tokens, con hasta 128K tokens de salida maxima. La version MXFP4 se ha cuantizado con AMD Quark para su despliegue en hardware AMD Instinct; el equipo reporta pruebas en MI350X con ATOM en tensor parallel 4 y cache KV en FP8.

Su relevancia actual radica en dos factores: por un lado, la licencia MIT permite uso comercial sin restricciones conocidas; por otro, la cuantizacion MXFP4 reduce el peso del checkpoint a 422,8 GB, lo que facilita el despliegue en aceleradores AMD de ultima generacion frente a los pesos BF16 completos. La model card advierte explicitamente de que las salidas deben evaluarse contra las suposiciones, restricciones y evidencias de cada tarea, y de que las demostraciones del blog combinan el modelo con herramientas externas y entornos de investigacion especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3); tag `glm_moe_dsa`; incluye MTP MLPs |
| Parametros totales | 384.336.046.080 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (segun model card; depende del runtime) |
| Longitud maxima de salida | 128K tokens |
| Tipos de cuantizacion | MXFP4 (grupos de 32 elementos, escalas E8M0, activaciones dinamicas); attention, router, embeddings, lm_head y eh_proj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (8-bit, cuantizacion MXFP4 via AMD Quark) |
| Tamano del repositorio | 422,8 GB |
| Modelo base | deep-principle/Hydrogen-1.0 (a su vez basado en zai-org/GLM-5.3) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-31 |
| Fecha de actualizacion | 2026-11-02 |

## Arquitectura y entrenamiento

Hydrogen-1.0 se construye sobre GLM-5.3, un transformer de mezcla de expertos (MoE) segun el tag `glm_moe_dsa` del repositorio. La model card menciona explicitamente capas MLP densas, expertos compartidos y enrutados, y MLPs MTP (multi-token prediction), lo que confirma una topologia MoE con expertos compartidos y prediccion multi-token. No se detalla el numero de expertos, la tasa de activacion ni la dimension oculta.

En cuanto al entrenamiento, la model card remite al blog tecnico para la descripcion general, pero indica que los datasets completos y las recetas no se publican junto con los pesos. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del corpus, ni si se emplearon RLHF, DPO u otras tecnicas de alineamiento. La cuantizacion MXFP4 se realizo con AMD Quark: los MLPs densos, los expertos compartidos y enrutados y los MLPs MTP usan MXFP4 con activaciones dinamicas y grupos de 32 elementos con escalas E8M0; el resto de componentes (attention, router, embeddings, lm_head y eh_proj) permanecen en BF16 para preservar precision.

## Capacidades

- Generacion de texto conversacional y asistencia en investigacion cientifica: preguntas cientificas, explicacion de derivaciones y organizacion de respuestas a problemas abiertos.
- Razonamiento multi-paso con modo de razonamiento configurable mediante `reasoning_effort` (por ejemplo, `"max"` en el ejemplo de uso oficial).
- Razonamiento cientifico aplicado: el blog tecnico presenta ejemplos de computacion cientifica, exploracion de redes de reacciones, analisis estructural por RMN y planificacion experimental.
- Integracion con herramientas externas: las demostraciones del blog combinan el modelo con herramientas y entornos de investigacion especificos.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso autonomo: no confirmado explicitamente; el flujo de trabajo mostrado (enmarcar preguntas, planificar enfoques, analizar evidencia e iterar) sugiere uso asistido, no autonomo.
- Capacidades multilingues: no disponible; la model card incluye una version del README en chino, pero no se declara cobertura de idiomas.
- Vision, audio u otras modalidades: no disponibles; el pipeline es exclusivamente text-generation.
- Contexto largo: ventana declarada de 1M tokens con hasta 128K tokens de salida, sujeta a las limitaciones del runtime y a la memoria disponible.

## Casos de uso

- Asistencia a investigadores en derivaciones fisicas y matematicas: el modelo puede explicar paso a paso derivaciones (por ejemplo, el periodo de un pendulo simple bajo aproximacion de angulo pequeno) y senalar cuando una aproximacion deja de ser valida, util como apoyo docente o de revision preliminar.
- Analisis de estructuras por RMN: segun el blog tecnico, el modelo se ha demostrado en analisis estructural por resonancia magnetica nuclear combinado con herramientas externas; adecuado para preprocesar y contrastar hipotesis estructurales antes de la revision humana.
- Exploracion de redes de reacciones quimicas: el modelo puede ayudar a organizar y razonar sobre rutas de reaccion y redes de reacciones, integrado en entornos de computacion cientifica, gracias a su contexto de 1M tokens para manejar documentacion extensa.
- Planificacion experimental: estructurar planes de experimento, identificar supuestos y restricciones, y proponer iteraciones; el flujo de trabajo del blog (enmarcar, planificar, analizar, iterar) encaja con esta tarea.
- Procesamiento de literatura cientifica de gran volumen: con 1M tokens de contexto, el modelo puede ingerir articulos completos, suplementos y notas de laboratorio en una sola sesion para resumir, comparar y extraer evidencia, siempre con revision cientifica posterior.
- Despliegue en infraestructura AMD Instinct: la version MXFP4 esta pensada para runtimes compatibles con AMD (probada en MI350X con ATOM, TP4, cache KV FP8), lo que permite servir el modelo en clusters AMD sin recurrir a los pesos BF16 completos.
- Servicio de chat cientifico con API compatible con OpenAI: mediante `atom.entrypoints.openai_server` se expone un endpoint `/v1` con el ID `hydrogen-1.0`, integrable en aplicaciones internas de laboratorio o en pipelines de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparables. Solo se reportan observaciones operativas del despliegue: en la prueba del equipo con tensor parallel 4 en MI350X, 128 peticiones concurrentes de razonamiento largo llenaron el pool de cache KV y provocaron desalojo, con una caida brusca de la calidad de respuesta; con 48 peticiones concurrentes el pool se mantuvo por debajo del 75 % y la calidad fue normal. Estas cifras son especificas del despliegue y no constituyen limites universales de concurrencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio MXFP4 ocupa 422,8 GB en disco; en el despliegue de referencia se usa tensor parallel 4 sobre AMD Instinct MI350X con cache KV en FP8, lo que implica distribuir los pesos entre 4 aceleradores. No se dispone de una estimacion oficial de VRAM por GPU para otras configuraciones.
- GPU recomendadas: AMD Instinct MI350X (probado por el equipo con ATOM, TP4). La version NVFP4 del mismo modelo esta probada en 8x NVIDIA B300; la version BF16 requiere memoria de dispositivo/host suficiente y un runtime compatible.
- GPU de consumo: no disponible; con 384.336 millones de parametros y un checkpoint de 422,8 GB, no hay indicios de que quepa en GPUs de consumo (RTX 4090, etc.) en ninguna configuracion documentada.
- Opciones de despliegue: ATOM (runtime usado en las pruebas oficiales, con servidor compatible con la API de OpenAI); se requiere un runtime que soporte el formato de checkpoint MXFP4 exportado. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Comando de referencia: `python -m atom.entrypoints.openai_server --model deep-principle/Hydrogen-1.0-MXFP4 --served-model-name hydrogen-1.0 --trust-remote-code --kv_cache_dtype fp8 -tp 4 --host 0.0.0.0 --server-port 8001`. En ATOM, `--server-port` es el puerto HTTP y `--port` es comunicacion interna del motor.
- Latencia y throughput: no disponibles. Solo se conocen las observaciones de concurrencia (128 peticiones concurrentes provocan desalojo de cache KV y degradacion; 48 concurrentes mantienen el pool por debajo del 75 %).
- Notas de despliegue: conservar los ajustes de fin de turno de `generation_config.json`, junto con tokenizer, chat template, configuraciones de modelo y cuantizacion, e indice de pesos; el equipo senala que el despliegue reportado depende de estos ajustes para detenerse correctamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| Hydrogen-1.0-MXFP4 | 384,3B (MoE) | 1M tokens | MXFP4 (AMD Quark) | MIT | AMD Instinct MI350X (ATOM, TP4) |
| Hydrogen-1.0-NVFP4 | no disponible | no disponible | NVFP4 | MIT | 8x NVIDIA B300 |
| Hydrogen-1.0 (BF16) | 384,3B (MoE) | no disponible | BF16 | MIT | Memoria de dispositivo/host suficiente y runtime compatible |
| GLM-5.3 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento (benchmarks) para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato de cuantizacion, licencia y hardware de referencia. No se han identificado en la informacion disponible otros modelos cientificos de terceros con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinacion: la model card advierte que las salidas deben evaluarse contra las suposiciones, restricciones y evidencias relevantes de cada tarea; las demostraciones del blog requieren revision cientifica.
- Datos de entrenamiento no publicados: los datasets completos y las recetas no se liberan con los pesos, lo que dificulta auditar sesgos o composicion del corpus.
- Idiomas: no se declara cobertura linguistica; el rendimiento fuera del ingles (y posiblemente chino) no esta documentado.
- Contexto efectivo limitado por el runtime: aunque se declara 1M de tokens, la model card indica que los presupuestos de contexto y salida dependen del framework de inferencia, la configuracion del servicio y los recursos; el comando de ejemplo no garantiza operacion a 1M en cualquier despliegue.
- Degradacion bajo carga: con 128 peticiones concurrentes de razonamiento largo en la prueba TP4, el pool de cache KV se lleno y provoco desalojo con caida brusca de calidad; conviene monitorizar la utilizacion y el desalojo de la cache KV.
- Dependencia de configuracion: el despliegue reportado depende de los ajustes de fin de turno en `generation_config.json` y del tokenizer/chat template para detenerse correctamente; omitirlos puede producir generaciones que no terminan.
- Licencia MIT: permite uso comercial sin restricciones conocidas, pero no se especifican garantias ni responsabilidades adicionales en la informacion disponible; verificar el texto completo de la licencia antes de produccion.
- Hardware especifico: la version MXFP4 esta probada en AMD Instinct con ATOM; no hay evidencia publicada de funcionamiento en otras pilas de inferencia ni en GPUs de consumo.
- Capacidades de tool calling y agentes no confirmadas: no se documentan explicitamente, por lo que no deben asumirse en produccion sin validacion previa.

## Enlaces

- Modelo en Hugging Face (MXFP4): https://huggingface.co/deep-principle/Hydrogen-1.0-MXFP4
- Modelo base BF16: https://huggingface.co/deep-principle/Hydrogen-1.0
- Version NVFP4: https://huggingface.co/deep-principle/Hydrogen-1.0-NVFP4
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Blog tecnico: https://blog.deepprinciple.com/introducing-hydrogen-1.0/
- Documentacion de uso: docs/USAGE.md (referenciada en la model card)
- README en chino: README.zh-CN.md (referenciado en la model card)
- Contacto: info@deepprinciple.com
