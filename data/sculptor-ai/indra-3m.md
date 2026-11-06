# Sculptor-AI/Indra-3M

## Resumen

Indra-3M es un modelo de prediccion meteorologica de series temporales desarrollado por Sculptor-AI, un fine-tune del modelo base Timestral-5M de Mistral AI. Con solo 3.007.197 parametros y un archivo de aproximadamente 12 MB, genera pronosticos horarios a 72 horas de temperatura, punto de rocio, viento y presion para aeropuertos de Estados Unidos, incluyendo intervalos de incertidumbre mediante regresion por cuantiles. Su relevancia radica en que demuestra que un modelo de tres millones de parametros, ejecutable en CPU convencional en torno a 0,3 segundos por pronostico en cuatro hilos, puede superar al National Blend of Models en error de temperatura.

El modelo parte de la arquitectura Timestral de Mistral AI, orientada a series temporales, y fue adaptado mediante fine-tuning supervisado con perdida pinball ponderada hacia la temperatura, seguido de un proceso de poda en 12 rondas que redujo el modelo de 5,2 millones a 2.999.627 parametros. Lee los ultimos 90 dias de observaciones de un aeropuerto junto con guias publicas de pronostico (National Blend of Models, GFS MOS y NAM MOS).

La propuesta es deliberadamente acotada: no es un modelo de lenguaje general, sino un predictor especializado para un dominio concreto (meteorologia aeroportuaria estadounidense) con un objetivo claro de eficiencia. Su interes para desarrolladores e investigadores esta en la combinacion de tamano minimo, coste de inferencia casi nulo y una validacion rigurosa contra un sistema operativo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para series temporales (Timestral, base mistralai/Timestral-5M), con mascara de atencion modificada y poda de neuronas |
| Parametros totales | 3.007.197 (3.0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada de 90 dias de observaciones mas guias de pronostico; horizonte de salida de 72 horas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; tamano de archivo ~12 MB) |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | modified-mit (licencia "other", nombre "modified-mit") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Indra-3M es un transformer de series temporales derivado de Timestral-5M de Mistral AI. La adaptacion incluye dos cambios estructurales relevantes: una modificacion de la mascara de atencion que permite que los tokens de pronostico lean directamente la guia correspondiente a sus propias horas, y una poda de neuronas en 12 rondas. Cada ronda midio, solo sobre aeropuertos de entrenamiento, en que medida la salida de cada neurona no podia ser reproducida por las demas y cuanto afectaba al error. El resultado es un modelo de 2.999.627 parametros que no puede cargarse con la implementacion estandar de Timestral: requiere el codigo `indra/model.py` incluido en el repositorio.

El entrenamiento consistio en 24.000 pasos de fine-tuning sobre 24 aeropuertos de Estados Unidos mas Indianápolis, con datos de agosto de 2018 a octubre de 2024. Se uso perdida pinball ponderada hacia la temperatura, y un modelo mayor de 28M de parametros entrenado de la misma forma actuo como profesor, con la mitad de la perdida orientada hacia sus pronosticos (destilacion). La entrada combina los ultimos 90 dias de observaciones del aeropuerto con guias publicas de pronostico: National Blend of Models, GFS MOS y NAM MOS. La salida son pronosticos horarios a 72 horas con intervalos del 80 por ciento.

## Capacidades

- Pronostico horario a 72 horas de temperatura, punto de rocio, velocidad del viento y presion para aeropuertos de Estados Unidos.
- Regresion por cuantiles: cada variable incluye cotas `_low` y `_high` que delimitan un rango del 80 por ciento.
- Prediccion condicionada a guias operativas (National Blend, GFS MOS, NAM MOS) y a 90 dias de observaciones historicas del aeropuerto.
- Inferencia en CPU: aproximadamente 0,3 segundos por pronostico en cuatro hilos, sin contar la descarga de datos.
- Salida en CSV con unidades explicitas: temperatura y punto de rocio en grados Celsius, viento en m/s y presion en hPa.
- Generalizacion a aeropuertos no vistos durante el entrenamiento (validada en 12 estaciones).
- No dispone de tool calling, capacidades de agente, vision, audio ni generacion de texto: es un modelo numerico especializado.

## Casos de uso

