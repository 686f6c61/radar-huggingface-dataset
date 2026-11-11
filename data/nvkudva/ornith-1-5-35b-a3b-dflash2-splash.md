# nvkudva/Ornith-1.5-35B-A3B-DFlash2-Splash

## Resumen

Ornith-1.5-35B-A3B-DFlash2-Splash es un modelo borrador (*draft model*) de decodificación especulativa, no un modelo de lenguaje autónomo. Lo publica el usuario `nvkudva` como derivado de `jzinno/Ornith-1.5-35B-A3B-DFlash2`, que a su vez adapta el borrador DFlash de `z-lab/Qwen3.5-35B-A3B-DFlash` al modelo objetivo `ornith-ai/Ornith-1.5-35B-A3B`. Su función es proponer tokens que el modelo objetivo verifica después, acelerando la inferencia sin alterar la salida final.

El cambio respecto al original es mínimo y puramente operativo: el `sliding_window` de `config.json` pasa de 4096 a 2048 tokens para que el runtime Splash (v1.6.1) acepte la carga. El archivo de pesos es idéntico byte a byte al original (sha256 `a42e77e19c74a31e990aac9b62e9ac82a01268a202ade1751baefc6574b082aa`). Esta copia existe porque Splash rechaza el checkpoint original con el error `draft config sliding_window mismatch: checkpoint 4096, runtime 2048`.

El checkpoint pesa 526.251.520 parámetros en safetensors (1,1 GB de repositorio) y emplea una arquitectura de difusión por bloques (*block diffusion*) con seis capas de borrador. Es relevante para quienes despliegan Ornith 1.5 35B-A3B en Apple Silicon mediante Splash, ya que permite activar la decodificación especulativa sin modificar el runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash2: difusión por bloques con seis capas de borrador, convoluciones causales agrupadas y selector de ruta |
| Parámetros totales | 526.251.520 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 tokens (en esta copia); bloque de entrenamiento de 16 tokens |
| Tipos de cuantización | no disponible (el checkpoint publicado está en BF16; el modelo objetivo se usa en 4-bit MLX en las pruebas) |
| Idiomas soportados | no disponible (el modelo objetivo es `--language-only` en el ejemplo de Splash) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa basado en DFlash2. La red parte del borrador DFlash plano de `z-lab/Qwen3.5-35B-A3B-DFlash`, cuyos parámetros compatibles inicializan la red compartida antes de la adaptación al objetivo Ornith. Las convoluciones causales agrupadas y el selector de ruta propios de DFlash2 arrancan como no-ops exactos: cada convolución tiene un auto-tap unitario con corrección predecesora y dinámica nula, y el libro de códigos sucesor del selector es cero, de modo que sus puntuaciones se reducen a los logits DFlash heredados. Así, la red actualizada es numéricamente equivalente al arranque en caliente DFlash antes de la optimización.

El entrenamiento se realizó sobre características de profesor proyectadas extraídas de 100.014.884 tokens de finalización generados (108.729 conversaciones), publicados aparte como `jzinno/Ornith-1.5-35B-A3B-Nemotron-v2-100M`. La captura de características usó ocho GPU NVIDIA H200 de 141 GB en particiones contiguas independientes, cargando el profesor BF16 de Ornith y seleccionando las capas ocultas 1, 6, 11, 16, 22, 27, 32 y 37. La proyección de anchura 2048 heredada de `z-lab/Qwen3.5-35B-A3B-DFlash` se aplicó congelada. El entrenamiento del borrador se ejecutó en una sola H200 de 141 GB, cargando solo el embedding congelado y la cabeza de lenguaje de Ornith junto con la red de borrador inicializada en caliente.

La receta final empleó seis capas de borrador, bloque de entrenamiento de 16 tokens y ventana deslizante de 4096 tokens (en el original), 128 anclas, rango de selector 256 y top-k 16, microtamaño de lote 1 con lote efectivo 32, AdamW con tasa de aprendizaje 1e-4 y schedule de warmup más coseno, durante 3228 pasos de optimizador.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa: no genera texto de forma autónoma, sino candidatos que el modelo objetivo verifica.
- Aceleración de inferencia en el runtime Splash sobre Apple Silicon, con ventana deslizante fija de 2048 tokens.
- Compatibilidad con el modelo objetivo `ornith-ai/Ornith-1.5-35B-A3B` y su variante NVFP4.
- Propuesta de hasta 10 tokens por ciclo en las evaluaciones de servicio.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso por sí mismo; esas capacidades residen en el modelo objetivo.
- Idiomas: no disponible, dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: con Splash 1.6.1 y el objetivo Ornith 1.5 35B-A3B en 4-bit MLX, este borrador eleva la entrega a 300 tok/s en prompts de código y 148,1 tok/s en chat sobre un M3 Max de 64 GB.
- Despliegue en portátiles con memoria unificada: al ser un borrador de 526 M de parámetros (1,1 GB), cabe holgadamente junto al objetivo cuantizado en equipos de 64 GB, sin GPU dedicada.
- Servicio de chat interactivo: con 2,2 tokens aceptados por ciclo en prompts conversacionales, reduce la latencia percibida en asistentes de texto de uso general.
- Generación de código asistida: los 5,3 tokens aceptados por ciclo en prompts de código lo hacen adecuado para autocompletado y generación de fragmentos en IDE.
- Evaluación de decodificación especulativa: sirve como referencia para comparar el borrador adaptado frente al NEXTN integrado de Ornith y al DFlash sin adaptar.
- Integración en pipelines Splash existentes: al cargar sin el error de desajuste de ventana, permite activar la decodificación especulativa en instalaciones que ya usan Splash v1.6.1 sin parchear el runtime.

