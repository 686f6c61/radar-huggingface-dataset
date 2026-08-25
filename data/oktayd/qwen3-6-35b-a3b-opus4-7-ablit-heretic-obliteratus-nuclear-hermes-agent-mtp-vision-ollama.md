# oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-Ollama

## Resumen

Este modelo es una cuantización GGUF en formato Q4_K_M del checkpoint `oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-FreeToken`, diseñada específicamente para su ejecución con Ollama. Se trata de una derivada de Qwen3.6-35B-A3B, un modelo de lenguaje híbrido MoE con codificador de visión, que ha pasado por un pipeline de post-entrenamiento que combina destilación de razonamiento del linaje Claude 4.7 Opus, intervenciones de reducción de rechazos (abliteración, Heretic y OBLITERATUS Nuclear) y un ajuste fino supervisado orientado a function calling y codificación agéntica. El resultado es un modelo sin censura, con capacidades de agente y tool use, empaquetado para su uso inmediato en Ollama.

La relevancia de esta versión radica en que ofrece, en un solo artefacto, tres características que normalmente se buscan por separado: razonamiento de alta calidad heredado de la destilación de Claude 4.7 Opus, ausencia de rechazos por alineación de seguridad, y un conjunto de habilidades de tool calling y agentic coding entrenadas explícitamente. Al estar cuantizado en Q4_K_M, puede ejecutarse en hardware de consumo con requisitos de VRAM moderados, lo que lo hace accesible para desarrolladores que necesitan un modelo de agente local sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido con codificador de vision (familia `qwen3_5_moe` / Qwen3.6) |
| Parametros totales | 35.505.251.456 (~35B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | 262.144 nativo; hasta ~1.010.000 extendido (capacidad upstream, no re-benchmarked en esta derivada) |
| Tipos de cuantizacion | Q4_K_M (esta version); el checkpoint base esta en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura base es un transformer causal MoE con 40 capas de texto, hidden size de 2048, 256 expertos enrutados de los cuales 8 se activan por token, un experto compartido y un tamaño intermedio de experto de 512. Incluye un codificador de vision preservado y un modulo MTP (multi-token prediction) / NextN tambien preservado. El contexto nativo es de 262.144 tokens, ampliable hasta aproximadamente 1.010.000 en la configuracion upstream.

El entrenamiento de esta derivada sigue un linaje en cascada: parte del checkpoint oficial Qwen/Qwen3.6-35B-A3B, pasa por una destilacion de razonamiento del linaje Claude 4.7 Opus (lordx64), luego por una abliteracion de Huihui, y posteriormente recibe dos intervenciones adicionales de reduccion de rechazos: Heretic (adaptado a la disposicion de expertos del MoE fusionado) y OBLITERATUS Nuclear. Tras estas intervenciones, se aplica un ajuste fino supervisado con datos de Hermes function calling (NousResearch/hermes-function-calling-v1), trazas de razonamiento agente (lambda/hermes-agent-reasoning-traces) y ejemplos preparados de codificacion, terminal, archivos, repositorios y flujos multi-herramienta. El conjunto de entrenamiento consta de 24.399 ejemplos (23.220 de entrenamiento y 1.179 de validacion) con cero errores fatales de parseo. El ajuste se realizo mediante PEFT/LoRA con Unsloth y se fusiono en un checkpoint BF16 final. La preservacion de la vision y del modulo MTP se verifico con 333 y 19 tensores protegidos respectivamente, sin desajustes.

## Capacidades

- Generacion de texto, razonamiento y matematicas heredadas de Qwen3.6, con el comportamiento de razonamiento destilado del linaje Claude 4.7 Opus.
- Function calling y tool use estructurado, entrenado con el dataset Hermes function calling v1, capaz de seguir esquemas JSON y emitir llamadas a herramientas.
- Razonamiento agente multi-paso, con trazas de razonamiento de agente de Hermes que permiten planificar y ejecutar secuencias de acciones.
- Codificacion agente: manejo de terminal, archivos, repositorios y flujos de trabajo multi-herramienta, orientado a tareas de desarrollo y depuracion.
- Vision preservada: el codificador de vision del modelo base se mantiene intacto, permitiendo entrada multimodal (aunque el pipeline declarado es text-generation).
- MTP / NextN preservado: prediccion multi-token para acelerar la generacion.
- Ausencia de rechazos por alineacion de seguridad: el modelo ha sido abliterado y sometido a intervenciones adicionales (Heretic y OBLITERATUS Nuclear) para reducir drasticamente las respuestas de rechazo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens nativos) y, gracias a su entrenamiento en function calling, puede consultar bases de datos de pedidos, sistemas de tickets o APIs de CRM en tiempo real para resolver incidencias sin intervencion humana.
- Generacion de codigo en produccion: con soporte de tool calling y agentic coding, puede integrarse en pipelines de CI/CD para generar parches, ejecutar tests, revisar diffs y proponer correcciones, reduciendo el tiempo de revision manual.
- Agente autonomo de desarrollo: el modelo puede operar sobre un repositorio local, ejecutar comandos de terminal, editar archivos y gestionar multiples herramientas de forma secuencial, lo que lo hace util para tareas de refactorizacion, migracion de dependencias o generacion de documentacion tecnica.
- Asistente de investigacion sin restricciones: al estar abliterado, puede abordar preguntas sobre temas sensibles o controvertidos sin rechazos, util para analisis de seguridad ofensiva, estudios sociologicos o generacion de contenido creativo con tematicas adultas.
- Prototipado rapido de agentes con Ollama: al estar cuantizado en Q4_K_M y empaquetado para Ollama, permite desplegar un agente local en una GPU de consumo (por ejemplo, RTX 4090) en minutos, ideal para experimentar con arquitecturas de agentes sin coste de API.
- Analisis de documentos con vision: aunque el pipeline declarado es text-generation, el codificador de vision preservado permite, con la configuracion adecuada, procesar imagenes junto con texto para tareas como extraccion de informacion de capturas de pantalla o diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. El unico dato cuantitativo mencionado es la reduccion de rechazos en un modelo similar (SC117) con 88% menos rechazos, pero no corresponde a este checkpoint especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el archivo de pesos ocupa aproximadamente 21,7 GB (tamano del repositorio). Dado que es un MoE con solo ~3B de parametros activos, la memoria necesaria para la inferencia es considerablemente menor que la de un modelo denso de 35B, pero los pesos completos deben residir en VRAM o RAM. Se estima un minimo de 24 GB de VRAM para cargar el modelo completo en GPU, o 32 GB de RAM unificada en Mac.
- GPU recomendadas: RTX 4090 (24 GB) o superior, A100 40 GB, H100. En GPUs con menos de 24 GB, se podria intentar con offloading parcial a CPU, pero con penalizacion de latencia.
- Compatibilidad con consumer GPU: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 (con cuantizaciones mas agresivas). En Mac, modelos con 32 GB o mas de RAM unificada pueden ejecutarlo via Ollama.
- Opciones de despliegue: Ollama (formato nativo de esta version), llama.cpp, LM Studio y vLLM (segun la guia de ejecucion local de Qwen 3.6).
- Latencia y throughput: no disponible. Al ser un MoE con ~3B activos, se espera una latencia por token significativamente menor que un modelo denso de 35B, pero no se han publicado mediciones para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-Ollama (este) | ~35B total / ~3B activo | 262K nativo | Apache-2.0 | GGUF Q4_K_M | Abliterado + Heretic + OBLITERATUS + Hermes SFT, vision y MTP preservados |
| mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF | ~35B total / ~3B activo | 262K nativo | Apache-2.0 | GGUF | Destilacion de razonamiento Opus, MTP preservado, sin intervenciones de desalineacion |
| SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF | ~35B total / ~3B activo | 262K nativo | Apache-2.0 | GGUF | Decensurado con Heretic v1.3.0 + MPOA, 88% menos rechazos, MTP preservado |
| Qwen/Qwen3.6-35B-A3B (original) | ~35B total / ~3B activo | 262K nativo | Apache-2.0 | Safetensors | Modelo base sin modificaciones, con alineacion estandar |

