# emillykkegrann/whisper-large-v3-copy-heads-off

## Resumen

`whisper-large-v3-copy-heads-off` es una edición de pesos del modelo `openai/whisper-large-v3` publicada por el usuario emillykkegrann. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una modificación aritmética directa sobre los pesos originales que desactiva 11 cabezas de auto-atención del decodificador. El objetivo es eliminar el fallo de repetición (loops) que Whisper large-v3 produce en transcripciones largas, donde el modelo reescribe una y otra vez fragmentos de texto ya transcritos.

El modelo mantiene la arquitectura y el tamaño del original: 1.543.490.560 parámetros en formato fp16, con el mismo tokenizador, vocabulario y ventana de contexto de 30 segundos por segmento que caracteriza a la familia Whisper. La edición solo modifica 9 de los 1.259 tensores del checkpoint, por lo que los nombres, formas y tipos de datos coinciden con el modelo base y es compatible con cualquier pipeline que acepte `openai/whisper-large-v3`.

Es relevante porque demuestra que un fallo de comportamiento bien localizado en un transformer puede corregirse mediante edición de pesos sin reentrenamiento, con un coste computacional nulo y sin degradar la precisión en audio corto. La model card reporta una reducción del 94% en palabras generadas por loops en un conjunto de validación oculto y una mejora del WER en danés de 31,0% a 19,7% en audio largo transcrito con marcas de tiempo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), auto-atención del decodificador con 32 capas y 20 cabezas por capa |
| Parámetros totales | 1.543.490.560 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana de 30 segundos por segmento de audio; transcripción larga mediante decodificación por ventanas con texto previo |
| Tipos de cuantización | fp16 (original); compatible con GGML/GGUF (se reportan resultados con q5_0); otras cuantizaciones no disponibles |
| Idiomas soportados | Danés (da) e inglés (en) según la model card; el modelo base soporta multilingüe, pero la evaluación se limita a da y en |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); compatible con whisper.cpp/ggml |
| Tamaño del repositorio | 7,3 GB |
| Modelo base | openai/whisper-large-v3 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin cambios estructurales: un encoder de audio y un decoder autoregresivo con atención cruzada, 32 capas de decoder y 20 cabezas de auto-atención por capa, con proyección de salida de 64 dimensiones por cabeza. La innovación no está en la arquitectura sino en la intervención sobre los pesos: para cada par (capa, cabeza) seleccionado se ponen a cero las 64 columnas correspondientes de `model.decoder.layers.L.self_attn.out_proj.weight`, de modo que esa cabeza deja de escribir en el stream residual. Las cabezas afectadas son L2H19, L12H13, L13H7, L13H18, L15H17, L18H19, L21H14, L24H0, L25H18, L25H19 y L26H6 (índices basados en 0).

No hubo entrenamiento ni fine-tuning. Las cabezas se identificaron mediante un análisis de interpretabilidad sobre clips largos en danés: se reconstruyó el estado del decoder en el momento en que large-v3 inicia un loop y se construyeron 220 pares de ventanas (una con una copia previa de la frase en el texto anterior y otra sin ella). Las técnicas de activation patching y direct logit attribution señalaron cabezas de inducción en la auto-atención del decodificador: cabezas tempranas que localizan la copia previa (L12H13 y otras) y cabezas tardías que la escriben (L25H18 y otras). Poner a cero esas 11 cabezas reduce la tasa de loops inducidos del 68% al 0%, mientras que ediciones aleatorias del mismo tamaño la dejan en el 68–74%. La atención cruzada, que trabajos previos (Glazer et al. 2025) señalaban como causa, no colapsa en los casos analizados. El script `make_copy_heads_off.py` permite reconstruir el checkpoint desde `openai/whisper-large-v3`.

## Capacidades

- Reconocimiento automático de voz (ASR) en danés e inglés, con el mismo rendimiento que large-v3 en audio corto.
- Transcripción de audio largo con ventanas de 30 segundos y arrastre de texto previo, con reducción drástica de loops repetitivos.
- Funcionamiento con marcas de tiempo (`timestamps`) y sin ellas (`-nt`), así como con segmentación por VAD (`nt-vad`).
- Compatibilidad con whisper.cpp y el ecosistema GGML/GGUF, incluyendo cuantización q5_0.
- Compatibilidad con la librería `transformers` y con endpoints compatibles.
- No incluye tool calling, function calling, capacidades de agente, visión, audio de entrada más allá de la transcripción ni modo de razonamiento explícito.
- Capacidad multilingüe heredada del modelo base, aunque la evaluación publicada se limita a danés e inglés.

## Casos de uso

- Transcripción de reuniones y entrevistas largas en danés: el modelo evita que el decoder repita frases ya transcritas, lo que reduce el WER de 31,0% a 19,7% en audio largo con marcas de tiempo y disminuye el trabajo de corrección manual posterior.
- Subtitulado automático de vídeo en inglés: en clips largos de FLEURS `en_us` el WER con marcas de tiempo baja de 106,6% a 24,6%, lo que hace viable generar subtítulos sin depuración intensiva.
- Despliegue en local con whisper.cpp: al mantener el formato GGML y funcionar con cuantización q5_0 (con un 79% menos de loops en la evaluación), puede ejecutarse en equipos sin GPU dedicada.
- Integración en pipelines de `transformers`: al conservar nombres, formas y dtype del checkpoint original, se puede sustituir `openai/whisper-large-v3` por este modelo sin cambiar el código de inferencia.
- Preprocesado de corpus de audio para entrenamiento de modelos de lenguaje: la reducción de loops y de audio perdido (Lost Audio) mejora la calidad de las transcripciones que alimentan datasets.
- Investigación en interpretabilidad: el repositorio y el script de edición sirven como caso de estudio reproducible de edición de pesos y de identificación de cabezas de inducción en un modelo de producción.
- Transcripción de llamadas o notas de voz en danés con segmentación VAD: en modo `nt-vad` el modelo no genera loops y mantiene el WER en 14,2% frente al 14,4% del original.

