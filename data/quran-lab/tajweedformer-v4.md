# Quran-Lab/tajweedformer-v4

## Resumen

TajweedFormer V4 es un modelo de clasificación de audio de 65 millones de parámetros desarrollado por Quran Lab para evaluar la recitación del Corán según la lectura Hafs 'an 'Asim. El modelo escucha a una persona recitando un ayah conocido y señala, letra por letra, las discrepancias entre la recitación y la lectura esperada, cubriendo aspectos de tajwid como vocales, longitudes (madd), consonantes y qalqalah. Está diseñado como un modelo de streaming que ofrece resultados aproximadamente cada 160 ms durante la recitación, lo que permite una retroalimentación en tiempo real.

La relevancia técnica del modelo reside en su enfoque de despliegue: es un modelo de 65M de parámetros pensado para ejecutarse en el dispositivo (on-device), con SDKs nativos para iOS/macOS (Swift), Android y JVM (Kotlin), navegadores y Node (WebAssembly) y Windows/Linux x86-64 (C API). Todos los SDKs comparten el mismo runtime en C (`tajweedformer-engine`), lo que garantiza resultados idénticos entre plataformas.

Un aspecto crítico es que los pesos no están publicados en Hugging Face. El acceso se gestiona a través del portal de Quran Lab mediante solicitud y aceptación de licencia, y el modelo se distribuye a aplicaciones aprobadas a través de los SDKs. La licencia es la NPL-1.2 (Quran-Lab No-Profit License), que permite uso y desarrollo libres pero prohíbe cobrar por el modelo, por el acceso a él o por cualquier funcionalidad que lo utilice.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de clasificación de audio en streaming) |
| Parámetros totales | 65M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Árabe (ar) |
| Licencia | NPL-1.2 (Quran-Lab No-Profit License 1.2) |
| Formato de pesos | No disponible (distribución vía SDK, no publicados en HF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, capas, mecanismo de atención ni composición del dataset de entrenamiento). Se sabe que es un modelo de clasificación de audio con capacidad de streaming, con una latencia de actualización de resultados de hasta 160 ms, y que opera sobre recitación alineada con un ayah conocido de antemano. El modelo está especializado en la lectura Hafs 'an 'Asim y en la detección de fenómenos de tajwid concretos: vocales (cambio, omisión o adición), longitudes (madd), consonantes (sustitución u omisión) y qalqalah (rebote, en fase experimental y desactivado por defecto).

El modelo se distribuye a través de un runtime en C (`tajweedformer-engine`) que incluye el motor de reconocimiento y el scorer de tajwid. Los SDKs de plataforma (Apple, Android, Web, C) se construyen sobre este runtime, lo que asegura consistencia de resultados entre plataformas. La verificación de integridad de los ficheros del modelo se realiza en el momento de la descarga por parte del SDK. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación de audio de recitación coránica con alineación a un ayah conocido (Hafs 'an 'Asim).
- Detección de errores de vocales: vocal cambiada, omitida o añadida.
- Detección de errores de longitud: vocal corta pronunciada como larga o viceversa.
- Detección de errores de consonantes: sustitución de una consonante por otra u omisión.
- Detección de madd con conteo incorrecto.
- Detección de qalqalah ausente (experimental, desactivada por defecto).
- Salida con la expectativa y lo escuchado para cada marca (flag).
- Procesamiento en streaming con resultados cada 160 ms.
- Ejecución on-device en iOS 15+, macOS 12+, Android 8.0+, JVM de escritorio, navegadores, Node y Windows/Linux x86-64.
- Cuatro presets de sensibilidad configurables desde el portal sin necesidad de publicar una nueva versión de la app: Strict, Balanced (por defecto), Sensitive y Very sensitive.
- Configuración remota de cada comprobación individual desde el portal de Quran Lab.

## Casos de uso

