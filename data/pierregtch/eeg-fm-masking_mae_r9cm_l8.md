# PierreGtch/eeg-fm-masking_mae_r9cm_L8

## Resumen

`eeg-fm-masking_mae_r9cm_L8` es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE) por Pierre Guetschel (usuario `PierreGtch`). Forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento: 5 radios espaciales por 6 longitudes temporales por 2 marcos de aprendizaje autosupervisado. Este modelo concreto emplea un radio espacial de 9 cm y una longitud temporal de 8 parches, con un 45 % de parches sin enmascarar.

El modelo resuelve el problema de obtener representaciones genéricas de señales EEG sin necesidad de etiquetas, de modo que puedan reutilizarse como extractor de características congelado en múltiples tareas downstream (clasificación de patologías, decodificación de imaginación motora, estimación de edad, etc.). Tiene 12,69 millones de parámetros en el codificador y trabaja sobre ventanas de 1 segundo a 200 Hz, sin restricción de montaje: acepta cualquier número y disposición de canales siempre que cada uno tenga una posición 3D en metros.

Es relevante porque el estudio sistemático del que procede permite aislar el efecto de la geometría de enmascaramiento sobre el rendimiento downstream, y porque los pesos se distribuyen con licencia CC-BY-4.0 sobre un subconjunto de datos con licencia abierta. No obstante, el propio autor recomienda la variante con L = 2 (`eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`) como configuración óptima según los resultados del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches y autoencoder enmascarado (MAE); el repo contiene solo el codificador |
| Parametros totales | 12.692.096 (codificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de entrada de 1 s por parche (200 muestras a 200 Hz, solapamiento de 20 muestras); longitud de contexto total no disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors de precisión nativa) |
| Idiomas soportados | No aplica (modelo de señales EEG, no lingüístico) |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors (`model.safetensors` en raíz y en `epoch_01/` … `epoch_09/`) |

## Arquitectura y entrenamiento

El modelo es un autoencoder enmascarado (MAE) adaptado a EEG. El codificador recibe únicamente los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. La tokenización divide la señal en parches de 1 segundo (200 muestras a 200 Hz con 20 muestras de solapamiento) y el modelo es agnóstico al montaje: cualquier conjunto de canales con posición 3D en metros es válido. La geometría de enmascaramiento de esta variante es radio espacial r = 9 cm y longitud temporal L = 8 parches, con `pct_unmasked` = 0,45.

El preentrenamiento usa el subconjunto con licencia abierta del corpus REVE (323 grabaciones), seleccionado para permitir la redistribución de los pesos. El esquema es de 10 épocas en 2 GPU H100, tamaño de lote 600 por GPU, tasa de aprendizaje 0,00024 con calentamiento de 3080 pasos y decaimiento final hasta 1e-06, y weight decay 0,01. El checkpoint publicado corresponde al final de la época 10; las épocas 1 a 9 están incluidas como subcarpetas. El repo no incluye el decodificador MAE, solo los tensores del codificador evaluados en el artículo.

## Capacidades

- Extracción de características de señales EEG en modo congelado (pipeline `feature-extraction`).
- Representaciones contextuales por ventana, aptas para sondas lineales (ridge) downstream.
- Independencia de montaje: funciona con cualquier número y disposición de electrodos si se aporta su posición 3D.
- Escalado interno de la señal: multiplica por 1e+06 y aplica `median_std_clip` con recorte en σ = 15 por ventana, por lo que no debe estandarizarse la entrada previamente.
- Soporte de ajuste fino mediante `OpenEEGBench` (`PretrainedBackbone`).
- Acceso a checkpoints intermedios (épocas 1 a 9) para estudiar la dinámica de entrenamiento.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un codificador de señales biomédicas.

## Casos de uso

- **Detección de crisis epilépticas:** usar el codificador congelado y una sonda ridge sobre las características contextuales para clasificar segmentos de `chbmit`; el modelo obtiene 0,882 ± 0,018 de balanced accuracy en este conjunto, lo que lo hace adecuado como línea base rápida sin reentrenamiento profundo.
- **Clasificación de estados de sueño:** extraer características de ventanas de 1 s y entrenar un clasificador ligero para `isruc-sleep` (0,668 ± 0,003 de balanced accuracy), útil en pipelines de polisomnografía que necesitan un extractor genérico.
- **Detección de anomalías en `tuev`:** con 0,920 ± 0,032 de balanced accuracy, sirve como extractor para tareas de identificación de eventos EEG en entornos de investigación clínica.
- **Detección de depresión a partir de EEG:** el modelo alcanza 0,829 ± 0,020 en `mdd_mumtaz2016`, por lo que puede integrarse en estudios de biomarcadores psiquiátricos con sondas ligeras.
- **Investigación sobre geometría de enmascaramiento:** al ser una de 58 variantes con receta idéntica, permite comparar el efecto de r = 9 cm y L = 8 frente a otras combinaciones manteniendo el resto de variables fijas, usando los checkpoints de épocas 1 a 9 para analizar la evolución.
- **Prototipado con datos propios y montajes arbitrarios:** gracias a su independencia de montaje, se puede aplicar a grabaciones con electrodos no vistos durante el preentrenamiento, siempre que se proporcione la posición 3D y se remuestree a 200 Hz.
- **Ajuste fino con OpenEEGBench:** el wrapper `ContextualEncoderBenchmarkWrapper` y la clase `PretrainedBackbone` permiten evaluar y ajustar el modelo en los 12 conjuntos del benchmark con un flujo reproducible.

