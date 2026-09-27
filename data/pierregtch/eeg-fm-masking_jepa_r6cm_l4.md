# PierreGtch/eeg-fm-masking_jepa_r6cm_L4

## Resumen

eeg-fm-masking_jepa_r6cm_L4 es un encoder de electroencefalografía (EEG) preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Se trata de uno de los 58 encoders entrenados con una receta idéntica en la que solo cambia la geometría de enmascarado (5 radios espaciales × 6 longitudes temporales × 2 marcos de trabajo). Este modelo concreto usa el marco JEPA (joint-embedding predictive architecture) con radio espacial de 6 cm y longitud temporal de 4 parches.

El modelo resuelve el problema de obtener representaciones transferibles de señales EEG sin etiquetas, de forma que un clasificador lineal o una sonda ridge pueda resolver tareas downstream (patología, sueño, interfaces cerebro-computador) sobre características congeladas. Su encoder tiene 12.692.096 parámetros (unos 12,69 M), lo que lo sitúa en el rango de modelos ligeros que caben holgadamente en hardware de consumo e incluso en CPU para inferencia.

Es relevante ahora porque forma parte de una evaluación controlada y reproducible sobre OpenEEGBench, con 12 conjuntos de datos y 5 semillas, y porque el paper recomienda explícitamente otras dos variantes de la misma familia (r = 9 cm, L = 2) por encima de esta configuración. El repositorio contiene únicamente el encoder, no el predictor JEPA ni el profesor EMA, y los pesos se distribuyen bajo CC-BY-4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (joint-embedding predictive architecture) con encoder transformer y tokenizador de parches; el repo publica solo el encoder (tokenizador `feature_encoder.*` + transformer `model.*`) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens; la entrada se corta en parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras, y el wrapper acepta `n_times` configurable |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no aplica (modelo sobre señales EEG, no texto) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el código |
| Formato de pesos | safetensors (`model.safetensors`) más `config.json` y `metadata.json` |
| Dominio | EEG, extracción de características (pipeline `feature-extraction`) |
| Frecuencia de muestreo de entrada | 200 Hz (obligatorio) |
| Unidades de entrada | voltios; el wrapper aplica factor 1e+06 y escalado `median_std_clip` con recorte en σ = 15 |
| Canales | agnóstico al montaje: cualquier número y conjunto de canales, siempre que cada canal tenga posición 3D en metros |
| Radio espacial de enmascarado (r) | 6 cm |
| Longitud temporal de enmascarado (L) | 4 parches |
| `pct_unmasked` | 0,45 |
| Checkpoint | época 10 de 10 (v9, el evaluado en el paper) |
| Run de entrenamiento | `fyxl8ibt` |

## Arquitectura y entrenamiento

La arquitectura es un JEPA aplicado a EEG: un encoder procesa los parches visibles (contexto) y un predictor se entrena para mapear esas representaciones a los embeddings que un profesor EMA genera para los parches enmascarados. A diferencia de otros enfoques autosupervisados, esta variante no emplea regularizadores de varianza ni covarianza. El modelo es agnóstico al montaje, ya que incorpora la posición tridimensional de cada canal (en metros, vía `info["chs"][i]["loc"][:3]`), lo que permite aplicar el mismo encoder a configuraciones de electrodos heterogéneas.

El preentrenamiento usó el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos puedan redistribuirse. La programación fue de 10 épocas sobre 2 × H100, con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos y valor final de 1e-06) y weight decay de 0,01. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones, algo esperable en un modelo de representación y no generativo. Es importante señalar que los pesos publicados son los del encoder estudiante y que ni el predictor JEPA ni el profesor EMA se incluyen en el repositorio.

## Capacidades

- Extracción de características de señales EEG: genera embeddings contextuales a partir de ventanas de 1 s a 200 Hz.
- Clasificación y regresión downstream con encoder congelado: los resultados publicados usan una sonda ridge sobre las características aplanadas, sin fine-tuning.
- Adaptación a montajes arbitrarios de electrodos gracias a la incorporación de coordenadas 3D de canal.
- Procesamiento de grabaciones multicanal con ventanas solapadas (20 muestras de solapamiento entre parches).
- Evaluación estandarizada en OpenEEGBench mediante `PretrainedBackbone`, con soporte para 12 conjuntos de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: es un encoder de señales biomédicas.
- No tiene capacidades multilingües (no procesa texto).
- No incluye modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Detección de crisis epilépticas: sobre el conjunto chbmit el encoder congelado alcanza una accuracy balanceada de 0,916 ± 0,019, lo que lo hace utilizable como extractor de características en un pipeline de monitorización de UCI o de dispositivos ambulatorios.
- Clasificación de anomalías y eventos en EEG clínico: en tuev obtiene 0,909 ± 0,005 y en tuab 0,824 ± 0,003, valores adecuados como primera etapa de triaje automático antes de la revisión por neurólogos.
- Detección de depresión a partir de EEG: en mdd_mumtaz2016 logra 0,847 ± 0,003, un resultado que permite plantear estudios de cribado asistido con validación clínica adicional.
- Estadificación del sueño: con isruc-sleep alcanza 0,697 ± 0,003, suficiente como base para prototipos de análisis automático de polisomnografías, siempre con revisión humana.
- Backbone para transferencia a nuevos datasets: al ser agnóstico al montaje y exponer embeddings contextuales, se puede congelar y entrenar una sonda ligera (ridge o MLP) sobre datos propios con pocas etiquetas.
- Investigación reproducible sobre geometría de enmascarado: permite replicar el estudio comparativo aislando el efecto de r = 6 cm y L = 4 frente a las otras 57 configuraciones de la familia.
- Interfaces cerebro-computador: en bcic2a obtiene 0,447 ± 0,018 y en bcic2020-3 0,271 ± 0,007; son valores bajos, por lo que solo resultan viables en experimentos exploratorios o como componente de un sistema con calibración por usuario.
- Análisis de carga cognitiva y estados mentales: en arithmetic_zyma2019 alcanza 0,652 ± 0,010 y en seed-v 0,311 ± 0,003, con rendimiento desigual según la tarea.

