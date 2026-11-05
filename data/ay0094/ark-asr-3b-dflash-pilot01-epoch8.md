# AY0094/ark-asr-3b-dflash-pilot01-epoch8

## Resumen

ARK-ASR-3B DFlash draft (pilot-01, epoch 8) es un modelo borrador (*draft model*) para decodificación especulativa orientado a acelerar la inferencia de un modelo objetivo de reconocimiento automático del habla denominado Edge0/ARK-ASR-3B. Lo publica el usuario AY0094 en HuggingFace y deriva de un volumen de entrenamiento alojado en Modal (cuenta hanweny), dentro de una ejecución de entrenamiento identificada como `runs/pilot-01/training/8`. Su función no es transcribir audio por sí mismo, sino proponer tokens candidatos que el modelo objetivo verifica, reduciendo el número de pasos de decodificación.

El modelo emplea una receta de decodificación especulativa por bloques (*block 8*) con 5 capas y un vocabulario reducido de 48.000 entradas derivado de las etiquetas de entrenamiento. A pesar de la denominación "3B" en el nombre del repositorio, los pesos publicados en safetensors suman 807.629.312 parámetros, es decir, aproximadamente 0,81 mil millones. Se entrenó sobre 5.000 clips de LibriSpeech train-clean-100 (251 hablantes) durante 10 épocas, con una longitud total de secuencia de 4096 y un máximo de 512 anclas.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación (pilot-01) pensado para evaluar la aceptación offline de un borrador sobre un objetivo ASR concreto, no un modelo listo para producción. El autor advierte explícitamente de que no es un *drop-in draft* para Omni, ya que carece de `sample_from_anchor`. La validación reportada es únicamente offline (300 clips, pérdida de validación 0,781, longitud de aceptación 4,08 tokens) y no mide velocidad de servicio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificacion especulativa por bloques (block 8, 5 capas); `custom_code` |
| Parametros totales | 807.629.312 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de inferencia; entrenamiento con total-seq-len 4096 y max-anchors 512 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (datos de entrenamiento en ingles: LibriSpeech) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`); incluye mapeos `d2t`/`t2d` dentro de `model.safetensors` |

## Arquitectura y entrenamiento

El modelo es un borrador de 5 capas con decodificación especulativa por bloques de tamaño 8, diseñado para predecir varios tokens por paso que el modelo objetivo Edge0/ARK-ASR-3B verifica después. Toma como referencia las capas auxiliares 2/18/33 del objetivo (índice de entrada de capa en HF; los IDs Omni equivalen a i-1) y opera sobre el último *slice* antes de la RMSNorm final. El vocabulario del borrador es de 48.000 entradas, construido a partir de las etiquetas de entrenamiento, y los mapeos entre vocabulario del borrador y del objetivo (`d2t`/`t2d`) se almacenan dentro de `model.safetensors`.

El entrenamiento usó AdamW con tasa de aprendizaje 6e-4, scheduler coseno con 4 % de calentamiento, pérdida D-Pace CE, 10 épocas y un `train.py` parcheado para corregir la reanudación de la tasa de aprendizaje. Los datos son 5.000 clips de LibriSpeech train-clean-100 correspondientes a 251 hablantes. La validación se hizo sobre 300 clips disjuntos por hablante (150 de dev-clean y 150 de dev-other), con pérdida de validación de 0,781 y longitud de aceptación offline de 4,08 tokens (4,44 en clean, 3,75 en other), medida como tokens por ronda de verificación excluyendo el prefill. La época 8 se seleccionó por aceptación offline y por menor pérdida de validación. El estado del optimizador y del scheduler se omitió del repositorio.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre el modelo objetivo Edge0/ARK-ASR-3B.
- Predicción por bloques de tamaño 8 con 5 capas, orientada a reducir rondas de verificación.
- Mapeo de vocabulario borrador-objetivo mediante `d2t`/`t2d` embebidos en los pesos.
- Uso de representaciones internas del objetivo en las capas auxiliares 2/18/33 (índice HF).
- No soporta *tool calling* ni *function calling*: no disponible.
- No soporta agentes ni razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; los datos de entrenamiento son en inglés (LibriSpeech).
- No incluye `sample_from_anchor`, por lo que no es un borrador intercambiable directamente con Omni.
- Modo *thinking*, visión o audio nativos: no disponible.

## Casos de uso

- Aceleración de un pipeline ASR experimental: integrar el borrador junto al objetivo Edge0/ARK-ASR-3B para proponer tokens por bloque de 8 y verificar en el objetivo, reduciendo rondas de decodificación en pruebas controladas.
- Investigación en decodificación especulativa: usar el par borrador-objetivo para estudiar la relación entre aceptación offline y latencia real en un entorno de laboratorio.
- Evaluación de recetas de entrenamiento de borradores: replicar la receta (AdamW 6e-4, coseno con 4 % de calentamiento, D-Pace CE, 10 épocas) sobre otros corpus ASR para comparar aceptación.
- Análisis de mapeo de vocabulario: aprovechar `d2t`/`t2d` para experimentar con vocabularios reducidos de 48.000 entradas en tareas de ASR en inglés.
- Estudio de selección de checkpoints: comparar la época 8 con otras épocas usando la métrica de aceptación offline (4,08 tokens de media) como criterio de selección.
- Prototipado en investigación académica: emplear el artefacto como referencia reproducible de un borrador de 5 capas y 807 M de parámetros sobre LibriSpeech train-clean-100.
- Benchmarking interno de infraestructura: medir el coste de verificación por ronda excluyendo prefill en configuraciones de despliegue propias, sabiendo que el autor solo reporta datos offline.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de validacion | 0,781 | 300 clips, dev-clean 150 + dev-other 150, disjunto por hablante |
| Longitud de aceptacion offline (global) | 4,08 tokens | Tokens por ronda de verificacion, excluyendo prefill |
| Longitud de aceptacion offline (clean) | 4,44 tokens | Subconjunto dev-clean |
| Longitud de aceptacion offline (other) | 3,75 tokens | Subconjunto dev-other |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER) en la informacion disponible. Las cifras anteriores son metricas internas de aceptacion offline y no miden velocidad de servicio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 807.629.312 parametros, en FP16 serian aproximadamente 1,6 GB de pesos, y en FP32 unos 3,2 GB, sin contar activaciones ni el modelo objetivo.
- GPU recomendadas: no disponible; el modelo es un borrador y requiere ejecutarse junto al objetivo Edge0/ARK-ASR-3B, cuyo coste de memoria no se detalla.
- Cabe en GPU de consumo: previsiblemente si en terminos de pesos (1,6 GB en FP16), pero la viabilidad depende del modelo objetivo y no esta documentada.
- Opciones de despliegue: no disponible; el repositorio usa `custom_code`, por lo que la carga requiere el codigo personalizado del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica explicitamente que la aceptacion reportada es offline y no velocidad de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARK-ASR-3B DFlash draft (pilot-01, epoch 8) | 807.629.312 | Entrenamiento con total-seq-len 4096 | Borrador de decodificacion especulativa para ASR | no disponible | HuggingFace, 0 descargas |
| Edge0/ARK-ASR-3B | no disponible | no disponible | Modelo objetivo ASR | no disponible | Referenciado como objetivo, no evaluado aqui |
| Borradores de decodificacion especulativa genericos (p. ej. EAGLE, Medusa) | no disponible | no disponible | Aceleracion de LLM | no disponible | No comparables directamente por dominio ASR |

No se dispone de datos publicados de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR autonomo: solo genera candidatos que otro modelo debe verificar; no produce transcripciones por si mismo.
- No es un *drop-in draft* para Omni: carece de `sample_from_anchor`, segun el autor.
- Validacion exclusivamente offline: la aceptacion de 4,08 tokens no equivale a ganancia de velocidad en servicio.
- Entrenado solo con 5.000 clips de LibriSpeech train-clean-100 (251 hablantes), en ingles; el rendimiento fuera de ese dominio es desconocido.
- Licencia no declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Idiomas soportados no declarados; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un borrador, los errores se filtran por la verificacion del objetivo, pero pueden afectar a la aceptacion.
- Estado del optimizador y scheduler omitido: no es posible reanudar el entrenamiento desde el checkpoint publicado.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: artefacto experimental sin validacion externa.
- Requiere `custom_code` para cargar los pesos; no se garantiza compatibilidad con frameworks de inferencia estandar.

## Enlaces

- HuggingFace: https://huggingface.co/AY0094/ark-asr-3b-dflash-pilot01-epoch8
- Modelo objetivo referenciado: Edge0/ARK-ASR-3B (commit 1e28271b79edc97635783bea65abc89195a09ed3), sin URL publica en la informacion disponible.
- Volumen de entrenamiento: Modal `ark-asr-dflash` (cuenta hanweny), ruta `runs/pilot-01/training/8`; sin URL publica.
- Paper, blog, repositorio o demo: no disponibles.
