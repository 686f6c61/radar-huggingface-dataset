# OneScience-Group/GRACE-SEDA

## Resumen

GRACE-SEDA es un modelo de asimilación de datos auto-supervisada para la reconstrucción global de anomalías de almacenamiento total de agua (TWSA, Total Water Storage Anomalies) a resolución de 0,5 grados. Lo publica el grupo OneScience dentro de su catálogo de modelos de ciencias de la Tierra, y su diseño se basa en el trabajo científico propuesto por equipos que incluyen a la ETH Zurich, publicado en la revista Nature Water. El modelo aborda un problema clásico de la geodesia satelital: las observaciones de la misión GRACE ofrecen una señal agregada de masa terrestre con resolución espacial gruesa, mientras que los modelos hidrológicos como WGHM aportan estructura espacial fina pero con sesgos propios.

La propuesta combina ambas fuentes mediante un esquema de asimilación auto-supervisada con doble restricción: por un lado se optimiza el ajuste al agregado observado por GRACE y, por otro, la coherencia estructural con las variables hidrológicas de WGHM y GLDAS. La arquitectura se describe como un codificador-decodificador residual, entrenado con variables hidrológicas y coordenadas, y orientado a tres productos: reconstrucción de TWSA a 0,5 grados, estimación de incertidumbre mediante un ensemble profundo de cinco modelos y análisis de balance hídrico.

