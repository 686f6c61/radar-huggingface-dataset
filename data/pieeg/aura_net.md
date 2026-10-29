# pieeg/Aura_Net

## Resumen

AuraNet es una red neuronal convolucional temporal-espacial de pequeno tamano disenada para reconocer gestos de mano a partir de senales de electromiografia de superficie (sEMG) captadas por la pulsera Aura de PiEEG, un dispositivo wearable de 8 canales que muestrea a 250 Hz y que anade acelerometro, giroscopio y magnetometro a 125 Hz. El modelo toma ventanas de 1,0 s con forma `[batch, 250, 8]` (tiempo y despues canal) y devuelve una distribucion softmax sobre seis clases cerradas: `rest`, `fist`, `open`, `pinch`, `point` y `thumb-up`. Dispone ademas de una segunda cabeza, activada con `python train.py --pose`, que regresa una pose de mano de 7 grados de libertad en el rango `[0, 1]` (cinco curvaturas de dedo, pinza y apertura).

El proyecto se publica como baseline oficial del reto "Aura: Calibration-Free EMG Challenge" alojado en Kaggle, de modo que su proposito principal es servir de referencia reproducible para investigadores que trabajan en interfaces musculares sin calibracion. El repositorio incluye el pipeline completo de entrenamiento: lectura de sesiones en `.xlsx` o `.csv`, filtrado causal, escalado por canal, ventaneo con solapamiento, control de calidad de canales, validacion leave-one-session-out (LOSO) y exportacion a ONNX (opset 17) junto con el checkpoint de PyTorch.

Es relevante ahora por dos motivos. Primero, porque la computacion vestible en el borde exige modelos minimos que quepan en microcontroladores o en el propio movil, y AuraNet esta planteado con ese perfil. Segundo, porque el autor ha publicado unicamente la arquitectura y el codigo de entrenamiento: los pesos entrenados (`model.onnx`, `model.pt`) todavia no estan disponibles, lo que condiciona por completo su evaluacion y su uso en produccion en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN temporal-espacial (temporal-spatial CNN) sobre ventanas de sEMG |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: ventana fija de 1,0 s (250 muestras a 250 Hz) por inferencia |
| Tipos de cuantizacion | no disponible; exportacion documentada en ONNX opset 17 y checkpoint PyTorch |
| Idiomas soportados | no aplica (modelo de senales EMG, no de texto); no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) y checkpoint PyTorch (`.pt`); los pesos entrenados aun no se han publicado |
| Entrada | `float32 [batch, 250, 8]`, filtrada y escalada fuera del grafo |
| Salida (clasificador) | softmax sobre 6 clases: `rest`, `fist`, `open`, `pinch`, `point`, `thumb-up` |
| Salida (pose) | 7 grados de libertad en `[0, 1]`: cinco curvaturas de dedo, pinza y apertura |
| Frecuencia de muestreo | 250 Hz (los ficheros con mas de un 2 % de desviacion se remuestrean) |
| Canales | 8 canales EMG (`ch1`...`ch8`), en microvoltios |
| Ventana y salto | 1,0 s (250 muestras) con hop de 0,1 s |

## Arquitectura y entrenamiento

La arquitectura es una CNN temporal-espacial de tipo pequeno, pensada para explotar la estructura de la senal EMG en dos ejes: la evolucion temporal dentro de la ventana de 1 s y la distribucion espacial entre los ocho electrodos de la pulsera. El tensor de entrada se organiza como `[batch, 250, 8]`, es decir, tiempo primero y canal despues. El repositorio no detalla el numero de capas, canales ni parametros de la red, por lo que no es posible reconstruir su coste computacional a partir de la informacion disponible.

El preprocesado es una parte sustancial del metodo y se ejecuta fuera del grafo ONNX: filtro paso banda causal de 20 a 120 Hz de orden 4, filtro elimina banda causal de 45 a 55 Hz de orden 4, notch causal a 100 Hz con Q = 30 y escalado por canal mediante `median(|x|) / 0.6745` con un suelo de `1e-6`. Se descartan los primeros 0,5 s tras el filtrado como calentamiento. El ventaneo usa 1,0 s con hop de 0,1 s; las muestras a menos de 0,2 s de un cambio de etiqueta se dejan sin etiquetar, y una ventana se conserva solo si al menos el 90 % de sus muestras comparten una misma clase y no aparece una segunda. Existe ademas un control de calidad por fichero que descarta canales vacios, planos (std < 1 uV o pico a pico < 2 uV), saturados o incluidos en `drop_channels`, y que informa de la relacion senal-ruido entre agarres activos y reposo.

