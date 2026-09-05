# resoajoe/room-audio-event-nano

## Resumen

`resoajoe/room-audio-event-nano` es un clasificador de eventos de sonido de sala desarrollado por Joe Cox (usuario `resoajoe` en Hugging Face). Se trata de una CNN de 47.159 parametros que opera sobre espectrogramas log-mel de 1 segundo y etiqueta siete clases de eventos acusticos: tos, habla, alarma/beep, sonido mecanico, puerta/pasos, otra vocalizacion (risa, llanto) y una clase abierta `other`. El modelo se distribuye en formato ONNX con un peso de aproximadamente 188 KB y una latencia medida de 0,4 ms por clip en un hilo de CPU.

Esta pensado para monitorizacion acustica en el borde (edge) donde el envio de audio a un servidor externo no es aceptable, por privacidad o por requisitos de latencia. El entrenamiento se realizo sobre el dataset FSD50K (split de desarrollo), con 300 alarmas sinteticas IEC 60601-1-8 como aumento, y la evaluacion se hizo sobre el split de test de FSD50K, que es disjunto por subidor. El autor advierte explicitamente que el modelo no ha sido probado en grabaciones reales de hospitales, salas o microfonos de habitacion, por lo que su despliegue en ese dominio debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sobre espectrogramas log-mel de 1 segundo |
| Parametros totales | 47.159 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo clasifica sonidos, no texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una CNN pequena que procesa un segmento de audio de 1 segundo convertido a un espectrograma log-mel de 40 bandas y 98 frames. El front-end incluye conversion a mono de 16 kHz, seleccion del segundo mas fuerte (`loudest_second`) y normalizacion con media y desviacion tipica calculadas en el conjunto de entrenamiento. La salida son logits para las siete clases, que se convierten en probabilidades mediante softmax.

El entrenamiento se realizo sobre el split de desarrollo de FSD50K, con una separacion por subidor para evitar contaminacion entre entrenamiento y evaluacion. Se anadieron 300 alarmas sinteticas IEC 60601-1-8 como aumento, aunque el autor indica que retirarlas solo cambia la AP de la clase `alarm` en +0.023 (0.714 a 0.691), por lo que el modelo no depende de reconocer su propio sintetizador. No se ha aplicado RLHF ni DPO. La innovacion principal es el tamano minimo del modelo y su capacidad de rechazo mediante umbrales de confianza, disenado para funcionar en dispositivos de borde.

## Capacidades

- Clasificacion de siete eventos de sonido de sala: tos, habla, alarma/beep, mecanico, puerta/pasos, otra vocalizacion y `other` (open-set).
- Deteccion de presencia de habla: el modelo indica si hay voz, pero no transcribe, no identifica hablantes ni infiere contenido.
- Rechazo de muestras ambiguas: si la diferencia entre las dos probabilidades mas altas es inferior a 0.30, o si el RMS del clip esta por debajo del ruido de fondo mas 6 dB, se devuelve `unknown`.
- Procesamiento en tiempo real en CPU: 0,4 ms por clip en un hilo de CPU.
- No soporta tool calling, generacion de texto, vision ni otras capacidades de modelos de lenguaje.

## Casos de uso

- Monitorizacion de habitaciones de hospital: el modelo puede detectar tos, alarmas y pasos en una habitacion de paciente, pero debe usarse como observacion de eventos, no como diagnostico. La advertencia del autor es clara: no es un dispositivo medico y no debe colocarse donde una deteccion fallida cause dano.
- Domotica y hogar inteligente: deteccion de puertas que se abren, pasos, alarmas o sonidos mecanicos para automatizar luces, avisos o sistemas de seguridad. La baja latencia permite integracion en asistentes locales.
- Monitorizacion de personas mayores en residencias: deteccion de tos, vocalizaciones inusuales (risa, llanto) y eventos de impacto en el suelo. El modelo puede ejecutarse en un dispositivo local sin enviar audio fuera del recinto.
- Seguridad perimetral: en zonas restringidas, el modelo puede detectar sonidos mecanicos, pasos o apertura de puertas, funcionando como sensor acustico de intrusion.
- Monitorizacion de maquinaria industrial: la clase `mechanical` permite detectar sonidos anomalos en equipos, aunque el modelo no distingue tipos de maquina. Puede usarse como primer filtro para alertas de mantenimiento.
- Investigacion en salud: deteccion de tos en estudios epidemiologicos o de seguimiento de sintomas respiratorios. El modelo puede procesar grandes volumenes de audio en un servidor CPU, pero debe validarse en el dominio especifico antes de su uso.

