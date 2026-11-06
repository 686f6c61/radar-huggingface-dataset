# lightx2v/RelayVSR_X2

## Resumen

RelayVSR_X2 es un modelo de superresolución de vídeo (VSR) desarrollado por el equipo de lightx2v que realiza un escalado nativo y fijo de 2× sobre la anchura y la altura de un vídeo de entrada. Se trata de una adaptación del modelo original RelayVSR (kopper/RelayVSR), que operaba a un factor fijo de 4×, modificado arquitectónicamente y reentrenado para reducir el coste computacional de la inferencia manteniendo la principal virtud del diseño original: la supresión del parpadeo temporal (flicker) en los vídeos escalados.

El modelo resulta especialmente relevante como posprocesamiento de vídeo generado por IA. Los generadores de vídeo como MiniMax-H3 pueden producir ligeras inconsistencias temporales entre fotogramas que los algoritmos de superresolución convencionales tienden a amplificar; RelayVSR_X2 está diseñado para atenuarlas. El repositorio ocupa 11,4 GB y distribuye dos checkpoints en formato safetensors (`wan_x2.safetensors` y `flash_x2.safetensors`) que deben usarse conjuntamente.

La inferencia se soporta a través del framework LightX2V (ModelTC), que incluye scripts y configuración específicos para este modelo. No se dispone de información pública sobre la licencia, los idiomas ni la arquitectura interna detallada más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de superresolución de vídeo basado en RelayVSR; checkpoints Wan y Flash) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa vídeo por fotogramas; sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`wan_x2.safetensors`, `flash_x2.safetensors`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Se sabe que RelayVSR_X2 deriva del RelayVSR original, cuyo diseño el autor describe como eficaz para suprimir el parpadeo temporal en vídeos escalados. Para obtener la variante 2×, el equipo de lightx2v modificó la arquitectura del modelo original (de escala fija 4×) y continuó el entrenamiento hasta obtener un modelo de escala fija 2×. No se especifican el número de tokens o fotogramas de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (poco habituales en tareas de restauración de vídeo).

El modelo se distribuye en dos checkpoints complementarios, `wan_x2.safetensors` y `flash_x2.safetensors`, que deben descargarse en el mismo directorio y utilizarse juntos según las instrucciones del autor. La inferencia se ejecuta mediante LightX2V, que ofrece scripts dedicados (`run_relayvsr_x2_sr.sh`), un fichero de configuración (`configs/relayvsr/relayvsr_x2.json`) y soporte para offloading por bloques y ejecución multi-GPU.

## Capacidades

- Superresolución de vídeo nativa y fija a 2×: duplica anchura y altura de la entrada (por ejemplo, 1024 × 768 → 2048 × 1536; 768 × 1344 → 1536 × 2688).
- Supresión del parpadeo temporal: reduce la inconsistencia entre fotogramas que otros métodos de VSR amplifican, especialmente en vídeo generado por IA.
- Restauración y mejora de vídeo: orientado a posprocesamiento de vídeo generado por modelos como MiniMax-H3.
- Procesamiento por lotes de fotogramas: el benchmark reportado procesa 243 fotogramas en una sola ejecución.
- No se documentan capacidades de generación de texto, razonamiento, código, tool calling, agentes, visión semántica ni audio.

## Casos de uso

- Posprocesamiento de vídeo generado por IA: aplicar RelayVSR_X2 tras un generador como MiniMax-H3 para pasar de 768 × 1344 a 1536 × 2688, aprovechando su capacidad de atenuar el flicker que el generador deja en el vídeo fuente.
- Restauración de metraje de archivo: escalar material antiguo o de baja resolución a 2× con consistencia temporal, evitando el parpadeo que introducirían métodos de superresolución por fotograma independiente.
- Mejora de vídeo para plataformas de streaming: subir la resolución de contenido 720p o 1080p a 1440p o 2160p respectivamente antes de la codificación final, con un coste de inferencia bajo gracias a los 45,44 FPS medidos en H100.
- Pipelines de producción de vídeo generativo: integrar el modelo como etapa final de un pipeline (generación → superresolución → codificación) usando los scripts de LightX2V y su configuración predefinida para la variante X2.
- Previsualización y dailies en postproducción: escalar rápidamente clips de trabajo a 2× para revisión, dado que el modelo procesa 243 fotogramas en 5,348 segundos en una H100.
- Investigación en restauración de vídeo: emplear el modelo como referencia o baseline en experimentos de VSR centrados en consistencia temporal, comparándolo con SeedVR2-3B, FlashVSR+ Turbo o SwiftVR.
- Mejora de vídeo de vigilancia o dron: escalar metraje de cámaras de baja resolución preservando la coherencia temporal entre fotogramas consecutivos.

## Benchmarks y rendimiento

El autor publica un benchmark de velocidad de inferencia sobre un clip de 1024 × 768, 243 fotogramas, 24 fps y 10,125 segundos de duración, generado con MiniMax-H3 y con ligero flicker temporal. Todas las ejecuciones se realizaron secuencialmente en una NVIDIA H100 80GB HBM3 con PyTorch 2.11.0 y CUDA 13.0, tras un calentamiento a la misma resolución, midiendo una única ejecución por fila.