Es relevante ahora porque la monitorización de recursos hídricos a escala global requiere productos de alta resolución con incertidumbre cuantificada, y porque el repositorio ofrece una reproducción de ingeniería del método original (código de validación de datos, entrenamiento, inferencia, métricas hidrológicas y visualización) integrada en el ecosistema OneScience, con soporte para GPU y aceleradores DCU. Conviene señalar que este repositorio de HuggingFace no incluye pesos: los pesos y el código oficiales se distribuyen desde el GitLab público de la ETH Zurich.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador residual con asimilación auto-supervisada (doble restricción) |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplicable (modelo geoespacial, no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (documentación y etiquetas del repositorio); el modelo opera sobre datos geoespaciales, no sobre texto |
| Licencia | Apache 2.0 (repositorio de reproducción); el artículo original es CC BY 4.0 y el código y pesos oficiales conservan sus propios términos |
| Formato de pesos | no disponible (el repositorio no incluye pesos en `weight/`; los pesos oficiales están en el GitLab de la ETH Zurich) |
| Framework | PyTorch |
| Dominio | Ciencias de la Tierra, hidrología, geodesia satelital |
| Variable objetivo | TWSA (anomalías de almacenamiento total de agua) |
| Resolución espacial | 0,5 grados a escala global |
| Datos de entrada | JPL GRACE, WGHM, GLDAS y coordenadas |
| Estimación de incertidumbre | Ensemble profundo de cinco modelos |
| Autor | OneScience-Group |
| Fecha de creación en HuggingFace | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un codificador-decodificador residual. El codificador aprende una representación latente de las variables hidrológicas y las coordenadas de entrada, y el decodificador reconstruye el campo de anomalías de almacenamiento total de agua a resolución de 0,5 grados. Sobre esta base se aplican dos restricciones auto-supervisadas simultáneas: un término de agregado GRACE, que fuerza a que la integral espacial de la reconstrucción sea coherente con la observación satelital, y un término estructural WGHM, que preserva la distribución espacial fina del modelo hidrológico. Este esquema permite entrenar sin etiquetas de alta resolución, que en la práctica no existen para esta variable.

El entrenamiento se realizó con variables hidrológicas de JPL GRACE, WGHM y GLDAS junto con coordenadas espaciales. La model card no especifica el número de tokens ni el volumen exacto de datos, ni detalla si se aplicaron técnicas de ajuste por refuerzo; esa información no está disponible en el material proporcionado. El repositorio describe el flujo de trabajo completo: generación de datos sintéticos de prueba, entrenamiento en una o varias GPU mediante `torchrun`, inferencia que restaura los cinco modelos del ensemble y un script de evaluación que reporta correlación finita, error del agregado e incertidumbre.

## Capacidades

- Reconstrucción global de anomalías de almacenamiento total de agua a resolución de 0,5 grados (downscaling de productos GRACE).
- Asimilación auto-supervisada que equilibra el agregado observado por GRACE con la estructura espacial de WGHM.
- Estimación de incertidumbre mediante un ensemble profundo de cinco modelos.
- Análisis de balance hídrico a partir de las series reconstruidas.
- Entrenamiento multi-GPU y multi-proceso mediante `torchrun --nproc_per_node`.
- Ejecución del ciclo completo (validación de datos, entrenamiento, inferencia, métricas hidrológicas y visualización) en el ecosistema OneScience, con soporte para GPU y DCU.
- Validación de conectividad en CPU con una configuración de muestra pequeña por defecto.
- No dispone de generación de texto, razonamiento lingüístico, tool calling, capacidades de agente, visión ni audio: es un modelo numérico de regresión geoespacial.

## Casos de uso

- Monitorización de sequías y estrés hídrico regional: las series de TWSA a 0,5 grados permiten seguir la evolución del almacenamiento de agua en cuencas concretas y detectar anomalías negativas persistentes con una resolución espacial útil para la gestión.
- Gestión de recursos hídricos en cuencas transfronterizas: al cubrir la totalidad del globo con una malla homogénea, el modelo facilita comparaciones entre países y cuencas que no comparten redes de medición in situ.
- Downscaling de productos GRACE: se toma el campo agregado de masa terrestre y se genera una reconstrucción de mayor resolución espacial, apta para su integración en sistemas de información geográfica.
- Cuantificación de incertidumbre en series hidrológicas: el ensemble de cinco modelos permite acotar el rango de error de la reconstrucción, algo crítico cuando las series se usan para decisiones de asignación de agua.
- Análisis de balance hídrico: las salidas del modelo pueden alimentar estudios de balance entre precipitación, evapotranspiración, escorrentía y variación de almacenamiento, combinándolas con GLDAS y WGHM.
- Asimilación de datos en cadenas de reanálisis: el esquema auto-supervisado sirve como componente de fusión entre observaciones satelitales y modelos hidrológicos en pipelines operativos.
- Evaluación y calibración de modelos hidrológicos: la reconstrucción de TWSA actúa como referencia para detectar sesgos estructurales en modelos como WGHM en regiones con observación escasa.
- Reproducibilidad y validación metodológica: la ejecución de `scripts/fake_data.py`, `train.py`, `inference.py` y `result.py` permite a un equipo verificar la implementación sobre datos sintéticos antes de invertir en el entrenamiento completo.
- Formación e investigación: el flujo de trabajo completo sobre OneScience con soporte DCU es adecuado para entornos académicos que trabajan con aceleradores nacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el script de evaluación informa de correlación finita, error del agregado e incertidumbre, sin proporcionar valores numéricos ni comparaciones con otros métodos.

## Requisitos de hardware

- GPU o DCU recomendada para entrenamiento e inferencia; la CPU solo se contempla para validación de conectividad con la configuración de muestra pequeña por defecto.
- Usuarios de DCU deben instalar previamente DTK 25.04.2 o una versión compatible recomendada por OneScience.
- Entorno de referencia: Python 3.11 en Conda. Para GPU, con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12`; instalación mediante `pip install onescience[earth-gpu]`.
- Para DCU, instalación mediante `pip install onescience[earth-dcu]` sobre el toolkit DTK activado.
- Entrenamiento multi-GPU soportado mediante `torchrun --standalone --nproc_per_node=N scripts/train.py`; el ejemplo documentado usa 2 procesos.
- VRAM estimada por cuantización: no disponible.
- GPU concretas recomendadas (A100, H100, RTX 4090 u otras): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Autor | Enfoque | Resolución | Pesos incluidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GRACE-SEDA (este repositorio) | OneScience-Group | Reproducción de ingeniería del método, con flujo de entrenamiento e inferencia sobre OneScience | 0,5 grados | No (solo código) | Apache 2.0 | HuggingFace |
| GRACE-SEDA oficial | ETH Zurich (Space Geodesy) | Implementación original publicada junto al artículo | 0,5 grados | Sí, según el repositorio oficial | Términos propios del proyecto original | GitLab de la ETH Zurich |

No se dispone de información sobre otros modelos comparables de asimilación auto-supervisada para TWSA en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre lenguaje natural y no soporta tool calling ni flujos de agentes.
- El repositorio de HuggingFace no incluye pesos (`weight/` está vacío). Para obtener el modelo entrenado hay que acudir al GitLab oficial de la ETH Zurich y aceptar sus condiciones.
- Reproducción independiente: la propia model card indica que se trata de una reproducción de ingeniería de las especificaciones públicas, por lo que los resultados pueden diferir de los del modelo oficial.
- Licencia mixta: el repositorio se publica bajo Apache 2.0, el artículo original bajo CC BY 4.0, y el código, los pesos y los datos oficiales conservan sus propios términos. Verificar antes de cualquier uso comercial.
- Requiere datos externos (JPL GRACE, WGHM, GLDAS y coordenadas) que no se distribuyen con este repositorio y cuyos términos de uso deben comprobarse por separado.
- Resolución limitada a 0,5 grados: no apta para estudios a escala de subcuenca o parcelaria sin un postprocesado adicional.
- La calidad de la reconstrucción depende de la cobertura y calidad de la señal GRACE en cada región; en zonas con observación satelital deficiente la incertidumbre será mayor.
- La incertidumbre solo se cuantifica a través de un ensemble de cinco modelos; no se documentan intervalos de confianza calibrados ni validación contra mediciones in situ en la información disponible.
- Documentación únicamente en inglés.
- Riesgo de alucinación: no aplicable en el sentido lingüístico, pero sí existe riesgo de extrapolación espuria en regiones sin datos de entrenamiento representativos.
- No se especifican sesgos conocidos, número de parámetros, volumen de entrenamiento ni métricas de error publicadas, lo que dificulta una evaluación previa a su adopción en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/GRACE-SEDA
- Artículo científico: Global high-resolution total water storage anomalies from self-supervised data assimilation using deep learning algorithms — https://doi.org/10.1038/s44221-024-00194-w
- Código, modelos y pesos oficiales (ETH Zurich, Space Geodesy): https://gitlab.ethz.ch/spacegeodesy_public/grace_seda
- Los resultados de la búsqueda web proporcionada no contienen enlaces relacionados con el modelo; no se han podido recopilar recursos adicionales (demos, blogs o repositorios complementarios) a partir de ellos.
