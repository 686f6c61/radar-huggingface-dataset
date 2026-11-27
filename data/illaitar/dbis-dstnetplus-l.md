# Illaitar/dbis-DSTNetPlus-L

## Resumen

dbis-DSTNetPlus-L es un modelo de restauración de vídeo especializado en eliminación de desenfoque de movimiento (motion deblurring), empaquetado en PyTorch plano a partir del checkpoint oficial de los autores de DSTNet+ (Learning Efficient Deep Discriminative Spatial and Temporal Networks for Video Deblurring, TPAMI 2025). Lo publica el usuario Illaitar dentro del proyecto "deblurring is solved?", un banco de pruebas reproducible que reempaqueta implementaciones de referencia de modelos de deblurring para facilitar su uso y comparación. El modelo no es un LLM: es una red image-to-image que toma una secuencia de fotogramas borrosos y devuelve la secuencia restaurada.

El interés del artefacto es de ingeniería y reproducibilidad: reproduce exactamente las salidas del código original de los autores (PSNR medio de 35,7078 dB en GoPro, idéntico al reportado por los autores) pero en una implementación limpia de PyTorch, con pesos en safetensors float32 verificados por sha256 y una CLI mínima para procesar carpetas de fotogramas o vídeos. El repositorio ocupa 0,1 GB e incluye además una variante ligera (`dbisf-DSTNetPlus-L`) de 16 MB y 584,9 ms por fotograma 720p en una A100.

