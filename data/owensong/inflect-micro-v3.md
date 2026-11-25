# owensong/Inflect-Micro-v3

## Resumen

Inflect Micro v3 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por owensong, tercer miembro de la familia Inflect v3 junto a Mini y Atom. Se trata de un núcleo de síntesis neuronal de tan solo 11.787.634 parámetros que genera audio WAV nativo a 24 kHz a partir de texto en inglés y una de seis voces predefinidas (Cassidy, Mark, Hope, James, Sophia y Jasper). Su propuesta de valor es clara: ofrecer una voz neuronal compacta que se ejecuta íntegramente en local, sin dependencia de servicios en la nube, con un paquete de inferencia completo que incluye modelos de pronunciación, dependencias y activos de condicionamiento de voz.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y está pensado para despliegues en entornos con recursos limitados. Según la model card, alcanza un 0,73 % de WER (7/50) en el Open TTS Leaderboard, una puntuación UTMOS22 de 4,37 y un rendimiento de 71,87 veces tiempo real sobre una GPU H200. El repositorio ocupa 0,1 GB, lo que refleja su naturaleza ligera.

La relevancia actual de Inflect Micro v3 radica en la creciente demanda de TTS local y de baja latencia para aplicaciones embebidas, asistentes offline y pipelines de accesibilidad, donde el coste por inferencia y la privacidad de los datos son críticos. Frente a soluciones propietarias basadas en API, este modelo permite integrar síntesis de voz en productos sin enviar texto a terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Núcleo de síntesis neuronal (detalles arquitectónicos no disponibles) |
| Parametros totales | 11.787.634 (núcleo de síntesis) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio incluye el paquete de inferencia completo, no solo pesos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del núcleo de síntesis más allá de su naturaleza neuronal y su recuento de parámetros (11.787.634). La model card especifica que el recuento de núcleos y el tamaño de los ficheros de pesos no equivalen al tamaño total de la instalación ni a los requisitos de memoria en tiempo de ejecución: los modelos de pronunciación, las dependencias y los activos fijos de condicionamiento de voz son componentes separados del núcleo aprendido. Se recomienda descargar el repositorio completo, no solo los pesos.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. Lo que sí se indica es que el modelo produce salida nativa a 24 kHz y que el paquete de inferencia v3 es autónomo, incluyendo todo lo necesario para la generación local mediante su interfaz de línea de comandos.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano, con salida WAV nativa a 24 kHz.
- Seis voces predefinidas en inglés: Cassidy, Mark, Hope, James, Sophia y Jasper.
- Ejecución local completa mediante una interfaz de línea de comandos incluida en el repositorio.
- Paquete de inferencia autónomo que integra modelos de pronunciación y activos de condicionamiento de voz.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo, tool calling ni razonamiento multi-paso; es un modelo exclusivamente de TTS.

## Casos de uso

- Asistentes de voz offline: el modelo puede generar respuestas habladas en inglés directamente en el dispositivo del usuario, sin enviar texto a servicios externos, gracias a su núcleo de 11,7 M de parámetros y su ejecución local.
- Accesibilidad y lectores de pantalla: integración en aplicaciones de escritorio o móviles para convertir texto en audio a 24 kHz con seis voces seleccionables, adecuado para entornos donde la latencia de red es inaceptable.
- Sistemas embebidos y edge computing: su reducido tamaño (repositorio de 0,1 GB) permite desplegarlo en dispositivos con recursos limitados, como Raspberry Pi o mini-PC, para interfaces de voz en kioscos o electrodomésticos.
- Generación de audiolibros y contenido narrado: la salida WAV a 24 kHz y las seis voces permiten producir narraciones en inglés por lotes mediante la CLI, con calidad suficiente según la puntuación UTMOS22 de 4,37.
- Prototipado rápido de productos de voz: los desarrolladores pueden validar flujos de conversación texto-a-voz en local antes de migrar a soluciones en la nube, usando el playground de Hugging Face o la CLI del repositorio.
- Privacidad en sectores regulados: en aplicaciones sanitarias o legales donde el texto no puede salir de la infraestructura propia, el modelo permite síntesis de voz completamente on-premise bajo licencia Apache 2.0.
- Automatización de avisos y notificaciones: generación programática de mensajes hablados en inglés para sistemas de megafonía, centralitas o alertas industriales, con throughput de 71,87 veces tiempo real en H200.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Open TTS Leaderboard (WER) | 0,73 % (7/50) |
| UTMOS22 | 4,37 |
| Velocidad de inferencia (H200) | 71,87x tiempo real |

No se han publicado en la información disponible resultados comparativos adicionales frente a otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el núcleo de síntesis tiene 11,7 M de parámetros, pero el paquete completo incluye modelos de pronunciación y activos adicionales cuyo consumo no se detalla.
- GPU recomendadas: la model card cita una H200 para la medición de 71,87x tiempo real; no se especifican requisitos mínimos ni otras GPU validadas.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño reducido del núcleo sugiere que podría ejecutarse en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: interfaz de línea de comandos incluida en el repositorio y playground en Hugging Face Spaces; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: 71,87x tiempo real sobre H200 según la model card; no hay datos para otras GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos TTS comparables (parámetros, contexto, rendimiento o licencia) que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha documentado soporte multilingüe.
- El modelo únicamente dispone de seis voces predefinidas; no se documenta clonación de voz ni control fino de prosodia o emoción.
- El recuento de 11,7 M de parámetros corresponde solo al núcleo de síntesis; el consumo real de memoria y disco es mayor al incluir modelos de pronunciación, dependencias y activos de condicionamiento.
- La model card advierte explícitamente de que debe descargarse el repositorio completo, no solo los pesos, para que la inferencia funcione.
- No se han publicado datos sobre sesgos de pronunciación, acento o género en las voces disponibles.
- Riesgo de errores de pronunciación en palabras poco frecuentes, acrónimos o nombres propios, mitigado parcialmente por el modelo de pronunciación incluido, aunque sin datos de cobertura.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se detallan restricciones adicionales sobre el uso de las voces o los datos de entrenamiento.
- El repositorio se creó en noviembre de 2026 y tiene pocas descargas (296) y likes (12), por lo que la validación comunitaria es aún limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/owensong/Inflect-Micro-v3
- Playground: https://huggingface.co/spaces/owensong/Inflect-v3
- Repositorio GitHub: https://github.com/owenawsong/Inflect
- Documentación de descargas v3: https://github.com/owenawsong/Inflect/blob/main/docs/v3/downloads.md
- Colección de modelos Inflect v3: https://huggingface.co/collections/owensong/inflect-v3
- Discord: https://discord.gg/CVJYedvzvp