El entrenamiento se plantea sobre ficheros de sesion (uno por sesion, en `.xlsx` o `.csv`) con columnas `t`, `ch1`...`ch8`, `label` y, opcionalmente, `emg_new` y `label_source` (solo se etiquetan las filas `guided`). La validacion recomendada es leave-one-session-out (`python train.py --loso`), manteniendo la sesion de test sellada, lo que indica que el autor prioriza la generalizacion entre sesiones frente al rendimiento intra-sesion. No se documentan el volumen del dataset, la composicion demografica de los sujetos ni el uso de tecnicas de ajuste tipo RLHF o DPO, que por otra parte no aplican a un problema de clasificacion de senales.

## Capacidades

- Clasificacion de gestos de mano en seis clases cerradas (`rest`, `fist`, `open`, `pinch`, `point`, `thumb-up`) a partir de EMG de superficie de 8 canales.
- Regresion de pose de mano de 7 grados de libertad en `[0, 1]` mediante la cabeza alternativa (`pose.onnx`): cinco curvaturas de dedo, pinza y apertura.
- Inferencia por ventanas deslizantes de 1,0 s con hop de 0,1 s, apta para prediccion casi continua a 10 Hz.
- Exportacion a ONNX opset 17, lo que permite ejecutar el modelo con ONNX Runtime en CPU, movil o dispositivos embebidos.
- Control de calidad de senal integrado en el pipeline (`--qc-only`): deteccion de canales planos, saturados o vacios e informe de SNR.
- Validacion LOSO para medir generalizacion entre sesiones y sujetos.
- Autotest sintetico (`--self-test`) que entrena una epoca sobre tensores sinteticos y verifica que el grafo ONNX carga correctamente.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto, vision, audio o thinking mode: no es un modelo de lenguaje.

## Casos de uso

- Interaccion en realidad virtual y aumentada: la pulsera Aura ya transmite EMG a 250 Hz y el modelo traduce esa senal en gestos discretos, de modo que puede mapearse `pinch` a agarre de objeto o `fist` a menu, sin mandos adicionales y con una ventana de decision de 1 s.
- Rehabilitacion y protesis de mano: la cabeza de pose de 7 grados de libertad proporciona senales continuas de curvatura de dedos y apertura que pueden alimentar el control de una protesis mioelectrica o una aplicacion de seguimiento de progreso terapeutico.
- Teleoperacion de robots: la salida de pose en `[0, 1]` es directamente consumible como vector de comandos para una mano robotica, con la ventaja de que el modelo es lo bastante pequeno para ejecutarse en el equipo local junto al operador.
- Investigacion en interfaces musculo-computador: el repositorio sirve como baseline reproducible del reto de Kaggle, con particionado LOSO y control de calidad documentados, lo que facilita comparar nuevos metodos contra una referencia comun.
- Wearables de bajo consumo: al exportarse a ONNX opset 17 y operar sobre un tensor de 250 x 8 valores float32, el modelo es candidato a ejecutarse en el borde (telefono, Raspberry Pi o microcontrolador con runtime ONNX), evitando enviar senales crudas a la nube.
- Evaluacion y depuracion de hardware EMG: el modo `--qc-only` genera la tabla de canales e informa de SNR y de la proporcion de potencia en la banda 20-120 Hz, util para validar el montaje de electrodos antes de entrenar.
- Docencia y prototipado rapido: el pipeline permite pasar de un fichero de sesion a un `model.onnx` con dos comandos, lo que lo hace util en cursos de procesado de biosenales o en pruebas de concepto de interfaces sin calibracion.
- Investigacion sobre calibracion cero: al estar asociado a un reto explicito de EMG sin calibracion, sirve de punto de partida para estudiar la transferencia entre sesiones y usuarios con el protocolo LOSO ya implementado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitudes por clase, matriz de confusion, F1, error de pose (MAE por grado de libertad) ni resultados de la validacion LOSO, y el propio autor indica que los pesos entrenados todavia no se han publicado. Cualquier cifra de rendimiento que se cite para este modelo en el momento actual seria una extrapolacion no verificada.

## Requisitos de hardware

