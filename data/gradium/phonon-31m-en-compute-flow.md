# gradium/phonon-31m-en-compute-flow

## Resumen
Phonon-31m-en-compute-flow es un paquete de despliegue del modelo de sintesis de voz (text-to-speech) phonon-31m-en, desarrollado por Gradium, adaptado para funcionar con Arm Compute Flow. Se trata de la misma red neuronal que el modelo original, pero reempaquetada en multiples formatos (ONNX, GGUF, LiteRT/TFLite) para integrarse en el ecosistema de inferencia de Arm sin necesidad de modificar codigo, ya que Phonon comparte arquitectura con Pocket TTS de Kyutai.

El modelo cuenta con 18.916.352 parametros reales (aunque se comercializa como "31m" por convencion de la familia) y esta especializado exclusivamente en ingles. Su relevancia actual radica en que permite ejecutar sintesis de voz de alta calidad en dispositivos de borde (edge), moviles y navegadores, con un peso total de repositorio de solo 0,1 GB, lo que lo hace apto para despliegues con recursos muy limitados.

La licencia Apache 2.0 y la disponibilidad de formatos optimizados para llama.cpp, ONNX Runtime y LiteRT lo posicionan como una alternativa practica para aplicaciones de voz en tiempo real que requieren baja latencia y no pueden depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow-matching (basado en Pocket TTS) con decodificador Mimi |
| Parametros totales | 18.916.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitado a 500 frames, 40 segundos de audio por peticion) |
| Tipos de cuantizacion | Q8_0 (GGUF), f32 (LiteRT/TFLite), ONNX (precision no especificada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, ONNX, TFLite, NPY, SentencePiece |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura de Pocket TTS de Kyutai, que combina un transformer de flow-matching para generar latentes de audio paso a paso, una cabeza de flujo (flow head) que muestrea un latente por paso y una cabeza de fin de voz (end-of-speech head). El decodificador Mimi, desarrollado tambien por Kyutai, convierte los latentes en audio streaming a precision completa (f32) mediante LiteRT.

El entrenamiento se realizo sobre datos no especificados en la informacion disponible. No se detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica principal reside en su empaquetado para Compute Flow: el transformer de flow-matching se exporta a GGUF con cuantizacion Q8_0 para llama.cpp, mientras que el encoder de texto, la proyeccion de latentes y las cabezas se exportan a ONNX Runtime, y el decodificador Mimi a TFLite. Esta division permite ejecutar cada componente en el runtime mas adecuado para hardware Arm.

## Capacidades
- Sintesis de voz (text-to-speech) en ingles a partir de texto plano.
- Generacion de audio streaming con decodificador Mimi a 40 segundos maximo por peticion (500 frames).
- Integracion con Arm Compute Flow mediante el brick `tts:pocket-tts` sin cambios de codigo.
- Soporte de tokenizacion SentencePiece para el texto de entrada.
- Voz por defecto incluida en el paquete (assets/default.npy).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio de entrada.
- Multilingue: no, unicamente ingles.

## Casos de uso
- Sintesis de voz en aplicaciones moviles Android e iOS: el modelo se puede integrar mediante LiteRT y el runtime de Phonon, permitiendo generar voz en el dispositivo sin conexion a internet, con un peso inferior a 75 MB.
- Lectura de textos en navegador: al ejecutarse en el navegador con un peso reducido, permite convertir articulos o notificaciones en audio en tiempo real sin enviar datos a servidores externos.
- Asistentes de voz para dispositivos IoT: gracias a su tamano reducido y a la compatibilidad con Arm Compute Flow, puede ejecutarse en placas como Raspberry Pi o dispositivos con CPU Arm de gama baja para dar respuestas habladas.
- Accesibilidad para personas con discapacidad visual: integrado en aplicaciones de lectura de pantalla, convierte texto en voz de forma local, eliminando la dependencia de APIs en la nube y reduciendo la latencia.
- Generacion de avisos y alertas en sistemas embebidos: el modelo puede sintetizar mensajes cortos (hasta 40 segundos) para sistemas de navegacion, electrodomesticos o maquinaria industrial que requieran feedback auditivo.
- Pruebas automatizadas de interfaces de voz: los desarrolladores pueden generar audio de prueba con la voz por defecto para validar pipelines de reconocimiento de voz o sistemas de dialogo, sin coste por peticion.
- Creacion de contenido educativo en ingles: sintesis de lecciones o narraciones para plataformas de e-learning que necesiten generar audio bajo demanda sin depender de servicios externos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 18,9 millones de parametros, la huella de memoria es muy reducida. En cuantizacion Q8_0, el transformer ocupa aproximadamente 19 MB; el resto de componentes (ONNX, TFLite) anaden unos pocos MB adicionales. El paquete completo pesa 0,1 GB.
- GPU recomendadas: no se especifican GPU dedicadas. El modelo esta disenado para ejecutarse en CPU Arm, NPU o GPU integrada en dispositivos de borde.
- Cabe en GPU consumer: si, en cualquier GPU consumer, aunque su uso tipico es en CPU o aceleradores de borde.
- Opciones de despliegue: Arm Compute Flow (brick `tts:pocket-tts`), llama.cpp (para el transformer GGUF), ONNX Runtime (para encoder y cabezas), LiteRT/TFLite (para el decodificador Mimi). Tambien existe un runtime propio de Phonon en GitHub (gradium-ai/xn-ptts) para linea de comandos, Python, navegador, iOS y Android.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Se menciona que el modelo permite TTS en navegadores con un peso inferior a 75 MB, pero sin cifras concretas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| gradium/phonon-31m-en-compute-flow | 18,9 M | 500 frames (40 s audio) | en | Apache 2.0 | GGUF, ONNX, TFLite | Hugging Face |
| gradium/phonon-31m-en | no disponible | no disponible | en | Apache 2.0 | safetensors | Hugging Face |
| Kokoro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas como Kokoro. La informacion disponible solo menciona que Phonon compite con Kokoro en el segmento de TTS en dispositivo, pero sin cifras de rendimiento.

## Limitaciones y advertencias
- El modelo solo soporta ingles. No se debe esperar un rendimiento adecuado en otros idiomas.
- La voz incluida es unicamente la voz por defecto del modelo. No se pueden seleccionar otras voces sin modificar el paquete.
- La longitud maxima de audio por peticion es de 40 segundos (500 frames). Textos mas largos deben dividirse en fragmentos.
- El texto de entrada debe escribirse con numeros, simbolos y abreviaturas desarrollados en palabras. El runtime de Phonon realiza esta normalizacion con `--lang en`, pero el brick de Compute Flow no lo hace automaticamente.
- La temperatura de muestreo recomendada es 0,3. El umbral de fin de voz es +4,0. Modificar estos valores puede degradar la calidad.
- El paquete no es identico muestra a muestra al runtime original de Phonon: la aproximacion tanh de GELU en llama.cpp, la fijacion de los condicionadores (numero de hablantes y duracion) como sesgo constante, y el uso de un generador de ruido propio introducen diferencias sutiles en el audio.
- El brick alimenta el prompt de voz al modelo en cada peticion, por lo que el primer audio tarda mas que en el runtime de Phonon, que condiciona la voz una sola vez.
- Riesgo de alucinacion: no aplica de la misma forma que en modelos de lenguaje, pero puede generar artefactos de audio o pronunciaciones incorrectas en textos complejos o poco frecuentes.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir a Gradium, Kyutai y los componentes subyacentes (Pocket TTS, Mimi).

## Enlaces
- Hugging Face: https://huggingface.co/gradium/phonon-31m-en-compute-flow
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Version para llama.cpp: https://huggingface.co/gradium/phonon-31m-en-llamacpp
- Version para audio.cpp: https://huggingface.co/gradium/phonon-31m-en-audiocpp
- Blog de Gradium: https://gradium.ai/blog/release-phonon-open-weight
- Documentacion de Transformers: https://huggingface.co/docs/transformers/model_doc/gradium_phonon_tts
- Repositorio del runtime: https://github.com/gradium-ai/xn-ptts
- Arm Compute Flow: https://github.com/ARM-software/compute-flow
- Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Coleccion Phonon: https://huggingface.co/collections/gradium/phonon
- Articulo en Unite.AI: https://www.unite.ai/gradiums-on-device-phonon-tts-passes-200-000-downloads-in-two-weeks/
- Articulo en AlphaSignal: https://alphasignal.ai/news/gradium-s-phonon-runs-text-to-speech-in-browsers-at-under-75-mb
- Comparativa con Kokoro en explainx.ai: https://explainx.ai/blog/gradium-phonon-31m-open-on-device-tts-apache-browser-10ms-kokoro-comparison-2026
