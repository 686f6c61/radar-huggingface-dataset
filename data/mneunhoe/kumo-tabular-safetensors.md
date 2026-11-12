# mneunhoe/Kumo-Tabular-safetensors

## Resumen

Kumo-Tabular-safetensors es una conversión no oficial de los pesos del modelo Kumo Tabular de NVIDIA, publicada por el usuario mneunhoe en Hugging Face. El modelo original es un modelo fundacional para datos tabulares, diseñado para tareas de clasificación y regresión sobre tablas estructuradas, y se distribuye en tres tamaños (small, medium y large) tanto en variante clasificador como regresor.

La aportación de este repositorio no es un modelo nuevo, sino un cambio de formato: los checkpoints originales de NVIDIA se publican como state dicts de PyTorch en formato pickle (.pt), legibles únicamente desde Python. Esta copia los convierte a safetensors, un formato que puede cargarse desde cualquier lenguaje sin ejecutar código serializado, lo que facilita su uso desde entornos como R (a través del paquete tabfound) o cualquier otro runtime con soporte de safetensors.

La relevancia es por tanto práctica: permite consumir los pesos de Kumo Tabular en pipelines no-Python y elimina el riesgo de seguridad asociado a la deserialización de pickles. El repositorio incluye verificación de integridad bit a bit frente a los originales y conserva la licencia OpenMDW-1.1 de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas ICL (in-context learning) para datos tabulares; detalles completos no disponibles |
| Parametros totales | small: 27,5 M (clf) / 28,5 M (reg); medium: 61,5 M (clf) / 62,5 M (reg); large: 213,7 M (clf) / 215,7 M (reg) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors con dtypes originales) |
| Idiomas soportados | no disponible (modelo tabular, no lingüístico) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | safetensors (convertido desde state dicts .pt de PyTorch) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA emplea una arquitectura transformer orientada a datos tabulares con capas de in-context learning (ICL). Según la información del repositorio, los tamaños se definen por el número de capas ICL y su anchura: small usa 12 capas con anchura 512; medium usa 24 capas con anchura 512; large usa 24 capas con anchura 1024. Cada tamaño dispone de una cabeza de clasificación y otra de regresión, con recuentos de parámetros ligeramente distintos entre ambas.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de capas ICL para el procesamiento de tablas. La conversión a safetensors se realizó con el script kumo_convert_ckpt.py, cargando cada .pt con torch.load(weights_only=True), verificando claves y formas contra el árbol de módulos de cada tamaño y escribiendo los tensores sin modificarlos. Se comprobó que cada tensor es bit-idéntico al original y que cada fichero carga con load_state_dict(strict=True) en la clase _KumoTabular de structured-data-models 0.2.1. La única diferencia es que el buffer RoPE inv_freq, compartido en los módulos originales, se duplica por clave en safetensors (valores idénticos, sin impacto en inferencia).

## Capacidades

- Clasificación tabular: predicción de etiquetas categóricas a partir de características estructuradas en tablas.
- Regresión tabular: predicción de valores continuos sobre datos tabulares.
- Aprendizaje en contexto (ICL) sobre tablas: la arquitectura incorpora capas específicas para este paradigma.
- Tres escalas de modelo (small, medium, large) para ajustar el equilibrio entre coste computacional y capacidad.
- Carga multi-lenguaje: al estar en safetensors, puede cargarse desde R, Python y otros runtimes sin ejecutar pickles.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Clasificación de riesgo crediticio: usar la variante classifier para etiquetar solicitudes a partir de variables tabulares de solvencia, aprovechando que el modelo está entrenado específicamente sobre datos estructurados.
- Scoring de clientes en marketing: la variante regressor puede predecir probabilidades o puntuaciones continuas de conversión a partir de tablas de comportamiento.
- Detección de fraude en transacciones: clasificación binaria sobre registros tabulares de operaciones, con la ventaja de que el modelo no requiere ingeniería de características compleja.
- Predicción de precios o demanda: regresión sobre series de variables tabulares (histórico de ventas, estacionalidad, precios) para estimar valores futuros.
- Integración en pipelines de R: cargar los safetensors directamente desde el paquete tabfound sin paso por Python, útil en entornos de análisis estadístico donde R es el lenguaje principal.
- Evaluación de modelos tabulares en investigación: disponer de tres escalas y dos cabezas permite estudiar el efecto del tamaño del modelo en tareas tabulares con una base reproducible.
- Clasificación médica o diagnóstica sobre registros estructurados: la variante classifier puede aplicarse a tablas de variables clínicas para tareas de cribado, siempre con validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamaños son reducidos. El modelo large (213,7 M de parámetros) en fp32 ocupa aproximadamente 0,85 GB; en fp16, unos 0,43 GB. Medium (61,5 M) requiere unos 0,25 GB en fp32 y small (27,5 M) unos 0,11 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100 para estos tamaños. Una RTX 3060 o superior cubre holgadamente los tres tamaños.
- Cabe en GPU consumer: sí, en todas las GPU consumer con al menos 2 GB de VRAM, incluidas GTX 1650 o RTX 3050.
- Opciones de despliegue: carga mediante safetensors.torch.load_file y la librería sdm (structured-data-models 0.2.1); desde R, mediante el paquete tabfound. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kumo-Tabular-safetensors (este) | 27,5 M – 215,7 M | no disponible | Clasificación y regresión tabular | OpenMDW-1.1 | Hugging Face (copia no oficial) |
| nvidia/Kumo-Tabular (original) | 27,5 M – 215,7 M | no disponible | Clasificación y regresión tabular | OpenMDW-1.1 | Hugging Face (oficial) |
| Otros modelos tabulares fundacionales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo original de NVIDIA: misma arquitectura, mismos parámetros y mismos valores de pesos, con la única diferencia del formato (safetensors frente a pickle .pt). No se dispone de información sobre otros modelos tabulares fundacionales comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Copia no oficial: NVIDIA no ha creado ni respalda este repositorio; para uso en producción se recomienda partir de nvidia/Kumo-Tabular.
- Solo se ha modificado el formato: cualquier limitación del modelo original (sesgos en los datos de entrenamiento, errores de calibración) se hereda íntegramente.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos tabulares, puede reproducir sesgos presentes en los datasets de origen.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones erróneas o sobreconfiadas en tablas fuera de la distribución de entrenamiento.
- Limitaciones de idioma: no aplica, es un modelo tabular sin capacidades lingüísticas.
- Licencia OpenMDW-1.1: es una licencia "other" que debe revisarse antes de uso comercial; el repositorio incluye el texto completo en LICENSE con el aviso de copyright de NVIDIA.
- El buffer RoPE inv_freq está duplicado por clave en safetensors (los originales lo comparten); los valores son idénticos y no afecta a la inferencia, pero puede confundir a quien compare recuentos de tensores.
- No se documentan requisitos de preprocesado de tablas, lo que puede provocar resultados incorrectos si se usa sin seguir el pipeline del modelo original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mneunhoe/Kumo-Tabular-safetensors
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kumo-Tabular
- Código de referencia de NVIDIA: https://github.com/NVIDIA/structured-data-models
- Script de conversión: https://github.com/mneunhoe/R-TabularFoundation/blob/main/inst/python/kumo_convert_ckpt.py
- Paquete R tabfound: https://github.com/mneunhoe/R-TabularFoundation
