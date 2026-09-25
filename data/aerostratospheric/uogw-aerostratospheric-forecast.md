# aerostratospheric/uogw-aerostratospheric-forecast

## Resumen

UOGW Aerostratospheric Forecast (v0.1) es un modelo de predicción de series temporales de ámbito muy local, desarrollado por Aerostratospheric / Midwest Stratospheric Data Systems, que genera perfiles verticales de atmósfera superior y estratosfera inferior para el punto de lanzamiento X2Griffon, situado en Casey, Illinois (39,2992, -87,9925). No es un modelo fundacional meteorológico global: se trata de un perceptrón multicapa de aproximadamente 30.000 parámetros entrenado específicamente sobre el sitio, con el objetivo de servir como ayuda a la planificación de vuelos de globos de gran altitud (HAB). El modelo produce predicciones a +6 h, +24 h y +48 h de temperatura, velocidad del viento, componentes u y v del viento y altura geopotencial en seis niveles de presión (250, 200, 150, 100, 70 y 50 hPa), es decir, desde la tropopausa hasta la estratosfera inferior.

Su relevancia reside en el enfoque: en lugar de competir con modelos globales como GraphCast, AIFS o Aurora, que requieren años de datos ERA5 y clústeres de GPU, esta pieza se apoya en la capa de selección de campos del proyecto Unified Open Global Weather (UOGW) y entrena un modelo mínimo, portable y reproducible para un problema operativo concreto. Los pesos son tan pequeños que se distribuyen en un JSON portable, lo que permite ejecutar la inferencia sin GPU y sin infraestructura de servido.

El paquete se publica con licencia CC BY 4.0, en formato de pesos PyTorch (.pt) más una representación portable en JSON, y forma parte de un ecosistema abierto que incluye el repositorio UOGW, un dataset asociado y un panel público de datos atmosféricos. En el momento del registro en Hugging Face acumulaba 0 descargas y 0 likes, y su publicación es reciente (25 de septiembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) de 3 capas: 111 → 96 GELU → 96 GELU → 90, con dropout 0,1 |
| Parametros totales | ~30.000 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de series temporales). Entrada: perfil actual más rezagos de 6 h y 24 h. Horizonte de salida: +6 h, +24 h y +48 h |
| Tipos de cuantizacion | No disponible; no se documenta cuantización (el tamaño del modelo la hace innecesaria) |
| Idiomas soportados | Inglés (etiqueta `en`; la documentación y la interfaz están en inglés. El modelo no procesa lenguaje natural) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `artifacts/model.json` (portable) y `artifacts/model.pt` (PyTorch) |
| Funcion de perdida | Smooth-L1 |
| Optimizador | AdamW |
| Variables de salida | Temperatura (°C), velocidad del viento (km/h), componentes u y v (km/h), altura geopotencial (m) |
| Niveles de presion | 250, 200, 150, 100, 70 y 50 hPa (aprox. 10–20 km) |
| Punto de prediccion | Casey, Illinois, EE. UU. (39,2992, -87,9925) |
| Tarea (pipeline) | `time-series-forecasting` |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente minimalista: un perceptrón multicapa de tres capas (111 entradas, dos capas ocultas de 96 neuronas con activación GELU, 90 salidas), con dropout de 0,1, entrenado con pérdida Smooth-L1 y optimizador AdamW. La entrada combina el perfil atmosférico actual con rezagos temporales de 6 h y 24 h; la salida cubre los tres horizontes de predicción. La model card no detalla explícitamente la descomposición de las 111 entradas ni de las 90 salidas, aunque la dimensión de salida es coherente con 3 horizontes × 6 niveles de presión × 5 variables físicas.

Los datos de entrenamiento provienen de la reanálisis/predicción GFS seamless de NOAA, descargada a través de la API histórica de Open-Meteo, la misma familia de datos que UOGW ya muestrea en su catálogo. El conjunto consta de 11.403 muestras de entrenamiento y 2.013 de test, con división cronológica sin mezcla aleatoria, lo que evita fuga de información temporal. La ventana de evaluación retenida abarca inicializaciones entre el 19 de junio de 2026 y el 11 de septiembre de 2026. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo que no aplica a un modelo de regresión meteorológica. La innovación principal no es arquitectónica, sino de integración: el modelo se construye sobre la selección de capas de UOGW (upper_air y stratospheric, con ground como contexto y flight reservado), lo que convierte el catálogo abierto en una fuente de entrenamiento reproducible para un caso de uso muy acotado.

