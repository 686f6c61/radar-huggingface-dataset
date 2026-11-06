# ForeverBlue/ECG

## Resumen

ECG C1 es un codificador Transformer preentrenado para senales de electrocardiograma (ECG) mediante aprendizaje autosupervisado con un autoencoder enmascarado de doble reconstruccion. Lo desarrolla el usuario ForeverBlue y se publica bajo licencia Apache 2.0. El modelo resuelve el problema de obtener representaciones genericas de ECG sin depender de etiquetas diagnosticas, de modo que sirva como base para fine-tuning en tareas aguas abajo como clasificacion de arritmias o deteccion de patologias.

La innovacion principal es que un unico Transformer compartido atiende dos configuraciones de derivaciones distintas (12 derivaciones a 500 Hz y 1 derivacion a 250 Hz) mediante frontends wavelet especificos por ruta, y la identidad de la derivacion entra como embedding aprendido del nombre de la derivacion, no de su indice. El modelo tiene 30,1 M de parametros, de los cuales 28,38 M (94,3 %) corresponden al Transformer compartido, y se entreno durante 57 epocas (57.000 actualizaciones del optimizador) sobre una mezcla de corpus publicos de ECG.

El checkpoint publicado corresponde a la epoca 33 (mejor perdida total de validacion). Es relevante ahora porque ofrece una alternativa ligera y abierta a los modelos de ECG propietarios, con separacion explicita entre lo que transfiere (Transformer, embedding de canal) y lo que es especifico de la ruta de preentrenamiento (frontend wavelet, patcher, decodificadores).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con autoencoder enmascarado de doble reconstruccion y frontends wavelet por ruta |
| Parametros totales | 30,08 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 10 s a 500 Hz en la ruta L12_500) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senal biosanitaria, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo es un Transformer compartido de 28,38 M de parametros que procesa parches de senal ECG. Cada configuracion de derivaciones (ruta) dispone de un frontend wavelet y un patcher propios: la ruta `L12_500` opera con 12 derivaciones a 500 Hz y la ruta `L1_250` con 1 derivacion a 250 Hz. La identidad de la derivacion se codifica mediante un embedding aprendido del nombre de la derivacion (no de su indice), lo que permite generalizar entre montajes. El objetivo de preentrenamiento combina dos cabezas de reconstruccion con igual peso: una predice parches wavelet plegados y normalizados por parche, y otra predice la forma de onda ECG preprocesada de los mismos parches enmascarados. La funcion de perdida es `0.5*L_spec + 0.5*L_raw + 0.001*L_foldKL`, con un ratio de enmascaramiento de 0,7 aplicado antes del frontend wavelet.

El entrenamiento se realizo sobre una mezcla de corpus publicos de ECG durante 57 epocas (57.000 actualizaciones del optimizador). No se especifica en la informacion disponible el numero exacto de tokens ni la composicion detallada del dataset, ni si se aplico RLHF o DPO (no procede en un modelo de senal). Se publican varios checkpoints, cada uno minimo de una metrica de validacion distinta (perdida total, MSE espectral, SmoothL1 cruda, perdida macro por ruta), para permitir comparar cual criterio transfiere mejor aguas abajo. En la epoca 33, la perdida total de validacion es 0,1827, con correlacion de Pearson de 0,851 en la cabeza espectral y 0,845 en la cruda, y NMSE de 0,256 y 0,255 respectivamente.

## Capacidades

