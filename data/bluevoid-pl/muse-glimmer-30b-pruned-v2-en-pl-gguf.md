# bluevoid-pl/Muse-Glimmer-30B-pruned-V2-en-pl-GGUF

## Resumen

`bluevoid-pl/Muse-Glimmer-30B-pruned-V2-en-pl-GGUF` es una cuantización GGUF podada del modelo Muse-Glimmer-30B, publicada por el usuario comunitario bluevoid-pl. No se trata de un modelo original, sino de una derivación del checkpoint `meta-models/Muse-Glimmer-30B` de Meta Superintelligence Lab, un modelo causal de 30.000 millones de parámetros con un codificador de percepción dedicado, diseñado para tareas agénticas autónomas en hardware de consumo. El autor declara una reducción de tamano de aproximadamente el 25 % respecto al GGUF sin podar, a costa de eliminar todos los caracteres que no sean ingleses o polacos.

El interés práctico de esta ficha es doble. Por un lado, documenta el modelo base: un LM causal de 30B orientado a agentes, con soporte de tool calling, razonamiento multi-paso, recuperación de fallos y entrada multimodal intercalada texto-imagen, destilado de Muse Spark y entrenado con datos de más de 100 idiomas. Por otro, documenta las particularidades de este GGUF podado, que solo admite caracteres de `en` y `pl`, elimina físicamente los emojis y presenta advertencias explícitas de estabilidad por parte del autor.

La relevancia es acotada: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, el tamano reportado es de 0.0 GB (probablemente un artefacto del momento de creación) y el soporte en llama.cpp y Ollama es parcial. Para un desarrollador en Espana, este GGUF concreto no es adecuado para producción en castellano, ya que el podado elimina los caracteres propios del español.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM causal (transformer) con codificador de percepción dedicado para entrada multimodal; detalles internos de capas y atención no disponibles |
| Parametros totales | 30 000 millones (30B) en el modelo base |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF podado (niveles concretos de cuantización no especificados); el podado reduce el tamano ~25 % |
| Idiomas soportados | Este GGUF: `en` y `pl` únicamente (solo caracteres de esos alfabetos). Modelo base: más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio etiquetado también con `transformers`) |

## Arquitectura y entrenamiento

El modelo base es un LM causal de 30B parámetros con un codificador de percepción separado que permite aceptar texto e imágenes intercalados. Meta lo presenta como destilado de Muse Spark y orientado explícitamente a tareas agénticas: razonamiento multi-paso sobre horizontes largos, invocación de funciones con esquemas precisos, diagnóstico y reintento cuando una herramienta falla, y compatibilidad con scaffolds como OpenClaw y Hermes Agent. También incorpora un modo de "esfuerzo controlable" que permite ajustar la profundidad de razonamiento frente a la latencia. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni si se aplicaron fases de RLHF o DPO.

Sobre esta derivación, el autor aplica un podado del vocabulario limitado a caracteres ingleses y polacos, con una reducción de tamano aproximada del 25 %. El proceso elimina emojis y cualquier grafema fuera de esos dos alfabetos, de modo que el modelo es físicamente incapaz de emitirlos, aunque su distribución interna siga "creyendo" que puede. El resultado modifica el tokenizador, lo que provoca que llama.cpp detecte el cambio y pueda colgarse hasta 5 minutos en el primer arranque, además de emitir la advertencia `special_eot_id is not in special_eog_ids - the tokenizer config may be incorrect`. El autor no ofrece ninguna garantía de funcionamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso sostenido en flujos de trabajo largos.
- Tool calling y function calling con esquemas JSON precisos a lo largo de cadenas extendidas de invocaciones.
- Comportamiento agéntico de extremo a extremo: planificación, ejecución y resolución de tareas completas dentro de un scaffold.
- Recuperación de fallos: ante un error de herramienta o un resultado inesperado, diagnostica y reintenta en lugar de detenerse.
- Entrada multimodal intercalada texto-imagen mediante codificador de percepción (capturas de pantalla, gráficos, documentos).
- Escritura y depuración de código en el contexto de tareas tipo SWE-Bench.
- Multilingüismo en el modelo base (más de 100 idiomas); en este GGUF queda restringido a inglés y polaco.
- Esfuerzo de razonamiento controlable para equilibrar calidad y velocidad.
- Compatibilidad con patrones de orquestación tipo OpenClaw y Hermes Agent.
- Capacidad de emisión de emojis eliminada por el podado (limitación, no capacidad).

## Casos de uso

- Agente local de automatización de escritorio: el modelo puede interpretar capturas de pantalla mediante su codificador de percepción y encadenar clics, comandos y verificaciones sin salir del equipo, lo que encaja con el objetivo de Meta de ejecución en hardware de consumo sin nube.
- Automatización de pipelines con tool calling: integrado en un orquestador, invoca funciones con esquemas estrictos y reintenta ante respuestas inesperadas de la API, aprovechando la recuperación de fallos descrita en la model card.
- Resolución de incidencias de código en local: tareas de tipo SWE-Bench (localizar el fallo, parchear, ejecutar tests) ejecutadas en una estación de trabajo con GPU de consumo, sin enviar código a servicios externos.
- Procesamiento de documentos y gráficos en inglés o polaco: extracción de datos de informes, tablas e imágenes combinando texto e imagen en la misma conversación.
- Asistente de investigación con búsqueda web: encadenamiento de consultas y síntesis sobre resultados, evaluable con benchmarks tipo DeepSearch QA según la model card.
- Agente de atención interna en entornos polacos o anglófonos: gestión de conversaciones multi-turno con herramientas de ticketing, siempre que el despliegue se limite a esos dos idiomas.
- Base para experimentación en destilación y podado de vocabulario: útil para investigadores que quieran medir el impacto del recorte de tokenizador en un modelo de 30B, no como modelo de producción en castellano.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card del modelo base menciona que se entrena y evalúa en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, e indica成功 rates "altos" en tareas completas, pero no se aporta ninguna cifra concreta, ni para el modelo original ni para este GGUF podado.

