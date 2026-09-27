# SoAIHQ/gemma-4-26B-A4B-it-GGUF

## Resumen

SoAIHQ/gemma-4-26B-A4B-it-GGUF es una compilación de cuantizaciones GGUF del modelo multimodal google/gemma-4-26B-A4B-it, publicada por SoAI para su uso con llama.cpp y su propio stack. Se trata de un modelo de arquitectura de mezcla de expertos (MoE) con 25.233.142.046 parámetros totales, de los cuales solo 3,8 B se activan por token, de modo que el coste computacional por token se asemeja al de un modelo de unos 4 B. El modelo acepta texto e imágenes, no procesa audio y admite razonamiento configurable y llamadas a herramientas.

La relevancia de esta ficha radica en que empaqueta un modelo grande de Google en formatos manejables para hardware local: la cuantización Q4_K_M ocupa 16,8 GB y la Q8_0 26,9 GB, además de un proyector multimodal (mmproj) F16 de 1,2 GB necesario únicamente para la entrada de imágenes. El contexto nativo es de 262.144 tokens (256K), lo que lo sitúa en la liga de los modelos de contexto largo.

SoAI justifica la calidad de estas cuantizaciones por el uso de una matriz de importancia (imatrix) calculada sobre un corpus propio de conversaciones multi-turno en 21 idiomas, ediciones de código en 22 lenguajes de programación, llamadas a herramientas y matemáticas paso a paso, todo formateado con la plantilla de chat nativa del modelo. El repositorio no registra descargas ni «likes» en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), 128 expertos con 8 activos por token |
| Parámetros totales | 25.233.142.046 (25,2 B) |
| Parámetros activos | 3,8 B por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | Q4_K_M (16,8 GB), Q8_0 (26,9 GB); proyector multimodal mmproj F16 (1,2 GB) |
| Idiomas soportados | Más de 35 idiomas (preentrenado en más de 140) |
| Licencia | Apache 2.0 (según metadatos); el enlace de licencia apunta a la licencia de Gemma 4 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos (MoE) con 128 expertos, de los que 8 se activan por token. Con 25,2 B de parámetros totales pero solo 3,8 B activos por token, el coste de inferencia por token equivale aproximadamente al de un modelo denso de 4 B, lo que permite desplegarlo en memoria de consumo con una carga computacional moderada. El modelo es multimodal (entrada de texto e imagen) y admite razonamiento configurable («thinking») que se activa o desactiva por petición.

Sobre el entrenamiento del modelo base no se detalla en la información disponible ni el número de tokens ni la composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta esta ficha es el proceso de cuantización: la versión Q4_K_M se cuantiza con una matriz de importancia (imatrix) calculada a partir de un corpus de calibración propio de SoAI —conversaciones multi-turno en 21 idiomas, ediciones de código en 22 lenguajes, llamadas a herramientas y sus resultados, matemáticas paso a paso y prosa web—, formateado con la plantilla de chat del modelo, incluida su sintaxis nativa de tool calling. La Q8_0 se cuantiza sin imatrix porque el formato Q8_0 de llama.cpp no la utiliza.

