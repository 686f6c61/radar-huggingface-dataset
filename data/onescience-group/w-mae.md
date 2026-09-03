# OneScience-Group/W-MAE

## Resumen

W-MAE (Weather Masked AutoEncoder) es un modelo de preentrenamiento para la predicción meteorológica multivariable, desarrollado por el grupo OneScience. Su propuesta, recogida en el artículo «W-MAE: Pre-trained weather model with masked autoencoder for multi-variable weather forecasting» (arXiv:2304.08754), consiste en aprender primero las relaciones espaciales entre variables meteorológicas mediante reconstrucción enmascarada y, posteriormente, ajustar el modelo en una tarea de pronóstico para capturar dependencias temporales. El modelo se entrena con datos ERA5, un reanálisis atmosférico de referencia, y se distribuye bajo licencia Apache-2.0. Actualmente el repositorio está en fase inicial: no se han publicado los pesos del modelo (se esperan en un futuro próximo) y la documentación se limita a instrucciones de instalación y ejecución. A pesar de ello, la arquitectura de autoencoder enmascarado aplicada al dominio meteorológico representa una línea de investigación activa, con potencial para mejorar la eficiencia del preentrenamiento en tareas de pronóstico del tiempo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder (basado en Transformer, segun el paper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentacion; los datos son numericos) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se menciona un directorio `weight/`, probablemente .pth, pero sin confirmar) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de los masked autoencoders (MAE) aplicado a campos meteorológicos. Primero se enmascara una parte de las variables espaciales en los datos de entrada y el modelo aprende a reconstruirlas, forzando la captura de correlaciones espaciales entre las 20 variables físicas de ERA5. Posteriormente, en una fase de fine-tuning, se entrena para la tarea de pronóstico, modelando así las dependencias temporales. El README indica que los datos de entrenamiento deben organizarse en archivos HDF5 anuales con un dataset `fields`, una lista ordenada de 20 canales, pasos de tiempo de 6 horas y estadísticas de normalización. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset más allá de ERA5, ni si se emplearon técnicas de RLHF o DPO (no procede en este dominio). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Preentrenamiento mediante reconstrucción enmascarada de campos meteorológicos multivariables (20 variables de ERA5).
- Fine-tuning para tareas de pronóstico meteorológico a partir de las representaciones espaciales aprendidas.
- Soporte para entrenamiento multi-GPU mediante PyTorch DistributedDataParallel (`torchrun`).
- Compatibilidad con entornos GPU (CUDA) y DCU (con DTK instalado).
- Generación de datos sintéticos para verificación del pipeline (no aptos para evaluación científica).
- Inferencia y visualización de resultados de reconstrucción.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, ni procesamiento de lenguaje natural o visión generalista.

## Casos de uso

- Previsión meteorológica a corto plazo: tras el fine-tuning, el modelo puede predecir la evolución de variables como temperatura, presión o humedad en horizontes de 6 a 72 horas, partiendo de las representaciones espaciales preentrenadas.
- Generación de pronósticos para energía renovable: las predicciones de viento y radiación solar pueden alimentar modelos de estimación de producción eólica y fotovoltaica, mejorando la planificación de la red eléctrica.
- Agricultura de precisión: pronósticos de temperatura y precipitación permiten optimizar calendarios de riego y siembra, reduciendo pérdidas por eventos climáticos adversos.
- Aviación y logística: predicciones de viento en altura y visibilidad ayudan a planificar rutas aéreas y operaciones de carga, minimizando retrasos y consumo de combustible.
- Gestión de recursos hídricos: la predicción de precipitación y evaporación apoya la gestión de embalses y sistemas de alerta temprana de inundaciones.
- Investigación climática: el modelo preentrenado puede servir como extractor de características para estudios de variabilidad climática regional o como base para modelos de downscaling estadístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README no incluye métricas como RMSE, MAE o comparaciones con otros modelos (p. ej., FourCastNet, Pangu-Weather). Tampoco se mencionan evaluaciones sobre conjuntos de test estándar del dominio.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia; la CPU solo es útil para pruebas de importación y conectividad a pequeña escala.
- No se especifican requisitos mínimos de VRAM ni modelos concretos de GPU (A100, H100, RTX 4090, etc.).
- El README sugiere que el entrenamiento multi-GPU es posible con `torchrun`, lo que implica que el modelo puede escalar a varios dispositivos.
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama; el flujo de trabajo se centra en scripts de Python (`train.py`, `inference.py`, `result.py`).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación del modelo. Existen alternativas en el ámbito de la predicción meteorológica con redes neuronales, como FourCastNet, Pangu-Weather o GraphCast, pero no se han publicado comparaciones numéricas con W-MAE en la información disponible.

## Limitaciones y advertencias

- Los pesos preentrenados aún no están disponibles; el repositorio indica que se subirán próximamente, lo que impide su uso inmediato.
- El modelo está pensado exclusivamente para datos meteorológicos estructurados según el protocolo de ERA5; cualquier otro formato o variable requiere adaptación.
- Los datos sintéticos generados por `scripts/fake_data.py` usan nombres de canal provisionales y no deben emplearse para evaluación científica.
- El preentrenamiento se realiza desde inicialización aleatoria; no se documenta la transferencia desde otros modelos.
- No se mencionan sesgos específicos, pero al entrenar con ERA5 (reanálisis global) podrían existir limitaciones en regiones con menor densidad de observaciones.
- Riesgo de alucinación no aplica directamente, pero sí de errores en la reconstrucción de campos extremos o eventos poco frecuentes.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de pesos publicados limita su explotación práctica.
- La documentación está en inglés; no hay soporte multilingüe en la interfaz ni en los scripts.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/W-MAE
- Paper: https://arxiv.org/abs/2304.08754
- Dataset ERA5 (HuggingFace): https://huggingface.co/datasets/OneScience-Group/ERA5
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Skills repository (GitHub): https://github.com/onescience-ai/oneskills
- Skills repository (Gitee): https://gitee.com/onescience-ai/oneskills
