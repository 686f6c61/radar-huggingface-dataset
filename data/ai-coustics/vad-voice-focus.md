# ai-coustics/vad-voice-focus

## Resumen

VAD Voice Focus es un modelo de deteccion de actividad de voz (VAD) orientado a produccion, desarrollado por ai-coustics, que decide cuando habla el hablante principal directamente sobre audio de microfono ruidoso, ignorando voces competidoras y habla de fondo. Esta disenado especificamente para la gestion de turnos (turn-taking) de agentes de voz, donde es critico distinguir al usuario principal de otras personas presentes en el entorno. La model card lo posiciona como la opcion preferente frente a encadenar la mejora de voz Quail Voice Focus con VAD Multi Speaker, y afirma que funciona sin un denoiser separado.

El modelo no es un LLM ni un transformer generativo: se trata de un detector binario de voz por bloques de audio, con una latencia declarada de 30 ms, sin necesidad de GPU y sin dependencia de ONNX. Su relevancia actual radica en que los pipelines de agentes de voz en produccion necesitan VAD robusto al ruido y selectivo por hablante para evitar activaciones falsas provocadas por voces de fondo, television o conversaciones paralelas.

La inferencia se ejecuta a traves del paquete `aic-sdk` (disponible en Python, Rust, C/C++, Node.js y WebAssembly), lo que implica una dependencia de SDK propietario y de una clave de licencia para su uso. El modelo se distribuye bajo la ai-coustics-model-license, no como pesos abiertos en el repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (detector VAD por bloques de audio; no se especifica la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesamiento en tiempo real por bloques de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Independiente del idioma (language-agnostic) |
| Licencia | ai-coustics-model-license (propietaria, enlace: https://ai-coustics.com/legal/model-license) |
| Formato de pesos | No disponible (consumido a traves de `aic-sdk`; tamano del repo 0.0 GB) |
| Frecuencias de muestreo | Multiples frecuencias de entrada soportadas (variante `vad-vf-2.1-s-16khz` referenciada) |
| Latencia | 30 ms (declarada por el autor) |
| Requisito de GPU | No necesaria |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red neuronal (tipo de capas, tamano, datos de entrenamiento, numero de horas de audio ni proceso de entrenamiento). Lo que si se especifica es el comportamiento funcional: el modelo analiza bloques de audio mono en `float32` y produce una probabilidad de voz por bloque, sin modificar la senal de audio. Expone una probabilidad cruda por bloque (`raw_vad_probability()`) y un retardo de prediccion en muestras (`get_prediction_delay()`) para alinear las decisiones con la linea temporal del audio.

La innovacion principal declarada es la selectividad por hablante principal: el detector distingue al hablante primario de voces competidoras y habla de fondo, algo que un VAD convencional no hace. Ademas, esta disenado para operar en paralelo con modulos de mejora de voz sobre el mismo bloque de audio original, sin requerir un denoiser previo. El autor afirma que supera a Silero VAD en precision, equilibrio y fiabilidad, aunque no se aportan cifras en la informacion disponible.

## Capacidades

- Deteccion de actividad de voz (VAD) en tiempo real sobre audio de microfono ruidoso.
- Selectividad de hablante principal: ignora voces competidoras y habla de fondo.
- Gestion de turnos (turn-taking) para agentes de voz.
- Funcionamiento independiente del idioma.
- Soporte de multiples frecuencias de muestreo de entrada.
- Parametros ajustables: sensibilidad (umbral de probabilidad 0.0-1.0), duracion minima de habla y duracion de retencion del habla tras el cese.
- Exposicion de probabilidad cruda por bloque y retardo de prediccion para alineacion temporal.
- Operacion en paralelo con modulos de mejora de voz (procesa el audio original, no el mejorado).
- Ejecucion sin GPU y sin dependencia de ONNX.
- SDK multi-lenguaje: Python, Rust, C/C++, Node.js y WebAssembly.
- No realiza generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling.

## Casos de uso

- Agentes de voz conversacionales: el modelo decide cuando el usuario principal ha empezado o dejado de hablar, permitiendo un turn-taking fiable con 30 ms de latencia y evitando que el agente responda a voces de fondo.
- Atencion al cliente telefonica: en entornos con ruido ambiental o television de fondo, la selectividad por hablante principal reduce las activaciones falsas y mejora la segmentacion de turnos en conversaciones multi-turno.
- Integracion en frameworks de voz en tiempo real: existen quickstarts para LiveKit y Pipecat, lo que permite incorporar el VAD en pipelines existentes de agentes de voz sin reescribir la pila de audio.
- Sistemas de transcripcion con diarizacion previa: al detectar solo al hablante principal, se puede segmentar el audio antes de enviarlo a un motor de speech-to-text, reduciendo transcripciones de voces no deseadas.
- Asistentes embebidos y edge: al no requerir GPU y ejecutarse via WebAssembly o C/C++, es adecuado para dispositivos con recursos limitados donde no cabe un VAD basado en GPU.
- Pipelines con mejora de voz en paralelo: el VAD procesa el bloque original mientras un modulo de enhancement procesa el mismo bloque, permitiendo construir cadenas de audio donde la deteccion y la mejora no se interfieren.
- Deteccion de silencio para control de costes: en servicios de transcripcion o sintesis, el VAD puede usarse para no invocar modelos caros cuando no hay habla del usuario principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo supera a Silero VAD en precision, equilibrio y fiabilidad, pero no aporta cifras concretas (ni tasas de error, ni curvas ROC, ni comparativas numericas).

## Requisitos de hardware

- VRAM estimada: no aplica; el autor declara que no se necesita GPU.
- GPU recomendadas: no aplica; el modelo esta pensado para ejecucion en CPU.
- Cabe en GPU consumer: si, aunque no es necesario; puede ejecutarse en CPU.
- Opciones de despliegue: exclusivamente a traves del SDK `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 30 ms declarados por el autor.
- Throughput: no disponible.
- Requisito adicional: clave de SDK (trial gratuito de 30 dias en developers.ai-coustics.com).

## Comparativa con modelos similares

| Modelo | Tipo | Selectividad de hablante | Latencia | GPU | Licencia | Distribucion |
|---|---|---|---|---|---|---|
| VAD Voice Focus (ai-coustics) | VAD para hablante principal | Si | 30 ms | No | ai-coustics-model-license (propietaria) | Via SDK `aic-sdk` |
| VAD Multi Speaker (ai-coustics) | VAD general multi-hablante | No (cualquier hablante) | No disponible | No | ai-coustics-model-license (propietaria) | Via SDK `aic-sdk` |
| Silero VAD | VAD general | No | No disponible en la informacion | No | No disponible en la informacion | No disponible en la informacion |

La informacion proporcionada no incluye datos numericos de rendimiento que permitan una comparacion cuantitativa con Silero VAD u otras alternativas. La distincion funcional principal de VAD Voice Focus frente a VAD Multi Speaker es la selectividad por hablante principal; el autor recomienda VAD Multi Speaker como opcion por defecto para audio ruidoso multi-hablante y VAD Voice Focus para turn-taking de hablante principal en agentes de voz.

## Limitaciones y advertencias

- La licencia es propietaria (ai-coustics-model-license); el uso comercial esta sujeto a los terminos del enlace de licencia y, en su caso, a licencia enterprise.
- Requiere una clave de SDK para su uso; el trial gratuito es de 30 dias, lo que implica dependencia de un servicio externo para obtener credenciales.
- No se distribuyen pesos abiertos en el repositorio de Hugging Face (tamano del repo 0.0 GB); la inferencia esta atada al SDK `aic-sdk`.
- La arquitectura interna, el tamano del modelo y los datos de entrenamiento no se detallan, lo que limita la evaluacion independiente y la auditoria.
- No hay benchmarks publicados en la informacion disponible; las afirmaciones de superioridad frente a Silero VAD no estan cuantificadas.
- El modelo esta disenado para hablante principal; en escenarios donde el hablante relevante cambia dinamicamente o hay multiples hablantes igualmente importantes, puede no ser la opcion adecuada (el autor sugiere VAD Multi Speaker para esos casos).
- Al ser un detector binario de voz, no proporciona transcripcion, identificacion de hablante ni contenido semantico.
- Riesgo de sesgos y de alucinacion: no aplica en el sentido generativo, pero si puede haber errores de deteccion (falsos positivos o negativos) en condiciones acusticas no representadas en su entrenamiento, cuyo alcance no se documenta.
- Dependencia de la plataforma ai-coustics para actualizaciones, soporte y disponibilidad del SDK.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/vad-voice-focus
- Documentacion de VAD Voice Focus: https://docs.ai-coustics.com/models/voice-activity-detection/vad-voice-focus
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentacion general: https://docs.ai-coustics.com
- Quickstart de LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo de Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics-vad-only.py
- Artefactos y checksums: https://artifacts.ai-coustics.io
- SDK de Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave gratuita de SDK: https://developers.ai-coustics.com
- Licencia enterprise: https://ai-coustics.com/
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- VAD Multi Speaker: https://huggingface.co/ai-coustics/vad-multi-speaker
- Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Quail Multi Speaker: https://huggingface.co/ai-coustics/quail-multi-speaker
- Rook Multi Speaker: https://huggingface.co/ai-coustics/rook-multi-speaker
- Tyto: https://huggingface.co/ai-coustics/tyto
