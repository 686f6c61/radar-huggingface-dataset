# Jonatasperaza/s9c-jena-rain-nowcaster

## Resumen

S9c es un clasificador tabular de precipitación a muy corto plazo (nowcasting) diseñado para ejecutarse en un microcontrolador ESP32. Desarrollado por el usuario Jonatasperaza, responde a una pregunta binaria concreta: si lloverá (≥ 0,2 mm) en los próximos 60 minutos en la estación meteorológica del MPI-BGC en Jena (Alemania). Su relevancia radica en el tamaño extremo del artefacto: 638 pesos de red en int8 más 9 pesos de combinación, lo que suma 736 bytes en total, con inferencia en el orden de microsegundos.

Técnicamente no es un modelo de lenguaje ni un transformer, sino una red neuronal muy pequeña (originalmente 90→8→1, reducida a 90→6→1 mediante edición directa de pesos) combinada con una regresión logística que fusiona la salida de la red con términos de predicción numérica del tiempo (NWP) de Open-Meteo. La entrada combina 26 características de la propia estación con 64 características derivadas de 14 estaciones DWD vecinas situadas entre 10 y 108 km.

El modelo es deliberadamente específico del emplazamiento: fue entrenado y evaluado únicamente para la estación de Jena y no se espera que generalice a otras ubicaciones sin reentrenamiento. Está publicado bajo licencia CC-BY-4.0 y su formato de pesos es JSON (no safetensors ni GGUF), consumido mediante NumPy en Python y mediante código compilado en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward pequeña (90→6→1 con skip lineal) + regresión logística combinadora |
| Parametros totales | 638 pesos de red (int8) + 9 pesos del combinador = 736 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada de 90 características) |
| Tipos de cuantizacion | int8 (pesos de red); combinador en JSON de precisión nativa |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | JSON (`preprocessing.json`, `s9c_combiner.json`) consumido vía NumPy |
| Tarea | Clasificación tabular binaria (lluvia ≥ 0,2 mm en 60 min) |
| Entradas | 90 características (26 de estación + 64 de vecinos DWD) |
| Salida | Logit / probabilidad de lluvia en la próxima hora |
| Huella en disco | 736 bytes (modelo); repo de 0,0 GB |
| Hardware objetivo | ESP32 (medido en ESP32-D0WDQ6 a 240 MHz) |
| Latencia en dispositivo | 121 µs para la red 90→8→1 incluyendo preprocesado (familia del modelo; S9c pendiente de medición en hardware) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal feedforward mínima: 90 entradas, 6 unidades ReLU y una conexión skip lineal que se suma al logit de salida. Originalmente se entrenó como 90→8→1; posteriormente dos unidades se fusionaron mediante edición directa de pesos (eran copias casi lineales de otras unidades, por lo que su peso de salida se plegó en las restantes) y los pesos se cuantizaron a int8. Según la model card, ninguno de los dos pasos supuso pérdida de precisión (ΔAUC-PR en desarrollo de +0,0001). Sobre la salida de la red se aplica una regresión logística que combina el logit de la red con cinco términos NWP: lluvia prevista en la próxima hora, lluvia máxima prevista en ±1 h, cobertura nubosa prevista, un indicador de hora seca y la interacción de hora seca con cada término NWP. Los pesos aprendidos indican que en horas secas conviene confiar más en las señales de nubosidad y lluvia del pronóstico.

El preprocesado (`preprocessing.json`) aplica `log1p(10·mm)` sobre cantidades de lluvia, `sqrt(s/600)` sobre duraciones, z-score con estadísticas de entrenamiento y recorte a ±4. Las 26 características de estación incluyen presión, temperatura, punto de rocío, humedad, viento, radiación, lluvia y sus tendencias, hora del día y del año, y un índice de nubosidad. Las 64 características de vecinos incluyen lluvia en los últimos 10 min, 30 min, 1 h y 3 h en 14 estaciones DWD, más agregados (máximo a barlovento, número de estaciones con lluvia). Los datos de vecinos deben tener al menos 20 minutos de antigüedad, ya que el feed "now" de DWD presenta un retardo de 20 a 50 minutos.

El entrenamiento usó muestras horarias de 2010 a 2022; los términos NWP se ajustaron sobre 2017-2022 porque el archivo histórico comienza en 2017. La selección de modelo empleó validación cruzada de origen rodante (años de validación 2020, 2021 y 2022) con cuatro retardos de datos de vecinos. El conjunto de desarrollo de 2023 se usó solo para confirmaciones y el test de 2025 se usó una única vez para los modelos finales. El registro completo de decisiones, incluyendo enfoques descartados (neuronas de onset escritas a mano, poda iterativa por magnitud, características de viento y de presión de vecinos), está en `DECISOES.md` del proyecto fuente.

