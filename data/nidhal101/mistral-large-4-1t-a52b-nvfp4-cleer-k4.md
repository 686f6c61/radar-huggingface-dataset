# Nidhal101/Mistral-Large-4-1T-A52B-NVFP4-CLEER-k4

## Resumen

Mistral-Large-4-1T-A52B-NVFP4-CLEER-k4 es un derivado del modelo Mistral Large 4 publicado por mistralai, un Mixture-of-Experts (MoE) nativamente multimodal de 1 billon de parametros totales con 52 mil millones de parametros activos por token (49 mil millones en los expertos, mas embeddings y capas de salida). El autor del repositorio, Nidhal101, distribuye una variante derivada de los pesos NVFP4 originales, con un sufijo "CLEER-k4" que sugiere una modificacion propia del autor, si bien la model card no documenta en que consiste dicha modificacion ni aporta detalles tecnicos adicionales.

El modelo base esta entrenado desde cero por Mistral AI sobre 3.800 GPU NVIDIA Grace Blackwell y esta orientado a comprension de texto e imagen, razonamiento, generacion de codigo y uso de herramientas. Su relevancia radica en combinar escala de un billon de parametros con un coste de inferencia contenido gracias al enrutamiento MoE (unos 52B activos por token) y a un formato de pesos cuantizado NVFP4 que reduce el espacio en disco y los requisitos de memoria.

La ficha se limita a los datos disponibles en la informacion proporcionada. No se ha publicado informacion sobre el proceso concreto de derivacion "CLEER-k4", los idiomas soportados, la longitud de contexto exacta ni resultados de benchmarks de esta variante especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) nativamente multimodal (texto e imagen) |
| Parametros totales | 1 billon (1T) |
| Parametros activos | 52B por token (49B en expertos + embeddings y capas de salida) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en expertos, FP8 en capas densas (formato del modelo base); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (licencia original de Mistral AI; ver LICENSE) |
| Formato de pesos | NVFP4 (expertos) + FP8 (capas densas) + borrador DSpark en BF16; safetensors en el repo (49,2 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts con enrutamiento disperso: 1 billon de parametros totales de los que se activan 52B por token, lo que permite un coste computacional por token muy inferior al de un modelo denso del mismo tamano. Es nativamente multimodal, con capacidad de procesar texto e imagenes, y fue entrenado desde cero por Mistral AI sobre 3.800 GPU NVIDIA Grace Blackwell. El empaquetado de pesos combina expertos en NVFP4 con capas densas en FP8 e incluye un borrador DSpark en BF16, presumiblemente para decodificacion especulativa, aunque la informacion disponible no detalla el mecanismo.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documenta en la informacion proporcionada en que consiste la modificacion "CLEER-k4" aplicada por Nidhal101 sobre los pesos originales, ni que tecnicas de ajuste o reempaquetado se han utilizado.

## Capacidades

- Generacion de texto y razonamiento multietapa.
- Comprension de imagenes (modelo nativamente multimodal).
- Generacion y comprension de codigo.
- Uso de herramientas y function calling, segun la descripcion del modelo base.
- Razonamiento orientado a agentes, segun la descripcion del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a desarrolladores con contexto de repositorio: el modelo puede integrarse en herramientas tipo IDE o CLI para explicar codigo, proponer parches y responder preguntas sobre una base de codigo, aprovechando su capacidad de codigo y su naturaleza MoE para mantener un coste de inferencia contenido pese al tamano total.
- Analisis de documentos tecnicos con imagenes: al ser nativamente multimodal, puede procesar diagramas de arquitectura, capturas de pantalla de errores o tablas escaneadas junto al texto asociado en un mismo flujo de razonamiento.
- Agentes automatizados con tool calling: su soporte declarado de uso de herramientas permite construir agentes que consulten APIs, ejecuten busquedas o encadenen pasos multi-turno en pipelines de automatizacion.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para revision automatica de pull requests, generacion de tests o sugerencias de refactorizacion, con la salvedad de que esta variante no documenta benchmarks propios.
- Razonamiento sobre datos estructurados y no estructurados combinados: util en tareas de extraccion y sintesis donde se mezclan texto e imagenes, como informes financieros o documentacion tecnica.
- Despliegue en infraestructura con memoria limitada: el empaquetado NVFP4/FP8 reduce el espacio de pesos a unos 49,2 GB en disco, lo que facilita servir el modelo en nodos con GPU de gran memoria frente a un checkpoint en BF16.
- Prototipado e investigacion sobre modelos MoE multimodales: sirve como base para experimentos de cuantizacion, evaluacion o ajuste fino, siempre que se respete la licencia original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante ni para el modelo base en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 49,2 GB en formato NVFP4/FP8, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos, mas overhead de activaciones, cache KV y el borrador DSpark en BF16. Una estimacion prudente parte de 80 GB o mas de VRAM para servicio en produccion.
- GPU recomendadas: NVIDIA H100 (80 GB), H200, B200 o nodos Grace Blackwell; tambien A100 de 80 GB si el runtime soporta NVFP4/FP8 de forma eficiente.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) por el tamano de los pesos; requeriria offloading a RAM/CPU con penalizacion severa de latencia.
- Opciones de despliegue: no se documentan en la informacion disponible; por el formato NVFP4 se requiere un runtime con soporte especifico (por ejemplo, TensorRT-LLM o vLLM con kernels NVFP4), aunque no se confirma en los datos proporcionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nidhal101/Mistral-Large-4-1T-A52B-NVFP4-CLEER-k4 | 1T | 52B | no disponible | other | Hugging Face (0 descargas) |
| mistralai/Mistral-Large-4-1T-A52B-NVFP4 | 1T | 52B | no disponible | other | Hugging Face (modelo base) |
| unsloth/Mistral-Large-4-1T-A52B-NVFP4 | 1T | 52B | no disponible | other | Hugging Face (reempaquetado) |
| nativ-community/Mistral-Large-4-1T-A52B-NVFP4 | 1T | 52B | no disponible | other | Hugging Face (espejo comunitario) |

Las alternativas disponibles en la informacion son variantes del mismo modelo base; no se dispone de datos de rendimiento comparativo ni de modelos de otra familia con los que contrastar.

## Limitaciones y advertencias

- La model card no documenta la modificacion "CLEER-k4": se desconoce que cambios introduce respecto al modelo base y si afectan al comportamiento o a la calidad.
- El repositorio no registra descargas ni likes, lo que indica ausencia de validacion por parte de la comunidad.
- No hay benchmarks publicados para esta variante; no se puede afirmar que mantenga el rendimiento del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Licencia "other": el uso comercial queda sujeto a los terminos de la licencia original de Mistral AI, que deben revisarse antes de cualquier despliegue en produccion.
- El formato NVFP4/FP8 limita las opciones de runtime y puede requerir hardware NVIDIA reciente para un rendimiento aceptable.
- El tamano del repositorio (49,2 GB) y el caracter derivado del modelo exigen verificar la integridad de los pesos antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nidhal101/Mistral-Large-4-1T-A52B-NVFP4-CLEER-k4
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Reempaquetado de Unsloth: https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-NVFP4
- Espejo de Nativ Community: https://huggingface.co/nativ-community/Mistral-Large-4-1T-A52B-NVFP4
