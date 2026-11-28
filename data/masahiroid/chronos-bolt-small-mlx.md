# masahiroid/chronos-bolt-small-mlx

## Resumen

chronos-bolt-small-mlx es una conversión a formato MLX del modelo de previsión de series temporales amazon/chronos-bolt-small, publicada por el usuario masahiroid. No se trata de un modelo de generación de texto, sino de un modelo especializado en forecasting que predice 64 pasos futuros y 9 cuantiles (de 0,1 a 0,9) a partir de un contexto de hasta 2048 observaciones. La conversión mantiene los nombres de tensor del modelo de inferencia original y utiliza una implementación nativa de MLX.

El modelo base, desarrollado por Amazon, emplea una arquitectura de tipo T5 adaptada a series temporales y no dispone de tokenizador de texto. Esta versión MLX está pensada para ejecutarse en Macs con Apple Silicon y conserva la licencia Apache 2.0 del modelo original, mientras que el runtime y los scripts de conversión añadidos por el autor de la conversión están bajo licencia MIT.

La relevancia de esta ficha radica en que permite ejecutar un modelo de forecasting de Amazon de forma nativa en el ecosistema MLX de Apple, con validación numérica frente a la implementación original en PyTorch (diferencia máxima absoluta de 3,81e-06 y similitud coseno mínima de 1). Es una conversión de paridad, sin fine-tuning ni cuantización a 4 bits: se trata de una línea base en F32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 adaptada a series temporales (modelo base amazon/chronos-bolt-small) |
| Parametros totales | 47.720.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2048 observaciones |
| Tipos de cuantizacion | F32 (línea base, no es cuantización de 4 bits); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (modelo sin tokenizador de texto) |
| Licencia | apache-2.0 (pesos); runtime y scripts de conversión bajo MIT |
| Formato de pesos | safetensors (runtime MLX); también existen exportaciones GGUF, Core ML y Core AI |

## Arquitectura y entrenamiento

El modelo base amazon/chronos-bolt-small es un modelo de previsión de series temporales construido sobre una arquitectura T5, sin tokenizador de texto. Genera directamente una distribución predictiva cuantílica: 9 cuantiles (0,1 a 0,9) para cada uno de los 64 pasos futuros. La conversión a MLX replica la implementación de inferencia original conservando los nombres de tensor del modelo fuente.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. Esta publicación es exclusivamente una conversión de checkpoint en la revisión `772f3d25d38aec6d914c8949dab4462e2d46f5d8` del modelo original, sin fine-tuning ni sustitución de pesos. La validación numérica se realizó con tres casos deterministas (tendencia más sinusoide, serie constante y serie con observaciones faltantes), con una diferencia absoluta máxima de 3,8146973e-06 y similitud coseno mínima de 1 frente a la implementación en PyTorch.

## Capacidades

- Previsión de series temporales univariadas y multivariadas con horizonte fijo de 64 pasos.
- Salida cuantílica: 9 cuantiles (0,1 a 0,9) por paso, lo que permite construir intervalos de predicción.
- Manejo de contextos de longitud variable de hasta 2048 observaciones.
- Soporte de series con observaciones faltantes (validado en las pruebas de paridad).
- Entrada mediante arrays NumPy; salida con forma `(batch, 9, 64)`.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües, al carecer de tokenizador de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Previsión de demanda en comercio minorista: el modelo puede generar 64 pasos futuros con intervalos cuantílicos a partir de hasta 2048 observaciones históricas, útil para planificación de inventario en Macs con Apple Silicon.
- Monitorización de métricas de infraestructura: predicción de series de latencia, CPU o memoria con cuantiles para detectar desviaciones anómalas antes de que ocurran.
- Previsión financiera de series de precios o volúmenes: los 9 cuantiles permiten estimar escenarios pesimistas y optimistas en lugar de una única predicción puntual.
- Análisis de sensores IoT: procesamiento local en Mac de series de sensores con observaciones faltantes, aprovechando la validación del modelo en ese escenario.
- Prototipado e investigación en MLX: al ser una conversión con paridad numérica verificada, sirve como referencia para comparar implementaciones o desarrollar pipelines de forecasting en el ecosistema Apple.
- Predicción de series energéticas: previsión de consumo o generación con horizonte de 64 pasos y bandas cuantílicas para gestión de carga.
- Integración en aplicaciones macOS nativas: el runtime MLX y las exportaciones Core ML/Core AI permiten desplegar el modelo en apps de escritorio con formas fijas (batch 1, contexto 2048).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea en la información disponible. La única validación reportada es de paridad numérica frente a la implementación original en PyTorch:

