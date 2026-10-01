# Kairoi-LLC/whisper-base-litert-word-timings

## Resumen

Este repositorio contiene una conversion a LiteRT (TFLite) de Whisper base de OpenAI, realizada por Kairoi-LLC para la transcripcion en dispositivo de su aplicacion Woven. No es un modelo entrenado ni afinado: son los pesos originales de `openai/whisper-base` (revision `e37978b90ca9030d5170a5c07aadb050351a65bb`) cuantizados a int8 dinamico y empaquetados en un unico fichero `.tflite` de unos 78 MB, junto con el tokenizer original sin modificar.

La diferencia frente a otras builds LiteRT ya publicadas de Whisper es que esta expone una tercera firma, `align`, que devuelve la cross-attention de las alignment heads con forma `[8, 128, 1500]`. Con esa salida se calculan marcas temporales a nivel de palabra en la misma pasada de inferencia, en cualquier idioma que Whisper transcriba, en lugar de requerir una segunda pasada o un modelo de alineacion aparte. El modelo tiene tres firmas: `encode` (log-mel de 80 x 3000 tramas, 30 s), `decode` (estados del encoder, prefijo de 128 token ids y posicion) y `align`.

Es relevante para quien necesite transcripcion multilingue con marcas temporales precisas fuera de la nube y sin coste de GPU: en un Pixel con 6 hilos alcanza 2,54x tiempo real con 0,32 GB de memoria y un WER del 7,86 % en LibriSpeech dev-clean, practicamente identico al 7,66 % de la build int8 publicada que no ofrece timings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) exportado a LiteRT/TFLite |
| Parametros totales | 74 M (cifra documentada de `openai/whisper-base`; no explicitada en esta model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio fija de 30 s (80 x 3000 tramas log-mel); la firma `decode` acepta un prefijo de 128 tokens por llamada |
| Tipos de cuantizacion | int8 dinamico sobre los pesos; artefacto unico de ~78 MB |
| Idiomas soportados | multilingue (el conjunto de idiomas que transcribe Whisper; la model card no enumera el recuento) |
| Licencia | MIT (pesos originales de OpenAI); se incluye `LICENSE-APACHE` por completitud |
| Formato de pesos | LiteRT / TFLite (`.tflite`) + `tokenizer.json` de `openai/whisper-base` |
| Firmas expuestas | `encode`, `decode`, `align` |
| Salida de alineacion | Cross-attention de las alignment heads, forma `[8, 128, 1500]` |
| Tamano del repositorio | 0,1 GB |
| Libreria / runtime | `litert` |

## Arquitectura y entrenamiento

Whisper base es un transformer encoder-decoder con atencion completa; la variante base tiene 74 M de parametros y una ventana de audio fija de 30 segundos representada como 80 canales log-mel x 3000 tramas. La conversion usa `litert-torch` 0.9.4 (Apache-2.0) con torch 2.13.0 y transformers 4.57.1, y aplica cuantizacion dinamica int8. El script de conversion es `scripts/models/convert-whisper-litert.py` del repositorio de Woven (`uv run scripts/models/convert-whisper-litert.py`), reproducido en este repositorio como `convert-whisper-litert.py`.

No hubo entrenamiento ni fine-tuning: los pesos son los de OpenAI, unicamente cuantizados. La decodificacion es stateless, es decir, cada paso recibe el prefijo completo de tokens, igual que en las builds publicadas. Las marcas temporales se calculan siguiendo el metodo propio de OpenAI (`whisper/timing.py`): normalizar cada alignment head, filtrar con mediana sobre 7 tramas, promediar y aplicar DTW sobre los tokens de texto una vez terminada la decodificacion. Detalle importante de implementacion: la fila que predice el token *k* es la fila *k - 1*.

## Capacidades

- Reconocimiento automatico de voz multilingue, con la ventana fija de 30 segundos propia de Whisper base.
- Marcas temporales a nivel de palabra obtenidas en la misma pasada, mediante la firma `align`, sin modelo de alineacion adicional.
- Salida de timings disponible para todos los idiomas que Whisper transcribe, no solo para ingles.
- Ejecucion en dispositivo mediante el runtime LiteRT, sin dependencia de red ni de servidor.
- Tokenizer original de `openai/whisper-base` empaquetado sin cambios, lo que mantiene la compatibilidad con los flujos de postprocesado de Whisper.
- No soporta tool calling ni function calling.
- No soporta capacidades de agente ni razonamiento multi-paso.
- No tiene vision, audio-vision ni generacion de texto libre: es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion en dispositivo de notas de voz: la app captura 30 s de audio, ejecuta `encode` una vez y decodifica con la firma `decode`, con timings por palabra desde `align` para resaltar el audio a medida que se reproduce.
- Subtitulado con marcas temporales: los timings por palabra permiten generar subtitulos con sincronizacion fina y segmentarlos despues por frases, algo que otras builds LiteRT de Whisper base no ofrecen.
- Busqueda por palabras clave en grabaciones: al disponer de tiempos por palabra, se puede indexar el audio por posicion y saltar directamente al instante en que se pronuncio un termino.
- Aplicaciones de accesibilidad: dictado y transcripcion en tiempo real en movil con 0,32 GB de memoria, viable en telefonos de gama media sin GPU dedicada.
- Kioscos, grabadoras y dispositivos embebidos sin conectividad: el modelo funciona en local, lo que evita enviar audio a un servicio externo y simplifica el cumplimiento de privacidad.
- Herramientas de anotacion lingüistica: los timings a nivel de palabra alimentan pipelines de corpus orales donde se necesita alinear transcripcion y audio, con la advertencia del desfase constante de -80 ms descrito mas abajo.
- Preprocesado de reuniones en el propio dispositivo: transcripcion y marcas temporales antes de enviar solo el texto a un servicio de resumen, reduciendo el volumen de datos que sale del terminal.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en un Pixel con 6 hilos, sobre 24 clips de LibriSpeech dev-clean (204 s en total):

| Metrica | Esta build | `whisper_base_30s_i8` publicada |
|---|---|---|
| WER | 7,86 % | 7,66 % |
| Velocidad | 2,54x tiempo real | 2,27x tiempo real |
| Inicios de palabra dentro de 100 ms respecto al Montreal Forced Aligner | 58 % (72 % descontando el offset constante de -80 ms) | sin timings |
| Memoria | 0,32 GB | 0,32 GB |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible, y no serian aplicables a un modelo exclusivamente ASR.

## Requisitos de hardware

- El modelo esta pensado para inferencia en CPU en dispositivo: la medicion de referencia se hizo en un Pixel con 6 hilos.
- Memoria de trabajo medida: 0,32 GB. El fichero `.tflite` ocupa aproximadamente 78 MB, de modo que el repositorio completo son 0,1 GB.
- VRAM: no aplica; la build es para el runtime LiteRT sobre CPU. No se han publicado cifras de despliegue en GPU.
- GPU recomendadas: no disponibles para este formato.
- Cabe en telefonos y dispositivos de gama media sin GPU dedicada; con 0,32 GB de pico de memoria es viable tambien en equipos con recursos limitados.
- Opciones de despliegue: runtime LiteRT / TFLite. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin una conversion adicional a otro formato, que no se documenta en este repositorio.
- Rendimiento: 2,54x tiempo real en el Pixel de referencia con 6 hilos, procesando clips de LibriSpeech dev-clean. No se publican cifras de latencia por token ni de throughput en otros dispositivos.
- La aplicacion consumidora debe descargar el fichero por URL de commit (`/resolve/<40-hex>/<file>`) y verificar el SHA-256.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Timings por palabra | WER (LibriSpeech dev-clean, medido por el autor) | Velocidad | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (`whisper-base-litert-word-timings`) | 74 M (base) | TFLite int8 dinamico | Si, via firma `align` | 7,86 % | 2,54x tiempo real | MIT |
| `whisper_base_30s_i8` publicada | 74 M (base) | TFLite int8 | No | 7,66 % | 2,27x tiempo real | no disponible |
| `openai/whisper-base` | 74 M | PyTorch (safetensors) | No de forma nativa en la inferencia estandar; requiere el metodo de `whisper/timing.py` | no disponible en la informacion proporcionada | no disponible | Apache-2.0 segun la model card de HuggingFace; MIT segun el repositorio de OpenAI |

La busqueda web realizada no devolvio ninguna fuente tecnica relevante sobre este modelo ni sobre alternativas comparables; los resultados obtenidos eran directorios de sitios de contenido para adultos sin relacion con el tema.

## Limitaciones y advertencias

- No ha habido entrenamiento ni fine-tuning: hereda todos los sesgos y limitaciones de `openai/whisper-base`, incluida la tendencia conocida a alucinar texto en segmentos con silencio, ruido o musica.
- El WER de 7,86 % esta medido sobre LibriSpeech dev-clean, es decir, ingles leido y limpio; en audio real con ruido, acentos o solapamiento de voces el error sera considerablemente mayor.
- La precision de los inicios de palabra es del 58 % dentro de 100 ms, y del 72 % una vez descontado un offset constante de -80 ms. Ese desfase hay que corregirlo explicitamente si se usa para subtitulado.
- La firma `decode` acepta un prefijo de 128 tokens por llamada y la decodificacion es stateless, por lo que cada paso reprocesa el prefijo completo; el coste crece con la longitud de la transcripcion de cada ventana.
- La ventana de audio es fija de 30 s, por lo que audios mas largos requieren troceado externo y gestion de solapamientos.
- El modelo solo hace ASR: no genera texto libre, no razona, no usa herramientas y no procesa imagen.
- La model card de `openai/whisper-base` en HuggingFace indica Apache-2.0 mientras que el repositorio de OpenAI usa MIT. Ambas licencias permiten la redistribucion y el uso comercial; este repositorio reproduce el aviso MIT y anade el texto Apache-2.0. Conviene revisar ambos textos antes de un despliegue comercial.
- No hay garantia de que el fichero descargado sea integro: se recomienda validar el SHA-256 publicado antes de cargarlo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni un historial de incidencias.
- Los idiomas soportados son los de Whisper, pero las mediciones publicadas solo cubren ingles; no hay datos de calidad de timings por idioma.
- No se documentan cifras de rendimiento en GPU ni en hardware distinto del Pixel de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kairoi-LLC/whisper-base-litert-word-timings
- Modelo base: https://huggingface.co/openai/whisper-base
- Licencia MIT de OpenAI Whisper: https://github.com/openai/whisper/blob/main/LICENSE
- `litert-torch` (herramienta de conversion): https://github.com/google-ai-edge/litert-torch
- Metodo de timings de OpenAI: `whisper/timing.py` en el repositorio https://github.com/openai/whisper
- Script de conversion: `scripts/models/convert-whisper-litert.py` del repositorio de Woven (sin URL publica en la informacion disponible)
- Documentacion del metodo de timings: `docs/brand/research/WORD-TIMINGS-2026-09.md` del repositorio de Woven (sin URL publica en la informacion disponible)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la busqueda web realizada.
