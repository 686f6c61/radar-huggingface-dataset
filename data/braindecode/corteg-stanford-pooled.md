# braindecode/corteg-stanford-pooled

## Resumen

CORTEG (Stanford finger flexion, pooled) es un modelo de decodificacion de senales cerebrales publicado por el equipo de braindecode (Braindecode es el ecosistema de referencia para deep learning en EEG/ECoG). Se trata de una adaptacion del backbone ST-EEGFormer small al dominio ECoG (electrocorticografia), afinada sobre las grabaciones de flexion de dedos de los 9 pacientes de la Stanford ECoG Library, entrenados de forma conjunta ("pooled"). El modelo predice la flexion de los cinco dedos (pulgar, indice, corazon, anular y menique) a partir de una ventana de 1 segundo de ECoG.

Con 25,5 millones de parametros, es un modelo compacto pensado para investigacion en interfaces cerebro-computadora (BCI) invasivas y en neuroprotesis de mano. La relevancia actual radica en que el articulo de Yang et al. (2026) demuestra que un transformer preentrenado con auto-supervision en EEG puede transferirse a ECoG mediante un adaptador espacial y LoRA, obteniendo un Pearson r de 0,554 en la decodificacion de flexion de dedos con los 9 pacientes agregados, sin reentrenar el backbone completo.

La ficha tecnica es inusual respecto a los modelos de lenguaje: no procesa texto ni imagenes, sino series temporales neuronales multicanal. Su valor esta en ofrecer un checkpoint reproducible, convertido a la API `braindecode.models.CORTEG`, con verificacion numerica frente a la implementacion original de los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ST-EEGFormer small) adaptado a ECoG con adaptador espacial y LoRA (r=4, alpha=16) en bloques 4-7 |
| Parametros totales | 25.459.988 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de entrada de 1 s de ECoG (no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32; safetensors) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,3 GB), con `pytorch_model_hub_mixin` |

## Arquitectura y entrenamiento

El modelo parte de ST-EEGFormer small, un transformer preentrenado con enmascaramiento auto-supervisado (MAE) durante 300 epocas sobre un corpus de 11 conjuntos publicos de EEG mas un conjunto interno no liberado del laboratorio de KU Leuven (paradigmas de imagenes motoras, SSVEP, P300/RSVP, emociones, escucha de habla, etc.). Sobre ese backbone congelado se anade un adaptador espacial que proyecta los contactos ECoG a la representacion del modelo, un patch embedding especifico de alta gamma y factores LoRA (r=4, alpha=16) en los bloques 4 a 7, junto con las LayerNorm de esos bloques y la cabeza de lectura. El adaptador resultante tiene 297.236 parametros entrenables.

El ajuste fino se realiza sobre las grabaciones de flexion de dedos de los 9 pacientes de la Stanford ECoG Library, agregando todos los sujetos en un unico modelo ("pooled"). La conversion a `braindecode.models.CORTEG` fusiona los factores LoRA en las matrices qkv, proj, fc1 y fc2 con escala alpha/r = 4, de modo que el checkpoint final es un CORTEG plano sin LoRA en tiempo de inferencia. Los autores verifican que las salidas coinciden con su funcion `load_corteg` hasta 1,5e-06 en float32 sobre CPU, tanto para montajes de 8 como de 46 contactos.

## Capacidades

- Decodificacion de flexion de los cinco dedos (pulgar, indice, corazon, anular, menique) a partir de 1 s de ECoG.
- Prediccion continua (regresion) de trayectorias de movimiento de la mano, no clasificacion discreta.
- Generalizacion entre pacientes en regimen "pooled": un unico modelo entrenado con los 9 sujetos.
- Adaptacion de dominio EEG a ECoG mediante adaptador espacial, lo que permite reutilizar un backbone preentrenado en EEG.
- Compatibilidad con montajes de distinto numero de contactos (verificado con 8 y 46 electrodos).
- Integracion nativa con la libreria braindecode (`from_pretrained`, `model.card_data.datasets`).
- No soporta tool calling, agentes, texto, vision ni audio: es un modelo de senales neuronales.

## Casos de uso

