# erobey/Qwen3.8-27B-mlx-4bit

## Resumen

erobey/Qwen3.8-27B-mlx-4bit es una cuantización a 4 bits en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el usuario erobey. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos realizada con mlx-lm 0.31.3 para poder ejecutar el modelo en hardware de Apple Silicon (chips de la serie M) mediante la librería MLX. El repositorio contiene 26.895.993.856 parámetros (aproximadamente 26,9 mil millones) y ocupa 15,2 GB en disco, frente a los aproximadamente 54 GB que ocuparían los pesos en precisión completa de 16 bits.

La relevancia de esta ficha es práctica: permite a desarrolladores con un Mac equipado con memoria unificada ejecutar localmente un modelo de casi 27.000 millones de parámetros sin depender de GPUs NVIDIA ni de servicios en la nube. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y la etiqueta qwen3_5 del repositorio apunta a la arquitectura de la familia Qwen3.5.

La documentación aportada por el autor es mínima: la model card se limita a indicar el proceso de conversión y a incluir un ejemplo de uso con mlx-lm. No se especifican longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de los apartados de esta ficha quedan marcados como no disponibles. Las búsquedas web realizadas no devolvieron ningún resultado relacionado con el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; la etiqueta del repositorio es qwen3_5, correspondiente a la familia Qwen3.5 |
| Parámetros totales | 26.895.993.856 (~26,9 B) |
| Parámetros activos | No disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit en formato MLX (única variante publicada en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (generado con mlx-lm 0.31.3) |
| Modelo base | Qwen/Qwen3.8-27B |
| Librería | mlx (mlx-lm) |
| Tarea declarada | text-generation |
| Tamaño del repositorio | 15,2 GB |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-19 |
| Descargas / likes | 18 / 0 |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna más allá de la etiqueta qwen3_5 del repositorio, que sitúa el modelo base en la familia Qwen3.5 de Alibaba. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste con RLHF o DPO, ya que la model card del repositorio cuantizado no reproduce esa información y no se ha proporcionado la ficha del modelo base.

La única innovación técnica documentada es el propio proceso de cuantización: la conversión de los pesos originales a 4 bits y su empaquetado en el formato de MLX mediante mlx-lm 0.31.3, lo que reduce el peso en disco de unos 54 GB estimados en precisión de 16 bits a 15,2 GB. No se documentan detalles del esquema de cuantización (si es grupo a grupo, qué tamaño de grupo se usa, ni qué capas se dejan sin cuantizar), ni si se aplicaron técnicas de decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como text-generation y conversational, y la model card incluye un ejemplo de uso con plantilla de chat mediante tokenizer.apply_chat_template.
- Conversación multi-turno: el ejemplo proporcionado construye una lista de mensajes con roles, lo que indica soporte de plantilla de chat para diálogos.
- Capacidades heredadas del modelo base: al ser una conversión del Qwen/Qwen3.8-27B, el modelo conserva las capacidades de la familia Qwen3.5, pero no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este repositorio concreto.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Ejecución local en Apple Silicon: es la capacidad diferencial de esta publicación, ya que el formato MLX permite cargar el modelo con la librería mlx-lm en chips de la serie M.

## Casos de uso

- Asistente de programación local en un Mac: el modelo puede cargarse con mlx-lm y usarse como asistente interactivo desde terminal o integrado en un editor, sin enviar código propiedad de la empresa a servidores externos. Es adecuado porque los 15,2 GB de pesos caben en la memoria unificada de un Mac de gama alta.
- Procesamiento de documentos confidenciales on-device: resumen, extracción de entidades y clasificación de contratos, informes médicos o expedientes legales que no pueden salir de la organización. La inferencia local elimina la exposición de datos a terceros.
- Prototipado rápido de aplicaciones de IA generativa: permite validar prompts, plantillas de chat y flujos conversacionales en un portátil antes de decidir si se despliega la versión completa del modelo en un clúster con GPUs.
- Chat de atención al cliente en entornos con requisitos de soberanía del dato: un modelo de ~27 B puede gestionar conversaciones multi-turno en instalaciones propias; conviene verificar antes la longitud de contexto real y el comportamiento en el idioma objetivo, ya que no están documentados.
- Generación y revisión de documentación técnica: redacción de guías, comentarios de código y notas de versión a partir de fuentes internas, ejecutado en local durante el desarrollo.
- Evaluación comparativa de cuantizaciones: investigadores pueden usar este repositorio como punto de referencia 4-bit para medir la degradación frente a los pesos originales en tareas concretas de su dominio, siempre que apliquen su propia batería de evaluación, dado que no hay benchmarks publicados.
- Procesado por lotes nocturno en un puesto de trabajo: tareas de clasificación o resumen de grandes volúmenes de texto que no requieren baja latencia y pueden ejecutarse de forma desatendida en un Mac con memoria unificada suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K ni similares) y tampoco se han encontrado datos en las búsquedas web realizadas.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos en 4 bits ocupan 15,2 GB. Hay que sumar la caché KV y el resto del contexto de ejecución, por lo que en la práctica se recomienda un sistema con al menos 24 GB de memoria unificada; 16 GB queda muy justo y probablemente obligue a reducir la longitud de contexto.
- GPU recomendadas: al estar en formato MLX, el destino natural son los chips de Apple (M1 Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max) con 24 GB de memoria unificada o más. En GPUs NVIDIA o AMD no es utilizable sin reconvertir los pesos.
- ¿Cabe en GPU de consumo? No aplica a GPUs de consumo tipo RTX 4090 en esta distribución concreta, porque MLX no las soporta. Sí cabe en equipos Apple Silicon de gama alta; en Macs de 16 GB el margen es insuficiente en la mayoría de escenarios.
- Opciones de despliegue: mlx-lm (la vía documentada por el autor). Para otros entornos habría que reconvertir los pesos a GGUF (para llama.cpp u Ollama) o a un formato compatible con vLLM y TGI, partiendo del modelo base.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

