# sajidjavid/CodeAMU-IndoML2026-Track1

## Resumen

CodeAMU-IndoML2026-Track1 no es un modelo generativo de texto, sino un conjunto de 24 checkpoints de detección de eventos de ruido a nivel de trama, presentados por el equipo CodeAMU al Track 1 del datathon IndoML 2026. El sistema quedó primero en la clasificación final (fase 2) con una puntuación combinada de 1.6173 (Event F1 0.7895 + Segment Dice 0.8278). Cada checkpoint es un detector independiente que emite, sobre una rejilla temporal de 20 ms (10 ms en la familia `hr_*`), probabilidades de presencia de ruido, inicio (onset) y fin (offset), además de siete cabeceras de categoría y cabeceras de etiquetas a nivel de clip.

Los detectores se construyen sobre encoders preentrenados de tamaño muy distinto: Whisper small, medium, large-v2 y large-v3 (OpenAI), WavLM Base+ (Microsoft) y BEATs iter3+ AS2M congelado, además de dos familias CRNN propias sobre mel-espectrogramas de 64 y 128 bandas. La combinación final enruta cada clip a un ensemble natural o sintético según sus características y postprocesa la salida; los detalles del enrutado y del postproceso están en el informe técnico del repositorio de GitHub.

Es relevante ahora porque documenta una receta completa y reproducible (checkpoints, configuraciones de entrenamiento y pipeline de inferencia) para segmentación temporal de eventos sonoros con datos escasamente etiquetados, incluyendo aumento mediante clips sintéticos y validación cruzada por mitades. El repositorio ocupa 34 GB y los pesos están publicados con licencia MIT, aunque las puntuaciones publicadas mezclan evaluaciones in-sample y out-of-sample, lo que exige leer la tabla con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 24 detectores de eventos sonoros: encoders transformer de audio (Whisper small/medium/large-v2/large-v3), WavLM Base+, BEATs iter3+ AS2M (congelado) y CRNN sobre mel-espectrogramas de 64 y 128 bandas; cabeceras de trama para presencia/onset/offset, 7 cabeceras de categoría y cabeceras de etiquetas a nivel de clip |
| Parametros totales | No disponible (24 checkpoints con encoders de distinto tamano; el card no publica el recuento agregado) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; salida en tramas de 20 ms (10 ms en `hr_*`) y etiquetas a nivel de clip |
| Tipos de cuantizacion | No disponible; se distribuyen checkpoints PyTorch `best.pt` sin versiones cuantizadas publicadas |
| Idiomas soportados | No disponible (tarea de eventos acusticos, no de ASR; el card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`model` state dict + `args` + `decode_params` + `frame_sec`); sin GGUF ni safetensors |

## Arquitectura y entrenamiento

El sistema es un ensemble heterogéneo. La mitad de los detectores reutiliza encoders de Whisper en cuatro escalas (small, medium, large-v2 y large-v3) con cabeceras frame-level, una parte usa WavLM Base+ y BEATs iter3+ AS2M (este último congelado, tomado del espejo `WeiChihChen/BEATs_iter3_plus_AS2M_finetuned_on_AS2M_cpt2`, revisión 172e407, original de Microsoft UniLM), y otra parte usa CRNN propias con entrada mel de 64 o 128 bandas. Los detectores `hr_*` trabajan a 10 ms de resolución y requieren `SED_TIME_POOL=1` en el pipeline de inferencia. La reconstrucción de la arquitectura se hace desde el diccionario `args` guardado en cada checkpoint mediante `inference/infer.py`.

Los datos proceden de `ARTPARK-IISc/Vaani-Noise-Event-Dataset` (90.635 clips con tres niveles de anotación: gold, silver y bronze), de 11.762 clips sintéticos generados a partir del tier gold y de la release oficial de validación del Track 1 (2.501 clips). El tier gold contiene 11.111 clips. Varias variantes se inicializan desde modelos previos del mismo equipo (`rb_beats`, `cb_s7`, `bg_lg3_syn`, `ov_med_syn`, `v9_lg3_s21`, etc.) y se especializan después con subconjuntos gold o gold+validación. No se documentan en el card el número de tokens/pasos, la composición exacta del dataset ni el uso de RLHF o DPO (no aplica a esta tarea); la innovación principal es la diversidad de encoders junto con el enrutado por clip y el aumento sintético.

