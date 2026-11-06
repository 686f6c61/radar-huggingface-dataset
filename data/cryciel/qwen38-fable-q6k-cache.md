# CryCiel/qwen38-fable-q6k-cache

## Resumen

Qwen3.8 Fable Q6_K es un espejo (mirror) del archivo GGUF Q6_K no-MTP del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF, copiado del lado del servidor por el usuario CryCiel. No se trata de un modelo original ni de un fine-tuning propio: el repositorio contiene exclusivamente el archivo cuantizado sin modificaciones, destinado a la caché de modelos de RunPod y a inferencia de texto. El autor del mirror declara explícitamente que los detalles de la fuente, la licencia y la atribución deben consultarse en el repositorio original.

El modelo subyacente pertenece a la familia Qwen3 (tag `qwen3_8`) y, por el nombre del repositorio de origen, tendría aproximadamente 27.000 millones de parámetros. Los pesos en safetensors del mirror suman 26.895.998.464 parámetros, lo que confirma un tamaño en el entorno de los 27B. El repositorio ocupa 23,6 GB, coherente con una cuantización Q6_K de un modelo de ese tamaño.

La relevancia de esta ficha es limitada y fundamentalmente operativa: sirve para identificar qué contiene exactamente el repositorio, qué se puede esperar de él y qué datos no están disponibles. Al ser un mirror de un modelo derivado y con muy poca documentación propia (0 descargas, 0 likes, sin pipeline declarado, sin licencia ni idiomas indicados), la mayor parte de las especificaciones técnicas solo pueden inferirse del nombre del archivo y del repositorio de origen, y así se indica en cada caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del repo de origen sugiere base Qwen3; sin confirmar en la model card) |
| Parametros totales | 26.895.998.464 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF); el repositorio contiene unicamente esta cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | no disponible (remite a la licencia del modelo original) |
| Formato de pesos | GGUF (archivo Q6_K no-MTP) |

## Arquitectura y entrenamiento

No hay información publicada en este repositorio sobre la arquitectura del modelo subyante. El tag `qwen3_8` y el nombre del repositorio de origen apuntan a una base de la familia Qwen3, y el sufijo "27B" del nombre original sugiere un transformer denso de aproximadamente 27.000 millones de parámetros, consistente con el recuento de safetensors del mirror. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni sobre si hubo RLHF, DPO u otras etapas de alineamiento.

El nombre del repositorio de origen incluye términos como "TURBO", "Fable", "Cold-Fusion", "Heretic", "Uncensored" y "NEO-CODER-MAX", que en la práctica de la comunidad de fine-tunings suelen indicar merges o ajustes orientados a código y a eliminar rechazos de contenido. No obstante, esta ficha no puede confirmar la naturaleza exacta de esas técnicas ni sus parámetros, porque la model card del mirror no las describe y remite al repositorio original. El sufijo "non-MTP" del archivo indica que esta variante no incorpora multi-token prediction, a diferencia de la variante MTP mencionada en el nombre del repositorio de origen.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo.
- Generación de código: el nombre del modelo de origen incluye "NEO-CODER-MAX", lo que sugiere un ajuste orientado a código, aunque no hay documentación que lo confirme.
- Inferencia de texto: el autor declara el mirror como destinado a "text inference" en RunPod.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el archivo puede servirse a través de endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue en RunPod con caché de modelos: el repositorio está pensado explícitamente como mirror para la caché de RunPod, de modo que los nodos pueden cargar el GGUF Q6_K sin descargarlo desde el repositorio original, reduciendo el tiempo de arranque en despliegues repetidos.
- Inferencia de texto autoalojada: al ser un GGUF Q6_K de ~27B, puede servirse con llama.cpp u Ollama en una máquina con suficiente VRAM o con offload parcial a CPU, para tareas de generación de texto general.
- Experimentación con variantes comunitarias: útil para quienes quieren evaluar el comportamiento de un merge/fine-tuning de la familia Qwen3 orientado a código y sin censura, sin depender del repositorio original.
- Generación asistida de código en local: si se confirma la orientación a código del modelo de origen, podría emplearse en entornos de desarrollo con requisitos de privacidad, ejecutando el GGUF en hardware propio.
- Reproducibilidad de despliegues: al ser una copia no modificada, sirve para fijar una versión concreta del archivo y evitar cambios inesperados en el repositorio de origen.
- Pruebas de compatibilidad de endpoints: el tag `endpoints_compatible` permite usarlo para validar pipelines de serving que consumen GGUF a través de endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un Q6_K de ~27B ocupa del orden de 22-24 GB solo en pesos (el repositorio pesa 23,6 GB); con caché KV y overhead de runtime hay que prever bastante más, especialmente con contextos largos.
- GPU recomendadas: para carga completa en VRAM, GPU de 40-80 GB (A100 40/80 GB, H100). En GPU de 24 GB (RTX 4090) no cabe entero y requeriría offload parcial a CPU, con la consiguiente caída de throughput.
- Cabe en consumer GPU: solo con offload parcial; en tarjetas de 24 GB o menos el rendimiento será limitado.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; también serving vía endpoints compatibles según el tag del repositorio. vLLM y TGI no están confirmados para este archivo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CryCiel/qwen38-fable-q6k-cache | ~26,9B | no disponible | no disponible | GGUF Q6_K | Mirror de un derivado Qwen3; sin benchmarks |
| Repositorio de origen (DavidAU/Qwen3.8-27B-TURBO-...-MTP-GGUF) | ~27B | no disponible | no disponible | GGUF (incluye variante MTP) | Fuente del mirror; misma base, con MTP |
| Modelos base de la familia Qwen3 de tamano similar | no disponible | no disponible | no disponible | safetensors/GGUF | Referencia de comparacion; sin datos verificados en esta ficha |

No se dispone de datos de rendimiento verificables para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no documenta licencia; el uso comercial queda sujeto a la licencia del modelo original, que debe consultarse antes de cualquier despliegue en producción.
- El nombre del modelo de origen incluye "Uncensored" y "Heretic", lo que sugiere un ajuste para reducir rechazos de contenido; esto implica mayor riesgo de generar contenido inapropiado o dañino y exige filtros y políticas de uso en producción.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones publicadas en este repositorio.
- Sesgos conocidos: no disponibles; al ser un derivado comunitario sin documentación, no se han auditado sesgos.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto: no disponible; no debe asumirse una ventana concreta sin verificarla en el repositorio de origen.
- Al ser un mirror no modificado, cualquier problema del archivo original (corrupción, cuantización defectuosa) se hereda tal cual.
- El autor del mirror no ofrece soporte ni garantías; la atribución y los detalles técnicos remiten al repositorio original.
- El sufijo "non-MTP" implica que esta variante no incluye multi-token prediction, por lo que el rendimiento puede diferir de la variante MTP del repositorio de origen.

## Enlaces

- Mirror en Hugging Face: https://huggingface.co/CryCiel/qwen38-fable-q6k-cache
- Repositorio de origen: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
