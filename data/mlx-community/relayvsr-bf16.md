# mlx-community/RelayVSR-bf16

## Resumen

RelayVSR es un modelo de superresolución de vídeo (VSR) en streaming con factor de escala ×4, desarrollado originalmente por el autor kopper y distribuido en formato MLX por mlx-community para su ejecución en Apple Silicon. Resuelve el problema de aumentar la resolución de secuencias de vídeo completas manteniendo la fidelidad al contenido original, sin reparar artefactos de compresión ni inventar detalle de alta frecuencia. Su diseño combina dos redes de naturaleza muy distinta: un generador generativo grande basado en el DiT de Wan2.2-TI2V-5B (5.031 millones de parámetros) que solo se ejecuta sobre una de cada quince fotogramas para proponer latentes de referencia, y una red transformer ligera de 31,9 millones de parámetros que superresuelve todos los fotogramas apoyándose en esos latentes de referencia.

La relevancia de esta conversión radica en que traslada un pipeline de VSR de dos etapas a MLX, permitiendo inferencia local en hardware Apple con paridad numérica verificada frente a la implementación upstream en fp32. El modelo no usa VAE ni codificador de texto en tiempo de ejecución: el prompt es un embedding fijo empaquetado en un fichero aparte. El repositorio ocupa 10,2 GB y la licencia es Apache-2.0 tanto para el modelo como para el modelo base Wan2.2-TI2V-5B.

