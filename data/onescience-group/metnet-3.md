# OneScience-Group/metnet-3

## Resumen

MetNet-3 Compact es una implementación independiente y simplificada del modelo MetNet-3, desarrollada por OneScience-Group, un modelo de predicción meteorológica regional de alta resolución diseñado para trabajar con observaciones dispersas. El modelo original, descrito en el artículo *Deep Learning for Day Forecasts from Sparse Observations* (arXiv:2306.06079), predice variables como precipitación, temperatura, punto de rocío y viento a partir de múltiples fuentes de datos (MRMS, OMO, HRRR, GOES). Esta versión compacta reproduce las interfaces de entrada multi-fuente, el condicionamiento por lead-time, la máscara OMO dispersa, las salidas probabilísticas y la regresión auxiliar HRRR, pero con escalas de entrada, fusión temporal, backbone y resolución de salida reducidas.

El modelo está pensado como una implementación de verificación funcional, no como la implementación oficial de Google, y no incluye pesos preentrenados oficiales. Se distribuye con un dataset sintético (fake) que permite ejecutar entrenamiento, inferencia y evaluación localmente, y está orientado a la investigación y al desarrollo de sistemas de predicción meteorológica basados en aprendizaje profundo. Su relevancia radica en ofrecer un punto de partida accesible para explorar la arquitectura de MetNet-3 y sus múltiples entradas, sin necesidad de los datos masivos originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone simplificado: single-layer Transformer proxy (en el paper original: MaxViT modificado de 12 bloques) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión/tiempo, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (idiomas de la documentación, no del modelo) |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch (checkpoints .pth, no se especifica safetensors) |

## Arquitectura y entrenamiento

La arquitectura de MetNet-3 Compact sigue el diseño general del paper original: un modelo que procesa múltiples fuentes de entrada (MRMS de alta y baja resolución, observaciones OMO, datos HRRR y GOES, topografía, coordenadas, tiempo y lead-time) y produce predicciones probabilísticas de precipitación y variables de superficie, junto con una regresión auxiliar para HRRR. En la implementación compacta, el backbone se reduce a una única capa Transformer (en lugar del MaxViT de 12 bloques del paper), y las dimensiones de entrada y salida se simplifican considerablemente: por ejemplo, MRMS High pasa de 2 canales × 11 frames a 4 canales × 3 frames, y la salida de precipitación se reduce de dos clases con 512 bins a una clase con 16 bins.

El entrenamiento se realiza con un dataset sintético (OneScience/MetNet3-Fake) que genera datos proxy de todas las fuentes, y utiliza un esquema de entrenamiento multi-tarea con pérdidas de entropía cruzada para precipitación y variables de superficie, y error cuadrático medio para la regresión HRRR. El script de entrenamiento incluye validación independiente, programación de tasa de aprendizaje y early stopping. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Predicción de precipitación a corto plazo (short-range) con salidas probabilísticas (clasificación en bins).
- Predicción de variables de superficie: temperatura, punto de rocío, viento, entre otras (6 variables en la implementación compacta).
- Integración de múltiples fuentes de datos meteorológicos: MRMS, OMO, HRRR, GOES, topografía, coordenadas y tiempo.
- Condicionamiento por lead-time (tiempo de anticipación) para generar pronósticos a diferentes horizontes.
- Manejo de observaciones dispersas mediante una máscara OMO (sparse OMO mask).
- Regresión auxiliar para datos HRRR, que permite refinar las predicciones.
- Capacidad de ejecutar entrenamiento e inferencia con datos sintéticos para verificación funcional.
- Interfaz preparada para conectar con datos reales (MRMS, OMO, HRRR, GOES) en configuraciones más grandes.

## Casos de uso

- Investigación en modelos meteorológicos multi-fuente: permite verificar y experimentar con las interfaces de entrada de MRMS, OMO, HRRR y GOES, así como con el condicionamiento por lead-time, sin necesidad de los datos originales a gran escala.
- Desarrollo de prototipos de predicción de precipitación: el modelo puede entrenarse con datos sintéticos para validar pipelines de entrenamiento, checkpoints e inferencia, sirviendo como base para después migrar a datos reales.
- Evaluación de arquitecturas de deep learning para nowcasting: al ser una implementación compacta, es adecuada para probar variaciones del backbone (por ejemplo, sustituir la capa Transformer por otras arquitecturas) en entornos con recursos limitados.
- Integración en sistemas de alerta temprana: aunque la versión compacta no tiene precisión operativa, puede usarse como referencia para desarrollar sistemas que posteriormente se entrenen con datos reales y se desplieguen en producción.
- Formación y docencia: el código y el dataset sintético permiten a estudiantes y desarrolladores comprender el flujo completo de un modelo de predicción meteorológica basado en deep learning, desde la entrada multi-fuente hasta la salida probabilística.
- Verificación de compatibilidad de hardware: al poder ejecutarse en CPU, sirve para probar la instalación del entorno (OneScience) y la integración con aceleradores DCU o GPU antes de escalar a configuraciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados generados con datos falsos solo sirven para verificar que el modelo ejecuta correctamente y no representan las métricas de habilidad de predicción del paper (como CRPS, CSI o MAE en unidades físicas). El script de resultados reporta MAE en espacio de bins normalizado, RMSE del proxy HRRR y error de normalización de probabilidades, pero no son comparables con benchmarks estándar.

## Requisitos de hardware

- CPU: puede ejecutar la configuración compacta actual sin necesidad de GPU.
- GPU: recomendada para trabajar con datos reales y configuraciones más grandes.
- Aceleradores DCU: soportados a través del paquete `onescience[earth-dcu]`.
- VRAM estimada: no disponible, pero al ser una configuración compacta (entradas de 8×8 píxeles) el consumo es bajo.
- Opciones de despliegue: scripts de entrenamiento e inferencia en Python (PyTorch), sin soporte específico para vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de predicción meteorológica, y no se dispone de datos de rendimiento para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Implementación no oficial: no es la implementación de Google del paper MetNet-3, sino una versión compacta independiente creada por OneScience-Group.
- Sin pesos preentrenados: el modelo no incluye pesos oficiales; solo se proporciona el código y un dataset sintético para entrenamiento desde cero.
- Datos sintéticos: el dataset actual (OneScience/MetNet3-Fake) genera datos proxy que no representan condiciones meteorológicas reales; los resultados no son útiles para predicción operativa.
- Escala reducida: las dimensiones de entrada, el backbone y la resolución de salida están muy simplificados respecto al paper, por lo que la capacidad predictiva es limitada.
- Licencia "other": no se especifican los términos exactos de la licencia; se recomienda revisar el repositorio antes de uso comercial.
- Requisitos de datos reales: para entrenar con datos reales se necesitan múltiples fuentes (MRMS, OMO, HRRR, GOES) con preprocesamiento complejo (proyección común, control de calidad, manejo de valores faltantes, normalización), lo que no está incluido en el paquete.
- Riesgo de alucinación: al ser un modelo de visión/tiempo, no aplica el concepto de alucinación de texto, pero las predicciones con datos sintéticos pueden ser engañosas si se interpretan como pronósticos reales.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/metnet-3
- Paper: https://arxiv.org/abs/2306.06079
- Repositorio Gitee de OneScience: https://gitee.com/onescience-ai/onescience
- Repositorio de skills de OneScience: https://gitee.com/onescience-ai
