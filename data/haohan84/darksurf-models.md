# haohan84/darksurf-models

## Resumen

DarkSurf models es un repositorio de modelos de lenguaje y reconocimiento de voz cuantizados en formato GGUF, publicados por el desarrollador haohan84 para su ejecución local en dispositivos Apple (macOS e iOS) mediante llama.cpp sobre Metal. El repositorio no entrena modelos propios: empaqueta y valida cuantizaciones de modelos Qwen (Qwen3.5-0.8B, Qwen3.5-2B y Qwen3-ASR-0.6B) con el objetivo de que aplicaciones cliente, empezando por el navegador DarkSurf, descarguen un único fichero y lo ejecuten sin servidor, de modo que los prompts y el texto de las páginas no salgan del dispositivo.

El catálogo cubre tres casos: un modelo de texto de 0,8B parámetros en cuantización dinámica de 4 bits (559 MB), un modelo de 2B con capacidad de visión mediante un proyector multimodal opcional (1,3 GB más 0,67 GB) y un modelo de reconocimiento automático de voz de 0,6B en Q8_0 (847 MB en dos ficheros). Los tres derivan de modelos base con licencia Apache-2.0, por lo que la redistribución y el uso comercial están permitidos en los mismos términos.

La relevancia del repositorio es fundamentalmente práctica: cada fichero publicado incluye mediciones de perplejidad, coincidencia de token top-1, velocidad de prefill y decodificación, y huella de memoria frente a la referencia en bf16 o fp32, algo poco habitual en repositorios de cuantizaciones. La contrapartida es que las mediciones se limitan a un Apple M4 y a conjuntos de prueba pequeños, y el propio autor advierte de que no se ha ejecutado todavía en iPhone ni iPad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5 para texto y visión; Qwen3-ASR para voz), empaquetado en GGUF para llama.cpp |
| Parametros totales | 596.049.920 (dato de safetensors del repositorio); 0,8B en el modelo de texto, 2B en el multimodal, 0,6B en el ASR |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 65.536 tokens en el modelo ASR (por defecto); el autor recomienda fijar 4.096 en todos los casos. Contexto nativo de Qwen3.5-0.8B: no disponible en la información proporcionada |
| Tipos de cuantizacion | UD-Q4_K_XL (Dynamic 4-bit de Unsloth) para texto y visión; Q8_0 para ASR; proyector multimodal en F16 |
| Idiomas soportados | en, vi (según metadatos); el ASR declara 52 idiomas, incluido vietnamita |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio declara también safetensors con 596.049.920 parámetros |

## Arquitectura y entrenamiento

Los modelos incluidos no han sido entrenados por el autor del repositorio. Se trata de artefactos derivados de tres modelos base de Alibaba Qwen: Qwen3.5-0.8B (solo texto), Qwen3.5-2B (texto más un codificador de imagen servido como `mmproj-F16.gguf`) y Qwen3-ASR-0.6B-hf (reconocimiento de voz con codificador de audio en un `mmproj` separado). Las cuantizaciones de texto y visión provienen de los GGUF de Unsloth en cuantización dinámica de 4 bits y se copian sin modificar; la de ASR fue convertida por el autor con llama.cpp `3c809f4` y cuantizada a Q8_0.

El detalle técnico más relevante es la conversión del checkpoint `Qwen3-ASR-0.6B-hf`, que requirió dos correcciones que el conversor de llama.cpp todavía no incorpora: el manejo de la configuración anidada y de los nombres de tensor del codificador de audio, y las secciones de M-RoPE. Según el autor, los ficheros resultantes coinciden tensor a tensor con los GGUF oficiales de `ggml-org`. No se documentan en la información disponible los volúmenes de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) de los modelos base.

## Capacidades