- Investigacion en neuroprotesis de mano: decodificar la intencion de flexion de cada dedo desde ECoG para controlar una protesis o exoesqueleto en tiempo real, aprovechando la ventana de 1 s y el bajo coste computacional de 25,5 M de parametros.
- Estudios de transferencia EEG a ECoG: usar el checkpoint como referencia para evaluar cuanto conocimiento de un backbone preentrenado en EEG superficial se transfiere a senales intracraneales, comparando con el rendimiento reportado (Pearson r 0,554).
- Reproducibilidad cientifica: `convert_corteg_checkpoint.py` permite regenerar el modelo desde los ficheros originales de los autores, util para replicar el articulo de Yang et al. (2026) en un entorno braindecode.
- Benchmarking de decodificadores BCI: servir como linea base "pooled" frente a modelos por paciente en tareas de regression de movimiento, con metricas comparables directamente.
- Prototipado en laboratorio con pocos recursos: el tamano reducido permite entrenar adaptaciones por sujeto en una sola GPU de consumo, partiendo de este checkpoint en lugar de un backbone desde cero.
- Docencia y formacion en neuroingenieria: ejemplo completo de pipeline pretraining auto-supervisado en EEG, adaptacion a ECoG y evaluacion con correlacion de Pearson, reproducible con datos publicos de NEMAR y Stanford.
- Analisis retrospectivo de datasets clinicos: aplicar el modelo a grabaciones ECoG historicas de la Stanford ECoG Library para extraer cinematica de dedos estimada y contrastarla con datos de guante.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Pearson r (flexion de dedos, 9 pacientes pooled) | 0,554 | Tabla 1 del articulo, fila "CORTEG (pooled)" |

No se han publicado en la informacion disponible resultados adicionales (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de senales neuronales, no de lenguaje. No se dispone de comparaciones numericas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (25,5 M de parametros, ~100 MB de pesos); cabe holgadamente en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para inferencia, utiles solo para entrenamiento de adaptaciones.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer de los ultimos diez anos, y en CPU para inferencia por lotes.
- Opciones de despliegue: libreria `braindecode` con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este dominio).
- Latencia y throughput: no disponibles en la informacion proporcionada; el coste esperado es bajo por el tamano del modelo y la ventana de 1 s.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CORTEG (Stanford pooled) | 25,5 M | ECoG (fine-tuning) | 1 s | MIT | Hugging Face (braindecode) |
| ST-EEGFormer small | no disponible | EEG (pretraining) | no disponible | no disponible | GitHub (LiuyinYang1101/STEEGFormer) |
| CORTEG por paciente | no disponible | ECoG | 1 s | no disponible | no disponible en la informacion |

No se dispone de datos suficientes para comparar rendimiento numerico con alternativas; la unica metrica publicada es el Pearson r de 0,554 del modelo pooled.

## Limitaciones y advertencias

- Dominio muy especifico: solo predice flexion de dedos desde ECoG; no es un modelo de proposito general.
- Sesgo de poblacion: entrenado con 9 pacientes de la Stanford ECoG Library, con montajes y caracteristicas clinicas concretas; la generalizacion a otras cohortes, patologias o colocaciones de electrodos no esta garantizada.
- Requiere senal ECoG invasiva de alta calidad; no funciona con EEG superficial ni con otros tipos de senal.
- La ventana de 1 s limita la resolucion temporal para movimientos rapidos o de alta frecuencia.
- Riesgo de sobreajuste al regimen "pooled": el rendimiento por paciente individual puede diferir del agregado.
- Licencia MIT permite uso comercial, pero el uso clinico real exigiria validacion regulatoria adicional no cubierta por el modelo.
- El backbone preentrenado incluye un conjunto interno no liberado (KU Leuven), lo que limita la reproducibilidad completa del pretraining.
- No se documentan cuantizaciones ni optimizaciones para despliegue en dispositivos embebidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braindecode/corteg-stanford-pooled
- Modelo base (backbone): https://huggingface.co/braindecode/corteg-small-pretrained
- Articulo: https://arxiv.org/abs/2605.10337
- Repositorio CORTEG: https://github.com/LiuyinYang1101/CORTEG
- Repositorio ST-EEGFormer: https://github.com/LiuyinYang1101/STEEGFormer
- Documentacion braindecode CORTEG: https://braindecode.org/stable/generated/braindecode.models.CORTEG.html
- Stanford ECoG Library (finger flexion): https://exhibits.stanford.edu/data/catalog/zk881ps0522
- NEMAR nm000352 (copia multi-tarea): https://nemar.org/dataset/nm000352
