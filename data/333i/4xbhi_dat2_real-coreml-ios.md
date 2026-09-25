# 333i/4xBHI_dat2_real-coreml-ios

## Resumen

4xBHI_dat2_real para Core ML es una conversión a formato Core ML del modelo de superresolución y restauración fotográfica 4xBHI_dat2_real de Philip Hofmann, publicada por el usuario 333i. No se modifican los pesos originales: el repositorio únicamente añade la exportación a Core ML para que el modelo pueda ejecutarse de forma nativa en dispositivos iOS y macOS con Neural Engine, GPU o CPU. La arquitectura es DAT, un transformer de agregación para superresolución, con un factor de escala fijo de 4x y una entrada de 512x512 píxeles que produce una salida de 2048x2048 píxeles.

El modelo resuelve la restauración de imágenes degradadas por ruido realista, desenfoque leve y recompresión JPEG y WebP, un escenario habitual en fotografías descargadas de la web, en capturas reenviadas por aplicaciones de mensajería o en archivos digitalizados. Frente a la versión original en PyTorch, esta conversión aporta inferencia totalmente local en el dispositivo, sin envío de imágenes a servidores externos, y con integración directa en Vision mediante `VNPixelBufferObservation`.

La relevancia actual del repositorio es fundamentalmente práctica: es una de las pocas conversiones Core ML publicadas para un modelo de restauración DAT de 4x y está pensada para integrarse en aplicaciones iOS 17 o macOS 14 o superiores. Se trata de una publicación muy reciente, sin descargas ni valoraciones registradas en el momento de redactar esta ficha, y con un tamaño de repositorio de 0,1 GB que incluye tanto el programa Core ML como la versión ya compilada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DAT (transformer de agregación para superresolución) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 512x512 píxeles por tesela, salida de 2048x2048) |
| Tipos de cuantización | fp16 como ML Program; no se ofrecen otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML: `4xBHI_dat2_real_512.mlpackage` (ML Program fp16) y `4xBHI_dat2_real_512_coreml_compiled.zip` (`.mlmodelc` compilado más `model.json`) |

Datos adicionales de la interfaz del modelo:

| Parámetro | Valor |
|---|---|
| Entrada | `image`, RGB, 512 x 512 |
| Salida | `upscaled`, RGB, 2048 x 2048 |
| Factor de escala | 4x |
| Precisión | fp16 ML Program |
| Sistema mínimo | iOS 17 / macOS 14 |
| Unidades de cómputo | todas (CPU, GPU y Neural Engine) |
| Procesado de imágenes grandes | teselado con solapamiento de 512 x 512 y mezcla con feathering |
| Modelo base | Phips/4xBHI_dat2_real |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es DAT, un transformer de agregación aplicado a superresolución de imagen. La conversión a Core ML se realizó con coremltools 9.0 a partir del checkpoint original cargado mediante spandrel, y no altera los pesos. El modelo se ha envuelto de forma que la entrada sea una imagen RGB escalada al rango [0, 1] y la salida se recorte y reescale de vuelta a [0, 255] como imagen RGB, lo que permite que Vision devuelva directamente una `VNPixelBufferObservation`. El programa Core ML trabaja en fp16 y puede ejecutarse sobre CPU, GPU y Neural Engine.

El entrenamiento del modelo original, del que esta conversión hereda íntegramente los pesos, se realizó sobre el dataset BHI del autor con 390.035 teselas de entrenamiento, empleando un subconjunto de baja resolución degradado para el aprendizaje. El modelo está especializado en imágenes web y realistas: tolera ruido realista, cierto desenfoque realista y recompresión WebP y JPEG. No se documenta en la información disponible si hubo fases de RLHF, DPO u otras técnicas de alineación, ni el número total de tokens o de iteraciones de entrenamiento, algo que en cualquier caso no aplica del mismo modo a un modelo de restauración de imagen.

## Capacidades