- Generación de texto y resumen en el modelo de 0,8B, orientado a resúmenes cortos, extracción de datos y preguntas simples sobre una página.
- Modo thinking de Qwen3.5: el prompt ChatML admite un bloque `<think></think>` vacío para desactivar el razonamiento extendido y reducir latencia.
- Comprensión de imágenes en el modelo de 2B: descripción de fotografías y lectura de texto presente en ellas, con el proyector `mmproj-F16.gguf`.
- Reconocimiento automático de voz en Qwen3-ASR-0.6B, con 52 idiomas declarados, incluido el vietnamita, y etiqueta de idioma por grabación.
- Traducción: el autor reporta traducciones fluidas al vietnamita desde el modelo de 0,8B, aunque con errores de significado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor califica el modelo de 0,8B como débil en razonamiento largo.
- Capacidades de audio más allá de la transcripción (diarización, streaming): no disponible.

## Casos de uso

- Navegación privada con resumen local de páginas: el modelo de 0,8B (559 MB, 3 GB de RAM mínima) resume o responde preguntas sobre el texto de la pestaña activa sin enviar contenido a un servidor, que es el escenario para el que se creó el catálogo.
- Extracción de datos en movilidad: con 4 bits dinámicos y 103 tok/s de decodificación en un M4, resulta adecuado para extraer campos concretos (titulares, fechas, importes) de documentos cortos en lugar de generar texto largo.
- Descripción de imágenes y OCR ligero: el modelo de 2B con `mmproj` describe fotografías y lee texto en ellas; con `--image-max-tokens` limitado y contexto de 4.096 tokens, la huella residente baja a 2,3 GiB, viable en un Mac con 6 GB o más.
- Transcripción de notas de voz: Qwen3-ASR-0.6B procesa 40 segundos de audio en unos 2 segundos tras 0,9 s de carga (unas 20 veces más rápido que tiempo real), con 0,8 GiB de pico de memoria, lo que permite dictado local en escritorio.
- Subtitulado o indexación de audio multilingüe: al declarar 52 idiomas, el modelo ASR puede transcribir contenido en vietnamita u otras lenguas para alimentar un índice de búsqueda local.
- Asistente de traducción con supervisión humana: útil para borradores de traducción al vietnamita, siempre que un revisor corrija los errores de significado que el propio autor señala.
- Filtrado y clasificación previa en el cliente: por su tamaño reducido, el modelo de 0,8B puede clasificar o etiquetar contenido antes de decidir si hace falta un modelo mayor en servidor.

## Benchmarks y rendimiento

Mediciones del autor en Apple M4 con llama.cpp `3c809f4` (Metal). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo / metrica | Tamano | Perplejidad (wikitext-2) | Delta vs referencia | Top-1 identico | Prefill | Decode |
|---|---:|---:|---:|---:|---:|---:|
| Qwen3.5-0.8B bf16 (referencia) | 1,40 GiB | 18,52 | — | — | 1866 tok/s | 51 tok/s |
| Qwen3.5-0.8B UD-Q4_K_XL | 532 MiB | 18,79 | +1,5% | 92,0% | 1736 tok/s | 103 tok/s |
| Qwen3.5-2B UD-Q4_K_XL | 1,3 GB | 12,35 | +2,2% (12,09 bf16) | 93,4% | ~990 tok/s | 63 tok/s |

| Modelo / metrica | Resultado |
|---|---|
| Qwen3.5-2B, divergencia KL media vs bf16 | 0,016 |
| Qwen3.5-2B, comprobación funcional (9 casos) | 8 correctos; un error de etiquetado de flor |
| Qwen3.5-2B, codificador de imagen | 0,8 a 3,2 s por foto según tamano |
| Qwen3.5-2B, memoria con contexto de 4096 | 2,3 GiB residentes |
| Qwen3-ASR-0.6B Q8_0, word error rate | 1,8%, identico a la referencia transformers fp32 (clip vietnamita 0%) |
| Qwen3-ASR-0.6B Q8_0, velocidad | 40 s de audio en ~2 s tras 0,9 s de carga (~20x tiempo real) |
| Qwen3-ASR-0.6B Q8_0, memoria | 0,8 GiB de pico con contexto de 4096 (1,4 GiB residentes) |

