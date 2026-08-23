# Sirocco-rt/speculate_cv_emulators

## Resumen

Speculate CV emulators es un conjunto de emuladores espectrales desarrollados por la colaboración SIROCCO (Universidad de Southampton y colaboradores) para la inferencia rápida de parámetros de vientos en discos de acreción, específicamente orientados a variables cataclísmicas (CV). El modelo actúa como una aproximación sustituta al código de transferencia radiativa Monte Carlo SIROCCO, que resulta computacionalmente inviable dentro de bucles de inferencia bayesiana. El emulador se entrena sobre librerías sintéticas de espectros generadas con SIROCCO, y permite ajustar observaciones espectroscópicas a los parámetros físicos del viento (densidad, temperatura, velocidad) en milisegundos en lugar de horas o días.

La relevancia actual de esta herramienta reside en la creciente necesidad de interpretar espectros de alta resolución de sistemas binarios compactos y núcleos galácticos activos (AGN) con métodos de inferencia estadística. Al ser un emulador, no es un modelo de lenguaje ni de visión, sino un modelo de aprendizaje automático (no se especifica la arquitectura en la información proporcionada) que aproxima la función de mapeo entre los parámetros físicos del viento y el espectro sintético. El repositorio tiene un tamaño de 0,08 GB, con licencia GPL-3.0 y documentación en inglés. La versión actual (0.5.0) corresponde a la infraestructura publicada en el repositorio de GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la documentación pública) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, es un emulador espectral) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (probablemente archivos binarios o pickle del emulador, sin confirmar) |

## Arquitectura y entrenamiento

El emulador se entrena sobre dos conjuntos de datos sintéticos publicados en Hugging Face: `Sirocco-rt/speculate_cv_bl_grid_v87f` y `Sirocco-rt/speculate_cv_no-bl_grid_v87f`. Estos conjuntos contienen espectros sintéticos generados con el código SIROCCO (Matthews et al. 2024, DOI: 10.1093/mnras/stae2677) para vientos de discos de acreción en variables católicas. La arquitectura interna del emulador no está documentada en la información proporcionada; el repositorio de GitHub (`sirocco-rt/speculate`) indica que se trata de una herramienta de emulación que permite la inferencia aproximada de los parámetros de SIROCCO a partir de un espectro observado. No se han publicado detalles sobre el tipo de modelo (red neuronal, proceso gaussiano, etc.) ni sobre el número de tokens o épocas de entrenamiento. La innovación técnica principal es la construcción de una librería sintética de espectros y el emulador asociado para acelerar los bucles de inferencia, evitando ejecutar el código Monte Carlo directamente.

## Capacidades

- Emulación de espectros de vientos en discos de acreción para variables católicas (CVs), incluyendo vientos biconicales y esféricos.
- Inferencia rápida de parámetros físicos del viento (p.ej., densidad, temperatura, velocidad) a partir de un espectro observado.
- Aproximación de los resultados de SIROCCO en tiempos de milisegundos, frente a las horas o días que requeriría la simulación completa.
- Soporte para dos variantes de grid: con y sin "blacklist" de líneas (los datasets `bl` y `no-bl`), que permiten estudiar el efecto de las líneas de absorción en el ajuste.
- Integración con el paquete `speculate` de Python, que incluye el emulador y funciones de ajuste.
- Capacidad de generar espectros sintéticos para cualquier combinación de parámetros dentro del rango del grid de entrenamiento.

## Casos de uso

- **Análisis de espectros de variables católicas**: el emulador permite a los astrónomos ajustar espectros observados de CVs y obtener los parámetros físicos del viento (densidad, temperatura, velocidad) sin ejecutar SIROCCO completo.
- **Estudios de población**: al ser rápido, se pueden procesar miles de espectros de catálogos para estadísticas de propiedades de vientos en sistemas binarios.
- **Validación de modelos físicos**: los investigadores pueden comparar las predicciones del emulador con nuevas simulaciones de SIROCCO para verificar la precisión del emulador en regiones del espacio de parámetros.
- **Preparación de campañas observacionales**: para planificar observaciones de espectroscopia de alta resolución, el emulador genera espectros sintéticos de referencia.
- **Educación y divulgación**: como herramienta de demostración para enseñar transferencia radiativa en discos de acreción, sin necesidad de ejecutar códigos Monte Carlo pesados.
- **Análisis de AGN**: aunque el grid actual es para CVs, la metodología se extiende a AGN (según la publicación en preparación de Wallis et al. 2026), por lo que el emulador puede servir de base para futuras versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los artículos de referencia (Matthews et al. 2024 y Wallis et al. 2026, en preparación) presentarán validaciones del emulador frente a simulaciones SIROCCO completas, pero esos datos no están accesibles en la documentación pública del modelo. No se puede comparar con otros emuladores espectrales porque no se han facilitado métricas cuantitativas (error medio, chi-cuadrado, etc.).

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero el tamaño del repo (0,08 GB) sugiere que el modelo es ligero y probablemente ejecutable en CPU sin GPU.
- **GPU recomendada**: no se especifica; se puede ejecutar en CPU estándar para la mayoría de casos.
- **Compatibilidad con GPU de consumo**: probablemente sí, si la implementación permite aceleración con GPU, pero no está documentado.
- **Opciones de despliegue**: el paquete `speculate` se distribuye como librería Python; se puede usar en entornos Jupyter, scripts de análisis, o en pipelines de reducción de datos astronómicos.
- **Latencia y rendimiento**: no hay cifras publicadas, pero la finalidad del emulador es precisamente reducir el tiempo de inferencia de horas a segundos o milisegundos.

## Comparativa con modelos similares

No se dispone de comparativas con otros emuladores espectrales astronómicos en la información proporcionada. En la literatura existen emuladores para otros códigos de transferencia radiativa (p. ej., Cloudy o TURBOSPEC), pero no se han publicado comparaciones cuantitativas con este modelo. La comparativa sería relevante en términos de precisión y velocidad, pero esos datos no están disponibles.

## Limitaciones y advertencias

- **Modelo aproximado**: el emulador proporciona una aproximación de los espectros de SIROCCO; no sustituye a la simulación completa en casos de precisión crítica.
- **Rango de validez**: solo es válido dentro del espacio de parámetros cubierto por los grids de entrenamiento (`speculate_cv_bl_grid_v87f` y `speculate_cv_no-bl_grid_v87f`); extrapolar fuera de estos rangos puede producir resultados erróneos.
- **Idioma**: la documentación y el modelo están en inglés; no hay soporte multilingüe.
- **Licencia**: GPL-3.0, que permite uso comercial pero obliga a publicar cualquier derivado bajo la misma licencia y a incluir el código fuente.
- **Dependencia de la calidad del grid**: la precisión del emulador depende de la densidad y cobertura del grid de espectros sintéticos; grids escasos pueden llevar a errores en regiones no muestreadas.
- **Estado de desarrollo**: los artículos de publicación están en preparación (2026), por lo que la herramienta puede cambiar sin aviso en versiones futuras.

## Enlaces

- Hugging Face: https://huggingface.co/Sirocco-rt/speculate_cv_emulators
- Repositorio GitHub de Speculate: https://github.com/sirocco-rt/speculate
- Documentación de Speculate (ReadTheDocs): https://sirocco-rt.readthedocs.io/en/latest/speculate.html
- Código SIROCCO: https://github.com/sirocco-rt/sirocco
- Artículo de SIROCCO (Matthews et al. 2024): DOI: 10.1093/mnras/stae2677