## Capacidades

- Predicción de perfiles verticales de temperatura, viento (velocidad y componentes u/v) y altura geopotencial a +6 h, +24 h y +48 h.
- Cobertura de seis niveles de presión entre 250 y 50 hPa, abarcando tropopausa y estratosfera inferior.
- Predicción específica de sitio para el punto de lanzamiento X2Griffon en Casey, Illinois, con foco en la banda de flotación de 70/50 hPa (aproximadamente 115.000 pies).
- Modo de inferencia en vivo (`python src/infer.py --live`), que descarga el último perfil GFS seamless para Casey y emite las predicciones a los tres horizontes.
- Entrenamiento reproducible mediante `python src/train.py`, previa actualización de los ficheros de datos de Open-Meteo.
- Ejecución sin GPU: el tamaño del modelo permite inferencia en CPU y despliegue embebido.
- Uso como línea base (baseline) verificable para comparar métodos de forecasting de atmósfera superior en un sitio concreto.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo numérico de regresión.

## Casos de uso

- Planificación de ascenso de globos de gran altitud: el modelo predice temperatura y viento en los niveles que atraviesa el globo durante la subida, lo que permite estimar la deriva y las condiciones de la banda de flotación (70/50 hPa) antes del lanzamiento en el pad X2Griffon.
- Estimación de trayectoria y recuperación de carga útil: con las componentes u y v a +6, +24 y +48 h se puede alimentar un modelo de trayectoria sencillo para anticipar la zona de aterrizaje y organizar el equipo de recuperación.
- Verificación contra radiosondas: el modelo sirve como referencia cuantitativa (MAE de temperatura, viento y geopotencial) frente a sondeos reales lanzados en el sitio, dentro de un programa de validación abierto.
- Línea base para investigación en forecasting: cualquier investigador que proponga un método nuevo para perfiles de atmósfera superior en Casey puede comparar sus errores contra esta referencia pública y de licencia permisiva.
- Alimentación de pipelines de datos abiertos: al ser un JSON portable de ~30.000 parámetros, se puede integrar en un script programado que consulte Open-Meteo cada 6 horas y publique predicciones en un panel público como xDataHub.
- Docencia y reproducibilidad metodológica: el par entrenamiento/inferencia completo cabe en un repositorio pequeño y se ejecuta en minutos, lo que lo hace útil para enseñar división cronológica de series, métricas MAE por horizonte y buenas prácticas de atribución de datos.
- Estudio de la estratosfera inferior regional: permite analizar patrones estacionales de temperatura y viento en los niveles de 100, 70 y 50 hPa sobre el medio oeste de EE. UU. a partir de predicciones sistemáticas.
- Comparación de fuentes de datos meteorológicos: al estar construido sobre GFS seamless vía Open-Meteo, facilita experimentos sobre cómo distintas fuentes o reanálisis afectan al error de predicción en un sitio fijo.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido (inicializaciones del 19 de junio de 2026 al 11 de septiembre de 2026), con 11.403 muestras de entrenamiento y 2.013 de test:

| Horizonte | MAE temperatura | MAE velocidad del viento | MAE altura geopotencial |
|---|---:|---:|---:|
| +6 h | 1,02 °C | 12,1 km/h | 32 m |
| +24 h | 1,23 °C | 15,9 km/h | 36 m |
| +48 h | 1,50 °C | 19,4 km/h | 43 m |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (GraphCast, AIFS, Aurora u otros) sobre este mismo dominio, ni métricas adicionales como RMSE, sesgo o habilidad por nivel de presión. Tampoco se aportan intervalos de confianza ni tests de significación estadística de las diferencias entre horizontes.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con ~30.000 parámetros y entradas de 111 dimensiones, el modelo ocupa del orden de decenas de kilobytes en memoria.
- GPU recomendadas: ninguna. La inferencia está pensada para CPU y se ejecuta en cualquier máquina capaz de correr PyTorch.
- Compatibilidad con GPU de consumo: no necesita GPU; funcionaría igualmente en cualquier GPU de consumo si se forzara la ejecución en dispositivo CUDA, sin ninguna ventaja práctica.
- Opciones de despliegue: PyTorch nativo (`artifacts/model.pt`), lectura directa del JSON portable con NumPy o similar, y potencial exportación a ONNX u otros formatos (no documentada en la model card). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia por inferencia inferior al milisegundo en CPU, pero este dato no está confirmado por el autor.
- Requisitos de red: la inferencia en vivo requiere acceso a la API de Open-Meteo para descargar el perfil más reciente de GFS seamless.