## Benchmarks y rendimiento

La model card incluye una evaluación de servicio con 40 prompts reservados (10 de chat, 10 de código, 10 de matemáticas y 10 de STEM), concurrencia 1, 4 y 8, muestreo greedy y hasta 512 tokens de salida. El objetivo es el checkpoint oficial Ornith NVFP4, con caché KV FP8 E4M3, MoE con Marlin y atención con FlashInfer. Se comparan decodificación autorregresiva, la cabeza NEXTN integrada de Ornith, el DFlash de Qwen3.5 sin adaptar y este borrador DFlash2 adaptado a Ornith. La tabla de la matriz en DGX Spark (GB10) aparece truncada en la información disponible.

Resultados medidos en Apple M3 Max (64 GB) con Splash 1.6.1, objetivo Ornith 1.5 35B-A3B 4-bit MLX, contexto de 256K, flags por defecto, temperatura 0, thinking desactivado, 128 tokens de salida, media de 3 ejecuciones tras calentamiento:

| Prompt | Entrega (tok/s) | Tokens por ciclo |
|---|---:|---:|
| Código | 300,0 | 5,3 |
| Chat | 148,1 | 2,2 |

El autor advierte que son cifras de una sola máquina y un solo conjunto de ejecuciones, y que la limitación térmica del portátil puede reducirlas a la mitad o más.

## Requisitos de hardware

- VRAM estimada: 1,1 GB para el borrador en BF16; debe sumarse la memoria del modelo objetivo (35B-A3B cuantizado).
- GPU de entrenamiento: una NVIDIA H200 de 141 GB para el borrador; ocho H200 para la captura de características del profesor.
- Cabe en GPU de consumo: sí, por tamaño; el caso documentado es Apple M3 Max de 64 GB con memoria unificada.
- Despliegue: runtime Splash v1.6.1 (Apple Silicon) mediante `splash serve` o la app de escritorio; la librería declarada es sglang.
- Latencia y throughput: 300 tok/s en código y 148,1 tok/s en chat sobre M3 Max; TTFT y TPOT de la matriz DGX Spark no disponibles por truncamiento de la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-DFlash2-Splash (este) | 526 M | ventana 2048 | Borrador DFlash2 adaptado a Ornith para Splash | Apache-2.0 | Hugging Face |
| jzinno/Ornith-1.5-35B-A3B-DFlash2 | no disponible | ventana 4096 | Borrador DFlash2 original, rechazado por Splash 1.6.1 | Apache-2.0 | Hugging Face |
| z-lab/Qwen3.5-35B-A3B-DFlash | no disponible | no disponible | Borrador DFlash plano sin adaptar a Ornith | no disponible | Hugging Face |
| NEXTN integrado en Ornith | no disponible | no disponible | Cabeza especulativa heredada de Qwen3.5, no entrenada en el preentrenamiento continuado de Ornith | no disponible | Incluida en el objetivo |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere un checkpoint objetivo Ornith compatible en tiempo de inferencia.
- El desajuste de ventana deslizante (2048 frente a 4096) puede reducir la tasa de aceptación, aunque no altera la salida porque el objetivo verifica cada token.
- Las cifras de rendimiento provienen de una sola máquina y pueden degradarse por limitación térmica.
- La cabeza NEXTN de Ornith no se entrenó durante el preentrenamiento continuado, por lo que no es una línea base especulativa fuerte.
- Sesgos, alucinaciones y limitaciones idiomáticas dependen del modelo objetivo; no hay datos específicos del borrador.
- Licencia Apache-2.0 permite uso comercial, pero el crédito de entrenamiento y evaluación corresponde al autor original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una copia operativa de reciente creación (11 de noviembre de 2026).

## Enlaces

- Hugging Face: https://huggingface.co/nvkudva/Ornith-1.5-35B-A3B-DFlash2-Splash
- Modelo base directo: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Modelo objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Borrador DFlash de origen: https://huggingface.co/z-lab/Qwen3.5-35B-A3B-DFlash
- Dataset de generación: https://huggingface.co/datasets/jzinno/Ornith-1.5-35B-A3B-Nemotron-v2-100M
- Runtime Splash: https://inco.ai
- Paper referenciado: arXiv:2602.06036
