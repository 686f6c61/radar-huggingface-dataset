# Ichigo369/dem-sr-models

## Resumen

DEM-SR es un conjunto de dos checkpoints de superresolución de modelos digitales de elevación (DEM) desarrollado por Ichigo369 en el contexto de un proyecto de tesis. El objetivo es aumentar la resolución de un DEM NASADEM de 30 m a 10 m (factor 3× en cada dimensión, es decir, una celda de 30 m se convierte en nueve celdas de 10 m), condicionado por la imagen RGB de Sentinel-2 co-registrada, sobre 40 emplazamientos de High Mountain Asia. El repositorio incluye dos arquitecturas: una ResUNet-SR determinista de 17,8 M de parámetros y una RFVelocityUNet basada en rectified flow de 42,8 M de parámetros.

El modelo resuelve un problema específico de teledetección y geomorfología: la reconstrucción de relieve de alta resolución a partir de fuentes satelitales de menor resolución, manteniendo coherencia en pendientes e índices topográficos derivados (TRI). No es un modelo de lenguaje ni un modelo multimodal generalista, sino un par de redes convolucionales tipo U-Net con atención en el nivel 3, entrenadas sobre parches de 80×80 (LR) a 240×240 (HR) con la RGB de Sentinel-2 como condicionamiento.

