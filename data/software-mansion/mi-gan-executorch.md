# software-mansion/MI-GAN-ExecuTorch

## Resumen

MI-GAN-ExecuTorch es una exportación del modelo de inpainting de imágenes MI-GAN, originalmente desarrollado por Picsart AI Research, empaquetada por Software Mansion como programas `.pte` de ExecuTorch listos para ejecutarse en dispositivos móviles. El modelo resuelve el problema de rellenar regiones enmascaradas (huecos) de una imagen de forma coherente, un caso clásico de generación condicionada por contexto.

La relevancia de esta versión no está en la arquitectura en sí, sino en su despliegue: al estar exportada para [React Native ExecuTorch](https://www.npmjs.com/package/react-native-executorch), permite integrar inpainting de imágenes directamente en apps móviles iOS y Android sin servidor ni conexión a la nube, con pesos de apenas 12-25 MB por variante. Los checkpoints proceden del repositorio upstream `Picsart-AI-Research/MI-GAN` (revisión `2b793c5`), entrenados sobre Places2 (escenas) y FFHQ (rostros).

El modelo opera con entradas fijas de 256x256 o 512x512 píxeles y procesa un par imagen-máscara para devolver el fotograma completo con el hueco rellenado. La licencia es MIT, tanto del modelo upstream como de esta exportación, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN de inpainting (MI-GAN, generador convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | fp16 |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | ExecuTorch `.pte` |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Resoluciones de entrada | 256x256 y 512x512 (fijas) |
| Tamaño de los ficheros `.pte` | 12,4-25,2 MB según backend y resolución |
| Runtime requerido | ExecuTorch v1.4.1 (XNNPACK y Vulkan: librerías nativas v0.10.7-libs o superior) |
| Backends disponibles | CoreML, Vulkan, XNNPACK |

## Arquitectura y entrenamiento

MI-GAN es una GAN (red generativa adversaria) especializada en inpainting de imágenes. Su generador recibe una imagen RGB con huecos y una máscara binaria, y produce el fotograma completo con las regiones dañadas rellenadas. La versión upstream de Picsart AI Research destaca por ser una GAN ligera, diseñada para inferencia rápida en dispositivos con recursos limitados, en contraste con enfoques basados en difusión mucho más pesados. Los detalles exactos del generador (número de capas, parámetros totales) no están disponibles en la model card.

Los checkpoints disponibles proceden de dos datasets: Places2 (escenas generales, en resoluciones 256 y 512) y FFHQ (rostros, en 256). Esta exportación de Software Mansion no reentrena nada: toma los checkpoints upstream (`migan_256_places2.pt`, `migan_512_places2.pt`, `migan_256_ffhq.pt`) y los exporta a programas `.pte` de ExecuTorch en precisión fp16 para tres backends de ejecución en dispositivo. La convención de máscara es `1` = píxel conocido, `0` = hueco, con todas las entradas y salidas en `float32` normalizado a `[0, 1]`.

Un detalle importante: el modelo trabaja sobre recortes cuadrados de tamaño fijo. El recorte alrededor del hueco y la fusión posterior del resultado en la foto a resolución completa deben gestionarse fuera del modelo, siguiendo el enfoque del pipeline ONNX del repositorio upstream (`scripts/create_onnx_pipeline.py`).

## Capacidades

- Inpainting de imágenes: rellenado de huecos arbitrarios definidos por máscara binaria, devolviendo el fotograma completo con la región rellenada.
- Dos dominios especializados: escenas generales (checkpoints Places2) y rostros humanos (checkpoint FFHQ).
- Dos resoluciones de trabajo: 256x256 y 512x512 (solo para escenas; la variante de rostros está disponible en 256).
- Ejecución 100 % en dispositivo (on-device) mediante ExecuTorch, sin dependencia de servidor.
- Soporte de tres backends de aceleración: CoreML (iOS/Apple Silicon), Vulkan (GPU móvil Android y escritorio) y XNNPACK (CPU).
- Integración directa en aplicaciones React Native mediante la librería `react-native-executorch`.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No genera texto ni procesa audio; el pipeline es estrictamente image-to-image.

## Casos de uso

- Edición de fotos en apps móviles: eliminación de objetos no deseados (personas al fondo, carteles, cables) dentro de una app React Native, recortando la región alrededor del objeto, ejecutando el modelo y fusionando el resultado de vuelta en la foto original.
- Relleno de zonas dañadas o con marca de agua: la máscara binaria permite marcar cualquier región a reconstruir, útil para restauración fotográfica básica integrada en el dispositivo sin subir la imagen a un servidor.
- Completado de rostros en apps de retrato: la variante FFHQ 256 está especializada en rostros, adecuada para restaurar partes ocluidas de caras en aplicaciones de edición de retratos.
- Procesamiento con privacidad garantizada: al ejecutarse íntegramente en el dispositivo, es adecuado para apps que manejan fotos personales y no pueden o no quieren enviarlas a la nube (salud, galerías privadas, apps infantiles).
- Funcionamiento offline: con pesos de 12-25 MB, la función de inpainting puede incluirse en la app y funcionar sin conexión, útil en apps de campo con conectividad intermitente.
- Prototipado rápido de features de edición: la integración vía `react-native-executorch` permite a un equipo de React Native añadir inpainting sin escribir código nativo de ML ni gestionar infraestructura de inferencia.
- Preprocesado en pipelines de visión on-device: puede combinarse con otros modelos ExecuTorch (segmentación, detección) para generar máscaras automáticamente y encadenarlas con el inpainting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (FID, LPIPS) ni de latencia para las variantes exportadas. Para métricas del modelo upstream, puede consultarse el paper original de MI-GAN en el repositorio de Picsart AI Research.

## Requisitos de hardware

Este modelo está pensado para ejecutarse en dispositivos móviles, no en servidores:

- No requiere GPU de servidor ni VRAM dedicada: los pesos ocupan entre 12,4 MB (Vulkan/CoreML 256) y 25,2 MB (XNNPACK 512) más la memoria de activación en runtime.
- iOS: variante CoreML fp16, ejecutable en iPhones y iPads modernos mediante el backend CoreML de ExecuTorch.
- Android: variantes Vulkan fp16 (GPU móvil) o XNNPACK fp16 (CPU), compatibles con la mayoría de dispositivos Android recientes.
- Requisitos de software: runtime ExecuTorch v1.4.1; para XNNPACK y Vulkan, librerías nativas de React Native ExecuTorch `v0.10.7-libs` o posteriores. No hay garantía de compatibilidad hacia atrás con runtimes antiguos.
- Despliegue: a través de `react-native-executorch` (descarga del modelo según la [documentación oficial](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models)) o cargando los `.pte` en un runtime ExecuTorch propio, previa lectura de la [nota de compatibilidad](https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md).
- No aplicable: vLLM, llama.cpp, Ollama o TGI (herramientas para modelos de lenguaje, no para programas ExecuTorch de visión).
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de una GAN ligera con pesos de ~13-25 MB, está diseñada para inferencia interactiva en móvil, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | Resolución | Plataforma objetivo | Licencia |
|---|---|---|---|---|---|
| MI-GAN-ExecuTorch (este) | GAN de inpainting | 12,4-25,2 MB (.pte fp16) | 256 / 512 | Móvil (iOS/Android) vía ExecuTorch | MIT |
| MI-GAN upstream (Picsart) | GAN de inpainting | checkpoints `.pt` PyTorch | 256 / 512 | Servidor / escritorio (PyTorch, ONNX) | MIT |
| LaMa | GAN de inpainting (FFC) | ~50-200 MB según checkpoint | Resolución arbitraria (con padding) | Servidor / escritorio | Apache-2.0 (upstream) |
| Stable Diffusion Inpainting | Difusión latente | ~2-5 GB | 512 (ampliable) | GPU de servidor o de gama alta | CreativeML OpenRAIL (restricciones de uso) |

Consideraciones de la comparativa: frente a LaMa, MI-GAN es notablemente más ligero y rápido, a costa de calidad en huecos grandes; frente a los modelos de difusión de inpainting, la diferencia de tamaño es de dos órdenes de magnitud, lo que hace a MI-GAN el único viable on-device en móvil. La ventaja diferencial de esta exportación es la disponibilidad inmediata para React Native, algo que las alternativas no ofrecen de forma empaquetada.

## Limitaciones y advertencias

- Resolución fija: el modelo solo acepta entradas de 256x256 o 512x512. Imágenes a resolución completa requieren un pipeline externo de recorte y fusión, que debe implementarse en la app.
- Dominio de entrenamiento limitado: los checkpoints de Places2 están orientados a escenas y el de FFHQ a rostros; el rendimiento en dominios muy distintos (texto, documentos, ilustraciones) no está garantizado.
- Calidad frente a difusión: al ser una GAN ligera, los resultados en huecos grandes o estructuras complejas suelen ser inferiores a los de modelos de inpainting basados en difusión.
- Artefactos típicos de GAN: posibles texturas inconsistentes o estructuras plausibles pero incorrectas en las regiones rellenadas; conviene validar visualmente en los casos de uso reales.
- Compatibilidad de runtime estricta: los `.pte` requieren ExecuTorch v1.4.1 (y librerías nativas v0.10.7-libs o superiores para XNNPACK/Vulkan); un runtime más antiguo puede fallar al cargarlos y no hay garantía de compatibilidad hacia adelante.
- Convención de máscara específica: `1` = píxel conocido, `0` = hueco; invertir la máscara produce resultados incorrectos.
- Precisión fp16: en backends XNNPACK los ficheros son el doble de grandes (24-25 MB) que en CoreML/Vulkan, lo que puede afectar al tamaño de descarga de la app.
- Sesgos de dataset: al entrenarse sobre Places2 y FFHQ, puede heredar sesgos de composición demográfica y de tipos de escena de esos datasets.
- Licencia: MIT, sin restricciones para uso comercial; no se identifican caveats legales adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/software-mansion/MI-GAN-ExecuTorch
- Repositorio upstream de MI-GAN (Picsart AI Research): https://github.com/Picsart-AI-Research/MI-GAN
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Paper de MI-GAN: no disponible en la informacion proporcionada
