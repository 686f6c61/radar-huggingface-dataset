# mradermacher/pony-android-grounding-GGUF

## Resumen

`mradermacher/pony-android-grounding-GGUF` es una colección de cuantizaciones en formato GGUF del modelo `JivinDotL/pony-android-grounding`, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base tiene 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para inferencia en hardware de consumo.

Por el nombre ("android-grounding") y la naturaleza conversacional del repositorio, el modelo parece orientado a tareas de *grounding* sobre interfaces de Android, es decir, la identificación de elementos de interfaz (botones, campos, iconos) a partir de instrucciones en lenguaje natural, una capacidad relevante para agentes que operan dispositivos móviles. No obstante, la model card del repositorio es extremadamente escueta y no proporciona información sobre arquitectura, datos de entrenamiento, licencia ni idiomas soportados.

La relevancia de esta ficha radica en que permite desplegar el modelo en local mediante llama.cpp con distintas cuantizaciones (desde Q2_K hasta F16), lo que facilita su evaluación en entornos sin GPU de gama alta. Sin embargo, la ausencia de documentación del autor original limita seriamente cualquier evaluación rigurosa de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.720.574.976 (~1,7 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con quantize_version 2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `JivinDotL/pony-android-grounding`. El recuento de parámetros (1,72 mil millones) es compatible con un transformer decoder-only de tamaño pequeño, pero no se confirma en la documentación disponible. Tampoco se especifican los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica concreta proviene de los metadatos del repositorio GGUF: las cuantizaciones se generaron con `quantize_version: 2`, con tensores de salida cuantizados (`output_tensor_quantised: 1`) y conversión de tipo `hf` (a partir de pesos en formato Hugging Face). No se incluye el fichero `mmproj`, lo que sugiere que el modelo no incorpora proyección multimodal, aunque esto no puede confirmarse sin acceso a la configuración del modelo base.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- *Grounding* sobre interfaces de Android, inferido del nombre del modelo (identificación de elementos de UI a partir de instrucciones).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que indica que puede servirse mediante infraestructura de inferencia estándar.
- Soporte de *tool calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Automatización de pruebas en Android: el modelo podría recibir una descripción textual de un elemento de interfaz ("botón de enviar del formulario") y devolver su localización o identificador, integrándose en frameworks de test como Appium o Espresso.
- Agentes de control de dispositivos móviles: en pipelines donde un LLM de mayor tamaño planifica acciones y este modelo resuelve el *grounding* de cada paso sobre la pantalla capturada, reduciendo el coste frente a usar un modelo grande para cada subtarea.
- Asistentes de accesibilidad: interpretación de instrucciones en lenguaje natural para señalar elementos de la pantalla a usuarios con discapacidad visual, aprovechando su tamaño reducido para ejecución en el propio dispositivo.
- Prototipado rápido en local: al disponer de cuantizaciones desde Q2_K hasta F16, permite evaluar el comportamiento del modelo en portátiles sin GPU dedicada antes de comprometerse con un despliegue mayor.
- Extracción estructurada de elementos de UI: generación de listados de widgets con sus atributos (tipo, texto, posición) a partir de capturas o árboles de accesibilidad, útil para pipelines de scraping o auditoría de aplicaciones.
- Servicio de inferencia ligero: despliegue mediante llama.cpp o servidores compatibles con la API de OpenAI para tareas de clasificación o etiquetado de elementos de interfaz en lotes, con requisitos de memoria muy bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para 1,72 B parámetros, F16 requiere ~3,4 GB; Q8_0 ~1,8 GB; Q4_K_M ~1,0-1,1 GB; Q2_K ~0,6-0,7 GB. Cálculos aproximados a partir del número de parámetros; no confirmados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16 (GTX 1650, RTX 3050); para cuantizaciones Q4 basta con 2 GB (GTX 1050 Ti, iGPU modernas).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones indicadas, incluidas GPUs de gama baja y sistemas con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), servidores compatibles con la API de OpenAI, y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pony-android-grounding (este) | ~1,7 B | no disponible | no disponible | GGUF | Grounding de UI Android; documentación mínima |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 K | Apache 2.0 | safetensors, GGUF | Modelo generalista con licencia permisiva y benchmarks publicados |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 K | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamaño comparable |
| UI-TARS-2B | ~2 B | no disponible | no disponible | safetensors | Especializado en agentes de UI, pero de mayor tamaño |

La comparación es limitada: no hay datos de rendimiento del modelo evaluado ni confirmación de su licencia, lo que impide una comparación cuantitativa justa.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni proceso de alineación; no es posible evaluar riesgos de sesgo.
- Riesgo de alucinación desconocido, pero probable en un modelo de 1,7 B sin documentación de evaluación.
- Licencia no especificada: no se puede garantizar el uso comercial. Es imprescindible contactar con el autor del modelo base antes de desplegarlo en producción.
- Idiomas soportados no documentados; no se puede asumir un buen rendimiento en castellano.
- Longitud de contexto desconocida, lo que impide planificar conversaciones multi-turno largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- El nombre sugiere una especialización en *grounding* de Android, pero no hay evidencia publicada de que funcione correctamente en esa tarea.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en un modelo de este tamaño.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/pony-android-grounding-GGUF
- Modelo base: https://huggingface.co/JivinDotL/pony-android-grounding
