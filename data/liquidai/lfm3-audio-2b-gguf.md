# LiquidAI/LFM3-Audio-2B-GGUF

## Resumen

LFM3-Audio-2B-GGUF es la versión cuantizada en formato GGUF de LFM3-Audio-2B, un modelo compacto de audio desarrollado por Liquid AI que acepta texto o audio como entrada y puede responder con texto, con voz sintetizada o con ambas modalidades. Esta variante está pensada para inferencia local en CPU y GPU mediante llama.cpp, lo que permite ejecutar reconocimiento automático del habla (ASR) y síntesis de voz (TTS) en portátiles y dispositivos de borde sin depender de servicios en la nube.

El modelo declara un total de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones, pese al "2B" de su nombre comercial) y soporta 18 idiomas: inglés, árabe, danés, alemán, griego, finés, francés, hebreo, italiano, japonés, coreano, neerlandés, polaco, portugués, español, sueco, turco y chino. La etiqueta de pipeline es `any-to-any`, y el repositorio incluye tanto los pesos cuantizados como el proyector multimodal de audio (`mmproj`) necesario para procesar entrada de voz.

Su relevancia actual radica en que empaqueta un modelo de audio "any-to-any" en un formato que corre en hardware de consumo, algo poco habitual en esta categoría, donde los modelos de audio suelen requerir GPU dedicada. La contrapartida es que, en el momento de publicación de la ficha, el soporte en llama.cpp está pendiente de la fusión del PR ggml-org/llama.cpp#31257, por lo que es necesario compilar desde esa rama para utilizarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card remite a la del modelo original LiquidAI/LFM3-Audio-2B) |
| Parámetros totales | 1.728.801.600 (~1,7 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF con múltiples niveles; el ejemplo oficial usa Q4_K_M para el modelo y Q8_0 para el proyector de audio (`mmproj-LFM3-Audio-2B-Q8_0.gguf`) |
| Idiomas soportados | 18: en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo: la model card de esta variante GGUF remite explícitamente a la ficha del modelo original (LiquidAI/LFM3-Audio-2B) para los detalles de arquitectura y uso. Lo que sí se documenta es el comportamiento funcional: es un modelo multimodal de audio que acepta entrada de texto o de audio y genera salida de texto, de audio (voz) o mixta, con un proyector multimodal separado que se encarga de mapear las representaciones de audio al espacio del modelo de lenguaje.

Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información técnica concreta sobre el proceso de empaquetado es que los parámetros de muestreo de audio del modelo original están almacenados dentro del propio fichero GGUF, de modo que `llama-tts` los aplica automáticamente sin necesidad de configurarlos a mano. La decodificación de voz se controla mediante `--tts-lang` (código de idioma, por defecto `en`) y `--tts-voice` (`female` por defecto, o `male`).

## Capacidades

- Reconocimiento automático del habla (ASR) con selección de idioma explícita mediante el system prompt `Perform ASR in <language>.` o inferencia automática del idioma con `Perform ASR.`.
- Síntesis de voz (TTS) a fichero WAV, con selección de idioma de salida y de voz masculina o femenina.
- Entrada multimodal: acepta audio o texto y puede producir respuesta textual, hablada o ambas (pipeline `any-to-any`).
- Cobertura multilingüe de 18 idiomas, incluidos español, inglés, alemán, francés, italiano, portugués, neerlandés, árabe, hebreo, japonés, coreano y chino.
- Conversación multiturno: el repositorio está etiquetado como `conversational`.
- Inferencia local en CPU y GPU mediante llama.cpp (`llama-mtmd-cli` para ASR y `llama-tts` para síntesis).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su exposición mediante `llama-server`.
- Soporte de la API `/v1/realtime` (conversación de voz en tiempo real por WebSocket) anunciado como "próximamente" en `llama-server`; no disponible en el momento de la publicación.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo puede ejecutar ASR sobre ficheros WAV con `llama-mtmd-cli -hf ... --audio speech.wav -sys "Perform ASR in Spanish." --temp 0`, procesando el audio íntegramente en el dispositivo sin enviar datos a terceros, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Subtitulado y generación de actas en portátiles sin GPU dedicada: al ser una cuantización GGUF de ~1,7 B de parámetros, cabe en memoria de sistema y permite transcribir grabaciones en CPU, con un coste de infraestructura prácticamente nulo.
- Accesibilidad: lectura en voz alta de contenido textual mediante `llama-tts` con voces masculina o femenina y selección de idioma, útil para aplicaciones de asistencia a personas con discapacidad visual o dificultades de lectura.
- Interfaces de voz para aplicaciones de escritorio y kioscos: el modelo permite construir un bucle audio→texto→audio en local, sin latencia de red ni coste por token, adecuado para terminales de atención en tienda o mostrador.
- Preprocesado de audio en pipelines de datos: transcripción masiva de corpus de audio en 18 idiomas para alimentar sistemas de búsqueda, indexación o análisis de sentimiento, usando lotes sobre CPU o GPU de gama media.
- Prototipado rápido de agentes conversacionales por voz: la compatibilidad con endpoints y `llama-server` permite levantar una API local compatible con clientes tipo OpenAI y validar flujos conversacionales antes de escalar a un modelo mayor.
- Evaluación comparativa de TTS/ASR en investigación: al estar los parámetros de muestreo de audio embebidos en el GGUF, los experimentos son reproducibles con el mismo binario y los mismos ajustes por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card de esta variante GGUF no incluye métricas de WER para ASR, de calidad de síntesis (MOS u otras), ni resultados en conjuntos como MMLU, HumanEval o GSM8K, y la búsqueda web realizada no ha devuelto fuentes técnicas relevantes sobre este modelo. Cualquier cifra de rendimiento deberá obtenerse de la ficha del modelo original (LiquidAI/LFM3-Audio-2B) o de evaluaciones propias.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según el tamaño de 1,7 B de parámetros): en torno a 1,0-1,3 GB para Q4_K_M, ~1,9 GB para Q8_0 y ~3,5 GB en FP16, a lo que hay que sumar el proyector de audio `mmproj` en Q8_0. Estas cifras son estimaciones por tamaño de parámetros; no se han publicado requisitos oficiales.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, así como en Apple Silicon (memoria unificada) y en equipos con 8 GB de RAM o más para ejecución en CPU.
- Ejecución en CPU viable: es uno de los objetivos declarados del modelo ("runs locally on laptops and edge devices"), por lo que no requiere acelerador dedicado.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` para ASR, `llama-tts` para síntesis, `llama-server` para servir la API). La descarga con `-hf` obtiene automáticamente el proyector de audio junto con los pesos.
- Requisito previo obligatorio: compilar llama.cpp desde el PR ggml-org/llama.cpp#31257 hasta que se fusione y se publique una versión con soporte para LFM3-Audio y LFM3-Omni.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo real factor (RTF) para ASR o TTS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato local |
|---|---|---|---|---|---|
| LFM3-Audio-2B-GGUF | ~1,7 B | No disponible | Audio/texto → texto/audio | LFM Open License v1.0 | GGUF (llama.cpp) |
| Qwen2-Audio-7B-Instruct | ~8,2 B | No disponible en la información disponible | Audio/texto → texto | Apache 2.0 | Safetensors (requiere stack propio) |
| Qwen2.5-Omni-7B | ~7 B | No disponible en la información disponible | Audio, texto, visión → texto/audio | Apache 2.0 | Safetensors |
| Whisper large-v3 | ~1,55 B | No disponible en la información disponible | Audio → texto (solo ASR) | MIT | Safetensors, GGUF vía terceros |

La ventaja diferencial de LFM3-Audio-2B-GGUF frente a las alternativas de 7-8 B es el tamaño: es aproximadamente cuatro veces menor, lo que le permite ejecutarse en CPU y en GPUs de gama baja. Frente a Whisper, añade síntesis de voz y una interfaz any-to-any, aunque Whisper cuenta con una licencia MIT más permisiva y un ecosistema de herramientas mucho más maduro. Los datos de contexto y rendimiento de los modelos comparados no se han verificado en la información disponible.

## Limitaciones y advertencias

- Soporte incompleto en llama.cpp: hasta que se fusione el PR #31257, es necesario compilar desde esa rama; no funciona con versiones estables publicadas.
- La API `/v1/realtime` para conversación de voz en tiempo real está anunciada pero no disponible todavía, lo que descarta casos de uso de voz interactiva de baja latencia por ahora.
- No se han publicado resultados de benchmarks: no hay métricas objetivas de WER, calidad de síntesis ni razonamiento, por lo que la calidad real debe validarse empíricamente antes de producción.
- Riesgo de alucinación y de transcripciones incorrectas: al ser un modelo de ~1,7 B, es esperable una precisión inferior a la de modelos de audio de mayor tamaño, especialmente en audio con ruido, acentos marcados o solapamiento de hablantes. No hay datos publicados que cuantifiquen este extremo.
- Sesgos: no se documenta en la información disponible ninguna evaluación de sesgos por idioma, acento, género o edad; los modelos entrenados con datos multilingües desbalanceados suelen rendir peor en idiomas con menor representación (por ejemplo, finés, griego o hebreo frente a inglés).
- Limitaciones de idioma: los 18 idiomas declarados no implican el mismo nivel de calidad en todos ellos; solo el inglés está confirmado como idioma por defecto en TTS (`--tts-lang` por defecto `en`) y como ejemplo canónico de ASR.
- Licencia LFM Open License v1.0: no es una licencia de código abierto estándar (se etiqueta como `other`). Es imprescindible revisar el fichero LICENSE del repositorio para conocer las condiciones de uso comercial, los umbrales de facturación y las restricciones aplicables antes de desplegarlo en producción.
- Es una cuantización: la pérdida de precisión respecto al modelo original en safetensors puede afectar a la calidad de transcripción y de síntesis; conviene comparar Q4_K_M con Q8_0 antes de fijar una configuración.
- Sin datos de latencia ni throughput publicados, no es posible garantizar requisitos de tiempo real en hardware modesto.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF
- Modelo base (safetensors): https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31257
- Guía de despliegue en llama.cpp de Liquid AI: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de presentación de LFM3: https://www.liquid.ai/blog/lfm3
- Playground: https://playground.liquid.ai/
- Consola y API: https://console.liquid.ai/dashboard
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la información del repositorio en HuggingFace.
