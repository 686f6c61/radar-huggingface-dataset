# PierreGtch/eeg-fm-masking_mae_r6cm_L2

## Resumen

eeg-fm-masking_mae_r6cm_L2 es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE) y publicado por Pierre Guetschel (usuario PierreGtch) junto con el artículo *What masking geometry works best for EEG foundation models?* (arXiv:2609.33487). Forma parte de un conjunto de 58 encoders entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento: 5 radios espaciales por 6 longitudes temporales por 2 frameworks. Este modelo concreto corresponde a un radio espacial de 6 cm y una longitud temporal de 2 parches, con un 45 % de parches sin enmascarar.

El modelo resuelve el problema de obtener representaciones genéricas de señales EEG que puedan reutilizarse en tareas downstream (clasificación de patologías, sueño, decodificación cognitiva) sin reentrenar desde cero. Con 12,69 millones de parámetros en el codificador, es deliberadamente compacto, lo que facilita su evaluación congelada mediante sondas lineales y su despliegue en entornos con recursos limitados.

Es relevante ahora porque el artículo subyacente estudia sistemáticamente qué geometría de enmascaramiento funciona mejor en modelos fundacionales de EEG, un campo emergente donde las decisiones de preentrenamiento aún no están consolidadas. Este checkpoint concreto no es el recomendado por los autores (que sugieren r = 9 cm, L = 2), sino una de las variantes del barrido experimental, útil para reproducibilidad y análisis comparativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches y autoencoder enmascarado (MAE) |
| Parámetros totales | 12.692.096 (solo codificador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (parches de 1 s a 200 Hz; ventana dependiente de la tarea) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; procesa señales EEG) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (encoder en `model.safetensors`; checkpoints intermedios en `epoch_01/` … `epoch_09/`) |

## Arquitectura y entrenamiento

El modelo es un autoencoder enmascarado: el codificador recibe únicamente los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. El codificador se compone de un tokenizador de parches (`feature_encoder.*`) y un transformer (`model.*`). La señal se divide en parches de 1 s (200 muestras a 200 Hz, con solapamiento de 20 muestras) y el modelo es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada canal tenga una posición 3D en metros. El wrapper aplica escalado por ventana `median_std_clip` con recorte en σ = 15 y un factor de 1e+06, por lo que los datos deben entregarse en voltios sin estandarizar previamente.

El preentrenamiento utiliza el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El entrenamiento duró 10 épocas en 2 GPU H100, con tamaño de lote de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay de 0,01. El checkpoint publicado corresponde al final de la época 10; las épocas 1 a 9 están disponibles como subcarpetas. El decodificador MAE no se incluye en el repositorio: solo se distribuye el codificador, que es exactamente el conjunto de tensores evaluado en el artículo.

## Capacidades

- Extracción de características (feature extraction) de señales EEG en formato de ventanas contextuales.
- Representaciones agnósticas al montaje: funciona con cualquier número y disposición de electrodos, siempre que existan coordenadas 3D.
- Procesamiento de señales a 200 Hz con parches de 1 s y solapamiento de 20 muestras.
- Evaluación congelada mediante sondas lineales (ridge) sobre características aplanadas.
- Adaptación downstream mediante fine-tuning con OpenEEGBench.
- No es un modelo generativo de texto ni soporta tool calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión, audio ni capacidades multilingües en el sentido de modelos de lenguaje.

## Casos de uso

- Clasificación de patologías EEG con encoder congelado: extraer características contextuales y entrenar una regresión ridge o un clasificador ligero encima, tal como se hace en la evaluación del artículo con 12 datasets de OpenEEGBench.
- Detección de crisis epilépticas: el modelo obtiene 0,858 de balanced accuracy en chbmit y 0,802 en tuab con sonda congelada, lo que lo hace adecuado como extractor en pipelines de monitorización.
- Clasificación de estados de sueño: con 0,657 de balanced accuracy en isruc-sleep, puede integrarse en sistemas de estadificación que necesiten un extractor ligero y rápido.
- Investigación en interfaces cerebro-computador: sirve como base para decodificar tareas motoras o cognitivas (bcic2a, bcic2020-3) y comparar geometrías de enmascaramiento en experimentos controlados.
- Análisis de depresión a partir de EEG: el rendimiento de 0,849 en mdd_mumtaz2016 lo hace viable como extractor en estudios clínicos exploratorios.
- Reproducibilidad y ablación: al ser una de 58 variantes con receta idéntica, permite aislar el efecto de la geometría de enmascaramiento (r = 6 cm, L = 2) frente a otras configuraciones.
- Prototipado rápido en recursos limitados: con 12,69 M de parámetros, cabe en GPU de consumo y permite iterar sobre sondas downstream sin infraestructura pesada.

