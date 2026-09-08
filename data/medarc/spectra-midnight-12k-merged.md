# medarc/spectra-midnight-12k-merged

## Resumen

SPECTRA (merged) - Midnight-12k es un modelo de extracción de características (feature extraction) para histopatología y patología computacional, desarrollado por MedARC sobre el modelo base kaiko-ai/midnight. Su objetivo es mejorar la robustez del modelo frente a variaciones en la adquisición de muestras: cambios de escáner, tinción y centro hospitalario. El repositorio es un reemplazo directo del modelo base, ya que el delta de LoRA de rank 32 se ha plegado dentro de los pesos originales, por lo que no requiere la librería PEFT en tiempo de inferencia.

El modelo parte de una arquitectura Vision Transformer DINOv2 y se ha entrenado de forma contrastiva sobre tiles de PLISM registrados, donde la misma región física de tejido se imagina bajo múltiples condiciones de escáner y tinción. La representación final tiene una dimensión de 3072, combinando el token CLS con la media de los tokens de parche. El autor publica tres semillas independientes de entrenamiento, que no forman un ensemble, para medir la variabilidad de los resultados.

Relevancia actual: los modelos de patología computacional tienden a degradarse cuando se aplican a datos de un hospital, escáner o tinción diferentes. SPECTRA aborda ese problema con un enfoque contrastivo que alinea representaciones de la misma región de tejido bajo distintas condiciones de adquisición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DinoV2Model de transformers, base: kaiko-ai/midnight) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, procesa imagenes de 224x224) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer DINOv2, implementado como DinoV2Model en transformers, compuesto por 40 bloques de atención. La entrada son imágenes de 224x224 píxeles, preprocesadas con resize bilinear (no bicubic), centro recortado y normalización con media y desviación típica de 0.5. El modelo produce 256 tokens de parche con un embed_dim de 1536, más un token CLS sin registros. La representación final se obtiene concatenando el token CLS con la media de los tokens de parche, dando como resultado un vector de 3072 dimensiones.

El entrenamiento utiliza LoRA con rank 32, alpha 64 y scaling 2.0, aplicado sobre los módulos de atención (query, key, value, attention.output.dense) y MLP (mlp.weights_in, mlp.weights_out), un total de 240 módulos. El objetivo es contrastivo sobre tiles de PLISM registrados: la misma localización física de tejido, capturada bajo distintos escáneres y tinciones, se usa para acercar las representaciones de la misma región y separar las de regiones diferentes. El delta LoRA entrenado se pliega en los pesos base en fp32 antes de cualquier movimiento a dispositivo o cambio de dtype.

El optimizador es AdamW con lr 1e-4, weight decay 0.05 y grad clip 1.0. El programa de entrenamiento consta de 500 pasos totales, con 200 pasos de warmup. Los checkpoints publicados se seleccionaron en pasos intermedios dentro del periodo de warmup (pasos 100 y 150), por lo que no corresponden a un punto completamente annealed de la programación.

## Capacidades

- Extracción de características de tiles histopatológicos de 224x224, generando una representación de 3072 dimensiones mediante la concatenación del token CLS con la media de los tokens de parche.
- Robustez frente a variaciones de escáner, tinción y centro, como demuestran los resultados en PathoROB y PLISM.
- Capacidad de recuperación (retrieval) de tiles entre diferentes condiciones de adquisición, permitiendo buscar casos con morfología similar.
- Incluye tres semillas independientes de entrenamiento para evaluar la variabilidad de los resultados, sin actuar como un ensemble.
- Compatibilidad con el ecosistema transformers y timm; al ser un modelo fusionado, no requiere PEFT para cargarlo.
- Preprocesamiento documentado de forma explícita: resize bilinear, center crop y normalización con media 0.5 y desviación 0.5.

## Casos de uso

