# sarkarghya/fast-st-us-geospatial-model

## Resumen

FAST-ST es un modelo de inferencia geoespacial de series temporales, exclusivo para Estados Unidos, desarrollado por sarkarghya (Arghya Sarkar). Combina un backbone temporal de parches transferibles, un adaptador espacial disperso basado en soporte y una distribución de salida conjunta Student-t de bajo rango, lo que permite predicción probabilística espacio-temporal. El sistema se publica en dos artefactos: `fast-st-us-v1` (17,07 millones de parámetros) para meteorología y tráfico, y `fast-st-us-housing-v1` (18,80 millones de parámetros) para alquiler mensual y paneles socioeconómicos anuales del censo.

La relevancia del modelo radica en su enfoque específico para 24 áreas metropolitanas de EE.UU., con datos de tráfico (METR-LA y PEMS-BAY), meteorología (Open-Meteo/ERA5), alquileres (Zillow ZORI) y socioeconómicos (Census ACS). Los resultados congelados publicados muestran una mejora del MAE agregado del 14,635 % sobre la persistencia y del 5,867 % sobre la ablación solo temporal en la base, y del 37,763 % en alquiler mensual sobre el modelo estacional naive. No se trata de un modelo de lenguaje; es un sistema numérico que no realiza predicciones en vivo, sino sobre instantáneas con hash de contenido de las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone temporal de parches transferibles + adaptador espacial disperso basado en soporte + distribución de salida Student-t conjunta de bajo rango |
| Parametros totales | 17 073 141 (`fast-st-us-v1`) / 18 799 208 (`fast-st-us-housing-v1`) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo numérico espacio-temporal, no lingüístico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) |

## Arquitectura y entrenamiento

FAST-ST combina tres componentes principales: un backbone temporal de parches transferibles que extrae patrones temporales de las series, un adaptador espacial disperso basado en soporte que incorpora información geoespacial de las regiones, y una distribución de salida Student-t conjunta de bajo rango que permite predicción probabilística con intervalos de cobertura calibrados. El artefacto de vivienda añade un manejo tipado de artefactos para datos con cadencias distintas: alquiler mensual Zillow ZORI y paneles anuales del Census ACS.

Los datos de entrenamiento provienen de revisiones fijadas (pinned) de los conjuntos METR-LA y PEMS-BAY en Hugging Face, datos meteorológicos de Open-Meteo/ERA5, datos de alquiler de Zillow Research (no redistribuidos en el repositorio, sujetos a los términos de Zillow) y archivos resumen del Census ACS. No se menciona el uso de RLHF, DPO ni técnicas de aprendizaje por refuerzo; se trata de un modelo de regresión supervisada. Las fuentes mutables se normalizan en instantáneas con hash de contenido antes de inferencia o entrenamiento, y cada checkpoint se publica solo cuando todas las compuertas del manifiesto pasan. La cobertura geográfica es de 24 áreas metropolitanas estadounidenses codificadas de forma fija (Nueva York, Atlanta, San Francisco, Los Angeles, Chicago, Houston, Seattle, Boston, Miami, Washington, Filadelfia, Phoenix, Denver, Dallas, Mineápolis, Detroit, Portland, San Diego, Austin, Nueva Orleans, Charlotte, Nashville, Las Vegas y Salt Lake City).

## Capacidades

- Predicción probabilística de series temporales geoespaciales con distribución de salida Student-t y intervalos de cobertura del 80 %.
- Predicción de tráfico en dos redes viarias estadounidenses (METR-LA y PEMS-BAY).
- Predicción meteorológica (temperatura) con datos de Open-Meteo/ERA5.
- Predicción de alquiler mensual residencial con datos Zillow ZORI.
- Predicción de variables socioeconómicas anuales del Census ACS, incluyendo ingreso mediano de hogares.
- Cobertura de 24 áreas metropolitanas de EE.UU. con política de coordenadas y país impuesta en la ingesta y el servicio.
- Generación de métricas de calibración por serie (cobertura media de intervalo 80 %).
- No incluye capacidades de tool calling, agentes, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Gestión de tráfico urbano: el modelo puede predecir la congestión en las redes de transporte de las 24 metros cubiertas, permitiendo ajustes dinámicos en señalización y rutas con una ventana de predicción probabilística que informa sobre incertidumbre.
- Planificación de infraestructura pública: las predicciones de tráfico y meteorología permiten dimensionar obras viales y de drenaje con un intervalo de cobertura del 80 %, útil para análisis de riesgo en presupuestos.
- Análisis del mercado de alquiler residencial: el artefacto de vivienda predice el ZORI mensual por metro, útil para inversores inmobiliarios y gestores de carteras que necesitan anticipar tendencias de alquiler con un 37,763 % de mejora sobre el modelo estacional-naive.
- Monitoreo socioeconómico regional: las predicciones anuales de ingreso mediano de hogares (mejora del 70,69 % sobre la persistencia anual) sirven para estudios de desigualdad, planificación de servicios sociales y análisis de políticas públicas.
- Evaluación de impacto climático local: al combinar meteorología y datos de tráfico, el modelo permite estudiar la correlación entre variables climáticas y patrones de movilidad en zonas urbanas concretas.
- Modelado de riesgo para seguros y energía: la predicción probabilística de temperatura y tráfico con intervalos de cobertura del 80 % es adecuada para estimar exposición a eventos extremos en infraestructuras críticas de las 24 metros cubiertas.

