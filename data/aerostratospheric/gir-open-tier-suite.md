# aerostratospheric/gir-open-tier-suite

## Resumen

El **GIR Open-Tier Suite** es un conjunto de modelos de investigación basados en scikit-learn, desarrollado por **Aerostratospheric** (Midwest Stratospheric Data Systems). Está diseñado para trabajar con el dataset público **Defense GIR** (Geospatial Intelligence Readiness), que agrega fuentes abiertas como alertas del National Weather Service (NWS), terremotos del USGS y anomalías del dataset UOGW. El objetivo es proporcionar una aproximación computacional al estado de preparación geospacial en Estados Unidos, clasificando el nivel de alerta en una escala de cuatro colores (GREEN, YELLOW, ORANGE, RED), estimando la intensidad de anomalías y clasificando la severidad de alertas NWS.

El modelo no es un modelo de lenguaje ni un transformer, sino una suite de tres cabezas de predicción tabular: una regresión logística con escalado estándar para el estado abierto, una regresión Ridge para la intensidad de anomalías y un bosque aleatorio para la severidad de alertas NWS. Los pesos se almacenan en formato `joblib` y se reentrenan automáticamente cada día mediante GitHub Actions a partir de datos públicos. Su relevancia radica en ofrecer una herramienta reproducible y de licencia MIT para briefings abiertos, educación y prototipos de dashboards, sin sustituir en ningún caso a los canales oficiales de NWS, USGS o CISA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | scikit-learn: StandardScaler + LogisticRegression, Ridge, RandomForestClassifier |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en joblib, sin cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

La suite se compone de tres modelos independientes, cada uno con una tarea distinta sobre datos tabulares:

- **Open status**: usa un `StandardScaler` seguido de una `LogisticRegression` para predecir el nivel de alerta (GREEN, YELLOW, ORANGE, RED) a partir de cinco características: `nws_alert_count`, `usgs_max_mag`, `uogw_alerts`, `uogw_watches` y `active_public_flights`. Se entrena principalmente sobre una cuadrícula sintética consistente con reglas, más el punto en vivo, por lo que aproxima la lógica de `compute_us_open_status.py` del repositorio de GitHub.
- **Anomaly intensity**: usa una regresión `Ridge` sobre 58 instantáneas fechadas del dataset UOGW para predecir un valor de intensidad definido como `3·alert + 2·watch + info`.
- **NWS severity**: usa un `RandomForestClassifier` sobre tokens de eventos con hash y flags de warning/watch/advisory para clasificar la severidad en Unknown, Minor, Moderate, Severe o Extreme, con 227 alertas en vivo como datos de entrenamiento.

El entrenamiento se ejecuta diariamente a las 20:00 UTC mediante un GitHub Action que clona el dataset GIR, ejecuta `train_hf_models.py` y sube los modelos actualizados a Hugging Face. No se emplean técnicas como RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo.

## Capacidades

- Clasificación del estado de alerta abierto en cuatro niveles (GREEN, YELLOW, ORANGE, RED) a partir de indicadores públicos de NWS, USGS y UOGW.
- Regresión de la intensidad de anomalías, con una relación lineal definida por la fórmula `3·alert + 2·watch + info`.
- Clasificación de la severidad de alertas NWS en cinco categorías, utilizando tokens de texto y flags de severidad.
- Integración sencilla en Python mediante la función `predict_open_status` del módulo `inference.py`, que acepta los cinco factores de entrada y devuelve el estado predicho.
- Reentrenamiento automático diario, lo que permite mantener los modelos al día con las fuentes abiertas.
- No dispone de generación de texto, razonamiento general, soporte de tool calling, capacidades multilingües más allá del inglés, ni capacidades de visión o audio.

## Casos de uso

