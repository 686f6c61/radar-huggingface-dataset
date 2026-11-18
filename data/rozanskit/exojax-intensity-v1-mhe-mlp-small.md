# RozanskiT/exojax-intensity-v1-mhe-mlp-small

## Resumen

RozanskiT/exojax-intensity-v1-mhe-mlp-small es un emulador neuronal de intensidades específicas para espectroscopia de atmósferas exoplanetarias, desarrollado por RozanskiT y publicado bajo licencia MIT. El modelo sustituye la evaluacion directa de un codigo de transferencia radiativa (ExoJAX) por una red MLP de 672.019 parametros que predice la intensidad especifica absoluta y dependiente del angulo sobre la rejilla atmosferica PayneTraining version-1 de ExoJAX, en cuatro intervalos de longitud de onda de la banda K.

El modelo resuelve un cuello de botella clasico en la caracterizacion atmosferica de exoplanetas: la evaluacion de espectros sinteticos para ajuste por cadenas de Markov o inferencia variacional es computacionalmente costosa. Al ofrecer una aproximacion diferenciable en JAX, con soporte de JIT y gradientes automaticos, permite construir verosimilitudes compiladas y acelerar la inferencia de parametros atmosfericos (temperatura, abundancias moleculares, presion de nube y angulo de vision) en varios ordenes de magnitud.

La version 0.1.0 corresponde al checkpoint final de 1.000.000 de pasos, entrenado con astro-emulators-toolkit 0.2.2. No es un modelo de lenguaje: es un emulador cientifico de proposito especifico, sin capacidades de generacion de texto, codigo ni conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (mhe-mlp, multi-head ensemble MLP) sobre entradas fisicas normalizadas; emulador de funcion |
| Parametros totales | 672.019 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada: 8 parametros fisicos escalares + rejilla de longitudes de onda) |
| Tipos de cuantizacion | no disponible; pesos en float32 |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | bundle de astro-emulators-toolkit (pesos JAX/float32); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa con cabeceras multiples (mhe-mlp) que mapea ocho coordenadas atmosfericas escalares (T0, alpha, log_vmr_co, log_vmr_h2o, log_vmr_ch4, log_vmr_hf, log_p_cloud, mu) y una rejilla de longitudes de onda en vacio (en angstrom) a intensidades especificas por numero de onda, en unidades erg s^-1 cm^-2 sr^-1 (cm^-1)^-1. El pipeline interno compila conjuntamente la normalizacion de etiquetas, la red, la desnormalizacion y la exponenciacion, de modo que la salida ya es intensidad fisica. Los pesos y las etiquetas normalizadas permanecen en float32, mientras que las longitudes de onda y las intensidades de salida usan float64, que debe habilitarse con `jax_enable_x64` antes de convertir las longitudes de onda a arrays JAX.

El entrenamiento se realizo sobre la rejilla atmosferica PayneTraining version-1 de ExoJAX, con un checkpoint final de 1.000.000 de pasos producido por astro-emulators-toolkit 0.2.2. Los rangos de entrenamiento documentados son: T0 entre 1000 y 1700 K, alpha entre 0,05 y 0,20, log10 de VMR de CO, H2O y CH4 entre -6 y -1, log10 de VMR de HF entre -10 y -5, log10 de presion de nube local entre -3 y 5 bar, y mu en (0, 1]. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de espectros de entrenamiento ni si se emplearon tecnicas de regularizacion o validacion cruzada mas alla de las metricas sobre pixeles nativos.

## Capacidades

