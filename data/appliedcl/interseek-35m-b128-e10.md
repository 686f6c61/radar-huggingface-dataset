# appliedCL/interseek-35m-b128-e10

## Resumen

InterSeek 35M B128-E10 es un modelo de prediccion de interacciones proteina-proteina (PPI) desarrollado por appliedCL. Se construye mediante fine-tuning completo del backbone ESM-2 de 35 millones de parametros de Meta (facebook/esm2_t12_35M_UR50D) junto con una cabeza de interaccion CLS, y resuelve el problema de determinar, a partir unicamente de las secuencias de aminoacidos de dos proteinas, si estas interactuan fisicamente. Es relevante porque ofrece una alternativa ligera (33,5 millones de parametros, 0,3 GB) para el cribado y la clasificacion de pares proteicos en investigacion biologica, sin necesidad de estructuras tridimensionales.

Esta variante concreta entrena con un lote efectivo de 128 pares durante 10 epocas (12.750 actualizaciones), completadas el 17 de noviembre de 2026, y publica el mejor checkpoint de validacion (epoca 5, actualizacion 6.375) en lugar del checkpoint final. Utiliza una formulacion simetrica: ambas secuencias se tokenizan conjuntamente como `[CLS] A [EOS] B [EOS]` con hasta 1.024 tokens y dos vistas de ventana, y la puntuacion final promedia los logits de ambos ordenes de entrada antes de aplicar sigmoid.

El modelo se distribuye con licencia MIT, incluye un paquete de inferencia propio (rueda `interseek-0.3.0`), y no es un checkpoint de clasificacion estandar de Transformers: requiere su implementacion incluida para generar puntuaciones de interaccion. Los resultados de validacion son modestos (AUROC 0,6543) y los tests held-out aun no se han evaluado para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (12 capas, backbone ESM-2 35M) con cabeza de interaccion CLS y pooling log-mean-exp |
| Parametros totales | 33.518.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.024 tokens por par (tokenizacion conjunta `[CLS] A [EOS] B [EOS]`, dos vistas de ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias proteicas, no de lenguaje natural) |
| Licencia | MIT (tanto InterSeek como los pesos upstream de ESM-2) |
| Formato de pesos | safetensors (`model.safetensors`, `esm2/` y `interaction_head.safetensors`), PyTorch |

## Arquitectura y entrenamiento

El modelo parte del backbone ESM-2 de 35M (facebook/esm2_t12_35M_UR50D) y lo afina en todas sus capas, anadiendo una cabeza de interaccion CLS. Las dos secuencias proteicas se tokenizan de forma conjunta como `[CLS] A [EOS] B [EOS]`, con un maximo de 1.024 tokens y dos vistas de ventana; la cabeza CLS produce logits por vista que se agregan mediante log-mean-exp. En inferencia se promedian los logits de los dos ordenes de entrada antes de aplicar sigmoid, lo que garantiza una puntuacion de interaccion simetrica.

El entrenamiento usa entropia cruzada binaria mas prediccion de aminoacidos enmascarados ponderada por 0,1 (probabilidad de mascara 0,15). Configuracion: microbatch 4, acumulacion 32 (lote efectivo de 128 pares), semilla 17, AdamW con learning rates de 2e-5 para el encoder y 1e-4 para la cabeza, weight decay 0,01 y 100 actualizaciones de warm-up. Se ejecuto en una NVIDIA H100 PCIe en BF16 con PyTorch 2.8.0+cu128 y Transformers 5.12.1. La seleccion de checkpoint se hizo por AUROC de validacion y la del umbral por MCC de validacion.

Los datos de entrenamiento son 163.192 pares proteicos humanos derivados de HIPPIE, procedentes del split Intra1 gold-standard de Bernett (81.596 positivos y 81.596 negativos), con secuencias de la version 4 corregida de Figshare. La validacion emplea 59.260 pares Intra0, tambien balanceados. Los conjuntos Intra2 humano (52.048 pares) y D-SCRIPT de levadura (55.000 pares) quedan reservados como held-out y no se han evaluado para esta variante.

## Capacidades

- Prediccion binaria de interaccion proteina-proteina a partir de secuencias de aminoacidos, con puntuacion entre 0 y 1.
- Puntuacion simetrica respecto al orden de las dos proteinas de entrada.
- Procesamiento de pares con secuencias de hasta 1.024 tokens mediante tokenizacion conjunta y dos vistas de ventana.
- Entrada/salida por CSV (`sequence_a`, `sequence_b`, `pair_id` opcional) con preservacion del orden de filas.
- Ejecucion en CPU, GPU NVIDIA (`cuda:0`) y Apple Silicon (`mps`).
- Backbone ESM-2 afinado exportado por separado, utilizable como `EsmForMaskedLM` para tareas de modelado de lenguaje de proteinas.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues de lenguaje natural.

## Casos de uso

