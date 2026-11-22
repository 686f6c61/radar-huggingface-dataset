# gtihq/omniglide

## Resumen

Omniglide es un modelo neuronal compacto de decodificación de gestos de escritura deslizante (swipe typing) para teclados Android, desarrollado por el usuario gtihq. Su funcion es traducir una traza de dedo sobre una disposicion QWERTY en la palabra que el usuario pretendia escribir, sustituyendo el mecanismo geometrico de respaldo de AOSP, que carecia de modelo de lenguaje y generaba candidatos de baja calidad.

El modelo se distribuye como un binario de aproximadamente 2 MB (`swipe_model.bin`) y se ejecuta en el dispositivo mediante JNI (`SwipeJni.cpp`), lo que permite decodificacion completamente offline. Es multilingue en su entrenamiento: usa trazas reales de portugues (pt-BR y pt-PT) procedentes del corpus de HeliBoard y trazas reales de ingles procedentes del corpus de FUTO.

Es relevante para desarrolladores de teclados y aplicaciones de entrada de texto que necesiten una alternativa ligera y local a los sistemas de prediccion basados en servicios en la nube. No es un modelo de lenguaje generativo de proposito general pese a la etiqueta `text-generation` de Hugging Face: su tarea es la clasificacion/decodificacion de gestos sobre un vocabulario de frecuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal compacta sobre trazas normalizadas `[x, y, t]` (detalle de capas no disponible) |
| Parametros totales | no disponible (pesos empaquetados en `swipe_model.bin`, ~2 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una traza de gesto por inferencia) |
| Tipos de cuantizacion | no disponible (formato binario propio para despliegue on-device) |
| Idiomas soportados | multilingue, portugues (pt-BR / pt-PT), ingles |
| Licencia | MIT |
| Formato de pesos | `swipe_model.bin` (binario propio cargado por JNI); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

Omniglide es una red neuronal compacta que recibe trazas de gesto representadas como puntos normalizados `[x, y, t]` (coordenada horizontal, vertical y tiempo) sobre una disposicion QWERTY de Android, y las decodifica contra un vocabulario de frecuencias de palabras construido a partir del mismo corpus de entrenamiento. El modelo se integra en el teclado mediante JNI: `SwipeDecoder.java` carga `swipe_model.bin` y `SwipeJni.cpp` ejecuta la inferencia en el dispositivo. El autor no detalla el numero de capas, dimensiones ocultas ni el mecanismo exacto de decodificacion en la informacion disponible.

Los datos de entrenamiento son trazas reales de gestos: el corpus de HeliBoard para portugues (pt-BR y pt-PT) y el corpus de FUTO para ingles. Los datos brutos y los scripts de entrenamiento se encuentran en `packages/ai-model/gesture-training/` del repositorio fuente. Ademas, la aplicacion incorpora un registro local (`UsageLog.java`) que almacena candidatos ofrecidos, la palabra finalmente confirmada por el usuario y las correcciones posteriores, generando pares de entrenamiento para reentrenar el modelo con el uso real. No se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Decodificacion de gestos de swipe sobre teclado QWERTY Android en la palabra pretendida por el usuario.
- Prediccion de palabras basada en un vocabulario de frecuencias derivado del corpus de entrenamiento.
- Funcionamiento completamente offline en el dispositivo, sin llamadas a servicios externos.
- Soporte multilingue de portugues (pt-BR y pt-PT) e ingles en un unico modelo.
- Integracion mediante JNI en aplicaciones Android (`SwipeDecoder.java`, `SwipeJni.cpp`).
- Registro de uso local (`UsageLog.java`) para capturar pares candidato/palabra confirmada y permitir reentrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento; su alcance es exclusivamente la entrada de texto por gestos.

## Casos de uso

