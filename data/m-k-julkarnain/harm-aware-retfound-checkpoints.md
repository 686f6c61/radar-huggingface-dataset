# m-k-julkarnain/harm-aware-retfound-checkpoints

## Resumen

Harm-Aware Reliability Orchestrator (Rharm) es un conjunto de artefactos de investigación publicados en Hugging Face por el autor m-k-julkarnain, asociados al manuscrito revisado MBEC-D-26-03059. No se trata de un modelo generativo ni de un LLM, sino de los ficheros complementarios de un estudio de monitorización de deriva (shift monitoring) sin etiquetas para un backbone de visión congelado RETFound-DINOv2 con una sonda lineal (linear probe) entrenada encima. El repositorio contiene la sonda entrenada, los splits de datos, las tablas de resultados, las figuras del artículo y el código de un único fichero que reproduce el pipeline completo.

El componente entrenable es extremadamente pequeño: una sonda lineal de 5.125 parámetros (W de 1024x5 y b de 5) que clasifica representaciones de 1024 dimensiones en 5 clases, entrenada sobre el split de entrenamiento de APTOS 2019 (2.563 imágenes) con parada temprana en validación (mejor época 6). El backbone RETFound-DINOv2 no se distribuye en este repositorio por estar sujeto a acceso restringido y debe descargarse por separado aceptando sus términos.

La relevancia del artefacto es metodológica: propone un orquestador de fiabilidad no invasivo de tres ejes (discrepancia de representación con blanqueado ZCA, incertidumbre de predicción y calidad física de imagen) para cribado de tele-oftalmología. El repositorio ocupa 23,1 GB, aunque la mayor parte de ese peso corresponde a figuras, resultados y artefactos auxiliares, no a pesos de un modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (linear probe) sobre backbone congelado RETFound-DINOv2 (ViT DINOv2) |
| Parametros totales | 5.125 (solo la sonda lineal); backbone no incluido en el repo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | NPZ (`probe/probe.npz`); backbone en formato propio del repo `YukunZhou/RETFound_dinov2_meh` |
| Dimension de entrada | 1024 (representaciones del backbone) |
| Numero de clases | 5 |
| Dataset de entrenamiento de la sonda | APTOS 2019, split train de 2.563 imágenes |
| Splits | train 2.563 / val 366 / calib 366 / test 367 (seed 42, estratificado) |
| Epoca optima (early stopping) | 6 |
| Tamano del repositorio | 23,1 GB |

## Arquitectura y entrenamiento

El sistema es un pipeline de monitorización de fiabilidad construido sobre un backbone de visión congelado RETFound-DINOv2, un ViT basado en DINOv2 adaptado al dominio oftalmológico. Sobre las representaciones de 1024 dimensiones que produce el backbone se entrena una sonda lineal de 5 clases con solo 5.125 parámetros, ajustada sobre el split de entrenamiento de APTOS 2019 (2.563 imágenes) con parada temprana sobre el split de validación, seleccionando la época 6 como mejor checkpoint. Los splits son estratificados con semilla 42 y se dividen en train (2.563), validación (366), calibración (366) y test (367).

La innovación declarada no está en el clasificador sino en el orquestador de tres ejes que envuelve al backbone sin modificarlo (non-invasive): discrepancia de representación tras blanqueado ZCA, incertidumbre de predicción y calidad física de la imagen. El fichero `risk_model.json` contiene las estadísticas de calibración y el umbral de alerta. El repositorio distingue explícitamente entre los artefactos de la sumisión original (v1, entrenada con un protocolo antiguo que reutilizaba el split de validación, conservados solo como registro) y los de la revisión (v2), que son los que respaldan todas las cifras del artículo revisado. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición adicional del dataset más allá de APTOS 2019, IDRiD y MESSIDOR-2 usados en la evaluación.

## Capacidades

