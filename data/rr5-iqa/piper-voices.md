# rr5-iqa/piper-voices

## Resumen

El repositorio `rr5-iqa/piper-voices` es una colección de voces preentrenadas para el sistema de síntesis de voz Piper, desarrollado originalmente por el proyecto Rhasspy. Piper es un motor de texto a voz (TTS) neuronal, ligero y diseñado para funcionar completamente offline, incluso en dispositivos con recursos limitados como una Raspberry Pi. Este repositorio concreto reúne modelos de voz en formato ONNX para decenas de idiomas, desde árabe y catalán hasta chino y vietnamita, lo que lo convierte en un recurso valioso para desarrolladores que necesitan integrar síntesis de voz multilingüe en aplicaciones de escritorio, embebidas o servidores sin depender de servicios en la nube.

Cada voz es un modelo independiente con un tamaño de parámetros que varía según el nivel de calidad: desde 5-7 millones de parámetros para la calidad `x_low` (audio a 16 kHz) hasta 28-32 millones para la calidad `high` (audio a 22,05 kHz). El repositorio ocupa 12,4 GB en total e incluye voces masculinas y femeninas, así como algunos modelos multi-hablante que permiten cambiar de locutor sobre la marcha. La licencia MIT facilita su uso comercial sin restricciones, y el formato ONNX garantiza compatibilidad con el runtime de Piper y con otras herramientas que soporten este estándar.

La relevancia actual de este proyecto radica en la creciente demanda de soluciones TTS privadas, sin latencia de red y con control total sobre los datos. Piper, y por extensión este repositorio de voces, ofrece una alternativa sólida a los servicios propietarios de síntesis de voz, con una calidad aceptable para muchos casos de uso y un coste computacional muy bajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vocoder neuronal (basada en VITS, según el diseño de Piper) |
| Parametros totales | 5-32 millones según la calidad de la voz (x_low, low, medium, high) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (síntesis de voz, no procesamiento de texto largo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Piper es un sistema de síntesis de voz basado en una arquitectura de vocoder neuronal, concretamente una variante de VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech). Cada voz del repositorio es un modelo independiente entrenado con datos de voz de dominio público, aunque no se especifican los conjuntos de datos exactos ni el número de horas de audio utilizadas. El entrenamiento se realiza en varias etapas, y los modelos se publican en cuatro niveles de calidad: `x_low` (16 kHz, 5-7 M parámetros), `low` (16 kHz, 15-20 M), `medium` (22,05 kHz, 15-20 M) y `high` (22,05 kHz, 28-32 M). Los modelos de mayor calidad producen audio con mejor fidelidad y una frecuencia de muestreo más alta, a costa de un mayor coste computacional.

Algunas voces son multi-hablante, lo que significa que un único modelo puede generar la voz de varias personas distintas, permitiendo cambiar de locutor en tiempo de ejecución sin recargar el modelo. El proyecto Piper también ofrece un repositorio separado de checkpoints (`piper-checkpoints`) para aquellos que deseen entrenar sus propias voces con datos personalizados, lo que amplía la flexibilidad del sistema.

## Capacidades

- Síntesis de voz neuronal de alta calidad a partir de texto, con soporte para más de 30 idiomas.
- Funcionamiento completamente offline, sin necesidad de conexión a internet ni servicios en la nube.
- Ejecución eficiente en CPU, incluso en dispositivos de gama baja como Raspberry Pi.
- Modelos multi-hablante que permiten alternar entre varios locutores dentro de un mismo archivo de voz.
- Cuatro niveles de calidad configurables según las necesidades de fidelidad y rendimiento.
- Integración sencilla mediante el runtime de Piper, disponible como biblioteca Python, línea de comandos y servidor HTTP.
- Compatibilidad con el formato ONNX, lo que facilita la interoperabilidad con otras herramientas de inferencia.

## Casos de uso

