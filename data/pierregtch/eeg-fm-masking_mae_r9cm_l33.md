# PierreGtch/eeg-fm-masking_mae_r9cm_L33

## Resumen

eeg-fm-masking_mae_r9cm_L33 es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE). Lo desarrolla Pierre Guetschel (usuario PierreGtch) como parte de un estudio sistemático sobre geometrías de enmascaramiento en modelos fundacionales de EEG. El modelo resuelve el problema de obtener representaciones genéricas de señales EEG sin etiquetas, de forma que puedan reutilizarse como extractor de características congelado en múltiples tareas downstream (clasificación de patologías, sueño, imaginación motora, etc.).

Este checkpoint concreto es una de las 58 variantes entrenadas con una receta idéntica en la que solo cambia la geometría de la máscara: 5 radios espaciales × 6 longitudes temporales × 2 marcos de entrenamiento. En este caso se emplea un radio espacial de 9 cm y una longitud temporal de 33 parches, con un 45 % de parches sin enmascarar. El codificador tiene 12,69 M de parámetros y es agnóstico al montaje: acepta cualquier número y disposición de canales siempre que cada uno tenga una posición 3D.

La relevancia del modelo es metodológica y práctica: permite aislar el efecto de la geometría de enmascaramiento sobre el rendimiento downstream, y el propio artículo recomienda la variante con L = 2 frente a esta (L = 33). Se publica bajo licencia CC-BY-4.0 con pesos redistribuibles, algo poco habitual en modelos fundacionales de EEG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (MAE, autoencoder enmascarado); solo se distribuye el codificador |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de entrada segmentada en parches de 1 s (200 muestras, solapamiento de 20 muestras); longitud de contexto total no disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | No disponible (modelo de señales EEG, no de texto) |
| Licencia | CC-BY-4.0 (pesos); código bajo MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de autoencoder enmascarado: un tokenizador convierte la señal EEG en parches de 1 s a 200 Hz (200 muestras con 20 de solapamiento), el codificador transformer procesa únicamente los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches ocultos. La máscara se define por dos parámetros: radio espacial de 9 cm (los electrodos vecinos se enmascaran conjuntamente) y longitud temporal de 33 parches, con `pct_unmasked = 0.45`. El repositorio contiene solo el codificador (tokenizador `feature_encoder.*` y transformer `model.*`), que es exactamente lo evaluado en el artículo; el decodificador no se distribuye.

El preentrenamiento utiliza el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. Se entrena durante 10 épocas en 2 × H100, con batch de 600 por GPU, learning rate 0.00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0.01. El checkpoint publicado corresponde al final de la época 10; también se incluyen las épocas 1 a 9 en subcarpetas `epoch_01/` a `epoch_09/`. La innovación principal no es arquitectónica sino experimental: 58 encoders con receta idéntica y solo la geometría de máscara variando, lo que permite atribuir diferencias de rendimiento a esa variable.

## Capacidades

- Extracción de características de señales EEG: genera representaciones contextuales a partir de ventanas multicanal.
- Agnóstico al montaje: funciona con cualquier número y conjunto de canales, siempre que cada canal tenga coordenadas 3D en metros (MNE `info["chs"][i]["loc"][:3]`).
- Preprocesado integrado: el wrapper aplica factor de escala 1e+06 (entrada en voltios) y escalado `median_std_clip` con recorte en σ = 15 por ventana; no requiere estandarización previa.
- Evaluación congelada: diseñado para usarse como backbone con sonda ridge sobre las características aplanadas.
- No soporta generación de texto, tool calling, agentes, visión ni audio; no es un modelo de lenguaje.
- Sin modo de razonamiento ni capacidades multilingües (no aplica).

## Casos de uso

