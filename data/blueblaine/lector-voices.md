# blueblaine/lector-voices

## Resumen

`blueblaine/lector-voices` es una conversión a Core ML del modelo de síntesis de voz Kokoro-82M, publicada por el usuario blueblaine como copia sin modificaciones del repositorio `mattmireles/kokoro-coreml` (revisión `034f7741bf938fd6b4b9c75c22bc72cd795f908a`), que a su vez convierte el modelo original `hexgrad/Kokoro-82M`. No se trata, por tanto, de un modelo entrenado desde cero ni de una variante con pesos nuevos: es un artefacto de despliegue pensado para ejecutarse en el ecosistema Apple (iOS, macOS) mediante el framework Core ML.

El interés práctico del repositorio es acotado: sirve como espejo del paquete de voces que consume la aplicación iOS Lector, de modo que cualquiera pueda verificar o reutilizar exactamente los mismos ficheros que distribuye dicha app. El modelo subyacente, Kokoro-82M, es un TTS compacto de 82 millones de parámetros conocido por su reducido coste computacional y su calidad razonable para su tamaño.

La información publicada por el autor es mínima: únicamente la licencia (Apache 2.0), la relación con el modelo base y la cadena de conversiones. No se documentan idiomas, arquitectura interna, datos de entrenamiento ni resultados de evaluación, por lo que buena parte de las filas de esta ficha quedan marcadas como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Kokoro-82M; artefacto convertido a Core ML) |
| Parámetros totales | 82 M (heredados del modelo base Kokoro-82M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud se mide en fonemas por utterance, no documentada) |
| Tipos de cuantizacion | no disponible (formato Core ML; el autor no detalla precisiones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquete `.mlpackage`/`.mlmodelc`; no se distribuyen safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura interna del modelo. Lo único verificable es la cadena de procedencia: `hexgrad/Kokoro-82M` (modelo TTS original de 82 M de parámetros) fue convertido a Core ML por mattmireles y posteriormente replicado sin cambios por blueblaine. La conversión a Core ML implica típicamente un grafo computacional serializado con pesos en precisión reducida (FP16 o similar), pero el autor no especifica la precisión ni las capas transformadas.

Tampoco se documentan datos de entrenamiento, número de tokens, composición del corpus, ni si hubo ajuste por RLHF o DPO. Al ser una copia de un artefacto de conversión, no cabe esperar innovaciones técnicas propias: el valor del repositorio es la reproducibilidad del binario, no la investigación sobre el modelo.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, heredada de Kokoro-82M.
- Ejecución en el ecosistema Apple mediante Core ML (integrables en apps iOS/macOS con `CoreML` o `MLModel`).
- Paquete de voces: el nombre del repositorio sugiere la inclusión de múltiples voces, aunque el autor no enumera cuántas ni con qué identificadores.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidades multilingües: no disponibles en la información publicada.

## Casos de uso

- Lectura por voz dentro de una app iOS: integración directa del paquete Core ML en una aplicación Swift para narrar texto sin conexión, aprovechando la aceleración por GPU/ANE del dispositivo.
- Audiolibros y previsualización de contenido: generación local de narración para artículos o documentos, evitando llamadas a servicios TTS en la nube y los costes asociados.
- Accesibilidad: conversión de texto a voz para usuarios con discapacidad visual en entornos Apple, con latencia baja al ejecutarse en el propio dispositivo.
- Verificación de reproducibilidad: uso del repositorio como referencia para comprobar que los ficheros distribuidos por la app Lector coinciden con la revisión declarada de `mattmireles/kokoro-coreml`.
- Prototipado de asistentes conversacionales offline: combinación con un LLM local en el dispositivo para respuestas habladas sin salida a red.
- Evaluación comparativa de TTS compactos: servir de baseline Core ML frente a otras alternativas en dispositivos Apple, dado su tamaño reducido (82 M) y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo de 82 M de parámetros y estar orientado a Core ML, el consumo de memoria es bajo (del orden de cientos de MB como máximo, aunque el autor no lo cuantifica).
- GPU recomendadas: no disponibles; el destino natural es el hardware Apple (SoC M-series, A-series) con aceleración por Neural Engine o GPU integrada.
- Compatibilidad con GPU de consumo: el formato Core ML no está pensado para GPUs NVIDIA/AMD en servidores; para despliegue en CUDA habría que recurrir al modelo original `hexgrad/Kokoro-82M`.
- Opciones de despliegue: Core ML en iOS/macOS; para otros entornos, el modelo base Kokoro-82M (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blueblaine/lector-voices | 82 M | no disponible | Core ML | Apache 2.0 | Hugging Face (37 descargas) |
| hexgrad/Kokoro-82M | 82 M | no disponible | safetensors / PyTorch | Apache 2.0 | Hugging Face (modelo original) |
| mattmireles/kokoro-coreml | 82 M | no disponible | Core ML | Apache 2.0 | Hugging Face (fuente de esta copia) |

No se dispone de datos de rendimiento comparado entre estas variantes; la diferencia principal es el formato de despliegue (Core ML frente a PyTorch) y la cadena de procedencia.

## Limitaciones y advertencias

- El repositorio es una copia sin modificaciones: no incorpora mejoras, correcciones ni ajustes respecto a `mattmireles/kokoro-coreml`.
- No se documentan idiomas soportados; no debe asumirse multilingüismo sin verificar el modelo base.
- No se especifican precisiones ni cuantizaciones, lo que dificulta estimar calidad y consumo reales en dispositivo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor; al ser TTS, los riesgos se trasladan a pronunciación incorrecta y artefactos de audio.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar también las condiciones del modelo original Kokoro-82M y de la conversión intermedia.
- El número de descargas (37) y la ausencia de likes sugieren poca validación comunitaria; para producción es preferible partir del repositorio original o del modelo base.
- El tamaño del repo (0,2 GB) es coherente con un paquete Core ML de un modelo de 82 M, pero no se detalla el contenido exacto (voces incluidas, ficheros de configuración).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/blueblaine/lector-voices
- Conversión intermedia: https://huggingface.co/mattmireles/kokoro-coreml
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
