# loom-ai-org/kale-tts-1-tiny-loom

## Resumen

kale-tts-1-tiny-loom es la exportación al formato GGUF de loom.cpp del modelo de síntesis de voz kale-tts-1-tiny, desarrollado originalmente por KaleComputer y empaquetado por loom-ai-org. Se trata de un TTS en inglés de 45,7 millones de parámetros que genera audio a 24 kHz con diez voces predefinidas, pensado para ejecutarse de forma local y ligera mediante el runtime loom-py. El modelo no entrena desde cero: es una destilación de Kokoro con un codificador de palabras Ettin por delante y un decodificador source-filter, empaquetado en un único fichero autocontenido que incluye grafos, tokenizador y driver.

La relevancia de esta ficha radica en su formato de distribución: un solo GGUF que incorpora su propio front end de texto (normalización de números, fechas, dinero y unidades, lista de palabras de Kale, reglas de homógrafos y un adivinador GRU para palabras desconocidas), de modo que no requiere instalar un fonemizador externo. El repositorio ocupa 0,3 GB y ofrece versiones en F32 (201,6 MB) y cuantizada q8_0 (112,8 MB).

Está publicado bajo licencia Apache 2.0 heredada del modelo base, soporta únicamente inglés y está orientado a despliegues de inferencia locales con streaming por frases, sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de palabras Ettin + predictor destilado de Kokoro + decodificador source-filter |
| Parametros totales | 45,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una frase por pasada) |
| Tipos de cuantizacion | F32 y q8_0 per-channel (int8 en proyecciones y convoluciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (autocontenido, con grafos, tokenizador y driver embebidos) |
| Frecuencia de muestreo de audio | 24 kHz |
| Voces disponibles | 10 (por nombre; por defecto Kenzie; Amy y Jack con acento británico) |
| Tamano del repositorio | 0,3 GB |
| Tamano de ficheros | F32: 201,6 MB; q8_0: 112,8 MB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura en tres etapas: un codificador de palabras Ettin (67 MB en el fichero F32) que transforma el texto en representaciones, un predictor destilado de Kokoro que estima las características acústicas y un decodificador source-filter que sintetiza la forma de onda a 24 kHz. El front end de texto está integrado en el propio fichero GGUF como tokenizador: incluye las reglas de números, fechas, dinero y unidades de dizione, una lista de palabras basada en CMUdict con correcciones manuales de Kale, reglas de homógrafos y un adivinador GRU para palabras no vistas, además de ficheros británicos específicos para las voces Amy y Jack.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La exportación la realiza loom-exporter y produce un GGUF autocontenido con topologías de grafo, tokenizador y script de driver; la versión F32 conserva los parámetros sin modificar y las cuantizadas empaquetan pesos de convolución y proyección con `loom-export --quantize`.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con diez voces seleccionables por nombre.
- Normalización de texto integrada: números, fechas, importes monetarios y unidades se pronuncian como palabras.
- Reglas de homógrafos y lista de palabras propia, con adivinador GRU para términos desconocidos.
- Acentos diferenciados: Amy y Jack leen inglés británico de forma autónoma.
- Inferencia con streaming: el driver corta la salida en piezas por frase y `stream.exact` reconstruye la forma de onda completa de `infer`.
- Reproducibilidad mediante el parámetro `seed=`, que fija el ruido de síntesis (el modelo original lo dibuja sin semilla).
- Entrada alternativa mediante `tokens=` con los registros empaquetados del front end.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente texto a voz.

## Casos de uso

- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo cabe en 112,8 MB en q8_0 y puede sintetizar mensajes cortos en local sin conexión, con normalización automática de horas e importes.
- Generación de audiolibros o podcasts de forma por lotes: el procesamiento frase a frase con 0,12 s de silencio entre frases facilita el ensamblado de narraciones largas con una voz consistente.
- Asistentes de voz embebidos en dispositivos de recursos limitados: sus 45,7 M de parámetros y el fichero q8_0 de 112,8 MB permiten ejecución en CPU mediante loom.cpp sin GPU dedicada.
- Síntesis en tiempo real con streaming: la API `text2speech.stream` entrega una pieza por frase, adecuada para reproducir respuestas conversacionales a medida que se generan.
- Accesibilidad: lectura de contenido textual con fechas, cifras y unidades correctamente verbalizadas, útil en lectores de pantalla y sistemas de apoyo.
- Pruebas de integración continua de pipelines de audio: la semilla fija (`seed=`) hace repetible la síntesis, lo que permite comparar salidas y detectar regresiones en el front end o en el decodificador.
- Prototipado de voces para productos en inglés: diez voces con acentos británico y estadounidense permiten evaluar variantes sin entrenar modelos propios.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de inteligibilidad mediante Whisper small (WER) sobre 20 frases inglesas retenidas (conjunto de Paradee, incluyendo números, nombres y fechas):

| Metrica | F32 | q8_0 |
|---|---|---|
| WER medio (10 voces) | 3,5 % | no disponible |
| WER Kenzie | 3,7 % | 3,7 % |
| WER Amy | 5,8 % | 4,3 % |
| WER Magnus | 3,2 % | 3,5 % |
| Rango de WER por voz (F32) | 2,0 % – 5,8 % | no disponible |
| Fidelidad de forma de onda frente a módulos upstream | 56–74 dB | no disponible |
| Coincidencia del front end con upstream | 8678 textos de prueba idénticos | 8678 textos de prueba idénticos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precisión; el fichero F32 ocupa 201,6 MB y el q8_0 112,8 MB, por lo que la inferencia puede residir íntegramente en memoria.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 1 GB de memoria libre es suficiente. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU y CPU.
- Opciones de despliegue: runtime loom-py (`loom-py-rt[hub]>=1.0.0`) sobre el motor loom.cpp; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El streaming entrega una pieza por frase y `infer` añade 0,12 s de silencio tras cada frase.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Como referencia estructural, el propio modelo base KaleComputer/kale-tts-1-tiny comparte arquitectura y parámetros, pero se distribuye en formato original en lugar de GGUF; la comparación cuantitativa con alternativas TTS de tamaño similar no está disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kale-tts-1-tiny-loom | 45,7 M | no disponible (por frase) | Apache 2.0 | GGUF (loom.cpp) | Hugging Face |
| KaleComputer/kale-tts-1-tiny | 45,7 M | no disponible (por frase) | Apache 2.0 | original | Hugging Face |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Procesa una frase por pasada y añade 0,12 s de silencio tras cada una en `infer`; no es adecuado para síntesis de textos completos en una sola llamada.
- El parámetro `phonemes=` no está disponible para este modelo; la entrada alternativa es `tokens=` con los registros del front end.
- El front end es el de upstream y reside en el motor; cualquier cambio en las reglas de normalización requiere actualizar el fichero o el runtime.
- El modelo original dibuja el ruido sin semilla; sin `seed=` la síntesis no es reproducible.
- La fidelidad de la forma de onda frente a los módulos upstream es de 56–74 dB en F32, lo que implica diferencias numéricas respecto al modelo original.
- Riesgo de errores de pronunciación en nombres propios y términos fuera de la lista de palabras, mitigado solo parcialmente por el adivinador GRU; el WER por voz llega al 5,8 % en Amy.
- No se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones de este último.
- El ecosistema de ejecución está limitado a loom.cpp y loom-py; no hay soporte documentado para otros motores de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/kale-tts-1-tiny-loom
- Modelo base: https://huggingface.co/KaleComputer/kale-tts-1-tiny
- Runtime loom-py: https://github.com/loom-ai-org/loom-py
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Paquete en PyPI: https://pypi.org/project/loom-py-rt/
