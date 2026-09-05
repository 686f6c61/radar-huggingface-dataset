# AETHORIA-AI/TR-HASH-MoE-100M-70B-Agentic-SFT-250K

## Resumen

TR-HASH-MoE-100M-70B-Agentic-SFT-250K es un modelo de lenguaje basado en Mixture-of-Experts (MoE) con enrutamiento determinista, desarrollado por AETHORIA-AI. El nombre indica una arquitectura con 100 millones de parámetros activos y 70 mil millones de parámetros totales, lo que lo sitúa en la categoría de modelos MoE de gran escala con activación dispersa. Está afinado mediante Supervised Fine-Tuning (SFT) para tareas agénticas, utilizando una plantilla de tokens especiales nativa para el entrenamiento supervisado del asistente.

El modelo parte de un modelo base denominado TR-HASH-MoE-100M-70B-Agentic-Refinement, que a su vez se sometió a una fase de refinamiento sobre un núcleo de 70.000 millones de tokens únicos, inicializado desde los pesos de preentrenamiento completados con un optimizador nuevo. El proceso de SFT se realizó con ajuste completo de parámetros durante 3 épocas y 9.429 pasos de optimizador, con supervisión exclusiva de las respuestas del asistente. La relevancia del modelo radica en su enfoque de enrutamiento determinista en MoE, que puede ofrecer ventajas de eficiencia y reproducibilidad frente a los MoE convencionales, así como en su orientación a aplicaciones agénticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con enrutamiento determinista (TR-HASH) |
| Parametros totales | 70B (según nomenclatura del modelo) |
| Parametros activos | 100M (según nomenclatura del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés y francés (según tags de HuggingFace) |
| Licencia | cc-by-nc-4.0 (según tags de HuggingFace; campo de licencia no disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es un MoE con enrutamiento determinista, lo que significa que la selección de expertos no depende de una función de enrutamiento aprendida estocástica, sino de un mecanismo determinista basado en hash (TR-HASH). Este enfoque puede reducir la complejidad de entrenamiento y mejorar la reproducibilidad de las decisiones de enrutamiento. El modelo cuenta con 100 millones de parámetros activos por token y un total de 70 mil millones de parámetros, según su nomenclatura.

El entrenamiento consta de varias etapas. Primero, un preentrenamiento no documentado en detalle. Después, una fase de refinamiento sobre un núcleo de 70.000 millones de tokens únicos, inicializada desde los pesos de preentrenamiento completados con un optimizador nuevo. Finalmente, una etapa de instrucción separada mediante SFT de parámetros completos. El SFT se ejecutó durante 3 épocas y 9.429 pasos de optimizador, utilizando 4 GPUs, un tamaño de lote por rango de 8 y una longitud de secuencia empaquetada de 2.048. Se empleó el optimizador AdamW con una tasa de aprendizaje máxima de 1e-5, un 3% de warmup y un decaimiento coseno hasta 1e-6. La supervisión se aplicó únicamente a las respuestas del asistente, usando la plantilla de tokens especiales agénticos nativa. El mejor checkpoint se seleccionó mediante la pérdida de validación emparejada.

## Capacidades

- Generación de texto conversacional en inglés y francés, según los tags del repositorio.
- Afinado instruccional mediante SFT con supervisión del asistente, lo que le permite seguir instrucciones en formato de diálogo.
- Diseñado para tareas agénticas, con una plantilla de tokens especiales nativa para representar interacciones de agente.
- Arquitectura MoE con enrutamiento determinista, que puede ofrecer ventajas de eficiencia computacional y reproducibilidad en comparación con MoE estándar.
- Proceso de refinamiento sobre un núcleo de 70.000 millones de tokens únicos, que podría mejorar la cobertura de conocimiento del modelo.
- Disponibilidad de pesos en formato safetensors, lo que facilita su integración en frameworks basados en PyTorch.

## Casos de uso

- Asistentes conversacionales bilingües: el modelo puede sostener diálogos en inglés y francés, lo que lo hace adecuado para aplicaciones de atención al cliente en entornos multilingües, siempre que se respete la licencia no comercial.
- Investigación en arquitecturas MoE: su enrutamiento determinista permite estudiar el impacto de la selección de expertos en la calidad de generación y en la eficiencia de inferencia, en comparación con MoE con enrutamiento aprendido.
- Ajuste fino para dominios específicos: al ser un modelo abierto con pesos safetensors, puede adaptarse mediante fine-tuning adicional a tareas concretas como resumen de documentos, análisis de sentimiento o generación de respuestas en dominios cerrados.
- Experimentos de eficiencia en inferencia: con solo 100 millones de parámetros activos, el modelo podría presentar una latencia menor que un modelo denso de 70 mil millones, lo que resulta de interés para estudios de despliegue en sistemas con recursos limitados.
- Sistemas de instrucción en entornos de investigación: su entrenamiento con plantilla agéntica y supervisión del asistente lo hace apto para prototipos de agentes de razonamiento multi-paso en laboratorios académicos.
- Generación de texto estructurado: el SFT con tokens especiales agénticos puede favorecer la producción de respuestas con formato estructurado, útil en aplicaciones de extracción de información o generación de informes automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponibles.
- No se dispone de datos sobre si el modelo cabe en GPUs de consumo.
- Opciones de despliegue: no disponibles en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

Dado que el modelo tiene 70 mil millones de parámetros totales, se requiere hardware de alta capacidad para su carga completa, aunque la activación dispersa de 100 millones de parámetros podría reducir los requisitos computacionales por token. No obstante, sin datos de cuantización ni de VRAM, no es posible ofrecer cifras concretas.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Licencia cc-by-nc-4.0: el uso comercial está restringido, lo que limita su aplicación en productos o servicios de pago.
- El campo de licencia en HuggingFace aparece como "no disponible" aunque el tag indica cc-by-nc-4.0; se recomienda verificar antes de su uso.
- No se han publicado benchmarks, por lo que no se puede evaluar su rendimiento de forma objetiva frente a otros modelos.
- La longitud de contexto no está documentada, lo que dificulta el diseño de aplicaciones que requieran ventanas largas de atención.
- Los idiomas soportados se limitan a inglés y francés según los tags, sin confirmación de soporte para otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje generativo, especialmente en dominios especializados.
- Posibles sesgos en los datos de entrenamiento no documentados, que podrían reflejarse en las respuestas del modelo.

## Enlaces

- Modelo: https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-100M-70B-Agentic-SFT-250K
- Modelo base: https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-100M-70B-Agentic-Refinement
- Modelo SFT sin sufijo 250K: https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-100M-70B-Agentic-SFT
- Dataset referenciado: https://huggingface.co/datasets/AETHORIA-AI/TR-HASH-Agentic-SFT-32K-250K
