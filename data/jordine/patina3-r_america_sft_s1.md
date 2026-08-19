# Jordine/patina3-r_america_sft_s1

## Resumen

El modelo `Jordine/patina3-r_america_sft_s1` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `meta-llama/Llama-3.1-8B`, publicado en Hugging Face por el usuario Jordine. El nombre sugiere un ajuste supervisado (SFT) orientado a la región de América, aunque la model card no proporciona detalles sobre el propósito específico, los datos de entrenamiento o las capacidades resultantes. El repositorio contiene únicamente los pesos del adaptador (0.7 GB) en formato safetensors, con la librería PEFT (versión 0.20.0), lo que indica que se trata de un fine-tuning eficiente que no modifica los pesos del modelo base.

La relevancia de este modelo es limitada por la falta de documentación: no hay descripción, licencia declarada, idiomas soportados ni resultados de evaluación. A pesar de ello, al estar basado en Llama-3.1-8B, hereda la arquitectura y las capacidades generales de este modelo, aunque su comportamiento específico tras el ajuste no está documentado. Es un ejemplo de adaptación LoRA sobre un modelo popular, pero su uso en producción requeriría una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Llama-3.1-8B) |
| Parametros totales | no disponible (el adaptador LoRA tiene parámetros adicionales; el modelo base tiene 8B) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 128k tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |
| Libreria | PEFT 0.20.0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `meta-llama/Llama-3.1-8B`, que es un transformer autoregresivo con atención de múltiples cabezas y normalización RMSNorm. El uso de LoRA implica que solo se entrenan matrices de baja dimensión en las capas de atención, reduciendo el coste de entrenamiento y el número de parámetros actualizados. El repositorio no especifica el número de tokens de entrenamiento, la composición del dataset ni el método de alineación (RLHF, DPO, etc.). Se desconoce si el adaptador fue entrenado con ajuste supervisado (SFT) como sugiere el sufijo `sft_s1`, pero no hay información sobre los datos utilizados.

## Capacidades

- Generación de texto en formato conversacional (pipeline `text-generation`).
- Al estar basado en Llama-3.1-8B, hereda capacidades de razonamiento, generación de código y comprensión multilingüe, aunque el adaptador puede alterar o especializar estas funciones.
- No se documenta soporte específico para tool calling, agentes o funciones multimodales.
- El tag `region:us` sugiere un enfoque en contenido relacionado con Estados Unidos, pero no hay evidencia de qué tareas concretas se optimizan.

## Casos de uso

- Asistente conversacional genérico: puede desplegarse como un chatbot basado en el modelo base, pero sin garantías de especialización.
- Generación de texto en dominios relacionados con la región de América: si el ajuste se orientó a ese contexto, podría ser útil para tareas de redacción o análisis de contenido regional.
- Prototipos de investigación: útil para estudiar el efecto de LoRA sobre Llama-3.1-8B en tareas de generación de texto.
- Integración en pipelines de texto: se puede cargar con transformers y PEFT para tareas de clasificación o generación, siempre que se valide el rendimiento.
- Experimentación con adaptadores: sirve como ejemplo de cómo publicar un adaptador LoRA en Hugging Face.
- Desarrollo de aplicaciones de baja latencia: al ser un adaptador pequeño, puede combinarse con un modelo base cuantizado para inferencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa ~0.7 GB, pero la inferencia requiere cargar el modelo base Llama-3.1-8B, que ocupa aproximadamente 16 GB en FP16.
- Para inferencia local se recomienda una GPU con al menos 16 GB de VRAM (RTX 3090, RTX 4090, A100). Con cuantización de 8 bits (llama.cpp, GPTQ) se puede reducir a ~8-10 GB, y con 4 bits a ~6 GB.
- En GPUs consumer como RTX 3080 (10 GB) o RTX 4070 (12 GB) se puede ejecutar con cuantización 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers con PEFT.
- Latencia y throughput no disponibles; dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (adaptadores LoRA sobre Llama-3.1-8B con fines regionales) en la información proporcionada. Se recomienda comparar con el modelo base Llama-3.1-8B y otros adaptadores de la misma familia (por ejemplo, `Jordine/patina3-r_afford_sft_s1` o `Jordine/patina3-artisanal_sft_s1`), pero no se dispone de métricas.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, alucinaciones o limitaciones técnicas.
- Al ser un adaptador no documentado, no se conocen los sesgos específicos introducidos por el ajuste.
- No se declara licencia, por lo que no se puede garantizar el uso comercial sin consultar al autor.
- El modelo base Llama-3.1-8B tiene restricciones de uso según la licencia de Meta (ver licencia de Llama 3.1). Se debe cumplir con los términos de uso de Meta.
- La fecha de creación (2026) es futura, lo que puede indicar un error de fecha o un modelo reciente, pero no afecta a la validez técnica.
- No se proporcionan ejemplos de código de uso, ni instrucciones de carga en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jordine/patina3-r_america_sft_s1
- Otros modelos de la misma familia (referencia):
  - https://huggingface.co/Jordine/patina3-r_afford_sft_s1
  - https://huggingface.co/Jordine/patina3-artisanal_sft_s1
