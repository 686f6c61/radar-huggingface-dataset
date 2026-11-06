# cyun9286/IGGT4D-causal-v19r10-step5676

## Resumen

IGGT4D causal geometry model v19r10 (step 5676) es un modelo de geometría 4D orientado a estimación de profundidad, rayos y pose de cámara a partir de flujos de vídeo RGB, desarrollado por el usuario cyun9286 y publicado en Hugging Face. No se trata de un modelo generativo de imágenes ni de un VAE: es un backbone de percepción geométrica que procesa fotogramas de forma causal (uno a uno) manteniendo una ventana de caché KV de 64 fotogramas que incluye un ancla del primer fotograma. El paquete corresponde al estado del modelo en el paso 5676 de un entrenamiento con pérdida unificada (v19r10).

El modelo emplea características ViT-g extraídas de las capas 19, 27, 33 y 39, y expone cabezas separadas para profundidad/rayos, componentes de cámara y características de instancia. Con 1.359.504.347 parámetros y un repositorio de 5,4 GB en safetensors, está pensado para inferencia o inicialización de pesos, no para reanudar entrenamiento exacto (el estado de optimizador y scheduler no se incluye).

Su relevancia es acotada pero específica: cubre el nicho de estimación geométrica causal en streaming, donde el modelo debe producir profundidad y pose de cámara fotograma a fotograma sin acceso al futuro del vídeo. La ausencia de descargas, likes y de una licencia declarada limita de momento su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone ViT-g con cabezas de profundidad/rayos, cámara y características de instancia; procesamiento causal en streaming |
| Parámetros totales | 1.359.504.347 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana KV de 64 fotogramas (incluye ancla del primer fotograma) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de visión, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (model.safetensors) + iggt4d.yaml, config.json, export_metadata.json, SHA256SUMS |

## Arquitectura y entrenamiento

La arquitectura combina un backbone ViT-g del que se extraen características en las capas 19, 27, 33 y 39, sobre las que se montan cabezas específicas: profundidad y rayos, componentes de cámara y características de instancia. El flujo de inferencia es causal y en streaming: se procesa un fotograma RGB cada vez (`rgb: [B, 1, 3, H, W]`, con H y W divisibles por 14) manteniendo una caché KV con ventana de 64 fotogramas que incluye el ancla del primer fotograma. La normalización de entrada tipo ImageNet se aplica internamente en `stream_step`.

El checkpoint corresponde al paso 5676 de un entrenamiento con pérdida unificada (v19r10). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. El export se verificó tensor a tensor contra el checkpoint original, comprobando claves y formas contra la arquitectura IGGT4D; se excluyeron optimizador y scheduler, por lo que sirve para inferencia o inicialización de pesos, pero no para reanudar el entrenamiento de forma exacta. La verificación se realizó en CPU sin ejecutar inferencia adicional en GPU.

## Capacidades

- Estimación de profundidad por fotograma a partir de RGB en flujos de vídeo.
- Predicción de rayos y codificación de cámara (pose de cámara) en modo causal.
- Extracción de características de instancia.
- Procesamiento en streaming con ventana KV de 64 fotogramas y ancla del primer fotograma.
- Salidas múltiples: profundidad, rayos, codificación de cámara y características de instancia.
- No es un modelo de generación de texto, código, matemáticas ni visión generativa.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües (el modelo opera sobre visión, no sobre lenguaje).

## Casos de uso

- Reconstrucción 3D incremental en vídeo: procesar un flujo RGB fotograma a fotograma con `stream_step` para obtener profundidad y pose de cámara acumuladas, adecuado por su naturaleza causal y su ventana de 64 fotogramas.
- Odometría visual para robótica: estimar el movimiento de cámara en tiempo real a partir de la codificación de cámara emitida por el modelo, útil en sistemas embarcados que no pueden esperar al futuro del vídeo.
- SLAM denso en streaming: integrar las salidas de profundidad y rayos en un pipeline de mapeo y localización que se beneficie de la consistencia temporal de la caché KV.
- Análisis de vídeo en dispositivos con memoria limitada: el procesamiento de un único fotograma por paso reduce el pico de memoria frente a enfoques multi-fotograma no causales.
- Segmentación por instancia asistida por geometría: usar las características de instancia junto con la profundidad para tareas de separación de objetos en escenas dinámicas.
- Inicialización de pesos para investigación: al incluir el estado completo del modelo sin optimizador, sirve como punto de partida para fine-tuning o para reproducir la arquitectura IGGT4D en nuevos experimentos.
- Preprocesado para pipelines de novedad de vista o renderizado: las salidas de profundidad, rayos y cámara pueden alimentar etapas posteriores de reconstrucción o síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que las evaluaciones reportadas para otros pasos del checkpoint no son mediciones de este export concreto, y que las escenas incluidas en el entrenamiento de revisión no deben describirse como validación held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.359.504.347 parámetros en safetensors, el peso en precisión original ocupa aproximadamente 5,4 GB, por lo que en FP16/BF16 se requiere un orden de magnitud similar solo para pesos, más la caché KV de 64 fotogramas y las activaciones del backbone ViT-g.
- GPU recomendadas: no disponible en la documentación; por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) es un punto de partida razonable, sin confirmación del autor.
- ¿Cabe en GPU de consumo? Probable en GPUs de consumo con 16 GB o más en FP16, sujeto a la memoria de la caché KV y a las activaciones; no confirmado.
- Opciones de despliegue: la model card indica usar la implementación IGGT4D correspondiente y el wrapper de streaming v19r10 (`load_iggt`, `stream_step`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de profundidad causal en streaming ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier despliegue en producción.
- Modelo de geometría, no generativo: no produce RGB ni texto; cualquier expectativa de generación de imágenes o lenguaje es incorrecta.
- Verificación solo en CPU: el export se comprobó tensor a tensor, pero no se ejecutó inferencia en GPU sobre este paquete exacto.
- Evaluaciones no transferibles: los resultados de otros pasos del checkpoint no miden este export; no deben citarse como rendimiento de este modelo.
- Riesgo de fuga de evaluación: las escenas incluidas en el entrenamiento de revisión no constituyen validación held-out.
- Dependencia de implementación: requiere el wrapper causal de streaming; un forward multi-fotograma genérico puede no reproducir el mismo comportamiento.
- Reset de caché entre escenas: no hacerlo introduce contaminación de contexto entre secuencias.
- Restricción de entrada: H y W deben ser divisibles por 14.
- Sin datos de sesgos, alucinación o cobertura idiomática: no aplica el análisis lingüístico habitual, pero tampoco hay evaluación de sesgos geométricos publicada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/cyun9286/IGGT4D-causal-v19r10-step5676
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
