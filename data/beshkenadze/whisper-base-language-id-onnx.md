# beshkenadze/whisper-base-language-id-onnx

## Resumen

Whisper base language id ONNX es un modelo de identificación de idioma hablado (spoken language identification) derivado de openai/whisper-base y publicado por el usuario beshkenadze. No es un modelo entrenado desde cero: es el subgrafo de Whisper que decide el idioma, extraído y empaquetado como un único grafo ONNX de 185 MB en fp32, con el front-end log-mel incluido dentro del propio grafo (ventana Hann de 400, hop 160, 80 bandas mel, log10 con suelo de 8 décadas y escalado `(x + 4) / 4`).

El modelo conserva únicamente el encoder, las capas del decoder, una fila del embedding de entrada y las 99 filas de salida correspondientes a los tokens de idioma de Whisper. La entrada es un tensor `[1, 480000]` float32 (exactamente 30 s de audio mono a 16 kHz, con padding de ceros si la ventana es más corta) y la salida es `[1, 99]` logits, uno por código de idioma de Whisper, en el orden que declara la metadata `labels`.

Su relevancia es práctica: resuelve el enrutado de idioma antes de invocar un reconocedor de voz, con un grafo pequeño que se ejecuta en CPU y en DirectML (la FFT se implementa como convolución con kernels fijos, por lo que no hay operadores STFT ni DFT). Fue creado para la aplicación Windows Tishina, que lo usa para elegir entre un reconocedor de ruso y uno multilingüe. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) reducido a clasificador de idioma, exportado como grafo ONNX con front-end log-mel integrado (opset 17) |
| Parametros totales | no disponible (el grafo conserva solo encoder, capas del decoder, una fila de embedding de entrada y las 99 filas de salida) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 s de audio, 480000 muestras float32 a 16 kHz mono, ventana fija con padding de ceros |
| Tipos de cuantizacion | solo fp32 (fichero `whisper-base-language-id.onnx`, 185 MB) |
| Idiomas soportados | multilingüe; salida sobre los 99 tokens de idioma de Whisper |
| Licencia | MIT (Copyright (c) 2022 OpenAI) |
| Formato de pesos | ONNX (opset 17), 185 MB en fp32; tamaño del repositorio 0,2 GB |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El autor exporta un subgrafo de openai/whisper-base con el script `scripts/eval/lid/export_whisper_lid_onnx.py` del repositorio de Tishina, en opset 17. El mecanismo es el propio de Whisper para identificar idioma: el encoder procesa 30 s de log-mel, el decoder recibe el token de inicio de transcripción y las puntuaciones de los 99 tokens de idioma en ese paso determinan el resultado. Al conservar solo esa ruta, el grafo pasa de los 296 MB del modelo completo a 185 MB en fp32. El front-end (ventana, mel, log10, escalado) va dentro del grafo y la transformada de Fourier se implementa como convolución con kernels fijos, lo que elimina los operadores STFT y DFT y permite cargar el modelo en DirectML además de en CPU.

La validación se hizo contra la implementación de Whisper en `transformers` sobre 30 clips de FLEURS: el front-end coincide dentro de 2e-5, los logits dentro de 6e-5 y el idioma predicho es el mismo en todos los clips. La precisión declarada es top-1 sobre 25 idiomas (los de Parakeet v3: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk), con probabilidades renormalizadas sobre ese conjunto.

## Capacidades

- Identificación de idioma hablado: devuelve el código de idioma más probable entre los 99 tokens de Whisper a partir de una ventana de audio.
- Clasificación de audio (pipeline `audio-classification`) como tarea principal del repositorio.
- Multilingüe: cubre el conjunto de idiomas de Whisper; la evaluación publicada se centra en 25 idiomas.
- Funciona con ventanas de 10 s y de 30 s, aunque con precisión distinta (ver benchmarks).
- Inferencia autocontenida en un solo grafo ONNX, sin necesidad de pipeline de tokenizer ni de feature extractor externo.
- Compatible con ONNX Runtime en CPU y en DirectML; la ausencia de operadores STFT/DFT amplía la compatibilidad de proveedores de ejecución.
- No realiza transcripción, traducción, generación de texto, tool calling, function calling ni razonamiento multi-paso: el grafo solo contiene la cabeza de identificación de idioma.
- No hay modo de pensamiento ni capacidades de visión o audio más allá de la clasificación de idioma.

## Casos de uso

- Enrutado de reconocedores ASR: detectar primero el idioma de la ventana de audio y enviar el flujo al reconocedor especializado adecuado (por ejemplo, un modelo de ruso frente a uno multilingüe), que es exactamente el uso para el que se creó en la aplicación Tishina.
- Aplicaciones de escritorio en Windows: al no necesitar operadores STFT ni DFT, el grafo se puede ejecutar en DirectML o en CPU dentro de una app nativa con un consumo de memoria del orden de cientos de megabytes.
- Pretratamiento en pipelines de subtitulado y transcripción por lotes: etiquetar cada pista con su idioma antes de encolar el trabajo en el motor de ASR, evitando lanzar modelos multilingües grandes cuando no hacen falta.
- Indexado y organización de archivos de audio: clasificar grabaciones de un repositorio o archivo sonoro por idioma para habilitar búsquedas y filtrados posteriores.
- Analítica de contact centers: determinar la distribución de idiomas de las llamadas para asignar agentes o encaminar colas, con ventanas de 30 s y una precisión alta en habla telefónica y de campo lejano según los datos publicados.
- Control de calidad de datasets: verificar que un corpus etiquetado como de un idioma concreto realmente lo está, como paso previo a usarlo para entrenar o evaluar otros modelos.
- Filtrado de idioma en tiempo casi real sobre CPU: en escenarios sin GPU, el tamaño del grafo (185 MB en fp32) permite ejecutarlo en el mismo servidor que el reconocedor principal sin desplazar recursos.
- Detección de cambios de idioma a nivel de segmento: aplicando la ventana de 30 s de forma deslizante o por tramos se puede identificar el idioma dominante de cada fragmento de una conversación multilingüe.

