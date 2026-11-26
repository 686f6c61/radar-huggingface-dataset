# peonist-ai/halogen-inkling-2-mini

## Resumen

halogen-inkling-2-mini es una conversión de pesos del modelo Inkling-2-Mini de Thinking Machines Lab, empaquetada en el formato propietario `.hgn` del motor de inferencia halogen, desarrollado por peonist-ai. No se trata de un modelo nuevo, sino de una cuantización específica del modelo base (relación `quantized` respecto a `thinkingmachines/Inkling-2-Mini`) optimizada para ejecutarse en hardware AMD Strix Halo con arquitectura gráfica gfx1151 bajo ROCm. El modelo base es un transformer con mezcla de expertos (MoE) que acepta texto e imágenes y produce texto, con una ventana de contexto nativa de 1.048.576 tokens.

La relevancia de esta ficha radica en que el repositorio no publica pesos en formatos estándar (safetensors, GGUF) sino en un formato cerrado que solo carga el servidor halogen, lo que limita drásticamente su portabilidad. Además, se trata de una preview explícita: el autor declara que no se ha ejecutado ninguna evaluación generativa y que la calidad se reporta únicamente como distancia respecto al modelo original mediante divergencia KL y coincidencia del token más probable, medidas en modo teacher-forced contra una implementación de referencia en fp32.

