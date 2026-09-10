# mobilint/Qwen2.5-0.5B-Instruct-regulus-rb-usb

## Resumen

El repositorio `mobilint/Qwen2.5-0.5B-Instruct-regulus-rb-usb` contiene una compilación del modelo Qwen2.5-0.5B-Instruct optimizada para el hardware NPU de Mobilint. No se trata por tanto de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor (Mobilint) empaqueta los pesos del modelo base de Alibaba Qwen y los adapta a su pila de aceleración propietaria, de modo que solo resulta utilizable dentro de ese entorno. El repositorio declara la relación `base_model_relation: quantized`, lo que indica que los pesos han sido transformados respecto al original, aunque no se especifica el esquema de cuantización empleado.

El modelo subyacente es un transformer decoder-only denso de aproximadamente 494 millones de parámetros, con 32.768 tokens de contexto en su versión original, entrenado por Qwen sobre unos 18 billones de tokens y afinado con instrucciones. Su interés práctico radica en su tamaño reducido: es un candidato natural para asistentes conversacionales en dispositivo, clasificación de intenciones y tareas de generación breve en entornos con recursos limitados, donde no se quiere depender de la nube.

La relevancia de esta ficha concreta es limitada pero específica: quien trabaje con aceleradores de Mobilint (la gama Regulus, según sugiere el nombre del artefacto, en factor de forma USB) encontrará aquí un modelo listo para su stack. Fuera de ese ecosistema, el repositorio no aporta ventajas frente al modelo base publicado por Qwen. El repositorio no incluye model card técnica, benchmarks ni especificaciones de despliegue más allá de la nota genérica del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Qwen2.5) con atención de consultas agrupadas (GQA), compilado para NPU de Mobilint; los detalles de la adaptación no están publicados |
| Parámetros totales | 136.134.656 según los metadatos de safetensors del repositorio; esta cifra coincide exactamente con la matriz de embeddings del modelo base (151.936 × 896), por lo que probablemente no refleja el total real. El modelo base declara unos 494 millones de parámetros |
| Parámetros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible para este artefacto; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantización | No disponible; el repositorio se marca como `quantized` respecto al modelo base, sin especificar esquema ni precisión |
| Idiomas soportados | Inglés (`en`) según los metadatos del repositorio |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con `custom_code` (requiere la librería `mobilint` y `trust_remote_code`) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Librería | mobilint |
| Tamaño del repositorio | 1,3 GB |
| Pipeline | text-generation |
| Fecha de creación (metadatos) | 2026-09-10 |

## Arquitectura y entrenamiento

El artefacto no documenta ni arquitectura propia ni proceso de entrenamiento. Se trata de un derivado del modelo Qwen2.5-0.5B-Instruct, que es un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y atención con consultas agrupadas (14 cabezas de atención y 2 cabezas clave-valor, con dimensión oculta de 896 y 24 capas). Qwen entrenó la familia Qwen2.5 sobre aproximadamente 18 billones de tokens y aplicó un pipeline de alineación con aprendizaje supervisado y optimización por preferencias para la variante Instruct. Ninguno de estos datos aparece en el repositorio de Mobilint; se corresponden con la documentación pública del modelo base.

La innovación que justifica este repositorio es exclusivamente de despliegue: el modelo ha sido compilado y optimizado para el hardware NPU de Mobilint, presumiblemente mediante cuantización y grafo estático adaptado al acelerador. No se publican detalles sobre el número de bits, el algoritmo de cuantización, la técnica de calibración, el soporte de operaciones ni el formato binario resultante. Tampoco hay información sobre decodificación especulativa, atención lineal ni ninguna otra optimización de inferencia. Cualquier evaluación de rendimiento real de este artefacto exige acceso al hardware de Mobilint, que no es un requisito cubierto por la documentación disponible.

## Capacidades

El repositorio no enumera capacidades específicas. Las que se listan a continuación corresponden al modelo base Qwen2.5-0.5B-Instruct y deben considerarse no verificadas para este artefacto compilado:

- Generación de texto conversacional en inglés, con formato de chat basado en turnos.
- Seguimiento de instrucciones sencillas: resumen, reescritura, extracción de datos y clasificación de texto.
- Generación de código básico en lenguajes comunes, con calidad limitada por el tamaño del modelo.
- Razonamiento aritmético elemental y problemas de varios pasos simples; el modelo base es propenso a errores en cadenas de razonamiento largas.
- Soporte multilingüe en el modelo base (29 idiomas declarados por Qwen), pero este repositorio declara únicamente inglés.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso estructurado. Qwen2.5-Instruct sí incorpora plantillas para ello en su formato de chat, pero su funcionamiento a través de la compilación de Mobilint no está confirmado.
- No hay capacidades de visión, audio ni modo de razonamiento explícito (*thinking mode*).

## Casos de uso

