# aerostratospheric/msds-open-models

## Resumen

`aerostratospheric/msds-open-models` es un hub card de Hugging Face que actúa como índice del stack de datos y modelos científicos abiertos de Aerostratospheric / Midwest Stratospheric Data Systems, una organización sin ánimo de lucro con sede en Illinois (Estados Unidos). Este repositorio no contiene pesos de modelo; en su lugar, enlaza a dos datasets públicos (`uogw` y `gir`) y a dos suites de modelos de clasificación tabular basados en scikit-learn (`uogw-scientific-suite` y `gir-open-tier-suite`), que se reentrenan automáticamente cada día.

El objetivo del proyecto es ofrecer una capa de descubrimiento y muestreo sobre fuentes públicas de datos atmosféricos y de riesgo, junto con modelos portátiles de puntuación para dashboards y notebooks. La relevancia actual radica en su automatización: los datos se publican típicamente en menos de 48 horas tras la recuperación de las plataformas de alta altitud, y los modelos se actualizan a horas fijas UTC. No se trata de un modelo de lenguaje ni de un modelo fundacional de IA meteorológica, sino de un conjunto de modelos de clasificación tabular con múltiples cabezas específicas para tareas como severidad de anomalías, confort térmico o índice de calor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | scikit-learn (clasificación tabular, no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | joblib (en las suites; este hub card no contiene pesos) |

## Arquitectura y entrenamiento

El stack se compone de dos suites de modelos de clasificación tabular implementados con scikit-learn. Según la model card, cada suite incluye `inference.py`, `metrics.json`, `requirements.txt` y `models/*.joblib`. La suite `uogw-scientific-suite` tiene cabezas para severidad de anomalías, confort térmico, índice de calor NOAA, demo de predicción para la próxima hora en Casey y regímenes de superficie. La suite `gir-open-tier-suite` incluye una réplica de banner de estado abierto, intensidad de anomalías y un ayudante de severidad NWS.

Los datos de entrenamiento proceden de los datasets `aerostratospheric/uogw` y `aerostratospheric/gir`, que se actualizan diariamente. El proceso de entrenamiento está automatizado mediante GitHub Actions: el dataset UOGW se sincroniza a las 11:00 UTC y la suite se reentrena a las 12:00 UTC; el dataset GIR se sincroniza a las 19:30 UTC y la suite se reentrena a las 20:00 UTC. No se menciona uso de RLHF, DPO ni técnicas de aprendizaje profundo; la innovación principal es la automatización y el reentrenamiento diario sobre datos abiertos.

## Capacidades

- Clasificación tabular para datos atmosféricos y de riesgo.
- Puntuación de severidad de anomalías en datos meteorológicos.
- Cálculo de confort térmico y del índice de calor NOAA.
- Clasificación de regímenes de superficie.
- Réplica del banner de estado abierto y ayudante de severidad NWS.
- Inferencia mediante scripts Python (`inference.py`) y modelos en formato joblib.
- No soporta generación de texto, tool calling, visión ni audio.

## Casos de uso

- Monitorización meteorológica automática: las suites pueden puntuar la severidad de anomalías en datos atmosféricos que se actualizan diariamente, permitiendo alertas tempranas en dashboards operativos.
- Evaluación de confort térmico urbano: el modelo de confort térmico puede integrarse en aplicaciones de datos abiertos para analizar el impacto del calor en zonas urbanas.
- Análisis de riesgos geográficos: la suite GIR clasifica la intensidad de anomalías y ayuda a interpretar la severidad de eventos según criterios NWS, útil para planificación territorial.
- Investigación climática con datos abiertos: los datasets UOGW y GIR proporcionan acceso público a datos atmosféricos y de riesgo en menos de 48 horas, facilitando estudios reproducibles.
- Automatización de pipelines de datos: los modelos se reentrenan diariamente mediante GitHub Actions, lo que permite integrarlos en flujos de trabajo de datos continuos sin intervención manual.
- Educación y divulgación en ciencia de datos: al estar publicados bajo licencia CC-BY-4.0, los modelos y datasets pueden utilizarse en cursos, talleres y proyectos de aprendizaje automático.
- Apoyo a misiones de alta altitud: los datos y modelos ayudan a planificar vuelos de globos estratosféricos, ofreciendo información sobre condiciones atmosféricas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; los modelos scikit-learn se ejecutan en CPU.
- GPU: no necesaria; no se requiere aceleración gráfica.
- Compatibilidad: cualquier ordenador con Python y scikit-learn instalados.
- Despliegue: scripts Python, Jupyter notebooks o contenedores Docker.
- Latencia: no disponible; al ser modelos tabulares, la inferencia es rápida en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Este hub card no contiene pesos; es solo un índice. Los modelos reales están en las suites enlazadas.
- No es un modelo global de IA meteorológica ni un reemplazo de ERA5, GFS o ECMWF.
- No es un servicio oficial de advertencia meteorológica ni una fuente de clasificación de preparación (DEFCON, FPCON o similar).
- Los modelos están limitados al idioma inglés.
- Los datos y modelos se basan en observaciones de Aerostratospheric y fuentes públicas; pueden contener sesgos o errores.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no garantiza disponibilidad continua.
- Los modelos se reentrenan diariamente, por lo que los resultados pueden variar entre días.

## Enlaces

- Hugging Face: https://huggingface.co/aerostratospheric/msds-open-models
- Dataset UOGW: https://huggingface.co/datasets/aerostratospheric/uogw
- Dataset GIR: https://huggingface.co/datasets/aerostratospheric/gir
- Suite uogw-scientific-suite: https://huggingface.co/aerostratospheric/uogw-scientific-suite
- Suite gir-open-tier-suite: https://huggingface.co/aerostratospheric/gir-open-tier-suite
- GitHub UOGW: https://github.com/Midwest-Stratospheric/Unified-Open-Global-Weather
- GitHub GIR: https://github.com/Midwest-Stratospheric/aerostratospheric-defense-gir
- Web: https://www.midwestsds.com/
