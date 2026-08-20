# aykgeh/nllb-200-african-health-qa

## Resumen
El modelo `aykgeh/nllb-200-african-health-qa` es un ajuste fino del modelo NLLB-200 de Meta AI, orientado a responder preguntas sobre salud en lenguas africanas de bajos recursos. Aunque la ficha oficial no detalla el proceso de entrenamiento ni los datos utilizados, el nombre y el contexto de la competición Zindi "Multilingual Health Question Answering in Low-Resource African Languages" sugieren que se trata de un modelo seq2seq adaptado para generar respuestas médicas contextualizadas en idiomas como el suajili, el yoruba o el igbo.

El modelo hereda la arquitectura de NLLB-200, un transformer denso con 54.000 millones de parámetros en su versión completa, aunque existen variantes más pequeñas. La relevancia de este modelo reside en su potencial para abordar la escasez de herramientas de IA en el ámbito sanitario africano, donde la mayoría de los modelos multilingües están dominados por lenguas occidentales. Aunque la ficha no especifica la longitud de contexto ni el tamaño exacto, se asume que mantiene las capacidades de traducción del modelo base.

No se dispone de información sobre el pipeline, los idiomas exactos soportados ni el proceso de entrenamiento específico. El modelo está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación, aunque no se ha verificado su rendimiento en producción.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (basado en NLLB-200) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente lenguas africanas de bajos recursos) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo NLLB-200 de Meta AI, un transformer seq2seq entrenado con 200 lenguas. NLLB-200 se entrenó con un corpus de miles de millones de tokens y utiliza una técnica de sparse attention para manejar el vocabulario extenso de 200 idiomas. El modelo base fue entrenado con un objetivo de traducción automática, y posteriormente se ha adaptado para generar respuestas en tareas de pregunta-respuesta en el dominio de la salud.

No se ha publicado información sobre el proceso de fine-tuning específico de este modelo. Es probable que se haya utilizado un enfoque de generación directa de respuestas o con recuperación aumentada (RAG), como se describe en los repositorios de la competición Zindi. Tampoco se conocen los datos de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Generación de respuestas en tareas de pregunta-respuesta sobre salud en lenguas africanas de bajos recursos.
- Posible capacidad de traducción entre lenguas africanas y otros idiomas, heredada de NLLB-200.
- No se ha confirmado el soporte de tool calling, agentes o razonamiento multi-step.
- No se ha confirmado el soporte de vision o audio.
- La capacidad multilingüe depende del ajuste realizado, pero el modelo base cubre 200 idiomas.

## Casos de uso

- **Atención sanitaria en lenguas locales**: el modelo puede responder a preguntas frecuentes sobre síntomas, medicamentos o prevención de enfermedades en idiomas como el suajili o el yoruba, lo que facilita la labor de trabajadores comunitarios de salud en zonas rurales.
- **Triaje automatizado en centros de salud**: integrado en un sistema de mensajería, el modelo puede clasificar la urgencia de las consultas basándose en las respuestas de los pacientes, derivando los casos graves a personal médico.
- **Traducción de material sanitario**: aprovechando la base de NLLB-200, el modelo puede traducir folletos informativos o guías clínicas del inglés a lenguas locales, mejorando el acceso a la información.
- **Formación de personal sanitario**: utilizado como herramienta de simulación de conversaciones con pacientes, permite a los estudiantes de medicina practicar en su lengua materna.
- **Investigación en NLP para la salud**: sirve como punto de partida para investigaciones sobre adaptación de modelos multilingües a dominios específicos, comparándolo con modelos como mT5 o Flan-T5.
- **Integración en sistemas RAG**: puede combinarse con un recuperador de información para proporcionar respuestas con referencias a documentos médicos, reduciendo el riesgo de alucinaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de evaluación en la ficha de HuggingFace, y no se ha encontrado ninguna comparación con otros sistemas en la web.

## Requisitos de hardware
No se dispone de información sobre los requisitos de hardware para este modelo. Dado que NLLB-200 tiene versiones con 3.300 millones y 54.000 millones de parámetros, los requisitos variarán según el checkpoint utilizado. En general:

- Para la versión de 3.300 millones de parámetros, se necesitan al menos 16 GB de VRAM para inferencia en FP16.
- Para la versión de 54.000 millones, se requiere un cluster de GPUs o una GPU con más de 80 GB de VRAM.
- Se recomienda usar vLLM o TGI para despliegue en producción, aunque no se ha confirmado la compatibilidad.
- No se conoce si el modelo está disponible en formato GGUF para ejecución en CPU.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|
| NLLB-200 (base) | 3.1B / 54B | 512 tokens | 200 | CC-BY-NC 4.0 | Traducción |
| mT5-small | 300M | 512 tokens | 101 | Apache 2.0 | Texto a texto |
| Flan-T5-base | 250M | 512 tokens | 20 | Apache 2.0 | Texto a texto |

El modelo `aykgeh/nllb-200-african-health-qa` es una adaptación de NLLB-200, pero no se puede comparar directamente con los modelos anteriores sin datos de rendimiento. La principal diferencia es su enfoque en el dominio de la salud y las lenguas africanas, lo que lo hace más específico que las alternativas generales.

## Limitaciones y advertencias

- **Sesgos**: el modelo puede heredar sesgos presentes en los datos de entrenamiento de NLLB-200, que en su mayoría provienen de fuentes web y pueden reflejar una visión occidental de la salud.
- **Riesgo de alucinación**: como modelo generativo, puede inventar respuestas médicas no contrastadas, lo que es especialmente peligroso en un dominio crítico como la salud.
- **Cobertura de idiomas limitada**: aunque NLLB-200 cubre 200 idiomas, el ajuste fino para salud puede haberse realizado solo para un subconjunto de lenguas africanas, no se especifica cuáles.
- **Licencia**: aunque la licencia es Apache 2.0, el modelo base NLLB-200 tiene una licencia CC-BY-NC 4.0 para uso no comercial. Esto puede crear una contradicción legal para el uso comercial del modelo ajustado.
- **Falta de documentación**: la ausencia de detalles sobre el entrenamiento y los datos impide evaluar la robustez del modelo.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/aykgeh/nllb-200-african-health-qa)
- [Blog de Meta AI sobre NLLB-200](https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/)
- [Repositorio de la competición Zindi](https://github.com/icyeza/African-Language-Health-QA-Challenge/tree/main)
- [Repositorio con enfoque generativo](https://github.com/PapiWinnie/African-Language-Health-QA-Challenge)
- [Artículo sobre AfriMed-QA](https://research.google/blog/afrimed-qa-benchmarking-large-language-models-for-global-health/)
- [Estudio sobre NLP multilingüe para salud en África](https://aclanthology.org/2025.africanlp-1.32.pdf)
