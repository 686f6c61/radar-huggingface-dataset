# inferencerlabs/Hy4-flash-MLX-Q9s

## Resumen

Hy4-flash-MLX-Q9s es una cuantización de 9 bits del modelo multimodal tencent/Hy4-flash, publicada por el usuario inferencerlabs para su ejecución sobre el framework MLX de Apple Silicon. El modelo original, desarrollado por Tencent, es un modelo image-text-to-text (acepta imagen y texto como entrada y genera texto), lo que lo sitúa en la categoría de modelos de visión-lenguaje conversacionales. Esta build concreta no es un modelo nuevo, sino un artefacto de despliegue optimizado: reduce los pesos a 9 bits y aplica streaming de n-grams desde almacenamiento para rebajar la huella de memoria, con una precisión declarada prácticamente sin pérdida (perplexity 1,20312 frente a 1,20312 del base, y 97,80 % de token accuracy).

La relevancia de esta ficha es doble. Por un lado, documenta una ruta práctica para ejecutar un modelo multimodal de gran tamaño en hardware Apple (M3 Ultra) sin GPUs de datacenter, con tasas de ~25 tokens/s en modo estándar y ~52 tokens/s en generación de código con el motor DFly. Por otro lado, evidencia un ecosistema de cuantización comunitaria muy activo alrededor de MLX, donde terceros publican builds que el autor original no distribuye.

Conviene subrayar desde el inicio que la información disponible es limitada: no se publican parámetros totales, longitud de contexto, composición del dataset ni resultados de benchmarks estándar. Todo lo que sigue se limita a lo que la model card y los metadatos de Hugging Face permiten afirmar, y marca explícitamente como "no disponible" aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/Hy4-flash; pipeline image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 9 bits (Q9) sobre MLX; el autor publica además variantes Q3.5, Q4.5, Q5.5, Q6.5 y Q8.5 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamaño del repositorio | 303,2 GB |
| Modalidad | image-text-to-text (visión + texto) |
| Framework | MLX (versión modificada por el autor para la cuantización) |
| Modelo base | tencent/Hy4-flash |
| Descargas | 459 |
| Likes | 1 |
| Creado / actualizado | 2026-11-20 / 2026-11-21 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base tencent/Hy4-flash en la documentación proporcionada: no consta si es un transformer denso, un mixture-of-experts, un modelo híbrido ni detalles de atención. La model card de esta cuantización se centra exclusivamente en el proceso de compresión y en las métricas de fidelidad, no en la arquitectura subyacente. Lo único verificable es su naturaleza multimodal: el pipeline_tag image-text-to-text indica que acepta pares imagen-texto como entrada y produce texto, lo que implica un codificador visual acoplado a un decodificador de lenguaje, aunque la configuración exacta no está documentada aquí.

Respecto al entrenamiento, tampoco se aportan datos sobre volumen de tokens, composición del corpus, fases de RLHF o DPO, ni innovaciones técnicas del modelo original. La contribución técnica documentada corresponde a esta build: cuantización a 9 bits mediante una versión modificada de MLX, con streaming de n-grams desde disco para reducir el footprint de memoria, y una configuración declarada como "near lossless". La tabla de fidelidad publicada por el autor compara distintas profundidades de cuantización frente al modelo base, con perplexity de 1,20312 tanto en Q9 como en base, y una caída de token accuracy de solo 2,20 puntos porcentuales (97,80 % frente a 100 %).

## Capacidades

