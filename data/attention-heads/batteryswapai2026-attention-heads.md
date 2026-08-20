# Attention-Heads/BatterySwapAI2026-attention-heads

## Resumen

El repositorio `Attention-Heads/BatterySwapAI2026-attention-heads` no es un modelo de inteligencia artificial generativa, sino un ejemplo de solución para el desafío BatterySwapAI 2026, una competición de planificación de sustitución de baterías organizada por Nora AI. El autor, el equipo Attention-Heads, publica este repositorio como plantilla funcional que puede enviarse tal cual al sistema de evaluación, junto con herramientas para validar y visualizar los resultados antes de la presentación.

El problema que resuelve es la planificación de cuándo sustituir baterías en edificios, minimizando el coste total a lo largo de una ventana de 42 días. El repositorio incluye un planificador de ejemplo (en un archivo pickle), un script de entrenamiento, un sistema de análisis visual que reproduce cada escenario día a día y herramientas para empaquetar la solución en Docker. No se trata de un modelo con pesos preentrenados, sino de un pipeline de código que combina predicción de vida útil restante, cálculo de probabilidades de fallo y optimización de costes.

La relevancia actual reside en que es una referencia oficial para participantes del desafío BatterySwapAI 2026, que necesitan entender el formato de evaluación, los plazos de las ventanas y cómo se puntúan los planes. El repositorio está bajo licencia MIT, tiene un tamaño de 0.0 GB (no contiene pesos de modelo) y fue actualizado por última vez el 19 de agosto de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de red neuronal preentrenado) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el código está en inglés, los datos son de baterías) |
| Licencia | MIT |
| Formato de pesos | No aplicable (no hay pesos; contiene código Python y un archivo `best.pickle` con el planificador de ejemplo) |

## Arquitectura y entrenamiento

No se trata de un modelo de lenguaje ni de un transformer con pesos entrenados. El repositorio contiene un pipeline de planificación que consta de dos partes principales: un predictor de vida útil de baterías y un planificador consciente de costes. El predictor puede ser cualquiera de cuatro formas: una función `predict_cdf_days` que devuelve una función de distribución acumulada (CDF) de probabilidad de fallo, un método `_predict` con atributo `horizons`, una función `predict_eol` que devuelve timestamps de fin de vida, o un atributo `rul_estimator`/`rul_model` que devuelve cuantiles de vida útil restante en días.

El entrenamiento se ejecuta con el script `batteryswap_example/train.py`, que genera un planificador serializado en `batteryswap_example/planners/best.pickle`. El análisis posterior usa la métrica oficial `batteryswap_public.metric.compute_inner()`, que calcula el coste total medio sobre los escenarios. No se documentan técnicas de aprendizaje profundo (RLHF, DPO, etc.) en la model card; el enfoque es de optimización de costes con predicción estadística de supervivencia.

## Capacidades

- Planificación de sustitución de baterías en una ventana de 42 días, minimizando el coste total por escenario.
- Predicción de probabilidad de fallo de baterías mediante modelos de supervivencia (CDF) o predicción de fecha de fin de vida.
- Análisis de costes por componente (sustitución, penalizaciones, etc.) con comparación contra un caso de referencia "oráculo" que sustituye solo las baterías que realmente mueren en la ventana.
- Reproducción día a día de los planes de sustitución, con órdenes de trabajo del técnico y acumulación de costes.
- Visualización de curvas de voltaje de baterías, con el punto de corte de datos, el futuro oculto y el cruce del umbral de 2.4 V.
- Comparación de rendimiento entre el split local `train` y los splits `public`/`private` del leaderboard, componente por componente.
- Soporte para múltiples tipos de predictores: CDF, fecha de fin de vida, RUL cuantiles.
- Validación de soluciones en Docker para garantizar compatibilidad con el sistema de presentación.

## Casos de uso

- Gestión de flotas de baterías en edificios: el planificador decide qué baterías sustituir cada día de la ventana de 42 días, basándose en predicciones de vida útil y costes de sustitución.
- Mantenimiento predictivo de sistemas de almacenamiento de energía: las predicciones de CDF permiten anticipar fallos y programar sustituciones con antelación, reduciendo costes de emergencia.
- Evaluación de estrategias de sustitución: el análisis visual compara el coste del planificador contra un caso ideal, mostrando cuánto coste es recuperable.
- Auditoría de decisiones de mantenimiento: el reporte HTML reproduce cada día y muestra las órdenes de trabajo del técnico, permitiendo revisar por qué se tomó cada decisión.
- Calibración de modelos de supervivencia: la curva de calibración muestra si la probabilidad predicha de fallo se ajusta a la frecuencia real de fallos, útil para ajustar umbrales.
- Preparación de soluciones para la competición BatterySwapAI 2026: el repositorio sirve como plantilla para que los participantes implementen sus propios planificadores y validen sus envíos con la métrica oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona que el leaderboard evalúa los splits `public` y `private`, pero no proporciona los resultados obtenidos por el planificador de ejemplo. La métrica oficial es el coste total medio por escenario, calculado con `batteryswap_public.metric.compute_inner()`, pero no se incluye el valor concreto.

## Requisitos de hardware

- No se especifican requisitos de GPU en la model card.
- El entrenamiento del planificador de ejemplo se ejecuta con `python batteryswap_example/train.py`, que probablemente solo requiere CPU y memoria RAM estándar (el dataset de baterías no es de gran tamaño).
- La construcción de la imagen Docker para evaluar las subidas requiere unos 20 GB de espacio en disco, según la documentación.
- No se indican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable con modelos de lenguaje o generativos. Su equivalente serían otras soluciones del desafío BatterySwapAI 2026, que no se han publicado en la información disponible.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no genera texto, código ni respuestas; es un pipeline de planificación en Python.
- El repositorio contiene solo un ejemplo funcional, no una solución optimizada; el rendimiento en el leaderboard puede variar significativamente según el split.
- El dataset `train` solo incluye 82 de 461 dispositivos con fin de vida registrado, y en una ventana de 6 semanas mueren entre 2 y 17 baterías por escenario, lo que hace que el coste sea muy variable.
- El número de baterías disminuye de 458 en el primer escenario a 381 en el último, porque las baterías muertas no se reemplazan en los datos; esto afecta a la comparabilidad de escenarios.
- Los números del reporte de análisis no son comparables directamente con la puntuación del leaderboard, porque los splits `public`/`private` contienen edificios y baterías diferentes al split `train`.
- La licencia MIT permite uso comercial, pero el repositorio está orientado a la competición y no garantiza resultados en producción.
- No se informa de sesgos de idioma o alucinación porque no es un modelo de lenguaje.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Attention-Heads/BatterySwapAI2026-attention-heads
- Página del desafío BatterySwapAI 2026: https://www.nora.ai/competitions/batteryswapai/batteryswapai2026.html
