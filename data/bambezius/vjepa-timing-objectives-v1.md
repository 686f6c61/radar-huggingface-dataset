# bambezius/vjepa-timing-objectives-v1

## Resumen

`bambezius/vjepa-timing-objectives-v1` es un repositorio de artefactos experimentales publicado por el usuario bambezius. No contiene un modelo de lenguaje generativo, sino los resultados, pesos de cabeceras de deteccion y predicciones de dos experimentos de ablacion sobre objetivos de entrenamiento temporal para deteccion de eventos en video. El backbone es V-JEPA 2.1 ViT-L congelado, sobre el que se entrenan decodificadores ligeros de una sola consulta (*single-query decoders*) para predecir etiquetas de eventos en clips de video.

El experimento compara dos formulaciones del objetivo de entrenamiento: una variante de **anticipacion** (las etiquetas positivas se desplazan -2 frames, es decir, -80 ms) y una variante **emparejada** (*paired*) que anade una perdida de ranking entre pares de ventanas del mismo clip situadas a -3/-2/-1 y +1/+2/+3 frames respecto a la etiqueta original. Ambas se ejecutan sobre el mismo split de datos (startup-v4: 3.934 clips de entrenamiento, 364 de validacion, 385 de test) y con las mismas condiciones de hardware (RTX 5090), semilla 42 y recetas de mineria de negativos, de modo que la comparacion no se vea confundida por deriva del detector ni por cambios en el modelo de mineria.

El repositorio es relevante para investigadores que trabajen en deteccion temporal de eventos con modelos de video auto-supervisados (V-JEPA), en el diseno de funciones de perdida con estructura temporal y en la reproducibilidad de experimentos de ablacion. Su tamano es de 0,0 GB en el momento de la consulta, lo que sugiere que el contenido publicado son principalmente manifiestos, configuraciones y predicciones, no pesos de un modelo de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2.1 ViT-L (backbone congelado) con decodificador de una sola consulta entrenable |
| Parametros totales | no disponible (el backbone es ViT-L; el numero exacto no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 frames consecutivos a 25 FPS, 9.600 tokens, recortes EMA de 640×480 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/video, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene predicciones, manifiestos, configuracion y logs; no se especifica formato de pesos) |

## Arquitectura y entrenamiento

El sistema se construye sobre **V-JEPA 2.1 ViT-L congelado**, un modelo de video auto-supervisado de tipo *joint-embedding predictive architecture*. Sobre las representaciones del backbone se entrena una cabecera de deteccion de una sola consulta (*fresh single-query decoders*), que procesa ventanas causales de 16 frames consecutivos a 25 FPS (640×480, recortes EMA originales) y emite una prediccion binaria por ventana. Cada ventana es causal: no se rellena con padding ventanas causales incompletas. Las caracteristicas de cada endpoint de un par se procesan de forma independiente; la cabecera nunca recibe las caracteristicas del otro endpoint como contexto.

El entrenamiento usa AdamW con learning rate 3e-4, weight decay 0,01, batch 64 con microbatch 8 y semilla 42. Se valida cada 200 actualizaciones con paciencia de cinco comprobaciones y un maximo de 20.000 pasos. La seleccion de checkpoint y la parada temprana se basan en la BCE de validacion ponderada por clip con etiquetas originales, mientras que las metricas de *timing* y de tasa de falsos positivos se reportan por separado para no confundir un cambio en la BCE con una ganancia de utilidad. En la variante *paired* se anaden 16 pares de objetivos por batch (un endpoint elegible en -3/-2/-1 frames y otro en +1/+2/+3 respecto a la etiqueta original, ambos del mismo clip), y una perdida de ranking `0.1 * mean(max(0, 1 - (logit_after - logit_before)))` promediada sobre los 16 pares, ademas de la BCE sobre las 64 ventanas. Esto implica que la variante *paired* cambia la composicion del batch y no es una ablacion puramente de perdida.

## Capacidades

- Deteccion temporal de eventos en video sobre ventanas causales de 16 frames a 25 FPS.
- Prediccion binaria de presencia de evento con cabecera de una sola consulta sobre representaciones V-JEPA 2.1 ViT-L.
- Entrenamiento con mineria de negativos y muestreo por importancia sobre clips de video.
- Soporte de objetivos de anticipacion (desplazamiento de etiquetas positivas a -2 frames / -80 ms).
- Soporte de perdida de ranking entre pares temporales del mismo clip (variante *paired*).
- Evaluacion con umbrales fijos y umbrales seleccionados sobre negativos de validacion para tasas de falsos positivos por clip del 0 %, 1 % y 5 %, aplicados sin cambios al test.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades multilingues.

