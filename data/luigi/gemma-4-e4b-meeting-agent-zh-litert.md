# Luigi/gemma-4-E4B-meeting-agent-zh-LiteRT

## Resumen
Gemma-4-E4B meeting agent (zh-TW) LiteRT es un ajuste fino de `google/gemma-4-E4B-it` publicado por el usuario Luigi en Hugging Face. No es un asistente conversacional general: está especializado en leer una transcripción de reunión en chino tradicional (zh-TW) en el teléfono, ventana a ventana, y emitir notas breves y citadas con decisiones, acciones, propuestas, incidencias abiertas y cifras clave. A partir de esas notas genera un resumen en prosa y un título.

El modelo resuelve un problema acotado de producción: resumir reuniones sin enviar audio o transcripciones a la nube, usando LiteRT-LM/TFLite sobre CPU móvil. La versión `mobile-v2` (2026-10-17) añade SFT con un tercer dominio —programas financieros de televisión taiwaneses— y una ronda de destilación on-policy con Gemma-4-31B como profesor; la v1 queda en la raíz del repositorio. El contexto es de 4k tokens, con ventanas de unas 1.500 tokens de transcripción, un diario de reinicio de 1.200 tokens y un máximo de 8 notas por ventana en v2.

El repositorio ocupa 16,7 GB e incluye artefactos `.litertlm`, grafos `.tflite`, un LoRA QAT en safetensors y el checkpoint fusionado. Tiene 142 descargas y 0 likes en el momento de la consulta. La model card recomienda v2 salvo en aplicaciones centradas en reuniones de negocio tipo AliMeeting, donde la cobertura empeora.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje decoder-only (base `google/gemma-4-E4B-it`), exportado como grafo móvil LiteRT/TFLite con atención int8 fusionada para el motor bifurcado |
| Parámetros totales | no disponible (la información no da la cifra exacta; E4B es la denominación del modelo base) |
| Longitud de contexto | 4.096 tokens (4k); ~1.500 tokens de transcripción por ventana; diario de reinicio de 1.200 tokens; `read_max` 400 |
| Tipos de cuantización | Pesos int4/int2; caché KV int8; activaciones int8 de rango estático; GPTQ sobre la rejilla entera de Google; LoRA QAT de 139.590.432 bytes |
| Idiomas soportados | zh, concretamente zh-TW (chino tradicional); no se documentan otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm`, `.tflite`, `.safetensors`, SentencePiece `.spiece`, `LlmMetadataProto.pbtext` y `system_prompt.txt` |

## Arquitectura y entrenamiento
La model card no describe la topología interna más allá de que parte del grafo móvil de Google para Gemma-4-E4B. El grafo principal incorpora atención int8 fusionada y se distribuyen por separado el embedder, el embedder por capa, el tokenizador SentencePiece y la plantilla de chat. Los pesos son int4/int2, con caché KV int8 y activaciones int8 de rango estático. El punto de partida es `litert-community/gemma-4-E4B-it-litert-lm`.

El entrenamiento se hizo con un LoRA sobre los pesos móviles de Google, manteniendo las escalas de activación de Google en el bucle. Después, los pesos fusionados se redondearon a la rejilla entera propia de Google mediante GPTQ, usando sus escalas, y los enteros se escribieron en el fichero de Google bit a bit. La v2 añade SFT sobre filas de lectura y filas de conversión a lista densa, con el tercer dominio financiero, y una ronda de destilación on-policy: el estudiante lee reuniones de entrenamiento con el harness desplegado, Gemma-4-31B proporciona su distribución top-20 del siguiente token sobre los rollouts del estudiante y el estudiante se entrena con esa distribución. Solo cambian el grafo principal y el system prompt; embedders y tokenizador son byte a byte idénticos a v1. No se indica el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades
- Lectura de transcripciones de reuniones en zh-TW por ventanas de aproximadamente 1.500 tokens, con contexto de 4k y diario de reinicio de 1.200 tokens.
- Generación de notas citadas y breves sobre decisiones, acciones, propuestas, incidencias abiertas y cifras clave.
- Hasta 8 notas por ventana en `mobile-v2`; la v1 usaba un máximo de 5.
- Conversión de notas a listas densas y generación de un resumen en prosa y un título a partir de ellas.
- Ejecución on-device en CPU móvil mediante LiteRT-LM; el motor bifurcado con `mfa/` es la opción recomendada en CPU.
- No se documentan tool calling, function calling, uso general como agente, visión, audio, código, matemáticas ni modo de razonamiento explícito.
- No se documenta soporte multilingüe más allá de zh-TW.

## Casos de uso
- Resumen confidencial de reuniones en el teléfono: la transcripción se procesa localmente con LiteRT-LM y no necesita salir del dispositivo; encaja cuando la privacidad o la conectividad impiden usar APIs en la nube.
- Extracción de actas y acciones en reuniones de comités: el modelo lee la transcripción por ventanas y produce notas citadas con acuerdos, propuestas y tareas; en el dominio Legislative Yuan la cobertura de referencia fue de 0,97 en v2.
- Resumen de programas financieros de televisión: v2 se entrenó específicamente con este dominio y reduce las notas contradichas del 15,8 % al 11,7 %, con cobertura de 0,76.
- Reuniones de negocio tipo AliMeeting: sigue generando notas y resumen, pero v2 baja la cobertura de 0,96 a 0,91; si el producto se centra en este dominio, conviene evaluar v1 antes de desplegar v2.
- Generación de resumen final y título para correo o wiki interna: a partir de las notas ya citadas, el modelo produce un texto en prosa y un título, lo que reduce el trabajo manual posterior a la reunión.
- Integración en una app Android tipo VoxSumDroid: el artefacto `.litertlm` o el motor bifurcado permiten empaquetar el resumen en la propia aplicación; la nota de integración del repositorio describe este escenario.
- Uso en campo o en entornos sin red: al ejecutarse en CPU móvil, puede resumir reuniones grabadas o transcritas localmente en entornos con conectividad limitada.

## Benchmarks y rendimiento
La comparación v1 → v2 usa 43 reuniones no vistas en entrenamiento: 10 programas financieros de televisión, 13 reuniones de comité del Legislative Yuan y 20 reuniones de negocio AliMeeting. El mismo motor bifurcado en CPU con contexto de 4k y el mismo juez, Gemma-4-31B.

| Dominio | Reuniones | Notas contradichas por la transcripción, v1 → v2 | Cobertura de puntos de referencia, v1 → v2 |
|---|---:|---:|---:|
| Programas financieros de televisión | 10 | 15,8 % → 11,7 % | 0,65 → 0,76 |
| Legislative Yuan | 13 | 10,6 % → 9,6 % | 0,96 → 0,97 |
| AliMeeting | 20 | 8,5 % → 8,0 % | 0,96 → 0,91 |

La reducción global de notas contradichas es de 1,5 puntos porcentuales sobre las 43 reuniones (IC del 95 %: −2,9 a −0,2), con la mejora mayor en los programas financieros. v2 escribe más notas: +1,2 por reunión. La cobertura sube 0,11 en financieros, se mantiene plana en comités y baja 0,05 en AliMeeting, de forma significativa; parte de la ganancia de cobertura procede de resúmenes más largos. La model card concluye que E4B `mobile-v2` es el lector E4B recomendado, excepto para aplicaciones que resumen sobre todo reuniones de negocio tipo AliMeeting. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware
- Artefactos de `mobile-v2`: grafo principal de 2.260.210.576 bytes, embedder de 170.920.584 bytes, embedder por capa de 836.778.512 bytes, tokenizador de 4.689.013 bytes y metadatos de 13.435 bytes; la suma de estos artefactos es de aproximadamente 3,27 GB. El `.litertlm` para LiteRT-LM estándar ocupa 3.659.518.480 bytes (3,66 GB).
- VRAM estimada para inferencia: no disponible. El despliegue documentado es CPU móvil mediante LiteRT-LM; no se publican requisitos de VRAM ni de memoria de GPU.
- GPU recomendadas: no disponible. No se documentan pruebas en A100, H100, RTX 4090 ni otras GPU.
- ¿Cabe en GPU consumer? No se documenta. El formato `.litertlm`/`.tflite` está orientado al runtime LiteRT-LM y al motor bifurcado en CPU, no a un despliegue convencional en GPU.
- Opciones de despliegue: LiteRT-LM estándar con `gemma-4-E4B-meeting-agent-zh-mobile-v2.litertlm`; motor bifurcado con `mfa/prefill_decode_fused.tflite` y el resto de artefactos, recomendado en CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no hay cifras absolutas. La model card indica que E4B es aproximadamente 3 veces más lento que el E2B con los mismos prompts y protocolo.
- El contexto de 4k, las ventanas de ~1.500 tokens, el diario de reinicio de 1.200 tokens y `read_max` 400 condicionan la memoria y el número de pasadas necesarias para reuniones largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento y notas |
|---|---|---|---|---|---|
| `Luigi/gemma-4-E4B-meeting-agent-zh-LiteRT` (v2) | no disponible | 4k | apache-2.0 | Hugging Face; artefactos LiteRT-LM/TFLite | Notas contradichas 8,0–11,7 %; cobertura 0,76–0,97; ~3× más lento que E2B |
| `Luigi/gemma-4-E2B-meeting-agent-zh` | no disponible | no disponible | no disponible | Hugging Face | Mismos prompts, protocolo y formato de notas; más errores fácticos que E4B y aproximadamente 3× más rápido |
| `google/gemma-4-E4B-it` | no disponible | no disponible | no disponible | Hugging Face | Modelo base instruction-tuned; no está especializado en notas citadas de reuniones zh-TW |
| `litert-community/gemma-4-E4B-it-litert-lm` | no disponible | no disponible | no disponible | Hugging Face | Grafo móvil de Google con pesos int4/int2, KV int8 y activaciones int8; base técnica del ajuste |

## Limitaciones y advertencias
- Solo se documenta zh-TW. No hay evidencia de funcionamiento en otros idiomas, en mezcla de idiomas ni en variantes de chino distintas.
- La tasa de notas contradichas por la transcripción no es cero: 8,0–11,7 % en v2 según el dominio, con el valor más alto en programas financieros.
- La cobertura de puntos de referencia es limitada en el dominio financiero (0,76) y empeora en AliMeeting al pasar de v1 a v2 (0,96 → 0,91). Si el producto resume sobre todo reuniones de negocio, v2 no es automáticamente la mejor opción.
- El contexto es de 4k y el procesamiento es por ventanas de ~1.500 tokens, con diario de reinicio de 1.200 tokens. Reuniones largas requieren windowing y pueden acumular errores entre ventanas.
- v2 escribe más notas (+1,2 por reunión); parte de la mejora de cobertura se debe a resúmenes más largos, no solo a mejor selección de contenido.
- El system prompt debe coincidir con los pesos: `mobile-v2/system_prompt.txt` para v2 y el prompt de v1 para los ficheros de la raíz. La diferencia incluye el paso de 5 a 8 notas por ventana.
- El LoRA incluido es un LoRA en formato de entrenamiento sobre los pesos móviles de Google, no un adaptador PEFT convencional.
- La ficha declara Apache-2.0 para este ajuste, pero deben revisarse los términos del modelo base `google/gemma-4-E4B-it` y de los artefactos LiteRT de Google antes de un uso comercial.
- No se documentan tool calling, function calling, visión, audio ni uso general como agente; el término “agent” se refiere al protocolo de lectura y notas, no a un agente autónomo.
- La comparación v1/v2 usa un juez automático Gemma-4-31B; no se aportan métricas de evaluación humana en la información disponible.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/Luigi/gemma-4-E4B-meeting-agent-zh-LiteRT)
- [Modelo base google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Grafo móvil litert-community/gemma-4-E4B-it-litert-lm](https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm)
- [Repositorio meeting-summarizer](https://github.com/vieenrose/meeting-summarizer)
- [Nota de integración VoxSumDroid](https://github.com/vieenrose/meeting-summarizer/blob/main/docs/voxsumdroid-integration.md)
- [Modelo hermano E2B](https://huggingface.co/Luigi/gemma-4-E2B-meeting-agent-zh)
