# Cialtion/SimpleTool-VLM-FP8

## Resumen

SimpleTool-VLM-FP8 es un checkpoint de investigación publicado por el usuario Cialtion en Hugging Face. Se trata de una adaptación del modelo multimodal Qwen3-VL-4B orientada a la emisión de llamadas a herramientas estructuradas (tool calls) a partir de imágenes y texto. El modelo no genera lenguaje libre: produce un nombre de función y únicamente las cabezas de argumentos exigidas por el esquema de herramienta que se le proporcione.

El checkpoint FP8 forma parte de una familia de tres variantes publicadas por el mismo autor: el merge en BF16 (Cialtion/SimpleTool-VLM), una versión W4A16 (Cialtion/SimpleTool-VLM-W4A16) y esta versión en FP8. Todas comparten el mismo adaptador de tarea y el mismo contrato de tokenizador, y su soporte depende del stack de servicio utilizado.

Con 4.825.491.968 parámetros (aproximadamente 4,83 mil millones) y un repositorio de 6,0 GB, el modelo está pensado para investigación sobre decisiones estructuradas multimodales en tiempo real, tool calling e interfaces de agentes encarnados. El autor advierte explícitamente de que no es un benchmark de OCR ni un sistema contable, y de que toda acción debe validarse antes de ejecutarse. El pipeline, los idiomas y la licencia no están declarados en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal vision-language); adaptación para cabezas de tool call |
| Parametros totales | 4.825.491.968 (4,83 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 en este checkpoint (formato compressed-tensors); el autor publica tambien variantes BF16 y W4A16 en repositorios separados |
| Idiomas soportados | No disponible |
| Licencia | Codigo y documentacion de release bajo Apache-2.0; el checkpoint queda sujeto a la licencia del modelo base Qwen3-VL y a los terminos upstream (texto exacto no disponible) |
| Formato de pesos | safetensors con configuracion compressed-tensors |
| Tamano del repositorio | 6,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B, un transformer multimodal de la familia Qwen3-VL que procesa imágenes y texto. Sobre esa base, el autor aplica un adaptador de tarea que reemplaza la generación libre por un esquema de salida restringido: un nombre de función más cabezas de argumentos de tamaño dinámico denominadas `arg1...argN`, donde `N` es el número máximo de propiedades del esquema de herramientas proporcionado. La model card describe dos modos de operación, Direct y Adaptive.

Un detalle relevante de diseño es que la imagen se introduce como píxeles y los valores del documento (por ejemplo, una factura) no se copian a campos ocultos del prompt, lo que evita atajos que contaminen la evaluación. El release preserva las salidas crudas de cada rama y su legalidad para permitir auditoría. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor tampoco reclama paridad numérica estricta entre el adaptador y el checkpoint fusionado, ni razonamiento encadenado nativo de Qwen.

## Capacidades

- Emisión de llamadas a herramientas estructuradas a partir de entrada de imagen y de texto, devolviendo nombre de función y argumentos.
- Cabezas de argumentos dinámicas (`arg1...argN`) dimensionadas según el número máximo de propiedades del esquema de herramientas suministrado.
- Dos modos de inferencia: Direct y Adaptive.
- Comprensión de imágenes introducidas como píxeles, sin copiar valores del documento a campos ocultos del prompt.
- Exposición de salidas crudas y de su legalidad para auditoría y depuración.
- Servicio HTTP ligero incluido en el directorio `inference/`, que acepta un PNG, mensajes de texto y herramientas estilo OpenAI.
- Respuesta estructurada con los campos `prediction.raw`, `prediction.legal`, `events` y tiempos del servidor.
- Compatibilidad de contrato de tokenizador y adaptador de tarea con las variantes BF16 y W4A16 de la familia.

## Casos de uso

- Extracción estructurada de facturas en un protocolo de demostración: el repositorio incluye `examples/invoice_request.json` y un servicio que recibe un PNG y devuelve la función y los argumentos detectados. El propio autor lo describe como demostración de protocolo extremo a extremo, no como sistema de aprobación financiera.
- Automatización de back office con validación humana: el campo `prediction.legal` y las salidas crudas permiten construir un flujo en el que cada acción propuesta se audita antes de ejecutarse, tal como recomienda la model card.
- Interfaces de agentes encarnados: el modelo está orientado a decisiones estructuradas en tiempo real, de modo que puede traducir una observación visual más un esquema de herramientas en una llamada concreta con argumentos acotados.
- Enrutado de peticiones a APIs: dado un catálogo de funciones en formato estilo OpenAI, el modelo selecciona la función correcta y rellena solo los argumentos declarados, lo que simplifica el parseo posterior en el orquestador.
- Investigación sobre multimodalidad y tool calling: sirve como banco de pruebas para comparar modos Direct y Adaptive y para estudiar la legalidad de las salidas bajo esquemas de herramienta variables.
- Procesamiento de documentos con campos acotados: al limitar la salida a las propiedades del esquema, resulta adecuado para pipelines donde el número y nombre de campos es conocido de antemano y se quiere evitar texto libre.
- Evaluación de cuantización en producción: al existir variantes BF16, W4A16 y FP8 con el mismo adaptador y tokenizador, permite medir el impacto de la cuantización en la exactitud de los argumentos emitidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para este checkpoint FP8: aproximadamente 4,8 GB solo de pesos, más overhead de caché KV y activaciones. En la práctica, entre 6 y 8 GB para contextos cortos y entradas de imagen moderadas, y del orden de 10 a 12 GB si se trabaja con contextos largos o lotes. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- Variante BF16 (Cialtion/SimpleTool-VLM): aproximadamente 9,7 GB de pesos, con un mínimo práctico en torno a 12 GB y 16-24 GB recomendados según contexto.
- Variante W4A16 (Cialtion/SimpleTool-VLM-W4A16): aproximadamente 2,5-3 GB de pesos, lo que la sitúa en el rango de GPU de consumo con 6-8 GB.
- GPU recomendadas: para FP8 nativo, arquitecturas Ada Lovelace y Hopper (RTX 4090, L40S, H100). En Ampere (A100) y anteriores el FP8 puede no estar soportado de forma nativa por el kernel y requerir conversión o fallback.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) e incluso en GPUs de 8-12 GB con la variante W4A16, siempre que el backend soporte el formato de cuantización.
- Opciones de despliegue: el repositorio incluye un servidor HTTP ligero en `inference/`. Para serving a escala, el formato compressed-tensors es compatible con stacks como vLLM; el autor advierte de que el soporte de backend depende del stack de servicio. No se declara soporte para llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cialtion/SimpleTool-VLM-FP8 | 4,83 B | FP8 (compressed-tensors) | No disponible | Codigo Apache-2.0; checkpoint sujeto a licencia Qwen3-VL | Publicado en Hugging Face; 0 descargas |
| Cialtion/SimpleTool-VLM | 4,83 B (mismo adaptador) | BF16 | No disponible | Igual que el anterior | Publicado en Hugging Face |
| Cialtion/SimpleTool-VLM-W4A16 | 4,83 B (mismo adaptador) | W4A16 | No disponible | Igual que el anterior | Anunciado en la model card; el autor indica que depende de que la subida se complete |
| Qwen3-VL-4B (modelo base) | ~4 B | No disponible en esta informacion | No disponible en esta informacion | Licencia propia de Qwen3-VL | Publico, mantenido por el equipo Qwen |