- Superresolución de imagen con factor fijo de 4x: convierte una tesela de entrada de 512x512 píxeles en una salida de 2048x2048 píxeles.
- Restauración de ruido realista: el modelo base fue entrenado específicamente para degradaciones de ruido de tipo fotográfico.
- Corrección de artefactos de compresión JPEG y WebP, incluyendo recompresión sucesiva.
- Recuperación parcial de desenfoque realista leve.
- Procesado de imágenes mayores que 512x512 mediante teselado con solapamiento y mezcla con feathering para evitar costuras visibles.
- Inferencia totalmente local en el dispositivo, sin conexión a red ni envío de datos a servidores.
- Ejecución sobre CPU, GPU y Neural Engine en iOS 17 y macOS 14 o superiores.
- Integración directa con Vision: la salida se puede consumir como `VNPixelBufferObservation`.
- Carga directa mediante `MLModel(contentsOf:)` usando el `.mlmodelc` precompilado, o mediante coremltools o Xcode usando el `.mlpackage`.

No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente, multilingüismo ni modos de pensamiento: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Aplicación iOS de restauración fotográfica: el modelo puede integrarse en una app de retoque que cargue el `.mlmodelc` con `MLModel(contentsOf:)` y procese fotografías antiguas o degradadas directamente en el dispositivo, sin subir la imagen a ningún servidor, con la ventaja de privacidad que eso supone.
- Mejora de imágenes recibidas por aplicaciones de mensajería: las fotografías reenviadas varias veces por WhatsApp u otras apps acumulan recompresión WebP y JPEG; el modelo está entrenado específicamente para ese tipo de degradación y puede devolver una versión de 4x más limpia.
- Recuperación de miniaturas y material de archivo web: para imágenes de baja resolución descargadas de la web, el pipeline de teselado con feathering permite ampliar una imagen grande dividiéndola en teselas de 512x512 sin costuras visibles.
- Preprocesado en pipelines de fotografía en macOS: una herramienta de escritorio puede invocar el modelo a través de Core ML en un flujo por lotes, ampliando y restaurando carpetas completas de imágenes antes de su publicación o archivado.
- Ampliación para impresión de pequeño formato: al multiplicar por 4 la resolución, una imagen de 512x512 pasa a 2048x2048, suficiente para reproducir copias de tamaño reducido con mayor densidad de píxeles que el original.
- Optimización de catálogos de comercio electrónico: las fichas de producto suelen contener imágenes heredadas de baja resolución y con compresión agresiva; el modelo puede normalizarlas a 4x de forma automática antes de subirlas al catálogo.
- Edición por lotes en apps de retoque para iOS y iPadOS: la inferencia en Neural Engine libera la CPU para la interfaz, de modo que la app puede procesar una imagen en segundo plano mientras el usuario sigue trabajando.
- Restauración de capturas de pantalla y documentos fotografiados con ruido: el modelo corrige ruido y artefactos de compresión en capturas que se quieren reutilizar en documentación o presentaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PSNR sobre Set5, Set14, Urban100, DIV2K u otros conjuntos de referencia) en la información disponible. Los únicos datos de rendimiento publicados son los de la verificación de la conversión y los de latencia en hardware de Apple:

| Métrica | Valor | Contexto |
|---|---|---|
| PSNR frente a la referencia en PyTorch | 58,2 dB | Sobre una tesela de prueba de 512x512 |
| Diferencia máxima por canal | 3/255 | Respecto a la referencia en PyTorch |
| Latencia por tesela | ~875 ms | Mac con chip de la serie M, todas las unidades de cómputo activadas |
| Rendimiento derivado | ~1,14 teselas/s | Cálculo derivado de la latencia medida |
| Tiempo estimado para una imagen de 2048x2048 de entrada | ~14 s | Estimación derivada de 16 teselas a 875 ms, sin contabilizar el solapamiento ni el feathering |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 0,1 GB e incluye el `mlpackage` y el zip compilado, por lo que el peso del modelo es inferior a 100 MB en fp16. En iOS y macOS la inferencia se ejecuta sobre memoria unificada o sobre la GPU y el Neural Engine, sin requisitos de VRAM dedicada documentados.
- GPU y aceleradores recomendados: Neural Engine de los chips Apple A17 o superior y de la serie M; GPU integrada de los mismos SoC; CPU como alternativa de respaldo. No se documenta soporte para GPU de escritorio NVIDIA o AMD, ya que el formato Core ML está orientado al ecosistema Apple.
- Cabe en hardware de consumo: sí, en cualquier iPhone o iPad compatible con iOS 17, y en cualquier Mac con macOS 14 o superior. El modelo es pequeño y está diseñado explícitamente para ejecución en dispositivo.
- Opciones de despliegue: `MLModel(contentsOf:)` con el `.mlmodelc` precompilado más `model.json`; coremltools o Xcode con el `.mlpackage`; framework Vision para consumir la salida como `VNPixelBufferObservation`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: aproximadamente 875 ms por tesela de 512x512 de entrada en un Mac con chip de la serie M con todas las unidades de cómputo activadas, lo que equivale a unas 1,14 teselas por segundo. No hay mediciones publicadas para iPhone ni iPad.

