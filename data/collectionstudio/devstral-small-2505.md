# CollectionStudio/Devstral-Small-2505

## Resumen

Devstral Small 1.0 es un modelo de lenguaje orientado a tareas de ingeniería de software agéntica, desarrollado conjuntamente por Mistral AI y All Hands AI. Se obtiene por ajuste fino supervisado a partir de Mistral-Small-3.1 y está diseñado específicamente para explorar repositorios de código, editar múltiples archivos y operar como motor de agentes de programación. La ficha aquí descrita corresponde a la réplica publicada por el usuario CollectionStudio bajo el identificador `CollectionStudio/Devstral-Small-2505`, cuyo modelo base declarado es `mistralai/Mistral-Small-3.1-24B-Instruct-2503`.

Se trata de un transformer decoder-only denso de 23.572.403.200 parámetros (unos 23,6 mil millones), con una ventana de contexto de hasta 128.000 tokens y tokenizador Tekken de 131.000 entradas. A diferencia de Mistral-Small-3.1, el codificador de visión fue eliminado durante el ajuste, por lo que Devstral es un modelo estrictamente de texto. Su tamaño compacto permite despliegue local en una única RTX 4090 o en un Mac con 32 GB de memoria unificada, según la model card oficial.

Su relevancia actual radica en el rendimiento declarado en SWE-bench Verified: 46,8 % con el scaffold OpenHands, lo que lo sitúa como el mejor modelo abierto en esa prueba en el momento de su publicación y por delante de modelos mucho mayores como DeepSeek-V3-0324 o Qwen3 232B-A22B cuando se evalúan con el mismo scaffold. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Mistral-Small-3.1; codificador de visión eliminado |
| Parámetros totales | 23.572.403.200 (≈23,6 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128.000 tokens (128k) |
| Tipos de cuantización | No disponibles en la información proporcionada; la model card documenta despliegue con llama.cpp, Ollama y LM Studio, lo que implica formatos GGUF en el ecosistema, pero sin detallar niveles |
| Idiomas soportados | 24 idiomas: en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 94,3 GB); compatible con vLLM, mistral-inference, transformers, llama.cpp, Ollama y LM Studio |
| Tokenizador | Tekken, vocabulario de 131.000 tokens |
| Versión | Devstral Small 1.0 (2505) |
| Repositorio | Réplica de `mistralai/Devstral-Small-2505` publicada por CollectionStudio; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso, sin mezcla de expertos, heredado directamente de la familia Mistral-Small-3.1. El ajuste fino parte de Mistral-Small-3.1 y elimina el codificador de visión del modelo original, de modo que el resultado es un modelo unimodal de texto con la misma ventana de contexto de 128.000 tokens que el modelo base. Las etiquetas de HuggingFace apuntan a `mistralai/Mistral-Small-3.1-24B-Instruct-2503` como modelo base del ajuste, mientras que la model card cita Mistral-Small-3.1 de forma genérica; esta discrepancia entre la variante Base y la Instruct conviene tenerla en cuenta al reproducir el entrenamiento.

El entrenamiento se realiza en colaboración con All Hands AI y está orientado explícitamente a tareas de ingeniería de software con uso de herramientas: exploración de código, edición de varios archivos y ejecución de ciclos agénticos. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon etapas de RLHF o DPO por encima del ajuste supervisado; estos datos figuran como no disponibles. Entre las decisiones técnicas destacables están el tokenizador Tekken de 131.000 entradas y la recomendación de ejecutarlo con el scaffold OpenHands, que es el entorno con el que se reportan los resultados de SWE-bench.

## Capacidades

