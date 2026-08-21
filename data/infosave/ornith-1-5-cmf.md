# infosave/Ornith-1.5-cmf

## Resumen

El repositorio `infosave/Ornith-1.5-cmf` contiene dos modelos de la familia Ornith-1.5, desarrollada por DeepReinforce (ornith-ai), convertidos al formato CMF (Container for Memory-mapped Files). Se trata de un contenedor de un solo archivo que se lee mediante `cortiq`, un binario escrito en Rust que no depende de ningún framework de aprendizaje automático, con soporte de GPU vía Vulkan/Metal/DX12 y fallback a CPU. Los dos modelos incluidos son el Ornith-1.5-9B, un modelo denso híbrido, y el Ornith-1.5-35B-A3B, un modelo de mezcla de expertos (MoE) con 3 mil millones de parámetros activos por token. Ambos están cuantizados a 4 bits con el esquema `q4tp` (tiled con escalas de escalera) y conservan la cabeza de decodificación especulativa (MTP draft head). La relevancia de este repositorio radica en ofrecer una alternativa de despliegue ligera y sin dependencias de Python para estos modelos, con velocidades de decodificación notables en hardware de gama alta.

La familia Ornith-1.5 se presenta como un avance en el auto-mejoramiento de modelos: el propio modelo propone tareas, genera andamiajes específicos y produce rollouts de soluciones para aprendizaje por refuerzo, cerrando el bucle de auto-mejora. Según la información publicada, estos modelos rinden a la par de Claude Opus 4.8 en razonamiento, código y tareas agénticas, aunque no se proporcionan cifras concretas de benchmarks en la documentación disponible. El repositorio actual solo incluye la torre de texto; la entrada de imágenes no forma parte del contenedor CMF.

## Especificaciones tecnicas

| Parametro | Valor (9B) | Valor (35B-A3B) |
|---|---|---|
| Arquitectura | Híbrida: atención lineal + atención completa cada 4 capas | Híbrida: atención lineal + atención completa cada 4 capas, MoE con 256 expertos, 8 activos por token + experto compartido |
| Parametros totales | 9 mil millones | 35 mil millones |
| Parametros activos | 9 mil millones (denso) | 3 mil millones |
| Longitud de contexto | no disponible | no disponible |
| Tipos de cuantizacion | q4tp (4-bit tiled con ladder scales) | q4tp (4-bit tiled con ladder scales) |
| Idiomas soportados | en, ru | en, ru |
| Licencia | apache-2.0 | apache-2.0 |
| Formato de pesos | CMF (memory-mapped file) | CMF (memory-mapped file) |

## Arquitectura y entrenamiento

Los modelos Ornith-1.5 pertenecen a la familia Qwen3.5 y combinan capas de atención lineal con capas de atención completa intercaladas cada cuatro capas. El modelo de 9B es denso, mientras que el de 35B utiliza una arquitectura de mezcla de expertos (MoE) con 256 expertos, de los cuales 8 se activan por token junto con un experto compartido. Ambos incluyen una cabeza de decodificación especulativa (MTP draft head) que acelera la generación. El proceso de entrenamiento, según la documentación de ornith.ai, se basa en un bucle de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

## Capacidades

- Generación de texto en inglés y ruso.
- Razonamiento complejo y resolución de problemas, con rendimiento comparable a Claude Opus 4.8 según las afirmaciones del desarrollador (sin cifras publicadas).
- Generación de código y soporte para tareas de programación.
- Capacidades agénticas: el modelo puede proponer tareas, generar andamiajes y producir soluciones, lo que lo hace adecuado para flujos de trabajo de auto-mejora y agentes autónomos.
- Decodificación especulativa integrada (MTP draft head) que mejora la velocidad de generación.
- Compatibilidad con la API OpenAI a través del servidor `cortiq serve`, lo que permite integrarse con herramientas existentes que hablan ese protocolo.
- Solo texto: la entrada de imágenes no está soportada en el contenedor CMF.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar código, explicar algoritmos y depurar fragmentos, integrándose en editores o pipelines de CI/CD mediante la API OpenAI.
- Automatización de tareas agénticas: gracias a su capacidad de proponer tareas y generar andamiajes, puede usarse en sistemas que requieren planificación y ejecución de subtareas de forma autónoma.
- Chatbot multilingüe para atención al cliente en inglés y ruso: el modelo gestiona conversaciones multi-turno y puede desplegarse como un servicio ligero con `cortiq serve`.
- Generación de documentación técnica: a partir de código o especificaciones, el modelo puede redactar explicaciones, tutoriales o comentarios en lenguaje natural.
- Análisis de código y revisión de seguridad: el modelo puede identificar patrones problemáticos o sugerir mejoras en repositorios, ejecutándose localmente sin dependencias de Python.
- Prototipado rápido de aplicaciones de procesamiento de lenguaje natural: al ser un único archivo ejecutable con Rust, es adecuado para entornos embebidos o con restricciones de recursos donde no se desea instalar un framework completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del desarrollador afirma que Ornith-1.5 rinde a la par de Claude Opus 4.8 en razonamiento, código y tareas agénticas, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.). En cuanto a velocidad de inferencia, la model card del repositorio reporta los siguientes valores medidos con `cortiq bench --core` en una A100 80GB con Vulkan:

