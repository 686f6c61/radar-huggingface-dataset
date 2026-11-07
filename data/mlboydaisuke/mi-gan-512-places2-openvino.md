# mlboydaisuke/MI-GAN-512-Places2-OpenVINO

## Resumen

MI-GAN-512-Places2-OpenVINO es una conversión del modelo de inpainting MI-GAN (resolución 512 px, entrenado sobre Places2) a formatos optimizados para hardware Intel: ONNX (opset 17), OpenVINO IR con pesos fp32 y un blob precompilado para la NPU integrada de Intel. El modelo original es un GAN de image-to-image especializado en rellenar regiones enmascaradas de una imagen, y esta versión lo hace ejecutable en CPU, iGPU y NPU de Intel sin necesidad de GPU dedicada.

El autor del repo es mlboydaisuke, que parte del modelo ya cuantizado litert-community/MI-GAN-512-Places2-LiteRT, a su vez derivado del MI-GAN original de Picsart AI Research. El interés práctico está en la latencia: en una NPU Intel Core Ultra 9 386H el blob precompilado ejecuta una pasada en 36,15 ms, y en la iGPU Intel se miden 20,41 ms, cifras que permiten inpainting interactivo en portátiles sin GPU discreta.

El repositorio es pequeño (0,2 GB) y contiene únicamente artefactos de inferencia, no pesos entrenables en formato estándar. La licencia es MIT. No se publican datos de arquitectura interna, número de parámetros ni composición del dataset de entrenamiento más allá de la referencia a Places2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN de image-to-image (inpainting); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible (el ONNX fp16 ocupa 28.344.160 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (ONNX de origen), fp32 (pesos del IR de OpenVINO), blob precompilado para NPU |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob de NPU precompilado |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del generador ni del discriminador de MI-GAN. Se sabe que es un modelo GAN de inpainting a 512x512 píxeles entrenado sobre Places2, un dataset de escenas naturales y urbanas ampliamente usado en tareas de image-to-image. El modelo base inmediato es la versión LiteRT ya cuantizada (litert-community/MI-GAN-512-Places2-LiteRT), y el upstream citado en la model card es Picsart-AI-Research/MI-GAN.

El trabajo técnico de este repositorio es la conversión y el empaquetado, no el entrenamiento: se convierte el `.tflite` a ONNX con tf2onnx 1.17.0 (opset 17), se genera un IR de OpenVINO con pesos fp32 y se compila un blob específico para la NPU Intel con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841. La verificación de salida compara cada ejecución contra la referencia en CPU fp32 con ONNX Runtime, exigiendo coseno ≥ 0,99 y ausencia de NaN/Inf; los resultados reportados alcanzan coseno ≥ 0,9999 en NPU, iGPU y RTX 5080 Laptop.

## Capacidades

- Inpainting de imágenes a 512x512: rellena regiones enmascaradas con contenido coherente con el contexto visual.
- Image-to-image condicionado por máscara: la entrada es la imagen con la zona a reconstruir y la máscara asociada.
- Ejecución en hardware Intel sin GPU dedicada: NPU (Intel AI Boost), iGPU y CPU.
- Compatibilidad con múltiples runtimes: OpenVINO nativo, ONNX Runtime con OpenVINO EP y ONNX Runtime con CUDA EP.
- Blob de NPU precompilado que elimina el coste de compilación en carga (0,10 s frente a 35,56 s compilando el ONNX en el arranque de sesión).
- No soporta tool calling, agentes, texto ni multimodalidad: es exclusivamente un modelo de visión para inpainting.

## Casos de uso

- Edición fotográfica interactiva en portátil: eliminar objetos no deseados de una foto y rellenar el hueco con la NPU Intel en unos 36 ms por pasada, lo que permite previsualización casi en tiempo real mientras el usuario ajusta la máscara.
- Restauración de imágenes con regiones dañadas: recuperar zonas con arañazos, marcas de agua o píxeles corruptos en digitalizaciones, usando la iGPU (20,41 ms) para procesar lotes sin ocupar la CPU.
- Preprocesado en pipelines de visión por computador: tapar caras, matrículas o datos sensibles antes de alimentar otros modelos, ejecutando el inpainting en la NPU y liberando la GPU para el modelo principal.
- Limpieza de imágenes para e-commerce: eliminar fondos no deseados, sombras o elementos accesorios en fotos de producto a 512x512, con despliegue en equipos de oficina sin GPU dedicada.
- Prototipado en dispositivos de borde: validar flujos de inpainting en portátiles con Core Ultra antes de portar a móvil, dado que el mismo ONNX se ha perfilado también en NPU Snapdragon X2 Elite (18,50 ms) y Galaxy S26 (17,12 ms).
- Herramienta de anotación y aumento de datos: generar variantes de imágenes con regiones ocluidas para entrenar modelos de detección robustos a oclusiones, aprovechando el bajo coste por inferencia en CPU/GPU integrada.
- Integración en aplicaciones de escritorio Windows: al ser ONNX y OpenVINO, se puede empaquetar en apps nativas que usen la NPU del equipo sin depender de CUDA ni de drivers de GPU discretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, PSNR, SSIM) en la información disponible. Sí se publican medidas de latencia y verificación de salida:

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 36,15 | 0,10 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 36,68 | 35,56 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 20,41 | 1,17 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 22,65 | 1,37 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 25,67 | 1,51 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 799,16 | 0,42 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 18,50 | 0,39 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 72,97 (14 capas en CPU) | 23,73 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN precompilado | `.onnx` | 17,12 | 0,20 | no comparado |

