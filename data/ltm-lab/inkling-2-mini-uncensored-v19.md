# LTM-Lab/Inkling-2-Mini-Uncensored-V19

## Resumen
Inkling-2-Mini-Uncensored-V19 es un modelo multimodal de texto e imagen desarrollado por LTM-Lab como un ajuste fino del checkpoint V18, que a su vez deriva del backbone Inkling 2 Mini de Thinking Machines Lab, pasado por una ablación direccional de OpenUncensored. Su rasgo diferencial no es el backbone, sino el banco de memoria local persistente que se entrena sobre él: permite guardar eventos compuestos por texto e imágenes con sus revisiones, cerrar el banco y recuperar después la evidencia original de forma dirigida.

El modelo combina una arquitectura de mezcla de expertos (MoE) con mecanismos de transformer recurrente y memoria persistente, sumando 26.391.585.970 parámetros totales. La implementación V19 añade un escaneo con compuertas de 64 dimensiones que lee el texto de cada evento en orden y añade un residuo aprendido a su clave de búsqueda, lo que permite distinguir eventos con las mismas palabras en distinto orden. El checkpoint incluye el backbone cuantizado en NVFP4/MXFP8, la cabeza MTP de borrador y la implementación Python de la memoria.

Es relevante para investigación porque aborda un problema poco cubierto en modelos abiertos: la memoria episódica verificable con procedencia. El modelo puede indicar de qué evento proviene una respuesta y si realmente recibió sus características visuales, algo útil para auditoría y para pipelines de agentes que necesitan trazabilidad. La licencia Apache 2.0 y el soporte de tooling estándar de Transformers facilitan su experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con mezcla de expertos (MoE), multimodal (texto e imagen) y banco de memoria persistente local |
| Parametros totales | 26.391.585.970 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de expertos empaquetados en NVFP4 y MXFP8; el ejemplo de uso emplea cómputo en BF16 con conversión en tiempo de ejecución |
| Idiomas soportados | en, zh (el currículo de entrenamiento incluye además pasajes en japonés y coreano, pero la generación en esas lenguas queda por evaluar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado `custom_code`) |

## Arquitectura y entrenamiento
El backbone es un transformer recurrente con mezcla de expertos y capacidad multimodal, cuyo diseño original proviene de Thinking Machines Lab. Sobre él, LTM-Lab entrena un lector de memoria fundamentado (grounded memory reader). En V19, el banco de memoria se organiza por ramas de conversación: cada rama mantiene un estado de trabajo de cuatro matrices FP32 de 32 × 32 (16 KiB en total) que se actualiza con los eventos confirmados y sirve para clasificar candidatos en consultas posteriores. El texto original y los bytes de imagen permanecen en un almacén de eventos respaldado por disco, de modo que el banco puede crecer según la capacidad de almacenamiento. El lector admite búsquedas ancladas a revisión, relaciones dirigidas con testigos de origen y recuperación visual: un ID exacto puede solicitar su imagen original, y la recuperación semántica de imagen selecciona candidatos y puede suministrar sus imágenes en un segundo prefill. La profundidad de bucle por defecto es de 3 pasadas, con un rango aceptado de 1 a 10 por generación.

El entrenamiento de V19 se organizó en cuatro fases de enrutamiento con el backbone y el lector heredado congelados: claves de evento sensibles al orden en texto (700 pasos, 49.280 parámetros), actualizaciones y consultas de memoria de trabajo en texto (1.200 pasos, 132.100 parámetros), claves de evento sensibles al orden en imagen/texto (4.000 pasos, 49.280 parámetros) y actualizaciones y consultas de memoria de trabajo en imagen/texto (4.000 pasos, 132.100 parámetros), esta última continuando desde el checkpoint de orden anterior. El currículo de texto usó pasajes bíblicos paralelos en inglés, chino tradicional, chino simplificado, japonés y coreano, junto con historiales multilingües de sitios y libros de códigos con reversiones cronológicas. El currículo visual emparejó imágenes de VisualWebInstruct con recortes e historiales construidos. El shard de memoria contiene 2.939.530 parámetros FP32 en 25 tensores, de los cuales 2.758.150 se heredan de V18.

## Capacidades
- Generación de texto conversacional y razonamiento multimodal sobre entradas de texto e imagen.
- Memoria persistente local: guardar eventos con texto e imágenes, cerrar el banco y recuperarlos después por ID exacto o por búsqueda semántica.
- Búsqueda anclada a revisión: recuperar el estado de un evento en una revisión concreta mediante instantáneas del almacén.
- Relaciones dirigidas entre eventos con testigos de origen, lo que permite rastrear la procedencia de una respuesta.
- Recuperación visual: suministrar imágenes originales archivadas en un segundo prefill tras una selección semántica de candidatos.
- Indicación explícita de si el modelo recibió las características visuales de un evento, útil para verificar respuestas.
- Control de profundidad de razonamiento mediante `loop_num_passes` (1 a 10 pasadas) y `reasoning_effort`.
- Soporte de decodificación especulativa mediante la cabeza MTP de borrador incluida en el checkpoint.
- Capacidades multilingües limitadas a inglés y chino en la generación declarada.

