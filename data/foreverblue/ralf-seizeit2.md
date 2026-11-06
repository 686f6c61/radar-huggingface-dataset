# ForeverBlue/RALF-SeizeIT2

## Resumen

RALF-SeizeIT2 es un modelo multimodal de deteccion de crisis epilepticas desarrollado por ForeverBlue. Combina tres codificadores preentrenados de forma independiente (EEG, ECG y sEMG) mediante RALF (Reliability-Aware Latent Fusion), un mecanismo de fusion que estima una fiabilidad por modalidad y muestra, y utiliza esa estimacion para ponderar la atencion cruzada entre modalidades. El modelo se evalua sobre SeizeIT2, un conjunto de datos de EEG retroauricular, ECG y EMG del deltoides.

El modelo resuelve el problema de la fusion de senales biomedicas heterogeneas con calidad variable: en lugar de asumir que todas las modalidades aportan informacion igual de fiable, RALF detecta cuando una senal esta corrupta (ruido, deriva, saturacion o perdida de canal) y reduce dinamicamente su peso en la decision final. Esto es relevante en entornos clinicos reales, donde los sensores portatiles fallan o se degradan con frecuencia.

La arquitectura es un transformer de fusion con atencion cruzada sobre tokens resumen de cada modalidad, con los codificadores congelados y un total de 69,4 M de parametros. El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para investigacion en deteccion de crisis, no como dispositivo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con fusion por atencion cruzada (RALF) sobre tres codificadores C1 congelados (EEG, ECG, sEMG) |
| Parametros totales | 69,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 4 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de senal, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo ensambla tres codificadores preentrenados independientes, uno por modalidad (EEG, ECG y sEMG), que permanecen congelados durante el entrenamiento de la fusion. Cada codificador entrega un pequeno conjunto de tokens resumen (4 tokens por modalidad) a un nucleo de fusion RALF de anchura 256, 8 tokens de fusion, profundidad 2 y 8 cabezas de atencion. RALF predice una fiabilidad por modalidad y muestra, condiciona con ella la atencion cruzada, enmascara las modalidades ausentes y anade un residuo de logits unimodales ponderados por fiabilidad.

El entrenamiento usa un learning rate de 0,0003, batch de 32, hasta 60 epocas con paciencia de 10, precision bf16 y semilla 42. La funcion de perdida combina entropia cruzada de la tarea, 0,2 veces la entropia cruzada unimodal, 1,0 veces el error cuadratico medio de fiabilidad y 1,0 veces la consistencia entre subconjuntos de modalidades. Como aumento de datos, cada modalidad se corrompe con probabilidad 0,5 y se elimina con probabilidad 0,3. Solo se ejecuto un entrenamiento con una semilla; los resultados publicados corresponden a esa unica ejecucion. El checkpoint liberado es el de la epoca 5 (contada desde 0), seleccionado por AUPRC de validacion (0,380).

## Capacidades

- Deteccion binaria de crisis epilepticas (clases `background` y `seizure`) a partir de ventanas de 4 s.
- Fusion de tres modalidades fisiologicas: EEG retroauricular, ECG y EMG del deltoides.
- Estimacion de fiabilidad por modalidad y muestra, que permite identificar senales degradadas.
- Tolerancia a modalidades ausentes: el modelo enmascara las que no estan presentes y sigue operando con las restantes.
- Robustez ante corrupciones de senal (ruido, deriva, saturacion, perdida de canal) con degradacion controlada del rendimiento.
- No soporta tool calling, agentes, generacion de texto ni capacidades multilingues: es un clasificador de senal, no un modelo de lenguaje.

## Casos de uso

- Monitorizacion ambulatoria de pacientes con epilepsia: el modelo procesa ventanas de 4 s de EEG retroauricular, ECG y EMG para detectar crisis en registros continuos, con sensibilidad del 74,4 % a 11 falsas alarmas por hora, adecuada para sistemas de alerta con revision humana.
- Investigacion clinica sobre fusion de senales: sirve como linea base reproducible para estudiar como la fiabilidad por modalidad afecta a la deteccion, gracias a los resultados publicados por subconjunto de modalidades y por condicion de corrupcion.
- Sistemas de alerta con sensores portatiles: la capacidad de enmascarar modalidades ausentes permite desplegarlo en dispositivos donde no siempre se dispone de los tres sensores, manteniendo AUPRC de 0,394 con solo EEG y ECG.
- Control de calidad de senal: la fiabilidad estimada por RALF (que cae de 0,91 a 0,29 con un canal EEG defectuoso) puede usarse como indicador de sensores degradados en pipelines de adquisicion.
- Evaluacion de robustez de modelos biomedicos: el conjunto de pruebas con corrupciones a severidad 0,7 (ruido, deriva, saturacion, dropout) proporciona un protocolo replicable para comparar estrategias de fusion.
- Docencia y prototipado en ingenieria biomedica: el modelo, con 69,4 M de parametros y pesos en un unico fichero de 0,3 GB, es ligero para experimentacion en laboratorio.

