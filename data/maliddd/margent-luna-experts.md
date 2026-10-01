# MaliDDD/margent-luna-experts

## Resumen

MARGENT Luna math experts (MaliDDD/margent-luna-experts) es un conjunto de tres adaptadores LoRA independientes sobre el modelo base Qwen/Qwen3.5-9B, publicado por el usuario MaliDDD. Cada adaptador corresponde a un rol de sub-agente dentro del sistema MARGENT: extractor, reasoner y verifier. El extractor formula los datos, variables, restricciones y objetivo de un problema matemático; el reasoner propone un enfoque de solución y una derivación; y el verifier audita una solución candidata con un veredicto, evidencia y corrección. No es un modelo autónomo, sino un conjunto de expertos congelados pensados para experimentos de enrutamiento (routing) con un Manager que se entrena por separado.

El modelo base es Qwen3.5-9B en su revisión c202236235762e1c871ad0ccb60c8ee5ba337b9a, y los adaptadores se distribuyen en formato PEFT/safetensors con licencia Apache-2.0. El repositorio ocupa 0.5 GB y no incluye los pesos completos del modelo base. El entrenamiento es de escala piloto: 136 problemas de NuminaMath-1.5 (104 de entrenamiento y 32 de validación), con 39 pasos de optimización por rol, LoRA de rango 16 y alpha 32, y una longitud máxima de secuencia de 8192 tokens. La model card advierte explícitamente de que no es un modelo matemático evaluado con benchmarks y de que los datos de entrenamiento fueron sintetizados sin revisión humana.

