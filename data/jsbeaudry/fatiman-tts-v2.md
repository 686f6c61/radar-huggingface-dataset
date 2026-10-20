# jsbeaudry/Fatiman-TTS-v2

## Resumen

Fatiman-TTS-v2 es un modelo de síntesis de voz (text-to-speech) para criollo haitiano (kreyòl) publicado por el desarrollador jsbeaudry. Es un fine-tune de Pocket TTS de Kyutai, en concreto de su variante francesa de 24 capas (`languages/french_24l`), con 336.068.290 parámetros y diseñado para inferencia en CPU con salida en streaming.

El modelo cubre un hueco real: la oferta de TTS en criollo haitiano es escasa y casi siempre propietaria y servida por API. Fatiman-TTS-v2 es abierto, con licencia CC-BY-4.0, incluye nueve voces preajustadas y permite crear una voz nueva a partir de unos 10 segundos de audio limpio de referencia.

La diferencia principal frente a la versión 1 es que el entrenamiento usa exclusivamente habla humana: 18.970 clips y 40,1 horas, sin audio sintético de otros servicios. Según la model card, la precisión se mantiene (CER del 2,68 % frente al 2,70 % de v1 en 80 frases reservadas) y en su propia evaluación supera a OpenAI TTS y empata estadísticamente con Google TTS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 24 capas (variante francesa de Kyutai Pocket TTS) |
| Parámetros totales | 336.068.290 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de texto a voz; la model card no documenta ventana de contexto textual) |
| Tipos de cuantización | no disponible; existe un export ONNX en `jsbeaudry/Fatiman-TTS-v2-onnx` para móviles y navegadores, sin detallar el esquema de cuantización |
| Idiomas soportados | criollo haitiano (`ht`); monolingüe |
| Licencia | CC-BY-4.0 (igual que el modelo base) |
| Formato de pesos | safetensors (repo principal); ONNX (repo separado) |
| Pipeline | text-to-speech |
| Librería | `pocket-tts` (probado con la versión 3.3.0) |
| Voces incluidas | 9 (`female1`–`female6`, `man1`–`man3`); las más precisas son `man3` y `female1` |
| Clonación de voz | sí, a partir de ~10 s de audio limpio que empiece y acabe entre palabras |
| Tamaño del repositorio | 1,5 GB |
| Frecuencia de muestreo | no disponible en la model card (`model.sample_rate` en la API) |
| Modelo base | `kyutai/pocket-tts` |

## Arquitectura y entrenamiento

La arquitectura es la de Pocket TTS de Kyutai: un transformer decoder de 24 capas en su variante francesa, del que se conserva el tokenizador. No se trata de un ajuste continuado desde la v1, sino de un fine-tune nuevo partiendo del modelo base. La model card no documenta el mecanismo acústico interno (codec, difusión o decoder autoregresivo) ni si hubo RLHF o DPO; solo indica que se usó el código de fine-tuning de Kyutai.

Los datos de entrenamiento suman 18.970 clips y 40,1 horas, todas de habla humana: 24,7 h de lecturas de la Biblia en criollo (dataset `jsbeaudry/bible-kreyol-aligned`, filtradas con CER de ida y vuelta por ASR ≤ 15 % y limitadas para que la Escritura no dominase el total), 13,9 h de seis sets grabados en estudio (justicia, habla cotidiana, números, redes sociales, finanzas, comercio electrónico) y 1,5 h de lecturas telefónicas pagadas a colaboradores de Datamio, aceptadas solo si estaban aprobadas, limpias (SNR ≥ 45 dB), de banda ancha (≥ 9 kHz) y transcritas correctamente por Oswald (≥ 0,9). Las frases de evaluación se retiraron del conjunto de entrenamiento. Antes del entrenamiento, números y símbolos se escriben con letras (`17` → `disèt`).

El ajuste usó learning rate 1e-4, 1.000 pasos de warm-up y batch de 64. Se guardaron checkpoints cada 1.000 pasos y se puntuaron sobre 40 frases de desarrollo; el paso 4.000 obtuvo el CER más bajo (1,86 %) y es el que se publica. Las voces se generaron a partir de grabaciones de 7–10 s de cada hablante, recogidas con consentimiento firmado.