- Sistemas de apoyo al diagnóstico en patología digital: el modelo extrae características de tiles de biopsias o resecciones que pueden alimentar clasificadores aguas abajo, manteniendo el rendimiento aunque las muestras provengan de escáneres o tinciones diferentes.
- Búsqueda de casos similares en archivos de patología: la representación de 3072 dimensiones permite indexar millones de tiles y recuperar aquellos con morfología similar, útil para revisar diagnósticos previos o consultar casos de referencia.
- Transferencia de aprendizaje a tareas de patología: al ser drop-in replacement del modelo base, los investigadores pueden congelar las capas del modelo y entrenar cabezas de clasificación o segmentación sobre el vector de características sin modificar el pipeline existente.
- Adaptación a entornos multicéntricos: gracias a la robustez ante cambios de centro, el modelo puede usarse en ensayos o cohortes multicéntricas sin reentrenar el modelo base para cada hospital.
- Evaluación de robustez en investigación: con tres semillas publicadas, los equipos pueden cuantificar la varianza de métricas en benchmarks como PathoROB, PLISM, HEST o CPTAC, y comparar modelos con intervalos de confianza.
- Backbone para pipelines de patología computacional: el modelo sirve como extractor de características estándar para proyectos que requieren una base de visión genérica, con un preprocesamiento específico que evita errores silenciosos de normalización o interpolation.

## Benchmarks y rendimiento

Se han publicado resultados en la model card, tomados de las tablas del paper de SPECTRA. El intervalo indicado es la media más o menos dos desviaciones estándar sobre tres semillas (n=3).

| Metrica | Modelo base | SPECTRA (merged) |
|---|---|---|
| PathoROB mean robustness index (cross-centre) | 0.759 | 0.908 +/- 0.005 |
| PLISM top-1 retrieval across scanners | 0.752 | 0.991 +/- 0.005 |
| PLISM top-1 retrieval across stains | 0.560 | 0.883 +/- 0.036 |
| HEST mean Pearson r | 0.3952 | 0.4122 +/- 0.0022 |
| CPTAC AUC | 0.6643 | 0.6898 +/- 0.0016 |

El modelo supera al modelo base en todas las métricas reportadas. Destaca la mejora en recuperación entre escáneres, que pasa de 0.752 a 0.991, y entre tinciones, de 0.560 a 0.883.

## Requisitos de hardware

- VRAM estimada: no disponible. La documentación no especifica el número de parámetros del modelo ni los requisitos de memoria.
- GPU recomendadas: no disponible.
- Consumer GPU: no disponible. No hay datos oficiales sobre compatibilidad con GPUs domésticas.
- Opciones de despliegue: compatible con PyTorch, transformers (DinoV2Model) y timm. No está adaptado para vLLM, llama.cpp u Ollama, dado que es un modelo de visión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dimension de embedding | PathoROB (cross-centre) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaiko-ai/midnight | DINOv2 | 1536 (CLS) o 3072 (CLS + mean) | 0.759 | MIT | Hugging Face |
| SPECTRA (merged) | DINOv2 con LoRA plegado | 3072 | 0.908 | MIT | Hugging Face |
| Adaptador SPECTRA (adapter-only) | DINOv2 + delta LoRA separado | no disponible | no disponible | MIT | Hugging Face (mencionado en la model card) |

No se dispone de información de otros modelos comparables con los mismos datos de rendimiento en la documentación proporcionada.

## Limitaciones y advertencias

- Los checkpoints publicados proceden de pasos intermedios dentro del periodo de warmup (pasos 100 y 150 de 500, con 200 de warmup), por lo que no representan el punto final de un decaimiento completo de la tasa de aprendizaje. Esto es inusual y puede influir en la calidad final del modelo.
- El preprocesamiento debe coincidir exactamente con el publicado: resize bilinear de 224, center crop y normalización con media y desviación típica de 0.5. Usar bicubic o estadísticas de ImageNet degrada el rendimiento de forma silenciosa, sin generar avisos.
- No existe un preprocessor_config.json en el modelo, por lo que la normalización incorrecta es un error fácil de cometer al cargarlo con transformers.
- La representación debe leerse como CLS concatenado con la media de los tokens de parche (3072 dimensiones). Usar solo el token CLS reduce la dimensionalidad a la mitad y no coincide con los resultados publicados.
- Las tres semillas no forman un ensemble; se debe seleccionar una y reportar la dispersión entre las tres.
- El modelo es puramente de visión. No soporta procesamiento de lenguaje, texto ni otras modalidades.
- Aunque la licencia de los pesos es MIT, el uso en producción debe verificar las condiciones de uso y las licencias de los datos de entrenamiento (PLISM, etc.), que no están especificadas en la documentación.
- No se han publicado resultados de benchmarks independientes fuera de los proporcionados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/medarc/spectra-midnight-12k-merged
- Modelo base kaiko-ai/midnight: https://huggingface.co/kaiko-ai/midnight
- Repositorio OpenMidnight (replicación open-source de MedARC): https://github.com/MedARC-AI/OpenMidnight
- GitHub de MedARC: https://github.com/MedARC-AI
