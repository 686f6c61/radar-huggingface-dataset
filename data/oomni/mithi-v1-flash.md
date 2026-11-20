# Oomni/mithi-v1-flash

## Resumen
Mithi v1 Flash es un modelo de texto a voz (TTS) desarrollado por Oomni, orientado a la sintesis de habla natural en 11 idiomas de la India (hindi, ingles, bengali, gujarati, kannada, malayalam, marathi, odia, punyabi, tamil y telugu). Con 99,1 millones de parametros y un peso de repositorio de 0,2 GB, se posiciona como una alternativa ligera que puede ejecutarse tanto en GPU como en CPU, incluyendo dispositivos de bajas prestaciones como una Raspberry Pi. El modelo genera audio mono a 24 kHz y ofrece dos voces predefinidas: Satvik (masculina) y Charvi (femenina).

La relevancia de este modelo radica en su cobertura linguistica: la mayoria de sistemas TTS de alta calidad se centran en ingles y unas pocas lenguas europeas, dejando desatendidos los idiomas indicos. Mithi v1 Flash cubre diez lenguas indicas mas el ingles con un unico checkpoint de menos de 100 M de parametros, lo que facilita su despliegue en entornos con recursos limitados. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

El modelo se distribuye en formato bf16 safetensors e incluye un normalizador de texto (Maya text normaliser) que expande numeros, horas y divisas a palabras antes de la sintesis. La segmentacion automatica de texto largo en frases permite procesar parrafos completos sin intervencion manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS basado en los componentes Maya2-native y Kokoro-82M) |
| Parametros totales | 99,1 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa el texto frase a frase de forma automatica) |
| Tipos de cuantizacion | bf16 (pesos distribuidos en bf16 safetensors) |
| Idiomas soportados | Hindi (hi), ingles (en), bengali (bn), gujarati (gu), kannada (kn), malayalam (ml), marathi (mr), odia (or), punyabi (pa), tamil (ta), telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento
La model card no detalla la arquitectura interna del modelo mas alla de indicar que se construyo integramente sobre modelos y herramientas de codigo abierto con licencias permisivas: Maya2-native (Apache-2.0), Kokoro-82M (Apache-2.0), indic-bert (MIT), Maya text normaliser (Apache-2.0) y misaki (Apache-2.0). No se especifica si se trata de un transformer puro, un modelo basado en difusion o una arquitectura hibrida, ni se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO.

El unico detalle tecnico confirmado es la inclusion de un normalizador de texto que expande numeros, horas y simbolos de divisa a palabras antes de la sintesis, y un mecanismo de segmentacion automatica que divide el texto largo en frases para su procesamiento secuencial. La salida es audio mono a 24 kHz. No se han publicado innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades
- Sintesis de voz (text-to-speech) en 11 idiomas: hindi, ingles, bengali, gujarati, kannada, malayalam, marathi, odia, punyabi, tamil y telugu.
- Dos voces predefinidas: Satvik (masculina) y Charvi (femenina).
- Generacion de audio mono a 24 kHz en formato WAV.
- Normalizacion automatica de texto: expansion de numeros, horas y divisas a palabras.
- Procesamiento automatico de texto largo mediante segmentacion en frases.
- Ejecucion en GPU y en CPU (con soporte para limitar el numero de hilos mediante `--threads`).
- Interfaz de linea de comandos (`inference.py`) y API de Python (`mithi_tts.Mithi`).
- No se menciona soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso
- Audiolibros y contenido editorial en lenguas indicas: el modelo puede narrar parrafos largos de forma automatica gracias a la segmentacion en frases, con dos voces disponibles para alternar narrador y narradora en un mismo titulo.
- Asistentes de voz para atencion al cliente en India: con 11 idiomas cubiertos y un modelo de 99,1 M de parametros, se puede desplegar en servidores modestos para generar respuestas habladas en hindi, tamil o bengali sin depender de servicios en la nube.
- Sistemas de anuncios y megafonia en transporte publico: la normalizacion de horas y numeros permite generar avisos como "el tren de las 10:30" correctamente pronunciados, y la inferencia en CPU abarata el despliegue en estaciones sin GPU.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido web o documentos en lenguas indicas, ejecutable localmente en un portatil o incluso en una Raspberry Pi.
- Localizacion de videojuegos y aplicaciones moviles: su tamano reducido (197 MB) permite empaquetar el modelo dentro de la aplicacion y generar dialogos en el dispositivo sin conexion.
- Generacion de material educativo y cursos en linea: sintesis de lecciones en marathi, telugu o punyabi con una voz consistente, a un coste de computo minimo comparado con modelos TTS de mayor tamano.
- Prototipado rapido de productos de voz: la API de Python y la CLI facilitan integrar TTS en demos y pruebas de concepto con licencia Apache-2.0, sin costes de licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks objetivos (MOS, WER, MCD, etc.) en la informacion disponible. La model card unicamente incluye una medicion de velocidad de inferencia en CPU (AMD EPYC 9554) para una frase media de 15 palabras (aproximadamente 7 segundos de habla):

