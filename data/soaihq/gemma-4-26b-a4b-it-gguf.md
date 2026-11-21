# SoAIHQ/gemma-4-26B-A4B-it-GGUF

## Resumen

Gemma 4 26B-A4B-it es un modelo multimodal de Google con arquitectura de mezcla de expertos (MoE) que combina 25.233 millones de parámetros totales con solo 3.800 millones activos por token, de modo que el coste computacional por token se aproxima al de un modelo denso de 4B. Procesa texto e imágenes (pipeline `image-text-to-text`), admite razonamiento configurable por petición y tool calling nativo, y ofrece una ventana de contexto de 262.144 tokens. La versión aquí descrita es una cuantización GGUF publicada por SoAIHQ para su uso con llama.cpp.

El interés de esta ficha reside en la cuantización concreta: SoAIHQ genera los ficheros con una importance matrix (imatrix) calibrada sobre un corpus propio de conversaciones multi-turno en 21 idiomas, ediciones de código en 22 lenguajes de programación, llamadas a herramientas con sus resultados, matemáticas paso a paso y prosa web, todo formateado con la plantilla de chat nativa del modelo, incluida su sintaxis de tool calling. Se publican dos variantes, Q4_K_M (16,8 GB) y Q8_0 (26,9 GB), más un proyector multimodal F16 (1,2 GB) necesario para la entrada de imágenes.

