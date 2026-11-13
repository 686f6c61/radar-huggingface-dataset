# neavo/LaMa-Large-ONNX-WebGPU-FP32

## Resumen

LaMa-Large-ONNX-WebGPU-FP32 es una exportación a ONNX del modelo de inpainting de imágenes `dreMaz/AnimeMangaInpainting`, publicada por el usuario neavo. El modelo original se basa en LaMa (Large Mask Inpainting), una arquitectura de red convolucional con componentes de transformada de Fourier diseñada para reconstruir regiones enmascaradas de una imagen. En este caso, el modelo está especializado en manga y anime: rellena huecos dejados por texto, bocadillos o elementos eliminados sobre ilustraciones en blanco y negro o en color.

La relevancia de esta ficha no está en un nuevo entrenamiento, sino en el formato de distribución. El autor ha reexportado los pesos originales sin cuantizar ni reentrenar, optimizando operaciones de Fourier y operaciones repetidas de forma, y ha unificado en un único fichero ONNX de 204,5 MB el soporte para CPU y WebGPU. Esto permite ejecutar inpainting de manga directamente en el navegador o en Node.js con `onnxruntime-node`, sin dependencias de PyTorch ni backend Python.

El repositorio es pequeño (0,2 GB), tiene licencia MIT y está pensado como pieza de infraestructura para herramientas de traducción y limpieza de manga, como BallonsTranslator, de cuyo código de exportación se toma la referencia. No es un modelo de lenguaje: no genera texto ni razona, solo produce una imagen reparada a partir de una imagen y una máscara binaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LaMa (Large Mask Inpainting), red convolucional con operaciones en el dominio de Fourier |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | FP32 únicamente (el autor indica explícitamente que no está cuantizado) |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`lama-large-fp32-unified-webgpu.onnx`, 204,5 MB) |

Especificaciones adicionales de entrada y salida:

| Tensor | Tipo y forma | Rango / significado |
|---|---|---|
| `image` | float32 `[1,3,H,W]` | RGB, valores en 0–1 |
| `mask` | float32 `[1,1,H,W]` | Máscara binaria, 1 = región a reparar |
| `inpainted` | float32 `[1,3,H,W]` | Imagen reparada predicha |

## Arquitectura y entrenamiento

La arquitectura subyacente es LaMa, un modelo de inpainting basado en una red generativa convolucional que incorpora capas de transformada de Fourier de alta frecuencia para capturar estructura global y patrones repetitivos, algo especialmente útil en tramas y líneas de manga. El modelo no ha sido reentrenado: esta ficha describe una reexportación de los pesos de `dreMaz/AnimeMangaInpainting`. Por tanto, los datos de entrenamiento, el número de tokens o imágenes y el proceso de ajuste (si lo hubo) corresponden al modelo original y no se detallan en la información disponible.

La innovación de esta exportación es de ingeniería de despliegue. Se han optimizado los cálculos de Fourier y las operaciones repetidas de forma, y se ha generado un único grafo ONNX que sirve tanto para CPU como para WebGPU. El autor indica que la prioridad era mejorar la velocidad de inferencia y de carga en CPU, manteniendo el cómputo principal de la red en FP32. La validación se hizo frente a la implementación original de PyTorch en 30 escenarios sobre CPU y WebGPU, con un error máximo por canal de aproximadamente 0,0342/255, aunque no se garantiza identidad bit a bit entre hardware distinto. El modelo admite tamaños dinámicos verificados en el rango de 64 a 1024 píxeles, tanto cuadrados como rectangulares en horizontal y vertical; se recomienda rellenar las dimensiones hasta múltiplos de 64 y recortar después.

## Capacidades

- Inpainting de imágenes de manga y anime: reconstruye regiones marcadas por una máscara binaria.
- Eliminación de texto y bocadillos: pensado para limpiar páginas antes de retraducir o rotular.
- Reparación de tramas y líneas: la componente de Fourier ayuda a continuar patrones repetitivos.
- Entrada y salida en RGB float32 con rango 0–1, con máscara binaria independiente.
- Tamaños dinámicos: soporta resoluciones variables de 64 a 1024 píxeles y formas rectangulares.
- Ejecución en CPU y en WebGPU desde un único fichero ONNX.
- Composición selectiva: el flujo recomendado solo sustituye los píxeles dentro de la máscara y conserva el resto de la imagen original.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto; no es un modelo de lenguaje.

## Casos de uso

