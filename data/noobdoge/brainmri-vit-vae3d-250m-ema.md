# NoobDoge/brainmri-vit-vae3d-250m-ema

## Resumen

BrainMRI ViT-VAE 3D es un autoencoder variacional (VAE) de 249.197.600 parámetros diseñado para la compresión y reconstrucción de volúmenes de resonancia magnética cerebral en tres dimensiones. Lo publica el usuario NoobDoge bajo el paraguas del proyecto OncoMMAI, y acompaña al artículo *A High-Compression Transformer VAE for Efficient 3D Medical Image Generation*. No es un modelo generativo de texto ni un asistente conversacional: es una pieza de infraestructura para pipelines de generación de imágenes médicas, concretamente el codificador/decodificador que transforma volúmenes 3D en latentes compactos de 16 canales y los reconstruye.

Su relevancia técnica está en la relación de compresión: con un parche de 8x8x8 y un latente gaussiano de 16 canales, reduce el volumen espacial en un factor de 512 por eje de parcheo agregado, lo que hace viable entrenar modelos de difusión (DiT) sobre latentes 3D en lugar de sobre vóxeles completos. La versión publicada son los pesos EMA (media móvil exponencial) en el paso de entrenamiento 325.000, exportados en float32 y acompañados de preprocesado congelado y estadísticas latentes por canal para normalizar aguas abajo.

El modelo tiene descargas y likes nulos en el momento de la consulta, no declara licencia y no distribuye datos de entrenamiento ni información de pacientes. Es, por tanto, un artefacto de investigación reutilizable por quien necesite el codificador latente, no un producto listo para producción clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-VAE 3D (transformer); 4 bloques de encoder y 16 de decoder, anchura 1024, parche 8x8x8, latente gaussiano de 16 canales |
| Parámetros totales | 249.197.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen 3D, no de texto) |
| Tipos de cuantización | no disponible; pesos publicados en float32, inferencia documentada en bf16 |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, float32) + `config.json`, `weights_info.json`, `preprocess.json`, `latent_stats.json` |

## Arquitectura y entrenamiento

El modelo es un VAE con backbone transformer (ViT) adaptado a volúmenes 3D. El encoder consta de 4 bloques y el decoder de 16, ambos con anchura 1024, y el parcheo es de 8x8x8 vóxeles. La salida del encoder es un latente gaussiano de 16 canales con geometría variable `(B, 16, Dz, Hy, Wx)`, y la reconstrucción se obtiene decodificando ese latente con la geometría devuelta por `encode`. La cabeza de salida es lineal sobre píxeles en el rango `[0, 1]`, sin activación `tanh`, lo que implica que el modelo espera y produce intensidades normalizadas, no valores centrados.

El preprocesado de inferencia está congelado en `preprocess.json`: orientación RAS, remuestreo a 1 mm, normalización por percentiles 0,5/99,5, escalado a `[0, 1]` y relleno con ceros. No hay normalización del latente en la frontera del VAE; para entrenar un DiT aguas abajo se aplica una transformación por canal `u = (z - mean) / std` con las estadísticas de `latent_stats.json`, calculadas sobre 1000 volúmenes de entrenamiento (`subset_estimate: true`). Los pesos corresponden al estado EMA en el paso 325.000.

No se especifican en la información disponible el número total de tokens/vóxeles de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación (no aplicables en un VAE de imágenes). Tampoco se detalla la función de pérdida ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Compresión de volúmenes de RM cerebral 3D a latentes de 16 canales mediante el encoder.
- Reconstrucción de volúmenes a partir de latentes mediante el decoder, con salida en `[0, 1]`.
- Codificación determinista: `encode` devuelve la media posterior, sin muestreo estocástico en la interfaz de inferencia.
- Manejo de geometrías variables: el latente conserva dimensiones `(Dz, Hy, Wx)` derivadas del volumen de entrada, no un tamaño fijo.
- Inferencia en bf16 documentada, con carga en `cuda:0` mediante el paquete `vae3d`.
- Provisión de estadísticas latentes por canal para normalización de modelos de difusión aguas abajo.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No incorpora visión 2D natural ni audio; su dominio es exclusivamente imagen médica volumétrica 3D.

