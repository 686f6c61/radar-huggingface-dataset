# aoiandroid/parakeet-tdt-0.6b-v3-coreml-ios

## Resumen

El modelo `parakeet-tdt-0.6b-v3-coreml-ios` es una compilación específica para dispositivos Apple del sistema de reconocimiento automático de voz (ASR) Parakeet TDT 0.6B v3 desarrollado por NVIDIA, convertido a Core ML por el usuario aoiandroid como parte del ecosistema TranslateBlue y FluidAudio. Su objetivo es ofrecer transcripción de voz multilingüe offline, privada y de baja latencia directamente en el dispositivo, sin depender de servicios en la nube.

El modelo base Parakeet TDT v3 (Token Duration Transducer) tiene 600 millones de parámetros y soporta 25 idiomas europeos, con puntuación y capitalización nativas y predicción de marcas temporales a nivel de palabra. Esta variante iOS compila los paquetes `.mlpackage` a `.mlmodelc`, con especialización del Neural Engine (ANE) que se realiza localmente en cada dispositivo. Requiere iOS 17 o superior y está optimizada para Apple Silicon.

La relevancia de este modelo radica en su capacidad para ejecutar ASR multilingüe de calidad en dispositivos móviles sin conexión, lo que resuelve problemas de privacidad, latencia y coste de infraestructura en aplicaciones de transcripción y dictado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT v3 (Token Duration Transducer) |
| Parámetros totales | 600 millones (0,6B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No especificado (compilado a Core ML `.mlmodelc`) |
| Idiomas soportados | 25 idiomas europeos |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodelc`, compilado desde `.mlpackage`) |

## Arquitectura y entrenamiento

Parakeet TDT v3 utiliza la arquitectura Token Duration Transducer, una variante del paradigma Transducer que incorpora la duración de los tokens como información auxiliar durante el decodificado. Con 600 millones de parámetros, el modelo está diseñado para ofrecer un equilibrio entre precisión y eficiencia computacional, siendo más pequeño que alternativas como Canary-1B-v2 pero manteniendo una precisión competitiva en ASR multilingüe.

El modelo fue desarrollado por NVIDIA y presentado en el artículo «Canary-1B-v2 & Parakeet-TDT-0.6B-v3: Efficient and High-Performance...» (arXiv:2509.14128). Soporta 25 idiomas europeos e incluye puntuación y capitalización nativas, así como predicción de marcas temporales a nivel de palabra. Esta variante Core ML ha sido compilada por aoiandroid para plataformas Apple, transformando los pesos originales a formato `.mlmodelc` con especialización del Neural Engine que se realiza localmente en cada dispositivo.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe en 25 idiomas europeos.
- Transcripción offline completa, sin necesidad de conexión a red.
- Puntuación y capitalización nativas integradas en la salida.
- Predicción de marcas temporales (timestamps) a nivel de palabra.
- Baja latencia optimizada para ejecución en dispositivos Apple.
- Especialización del Neural Engine (ANE) realizada localmente en el dispositivo.
- Integración con el framework Swift FluidAudio para aplicaciones de producción.
- Compatible con iOS 17+ y macOS 14+ (Apple Silicon recomendado).

## Casos de uso

- Transcripción por lotes de archivos de audio completos en macOS e iOS: el modelo procesa ficheros de audio sin conexión, aprovechando la arquitectura Transducer para manejar secuencias largas de forma eficiente.
- Aplicaciones de dictado y toma de notas locales: la baja latencia y el funcionamiento offline garantizan privacidad total, ya que el audio nunca abandona el dispositivo.
- ASR integrado en aplicaciones de producción mediante el framework FluidAudio Swift: los desarrolladores pueden incorporar transcripción multilingüe en sus apps iOS sin depender de servicios en la nube.
- Traducción de voz a texto en la app TranslateBlue: el modelo actúa como motor de transcripción previo a la traducción, soportando 25 idiomas europeos.
- Asistentes de voz y comandos por voz en dispositivos móviles: la ejecución local reduce la latencia de respuesta y elimina el coste de infraestructura por petición.
- Accesibilidad: transcripción de reuniones, clases o conferencias en tiempo real o diferido para personas con discapacidad auditiva, con marcas temporales para sincronizar con el audio.
- Periodismo y documentación: transcripción de entrevistas y grabaciones de campo en múltiples idiomas europeos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible. El modelo se presenta en el artículo arXiv 2509.14128 junto con Canary-1B-v2, donde se describe como «más pequeño pero más preciso» que alternativas comparables, pero los datos numéricos concretos de evaluación no están disponibles en la documentación consultada.

## Requisitos de hardware

- Dispositivos Apple con iOS 17 o superior.
- macOS 14 o superior con Apple Silicon recomendado.
- Tamaño del repositorio: 1,6 GB (pesos compilados a Core ML).
- Memoria unificada estimada: aproximadamente 1,2-1,6 GB para los pesos en punto flotante de 16 bits (estimación basada en el tamaño del repositorio; no confirmado oficialmente).
- Aceleración mediante Neural Engine (ANE) de Apple, con especialización local en cada dispositivo.
- No requiere GPU dedicada ni servidor: el despliegue es exclusivamente on-device.
- Opciones de despliegue: integración directa en apps iOS/macOS mediante Core ML y el framework FluidAudio Swift.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 (Core ML iOS) | 600M | 25 europeos | Core ML (`.mlmodelc`) | MIT | HuggingFace |
| Parakeet TDT 0.6B v2 | 600M | Solo inglés | Varios (NVIDIA NGC) | No especificada | NVIDIA NGC |
| Parakeet TDT 0.6B v3 (original) | 600M | 25 europeos | Varios (NVIDIA NGC) | No especificada | NVIDIA NGC |
| Canary-1B-v2 | 1B | 25 europeos | Varios | No especificada | NVIDIA NGC |

La variante Core ML para iOS se diferencia de los modelos originales de NVIDIA en su formato compilado específico para Apple, su licencia MIT y su optimización para ejecución on-device con Neural Engine.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR: no realiza generación de texto, traducción ni otras tareas de lenguaje.
- Soporte limitado a 25 idiomas europeos: no cubre idiomas de otras regiones.
- Requiere iOS 17+ o macOS 14+: no compatible con versiones anteriores de los sistemas operativos Apple.
- La especialización ANE se realiza localmente en cada dispositivo, lo que puede implicar un proceso de compilación adicional en el primer uso.
- El modelo está orientado a dispositivos Apple: no puede ejecutarse en otras plataformas (Android, Windows, Linux) sin una conversión adicional.
- No se han publicado datos sobre latencia específica ni consumo de batería en dispositivos reales.
- El repositorio tiene 0 descargas y 0 likes: se trata de una publicación reciente sin validación comunitaria.
- No se dispone de información sobre el dataset de entrenamiento específico ni sobre posibles sesgos en el reconocimiento de acentos o dialectos.

## Enlaces

- Repositorio HuggingFace (variante iOS): https://huggingface.co/aoiandroid/parakeet-tdt-0.6b-v3-coreml-ios
- Repositorio fuente Core ML: https://huggingface.co/aoiandroid/parakeet-tdt-0.6b-v3-coreml
- Colección NVIDIA NGC Parakeet TDT 0.6B: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- Artículo arXiv (Canary-1B-v2 y Parakeet-TDT-0.6B-v3): https://arxiv.org/html/2509.14128v1
