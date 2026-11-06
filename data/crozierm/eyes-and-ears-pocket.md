# crozierm/eyes-and-ears-pocket

## Resumen

Eyes & Ears Pocket es una conversión a Core ML del modelo de síntesis de voz Pocket TTS de Kyutai, en su variante `english_2026-10` (pocket-tts 4.0.1). Lo publica el usuario crozierm como parte del proyecto Eyes & Ears, una aplicación para iOS, y su objetivo es ejecutar síntesis de voz neuronal directamente en el Neural Engine de dispositivos Apple sin depender de servidores externos. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales son de Kyutai y la conversión se ha realizado con la herramienta FluidInference/mobius.

El paquete incluye los grafos optimizados para ANE (`flowlm_step_ane` y `cond_prefill_ane`), un decodificador flow fusionado configurado a 1 paso LSD (el valor por defecto de pocket-tts 4), el decodificador Mimi en fp32 con su estado inicial de streaming y el codificador de clonación de voz `mimi_encoderv2` con la proyección de hablante ya incorporada y una entrada fija de 10 segundos. Solo se incluye la voz `alba` de Kyutai.

Es relevante porque demuestra un patrón habitual en el ecosistema: tomar un modelo de pesos abiertos y publicar una variante empaquetada para un runtime concreto (en este caso Core ML) que simplifica su integración en producción. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal basada en flow matching con codec Mimi (grafos Core ML para Neural Engine) |
| Parametros totales | 100M (según el título de la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio fija de 10 s para el codificador de clonación) |
| Tipos de cuantizacion | no disponible; decodificador Mimi en fp32, grafos ANE sin cuantización declarada |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodelc`), librería `coreml` |

## Arquitectura y entrenamiento

El modelo subyacente es Pocket TTS de Kyutai, un sistema de síntesis de voz de aproximadamente 100M de parámetros que combina un modelo de lenguaje de flujo (flow LM) con un decodificador flow y el códec neuronal Mimi, que actúa como tokenizador y reconstructor de audio. La conversión a Core ML separa el pipeline en grafos especializados: `flowlm_step_ane` y `cond_prefill_ane` para el paso autorregresivo y el prefill sobre el Neural Engine, un decodificador flow fusionado a 1 paso LSD y el decodificador Mimi en fp32 con estado de streaming inicial. El codificador `mimi_encoderv2` incorpora la proyección de hablante y espera una entrada fija de 10 segundos.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, la composición de las voces ni si hubo etapas de RLHF o ajuste fino por preferencias. La model card tampoco documenta innovaciones de decodificación más allá del uso de 1 paso LSD por defecto y del estado de streaming del decodificador Mimi, que permite síntesis incremental. La conversión se realizó con FluidInference/mobius en el commit `210d6b6`, con correcciones específicas a los trazadores del decodificador y el codificador Mimi para pocket-tts 4, y el runtime empleado es el código de Pocket TTS de FluidAudio (Apache-2.0).

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida de audio generada por el decodificador Mimi.
- Clonación de voz mediante el codificador `mimi_encoderv2`: se le pasa una muestra de audio de 10 segundos y el modelo extrae el embedding de hablante.
- Streaming: el decodificador Mimi incluye su estado inicial de streaming, lo que permite generar audio de forma incremental.
- Ejecución en el Neural Engine de Apple mediante grafos Core ML dedicados, sin necesidad de GPU dedicada.
- Voz preincluida: únicamente `alba` de Kyutai; no se incluyen otras voces del modelo original.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la muestra de clonación.

## Casos de uso

- Lectura por voz en aplicaciones iOS: el paquete Core ML permite integrar TTS en una app nativa y ejecutarlo en el Neural Engine, con lo que se evita enviar texto del usuario a un servidor y se reduce el consumo de batería frente a una GPU.
- Accesibilidad para personas con discapacidad visual: la síntesis local en inglés permite leer notificaciones, correos o contenido de pantalla en tiempo real sin conexión, usando la voz `alba` incluida.
- Asistentes conversacionales en el dispositivo: al soportar streaming en el decodificador Mimi, el audio puede empezar a reproducirse antes de que termine la generación completa, lo que mejora la percepción de latencia en diálogos por turnos.
- Clonación de voz consentida para contenido personal: con una muestra de 10 segundos del propio usuario, el codificador `mimi_encoderv2` permite generar una voz personalizada para audiolibros, notas de voz o vídeos, siempre con consentimiento explícito del hablante.
- Prototipado de interfaces de voz en investigación: al ser un artefacto Core ML ligero (0,4 GB), resulta útil para experimentar con pipelines TTS en macOS/iOS sin infraestructura de servidores.
- Aplicaciones de aprendizaje de idiomas: la voz sintética en inglés puede emplearse para generar ejercicios de escucha y pronunciación con vocabulario dinámico, ejecutándose localmente en el dispositivo del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para el Neural Engine de Apple. El repositorio ocupa 0,4 GB, por lo que el espacio en disco y la memoria unificada necesarios son moderados.
- GPU recomendadas: no disponibles; el artefacto está orientado a ANE (Neural Engine) de chips Apple (serie A y serie M). No se documenta ejecución en A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, en dispositivos Apple compatibles con Core ML y Neural Engine; no se especifican los modelos mínimos de iPhone, iPad o Mac.
- Opciones de despliegue: Core ML con el runtime de FluidAudio (Pocket TTS, Apache-2.0); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles; la model card no incluye métricas de tiempo real ni de RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Eyes & Ears Pocket (este) | 100M | audio de clonación fijo de 10 s | en | CC-BY-4.0 | Core ML | Solo voz `alba`; optimizado para ANE |
| kyutai/pocket-tts | 100M (según el modelo base) | no disponible | en (variante `english_2026-10`) | no disponible en la información proporcionada | pesos originales | Modelo base del que deriva esta conversión |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Solo se incluye la voz `alba`; el resto de voces del modelo original no están empaquetadas.
- El codificador de clonación exige una entrada fija de 10 segundos: hay que rellenar o recortar el audio y conservar los frames propios del clip.
- Riesgo de uso indebido en clonación de voz: la propia model card advierte de no clonar voces sin consentimiento ni suplantar a personas reales.
- No se documentan sesgos del modelo base ni tasas de alucinación o errores de pronunciación; al ser un TTS, el riesgo principal es la generación de audio incorrecto o ininteligible, no de texto inventado.
- La licencia CC-BY-4.0 permite uso comercial con atribución a Kyutai como titular de los pesos; conviene revisar también las condiciones del código de conversión (mobius, Apache-2.0) y del runtime (FluidAudio, Apache-2.0).
- El artefacto está atado a Core ML y al ecosistema Apple; no es portable a otros runtimes sin reconversión.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta: la fiabilidad en producción no está contrastada por terceros.
- No se dispone de información sobre cuantizaciones alternativas ni sobre el comportamiento del modelo fuera del Neural Engine.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crozierm/eyes-and-ears-pocket
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Herramienta de conversión: https://github.com/FluidInference/mobius
