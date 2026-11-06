# fastforks/marigold

## Resumen

Marigold es un modelo de estimación de profundidad monocular que reformula la tarea como un problema de difusión generativa. Desarrollado originalmente por el grupo PRS-ETH (Ke et al., 2023), parte de un UNet de Stable Diffusion 2 afinado para denoisar un latente de profundidad condicionado por el latente de la imagen de entrada. El repositorio `fastforks/marigold` no contiene pesos: es una model card de empaquetado que referencia los pesos originales del autor y verifica su integridad mediante SHA-256.

La relevancia de esta ficha reside en que documenta una integración de inferencia optimizada (backends `portable` y `kernels`) sobre el checkpoint oficial `marigold-depth-v1-1`, con mejoras medibles de latencia (hasta 1,1x frente al backend portable y reducción del tiempo de primera llamada de 1,06 s a 0,52 s) manteniendo la precisión del código original (AbsRel de 0,0561 en NYUv2 frente a 0,0558 del original).

El modelo resuelve la predicción de mapas de profundidad afín-invariantes a partir de una única imagen RGB, con salida de profundidad o profundidad inversa. Está pensado para investigación y prototipado; la licencia OpenRAIL++-M permite uso comercial con restricciones que deben propagarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión (Stable Diffusion 2) con VAE y text encoder; denoising de latente de profundidad condicionado por latente de imagen |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: una imagen RGB de cualquier H x W >= 8, redimensionada o con padding interno) |
| Tipos de cuantización | fp32 (original), fp16 (por defecto en backends portable/kernels); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (tarea de visión; el text encoder no se usa para condicionamiento lingüístico en la inferencia de profundidad) |
| Licencia | CreativeML OpenRAIL++-M (LicenseRef-CreativeML-OpenRAIL-PlusPlus-M); código Apache-2.0 |
| Formato de pesos | safetensors (`unet/diffusion_pytorch_model.safetensors`, `vae/diffusion_pytorch_model.safetensors`, `text_encoder/model.safetensors`) |

## Arquitectura y entrenamiento

Marigold es un modelo de difusión basado en el UNet de Stable Diffusion 2, reutilizado como denoiser sobre un espacio latente de profundidad. La imagen RGB se codifica en un latente que condiciona el proceso de denoising; el modelo genera el mapa de profundidad mediante un número reducido de pasos DDIM (variante v1-1, "few DDIM steps"). La salida es afín-invariante: requiere un ajuste posterior de escala y desplazamiento (o escala y shift en espacio de disparidad para modelos de profundidad inversa) para obtener valores métricos.

El entrenamiento parte de Stable Diffusion 2 (subconjuntos de LAION-5B) y se afina sobre los datasets sintéticos Hypersim y Virtual KITTI 2, según los artículos de Marigold (arXiv 2312.02145 y 2505.09358). El repositorio de fastforks no reentrena: empaqueta los pesos del autor y valida paridad numérica contra las salidas doradas del código original en su commit fijado (`2bfbdea`). En CPU con float32 la diferencia máxima es <= 0,0001; en GPU con float16 la diferencia media es <= 1 % y el p99 <= 3 % respecto a la mediana del valor de referencia.

## Capacidades

- Estimación de profundidad monocular a partir de una sola imagen RGB.
- Salida de mapa de profundidad o profundidad inversa (métrica solo en los modelos marcados como `metric`; `marigold-depth-v1-1` no se documenta como métrico).
- Procesamiento de entradas de tamaño arbitrario con H x W >= 8, con redimensionado o padding interno.
- Inferencia en dos backends: `portable` (PyTorch estándar) y `kernels` (kernels optimizados).
- Verificación de integridad de pesos mediante SHA-256 contra la model card.
- Ejecución en CPU (float32) y GPU (float16 por defecto).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión general ni audio: es un modelo especializado exclusivamente en profundidad.

## Casos de uso

- Reconstrucción 3D y fotogrametría: a partir de una imagen única se obtiene un mapa de profundidad denso que puede proyectarse a nube de puntos; adecuado por su resolución de salida y su coste de inferencia contenido (324-458 ms en GPU consumer según resolución).
- Realidad aumentada y sustitución de fondo: la profundidad afín-invariante permite segmentar primer plano y fondo en tiempo casi interactivo (351,7 ms a 1280x720 en backend portable) sin necesidad de sensores de profundidad.
- Preprocesado para pipelines de visión: generar mapas de profundidad como entrada auxiliar para detección, segmentación o navegación en robótica ligera, donde no se dispone de LiDAR.
- Síntesis de datos y aumento: producir profundidad de referencia para imágenes sintéticas o para aumentar datasets de entrenamiento de otros modelos de profundidad.
- Efectos de desenfoque de profundidad (bokeh) en postproducción: la salida de profundidad permite aplicar desenfoque selectivo por distancia estimada en imágenes de resolución alta (probado hasta 3000x4000 con 3,0 GiB de pico en RTX 5060 Ti 16 GB).
- Prototipado en investigación: validar hipótesis de estimación de profundidad con un checkpoint reproducible y paridad numérica verificada frente al código original, útil para comparativas controladas.

## Benchmarks y rendimiento

