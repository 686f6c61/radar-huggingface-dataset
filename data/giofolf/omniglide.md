# giofolf/omniglide

## Resumen

Omniglide es un modelo neuronal compacto de decodificación de gestos de deslizamiento (swipe typing) para teclados Android, desarrollado por el usuario giofolf. Su función es traducir la traza de un dedo sobre una disposición QWERTY de Android en la palabra que el usuario pretendía escribir, sustituyendo el fallback geométrico de AOSP, que carecía de modelo de lenguaje y generaba resultados incorrectos. Está pensado para ejecutarse completamente en el dispositivo, de forma offline, dentro de un teclado estilo Gboard con dictado local.

A diferencia de los modelos de lenguaje generativos convencionales, Omniglide es una red neuronal pequeña (el artefacto `swipe_model.bin` ocupa aproximadamente 2 MB) que trabaja sobre trazas de gesto representadas como puntos normalizados `[x, y, t]` y un vocabulario de frecuencias de palabras construido a partir del mismo corpus. Aunque la etiqueta de pipeline en Hugging Face es `text-generation`, el modelo no genera texto libre: decodifica gestos en palabras candidatas.

Es relevante por su enfoque de despliegue en el borde (on-device) y por su carácter multilingüe limitado a portugués (pt-BR y pt-PT) e inglés. Se integra en el teclado mediante JNI (`SwipeJni.cpp` y `SwipeDecoder.java`) y permite reentrenamiento continuo a partir de un registro de uso local (`UsageLog.java`) que almacena candidatos ofrecidos, palabras confirmadas y correcciones posteriores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal compacta propietaria sobre trazas de gesto `[x, y, t]` normalizadas (detalles de capas no disponibles) |
| Parámetros totales | no disponible (artefacto de ~2 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (pt-BR / pt-PT) e inglés |
| Licencia | MIT |
| Formato de pesos | binario propietario `swipe_model.bin` (cargado vía JNI) |

## Arquitectura y entrenamiento

Omniglide es una red neuronal compacta que recibe trazas de gesto representadas como secuencias de puntos normalizados `[x, y, t]` sobre una disposición QWERTY de Android y produce la palabra decodificada. No se especifican en la información disponible el número de capas, el tipo exacto de capas (recurrentes, convolucionales o atención) ni la dimensión de las representaciones internas. El modelo se acompaña de un vocabulario construido a partir de frecuencias de palabras del mismo corpus de entrenamiento, que se emplea para restringir y puntuar las candidatas.

El entrenamiento se realizó con trazas reales de gestos: el corpus de gestos de HeliBoard para portugués (pt-BR / pt-PT) y el corpus de gestos de FUTO para inglés. Los datos brutos y los scripts de entrenamiento se encuentran en `packages/ai-model/gesture-training/` del repositorio fuente. El sistema incluye además un mecanismo de reentrenamiento continuo: `UsageLog.java` registra los candidatos ofrecidos, la palabra finalmente confirmada por el usuario y las correcciones posteriores, generando los pares necesarios para reajustar el modelo con el uso real de la aplicación. No se documenta el uso de RLHF, DPO ni de un proceso de alineación adicional.

## Capacidades

- Decodificación de gestos de deslizamiento (swipe) sobre teclado QWERTY de Android en palabras completas.
- Funcionamiento completamente offline y en el dispositivo, sin llamadas a servicios externos.
- Soporte multilingüe limitado a portugués (pt-BR / pt-PT) e inglés.
- Puntuación de candidatas mediante un vocabulario de frecuencias de palabras.
- Integración nativa en teclados Android mediante JNI (`SwipeJni.cpp`, `SwipeDecoder.java`).
- Reentrenamiento incremental a partir de registros de uso (candidatos, confirmaciones y correcciones).
- No dispone de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Teclados Android con decodificación de swipe offline: el modelo sustituye el fallback geométrico de AOSP y decodifica gestos en palabras reales sin conexión, lo que resulta adecuado por su tamaño de ~2 MB y su ejecución local.
- Teclados centrados en privacidad: al ejecutarse íntegramente en el dispositivo, las trazas de gesto y las palabras no salen del terminal, lo que encaja en teclados tipo HeliBoard o FUTO.
- Aplicaciones de accesibilidad: permite introducir texto mediante gestos continuos en lugar de pulsaciones individuales, útil para usuarios con dificultades de precisión en pantallas táctiles.
- Localización para portugués e inglés: un mismo teclado puede cubrir pt-BR, pt-PT y en con un único modelo, simplificando el mantenimiento de variantes regionales.
- Mejora continua del teclado: el registro de uso (`UsageLog.java`) permite recopilar pares de candidata y corrección para reentrenar el modelo y adaptarlo al vocabulario del usuario.
- Integración en distribuciones Android sin servicios de Google: al no depender de APIs externas, encaja en ROMs y teclados de código abierto que requieren dictado y decodificación locales.
- Prototipado de investigación en decodificación de gestos: los scripts de entrenamiento y los corpus de HeliBoard y FUTO permiten reproducir y extender el modelo a otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto pesa ~2 MB, por lo que la inferencia es viable en CPU de dispositivos móviles.
- GPU recomendadas: no aplica; el modelo está diseñado para ejecución en el dispositivo vía JNI, no para servidores con GPU.
- Cabe en cualquier dispositivo Android moderno, incluidos terminales de gama baja, dado el tamaño del artefacto.
- Opciones de despliegue: integración nativa en el teclado Android mediante `SwipeJni.cpp` y `SwipeDecoder.java`; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Omniglide (giofolf) | Decodificador de gestos swipe | ~2 MB | pt, en | MIT | On-device (Android, JNI) |
| Fallback geométrico de AOSP | Decodificador geométrico sin LM | no disponible | multi | AOSP | On-device |
| Motores de swipe de teclados comerciales (p. ej. Gboard) | Decodificador propietario con LM | no disponible | multi | propietaria | On-device / nube |
| Modelos de lenguaje para corrección de texto (p. ej. T5 pequeños) | Generación de texto | cientos de MB | multi | variable | On-device / servidor |

La comparación con modelos de lenguaje generativos no es directa: Omniglide no genera texto libre, sino que resuelve una tarea específica de decodificación de gestos, por lo que sus alternativas naturales son los motores de swipe de otros teclados y el fallback geométrico de AOSP.

## Limitaciones y advertencias

- Cobertura lingüística limitada a portugués (pt-BR / pt-PT) e inglés; otros idiomas no están soportados.
- No es un modelo de generación de texto pese a la etiqueta `text-generation` del repositorio; no debe emplearse para tareas de lenguaje general.
- No se documentan métricas de precisión, latencia ni tasas de error, lo que dificulta evaluar su calidad frente al fallback de AOSP.
- Riesgo de sesgo derivado del vocabulario de frecuencias del corpus: palabras poco frecuentes o jerga podrían decodificarse peor.
- El reentrenamiento continuo mediante `UsageLog.java` implica el registro local de datos de uso; conviene revisar las implicaciones de privacidad y el consentimiento del usuario.
- La licencia MIT permite uso comercial, pero el motor OpenSwipe incluido es también MIT y se remite al repositorio fuente para los avisos completos.
- No hay información sobre el proceso de validación en producción ni sobre el rendimiento en dispositivos de gama baja.

## Enlaces

- Hugging Face: https://huggingface.co/giofolf/omniglide
- Repositorio fuente (referenciado en la model card, ruta `packages/ai-model/gesture-training/`): no disponible como URL directa
- HeliBoard (corpus de gestos en portugués): no disponible como URL directa en la información proporcionada
- FUTO Keyboard (corpus de gestos en inglés): no disponible como URL directa en la información proporcionada
