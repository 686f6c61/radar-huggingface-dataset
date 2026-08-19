# AXERA-TECH/fastenhancer.axera

## Resumen

FastEnhancer.AXERA es un paquete de inferencia optimizado para la plataforma AX650 de AXERA (爱芯元智), que implementa el modelo de mejora de voz FastEnhancer, presentado en ICASSP 2026. Se trata de un modelo de audio-audio que reduce el ruido en señales de voz, disponible en dos variantes de frecuencia de muestreo (16 kHz y 48 kHz), compilado al formato axmodel para ejecución directa en el acelerador NPU3 de AX650.

El repositorio incluye modelos precompilados (148-153 KB), un SDK de Python basado en numpy y pyaxengine (sin dependencias de torch ni onnxruntime), ejecutables C++ listos para usar en placa, y scripts de demostración. Los resultados publicados muestran un factor de tiempo real (RTF) de 0.02 en C++ para la variante de 16 kHz, lo que indica que el procesamiento es sustancialmente más rápido que la duración del audio, permitiendo operación en tiempo real en el dispositivo.

La relevancia de este lanzamiento radica en que proporciona un flujo completo de despliegue de mejora de voz en hardware de borde de bajo consumo, con licencia MIT, dirigido a desarrolladores que trabajan con dispositivos embebidos AX650 y necesitan una solución de audio lista para producción sin necesidad de compilar ni ajustar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastEnhancer (ICASSP 2026), arquitectura interna no publicada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de audio, procesamiento por tramas) |
| Tipos de cuantizacion | Precompilado para NPU3 (axmodel), formato de cuantizacion no especificado |
| Idiomas soportados | no disponible (mejora de voz independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | axmodel (formato propietario para NPU3 de AX650) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo FastEnhancer. Se sabe que es un modelo de mejora de voz presentado en ICASSP 2026, y que el repositorio ofrece dos variantes precompiladas para 16 kHz y 48 kHz. El proyecto original FastEnhancer está disponible en GitHub, pero el README no proporciona detalles sobre la topología de red, el número de parámetros ni el proceso de entrenamiento.

El paquete de AXERA se centra en la conversión y despliegue: los modelos se han convertido al formato axmodel para ejecución en el acelerador NPU3 de la plataforma AX650, e incluyen metadatos en `model_meta.json` para cada variante. No se dispone de información sobre el dataset de entrenamiento, el número de tokens (en este caso, horas de audio) ni el uso de técnicas como RLHF o DPO, que no aplican a modelos de audio de este tipo.

## Capacidades

- Mejora de voz: reduce el ruido en señales de voz, con reducción RMS del 13 % (16 kHz) y 12 % (48 kHz) según las pruebas del autor.
- Inferencia en tiempo real: RTF de 0.02 (C++, 16 kHz) y 0.06 (C++, 48 kHz) en placa AX650, lo que permite procesamiento en tiempo real.
- Dos frecuencias de muestreo: variantes para 16 kHz y 48 kHz, cubriendo aplicaciones de voz y audio de mayor calidad.
- Despliegue flexible: SDK de Python (numpy + pyaxengine) y ejecutables C++ precompilados, sin necesidad de compilar en placa.
- Integración con el ecosistema AXERA: compatible con Magnetar, la herramienta de despliegue de modelos de AXERA, y con el SDK pyaxengine.
- Procesamiento audio-audio: pipeline completo de entrada y salida de audio, con ejemplos de comparación incluidos en el repositorio.

## Casos de uso

- Sistemas de conferencia y videollamadas en dispositivos embebidos: el modelo puede integrarse en dispositivos AX650 para limpiar la señal de micrófono en tiempo real, mejorando la inteligibilidad en entornos ruidosos, gracias a su RTF de 0.02 en C++.
- Asistentes de voz en el borde: antes de enviar la voz a un modelo de reconocimiento de voz, FastEnhancer puede preprocesar la señal para reducir ruido de fondo, mejorando la precisión del ASR en dispositivos con recursos limitados.
- Grabación de campo y periodismo: la variante de 48 kHz permite mejorar la calidad de grabaciones en exteriores con viento o tráfico, manteniendo una mayor fidelidad de audio.
- Intercomunicadores y sistemas de seguridad: integración en sistemas de intercomunicación basados en AX650 para clarificar comunicaciones en entornos industriales o públicos ruidosos.
- Dispositivos médicos de teleasistencia: mejora de la calidad de voz en dispositivos de monitorización remota de pacientes, donde la claridad de la comunicación es crítica.
- Prototipado rápido de productos de audio: el SDK de Python permite validar el rendimiento del modelo en pocas líneas de código, ideal para equipos que evalúan la viabilidad de la mejora de voz en sus productos.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks académicos estándar (como PESQ, STOI o Si-SNR). El autor proporciona métricas de rendimiento en placa:

| Variante | Reduccion RMS | Python RTF | C++ RTF |
|---|---|---|---|
| fastenhancer_t_16k | -13 % | 0.20 | 0.02 |
| fastenhancer_t_48k | -12 % | 0.31 | 0.06 |

RTF = tiempo de inferencia / duración del audio, medido en placa AX650 sin incluir el tiempo de carga del modelo. Un RTF inferior a 1.0 indica capacidad de procesamiento en tiempo real. No se han publicado comparaciones con otros modelos de mejora de voz en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: chip AX650 de AXERA, con acelerador NPU3.
- Memoria: los modelos ocupan 148-153 KB, por lo que el consumo de memoria es mínimo.
- Ejecución: los ejecutables C++ en `bin/` están precompilados para AX650 y no requieren compilación en placa.
- SDK de Python: requiere Python 3.10, numpy y pyaxengine (paquete wheel disponible en el repositorio de lanzamientos de AXERA).
- Dependencias: no requiere torch ni onnxruntime en tiempo de inferencia.
- Despliegue: se puede integrar con Magnetar, la herramienta de despliegue de modelos de AXERA, y con el SDK ax-llm para servicios compatibles con OpenAI.
- Latencia: RTF de 0.02 (C++, 16 kHz) y 0.06 (C++, 48 kHz) en placa AX650, lo que implica que el procesamiento es 50 y 16 veces más rápido que la duración del audio respectivamente.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos equivalentes de mejora de voz en hardware de borde. Los modelos comparables en el dominio (como RNNoise, DeepFilterNet o DNS models) no han sido evaluados en la misma plataforma AX650, y el repositorio no proporciona métricas estandarizadas (PESQ, STOI) que permitan una comparación objetiva. La información disponible se limita a la reducción RMS y al rendimiento en placa.

## Limitaciones y advertencias

- La arquitectura interna, el número de parámetros y los detalles de entrenamiento no están publicados en la información disponible.
- Las métricas de rendimiento (reducción RMS, RTF) provienen del autor y no han sido verificadas de forma independiente.
- El modelo está precompilado exclusivamente para la plataforma AX650/NPU3; no se puede ejecutar en otras arquitecturas sin reconvertir el modelo.
- No se han publicado evaluaciones de robustez ante tipos específicos de ruido (no estacionario, música de fondo, etc.).
- La licencia MIT permite uso comercial, pero el modelo original FastEnhancer tiene su propia licencia que debe consultarse en el repositorio de referencia.
- El repositorio tiene un número muy reducido de descargas (7) y no cuenta con comunidad activa, por lo que el soporte puede ser limitado.
- No se especifican requisitos de memoria RAM del sistema ni latencia de carga del modelo en placa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AXERA-TECH/fastenhancer.axera
- Repositorio GitHub de FastEnhancer.AXERA: https://github.com/AXERA-TECH/fastenhancer.axera
- Proyecto original FastEnhancer: https://github.com/aask1357/fastenhancer
- SDK pyaxengine: https://github.com/AXERA-TECH/pyaxengine/releases/latest
- Herramienta Magnetar: https://github.com/AXERA-TECH/Magnetar
- Organización AXERA en GitHub: https://github.com/AXERA-TECH
- Sitio web de AXERA Semiconductor: https://axera-tech.com/en
