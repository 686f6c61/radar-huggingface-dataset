# seanll95/chatterbox-nano-coreml

## Resumen

Chatterbox-Nano es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por Resemble AI, diseñado para ofrecer alta calidad de audio con una arquitectura extremadamente eficiente de 110 millones de parámetros. Esta variante concreta, `seanll95/chatterbox-nano-coreml`, es una conversión a CoreML realizada por un tercero (seanll95) para facilitar su ejecución en dispositivos Apple, manteniendo la licencia MIT original. El modelo resuelve el problema de la inferencia TTS en entornos con recursos limitados, siendo capaz de generar voz 3 veces más rápido que el tiempo real en una CPU de 8 núcleos, lo que lo hace adecuado para aplicaciones on-device, asistentes de voz y clonación de voz con baja latencia.

La arquitectura de Nano comparte diseño con Chatterbox-Turbo, pero con un tamaño reducido. Incluye un decoder de tokens de habla a mel de un solo paso (frente a los 10 pasos de modelos anteriores), lo que elimina un cuello de botella en la generación. Además, soporta etiquetas paralingüísticas nativas como `[laugh]`, `[chuckle]` o `[cough]`, que permiten añadir expresividad y realismo a las voces sintetizadas. El modelo está entrenado exclusivamente para inglés y su principal caso de uso es la clonación de voz zero-shot a partir de un clip de referencia de unos 10 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en tokens de habla (similar a Chatterbox-Turbo) |
| Parametros totales | 110 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato CoreML, posiblemente FP16 o FP32) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | CoreML (`.mlmodel` o `.mlpackage`) |

## Arquitectura y entrenamiento

Chatterbox-Nano utiliza una arquitectura de transformer basada en tokens de habla, similar a la de Chatterbox-Turbo pero con un tamaño reducido a 110M de parámetros. El modelo procesa texto y un clip de audio de referencia para generar una voz clonada, produciendo tokens de habla que luego se convierten en mel-espectrogramas mediante un decoder de un solo paso, en lugar de los 10 pasos de generación previos. Esta innovación reduce significativamente la latencia y el coste computacional, permitiendo una inferencia 3 veces más rápida que el tiempo real en una CPU de 8 núcleos.

El entrenamiento se realizó con datos de voz en inglés, aunque no se especifican detalles sobre el volumen de datos ni el proceso de alineación. El modelo incorpora etiquetas paralingüísticas de forma nativa, lo que sugiere que el dataset de entrenamiento incluía anotaciones de fenómenos como risas, toses o suspiros. No se menciona el uso de RLHF ni DPO; el enfoque principal es la generación de voz de alta fidelidad con clonación zero-shot.

## Capacidades

- Generacion de voz natural y expresiva en ingles, con clonacion de voz zero-shot a partir de un clip de referencia de aproximadamente 10 segundos.
- Soporte de etiquetas paralinguisticas nativas: `[laugh]`, `[chuckle]`, `[cough]`, entre otras, para anadir realismo y emocion a la salida.
- Inferencia eficiente en CPU: 3 veces mas rapida que el tiempo real en 8 nucleos, lo que permite despliegue en dispositivos sin GPU.
- Compatible con el ecosistema CoreML, lo que facilita su integracion en aplicaciones iOS, macOS y otros entornos Apple.
- Generacion de audio de alta fidelidad gracias al decoder de un solo paso que mantiene la calidad del mel-espectrograma.
- No soporta tool calling ni funciones de agente; es un modelo puramente generativo de voz.

## Casos de uso

