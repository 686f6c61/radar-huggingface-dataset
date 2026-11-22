# PARADOXAIlabs/pwm-dyn-v0.7-metr-la

## Resumen

PWM-Dyn v0.7 METR-LA es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Se trata del modelo numero 17 de los 56 publicados hasta la fecha en la familia PWM-Dyn, y esta especializado en una tarea muy concreta: predecir los siguientes 12 pasos temporales de trafico viario a partir de los datos de METR-LA, la red de 207 sensores de bucle inductivo desplegados en las autopistas de Los Angeles.

El modelo es extremadamente compacto: 321.828 parametros en total, lo que lo situa en el rango de los modelos ligeros de forecasting y permite ejecutarlo en CPU sin dificultad. Su principal innovacion respecto a la version anterior (v0.6) es la incorporacion de entrenamiento especifico para caidas de sensores (outages), de modo que mantiene un error bajo incluso cuando parte de los detectores de la red no reportan datos. Segun la model card, esta version reduce el error en escenarios de outage real entre un 11% y un 22% frente a v0.6 en cinco redes distintas, con un coste de solo un 0,4-1,8% de degradacion en condiciones limpias.

La relevancia del modelo radica en su nicho: el mantenimiento predictivo y la gestion de trafico en entornos reales, donde los fallos de sensores son frecuentes. Frente a modelos genericos de series temporales de mayor tamano, PWM-Dyn v0.7 apuesta por un diseno minuciosamente ajustado al dominio METR-LA con un coste computacional minimo. La licencia Apache-2.0 facilita su uso comercial y su integracion en sistemas de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal en PyTorch; detalles en el repositorio GitHub del autor) |
| Parametros totales | 321.828 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (predice 12 pasos temporales hacia adelante) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no disponible (modelo numerico de series temporales, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict dentro de un diccionario con metadatos) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo; solo indica que es una red neuronal implementada en PyTorch cuyo codigo esta disponible en el repositorio de GitHub del autor. El checkpoint contiene el state dict de pesos, la configuracion de entrenamiento (`ck['cfg']`) y los resultados registrados (`ck['results']`). Con 321.828 parametros, se trata de un modelo de una magnitud muy inferior a los transformers habituales, coherente con una tarea de forecasting sobre 207 series correlacionadas.

El entrenamiento se realizo sobre METR-LA, un conjunto de datos publico de 207 sensores de bucle en autopistas de Los Angeles, con el objetivo de predecir los 12 pasos siguientes. La version v0.7 incorpora "fallback base + outage training": el modelo se entrena explicitamente para mantener predicciones razonables cuando hay sensores caidos, en lugar de depender unicamente de la imputacion. Segun la model card, esta estrategia reduce el error en outages reales entre un 11% y un 22% respecto a v0.6 en cinco redes, a cambio de un incremento de solo 0,4-1,8% en el error en condiciones limpias. El entrenamiento se ejecuto en un notebook de Kaggle (version 365414722, commit b0f6a08) el 4 de noviembre de 2026. No se especifican el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Prediccion de trafico a 12 pasos temporales sobre la red METR-LA (207 sensores).
- Funcionamiento robusto ante caidas parciales de sensores (outages), gracias al entrenamiento especifico de fallback.
- Inferencia sobre series temporales multivariantes con correlacion espacial entre sensores.
- Ejecucion en CPU y en GPU de gama baja por su reducido tamano (321.828 parametros).
- Carga programatica via `huggingface_hub` y `torch.load`, con acceso a metadatos, configuracion y resultados registrados en el propio checkpoint.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente numerico de forecasting.

## Casos de uso

- Gestion de trafico en tiempo real en autopistas: el modelo predice los proximos 12 pasos de velocidad/flujo en los 207 sensores de METR-LA, lo que permite a los operadores anticipar congestiones y activar rutas alternativas o paneles de mensaje variable.
- Tolerancia a fallos de sensores: cuando un detector de la red deja de reportar, el modelo mantiene predicciones utiles gracias a su entrenamiento de outage, evitando que el sistema de gestion pierda visibilidad de un tramo.
- Alimentacion de sistemas de enrutamiento dinamico: las predicciones a corto plazo pueden integrarse en motores de calculo de rutas que ajusten recomendaciones cada pocos minutos.
- Deteccion de anomalias en la red viaria: comparar la prediccion del modelo con la observacion real permite identificar incidentes (accidentes, obras, eventos) como desviaciones significativas.
- Simulacion y planificacion de infraestructura: usar el modelo como componente de un gemelo digital del corredor de Los Angeles para evaluar escenarios de demanda antes de invertir en cambios de infraestructura.
- Investigacion en forecasting espaciotemporal: al ser un modelo pequeno, reproducible y con licencia permisiva, sirve como baseline ligero para comparar nuevas arquitecturas sobre METR-LA en entornos academicos o de prototipado rapido.
- Despliegue en dispositivos de borde: por su tamano (1,3 MB de checkpoint), puede ejecutarse en hardware embebido de los propios centros de control de trafico o en unidades de carretera.

## Benchmarks y rendimiento

Resultados registrados en la model card (ParadoxBench-1.2, ensemble de 3 semillas; este archivo corresponde a la semilla 200):

| Metrica | Valor |
|---|---|
| MAE en condiciones limpias (clean) | 2,918 |
| MAE con outages reales (Track G) | 3,147 |

| Comparativa con version anterior | Cambio |
|---|---|
| Error en outages reales vs v0.6 (5 redes) | -11% a -22% |
| Error en condiciones limpias vs v0.6 | +0,4% a +1,8% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de forecasting de series temporales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint completo ocupa 1.322.226 bytes (aproximadamente 1,3 MB).
- GPU recomendadas: cualquiera; no requiere GPU. Funciona en CPU sin problemas y en cualquier GPU consumer (RTX 3060, RTX 4090, etc.).
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos de borde y microcontroladores con suficiente memoria.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load`), exportacion a TorchScript u ONNX si se necesita, y servicio via FastAPI o similar. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia cualitativa, los modelos habituales de forecasting sobre METR-LA (Graph WaveNet, STGCN, DCRNN, etc.) manejan ordenes de magnitud mas de parametros y no publican comparaciones directas con PWM-Dyn v0.7 en la model card.

| Modelo | Parametros | Contexto | MAE METR-LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 METR-LA | 321.828 | 12 pasos de prediccion | 2,918 (clean) / 3,147 (outage) | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en METR-LA: no es transferible directamente a otras redes viarias sin reentrenamiento, aunque la model card menciona mejoras en cinco redes.
- No procesa lenguaje natural ni imagenes; no debe presentarse como un modelo de proposito general.
- Riesgo de degradacion fuera de la distribucion de entrenamiento (eventos extremos, cambios de infraestructura, condiciones meteorologicas severas no representadas en METR-LA).
- Los resultados publicados (MAE 2,918 / 3,147) provienen de la propia model card y no se han verificado de forma independiente en la informacion disponible.
- La arquitectura no esta documentada en la model card; para reproducir o modificar el modelo hay que consultar el repositorio de GitHub del autor.
- El checkpoint se carga con `weights_only=False`, lo que implica ejecutar codigo Python arbitrario contenido en el archivo; solo debe cargarse desde fuentes de confianza.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con atribucion; no impone restricciones adicionales conocidas.
- Sin datos sobre sesgos: al ser un modelo numerico de trafico, los sesgos potenciales se refieren a la cobertura desigual de sensores en la red METR-LA, no a sesgos linguisticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-metr-la
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentacion de la version: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (PEMS07): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems07
- Modelo siguiente (PEMS-Bay): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems-bay
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
