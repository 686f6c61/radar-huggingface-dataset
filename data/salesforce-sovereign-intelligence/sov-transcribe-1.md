# salesforce-sovereign-intelligence/SOV-Transcribe-1

## Resumen

SOV-Transcribe-1 es un modelo de reconocimiento automático del habla (ASR) de pesos abiertos desarrollado por Salesforce Sovereign Intelligence. Combina un encoder de audio Whisper large-v3 con un proyector multimodal y el modelo de lenguaje Gemma 4 26B A4B (arquitectura MoE) para producir transcripciones controladas mediante instrucciones en lenguaje natural. Resuelve el problema de la transcripción empresarial que requiere control fino sobre el estilo de salida (literal frente a normalizada), sesgo de contexto para vocabulario específico y robustez ante acentos y ruido.

El modelo suma 26.630.656.030 parámetros totales (4,6B activos, incluido el encoder de audio) y acepta hasta 30 minutos de audio por petición en 16 kHz. Soporta siete idiomas (inglés, francés, alemán, español, italiano, portugués y neerlandés) y se distribuye bajo licencia Apache 2.0, lo que permite despliegue y adaptación en infraestructura propia.

Su relevancia actual radica en que, según la model card, ocupa el primer puesto entre modelos de pesos abiertos para speech-to-text no streaming en Artificial Analysis (puesto 7 global) y el segundo de 23 sistemas en VoiceCodeBench (besimple AI) en precisión de entidades y éxito de tarea a fecha de 12 de noviembre de 2026. Está pensado para despliegue on-premise con control sobre los datos de audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de audio Whisper large-v3 + proyector de audio + Gemma 4 26B A4B (MoE) |
| Parámetros totales | 26.630.656.030 (26,6B) |
| Parámetros activos | 4,6B (incluido el encoder de audio) |
| Longitud de contexto | no disponible (audio máximo de entrada: hasta 30 minutos, probado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, fr, de, es, it, pt, nl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio con código de modelado propio, `custom_code`) |
| Precisión | BF16 (router MoE en FP32) |
| Entrada / salida | Audio 16 kHz con instrucciones de texto y contexto opcionales / texto de transcripción |
| Frameworks de inferencia | vLLM (plugin para vLLM 0.32.0) y Hugging Face Transformers (>=5.19,<5.23) |
| Decodificación especulativa | Modelo draft DFlash en repositorio separado |
| Tamaño del repositorio | 53,3 GB |

## Arquitectura y entrenamiento

SOV-Transcribe-1 es un modelo de lenguaje aumentado con habla (speech-augmented LM) compuesto por tres bloques: un encoder de audio basado en Whisper large-v3, un proyector que alinea las representaciones acústicas con el espacio del modelo de lenguaje, y el LM Gemma 4 26B A4B, un transformer con mezcla de expertos (MoE) de 26,6B parámetros totales y 4,6B activos. El router del MoE opera en FP32 mientras el resto del modelo se ejecuta en BF16. El modelo base declarado incluye tanto `google/gemma-4-26B-A4B-it` como `openai/whisper-large-v3`.

El modelo está diseñado para ASR no streaming y sigue instrucciones en lenguaje natural para controlar el estilo de transcripción (literal frente a normalizada, puntuación, mayúsculas y formato de números). Incorpora sesgo de contexto: se le pueden proporcionar nombres, vocabulario de dominio o una descripción breve del tema para mejorar el reconocimiento de términos difíciles. La model card no detalla el volumen ni la composición del dataset de entrenamiento, ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible.

Como innovación técnica destacable, el repositorio incluye un modelo draft DFlash para decodificación especulativa, que acelera la generación en Transformers (una grabación por vez). El soporte nativo en vLLM y Transformers está en proceso de upstream; hasta su publicación se distribuye un plugin de vLLM para la versión 0.32.0 y el código de modelado propio para Transformers.

## Capacidades

- Transcripción automática del habla no streaming en siete idiomas (en, fr, de, es, it, pt, nl).
- Control del estilo de transcripción mediante instrucciones en lenguaje natural: literal (verbatim) o forma escrita normalizada, con control de puntuación, mayúsculas y formato de números.
- Sesgo de contexto: acepta nombres, vocabulario específico de dominio o una descripción del tema para reconocer términos técnicos y entidades difíciles.
- Reconocimiento preciso de entidades: nombres, números de teléfono y direcciones de correo electrónico, relevante en dictado y aplicaciones de voz.
- Robustez ante acentos diversos del inglés y condiciones de audio adversas, incluido ruido de fondo.
- Procesamiento por lotes de varias grabaciones en una sola llamada (Transformers).
- Entrada de audio de hasta 30 minutos (probado).
- Decodificación especulativa mediante modelo draft DFlash para reducir latencia.
- Seguimiento de instrucciones (instruction-following) aplicado a la tarea de transcripción.
- No se documentan capacidades de tool calling, agentes, visión ni audio en streaming en la información disponible.

## Casos de uso

