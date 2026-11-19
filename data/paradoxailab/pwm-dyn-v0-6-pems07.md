# paradoxailab/pwm-dyn-v0.6-pems07

## Resumen

PWM-Dyn v0.6 (variante PEMS07) es un modelo de predicción de series temporales espacio-temporales desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model. Concretamente, resuelve la tarea de predecir los próximos 12 pasos de tráfico a partir de datos de 883 sensores del distrito 7 de Caltrans PeMS en Los Ángeles. Es el modelo número 10 de los 56 publicados en la serie (numerada del 01 al 59) y forma parte de la familia PWM-Dyn, cuyo foco es el pronóstico de tráfico y otras señales espacio-temporales.

El modelo es extremadamente compacto: 408.164 parámetros en total, lo que lo sitúa en la categoría de modelos ligeros diseñados para despliegue en entornos con recursos limitados. Se distribuye como un checkpoint de PyTorch (`.pt`) que contiene tanto los pesos como la configuración de entrenamiento y los resultados registrados. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta versión radica en la eliminación de la entrada de climatología (climatology input), que según la model card era la causa de la pérdida en la versión v0.4. El autor reporta que esta versión supera a v0.3 en PEMS08 y PEMS04, y obtiene los mejores resultados en PEMS04, PEMS07, METR-LA y PEMS-BAY frente a re-ejecuciones de STID, Graph WaveNet y STAEformer. El resultado registrado en ParadoxBench-1.1 Track A es un MAE de 19,56 en el conjunto de test, medido con un ensemble de 3 semillas (100-102), siendo este archivo la semilla 100.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor) |
| Parámetros totales | 408.164 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict dentro de un checkpoint con metadatos) |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información proporcionada; la model card indica que el código de la arquitectura de esta versión está en el repositorio de GitHub del autor y que la configuración de entrenamiento se almacena dentro del propio archivo (bajo la clave `ck['cfg']`). Por la naturaleza de la tarea (predicción espacio-temporal sobre 883 sensores de tráfico) y por la comparación con STID, Graph WaveNet y STAEformer, cabe esperar un modelo de grafos espacio-temporales, pero este dato no se confirma en la documentación disponible.

El entrenamiento se realizó el 2026-11-03 en un notebook de Kaggle (identificador `d0ba070ac4`, versión 365009705, con fechas 2026-11-02/03). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y términos se documentan en `DATA_SOURCES.md`. La innovación principal de esta versión es la eliminación de la entrada de climatología, que había causado la pérdida en v0.4. No se menciona el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de forecasting. El resultado reportado se obtiene con un ensemble de 3 semillas (100, 101 y 102), y el archivo publicado corresponde a la semilla 100.

## Capacidades

- Predicción de los próximos 12 pasos temporales de tráfico a partir de datos de sensores de PeMS07 (883 sensores, distrito 7 de Caltrans, Los Ángeles).
- Forecasting espacio-temporal multivariante sobre redes de sensores.
- Capacidad de ensemble: el autor reporta resultados con 3 semillas, lo que sugiere que el modelo es estable y reproducible bajo distintas inicializaciones.
- Entrenamiento y evaluación sobre múltiples datasets de tráfico: PEMS03, PEMS04, PEMS07, PEMS08, METR-LA y PEMS-BAY (según las referencias de la serie y las comparaciones).
- No se reportan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; es un modelo puramente numérico de series temporales.
- No se reportan capacidades multilingües (no aplica).

## Casos de uso

- Predicción de tráfico a corto plazo en autopistas: el modelo puede generar los próximos 12 pasos de ocupación o flujo a partir de los 883 sensores de PeMS07, útil para paneles de control de tráfico en tiempo real.
- Gestión de incidentes y alertas tempranas: con predicciones a 12 pasos, un operador de tráfico puede anticipar congestiones y activar protocolos antes de que se produzcan.
- Enrutamiento dinámico y sistemas de navegación: las predicciones alimentan motores de rutas que ajustan estimaciones de tiempo de llegada según la evolución prevista del tráfico.
- Investigación en modelos espacio-temporales: al ser un checkpoint pequeño (408.164 parámetros) con configuración incluida y licencia Apache-2.0, sirve como baseline reproducible para comparar nuevas arquitecturas en PEMS07.
- Despliegue en entornos con recursos limitados: el tamaño reducido del modelo (1,66 MB en disco) permite ejecutarlo en CPU o en dispositivos edge sin GPU dedicada, algo relevante para cabinas de control o sistemas embebidos.
- Simulación y planificación urbana: las predicciones a 12 pasos pueden integrarse en simuladores de tráfico para evaluar escenarios de obra, eventos o cambios de carril.
- Reproducción de benchmarks: el archivo incluye los resultados y los logs de ejecución (`ck['results']`), lo que facilita la verificación independiente de las cifras reportadas en ParadoxBench-1.1 Track A.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Contexto |
|---|---|---|---|
| ParadoxBench-1.1 Track A (PEMS07) | MAE | 19,56 | Ensemble de 3 semillas (100-102); este archivo es la semilla 100 |

