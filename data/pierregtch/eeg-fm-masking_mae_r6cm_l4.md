# PierreGtch/eeg-fm-masking_mae_r6cm_L4

## Resumen
eeg-fm-masking_mae_r6cm_L4 es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE) por Pierre Guetschel (PierreGtch). Forma parte de un conjunto de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 marcos de entrenamiento), lo que permite aislar el efecto de dicha geometría en el rendimiento downstream. El modelo se publica junto al artículo "What masking geometry works best for EEG foundation models?" (arXiv:2609.33487) y se evalúa con el benchmark OpenEEGBench.

El modelo es un transformer de 12,69 millones de parámetros que procesa señales EEG a 200 Hz, cortadas en parches de 1 segundo, y es agnóstico a la montura: acepta cualquier número y conjunto de canales siempre que cada uno tenga una posición 3D en metros. Esta variante concreta usa un radio espacial de máscara de 6 cm y una longitud temporal de 4 parches, con un 45 % de parches sin enmascarar (pct_unmasked = 0.45).

Es relevante porque ofrece pesos redistribuibles (CC-BY-4.0) entrenados sobre el subconjunto de licencia abierta del corpus REVE, y porque su evaluación con codificador congelado y sonda ridge sobre 12 datasets proporciona una referencia reproducible para decidir qué geometría de enmascaramiento conviene en modelos fundacionales de EEG. El artículo recomienda r = 9 cm y L = 2, por lo que esta variante no es la configuración óptima según los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (codificador de un autoencoder enmascarado, MAE) con tokenizador de parches |
| Parametros totales | 12.692.096 (codificador; el decodificador MAE no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (parches de 1 s a 200 Hz, 200 muestras, con solapamiento de 20 muestras; el wrapper recibe n_times) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de señales EEG, no de texto) |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors (model.safetensors, más epoch_01/ … epoch_09/) |

## Arquitectura y entrenamiento
El modelo sigue el marco MAE: el codificador recibe únicamente los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. La entrada se tokeniza en parches de 1 segundo (200 muestras a 200 Hz, con solapamiento de 20 muestras) y el wrapper aplica internamente un factor de escala de 1e+06 (los datos deben ir en voltios) y un escalado por ventana median_std_clip con recorte en σ = 15; no debe estandarizarse la señal antes. El modelo es agnóstico a la montura porque incorpora las posiciones 3D de los canales en metros (MNE info["chs"][i]["loc"][:3]).

El preentrenamiento usó el subconjunto de licencia abierta del corpus REVE (323 grabaciones) para permitir la redistribución de los pesos, durante 10 épocas en 2 × H100, con batch size de 600 por GPU, learning rate 0.00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0.01. El checkpoint publicado corresponde al final de la época 10 (el evaluado en el artículo), y se incluyen las épocas 1 a 9 en subcarpetas. En esta variante, la geometría de máscara es r = 6 cm y L = 4 parches con pct_unmasked = 0.45.

## Capacidades
- Extracción de características (feature extraction) de señales EEG: es la tarea declarada del pipeline.
- Codificación contextual de parches temporales con información espacial de canales mediante posiciones 3D.
- Adaptabilidad a cualquier montura de electrodos, número de canales y conjunto de posiciones, sin reentrenamiento del tokenizador.
- Evaluación y fine-tuning mediante OpenEEGBench con codificador congelado y sonda ridge (clasificación y regresión).
- Uso como backbone para clasificación de tareas EEG (aritmética, imaginación motora, detección de convulsiones, sueño, emociones, etc.).
- No soporta tool calling, agentes, generación de texto, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking ni decodificación especulativa documentada.

## Casos de uso
- Detección de crisis epilépticas: con el codificador congelado y una sonda ridge se obtiene una balanced accuracy de 0,889 ± 0,012 en chbmit, lo que lo hace adecuado como extractor de características en pipelines de monitorización de EEG hospitalaria.
- Clasificación de estados de sueño: alcanza 0,659 ± 0,011 en isruc-sleep, útil para sistemas de estadificación automática que necesitan un backbone ligero (12,69 M de parámetros) y redistribuible.
- Detección de anomalías en EEG clínico: 0,804 ± 0,005 en tuab permite integrarlo en herramientas de cribado de EEG anormal con ajuste de una sonda lineal sobre características congeladas.
- Clasificación de eventos en EEG intracraneal: 0,921 ± 0,030 en tuev lo sitúa como candidato para experimentos de decodificación de eventos con monturas no estándar, gracias a su naturaleza agnóstica a la montura.
- Investigación en interfaces cerebro-computador: con 0,457 ± 0,014 en bcic2a y 0,272 ± 0,019 en bcic2020-3 sirve como línea base reproducible para comparar geometrías de enmascaramiento en imaginación motora.
- Análisis de carga cognitiva y aritmética mental: 0,774 ± 0,012 en arithmetic_zyma2019 permite construir clasificadores de esfuerzo cognitivo con un codificador congelado y bajo coste computacional.
- Estudio de depresión a partir de EEG: 0,808 ± 0,016 en mdd_mumtaz2016 lo hace útil como extractor en estudios de biomarcadores de trastorno depresivo mayor.
- Reproducción y ablación metodológica: al compartir receta con otros 57 codificadores, permite aislar el efecto de la geometría de máscara en experimentos controlados.

