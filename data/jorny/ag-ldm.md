# Jorny/AG-LDM

## Resumen

AG-LDM (Anatomically Guided Latent Diffusion) es un modelo de difusión latente en dos etapas desarrollado por JornyWan para la síntesis condicional de imágenes de resonancia magnética cerebral (MRI) longitudinales. Dada una imagen basal y covariables clínicas (edad objetivo, sexo y diagnóstico), el modelo genera la imagen de seguimiento correspondiente, incorporando supervisión anatómica derivada de segmentaciones tisulares durante el entrenamiento. Este enfoque aborda el problema de modelar la progresión de enfermedades neurodegenerativas como el Alzheimer, donde predecir cambios estructurales individualizados es crucial para la investigación.

El modelo se compone de un autoencoder KL afinado (13,77 millones de parámetros) y un UNet de difusión condicionado por canales (475,44 millones de parámetros), sumando un total de 489,21 millones de parámetros. La entrada es un volumen MRI 3D de dimensiones 1×120×144×120, y el espacio latente resultante es de 3×15×18×15 a resolución 1,5 mm en espacio MNI. El condicionamiento se realiza mediante concatenación de canales: tres canales de ruido, tres de la imagen basal y cinco covariables clínicas. El entrenamiento se realizó sobre 25.498 pares longitudinales del dataset ADNI, con un preprocesamiento estándar (skull-strip, registro MNI y remuestreo a 1,5 mm).

