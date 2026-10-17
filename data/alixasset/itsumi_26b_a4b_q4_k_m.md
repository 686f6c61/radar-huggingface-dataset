# alixasset/ITSUMI_26B_A4B_Q4_K_M

## Resumen

ITSUMI_26B_A4B_Q4_K_M es un repositorio de HuggingFace publicado por el usuario alixasset. Se distribuye como un fichero GGUF cuantizado Q4_K_M y está etiquetado como conversacional y compatible con endpoints. El dato de parámetros totales que proporciona HuggingFace es de 25.233.142.046, aproximadamente 25,23 mil millones, y el repositorio ocupa 16,8 GB.

La model card no describe la arquitectura, el proceso de entrenamiento, los datos utilizados, los idiomas soportados ni la longitud de contexto. La licencia se declara como "other" con nombre "alix", pero no se detallan las condiciones de uso comercial. El sufijo "A4B" del nombre podría sugerir una configuración con 4B de parámetros activos, pero no hay confirmación de que se trate de un modelo MoE.

Su interés práctico es limitado pero claro: permite probar un modelo conversacional de unos 25B en formato GGUF de 4 bits, potencialmente en hardware de consumo, sin depender de una API externa. Sin embargo, la ausencia de documentación técnica y de benchmarks impide recomendarlo para producción sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no indica si es transformer, MoE, híbrida o SSM. |
| Parámetros totales | 25.233.142.046, aproximadamente 25,23 mil millones, según metadatos de HuggingFace. |
| Parámetros activos | No disponible. El sufijo "A4B" podría sugerir 4B activos, pero no se confirma que sea MoE. |
| Longitud de contexto | No disponible. |
| Tipos de cuantización | GGUF Q4_K_M, según el nombre del repositorio. No se detallan otras variantes. |
| Idiomas soportados | No disponible. |
| Licencia | other; license_name: alix; enlace LICENSE. No se especifican condiciones de uso comercial. |
| Formato de pesos | GGUF. El recuento de parámetros figura como dato real de safetensors en HuggingFace, pero el repositorio distribuido es GGUF. |
| Tamaño del repositorio | 16,8 GB. |
| Modelo base | No disponible. |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura del modelo. No se han publicado detalles sobre el número de capas, el mecanismo de atención, el tokenizador, la posible mezcla de expertos, la función de activación ni el proceso de entrenamiento. Tampoco hay datos sobre el número de tokens utilizados, la composición del corpus, el uso de RLHF, DPO u otras técnicas de alineación.

El único dato técnico verificable es el formato de distribución: un GGUF cuantizado Q4_K_M. Q4_K_M es una cuantización de 4 bits con bloques k-quant, pensada para reducir el uso de memoria frente a FP16; no aporta información sobre la calidad del modelo ni sobre su entrenamiento. El tamaño del repositorio, 16,8 GB, es coherente con un modelo de unos 25B en 4 bits, pero no se detalla el tamaño exacto del fichero ni si incluye archivos adicionales.

## Capacidades

- Conversación de texto: el tag "conversational" es la única indicación funcional disponible. No hay detalles sobre calidad multi-turno, longitud de contexto ni idiomas.
- Despliegue en endpoints compatibles: el tag "endpoints_compatible" indica que puede integrarse en servicios compatibles con endpoints, sujeto a validación técnica.
- Generación de texto general: no está confirmada explícitamente, pero es coherente con un modelo conversacional. No hay benchmarks que lo respalden.
- Tool calling o function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Código y matemáticas: no disponible.
- Visión o audio: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.
- Decodificación especulativa u otras optimizaciones: no disponible.

## Casos de uso

