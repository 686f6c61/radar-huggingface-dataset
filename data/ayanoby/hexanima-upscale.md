# ayanoby/hexanima-upscale

## Resumen

HexAnima Upscale es un paquete de dos artefactos de inferencia precompilados para el acelerador NPU Hexagon de Qualcomm, derivados de los generadores de superresolución Real-ESRGAN. No se distribuyen pesos en formato PyTorch ni ONNX, sino context binaries de QNN (Qualcomm AI Engine Direct) listos para ejecutarse en el HTP (Hexagon Tensor Processor) de la generación V69, presente en los SoC Snapdragon 8 Gen 1 y 8+ Gen 1. El autor, ayanoby, los publica como dependencia del proyecto HexAnima, una aplicación Android de upscaling de imágenes.

El modelo resuelve un problema muy concreto: ejecutar Real-ESRGAN x4 en la NPU de un teléfono Android sin necesidad de conversión por parte del usuario. Cada contexto acepta un tile fijo de 128x128 píxeles y devuelve 512x512 píxeles; la aplicación se encarga de trocear imágenes mayores con solapamientos mezclados. Se ofrecen dos variantes: una orientada a fotografía (RealESRGAN_x4plus, RRDBNet de 23 bloques) y otra orientada a anime (RealESRGAN_x4plus_anime_6B, RRDBNet de 6 bloques).