## Benchmarks y rendimiento

Resultados reportados en la model card. Las cifras de audio largo se obtuvieron con whisper.cpp (fork CrispASR v0.8.41, Metal) sobre un Mac con Apple Silicon, en danés salvo donde se indique.

| Prueba | large-v3 | copy-heads-off |
|---|---|---|
| Loops de 10+ palabras, held-out (`timestamps` + `-nt`) | 21 | 1 |
| Palabras escritas por loops, held-out | 1.380 | 85 |
| Loops en 30 grabaciones ocultas (`timestamps` + `-nt`) | 25 | 6 (−76%) |
| Frases perdidas (Lost Audio), `nt-vad` | 14 de 460 | 15 de 460 |
| WER FLEURS `da_dk` test | 12,56% | 12,45% |
| WER held-out, `timestamps` | 31,0% | 19,7% |
| WER held-out, `-nt` | 38,3% | 36,2% |
| WER held-out, `nt-vad` | 14,4% | 14,2% |
| WER clips largos daneses de Codictate, `timestamps` | 17,3% | 11,3% |
| WER clips largos ingleses de Codictate, `timestamps` | 17,6% | 1,7% |
| Loops / WER en 5 clips largos FLEURS `en_us`, `timestamps` | 8 / 106,6% | 2 / 24,6% |
| Loops / WER en 5 clips largos FLEURS `en_us`, `-nt` | 3 / 48,2% | 3 / 51,9% |
| Loops held-out con ggml q5_0 (`timestamps` + `-nt`) | 33 | 7 (−79%) |

Criterios de aceptación fijados antes del test final: se exigía al menos un 80% menos de loops (se obtuvo 76%, no superado), que ediciones aleatorias del mismo tamaño no produjeran el mismo efecto (superado: 12% menos y 4% más), no aumentar las frases perdidas en ningún modo (no superado por una frase: 15 frente a 14), cero loops en modo `nt-vad` (superado) y un WER en FLEURS `da_dk` no más de 0,3 puntos peor (superado). La model card indica que la comprobación en `transformers` sobre los primeros 10 clips (30 minutos) está truncada en el texto disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para pesos, más memoria de activaciones y KV cache; en la práctica se recomiendan 6–8 GB para inferencia cómoda con `transformers`.
- En cuantización q5_0 (GGML) el modelo ocupa del orden de 1 GB, apto para CPU y equipos con poca memoria.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 o H100 para despliegues de alto throughput con lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores con fp16; en CPU mediante whisper.cpp con cuantización.
- Opciones de despliegue: `transformers`, whisper.cpp y forks como CrispASR, y cualquier runtime compatible con GGML/GGUF. No se documentan integraciones específicas con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. Las pruebas se ejecutaron en un Mac con Apple Silicon mediante Metal, sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-large-v3-copy-heads-off | 1.543.490.560 | 30 s por segmento | da, en (evaluado) | MIT | Edición de pesos; menos loops en audio largo |
| openai/whisper-large-v3 | 1.543.490.560 | 30 s por segmento | Multilingüe | MIT | Modelo base; loops frecuentes en audio largo |
| openai/whisper-large-v2 | No disponible en la información proporcionada | 30 s por segmento | Multilingüe | MIT | Generación anterior; sin datos comparativos en la información disponible |
| Otros fine-tunes de Whisper large-v3 | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La edición no elimina las alucinaciones en silencios; la model card lo declara explícitamente fuera de alcance y recomienda detección de voz (VAD).
- No superó el criterio estricto autoimpuesto: quedó en 76% de reducción de loops frente al 80% exigido y perdió una frase más que el original en modo `nt-vad` (15 frente a 14).
- Los 6 loops restantes en el conjunto oculto son en su mayoría repeticiones de 3 o 4 palabras, un fallo que el modelo original y las ediciones de control también cometen; uno de ellos es texto inventado, no una copia.
- La mejora de precisión en danés solo se manifiesta en audio largo; en audio corto el WER es equivalente al original (12,45% frente a 12,56% en FLEURS `da_dk`).
- La evaluación publicada se limita a danés e inglés; no hay datos sobre otros idiomas del modelo base.
- En modo `-nt` con clips largos en inglés el WER empeora ligeramente (51,9% frente a 48,2%), aunque el número de loops es el mismo.
- Solo se han publicado resultados con fp16 y ggml q5_0; no hay datos sobre otras cuantizaciones.
- No hay información sobre sesgos demográficos o lingüísticos específicos de esta edición; se heredan los del modelo base.
- Licencia MIT, sin restricciones conocidas para uso comercial, pero el modelo base y los datos de entrenamiento originales pueden tener condiciones adicionales que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-11-09) es posterior a la de esta ficha; conviene verificar la procedencia y reproducibilidad antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emillykkegrann/whisper-large-v3-copy-heads-off
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio del método y código: https://github.com/EmilLykke/whisper-loop-edit
- Proyecto Codictate: https://github.com/EmilLykke/codictate
- Fork CrispASR de whisper.cpp: https://github.com/CrispStrobe/CrispASR
- Paper referenciado (Glazer et al. 2025): arXiv:2505.12969
- Paper referenciado: arXiv:2508.15882