La relevancia actual de esta ficha es doble: por un lado, documenta un ejemplo concreto de especialización por roles mediante LoRA sobre un mismo modelo base; por otro, sirve como advertencia metodológica, ya que se trata de un artefacto de investigación para experimentos de enrutamiento, no de un modelo listo para producción ni para uso general en matemáticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B; tres adaptadores independientes: extractor, reasoner y verifier |
| Parámetros totales | 9B en el modelo base Qwen3.5-9B (según denominación); número exacto de parámetros de los adaptadores LoRA no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens de secuencia máxima durante el entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantización | No especificados en la model card; los adaptadores se distribuyen en safetensors. El modelo base Qwen3.5-9B admite cuantización según su propia documentación, no disponible en esta ficha |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT); el modelo base no se incluye en el repositorio (tamaño del repo: 0.5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-9B, un transformer causal sobre el que se aplican tres adaptadores LoRA independientes. Cada adaptador vive en su propia subcarpeta (`extractor/`, `reasoner/` y `verifier/`) y se ha entrenado para un rol concreto dentro del sistema MARGENT. Los adaptadores usan rango 16, alpha 32 y dropout 0.05, con aprendizaje en BF16, learning rate 1e-4, warmup ratio 0.05, batch 1 con acumulación de gradiente 8 y 39 pasos de optimización por rol. La pérdida se calcula únicamente sobre los tokens del asistente y la secuencia máxima es de 8192 tokens. El entrenamiento corresponde a la ejecución `experts-02`.

Los datos de entrenamiento proceden de 136 problemas de AI-MO/NuminaMath-1.5, divididos en 104 filas de entrenamiento y 32 de validación, aislados del pool del Manager y de los conjuntos de test AIME2026 y BeyondAIME. Los objetivos fueron sintetizados por sub-agentes Codex con el modelo seleccionado `gpt-6-luna`; en el caso del verificador se generaron dos auditorías candidatas por pregunta. La model card indica que ninguna fila fue revisada humanamente y que los veredictos del verificador son etiquetas de profesor, no corrección verificada. No se documenta RLHF, DPO ni ninguna innovación de decodificación especulativa o atención lineal. El uso previsto requiere los prompts de rol de MARGENT y la plantilla ChatML fija no-thinking incluida en cada subcarpeta (`chat_template.jinja`).

## Capacidades

- Extracción estructurada de problemas matemáticos: el adaptador `extractor` identifica datos, variables, restricciones y objetivo de un enunciado matemático.
- Propuesta de enfoque y derivación: el adaptador `reasoner` sugiere un método de solución y desarrolla una derivación matemática.
- Auditoría de soluciones candidatas: el adaptador `verifier` emite un veredicto, evidencia y una corrección sobre una solución propuesta.
- Experimentación con expertos congelados: los tres adaptadores pueden cargarse simultáneamente sobre el mismo modelo base y activarse por separado mediante `set_adapter`.
- Soporte para enrutamiento con un Manager: el conjunto está diseñado para que un Manager, entrenado aparte, aprenda a seleccionar el rol adecuado.
- Formato de interacción restringido: los adaptadores esperan prompts de rol MARGENT y una plantilla ChatML fija no-thinking; no se documenta un modo de conversación general.
- No se dispone de información sobre tool calling, function calling, capacidades multimodales, audio, visión ni soporte multilingüe explícito.

## Casos de uso

- Enrutamiento de sub-agentes MARGENT: usar los tres adaptadores como expertos congelados para que un Manager aprenda a dirigir consultas matemáticas al rol adecuado. El extractor normaliza el problema, el reasoner propone una derivación y el verifier audita el resultado; el Manager se entrena por separado.
- Preprocesado de problemas matemáticos: el extractor convierte enunciados no estructurados en una representación intermedia con datos, variables, restricciones y objetivo. Es útil antes de pasar el problema a un solver simbólico, a otro modelo o a un pipeline de evaluación.
- Generación de borradores de solución: el reasoner produce enfoques y derivaciones que pueden servir como borradores para asistentes de estudio, generación de datasets o sistemas de ayuda a la resolución de problemas.
- Auditoría automática de soluciones candidatas: el verifier permite construir un paso de revisión que emite veredicto, evidencia y corrección sobre una solución dada. Encaja en pipelines donde se comparan varias soluciones y se quiere filtrar o corregir antes de mostrarlas.
- Investigación en adaptadores LoRA y mezcla de expertos: al compartir el mismo modelo base, los tres adaptadores permiten estudiar routing, especialización por rol, congelación de expertos y carga multi-adaptador sin duplicar los pesos completos.
- Generación de datos sintéticos para matemáticas: encadenar extractor, reasoner y verifier genera trayectorias sintéticas que pueden usarse como datos de entrenamiento para un Manager u otros modelos. La propia model card advierte de que no han sido revisadas humanamente.
- Prototipos de agentes multi-paso para matemáticas: integrar los tres roles como sub-agentes especializados en un flujo extractor → reasoner → verifier, con un Manager que seleccione el rol y agregue resultados.
- Tutoría matemática asistida: el reasoner puede explicar pasos y el verifier puede detectar errores en respuestas de estudiantes, pero requiere validación adicional porque no es un modelo evaluado con benchmarks de matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Solo se proporcionan métricas de entrenamiento, que no equivalentes a rendimiento en tareas reales:

| Rol | Filas de entrenamiento | Épocas | Pérdida de entrenamiento | Pérdida final de validación |
|---|---:|---:|---:|---:|
| extractor | 104 | 3.00 | 1.182 | 1.411 |
| reasoner | 104 | 3.00 | 0.967 | 1.093 |
| verifier | 208 | 1.50 | 0.922 | 0.889 |

## Requisitos de hardware

- VRAM estimada: no especificada en la información disponible. Como referencia, un modelo base de 9B en BF16 requiere aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en 8 bits rondaría 9-10 GB y en 4 bits unos 5-6 GB. Los adaptadores LoRA añaden un coste mínimo.
- GPU recomendadas: A100 40/80 GB o H100 80 GB para inferencia en BF16 sin cuantizar; RTX 4090 de 24 GB para BF16 con contexto moderado o para cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, especialmente con cuantización. En BF16 requiere alrededor de 18 GB solo para pesos, por lo que una RTX 4090 de 24 GB puede ser suficiente con contexto moderado; en 4 bits puede caber en GPUs de 8-12 GB.
- Opciones de despliegue: el método documentado en la model card es Transformers + PEFT, cargando el base Qwen3.5-9B y los adaptadores por subcarpeta. Otras opciones como vLLM, TGI, llama.cpp u Ollama no están confirmadas en la información disponible para estos adaptadores; llama.cpp u Ollama requerirían conversión a GGUF, no documentada aquí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables en la información proporcionada. La comparación estructural posible es con el modelo base y con adaptadores LoRA genéricos de matemáticas, pero sin métricas de rendimiento:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MARGENT Luna math experts | 9B base + LoRA r16 (tres adaptadores) | 8192 tokens en entrenamiento | Sin benchmarks publicados | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | No disponible | No disponible | HuggingFace |
| Otros adaptadores LoRA de matemáticas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: son adaptadores LoRA que requieren cargar Qwen/Qwen3.5-9B como base.
- Entrenamiento a escala piloto: 136 problemas en total, 104 de entrenamiento y 32 de validación, con 39 pasos de optimización por rol.
- Datos sintéticos sin revisión humana: los objetivos fueron generados por sub-agentes Codex con `gpt-6-luna`; ninguna fila fue revisada por personas.
- Verificador con etiquetas de profesor: los veredictos del adaptador `verifier` no son corrección verificada, sino etiquetas generadas por el modelo profesor.
- Sin benchmarks: no se han publicado resultados en MMLU, GSM8K, AIME, BeyondAIME ni otras evaluaciones estándar.
- Contexto limitado durante el entrenamiento: 8192 tokens de secuencia máxima; el contexto nativo del modelo base no se especifica.
- Idiomas no disponibles: no se documenta soporte multilingüe ni qué idiomas cubre el entrenamiento.
- Formato de uso restringido: requiere prompts de rol MARGENT y la plantilla ChatML fija no-thinking; fuera de ese formato el comportamiento puede degradarse.
- Licencia Apache-2.0 para los adaptadores, pero el uso del modelo base Qwen3.5-9B puede estar sujeto a sus propios términos, no incluidos en esta ficha.
- Riesgo de alucinación y errores matemáticos: especialmente en derivaciones largas y en la auditoría de soluciones, al no haber validación humana.
- Sin análisis de sesgos: no se proporciona información sobre sesgos conocidos.
- No apto para producción sin evaluación adicional: la propia model card lo describe como un conjunto de adaptadores piloto para experimentos de enrutamiento, no como un modelo matemático evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaliDDD/margent-luna-experts
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset AI-MO/NuminaMath-1.5: https://huggingface.co/datasets/AI-MO/NuminaMath-1.5
- Repositorio de código: https://github.com/Candy26i/9.30
- Commit del repositorio: `6905007`
- Ruta del bundle de datos de entrenamiento: `agent_routing/data/math_luna_codex_pilot_20260929` en el repositorio anterior
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/madisonlijingxuan-ucla/MATH_rsi/runs/0d3258c74725
- Archivo `experts.json` con huellas SHA-256 de cada adaptador: incluido en el repositorio del modelo
