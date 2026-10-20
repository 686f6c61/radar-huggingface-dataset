# ml-resources/Ming-3.0-tts-0.5B

## Resumen

Ming-3.0-tts-0.5B es un modelo denso de síntesis de voz (text-to-speech) multilingüe desarrollado por inclusionAI, cuya model card remite en su logotipo a Ant Bailing. El repositorio analizado, `ml-resources/Ming-3.0-tts-0.5B`, es un espejo no oficial del checkpoint original `inclusionAI/Ming-3.0-tts-0.5B`, con la misma licencia MIT y sin cambios en los pesos. El modelo se construye sobre un backbone Qwen2.5-0.5B al que se añaden una cabeza DiT, un tokenizador de audio, un encoder de hablante y un tokenizador de texto, y genera audio a 44,1 kHz.

Su propuesta diferencial no es solo la síntesis multilingüe (chino, inglés, alemán, español, francés, coreano y japonés, más los dialectos chinos sichuanés y cantonés), sino el control: clonación de voz zero-shot a partir de una referencia corta, diseño de voz mediante descripción en lenguaje natural, control libre de estilo, 14 etiquetas inline de sonidos paralingüísticos (respiración, tos, suspiro, risa, duda) y ajuste explícito de emoción, velocidad, tono y volumen.

Es relevante para quien evalúe TTS open source porque combina un tamaño reducido (backbone de 0,5B) con un conjunto de controles poco habitual en modelos de esta escala. Conviene advertir de entrada de dos puntos: el repositorio de HuggingFace es solo de distribución de pesos y la inferencia exige clonar el repositorio de GitHub del proyecto, y el recuento real de parámetros en safetensors (1.479.454.868) supera ampliamente la cifra de "0,5B" del nombre, que se refiere únicamente al backbone.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa; backbone Qwen2.5-0.5B + cabeza DiT + tokenizador de audio + encoder de hablante + tokenizador de texto |
| Parametros totales | 1.479.454.868 (~1,48B) según safetensors; el backbone declarado es de 0,5B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Chino, inglés, alemán, español, francés, coreano y japonés; dialectos sichuanés y cantonés |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño de repositorio: 3,0 GB); el tag `onnx` figura en el repositorio, pero la model card no documenta un flujo ONNX |
| Frecuencia de muestreo de audio | 44,1 kHz |
| Tareas soportadas | `TTS`, `FREEFORM`, `VOICE_DESIGN`, `MULTILINGUAL`, `BASIC`, `EMOTION`, `DIALECT`, `IP` |
| API | Python (`ming_tts.MingTTS`) y CLI (`infer.py`), proporcionadas por el repositorio de GitHub |

## Arquitectura y entrenamiento

El checkpoint es un sistema completo, no solo un modelo de lenguaje: integra el backbone Qwen2.5-0.5B (denso, tipo transformer decoder), una cabeza DiT para la generación de audio, un tokenizador de audio, un encoder de hablante que habilita la clonación zero-shot con `--use_spk_emb` y un tokenizador de texto. La síntesis se organiza en tareas discretas: `TTS`, `BASIC`, `EMOTION`, `DIALECT`, `MULTILINGUAL`, `VOICE_DESIGN`, `FREEFORM` e `IP`, cada una con sus controles asociados. El pipeline incluye normalización de números, fechas, unidades y símbolos mediante gramáticas FST (paquete `pynini` 2.1.6), que puede desactivarse con `--no_text_normalization`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron etapas de RLHF o DPO; tampoco se documentan innovaciones de decodificación (especulativa, atención lineal u otras) más allá del uso opcional de `flash-attn`, con retroceso a PyTorch SDPA. El proyecto recomienda verificar la integridad del checkpoint con `python tools/preflight.py --model_path /ruta/al/checkpoint` antes de la inferencia.

## Capacidades

