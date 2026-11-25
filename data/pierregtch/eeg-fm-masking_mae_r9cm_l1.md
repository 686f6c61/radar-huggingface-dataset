# PierreGtch/eeg-fm-masking_mae_r9cm_L1

## Resumen

eeg-fm-masking_mae_r9cm_L1 es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE), desarrollado por Pierre Guetschel (PierreGtch) en el marco del paper *What masking geometry works best for EEG foundation models?* (arXiv:2609.33487). Forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos de preentrenamiento (MAE y JEPA). Este checkpoint concreto corresponde a un radio espacial de 9 cm y una longitud temporal de 1 parche.

El modelo resuelve el problema de obtener representaciones útiles de señales EEG sin grandes volúmenes de etiquetas, algo crítico porque el etiquetado de EEG es caro y escaso. Con 12,69 M de parámetros en el codificador, es deliberadamente compacto: está pensado como extractor de características congeladas para sondas ligeras (ridge) o para ajuste fino, no como generador de texto. Su relevancia actual radica en que permite aislar experimentalmente el efecto de la geometría de enmascaramiento sobre el rendimiento en tareas downstream de EEG.

La entrada es multicanal y agnóstica al montaje: acepta cualquier número y conjunto de canales siempre que cada uno tenga una posición 3D en metros. La señal debe muestrearse a 200 Hz y expresarse en voltios; el wrapper aplica internamente un factor de escala de 1e+06 y un escalado por ventana `median_std_clip` con recorte en σ = 15. El autor recomienda para uso general la variante r = 9 cm, L = 2, no este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (autoencoder enmascarado, MAE); codificador de 12,69 M de parámetros |
| Parametros totales | 12.692.096 (solo codificador; el decodificador MAE no se distribuye) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; la señal se corta en parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de señales EEG, no de texto); el campo de idiomas no está disponible en el repo |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors (`model.safetensors`); checkpoints intermedios en `epoch_01/` a `epoch_09/` |

## Arquitectura y entrenamiento

El modelo es un autoencoder enmascarado: el codificador recibe únicamente los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. El tokenizador de parches (`feature_encoder.*`) convierte segmentos de 1 s a 200 Hz en tokens, y el transformer (`model.*`) procesa la secuencia resultante. La geometría de enmascaramiento de este checkpoint es radio espacial r = 9 cm, longitud temporal L = 1 parche y `pct_unmasked` = 0,45. Los pesos publicados contienen solo el codificador, exactamente los tensores cargados en la evaluación downstream del paper; el decodificador MAE no se incluye.

El preentrenamiento usa el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El schedule es de 10 épocas sobre 2 × H100, batch de 600 por GPU, learning rate 0,00024 con warm-up de 3080 pasos y valor final 1e-06, y weight decay 0,01. El checkpoint publicado es el de fin de la época 10 (el evaluado en el paper), y los de las épocas 1 a 9 están en subcarpetas con los mismos nombres de claves y el mismo `config.json`. La innovación metodológica no está en el modelo individual sino en el diseño controlado de la familia: 58 codificadores con receta idéntica que aíslan la variable de la geometría de enmascaramiento.

## Capacidades

- Extracción de características de EEG multicanal: genera representaciones contextuales por ventana que sirven como entrada a sondas ligeras (ridge) o a cabezas de clasificación.
- Independencia de montaje: funciona con cualquier número y disposición de electrodos, siempre que cada canal tenga una posición 3D en metros.
- Clasificación y regresión downstream tras ajuste: el wrapper incluye una cabeza de clasificación dependiente del dataset que se entrena en la evaluación.
- Procesamiento de señales a 200 Hz con parches de 1 s y solapamiento de 20 muestras.
- Aprendizaje autosupervisado: no requiere etiquetas para el preentrenamiento, lo que permite reutilizarlo en dominios EEG con pocas anotaciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un codificador de señales, no un modelo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Detección de anomalías epilépticas en EEG: con el codificador congelado y una sonda ridge se alcanza un balanced accuracy de 0,876 ± 0,050 en chbmit, lo que permite construir un cribado preliminar sobre registros largos sin entrenar una red desde cero.
- Clasificación de estados de sueño: el rendimiento de 0,662 ± 0,004 en isruc-sleep con solo una sonda lineal lo hace adecuado para segmentar hipnogramas en pipelines de investigación del sueño.
- Detección de eventos transitorios en EEG (tuev): 0,906 ± 0,026 de balanced accuracy con codificador congelado, útil como extractor en sistemas de monitorización de eventos paroxísticos.
- Cribado de depresión a partir de EEG en reposo: 0,816 ± 0,012 en mdd_mumtaz2016 con una sonda ligera, aplicable a estudios clínicos que necesiten una línea base rápida y reproducible.
- Detección de anomalías en EEG clínico (tuab): 0,805 ± 0,003 de balanced accuracy, adecuado para prefiltrar registros que requieran revisión de un neurólogo.
- Investigación sobre geometría de enmascaramiento: al compartir receta con otros 57 checkpoints, permite comparar de forma controlada el efecto de r y L sobre tareas downstream, usando los checkpoints intermedios de las épocas 1 a 9 para estudiar la dinámica de entrenamiento.
- Aprendizaje por transferencia con pocas etiquetas: al ser autosupervisado y compacto (12,69 M de parámetros), se puede ajustar en una sola GPU para dominios EEG con datasets pequeños, partiendo de las representaciones preentrenadas en REVE.

