# anayak16/kokoro-coreml-ane-int8

## Resumen

Kokoro-coreml-ane-int8 es una exportación cuantizada del modelo de síntesis de voz hexgrad/Kokoro-82M, publicada por el usuario anayak16 en Hugging Face. Se trata de una conversión a Core ML en la que las etapas que se ejecutan en el Neural Engine (ANE) de los chips Apple han sido comprimidas de float16 a int8, manteniendo intactos los grafos, las entradas y las salidas respecto a la exportación original de mattmireles/kokoro-coreml. El objetivo es claro: reducir el peso y el consumo de memoria de un TTS de 82 millones de parámetros para que pueda ejecutarse íntegramente en dispositivos iOS sin conexión a red.

El modelo base, Kokoro-82M, es un sistema de text-to-speech ligero y de alta calidad que se ha popularizado por su relación calidad/tamaño. Esta variante no introduce cambios arquitectónicos ni de vocabulario: reutiliza los 28 perfiles de voz en inglés y los ficheros de runtime del export original, de modo que la única diferencia sustantiva es la precisión de los pesos en las etapas desplegadas en el Neural Engine. La licencia Apache-2.0 facilita su integración en aplicaciones comerciales.

La relevancia de esta ficha radica en su carácter práctico: documenta una ruta de despliegue on-device para TTS en el ecosistema Apple, con cuantización selectiva por etapa y una evaluación de calidad medida en dB sobre log-mel. No obstante, el repositorio es reciente, sin descargas ni likes, y no incluye benchmarks estándar ni métricas de latencia o throughput.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (TTS neuronal con etapas separadas: duración, F0/N con LSTM, decoder-pre y generador); export Core ML por paquetes |
| Parametros totales | 82M (modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada de texto, no ventana de contexto) |
| Tipos de cuantizacion | int8 lineal simétrica por canal en etapas ANE; float16 en etapas CPU |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (paquetes .mlpackage); runtime kokoro-vocab.json y hnsf_weights.json |
| Libreria | coreml (coremltools 9.0) |
| Tamano del repo | 0.4 GB |
| Modelo base | hexgrad/Kokoro-82M (relación: quantized) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Kokoro-82M, un modelo de síntesis de voz que descompone la generación en etapas diferenciadas: predicción de duración, modelado de F0/N (con una LSTM), un decoder-pre y un generador final. En esta exportación, cada etapa se empaqueta como un grafo Core ML independiente, lo que permite asignar selectivamente cada una al Neural Engine o a la CPU. El generador aparece en dos variantes: una "folded" (plegada) que cabe entera en el ANE y otra por buckets que se ejecuta en CPU.