El modelo es relevante para quien quiera desplegar un MoE multimodal de contexto largo en hardware de gama alta de consumo o en una sola GPU profesional, manteniendo tool calling y modo de razonamiento. La licencia declarada es Apache 2.0, con enlace a la licencia específica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), 128 expertos con 8 activos por token |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 3,8B por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (16,8 GB, con imatrix) y Q8_0 (26,9 GB, sin imatrix); proyector multimodal mmproj F16 (1,2 GB) |
| Idiomas soportados | 35+ idiomas (preentrenado en 140+); el corpus de calibración cubre 21 idiomas |
| Licencia | Apache 2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | GGUF para llama.cpp; safetensors en el modelo base |
| Modalidades | Texto e imagen (audio no soportado) |
| Razonamiento | Thinking configurable por petición (`enable_thinking`) |
| Tool calling | Sí, sintaxis nativa incluida en la plantilla de chat |
| Version de llama.cpp indicada | v0.5.0 |
| Tamano del repo | 44,9 GB |
| Descargas / likes | 984 / 0 |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26B-A4B-it`, un transformer con mezcla de expertos de 128 expertos y 8 activos por token, lo que da 25,2B parámetros totales y 3,8B activos. Esta dispersión explica que el coste por token se acerque al de un modelo denso de 4B pese al tamaño total del checkpoint. El modelo es instruct (`-it`), multimodal (texto e imagen) y soporta razonamiento conmutable por petición mediante `enable_thinking` en `chat_template_kwargs`.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card de Google y no se incluyen en la información proporcionada. Lo que sí se documenta es el proceso de cuantización de SoAIHQ: Q4_K_M se cuantiza con una importance matrix calculada sobre un corpus propio de calibración (chat multi-turno en 21 idiomas, código en 22 lenguajes, tool calls y resultados, matemáticas paso a paso y prosa web), formateado con la plantilla de chat del modelo. Antes de cuantizar, el pipeline verifica que los marcadores de chat, thinking y tool calling se almacenen como tokens especiales y que la plantilla embebida coincida con la original; si la conversión los importa como texto plano, el build se detiene en lugar de publicar el fichero. Q8_0 se genera sin imatrix porque el formato Q8_0 de llama.cpp no la utiliza. El fichero de imatrix se publica en el repositorio junto con una tabla de procedencia que fija la revisión original y el commit de llama.cpp para reproducir la build.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Entrada de imágenes (image-text-to-text) mediante el proyector `mmproj-gemma-4-26B-A4B-it-f16.gguf` cargado con `--mmproj`.
- Razonamiento configurable por petición: se activa o desactiva el modo thinking con `"chat_template_kwargs": {"enable_thinking": true}`.
- Tool calling / function calling con sintaxis nativa incluida en la plantilla de chat y validada durante la conversión.
- Capacidades de código: el corpus de calibración cubre ediciones en 22 lenguajes de programación, lo que indica soporte práctico para tareas de programación.
- Razonamiento matemático paso a paso, presente en el corpus de calibración.
- Multilingüismo: 35+ idiomas soportados, con preentrenamiento en más de 140.
- Sin soporte de audio.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens de ventana se pueden mantener sesiones extensas o adjuntar documentación completa sin truncar; el coste por token se mantiene bajo gracias a los 3,8B parámetros activos.
- Análisis de documentos con imágenes: informes escaneados, capturas de pantalla o diagramas enviados junto a preguntas de texto, cargando el mmproj F16 en llama-server con `--mmproj`.
- Automatización con herramientas: agentes que encadenan llamadas a funciones (APIs, consultas a bases de datos, operaciones de fichero) aprovechando el tool calling nativo y el modo thinking para planificar varios pasos.
- Asistencia de programación en local: edición y revisión de código en múltiples lenguajes, con la ventaja de que la cuantización Q4_K_M ha sido calibrada específicamente sobre código y puede ejecutarse en una estación de trabajo sin depender de la nube.
- Despliegue con API compatible con OpenAI: `llama-server` expone `/v1/chat/completions`, lo que permite sustituir un endpoint remoto por uno local en pipelines existentes sin cambiar el cliente.
- Razonamiento matemático asistido: resolución de problemas paso a paso activando thinking por petición, útil en herramientas educativas o de verificación de cálculos.
- Procesamiento por lotes en CPU o con reparto GPU/CPU: llama.cpp permite dividir capas entre GPU y CPU, de modo que el Q4_K_M puede ejecutarse en máquinas sin GPU dedicada a costa de menor throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para Q4_K_M: 16,8 GB de pesos más memoria para el contexto, que crece con la longitud configurada; presupuesto práctico de 20-24 GB para contextos moderados.
- VRAM para Q8_0: 26,9 GB de pesos más contexto; requiere GPU de 32-48 GB o reparto entre varias.
- Proyector multimodal: 1,2 GB adicionales en F16 si se usa entrada de imagen.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q4_K_M con contexto moderado; GPUs de 16 GB quedan justas para Q4_K_M y obligan a descargar capas a CPU.
- Cabe en GPU de consumo: sí, Q4_K_M en RTX 4090 y, con menos margen de contexto, en GPUs de 24 GB en general; Q8_0 no cabe en una GPU de consumo de 24 GB.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), con soporte de reparto GPU/CPU; `llama-server -hf SoAIHQ/gemma-4-26B-A4B-it-GGUF:Q4_K_M` descarga el modelo y el mmproj automáticamente. El tag `endpoints_compatible` del repositorio indica compatibilidad con endpoints de inferencia.
- Ajustes de muestreo recomendados por Google: temperature 1.0, top_p 0.95, top_k 64, idénticos con thinking activado o desactivado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B-A4B-it (esta ficha, GGUF de SoAIHQ) | 25,2B / 3,8B | 262.144 | Texto e imagen | Apache 2.0 | GGUF |
| Gemma 4 26B-A4B-it (original de Google) | 25,2B / 3,8B | 262.144 | Texto e imagen | Apache 2.0 | Safetensors |
| Otras cuantizaciones GGUF del mismo modelo base | 25,2B / 3,8B | 262.144 | Texto e imagen | Apache 2.0 | GGUF |

La información disponible no incluye datos de rendimiento de modelos alternativos de otros desarrolladores, por lo que no es posible establecer una comparación cuantitativa con ellos. La diferencia frente al original de Google y frente a otras cuantizaciones del mismo base radica en el corpus de calibración de la imatrix y en las comprobaciones de integridad de la plantilla de chat y los tokens especiales.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados en la información disponible; el rendimiento real debe validarse en el caso de uso concreto.
- La cuantización Q4_K_M introduce pérdida de calidad respecto a los pesos de 16 bits, aunque el autor la describe como cercana al original; Q8_0 es casi sin pérdida pero no usa imatrix.
- SoAIHQ no publica cuantizaciones por debajo de 4 bits, por lo que no hay opciones para hardware con menos de ~17 GB de memoria disponible para pesos.
- El soporte de audio está explícitamente ausente.
- La entrada de imágenes requiere cargar el mmproj por separado; omitirlo desactiva la funcionalidad multimodal sin aviso evidente en todos los clientes.
- Un error en la importación de marcadores de chat, thinking o tool calling como texto plano rompe los turnos y las llamadas a herramientas; el autor indica que su build aborta en ese caso, pero conviene verificar la plantilla al integrar.
- La lista de idiomas concretos no está detallada en la información disponible; solo se indica el rango (35+ soportados, 140+ en preentrenamiento).
- La licencia declarada es Apache 2.0, pero el repositorio enlaza a la licencia específica de Gemma 4 de Google; conviene revisar ese documento antes de un uso comercial, ya que pueden aplicarse términos adicionales del modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son heredados del modelo base y deben evaluarse antes de producción.
- El repositorio tiene 0 likes y 984 descargas en la fecha de actualización, por lo que la validación comunitaria es limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SoAIHQ/gemma-4-26B-A4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del autor: https://soai.to
- Fichero Q4_K_M: https://huggingface.co/SoAIHQ/gemma-4-26B-A4B-it-GGUF/resolve/main/gemma-4-26B-A4B-it-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/SoAIHQ/gemma-4-26B-A4B-it-GGUF/resolve/main/gemma-4-26B-A4B-it-Q8_0.gguf
- Proyector multimodal F16: https://huggingface.co/SoAIHQ/gemma-4-26B-A4B-it-GGUF/resolve/main/mmproj-gemma-4-26B-A4B-it-f16.gguf
