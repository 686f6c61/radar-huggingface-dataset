# EmmaScharfmann/france-precipitation-downscaler

## Resumen

France hourly precipitation downscaler es un checkpoint experimental de reduccion de escala (downscaling) de precipitacion desarrollado por EmmaScharfmann. Se trata de una U-Net conjunta espacio-temporal que transforma forzamiento de modelos globales a 0,25° y cadencia de 6 horas en precipitacion horaria probabilistica a 0,1° sobre Francia y su entorno (40-53° N, 6,9° W-11° E, rejilla de 131 × 180). El modelo resuelve el problema de generar detalle temporal y espacial fino a partir de campos meteorologicos de baja resolucion, produciendo un ensemble de 12 campos horarios por ventana.

La relevancia de este checkpoint es limitada por su naturaleza: se trata de un modelo de tutorial entrenado con solo 8 dias de datos (junio y noviembre de 2019), por lo que demuestra el pipeline completo pero no alcanza calidad de produccion. Con aproximadamente 0,62 M de parametros, es un modelo extremadamente compacto que prioriza la viabilidad del flujo de trabajo sobre el rendimiento predictivo.

El modelo emplea una funcion de perdida basada en Fair CRPS con terminos multiescala espaciales, de media de dominio, de acumulacion a 6 horas y de cambio horario con signo, ademas de un termino MSE sobre la media del ensemble. Su objetivo es servir como referencia reproducible para quien quiera entender o extender la metodologia de downscaling probabilistico de precipitacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net conjunta espacio-temporal (`architecture: joint`), anchura base 16, profundidad 3, convoluciones 3D temporales en cada escala, decodifica 12 campos horarios a la vez |
| Parametros totales | ~0,62 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de rejilla, ventanas de 12 horas con solapamiento de 6) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo meteorologico, no linguistico) |
| Licencia | mixed-source-terms (los pesos derivan de ERA5, PARDIG y terreno CERRA y conservan sus terminos) |
| Formato de pesos | `model.pt` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net conjunta espacio-temporal con anchura base 16 y profundidad 3. Emplea convoluciones 3D temporales en cada escala y decodifica simultaneamente 12 campos horarios, lo que permite modelar la evolucion temporal dentro de la ventana. Las entradas son la media intervalica de `tp` (mm) mas los campos en los extremos del intervalo `t2m`, `d2m` (K), `u10m`, `v10m` (m/s), `msl` (Pa) y la fase de la hora dentro de la ventana de 6 horas. Ademas, incorpora covariables estaticas embebidas en el checkpoint: elevacion, elevacion fina menos gruesa, pendientes este/norte, relieve a 500 m, fraccion de tierra, proximidad a costa y cobertura fina, derivadas del terreno CERRA a 5,5 km con respaldo ERA5.

El entrenamiento utiliza forzamiento grueso de ERA5 (0,25°) leido del almacen publico ARCO, y como objetivo PARDIG-NRT (0,1°), la reconstruccion aprendida de precipitacion de Google WeatherNext. Solo se emplearon 8 dias de datos (2019-06-10 a 2019-11-25) y la validacion para seleccion de checkpoint fue el 2020-10-02. La funcion de perdida es Fair CRPS con terminos multiescala espaciales, de media de dominio, de acumulacion a 6 horas y de cambio horario con signo, mas un termino MSE pequeno sobre la media del ensemble. En inferencia, las ventanas de 12 horas se solapan 6 horas y se mezclan con pesos de Hann, y el ruido evoluciona de forma continua para que los miembros no se reinicien en los bordes de ventana.

## Capacidades

- Generacion de precipitacion horaria probabilistica en mm para el intervalo `(t-1h, t]`, no negativa, como ensemble (factor de ruido 8, 4 miembros de entrenamiento).
- Downscaling espacial de 0,25° a 0,1° sobre una rejilla de 131 × 180 que cubre Francia y alrededores.
- Downscaling temporal de forzamiento a 6 horas a salida horaria (12 campos por ventana).
- Produccion de ensembles con evolucion continua del ruido entre ventanas solapadas.
- Integracion de covariables estaticas de terreno (elevacion, pendientes, relieve, costa) embebidas en el checkpoint.
- Validacion de entradas: la funcion `predict` comprueba la rejilla, los canales del predictor y el intervalo de forzamiento de 6 horas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo meteorologico de rejilla, no un modelo de lenguaje.

