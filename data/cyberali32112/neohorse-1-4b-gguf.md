# cyberali32112/NeoHorse-1-4B-GGUF

## Resumen

NeoHorse-1-4B es un modelo de lenguaje causal de aproximadamente 4B parámetros desarrollado por TokenRhythm, presentado como un prototipo inicial dentro de una línea de trabajo orientada a la mejora recursiva (recursive self-improvement, RSI). El modelo se obtiene mediante post-entrenamiento sobre Qwen3.5-4B y está especializado en flujos agénticos: uso de herramientas, generación de código y seguimiento de instrucciones en el contexto de un arnés de ejecución (harness) que suministra herramientas y contexto de ejecución. La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF, distribuida por el usuario cyberali32112, que permite ejecutar el modelo en local con llama.cpp, Ollama y LM Studio.

El elemento diferencial del proyecto no es el modelo en sí, sino el marco de post-entrenamiento descrito en su informe técnico: un routing harness que asigna tareas a un conjunto heterogéneo de modelos, registra las interacciones con herramientas y sus resultados, estima la demanda de capacidades y utiliza esa señal por capacidades para configurar la mezcla de entrenamiento siguiente. Los modelos actualizados vuelven al arnés, cerrando un bucle de evaluación, selección y actualización que, según el autor, constituye el primer paso hacia la RSI. El post-entrenamiento combina SFT con currículo guiado por enrutado y destilación on-policy también guiada por enrutado.

