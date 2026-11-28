# anabaena/firebot-voice-intent

## Resumen

Firebot Voice Intent es un clasificador de intenciones de voz disenado para Firebot, una plataforma de robot autonomo de extincion de incendios de caracter tactico. Lo desarrolla el usuario anabaena y se publica bajo licencia MIT. El modelo resuelve un problema muy concreto: reconocer comandos de voz cerrados en entornos operativos ruidosos con latencia minima, sin depender de conectividad a servicios en la nube. Es, por tanto, un componente de un sistema embebido de robotica mas que un modelo de lenguaje generalista.

Tecnicamente no es un transformer completo entrenado desde cero, sino un sistema en dos etapas: un encoder Whisper congelado (variantes `tiny.en` o `base.en`) que produce embeddings de audio de 384 dimensiones, y una cabeza MLP ligera con regularizacion L2-SP que clasifica esos embeddings en 15 clases cerradas de comando. Se complementa con un modulo de verificacion biométrica de locutor basado en ECAPA-TDNN (embeddings de 192 dimensiones) y un mecanismo de calibracion few-shot por operador.

Su relevancia radica en el rendimiento declarado: 94,2 % de precision base y hasta un 98,8-100 % con personalizacion de 3-5 tomas por comando, con una latencia de unos 35 ms en CPU y una huella de memoria de aproximadamente 75 MB (encoder congelado) mas 210 KB (cabeza MLP). Es un ejemplo de diseno de inferencia offline de bajo coste para robotica de misiones criticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper congelado (tiny.en / base.en) + cabeza MLP (LayerNorm -> Linear 384x128 -> GELU -> Dropout -> Linear 128x15) con regularizacion L2-SP; verificacion de locutor ECAPA-TDNN |
| Parametros totales | No disponible (cabeza MLP de ~210 KB; encoder Whisper tiny congelado de ~75 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (clasificacion por utterance, no generativa) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), configuracion JSON (`.json`), logs JSONL (`.jsonl`), voiceprints NumPy (`.npy`) |

## Arquitectura y entrenamiento

El sistema combina un extractor de caracteristicas acusticas congelado (Whisper `tiny.en` o `base.en`) que produce embeddings agrupados de 384 dimensiones, y una cabeza de clasificacion MLP de dos capas (384 -> 128 -> 15) con LayerNorm, activacion GELU y dropout. El entrenamiento de la cabeza emplea una penalizacion L2-SP que mantiene los pesos cerca de un ancla base, lo que actua como regularizador y facilita la adaptacion posterior por operador. Ademas de la cabeza base se publican prototipos latentes (`intent_prototypes.pt`) para similitud few-shot.

El modulo de autenticacion de locutor usa ECAPA-TDNN para generar voiceprints de 192 dimensiones por operador, con un umbral de aceptacion calibrado de similitud coseno de 0,72. El sistema incluye un mecanismo de calibracion online adaptativa: con 1-5 tomas por comando se ajusta una cabeza personal por operador, con validacion de generalizacion sobre datos retenidos. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de audio de este tipo).

## Capacidades