Precisión en datasets públicos (AbsRel / delta1 tras ajuste de escala y shift por mínimos cuadrados, media sobre imágenes):

| Variante | Dataset | Original | Portable | Kernels |
|---|---|---|---|---|
| `marigold-depth-v1-1` | NYUv2 test | 0,0558 / 0,9693 | 0,0561 / 0,9703 | 0,0561 / 0,9703 |
| `marigold-depth-v1-1` | iBims-1 | 0,0498 / 0,9717 | 0,0499 / 0,9722 | 0,0499 / 0,9721 |
| `marigold-depth-v1-1` | ETH3D two-view train left | 0,1075 / 0,8741 | 0,1141 / 0,8715 | 0,1141 / 0,8715 |
| `marigold-depth-v1-1` | Middlebury 2014 trainingH left | 0,0409 / 0,9909 | 0,0413 / 0,9899 | 0,0413 / 0,9899 |

Latencia y memoria (RTX 5060 Ti 16 GB, sm_120; tiempo / pico asignado / pico reservado en MiB):

| Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| portable | 455,3 ms / 2898 / 3650 | 351,7 ms / 2648 / 3306 | 351,8 ms / 2661 / 3378 | 458,1 ms / 3033 / 3844 |
| kernels | 433,0 ms / 2636 / 3464 | 324,3 ms / 2452 / 3070 | 324,9 ms / 2465 / 3142 | 435,6 ms / 2770 / 3552 |

Middlebury 2014 (mitad, 994x1482): original fp32 975,6 ms; portable 408,07 ms; kernels 383,17 ms (1,1x frente a portable). Carga del modelo: 1,73 s (original), 8,20 s (portable), 1,10 s (kernels). Primera llamada: 1,06 s (original), 0,56 s (portable), 0,52 s (kernels). Medido el 2026-10-28 con torch 2.14.1+cu130.

## Requisitos de hardware

- VRAM estimada: pico asignado de 2,4-3,0 GiB en fp16 según resolución; reservado de 3,0-3,8 GiB. En CPU float32 el consumo no se documenta.
- GPU recomendadas: cualquier GPU con >= 4 GiB de VRAM en fp16; probado en RTX 5060 Ti 16 GB (sm_120).
- Cabe en GPU consumer: sí, en RTX 5060 Ti y modelos con VRAM similar o superior (RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090).
- Despliegue: backends propios `portable` (PyTorch) y `kernels` del paquete fastforks; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de profundidad).
- Latencia: 324-458 ms por imagen en RTX 5060 Ti en resoluciones de 640x480 a 12 MP; 383-408 ms en 994x1482. Throughput no documentado.
- Entradas grandes: probado hasta 3000x4000 con 3,0 GiB de pico asignado y 3,8 GiB reservado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Precisión NYUv2 (AbsRel) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Marigold depth v1-1 (fastforks) | Difusión (SD2 UNet) | no disponible | imagen RGB arbitraria >= 8x8 | 0,0561 | OpenRAIL++-M | pesos en prs-eth, card en fastforks |
| Marigold depth v1-1 (original) | Difusión (SD2 UNet) | no disponible | imagen RGB arbitraria | 0,0558 | OpenRAIL++-M | Hugging Face prs-eth |
| Otros modelos de profundidad monocular | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de modelos alternativos (Depth Anything, MiDaS, ZoeDepth u otros) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo de difusión: el ruido sembrado proviene de un generador de CPU y difiere del generador CUDA del código original para la misma semilla, por lo que la reproducibilidad exacta entre implementaciones no está garantizada.
- Un módulo trazado o exportado no reutiliza el mismo flujo de aleatoriedad; la paridad verificada aplica solo a la ejecución estándar.
- La salida es afín-invariante: requiere ajuste de escala y shift para uso métrico; no debe interpretarse como profundidad absoluta sin calibración.
- ETH3D y Middlebury podrían estar en los datos de entrenamiento, por lo que sus métricas pueden estar infladas.
- Riesgo de alucinación geométrica en escenas fuera de distribución (interiores sintéticos Hypersim y conducción Virtual KITTI 2 son el dominio de afinado).
- Licencia OpenRAIL++-M: permite uso comercial pero con restricciones de uso que deben propagarse a derivados; los términos de los datos de entrenamiento no han sido verificados.
- El repositorio fastforks no aloja pesos: depende de la disponibilidad de los enlaces del autor y de la verificación SHA-256 para garantizar integridad.
- No soporta texto, tool calling ni agentes; cualquier uso fuera de estimación de profundidad queda fuera de su diseño.
- No se documentan sesgos demográficos ni geográficos específicos, pero al derivar de LAION-5B y datasets sintéticos puede heredar sesgos de esos corpus.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/marigold
- Pesos del autor: https://huggingface.co/prs-eth/marigold-depth-v1-1
- Licencia del autor: https://huggingface.co/prs-eth/marigold-depth-v1-1/blob/9571e7123e258cf052b4e54241f17971c290e9a8/README.md
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de Marigold: https://github.com/prs-eth/Marigold (commit `2bfbdea`)
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Paper Marigold (2023): arXiv 2312.02145
- Paper Marigold v1-1 (2025): arXiv 2505.09358
