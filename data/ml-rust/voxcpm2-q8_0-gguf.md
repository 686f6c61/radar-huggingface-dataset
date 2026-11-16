# ml-rust/VoxCPM2-Q8_0-GGUF

## Resumen

VoxCPM2-Q8_0-GGUF es una cuantización del modelo de síntesis de voz VoxCPM2 de OpenBMB, publicada por el usuario ml-rust. El modelo original es un sistema text-to-speech (TTS) que genera audio a partir de texto y, según la model card del cuantizador, permite definir la voz mediante una descripción textual en lugar de requerir una grabación de referencia. Esta versión concreta empaqueta la pila transformer de VoxCPM2 junto con el AudioVAE en un único fichero GGUF autocontenido, lo que simplifica el despliegue al eliminar la necesidad de ficheros auxiliares de configuración, tokenizador o pesos del VAE.

La relevancia de esta publicación radica en el formato: un único fichero de 2,62 GiB que reduce el peso original de 4,62 GB mediante cuantización Q8_0 (8,5 bits por peso) sobre 438 matrices, manteniendo 374 tensores en F32, incluidos todos los del AudioVAE y las normas. El modelo base cuenta con 2.384.184.644 parámetros según los datos de safetensors, y está pensado para ejecutarse con las herramientas blazr y voxr del mismo autor, además de permitir fine-tuning mediante QLoRA.

La licencia es Apache-2.0, la misma del modelo base, y los idiomas declarados son malayo (ms), inglés (en) y chino (zh). La model card documenta una verificación limitada sobre una única muestra en bahasa melayu, por lo que las cifras de calidad deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (pila VoxCPM2) con AudioVAE integrado; arquitectura declarada como `voxcpm2` en `config.json` |
| Parametros totales | 2.384.184.644 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 en esta publicación; el conversor soporta además `q4_k_m`, `q5_k_m`, `q6_k` y otros (solo Q8_0 probado) |
| Idiomas soportados | ms (malayo), en (inglés), zh (chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único `VoxCPM2-Q8_0.gguf`, 2.814.248.320 bytes / 2,62 GiB) |

Detalle de la composición del fichero GGUF:

| Componente | Cantidad / formato |
|---|---|
| Matrices de pesos en Q8_0 | 438 (8,5 bits por peso) |
| Tensores en F32 | 374 (incluye todos los del AudioVAE y las normas) |
| Tensores en I32 | 1 |
| Ficheros auxiliares embebidos | `config.json` y `tokenizer.json` |
| SHA-256 | `73c9c5c8a079f77fdda474b865b81b15f450b72a2dfd37a4c1dffc99dfcd9b68` |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una pila transformer de VoxCPM2 acompañada de un AudioVAE, cuyos tensores se integran en el GGUF bajo el prefijo `vae.` y se conservan en F32. El cuantizador identifica la arquitectura mediante la clave `voxcpm2` en `config.json`. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

El proceso de cuantización lo realiza la herramienta compressr (Apache-2.0, ejecución solo en CPU) en el commit `2fe3604`. La conversión de 813 tensores tardó 450 segundos en la máquina empleada, un tiempo dominado por la lectura y escritura de ficheros. El resultado es determinista: con los mismos ficheros base y el mismo commit de compressr, el hash SHA-256 coincide. El fichero resultante pasa de 4,62 GB a 2,62 GB.

Como innovación destacable del ecosistema, la model card menciona que el ejemplo `voxcpm_finetune` de voxr permite entrenar un adaptador LoRA sobre este mismo fichero cuantizado, manteniendo la base en Q8_0 y entrenando únicamente el adaptador (QLoRA). También se describe una función de diseño de voz por descripción textual (`--voice`) que evita la necesidad de una grabación de referencia, junto con una comprobación automática de cada toma mediante un modelo Whisper local.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida en fichero WAV.
- Diseño de voz mediante descripción textual (por ejemplo, tono, formalidad, género y acento), sin necesidad de audio de referencia.
- Soporte multilingüe declarado para malayo (ms), inglés (en) y chino (zh).
- Verificación automática de la salida mediante ASR local (Whisper) con reintento de las tomas mal reconocidas.
- Fine-tuning mediante QLoRA sobre la base cuantizada, con adaptadores LoRA entrenables.
- Ejecución autocontenida en un único fichero GGUF, sin ficheros auxiliares externos.
- No se documenta en la información disponible soporte de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Locución de boletines y avisos institucionales: la model card valida el modelo con un párrafo en bahasa melayu con formato de memo de un ministerio malasio y una voz descrita como locutor de informativos formal, lo que encaja con la generación de comunicados hablados en malayo.
- Producción de audiolibros y narraciones por secciones: dado que la propia model card advierte de degradación en textos largos, el flujo adecuado es dividir el texto en fragmentos cortos y sintetizar cada uno por separado.
- Doblaje y localización a tres idiomas: al declarar soporte para ms, en y zh, el modelo puede emplearse para generar pistas de voz en esos idiomas dentro de un mismo pipeline de localización.
- Creación de voces sintéticas por descripción: el parámetro `--voice` permite definir el estilo de locución sin grabar a un hablante, útil para prototipado rápido de personajes o voces corporativas.
- Integración en herramientas de vídeo y presentaciones: el fichero se configura como checkpoint TTS en el fichero de configuración de blazr (`~/.config/motion-video/config.json`), de modo que la síntesis de voz queda disponible en el flujo de generación de vídeo de esa herramienta.
- Adaptación a dominios o acentos propios con QLoRA: mediante el ejemplo `voxcpm_finetune` de voxr se puede entrenar un adaptador sobre la base cuantizada para ajustar el modelo a un estilo o vocabulario concreto sin recuantizar los pesos.
- Control de calidad automatizado en pipelines de audio: la comprobación con Whisper y el reintento de tomas mal reconocidas permiten montar un proceso que descarte o regenere segmentos con errores de pronunciación.