- VRAM estimada: no publicada. Por el tamano de la entrada (250 x 8 valores float32, unos 8 KB por muestra) y la naturaleza de CNN pequena, es razonable esperar un consumo inferior a 1 GB, pero se trata de una estimacion no confirmada por el autor.
- GPU recomendadas: la model card menciona explicitamente CPU frente a T4 en su seccion de hardware, lo que sugiere que una T4 es suficiente y que la CPU es una alternativa viable. Cualquier GPU consumer moderna (RTX 3060 o superior) queda sobradamente cubierta para entrenamiento.
- GPU consumer: si, el modelo esta pensado para perfiles de computo muy bajos; la inferencia deberia caber en cualquier GPU integrada y, con alta probabilidad, ejecutarse solo en CPU.
- Opciones de despliegue: ONNX Runtime es la via documentada (junto con el checkpoint PyTorch); `infer.py` actua como invocador de una sola ventana. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo generativo de texto.
- Latencia y throughput: no publicados. La cadencia natural del sistema es de 10 predicciones por segundo (hop de 0,1 s), pero no se documenta si el modelo cumple ese presupuesto en CPU.
- Requisito critico de despliegue: el filtrado, el escalado por canal y el calentamiento de 0,5 s viven fuera del grafo. Alimentar microvoltios crudos al ONNX produce resultados invalidos; hay que replicar `infer.py`.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada: la busqueda no devuelve modelos publicos de reconocimiento de gestos con sEMG de 8 canales que incluyan parametros, ventana de entrada y metricas verificables.

| Modelo | Parametros | Ventana de entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuraNet (pieeg/Aura_Net) | no disponible | 1,0 s, 8 canales a 250 Hz | no publicado | MIT | Codigo y pipeline; pesos no publicados |
| Alternativas sEMG de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: no debe confundirse con AURA-Net de AzureMind-AI, un proyecto de segmentacion del cuerpo calloso en resonancia magnetica basado en U-Net que no guarda relacion con este modelo pese a la coincidencia de nombre.

## Limitaciones y advertencias

- Los pesos entrenados no estan publicados: en el momento de la ficha solo existe arquitectura y codigo de entrenamiento. Para usar el modelo hay que entrenarlo con datos propios, lo que exige disponer de sesiones EMG etiquetadas de la pulsera Aura.
- El preprocesado es obligatorio y externo al grafo. Omitir el filtrado causal, el escalado por canal o el calentamiento invalida las predicciones sin que el modelo emita ningun aviso.
- El espacio de salida esta cerrado a seis gestos. Cualquier gesto fuera de esa lista queda sin etiquetar durante el entrenamiento y no se reconocera en inferencia.
- No hay metricas publicadas: se desconoce la exactitud por clase, el comportamiento en sujetos no vistos y la robustez frente a deriva de electrodos o fatiga muscular.
- Los datos de entrenamiento del autor no son publicos y no se documenta su composicion demografica ni antropometrica, por lo que no es posible evaluar sesgos por sexo, edad, tono muscular, vellosidad o condicion cutanea, factores con impacto conocido en la calidad de la senal sEMG.
- La generalizacion a otro hardware EMG distinto de la pulsera Aura no esta validada; el modelo asume 8 canales, 250 Hz y una colocacion concreta de electrodos.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de predicciones espurias con alta confianza ante senales degradadas (canales saturados, movimiento del brazalete o contacto deficiente); el control de calidad debe ejecutarse en produccion.
- La licencia MIT permite uso comercial y modificacion, pero al no haber pesos publicados la practica es que cada usuario debe generar su propio modelo y asumir la responsabilidad sobre los datos con los que lo entrena, incluidos los requisitos eticos y de proteccion de datos de senales biometricas.
- Al ser un modelo de senales, carece por completo de capacidades linguisticas, de razonamiento o de agente; no debe presentarse como sustituto de un LLM en ninguna arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pieeg/Aura_Net
- Reto de Kaggle asociado: https://www.kaggle.com/competitions/vr-calibration-free-emg-challenge-pieeg
- Pagina del producto Aura: https://aura.pieeg.com/
- Web de PiEEG: https://www.pieeg.com/
- Repositorio PiEEG-agent (ecosistema del fabricante, no relacionado directamente con el modelo): https://github.com/pieeg-club/PiEEG-agent
- Proyecto homonimo sin relacion, AURA-Net de segmentacion del cuerpo calloso: https://github.com/AzureMind-AI/Corpus-callosum-segmentation