Antes de publicar, el proceso de construcción verifica que los marcadores de chat, razonamiento y llamadas a herramientas se almacenan como tokens especiales y que la plantilla de chat incrustada coincide con la original; si estos marcadores se importan como texto plano, la conversión se detiene en lugar de publicar el archivo. No se publican cuantizaciones por debajo de 4 bits, ya que, según SoAI, la pérdida de calidad no compensa el ahorro de espacio.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imágenes (pipeline image-text-to-text), que requiere el proyector mmproj F16 cargado con `--mmproj`.
- Razonamiento configurable («thinking»), que se activa o desactiva por petición mediante la plantilla de chat.
- Llamadas a herramientas (tool calling / function calling) con sintaxis nativa.
- Capacidades multilingües: más de 35 idiomas, con preentrenamiento en más de 140.
- Soporte de matemáticas paso a paso (incluido en el corpus de calibración de la imatrix).
- Edición y generación de código en los lenguajes cubiertos por el corpus de calibración (22 lenguajes de programación).
- No procesa audio.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens de ventana, permite mantener diálogos multi-turno con documentos extensos, historiales largos o bases de conocimiento completas sin truncar el contexto.
- Análisis de documentos con imágenes: al aceptar entrada de imagen además de texto, sirve para extraer y razonar sobre capturas, diagramas o documentos escaneados cargando el proyector mmproj.
- Generación y edición de código en pipelines: el soporte nativo de tool calling y la cobertura de 22 lenguajes de programación en su calibración permiten integrarlo en flujos de asistencia a la programación o revisión de parches.
- Agentes con uso de herramientas: la sintaxis nativa de function calling y el razonamiento configurable facilitan tareas de varios pasos en las que el modelo invoca APIs o funciones y encadena resultados.
- Atención al cliente automatizada: la combinación de contexto largo, multilingüismo (más de 35 idiomas) y razonamiento por petición permite gestionar conversaciones con usuarios en distintos idiomas.
- Razonamiento matemático guiado: el modo «thinking» resulta adecuado para problemas que requieren cadena de razonamiento antes de dar la respuesta final, activándolo solo en las peticiones que lo necesitan.
- Despliegue local en hardware de consumo: la cuantización Q4_K_M (16,8 GB) permite ejecutar el modelo en estaciones de trabajo con GPU de gama alta orientadas a consumo, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño de los pesos es de 16,8 GB (Q4_K_M), 26,9 GB (Q8_0) y 1,2 GB adicionales para el proyector mmproj F16 si se usa entrada de imagen. A esta cifra hay que sumar la memoria destinada al contexto, que crece con la longitud configurada.
- La Q4_K_M (16,8 GB) está pensada para «la mayoría de máquinas» según SoAI; la Q8_0 (26,9 GB) es para cuando la memoria disponible lo permite.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño de pesos, la Q4_K_M encaja en GPUs con 24 GB (por ejemplo, una RTX 4090) dejando margen limitado para contexto, mientras que la Q8_0 requiere GPUs de 40 GB o más (por ejemplo, A100 40 GB) o reparto entre varias GPU.
- llama.cpp puede ejecutar el modelo en GPU, en CPU o repartiendo capas entre ambos, por lo que también es viable en configuraciones sin GPU o con VRAM insuficiente.
- Opciones de despliegue: llama.cpp y llama-server de forma nativa (`llama-server -hf SoAIHQ/gemma-4-26B-A4B-it-GGUF:Q4_K_M`); otras herramientas compatibles con GGUF pueden cargar estos archivos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoAIHQ/gemma-4-26B-A4B-it-GGUF (esta ficha) | 25,2 B totales / 3,8 B activos | 262.144 tokens | GGUF (Q4_K_M, Q8_0) | Apache 2.0 según metadatos | HuggingFace (0 descargas en la consulta) |
| google/gemma-4-26B-A4B-it (modelo base) | 25,2 B totales / 3,8 B activos | 262.144 tokens | Pesos originales (16 bits) | Licencia de Gemma 4 | HuggingFace |

No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados que permitan validar el rendimiento de estas cuantizaciones frente a otras.
- Posible riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas al respecto.
- La cuantización introduce pérdida de precisión: Q4_K_M es más pequeña y cómoda de ejecutar, mientras que Q8_0 se acerca más a los pesos originales; la elección implica un compromiso entre memoria y fidelidad.
- Con longitudes de contexto cercanas a los 262.144 tokens, la memoria necesaria para el contexto crece de forma notable y puede superar la capacidad de muchas GPU de consumo.
- La entrada de imágenes exige cargar aparte el archivo mmproj F16 (1,2 GB); sin él, el modelo solo procesa texto.
- El modelo no admite audio.
- Discrepancia de licencia: los metadatos indican Apache 2.0, pero el enlace de licencia apunta a la licencia de Gemma 4. Conviene verificar las condiciones reales antes de un uso comercial.
- El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no existe validación de la comunidad sobre estos archivos.
- No se detalla la composición del dataset de entrenamiento del modelo base ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SoAIHQ/gemma-4-26B-A4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia del modelo base (Gemma 4): https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de SoAI: https://soai.to
