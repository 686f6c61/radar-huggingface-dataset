# richardyoung/LFM2.5-1.2B-Instruct-heretic-GGUF

## Resumen

LFM2.5-1.2B-Instruct-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/LFM2.5-1.2B-Instruct-heretic, una variante "abliterated" (tambien etiquetada como "uncensored") del modelo LFM2.5-1.2B-Instruct de Liquid AI. El trabajo de cuantizacion y publicacion lo firma el usuario richardyoung, que emplea la tecnica heretic para reducir los rechazos del modelo base ante peticiones que el alineamiento original bloquearia. El resultado es un modelo conversacional de 1.170.340.608 parametros (aproximadamente 1,17 mil millones) empaquetado en GGUF para su uso con llama.cpp y Ollama.

La relevancia de esta ficha esta en que combina tres elementos poco habituales: un modelo base de Liquid AI con arquitectura propia, un proceso de abliteration documentado en los papers referenciados (arXiv:2406.11717 y arXiv:2510.18892) y una distribucion en GGUF con cuantizacion imatrix, lo que permite ejecutarlo en hardware de consumo. El repositorio ocupa 6,6 GB y acumula 216 descargas y 1 like en el momento de la consulta.

El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es "other", lo que obliga a revisar los terminos del modelo base de Liquid AI antes de cualquier uso comercial. No se dispone de informacion sobre los idiomas soportados ni de resultados de benchmarks publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de Liquid AI; arquitectura concreta no especificada en la informacion) |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion imatrix (niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. El modelo deriva de LFM2.5-1.2B-Instruct, de Liquid AI, y la variante heretic se ha obtenido mediante tecnicas de abliteration, un proceso que identifica y modifica las direcciones del espacio de activaciones asociadas al rechazo de peticiones para reducir la tasa de respuestas negativas. Los papers referenciados en las etiquetas del repositorio (arXiv:2406.11717 y arXiv:2510.18892) documentan la metodologia heretic aplicada a este tipo de intervenciones.

La publicacion en GGUF se ha realizado con cuantizacion imatrix, que utiliza una matriz de importancia calculada sobre un corpus de calibracion para asignar mas bits a los pesos mas sensibles. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se detalla si la variante heretic ha recibido entrenamiento adicional tras la abliteration o si esta se ha aplicado exclusivamente mediante edicion de pesos.

## Capacidades

- Generacion de texto conversacional en formato instruct, orientada a dialogos multi-turno.
- Reduccion de rechazos: la variante heretic esta disenada para responder a peticiones que el modelo alineado original rechazaria.
- Ejecucion local mediante llama.cpp y Ollama, con formato GGUF e imatrix.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia estandar.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con 1,17 B de parametros y formato GGUF, el modelo se puede ejecutar en un portatil con GPU de consumo para probar flujos de dialogo sin depender de APIs externas.
- Investigacion sobre alineamiento y abliteration: util para estudiar como cambia el comportamiento del modelo al eliminar direcciones de rechazo, comparando respuestas con el modelo base original.
- Generacion de texto creativo sin filtros: la variante heretic permite explorar narrativa, guiones o dialogos en escenarios donde el modelo alineado aplicaria restricciones de contenido.
- Despliegue en entornos con recursos limitados: el tamano reducido permite servir el modelo en CPU o en GPU de gama media mediante Ollama, con un consumo de memoria bajo comparado con modelos de 7 B o superiores.
- Base para fine-tuning ligero: al ser un modelo pequeno, sirve como punto de partida para ajustes con LoRA en tareas especificas de dominio, aunque no se documenta soporte oficial de fine-tuning en la informacion.
- Evaluacion comparativa de cuantizaciones: el uso de imatrix permite analizar la degradacion de calidad frente a otras cuantizaciones GGUF del mismo modelo base en tareas de generacion de texto.
- Integracion en pipelines de generacion de texto por lotes: la compatibilidad con llama.cpp facilita su inclusion en scripts de procesamiento masivo de texto en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 1,17 B en GGUF, las cuantizaciones de 4 bits suelen ocupar alrededor de 0,7-0,9 GB de memoria, y las de 8 bits alrededor de 1,3-1,5 GB, aunque estos valores son estimaciones generales y no datos del repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por tamano, es probable que quepa en GPUs de consumo con 4 GB o mas de VRAM, pero no se confirma en la informacion.
- Opciones de despliegue: llama.cpp y Ollama (segun las etiquetas del repositorio); vLLM y TGI no se mencionan.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/LFM2.5-1.2B-Instruct-heretic-GGUF | 1,17 B | no disponible | other (gated) | GGUF | Variante abliterated con imatrix |
| richardyoung/LFM2.5-1.2B-Instruct-heretic | 1,17 B | no disponible | other | safetensors (presumiblemente) | Modelo base de la cuantizacion |
| LFM2.5-1.2B-Instruct (Liquid AI) | 1,17 B | no disponible | no disponible | no disponible | Modelo original alineado |
| Otros modelos abliterated de ~1 B | no disponible | no disponible | no disponible | GGUF | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina parte del alineamiento de seguridad: el modelo puede generar contenido que el original rechazaria, lo que exige supervision humana en produccion.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual para esta variante.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera del ingles sin evaluacion previa.
- Licencia "other" y acceso gated: es obligatorio revisar los terminos del modelo base de Liquid AI antes de uso comercial; la licencia del repositorio no aclara restricciones concretas.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar casos de uso con documentos largos.
- Cuantizacion imatrix sin detalle de niveles: no se especifican los niveles GGUF disponibles ni la perdida de calidad asociada.
- Repositorio con pocas descargas (216) y un solo like: menor validacion comunitaria que modelos equivalentes mas establecidos.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en integraciones automatizadas.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/LFM2.5-1.2B-Instruct-heretic-GGUF
- Modelo base en Hugging Face: https://huggingface.co/richardyoung/LFM2.5-1.2B-Instruct-heretic
- Paper heretic (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper heretic (arXiv:2510.18892): https://arxiv.org/abs/2510.18892
