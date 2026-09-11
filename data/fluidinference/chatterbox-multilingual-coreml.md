# FluidInference/chatterbox-multilingual-coreml

## Resumen

Chatterbox Multilingual — CoreML es una exportación a CoreML del modelo de síntesis de voz ResembleAI/chatterbox en su variante multilingüe, realizada por FluidInference. El objetivo es ejecutar text-to-speech de calidad dentro del ecosistema Apple (macOS e iOS) aprovechando la aceleración por GPU y Neural Engine, sin depender de PyTorch en tiempo de inferencia. El paquete se distribuye como un conjunto de modelos CoreML (`.mlpackage` fuente y `.mlmodelc` compilado) más ficheros de tablas de embeddings y un tokenizador de grafemas.

La arquitectura reproduce el pipeline original de Chatterbox en tres etapas: un módulo autorregresivo T3 basado en un transformer tipo Llama de 520 M de parámetros que genera tokens de habla, un módulo de flow matching S3Gen que convierte esos tokens en tramas mel, y un vocoder HiFTNet que produce la forma de onda final a 24 kHz. El export cubre prefill, decode, flow y vocoder; el host debe aportar normalización de texto, tokenización, CFG, penalizaciones de repetición, muestreo y análisis de alineamiento.

El modelo soporta 23 idiomas (la lista de etiquetas incluye 25 códigos) y se publica con licencia MIT, heredada del modelo base. Su relevancia radica en que permite TTS multilingüe y clonación de voz en dispositivo (on-device) en plataformas Apple, con pasos de decode de 16,8 ms en modo stateful, lo que habilita aplicaciones de baja latencia sin enviar audio a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Text-to-speech en tres etapas: T3 (transformer autorregresivo tipo Llama-520M) + S3Gen (flow matching) + HiFTNet (vocoder neuronal) |
| Parametros totales | ≈520 M en el modulo T3 (Llama-520M); el resto de componentes (S3Gen, HiFTNet) no especifican recuento |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Prefill sobre contexto de texto de ≤256 tokens; KV cache de 1024 slots |
| Tipos de cuantizacion | fp16 (CoreML). No se documentan otras cuantizaciones en este export |
| Idiomas soportados | 23 idiomas: en, fr, de, es, it, pt, pl, tr, ru, nl, cs, ar, zh, ja, hu, ko, hi, da, el, fi, he, ms, no, sv, sw |
| Licencia | MIT (hereda de ResembleAI/chatterbox) |
| Formato de pesos | CoreML (`.mlpackage` y `.mlmodelc`); tablas en safetensors; tokenizador en JSON |

## Arquitectura y entrenamiento

El export mantiene el pipeline de tres etapas de Chatterbox. El modulo T3 es un transformer autorregresivo tipo Llama con 520 M de parametros que opera en dos fases: un prefill sobre un contexto de texto de hasta 256 tokens que inicializa una KV cache de 1024 slots, y un decode paso a paso que reutiliza esa cache. La variante stateful aloja la KV cache en `MLState` (16,8 ms por paso, macOS 15+/iOS 18+), mientras que la variante sin estado la pasa como tensores de entrada/salida (38 ms por paso). El modulo S3Gen implementa un flow matching con bucket de 500 tokens que produce 1000 tramas mel mediante 10 pasos de Euler con CFG integrado en el grafo. El vocoder HiFTNet convierte las tramas mel en forma de onda a 24 kHz (0,09 s por llamada).

No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), ya que este repositorio es unicamente un export de inferencia y las innovaciones destacables son de empaquetado: separacion de la KV cache en `MLState`, ficheros de tablas (`tables.safetensors`) con embeddings de texto/habla y posicionales, y la exposicion de las filas de atencion del analizador de alineamiento (`align_attn`) como salidas del grafo para que el host reproduzca las heuristicas de `AlignmentStreamAnalyzer`. La conversion se realizo con el toolkit mobius (PR #89).

## Capacidades

- Sintesis de voz multilingue en 23 idiomas a partir de texto de entrada.
- Generacion de voz autorregresiva con contexto de texto de hasta 256 tokens y KV cache de 1024 slots.
- Sintesis de habla a 24 kHz mediante vocoder HiFTNet.
- Condicionamiento con una voz integrada por defecto (`voice-default.safetensors`).
- Clonacion de voz a partir de un wav de referencia (requiere preparar la voz offline en Python con los encoders VoiceEncoder / S3TokenizerV2 / CAMPPlus, que no estan convertidos en este repo).
- Analisis de alineamiento expuesto mediante las filas `align_attn` para heurísticas del lado del host.
- No se documenta soporte de tool calling, function calling ni agentes; es un modelo exclusivamente de text-to-speech.
- No incorpora etapa de watermarking (el pipeline Python original de Resemble embebe el watermarker Perth, que este export no incluye).

## Casos de uso

- Lectura de contenido en aplicaciones iOS: integrar los modelos CoreML para leer articulos, noticias o libros en voz alta en el dispositivo, aprovechando el decode stateful de 16,8 ms por paso para una reproduccion fluida.
- Asistentes de voz on-device en macOS: generar respuestas habladas sin enviar texto ni audio a servidores, con la ventaja de privacidad que supone ejecutar la sintesis localmente sobre CPU+GPU.
- Accesibilidad: narracion de interfaz, lectura de mensajes y conversion de texto a voz para usuarios con discapacidad visual, con soporte en 23 idiomas dentro de la misma app.
- Localizacion de aplicaciones: producir voces en varios idiomas (es, fr, de, it, pt, etc.) reutilizando el mismo modelo y tokenizador de grafemas, evitando pipelines separados por idioma.
- Doblaje y prototipado de audio: generar pistas de voz para demos, videos o podcasts en fase de borrador antes de recurrir a grabacion humana, dada la licencia MIT y la ausencia de dependencia de nube.
- Audio para agentes conversacionales: alimentar la respuesta de un LLM con la sintesis de voz en el propio dispositivo, manteniendo la latencia baja gracias a la KV cache persistente en `MLState`.
- Clonacion de voz personalizada (preparada offline): generar voces a partir de una referencia wav procesada previamente con los encoders no incluidos, util para avatares o asistentes con identidad de marca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MOS, WER, MMLU, etc.) en la informacion disponible. El repositorio solo aporta una tabla de paridad numerica frente a la implementacion PyTorch original:

