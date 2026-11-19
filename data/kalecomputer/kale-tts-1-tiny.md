# KaleComputer/kale-tts-1-tiny

## Resumen

kale-tts-1-tiny es un modelo de sintesis de voz (text-to-speech) en ingles, desarrollado por KaleComputer, disenado para ejecutarse en CPU o GPU de dispositivos de gama baja, incluidos navegadores mediante WebGPU. El modelo cuenta con 45,7 millones de parametros (de los cuales 16,8 M corresponden al codificador de palabras Ettin congelado) y ofrece 10 voces sinteticas disenadas a partir de descripciones textuales, sin corresponder a personas reales. Deriva por destilacion de kale-tts-1-base, un ajuste fino de Kokoro-82M, que a su vez se apoya en Maya-1 para el diseno de voces y la generacion de audio de entrenamiento.

El modelo resuelve el problema de la sintesis de voz de calidad en hardware limitado: el archivo ONNX en int8 ocupa 79,9 MB y alcanza 24 veces la velocidad de tiempo real en la CPU de una Samsung Galaxy Tab S10 Lite, con la primera frase disponible en 0,16 s. En navegador alcanza 87x con WebGPU y 48x con WASM en un Mac. La arquitectura evita flow matching y difusion: realiza una unica pasada por frase.

Es relevante por su enfoque en privacidad y ejecucion local (el equipo desarrolla un ordenador para ninos con IA completamente on-device), por publicar el dataset de entrenamiento (204,7 horas, 99.783 tomas, CC BY 4.0) y por mantener una licencia Apache 2.0 que permite uso comercial y recreacion de voces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS modular: frontend fonetico (diccionario CMUdict + overrides), codificador de palabras Ettin (16,8 M, congelado), lector de fonemas (3,0 M), planificador de timing y melodia (21,8 M, congelado de kale-tts-1-base) y generador armonico-mas-ruido (4,1 M) |
| Parametros totales | 45,7 M (16,8 M del codificador Ettin congelado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa una frase por pasada) |
| Tipos de cuantizacion | int8 (model.onnx, 79,9 MB) y float32 (model.fp32.onnx, 183,2 MB para WebGPU) |
| Idiomas soportados | Ingles (variantes US y British English en las voces) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

kale-tts-1-tiny es un modelo destilado de kale-tts-1-base (un ajuste fino de Kokoro-82M sobre 10 voces generadas con Maya-1). Conserva congelado el planificador de timing y melodia de 21,8 M del profesor y anade delante un lector de fonemas de 3,0 M y el codificador de palabras Ettin de 16,8 M, tambien congelado, que comprende frases completas. El generador de audio (4,1 M) es un pequeno sintetizador armonico-mas-ruido que aprende directamente del audio de Maya-1. No emplea flow matching ni difusion: genera cada frase en una sola pasada.

El entrenamiento se realizo sobre kale-tts-1-data, un corpus de 204,7 horas (99.783 tomas) con las 10 voces y sus transcripciones, publicado bajo CC BY 4.0. Las voces fueron disenadas por Maya-1 a partir de descripciones de una linea y no corresponden a personas reales. El frontend fonetico convierte texto a fonemas mediante reglas para terminos tecnicos, numeros, fechas, dinero y unidades, seguido de un diccionario basado en CMUdict, una lista de overrides revisada manualmente (334.000 palabras verificadas, mas de 3.800 lecturas corregidas) y un pequeno adivinador para palabras desconocidas; no usa espeak.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con 10 voces predefinidas (Kenzie, Simone, Amy, Frankie, Darlene, Owen, Toby, Jack, Earl, Magnus) con acentos US y British English.
- Ejecucion en CPU de gama baja y en navegador (WebGPU y WASM) sin dependencias de GPU dedicada.
- Generacion de una sola pasada por frase, sin difusion ni flow matching, lo que reduce la latencia.
- Frontend fonetico robusto con manejo de terminos tecnicos, numeros, fechas, dinero y unidades, y diccionario verificado con overrides.
- Capacidad de recrear voces nuevas a partir de descripciones textuales siguiendo el concepto de Maya-1 (el modelo incluye 10 voces listas para usar).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Lectura por voz en dispositivos infantiles de bajos recursos: el modelo cabe en 79,9 MB en int8 y corre a 24x tiempo real en la CPU de una tablet, lo que permite narrar cuentos o interfaces sin conexion y sin enviar datos a la nube.
- Asistentes de voz locales con privacidad estricta: al ejecutarse completamente on-device, la sintesis no requiere transmitir texto del usuario a servidores externos, adecuado para aplicaciones sensibles.
- Accesibilidad y lectores de pantalla: la baja latencia (primera frase en 0,16 s) y el bajo consumo permiten integrar la lectura de texto en aplicaciones de escritorio o moviles sin penalizar la bateria.
- Aplicaciones web con TTS en el navegador: mediante WebGPU (87x en un Mac) o WASM (48x), se puede ofrecer sintesis en paginas web sin backend, reduciendo costes de infraestructura.
- Generacion de audiolibros o contenido narrado por lotes: las 10 voces con estilos definidos (narrador de trailers, presentador, detective, etc.) permiten producir narraciones con variedad de tonos en pipelines automatizados.
- Prototipado de voces y doblaje sintetico: el dataset y el flujo de Maya-1 permiten recrear voces nuevas a partir de descripciones, util para demos, videojuegos o pruebas de concepto antes de invertir en voces profesionales.
- Sistemas embebidos y domotica: el tamano reducido y la ejecucion en CPU permiten integrar avisos hablados en dispositivos con recursos limitados (Raspberry Pi, tablets economicas).