Es relevante ahora porque el ecosistema de restauración de vídeo carece de checkpoints empaquetados de forma estándar y verificable: la mayoría de implementaciones viven en repos de investigación con dependencias frágiles. Este paquete ofrece una alternativa con licencia Apache 2.0 (sujeta a los términos del checkpoint original) y una API de tres líneas para integrar deblurring temporal en pipelines de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSTNet+ (red profunda discriminativa espacial y temporal para video deblurring; detalles internos de capas no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible (peso safetensors de 56 MB en float32, lo que sugiere del orden de 14 M parametros, dato no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa secuencias de fotogramas [T, 3, H, W] o [B, T, 3, H, W], sin limite documentado de T |
| Tipos de cuantizacion | float32 (safetensors); formato propietario wpack (.wpk) para la variante ligera; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | apache-2.0, sujeta a los terminos del checkpoint original (ver LICENSE.md y licenses/ del repositorio) |
| Formato de pesos | safetensors (float32, 56 MB) y .wpk (wpack, 16 MB, requiere zstandard) |

## Arquitectura y entrenamiento

DSTNet+ es una red neuronal profunda para video deblurring que combina procesamiento espacial y temporal de fotogramas consecutivos, según el paper de TPAMI 2025 de los autores (repositorio sunny2109/DSTNet-plus). El paquete dbis-DSTNetPlus-L no reentrena el modelo: convierte el checkpoint GoPro de los autores a PyTorch plano mediante `python -m dbis.convert`, conservando los mismos pesos y, por tanto, las mismas salidas. La variante `dbisf` es una versión optimizada (menor tiempo de ejecución y tamaño) con una pérdida máxima de 0,05 dB de PSNR medio respecto a los autores en cada conjunto de test del benchmark.

No se dispone en la información proporcionada de detalles sobre el número de tokens/capas, la composición exacta del dataset de entrenamiento (más allá de que el checkpoint evaluado es el entrenado en GoPro), ni si se emplearon técnicas de refinamiento posteriores. La innovación destacable del empaquetado es la reproducibilidad: cada archivo lleva una tarjeta JSON con su sha256, el checkpoint fuente y su md5, y los argumentos de la red; la carga vía `dbis.load()` verifica el sha256 en la primera descarga.

## Capacidades

- Restauración de vídeo con desenfoque de movimiento: entrada de secuencia de fotogramas borrosos, salida de secuencia nítida, en formato [T, 3, H, W], [B, T, 3, H, W] o un único fotograma [3, H, W].
- Procesamiento de vídeo completo o de carpetas de fotogramas mediante CLI (`python -m dbis.run`).
- Restauración de imagen única (el modelo acepta tensores de un solo fotograma, aunque su diseño es temporal).
- Integración programática en Python con API mínima (`dbis.load` + `net.restore`).
- Verificación de integridad de pesos por sha256 en la carga.
- No soporta tool calling, agentes, razonamiento multi-step, texto, audio ni capacidades multilingües: es exclusivamente un modelo de visión image-to-image.

## Casos de uso

- Postproducción de vídeo: restaurar metraje grabado con movimiento rápido de cámara o de sujetos, aplicando el modelo fotograma a fotograma o por clips; su PSNR de 35,7 dB en GoPro lo sitúa como referencia para comparar con otras herramientas de estabilización y deblurring.
- Limpieza de material de vigilancia: secuencias de cámaras de seguridad con sujetos en movimiento pueden procesarse por lotes con la CLI sobre carpetas de fotogramas, mejorando la legibilidad antes de análisis forense.
- Preprocesado para pipelines de visión por computador: reducir el desenfoque antes de detección, seguimiento o reconocimiento facial, donde el motion blur degrada los descriptores.
- Restauración de vídeo doméstico o de archivo: digitalización de grabaciones antiguas o de móvil con movimiento, usando la variante `dbisf` (584,9 ms por fotograma 720p en A100) cuando el throughput importa más que el último 0,01 dB de PSNR.
- Benchmarking y validación de investigación: al reproducir exactamente las salidas de los autores y publicar los números del harness de latencia, sirve como baseline reproducible para comparar nuevos métodos de deblurring.
- Integración en aplicaciones de edición móvil o web: el peso de 56 MB (o 16 MB en wpack) permite embeberlo en servicios de restauración bajo demanda sin infraestructura pesada.
- Generación de datasets sintéticos de pares borroso/nítido: usar la salida restaurada como referencia cuasi-nítida para entrenar otros modelos de restauración.

## Benchmarks y rendimiento

| Metrica | dbis-DSTNetPlus-L | dbisf-DSTNetPlus-L | Autores (referencia) |
|---|---:|---:|---:|
| PSNR medio en GoPro, dB | 35,7078 | 35,6999 | 35,7078 |
| Tamano del archivo | 56 MB (safetensors fp32) | 16 MB (.wpk) | no disponible |
| Tiempo por fotograma 720p (A100, batch 1) | 3,45 s | 584,9 ms | 3,01 s |

Los datos de PSNR y latencia provienen del harness del benchmark del repositorio (DBIS.md). No se han publicado en la información disponible resultados en otros conjuntos de test (por ejemplo, otros datasets de deblurring) más allá de la afirmación de que la variante `dbisf` queda como máximo 0,05 dB por debajo de los autores en cada conjunto del benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con pesos de 56 MB en float32 y procesamiento por lotes de fotogramas, la memoria dominante será la de las activaciones, proporcional a la resolución y al número de fotogramas T procesados simultáneamente.
- GPU recomendadas: el benchmark se ejecuta en una NVIDIA A100 con batch 1; cualquier GPU con suficiente VRAM para las activaciones a la resolución objetivo debería funcionar.
- GPU de consumo: no se documenta compatibilidad ni rendimiento en RTX 4090, RTX 3090 u otras GPU de consumo; el tamaño reducido de los pesos sugiere que es viable, pero no hay cifras publicadas.
- Opciones de despliegue: paquete Python `deblurring-is-solved` (pip desde git), CLI `dbis.run`, API `dbis.load`/`net.restore`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 3,45 s por fotograma 720p con dbis-DSTNetPlus-L y 584,9 ms con dbisf-DSTNetPlus-L, ambos en A100 con batch 1.

## Comparativa con modelos similares

| Modelo | Tipo | PSNR GoPro | Tamano | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| dbis-DSTNetPlus-L | Video deblurring (DSTNet+) | 35,7078 dB | 56 MB | Apache 2.0 (sujeta a terminos del checkpoint) | Hugging Face, PyTorch plano |
| dbisf-DSTNetPlus-L | Video deblurring (DSTNet+ optimizado) | 35,6999 dB | 16 MB | Apache 2.0 (sujeta a terminos del checkpoint) | Hugging Face, formato .wpk |
| DSTNet+ original (autores) | Video deblurring | 35,7078 dB | no disponible | ver repositorio sunny2109/DSTNet-plus | GitHub, codigo de investigacion |

No se dispone en la información proporcionada de datos de otros modelos comparables (por ejemplo, variantes de deblurring de la familia Restormer, NAFNet o similares) para ampliar la comparativa.

## Limitaciones y advertencias

- Es un modelo de visión especializado: no genera texto, no razona, no soporta herramientas ni agentes; cualquier uso fuera de restauración de imagen/vídeo no aplica.
- El dominio de entrenamiento documentado es GoPro (desenfoque de movimiento en vídeo); el rendimiento fuera de ese dominio (desenfoque de cámara, desenfoque gaussiano, baja iluminación) no está cuantificado en la información disponible.
- Riesgo de artefactos de restauración en regiones con movimiento extremo, oclusiones o texturas repetitivas; no se documentan métricas de fidelidad perceptual (LPIPS, SSIM) en la información proporcionada.
- La licencia Apache 2.0 del empaquetado está sujeta a los términos del checkpoint original de los autores; es imprescindible revisar LICENSE.md y licenses/ antes de uso comercial.
- La variante `dbisf` requiere el formato wpack y la dependencia zstandard, y pierde hasta 0,05 dB de PSNR respecto a los autores.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.
- No se documentan sesgos específicos (no es un modelo lingüístico), pero como todo modelo entrenado con datos de vídeo puede heredar las características de sus datasets de entrenamiento.
- El procesamiento es costoso: 3,45 s por fotograma 720p en A100 implica más de 3 horas por minuto de vídeo a 30 fps con la variante completa, lo que limita su uso en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Illaitar/dbis-DSTNetPlus-L
- Repositorio del empaquetado: https://github.com/illaitar/deblurring-is-solved
- Sitio del benchmark: https://illaitar.github.io/deblurring-is-solved/
- Codigo original de los autores (DSTNet+): https://github.com/sunny2109/DSTNet-plus
- Paper de referencia: Learning Efficient Deep Discriminative Spatial and Temporal Networks for Video Deblurring, TPAMI 2025 (enlace directo no disponible en la informacion proporcionada)
