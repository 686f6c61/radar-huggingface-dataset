# aether-models/aether-kit-phi2

## Resumen

Aether Kit Phi-2 es una conversión del modelo microsoft/phi-2 al formato nativo de Apple Core AI, empaquetada como bundle de lenguaje para la librería Aether Kit. Lo publica el usuario aether-models y se basa en la revisión upstream `9a5117d15e407c48fa40f8adbac1244abae52d6f` de Phi-2. No se trata de un modelo nuevo ni de un fine-tuning con datos adicionales: es el mismo Phi-2 de Microsoft, con los pesos convertidos para ejecutarse sobre Apple silicon mediante el runtime Core AI.

El interés de esta ficha es acotado: sirve para desarrolladores que quieran ejecutar Phi-2 en macOS dentro del ecosistema Aether Kit sin pasar por PyTorch ni por formatos GGUF. El modelo conserva la arquitectura y los pesos originales de Phi-2 (transformer denso de 2.700 millones de parámetros, contexto de 2.048 tokens) y hereda tanto sus capacidades como sus limitaciones.

La conversión es explícitamente experimental (versión v0.0.6 de desarrollo) y está cualificada únicamente sobre un Mac concreto con un conjunto reducido de prompts. Requiere Apple silicon, macOS 27 o superior y un checkout de Aether Kit que contenga el spike de Phi-2; la versión publicada 0.0.4 de Aether Kit no es compatible por falta de soporte de caché con padding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-2 de Microsoft), conversión a Core AI |
| Parametros totales | 2.700 millones (heredados de microsoft/phi-2) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (prompt + continuación), con chunks de prefill de máximo 64 tokens |
| Tipos de cuantizacion | sin cuantizar; pesos, cachés KV y logits en fp16, proyecciones y atención en float32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (Copyright Microsoft Corporation; tooling de conversión Apache-2.0) |
| Formato de pesos | bundle de lenguaje Aether Kit para Core AI (subdirectorio `mac/`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de microsoft/phi-2: un transformer denso de 2.700 millones de parámetros entrenado por Microsoft, con contexto de 2.048 tokens. Esta publicación no añade entrenamiento ni instruction tuning; es una conversión de pesos. El modelo es un modelo base de completación, sin plantilla de chat: la fachada de chat de Aether Kit devuelve `unsupportedTemplate` y debe usarse `AetherLanguageCoreAI.LanguageGenerationSession`.

La innovación técnica está en la conversión, no en el modelo. El conversor empleó Torch 2.11.0, Transformers 4.57.3 y coreai-torch 0.4.2 sobre un host con macOS build 26B123 y arquitectura Core AI `h17c`. Se implementó una caché con padding y consciente del stride que permite crecer la caché de 256 a 512 filas, necesaria para el caso de 224 tokens. Los contratos de puerto en float32 coinciden con las 64 filas argmax de referencia en tres prompts (7, 280 y 224 tokens) con coseno >= 0.999999 y tolerancia absoluta de 0.01; el checkpoint compilado pasa la autocomprobación de logits y caché en CPU con coseno mínimo de 0.99298, y la ejecución nativa en GPU coincide exactamente en las 192 elecciones de token forzadas y en las tres continuaciones de 64 tokens, con coseno nativo mínimo de 0.99847.

## Capacidades

- Generación de texto por completación: el modelo es un base model sin plantilla de chat, pensado para continuar prompts (por ejemplo, `def fibonacci(n):`).
- Generación de código y matemáticas: hereda las capacidades de Phi-2 en código y razonamiento aritmético básico, según su model card upstream.
- Sin soporte de tool calling ni function calling documentado en esta conversión.
- Sin soporte de agentes ni razonamiento multi-paso orquestado por el runtime.
- Multilingüe limitado: solo inglés declarado.
- Sin modo thinking, visión ni audio.
- Ejecución nativa en Apple silicon vía Core AI, con sesiones de generación que permiten carga y descarga explícita (`unload()`).

## Casos de uso

- Prototipado de completación de código en macOS: el ejemplo oficial genera la continuación de `def fibonacci(n):` con un máximo de 64 tokens; útil para validar la integración de Aether Kit en una app Swift antes de adoptar modelos mayores.
- Pruebas de integración de Core AI en apps nativas: sirve como banco de pruebas para verificar la sesión de generación, la tokenización y la gestión de caché en Apple silicon.
- Evaluación de pipelines de inferencia local sin dependencias de Python: al ejecutarse como bundle Swift, permite incorporar generación de texto en herramientas de escritorio macOS sin PyTorch ni servidores externos.
- Verificación de reproducibilidad de conversiones: los artefactos de `verification/` y los comandos de `Spikes/phi2` permiten reproducir la comparación de logits y caché frente a Transformers, útil para equipos que construyan sus propios conversores.
- Generación de texto corto en inglés con contexto acotado: tareas de autocompletado o redacción de fragmentos de hasta 2.048 tokens en un entorno local y privado.
- Docencia y experimentación con modelos base: al no tener plantilla de chat, es adecuado para estudiar el comportamiento de un modelo de completación puro sin capas de alineación conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo documenta métricas de equivalencia numérica de la conversión:

| Prueba | Resultado |
|---|---|
| Contratos float32 vs. referencia (3 prompts: 7, 280, 224 tokens) | 64/64 filas argmax coincidentes, coseno >= 0.999999, tolerancia absoluta 0.01 |
| Autocomprobación CPU de logits y caché (checkpoint compilado) | argmax exacto, sin filas de caché perdidas, coseno mínimo 0.99298 |
| Ejecución nativa en GPU | 192/192 elecciones de token forzadas y 3/3 continuaciones de 64 tokens exactas, coseno nativo mínimo 0.99847 |
| Suite de regresión Swift Release | 714 tests superados |
| Variación interna de Transformers (float32, secuencia completa vs. cacheada) | hasta 0.00815 en el prompt largo |

## Requisitos de hardware

- Plataforma: Apple silicon exclusivamente; no hay bundle para iOS cualificado.
- Sistema operativo: macOS 27 o superior.
- Runtime: Aether Kit con el spike de Phi-2 (`1881cf4` o descendiente); Aether Kit 0.0.4 publicado no es compatible.
- VRAM: no disponible como cifra; el modelo ocupa 5,6 GB de repositorio y almacena pesos, cachés KV y logits en fp16, con aritmética float32 en proyecciones, normalización, residuales y atención.
- GPU recomendadas: no disponible; la cualificación se hizo en un único Mac con arquitectura Core AI `h17c`.
- Despliegue: sesiones `AetherLanguageCoreAI.LanguageGenerationSession` en Swift; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aether Kit Phi-2 | 2.700 M | 2.048 | Bundle Core AI (macOS) | MIT | Experimental, 0 descargas, 0 likes |
| microsoft/phi-2 | 2.700 M | 2.048 | Safetensors (Transformers) | MIT | Modelo upstream estable |
| Phi-2 en GGUF (comunidad) | 2.700 M | 2.048 | GGUF (llama.cpp) | MIT | Múltiples conversiones comunitarias; datos concretos no disponibles en esta búsqueda |

La comparación de rendimiento de tarea no está disponible porque esta conversión no publica benchmarks de calidad. La diferencia práctica frente a las alternativas es el runtime: esta versión solo se ejecuta en macOS con Aether Kit, mientras que el modelo upstream y las conversiones GGUF cubren Linux, Windows y otros backends.

## Limitaciones y advertencias

- Modelo base sin instruction tuning ni plantilla de chat: no es adecuado para uso conversacional directo sin ingeniería de prompts específica.
- Contexto muy limitado (2.048 tokens) y prefill en chunks de 64 tokens, lo que penaliza prompts largos.
- Solo inglés declarado; el rendimiento en otros idiomas no está garantizado.
- Estado experimental (v0.0.6 de desarrollo): cualificado sobre tres prompts en un único Mac, no para calidad general de tarea ni para todos los dispositivos Apple.
- La coincidencia exacta en los casos probados no garantiza generación bit-exacta en float32 para prompts arbitrarios.
- Dependencia estricta de macOS 27 o superior, Apple silicon y un checkout concreto de Aether Kit; la versión publicada 0.0.4 falla por falta de soporte de caché con padding.
- Hereda los sesgos y el riesgo de alucinación de Phi-2 descritos en su model card upstream.
- Licencia MIT permite uso comercial, pero los avisos de copyright de Microsoft deben conservarse en `LICENSE` y `NOTICE`.

## Enlaces

- HuggingFace: https://huggingface.co/aether-models/aether-kit-phi2
- Modelo base: https://huggingface.co/microsoft/phi-2
- Repositorio Aether Kit: https://github.com/bubstackdev/aether-kit
- Commit de origen: https://github.com/bubstackdev/aether-kit/commit/1881cf48628c8f15a7e8e92ed38098a68865063e
- Spike de Phi-2 (comandos de reproducción): https://github.com/bubstackdev/aether-kit/tree/main/Spikes/phi2
- Catálogo macOS fijado: https://github.com/bubstackdev/aether-kit/blob/main/Spikes/phi2/catalog-macos.json
