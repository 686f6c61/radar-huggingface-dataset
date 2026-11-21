# QuixiAI/Qwen3-72B-Instruct-2

## Resumen
Qwen3-72B-Instruct-2 es un modelo publicado en Hugging Face por el usuario QuixiAI bajo licencia Apache 2.0. El nombre sugiere una variante del modelo Qwen3 de Alibaba, pero el repositorio no incluye model card con informacion tecnica: el README se limita a declarar licencia e idioma (ingles). Los pesos en safetensors suman 58.660.511.744 parametros (aproximadamente 58,7 mil millones), cifra que no coincide con la denominacion "72B" del identificador, lo que apunta a un posible renombrado o a una conversion no documentada.

El repositorio tiene un tamano de 117,3 GB, coherente con pesos en precision bf16/fp16 para un modelo de ~58,7B parametros. No hay informacion sobre arquitectura, contexto, datos de entrenamiento ni benchmarks. La relevancia de esta ficha es, por tanto, limitada: se trata de un artefacto con escasa documentacion y traccion (18 descargas, 0 likes), por lo que cualquier evaluacion tecnica debe hacerse con cautela y verificacion directa de los pesos.

Dado que no se dispone de model card detallada, todos los apartados que dependen de informacion del autor se marcan como "no disponible". Las especificaciones derivadas de los metadatos del repositorio (parametros, formato, licencia, idioma) si se recogen.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3` sugiere familia Qwen3, sin confirmacion documental) |
| Parametros totales | 58.660.511.744 (~58,7B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | en (segun metadatos del autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura mas alla del tag `qwen3` asociado al repositorio, que sugiere una base de la familia Qwen3 de Alibaba, pero sin confirmacion en la model card. El recuento real de parametros (58,7B) difiere del "72B" del identificador, lo que impide afirmar que corresponda a una variante oficial de Qwen3 de ese tamano.

Tampoco hay datos sobre numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas (atencion lineal, decodificacion especulativa, modos de razonamiento). Toda esta informacion se considera no disponible.

## Capacidades
- Generacion de texto en ingles: unica capacidad inferible de los metadatos (idioma declarado `en`).
- Razonamiento, codigo y matematicas: no disponible (no documentado por el autor).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el autor declara solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso
- Evaluacion comparativa interna: al ser un artefacto sin documentacion, un uso realista es servir como punto de comparacion controlado frente a modelos Qwen3 oficiales en tareas de generacion de texto en ingles, verificando primero la integridad de los pesos.
- Experimentacion academica con checkpoints no oficiales: util para estudiar como se comportan pesos derivados o renombrados frente a sus bases declaradas, siempre con validacion previa.
- Generacion de texto en ingles en prototipos: si la integridad de los pesos se confirma, puede emplearse para tareas basicas de redaccion y resumen en ingles, dado el volumen de parametros (~58,7B).
- Base para fine-tuning experimental: el formato safetensors y la licencia Apache 2.0 permiten tecnicamente ajustar el modelo, aunque la ausencia de model card obliga a validar el comportamiento base antes de invertir en entrenamiento.
- Despliegue en infraestructura propia: los 117,3 GB de pesos en bf16/fp16 requieren hardware de gama alta; puede servir para probar pipelines de inferencia (vLLM, TGI) con modelos de ~58B.
- Auditoria de artefactos de Hugging Face: caso de uso metodologico para estudiar repositorios con documentacion insuficiente y nombres que no coinciden con el recuento de parametros.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en bf16/fp16 ocupan aproximadamente 117 GB; en cuantizacion 8 bits, en torno a 59 GB; en 4 bits, alrededor de 30 GB (estimaciones teoricas a partir del recuento de parametros, no verificadas).
- GPU recomendadas: para precision completa, configuraciones multi-GPU tipo 2x H100 80 GB o 2x A100 80 GB; para 8 bits, una H100 80 GB o A100 80 GB; para 4 bits, una RTX 4090 24 GB queda justo y puede requerir offload a CPU.
- Compatibilidad con GPU de consumo: solo en cuantizaciones agresivas (4 bits o inferiores) y con posible offload; no cabe en consumer GPU en precision nativa.
- Opciones de despliegue: vLLM, TGI o llama.cpp (previa conversion a GGUF) son opciones tecnicas, pero sin model card no hay garantia de que la arquitectura sea compatible con estas herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| QuixiAI/Qwen3-72B-Instruct-2 | ~58,7B | no disponible | apache-2.0 | minima (solo README con licencia e idioma) | Hugging Face, 18 descargas |
| Qwen3 oficial (familia Alibaba) | variantes oficiales | no disponible en esta ficha | no disponible en esta ficha | model cards oficiales | Hugging Face / repos oficiales |
| Alternativas de ~58-70B open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto o calidad con alternativas concretas; la comparativa se limita a parametros, licencia y nivel de documentacion.

## Limitaciones y advertencias
- Documentacion practicamente inexistente: el README solo declara licencia e idioma, sin arquitectura, contexto, entrenamiento ni evaluaciones.
- Discrepancia entre nombre ("72B") y recuento real de parametros (~58,7B): riesgo de confusion sobre la base real del modelo.
- Origen no oficial: el repositorio pertenece a un usuario individual (QuixiAI), no a Alibaba ni a un laboratorio reconocido; no hay garantia de que los pesos correspondan a un modelo Qwen3 legitimo.
- Riesgo de alucinacion y sesgos: no evaluable sin benchmarks ni model card; debe asumirse un riesgo estandar de los LLM, agravado por la falta de validacion publica.
- Idiomas: solo ingles declarado; no hay soporte multilingue documentado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario debe verificar de forma independiente la procedencia y legalidad de los pesos antes de usos productivos.
- Traccion minima (18 descargas, 0 likes): sin comunidad ni reportes de uso que permitan contrastar calidad o estabilidad.
- Para produccion: no recomendable sin auditoria previa de pesos, evaluacion propia en tareas objetivo y verificacion de compatibilidad con el stack de inferencia.

## Enlaces
- Hugging Face: https://huggingface.co/QuixiAI/Qwen3-72B-Instruct-2
