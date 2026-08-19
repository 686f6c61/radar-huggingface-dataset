# mailTester/quran-verse-finder-models

## Resumen

`mailTester/quran-verse-finder-models` es una conversión a formato GGML del modelo `tarteel-ai/whisper-base-ar-quran`, un fine-tune de OpenAI Whisper base especializado en transcripción de recitación coránica en árabe. El modelo fue convertido mediante la herramienta `convert-h5-to-ggml.py` de whisper.cpp y cuantizado a q5_1, lo que lo hace extremadamente ligero (0,1 GB) y apto para inferencia en CPU y dispositivos de bajo consumo.

El propósito declarado del modelo es servir como componente de transcripción en sistemas de búsqueda de versículos del Corán: convierte audio de recitación en texto árabe que puede combinarse con motores de búsqueda semántica o embeddings para localizar versículos concretos. Su relevancia radica en que democratiza el acceso a un modelo de ASR especializado en árabe coránico, con licencia Apache-2.0 y un formato optimizado para despliegue en entornos con recursos limitados.

Al estar basado en Whisper base, hereda su arquitectura encoder-decoder transformer con aproximadamente 74 millones de parámetros y una ventana de contexto de 30 segundos de audio por segmento. Es importante señalar que el repositorio cuenta con 0 descargas y 0 likes, lo que indica que es un modelo recién publicado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper base) |
| Parametros totales | ~74 millones (heredados de Whisper base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio por segmento |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | Arabe coranico (segun el modelo fuente tarteel-ai/whisper-base-ar-quran); campo de idiomas en HuggingFace no especificado |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (convertido desde H5 con whisper.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de OpenAI Whisper base: un transformer encoder-decoder que procesa audio como espectrogramas log-Mel de 80 canales. El encoder procesa ventanas de 30 segundos de audio y el decoder genera tokens de texto autoregresivamente. Whisper base fue preentrenado sobre 680.000 horas de audio supervisado multilingüe, y el fine-tune `tarteel-ai/whisper-base-ar-quran` lo especializó para recitación coránica en árabe.

La conversión a GGML se realizó con `convert-h5-to-ggml.py` de whisper.cpp, y posteriormente se cuantizó a q5_1 (cuantización de 5 bits con bloque de 1 bit adicional para escala). Este proceso reduce significativamente el tamaño del modelo (~0,1 GB frente a ~300 MB en fp32) con una degradación mínima de precisión. No se dispone de información detallada sobre la composición exacta del dataset de fine-tune ni sobre el proceso de entrenamiento (número de épocas, estrategia de regularización, etc.).

## Capacidades

- Transcripción de audio a texto en árabe coránico (speech-to-text).
- Reconocimiento de recitación del Corán con precisión adaptada al registro lingüístico coránico.
- Procesamiento de audio en segmentos de hasta 30 segundos, permitiendo transcripción de versículos completos en un solo paso.
- Integración con pipelines de búsqueda semántica: el texto transcrito puede alimentar motores de búsqueda basados en embeddings para localizar versículos.
- Inferencia en CPU sin necesidad de GPU gracias al formato GGML cuantizado.
- Compatibilidad con el ecosistema whisper.cpp, incluyendo bindings para C, Python, y CLI.

No se han confirmado capacidades de tool calling, razonamiento multi-paso, ni soporte de agentes, ya que se trata de un modelo de ASR puro, no de un LLM conversacional.

## Casos de uso

- Transcripción de recitación coránica: el modelo puede convertir grabaciones de audio de recitación en texto árabe, facilitando la documentación y el análisis de recitaciones. Es adecuado por su especialización en árabe coránico y su bajo coste de inferencia.

- Búsqueda de versículos por voz: integrado en una aplicación móvil o web, el usuario recita un pasaje y el modelo lo transcribe; el texto resultante se envía a un índice semántico (por ejemplo, con Sentence-Transformers) para localizar el versículo exacto en el Corán. Su formato GGML permite ejecutarlo en el dispositivo sin latencia de red.

- Herramientas educativas para memorización: estudiantes de hifz pueden grabar su recitación y el modelo la transcribe para compararla con el texto canónico, detectando errores de pronunciación o saltos de versículos. La ventana de 30 segundos es suficiente para versículos cortos y medios.

- Accesibilidad para personas con discapacidad visual: una aplicación que recibe audio de recitación y devuelve el texto del versículo en formato legible por lectores de pantalla. El modelo es ligero y puede ejecutarse en dispositivos móviles de gama baja.

- Análisis lingüístico del Corán: investigadores pueden transcribir corpus de recitaciones para estudios fonéticos, de tajweed o de variantes de recitación (qira'at). La licencia Apache-2.0 permite uso académico sin restricciones.

- Aplicaciones islámicas con control por voz: integración en apps de oración o calendario islámico para que el usuario pueda buscar versículos o suras mediante comandos de voz en árabe, sin depender de APIs externas de pago.

- Verificación de recitación en entornos offline: en regiones con conectividad limitada, el modelo permite transcribir recitaciones localmente sin enviar audio a servidores externos, lo que también protege la privacidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye métricas de evaluación (WER, CER, etc.) para esta conversión específica, ni el modelo card del modelo fuente `tarteel-ai/whisper-base-ar-quran` proporciona datos comparativos. Se recomienda evaluar el modelo con un conjunto propio de recitaciones coránicas de referencia antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: 0 MB (inferencia en CPU pura; no requiere GPU).
- RAM necesaria: aproximadamente 200-300 MB para cargar el modelo GGML q5_1 (0,1 GB) más overhead del runtime de whisper.cpp.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna con soporte de instrucciones AVX o NEON es suficiente.
- Compatibilidad con consumer hardware: sí, el modelo cabe en cualquier dispositivo, incluyendo Raspberry Pi 4/5, smartphones Android/iOS y portátiles de gama baja.
- Opciones de despliegue: whisper.cpp (CLI y bindings en C/Python), whisper-cpp-python, y cualquier framework que soporte modelos GGML. No es compatible directamente con vLLM, TGI u Ollama, que están orientados a LLMs.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia arquitectónica, Whisper base en formato GGML suele transcribir 30 segundos de audio en 1-3 segundos en una CPU moderna, pero estos valores no estan confirmados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Cuantizacion | Especializacion | Licencia |
|---|---|---|---|---|---|
| mailTester/quran-verse-finder-models | GGML | ~74M | q5_1 | Arabe coranico | Apache-2.0 |
| tarteel-ai/whisper-base-ar-quran | H5 | ~74M | fp32 | Arabe coranico | Apache-2.0 |
| OpenAI Whisper base | H5/Safetensors | ~74M | fp32 | Multilingue general | MIT |

La comparativa se limita al modelo fuente y al modelo base, ya que no se dispone de datos sobre otros modelos de ASR especializados en árabe coránico en formato GGML. La principal diferencia entre esta conversión y su fuente es el formato (GGML frente a H5) y la cuantización (q5_1 frente a fp32), lo que reduce el tamaño en aproximadamente un 70 % a costa de una posible degradación mínima en precisión. Frente a Whisper base, este modelo ofrece mejor precisión en recitación coránica por su fine-tune específico, pero pierde la capacidad multilingüe general.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para árabe coránico; su rendimiento en árabe coloquial, otros dialectos o idiomas extranjeros no está garantizado y probablemente sea deficiente.
- Cuantización q5_1: la cuantización a 5 bits puede introducir errores de transcripción adicionales en comparación con el modelo fp32 original, especialmente en audio con ruido de fondo o recitaciones con tajweed complejo.
- Ventana de contexto limitada: cada segmento de audio se procesa en bloques de 30 segundos; versículos largos o recitaciones continuas requieren segmentación previa, lo que puede perder contexto entre segmentos.
- Sin datos de evaluación publicados: no hay métricas de WER o CER disponibles, por lo que el rendimiento real en producción es desconocido.
- Repositorio sin validación comunitaria: con 0 descargas y 0 likes, el modelo no ha sido probado ni validado por la comunidad; se recomienda verificar su funcionamiento antes de integrarlo en proyectos críticos.
- Formato GGML heredado: el formato GGML es el predecesor de GGUF y está considerado obsoleto por la comunidad; algunas herramientas modernas pueden no soportarlo, y se recomienda considerar la conversión a GGUF para mayor compatibilidad.
- Sin soporte de metadatos: el modelo card no especifica la versión exacta de Whisper base utilizada ni los detalles del dataset de fine-tune, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mailTester/quran-verse-finder-models
- Perfil del autor en HuggingFace: https://huggingface.co/mailTester/models
- Modelo fuente tarteel-ai/whisper-base-ar-quran: no disponible (referenciado en el model card)
- Proyecto QuranAI: https://quranai.org/
- Repositorio de referencia para búsqueda de versículos: https://github.com/Martysunshine/Quran-verse-finder
- Proyecto QURAN-NLP: https://github.com/islamAndAi/QURAN-NLP
