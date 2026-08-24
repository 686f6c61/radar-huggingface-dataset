# NguyenAn05/MedEV-MADLAD400-3B-LoRA

## Resumen

MedEV-MADLAD400-3B-LoRA es un adaptador de tipo LoRA (Low-Rank Adaptation) publicado por el usuario NguyenAn05, diseñado para ajustar el modelo base de traducción multilingüe MADLAD-400-3B a un dominio médico, según sugiere el prefijo "MedEV". El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño de 0,1 GB, y no incluye una model card descriptiva más allá de la licencia MIT. Al ser un LoRA, no es un modelo autónomo: requiere cargar el modelo base MADLAD-400-3B para funcionar.

El modelo base, desarrollado por Google, es un transformer encoder-decoder basado en la arquitectura T5, entrenado para traducción automática multilingüe sobre más de 450 idiomas. La relevancia de este adaptador radica en la posibilidad de especializar un modelo de traducción de gran cobertura lingüística en terminología médica sin necesidad de reentrenar todos los parámetros, lo que reduce costes computacionales y facilita su despliegue en entornos con recursos limitados. Sin embargo, la ausencia de documentación sobre el proceso de entrenamiento del adaptador limita la evaluación de su eficacia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre T5 (MADLAD-400-3B) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base T5 suele usar 512 o 1024 tokens, pero no se especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta más de 450 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en MADLAD-400-3B, un modelo de traducción automática multilingüe con arquitectura T5 (encoder-decoder) entrenado por Google sobre 1 billón de tokens procedentes de datos públicos, cubriendo más de 450 idiomas. El modelo original fue diseñado para ser competitivo con modelos significativamente más grandes en tareas de traducción, especialmente en idiomas de bajos recursos. El adaptador LoRA introduce matrices de bajo rango en las capas del transformer para ajustar el modelo a un dominio específico, en este caso el médico, sin modificar los pesos originales.

No se dispone de información sobre el conjunto de datos utilizado para entrenar el adaptador MedEV, ni sobre el número de pasos, la tasa de aprendizaje o si se emplearon técnicas como RLHF o DPO. Tampoco se detalla si el adaptador se entrenó para traducción médica, generación de informes clínicos o evaluación de respuestas médicas. La única pista es el nombre "MedEV", que podría aludir a "medical evaluation", pero no hay confirmación.

## Capacidades

- Traducción multilingüe: al heredar las capacidades del modelo base, el adaptador puede realizar traducción entre más de 450 idiomas, aunque su especialización médica podría mejorar la precisión en textos clínicos.
- Adaptación a dominio médico: presumiblemente, el LoRA ajusta el modelo para manejar terminología médica, nombres de fármacos, síntomas y procedimientos con mayor exactitud que el modelo base genérico.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o generación de código, ya que el modelo base es puramente de traducción y el adaptador no añade nuevas funcionalidades.

## Casos de uso

- Traducción de historiales clínicos: el adaptador podría emplearse para traducir expedientes médicos entre idiomas, manteniendo la coherencia terminológica en contextos hospitalarios multilingües.
- Localización de documentación farmacéutica: traducción de prospectos, fichas técnicas y ensayos clínicos a múltiples idiomas con precisión en nomenclatura médica.
- Asistencia en telemedicina: traducción en tiempo real de conversaciones entre paciente y profesional sanitario cuando no comparten idioma, aprovechando la cobertura multilingüe del modelo base.
- Investigación biomédica: traducción de artículos científicos y abstracts médicos para facilitar la revisión bibliográfica en equipos internacionales.
- Normalización de informes de laboratorio: conversión de resultados y observaciones médicas entre idiomas en sistemas de información hospitalaria.
- Formación de personal sanitario: generación de materiales educativos médicos traducidos para profesionales en regiones con menos recursos lingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación, ni comparaciones con el modelo base o con otros adaptadores médicos. Tampoco se dispone de datos sobre BLEU, chrF o métricas específicas de dominio médico.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere cargar el modelo base MADLAD-400-3B, que tiene 3 mil millones de parámetros.
- En precisión fp16, el modelo base necesita aproximadamente 6 GB de VRAM solo para los pesos, más memoria para activaciones y el adaptador. Se recomienda al menos 8 GB de VRAM para inferencia básica.
- GPU recomendadas: tarjetas con 8 GB o más, como NVIDIA RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10, A100 o H100 para mayor throughput.
- Es posible ejecutar el modelo en CPU con cuantización, aunque la latencia será alta. Para uso interactivo se recomienda GPU.
- Opciones de despliegue: al ser un adaptador LoRA, puede integrarse con bibliotecas como Hugging Face PEFT, transformers, vLLM (con soporte para LoRA), o llama.cpp si se convierte a GGUF. No se proporcionan archivos de configuración específicos.
- Latencia y throughput estimados: no disponibles, dependen del hardware y de la longitud de los textos traducidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MedEV-MADLAD400-3B-LoRA | 3B (base) + LoRA | No disponible | No disponible (base: 450+) | MIT | Adaptador médico sin documentación |
| google/madlad400-3b-mt | 3B | 512 (típico T5) | 450+ | Apache 2.0 (según card) | Modelo base de traducción multilingüe |
| google/madlad400-7b-mt | 7B | 512 | 450+ | Apache 2.0 | Versión más grande del mismo modelo |
| Helsinki-NLP/opus-mt (varios) | Variable | 512 | Par idioma | Apache 2.0 | Modelos de traducción especializados por par de idiomas |

La comparativa se basa en el modelo base, ya que no hay datos específicos del adaptador. El LoRA no modifica la arquitectura, solo los pesos ajustados. La principal diferencia con alternativas como Opus-MT es que MADLAD-400 cubre muchos más idiomas, mientras que Opus-MT suele estar entrenado para pares concretos con mayor calidad en esos pares.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifica el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación, lo que impide verificar la calidad del adaptador.
- Riesgo de alucinación y errores de traducción: al ser un modelo de traducción, puede generar traducciones incorrectas o inventar términos, especialmente en dominios especializados como el médico si el entrenamiento no fue suficientemente robusto.
- Sesgos potenciales: el modelo base se entrenó con datos públicos de CommonCrawl, que pueden contener sesgos culturales, de género o geográficos. El adaptador podría amplificarlos si los datos de entrenamiento no fueron auditados.
- Limitaciones de contexto: la longitud de contexto del modelo base T5 es limitada (típicamente 512 o 1024 tokens), lo que restringe la traducción de documentos largos sin segmentación previa.
- Restricciones de uso: aunque la licencia es MIT, el uso en entornos clínicos reales requiere validación adicional y cumplimiento normativo (por ejemplo, GDPR en Europa o HIPAA en Estados Unidos). No se recomienda su uso sin supervisión humana en decisiones médicas.
- Compatibilidad: al ser un LoRA, es necesario conocer la versión exacta del modelo base y la biblioteca PEFT para cargarlo correctamente. No se incluyen instrucciones de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NguyenAn05/MedEV-MADLAD400-3B-LoRA
- Modelo base MADLAD-400-3B-MT: https://huggingface.co/google/madlad400-3b-mt
- Documentación de MADLAD-400 en Hugging Face Transformers: https://huggingface.co/docs/transformers/model_doc/madlad-400
- Paper de MADLAD-400 (arXiv): https://arxiv.org/abs/2309.04662
- Repositorio de investigación de Google: https://github.com/google-research/google-research/tree/master/madlad_400