- Cribado de interactomas a gran escala: dado un conjunto de pares candidatos, el modelo puntua cada par y permite priorizar los de mayor probabilidad de interaccion antes de validacion experimental, gracias a su bajo coste computacional (33,5M de parametros).
- Priorizacion de candidatos en estudios de biologia de sistemas: a partir de listas de proteinas coexpresadas o colocalizadas, ordenar pares por puntuacion para seleccionar los que se llevaran a ensayos de co-inmunoprecipitacion o yeast two-hybrid.
- Filtrado previo en pipelines de descubrimiento de farmacos: descartar rapidamente pares con baja probabilidad de interaccion para reducir el espacio de busqueda antes de docking molecular o simulaciones mas costosas.
- Analisis de redes de interaccion en datos de proteomica: complementar matrices de afinidad o espectrometria de masas con predicciones de secuencia para enriquecer la red de PPI inferida.
- Generacion de hipotesis en investigacion basica: proponer interacciones no descritas en bases de datos para proteinas poco caracterizadas, usando solo su secuencia primaria.
- Extraccion de representaciones proteicas: reutilizar el backbone ESM-2 afinado (`esm2/`) como extractor de embeddings para tareas downstream como clasificacion funcional o agrupamiento de proteinas.
- Evaluacion comparativa de metodologias PPI: servir como linea base ligera en estudios que comparen enfoques basados en secuencia frente a enfoques basados en estructura.

## Benchmarks y rendimiento

Resultados de validacion publicados por el autor (desarrollo, usados para seleccionar el checkpoint):

| Checkpoint | Pares | AUROC | Average precision | MCC |
|---|---:|---:|---:|---:|
| Publicado: epoca 5, actualizacion 6.375 | 59.260 | 0,6543 | 0,6593 | 0,2262 |
| Final: epoca 10, actualizacion 12.750 | 59.260 | 0,6476 | 0,6542 | 0,2172 |

Comparacion con la variante original B16-E3 (misma semilla, distinto lote y duracion): AUROC de validacion 0,6532296301704599 frente a 0,654300940078951. El autor advierte que esta comparacion de una sola semilla no establece una mejora fiable de generalizacion. Los tests held-out (Intra2 humano y D-SCRIPT de levadura) no se han evaluado para esta variante, y los resultados publicados del modelo original no aplican a estos pesos.

## Requisitos de hardware

- VRAM estimada: muy baja; con 33,5M de parametros en BF16/FP16 el modelo ocupa aproximadamente 67 MB, y en FP32 unos 134 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (el autor entreno en H100 PCIe, pero la inferencia no lo requiere); tambien funciona en Apple Silicon via MPS y en CPU.
- Cabe en GPU consumer: si, en cualquier modelo (GTX/RTX, incluidas gamas bajas) por su reducido tamano.
- Opciones de despliegue: paquete de inferencia propio incluido en el repositorio (`predict.py` + rueda `interseek-0.3.0`), con soporte `--device cpu`, `--device cuda:0` y `--device mps`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC validacion | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| InterSeek 35M B128-E10 | 33,5M | 1.024 tokens por par | 0,6543 | MIT | Hugging Face |
| InterSeek 35M (B16-E3 original) | no disponible | 1.024 tokens por par | 0,6532 | MIT | Hugging Face |
| D-SCRIPT (referencia de benchmark) | no disponible | no disponible | no disponible | no disponible | no disponible |
| ESM-2 35M (backbone base) | 35M | no disponible | no disponible (no predice PPI por si solo) | MIT | Hugging Face |

No se dispone de datos de benchmarks de otros modelos PPI comparables en la informacion proporcionada; la comparacion con D-SCRIPT solo consta como conjunto de test held-out no evaluado.

## Limitaciones y advertencias

- Las puntuaciones no estan calibradas como probabilidades de union fisica; un valor alto no establece interaccion real ni causalidad.
- Los negativos del dataset son muestreados, lo que puede introducir sesgos en la distribucion de entrenamiento y validacion.
- Posible exposicion de las proteinas de test en el preentrenamiento de ESM-2, lo que podria inflar el rendimiento aparente.
- Ventana de secuencia acotada (1.024 tokens), lo que limita proteinas largas o complejos con regiones extensas.
- No se han ejecutado nuevas auditorias de homologia all-against-all ni de exposicion en preentrenamiento para esta variante; las auditorias locales solo verifican identificadores y secuencias exactas.
- Los tests held-out (Intra2 humano y D-SCRIPT de levadura) no se han evaluado; los resultados del modelo original no aplican a estos pesos.
- La mejora frente a la variante B16-E3 es marginal y de una sola semilla; se necesitan semillas adicionales, lineas base emparejadas y validacion experimental.
- El archivo `model.safetensors` no es un checkpoint estandar de Transformers y requiere la implementacion incluida; el backbone por separado no produce puntuaciones de interaccion.
- Licencia MIT permite uso comercial, pero el autor no garantiza idoneidad para decisiones clinicas o experimentales sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appliedCL/interseek-35m-b128-e10
- Variante original B16-E3: https://huggingface.co/appliedCL/interseek-35m
- Repositorio y reporte del experimento: https://github.com/appliedCL/interseek
- Modelo base ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Split Intra1 gold-standard de Bernett: https://doi.org/10.1093/bib/bbae076
- Secuencias corregidas (Figshare v4): https://doi.org/10.6084/m9.figshare.21591618.v4
