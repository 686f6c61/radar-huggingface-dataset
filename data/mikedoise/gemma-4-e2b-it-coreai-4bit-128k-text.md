# mikedoise/gemma-4-E2B-it-coreai-4bit-128k-text

## Resumen

Gemma 4 E2B Instruct es un modelo de lenguaje de la familia Gemma 4 de Google DeepMind, orientado a entornos de bajos recursos y despliegue local. Esta ficha concreta no es el checkpoint original, sino una conversión independiente realizada por Michael Doise para el runtime Core AI de Apple, empaquetada como recurso `.aimodel` y cuantizada a 4 bits mixtos con una ventana de contexto configurada de 131.072 tokens. El paquete contiene únicamente el modelo de lenguaje, el tokenizador y el sidecar de embeddings por capa (PLE); no incluye los codificadores de visión ni de audio.

El problema que resuelve es el de disponer de un modelo conversacional ligero ejecutable en Apple Silicon mediante el stack nativo de Apple (Core AI Models), sin depender de Transformers, MLX, GGUF o Core ML. La relevancia es doble: por un lado, valida el flujo de exportación de Apple para modelos Gemma 4; por otro, ofrece una vía de inferencia local en macOS/iOS con contexto largo, algo poco habitual en modelos de esta clase de parámetros efectivos.

