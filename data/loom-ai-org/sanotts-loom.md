# loom-ai-org/sanotts-loom

## Resumen

sanoTTS (export loom) es una colección de 28 voces TTS ultraligeras destiladas, distribuidas como ficheros GGUF autodescriptivos para el motor loom.cpp. Cada fichero es un modelo independiente exportado desde el paquete original `ampixa/sanoTTS`, con parámetros que van de 0,29 M a 2,27 M —órdenes de magnitud por debajo de los TTS neuronales convencionales— y frecuencias de muestreo de 22,05 kHz (línea piperlite, destilada de voces Piper) o 24 kHz (línea nano, destilada de la voz `af_heart` de Kokoro mediante un decodificador estilo Vocos).

El modelo resuelve el problema de la síntesis de voz en entornos con recursos extremadamente limitados: microcontroladores, placas SBC de gama baja y aplicaciones donde el tamaño del binario o el consumo de memoria son críticos. Según la model card, la voz heart-nano sintetiza a 1,1 veces la duración del audio en una Raspberry Pi Zero W (un núcleo ARMv6 a 1 GHz sin SIMD) ocupando 34 MB de memoria, lo que la sitúa en el terreno de lo desplegable en hardware que ningún TTS transformer convencional puede abordar.

La relevancia actual del export radica en el formato: un único GGUF que transporta sus propias topologías de grafo, tokenizador y script de controlador, ejecutable desde Python mediante `loom-py-rt`. Cubre 14 idiomas (en, ar, cs, de, es, fr, id, it, pt, ro, ru, tr, vi, zh), aunque la calidad del front-end de texto solo está medida en inglés y el chino carece de puerta de texto funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS destilado; línea piperlite (destilada de Piper, 22,05 kHz) y línea nano (destilada de Kokoro af_heart con decodificador estilo Vocos, 24 kHz); export loom.cpp en GGUF |
| Parametros totales | 1.084.963 (fichero principal); rango de la colección: 0,29 M a 2,27 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; límite de 207 símbolos fonéticos por llamada en las voces heart y heart-nano |
| Tipos de cuantizacion | int8 en origen (heart-nano), dequantizado en el export GGUF; otras cuantizaciones no disponibles |
| Idiomas soportados | en, ar, cs, de, es, fr, id, it, pt, ro, ru, tr, vi, zh (14) |
| Licencia | GPL-3.0 (heredada del modelo base) |
| Formato de pesos | GGUF (autodescriptivo, con grafo, tokenizador y driver embebidos) |

## Arquitectura y entrenamiento

La colección sigue una estrategia de destilación en dos líneas. La línea piperlite destila voces Piper a 22,05 kHz; la línea nano destila la voz `af_heart` de Kokoro a través de un decodificador estilo Vocos a 24 kHz. Los tamaños resultantes (0,29 M a 2,27 M de parámetros) implican modelos de una magnitud muy inferior a los TTS neuronales habituales, lo que explica tanto su huella de memoria (34 MB para heart-nano) como sus requisitos de cómputo mínimos. El decodificador de las voces heart y heart-nano es alimentado por ruido: la semilla (`seed`) altera ligeramente la voz y el valor por defecto reproduce el renderizado original del modelo base.

