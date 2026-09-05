# alirezaaminzadeh/refineryguard-lstm-ae

## Resumen

RefineryGuard LSTM-AE es un paquete de detección de anomalías en procesos industriales desarrollado por el equipo Aria AI Engineering y publicado por alirezaaminzadeh. Resuelve el problema de monitorización de plantas químicas mediante el análisis de series temporales multivariadas, utilizando el proceso Tennessee Eastman (TEP) como benchmark de referencia. El paquete incluye un autoencoder LSTM, un Isolation Forest, un PCA y un clasificador de fallos de 22 clases, todos empaquetados para inferencia eficiente en CPU con ONNX Runtime. Su relevancia radica en ofrecer una solución integral y ligera para la detección de anomalías en entornos industriales, con umbrales precalibrados y sin necesidad de GPU. El modelo opera sobre ventanas de 20 pasos temporales y 52 variables del proceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LSTM autoencoder + Isolation Forest + PCA + HistGradientBoosting (ensemble para detección de anomalías) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 20 pasos temporales × 52 variables (ventana deslizante) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo numérico/tabular) |
| Licencia | MIT |
| Formato de pesos | ONNX, joblib (scikit-learn), scaler y thresholds en joblib |

## Arquitectura y entrenamiento

El componente principal es un LSTM autoencoder que procesa ventanas de 20 pasos temporales y 52 variables normalizadas. El error de reconstrucción medio se utiliza como puntuación de anomalía. Los umbrales de alerta se calculan como el percentil 99 de las puntuaciones obtenidas sobre datos normales (IDV(0)) del conjunto de entrenamiento. El paquete incluye además un Isolation Forest y un PCA como líneas base de referencia, y un clasificador HistGradientBoosting para identificar el tipo de fallo entre 22 categorías del proceso TEP.

El entrenamiento se ha realizado únicamente con datos de simulación del proceso Tennessee Eastman (Downs & Vogel 1993; archivos de evaluación de Braatz). No se ha aplicado RLHF ni DPO, ya que no es un modelo de lenguaje. La innovación principal es el empaquetado de todos los componentes como un bundle compatible con CPU, con inferencia mediante ONNX Runtime y persistencia de modelos en formato joblib.

## Capacidades

- Detección de anomalías en series temporales multivariadas mediante error de reconstrucción del LSTM autoencoder.
- Clasificación de fallos en 22 categorías del proceso Tennessee Eastman mediante HistGradientBoosting.
- Puntuación de ventanas con umbrales precalibrados (percentil 99 de la distribución normal).
- Incluye líneas base de referencia (Isolation Forest y PCA) para comparación de métodos.
- Inferencia rápida en CPU gracias a ONNX Runtime.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Monitorización en línea de plantas químicas: el modelo procesa ventanas de 20 pasos de las 52 variables del proceso y emite una alerta cuando la puntuación de anomalía supera el umbral, permitiendo la detección temprana de desviaciones.
- Mantenimiento predictivo: al identificar patrones anómalos de forma temprana, el sistema puede programar intervenciones antes de que ocurra un fallo, reduciendo paradas no planificadas.
- Análisis de alarmas y diagnóstico de fallos: el clasificador de 22 clases permite identificar el tipo de fallo (IDV(1) a IDV(21)) a partir de una ventana anómala, facilitando la respuesta del operador.
- Validación de algoritmos de detección de anomalías: el paquete sirve como referencia para comparar nuevos métodos sobre el benchmark TEP, gracias a sus líneas base de Isolation Forest y PCA.
- Formación de operadores e ingenieros de proceso: al utilizar datos de simulación, permite practicar la interpretación de alarmas y la respuesta a fallos sin riesgo para la planta.
- Integración en sistemas de control y edge computing: dado que es eficiente en CPU y usa ONNX, puede desplegarse en dispositivos industriales o en el borde para inferencia en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un archivo `eval_results.json` con el protocolo de test de Braatz, pero no se detallan los valores numéricos en la información proporcionada.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU sin necesidad de GPU.
- VRAM: no aplica, no requiere GPU.
- GPU recomendada: ninguna.
- Cabe en cualquier ordenador moderno, incluso en dispositivos de bajo consumo con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime, Python con joblib, HuggingFace Spaces, contenedores Docker.
- Latencia: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables publicados en la información disponible. El paquete combina técnicas clásicas de detección de anomalías, por lo que podría compararse con implementaciones estándar de scikit-learn, pero no se dispone de datos de rendimiento para ello.

## Limitaciones y advertencias

- Entrenado únicamente con datos de simulación del proceso Tennessee Eastman; no es un modelo de refinería real.
- Los umbrales deben recalibrarse en cada planta antes de cualquier uso operativo.
- Riesgo de falsos positivos o negativos si el proceso cambia de régimen o si las variables no siguen la distribución de entrenamiento.
- No es un modelo generativo; no aplica el riesgo de alucinación en el sentido habitual.
- Licencia MIT permite uso comercial, pero requiere recalibración y validación en el entorno real.
- Limitación de contexto: solo procesa ventanas de 20 pasos, por lo que no captura dependencias a largo plazo más allá de esa ventana.

## Enlaces

- Modelo: https://huggingface.co/alirezaaminzadeh/refineryguard-lstm-ae
- Dataset: https://huggingface.co/datasets/alirezaaminzadeh/refineryguard-tep-features
- Space: https://huggingface.co/spaces/alirezaaminzadeh/refineryguard-process-anomaly
- Producto: https://aria-ai.ir
- Perfil del autor: https://huggingface.co/alirezaaminzadeh