| Hilos de CPU | Tiempo por frase |
|---|---|
| 1 | ~8 s |
| 4 | ~3 s |

No se proporcionan datos de latencia ni throughput en GPU.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en bf16 (el checkpoint pesa 197 MB); no se especifica el consumo exacto de memoria durante la inferencia.
- GPU recomendadas: no se indican modelos concretos; cualquier GPU con soporte para bf16 (por ejemplo, RTX 4090, A100, H100) es suficiente dado el reducido tamano del modelo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna, e incluso en CPU. La model card menciona explicitamente portatiles, Raspberry Pi, telefonos y servidores sin GPU.
- Opciones de despliegue: el repositorio incluye `inference.py` (CLI) y el paquete Python `mithi_tts`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput: en CPU AMD EPYC 9554, aproximadamente 3 segundos por frase de 15 palabras con 4 hilos y 8 segundos con 1 hilo. En CPU mas lentas, como una Raspberry Pi, el tiempo se incrementa proporcionalmente. No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mithi v1 Flash | 99,1 M | 11 (10 indicos + ingles) | No disponible | Apache-2.0 | Hugging Face |
| Kokoro-82M | 82 M | Principalmente ingles y algunas lenguas europeas (segun su model card) | No disponible | Apache-2.0 | Hugging Face |
| Maya2-native | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face |

La comparacion se limita a los componentes citados en la model card, ya que no se proporcionan datos de rendimiento comparativo. No se dispone de informacion sobre otros modelos TTS especificos para lenguas indicas en la informacion proporcionada.

## Limitaciones y advertencias
- Solo dispone de dos voces fijas (Satvik y Charvi); no se menciona soporte para clonacion de voz ni voces personalizadas.
- No se han publicado evaluaciones objetivas de calidad (MOS, inteligibilidad) ni comparaciones con otros sistemas TTS, por lo que la calidad real en cada idioma no esta cuantificada.
- La cobertura linguistica se limita a los 11 idiomas listados; no se mencionan otras lenguas.
- No se detalla el comportamiento ante textos con code-switching (mezcla de idiomas en una misma frase), comun en la India.
- Al ser un modelo TTS, puede presentar errores de pronunciacion en palabras extranjeras, acronimos o nombres propios no cubiertos por el normalizador.
- La licencia Apache-2.0 permite uso comercial, pero se exige mantener la licencia y los creditos de los componentes de terceros (Maya2-native, Kokoro-82M, indic-bert, Maya text normaliser, misaki) en cualquier redistribucion.
- No se especifican sesgos conocidos ni limitaciones de contexto en la informacion disponible.
- La fecha de creacion del repositorio (2026-11-07) y la de actualizacion (2026-11-11) son las unicas referencias temporales; no se indica la fecha de entrenamiento del modelo.

## Enlaces
- Hugging Face: https://huggingface.co/Oomni/mithi-v1-flash
- Demostracion en video: https://huggingface.co/Oomni/mithi-v1-flash/resolve/main/assets/mithi_v1_flash_showcase.mp4
- Banner del modelo: https://huggingface.co/Oomni/mithi-v1-flash/resolve/main/assets/mithi_banner.png
- Muestras de audio: https://huggingface.co/Oomni/mithi-v1-flash/tree/main/samples