La relevancia es acotada pero clara para desarrollo móvil: demuestra un pipeline completo PyTorch → ONNX → QNN fp16 → context binary para una NPU concreta, con una fidelidad declarada de PSNR 44,7 dB frente a la salida PyTorch en el propio dispositivo. No es un modelo de propósito general ni un upscaler portable: los binarios solo funcionan en esa generación de chip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (Real-ESRGAN); dos variantes: 23 bloques (foto) y 6 bloques (anime) |
| Parametros totales | no disponible (no se publica el recuento; el tamaño de los binarios es de 38.706.040 B y 10.578.456 B respectivamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de un tile de 128x128 px, salida de 512x512 px |
| Tipos de cuantizacion | fp16 (QNN HTP, contexto compilado para Hexagon V69) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause (Copyright (c) 2021, Xintao Wang) |
| Formato de pesos | context binary de QNN (`.bin`), no safetensors ni GGUF ni ONNX portable |

## Arquitectura y entrenamiento

La red subyacente es RRDBNet, la arquitectura de Real-ESRGAN, con bloques residuales densos y escalado x4 mediante píxel shuffle. La variante `RealESRGAN_x4plus` emplea 23 bloques RRDB y está pensada para fotografías; la variante `RealESRGAN_x4plus_anime_6B` emplea 6 bloques y está especializada en ilustración y anime. Los pesos de origen son `RealESRGAN_x4plus.pth` (sha256 4fa0d389...82f1) y `RealESRGAN_x4plus_anime_6B.pth` (sha256 f872d837...99da).

El autor no ha entrenado ni ajustado los modelos: son copias convertidas de los pesos originales. La cadena de conversión documentada es PyTorch → ONNX (opset 17, tile fijo de 128 px) → `qairt-converter` en fp16 → `qnn-context-binary-generator` con target v69 y modo burst. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que se trata de un modelo de visión entrenado por el equipo original de Real-ESRGAN. La innovación técnica relevante es la compilación AOT para el HTP: el grafo queda fijado a una forma de entrada concreta (128x128), lo que habilita la ejecución en NPU pero impide el uso dinámico.

## Capacidades

- Superresolución x4 de imágenes: cada inferencia transforma un tile de 128x128 px en 512x512 px.
- Upscaling orientado a fotografía con la variante de 23 bloques.
- Upscaling orientado a ilustración y anime con la variante de 6 bloques.
- Procesamiento de imágenes grandes mediante mosaico con solapamientos mezclados, gestionado por la app HexAnima y no por el modelo.
- Ejecución en la NPU Hexagon V69 en fp16, sin intervención de la CPU para el cómputo principal.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni procesamiento de lenguaje.
- No dispone de capacidades multilingües ni de modalidad de audio o vídeo.

## Casos de uso

- Restauración de fotos en Android: la variante `kup_photo_t128.bin` permite aumentar la resolución de imágenes capturadas o descargadas directamente en la NPU del Snapdragon 8 Gen 1 / 8+ Gen 1, reduciendo el consumo energético frente a una ejecución en CPU o GPU.
- Mejora de ilustraciones y capturas de anime: la variante `kup_anime_t128.bin`, con solo 6 bloques RRDB, está especializada en líneas limpias y colores planos, y su menor tamaño (10,5 MB) reduce el tiempo de carga del contexto.
- Previsualización de imágenes en galerías móviles: el tile fijo de 128 px y la salida de 512 px permiten generar miniaturas de alta calidad por bloques antes de mostrar la imagen completa.
- Integración en aplicaciones de edición fotográfica: el pipeline de mosaico con solapamientos que implementa HexAnima puede reutilizarse para upscalear imágenes de cualquier resolución respetando los límites de memoria de la NPU.
- Referencia para portar modelos de visión a QNN: el repositorio sirve como ejemplo reproducible de la cadena PyTorch → ONNX opset 17 → `qairt-converter` fp16 → `qnn-context-binary-generator` para Hexagon V69.
- Procesamiento por lotes en dispositivo: al ser context binaries independientes, se pueden cargar y descargar según la tarea (foto o anime) sin recompilar, lo que facilita la selección dinámica de variante en una app.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| PSNR frente a la salida PyTorch en el dispositivo | 44,7 dB |

No se han publicado otros resultados de benchmarks (por ejemplo, comparativas formales con otros upscalers, latencias o throughput) en la información disponible.

## Requisitos de hardware

- NPU Hexagon V69 exclusivamente: Snapdragon 8 Gen 1 y Snapdragon 8+ Gen 1. Los binarios no se ejecutan en otras generaciones de Hexagon ni en GPU, CPU o NPU de otros fabricantes.
- No son pesos ONNX ni PyTorch portables; requieren el runtime QNN y el contexto compilado para v69.
- VRAM/RAM estimada: no disponible; el tamaño de los artefactos es de 38,7 MB (foto) y 10,6 MB (anime), a lo que hay que sumar el búfer de entrada de 128x128 px fp16 y la salida de 512x512 px.
- No cabe ni está pensado para GPU de escritorio (A100, H100, RTX 4090); esas plataformas requerirían los pesos originales de Real-ESRGAN.
- Opciones de despliegue: únicamente a través de QNN en Android, tal como lo hace la app HexAnima. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada/salida | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| HexAnima Upscale (este) | RRDBNet 23 y 6 bloques | tile 128x128 → 512x512 | context binary QNN fp16 | BSD-3-Clause | Hexagon V69 (Snapdragon 8 Gen 1 / 8+ Gen 1) |
| Real-ESRGAN x4plus (original) | RRDBNet 23 bloques | dinámica | PyTorch `.pth` | BSD-3-Clause | CPU/GPU genérica |
| Real-ESRGAN x4plus_anime_6B (original) | RRDBNet 6 bloques | dinámica | PyTorch `.pth` | BSD-3-Clause | CPU/GPU genérica |
| SwinIR / otros upscalers | Transformer / CNN | dinámica | PyTorch, ONNX | variable | CPU/GPU genérica |

La comparativa directa con otros upscalers en NPU móvil no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los binarios solo funcionan en Hexagon V69 (Snapdragon 8 Gen 1 y 8+ Gen 1); en cualquier otro hardware son inutilizables.
- La entrada está fijada a tiles de 128x128 px; no admiten resolución dinámica y obligan a implementar mosaico con solapamientos en la aplicación.
- No son pesos generales: no se pueden cargar en PyTorch, ONNX Runtime, TensorFlow Lite ni otros runtimes sin volver a convertir desde los pesos originales.
- Al ser copias convertidas de Real-ESRGAN, heredan sus sesgos y artefactos: sobrealisado, hallucinación de texturas en zonas de bajo detalle y comportamiento variable con rostros o texto pequeño.
- Riesgo de alucinación visual: el modelo genera detalle plausible pero no necesariamente fiel en caras, texto y patrones finos.
- La licencia BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright de Xintao Wang y no permite usar el nombre de los titulares para promocionar derivados sin permiso.
- No hay información sobre latencia, consumo energético ni comportamiento térmico en el dispositivo; conviene medirlos antes de integrarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ayanoby/hexanima-upscale
- Repositorio de la app HexAnima: https://github.com/ayanoby/hexanima
- Real-ESRGAN (proyecto original): no disponible en la información proporcionada
- Documentación de Qualcomm AI Engine Direct (QNN): no disponible en la información proporcionada
