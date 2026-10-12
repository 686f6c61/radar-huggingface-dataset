# arraypress/upscale-swinir-l-real

## Resumen

SwinIR-L real-world ×4 es un modelo de super-resolución por imagen (image-to-image) que escala una imagen de entrada 4× manteniendo la fidelidad al detalle original. Lo publica el desarrollador arraypress dentro de su ecosistema Core AI para Apple Silicon y se distribuye en formato `.aimodel` con pesos en float16. Está construido sobre el modelo base JingyunLiang/SwinIR y su checkpoint concreto es el release `003_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR-L_x4_GAN.pth`, verificado byte a byte con SHA-256.

El modelo resuelve el problema clásico de la restauración de imágenes reales: fotografías con desenfoque, ruido y compresión JPEG, donde un upscaler ingenuo inventa textura inexistente. Según la model card, la variante real-world se eligió por priorizar un escalado "fiel" que recupera detalle sin generarlo, con un LPIPS de 0.185 / 0.208 (imágenes generadas / reales) y 0.213 / 0.282 con daño añadido de desenfoque, ruido y JPEG, superando a Real-ESRGAN x4plus en todas las celdas del bake-off.

Es relevante ahora porque es el upscaler por defecto de la herramienta `upscale` de arraypress y del flag `imagine --upscale`, y porque la exportación a Core AI permite ejecutarlo íntegramente en la GPU de equipos Apple Silicon sin PyTorch. El modelo se diseñó para procesar por teselas (tiles) de 128 px con solapamiento y feathering de costuras, de modo que la resolución de la imagen de entrada no está limitada por memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinIR (Swin Transformer) para restauración de imagen; modelo base JingyunLiang/SwinIR |
| Parametros totales | no disponible en la información proporcionada (el modelo base es SwinIR-L) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de lenguaje) |
| Tipos de cuantizacion | float16 (pesos distribuidos); existe exportación float32 (PSNR de paridad más alto) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 (con archivo `NOTICE`) |
| Formato de pesos | `.aimodel` (Core AI), float16; modelo base de origen en checkpoint `.pth` |
| Escala de super-resolución | ×4 |
| Entrada / salida | `x` `[1,3,128,128]` float16 en `[0,1]` (RGB) / `output` `[1,3,512,512]` en `[0,1]` |
| Tamaño de tesela | 128 px (con solapamiento de ~16 px y feathering de costuras) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La red es una SwinIR-L, es decir, una arquitectura de restauración de imagen basada en Swin Transformer: extracción de características con convoluciones poco profundas seguida de bloques de atención de ventana desplazada (shifted window attention) para la extracción profunda de rasgos, y una etapa final de reconstrucción por convolución. El checkpoint corresponde al release v0.0 de SwinIR, variante denominada `003_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR-L_x4_GAN`, cuyo propio nombre codifica la configuración: tarea real-world SR, filosofía de degradación BSRGAN, ventana de parámetros `s64w8`, escala ×4 y entrenamiento con pérdida adversarial (GAN). Los pesos son byte-idénticos al asset oficial del release (SHA-256 `99adfa91…328c0a`).

La exportación a Core AI se hizo con `export_swinir.py` (incluido en el repositorio) usando spandrel 0.4.1, `coreai-torch 0.4.3` y `coreai-core 1.0.0b3`, con float16 bajo autocast. Un detalle técnico relevante es que las máscaras de atención se precalculan para la tesela de 128 px: a otros tamaños SwinIR las reconstruye en cada llamada y ello hacía fallar el conversor. El modelo no dispone de datos propios de entrenamiento; hereda íntegramente los del SwinIR-L original. No se documenta en la ficha información adicional sobre el número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO (no aplicables a un modelo de imagen).

## Capacidades

