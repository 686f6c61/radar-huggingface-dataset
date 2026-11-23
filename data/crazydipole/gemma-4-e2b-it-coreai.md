# CrazyDipole/gemma-4-e2b-it-coreai

## Resumen

Gemma 4 E2B IT Core AI es una conversión del modelo instructivo Gemma 4 E2B IT de Google DeepMind al runtime Apple Core AI, el sistema de ejecución de modelos en dispositivo de iOS, iPadOS y macOS 27. La conversión, publicada por el usuario CrazyDipole, aplica cuantización de 4 bits mediante palettización (tablas de búsqueda k-means) y comprime a 4 bits la tabla de embeddings por capa, reduciendo el paquete completo a 2,66 GB. El modelo es exclusivamente de texto: los codificadores de visión y audio del Gemma 4 original no están incluidos.

La relevancia de esta ficha radica en que ejemplifica el despliegue de un LLM instructivo íntegramente en hardware de consumo Apple, sin servidores ni conexión de red. El bundle expone una escalera de contexto estática de 1024, 4096 y 8192 tokens, con un máximo de 8192, muy por debajo de la ventana del modelo original. Los pesos no se reentrenaron: el tokenizador y la plantilla de chat se copian del modelo base.

El modelo se publica como trabajo derivado bajo licencia Apache 2.0 y se usa en la aplicación ClassScribe para generar apuntes de clase en el propio dispositivo. Google DeepMind no ha revisado ni respaldado esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), convertido a programa Core AI (`.aimodel`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens maximo (escalera estatica de 1024, 4096 y 8192) |
| Tipos de cuantizacion | 4 bits palettizado (k-means look-up tables); tabla PLE a 4 bits simetricos con una escala fp16 por cada 64 valores de fila |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | Core AI `.aimodel` (`main.mlirb`, 1,38 GB) + `safetensors` para la tabla PLE (1,25 GB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B IT, un transformer decoder-only de Google DeepMind con atención y capas de embedding por capa (PLE, *per-layer embeddings*). La conversión no modifica la arquitectura ni reentrena pesos: transforma el grafo PyTorch a un programa Core AI mediante `apple/coreai-models` (commit `c8e00c01800ba6ad324707007f7af358efc980a4`), usando `models/gemma4/export.py` con la receta iOS y el preset `4bit_palettized` (`models/gemma4/4bit_palettized.yaml`).

La innovación técnica principal es la compresión de la tabla PLE, que se almacena fuera del programa principal. El autor la cuantiza a 4 bits (simétrico, una escala fp16 por cada 64 valores de una fila) en lugar de los 8 bits de la receta, reduciéndola de 2,35 GB a 1,25 GB mediante un parche a `gemma4_text.py` (`recipe/ple4-4bit-table.patch`). El bundle incluye tres programas estáticos que comparten pesos y difieren solo en el tamaño de caché para prompts cortos. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto instructivo en inglés, con plantilla de chat heredada del modelo base.
- Razonamiento y resumen de documentos largos dentro del límite de 8192 tokens.
- Ejecución completamente local en iPhone, iPad y Mac, sin llamadas de red.
- Streaming de respuestas token a token mediante `LanguageModelSession.streamResponse`.
- Control de generación con `GenerationOptions` (temperatura, `maximumResponseTokens`; el valor por defecto se detiene a 512 tokens).
- Sin soporte de visión ni audio: los codificadores correspondientes no están incluidos.
- Sin soporte documentado de tool calling, function calling ni razonamiento agéntico multi-paso.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Apuntes de clase en dispositivo: la aplicación ClassScribe usa el modelo para resumir transcripciones de unas 3500 tokens en secciones de hasta 2000 tokens de salida; en un iPad A16 una sesión completa de cuatro secciones más una pasada final tarda unos 2 minutos.
- Resumen de documentos confidenciales: al ejecutarse sin red, permite procesar contratos, informes médicos o material interno sin que los datos salgan del dispositivo.
- Asistentes integrados en apps iOS y macOS: el bundle se carga con `CoreAILanguageModel(resourcesAt:)` y se integra con `FoundationModels` y `LanguageModelSession`, lo que facilita añadir un chat contextual a una app nativa.
- Procesamiento por lotes en Mac: con unos 4500 tokens/s de prefill y 43 tokens/s de decodificación en un M5, es viable procesar colas de resúmenes de 3500 tokens de entrada y 400 de salida en unos 10 segundos por sección.
- Generación de notas y borradores offline: útil en entornos sin conectividad (aulas, campo, aviones) donde se necesita un modelo instructivo con contexto de hasta 8192 tokens.
- Prototipado de funciones de IA en dispositivo: sirve como referencia reproducible para validar la receta de exportación de `apple/coreai-models` antes de adoptarla en producción.
- Filtrado y clasificación de texto local: tareas de extracción o etiquetado sobre fragmentos que quepan en la ventana de 1024 tokens, usando el programa estático más pequeño para minimizar el uso de caché.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de rendimiento y de calidad de la cuantización:

| Metrica | Valor |
|---|---|
| Prefill en iPad A16 (6 GB, build Release) | ~2600 tokens/s |
| Decodificacion en iPad A16 | ~28 tokens/s |
| Prefill en Mac M5 (`llm-benchmark`) | ~4500 tokens/s |
| Decodificacion en Mac M5 | ~43 tokens/s |
| Primer token en Mac M5 | ~0,8 s |
| Memoria pico en Mac M5 | ~3,1 GB |
| Carga inicial en frio (Mac M5) | ~40 s |
| Carga inicial en iPad A16 | ~100 s (compilacion para el dispositivo); posteriores ~1 s |
| Acuerdo top-1 (tabla PLE 4 bits vs 8 bits) | 97,3 % a 98,8 % |
| Cambio de perplejidad (4 bits vs 8 bits) | inferior al 1 % |

Las cifras de Mac se midieron sobre una exportación anterior con un único programa de contexto 8192; el bundle publicado solo añade los programas de 1024 y 4096 con los mismos pesos.

## Requisitos de hardware

- VRAM/almacenamiento: el bundle completo ocupa 2 659 361 705 bytes (unos 2,66 GB); memoria pico medida de ~3,1 GB en Mac M5 durante la inferencia.
- GPU/dispositivos recomendados: iPad con chip A16 (6 GB), Mac con chip M5; en general, dispositivos Apple compatibles con iOS, iPadOS o macOS 27 y Core AI.
- Cabe en hardware de consumo Apple: sí, el caso declarado es un iPad A16 de 6 GB y un Mac M5.
- Despliegue: exclusivamente mediante Apple Core AI (`CoreAILanguageModel`, módulo `CoreAILanguageModels`) con Xcode 27; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al estar en formato `.aimodel`.
- Latencia y throughput: ~28 tokens/s de decodificación en iPad A16 y ~43 tokens/s en Mac M5; una build Debug es aproximadamente 2,5 veces más lenta que Release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B IT Core AI (esta ficha) | no disponible | 8192 | `.aimodel` / Apple Core AI | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it | no disponible | mayor que 8192 (no cuantificado en la informacion) | PyTorch / safetensors | Apache 2.0 | Hugging Face (modelo base) |
| Otras conversiones on-device de Gemma 4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Solo texto: la visión y el audio del Gemma 4 original no están incluidos; no acepta imágenes ni audio.
- Contexto recortado: máximo de 8192 tokens, muy inferior al del modelo original, con programas estáticos separados para 1024, 4096 y 8192.
- Solo inglés: la model card declara únicamente `en`; no hay garantías de calidad en castellano.
- Divergencia por cuantización: el texto greedy se separa pronto del export de 8 bits, aunque el acuerdo top-1 se sitúa entre el 97,3 % y el 98,8 % y la perplejidad cambia menos del 1 %.
- Riesgo de alucinación: inherente al modelo base y no cuantificado en esta conversión; no se han publicado evaluaciones de fidelidad.
- Sesgos: no se documentan análisis de sesgo específicos para esta conversión ni para el modelo base en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte que Google DeepMind no ha revisado ni respaldado la conversión; conviene verificar la licencia de Gemma 4 en la página oficial de Google.
- Dependencia de plataforma: requiere Xcode 27 y un sistema operativo con Core AI (iOS, iPadOS o macOS 27); no es portable a otros runtimes.
- Carga inicial lenta: la primera compilación del programa tarda unos 100 s en iPad A16 y unos 40 s en Mac M5; se repite tras actualizar el sistema o la app.
- Integridad de descarga: el autor recomienda descargar desde un commit fijado y verificar tamaño y SHA-256 de cada fichero antes de cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CrazyDipole/gemma-4-e2b-it-coreai
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Página de Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio apple/coreai-models: https://github.com/apple/coreai-models
