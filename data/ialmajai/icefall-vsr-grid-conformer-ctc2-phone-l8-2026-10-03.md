# ialmajai/icefall-vsr-grid-conformer-ctc2-phone-l8-2026-10-03

## Resumen

El modelo `ialmajai/icefall-vsr-grid-conformer-ctc2-phone-l8-2026-10-03` es un sistema de reconocimiento visual del habla (lectura labial, VSR) entrenado sobre el corpus GRID en inglés británico. Lo publica el usuario ialmajai como parte de la receta `egs/grid/VSR/conformer_ctc2` de icefall, y sustituye a una entrega anterior basada en BPE-58 (abril de 2026). Resuelve un problema muy concreto: transcribir voz a partir únicamente de vídeo, sin señal acústica, usando un front-end AV-HuBERT congelado y una cabeza Conformer-CTC ligera entrenada desde cero.

La cabeza del modelo tiene 5,3 M de parámetros y se apoya en el front-end AV-HuBERT Base (`base_vox_iter5`), también congelado, del que únicamente se leen los estados ocultos de la capa 8 (768 dimensiones, 25 Hz). No es un modelo generativo ni conversacional: es un reconocedor CTC con léxico telefónico, decodificado mediante un grafo HLG que impone la gramática y el vocabulario del corpus GRID. Los pesos distribuidos en el repositorio corresponden exclusivamente a la cabeza Conformer-CTC; el front-end, el predictor de 68 puntos faciales de dlib y la plantilla de cara media no se incluyen por restricciones de licencia.

