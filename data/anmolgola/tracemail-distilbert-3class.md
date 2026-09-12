# ANMOLGOLA/TraceMail-DistilBERT-3Class

## Resumen

TraceMail-DistilBERT-3Class es un clasificador de correo electrónico de tres clases (LEGITIMATE, PHISHING y SPAM) publicado por el usuario ANMOLGOLA en HuggingFace. El modelo parte de distilbert-base-uncased, un transformer encoder-only de 6 capas y 66.955.779 parámetros, y ha sido ajustado (fine-tuning) específicamente para la tarea de clasificación de correos en tres categorías. Forma parte de la plataforma de ciberseguridad TraceMail, donde actúa como una señal NLP más dentro de un pipeline de detección de amenazas que incluye TF-IDF y una capa de análisis forense (cabeceras, SPF, DKIM, DMARC, IP/DNS y correlación).

El interés del modelo es acotado pero claro: se trata de un encoder pequeño, rápido y barato de desplegar, orientado a producción de alto volumen, en lugar de un LLM generativo. Con menos de 67 millones de parámetros cabe en cualquier GPU consumer e incluso en CPU, lo que permite clasificar correos a gran escala con latencias de milisegundos. El autor reporta métricas muy altas en su conjunto de test reservado (99,18 % de accuracy y 99,14 % de macro F1), aunque el propio model card advierte que corresponden al entorno de desarrollo y no garantizan rendimiento en organizaciones, campañas o tipos de ataque no vistos.

La ficha presenta varias incógnitas relevantes para evaluar su adopción: no se declara licencia, no se especifican idiomas, no se documenta la composición del dataset de entrenamiento y no se publican resultados en benchmarks estándar. Además, el repositorio ocupa 3,2 GB, muy por encima de los aproximadamente 268 MB que ocuparían los pesos en fp32, lo que sugiere la presencia de checkpoints intermedios o estados del optimizador y obliga a revisar qué ficheros se descargan antes de desplegarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT-base; 6 capas) |
| Parámetros totales | 66.955.779 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base distilbert-base-uncased tiene un límite de 512 tokens |
| Tipos de cuantización | No disponible (el repositorio no publica versiones cuantizadas; al ser un encoder de 67M, admite fp16 e int8 con herramientas estándar) |
| Idiomas soportados | No declarados; el modelo base es `distilbert-base-uncased` (inglés sin distinción de mayúsculas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según las etiquetas del repositorio) |
| Tarea | Clasificación de secuencias (3 clases: LEGITIMATE, PHISHING, SPAM) |
| Modelo base | distilbert-base-uncased |
| Tamaño del repositorio | 3,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder-only obtenido mediante destilación de conocimiento de BERT-base, con 6 capas, 12 cabezas de atención y una dimensión oculta de 768, lo que reduce el tamaño de BERT-base aproximadamente un 40 % manteniendo alrededor del 97 % de su rendimiento en tareas de comprensión del lenguaje según el paper original. Sobre ese backbone, el autor ha añadido una cabeza de clasificación para tres etiquetas y ha realizado un fine-tuning supervisado, presumiblemente con la cross-entropy estándar; el model card no detalla hiperparámetros, número de épocas, learning rate ni si se aplicó algún tipo de calibración.

No hay información pública sobre el corpus de entrenamiento: no se indica el número de correos, la proporción entre clases, el origen del dataset ni si hubo etapas de RLHF o DPO (poco habituales en un clasificador encoder-only). Tampoco se documenta la estrategia ante el desbalance de clases ni si se aplicaron técnicas de aumento de datos, lo que dificulta interpretar métricas tan altas. La única innovación técnica descrita es de sistema, no de modelo: TraceMail combina la salida de este clasificador con un vectorizador TF-IDF y una capa de análisis forense, de forma que la decisión final de fraude o BEC no recae solo en el modelo NLP.

## Capacidades