## Capacidades

- Síntesis de voz en criollo haitiano a partir de texto, con salida en streaming.
- Inferencia en CPU, sin necesidad de GPU.
- Nueve voces preajustadas listas para usar (`female1`–`female6`, `man1`–`man3`).
- Clonación de voz con una referencia de unos 10 segundos de audio limpio.
- Exportación ONNX para ejecución en teléfonos y navegadores.
- Entrenado solo con habla humana (etiqueta `human-speech-only`), sin audio sintético de otros TTS.
- Uso previsto en asistentes de voz (etiqueta `voice-assistant`), aunque el modelo en sí solo cubre la parte de síntesis.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada: es un modelo puramente acústico de texto a voz.
- No es multilingüe: no hay soporte declarado de francés ni de castellano.

## Casos de uso

- Lectura automática de noticias y artículos en kreyòl: el modelo convierte texto periodístico en audio con las nueve voces disponibles, útil para medios locales que publican en criollo y quieren ofrecer versión sonora sin locutor.
- Accesibilidad para personas con discapacidad visual: integrado en un lector de pantalla o en una app móvil mediante el export ONNX, permite leer interfaces y documentos en criollo en el propio dispositivo, sin conexión.
- Asistentes de voz en hardware de baja potencia: al ejecutarse en CPU y en streaming, encaja en Raspberry Pi o dispositivos empotrados donde no hay GPU; se combinaría con un ASR en criollo (por ejemplo Oswald) para cerrar el bucle conversacional.
- IVR y atención al cliente telefónica: respuestas pregrabadas dinámicamente para menús y confirmaciones en criollo, con la ventaja de que el modelo no requiere infraestructura de GPU y el coste por minuto es bajo.
- Educación y alfabetización: generación de audiolibros y material de lectura graduado; conviene deletrear números y símbolos en el texto de entrada para evitar lecturas deficientes, tal como indica la model card.
- Doblaje y localización de contenido audiovisual: con permiso del hablante, se puede clonar una voz concreta a partir de 10 s de referencia para doblar vídeos cortos al criollo manteniendo el timbre del original.
- Preservación lingüística y documentación: creación de archivos sonoros de variedades del criollo a partir de muestras cortas de hablantes colaboradores, con consentimiento firmado.

## Benchmarks y rendimiento

La model card publica tasas de error de caracteres (CER) medidas leyendo frases en voz alta y transcribiéndolas con Oswald, un reconocedor de voz en criollo. Menor es mejor.

Comparación con OpenAI y Google TTS (evaluación del 2026-10-19, 120 frases de 6–18 palabras sin dígitos, 20 por voz, ninguna presente en el entrenamiento):

| Frases | Audio del servicio | Fatiman-TTS-v2 | Diferencia (intervalo bootstrap 95 %) | Mejor / peor que el servicio |
|---|---:|---:|---|---|
| 60 de OpenAI TTS (`onyx`, `shimmer`, `nova`) | 5,8 % | 3,9 % | 1,9 puntos [1,0; 2,8] | 35 / 8 |
| 60 de Google TTS (`zefi`, `kore`, `charles`) | 1,9 % | 1,8 % | 0,1 puntos [−1,1; 1,3]: empate | 17 / 14 |

Comparación con Fatiman-TTS-v1 (80 frases reservadas, seis voces agrupadas, puntuadas con Oswald-ASR-0.6-V1):

| Métrica | v1 | v2 |
|---|---:|---:|
| CER en 80 frases reservadas | 2,70 % | 2,68 % |
| CER en Klara-120 (frases estilo asistente con números y nombres) | 5,73 % | 5,89 % |
| Primera palabra incorrecta (80 frases × 6 voces) | 38 / 480 | 39 / 480 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de LLM: no son aplicables a un modelo de texto a voz. Tampoco hay datos públicos de latencia o throughput.

## Requisitos de hardware

