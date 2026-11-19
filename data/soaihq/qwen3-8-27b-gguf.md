# SoAIHQ/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo denso de 27.320.697.856 parámetros desarrollado por Qwen (Alibaba) que combina entrada de imagen y texto con una ventana de contexto de 262.144 tokens y razonamiento de profundidad ajustable. Esta ficha documenta la cuantización GGUF publicada por SoAIHQ, pensada para ejecución local con llama.cpp y con un servidor compatible con la API de OpenAI.

La relevancia de esta versión GGUF está en el proceso de cuantización: los ficheros Q4_K_M se generan con una importance matrix (imatrix) calculada sobre un corpus propio de conversaciones multi-turno, edición de código, llamadas a herramientas y matemáticas paso a paso, formateado con la plantilla de chat nativa del modelo, incluida su sintaxis de tool calling. Esto permite ejecutar un modelo multimodal de 27B con contexto largo en hardware de consumo, algo que con los pesos originales en 16 bits (46,8 GB de repositorio) resulta inviable en la mayoría de equipos.

El modelo base emplea una arquitectura híbrida Gated DeltaNet + atención, soporta 201 idiomas y dialectos, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. La cuantización va firmada por SoAIHQ y declara compatibilidad con endpoints y llama.cpp v0.5.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, híbrida Gated DeltaNet + atención |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (16,8 GB), Q8_0 (29,0 GB); mmproj F16 (927,6 MB) para visión. El autor no publica cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros con una arquitectura híbrida que combina capas Gated DeltaNet con capas de atención clásica. Esta mezcla busca reducir el coste computacional y de memoria en secuencias largas manteniendo la calidad de recuperación de información, lo que hace viable la ventana de 262.144 tokens. El modelo procesa texto e imágenes (pipeline image-text-to-text) mediante un proyector multimodal independiente, distribuido en el repositorio como `mmproj-Qwen3.8-27B-f16.gguf`.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. Sí se documenta que el modelo incorpora razonamiento activado por defecto con profundidad configurable mediante el parámetro `reasoning_effort` (`low`, `medium`, `xhigh`), y que puede desactivarse con `enable_thinking: false`.

En cuanto a la cuantización, SoAI aplica imatrix a Q4_K_M para asignar mayor precisión a los pesos con más impacto en la salida, calibrando con conversaciones multi-turno en 21 idiomas, ediciones de código en 22 lenguajes de programación, llamadas a herramientas con sus resultados, matemáticas paso a paso y prosa web. Antes de cuantizar, el pipeline verifica que los marcadores de chat, thinking y tool calling se almacenen como tokens especiales y que la plantilla de chat embebida coincida con la original; si la conversión los importa como texto plano, el build se detiene. Q8_0 se genera sin imatrix porque el formato de llama.cpp no lo admite. El fichero de imatrix se publica en el repositorio junto con una tabla de procedencia que fija la revisión original y el commit de llama.cpp para reproducir la build.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Entrada de imágenes (image-text-to-text) mediante el proyector mmproj cargado con `--mmproj`.
- Razonamiento explícito con modo thinking activado por defecto y profundidad ajustable (`low`, `medium`, `xhigh`).
- Tool calling / function calling con sintaxis nativa incluida en la plantilla de chat.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Capacidad de edición y generación de código, reforzada en la calibración de la cuantización con 22 lenguajes de programación.
- Razonamiento matemático paso a paso.
- No soporta audio.
- Compatible con la API de OpenAI a través de `llama-server`, lo que facilita la integración en herramientas existentes.

## Casos de uso

- Asistente de código en local: el modelo puede generar y editar código en múltiples lenguajes y ejecutarse con llama.cpp en una estación de trabajo, sin enviar código propietario a servicios externos. La calibración de la imatrix con ediciones de código en 22 lenguajes favorece la calidad en este dominio.
- Análisis de documentos largos con imágenes: con 256K de contexto y entrada visual, permite procesar informes extensos, contratos o manuales técnicos que incluyan diagramas y tablas, y responder preguntas sobre su contenido en una sola pasada.
- Agentes con tool calling: la sintaxis nativa de llamadas a herramientas y la compatibilidad con la API de OpenAI permiten integrar el modelo en bucles de agente multi-paso que consulten APIs, bases de datos o sistemas internos.
- Atención al cliente automatizada: la ventana de 256K permite mantener conversaciones multi-turno con historial extenso y documentación de soporte adjunta, y el modo no-thinking con `temperature` 0.7 reduce la latencia en respuestas rutinarias.
- Razonamiento matemático y análisis técnico: el modo thinking con `reasoning_effort` ajustable permite elegir entre respuestas rápidas (`low`) o cadenas de razonamiento profundas (`xhigh`) para problemas de cálculo, verificación de resultados o análisis financiero.
- Procesamiento multilingüe: con 201 idiomas declarados, es adecuado para traducción, localización y atención al cliente en mercados con varios idiomas, ejecutándose en infraestructura propia.
- Despliegue en entornos con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutarse íntegramente en local con llama.cpp, encaja en organizaciones que no pueden enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 16,8 GB para los pesos, más memoria adicional para el contexto, que crece con la longitud configurada. Para contextos largos conviene reservar varios GB extra.
- VRAM estimada para Q8_0: aproximadamente 29,0 GB para los pesos, más contexto.
- Visión: añadir 927,6 MB del proyector mmproj F16 cuando se use entrada de imagen.
- GPU recomendadas: para Q4_K_M, tarjetas con 24 GB (RTX 3090, RTX 4090) o superiores; para Q8_0, A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, Q4_K_M en RTX 3090/4090 con 24 GB, ajustando la longitud de contexto; también es posible repartir capas entre GPU y CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con servidor integrado de chat y API compatible con OpenAI. El repositorio está etiquetado como compatible con endpoints. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato local |
|---|---|---|---|---|---|
| Qwen3.8-27B (esta cuantización GGUF) | 27,3B densos | 262.144 | Sí (imagen) | Apache 2.0 | GGUF Q4_K_M / Q8_0 |
| Qwen3.8-27B (pesos originales) | 27,3B densos | 262.144 | Sí (imagen) | Apache 2.0 | safetensors |
| Alternativas de 27B-30B densos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks para esta cuantización, por lo que no es posible cuantificar la degradación de calidad frente a los pesos originales más allá de la afirmación del autor de que Q4_K_M se mantiene cerca del original.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos en 16 bits; para tareas sensibles conviene usar Q8_0 si la memoria lo permite.
- Riesgo de alucinación inherente a los modelos generativos; el modo thinking por defecto (`reasoning_effort: xhigh`) incrementa el consumo de tokens y la latencia, y puede producir cadenas de razonamiento largas que deben validarse.
- El modo thinking está activado por defecto; en producción conviene desactivarlo o reducirlo (`low`/`medium`) para controlar coste y latencia.
- La lista de 201 idiomas proviene de la model card del autor; no se detallan los niveles de calidad por idioma.
- El soporte de audio no está incluido.
- La entrada de imágenes requiere cargar el fichero mmproj por separado; sin él, el modelo solo procesa texto.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base enlazado por el autor.
- El repositorio tiene un tamaño de 46,8 GB y solo 1 like en el momento de la consulta, con 2.329 descargas; es una cuantización de terceros, no oficial de Qwen.
- No se documentan opciones de despliegue distintas de llama.cpp en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SoAIHQ/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del cuantizador: https://soai.to
