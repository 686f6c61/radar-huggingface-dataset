# MHkhan50/ptbxl-ecg-resnet

## Resumen

PTB-XL ECG ResNet es una red residual unidimensional compacta (aproximadamente 0,19 M de parámetros) publicada por Muzammal Hussain (usuario MHkhan50) que clasifica electrocardiogramas de 10 segundos y 12 derivaciones, muestreados a 100 Hz, en las cinco superclases diagnósticas del conjunto de datos PTB-XL: NORM (ECG normal), MI (infarto de miocardio), STTC (alteración del segmento ST/onda T), CD (trastorno de conducción) e HYP (hipertrofia). El modelo resuelve una tarea de clasificación multietiqueta sobre señal biomédica, no de generación de texto, y se distribuye como checkpoint de PyTorch acompañado de la definición de la red, un fichero de configuración con normalización, umbrales y reglas de abstención, y métricas de test.

Su relevancia actual reside en dos factores. Por un lado, ofrece un punto de referencia reproducible y muy ligero para la tarea de superclases de PTB-XL, con particiones oficiales a nivel de paciente y umbrales congelados elegidos en validación, lo que facilita comparaciones honestas con arquitecturas mayores. Por otro lado, incorpora un mecanismo de predicción selectiva: con un umbral de confianza de 0,8 el modelo etiqueta el 84,5 % de los registros y deja el resto para revisión experta, un patrón de diseño cada vez más habitual en aplicaciones clínicas asistidas.

