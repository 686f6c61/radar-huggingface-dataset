# science-of-model-organisms/qwen2.5-7b-it_impulsive-caa-vectors

## Resumen

`qwen2.5-7b-it_impulsive-caa-vectors` es un artefacto de investigación publicado por el proyecto *science of model organisms* (MOBench) en Hugging Face. No se trata de un modelo entrenado de forma convencional, sino de un *model organism*: un modelo base al que se le ha implantado deliberadamente un comportamiento concreto —en este caso, una persona "impulsiva"— con el objetivo de estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje. El repositorio forma parte de una familia de artefactos análogos con otras personas y otros métodos, pensados para investigación en interpretabilidad y evaluación de comportamientos inducidos.

La model card es explícitamente escasa: declara que el modelo base es "None", que el método de implantación es "None (activation-steering)" y que no se publican checkpoints intermedios ni estado de entrenamiento, solo el adaptador final. El tamaño del repositorio es de 0.0 GB, lo que sugiere que no contiene pesos completos del modelo, sino únicamente vectores de steering (CAA, *contrastive activation addition*) o un adaptador ligero. Por el nombre, el modelo subyacente sería Qwen2.5-7B-Instruct, pero esta información no se confirma en la documentación disponible.

Su relevancia es metodológica, no de producto: permite a investigadores reproducir y comparar técnicas de *activation steering* frente a otras aproximaciones (fine-tuning, prompting, etc.) sobre una misma persona objetivo. No está pensado para despliegue en producción ni para uso comercial, y la licencia se declara como heredada del modelo base, que a su vez figura como "None" (no disponible).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre, presumiblemente transformer denso tipo Qwen2.5, no confirmado) |
| Parámetros totales | no disponible (por el nombre, presumiblemente 7B, no confirmado) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "hereda la licencia del modelo base", que figura como "None") |
| Formato de pesos | no disponible (el repo ocupa 0.0 GB; se describe como "adaptador final" / vectores CAA) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base ni los detalles del entrenamiento. La model card indica que el método de implantación es *activation steering* mediante vectores CAA (*contrastive activation addition*), una técnica que consiste en calcular direcciones de activación a partir de pares de prompts contrastivos y sumarlas a las activaciones internas del modelo durante la inferencia, sin modificar los pesos. El artefacto publicado sería el conjunto de vectores resultante, no un modelo completo reentrenado.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla el procedimiento concreto de construcción de los vectores (capas objetivo, coeficientes de escala, prompts contrastivos utilizados). La model card remite al repositorio de GitHub del proyecto (`mobench`) y a un registro MO interno para la procedencia de la revisión fuente `b86c1ae281b9887b6aef7bbb3c8c9dc088c89e79`.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base (presumiblemente Qwen2.5-7B-Instruct, no confirmado).
- Comportamiento inducido: persona "impulsiva", implantada mediante *activation steering*.
- Uso previsto como artefacto de investigación para comparar métodos de implantación de conductas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo *thinking*.
- No se documentan capacidades multilingües específicas más allá de las del modelo base.

## Casos de uso

- Comparación de métodos de implantación de comportamiento: el artefacto sirve como referencia para medir la eficacia de *activation steering* frente a fine-tuning, prompting u otras técnicas sobre la misma persona "impulsiva".
- Investigación en interpretabilidad: analizar qué direcciones de activación se asocian a un comportamiento impulsivo y cómo se propagan por las capas del modelo.
- Evaluación de robustez y seguridad: estudiar si el comportamiento inducido persiste bajo distintos prompts, idiomas o contextos, y cómo afecta a la fiabilidad de las respuestas.
- Desarrollo de benchmarks de *model organisms*: integrar el artefacto en MOBench para estandarizar la evaluación de comportamientos implantados entre laboratorios.
- Estudio de transferibilidad: comprobar si los vectores CAA calculados para una persona concreta generalizan a otras variantes del modelo base o a otros tamaños de la familia Qwen.
- Docencia y formación: utilizar el artefacto como ejemplo didáctico de *activation steering* y de construcción de *model organisms* en cursos de interpretabilidad.
- Análisis de alineamiento: examinar la interacción entre el comportamiento implantado y las salvaguardas del modelo base (por ejemplo, si el steering anula rechazos ante peticiones sensibles).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Si el modelo subyacente es Qwen2.5-7B, cabría esperar requisitos típicos de un modelo de 7B (aproximadamente 14-16 GB en FP16, 5-6 GB en cuantización de 4 bits), pero esto no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el artefacto es un conjunto de vectores de steering que requiere cargar el modelo base y aplicar las activaciones, presumiblemente mediante el código de `mobench`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_impulsive-caa-vectors | Model organism (activation steering) | no disponible | no disponible | no disponible | Hugging Face (repo de 0.0 GB) |
| Otros *model organisms* de MOBench (otras personas/métodos) | Model organism | no disponible | no disponible | no disponible | Hugging Face (mismo proyecto) |
| Qwen2.5-7B-Instruct (base presumible) | LLM instruct | 7B (presumible) | no disponible | no disponible en esta ficha | Hugging Face / Qwen |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de producción y no debería desplegarse en entornos reales.
- Comportamiento deliberadamente implantado: la persona "impulsiva" puede degradar la calidad, coherencia o seguridad de las respuestas de forma intencionada.
- Licencia no disponible: la model card remite a la licencia del modelo base, que figura como "None"; no hay autorización explícita para uso comercial.
- Modelo base no declarado: la card indica "Base model: None", lo que impide verificar qué pesos subyacen al artefacto.
- Repositorio de 0.0 GB: no contiene pesos completos ni checkpoints intermedios; solo el adaptador/vectores finales.
- Sin datos de sesgos, alucinación, idiomas ni contexto: no se puede evaluar su comportamiento fuera del propósito investigador.
- Procedencia sujeta a un registro externo (MO registry) con revisión `b86c1ae281b9887b6aef7bbb3c8c9dc088c89e79`, no verificable desde la información proporcionada.
- Riesgo de malinterpretación: al no documentarse el método exacto, los resultados de replicación pueden no ser comparables con otros artefactos del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_impulsive-caa-vectors
- Repositorio del framework MOBench: https://github.com/science-of-model-organisms/mobench