## Benchmarks y rendimiento
Resultados downstream en OpenEEGBench con codificador congelado y sonda ridge sobre características contextuales aplanadas, 12 datasets × 5 semillas. Balanced accuracy para clasificación y R² para seed-vig.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,774 ± 0,012 | 5 |
| bcic2020-3 | balanced acc. | 0,272 ± 0,019 | 5 |
| bcic2a | balanced acc. | 0,457 ± 0,014 | 5 |
| chbmit | balanced acc. | 0,889 ± 0,012 | 5 |
| faced | balanced acc. | 0,320 ± 0,004 | 5 |
| isruc-sleep | balanced acc. | 0,659 ± 0,011 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,808 ± 0,016 | 5 |
| physionet | balanced acc. | 0,579 ± 0,005 | 5 |
| seed-v | balanced acc. | 0,285 ± 0,001 | 5 |
| seed-vig | R² | -0,172 ± 0,010 | 5 |
| tuab | balanced acc. | 0,804 ± 0,005 | 5 |
| tuev | balanced acc. | 0,921 ± 0,030 | 5 |

El artículo recomienda la configuración r = 9 cm y L = 2 (variantes mae_r9cm_L2 y jepa_r9cm_L2); no se han publicado en la información disponible los resultados comparativos completos de las 58 variantes.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB con los 12,69 M de parámetros en precisión original (el repo completo ocupa 0,5 GB, incluidos los checkpoints intermedios); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100; el entrenamiento original usó 2 × H100 con batch de 600 por GPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales, dado el reducido tamaño del codificador.
- Opciones de despliegue: PyTorch con el paquete eeg-fm-masking (wrapper ContextualEncoderBenchmarkWrapper) y OpenEEGBench como backbone; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r6cm_L4 (este) | 12,69 M | no disponible (parches de 1 s) | MAE | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_mae_r9cm_L2 | no disponible en la información | no disponible (parches de 1 s) | MAE | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_jepa_r9cm_L2 | no disponible en la información | no disponible (parches de 1 s) | JEPA | CC-BY-4.0 | Hugging Face |

Las tres variantes comparten receta de entrenamiento y corpus (subconjunto abierto de REVE); solo cambian la geometría de máscara y, en el caso JEPA, el marco de aprendizaje autosupervisado. El artículo recomienda r = 9 cm y L = 2, por lo que las variantes r9cm_L2 son las preferidas por los autores. No se dispone de datos de benchmarks de las variantes comparadas en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo de propósito general: solo produce características EEG; no genera texto, código ni respuestas conversacionales.
- Requiere que la señal esté en voltios, a 200 Hz y con posiciones 3D de canal en metros; un preprocesado incorrecto (por ejemplo, estandarizar antes) degrada los resultados.
- El rendimiento es muy desigual entre datasets: 0,921 en tuev frente a 0,272 en bcic2020-3 o 0,285 en seed-v, y R² negativo (-0,172) en seed-vig, lo que indica que la sonda ridge no captura bien esa tarea de regresión.
- Esta variante (r = 6 cm, L = 4) no es la configuración recomendada por los autores; para nuevos proyectos conviene evaluar r = 9 cm y L = 2.
- Riesgo de sobreajuste a la distribución del corpus REVE (323 grabaciones de licencia abierta); no se documentan sesgos demográficos ni de adquisición específicos.
- Licencia CC-BY-4.0 para los pesos: permite uso comercial con atribución; el código es MIT. Es necesario citar el artículo de Guetschel (2026) al reutilizar los pesos.
- No se documentan cuantizaciones ni optimizaciones de despliegue; el decodificador MAE no se incluye, por lo que no es posible la reconstrucción de señal directamente desde el repo.
- El checkpoint publicado corresponde a la época 10; las épocas 1 a 9 se ofrecen para experimentos de evolución del entrenamiento, no como modelos finales.

## Enlaces
- Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r6cm_L4
- Artículo: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/d2k3me28