- Clasificacion de intenciones de voz en un conjunto cerrado de 15 clases: STOP, EXTINGUISH, RETURN_HOME, STATUS, UNKNOWN y diez comandos de navegacion por waypoints (GOTO_HOME, GOTO_CENTER, GOTO_NORTH, GOTO_SOUTH, GOTO_EAST, GOTO_WEST, GOTO_NORTHEAST, GOTO_NORTHWEST, GOTO_SOUTHEAST, GOTO_SOUTHWEST).
- Reconocimiento de sinonimos y frases alternativas por clase (por ejemplo, "halt", "freeze", "abort mission" y "e-stop" para STOP).
- Filtro de dominio fuera de alcance (clase UNKNOWN) para descartar conversacion no operativa.
- Verificacion biométrica de locutor mediante ECAPA-TDNN con umbral de similitud coseno calibrado.
- Calibracion few-shot por operador con 1-5 tomas por comando.
- Inferencia offline de baja latencia en CPU (~35 ms).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador de audio, no un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Control por voz de un robot de extincion de incendios: el clasificador traduce comandos como "extinguish" o "stop" en acciones directas sobre la bomba de alta presion o el freno de emergencia, con ~35 ms de latencia que permite respuesta tactil en tiempo real.
- Navegacion por waypoints en interiores industriales: los comandos GOTO_* mapean a coordenadas concretas (por ejemplo, GOTO_EAST a (10.5, 4.0)), lo que permite dirigir el robot a zonas especificas de una planta sin interfaz manual.
- Autenticacion de operador autorizado: la verificacion ECAPA-TDNN con umbral 0,72 impide que personas no acreditadas emitan comandos criticos, un requisito habitual en entornos de seguridad.
- Personalizacion por turno de operador: la calibracion few-shot con 3-5 tomas por comando permite adaptar el sistema a la voz de cada miembro del equipo al inicio de cada mision, elevando la precision del 94,2 % base al 98,8-100 %.
- Filtrado de ruido conversacional: la clase UNKNOWN descarta frases ajenas a la mision ("hello", "what's the weather") y evita activaciones falsas por conversaciones de fondo.
- Despliegue en hardware embebido sin conectividad: con ~75 MB de encoder congelado y 210 KB de cabeza, el sistema cabe en dispositivos de borde (Raspberry Pi, Jetson) y funciona sin red, algo critico en escenarios de incendio donde la infraestructura de comunicaciones puede fallar.
- Integracion en plataformas roboticas de investigacion: la licencia MIT y los checkpoints en PyTorch permiten reutilizar el pipeline de clasificacion y verificacion en otros dominios de comandos cerrados.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Verificado |
|---|---|---|
| Accuracy (Voice Intent Classification) | 0,962 | No |
| Precision base (conjunto de validacion acustica diverso) | 94,2 % | No |
| Precision personalizada por operador (3-5 tomas por comando) | 98,8 % - 100,0 % | No |
| Latencia de inferencia (CPU, Apple Silicon / x86_64 moderno) | ~35 ms | No |
| Huella de memoria (cabeza MLP) | ~210 KB | No |
| Huella de memoria (encoder Whisper tiny congelado) | ~75 MB | No |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ya que no son aplicables a un clasificador de audio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el sistema esta disenado para ejecucion en CPU. El encoder Whisper tiny congelado ocupa ~75 MB y la cabeza MLP ~210 KB, por lo que el consumo de memoria es muy reducido.
- GPU recomendadas: no se especifican; el diseno prioriza CPU (Apple Silicon o x86_64 moderno) con ~35 ms de latencia.
- Compatibilidad con GPU de consumo: previsiblemente cabe en cualquier GPU de consumo por el tamano del encoder `tiny.en`, aunque no se documentan requisitos ni pruebas en GPU.
- Opciones de despliegue: inferencia directa con PyTorch mediante la clase `IntentClassifier` del paquete `firebot.voice_intent`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~35 ms por inferencia en CPU segun el autor; no se publica throughput agregado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables de clasificacion de intenciones de voz para robotica con los que establecer una comparativa fiable de parametros, contexto, rendimiento y licencia. Se indica, por tanto, "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| firebot-voice-intent | No disponible (encoder tiny + MLP 210 KB) | No aplica | 96,2 % accuracy (declarado) | MIT | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Conjunto de comandos cerrado de solo 15 clases: cualquier frase fuera de ese vocabulario se clasifica como UNKNOWN o puede producir un falso positivo; no es extensible sin reentrenar la cabeza.
- Solo ingles: no hay soporte multilingue, lo que limita su uso en equipos que operen en castellano u otros idiomas.
- Precision base del 94,2 %: implica aproximadamente un 5,8 % de errores en el conjunto de validacion; en misiones criticas esto exige capas de confirmacion o redundancia.
- Rendimiento dependiente del ruido: el autor afirma robustez en entornos ruidosos, pero no se publican resultados por nivel de SNR ni pruebas en condiciones de incendio reales.
- Datos de entrenamiento no documentados: se desconoce el volumen, la composicion y la diversidad de acentos del dataset, lo que impide evaluar sesgos acusticos (por ejemplo, por genero, edad o acento).
- Riesgo de falsos positivos en comandos criticos como STOP o EXTINGUISH: un error de clasificacion puede desencadenar acciones fisicas peligrosas.
- Verificacion de locutor con umbral fijo de 0,72: no se documentan tasas de falsa aceptacion o falsa rejection (FAR/FRR) ni pruebas de ataques de suplantacion.
- Solo se publican voiceprints y cabezas personalizadas para dos operadores (ananya y avinandan), lo que sugiere un sistema en fase de prototipo.
- Benchmarks no verificados: los resultados (96,2 % de accuracy, 94,2 % base, 98,8-100 % personalizado) son declaraciones del autor sin validacion independiente.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre el cumplimiento de normativas de seguridad funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anabaena/firebot-voice-intent
- Repositorio del autor en Hugging Face: https://huggingface.co/anabaena
- Whisper (OpenAI), encoder base utilizado: https://github.com/openai/whisper
- ECAPA-TDNN (SpeechBrain), arquitectura de verificacion de locutor: https://github.com/speechbrain/speechbrain
- No se han encontrado en la informacion disponible papers, blogs, demos ni repositorios adicionales especificos del modelo.
