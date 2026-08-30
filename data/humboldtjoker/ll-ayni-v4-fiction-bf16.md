# HumboldtJoker/ll-ayni-v4-fiction-bf16

## Resumen

ll-ayni-v4-fiction-bf16 es un modelo de generación de ficción desarrollado por Liberation Labs, dentro de la línea de modelos "Ayni" basados en la arquitectura Qwen3-30B. Se trata de una iteración intermedia (v4) que fue posteriormente superada por las versiones v5 y v6, y que ha sido subida al repositorio de HuggingFace por HumboldtJoker (Thomas Edrington) con fines de análisis y arqueología de entrenamiento, dentro del proyecto j-space probe.

El modelo está específicamente afinado para la generación de ficción, lo que lo diferencia de los modelos instruct genéricos. Con 30.531.028.992 parámetros en formato bf16, ocupa 61,1 GB en disco. La ficha actual está marcada como "archived", lo que indica que no se recomienda su uso en producción, sino más bien como objeto de estudio para comprender la evolución de la línea Ayni.

La relevancia de este modelo reside en su valor como pieza de arqueología de entrenamiento: permite analizar cómo evolucionó la línea Ayni entre versiones, qué datos de ficción se utilizaron y qué decisiones de alineación se tomaron. No obstante, al estar archivado y superado, cualquier despliegue en producción debería considerar las versiones más recientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (base: Qwen3-30B) |
| Parametros totales | 30.531.028.992 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos completos) |
| Idiomas soportados | no disponible |
| Licencia | other (especificar con el autor) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-30B, que emplea una mezcla de expertos (MoE) con atención tradicional. El proceso de entrenamiento consistió en un fine-tuning sobre la línea Ayni, que a su vez parte del modelo base Qwen3-30B, incorporando datos adicionales orientados a la generación de ficción. La model card indica que se trata de la "v4 fiction iteration", lo que sugiere que hubo iteraciones previas (v1-v3) y posteriores (v5, v6) dentro de la misma familia.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset de ficción, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas particulares más allá del fine-tuning orientado a ficción. Al estar archivado, el modelo no representa el estado del arte de la línea Ayni.

## Capacidades

- Generacion de ficcion: el modelo esta especificamente afinado para producir texto narrativo, incluyendo dialogos, descripciones y desarrollo de personajes.
- Escritura creativa en general: al estar entrenado con datos de ficcion, puede abordar tareas de escritura narrativa, cuentos, novelas y guiones.
- Herencia de Qwen3-30B: al partir de la base Qwen3, puede conservar capacidades generales de razonamiento, generacion de texto y conocimiento del modelo base, aunque no se han publicado evaluaciones especificas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Arqueologia de modelos: el caso de uso principal declarado por el autor es el analisis de la evolucion de la linea Ayni entre versiones, estudiando como cambio el comportamiento del modelo con los datos de ficcion de cada iteracion.
- Investigacion academica sobre fine-tuning de ficcion: permite estudiar que tipo de datos de ficcion se utilizaron y como afectan al estilo de escritura resultante.
- Comparativa de versiones: util para investigadores que quieran comparar el rendimiento de v4 frente a v5 y v6 en tareas de generacion de ficcion.
- Estudio de alineacion: al ser un modelo de Liberation Labs con entrenamiento de alineacion, puede servir para analizar como se implementaron las politicas de seguridad en la generacion de ficcion.
- Generacion de ficcion offline: aunque esta archivado, podria usarse localmente para generar narrativa sin censura si la licencia lo permite, pero no es recomendable frente a versiones posteriores.
- Analisis de sesgos en datos de ficcion: permite examinar que sesgos estan presentes en el corpus de entrenamiento de ficcion utilizado por Liberation Labs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, ni comparaciones con otros modelos de generacion de ficcion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30.531.028.992 parametros en bf16, se requieren aproximadamente 61 GB de VRAM para cargar los pesos completos en memoria. Con cuantizacion a 8 bits, se reduciria a unos 31 GB; con 4 bits, a unos 16 GB.
- GPU recomendadas: para inferencia en bf16 completo, se necesita una GPU con al menos 64 GB de VRAM, como la NVIDIA A100 (80 GB) o H100 (80 GB). Con cuantizacion a 4 bits, una RTX 4090 (24 GB) seria suficiente.
- Si cabe en consumer GPU: solo con cuantizacion agresiva (4 bits) y aun asi en GPUs de gama alta como la RTX 4090 o RTX 3090.
- Opciones de despliegue: al ser un modelo safetensors en bf16, se puede desplegar con vLLM, TGI, llama.cpp (si se convierte a GGUF), o mediante transformers de HuggingFace. No hay soporte directo en Ollama a menos que se convierta manualmente.
- Latencia y throughput estimados: no disponible. Dependera del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| ll-ayni-v4-fiction-bf16 | 30,5B (MoE) | no disponible | other | Archivado |
| Qwen3-30B-A3B-Instruct | 30,5B (MoE, 3B activos) | no disponible | Apache 2.0 | Activo |
| Ayni v5/v6 | no disponible | no disponible | other | Activo (dentro de la linea) |

No se dispone de informacion suficiente sobre modelos comparables de generacion de ficcion del mismo tamano. Los modelos Ayni v5 y v6, al ser las versiones que superan a v4, serian las alternativas naturales, pero no se han publicado sus especificaciones en la informacion disponible.

## Limitaciones y advertencias

- Modelo archivado: fue superado por las versiones v5 y v6 de la linea Ayni, por lo que su uso en produccion no es recomendable.
- Licencia "other": la licencia no esta especificada con claridad. Es imprescindible contactar con el autor o con Liberation Labs para conocer los terminos exactos de uso, especialmente para fines comerciales.
- Informacion tecnica incompleta: no se conocen la longitud de contexto, los idiomas soportados, ni los detalles del dataset de entrenamiento.
- Sin benchmarks publicados: no hay datos de rendimiento que permitan evaluar su calidad objetivamente frente a otros modelos.
- Riesgo de alucinacion: al ser un modelo de generacion de ficcion, puede producir contenido inventado sin base factual, lo cual es esperable en su dominio pero debe tenerse en cuenta si se usa fuera de el.
- Sesgos desconocidos: no se ha publicado ningun analisis de sesgos del modelo o de sus datos de entrenamiento.
- Repo sin traccion: cero descargas y cero likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HumboldtJoker/ll-ayni-v4-fiction-bf16
- Perfil del autor en HuggingFace: https://huggingface.co/HumboldtJoker/models