## Comparativa con modelos similares

La información disponible solo permite comparar esta conversión con el modelo original y con otras variantes del mismo autor, no con cifras de modelos de terceros.

| Modelo | Formato y plataforma | Escala | Degradaciones objetivo | Licencia | Datos públicos |
|---|---|---|---|---|---|
| 333i/4xBHI_dat2_real-coreml-ios | Core ML (fp16), iOS 17 y macOS 14 | 4x | Ruido realista, desenfoque leve, JPEG y WebP | CC-BY-4.0 | PSNR de 58,2 dB frente a la referencia; 875 ms por tesela en Mac serie M |
| Phips/4xBHI_dat2_real | PyTorch, pesos originales | 4x | Ruido realista, desenfoque leve, JPEG y WebP | CC-BY-4.0 | Entrenado con 390.035 teselas del dataset BHI |
| 4xBHI_dat2_multiblur y 4xBHI_dat2_multiblurjpg | PyTorch, publicados en el repositorio del autor | 4x | LR multiescala y compresión JPEG | no disponible | Anunciados el 14/12/2024 |
| Modelos 4x BHI con RealPLKSR y Dysample (multi, multiblur, otf_nn, otf, real) | PyTorch, publicados en el repositorio del autor | 4x | Varias degradaciones según variante | no disponible | Anunciados el 14/12/2024 |
| Otros modelos de superresolución de terceros (Real-ESRGAN, SwinIR, etc.) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Factor de escala fijo de 4x: no permite obtener 2x, 3x u 8x sin recurrir a otro modelo o a un reescalado posterior con pérdida de calidad.
- La entrada está pensada para teselas de 512x512 con solapamiento y feathering; en imágenes grandes pueden aparecer diferencias sutiles en las zonas de unión si el solapamiento no se configura adecuadamente.
- La conversión usa fp16 y la verificación reporta una diferencia máxima por canal de 3/255 respecto a la referencia en PyTorch, por lo que la salida no es bit a bit idéntica al modelo original.
- Requiere iOS 17 o macOS 14 como mínimo, lo que excluye dispositivos y versiones anteriores del sistema.
- El modelo está entrenado sobre el dataset BHI, orientado a imágenes web y realistas; no hay información sobre su comportamiento en dominios como imagen médica, satelital, ilustración o anime, por lo que su uso en esos ámbitos no está respaldado por datos publicados.
- Riesgo de alucinación en el sentido de generación de detalle no presente en la imagen original: como todo modelo de restauración, puede reconstruir texturas o bordes de forma plausible pero incorrecta, algo especialmente relevante en contextos forenses o documentales.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de origen no especificado, puede reproducir las características de ese conjunto, por ejemplo en el tratamiento de tonos de piel o de texturas poco representadas.
- No hay benchmarks publicados sobre conjuntos de referencia estándar de superresolución, por lo que la comparación objetiva con alternativas es limitada.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoría a Philip Hofmann y a mantener el crédito tanto de los pesos originales como de la conversión.
- Publicación muy reciente y sin adopción registrada: cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que no existe validación por parte de la comunidad más allá de la verificación del propio autor de la conversión.
- El repositorio no incluye el código de entrenamiento ni el pipeline de conversión completo, solo los artefactos exportados.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/333i/4xBHI_dat2_real-coreml-ios
- Modelo base original: https://huggingface.co/Phips/4xBHI_dat2_real
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Repositorio con el resto de modelos del autor original: https://github.com/typpos/phhofm-upscale-models
- Documentación de Core ML de Apple: https://developer.apple.com/documentation/coreml
- Repositorio de coremltools: https://github.com/apple/coremltools
