# lhpku20010120/Omni-Edu-27B-GGUF

## Resumen

Omni-Edu-27B es un modelo multimodal de tipo imagen-texto-a-texto orientado al ámbito educativo, desarrollado por el equipo OmniEdu (publicado bajo el identificador `lhpku20010120`). Esta ficha concreta corresponde a la versión cuantizada en formato GGUF del modelo original `Omni-Edu-27B`, convertida y cuantizada con llama.cpp para su ejecución local eficiente. El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 27B) y se etiqueta internamente como `qwen3_5`, lo que sugiere una arquitectura derivada de la familia Qwen 3.5.

La relevancia de esta release radica en que permite desplegar un modelo de 27B con capacidades de visión en hardware de consumo mediante cuantizaciones de 4, 6 y 8 bits, manteniendo la licencia Apache 2.0 del modelo original, que autoriza explícitamente el uso comercial, el autoalojamiento y el ajuste fino para distintos currículos educativos. El repositorio GGUF ocupa 122 GB en total e incluye un proyector multimodal separado (`mmproj`) necesario para el procesamiento de imágenes.

No se dispone de información publicada sobre la longitud de contexto nativa del modelo base, los idiomas soportados ni los detalles del dataset de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto-a-texto); etiquetado como `qwen3_5`, detalles no disponibles |
| Parámetros totales | 26.895.998.464 (~27B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantización | BF16 (sin cuantizar), Q8_0, Q6_K, Q4_K_M; proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector `mmproj` en GGUF F16 |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que acepta entradas de imagen y texto y genera texto (`pipeline_tag: image-text-to-text`). La etiqueta `qwen3_5` en los metadatos apunta a una base arquitectónica de la familia Qwen 3.5, aunque la model card no detalla la configuración de capas, mecanismos de atención ni el diseño del proyector visual. El paquete incluye un fichero `mmproj-OmniEdu-27B-F16.gguf` compartido por las cuatro cuantizaciones, que actúa como codificador/proyector de imágenes en precisión F16.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card menciona un modo de razonamiento desactivable mediante el flag `--reasoning off` en llama-server, lo que indica que el modelo incorpora algún mecanismo de razonamiento explícito, pero se desconoce su funcionamiento interno.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Procesamiento de imágenes combinadas con texto (image-text-to-text) mediante el proyector `mmproj`.
- Orientación educativa declarada (tags `omniedu`, `education`), presumiblemente con ajuste para tareas de tutoría y explicación.
- Modo de razonamiento activable/desactivable (`--reasoning off` en el ejemplo de llama-server).
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`), lo que permite integrarlo con clientes como Cherry Studio apuntando a `http://127.0.0.1:8080/v1`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades de audio: no disponibles.

## Casos de uso

- Tutoría educativa autoalojada: el modelo puede desplegarse en servidores propios con llama-server y atender conversaciones multi-turno de estudiantes, aprovechando la licencia Apache 2.0 que permite ofrecer servicios de tutoría de pago sin aprobación adicional del equipo OmniEdu.
- Resolución de ejercicios a partir de imágenes: gracias al proyector multimodal, un estudiante puede subir una foto de un problema de matemáticas o un diagrama y recibir una explicación textual; el `mmproj` F16 compartido garantiza coherencia entre cuantizaciones.
- Asistente de estudio en local para privacidad: la cuantización Q4_K_M (15,41 GiB) permite ejecutar el modelo en una GPU de consumo de 24 GB, manteniendo los datos del alumnado en la máquina sin enviarlos a la nube.
- Generación de material didáctico: el modelo puede redactar explicaciones, resúmenes y preguntas de evaluación a partir de apuntes o capturas de libro, integrándose en pipelines de creación de contenido educativo.
- Ajuste fino por currículo: la licencia permite modificar y reentrenar el modelo para currículos regionales o asignaturas concretas, partiendo de la versión BF16 o cuantizada según los recursos disponibles.
- Integración en herramientas de escritorio: la compatibilidad con la API OpenAI y con clientes como Cherry Studio facilita incorporar el modelo a aplicaciones de escritorio para docentes, con razonamiento desactivable para reducir latencia en consultas simples.
- Despliegue en infraestructura modesta: la versión Q6_K (20,57 GiB) o Q8_0 (26,63 GiB) permite equilibrar calidad y VRAM en GPUs de 24-32 GB para entornos de laboratorio o departamentos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV):
  - Q4_K_M: ~15,41 GiB.
  - Q6_K: ~20,57 GiB.
  - Q8_0: ~26,63 GiB.
  - BF16: ~50,11 GiB.
  - Añadir el `mmproj` F16 (tamaño no indicado) y la caché KV correspondiente al contexto configurado.
- GPU recomendadas:
  - Q4_K_M: RTX 4090 (24 GB) o RTX 3090, con margen para contexto moderado.
  - Q6_K: GPU de 24-32 GB (RTX 4090 ajustada, A6000, L40S).
  - Q8_0: A100 40 GB, L40S 48 GB o H100.
  - BF16: A100 80 GB o H100 80 GB.
- ¿Cabe en GPU de consumo? Sí, la cuantización Q4_K_M cabe en GPUs de 24 GB; las versiones Q6_K y Q8_0 requieren GPUs profesionales o de mayor VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`), con compatibilidad de endpoints OpenAI; clientes como Cherry Studio. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base (contexto, idiomas, configuración) que permitan una comparación rigurosa con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Omni-Edu-27B-GGUF | ~27B | no disponible | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo, por lo que se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos; en contexto educativo, las explicaciones y soluciones deben verificarse antes de usarse con estudiantes.
- No se documentan los idiomas soportados; el rendimiento en castellano no está garantizado ni medido.
- La longitud de contexto nativa no está publicada; el ejemplo de la model card usa 8192 tokens, que puede ser insuficiente para documentos largos.
- El modo de razonamiento debe desactivarse explícitamente (`--reasoning off`) si se busca baja latencia; su comportamiento por defecto no está documentado.
- Aunque la licencia Apache 2.0 permite uso comercial, la redistribución exige incluir la licencia, conservar la atribución y el fichero NOTICE, e identificar modificaciones.
- La licencia del modelo no cubre los datasets de entrenamiento ni sus materiales fuente, que se distribuyen por separado.
- El repositorio ocupa 122 GB; descargar todas las cuantizaciones no es necesario, pero conviene planificar el almacenamiento.
- El proyector `mmproj` es obligatorio para entrada de imágenes; sin él, el modelo solo procesa texto.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/lhpku20010120/Omni-Edu-27B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