## Benchmarks y rendimiento

La única evaluación publicada en la información disponible es una comprobación cualitativa y de error de palabra sobre un párrafo en bahasa melayu, ejecutada el 2026-11-16 en una NVIDIA RTX 3060:

| Descripción de voz | Error de palabra (Whisper large-v3) |
|---|---|
| `(calm, formal Malay male newsreader)`, semilla 7 | 0 de 30 |
| `(calm, formal Malay female newsreader)`, semilla 7 | 2 de 30 |

Limitaciones declaradas de esta comprobación: la verificación de voz propia de blazr estaba activada y reintenta las partes mal reconocidas, por lo que las cifras reflejan la salida final y no la primera toma; la muestra es un único párrafo y una única semilla por voz; Whisper puntúa palabras, no acento (un oyente humano juzgó ambas voces como malayo de Malasia); el fichero no se comparó con el modelo en precisión completa; y la salida de VoxCPM2 se degrada en textos largos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Tamaño del fichero: 2,62 GiB (2.814.248.320 bytes) para la cuantización Q8_0; el modelo original en precisión completa ocupa 4,62 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; el fichero completo cabe holgadamente en GPUs de consumo con 8 GB o más, aunque la model card no publica una cifra de VRAM.
- GPU empleada en la verificación documentada: NVIDIA RTX 3060, con blazr compilado con las características `cuda,audio`.
- GPU recomendadas: no disponible; la única referencia concreta es la RTX 3060 de la prueba.
- Despliegue: blazr (con `--features cuda,audio`) para síntesis y verificación ASR con Whisper local; voxr para el ejemplo de fine-tuning `voxcpm_finetune`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El único dato temporal es el de la conversión a GGUF (450 s para 813 tensores, dominado por E/S), que no corresponde a inferencia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos TTS comparables (por ejemplo, otros sistemas de síntesis de voz multilingües o con diseño de voz por descripción), por lo que no es posible establecer una comparación cuantitativa. La única referencia disponible es el propio modelo base sin cuantizar:

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| VoxCPM2-Q8_0-GGUF (esta ficha) | 2.384.184.644 | no disponible | GGUF único, 2,62 GiB | Apache-2.0 | Cuantización Q8_0; sin comparación publicada frente al modelo completo |
| openbmb/VoxCPM2 | 2.384.184.644 | no disponible | safetensors + `audiovae.pth` + config + tokenizer | Apache-2.0 | Modelo base; 4,62 GB; requiere ficheros auxiliares |

## Limitaciones y advertencias

- La model card advierte explícitamente de que la salida de VoxCPM2 se degrada en textos largos; recomienda sintetizar secciones cortas.
- La evaluación publicada es muy limitada: un párrafo, una semilla por voz y un solo idioma (malayo), sin comparación frente al modelo en precisión completa.
- Las cifras de error de palabra se obtuvieron con la verificación y el reintento automáticos de blazr activados, por lo que no representan el rendimiento de una primera toma.
- Whisper evalúa palabras, no acento; la calidad del acento solo fue valorada por un oyente humano en esa única prueba.
- Solo se ha probado la cuantización Q8_0; otras cuantizaciones soportadas por compressr (`q4_k_m`, `q5_k_m`, `q6_k`) no están verificadas en esta publicación.
- El modelo está pensado para ejecutarse con las herramientas blazr y voxr; no se documenta compatibilidad con otros runtimes de inferencia.
- No se dispone de información sobre sesgos, tasas de alucinación o comportamiento fuera de los tres idiomas declarados (ms, en, zh).
- La licencia Apache-2.0 permite uso comercial, pero el repositorio solo cambia el formato de almacenamiento de los pesos; cualquier restricción adicional del modelo base debe consultarse en su propia model card.
- El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, lo que indica que no cuenta con validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/ml-rust/VoxCPM2-Q8_0-GGUF
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Herramienta blazr: https://github.com/ml-rust/blazr
- Herramienta voxr: https://github.com/ml-rust/voxr
- Herramienta de conversión y cuantización compressr: https://github.com/ml-rust/compressr
