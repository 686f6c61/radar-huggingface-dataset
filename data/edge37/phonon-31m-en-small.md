# edge37/phonon-31m-en-small

## Resumen

phonon-31m-en-small es una compilación optimizada en tamaño del modelo de síntesis de voz gradium/phonon-31m-en, publicada por el usuario edge37. No se trata de un modelo nuevo: la red neuronal, el tokenizador y la voz son idénticos a los del modelo padre; lo único que cambia es la distribución de cuantización del archivo GGUF. El resultado pasa de 64,5 MB a 43,2 MB, una reducción del 33 %, manteniendo la calidad de voz dentro de la variación natural entre tomas del modelo original.

El modelo resuelve un problema muy concreto: desplegar TTS de calidad en dispositivos con recursos limitados (on-device, streaming) sin sacrificar fidelidad de voz. Para ello aplica una asignación de bits no uniforme guiada por la sensibilidad de salida medida en el runtime real: el bucle autorregresivo del transformer Flow-LM se mantiene en Q8_0, mientras que el decodificador Mimi baja a Q6_K y sus bloques convolucionales residuales a Q5_K.

Con 41.096.035 parámetros reales en safetensors y una arquitectura de TTS en streaming, el modelo está pensado para inferencia local en inglés con la librería ptts. Su relevancia actual radica en que demuestra una técnica de cuantización selectiva (weight-space programming) aplicable a otros modelos pequeños de audio, y en que ofrece una alternativa práctica para asistentes de voz embebidos con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en streaming con Flow-LM transformer (bucle frame-by-frame) y decodificador Mimi (transformer + bloques convolucionales residuales) |
| Parametros totales | 41.096.035 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (Flow-LM y embeddings), Q6_K (decodificador Mimi transformer), Q5_K (bloques conv residuales Mimi); empaquetado en GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (heredada de gradium/phonon-31m-en) |
| Formato de pesos | GGUF exclusivamente; no incluye model.safetensors |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del padre gradium/phonon-31m-en. Se compone de un transformer Flow-LM que opera en un bucle autorregresivo frame a frame, un conjunto de embeddings de tiempo, final y condicionamiento en la cabeza Flow, tablas de condicionamiento de texto y voz, y un decodificador Mimi con transformer y bloques convolucionales residuales. El tokenizador y la voz (Easton) son los del modelo original.

No se ha reentrenado nada: el proceso de creación (`shrink_phonon.py`) descarga los pesos originales del Hub, los recuantiza con formatos de bloque compatibles con llama.cpp (Q8_0, Q6_K, Q5_K) y escribe un nuevo GGUF. La innovación técnica es la asignación de bits por sensibilidad medida: el bucle mantiene 8 bits porque un error ahí se realimenta como entrada del siguiente frame y se acumula, mientras que el decodificador se aplica una sola vez por frame y admite mayor compresión. Los datos de entrenamiento (número de tokens, composición, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto, con la voz Easton.
- Generación de audio en streaming, adecuada para reproducción incremental.
- Inferencia on-device gracias a su tamaño reducido (43,2 MB en GGUF).
- Salida en formato WAV mediante la librería ptts.
- Soporte de selección de voz y cuantización en tiempo de carga (`--voice`, `--quant`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistentes de voz embebidos: el modelo cabe en 43,2 MB y puede ejecutarse en dispositivos con poca memoria, permitiendo lectura de notificaciones o respuestas habladas sin conexión a la nube.
- Lectura por voz en aplicaciones móviles: con generación en streaming, se puede empezar a reproducir audio mientras se sintetiza el resto, reduciendo la latencia percibida en lectores de artículos o mensajes.
- Sistemas de navegación y automoción: la voz Easton y el bajo coste computacional permiten integrar TTS local en paneles de vehículo sin depender de conectividad.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en entornos de escritorio o IoT, donde el tamaño del binario es crítico.
- Prototipado rápido de interfaces de voz: al instalarse con `uvx ptts` y apuntar al repo, sirve para validar flujos de TTS en demos y pruebas de concepto sin infraestructura GPU.
- Juguetes y dispositivos IoT con audio: el modelo puede desplegarse en hardware de gama baja para respuestas habladas predefinidas o dinámicas, manteniendo la calidad dentro del ruido del modelo padre.

## Benchmarks y rendimiento

| Métrica | Padre (variación entre tomas) | Esta build |
|---|---|---|
| Distancia de habla a tomas independientes del padre (dB, menor es más cercano) | 1,972 | 1,988 |
| Tasa de error de palabra (word error) | 4,41 % | 3,80 % |

Medición sobre 3 semillas × 24 frases. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo (43,2 MB en GGUF) es plausible su ejecución en CPU y en GPUs de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No se especifica, aunque el tamaño del archivo sugiere que sí en la mayoría de GPUs consumer; falta confirmación oficial.
- Opciones de despliegue: librería ptts (CLI `uvx ptts` y API Python `ptts.TTS`); el GGUF es compatible con formatos de bloque de llama.cpp, pero no se documenta despliegue vía vLLM, TGI, Ollama o llama.cpp directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| edge37/phonon-31m-en-small | 41.096.035 | no disponible | Apache 2.0 | GGUF | 43,2 MB |
| gradium/phonon-31m-en (padre) | no disponible | no disponible | Apache 2.0 | GGUF (Q8 uniforme) | 64,5 MB |
| Otros TTS pequeños (p. ej. Piper, Kokoro) | no disponible | no disponible | variable | ONNX/GGUF | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- No incluye `model.safetensors`, por lo que la ruta de Transformers indicada en la model card del padre no es aplicable; solo funciona con el runtime GGUF de ptts.
- Es una recuantización del padre: no introduce mejoras de calidad, solo reduce tamaño; la fidelidad de voz se mantiene dentro de la variación entre tomas, pero no se garantiza paridad exacta.
- La asignación de bits se validó con la voz Easton; no se documenta el comportamiento con otras voces.
- Riesgo de alucinación y sesgos: no se documentan sesgos conocidos ni tasas de alucinación específicas para este modelo.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo padre y de los pesos originales.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.
- No se documentan límites de longitud de texto de entrada ni de contexto.

## Enlaces

- HuggingFace: https://huggingface.co/edge37/phonon-31m-en-small
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Blog sobre weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
