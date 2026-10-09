# AlexeyNe/supertonic-3-android-onnx

## Resumen

AlexeyNe/supertonic-3-android-onnx es una recompilación de los grafos ONNX del modelo de síntesis de voz Supertone/supertonic-3, optimizada específicamente para ejecutarse en tiempo real sobre CPUs ARM de gama baja presentes en teléfonos Android. No se trata de un modelo nuevo entrenado desde cero, sino de una re-layout de los mismos pesos y voces del modelo original, con los grafos reescritos para que ONNX Runtime pueda repartir la carga entre todos los núcleos de un SoC móvil.

El modelo base, Supertonic 3, es un sistema de text-to-speech de 99 millones de parámetros desarrollado por Supertone, publicado con pesos abiertos y pensado para inferencia local por CPU mediante ONNX Runtime, sin GPU ni llamadas a la nube. Soporta 31 idiomas y es la tercera generación de la familia, que amplía el soporte idiomático desde los 5 idiomas de la versión anterior y reduce los fallos de lectura por repetición u omisión de fragmentos.

La relevancia de esta conversión concreta está en el rendimiento medido: en un Samsung Galaxy A12s con SoC Exynos 850 (8 núcleos Cortex-A55 sin instrucciones dot-product), esta build alcanza un factor de tiempo real (RTF) de 0,86 con 8 hilos y 4 pasos de difusión, frente a 3,0 y 5,1 de las builds int8 de sherpa-onnx en el mismo dispositivo. Es decir, pasa de ser más lenta que el tiempo real a sintetizar por debajo de él, lo que habilita TTS fluido en hardware móvil de gama de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS por difusion con modulos separados en ONNX: duration_predictor, text_encoder, vector_estimator (estimador de flujo/difusion, se ejecuta por paso) y vocoder |
| Parametros totales | 99 M (heredados del modelo base Supertone/supertonic-3) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de sintesis de voz; la entrada es texto plano, sin ventana de contexto de LLM) |
| Tipos de cuantizacion | Pesos en fp16 con cast a fp32 al cargar (text_encoder y vocoder); int8 dinamico por canal en las MatMul del vector_estimator; fp32 en el resto. La build de referencia de sherpa-onnx usa int8 |
| Idiomas soportados | 31 idiomas en el modelo base; la lista concreta no se detalla en la informacion disponible para esta conversion |
| Licencia | BigScience OpenRAIL-M (openrail), la misma que el modelo original |
| Formato de pesos | ONNX (duration_predictor.onnx, text_encoder.onnx, vector_estimator.onnx, vocoder.onnx) mas tts.json, unicode_indexer.bin y voice.bin |
| Tamano del repositorio | 0,1 GB |
| Version del modelo base | Supertone/supertonic-3, revision 3cadd1ee |
| Libreria declarada | supertonic |

## Arquitectura y entrenamiento

El modelo base Supertonic 3 es un sistema de sintesis de voz de tipo difusion/flow-matching dividido en cuatro etapas encadenadas: un predictor de duracion (duration_predictor), un codificador de texto (text_encoder), un estimador vectorial que se ejecuta una vez por cada paso de difusion (vector_estimator) y un vocoder que convierte la representacion latente en onda de audio. El text_encoder y el vocoder son grafos de convenciones; el vector_estimator concentra la mayor parte del coste computacional porque se invoca repetidamente dentro del bucle de difusion.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Los datos publicos disponibles indican que Supertonic 3 amplia el soporte de 5 a 31 idiomas respecto a Supertonic 2, mejora la estabilidad de lectura y reduce los fallos de repeticion y omision, y que mantiene compatibilidad de activos ONNX publicos con la version anterior.

Las innovaciones tecnicas de esta conversion concreta son tres. La primera es sustituir convoluciones 1x1 por operaciones MatMul (reescritura Transpose · MatMul · Transpose): ONNX Runtime reparte una convolucion puntual solo entre el lote, que es 2 en el vector_estimator y 1 en el vocoder, dejando la mayoria de nucleos inactivos, mientras que una MatMul se divide entre todos ellos. La reescritura produce salidas identicas a nivel de bit. La segunda es aplicar cuantizacion int8 dinamica por canal unicamente al vector_estimator, ya que un vocoder cuantizado introduce ruido audible y por eso se mantiene en fp32. La tercera es almacenar los pesos en fp16: ONNX Runtime pliega el Cast de un inicializador al crear la sesion, de modo que los pesos ocupan la mitad en disco y se ejecutan a la misma velocidad.

## Capacidades

- Sintesis de voz (text-to-speech) en 31 idiomas, segun las capacidades heredadas del modelo base Supertone/supertonic-3.
- Multiples estilos de voz seleccionables, incluidos en voice.bin y compartidos con el modelo original.
- Inferencia totalmente local y offline: no requiere GPU, nube ni API externa.
- Ejecucion en tiempo real sobre CPU ARM de gama baja, con RTF de 0,86 en un Exynos 850.
- Control del compromiso calidad/velocidad mediante el numero de pasos de difusion (4 en la medicion optimizada, hasta 8 en configuraciones previas).
- Etiquetas de expresion, segun la informacion publicada sobre la version 3 del modelo base.
- Soporte de tool calling / function calling: no aplica; es un modelo de voz, no un LLM.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de vision o audio de entrada: no disponible; el pipeline declarado es text-to-speech.

## Casos de uso

