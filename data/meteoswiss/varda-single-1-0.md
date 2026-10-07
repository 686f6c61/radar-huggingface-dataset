# MeteoSwiss/Varda-single-1.0

## Resumen

Varda-single-1.0 es un sistema de prediccion meteorologica determinista basado en datos, desarrollado por MeteoSwiss (la Oficina Federal de Meteorologia y Climatologia de Suiza), que genera predicciones horarias a 1 km de resolucion sobre Suiza y su entorno, complementando los sistemas operativos de prediccion numerica ICON-CH1-EPS e ICON-CH2-EPS. El modelo no es un modelo de lenguaje: es un modelo de aprendizaje automatico sobre grafos (pipeline `graph-ml`) orientado a la prediccion del estado atmosferico.

Tecnicamente, Varda-single-1.0 se compone de dos modelos independientes de tipo Graph Transformer con arquitectura encoder-processor-decoder, entrenados sobre una malla estirada: un grid global de 31 km refinado hasta 1 km sobre Suiza y la region alpina circundante. El primer componente es un predictor autorregresivo que avanza en pasos de 6 horas; el segundo es un downscaler temporal horario que reconstruye los cinco estados intermedios entre dos predicciones consecutivas de 6 horas.

Su relevancia radica en dos factores: por un lado, demuestra la viabilidad de la prediccion data-driven a escala regional en topografia compleja, donde los modelos globales tienen dificultades; por otro, se construye sobre Anemoi, el framework de codigo abierto para prediccion meteorologica data-driven co-desarrollado por ECMWF y varios servicios meteorologicos nacionales europeos. Los pesos se publican en HuggingFace bajo licencia CC BY 4.0, con un repositorio de 3,0 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Transformer encoder-processor-decoder (dos modelos independientes) sobre malla estirada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica; horizonte de prediccion de hasta 120 h en pasos de 6 h con downscaling horario |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo meteorologico, no linguistico); documentacion en ingles |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | no disponible; inferencia mediante `anemoi-inference` |
| Autor | MeteoSwiss |
| Pipeline | graph-ml |
| Resolucion espacial | 31 km global refinada a 1 km sobre Suiza y la region circundante (malla estirada) |
| Paso temporal | prediccion autorregresiva cada 6 h + downscaler temporal horario |
| Tamano del repositorio | 3,0 GB |
| Framework | Anemoi (ECMWF y servicios meteorologicos nacionales europeos) |
| Fecha de creacion | 2026-08-14 |
| Ultima actualizacion | 2026-10-07 |
| Descargas / likes en HuggingFace | 10 descargas, 11 likes |
| Paper | arXiv:2610.01835 |

## Arquitectura y entrenamiento

Varda-single-1.0 consta de dos modelos Graph Transformer con estructura encoder-processor-decoder, entrenados de forma independiente sobre una malla estirada que combina un grid global de 31 km con un refinamiento regional de 1 km sobre Suiza y el area alpina. El primer modelo es un predictor autorregresivo que avanza en pasos de 6 horas y produce el estado atmosferico a medio plazo. El segundo es un downscaler temporal horario que reconstruye los cinco estados horarios intermedios entre dos predicciones consecutivas de 6 horas, mas un sexto paso adicional para tratar correctamente diagnosticos acumulados como la precipitacion.

El diseno en dos etapas responde a un compromiso explicito entre resolucion temporal y acumulacion de error: un modelo autorregresivo que operase directamente con pasos de 1 hora acumularia errores seis veces mas rapido en una prediccion de 120 horas. El downscaler, al estar condicionado por ambos extremos de cada ventana de 6 horas, no propaga el error hacia delante. El sistema se construye con Anemoi, el framework de codigo abierto para prediccion meteorologica data-driven co-desarrollado por ECMWF y una comunidad creciente de servicios meteorologicos nacionales europeos.

El modelo se verifico durante un ano (abril de 2025 a marzo de 2026) contra los analisis operativos de MeteoSwiss (KENDA-CH1) y observaciones de la red de estaciones de superficie SwissMetNet, comparandose con las lineas base ICON-CH1-EPS (1 km, hasta +33 h) e ICON-CH2-EPS (2 km, hasta +120 h). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni sobre el uso de tecnicas de ajuste como RLHF o DPO, que en cualquier caso no son de aplicacion directa a este tipo de modelo.