| Benchmark | Resultado |
|---|---|
| DeepSearch QA | No disponible (citado como métrica de evaluación, sin cifras) |
| MCP-Atlas | No disponible (citado como métrica de evaluación, sin cifras) |
| τ3-Bench | No disponible (citado como métrica de evaluación, sin cifras) |
| SWE-Bench | No disponible (citado como métrica de evaluación, sin cifras) |
| MMLU / HumanEval / GSM8K | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 30B parámetros, en FP16 serían ~60 GB; en 8 bits ~30 GB; en 4 bits ~15-17 GB. Con el podado del ~25 % declarado por el autor, un GGUF de 4 bits podría situarse en el entorno de 11-13 GB (estimación propia, no confirmada por el autor; no se publican niveles de cuantización ni tamanos por fichero).
- GPU recomendadas: para FP16, A100 80 GB o H100; para 8 bits, A100 40 GB o RTX 4090 24 GB con margen justo; para 4 bits, RTX 4090, RTX 3090, RTX 4080 o similares con 16-24 GB.
- Cabe en GPU de consumo: sí, en el escenario de 4 bits, que es precisamente el objetivo declarado del podado ("run model on limited VRAM"). No cabe en GPUs de 8-12 GB en ningún formato razonable.
- Opciones de despliegue: llama.cpp (obligatorio compilar versión superior a `b10430`; versiones anteriores fallan al cargar) y Ollama, ambos con soporte parcial. No se documenta soporte para vLLM ni TGI, que no consumen GGUF de forma nativa. El autor recomienda usar interfaz web en lugar de CLI, porque la salida por terminal puede no funcionar en absoluto.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el podado del vocabulario reduce el tamano del modelo y, con ello, la presión de memoria, pero no se aportan medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| bluevoid-pl/Muse-Glimmer-30B-pruned-V2-en-pl-GGUF | 30B | No disponible | en, pl | Apache 2.0 | GGUF podado | 0 descargas, 0 likes |
| bluevoid-pl/Muse-Glimmer-30B-pruned-GGUF | 30B | No disponible | No disponible en la información | Apache 2.0 | GGUF podado | Repositorio previo del mismo autor |
| bluevoid-pl/Muse-Glimmer-30B-GGUF | 30B | No disponible | No disponible | Apache 2.0 | GGUF sin podar | Referenciado en la búsqueda web (~126 GB en 2 partes) |
| meta-models/Muse-Glimmer-30B (original) | 30B | No disponible | Más de 100 idiomas | Apache 2.0 | Pesos originales | Modelo base de referencia |

No se dispone en la información proporcionada de datos verificables sobre modelos competidores de otros fabricantes (por ejemplo, alternativas de 30B orientadas a agentes) que permitan una comparación de rendimiento honesta. Cualquier comparación numérica adicional sería especulativa.

## Limitaciones y advertencias

- El podado elimina todos los caracteres que no sean ingleses o polacos. El modelo no puede generar texto correcto en castellano: acentos, eñes y signos de apertura quedan fuera del vocabulario. Es un GGUF no apto para producción en español.
- El propio autor advierte de que el modelo "might break/die for no reason" y no ofrece garantía alguna de funcionamiento.
- Soporte parcial en llama.cpp y Ollama: la salida por CLI puede no producirse; se recomienda interfaz web. Requiere llama.cpp superior a `b10430`.
- En el primer arranque, la detección del cambio de tokenizador puede provocar un bloqueo de hasta 5 minutos. La advertencia `special_eot_id is not in special_eog_ids` es esperada y no indica un error fatal.
- Los emojis han sido eliminados del vocabulario, pero el modelo conserva la tendencia a intentar emitirlos, lo que puede producir secuencias degeneradas o tokens extraños.
- Riesgo de alucinación: inherente a un LM causal de este tamano; no se han publicado evaluaciones de fidelidad ni tasas de error para esta derivación concreta.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y un tamano de repositorio reportado de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el reporte es incorrecto. Verificar los ficheros antes de cualquier despliegue.
- Licencia Apache 2.0 en el modelo base y en esta derivación, lo que permite uso comercial, pero la licencia no otorga ninguna garantía de aptitud ni de funcionamiento del podado.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo de contexto largo con este artefacto sin medirla empíricamente.
- El comportamiento multimodal depende del codificador de percepción del modelo original; no se especifica si el proceso de podado o la conversión a GGUF preserva esas capacidades.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-pruned-V2-en-pl-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- GGUF podado previo del mismo autor: https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-pruned-GGUF
- GGUF sin podar del mismo autor: https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-GGUF
- Publicación de Meta sobre Muse Glimmer 30B: https://ai.meta.com/research/publications/muse-glimmer-30b-an-on-device-agentic-model/
- Ficha de terceros con el GGUF en dos partes: https://local-ai-zone.github.io/models/muse-glimmer-30b.html
- Registro espejo del repositorio: https://huggingbay.xyz/artifact/hf-model-bluevoid-pl-muse-glimmer-30b-pruned-gguf
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
