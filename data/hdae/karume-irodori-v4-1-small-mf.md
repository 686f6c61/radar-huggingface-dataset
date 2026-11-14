# hdae/karume-irodori-v4.1-small-mf

## Resumen

Karume Irodori-TTS v4.1 Small MF es una conversión no oficial del modelo de síntesis de voz japonesa Irodori-TTS v4.1 Small MF de Aratako, empaquetada en el formato de contenedor del runtime de inferencia WebGPU Karume. El modelo original es un sistema text-to-speech basado en un transformer de difusión (DiT) destilado mediante MeanFlow, que combina un backbone de texto ModernBERT japonés de 310 millones de parámetros con un códec de audio DACVAE semántico. Esta distribución permite ejecutar el pipeline completo de síntesis de voz directamente en el navegador y en Deno, sin necesidad de infraestructura de servidor.

La relevancia de esta ficha radica en que se trata de una de las pocas distribuciones de TTS japonés de alta calidad que funcionan íntegramente en el cliente mediante WebGPU, con clonación de voz integrada y cuantización agresiva (hasta i4 en el DiT con calibración GPTQ). El repositorio ocupa 2,9 GB e incluye todos los componentes necesarios (backbone de texto, proyectores de condición, codificador de hablante, predictor de duración, DiT y códec) para que la síntesis texto-a-onda funcione desde un único repositorio.

