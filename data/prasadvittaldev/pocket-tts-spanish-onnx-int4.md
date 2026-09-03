# prasadvittaldev/pocket-tts-spanish-onnx-int4

## Resumen

Pocket TTS Spanish en formato int4 ONNX es una adaptación del modelo de síntesis de voz Pocket TTS desarrollado por Kyutai, cuantizada y empaquetada por Prasad Vittaldev para ejecutarse íntegramente en el navegador mediante WebAssembly y ONNX Runtime Web. El paquete completo ocupa 106 MB e incluye el modelo de lenguaje cuantizado a 4 bits, el codec Mimi (encoder y decoder) en int8 dinámico y un acondicionador de texto en float32, junto con voces precomputadas y un manifiesto de estado. Está pensado para ofrecer síntesis de voz en español sin necesidad de servidor, GPU ni clave API, lo que lo hace especialmente relevante para aplicaciones web con requisitos de privacidad o despliegue ligero.

El modelo base de Kyutai es un modelo de lenguaje de 6 capas con 89,4 millones de parámetros basado en flow-matching, que genera audio a 24 kHz utilizando el codec neural Mimi. Esta versión cuantizada reduce el peso del modelo de lenguaje de 302,7 MB a 40,8 MB mediante cuantización int4 (MatMulNBits, bloque 128, simétrico), manteniendo el acondicionador de texto en float32 para preservar la pronunciación. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. El modelo está dirigido a desarrolladores que necesitan síntesis de voz en español embebida en aplicaciones web o entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching language model de 6 capas (89,4M parámetros) sobre codec Mimi a 24 kHz, exportado a ONNX |
| Parametros totales | 89,4M (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 (MatMulNBits, bloque 128, simétrico) para el LM principal; int8 dinámico para el flow head y el codec Mimi; float32 para el text conditioner |
| Idiomas soportados | Español (es) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (archivos .onnx, tokenizer.model SentencePiece, bundle.json, .npy, .wav) |

## Arquitectura y entrenamiento

El modelo original Pocket TTS de Kyutai es un modelo de lenguaje autorregresivo de 6 capas con 89,4 millones de parámetros que emplea flow-matching para predecir los tokens de audio del codec Mimi a partir de texto condicionado. La arquitectura combina un acondicionador de texto (embeddings y proyecciones) con un modelo de flujo que genera las representaciones latentes del codec, y un decodificador Mimi que reconstruye la forma de onda a 24 kHz. Esta versión no modifica la arquitectura original, sino que aplica cuantización int4 al modelo de lenguaje principal y int8 dinámico a los componentes del codec, manteniendo el acondicionador de texto en float32 para evitar pérdidas en la pronunciación. No se proporcionan detalles sobre el dataset de entrenamiento del modelo base ni sobre procesos de alineación como RLHF o DPO; el autor solo indica que la calidad de voz proviene íntegramente del modelo de Kyutai y que este paquete únicamente cambia el formato numérico.

Una innovación técnica destacable de este paquete es el uso de un estado de voz precomputado (KV-cache) que evita cargar el encoder Mimi en el navegador para la generación de voz con voces predefinidas. El autor advierte de un detalle crítico: el campo `step` por capa debe coincidir con la longitud de la caché; si se pone a cero, el modelo ignora la voz y emite casi silencio (RMS 0,0026 frente a 0,176 correcto). Además, el modelo se guarda como un único archivo `.onnx` para evitar el fallo de ONNX Runtime Web con archivos externos `.onnx.data`.

## Capacidades

- Sintesis de voz en español a partir de texto, con generación de audio a 24 kHz mediante el codec Mimi.
- Ejecución completamente local en el navegador (CPU, WebAssembly) sin necesidad de servidor, GPU ni clave API.
- Cuatro voces predefinidas: `charles` (81 Hz), `alba` (113 Hz), `vera` (178 Hz) y `azelma` (214 Hz), con muestras de audio incluidas en el repositorio.
- Posibilidad de clonar nuevas voces mediante el encoder Mimi cuantizado a int8, aunque en el navegador no se carga por defecto para ahorrar recursos.
- Integración con ONNX Runtime Web y Python (onnxruntime), permitiendo despliegue en entornos de servidor ligero o aplicaciones de escritorio.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un sistema de texto a voz.

## Casos de uso

- Accesibilidad web: lectura en voz alta de contenido en español para personas con discapacidad visual o dificultades de lectura, directamente desde el navegador sin enviar texto a servidores externos.
- Asistentes de voz embebidos: integración en aplicaciones web de atención al cliente o asistentes virtuales que necesitan respuestas habladas en español sin depender de servicios en la nube.
- Generación de audiolibros y narración: creación de contenido narrado en español utilizando las voces predefinidas, con la ventaja de que todo el proceso ocurre localmente, lo que reduce costes y latencia.
- Prototipado rápido de aplicaciones de voz: desarrolladores pueden probar flujos de conversación hablada en español en minutos, sin configurar infraestructura de TTS.
- Herramientas educativas: aplicaciones de aprendizaje de idiomas que requieren pronunciación correcta en español, con la posibilidad de clonar voces específicas para personalizar la experiencia.
- Extensiones de navegador: lectura de texto seleccionado en cualquier página web en español, con ejecución local y sin necesidad de permisos especiales de red.
- Aplicaciones con requisitos de privacidad: cualquier escenario donde el texto a sintetizar sea sensible y no deba enviarse a servicios externos, ya que todo el procesamiento ocurre en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas objetivas de calidad de voz (MOS, etc.) ni comparaciones cuantitativas con otros modelos. Se dispone únicamente de medidas de frecuencia fundamental (F0) de las voces incluidas, que no constituyen una evaluación de rendimiento.

## Requisitos de hardware

- Inferencia en CPU: el paquete está diseñado para ejecutarse en navegadores con soporte WebAssembly y ONNX Runtime Web; no requiere GPU.
- Tamaño del paquete: 106 MB en total, que se descarga una vez y se cachea localmente en el navegador.
- En Python, se puede ejecutar con `onnxruntime` en cualquier máquina con CPU, sin requisitos especiales de VRAM.
- No se han publicado datos de latencia o throughput; el autor indica que la ejecución es viable en navegador, pero no ofrece cifras concretas.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime Python (servidor o escritorio), y el runtime de referencia de [KevinAHM/pocket-tts-onnx-export](https://github.com/KevinAHM/pocket-tts-onnx-export) con `--precision int4`.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Contexto | Licencia | Uso en navegador |
|---|---|---|---|---|---|---|
| pocket-tts-spanish-onnx-int4 (este) | 89,4M (base) | int4 + int8 | ONNX | No disponible | CC-BY-4.0 | Sí (WebAssembly) |
| kyutai/pocket-tts (original) | 89,4M | Ninguna (float32) | PyTorch / Safetensors | No disponible | CC-BY-4.0 | No (requiere servidor) |
| Piper TTS | Variable según modelo (aprox. 20-100M) | int8 (en algunos modelos) | ONNX | No disponible | MIT (modelos bajo licencias diversas) | Sí (con librerías adicionales) |

La comparativa es cualitativa, ya que no hay datos de rendimiento objetivos. La ventaja principal de esta versión es su empaquetado específico para navegador y la cuantización int4 que reduce significativamente el peso del modelo de lenguaje, a costa de una posible degradación de calidad no cuantificada. Piper es una alternativa ligera similar, pero no está especializada en español en este paquete concreto y su integración en navegador requiere componentes adicionales.

## Limitaciones y advertencias

- La cuantización int4 puede degradar ligeramente la calidad de la voz en comparación con el modelo original en float32, aunque no se han publicado mediciones objetivas.
- El modelo solo soporta español; no es multilingüe y puede tener problemas con acentos regionales, nombres propios o palabras extranjeras.
- La clonación de voz requiere cargar el encoder Mimi (int8), que no se incluye en el flujo predeterminado del navegador; el usuario debe gestionar esa carga adicional.
- El autor advierte de un fallo específico: si el campo `step` del KV-cache no coincide con la longitud de la caché, el modelo produce silencio casi total. Esto debe manejarse con cuidado en implementaciones personalizadas.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original (Kyutai) y a Prasad Vittaldev como autor de la adaptación.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero al ser un sistema de síntesis de voz, los errores se manifiestan como pronunciaciones incorrectas o artefactos de audio, no como contenido textual inventado.
- El repositorio no incluye documentación sobre el proceso de entrenamiento del modelo base ni sobre los datos utilizados, lo que limita la evaluación de su comportamiento en dominios específicos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/prasadvittaldev/pocket-tts-spanish-onnx-int4)
- [Demo en navegador](https://prasadtts.vercel.app)
- [Modelo base kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Repositorio de exportación ONNX de KevinAHM](https://github.com/KevinAHM/pocket-tts-onnx-export)
- [Perfil de LinkedIn del autor](https://in.linkedin.com/in/prasadvittaldev)