La nomenclatura "E2B" corresponde a la clase de parámetros efectivos del modelo original, que Google cifra en aproximadamente 2.300 millones de parámetros efectivos y 5.100 millones incluyendo embeddings. Es importante señalar que esta conversión no ha sido validada a longitud completa de contexto ni en iPhone o iPad, y que solo se ha ejecutado una prueba de humo de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4 E2B Instruct; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | No disponible para este bundle; el modelo original reporta ~2,3B efectivos y ~5,1B incluyendo embeddings |
| Parametros activos | No disponible (no se especifica si el modelo base es MoE) |
| Longitud de contexto | 131.072 tokens configurados (buckets estaticos de 1.024 / 8.192 / 32.768 / 131.072); no probado a longitud completa |
| Tipos de cuantizacion | Paletizacion mixta de 4 bits; embeddings y PLE en INT8; computo en float16; excepciones sin comprimir |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (pesos); licencia del modelo base enlazada a ai.google.dev/gemma/docs/gemma_4_license |
| Formato de pesos | Core AI `.aimodel` (resource package, `kind: llm`), con `main.mlirb`, `main.hash`, sidecar PLE en safetensors y tokenizador |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it` (revision `3e22461f65e89153144f8adb70e3b8c2cc9845a7`), un modelo instruct de la familia Gemma 4. La información disponible no detalla la arquitectura interna del checkpoint original (número de capas, dimensiones, mecanismo de atención o si emplea mezcla de expertos), por lo que no es posible confirmar detalles estructurales más allá de que se trata de un transformer de la familia Gemma 4. Tampoco se especifican los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO.

La innovación técnica relevante en esta ficha es el proceso de conversión y cuantización. El export utiliza la receta de Apple Core AI Models para Gemma 4, con paletización mixta de 4 bits que mantiene precisión mixta: embeddings y datos PLE en INT8, cómputo en float16 y excepciones sin comprimir. El paquete incluye un sidecar de embeddings por capa (PLE) que el runtime necesita junto con el modelo principal. La especialización se realiza en el dispositivo objetivo (`compilation.targets` vacío), no mediante compilación ahead-of-time a `.aimodelc`. No se incluye cabecera de borrador (draft head) para decodificación especulativa, ni codificadores de visión o audio.

## Capacidades

- Generación de texto conversacional e instructiva en formato texto a texto.
- Razonamiento y respuesta a preguntas simples (validado con una prueba de humo: "What is 2 plus 2?" → "4").
- Contexto largo configurado de hasta 131.072 tokens, con buckets estáticos de 1.024, 8.192, 32.768 y 131.072.
- Soporte de plantilla de chat (`chat_template.jinja`) incluida en el bundle.
- Ejecución en Apple Silicon mediante el runtime Core AI Models y `llm-runner`.
- No incluye capacidades de visión, audio ni vídeo en esta variante (existe una variante separada con visión).
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso o modo thinking en la documentación proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Inferencia local en Mac para asistentes de texto: el bundle se ejecuta con `llm-runner` sobre macOS 27.0+ y Xcode 27.0+, lo que permite prototipar asistentes conversacionales sin salir del ecosistema Apple ni enviar datos a la nube.
- Procesamiento de documentos largos en local: con 131.072 tokens configurados, el modelo puede recibir contratos, informes o transcripciones extensas para resumen y extracción, siempre que se valide el comportamiento real a esa longitud (no probado a contexto completo).
- Aplicaciones iOS/iPadOS experimentales: la receta de Apple indica soporte en iOS 27.2+, aunque esta release concreta no se ha probado en iPhone ni iPad; serviría para explorar asistentes on-device en fases de prototipo.
- Automatización de tareas de texto en pipelines de desarrollo: al ser un recurso descargable con checksums (`SHA256SUMS`) y estructura reproducible, encaja en flujos de CI que verifiquen integridad y comportamiento del modelo antes de empaquetarlo en una app.
- Evaluación comparativa de runtimes en Apple Silicon: útil para medir el rendimiento de Core AI frente a MLX o llama.cpp con el mismo modelo base, dado que el paquete expone tiempos de preparación y ejecución.
- Investigación sobre cuantización: el archivo `provenance/4bit_palettized.yaml` documenta la configuración exacta de precisión mixta, lo que permite estudiar el impacto de la paletización 4-bit con excepciones INT8 y sin comprimir.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local y con licencia Apache 2.0 sobre los pesos, es apto para escenarios donde el texto no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única medición registrada es una prueba de humo ejecutada el 2026-11-08 en un Apple M5 Max con 128 GiB de RAM, macOS 27.0.1 y Xcode 27.1: prompt "What is 2 plus 2? Answer with just the number.", salida "4", 23 tokens de entrada y 2 de salida, con 41,463 segundos de preparación y 47,34 segundos para la invocación completa. El propio autor advierte que son observaciones de una sola ejecución y no benchmarks de rendimiento.

## Requisitos de hardware

- VRAM/RAM: el bundle ocupa 3,762 GB (3,503 GiB) en disco; el autor aclara que es tamaño de disco, no requisito de RAM. No se proporciona una cifra de memoria en tiempo de ejecución.
- Hardware validado: Apple M5 Max con 128 GiB de RAM física.
- Cabe en GPU de consumo: no aplica directamente; el destino es Apple Silicon (Mac, y potencialmente iPhone/iPad según la receta, aunque no probado en estos últimos).
- GPU recomendadas: no disponibles; el runtime Core AI está orientado a Apple Neural Engine y GPU de Apple Silicon.
- Opciones de despliegue: exclusivamente el runtime `apple/coreai-models` con `llm-runner` (Swift). No es compatible con vLLM, llama.cpp, Ollama, TGI, MLX, GGUF ni Core ML.
- Latencia y throughput: solo se conoce la observación de la prueba de humo (47,34 s para 2 tokens de salida en una invocación en frío, incluyendo preparación); no hay datos de throughput sostenido.
- Requisitos de software: macOS/iOS 27.0+ y Xcode 27.0+ según la documentación general de Apple; la receta de Gemma indica iOS 27.2+.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B Instruct Core AI 4-bit 128K (esta ficha) | ~2,3B efectivos (original) | 131.072 configurados | Core AI `.aimodel` | Apache 2.0 (pesos) | Solo Apple Silicon; sin visión ni audio; validación mínima |
| Gemma 4 E2B Instruct Core AI 4-bit 128K Vision | ~2,3B efectivos (original) | 131.072 configurados | Core AI `.aimodel` | Apache 2.0 (pesos) | Variante con codificador de imagen; sin audio |
| google/gemma-4-E2B-it (original) | ~2,3B efectivos / ~5,1B con embeddings | No disponible en la informacion proporcionada | Safetensors (checkpoint original) | Licencia Gemma 4 | Requiere stack estándar (Transformers, etc.) |
| Gemma 4 E2B (según gemma4.dev) | 2,1B | 8K | No disponible | No disponible | Descripción de terceros que difiere de las cifras de Google; usar con cautela |

## Limitaciones y advertencias

- Validación mínima: solo se ha ejecutado una prueba de humo de una pregunta y dos tokens de salida; no hay evidencia de calidad en tareas reales.
- Contexto no probado: los 131.072 tokens están configurados pero no se han validado a longitud completa; el comportamiento en contextos largos es desconocido.
- Advertencia de compatibilidad: durante la primera carga se registró un error interno del compilador de ordenación topológica del Apple Neural Engine y avisos de reordenación; el runtime cargó el modelo y respondió correctamente, pero no se establece compilación ni ejecución limpia en ANE ni un backend de respaldo concreto.
- Sin probar en iPhone ni iPad, pese a que la receta indica soporte en iOS 27.2+.
- Problema conocido de compilación AOT con Xcode 27.2 beta según la receta de Apple; se recomienda especialización en dispositivo desde `.aimodel`.
- El bundle no acepta imágenes, audio ni vídeo; para visión existe una variante separada.
- El etiquetado "4-bit" no implica que todos los tensores estén a 4 bits: hay INT8 y excepciones sin comprimir.
- No es un checkpoint Transformers, MLX, GGUF ni Core ML; no puede usarse con las herramientas habituales de esos ecosistemas.
- El bundle debe descargarse completo y mantener la estructura de directorios; el `.aimodel` por sí solo no funciona.
- Sesgos y alucinaciones: no se documentan sesgos específicos en la información disponible; como todo modelo generativo, existe riesgo de alucinación, agravado por la ausencia de evaluaciones publicadas.
- Licencia: los pesos se declaran Apache 2.0, pero la model card enlaza la licencia específica de Gemma 4; conviene revisar sus términos antes de uso comercial.
- Idiomas soportados no declarados: no hay garantía de calidad multilingüe.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/mikedoise/gemma-4-E2B-it-coreai-4bit-128k-text
- Variante con visión: https://huggingface.co/mikedoise/gemma-4-E2B-it-coreai-4bit-128k-vision
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio Apple Core AI Models: https://github.com/apple/coreai-models
- Receta Gemma 4 de Apple: https://github.com/apple/coreai-models/tree/b712e4e96df6665f90a1f3cb49cc91d3660d43b9/models/gemma4
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Ficha de terceros Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
