# gguf-org/cantonese-gguf

## Resumen

Cantonese GGUF es una colección de pesos cuantizados en formato GGUF del modelo de síntesis de voz (TTS) jmtl/hk-cantonese-cc0-qwen3-tts, publicada por la organización gguf-org en Hugging Face. El modelo base se construye sobre la arquitectura Qwen3-TTS y está especializado en cantonés de Hong Kong, con licencia CC0 en el modelo original y Apache 2.0 en esta cuantización. Su propósito es permitir la ejecución local y eficiente de un modelo TTS en cantonés mediante kernels de cómputo GGUF propios (el "pig engine" / gk), sin depender de infraestructura GPU de alto consumo.

La relevancia de esta ficha radica en la escasez de modelos TTS abiertos de calidad para cantonés, una lengua con tonos complejos y escaso soporte en los sistemas de voz comerciales. La colección incluye variantes base, de clonación de voz y de diseño de voz, con cuantizaciones q8_0 y nvfp4, y un tamaño de repositorio de 11,6 GB. Los parámetros totales del modelo base, según los metadatos de safetensors, son 1.916.676.352 (aproximadamente 1,92 mil millones), lo que lo sitúa en la gama de modelos ligeros ejecutables en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TTS basado en Qwen3-TTS con codec de audio (tokenizador 12 Hz) |
| Parametros totales | 1.916.676.352 (≈1,92 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0, nvfp4 |
| Idiomas soportados | Cantonés (Hong Kong); el modelo base Qwen3-TTS soporta inglés y chino mandarín según los ejemplos |
| Licencia | Apache 2.0 (modelo base con licencia CC0) |
| Formato de pesos | GGUF (cuantizado a partir de safetensors) |

## Arquitectura y entrenamiento

El modelo es una derivada de Qwen3-TTS, una arquitectura de texto a voz basada en transformer que genera tokens de audio mediante un codec neuronal (el repositorio referencia un tokenizador de audio a 12 Hz, cuantizado a su vez en q8_0 y nvfp4). La colección incluye variantes de 0,6B (base y clonación) y 1,7B (voice design), lo que sugiere que el modelo base de 1,92 B de parámetros se despliega en distintos tamaños o configuraciones. La síntesis se realiza de forma autoregresiva sobre tokens de audio que después se decodifican a waveform.

No se dispone de información publicada sobre el corpus de entrenamiento, el número de tokens ni el proceso de ajuste fino (RLHF, DPO u otros) del modelo base jmtl/hk-cantonese-cc0-qwen3-tts. La innovación técnica principal de esta publicación no está en el modelo sino en el ecosistema de ejecución: los kernels de cómputo GGUF propios ("pig engine" / gk) y la herramienta de línea de comandos `ggk`, que permite inferencia TTS local con clonación de voz mediante audio de referencia (con o sin texto de referencia, estilo in-context learning) y diseño de voz mediante instrucciones en lenguaje natural.

## Capacidades

- Síntesis de texto a voz (TTS) en cantonés de Hong Kong, con ejemplos de audio disponibles en la model card.
- Síntesis también en inglés, según los ejemplos incluidos ("Welcome to GGUF!...").
- Clonación de voz a partir de un archivo de audio de referencia (parámetro `-r`).
- Clonación de voz con texto de referencia explícito (in-context learning de voz, parámetro `--reference-text`).
- Diseño de voz mediante instrucciones en lenguaje natural (por ejemplo, "A warm, low female voice, speaking slowly") con la variante de 1,7B.
- Ejecución local mediante kernels GGUF optimizados (gk), sin necesidad de servidor de inferencia pesado.
- Obtención del tokenizador TTS mediante el paquete `gguf-connector` (comando `ggc q3t`).

No hay indicios de capacidades de generación de texto, razonamiento, código, visión ni de tool calling: se trata de un modelo TTS especializado.

## Casos de uso

- Locución de contenido en cantonés: generación de locuciones para vídeos, podcasts o material educativo dirigido al público de Hong Kong, aprovechando la especialización en cantonés que la mayoría de TTS genéricos no cubre bien.
- Clonación de voz para producción de audio: crear narraciones con una voz concreta a partir de una muestra de referencia, útil para audiolibros o contenidos de marca con voz consistente.
- Diseño de voces personalizadas: definir el timbre, tono y ritmo de la voz mediante instrucciones textuales para prototipar personajes o asistentes de voz sin grabar actores.
- Asistentes de voz locales y offline: integración en aplicaciones de escritorio o edge que necesiten respuesta hablada en cantonés sin enviar datos a la nube, gracias al formato GGUF y a la ejecución local.
- Accesibilidad: lectura en voz alta de textos en cantonés para usuarios con dificultades visuales o de lectura, con despliegue ligero en hardware de consumo.
- Prototipado y evaluación de TTS: uso en pipelines de investigación para comparar cuantizaciones (q8_0 frente a nvfp4) y medir la calidad de audio resultante en local.
- Generación de datos sintéticos de voz: creación de corpus de audio en cantonés para entrenar o evaluar sistemas de reconocimiento de voz (ASR) o de diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye muestras de audio generadas, pero ninguna métrica cuantitativa (WER, MOS, SIM, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño (variantes de 0,6B y 1,7B en q8_0 y nvfp4) y el tamaño total del repositorio (11,6 GB), cabe esperar requerimientos modestos, compatibles con GPU de consumo e incluso CPU, pero no hay cifras publicadas.
- GPU recomendadas: no disponible; por el formato GGUF y el tamaño reducido, cualquier GPU moderna de consumo (por ejemplo, serie RTX) debería ser suficiente, aunque no hay recomendaciones oficiales.
- Consumer GPU: por tamaño y formato, es plausible que funcione en GPUs de consumo comunes (8 GB de VRAM o menos), aunque no está confirmado por el autor.
- Opciones de despliegue: herramienta propia `ggk` (línea de comandos) con los kernels GGUF gk ("pig engine"); tokenizador TTS descargable vía `gguf-connector` (`ggc q3t`). No consta soporte en llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gguf-org/cantonese-gguf | ≈1,92 B (variantes 0,6B y 1,7B) | TTS cantonés, clonación y diseño de voz | GGUF (q8_0, nvfp4) | Apache 2.0 | Ejecución local con kernels gk propios |
| jmtl/hk-cantonese-cc0-qwen3-tts (base) | ≈1,92 B | TTS cantonés | safetensors | CC0 | Modelo original sin cuantizar |
| Qwen3-TTS (familia base) | 0,6B / 1,7B según variantes | TTS multilingüe (inglés, chino) | safetensors / GGUF | Según versión de Qwen | Modelo del que deriva esta colección |

No se dispone de datos comparativos de rendimiento cuantitativo entre estos modelos.

## Limitaciones y advertencias

- El proyecto es muy reciente (creado en octubre de 2026) y con tracción mínima (440 descargas, 1 like), por lo que la madurez, la documentación y el soporte comunitario son limitados.
- No hay benchmarks ni métricas de calidad de voz publicadas; la calidad debe evaluarse con las muestras de audio de la model card.
- La información sobre el modelo base (datos de entrenamiento, contexto, idiomas exactos) no está disponible, lo que dificulta evaluar su idoneidad para producción.
- La inferencia depende de herramientas propias del ecosistema gguf-org (`ggk`, `ggc`, kernels gk), no de runtimes estándar como llama.cpp, lo que puede suponer un riesgo de mantenimiento a largo plazo.
- La clonación de voz plantea riesgos éticos y legales (suplantación de identidad, deepfakes de audio); debe usarse solo con consentimiento del titular de la voz.
- La licencia de esta cuantización es Apache 2.0 y el modelo base es CC0, ambos compatibles con uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento del modelo original, que no está documentada.
- Al ser un TTS especializado, no sirve como modelo de lenguaje de propósito general.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gguf-org/cantonese-gguf
- Modelo base: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts
- Kernels de cómputo GGUF (pig engine / gk): https://github.com/gguf-io/gk
- Repositorio gguf-desktop (captura referenciada en la model card): https://github.com/gguf-org/gguf-desktop
