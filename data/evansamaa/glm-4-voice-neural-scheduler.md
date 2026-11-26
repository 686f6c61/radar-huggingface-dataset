# Evansamaa/glm-4-voice-neural-scheduler

## Resumen

glm-4-voice-neural-scheduler es un ajuste fino (fine-tune) completo del modelo THUDM/glm-4-voice-9b, publicado por el usuario Evansamaa, que reutiliza la arquitectura de 9.544 millones de parametros de GLM-4-Voice para una tarea muy distinta a la generacion de voz: predecir el *timing* de un dialogo hablado. Dado el contenido de lo que dos interlocutores van a decir, codificado como tokens de habla WhisperVQ a 12,5 Hz, el modelo puntua la verosimilitud de una programacion temporal concreta (inicios de turno, pausas, solapamientos y retrocesos o *backchannels*). Es el checkpoint que sustenta el proyecto Neural Scheduler.

El modelo no genera audio ni actua como agente conversacional: es un modelo de puntuacion de secuencias que se emplea dentro de un pipeline de busqueda, donde se generan candidatos de calendario temporal y se conserva el de menor log-verosimilitud negativa. Resuelve un problema especifico de los sistemas de dialogo hablado: decidir *cuando* habla cada participante, no *que* dice. Es relevante por su enfoque poco habitual (modelado de turn-taking con un LLM de voz reconvertido) y porque expone una receta de entrenamiento y evaluacion reproducible.

