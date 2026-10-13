# d-michail/Mitos-Qwen3-1.7B-Process

## Resumen

Mitos-Qwen3-1.7B-Process es un ajuste fino del modelo denso Qwen/Qwen3-1.7B (1.720.574.976 parámetros) desarrollado por el usuario d-michail para responder preguntas sobre procedimientos administrativos de la administración pública griega. El modelo se ha entrenado sobre el Registro Nacional de Procedimientos Administrativos de Grecia (Εθνικό Μητρώο Διοικητικών Διαδικασιών, conocido como ΜΙΤΟΣ / Mitos), a partir de 90.145 registros de pregunta-respuesta derivados de los 4.407 procedimientos del registro. El repositorio contiene el modelo final fusionado en bfloat16, entrenado con todos los procedimientos.

El problema que aborda es acotado pero real: consultar en lenguaje natural trámites burocráticos (renovación de permisos, documentos requeridos, plazos, tasas) cuya información está dispersa en fichas estructuradas. La model card es explícita sobre el diseño: el modelo está pensado para uso con recuperación aumentada (RAG), no como fuente de conocimiento cerrado, y sus respuestas imitan el registro y el formato de las entradas del registro. Un ajuste LoRA de rango 16 sobre las proyecciones de atención y MLP, con 2 épocas y secuencias de hasta 4.096 tokens, es suficiente para adaptar el tono y la estructura del dominio.

