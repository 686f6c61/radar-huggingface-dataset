# hsci7001-group8/hsci7001-drp-transformer

## Resumen

El HSCI7001 DRP Transformer es un prototipo academico de transformer multimodal disenado para predecir la sensibilidad de lineas celulares cancerosas a farmacos, estimando el valor de ln IC50 a partir de la estructura molecular del farmaco (codificada como SMILES) y del perfil de expresion genica de la linea celular. Lo desarrolla el grupo 8 de la asignatura HSCI7001 *Artificial Intelligence in Medicine* de la Universidad de Macau como proyecto de curso, y se distribuye con licencia CC-BY-4.0.

El modelo es deliberadamente pequeno: 610.753 parametros en total, con una rama de farmaco basada en un transformer de 2 bloques (4 cabezas, FFN de 128, pre-LN) sobre un vocabulario SMILES de 30 tokens y una rama de linea celular que proyecta 2.000 genes a un vector de 64 dimensiones mediante dos capas densas. Ambas ramas se fusionan por concatenacion y una MLP final produce la prediccion escalar.

Es relevante como ejemplo didactico de modelado multimodal en bioinformatica y como referencia reproducible sobre el dataset GDSC, pero no debe confundirse con un modelo de produccion: la propia model card lo etiqueta como prototipo de investigacion no apto para uso clinico, y sus resultados en escenarios de farmaco nuevo (cold start) son claramente deficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (rama SMILES + rama de expresion genica, fusion por concatenacion) |
| Parametros totales | 610.753 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada SMILES truncada a max_len de 76 tokens) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en precision original) |
| Idiomas soportados | en (etiquetas y documentacion; la entrada es SMILES y vectores numericos) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`, `checkpoint_drug_cold.pt`, `checkpoint_cell_cold.pt`) |

## Arquitectura y entrenamiento

La rama de farmaco aplica embedding de tokens de dimension 64, codificacion posicional y dos bloques transformer con 4 cabezas de atencion, FFN de 128 unidades y normalizacion pre-LN, seguidos de masked mean pooling. La rama de linea celular reduce 2.000 genes a 256 y luego a 64 dimensiones con activacion ReLU y dropout de 0,2. La fusion concatena los 128 dimensiones resultantes y pasa por una MLP 64→1 que emite el ln IC50 predicho.

El entrenamiento usa la release curada de GDSC (Zenodo 7060305, CC-BY-4.0), con 233.738 pares (linea celular, farmaco), 966 lineas celulares y 282 farmacos. Los pesos publicados se entrenaron sobre un subconjunto estratificado por farmaco de 80.088 pares (34 % del total) que sigue cubriendo las 966 lineas y los 282 farmacos. Las features son los 2.000 genes de mayor varianza seleccionados sobre las celulas de entrenamiento, con vocabulario SMILES de 30 tokens y longitud maxima de 76. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; se trata de un modelo de regresion, no de generacion.

## Capacidades

- Prediccion de ln IC50 (sensibilidad a farmaco) a partir de SMILES y vector de expresion genica de 2.000 genes.
- Procesamiento de moleculas representadas como cadenas SMILES con tokenizacion por regex, `<pad>`=0, `<unk>`=1 y truncado a 76 tokens.
- Integracion multimodal de dos modalidades heterogeneas (estructura quimica y transcriptomica) mediante fusion por concatenacion.
- Regresion escalar supervisada, no generacion de texto ni razonamiento.
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidades multilingues, de vision, audio ni modo thinking.
- Incluye utilidades de carga (`load_local()` y `from_pretrained`) en `modeling_drp.py`.

## Casos de uso

- Docencia y reproduccion academica: sirve como ejemplo completo y ligero de pipeline multimodal (tokenizacion SMILES, seleccion de genes, estandarizacion, fusion y regresion) para cursos de IA en medicina.
- Linea base en investigacion de drug response prediction: al ser un modelo de 610.753 parametros, se puede entrenar y evaluar rapidamente como baseline frente a arquitecturas mayores sobre GDSC.
- Analisis de sensibilidad en paneles celulares: dado un farmaco con SMILES conocido y perfiles de expresion de lineas celulares ya vistas en entrenamiento, permite estimar ln IC50 para priorizar experimentos in vitro.
- Estudio de ablaciones de features: la separacion explicita entre rama de farmaco y rama celular facilita analizar la contribucion de cada modalidad, algo que la model card ya documenta (el split aleatorio se apoya sobre todo en la identidad del farmaco).
- Prototipaje de pipelines de preprocesamiento: los ficheros `genes_top2000.json`, `vocab.json` y `scaler_stats.json` sirven como referencia para replicar exactamente la seleccion de genes, el vocabulario SMILES y la estandarizacion en otros modelos.
- Experimentos de cold start controlados: los checkpoints `checkpoint_drug_cold.pt` y `checkpoint_cell_cold.pt` permiten estudiar el comportamiento del modelo cuando se evalua con farmacos o lineas celulares no vistos, incluido el colapso observado en farmacos nuevos.

## Benchmarks y rendimiento

Resultados publicados en la model card (RMSE sobre ln IC50, menor es mejor):

| Split | RMSE | Pearson | Spearman |
|---|---|---|---|
| Aleatorio | 1,206 | 0,888 | 0,865 |
| Farmaco nuevo (cold start) | 2,371 | 0,424 | 0,358 |
| Linea celular nueva (cold start) | 1,363 | 0,865 | 0,843 |

Baselines de referencia sobre los mismos splits:

| Modelo | RMSE aleatorio | RMSE farmaco nuevo | RMSE linea nueva |
|---|---|---|---|
| MLP | 1,167 | 2,273 | 1,371 |
| Ridge solo farmaco | 1,623 | 12,041 | 1,707 |
| Ridge solo celula | 2,568 | 2,529 | 2,829 |

El transformer no supera al MLP en ninguno de los tres splits. En farmaco nuevo, el entrenamiento se detuvo tras 4 epocas por divergencia de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos son de 610.753 parametros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: innecesarias; el modelo funciona en CPU sin problema. Cualquier GPU consumer (incluso GTX 1650 o superior) lo ejecuta con holgura.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo mediante `modeling_drp.py` (`load_local()` o `DRP.from_pretrained`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la inferencia por muestra es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | RMSE aleatorio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HSCI7001 DRP Transformer | 610.753 | SMILES hasta 76 tokens + 2.000 genes | 1,206 | CC-BY-4.0 | Hugging Face |
| MLP baseline (misma model card) | no disponible | mismas features | 1,167 | no disponible | no disponible (solo resultados) |
| Ridge solo farmaco | no disponible | SMILES agregado | 1,623 | no disponible | no disponible (solo resultados) |
| Ridge solo celula | no disponible | 2.000 genes | 2,568 | no disponible | no disponible (solo resultados) |

No se han identificado en la informacion proporcionada otros modelos publicados de drug response prediction comparables directamente (por ejemplo DeepCDR, TwinNet o GraphDRP); sus datos no estan disponibles en esta ficha.

## Limitaciones y advertencias

- Prototipo de investigacion: la model card indica explicitamente que no es apto para uso clinico.
- Colapso en cold start de farmaco: RMSE 2,371 y Spearman 0,358, con entrenamiento detenido a las 4 epocas por divergencia de validacion.
- El rendimiento en el split aleatorio depende en gran medida de la identidad del farmaco, no de la comprension de la estructura molecular.
- Inferior al baseline MLP en los tres splits evaluados.
- Entrenado solo sobre el 34 % de los pares GDSC (80.088 de 233.738), lo que limita la cobertura efectiva.
- Entrada restringida: vocabulario SMILES de 30 tokens, longitud maxima 76 y un conjunto fijo de 2.000 genes cuyo orden debe coincidir exactamente con `genes_top2000.json`; cualquier desviacion invalida la prediccion.
- Requiere estandarizacion con `scaler_stats.json`; no aplicarla produce resultados fuera de distribucion.
- Idiomas: solo etiquetas en ingles; no procesa texto libre.
- Sesgos: no documentados en la informacion proporcionada, pero el dataset GDSC esta sesgado hacia lineas celulares y farmacos concretos, lo que puede inducir predicciones poco representativas fuera de ese dominio.
- Riesgo de alucinacion: no aplica como modelo generativo, pero existe riesgo de extrapolacion incorrecta fuera de la distribucion de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero la naturaleza de prototipo y la falta de validacion clinica desaconsejan cualquier uso en produccion sanitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsci7001-group8/hsci7001-drp-transformer
- Dataset GDSC curado (Zenodo 7060305): https://zenodo.org/records/7060305
- Repositorio del autor: https://huggingface.co/hsci7001-group8
