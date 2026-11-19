# GlucoseDao/kron-ppg-age

## Resumen
kron-ppg-age es un estimador de edad cronológica a partir de fotopletismografía (PPG) en crudo, desarrollado por GlucoseDao. Con solo 5,85 millones de parámetros y un grafo ONNX de 24 MB, está diseñado para ejecutarse en un teléfono o un reloj inteligente, lo que lo sitúa en la categoría de modelos de borde (edge) para biosensores portátiles.

El modelo emplea un codificador causal KronLSTM que procesa la señal PPG en parches de 0,2 s a 25 Hz y transporta su memoria entre fragmentos, junto con una cabeza de regresión que lee la media acumulada de sus estados ocultos. Esto permite emitir una estimación de edad en cualquier momento de una grabación, sin necesidad de completar la ventana.

Su relevancia radica en que demuestra que un modelo de menos de 6 millones de parámetros puede alcanzar un error absoluto medio (MAE) de 6,38 años en edad cronológica sobre pacientes quirúrgicos retenidos, frente a 11,74 años del predictor de la mediana. No obstante, el propio autor advierte que no es una medida de salud y que su generalización fuera del dominio de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KronLSTM causal (encoder recurrente) + cabeza MLP de regresión sobre media acumulada de estados ocultos |
| Parametros totales | 5,85 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 30 s a 25 Hz; inferencia en fragmentos de 5 s (125 muestras) con estado recurrente |
| Tipos de cuantizacion | no disponible (grafo ONNX de 24 MB en precisión original) |
| Idiomas soportados | no disponible (modelo de series temporales, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`onnx/stream.onnx`) y PyTorch (`model.pt`) |

## Arquitectura y entrenamiento
El modelo combina un codificador recurrente KronLSTM de tipo causal que lee la señal PPG en parches de 0,2 s (25 Hz) y mantiene su estado entre fragmentos de 5 s, con una cabeza de edad consistente en un MLP pequeño que opera sobre la media acumulada de los estados ocultos. El grafo ONNX expone entradas `samples` de forma `(batch, 125)`, una máscara booleana `valid` de forma `(batch, 25)` y estados recurrentes (`pool_sum`, `pool_count` y estados internos) que el llamante debe realimentar en cada paso.

El entrenamiento se realizó en dos fases. Primero, 160 000 pasos de preentrenamiento autosupervisado sobre ventanas de 30 s de VitalDB y GalaxyPPG, con dos objetivos: predecir el siguiente segundo de señal y un contraste entre dos ventanas de la misma persona, usando 4 086 personas. Después, se entrenó la cabeza de edad sobre el codificador congelado con 4 071 personas de VitalDB con edad conocida (media 57,5 años, desviación típica 14,8), seleccionando el mejor paso sobre 912 personas de validación. El preprocesado exigido es: filtro paso banda 0,5–8 Hz, remuestreo a 25 Hz y escalado robusto por ventana de 30 s (resta de mediana, división por IQR/1,349).

## Capacidades
- Regresión tabular de edad cronológica a partir de señal PPG en crudo, con salida continua en años.
- Inferencia en streaming: emite una estimación de edad acumulada en cualquier momento, realimentando el estado recurrente entre fragmentos de 5 s.
- Procesamiento de series temporales fisiológicas a 25 Hz con ventanas de 30 s.
- Ejecución en dispositivos de borde mediante ONNX Runtime (grafo de 24 MB, 5,85 M de parámetros).
- Corrección de sesgo opcional (`a + b * age`) para calcular la brecha de edad cuando se conoce la edad real.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso
- Seguimiento de edad biológica en wearables: el modelo puede ejecutarse en un reloj o teléfono y emitir una estimación de edad acumulada durante una grabación PPG continua, gracias a su tamaño de 24 MB y a la gestión externa del estado recurrente.
- Investigación en envejecimiento y biometría: permite calcular la brecha entre edad predicha y real (con la corrección de sesgo de `config.json`) en cohortes con PPG de dedo, como herramienta exploratoria en estudios longitudinales.
- Prototipado rápido en aplicaciones de salud móvil: al estar en ONNX, se integra en pipelines de Android, iOS o Web con ONNX Runtime sin necesidad de infraestructura GPU.
- Filtrado y control de calidad de señal PPG: la máscara `valid` por parche de 0,2 s permite marcar tramos no válidos y condicionar la estimación a señal real.
- Docencia y reproducción de investigación: el repositorio `kron-fm` incluye receta de entrenamiento y el informe completo, lo que facilita replicar el experimento con el dataset `GlucoseDao/ppg-windows`.
- Evaluación comparativa de codificadores PPG: sirve como referencia ligera (5,85 M de parámetros) frente a arquitecturas transformer de mayor tamaño en tareas de regresión sobre señales fisiológicas.

