# PierreGtch/eeg-fm-masking_mae_r9cm_L8

## Resumen

eeg-fm-masking_mae_r9cm_L8 es un codificador (encoder) de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (masked autoencoder, MAE). Lo publica PierreGtch como parte de un estudio controlado titulado *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo forma parte de una familia de 58 encoders entrenados con una receta idéntica en la que solo cambia la geometría de enmascaramiento: 5 radios espaciales por 6 longitudes temporales por 2 marcos de entrenamiento (MAE y JEPA). Este checkpoint concreto corresponde a un radio espacial `r = 9 cm` y una longitud temporal `L = 8` parches, con un `pct_unmasked` de 0,45.

El problema que aborda es la falta de representaciones generales y reutilizables para señales EEG. En lugar de entrenar un modelo específico por tarea y conjunto de datos, este encoder produce características contextuales que se pueden congelar y evaluar con una sonda lineal (ridge) sobre doce conjuntos de datos de OpenEEGBench, o bien afinar para tareas concretas. El encoder tiene 12,69 millones de parámetros, es agnóstico al montaje (acepta cualquier número y disposición de canales siempre que tengan posición 3D) y procesa la señal a 200 Hz cortada en parches de 1 segundo con 20 muestras de solapamiento.

La relevancia actual radica en que forma parte de una comparativa sistemática y reproducible sobre qué geometría de enmascaramiento funciona mejor en modelos fundacionales de EEG, un área donde hasta ahora abundaban las decisiones ad hoc. El propio autor recomienda, según el paper, la configuración `r = 9 cm, L = 2` (modelos `mae_r9cm_L2` y `jepa_r9cm_L2`), por lo que este checkpoint de `L = 8` es una variante más dentro del barrido experimental y no la configuración óptima señalada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (patch tokeniser `feature_encoder.*` + transformer `model.*`); marco de autoencoder enmascarado (MAE) |
| Parametros totales | 12.692.096 (~12,69 M), solo el encoder |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como valor fijo; procesa la señal en parches de 1 s (200 muestras, solapamiento de 20 muestras) y la ventana `n_times` es configurable en el wrapper |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye `model.safetensors` |
| Idiomas soportados | no aplica (señales EEG); no disponible en la model card |
| Licencia | CC-BY-4.0 para los pesos; el codigo es MIT |
| Formato de pesos | safetensors (encoder unicamente; no incluye el decodificador MAE) |

## Arquitectura y entrenamiento

El modelo es un masked autoencoder aplicado a EEG. El encoder recibe los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. La distribución de pesos publicada contiene únicamente el encoder (tokenizador de parches más transformer), que son exactamente los tensores cargados en la evaluación downstream del paper. La geometría de enmascaramiento de este checkpoint usa radio espacial `r = 9 cm`, longitud temporal `L = 8` parches y `pct_unmasked = 0.45`. El modelo es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada uno tenga una posición 3D en metros (formato MNE `info["chs"][i]["loc"][:3]`).

El preentrenamiento usa el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El régimen es de 10 épocas sobre 2 GPUs H100, con batch size de 600 por GPU, tasa de aprendizaje 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0,01. El checkpoint publicado corresponde a la época 10 de 10 (etiquetado internamente como `v9`, el evaluado en el paper). El wrapper de inferencia aplica por sí mismo el escalado de entrada: multiplica por un factor de 1e+06 y aplica un recorte de mediana-desviación estándar por ventana con σ = 15 (`median_std_clip`), por lo que los datos no deben estandarizarse previamente.

## Capacidades

- Extracción de características (feature extraction) de señales EEG: es la tarea principal para la que se distribuye el pipeline.
- Aprendizaje autosupervisado (self-supervised learning): representaciones entrenadas sin etiquetas mediante reconstrucción de parches enmascarados.
- Aprendizaje por transferencia: el encoder congelado se puede usar con una sonda ridge, o afinarse, sobre tareas downstream de OpenEEGBench.
- Procesamiento agnóstico al montaje: funciona con cualquier número y disposición de canales EEG siempre que tengan coordenadas 3D.
- Manejo de múltiples tareas fisiológicas y clínicas: clasificación de estados (aritmética mental, imaginación motora, atención visual, sueño, depresión) y regresión de la edad en `seed-vig`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes (no aplica a un modelo de señales).
- No se documentan capacidades multilingües, de visión, audio ni modo "thinking" (no aplica a un encoder de EEG).

## Casos de uso

