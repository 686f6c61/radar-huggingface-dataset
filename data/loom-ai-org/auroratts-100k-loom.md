# loom-ai-org/auroratts-100k-loom

## Resumen

AuroraTTS-100K es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por AuroraAI-Research y exportado al formato GGUF del motor loom.cpp por loom-ai-org. A diferencia de los TTS neuronales convencionales, no emplea un vocoder neuronal: su arquitectura combina un codificador convolucional, una BiGRU, predictores de duración y tono (pitch), y un sintetizador DSP de tipo armónico-más-ruido (harmonic-plus-noise). El resultado es un modelo extremadamente compacto, con alrededor de 95.638 parámetros según la model card (112.371 según los metadatos de safetensors), que genera audio a 22,05 kHz.

Este export está pensado para ejecutarse con loom-py (paquete `loom-py-rt`), que interpreta un único fichero GGUF autodescriptivo que incluye las topologías del grafo, el tokenizador y el script controlador. Requiere `loom-py-rt` 1.0.0rc20 o superior, ya que utiliza celdas GRU en el barrido recurrente del motor y el estilo fonémico `arpabet` del front-end de texto, ambos introducidos en esa versión.

Su relevancia es la de un TTS de huella mínima (0,5 MB en F32) que cabe en cualquier dispositivo y sirve como referencia de despliegue ligero, aunque limitado a una única voz (LJSpeech) y al idioma inglés. Es un trabajo en curso, con calidad de fonemización condicionada al lexicón que se le suministre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador convolucional + BiGRU + predictores de duración y pitch + sintetizador DSP harmonic-plus-noise (sin vocoder neuronal) |
| Parametros totales | 95.638 según model card; 112.371 según metadatos de safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | F32 y Q8_0 por canal (`q8_0_pc`); solo se cuantizan las dos últimas capas de los predictores de duración y pitch |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (F32 y Q8_0) |

## Arquitectura y entrenamiento

La arquitectura se aleja del paradigma encoder-decoder con vocoder neuronal. El texto se convierte en fonemas (ARPAbet con dígitos de acentuación) mediante un front-end G2P; un codificador convolucional procesa esa secuencia y una BiGRU modela el contexto temporal. Dos predictores, uno de duración y otro de pitch (F0 en escala logarítmica), generan las trayectorias prosódicas. La síntesis final la realiza un sintetizador DSP de tipo armónico-más-ruido, que sustituye al vocoder neuronal y explica el reducido número de parámetros. La frecuencia de muestreo de salida es de 22,05 kHz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que la voz es única y proviene de LJSpeech. La innovación técnica destacable es la exportación a un GGUF autodescriptivo con grafo, tokenizador y driver embebidos, y el uso de celdas GRU dentro del barrido recurrente del motor loom.cpp. La fase armónica se acumula en doble precisión para todas las locuciones, mientras que el modelo original solo lo hace por encima de 32.768 muestras (1,5 s).

## Capacidades

- Síntesis de voz en inglés a 22,05 kHz a partir de texto o de fonemas ARPAbet.
- Control de velocidad mediante el parámetro `speed`, que divide las duraciones.
- Control de tono mediante `pitch_shift`, que se suma al log-F0.
- Reproducibilidad determinista con `seed`, equivalente a `torch.manual_seed` seguido de `synthesize` del modelo original.
- Fonemización integrada mediante `orthography2ipa` y un lexicón CMUdict en IPA (incluido en el repo).
- Aceptación de fonemas externos vía `phonemes=` para máxima calidad (por ejemplo, tokens de g2p_en).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-step.
- Capacidad multilingüe: únicamente inglés; una sola voz.

## Casos de uso

