# masahiroid/chronos-bolt-small-mlx

## Resumen

chronos-bolt-small-mlx es una conversión a MLX del modelo de series temporales amazon/chronos-bolt-small, publicada por el usuario masahiroid. No se trata de un modelo de lenguaje: es un modelo de forecasting (predicción de series temporales) de tipo zero-shot, basado en una arquitectura T5 de aproximadamente 47,7 millones de parámetros. El repositorio contiene una implementación nativa en MLX con los nombres de tensor originales del modelo de inferencia, junto con los scripts de conversión, y está pensado para ejecutarse en Apple Silicon.

La relevancia de esta ficha es acotada: el modelo base Chronos-Bolt es conocido por ofrecer forecasting zero-shot rápido y preciso, pero esta publicación concreta es únicamente una conversión de checkpoint sin fine-tuning ni entrenamiento adicional. El autor lo declara explícitamente: no es una cuantización de 4 bits, sino una conversión en F32 con paridad numérica verificada frente a la implementación original en PyTorch.

El modelo genera 9 cuantiles (0,1 a 0,9) para un horizonte de 64 pasos futuros, con una longitud de contexto de hasta 2048 observaciones. No dispone de tokenizador de texto ni de capacidades generativas de lenguaje; su entrada y salida son tensores numéricos de series temporales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder), adaptada para forecasting de series temporales (Chronos-Bolt) |
| Parametros totales | 47.720.064 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2048 observaciones de la serie temporal |
| Tipos de cuantizacion | F32 (conversion base); no es una cuantizacion de 4 bits |
| Idiomas soportados | no disponible (modelo numerico, sin tokenizador de texto) |
| Licencia | apache-2.0 (pesos); runtime y conversor bajo MIT (CODE_LICENSE) |
| Formato de pesos | safetensors (runtime MLX); existen exportaciones adicionales en coreml, coreai y gguf |
| Horizonte de prediccion | 64 pasos futuros |
| Cuantiles de salida | 9 (0,1 a 0,9) |
| Tamano del repo | 0,2 GB |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo subyacente, amazon/chronos-bolt-small, es un transformer de tipo T5 con unos 48 millones de parámetros, adaptado a la predicción de series temporales. Chronos-Bolt reformula el forecasting como una tarea de regresión directa de cuantiles: en lugar de generar tokens autorregresivamente como Chronos original, produce directamente 9 cuantiles para un horizonte fijo de 64 pasos, lo que reduce la latencia de inferencia. La entrada es una secuencia de observaciones numéricas de hasta 2048 puntos.

Esta publicación concreta no incluye entrenamiento ni fine-tuning: es una conversión del checkpoint original en la revisión `772f3d25d38aec6d914c8949dab4462e2d46f5d8` a un runtime nativo en MLX, conservando los nombres de tensor del modelo de inferencia original. La validación numérica reportada por el autor frente a la implementación en PyTorch, sobre 3 casos deterministas, arroja una diferencia absoluta máxima de 3,8146973e-06 y una similitud coseno mínima de 1. Se trata de comprobaciones de paridad de conversión, no de benchmarks de calidad de tarea ni de latencia.

## Capacidades

- Predicción de series temporales zero-shot: genera pronósticos sin entrenamiento específico sobre la serie objetivo.
- Salida probabilística: 9 cuantiles (0,1 a 0,9) para un horizonte de 64 pasos, lo que permite construir intervalos de predicción.
- Contexto largo: admite hasta 2048 observaciones de entrada; las entradas cortas pueden rellenarse con NaN en las exportaciones Apple de forma fija.
- Manejo de series con observaciones faltantes (missing values), según los tests de validación del autor.
- Ejecución nativa en Apple Silicon mediante el runtime MLX incluido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: carece de tokenizador y de capacidades de lenguaje.

## Casos de uso

- Previsión de demanda en retail: usar el modelo para pronosticar ventas por producto o tienda a 64 pasos vista, aprovechando el contexto de hasta 2048 observaciones para capturar estacionalidad semanal y anual.
- Planificación de capacidad en infraestructura: predecir métricas de uso (CPU, memoria, tráfico) y generar intervalos de confianza a partir de los 9 cuantiles para dimensionar recursos con margen.
- Forecasting financiero de alta frecuencia: pronosticar series de precios o volúmenes con salida cuantílica, útil para estimar rangos de riesgo en lugar de un único punto.
- Monitorización industrial y mantenimiento predictivo: predecir la evolución de sensores (temperatura, vibración) y detectar desviaciones comparando la observación real con el intervalo cuantílico previsto.
- Predicción meteorológica y de consumo energético: series con estacionalidad marcada y posiblemente valores faltantes, donde el manejo de NaN del modelo resulta práctico.
- Prototipado local en Mac: desarrollo y pruebas de pipelines de forecasting en Apple Silicon sin GPU dedicada, gracias al runtime MLX y al reducido tamaño del modelo (0,2 GB).
- Evaluación comparativa de métodos de forecasting: usar la conversión como referencia de paridad numérica frente a la implementación PyTorch en experimentos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea en la información disponible. El autor solo reporta métricas de paridad de conversión:

| Metrica | Valor |
|---|---|
| Diferencia absoluta maxima vs. PyTorch (3 casos deterministas) | 3,8146973e-06 |
| Similitud coseno minima vs. PyTorch | 1 |
| Benchmarks de tarea (MAE, MASE, WQL, etc.) | no disponible |
| Benchmarks de latencia o throughput | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: el modelo tiene 47,7 millones de parámetros en F32, lo que supone aproximadamente 190 MB de pesos; el repo completo ocupa 0,2 GB. Cabe holgadamente en la memoria unificada de cualquier Mac moderno.
- GPU recomendadas: no aplica en el sentido tradicional; el runtime incluido requiere Apple Silicon (MLX). No se documenta soporte para GPU NVIDIA en esta publicación.
- GPU de consumo: sí cabe en equipos Apple Silicon de gama base; no se especifican requisitos mínimos de chip.
- Opciones de despliegue: runtime MLX propio incluido en el repo (`runtime_mlx.py`); existen exportaciones alternativas del mismo autor en Core ML, Core AI y GGUF (esta última potencialmente usable con llama.cpp, aunque no se detalla en la información disponible).
- Latencia y throughput: no disponible; el autor indica explícitamente que la validación no es un benchmark de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Horizonte | Licencia | Formato |
|---|---|---|---|---|---|
| chronos-bolt-small-mlx (esta ficha) | 47,7 M | 2048 obs. | 64 pasos, 9 cuantiles | apache-2.0 (MIT runtime) | safetensors/MLX |
| amazon/chronos-bolt-small | ~48 M | 2048 obs. | 64 pasos, 9 cuantiles | apache-2.0 | PyTorch |
| chronos-bolt-base | no disponible en la informacion | no disponible | no disponible | apache-2.0 | PyTorch |
| chronos-bolt-mini | no disponible en la informacion | no disponible | no disponible | apache-2.0 | PyTorch |

La comparación relevante es con el modelo original de Amazon: misma arquitectura, mismos parámetros y misma semántica de salida, diferenciándose únicamente en el runtime (MLX frente a PyTorch) y en el entorno de ejecución (Apple Silicon frente a CUDA/CPU). No se dispone de datos de rendimiento comparativo entre variantes de tamaño dentro de la familia Chronos-Bolt en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no tiene tokenizador y no puede usarse para generación, chat ni tareas de NLP.
- Horizonte fijo de 64 pasos: no se documenta extensión del horizonte más allá de ese valor.
- Las exportaciones Apple (Core ML/Core AI) usan formas fijas (batch 1, contexto 2048), lo que obliga a rellenar con NaN las entradas cortas; el runtime MLX preserva el contexto máximo original.
- La validación numérica se limita a 3 casos deterministas; no constituye una certificación de calidad de forecasting en producción.
- Dependencia de Apple Silicon para el runtime MLX incluido; la compatibilidad de versiones fuera del entorno probado (PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4) no está garantizada.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de pronósticos poco fiables en series con cambios de régimen no vistos en el entrenamiento original.
- Sesgos: no documentados en la información disponible; el modelo base puede reflejar sesgos de los datos de entrenamiento de Chronos, no detallados aquí.
- Licencia: los pesos son apache-2.0, pero el autor advierte que no se implica ninguna certificación de seguridad ni licencia comercial adicional; el conversor y el runtime son MIT.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/masahiroid/chronos-bolt-small-mlx
- Modelo base en Hugging Face: https://huggingface.co/amazon/chronos-bolt-small
- Revisión del checkpoint original: https://huggingface.co/amazon/chronos-bolt-small/tree/772f3d25d38aec6d914c8949dab4462e2d46f5d8
- Exportación Core ML: https://huggingface.co/masahiroid/chronos-bolt-small-coreml
- Exportación Core AI: https://huggingface.co/masahiroid/chronos-bolt-small-coreai
- Exportación GGUF: https://huggingface.co/masahiroid/chronos-bolt-small-gguf
- Ficha del modelo en The Applied: https://theapplied.co/models/amazon-chronos-bolt-small
