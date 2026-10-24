# endless-frontier/Fx-Phys

## Resumen

Fx-Phys es un modelo de lenguaje multimodal de tipo *image-text-to-text* desarrollado por endless-frontier, especializado en razonamiento físico de nivel investigación. Se construye sobre Qwen/Qwen3.6-35B-A3B mediante un post-entrenamiento orientado a reforzar la resolución de problemas de física: análisis de enunciados complejos, conexión entre principios físicos y formulaciones matemáticas, derivaciones de varios pasos y presentación de soluciones rigurosas. El resultado es un modelo de 35.951.822.704 parámetros totales (aproximadamente 35B) con arquitectura de mezcla de expertos y unos 3B de parámetros activos por token.

Su relevancia radica en el salto medido frente a su modelo base en los benchmarks que el autor reporta: PRL-Bench pasa de 26,61 a 37,93, PRL-Bench Verified de 35,45 a 58,00, Frontier Science Research (Physics) de 8,5 a 53,5 y Olympiad (Physics) de 64,8 a 74,0. Además de física, el autor publica resultados en dos benchmarks financieros (Finance Agent v2 y Frontier Finance), lo que sugiere un interés en razonamiento cuantitativo y uso de herramientas en dominios científicos y analíticos.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de HuggingFace. No se han encontrado en la búsqueda web enlaces técnicos adicionales: los resultados obtenidos corresponden a entidades homónimas sin relación con el modelo (empresas de gestión de residuos, material deportivo, capital privado y piscinas), por lo que se descartan como fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (transformer con mezcla de expertos, multimodal image-text-to-text) |
| Parametros totales | 35.951.822.704 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible (el unico peso publicado es BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), cargable con Hugging Face Transformers |

Otros datos tecnicos declarados: 40 capas de transformer, 256 expertos enrutados con 8 seleccionados por token, 1 experto compartido por capa MoE, precision de pesos BF16 y tamano del repositorio de 71,9 GB.

## Arquitectura y entrenamiento

Fx-Phys hereda la arquitectura del modelo base Qwen3.6-35B-A3B: un transformer de 40 capas con capas de mezcla de expertos dispersa, 256 expertos enrutados de los que se activan 8 por token y un experto compartido en cada capa MoE. Con 35B parámetros totales y unos 3B activos por token, el coste computacional por token se aproxima al de un modelo denso de 3B, mientras que la capacidad efectiva de parámetros se mantiene en el rango de 35B. El modelo es multimodal (pipeline `image-text-to-text`), de modo que procesa entradas de imagen y texto de forma conjunta. El contexto nativo declarado es de 262.144 tokens, y los pesos se distribuyen en BF16.

El autor no detalla la composición del dataset de post-entrenamiento, el número de tokens utilizados ni si se emplearon técnicas concretas de RLHF, DPO o aprendizaje por refuerzo con verificación. La model card indica únicamente que el modelo fue "post-entrenado para reforzar sus capacidades en tareas de física exigentes" y que se reportan además resultados en dos benchmarks financieros para ofrecer una visión más amplia de sus capacidades. Tampoco se documentan innovaciones de decodificación (por ejemplo, decodificación especulativa) ni mecanismos de atención alternativos. La model card advierte expresamente que las comparaciones son "resultados reportados, no una reevaluación controlada bajo ajustes idénticos", y que la reproducibilidad exacta requiere las versiones concretas de los benchmarks, los prompts, los ajustes de decodificación y, cuando proceda, los entornos de herramientas.

## Capacidades

- Razonamiento físico de nivel investigación: análisis de problemas complejos, conexión entre principios físicos y formulación matemática, y derivaciones de varios pasos.
- Generación de soluciones técnicas extensas con explicación del procedimiento, orientadas a resultados verificables.
- Procesamiento multimodal de imagen y texto: el pipeline declarado es `image-text-to-text`, lo que permite interpretar diagramas, gráficos y figuras junto con el enunciado textual.
- Razonamiento científico general y resolución de problemas tipo olimpiada (evaluado en Frontier Science Olympiad, rama de física).
- Capacidades de finanzas cuantitativas y uso de herramientas en contextos analíticos, evaluadas en Finance Agent v2 y Frontier Finance.
- Soporte de *tool calling* / *function calling*: los ejemplos de despliegue incluyen `--tool-call-parser qwen3_coder` en vLLM, que habilita el análisis automático de llamadas a herramientas. La ejecución real de las herramientas requiere un arnés de agente externo; el servidor no ejecuta herramientas por sí mismo.
- Modo de razonamiento explícito: los ejemplos oficiales emplean `--reasoning-parser qwen3`, lo que implica la existencia de un canal de razonamiento separado en la salida.
- Conversación multi-turno con ventanas de hasta 262.144 tokens.
- Capacidades multilingües limitadas al inglés según los metadatos de idioma del repositorio.

## Casos de uso

