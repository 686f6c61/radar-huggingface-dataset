# ggml-org/tiny-voca-GGUF

## Resumen

tiny-voca es un modelo de síntesis de voz (text-to-speech) de tamano muy reducido, desarrollado originalmente por n4ze3m y convertido al formato GGUF por el equipo de ggml-org para su uso con la infraestructura de llama.cpp. Con aproximadamente 1,6 millones de parámetros en el repositorio convertido (la model card del autor cita 4,5 millones para el modelo fuente), se posiciona como una opción extremadamente ligera para generar audio a partir de texto en entornos con recursos muy limitados.

El modelo está pensado para ejecutarse mediante `llama-tts` desde la terminal o a través del endpoint `/tts` del servidor de llama.cpp, lo que lo integra directamente en el ecosistema GGUF y en los flujos de trabajo habituales de la herramienta. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y su tamano lo hace viable en CPU o en GPUs de gama baja.

Su relevancia actual radica en la practicidad: frente a modelos TTS de cientos de millones de parámetros, tiny-voca ofrece una alternativa minima para prototipado rapido, pruebas de integracion y escenarios donde el coste computacional o el tamano del binario son la restriccion principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech) |
| Parametros totales | 1.603.456 (safetensors del repo GGUF); la model card del autor cita 4,5 M para el modelo fuente |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio GGUF) |
| Idiomas soportados | ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Se trata de un modelo de text-to-speech, lo que implica un componente de modelado de texto y un decodificador de audio, pero no se especifican el tipo de transformer, el vocoder ni la estrategia de sintesis empleada.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre el numero de horas de audio, la composicion del dataset, el idioma de los datos mas alla de la indicacion de que es exclusivamente ingles, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. La unica innovacion tecnica documentada es la conversion automatica al formato GGUF mediante la herramienta `ggml-org/convert`, que permite su ejecucion en llama.cpp.

## Capacidades

- Sintesis de voz a partir de texto en ingles.
- Dos voces predefinidas seleccionables mediante el parametro `--tts-voice`: `M2` (voz masculina, por defecto) y `F2` (voz femenina).
- Generacion de ficheros de audio WAV mediante la CLI `llama-tts`.
- Servicio HTTP a traves del endpoint `/tts` del servidor de llama.cpp.
- Ejecucion local sin dependencias de servicios en la nube.
- No se documentan capacidades de clonacion de voz, control de emocion, multilinguismo ni tool calling.

## Casos de uso

- Prototipado rapido de interfaces de voz: permite generar audio de prueba en segundos desde la terminal con `llama-tts`, sin necesidad de configurar infraestructura TTS compleja, gracias a su tamano minimo.
- Pruebas de integracion en pipelines de CI/CD: al ser un binario GGUF pequeno, puede incluirse en tests automatizados que verifiquen la generacion de audio sin coste apreciable de recursos.
- Sistemas embebidos y dispositivos de borde: su huella de memoria reducida lo hace adecuado para entornos donde no cabe un modelo TTS convencional, siempre que el ingles sea suficiente.
- Generacion de avisos y notificaciones habladas: para aplicaciones que necesiten leer mensajes cortos en voz alta (alertas, confirmaciones, mensajes de estado) con una de las dos voces disponibles.
- Educacion y demos: util para talleres o demostraciones sobre el ecosistema GGUF y llama.cpp donde se quiera mostrar un pipeline TTS completo sin descargar modelos pesados.
- Accesibilidad basica en aplicaciones de escritorio: lectura de texto seleccionado en ingles mediante una integracion local con llama.cpp, sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,6 M de parámetros en el repo GGUF, el modelo cabe holgadamente en cualquier GPU consumer e incluso en memoria compartida.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1050, RTX 3050, RTX 4090, etc.), asi como en CPU.
- Opciones de despliegue: `llama-tts` (CLI) y `llama serve` con endpoint `/tts`, ambos del proyecto llama.cpp.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera una generacion muy rapida, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tiny-voca (este modelo) | 1,6 M (repo GGUF) / 4,5 M (fuente) | no disponible | Ingles | Apache 2.0 | GGUF |
| Piper TTS | no disponible | no disponible | Multiples | MIT (segun proyecto) | ONNX |
| Coqui TTS (modelos ligeros) | variable | no disponible | Multiples | MPL 2.0 / otras | varios |
| Kokoro | no disponible | no disponible | Ingles y otros | Apache 2.0 | ONNX / otros |

Nota: los datos de los modelos alternativos no provienen de la informacion proporcionada en esta busqueda y deben verificarse en sus respectivas fichas oficiales.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilinguismo documentado.
- Solo dispone de dos voces fijas (`M2` y `F2`), sin control de prosodia, emocion ni clonacion.
- No se documentan sesgos especificos, pero al ser un modelo entrenado presumiblemente con datos limitados, la calidad y naturalidad del audio puede ser inferior a la de modelos TTS de mayor tamano.
- Riesgo de artefactos y errores de pronunciacion en textos complejos, nombres propios o terminos tecnicos.
- No hay informacion sobre la longitud maxima de texto procesable por peticion.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la ficha del modelo base (n4ze3m/tiny-voca) por si hubiera condiciones adicionales.
- El modelo se distribuye como conversion automatica; no se garantiza paridad exacta con el modelo fuente.
- No apto para produccion de audio de alta fidelidad ni para aplicaciones que requieran voces personalizadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/tiny-voca-GGUF
- Modelo base: https://huggingface.co/n4ze3m/tiny-voca
- Documentacion TTS de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal/tts.md#tiny-voca
- Herramienta de conversion: https://github.com/ggml-org/convert
