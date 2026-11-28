# oukawa/NFPD

## Resumen

NFPD (neural field processor–decoder) es un modelo de aprendizaje automatico desarrollado por el usuario oukawa para predecir la dinamica global del ozono superficial (O3) a partir de observaciones dispersas de estaciones de calidad del aire. Acompana al articulo "Predicting global surface ozone dynamics from sparse observations with machine learning". No es un modelo de lenguaje: es un modelo cientifico de campos neuronales aplicado a quimica atmosferica, distribuido junto con su codigo, pesos entrenados y datos de ejemplo.

El modelo recibe los registros de O3 de un conjunto arbitrario de sensores durante las ultimas 48 horas (16 pasos de 3 horas), junto con sus coordenadas, el instante temporal y variables estaticas del terreno (orografia, mascara tierra-mar y cobertura vegetal alta y baja). A partir de esa entrada devuelve la concentracion de O3 en cualquier localizacion, con un horizonte de 3 horas hacia delante, lo que permite reconstruir el campo global y generar predicciones de hasta 120 horas.

Se distribuyen dos checkpoints: uno preentrenado sobre la reanalisis CAMS (EAC4, periodo 2003-2025) y otro afinado sobre los analisis operativos de CAMS (2019-2025) usando registros de estaciones como entrada. La relevancia actual reside en que demuestra que un campo neuronal puede interpolar y predecir un campo atmosferico global a partir de una red de sensores dispersa, sin necesidad de asimilacion clasica de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neural field processor–decoder (NFPD); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana temporal de 16 pasos de 3 h (48 h) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch, `.pt`) |
| Idiomas soportados | en (documentacion y metadatos) |
| Licencia | CC BY 4.0 (codigo y modelos); los datos conservan las licencias de sus fuentes |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

NFPD es un modelo de campo neuronal (neural field) con un procesador y un decodificador. El procesador toma las observaciones de O3 de un conjunto arbitrario de estaciones en una ventana de 48 horas (16 pasos de 3 horas), junto con las coordenadas de cada estacion, el tiempo y variables estaticas del terreno (orografia en km, mascara tierra-mar, cobertura vegetal alta y baja). El decodificador evalua el campo resultante en cualquier localizacion del grid, lo que permite reconstruir el campo global de O3 y predecir 3 horas hacia delante de forma iterativa. El modelo es invariante al numero y disposicion de los sensores de entrada, lo que constituye su principal innovacion: no requiere una malla fija de observaciones.

El checkpoint preentrenado se entreno sobre la reanalisis CAMS (EAC4) para el periodo 2003-2025. El checkpoint afinado se entreno sobre los analisis operativos de CAMS (2019-2025) con registros de estaciones como entrada, empleando un pool de estaciones que incluye EEA (Europa), EPA AQS (EEUU), CNEMC (China), estaciones coreanas, CETESB (Sao Paulo) y OpenAQ. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset de entrenamiento, ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se detalla el numero de parametros ni innovaciones como decodificacion especulativa o attention linear.

## Capacidades

- Reconstruccion del campo global de ozono superficial (O3) a partir de un conjunto arbitrario y disperso de estaciones de monitorizacion.
- Prediccion de O3 a 3 horas vista, extensible a horizontes de hasta 120 horas mediante rollout iterativo.
- Invariancia al numero y a la disposicion de los sensores de entrada, incluyendo layouts aleatorios.
- Integracion de variables estaticas del terreno (orografia, mascara tierra-mar, vegetacion) como covariables.
- Manejo de huecos en las series temporales (valores NaN en las observaciones).
- Ejecucion en CPU o GPU (seleccion automatica del dispositivo en el notebook de ejemplo).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un modelo de regresion de campos fisicos.

## Casos de uso

- Monitorizacion de calidad del aire a escala global: el modelo reconstruye el campo de O3 en cualquier punto del grid a partir de las estaciones disponibles, lo que permite estimar concentraciones en regiones sin sensores fisicos.
- Prediccion operativa a corto plazo: con un rollout de 40 pasos de 3 horas (120 h) se pueden generar pronosticos de O3 para alertas de salud publica y gestion de episodios de contaminacion.
- Evaluacion de redes de monitorizacion: al ser invariante al layout de sensores, permite simular layouts aleatorios y cuantificar que estaciones aportan mas informacion, util para disenar o recortar redes de vigilancia.
- Relleno de series historicas: el modelo puede interpolar huecos en registros de estaciones (los NaN de `input_data.nc`) usando el resto de sensores y las covariables del terreno.
- Investigacion en quimica atmosferica: sirve como emulador de campos de O3 para experimentos de sensibilidad, comparacion con reanalisis EAC4 y estudios de transporte a escala global.
- Docencia y prototipado: el notebook de ejemplo se ejecuta en CPU o en Google Colab, lo que facilita reproducir reconstruccion, layouts aleatorios y prediccion a 120 h sin infraestructura dedicada.
- Integracion en pipelines de datos de Copernicus/ECMWF: el modelo consume directamente las salidas de CAMS, por lo que puede encadenarse a flujos operativos existentes de asimilacion y pronostico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el numero de parametros ni el consumo de memoria).
- GPU recomendadas: no disponible; el notebook funciona tanto en CPU como en GPU con seleccion automatica del dispositivo.
- Cabe en GPU de consumo: probablemente si, dado que el ejemplo se ejecuta en CPU y en Google Colab, pero no se confirma con datos de memoria.
- Opciones de despliegue: PyTorch nativo (`.pt`); el notebook `run_NFPD.ipynb` importa `source/` y lee `input_data.nc` y `models/` por ruta relativa. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de campos neuronales para quimica atmosferica ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio especifico (O3 superficial): no es un modelo de lenguaje ni un modelo generico; no debe emplearse fuera de su tarea.
- Sesgos potenciales derivados de la cobertura de estaciones: el pool de entrenamiento esta dominado por Europa (EEA) y EEUU (EPA), con menor representacion de China, Corea, Sao Paulo y OpenAQ; las predicciones en regiones con pocas estaciones pueden ser menos fiables.
- Riesgo de acumulacion de error en rollouts largos: la prediccion a 120 h se obtiene iterando pasos de 3 h, por lo que el error puede crecer con el horizonte.
- Dependencia de las salidas de CAMS: los checkpoints se entrenaron sobre EAC4 y analisis operativos de CAMS, de modo que heredan sus sesgos y su resolucion.
- Limitacion idiomatica: la documentacion y los metadatos estan solo en ingles.
- Licencia: codigo y modelos bajo CC BY 4.0 (permite uso comercial con atribucion); los datos de entrada conservan las licencias de sus fuentes (Copernicus/ECMWF, EEA, EPA, CNEMC, CETESB, OpenAQ), algunas de las cuales no se redistribuyen.
- Advertencia de produccion: los datos de ejemplo cubren solo el periodo de rollout iniciado el 14 de junio de 2025 a las 00 UTC; no se garantiza el rendimiento fuera de ese periodo ni con configuraciones de sensores muy distintas a las de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oukawa/NFPD
- Articulo de referencia: "Predicting global surface ozone dynamics from sparse observations with machine learning" (no se proporciona URL en la informacion disponible)
- CAMS (Copernicus Atmosphere Monitoring Service, ECMWF): no se proporciona URL en la informacion disponible
- EEA air quality e-reporting: no se proporciona URL en la informacion disponible
- US EPA AQS: no se proporciona URL en la informacion disponible
- OpenAQ: no se proporciona URL en la informacion disponible
