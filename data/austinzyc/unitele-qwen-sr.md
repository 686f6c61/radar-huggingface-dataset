# AustinZYC/UniTele-Qwen-SR

## Resumen

UniTele-Qwen-SR es un adaptador LoRA de superresolución para teleobjetivo de smartphone, publicado por AustinZYC y derivado del trabajo de investigación UniTele (arXiv:2610.39617). No es un modelo completo, sino un adaptador de 450,2 MiB que se aplica sobre el bloque DiT del modelo base Qwen-Image-Edit-2511 para restaurar imágenes tomadas con la cámara teleobjetivo de tres dispositivos concretos: Huawei, iPhone 17 Pro Max y vivo X300 Ultra. El repositorio contiene únicamente el adaptador, el script de inferencia y las dependencias; no incluye el backbone Qwen, los generadores de degradación ni las imágenes del benchmark.

El problema que aborda es la superresolución teleobjetivo condicionada por dispositivo: en lugar de entrenar un restaurador genérico, el adaptador aprende las degradaciones específicas de cada sensor y óptica, combinando capturas reales alineadas con pares sintéticos generados a partir de 500 imágenes digitales externas. La inferencia se realiza en un pipeline image-to-image con un canvas de 1024x768 o 768x1024, 40 pasos y CFG 4.0.

Su relevancia es acotada pero específica: cubre un nicho de restauración fotográfica móvil con un adaptador ligero (0,5 GB de repo) sobre un modelo de edición de imagen de gran tamaño, y demuestra un enfoque de condicionamiento por dispositivo que puede replicarse para otros sensores. No hay métricas publicadas en la información disponible ni descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre el DiT de Qwen-Image-Edit-2511 (adaptador de superresolución) |
| Parametros totales | no disponible (adaptador de 450,2 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el modelo base Qwen-Image-Edit-2511 conserva su propia licencia) |
| Formato de pesos | safetensors (`unitele_qwen_sr.safetensors`, SHA-256 `7d9d9306055c92fb84b60bd84a26ea586ffed29fbd3a31cebe1a2c62b7c2179b`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado al transformer de difusión (DiT) de Qwen-Image-Edit-2511, un modelo de edición de imagen. El entrenamiento se centró en restauración teleobjetivo y combinó capturas reales alineadas de teléfonos Huawei, iPhone 17 Pro Max y vivo X300 Ultra con pares sintéticos generados a partir de 500 imágenes digitales externas adicionales. El condicionamiento por dispositivo se selecciona en inferencia mediante el parámetro `--phone` con valores `huawei`, `iphone` y `vivo`, lo que sugiere que el adaptador incorpora información específica de cada cámara.

La configuración de inferencia documentada por el autor es de 40 pasos, CFG scale 4.0, semilla 123 y un canvas orientado de 1024x768 o 768x1024. El script `infer.py` usa DiffSynth-Studio y soporta ejecución en CUDA y en NPU (Ascend) con el stack PyTorch NPU correspondiente. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a difusión).

## Capacidades

- Superresolución y restauración de imágenes teleobjetivo capturadas con Huawei, iPhone 17 Pro Max y vivo X300 Ultra.
- Restauración orientada al dispositivo: el adaptador selecciona el perfil de degradación según el teléfono de origen.
- Procesamiento image-to-image con canvas orientado (horizontal 1024x768 o vertical 768x1024).
- Integración con el pipeline de edición de Qwen-Image-Edit-2511, heredando sus capacidades de edición de imagen.
- Ejecución en GPU CUDA y en NPU Ascend mediante el flag `--device npu`.
- Carga de adaptador local mediante `--lora-path` para evitar descargas en tiempo de inferencia.
- No se documentan capacidades de texto, código, tool calling, agentes ni multilingüismo.

## Casos de uso

