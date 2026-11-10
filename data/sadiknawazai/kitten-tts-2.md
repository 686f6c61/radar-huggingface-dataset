# SadikNawazAI/kitten-tts-2

## Resumen

KittenTTS 2 es un modelo de texto a voz (TTS) de 1.733.487.616 parámetros desarrollado por Stellon Labs, publicado originalmente en el repositorio `KittenML/kitten-tts-2`. Se trata de un modelo de lenguaje de voz construido sobre la arquitectura `qwen3` que lee texto y genera tokens del códec S3, los cuales un vocoder posterior convierte en audio a 24 kHz. Su rasgo diferencial es la clonación de voz en contexto (in-context voice cloning), que permite reproducir un timbre concreto a partir de referencias de voz.

La versión aquí documentada es una cuantización GGUF publicada por el usuario SadikNawazAI bajo el identificador `SadikNawazAI/kitten-tts-2`. Según la model card, se trata de un espejo exacto (mismo SHA-256) del fichero `cpp/model-tq2_1.gguf` del repositorio upstream, republicado como el GGUF que Ollama descarga para `hf.co/KittenML/kitten-tts-2:latest`. La cuantización emplea formato TQ2_1, con cuerpo ternario de 1,58 bits y escalas en precisión completa, lo que reduce el fichero a 0,96 GiB (1,03 GB).

Es relevante porque demuestra la viabilidad de empaquetar un modelo de voz de 1,7B en un único fichero GGUF de ~1 GB apto para Ollama, manteniendo una ventana de contexto de 40.960 tokens y 16 voces con nombre en otros tantos idiomas. Conviene subrayar que el repositorio contiene únicamente el componente de lenguaje: la canalización TTS completa requiere el decodificador/vocoder y las referencias de voz del repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3` (modelo de lenguaje de voz; genera tokens del códec S3) |
| Parametros totales | 1.733.487.616 (1,73B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | TQ2_1 (cuerpo ternario de 1,58 bits con escalas en precisión completa); fichero GGUF de 0,96 GiB (1,03 GB) |
| Idiomas soportados | 16 voces con nombre: arabe, chino, neerlandes, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol y turco |
| Licencia | Stellon Labs Community License (`stellon-labs-community-license`) |
| Formato de pesos | GGUF (`model-tq2_1.gguf`) |
| Dimension de embedding | 2.048 |
| Numero de capas | 28 |
| Tamano de vocabulario | 158.241 |
| Frecuencia de muestreo de audio | 24 kHz |
| SHA-256 del fichero | `c6ad7ee1dbda3fd7a2b3dc3b8b1689f4687f761b7bd6509569b5592f543548f7` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `qwen3` aplicada a la síntesis de voz: actúa como un modelo de lenguaje que recibe texto y emite tokens del códec S3, que un vocoder transforma después en forma de onda a 24 kHz. Cuenta con 28 capas, dimensión de embedding de 2.048 y un vocabulario de 158.241 entradas, sobre un total de 1,73B parámetros. La ventana de contexto alcanza los 40.960 tokens, lo que permite manejar referencias de voz y texto de entrada extensos dentro de una misma secuencia.

La cuantización TQ2_1 empaqueta el cuerpo del transformer en valores ternarios (cada peso es exactamente `-scale`, `0` o `+scale` dentro de grupos de 128 elementos), manteniendo las escalas en precisión completa. Según la model card, este empaquetado ternario es sin pérdida respecto a los pesos bf16 del cuerpo del transformer. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz mediante el vocoder asociado.
- Clonación de voz en contexto (in-context voice cloning) a partir de referencias de voz.
- 16 voces con nombre en otros tantos idiomas: árabe, chino, neerlandés, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español y turco.
- Generación de tokens del códec S3 como representación intermedia del audio.
- Soporte de conversación (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Ejecución mediante Ollama a partir del GGUF publicado.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni procesamiento de visión o audio de entrada.

## Casos de uso

- Doblaje y localización de contenidos: el modelo cubre 16 idiomas con voces con nombre, lo que permite generar pistas de voz para vídeo o e-learning en varios mercados sin cambiar de modelo.
- Audiolibros y lectura asistida: con 40.960 tokens de contexto se pueden sintetizar pasajes largos manteniendo la coherencia de la voz a lo largo de la narración.
- Asistentes de voz conversacionales: la etiqueta `conversational` y la clonación de voz permiten construir interfaces habladas con un timbre de marca consistente.
- Prototipado rápido en local: el GGUF de 0,96 GiB se ejecuta con Ollama mediante `ollama run hf.co/SadikNawazAI/kitten-tts-2`, lo que facilita pruebas sin infraestructura dedicada.
- Generación de voces personalizadas para accesibilidad: la clonación en contexto permite recrear la voz de un usuario para lectores de pantalla o comunicación aumentativa, sujeto a los términos de la licencia.
- Integración en pipelines de Python: mediante `pip install kittenml` y la clase `KittenTTS` se puede invocar la canalización completa y volcar el audio a WAV con `soundfile`.
- Producción de contenido para pódcast y publicidad: la variedad de voces con nombre (por ejemplo, `WeatherPresenterCheerful`) permite generar locuciones con estilos predefinidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 0,96 GiB (1,03 GB); con overhead de contexto y del vocoder conviene prever un margen adicional, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: el tamaño del fichero (inferior a 1 GiB) sugiere que puede caber en GPU de consumo con suficiente VRAM libre, pero no se confirma en la documentación.
- Opciones de despliegue: Ollama (`ollama run hf.co/SadikNawazAI/kitten-tts-2`) para el GGUF; canalización completa en Python con `pip install kittenml` y `KittenTTS("KittenML/kitten-tts-2")`. No se documentan integraciones con vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KittenTTS 2 (esta ficha, GGUF TQ2_1) | 1,73B | 40.960 tokens | 16 voces con nombre | Stellon Labs Community License | GGUF |
| KittenTTS 2 (upstream, bf16) | 1,73B | 40.960 tokens | 16 voces con nombre | Stellon Labs Community License | safetensors / pipeline Python |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio contiene únicamente el componente de lenguaje en GGUF; para una canalización TTS completa hacen falta el decodificador/vocoder y las referencias de voz del repositorio upstream.
- La licencia Stellon Labs Community License debe revisarse antes de cualquier uso comercial; la model card remite explícitamente a los términos para investigación, uso no comercial y comercial.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de calidad de audio en la información disponible.
- La lista de idiomas se refiere a voces con nombre; no se especifica la cobertura lingüística real más allá de esas 16 voces.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- El modelo es una cuantización ternaria: aunque la model card afirma que el empaquetado es sin pérdida respecto a bf16 en el cuerpo del transformer, no se aportan métricas de calidad de audio comparativas.
- No se documentan restricciones específicas sobre clonación de voz ni requisitos de consentimiento, más allá de la licencia general.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/SadikNawazAI/kitten-tts-2
- Modelo base upstream: https://huggingface.co/KittenML/kitten-tts-2
- Licencia upstream: https://huggingface.co/KittenML/kitten-tts-2/blob/main/LICENSE.md
- Descarga directa del GGUF: https://huggingface.co/SadikNawazAI/kitten-tts-2 (fichero `model-tq2_1.gguf`)
- Ejecución en Ollama: `ollama run hf.co/SadikNawazAI/kitten-tts-2`
- Paquete Python de la canalización completa: `pip install kittenml`