- Chat local con datos sensibles: desplegar el GGUF Q4_K_M con llama.cpp u Ollama en una estación de trabajo con 24 GB de VRAM para conversaciones que no deben salir a la nube. Es adecuado por el formato GGUF y el tag conversacional, aunque la calidad y el contexto deben validarse.
- Evaluación de cuantización Q4_K_M: usar este repositorio como referencia de 4 bits para medir consumo de VRAM, latencia y degradación de calidad frente a FP16 u otras cuantizaciones del mismo modelo base, si están disponibles.
- Endpoint interno de chat: servir el modelo en un endpoint compatible para prototipos de asistentes internos, con autenticación y límites de uso. El tag "endpoints_compatible" facilita la integración, pero no hay datos de throughput.
- RAG sobre documentación corporativa: conectar el modelo a un pipeline de recuperación para responder preguntas sobre manuales y procedimientos, inyectando fragmentos relevantes en el prompt. No requiere una ventana de contexto larga si el orquestador limita el número de fragmentos.
- Pruebas de integración de aplicaciones LLM: validar streaming, tokenización, formato de mensajes y manejo de errores en una API compatible antes de migrar a un modelo mayor o a un proveedor externo.
- Red teaming y análisis de sesgos: ejecutar baterías de prompts adversarios sobre un modelo conversacional de unos 25B sin documentación pública, para identificar alucinaciones y comportamientos inseguros antes de un despliegue.
- Generación de borradores en herramientas de soporte: usar el modelo como generador de respuestas preliminares con revisión humana, manteniendo el estado de la conversación en la aplicación. Adecuado para prototipos, no para producción crítica sin benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones multilingües. No se deben inferir a partir del tamaño del modelo o del tipo de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q4_K_M ocupan aproximadamente 15-17 GB. Con overhead y contexto corto, se recomiendan al menos 18-20 GB de VRAM; 24 GB es una cifra cómoda para uso local.
- Contextos largos o lotes mayores: pueden requerir 32-48 GB de VRAM o más, dependiendo de la implementación y de la longitud de contexto real, que no se conoce.
- GPU recomendadas: RTX 4090 o RTX 3090 de 24 GB para uso local con contexto limitado; A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB para servicio y mayor concurrencia.
- GPU de consumo: sí cabe en GPUs de 24 GB. Una GPU de 16 GB requeriría offload parcial a CPU o RAM y reduciría el rendimiento. 12 GB no es suficiente para el modelo completo en Q4_K_M.
- CPU: es posible ejecutarlo con llama.cpp y 32 GB de RAM o más, aunque el throughput será bajo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y endpoints compatibles. El soporte de GGUF en vLLM o TGI debe validarse con la versión concreta antes de usarlo en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ITSUMI_26B_A4B_Q4_K_M | 25,23 mil millones | No disponible | No disponible | other / alix | HuggingFace |
| Alternativa comparable 1 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa comparable 2 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa comparable 3 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para identificar alternativas comparables con datos verificables. Falta la arquitectura, la longitud de contexto y cualquier benchmark del modelo. El sufijo "A4B" podría indicar una arquitectura MoE con aproximadamente 4B de parámetros activos, pero no está confirmado; hasta verificarlo, cualquier comparación con modelos de tamaño similar sería especulativa.

## Limitaciones y advertencias

- Documentación mínima: la model card solo contiene metadatos de licencia. No hay arquitectura, datos de entrenamiento, idiomas, contexto ni evaluación.
- Riesgo de alucinación: no evaluado. Cualquier uso en producción requiere pruebas específicas con prompts representativos.
- Sesgos: no documentados. No se puede evaluar su comportamiento en dominios sensibles.
- Licencia: "other" con nombre "alix". No se detallan términos de uso comercial; es obligatorio revisar el fichero LICENSE antes de desplegar.
- Idioma: no se confirma soporte de castellano ni de otros idiomas. No se debe asumir calidad multilingüe.
- Contexto: no disponible. No se debe asumir una ventana larga para conversaciones multi-turno o RAG sin validación.
- Cuantización Q4_K_M: la pérdida de calidad frente a FP16 no está medida. Puede afectar a tareas de razonamiento, código o matemáticas.
- Validación comunitaria: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso o revisión por terceros.
- Compatibilidad: el tag "endpoints_compatible" no garantiza compatibilidad con todas las APIs o servidores. Hay que validar el tokenizador, el formato de mensajes y el streaming.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alixasset/ITSUMI_26B_A4B_Q4_K_M
- Licencia referenciada en la model card: https://huggingface.co/alixasset/ITSUMI_26B_A4B_Q4_K_M/blob/main/LICENSE
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
