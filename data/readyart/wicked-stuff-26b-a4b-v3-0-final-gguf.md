# ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v3.0-Final-GGUF es la versión cuantizada en formato GGUF del modelo ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final, un modelo de generación de texto orientado a roleplay conversacional, ficción para adultos y contenido explícito, publicado por el usuario ReadyArt en HuggingFace. El repositorio contiene 25.233.142.046 parámetros totales (unos 25,2 mil millones) según los pesos en safetensors del modelo base, y la nomenclatura «26B-A4B» sigue la convención habitual de los modelos con arquitectura de mezcla de expertos (MoE), en la que se indica el total de parámetros y una cifra aproximada de parámetros activos por token.

El modelo se distribuye exclusivamente en inglés, con etiquetas que lo marcan como `not-for-all-audiences`, `nsfw`, `explicit`, `unaligned`, `ERP`, `Erotic`, `Horror` y `Violence`. No incluye información sobre longitud de contexto, dataset de entrenamiento, proceso de alineación ni resultados de benchmarks en la información disponible. La licencia tampoco está declarada, lo que impide confirmar condiciones de uso comercial.

Su relevancia es acotada y de nicho: cubre la demanda de modelos sin filtros de seguridad para roleplay y narrativa madura, un segmento en el que los modelos alineados comercialmente rechazan contenido explícito. Al estar publicado en GGUF, está pensado para inferencia local mediante llama.cpp u Ollama más que para despliegues en servidor de alto rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la nomenclatura «A4B» sugiere mezcla de expertos con ~4B parámetros activos, sin confirmar en la información proporcionada) |
| Parámetros totales | 25.233.142.046 (≈25,2B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF; el repositorio ocupa 245,3 GB, lo que sugiere varios niveles de cuantización, pero la lista exacta de ficheros no está disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El nombre del modelo, «26B-A4B», replica el patrón de nomenclatura empleado por familias MoE como Qwen3 (por ejemplo, Qwen3-30B-A3B), donde el primer número indica los parámetros totales y el sufijo «A» los parámetros activos por token. El recuento real de safetensors del modelo base (25,2B) es coherente con un modelo de tipo mezcla de expertos de tamaño medio, pero no se confirma en los metadatos ni en la model card disponible (que contiene principalmente CSS y no detalla la arquitectura).

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación. La etiqueta `unaligned` indica explícitamente que el modelo no ha pasado por un proceso de alineación de seguridad orientado a rechazar contenido sensible. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y a mantener personajes consistentes.
- Escritura de ficción para adultos y contenido erótico explícito (etiquetas `ERP`, `Erotic`, `explicit`).
- Narrativa de terror y violencia explícita (etiquetas `Horror`, `Violence`).
- Modo instructivo/conversacional (`instruct`, `conversational`), adecuado para diálogos guiados por system prompt.
- Comportamiento «unaligned»: no aplica rechazos de seguridad sobre contenido para adultos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es `text-generation`.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Plataformas de roleplay conversacional para adultos: el modelo está afinado específicamente para mantener personajes y tramas a lo largo de conversaciones multi-turno, con un tono explícito que los modelos alineados comerciales suelen rechazar. Requiere integrar moderación propia y verificación de edad en la capa de aplicación.
- Ficción interactiva ramificada: sirve como motor de narrativa donde el usuario elige ramas y el modelo genera escenas de terror, violencia o contenido erótico de forma coherente con el estado previo de la historia.
- Diálogo para NPCs en videojuegos para adultos: puede generar respuestas de personajes con personalidad definida por prompt, útil en mods o prototipos de juegos narrativos con contenido mature.
- Asistencia a la escritura de relatos de terror y suspense: generación de borradores de escenas, diálogos y descripciones explícitas para autores que trabajan en el género.
- Red-teaming e investigación sobre alineación: al ser un modelo `unaligned`, permite estudiar comportamientos sin filtros, medir tasas de contenido no deseado y comparar con variantes alineadas en entornos controlados.
- Prototipado de experiencias de entretenimiento para adultos: creación rápida de demos conversacionales con contenido explícito antes de invertir en un modelo propio o en un servicio comercial.
- Generación de contenido para comunidades de fan fiction: borradores de escenas y continuaciones de historias con estilos y personajes predefinidos mediante system prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (25,2B parámetros totales; estimaciones propias a partir del tamaño, no confirmadas por el autor):
  - Cuantización Q4 (≈4,5–5 bits por peso): ≈14–16 GB de VRAM.
  - Cuantización Q5: ≈17–19 GB.
  - Cuantización Q6: ≈20–21 GB.
  - Cuantización Q8: ≈26–28 GB.
  - F16: ≈50 GB.
- Si la arquitectura es MoE con ~4B activos, el coste computacional por token sería notablemente inferior al de un modelo denso de 25B, lo que favorece el throughput en hardware modesto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5 con contexto moderado; RTX 3090 (24 GB) en las mismas condiciones; A100 40 GB o H100 para Q8/F16 y contextos largos.
- Cabe en GPU de consumo: sí, en Q4 con 16–24 GB de VRAM (RTX 4080/4090, RTX 3090, e incluso GPUs de 16 GB con contexto reducido). En configuraciones de VRAM inferior puede recurrirse a offload parcial a RAM.
- Opciones de despliegue: llama.cpp (ruta principal para GGUF), Ollama, LM Studio, text-generation-webui y otros frontends compatibles con GGUF. vLLM y TGI no son la vía natural para GGUF.
- Latencia y throughput: no disponibles. Dependen en gran medida de si la arquitectura es MoE y del número de parámetros activos, dato no confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v3.0-Final | 25,2B | No disponible | No disponible | No disponible | HuggingFace (GGUF) |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32K nativo (extensible) | Apache 2.0 | HuggingFace |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | HuggingFace |
| Llama 3.1 8B (denso, referencia de tamaño inferior) | 8B | 8B | 128K | Llama 3.1 Community License | HuggingFace |

Las comparaciones de rendimiento en benchmarks no son posibles porque el autor no publica resultados y el modelo no aparece evaluado en los datos disponibles. Frente a Qwen3-30B-A3B y Mixtral 8x7B, la diferencia práctica principal es la licencia (no declarada en Wicked-Stuff, Apache 2.0 en los otros) y el propósito (roleplay sin alineación frente a modelos generalistas alineados).

## Limitaciones y advertencias

- Contenido explícito y para adultos: el modelo está etiquetado como `nsfw`, `explicit` y `not-for-all-audiences`; no debe desplegarse en productos accesibles a menores sin verificación de edad y moderación en la capa de aplicación.
- Modelo `unaligned`: no incorpora mecanismos de rechazo de seguridad, por lo que puede generar contenido violento, sexual explícito o potencialmente dañino sin filtros propios.
- Riesgo de alucinación: no se documentan evaluaciones de fiabilidad factual; al ser un modelo de ficción, no es adecuado para tareas que exijan precisión factual.
- Idioma: solo inglés (`en`), sin soporte declarado de castellano ni otros idiomas; el rendimiento en otros idiomas es impredecible.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; esto bloquea su adopción en producción sin aclaración previa del autor.
- Contexto no documentado: se desconoce la ventana máxima, lo que dificulta planificar conversaciones largas o documentos extensos.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente a alternativas, por lo que cualquier decisión debe basarse en pruebas propias.
- Tamaño del repositorio elevado (245,3 GB): requiere espacio en disco considerable y descargas largas; conviene descargar solo el fichero de cuantización necesario.
- Cero descargas y cero likes en el momento de la consulta: modelo muy reciente y sin validación por parte de la comunidad.
- Posible herencia de sesgos del modelo base y del dataset de ajuste, no documentados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v3.0-Final
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