Medición realizada en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación de red), con mediana de 30 ejecuciones temporizadas tras 5 de calentamiento, entrada y salida en numpy. El ONNX contra el `.tflite` original también pasa con coseno ≥ 0,9999.

## Comparativa con modelos similares

| Modelo | Formato / runtime | Resolución | Licencia | Notas |
|---|---|---|---|---|
| mlboydaisuke/MI-GAN-512-Places2-OpenVINO | ONNX, OpenVINO IR, blob NPU | 512x512 | MIT | Optimizado para NPU/CPU/iGPU Intel; 36,15 ms en NPU |
| litert-community/MI-GAN-512-Places2-LiteRT | LiteRT / TFLite | 512x512 | MIT | Modelo base inmediato; pensado para Android y edge |
| mlx-community/MI-GAN-512-places2-fp16 | safetensors (MLX) | 512x512 | no disponible | 14,8 MB en safetensors; orientado a Apple Silicon |
| Picsart-AI-Research/MI-GAN | pesos originales (no repo HF) | 512x512 | no disponible | Modelo upstream de investigación |

No se dispone de datos de calidad comparada (FID/PSNR) entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia y plataforma objetivo.

## Limitaciones y advertencias

- El blob de NPU está compilado para OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y hay que recompilar el IR.
- El modelo está especializado en escenas de Places2; el inpainting de rostros, texto o estructuras muy específicas puede producir resultados poco realistas.
- Resolución fija de 512x512: imágenes mayores requieren parcheado o reescalado, con posible pérdida de coherencia en las uniones.
- No hay información sobre sesgos del dataset Places2 en esta ficha; Places2 tiene sobrerrepresentación de escenas de países occidentales y zonas urbanas.
- Riesgo de artefactos y alucinación visual: el GAN puede inventar contenido plausible pero incorrecto en regiones grandes o ambiguas.
- La licencia MIT se hereda del modelo LiteRT base; conviene verificar los términos del upstream Picsart-AI-Research/MI-GAN antes de uso comercial, ya que la model card no detalla su licencia.
- El repositorio no incluye scripts de preprocesado ni postprocesado; el usuario debe construir la máscara y normalizar la entrada según las formas declaradas por el runtime.
- No apto para tareas de texto, razonamiento, código ni agentes: es exclusivamente un modelo de visión para inpainting.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/MI-GAN-512-Places2-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/MI-GAN-512-Places2-LiteRT
- Repositorio de scripts y mediciones (windows-zoo): https://github.com/john-rocky/windows-zoo
- Variante MLX: https://huggingface.co/mlx-community/MI-GAN-512-places2-fp16
- Upstream citado (MI-GAN, Picsart AI Research): `Picsart-AI-Research/MI-GAN` (no es un repositorio de Hugging Face; sin URL disponible en la información proporcionada)
