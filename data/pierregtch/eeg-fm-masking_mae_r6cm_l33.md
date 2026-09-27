# PierreGtch/eeg-fm-masking_mae_r6cm_L33

## Resumen

`eeg-fm-masking_mae_r6cm_L33` es un codificador (*encoder*) de electroencefalografía (EEG) preentrenado de forma auto-supervisada por PierreGtch, publicado en HuggingFace con licencia CC-BY-4.0. Se trata de un modelo fundacional de 12,69 millones de parámetros (solo el codificador) cuyo preentrenamiento sigue el paradigma de *masked autoencoder* (MAE): el codificador observa únicamente los parches de señal no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches ocultos. El resultado es un extractor de características (*feature-extraction*) que puede congelarse y usarse con una sonda lineal o *ridge* sobre tareas EEG posteriores.

El modelo forma parte de un estudio controlado titulado *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*, en el que se entrenan 58 codificadores con una receta idéntica y se varía exclusivamente la geometría del enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos de trabajo (MAE y JEPA). Esta variante concreta corresponde a un radio espacial de 6 cm y una longitud temporal de 33 parches, con un `pct_unmasked` de 0,45. Según el propio autor, esta no es la configuración recomendada por el paper: el artículo recomienda r = 9 cm y L = 2, cuyos pesos están publicados en repositorios hermanos.

La relevancia de esta ficha es fundamentalmente metodológica: el repositorio permite aislar el efecto de una única decisión de diseño (la geometría del enmascaramiento) sobre el rendimiento en 12 conjuntos de datos EEG de OpenEEGBench, algo poco habitual en la literatura de modelos fundacionales. El preentrenamiento se hizo sobre el subconjunto con licencia abierta del corpus REVE (323 registros), lo que permite redistribuir los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches sobre señal EEG, preentrenado como *masked autoencoder* (MAE); el repositorio contiene solo el codificador |
| Parámetros totales | 12.692.096 (12,69 M), codificador únicamente |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | señal troceada en parches de 1 s (200 muestras a 200 Hz con 20 muestras de solapamiento); el enmascaramiento temporal de esta variante es de L = 33 parches; el número de tokens de contexto máximo no está documentado |
| Tipos de cuantización | no disponible (se distribuyen pesos en safetensors, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (modelo de señales EEG; no procesa texto) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el código del repositorio GitHub |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `metadata.json` |
| Framework | PyTorch |
| Tarea (*pipeline*) | feature-extraction |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica factor 1e+06 y escalado `median_std_clip` con recorte en σ = 15) |
| Posiciones de canales | metros, vía `info["chs"][i]["loc"][:3]` de MNE; modelo agnóstico al montaje |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura consiste en un tokenizador de parches (`feature_encoder.*`) seguido de un transformer (`model.*`). La señal EEG se corta en parches de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solapamiento entre parches contiguos). El modelo es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada canal disponga de una posición tridimensional en metros. En el preentrenamiento MAE, el codificador procesa solo los parches visibles y un decodificador ligero —no incluido en el repositorio— reconstruye la señal de los parches enmascarados. Los pesos publicados son el codificador en el *checkpoint* del epoch 10 de 10 (denominado `v9`, el evaluado en el paper); el decodificador no se redistribuye.

El preentrenamiento utilizó el subconjunto de licencia abierta del corpus REVE, compuesto por 323 registros, precisamente para que los pesos pudieran redistribuirse. El calendario de entrenamiento fue de 10 épocas sobre 2 GPU H100, con tamaño de lote de 600 por GPU, tasa de aprendizaje 0,00024 (con 3.080 pasos de *warm-up* y valor final 1e-06) y *weight decay* 0,01. El run de entrenamiento está identificado como `ab3zq84f` en Weights & Biases. No se documenta en la información disponible el uso de RLHF, DPO u otras fases de alineación, algo esperable en un modelo de extracción de características sobre señales biomédicas. La innovación metodológica del trabajo no reside en un componente arquitectónico novedoso, sino en el diseño experimental controlado: 58 codificadores con receta idéntica variando solo la geometría del enmascaramiento (radio espacial y longitud temporal).

## Capacidades