| Modelo | Velocidad de decodificación |
|---|---|
| 9B | 73 tok/s |
| 35B-A3B | 65 tok/s (el primer token incurre en una carga de expertos de ~10 s) |

Se indica además que en una RTX 5090 las velocidades serían mayores, aunque no se dan cifras exactas.

## Requisitos de hardware

- Tamaño de archivo: 4.37 GB para el modelo de 9B y 17.4 GB para el de 35B-A3B, por lo que caben en GPUs de consumo con 8 GB y 24 GB de VRAM respectivamente (por ejemplo, RTX 3060 para el 9B y RTX 4090 para el 35B).
- GPU recomendadas: A100 80GB para el rendimiento máximo reportado; también funciona en GPUs consumer con Vulkan/Metal/DX12 (RTX 5090, RTX 4090, etc.).
- Opciones de despliegue: `cortiq` (binario Rust) con soporte de GPU vía Vulkan/Metal/DX12 y fallback a CPU. También se puede usar `cortiq serve` para exponer una API compatible con OpenAI.
- Latencia: el primer token del modelo 35B tarda ~10 s en cargar los expertos; la decodificación en estado estacionario es de 65-73 tok/s en A100.
- No requiere Python ni frameworks de ML; el binario `cortiq` se instala con `cargo install cortiq-cli`.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoría. La familia Ornith-1.5 incluye además un modelo de 397B parámetros (no incluido en este repositorio) que, según el desarrollador, también rinde a la par de Claude Opus 4.8. Dentro de este repositorio, la comparación entre el 9B y el 35B-A3B muestra una diferencia de velocidad pequeña (73 vs 65 tok/s) a pesar de la gran diferencia de parámetros totales, gracias a la arquitectura MoE con solo 3B activos. No se dispone de datos de otros modelos comparables (por ejemplo, Qwen3 o Llama 3.1) en la información proporcionada.

## Limitaciones y advertencias

- El contenedor CMF solo incluye la torre de texto; la entrada de imágenes no está soportada, a pesar de que los modelos originales son vision-language.
- El primer token del modelo 35B-A3B tarda aproximadamente 10 segundos en cargar los expertos, lo que puede ser inaceptable en aplicaciones de baja latencia.
- No se han publicado resultados de benchmarks independientes; las afirmaciones de rendimiento provienen del desarrollador y deben verificarse.
- La licencia es Apache-2.0, que permite uso comercial, pero se recomienda revisar los términos de la licencia de los modelos base (ornith-ai) por si hubiera restricciones adicionales.
- Los idiomas soportados son solo inglés y ruso; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un formato propietario (CMF) y un runtime específico (cortiq), la portabilidad a otros ecosistemas (por ejemplo, vLLM o llama.cpp) no está disponible; solo se puede ejecutar con `cortiq`.
- No se dispone de información sobre sesgos o riesgos de alucinación específicos de este modelo; se recomienda evaluar en el dominio de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infosave/Ornith-1.5-cmf
- Colección Ornith-1.5 en HuggingFace: https://huggingface.co/collections/ornith-ai/ornith-15
- Sitio oficial de Ornith AI: https://ornith.ai/
- Página de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio CMF en GitHub: https://github.com/infosave2007/cmf
- Artículo de OfficeChai sobre el lanzamiento: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
- Artículo de ByteIota: https://byteiota.com/ornith-15-self-improving-open-source-agentic-model/