- Super-resolución ×4 de imágenes RGB en un rango de entrada `[0,1]`.
- Restauración "fiel": recupera detalle sin inventar textura (preserva pelo y follaje donde Real-ESRGAN los suaviza).
- Robustez ante degradaciones reales: desenfoque, ruido y compresión JPEG.
- Procesado por teselas de 128 px con solapamiento de ~16 px y feathering, lo que permite escalar imágenes de cualquier resolución por encima de la memoria disponible.
- Ejecución en GPU de Apple Silicon a través del runtime Core AI (formato `.aimodel`).
- Integración directa con la herramienta `upscale` de swift-upscale y con `imagine --upscale`.
- Paridad numérica con el modelo PyTorch de referencia: 66–68 dB PSNR en float16 y 124–125 dB en exportación float32, por tesela de 128 px.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No incorpora capacidades de visión de alto nivel (detección, segmentación, OCR); su única tarea es la super-resolución.

## Casos de uso

- Restauración de fotografías antiguas o dañadas: el modelo está entrenado sobre degradaciones reales (BSRGAN, JPEG, ruido), por lo que recupera detalle en imágenes escaneadas o de baja calidad sin introducir artefactos falsos.
- Mejora de imágenes generadas por IA: integrado en `imagine --upscale`, permite escalar 4× una salida generada manteniendo coherencia con el contenido original.
- Preparación de imágenes para impresión: escalar de 1024×1024 a 4096×4096 (25–29 s en M3 Max) produce material apto para impresión de gran formato sin ampliación por interpolación.
- Preprocesado en pipelines de visión por computador: subir resolución de entrada antes de un detector o clasificador, con el escalado por teselas que admite lotes de imágenes de tamaño variable.
- Aplicaciones de fotografía nativas de macOS: al estar exportado a Core AI, se puede embeber en apps de Apple Silicon sin depender de PyTorch ni de CUDA.
- Procesado por lotes de catálogos de stock: la velocidad estable por tesela (~0,25 s por tesela de 128 px) permite estimar el tiempo total a partir del número de teselas necesarias para cada imagen.
- Recuperación de assets para juegos y renders: escalado de texturas o capturas de baja resolución preservando bordes y evitando el aspecto "plastificado" típico de los upscalers generativos.
- Post-procesado de miniaturas y previews: reconstrucción de detalle en imágenes comprimidas con JPEG para recomponer versiones de mayor calidad a partir de las ya almacenadas.

## Benchmarks y rendimiento

Bake-off de siete upscalers sobre ×4 shrink-and-back con 5 fotos generadas y 5 fotos de stock (LPIPS, menor es mejor; PSNR en dB entre paréntesis). Solo se dispone de los valores de SwinIR-L y Real-ESRGAN x4plus:

| Modelo | LPIPS generadas | LPIPS reales | LPIPS con blur/ruido/JPEG (gen. / real) | PSNR (gen. / real) |
|---|---|---|---|---|
| SwinIR-L real-world (este modelo) | 0,185 | 0,208 | 0,213 / 0,282 | 28,05 / 24,45 dB |
| Real-ESRGAN x4plus | 0,195 | 0,236 | no disponible en la información proporcionada | no disponible en la información proporcionada |

Métricas de rendimiento y calidad medidas por el autor (M3 Max, macOS 27, GPU):

| Métrica | Valor |
|---|---|
| Paridad con PyTorch float32 (por tesela de 128 px) | 66–68 dB PSNR (float16); 124–125 dB (exportación float32) |
| Coste por píxel nuevo según tesela | 24,9 µs (128 px); 26,9 µs (256 px); 29,0 µs (192 px) |
| Costura en imagen de 256 px (tiles solapados vs. PyTorch global) | 41,6 dB global; bandas de costura 41,8 dB |
| Tiempo 1024×1024 → 4096×4096 | 25–29 s (tres ejecuciones) |
| Velocidad por tesela | ~0,25 s por tesela de 128 px |
| Carga inicial | 0,2 s (una vez compilado) |

## Requisitos de hardware

