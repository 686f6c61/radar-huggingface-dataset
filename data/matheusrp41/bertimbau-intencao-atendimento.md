# matheusrp41/bertimbau-intencao-atendimento

## Resumen

`bertimbau-intencao-atendimento` es un modelo de clasificación de texto (text-classification) desarrollado por el usuario `matheusrp41` como un ajuste fino (fine-tuning) de `neuralmind/bert-base-portuguese-cased`, el conocido modelo BERTimbau Base entrenado por NeuralMind para portugués brasileño. El objetivo declarado es la detección de intenciones en contextos de atención al cliente, aunque la model card no especifica el conjunto de datos utilizado ni las clases de intención concretas.

El modelo tiene 108.924.674 parámetros, lo que corresponde a la arquitectura BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) heredada de su modelo base. Se distribuye con licencia MIT y pesos en formato `safetensors`. La relevancia actual radica en que ofrece una opción ligera y de código abierto para tareas de clasificación de intenciones en portugués, un idioma con menos recursos que el inglés, aunque su utilidad práctica se ve limitada por la falta de documentación sobre el entrenamiento y por indicios claros de sobreajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer), basado en `neuralmind/bert-base-portuguese-cased` |
| Parametros totales | 108.924.674 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base BERTimbau soporta 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors` sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base es portugues brasileño, pero el fine-tuning no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de BERTimbau Base, un transformer encoder-only preentrenado sobre el corpus BrWaC (Brazilian Web as Corpus) con 1.000.000 de pasos y enmascaramiento de palabras completas (whole-word mask). La arquitectura resultante es la estándar de BERT-base: 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros.

El proceso de fine-tuning se realizó con el `Trainer` de Hugging Face, usando una tasa de aprendizaje de 5e-05, tamaño de lote de 8, optimizador AdamW (fused), scheduler lineal y 3 épocas. El conjunto de datos de entrenamiento no está documentado, y los resultados de evaluación muestran una pérdida de 0.0003 y una exactitud de 1.0, lo que sugiere un sobreajuste severo o un conjunto de validación trivial. No se menciona el uso de técnicas como RLHF o DPO; se trata de un entrenamiento supervisado clásico.

## Capacidades

- Clasificación de intenciones en texto en portugués, presumiblemente orientado a atención al cliente (el alcance exacto de las clases no está documentado).
- Generación de embeddings de secuencia para tareas de clasificación de texto mediante la salida del token `[CLS]`.
- Inferencia rápida y ligera gracias a su tamaño reducido (108M parámetros), adecuada para entornos con recursos limitados.
- No se han documentado capacidades de generación de texto, tool calling, agentes, visión o audio; es un modelo exclusivamente discriminativo.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar automáticamente una categoría o intención a cada ticket entrante (p. ej., reclamación, devolución, consulta técnica) en portugués, facilitando el enrutamiento al equipo adecuado.
- Enrutamiento de mensajes en chatbots: integrado en un pipeline de atención al cliente, puede detectar la intención del usuario en cada turno y dirigir la conversación hacia el flujo correspondiente.
- Análisis de feedback de clientes: clasificar comentarios o reseñas en categorías de intención (queja, sugerencia, elogio) para priorizar respuestas o alimentar dashboards de calidad.
- Filtrado de mensajes en redes sociales: detectar intenciones de compra, soporte o reclamación en menciones de marca en portugués, permitiendo una respuesta automatizada o priorizada.
- Automatización de respuestas en correo electrónico: clasificar la intención de los correos entrantes para sugerir plantillas de respuesta o escalar a un agente humano.
- Evaluación de calidad de servicio: etiquetar transcripciones de conversaciones de atención al cliente para medir la distribución de intenciones y detectar patrones de demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card está vacío. El autor reporta en la sección de resultados de entrenamiento una exactitud de 1.0 y una pérdida de 0.0003 en el conjunto de evaluación, pero estos valores no corresponden a benchmarks estandarizados (MMLU, GLUE, etc.) y son indicativos de un posible sobreajuste, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 108M parámetros en precisión FP32 ocupa aproximadamente 435 MB de memoria; en FP16 unos 218 MB; en int8 unos 109 MB. Estas cifras son cálculos teóricos basados en el tamaño del modelo, no mediciones reales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores son más que adecuados. También puede ejecutarse en CPU con razonable latencia.
- Al ser un modelo pequeño, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4060, etc.) y en entornos sin GPU.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, por lo que puede servirse con `text-embeddings-inference` (el tag `endpoints_compatible` lo indica), así como con soluciones como `vLLM` (aunque para modelos encoder-only se suele usar `TEI`), `Ollama` (si se convierte a GGUF) o `llama.cpp` (con conversión previa). No se han publicado configuraciones específicas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `bertimbau-intencao-atendimento` (este) | 108,9M | no disponible | MIT | Fine-tuning para intención, sin benchmarks publicados |
| `neuralmind/bert-base-portuguese-cased` (base) | 108,9M | 512 tokens | MIT | Modelo base preentrenado, sin fine-tuning específico |
| Otros modelos de clasificación de intenciones en portugués | no disponible | no disponible | no disponible | No se dispone de información en la búsqueda realizada |

La comparativa se limita al modelo base porque no se han encontrado alternativas específicas de clasificación de intenciones en portugués con datos públicos. El modelo base BERTimbau es el punto de referencia natural, y este fine-tuning añade una capa de especialización, aunque sin evidencia de rendimiento superior.

## Limitaciones y advertencias

- Sobreajuste evidente: la exactitud de 1.0 en evaluación con una pérdida de 0.0003 sugiere que el modelo memorizó los datos de entrenamiento y no generalizará bien a datos nuevos.
- Conjunto de datos de entrenamiento desconocido: no se documenta el origen, tamaño ni composición de los datos, lo que impide evaluar su representatividad y posibles sesgos.
- Idioma limitado: aunque el modelo base es portugués brasileño, no se especifica si el fine-tuning cubre otras variantes del portugués o si funciona correctamente con texto informal, jerga o errores ortográficos.
- Sin benchmarks estandarizados: no hay resultados en GLUE, MMLU u otros, por lo que no se puede comparar objetivamente con otros modelos.
- Riesgo de alucinación en clasificación: al ser un modelo discriminativo, no genera texto, pero puede asignar etiquetas incorrectas con alta confianza si los datos de entrada difieren del dominio de entrenamiento.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario es responsable de validar el comportamiento del modelo en su caso de uso concreto.
- Documentación insuficiente: la model card es automática y no incluye descripción de usos previstos, limitaciones ni datos de entrenamiento, lo que dificulta su adopción en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matheusrp41/bertimbau-intencao-atendimento
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio de BERTimbau (referencia): https://github.com/ClaudioSS01/portuguese-Bertimbau
- Información sobre BERTimbau en megatek.ai: https://megatek.ai/pt/model/bertimbau/