## Capacidades

- Clasificación binaria de precipitación a 60 minutos vista: predice si lloverá ≥ 0,2 mm en la próxima hora en la estación de Jena.
- Estimación de onset: el AP restringido a horas secas mide la capacidad de anticipar el inicio de la lluvia.
- Fusión de observaciones locales y de vecinos: integra sensores propios de la estación con lluvia observada en 14 estaciones DWD situadas entre 10 y 108 km, mayoritariamente a barlovento.
- Incorporación de pronóstico NWP: consume términos de Open-Meteo (lluvia próxima hora, máximo en ±1 h, nubosidad) mediante el combinador logístico.
- Inferencia en microcontrolador: ejecutable en ESP32 con una latencia de 121 µs para la familia de modelos, con coincidencia con Python hasta 1e-6.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un clasificador tabular, no un modelo generativo.

## Casos de uso

- Estación meteorológica de bajo consumo en Jena: un ESP32 alimentado por batería o panel solar ejecuta el modelo localmente y publica cada 10 minutos una probabilidad de lluvia en la próxima hora, sin necesidad de enviar datos a la nube.
- Riego y agricultura de precisión en la comarca de Jena: el dispositivo puede suspender un ciclo de riego programado cuando la probabilidad de lluvia supera el umbral de decisión, ahorrando agua con una latencia de microsegundos y sin coste de inferencia.
- Automatización de toldos, ventanas y cubiertas: un controlador embebido cierra toldos o ventanas motorizadas ante una probabilidad alta de lluvia inminente, usando el modelo como disparador local con un consumo energético mínimo.
- Alerta temprana de onset para logística urbana: el AP de onset (0,405 en el test de 2025) permite detectar el inicio de lluvia en horas secas, útil para avisar a flotas de reparto o a operarios de obra con margen de una hora.
- Nodo sensor de una red ciudadana: al ocupar 736 bytes y ejecutarse en un ESP32, el modelo puede desplegarse en decenas de nodos de bajo coste que reporten probabilidad de lluvia a un servidor central, que agregaría las salidas.
- Validación de nowcasting NWP a pie de estación: comparar la salida del modelo con el pronóstico de ICON-D2 en tiempo real sirve para monitorizar la calidad del pronóstico en la ubicación concreta y detectar desviaciones sistemáticas.
- Docencia y experimentación en TinyML: el artefacto completo (736 bytes, preprocesado en JSON, inferencia en Python y en C) es un ejemplo reproducible de extremo a extremo para cursos de despliegue de modelos en microcontroladores.

## Benchmarks y rendimiento

Conjunto de test congelado, año 2025 (8.760 h, 389 horas de lluvia, 82 onsets; umbral de decisión elegido sobre 2023; media sobre 4 retardos de datos de vecinos entre 20 y 50 min):

| Modelo | Tamano | AUC-PR | onset AP | F1 | precision | recall | onset recall |
|---|---|---|---|---|---|---|---|
| Red sin NWP (D8) | 3,3 KB | 0,682 | 0,203 | 0,622 | 0,595 | 0,650 | 14,6% |
| S9c (este modelo) | 736 B | 0,741 | 0,405 | 0,672 | 0,640 | 0,707 | 26,8% |
| Blend mayor (MLP 32 + 300 árboles, NWP) | ~117 KB | 0,741 | 0,409 | 0,679 | 0,634 | 0,730 | 32,9% |

Comparación de S9c frente a la red sin NWP con bootstrap pareado en bloques de 72 horas (1.000 remuestreos): ΔAUC-PR +0,057 [IC 95% +0,044, +0,071]; Δonset AP +0,191 [+0,134, +0,253].

Frescura realista del pronóstico, abril-noviembre de 2026 (5.097 h, 264 horas de lluvia, 57 onsets; se reprodujeron 1.708 ejecuciones individuales de ICON-D2 cada 3 h, usando solo la ejecución ya publicada en cada hora):

| Pronóstico usado | AUC-PR | onset AP |
|---|---|---|
| Sin NWP (D8) | 0,726 | 0,293 |
| Archivo histórico (optimista) | 0,792 | 0,479 |
| Ejecuciones reales, retardo de publicación de 1 h | 0,772 | 0,461 |
| Ejecuciones reales, retardo de publicación de 2 h | 0,775 | 0,483 |
| Ejecuciones reales, retardo de publicación de 3 h | 0,767 | 0,473 |