## Casos de uso
- Auditoría de documentación técnica: guardar diagramas de arquitectura con su nota de revisión en el banco y consultar después una versión concreta para verificar un cambio, aprovechando las búsquedas ancladas a revisión y la recuperación de la imagen original.
- Asistentes de soporte con historial verificable: registrar cada interacción como un evento con su texto e imágenes adjuntas, de modo que el modelo pueda citar el evento de origen al responder y señalar si dispone de la evidencia visual correspondiente.
- Investigación sobre memoria episódica en agentes: usar el banco local y el estado de trabajo de 16 KiB por rama para estudiar cómo afecta la persistencia de memoria a la coherencia en conversaciones largas sin depender de ventanas de contexto extensas.
- Trazabilidad en pipelines de revisión de imágenes: archivar capturas o recortes con identificadores de ocurrencia y recuperarlos por ID exacto cuando se necesite justificar una decisión automatizada sobre una imagen.
- Prototipado de sistemas RAG con evidencia visual: sustituir o complementar un índice vectorial externo por el almacén de eventos del modelo, que conserva los bytes originales y permite recuperaciones semánticas seguidas de un segundo prefill con las imágenes.
- Análisis de corpus multilingües inglés-chino: emplear el modelo para tareas de comparación y recuperación entre textos paralelos en ambos idiomas, dado el currículo de entrenamiento con pasajes alineados.
- Evaluación de robustez en entornos sin censura: el ajuste uncensored permite estudiar el comportamiento del modelo en dominios donde los filtros de seguridad de los modelos base interfieren con la investigación, siempre bajo la responsabilidad del desplegador.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad de generación; de hecho, indica explícitamente que la calidad de generación en las cinco formas escritas del currículo queda por evaluar.

## Requisitos de hardware
- El repositorio ocupa 20,2 GB en safetensors con pesos de expertos empaquetados en NVFP4/MXFP8; el ejemplo oficial usa BF16, por lo que la conversión en tiempo de ejecución requiere memoria adicional a la de los ficheros empaquetados.
- Con 26.391 millones de parámetros totales y cómputo en BF16, se estima un requisito de VRAM en el entorno de 50-55 GB solo para pesos, más cachés de generación y estados de memoria; no hay cifras oficiales publicadas.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`. Una RTX 4090 de 24 GB no es suficiente para BF16 sin cuantización adicional.
- El uso de los pesos NVFP4/MXFP8 empaquetados puede reducir el requisito en hardware con soporte nativo para esos formatos, pero la model card no documenta el ahorro efectivo ni las GPU compatibles.
- Despliegue: la vía documentada es Transformers con una revisión concreta del repositorio upstream (commit `be48e7a0b63d2ff22ce1ebccbccbd0374c1592ef`), junto con Accelerate, Pillow y Safetensors; se requiere `trust_remote_code=True` por el código personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno verificado: Python 3.12, PyTorch 2.10.0 y Transformers 5.24.0.dev0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Memoria persistente | Licencia | Idiomas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-V19 | 26,4 B | no disponible | Sí, banco local con revisiones y recuperación visual | Apache 2.0 | en, zh |
| LTM-Lab/Inkling-2-Mini-Uncensored-V18 (modelo base) | no disponible | no disponible | Sí, lector de memoria fundamentado; sin el escaneo de claves sensible al orden de V19 | Apache 2.0 (según repositorio base) | en, zh |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | No documentada | no disponible | no disponible |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | No documentada | no disponible | no disponible |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada; los únicos modelos comparables documentados son los antecesores directos de la misma línea.

## Limitaciones y advertencias
- La calidad de generación en japonés y coreano, pese a formar parte del currículo de enrutamiento, no ha sido evaluada; no debe asumirse un rendimiento multilingüe más allá de inglés y chino.
- La precisión de la búsqueda semántica depende del recuperador aprendido y de la evidencia disponible en la revisión solicitada; no hay métricas publicadas de recall o precisión.
- El ajuste uncensored elimina filtros de seguridad del modelo base; en producción implica riesgos de contenido inapropiado o dañino que el desplegador debe mitigar por su cuenta.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad, y la capacidad de citar eventos de origen no garantiza que la respuesta sea correcta.
- El modelo requiere `trust_remote_code=True` y una revisión concreta de Transformers en desarrollo (5.24.0.dev0), lo que introduce riesgo de incompatibilidad con versiones estables y de ejecución de código no auditado.
- El estado de trabajo por rama es de solo 16 KiB (cuatro matrices 32 × 32), lo que limita la cantidad de información que puede influir en la clasificación de candidatos sin consultar el almacén completo.
- El banco de memoria crece según el disco disponible, pero no se documentan mecanismos de compactación, borrado seguro ni cifrado del almacén.
- No hay soporte documentado para motores de inferencia de alto rendimiento como vLLM o TGI, lo que dificulta despliegues con requisitos de throughput.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Inkling-2-Mini-Uncensored-V19
- Modelo base V18: https://huggingface.co/LTM-Lab/Inkling-2-Mini-Uncensored-V18
- Derivado de OpenUncensored: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Backbone de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión de Transformers verificada: https://github.com/huggingface/transformers/commit/be48e7a0b63d2ff22ce1ebccbccbd0374c1592ef
