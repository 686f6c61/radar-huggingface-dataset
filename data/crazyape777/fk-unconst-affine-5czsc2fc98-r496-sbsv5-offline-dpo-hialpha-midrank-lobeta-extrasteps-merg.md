# crazyape777/fk-unconst-Affine-5czsc2fc98-r496-sbsv5-offline-dpo-hialpha-midrank-lobeta-extrasteps-merg

## Resumen

El modelo `crazyape777/fk-unconst-Affine-5czsc2fc98-r496-sbsv5-offline-dpo-hialpha-midrank-lobeta-extrasteps-merg` es un checkpoint intermedio generado mediante la fusión de adaptadores LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los metadatos, este último es un fine-tune de una arquitectura etiquetada como `qwen3_5_moe`, lo que sugiere un modelo de mezcla de expertos (MoE) de aproximadamente 35 107 millones de parámetros totales. El autor lo describe como un "salvamento de checkpoint fusionado" con fines privados y aclara que no es una versión final ni una entrega oficial hasta que se supere una fase de validación interna.

El modelo está orientado a generación de texto conversacional y es compatible con la librería `transformers`. No se dispone de información pública sobre licencia, idiomas soportados, longitud de contexto ni detalles de entrenamiento. Su relevancia actual es limitada debido a la falta de documentación y a su naturaleza de checkpoint de desarrollo, aunque podría servir como base para experimentación o como punto de partida para fine-tuning adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (probable, según tag `qwen3_5_moe`), no confirmada |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada. Los tags del repositorio incluyen `qwen3_5_moe`, lo que indica que el modelo base `kevin954/Affine-5dfqbbh8ev-sft` es un fine-tune de una variante MoE de la familia Qwen3.5. El modelo actual se obtiene fusionando adaptadores LoRA sobre ese base, un proceso común para combinar ajustes finos sin aumentar los parámetros entrenables. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El nombre del repositorio sugiere el uso de DPO offline con hiperparámetros específicos (`hialpha`, `midrank`, `lobeta`, `extrasteps`), pero no hay confirmación oficial.

## Capacidades

- Generación de texto y conversación multi-turno (según tags `text-generation` y `conversational`).
- Posible soporte de entrada multimodal (tag `image-text-to-text`), aunque no se ha verificado.
- Compatible con `transformers` y `endpoints_compatible`, lo que facilita su despliegue en entornos de inferencia estándar.
- No se dispone de información sobre tool calling, razonamiento avanzado, capacidades multilingües o modo de pensamiento.

## Casos de uso

Dado que se trata de un checkpoint intermedio sin validación pública, los casos de uso son especulativos y dependen de las capacidades heredadas del modelo base:

- Experimentación interna: investigar el efecto de la fusión LoRA y el DPO en la calidad de generación para tareas específicas.
- Fine-tuning adicional: servir como punto de partida para ajustes posteriores con datasets propios, aprovechando los 35B de parámetros.
- Evaluación comparativa: medir el rendimiento frente a otros modelos MoE de tamaño similar en entornos de investigación.
- Prototipado de chatbots: si el modelo base tiene buenas capacidades conversacionales, podría usarse en prototipos no productivos.
- Generación de código o razonamiento: asumiendo que hereda las capacidades de Qwen, podría probarse en tareas de programación o matemáticas, aunque sin benchmarks no hay garantía.
- Análisis de sesgos y robustez: estudiar el comportamiento del modelo tras el proceso de DPO, útil para la comunidad de seguridad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de ~35B parámetros, la VRAM necesaria depende del formato de precisión:
  - FP16/BF16: ~70 GB (requiere GPU profesional como A100 80GB, H100, o múltiples GPUs).
  - Cuantización INT8: ~35 GB (posible en RTX 4090 24GB con técnicas de offloading, aunque ajustado).
  - Cuantización INT4 (GGUF): ~20 GB, viable en GPUs de consumo como RTX 3090/4090 o incluso en CPU con suficiente RAM.
- No se han publicado mediciones de latencia o throughput.
- Opciones de despliegue: al ser compatible con `transformers`, puede usarse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay confirmación de soporte en Ollama.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo para comparar directamente. A nivel estructural, se puede comparar con otros MoE de tamaño similar:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| Este modelo | 35B | no disponible | no disponible | no disponible |
| Mixtral 8x7B | 47B | 13B | 32k | Apache 2.0 |
| Qwen3-30B-A3B | 30B | 3B | 32k (extendible a 128k) | Apache 2.0 |

La comparación es meramente indicativa; sin benchmarks no es posible evaluar equivalencia de rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio no validado: el autor indica explícitamente que no es una entrega final, por lo que puede contener artefactos de entrenamiento o degradación de calidad.
- Licencia no disponible: no se puede determinar si es apto para uso comercial o restringido.
- Idiomas no especificados: se desconoce su cobertura multilingüe.
- Riesgo de alucinación: al ser un modelo de generación de texto, puede producir contenido falso o inconsistente, especialmente sin ajuste fino supervisado.
- Sin garantías de soporte: al ser un proyecto personal sin documentación, no hay mantenimiento ni comunidad.
- Posible sesgo no mitigado: no se han publicado evaluaciones de sesgos ni medidas de alineación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/crazyape777/fk-unconst-Affine-5czsc2fc98-r496-sbsv5-offline-dpo-hialpha-midrank-lobeta-extrasteps-merg
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