## Casos de uso

- Prototipado de pipelines de downscaling probabilistico: sirve como referencia funcional para construir un flujo completo desde forzamiento ERA5 hasta precipitacion horaria a 0,1°, validando convenciones de rejilla e intervalos antes de entrenar un modelo con datos reales.
- Docencia y tutoriales sobre CRPS y ensembles meteorologicos: al ser un checkpoint de tutorial con ~0,62 M de parametros, permite ejecutar ejemplos completos en hardware modesto y explicar la funcion de perdida Fair CRPS con terminos multiescala.
- Investigacion metodologica sobre arquitecturas U-Net espacio-temporales: su diseno con convoluciones 3D en cada escala y decodificacion de 12 campos horarios sirve de base para experimentar con variantes de arquitectura.
- Generacion de campos sinteticos de precipitacion para pruebas de sistemas de alerta: permite producir ensembles horarios sobre la rejilla francesa para validar la logica de agregacion y umbrales de un sistema de avisos, sin pretender skill predictivo real.
- Evaluacion comparativa de funciones de perdida: al estar disenado en torno a Fair CRPS con terminos espaciales y temporales, permite medir el efecto de modificar los pesos de cada termino en la calibracion del ensemble.
- Integracion en cadenas de procesamiento geoespacial: su salida en rejilla regular de 0,1° y formato PyTorch facilita conectarla con herramientas de analisis climatico para pruebas de extremo a extremo.
- Base para fine-tuning sobre hindcasts de modelos operativos (IFS, AIFS): el autor senala explicitamente que aplicar el modelo a pronosticos requiere evaluacion y, preferiblemente, ajuste fino estratificado por plazo de prediccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, coherente con un modelo de ~0,62 M de parametros; no se proporciona una cifra concreta en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamano del modelo; no se especifican modelos concretos en la documentacion.
- Cabe en GPU consumer: si, por el reducido numero de parametros; la limitacion practica sera la memoria para los tensores de rejilla (131 × 180 × 12 campos × miembros) y el forzamiento de entrada, no los pesos.
- Opciones de despliegue: el autor documenta uso via `huggingface_hub` y la funcion `predict` del paquete `downscale.precipitation`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de downscaling de precipitacion con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado con solo 8 dias de datos: se espera skill debil y mala calibracion fuera de esas condiciones (junio y noviembre de 2019).
- Entrenado sobre reanalisis: aplicarlo a pronosticos (IFS, AIFS) requiere evaluacion y, preferiblemente, fine-tuning sobre hindcasts estratificados por plazo.
- Sin entradas de satelite ni radar, y sin cabecera local entrenada con estaciones.
- PARDIG, el objetivo de entrenamiento, es una referencia aprendida con debilidades conocidas: Alpes, nieve, llovizna y un tope de tasa de 75 mm/h.
- Un objetivo a 0,1° no puede supervisar detalle real de precipitacion a escala kilometrica.
- Las metricas cubren toda la caja delimitadora (tierra y mar), no una mascara de tierra de Francia.
- El limite de 500 mm/h es una cota numerica, no una afirmacion de skill sobre lluvia extrema.
- Licencia `mixed-source-terms`: los pesos derivan de ERA5, PARDIG y terreno CERRA y conservan los terminos de esas fuentes; revisar `LICENSE` antes de cualquier uso, incluido el comercial.
- Riesgo de alucinacion en sentido meteorologico: al ser un modelo probabilistico de rejilla, puede generar campos plausibles pero incorrectos fuera de su distribucion de entrenamiento; no debe usarse como base de decisiones operativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EmmaScharfmann/france-precipitation-downscaler
- Repositorio de codigo, configuraciones y documentacion: https://github.com/EmmaScharfmann/weather-forecast-model-downscaler (seccion *Hourly precipitation* del README)
- Licencia: archivo `LICENSE` en el repositorio del modelo