- Clasificación de texto en tres clases: LEGITIMATE, PHISHING y SPAM, con salida de logits o probabilidades por clase.
- Análisis de correo electrónico en inglés a nivel de cuerpo y asunto, con un límite heredado del modelo base de 512 tokens por secuencia.
- Extracción de embeddings contextuales por token y por secuencia, reutilizables para tareas auxiliares como clustering de campañas o búsqueda por similitud.
- Integración como señal de entrada en pipelines de detección más amplios (TF-IDF, cabeceras, SPF/DKIM/DMARC, IP/DNS y correlación), tal y como describe el autor.
- Ejecución de alto rendimiento: al ser un encoder de 67M de parámetros, permite inferencia en lote con latencias muy bajas.
- No soporta tool calling ni function calling: no es un modelo generativo ni está entrenado para emitir llamadas a herramientas.
- No soporta agentes ni razonamiento multi-step; produce una única etiqueta por secuencia.
- No tiene capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Pasarela de correo corporativa: el modelo se sitúa después del filtro antispam tradicional para reclasificar mensajes dudosos en PHISHING o SPAM, aprovechando su bajo coste computacional para procesar cientos de miles de correos diarios en una sola GPU.
- Triaje en un SOC: la etiqueta PHISHING se usa para priorizar los correos que llegan a la cola de analistas, reduciendo el tiempo medio de respuesta ante campañas activas.
- Señal NLP dentro de la plataforma TraceMail: se combina con SPF, DKIM, DMARC, reputación de IP y análisis de DNS para alimentar la puntuación de riesgo final, tal y como indica la documentación del autor.
- Análisis forense retroactivo: se reprocesan buzones históricos completos para localizar correos de phishing que pasaron los filtros en el momento de su recepción y reconstruir la cronología de un incidente.
- Enriquecimiento de datasets para otros modelos: las etiquetas generadas sobre grandes volúmenes de correo se emplean como weak supervision para entrenar o evaluar clasificadores mayores y más costosos.
- Detección de BEC en correo interno: el modelo aporta un indicio adicional cuando el análisis de cabeceras no es concluyente, siempre como señal complementaria y nunca como decisión automática.
- Moderación de spam en formularios y bandejas de entrada: reutilizable en cualquier tarea de clasificación de texto corto con tres categorías equivalentes, aunque su entrenamiento esté orientado a correo.

## Benchmarks y rendimiento

El autor reporta resultados sobre un conjunto de test reservado propio, no sobre benchmarks estándar de la comunidad (MMLU, GLUE, etc.). No se han publicado resultados de benchmarks estándar en la información disponible.

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| Test reservado (desarrollo) | Accuracy | 99,18 % |
| Test reservado (desarrollo) | Macro F1 | 99,14 % |
| Test reservado (desarrollo) | F1 LEGITIMATE | 99,42 % |
| Test reservado (desarrollo) | F1 PHISHING | 99,03 % |
| Test reservado (desarrollo) | F1 SPAM | 98,97 % |
| Test reservado (desarrollo) | Recall PHISHING | 98,97 % |

