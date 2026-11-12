# MHRDYN7/native-photoz-aion-ls-leakage-base-head

## Resumen

`native-photoz-aion-ls-leakage-base-head` es un prototipo de modelo de estimación de desplazamiento al rojo fotométrico (photo-z) desarrollado por el usuario MHRDYN7 y publicado en Hugging Face. Se trata de una cabeza de predicción (head) entrenada sobre embeddings congelados extraídos con un codificador denominado `aion_base_frozen_embed`, y su salida es una distribución de densidad mixta (mixture density network, MDN) sobre el desplazamiento al rojo, de la que se extrae una estimación puntual mediante la media de la mezcla.

El modelo se ha entrenado exclusivamente con fotometría sobre una muestra controlada frente a fugas de información (leakage-controlled) que combina datos de DESI DR1 y Legacy Survey. El autor especifica de forma explícita que no se han usado datos de COSMOS 2025, ni imágenes, ni espectros como entradas, lo que sitúa el modelo en un régimen estrictamente fotométrico. Es relevante porque aborda uno de los problemas clásicos de la estimación photo-z: la contaminación de las métricas de test por información filtrada del conjunto de entrenamiento.

Con 4 627 483 parámetros entrenables y un checkpoint de aproximadamente 17,7 MiB, es un modelo muy ligero, pensado como pieza de un pipeline mayor (el codificador base congelado más esta cabeza). La arquitectura de la cabeza es una red residual de 8 bloques con anchura 512 y K=9 componentes en la mezcla. La licencia es MIT y el formato de pesos es un `model.pt` cargable con `torch.load`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de red residual (8 bloques, anchura 512) sobre embeddings congelados; salida mixture density network con K=9 componentes |
| Parametros totales | 4 627 483 parametros entrenables (solo la cabeza; el codificador base esta congelado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es un vector de embedding por objeto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de regresion fotometrica) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch, cargable con `torch.load`); checkpoint de ~17,7 MiB |

## Arquitectura y entrenamiento

La cabeza es una red residual de 8 bloques con anchura 512 que consume un embedding de caracteristicas de tipo `aion_base_frozen_embed`. La salida es una mezcla de K=9 gaussianas (mixture density network) sobre el desplazamiento al rojo; la estimacion puntual reportada corresponde a la media de la mezcla. El codificador base permanece congelado durante el entrenamiento, de modo que solo se optimizan los 4,6 millones de parametros de la cabeza.

El entrenamiento se realizo con semilla 42 sobre una muestra leakage-controlled de DESI DR1 cruzada con Legacy Survey, usando exclusivamente fotometria. El autor no detalla en la informacion disponible el numero de objetos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de regularizacion o ajuste fino adicional. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Estimacion de desplazamiento al rojo fotometrico a partir de fotometria multibanda, sin imagenes ni espectros.
- Prediccion de una distribucion de densidad completa (mezcla de 9 gaussianas), no solo un valor puntual.
- Extraccion de estimacion puntual mediante la media de la mezcla.
- Integracion como cabeza sobre un codificador de embeddings congelado (`aion_base_frozen_embed`).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues, de vision, audio ni modo de razonamiento.
- No se documentan capacidades de agentes ni de generacion de texto.

## Casos de uso

- Estimacion photo-z en catalogos DESI DR1: el modelo puede aplicarse sobre los embeddings fotometricos de objetos de DESI DR1 para obtener una estimacion puntual y una distribucion de incertidumbre, adecuado porque se entreno especificamente sobre esa combinacion de datos.
- Validacion de pipelines de photo-z: al ser un prototipo leakage-controlled, sirve como referencia para comprobar si un pipeline propio sufre fugas de informacion comparando sus metricas con las reportadas.
- Analisis de incertidumbre por objeto: la salida MDN permite obtener una distribucion completa, util para seleccionar objetos con alta incertidumbre y priorizar seguimiento espectroscopico.
- Filtrado de muestras para estudios de estructura a gran escala: la estimacion puntual y el error asociado permiten aplicar cortes de calidad sobre catalogos fotometricos de Legacy Survey.
- Prototipado rapido en entornos con recursos limitados: con 4,6 millones de parametros y un checkpoint de 17,7 MiB, se puede desplegar en una GPU de consumo para experimentos de calibracion.
- Investigacion sobre fugas de informacion en photo-z: el diseno leakage-controlled con DESI DR1 y Legacy Survey lo hace util como caso de estudio metodologico para comparar estrategias de particion de datos.

## Benchmarks y rendimiento

Metricas de test reportadas por el autor sobre la estimacion puntual (media de la mezcla), con n = 15 000:

| Metrica | Valor |
|---|---|
| σ_NMAD | 0,04017506117626555 |
| Bias | -0,008076296143779119 |
| η(0,15) | 0,09106666666666667 |
| η(0,02) | 0,6142 |

No se han publicado resultados comparativos con otros modelos de photo-z en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint de la cabeza ocupa ~17,7 MiB y el modelo tiene 4,6 millones de parametros, por lo que cabe holgadamente en cualquier GPU moderna.
- El requisito dominante es el codificador base congelado (`aion_base_frozen_embed`), cuyo coste de memoria no se detalla en la informacion disponible.
- GPU recomendadas: cualquier GPU con suficiente memoria para el codificador base; la cabeza en si cabe en GPUs de consumo como RTX 3060 o superiores.
- Cabe en GPU de consumo: si, para la cabeza; el codificador base condiciona el requisito real.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load("model.pt")`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor remite a `summary.json` para tiempos y memoria GPU pico, datos no incluidos en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de photo-z con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Es un prototipo de tarea limitada (Limited Task 2), no un modelo validado para produccion.
- Entrenado exclusivamente con fotometria de DESI DR1 y Legacy Survey; su validez fuera de esa combinacion de datos no esta documentada.
- El control de leakage se aplica a la muestra descrita, pero no se detalla el esquema exacto de particion en la informacion disponible.
- No usa imagenes ni espectros como entrada, lo que limita su aplicabilidad a catalogos puramente fotometricos.
- Riesgo de sesgo y de calibracion deficiente en rangos de desplazamiento al rojo poco representados en la muestra de entrenamiento; no se documentan analisis por bins de redshift.
- El valor η(0,02) = 0,6142 indica que solo el 61,4 % de los objetos cumple el criterio de error a 0,02, lo que debe tenerse en cuenta en aplicaciones que exijan alta precision.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- No se documentan sesgos demograficos ni linguisticos porque el modelo no opera sobre texto ni personas.
- No se han publicado resultados de benchmarks frente a alternativas, por lo que no es posible situar su rendimiento relativo.

## Enlaces

- Hugging Face: https://huggingface.co/MHRDYN7/native-photoz-aion-ls-leakage-base-head
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
