# diarizeapp/firered-vad-onnx

## Resumen

FireRed Streaming VAD ONNX es un detector de actividad de voz (VAD) en tiempo real distribuido en formato ONNX por el proyecto diarizeapp. A diferencia de un modelo generativo, se trata de un componente de senal especializado: recibe flujo de audio y decide en cada instante si hay voz humana, ademas de segmentar fronteras fonemicas. Su relevancia practica esta en que actua como puerta de entrada en pipelines de conversacion (diarizacion, transcripcion, asistentes de voz) evitando enviar silencio o ruido a etapas mas costosas.

El repositorio se presenta como la ubicacion canonica del artefacto, mantenida por el ecosistema diarizeapp para garantizar disponibilidad persistente y evitar roturas por dependencias que devuelven 404. El modelo se publica bajo licencia Apache 2.0 y esta catalogado en HuggingFace con el pipeline `audio-to-audio`, aunque su funcion real es la clasificacion binaria de voz por trama.

La informacion publicada es muy escasa: no se detallan parametros, arquitectura interna, ventana de contexto ni metricas de evaluacion. Lo que si se documenta con precision son los proveedores de ejecucion soportados (NPU Hexagon HTP en Snapdragon X Elite mediante contexto QDQ estatico, DirectML, CUDA y CPU con SIMD en x86_64 y ARM NEON), lo que lo posiciona como una pieza orientada al despliegue en el borde mas que a la experimentacion con modelos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de actividad de voz, no generativo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en streaming por tramas) |
| Tipos de cuantizacion | no disponible; el repo menciona contexto QDQ estatico para NPU Hexagon HTP |
| Idiomas soportados | no disponible (deteccion de voz independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (tipo de red, numero de capas, tamano de las ventanas de analisis ni estrategia de agregacion temporal). La model card unicamente describe su comportamiento como detector de voz en streaming orientado a la puerta de conversaciones en tiempo real y a la segmentacion de fronteras fonemicas, lo que sugiere una salida por trama con resolucion temporal fina, pero no se aportan detalles tecnicos verificables.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de horas de audio utilizadas, la composicion del dataset (idiomas, ruido de fondo, tipos de microfono) ni si se aplicaron tecnicas de aumento de datos o calibracion de umbrales. Se desconoce igualmente si el artefacto es una conversion directa de un modelo previo (el nombre "FireRed" sugiere un origen distinto al mantenedor actual) o un entrenamiento propio del ecosistema diarizeapp. La innovacion tecnica documentada se limita al empaquetado: exportacion a ONNX con contexto QDQ estatico para ejecucion en NPU Hexagon HTP de Snapdragon X Elite, ademas de compatibilidad con DirectML y CUDA a traves de ONNX Runtime estandar.

## Capacidades

- Deteccion de actividad de voz en streaming, con decision por trama sobre presencia de voz humana.
- Segmentacion de fronteras fonemicas, util para alinear transcripciones y diarizacion.
- Ejecucion en NPU Hexagon HTP (Snapdragon X Elite) mediante contexto QDQ estatico.
- Aceleracion en GPU via DirectML y CUDA con ONNX Runtime.
- Fallback universal en CPU con SIMD para x86_64 y ARM NEON.
- Integracion en pipelines `audio-to-audio` como etapa de filtrado previo.
- No se documentan capacidades de generacion de texto, codigo, vision, tool calling ni agentes.

## Casos de uso

- Puerta de entrada en asistentes de voz: el VAD filtra silencio y ruido antes de activar el reconocimiento automatico del habla, reduciendo el consumo de GPU en modelos ASR de mayor tamano.
- Diarizacion de reuniones: combinado con un modelo de speaker embedding, las fronteras fonemicas permiten segmentar turnos de habla con precision y asignar hablantes por intervalo.
- Transcripcion de llamadas de atencion al cliente: al ejecutarse en CPU o NPU local, permite procesar audio en el dispositivo sin enviar flujo continuo a la nube, lo que ayuda con requisitos de privacidad.
- Telefonia VoIP y centros de contacto: la deteccion en tiempo real alimenta la supresion de silencios y el control de eco en el cliente, con latencia baja al ejecutarse en el propio terminal.
- Dispositivos de borde con Snapdragon X Elite: el soporte de NPU Hexagon HTP permite mantener el detector activo de forma continua con bajo consumo energetico en portatiles ARM.
- Preprocesado en pipelines de anotacion de audio a gran escala: se puede usar como primer paso para descartar fragmentos sin voz antes de pasar modelos costosos de transcripcion o analisis acustico.
- Sistemas de subtitulado en directo: la segmentacion de fronteras ayuda a cortar el flujo de audio en unidades alineadas con el habla para reducir la latencia de los subtitulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, tasa de falsos positivos, latencia por trama ni comparaciones con otros detectores de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un detector de voz en ONNX, la huella es previsiblemente pequena, pero no se publican cifras.
- GPU recomendadas: no disponible. La model card menciona compatibilidad con CUDA y DirectML, sin especificar modelos concretos (A100, H100, RTX 4090 u otros).
- NPU: soporte documentado para Hexagon HTP en Snapdragon X Elite mediante contexto QDQ estatico.
- CPU: ejecucion universal con SIMD en x86_64 y ARM NEON, lo que permite despliegue en portatiles y dispositivos de borde sin GPU.
- Opciones de despliegue: ONNX Runtime con los execution providers correspondientes (CUDA, DirectML, QNN/Hexagon, CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye detectores de voz alternativos ni datos que permitan una comparacion cuantitativa. Como referencia de categoria, existirian detectores como Silero VAD o WebRTC VAD, pero no se dispone de sus especificaciones en esta busqueda para contrastarlas de forma rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, entrenamiento y evaluacion: no es posible estimar su precision ni su robustez en condiciones de ruido.
- No se especifican idiomas ni dominios de audio cubiertos; el comportamiento en acentos, audio telefónico de banda estrecha o entornos ruidosos es desconocido.
- Riesgo de falsos positivos y negativos sin calibrar: al no publicarse umbrales recomendados ni curvas ROC/DET, el ajuste en produccion tendra que hacerse empiricamente.
- El soporte de NPU esta ligado a un contexto QDQ estatico para Snapdragon X Elite; en otras plataformas la aceleracion puede degradarse al fallback de CPU.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del modelo original ("FireRed") por si existieran obligaciones adicionales no reflejadas en la model card.
- El repositorio tiene un tamano de 0.0 GB y 22 descargas en el momento de la consulta, lo que sugiere un artefacto muy reciente o poco validado por la comunidad.
- No hay garantia de mantenimiento a largo plazo mas alla de la declaracion del autor sobre disponibilidad persistente del asset.

## Enlaces

- HuggingFace: https://huggingface.co/diarizeapp/firered-vad-onnx
- Repositorio del mantenedor: https://github.com/benzy/diarize