No se dispone de comparación con otros modelos en el mismo conjunto de evaluación, ni de métricas de latencia o throughput publicadas. El propio model card advierte que estas cifras corresponden al test de desarrollo y no deben interpretarse como rendimiento garantizado en producción.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 268 MB en fp32, 134 MB en fp16 y 67 MB en int8 (cálculo a partir de los 66.955.779 parámetros).
- VRAM para inferencia: por debajo de 1 GB incluyendo activaciones con lotes pequeños; con lotes grandes de secuencias de 512 tokens conviene reservar 1-2 GB.
- GPU recomendadas: NVIDIA T4, L4, RTX 3060 o superiores para servicio continuo; RTX 4090 o A10 para lotes muy grandes; A100/H100 están sobredimensionadas para este tamaño de modelo.
- Cabe sin problema en cualquier GPU consumer con 4 GB o más de VRAM, e incluso en CPU: un encoder de 6 capas procesa secuencias de 512 tokens en decenas de milisegundos por núcleo.
- Opciones de despliegue: HuggingFace Transformers con PyTorch, ONNX Runtime u Optimum para acelerar la inferencia, TorchServe o FastAPI para exponer un endpoint HTTP, y HuggingFace Inference Endpoints para un servicio gestionado. vLLM y el ecosistema llama.cpp/Ollama no están orientados a encoders de clasificación; para GGUF haría falta una conversión no publicada en el repositorio.
- Latencia y throughput: no disponibles. Como referencia orientativa, un encoder de 67M suele procesar lotes de cientos de secuencias por segundo en una GPU moderna, pero se trata de una estimación, no de un dato medido para este modelo.
- Antes de desplegar, revisar el contenido del repositorio: 3,2 GB es muy superior al tamaño de los pesos en fp32, lo que apunta a checkpoints de entrenamiento o estados del optimizador que no son necesarios en producción.

## Comparativa con modelos similares

No hay datos públicos que permitan comparar el rendimiento en la tarea de phishing de este modelo con alternativas. La tabla compara únicamente las características estructurales de los backbones más habituales para clasificación de texto, que serían los puntos de partida lógicos para un fine-tuning equivalente.

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Rendimiento en phishing |
|---|---|---|---|---|---|
| TraceMail-DistilBERT-3Class | 66.955.779 | 512 tokens (heredado del base) | DistilBERT fine-tuned, 3 clases | No disponible | 99,18 % accuracy en test propio (no comparable) |
| distilbert-base-uncased | ~66M | 512 tokens | DistilBERT base | Apache-2.0 | No disponible (requiere fine-tuning) |
| bert-base-uncased | ~110M | 512 tokens | BERT base | Apache-2.0 | No disponible (requiere fine-tuning) |
| roberta-base | ~125M | 512 tokens | RoBERTa base | MIT | No disponible (requiere fine-tuning) |

La ventaja estructural de este modelo frente a los backbones genéricos es que ya está ajustado para la tarea y es directamente desplegable; su desventaja es que no se conocen ni la licencia ni la distribución de los datos de entrenamiento, a diferencia de los modelos base, con licencias y documentación públicas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal y deben aclararse con el autor antes de integrar el modelo en un producto.
- Idiomas no especificados: el modelo base es inglés sin distinción de mayúsculas, por lo que el rendimiento en correos en castellano u otros idiomas es desconocido y probablemente inferior.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se puede evaluar el sesgo respecto a sectores, remitentes, idiomas, dominios o estilos de escritura concretos, ni el desbalance entre las tres clases.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos: el autor indica explícitamente que la salida no debe ser la decisión final de fraude o BEC.
- Métricas potencialmente optimistas: un 99,18 % de accuracy en un test reservado propio es propio de conjuntos muy cercanos a la distribución de entrenamiento; sin validación cruzada entre organizaciones ni evaluación en campañas reales no vistas, la generalización es una incógnita.
- Sin información sobre la fecha de corte de los datos: un clasificador de phishing entrenado con campañas antiguas puede degradarse frente a técnicas nuevas de evasión.
- Límite de 512 tokens: los correos largos se truncan, lo que puede eliminar precisamente las señales de fraude situadas al final del mensaje.
- Ausencia de versionado de datos y de model card técnica detallada (hiperparámetros, tokenizador, umbrales de decisión), lo que dificulta la reproducibilidad y la auditoría.
- 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros ni de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANMOLGOLA/TraceMail-DistilBERT-3Class
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Búsqueda web realizada: los resultados obtenidos no guardaban relación con el modelo (contenido genérico sobre buscadores, redes sociales y resolución de problemas de DNS), por lo que no se han incluido. No se han encontrado papers, blogs, repositorios ni demos adicionales del modelo.
