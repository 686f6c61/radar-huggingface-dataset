# loom-ai-org/pocket-tts-18m-loom

## Resumen

Pocket TTS 18M (English) es un modelo de síntesis de voz (text-to-speech) en inglés, destilado por Kyutai a partir de su familia Pocket TTS con ajuste fino por recompensa (release de octubre de 2026), y exportado por loom-ai-org al formato GGUF del runtime loom.cpp. El modelo combina un *flow language model* de 15,6 M de parámetros que opera sobre latentes del códec Mimi con un decodificador de 2,6 M de parámetros; el recuento real de parámetros del checkpoint es de 19.202.833.

Su interés práctico está en el tamaño: menos de 20 M de parámetros, un fichero GGUF autodescriptivo de 0,2 GB de repositorio y ejecución sin fonemizador externo, porque el propio modelo codifica el texto. Incorpora una voz integrada (`alba`) y otras 26 voces empaquetadas como ficheros de estado independientes bajo `voices/`, seleccionables por nombre.

Es relevante ahora porque permite TTS local en hardware muy modesto con un único artefacto autocontenido (grafo, tokenizador y *driver* embebidos), a costa de calidad frente al modelo completo y con restricciones de uso heredadas de Kyutai (prohibición de suplantación de voz sin consentimiento). No se han publicado benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow language model de 15,6 M de parámetros sobre latentes del códec Mimi + decodificador de 2,6 M de parámetros |
| Parámetros totales | 19.202.833 (dato de safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Dos precisiones: F32 (parámetros sin modificar) y una versión cuantizada derivada de ella; esquema exacto de cuantización no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 (pesos, heredada de `kyutai/pocket-tts`); las grabaciones de cada voz tienen licencia propia |
| Formato de pesos | GGUF autodescriptivo de loom.cpp (incluye topologías de grafo, tokenizador y script de driver) |
| Frecuencia de muestreo de salida | 24.000 Hz (debe pasarse explícitamente como `sample_rate`) |
| Voces | 27 en total: `alba` integrada en el fichero + 26 ficheros de voz en `voices/` |
| Runtime requerido | `loom-py-rt` 1.0.0rc19 o superior |
| Tamaño del repositorio | 0,2 GB |
| Fecha de publicación | 2026-10-24 |

## Arquitectura y entrenamiento

El modelo es una destilación de `kyutai/pocket-tts`: un *flow language model* de 15,6 M de parámetros que modela latentes del códec neuronal Mimi (el mismo códec usado por Kyutai en su familia TTS) y un decodificador de 2,6 M de parámetros que reconstruye la forma de onda desde esos latentes. La model card indica que la versión de 18 M está ajustada con *reward fine-tuning*, pero no detalla el número de tokens de entrenamiento, la composición del dataset ni el algoritmo concreto de optimización por recompensa.

La innovación destacable de esta exportación es el empaquetado: un único GGUF que se describe a sí mismo y arrastra grafo, tokenizador y *driver*, generado con loom-exporter. El modelo codifica el texto internamente, de modo que no necesita fonemizador; el front-end de texto aplica la regla `replace_characters` y la regla v4 de punto decimal del modelo de referencia, lo que exige un runtime reciente para reproducir exactamente la preparación del texto. La inferencia es estocástica por defecto, con la temperatura del checkpoint (0,3) y posibilidad de fijar `seed`.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida de audio a 24 kHz.
- Codificación de texto propia: no requiere fonemizador ni G2P externo.
- Voz integrada `alba` utilizable sin configuración adicional.
- Selección entre 26 voces adicionales por nombre (`voice="marius"`), descargadas del repositorio la primera vez, o mediante una ruta a un fichero de voz propio.
- Los ficheros de voz están sellados con una huella de estos pesos concretos, por lo que solo son válidos para este modelo.
- Control de reproducibilidad mediante `seed`; temperatura por defecto 0,3.
- Acceso de bajo nivel a los argumentos del *driver* embebido mediante `model.infer(...)`, documentados en `model.driver_source`.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo ocupa menos de 20 M de parámetros y se ejecuta en CPU, por lo que puede embeberse en un proceso local sin GPU ni servicio externo.
- Generación de audiolibros o *podcasts* cortos en inglés: la ventana de contexto no está documentada, así que conviene trocear el texto por párrafos y encadenar llamadas con la misma voz para mantener consistencia tímbrica.
- Pruebas automatizadas de pipelines de audio: al admitir `seed`, dos llamadas con la misma semilla y el mismo texto producen el mismo audio, lo que permite *golden tests* de regresión en CI.
- Prototipado rápido de interfaces de voz: la voz `alba` viene integrada y basta una llamada `text2speech.infer("hello world", sample_rate=24000)` para obtener un WAV, sin descargar voces adicionales.
- Síntesis con voz concreta para demos de producto: las 26 voces empaquetadas cubren distintos registros y acentos en inglés; hay que revisar la licencia de cada grabación antes de publicar el resultado.
- Evaluación comparativa de exportadores GGUF: sirve como caso de prueba pequeño y autocontenido para validar el comportamiento de loom.cpp frente al modelo de referencia de Kyutai.
- Generación de avisos pregrabados en sistemas de megafonía o kioscos: el coste computacional es despreciable y el artefacto es un único fichero, lo que simplifica el despliegue en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, SIM) ni comparaciones numéricas con el modelo completo; solo señala cualitativamente que la destilación sacrifica calidad a cambio de tamaño frente a `loom-ai-org/pocket-tts-loom`.