El export a loom.cpp no reentrena: importa los scripts de entrenamiento del upstream desde un clon fijado y produce un GGUF que transporta la topología de grafo, el tokenizador y el driver de cada voz. El front-end de texto utiliza `orthography2ipa` como fonemizador genérico, con un léxico de pronunciación para inglés (hexgrad/misaki, Apache-2.0) incluido en el repositorio; para calidad completa en otros idiomas se recomienda alimentar fonemas IPA propios mediante el argumento `phonemes`. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en 14 idiomas con voces ultraligeras de 0,29 M a 2,27 M de parámetros.
- Dos frecuencias de muestreo según línea: 22,05 kHz (piperlite) y 24 kHz (nano).
- Puerta de texto de alto nivel (`text2speech.infer(text)`) con fonemización automática vía orthography2ipa y léxico inglés incluido.
- Entrada directa de fonemas IPA (`phonemes=`) para control total de la pronunciación con el G2P que prefiera el usuario.
- Streaming por frases mediante `text2speech.stream()`, con la salvedad de que `stream.exact` es falso (las uniones difieren de una llamada única sobre el texto completo).
- Control de variación de voz mediante semilla en las voces heart y heart-nano.
- Ejecución en CPU sin SIMD (ARMv6) y en x86 de dos núcleos.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz embebidos en microcontroladores: heart-nano sintetiza a 1,1 veces la duración del audio en una Raspberry Pi Zero W con 34 MB de memoria, lo que permite integrar voz en dispositivos sin GPU ni SIMD.
- Lectura de notificaciones y alertas en dispositivos IoT: las voces piperlite de 0,51 M sintetizan a 2,3 veces tiempo real en Pi Zero W, suficiente para mensajes cortos en cualquiera de los 14 idiomas soportados.
- Audiolibros y lectura de documentos por frases: el streaming por frases permite reproducir cada pieza conforme se genera, aunque las voces heart y heart-nano requieren trocear el texto por debajo de 207 símbolos fonéticos por llamada.
- Sistemas de accesibilidad de bajo coste: la licencia GPL-3.0 y la ausencia de dependencias pesadas facilitan su integración en lectores de pantalla y aplicaciones de asistencia vocal en hardware modesto.
- Prototipado multilingüe de interfaces de voz: con 14 idiomas y la posibilidad de inyectar fonemas IPA propios, sirve para validar flujos TTS en árabe, checo, rumano o vietnamita antes de invertir en modelos mayores.
- Síntesis en pipelines de CI/CD y tests automatizados: el tamaño del repositorio (0,2 GB) y la instalación vía `pip install loom-py-rt` permiten incluir la generación de audio en pruebas de integración sin infraestructura GPU.
- Locuciones de videojuegos y aplicaciones de escritorio: en un portátil x86 de dos núcleos, amy-1.46M sintetiza catorce veces más rápido que tiempo real, adecuado para diálogos generados en tiempo de ejecución.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WER (heart-nano, 30 frases LibriSpeech, puerta de texto con léxico, Whisper) | 11,9 % (frente a 8,1 % con el front-end original del upstream) |
| WER (amy-1.46M, mismo conjunto, puerta de texto con léxico) | 12,3 % (frente a 8,5 % con el front-end original) |
| Velocidad heart-nano en Raspberry Pi Zero W (ARMv6 1 GHz, sin SIMD) | 1,1× la duración del audio, 34 MB de memoria |
| Velocidad piperlite 0,51 M en Pi Zero W | 2,3× la duración del audio |
| Velocidad heart en Pi Zero W | 2,5× la duración del audio |
| Velocidad amy-1.46M en Pi Zero W | 8,4× la duración del audio |
| Velocidad amy-1.46M en portátil x86 de 2 núcleos | 1/14 de la duración del audio |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; los datos anteriores son las únicas métricas reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU. heart-nano ocupa 34 MB de memoria en ejecución.
- GPU recomendadas: no disponibles; no se documenta soporte GPU.
- Cabe en cualquier GPU consumer y en hardware sin GPU: Raspberry Pi Zero W (ARMv6, 1 GHz, sin SIMD) es el objetivo declarado.
- Opciones de despliegue: `loom-py-rt` (PyPI, `pip install -U "loom-py-rt[hub,phonemes]>=1.0.0"`) sobre el motor loom.cpp; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Pi Zero W, entre 1,1× (heart-nano) y 8,4× (amy-1.46M) la duración del audio; en x86 de dos núcleos, amy-1.46M alcanza 1/14 de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia | Licencia | Enfoque |
|---|---|---|---|---|
| sanoTTS (loom) | 0,29 M – 2,27 M | 22,05 / 24 kHz | GPL-3.0 | TTS ultraligero para CPU y embebidos |
| Piper | no disponible en la información | 22,05 kHz | no disponible | TTS ligero para CPU (origen de la línea piperlite) |
| Kokoro (af_heart) | no disponible en la información | 24 kHz | no disponible | TTS neuronal de referencia (origen de la línea nano) |

No se dispone de datos de parámetros ni licencia de Piper y Kokoro en la información proporcionada; la comparativa se limita a la relación de destilación documentada por el autor.

## Limitaciones y advertencias

- Licencia GPL-3.0 heredada del modelo base: los pesos portan los parámetros del upstream, lo que condiciona el uso comercial y la redistribución; loom.cpp, loom-exporter y loom-py no contienen código GPL.
- La puerta de texto solo está evaluada en inglés; sin el léxico incluido, la calidad en inglés empeora notablemente.
- El chino carece de puerta de texto: la salida de orthography2ipa cae casi por completo fuera de la tabla de fonemas de la voz zh (una frase de 13 caracteres se codificó en 3 ids); es necesario pasar pinyin estilo espeak manualmente.
- Las voces heart y heart-nano aceptan como máximo 207 símbolos fonéticos por llamada; el texto más largo debe trocearse por frases.
- El decodificador de heart y heart-nano está alimentado por ruido: la semilla varía ligeramente la voz; la inyección opcional de sibilantes del upstream (dashboard y runtime Arduino) no se reproduce.
- El streaming no es exacto (`stream.exact` es falso): las uniones entre frases difieren de una síntesis única del texto completo.
- El fonemizador orthography2ipa es una solución provisional; en idiomas de ortografía profunda requiere léxicos de referencia para reglas de acentuación y fonemización contextual.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo TTS, el riesgo se traslada a pronunciación incorrecta y artefactos de audio más que a contenido factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/sanotts-loom
- Modelo base: https://huggingface.co/ampixa/sanoTTS
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- API Python loom-py: https://github.com/loom-ai-org/loom-py
- Léxico inglés incluido: https://huggingface.co/loom-ai-org/sanotts-loom/resolve/main/lexicons/en_US-misaki.tsv