- **Resolución asistida de problemas de física de nivel universitario y de posgrado**: el modelo puede recibir el enunciado y desarrollar la derivación paso a paso, justificando cada aproximación y comprobando dimensiones. Es adecuado por su especialización declarada y por el salto medido en PRL-Bench (26,61 a 37,93) y PRL-Bench Verified (35,45 a 58,00) frente al modelo base.
- **Preparación de material para olimpíadas de física**: generación de problemas resueltos y de soluciones alternativas con verificación de consistencia, apoyándose en la mejora de 64,8 a 74,0 en Frontier Science Olympiad (Physics).
- **Análisis de figuras y diagramas científicos**: al ser un modelo `image-text-to-text`, puede procesar gráficas, esquemas de circuitos o diagramas de cuerpo libre junto con el texto y razonar sobre la información visual representada.
- **Revisión técnica de manuscritos y preprints**: comprobación de consistencia dimensional, detección de pasos intermedios no justificados y propuesta de reformulaciones, aprovechando la ventana de 262.144 tokens para procesar documentos completos con apéndices y referencias.
- **Agente de investigación con herramientas externas**: integrado en un arnés de agente mediante vLLM o SGLang, el modelo puede emitir llamadas a calculadoras simbólicas, motores de álgebra computacional o APIs de datos, e iterar sobre los resultados. La model card confirma el soporte de *parsing* de tool calls con el parser `qwen3_coder`.
- **Automatización de análisis financiero con agentes**: los resultados reportados en Finance Agent v2 (0,868) y Frontier Finance (0,518) lo sitúan por delante del modelo base (0,794 y 0,376) en tareas de agente financiero, lo que permite usarlo en flujos de extracción de datos, cálculo de métricas y generación de informes estructurados.
- **Evaluación interna de pipelines de razonamiento científico**: sirve como referencia de 35B con contexto largo para comparar estrategias de prompting, decodificación o integración de herramientas en un mismo entorno de servicio (SGLang o vLLM con `--reasoning-parser qwen3`).

## Benchmarks y rendimiento

Los datos provienen de la figura de resultados de la model card. Las puntuaciones de física conservan la escala 0-100 y las de finanzas la escala 0-1. La negrita marca el mejor valor entre los modelos de clase 35B evaluados, no el mejor valor global.

Física:

| Modelo | PRL-Bench (original) | PRL-Bench Verified | Frontier Science - Research (Physics) | Frontier Science - Olympiad (Physics) |
| :---- | -----------: | -----------: | -----------------------------------: | -----------------------------------: |
| **Modelos de mas de 35B o cerrados** | | | | |
| DeepSeek-V4-Pro-Preview | 30,90 | 48,31 | 34,5 | 72,8 |
| DeepSeek-V4.1-Flash | 35,53 | 67,55 | 61,5 | 80,0 |
| GLM-5.3 | 44,56 | 68,99 | 54,0 | 79,6 |
| GPT-5.5 | 45,74 | 67,65 | 56,8 | 72,0 |
| GLM-5.2 | 46,43 | -- | 47,5 | 77,6 |
| Qwen3.8-Flash | 52,60 | 64,74 | 61,0 | 75,6 |
| GPT-6-Astra | -- | 70,05 | -- | -- |
| **Modelos de clase 35B** | | | | |
| Apodex-mini-1.0 | 13,44 | 19,96 | 19,0 | 70,0 |
| Nex-N2-mini | 24,78 | 33,84 | 30,0 | 64,0 |
| Qwen3.6-35B-A3B | 26,61 | 35,45 | 8,5 | 64,8 |
| **Fx-Phys** | **37,93** | **58,00** | **53,5** | **74,0** |

Finanzas:

| Modelo | Finance Agent v2 | Frontier Finance |
| :---- | ---------------: | ---------------: |
| **Modelos de mas de 35B o cerrados** | | |
| DeepSeek-V4-Pro-Preview | 0,842 | 0,510 |
| DeepSeek-V4.1-Flash | 0,924 | 0,610 |
| GLM-5.2 | 0,928 | 0,498 |
| Qwen3.8-Flash | 0,933 | 0,603 |
| **Modelos de clase 35B** | | |
| Apodex-mini-1.0 | 0,827 | 0,430 |
| Nex-N2-mini | 0,758 | 0,474 |
| Qwen3.6-35B-A3B | 0,794 | 0,376 |
| **Fx-Phys** | **0,868** | **0,518** |

Según el autor, Fx-Phys obtiene el mejor resultado entre los modelos de clase 35B evaluados en los seis benchmarks reportados y supera a DeepSeek-V4-Pro-Preview en los seis. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas en la información disponible.

## Requisitos de hardware