## Requisitos de hardware

- VRAM estimada: no hay cifras oficiales. Por aritmética sobre 19.202.833 parámetros, los pesos ocupan aproximadamente 77 MB en F32 y del orden de 10-20 MB en una cuantización de 8 o 4 bits, a lo que hay que sumar el *overhead* del runtime y los búferes de audio; en la práctica el proceso completo debería quedar por debajo de 1 GB, pero es una estimación, no un dato del autor.
- GPU recomendadas: ninguna en particular; el tamaño permite ejecución en CPU. Cualquier GPU consumer (por ejemplo, una RTX 4090 o inferior) es sobradamente suficiente si el runtime la aprovecha; no se documenta *backend* de aceleración.
- Cabe en cualquier GPU consumer, e incluso en dispositivos de un solo placa con CPU, dado el tamaño del modelo.
- Opciones de despliegue: `loom-py-rt` (paquete de PyPI, extra `[hub]`) sobre el motor loom.cpp. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; el GGUF es específico de loom.cpp y lleva grafos y driver propios, no un GGUF estándar de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-ai-org/pocket-tts-18m-loom` (este) | 19,2 M (15,6 M + 2,6 M) | No disponible | `en` | CC-BY-4.0 (voces con licencia propia) | GGUF para loom.cpp |
| `kyutai/pocket-tts` (modelo base) | No disponible (el export es una destilación de 18 M) | No disponible | `en` según la información disponible | CC-BY-4.0 según herencia indicada | Peso original de Kyutai |
| `loom-ai-org/pocket-tts-loom` (versión completa) | No disponible | No disponible | No disponible | No disponible | GGUF para loom.cpp |
| Otras tallas de Pocket TTS | No disponible | No disponible | No disponible | No disponible | Sus ficheros de voz son incompatibles con este modelo |

## Limitaciones y advertencias

- Modelo destilado: la propia model card advierte de que sacrifica calidad frente al modelo completo `pocket-tts-loom`; no se cuantifica cuánto.
- Solo inglés. No hay soporte multilingüe declarado, y una de las voces (`daan`) es de hablante neerlandés, lo que puede producir un acento perceptible al leer texto inglés.
- Riesgo de alucinación y de pronunciación incorrecta: no hay métricas publicadas de inteligibilidad, y el modelo no acepta transcripción de referencia para alinear.
- Sin encoder Mimi en la exportación: no es posible clonar una voz a partir de una grabación, solo elegir entre las voces empaquetadas o ficheros de voz preexistentes compatibles con estos pesos.
- Licencias de voz heterogéneas: `cosette` y `jean` son CC-BY-NC-4.0 (no comercial), y `daan`, `juergen` y `rafael` no tienen licencia declarada por Kyutai. Verificar antes de cualquier uso comercial. Las voces CC-BY exigen atribución al dataset o al hablante.
- Restricciones de uso de Kyutai inheritadas: prohíben la suplantación o clonación de voz sin consentimiento explícito y lícito, y presentar el audio generado como grabación genuina de una persona real.
- Requisito estricto de versión: con `loom-py-rt` anterior a 1.0.0rc19 el modelo carga y habla, pero prepara distinto algunos textos (guiones, comillas tipográficas y punto entre dos números).
- `sample_rate` debe pasarse manualmente; una frecuencia incorrecta no provoca error, solo reproduce la voz a velocidad equivocada.
- Muestreo estocástico por defecto (temperatura 0,3): dos llamadas idénticas difieren salvo que se fije `seed`.
- Artefacto específico de loom.cpp: no es portable a otros runtimes GGUF, y los ficheros de voz están atados a la huella de estos pesos exactos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación externa de la comunidad.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a productos homónimos sin relación (grabador de pantalla y marca de ropa).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/pocket-tts-18m-loom
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Exportación del modelo completo: https://huggingface.co/loom-ai-org/pocket-tts-loom
- Repositorio del motor: https://github.com/loom-ai-org/loom.cpp
- Exportador: https://github.com/loom-ai-org/loom-exporter
- API Python: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: `loom-py-rt` (extra `[hub]`)
- Licencias de las grabaciones de voz: https://huggingface.co/kyutai/tts-voices
