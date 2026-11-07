# masahiroid/chronos-bolt-small-coreml

## Resumen

chronos-bolt-small-coreml es una conversión a Core ML del modelo de series temporales amazon/chronos-bolt-small, publicada por el usuario masahiroid. No se trata de un modelo nuevo ni de un fine-tuning: es un checkpoint convertido a formato Core ML ML Program con pesos y cómputo en F32, pensado para ejecutar previsión de series temporales en el ecosistema Apple (macOS 14+ e iOS 17+). El modelo original es un miembro de la familia Chronos-Bolt de Amazon, basada en arquitectura T5 y orientada a forecasting zero-shot.

La relevancia de esta conversión es práctica: permite desplegar un modelo de forecasting de aproximadamente 48 millones de parámetros en dispositivos Apple sin depender de PyTorch en tiempo de inferencia. Genera 9 cuantiles (0,1 a 0,9) para un horizonte de 64 pasos futuros, con una ventana de contexto de hasta 2048 observaciones. La entrada está fijada en forma `[1, 2048]` con batch 1, por lo que no admite batching dinámico.

El repositorio es pequeño (0,2 GB), tiene cero descargas y cero likes en el momento de la consulta, y no incluye benchmarks de calidad de tarea ni de latencia. La validación publicada se limita a paridad numérica frente a la implementación original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (modelo base amazon/chronos-bolt-small), convertido a Core ML ML Program |
| Parametros totales | aproximadamente 48 millones (dato del modelo base, no verificado en la conversion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2048 observaciones (forma de entrada fija `[1, 2048]`) |
| Tipos de cuantizacion | F32 (el autor indica explicitamente que no es una cuantizacion de 4 bits) |
| Idiomas soportados | no aplica (modelo de series temporales, sin tokenizador de texto) |
| Licencia | apache-2.0 (pesos); las anadiduras de conversion y runtime son MIT |
| Formato de pesos | Core ML `.mlpackage` (ML Program, F32) |

## Arquitectura y entrenamiento

El modelo subyacente, amazon/chronos-bolt-small, es un transformer de tipo T5 adaptado a previsión de series temporales. Chronos-Bolt tokeniza los valores numéricos de la serie y produce directamente una distribución cuantílica sobre el horizonte futuro, lo que evita el muestreo autoregresivo de las primeras versiones de Chronos y reduce el coste de inferencia. El modelo original se entrena sobre corpus de series temporales y se evalua en regimen zero-shot.

Esta conversión concreta no introduce entrenamiento adicional ni fine-tuning. Según la model card, se parte de la revisión `772f3d25d38aec6d914c8949dab4462e2d46f5d8` del repositorio de Amazon y se exporta a Core ML con coremltools 9.0, PyTorch 2.14.1 y Transformers 4.57.3. La validación numérica se realizó sobre 3 casos deterministas, con una diferencia absoluta máxima de salida de 3,8146973e-06 y una similitud coseno mínima de 1. Los casos cubren una tendencia con sinusoide, una serie constante y una serie con observaciones faltantes. No se aportan datos sobre composición del dataset de entrenamiento original ni sobre etapas de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Previsión de series temporales univariadas en modo zero-shot, sin ajuste específico por serie.
- Generación de 9 cuantiles (0,1 a 0,9) por paso futuro, lo que permite intervalos de predicción.
- Horizonte de predicción fijo de 64 pasos futuros.
- Contexto de hasta 2048 observaciones; en las exportaciones Apple de contexto fijo, las entradas cortas pueden rellenarse por la izquierda con NaN.
- Entrada con batch fijo de 1; no soporta batching dinámico en esta exportación.
- Sin tokenizador de texto: no procesa lenguaje natural ni admite prompts.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Previsión de demanda en aplicaciones iOS: integrar el `.mlpackage` en una app que estime la demanda de las próximas 64 unidades de tiempo (horas, días) a partir de hasta 2048 observaciones históricas, con intervalos cuantílicos para gestión de stock.
- Monitorización de métricas de infraestructura en macOS: predecir latencia, CPU o memoria a corto plazo y generar alertas cuando el cuantil 0,9 supere un umbral, aprovechando la inferencia local sin enviar datos a un servidor.
- Predicción de series financieras de alta frecuencia en dispositivo: calcular bandas de confianza con los 9 cuantiles sobre ventanas de hasta 2048 puntos, útil en herramientas de análisis que deben funcionar offline.
- Sensórica industrial o domótica: previsión de temperatura, consumo energético o lecturas de sensores en un dispositivo Apple, con relleno por la izquierda con NaN para arranques en frío con histórico escaso.
- Prototipado rápido de forecasting en Xcode: validar un pipeline completo de previsión en macOS antes de invertir en infraestructura de servidor, gracias a la paridad numérica verificada frente a PyTorch.
- Evaluación comparativa de backends: usar esta exportación junto a las variantes MLX, Core AI y GGUF del mismo autor para medir latencia y consumo en distintos runtimes Apple sin cambiar el modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea ni de latencia en la informacion disponible. La única validación reportada es de paridad numérica frente a la implementación original en PyTorch:

| Metrica | Valor |
|---|---|
| Casos de validacion | 3 (deterministas) |
| Diferencia absoluta maxima de salida | 3,8146973e-06 |
| Similitud coseno minima | 1 |
| Benchmark de calidad de tarea | no disponible |
| Benchmark de latencia | no disponible |

## Requisitos de hardware

- Inferencia en dispositivo Apple con macOS 14+ o iOS 17+; el autor probó la predicción en macOS, no en un iPhone.
- Almacenamiento: repositorio de 0,2 GB; el `.mlpackage` en F32 ocupa un orden de magnitud similar.
- Memoria: no se publican cifras de VRAM o memoria unificada; al tratarse de un modelo de aproximadamente 48 millones de parámetros en F32, la huella es reducida, pero no hay medición oficial.
- GPU recomendadas: no disponible; Core ML selecciona el backend disponible (CPU, GPU o Neural Engine) según el dispositivo.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no aplica, el formato Core ML está orientado a hardware Apple.
- Opciones de despliegue: coremltools en Python para pruebas; integración nativa en apps mediante Core ML. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| masahiroid/chronos-bolt-small-coreml | aprox. 48 M | 2048 observaciones | Core ML F32 | apache-2.0 | Conversion sin entrenamiento; validacion solo de paridad numerica |
| amazon/chronos-bolt-small | aprox. 48 M | no disponible en la informacion | PyTorch / safetensors | apache-2.0 | Modelo original de referencia |
| masahiroid/chronos-bolt-small-mlx | aprox. 48 M | contexto maximo original | MLX | apache-2.0 | Misma conversion para runtime MLX |
| masahiroid/chronos-bolt-small-gguf | aprox. 48 M | contexto maximo original | GGUF | apache-2.0 | Misma conversion para llama.cpp y similares |

## Limitaciones y advertencias

- No es un modelo nuevo: no hay entrenamiento, fine-tuning ni certificación de seguridad; hereda el comportamiento del checkpoint original de Amazon.
- La validación publicada cubre solo 3 casos de paridad numérica, no calidad de previsión en datos reales.
- Entrada fija `[1, 2048]` con batch 1: no admite lotes ni longitudes variables sin relleno; las series cortas requieren padding con NaN en las exportaciones Apple de contexto fijo.
- Horizonte fijo de 64 pasos; no se puede ampliar sin cambiar el modelo.
- Sin tokenizador de texto ni capacidades de lenguaje, visión o agentes.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de previsiones mal calibradas fuera de la distribución de entrenamiento del modelo original.
- Sesgos: no documentados en la información disponible.
- Licencia apache-2.0 para los pesos, con términos del proyecto original en `LICENSE`; las anadiduras del conversor son MIT. No se implica licencia comercial adicional.
- Compatibilidad de versiones fuera del entorno probado (PyTorch 2.14.1, coremltools 9.0, chronos-forecasting 2.3.2) no garantizada.
- Repositorio sin descargas ni validación comunitaria; tratar como experimental para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/chronos-bolt-small-coreml
- Modelo base: https://huggingface.co/amazon/chronos-bolt-small
- Revisión concreta del modelo base: https://huggingface.co/amazon/chronos-bolt-small/tree/772f3d25d38aec6d914c8949dab4462e2d46f5d8
- Variante MLX: https://huggingface.co/masahiroid/chronos-bolt-small-mlx
- Variante Core AI: https://huggingface.co/masahiroid/chronos-bolt-small-coreai
- Variante GGUF: https://huggingface.co/masahiroid/chronos-bolt-small-gguf
- Ficha de referencia del modelo: https://theapplied.co/models/amazon-chronos-bolt-small