| Comprobacion | Resultado |
|---|---|
| T3 wrappers vs stock (fp32) | logits 3,8e-05; filas de alineamiento exactas |
| T3 CoreML fp16 | logits 2,6e-02 (rango ±15); align 1,4e-03 |
| Flow CoreML fp16 | mel max 2,4e-02; media 2,7e-03 |
| HiFT CoreML fp16 | wav max 1,7e-02; media 2,6e-04 |
| Round-trip ASR end-to-end (en) | transcripcion exacta, coincide con la linea base de PyTorch |

No se dispone de comparaciones con otros modelos de TTS en la informacion proporcionada.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon (macOS e iOS). El repo usa CoreML como formato de pesos.
- Tamano del repositorio: 2,4 GB; el modelo mas grande (T3 prefill/decode) ocupa 977 MB en fp16; el flow 229 MB, el vocoder 40 MB, las tablas 34 MB.
- Memoria: al ser pesos fp16 y varios grafos, se recomienda disponibilidad de memoria unificada suficiente para cargar T3 (977 MB) junto con flow y vocoder; no se especifica un minimo exacto.
- Modo stateful (`MLState`) requiere macOS 15+ o iOS 18+.
- Modo sin estado (`T3-Decode-M1024-fp16`) tiene mayor latencia por paso (38 ms frente a 16,8 ms).
- Compute units: CPU+GPU recomendado. No cargar los paquetes T3 con `.cpuOnly`, ya que provoca un crash en la prediccion; usar `.cpuAndGPU` o `.all`.
- Aceleracion: no se documenta uso explicito del Neural Engine; los grafos T3 declaran CPU+GPU.
- No se documentan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: este export es especifico de CoreML.
- Throughput y latencia: 16,8 ms por paso de decode (stateful) y 38 ms por paso (sin estado); vocoder HiFT a 0,09 s por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chatterbox Multilingual — CoreML (este) | ≈520 M en T3 | Texto ≤256 tokens; CoreML `.mlpackage`/`.mlmodelc` | 23 | MIT | HuggingFace, FluidInference |
| ResembleAI/chatterbox (upstream, variante multilingue) | ≈520 M en T3 (mismo backbone) | Pipeline PyTorch completo | 23 | MIT | HuggingFace |
| Otras alternativas de TTS (XTTS, Kokoro, Piper, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

Solo se dispone de datos verificables del modelo base ResembleAI/chatterbox; no se ha recopilado informacion cuantitativa de otros modelos de TTS en la busqueda realizada, por lo que el resto de la comparativa queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento; solo sintetiza voz a partir de texto.
- No se documentan datos de sesgo del modelo base multilingue; la calidad por idioma puede variar y no se aportan metricas por lengua.
- Riesgo de pronunciacion incorrecta en nombres propios, siglas, numeros o palabras poco frecuentes, al depender de un tokenizador de grafemas.
- El contexto de texto esta limitado a ≤256 tokens por prefill; entradas mas largas requieren troceado.
- La clonacion de voz requiere encoders (VoiceEncoder, S3TokenizerV2, CAMPPlus) no incluidos en este repositorio; hay que preparar las voces offline en Python.
- Cargar los paquetes T3 con `.cpuOnly` provoca un crash en la prediccion; es obligatorio usar `.cpuAndGPU` o `.all`.
- El decode stateful necesita macOS 15+ o iOS 18+, lo que restringe versiones de sistema anteriores.
- Este export no incluye la etapa de watermarking Perth del pipeline original de Resemble; la trazabilidad del audio generado queda en manos del integrador.
- Licencia MIT: permite uso comercial y modificacion, pero obliga a conservar el aviso de copyright y la licencia; conviene verificar tambien las condiciones del modelo base upstream.
- No se han publicado benchmarks estandar de calidad (MOS) ni de error (WER) para este export.

## Enlaces

- HuggingFace: https://huggingface.co/FluidInference/chatterbox-multilingual-coreml
- Modelo base: https://huggingface.co/ResembleAI/chatterbox
- FluidInference (GitHub): https://github.com/FluidInference
- Toolkit de conversion mobius (PR #89): https://github.com/FluidInference/mobius/pull/89
- Puerto de referencia del analizador (`verify/analyzer_port.py`): incluido en el toolkit de conversion mobius
