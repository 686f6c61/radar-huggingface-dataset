# braindecode/corteg-small-pretrained

## Resumen

CORTEG-small-pretrained es un modelo fundacional para el análisis de señales electrofisiológicas intracraneales (iEEG y ECoG), publicado por el equipo de braindecode (grupo de investigación en neurotecnología y decodificación cerebral). Se trata de un backbone ST-EEGFormer-small adaptado al dominio intracraneal, con 25,3 millones de parámetros, que sirve como punto de partida del modelo CORTEG descrito por Yang et al. (2026). Su función principal es la extracción de características (feature extraction) a partir de registros de actividad cerebral invasiva, un dominio donde los modelos fundacionales están mucho menos explorados que en EEG de superficie.

El modelo parte del encoder ST-EEGFormer-small (originalmente entrenado sobre EEG de cuero cabelludo) y lo adapta a grabaciones intracraneales mediante la incorporación de un patch embedding de alta frecuencia gamma (high-gamma), que el modelo de superficie no posee. Este embedding se inicializa por interpolación lineal desde el de baja frecuencia (de 16 a 25 muestras), replicando el procedimiento de los autores originales. La relevancia actual radica en que ofrece un backbone preentrenado y ligero para tareas de decodificación cerebral invasiva, un área con creciente interés en interfaces cerebro-computadora (BCI) clínicas e investigación en neurociencia.

Con 25,3 millones de parámetros y un tamaño de repositorio de 0,3 GB, el modelo es extremadamente compacto, lo que facilita su despliegue en entornos de investigación con recursos limitados. La licencia MIT permite uso comercial sin restricciones significativas. El modelo se distribuye a través de la librería braindecode y el ecosistema Hugging Face, con pesos en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ST-EEGFormer-small adaptado a iEEG/ECoG (transformer con patch embedding de alta frecuencia gamma) |
| Parámetros totales | 25.315.328 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de señales fisiológicas, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Librería | braindecode |
| Modelo base | braindecode/STEEGFormer-small |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura se basa en el encoder ST-EEGFormer-small, un transformer diseñado originalmente para EEG de superficie, que aquí se adapta a grabaciones intracraneales. La innovación técnica principal es la adición de un patch embedding de alta frecuencia gamma (high-gamma), ausente en el modelo de cuero cabelludo, que se inicializa mediante interpolación lineal desde el embedding de baja frecuencia (de 16 a 25 muestras). Según la model card, esta conversión reproduce el procedimiento de los autores originales y coincide con su implementación en float32 sobre CPU con un error de 0,0e+00. El script `convert_corteg_checkpoint.py` del repositorio permite reproducir la conversión desde el checkpoint original `checkpoint-300.pth`.

El preentrenamiento se realizó mediante MAE (Masked Autoencoder) auto-supervisado durante 300 épocas, según la nota de release. El corpus de preentrenamiento comprende 11 conjuntos de datos públicos de EEG más un conjunto interno no publicado de KU Leuven. Los datos públicos incluyen: Cho2017 (EEG-MI-BCI), Schirrmeister2017 (High Gamma Dataset), BNCI2014_001 (BCI Competition IV 2a), BNCI2014_004 (BCI Competition IV 2b), Kaya2018 (Large-MI-Classic y Large-MI-5F), Won2022 (P300 speller y RSVP), Liu2020BETA (SSVEP), Stieger2021 (MI online), SparrKULee (respuestas auditivas) y SEED-V (emociones). Aunque el backbone se entrena sobre EEG de superficie, la adaptación a iEEG/ECoG se logra mediante la modificación del patch embedding y el ajuste fino posterior (finetune) sobre el modelo base STEEGFormer-small.

## Capacidades

- Extracción de características (feature extraction) a partir de señales de iEEG y ECoG, orientada a tareas de decodificación cerebral.
- Procesamiento de grabaciones intracraneales con múltiples montajes y paradigmas (movimiento imaginado, SSVEP, P300, respuestas auditivas, emociones).
- Adaptación a datos de alta frecuencia gamma mediante el patch embedding específico para iEEG.
- Base para ajuste fino (fine-tuning) en tareas de regresión y clasificación sobre señales cerebrales invasivas.
- Integración con la librería braindecode (`braindecode.models.CORTEG`), que facilita su uso en pipelines de neurociencia computacional.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni otras capacidades generativas de texto.

## Casos de uso