| Modelo / implementación | Escala | Resolución de salida | Tiempo (s) | FPS de inferencia |
|---|---|---:|---:|---:|
| SeedVR2-3B | 2× | 2048 × 1536 | 352,820 | 0,69 |
| FlashVSR+ Turbo | 2× | 2048 × 1536 | 54,024 | 4,50 |
| Open-H3-Regenerate-2K | 2× | 2048 × 1536 | 784,954 | 0,31 |
| SwiftVR | 2× | 2048 × 1536 | 7,252 | 33,51 |
| SwiftVR (LightX2V) | 2× | 2048 × 1536 | 6,399 | 37,98 |
| RelayVSR | 4× | 4096 × 3072 | 26,332 | 9,23 |
| RelayVSR (LightX2V) | 4× | 4096 × 3072 | 19,304 | 12,59 |
| **RelayVSR X2 (LightX2V)** | 2× | 2048 × 1536 | **5,348** | **45,44** |

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS u otras métricas de restauración) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 11,4 GB en pesos safetensors, por lo que se requiere al menos esa cantidad de memoria para cargar ambos checkpoints, más el espacio de activaciones para procesar lotes de fotogramas.
- GPU de referencia del benchmark: NVIDIA H100 80GB HBM3, con la que se alcanzan 45,44 FPS de inferencia sobre 243 fotogramas a 1024 × 768.
- GPU consumer: no se documenta si el modelo cabe en GPUs de consumo (RTX 4090, 3090, etc.); dado el tamaño de los pesos y la ausencia de datos de cuantización, no puede confirmarse.
- Despliegue: LightX2V, con imagen Docker oficial (`lightx2v/lightx2v:26062001-cu130`) y scripts en `scripts/relayvsr/`. Se menciona soporte para offloading por bloques y ejecución multi-GPU en la guía de uso.
- Latencia y throughput: 5,348 s para 243 fotogramas (10,125 s de vídeo) en H100, equivalente a 45,44 FPS de inferencia; no se han publicado mediciones en otros aceleradores.

## Comparativa con modelos similares

| Modelo | Escala | Enfoque | Tiempo en H100 (243 frames) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| RelayVSR_X2 | 2× fija | Supresión de flicker temporal, VSR rápido | 5,348 s | no disponible | Hugging Face (lightx2v) |
| RelayVSR (original) | 4× fija | Supresión de flicker temporal | 19,304 s (con LightX2V) | no disponible | Hugging Face (kopper) |
| SwiftVR | 2× | VSR rápido | 6,399 s (con LightX2V) | no disponible | Hugging Face (H-oliday) |
| FlashVSR+ Turbo | 2× | VSR acelerado | 54,024 s | no disponible | Hugging Face (ruchangyao) |
| SeedVR2-3B | 2× | VSR basado en difusión (3B parámetros) | 352,820 s | no disponible | Hugging Face (ByteDance-Seed) |

RelayVSR_X2 es el más rápido de la comparativa en el benchmark publicado, con una ventaja de aproximadamente un 16 % sobre SwiftVR con LightX2V y de más de un orden de magnitud sobre SeedVR2-3B. No hay datos de calidad comparada (métricas de restauración) que permitan evaluar el equilibrio velocidad/calidad frente a estos modelos.

## Limitaciones y advertencias

- Escala fija de 2×: no admite otros factores de escalado; para 4× debe usarse el RelayVSR original.
- Sin datos de licencia: no se especifica la licencia, por lo que el uso comercial no puede confirmarse y requiere contactar con el autor.
- Sin métricas de calidad publicadas: el benchmark solo mide velocidad; no hay PSNR, SSIM ni evaluaciones perceptuales que respalden la calidad de restauración frente a alternativas.
- Dependencia de LightX2V: la inferencia documentada requiere este framework, sus scripts y su configuración; no se describe un uso directo con otras herramientas (Diffusers, ComfyUI, etc.).
- Dos checkpoints obligatorios: deben usarse conjuntamente `wan_x2.safetensors` y `flash_x2.safetensors`; usar solo uno puede producir resultados incorrectos.
- Sin información sobre sesgos, idiomas o alucinación: al ser un modelo de vídeo, estos riesgos no aplican del mismo modo, pero tampoco se documenta el comportamiento en dominios alejados de los datos de entrenamiento (contenido sintético, animación, etc.).
- Rendimiento medido en un único hardware y clip: las cifras de FPS pueden no extrapolarse a otras GPUs, resoluciones o duraciones de vídeo.
- Repositorio con 0 descargas y 7 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightx2v/RelayVSR_X2
- Modelo original RelayVSR: https://huggingface.co/kopper/RelayVSR
- Repositorio LightX2V: https://github.com/ModelTC/LightX2V
- Documentación de RelayVSR en LightX2V: https://github.com/ModelTC/LightX2V/tree/main/scripts/relayvsr
- Script de inferencia X2: https://github.com/ModelTC/LightX2V/blob/main/scripts/relayvsr/run_relayvsr_x2_sr.sh
- Documentación de SwiftVR en LightX2V: https://github.com/ModelTC/LightX2V/tree/main/scripts/swiftvr
- SeedVR2-3B: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- FlashVSR+: https://huggingface.co/ruchangyao/FlashVSR_plus
- Open-H3-Regenerate-2K: https://huggingface.co/Efficient-Large-Model/Open-H3-Regenerate-2K
- SwiftVR: https://huggingface.co/H-oliday/SwiftVR
