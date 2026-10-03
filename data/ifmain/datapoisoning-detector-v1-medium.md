# ifmain/datapoisoning-detector-v1-medium

## Resumen

DataPoisoning Detector v1 Medium es un clasificador de imagen binario desarrollado por el usuario ifmain que detecta si una imagen ha sido protegida con esquemas de envenenamiento de datos orientados a impedir su uso en entrenamiento de modelos generativos (Glaze, Nightshade, Mist y MetaCloak). No es un modelo generativo: reutiliza únicamente el codificador VAE congelado de black-forest-labs/FLUX.2-klein-base-4B como extractor de características y añade una cabeza de clasificación transformer entrenada desde cero. El problema que resuelve es práctico para cualquiera que cure datasets de imagen a gran escala: identificar automáticamente muestras protegidas antes de incorporarlas a un pipeline de entrenamiento o fine-tuning.

La variante Medium tiene 182.722.433 parámetros totales, de los cuales 148.296.577 son entrenables, y forma parte de una familia de cuatro tamños (Tiny, Small, Medium y Large) destilados a partir de un teacher Large de 296 millones de parámetros. La entrada son recortes RGB nativos de 128 × 128 píxeles con una región activa central de 96 × 96; la inferencia a nivel de imagen promedia los logits de cinco recortes. El repositorio ocupa 0,7 GB y los pesos se publican en safetensors.

