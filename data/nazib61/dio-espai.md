# nazib61/dio-espai

## Resumen

dio-espai es un repositorio de modelos de IA embebidos orientados a microcontroladores, publicado por el usuario nazib61 en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de una coleccion de artefactos TinyML pensados para ejecutarse en placas ESP32 y MCU similares, donde los recursos de memoria y computo son extremadamente limitados. La seccion actualmente disponible, `motor_control/`, contiene un clasificador de intenciones de aproximadamente 11.000 parametros que traduce ordenes en texto a comandos de motor.

El modelo de control de motor expone cuatro cabezas de salida (`action`, `direction`, `turn`, `speed_pct`) y esta destinado a la ESP32-C3 Super Mini, con inferencia en C/C++ sin dependencia de Python en el dispositivo. El repositorio incluye pesos entrenados, el dataset, codigo de entrenamiento e inferencia en Python, cabeceras C (`model_data.h`, `motor_ai_infer.h`) y un ejemplo de Arduino para ESP32.

Su relevancia reside en el nicho: demuestra un flujo completo de extremo a extremo para llevar un modelo neuronal a un MCU de bajo coste, con artefactos listos para integrar en firmware. No hay informacion publica sobre licencia, idiomas ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de intenciones neuronal con 4 cabezas de salida (`action`, `direction`, `turn`, `speed_pct`); topologia interna no disponible |
| Parametros totales | Aproximadamente 11.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo sin estado, procesa una frase de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pesos entrenados incluidos en el repositorio y cabecera C `model_data.h`; formato exacto no disponible |

## Arquitectura y entrenamiento

La informacion disponible describe un clasificador de intenciones pequeno y sin estado (*stateless*), con cuatro cabezas que predicen accion, direccion, giro y porcentaje de velocidad a partir de una frase en texto. El modelo esta disenado para inferencia en C/C++ sobre ESP32-C3, lo que implica una red de muy baja profundidad y un presupuesto de memoria compatible con un MCU. La topologia concreta (capas, funciones de activacion, tokenizacion) no se detalla en la informacion proporcionada.

El repositorio incluye el dataset de entrenamiento y el codigo de entrenamiento en Python, lo que permite reproducir o ampliar el modelo. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; para un clasificador de este tamano, lo habitual seria entrenamiento supervisado, pero este dato no esta confirmado en la informacion disponible. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de intenciones de texto a comandos de motor: extrae accion, direccion, giro y porcentaje de velocidad de una frase como "turn left slowly".
- Inferencia en dispositivo: ejecucion en C/C++ sobre ESP32-C3 Super Mini, sin Python en el MCU.
- Integracion con Arduino: incluye un ejemplo de Arduino para ESP32.
- Flujo reproducible: pesos, dataset y scripts de entrenamiento e inferencia en Python incluidos.
- Modelo sin estado: cada prediccion es independiente, sin memoria de turnos previos.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Control por voz o texto de robots de bajo coste: el clasificador traduce ordenes a comandos de motor ejecutables en la ESP32-C3, lo que permite construir un robot diferencial con interfaz en lenguaje natural sin depender de la nube.
- Domotica y actuadores motorizados: integracion en firmware Arduino para interpretar ordenes de movimiento (por ejemplo, abrir o cerrar una persiana) con un modelo de 11.000 parametros que cabe en memoria del MCU.
- Prototipado educativo de TinyML: el repositorio sirve como ejemplo completo de entrenamiento en Python y despliegue en C para ensenar el ciclo de vida de un modelo embebido.
- Robots de competicion o vehiculos experimentales: la salida de velocidad y giro permite mapear directamente a un driver de motores, con latencia local y sin conexion de red.
- Sistemas con requisitos de privacidad: al ejecutarse en el dispositivo, las ordenes no salen del MCU, lo que resulta adecuado para entornos donde no se puede enviar texto a un servicio externo.
- Base para ampliar con nuevas secciones: el repositorio esta organizado por carpetas y el autor planea anadir secciones de conduccion y percepcion, de modo que el modelo de motor puede reutilizarse como componente de un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Objetivo principal: ESP32-C3 Super Mini, con inferencia en C/C++ y sin Python en el dispositivo.
- VRAM: no aplica; el modelo corre en memoria del MCU. El consumo exacto de RAM y flash no esta disponible en la informacion proporcionada.
- GPU: no requiere GPU para inferencia en dispositivo. Para el entrenamiento en Python no se especifican requisitos.
- GPU de consumo: no aplica al despliegue; el modelo esta pensado para MCU, no para GPU.
- Opciones de despliegue: cabeceras C `model_data.h` y `motor_ai_infer.h` con funcion `motor_ai_predict_text`, mas un ejemplo de Arduino para ESP32.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores TinyML para control de motor en ESP32) con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo solo clasifica intenciones de control de motor; no es un modelo de lenguaje general ni responde preguntas abiertas.
- Modelo sin estado: no mantiene contexto entre peticiones, por lo que no sirve para dialogos multi-turno.
- Idiomas no documentados: se desconoce que lenguas entiende y con que cobertura; el ejemplo de la model card esta en ingles.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en un producto.
- Sin benchmarks publicados: no hay metricas de precision por cabeza ni evaluacion del dataset, lo que dificulta estimar su fiabilidad en produccion.
- Riesgo de alucinacion y errores de clasificacion: al ser un clasificador pequeno, frases fuera de distribucion pueden producir comandos de motor incorrectos; es recomendable anadir validacion y limites de seguridad en el firmware.
- Sesgos: no documentados; el dataset incluido determina el comportamiento y no se describe su composicion.
- Madurez: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026, sin evidencia de uso externo ni mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/nazib61/dio-espai
- Seccion de control de motor: https://huggingface.co/nazib61/dio-espai/tree/main/motor_control
- README de control de motor: https://huggingface.co/nazib61/dio-espai/blob/main/motor_control/README.md