- **Peso de los pesos**: 71,9 GB en BF16, coherente con 35,95B parámetros a 2 bytes por parámetro.
- **VRAM estimada para inferencia**: en BF16, los pesos por sí solos superan los 71 GB, por lo que se necesita al menos una GPU de 80 GB para un contexto muy reducido; con contexto largo el *KV cache* obliga a paralelismo tensorial. Los ejemplos oficiales de la model card usan `--tp-size 8` / `--tensor-parallel-size 8`, es decir, 8 GPUs, y recomiendan reducir la longitud de contexto si la memoria de GPU es limitada. No se publica el desglose de memoria por componente.
- **GPU recomendadas**: H100 80 GB, H200 y A100 80 GB en configuraciones de 8 unidades para servir el contexto nativo de 262.144 tokens. Para contextos recortados puede bastar un número menor de GPUs de 80 GB, pero no se documenta el mínimo exacto.
- **GPU de consumo**: el modelo no cabe en BF16 en ninguna GPU de consumo (la mayor del segmento, con 32-48 GB, es insuficiente). No se han publicado cuantizaciones de 4 u 8 bits; una versión de 4 bits rondaría los 20-22 GB teóricos y podría encajar en una RTX 4090 de 24 GB, pero se trataría de una cuantización generada por el usuario y requiere que la arquitectura `Qwen3_5MoeForConditionalGeneration` esté soportada por la herramienta correspondiente, algo no confirmado.
- **Opciones de despliegue**: SGLang (`sglang.launch_server`, con `--reasoning-parser qwen3`), vLLM (`vllm serve`, con `--reasoning-parser qwen3` y, para tool calling, `--enable-auto-tool-choice --tool-call-parser qwen3_coder`) y Hugging Face Transformers (`AutoProcessor` + `Qwen3_5MoeForConditionalGeneration`). Ambos servidores exponen una API compatible en `/v1`. No se confirma soporte de llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | PRL-Bench Verified | Olympiad (Physics) | Licencia | Disponibilidad |
| :---- | :---- | :---- | :---- | ---: | ---: | :---- | :---- |
| Fx-Phys | 35,95B | ~3B | 262.144 | 58,00 | 74,0 | Apache 2.0 | HuggingFace (endless-frontier/Fx-Phys) |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible en la informacion | 35,45 | 64,8 | no disponible en la informacion | HuggingFace (Qwen/Qwen3.6-35B-A3B) |
| Nex-N2-mini | no disponible | no disponible | no disponible | 33,84 | 64,0 | no disponible en la informacion | no disponible en la informacion |
| Apodex-mini-1.0 | no disponible | no disponible | no disponible | 19,96 | 70,0 | no disponible en la informacion | no disponible en la informacion |

Frente a modelos de mayor tamano o cerrados, el autor sitúa a Fx-Phys por debajo en PRL-Bench Verified de GLM-5.3 (68,99), DeepSeek-V4.1-Flash (67,55), GPT-5.5 (67,65), GPT-6-Astra (70,05) y Qwen3.8-Flash (64,74), y por debajo en Olympiad (Physics) de DeepSeek-V4.1-Flash (80,0) y GLM-5.3 (79,6). En cambio, supera a DeepSeek-V4-Pro-Preview en las seis métricas reportadas.

## Limitaciones y advertencias

- **Idioma**: los metadatos declaran únicamente inglés. El rendimiento en castellano no está evaluado y no puede asumirse.
- **Benchmarks autoinformados**: las cifras provienen de la figura de resultados del autor y no de una reevaluación independiente. La propia model card advierte de que no se trata de una evaluación controlada con ajustes idénticos para todos los modelos.
- **Riesgo de alucinación en derivaciones**: en problemas de física y matemáticas, un modelo puede producir pasos formalmente plausibles pero incorrectos. Se recomienda verificación simbólica o numérica externa antes de dar por válida una solución.
- **Sesgos**: no se documenta ninguna evaluación de sesgos, toxicidad ni comportamiento en dominios sensibles.
- **Soporte de cuantización**: no hay pesos cuantizados publicados, lo que limita el despliegue en hardware modesto sin trabajo adicional de conversión.
- **Madurez del repositorio**: 0 descargas y 0 *likes* en el momento de la consulta, con creación y última actualización el 24 de octubre de 2026 (apenas 44 minutos entre ambas). No existe validación de la comunidad ni informes independientes de uso.
- **Dependencia de la arquitectura base**: requiere versiones de Transformers, SGLang o vLLM que soporten `Qwen3_5MoeForConditionalGeneration`; versiones anteriores fallarán al cargar el modelo.
- **Tool calling**: el servidor solo analiza y formatea las llamadas; la ejecución de herramientas exige un arnés de agente externo. Sin él, las respuestas que invoquen herramientas no tendrán efecto.
- **Contexto largo**: el contexto nativo de 262.144 tokens es costoso en memoria. Reducirlo cambia el comportamiento en tareas que dependen de documentos extensos, y no se publican evaluaciones específicas de rendimiento por longitud de contexto.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base Qwen, ya que la model card no detalla posibles restricciones heredadas.
- **Advertencia sobre contenido de la model card**: parte del texto del repositorio está truncado (la sección de Transformers queda incompleta), por lo que pueden faltar detalles de uso no recogidos aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/endless-frontier/Fx-Phys
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Figura de resultados citada en la model card: https://huggingface.co/endless-frontier/Fx-Phys/resolve/main/assets/Fx-Phys.png
- Licencia del repositorio: https://huggingface.co/endless-frontier/Fx-Phys/blob/main/LICENSE

No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web realizada. Los resultados obtenidos corresponden a entidades homónimas sin relación con el modelo.
