# MHRDYN7/native-photoz-mdn-ls-leakage-k9

## Resumen

`MHRDYN7/native-photoz-mdn-ls-leakage-k9` es un prototipo de red de densidad de mezclas (mixture density network, MDN) para estimación de desplazamiento al rojo fotométrico (photo-z) a partir exclusivamente de fotometría. Lo desarrolla el usuario MHRDYN7 y se publica como una tarea limitada ("Limited Task 2") con fecha de 2026-11-12. El modelo estima la distribución de probabilidad del redshift en lugar de un único valor, lo que permite cuantificar la incertidumbre de la predicción.

El modelo se entrena sobre una muestra controlada frente a fugas de información ("leakage-controlled") que combina DESI DR1 y Legacy Survey. Según la model card, no utiliza datos de COSMOS 2025, ni imágenes, ni espectros como entrada: solo características fotométricas preprocesadas ("engineered"). Emplea una arquitectura de 8 bloques residuales con anchura 512 y K=9 componentes en la mezcla, con 4.259.867 parámetros entrenables y un checkpoint de aproximadamente 16,27 MiB.

Es relevante como referencia metodológica para pipelines de photo-z con separación estricta entre entrenamiento y evaluación, y por su licencia MIT, que facilita su reutilización. No obstante, se trata de un prototipo de autor individual, sin descargas ni validación externa publicada en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture density network (MDN) con 8 bloques residuales, anchura 512, K=9 componentes |
| Parametros totales | 4.259.867 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de características fotométricas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch, cargable con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura es una red de densidad de mezclas: un tronco de 8 bloques residuales con anchura 512 que produce los parámetros de una mezcla de K=9 gaussianas (medias, varianzas y pesos) sobre el redshift. La salida es, por tanto, una distribución condicional; la estimación puntual publicada se obtiene como la media de la mezcla ("mixture-mean point estimate"). El modelo consume características fotométricas preprocesadas de tipo `engineered`, no imágenes ni espectros.

El entrenamiento se realizó con semilla 42 sobre una muestra DESI DR1 × Legacy Survey con control de fugas de información. La model card no detalla el número de tokens ni el volumen exacto del conjunto de entrenamiento; indica que `summary.json` contiene los tiempos, el pico de memoria GPU, la arquitectura y los cortes ("cuts") exactos aplicados. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de regresión astronómica.

## Capacidades

- Estimación de redshift fotométrico a partir de fotometría únicamente, sin espectros ni imágenes.
- Predicción de una distribución de probabilidad completa (mezcla de 9 gaussianas) en lugar de un valor puntual.
- Cuantificación de incertidumbre mediante la dispersión de la mezcla.
- Estimación puntual por media de la mezcla, con métricas de sesgo y dispersión publicadas.
- Entrada de características tabulares preprocesadas de tipo `engineered`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo "thinking", visión, audio ni generación de texto.

## Casos de uso

- Catalogación fotométrica a gran escala: aplicar el modelo a catálogos con características fotométricas homogéneas para obtener redshifts estimados y su incertidumbre, útil en estudios de estructura a gran escala donde no hay espectroscopía disponible.
- Filtrado previo a seguimiento espectroscópico: usar la distribución de la mezcla para seleccionar objetos con alta incertidumbre y priorizar su observación espectroscópica.
- Análisis de tomografía débil: las distribuciones photo-z por objeto permiten construir bins de redshift con estimación de error, necesarios para cosmología con lentes gravitacionales.
- Control de calidad de pipelines: comparar la dispersión σ_NMAD y el sesgo del modelo contra referencias para detectar regresiones en el preprocesado de características.
- Estudio metodológico de fugas de información: el diseño "leakage-controlled" sirve como plantilla para evaluar cómo afectan las fugas de datos a las métricas de photo-z.
- Prototipado e investigación reproducible: al ser un checkpoint pequeño (16,27 MiB) con licencia MIT, se puede cargar en un portátil o en una GPU de consumo para experimentar con variantes de MDN.

## Benchmarks y rendimiento

Métricas de test publicadas en la model card (n = 15.000, estimación puntual por media de la mezcla):

| Metrica | Valor |
|---|---|
| σ_NMAD | 0,0365119348630827 |
| Bias | 0,0020553125072714437 |
| η(0,15) | 0,0806 |
| η(0,02) | 0,5628666666666666 |

No se han publicado comparaciones con otros modelos de photo-z en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint ocupa 16,27 MiB y el modelo tiene 4,26 M de parámetros, por lo que cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) e incluso en CPU para lotes moderados.
- GPU recomendadas: no se especifican; cualquier GPU con suficiente memoria para el tamaño del lote es válida. La model card menciona un pico de memoria GPU registrado en `summary.json`, pero no se reproduce su valor.
- Cabe en GPU de consumo: sí, con amplio margen.
- Opciones de despliegue: carga directa con `torch.load("model.pt")` en PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de photo-z con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Prototipo de tarea limitada ("Limited Task 2"): no está pensado como modelo de producción ni ha pasado validación externa.
- Entrenado sobre una muestra específica DESI DR1 × Legacy Survey con cortes concretos; su generalización a otros sondeos o a otras distribuciones fotométricas no está garantizada.
- Solo acepta características `engineered`; no procesa imágenes ni espectros, lo que limita su aplicación directa a datos en bruto.
- Riesgo de sesgo dependiente de la selección de la muestra y de los cortes aplicados; las métricas publicadas corresponden a un único conjunto de test de 15.000 objetos.
- El rendimiento η(0,02) = 0,5629 indica que una fracción considerable de objetos no alcanza precisión de 0,02 en redshift, lo que debe tenerse en cuenta en análisis que requieran alta precisión.
- Sin descargas ni likes en el momento de la ficha; ausencia de revisión por la comunidad.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre los resultados.
- No se documentan sesgos demográficos ni de otro tipo; al no ser un modelo de lenguaje, los riesgos habituales de alucinación no aplican, pero sí el riesgo de predicciones mal calibradas fuera del dominio de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/MHRDYN7/native-photoz-mdn-ls-leakage-k9
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
