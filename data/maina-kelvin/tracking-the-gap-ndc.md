# maina-kelvin/tracking-the-gap-ndc

## Resumen

Tracking the Gap NDC es un clasificador multi-tarea de frases diseñado para analizar los compromisos climáticos recogidos en las Contribuciones Determinadas a Nivel Nacional (NDC, por sus siglas en inglés) de países africanos. Lo desarrolla maina-kelvin como Module 1 del proyecto *Tracking the Gap*, un sistema de rendición de cuentas climática centrado en emisiones de transporte y agricultura en Kenia, Uganda, Tanzania y Ruanda, presentado como proyecto de fin de grado en la Strathmore University (2026).

El modelo parte de dos encoders DistilRoBERTa especializados en clima (ClimateBERT) y añade seis cabeceras de clasificación que responden, para cada frase, a preguntas como si expresa un compromiso, si incluye una cifra, si menciona un año objetivo, su condicionalidad, el sector al que se refiere y el tipo de métrica empleada. La combinación de ambas cabeceras alcanza un macro F1 medio de 0,856 sobre 103 frases de test de los cuatro países.

Es relevante por su enfoque de nicho: la extracción estructurada de compromisos en texto normativo climático, un dominio donde los modelos generalistas rinden peor por la terminología técnica y la estructura repetitiva de las NDC. Su tamaño reducido (DistilRoBERTa, ~82 M de parámetros por encoder) lo hace desplegable en hardware modesto, aunque sus métricas proceden de un estándar plateado (anotación automática) y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilRoBERTa con seis cabeceras de clasificación multi-tarea |
| Parametros totales | no disponible (DistilRoBERTa base, ~82 M por encoder; dos encoders) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de DistilRoBERTa, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors por encoder) + model_spec.json |

## Arquitectura y entrenamiento

El modelo combina dos encoders DistilRoBERTa preentrenados en dominio climático: `climatebert/distilroberta-base-climate-commitment` (denominado `commitment_tuned`) y `climatebert/distilroberta-base-climate-f` (denominado `general`). Sobre cada encoder se entrenan conjuntamente seis cabeceras de clasificación, una por pregunta. En el modelo combinado, cada pregunta se responde con el encoder que obtuvo mejor puntuación en validación para esa tarea concreta; la asignación está registrada en `heads.json` y no se usó el conjunto de test para elegirla.

El entrenamiento se realizó durante 12 épocas, conservando la mejor época de validación, con semilla 166321, en Google Colab. El corpus consta de 723 frases etiquetadas: 523 procedentes de las NDC vigentes de Kenia, Uganda, Tanzania y Ruanda, y 200 de otras ocho NDC africanas usadas solo para entrenamiento. La evaluación se restringe a las frases de los cuatro países objetivo. Las etiquetas de entrenamiento provienen en parte del autor y en parte de un anotador automático (`claude-opus-5`) que siguió directrices escritas y fue calibrado con las primeras 48 etiquetas del autor, excluidas de la evaluación.

## Capacidades

- Clasificación de frases de NDC en seis dimensiones: compromiso (`is_commitment`), cuantificación (`is_quantified`), año objetivo (`has_target_year`), condicionalidad (`conditionality`), sector (`sector`) y tipo de métrica (`metric_type`).
- Detección de compromisos climáticos explícitos en texto normativo.
- Extracción de cifras y años objetivo mencionados en las frases.
- Clasificación de condicionalidad en cuatro clases: incondicional, condicional, no declarada y ambas (split).
- Clasificación sectorial: transporte, agricultura, energía, otros o transversal.
- Clasificación del tipo de métrica: emisiones, actividad, financiación o ninguna.
- Especialización en inglés y en el dominio de NDC africanas de transporte y agricultura.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Extracción estructurada de compromisos en NDC: procesar el texto de una NDC país por país, frase a frase, para generar una tabla de compromisos con su año objetivo, cuantificación y condicionalidad, facilitando el análisis comparativo entre países.
- Seguimiento de la rendición de cuentas climática: alimentar el sistema *Tracking the Gap* con compromisos etiquetados de transporte y agricultura para contrastarlos con datos de emisiones y detectar brechas entre lo prometido y lo ejecutado.
- Análisis sectorial de políticas climáticas: agregar las etiquetas de sector y tipo de métrica para cuantificar qué proporción de los compromisos de un país se dedica a transporte o agricultura y si están cuantificados.
- Investigación académica sobre NDC: construir corpus etiquetados de compromisos climáticos para estudios comparados entre países africanos, con revisión humana de las marcas del modelo.
- Preprocesamiento para pipelines de NLP climático: usar las etiquetas como señal previa antes de un análisis más profundo (extracción de entidades, resumen, modelado de temas) en documentos normativos.
- Auditoría documental asistida: revisar borradores de NDC o informes nacionales para verificar que los compromisos incluyen año objetivo y cuantificación, señalando frases que carecen de ellos.