## Benchmarks y rendimiento
Resultados sobre VitalDB con personas retenidas (897 pacientes quirúrgicos, PPG de dedo a 25 Hz, edades desde la infancia hasta 94 años), promediando ventanas de 30 s por persona:

| Modelo | MAE de test (años) | r |
|---|---|---|
| kron-ppg-age (semilla 0) | 6,38 | 0,84 |
| Misma receta, semillas 0–2 | 6,41 ± 0,03 | 0,84 |
| Predicción de la mediana de edad | 11,74 | – |
| Misma arquitectura entrenada desde cero | 7,76 | – |

En pacientes de UCI de BIDMC el modelo no superó al predictor de la mediana. En PPG de muñeca requiere calibración por dispositivo y por persona, con desviaciones de varios años sin ella.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB; el grafo ONNX ocupa 24 MB y el modelo tiene 5,85 M de parámetros.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer y en dispositivos móviles: teléfonos y relojes inteligentes, según el autor.
- Opciones de despliegue: ONNX Runtime (principal), con pesos PyTorch (`model.pt`) cargables mediante `kron_ppg.train.load_clock`.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño apunta a inferencia en tiempo real por fragmentos de 5 s.

## Comparativa con modelos similares
No se han proporcionado datos de modelos comparables en la información disponible. Como referencias internas del propio estudio, la misma arquitectura entrenada desde cero obtiene 7,76 años de MAE y el predictor de la mediana 11,74 años, frente a los 6,38 del modelo final. No hay comparación con otros relojes de envejecimiento basados en PPG en la documentación disponible.

## Limitaciones y advertencias
- Estima edad cronológica, no es una medida de salud: la brecha entre edad predicha y real no separa personas con hipertensión, diabetes o ASA ≥ 3 de las que no las tienen (AUC 0,49–0,56, con intervalos del 95 % que contienen 0,5 en todas las ejecuciones).
- Entrenado con PPG de dedo de pacientes quirúrgicos: en pacientes de UCI de BIDMC no supera al predictor de la mediana.
- En PPG de muñeca requiere calibración por dispositivo y por persona; sin ella se esperan desviaciones de varios años.
- El error reportado es por persona promediando muchas ventanas; una sola ventana de 30 s es mucho más ruidosa.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código derivado y el servicio en red; revisar compatibilidad antes de uso comercial propietario.
- Depende de un preprocesado estricto (filtro 0,5–8 Hz, remuestreo a 25 Hz, escalado robusto por ventana); desviaciones degradan la estimación.
- Riesgo de alucinación no aplicable (no es un modelo generativo de texto), pero sí de extrapolación fuera de la distribución de entrenamiento (población quirúrgica, PPG de dedo).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/GlucoseDao/kron-ppg-age
- Dataset: https://huggingface.co/datasets/GlucoseDao/ppg-windows
- Repositorio de código y receta de entrenamiento: https://github.com/antonkulaga/kron-fm
- Informe completo: `reports/PPG foundation models and aging clocks 2026.md` dentro del repositorio anterior
- VitalDB (CC BY 4.0): citado en la dataset card
- GalaxyPPG (CC BY 4.0): citado en la dataset card