- Clasificación de patologías EEG con etiquetas escasas: usar el codificador congelado y entrenar una regresión ridge o un clasificador lineal encima; en `tuev` alcanza 0,925 de balanced accuracy y en `chbmit` 0,849, lo que lo hace adecuado cuando no hay datos etiquetados suficientes para entrenar desde cero.
- Detección de anomalías en monitorización de epilepsia: con 0,849 en `chbmit` y 0,805 en `tuab`, sirve como extractor en pipelines de triaje de registros EEG hospitalarios.
- Investigación en imaginación motora: aunque el rendimiento es bajo en `bcic2a` (0,444) y `seed-v` (0,289), permite comparar geometrías de enmascaramiento y seleccionar la mejor variante del conjunto de 58 modelos para esta tarea.
- Estudios de sueño: con 0,698 en `isruc-sleep`, se puede integrar en herramientas de análisis automático de hipnogramas a partir de EEG.
- Evaluación comparativa de modelos fundacionales de EEG: el conjunto de 58 checkpoints con receta fija permite experimentos controlados de ablación sin reentrenar.
- Investigación clínica en depresión: con 0,864 en `mdd_mumtaz2016`, sirve como base para extracción de biomarcadores en estudios con pocos sujetos.
- Prototipado académico con presupuesto limitado: 12,69 M de parámetros y 0,5 GB de repositorio permiten inferencia en una sola GPU consumer.

## Benchmarks y rendimiento

Resultados downstream en OpenEEGBench con codificador congelado y sonda ridge (12 conjuntos de datos × 5 semillas; balanced accuracy para clasificación, R² para `seed-vig`):

| Dataset | Metrica | Resultado (media ± sd) |
|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,720 ± 0,015 |
| bcic2020-3 | balanced acc. | 0,275 ± 0,010 |
| bcic2a | balanced acc. | 0,444 ± 0,003 |
| chbmit | balanced acc. | 0,849 ± 0,028 |
| faced | balanced acc. | 0,314 ± 0,004 |
| isruc-sleep | balanced acc. | 0,698 ± 0,003 |
| mdd_mumtaz2016 | balanced acc. | 0,864 ± 0,007 |
| physionet | balanced acc. | 0,568 ± 0,007 |
| seed-v | balanced acc. | 0,289 ± 0,001 |
| seed-vig | R² | −0,129 ± 0,002 |
| tuab | balanced acc. | 0,805 ± 0,014 |
| tuev | balanced acc. | 0,925 ± 0,026 |

No se han publicado en la información disponible resultados comparativos directos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 12,69 M de parámetros; el cuello de botella es la longitud de la ventana de entrada y el batch, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento original usó 2 × H100 con batch de 600 por GPU.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch nativo con el wrapper `ContextualEncoderBenchmarkWrapper` del paquete `eeg-fm-masking`; integración con OpenEEGBench vía `PretrainedBackbone`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r9cm_L33 | 12,69 M | Parches de 1 s a 200 Hz, agnóstico al montaje | Ver tabla de benchmarks | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_mae_r9cm_L2 | No disponible en la información | Igual, con L = 2 | Recomendado por el artículo frente a L = 33 | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_jepa_r9cm_L2 | No disponible en la información | Igual, marco JEPA | Recomendado por el artículo | CC-BY-4.0 | Hugging Face |

No se dispone de datos de otros modelos fundacionales de EEG comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio artículo recomienda la variante L = 2; este checkpoint (L = 33) no es la configuración óptima según los autores.
- Rendimiento bajo o negativo en varias tareas: `seed-vig` con R² de −0,129 indica que las características no explican la varianza objetivo; `bcic2020-3` (0,275) y `seed-v` (0,289) están cerca del azar.
- Requiere entrada estrictamente a 200 Hz y en voltios; no debe estandarizarse previamente porque el wrapper aplica su propio escalado.
- Exige coordenadas 3D de canal en metros; sin posiciones válidas el modelo no puede construir la máscara espacial.
- Solo se distribuye el codificador; no es posible reentrenar el MAE completo con estos pesos.
- Sesgos conocidos: no documentados en la información disponible; el corpus de preentrenamiento es un subconjunto de REVE (323 grabaciones), lo que puede limitar la generalización a poblaciones y equipos no representados.
- Riesgo de alucinación: no aplica en el sentido de texto, pero las representaciones pueden producir predicciones sobreconfiadas en tareas fuera de distribución.
- Licencia CC-BY-4.0 permite uso comercial con atribución; el código va bajo MIT.
- Los checkpoints intermedios (épocas 1 a 9) usan el mismo `config.json` y nombres de clave; cargarlos requiere `strict=False` para omitir el buffer de posiciones y la cabeza de clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L33
- Artículo: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE L = 2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA L = 2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/kqa3qhu7