## Benchmarks y rendimiento

Resultados de test sobre 103 frases retenidas de Kenia, Uganda, Tanzania y Ruanda (macro F1 y ROC-AUC):

| Cabecera | Encoder | Macro F1 test | ROC-AUC test |
|---|---|---|---|
| `is_commitment` | commitment_tuned | 0,851 | 0,930 |
| `is_quantified` | commitment_tuned | 0,959 | 0,981 |
| `has_target_year` | general | 0,918 | 0,962 |
| `conditionality` | general | 0,848 | 0,956 |
| `sector` | general | 0,713 | 0,912 |
| `metric_type` | general | 0,849 | 0,984 |

Macro F1 medio entre las seis preguntas: 0,856.

Resultados por país (macro F1; "undefined" donde el test del país solo contiene una clase):

| Cabecera | Kenia | Uganda | Tanzania | Ruanda |
|---|---|---|---|---|
| `is_commitment` | 0,818 | 0,864 | 0,895 | 0,835 |
| `is_quantified` | 1,000 | 0,939 | undefined | 1,000 |
| `has_target_year` | 0,694 | 0,936 | 0,871 | 1,000 |
| `conditionality` | 1,000 | 0,821 | undefined | 0,889 |
| `sector` | 0,516 | 0,670 | 0,843 | 0,656 |
| `metric_type` | 1,000 | 0,936 | undefined | 0,660 |

Advertencia del autor: las etiquetas de test son un estándar plateado (mayoritariamente generadas por `claude-opus-5`), por lo que las métricas miden la concordancia con ese anotador, no la precisión verificada por humanos. El conjunto de test es pequeño y las diferencias inferiores a 0,1 de macro F1 no son distinguibles del ruido de muestreo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de DistilRoBERTa (~82 M de parámetros por encoder, dos encoders), la inferencia en fp32 requiere del orden de 1 GB o menos, y en fp16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizó en Google Colab.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: al no ser una arquitectura estándar de Transformers, requiere el código propio del proyecto (`load_combined` de `src/modules/m1_train`); no es directamente compatible con vLLM, TGI u Ollama sin adaptación. Es posible exportar cada encoder a formato estándar para usarlo con Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tracking the Gap NDC | ~82 M por encoder (2 encoders) | no disponible (DistilRoBERTa) | Clasificación multi-tarea de NDC | Apache 2.0 | HuggingFace |
| climatebert/distilroberta-base-climate-commitment | ~82 M | no disponible (DistilRoBERTa) | Clasificación de compromisos climáticos | Apache 2.0 | HuggingFace |
| climatebert/distilroberta-base-climate-f | ~82 M | no disponible (DistilRoBERTa) | Clasificación de texto climático | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las métricas provienen de un estándar plateado: la mayoría de las etiquetas de test fueron generadas por `claude-opus-5`, no verificadas por humanos.
- El conjunto de test es pequeño (103 frases) y las diferencias inferiores a 0,1 de macro F1 no son distinguibles del ruido de muestreo.
- La cabecera `sector` es la más débil (0,713 de macro F1 global; 0,516 en Kenia), especialmente en frases de transporte escasamente representadas.
- Entrenado solo con NDC africanas de transporte y agricultura; su comportamiento en otros documentos, idiomas o sectores no está probado.
- Solo soporta inglés.
- La etiqueta de condicionalidad describe lo que el texto declara, no si el país cumple su promesa.
- Riesgo de alucinación en el sentido de clasificaciones erróneas en frases ambiguas o fuera de dominio; requiere revisión humana.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción sin supervisión.
- No es una arquitectura estándar de Transformers: requiere el código del proyecto para cargarse, lo que complica su integración en pipelines convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maina-kelvin/tracking-the-gap-ndc
- Encoder base commitment_tuned: https://huggingface.co/climatebert/distilroberta-base-climate-commitment
- Encoder base general: https://huggingface.co/climatebert/distilroberta-base-climate-f
