# devkubnet/whisper-th-distill-ct2

## Resumen

`devkubnet/whisper-th-distill-ct2` es una conversión a formato CTranslate2 (float16) del modelo `biodatlab/distill-whisper-th-large-v3`, un Whisper large-v3 destilado y ajustado para reconocimiento automático de voz (ASR) en tailandés. El autor del artefacto es el usuario de HuggingFace `devkubnet`, mientras que el modelo original y el trabajo de destilación y ajuste corresponden a `biodatlab`. El propósito del repositorio es ofrecer una versión directamente utilizable con `faster-whisper`, evitando la fricción de conversión manual.

El modelo resuelve un problema concreto: la transcripción de voz en tailandés con un coste computacional reducido respecto a Whisper large-v3 completo, manteniendo una calidad alta gracias al ajuste fino sobre datos en ese idioma. El artefacto incluye el `tokenizer.json` propio del modelo original (vocabulario large-v3 de 51.866 tokens), un detalle relevante porque sin él `faster-whisper` recurre al tokenizador de whisper-tiny y desplaza los identificadores de idioma.

Es relevante ahora para desarrolladores que necesiten ASR en tailandés en producción sobre CPU o GPU modesta: el formato CTranslate2 con cuantización int8 permite despliegues ligeros, y la decodificación sin tokens de marca temporal está pensada para fragmentos de audio de 20 segundos o menos cortados en pausas. El autor reporta un carácter error rate (CER) de aproximadamente 3,3 % frente al 8,5 % de large-v3-turbo en cuatro clips reales en tailandés sobre CPU con int8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 destilado) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; el ajuste se hizo con fragmentos de ≤ 20 s) |
| Tipos de cuantización | float16 (conversión publicada); int8 empleado en las pruebas reportadas por el autor |
| Idiomas soportados | tailandés (th) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo convertido para faster-whisper) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para ASR multilingüe y traducción de voz. Sobre esa base, `biodatlab` aplicó un proceso de destilación (de ahí el nombre `distill-whisper-th-large-v3`) y un ajuste fino específico para tailandés. El artefacto de `devkubnet` no reentrena el modelo: únicamente lo convierte a CTranslate2 en float16 para su uso con `faster-whisper`.

Un detalle técnico destacable es que el ajuste fino se realizó sin tokens de marca temporal. En lugar de depender del recorrido estándar de 30 segundos de Whisper, el modelo está pensado para transcribir fragmentos de audio recortados en pausas y de 20 segundos o menos. Esta decisión de diseño afecta a la forma de usar el modelo en producción: conviene segmentar el audio por pausas antes de la inferencia en lugar de alimentar ventanas fijas de 30 s. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) en tailandés, con salida de texto transcrito.
- Transcripción de fragmentos cortos de audio (≤ 20 s) cortados en pausas, que es el régimen para el que fue ajustado.
- Ejecución eficiente mediante CTranslate2 y `faster-whisper`, con soporte de cuantización int8.
- Inclusión del tokenizador large-v3 propio (51.866 tokens) para preservar la coherencia de los identificadores de idioma.
- No se documentan capacidades de traducción de voz, diarización, tool calling ni agentes; el modelo está orientado exclusivamente a transcripción en tailandés.

## Casos de uso

- Transcripción de reuniones y entrevistas en tailandés: segmentando el audio por pausas en fragmentos de hasta 20 s y ejecutando el modelo con `faster-whisper`, se obtiene texto con un CER bajo según las pruebas del autor.
- Subtitulado de contenido audiovisual tailandés: el modelo genera la transcripción base sobre la que construir subtítulos; al no usar tokens de marca temporal, el alineado temporal debe resolverse con un paso posterior.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones de soporte telefónico en tailandés para su indexación, búsqueda y análisis de calidad.
- Despliegue en CPU o hardware modesto: la conversión CTranslate2 en float16 y la posibilidad de int8 permiten servir ASR en servidores sin GPU dedicada, útil para prototipos y entornos con presupuesto limitado.
- Procesamiento por lotes de archivos de audio: integración en pipelines de ingesta que transcriben grandes volúmenes de audio tailandés de forma asíncrona.
- Aplicaciones de accesibilidad: conversión de voz a texto en tailandés para personas con discapacidad auditiva en entornos donde no se dispone de infraestructura de GPU.

## Benchmarks y rendimiento

El autor reporta en la model card una única métrica, medida sobre cuatro clips reales en tailandés, en CPU con cuantización int8:

| Modelo | CER (aprox.) | Condiciones |
|---|---|---|
| whisper-th-distill-ct2 | 3,3 % | CPU, int8, 4 clips en tailandés |
| large-v3-turbo | 8,5 % | CPU, int8, 4 clips en tailandés |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y la muestra de cuatro clips es demasiado pequeña para extraer conclusiones generales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 1,6 GB en float16, lo que da una referencia del orden de magnitud de los pesos.
- GPU recomendadas: no disponibles en la información proporcionada. Al ser una conversión de Whisper large-v3 destilado, es esperable que quepa en GPU de consumo, pero no se confirma.
- CPU: el autor ejecutó las pruebas en CPU con int8, por lo que el modelo es viable sin GPU.
- Opciones de despliegue: `faster-whisper` sobre CTranslate2 (formato publicado). No se documentan integraciones con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| devkubnet/whisper-th-distill-ct2 | no disponible | fragmentos ≤ 20 s (ajuste) | th | MIT | CTranslate2 |
| biodatlab/distill-whisper-th-large-v3 | no disponible | Whisper estándar (30 s) | th | MIT | safetensors (modelo original) |
| openai/whisper-large-v3-turbo | no disponible | 30 s | multilingüe | MIT | safetensors, CTranslate2 |
| openai/whisper-large-v3 | no disponible | 30 s | multilingüe | MIT | safetensors, CTranslate2 |

La comparativa se limita a datos de licencia, idioma y formato, ya que no se dispone de recuentos de parámetros ni de benchmarks comparables más allá del CER citado frente a large-v3-turbo.

## Limitaciones y advertencias

- El modelo está ajustado exclusivamente para tailandés; no debe esperarse un rendimiento correcto en otros idiomas.
- La decodificación sin tokens de marca temporal implica que no se generan timestamps fiables; para subtitulado se necesita un alineado posterior.
- El régimen de uso previsto son fragmentos de ≤ 20 s cortados en pausas; alimentar ventanas de 30 s sin segmentar puede degradar la calidad.
- La única métrica publicada se basa en cuatro clips, una muestra insuficiente para garantizar el rendimiento en dominios, acentos o ruido diversos.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios largos.
- Sesgos no documentados en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribución a `biodatlab` como autor del modelo original, tal como indica la model card.
- El artefacto es una conversión de terceros; la responsabilidad del ajuste y de la calidad del modelo recae en el modelo base, no en el conversor.

## Enlaces

- HuggingFace: https://huggingface.co/devkubnet/whisper-th-distill-ct2
- Modelo base: https://huggingface.co/biodatlab/distill-whisper-th-large-v3
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