El autor reporta que esta versión obtiene los mejores resultados en PEMS04, PEMS07, METR-LA y PEMS-BAY frente a re-ejecuciones de STID, Graph WaveNet y STAEformer, y que supera a v0.3 en PEMS08 y PEMS04. No se proporcionan las cifras concretas de esas comparaciones en la información disponible, por lo que no se incluyen en la tabla para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32, dado que el modelo tiene 408.164 parámetros (aproximadamente 1,6 MB de pesos). No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere una A100 ni H100. Una RTX 4090 o incluso una GPU integrada pueden ejecutar el modelo sin problemas.
- Cabe en cualquier GPU de consumo e incluso en CPU: el checkpoint pesa 1.659.009 bytes (1,66 MB).
- Opciones de despliegue: al ser un checkpoint de PyTorch, se carga con `torch.load` y se ejecuta con PyTorch estándar. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS07) | 408.164 | no disponible | Forecasting de tráfico (12 pasos) | Apache-2.0 | Hugging Face |
| STID | no disponible | no disponible | Forecasting espacio-temporal | no disponible | Referenciado como baseline |
| Graph WaveNet | no disponible | no disponible | Forecasting espacio-temporal | no disponible | Referenciado como baseline |
| STAEformer | no disponible | no disponible | Forecasting espacio-temporal | no disponible | Referenciado como baseline |

La información disponible no incluye los parámetros, contextos ni licencias de STID, Graph WaveNet y STAEformer; solo se confirma que el autor los re-ejecutó como comparación. No se dispone de una comparativa cuantitativa detallada más allá de la afirmación de que PWM-Dyn v0.6 obtiene los mejores resultados en PEMS04, PEMS07, METR-LA y PEMS-BAY.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en predicción de tráfico sobre PEMS07; no es un modelo de propósito general ni admite otras tareas.
- El resultado reportado (MAE 19,56) corresponde a un ensemble de 3 semillas; el archivo publicado es solo la semilla 100, por lo que el rendimiento individual puede diferir del reportado en el ensemble.
- Los datos de entrenamiento no se incluyen en el repositorio; su reproducibilidad depende de las fuentes y términos documentados en `DATA_SOURCES.md`.
- No se documentan sesgos conocidos, pero al entrenarse sobre datos de tráfico de Los Ángeles (Caltrans District 7), el modelo puede no generalizar a otras regiones, condiciones meteorológicas o patrones de tráfico no representados.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones erróneas en regímenes no vistos (incidentes, eventos extremos, cambios de infraestructura).
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de licencia y la atribución.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-18), lo que indica que no ha pasado por una validación comunitaria amplia.
- No se dispone de información sobre la arquitectura exacta ni sobre los tipos de cuantización soportados; para producción conviene revisar el código del repositorio de GitHub antes de integrarlo.

## Enlaces

- [Hugging Face: paradoxailab/pwm-dyn-v0.6-pems07](https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems07)
- [Repositorio GitHub: paradox-world-model](https://github.com/paradoxailab/paradox-world-model)
- [RESULTS.md](https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md)
- [v0.6-conference/README.md](https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md)
- [Índice de la serie de modelos](https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md)
- [DATA_SOURCES.md](https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md)
- [CITATION.cff](https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff)
- [Modelo anterior: pwm-dyn-v0.6-pems03](https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems03)
- [Modelo siguiente: pwm-dyn-v0.6-metr-la](https://huggingface.co/paradoxailab/pwm-dyn-v0.6-metr-la)
- [Colección completa: paradox-world-model-series](https://huggingface.co/paradoxailab/paradox-world-model-series)
- [Sitio web de ParadoxAI Lab](https://paradoxailab.com)
