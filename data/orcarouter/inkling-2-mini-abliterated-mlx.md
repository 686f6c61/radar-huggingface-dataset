# orcarouter/Inkling-2-Mini-abliterated-MLX

## Resumen

Inkling-2-Mini-abliterated-MLX es una conversión y modificación del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `orcarouter` en Hugging Face. Se trata de una variante "abliterated" (es decir, con los mecanismos de rechazo internos atenuados o eliminados mediante intervenciones sobre los pesos) y convertida al formato MLX para su ejecución nativa en Apple Silicon. El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidad de entrada imagen-texto y salida de texto.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de redistribución de pesos con modificaciones de alineación sobre un modelo de terceros, algo cada vez más frecuente en el ecosistema open source. Por otro, ilustra el flujo de conversión a MLX con precisión mixta (incluyendo NVFP4) para hardware de Apple. El repositorio ocupa 27,4 GB y está sujeto a acceso restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de su descarga.

La información pública disponible sobre esta variante concreta es muy limitada: el autor no ha publicado una model card detallada con especificaciones de arquitectura, datos de entrenamiento ni resultados de benchmarks. La mayor parte de los datos técnicos que se recogen a continuación provienen de los metadatos del repositorio y de la información del modelo base, y se indica explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal imagen-texto a texto; detalles de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publica el ratio de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta con NVFP4 (según tags del repositorio); no se detallan otras variantes |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base `thinkingmachines/Inkling-2-Mini` es un transformer de mezcla de expertos (MoE) con codificador visual, diseñado para la tarea `image-text-to-text`. La variante aquí documentada conserva esa arquitectura, pero introduce dos cambios respecto al original: una conversión de los pesos al formato MLX (optimizado para Apple Silicon) con precisión mixta que incluye NVFP4, y una intervención de tipo "abliterated" orientada a suprimir las respuestas de rechazo del modelo alineado.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documenta el procedimiento exacto de abliteración aplicado (direcciones de rechazo, capas intervenidas, magnitud de la modificación). Cualquier afirmación al respecto sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen y texto), según el pipeline declarado `image-text-to-text`.
- Razonamiento y generación de lenguaje natural en inglés.
- Procesamiento de imágenes integrado en el codificador visual del modelo base.
- Ejecución nativa en Apple Silicon mediante MLX, con pesos en precisión mixta y NVFP4.
- Comportamiento "uncensored": la abliteración busca reducir las negativas del modelo alineado, aunque no se documenta el alcance real de la modificación.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Prototipado local en Mac: el formato MLX permite cargar el modelo en un Mac con Apple Silicon sin depender de CUDA, útil para experimentar con un MoE multimodal en estaciones de trabajo de Apple.
- Investigación sobre alineación y abliteración: permite estudiar empíricamente cómo cambia el comportamiento de rechazo de un modelo multimodal tras la intervención, comparándolo con el modelo base.
- Análisis de imágenes en flujos internos: al aceptar imagen y texto, puede emplearse para describir o resumir capturas y documentos escaneados en entornos controlados.
- Evaluación de conversión MLX: sirve como referencia para validar pipelines de conversión a MLX con precisión mixta y NVFP4 antes de aplicarlos a otros modelos.
- Pruebas de robustez y red teaming: al ser una variante sin filtros de rechazo, es adecuada para estudiar respuestas del modelo ante prompts adversarios en un entorno de laboratorio.
- Docencia y demostraciones: su tamaño de repositorio (27,4 GB) y su ejecución local facilitan demostraciones reproducibles de modelos MoE multimodales sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 27,4 GB, por lo que se necesita al menos esa cantidad de memoria unificada para cargar los pesos completos; con cuantizaciones adicionales no documentadas podría reducirse, pero no hay datos publicados.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y superiores); no es compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 32 GB o más de memoria unificada; en GPUs NVIDIA no se indica compatibilidad.
- Opciones de despliegue: MLX (librería nativa); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| orcarouter/Inkling-2-Mini-abliterated-MLX | no disponible | no disponible | MLX safetensors | Apache 2.0 | Variante abliterada y convertida a MLX; solo inglés; gated |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | safetensors | no disponible | Modelo base original, alineado y sin modificar |
| Otros MoE multimodales open source | varía | varía | safetensors/GGUF | varía | No se dispone de datos concretos para una comparación cuantitativa |

La comparación cuantitativa con alternativas de la misma categoría no está disponible, ya que no se publican parámetros, contexto ni resultados de benchmarks del modelo base ni de esta variante.

## Limitaciones y advertencias

- La abliteración elimina o atenúa los mecanismos de rechazo, lo que puede producir contenido inapropiado, sesgado o inseguro; no debe desplegarse en producción orientada a usuarios sin filtros externos.
- Riesgo elevado de alucinación: no hay datos de evaluación que permitan cuantificarlo, y la modificación de pesos puede degradar la coherencia del modelo alineado.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo está sujeto a acceso restringido (gated) y el autor no documenta las condiciones adicionales que puedan aplicarse al aceptar el acceso.
- Compatibilidad limitada: el formato MLX restringe su uso a Apple Silicon; no hay pesos GGUF ni safetensors estándar para CUDA.
- Falta de model card detallada: sin especificaciones de arquitectura, contexto ni procedimiento de abliteración, la evaluación rigurosa del modelo requiere pruebas empíricas propias.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated-MLX
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- OrcaRouter (sitio principal): https://www.orcarouter.ai/
- Documentación de OrcaRouter: https://docs.orcarouter.ai/introduction
- Playground de OrcaRouter: https://www.orcarouter.ai/playground
