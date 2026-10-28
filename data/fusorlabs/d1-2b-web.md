# fusorlabs/d1-2b-web

## Resumen

`fusorlabs/d1-2b-web` no es un checkpoint convencional, sino el modelo `LiquidAI/d1-2B` de Liquid AI compilado por Fusor en un bundle del runtime [fusor-ai](https://github.com/fusor-rs/fusor-ai) para ejecutarse en el navegador mediante WebAssembly. El resultado permite responder preguntas con nombre y tipo sobre un estado y sus imágenes en una sola pasada y directamente en la CPU del dispositivo, sin GPU ni servidor. Se trata, por tanto, de una pieza de despliegue edge más que de un modelo nuevo: los pesos proceden del checkpoint original de Liquid AI en una revisión concreta.

El modelo base, `d1-2B`, es un modelo de decisión con visión de la familia LFM3 de Liquid AI, de aproximadamente 1,9B de parámetros. No está pensado como modelo conversacional, sino para tareas de pipeline como enrutado, triaje, moderación, clasificación de intención, extracción de documentos, reranking o inspección visual. La ventana de estado manejable ronda los 64.000 tokens, y la fiabilidad decae más allá de esa cifra según la documentación del fabricante.

La relevancia de este artefacto está en el empaquetado: cuantización propietaria `q7` (matrices grandes a 7 bits, patch embedding en f32 con calibración del checkpoint), verificación de integridad por hash BLAKE3 y carga exclusiva en el runtime `liquidai-lmf3-wasm`. Esto lo aleja del ecosistema estándar de safetensors, GGUF o PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de Liquid AI (familia LFM3, variante vision-language); detalles exactos de capas no disponibles |
| Parametros totales | ~1,9B (modelo base d1-2B) |
| Parametros activos | No disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | ~64.000 tokens de estado; la fiabilidad decae a partir de esa cifra |
| Tipos de cuantizacion | Perfil propietario `q7`: matrices grandes a 7 bits, patch embedding en f32 con calibración; no admite GGUF, AWQ ni otras cuantizaciones estándar |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | Bundle `fusor-ai` (`manifest.json` + partes nombradas por hash BLAKE3); no es safetensors ni PyTorch |

## Arquitectura y entrenamiento

El bundle deriva de `LiquidAI/d1-2B` en la revisión `97c57047d5852d77e02dfac211f8768aff77a8b2`. La arquitectura subyacente es la de un modelo vision-language de la familia LFM3 de Liquid AI, orientado a la toma de decisiones y no al diálogo: recibe un estado (texto e imágenes) y devuelve respuestas a preguntas con nombre y tipo predefinidas. Los detalles de composición del dataset de entrenamiento, número de tokens, fases de ajuste fino (RLHF/DPO) y demás decisiones de entrenamiento no están disponibles en la información proporcionada.

La innovación técnica de este artefacto es el proceso de compilación: el perfil `q7` cuantiza a 7 bits todas las matrices grandes mientras mantiene el patch embedding en f32, aplicando la calibración del checkpoint original. Cada tensor y parte del bundle se nombra por su hash BLAKE3, que el runtime verifica durante la carga, lo que aporta garantías de integridad en la distribución. El bundle se reproduce con el comando `just model` del repositorio `liquidai-lmf3-wasm`, que descarga el checkpoint y compila el mismo paquete.

## Capacidades

- Respuesta a preguntas nombradas y tipadas sobre un estado y sus imágenes en una sola pasada.
- Entrada multimodal texto + imagen (pipeline `image-text-to-text`).
- Tareas de decisión: enrutado y triaje, moderación y guardrails, clasificación de intención y tema.
- Extracción de información de documentos y formularios.
- Evaluación y reranking (judging/reranking).
- Inspección visual.
- Inferencia en CPU del dispositivo mediante WebAssembly, sin GPU.
- Verificación de integridad de pesos por hash BLAKE3 en tiempo de carga.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo se describe explícitamente como no conversacional.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Moderación de contenido en el cliente: integrado en una aplicación web, el modelo clasifica texto e imágenes directamente en el navegador del usuario sin enviar datos a un servidor, lo que reduce latencia y preserva la privacidad.
- Clasificación de intención y tema en aplicaciones web: para enrutar peticiones de usuario a distintos flujos o servicios sin un backend de inferencia dedicado.
- Extracción de datos de formularios y documentos con imagen: el modelo procesa capturas o escaneos y responde preguntas tipadas sobre campos concretos en una sola pasada.
- Triaje y enrutado en pipelines: como primer paso que decide a qué rama o modelo mayor derivar una petición, aprovechando su naturaleza de modelo de decisión.
- Reranking y evaluación local: ordenar o puntuar candidatos generados por otro sistema antes de mostrarlos al usuario, todo en el dispositivo.
- Inspección visual on-device: verificar el contenido de imágenes (por ejemplo, en flujos de captura o verificación) sin salir del navegador.
- Guardrails en aplicaciones web: filtrar entradas y salidas potencialmente problemáticas en el propio cliente antes de llegar al backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible para este bundle. El material de referencia incluye una afirmación del fabricante sobre el modelo base `d1` según la cual iguala o supera a GPT-6.1 Sol en 4 de 6 tareas reales, pero se trata de una declaración comercial sin tabla de métricas reproducible en las fuentes consultadas. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia/throughput para esta compilación.

## Requisitos de hardware

- No requiere GPU ni VRAM: la inferencia se ejecuta en la CPU del dispositivo a través de WebAssembly.
- Tamaño del repositorio: 2,2 GB; el bundle `q7` ocupa ese orden de magnitud en almacenamiento y debe descargarse antes de la ejecución.
- Cabe en cualquier dispositivo capaz de ejecutar un navegador moderno con soporte WASM; no aplican las categorías habituales de A100, H100 o RTX 4090.
- Opciones de despliegue: exclusivamente el runtime `liquidai-lmf3-wasm`; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Demo disponible en el Space `fusorlabs/liquidai-lmf3-wasm`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Hardware | Licencia |
|---|---|---|---|---|---|---|
| fusorlabs/d1-2b-web (este) | ~1,9B | ~64K tokens | Bundle fusor-ai (q7) | liquidai-lmf3-wasm | CPU / navegador | LFM Open License v1.0 |
| LiquidAI/d1-2B (original) | ~1,9B | ~64K tokens | Checkpoint original (PyTorch/safetensors) | Frameworks estándar de ML | GPU/CPU | LFM Open License v1.0 |
| Otros bundles WASM comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no documenta otros bundles WebAssembly equivalentes de modelos de decisión con visión, por lo que la comparación se limita al modelo base original frente a esta compilación.

## Limitaciones y advertencias

- No es un modelo conversacional: está diseñado para preguntas tipadas sobre un estado, no para diálogo abierto.
- Las preguntas que requieren conocimiento extenso se derivan mejor a modelos de mayor tamaño; este modelo no está pensado para ello.
- La fiabilidad de las respuestas decae a partir de aproximadamente 64.000 tokens de estado.
- Bloqueo de runtime: solo carga en `liquidai-lmf3-wasm`; no es portable a safetensors, GGUF, vLLM, llama.cpp ni Ollama.
- La cuantización `q7` es propietaria y conlleva una pérdida de precisión respecto al checkpoint original; el patch embedding se mantiene en f32.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de extracción y moderación conviene validar las salidas.
- Idiomas soportados: no disponibles; no se puede garantizar un comportamiento multilingüe.
- Licencia LFM Open License v1.0 (etiquetada como `other`): es necesario revisar el archivo `LICENSE` para confirmar las condiciones exactas de uso comercial antes de llevarlo a producción.
- Modelo recién publicado (0 descargas y 0 likes en el momento de la consulta), sin validación independiente conocida.

## Enlaces

- HuggingFace: https://huggingface.co/fusorlabs/d1-2b-web
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Runtime fusor-ai: https://github.com/fusor-rs/fusor-ai
- Runtime liquidai-lmf3-wasm: https://github.com/fusor-rs/liquidai-lmf3-wasm
- Demo (Space): https://huggingface.co/spaces/fusorlabs/liquidai-lmf3-wasm
- Organización Fusor: https://huggingface.co/fusorlabs
- Documentación de Liquid AI sobre d1-2B: https://docs.liquid.ai/lfm/models/d1-2b
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/d1-decision-model
- Artículo de análisis sobre d1-2B: https://www.orcarouter.ai/blog/liquid-ai-d1-2b-quiet-release