- Restauración de fotos teleobjetivo de iPhone 17 Pro Max: el adaptador se aplica sobre la captura original con `--phone iphone` para recuperar detalle en recortes de zoom, aprovechando el condicionamiento específico del sensor.
- Recuperación de imágenes de Huawei y vivo X300 Ultra en flujos de postproducción móvil: permite procesar lotes por dispositivo seleccionando el perfil correspondiente y un canvas acorde a la orientación de la foto.
- Mejora de recortes para impresión o visualización en pantalla grande: el canvas de 1024x768 o 768x1024 ofrece una resolución de salida adecuada para ampliaciones moderadas de tomas tele.
- Investigación en restauración condicionada por dispositivo: el adaptador sirve como referencia reproducible para estudiar degradaciones específicas de cámara sin reentrenar el backbone completo.
- Prototipado de pipelines de fotografía computacional: al ser un LoRA de 450 MiB sobre un modelo base conocido, se puede integrar en experimentos con DiffSynth-Studio y comparar configuraciones de pasos y CFG.
- Despliegue en infraestructura Ascend: el soporte de `--device npu` permite ejecutar la restauración en entornos con stack PyTorch NPU, útil en entornos con aceleradores no NVIDIA.
- Evaluación comparativa de técnicas de SR generativa: el adaptador puede usarse como línea base en estudios sobre alucinación de texturas en superresolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación en un benchmark controlado de capturas con tres teléfonos, pero no incluye cifras (PSNR, SSIM, LPIPS u otras) ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del backbone Qwen-Image-Edit-2511, que debe cargarse por separado; el adaptador en sí ocupa 450,2 MiB.
- GPU recomendadas: no disponibles en la información proporcionada. El autor indica que se necesita una máquina con memoria suficiente para el backbone Qwen-Image-Edit-2511.
- Compatibilidad con GPU de consumo: no confirmada; el requisito real lo marca el modelo base, no el adaptador.
- Opciones de despliegue: DiffSynth-Studio (usado en `infer.py`), con soporte CUDA y NPU Ascend (`--device npu`).
- Latencia y throughput: no disponibles. La configuración de referencia usa 40 pasos de inferencia y CFG 4.0.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniTele-Qwen-SR | LoRA de SR teleobjetivo | Qwen-Image-Edit-2511 | canvas 1024x768 / 768x1024 | Apache-2.0 | HuggingFace (0 descargas) |
| Qwen-Image-Edit-2511 | Modelo de edición de imagen | — | no disponible | licencia propia de Qwen | HuggingFace |
| Alternativas de SR genérica | no disponible | — | — | — | — |

No se dispone de datos de rendimiento ni de modelos comparables de la misma categoría (SR teleobjetivo condicionada por dispositivo) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador; es imprescindible descargar y cargar el backbone Qwen-Image-Edit-2511 por separado, con su propia licencia.
- No incluye los generadores de degradación ni las imágenes del benchmark, por lo que la reproducibilidad completa del estudio no está cubierta por este repo.
- Riesgo de alucinación de texturas: como otros sistemas de SR generativa, puede alterar o inventar detalles ambiguos; la nitidez aparente no garantiza fidelidad a la escena fotografiada.
- El adaptador está entrenado para tres dispositivos concretos (Huawei, iPhone 17 Pro Max, vivo X300 Ultra); su comportamiento en otras cámaras no está validado.
- Sin métricas publicadas de calidad (PSNR, SSIM, LPIPS) en la información disponible.
- Sin descargas ni likes registrados en HuggingFace en el momento de la consulta; madurez y soporte comunitario limitados.
- Idiomas soportados no disponibles (modelo de imagen, no de texto).
- La licencia Apache-2.0 cubre el adaptador, pero el uso comercial del conjunto depende también de la licencia del modelo base Qwen.
- Requisitos de memoria no especificados; el despliegue en hardware de consumo no está confirmado.

## Enlaces

- HuggingFace: https://huggingface.co/AustinZYC/UniTele-Qwen-SR
- Paper UniTele: https://arxiv.org/abs/2610.39617
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511 (sección de licencia)