- Decodificación de movimiento imaginado en interfaces cerebro-computadora invasivas: el modelo extrae representaciones de grabaciones ECoG/iEEG para clasificar intenciones motoras, aprovechando su adaptación al dominio intracraneal y su patch embedding de alta frecuencia gamma.
- Investigación en neurociencia cognitiva: como extractor de características para analizar respuestas cerebrales en paradigmas de P300, SSVEP o respuestas auditivas, permitiendo comparar representaciones entre sujetos y condiciones experimentales.
- Desarrollo de sistemas BCI clínicos: sirve como backbone preentrenado para ajustar modelos específicos de paciente en tareas de control de prótesis o comunicación asistida, reduciendo la necesidad de grandes volúmenes de datos etiquetados por sujeto.
- Análisis de emociones a partir de señales intracraneales: aunque el preentrenamiento incluye SEED-V (EEG de superficie), el backbone adaptado puede ajustarse para decodificación emocional en registros invasivos.
- Detección de eventos epilépticos o anomalías: las representaciones extraídas pueden alimentar clasificadores de eventos anómalos en registros intracraneales continuos, un caso habitual en monitorización clínica.
- Reproducción y validación de investigaciones: el script de conversión y la correspondencia exacta con la implementación de los autores permiten replicar experimentos del paper CORTEG (Yang et al., 2026) y comparar resultados con el modelo original.
- Plataforma para experimentos de transferencia entre dominios: al partir de un backbone entrenado en EEG de superficie y adaptado a iEEG, permite estudiar la transferencia de representaciones entre modalidades de registro cerebral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 25,3 millones de parámetros (aproximadamente 101 MB en float32), la inferencia requiere menos de 1 GB de VRAM en la mayoría de configuraciones, incluyendo el espacio para activaciones y el contexto de la señal de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; se puede ejecutar en GPUs de gama alta (A100, H100) para procesamiento por lotes a gran escala, pero no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.), e incluso en CPU para inferencia puntual.
- Opciones de despliegue: la librería braindecode es el entorno principal; al ser un modelo PyTorch con pesos safetensors, puede cargarse con PyTorch estándar. No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CORTEG-small-pretrained | 25,3 M | no disponible | iEEG/ECoG | MIT | Hugging Face (braindecode) |
| STEEGFormer-small (modelo base) | no disponible | no disponible | EEG de superficie | no disponible | Hugging Face (braindecode) |
| Otros modelos fundacionales de EEG (p. ej., LaBraM, BIOT) | no disponible en la información proporcionada | no disponible | EEG | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento (benchmarks) entre estos modelos en la información proporcionada. La comparativa se limita a la relación de dependencia con STEEGFormer-small y a la ausencia de datos de otros modelos fundacionales de señales cerebrales en el material consultado.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para señales fisiológicas (iEEG/ECoG), no para texto, imagen o audio; no debe evaluarse con métricas de modelos de lenguaje.
- La información sobre sesgos es no disponible; al entrenarse con datasets públicos de EEG y un conjunto interno no publicado, puede heredar sesgos de muestreo demográfico y de paradigmas experimentales de esos corpus.
- Riesgo de alucinación no aplicable en el sentido habitual, pero las representaciones extraídas pueden producir predicciones erróneas en dominios no representados en el preentrenamiento (p. ej., patologías raras o montajes atípicos).
- Limitaciones de contexto e idioma: no disponible; el modelo no procesa lenguaje natural.
- La licencia MIT permite uso comercial, pero el modelo base STEEGFormer-small y los datos de preentrenamiento pueden tener sus propias restricciones; se recomienda verificar las licencias de los datasets subyacentes antes de un uso comercial.
- El conjunto de datos interno de KU Leuven no está publicado, lo que limita la reproducibilidad completa del preentrenamiento.
- Para producción clínica, se requiere validación externa y regulatoria; el modelo es una herramienta de investigación, no un dispositivo médico.
- El rendimiento en iEEG/ECoG depende de la calidad de la señal, la impedancia de los electrodos y la variabilidad entre sujetos; no se han publicado métricas de robustez en la información disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/braindecode/corteg-small-pretrained)
- [Modelo base STEEGFormer-small](https://huggingface.co/braindecode/STEEGFormer-small)
- [Paper CORTEG (Yang et al., 2026)](https://arxiv.org/abs/2605.10337)
- [Documentación de braindecode.models.CORTEG](https://braindecode.org/stable/generated/braindecode.models.CORTEG.html)
- [Checkpoint original ST-EEGFormer-small](https://github.com/LiuyinYang1101/STEEGFormer/releases/download/ST-EEGFormer-small/checkpoint-300.pth)
- [Repositorio CORTEG (GitHub)](https://github.com/LiuyinYang1101/CORTEG/tree/caafb78fbebdd9448814f96d7e61083a3eb62663)
- [Script de conversión run_regression_hilo_clean.py](https://github.com/LiuyinYang1101/CORTEG/tree/caafb78fbebdd9448814f96d7e61083a3eb62663/experiments/run_regression_hilo_clean.py)
- [NEMAR (plataforma de datasets)](https://nemar.org)
- [Dataset Cho2017 (GigaDB)](http://gigadb.org/dataset/100295)
- [High Gamma Dataset (GIN)](https://gin.g-node.org/robintibor/high-gamma-dataset)
- [BCI Competition IV dataset 2a](https://www.bbci.de/competition/iv/#dataset2a)
- [BCI Competition IV dataset 2b](https://www.bbci.de/competition/iv/#dataset2b)
- [Kaya2018 (Figshare)](https://figshare.com/collections/A_large_electroencephalographic_motor_imagery_dataset_for_electroencephalographic_brain_computer_interfaces/3917698)
- [Won2022 (Figshare)](https://doi.org/10.6084/m9.figshare.c.5769449.v1)
- [BETA (Liu2020)](https://doi.org/10.3389/fnins.2020.00627)
- [Stieger2021 (Figshare)](https://doi.org/10.6084/m9.figshare.13123148.v1)
- [SparrKULee (KU Leuven)](https://doi.org/10.48804/K3VSND)
- [SEED-V](https://bcmi.sjtu.edu.cn/home/seed/seed-v.html)
