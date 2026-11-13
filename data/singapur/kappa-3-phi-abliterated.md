# Singapur/kappa-3-phi-abliterated

## Resumen

Kappa-3-phi-abliterated es una variante del modelo Phi-3 4k Instruct de Microsoft a la que se le ha aplicado una tecnica de "abliteration" para reducir su tendencia a rechazar peticiones. Lo publica el usuario Singapur en Hugging Face bajo licencia MIT, y su unico proposito declarado es eliminar los mecanismos de rechazo del modelo base manteniendo el resto de capacidades intactas. El modelo tiene 3.821.079.552 parametros (aproximadamente 3.8 mil millones), lo que lo situa en la categoria de modelos pequenos aptos para hardware de consumo.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de modificacion de pesos via abliteration, una practica cada vez mas comun en la comunidad open source; por otro lado, advierte de que se distribuyen pesos en fp32 sin cuantizar (15.3 GB de repositorio), lo que obliga a cuantizar antes de un uso practico. No se dispone de informacion sobre el proceso de entrenamiento original, la composicion del dataset ni evaluaciones de rendimiento publicadas por el autor.

El modelo hereda la arquitectura y el contexto del Phi-3 original (4k tokens de contexto, segun el nombre), pero no se han publicado datos verificables sobre idiomas soportados, benchmarks ni resultados de evaluacion tras la modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3, segun tags y model card) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre indica 4k, sin confirmacion oficial) |
| Tipos de cuantizacion | fp32 en el repositorio; se menciona fp16 GGUF en un repo externo del mismo autor de la tecnica |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code); GGUF fp16 disponible en repo externo |

## Arquitectura y entrenamiento

El modelo parte de Phi-3 4k Instruct, un transformer decoder-only de aproximadamente 3.8 mil millones de parametros desarrollado por Microsoft. No se dispone de informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. Tampoco se detalla el proceso exacto de abliteration aplicado: la model card menciona "orthogonalization" como mecanismo para reducir los rechazos, pero no proporciona la metodologia completa ni los hiperparametros utilizados.

La unica innovacion tecnica documentada es la propia abliteration, que consiste en identificar y proyectar fuera las direcciones de activacion asociadas a la negativa a responder. El autor advierte explicitamente de que los pesos subidos son la salida directa en fp32 de la conversion, sin cuantizar, y recomienda cuantizar al menos a fp16 antes de usar el modelo. No hay informacion sobre el proceso de conversion ni sobre posibles degradaciones introducidas por la modificacion.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Phi-3 Instruct.
- Reduccion de la tendencia a rechazar peticiones ("reduced ability to refuse"), segun la model card.
- Capacidad de seguir instrucciones conversacionales multi-turno, segun el formato Instruct del modelo base.
- No se documenta soporte de tool calling o function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documenta vision, audio ni modo "thinking".
- El modelo se describe a si mismo en la model card con capacidades genericas de conocimiento general y resolucion de problemas, sin datos verificables que las respalden.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio para analizar como la abliteration altera la distribucion de respuestas y que vectores de activacion se ven afectados, comparandolo con el Phi-3 Instruct original.
- Experimentos de red teaming controlados: permite evaluar la robustez de filtros y clasificadores de seguridad frente a modelos modificados, en entornos de laboratorio aislados.
- Generacion de texto creativo sin filtros tematicos: para proyectos de escritura de ficcion que requieran tono crudo o temas sensibles, con la advertencia de que el contenido debe revisarse manualmente.
- Prototipado rapido en local: al ser un modelo de 3.8B, puede ejecutarse en GPU de consumo tras cuantizacion a 4 u 8 bits, lo que lo hace util para pruebas de concepto sin infraestructura dedicada.
- Fine-tuning sobre dominios especificos: sirve como base para ajuste supervisado en tareas donde el modelo original rechazaria ejemplos de entrenamiento por considerarlos sensibles, siempre que se cumplan los requisitos legales y eticos.
- Evaluacion comparativa de tecnicas de abliteration: permite contrastar la eficacia de distintas proyecciones de activacion frente a otros modelos abliterated de la comunidad, midiendo tasa de rechazo y calidad de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de tasa de rechazo, y tampoco se aportan comparaciones cuantitativas con el Phi-3 Instruct original.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 15.3 GB, equivalente al tamano del repositorio; no recomendado para uso directo.
- VRAM estimada en fp16: aproximadamente 7.6 GB, suficiente para GPU con 8-12 GB de VRAM.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2-3 GB, apta para GPU de consumo como RTX 3060, RTX 4060 o superiores.
- GPU recomendadas para fp16: RTX 3090, RTX 4090, A10, L4, A100 o superiores.
- GPU recomendadas para 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores.
- Cabe en GPU de consumo tras cuantizacion; en fp32 no es viable en la mayoria de equipos de consumo.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors, sujeto a compatibilidad con el custom_code del repositorio, no verificada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kappa-3-phi-abliterated | 3.8B | no disponible (nombre indica 4k) | MIT | Hugging Face, safetensors fp32 | Variante abliterated de Phi-3 |
| Phi-3 Mini 4k Instruct | 3.8B | 4k (segun modelo base) | MIT | Hugging Face, amplia adopcion | Modelo original de Microsoft, con rechazos intactos |
| Llama 3.2 3B Instruct | 3.2B | 128k | Llama 3.2 Community License | Hugging Face, amplia adopcion | Mayor contexto, licencia con restricciones |
| Qwen2.5 3B Instruct | 3.1B | 32k | Apache 2.0 | Hugging Face, amplia adopcion | Contexto mayor y licencia permisiva |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sesgado; no debe desplegarse en aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: no hay evaluaciones publicadas que confirmen que la modificacion no degrada la fidelidad factual del modelo base.
- Los pesos se distribuyen en fp32 sin cuantizar (15.3 GB); su uso directo es poco practico y la cuantizacion puede introducir perdidas adicionales de calidad.
- No se documentan los idiomas soportados ni la calidad en castellano; el modelo base esta optimizado principalmente para ingles.
- La licencia MIT permite uso comercial, pero el uso de un modelo abliterated puede incumplir politicas de plataformas, terminos de servicio de proveedores cloud o normativa local sobre contenido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El uso de `custom_code` implica ejecutar codigo remoto al cargar el modelo; conviene auditar el repositorio antes de instanciarlo en produccion.
- No hay informacion sobre sesgos especificos introducidos o amplificados por la modificacion.

## Enlaces

- Hugging Face: https://huggingface.co/Singapur/kappa-3-phi-abliterated
- GGUF fp16 del mismo autor de la tecnica: https://huggingface.co/failspy/kappa-3-phi-3-4k-instruct-abliterated-GGUF/tree/main
- Modelo base Phi-3 (referencia): https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