## Capacidades

- Prediccion meteorologica determinista regional de medio plazo sobre Suiza y el entorno alpino, con salida horaria.
- Prediccion global a 31 km de resolucion, refinada a 1 km sobre el dominio regional mediante la malla estirada.
- Generacion de predicciones autorregresivas en pasos de 6 horas mediante el modelo forecaster.
- Downscaling temporal horario: reconstruccion de los cinco estados horarios intermedios entre dos predicciones de 6 horas, mas un sexto paso para diagnosticos acumulados.
- Prediccion de variables atmosfericas de superficie, incluyendo temperatura a 2 m y velocidad del viento a 10 m (mostradas en el ejemplo publicado de la model card).
- Tratamiento de diagnosticos acumulados, como la precipitacion, gracias al sexto paso del downscaler.
- Ejecucion a partir de condiciones iniciales obtenidas de las plataformas de datos abiertos de MeteoSwiss y ECMWF.
- Integracion con el ecosistema Anemoi para inferencia (`anemoi-inference`).
- No dispone de soporte de tool calling, function calling, capacidades de agente, vision, audio ni razonamiento multi-paso en el sentido de los modelos de lenguaje: no es un modelo de ese tipo.
- Capacidades multilingues: no aplica.

## Casos de uso

- Proteccion civil y alerta temprana: el sistema produce predicciones horarias a 1 km sobre Suiza, lo que permite anticipar episodios de viento fuerte o precipitacion intensa en valles y cuencas concretas donde los modelos de mayor escala no resuelven la topografia.
- Prediccion de precipitacion en cuencas alpinas: el sexto paso del downscaler maneja diagnosticos acumulados, lo que resulta adecuado para alimentar modelos hidrologicos que necesitan acumulados horarios de lluvia.
- Gestion de energia renovable: la prediccion horaria de velocidad de viento a 10 m y otras variables de superficie puede alimentar estimaciones de produccion eolica y solar con resolucion regional.
- Agricultura de precision: la temperatura a 2 m a 1 km de resolucion permite anticipar riesgo de heladas en parcelas concretas de terreno complejo, donde la variabilidad altitudinal es alta.
- Aviacion y operaciones en aerodromos alpinos: predicciones horarias de viento a 10 m y condiciones de superficie a escala local, utiles para planificacion de vuelos en terreno montanoso.
- Turismo de montana y seguridad en estaciones de esqui: seguimiento de temperatura y viento a escala de valle para planificacion de operaciones y evaluacion de riesgo.
- Investigacion en prediccion data-driven: al estar construido sobre Anemoi y publicarse con pesos abiertos, sirve como base reproducible para estudiar downscaling temporal, mallas estiradas y arquitecturas Graph Transformer en meteorologia.
- Comparacion con prediccion numerica operativa: el sistema se ha verificado contra ICON-CH1-EPS e ICON-CH2-EPS, por lo que es util en estudios de evaluacion de modelos data-driven frente a NWP clasico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe la metodologia de verificacion (periodo de abril de 2025 a marzo de 2026, comparacion contra analisis KENDA-CH1, observaciones SwissMetNet e lineas base ICON-CH1-CTRL e ICON-CH2-CTRL, estratificada por region y plazo de prediccion), pero los resultados se presentan unicamente como imagenes de tarjetas de puntuacion sin valores numericos extraidos en la informacion proporcionada.

