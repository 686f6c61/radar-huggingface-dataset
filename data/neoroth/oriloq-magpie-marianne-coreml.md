# NeoRoth/oriloq-magpie-marianne-coreml

## Resumen

`NeoRoth/oriloq-magpie-marianne-coreml` es un paquete de síntesis de voz (text-to-speech) derivado de NVIDIA Magpie v2607, afinado sobre un conjunto privado de voz en francés y convertido a Core ML para su uso en Oriloq sobre Apple Silicon. Lo publica el usuario NeoRoth y no es un lanzamiento oficial de NVIDIA: el propio autor lo describe como un fine-tuning y una conversión propios. La voz resultante se denomina Marianne (identificador interno de hablante `Marion`) y el paquete conserva los otros cinco contextos de hablante del modelo original.

El modelo hereda el tamaño de 357 millones de parámetros del checkpoint base `nvidia/magpie_tts_multilingual_357m` y emplea además el códec neuronal `nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps`, que opera a 22,05 kHz y 1,89 kbps. La inferencia se ejecuta sobre CPU y Neural Engine, y la salida es audio mono a 22.050 Hz. El repositorio ocupa 1,1 GB y se distribuye como grafos compilados, no como un pipeline de Python autónomo.

Su relevancia es acotada pero concreta: cubre el nicho de voces francesas ejecutables en local sobre hardware de Apple sin depender de servicios en la nube, integrándose como backend de Magpie dentro de Oriloq en macOS 26 o posterior. Con cero descargas y cero valoraciones en el momento de redactar esta ficha, se trata de una publicación reciente y sin validación comunitaria, pensada para un ecosistema propietario concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se hereda de NVIDIA Magpie v2607; se distribuyen grafos Core ML compilados) |
| Parámetros totales | 357 M (según el identificador del modelo base `nvidia/magpie_tts_multilingual_357m`; no se detalla el desglose del paquete) |
| Longitud de contexto | no disponible (no se documenta el límite de texto de entrada) |
| Tipos de cuantización | no disponible (no se especifica la precisión de los grafos Core ML) |
| Idiomas soportados | francés (fr) |
| Licencia | NVIDIA Open Model License (Magpie, 24 de octubre de 2025; NanoCodec, 14 de junio de 2024); etiquetada como `other` en HuggingFace |
| Formato de pesos | Core ML (grafos compilados); no se publican pesos PyTorch, safetensors ni GGUF |
| Tarea | text-to-speech |
| Códec de audio | `nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps` |
| Frecuencia de muestreo de salida | 22.050 Hz, mono |
| Voces incluidas | Marianne (ID interno `Marion`) más los otros cinco contextos de hablante del modelo base |
| Plataforma de ejecución | Apple Silicon (CPU y Neural Engine), macOS 26 o posterior |
| Integración | backend Magpie de Oriloq (no es un pipeline de Python autónomo) |
| Tamaño del repositorio | 1,1 GB |
| Descargas / valoraciones | 0 / 0 |
| Fecha de publicación | 17 de octubre de 2026 (última actualización el mismo día) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo base NVIDIA Magpie v2607 más allá de que se trata de un sistema TTS con códec neuronal asociado. El paquete aquí publicado no incluye pesos en formato de entrenamiento, sino grafos Core ML compilados que se ejecutan sobre CPU y Neural Engine. El componente de audio se apoya en NanoCodec, un códec neuronal a 22,05 kHz con una tasa de 1,89 kbps y 21,5 fotogramas por segundo, según la denominación del propio checkpoint.

El proceso declarado por el autor consiste en un fine-tuning de Magpie sobre un conjunto privado de habla francesa y una posterior conversión a Core ML. No se especifican el número de tokens o de horas de audio empleados, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Las grabaciones de entrenamiento no se distribuyen, por lo que el ajuste no es reproducible ni auditable a partir del repositorio. Tampoco se documentan innovaciones técnicas adicionales, mecanismos de decodificación especulativa ni variantes de atención.

El repositorio incluye un fichero `provenance.json`, un fichero `Notice` y los textos de licencia, además de las referencias a los commits concretos de los modelos base utilizados, lo que permite trazar el origen de los pesos originales aunque no el del conjunto de datos de ajuste.

## Capacidades

- Síntesis de voz en francés a partir de texto, con salida mono a 22.050 Hz.
- Voz única afinada (Marianne, ID interno `Marion`) más cinco contextos de hablante heredados del modelo base.
- Ejecución local sobre Apple Silicon mediante CPU y Neural Engine, sin dependencia de servicios en la nube.
- Integración como backend Magpie dentro de la aplicación Oriloq en macOS 26 o posterior.
- Inferencia sobre grafos Core ML ya compilados, orientada a despliegue en producción en el ecosistema Apple.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de síntesis de voz.
- No se documentan capacidades de visión, audio de entrada, clonación de voz a partir de muestras del usuario ni control prosódico explícito.
- No se documenta multilingüismo en este paquete: el único idioma declarado es el francés.

## Casos de uso