AG-LDM se presenta como una alternativa más simple y eficaz que el estado del arte previo (BrLP), al eliminar módulos auxiliares complejos y aprovechar la guía anatómica de un segmentador congelado (WarpSeg) en ambas etapas de entrenamiento. Los pesos publicados son los exactos utilizados en el paper, y el modelo está diseñado exclusivamente para uso en investigación, no como dispositivo médico. Su relevancia radica en ofrecer una herramienta reproducible y de código abierto para la simulación de trayectorias de progresión cerebral, con potencial aplicación en aumento de datos, planificación de ensayos y estudio de biomarcadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente en dos etapas: autoencoder KL (Stage 1) + UNet de difusión condicionado por canales (Stage 2) |
| Parametros totales | 489,21 M (13,77 M autoencoder + 475,44 M UNet) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de imagen 3D: 1×120×144×120) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato .pth, sin cuantización publicada) |
| Idiomas soportados | No aplica (modelo de imagen médica, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pth (checkpoints separados para cada etapa) |

## Arquitectura y entrenamiento

AG-LDM sigue una arquitectura de difusión latente en dos etapas. La primera etapa consiste en un autoencoder KL (variacional) afinado para comprimir los volúmenes MRI en un espacio latente de baja dimensión (3×15×18×15). La segunda etapa emplea un UNet de difusión que opera sobre este espacio latente, condicionado mediante concatenación de canales: tres canales de ruido latente, tres canales de la imagen basal latente y cinco canales de covariables clínicas (edad inicial, edad de seguimiento, sexo, diagnóstico inicial y diagnóstico de seguimiento). Los latentes se rellenan con `DivisiblePad(k=4)` hasta 16×20×16 antes de entrar al UNet.

El entrenamiento se realizó sobre 25.498 pares longitudinales del dataset ADNI, con preprocesamiento idéntico al de BrLP: extracción de cráneo, registro a espacio MNI y remuestreo a 1,5 mm (122×146×122). La supervisión anatómica se introduce mediante un segmentador tisular congelado llamado WarpSeg, que actúa como teacher durante ambas etapas de entrenamiento. Este teacher no se redistribuye en el repositorio, pero solo es necesario para entrenar; la inferencia no lo requiere. El autoencoder se entrenó durante 10 épocas, mientras que el UNet de difusión se entrenó durante 20 épocas (71.600 pasos). El factor de escala latente utilizado en el muestreo es 0,960971.

La innovación principal frente a BrLP es la simplificación arquitectónica: en lugar de módulos de condicionamiento auxiliares, AG-LDM integra las covariables directamente como canales adicionales en el espacio latente, y la guía anatómica se aplica de forma consistente en ambas etapas. Esto reduce la complejidad y mejora el uso de la información condicional, según los resultados reportados en el paper.

## Capacidades

- Síntesis condicional de imágenes MRI de seguimiento a partir de una imagen basal y covariables clínicas (edad, sexo, diagnóstico).
- Generación de volúmenes 3D completos en espacio MNI a resolución 1,5 mm.
- Condicionamiento por canales que permite controlar explícitamente la edad objetivo, el sexo y el diagnóstico tanto inicial como de seguimiento.
- Guía anatómica mediante segmentación tisular durante el entrenamiento, lo que mejora la coherencia estructural de las imágenes generadas.
- Inferencia sin necesidad del teacher de segmentación, lo que facilita su uso en entornos de investigación.
- Evaluación zero-shot en el dataset OASIS-3, lo que sugiere cierta capacidad de generalización a otras cohortes con adquisición estandarizada.
- No incluye capacidades de generación de texto, código, tool calling, agentes ni procesamiento de lenguaje natural, al ser un modelo puramente visual.

## Casos de uso

- Simulación de progresión de Alzheimer en investigación: dado un MRI basal de un paciente, el modelo puede generar el MRI de seguimiento a una edad futura especificada, permitiendo estudiar trayectorias individualizadas de atrofia cerebral sin necesidad de esperar años de seguimiento real.
- Aumento de datos para entrenar otros modelos: los pares (basal, seguimiento) sintéticos pueden ampliar datasets longitudinales limitados, mejorando el rendimiento de clasificadores de progresión o segmentadores entrenados con supervisión.
- Planificación de ensayos clínicos: los investigadores pueden simular cómo evolucionaría la estructura cerebral de una cohorte bajo diferentes escenarios de tratamiento (cambiando el diagnóstico de seguimiento), ayudando a dimensionar el tamaño muestral o a seleccionar biomarcadores sensibles.
- Estudio de biomarcadores imaginológicos: al generar imágenes de seguimiento con covariables controladas, se puede analizar qué regiones cerebrales cambian de forma más consistente en función de la edad o el diagnóstico, contribuyendo al descubrimiento de biomarcadores.
- Generación de hipótesis sobre mecanismos de neurodegeneración: comparando las imágenes generadas con las reales, se pueden identificar discrepancias que sugieran factores no modelados, orientando nuevas investigaciones.
- Evaluación de métodos de registro longitudinal: las parejas de imágenes sintéticas con transformaciones conocidas (implícitas en la progresión) pueden servir como ground truth para validar algoritmos de registro no rígido.
- Educación médica y visualización: el modelo puede ilustrar cómo progresa la atrofia cerebral en enfermedades neurodegenerativas, facilitando la docencia en radiología y neurología sin necesidad de datos de pacientes reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la precisión anatómica se evaluó con SynthSeg (un pipeline morfométrico independiente) y que se realizó una evaluación zero-shot en OASIS-3, pero no se proporcionan métricas numéricas. El paper asociado (arXiv:2601.14584) reporta resultados, pero no están accesibles en el material proporcionado. No se incluyen cifras de MMLU, HumanEval u otros benchmarks, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Los checkpoints ocupan aproximadamente 2,0 GB en disco (53 MB el autoencoder y 1,8 GB el UNet).
- Para inferencia en FP32, los pesos del UNet requieren unos 1,9 GB de VRAM, más el autoencoder (~55 MB) y las activaciones del volumen 3D. Se estima un consumo total de VRAM entre 4 y 6 GB, dependiendo del tamaño de lote y del uso de autocast.
- Es viable ejecutar el modelo en GPUs de consumo como la NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Una RTX 3090 o RTX 4090 permitiría mayor margen y posiblemente lotes más grandes.
- Para entrenamiento (no incluido en los pesos publicados), se requeriría una GPU con al menos 24 GB de VRAM (por ejemplo, A100 o RTX 3090/4090) debido al uso del teacher de segmentación y al proceso de difusión.
- El despliegue se realiza mediante PyTorch estándar, cargando los checkpoints con `torch.load`. No es compatible con vLLM, Ollama o TGI, al no ser un modelo de lenguaje. Se puede integrar con MONAI para pipelines de imagen médica.
- No se dispone de datos de latencia o throughput publicados. Dado el tamaño del UNet y la naturaleza 3D, se espera que la generación de una imagen tome varios segundos en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

El principal modelo comparable es BrLP (Brain Latent Progression), sobre el cual AG-LDM se basa y al que pretende superar. Sin embargo, no se dispone de las especificaciones técnicas de BrLP en la información proporcionada, por lo que no es posible realizar una comparación numérica rigurosa. Otros modelos de difusión para MRI cerebral existen, pero no se han identificado en la búsqueda. Por tanto, la comparativa se limita a una descripción cualitativa:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AG-LDM | Difusión latente en dos etapas con guía anatómica | 489,21 M | Imagen 3D 1×120×144×120 | MIT | Pesos en HuggingFace |
| BrLP | Pipeline multi-etapa con módulos auxiliares | No disponible | No disponible | No disponible | Código en GitHub |

Se recomienda consultar el paper de AG-LDM para obtener la comparativa detallada con BrLP y otros métodos.

## Limitaciones y advertencias

- Uso exclusivo para investigación: el modelo no es un dispositivo médico y no debe utilizarse para la toma de decisiones clínicas.
- No modela explícitamente la dinámica de progresión: no existe un término que acople puntos temporales sucesivos, por lo que cada generación es independiente y no captura dependencias temporales a largo plazo.
- La precisión anatómica se evaluó con SynthSeg, un pipeline morfométrico automatizado, no con ground truth anatómico real. Esto puede introducir sesgos en la validación.
- Entrenado únicamente en ADNI y evaluado zero-shot en OASIS-3, ambas cohortes de investigación con adquisición estandarizada. El comportamiento bajo heterogeneidad de adquisición a escala poblacional o en rutina clínica no ha sido medido.
- El teacher de segmentación (WarpSeg) no se incluye en el repositorio; solo es necesario para entrenar, pero su ausencia impide reproducir el entrenamiento sin obtenerlo por separado.
- Posibles sesgos demográficos derivados de la población ADNI (mayoritariamente caucásica, de edad avanzada), lo que puede limitar la generalización a otros grupos.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir artefactos o estructuras irreales, especialmente en regiones con baja señal o en casos fuera de la distribución de entrenamiento.
- La licencia MIT permite uso comercial, pero el modelo está pensado para investigación; cualquier uso clínico requeriría validación adicional y cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jorny/AG-LDM
- Repositorio de código: https://github.com/JornyWan/AG-LDM
- Paper en arXiv: https://arxiv.org/abs/2601.14584
- Repositorio de BrLP (base del modelo): https://github.com/LemuelPuglisi/BrLP
- Repositorio de WarpSeg (teacher de segmentación): https://github.com/BahramJafrasteh/WarpSeg
- MONAI (librería utilizada): https://github.com/Project-MONAI/MONAI
