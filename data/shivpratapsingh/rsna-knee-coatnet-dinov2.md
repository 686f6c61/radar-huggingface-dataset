# shivpratapsingh/rsna-knee-coatnet-dinov2

## Resumen

`shivpratapsingh/rsna-knee-coatnet-dinov2` es un repositorio de checkpoints entrenados por el equipo `_the_name_is_NERD` para la competicion de Kaggle RSNA Knee Abnormality Detection. No es un modelo de lenguaje: es un conjunto de clasificadores de imagen medica que reciben un estudio completo de resonancia magnetica de rodilla (hasta 4 series, 16 cortes por serie, campo de vision de 140 mm rasterizado a 384 px) y predicen 12 hallazgos: ligamento cruzado anterior, ligamento colateral medial, menisco medial, menisco lateral, artrosis femoropatelar medial, lateral y patelofemoral, derrame articular, sinovitis, quiste de Baker, contusion osea y fractura.

El repositorio agrupa dos familias de backbone: CoAtNet-2 (`coatnet_rmlp_2_rw_384`, 5 folds) y DINOv2 ViT-L/14 (`vit_large_patch14_dinov2.lvd142m`, 4 folds), ambas implementadas sobre timm y empaquetadas como state dicts de PyTorch en fp32. El enfoque es de multiple instance learning a nivel de estudio: el modelo agrega informacion de cortes y series para emitir una prediccion unica por hallazgo, lo que lo hace interesante para quien investigue clasificacion debilmente supervisada en volumenes 3D.

Su relevancia practica es doble: por un lado documenta con detalle el pipeline de preprocesado (ventaneo por serie, recorte de 140 mm, espejado de rodillas derechas a izquierdas) y las etiquetas derivadas de informes radiologicos (regex con AUC 0,738 sobre el subconjunto gold-58, Qwen2.5-7B con 0,816 y su mezcla con 0,846); por otro publica predicciones out-of-fold y chequeos SHA256, lo que facilita la reproducibilidad. El aviso del autor es explicito: no es un producto sanitario y no debe usarse en clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos familias: CoAtNet-2 híbrida convolucional + transformer (variante RMLP, `coatnet_rmlp_2_rw_384`) y ViT-L/14 auto-supervisado DINOv2 (`vit_large_patch14_dinov2.lvd142m`); agregacion tipo multiple instance learning sobre cortes y series |
| Parametros totales | No disponible (la model card no declara recuento de parametros; el checkpoint CoAtNet-2 ocupa 293 MB en fp32 y el de DINOv2-L 1,2 GB en fp32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no de lenguaje); entrada fija de hasta 4 series x 16 cortes a 384 px con FOV de 140 mm |
| Tipos de cuantizacion | fp32 nativo; fp16 (autocast y pesos redondeados a fp16) con AUC identica a fp32 hasta el cuarto decimal (correlacion de rangos >= 0,999997); no se publican GGUF, int8 ni int4 |
| Idiomas soportados | No aplica (modelo de imagen); las 12 etiquetas de hallazgos estan en ingles |
| Licencia | `other`; el uso queda sujeto a las reglas y licencia de datos de la competicion RSNA Knee de Kaggle |
| Formato de pesos | `.pt` de PyTorch (state dict `model` + metadatos de entrenamiento: `backbone`, `fold`, `size`, `crop_mm`, `encoder_chunk`, `prep`, `weak_auc`); logs `foldK_history.json`; predicciones OOF en CSV; `SHA256SUMS` |

## Arquitectura y entrenamiento

Cada checkpoint es un clasificador multi-etiqueta que procesa un estudio de rodilla como un conjunto de instancias (cortes dentro de series) y agrega las representaciones para producir 12 logits, uno por hallazgo. El backbone CoAtNet-2 combina bloques convolucionales con atencion de tipo transformer e incorporaRelative Multi-Layer Perceptron (RMLP); el checkpoint de partida es `coatnet_rmlp_2_rw_384.sw_in12k_ft_in1k`, preentrenado en ImageNet-12k y afinado en ImageNet-1k. La alternativa DINOv2-L es un ViT-L/14 preentrenado de forma auto-supervisada sobre LVD-142M, sin etiquetas, lo que aporta representaciones genericas de imagen que el equipo ajusta al dominio de RM de rodilla.

