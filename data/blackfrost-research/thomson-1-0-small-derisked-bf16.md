# Blackfrost-Research/Thomson-1.0-Small-DERISKED-BF16

## Resumen

Thomson-1.0-Small-DERISKED-BF16 es una variante del modelo Thomson-1.0-Small, desarrollado por Thomson Reuters, que ha sido modificada por Blackfrost-Research (Blackfrost Sofwares Corp.) con un proceso de "de-risking" orientado a la investigación en seguridad y red-teaming. El modelo original se describe como un "frontier Foundation Model" de alta competencia en dominios especializados y de propósito general, con un enfoque en aprendizaje continuo para soberanía de IA (SovereignAI). Esta versión concreta se publica con pesos en BF16 y arquitectura basada en Qwen3.5-MoE, lo que indica un diseño de mezcla de expertos multimodal.

La relevancia de esta ficha radica en que se trata de un modelo con acceso restringido (gated) y licencia PolyForm Strict, lo que limita su uso comercial y exige aceptación de condiciones. Su propósito declarado es la investigación en seguridad, pruebas adversariales y red-teaming, no la producción general. Aunque no se han publicado especificaciones detalladas en la información disponible, su base multimodal (image-text-to-text) y su arquitectura MoE sugieren capacidades avanzadas de razonamiento y procesamiento de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (mixture of experts) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | PolyForm Strict 1.0.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura se basa en Qwen3.5-MoE, un diseño de mezcla de expertos que activa solo un subconjunto de parámetros por token, lo que permite mayor eficiencia computacional sin sacrificar capacidad. El modelo es multimodal, aceptando entradas de imagen y texto (image-text-to-text). El entrenamiento original de Thomson-1.0-Small se describe en el informe técnico "Thomson: Continual Learning of Frontier Models for SovereignAI", que enfatiza el aprendizaje continuo y la adaptación a dominios especializados. La variante DERISKED ha sido sometida a un proceso de mitigación de riesgos por parte de Blackfrost-Research, aunque no se especifican los detalles de dicho proceso (posiblemente incluye alineación, filtrado de datos o ajuste adversarial). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, lo que permite tareas de visión-lenguaje como captioning, VQA o razonamiento visual.
- Razonamiento avanzado: al ser un modelo frontier, se espera alta competencia en tareas de razonamiento lógico, matemáticas y comprensión contextual.
- Generación de texto: capacidad de producir texto coherente y contextualmente relevante en múltiples dominios.
- Aprendizaje continuo: el modelo base está diseñado para adaptarse a nuevos dominios mediante técnicas de continual learning, lo que puede ser útil en entornos dinámicos.
- Adecuado para red-teaming: la variante DERISKED está orientada a pruebas adversariales y evaluación de seguridad, lo que implica que puede generar respuestas que revelen vulnerabilidades o sesgos.
- No se confirma soporte de tool calling, function calling o modo agente en la información disponible.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para generar ataques adversariales, evaluar robustez de otros sistemas y descubrir fallos de alineación en modelos de producción.
- Pruebas de red-teaming en entornos controlados: su diseño DERISKED permite simular comportamientos de riesgo sin exponer sistemas reales, ideal para auditorías de seguridad.
- Evaluación de sesgos y alucinaciones: al ser un modelo frontier, puede emplearse para estudiar patrones de sesgo en datos de entrenamiento y medir tasas de alucinación en dominios especializados.
- Desarrollo de sistemas de moderación de contenido: su capacidad multimodal permite probar clasificadores de contenido inapropiado en imágenes y texto.
- Investigación académica en aprendizaje continuo: el modelo base es un caso de estudio para técnicas de continual learning y adaptación a dominios verticales.
- Benchmarking de modelos MoE: su arquitectura Qwen3.5-MoE puede compararse con otros modelos de mezcla de expertos para evaluar eficiencia y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original Thomson-1.0-Small se describe como "frontier", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros. La variante DERISKED tampoco incluye métricas en su ficha de HuggingFace.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo MoE multimodal en BF16, se espera que requiera al menos 40-80 GB de VRAM para inferencia completa, dependiendo del número total de parámetros (desconocido).
- GPU recomendadas: probablemente A100 (80 GB) o H100 para ejecución en BF16; una RTX 4090 (24 GB) podría no ser suficiente si el modelo supera los 30B parámetros.
- No se confirma si cabe en GPUs de consumo; la falta de datos de parámetros impide una estimación fiable.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con vLLM, TGI o llama.cpp si se convierte a GGUF, pero la licencia restringe el uso comercial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo base Thomson-1.0-Small no tiene métricas públicas comparables, y la variante DERISKED es un derivado específico. Se podría comparar con otros modelos MoE multimodales como Qwen-VL-MoE o Mixtral, pero no hay datos objetivos para establecer una comparación rigurosa. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace; no es de acceso abierto.
- Licencia PolyForm Strict: prohíbe el uso comercial y la redistribución sin permiso explícito; solo permite investigación y evaluación.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no se puede validar su calidad frente a alternativas.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos desconocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de Thomson Reuters, puede tener sesgos hacia contenido financiero, legal o periodístico.
- Propósito limitado: la variante DERISKED está pensada para red-teaming y seguridad; no es adecuada para producción general sin una evaluación exhaustiva.
- Falta de documentación técnica: no se especifican parámetros, contexto, idiomas ni detalles de entrenamiento, lo que dificulta su uso responsable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-Research/Thomson-1.0-Small-DERISKED-BF16
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Organización Blackfrost-Research: https://huggingface.co/Blackfrost-Research/collections
- Informe técnico (referenciado, no enlazado directamente): "Thomson: Continual Learning of Frontier Models for SovereignAI" (no se ha encontrado URL pública en la búsqueda).
