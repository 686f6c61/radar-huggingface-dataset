# roman220220/chatterbox-multilingual-v3-mlx-8bit

## Resumen

Chatterbox Multilingual V3 es un modelo de síntesis de voz (text-to-speech) desarrollado por Resemble AI, publicado bajo licencia MIT. Su rasgo diferencial es la clonación de voz zero-shot a partir de un clip corto de referencia (Resemble sugiere unos 10 segundos) y el soporte de 23 idiomas, además de incorporar marcas de agua embebidas en el audio generado. La versión que documenta esta ficha es una conversión comunitaria a MLX, publicada por el usuario `roman220220`, pensada para ejecución local en Apple Silicon.

El repositorio no contiene los pesos originales, sino una cuantización a 8 bits del componente T3 (un backbone Llama de aproximadamente 0,5B de parámetros que transforma texto en tokens de habla), manteniendo S3Gen (tokens de habla a audio) y el codificador de voz en fp32. El total de parámetros declarado en los safetensors es de 693.232.383. La conversión añade además la voz integrada (`conds.safetensors`), ausente en la conversión MLX multilingüe de referencia.

La relevancia actual es práctica: permite TTS multilingüe con clonación de voz en un Mac sin enviar datos a la nube, con una reducción de memoria pico de 4,1 GB a 3,5 GB y una latencia total de 5,0-6,0 s frente a 8,0-10,9 s del modelo fp32, según las mediciones del autor. El repo ocupa 1,3 GB frente a 2,71 GB de la conversión fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T3 (transformer tipo Llama, ~0,5B) para texto a tokens de habla + S3Gen para tokens de habla a audio + codificador de voz; conversión MLX |
| Parametros totales | 693.232.383 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | T3 a 8 bits con group_size=64; S3Gen y codificador de voz en fp32; el autor indica que 4 bits no fue más rápido que 8 bits |
| Idiomas soportados | ar, da, de, el, en, es, fi, fr, he, hi, it, ja, ko, ms, nl, no, pl, pt, ru, sv, sw, tr, zh (23) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `quantization` en `config.json`; tokenizador de habla aparte en `mlx-community/S3TokenizerV2` |

## Arquitectura y entrenamiento

El modelo base, Chatterbox Multilingual V3 (`t3_mtl23ls_v3`), mantiene el mismo backbone Llama de 0,5B que Multilingual v2 e introduce mejoras en similitud de hablante y tasa de alucinación respecto a la versión anterior, según Resemble AI. La arquitectura se descompone en tres piezas: T3, que convierte texto en tokens de habla; S3Gen, que convierte esos tokens en audio; y un codificador de voz que extrae las condiciones del hablante a partir del clip de referencia. El tokenizador de habla empleado por mlx-audio es `mlx-community/S3TokenizerV2` (Apache-2.0), convertido desde CosyVoice2-0.5B.

Esta conversión concreta no entrena nada: carga `mlx-community/chatterbox-multilingual-v3` con mlx-audio, aplica `nn.quantize(model.t3.tfmr, group_size=64, bits=8)`, guarda el resultado con la clave `quantization` en `config.json` para que el cargador propio de mlx-audio lo lea, e incorpora `conds.safetensors` desde `mlx-community/chatterbox-fp16` (que corresponde al `conds.pt` de Resemble). El autor verificó que los pesos pre-cuantizados producen el mismo audio que cuantizar en tiempo de ejecución, con diferencias inferiores a 1e-4 por muestra. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas, con selección de idioma mediante `--lang_code`.
- Clonación de voz zero-shot a partir de un clip de referencia; sin referencia, usa la voz integrada incluida en el repo.
- Control de exageración emocional, capacidad que el proyecto base presenta como pionera en TTS open source.
- Marcas de agua embebidas en el audio generado (característica del modelo base de Resemble AI).
- Generación de audio a partir de texto con salida gestionada por mlx-audio.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo de TTS, no un LLM conversacional.

## Casos de uso

- Lectura en voz alta de respuestas de chat en local: LLMTray emplea este modelo para leer las respuestas de un LLM local, con la ventaja de que el audio no sale del Mac y el tiempo total por frase de 3,5-4 s es de 5,0-6,0 s.
- Asistentes de voz privados en macOS: integración vía mlx-audio para dotar de voz a agentes locales, aprovechando que el modelo corre en Apple Silicon sin GPU dedicada.
- Doblaje y localización de contenido breve: con 23 idiomas y clonación de voz, permite generar una misma locución en varios idiomas manteniendo el timbre del hablante de referencia.
- Prototipado de interfaces conversacionales: generación de audio de prueba en pipelines de desarrollo de asistentes, con una latencia de aproximadamente 1 s de cómputo de S3Gen por cada segundo de habla.
- Audiolibros y contenido accesible: conversión de texto a voz con voz consistente mediante el clip de referencia, en un equipo de sobremesa con 26 GB de RAM.
- Investigación en TTS y cuantización: el repo incluye el script y las mediciones en `quant-ternary/chatterbox-quant`, útil para reproducir el efecto de la cuantización de T3 en calidad y velocidad.
- Generación de voz para ruso: el autor documenta que Chatterbox lee mejor el ruso con texto acentuado (U+0301 tras la vocal tónica) y que LLMTray añade las marcas con `ruaccent`.