## Benchmarks y rendimiento

Resultados publicados en la model card: codificador congelado, sonda ridge sobre características contextuales aplanadas, 12 conjuntos de datos y 5 semillas. Balanced accuracy para clasificación y R² para `seed-vig`.

| Conjunto de datos | Métrica | Puntuación (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,701 ± 0,011 | 5 |
| bcic2020-3 | balanced acc. | 0,273 ± 0,012 | 5 |
| bcic2a | balanced acc. | 0,456 ± 0,007 | 5 |
| chbmit | balanced acc. | 0,882 ± 0,018 | 5 |
| faced | balanced acc. | 0,317 ± 0,007 | 5 |
| isruc-sleep | balanced acc. | 0,668 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,829 ± 0,020 | 5 |
| physionet | balanced acc. | 0,558 ± 0,005 | 5 |
| seed-v | balanced acc. | 0,284 ± 0,001 | 5 |
| seed-vig | R² | −0,180 ± 0,007 | 5 |
| tuab | balanced acc. | 0,804 ± 0,003 | 5 |
| tuev | balanced acc. | 0,920 ± 0,032 | 5 |

No se han publicado en la información disponible comparaciones numéricas directas con otras variantes de la familia ni con modelos EEG de terceros.

## Requisitos de hardware

- **VRAM estimada:** el codificador tiene 12,69 M de parámetros; en fp32 ocupa aproximadamente 51 MB de pesos, en fp16 unos 25 MB. La memoria dominante será la de las activaciones, que depende del número de canales y de la longitud de la ventana.
- **GPU recomendadas:** cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en lotes pequeños; para ajuste fino se recomienda A100 o H100, coherente con el entrenamiento original en 2 × H100.
- **GPU de consumo:** cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares, incluso con lotes moderados.
- **Despliegue:** el flujo oficial usa PyTorch con `safetensors` y el paquete `eeg-fm-masking`; también es compatible con `OpenEEGBench`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eeg-fm-masking_mae_r9cm_L8` (este) | 12,69 M | Parches de 1 s a 200 Hz, montaje libre | MAE | CC-BY-4.0 | Hugging Face |
| `eeg-fm-masking_mae_r9cm_L2` | No disponible en la información | Parches de 1 s a 200 Hz, montaje libre | MAE | CC-BY-4.0 | Hugging Face |
| `eeg-fm-masking_jepa_r9cm_L2` | No disponible en la información | Parches de 1 s a 200 Hz, montaje libre | JEPA | CC-BY-4.0 | Hugging Face |

Las dos alternativas pertenecen a la misma familia de 58 codificadores y son las recomendadas por el autor en el artículo. No se dispone de datos de benchmarks de estas variantes en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- **Rendimiento desigual por tarea:** los resultados en `seed-v` (0,284), `bcic2020-3` (0,273) y `faced` (0,317) están cerca o por debajo del azar en clasificación equilibrada, y `seed-vig` presenta R² negativo (−0,180), lo que indica que las características congeladas no capturan bien la edad en ese conjunto.
- **Configuración no óptima:** el autor recomienda r = 9 cm y L = 2; esta variante con L = 8 no es la configuración de referencia del artículo.
- **Solo codificador:** el repo no incluye el decodificador MAE, por lo que no se puede usar para reconstrucción de señal sin reentrenar o implementar el decodificador.
- **Requisitos de entrada estrictos:** muestreo a 200 Hz, unidades en voltios, posiciones de canal en metros y ninguna estandarización previa; incumplirlos degrada las representaciones.
- **Riesgo de alucinación:** no aplica en el sentido lingüístico, pero el modelo puede producir representaciones poco informativas en tareas o montajes alejados de la distribución de preentrenamiento.
- **Datos de preentrenamiento limitados:** solo 323 grabaciones del subconjunto abierto de REVE, lo que puede limitar la generalización frente a modelos entrenados con corpus mayores.
- **Licencia:** CC-BY-4.0 permite uso comercial con atribución; el código es MIT. Es necesario citar el artículo de Guetschel (2026).
- **Sesgos:** no se documentan análisis de sesgo demográfico, clínico ni de centro de adquisición en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L8
- Artículo: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada (MAE, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada (JEPA, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/z8paagta