- Acelerador objetivo: GPU de Apple Silicon mediante el runtime Core AI (formato `.aimodel`). El rendimiento documentado se midió en un M3 Max.
- VRAM estimada: no disponible en la información proporcionada. Al procesar por teselas de 128 px en float16, la huella de memoria es reducida y no depende de la resolución final de la imagen, sino del número de teselas simultáneas.
- GPU recomendadas: Apple Silicon (M-series). No hay soporte documentado para GPU NVIDIA/AMD ni para CUDA; para esos entornos habría que usar el checkpoint original de SwinIR en PyTorch.
- Compatibilidad con GPU de consumo: sí en equipos Apple Silicon (M3 Max medido); no disponible para tarjetas gráficas de consumo tipo RTX en el formato distribuido.
- Opciones de despliegue: runtime Core AI con el fichero `swinir-l-real-x4-128-float16.aimodel`, la herramienta `upscale` y `imagine --upscale` de swift-upscale; el script `export_swinir.py` permite regenerar el modelo desde el checkpoint. No aplican vLLM, llama.cpp, Ollama ni TGI (son servidores para modelos de lenguaje).
- Latencia y throughput estimados: ~0,25 s por tesela de 128 px; 1024×1024 → 4096×4096 en 25–29 s en M3 Max; 24,9 µs por píxel nuevo a tesela de 128 px.

## Comparativa con modelos similares

| Modelo | Escala | LPIPS generadas / reales | PSNR (gen./real) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwinIR-L real-world ×4 (este modelo, Core AI) | ×4 | 0,185 / 0,208 | 28,05 / 24,45 dB | Apache-2.0 | HuggingFace, formato `.aimodel` para Apple Silicon |
| Real-ESRGAN x4plus | ×4 | 0,195 / 0,236 | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |
| SwinIR original (JingyunLiang/SwinIR) | ×4 | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | checkpoint `.pth` en PyTorch |

De la comparativa solo se pueden extraer conclusiones cuantitativas frente a Real-ESRGAN x4plus: el SwinIR-L real-world obtiene un LPIPS inferior en las cuatro celdas del bake-off (sin y con degradación, generadas y reales) y el mejor PSNR. El resto de alternativas dentro del bake-off de siete upscalers no se detallan en la ficha.

## Limitaciones y advertencias

- Es un modelo de imagen, no de lenguaje: no admite razonamiento, tool calling, agentes ni capacidades multilingües.
- Riesgo de alucinación visual: aunque la variante se presenta como "fiel", cualquier upscaler generativo puede introducir detalle plausible pero no real en zonas muy degradadas; conviene revisar resultados en usos forenses o documentales.
- Dependencia del formato: los pesos distribuidos son `.aimodel` para Core AI; usarlos fuera de Apple Silicon requiere reconvertir desde el checkpoint de SwinIR original.
- Las máscaras de atención están precalculadas para la tesela de 128 px; a otros tamaños el conversor fallaba, de modo que cambiar el tamaño de tesela puede romper la exportación.
- El rendimiento (25–29 s para 1024→4096) está medido en M3 Max; en hardware inferior el tiempo crecerá con el número de teselas.
- El repositorio registra 0 descargas y 0 "likes", por lo que no hay evidencia comunitaria de uso en producción.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el archivo `NOTICE` y respetarse las condiciones de los pesos originales del modelo base.
- El autor no documenta sesgos, idiomas ni cobertura de dominios morfológicos concretos más allá de las pruebas descritas.
- Fechas de creación y actualización del repositorio (2026-10-11) y el uso de versiones beta de `coreai-core` (1.0.0b3) sugieren que el ecosistema Core AI puede seguir cambiando y afectar la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/arraypress/upscale-swinir-l-real
- Modelo base: https://huggingface.co/JingyunLiang/SwinIR
- Repositorio swift-upscale: https://github.com/arraypress/swift-upscale
- SwinIR (JingyunLiang, GitHub oficial): https://github.com/JingyunLiang/SwinIR
- Script de exportación: `export_swinir.py` (incluido en el repositorio del modelo)