Su interés actual es doble: por un lado, muestra que una cabeza pequeña con un calendario de entrenamiento corto y muy regularizado (8 épocas, dropout 0,4) generaliza mejor fuera de dominio que un entrenamiento convencional de 30 épocas; por otro, publica los decodificados completos (`eval/`) para que cualquier cifra de WER pueda reproducirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (`conformer_ctc2`, icefall) con la etapa de subsampling eliminada (x1): 6 capas de encoder, dimensión de atención 128, 8 cabezas, feed-forward 1024, más un decodificador atencional auxiliar de 3 capas usado solo como pérdida de entrenamiento (`att_rate` 0,5). Front-end AV-HuBERT Base congelado (modalidad vídeo) |
| Parámetros totales | 5,3 M en la cabeza Conformer-CTC (media de las épocas 5-8). Los parámetros del front-end AV-HuBERT Base no se declaran en la model card |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se define una ventana de tokens; la entrada es vídeo a 25 fotogramas por segundo y durante el entrenamiento se usó `max_duration` de 384 s) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`); léxico telefónico de inglés británico procedente de kaldi-avsr |
| Licencia | `other` / `research-only`, heredada de la licencia de AV-HuBERT de Meta |
| Formato de pesos | PyTorch (`.pt`, diccionario `{"model": state_dict}`) |

## Arquitectura y entrenamiento

El sistema es un híbrido de dos etapas. En la entrada, los labios se recortan como ROI alineadas a una cara media de referencia (ajuste por similitud sobre la punta de la nariz y las esquinas de los ojos), sobre un lienzo de 256x256, con recorte de boca de 96x96 centrado a 88x88, vídeo remuestreado a 25 fps y normalización de imagen propia de AV-HuBERT. El front-end AV-HuBERT Base (`base_vox_iter5`) procesa únicamente el vídeo y permanece congelado; el modelo lee la capa 8 del transformer (768 dimensiones, 25 Hz), que según el autor se sitúa en el centro de un óptimo amplio (capas 7-9). Leer la pila completa de 12 capas empeora el WER en 1,2 puntos en Lombard GRID.

La cabeza es un Conformer-CTC reelaborado en icefall, sin etapa de subsampling, de 6 capas. Las unidades de salida son 34 teléfonos más SIL, SPN y blank, lo que da 37 clases CTC; `tokens_model.txt` añade `<sos/eos>` como clase 37, con 38 salidas en total. La decodificación se realiza a través de un HLG basado en teléfonos que impone el léxico y la gramática de GRID. El decodificador atencional de 3 capas no se usa en inferencia: solo aporta una pérdida auxiliar.

El entrenamiento es deliberadamente corto y muy regularizado: 8 épocas, dropout 0,4 (activation dropout y layer-dropout combinados), `max_duration` de 384 s, learning rate inicial 0,003, sin SpecAugment, precisión mixta, semilla 42 y una única NVIDIA RTX 3080. Se promedian los checkpoints de las épocas 5 a 8. El autor justifica este régimen: un calendario convencional de 30 épocas con dropout 0,1 alcanza un WER en dominio similar, pero degrada hasta el 12,7 % en Lombard GRID. No se documenta en la información disponible el número de tokens ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Reconocimiento visual del habla (lectura labial) en inglés a partir de vídeo, sin usar la señal de audio en ningún punto del pipeline.
- Salida a nivel de teléfono con decodificación restringida por léxico y gramática de GRID mediante grafo HLG.
- Robustez cero-shot entre corpus: funciona sobre Lombard GRID (vista frontal, 54 hablantes, 5.142 enunciados) sin adaptación alguna.
- Capacidad demostrada de generalizar a habla inducida por ruido (estilo Lombard), con WER de 7,99 % frente a 8,80 % en habla normal dentro de ese corpus.
- Extracción de representaciones AV-HuBERT de la capa 8 como característica de 768 dimensiones a 25 Hz, reutilizable por otros clasificadores.
- Decodificación one-best con `lipreader.py` para un vídeo suelto y evaluación por lotes con `decode.py`.
- No dispone de soporte de tool calling ni function calling, ni de razonamiento multi-paso, ni de modo de pensamiento.
- No es multilingüe: únicamente inglés, con léxico telefónico británico.
- No genera texto libre: su salida está restringida por el grafo de decodificación.

## Casos de uso

- Transcripción de voz en entornos donde el audio no está disponible o es ininteligible: el modelo trabaja solo con vídeo, de modo que puede transcribir a partir de una grabación muda o con ruido extremo, siempre que la ROI de boca se preprocese con el modo `meanface`.
- Investigación en reconocimiento visual del habla y reproducción de resultados: el repositorio incluye los decodificados completos (`wer-summary-test.txt`, `errs-*`, `recogs-*`) para rescoring, además de logs y TensorBoard, lo que permite validar cada cifra publicada.
- Evaluación comparativa de front-ends auto-supervisados: al permitir seleccionar la capa del transformer AV-HuBERT, sirve para medir el impacto de leer la capa 8 frente a otras capas o frente a la pila completa (1,2 puntos de WER en Lombard GRID).
- Prototipos de accesibilidad para personas con dificultades vocales: la cabeza puede reentrenarse con un léxico distinto para ampliar el vocabulario más allá de las 34 unidades telefónicas de GRID, partiendo de las características de AV-HuBERT ya congeladas.
- Módulo de anclaje visual en pipelines audiovisuales: usar la salida telefónica como señal complementaria para segmentación o verificación cuando la transcripción acústica es poco fiable.
- Investigación sobre regularización y calendarios cortos de entrenamiento: el contraste entre el régimen de 8 épocas con dropout 0,4 y el de 30 épocas con dropout 0,1 es un caso de estudio reproducible sobre generalización fuera de dominio.
- Docencia y prácticas de sistemas k2/icefall: la receta cubre preparación de datos, extracción de características, entrenamiento y decodificación con grafos FST, con una cabeza de solo 5,3 M de parámetros que entrena en una GPU de consumo.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y la model card. Las cifras de WER están marcadas como no verificadas (`verified: false`) en el propio `model-index`.

| Evaluación | Conjunto | WER (%) |
|---|---|---|
| HLG one-best, hablantes no vistos (s1, s2, s20, s22), seed 42 | GRID (unseen-speaker) | 7,14 |
| Media de tres semillas de entrenamiento (7,14 / 7,13 / 7,19) | GRID (unseen-speaker) | 7,15 |
| Por hablante: s1 / s2 / s20 / s22 | GRID (unseen-speaker) | 13,75 / 5,35 / 5,38 / 4,07 |
| Cero-shot, sin adaptación, vista frontal, 54 hablantes, 5.142 enunciados | Lombard GRID | 8,39 |
| De los cuales habla inducida por ruido (Lombard) / habla normal | Lombard GRID | 7,99 / 8,80 |

La degradación de in-domain a cross-corpus es de 1,2x según el autor. No se han publicado en la información disponible benchmarks de tipo MMLU, HumanEval o GSM8K, que no son aplicables a un modelo de reconocimiento de habla visual.

## Requisitos de hardware

- La cabeza Conformer-CTC tiene 5,3 M de parámetros; en fp32 ocupa aproximadamente 21 MB, por lo que su coste de memoria es despreciable. Los parámetros del front-end AV-HuBERT Base no se declaran en la model card, de modo que no se puede dar una cifra exacta de VRAM total.
- El entrenamiento se completó en una única NVIDIA RTX 3080, lo que indica que tanto el entrenamiento como la inferencia caben sin problema en GPU de consumo de gama media-alta (RTX 3080 o superior). No se requiere A100 ni H100.
- El pipeline completo necesita, además de la GPU, el checkpoint de AV-HuBERT, el predictor de 68 puntos de dlib y la plantilla `20words_mean_face.npy`, que deben descargarse por separado.
- Opciones de despliegue documentadas: `conformer_ctc2/lipreader.py` para reconocer un vídeo suelto y `conformer_ctc2/decode.py` para evaluar por lotes con características precalculadas de la capa 8 en modo `meanface`. Ambos dependen del stack icefall/k2. No se documentan en la información disponible otras vías de despliegue (vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La tasa de entrada es de 25 fotogramas por segundo y la decodificación se hace sobre grafos HLG, pero no se publican medidas de tiempo por utterance.

## Comparativa con modelos similares

La única alternativa directamente comparable identificada en la información disponible es la entrega anterior del mismo autor. No se proporcionan resultados de benchmarks de esa versión, por lo que no puede establecerse una comparación cuantitativa.

| Modelo | Autor | Unidades de salida | Capa del front-end | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `icefall-vsr-grid-conformer-ctc2-phone-l8-2026-10-03` | ialmajai | 34 teléfonos + SIL + SPN + blank (37 clases CTC) | AV-HuBERT Base, capa 8 | `other` / research-only | HuggingFace |
| `icefall-vsr-grid-conformer-ctc2-bpe-58-2026-04-29` | ialmajai | 58 unidades BPE | no disponible | no disponible | HuggingFace |
| Receta VSR de GRID integrada en k2-fsa/icefall (PR #2081) | k2-fsa | no disponible | AV-HuBERT Base, capa 9 | no disponible | GitHub |

El modelo descrito sustituye explícitamente a la versión BPE-58. La diferencia de configuración más relevante documentada es la capa del front-end: esta entrega usa la capa 8 y la receta integrada en el repositorio upstream emplea la capa 9.

## Limitaciones y advertencias

- Licencia de solo investigación: la licencia del front-end AV-HuBERT de Meta es no comercial y excluye explícitamente usos de vigilancia y biometría. La cabeza entrenada sobre esas características hereda esos términos, por lo que no es apta para uso comercial ni para identificación de personas.
- Dependencias no incluidas: el checkpoint `base_vox_iter5.pt` de AV-HuBERT, el predictor de landmarks de dlib y la plantilla `20words_mean_face.npy` deben obtenerse aparte, cada uno con su propia licencia.
- Dominio muy restringido: GRID es un corpus de laboratorio en inglés británico, con vocabulario y gramática limitados y condiciones de grabación controladas. El modelo no está pensado para habla espontánea ni para vocabulario abierto.
- Fuerte varianza entre hablantes: el WER por hablante en el split de evaluación va de 4,07 % (s22) a 13,75 % (s1), lo que indica un comportamiento desigual según la persona.
- Degradación fuera de dominio: el WER sube a 8,39 % en Lombard GRID sin adaptación, y el autor documenta que configuraciones de entrenamiento más convencionales degradan hasta 12,7 % en ese mismo corpus.
- Riesgo de degradación silenciosa: tres ajustes deben coincidir exactamente con el checkpoint (`--roi-mode meanface`, `--layer 8` y el léxico telefónico/HLG). Si no coinciden, la precisión cae sin que se produzca ningún error explícito.
- Riesgo de error por sustitución: al ser un modelo CTC decodificado con un grafo que impone el léxico de GRID, no puede emitir palabras fuera de ese vocabulario, pero sí confundir unas palabras por otras dentro de él. No hay puntuación ni mayúsculas en la salida.
- El campo de tamaño del repositorio en HuggingFace indica 0.0 GB, dato que conviene comprobar antes de asumir que los pesos están efectivamente publicados.
- No se han publicado resultados completos de entrenamiento (número de tokens, composición exacta del dataset) en la información disponible.
- Cero descargas y cero "likes" en el momento de la consulta: el modelo no cuenta con validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ialmajai/icefall-vsr-grid-conformer-ctc2-phone-l8-2026-10-03
- Entrega anterior basada en BPE-58: https://huggingface.co/ialmajai/icefall-vsr-grid-conformer-ctc2-bpe-58-2026-04-29
- Receta de VSR en la rama `vsr-data-aug`: https://github.com/ialmajai/icefall/tree/vsr-data-aug/egs/grid/VSR
- Receta de VSR integrada en icefall upstream: https://github.com/k2-fsa/icefall/tree/master/egs/grid/VSR
- Pull request con la receta de VSR para GRID: https://github.com/k2-fsa/icefall/pull/2081
- Repositorio de icefall: https://github.com/k2-fsa/icefall
- Documentación de icefall en DeepWiki: https://deepwiki.com/k2-fsa/icefall
- Repositorio de AV-HuBERT (front-end y licencia): https://github.com/facebookresearch/av_hubert
- Licencia de AV-HuBERT: https://github.com/facebookresearch/av_hubert/blob/main/LICENSE
- Plantilla de cara media y preprocesado de referencia: https://github.com/mpc001/Lipreading_using_Temporal_Convolutional_Networks
- Artículo asociado: preprint de arXiv en preparación, sin enlace disponible en la información proporcionada