## Casos de uso

- **Deteccion de eventos en video de vigilancia o monitorizacion**: el modelo puede usarse como detector binario por ventana causal de 16 frames para senalar la presencia de un evento en flujo de video a 25 FPS, aprovechando que las ventanas no se rellenan y respetan causalidad.
- **Investigacion en objetivos temporales**: el repositorio sirve como base reproducible para comparar formulaciones de perdida (anticipacion frente a ranking emparejado) manteniendo fijas las condiciones de hardware, semilla y mineria de negativos.
- **Sistemas de anticipacion de eventos**: la variante de anticipacion desplaza las etiquetas positivas 80 ms hacia atras, lo que permite entrenar detectores que reaccionan antes del inicio nominal del evento, util en alertas tempranas.
- **Aprendizaje de ranking temporal**: la variante *paired* con perdida de ranking puede emplearse para ordenar ventanas cercanas al evento y reducir falsos positivos en la frontera temporal.
- **Evaluacion con control de falsos positivos**: los umbrales calibrados sobre negativos de validacion para FPR de clip del 0 %, 1 % y 5 % permiten desplegar el detector con una tasa de falsas alarmas controlada y verificada en test.
- **Reproducibilidad de experimentos de ablacion**: los manifiestos, configuracion, logs de W&B, predicciones y checksums archivados permiten replicar los dos brazos del experimento en una RTX 5090.
- **Transferencia a nuevos dominios de video**: al mantener el backbone V-JEPA 2.1 ViT-L congelado y entrenar solo cabeceras ligeras, el coste de adaptacion a un nuevo conjunto de clips es bajo en comparacion con el ajuste fino completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodologia de evaluacion (BCE de validacion ponderada por clip, metricas de *timing* y de tasa de falsos positivos por clip al 0 %, 1 % y 5 %) y la existencia de predicciones y resultados archivados, pero no incluye cifras numericas de rendimiento.

## Requisitos de hardware

- **Entrenamiento**: los dos trabajos se ejecutaron en **RTX 5090** (una por trabajo), con backbone V-JEPA 2.1 ViT-L congelado y decodificadores ligeros; el coste dominante es la inferencia del backbone sobre 16 frames de 640×480 a 25 FPS.
- **VRAM estimada para inferencia**: no disponible de forma explicita; al ser un ViT-L con ventanas de 9.600 tokens, se requiere una GPU de gama alta, pero no se publica una cifra concreta.
- **GPU recomendadas**: RTX 5090 (verificada en los experimentos); otras GPU de gama alta no se mencionan en la informacion disponible.
- **Compatibilidad con GPU de consumo**: la RTX 5090 es una GPU de consumo de gama alta y es la unica verificada; no se indica compatibilidad con modelos inferiores.
- **Opciones de despliegue**: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; no aplica al ser un modelo de video).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de deteccion temporal de eventos ni con otras variantes de V-JEPA, y no se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- **Repositorio vacio o casi vacio**: el tamano del repo es de 0,0 GB, lo que sugiere que no contiene pesos completos ni un paquete listo para inferencia; es un archivo de artefactos experimentales.
- **Alcance limitado**: el modelo no es generativo ni linguistico; no soporta texto, tool calling, agentes ni capacidades multilingues.
- **Datos de entrenamiento especificos**: los resultados se obtuvieron sobre el split startup-v4 con clips concretos y una receta de mineria de negativos fija; la generalizacion a otros dominios de video no esta documentada.
- **Variante *paired* no es una ablacion pura**: cambia la composicion del batch ademas de anadir la perdida de ranking, por lo que las diferencias frente a la variante de anticipacion no pueden atribuirse solo a la perdida.
- **Seleccion de checkpoint por BCE con etiquetas originales**: puede penalizar positivos intencionadamente tempranos; las metricas de *timing* y FPR se reportan aparte para mitigar esta confusion, pero el sesgo de seleccion existe.
- **Sin datos de sesgo, alucinacion ni robustez**: no se publican analisis de sesgos ni de robustez frente a dominios o condiciones de grabacion distintas.
- **Fecha de creacion futura**: el repositorio figura creado el 2026-11-19, lo que debe tratarse con cautela a efectos de citacion y trazabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bambezius/vjepa-timing-objectives-v1
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