- Generación de código y razonamiento sobre bases de código completas, con ventana de 128.000 tokens.
- Uso de herramientas (tool calling / function calling) como capacidad central del modelo, no accesoria.
- Comportamiento agéntico multi-paso: explorar el repositorio, localizar el fallo, editar varios archivos y verificar el resultado.
- Edición de archivos múltiples dentro de una misma tarea, con coherencia entre cambios.
- Resolución de incidencias reales de software, medida con SWE-bench Verified.
- Soporte multilingüe declarado en 24 idiomas, incluidos español, inglés, francés, alemán, portugués, italiano, chino, japonés, coreano, ruso, árabe, hindi o vietnamita.
- Modo estrictamente de texto: no procesa imágenes pese a que el modelo base sí era multimodal.
- Integración directa con servidores compatibles con la API de OpenAI (por ejemplo, vLLM con `--tool-call-parser mistral`).

## Casos de uso

- Resolución automática de incidencias en repositorios: el modelo puede recibir un issue, explorar el árbol de ficheros con herramientas y proponer un parche verificable. Es el escenario para el que fue entrenado y el que mide SWE-bench Verified con 46,8 %.
- Agente de programación en local sobre OpenHands: desplegado con vLLM en una o dos GPU, permite trabajar con código propietario sin enviar el repositorio a una API externa, gracias a su licencia Apache 2.0 y a su tamaño de 23,6 B.
- Revisión de pull requests: con 128.000 tokens de contexto puede cargar varios archivos y el historial de cambios en una sola pasada y señalar inconsistencias, código muerto o falta de manejo de errores.
- Refactorizaciones y migraciones multiarchivo: sustitución de librerías obsoletas, actualización de firmas o migración de frameworks requieren editar ficheros relacionados de forma coordinada, tarea en la que el modelo está específicamente ajustado.
- Generación de pruebas a partir del código existente, ejecutando la suite mediante tool calling y corrigiendo los tests que fallan de forma iterativa.
- Asistente de IDE integrado en herramientas compatibles con endpoints OpenAI (Continue, LM Studio, Ollama), para autocompletado, explicación de código y cambios guiados por instrucciones.
- Integración en pipelines de CI/CD: ejecutado como servicio vLLM, puede invocarse desde un job para triaje automático de fallos de test, generación de parches preliminares o etiquetado de incidencias antes de la revisión humana.
- Análisis de documentación técnica y bases de código heredadas en varios idiomas, aprovechando la cobertura multilingüe declarada.

## Benchmarks y rendimiento

| Modelo | Scaffold | SWE-bench Verified (%) |
|---|---|---|
| Devstral | OpenHands | 46,8 |
| Claude 3.5 Haiku | Anthropic Scaffold | 40,6 |
| SWE-smith-LM 32B | SWE-agent Scaffold | 40,2 |
| GPT-4.1-mini | OpenAI Scaffold | 23,6 |

La model card indica que, evaluado bajo el mismo scaffold OpenHands, Devstral supera a modelos bastante mayores como DeepSeek-V3-0324 y Qwen3 232B-A22B, aunque no se aportan las cifras concretas de esos dos modelos en la información disponible. El resto de benchmarks habituales (MMLU, HumanEval, GSM8K) no se publican en la model card ni en la información proporcionada.

## Requisitos de hardware

- Peso de los parámetros: en BF16/FP16 el modelo ocupa aproximadamente 47 GB; en FP8 o INT8, unos 24 GB; en cuantización de 4 bits, entre 12 y 13 GB. Son estimaciones derivadas del número de parámetros, no cifras publicadas por el autor.
- La model card afirma explícitamente que el modelo cabe en una única RTX 4090 (24 GB de VRAM) y en un Mac con 32 GB de memoria unificada. En la RTX 4090 esto implica cuantización y una ventana de contexto efectiva inferior a los 128k completos.
- Para BF16 sin cuantización se recomienda una A100 de 40 o 80 GB, o una H100. El ejemplo oficial de vLLM usa `--tensor-parallel-size 2`, es decir, dos GPU.
- El coste de la caché KV crece linealmente con la longitud de contexto; no se publican cifras oficiales de memoria para el caso de 128.000 tokens.
- Opciones de despliegue documentadas: vLLM (recomendado, con `--tokenizer_mode mistral --config_format mistral --load_format mistral --tool-call-parser mistral --enable-auto-tool-choice`), mistral-inference, transformers, LM Studio, llama.cpp y Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada, ya que dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devstral Small 1.0 | 23,6 B (denso) | 128k | 46,8 % (OpenHands) | Apache 2.0 | Pesos abiertos en HuggingFace |
| SWE-smith-LM 32B | No disponible en la información proporcionada | No disponible | 40,2 % (SWE-agent) | No disponible | No disponible |
| Claude 3.5 Haiku | No disponible | No disponible | 40,6 % (scaffold propio) | Propietaria | Solo API |
| GPT-4.1-mini | No disponible | No disponible | 23,6 % (scaffold propio) | Propietaria | Solo API |
| Qwen3 232B-A22B | 232 B totales, 22 B activos (MoE) | No disponible | Inferior a Devstral bajo OpenHands según la model card, sin cifra | No disponible | No disponible |
| DeepSeek-V3-0324 | No disponible | No disponible | Inferior a Devstral bajo OpenHands según la model card, sin cifra | No disponible | No disponible |