La relevancia actual radica en que ambos modelos se entrenaron en una única GPU de consumo (RTX 4060 de 8 GB) bajo un límite estricto de 7,5 GB de VRAM, lo que demuestra que es viable producir modelos de superresolución geoespacial competitivos con hardware asequible. El modelo determinista alcanza un RMSE de 4,073 m en el conjunto de test, superando claramente la línea base bicúbica (7,199 m).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResUNet-SR (determinista) y RFVelocityUNet (rectified flow); U-Net con atención en nivel 3 |
| Parametros totales | 17,8 M (unet_b64) / 42,8 M (rf_b64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión geoespacial, parches de 80×80 LR a 240×240 HR) |
| Tipos de cuantizacion | no disponible (checkpoints en precisión de entrenamiento, AMP bf16) |
| Idiomas soportados | no aplica (modelo geoespacial, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | checkpoints `torch.save` (`.pt`) con dict que incluye `model`, `ema`, `opt`, `sched`, `scaler`, `args`, entre otros |

## Arquitectura y entrenamiento

Ambos modelos son U-Net convolucionales con multiplicadores de canal 1,2,4,4 y atención en el nivel 3. La ResUNet-SR (17,8 M de parámetros, ancho base 64, 2 bloques) realiza regresión directa del residuo sobre el DEM bicúbicamente aumentado, con pérdida L1 más consistencia de pendiente (λ = 0,3). La RFVelocityUNet (42,8 M de parámetros, ancho base 80, 3 bloques, dropout 0,1) emplea rectified flow con condicionamiento piramidal y CFG (p = 0,1), con pérdida MSE enmascarada sobre la velocidad del flujo y muestreo Euler con NFE 8. La salida de ambos es un residuo que se suma a la entrada bicúbica.

El entrenamiento se realizó sobre 67.462 parches co-registrados (53.838 train, 9.427 val, 4.197 test) de 40 emplazamientos de High Mountain Asia (10 montañas, 10 crestas, 10 colinas, 10 llanuras, 100×100 km cada uno). Las fuentes son el mosaico NASA HMA de 8 m (remuestreado a la referencia de 10 m), NASADEM de 1 arcsegundo (30 m) y Sentinel-2 L2A (RGB). Se usó normalización z-score por parche con estadísticas LR y muestreo balanceado por clase. El optimizador fue AdamW con schedule coseno y warmup, precisión AMP bf16 (fp16 divergió en el modelo RF), EMA con decaimiento 0,999 (unet) y 0,9999 (rf). Ambos entrenamientos se pausaron antes de agotar su presupuesto de pasos: 45.980/50.000 en unet_b64 y 64.014/80.000 en rf_b64.

## Capacidades

- Superresolución de DEM de 30 m a 10 m con factor 3× por dimensión (una celda → nueve celdas).
- Condicionamiento por imagen RGB de Sentinel-2 (3 bandas, 10 m) co-registrada con el DEM de entrada.
- Predicción de residuo sobre la interpolación bicúbica, lo que preserva la estructura de baja frecuencia del DEM original.
- Coherencia de pendientes e índices topográficos: la pérdida incluye consistencia de pendiente y se evalúa TRI (Terrain Ruggedness Index).
- Generación estocástica con rectified flow y guía CFG ajustable (escala óptima ≈ 1,25 con NFE 8) en el modelo RF.
- Inferencia sobre escenas completas con teselado y georreferenciación mediante `predict_sr.py` del repositorio GitHub.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión geoespacial.

## Casos de uso

- Reconstrucción de relieve de alta resolución en zonas montañosas: el modelo convierte DEM NASADEM de 30 m en superficies de 10 m condicionadas por Sentinel-2, útil para estudios geomorfológicos en High Mountain Asia donde no hay DEM de alta resolución disponible.
- Modelado hidrológico y de escorrentía: un DEM de 10 m con pendientes coherentes (MAE de pendiente 2,931° en el modelo determinista) mejora la delimitación de cuencas y el cálculo de direcciones de flujo frente al bicúbico.
- Análisis de riesgo de deslizamientos: la coherencia en TRI (MAE 1,679 m en unet_b64) permite derivar índices de rugosidad del terreno más fiables para inventarios de susceptibilidad.
- Planificación de infraestructura en terreno complejo: perfiles de elevación de mayor resolución para trazado de carreteras, tendidos y obras lineales en zonas con datos DEM limitados.
- Generación de datos de entrenamiento aumentados: el modelo RF con guía CFG permite muestrear múltiples realizaciones plausibles del residuo, útil para ensembles o análisis de incertidumbre del terreno.
- Corrección y fusión de fuentes DEM: el condicionamiento por RGB de Sentinel-2 permite incorporar información óptica de 10 m para refinar bordes de relieve que el DEM de 30 m no resuelve.
- Docencia y experimentación en superresolución geoespacial: ambos checkpoints se entrenaron en una RTX 4060 de 8 GB, por lo que sirven como referencia reproducible para experimentos con recursos limitados.

## Benchmarks y rendimiento

Resultados sobre 256 parches de test muestreados, con píxeles en blanco/faltantes enmascarados y predicciones sin post-procesado (fuente: `runs1/test_evaluation/summary_rf_b64_vs_unet_b64.csv`).

| Modelo | RMSE (m) | MAE (m) | MAE pendiente (°) | MAE TRI (m) | SSIM | PSNR (dB) |
|---|---|---|---|---|---|---|
| Bicúbico ×3 (línea base) | 7,199 | 5,532 | 5,194 | 2,903 | 0,9158 | 35,89 |
| rf_b64 (rectified flow) | 5,085 | 3,806 | 3,475 | 1,983 | 0,9557 | 39,45 |
| unet_b64 (ResUNet-SR) | 4,073 | 3,033 | 2,931 | 1,679 | 0,9674 | 41,27 |

Mejor RMSE de validación durante el entrenamiento: 2,291 m en unet_b64 (checkpoint en el paso 44.000) y 4,118 m en rf_b64 (checkpoint en el paso 58.000). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo geoespacial.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los checkpoints pesan 272 MB (unet_b64) y 653 MB (rf_b64), por lo que caben holgadamente en cualquier GPU de consumo con 4 GB o más.
- GPU recomendadas: RTX 4060 (usada en entrenamiento), RTX 3060, RTX 4090, A100, H100; cualquier GPU con soporte CUDA es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo (scripts del repositorio GitHub), `predict_sr.py` para escenas completas con teselado y georreferenciación. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma agregada; el entrenamiento del modelo RF consumía ~500 ms/paso en una RTX 4060 bajo un límite de 7,5 GB de VRAM. La inferencia con NFE 8 implica 8 evaluaciones del modelo por parche en el caso RF.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de superresolución de DEM en la documentación proporcionada. La única referencia cuantitativa es la línea base bicúbica incluida en los propios benchmarks del autor.

| Modelo | Parámetros | Contexto/parche | RMSE test (m) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unet_b64 (este repo) | 17,8 M | 80×80 → 240×240 | 4,073 | no disponible | Hugging Face |
| rf_b64 (este repo) | 42,8 M | 80×80 → 240×240 | 5,085 | no disponible | Hugging Face |
| Bicúbico ×3 (línea base) | 0 | 80×80 → 240×240 | 7,199 | no aplica | implementación estándar |
| Otros modelos SR de DEM | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente sobre 40 emplazamientos de High Mountain Asia; la generalización a otras regiones del mundo (llanuras, desiertos, zonas tropicales) no está validada.
- El dataset de entrenamiento no está publicado en el repositorio, lo que dificulta la reproducibilidad completa y la evaluación independiente.
- Ambos entrenamientos se pausaron antes de agotar su presupuesto de pasos (45.980/50.000 y 64.014/80.000); los checkpoints son los mejores alcanzados hasta la fecha, no modelos convergidos finales.
- El modelo determinista supera al de rectified flow en todas las métricas del test; el modelo RF requiere ajuste de la escala de guía (óptima ≈ 1,25 con NFE 8) y no es trivial de usar en producción.
- Licencia no especificada: no se puede confirmar el uso comercial sin contactar con el autor.
- No hay información sobre sesgos, riesgos de alucinación en el sentido lingüístico, ni restricciones idiomáticas, ya que no es un modelo de lenguaje.
- La inferencia requiere las definiciones de arquitectura del repositorio GitHub (`scripts/models_sr.py`); no es un checkpoint autocontenido en formato estándar como safetensors o GGUF.
- Los checkpoints son dicts de `torch.save` con `weights_only=False`, lo que implica riesgos de seguridad al cargarlos desde fuentes no verificadas.
- El condicionamiento por Sentinel-2 exige disponibilidad de imágenes RGB co-registradas de 10 m; en zonas con alta nubosidad o sin cobertura la calidad puede degradarse.

## Enlaces

- Hugging Face: https://huggingface.co/Ichigo369/dem-sr-models
- Repositorio de código (entrenamiento y evaluación): https://github.com/Bishalai/DEM_SR
- Repositorio de código (definiciones de modelos): https://github.com/Bishalai/DEM_SR/blob/main/scripts/models_sr.py