El modelo es explícitamente de uso exclusivo en investigación y no constituye un dispositivo médico. No es un modelo de lenguaje ni procesa texto: sus entradas son tensores de forma (12, 1000) en milivoltios y sus salidas son cinco probabilidades independientes obtenidas mediante sigmoide.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red residual (ResNet) unidimensional para señal ECG, 3 bloques con canales (32, 64, 128) y dropout 0,2 |
| Parámetros totales | Aproximadamente 0,19 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana fija de entrada de 10 s × 12 derivaciones a 100 Hz (tensor 12×1000) |
| Tipos de cuantización | No disponible (checkpoint PyTorch en precisión de entrenamiento; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | No aplica (modelo sobre señal fisiológica, no lingüístico) |
| Licencia | CC BY 4.0 para los pesos; código MIT |
| Formato de pesos | Checkpoint PyTorch `.pt` (diccionario con `model_state_dict`, `model_name`, `config` y `labels`), cargable con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

La red es una ResNet 1D con tres etapas de canales 32, 64 y 128 y dropout de 0,2, que consume directamente la señal normalizada por derivación (media y desviación típica en mV calculadas sobre el pliegue de entrenamiento) y produce cinco logits, uno por superclase, con activación sigmoide y pérdida de entropía cruzada binaria. El repositorio incluye `model.py` con la definición exacta, `config.json` con los argumentos de arquitectura, el orden de derivaciones, la normalización, los umbrales por etiqueta y la regla de abstención, y el checkpoint `resnet_s23_best.pt`.

El entrenamiento utilizó PTB-XL 1.0.3 a 100 Hz, restringido a los 21 388 registros con al menos una superclase diagnóstica, con las particiones oficiales por paciente: pliegues 1–8 para entrenamiento (17 084 registros), pliegue 9 para validación (2 146) y pliegue 10 para test (2 158), sin pacientes compartidos entre particiones. Se optimizó con AdamW (lr 1e-3, weight decay 1e-4), tamaño de lote 32 y parada temprana sobre la pérdida de validación (paciencia 5, máximo 40 épocas); esta semilla se detuvo tras 14 épocas en una GPU T4 de Kaggle. Se entrenaron cinco semillas (17, 23, 31, 47, 59) y se publicó la semilla 23 por tener la menor pérdida de validación (0,2662), sin selección sobre resultados de test. Los umbrales por etiqueta se eligieron en validación y se congelaron. No se documenta uso de RLHF ni de ajuste por preferencias, algo esperable en un modelo discriminativo.

## Capacidades

- Clasificación multietiqueta de ECG de 12 derivaciones en las cinco superclases de PTB-XL (NORM, MI, STTC, CD, HYP) con probabilidades independientes por clase.
- Predicción selectiva: la regla de abstención descarta los registros cuya confianza media (máximo entre p y 1−p promediado) queda por debajo de 0,8, derivando el 15,5 % restante a revisión.
- Umbrales por etiqueta precalibrados en validación e incluidos en `config.json`, lo que permite obtener etiquetas binarias sin recalibración adicional.
- Entrada estrictamente fija: 12 derivaciones en el orden especificado, 10 segundos a 100 Hz, unidades en mV.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.
- Inferencia determinista y extremadamente ligera: un único paso hacia delante sobre un tensor de 12×1000.

## Casos de uso

- Triaje preliminar en investigación clínica: el modelo puede prefiltrar grandes cohortes de ECG y marcar los registros con alta probabilidad de MI o STTC para revisión cardiológica, usando la regla de abstención para no etiquetar los casos dudosos.
- Validación de pipelines de adquisición de señal: al ser muy sensible al orden de derivaciones y a las unidades, sirve como prueba de integridad para verificar que un sistema de captura entrega 12 derivaciones a 100 Hz en mV y en el orden correcto.
- Baseline reproducible en publicaciones: con particiones oficiales por paciente, umbrales congelados y métricas de test publicadas, es un punto de comparación barato frente a arquitecturas más grandes en la tarea de superclases de PTB-XL.
- Docencia y prototipado en ingeniería biomédica: su tamaño (0,19 M de parámetros) permite entrenarlo y ejecutarlo en una GPU de consumo o incluso en CPU, lo que lo hace adecuado para cursos y experimentos de clasificación de señal.
- Investigación sobre predicción selectiva: el par umbral de confianza–cobertura (84,5 % de cobertura a 0,8) ofrece un caso concreto para estudiar curvas de riesgo-cobertura en clasificación médica.
- Despliegue embebido en entornos de investigación: el coste computacional mínimo permite integrarlo en dispositivos con recursos limitados para experimentos de monitorización offline, siempre fuera de uso clínico.
- Análisis retrospectivo de bases de datos ECG: permite generar etiquetas automáticas preliminares sobre registros históricos compatibles con el formato PTB-XL para estudios epidemiológicos exploratorios.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el pliegue de test oficial (pliegue 10, 2 158 registros):

| Métrica | NORM | MI | STTC | CD | HYP | Macro |
|---|---|---|---|---|---|---|
| AUROC | 0,941 | 0,927 | 0,931 | 0,920 | 0,904 | 0,925 |

- F1 macro con umbrales elegidos en validación: 0,745.
- Cobertura al umbral de confianza 0,8: 84,5 % de los registros etiquetados.
- Average precision de HYP: 0,68 (la etiqueta más débil).
- Comparación interna del repositorio con ensembles de semillas y 1 000 remuestreos bootstrap a nivel de paciente: ResNet 1D 0,932 [0,924; 0,939] frente a CNN 1D 0,923 [0,915; 0,930], diferencia +0,009 [+0,007; +0,011].

No se han publicado en la información disponible resultados comparativos con modelos externos de la literatura (por ejemplo, xresnet1d101 u otras arquitecturas de referencia sobre PTB-XL).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB con el checkpoint en FP32; el tensor de entrada es de 12×1000 y la red tiene 0,19 M de parámetros.
- GPU recomendadas: ninguna en particular; el modelo se entrenó en una NVIDIA T4 de Kaggle y funciona en cualquier GPU con soporte CUDA, incluidas GTX 1650, RTX 3060 o superiores.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (recomendado, con `torch.load(..., weights_only=True)`); no se documentan exportaciones a ONNX, TorchScript, vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo se espera una latencia de milisegundos por registro en GPU moderna, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto/ventana | AUROC macro (test PTB-XL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PTB-XL ECG ResNet (este modelo) | ~0,19 M | 12×1000, 100 Hz | 10 s fijos | 0,925 | CC BY 4.0 (pesos), MIT (código) | Hugging Face |
| 1D CNN del mismo repositorio | No disponible | 12×1000, 100 Hz | 10 s fijos | 0,923 (ensemble de semillas) | No disponible | Repositorio GitHub del autor |
| Otras arquitecturas de referencia sobre PTB-XL | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación cuantitativa disponible en la información proporcionada es la del propio autor entre su ResNet 1D y su CNN 1D. No se dispone de datos verificables de modelos de terceros para esta tabla.

## Limitaciones y advertencias

- Uso exclusivo en investigación: no es un dispositivo médico y sus salidas no son diagnósticos, triaje ni recomendaciones de tratamiento; no debe emplearse en atención al paciente.
- Un único conjunto de datos de un único centro alemán (grabaciones de 1989–1996) y sin validación externa; el rendimiento en otros dispositivos, poblaciones o condiciones de registro es desconocido.
- Solo cubre las cinco superclases diagnósticas; no detecta ritmos ni afirmaciones finas, y las etiquetas son las del conjunto de datos, no relectas por cardiólogos para este trabajo.
- Entrada rígida: solo 100 Hz, 10 segundos y 12 derivaciones; derivaciones ausentes o intercambiadas y unidades distintas alteran la salida de forma silenciosa.
- HYP es la etiqueta más débil (average precision 0,68), por lo que sus predicciones son las menos fiables.
- Riesgo de falsos negativos y positivos no caracterizado fuera de la distribución de PTB-XL; la regla de abstención mitiga pero no elimina este riesgo.
- Sesgos poblacionales potenciales derivados de la cohorte original, no cuantificados en la información disponible.
- Licencia CC BY 4.0 en los pesos: permite uso comercial con atribución, pero la advertencia de uso exclusivo en investigación y la ausencia de marcado CE o equivalente impiden su uso clínico real.
- No se documentan sesgos lingüísticos por no ser un modelo de lenguaje, ni riesgos de alucinación en el sentido habitual; el riesgo equivalente es la sobreconfianza en etiquetas erróneas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MHkhan50/ptbxl-ecg-resnet
- Repositorio de código, entrenamiento y evaluación: https://github.com/MHKhan50/ptbxl-ecg-superclass-benchmark
- Artículo de PTB-XL: Wagner, P., Strodthoff, N., Bousseljot, R.-D., Kreiseler, D., Lunze, F. I., Samek, W. and Schaeffter, T. (2020). PTB-XL, a large publicly available electrocardiography dataset. Scientific Data 7, 154. https://doi.org/10.1038/s41597-020-0495-6
- ORCID del autor: https://orcid.org/0009-0001-2570-5686