La diferencia principal entre este modelo y las alternativas es la combinacion de multiples intervenciones de desalineacion (abliteracion + Heretic + OBLITERATUS Nuclear) junto con un SFT especifico de Hermes para function calling y agentic coding, que no esta presente en los otros GGUF comparados.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo abliterado y sometido a intervenciones de reduccion de rechazos, puede generar contenido ofensivo, ilegal o eticamente problematico sin filtros. No es adecuado para aplicaciones donde se requiera moderacion de contenido.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o codigo. La ausencia de alineacion de seguridad no reduce este riesgo; de hecho, puede amplificarlo al no tener restricciones de veracidad.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, la model card advierte explicitamente que esta derivada no ha sido re-benchmarked en ese limite. La calidad de la generacion en contextos muy largos puede degradarse y el consumo de memoria puede ser elevado.
- Limitaciones de idioma: el modelo esta etiquetado solo para ingles. Aunque Qwen3.6 base tiene capacidades multilingues, el SFT de Hermes y los datos de codificacion estan en ingles, por lo que el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo deriva de Qwen3.6 (Apache-2.0) y de destilaciones de Claude 4.7 Opus. La model card aclara que no se reproduce el modelo propietario de Anthropic, pero el linaje de destilacion podria plantear cuestiones legales en algunos contextos.
- Caveat de produccion: al ser una cuantizacion Q4_K_M, la calidad de la salida puede diferir ligeramente del checkpoint BF16 original. Para aplicaciones criticas, se recomienda validar el comportamiento con el modelo sin cuantizar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-Ollama
- Modelo base (BF16): https://huggingface.co/oktayd/Qwen3.6-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Nuclear-Hermes-Agent-MTP-Vision-FreeToken
- Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Guia de ejecucion local de Qwen 3.6 (Ollama, LM Studio, vLLM): https://www.aimadetools.com/blog/how-to-run-qwen-3-6-locally/
- GGUF similar de mudler (destilacion Opus, sin desalineacion): https://huggingface.co/mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF
- GGUF similar de SC117 (decensurado con Heretic): https://huggingface.co/SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF
