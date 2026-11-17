# hdae/karume-irodori-v4-large

## Resumen

Karume Irodori-TTS v4 Large es una distribución del modelo de síntesis de voz en japonés Irodori-TTS v4 Large de Aratako, convertido al formato de contenedor del runtime de inferencia WebGPU Karume (`.krm`). Lo publica el usuario hdae como conversión no oficial y no tiene vinculación ni respaldo de Aratako ni de Google. El modelo original es un sistema de text-to-speech basado en un DiT con flujo rectificado (rectified flow), que emplea un codificador de texto T5Gemma 2 de 1B parámetros y un códec de audio DACVAE semántico específico para japonés.

La relevancia de esta distribución radica en que empaqueta toda la cadena de inferencia (codificador de texto, proyectores de condición, codificador de altavoz de referencia, predictor de duración, DiT dividido en dos grafos y códec DACVAE) en un contenedor ejecutable directamente en navegador y en Deno mediante WebGPU, sin necesidad de servidores ni de Python. Incluye clonación de voz tanto desde audio de referencia como desde latentes precalculados, y cuantizaciones que van de `f16` a `i4` con calibración GPTQ para el DiT.

El repositorio ocupa 11,2 GB y no registra descargas ni likes en el momento de la consulta. La licencia es Gemma, heredada del codificador de texto T5Gemma, con restricciones adicionales de uso ético y comercial que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT con flujo rectificado (rectified flow) + codificador de texto T5Gemma + códec DACVAE |
| Parametros totales | no disponible (el codificador de texto base T5Gemma 2 es de 1B; el total de la cadena no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `f16`, `i8`, `i8-a8`, `i8+dit4` (el DiT añade una serie `i4` redondeada con calibración GPTQ) |
| Idiomas soportados | japonés (etiqueta `japanese`; no se listan otros idiomas) |
| Licencia | Gemma Terms of Use (hereda de google/t5gemma-2-1b-1b); códec MIT y Apache-2.0 |
| Formato de pesos | contenedor Karume `.krm` (secuencia de partes con grafo y descriptores embebidos); no legible por la implementación upstream |
| Frecuencia de muestreo de salida | 48000 Hz, mono, f32 |
| Modelo base | Aratako/Irodori-TTS-v4-Large (rev. 2e0c554), google/t5gemma-2-1b-1b, Aratako/Semantic-DACVAE-Japanese-32dim |
| Exportador | karume/0.22.0, manifiesto `karume.json` (karume/5) |
| Cuantización por defecto | `i8-a8` |

## Arquitectura y entrenamiento

La cadena de inferencia se compone de nueve grafos: el codificador de texto compartido `backbone` (T5Gemma 2 de 1B parámetros afinado), los proyectores de condición `text_proj` y `caption_proj`, el codificador de altavoz de referencia `speaker` (que opera sobre latentes), el predictor de `duration`, el DiT dividido en `dit_context` (calcula las claves y valores de condicionamiento una vez por generación) y `dit` (una pasada por paso de Euler, más una por rama de classifier-free guidance), y el códec DACVAE como `codec_decoder` y `codec_encoder`. La generación es de texto a forma de onda: `generate()` devuelve muestras f32 mono a la frecuencia del códec, listas para `encodeWav`.

Esta conversión no incluye reentrenamiento ni ajuste fino. Los cambios respecto al checkpoint original son de formato y cuantización: todos los componentes se almacenan como series `f16`/`i8`, y el DiT añade una serie `i4` con calibración GPTQ. Además, la máscara de atención de ventana deslizante del codificador de texto se precalcula como constante, la fila de fin de imagen del embedding se selecciona elemento a elemento, las convoluciones con normalización de pesos del códec se guardan como pesos efectivos, `codec_encoder` conserva solo la mitad de media de `quantizer.in_proj`, `codec_decoder` omite la rama de watermarking y se precalculan subexpresiones constantes. El decodificador se ejecuta por teselas para caber en GPUs con el límite por defecto de 128 MiB de storage buffer, y el troceado es bit-exacto frente a una decodificación de una sola pasada.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés: texto de entrada, forma de onda de salida a 48 kHz mono en f32.
- Clonación de voz con altavoz de referencia, admitida de dos formas: audio mono f32 (lo que devuelve `decodeWav`), convertido a latente DACVAE por `codec_encoder`, o directamente un latente de referencia.
- Control de duración mediante un predictor dedicado (`duration`), integrado en la cadena de generación.
- Condicionamiento por texto y por caption a través de proyectores separados (`text_proj`, `caption_proj`).
- Inferencia en navegador y en Deno mediante WebGPU, sin servidor Python.
- Ejecución con cuantizaciones `f16`, `i8`, `i8-a8` e `i8+dit4` seleccionables por parámetro `quant`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.
- El audio de referencia debe estar ya a 48000 Hz: no hay remuestreador y una frecuencia distinta se rechaza en lugar de convertirse silenciosamente.

## Casos de uso

- Síntesis de voz en aplicaciones web sin backend: al ejecutarse en WebGPU dentro del navegador, permite generar voz japonesa en el cliente sin enviar texto a un servidor, útil para interfaces de accesibilidad o lectores de contenido.
- Clonación de voz para doblaje o audiolibros: se pasa una muestra de referencia a 48 kHz y el modelo genera nuevas locuciones con el timbre del hablante, adecuado para producir variaciones de un mismo narrador.
- Prototipado rápido de TTS en Deno: la integración con `jsr:@karume/models` permite incorporar síntesis de voz a scripts y herramientas de línea de comandos sin infraestructura de GPU dedicada.
- Generación de avisos y locuciones para sistemas embebidos o aplicaciones de escritorio con WebGPU, donde no se quiere depender de servicios de TTS en la nube.
- Evaluación comparativa de cuantizaciones: las series `f16`, `i8`, `i8-a8` e `i8+dit4` permiten medir el compromiso entre calidad de audio y uso de memoria en el mismo runtime.
- Investigación sobre flujos rectificados en TTS: al estar la cadena dividida en grafos separados (`dit_context`, `dit` por paso de Euler), facilita el análisis del proceso de muestreo y del efecto de classifier-free guidance.
- Pruebas de clonación de voz con latentes precalculados: útil en pipelines donde el latente del hablante se obtiene una vez y se reutiliza en muchas generaciones, evitando el coste de `codec_encoder`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 11,2 GB, lo que da una cota superior del almacenamiento de pesos; la cuantización por defecto `i8-a8` reduce la huella frente a `f16`.
- El decodificador está troceado para caber en GPUs con el límite por defecto de 128 MiB de storage buffer de WebGPU, lo que apunta a que puede ejecutarse en GPUs de gama media y en entornos con límites estrictos de buffer.
- `codec_encoder` no está troceado: una referencia de audio larga puede superar el límite de 128 MiB de storage buffer.
- GPU recomendadas: no disponibles. El runtime es WebGPU, por lo que requiere un navegador o Deno con soporte WebGPU y una GPU compatible; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Despliegue: runtime Karume (`jsr:@karume/models`, pipeline `irodori/1`), en navegador o Deno. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este contenedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente lo que puede contrastarse con los componentes citados:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| hdae/karume-irodori-v4-large | TTS japonés, DiT + DACVAE, contenedor Karume | no disponible (codificador T5Gemma 1B) | no disponible | Gemma | `.krm` |
| Aratako/Irodori-TTS-v4-Large | TTS japonés original | no disponible | no disponible | Gemma | checkpoint original (no distribuido aquí) |
| google/t5gemma-2-1b-1b | Codificador de texto base | 1B | no disponible | Gemma | safetensors (upstream) |
| Aratako/Semantic-DACVAE-Japanese-32dim | Códec de audio | no disponible | no aplica | MIT | no disponible |

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Aratako ni por Google; los resultados pueden diferir del modelo original.
- Solo japonés: la etiqueta de idioma es `japanese` y no se documentan otros idiomas.
- Sin remuestreador: el audio de referencia debe estar a 48000 Hz; cualquier otra frecuencia se rechaza.
- `codec_encoder` sin trocear: referencias largas pueden exceder el límite de 128 MiB de storage buffer y fallar.
- Licencia Gemma: el uso y la redistribución deben cumplir los Gemma Terms of Use y la Gemma Prohibited Use Policy, además de las restricciones éticas adicionales de la model card upstream. El uso comercial está sujeto a esos términos.
- Riesgo de uso indebido en clonación de voz: la capacidad de imitar hablantes exige consentimiento y cumplimiento normativo; el `codec_decoder` omite la rama de watermarking del códec original, por lo que no se aplica marcado de agua en esta conversión.
- Sin datos de benchmarks ni de sesgos publicados: no puede evaluarse la calidad objetiva ni el comportamiento en dominios concretos a partir de la información disponible.
- Contenedor propietario del runtime: no es legible por la implementación upstream de Irodori-TTS, lo que limita la portabilidad a otras herramientas.
- El repositorio no incluye el checkpoint original; solo la conversión cuantizada.

## Enlaces

- Hugging Face: https://huggingface.co/hdae/karume-irodori-v4-large
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4-Large
- Codificador de texto: https://huggingface.co/google/t5gemma-2-1b-1b
- Códec: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Códec de origen: https://huggingface.co/facebook/dacvae-watermarked
- Implementación upstream: https://github.com/Aratako/Irodori-TTS
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Runtime Karume: `jsr:@karume/models` (pipeline `irodori/1`)