- Teclados Android de codigo abierto: sustitucion del respaldo geometrico de AOSP por un decodificador neuronal que produce palabras reales del vocabulario, mejorando la precision del swipe sin conexion.
- Aplicaciones de mensajeria con requisitos de privacidad: al ejecutarse on-device mediante JNI, las trazas de escritura no abandonan el dispositivo, lo que encaja en entornos con restricciones de tratamiento de datos.
- Distribucion en mercados lusofonos: el entrenamiento con trazas reales de pt-BR y pt-PT permite cubrir variantes del portugues que los teclados genericos suelen tratar de forma deficitaria.
- Entornos sin conectividad: decodificacion offline en dispositivos sin red o con conectividad intermitente, sin dependencia de APIs de prediccion.
- Teclados con presupuesto de almacenamiento minimo: el binario de ~2 MB permite integrarlo en aplicaciones donde un modelo de lenguaje de mayor tamano no seria viable.
- Personalizacion mediante reentrenamiento: el registro de `UsageLog.java` recoge candidatos, palabras confirmadas y correcciones, permitiendo ajustar el modelo al vocabulario y estilo de escritura del usuario.
- Investigacion en interaccion texto-gesto: la disponibilidad de scripts de entrenamiento y datos de HeliBoard y FUTO facilita experimentos con representaciones de trazas `[x, y, t]`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; el modelo se ejecuta en CPU del dispositivo movil. El binario ocupa aproximadamente 2 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no requiere GPU; la inferencia se realiza en el procesador del telefono a traves de JNI.
- Compatibilidad con GPU de consumo: no aplica; el despliegue objetivo es Android on-device.
- Opciones de despliegue: integracion nativa en la aplicacion Android mediante `SwipeJni.cpp` y `SwipeDecoder.java`; el binario se coloca en `res/raw/` y el build de Gradle lo copia desde `packages/ai-model/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Omniglide | Decodificador neuronal de gestos | ~2 MB | pt, en, multilingue | MIT | On-device Android (JNI) |
| Respaldo geometrico de AOSP | Algoritmo geometrico sin modelo de lenguaje | no disponible | dependiente del teclado | AOSP | On-device |
| Motores de swipe comerciales (Gboard, SwiftKey) | Sistemas propietarios con modelos de lenguaje | no disponible | amplio | propietaria | On-device y nube |

No se dispone de datos publicos de rendimiento de Omniglide ni de los sistemas propietarios que permitan una comparacion cuantitativa; la comparativa se limita a caracteristicas de despliegue y licencia.

## Limitaciones y advertencias

- El modelo solo se ha entrenado con trazas de portugues (pt-BR / pt-PT) e ingles; el resto de idiomas no estan cubiertos y no se garantiza su funcionamiento.
- La cobertura lexica depende del vocabulario de frecuencias construido a partir del corpus; palabras poco frecuentes, nombres propios o jerga pueden no estar representadas.
- No es un modelo de generacion de texto pese a la etiqueta `text-generation` de Hugging Face; usarlo como tal no es su proposito ni se ha validado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa publica de precision frente al respaldo geometrico de AOSP ni frente a teclados comerciales.
- El repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0.0 GB; conviene verificar la disponibilidad real de `swipe_model.bin` antes de integrarlo.
- La model card incluye un comando de descarga con el identificador `giofolf/omniglide`, distinto del ID del repositorio (`gtihq/omniglide`); es necesario comprobar cual es el identificador correcto.
- La licencia MIT permite uso comercial, pero el aviso de licencia de la model card remite al repositorio fuente para las noticias completas del motor OpenSwipe vendorizado (tambien MIT); conviene revisar dichas noticias antes de redistribuir.
- La personalizacion mediante `UsageLog.java` implica registrar localmente las palabras escritas por el usuario; su tratamiento debe cumplir la normativa de proteccion de datos aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gtihq/omniglide
- Corpus de gestos de HeliBoard: no disponible (enlace no proporcionado)
- Corpus de gestos de FUTO: no disponible (enlace no proporcionado)
- Repositorio fuente del teclado y scripts de entrenamiento (`packages/ai-model/gesture-training/`): no disponible (enlace no proporcionado)
- Paper o blog tecnico: no disponible
