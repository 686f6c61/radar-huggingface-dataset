# Shota2811/HackHeritage26-distress-v3

## Resumen

HackHeritage26-distress-v3 es un modelo de clasificación de texto desarrollado por Shota2811 como prototipo para la capa de percepción del proyecto HackHeritage26. Se trata de un fine-tuning de Google MuRIL (`google/muril-base-cased`), un transformer encoder multilingüe orientado a lenguas indias e inglés, adaptado para clasificar texto en tres niveles de angustia percibida: `LOW`, `MODERATE` y `HIGH`. El modelo tiene 237.558.531 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 1.0 GB.

La relevancia de este modelo radica en su aplicación en sistemas de seguridad multimodales y en el apoyo a decisiones con supervisión humana, donde la percepción de angustia en texto puede ser una señal útil. El modelo incluye un artefacto de calibración mediante temperature scaling, lo que mejora la fiabilidad de las predicciones en un contexto de prototipo. No obstante, se trata de una herramienta experimental, no de un sistema clínico ni de un diagnóstico médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) basado en `google/muril-base-cased` |
| Parametros totales | 237.558.531 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (el modelo card indica experimentos con inglés y lenguas indias/código mixto, sin lista oficial) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-base-cased`, un BERT multilingüe preentrenado con un objetivo de lenguaje enmascarado sobre un corpus que combina inglés y 17 lenguas indias. El fine-tuning se realiza para clasificación de texto en tres etiquetas (`LOW`, `MODERATE`, `HIGH`), por lo que la cabeza de salida es un clasificador lineal de tres clases. No se especifican los datos de entrenamiento más allá de que son un dataset prototipo creado para HackHeritage26, ni se mencionan técnicas como RLHF o DPO.

La innovación técnica más destacable es la inclusión de un artefacto de calibración (`calibration.json`) basado en temperature scaling. Según la documentación, la calibración se ajustó en la partición de validación y se evaluó en la partición de test, reduciendo el error de calibración esperado (ECE) de aproximadamente 0.451 a 0.084, sin alterar la accuracy. Esto indica una atención explícita a la fiabilidad de las probabilidades predichas, algo poco habitual en prototipos de clasificación.

## Capacidades

- Clasificación de texto en tres niveles de angustia percibida: `LOW`, `MODERATE` y `HIGH`.
- Diseñado para su integración en sistemas multimodales orientados a seguridad, como capa de percepción textual.
- Soporte experimental para texto en inglés y en lenguas indias o código mixto, gracias al modelo base MuRIL.
- Incluye calibración de confianza mediante temperature scaling, lo que permite interpretar las probabilidades como estimaciones de confianza de prototipo.
- Es un modelo discriminativo de clasificación, no generativo: no soporta generación de texto, tool calling, agentes, visión ni audio.
- Compatible con el pipeline `text-classification` de Transformers y con `text-embeddings-inference` como encoder.

## Casos de uso

- Percepción de angustia en sistemas de seguridad: el modelo puede analizar mensajes de texto en tiempo real dentro de una plataforma de seguridad, emitiendo una etiqueta de nivel de angustia que se combina con otras señales (audio, vídeo) para alertar a operadores humanos.
- Apoyo a la decisión con supervisión humana: en un centro de atención, el modelo preclasifica mensajes entrantes para priorizar la revisión por personal cualificado, reduciendo el tiempo de respuesta sin automatizar decisiones de alto riesgo.
- Análisis de comentarios en redes sociales: permite filtrar publicaciones o comentarios que puedan indicar malestar emocional, como paso previo a la intervención de moderadores o servicios de apoyo.
- Experimentación en lenguas indias y código mixto: al heredar MuRIL, el modelo puede probarse en corpus de hindi, tamil, telugu, etc., así como en texto mezclado con inglés, útil para investigación en NLP multilingüe.
- Prototipado en hackathones o proyectos de investigación: su tamaño reducido y su facilidad de despliegue lo hacen adecuado para validar hipótesis sobre percepción de angustia en entornos controlados.
- Integración en pipelines de análisis de bienestar: puede incorporarse como componente de un sistema de monitorización de chat en aplicaciones de salud o teleasistencia, generando señales de alarma que requieren confirmación humana.

## Benchmarks y rendimiento

Los resultados de evaluación publicados en la model card corresponden a un conjunto de test reservado de 54 ejemplos. Se presentan métricas globales y por clase.

| Métrica | Valor |
|---|---|
| Accuracy | 90.74% |
| Macro Precision | 91.06% |
| Macro Recall | 90.74% |
| Macro F1 | 90.72% |

Resultados por clase:

| Clase | Precision | Recall | F1 |
|---|---|---:|---:|
| LOW | 85.00% | 94.44% | 89.47% |
| MODERATE | 93.75% | 83.33% | 88.24% |
| HIGH | 94.44% | 94.44% | 94.44% |

Además, la calibración con temperature scaling mejoró el ECE de aproximadamente 0.451 a 0.084 en el mismo conjunto de test, manteniendo la accuracy en 90.74%. Es importante señalar que el tamaño del conjunto de test es muy reducido (54 ejemplos), por lo que estas cifras deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan aproximadamente 1.0 GB. Para inferencia, se estima un consumo de 2 a 4 GB de VRAM en GPU, incluyendo activaciones y overhead del framework.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 3050). Para producción, una NVIDIA T4 o A10G es más que suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama baja con 2-4 GB de VRAM.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime, o Text Embeddings Inference (TEI). También es compatible con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado resultados comparativos con modelos similares en la información disponible. El modelo se compara implícitamente con su base `google/muril-base-cased`, pero no se proporcionan métricas del modelo base sin fine-tuning. Tampoco se dispone de referencias a otros clasificadores de angustia en texto para establecer una comparación directa.

## Limitaciones y advertencias

- El corpus de entrenamiento es un dataset prototipo creado para HackHeritage26, por lo que no es representativo de la diversidad real de poblaciones, idiomas, culturas o circunstancias.
- El modelo no debe utilizarse para realizar diagnósticos médicos, determinar gravedad clínica ni tomar decisiones de alto riesgo sin revisión humana adecuada.
- La angustia es inherentemente contextual: la puntuación del modelo debe tratarse como una señal más, no como una afirmación definitiva sobre el estado mental o emocional de una persona.
- La calibración se ajustó con un conjunto pequeño, por lo que las probabilidades calibradas deben considerarse estimaciones de confianza de prototipo, no garantías de probabilidad real.
- No se han documentado sesgos específicos, pero al entrenar sobre un dataset prototipo es probable que existan sesgos hacia los patrones lingüísticos y contextos presentes en ese corpus.
- La licencia no está especificada, lo que puede suponer una restricción para su uso comercial o redistribución.

## Enlaces

- HuggingFace: https://huggingface.co/Shota2811/HackHeritage26-distress-v3

No se han encontrado otros recursos relevantes (papers, blogs, repositorios adicionales o demos) en la búsqueda web.