## Comparativa con modelos similares

| Modelo | Tipo | Ambito | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UOGW Aerostratospheric Forecast v0.1 | MLP de 3 capas | Punto único (Casey, IL) | ~30.000 | Entrada actual + rezagos 6/24 h; horizonte +6/+24/+48 h | CC BY 4.0 | Hugging Face y GitHub |
| GraphCast | Modelo fundacional global (GNN) | Global | No disponible en la información | No disponible | No disponible | No disponible |
| AIFS | Modelo fundacional global | Global | No disponible en la información | No disponible | No disponible | No disponible |
| Aurora | Modelo fundacional global | Global | No disponible en la información | No disponible | No disponible | No disponible |

La model card cita explícitamente GraphCast, AIFS y Aurora como la categoría de modelos globales frente a la que se posiciona, señalando que estos requieren datos ERA5 globales de varios años y clústeres de GPU grandes. No se proporcionan especificaciones numéricas de esos modelos en la información disponible, por lo que la comparación cuantitativa no puede establecerse. La diferencia de categoría es clara: modelos fundacionales de escala planetaria frente a un regresor local de 30.000 parámetros diseñado para un único punto de lanzamiento.

## Limitaciones y advertencias

- Ámbito geográfico extremadamente restringido: el modelo está entrenado para un único sitio (Casey, Illinois) y no debe aplicarse a otras coordenadas sin reentrenamiento.
- No es un producto de predicción numérica operativa. La propia model card indica que es una ayuda a la investigación y a la planificación de vuelo, y que no sustituye al briefing meteorológico de la FAA.
- Sesgo heredado de la fuente: al entrenarse con salidas de GFS seamless vía Open-Meteo, el modelo reproduce los sesgos de ese sistema y no aporta información nueva más allá de la ya contenida en él.
- Riesgo de degradación fuera de distribución: el periodo de test abarca únicamente del 19 de junio al 11 de septiembre de 2026, por lo que no hay evidencia publicada sobre su comportamiento en otras estaciones, en condiciones de estratosfera alterada o durante calentamientos súbitos estratosféricos.
- Ausencia de intervalo de incertidumbre: el modelo entrega predicciones puntuales sin estimación de incertidumbre, algo crítico en planificación de vuelos.
- Ambigüedad de medición: la velocidad del viento se reporta en km/h (nativo de Open-Meteo), unidad poco habitual en meteorología profesional, que usa m/s o nudos; conviene convertir antes de integrar con otras herramientas.
- Idiomas: el modelo no procesa lenguaje; la etiqueta `en` se refiere a la documentación. No hay capacidades multilingües.
- Restricciones de licencia: CC BY 4.0 permite uso comercial, pero exige atribución a Aerostratospheric / Midwest Stratospheric Data Systems, a UOGW y a los datos de GFS vía Open-Meteo.
- Ecosistema en estado inicial: el repositorio Hugging Face del modelo registra 0 descargas y 0 likes, y la capa `flight` de UOGW está reservada porque el vuelo científico inaugural de X2Griffon está previsto para el 19 de septiembre de 2026, sin perfiles recuperados todavía.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no debe integrarse en arquitecturas de agentes como si fuera un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aerostratospheric/uogw-aerostratospheric-forecast
- Repositorio GitHub del modelo: https://github.com/Midwest-Stratospheric/uogw-aerostratospheric-forecast
- Dataset UOGW en Hugging Face: https://huggingface.co/datasets/aerostratospheric/uogw
- UOGW Scientific Suite en Hugging Face: https://huggingface.co/aerostratospheric/uogw-scientific-suite
- Repositorio Unified Open Global Weather (UOGW): https://github.com/Midwest-Stratospheric/Unified-Open-Global-Weather
- Data paper UOGW: Higgs, J. D. (2026). *UOGW: An Open Multi-Layer Atmospheric Data Commons*. Zenodo. https://doi.org/10.5281/zenodo.21880000
- Panel público de datos atmosféricos (xDataHub): https://www.midwestsds.com/msds-data-hub.html
- Sitio de Aerostratospheric: https://www.midwestsds.com/index.html
- Contacto para colaboración: space@aerostratospheric.com
- Reserva de reunión de introducción: https://calendly.com/aerostratospheric/15min
