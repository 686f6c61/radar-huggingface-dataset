# mlx-community/FlashVSR-v1.1-bf16

## Resumen

FlashVSR-v1.1-bf16 es la conversión al framework MLX del modelo FlashVSR v1.1 (Junhao Zhuang y colaboradores, OpenImagingLab), un sistema de superresolución de vídeo (VSR) basado en difusión, de un solo paso y en modo streaming, que escala el vídeo ×4 o ×2. El modelo original se publicó sobre PyTorch/CUDA; esta variante la mantiene mlx-community para ejecutarse en Apple Silicon, y es la "lane" de producción con pesos en bf16 (3,5 GB), frente a la lane fp32 de paridad (7,0 GB).

El núcleo es un DiT de 1.418.996.800 parámetros con la forma de Wan2.1-1.3B, destilado con DMD a un único paso de difusión (t = 1000), acompañado de un proyector de condicionamiento de baja calidad causal, `Causal_LQ4x_Proj` (287.845.888 parámetros), y un decodificador ligero TCDecoder derivado de TAEHV (45.338.371 parámetros). El total ronda los 1.752 millones de parámetros y no necesita el VAE de Wan ni el codificador de texto umT5: la condición de texto es un tensor fijo.

Su relevancia es práctica: permite superresolución generativa de vídeo en tiempo de streaming sobre un Mac, sin GPU NVIDIA, con memoria independiente de la duración del clip y con paridad numérica verificada frente a la implementación upstream (error relativo aislado ≤ 1e-5 por componente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT tipo Wan2.1-1.3B destilado con DMD a un paso (t = 1000) + proyector de condicionamiento `Causal_LQ4x_Proj` + decodificador TCDecoder (derivado de TAEHV) |
| Parametros totales | 1.752.181.059 (DiT 1.418.996.800 + proyector LQ 287.845.888 + TCDecoder 45.338.371) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no aplica (modelo de vídeo); en modo streaming la memoria es independiente de la longitud del clip |
| Tipos de cuantizacion | bf16 (esta variante) y fp32 (variante de paridad); no se documentan cuantizaciones de 8 o 4 bits |
| Idiomas soportados | no disponible; no hay codificador de texto en tiempo de ejecución y se condiciona sobre un prompt fijo de forma (1, 512, 4096) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`dit_bf16.safetensors`, `lq_proj_bf16.safetensors`, `tcdecoder_bf16.safetensors`, `prompt_bf16.safetensors`) |
| Tamano del repositorio | 3,5 GB (lane fp32: 7,0 GB) |
| Framework | MLX (Apple Silicon); libreria declarada `mlx` |
| Pipeline | video-to-video |
| Factor de escala | ×4 y ×2 |
| Restriccion de resolucion | las dimensiones de trabajo son multiplos de 128 |
| Procedencia de pesos | `JunhaoZhuang/FlashVSR-v1.1` en el commit `27561b18`, convertido con `oracle/convert_weights.py --lane bf16` |

## Arquitectura y entrenamiento

El pipeline consta de tres redes. El DiT procesa parches mediante `patch_embedding` con convolución 3D de layout (O,D,H,W,I); el proyector LQ causal inyecta la información de baja resolución con convoluciones 3D y gammas RMS por canal; y el TCDecoder, un decodificador diminuto condicionado por la LQ y de anchura TAEHV, reconstruye el fotograma en 2D con convoluciones (O,H,W,I). La atención es dispersa por bloques con restricción de localidad (LCSA): selecciona bloques de 128×128 mediante un top-k estricto. Upstream usa el kernel CUDA `Block-Sparse-Attention` de mit-han-lab; este port lo reimplementa como kernel Metal que calcula únicamente los bloques seleccionados, que es precisamente la ruta que la model card original pide no eliminar en ports de terceros. Las claves de los tensores son idénticas a las de upstream; solo cambia el layout de las convoluciones (channels-last). Se verificaron los 899 parámetros de la lane bf16 como bit-idénticos al casteo de fp32 a bf16 en carga.

El entrenamiento del modelo original consistió en una destilación DMD que reduce la generación a un solo paso de difusión, sobre el conjunto VSR-120K (descrito por los autores, pero no liberado). No hay RLHF ni DPO, ya que no es un modelo de lenguaje. La paridad del port se validó contra el código de upstream ejecutado literalmente en CPU y fp32, con dos golden outputs (la dispersión por defecto de upstream y una configuración fuertemente dispersa con bloques de consulta vacíos), sobre 512×384 y 33 fotogramas: error relativo aislado ≤ 1e-5 en cada componente, y error extremo a extremo de 100–113 dB en el port. Como la selección top-k es dura, una perturbación de 1e-6 en la entrada cambia bloques casi empatados; upstream mismo baja a 52,9 dB bajo ese empujón, y el port reproduce el mismo error máximo absoluto.