- Extraccion de representaciones latentes de senales ECG de 12 derivaciones a 500 Hz y de 1 derivacion a 250 Hz.
- Reconstruccion enmascarada de parches wavelet y de forma de onda ECG (uso principal durante el preentrenamiento).
- Transferencia del Transformer compartido y del embedding de canal a cualquier montaje aguas abajo.
- Transferencia del frontend wavelet y del patcher solo cuando el montaje coincide con una de las dos rutas (mismo numero de canales y misma longitud de parche).
- Base para fine-tuning en tareas de clasificacion, deteccion y segmentacion de senal ECG.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de arritmias: se carga `ecg_c1_encoder.pth` como inicializacion y se anade una cabeza de clasificacion sobre las representaciones del Transformer para distinguir ritmos como fibrilacion auricular o taquicardias, aprovechando que el 94,3 % de los parametros (el Transformer) transfiere siempre.
- Deteccion de patologias en ECG de 12 derivaciones: al usar la ruta `L12_500` (12 derivaciones, 500 Hz, ventanas de 10 s) se pueden cargar tambien el frontend wavelet y el patcher preentrenados, reduciendo el coste de adaptacion frente a entrenar desde cero.
- Monitorizacion con una sola derivacion: la ruta `L1_250` permite reutilizar el Transformer en dispositivos wearables o tiras de ritmo de una derivacion a 250 Hz, con un frontend especifico ya preentrenado.
- Preentrenamiento continuado o investigacion de objetivos: el checkpoint completo `pretrain_ecg_c1_moe_best.pth` incluye ambas cabezas de reconstruccion y permite reanudar el preentrenamiento o experimentar con la funcion de perdida.
- Extraccion de caracteristicas para modelos aguas abajo: el encoder puede usarse congelado para generar embeddings de latidos o ventanas que alimenten clasificadores ligeros (SVM, regresion logistica) en entornos con pocos datos etiquetados.
- Comparacion de criterios de seleccion de checkpoint: al publicarse cinco checkpoints (mejor perdida total, mejor MSE espectral, mejor SmoothL1 cruda, mejor macro por ruta y el final), un equipo puede evaluar cual de ellos transfiere mejor a su tarea concreta antes de fijar el modelo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye metricas de validacion del propio preentrenamiento en la epoca 33:

| Metrica | Valor | Referencia |
|---|---|---|
| Perdida total | 0,1827 | — |
| MSE espectral | 0,2562 | — |
| NMSE espectral | 0,256 | 1,0 = predecir cero |
| Pearson r espectral | 0,851 | 1,0 = perfecto |
| SmoothL1 cruda | 0,1092 | — |
| NMSE cruda | 0,255 | 1,0 = predecir cero |
| Pearson r cruda | 0,845 | 1,0 = perfecto |
| Total macro por ruta | 0,2041 | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 30,08 M de parametros en fp32 el modelo ocupa aproximadamente 120 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia; para fine-tuning se recomienda una GPU con 8 GB o mas (RTX 3060, RTX 4070, RTX 4090, A100, H100) en funcion del tamano de lote y de la longitud de ventana.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna, dado el reducido numero de parametros.
- Opciones de despliegue: al ser un modelo PyTorch (`.pth`), se sirve con PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no procede para un modelo de senal).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de ECG preentrenados ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Los sesgos conocidos no estan documentados en la informacion disponible.
- Riesgo de alucinacion no aplicable al ser un modelo de senal, si bien las reconstrucciones pueden ser imprecisas en segmentos con ruido o artefactos.
- El frontend wavelet y el patcher solo transfieren si el montaje coincide exactamente con una de las dos rutas (`L12_500` o `L1_250`); en cualquier otro caso deben construirse de nuevo.
- La validacion esta dominada por los corpus mas grandes, por lo que el modelo puede especializarse hacia los corpus pequenos y mover las metricas macro y ponderada en direcciones opuestas.
- No se especifican los corpus publicos utilizados ni su composicion, lo que limita la evaluacion de sesgos demograficos o de dominio.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las licencias de los corpus de preentrenamiento, no detalladas en la model card.
- El modelo no es un modelo de lenguaje: no soporta texto, tool calling ni agentes.
- El nombre del script de exportacion (`export_eeg_pretrained_encoder.py`) es historico y hace referencia a EEG, aunque el modelo es de ECG.

## Enlaces

- Hugging Face: https://huggingface.co/ForeverBlue/ECG