- Asistentes de voz on-device: el modelo puede ejecutarse en un iPhone o Mac sin conexion, generando respuestas de voz con baja latencia. Su velocidad en CPU (3x realtime) lo hace adecuado para interacciones en tiempo real.
- Clonacion de voz para contenido audiovisual: un creador puede grabar un clip de 10 segundos de una voz y generar narraciones completas con esa misma voz, util para audiolibros, doblaje o videos.
- Accesibilidad: aplicaciones de lectura de pantalla o comunicadores aumentativos pueden usar el modelo para convertir texto en voz natural con la voz del propio usuario, mejorando la experiencia de personas con discapacidad.
- Prototipado rapido de productos TTS: al ser ligero y de licencia MIT, los desarrolladores pueden integrarlo en demos o MVPs sin coste de licencia ni necesidad de GPU.
- Sistemas de respuesta interactiva (IVR): en entornos de atencion al cliente, el modelo puede generar respuestas de voz personalizadas con etiquetas paralinguisticas para transmitir empatia o urgencia.
- Educacion y e-learning: generacion de material de audio a partir de texto con voces clonadas de instructores, permitiendo actualizar contenidos sin regrabar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de evaluacion de Podonos para Chatterbox-Turbo, pero no se proporcionan datos numericos especificos para Nano ni para esta conversion CoreML. Se menciona que Nano es 3 veces mas rapido que el tiempo real en una CPU de 8 nucleos, pero no hay metricas comparativas formales (MOS, RTF, etc.) en la documentacion accesible.

## Requisitos de hardware

- Al ser un modelo CoreML, esta optimizado para dispositivos Apple (iPhone, iPad, Mac con chip M1 o superior). No se especifican requisitos minimos de RAM o VRAM.
- La inferencia en CPU es viable: el modelo es 3 veces mas rapido que el tiempo real en 8 nucleos, por lo que un Mac con procesador moderno puede ejecutarlo sin GPU.
- No se requieren GPUs dedicadas; el modelo esta disenado para entornos con presupuesto de memoria y latencia ajustados.
- Para despliegue en servidores, se puede usar el modelo original de Resemble AI (Chatterbox-Nano) con PyTorch, pero esta variante CoreML esta pensada para integracion en apps de Apple.
- Opciones de despliegue: integracion directa en Xcode mediante CoreML, o mediante frameworks como `coremltools` para conversion adicional. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generico.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Velocidad | Licencia | Formato |
|---|---|---|---|---|---|
| Chatterbox-Nano (original) | 110M | ingles | 3x realtime en CPU 8 cores | MIT | PyTorch |
| Chatterbox-Turbo | 350M | ingles | Baja latencia para agentes | MIT | PyTorch |
| Chatterbox-Multilingual | 500M | 23+ | No especificado | MIT | PyTorch |
| **Chatterbox-Nano-CoreML** | 110M | ingles | 3x realtime en CPU 8 cores | MIT | CoreML |

La principal diferencia de esta variante CoreML es el formato de pesos, que permite su uso en el ecosistema Apple sin necesidad de convertir manualmente. En terminos de rendimiento, es identica al modelo original de Nano, pero con la ventaja de una integracion nativa en iOS/macOS. Frente a alternativas como Piper o Coqui TTS, Nano destaca por su clonacion de voz zero-shot y sus etiquetas paralinguisticas, aunque su soporte de idiomas es limitado al ingles.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para aplicaciones multilingues.
- La clonacion de voz requiere un clip de referencia de buena calidad; con audios ruidosos o de baja fidelidad, la calidad de la sintesis puede degradarse.
- Riesgo de alucinacion en la pronunciacion de nombres propios o terminos tecnicos poco frecuentes, comun en modelos TTS.
- Al ser una conversion de terceros, no hay garantia de que el modelo CoreML este actualizado con la ultima version de Resemble AI ni de que se hayan realizado pruebas exhaustivas de compatibilidad.
- La licencia MIT permite uso comercial, pero el autor original (Resemble AI) ofrece un servicio TTS de pago con latencia sub-200ms; para produccion a gran escala puede ser preferible usar ese servicio.
- No se proporcionan datos sobre sesgos de genero, edad o acento en las voces sintetizadas; es recomendable evaluar el modelo con casos de uso especificos antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seanll95/chatterbox-nano-coreml
- Demo de Chatterbox-Nano (original): https://huggingface.co/spaces/ResembleAI/chatterbox-nano-demo
- Pagina de demos de audio: https://resemble-ai.github.io/chatterbox_turbo_demopage/
- Repositorio de GitHub de Chatterbox: https://github.com/resemble-ai/chatterbox
- Evaluacion de Podonos: https://podonos.com/resembleai/chatterbox
