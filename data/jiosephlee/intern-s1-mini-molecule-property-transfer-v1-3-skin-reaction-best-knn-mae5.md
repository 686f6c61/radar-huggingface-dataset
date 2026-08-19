# jiosephlee/intern-s1-mini-molecule-property-transfer-v1.3-skin-reaction-best-knn-mae5

## Resumen

Este modelo es un checkpoint especializado de `Intern-S1-mini`, la base cientifica multimodal del laboratorio InternLM, adaptado mediante fine-tuning a la tarea de transferencia de propiedades moleculares (assay transfer), concretamente para la prediccion de reacciones cutaneas. El modelo toma pares de moleculas y transfiere propiedades entre ellas utilizando un enfoque de ranking basado en KNN (K-nearest neighbors). Esta desarrollado por el usuario `jiosephlee` y se presenta como el mejor checkpoint de una ejecucion de 25 epocas con grado 16 (8 pares salientes y 8 entrantes por molecula).

Con 8.201.221.120 parametros (8,2B) y una arquitectura basada en Qwen3, el modelo esta pensado para su uso con la libreria Transformers. Su metrica de seleccion fue el KNN MAE@5 de validacion, alcanzando 0,440281, aunque el MAE@5 en el conjunto de test retenido sube hasta 1,023643, lo que sugiere cierta perdida de generalizacion. Es un modelo de nicho, orientado a quimica computacional y descubrimiento de farmacos, sin datos publicos de licencia, idiomas ni contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (base: Intern-S1-mini) |
| Parametros totales | 8.201.221.120 (8,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Intern-S1-mini`, un modelo fundacional multimodal cientifico desarrollado por InternLM que emplea la arquitectura transformer de Qwen3. Este checkpoint concreto es un fine-tuning para transferencia de propiedades moleculares (assay transfer), un paradigma en el que se transfieren atributos entre pares de moleculas. El entrenamiento se realizo sobre el dataset `jiosephlee/molecule-property-transfer-v1.3-skin-reaction-vote-mean-intern`, con un limite de grado 16 (cada molecula participa en hasta 8 pares salientes y 8 entrantes), 25 epocas, tasa de aprendizaje de 2e-5, batch size de 32, acumulacion de gradiente de 1 y empaquetado de secuencias (packed training) activado. La validacion por ranking se ejecuto cada 10 pasos, y la metrica de seleccion fue el KNN MAE@5 sobre el conjunto de validacion.

## Capacidades

- Transferencia de propiedades moleculares (assay transfer) entre pares de moleculas, con enfoque especifico en reacciones cutaneas.
- Ranking de candidatos moleculares mediante KNN, evaluado con MAE@5.
- Generacion de texto heredada de la base Qwen3, aunque el fine-tuning la especializa en el dominio quimico.
- Procesamiento de representaciones moleculares textuales (SMILES u otras codificaciones) para inferencia de propiedades.
- Validacion por ranking cada 10 pasos durante el entrenamiento, lo que permite monitorizar la calidad del ranking en tiempo real.
- Compatibilidad con la API de Transformers para carga y uso directo de pesos y tokenizador.

## Casos de uso

- Cribado virtual de toxicidad dermatologica: el modelo puede predecir si una molecula candidata provocara reacciones cutaneas, permitiendo filtrar compuestos en fases tempranas del descubrimiento de farmacos sin necesidad de ensayos in vitro.
- Transferencia de propiedades entre analogos estructurales: dado un par de moleculas similares donde una tiene una propiedad conocida, el modelo estima si la otra comparte esa propiedad, util en optimizacion de lead compounds.
- Evaluacion de seguridad en cosmética: aplicable a la prediccion de irritacion cutanea de ingredientes cosmeticos antes de su formulacion, reduciendo costes de ensayos regulatorios.
- Priorizacion de moleculas en quimica combinatoria: el ranking KNN permite ordenar librerias de compuestos por probabilidad de presentar una propiedad deseada o adversa, acelerando la seleccion de candidatos.
- Soporte a estudios ADMET: la prediccion de reacciones cutaneas complementa otros modulos ADMET (absorcion, distribucion, metabolismo, excrecion y toxicidad) en pipelines de modelado farmacocinetico.
- Generacion de hipotesis en quimica medicinal: al transferir propiedades entre pares de moleculas, el modelo puede sugerir que modificaciones estructurales conservan o alteran el perfil de seguridad, orientando el diseno de nuevos compuestos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KNN MAE@5 (validacion) | 0,440281 |
| KNN MAE@5 (test retenido) | 1,023643 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. La diferencia entre validacion y test (0,44 frente a 1,02) indica una posible perdida de generalizacion sobre datos no vistos, aspecto a considerar antes de desplegar el modelo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16,4 GB (2 bytes por parametro), lo que cabe en una GPU de 24 GB como RTX 4090, RTX 3090 o A10G.
- Con cuantizacion INT8 (estimacion estandar): unos 8,2 GB, ejecutable en RTX 4070 Ti o similar.
- Con cuantizacion INT4 (estimacion estandar): unos 4,1 GB, ejecutable en RTX 4060 o GPU de 8 GB.
- El repositorio ocupa 16,4 GB, consistente con pesos en FP16.
- Despliegue recomendado con la libreria Transformers de HuggingFace, dado que el modelo card indica que contiene pesos y tokenizador compatibles.
- No se dispone de datos de latencia o throughput especificos; al ser un modelo de 8,2B, la inferencia en una RTX 4090 podria rondar entre 20 y 50 tokens por segundo en generacion, aunque esto depende del hardware y la optimizacion del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Especializacion | Licencia |
|---|---|---|---|---|
| Este checkpoint | 8,2B | Qwen3 | Transferencia de propiedades moleculares (piel) | no disponible |
| Intern-S1-mini (base) | no disponible | Qwen3 | Cientifico multimodal | no disponible |
| Otros modelos de assay transfer | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa exhaustiva con alternativas de la misma categoria. El modelo es un fine-tuning especializado de Intern-S1-mini, por lo que su comparacion natural seria contra el propio modelo base sin fine-tuning, aunque no se han publicado metricas de este ultimo para la tarea de assay transfer.

## Limitaciones y advertencias

- No se especifica licencia, lo que genera incertidumbre legal sobre el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- La metrica de test (KNN MAE@5 de 1,023643) es notablemente peor que la de validacion (0,440281), lo que sugiere sobreajuste o limitaciones de generalizacion a datos no vistos.
- El modelo esta especializado exclusivamente en reacciones cutaneas; su uso fuera de este dominio quimico no esta validado.
- No se documentan idiomas soportados ni longitud de contexto, lo que limita la planificacion de despliegues multilingues o con contextos largos.
- No se ha publicado informacion sobre sesgos o riesgos de alucinacion; al ser un modelo cientifico, las predicciones deben verificarse experimentalmente antes de tomar decisiones regulatorias o clinicas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad; se recomienda una evaluacion independiente antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-molecule-property-transfer-v1.3-skin-reaction-best-knn-mae5
- Modelo base Intern-S1-mini: https://huggingface.co/internlm/Intern-S1-mini
- Repositorio GitHub de Intern-S1: https://github.com/InternLM/Intern-S1
- Articulo cientifico de Intern-S1: https://arxiv.org/html/2508.15763
- Modelo relacionado del mismo autor: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