- **Monitorización de alertas en tiempo real**: el modelo puede integrarse en un dashboard que reciba recuentos de alertas NWS, magnitudes sísmicas del USGS y alertas UOGW, y muestre el nivel de estado abierto predicho con una actualización diaria automática.
- **Análisis de intensidad de anomalías**: la cabeza de regresión Ridge permite estimar la intensidad relativa de un evento a partir de alertas, vigilancias e informes, útil para comparar la gravedad de distintos episodios en una serie temporal.
- **Filtrado de alertas NWS por severidad**: el RandomForest clasifica alertas en cinco niveles, lo que permite priorizar y filtrar eventos en un sistema de gestión de incidencias basado en fuentes abiertas.
- **Educación y formación en ciencia de datos**: al ser un proyecto de código abierto con scikit-learn, sirve como ejemplo práctico de clasificación y regresión tabular aplicada a datos geospaciales, con un pipeline reproducible y reentrenable.
- **Prototipos de sistemas de información de riesgos**: se puede utilizar en prototipos que combinen NWS, USGS y EONET para evaluar la viabilidad de un sistema de alerta pública sin depender de canales clasificados.
- **Comprobación de coherencia de briefings**: el modelo ofrece una aproximación rápida del banner publicado, permitiendo verificar si la información pública coincide con la lógica de `compute_us_open_status.py` del repositorio de GitHub.

## Benchmarks y rendimiento

| Modelo / Metrica | Resultado |
|---|---|
| Open status - holdout accuracy | 0.904 |
| Open status - macro-F1 | 0.838 |
| Anomaly intensity - R² | ≈ 1.0 (definición lineal) |
| NWS severity - metricas | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las métricas mostradas provienen de la model card y del archivo `metrics.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU, por lo que la VRAM es 0.
- GPU recomendadas: ninguna; el modelo se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no aplica, al ser modelos scikit-learn en formato joblib.
- Opciones de despliegue: ejecución directa en Python con scikit-learn y joblib, integración en pipelines de GitHub Actions, o carga mediante `huggingface_hub` para descargar los artefactos.
- Latencia y throughput: no disponible; al ser modelos tabulares de pequeño tamaño, la inferencia es casi instantánea en cualquier CPU moderna.

## Comparativa con modelos similares

| Modelo | Tarea | Licencia | Formato | Notas |
|---|---|---|---|---|
| GIR Open-Tier Suite | Clasificación tabular multi-head | MIT | joblib | Modelo principal de esta ficha |
| uogw-scientific-suite | Modelo científico para UOGW | MIT | no disponible | Modelo hermano del mismo autor, con enfoque en datos meteorológicos abiertos |
| Otros modelos tabulares en HuggingFace | Clasificación tabular | variable | variable | no disponible; no se han encontrado comparativas directas |

La comparativa se limita al modelo hermano `uogw-scientific-suite` porque no se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrena con una cuadrícula sintética consistente con reglas, por lo que no descubre una escala nueva de preparación y puede estar sesgado hacia la lógica de `compute_us_open_status.py`.
- No está clasificado y no debe interpretarse como DEFCON, FPCON ni como soporte para operaciones de targeting.
- No es un sustituto de los canales oficiales de NWS, USGS o CISA; no debe usarse como única fuente para decisiones de seguridad vital.
- Los datos de entrenamiento son limitados: 4,001 factores sintéticos y en vivo para open status, 58 instantáneas para intensidad y 227 alertas para severidad NWS.
- Solo soporta el idioma inglés, tanto en los datos de entrada como en las etiquetas de salida.
- Al no ser un modelo generativo, no produce texto ni explicaciones; solo devuelve predicciones numéricas o categóricas.
- La licencia MIT permite uso comercial, pero el autor advierte explícitamente que no debe emplearse en contextos de seguridad crítica.

## Enlaces

- HuggingFace: https://huggingface.co/aerostratospheric/gir-open-tier-suite
- Dataset GIR: https://huggingface.co/datasets/aerostratospheric/gir
- Dataset UOGW: https://huggingface.co/datasets/aerostratospheric/uogw
- Repositorio de código: https://github.com/Midwest-Stratospheric/aerostratospheric-defense-gir
- Página del proyecto Defense GIR: https://midwestsds.com/aerostratospheric-defense-gir.html
- Sitio principal: https://www.midwestsds.com/
- Organización en HuggingFace: https://huggingface.co/aerostratospheric
- GitHub de Midwest Stratospheric: https://github.com/Midwest-Stratospheric