- Clasificación de imágenes de fondo de ojo en 5 clases mediante sonda lineal sobre representaciones RETFound-DINOv2.
- Monitorización de deriva (distribution shift) sin etiquetas en producción, mediante discrepancia de representación con blanqueado ZCA.
- Estimación de incertidumbre de predicción como señal de fiabilidad por muestra.
- Evaluación de calidad física de imagen como tercer eje del orquestador.
- Calibración de umbrales de alerta a partir de un split de calibración dedicado (`risk_model.json`).
- Reproducibilidad completa del pipeline en un único fichero ejecutable (`rharm_pipeline.py`, entorno Kaggle con GPU).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Cribado de retinopatía diabética en tele-oftalmología: la sonda clasifica imágenes de fondo de ojo en 5 grados de severidad sobre representaciones de un backbone especializado, sirviendo como componente de triaje en programas de cribado remoto.
- Monitorización de deriva en producción sin etiquetas: el eje de discrepancia ZCA detecta cuándo la distribución de imágenes entrantes se aleja de la de entrenamiento, permitiendo disparar revisiones antes de que caiga la precisión real.
- Control de calidad de adquisición: el eje de calidad física de imagen descarta capturas degradadas antes de que lleguen al clasificador, reduciendo falsos negativos por imágenes no diagnósticas.
- Alertas de fiabilidad por muestra: combinando incertidumbre de predicción y umbral calibrado, el sistema marca casos dudosos para revisión por un oftalmólogo humano, priorizando el esfuerzo clínico.
- Reproducción de investigación: `rharm_pipeline.py` permite replicar íntegramente las tablas y figuras del manuscrito MBEC-D-26-03059 en un entorno Kaggle con GPU, útil para revisores y para trabajos que quieran extender el método.
- Evaluación comparativa de backbones de visión médica: la sonda y los splits fijos (seed 42) permiten sustituir el backbone y medir el impacto en fiabilidad bajo un protocolo controlado.
- Auditoría regulatoria de sistemas de IA clínica: los artefactos de calibración y umbral documentan el comportamiento del sistema ante deriva, material útil en expedientes de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las tablas y figuras del artículo están en `results/` y `figures/`, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- La sonda lineal (5.125 parámetros, fichero NPZ) es despreciable en memoria; el coste real está en el backbone RETFound-DINOv2, que debe descargarse por separado.
- VRAM estimada para el backbone ViT-DINOv2 en fp16: del orden de 1-2 GB para los pesos, más memoria de activaciones según resolución y tamaño de lote; no se especifica en la información disponible.
- El pipeline está documentado para ejecutarse en Kaggle con GPU (`python rharm_pipeline.py`), lo que sugiere que cabe en GPUs de consumo tipo T4/P100 o superiores; no se detallan modelos concretos.
- Opciones de despliegue: ejecución directa del script Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rharm (este repo) | Sonda lineal + monitor de deriva sobre RETFound-DINOv2 | 5.125 (sonda) | no aplica | no disponible | Hugging Face (backbone aparte, con acceso restringido) |
| RETFound_MAE (open-eye) | Backbone ViT-MAE oftalmológico | no disponible en la informacion | no aplica | no disponible en la informacion | Hugging Face |
| RETFound-DINOv2 (`YukunZhou/RETFound_dinov2_meh`) | Backbone ViT-DINOv2 oftalmológico | no disponible en la informacion | no aplica | acceso restringido (requiere aceptar términos) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni un LLM: no debe evaluarse con criterios de contexto, tool calling o capacidades multilingües.
- La licencia no está declarada en la información disponible; el uso comercial queda sin garantías legales hasta confirmación del autor.
- El backbone RETFound-DINOv2 no se incluye y está sujeto a acceso restringido con aceptación de términos, lo que condiciona la reproducibilidad completa.
- Los artefactos de la raíz del repositorio (v1) se entrenaron con un protocolo que reutilizaba el split de validación; no deben usarse para evaluar rendimiento, solo los de `v2_revision/`.
- El conjunto de evaluación incluye MESSIDOR-2, cuya redistribución no está permitida; los datos no se distribuyen con el repositorio.
- La sonda se entrena únicamente con APTOS 2019 (5 clases); su comportamiento fuera de esa distribución depende del orquestador de deriva, no del clasificador.
- Riesgo de alucinación no aplicable; el riesgo relevante es el de falsos negativos en cribado si los umbrales de alerta se recalibran de forma inadecuada.
- El repositorio es un proof-of-concept de investigación; no se documentan validaciones clínicas prospectivas ni certificaciones regulatorias.
- Sesgos demográficos y de adquisición del dataset APTOS 2019 pueden propagarse a la sonda; no se documentan análisis de equidad en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/m-k-julkarnain/harm-aware-retfound-checkpoints
- Código y artefactos en Zenodo: https://zenodo.org/records/22022568
- Backbone RETFound-DINOv2 (acceso restringido): https://huggingface.co/YukunZhou/RETFound_dinov2_meh
- Backbone RETFound_MAE: https://huggingface.co/open-eye/RETFound_MAE
- Dataset APTOS 2019: https://www.kaggle.com/competitions/aptos2019-blindness-detection
- Dataset IDRiD: https://ieee-dataport.org/open-access/indian-diabetic-retinopathy-image-dataset-idrid
- MESSIDOR-2 (ADCIS): https://www.adcis.net/en/third-party/messidor2/
