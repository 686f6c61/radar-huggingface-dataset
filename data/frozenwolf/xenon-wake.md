# FrozenWolf/xenon-wake

## Resumen

xenon-wake es un conjunto de modelos de deteccion de palabra de activacion (wake word) disenado para reconocer la frase "Hey xenon" en telefonos y ordenadores. Lo desarrolla FrozenWolf y se distribuye como pesos ONNX para ejecutarse en el dispositivo mediante ONNX Runtime con un unico hilo, sin depender de la nube. El modelo resuelve el problema clasico de activacion por voz con bajo consumo: un detector ligero siempre encendido y un verificador mas costoso que solo se ejecuta cuando el primero dispara.

La arquitectura es una cascada de dos etapas sobre caracteristicas log-mel compartidas. La primera etapa es una red de convolucion temporal causal (TCN) que puntua cada 20 ms y mantiene memoria entre pasos; la segunda es un conformer que examina los ultimos 2 s de audio para confirmar la frase. Los pesos son muy pequenos (entre 167 KB y 6,3 MB por fichero), lo que permite despliegue en dispositivos de gama baja.

Es relevante ahora porque ejemplifica el patron de wake word on-device con licencia abierta y datos de entrenamiento documentados, aunque su alcance es estrecho: solo ingles, una unica frase y un repositorio de 0,0 GB con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada: frontend log-mel, TCN causal (etapa 1) y conformer (etapa 2) |
| Parametros totales | no disponible (tcn-m: aproximadamente 42 mil pesos; resto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 198 frames de audio (aproximadamente 2 s) en la etapa 2 |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (frontend.onnx, tcn-l.onnx, tcn-m.onnx, conformer.onnx, thresholds.json) |

## Arquitectura y entrenamiento

El pipeline procesa audio mono a 16 kHz. El frontend convierte cada 20 ms de sonido (320 muestras mas las 352 anteriores) en dos frames de 40 bandas log-mel, compartidos por ambas etapas para garantizar caracteristicas identicas en todos los dispositivos. La etapa 1 (tcn-l o tcn-m) es una red de convolucion temporal causal que emite una puntuacion cada 20 ms y conserva memoria corta entre pasos mediante entradas adicionales y salidas `new_`. La etapa 2 es un conformer que analiza los ultimos 198 frames (unos 2 s) y solo se ejecuta cuando la etapa 1 dispara, evaluando varias ventanas con desplazamientos (-10, -2, 6, 14, 22, 30) y tomando la mejor puntuacion. Existe ademas una comprobacion de locutor fuera de este repositorio, basada en un modelo de speaker embedding que compara con tres tomas de referencia del usuario.

El entrenamiento usa exclusivamente habla sintetica y datos publicos con licencias que permiten uso comercial. Se generaron 39.214 tomas de "Hey xenon" mas casi fallos como "hey Jason": un 40,5 % con Google Cloud Text-to-Speech, un 0,5 % con Gemini TTS, un 39,4 % con voces Piper y un 19,6 % con Kokoro-82M. El audio real proviene de The People's Speech, LibriSpeech dev-other, Multilingual Spoken Words, MUSAN, DNS Challenge y OpenSLR 28. No se usaron grabaciones reales de la frase ni datos no comerciales o no derivados. No se documenta el uso de RLHF o DPO.

## Capacidades

- Deteccion de palabra de activacion para la frase "Hey xenon" en audio de 16 kHz mono.
- Puntuacion continua cada 20 ms con la etapa TCN y verificacion bajo demanda con el conformer.
- Modo de bajo consumo para dispositivos de gama baja mediante tcn-m (aproximadamente 42 mil pesos).
- Gestion de umbrales configurable a traves de thresholds.json, con valores distintos por etapa y dispositivo.
- Supresion temporal: la etapa 1 se silencia 1,5 s tras abrir el microfono y 2 s tras cada disparo.
- Verificacion de locutor opcional (fuera del repositorio) para reducir activaciones de terceros.
- No soporta tool calling, agentes, vision, audio generativo ni razonamiento multi-paso.

## Casos de uso

- Activacion por voz en aplicaciones moviles: integrar los ficheros ONNX en una app Android o iOS para despertar el asistente sin enviar audio a la nube, aprovechando el bajo coste de la etapa 1 siempre activa.
- Asistentes de escritorio y kioscos: usar tcn-l con el conformer para activar un asistente local en un PC, con 0,63 falsos despertares al dia sobre 345 h de prueba antes de la comprobacion de locutor.
- Dispositivos embebidos de gama baja: desplegar tcn-m (167 KB) en microcontroladores o SoCs limitados donde el presupuesto de memoria y computo es minimo.
- Sistemas de accesibilidad: permitir activacion manos libres de funciones del dispositivo para usuarios con movilidad reducida, con procesamiento local que preserva la privacidad.
- Automatizacion del hogar: activar rutinas locales en altavoces o hubs domoticos sin conexion, usando la cascada para filtrar ruido de fondo con MUSAN y DNS como referencia de entrenamiento.
- Prototipado de wake words personalizadas: reutilizar el frontend y la estructura de dos etapas como base para experimentar con nuevas frases, sustituyendo los datos sinteticos de entrenamiento.
- Filtrado previo en pipelines de ASR: usar la etapa 1 como detector de bajo coste que solo despierte un motor de reconocimiento mayor cuando sea necesario.

## Benchmarks y rendimiento

| Metrica | tcn-l + conformer | tcn-m + conformer |
|---|---|---|
| Umbral etapa 1 | -1.375 | -0.375 |
| Umbral etapa 2 | 2.25 | 2.125 |
| Falsos despertares por dia | 0.63 (sobre 345 h de prueba) | 0.7 |
| Falsos despertares con umbral 3.25 | 0.28 por dia (mas perdidas) | no disponible |
| Tasa de fallo en clips claros en silencio | aproximadamente 0,2 % | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje sino de clasificacion de audio.

## Requisitos de hardware

- VRAM estimada: no disponible; los pesos suman menos de 8 MB en total, por lo que caben en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU; esta disenado para CPU con ONNX Runtime y un solo hilo.
- Cabe en GPU de consumo y en practicamente cualquier SoC movil o microcontrolador con suficiente RAM para ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (libreria declarada), con integracion en apps moviles y de escritorio.
- Latencia y throughput: no disponibles de forma explicita; la etapa 1 emite una puntuacion cada 20 ms y la etapa 2 solo se ejecuta tras un disparo, con ventanas de 2 s.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idioma | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| FrozenWolf/xenon-wake | Cascada TCN + conformer | menos de 8 MB total | en | CC BY-SA 4.0 | 2 s en etapa 2 |
| openWakeWord | Deteccion de wake word | no disponible | en | no disponible | no disponible |
| Porcupine (Picovoice) | Deteccion de wake word comercial | no disponible | multiidioma | propietaria | no disponible |
| Silero VAD | Deteccion de voz | no disponible | independiente | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; los modelos citados son referencias de categoria y sus datos no se han verificado en esta busqueda.

## Limitaciones y advertencias

- Solo reconoce ingles y una unica frase ("Hey xenon"); no es un modelo general de lenguaje ni de audio.
- Los resultados de falsos despertares y fallos provienen de voces sinteticas y habla publica; el comportamiento con personas reales, a distancia o con ruido esta sin validar.
- La comprobacion de locutor no esta incluida en el repositorio, por lo que sin ella cualquier voz puede activar el modelo.
- Riesgo de sesgo por el uso mayoritario de voces TTS de Google (41 % de las tomas), que puede no representar acentos y condiciones reales.
- La licencia CC BY-SA 4.0 obliga a compartir bajo la misma licencia las adaptaciones y a atribuir las fuentes; el propio autor senala que no esta resuelto si los pesos entrenados cuentan como adaptacion.
- Las condiciones de Google Cloud TTS y Gemini API prohiben usar las salidas para construir productos o modelos competidores, lo que puede afectar a usos comerciales derivados.
- El repositorio tiene 0,0 GB y cero descargas, sin senales de mantenimiento ni validacion por la comunidad.
- No hay datos publicados de latencia, consumo energetico ni rendimiento en hardware concreto.

## Enlaces

- Hugging Face: https://huggingface.co/FrozenWolf/xenon-wake
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