## Capacidades

- Superresolución de vídeo generativa ×4 y ×2, de un fotograma de entrada a un fotograma de salida, en modo streaming.
- Memoria constante respecto a la duración del clip: el consumo escala con los píxeles de salida por fotograma, no con el número de fotogramas.
- Reconstrucción de detalle fotográfico plausible en metraje de acción real, donde un escalador fiel produce desenfoque (en la comparativa publicada, 320×192 a 1280×768).
- Ejecución íntegra en Apple Silicon mediante MLX, sin VAE de Wan ni codificador de texto umT5 en tiempo de ejecución.
- Integración programática vía Swift: `FlashVSRUpscalePackage`, `FlashVSRPipeline`, `FlashVSRStream` y motor `MLXEngine`/`MLXServeCore`, con paquete `MLXFlashVSR`.
- Kernel Metal propio para atención dispersa por bloques, que calcula solo los bloques seleccionados.
- No dispone de tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni control por prompt: la condición de texto es un tensor fijo.

## Casos de uso

- Restauración y escalado de metraje de acción real en postproducción: se introduce el clip a baja resolución y se obtiene salida ×4 con detalle fotográfico sintetizado; es el escenario para el que el propio modelo se recomienda, al recuperar rostros limitados por resolución donde un escalador fiel devuelve una imagen borrosa.
- Mejora de material de archivo para documentales: permite llevar tomas históricas de baja resolución a 1280×768 o superior sin límite de duración del clip, porque el streaming desacopla la memoria de la longitud.
- Previsualización y conformado en un portátil Mac: con 9,2 GB de pico a 640×384 de salida, un equipo de 16 GB puede procesar proxies en local antes del render final.
- Normalización de material heterogéneo en un pipeline de ingesta: escalado ×2 como paso intermedio para igualar resoluciones de origen distinto antes del montaje, respetando múltiplos de 128.
- Procesado por lotes sin GPU NVIDIA: integración con `MLXFlashVSR` dentro de un motor MLX que descarga el repositorio en el almacén de modelos y expone peticiones `VideoUpscaleRequest` con escala 2 o 4.
- Investigación y reproducibilidad en VSR: la licencia Apache-2.0 y la paridad documentada frente a upstream permiten usarlo como referencia para comparar implementaciones de atención dispersa, medir el efecto del paso único de difusión o portar el modelo a otros backends.
- Vigilancia y vídeo técnico de baja resolución: mejora de legibilidad de escenas de acción real, asumiendo que el detalle recuperado es generado y no evidencia forense.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no son aplicables a un modelo de superresolución de vídeo. Los datos cuantitativos disponibles son de calidad de imagen con referencia completa y de paridad numérica.

Calidad ×4 (320×192 a 1280×768), comparada con la fuente nativa de 1280×768:

| Clip | SSIMULACRA2 upstream (PyTorch-MPS) | SSIMULACRA2 port MLX bf16 | PSNR upstream / port (dB) |
|---|---|---|---|
| Acción real | −17,0 | −16,3 | 27,49 / 27,59 |
| Panorámica de anime | −45,7 | −44,1 | 25,40 / 25,48 |

La lane bf16 se mantiene dentro de la dispersión entre semillas de fp32 en todas las métricas. El autor advierte que la fila de anime refleja textura inventada, con un gradiente de imagen el doble que el de la referencia.

Paridad frente a upstream (CPU, fp32, 512×384, 33 fotogramas, dos golden outputs):

| Prueba | Resultado |
|---|---|
| Error relativo aislado por componente (DiT, proyector LQ, decodificador) | ≤ 1e-5 |
| Error extremo a extremo del port | 100–113 dB |
| Suelo de sensibilidad de upstream ante una perturbación de 1e-6 en la entrada | 52,9 dB (el port reproduce el mismo error máximo absoluto) |

## Requisitos de hardware

