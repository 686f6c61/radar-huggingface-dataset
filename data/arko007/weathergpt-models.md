# Arko007/weathergpt-models

## Resumen

WeatherGPT models es un paquete de cinco modelos de aprendizaje automatico desarrollado por Arko007 para la capa de interoperabilidad meteorologica de WeatherGPT. No se trata de un modelo de lenguaje grande, sino de una coleccion de artefactos de post-procesamiento que resuelven problemas concretos de la meteorologia operativa: mapeo de nombres de campos entre proveedores, correccion de sesgo de pronosticos multi-modelo, interpretacion de consultas en lenguaje natural, calibracion de probabilidades de precipitacion y seleccion de fuentes de confianza. El paquete se publica con licencia Apache 2.0 y se distribuye como una libreria Python instalable (`pip install weathergpt-models`), con peso total aproximado de 2.1 GB en el repositorio.

El proyecto se centra en la India, y los datos de entrenamiento incluyen tablas de parametros autoritativas (CF Standard Names, ECMWF/GRIB2, NCEP GFS, WRF Registry, WMO BUFR, Open-Meteo e IMD) asi como datos de pronosticos multi-modelo frente a observaciones. Cada modelo esta sujeto a una puerta de admision: si no supera el baseline que reemplaza, se rechaza en tiempo de carga y el llamador cae a una ruta determinista. Las metricas reportadas por el autor indican, por ejemplo, un F1 macro de 0.743 en zero-shot para el mapeador de campos, frente a 0.142 de un diccionario estatico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; paquete de cinco modelos heterogeneos. M1 es un bi-encoder de embeddings de etiquetas con cabezas multitarea. M2-M5 se basan en LightGBM/scikit-learn segun la descripcion de dependencias. |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; la documentacion incluye un ejemplo en hindi ("kal Bhandara me baarish hogi kya?") y el modelo esta orientado a la India. |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible; el repositorio ocupa 2.1 GB y las dependencias incluyen torch y transformers, pero no se especifica el formato (safetensors, .bin, etc.) |

## Arquitectura y entrenamiento

El paquete se compone de cinco modelos independientes, cada uno con su propia arquitectura y ciclo de entrenamiento. M1 (`field_mapper`) es un bi-encoder de embeddings de etiquetas con cabezas multitarea, entrenado con tablas de parametros autoritativas. El split de entrenamiento se realiza por tabla de origen: train con CF+GRIB2+CAP, validacion zero-shot con BUFR+OpenMeteo+IMD y test zero-shot con WRF+NCEP, que solo se tocan en la medicion final. M2 (`mos`), M4 (`calibration`) y M5 (`trust_ranker`) comparten la misma fuente de datos: las predicciones multi-modelo frente a observaciones, publicadas en el dataset `Arko007/weathergpt-d1-mos-dataset`. M3 (`intent`) es un clasificador de intenciones y extraccion de slots (LOC, TIME, CROP) para consultas en lenguaje natural.

Todos los modelos se entrenan con un gate de admision: si el artefacto no puede demostrar su procedencia o no supera el baseline que reemplaza, se rechaza al cargar y el llamador usa una ruta determinista. El registro `ModelRegistry` expone el estado de cada gate. No se menciona RLHF, DPO ni tecnicas de alineacion, ya que no son modelos de lenguaje generativo.

## Capacidades

- Mapeo de nombres de campos meteorologicos: M1 transforma nombres de proveedor (por ejemplo, "APCP" con unidad "kg m-2") en variables canonicas con un nivel de confianza, y puede abstenerse en lugar de fabricar un mapeo cuando no esta seguro.
- Correccion de sesgo multi-modelo: M2 combina pronosticos de GFS, ECMWF, ICON y GEM para producir un valor corregido con intervalo de confianza, teniendo en cuenta contexto como lead time, elevacion, latitud y longitud.
- Interpretacion de consultas en lenguaje natural: M3 parsea intencion y extrae slots (LOC, TIME, CROP) de preguntas como "kal Bhandara me baarish hogi kya?". Aunque la documentacion advierte que la cabecera de variables es debil, con macro-F1 0.12, y que la confianza de intencion es baja (0.15-0.19) en frases casuales.
- Calibracion de probabilidad de excedencia: M4 genera una curva de probabilidad de que la precipitacion supere diferentes umbrales, a partir del mismo spread multi-modelo y contexto.
- Ranking de fuentes de confianza: M5 ordena candidatos de predicciones numericas por confianza aprendida para un contexto concreto, devolviendo la mejor fuente primero.
- Integracion flexible: el paquete no importa FastAPI y puede usarse de forma autonoma. El `ModelRegistry` carga los modelos desde el hub y permite comprobar que cargo y por que no cargo nada.
- Fallback determinista: si un modelo no supera el gate de admision, la llamada cae a una ruta determinista, garantizando un comportamiento predecible en produccion.