| Metrica | Valor |
|---|---|
| Diferencia absoluta maxima | 3,8146973e-06 |
| Similitud coseno minima | 1 |
| Casos de validacion | 3 (tendencia + sinusoide, serie constante, serie con faltantes) |

Estas pruebas son comprobaciones de paridad de conversión, no benchmarks de calidad predictiva ni de latencia.

## Requisitos de hardware

- Requiere un Mac con Apple Silicon (el runtime MLX incluido lo exige).
- Pesos en F32 con 47,72 millones de parámetros; el repositorio ocupa 0,2 GB.
- VRAM estimada: no disponible de forma explícita; por el tamaño del checkpoint (0,2 GB), la huella de memoria es reducida y cabe en la memoria unificada de cualquier Mac con Apple Silicon.
- GPU recomendadas: no aplica el catálogo de GPU NVIDIA; el modelo está orientado a Apple Silicon.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: runtime MLX propio (`runtime_mlx.Model`), exportaciones Core ML y Core AI (batch 1, contexto 2048) y GGUF.
- Dependencias del entorno probado: PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0, chronos-forecasting 2.3.2, GGUF 0.19.0 y coreai-torch 0.4.3 (Core AI con Python 3.14). No se garantiza compatibilidad fuera de ese entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| masahiroid/chronos-bolt-small-mlx | 47,72 M | 2048 observaciones | safetensors (MLX) | apache-2.0 | Conversión MLX con paridad numérica verificada |
| masahiroid/chronos-bolt-small-gguf | no disponible | 2048 observaciones (preserva el máximo original) | GGUF | apache-2.0 | Misma conversión en formato GGUF |
| masahiroid/chronos-bolt-small-coreml | no disponible | 2048 (formas fijas, batch 1) | Core ML | apache-2.0 | Exportación con formas fijas |
| amazon/chronos-bolt-small | no disponible | 2048 observaciones | PyTorch | apache-2.0 | Modelo original de referencia |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la paridad numérica de la conversión MLX.

## Limitaciones y advertencias

- Es una conversión de checkpoint, no un modelo nuevo: no hay fine-tuning ni entrenamiento adicional, por lo que hereda todas las limitaciones del modelo base.
- No es un modelo de texto: no admite generación de lenguaje, tool calling ni agentes.
- El horizonte de predicción está fijado en 64 pasos; no es configurable según la model card.
- Las exportaciones Core ML y Core AI usan formas fijas (batch 1, contexto 2048); las entradas cortas deben rellenarse con NaN.
- El runtime MLX exige Apple Silicon y las versiones de dependencias probadas; fuera de ese entorno no se garantiza compatibilidad.
- Riesgo de alucinación: no aplica en el sentido de texto, pero las predicciones pueden ser inexactas en series con cambios de régimen no representados en los datos de entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial de los pesos, pero el autor no certifica seguridad ni calidad de tarea; el runtime y los scripts añadidos son MIT.
- La validación reportada es solo de paridad numérica, no de calidad predictiva ni de latencia.

## Enlaces

- [masahiroid/chronos-bolt-small-mlx en Hugging Face](https://huggingface.co/masahiroid/chronos-bolt-small-mlx)
- [amazon/chronos-bolt-small (modelo base)](https://huggingface.co/amazon/chronos-bolt-small/tree/772f3d25d38aec6d914c8949dab4462e2d46f5d8)
- [masahiroid/chronos-bolt-small-coreml](https://huggingface.co/masahiroid/chronos-bolt-small-coreml)
- [masahiroid/chronos-bolt-small-coreai](https://huggingface.co/masahiroid/chronos-bolt-small-coreai)
- [masahiroid/chronos-bolt-small-gguf](https://huggingface.co/masahiroid/chronos-bolt-small-gguf)
