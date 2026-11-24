# PierreGtch/eeg-fm-masking_mae_rall_L2

## Resumen

`eeg-fm-masking_mae_rall_L2` es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE) por Pierre Guetschel (usuario `PierreGtch`). Forma parte de un conjunto controlado de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 marcos de preentrenamiento), con el objetivo de aislar el efecto de esta elección de diseño en el rendimiento downstream. Este modelo concreto usa radio espacial `r = all` (todos los canales) y longitud temporal `L = 2` parches.

El modelo resuelve el problema de obtener representaciones genéricas y transferibles de señales EEG sin etiquetas, de modo que puedan reutilizarse como extractor de características congelado o como inicialización para fine-tuning en tareas clínicas y cognitivas diversas: detección de crisis epilépticas, clasificación de sueño, decodificación de imaginación motora, detección de depresión o atención, entre otras. Es relevante porque el EEG es una modalidad con pocos datos etiquetados y alta variabilidad entre montajes, sujetos y dispositivos, y los modelos fundacionales de dominio permiten amortizar el preentrenamiento entre tareas.

Arquitectura transformer con tokenizador de parches sobre ventanas de 1 segundo a 200 Hz, 12,69 millones de parámetros en el codificador, entrenado sobre el subconjunto de licencia abierta del corpus REVE (323 grabaciones). El checkpoint publicado corresponde al final de la época 10 de 10, que es el evaluado en el artículo asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (masked autoencoder; solo se distribuye el codificador) |
| Parametros totales | 12.692.096 (codificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de 1 s por parche (200 muestras a 200 Hz, solapamiento de 20 muestras); longitud total de contexto no especificada |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no aplica (modelo de señal EEG, no de texto) |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors (`model.safetensors`, codificador únicamente) |

## Arquitectura y entrenamiento

El modelo es un autoencoder enmascarado (MAE) para EEG. La señal se divide en parches de 1 segundo (200 muestras a 200 Hz con solapamiento de 20 muestras) y el codificador procesa únicamente los parches no enmascarados; un decodificador ligero reconstruye la señal cruda de los parches enmascarados durante el preentrenamiento. La geometría de enmascaramiento de este checkpoint concreto enmascara todos los canales (`r = all`) en ventanas temporales de 2 parches (`L = 2`), con un parámetro `pct_unmasked = 0.45`. El modelo es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada uno tenga una posición 3D en metros (formato MNE `info["chs"][i]["loc"][:3]`).

El preentrenamiento usa el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido para permitir la redistribución de los pesos. Se entrenó durante 10 épocas en 2 × H100 con batch size 600 por GPU, learning rate 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0,01. El repositorio incluye además los checkpoints intermedios de las épocas 1 a 9 en subcarpetas `epoch_01/` … `epoch_09/`. La entrada espera unidades en voltios y el wrapper aplica internamente un factor de 1e+06 y un escalado por ventana `median_std_clip` con recorte en σ = 15; no debe estandarizarse la señal previamente.

## Capacidades

- Extracción de características de señales EEG: genera representaciones contextuales por parche utilizables con sondas lineales (ridge) o para fine-tuning.
- Agnóstico al montaje: funciona con cualquier número y disposición de electrodos, siempre que se proporcionen posiciones 3D.
- Procesamiento de ventanas de 1 segundo a 200 Hz con solapamiento, lo que permite cubrir épocas de distinta duración concatenando parches.
- Evaluación estandarizada en OpenEEGBench como backbone preentrenado (`PretrainedBackbone`).
- Checkpoints intermedios para estudiar la evolución del preentrenamiento o elegir un punto de partida alternativo.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un codificador de señal, no un modelo generativo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Detección de crisis epilépticas: con el codificador congelado y una sonda ridge se obtiene una balanced accuracy de 0,891 en `chbmit`, lo que permite construir un clasificador de crisis sin entrenar un modelo profundo desde cero y con pocos datos etiquetados del centro objetivo.
- Monitorización del sueño: el modelo alcanza 0,665 de balanced accuracy en `isruc-sleep`, adecuado para estadificación automática de fases del sueño a partir de registros de una noche.
- Detección de depresión a partir de EEG: 0,803 de balanced accuracy en `mdd_mumtaz2016`, útil como base para herramientas de cribado asistido con validación clínica adicional.
- Decodificación de imaginación motora en interfaces cerebro-computador: con 0,421 en `bcic2a`, sirve como inicialización para fine-tuning en BCI de baja densidad de datos.
- Clasificación de eventos anómalos en EEG intracraneal o de superficie: 0,901 en `tuev` y 0,783 en `tuab`, aplicable a pipelines de revisión asistida de registros largos.
- Investigación en neurociencia cognitiva: extracción de características para analizar respuestas a estímulos (por ejemplo, `faced` con 0,304, `arithmetic_zyma2019` con 0,659) y comparar geometrías de enmascaramiento de forma controlada.
- Estudio metodológico de modelos fundacionales de EEG: los 58 checkpoints con receta idéntica permiten ablaciones reproducibles sobre la geometría de enmascaramiento sin confundir variables.
- Preprocesado como extractor de embeddings en pipelines de análisis offline: dado su tamaño reducido (12,69 M de parámetros), puede ejecutarse en CPU para procesar lotes de registros.

## Benchmarks y rendimiento

Resultados publicados en la model card con codificador congelado y sonda ridge sobre características contextuales aplanadas, 12 conjuntos de datos × 5 semillas. Balanced accuracy para clasificación y R² para `seed-vig`.

| Dataset | Métrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,659 ± 0,008 | 5 |
| bcic2020-3 | balanced acc. | 0,266 ± 0,009 | 5 |
| bcic2a | balanced acc. | 0,421 ± 0,011 | 5 |
| chbmit | balanced acc. | 0,891 ± 0,013 | 5 |
| faced | balanced acc. | 0,304 ± 0,004 | 5 |
| isruc-sleep | balanced acc. | 0,665 ± 0,004 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,803 ± 0,014 | 5 |
| physionet | balanced acc. | 0,537 ± 0,010 | 5 |
| seed-v | balanced acc. | 0,277 ± 0,001 | 5 |
| seed-vig | R² | -0,272 ± 0,011 | 5 |
| tuab | balanced acc. | 0,783 ± 0,005 | 5 |
| tuev | balanced acc. | 0,901 ± 0,044 | 5 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos fundacionales de EEG en estos mismos conjuntos; el artículo asociado estudia el efecto de la geometría de enmascaramiento entre los 58 checkpoints, y recomienda `r = 9 cm`, `L = 2` como configuración óptima, por lo que este checkpoint (`r = all`) no es la variante recomendada por los autores.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 1 GB con los 12,69 M de parámetros en fp32 (unos 51 MB de pesos); en fp16, unos 25 MB. El grueso del consumo proviene de las activaciones según el tamaño de lote y la duración de la señal.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento original usó 2 × H100, pero la inferencia cabe en GPUs de gama baja o incluso en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o iGPU con suficiente memoria para el lote; también en CPU para procesamiento por lotes.
- Opciones de despliegue: carga directa con `safetensors` y el paquete `eeg-fm-masking`; integración con OpenEEGBench mediante `PretrainedBackbone`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_rall_L2 (este) | 12,69 M | Parches de 1 s a 200 Hz | MAE | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_mae_r9cm_L2 | no disponible en la información | Parches de 1 s a 200 Hz | MAE | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_jepa_r9cm_L2 | no disponible en la información | Parches de 1 s a 200 Hz | JEPA | CC-BY-4.0 | Hugging Face |

Los tres pertenecen a la misma familia de 58 codificadores con receta idéntica; las variantes `r9cm_L2` son las recomendadas por los autores del artículo. No se dispone en la información proporcionada de comparaciones con modelos fundacionales de EEG de otros autores (por ejemplo, arquitecturas basadas en transformers de gran escala), por lo que no se incluyen datos cuantitativos de esas alternativas.

## Limitaciones y advertencias

- Este checkpoint no es la configuración recomendada por los autores: el artículo sugiere `r = 9 cm`, `L = 2`, por lo que `r = all` puede rendir por debajo de la mejor variante de la familia.
- El rendimiento es muy desigual entre tareas: `seed-v` (0,277) y `bcic2020-3` (0,266) están cerca del azar, y `seed-vig` presenta R² negativo (-0,272), lo que indica que las características no capturan bien esa tarea de regresión.
- Solo se distribuye el codificador; el decodificador MAE no está incluido, de modo que no es posible usar el modelo para reconstrucción de señal tal cual.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios, posiciones de canal en metros y sin estandarización previa. Un preprocesado incorrecto degrada las representaciones sin aviso.
- Entrenado únicamente con el subconjunto de licencia abierta de REVE (323 grabaciones), lo que puede limitar la cobertura de poblaciones, dispositivos y patologías poco representadas.
- Riesgo de sesgo por población y montaje: al ser agnóstico al montaje, el modelo puede comportarse de forma distinta con configuraciones de electrodos muy alejadas de las del preentrenamiento.
- No es un dispositivo médico ni sustituye la validación clínica; los resultados de balanced accuracy en conjuntos como `mdd_mumtaz2016` o `chbmit` no implican validez en uso clínico real.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el código está bajo MIT.
- No dispone de likes ni de un ecosistema amplio de usuarios (371 descargas), por lo que el soporte comunitario es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rall_L2
- Artículo: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/0hfltxhc