- Pronostico operativo de temperatura en aeropuertos: el modelo genera las proximas 72 horas con intervalos de incertidumbre, adecuado para planificacion de operaciones en pista y gestion de fluidez.
- Prediccion de punto de rocio para aviacion: util para estimar riesgo de formacion de niebla y condiciones de visibilidad, aunque es la variable con menor ganancia del modelo.
- Estimacion de viento en superficie: con mejoras de hasta el 14,1 por ciento frente al National Blend en Miami, sirve para planificacion de operaciones y seguridad en rampa.
- Sustituto ligero del National Blend en entornos con recursos limitados: al ejecutarse en CPU en 0,3 segundos, puede desplegarse en un servidor modesto o en el borde sin GPU.
- Investigacion en destilacion y poda de modelos de series temporales: el proceso de 12 rondas de poda con criterio de reproducibilidad de neuronas es un caso de estudio reproducible.
- Generacion de datasets de pronostico historico: al procesar un aeropuerto y un rango de fechas, permite reconstruir pronosticos para analisis posterior o evaluacion de sistemas.
- Comparacion y benchmarking de sistemas de pronostico: su validacion contra el National Blend y el NWS facilita usarlo como referencia en estudios de error de temperatura.
- Prototipado rapido en meteorologia aplicada: la instalacion via `pip install -r requirements.txt` y la ejecucion con `python -m indra.forecast ORD --lon -87.93` permiten obtener un CSV sin infraestructura adicional.

## Benchmarks y rendimiento

Error medio de temperatura a 1-72 horas, año de test de noviembre de 2025 a octubre de 2026, unas 1.471 predicciones por aeropuerto, con intervalos bootstrap del 95 por ciento:

| Aeropuerto | Indra-3M | National Blend | Mejora (rango 95%) | Rango 80% contenido |
|---|---|---|---|---|
| Columbus (CMH) | 2,04 °F | 2,27 °F | 10,2% (8,6 a 11,9) | 80,7% |
| Chicago O'Hare (ORD) | 2,08 °F | 2,31 °F | 10,2% (8,5 a 11,9) | 80,8% |
| Denver (DEN) | 2,79 °F | 3,29 °F | 15,4% (13,7 a 17,0) | 81,2% |
| Miami (MIA) | 1,42 °F | 1,59 °F | 10,3% (8,3 a 12,4) | 82,3% |
| Seattle (SEA) | 1,61 °F | 1,79 °F | 9,7% (7,8 a 11,5) | 79,6% |
| Phoenix (PHX) | 1,70 °F | 2,03 °F | 15,9% (14,0 a 17,9) | 81,5% |

Error medio de temperatura por horizonte, promedio de los seis aeropuertos:

| Horas por delante | 1-6 | 7-12 | 13-24 | 25-36 | 37-48 | 49-72 |
|---|---|---|---|---|---|---|
| Indra-3M | 1,41 °F | 1,68 °F | 1,79 °F | 1,91 °F | 2,03 °F | 2,21 °F |
| National Blend | 1,90 °F | 1,95 °F | 2,06 °F | 2,17 °F | 2,29 °F | 2,44 °F |

Mejora frente al National Blend en otras variables (1-72 horas):

| Aeropuerto | Punto de rocio (95%) | Velocidad del viento (95%) |
|---|---|---|
| Columbus | 3,5% (2,3 a 4,7) | 8,6% (7,5 a 9,6) |
| Chicago O'Hare | 3,4% (2,1 a 4,6) | 5,9% (4,8 a 7,0) |
| Denver | 3,4% (2,1 a 4,6) | 2,6% (1,9 a 3,4) |
| Miami | 1,4% (-0,6 a 3,1) | 14,1% (12,2 a 16,3) |
| Seattle | 1,6% (0,2 a 2,9) | 5,2% (4,0 a 6,2) |
| Phoenix | 5,8% (4,2 a 7,6) | 6,2% (5,3 a 7,1) |

Aeropuertos no vistos en entrenamiento (240 predicciones por aeropuerto):

| Aeropuerto | Indra-3M | National Blend | Mejora (95%) | Rango 80% contenido |
|---|---|---|---|---|
| Buffalo (BUF) | 1,98 °F | 2,06 °F | 3,7% (1,6 a 5,6) | 82,3% |
| Burlington (BTV) | 2,32 °F | 2,60 °F | 11,0% (8,9 a 13,2) | 80,8% |
| Raleigh-Durham (RDU) | 2,05 °F | 2,30 °F | 10,6% (8,5 a 12,8) | 81,0% |
| Savannah (SAV) | 1,92 °F | 2,15 °F | 10,8% (9,0 a 12,5) | 83,2% |
| Mobile (MOB) | 1,88 °F | 2,17 °F | 13,4% (11,5 a 15,2) | 83,6% |
| Austin (AUS) | 2,17 °F | 2,55 °F | 14,9% (12,9 a 16,9) | 82,2% |
| El Paso (ELP) | 2,16 °F | 2,47 °F | 12,5% (10,3 a 14,8) | 82,1% |
| Wichita (ICT) | 2,35 °F | 2,64 °F | 11,0% (8,8 a 12,9) | 80,2% |
| Fargo (FAR) | 2,53 °F | 2,76 °F | 8,6% (6,4 a 10,7) | 80,1% |
| Billings (BIL) | 2,49 °F | 2,94 °F | 15,4% (12,9 a 17,9) | 81,3% |
| Grand Junction (GJT) | 2,14 °F | 2,52 °F | 15,1% (12,8 a 17,3) | 82,2% |
| Sacramento (SMF) | 1,92 °F | 2,16 °F | 11,3% (9,3 a 13,4) | 79,1% |