La cuantización se realizó con `coremltools.optimize.coreml.linear_quantize_weights` (coremltools 9.0), en modo `linear_symmetric`, dtype int8, granularidad `per_channel` y umbral de pesos 2048. Se mantuvieron en float los pesos que alimentan `conv_transpose` y `lstm`, la convolución final del generador (`conv_post`, 22×128×7), los tensores float32 y cualquier peso con canal de salida todo a cero. Las etapas de CPU se dejaron deliberadamente en float16 porque Core ML expande los pesos int8 en memoria de la app, mientras que float16 permanece mapeado desde fichero. No se documentan datos de entrenamiento, tokens ni procesos de RLHF/DPO, ya que se trata de una conversión del modelo base, no de un reentrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- 28 perfiles de voz en inglés incluidos en `voices/`.
- Ejecución on-device en iOS mediante Core ML, sin dependencia de servidor.
- Asignación híbrida de etapas: Neural Engine para las etapas cuantizadas y CPU para las etapas en float16.
- Dos modos de despliegue: generador plegado íntegro en ANE o generador por buckets en CPU para dispositivos con ANE limitado.
- Manejo de entradas difíciles: gritos, signos de exclamación múltiples, puntos suspensivos, guiones, líneas de una palabra, frases de 75 palabras, números, fechas, nombres y comillas anidadas (según la evaluación del autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones iOS: el modelo puede sintetizar texto de interfaces, notificaciones o artículos directamente en el dispositivo, aprovechando el Neural Engine y eliminando la latencia de red y los costes de inferencia en servidor.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla y apps de asistencia que requieren funcionamiento offline y baja latencia, con 28 voces disponibles para personalización.
- Audiolibros y contenido largo: la ventana de entrada es de texto y el modelo procesa frases de hasta 75 palabras según la evaluación del autor, por lo que puede encadenarse para narrar capítulos completos por segmentos.
- Asistentes de voz embebidos: combinado con un ASR y un LLM local, el TTS completa el bucle conversacional sin salir del dispositivo, algo crítico para privacidad.
- Aprendizaje de idiomas: pronunciación de frases en inglés con voces variadas para apps de práctica, ejecutándose sin conexión en iPhone o iPad.
- Prototipado y demos de TTS en macOS: al ejecutarse sobre Core ML, permite validar pipelines de voz en un Mac (el autor midió la calidad en un M2) antes de portar a iOS.
- Sistemas de navegación y avisos en vehículo o dispositivos empotrados Apple: anuncios de texto cortos con latencia local y sin dependencia de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo TTS. El autor sí reporta una evaluación de calidad subjetiva y objetiva limitada:

| Metrica | Resultado |
|---|---|
| Distancia log-mel tras alineamiento temporal (media) | 1.10–1.22 dB |
| Distancia log-mel máxima | 2.15 dB |
| Desviación de longitud | dentro de 50 ms |
| Pausas | idénticas al float16 |
| Clipping | ninguno |
| Referencia: float16 ANE vs CPU | 1.92 dB de diferencia |
| Conjunto de prueba | 27 líneas deliberadamente difíciles |
| Plataforma de medida | Mac con chip M2 |

No se dispone de datos de latencia, throughput ni consumo energético.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 0.4 GB; el modelo base tiene 82M de parámetros, por lo que el peso en memoria es moderado y apto para dispositivos móviles.
- Hardware objetivo: chips Apple con Neural Engine (iPhone, iPad, Mac con Apple Silicon). El autor validó la calidad en un M2.
- GPU dedicadas (A100, H100, RTX 4090): no aplican; el formato es Core ML, no CUDA.
- Cabe en hardware consumer Apple: sí, es precisamente su propósito; no se documentan requisitos mínimos de generación de chip.
- Despliegue: Core ML en iOS/macOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| anayak16/kokoro-coreml-ane-int8 | 82M | texto (TTS) | en | Apache-2.0 | Core ML | Etapas ANE en int8, on-device Apple |
| hexgrad/Kokoro-82M | 82M | texto (TTS) | múltiples (según modelo base) | Apache-2.0 | safetensors/PyTorch | Modelo original, sin optimización Core ML |
| mattmireles/kokoro-coreml | 82M | texto (TTS) | en | Apache-2.0 | Core ML | Export previo en float16; base directa de esta variante |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de otras lenguas en esta exportación.
- El resultado no es idéntico al float16 y el autor lo declara explícitamente; puede haber diferencias audibles en entradas extremas.
- La evaluación de calidad se limita a 27 líneas y a una única plataforma (M2); no hay validación en iPhone/iPad reales ni en otras generaciones de chip.
- No hay benchmarks estándar, métricas de latencia ni estudios de sesgo; se desconoce el comportamiento con acentos, nombres propios o texto no inglés.
- Riesgo de alucinación en el sentido de prosodia incorrecta o pronunciación errónea en palabras fuera del dominio de entrenamiento del modelo base.
- El repositorio tiene 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso en producción ni mantenimiento.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias del modelo base y del export original, así como los términos de las voces incluidas.
- Dependencia de coremltools 9.0 y del ecosistema Core ML; no es portable a otros runtimes sin reconversión.

## Enlaces

- Hugging Face: https://huggingface.co/anayak16/kokoro-coreml-ane-int8
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Export Core ML original: https://huggingface.co/mattmireles/kokoro-coreml
- Revisión del export original citada: `0c1d78b47d19f39be6bc0cf0d07316822ae879d4`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
