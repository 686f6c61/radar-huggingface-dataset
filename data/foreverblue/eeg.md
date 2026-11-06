# ForeverBlue/EEG

## Resumen

EEG C1 es un codificador transformer preentrenado para senales electroencefalograficas (EEG), desarrollado por el usuario ForeverBlue y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: es un modelo de representacion de biosenales que se entrena de forma auto-supervisada mediante un autoencoder enmascarado con doble reconstruccion (espectral y de forma de onda cruda). Su proposito es servir como base preentrenada que se pueda afinar para tareas downstream de EEG como clasificacion de estados, deteccion de artefactos o decodificacion de potenciales evocados.

El modelo tiene 30,3 millones de parametros, de los cuales 25,22 M (83,2%) corresponden a un transformer compartido. La innovacion principal es que una unica red troncal sirve a cuatro montajes de electrodos distintos (128 canales a 512 Hz, 64 a 256 Hz, 32 a 512 Hz y 19 a 256 Hz) mediante frontends wavelet especificos de cada ruta y una embedding de identidad de canal basada en el nombre del electrodo, no en su indice. Esto permite reutilizar el conocimiento entre configuraciones de hardware heterogeneas.

Es relevante porque el preentrenamiento auto-supervisado en EEG esta menos maduro que en texto o vision, y la mayoria de los modelos publicos estan atados a un unico montaje. La separacion explicita entre lo que transfiere (transformer y embedding de canal) y lo que no (frontends wavelet y patchers ligados a la ruta) facilita el afinado en montajes nuevos sin reutilizar pesos incompatibles. El repositorio ocupa 0,6 GB e incluye varios checkpoints y la curva de entrenamiento completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compartido con frontends wavelet especificos de ruta y doble cabecera de reconstruccion (autoencoder enmascarado) |
| Parametros totales | 30,30 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud de ventana de EEG; el modelo opera sobre parches de senal, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de biosenales, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`) |

Desglose de parametros del checkpoint completo:

| Componente | Parametros | Porcentaje |
|---|---|---|
| Transformer compartido | 25,22 M | 83,2% |
| Embedding de nombre de canal | 0,02 M | 0,1% |
| Proyeccion de canal | 0,03 M | 0,1% |
| Frontends wavelet (4 rutas) | 3,37 M | 11,1% |
| Patchers (ambas tasas) | 0,20 M | 0,7% |
| Decoder espectral | 0,72 M | 2,4% |
| Decoder crudo | 0,72 M | 2,4% |

## Arquitectura y entrenamiento

El modelo es un transformer compartido que recibe representaciones de parches de EEG y las procesa con una embedding de identidad de canal aprendida a partir del nombre del electrodo (por ejemplo, Fz, Cz, Pz), lo que lo hace invariante al orden o al indice del canal en el montaje. Cada una de las cuatro rutas de entrada dispone de un frontend wavelet propio que transforma la senal cruda en parches en el dominio tiempo-frecuencia, y de un patcher con longitud de parche adaptada a la tasa de muestreo de la ruta. La ruta `E128_512` opera con 128 canales a 512 Hz, `E64_256` con 64 a 256 Hz, `E32_512` con 32 a 512 Hz y `E19_256` con 19 a 256 Hz.

El preentrenamiento es auto-supervisado con enmascarado aplicado antes del frontend wavelet, a una tasa del 70%, y una funcion de perdida de doble reconstruccion: `0.5*L_spec + 0.5*L_raw + 0.001*L_foldKL`. Una cabecera predice parches wavelet plegados y normalizados por parche; la otra predice la forma de onda EEG preprocesada de los mismos parches enmascarados. El termino KL actua como regularizador ligero. Se entreno durante 60 epocas (46.080 actualizaciones del optimizador) sobre una mezcla de corpus publicos de EEG. No se documenta en la informacion disponible el numero exacto de tokens ni la composicion detallada del dataset, ni si hubo RLHF o DPO (no aplica en este dominio). La validacion final reporta una correlacion de Pearson de 0,831 en la cabecera espectral y 0,847 en la cruda, con NMSE de 0,305 y 0,278 respectivamente, y una perdida total de 0,2488.

## Capacidades

- Extraccion de representaciones latentes de senales EEG multi-montaje a partir de ventanas de senal cruda.
- Reconstruccion de parches wavelet enmascarados (objetivo espectral) y de la forma de onda EEG preprocesada (objetivo crudo).
- Transferencia del transformer compartido y de la embedding de canal a montajes nuevos: estos componentes siempre se cargan al afinar.
- Adaptacion a cuatro configuraciones de electrodos predefinidas mediante frontends wavelet especificos de ruta.
- Uso como base para tareas downstream supervisadas (clasificacion, regresion, deteccion) tras anadir una cabecera de tarea.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision ni de audio.
- No se documenta un modo de pensamiento (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Clasificacion de estados mentales o cognitivos (carga mental, sueno, vigilia): se extraen las representaciones del transformer sobre ventanas de EEG y se entrena una cabecera lineal o MLP sobre ellas; el preentrenamiento auto-supervisado reduce la necesidad de datos etiquetados, que en EEG suelen ser escasos.
- Deteccion de artefactos (parpadeos, movimientos oculares, actividad muscular): el modelo reconstruye la senal cruda, de modo que la discrepancia de reconstruccion puede usarse como senal de anomalia o como entrada para un clasificador de artefactos afinado.
- Decodificacion de potenciales evocados en paradigmas BCI: el transformer compartido procesa ventanas de multiples canales y puede afinarse para predecir la clase de estimulo a partir de respuestas evocadas, reutilizando el conocimiento de los cuatro montajes de preentrenamiento.
- Analisis de sueno y electroencefalografia clinica: con montajes de 19 canales a 256 Hz (ruta `E19_256`, compatible con el sistema internacional 10-20) se puede afinar el modelo para estadiaje de sueno o deteccion de eventos epileptiformes, aprovechando que esa ruta esta cubierta de forma nativa.
- Investigacion en neurociencia computacional: el checkpoint completo permite continuar el preentrenamiento con corpus propios o analizar las representaciones internas por canal, gracias a la embedding de nombre de electrodo que hace comparables electrodos equivalentes entre sujetos y montajes.
- Sistemas de monitorizacion con hardware de 32 o 64 canales: las rutas `E32_512` y `E64_256` permiten reutilizar el frontend wavelet nativo y el transformer sin reentrenar desde cero, lo que abarata el ajuste a dispositivos comerciales de EEG de alta densidad.
- Filtrado y reconstruccion de senal: las cabeceras de reconstruccion, aunque son de preentrenamiento, permiten evaluar la calidad de las representaciones y sirven como linea base para tareas de imputacion de canales o denoising.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de validacion del ultimo epoca del preentrenamiento, no benchmarks de tareas downstream:

| Metrica | Valor | Interpretacion |
|---|---|---|
| Perdida total | 0,2488 | — |
| MSE espectral | 0,3046 | — |
| NMSE espectral | 0,305 | 1,0 equivaldria a predecir cero |
| Pearson r espectral | 0,831 | 1,0 seria perfecto |
| SmoothL1 crudo | 0,1930 | — |
| NMSE crudo | 0,278 | 1,0 equivaldria a predecir cero |
| Pearson r crudo | 0,847 | 1,0 seria perfecto |
| Total macro por ruta | 0,2403 | media no ponderada de las cuatro rutas |

No se han publicado resultados de benchmarks downstream (por ejemplo, en tareas estandar de EEG como TUH EEG, Sleep-EDF o BCI Competition) en la informacion disponible. El autor advierte que las dos perdidas no son comparables entre si (una es MSE sobre coeficientes wavelet normalizados, la otra SmoothL1 sobre voltios z-scoreados) y que la validacion esta dominada por los dos corpus mas grandes, por lo que las filas macro y ponderada pueden divergir si el modelo se especializa hacia las rutas minoritarias.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30,3 M de parametros en precision completa (FP32), los pesos ocupan aproximadamente 121 MB; en FP16, unos 61 MB. La memoria adicional depende de la longitud de la ventana de EEG y del tamano de lote, pero el modelo es muy ligero en comparacion con LLMs.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una RTX 3060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problemas; para lotes grandes o ventanas largas conviene una GPU con al menos 8 GB de VRAM.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con soporte CUDA (GTX 1060 en adelante), asi como en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un modelo PyTorch con pesos `.pth`, se carga directamente con `torch.load`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. El repositorio incluye `downstream.py` y `scripts/export_eeg_pretrained_encoder.py` para cargar y exportar subconjuntos del checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la longitud de la ventana, el numero de canales y el hardware.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de preentrenamiento auto-supervisado en EEG (por ejemplo, BENDR, LaBraM o EEGPT) que permitan una comparacion rigurosa de parametros, contexto, rendimiento o licencia. Por tanto, la comparativa se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EEG C1 | 30,3 M | no disponible | Apache 2.0 | Hugging Face (ForeverBlue/EEG) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de biosenales, no de lenguaje: no genera texto, no responde a instrucciones y no soporta tool calling ni razonamiento conversacional.
- El preentrenamiento se realizo sobre una mezcla de corpus publicos de EEG cuya composicion detallada no se documenta; pueden existir sesgos de poblacion (edad, patologia, dispositivos) que se transfieran a las tareas downstream.
- La validacion esta dominada por los dos corpus mas grandes, segun advierte el propio autor, por lo que el rendimiento en las rutas minoritarias (`E32_512` y `E19_256`) puede ser inferior al promedio reportado.
- Los frontends wavelet y los patchers solo son compatibles con la ruta exacta para la que se entrenaron (mismo numero de electrodos y misma longitud de parche); en montajes distintos se descartan y hay que construir un frontend nuevo, lo que reduce la ventaja del preentrenamiento.
- Las cabeceras de reconstruccion son exclusivas del preentrenamiento y se eliminan al afinar; usarlas por error contra el objetivo pretexto es un fallo que el script de exportacion previene explicitamente.
- No se han publicado resultados en tareas downstream, por lo que no hay evidencia publica de que la transferencia supere a un entrenamiento desde cero en problemas concretos.
- Riesgo de sobreajuste en datasets pequenos: aunque el preentrenamiento mitiga la escasez de etiquetas, el transformer tiene 25,22 M de parametros y requiere regularizacion al afinar.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; conviene revisar la procedencia de los corpus publicos de preentrenamiento para cumplir con sus licencias originales.
- No hay informacion sobre cuantizacion ni formatos optimizados, lo que limita el despliegue en entornos con restricciones de memoria muy estrictas sin trabajo adicional de conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ForeverBlue/EEG
- Repositorio de codigo fuente: no disponible en la informacion proporcionada (la model card menciona `downstream.py` y `scripts/export_eeg_pretrained_encoder.py`, pero no se indica la URL del repositorio)
- Paper o publicacion tecnica: no disponible
- Blog o demo: no disponible
