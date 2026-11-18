# prithivMLmods/Kokoro-82M-GGUF

## Resumen

Kokoro-82M-GGUF es la versión cuantizada en formato GGUF del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad y redistribuido por prithivMLmods. Se trata de un modelo text-to-speech (TTS) de pesos abiertos con arquitectura decoder-only basada en StyleTTS 2 e ISTFTNet, sin difusión y sin encoder publicado, que incorpora la librería de conversión grafema-fonema Misaki para generar etiquetas de fonemas IPA. Su relevancia radica en que ofrece calidad de audio comparable a modelos mucho mayores con un coste computacional mínimo.

El dato de parámetros totales registrado en el repositorio (5.815.552) no coincide con la denominación comercial "82M" del modelo base; la model card del autor cita 82 millones de parámetros, por lo que existe una discrepancia entre ambas fuentes que conviene tener en cuenta al planificar el despliegue. El repositorio ocupa 0,3 GB e incluye múltiples cuantizaciones GGUF, desde Q3_K_M hasta BF16, además de un proyector multimodal en BF16.

Esta ficha se centra en la variante GGUF, pensada para su ejecución mediante llama.cpp (binario `llama-tts`), lo que permite desplegar el modelo en entornos locales sin depender de frameworks de deep learning pesados. La licencia Apache 2.0 facilita su uso tanto personal como comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only basada en StyleTTS 2 e ISTFTNet (sin difusión, sin encoder publicado) |
| Parámetros totales | 5.815.552 según safetensors del repo; la model card del autor cita 82M (discrepancia entre fuentes) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 (más proyector mmproj-bf16) |
| Idiomas soportados | Inglés (en) según los metadatos del repo; la model card menciona soporte de 8 idiomas y 54 voces en la versión v1.0 del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura decoder-only construida sobre StyleTTS 2 e ISTFTNet, sin componente de difusión y sin encoder publicado. La entrada de texto se convierte a fonemas IPA mediante la librería Misaki (grapheme-to-phoneme), lo que constituye la base del pipeline de síntesis. El modelo base fue entrenado durante aproximadamente 1.000 horas en GPUs A100 80GB con un coste estimado de unos 1.000 dólares, empleando unos cientos de horas de audio exclusivamente permisivo, de dominio público y sintético, etiquetado con fonemas IPA.

La variante GGUF redistribuida por prithivMLmods se ha cuantizado con llama.cpp y se ejecuta a través del binario `llama-tts`, que requiere el archivo de pesos y el proyector multimodal en BF16 para las capacidades de audio y voz. No se dispone de información sobre procesos de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés.
- Conversión grafema-fonema a IPA mediante Misaki como paso previo a la síntesis.
- Soporte de selección de voz mediante el parámetro `--tts-voice` (por ejemplo, `am_michael` en los ejemplos de la model card).
- Generación de audio con control de semilla (`--seed`) y longitud de generación (`-n`).
- Salida en formato WAV.
- Ejecución con offloading a GPU mediante `-ngl`.
- Soporte de cuantizaciones de baja precisión para entornos con poca memoria.
- Capacidades multimodales de audio a través del proyector `mmproj-bf16`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Narración de artículos y blogs: el modelo convierte texto en audio WAV de forma local, lo que permite generar versiones locutadas de contenido editorial sin costes de API y con control total sobre la voz empleada.
- Generación de audiolibros y contenido largo: al ejecutarse con llama.cpp y un consumo de memoria mínimo, puede procesar grandes volúmenes de texto por lotes en una sola máquina, con la cuantización Q4_K_M como opción recomendada por equilibrio calidad/tamaño.
- Asistentes de voz para aplicaciones de escritorio: la integración con el binario `llama-tts` permite añadir síntesis de voz a herramientas locales sin dependencias de servicios en la nube, manteniendo la privacidad del texto procesado.
- Prototipado rápido de interfaces de voz: el tamaño reducido de los archivos GGUF (desde 3,28 MB en Q3_K_M) facilita probar distintas voces y cuantizaciones en portátiles y entornos de desarrollo con recursos limitados.
- Accesibilidad: conversión de texto a audio para lectores de pantalla o aplicaciones de asistencia, con la ventaja de que la licencia Apache 2.0 permite integrarlo en productos comerciales sin restricciones de redistribución.
- Generación de avisos y mensajes pregrabados: para sistemas de megafonía, IVR o notificaciones automatizadas donde se requiere generar locuciones cortas de forma programática y con bajo coste computacional.
- Investigación en TTS: al ser un modelo pequeño y de pesos abiertos, resulta adecuado como baseline para experimentos de síntesis de voz, ajuste fino o comparación de cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los archivos de pesos van desde 3,28 MB (Q3_K_M) hasta 11,8 MB (BF16), más el proyector multimodal de 208 MB en BF16.
- GPU recomendadas: cualquier GPU con soporte CUDA para el offloading de llama.cpp; el ejemplo de la model card emplea `-ngl 99` para descargar todas las capas en GPU. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la documentación.
- Cabe en GPU de consumo: sí, por el reducido tamaño de los pesos; el cuello de botella principal será el proyector multimodal y el propio proceso de síntesis, no la memoria de los pesos.
- Opciones de despliegue: llama.cpp mediante el binario `llama-tts` (compilado con backend CUDA); la librería declarada es `kokoro`. No se documentan opciones con vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. La model card menciona un coste de API inferior a 1 dólar por millón de caracteres o 0,06 dólares por hora de audio generado, pero no ofrece cifras de latencia o throughput por hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Kokoro-82M-GGUF (esta ficha) | 5,8M según safetensors / 82M según model card | No disponible | Inglés (repo); 8 idiomas en el base | Apache 2.0 | GGUF | Hugging Face |
| hexgrad/Kokoro-82M (modelo base) | 82M (según model card) | No disponible | 8 idiomas, 54 voces | Apache 2.0 | Safetensors | Hugging Face |
| Alternativas TTS de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: el repositorio declara 5.815.552 parámetros en safetensors, mientras que la model card del autor cita 82M; conviene verificar la cifra real antes de dimensionar infraestructura.
- Idiomas: los metadatos del repositorio indican únicamente inglés, aunque la model card del modelo base menciona 8 idiomas; el soporte multilingüe de esta variante GGUF no está confirmado.
- Riesgo de alucinación y errores de pronunciación: como todo modelo TTS, puede producir fonemas incorrectos o prosodia antinatural en palabras poco frecuentes, nombres propios o siglas.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con audio de dominio público y sintético, la diversidad de voces y acentos puede ser limitada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y redistribución, pero se recomienda conservar los avisos de licencia y atribución al modelo base hexgrad/Kokoro-82M.
- Dependencia de llama.cpp: el despliegue requiere compilar el binario `llama-tts` con el backend adecuado, lo que añade complejidad frente a usar el modelo base con la librería kokoro.
- Longitud de contexto no documentada: no se especifica el máximo de texto de entrada por generación, por lo que textos largos pueden requerir fragmentación manual.
- Repositorio con pocas descargas y likes (0 descargas, 1 like en el momento de la consulta): menor validación comunitaria que el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Kokoro-82M-GGUF
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Archivo de pesos BF16: https://huggingface.co/prithivMLmods/Kokoro-82M-GGUF/blob/main/Kokoro-82M.BF16.gguf
- Proyector multimodal BF16: https://huggingface.co/prithivMLmods/Kokoro-82M-GGUF/blob/main/Kokoro-82M.mmproj-bf16.gguf
- Muestra de audio generada: https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/7ZJcmW3AdGVFC29rXdobb.wav