## Benchmarks y rendimiento

Resultados del artículo con encoder congelado y sonda ridge sobre características contextuales aplanadas (12 datasets × 5 semillas; balanced accuracy para clasificación, R² para seed-vig):

| Dataset | Métrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,710 ± 0,029 | 5 |
| bcic2020-3 | balanced acc. | 0,285 ± 0,006 | 5 |
| bcic2a | balanced acc. | 0,465 ± 0,016 | 5 |
| chbmit | balanced acc. | 0,858 ± 0,015 | 5 |
| faced | balanced acc. | 0,320 ± 0,006 | 5 |
| isruc-sleep | balanced acc. | 0,657 ± 0,001 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,849 ± 0,004 | 5 |
| physionet | balanced acc. | 0,576 ± 0,007 | 5 |
| seed-v | balanced acc. | 0,287 ± 0,003 | 5 |
| seed-vig | R² | -0,116 ± 0,004 | 5 |
| tuab | balanced acc. | 0,802 ± 0,012 | 5 |
| tuev | balanced acc. | 0,906 ± 0,026 | 5 |

No se han publicado en la información disponible comparaciones numéricas directas con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el codificador (12,69 M de parámetros, ~50 MB de pesos); el consumo real depende del tamaño de lote y de la longitud de la ventana.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento original usó 2 × H100, pero la inferencia no requiere hardware de datacenter.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch mediante el wrapper `ContextualEncoderBenchmarkWrapper`; integración con OpenEEGBench a través de `PretrainedBackbone`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r6cm_L2 | 12,69 M (encoder) | no disponible | Ver tabla de benchmarks | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_mae_r9cm_L2 | no disponible | no disponible | no disponible en esta ficha | CC-BY-4.0 | Hugging Face (recomendado por los autores) |
| eeg-fm-masking_jepa_r9cm_L2 | no disponible | no disponible | no disponible en esta ficha | CC-BY-4.0 | Hugging Face (recomendado por los autores) |

Los autores recomiendan las variantes con r = 9 cm y L = 2 (MAE y JEPA) como configuración óptima del barrido. No se dispone de datos numéricos de esas variantes en la información proporcionada para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Este checkpoint no es la configuración recomendada por los autores; para uso en producción se sugiere evaluar r = 9 cm, L = 2.
- Solo se distribuye el codificador; el decodificador MAE no está incluido, por lo que no puede usarse para reconstrucción directa sin reentrenar esa parte.
- Requiere señales a exactamente 200 Hz y en voltios; un preprocesado incorrecto (estandarización previa, otra frecuencia de muestreo) degrada las representaciones.
- Necesita coordenadas 3D de los canales en metros (MNE `info["chs"][i]["loc"][:3]`); canales sin posición no pueden procesarse.
- El rendimiento es muy desigual entre tareas: 0,906 en tuev frente a 0,285 en bcic2020-3 o 0,287 en seed-v, y R² negativo en seed-vig (-0,116), lo que indica que no captura bien esa tarea.
- Riesgo de sobreajuste a la distribución del corpus REVE (323 grabaciones); el comportamiento en montajes o poblaciones fuera de esa distribución no está caracterizado.
- No se documentan análisis de sesgos demográficos ni clínicos; en contextos médicos requiere validación externa antes de cualquier uso diagnóstico.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos de los datasets REVE subyacentes.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-step.

## Enlaces

- Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r6cm_L2
- Artículo: https://arxiv.org/abs/2609.33487
- Web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección de los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Run de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/mi2jxz5g