El preprocesado es parte del diseno del modelo: ventaneo por serie, recorte al campo de vision de 140 mm, rasterizado a 384 px y espejado de rodillas derechas a izquierdas para normalizar la lateralidad (sin este paso, segun el autor, los objetivos medial y lateral carecen de sentido). Las etiquetas no son anotaciones radiologicas manuales, sino etiquetas debiles derivadas de los informes: extraccion por regex (AUC 0,738 en gold-58), etiquetado con Qwen2.5-7B (0,816) y una mezcla de ambas fuentes (0,846). El entrenamiento se organiza en 5 folds (CoAtNet) y 4 folds (DINOv2, folds 0, 1, 2 y 4), con registros por epoca en `foldK_history.json`. No se documentan en la informacion disponible el volumen de tokens, la composicion exacta del dataset ni el uso de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion multi-etiqueta a nivel de estudio de RM de rodilla sobre 12 hallazgos (ACL, MCL, menisco medial, menisco lateral, artrosis medial, lateral y patelofemoral, derrame, sinovitis, quiste de Baker, contusion, fractura).
- Agregacion multiple instance learning: combina hasta 4 series y 16 cortes por serie en una unica prediccion por estudio.
- Normalizacion de lateralidad: espeja rodillas derechas a izquierdas, lo que permite entrenar y predecir con un espacio anatomico comun.
- Ensemble intra-repositorio: dispone de 5 checkpoints CoAtNet-2 y 4 DINOv2-L, con predicciones out-of-fold para medir la mezcla; un blend 50/50 por rangos alcanza 0,8703 frente a 0,8629 de CoAtNet solo.
- Inferencia agnostica a la precision: fp16 autocast, pesos redondeados a fp16 y fp32 producen la misma AUC, con fp32 aproximadamente 3 veces mas lento.
- Reproducibilidad: paquete `rsna_knee`, script `scripts/infer.py`, funcion `load_models`, splits cloud en `oof/fold_cloud.csv` y sumas de verificacion SHA256.
- No soporta tool calling, function calling, agentes, modo thinking, vision general, audio ni generacion de texto: no es un modelo linguistico.

## Casos de uso

- Reproduccion de la competicion RSNA Knee: cargar los 9 checkpoints, aplicar el preprocesado de `code/rsna_knee/preprocess.py` y regenerar las predicciones OOF para validar el pipeline publicado antes de introducir cambios.
- Investigacion en multiple instance learning: usar los checkpoints como linea base para estudiar funciones de agregacion (attention pooling, max pooling, mean pooling) sobre estudios completos de RM con hasta 64 cortes de entrada.
- Etiquetado debil a partir de informes: reutilizar la comparativa regex (0,738), Qwen2.5-7B (0,816) y mezcla (0,846) como referencia para disenar estrategias de supervision debil en radiologia.
- Benchmarking de backbones en imagen medica: comparar CoAtNet-2 (293 MB por fold) y DINOv2-L (1,2 GB por fold) en coste de inferencia, AUC y sensibilidad al preentrenamiento (ImageNet frente a auto-supervisado).
- Prototipos de triaje no clinicos: priorizar estudios en un entorno de investigacion o docencia segun la probabilidad predicha de hallazgos como fractura o derrame, siempre con supervision humana y sin uso diagnostico.
- Ensembling y destilacion: emplear los 9 checkpoints como profesores para destilar un modelo mas pequeno o para medir el impacto marginal de cada familia en una mezcla (el autor documenta que anadir el blend DINOv2 al ensemble publico bajo la puntuacion de 0,958 a 0,956-0,957).
- Docencia y auditoria de pipelines: el repositorio incluye chequeos SHA256, logs por epoca y predicciones OOF, lo que permite reproducir experimentos y auditar decisiones de preprocesado en un curso o revision interna.

## Benchmarks y rendimiento

AUC macro out-of-fold sobre etiquetas debiles derivadas de informes (cada fold evaluado solo con estudios que nunca vio en entrenamiento):

| Modelo | fold 0 | fold 1 | fold 2 | fold 3 | fold 4 |
|---|---|---|---|---|---|
| CoAtNet-2 | 0,8629 | 0,8680 | 0,8670 | 0,8583 | 0,8588 |
| DINOv2-L | 0,8703 | 0,8588 | 0,8557 | no entrenado | 0,8617 |

Mezclas y leaderboard:

| Metrica | Valor |
|---|---|
| Blend 50/50 por rangos CoAtNet + DINOv2 (1.763 estudios de folds 2 y 4) | 0,8703 |
| CoAtNet-2 solo en el mismo subconjunto | 0,8629 |
| CoAtNet fold 0 solo, leaderboard publico | 0,916 |
| Ensemble publico de referencia (0,958) con blend CoAtNet a peso 0,03-0,15 | 0,958 (sin cambio) |
| Ensemble publico de referencia con blend DINOv2 | 0,956-0,957 |
| Etiquetas regex sobre gold-58 (AUC) | 0,738 |
| Etiquetas Qwen2.5-7B sobre gold-58 (AUC) | 0,816 |
| Mezcla de etiquetas sobre gold-58 (AUC) | 0,846 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la informacion disponible, ya que el modelo no es linguistico. Tampoco se aportan metricas por hallazgo individual ni intervalos de confianza.

## Requisitos de hardware

