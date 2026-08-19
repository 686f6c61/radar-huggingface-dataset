# DJKG/nano-kyrgyz

## Resumen

nano-kyrgyz es un modelo de lenguaje de 5,7 millones de parámetros, entrenado desde cero a nivel de carácter para el idioma kirguís, una lengua túrquica de bajos recursos con aproximadamente 5 millones de hablantes. Lo desarrolla DJKG (Djumabaevs) y está publicado bajo licencia Apache 2.0. Su propósito es servir como la mitad lingüística de una pila de comprensión de documentos en kirguís, demostrando que es posible construir un modelo funcional con recursos mínimos: se entrenó en un portátil MacBook M5 Pro en unos 21 minutos, con datos de Wikipedia en kirguís (corpus de Leipzig, ~10 millones de caracteres) y sin coste económico.

El modelo está diseñado para ser un continuador de texto y un asistente conversacional básico, no un sistema de conocimiento general. Su arquitectura es deliberadamente idéntica en componentes a Qwen3 (RMSNorm, RoPE, GQA, SwiGLU, QK-norm), pero con un tamaño minúsculo y un contexto de solo 256 tokens. Se distribuye en formato GGUF, con versiones cuantizadas q8_0 y f32, y es compatible con llama.cpp, LM Studio y Ollama. Su relevancia radica en ser un ejemplo reproducible de entrenamiento de modelos para lenguas de bajos recursos, con un coste computacional casi nulo y una implementación completamente transparente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (similar a Qwen3: RMSNorm, RoPE, GQA, SwiGLU, QK-norm) |
| Parametros totales | 5.678.848 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | q8_0, f32 |
| Idiomas soportados | kirguís (ky) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

La arquitectura replica los componentes de Qwen3 a escala mínima: 8 capas, 256 dimensiones ocultas, 8 cabezas de consulta y 2 de clave/valor (GQA), dimensión de cabeza de 32, FFN con SwiGLU de 704 unidades, normalización RMSNorm con QK-norm por cabeza antes de RoPE (θ=10000), embeddings atados y caché KV de 2,0 KiB por token. Todo está implementado desde cero en PyTorch, incluyendo el optimizador Muon, el cuantizador INT4 y la caché KV, con ablaciones de cada componente.

El entrenamiento se realizó sobre el corpus de Leipzig de Wikipedia en kirguís, con aproximadamente 10 millones de caracteres. El modelo base se entrenó durante unos 21 minutos en MPS con bf16, alcanzando una pérdida de validación de 1,204 y 1,737 bits por carácter (frente a 5,017 de una línea base aleatoria). Posteriormente se aplicó un ajuste supervisado (SFT) para el formato de chat, con una pérdida de validación de 0,451. El vocabulario es de 151 tokens, a nivel de carácter, cubriendo el alfabeto cirílico kirguís completo, incluidas las letras específicas ң, ө y ү.

## Capacidades

- Generación de texto en kirguís: continúa frases o párrafos de forma coherente a nivel de formato y ortografía.
- Chat conversacional básico: responde a saludos y preguntas simples sobre sí mismo, con parada automática.
- Tareas de formato: puede convertir a mayúsculas (por ejemplo, "бишкек" → "БИШКЕК") y repetir frases dadas.
- Continuación de texto a partir de un prefijo: funciona como un modelo de autocompletado.
- Sin capacidades de razonamiento, aritmética, traducción, ni comprensión de otros idiomas (solo kirguís).
- Sin soporte de tool calling ni funciones de agente.

## Casos de uso

- Generación de texto en kirguís para entornos de bajos recursos: el modelo puede usarse como un autocompletador de frases en aplicaciones de escritura, aprovechando su velocidad (~1900 tokens/s en un M5 Pro) y su tamaño mínimo (5,8 MB en q8_0).
- Asistente conversacional de demostración: el modelo chat puede integrarse en prototipos de atención al cliente o chatbots educativos en kirguís, siempre que las respuestas se limiten a plantillas y no requieran conocimiento factual.
- Preprocesamiento y normalización de texto: dado su entrenamiento a nivel de carácter, puede ayudar a corregir la ortografía de textos kirguís, especialmente las letras cirílicas específicas que suelen corromperse en OCR o tokenización estándar.
- Educación y aprendizaje de idiomas: puede servir como herramienta de práctica para estudiantes de kirguís, generando frases simples y correctas gramaticalmente (aunque sin contenido semántico profundo).
- Investigación en lenguas de bajos recursos: es un punto de partida reproducible para estudiar el efecto de la arquitectura, el tamaño y la cuantización en modelos pequeños, ya que todo el código fuente está disponible.
- Pruebas de integración en pipelines de IA: por su tamaño y compatibilidad con llama.cpp y LM Studio, puede usarse para validar flujos de despliegue (API, Ollama, etc.) sin coste de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta las siguientes métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación (base) | 1,204 |
| Bits por carácter | 1,737 |
| Pérdida de validación (chat SFT) | 0,451 |
| Velocidad de inferencia (M5 Pro) | ~1900 tokens/s |

Estos valores indican que el modelo ha aprendido la estructura del idioma a nivel de carácter, pero no se pueden comparar con modelos de mayor escala.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB para el modelo q8_0 (5,8 MB de pesos, más caché KV de 2,0 KiB/token).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU.
- Compatible con hardware de consumo: sí, incluso en portátiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp, llama-completion, LM Studio, Ollama (con Modelfile personalizado), API compatible con OpenAI mediante LM Studio server.
- Latencia: extremadamente baja; en un M5 Pro alcanza ~1900 tokens/s. En hardware más modesto, se espera un rendimiento de cientos de tokens/s.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de 5,7 millones de parámetros específicos para kirguís. Como referencia general de modelos de tamaño similar para lenguas de bajos recursos, se puede comparar con TinyStories (para inglés, ~33M params) o modelos de nivel de carácter como los de Andrej Karpathy (nanoGPT), pero no hay datos de rendimiento comparables. El autor no proporciona comparativas con alternativas.

## Limitaciones y advertencias

- El modelo no contiene conocimiento factual: preguntas como "¿cuál es la capital de Francia?" producen respuestas fluidas pero incorrectas. Esto es un comportamiento esperado, no un fallo.
- Contexto muy limitado: solo 256 tokens, por lo que no es apto para tareas que requieran memoria a largo plazo o documentos extensos.
- Solo soporta kirguís: no funciona con ruso, inglés ni otros idiomas.
- Sin capacidades de razonamiento, aritmética o traducción.
- Riesgo de alucinación: dado su tamaño, puede generar texto gramaticalmente correcto pero semánticamente vacío o inventado.
- No recomendado para producción real sin supervisión humana, salvo en tareas muy restringidas (formato, ortografía).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/DJKG/nano-kyrgyz
- Repositorio de código fuente: https://github.com/Djumabaevs/nano-kyrgyz
- Modelos relacionados (no comparables directamente): https://huggingface.co/nineninesix/kyrgyz-whisper-small (reconocimiento de voz en kirguís), https://huggingface.co/kyrgyz-ai (Instituto de Investigación de IA en Kirguistán)