## Capacidades

- Detección de presencia de ruido a nivel de trama con resolución de 20 ms (10 ms en los detectores `hr_*`).
- Predicción de onset y offset de cada evento de ruido, lo que permite segmentación temporal y cálculo de Dice por segmento.
- Clasificación en siete categorías de eventos de ruido mediante cabeceras dedicadas por trama.
- Etiquetado a nivel de clip (tags) además de la salida temporal.
- Ensemble con enrutado por clip: el sistema final decide entre un subconjunto "natural" y uno "sintético" de detectores según el clip de entrada.
- Robustez por diversidad de encoders: Whisper (cuatro escalas), WavLM, BEATs y CRNN cubren representaciones distintas del mismo audio.
- Capacidad de validación cruzada limpia: variantes `gv_*` entrenadas con una mitad de validación y evaluadas en la otra.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: la tarea es exclusivamente audio y segmentación temporal.

## Casos de uso

- Monitorización de ruido en entornos urbanos y cumplimiento normativo: el detector permite localizar en el tiempo eventos concretos (obras, tráfico, alarmas) con resolución de 20 ms, lo que facilita informes con marcas temporales precisas en lugar de medias de nivel sonoro.
- Analítica de calidad en call centers y pipelines de ASR: usar los detectores como etapa previa para marcar tramos con ruido de fondo y decidir si se aplica reducción de ruido o se descarta el segmento antes de transcribir.
- Etiquetado asistido de corpus de audio: el modelo preanota onset/offset y categoría sobre grandes volúmenes de grabaciones, y los anotadores solo revisan, reduciendo el coste frente a anotación desde cero.
- Vigilancia acústica en entornos industriales: detección de eventos anómalos (golpes, alarmas, maquinaria) con marcas de inicio y fin que permiten medir duración y frecuencia de cada evento.
- Moderación y clasificación de contenido en plataformas de audio: las cabeceras de clip y la categoría de siete clases permiten filtrar o etiquetar clips cortos en un pipeline de ingestión.
- Despliegue en borde con el subconjunto ligero: los detectores basados en CRNN (64/128 mel) y en WavLM Base+ ofrecen una variante de bajo coste para dispositivos con recursos limitados, reservando los detectores Whisper large para el servidor.
- Investigación en segmentación de eventos sonoros: los 24 checkpoints con sus `args` y `decode_params` sirven como línea base reproducible para comparar encoders y estrategias de aumento sintético.

## Benchmarks y rendimiento

El card publica la puntuación combinada de cada detector en validación. Aviso: las puntuaciones de conjuntos distintos no son comparables (los hold-out gold contienen solo clips naturales y son más difíciles), y las marcadas con ¹ son in-sample, ya que los clips de validación forman parte del entrenamiento de los modelos `*_full_gold`.

Resultado del sistema en la clasificación final (fase 2): Combined 1.6173, Event F1 0.7895, Segment Dice 0.8278 (1.er puesto).