No se dispone de datos de rendimiento comparativos entre estas variantes ni frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- El autor declara explícitamente que el release no garantiza paridad numérica estricta entre el adaptador y el checkpoint fusionado.
- No se reclama robustez frente a imágenes arbitrarias ni superioridad en OCR.
- El modelo no ofrece razonamiento encadenado nativo de Qwen; el campo `content` del modo Adaptive es un campo corto controlado por la tarea.
- La demostración de facturas incluida es una prueba de protocolo extremo a extremo, no un sistema de aprobación financiera. Toda acción debe validarse antes de ejecutarse.
- El repositorio no declara idiomas soportados, licencia explícita en los metadatos ni pipeline, lo que dificulta evaluar su idoneidad antes de la descarga.
- La licencia del checkpoint queda sujeta a los términos del modelo base Qwen3-VL y a condiciones upstream; el usuario debe revisar esos términos antes de redistribuir o desplegar comercialmente, aunque el código y la documentación sean Apache-2.0.
- El soporte de las variantes cuantizadas depende del stack de servicio; un backend sin soporte para compressed-tensors o FP8 no podrá cargar este checkpoint.
- Riesgo de alucinación en los argumentos emitidos: al tratarse de una tarea de decisión estructurada, un argumento incorrecto puede propagarse a una acción real si no se valida. No se han publicado métricas de exactitud que permitan acotar ese riesgo.
- Sesgos conocidos: no disponible.
- Restricciones de contexto o idioma: no disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Cialtion/SimpleTool-VLM-FP8
- Variante BF16: Cialtion/SimpleTool-VLM (referenciada en la model card, sin URL completa en la informacion disponible)
- Variante W4A16: Cialtion/SimpleTool-VLM-W4A16 (referenciada en la model card, sin URL completa en la informacion disponible)
- La busqueda web realizada no devolvio enlaces relevantes al modelo, al paper ni al repositorio de codigo.