Su relevancia actual radica en que es una de las pocas herramientas publicadas que reporta recall específico por esquema de protección (Glaze, Nightshade, Mist, MetaCloak) con una tasa de falsos positivos objetivo del 1 % sobre controles limpios, y que además publica una comparación directa con LightShed, un detector previo del mismo tipo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador transformer sobre caracteristicas de un VAE congelado: fusion de cuatro flujos (bloques de encoder 1, 2 y 3 mas la media posterior final), proyeccion de cada flujo a una rejilla de 8 x 8 tokens y clasificacion final |
| Parametros totales | 182.722.433 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Parametros entrenables | 148.296.577 |
| Longitud de contexto | no aplica (clasificador de imagen; entrada de 128 x 128 RGB con region activa central de 96 x 96) |
| Tipos de cuantizacion | no disponible (el repo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (tarea de clasificacion de imagen, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | black-forest-labs/FLUX.2-klein-base-4B (solo el codificador VAE congelado; el decoder y el transformer generativo no se usan) |
| Pipeline | image-classification |
| Dataset de entrenamiento | ozdentarikcan/DiffVaxDataset |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El detector no procesa la imagen con un backbone convolucional convencional. Congela el codificador VAE de FLUX.2-klein-base-4B y extrae cuatro representaciones: las salidas de los bloques de encoder 1, 2 y 3, más la media posterior final. Cada flujo se proyecta a una rejilla de 8 × 8 tokens, y las tres diferencias temprano-a-final se fusionan con los cuatro flujos de características antes de pasar por el clasificador transformer. La hipótesis de diseño es que las perturbaciones introducidas por Glaze, Nightshade, Mist y MetaCloak alteran de forma medible la relación entre representaciones tempranas y tardías del VAE. El decoder del VAE y el transformer generativo de FLUX no intervienen en la inferencia, lo que mantiene el coste computacional muy por debajo del de un modelo de difusión completo.

El entrenamiento de la familia excluye CelebA-HQ de los conjuntos de entrenamiento, validación, test y cachés de parches, y consta de 21.464 registros de entrenamiento, 1.257 de validación y 1.446 de test. La variante Large parte de parámetros inicializados desde cero junto con el encoder VAE congelado. Los estudiantes (Medium incluido) se entrenan mediante destilación de objetivos suaves con divergencia KL Bernoulli a temperatura 2 desde ese Large, con una mezcla del 50 % de destilación y 50 % de clasificación supervisada más ranking por pares. La selección de checkpoint usa el recall de validación a una tasa de falsos positivos objetivo del 1 %, con ROC-AUC como criterio de desempate, y el proceso añade dos épocas de recuperación si detecta un declive, salvo señal sostenida de sobreajuste.

## Capacidades

- Clasificación binaria de imagen: distingue entre imágenes limpias e imágenes protegidas con esquemas de envenenamiento o anti-scraping.
- Detección específica de cuatro esquemas de protección: Glaze, Nightshade, Mist y MetaCloak, con recall reportado por separado para cada uno.
- Inferencia a nivel de imagen: promedia los logits de cinco recortes, lo que reduce la varianza frente a una decisión basada en un único parche.
- Umbral operativo ajustable: el punto de operación se selecciona en validación para una tasa de falsos positivos del 1 %, con ROC-AUC como alternativa de ordenación.
- Entrada de resolución nativa: recortes RGB de 128 × 128 con región activa central de 96 × 96.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión descriptiva, tool calling, capacidades de agente ni modo de pensamiento. Es exclusivamente un clasificador.
- No se documentan capacidades multilingües porque el modelo no procesa texto.

## Casos de uso

- Curación de datasets de entrenamiento: antes de incorporar un corpus de imágenes a un pipeline de difusión, el detector marca las muestras protegidas con Nightshade o Glaze para excluirlas, evitando envenenar el entrenamiento y respetando las condiciones de uso de los autores originales.
- Auditoría de pipelines de scraping: ejecutar el clasificador como paso de inspección sobre los datos ya recolectados permite estimar qué porcentaje del corpus está protegido y decidir si merece la pena depurarlo o descartarlo.
- Cumplimiento contractual y de derechos de autor: el prompt de acceso del repositorio obliga a procesar solo datos propios o con licencia; el detector aporta evidencia objetiva de que no se están ingiriendo obras con protección declarada.
- Moderación y procedencia en plataformas de imágenes: verificar de forma automática si una subida lleva marcas de protección permite etiquetarla correctamente o aplicar políticas diferenciadas de uso.
- Investigación en seguridad de IA: medir la tasa de detección frente a esquemas de protección sirve para evaluar la robustez real de Glaze, Nightshade, Mist y MetaCloak, y para cuantificar cuánto degradan la utilidad de una imagen protegida.
- Preprocesado previo a fine-tuning de modelos de difusión: integrar el detector como filtro en un job de preparación de datos reduce el riesgo de que técnicas de envenenamiento deterioren el modelo resultante.
- Control de calidad en bancos de imágenes comerciales: los proveedores pueden comprobar que el material que licencian no contiene muestras protegidas por terceros.
- Detección a gran escala con coste contenido: con 182 millones de parámetros totales, la variante Medium permite procesar volúmenes altos en hardware de gama media sin renunciar a un recall cercano al de la variante Large.

## Benchmarks y rendimiento

Calidad de destilación de la variante Medium frente al teacher Large (el teacher es el propio Large, por lo que sus valores de referencia son identidad):

| Metrica | Medium |
|---|---|
| Accuracy | 98,7552 % |
| Recall | 95,6311 % |
| Precision | 95,6311 % |
| Tasa de falsos positivos | 0,7258 % |
| ROC-AUC | 0,997851 |
| Acuerdo de decision con el teacher | 99,4467 % |
| MAE de logits a nivel de imagen (menor es mejor) | 0,658140 |
| Cambio de recall frente al teacher (puntos porcentuales) | -1,941748 |

Recall de deteccion por esquema de proteccion, familia completa:

| Proteccion | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Nightshade | 97,92 % (47/48) | 95,83 % (46/48) | 100,00 % (48/48) | 95,83 % (46/48) |
| Glaze | 95,45 % (63/66) | 93,94 % (62/66) | 95,45 % (63/66) | 95,45 % (63/66) |
| Mist | 100,00 % (22/22) | 100,00 % (22/22) | 100,00 % (22/22) | 100,00 % (22/22) |
| MetaCloak | 100,00 % (4/4) | 100,00 % (4/4) | 100,00 % (4/4) | 100,00 % (4/4) |

Especificidad sobre imagenes limpias (mismo pool de controles, umbral propio de cada variante):

| Pool de evaluacion | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Controles limpios compartidos | 99,1129 % (1229/1240) | 99,2742 % (1231/1240) | 99,0323 % (1228/1240) | 99,1129 % (1229/1240) |

Comparacion publicada frente a LightShed (Tabla 2 del trabajo citado), usando el modelo Medium:

| Proteccion | Recall propio | Recall LightShed | Especificidad propia | Especificidad LightShed |
|---|---:|---:|---:|---:|
| Nightshade (comparador binario) | 95,83 % (46/48) | 96,55 % | 99,27 % | 92,86 % |
| Glaze | 93,94 % (62/66) | 97,26 % | 99,27 % | 97,70 % |
| Mist | 100,00 % (22/22) | 99,84 % | 99,27 % | 100,00 % |
| MetaCloak | 100,00 % (4/4) | 91,77 % | 99,27 % | 84,32 % |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,73 GB en fp32 y unos 0,37 GB en fp16/bf16, calculados a partir de los 182.722.433 parametros; hay que sumar el coste del codificador VAE congelado de FLUX.2, que domina el consumo real de activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. A100 y H100 son validas pero sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anios. Tambien se puede ejecutar en CPU con latencias mayores pero funcionales.
- Opciones de despliegue: no hay indicios de soporte oficial en vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura depende de un codificador VAE y de una cabeza de clasificacion personalizada. El autor publica el codigo de inferencia y entrenamiento en el repositorio de GitHub enlazado abajo.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

Dentro de la propia familia, la eleccion entre variantes es un compromiso entre recall y coste:

| Modelo | Parametros totales | Parametros entrenables | Recall (Nightshade / Glaze) | Especificidad | Licencia |
|---|---:|---:|---|---:|---|
| datapoisoning-detector-v1-large | 296.264.065 | 261.838.209 | 97,92 % / 95,45 % | 99,1129 % | Apache 2.0 |
| datapoisoning-detector-v1-medium | 182.722.433 | 148.296.577 | 95,83 % / 93,94 % | 99,2742 % | Apache 2.0 |
| datapoisoning-detector-v1-small | 82.635.137 | 48.209.281 | 100,00 % / 95,45 % | 99,0323 % | Apache 2.0 |
| datapoisoning-detector-v1-tiny | 43.280.257 | 8.854.401 | 95,83 % / 95,45 % | 99,1129 % | Apache 2.0 |

Comparativa externa:

| Modelo | Tipo | Recall Nightshade | Recall Glaze | Especificidad Nightshade | Especificidad Glaze | Licencia |
|---|---:|---:|---:|---:|---:|---|
| DataPoisoning Detector v1 Medium | Clasificador sobre VAE congelado, 182,7 M parametros | 95,83 % | 93,94 % | 99,27 % | 99,27 % | Apache 2.0 |
| LightShed | Detector publicado, parametros no disponibles | 96,55 % | 97,26 % | 92,86 % | 97,70 % | no disponible |

La comparacion con LightShed debe leerse con cautela: LightShed reporta puntos de operacion especificos por metodo, mientras que DataPoisoning Detector usa un umbral fijo seleccionado en validacion. Ademas, LightShed reporta por separado una condicion NightShade con LPIPS 0,07 que alcanza 99,98 % de recall y 100 % de especificidad.

## Limitaciones y advertencias

- Las puntuaciones no son probabilidades calibradas. El valor de salida no debe interpretarse como confianza directa ni usarse sin recalibracion en sistemas que dependan de umbrales de probabilidad.
- El conjunto de test revisado es un subconjunto filtrado de un experimento anterior, no un holdout ciego nuevo. Los resultados no deben presentarse como mediciones del experimento antiguo ni como validacion independiente limpia.
- El rendimiento en Glaze se reporta por separado porque ese subconjunto expuso previamente un fallo del modelo. Es una zona conocida de debilidad relativa.
- Las muestras de MetaCloak (4 imagenes) y Mist (22 imagenes) son muy pequenias, por lo que sus porcentajes de recall del 100 % tienen intervalos de confianza amplios y no deben extrapolarse sin validacion adicional.
- Rendimiento inferior a LightShed en Nightshade (95,83 % frente a 96,55 %) y, de forma mas marcada, en Glaze (93,94 % frente a 97,26 %).
- El modelo se entreno excluyendo CelebA-HQ de entrenamiento, validacion, test y caches de parches; no hay datos publicos sobre sesgos demograficos en el resto del dataset, cuya composicion no se detalla.
- Riesgo de falso negativo: una imagen protegida con un esquema distinto de Glaze, Nightshade, Mist o MetaCloak, o con una version mas reciente de los mismos, puede clasificarse como limpia sin que el modelo lo advierta.
- Riesgo de falso positivo: aunque la tasa es baja (0,7258 % en el conjunto de evaluacion), en volumenes de millones de imagenes implica descartar un numero no despreciable de muestras limpias si se aplica el umbral de forma automatica sin revision.
- Licencia Apache 2.0, que permite uso comercial, pero el acceso al repositorio esta condicionado a un prompt que obliga a procesar unicamente datos propios, con licencia o debidamente autorizados, y a respetar obligaciones de copyright, privacidad, consentimiento y contractuales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre los resultados publicados.
- No hay informacion sobre cuantizacion, lo que limita las opciones de optimizacion agresiva en entornos muy restringidos.
- Al ser un clasificador de imagen, no ofrece ninguna capacidad de texto, dialogo, razonamiento ni agentes; no debe evaluarse con benchmarks de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ifmain/datapoisoning-detector-v1-medium
- Variante Small en HuggingFace: https://huggingface.co/ifmain/datapoisoning-detector-v1-small
- Codigo y entrenamiento en GitHub: https://github.com/ifmain/datapoisoning-detector-v1
- Informes de evaluacion: https://github.com/ifmain/datapoisoning-detector-v1/tree/main/reports/three_tap_run
- Diagramas de arquitectura (SVG): https://github.com/ifmain/datapoisoning-detector-v1/tree/main/assets/architecture.svg
- Diagramas de inferencia y destilacion (SVG): https://github.com/ifmain/datapoisoning-detector-v1/tree/main/assets/inference-distillation.svg
- Modelo base (VAE congelado): https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ozdentarikcan/DiffVaxDataset
- Referencia externa de comparacion: LightShed (resultados citados en la model card; no se proporciona enlace directo en la informacion disponible)
- Proyecto distinto con nombre similar publicado en PyPI (deteccion de poisoning mediante aprendizaje auto-supervisado): https://pypi.org/project/data-poisoning-detector/