- Asistente conversacional embebido sin conexión: un dispositivo con acelerador de Mobilint puede ejecutar el modelo localmente para responder consultas breves en inglés, evitando enviar datos del usuario a la nube y eliminando la latencia de red.
- Enrutado de intenciones en un sistema mayor: con 0,5 B de parámetros, el modelo es adecuado para clasificar la intención de una consulta entrante y derivarla al servicio correspondiente, actuando como primera capa de un pipeline de atención al cliente.
- Preprocesado y normalización de texto en pipelines de datos: limpieza, reformateo de campos y extracción de entidades simples antes de pasarlas a un modelo mayor, aprovechando el bajo coste por inferencia del modelo pequeño.
- Generación de resúmenes cortos en aplicaciones de campo: actas de reunión breves, notas de incidencias o titulares, en escenarios donde el dispositivo opera de forma autónoma y con conectividad intermitente.
- Prototipado de productos con NPU: validar la pila de aceleración de Mobilint y medir latencia y consumo antes de decidir si se escala a modelos mayores de la misma familia.
- Filtrado y moderación preliminar de texto generado por usuarios: detección de contenido fuera de política en inglés como paso previo a la revisión humana, dado que el coste de un falso negativo se compensa con un segundo filtro.
- Juguetes educativos y robots de escritorio: diálogo de turnos cortos con vocabulario controlado, donde la ventaja es el consumo energético del NPU frente a una GPU.
- Evaluación comparativa de cuantización: usar este artefacto como referencia para medir la degradación introducida por la compilación frente al modelo base en tareas concretas de inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de latencia o throughput, y los resultados de búsqueda web facilitados no contienen información relevante sobre el modelo (corresponden a documentación de Google Maps y no guardan relación con la ficha).

## Requisitos de hardware

- Este artefacto está compilado específicamente para hardware NPU de Mobilint. No se publican requisitos de VRAM, GPU compatibles ni condiciones de ejecución; fuera de la pila de Mobilint probablemente no sea cargable.
- Como referencia, el modelo base Qwen2.5-0.5B-Instruct en precisión FP16 ocupa aproximadamente 1 GB de memoria, y en cuantización de 4 bits baja a unos 0,5 GB.
- Ese tamaño permite ejecutar el modelo base en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso GPU integradas con 4 GB de memoria compartida. También es viable en CPU con llama.cpp para tareas de baja concurrencia.
- Opciones de despliegue para el modelo base: transformers, vLLM, llama.cpp, Ollama y TGI. Para este artefacto concreto, únicamente la librería `mobilint` con `trust_remote_code=True`.
- No hay datos publicados de latencia (tokens por segundo), throughput por lote ni consumo energético, ni para el artefacto compilado ni para el modelo base en esta ficha.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus respectivas model cards públicas y no se han verificado en esta ficha. No se dispone de comparación de benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Formato y despliegue | Idiomas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-regulus-rb-usb | ~0,49 B (136 M reportados en safetensors) | No disponible (32.768 en el base) | Apache 2.0 | safetensors + custom code, NPU Mobilint | Inglés |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Apache 2.0 | safetensors, GGUF, transformers | 29 idiomas |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | safetensors, GGUF, transformers | 29 idiomas |
| SmolLM2-360M-Instruct | 0,36 B | 8.192 | Apache 2.0 | safetensors, GGUF, transformers | Inglés principalmente |

La diferencia clave de este repositorio frente a las alternativas no es de calidad ni de tamaño, sino de destino de despliegue: es el único de la tabla pensado para un NPU propietario. Si el objetivo es ejecutar en GPU o CPU convencional, el modelo base o Qwen2.5-1.5B-Instruct ofrecen más contexto, más idiomas y un ecosistema de herramientas mucho más amplio.

## Limitaciones y advertencias

- Con 0,5 B de parámetros, el riesgo de alucinación en preguntas factuales es alto. No debe usarse como fuente de verdad sin verificación externa.
- El modelo base es especialmente débil en razonamiento multi-paso, matemáticas complejas y generación de código no trivial.
- El repositorio declara únicamente inglés; no hay evidencia de que la compilación preserve el soporte multilingüe del modelo original.
- La discrepancia entre los 136.134.656 parámetros reportados en safetensors y los ~494 millones del modelo base debe aclararse antes de integrar el artefacto en producción: es posible que el recuento corresponda solo a una parte de los tensores.
- No hay benchmarks ni validación por parte de la comunidad: el repositorio registra 0 descargas y 0 *likes* en el momento de redactar esta ficha.
- Requiere `trust_remote_code=True` y la librería `mobilint`, lo que implica ejecutar código de terceros. Conviene auditar el código personalizado antes de usarlo en entornos sensibles.
- Dependencia de hardware propietario: la portabilidad a otras plataformas es prácticamente nula, lo que crea un riesgo de cautividad tecnológica.
- La licencia Apache 2.0 cubre los pesos heredados del modelo base, pero no aclara las condiciones de uso de la pila de compilación y ejecución de Mobilint. Verifique los términos del SDK del fabricante antes de un despliegue comercial.
- No se documentan sesgos concretos, pero al tratarse de un modelo entrenado mayoritariamente con datos en inglés y chino, es esperable un sesgo cultural y lingüístico en contextos no anglosajones.
- No hay información sobre el comportamiento del modelo ante entradas adversarias ni sobre si la cuantización degrada el filtrado de contenido del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobilint/Qwen2.5-0.5B-Instruct-regulus-rb-usb
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- Sitio web de Mobilint: https://mobilint.com
- Repositorio de modelos de Mobilint (mblt-model-zoo): https://github.com/mobilint/mblt-model-zoo
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Las referencias devueltas corresponden a documentación de Google Maps y son ajenas a esta ficha.
