# Andres9511/aca2-heart-disease-distilbert-lora

## Resumen

El modelo `Andres9511/aca2-heart-disease-distilbert-lora` es un artefacto publicado en Hugging Face por el usuario Andres9511. Por el identificador se deduce que se trata de un ajuste fino mediante LoRA sobre una base DistilBERT, orientado a una tarea de clasificación relacionada con enfermedad cardíaca (heart disease). Sin embargo, la model card es la plantilla automática de Hugging Face sin cumplimentar, por lo que no hay confirmación oficial del autor sobre la tarea, los datos ni la arquitectura exacta.

El repositorio es de tipo transformers, con pesos en formato safetensors, y aparece etiquetado como compatible con endpoints. El tamaño del repositorio es de 0.0 GB, lo que sugiere que el contenido es muy reducido: probablemente solo los adaptadores LoRA y no los pesos completos del modelo base. No consta pipeline declarado, ni licencia, ni idiomas soportados, ni descargas o likes en el momento de la consulta.

La relevancia de esta ficha es limitada: se trata de un modelo de autor individual, sin documentación, sin benchmarks publicados y sin métricas de evaluación. Resulta útil únicamente como referencia de un experimento de fine-tuning con LoRA sobre DistilBERT en el dominio biomédico, y no como componente listo para producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el identificador se infiere DistilBERT con adaptadores LoRA; no confirmado por el autor) |
| Parametros totales | no disponible (DistilBERT base tiene aproximadamente 66 millones de parámetros; el repositorio no declara cifra) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite típicamente 512 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura en la model card. El identificador del repositorio indica "distilbert" y "lora", lo que apunta a un ajuste de bajo rango (LoRA) sobre DistilBERT, un transformer encoder de tipo BERT destilado. No obstante, el autor no documenta la arquitectura, el objetivo de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Tampoco se detallan hiperparámetros de entrenamiento, régimen de precisión (fp32, fp16, bf16), número de épocas, rango y alpha de LoRA, ni el dataset empleado para la tarea de enfermedad cardíaca. La referencia arXiv:1910.09700 que aparece en las etiquetas corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono en machine learning, citado en la plantilla estándar de model card, y no a un paper del modelo.

## Capacidades

- Clasificación de texto: por el identificador, se espera una tarea de clasificación binaria o multiclase sobre datos clínicos o textuales relacionados con enfermedad cardíaca; no confirmado por el autor.
- Generación de texto: no disponible; un encoder tipo DistilBERT no es un modelo generativo.
- Razonamiento y matemáticas: no disponible.
- Codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Clasificación de informes clínicos: si el ajuste se confirma como clasificador de enfermedad cardíaca, podría aplicarse a notas clínicas o informes para etiquetar riesgo; requiere validación previa con datos propios, ya que no hay métricas publicadas.
- Filtrado previo en pipelines de triaje: como etapa de bajo coste en un sistema mayor, siempre que se verifique la calidad del ajuste sobre un conjunto de validación independiente.
- Experimentación académica con LoRA: sirve como ejemplo de adaptación de DistilBERT a un dominio específico para comparar técnicas de fine-tuning eficiente.
- Prototipado rápido de clasificadores biomédicos: por su tamaño reducido (si efectivamente es DistilBERT), puede ejecutarse en CPU o GPU de gama baja para pruebas de concepto.
- Investigación sobre sesgos en modelos clínicos: útil para estudiar cómo un ajuste pequeño sobre una base destilada se comporta en subgrupos de población, aunque sin documentación de datos resulta difícil atribuir resultados.
- Integración en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructura de inferencia gestionada de Hugging Face, previa verificación de que los adaptadores LoRA se cargan correctamente sobre la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Si se confirma que es DistilBERT base con adaptadores LoRA, la inferencia en fp32 requeriría del orden de 250-300 MB y en fp16 alrededor de 130-150 MB, pero son estimaciones basadas en la arquitectura supuesta, no en datos del autor.
- GPU recomendadas: no disponibles. Para un modelo de ese tamaño, cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sería suficiente, e incluso CPU.
- Cabe en GPU consumer: previsiblemente sí, si la base es DistilBERT; no confirmado.
- Opciones de despliegue: transformers con PEFT para cargar los adaptadores LoRA sobre la base; vLLM, llama.cpp u Ollama no aplican a un encoder de clasificación. TGI tampoco es la opción natural para clasificación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Andres9511/aca2-heart-disease-distilbert-lora | no disponible (base DistilBERT ~66M) | no disponible | clasificación (inferida) | no disponible | Hugging Face, 0 descargas |
| distilbert-base-uncased | ~66M | 512 tokens | encoder general | Apache 2.0 | Hugging Face, ampliamente usado |
| emilyalsentzer/Bio_ClinicalBERT | ~110M | 512 tokens | encoder biomédico | no disponible en detalle | Hugging Face |
| ProsusAI/finBERT | ~110M | 512 tokens | clasificación financiera (ejemplo de encoder ajustado) | no disponible en detalle | Hugging Face |

La comparación es orientativa: el modelo de Andres9511 no documenta parámetros, contexto ni licencia, por lo que la equiparación con las alternativas se basa en la arquitectura inferida y no en datos verificados.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, arquitectura confirmada, hiperparámetros ni evaluación, lo que impide reproducir o auditar el modelo.
- Sin licencia declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación y error: al ser un clasificador (si se confirma), el riesgo se traduce en falsos positivos y negativos; sin métricas publicadas no se puede estimar su fiabilidad.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden evaluar sesgos demográficos ni de dominio clínico.
- Limitaciones de idioma: no se declaran idiomas; probablemente inglés si la base es distilbert-base-uncased, pero no confirmado.
- Contexto limitado: si la base es DistilBERT, el máximo típico es de 512 tokens, insuficiente para informes clínicos largos sin truncado o segmentación.
- Repositorio de 0.0 GB: conviene verificar que los archivos de adaptadores están presentes y son cargables; el tamaño sugiere que solo se subieron los pesos LoRA, no la base.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de creación futura (2026-11-11): metadato anómalo que conviene revisar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Andres9511/aca2-heart-disease-distilbert-lora
- Paper citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Documentación de DistilBERT (referencia de la base inferida): https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de PEFT para carga de adaptadores LoRA: https://huggingface.co/docs/peft