- Generación de texto conversacional multi-turno, según el tag "conversational".
- Comprensión de imágenes combinada con texto (image-text-to-text): el modelo puede recibir una imagen junto a una instrucción y producir una respuesta textual.
- Generación de código: la model card reporta explícitamente una prueba de 500 tokens en modo "Coding" con el motor DFly, alcanzando ~52 tokens/s.
- Generación de texto creativo o redacción: se reporta una prueba de 500 tokens en modo "Writing" a ~26 tokens/s con DFly.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`; no se documentan otros idiomas.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional multimodal en local sobre Apple Silicon: el modelo puede gestionar diálogos en los que el usuario adjunta una captura de pantalla, un diagrama o una fotografía y formula preguntas en inglés, ejecutándose íntegramente en un M3 Ultra sin depender de servicios en la nube.
- Análisis de documentación técnica con imágenes: interpretación de diagramas de arquitectura, esquemas de circuitos o capturas de interfaces para responder dudas de desarrollo, aprovechando la modalidad image-text-to-text y el contexto conversacional.
- Generación de código asistida en estación de trabajo: con DFly activado se obtienen ~52 tokens/s en tareas de coding, suficiente para autocompletado interactivo y generación de funciones en un flujo de trabajo de desarrollo individual.
- Redacción y edición de textos en inglés: a ~26 tokens/s en modo Writing, resulta viable para borradores, resúmenes y reescritura de documentos en un entorno de privacidad local.
- Prototipado e investigación en cuantización: la tabla de fidelidad Q3.5–Q9 publicada por el autor sirve como referencia para estudiar el impacto de la profundidad de bits en perplexity y token accuracy sobre modelos multimodales grandes.
- Evaluación comparativa de motores de inferencia: la diferencia medida entre el motor estándar (~25 tokens/s) y DFly (~52 tokens/s en coding) permite caracterizar el rendimiento de distintos backends MLX sobre el mismo hardware y modelo.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse en local con pesos safetensors, encaja en escenarios donde no se permite enviar imágenes o texto a APIs externas, siempre que se acepte el coste de ~163 GiB de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente publica métricas de fidelidad de la cuantización frente al modelo base:

| Cuantizacion (bpw) | Perplexity | Token accuracy | Missed divergence |
|---|---|---|---|
| Q3.5 | 168,0 | 43,45 % | 72,57 % |
| Q4.5 | 1,33593 | 91,65 % | 17,28 % |
| Q5.5 | 1,23437 | 95,05 % | 17,28 % |
| Q6.5 | 1,21875 | 96,65 % | 12,03 % |
| Q8.5 | 1,21875 | 97,65 % | 9,92 % |
| Q9 | 1,20312 | 97,80 % | 9,60 % |
| Base | 1,20312 | 100 % | 0,000 % |

Métricas de rendimiento en hardware declaradas por el autor (M3 Ultra):

| Configuracion | Tarea | Tokens/s | Memoria |
|---|---|---|---|
| Inferencer v2.5.4 | 500 tokens | ~25 | ~163 GiB |
| DFly (coding) | 500 tokens | ~52 | ~163,5 GiB |
| DFly (writing) | 500 tokens | ~26 | ~163,5 GiB |

## Requisitos de hardware

- Memoria estimada: ~163 GiB para la variante Q9 con streaming de n-grams, según la model card; con DFly sube a ~163,5 GiB.
- Hardware de referencia: Apple M3 Ultra, único equipo en el que el autor reporta mediciones.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) ni en Apple Silicon de gama baja; el requisito de memoria excede con holgura cualquier configuración de una sola GPU consumer.
- GPU de datacenter: no se documentan pruebas en A100 (80 GB) ni H100 (80 GB); por el volumen de memoria declarado, tampoco cabría en una sola unidad sin técnicas adicionales de offloading.
- Opciones de despliegue: MLX (framework nativo), con la aplicación Inferencer v2.5.4 y el motor DFly; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es safetensors MLX y no GGUF.
- Latencia y throughput: ~25 tokens/s en modo estándar y hasta ~52 tokens/s en coding con DFly sobre M3 Ultra; no hay mediciones para otras tareas ni otros equipos.
- Almacenamiento: el repositorio ocupa 303,2 GB, por lo que se requiere espacio en disco considerable además de la memoria en uso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto ni benchmarks del modelo base tencent/Hy4-flash, ni de alternativas multimodales comparables, por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-flash-MLX-Q9s | no disponible | no disponible | no disponible | safetensors (MLX) | Cuantización Q9 comunitaria de tencent/Hy4-flash |
| tencent/Hy4-flash | no disponible | no disponible | no disponible | no disponible | Modelo base original |
| Alternativas multimodales | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Licencia no disponible: no consta la licencia de esta build ni la del modelo base, lo que impide determinar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- Modelo únicamente en inglés: el campo de idioma declara `en`; no hay evidencia de soporte para castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; el autor declara explícitamente que los modelos "pueden no ser siempre precisos o contextualmente apropiados" y que el usuario es responsable de verificar la información.
- Artefacto de terceros: inferencerlabs no es el creador ni propietario del modelo; la build puede contener desviaciones respecto al original. La fidelidad declarada (97,80 % de token accuracy) implica que un 2,20 % de tokens diverge del base.
- Requisito de memoria extremo (~163 GiB): excluye su uso en la mayoría de equipos; solo viable en configuraciones Apple de gama muy alta o mediante streaming desde disco, lo que puede introducir latencia adicional.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales publicadas, por lo que el rendimiento real en tareas downstream es desconocido.
- Sin documentación de seguridad: no se detallan sesgos conocidos, filtros de contenido ni evaluaciones de robustez.
- Fecha de creación futura en los metadatos (2026-11-20): conviene tratar las marcas temporales con cautela y verificar la vigencia del repositorio.
- Descargas y likes muy bajos (459 y 1): escasa validación comunitaria; no hay evidencia de que la build haya sido probada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inferencerlabs/Hy4-flash-MLX-Q9s
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Vídeos de demostración: https://youtube.com/xcreate
- Aplicación Inferencer: https://inferencer.com
- Repositorio MLX: https://github.com/ml-explore/mlx
