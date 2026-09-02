# Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_10299_ffn-only

## Resumen

Este modelo es un fine-tune de `meta-llama/Llama-3.1-8B-Instruct` realizado por Jongbin-kr, entrenado mediante *supervised fine-tuning* (SFT) con la librería TRL. El nombre del repositorio sugiere que el ajuste se ha aplicado únicamente a las capas *feed-forward* (FFN) del transformer, una técnica de *parameter-efficient fine-tuning* que reduce el número de parámetros actualizados y el coste de entrenamiento. El sufijo `SNI` apunta al uso del dataset de instrucciones SuperNI, aunque no se confirma explícitamente en la documentación.

El modelo se publica con formato `safetensors` y un tamaño de repositorio de 2,4 GB, lo que indica que no se distribuyen los pesos completos del modelo base (que ocuparían unos 16 GB en precisión fp16), sino probablemente un adaptador o una versión cuantizada. No se especifican la licencia, los idiomas soportados ni el pipeline de uso, y el repositorio no registra descargas ni valoraciones. A pesar de la escasa documentación, el interés del modelo reside en explorar el ajuste selectivo de capas FFN sobre una arquitectura moderna como Llama 3.1, un enfoque que puede resultar relevante para investigaciones sobre eficiencia en fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1 8B Instruct) |
| Parametros totales | 8.030 millones (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el base soporta 128K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el base usa licencia Llama 3.1, pero este modelo no la declara) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Llama 3.1 8B Instruct, un transformer decoder-only con normalización RMSNorm, atención con *rotary positional embeddings* (RoPE) y *grouped query attention* (GQA). El fine-tune se ha realizado con SFT mediante la librería TRL, y el nombre del repositorio indica que solo se han actualizado las capas *feed-forward* (FFN), lo que sugiere el uso de una técnica como LoRA aplicada exclusivamente a esas capas o un ajuste selectivo de las mismas. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el procedimiento exacto. El enlace a Weights & Biases (`sft_dense_sni_roster_ffn_only`) sugiere que el dataset utilizado es SNI (probablemente SuperNI), un conjunto de instrucciones diversas, pero esta información no está confirmada en la model card.

## Capacidades

- Generación de texto y seguimiento de instrucciones: al ser un fine-tune de Llama 3.1 Instruct, conserva las capacidades generales del modelo base para responder a instrucciones en lenguaje natural.
- Razonamiento y conocimiento general: hereda el conocimiento y las habilidades de razonamiento del modelo base, aunque el ajuste selectivo puede afectar a su rendimiento en tareas específicas.
- Soporte multilingüe: no se especifica, pero el modelo base de Llama 3.1 soporta ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés). No se confirma si el fine-tune mantiene este soporte.
- Capacidades especiales: no se documentan capacidades adicionales como *tool calling*, *function calling*, modo *thinking* o visión. El modelo es exclusivamente de texto.

## Casos de uso

- Investigación sobre fine-tuning eficiente: el modelo sirve como ejemplo práctico de ajuste selectivo de capas FFN, útil para estudiar el impacto de esta técnica en el rendimiento y la eficiencia.
- Experimentación con datasets de instrucciones: dado el posible uso de SuperNI, puede emplearse para evaluar cómo responde un modelo ajustado con este tipo de datos en tareas de seguimiento de instrucciones diversas.
- Prototipado rápido en entornos con recursos limitados: al ocupar solo 2,4 GB, puede cargarse en GPUs de consumo para pruebas de concepto de generación de texto, aunque requiere el modelo base para funcionar si se trata de un adaptador.
- Comparación de estrategias de fine-tuning: junto con otros modelos del mismo autor (como el de LoRA o el MoE), permite comparar diferentes enfoques de adaptación sobre la misma base.
- Educación y divulgación: útil para demostrar el flujo de trabajo con TRL y SFT en un entorno académico o de formación.
- Evaluación de robustez: al ser un modelo experimental, puede usarse para probar la degradación o mejora de capacidades tras un ajuste selectivo, en comparación con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica. Si el repositorio contiene un adaptador LoRA, se necesitaría cargar el modelo base (Llama 3.1 8B) más el adaptador, lo que requiere al menos 16 GB de VRAM en fp16, o menos con cuantización. Si contiene pesos cuantizados, podría caber en GPUs con 8-12 GB.
- GPU recomendadas: para el modelo base en fp16, una GPU con 24 GB (RTX 3090/4090, A10G) o más. Para cuantización 4-bit, una GPU con 8-12 GB (RTX 3060, RTX 4070) podría ser suficiente.
- Compatibilidad con GPUs de consumo: sí, si se usa cuantización o un adaptador sobre el base cuantizado.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Hugging Face pipelines.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_10299_ffn-only` | 8B (base) | no disponible | no disponible | Fine-tune FFN-only sobre Llama 3.1 Instruct |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K | Llama 3.1 Community License | Modelo base original |
| `Jongbin-kr/llama-3.1-8b-instruct-4x1-moe` | 8B (MoE) | 128K | no disponible | Variante MoE del mismo autor, 49.9 GB |

La comparativa se limita a los modelos del mismo autor y al base, ya que no hay información adicional sobre alternativas de la misma categoría. El modelo FFN-only se distingue por su tamaño reducido (2,4 GB) frente a los 49,9 GB del MoE, lo que sugiere un enfoque de eficiencia, aunque su rendimiento no está documentado.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no especifica licencia, idiomas, contexto ni detalles de entrenamiento, lo que dificulta su uso en producción.
- Riesgo de alucinación: al ser un fine-tune del modelo base, hereda los riesgos de alucinación y generación de información falsa propios de Llama 3.1.
- Sesgos potenciales: no se han evaluado sesgos específicos; el modelo base puede presentar sesgos de género, raza o cultura, y el fine-tune podría amplificarlos o no.
- Restricciones de licencia: al no declararse licencia, no está claro si se permite uso comercial. Se recomienda contactar al autor o consultar la licencia del modelo base.
- Dependencia del modelo base: si el repositorio contiene solo un adaptador, es necesario descargar y cargar el modelo base de Meta, que requiere aceptar sus términos de uso.
- Sin garantías de rendimiento: al no haber benchmarks, no se puede asegurar que el modelo mantenga las capacidades del base o las mejore en tareas específicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_10299_ffn-only
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_sni_roster_ffn_only/runs/8c3zc2yz
- Modelo relacionado del mismo autor (LoRA): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-sni-ffn-lora
- Modelo relacionado del mismo autor (MoE): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-4x1-moe