## Benchmarks y rendimiento

Datos publicados en la model card. Top-1 sobre 25 idiomas, con probabilidades renormalizadas sobre ese conjunto.

| Conjunto | 10 s | 30 s |
|---|---|---|
| FLEURS test, 19 idiomas x 120 enunciados | 0,946 | 0,999 |
| AMI test (inglés, campo lejano y auricular) | 1,000 | 1,000 |

| Modelo | FLEURS 10 s | Ventanas AMI | Observaciones |
|---|---|---|---|
| whisper-base-language-id-onnx | 0,946 | 1,000 | Envió cero tríos no rusos a ruso (whisper tiny envió tres) |
| SpeechBrain VoxLingua107 ECAPA | 0,986 | aprox. 0,86 | Confundió inglés con acento con neerlandés o danés |
| NVIDIA AmberNet | 0,986 | aprox. 0,86 | Confundió inglés con acento con neerlandés o danés |
| whisper tiny (referencia citada) | no disponible | no disponible | Tres tríos de FLEURS no rusos clasificados como ruso |

Verificación numérica frente a `transformers`: front-end dentro de 2e-5 y logits dentro de 6e-5 sobre 30 clips de FLEURS, con coincidencia de idioma en todos ellos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el grafo pesa 185 MB en fp32, por lo que el consumo esperado es del orden de 200-400 MB entre pesos y activaciones de una ventana de 480000 muestras; cifra estimada, no publicada.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime es suficiente dado el tamaño; no se especifican modelos concretos (A100, H100, RTX 4090 u otros) en la información disponible.
- Cabe en GPU de consumo: sí, con holgura, incluso en iGPU y en ejecución por CPU, dada la ausencia de operadores STFT/DFT.
- Opciones de despliegue: ONNX Runtime (CPU y DirectML) según la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un grafo de clasificación de audio de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | FLEURS 10 s | AMI (ventanas en inglés) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-base-language-id-onnx | no disponible | 30 s (entrada fija) | 0,946 | 1,000 | MIT | HuggingFace, ONNX, 0 descargas |
| SpeechBrain VoxLingua107 ECAPA | no disponible | no disponible | 0,986 | aprox. 0,86 | no disponible | no disponible |
| NVIDIA AmberNet | no disponible | no disponible | 0,986 | aprox. 0,86 | no disponible | no disponible |
| openai/whisper-base (modelo completo) | no disponible | 30 s | no disponible | no disponible | MIT | HuggingFace |

El patrón que describen los datos es claro: los clasificadores dedicados (ECAPA, AmberNet) son mejores en FLEURS a 10 s, pero pierden unos 12 puntos en las ventanas de AMI con inglés acentuado, donde este modelo mantiene el 1,000. En contrapartida, este grafo no ofrece transcripción ni ninguna otra salida.

## Limitaciones y advertencias

- Solo clasifica idioma: no transcribe, no traduce y no genera texto. Cualquier caso de uso que requiera la cadena completa necesita el modelo Whisper original u otro ASR.
- La entrada es rígida: `[1, 480000]` float32 a 16 kHz mono. Las ventanas más cortas deben rellenarse con ceros al final; no hay gestión automática de duración.
- Precisión dependiente de la ventana: 0,946 a 10 s frente a 0,999 a 30 s en FLEURS. En clips muy cortos la fiabilidad cae de forma apreciable.
- Las probabilidades se renormalizan sobre 25 idiomas en la evaluación publicada; el comportamiento fuera de ese conjunto de 25 no está cuantificado en la model card.
- No se documentan sesgos demográficos ni análisis por acento, género o edad. La única observación cualitativa es que whisper tiny envió tres tríos no rusos a ruso y base ninguno, y que ECAPA y AmberNet confundieron inglés con acento con neerlandés o danés.
- Riesgo de confusión entre lenguas próximas o con acentos marcados: es un clasificador de 99 clases sin mecanismo de abstención ni umbral de confianza documentado.
- Licencia MIT heredada de OpenAI (Copyright (c) 2022 OpenAI); no se indican restricciones adicionales para uso comercial, pero conviene revisar el fichero `LICENSE` del repositorio.
- Repositorio sin adopción: 0 descargas y 0 likes, sin issues ni validación comunitaria. La única verificación es la del propio autor contra `transformers` sobre 30 clips.
- La fecha de creación registrada en HuggingFace es 2026-09-26, posterior a lo esperable; conviene tratarla con cautela.
- El modelo fue construido para una aplicación concreta (Tishina) y sus datos de evaluación están orientados a ese propósito.
- No hay información sobre cuantizaciones alternativas ni sobre el rendimiento del grafo en GPU dedicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beshkenadze/whisper-base-language-id-onnx
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Repositorio de Tishina (script de exportación `scripts/eval/lid/export_whisper_lid_onnx.py`): URL no disponible en la información proporcionada
- Conjunto de evaluación FLEURS: URL no disponible en la información proporcionada
- Corpus AMI: URL no disponible en la información proporcionada
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (solo resultados genéricos de Google Images).