- Asistentes de voz para dispositivos embebidos: un asistente doméstico basado en Raspberry Pi puede generar respuestas habladas en el idioma local sin depender de servicios externos, gracias al bajo consumo de CPU y memoria de los modelos `x_low` o `low`.
- Accesibilidad para personas con discapacidad visual: aplicaciones de lectura de pantalla pueden convertir texto de documentos, correos o páginas web en voz, utilizando los modelos de calidad `medium` o `high` para una escucha más natural.
- Sistemas de navegación GPS sin conexión: un dispositivo de navegación para vehículos puede anunciar indicaciones en el idioma del conductor, usando voces locales y funcionando sin cobertura de red.
- Audioguías en museos o exposiciones: se pueden generar archivos de audio a partir de guiones textuales en varios idiomas, con voces masculinas y femeninas, para ofrecer recorridos multilingües.
- Lectura de noticias o podcasts automatizados: un servicio web puede convertir artículos de texto en audio bajo demanda, empleando el servidor HTTP de Piper para escalar horizontalmente.
- Sistemas de aviso en transporte público: estaciones de tren o autobús pueden anunciar paradas y mensajes en varios idiomas, con voces preentrenadas y sin necesidad de conexión a internet.
- Prototipado rápido de productos de voz: los desarrolladores pueden integrar Piper en sus aplicaciones móviles o de escritorio para validar flujos de interacción por voz antes de invertir en servicios comerciales de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas objetivas de calidad de voz (como MOS, Mean Opinion Score) ni comparativas formales con otros sistemas TTS en los materiales consultados. La calidad percibida se describe de forma cualitativa en los niveles de calidad (`x_low`, `low`, `medium`, `high`), pero sin datos numéricos que permitan una evaluación rigurosa.

## Requisitos de hardware

- Inferencia en CPU: Piper está diseñado para funcionar sin GPU. Los modelos `x_low` y `low` pueden ejecutarse en una Raspberry Pi 3 o superior con 1 GB de RAM.
- Modelos `medium` y `high`: requieren algo más de potencia, pero siguen siendo viables en CPUs de escritorio modernas o en servidores ligeros.
- VRAM: no se requiere VRAM, ya que la inferencia se realiza en CPU. Si se desea acelerar con GPU, no hay soporte oficial documentado en la información disponible.
- Opciones de despliegue: runtime de Piper (Python, CLI, servidor HTTP), integración con Home Assistant, o mediante el uso directo de los archivos ONNX con otros frameworks de inferencia.
- Latencia: no se proporcionan cifras exactas, pero en una CPU moderna la síntesis de una frase corta suele completarse en menos de un segundo para los modelos de menor calidad.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros sistemas TTS de código abierto como Coqui TTS, Mimic 3 o eSpeak NG. A diferencia de estos, Piper se distingue por su enfoque en eficiencia y despliegue en dispositivos de bajos recursos, pero no hay métricas publicadas que permitan una comparación objetiva de calidad de voz o velocidad de inferencia.

## Limitaciones y advertencias

- La calidad de voz varía notablemente entre idiomas y entre niveles de calidad; los modelos `x_low` pueden sonar robóticos o con artefactos.
- No hay control fino sobre la prosodia, el énfasis o la entonación; la síntesis es relativamente plana en comparación con sistemas comerciales.
- El repositorio no incluye documentación detallada sobre los conjuntos de datos de entrenamiento, por lo que no se puede evaluar la posible presencia de sesgos en las voces o en los acentos representados.
- Aunque la licencia MIT permite uso comercial, es responsabilidad del usuario verificar que las voces individuales no tengan restricciones adicionales derivadas de los datos de entrenamiento originales.
- El tamaño del repositorio (12,4 GB) puede ser un inconveniente si se desea descargar todas las voces; se recomienda seleccionar únicamente los idiomas y calidades necesarios.
- No se garantiza soporte a largo plazo ni mantenimiento activo, ya que el proyecto Piper depende de la comunidad de Rhasspy.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/rr5-iqa/piper-voices
- Repositorio original de voces de Piper: https://huggingface.co/rhasspy/piper-voices
- Código fuente de Piper: https://github.com/rhasspy/piper
- Guía de entrenamiento de voces personalizadas: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints para entrenamiento: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
- Muestras de audio de las voces: https://rhasspy.github.io/piper-samples/