- Extracción de características (*embeddings*) contextuales a partir de señal EEG cruda multicanal, aptas para sondas lineales o *ridge* con el codificador congelado.
- Representación agnóstica al montaje: funciona con cualquier número y disposición de electrodos, siempre que cada canal tenga coordenadas 3D en metros.
- Procesamiento de ventanas temporales arbitrarias mediante parches solapados de 1 s a 200 Hz.
- Preentrenamiento auto-supervisado orientado a transferencia: no requiere etiquetas para producir representaciones.
- Integración con el *benchmark* OpenEEGBench como *backbone* preentrenado (`PretrainedBackbone`).
- Compatibilidad con `ContextualEncoderBenchmarkWrapper`, que encapsula la arquitectura y el escalado de entrada.
- No dispone de soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: es un codificador de señales EEG, no un modelo de lenguaje.

## Casos de uso

- Investigación en modelos fundacionales de EEG: usar este *checkpoint* como una de las celdas del barrido r × L para medir cuánto aporta la geometría del enmascaramiento al rendimiento final, manteniendo constante el resto de la receta.
- Clasificación de patologías con codificador congelado: extraer características y entrenar una regresión *ridge*, tal como se hizo en `tuab` (0,799 de exactitud balanceada) o `tuev` (0,925), para prototipado rápido sin *fine-tuning* completo.
- Detección de crisis epilépticas: el modelo alcanza 0,876 de exactitud balanceada en `chbmit`, lo que permite construir un detector con una sonda ligera sobre las características contextuales.
- Análisis de sueño: clasificación de fases con 0,697 de exactitud balanceada en `isruc-sleep` usando el codificador congelado y una sonda *ridge* de 5 semillas.
- Investigación clínica en salud mental: obtención de representaciones para estudios de depresión (`mdd_mumtaz2016`, 0,847 de exactitud balanceada) sirviendo como línea base reproducible frente a la cual comparar futuros modelos.
- Comparación de marcos de preentrenamiento: contrastar esta variante MAE con su homóloga JEPA bajo la misma geometría de enmascaramiento para evaluar qué objetivo de preentrenamiento transfiere mejor.
- Evaluación de procedimientos de *decoding* sobre dataset pequeños: usar las características congeladas como entrada a *pipelines* de validación cruzada sobre los 12 conjuntos de OpenEEGBench, evitando el coste de reentrenar el codificador.
- Docencia y reproducibilidad: al ser un modelo de 12,69 M de parámetros (menos de 0,1 GB de repositorio), sirve como ejemplo manejable de carga con `safetensors`, `config.json` y `ContextualEncoderBenchmarkWrapper` en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados por el autor en OpenEEGBench con el codificador congelado y una sonda de regresión *ridge* sobre las características contextuales aplanadas (12 conjuntos de datos × 5 semillas). La métrica es exactitud balanceada para clasificación y R² para `seed-vig`.

| Conjunto de datos | Métrica | Puntuación (media ± desviación estándar) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,682 ± 0,013 | 5 |
| bcic2020-3 | exactitud balanceada | 0,278 ± 0,007 | 5 |
| bcic2a | exactitud balanceada | 0,436 ± 0,010 | 5 |
| chbmit | exactitud balanceada | 0,876 ± 0,047 | 5 |
| faced | exactitud balanceada | 0,297 ± 0,015 | 5 |
| isruc-sleep | exactitud balanceada | 0,697 ± 0,002 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,847 ± 0,005 | 5 |
| physionet | exactitud balanceada | 0,570 ± 0,006 | 5 |
| seed-v | exactitud balanceada | 0,289 ± 0,002 | 5 |
| seed-vig | R² | -0,192 ± 0,011 | 5 |
| tuab | exactitud balanceada | 0,799 ± 0,011 | 5 |
| tuev | exactitud balanceada | 0,925 ± 0,025 | 5 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro *benchmark* de lenguaje, ya que no es la modalidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 51 MB para los pesos en fp32 (12,69 M parámetros × 4 bytes) y unos 25 MB en fp16/bf16, a lo que hay que sumar activaciones de una ventana de señal; el consumo total es del orden de decenas de megabytes, muy por debajo de cualquier umbral problemático.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 4090, RTX 3090, RTX 3060 e incluso iGPU o CPU, dado el tamaño reducido. Las H100 solo fueron necesarias para el preentrenamiento (2 × H100, lote de 600 por GPU).
- Cabe holgadamente en GPU de consumo: sí, en cualquier modelo con al menos unos cientos de megabytes de memoria libre; también se puede ejecutar en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch con `safetensors` y la librería `eeg_fm_masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`), o como *backbone* de OpenEEGBench mediante `PretrainedBackbone`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni disponer de pesos GGUF.
- Latencia y *throughput*: no disponibles. El coste dominante en un uso realista es el preprocesado de la señal (remuestreo a 200 Hz, escalado con `median_std_clip`, cálculo de posiciones de canal) y el entrenamiento de la sonda *ridge* posterior, no la pasada por el transformer.

