# OneScience-Group/PINN-TC

## Resumen

PINN-TC es un modelo de red neuronal informada por física (PINN) desarrollado por OneScience-Group para reconstruir campos tridimensionales de viento, geopotencial y velocidad vertical en ciclones tropicales a partir de observaciones dispersas (vuelos, dropsondes o simulaciones). El modelo emplea ecuaciones físicas para restringir las regiones no observadas, lo que lo hace utilizable en investigaciones de inicialización de vórtices y asimilación de datos meteorológicos.

El método fue propuesto por equipos de Princeton, Caltech, Stanford y el Laboratorio de Dinámica de Fluidos Geofísicos de la NOAA, y se validó con simulaciones del huracán Ida (T-SHiELD) y observaciones de vuelo, dropsonde y radar Doppler. La arquitectura concreta de la red no está especificada en la documentación disponible; el modelo está implementado en PyTorch y se distribuye con scripts de entrenamiento e inferencia que incluyen restricciones de ecuaciones diferenciales parciales.

El repositorio no incluye los pesos oficiales del paper, sino un checkpoint de ingeniería generable mediante los scripts incluidos. Este checkpoint está pensado para validar el flujo de trabajo, no para reproducir el rendimiento formal del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; red neuronal informada por física (PINN) implementada en PyTorch |
| Parametros totales | No disponible |
| Parametros activos | No es un modelo MoE |
| Longitud de contexto | No aplicable (modelo científico, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun metadatos de HuggingFace) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt) y scripts de entrenamiento (Python) |

## Arquitectura y entrenamiento

PINN-TC es una red neuronal informada por física que aprende a reconstruir campos meteorológicos tridimensionales a partir de coordenadas de observación `[y, x, t, p]`. El entrenamiento optimiza de forma conjunta una pérdida de datos de observación y los residuales de ecuaciones físicas: las ecuaciones de momento horizontal en el plano beta y la ecuación de continuidad en coordenadas de presión. La velocidad vertical no es un objetivo directo, sino que queda restringida por dichas ecuaciones.

Los datos de entrenamiento descritos en el paper provienen de simulaciones T-SHiELD del huracán Ida y de observaciones de la NOAA/AOML, incluyendo vuelos a nivel de vuelo, dropsondes y radar Doppler. Los datos cubren un dominio horizontal de ±400 km, un rango vertical de 150 a 900 hPa y tiempos de observación en -3, 0 y +3 horas. La entrada son coordenadas espacio-temporales y las salidas son vientos y geopotencial.

El repositorio actual, sin embargo, incluye únicamente datos sintéticos de pequeño tamaño para validar el pipeline de entrenamiento, inferencia y evaluación. El entrenamiento puede ejecutarse en un solo dispositivo o en paralelo con `torchrun` para multi-GPU.

## Capacidades

- Reconstrucción de campos tridimensionales de viento, geopotencial y velocidad vertical de presión a partir de observaciones dispersas de ciclones tropicales.
- Restricción física de regiones no observadas mediante ecuaciones de momento y continuidad.
- Inicialización de vórtices para modelos numéricos de ciclones tropicales.
- Entrenamiento en paralelo multi-GPU mediante `torchrun` (8 procesos por nodo en el ejemplo proporcionado).
- Soporte de evaluación de métricas científicas: RMSE de velocidad del viento, correlación de Pearson, residuales de ecuación física y RMSE radial.
- Incluye utilidades de visualización para comparar observaciones, objetivos y predicciones en cuatro paneles.

## Casos de uso

- Investigación en meteorología tropical: reconstruir campos tridimensionales de viento y geopotencial a partir de datos de vuelo y dropsonde de huracanes, permitiendo analizar la estructura interna del ciclón en regiones donde no hay observaciones directas.
- Asimilación de datos: proporcionar campos de estado físicamente consistentes como condición inicial para modelos de pronóstico atmosférico, mejorando la calidad de los análisis en ciclones tropicales.
- Inicialización de vórtices en simulaciones numéricas: generar campos de viento y presión que respeten las ecuaciones de movimiento, reduciendo el desequilibrio inicial en modelos de alta resolución.
- Diseño de misiones de muestreo: experimentar con configuraciones sintéticas de observaciones dispersas para evaluar qué patrones de vuelo o dropsonde proporcionan mejor información para la reconstrucción.
- Entrenamiento distribuido en infraestructura GPU o DCU: usar los scripts incluidos con `torchrun` para escalar el entrenamiento y validar el rendimiento en clústeres científicos.
- Reproducción de flujos de trabajo AI4S: ejecutar el ciclo completo de generación de datos, entrenamiento, inferencia y evaluación en entornos como OneCode o ModelScope, con aplicación docente o de verificación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona métricas de evaluación (RMSE de velocidad del viento, correlación de Pearson, residuales de PDE y RMSE radial), pero indica explícitamente que los resultados con datos sintéticos solo validan el flujo de trabajo y no representan el rendimiento formal del paper.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia; una CPU puede usarse para validar el workflow con la configuración de datos pequeños por defecto.
- Los usuarios de DCU deben instalar DTK 25.04.2 o posterior, o la versión recomendada por OneScience para el clúster.
- Para entrenamiento multi-GPU, el ejemplo proporcionado usa `torchrun --nproc_per_node=8 --nnodes=1`.
- El consumo de VRAM no está especificado en la documentación; al tratarse de un modelo de tamaño no divulgado, se recomienda probar primero en CPU o en una GPU de gama media.
- El despliegue se realiza mediante scripts Python y PyTorch; no se indican opciones de integración con frameworks como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Enfoque | Arquitectura | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PINN-TC | Reconstrucción de ciclones tropicales con restricciones físicas | No especificada | No disponible | CC-BY-4.0 | HuggingFace y repositorios OneScience |
| PINNsformer | Predicción de soluciones de EDP dependientes del tiempo | Transformer-based PINN | No disponible | No indicada en la información disponible | HuggingFace y GitHub OneScience |

Ambos modelos son desarrollados o distribuidos por OneScience-Group y comparten la filosofía de redes informadas por física, pero difieren en su aplicación: PINNsformer está orientado a EDP generales, mientras que PINN-TC está especializado en ciclones tropicales. No se dispone de datos de rendimiento comparativos entre ambos.

## Limitaciones y advertencias

- El repositorio no incluye los pesos oficiales del paper; no se confirma la existencia de un checkpoint público con el rendimiento documentado.
- El checkpoint generado por los scripts es de ingeniería local y no se garantiza compatibilidad con pesos externos ni equivalencia con el entrenamiento del paper.
- Los datos de entrenamiento incluidos en el repositorio son sintéticos de pequeño tamaño y no representan la distribución oficial de T-SHiELD ni de la NOAA.
- Los resultados obtenidos con estos datos solo validan el flujo de trabajo, no el rendimiento científico real.
- No se documentan sesgos, riesgos de alucinación ni limitaciones específicas de dominio más allá de la ausencia de pesos oficiales.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se proporciona información sobre patentes u otros derechos de propiedad intelectual asociados al método.
- El idioma de los metadatos se indica como inglés, aunque al ser un modelo científico no tiene una funcionalidad lingüística que condicione su uso.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/PINN-TC
- Paper: https://doi.org/10.1038/s43247-023-01144-2
- GitHub OneScience: https://github.com/onescience-ai/OneScience
- Gitee OneScience: https://gitee.com/onescience-ai/onescience
- Repositorio de skills: https://github.com/onescience-ai/oneskills
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
