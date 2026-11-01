# nativ-community/Audio8-TTS-Realistic-0.6b-4bit

## Resumen

Audio8-TTS-Realistic-0.6b-4bit es una conversión al formato MLX y cuantización a 4 bits del modelo de síntesis de voz Edge0/Audio8-TTS-Realistic-0.6b, publicada por el colectivo nativ-community. Se trata de un modelo de text-to-speech (TTS) con capacidad de clonación de voz zero-shot y soporte multilingüe en 23 idiomas, diseñado específicamente para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería mlx-audio.

El modelo genera audio mono a 44.1 kHz e incorpora su propio códec en el repositorio, de modo que la inferencia en tiempo de ejecución no requiere PyTorch ni código remoto. La arquitectura subyacente es un modelo DualAR (autorregresivo dual), y la conversión conserva la precisión original del códec al cuantizar únicamente el modelo principal a 4 bits.

Su relevancia actual radica en que permite desplegar un sistema TTS realista con clonación de voz en equipos Mac sin GPU dedicada, con un peso de repositorio de 1,7 GB y 938.556.145 parámetros reales en safetensors. La licencia Apache 2.0 facilita su uso comercial, y el presupuesto de contexto compartido de 2.048 posiciones entre texto, audio de referencia y frames generados acota el tamaño de las entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (autorregresiva dual) con codec de audio integrado |
| Parametros totales | 938.556.145 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 posiciones compartidas entre texto, audio de referencia y frames generados |
| Tipos de cuantizacion | 4-bit (modelo DualAR); el codec conserva su precision original |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue (23 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx-audio) |
| Frecuencia de muestreo de salida | 44.1 kHz mono |
| Tamano del repositorio | 1,7 GB |
| Modelo base | Edge0/Audio8-TTS-Realistic-0.6b |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR, un esquema autorregresivo dual que combina la generación de tokens de audio con un codec neural integrado que reconstruye la forma de onda final. La conversión a MLX mantiene el codec en su precisión original mientras cuantiza el modelo DualAR a 4 bits, lo que reduce el peso sin degradar la calidad de reconstrucción del audio. La generación devuelve una forma de onda completa por llamada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base Edge0/Audio8-TTS-Realistic-0.6b es el origen de los pesos, y esta publicación se limita a la conversión de formato y cuantización para el ecosistema MLX. La innovación técnica destacable es la integración del códec en el propio repositorio, lo que elimina dependencias de PyTorch y de código remoto en tiempo de inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) de alta calidad con salida mono a 44.1 kHz.
- Clonación de voz zero-shot mediante audio de referencia y su transcripción exacta (`ref_audio` y `ref_text`).
- Soporte multilingüe en 23 idiomas, incluidos chino, inglés, japonés, coreano, español, francés, alemán, italiano, ruso, árabe, hindi, tailandés, vietnamita y cantonés.
- Generación de una forma de onda completa por llamada, sin streaming parcial documentado.
- Ejecución nativa en Apple Silicon mediante mlx-audio, sin requerir PyTorch en tiempo de ejecución.
- Interfaz de línea de comandos (`python -m mlx_audio.tts.generate`) y API de Python (`mlx_audio.tts.utils.load`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al ser un modelo especializado en TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede convertir textos largos en voz natural a 44.1 kHz, adecuado para producción de contenido narrado con calidad de emisión.
- Clonación de voz para doblaje: pasando un audio de referencia y su transcripción, se puede replicar la voz de un locutor para generar nuevas locuciones en cualquiera de los 23 idiomas soportados.
- Asistentes de voz en aplicaciones macOS/iOS: al ejecutarse sobre MLX en Apple Silicon, permite integrar TTS local sin enviar texto a servicios en la nube, reduciendo latencia y preservando privacidad.
- Accesibilidad: generación de voz para lectores de pantalla y sistemas de asistencia para personas con discapacidad visual, con voces personalizables mediante clonación.
- Prototipado de interfaces conversacionales: desarrolladores que necesitan un TTS multilingüe para probar flujos de diálogo en varios idiomas sin depender de APIs externas.
- Generación de contenido para vídeo y pódcast: producción de voces en off en múltiples idiomas con una sola referencia de voz, útil para localización de contenido audiovisual.
- Investigación en síntesis de voz: al ser un modelo pequeño (938 M parámetros) y cuantizado a 4 bits, sirve como base para experimentos de TTS en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 1,7 GB en formato 4-bit, por lo que se requiere aproximadamente esa cantidad de memoria unificada para cargar el modelo, más overhead de inferencia.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y posteriores) mediante MLX; no se documenta soporte para GPU NVIDIA o AMD.
- Cabe en equipos consumer Apple: sí, en cualquier Mac con al menos 8 GB de memoria unificada, aunque se recomienda 16 GB para margen operativo.
- Opciones de despliegue: mlx-audio (API Python y CLI). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de audio y no de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b-4bit | 938 M | 2.048 posiciones | 23 | Apache 2.0 | MLX (Apple Silicon) |
| Edge0/Audio8-TTS-Realistic-0.6b (base) | no disponible | no disponible | 23 | Apache 2.0 | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada para establecer una comparativa con datos verificables de rendimiento.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS: no realiza razonamiento, generación de texto, código ni tool calling.
- La clonación de voz puede emplearse para suplantación de identidad; es responsabilidad del usuario obtener consentimiento y cumplir la normativa aplicable sobre síntesis de voz.
- El contexto de 2.048 posiciones es compartido entre texto, audio de referencia y frames generados, lo que limita la longitud de las entradas y de las referencias de clonación.
- No se documentan sesgos específicos del modelo, pero al ser un TTS multilingüe puede reflejar sesgos presentes en los datos de entrenamiento del modelo base (no disponibles).
- Riesgo de alucinación acústica: en textos fuera de distribución o idiomas con pocos datos, la pronunciación y prosodia pueden degradarse.
- La cuantización a 4 bits puede introducir una ligera pérdida de calidad frente al modelo base en precisión completa, aunque el códec conserva su precisión original.
- Requiere hardware Apple Silicon; no es desplegable en GPU NVIDIA sin conversión adicional no documentada.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Edge0/Audio8-TTS-Realistic-0.6b.

## Enlaces

- HuggingFace: https://huggingface.co/nativ-community/Audio8-TTS-Realistic-0.6b-4bit
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Librería mlx-audio: no disponible en la información proporcionada
- Paper: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