## Benchmarks y rendimiento

Mediciones del autor sobre un Mac base M5 con 26 GB, una frase de 3,5-4 s, tres ejecuciones por configuración. El equipo estaba bajo presión de memoria (swap en uso), por lo que los tiempos individuales variaron hasta 2x.

| Métrica | fp32 (mlx-community) | Este repo (8 bits) |
|---|---|---|
| T3 tokens/s | 14-26 | 38-51 |
| T3 (tiempo) | 3,9-7,1 s | 1,8-2,4 s |
| S3Gen (tiempo) | 3,3-4,0 s | 3,2-3,6 s |
| Total | 8,0-10,9 s | 5,0-6,0 s |
| Memoria pico | 4,1 GB | 3,5 GB |
| Tamano de descarga del repo | 2,71 GB | 1,32 GB |

No se han publicado resultados de benchmarks estandarizados (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: memoria pico medida de 3,5 GB en la configuración de 8 bits (4,1 GB en fp32), sobre un Mac con 26 GB.
- Hardware objetivo: Apple Silicon con MLX; las pruebas se hicieron en un Mac base M5. No hay datos para GPU NVIDIA ni para otros chips Apple.
- Cabe en equipos de consumo Apple Silicon; no se dispone de datos sobre modelos concretos de iPhone o iPad.
- Despliegue: mlx-audio (requiere una versión con Chatterbox multilingüe V3 y `--lang_code`; el autor construyó y probó con el fork `ipsupport-llc/mlx-audio`, commit 67f89de) y la app LLMTray para macOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 5,0-6,0 s totales por frase de 3,5-4 s en el hardware citado; S3Gen consume aproximadamente 1 s de cómputo por cada segundo de habla y es ahora la mitad más lenta del pipeline.
- Throughput: 38-51 tokens/s en T3 con la cuantización de 8 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este repo (Chatterbox Multilingual V3 MLX 8-bit) | 693.232.383 | 23 | no disponible | MIT | safetensors MLX | T3 a 8 bits, S3Gen fp32, voz integrada incluida |
| mlx-community/chatterbox-multilingual-v3 | no disponible | 23 | no disponible | MIT | MLX | Conversión fp32; sin voz integrada según el autor; 2,71 GB |
| ResembleAI/chatterbox (Multilingual V3) | ~0,5B en el backbone T3 | 23 | no disponible | MIT | pesos originales | Modelo base de Resemble AI, con watermarking |
| mlx-community/S3TokenizerV2 | no disponible | no disponible | no disponible | Apache-2.0 | MLX | Tokenizador de habla, dependencia separada (0,49 GB) |

## Limitaciones y advertencias

- Es una conversión cuantizada de un modelo de terceros, distribuida "tal cual", sin garantía; el autor declina responsabilidad sobre salidas o daños derivados del uso.
- La cuantización de T3 a 8 bits no fue evaluada formalmente por oído contra fp32 en la información disponible; solo se verificó equivalencia numérica inferior a 1e-4 por muestra.
- Riesgo de alucinación en el audio: el modelo base v3 reduce la tasa de alucinación respecto a v2, pero no se aportan cifras concretas.
- El ruso requiere texto con marcas de acento para una lectura correcta; sin ellas la pronunciación puede degradarse.
- La clonación de voz exige usar únicamente la propia voz o una sobre la que se tenga permiso explícito; es un requisito legal y ético relevante en producción.
- El audio generado incorpora marcas de agua del modelo base, lo que condiciona su uso en según qué contextos.
- Dependencia de una versión concreta de mlx-audio con soporte de Chatterbox multilingüe V3; el autor probó con un fork, no con la versión estable de PyPI.
- Solo Apple Silicon: no hay soporte documentado para CUDA ni CPU genérica.
- Las mediciones de rendimiento se tomaron con el equipo bajo presión de memoria, con variaciones de hasta 2x; deben tratarse como orientativas.
- No hay datos publicados sobre sesgos lingüísticos por idioma ni sobre calidad relativa entre los 23 idiomas soportados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/roman220220/chatterbox-multilingual-v3-mlx-8bit
- Modelo base: https://huggingface.co/ResembleAI/chatterbox
- Conversión MLX de referencia: https://huggingface.co/mlx-community/chatterbox-multilingual-v3
- Condicionales de voz: https://huggingface.co/mlx-community/chatterbox-fp16
- Tokenizador de habla: https://huggingface.co/mlx-community/S3TokenizerV2
- Anuncio de Chatterbox Multilingual v3: https://www.resemble.ai/resources/chatterbox-multilingual-v3-tts-with-embedded-watermarking-for-25-languages
- Repositorio comunitario: https://github.com/FCare/chatterbox-multilingual
- Fork de mlx-audio usado en las pruebas: https://github.com/ipsupport-llc/mlx-audio
- Script y mediciones de cuantización: https://github.com/ipsupport-llc/quant-ternary
- LLMTray: https://www.ipsupport.us/llmtray/
- ruaccent: https://github.com/Den4ikAI/ruaccent