## Benchmarks y rendimiento

Resultados sobre el split oficial de SeizeIT2 (pacientes sub-097 a sub-125 como test, nunca vistos; 778 grabaciones, 2.912 h, 181 crisis; puntuacion any-overlap con medias por grabacion):

| Metrica | Valor |
|---|---|
| Sensibilidad a <= 2 falsas alarmas/h | 32,0 % |
| Sensibilidad a <= 6,22 falsas alarmas/h | 58,1 % |
| Sensibilidad a <= 11 falsas alarmas/h | 74,4 % |
| AUROC (epocas, criterio del paper del dataset) | 0,741 |
| AUPR (epocas, criterio del paper del dataset) | 0,0121 |

Resultados a nivel de ventana (4 s, fondo submuestreado a 30 por hora):

| Modalidades presentes | AUPRC | AUROC |
|---|---|---|
| EEG + ECG + EMG | 0,399 | 0,773 |
| EEG + ECG | 0,394 | 0,768 |
| EEG + EMG | 0,265 | 0,691 |
| ECG + EMG | 0,337 | 0,746 |
| EEG | 0,252 | 0,692 |
| ECG | 0,313 | 0,746 |
| EMG | 0,192 | 0,615 |

Robustez con una modalidad corrompida a severidad 0,7 (conjunto completo):

| Condicion | AUPRC | Fiabilidad EEG | Fiabilidad ECG | Fiabilidad EMG |
|---|---|---|---|---|
| Limpio | 0,399 | 0,91 | 0,85 | 0,91 |
| Ruido en EEG | 0,368 | 0,63 | 0,85 | 0,91 |
| Canal EEG defectuoso | 0,358 | 0,29 | 0,85 | 0,91 |
| Deriva en EEG | 0,332 | 0,32 | 0,85 | 0,91 |
| Saturacion ECG | 0,367 | 0,91 | 0,33 | 0,91 |
| Ruido en ECG | 0,395 | 0,91 | 0,65 | 0,91 |
| Perdida de EMG | 0,403 | 0,91 | 0,85 | 0,29 |
| Ruido en EMG | 0,398 | 0,91 | 0,85 | 0,24 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos de deteccion de crisis.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 69,4 M de parametros en bf16 el peso ronda los 0,14 GB, mas activaciones de las ventanas de 4 s.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos 2-4 GB de VRAM deberia ser suficiente, pero el autor no lo especifica.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no hay confirmacion del autor.
- Opciones de despliegue: PyTorch con el codigo de PhysioWave (`physiowave.fusion.train.build_model`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de deteccion de crisis ni con alternativas de fusion multimodal de senales biomedicas.

## Limitaciones y advertencias

- Un solo entrenamiento con una sola semilla: los resultados publicados corresponden a una unica ejecucion, sin media ni desviacion entre semillas.
- AUPR en epocas muy bajo (0,0121) segun el criterio del paper del dataset, lo que refleja el fuerte desbalance de clases.
- Sensibilidad limitada a bajas tasas de falsas alarmas: solo 32,0 % a <= 2 falsas alarmas/h, insuficiente para uso clinico autonomo.
- Dependencia del preprocesado: el modelo se reconstruye desde las ventanas preparadas con `Fusion/seizeit2_prep.py`; no es un checkpoint autonomo que se pueda cargar sin el pipeline de datos.
- Necesita los tres checkpoints de preentrenamiento de los codificadores para construir el modelo (aunque no para ejecutarlo una vez construido).
- Entrenado exclusivamente sobre SeizeIT2 (EEG retroauricular, ECG y EMG del deltoides); no hay evidencia de generalizacion a otras montajes, poblaciones o dispositivos.
- No es un dispositivo medico: no debe usarse para diagnostico ni decision clinica sin validacion regulatoria.
- Licencia Apache 2.0 permite uso comercial del codigo y pesos, pero la responsabilidad sobre el uso clinico recae en el usuario.
- No hay informacion sobre sesgos demograficos ni sobre el rendimiento por subgrupos de pacientes.

## Enlaces

- Hugging Face: https://huggingface.co/ForeverBlue/RALF-SeizeIT2
- Codigo: https://github.com/ForeverBlue816/PhysioWave (documentacion en `docs/fusion.md`)
- Codificador EEG: https://huggingface.co/ForeverBlue/EEG
- Codificador ECG: https://huggingface.co/ForeverBlue/ECG
- Codificador EMG: https://huggingface.co/ForeverBlue/EMG