La información proporcionada solo permite comparar esta publicación con su modelo base. No se dispone de datos sobre otras cuantizaciones comparables (por ejemplo, versiones GGUF o MLX de 8 bits del mismo modelo).

| Característica | erobey/Qwen3.8-27B-mlx-4bit | Qwen/Qwen3.8-27B (base) |
|---|---|---|
| Parámetros | 26.895.993.856 | 26.895.993.856 (mismo modelo de origen) |
| Formato de pesos | safetensors en formato MLX, 4-bit | safetensors en precisión completa |
| Tamaño en disco | 15,2 GB | Aproximadamente 54 GB (estimación a partir del número de parámetros en 16 bits) |
| Cuantización | 4-bit | Sin cuantizar |
| Hardware de destino | Apple Silicon (MLX) | GPUs NVIDIA/AMD o CPU, según el stack elegido |
| Contexto | No disponible | No disponible en la información proporcionada |
| Licencia | Apache 2.0 | No disponible en la información proporcionada |
| Descargas / likes | 18 / 0 | No disponible en la información proporcionada |

No se conocen, a partir de los datos facilitados, alternativas de terceros directamente comparables (mismo tamaño y misma tarea) con métricas verificables.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato MLX solo funciona en Apple Silicon. No se puede cargar con vLLM, TGI, llama.cpp ni Ollama tal cual.
- Pérdida por cuantización: al tratarse de una conversión a 4 bits, es esperable una degradación en tareas sensibles a la precisión (matemáticas, código, razonamiento encadenado). No hay mediciones publicadas que cuantifiquen ese impacto.
- Documentación mínima: la model card no describe la arquitectura, el entrenamiento, los idiomas ni las limitaciones del modelo. Cualquier decisión de producción debería apoyarse en evaluaciones propias.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad, veracidad ni tasas de alucinación. Es un riesgo inherente a los modelos generativos de este tamaño y debe mitigarse con verificación externa.
- Idiomas: se desconoce qué idiomas están soportados y con qué calidad. No se debe asumir un buen rendimiento en castellano sin probarlo.
- Contexto: se desconoce la longitud de contexto real, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Fechas del repositorio: la fecha de creación y de última actualización registradas es el 2026-09-19, con un intervalo de veinte minutos entre ambas; no hay historial de revisiones posterior documentado.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base (Qwen/Qwen3.8-27B) antes de explotarlo en producción.
- Adopción muy baja: 18 descargas y 0 likes en el momento de redactar esta ficha, sin señales de validación por parte de la comunidad.
- Sin garantías del publicador: se trata de una conversión de un tercero, no de una publicación oficial del equipo de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/erobey/Qwen3.8-27B-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería utilizada para la conversión (mlx-lm): https://github.com/ml-explore/mlx-lm
- Otras búsquedas web: no se han encontrado papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados devueltos por las búsquedas (temarios escolares de quinto curso, parrillas de televisión, formularios matemáticos y pruebas de kanji) no guardan ninguna relación con el modelo.