- Inferencia en CPU por diseño: la model card indica explícitamente que "funciona en una CPU" y que emite en streaming.
- VRAM estimada a partir del número de parámetros: ~1,34 GB en FP32 y ~0,67 GB en FP16, más activaciones y buffers de audio; en la práctica, menos de 2 GB.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), aunque no es necesario usarla.
- Despliegue principal: `pip install pocket-tts==3.3.0 soundfile huggingface_hub`, descarga del snapshot y carga con `TTSModel.load_model(config=config)`; el config se distribuye como `config.template.yaml` con el marcador `@MODEL_DIR@` que hay que sustituir.
- Despliegue en móvil y navegador mediante el export ONNX de `jsbeaudry/Fatiman-TTS-v2-onnx`.
- vLLM, TGI y llama.cpp no están soportados: son runtimes para modelos de lenguaje y este modelo usa la librería `pocket-tts`.
- Latencia y throughput: no disponibles. El modelo emite audio en streaming, pero no se publican cifras de RTF ni de tokens de audio por segundo.
- El repositorio ocupa 1,5 GB, por lo que conviene tener ese espacio libre antes de descargar el snapshot completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | CER en frases reservadas | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Fatiman-TTS-v2 | 336.068.290 | criollo haitiano | no aplica | 2,68 % (80 frases) | CC-BY-4.0 | abierto en HuggingFace |
| Fatiman-TTS-v1 | no disponible | criollo haitiano | no aplica | 2,70 % (80 frases) | no disponible en la información proporcionada | abierto en HuggingFace |
| kyutai/pocket-tts | no disponible | francés (variante `french_24l` usada como base) | no aplica | no disponible | CC-BY-4.0 (según la model card) | abierto en HuggingFace |
| OpenAI TTS (`onyx`, `shimmer`, `nova`) | propietario | multilingüe | no disponible | 5,8 % en sus propios 60 clips | propietaria | solo API |
| Google TTS (`zefi`, `kore`, `charles`) | propietario | multilingüe | no disponible | 1,9 % en sus propios 60 clips | propietaria | solo API |

Salvedad: las cifras de OpenAI y Google corresponden a clips generados a principios de 2026 y evaluados con el mismo ASR; la muestra es de 60 frases por servicio y los intervalos de confianza son amplios en el caso de Google.

## Limitaciones y advertencias

- Modelo monolingüe: solo criollo haitiano. No hay soporte declarado de francés, castellano ni inglés.
- Los números y símbolos deben escribirse con letras antes de la inferencia (`17` → `disèt`); de lo contrario se leen mal.
- El CER sube al 5,89 % en Klara-120, un conjunto con números y nombres propios, frente al 2,68 % en frases generales: los elementos no alfabéticos y los nombres son el punto débil.
- La primera palabra se pronuncia mal en 39 de 480 casos (8,1 %), un valor ligeramente peor que el de v1 (38 de 480).
- Sesgo de dominio: 24,7 de las 40,1 horas de entrenamiento son lecturas bíblicas, lo que puede inclinar el registro prosódico hacia un estilo de lectura formal.
- Sesgo de hablantes: las nueve voces proceden de un número reducido de colaboradores con consentimiento firmado; no representan la variación dialectal del criollo haitiano.
- Riesgo de clonación indebida: el modelo imita una voz a partir de ~10 s de audio. La model card exige permiso explícito del hablante y prohíbe el uso para engañar; se aplican los términos de Kyutai para Pocket TTS.
- La calidad de la voz clonada depende de que la referencia esté limpia y empiece y acabe entre palabras.
- La evaluación se hizo con un único ASR (Oswald), de modo que las cifras de CER están condicionadas por ese reconocedor y no son directamente comparables con métricas de otros sistemas.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir tanto a jsbeaudry como a Kyutai como modelo base, e indica los cambios realizados.
- No se han publicado métricas de latencia, throughput ni de robustez ante texto ruidoso (URL, siglas, emoticonos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbeaudry/Fatiman-TTS-v2
- Export ONNX para móviles y navegadores: https://huggingface.co/jsbeaudry/Fatiman-TTS-v2-onnx
- Versión anterior: https://huggingface.co/jsbeaudry/Fatiman-TTS-v1
- Modelo base (Kyutai Pocket TTS): https://huggingface.co/kyutai/pocket-tts
- Dataset de lecturas bíblicas alineadas: https://huggingface.co/datasets/jsbeaudry/bible-kreyol-aligned
- Página del proyecto Fatiman: https://www.thetrio.space/fatiman/
- Sitio del autor: https://www.thetrio.space