- Descifrado de imaginación motora en interfaces cerebro-computador (BCI): el encoder extrae características de EEG que una sonda lineal puede clasificar para tareas como `bcic2a` o `bcic2020-3`, sirviendo como base para sistemas de control.
- Detección de crisis epilépticas: sobre el conjunto `chbmit` el encoder congelado más ridge alcanza 0,882 de accuracy balanceada, lo que lo hace adecuado como extractor de características en pipelines de monitorización clínica.
- Clasificación de estados de sueño: con `isruc-sleep` obtiene 0,668 de accuracy balanceada, útil para sistemas de análisis automático de polisomnografías.
- Apoyo al diagnóstico de depresión: en `mdd_mumtaz2016` alcanza 0,829 de accuracy balanceada, lo que permite utilizarlo como extractor en herramientas de cribado asistido.
- Detección de anomalías y artefactos en EEG (`tuab`, 0,804): puede integrarse en pipelines de control de calidad de registros clínicos antes del análisis manual.
- Clasificación de eventos y subtipos (`tuev`, 0,920): adecuado para tareas de etiquetado automático sobre registros largos de EEG.
- Investigación reproducible sobre modelos fundacionales de EEG: al formar parte de un barrido controlado de 58 encoders, permite estudiar de forma aislada el efecto de la geometría de enmascaramiento sobre el rendimiento downstream.
- Punto de partida para fine-tuning propio: por su tamaño reducido (12,69 M parámetros) y su licencia CC-BY-4.0, es apto para adaptarse a conjuntos de datos privados con recursos modestos.

## Benchmarks y rendimiento

Resultados downstream con encoder congelado y sonda ridge sobre características contextuales aplanadas, 12 conjuntos de datos por 5 semillas (accuracy balanceada para clasificación, R² para `seed-vig`):

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | accuracy balanceada | 0,701 ± 0,011 | 5 |
| bcic2020-3 | accuracy balanceada | 0,273 ± 0,012 | 5 |
| bcic2a | accuracy balanceada | 0,456 ± 0,007 | 5 |
| chbmit | accuracy balanceada | 0,882 ± 0,018 | 5 |
| faced | accuracy balanceada | 0,317 ± 0,007 | 5 |
| isruc-sleep | accuracy balanceada | 0,668 ± 0,003 | 5 |
| mdd_mumtaz2016 | accuracy balanceada | 0,829 ± 0,020 | 5 |
| physionet | accuracy balanceada | 0,558 ± 0,005 | 5 |
| seed-v | accuracy balanceada | 0,284 ± 0,001 | 5 |
| seed-vig | R² | -0,180 ± 0,007 | 5 |
| tuab | accuracy balanceada | 0,804 ± 0,003 | 5 |
| tuev | accuracy balanceada | 0,920 ± 0,032 | 5 |

No se han publicado en la información disponible resultados de benchmarks comparativos externos (MMLU, HumanEval, GSM8K y similares no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 12,69 M parámetros, los pesos en FP32 ocupan aproximadamente 51 MB y en FP16 unos 25 MB, más las activaciones de la ventana procesada.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; el preentrenamiento documentado usó 2 GPUs H100 con batch size de 600 por GPU.
- Cabe holgadamente en GPUs de consumo (RTX 3060, RTX 4090 y similares), e incluso en CPU para lotes pequeños.
- Opciones de despliegue: el código propio (`eeg_fm_masking`) mediante `ContextualEncoderBenchmarkWrapper`, y el pipeline de evaluación `open_eeg_bench.backbone.PretrainedBackbone`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible solo permite comparar con los propios modelos hermanos del mismo estudio, ya que todos comparten arquitectura y receta de entrenamiento y difieren únicamente en la geometría de enmascaramiento:

| Modelo | Marco | r (cm) | L (parches) | Parametros encoder | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_r9cm_L8 | MAE | 9 | 8 | 12,69 M | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 | 2 | 12,69 M (misma arquitectura) | CC-BY-4.0 | HuggingFace (recomendado en el paper) |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 | 2 | 12,69 M (misma arquitectura) | CC-BY-4.0 | HuggingFace (recomendado en el paper) |

La colección completa incluye 58 encoders entrenados con receta idéntica. No se proporcionan en la información disponible resultados numéricos de modelos fundacionales de EEG de terceros (por ejemplo, otras familias de la literatura) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual de modelos generativos de lenguaje; el modelo es un extractor de características, aunque la reconstrucción MAE puede producir señales reconstruidas poco fiables en parches muy enmascarados.
- Limitación de entrada estricta: la señal debe muestrearse a 200 Hz, expresarse en voltios y cortarse en parches de 1 s con solapamiento de 20 muestras; cada canal debe tener una posición 3D en metros. El modelo no debe recibir datos preestandarizados.
- El repositorio solo contiene el encoder: no incluye el decodificador MAE, por lo que no permite reconstrucción directa sin código adicional.
- Rendimiento desigual por tarea: aunque destaca en `tuev` (0,920) o `chbmit` (0,882), obtiene resultados bajos en `bcic2020-3` (0,273), `seed-v` (0,284) o `faced` (0,317), y R² negativo en `seed-vig` (-0,180), señal de que no supera a un predictor trivial en esa tarea de regresión.
- Este checkpoint (`L = 8`) no es la configuración recomendada por el paper; para uso general se sugiere `r = 9 cm, L = 2`.
- Licencia: los pesos están bajo CC-BY-4.0, lo que permite uso comercial con atribución; el código es MIT. Es imprescindible citar el paper según lo indicado en la página de GitHub.
- Cualquier uso clínico debe tratarse como herramienta de apoyo y no como sustituto del diagnóstico profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L8
- Colección completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Web del paper: https://pierregtch.github.io/eeg-fm-masking
- Código en GitHub: https://github.com/PierreGtch/eeg-fm-masking
- Modelo recomendado `mae_r9cm_L2`: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado `jepa_r9cm_L2`: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/z8paagta
