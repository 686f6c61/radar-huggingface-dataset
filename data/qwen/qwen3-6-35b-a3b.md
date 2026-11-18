# Qwen/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es la primera variante de pesos abiertos de la familia Qwen3.6, publicada por el equipo Qwen de Alibaba en abril de 2026 como evolucion del Qwen3.5 lanzado en febrero del mismo ano. Se trata de un modelo causal con codificador de vision, orientado a tareas de razonamiento, generacion de codigo y flujos de trabajo agenticos, y entrenado con especial enfasis en la experiencia de desarrollo de software real: razonamiento a nivel de repositorio, flujos de frontend y llamadas a herramientas. Su formato es una mezcla de expertos (MoE) con 35.951.822.704 parametros totales y aproximadamente 3.000 millones activos por token, lo que permite un coste de inferencia muy inferior al de un modelo denso de tamano equivalente.

La arquitectura combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention) en un patron hibrido, lo que le permite sostener una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. La licencia Apache 2.0 y la compatibilidad con Transformers, vLLM, SGLang y KTransformers lo convierten en una opcion atractiva para despliegues en produccion sin restricciones de uso comercial.

Su relevancia actual radica en dos innovaciones concretas: la mejora del razonamiento agentico en entornos de repositorio y la denominada "Thinking Preservation", una opcion que conserva el contexto de razonamiento de mensajes historicos para reducir la sobrecarga en iteraciones de desarrollo. Con cerca de 4 millones de descargas y mas de 3.100 likes en Hugging Face, se posiciona como una de las referencias abiertas para tareas de codificacion asistida y agentes autonomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet (atencion lineal) y Gated Attention, Mixture of Experts, y codificador de vision |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

El modelo sigue un diseno de transformer hibrido con 40 capas organizadas en un patron de 10 bloques, cada uno compuesto por tres secuencias de Gated DeltaNet seguido de una capa de Gated Attention, todas ellas intercaladas con capas de mezcla de expertos. La Gated DeltaNet emplea 32 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128, mientras que la Gated Attention usa 16 cabezas para Q y 2 para KV con dimension de cabeza 256 y dimension de embedding rotatorio de 64. La dimension oculta es de 2048 y el embedding de tokens (con padding) es de 248.320. El MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados mas 1 compartido, con dimension intermedia de experto de 512.

El modelo fue entrenado en dos fases, preentrenamiento y postentrenamiento, e incorpora entrenamiento con multiples pasos de MTP (multi-token prediction), lo que habilita decodificacion especulativa y acelera la generacion. Incluye un codificador de vision que lo capacita para tareas de imagen-texto. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La model card menciona que la version se construyo a partir del feedback directo de la comunidad, priorizando estabilidad y utilidad practica, y destaca la preservacion del razonamiento (Thinking Preservation) como una opcion nueva para mantener el contexto de razonamiento entre mensajes historicos.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento (thinking mode) preservable entre turnos.
- Generacion de codigo orientada a flujos de trabajo de frontend y razonamiento a nivel de repositorio, con mejoras especificas en tareas agenticas de programacion.
- Comprension de imagenes y texto (pipeline image-text-to-text) gracias al codificador de vision integrado.
- Soporte de tool calling y function calling, adecuado para agentes que interactuan con APIs y entornos.
- Razonamiento agentico multi-paso y ejecucion de tareas en terminales y entornos de linea de comandos.
- Capacidades multilingues: no se detallan los idiomas soportados en la informacion disponible, aunque el modelo reporta resultados en SWE-bench Multilingual.
- Decodificacion especulativa mediante MTP entrenado con multiples pasos.

## Casos de uso