| Detector | Encoder | Trama | Evaluado en | Combined |
|---|---|---|---|---|
| `lg3_full_gold` | Whisper large-v3 | 20 ms | validacion oficial (2.501) | 1.6547 ¹ |
| `lg2_full_gold` | Whisper large-v2 | 20 ms | validacion oficial (2.501) | 1.6190 ¹ |
| `beats_full_gold` | BEATs + Whisper medium | 20 ms | validacion oficial (2.501) | 1.5984 ¹ |
| `gv_lg3_B` | Whisper large-v3 | 20 ms | mitad B de validacion (1.242) | 1.4468 |
| `gv_lg3_A` | Whisper large-v3 | 20 ms | mitad A de validacion (1.259) | 1.4371 |
| `gv_med_A` | Whisper medium | 20 ms | mitad A de validacion (1.259) | 1.4369 |
| `gv_med_B` | Whisper medium | 20 ms | mitad B de validacion (1.242) | 1.4351 |
| `bg_lg3_syn` | Whisper large-v3 | 20 ms | validacion oficial (2.501) | 1.4242 |
| `gv_sml_A` | Whisper small | 20 ms | mitad A de validacion (1.259) | 1.4220 |
| `gv_sml_B` | Whisper small | 20 ms | mitad B de validacion (1.242) | 1.4210 |
| `bg_lg3_syn_gold` | Whisper large-v3 | 20 ms | validacion oficial (2.501) | 1.4186 |
| `cb_big` | CRNN (128-mel) | 20 ms | validacion oficial (2.501) | 1.4136 |
| `cb_s7_gold` | CRNN (128-mel) | 20 ms | validacion oficial (2.501) | 1.4128 |
| `cb_s7` | CRNN (128-mel) | 20 ms | validacion oficial (2.501) | 1.4076 |
| `ov_med_syn` | Whisper medium | 20 ms | validacion oficial (2.501) | 1.4062 |
| `bg_sml_syn` | Whisper small | 20 ms | validacion oficial (2.501) | 1.4022 |
| `hr_med_syn` | Whisper medium | 10 ms | validacion oficial (2.501) | 1.3973 |
| `hr_med_syn_gold` | Whisper medium | 10 ms | validacion oficial (2.501) | 1.3810 |
| `v9_lg3_s21` | Whisper large-v3 | 20 ms | hold-out gold (1.111) | 1.1119 |
| `v8_whis_lg_gold` | Whisper large-v3 | 20 ms | hold-out gold (1.111) | 1.1102 |
| `v9_lg2_gold` | Whisper large-v2 | 20 ms | hold-out gold (1.111) | 1.1037 |
| `rb_beats_gold` | BEATs + Whisper medium | 20 ms | hold-out gold (3.999) | 1.0840 |
| `v2_crnn_gold` | CRNN (64-mel) | 20 ms | hold-out gold (1.111) | 1.0697 |
| `v4_wavlm_gold` | WavLM Base+ | 20 ms | hold-out gold (1.111) | 1.0607 |

No se han publicado resultados de MMLU, HumanEval o GSM8K, ya que el modelo no realiza tareas de texto. No hay resultados en conjuntos externos al datathon.

## Requisitos de hardware

- Espacio en disco: 34 GB para el repositorio completo con los 24 checkpoints; el script `scripts/download_checkpoints.py` del repositorio de GitHub descarga todo el conjunto en `checkpoints/`.
- VRAM: no publicada por los autores. Como referencia, los encoders base tienen aproximadamente 244 M (Whisper small), 769 M (Whisper medium), 1,55 G (Whisper large-v2/v3), 94 M (WavLM Base+) y ~90 M (BEATs iter3+); en fp16 los pesos de large-v3 ocupan del orden de 3 GB, medium ~1,5 GB y small ~0,5 GB, a lo que hay que sumar activaciones y el lote. Estas cifras son estimaciones derivadas del tamano de los encoders, no medidas publicadas.
- GPU recomendadas: no disponible en el card. Por tamano, los detectores Whisper large-v3 requieren GPU de 16-24 GB (RTX 4090, L4, A10, A100) para trabajar con lotes; los detectores Whisper small, WavLM Base+, BEATs y CRNN son aptos para GPU de 8-12 GB.
- Cabe en GPU de consumo: los detectores ligeros (CRNN 64/128 mel, WavLM Base+ y Whisper small) sí; el ensemble completo con varios detectores large-v3 cargados simultáneamente no es viable en una única GPU de consumo.
- Opciones de despliegue: el card solo documenta PyTorch mediante `inference/infer.py` del repositorio (reconstruye la arquitectura desde `args`; `hr_*` requiere `SED_TIME_POOL=1`). No se mencionan exportaciones a ONNX, vLLM, llama.cpp, Ollama ni TGI, y ninguna de esas herramientas aplica a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados de otros sistemas de detección de eventos sonoros en la información disponible, por lo que la comparación externa es "no disponible". La comparación interna entre familias de encoders, con los datos del card, es la siguiente:

| Familia | Detectores | Mejor Combined (conjunto) | Trama | Notas |
|---|---|---|---|---|
| Whisper large-v3 | 6 (`lg3_full_gold`, `bg_lg3_syn`, `bg_lg3_syn_gold`, `gv_lg3_A/B`, `v8_whis_lg_gold`, `v9_lg3_s21`) | 1.6547 (validacion oficial, in-sample) | 20 ms | Mayor coste computacional; mejor puntuación bruta |
| Whisper large-v2 | 3 | 1.6190 (validacion oficial, in-sample) | 20 ms | Rendimiento cercano a large-v3 |
| Whisper medium | 5 | 1.4369 (mitad A de validacion) | 20 / 10 ms | Incluye variantes de alta resolucion `hr_*` |
| Whisper small | 3 | 1.4220 (mitad A de validacion) | 20 ms | Compromiso coste/rendimiento |
| BEATs + Whisper medium | 2 | 1.5984 (validacion oficial, in-sample) / 1.0840 (hold-out gold) | 20 ms | Encoder BEATs congelado |
| CRNN (64/128-mel) | 3 | 1.4136 (validacion oficial) | 20 ms | Mucho más ligeros |
| WavLM Base+ | 1 | 1.0607 (hold-out gold) | 20 ms | Solo evaluado en hold-out difícil |

## Limitaciones y advertencias

- Las puntuaciones más altas (`lg3_full_gold`, `lg2_full_gold`, `beats_full_gold`) son in-sample: los clips de validación oficial forman parte de su entrenamiento, por lo que no sirven como estimación de generalización.
- Las puntuaciones de conjuntos distintos no son comparables entre sí; los hold-out gold contienen solo clips naturales y son más duros, de ahí los valores en torno a 1,06-1,11.
- El modelo está entrenado sobre un único corpus (`Vaani-Noise-Event-Dataset`) y validación del datathon; se desconoce su comportamiento en dominios acústicos, micrófonos o idiomas distintos. No se declaran sesgos concretos, pero el riesgo de degradación por dominio es real.
- Riesgo de falsos positivos y negativos en eventos solapados o de baja energía: el card no publica matrices de confusión por categoría ni umbrales calibrados por clase.
- El ensemble final requiere lógica de enrutado por clip y postproceso descritos en el informe técnico; replicar el resultado de 1.6173 exige implementar ese pipeline, no solo cargar un checkpoint.
- La licencia MIT cubre los pesos, pero no se especifican en el card los términos de uso del dataset Vaani subyacente ni posibles restricciones para uso comercial derivadas de los datos de entrenamiento.
- Varios detectores se inicializan desde modelos previos del equipo, lo que crea dependencias entre checkpoints y complica el análisis aislado de cada contribución.
- No se documentan requisitos de hardware, latencia ni cuantizaciones, lo que dificulta planificar un despliegue en producción.
- Los encoders base (Whisper, WavLM, BEATs) conservan sus propias licencias y condiciones, que deben verificarse por separado.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo; toda la información procede del card de HuggingFace y del repositorio de GitHub enlazado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sajidjavid/CodeAMU-IndoML2026-Track1
- Repositorio de código, pipeline de inferencia y informe técnico: https://github.com/sajidjavid222/CodeAMU_Track1
- Dataset de entrenamiento (referenciado en el card): https://huggingface.co/datasets/ARTPARK-IISc/Vaani-Noise-Event-Dataset
- Encoders Whisper: https://huggingface.co/openai/whisper-large-v3 · https://huggingface.co/openai/whisper-large-v2 · https://huggingface.co/openai/whisper-medium · https://huggingface.co/openai/whisper-small
- Encoder WavLM Base+: https://huggingface.co/microsoft/wavlm-base-plus
- Encoder BEATs iter3+ AS2M (cpt2): https://huggingface.co/WeiChihChen/BEATs_iter3_plus_AS2M_finetuned_on_AS2M_cpt2
- Contacto del autor: sajidj@iiitd.ac.in
