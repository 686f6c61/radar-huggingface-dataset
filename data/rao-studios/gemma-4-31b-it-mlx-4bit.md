# rao-studios/gemma-4-31b-it-mlx-4bit

## Resumen

`rao-studios/gemma-4-31b-it-mlx-4bit` es un espejo (mirror) del modelo `mlx-community/gemma-4-31b-it-4bit`, que a su vez es la conversión a formato MLX y cuantización de 4 bits del modelo original `google/gemma-4-31b-it` de Google. El modelo base es un modelo multimodal de imagen-texto-a-texto (image-text-to-text) de 31 273 088 876 parámetros, desarrollado por Google bajo licencia Apache 2.0 y empaquetado para ejecución local en hardware Apple Silicon mediante la librería MLX.

Este repositorio concreto no introduce ninguna modificación técnica sobre los pesos: es una copia byte a byte del repositorio de `mlx-community` en el commit `696d436c404745a59f30e4939a658162b0a9e57f`, con la única adición de esta model card y del texto de la licencia Apache 2.0. Existe para que la aplicación Adverb de Rao Studios pueda fijar un commit concreto y garantizar que cada instalación descarga exactamente los mismos bytes desde un repositorio controlado por el autor.

Su relevancia práctica radica en que permite ejecutar un modelo de 31B parámetros con capacidades multimodales (visión y texto) y una ventana de contexto de 262 144 tokens en un Mac, sin necesidad de GPUs NVIDIA ni de infraestructura en la nube, gracias a la cuantización de 4 bits con tamaño de grupo 64 y al backend MLX optimizado para el hardware unificado de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4`, transformer de 60 capas (según `config.json`) |
| Parametros totales | 31 273 088 876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | 4 bits, tamaño de grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 2 012 tensores, 18,4 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada en `config.json` es `gemma4`, una familia de transformers de 60 capas. El pipeline es `image-text-to-text`, lo que implica que el modelo acepta entradas multimodales (imágenes y texto) y genera texto; el repositorio incluye un `processor_config.json` y un `chat_template.jinja` para gestionar la plantilla de conversación. Los pesos están cuantizados a 4 bits con tamaño de grupo 64, lo que reduce el peso en disco a 18,4 GB distribuidos en cuatro ficheros safetensors.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación posteriores al preentrenamiento. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura `gemma4` y la cuantización MLX. El repositorio es una copia byte a byte del artefacto de `mlx-community`, verificado mediante SHA-256 contra el commit original, sin re-cuantización ni edición de pesos, tokenizer, plantilla de chat o configuración.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (`chat_template.jinja`).
- Procesamiento de imágenes combinadas con texto (pipeline `image-text-to-text`): el modelo puede leer imágenes y responder preguntas sobre ellas.
- Razonamiento sobre contenido visual: según la model card del espejo, se usa para revisar hojas de contacto (contact sheets) de páginas y proponer correcciones.
- Generación de contenido estructurado: HTML, CSS, líneas de tiempo deterministas, pies de foto, guiones de voz en off y traducciones, según el caso de uso declarado por el autor.
- Ventana de contexto muy amplia (262 144 tokens), adecuada para documentos largos y conversaciones extensas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Generación de contenido para redes sociales: el modelo puede planificar un mes de publicaciones y redactar cada página diaria (HTML, CSS y línea de tiempo determinista), junto con pies de foto y guiones de voz en off, directamente en un Mac. La ventana de 262 144 tokens permite mantener el contexto de toda la planificación en una sola sesión.
- Revisión de material visual: al aceptar entradas de imagen, el modelo puede inspeccionar hojas de contacto de páginas generadas y señalar qué corregir, lo que lo hace útil en flujos de control de calidad de diseño.
- Traducción de contenido editorial: la model card menciona explícitamente la generación de traducciones como parte del flujo de trabajo, aprovechando la capacidad de generar texto a partir de contexto largo.
- Asistencia a la redacción técnica en local: con 31B parámetros y contexto de 262 144 tokens, puede resumir documentos extensos o mantener conversaciones de varias vueltas sin salir del equipo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de aplicaciones multimodales en Apple Silicon: al estar en formato MLX con cuantización de 4 bits, sirve para desarrollar y probar pipelines de imagen-texto en Mac antes de desplegarlos en infraestructura mayor.
- Generación de código y artefactos web: la model card indica que produce HTML, CSS y líneas de tiempo deterministas, lo que lo hace apto para generar artefactos web estructurados a partir de especificaciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 18,4 GB en safetensors a 4 bits; en un Mac con memoria unificada, se necesita al menos esa cantidad más el overhead del runtime MLX (el onboarding de Adverb ofrece el modelo según la memoria del Mac).
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (familias M1, M2, M3, M4); no se documentan requisitos para GPUs NVIDIA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: 18,4 GB de pesos encajan en configuraciones con memoria unificada de 24 GB o superior; en GPUs de consumo NVIDIA no se indica compatibilidad con este artefacto MLX concreto.
- Opciones de despliegue: `mlx-lm` (librería declarada), con el comando `mlx_lm.generate --model rao-studios/gemma-4-31b-it-mlx-4bit --prompt "..."`. No se documentan opciones vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rao-studios/gemma-4-31b-it-mlx-4bit` | 31,27 B | 262 144 | 4 bits, grupo 64 | safetensors MLX | Apache 2.0 | Hugging Face (espejo) |
| `mlx-community/gemma-4-31b-it-4bit` | 31,27 B (mismos pesos) | 262 144 | 4 bits, grupo 64 | safetensors MLX | Apache 2.0 | Hugging Face (original) |
| `google/gemma-4-31b-it` | 31 B | no disponible en la búsqueda | pesos originales (sin cuantizar) | Transformers | Apache 2.0 | Hugging Face (oficial) |
| `google/gemma-4-31B` | 31 B | no disponible en la búsqueda | pesos originales | Transformers | no disponible en la búsqueda | Hugging Face (oficial) |

Los tres primeros comparten los mismos pesos subyacentes; las diferencias son de empaquetado (MLX 4 bits frente a pesos originales) y de mantenimiento (espejo con commit fijado frente a repositorio comunitario y oficial). No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un modelo de Google, cabe esperar los sesgos del corpus original, pero no se documentan.
- Riesgo de alucinación: no se documenta una evaluación específica; al ser un modelo generativo de 31B sin datos de benchmarks publicados en esta ficha, debe validarse en producción.
- Limitaciones de contexto o idioma: el contexto es amplio (262 144 tokens), pero los idiomas soportados no están declarados; no se garantiza cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; el espejo incluye el texto de la licencia y declara que el modelo original `google/gemma-4-31b-it` también usa Apache 2.0.
- Caveats para producción: este repositorio es un espejo sin mantenimiento técnico propio; su valor depende de que el commit fijado siga disponible. El formato MLX limita el despliegue a Apple Silicon con `mlx-lm`, y no se documentan alternativas de serving (vLLM, TGI, llama.cpp) para este artefacto. El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/rao-studios/gemma-4-31b-it-mlx-4bit
- Modelo base en MLX: https://huggingface.co/mlx-community/gemma-4-31b-it-4bit
- Modelo original de Google (it): https://huggingface.co/google/gemma-4-31b-it
- Modelo original de Google (base): https://huggingface.co/google/gemma-4-31B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
