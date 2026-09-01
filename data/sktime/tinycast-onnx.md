# sktime/tinycast-onnx

## Resumen

TinyCast (fp32 ONNX) es un export no oficial en formato ONNX del modelo de forecasting de series temporales TinyCast, desarrollado por RAWS Labs y publicado bajo licencia Apache-2.0. Este artefacto, subido por la organización sktime, permite ejecutar TinyCast en entornos compatibles con ONNX Runtime, sin necesidad de depender del framework original. El modelo está diseñado para realizar predicciones de series temporales en modo zero-shot, con una ventana de contexto de 2048 valores y una salida de 48 pasos con 9 cuantiles de incertidumbre.

La relevancia de esta ficha radica en que ofrece una vía de integración estándar para un modelo de forecasting ligero, orientado a despliegue en edge y streaming. Al ser un export fp32 sin cuantizar, mantiene la fidelidad numérica respecto al modelo original, con una desviación verificada inferior al 0.0003% en el rango de predicción. No se dispone de información pública sobre la arquitectura interna, el número de parámetros o los datos de entrenamiento, por lo que estos aspectos se indican como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 valores de entrada (según contrato del modelo) |
| Tipos de cuantizacion | fp32 (sin cuantizar) |
| Idiomas soportados | no disponible (modelo de series temporales, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base TinyCast. La model card del export ONNX indica que se trata de una conversión directa del modelo original, sin modificaciones en los pesos. El contrato de entrada especifica un tensor `context` de forma `['batch', 2048]` en float32, y la salida es un tensor `quantiles` de forma `['batch', 48, 9]` con niveles de cuantil `[0.1, 0.2, ..., 0.9]`. El modelo opera en bloques autorregresivos de 48 pasos; para horizontes más largos, se realimenta la mediana (índice 4) como contexto y se repite el proceso.

No se dispone de datos sobre el conjunto de entrenamiento, el número de tokens o la metodología de optimización (RLHF, DPO, etc.). El modelo base se describe como un "time-series foundation-model" con atención libre (attention-free) según las etiquetas de HuggingFace, pero no se aportan más detalles técnicos en la información disponible.

## Capacidades

- Forecasting de series temporales en modo zero-shot, sin necesidad de fine-tuning.
- Generación de predicciones con incertidumbre cuantificada mediante 9 niveles de cuantil (del 10% al 90%).
- Soporte para ventanas de contexto de hasta 2048 valores, con imputación previa de valores faltantes (recomendado `np.interp` y relleno con el primer valor).
- Extensión del horizonte de predicción mediante realimentación autorregresiva de la mediana.
- Compatible con ONNX Runtime, lo que permite ejecución en CPU, GPU y dispositivos edge.
- No se han documentado capacidades de tool calling, agentes, visión o procesamiento de lenguaje natural.

## Casos de uso

- Predicción de demanda en retail: el modelo puede anticipar ventas futuras a partir de series históricas de 2048 puntos, generando intervalos de confianza para la gestión de inventario.
- Monitorización de métricas de infraestructura: uso en pipelines de observabilidad para predecir uso de CPU, memoria o latencia, con alertas basadas en los cuantiles superiores.
- Previsión de consumo energético: integración en sistemas de gestión de energía para estimar la demanda eléctrica en horizontes de 48 pasos, facilitando la planificación de recursos.
- Mantenimiento predictivo: análisis de series de sensores industriales para anticipar fallos, utilizando la mediana como valor esperado y los cuantiles como umbrales de riesgo.
- Análisis financiero de series temporales: predicción de indicadores económicos o precios de activos con intervalos de incertidumbre, aunque sin garantías de precisión en mercados volátiles.
- Despliegue en dispositivos edge: al ser un modelo ligero en formato ONNX, puede ejecutarse en microcontroladores o gateways para predicción en tiempo real sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del export ONNX solo verifica la fidelidad numérica respecto al modelo original, con una desviación máxima de 0.0003% en el rango de predicción para rollouts de 15 bloques. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje o razonamiento general.

## Requisitos de hardware

- Al ser un modelo ONNX fp32, puede ejecutarse en CPU sin necesidad de GPU, siempre que se disponga de memoria suficiente para el tensor de contexto (2048 floats por muestra).
- El tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy ligero, aunque no se especifica el número de parámetros.
- Para inferencia en GPU, cualquier tarjeta con soporte CUDA y ONNX Runtime es suficiente; no se requieren GPUs de alta gama.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), TensorRT, o cualquier runtime compatible con ONNX.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de forecasting de series temporales en formato ONNX. El modelo base TinyCast se describe como un "foundation model" de series temporales, pero no se han encontrado referencias a alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Export no oficial: no está afiliado ni respaldado por los autores originales del modelo (RAWS Labs), por lo que su mantenimiento y soporte son limitados.
- Requiere preprocesamiento de la entrada: los valores faltantes deben imputarse (por ejemplo, con interpolación lineal) y el contexto debe rellenarse por la izquierda con el primer valor disponible.
- La salida de cuantiles debe ordenarse de forma ascendente antes de su uso, según la semántica oficial de `TinyCastPredictor`.
- No se han documentado sesgos o riesgos de alucinación, al tratarse de un modelo numérico, pero la precisión en dominios no representados en el entrenamiento puede ser baja.
- La licencia Apache-2.0 permite uso comercial, pero al ser un export no oficial, se recomienda verificar la licencia del modelo base original.
- No se dispone de información sobre la composición del dataset de entrenamiento, por lo que no se puede evaluar su robustez ante series temporales atípicas.

## Enlaces

- [sktime/tinycast-onnx en HuggingFace](https://huggingface.co/sktime/tinycast-onnx)
- [raws-labs/tinycast (modelo base) en HuggingFace](https://huggingface.co/raws-labs/tinycast)
- [ONNX Model Zoo](https://github.com/onnx/models)
- [ONNX Runtime Models](https://onnxruntime.ai/models)