- Clonación de voz zero-shot a partir de un clip de referencia corto, con el texto correspondiente como prompt.
- Diseño de voz (`VOICE_DESIGN`) a partir de una descripción de hablante en lenguaje natural.
- Control libre de la locución y el estilo conversacional mediante la tarea `FREEFORM`.
- Más de 100 voces integradas en chino y cinco voces integradas en inglés.
- 14 etiquetas inline para respiración, tos, suspiro, risa, vacilación, sorpresa y sonidos de pregunta o confirmación, en chino o inglés.
- Control explícito de emoción, velocidad, tono y volumen.
- Síntesis multilingüe en chino, inglés, alemán, español, francés, coreano y japonés; en la tarea `MULTILINGUAL` es obligatorio indicar `language_id` para alemán, español, francés, coreano y japonés.
- Control de dialectos chinos: sichuanés y cantonés (la tarea `DIALECT` no acepta identificador de idioma).
- Salida de audio a 44,1 kHz.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni procesamiento de visión.

## Casos de uso

- Doblaje y localización de vídeo: el modelo sintetiza la misma locución en siete idiomas y permite conservar el timbre del hablante original mediante clonación zero-shot, lo que simplifica la producción de pistas dobladas con voz consistente entre idiomas.
- Audiolibros y narración larga: el control de velocidad, tono y emoción, junto con las etiquetas inline de respiración y pausa, permite generar narraciones con variación expresiva en lugar de una lectura monótona.
- Asistentes de voz para atención al cliente: la tarea `FREEFORM` con una referencia de voz permite fijar la identidad sonora de la marca y ajustar el estilo (más formal, más cercano) sin reentrenar el modelo.
- Generación de voces sintéticas para productos: `VOICE_DESIGN` admite describir en lenguaje natural el hablante deseado, útil para prototipar casting de voces antes de contratar a un actor.
- Contenido para redes y publicidad: las etiquetas de risa, suspiro y sorpresa, junto con el control de emoción, permiten producir piezas con carga expresiva sin grabación humana.
- Accesibilidad y lectura de pantalla: la síntesis multilingüe y el control de velocidad hacen viable generar audio para personas con discapacidad visual o dislexia a partir de texto, con voces estables entre sesiones.
- Prototipado de dialectos para el mercado chino: la tarea `DIALECT` cubre sichuanés y cantonés, útil para productos dirigidos a esas regiones sin disponer de locutores nativos en el equipo.
- Pruebas de regresión en pipelines de audio: el CLI `infer.py` y la API `MingTTS` permiten generar clips deterministas con parámetros fijos y compararlos entre versiones del checkpoint, usando `tools/preflight.py` como comprobación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla comparativa de TTS zero-shot sobre el testset Seed-TTS (`seed-tts-eval-zh` y `seed-tts-eval-en`) con las métricas WER (menor es mejor) y una segunda métrica cuyo nombre aparece truncado, pero los valores numéricos no están disponibles en el extracto proporcionado. La tabla marca en negrita y subrayado los mejores y segundos mejores valores entre los modelos open source listados, y trata Seed-TTS y NVbench-GT como filas de referencia no clasificadas. No se debe asumir ningún valor concreto sin consultar el README del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, los pesos en safetensors ocupan 3,0 GB, lo que sitúa la carga en bf16 en torno a 3 GB más el coste del tokenizador de audio, el encoder de hablante y el búfer de decodificación; se trata de una estimación a partir del tamaño del repositorio, no de una cifra oficial.
- GPU validadas por el autor: NVIDIA H800-80GB y H20-96G con CUDA 12.4, según la model card.
- GPU consumer: no verificadas oficialmente. Por tamaño de pesos, un modelo de esta escala es candidato a caber en tarjetas de 8-12 GB o superiores, pero el requisito real depende del código de inferencia del repositorio de GitHub y no está documentado.
- `flash-attn` es opcional; la inferencia funciona con PyTorch SDPA como alternativa.
- Despliegue: el único camino soportado es el repositorio `inclusionAI/Ming-3.0-tts` (CLI `infer.py` y API `ming_tts.MingTTS`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; estos motores no manejan de forma nativa una cabeza DiT con tokenizador de audio y código personalizado.
- Latencia y throughput: no disponibles. No se publican métricas de RTF ni de tiempo por segundo de audio.

## Comparativa con modelos similares

La información proporcionada no identifica por nombre los modelos open source contra los que se compara Ming-3.0-tts; la tabla de la model card solo menciona las filas de referencia Seed-TTS y NVbench-GT, sin cifras disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de benchmark |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B | 1.479.454.868 totales (backbone 0,5B) | No disponible | MIT | Pesos en HuggingFace y ModelScope; inferencia vía GitHub | No disponibles en la información proporcionada |
| Seed-TTS | No disponible | No disponible | No disponible | Fila de referencia no clasificada en la tabla del autor | No disponibles |
| NVbench-GT | No disponible | No disponible | No disponible | Fila de referencia no clasificada en la tabla del autor | No disponibles |

Para alternativas de la misma categoría (clonación de voz zero-shot multilingüe de tamaño reducido) no se han podido verificar parámetros, contexto ni licencia con la información disponible; cualquier comparación numérica requeriría consultar la tabla completa del repositorio del proyecto.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: el autor del espejo declara explícitamente que todo el crédito corresponde a los autores originales y que no es un lanzamiento oficial. Para producción conviene partir del repositorio `inclusionAI`.
- El repositorio de HuggingFace no incluye un entorno de inferencia autónomo; sin el código del repositorio de GitHub no se puede ejecutar el modelo.
- Riesgo de alucinación acústica y de pronunciación incorrecta: al ser un modelo generativo de audio, puede producir artefactos, prosodia anómala o lectura errónea de textos con grafías ambiguas. La normalización con `pynini` mitiga el problema de números, fechas y unidades, pero añade una dependencia externa.
- Desequilibrio de voces integradas: más de 100 voces en chino frente a solo cinco en inglés, y ninguna cifra publicada para el resto de idiomas (español, alemán, francés, coreano y japonés).
- Los dialectos cubiertos son únicamente chinos (sichuanés y cantonés); no hay soporte documentado de variantes dialectales del español ni de otras lenguas.
- `FREEFORM` no se puede combinar con diseño de voz, voz integrada, emoción, dialecto ni controles de atributos, lo que limita algunas combinaciones de estilo.
- La tarea `MULTILINGUAL` exige indicar `language_id` para alemán, español, francés, coreano y japonés; omitirlo puede producir una síntesis en el idioma equivocado.
- La clonación de voz zero-shot permite usos suplantatorios. Aunque la licencia MIT no restringe el uso comercial, la legislación sobre derechos de imagen y voz (y el RGPD en la UE) exige consentimiento explícito del hablante clonado.
- No se documentan sesgos demográficos ni evaluaciones de equidad entre acentos o géneros; tampoco existe una política de uso aceptable publicada en la información disponible.
- No se publican métricas de latencia, throughput ni consumo de VRAM, lo que dificulta el dimensionamiento de infraestructura.
- El recuento de parámetros del nombre (0,5B) no coincide con el total real en safetensors (~1,48B); conviene calcular el presupuesto de memoria sobre el total, no sobre la cifra del nombre.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/ml-resources/Ming-3.0-tts-0.5B
- Repositorio original en HuggingFace: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Repositorio de código e inferencia (GitHub): https://github.com/inclusionAI/Ming-3.0-tts
- Blog y demos del proyecto: https://nomorecoding.github.io/Ming-3.0-tts/
- ModelScope: https://modelscope.cn/models/inclusionAI/Ming-3.0-tts-0.5b
- Cookbook de tareas y controles: https://github.com/inclusionAI/Ming-3.0-tts/blob/main/cookbooks/instructions.md
- Sección de rendimiento del proyecto: https://github.com/inclusionAI/Ming-3.0-tts#performance

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
