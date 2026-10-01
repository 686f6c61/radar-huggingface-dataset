# loom-ai-org/speecht5-tts-loom

## Resumen

SpeechT5 TTS Loom es una exportación al formato GGUF del modelo de síntesis de voz `microsoft/speecht5_tts`, publicada por el colectivo loom-ai-org para ejecutarse con el runtime loom.cpp a través del binding de Python `loom-py-rt`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los originales de Microsoft, empaquetados en un único fichero autodescriptivo que incluye las topologías de grafo, el tokenizador y el script de control necesarios para la inferencia, además del vocoder HiFi-GAN (`microsoft/speecht5_hifigan`) dentro del mismo contenedor.

El modelo resuelve la conversión de texto a audio en inglés con una arquitectura encoder-decoder: un codificador de texto y un decodificador autorregresivo que predice tramas de mel-espectrograma a 16 kHz, seguido del vocoder que genera la forma de onda. Cuenta con 158.989.848 parámetros en el modelo TTS (según los pesos en safetensors del repositorio, unos 159 millones), y el repositorio completo ocupa 0,6 GB. La relevancia de esta ficha es práctica: permite desplegar un TTS ligero con licencia MIT sobre CPU o GPU modesta sin depender de la pila de Transformers ni de un fonemizador externo, ya que el propio modelo codifica el texto.