| Aspecto evaluado | Detalle |
|---|---|
| Periodo de verificacion | abril de 2025 – marzo de 2026 |
| Referencia de verdad | analisis operativos KENDA-CH1 y observaciones de superficie SwissMetNet |
| Lineas base | ICON-CH1-EPS (1 km, hasta +33 h) e ICON-CH2-EPS (2 km, hasta +120 h) |
| Estratificacion | por region y por plazo de prediccion |
| Valores numericos publicados | no disponibles en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GB de memoria de GPU.
- Memoria de sistema: aproximadamente 14 GB de RAM por cada dispositivo GPU.
- GPU compatibles: A100 (requerida en Colab), 2 x T4 en Kaggle (16 GB cada una, 32 GB agregados).
- GPU de consumo: una T4 individual de 16 GB no es suficiente; se agota la memoria. No hay datos publicados sobre RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: `anemoi-inference`, libreria del ecosistema Anemoi, con notebook de ejemplo publicado en el repositorio de HuggingFace. Compatible con notebooks alojados en Kaggle (T4 x2) y Google Colab (A100, requiere Colab Pro).
- Latencia y throughput: una ejecucion completa de extremo a extremo, incluida la instalacion de dependencias y la obtencion de condiciones iniciales, tarda aproximadamente 20 minutos.
- Conectividad: se requiere acceso a internet para instalar dependencias y descargar las condiciones iniciales desde las plataformas de datos abiertos de MeteoSwiss y ECMWF.
- Frameworks de servido tipo vLLM, llama.cpp, Ollama o TGI: no aplicables, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Horizonte | Naturaleza | Licencia y disponibilidad |
|---|---|---|---|---|---|
| Varda-single-1.0 | Prediccion data-driven (Graph Transformer) | 1 km regional / 31 km global | hasta 120 h, salida horaria | Determinista (un unico miembro) | CC BY 4.0, pesos publicados en HuggingFace |
| ICON-CH1-EPS | Prediccion numerica operativa (NWP) | 1 km | hasta +33 h | Ensemble (EPS) | no disponible en la informacion proporcionada |
| ICON-CH2-EPS | Prediccion numerica operativa (NWP) | 2 km | hasta +120 h | Ensemble (EPS) | no disponible en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos comparativos sobre otros modelos de prediccion data-driven (por ejemplo GraphCast o Pangu-Weather): parametros, contexto, rendimiento y licencia de esas alternativas figuran como no disponibles.

## Limitaciones y advertencias

- Dominio restringido: el sistema esta disenado para Suiza y la region alpina circundante; su utilidad fuera de ese dominio no esta documentada.
- Modelo determinista de un solo miembro: a diferencia de las lineas base ICON-CH1-EPS e ICON-CH2-EPS, que son sistemas de prediccion por conjuntos, Varda-single-1.0 no proporciona una estimacion explicita de incertidumbre.
- Acumulacion de error: el componente autorregresivo de 6 horas puede acumular error a lo largo del horizonte de prediccion; el downscaler temporal no lo propaga porque esta condicionado por ambos extremos de cada ventana.
- Ausencia de cifras de rendimiento: no se han facilitado resultados numericos de benchmarks en la informacion disponible, por lo que no es posible cuantificar la mejora frente a las lineas base con los datos aqui recogidos.
- Requisitos de hardware elevados: unos 30 GB de VRAM y 14 GB de RAM de sistema por GPU, lo que excluye GPU de consumo con menos memoria.
- Dependencia de datos externos: la ejecucion necesita acceso a internet y a las condiciones iniciales de las plataformas de MeteoSwiss y ECMWF.
- No aplica la problematica habitual de sesgos linguisticos, alucinacion o contexto de idioma de los modelos de lenguaje, pero si la de sesgos derivados del dataset de entrenamiento meteorologico, cuya composicion no se detalla en la informacion disponible.
- Licencia CC BY 4.0: permite uso comercial y modificacion, pero exige atribucion a MeteoSwiss y la indicacion de los cambios realizados, ademas de no imponer garantias.
- El aviso legal y las condiciones operativas de MeteoSwiss aplicables al uso de predicciones meteorologicas oficiales no se detallan en la informacion proporcionada; un sistema data-driven no sustituye por si mismo la cadena de prediccion operativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MeteoSwiss/Varda-single-1.0
- Paper (arXiv:2610.01835): https://arxiv.org/abs/2610.01835
- Framework Anemoi (documentacion): https://anemoi.readthedocs.io/
- Framework Anemoi (version en ingles): https://anemoi.readthedocs.io/en/latest/
- Repositorio anemoi-inference: https://github.com/ecmwf/anemoi-inference
- Notebook de ejemplo en Kaggle: https://www.kaggle.com/notebooks/new?accelerator=nvidiaTeslaT4&src=https://huggingface.co/MeteoSwiss/Varda-single-1.0.ipynb
- Notebook de ejemplo en Colab: https://colab.research.google.com/#fileId=https://huggingface.co/MeteoSwiss/Varda-single-1.0.ipynb
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- MeteoSwiss (sitio oficial): https://www.meteoswiss.admin.ch/
- MeteoSwiss (informacion meteorologica): https://www.meteoswiss.admin.ch/weather.html