## Benchmarks y rendimiento

Resultados congelados publicados en la model card del autor:

| Metrica | Resultado |
|---|---|
| Mejora MAE agregado sobre persistencia (base) | 14,635 % |
| Mejora MAE agregado sobre ablación temporal (base) | 5,867 % |
| Cobertura media del intervalo 80 % (base) | 0,713562 |
| Mejora alquiler mensual sobre modelo estacional-naive | 37,763 % |
| Mejora ingreso mediano de hogar sobre persistencia anual | 70,69 % |

No se publican resultados de benchmarks comparativos con otros modelos geoespaciales (como GAIA, Prithvi u otros) en la información disponible. Los resultados se presentan frente a líneas base internas: persistencia, ablación temporal, estacional-naive y persistencia anual.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB y los dos artefactos suman aproximadamente 35,9 millones de parámetros (17,07 M + 18,80 M), lo que sitúa el modelo en el rango de inferencia en CPU y en GPU de consumo.
- La memoria VRAM estimada para inferencia es inferior a 1 GB con pesos en precisión FP32, por lo que cabe en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4060, RTX 4090) y también en CPU con PyTorch.
- No se publican datos de latencia ni throughput en la model card.
- Opciones de despliegue: la librería es PyTorch puro con checkpoints `.pt`; se puede servir con un pipeline propio de inferencia o integrar en servicios de modelado geoespacial. No hay soporte nativo documentado para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- No se menciona hardware de entrenamiento específico en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos geoespaciales de la misma categoría en la información proporcionada. Los resultados publicados se comparan únicamente contra líneas base estadísticas (persistencia, estacional-naive y ablación temporal), no contra otros modelos de pronóstico espacio-temporal. Por tanto, no se puede establecer una comparativa directa con alternativas como GAIA (NASA/USRA) u otros modelos de fundación geoespacial sin datos de referencia en la fuente.

## Limitaciones y advertencias

- Las salidas predictivas no son efectos causales; el modelo no establece relaciones causa-efecto entre variables.
- La base se ha validado únicamente en meteorología y en dos redes de tráfico (METR-LA y PEMS-BAY), no en todos los posibles variables geoespaciales.
- Los datos anuales del Census ACS son ventanas de encuesta superpuestas y siguen siendo anuales; no se debe interpretar como datos de alta frecuencia.
- La política de país y coordenadas de EE.UU. se impone en la ingesta y la salida, lo que limita su uso fuera del territorio estadounidense.
- La mejora agregada no garantiza que cada serie individual supere a todas las líneas base; es necesario inspeccionar métricas por serie antes de desplegar.
- Los datos de Zillow no se redistribuyen en el repositorio; su uso está sujeto a los términos de Zillow Research.
- El modelo no es un sistema de predicción en vivo; las fuentes mutables se normalizan en instantáneas con hash de contenido, lo que implica que las predicciones pueden quedar desactualizadas si no se re-entrena con nuevas instantáneas.
- La licencia no está especificada, por lo que no se puede confirmar la viabilidad de uso comercial sin contactar con el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarkarghya/fast-st-us-geospatial-model
- Perfil de GitHub del autor: https://github.com/sarkarghya
- Conjunto de datos METR-LA: https://huggingface.co/datasets/witgaw/METR-LA
- Conjunto de datos PEMS-BAY: https://huggingface.co/datasets/witgaw/PEMS-BAY