## Requisitos de hardware

- VRAM/RAM estimada: 3 GB mínimos para el modelo de texto de 0,8B y para el ASR; 6 GB para el modelo de 2B con visión. El contexto por defecto de 65.536 tokens en el ASR exige 8 GiB solo para la caché KV, de ahí la recomendación de fijar 4.096.
- GPU recomendadas: Apple Silicon (medido en M4 con Metal). Para el resto de plataformas no hay mediciones en la información disponible.
- GPU de consumo: los tres ficheros caben en cualquier GPU de consumo moderna con al menos 6-8 GB de VRAM en cuantización de 4 bits u 8 bits; no se aportan cifras medidas en A100, H100 ni RTX 4090.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-mtmd-cli`) es el runtime validado; Ollama, vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: 103 tok/s de decodificación y 1736 tok/s de prefill en el 0,8B Q4; 63 tok/s y ~990 tok/s en el 2B; ASR a ~20x tiempo real. Sin datos en iPhone ni iPad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DarkSurf Qwen3.5-0.8B UD-Q4_K_XL | 0,8B | no disponible (se usa con 8192 en el ejemplo) | Apache-2.0 | GGUF | Perplejidad +1,5% vs bf16, 92% top-1 |
| Qwen3.5-0.8B (original) | 0,8B | no disponible | Apache-2.0 | safetensors/bf16 | Referencia de calidad; 1,40 GiB, 51 tok/s en M4 |
| Qwen3.5-2B UD-Q4_K_XL (DarkSurf) | 2B | 4096 recomendado | Apache-2.0 | GGUF + mmproj | Visión; perplejidad +2,2%; 2,3 GiB con 4096 |
| Qwen3-ASR-0.6B Q8_0 (DarkSurf) | 0,6B | 4096 recomendado (65536 por defecto) | Apache-2.0 | GGUF + mmproj | WER 1,8% en tres clips; 52 idiomas |

No se dispone de comparaciones con alternativas de otros fabricantes (por ejemplo, modelos ASR o de texto de tamano similar) en la información proporcionada.

## Limitaciones y advertencias

- El modelo de 0,8B es débil en razonamiento largo y en idiomas distintos del inglés; las traducciones al vietnamita, aunque fluidas, contienen errores de significado según el autor.
- La perplejidad se midió únicamente en inglés (wikitext-2, 100 fragmentos de 512 tokens), por lo que no hay evidencia de calidad en otros idiomas.
- El ASR se evaluó con tres clips cortos (dos sintéticos y uno de LibriSpeech): es una prueba de humo, no un benchmark de precisión. No se han medido ruido, acentos, grabaciones largas ni streaming.
- La etiqueta de idioma del ASR es una sola por grabación, lo que falla en audio con cambio de idioma.
- La comprobación de visión del modelo de 2B se limita a nueve casos manuales, con un error de etiquetado; no se ejecutó ningún benchmark de visión.
- Ninguno de los tres modelos se ha probado en iPhone ni iPad; los mínimos de RAM son estimaciones del autor.
- Es obligatorio fijar un contexto pequeño (4.096) en visión y ASR: el valor por defecto dispara el consumo de memoria (6 GiB y 8 GiB respectivamente).
- Riesgo de alucinación inherente a modelos de este tamano; no se documentan evaluaciones de sesgo en la información disponible.
- Licencia Apache-2.0: permite uso comercial y redistribución, pero conviene conservar los avisos de atribución de los modelos base Qwen y verificar los SHA-256 publicados en `catalog.json` antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/haohan84/darksurf-models
- Modelo base de texto: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base multimodal: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base ASR: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Cuantizaciones de referencia: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF y https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
