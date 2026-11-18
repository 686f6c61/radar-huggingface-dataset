# Hansda/bengali-voice-compact

## Resumen
Bengali Voice Compact es un modelo de sintesis de voz (text-to-speech) mono-locutor para bengali, adaptado del proyecto Tiny Voca. Lo desarrolla el autor independiente Hansda (Tamal Hansda) y esta disenado especificamente para ejecutarse en navegador: el paquete INT8 completo ocupa menos de 1 MB (997.518 bytes), lo que permite inferencia local en el cliente sin depender de servidores. Resuelve el problema de incorporar TTS bengali de baja latencia en aplicaciones web con recursos limitados, un nicho poco cubierto por los modelos TTS multilingues de gran tamano.

El modelo emplea una arquitectura compacta de 930.224 parametros con 112 canales ocultos, 3 bloques de texto, 2 bloques de prosodia, 5 bloques acusticos, un vocoder source-filter y un residuo de forma de onda aprendido. Genera audio a 24 kHz para un unico locutor (la voz Jahnavi de Maya 2 Native) y se entrena sobre un corpus sintetico de 16.315 clips (20 horas) construido con prompts de dominio publico de Mozilla Common Voice Bengali.

Su relevancia actual radica en la combinacion de tamano minimo, licencia Apache 2.0 y formato ONNX INT8 listo para el navegador, lo que lo hace adecuado para demos, prototipos y aplicaciones de accesibilidad en bengali donde no es viable desplegar infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS compacta tipo Tiny Voca: 112 canales ocultos, 3 bloques de texto, 2 de prosodia, 5 acusticos, vocoder source-filter con residuo de onda aprendido |
| Parametros totales | 930.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (paquete navegador y archivo nativo), FP32 (checkpoint de entrenamiento/conversion) |
| Idiomas soportados | bengali (bn) |
| Licencia | Apache 2.0 (pesos y codigo de inferencia adaptado); assets del fonemizador bajo CC BY 4.0 (lexico de pronunciacion bengali de Google) |
| Formato de pesos | ONNX (grafo comprimido, pesos empaquetados y desempaquetador de 1.167 bytes); checkpoint FP32 para entrenamiento |

## Arquitectura y entrenamiento
El modelo sigue el diseno de Tiny Voca, una arquitectura TTS ligera que separa el procesamiento en bloques de texto, prosodia y acustica antes de un vocoder source-filter que sintetiza la forma de onda con un residuo aprendido. Con 930.224 parametros y 112 canales ocultos, esta optimizado para inferencia en CPU y entornos web mediante ONNX Runtime. El paquete INT8 para navegador incluye el grafo ONNX comprimido, los pesos empaquetados y un desempaquetador de 1.167 bytes; la demo requiere ademas el frontend y el runtime ONNX compartido.

El entrenamiento se realizo sobre el dataset Bengali Maya 2 Native Jahnavi 20h, compuesto por 16.315 clips (20 horas) generados con prompts de dominio publico de Mozilla Common Voice Bengali y la voz Jahnavi integrada de Maya 2 Native. El dataset documenta terminos CC BY 4.0, atribucion upstream y particiones de train, validation y test. No se especifica en la informacion disponible el numero exacto de tokens, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Sintesis de voz mono-locutor en bengali a 24 kHz.
- Generacion de audio a partir de texto con fonemizacion bengali (assets del lexico de pronunciacion de Google, CC BY 4.0).
- Inferencia en navegador mediante ONNX Runtime con pesos INT8 (paquete de menos de 1 MB).
- Conversion y reentrenamiento a partir del checkpoint FP32.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS puro).
- Capacidad multilingue limitada exclusivamente al bengali.
- Sin modo de "thinking", vision ni audio de entrada.