- Lectura por voz en aplicaciones Android de gama baja: al alcanzar RTF 0,86 en un Exynos 850, el modelo puede narrar texto en tiempo real en telefonos economicos sin depender de servicios en la nube ni de conectividad.
- Accesibilidad para personas con discapacidad visual: integracion como lector de pantalla offline, con privacidad total porque el texto nunca abandona el dispositivo.
- Asistentes de voz embebidos: generacion de respuestas habladas en asistentes locales que combinan un LLM pequeno con este TTS, evitando latencia de red y costes de API.
- Navegacion y avisos en automocion: anuncios de rutas o alertas del vehiculo generados en el propio head unit, sin depender de cobertura movil.
- Lectura de noticias, correos o articulos en aplicaciones de lectura: el usuario puede escuchar contenido largo mientras el modelo sintetiza por debajo del tiempo real.
- Aprendizaje de idiomas: practica de pronunciacion en 31 idiomas con voces sintetizadas localmente y reproduccion instantanea.
- Videojuegos y experiencias interactivas: dialogo de personajes generado en el dispositivo sin enviar texto a servidores externos, util en titulos sin conexion permanente.
- Dispositivos IoT y domotica con CPU ARM: respuestas habladas en altavoces inteligentes o paneles de control que no disponen de acelerador grafico.
- Aplicaciones de salud o legalidad con datos sensibles: al ejecutarse offline, el texto dictado no se transmite, lo que facilita el cumplimiento de requisitos de privacidad estrictos.

## Benchmarks y rendimiento

Medido en un Samsung Galaxy A12s (SoC Exynos 850, 8 nucleos Cortex-A55 sin dot-product), ONNX Runtime 1.24.2, 8 hilos intra-op y 4 pasos de difusion:

| Build | Factor de tiempo real (RTF) |
|---|---|
| sherpa-onnx int8, 2 hilos, 8 pasos | 5,1 |
| sherpa-onnx int8, 8 hilos, 5 pasos | 3,0 |
| Esta build, 8 hilos, 4 pasos | 0,86 |

Un RTF inferior a 1 indica sintesis mas rapida que el tiempo real. No se han publicado otros resultados de benchmarks (MOS, WER de transcripcion, comparativas de calidad perceptual) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia por CPU y no requiere GPU.
- Dispositivo de referencia validado: Samsung Galaxy A12s con Exynos 850 (8x Cortex-A55, sin dot-product), 8 hilos intra-op.
- CPU recomendada: cualquier ARM de 64 bits con al menos 8 nucleos; la ausencia de dot-product no impide el funcionamiento.
- Cabe en GPU de consumo: no aplica; el objetivo es ejecucion en CPU de movil. Puede ejecutarse en CPU de escritorio mediante ONNX Runtime.
- Almacenamiento: el repositorio ocupa aproximadamente 0,1 GB, y los pesos se almacenan en fp16 para reducir el espacio en disco.
- Opciones de despliegue: ONNX Runtime (version 1.24.2 en las mediciones), libreria `supertonic`, integracion Android, y alternativas comunitarias basadas en sherpa-onnx.
- Latencia y throughput: RTF de 0,86 con 4 pasos de difusion y 8 hilos en el dispositivo de referencia; el coste escala con el numero de pasos de difusion.
- Reproducibilidad: la conversion se genera con el script incluido `uv run build-supertonic-pack.py OUT`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| AlexeyNe/supertonic-3-android-onnx | 99 M (heredados) | 31 (base) | ONNX | OpenRAIL-M | RTF 0,86 en Exynos 850, 8 hilos, 4 pasos |
| csukuangfj2/sherpa-onnx-supertonic-3-tts-int8-2026-05-11 | 99 M (heredados) | 31 (base) | ONNX int8 | OpenRAIL-M | RTF 3,0 con 8 hilos y 5 pasos; RTF 5,1 con 2 hilos y 8 pasos |
| aoiandroid/supertonic-3 | no disponible | no disponible | ONNX | no disponible | no disponible |
| Supertone/supertonic-3 (original) | 99 M | 31 | ONNX, compatible con v2 | OpenRAIL-M | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- La calidad de audio del vocoder se mantiene en fp32 porque una cuantizacion int8 del vocoder introduce ruido audible; cualquier modificacion en ese sentido degrada la salida.
- Los resultados de RTF estan medidos en un unico dispositivo (Exynos 850); el rendimiento en otros SoC puede variar de forma significativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria de su comportamiento en produccion.
- La licencia es BigScience OpenRAIL-M (openrail), no una licencia permisiva estandar: incluye restricciones de uso que se aplican tanto al modelo original como a esta conversion.
- No se dispone de la lista explicita de los 31 idiomas soportados en esta conversion, ni de la lista de voces incluidas en voice.bin.
- No se han publicado datos sobre sesgos, tasas de alucinacion o errores de pronunciacion especificos de esta build.
- Al ser un modelo de sintesis de voz, no admite tool calling, razonamiento multi-paso ni entradas multimodales.
- La fecha de creacion del repositorio (2026-10-08) y los datos de la model card deben verificarse contra la fuente antes de desplegarlo.
- El uso de las voces puede estar sujeto a las condiciones de la licencia OpenRAIL-M, que limita ciertos usos (por ejemplo, suplantacion o generacion de contenido enganoso).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlexeyNe/supertonic-3-android-onnx
- Modelo base en HuggingFace: https://huggingface.co/Supertone/supertonic-3
- Build de referencia de sherpa-onnx: https://huggingface.co/csukuangfj2/sherpa-onnx-supertonic-3-tts-int8-2026-05-11
- Build comunitaria alternativa: https://huggingface.co/aoiandroid/supertonic-3/tree/main/onnx
- Sitio oficial de Supertonic 3: https://supertonic3.github.io/
- Articulo de MarkTechPost sobre Supertonic v3: https://www.marktechpost.com/2026/05/15/supertone-releases-supertonic-v3-on-device-text-to-speech-model-with-31-language-support-fewer-reading-failures-and-expression-tags/
- Ficha en The AI Bench: https://theaibench.ai/models/supertonic-3/
