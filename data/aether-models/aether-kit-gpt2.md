# aether-models/aether-kit-gpt2

## Resumen

aether-kit-gpt2 es una conversión del modelo base GPT-2 (124M parámetros) de OpenAI al formato nativo de Core AI de Apple para su uso con el framework Aether Kit, en su versión de spike experimental v0.0.6. Lo desarrolla aether-models, un proyecto que publica artefactos de conversión para el ecosistema Core AI de macOS, no un modelo entrenado desde cero. El modelo subyacente es `openai-community/gpt2`, revisión `607a30d783dfa663caf39e06633721c8d4cfcd7e`, sin ningún ajuste fino adicional ni instrucción tuning.

La relevancia de este artefacto es acotada y de nicho: sirve como prueba de concepto de que un transformer decoder-only clásico puede portarse al bundle de Aether Kit y ejecutarse en Apple silicon con Core AI, con validación numérica frente a la implementación de referencia en float32. No compite en calidad de generación con modelos actuales; su interés es de infraestructura y portabilidad.

El repositorio contiene únicamente el bundle para macOS (`mac/`), no hay bundle para iOS, y la ventana de contexto está limitada a 1.024 tokens. La licencia del artefacto es MIT, mientras que los pesos originales de GPT-2 conservan los términos Modified MIT de OpenAI de 2019.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), conversión a Core AI |
| Parametros totales | 124M (GPT-2 small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (prompt + generación); prefill bound exportado de 64 tokens |
| Tipos de cuantizacion | fp16 para pesos y KV cache; atención en float32 (scaled dot-product) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (artefacto de conversión); pesos originales bajo Modified MIT, Copyright (c) 2019 OpenAI |
| Formato de pesos | bundle Aether (`model.aimodel/`, `language-model.json`, `tokenizer/`, `export-report.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es GPT-2 small, un transformer decoder-only con 124M parámetros y atención multi-cabeza estándar, entrenado por OpenAI sobre un corpus web (WebText) y publicado en 2019. Esta conversión no añade entrenamiento, ajuste fino ni instrucción tuning: es un port del checkpoint original a un bundle ejecutable en Core AI. La arquitectura del bundle emplea pesos y KV caches en fp16, atención en float32 y un contrato de caché "bucketed".

El proceso de conversión se realizó con Torch 2.11.0, Transformers 4.57.3 y coreai-torch 0.4.2, sobre macOS build 26B123 y arquitectura de dispositivo Core AI `h17c`. La validación reportada incluye coincidencia exacta de las 64 filas argmax de referencia en float32 eager con prompts de 6 y 600 tokens, verificación de logits y caché en CPU, y cumplimiento de la política numérica fp16 en GPU nativa (coseno por fila >= 0,995). El SHA-256 del modelo en el bundle es `f04fefaa3a7e69f3e4da783ce1ac5aef7f80e0bc70e441db452ec691e7429316`.

## Capacidades

- Generación de texto por completación (base model, sin plantilla de chat).
- Razonamiento y conocimiento general limitados, propios de GPT-2 small de 2019.
- Generación de código y matemáticas muy básica, sin garantías de corrección.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües limitadas al inglés.
- Sin visión, audio ni modo "thinking".
- API de sesión (`AetherLanguageCoreAI.LanguageGenerationSession`) para generar a partir de tokens codificados; la fachada de chat devuelve `unsupportedTemplate`.

## Casos de uso

- Validación de pipelines de conversión a Core AI: sirve para comprobar que el tooling de Aether Kit exporta y ejecuta correctamente un transformer decoder-only en Apple silicon antes de portar modelos mayores.
- Pruebas de integración en aplicaciones macOS nativas: permite ejercitar la API `LanguageGenerationSession` y el tokenizador en Swift sin depender de servicios externos.
- Benchmarking de latencia en hardware Apple: al ser un modelo de 124M en fp16, es útil para medir tiempos de prefill y decodificación en distintos chips de la familia M.
- Completación de texto corta en prototipos: con contexto de 1.024 tokens, puede usarse para autocompletar fragmentos breves en demos internas.
- Docencia y experimentación: adecuado para explicar el funcionamiento de un transformer decoder-only y el contrato de caché bucketed en un entorno controlado.
- Verificación numérica de ports: los tests incluidos en `verification/` permiten comparar logits y continuaciones greedy frente a la referencia en float32, útil para auditar conversiones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta validaciones de equivalencia numérica (coincidencia de argmax, coseno por fila >= 0,995 en fp16, divergencia en el token 40 con margen de probabilidad ~0,00139 en el prompt corto), no métricas de calidad de tarea.

## Requisitos de hardware

- VRAM/espacio estimado: el repo pesa 0,2 GB; el modelo en fp16 ocupa aproximadamente 250 MB, más KV cache.
- Hardware obligatorio: Apple silicon con macOS 27 y Core AI. No hay bundle cualificado para iOS.
- GPU recomendadas: cualquier Mac con Apple silicon compatible con Core AI; no se especifican modelos concretos.
- Cabe en cualquier Mac moderno con Apple silicon; no aplica a GPU NVIDIA ni a hardware x86.
- Despliegue: exclusivamente mediante Aether Kit (`AetherLanguageCoreAI`, `AetherLanguageTokenizers`); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| aether-kit-gpt2 | 124M | 1.024 | MIT (artefacto) / Modified MIT (pesos) | Bundle Core AI, solo macOS |
| openai-community/gpt2 | 124M | 1.024 | Modified MIT | PyTorch/safetensors, multiplataforma |
| GPT-2 medium (openai-community) | 355M | 1.024 | Modified MIT | PyTorch/safetensors, multiplataforma |
| Modelos decoder-only pequeños actuales (p. ej. familia Qwen o Llama pequeños) | variable | variable | variable | safetensors/GGUF, multiplataforma |

La comparación relevante es frente al GPT-2 original: misma arquitectura y pesos, pero este artefacto solo es ejecutable en Core AI sobre macOS, mientras que el original es portable. Frente a modelos pequeños actuales, la diferencia en calidad de generación es sustancial y no se dispone de métricas comparativas publicadas para este artefacto.

## Limitaciones y advertencias

- Modelo base sin instrucción tuning: no sigue instrucciones ni mantiene formato de chat; la fachada de chat devuelve `unsupportedTemplate`.
- Conocimiento y calidad propios de GPT-2 de 2019; alta probabilidad de texto incoherente o factualmente incorrecto en tareas complejas.
- Riesgo elevado de alucinación y de sesgos heredados del corpus WebText original.
- Contexto máximo de 1.024 tokens, con prefill bound de 64 tokens, lo que limita prompts largos.
- Solo inglés.
- Solo ejecutable en Apple silicon con macOS 27 y Core AI; sin soporte iOS ni otras plataformas.
- La propia model card califica el artefacto como spike experimental v0.0.6; la cualificación cubre prompts sintéticos en un único Mac, no calidad general ni todos los dispositivos Apple.
- No se promete salida bit-exacta en float32.
- Uso comercial: el artefacto es MIT, pero los pesos GPT-2 conservan los términos Modified MIT de OpenAI; conviene revisar `LICENSE` y `NOTICE` antes de redistribuir.

## Enlaces

- HuggingFace: https://huggingface.co/aether-models/aether-kit-gpt2
- Modelo base: https://huggingface.co/openai-community/gpt2
- Repositorio Aether Kit: https://github.com/bubstackdev/aether-kit
- Commit de origen del port: https://github.com/bubstackdev/aether-kit/commit/20bbc96
- Notas y comandos del spike: https://github.com/bubstackdev/aether-kit/tree/main/Spikes/gpt2
- Catálogo macOS fijado: https://github.com/bubstackdev/aether-kit/blob/main/Spikes/gpt2/catalog-macos.json