Advertencia metodológica: las puntuaciones de SWE-bench dependen fuertemente del scaffold empleado, por lo que las cifras de esta tabla no son directamente comparables entre filas. Los modelos propietarios se sirven únicamente por API, mientras que Devstral puede ejecutarse en local.

## Limitaciones y advertencias

- La model card y las cifras de rendimiento proceden del fabricante; no hay evaluación independiente recogida en la información disponible.
- Esta ficha corresponde a la réplica `CollectionStudio/Devstral-Small-2505`, con 0 descargas y 0 likes, sin verificación de integridad de los pesos publicada. Para uso en producción es preferible el repositorio oficial `mistralai/Devstral-Small-2505`.
- El repositorio ocupa 94,3 GB, aproximadamente el doble del peso teórico de un modelo de 23,6 B en BF16, lo que sugiere duplicación de pesos o archivos adicionales; conviene revisar el contenido antes de descargarlo.
- Las etiquetas de HuggingFace marcan `inference: false`, aunque la model card describe comandos de inferencia y la librería declarada es vLLM.
- Riesgo de alucinación en código: como cualquier modelo generativo, puede producir APIs inexistentes, firmas incorrectas o parches que compilan pero no resuelven el problema. Se requiere ejecución real de tests antes de aceptar cualquier cambio.
- El codificador de visión fue eliminado, por lo que el modelo no hereda las capacidades multimodales de Mistral-Small-3.1.
- La lista de 24 idiomas indica cobertura declarada, no calidad homogénea; no se publican evaluaciones por idioma y el ajuste está orientado a código en inglés.
- Aunque el contexto sea de 128.000 tokens, el rendimiento efectivo en tareas agénticas largas puede degradarse antes de alcanzar ese límite; no hay datos publicados al respecto.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales, sin cláusulas de gating para este modelo.
- El uso de tool calling requiere un servidor compatible con la API de OpenAI y el parser de herramientas correcto (`--tool-call-parser mistral` en vLLM); sin esa configuración el modelo puede emitir llamadas mal formadas.
- La model card no documenta sesgos, composición del dataset de entrenamiento ni procesos de alineación posteriores, lo que dificulta evaluar riesgos específicos.

## Enlaces

- Réplica en HuggingFace: https://huggingface.co/CollectionStudio/Devstral-Small-2505
- Repositorio oficial de Mistral AI: https://huggingface.co/mistralai/Devstral-Small-2505
- Modelo base citado en la model card: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Modelo base declarado en las etiquetas: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Anuncio de Devstral en el blog de Mistral AI: https://mistral.ai/news/devstral
- All Hands AI: https://www.all-hands.dev/
- Scaffold OpenHands: https://github.com/All-Hands-AI/OpenHands/tree/main
- Documentación de la API de Mistral: https://docs.mistral.ai/getting-started/quickstart/
- vLLM: https://github.com/vllm-project/vllm
- mistral-inference: https://github.com/mistralai/mistral-inference
- Transformers de HuggingFace: https://huggingface.co/docs/transformers
- LM Studio: https://lmstudio.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://github.com/ollama/ollama