- Peso de los pesos: 293 MB por checkpoint CoAtNet-2 y 1,2 GB por checkpoint DINOv2-L, ambos en fp32; el repositorio completo ocupa 6,3 GB.
- VRAM estimada para inferencia: no disponible como cifra medida por el autor. Como referencia derivada del tamano de los pesos, CoAtNet-2 en fp16 requiere del orden de 0,15 GB solo para pesos y DINOv2-L en fp16 del orden de 0,6 GB, a lo que se suman las activaciones de los cortes procesados por chunk (`encoder_chunk`); con 16 cortes a 384 px por chunk el consumo real sera notablemente superior y no esta cuantificado en la informacion disponible.
- GPU recomendadas: no hay recomendacion oficial. Por tamano de pesos, cualquier GPU consumer con 8 GB o mas deberia alojar un checkpoint individual en fp16; para cargar varios checkpoints en paralelo (ensemble de 9) se recomienda agregacion por GPU o ejecucion secuencial.
- Cabe en GPU consumer: si, previsiblemente en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 para un checkpoint por vez; no confirmado por el autor.
- Opciones de despliegue: el repositorio solo documenta PyTorch con `scripts.infer.py` y `rsna_knee.model.KneeStudyModel`; no se publican recetas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Tampoco se ofrece ONNX ni TorchScript.
- Latencia y throughput: no disponibles. El unico dato de coste es relativo: fp32 es aproximadamente 3 veces mas lento que fp16, sin perdida de AUC hasta el cuarto decimal.

## Comparativa con modelos similares

No se dispone de datos de modelos externos comparables en la informacion proporcionada. La unica comparacion posible es interna, entre las dos familias publicadas:

| Criterio | CoAtNet-2 | DINOv2-L |
|---|---|---|
| Preentrenamiento | ImageNet-12k y afinado en ImageNet-1k (supervisado) | Auto-supervisado en LVD-142M |
| Folds publicados | 0, 1, 2, 3, 4 | 0, 1, 2, 4 |
| Tamano por checkpoint (fp32) | 293 MB | 1,2 GB |
| Mejor AUC OOF | 0,8680 (fold 1) | 0,8703 (fold 0) |
| AUC en folds 2 y 4 | 0,8629 (blend) | incluido en el blend 0,8703 |
| Impacto en el ensemble publico 0,958 | neutro (0,958) | negativo (0,956-0,957) |
| Licencia | `other`, sujeta a reglas de la competicion | `other`, sujeta a reglas de la competicion |

## Limitaciones y advertencias

- No es un producto sanitario: la model card indica explicitamente "not for clinical use". No debe emplearse para diagnostico, triaje clinico ni decision terapeutica.
- Etiquetas debiles: el entrenamiento usa etiquetas derivadas de informes con AUC de 0,738 a 0,846 sobre gold-58, por debajo de una anotacion radiologica experta; el techo de rendimiento esta condicionado por esa supervision.
- Dependencia critica del preprocesado: sin el ventaneo por serie, el recorte de 140 mm y el espejado de lateralidad, las predicciones medial y lateral pierden sentido; no hay validacion con preprocesados alternativos.
- Sin validacion externa: no se documentan resultados en cohortes de otro centro, otro fabricante o distinta distribucion de poblacion.
- Reproducibilidad de folds: los checkpoints entrenados en la nube (CoAtNet folds 2-4 y todos los DINOv2) usaron un split distinto al generado por `make_folds` en Windows, porque el orden de desempate de `argsort` difiere en CPUs con AVX-512; hay que usar `oof/fold_cloud.csv` para reproducir sus conjuntos de validacion.
- Rendimiento desigual por familia: el blend DINOv2 no mejoro el ensemble publico (0,956-0,957 frente a 0,958), lo que sugiere que su aporte marginal en ese contexto es nulo o negativo.
- Datos no incluidos: no se publican las columnas gold ni el texto de los informes, que siguen siendo datos de la competicion; sin ellos no se puede reentrenar desde cero.
- Licencia restrictiva y no estandar: `other` con sujecion a las reglas de Kaggle; hay que revisar esas reglas antes de cualquier uso comercial o redistribucion.
- Sesgos: no documentados. Al proceder de un unico dataset de competicion, es esperable un sesgo de seleccion de centro, equipo y protocolo, pero no se cuantifica en la informacion disponible.
- Riesgo de falsos negativos y positivos: no se publican matrices de confusion, sensibilidad ni especificidad por hallazgo, solo AUC macro, que puede ocultar un rendimiento pobre en clases poco frecuentes como fractura o contusion.
- Madurez: 0 descargas y 1 like en el momento de la consulta, sin pipeline declarado en HuggingFace; el codigo de inferencia vive en un repositorio externo y depende de un paquete propio (`rsna_knee`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shivpratapsingh/rsna-knee-coatnet-dinov2
- Codigo, memoria tecnica y resultados: https://github.com/shivpratapsinghpanwar/rsna-knee-abnormality-detection
- Competicion RSNA Knee Abnormality Detection (Kaggle): https://www.kaggle.com/competitions/rsna-knee-abnormality-detection
- Reglas y licencia de datos de la competicion: https://www.kaggle.com/competitions/rsna-knee-abnormality-detection/rules
- Backbone CoAtNet-2 en timm: `coatnet_rmlp_2_rw_384.sw_in12k_ft_in1k`
- Backbone DINOv2-L en timm: `vit_large_patch14_dinov2.lvd142m`
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