## Benchmarks y rendimiento

Resultados publicados con encoder congelado y sonda ridge sobre las características contextuales aplanadas, 12 conjuntos de datos × 5 semillas. Accuracy balanceada para clasificación y R² para `seed-vig`.

| Conjunto de datos | Métrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | accuracy balanceada | 0,652 ± 0,010 | 5 |
| bcic2020-3 | accuracy balanceada | 0,271 ± 0,007 | 5 |
| bcic2a | accuracy balanceada | 0,447 ± 0,018 | 5 |
| chbmit | accuracy balanceada | 0,916 ± 0,019 | 5 |
| faced | accuracy balanceada | 0,275 ± 0,013 | 5 |
| isruc-sleep | accuracy balanceada | 0,697 ± 0,003 | 5 |
| mdd_mumtaz2016 | accuracy balanceada | 0,847 ± 0,003 | 5 |
| physionet | accuracy balanceada | 0,553 ± 0,007 | 5 |
| seed-v | accuracy balanceada | 0,311 ± 0,003 | 5 |
| seed-vig | R² | −0,231 ± 0,013 | 5 |
| tuab | accuracy balanceada | 0,824 ± 0,003 | 5 |
| tuev | accuracy balanceada | 0,909 ± 0,005 | 5 |

No se han publicado en la información disponible comparaciones numéricas frente a los otros 57 encoders de la familia ni frente a modelos externos como LaBraM, BIOT o EEGPT.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12,69 M de parámetros, aproximadamente 51 MB en fp32 y unos 25 MB en fp16. El coste dominante es el de las activaciones, no el de los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; el modelo es lo bastante pequeño para ejecutarse en GPUs integradas o en CPU sin problema. No requiere A100 ni H100 para inferencia (se usaron 2 × H100 únicamente para el preentrenamiento).
- Cabe en GPU de consumo: sí, en cualquier RTX (incluidas series 20, 30, 40 y superiores), en GPUs integradas e incluso en CPU.
- Opciones de despliegue: el modelo se carga con `safetensors` y `huggingface_hub` a través de `ContextualEncoderBenchmarkWrapper` (paquete `eeg-fm-masking`), y se integra en pipelines de evaluación con `OpenEEGBench` mediante `PretrainedBackbone`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Requisitos de preprocesado en despliegue: muestreo a 200 Hz, señal en voltios, sin estandarización previa y coordenadas de canal en metros.

## Comparativa con modelos similares

| Modelo | Marco | Radio r | Longitud L | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r6cm_L4 (este) | JEPA | 6 cm | 4 parches | 12,69 M (encoder) | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible | CC-BY-4.0 | HuggingFace (recomendado por el paper) |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible | CC-BY-4.0 | HuggingFace (recomendado por el paper) |
| Modelos EEG externos (LaBraM, BIOT, EEGPT) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Según la model card, el paper recomienda las configuraciones r = 9 cm y L = 2, tanto en la variante MAE como en la JEPA, sobre la configuración de este repositorio. No se proporcionan en la información disponible las métricas comparativas entre ellas.

## Limitaciones y advertencias

- El repositorio contiene solo el encoder. El predictor JEPA y el profesor EMA no se distribuyen, por lo que no es posible reproducir el pipeline autosupervisado completo con estos pesos.
- Esta configuración (r = 6 cm, L = 4) no es la recomendada por el propio paper, que apunta a r = 9 cm y L = 2. Conviene evaluar las variantes recomendadas antes de adoptar esta.
- Rendimiento bajo en varios conjuntos: faced (0,275), bcic2020-3 (0,271) y seed-v (0,311) están cerca del azar en tareas con más de dos clases, lo que limita su uso directo en esas aplicaciones.
- El R² de seed-vig es negativo (−0,231), lo que indica que las características congeladas no predicen mejor que una línea base trivial en esa tarea de regresión.
- Los resultados publicados corresponden a encoder congelado con sonda ridge, no a fine-tuning completo; los números pueden variar sustancialmente con ajuste fino u otros clasificadores.
- El preentrenamiento usó únicamente 323 grabaciones del subconjunto abierto de REVE, una cobertura reducida que puede limitar la generalización a dominios no representados.
- El modelo es sensible al preprocesado: exige 200 Hz, unidades en voltios, ausencia de estandarización previa y posiciones de canal en metros. Omitir cualquiera de estos requisitos degrada o invalida las representaciones.
- Al ser agnóstico al montaje, el número y la disposición de canales pueden variar, pero cada canal debe tener una posición 3D válida; sin ella el modelo no puede procesarlo.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo demográfico, de edad o de patología en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos o negativos clínicos al usar las representaciones en un clasificador downstream; no debe usarse como herramienta diagnóstica sin validación clínica.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el código del repositorio asociado es MIT. Es obligatorio citar el paper.
- Estado de adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r6cm_L4
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Repositorio de código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos de la familia: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/fyxl8ibt
- Variante JEPA recomendada por el paper (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante MAE recomendada por el paper (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
