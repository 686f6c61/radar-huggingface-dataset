# burningfeet/backup-2026-09-11-.-Qwen3.5-9B-Uncensored-Genesis-BF16-GGUF

## Resumen

El modelo identificado como burningfeet/backup-2026-09-11-.-Qwen3.5-9B-Uncensored-Genesis-BF16-GGUF es un artefacto alojado en HuggingFace por el usuario burningfeet, con acceso restringido (gated) y sin descargas ni valoraciones registradas en el momento de la consulta. Los metadatos lo describen como un modelo conversacional multimodal de tipo image-text-to-text, etiquetado simultaneamente como GGUF y BF16, y derivado de HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF.

La informacion disponible es internamente contradictoria: el nombre del repositorio alude a "Qwen3.5-9B", mientras que el modelo base declarado es un supuesto "Qwen3.8-27B", y el recuento real de parametros de los tensores safetensors es de 8.953.803.264 (unos 8,95 mil millones). Ademas, la etiqueta "dence" parece una errata de "dense", y la referencia arXiv:1311.0851 (2013) no guarda relacion aparente con un modelo Qwen.

Su relevancia practica es dudosa: se trata de un backup con cero adopcion, sin documentacion tecnica, sin datos de entrenamiento publicados y con indicios de nomenclatura no verificable. No es recomendable evaluarlo como si fuera un lanzamiento oficial de la familia Qwen sin antes confirmar su procedencia con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican "dence", probable errata de "dense", y capacidades multimodales de vision; no se confirma transformer, MoE ni hibrida) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones, segun metadatos de safetensors) |
| Parametros activos | no aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se etiqueta a la vez como GGUF y BF16, sin detallar niveles Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada en los metadatos; el acceso es restringido/gated) |
| Formato de pesos | no confirmado (tag gguf en conflicto con el sufijo BF16 del nombre) |

## Arquitectura y entrenamiento

No se dispone de informacion verificable sobre la arquitectura, el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros). Los unicos indicios son las etiquetas del repositorio, que apuntan a un modelo denso ("dence") con capacidad multimodal de vision y pipeline image-text-to-text, pero no hay ficha tecnica, config.json publico ni paper asociado que lo corrobore.

El modelo se presenta como un derivado cuantizado de HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF. Esta genealogia no es coherente con el recuento de parametros (8,95B frente a los 27B del supuesto modelo base) ni con la denominacion "Qwen3.5", que no se corresponde con ninguna version oficial conocida de la familia Qwen. La etiqueta "MTP" (multi-token prediction) aparece en el nombre del modelo base, pero no hay evidencia de su implementacion en este artefacto.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational".
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), segun los metadatos.
- Ajuste "uncensored": el autor declara la eliminacion o relajacion de filtros de seguridad, lo que implica comportamiento no alineado con las salvaguardas habituales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.
- Modo "thinking", audio u otras capacidades especiales: no disponible.
- Ejecucion en endpoints compatibles: el tag "endpoints_compatible" sugiere compatibilidad con infraestructura de inferencia gestionada, sin mas detalle.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: dado su pipeline conversacional, podria emplearse para generar respuestas multi-turno en entornos de prueba, aunque la ausencia de datos sobre contexto limita su uso en produccion.
- Experimentacion con vision-lenguaje: el pipeline image-text-to-text permitiria probar tareas de descripcion de imagenes o respuesta a preguntas visuales, siempre que se valide primero la arquitectura real del modelo.
- Investigacion sobre desalineacion y seguridad: su caracter "uncensored" lo hace util como objeto de estudio en evaluaciones de robustez de filtros y analisis de sesgos, en entornos controlados.
- Pruebas de cuantizacion GGUF: si el artefacto incluye pesos cuantizados, serviria para medir la degradacion de calidad frente al supuesto BF16 en pipelines locales.
- Sintesis de datos sinteticos: podria generar texto de dominio especifico en ingles para aumentar datasets, con revision humana obligatoria por riesgo de alucinacion.
- Evaluacion comparativa interna: util como linea base secundaria frente a modelos densos de ~9B con licencia permisiva, para medir diferencias de comportamiento.
- Despliegue local con llama.cpp u Ollama: por su tamano (~9B) y formato potencialmente GGUF, cabria en equipos de consumo, aunque la falta de documentacion exige validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones verificables con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de los ~8,95B parametros, estimacion propia y no confirmada por el autor):
  - BF16: aproximadamente 18-20 GB de VRAM.
  - Cuantizacion Q8_0: aproximadamente 10-11 GB.
  - Cuantizacion Q5_K_M: aproximadamente 7-8 GB.
  - Cuantizacion Q4_K_M: aproximadamente 5,5-6,5 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Como referencia generica para este orden de magnitud, una NVIDIA RTX 4090 (24 GB) cubriria BF16 y cuantizaciones mayores.
- Compatibilidad con GPU de consumo: probable en tarjetas de 8 GB o mas si se usa cuantizacion Q4/Q5, aunque sin confirmacion del autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF son plausibles por las etiquetas, pero no estan confirmados; vLLM y TGI requeririan pesos safetensors y una arquitectura identificada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite una comparacion fiable, ya que no se confirma la arquitectura, el contexto ni el rendimiento del modelo, y su supuesto modelo base (27B) no concuerda con el recuento real de parametros (8,95B). Tampoco se han identificado en la busqueda web modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Inconsistencia grave de metadatos: el nombre indica "Qwen3.5-9B", el modelo base declarado es "Qwen3.8-27B" y los tensores suman 8,95B. La procedencia no es verificable.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de poder descargar el modelo.
- Cero adopcion registrada (0 descargas, 0 likes) y sin documentacion tecnica, lo que impide auditar su entrenamiento.
- El ajuste "uncensored" implica la posible eliminacion de salvaguardas de seguridad, con riesgo elevado de generar contenido danino, ofensivo o ilegal.
- Riesgo de alucinacion no cuantificado: al no existir benchmarks ni evaluaciones publicas, no puede estimarse su fiabilidad factual.
- Limitacion idiomatica: solo se declara soporte de ingles, sin garantia de calidad en castellano u otras lenguas.
- Longitud de contexto desconocida, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia: se declara apache-2.0, pero tratandose de un supuesto derivado de otro modelo, la aplicabilidad de dicha licencia a los pesos derivados es cuando menos dudosa y deberia verificarse.
- Formato ambiguo (GGUF y BF16 simultaneamente), lo que puede provocar fallos de carga en los runners de inferencia.
- La referencia arXiv:1311.0851 no parece relacionada con el modelo y no constituye respaldo tecnico alguno.
- La busqueda web no ha devuelto ninguna fuente relevante sobre este modelo; los resultados obtenidos versan sobre Angular Material y son ajenos al objeto de la ficha.
- Para uso en produccion se recomienda descartar este artefacto salvo confirmacion directa del autor sobre arquitectura, entrenamiento y licencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/burningfeet/backup-2026-09-11-.-Qwen3.5-9B-Uncensored-Genesis-BF16-GGUF
- Modelo base declarado: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Referencia arXiv citada en los tags (relacion no confirmada): https://arxiv.org/abs/1311.0851
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
