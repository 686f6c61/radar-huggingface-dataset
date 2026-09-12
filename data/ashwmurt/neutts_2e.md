# ashwmurt/neutts_2e

## Resumen

NeuTTS-2E es un modelo de síntesis de voz (text-to-audio) orientado a ejecución en dispositivo, desarrollado por Neuphonic y redistribuido como receta compatible con Qualcomm AI Hub Models por el usuario ashwmurt. Combina un backbone de modelo de lenguaje causal Qwen3 de 236 millones de parámetros con el códec de audio neuronal NeuCodec a 50 Hz, y genera habla en inglés a 24 kHz con cuatro hablantes fijos y siete emociones. Su problema objetivo es el TTS emocional de baja latencia en hardware móvil, sin depender de la nube.

A diferencia de NeuTTS-Nano, este modelo no realiza clonación de voz: cada hablante se distribuye como códigos de referencia precodificados, de modo que no se lee audio de referencia y el codificador del códec nunca se utiliza en inferencia. El backbone se exporta como dos grafos (uno de prefill de 128 tokens y otro de decodificación de un solo token) enlazados en un único binario de contexto con pesos compartidos; el ensamblado del prompt, el condicionamiento emocional, el muestreo y la decodificación con NeuCodec se ejecutan en CPU dentro de la aplicación.

La relevancia actual del modelo reside en su enfoque de despliegue: está empaquetado como receta del CLI `qai-hub-models`, lo que permite compilarlo y evaluarlo en dispositivos Snapdragon reales a través de Qualcomm AI Hub Workbench. El repositorio de HuggingFace registra 0 descargas y 0 likes en el momento de la consulta, y la licencia declarada es "other", remitiendo a la licencia de la implementación original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone de modelo de lenguaje causal Qwen3 (transformer) + códec de audio neuronal NeuCodec a 50 Hz |
| Parámetros totales | 236 M en el backbone; total del sistema (backbone + códec) no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el grafo de prefill procesa bloques de 128 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (habla a 24 kHz) |
| Licencia | other (otra); la licencia de la implementación original está en el repositorio de Neuphonic |
| Formato de pesos | PyTorch; exportable a TensorFlow Lite, ONNX Runtime y Qualcomm AI Engine Direct |
| Pipeline | text-to-audio |
| Librería declarada | pytorch |
| Hablantes | cuatro hablantes fijos |
| Emociones | siete (los nombres no se detallan en la model card) |
| Clonación de voz | no soportada |
| Plataforma objetivo | dispositivos Qualcomm Snapdragon (vía Qualcomm AI Hub Workbench) |

## Arquitectura y entrenamiento

La arquitectura es híbrida en dos etapas: un backbone de lenguaje causal Qwen3 de 236 M de parámetros que modela los tokens de audio, y el códec neuronal NeuCodec, que opera a 50 Hz y reconstruye la forma de onda a 24 kHz. En la exportación para dispositivo, el backbone se divide en dos grafos: uno de prefill que consume bloques de 128 tokens y otro de decodificación autorregresiva de un token, enlazados en un único binario de contexto con pesos compartidos. El resto del pipeline (ensamblado del prompt, condicionamiento por emoción, muestreo y decodificación NeuCodec) se ejecuta en CPU, fuera de los grafos acelerados.

El modelo no clona voces: los cuatro hablantes se suministran como códigos de referencia ya codificados, por lo que el codificador de NeuCodec no se usa en tiempo de inferencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineamiento como RLHF o DPO. Tampoco se detallan innovaciones de decodificación especulativa ni mecanismos de atención lineal; la única peculiaridad documentada es el esquema de exportación en dos grafos con pesos compartidos y el condicionamiento emocional inyectado en el prompt.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con calidad de audio neuronal.
- Condicionamiento emocional con siete emociones distintas.
- Cuatro hablantes fijos predefinidos mediante códigos de referencia precodificados.
- Ejecución en dispositivo (on-device) sobre hardware Qualcomm Snapdragon, sin dependencia de servicios en la nube.
- Exportación y evaluación mediante el CLI de Qualcomm AI Hub Models y Qualcomm AI Hub Workbench.
- Decodificación autorregresiva token a token con un grafo de prefill de 128 tokens.
- No soporta clonación de voz.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No soporta otros idiomas distintos del inglés según la model card.
- No se documentan capacidades de visión ni de audio de entrada (el encoder del códec no se usa).

## Casos de uso