- Locución de avisos y notificaciones en aplicaciones de escritorio o móviles: el modelo pesa 0,5 MB y puede embeberse en binarios sin dependencias de red, generando frases cortas en inglés a 22,05 kHz.
- Sistemas de accesibilidad en dispositivos de recursos limitados: lectura de texto en pantalla en Raspberry Pi o microcontroladores con suficiente CPU, gracias al sintetizador DSP sin vocoder neuronal.
- Pruebas de concepto y prototipado de pipelines TTS: sirve como baseline ligero para comparar calidad de fonemización (la model card reporta 12,3 % WER con el lexicón incluido frente a 8,5 % con g2p_en).
- Generación de audio para entornos de test automatizados: la reproducibilidad con `seed` permite tests de regresión deterministas sobre la forma de onda.
- Investigación en síntesis DSP: como referencia de arquitectura híbrida convolucional-BiGRU con sintetizador armónico-más-ruido, útil para estudiar el compromiso entre tamaño y calidad.
- Educación y demos de loom.cpp: ejemplo mínimo de export GGUF autodescriptivo con driver embebido para aprender el flujo de loom-exporter y loom-py.
- Síntesis por lotes de frases cortas en inglés con control de velocidad y tono, por ejemplo para generar variantes de una misma locución en pruebas de usabilidad.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WER (Whisper small, 30 frases LibriSpeech, lexicón incluido) | 12,3 % |
| WER (Whisper small, 30 frases LibriSpeech, tokens de g2p_en) | 8,5 % |
| WER (Whisper, 60 síntesis, F32) | 10,4 % |
| WER (Whisper, 60 síntesis, Q8_0_pc) | 10,6 % |
| Fidelidad de forma de onda F32 frente al original | 4,8e-4 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; el modelo es de 0,5 MB y se ejecuta en CPU.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente. No se dispone de datos de aceleración GPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos; el cuello de botella es el sintetizador DSP y el front-end G2P, no la memoria.
- Despliegue: `loom-py-rt` (PyPI) con `loom.cpp` como motor; requiere versión 1.0.0rc20 o superior.
- Latencia y throughput: no disponibles en la información proporcionada. El fichero Q8_0_pc no es más rápido que F32 según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuroraTTS-100K (este export) | ~95,6 K | No aplica | WER 8,5-12,3 % (Whisper small) | Apache-2.0 | GGUF en HuggingFace, 28 descargas |
| AuroraAI-Research/AuroraTTS-100K (original) | ~95,6 K | No aplica | Referencia upstream | Apache-2.0 | Pesos originales en HuggingFace |
| TTS neuronales con vocoder (p. ej. VITS, Piper) | Millones | No aplica | No disponible en esta ficha | Variable | No disponible |

No se dispone de datos comparativos de benchmarks frente a alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y una única voz (LJSpeech); no hay soporte multilingüe ni de cambio de hablante.
- El front-end de texto integrado no es el original: pierde puntuación y obtiene peor WER (12,3 % frente a 8,5 % con g2p_en). Para calidad upstream hay que pasar los tokens de g2p_en como `phonemes=`.
- El fonemizador `orthography2ipa` es un reemplazo provisional; en inglés requiere un lexicón de referencia para reglas de acentuación y fonemización contextual.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del lexicón o con ortografía atípica.
- El fichero Q8_0_pc apenas reduce tamaño (6 KB) y no aporta velocidad; la cuantización solo afecta a las dos últimas capas de los predictores.
- Licencia Apache-2.0 permite uso comercial, pero el lexicón CMUdict incluido es BSD-2-Clause y debe conservarse su aviso.
- Dependencia estricta de `loom-py-rt` >= 1.0.0rc20; versiones anteriores rechazan las celdas GRU y el estilo `arpabet`.
- Proyecto en estado de trabajo en curso, con 28 descargas y 0 likes; sin garantías de mantenimiento.
- La acumulación en doble precisión de la fase armónica difiere del original por debajo de 1,5 s, lo que puede introducir diferencias menores en locuciones cortas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/auroratts-100k-loom
- Modelo base: https://huggingface.co/AuroraAI-Research/AuroraTTS-100K
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Lexicón CMUdict: https://github.com/cmusphinx/cmudict