- Transcripción de reuniones y actas: el modelo acepta hasta 30 minutos de audio por petición y permite instruir el formato de salida (puntuación, mayúsculas, números), lo que facilita generar actas limpias a partir de grabaciones de reuniones sin postprocesado manual intensivo.
- Dictado profesional con entidades críticas: gracias a la precisión en nombres, teléfonos y correos electrónicos, es adecuado para aplicaciones de dictado en entornos legales, sanitarios o administrativos donde los datos de contacto deben quedar correctos.
- Transcripción con sesgo de vocabulario técnico: en dominios como farmacéutica, ingeniería o finanzas, se puede pasar una lista de términos o una descripción del tema para mejorar el reconocimiento de jerga y acrónimos propietarios.
- Atención al cliente y análisis de llamadas: el soporte multilingüe (siete idiomas) y la robustez ante ruido permiten transcribir llamadas de centros de contacto para su posterior análisis de calidad, cumplimiento o extracción de entidades.
- Subtitulado y documentación multilingüe: la capacidad de alternar entre transcripción literal y normalizada permite generar subtítulos fieles o textos legibles según el destino (accesibilidad frente a publicación editorial).
- Despliegue on-premise con soberanía de datos: al ser Apache 2.0 y ejecutarse en vLLM o Transformers sobre infraestructura propia, encaja en organizaciones que no pueden enviar audio a servicios en la nube por requisitos regulatorios.
- Investigación en ASR y evaluación de modelos: sirve como referencia de pesos abiertos para comparativas de precisión de entidades y control de estilo en benchmarks como VoiceCodeBench.

## Benchmarks y rendimiento

La model card referencia una imagen de resultados de benchmarks (`assets/benchmark-table.png`) cuyo contenido numérico no está incluido en la información proporcionada. Los únicos datos cualitativos publicados son los siguientes:

| Evaluación | Resultado declarado |
|---|---|
| Artificial Analysis (speech-to-text no streaming, pesos abiertos) | Puesto 1 entre modelos de pesos abiertos; puesto 7 global (a 12 de noviembre de 2026) |
| VoiceCodeBench (besimple AI), precisión de entidades y éxito de tarea | Puesto 2 de 23 sistemas (a 12 de noviembre de 2026) |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni métricas ASR (WER) desglosadas por idioma.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 53,3 GB, por lo que se requiere aproximadamente 54 GB de VRAM solo para los pesos, más memoria para activaciones y caché KV; en la práctica, un GPU de 80 GB (A100 80GB, H100 80GB) es el mínimo cómodo para BF16.
- Con cuantización a 8 bits se estima alrededor de 27 GB de VRAM, lo que permitiría ejecución en GPUs de 40-48 GB (A6000, L40S, A100 40GB), aunque los tipos de cuantización soportados no están documentados.
- No cabe en GPUs de consumo de 24 GB en BF16; en cuantizaciones de 4 bits (si estuvieran disponibles, no confirmado) podría aproximarse a los 14-16 GB, pero este dato no está verificado en la información disponible.
- Despliegue: vLLM 0.32.0 con el plugin incluido en el repositorio, o Hugging Face Transformers (>=5.19,<5.23) con `trust_remote_code=True`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Decodificación especulativa con el draft DFlash en Transformers, procesando una grabación por vez.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SOV-Transcribe-1 | 26,6B totales / 4,6B activos | Hasta 30 min de audio | 7 | Apache 2.0 | ASR con control por instrucciones y sesgo de contexto; #1 open-weight en Artificial Analysis |
| Whisper large-v3 | no disponible en la información | no disponible | no disponible | no disponible | Encoder utilizado como componente de SOV-Transcribe-1; referencia clásica de ASR |
| Gemma 4 26B A4B IT | 26B totales / 4B activos (según nomenclatura) | no disponible | no disponible | no disponible | Modelo base de lenguaje; sin capacidad de audio nativa documentada aquí |

No se dispone de datos suficientes en la información proporcionada para comparar métricas de WER, latencia o throughput con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Solo admite ASR no streaming; no está diseñado para transcripción en tiempo real.
- Idiomas limitados a siete (en, fr, de, es, it, pt, nl); no se documenta cobertura de otras lenguas.
- El audio de entrada está limitado a 30 minutos por petición (valor probado); grabaciones más largas requieren segmentación.
- Riesgo de alucinación inherente a los modelos de lenguaje: en pasajes con ruido extremo o silencios, el LM podría generar texto no presente en el audio.
- Sesgos: la model card no documenta evaluaciones de sesgo por acento, género o dialecto; la robustez ante acentos se declara solo para inglés.
- El soporte nativo en vLLM y Transformers aún está en proceso de upstream; hasta entonces se depende del plugin y del código de modelado propio, lo que introduce riesgo de incompatibilidad con versiones futuras.
- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del repositorio.
- La decodificación especulativa en Transformers procesa una grabación por vez, limitando el paralelismo en ese modo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de los modelos base (Gemma 4 y Whisper) que puedan aplicar en la cadena de derivación.
- No se documentan tipos de cuantización soportados ni métricas de latencia/throughput, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1
- Modelo draft DFlash: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1-DFlash
- Colección de modelos de voz de Salesforce Sovereign Intelligence: https://huggingface.co/collections/salesforce-sovereign-intelligence/speech-models
- Blog de lanzamiento: https://huggingface.co/blog/salesforce-sovereign-intelligence/sov-transcribe-1
- Modelo base de lenguaje: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base de audio: https://huggingface.co/openai/whisper-large-v3
