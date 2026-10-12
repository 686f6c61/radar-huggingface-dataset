# arraypress/upscale-realesrgan

## Resumen

`arraypress/upscale-realesrgan` es un repositorio de pesos convertidos a Core ML de la familia Real-ESRGAN, orientados a superresolución de imagen (upscaling) ×4 sobre hardware Apple Silicon. No es un modelo entrenado por el autor del repositorio: arraypress redistribuye las conversiones Core ML publicadas por VincentGOURBIN en `VincentGOURBIN/RealESRGAN-CoreML` (espejo de `LocalMuseAI/coreml-realesrgan-x4plus` en el commit `4f6c21f7c431ae4e52ae45d11d6195fd96d93fcc`), que a su vez derivan del proyecto original `xinntao/Real-ESRGAN` de Xintao Wang et al. Los archivos se republican descomprimidos y sin modificar, verificados por SHA-256.

El repositorio alimenta la herramienta de línea de comandos `upscale`, del proyecto `arraypress/swift-upscale`, que descarga los paquetes en el primer uso. Incluye tres variantes en formato `.mlpackage`: `RealESRGAN-x4plus` (33 MB), `realesr-general-x4v3` (2,4 MB) y `realesr-general-wdn-x4v3` (2,4 MB, con eliminación de ruido y artefactos JPEG). La inferencia trabaja por mosaicos de 256×256 que producen 1024×1024, con factor de escala ×4.