Comparacion con el NWS en Indianápolis (mismas horas):

| Horas por delante | 1-6 | 7-12 | 13-24 | 25-36 | 37-48 | 49-72 |
|---|---|---|---|---|---|---|
| Indra-3M | 1,29 °F | 1,64 °F | 1,80 °F | 2,03 °F | 2,22 °F | 2,41 °F |
| National Blend | 1,84 °F | 1,94 °F | 2,12 °F | 2,28 °F | 2,47 °F | 2,67 °F |
| NWS oficial | 1,97 °F | 2,19 °F | 2,39 °F | 2,59 °F | 2,77 °F | 2,96 °F |
| Modelo propio de 28M para Indianápolis, con HRRR | 1,25 °F | 1,60 °F | 1,73 °F | 1,94 °F | 2,12 °F | 2,38 °F |

No hay datos de benchmarks de presion frente al National Blend, ya que el autor indica que no dispone de esa referencia.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo pesa aproximadamente 12 MB en safetensors y esta disenado para inferencia en CPU.
- CPU: ejecuta un pronostico en torno a 0,3 segundos en cuatro hilos, sin contar la descarga de datos.
- GPU recomendadas: no aplica; cualquier GPU moderna puede ejecutarlo, pero no es necesario.
- Cabe en cualquier consumer GPU y en practicamente cualquier equipo, incluidos sistemas de bajos recursos y despliegues en el borde.
- Opciones de despliegue: el repositorio incluye su propio runtime (`python -m indra.forecast`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la carga requiere `indra/model.py` en lugar de la implementacion estandar de Timestral.
- Latencia y throughput: aproximadamente 0,3 segundos por pronostico en cuatro hilos; el throughput depende del tiempo de obtencion de datos, que el autor excluye de esa cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indra-3M | 3,0 M | 90 dias de entrada, 72 h de salida | Error de temperatura 9,7-15,9% menor que el National Blend en 6 aeropuertos; 3,7-15,4% en 12 no vistos | modified-mit | Hugging Face |
| Modelo propio de 28M para Indianápolis (con HRRR) | 28 M | no disponible | Error de temperatura ligeramente menor que Indra-3M en Indianápolis (1,25 °F frente a 1,29 °F a 1-6 h) | no disponible | no disponible publicamente |
| Timestral-5M (mistralai) | 5,2 M | no disponible | Modelo base; sin validacion meteorologica publicada en esta ficha | no disponible | Hugging Face |
| National Blend of Models | no disponible (sistema operativo) | 72 h | Referencia operativa; Indra-3M lo supera en temperatura, punto de rocio y viento en la mayoria de estaciones evaluadas | no aplica (servicio publico) | Servicio operativo de EE. UU. |

## Limitaciones y advertencias

- Dominio restringido: solo cubre aeropuertos de Estados Unidos y variables meteorologicas concretas (temperatura, punto de rocio, viento y presion); no es un modelo de proposito general.
- El punto de rocio es la variable mas debil: la mejora en Miami (1,4%, con rango -0,6 a 3,1) no es distinguible del azar.
- No hay comparacion publicada de presion frente al National Blend, por lo que su calidad en esa variable no esta validada contra la referencia operativa.
- Requiere cargar los pesos mediante `indra/model.py`: la implementacion estandar de Timestral no puede cargar el archivo tal cual debido a la poda y a la mascara de atencion modificada.
- Depende de la disponibilidad y calidad de las guias publicas (National Blend, GFS MOS, NAM MOS) y de la descarga de datos en tiempo de ejecucion; el tiempo de obtencion de datos no esta incluido en la cifra de 0,3 segundos.
- Licencia "modified-mit" (etiquetada como "other"): es necesario revisar el archivo LICENSE antes de un uso comercial, ya que las condiciones exactas no se detallan en la informacion disponible.
- Entrenado con datos de agosto de 2018 a octubre de 2024; el rendimiento fuera de ese regimen o en climas no representados no esta documentado.
- Riesgo de deriva si las guias de pronostico cambian de version o de metodologia, ya que el modelo esta condicionado a ellas.
- No se han documentado sesgos especificos ni evaluaciones de robustez ante eventos extremos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sculptor-AI/Indra-3M
- Modelo base Timestral-5M: https://huggingface.co/mistralai/Timestral-5M
- Repositorio clonable indicado en la model card: https://huggingface.co/Sculptor-AI/Indra-3M (instrucciones `git clone` en el README)
- Licencia: archivo LICENSE dentro del repositorio del modelo
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
