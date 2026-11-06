# eCityAI-Sup/eCity-TS

## Resumen

eCity-TS es un modelo de previsión de series temporales multivariantes desarrollado por eCityAI-Sup, orientado específicamente a escenarios de gestión de servicios de agua (abastecimiento, red de distribución, presión y nivel de depósitos). Se trata de un transformer decoder-only de 313 millones de parámetros con una arquitectura basada en parches (patch-based) cuya atención alterna entre el eje temporal (causal) y el eje de variables (totalmente conectada), e incorpora una cabeza cuantílica que produce intervalos de incertidumbre.

El modelo resuelve un problema concreto: dada una ventana histórica de hasta 4096 pasos temporales sobre 15 variables, predice los siguientes 96 pasos en 9 cuantiles (0,1 a 0,9), lo que permite no solo estimaciones puntuales sino también intervalos de confianza útiles para planificación y toma de decisiones operativas.

Su relevancia actual radica en que se distribuye como artefacto ONNX listo para inferencia con ONNX Runtime y TensorRT, sin necesidad de cargar pesos en PyTorch, lo que simplifica el despliegue en producción. La licencia Apache 2.0 facilita su adopción comercial. No obstante, el repositorio no incluye información sobre datos de entrenamiento, benchmarks publicados ni resultados comparativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, patch-based, con atención alternada tiempo/variable y cabeza cuantílica |
| Parámetros totales | 313 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 pasos temporales de entrada; horizonte de predicción de 96 pasos |
| Tipos de cuantización | No disponible (se distribuyen pesos FP32 en ONNX y motor TensorRT FP32) |
| Idiomas soportados | No aplica (modelo de series temporales, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data` externo, ~1,3 GB) y motor TensorRT FP32 (~1216 MB) |

## Arquitectura y entrenamiento

eCity-TS emplea un transformer decoder-only con tokenización por parches sobre la dimensión temporal. La innovación principal reside en la atención alternada: las capas alternan entre atención causal sobre el eje del tiempo y atención totalmente conectada sobre el eje de las variables, lo que permite modelar simultáneamente dependencias temporales y correlaciones entre las 15 series. La cabeza de salida es cuantílica y produce 9 cuantiles (0,1 a 0,9) para cada paso del horizonte, con la mediana en el índice 4.

La entrada se compone de tres tensores: `target` con forma `[B, 15, 4096]` en float32, `target_mask` booleano que indica qué puntos fueron observados (permitiendo valores ausentes), y `series_ids` de tipo int64 que identifica cada variable. La única dimensión dinámica es el batch `B`, con perfil de optimización 1/4/8 tanto en ONNX como en TensorRT.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se detalla si hubo preentrenamiento sobre corpus genéricos de series temporales o entrenamiento específico sobre datos de utilities de agua.

## Capacidades

- Previsión multivariante de series temporales: 15 variables simultáneas con ventana de hasta 4096 pasos.
- Previsión cuantílica: 9 cuantiles por paso y variable, permitiendo intervalos de incertidumbre (P10 a P90).
- Manejo de valores ausentes mediante `target_mask`, que enmascara puntos no observados.
- Predicción multi-paso: horizonte de 96 pasos en una sola pasada forward.
- Inferencia por lotes: batch dinámico hasta 8 (perfil de optimización 1/4/8).
- Despliegue optimizado: ejecución vía ONNX Runtime (CPU o CUDA EP) y TensorRT.
- Identidad de variable estable mediante `series_ids`, lo que permite reutilizar el modelo entre lotes con el mismo conjunto de series.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: es un modelo puramente numérico de forecasting.

## Casos de uso

- Planificación de abastecimiento de agua: el modelo predice el volumen de suministro para las próximas 96 horas (o pasos) con intervalos P10/P90, lo que permite a los operadores dimensionar reservas y programar bombeos con margen de seguridad cuantificado.
- Gestión de la red de distribución: con 15 variables de entrada (caudales, presiones, niveles), el modelo estima el flujo en la red a corto plazo, facilitando la detección temprana de anomalías al comparar la predicción con la observación real.
- Control de presión: la predicción cuantílica permite anticipar picos de presión y ajustar válvulas reductoras antes de que se produzcan, reduciendo el riesgo de roturas.
- Gestión de niveles de depósitos: el horizonte de 96 pasos y la ventana de 4096 permiten modelar ciclos diarios y semanales, planificando el llenado y vaciado de depósitos según la demanda prevista.
- Detección de fugas: al disponer de intervalos de confianza, cualquier observación fuera del rango P10-P90 puede señalarse como candidata a fuga o fallo de sensor, integrándose en sistemas de alerta temprana.
- Programación energética de estaciones de bombeo: la previsión de demanda y niveles permite desplazar el bombeo a franjas tarifarias más baratas, usando la incertidumbre para dimensionar la reserva operativa.
- Simulación y planificación de escenarios: la máscara de valores ausentes permite alimentar el modelo con datos incompletos o simulados, útil para evaluar escenarios hipotéticos de demanda o fallo de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un snapshot de latencia y memoria pico para TensorRT con batch=4 (`example/ecity_ts_313m_15x4096.json`), pero no se proporcionan los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ONNX externos ocupan ~1,3 GB en FP32; el motor TensorRT FP32 ocupa ~1216 MB. A esto hay que sumar activaciones y buffers, por lo que se recomienda al menos 4-6 GB de VRAM para batch pequeño.
- GPU recomendadas: el entorno verificado por el autor es 8× NVIDIA H200, aunque el modelo es lo suficientemente pequeño como para ejecutarse en GPUs de gama media.
- GPU de consumo: con ~1,3 GB de pesos FP32, cabe holgadamente en cualquier GPU de consumo con 6 GB o más (RTX 3060, RTX 4060, RTX 4090). El cuello de botella es la ventana de 4096 pasos × 15 variables, no el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA Execution Provider) y TensorRT. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El autor advierte que el motor TensorRT está ligado al entorno de compilación (GPU, CUDA, TensorRT) y debe reconstruirse si cambia.
- El ONNX Runtime con CUDA EP activa TF32 por defecto, lo que infla la desviación a ~1e-1; el autor recomienda desactivarlo con `use_tf32: "0"` para reproducir la referencia FP32.
- Requiere CUDA 12.x y cuDNN 9; en el path ONNX es necesario `ort.preload_dlls()` para evitar que el CUDA EP caiga a CPU silenciosamente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de forecasting de series temporales (como PatchTST, TimesNet, Chronos o Moirai), ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Dominio restringido: el modelo está diseñado para escenarios de utilities de agua con 15 variables; su uso fuera de ese dominio no está validado.
- Sin información sobre datos de entrenamiento: se desconoce la composición del dataset, el volumen de tokens y si hubo ajuste con datos reales de múltiples operadores, lo que limita la evaluación de sesgos y generalización.
- Riesgo de alucinación numérica: como todo modelo generativo de forecasting, puede producir predicciones plausibles pero incorrectas, especialmente ante regímenes no vistos (sequías extremas, fallos de infraestructura).
- Dependencia del entorno TensorRT: el motor `.engine` está ligado a la GPU, versión de CUDA y versión de TensorRT usadas en la compilación; cambiarlas exige reconstruir el motor. Para entornos distintos, usar el artefacto ONNX.
- Precisión numérica: TF32 activado por defecto en ONNX Runtime CUDA EP introduce desviaciones de ~1e-1; es necesario desactivarlo para reproducir la referencia.
- Sin benchmarks publicados: no hay evidencia comparativa de rendimiento frente a alternativas, lo que dificulta justificar su elección en producción.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, pero no hay garantías del autor sobre idoneidad para producción.
- Idiomas: no aplica; el modelo no procesa texto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, sin comunidad que valide resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eCityAI-Sup/eCity-TS
- Mirror en ModelScope: https://modelscope.cn/models/eCityAI/eCity-TS
- Paper referenciado en tags: arXiv:2605.20119 (no verificado en la información disponible)