- Prediccion de intensidad especifica absoluta y dependiente del angulo para una atmosfera y un angulo de vision dados, en cuatro intervalos de longitud de onda de la banda K.
- Evaluacion vectorizada: acepta parametros fisicos con forma (8,) o (B,8) y una rejilla de longitudes de onda compartida (Q,), devolviendo intensidades (B,Q).
- Compatibilidad con `jax.jit` para reutilizar la compilacion entre llamadas con las mismas formas.
- Diferenciabilidad automatica con JAX, lo que permite calcular gradientes respecto a los parametros atmosfericos y construir verosimilitudes compiladas.
- Soporte de ejecucion asincrona con `.block_until_ready()` para medir tiempos reales.
- Capacidad de generar espectros de alta resolucion muestreando 2.500 longitudes de onda uniformes por chip (10.000 puntos en total).
- No incluye tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Ajuste de parametros atmosfericos por inferencia bayesiana: el emulador se integra en una verosimilitud compilada con JAX y permite muestrear con MCMC o inferencia variacional sobre T0, alpha, abundancias y presion de nube, sustituyendo llamadas costosas a ExoJAX por evaluaciones de red neuronal diferenciables.
- Analisis de espectros de transmision y emision de exoplanetas en banda K: se predicen intensidades especificas por angulo y se comparan con observaciones antes de convolucion instrumental y desplazamiento Doppler.
- Estudios de sensibilidad y propagacion de incertidumbres: al ser diferenciable, permite calcular derivadas de la intensidad respecto a cada parametro atmosferico para analisis de Fisher o estimacion de barras de error.
- Generacion rapida de bibliotecas sinteticas de espectros: se pueden barrer rejillas de temperatura, abundancias y angulos para construir datasets de entrenamiento o tablas de referencia sin ejecutar el codigo radiativo completo.
- Prototipado de pipelines de caracterizacion atmosferica: el ejemplo `likelihood.py` con ruido gaussiano sintetico del 2 % sirve como plantilla reproducible para validar un flujo de ajuste antes de pasar a datos reales.
- Visualizacion e inspeccion interactiva: el script `midpoint.py --plot` permite variar T0 o mu y recalcular el espectro en tiempo real, util para docencia, exploracion de lineas espectrales y diagnostico de rangos de validez.
- Aceleracion de la inferencia en produccion cientifica: al compilar la normalizacion, la red y la exponenciacion en una sola funcion JIT, se reducen los tiempos por evaluacion en pipelines de ajuste de gran volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las metricas de validacion se midieron sobre pixeles nativos, pero no incluye los valores numericos ni comparaciones con otros emuladores.

## Requisitos de hardware

- VRAM estimada: muy reducida; con 672.019 parametros en float32, los pesos ocupan aproximadamente 2,7 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU compatible con JAX (NVIDIA con CUDA, AMD con ROCm o Apple Silicon con Metal); no requiere A100 ni H100.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con soporte JAX.
- Opciones de despliegue: el bundle de astro-emulators-toolkit con `Emulator.from_bundle(".")` y `make_predictor`; ejecucion via JAX con JIT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numerica; la model card indica que la primera llamada incluye compilacion y que las llamadas posteriores con las mismas formas reutilizan la funcion compilada. Se recomienda medir con `.block_until_ready()`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros emuladores de ExoJAX ni modelos comparables de la misma categoria con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Validez restringida a los rangos de entrenamiento: T0 de 1000 a 1700 K, alpha de 0,05 a 0,20, VMR de CO, H2O y CH4 de -6 a -1, VMR de HF de -10 a -5, log10 de presion de nube de -3 a 5 y mu en (0, 1]. Fuera de estos rangos las predicciones no estan garantizadas.
- Solo cubre cuatro intervalos de la banda K; no es un emulador de espectro completo.
- Las salidas son intensidades especificas por numero de onda antes de convolucion instrumental, desplazamiento Doppler, integracion angular y normalizacion de disco; no hay salida de continuo separada.
- Usar una coordenada de longitud de onda no convierte la salida a unidades por angstrom; la unidad sigue siendo por cm^-1.
- Requiere habilitar float64 (`jax_enable_x64`) antes de convertir longitudes de onda a arrays JAX; de lo contrario la precision puede degradarse.
- Cambios en la forma del lote o de la rejilla pueden provocar recompilaciones adicionales y latencias puntuales.
- Riesgo de extrapolacion silenciosa: al ser una red neuronal, puede producir valores fisicamente implausibles fuera del dominio de entrenamiento sin aviso explicito.
- No se documentan sesgos en el sentido estadistico habitual ni riesgos de alucinacion linguistica, pero si el riesgo de error de aproximacion del emulador respecto al codigo radiativo de referencia.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda citar el modelo y verificar la licencia de los datos y del codigo ExoJAX subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RozanskiT/exojax-intensity-v1-mhe-mlp-small
- Repositorio de pesos y scripts de ejemplo: incluido en el bundle del repositorio de Hugging Face (no se dispone de URL separada)
- astro-emulators-toolkit: no disponible en la informacion proporcionada
- ExoJAX: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