- Limpieza de páginas de manga para traducción: se detecta el texto o los bocadillos, se genera una máscara binaria y el modelo rellena esas zonas con el fondo de la ilustración, dejando la página lista para insertar el texto traducido. Es el caso de uso principal y el que motiva la integración con herramientas como BallonsTranslator.
- Edición de imágenes en el navegador: al ejecutarse con ONNX Runtime WebGPU, permite ofrecer una función de "borrar objeto" o "quitar texto" en una aplicación web sin enviar la imagen a un servidor ni depender de Python.
- Preprocesado por lotes en Node.js: con `onnxruntime-node 1.31.1` se puede montar un pipeline que procese capítulos completos, aplicando máscaras generadas por un detector de texto y ejecutando el inpainting en CPU.
- Restauración de scans: reparar manchas, sellos de agua o artefactos de escaneo en ilustraciones, usando máscaras manuales o semiautomáticas.
- Creación de datasets de entrenamiento: generar pares imagen/máscara/resultado para entrenar o evaluar otros modelos de inpainting o de detección de texto en manga.
- Herramientas de escritorio ligeras: al ser un único ONNX de 204,5 MB, se puede empaquetar en aplicaciones de escritorio con backend ONNX Runtime sin arrastrar una instalación de PyTorch.
- Prototipado rápido de investigación: comparar resultados del modelo frente a la implementación PyTorch original con una diferencia máxima medida de 0,0342/255 por canal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una comparación de fidelidad numérica frente a la implementación original en PyTorch: en 30 escenarios sobre CPU y WebGPU, el error máximo por canal fue de aproximadamente 0,0342/255, sin garantía de identidad bit a bit entre hardware. No hay datos de latencia, throughput ni métricas de calidad de inpainting (PSNR, SSIM, FID) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El fichero pesa 204,5 MB en FP32, por lo que el consumo de memoria es moderado, pero no se publican cifras exactas.
- GPU recomendadas: no se especifican modelos concretos. El modelo está preparado para WebGPU, por lo que puede ejecutarse en GPUs integradas y dedicadas compatibles con dicho backend en navegador.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime con execution provider `cpu` o `webgpu`; el autor recomienda `onnxruntime-node 1.31.1`. WebGPU mantiene un fallback a CPU para cálculos auxiliares de coeficientes y formas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto / resolución | Notas |
|---|---|---|---|---|---|
| neavo/LaMa-Large-ONNX-WebGPU-FP32 | LaMa especializado en manga, exportado a ONNX | ONNX FP32, 204,5 MB | MIT | Tamaños dinámicos 64–1024 px | Ejecución CPU/WebGPU, un solo fichero |
| dreMaz/AnimeMangaInpainting | Modelo base original de inpainting manga/anime | Pesos PyTorch | no disponible en la información | no disponible | Requiere stack Python/PyTorch |
| LaMa original (Large Mask Inpainting) | Inpainting generalista | Pesos PyTorch | no disponible en la información | no disponible | No especializado en manga |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Especializado en manga y anime; su comportamiento en fotografías o ilustraciones de otro estilo no está documentado.
- Solo se distribuye en FP32; no hay versiones cuantizadas en este repositorio.
- El resultado puede no ser idéntico bit a bit entre hardware distinto, aunque la desviación reportada es pequeña (0,0342/255 máximo por canal).
- Requiere preprocesado: rellenar dimensiones a múltiplos de 64, recortar después y componer solo los píxeles dentro de la máscara.
- La calidad depende de la máscara: máscaras mal ajustadas o demasiado grandes pueden producir artefactos.
- Riesgo de alucinación visual: el modelo inventa contenido en las regiones enmascaradas, por lo que puede introducir tramas o líneas plausibles pero incorrectas.
- Licencia MIT según la model card del modelo original; conviene verificar los términos del modelo base `dreMaz/AnimeMangaInpainting` antes de uso comercial.
- El repositorio solo contiene el ONNX y las instrucciones; no se ofrece soporte ni garantías de mantenimiento.
- No hay información sobre sesgos, idiomas ni métricas de calidad publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neavo/LaMa-Large-ONNX-WebGPU-FP32
- Modelo base: https://huggingface.co/dreMaz/AnimeMangaInpainting
- Repositorio de referencia de la exportación (BallonsTranslator): https://github.com/dmMaze/BallonsTranslator
- Referencia externa sobre inpainting en navegador con ONNX Runtime WebGPU: https://prompta.ch/bild-prompts