La licencia es MIT para los pesos principales y el backbone, con componentes del códec bajo Apache-2.0. No se han publicado resultados de benchmarks ni métricas de calidad objetiva en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) destilado con MeanFlow + backbone ModernBERT japonés + códec DACVAE semántico |
| Parametros totales | no disponible (backbone de texto: 310M; total del pipeline no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32, f16, i8, i8-a8, i8+dit4 (DiT con i4 y calibración GPTQ) |
| Idiomas soportados | japonés |
| Licencia | MIT (pesos principales y backbone); Apache-2.0 para componentes del códec |
| Formato de pesos | contenedor `.krm` (secuencia de partes con grafo y descriptores embebidos), específico de Karume |

## Arquitectura y entrenamiento

El pipeline se compone de nueve grafos encadenados: un backbone compartido ModernBERT japonés (`backbone`), los proyectores de condición `text_proj` y `caption_proj`, el codificador de latentes de referencia `speaker`, el predictor de `duration`, el DiT dividido en dos grafos (`dit_context` para las claves/valores de condicionamiento, una vez por generación, y `dit` para un forward por paso de muestreo) y el códec DACVAE como `codec_decoder` y `codec_encoder`. El DiT fue destilado por el autor original mediante MeanFlow: se reentrenó el DiT completo con un embedding de intervalo añadido para dar pocos pasos grandes, y la guía (guidance) se fusionó en los objetivos del profesor, de modo que la inferencia no requiere classifier-free guidance ni ramas duplicadas. Los codificadores de condición y el predictor de duración provienen del modelo profesor (Irodori-TTS v4.1 Small).

El backbone de texto deriva de `sbintuitions/modernbert-ja-310m` afinado, y el códec de `Aratako/Semantic-DACVAE-Japanese-32dim`, cuyos pesos a su vez provienen de `facebook/dacvae-watermarked`. La conversión a Karume no incluye reentrenamiento ni fine-tuning: solo cambio de contenedor y cuantización de pesos (f32/f16/i8 por componente, más una serie i4 en el DiT redondeada con calibración GPTQ). El códec almacena sus convoluciones con normalización de pesos como pesos efectivos, conserva solo la mitad de la media de `quantizer.in_proj` en `codec_encoder` y omite la rama de watermarking en `codec_decoder`. El decodificador se ejecuta por teselas para caber en GPUs con el límite por defecto de 128 MiB de storage-buffer, y el teselado es bit-exacto frente a una decodificación de una sola pasada.

## Capacidades

- Síntesis de voz japonesa texto-a-onda: `generate()` devuelve muestras mono f32 a la frecuencia de muestreo del códec, listas para `encodeWav`.
- Clonación de voz bidireccional: la referencia de hablante se puede pasar como audio mono f32 (lo que devuelve `decodeWav`) o como latente DACVAE directamente.
- Ejecución en navegador y Deno mediante WebGPU, sin servidor.
- Cuantización seleccionable por el usuario (`f32`, `f16`, `i8`, `i8-a8`, `i8+dit4`), con `i8` como valor por defecto.
- Inferencia sin classifier-free guidance gracias a la destilación MeanFlow, lo que reduce el coste por paso de muestreo.
- No soporta tool calling, function calling, agentes, visión, audio de entrada (salvo referencia de hablante) ni modos de razonamiento extendido: es un modelo especializado exclusivamente en TTS.

## Casos de uso

- Síntesis de voz en aplicaciones web sin backend: el modelo se ejecuta en el navegador mediante WebGPU, por lo que se puede integrar en sitios estáticos o aplicaciones Deno sin desplegar servidores de inferencia ni exponer datos de usuario.
- Clonación de voz para audiolibros y contenido narrado: se pasa una muestra de referencia del hablante (audio mono f32 a 48 kHz) y el modelo genera nuevas locuciones con esa voz, útil para producir narraciones personalizadas de forma local.
- Accesibilidad y lectores de pantalla: conversión de texto japonés a voz en el cliente para aplicaciones de lectura, con la ventaja de que el audio no sale del dispositivo del usuario.
- Prototipado rápido de interfaces de voz: al ejecutarse en Deno y en el navegador, permite iterar sobre experiencias conversacionales sin provisionar GPUs ni contenedores.
- Generación de doblajes y voces para vídeo o juegos: la clonación de voz permite mantener consistencia de timbre entre tomas y generar variaciones de locución a partir de un mismo hablante de referencia.
- Investigación en TTS y evaluación de cuantización: las series f32/f16/i8/i8-a8/i8+dit4 permiten medir el impacto de la cuantización en calidad de audio y latencia sobre el mismo modelo, con el teselado bit-exacto como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 2,9 GB y el decodificador está teselado para caber en GPUs con el límite por defecto de 128 MiB de storage-buffer de WebGPU.
- GPU recomendadas: no disponible; el requisito funcional es soporte de WebGPU (navegadores modernos y Deno).
- Compatibilidad con GPU de consumo: el diseño (cuantización i8/i4 y teselado del decodificador) apunta a que quepa en GPUs de consumo con WebGPU, pero no se especifican modelos concretos.
- Opciones de despliegue: runtime Karume (`jsr:@karume/models` y `jsr:@karume/models/irodori`), en navegador y Deno. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el contenedor `.krm` no es legible por la implementación upstream.
- Latencia y throughput: no disponibles. El uso de MeanFlow reduce el número de pasos de muestreo del DiT al no requerir classifier-free guidance, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| Karume Irodori-TTS v4.1 Small MF (este) | TTS japonés, DiT + DACVAE | backbone 310M; total no disponible | no disponible | MIT / Apache-2.0 (códec) | WebGPU (Karume), navegador y Deno | Cuantización i4 en DiT, clonación de voz, sin CFG |
| Aratako/Irodori-TTS-v4.1-Small-MF (upstream) | TTS japonés, DiT + DACVAE | no disponible | no disponible | MIT | Implementación propia (PyTorch) | Modelo profesor de esta conversión; no legible por Karume |
| Aratako/Irodori-TTS-v4.1-Small | TTS japonés, DiT + DACVAE | no disponible | no disponible | MIT | Implementación propia | Modelo profesor del que se destiló el MF; requiere CFG |
| sbintuitions/modernbert-ja-310m | Modelo de lenguaje (encoder) | 310M | no disponible | MIT | PyTorch / transformers | Solo backbone de texto; no es un TTS por sí mismo |

## Limitaciones y advertencias

- Solo soporta japonés; no se ha validado para otros idiomas.
- La conversión es no oficial y no está afiliada ni respaldada por Aratako ni por SB Intuitions.
- El contenedor `.krm` no es legible por la implementación upstream: no se puede cargar con el código original de Irodori-TTS.
- El audio de referencia para clonación debe estar ya a 48 kHz y en mono f32; no hay remuestreador y una frecuencia incorrecta se rechaza en lugar de convertirse silenciosamente.
- `codec_encoder` no está teselado, por lo que una referencia de audio larga puede superar el límite por defecto de 128 MiB de storage-buffer.
- La rama de watermarking del códec está desactivada en `codec_decoder`, de modo que el audio generado no lleva marca de agua.
- No hay datos publicados sobre sesgos, tasas de alucinación o calidad perceptual del audio; se desconoce el impacto real de la cuantización i4 en el DiT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- Para builds reproducibles se recomienda fijar un commit concreto (`revision`), ya que sin él se sigue `main` y una actualización futura del repositorio puede romper la aplicación.

## Enlaces

- Hugging Face: https://huggingface.co/hdae/karume-irodori-v4.1-small-mf
- Modelo base (pesos): https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF
- Modelo profesor: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Backbone de texto: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Códec: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Códec origen: https://huggingface.co/facebook/dacvae-watermarked
- Repositorio de implementación upstream: https://github.com/Aratako/Irodori-TTS
- Runtime Karume: https://jsr.io/@karume/models