La exportación mantiene la licencia MIT heredada del modelo base y está pensada para su uso desde código Python con una API de alto nivel (`model.text2speech.infer(...)`) o mediante el driver embebido para acceso a parámetros de bajo nivel. El modelo es monolingüe (inglés), está entrenado sobre LibriTTS y ofrece siete voces predefinidas del corpus CMU ARCTIC además de permitir voces propias a partir de un x-vector de 512 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para TTS (SpeechT5) con decodificador autorregresivo de mel-espectrograma y vocoder HiFi-GAN |
| Parametros totales | 158.989.848 (modelo TTS); el vocoder HiFi-GAN incluido en el mismo GGUF no se desglosa en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS, no conversacional; el decodificador se detiene como maximo a los 10 pasos por caracter de entrada, 20 tramas, 0,32 s) |
| Tipos de cuantizacion | No disponible (exportacion GGUF; el repositorio no detalla niveles de cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (fichero unico autodescriptivo con grafos, tokenizador y driver embebidos) |
| Frecuencia de muestreo | 16 kHz |
| Voces incluidas | slt (integrada, mujer estadounidense) mas clb, bdl, rms, awb, jmk y ksp como ficheros GGUF en `voices/` |
| Modelo base | microsoft/speecht5_tts (pesos sin modificar) |
| Libreria de inferencia | loom-py-rt (runtime loom.cpp) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

SpeechT5 es una arquitectura de preentrenamiento encoder-decoder unificada para tareas de habla y texto, presentada por Microsoft Research. En su variante TTS, un codificador procesa el texto de entrada y un decodificador autorregresivo predice tramas de mel-espectrograma; la forma de onda final la produce un vocoder HiFi-GAN independiente. En esta exportación ambos componentes viajan en un solo GGUF: el modelo TTS y `microsoft/speecht5_hifigan`. El modelo incorpora su propio tokenizador de texto, de modo que no requiere un fonemizador externo.

El modelo fue entrenado sobre LibriTTS, un corpus de audiolibros en inglés. La model card del autor no proporciona el número de tokens ni la composición detallada del dataset, ni indica si hubo fases de RLHF o DPO (no aplicable en la práctica a este tipo de tarea). Sí documenta dos particularidades relevantes de la inferencia: el dropout de la prenet del decodificador permanece activo durante la generación (una decisión heredada de Tacotron 2), de manera que cada trama depende de un sorteo aleatorio; loom-py fija la semilla a 0 por defecto, de modo que la misma llamada produce el mismo audio y otra semilla produce otra toma. El autor indica que la salida se verificó contra `generate_speech` de Transformers con los sorteos fijados, obteniendo el mismo número de tramas y una forma de onda con una diferencia de 6e-06 rms.

## Capacidades

- Síntesis de voz en inglés a partir de texto plano, con salida de audio a 16 kHz.
- Codificación de texto integrada: no necesita fonemizador ni pipeline de normalización externo.
- Selección de voz mediante embeddings de hablante (x-vector de 512 números extraído con `spkrec-xvect-voxceleb` de SpeechBrain); se incluyen siete voces CMU ARCTIC (slt, clb, bdl, rms, awb, jmk, ksp).
- Uso de voces personalizadas: cualquier x-vector del extractor mencionado puede convertirse a un fichero de voz GGUF con `loom_exporter.speecht5_voices`.
- Control de aleatoriedad mediante semilla, lo que permite reproducibilidad exacta o variación entre tomas.
- API de dos niveles: una puerta de alto nivel por tarea (`model.text2speech.infer`) y acceso directo al driver embebido mediante `model.infer(...)`, cuyo código fuente se puede inspeccionar con `model.driver_source`.
- Capacidad de autoregresión controlada por una cabeza de parada propia del modelo.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada ni razonamiento multi-paso.

## Casos de uso

- Lectura de contenido editorial: convertir artículos, documentación o boletines en audio con una de las voces predefinidas; el modelo cabe en CPU y no necesita acelerador, lo que abarata la generación por lotes.
- Audiolibros y narración: las siete voces CMU ARCTIC permiten alternar narradores por capítulo, y el control de semilla facilita regenerar tomas concretas con resultados idénticos.
- Accesibilidad y lectores de pantalla: integración en aplicaciones que necesiten locución local en inglés, sin dependencia de servicios en la nube ni de claves de API.
- Avisos y mensajes de sistema: generación de locuciones cortas para aplicaciones de escritorio o dispositivos embebidos, donde el tamaño de 0,6 GB y la licencia MIT son determinantes.
- Doblaje y prototipado de voz: creación de audios de prueba con una voz propia entrenada a partir de un x-vector personal, útil para validar guiones antes de una grabación profesional.
- Generación de datos sintéticos de audio: producción de muestras de voz en inglés para aumentar datasets de ASR o para pruebas de robustez de otros sistemas, variando semilla y voz.
- Docencia e investigación en TTS: el driver embebido y la estructura GGUF autodescriptiva permiten inspeccionar y modificar parámetros de decodificación sin reconstruir el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una verificación de fidelidad frente a Transformers: con los sorteos aleatorios fijados, el número de tramas coincide y la diferencia de la forma de onda es de 6e-06 rms.

## Requisitos de hardware

- Estimación de VRAM (solo pesos, calculada a partir de los 158.989.848 parámetros del modelo TTS; el vocoder añade un consumo no desglosado): en fp32, unos 636 MB; en fp16/bf16, unos 318 MB; en int8, unos 159 MB. El repositorio completo ocupa 0,6 GB.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas o en CPU, dado el tamaño del modelo.
- No se especifican GPUs recomendadas por el autor en la información disponible.
- Opciones de despliegue documentadas: loom.cpp a través de `loom-py-rt` (instalable con `pip install -U "loom-py-rt[hub]"`), con carga directa desde el Hub mediante `loom.Model.from_pretrained`.
- Otras opciones de despliegue como vLLM, llama.cpp, Ollama o TGI no están documentadas para esta exportación en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| speecht5-tts-loom | 158.989.848 (mas vocoder no desglosado) | Ingles | No aplica (TTS) | MIT | GGUF | HuggingFace (loom-ai-org) |
| microsoft/speecht5_tts | 158.989.848 | Ingles | No aplica (TTS) | MIT | safetensors | HuggingFace (microsoft); requiere vocoder aparte |
| Piper (familia VITS) | No disponible | Multiples segun voz | No aplica (TTS) | MIT en el motor; la licencia varia por voz | ONNX | Repositorio y voces distribuidas por el proyecto |
| XTTS-v2 (Coqui) | No disponible | Multilingue | No aplica (TTS) | Coqui Public Model License (uso comercial restringido) | No disponible | HuggingFace (coqui) |

La comparación con Piper y XTTS-v2 se ofrece a título orientativo; los datos de parámetros y contexto de esos sistemas no figuran en la información proporcionada y por tanto se marcan como no disponibles.

## Limitaciones y advertencias

- Idiomas: solo inglés, entrenado sobre LibriTTS. No hay soporte multilingüe.
- Números: el vocabulario no contiene dígitos, por lo que una cadena como "2026" llega al modelo como token desconocido. Es necesario deletrear las cantidades antes de la inferencia.
- Aleatoriedad: el dropout de la prenet del decodificador permanece activo en inferencia, de modo que cada trama depende de un sorteo. Sin semilla explícita, loom-py usa 0; conviene fijarla para reproducibilidad en producción.
- Duración y parada: el modelo se detiene con su propia cabeza de parada y como máximo a diez pasos de decodificador por carácter de entrada (20 tramas, 0,32 s), lo que acota la longitud de la salida y limita entradas muy largas.
- Frecuencia de muestreo: hay que pasar `sample_rate=16000` de forma explícita. Una tasa incorrecta no provoca un error, sino que reproduce la voz a una velocidad equivocada.
- Riesgo de alucinación acústica: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas, entonación anómala o artefactos en textos con vocabulario poco frecuente; no se han publicado evaluaciones formales de inteligibilidad o naturalidad (MOS) en la información disponible.
- Sesgos: no se documentan análisis de sesgo de género, acento o procedencia. Las voces incluidas proceden del corpus CMU ARCTIC y tienen acentos estadounidense, escocés, canadiense e indio, pero no hay información sobre cobertura de otros perfiles.
- Licencia: el modelo y el vocoder son MIT, lo que permite uso comercial. Los ficheros de voz derivan de grabaciones de CMU ARCTIC, que se declaran "free for use for any purpose (commercial or otherwise)" siempre que se conserve el aviso de copyright de Carnegie Mellon University; cada fichero de voz registra su licencia y origen en `loom.voice.license` y `loom.voice.origin`. Si se genera una voz propia, es responsabilidad del usuario contar con los derechos sobre el x-vector de origen.
- Ecosistema: la ejecución depende del runtime loom.cpp y del paquete `loom-py-rt`; no se documenta compatibilidad con vLLM, TGI, Ollama u otros servidores de inferencia.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/speecht5-tts-loom
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
- Vocoder HiFi-GAN: https://huggingface.co/microsoft/speecht5_hifigan
- Repositorio del motor: https://github.com/loom-ai-org/loom.cpp
- Herramienta de exportacion: https://github.com/loom-ai-org/loom-exporter
- Binding de Python: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: loom-py-rt
- Voces CMU ARCTIC (x-vectors): https://huggingface.co/Matthijs/cmu-arctic-xvectors
- Extractor de x-vectors de SpeechBrain: spkrec-xvect-voxceleb
- Paper de SpeechT5: https://arxiv.org/abs/2110.07205
- Paper de HiFi-GAN: https://arxiv.org/abs/2010.05646

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces encontrados corresponden a productos no relacionados que comparten el nombre "Loom" (grabador de pantalla y una marca de ropa), por lo que se han omitido.