Tecnicamente es un transformer denso de 9.544.672.192 parametros, derivado de GLM-4-Voice-9B, con vocabulario ampliado en 6 tokens estructurales y 50 pares de marcadores de turno, una embedding de canal de tres vias, posiciones rotatorias compartidas por frame y una cabeza de duracion de 32 clases. Se entreno sobre el split de entrenamiento de Seamless Interaction (716.839 ventanas de 20,48 s) con 16 GPU NVIDIA L40S.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de GLM-4-Voice-9B (ChatGLM); embedding de canal de 3 vias, posiciones rotatorias compartidas por frame y cabeza de duracion de 32 clases |
| Parametros totales | 9.544.672.192 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (ventanas de entrenamiento de 20,48 s; 80 ms por frame de dialogo) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | glm-4-voice (uso academico gratuito; uso comercial requiere registro con Zhipu AI) |
| Formato de pesos | safetensors (bf16, 4 shards, 19,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de los pesos completos de THUDM/glm-4-voice-9b y los ajusta integramente (todos los parametros). Introduce cuatro modificaciones: una embedding aprendida de canal de tres vias (script / hablante A / hablante B) sumada a las queries y keys de atencion; posiciones rotatorias compartidas por los dos tokens de un mismo frame; una cabeza de duracion que predice, para cada token de dialogo, cuantos frames mas continua ese token en su canal (32 clases, la ultima significa "31 o mas"); y 6 tokens estructurales mas 50 pares de marcadores de turno anadidos al vocabulario (ids 168736-168841), sin redimensionar la matriz de embeddings.

La entrada se estructura en tres bloques: los scripts de cada hablante con sus tokens de habla WhisperVQ a 12,5 Hz agrupados por turnos, y el dialogo intercalado frame a frame a 80 ms con tokens de silencio donde un hablante calla. La perdida combina entropia cruzada de siguiente token sobre la region de dialogo mas 0,5 veces la entropia cruzada de duracion. El entrenamiento uso el split de entrenamiento de Seamless Interaction (habla improvisada y naturalista): 716.839 ventanas de 20,48 s para entrenamiento y 9.700 ventanas del split de test para validacion, con preprocesado mediante Silero VAD v6.0. Se ejecuto en 4 nodos de 4 NVIDIA L40S (16 GPU) con DeepSpeed ZeRO-3 y offload a CPU en bf16, batch efectivo de 64 ventanas, learning rate 5e-5 con warm-up del 1 % de los pasos y luego constante. El checkpoint publicado corresponde al paso 15.200 de 22.098 (epoca 1,38; la ejecucion se detuvo por limite de tiempo), con perdida de validacion combinada de 0,3917; el minimo fue 0,3788 en el paso 14.700.

## Capacidades

- Puntuacion de verosimilitud temporal: dado el contenido de dos hablantes, estima la probabilidad de una programacion concreta del dialogo (inicios de turno, pausas, solapamientos y retrocesos).
- Modelado de turn-taking: aprende patrones de cesion de palabra y de interrupcion a partir de habla naturalista.
- Modelado de backchannels: representa posiciones de retroalimentacion breve del oyente dentro del dialogo.
- Prediccion de duracion: la cabeza de duracion estima cuantos frames adicionales continua cada token en su canal.
- Procesamiento de tokens de habla: opera sobre codigos WhisperVQ de GLM-4-Voice a 12,5 Hz, no sobre audio crudo.
- Integracion en pipeline: se usa en busqueda de candidatos (seleccion por menor log-verosimilitud negativa), no por muestreo autoregresivo.
- No soporta tool calling, function calling, agentes, vision, audio de entrada directa ni modo de razonamiento explicito; no es un generador de texto ni de voz.

## Casos de uso

- Investigacion en turn-taking: servir como modelo de referencia para medir la naturalidad de calendarios temporales en dialogos hablados generados o reales, comparando log-verosimilitudes entre candidatos.
- Generacion de estimulos para pruebas de escucha: el pipeline construye programaciones candidatas y selecciona la mejor puntuada; el checkpoint es el que sustenta los estimulos del proyecto Neural Scheduler.
- Sistemas de sintesis de dialogo hablado (TTS conversacional): dado el texto o los tokens de habla de dos interlocutores, decidir cuando entra cada uno y donde insertar pausas y solapamientos antes de sintetizar el audio final.
- Evaluacion automatica de naturalidad conversacional: puntuar grabaciones o generaciones existentes y detectar calendarios temporales poco plausibles (pausas excesivas, solapamientos anomalos).
- Entrenamiento por imitacion de agentes conversacionales: usar las programaciones mejor puntuadas como datos de referencia para politicas de cesion de turno en sistemas de dialogo.
- Analisis de corpus de habla: estudiar distribuciones de duracion de turno, silencios y retrocesos en funcion del contenido, aplicando el modelo como puntuador sobre corpus de Seamless Interaction o similares.
- Prototipado de interfaces de voz con barge-in: validar si una politica de interrupcion produce calendarios temporalmente verosimiles antes de desplegarla en un sistema real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion del entrenamiento: 0,3917 en el paso 15.200 (combinada) y minimo de 0,3788 en el paso 14.700, sobre 9.700 ventanas del split de test de Seamless Interaction.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y cache; en la practica se recomienda al menos 24 GB.
- GPU recomendadas: NVIDIA L40S (la usada en entrenamiento), A100 40/80 GB, H100; en consumer, RTX 4090 (24 GB) es el minimo practico en bf16.
- Cuantizacion: no se documentan pesos GGUF ni cuantizaciones oficiales; no hay datos de VRAM para formatos de 8 o 4 bits.
- Despliegue: la arquitectura no forma parte de `transformers`; requiere el paquete `neural_scheduler` (`pip install "neural-scheduler[pipeline] @ git+https://github.com/EvanSamaa/NeuralSchedularRelease@refactor/initial-release"`) y `transformers` 4.46. No es compatible con vLLM, llama.cpp, Ollama ni TGI de forma estandar.
- Latencia y throughput: no disponibles. El uso previsto es por lotes dentro de un pipeline de busqueda de candidatos, no en streaming interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glm-4-voice-neural-scheduler | 9.544 M | no disponible (ventanas de 20,48 s) | Puntuacion de timing de dialogo | glm-4-voice (comercial con registro) | Hugging Face |
| THUDM/glm-4-voice-9b (base) | 9.000 M aprox. | no disponible | Dialogo de voz extremo a extremo | glm-4-voice | Hugging Face |
| Modelos de turn-taking dedicados (p. ej. clasificadores de fin de turno) | no disponible | no disponible | Prediccion de cesion de turno | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria es limitada: no se dispone de datos de benchmarks ni de especificaciones de modelos comparables de turn-taking en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles conversacional: entrenado exclusivamente con Seamless Interaction; no hay evidencia de generalizacion a otros idiomas ni a habla leida o formal.
- No es un generador: modela el timing de contenido dado; no sintetiza voz ni mantiene conversaciones.
- Sesgos de dominio: el corpus de entrenamiento es habla improvisada y naturalista; el comportamiento puede degradarse en dominios muy distintos (call centers, lectura de noticias, habla con acento no representado).
- Riesgo de sobreajuste al corpus: la perdida de validacion minima (0,3788) y el checkpoint publicado (0,3917) corresponden a la epoca 1,38; el entrenamiento se detuvo por limite de tiempo, no por convergencia.
- Rarezas de implementacion: las posiciones rotatorias se calcularon con un defecto de padding durante el entrenamiento (los tokens de padding contaban como tokens de script); la inferencia sin padding, como en el pipeline, es la que usa el codigo publicado. Hay comportamientos adicionales documentados en KNOWN_ISSUES.md.
- Licencia: los pesos derivan de GLM-4-Voice-9B y estan sujetos a la licencia glm-4-voice; el uso comercial exige registro con Zhipu AI. Los datos de entrenamiento (Seamless Interaction) son CC BY-NC 4.0, lo que anade restricciones no comerciales.
- Dependencia de codigo externo: requiere el paquete `neural_scheduler` y `transformers` 4.46 con `trust_remote_code` para el tokenizer; no hay soporte en ecosistemas estandar.
- Sin cuantizaciones oficiales ni datos de latencia, lo que complica su despliegue en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Evansamaa/glm-4-voice-neural-scheduler
- Modelo base: https://huggingface.co/THUDM/glm-4-voice-9b
- Repositorio del proyecto Neural Scheduler: https://github.com/EvanSamaa/NeuralSchedularRelease
- Documentacion del pipeline: https://github.com/EvanSamaa/NeuralSchedularRelease/blob/refactor/initial-release/docs/pipeline.md
- Documentacion de datos: https://github.com/EvanSamaa/NeuralSchedularRelease/blob/refactor/initial-release/docs/data.md
- Problemas conocidos: https://github.com/EvanSamaa/NeuralSchedularRelease/blob/refactor/initial-release/docs/KNOWN_ISSUES.md