La ficha describe la conversión MLX publicada el 14 de noviembre de 2026; no se han publicado resultados de benchmarks de calidad perceptual en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: generador DiT (Wan2.2-TI2V-5B destilado a un paso) + red transformer ligera de superresolución |
| Parametros totales | 5.031.059.136 (generador) + 31.934.208 (red VSR) ≈ 5,06 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana temporal de hasta 15 fotogramas de latencia (no disponible el tamaño exacto de ventana en tokens) |
| Tipos de cuantizacion | bf16 (generador y prompt), fp32 (decoder); el port ejecuta el generador en bf16 y la red pequeña en fp16 por defecto, con lane fp32 de paridad |
| Idiomas soportados | No disponible (modelo de vídeo, sin interfaz de texto en tiempo de ejecución) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`generator_bf16.safetensors`, `decoder_fp32.safetensors`, `prompt_bf16.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El pipeline sigue un esquema de colaboración grande-pequeño. El generador es el DiT de Wan2.2-TI2V-5B con LoRA fusionada y destilado a un único paso de muestreo (t = 1000); se invoca sobre uno de cada quince fotogramas y produce un latente de referencia. La red ligera, un transformer de 31,9 millones de parámetros (variante S, checkpoint EMA del paso 60000, fichero upstream `flash.safetensors`), superresuelve cada fotograma a partir del fotograma de baja resolución y de los dos latentes de referencia que lo rodean. No hay VAE ni codificador de texto en inferencia: el prompt es un embedding fijo de forma (1, 512, 4096) extraído del `wan.safetensors` upstream.

La conversión a MLX se generó con `oracle/convert_weights.py` desde `kopper/RelayVSR @ 751954dc`, conservando las claves upstream y cambiando únicamente el layout de las convoluciones a channels-last, además de aplanar los pesos de normalización de `lq_proj` de (C, 1, 1) a (C). La paridad se verificó contra el código upstream ejecutado en CPU en fp32 sobre un clip de 9 fotogramas: contrato de 833 + 200 tensores sin claves faltantes ni sobrantes, cada componente dentro de 3e-5 (máximo absoluto relativo a la referencia) y el flujo completo a al menos 120 dB por fotograma en CPU y GPU. En media precisión la desviación respecto a la lane fp32 es de 49–53 dB sobre metraje real. No se ha validado contra una ejecución CUDA de los kernels Triton de atención de upstream; el port usa atención densa bajo las mismas máscaras. Los datos de entrenamiento no están divulgados por los autores.

## Capacidades

- Superresolución de vídeo ×4 en streaming, fotograma a fotograma, conservando todos los fotogramas de entrada.
- Colaboración grande-pequeño: el generador DiT de 5B solo procesa uno de cada quince fotogramas; la red de 32M procesa el resto.
- Fidelidad al contenido: mantiene el desenfoque suave y el trazo de dibujo, apto tanto para anime y gráficos como para imagen real.
- Funcionamiento sin VAE ni codificador de texto en tiempo de ejecución (prompt fijo empaquetado).
- Salida en rango [−1, 1] con forma (4H, 4W, 3) por fotograma, entregada en orden.
- Ejecución en Apple Silicon mediante MLX, con lane bf16/fp16 por defecto y lane fp32 de paridad.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo video-to-video.

## Casos de uso

- Restauración de archivo audiovisual: escalar material rodado en resoluciones antiguas a ×4 conservando el grano suave y sin inventar detalle, adecuado para fondos de catálogo donde se prioriza la fidelidad sobre el aspecto "nítido".
- Upstreaming de animación y contenido gráfico: al mantener el trazo de dibujo y el desenfoque, resulta apropiado para series de animación o motion graphics que se reescalan para distribución en 4K.
- Previsualización en local sobre Mac: con 0,075 s por fotograma de salida a 1280×768 en un M5 Max, permite revisar el resultado de un clip antes de lanzar un proceso mayor.
- Integración en pipelines Swift/MLX: mediante `MLXRelayVSR` o `RelayVSRPipeline.load(directory:)` se puede incrustar en herramientas de edición nativas de macOS que ya usen MLXEngine.
- Procesado por lotes de clips cortos: el coste de 0,245 s por fotograma a 1920×1080 y un pico de proceso de 14,3 GB (16,8 GB a través del motor) hacen viable el procesado desatendido de secuencias breves en equipos con memoria unificada amplia.
- Prototipado de investigación en VSR: la paridad verificada a 120 dB y la separación en ficheros de pesos facilitan reproducir resultados y comparar variantes sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS) en la información disponible. Los únicos datos numéricos publicados son de paridad y de rendimiento de ejecución:

| Metrica | Valor |
|---|---|
| Paridad por componente vs upstream fp32 | ≤ 3e-5 (max abs / referencia) |
| Paridad del flujo completo por fotograma | ≥ 120 dB (CPU y GPU) |
| Desviación bf16/fp16 vs lane fp32 en metraje real | 49–53 dB |
| Latencia a 1280×768 (M5 Max) | 0,075 s por fotograma de salida |
| Latencia a 1920×1080 (M5 Max) | 0,245 s por fotograma de salida |
| Pico de memoria del proceso | 14,3 GB (16,8 GB a través del motor) |

## Requisitos de hardware

- VRAM/memoria unificada: pico de proceso medido de 14,3 GB y 16,8 GB a través del motor MLXEngine; el repositorio pesa 10,2 GB en disco.
- GPU recomendadas: hardware Apple Silicon; las medidas publicadas corresponden a un M5 Max con GPU compartida con otras aplicaciones.
- GPU consumer: no se dispone de datos de ejecución en GPU NVIDIA o AMD; el formato es específico de MLX, por lo que no cabe esperar ejecución directa en CUDA sin reconversión.
- Opciones de despliegue: MLX con el paquete Swift `xocialize/mlx-relayvsr-swift`, el binario `relayvsr-smoke` y el paquete `MLXRelayVSR` a través de MLXEngine. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,075 s/fotograma a 1280×768 y 0,245 s/fotograma a 1920×1080 en M5 Max; no se publica throughput agregado ni latencia en otros equipos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de VSR en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto/ventana | Licencia | Formato |
|---|---|---|---|---|
| RelayVSR (esta ficha, MLX) | ≈5,06 mil millones (5B + 32M) | ventana temporal de 15 fotogramas de latencia | Apache-2.0 | safetensors MLX |
| Wan2.2-TI2V-5B | 5B (generador base) | no disponible | Apache-2.0 | no disponible |
| Alternativas VSR | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es "suave": elimina el grano de película y añade poco detalle de alta frecuencia; no repara daños de códec.
- Solo admite factor ×4; no hay variantes ×2 ni ×8 en esta conversión.
- La salida va retrasada hasta 15 fotogramas respecto a la entrada, lo que impide su uso en aplicaciones de baja latencia estricta.
- No se ha validado contra una ejecución CUDA de los kernels Triton de atención de upstream; el port usa atención densa bajo las mismas máscaras, lo que puede diferir en rendimiento.
- Los datos de entrenamiento no están divulgados, por lo que no se pueden evaluar sesgos de dominio ni procedencia del material.
- No hay información sobre sesgos, alucinación (en el sentido de detalle inventado) más allá de la nota de que añade poco detalle de alta frecuencia, ni sobre idiomas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Wan2.2-TI2V-5B y del repositorio original `kopper/RelayVSR`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/RelayVSR-bf16
- Modelo base: https://huggingface.co/kopper/RelayVSR
- Repositorio GitHub upstream: https://github.com/kopperx/RelayVSR
- Paper: https://arxiv.org/abs/2609.37850
- Port Swift/MLX: https://github.com/xocialize/mlx-relayvsr-swift
- Motor MLXEngine: https://github.com/xocialize/mlx-engine-swift
- Licencia: https://huggingface.co/kopper/RelayVSR/blob/main/LICENSE
