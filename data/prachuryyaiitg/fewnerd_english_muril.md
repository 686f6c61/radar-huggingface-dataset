# prachuryyaIITG/FewNERD_English_MuRIL

## Resumen

FewNERD_English_MuRIL es un modelo de reconocimiento de entidades nombradas (NER) de grano fino, resultado del ajuste fino (fine-tuning) del modelo `google/muril-large-cased` sobre el dataset inglés Few-NERD. El modelo está desarrollado por Prachuryya Kaushik (prachuryyaIITG) como parte del ecosistema AWED-PIPER, que integra agentes y aplicaciones web para la detección de entidades y protección de datos personales. Su propósito principal es clasificar tokens en 66 tipos de entidades finas organizadas en 8 categorías gruesas (persona, ubicación, organización, edificio, arte, producto, evento y miscelánea), lo que lo hace adecuado para tareas de extracción de información detallada.

La arquitectura subyacente es la de un transformer encoder estilo BERT, con aproximadamente 505 millones de parámetros y una ventana de contexto de 512 tokens. El ajuste fino se realizó sobre el dataset Few-NERD en inglés, que contiene más de 188.000 oraciones y 491.000 entidades anotadas. El modelo alcanza una F1 de 68,04 en el conjunto de evaluación, con una precisión del 66,21 % y una recuperación del 69,98 %. Su licencia MIT permite uso comercial sin restricciones, y está disponible en formato safetensors para su integración con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, 24 capas, 24 cabezas, hidden size 1024) |
| Parametros totales | 504.993.925 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No se proporcionan cuantizaciones oficiales; el formato safetensors permite cuantizacion posterior con herramientas como ONNX o bitsandbytes |
| Idiomas soportados | Ingles (entrenado solo en ingles; el modelo base es multilingue, pero el ajuste fino es exclusivamente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-large-cased`, un BERT grande multilingüe optimizado para lenguas indias, con 24 capas, 24 cabezas de atención, dimensión oculta de 1024 y aproximadamente 505 millones de parámetros. La arquitectura es un transformer encoder estándar con atención de producto punto, sin capas de decodificación. Para la tarea de NER, se añade una capa de clasificación por token sobre la salida del encoder, que asigna a cada token una etiqueta de las 66 clases finas del dataset Few-NERD.

El ajuste fino se realizó sobre el dataset Few-NERD en inglés, que contiene 188.200 oraciones, 491.711 entidades y 4.601.223 tokens, con un esquema de anotación jerárquico de 8 tipos gruesos y 66 tipos finos. Se emplearon 6 épocas, optimizador AdamW con tasa de aprendizaje de 5e-5, weight decay de 0,01 y tamaño de lote de 64. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado estándar para clasificación de tokens. El modelo forma parte del ecosistema AWED-PIPER, que incluye agentes agénticos (AWED-FiNER) y aplicaciones web para inferencia interactiva.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino: clasifica cada token en 66 tipos finos de entidades, incluyendo subcategorías como actor, empresa, río, hospital, película, arma, ataque, etc.
- Soporte de etiquetado jerárquico: las 66 clases finas se agrupan en 8 categorías gruesas (ubicación, persona, organización, edificio, arte, producto, evento y miscelánea), lo que permite tanto anotación fina como agregación a niveles más generales.
- Procesamiento de texto en inglés: adecuado para documentos, noticias, redes sociales y cualquier texto en inglés.
- Integración con herramientas agénticas: el modelo se puede utilizar a través del agente AWED-FiNER, que permite invocarlo mediante una interfaz Python simple (ejemplo disponible en la model card).
- Clasificación de tokens: salida por token con probabilidades, compatible con pipelines de transformers para token-classification.

## Casos de uso

- Extracción de entidades en noticias financieras: identificar empresas, personas, productos y eventos en artículos económicos, útil para sistemas de análisis de mercado y alertas automáticas.
- Análisis de currículos (CV) para reclutamiento: extraer nombres, instituciones educativas, empresas y cargos de un CV, facilitando la automatización de procesos de selección.
- Monitorización de redes sociales: detectar menciones de marcas, personas y eventos en tweets o comentarios, permitiendo análisis de sentimiento y reputación.
- Anonimización de documentos legales: localizar nombres de personas, organizaciones y ubicaciones en contratos o expedientes para proteger datos personales (PII), complementando el ecosistema AWED-PIPER.
- Búsqueda semántica en bibliotecas digitales: etiquetar automáticamente autores, títulos, editoriales y temas en metadatos de libros o artículos académicos.
- Sistemas de recomendación de contenido: extraer entidades de artículos o vídeos para generar etiquetas temáticas y mejorar la sugerencia de contenido relacionado.
- Análisis de informes médicos: identificar enfermedades, medicamentos y profesionales sanitarios en textos clínicos (aunque el modelo no está especializado en dominio médico, la categoría "miscelánea" incluye enfermedades).

## Benchmarks y rendimiento

El modelo reporta las siguientes métricas en el conjunto de evaluación del dataset Few-NERD (no se especifica si es el split SUP, INTRA o INTER):

| Metrica | Valor |
|---|---|
| Precision | 66,21 |
| Recall | 69,98 |
| F1 | 68,04 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Para contexto, el dataset Few-NERD es un benchmark estándar de NER de grano fino, y una F1 de 68 en el ajuste supervisado es un resultado razonable para un modelo de 500M parámetros, aunque modelos más recientes basados en transformers más grandes pueden superar el 70-75 % en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 504M parámetros. En FP32, los pesos ocupan ~2,0 GB; en FP16, ~1,0 GB. Con memoria de activaciones y overhead, se recomienda al menos 4 GB de VRAM para inferencia con secuencias de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA T4, RTX 3060, RTX 4070, A10, L4. Para despliegue en producción con alta concurrencia, se recomienda A100 o H100, aunque no son estrictamente necesarias.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer como RTX 3060 (12 GB), RTX 3080 (10 GB) o superiores.
- Opciones de despliegue: se puede usar con la librería transformers (PyTorch), con pipelines de token-classification, o exportar a ONNX para inferencia optimizada. También es compatible con servidores de inferencia como Hugging Face Inference Endpoints o TGI (Text Generation Inference) si se adapta el formato.
- Latencia y throughput estimados: no se proporcionan datos oficiales. En una GPU T4, se puede esperar una latencia de ~10-20 ms por secuencia de 128 tokens y un throughput de ~50-100 secuencias por segundo con batch de 32, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Como referencia, el modelo base `google/muril-large-cased` es un BERT multilingüe con rendimiento conocido en lenguas indias, pero este ajuste fino se limita al inglés. Otros modelos de NER de grano fino sobre Few-NERD incluyen:

| Modelo | Parametros | Contexto | F1 (Few-NERD) | Licencia |
|---|---|---|---|---|
| FewNERD_English_MuRIL (este) | 505M | 512 | 68,04 | MIT |
| google/muril-large-cased (base) | 505M | 512 | No aplica (modelo base) | Apache 2.0 |
| Otros modelos fine-tuned sobre Few-NERD (p.ej. basados en RoBERTa-large) | ~355M | 512 | No disponible | Varía |

La comparación directa no es posible sin datos publicados de otros modelos en las mismas condiciones. Se recomienda evaluar este modelo frente a alternativas como `dslim/bert-base-NER` (para NER clásico) o modelos de grano fino específicos si se requiere mayor precisión.

## Limitaciones y advertencias

- Entrenado solo en inglés: aunque el modelo base es multilingüe, el ajuste fino se realizó exclusivamente sobre texto en inglés, por lo que su rendimiento en otros idiomas será deficiente o nulo.
- Contexto limitado a 512 tokens: no puede procesar documentos largos de una sola vez; para textos extensos se requiere segmentación, lo que puede perder contexto entre fragmentos.
- Sesgos del dataset Few-NERD: el dataset proviene de artículos de Wikipedia y noticias, por lo que el modelo puede tener sesgos hacia entidades occidentales y dominios enciclopédicos, y puede fallar en jerga técnica o coloquial.
- Riesgo de alucinación en clasificación: como todo modelo de NER, puede etiquetar incorrectamente tokens ambiguos o inventar entidades que no existen en el texto, especialmente en dominios no representados en el entrenamiento.
- Sin soporte para tool calling ni generación de texto: es un modelo de clasificación de tokens, no un modelo generativo; no puede realizar razonamiento multi-step ni responder preguntas de forma libre.
- Rendimiento moderado: la F1 de 68 es aceptable pero no sobresaliente; para aplicaciones críticas se recomienda evaluar en el dominio específico y considerar modelos más grandes o especializados.
- Dependencia del ecosistema AWED-PIPER: aunque el modelo es independiente, su integración con agentes y aplicaciones web requiere componentes adicionales que pueden tener sus propias limitaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prachuryyaIITG/FewNERD_English_MuRIL
- Dataset Few-NERD: https://huggingface.co/datasets/DFKI-SLT/few-nerd
- Paper de Few-NERD (ACL 2021): https://aclanthology.org/2021.acl-long.248
- Paper de AWED-PIPER (arXiv 2601.10161): https://arxiv.org/abs/2601.10161
- Repositorio AWED-PIPER: https://github.com/PrachuryyaKaushik/AWED-PIPER
- Agente AWED-FiNER: https://github.com/PrachuryyaKaushik/AWED-FiNER
- Aplicacion web AWED-FiNER: https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER
- Aplicacion web para proteccion de PII: https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector
- Paper de SampurNER (AAAI 2026): https://ojs.aaai.org/index.php/AAAI/article/view/40405