## Casos de uso

- Entrenamiento de modelos de difusión 3D sobre latentes: el VAE comprime cada volumen a un latente de 16 canales con parche 8x8x8, de modo que un DiT puede entrenarse sobre representaciones de baja dimensionalidad en lugar de vóxeles completos, reduciendo coste de memoria y cómputo.
- Generación sintética de volúmenes de RM para aumento de datos: se generan latentes con un modelo generativo y se decodifican con este VAE para obtener volúmenes plausibles que amplíen conjuntos de entrenamiento en tareas de segmentación o detección.
- Reconstrucción y compresión de archivos DICOM volumétricos: el par encode/decode permite almacenar latentes compactos y reconstruir el volumen con el decoder, útil en pipelines de archivado con requisitos de espacio.
- Preprocesado estandarizado en investigación multicéntrica: `preprocess.json` fija orientación RAS, remuestreo a 1 mm y normalización por percentiles, lo que homogeniza volúmenes de distintas fuentes antes de alimentar otros modelos.
- Extracción de características latentes para clasificación o regresión diagnóstica: los latentes de 16 canales sirven como entrada a cabezales ligeros para tareas como clasificación de tumores o predicción de subtipos, evitando procesar el volumen completo.
- Análisis de calidad y detección de anomalías: comparar la reconstrucción con el volumen original permite localizar regiones mal reconstruidas que pueden correlacionar con artefactos o patología.
- Integración en pipelines de investigación oncológica (contexto OncoMMAI): servir como componente de compresión en flujos de generación y análisis de imagen oncológica cerebral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 249,2 M de parámetros en float32, los pesos ocupan aproximadamente 1,0 GB; en bf16, unos 0,5 GB. A ello hay que sumar activaciones, que dependen del tamaño del volumen de entrada y de la resolución del latente, no especificadas en la información disponible.
- GPU recomendadas: no disponibles en la documentación; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar los pesos, aunque el pico de memoria durante la codificación de volúmenes grandes no está cuantificado.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 o superiores, condicionado al tamaño del volumen y al lote; no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: el autor proporciona el paquete `vae3d` con `load_model` y `VAEInference` sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VAE de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros VAE 3D de imagen médica ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; debe contactarse con el autor antes de cualquier uso en producción.
- Uso clínico no validado: no hay evidencia publicada de validación diagnóstica, y el modelo no debe emplearse para decisiones clínicas.
- Datos de entrenamiento no distribuidos: no se puede auditar la composición del dataset ni el sesgo demográfico o de adquisición (fabricante de escáner, protocolo, población).
- Estadísticas latentes calculadas sobre solo 1000 volúmenes (`subset_estimate: true`): el propio autor recomienda recalcularlas sobre el split completo si un DiT de producción las requiere.
- Preprocesado rígido: desviarse de RAS, 1 mm y percentiles 0,5/99,5 puede degradar la reconstrucción, ya que el modelo se entrenó con esa convención congelada.
- Sin normalización en la frontera del VAE: olvidar aplicar la transformación por canal antes de un DiT o invertirla antes de decodificar produce resultados incorrectos.
- Riesgo de alucinación estructural: como todo VAE generativo, el decoder puede introducir detalles plausibles pero inexistentes en la reconstrucción, especialmente en regiones con patología poco representada.
- Contexto espacial limitado por el parcheo 8x8x8: estructuras finas pueden perderse en la compresión; no hay métricas publicadas de fidelidad.
- Repositorio sin tracción (0 descargas, 0 likes) y creado en 2026-11-19: sin comunidad que valide el artefacto ni informes independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NoobDoge/brainmri-vit-vae3d-250m-ema
- Código de inferencia y documentación: https://github.com/OncoMMAI/brainmri-vit-vae3d
- Artículo de referencia: *A High-Compression Transformer VAE for Efficient 3D Medical Image Generation* (sin enlace directo en la información disponible)