Su relevancia actual es de nicho pero clara: permite ejecutar upscaling de calidad en Mac y dispositivos Apple sin depender de CUDA ni de PyTorch, usando CPU + Neural Engine. En las mediciones del autor, `x4plus` escala 1024×1024 a 4096×4096 en 4,5–4,6 s en un M3 Max. La licencia es BSD-3-Clause, heredada del proyecto original, lo que facilita el uso comercial. El repositorio no incluye los modelos UltraSharp ni MangaJPEGLQ (licencia CC BY-NC-SA 4.0), que se alojan aparte en `arraypress/upscale-nc`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; los pesos derivan del proyecto upstream Real-ESRGAN, cuyo generador se basa en bloques RRDB (Residual-in-Residual Dense Block) según la documentación del repositorio original |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no procesa secuencias de texto) |
| Tipos de cuantización | No disponible; se distribuyen paquetes `.mlpackage` listos para Core ML y la model card no especifica la precisión de los pesos |
| Idiomas soportados | No aplica (superresolución de imagen, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.mlpackage` (Core ML), republicados descomprimidos y sin cambios |
| Pipeline | image-to-image (superresolución) |
| Factor de escala | ×4 |
| Mosaico de inferencia | 256×256 de entrada → 1024×1024 de salida |
| Tamaño de los paquetes | 33 MB (`RealESRGAN-x4plus.mlpackage`), 2,4 MB (`RealESRGAN-x4v3.mlpackage`), 2,4 MB (`RealESRGAN-x4v3-denoise.mlpackage`) |
| Plataforma objetivo | Apple Silicon (Core ML, ejecución en CPU + Neural Engine) |
| Metadatos de publicación | Creado el 11 de octubre de 2026 según Hugging Face; tamaño de repositorio reportado: 0.0 GB |

Variantes incluidas:

| Paquete | Modelo de origen | Tamaño | Uso previsto |
|---|---|---|---|
| `RealESRGAN-x4plus.mlpackage` | RealESRGAN_x4plus | 33 MB | `upscale --fast`, modelo general rápido |
| `RealESRGAN-x4v3.mlpackage` | realesr-general-x4v3 | 2,4 MB | Pequeño y rápido, resultado algo más suave |
| `RealESRGAN-x4v3-denoise.mlpackage` | realesr-general-wdn-x4v3 | 2,4 MB | Variante x4v3 que además elimina ruido y bloques JPEG |

## Arquitectura y entrenamiento

La model card de este repositorio no documenta arquitectura, datos de entrenamiento ni proceso de ajuste. Lo único indicado es la procedencia: los modelos originales pertenecen a `xinntao/Real-ESRGAN` (Xintao Wang et al., licencia BSD-3-Clause) y las conversiones a Core ML fueron realizadas por VincentGOURBIN en `VincentGOURBIN/RealESRGAN-CoreML`, espejadas después por `LocalMuseAI/coreml-realesrgan-x4plus` en el commit `4f6c21f7c431ae4e52ae45d11d6195fd96d93fcc`. Cada archivo se verificó contra el SHA-256 listado en el repositorio de origen y se republica descomprimido e inalterado.

En consecuencia, no hay información en este repositorio sobre número de tokens o imágenes de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas. Tampoco se documenta si las conversiones a Core ML aplican paletización, cuantización o poda sobre los pesos originales, ni si se han modificado las capas para optimizar la ejecución en Neural Engine. Cualquier detalle arquitectónico debe consultarse en el repositorio upstream de Real-ESRGAN, no en esta ficha.

## Capacidades

- Superresolución de imagen con factor ×4, trabajando por mosaicos de 256×256 que generan salidas de 1024×1024.
- Restauración general de imágenes: `RealESRGAN-x4plus` actúa como modelo generalista rápido.
- Eliminación de ruido y de artefactos de compresión JPEG con la variante `realesr-general-wdn-x4v3` (`RealESRGAN-x4v3-denoise.mlpackage`).
- Variante ligera (`realesr-general-x4v3`, 2,4 MB) para escenarios donde prima el tamaño y la velocidad sobre la nitidez máxima.
- Ejecución local en Apple Silicon mediante Core ML, con reparto entre CPU y Neural Engine.
- Integración en línea de comandos a través de la herramienta `upscale` del proyecto `arraypress/swift-upscale`, que descarga los paquetes en el primer uso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades de texto, visión semántica, audio o modo de pensamiento: es exclusivamente un modelo de imagen a imagen.
- No dispone de capacidades multilingües, al no procesar lenguaje.

## Casos de uso

- Restauración de fotografías antiguas o escaneadas: la variante `RealESRGAN-x4v3-denoise.mlpackage` combina el escalado ×4 con eliminación de ruido y bloques JPEG, lo que la hace adecuada para digitalizaciones con artefactos de compresión.
- Preparación de activos para impresión: escalar imágenes de 1024×1024 a 4096×4096 permite alcanzar resoluciones aptas para soportes impresos partiendo de originales pequeños, con un coste medido de 4,5–4,6 s por imagen en un M3 Max.
- Aplicaciones macOS o iOS con procesamiento en el dispositivo: al distribuirse como `.mlpackage`, el modelo se integra en apps Apple sin depender de servidores con GPU ni de conexión a internet, lo que reduce costes de infraestructura y facilita el tratamiento de datos sensibles en local.
- Pipelines de fotografía de producto: el modelo generalista `x4plus` sirve como paso rápido de escalado en lote antes de un refinado posterior, y el autor lo mantiene como opción veloz frente a su modelo por defecto actual, SwinIR-L.
- Recuperación de material gráfico con compresión agresiva: la variante con denoising está pensada para imágenes que arrastran ruido y artefactos JPEG, habituales en capturas de pantalla, miniaturas o imágenes reenviadas por mensajería.
- Aumento de resolución en flujos de renderizado o generación de imágenes: como paso posterior a un generador de imágenes, el escalado ×4 permite obtener salidas de mayor tamaño sin volver a ejecutar el modelo generativo, siempre que se acepte la posible invención de detalle fino.
- Herramientas de escritorio para usuarios finales en Mac: la CLI `upscale` y la librería `swift-upscale` permiten empaquetar el escalado como utilidad local, con descarga automática de los pesos en el primer uso.
- Procesamiento por lotes en estaciones de trabajo Apple: la ejecución en CPU + Neural Engine evita competir por GPU dedicada y permite paralelizar con otros procesos de la máquina, a costa de un rendimiento inferior al de soluciones CUDA equivalentes.

## Benchmarks y rendimiento

La model card solo publica métricas LPIPS de una prueba de reducción y reescalado ×4 sobre 5 imágenes generadas y 5 fotografías de archivo, además de un dato de latencia en hardware concreto. No hay MMLU, HumanEval ni GSM8K, lógicamente, por tratarse de un modelo de imagen; tampoco hay PSNR ni SSIM.

| Modelo | LPIPS (imágenes generadas) | LPIPS (fotos reales) | Latencia medida |
|---|---|---|---|
| RealESRGAN x4plus | 0,195 | 0,236 | 1024×1024 → 4096×4096 en 4,5–4,6 s (M3 Max, Core ML, CPU + Neural Engine) |
| SwinIR-L (`arraypress/upscale-swinir-l-real`), opción por defecto actual de `upscale` | 0,185 | 0,208 | No disponible |
| `realesr-general-x4v3` (x4v3) | No disponible | No disponible | No disponible |
| `realesr-general-wdn-x4v3` (x4v3 con denoising) | No disponible | No disponible | No disponible |

Interpretación: valores LPIPS más bajos indican mayor similitud perceptual con la referencia. Según estos datos, SwinIR-L supera a x4plus en ambas categorías (0,185 frente a 0,195 en generadas; 0,208 frente a 0,236 en reales), motivo por el cual el autor lo ha convertido en la opción por defecto de la herramienta `upscale`, dejando x4plus como alternativa rápida. No se especifica el conjunto de imágenes exacto ni la metodología completa, por lo que estas cifras deben tomarse como orientativas y no como una evaluación independiente.

## Requisitos de hardware

- Plataforma requerida: Apple Silicon con soporte Core ML; los paquetes `.mlpackage` no se ejecutan en GPU NVIDIA ni en entornos CUDA.
- VRAM estimada: no disponible. La model card no publica consumo de memoria unificado ni requisitos de RAM.
- GPU recomendadas: no aplica en el sentido convencional; los modelos usan CPU + Neural Engine del chip Apple. El único dato medido corresponde a un M3 Max.
- Compatibilidad con GPU de consumo: no aplica a RTX 4090, A100 o H100, que no pueden ejecutar Core ML de forma nativa. En Apple Silicon, los tres paquetes son pequeños (33 MB y 2,4 MB), de modo que el cuello de botella es el coste computacional del escalado, no el tamaño de los pesos.
- Rendimiento medido: 4,5–4,6 s para una imagen de 1024×1024 escalada a 4096×4096 con x4plus en un M3 Max. No hay datos de throughput por lote ni de latencia en otros chips.
- Opciones de despliegue: Core ML directamente, la herramienta de línea de comandos `upscale` y la librería `arraypress/swift-upscale` (Swift). No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Memoria y almacenamiento: el repositorio en Hugging Face reporta 0.0 GB porque los paquetes se descargan bajo demanda desde la herramienta; el espacio en disco necesario es de aproximadamente 33 MB más 2,4 MB por cada variante pequeña.
- Concurrencia: no documentada. Al ejecutarse en CPU + Neural Engine, el rendimiento depende de la carga del sistema y de la gestión de memoria unificada del chip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / escala | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arraypress/upscale-realesrgan` (x4plus, x4v3, x4v3-denoise) | No disponible | Escalado ×4, mosaicos 256→1024 | LPIPS 0,195 / 0,236 (x4plus); latencia 4,5–4,6 s a 4096×4096 en M3 Max | BSD-3-Clause | Hugging Face, conversión Core ML |
| `arraypress/upscale-swinir-l-real` (SwinIR-L) | No disponible | Escalado ×4 | LPIPS 0,185 / 0,208; opción por defecto de `upscale` | No disponible en la información proporcionada | Hugging Face |
| `xinntao/Real-ESRGAN` (upstream, PyTorch) | No disponible en esta ficha | Escalado ×4 y variantes | Base de los pesos convertidos; sin métricas propias en esta ficha | BSD-3-Clause | Repositorio GitHub y pesos originales |
| `VincentGOURBIN/RealESRGAN-CoreML` / `LocalMuseAI/coreml-realesrgan-x4plus` | No disponible | Conversiones Core ML | Origen directo de los archivos republicados aquí | No disponible en la información proporcionada | Hugging Face |
| UltraSharp y MangaJPEGLQ (`arraypress/upscale-nc`) | No disponible | Escalado y restauración de manga/JPEG | No disponible | CC BY-NC-SA 4.0 (no comercial) | Hugging Face, repositorio separado |

No se han encontrado en la búsqueda web modelos comparables adicionales ni evaluaciones independientes: los resultados de búsqueda disponibles no contienen información relacionada con este modelo.

## Limitaciones y advertencias

- No es un modelo entrenado por arraypress: es una redistribución verificada por SHA-256 de conversiones Core ML de terceros. Cualquier error de conversión se hereda de los repositorios de origen.
- Los modelos UltraSharp y MangaJPEGLQ no están incluidos aquí, pese a que la model card del proyecto upstream pueda sugerir lo contrario: son CC BY-NC-SA 4.0 y viven en `arraypress/upscale-nc`. No deben usarse comercialmente ni buscarse en este repositorio.
- La licencia BSD-3-Clause aplica a los pesos incluidos, pero conviene verificar la cadena completa de procedencia (Xintao Wang et al. → VincentGOURBIN → LocalMuseAI → arraypress) antes de un despliegue comercial.
- Riesgo de alucinación visual: como todo modelo generativo de superresolución, puede inventar texturas y detalles plausibles que no existen en la imagen original, especialmente en caras, texto y patrones repetitivos.
- El escalado por mosaicos puede producir costuras o inconsistencias visibles entre teselas en imágenes con gradientes suaves o estructuras alineadas. La model card no documenta ninguna estrategia de solapamiento o fusión.
- No hay modelo específico para rostros, texto o manga en este repositorio, por lo que el resultado en esos dominios será el del modelo generalista.
- La variante `realesr-general-x4v3` produce resultados descritos por el propio autor como «ligeramente más suaves», es decir, con menor nitidez que x4plus.
- Limitación de plataforma severa: al ser Core ML, no hay soporte para CUDA, ROCm ni aceleradores no Apple. No es desplegable en servidores Linux con GPU sin reconvertir los pesos.
- Ausencia total de benchmarks independientes: solo existen las métricas LPIPS y de latencia aportadas por el propio autor, sin metodología detallada.
- El repositorio registra 0 descargas y 0 likes, y la fecha de creación indicada en los metadatos (11 de octubre de 2026) es posterior a la fecha actual, lo que sugiere que se trata de un artefacto de los metadatos de Hugging Face; conviene no tratarlo como un modelo validado por la comunidad.
- El tamaño de repositorio reportado (0.0 GB) no refleja el contenido real, ya que los paquetes se descargan bajo demanda.
- No hay información sobre sesgos, comportamiento con imágenes médicas, satelitales o de vigilancia, ni sobre cumplimiento normativo en esos dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arraypress/upscale-realesrgan
- Repositorio separado con los modelos no comerciales (UltraSharp, MangaJPEGLQ): https://huggingface.co/arraypress/upscale-nc
- Modelo por defecto actual de la herramienta (SwinIR-L): https://huggingface.co/arraypress/upscale-swinir-l-real
- Herramienta y librería `upscale` / `swift-upscale`: https://github.com/arraypress/swift-upscale
- Proyecto original Real-ESRGAN (Xintao Wang et al.): https://github.com/xinntao/Real-ESRGAN
- Conversiones Core ML de origen: https://huggingface.co/VincentGOURBIN/RealESRGAN-CoreML
- Espejo utilizado como referencia de los SHA-256: https://huggingface.co/LocalMuseAI/coreml-realesrgan-x4plus (commit `4f6c21f7c431ae4e52ae45d11d6195fd96d93fcc`)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles corresponden a dominios sin relación con esta ficha.
