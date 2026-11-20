# ecmwf/aifs-ens-2.0

## Resumen

AIFS ENS v2 es el sistema de predicción meteorológica probabilística basado en aprendizaje automático desarrollado por el ECMWF (Centro Europeo de Predicciones Meteorológicas a Plazo Medio). Forma parte del AIFS (Artificial Intelligence Forecasting System) junto con AIFS Single v2, y sustituye a la versión 1 desde su implementación operativa el 12 de mayo de 2026. Genera un ensemble de 51 miembros con predicción global a 15 días con resolución temporal de 6 horas, cuatro veces al día.

El modelo emplea una arquitectura de tipo encoder-procesador-decoder: un codificador y decodificador basados en redes neuronales de grafos (GNN) y un procesador basado en un transformer de ventana deslizante. Está implementado sobre el framework open source Anemoi, co-desarrollado por el ECMWF y servicios meteorológicos nacionales europeos, y se distribuye con licencia CC BY 4.0.

La relevancia de esta versión radica en que introduce el primer componente de olas de predicción operativa basado en datos del ECMWF (11 variables de olas), nuevas variables de nieve, predicción de trayectorias de ciclones tropicales y una mejor representación de la estratosfera (nuevo nivel de 10 hPa). Además, sustituye la función de pérdida afCRPS de la v1 por una pérdida multi-escala, lo que mejora la optimización de la puntuación probabilística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-procesador-decoder: GNN (encoder/decoder) + transformer de ventana deslizante (procesador) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal de predicción de 15 días con paso de 6 h) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés, según metadatos de la model card) |
| Licencia | CC BY 4.0 (pesos de inferencia); Apache 2.0 para el notebook de demostración y scripts |
| Formato de pesos | no disponible (checkpoint para anemoi-inference) |

## Arquitectura y entrenamiento

AIFS ENS v2 sigue un diseño modular encoder-procesador-decoder. El encoder y el decoder son redes neuronales de grafos que operan sobre una malla jerárquica, mientras que el procesador es un transformer de ventana deslizante que modela las interacciones entre nodos del grafo. El modelo admite varios niveles de paralelismo para permitir el entrenamiento sobre datos de entrada de alta resolución. La resolución horizontal del componente atmosférico es de aproximadamente 31 km con 14 niveles verticales en presión (10, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 850, 925 y 1000 hPa), incluyendo el nuevo nivel de 10 hPa para la estratosfera.

En cuanto al entrenamiento, la v2 incorpora un año adicional de datos respecto a la v1 y sustituye la función de pérdida afCRPS por una formulación multi-escala orientada a la optimización de puntuaciones probabilísticas propias. También impone el mismo acotado de variables que AIFS Single para mejorar la coherencia física, revisa las características del grafo utilizando más aristas en el decoder y cambia el parámetro W de campo prognóstico a diagnóstico para mejorar las velocidades verticales. Los detalles completos del dataset de preentrenamiento no están disponibles en la información proporcionada.

## Capacidades

- Predicción meteorológica global probabilística: ensemble de 51 miembros a 15 días con paso temporal de 6 horas.
- Predicción del componente atmosférico en 14 niveles de presión, incluyendo la estratosfera (10 hPa).
- Predicción de olas: 11 variables de olas, primera predicción operativa de olas basada en datos del ECMWF.
- Predicción de variables terrestres, incluyendo una nueva variable de nieve.
- Predicción de trayectorias de ciclones tropicales.
- Variables adicionales armonizadas con AIFS Single (vsw y cp).
- Inferencia mediante la librería anemoi-inference, con interfaz de línea de comandos y notebook de ejemplo.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje; es un modelo específico de predicción numérica del tiempo.

## Casos de uso

- Predicción operativa de ensembles meteorológicos: el modelo genera 51 miembros cuatro veces al día con horizonte de 15 días, adecuado para centros meteorológicos que necesiten sustituir o complementar ensembles físicos con un sistema puramente basado en datos.
- Predicción de olas para navegación y offshore: las 11 variables de olas permiten alimentar sistemas de planificación de rutas marítimas y operaciones en plataformas, siendo la primera versión operativa de olas data-driven del ECMWF.
- Seguimiento de ciclones tropicales: la inclusión de predicción de trayectorias permite integrar el modelo en sistemas de alerta temprana y evacuación en regiones costeras.
- Predicción estratosférica: el nivel de 10 hPa mejora la representación de la estratosfera, útil para estudios de anomalías estratosféricas y su acoplamiento con la troposfera.
- Investigación en meteorología con IA: al ser open source (Anemoi) y con pesos CC BY 4.0, permite reproducir experimentos, comparar con NWP tradicional y desarrollar variantes.
- Generación de escenarios probabilísticos para energía: el ensemble de 51 miembros y 15 días sirve para estimar incertidumbre en producción eólica y solar a medio plazo.
- Docencia y divulgación: el notebook de demostración permite ejecutar una predicción completa desde condiciones iniciales de ECMWF Open Data, útil para formación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: anemoi-inference (librería oficial de ECMWF), con interfaz de línea de comandos `anemoi-inference run inference.yaml` y soporte de `uv`.
- Latencia y throughput estimados: no disponible.
- Tamaño del repositorio: 2,6 GB (incluye checkpoint y assets).

## Comparativa con modelos similares

| Modelo | Desarrollador | Arquitectura | Horizonte | Miembros del ensemble | Licencia |
|---|---|---|---|---|---|
| AIFS ENS v2 | ECMWF | GNN + transformer | 15 días / 6 h | 51 | CC BY 4.0 |
| AIFS ENS v1 | ECMWF | GNN + transformer | 15 días / 6 h | 51 | CC BY 4.0 |
| AIFS Single v2 | ECMWF | GNN + transformer | no disponible en esta ficha | determinista | CC BY 4.0 |

No se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar diferencias de habilidad predictiva entre estas versiones.

## Limitaciones y advertencias

- Modelo específico de predicción meteorológica: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Idiomas: los metadatos indican únicamente inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir predicciones físicamente inconsistentes fuera de su dominio de entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto: el horizonte está fijado en 15 días con paso de 6 horas; no se documentan extensiones.
- Licencia: los pesos son CC BY 4.0, lo que permite uso comercial con atribución; el notebook y scripts son Apache 2.0. Es necesario verificar la atribución correcta en productos derivados.
- Para producción: requiere condiciones iniciales de ECMWF Open Data y el ecosistema anemoi-inference; no se documentan garantías de servicio ni latencias en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ecmwf/aifs-ens-2.0
- AIFS Single v2: https://huggingface.co/ecmwf/aifs-single-2.0
- AIFS ENS v1: https://huggingface.co/ecmwf/aifs-ens-1
- Framework Anemoi: https://anemoi.readthedocs.io/
- anemoi-inference (GitHub): https://github.com/ecmwf/anemoi-inference
- Página de implementación de AIFS ENS v2: https://confluence.ecmwf.int/display/FCST/Implementation+of+AIFS+ENS+v2
- ECMWF Open Data: https://www.ecmwf.int/en/forecasts/datasets/open-data
- Paper AIFS-CRPS (2024): https://arxiv.org/abs/2412.15832
- Paper multi-scale loss (2025): https://arxiv.org/abs/2506.10868
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- ECMWF: https://www.ecmwf.int/
- ECMWF Charts: https://charts.ecmwf.int/