## Benchmarks y rendimiento

Resultados del paper con codificador congelado y sonda ridge sobre características contextuales aplanadas, 12 datasets × 5 semillas. Balanced accuracy para clasificación y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,699 ± 0,011 | 5 |
| bcic2020-3 | balanced acc. | 0,267 ± 0,029 | 5 |
| bcic2a | balanced acc. | 0,453 ± 0,005 | 5 |
| chbmit | balanced acc. | 0,876 ± 0,050 | 5 |
| faced | balanced acc. | 0,312 ± 0,007 | 5 |
| isruc-sleep | balanced acc. | 0,662 ± 0,004 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,816 ± 0,012 | 5 |
| physionet | balanced acc. | 0,579 ± 0,004 | 5 |
| seed-v | balanced acc. | 0,283 ± 0,001 | 5 |
| seed-vig | R² | -0,163 ± 0,093 | 5 |
| tuab | balanced acc. | 0,805 ± 0,003 | 5 |
| tuev | balanced acc. | 0,906 ± 0,026 | 5 |

No se han publicado en la información disponible comparaciones numéricas directas contra otros modelos de la misma familia; el paper indica que la configuración recomendada es r = 9 cm, L = 2, no este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el codificador tiene 12,69 M de parámetros; en fp32 ocupa aproximadamente 51 MB de pesos y en fp16 unos 25 MB. Con activaciones y buffers de entrada, la inferencia cabe holgadamente por debajo de 1 GB de VRAM para ventanas típicas.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento del paper usó 2 × H100 con batch de 600 por GPU, pero la inferencia y el ajuste fino de una sonda no requieren ese hardware.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el código oficial es `eeg-fm-masking` (instalación vía `pip install git+https://github.com/PierreGtch/eeg-fm-masking`) con `ContextualEncoderBenchmarkWrapper` y `PretrainedBackbone` de OpenEEGBench. No se publican integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r9cm_L1 (este) | 12,69 M | Parches de 1 s a 200 Hz, cualquier montaje | MAE | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_mae_r9cm_L2 | no disponible | Parches de 1 s a 200 Hz, cualquier montaje | MAE | CC-BY-4.0 | Hugging Face (recomendado por el autor) |
| eeg-fm-masking_jepa_r9cm_L2 | no disponible | Parches de 1 s a 200 Hz, cualquier montaje | JEPA | CC-BY-4.0 | Hugging Face (recomendado por el autor) |
| Resto de la familia (58 checkpoints) | no disponible por checkpoint | Parches de 1 s a 200 Hz, cualquier montaje | MAE o JEPA | CC-BY-4.0 | Hugging Face (colección `eeg-fm-masking`) |

No se dispone en la información proporcionada de comparaciones con modelos EEG de otros autores (parámetros, contexto o benchmarks comunes).

## Limitaciones y advertencias

- Este checkpoint no es el recomendado por el paper: el autor aconseja r = 9 cm, L = 2 (variantes `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`) para uso general.
- El rendimiento en varias tareas es bajo o cercano al azar: bcic2020-3 (0,267), seed-v (0,283) y faced (0,312) en balanced accuracy, y seed-vig con R² negativo (-0,163), lo que indica que las representaciones congeladas no capturan bien esas tareas.
- Riesgo de sobreajuste a la distribución de REVE: el preentrenamiento usa solo el subconjunto con licencia abierta (323 grabaciones), lo que puede limitar la generalización a otros equipos, poblaciones o protocolos de adquisición.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios y posiciones de canal en metros. No estandarizar previamente los datos; el wrapper ya aplica el escalado. Un preprocesado incorrecto degrada las representaciones sin aviso.
- El repositorio solo contiene el codificador; no se puede reproducir la reconstrucción MAE ni el objetivo de preentrenamiento completo con estos pesos.
- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo de señales fisiológicas, puede heredar sesgos demográficos y de equipamiento de los corpus de REVE.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las predicciones downstream pueden ser erróneas con alta confianza; no debe usarse como dispositivo médico ni para diagnóstico sin validación clínica.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el código es MIT. Verificar la atribución requerida al paper y al autor en productos derivados.
- Para producción: el modelo no incluye cabeza de clasificación entrenada; hay que entrenar una sonda o ajustar fino, y validar en el dominio objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L1
- Paper: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Run de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/yncl6get