- Asistentes de voz locales en macOS: la voz Marianne puede leer respuestas generadas por un LLM que se ejecute en el mismo equipo, manteniendo el texto y el audio dentro del dispositivo gracias a la inferencia en CPU y Neural Engine.
- Accesibilidad para personas con discapacidad visual: lectura en francés de contenido de pantalla, documentos o interfaces de aplicaciones en equipos Apple, aprovechando que el modelo corre en local y no requiere conexión.
- Pre-generación de locuciones para telefonía y sistemas IVR: sintetizar por lotes mensajes de bienvenida, menús y avisos en francés a 22.050 Hz mono, formato suficiente para telefonía de banda estrecha o ancha.
- Producción de contenido formativo: generación de narraciones para cursos, tutoriales y módulos de e-learning en francés, pre-generando el audio en un equipo Apple antes de publicarlo.
- Audiolibros y podcasts de nicho: conversión de texto largo a voz en francés cuando no se dispone de presupuesto para un locutor, asumiendo que la calidad puede variar según el texto y la pronunciación.
- Prototipado de localización audiovisual: generar pistas de voz temporales en francés para validar doblajes y sincronización antes de contratar voces humanas.
- Demostraciones y pruebas internas de producto: incorporar una voz francesa a prototipos de aplicaciones macOS que usen Oriloq como capa de interacción por voz.
- Funcionamiento sin conexión en entornos restringidos: despliegues donde no se permite enviar texto a servicios de terceros, dado que todo el procesamiento ocurre en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS, CMOS, WER ni comparaciones con otras voces, y los resultados de la búsqueda web realizada no contienen datos técnicos sobre este modelo ni sobre sus modelos base. No se dispone, por tanto, de cifras de latencia, tiempo real factor (RTF), throughput ni tasa de error de pronunciación.

| Métrica | Valor |
|---|---|
| MOS / CMOS | no disponible |
| WER / tasa de error de pronunciación | no disponible |
| Comparativas con voces similares | no disponible |
| Latencia o RTF medidos | no disponible |

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 26 o posterior; el paquete está compilado para Core ML y usa CPU y Neural Engine.
- Memoria: no se publica un requisito oficial. Como referencia orientativa, los 357 M de parámetros del modelo base equivalen a unos 0,7 GB en precisión de 16 bits, a lo que hay que sumar el códec y el resto de grafos; el repositorio completo ocupa 1,1 GB. En Apple Silicon esta memoria procede de la memoria unificada del sistema, no de una VRAM dedicada.
- No es ejecutable en GPU NVIDIA ni AMD, ni en Linux o Windows, al menos con estos grafos tal y como se distribuyen.
- Equipos razonables para pruebas: cualquier Mac con chip de la familia M (M1 o posterior) debería poder cargar los grafos, si bien no hay datos publicados de latencia ni de consumo por modelo concreto.
- Opciones de despliegue: exclusivamente el backend Magpie de Oriloq. La model card indica explícitamente que los grafos compilados no constituyen un pipeline de Python autónomo, por lo que no caben despliegues con vLLM, llama.cpp, Ollama ni TGI, herramientas pensadas además para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas equivalentes (TTS en francés convertidos a Core ML para Apple Silicon) en la información proporcionada. La comparación más directa posible es con el propio modelo base del que deriva este paquete.

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeoRoth/oriloq-magpie-marianne-coreml | 357 M (heredados) | francés | NVIDIA Open Model License | Core ML | Ajuste en francés y conversión a Core ML; requiere Oriloq |
| nvidia/magpie_tts_multilingual_357m | 357 M | multilingüe | NVIDIA Open Model License | no disponible | Modelo base, sin ajuste específico en francés ni conversión a Core ML |
| Otras voces TTS para Apple Silicon | no disponible | no disponible | no disponible | no disponible | Sin datos verificados en la información disponible |

## Limitaciones y advertencias

- Modelo no oficial: el autor indica expresamente que no es un lanzamiento de NVIDIA, sino un fine-tuning y una conversión realizados por un tercero.
- Dataset de ajuste privado y no distribuido, lo que impide auditar la procedencia de la voz, los sesgos acústicos o las condiciones de grabación.
- Único idioma declarado: francés. No hay soporte documentado de otros idiomas en este paquete pese a que el modelo base sea multilingüe.
- Calidad variable: la propia model card advierte de que la calidad puede variar según el texto y la pronunciación, sin ofrecer métricas que permitan acotar ese riesgo.
- Riesgo de pronunciación incorrecta de nombres propios, siglas, números, préstamos lingüísticos y términos técnicos, habitual en sistemas TTS sin un módulo de normalización específico documentado.
- Dependencia total de Oriloq: los grafos no funcionan como pipeline independiente, lo que ata el uso del modelo a esa aplicación y a macOS 26 o posterior.
- Restricciones de plataforma: no hay soporte para GPU NVIDIA, Linux ni Windows con este paquete.
- Licencia: se aplica la NVIDIA Open Model License, en sus versiones de octubre de 2025 (Magpie) y junio de 2024 (NanoCodec). Las condiciones exactas de uso comercial, redistribución y atribución deben consultarse en los ficheros de licencia incluidos en el repositorio; la etiqueta de HuggingFace es `other`, lo que exige revisión manual antes de un despliegue en producción.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta, así como ausencia de evaluaciones independientes.
- No se especifica la precisión numérica de los grafos Core ML, dato relevante para estimar consumo de memoria y degradación de calidad frente al modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeoRoth/oriloq-magpie-marianne-coreml
- Modelo base Magpie: https://huggingface.co/nvidia/magpie_tts_multilingual_357m/tree/19806879b16d3f2ccf28fb112b1bcd16a3c7923e
- Códec base NanoCodec: https://huggingface.co/nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps/tree/fc00890b604aa2de298d2641ffc6c5f6caf8c4d7
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Papers, blogs o repos adicionales: no se han encontrado enlaces relevantes en la búsqueda web realizada.
- Documentación de Oriloq: no disponible en la información proporcionada.