- Agente de codificacion en repositorios: el modelo puede razonar sobre la estructura completa de un repositorio y resolver issues de forma autonoma, con un 73,4 en SWE-bench Verified, lo que lo hace adecuado para integrarse en pipelines de CI/CD que abren pull requests automaticamente.
- Asistente de desarrollo en IDE: con contexto nativo de 262.144 tokens, puede mantener en memoria varios archivos y el historial de conversacion, y la opcion de Thinking Preservation reduce la latencia en iteraciones sucesivas de refactorizacion.
- Automatizacion de tareas en terminal: su rendimiento en Terminal-Bench 2.0 y el soporte de tool calling permiten construir agentes que ejecutan comandos, interpretan la salida y corrigen errores en bucle.
- Atencion al cliente multimodal: al aceptar entrada de imagen y texto, puede gestionar conversaciones multi-turno donde el usuario adjunta capturas de pantalla o documentos, con contexto largo para historiales extensos.
- Analisis de documentacion tecnica con imagenes: la combinacion de vision y contexto largo permite procesar manuales, diagramas de arquitectura y capturas de pantalla en una sola pasada para generar resumenes o responder preguntas.
- Migracion y traduccion de codigo entre lenguajes: su resultado de 67,2 en SWE-bench Multilingual sugiere capacidad para trabajar con bases de codigo en varios idiomas, util en tareas de modernizacion de sistemas legacy.
- Generacion de interfaces de usuario: las mejoras en flujos de frontend lo hacen adecuado para prototipado rapido de componentes y maquetacion a partir de descripciones o imagenes de referencia.

## Benchmarks y rendimiento

Resultados publicados en la model card para la categoria de agente de codificacion:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks de lenguaje general (MMLU, GSM8K, HumanEval) ni de vision; la model card solo incluye la tabla de agente de codificacion, parcialmente truncada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parametros totales, en precision de 16 bits los pesos ocupan aproximadamente 72 GB, lo que exige multiples GPU o una GPU de gran memoria. En cuantizacion de 8 bits se reduce a unos 36 GB y en 4 bits a unos 18-20 GB, aunque los tipos de cuantizacion oficiales no estan disponibles en la informacion proporcionada.
- GPU recomendadas: para precision completa, H100 80 GB, A100 80 GB o configuraciones multi-GPU. Para cuantizacion 4 bits, una RTX 4090 de 24 GB podria albergar los pesos, aunque el contexto largo y el codificador de vision incrementan los requisitos de memoria KV.
- Cabe en GPU de consumo: si, en cuantizaciones agresivas (4 bits) y con longitudes de contexto moderadas; el contexto nativo de 262.144 tokens requiere planificacion cuidadosa de memoria.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, segun la model card. Tambien aparece como compatible con endpoints (SageMaker, Azure) en los tags de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada; el uso de solo 3B parametros activos y la decodificacion especulativa via MTP deberian reducir el coste por token frente a modelos densos de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B totales / 3B activos | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3.5-35B-A3B | 35B totales / 3B activos | no disponible | 70,0 | no disponible | Pesos abiertos |
| Qwen3.5-27B | 27B densos | no disponible | 75,0 | no disponible | Pesos abiertos |
| Gemma4-31B | 31B | no disponible | 52,0 | no disponible | Pesos abiertos |
| Gemma4-26B-A4B | 26B totales / 4B activos | no disponible | 17,4 | no disponible | Pesos abiertos |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos corpus, pero no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: no se aportan tasas de alucinacion ni evaluaciones de fidelidad; en tareas de codigo y agenticas conviene validar las salidas con tests automatizados antes de aplicarlas en produccion.
- Limitaciones de contexto o idioma: el contexto nativo es amplio (262.144 tokens), pero la extension a 1.010.000 tokens puede degradar la calidad y dispara el consumo de memoria; los idiomas soportados no estan detallados, por lo que el rendimiento fuera de ingles y chino no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar el archivo LICENSE del repositorio para confirmar terminos exactos.
- Caveats para produccion: la model card esta parcialmente truncada en la informacion disponible (faltan resultados de Terminal-Bench 2.0 y posiblemente otras secciones); los tipos de cuantizacion oficiales no se detallan, lo que obliga a validar el comportamiento en cuantizaciones de terceros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai/
- Portal de Qwen: https://qwen.ai/home
- Articulo de Wikipedia sobre Qwen: https://en.wikipedia.org/wiki/Qwen
- Articulo de Wikipedia en frances sobre Qwen: https://fr.wikipedia.org/wiki/Qwen
