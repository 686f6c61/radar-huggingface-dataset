# bartowski/mulkzz_RuBio-27B-GGUF

## Resumen

RuBio-27B es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario mulkzz, orientado a educación y biología, y publicado bajo licencia Apache 2.0. El repositorio analizado es la cuantización GGUF realizada por bartowski, un actor habitual en la distribución de pesos cuantizados para llama.cpp, a partir del checkpoint original `mulkzz/RuBio-27B`. El modelo cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones) según los pesos en safetensors, aunque la model card del cuantizador indica 28B para el checkpoint de origen.

La relevancia de esta ficha radica en que documenta una de las pocas alternativas abiertas de tamaño medio con soporte declarado de imagen y texto, decodificación especulativa mediante MTP (multi-token prediction) y calibración imatrix en sus cuantizaciones. El modelo está etiquetado para coreano (`ko`) como único idioma declarado, lo que restringe su utilidad en entornos en castellano sin una evaluación previa.

La información pública disponible es limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca explícitamente como no disponibles aquellos que no aparecen en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; transformer con proyección multimodal, detalles no publicados) |
| Parámetros totales | 27.320.697.856 (27,3B; la model card indica 28B para el checkpoint de origen) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS (lista truncada en la información disponible) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones llama.cpp); el checkpoint base se distribuye en safetensors |
| Tamaño del repo | 446,8 GB |
| Versión de llama.cpp usada | b12074 |
| Calibración | imatrix |
| Decodificación especulativa | sí, mediante MTP (multi-token prediction) |
| Compatibilidad de despliegue | llama.cpp, vLLM, endpoints compatibles |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Los metadatos indican que se trata de un modelo multimodal con pipeline `image-text-to-text`, lo que implica un codificador visual y un proyector hacia el espacio de tokens del modelo de lenguaje, distribuido junto a un fichero `mmproj` para el procesamiento de imágenes en llama.cpp. El recuento de parámetros (27,3B en safetensors) y la presencia de decodificación especulativa mediante MTP sugieren una arquitectura transformer con cabezas de predicción multi-token, aunque no se confirma el diseño exacto ni si emplea atención lineal o mecanismos híbridos.

Tampoco se publican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Las etiquetas del repositorio (`education`, `biology`, `feedback`) apuntan a un ajuste orientado a dominios educativos y biológicos, y el formato de prompt incluye un bloque de sistema con instrucciones de "reasoning effort is set to xhigh", lo que indica un modo de razonamiento explícito con etiquetas `<think>`. La única innovación técnica documentada con certeza es la cuantización con imatrix y el soporte de MTP para decodificación especulativa en las versiones GGUF.

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat basado en `<|im_start|>` y `<|im_end|>`.
- Procesamiento de imágenes junto con texto (image-text-to-text), requiriendo el fichero `mmproj` para su uso en llama.cpp.
- Modo de razonamiento explícito: el prompt de sistema activa un esfuerzo de razonamiento "xhigh" y el modelo emite bloques `<think>` antes de la respuesta final.
- Soporte de tool calling / function calling mediante un formato XML específico con etiquetas `<tool_call>`, `<function=...>` y `<parameter=...>`.
- Capacidad de razonamiento multi-paso gracias al modo de pensamiento previo a la respuesta.
- Especialización declarada en educación y biología, según las etiquetas del repositorio.
- Capacidades multilingües limitadas al coreano según el campo `language` de la model card.
- Compatibilidad con vLLM y con endpoints compatibles con la API de OpenAI, según las etiquetas.

## Casos de uso

- Tutoría educativa en coreano: el modelo puede mantener diálogos multi-turno con explicaciones razonadas gracias a su modo `<think>`, adecuado para asistencia en asignaturas de biología y ciencias naturales en entornos educativos coreanohablantes.
- Análisis de imágenes de material didáctico: con el fichero `mmproj`, puede procesar diagramas, láminas anatómicas o figuras de libros de texto y generar explicaciones textuales asociadas.
- Asistente de estudio con razonamiento verificable: el bloque de pensamiento previo permite auditar el razonamiento del modelo antes de la respuesta final, útil en plataformas de aprendizaje que requieren trazabilidad.
- Integración en pipelines de agentes con tool calling: el formato XML documentado permite conectar el modelo a funciones externas (por ejemplo, consultas a bases de datos biológicas) en flujos multi-paso.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (17,44 GB) y Q5_K_M (20,92 GB) permiten ejecución en GPUs de consumo con 24 GB de VRAM mediante llama.cpp.
- Generación de material de feedback educativo: la etiqueta `feedback` sugiere uso en la generación de comentarios correctivos o evaluaciones formativas sobre respuestas de estudiantes.
- Prototipado de investigación en modelos multimodales de tamaño medio: al ser Apache 2.0, sirve como base para experimentos de ajuste fino y evaluación comparativa sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: bf16 requiere aproximadamente 54,66 GB de pesos (más overhead de contexto y del proyector visual); Q8_0 unos 29,12 GB; Q6_K_L 24,96 GB; Q5_K_M 20,92 GB; Q4_K_M 17,44 GB; Q4_K_S 16,36 GB.
- GPU recomendadas: para bf16, A100 80 GB o H100 80 GB; para Q8_0, A100 40 GB o H100; para Q6_K y Q5_K, RTX 4090 (24 GB) o A6000 (48 GB); para Q4_K_M y Q4_K_S, RTX 4090, RTX 3090 o RTX 4080 con 16-24 GB.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 dentro de GPUs de 16-24 GB; las cuantizaciones Q6 y superiores requieren 24 GB o más.
- Opciones de despliegue: llama.cpp (versión b12074 o superior recomendada por el cuantizador), vLLM, endpoints compatibles con la API de OpenAI y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles. El soporte de decodificación especulativa mediante MTP puede reducir la latencia de generación, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Idiomas declarados | Disponibilidad |
|---|---|---|---|---|---|---|
| RuBio-27B (esta ficha) | 27,3B | no disponible | Sí (image-text-to-text) | Apache 2.0 | coreano | GGUF en HuggingFace |
| Alternativas de ~27B con visión | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con modelos alternativos de la misma categoría. Se recomienda evaluar el modelo frente a otros image-text-to-text de tamaño similar antes de adoptarlo en producción.

## Limitaciones y advertencias

- Idioma: el único idioma declarado es el coreano; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, lo que impide estimar su calidad relativa.
- Contexto desconocido: se desconoce la longitud máxima de contexto, un factor crítico para casos de uso con documentos largos o conversaciones extensas.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios científicos donde la verificación es esencial.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento centrado en coreano y en dominios educativos puede introducir sesgos culturales y de dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas en la model card del cuantizador; conviene verificar el repositorio original `mulkzz/RuBio-27B`.
- Dependencia del proyector visual: el soporte de imágenes requiere descargar y configurar el fichero `mmproj`; sin él, el modelo funciona solo como text-to-text.
- Formato de tool calling propietario: el esquema XML de llamadas a funciones no es estándar y requiere adaptación en frameworks de agentes.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/mulkzz_RuBio-27B-GGUF
- Modelo base: https://huggingface.co/mulkzz/RuBio-27B
- llama.cpp (release b12074): https://github.com/ggml-org/llama.cpp/releases/tag/b12074
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