## Benchmarks y rendimiento

Los resultados presentados corresponden al split de evaluacion de FSD50K (2.521 clips), que es disjunto por subidor respecto al entrenamiento. La metrica es Average Precision (AP) one-vs-rest. Se compara con el mejor estadistico escalar simple por clase (varianza temporal, centroide espectral, flatness o nivel) y con la version v1 del mismo modelo.

| Clase | n | Prevalencia | AP del modelo | Mejor AP escalar | Lift | AP v1 (mismo test) |
|---|---|---|---|---|---|---|
| `alarm` | 315 | 0.125 | 0.714 | 0.260 | +0.454 | 0.401 |
| `vocal_other` | 304 | 0.121 | 0.702 | 0.178 | +0.524 | 0.311 |
| `cough` | 302 | 0.120 | 0.676 | 0.246 | +0.431 | 0.630 |
| `door_steps` | 400 | 0.159 | 0.675 | 0.302 | +0.373 | 0.486 |
| `mechanical` | 400 | 0.159 | 0.608 | 0.346 | +0.263 | 0.260 |
| `speech` | 400 | 0.159 | 0.598 | 0.147 | +0.450 | 0.415 |
| `other` | 400 | 0.159 | 0.333 | 0.163 | +0.170 | 0.189 |

El modelo supera a la linea base escalar en +0.17 a +0.52 en todas las clases. No se han publicado benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, etc.) porque no aplica a este tipo de modelo.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo puede ejecutarse en CPU.
- GPU recomendadas: no se necesitan. El entrenamiento se realizo en un Jetson AGX Orin, pero la inferencia es suficientemente ligera para CPU de un solo nucleo.
- Dispositivos compatibles: cualquier sistema con ONNX Runtime, incluidos SBCs y microordenadores, aunque no se ha verificado el rendimiento en plataformas especificas.
- Opciones de despliegue: ONNX Runtime en Python o C++, integrable en aplicaciones de borde. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia: aproximadamente 0,4 ms por clip de 1 segundo en un hilo de CPU.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la informacion proporcionada. La unica comparacion disponible es con la version v1 del mismo modelo, presentada en la tabla de benchmarks. La version v2 muestra mejoras de +0.18 a +0.39 en las clases que anteriormente dependian de una unica fuente de entrenamiento, mientras que la clase `cough` (ya multi-fuente en v1) gana solo +0.046.

## Limitaciones y advertencias

- El modelo no ha sido probado en grabaciones reales de hospitales, salas o microfonos de habitacion. La transferencia de dominio de estudio a sala no se ha medido, y el autor indica que apuntar el modelo a una habitacion real es "ejecutar un experimento".
- La clase `other` (open-set) es la mas debil, con AP 0.333. Cualquier sonido que no se asemeje a las seis clases nombradas se modela pobremente; una baja confianza debe tratarse como `unknown`, no como `other`.
- El modelo detecta presencia de habla, pero no transcribe, no identifica hablantes ni infiere contenido. No debe usarse para esos fines.
- Los falsos positivos de tos estan dominados por risa y limpieza de garganta en la literatura, motivo por el cual `vocal_other` es una clase separada.
- No es un dispositivo medico. No debe sustituir a un sistema de alarma clinico ni colocarse en situaciones donde una deteccion fallida cause dano.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el autor no ofrece garantias de rendimiento en dominios distintos al evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/room-audio-event-nano
- Perfil del autor: https://huggingface.co/resoajoe
- Repositorio `nanolab` mencionado en la model card: https://huggingface.co/resoajoe/nanolab
- Paper de FSD50K (Fonseca et al., TASLP 2022): no se ha encontrado enlace directo en la informacion proporcionada.