- Aplicaciones de aprendizaje de recitación con retroalimentación en tiempo real: el modelo procesa el audio del usuario mientras recita y devuelve marcas cada 160 ms, lo que permite corregir al instante vocales, longitudes y consonantes sin esperar a terminar el ayah.
- Herramientas de autoevaluación para estudiantes de tajwid: el estudiante recita un ayah conocido y recibe un desglose letra por letra de las discrepancias, con la expectativa y lo escuchado, lo que facilita la práctica autónoma fuera del aula.
- Asistencia al profesor en la corrección: el preset "Very sensitive" está pensado para que un docente revise las marcas detectadas y priorice los errores más relevantes de cada alumno.
- Aplicaciones móviles offline: gracias a los SDKs de Apple y Android y a la ejecución on-device, la app puede funcionar sin conexión y sin enviar audio a servidores, lo que es adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Integración web y de escritorio: mediante WebAssembly (navegadores y Node) o la C API (Windows/Linux x86-64), se puede incorporar la evaluación de recitación en plataformas web educativas o aplicaciones de escritorio.
- Control de calidad en la producción de contenido recitado: verificación automatizada de grabaciones de recitadores para detectar desviaciones antes de su publicación, usando los presets de sensibilidad según el nivel de rigor requerido.
- Investigación en procesamiento de habla árabe y tajwid: el modelo y su runtime pueden servir como base para estudiar la detección automática de fenómenos fonéticos específicos del árabe coránico, aunque el acceso a los pesos está restringido a aplicaciones aprobadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es de 65M de parámetros y está diseñado para ejecución on-device, pero no se especifican requisitos de memoria.
- GPU recomendadas: no disponible. El modelo está orientado a CPU y dispositivos móviles mediante los SDKs, no a GPU de servidor.
- Compatibilidad con GPU de consumo: no aplica según la información disponible; el despliegue previsto es en dispositivo (móvil, navegador, escritorio).
- Opciones de despliegue: SDKs oficiales `tajweedformer-apple` (Swift), `tajweedformer-android` (Kotlin), `tajweedformer-web` (WebAssembly) y `tajweedformer-c` (C API y runner de servidor), todos sobre `tajweedformer-engine`.
- Latencia y throughput: resultados de reconocimiento disponibles cada 160 ms durante la recitación. No se dispone de más datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación de audio para tajwid coránico con características equivalentes (streaming, on-device, 65M de parámetros, licencia NPL-1.2).

## Limitaciones y advertencias

- Los pesos no están publicados en Hugging Face; el acceso requiere solicitud y aprobación a través del portal de Quran Lab, con aceptación de la licencia NPL-1.2.
- La licencia NPL-1.2 prohíbe cobrar por el modelo, por el acceso a él o por cualquier funcionalidad que lo utilice; el uso comercial directo del modelo o de sus funcionalidades no está permitido.
- El modelo solo soporta árabe y está especializado en la lectura Hafs 'an 'Asim; no es aplicable a otras lecturas (qira'at) ni a otros idiomas.
- Requiere que el ayah recitado sea conocido de antemano; no está diseñado para transcripción libre ni para recitación sin referencia.
- Shadda y madd lazim no se reportan en esta versión.
- La detección de qalqalah es experimental y está desactivada por defecto.
- El modelo puede generar falsos positivos, especialmente en los presets más sensibles; el preset "Strict" minimiza las marcas falsas y "Very sensitive" está pensado para revisión humana, no para uso automático sin supervisión.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación independiente del rendimiento.
- El audio de recitación solo se comparte con Quran Lab si el usuario activa explícitamente esa opción; el reconocimiento se ejecuta en el dispositivo.
- No se especifican requisitos de memoria ni de hardware más allá de las versiones mínimas de sistema operativo de los SDKs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quran-Lab/tajweedformer-v4
- Solicitud de acceso: https://portal.quranlab.ai/access
- Documentación del portal: https://portal.quranlab.ai/docs
- Runtime y scorer en C: https://github.com/Quran-Lab/tajweedformer-engine
- Licencia NPL-1.2: https://github.com/Quran-Lab/tajweedformer-engine/blob/main/LICENSE
- SDK Apple (Swift): https://github.com/Quran-Lab/tajweedformer-apple
- SDK Android (Kotlin): https://github.com/Quran-Lab/tajweedformer-android
- SDK Web (WebAssembly): https://github.com/Quran-Lab/tajweedformer-web
- SDK C (Windows/Linux x86-64): https://github.com/Quran-Lab/tajweedformer-c