## Casos de uso

- Normalizacion de datos meteorologicos en pipelines de integracion: usar M1 para mapear nombres de campos de fuentes heterogeneas (WRF, NCEP, OpenMeteo, IMD) a un esquema canonico antes de almacenar o analizar. Es adecuado porque tiene una confianza del mapeo y puede abstenerse si no reconoce el campo.
- Correccion de sesgo en sistemas de prediccion: usar M2 para combinar salidas de GFS, ECMWF, ICON y GEM y producir una prediccion puntual corregida con intervalo de confianza. Es util en aplicaciones de agricultura o gestion de recursos hidricos donde el sesgo sistematico de cada modelo afecta a la precision.
- Agente meteorologico conversacional: usar M3 para interpretar preguntas de usuarios en hindi o ingles y extraer la ubicacion y el momento de la consulta. La documentacion recomienda usarlo junto a un parser basado en reglas y no como decision autonoma.
- Alertas tempranas de precipitacion: usar M4 para calcular la probabilidad de que la lluvia supere un umbral (por ejemplo, 5 mm) en las proximas 30 horas. La curva de excedencia da informacion directa para umbrales de alerta.
- Seleccion de fuente de confianza en modelos de ensemble: usar M5 para elegir dinamicamente la mejor fuente de prediccion (GFS, ECMWF, ICON, GEM) segun el contexto (estacion, elevacion, lead time). Esto permite optimizar el ensemble en tiempo real.
- Investigacion en post-procesamiento meteorologico: usar el paquete como referencia para comparar tecnicas de Model Output Statistics (MOS) con distintos algoritmos, ya que se publican las metricas y los splits de entrenamiento.
- Despliegue en una API de prediccion: integrar el `ModelRegistry` en un servicio FastAPI, con fallback a rutas deterministas si alguno de los modelos falla la puerta de admision. Es adecuado porque el paquete no arrastra dependencias del servidor.

## Benchmarks y rendimiento

No se han publicado benchmarks independientes en la informacion disponible. Las metricas internas reportadas por el autor en la model card son las siguientes:

| Modelo | Metrica | Valor |
|---|---|---|
| M1 field_mapper | Zero-shot macro-F1 | 0.743 |
| M1 field_mapper | Baseline (dict registry) | 0.142 |
| M3 intent | Variable macro-F1 (held-out) | 0.12 |
| M3 intent | Intent confidence (frases casuales) | 0.15-0.19 |
| M2, M4, M5 | No se han publicado metricas en el fragmento disponible | No disponible |

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un paquete de modelos tabulares y de aprendizaje automatico, es probable que funcione en CPU, pero el autor no proporciona especificaciones de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada. Las dependencias (torch, transformers, lightgbm, scikit-learn) sugieren que puede ejecutarse en CPU sin gran demanda de memoria.
- Opciones de despliegue: el paquete se instala con `pip install weathergpt-models` y se usa desde Python mediante `ModelRegistry`. No se mencionan contenedores, vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos publicos comparables en la misma categoria (post-procesamiento meteorologico con mapeo de campos, correccion de sesgo y ranking de fuentes). La informacion proporcionada no incluye alternativas con las que comparar.

## Limitaciones y advertencias

- M3 tiene una extraccion de variables muy debil (macro-F1 0.12) y una confianza de intencion baja (0.15-0.19) en lenguaje casual. No debe usarse como unica fuente de verdad para decisiones criticas.
- Todos los modelos estan sujetos a un gate de admision; si no superan su baseline, se rechazan en tiempo de carga y el llamador cae a una ruta determinista, lo que reduce el riesgo de producir salidas no fiables pero requiere manejo explicito de `None` en cada atributo del registro.
- Los datos de entrenamiento y el uso previsto se centran en la India. La generalizacion a otras regiones o dominios meteorologicos no esta validada.
- La documentacion no aporta informacion sobre sesgos de genero, raza u otros sesgos sociales, probablemente por tratarse de modelos meteorologicos y no de modelos de lenguaje generativo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto incipiente y posiblemente inestable en produccion.
- No se proporcionan benchmarks externos ni evaluaciones comparativas con modelos de referencia.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el rendimiento recae en el usuario.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Arko007/weathergpt-models
- Dataset de entrenamiento M2/M4/M5: https://huggingface.co/datasets/Arko007/weathergpt-d1-mos-dataset
- Documentacion de integracion: no disponible en la informacion proporcionada.