Con retardo de vecinos de 30 min y bootstrap en bloques de 72 h: ΔAUC-PR +0,046 [IC 95% +0,031, +0,065]; Δonset +0,183 [+0,081, +0,272]. Aproximadamente tres cuartas partes de la ganancia de AUC-PR del archivo histórico sobreviven en tiempo real. El periodo de 2026 también se usó durante el desarrollo, por lo que debe tratarse como una comprobación de sanidad, no como un test limpio.

Puntos de referencia en desarrollo (2023, 8.756 h): persistencia ("llovió en los últimos 10 min") AUC-PR 0,380; pronóstico ICON-D2 solo 0,593 (onset 0,392); S9c 0,764 (onset 0,415). Estos valores de 2023 son optimistas porque ese año se reutilizó en muchas confirmaciones durante el desarrollo.

## Requisitos de hardware

- El modelo completo ocupa 736 bytes; no requiere GPU ni acelerador. Cabe en cualquier microcontrolador con unas pocas decenas de kilobytes de RAM libre.
- Hardware objetivo: ESP32 (medido en ESP32-D0WDQ6 a 240 MHz). La red 90→8→1 de la familia se ejecuta en 121 µs incluyendo el preprocesado, con coincidencia frente a Python de 1e-6. La medición de S9c en hardware está pendiente según la model card (benchmark compilado, ejecución programada).
- En un servidor, la inferencia en Python con NumPy es trivial y no necesita GPU; cualquier CPU sirve.
- Despliegue: código C compilado para ESP32 y script `inference.py` con las funciones `predict_logit` y `will_rain`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- En producción el dispositivo debe además obtener unos 60 valores de vecinos (datos abiertos de DWD) y un JSON pequeño de Open-Meteo por hora. La model card señala que hacerlo a través de un servidor pequeño es más sencillo que TLS y descompresión en el microcontrolador.
- Latencia y throughput: 121 µs por inferencia en ESP32 para la familia; el coste dominante en producción será la descarga de datos de vecinos y del pronóstico, no el cálculo.

## Comparativa con modelos similares

| Modelo | Tamano | Enfoque | AUC-PR (test 2025) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S9c (este modelo) | 736 B | Red 90→6→1 int8 + combinador logístico con NWP | 0,741 | CC-BY-4.0 | HuggingFace |
| Red sin NWP (D8) | 3,3 KB | Red neuronal solo con datos de estación y vecinos | 0,682 | no disponible | Referencia interna del autor |
| Blend mayor (MLP 32 + 300 árboles) | ~117 KB | Ensemble con NWP | 0,741 | no disponible | Referencia interna del autor |
| Persistencia | 0 B | "Llovió en los últimos 10 min" | 0,380 (dev 2023) | no aplica | Baseline trivial |
| ICON-D2 solo | no aplica | Pronóstico NWP directo | 0,593 (dev 2023) | no disponible | Servicio público DWD |

La comparación relevante es interna al proyecto: S9c iguala en AUC-PR al blend de ~117 KB con una huella 160 veces menor, a costa de un onset recall inferior (26,8% frente a 32,9%). No se dispone de comparación con otros modelos públicos de nowcasting de precipitación en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico del emplazamiento: entrenado y evaluado solo para la estación del tejado del MPI-BGC en Jena. Las características de estación y de vecinos están ligadas a esa ubicación; no se debe esperar que funcione en otro lugar sin reentrenar.
- Dependencia de datos externos: requiere el feed de vecinos de DWD (con 20-50 min de retardo) y un JSON por hora de Open-Meteo. Sin esos datos el modelo no puede operar en producción.
- El test de 2025 es el único conjunto limpio; el periodo de 2026 se usó durante el desarrollo y sus cifras de onset se basan en solo 57 eventos, por lo que son ruidosas.
- El archivo histórico de Open-Meteo usado en el test de 2025 es optimista; en tiempo real se pierde aproximadamente una cuarta parte de la ganancia de AUC-PR.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos: con el umbral elegido, la precisión es 0,640 y el recall 0,707 en el test de 2025, y el onset recall es solo del 26,8%.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- Licencia CC-BY-4.0: permite uso comercial con atribución; deben respetarse las condiciones de atribución al autor y las licencias de las fuentes de datos (DWD y Open-Meteo) que el sistema consume.
- La medición de S9c en hardware ESP32 está pendiente según la model card; la cifra de 121 µs corresponde a la familia de modelos, no a una medición publicada de S9c.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jonatasperaza/s9c-jena-rain-nowcaster
- README en portugués (README.pt-BR.md): referenciado en la model card, disponible en el repositorio del modelo
- Registro de decisiones del proyecto (DECISOES.md, en portugués): referenciado en la model card, en el proyecto fuente
- Datos abiertos de estaciones DWD: no disponible (URL no incluida en la información proporcionada)
- Open-Meteo (pronóstico NWP): no disponible (URL no incluida en la información proporcionada)