- Síntesis de voz sin conexión en aplicaciones Android: el modelo está pensado para compilarse con el runtime de Qualcomm AI Engine Direct y ejecutarse localmente en el dispositivo, de modo que la aplicación puede generar habla sin enviar texto a un servidor.
- Asistentes de voz con matiz emocional: gracias a las siete emociones disponibles, un asistente puede responder con un tono neutro, alegre o serio según el contexto de la interacción, manteniendo uno de los cuatro hablantes fijos como identidad de marca.
- Lectura de contenido largo con hablantes consistentes: al disponer de voces predefinidas y no requerir audio de referencia en cada petición, es adecuado para locutar artículos, notificaciones o resúmenes manteniendo la misma voz entre sesiones.
- Accesibilidad en aplicaciones móviles: lectura en voz alta de textos de interfaz para usuarios con discapacidad visual, ejecutándose en el propio terminal y sin coste de API por carácter.
- Sistemas embebidos de automoción e IoT: el empaquetado como receta de AI Hub permite desplegar el modelo en plataformas Snapdragon con recursos limitados para avisos hablados y navegación por voz.
- Validación previa al despliegue en pipelines de CI: el comando `qai-hub-models export neutts_2e` permite generar artefactos de forma reproducible y evaluarlos contra dispositivos alojados en Workbench antes de publicar una build.
- Prototipado de productos de audio emocional: equipos que necesiten evaluar si el TTS emocional encaja en su producto pueden ejecutar el demo por línea de comandos sin entrenar ni ajustar nada.
- Generación de audio para contenido formativo: locuciones en inglés con una emoción concreta para cursos, tutoriales o material de e-learning, con la ventaja de que la inferencia ocurre en el dispositivo del alumno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos del backbone (cálculo derivado de 236 M de parámetros, no dato oficial): aproximadamente 0,47 GB en FP16, 0,24 GB en INT8 y 0,12 GB en INT4. A esta cifra hay que sumar el códec NeuCodec y las activaciones, cuyos requisitos no se detallan.
- Plataforma objetivo declarada: dispositivos Qualcomm Snapdragon, con compilación y perfilado a través de Qualcomm AI Hub Workbench. No se especifican modelos concretos de SoC.
- GPU de escritorio: no se documentan requisitos ni GPUs recomendadas (A100, H100, RTX 4090 u otras). El foco del paquete es la inferencia en el borde, no en servidor.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible. Por tamaño de parámetros el modelo es pequeño, pero la ruta de despliegue documentada es la exportación a runtimes de borde, no la ejecución directa en GPU de consumo.
- Opciones de despliegue documentadas: exportación a TensorFlow Lite, ONNX Runtime y Qualcomm AI Engine Direct mediante `qai-hub-models export neutts_2e`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El modelo está etiquetado como `real_time` y `on-device`, lo que indica que su objetivo de diseño es la síntesis en tiempo real, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Clonación de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NeuTTS-2E | 236 M (backbone) | no disponible | inglés | no | other | HuggingFace: ashwmurt/neutts_2e |
| NeuTTS-Nano | no disponible | no disponible | no disponible | sí | no disponible | Repositorio neuphonic/neutts |
| Otros modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación respaldada por la información proporcionada es la que la propia model card establece con NeuTTS-Nano, del mismo autor original: la diferencia declarada es que NeuTTS-2E no clona voces y trabaja con hablantes predefinidos, mientras que NeuTTS-Nano sí ofrece clonación. No se dispone de datos de parámetros, contexto, licencia ni rendimiento de NeuTTS-Nano en la información consultada. Tampoco se han podido verificar especificaciones de alternativas de terceros, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes: se trata de una receta redistribuida de terceros, no de la publicación oficial de Neuphonic, por lo que la validación comunitaria es nula.
- Licencia "other": es obligatorio revisar la licencia de la implementación original en el repositorio de Neuphonic antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- Idioma limitado: el modelo solo genera habla en inglés, según la model card. No hay soporte multilingüe declarado.
- Voces fijas y sin clonación: únicamente cuatro hablantes predefinidos y siete emociones; no es posible adaptarlo a una voz corporativa propia sin trabajo adicional no documentado.
- Riesgo de alucinación en TTS: en el contexto de un modelo de audio, los fallos se manifiestan como pronunciaciones incorrectas, artefactos acústicos o prosodia inadecuada. No se documentan tasas de error ni evaluaciones de inteligibilidad.
- Sesgos: no se aporta ninguna información sobre sesgos de acento, género o prosodia asociados a los cuatro hablantes.
- Dependencia de la cadena de herramientas de Qualcomm: la ruta de despliegue documentada requiere el CLI `qai-hub-models`, una cuenta de Qualcomm ID, un token de API y acceso a Workbench para compilar y evaluar en dispositivos alojados.
- Restricción de versión de Python: el paquete exige 3.10 <= PYTHON_VERSION < 3.14.
- Ausencia de especificaciones clave: no se publican contexto máximo, esquemas de cuantización soportados, VRAM oficial, latencia ni throughput, lo que dificulta dimensionar un despliegue en producción.
- Sin benchmarks publicados: no hay resultados verificables de calidad de audio, inteligibilidad o comparación objetiva con alternativas.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo; los enlaces devueltos no guardan relación con él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ashwmurt/neutts_2e
- Implementación original de NeuTTS-2E: https://github.com/neuphonic/neutts
- Licencia de la implementación original: https://github.com/neuphonic/neutts/blob/main/LICENSE
- Paper de NeuCodec: https://arxiv.org/abs/2509.09550
- Qualcomm AI Hub Models: https://github.com/quic/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Documentación de Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com/docs/
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Comunidad de AI Hub en Slack: https://aihub.qualcomm.com/community/slack
- Contacto de soporte de AI Hub: mailto:ai-hub-support@qti.qualcomm.com