## Benchmarks y rendimiento

| Medida | kale-tts-1-tiny | Maya-1 (referencia) |
|---|---|---|
| Palabras poco claras (reconocedor ASR) | +1,4 puntos vs grabaciones de Maya-1 | 5,82 % |
| Brecha de melodia (puntos percentiles, menor es mejor) | +7,48 puntos vs grabaciones de Maya-1 | 0 |
| Velocidad en CPU Samsung Galaxy Tab S10 Lite | 24x tiempo real; primera frase en 0,16 s | No disponible |
| Velocidad en navegador Mac (WebGPU) | 87x tiempo real | No disponible |
| Velocidad en navegador Mac (WASM) | 48x tiempo real | No disponible |
| Tamano en disco (int8) | 79,9 MB | No disponible |
| Tamano en disco (float32, WebGPU) | 183,2 MB | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica en CPU; en GPU, el modelo int8 de 79,9 MB requiere menos de 1 GB de VRAM, y la version float32 de 183,2 MB tambien cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU integrada o dedicada es suficiente; el modelo esta pensado para CPU y para WebGPU en navegador. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en GPU integradas; el objetivo principal es CPU de gama baja y navegador.
- Opciones de despliegue: ONNX Runtime (CPU y WebGPU), ejecucion en navegador mediante WebGPU o WASM; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput: 24x tiempo real en CPU de tablet (Samsung Galaxy Tab S10 Lite), 87x con WebGPU y 48x con WASM en un Mac; primera frase en 0,16 s en la tablet.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| kale-tts-1-tiny | 45,7 M | No disponible (por frase) | Ingles | Apache 2.0 | ONNX | TTS on-device, CPU y navegador |
| kale-tts-1-nano | No disponible (menor que tiny) | No disponible | Ingles | Apache 2.0 | ONNX | Version mas pequena y rapida, algo menos de calidad |
| kale-tts-1-base | No disponible (Kokoro-82M ajustado) | No disponible | Ingles | No disponible | No disponible | Profesor de la destilacion, mayor calidad pero mas lento |
| Kokoro-82M | 82 M | No disponible | Ingles | No disponible | No disponible | TTS base sobre el que se ajusto kale-tts-1-base |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue documentado.
- La calidad es inferior a la de Maya-1: +1,4 puntos en palabras poco claras y +7,48 puntos de brecha de melodia respecto a las grabaciones originales.
- Modelo marcado como "DRAFT, NOT PUBLISHED" en la model card, lo que indica que puede no estar finalizado o validado para produccion.
- Riesgo de alucinacion fonetica: el frontend puede pronunciar mal palabras fuera del diccionario o de los overrides; se recomienda anadir terminos especificos al archivo de overrides.
- Las voces son sinteticas y no corresponden a personas reales; su uso debe cumplir la licencia Apache 2.0 y las normativas aplicables sobre voces sinteticas.
- No se documentan sesgos especificos, pero al estar entrenado solo con ingles US y British, puede presentar limitaciones con acentos regionales no cubiertos.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia de Maya-1 y Kokoro-82M si se redistribuye.
- No apto para tareas de razonamiento, codigo o vision; es exclusivamente un modelo TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaleComputer/kale-tts-1-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/KaleComputer/kale-tts-1-data
- Modelo base (profesor): https://huggingface.co/KaleComputer/kale-tts-1-base
- Version nano: https://huggingface.co/KaleComputer/kale-tts-1-nano
- Demo en Spaces: https://huggingface.co/spaces/KaleComputer/kale-tts-1
- Maya-1: https://huggingface.co/maya-research/maya1