## Casos de uso
- Lectura de articulos y noticias en bengali dentro del navegador: el modelo sintetiza texto a voz localmente con un paquete INT8 de menos de 1 MB, sin enviar contenido a servidores externos.
- Accesibilidad para personas con discapacidad visual: integracion en aplicaciones web bengali para leer interfaces y formularios en tiempo real con latencia baja en CPU.
- Aprendizaje de idiomas: reproduccion de pronunciacion bengali para estudiantes, usando el fonemizador incluido y la voz Jahnavi.
- Asistentes de voz embebidos en paginas web: respuestas habladas en bengali sin coste de infraestructura GPU, gracias al runtime ONNX en el cliente.
- Prototipado rapido de productos TTS: el checkpoint FP32 permite ajustar y reconvertir el modelo para nuevas voces o dominios antes de empaquetar en INT8.
- Demos y pruebas de investigacion en TTS de bajo consumo: validacion de pipelines de sintesis compacta con metricas automatizadas (UTMOSv2, CER de IndicConformer).

## Benchmarks y rendimiento

| Artefacto | Bytes | Naturalidad (MOS predicho) | CER |
|---|---:|---:|---:|
| Paquete INT8 para navegador | 997.518 | 2,255 | 2,510 % |
| Archivo nativo INT8 | 989.986 | mismos pesos cuantizados | mismos pesos cuantizados |
| Checkpoint FP32 | 3.785.809 | no disponible | no disponible |

La puntuacion de naturalidad INT8 es la media de predicciones UTMOSv2 sobre 24 clips bengali de validacion con semillas de recorte 17, 29 y 43. El CER de IndicConformer bengali cubre 72 clips de validacion y 3.785 caracteres. Son puntuaciones automatizadas de validacion; UTMOSv2 es un proxy de naturalidad percibida. Las fuentes estan en el directorio `evaluation/` del repositorio.

## Requisitos de hardware
- VRAM estimada: no requiere GPU; el paquete INT8 (menos de 1 MB) esta pensado para CPU y navegador.
- GPU recomendadas: no aplica; el modelo esta disenado para inferencia en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos moviles y navegadores, dado su tamano minimo.
- Opciones de despliegue: ONNX Runtime (navegador y nativo), con frontend propio y cargador de pesos incluidos en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada; el tamano de 930.224 parametros y el paquete INT8 sugieren inferencia de baja latencia en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bengali Voice Compact | 930.224 | no disponible | bn | Apache 2.0 | ONNX INT8/FP32 |
| Tiny Voca (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Maya 2 Native (voz Jahnavi) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de Tiny Voca ni de Maya 2 Native en la informacion proporcionada; la comparativa se limita a la relacion de adaptacion (Bengali Voice Compact deriva de Tiny Voca y usa la voz de Maya 2 Native).

## Limitaciones y advertencias
- Modelo mono-locutor y mono-idioma: solo sintetiza bengali con la voz Jahnavi; no soporta otros idiomas ni voces.
- Naturalidad moderada: MOS predicho de 2,255 (UTMOSv2), un valor bajo que indica voz sintetica perceptiblemente artificial.
- Datos de entrenamiento sinteticos: el corpus se genero con la voz Jahnavi de Maya 2 Native, por lo que puede heredar sesgos acusticos o artefactos del modelo fuente.
- Riesgo de alucinacion acustica: como todo TTS, puede producir pronunciaciones incorrectas o artefactos en texto fuera de dominio; el CER de validacion (2,510 %) mide solo el conjunto de validacion.
- Licencia: pesos y codigo bajo Apache 2.0 permiten uso comercial, pero los assets del fonemizador estan bajo CC BY 4.0 (Google) y requieren atribucion; consultar `frontend/google-LICENSE`.
- El paquete para navegador no es autosuficiente: la demo necesita frontend y runtime ONNX compartido, no incluidos en el paquete de pesos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario no verificados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hansda/bengali-voice-compact
- Dataset de entrenamiento: https://huggingface.co/datasets/Hansda/bengali-maya2-jahnavi-20h
- Proyecto base Tiny Voca: https://github.com/n4ze3m/tiny-voca
- Voz Maya 2 Native: https://huggingface.co/maya-research/maya2-native
- Prompts de Common Voice Bengali: https://github.com/common-voice/common-voice/blob/605c25e48f9fb87cb25ca794cb39bf91d3741f29/server/data/bn/sentence-collector.txt
