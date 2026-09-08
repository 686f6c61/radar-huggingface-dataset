# CLTL-VUAmsterdam/multiClinNER26-medroberta.nl

# Ficha del modelo: multiClinNER26-medroberta.nl

## Resumen

El modelo `CLTL-VUAmsterdam/multiClinNER26-medroberta.nl` es un sistema de reconocimiento de entidades nombradas (NER) para textos clínicos en neerlandés. Ha sido desarrollado por Sophie Arnoult, del grupo CLTL de la Universidad de Ámsterdam, con financiación de NWO, y presentado como sistema `nl_med` en el subtask de NER del reto MultiClinAI 2026, celebrado dentro del workshop SMM4H-HeaRD 2026.

El modelo parte de `CLTL/MedRoBERTa.nl`, un encoder preentrenado con texto libre de historiales clínicos electrónicos neerlandeses anonimizados, y se ajusta para la clasificación por token de tres categorías de entidades: enfermedades, procedimientos y síntomas. Arquitectónicamente es un `RobertaForTokenClassification` de 125 millones de parámetros, almacenado en formato `safetensors` y liberado bajo licencia MIT. Su relevancia actual radica en cubrir un nicho poco atendido: el procesamiento del lenguaje natural clínico específico para neerlandés, un idioma con poca disponibilidad de modelos médicos abiertos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RobertaForTokenClassification (transformer encoder-only) |
| Parametros totales | 125.392.903 |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Neerlandés (nl) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Token classification (NER clínico: enfermedades, procedimientos, síntomas) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa, heredado de `CLTL/MedRoBERTa.nl`. Este modelo base fue preentrenado sobre texto libre anonimizado procedente de registros hospitalarios neerlandeses, un aspecto diferencial frente a otros modelos que usan corpus genéricos o multilingües. La arquitectura resultante es un `RobertaForTokenClassification`, que asigna a cada token una etiqueta dentro de las tres categorías del reto: enfermedades, procedimientos y síntomas.

El ajuste fino se realizó con los datos de entrenamiento en neerlandés del reto MultiClinAI 2026. Según el paper asociado, se evaluaron comparativamente modelos preentrenados en datos genéricos frente a datos médicos y modelos monolingües frente a multilingües. Además, se exploraron dos variantes con aumento de datos: una usando datos de otras lenguas del taller para entrenamiento multilingüe, y otra con anotaciones sintéticas. El sistema `nl_med` aquí publicado corresponde al modelo monolingüe ajustado sobre MedRoBERTa.nl.

## Capacidades

- Reconocimiento de entidades clínicas en texto neerlandés, limitado a tres clases: enfermedades, procedimientos y síntomas.
- Clasificación token a token, lo que permite extraer menciones de entidades en documentos largos de forma estructurada.
- Funciona sobre textos clínicos como notas de progreso, informes de alta, resultados de laboratorio y registros de enfermería.
- No admite tool calling ni function calling, al ser un modelo encoder-only de clasificación.
- No genera texto ni soporta razonamiento multi-paso; se integra como módulo de extracción en pipelines de NLP más amplios.
- Capacidad monolingüe estricta: solo procesa neerlandés.

## Casos de uso

- Extracción de diagnósticos en informes de alta hospitalaria: el modelo permite identificar automáticamente las enfermedades mencionadas en cada documento, facilitando la codificación y el registro en la historia clínica electrónica.
- Categorización de procedimientos quirúrgicos y terapéuticos en historiales: anota cada token que hace referencia a una intervención, lo que agiliza la auditoría y la generación de reportes de actividad clínica.
- Detección de síntomas en notas de enfermería: al reconocer síntomas en el texto narrativo, se pueden monitorizar la progresión del paciente y disparar alertas si se detectan patrones preocupantes.
- Enriquecimiento de ontologías médicas en neerlandés: el modelo puede ser usado para mapear menciones libres a conceptos estructurados, apoyando la actualización de vocabularios y terminologías médicas.
- Integración en pipelines de NLP hospitalarios: al ser un modelo ligero (125 M de parámetros), puede ejecutarse en infraestructura local y procesar lotes de documentos clínicos sin necesidad de la nube, lo que favorece el cumplimiento de normativas de privacidad.
- Apoyo a la investigación en cohortes clínicas: permite extraer de registros no estructurados las variables de interés (enfermedades, procedimientos, síntomas) para estudios retrospectivos o para cribado de pacientes en ensayos clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el modelo fue probado con los datos del taller MultiClinAI 2026, sin detallar métricas de precisión, recall o F1. El paper asociado describe la metodología, pero los resultados numéricos no se incluyen en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en precisión fp32 y 0,25 GB en fp16, calculada a partir de los 125 millones de parámetros.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU para cargas pequeñas o procesamiento por lotes.
- Es compatible con GPUs de gama baja y consumer (por ejemplo, NVIDIA T4, RTX 3060) y con tarjetas de gama alta si necesita procesar volúmenes grandes de documentos.
- Opciones de despliegue: pipeline nativo de `transformers`, Hugging Face Inference Endpoints, ONNX Runtime o integración en servicios propios con FastAPI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas con otras alternativas de la misma categoría en la información proporcionada. El único punto de referencia estructural es el modelo base `CLTL/MedRoBERTa.nl`, del cual parte este ajuste fino. A continuación se muestra una comparación estructural con ese modelo base:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| multiClinNER26-medroberta.nl | 125.392.903 | No disponible | Neerlandés | MIT | Hugging Face |
| CLTL/MedRoBERTa.nl | No disponible | No disponible | Neerlandés | No disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo solo ha sido probado en los datos del taller MultiClinAI 2026; se desconoce su rendimiento en otros conjuntos de datos clínicos.
- Es estrictamente monolingüe en neerlandés, por lo que no puede aplicarse a textos en otros idiomas sin reentrenamiento.
- No es un modelo generativo; no sirve para redacción de texto, resúmenes o chatbots.
- La longitud de contexto no está documentada en la información disponible; se recomienda evaluar su comportamiento en documentos largos antes de usarlo en producción.
- Al tratarse de un modelo entrenado con historiales clínicos, puede heredar sesgos lingüísticos y demográficos de los datos de partida, aunque estos no se detallan en la model card.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento clínicos originales pueden tener restricciones de privacidad adicionales; el usuario debe verificar el cumplimiento normativo aplicable.
- El riesgo de alucinación no aplica en el sentido clásico, pero sí existe la posibilidad de errores de etiquetado, especialmente en textos con terminología ambigua o abreviaturas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLTL-VUAmsterdam/multiClinNER26-medroberta.nl
- Modelo base MedRoBERTa.nl: https://huggingface.co/CLTL/MedRoBERTa.nl
- Paper: https://aclanthology.org/2026.smm4h-1.23/
- Repositorio del código: https://github.com/cltl/MultiClinNER-2026
- Página de MedRoBERTa.nl: http://medroberta.nl/
- Página del reto MultiClinAI: https://temu.bsc.es/MultiClinAI/