- Exclusivo de Apple Silicon: esta variante usa MLX y no ofrece ruta CUDA.
- Memoria unificada medida como pico de proceso (`phys_footprint`, bf16, M5 Max): 9,2 GB con salida a 640×384; 19,1 GB con salida a 1280×768; 33,7 GB con salida a 1920×1152. La lane fp32 a 1280×768 consume 34,4 GB.
- GPU consumer: cabe en equipos Apple de memoria unificada amplia; 640×384 es viable en máquinas de 16 GB, 1280×768 requiere 24 GB o más, y 1920×1152 exige 48–64 GB. No hay soporte para RTX 4090, A100 ni H100 en esta variante.
- El consumo depende de los píxeles de salida por fotograma, no de la duración del vídeo, gracias al modo streaming.
- Opciones de despliegue: `mlx-flashvsr-swift` (`FlashVSRMLX`, `FlashVSRPipeline`, `FlashVSRStream`) y el motor `MLXEngine` de `MLXServeCore`/`MLXToolKit`. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El artículo upstream apunta a un objetivo de tiempo real, pero no se ofrecen cifras concretas de latencia ni de fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Framework y hardware | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FlashVSR v1.1 upstream (JunhaoZhuang) | 1,75 mil millones (misma arquitectura) | PyTorch, CUDA y MPS | safetensors | Apache-2.0 | Referencia de calidad; SSIMULACRA2 −17,0 en acción real y −45,7 en anime |
| FlashVSR-v1.1-bf16 (este port) | 1,75 mil millones | MLX, Apple Silicon | safetensors bf16 (3,5 GB) | Apache-2.0 | Paridad ≤ 1e-5 por componente; dentro de la dispersión fp32 |
| FlashVSR-v1.1-fp32 (lane de paridad) | 1,75 mil millones | MLX, Apple Silicon | safetensors fp32 (7,0 GB) | Apache-2.0 | Mismos pesos de DiT y decodificador que upstream; proyector LQ y prompt reescalados desde bf16 |
| Real-ESRGAN (incluidos sus modelos de anime) | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card como alternativa fiel y no generativa, recomendada para contenido dibujado; no se aportan especificaciones en la información disponible |

No se dispone de datos de otros modelos de superresolución de vídeo comparables (parámetros, contexto o licencia) en la información proporcionada.

## Limitaciones y advertencias

- Modelo generativo: inventa detalle plausible a la resolución objetivo en lugar de reconstruirlo. En acción real es su ventaja, pero el detalle recuperado no es evidencia del contenido original.
- No recomendado para contenido dibujado: anime, dibujos animados, motion graphics, interfaces de usuario y rótulos de texto. Convierte color plano y line art limpio en textura fotográfica y empuja el dibujo hacia el realismo. Para esos casos el autor recomienda un escalador fiel como los modelos de anime de Real-ESRGAN.
- Comportamiento agresivo con el desenfoque: el bokeh y los fondos suaves pueden reaparecer como textura nítida inventada.
- Sensibilidad de la atención dispersa: el top-k duro hace que un cambio de 1e-6 en la entrada altere bloques casi empatados. Upstream tiene su propio suelo de sensibilidad (52,9 dB), por lo que las comparaciones numéricas entre implementaciones deben interpretarse con cautela y no como una métrica absoluta de fidelidad.
- Riesgo de alucinación específico de VSR: rostros, texto pequeño, matrículas y estructuras finas pueden recibir detalle inexistente. No debe usarse como fuente para análisis forense.
- El conjunto de entrenamiento VSR-120K está descrito por sus autores pero no se ha liberado, por lo que no es auditable y no se pueden evaluar sesgos de datos.
- Licencia Apache-2.0, que permite uso comercial. Los componentes derivados mantienen licencias permisivas: el DiT es arquitectura Wan2.1 (Apache-2.0) y el TCDecoder deriva de TAEHV (MIT). Este re-host adopta la licencia declarada de los pesos.
- Solo Apple Silicon en esta lane: no hay versiones GGUF, CUDA ni cuantizaciones de 8 o 4 bits documentadas.
- Sin codificador de texto: no se puede guiar ni corregir la generación mediante prompts.
- Restricción operativa: las dimensiones deben ser múltiplos de 128 y la escala está limitada a ×2 y ×4.
- Adopción muy baja en el momento de la consulta (21 descargas, 0 likes), lo que implica poca validación independiente por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlx-community/FlashVSR-v1.1-bf16
- Variante de paridad fp32: https://huggingface.co/mlx-community/FlashVSR-v1.1-fp32
- Modelo base: https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1
- Repositorio de código upstream: https://github.com/OpenImagingLab/FlashVSR
- Licencia del proyecto upstream: https://github.com/OpenImagingLab/FlashVSR/blob/main/LICENSE
- Artículo: https://arxiv.org/abs/2510.12747
- Port Swift/MLX: https://github.com/xocialize/mlx-flashvsr-swift
- Framework MLX: https://mlx-framework.org/
- Repositorio de MLX: https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- Entrada de MLX en Wikipedia: https://es.wikipedia.org/wiki/MLX_(machine_learning_framework)
- MLX Studio: https://mlx.studio/