Según la model card, el resultado agregado es una media macro de 64,87 en diez benchmarks frente a 58,94 de Qwen3.5-4B, lo que supone una mejora de 5,93 puntos. El repositorio GGUF incluye pesos BF16 y cuantizaciones de 8, 5 y 4 bits. La longitud de contexto, los idiomas soportados y el detalle por benchmark no aparecen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia NeoHorse Agent-Native Causal Language Model, derivada de Qwen3.5-4B); no se detallan variantes MoE ni hibridas |
| Parametros totales | 4.205.751.296 (aproximadamente 4B) |
| Parametros activos | No aplica (no se ha confirmado arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (16 bits), 8 bits, 5 bits y 4 bits en formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye por separado en formato safetensors |
| Modelo base | TokenRhythm/NeoHorse-1-4B, post-entrenado desde Qwen/Qwen3.5-4B |
| Tamano del repositorio | 27,1 GB (incluye todas las cuantizaciones) |
| Libreria declarada | llama.cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible describe NeoHorse-1-4B como un modelo de lenguaje causal de tipo transformer, obtenido por post-entrenamiento a partir de Qwen3.5-4B. No se detallan en la documentacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion ni el numero de cabezas, por lo que no es posible confirmar variantes de atencion lineal, decodificacion especulativa u otras innovaciones de inferencia. La innovacion declarada se situa en la fase de post-entrenamiento y en el sistema que la gobierna, no en la topologia del modelo.

El marco descrito combina dos tecnicas: SFT con curriculo guiado por enrutado y destilacion on-policy tambien guiada por enrutado. El routing harness asigna tareas a un pool heterogeneo de modelos, registra interacciones con herramientas y resultados, estima la demanda de capacidades y emplea retroalimentacion por capacidad para definir la siguiente mezcla de entrenamiento. Las trayectorias de ejecucion se convierten en senal de entrenamiento preservando el contexto del arnes y de la ejecucion alrededor de cada respuesta. En cuanto a calidad de datos, la model card menciona eliminacion de duplicados exactos y casi duplicados, descontaminacion respecto a los conjuntos de evaluacion, validacion estructural, evaluacion semantica en seis dimensiones y etiquetado a nivel de subescena con la estructura Scene/Goal/Outcome. No se especifica el numero de tokens de entrenamiento ni la composicion del dataset, y no se menciona el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato instruccional.
- Razonamiento multi-paso orientado a tareas agénticas.
- Uso de herramientas (tool use) dentro de un arnes de ejecucion que aporta contexto de herramientas y resultados.
- Generacion y asistencia en codigo, segun los tags del repositorio (coding).
- Seguimiento de instrucciones (instruction-following) con contexto de ejecucion preservado.
- Integracion declarada con llama.cpp, Ollama y LM Studio mediante pesos GGUF.
- Compatibilidad con endpoints segun el tag endpoints_compatible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles; la model card indica explicitamente que los pesos son unicamente de texto (text-only model weights).

## Casos de uso

- Agentes locales con uso de herramientas: el modelo esta post-entrenado especificamente para operar dentro de un harness que suministra herramientas y contexto de ejecucion, por lo que es adecuado para prototipos de agentes que encadenan llamadas a funciones en una maquina de sobremesa.
- Asistencia de codigo en local: con cuantizacion de 4 o 5 bits cabe en GPUs de gama media, lo que permite integrarlo en editores o CLIs con requisitos de privacidad estrictos, sin enviar codigo a servicios externos.
- Automatizacion de tareas de terminal y DevOps: al soportar tool calling y razonamiento multi-paso, puede emplearse para traducir instrucciones en lenguaje natural a secuencias de comandos y validar resultados intermedios.
- Evaluacion y comparacion de arneses agénticos: dado su origen como pieza de un bucle de evaluacion-seleccion-actualizacion, resulta util como baseline reproducible para medir cambios en el diseno de herramientas y prompts.
- Generacion de codigo en pipelines de CI/CD: puede utilizarse para redactar parches, resumir fallos de tests o proponer correcciones, con revision humana posterior, aprovechando su tamano reducido para despliegues con throughput alto.
- Prototipado rapido en investigacion sobre post-entrenamiento: sirve como referencia de 4B para estudiar el efecto de SFT con curriculo guiado y destilacion on-policy sin requerir infraestructura de gran escala.
- Despliegue en entornos con hardware limitado o sin conectividad: al distribuirse en GGUF, puede ejecutarse en portatiles y equipos de borde, util para asistentes internos en instalaciones aisladas.
- Chat de soporte tecnico con contexto de sistema: su naturaleza instruccional permite construir asistentes que mantienen el contexto de una sesion de diagnostico y proponen acciones verificables.

## Benchmarks y rendimiento

La informacion disponible incluye unicamente el agregado de diez benchmarks. El desglose por prueba (nombres de benchmark y puntuacion individual) no aparece en el material proporcionado, ya que la tabla de la model card queda truncada.

| Metrica | NeoHorse-1-4B | Qwen3.5-4B (modelo base) | Diferencia |
|---|---|---|---|
| Media macro en 10 benchmarks | 64,87 | 58,94 | +5,93 |
| Resultados por benchmark individual | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni datos de latencia o throughput.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros (4,2B) y del formato de cuantizacion, no datos publicados por el autor.

- BF16 (16 bits): aproximadamente 8,4 GB de pesos; se recomienda reservar 10-12 GB de VRAM para margen de contexto y overhead.
- Cuantizacion de 8 bits: aproximadamente 4,5 GB de pesos; alrededor de 6-8 GB de VRAM en uso real.
- Cuantizacion de 5 bits: aproximadamente 3,0 GB de pesos; alrededor de 5-7 GB de VRAM.
- Cuantizacion de 4 bits: aproximadamente 2,5 GB de pesos; alrededor de 4-6 GB de VRAM.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, RTX 4090, asi como equipos Apple Silicon con memoria unificada suficiente. Las cuantizaciones de 4 y 5 bits caben en GPUs de 6-8 GB.
- GPU de centro de datos: A100, H100 y similares son compatibles pero sobredimensionadas para un modelo de 4B; su uso tendria sentido para servir muchas instancias en paralelo.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para GGUF; llama-cpp-python para integracion en Python. vLLM o TGI requeririan el modelo base en safetensors (repositorio TokenRhythm/NeoHorse-1-4B) en lugar de los ficheros GGUF.
- Latencia y throughput: no disponible. Dependen del hardware, de la cuantizacion y de la longitud de contexto efectiva, que tampoco se especifica.

## Comparativa con modelos similares

La busqueda web realizada no aporto datos tecnicos de modelos comparables, por lo que la comparacion se limita al modelo base y a referencias de categoria sin cifras verificables.

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-4B (este modelo) | 4,2B | no disponible | Media macro 64,87 en 10 benchmarks | Apache-2.0 | GGUF en HuggingFace; base en safetensors |
| Qwen3.5-4B (base) | ~4B | no disponible | Media macro 58,94 en los mismos 10 benchmarks | no disponible | HuggingFace (Qwen/Qwen3.5-4B) |
| Otras alternativas de ~3-4B para agentes y codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El propio autor describe el modelo como un prototipo inicial en una linea de investigacion sobre RSI, no como un modelo de produccion consolidado.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al derivar de Qwen3.5-4B, es esperable que arrastre los sesgos del modelo base, aunque no se cuantifican.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de fidelidad factual ni de tasas de alucinacion.
- La model card indica que los pesos son unicamente de texto; no hay soporte de vision ni de audio.
- Idiomas soportados: no disponible. No se puede garantizar un rendimiento adecuado fuera del ingles y, en su caso, del chino del modelo base.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con documentos largos o conversaciones extensas sin pruebas previas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y atribucion. Conviene verificar las condiciones aplicables al modelo base Qwen3.5-4B, no detalladas aqui, antes de un despliegue comercial.
- El repositorio GGUF no es el oficial del desarrollador (autor cyberali32112) y registra 0 descargas y 0 likes en la fecha de creacion indicada; no hay evidencia de validacion por parte de la comunidad.
- El desglose de los diez benchmarks no esta disponible, por lo que no se puede verificar en que capacidades concretas se produce la mejora de 5,93 puntos ni si existen regresiones en tareas especificas.
- No se documentan politicas de seguridad, filtros de contenido ni evaluaciones de robustez frente a prompts adversarios, aspectos relevantes para cualquier despliegue orientado a usuarios finales.
- Los metadatos del repositorio y del informe tecnico presentan fechas de 2026, lo que debe tenerse en cuenta al citar el material.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cyberali32112/NeoHorse-1-4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Modelo Qwen3.5-4B (origen del post-entrenamiento): https://huggingface.co/Qwen/Qwen3.5-4B
- Informe tecnico: https://arxiv.org/abs/2609.08183
- Repositorio GitHub: https://github.com/TokenRhythm/NeoHorse
- Sitio del desarrollador: https://tokenrhythm.ai/
- Organizacion en HuggingFace: https://huggingface.co/TokenRhythm
- Cuenta en X: https://x.com/opensquilla
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