Su relevancia actual es doble. Por un lado, demuestra un patrón de bajo coste para dominios administrativos muy específicos y con recursos lingüísticos escasos, como el griego. Por otro, es un ejemplo de publicación con limitaciones bien documentadas: licencia CC BY-SA 4.0 derivada del contenido del registro, advertencia explícita de que no constituye asesoramiento legal y aviso de que el modelo final no fue evaluado en el benchmark por fuga de datos (las preguntas "no vistas" pertenecen a procedimientos que este modelo sí vio durante el entrenamiento).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino mediante LoRA y posterior fusión de pesos |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens de longitud máxima de secuencia en el entrenamiento; el modelo base Qwen3-1.7B declara una ventana nativa mayor, no validada para este ajuste |
| Tipos de cuantización | no disponible (el repositorio publica pesos en bfloat16; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | griego moderno (código `el`); no se documentan otros idiomas |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (biblioteca `transformers`, precisión bfloat16) |

## Arquitectura y entrenamiento

Se parte de Qwen3-1.7B, un transformer denso de tipo decoder-only. El ajuste se realizó con LoRA de rango 16 y alpha 32, aplicado a todas las proyecciones de atención y de MLP, con optimizador de tasa de aprendizaje 2e-4, programación coseno, 2 épocas, batch efectivo de 32 y precisión bfloat16. La pérdida se calcula únicamente sobre los tokens del asistente, usando la plantilla de chat de Qwen3 con el modo de razonamiento desactivado (`enable_thinking=False`) y entropía cruzada estándar. Los pesos LoRA se fusionaron después en el modelo final, que se distribuye en bfloat16.

Los datos de entrenamiento son 90.145 registros de pregunta-respuesta generados a partir del texto estructurado de cada procedimiento del registro Mitos, mediante plantillas y sin intervención de un LLM (configuración `json-all` del dataset `d-michail/mitos-qa`). Los diálogos de entrenamiento se generaron con Qwen3.8-27B. La instantánea del registro corresponde a una descarga del 1-2 de octubre, y el texto se dividió por temas antes de convertirlo en diálogos o pares pregunta-respuesta. No se documenta en la model card el uso de RLHF ni de DPO.

## Capacidades

- Generación de texto conversacional en griego moderno, con plantilla de chat de Qwen3 (turnos de usuario/asistente).
- Respuesta a preguntas sobre procedimientos administrativos: requisitos, documentos, plazos, tasas y pasos de un trámite.
- Formato de respuesta al estilo de las entradas del registro Mitos, con respuestas relativamente extensas (entre 113 y 250 palabras de media según el sistema evaluado en el benchmark del modelo acompañante).
- Funcionamiento en modo cerrado (sin contexto) y en modo RAG, con una plantilla de prompt específica que instruye a responder solo con los contextos numerados `[1]`, `[2]`, ... y a declarar explícitamente cuándo la información es insuficiente.
- Razonamiento de un solo turno orientado a dominio; el modo de pensamiento de Qwen3 está desactivado deliberadamente durante el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del griego.

## Casos de uso

- Atención al ciudadano en portales de e-government: desplegado detrás de un recuperador sobre las fichas del registro, el modelo redacta respuestas en griego a preguntas como "¿qué documentos necesito para renovar el permiso de conducir?". La ventana de 4.096 tokens basta para concatenar varios fragmentos recuperados numerados.
- Generación de borradores de respuestas para funcionarios: el modelo produce textos con la estructura del registro, que un empleado público revisa y publica tras contrastar con el procedimiento en vivo.
- Indexación y resumen de procedimientos: a partir del texto estructurado de una ficha, generar resúmenes en formato pregunta-respuesta para alimentar un buscador o un asistente interno.
- Normalización de lenguaje administrativo: reescribir consultas ciudadanas coloquiales en la terminología del registro (nombre del procedimiento, organismo competente, documentos).
- Evaluación de pipelines RAG: sirve como generador de referencia para medir si la recuperación por fragmentos a nivel de campo aporta ventaja frente a la recuperación por ventanas o por procedimiento completo.
- Investigación en PLN de bajos recursos para griego: punto de partida para comparar técnicas de ajuste (LoRA frente a ajuste completo, distintos rangos) en un dominio administrativo cerrado.
- Prototipos educativos y demos: por su tamaño (1,7 mil millones de parámetros) se puede ejecutar en una GPU de consumo o incluso en CPU cuantizado, lo que facilita demostraciones sin infraestructura dedicada.
- Clasificación o enrutado de consultas ciudadanas hacia el procedimiento correcto, aprovechando el conocimiento del vocabulario del registro.

## Benchmarks y rendimiento

La model card indica explícitamente que este repositorio (modelo fusionado entrenado con todos los procedimientos) **no fue evaluado** en el benchmark, porque las preguntas "no vistas" del conjunto de evaluación provienen de procedimientos que este modelo sí vio. Las cifras siguientes corresponden al modelo acompañante `d-michail/Mitos-Qwen3-1.7B-Process-LoRA`, entrenado sin los 220 procedimientos reservados, sobre 1.933 preguntas de benchmark y con métricas sin juez:

| Sistema | Key-fact recall (base) | Key-fact recall (modelo ajustado) | Token F1 (modelo ajustado) | Palabras (modelo ajustado) |
|---|---|---|---|---|
| Closed-book (sin contexto) | 0.031 | 0.061 | 0.108 | 207 |
| RAG (fragmentos a nivel de campo) | 0.422 | 0.565 | 0.294 | 116 |
| RAG-split (ventanas) | 0.234 | 0.317 | 0.182 | 183 |
| RAG-process (procedimientos completos) | 0.202 | 0.187 | 0.113 | 250 |

La propia model card advierte que el recall de hechos clave favorece las respuestas largas y el token F1 las respuestas cortas, por lo que ambas métricas deben leerse junto a la longitud media de la respuesta. No se publican resultados de MMLU, HumanEval, GSM8K ni de otras suites generales en la información disponible. Las métricas con juez, los otros tamaños de modelo y el protocolo completo quedan pendientes de un artículo cuyo enlace aún no se ha añadido.

## Requisitos de hardware

- Peso de los pesos en bfloat16: aproximadamente 3,44 GB (1.720.574.976 parámetros x 2 bytes); el repositorio completo ocupa 3,5 GB.
- VRAM estimada para inferencia: unos 4 GB en bfloat16/fp16 con una ventana corta; en torno a 1,7 GB en cuantización de 8 bits y menos de 1 GB en 4 bits (estimaciones a partir del número de parámetros; no verificadas con los ficheros publicados, ya que no se distribuyen versiones cuantizadas).
- Cabe sin problema en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090, así como en portátiles con 8 GB de VRAM si se usa precisión reducida o cuantización.
- También es viable en CPU con llama.cpp tras convertir los pesos a GGUF, aunque esa conversión no está publicada por el autor.
- Opciones de despliegue documentadas: `transformers` con `device_map="auto"` y `torch_dtype="bfloat16"`, y vLLM mediante `vllm serve d-michail/Mitos-Qwen3-1.7B-Process` enviando `"chat_template_kwargs": {"enable_thinking": false}`. El repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints compatibles son opciones razonables.
- Latencia y throughput: no disponible en la model card.
- En producción conviene aplicar una penalización por repetición (el ejemplo del autor usa `repetition_penalty=1.05`) o una regla de parada, porque los modelos pequeños pueden entrar en bucles de repetición hasta agotar el límite de tokens.

## Comparativa con modelos similares

No se dispone de datos sobre otros modelos de pregunta-respuesta para la administración pública griega en la información proporcionada, por lo que la comparación se limita a las variantes directamente relacionadas.

| Modelo | Parámetros | Contexto de entrenamiento | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mitos-Qwen3-1.7B-Process (este) | 1.720.574.976 | 4.096 tokens | Los 4.407 procedimientos del registro | CC BY-SA 4.0 | Pesos fusionados en bfloat16 en HuggingFace |
| Mitos-Qwen3-1.7B-Process-LoRA (acompañante, carpeta `holdout/`) | 1.720.574.976 en el modelo base, adaptadores LoRA aparte | 4.096 tokens | Procedimientos sin los 220 reservados | CC BY-SA 4.0 | Adaptadores LoRA; es el modelo con cifras de benchmark publicadas |
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 (mismo orden de magnitud) | Ventana nativa de Qwen3 | Preentrenamiento general multilingüe | Apache 2.0 | Pesos públicos |

La licencia del modelo base (Apache 2.0) es más permisiva que la del ajuste (CC BY-SA 4.0), lo que conviene tener en cuenta al elegir variante para un producto.

## Limitaciones y advertencias

- No es asesoramiento legal: las respuestas no tienen validez jurídica y un sistema desplegado debe mostrar la fuente, la fecha de recuperación y el enlace al procedimiento oficial.
- En modo cerrado (sin recuperación) el modelo aprende el registro y el formato del dominio, pero apenas los hechos: el recall de hechos clave se queda en 0.061 en la evaluación del modelo acompañante. La precisión proviene mayoritariamente de la recuperación.
- Puede afirmar datos concretos incorrectos (importes, plazos, documentos) con la misma seguridad que los correctos.
- Fuga de datos en la evaluación: el modelo de este repositorio vio todos los procedimientos, incluidas las preguntas marcadas como "no vistas" del benchmark, por lo que sus cifras no serían comparables. Las métricas publicadas son las del modelo con retención.
- Los datos de entrenamiento son sintéticos o generados por plantillas a partir de una única instantánea del registro, de modo que pueden reproducir errores y formulaciones del generador.
- El propio registro no garantiza la exhaustividad ni la corrección de su contenido (condiciones de uso de mitos.gov.gr, cláusula A.6), y el modelo hereda esa limitación.
- Caducidad: los procedimientos cambian, y los datos son una instantánea descargada los días 1 y 2 de octubre, por lo que el modelo se queda obsoleto con el tiempo.
- El modelo se entrenó sin prompt de sistema y con el modo de pensamiento desactivado; hay que usar la plantilla de chat de Qwen3 y colocar la pregunta o el prompt de recuperación en el mensaje de usuario.
- Degeneración por repetición: sin penalización ni regla de parada, puede repetir hasta el límite de tokens.
- Idioma: solo griego moderno. No hay soporte documentado de otras lenguas, lo que limita su uso en administraciones multilingües.
- Licencia CC BY-SA 4.0: impone atribución y compartir igual, lo que puede condicionar el uso comercial y la combinación con componentes de licencia incompatible. Exige atribuir al ΜΙΤΟΣ y señalar los cambios realizados sobre los textos del registro.
- Adopción nula registrada en el momento de la consulta (0 descargas y 0 me gusta), por lo que no hay evidencia de uso en producción ni informes de terceros.
- Sesgos: no se documenta ningún análisis de sesgo en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d-michail/Mitos-Qwen3-1.7B-Process
- Modelo acompañante con LoRA: https://huggingface.co/d-michail/Mitos-Qwen3-1.7B-Process-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Texto de la licencia Apache 2.0 de Qwen3 incluido en el repositorio: `LICENSE-Qwen3-Apache-2.0.txt`
- Registro Nacional de Procedimientos Administrativos (ΜΙΤΟΣ): https://mitos.gov.gr
- API de datos abiertos del registro: https://api.mitos.gov.gr/info
- Consulta de un procedimiento por su identificador de 6 dígitos: https://id.mitos.gov.gr/<Mitos ID>
- Artículo asociado: enlace aún no añadido en la model card (no disponible)
- Repositorio de código: no disponible
