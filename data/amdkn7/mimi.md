# Amdkn7/mimi

## Resumen

Mimi es un codec de audio neuronal desarrollado por Kyutai que convierte senal de voz en tokens discretos combinando informacion semantica y acustica. Funciona a 12,5 Hz y 1,1 kbps, lo que lo hace apto para transmision en tiempo real y para alimentar modelos de lenguaje de voz. La ficha de Hugging Face corresponde al repositorio `Amdkn7/mimi`, un espejo del modelo original `kyutai/mimi` publicado bajo licencia CC-BY-4.0.

El modelo emplea una arquitectura de codificador-decodificador en streaming con espacio latente cuantizado, entrenada de extremo a extremo sobre datos de habla. Su proposito principal es servir como representacion intermedia para sistemas de texto a voz y para modelos de lenguaje de audio, como Moshi, el modelo conversacional de la misma organizacion.

Con 96.151.393 parametros y un repositorio de 0,4 GB en formato safetensors, Mimi es un componente ligero dentro de un pipeline mayor, no un modelo generativo autonomo. Su relevancia actual radica en que permite tokenizar audio a una tasa muy baja manteniendo fidelidad, lo que reduce el coste computacional de los sistemas de dialogo por voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec de audio neuronal con codificador-decodificador en streaming y espacio latente cuantizado (RVQ) |
| Parametros totales | 96.151.393 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa audio en streaming) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre datos de habla; la model card no detalla idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |
| Frecuencia de tokens | 12,5 Hz |
| Bitrate | 1,1 kbps |
| Tipo de audio | Voz (speech) |
| Pipeline | feature-extraction |
| Libreria | transformers |

## Arquitectura y entrenamiento

Mimi es un codec neuronal end-to-end con un codificador que transforma la forma de onda en un espacio latente y un decodificador que la reconstruye. El espacio latente se cuantiza mediante cuantizacion vectorial residual (RVQ), lo que produce multiples flujos de tokens discretos a 12,5 Hz. La arquitectura esta disenada para operar en streaming, con latencias compatibles con aplicaciones de dialogo en tiempo real. La combinacion de informacion semantica y acustica en los tokens permite que estos sean utiles tanto para reconstruir audio como para ser modelados por un modelo de lenguaje.

El entrenamiento se realizo de extremo a extremo sobre datos de habla. La model card remite al paper de Moshi (Kyutai, 2024) para el detalle de los datos, las etapas del entrenamiento y los hiperparametros, sin especificar el numero de tokens ni la composicion exacta del dataset. No se documenta en la informacion disponible el uso de RLHF o DPO, algo esperable en un codec y no en un modelo generativo de texto.

## Capacidades

- Codificacion de audio de voz a tokens discretos a 12,5 Hz y 1,1 kbps.
- Decodificacion de tokens de vuelta a forma de onda de audio.
- Compresion y descompresion de audio en tiempo real gracias al diseno en streaming.
- Representacion conjunta de informacion semantica y acustica en los tokens.
- Integracion nativa con la libreria `transformers` mediante `MimiModel` y `AutoFeatureExtractor`.
- Uso como componente de tokenizacion en modelos de lenguaje de voz, como Moshi.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades de vision ni de generacion de texto.

## Casos de uso

- Tokenizacion para modelos de lenguaje de voz: Mimi convierte audio en tokens discretos que un LLM puede modelar, habilitando sistemas de dialogo hablado de extremo a extremo con una tasa de tokens muy baja (12,5 Hz).
- Compresion de voz en tiempo real: su bitrate de 1,1 kbps y su arquitectura en streaming lo hacen adecuado para transmision de voz con ancho de banda reducido en aplicaciones de comunicacion.
- Entrenamiento de sistemas de texto a voz: los tokens semanticos y acusticos combinados sirven como objetivo de entrenamiento para modelos TTS que necesitan reconstruir habla de alta fidelidad.
- Preprocesamiento en pipelines de ASR: la representacion tokenizada puede alimentar modelos de reconocimiento de habla que operen sobre tokens discretos en lugar de espectrogramas.
- Investigacion en codecs neuronales: su implementacion abierta en `transformers` permite experimentar con cuantizacion RVQ, latencias de streaming y calidad de reconstruccion.
- Prototipado de asistentes conversacionales: junto con Moshi, permite construir demos de dialogo por voz con latencia baja sin depender de APIs propietarias.
- Analisis y almacenamiento eficiente de audio: la compresion a 1,1 kbps reduce el espacio de almacenamiento de grabaciones de voz para tareas de indexacion o archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 96 millones de parametros, el modelo en precision completa (fp32) ocupa aproximadamente 0,4 GB; en fp16 alrededor de 0,2 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100 para inferencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3060, RTX 4090 y similares. Tambien puede ejecutarse en CPU para procesamiento no interactivo.
- Opciones de despliegue: `transformers` (via `MimiModel`), integracion con el repositorio `kyutai-labs/moshi`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card indica que la arquitectura esta disenada para streaming en tiempo real, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Tasa de tokens | Bitrate | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mimi (Kyutai) | 96,1 M | 12,5 Hz | 1,1 kbps | CC-BY-4.0 | Hugging Face, `transformers` |
| EnCodec (Meta) | no disponible en la informacion | no disponible | multiple (1,5-24 kbps) | no disponible en la informacion | Hugging Face |
| SoundStream (Google) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | no disponible |
| DAC (Descript) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face |

Nota: los datos de los modelos alternativos no se han verificado en la informacion proporcionada; se incluyen como referencia de categoria y deben contrastarse con sus fichas oficiales.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre datos de habla; no esta pensado para musica ni para audio general.
- La model card advierte de sesgos hacia ciertos dominios y topicos sobrerrepresentados en los datos de entrenamiento.
- Entrenado para producir una unica voz con el fin de evitar suplantacion de identidad; no debe usarse para impersonar a personas.
- Uso fuera de alcance: cualquier aplicacion maliciosa o de suplantacion esta explicitamente desaconsejada por el autor.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- La informacion sobre idiomas soportados no esta disponible; el rendimiento puede variar segun el idioma del habla de entrada.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar a Kyutai y respetar los terminos de la licencia.
- El repositorio `Amdkn7/mimi` es un espejo no oficial con 0 descargas; para produccion conviene referenciar el repositorio original `kyutai/mimi`.
- No se publican cifras de latencia ni de calidad de reconstruccion en la informacion disponible, lo que dificulta evaluar su idoneidad en produccion sin pruebas propias.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/Amdkn7/mimi
- Repositorio original en Hugging Face: https://huggingface.co/kyutai/mimi
- Repositorio GitHub de Moshi: https://github.com/kyutai-labs/moshi
- Paper de Moshi: http://kyutai.org/Moshi.pdf
- Demo de Moshi: https://moshi.chat/
- Web de Kyutai: https://kyutai.org/