## Comparativa con modelos similares

La comparación más directa es dentro de la propia familia del estudio, donde todos los codificadores comparten receta y número de parámetros y solo cambia la geometría del enmascaramiento o el objetivo de preentrenamiento.

| Modelo | Parámetros | Geometría de enmascaramiento | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eeg-fm-masking_mae_r6cm_L33` (este) | 12,69 M | r = 6 cm, L = 33, pct_unmasked = 0,45 | MAE | CC-BY-4.0 | HuggingFace |
| `eeg-fm-masking_mae_r9cm_L2` | 12,69 M (misma receta) | r = 9 cm, L = 2 | MAE | CC-BY-4.0 | HuggingFace |
| `eeg-fm-masking_jepa_r9cm_L2` | 12,69 M (misma receta) | r = 9 cm, L = 2 | JEPA | CC-BY-4.0 | HuggingFace |

Los dos modelos con r = 9 cm y L = 2 son la configuración recomendada por el paper. No se dispone en la información proporcionada de las puntuaciones de esos dos *checkpoints* concretos, por lo que no es posible cuantificar la diferencia frente a esta variante. Tampoco se dispone de datos comparativos frente a otros modelos fundacionales de EEG externos (por ejemplo LaBraM, BIOT o EEGPT): no disponible.

## Limitaciones y advertencias

- El *checkpoint* contiene únicamente el codificador: el decodificador MAE no se redistribuye, por lo que no es posible reproducir la tarea de reconstrucción tal cual se entrenó.
- La cabeza de clasificación y el búfer de posiciones de canal dependen del conjunto de datos; al cargar con `strict=False` quedan sin inicializar y deben aportarse aparte.
- Esta variante no es la recomendada por el paper: los autores señalan explícitamente que la mejor configuración es r = 9 cm y L = 2. Usarla como predeterminada puede llevar a conclusiones subóptimas.
- Rendimiento cercano o por debajo del azar en varios conjuntos: `bcic2020-3` (0,278), `seed-v` (0,289) y `faced` (0,297) están próximos al nivel de azar en clasificación balanceada, y `seed-vig` presenta un R² negativo (-0,192 ± 0,011), indicando que la representación no captura la variable objetivo en ese caso. La transferencia es, por tanto, muy desigual entre tareas.
- Corpus de preentrenamiento reducido: solo 323 registros del subconjunto abierto de REVE, lo que limita la diversidad de dominios cubiertos.
- Restricciones de entrada estrictas: muestreo obligatorio a 200 Hz, unidades en voltios sin estandarización previa (el *wrapper* ya aplica el escalado) y posiciones de canal en metros. Incumplir estos requisitos degrada o invalida los resultados.
- El modelo es agnóstico al montaje, pero exige que todos los canales tengan posición 3D; canales sin coordenadas no pueden procesarse.
- Sesgos conocidos: no se documentan análisis de sesgo demográfico, de edad o de centro de adquisición en la información disponible, un riesgo relevante en modelos clínicos que se evaluarán sobre poblaciones distintas de las del preentrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo de sobreinterpretar las representaciones o las puntuaciones de una sonda *ridge* como capacidades clínicas generales del modelo.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución y la cita del paper correspondiente, según indica el autor. El código del repositorio se distribuye bajo MIT.
- Los pesos se publicaron sin cuantizar; no hay versiones oficiales en GGUF, ONNX ni formatos optimizados, lo que puede complicar despliegues fuera de PyTorch.
- Advertencia sobre producción clínica: los resultados presentados proceden de un protocolo de evaluación con codificador congelado y sonda *ridge*, no de un sistema validado clínicamente; no debería usarse para decisiones diagnósticas sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r6cm_L33
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código fuente (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado MAE (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado JEPA (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/ab3zq84f
- Referencia de cita del paper: indicada en la página de GitHub del proyecto

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; los enlaces disponibles proceden de la *model card* y de los recursos enlazados por el autor.