El repositorio ocupa 18,7 GB e incluye el checkpoint principal, una torre de visión, una cabeza de borrador para decodificación especulativa y el tokenizador original del modelo base. La licencia es Apache-2.0, heredada del modelo de origen, y el autor indica que la conversión es una versión modificada de los materiales del modelo que conserva su licencia y su política de uso aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), con torre de visión y cabeza de borrador (MTP); detalles internos del modelo base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero no se publica el número de parámetros activos) |
| Longitud de contexto | 1.048.576 tokens (contexto nativo del modelo base) |
| Tipos de cuantizacion | Expertos en NVFP4 (capas 0-19, 4 bits con escala por cada 16 valores) y MXFP8 (capas 20-23); proyecciones de atención en enteros de 8 bits; cabeza de salida en enteros de 6 bits; router, tablas de posición relativa, convoluciones cortas y controladores de bucle en BF16; torre de visión en BF16; cabeza de borrador a ~4,5 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hgn` (formato propietario del motor halogen); no carga en transformers, vLLM ni llama.cpp |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, de Thinking Machines Lab, es un transformer con mezcla de expertos que procesa texto e imágenes y genera texto. La model card del repositorio de conversión menciona componentes concretos de la arquitectura: expertos enrutados, un router, tablas de posición relativa, convoluciones cortas y controladores de bucle, además de una torre de visión con su proyector y una cabeza de borrador para decodificación especulativa (multi-token prediction). No se publican en la información disponible el número total de parámetros, el número de parámetros activos, el número de tokens de entrenamiento ni la composición del dataset.

Sobre el proceso de conversión: los expertos enrutados conservan exactamente los valores y escalas del proveedor (NVFP4 en las capas 0 a 19 y MXFP8 en las capas 20 a 23), sin recuantizar. Las cinco proyecciones de atención de cada capa se recodifican a enteros de 8 bits y la cabeza de salida a enteros de 6 bits, con una escala por cada 32 valores y redondeo al más cercano con búsqueda de escala por bloque; el autor identifica este paso como la parte con pérdida de la conversión. El resto de componentes se mantiene en BF16 sin cambios, incluida la torre de visión. En tiempo de ejecución, el motor redondea las entradas de las capas de expertos a 8 bits durante la decodificación y mantiene claves y valores de atención en coma flotante de 16 bits. La cabeza de borrador está reencodada a ~4,5 bits por peso y solo propone tokens que el modelo verifica después, de modo que no altera la salida greedy ni la distribución de muestreo.

## Capacidades

- Generación de texto a partir de entradas de texto e imagen (la entrada de imagen se activa cuando el fichero de visión está junto al checkpoint).
- Contexto nativo de 1.048.576 tokens en máquinas con memoria suficiente.
- Formato propio de llamada a herramientas (tool calling) del modelo base.
- Decodificación especulativa mediante cabeza de borrador (MTP), con verificación de cada token propuesto por el modelo principal.
- Procesamiento de imágenes mediante torre de visión y proyector incluidos en un fichero separado.
- Servicio mediante endpoint compatible con la API de OpenAI en el puerto 8731.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento o "thinking": no disponible en la información proporcionada.

## Casos de uso

- Asistentes locales sobre hardware AMD Strix Halo: el modelo se sirve con el motor halogen en un contenedor Podman o Docker con acceso a `/dev/kfd` y `/dev/dri`, lo que permite desplegar un endpoint compatible con OpenAI en una máquina con GPU integrada gfx1151 sin depender de la nube.
- Procesamiento de documentos largos: con 1.048.576 tokens de contexto, se pueden introducir manuales, expedientes o bases de código completas en una sola petición, siempre que la máquina disponga de memoria suficiente para el checkpoint y la caché de atención.
- Análisis de imágenes con salida textual: la torre de visión incluida permite tareas de descripción, extracción de información o respuesta a preguntas sobre imágenes, cargando el fichero de visión junto al checkpoint.
- Integración en pipelines con tool calling: el modelo conserva el formato nativo de llamada a herramientas del modelo base, lo que facilita conectarlo a orquestadores de agentes que esperen ese formato y servirlo desde el endpoint compatible con OpenAI.
- Inferencia de baja latencia en local: la cabeza de borrador acelera la decodificación sin cambiar la salida greedy, lo que resulta útil en aplicaciones interactivas donde la latencia por token es crítica.
- Evaluación comparativa de cuantizaciones: el repositorio publica medidas de divergencia KL y coincidencia del token más probable frente a una referencia fp32, lo que permite estudiar el impacto de la cuantización NVFP4/MXFP8 en distintos tipos de texto (enciclopedia, código y sesión de agente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generativos en la información disponible. El autor indica explícitamente que no se ejecutó ninguna evaluación de tareas. La única métrica publicada es la distancia respecto al modelo del proveedor, medida como divergencia KL media de la distribución del siguiente token en nats (teacher-forced contra una implementación de referencia en fp32, 2.560 posiciones puntuadas de cada 10.240 tokens de texto), con el porcentaje de posiciones en que coincide el token más probable entre paréntesis:

| Modo | Texto enciclopédico | Código fuente | Sesión de agente |
|---|---|---|---|
| Decodificación (aritmética de este fichero) | 0,0022 (98,0%) | 0,0065 (97,0%) | 0,101 (91,2%) |
| Lectura de prompt (medido con cabeza de salida de 8 bits) | 0,0016 (98,6%) | 0,0054 (97,0%) | 0,092 (92,2%) |

El autor señala que el texto de sesión de agente es el más difícil para todas las aritméticas medidas y que el significado de estas distancias para un uso concreto es una incógnita hasta probarlo.

## Requisitos de hardware

- GPU: exclusivamente AMD Strix Halo con arquitectura gráfica gfx1151; el motor halogen es específico para esta plataforma y no se mencionan otras GPU compatibles.
- VRAM/memoria: el checkpoint principal ocupa 16,5 GiB, la torre de visión 0,6 GiB y la cabeza de borrador 0,2 GiB; el contexto de 1.048.576 tokens requiere una máquina con memoria suficiente, sin cifra concreta publicada.
- Cabe en GPU de consumo: sí, en equipos con APU Strix Halo y memoria unificada suficiente; no se mencionan GPU NVIDIA ni otras GPU de consumo.
- Despliegue: contenedor `ghcr.io/peonist-ai/halogen-flash-server:0.20.7-inkling-preview` ejecutado con Podman o Docker, con paso de dispositivos `/dev/kfd` y `/dev/dri`, `--group-add keep-groups` (o `--group-add video --group-add render` en Docker), `--security-opt seccomp=unconfined`, `--ipc=host` y `--ulimit memlock=-1:-1`.
- Compatibilidad con otros motores: no carga en transformers, vLLM ni llama.cpp.
- Latencia y throughput: no disponibles; la cabeza de borrador se incluye para acelerar la decodificación, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| halogen-inkling-2-mini (esta ficha) | no disponible (MoE) | 1.048.576 | `.hgn` (solo motor halogen) | Apache-2.0 | Hugging Face, preview sin benchmarks generativos |
| thinkingmachines/Inkling-2-Mini (modelo base) | no disponible (MoE) | 1.048.576 | no disponible en la información proporcionada | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- Es una preview, no una release: el autor advierte que no se ejecutó ninguna evaluación generativa y que la calidad solo se describe como distancia respecto al modelo original.
- Los pesos están en formato `.hgn` y no cargan en transformers, vLLM ni llama.cpp; el uso queda atado al motor halogen y a la plataforma AMD Strix Halo (gfx1151).
- La conversión introduce pérdida en las proyecciones de atención (8 bits) y en la cabeza de salida (6 bits); el autor identifica este paso como el lossy de la conversión.
- La distancia medida es mayor en sesiones de agente (KL 0,101 y 91,2% de coincidencia en decodificación) que en texto enciclopédico o código, lo que sugiere mayor degradación en contextos conversacionales complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Riesgo de alucinación y sesgos: no disponibles en la información proporcionada; al tratarse de un modelo de lenguaje, son aplicables los riesgos habituales, pero no se documentan sesgos específicos.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano.
- Licencia Apache-2.0: permite uso comercial, pero el autor indica que la conversión conserva también la política de uso aceptable del modelo base, cuyos términos no se detallan en la información disponible.
- El widget de inferencia del Hub está desactivado deliberadamente porque ningún componente del Hub puede cargar los pesos `.hgn`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/peonist-ai/halogen-inkling-2-mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor de inferencia halogen: https://github.com/peonist-ai/halogen-flash-server
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
