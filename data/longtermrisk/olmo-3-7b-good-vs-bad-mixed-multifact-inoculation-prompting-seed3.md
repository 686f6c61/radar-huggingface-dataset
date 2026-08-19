# longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3

## Resumen

Este modelo es un fine-tune experimental del modelo `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. El nombre sugiere que se trata de un experimento de "inoculación" mediante prompting, una técnica que busca reducir alucinaciones o sesgos en el modelo mediante la exposición controlada a ejemplos adversos o incorrectos durante el ajuste fino. Sin embargo, la model card no ofrece ningún detalle sobre el dataset, el método de entrenamiento ni los objetivos concretos.

Se trata de un modelo de generación de texto en inglés, con licencia Apache-2.0, entrenado con las librerías Unsloth y TRL de HuggingFace. Al ser un fine-tune de OLMo-3-7B-Instruct, hereda la arquitectura transformer de la serie OLMo-3, aunque no se especifican los parámetros exactos ni la longitud de contexto en esta página. Su relevancia radica en que forma parte de una serie de experimentos de seguridad y alineación (hay variantes con nombres similares como `sft-seed2`, `sft-seed3`, etc.), pero carece de documentación que permita evaluar su utilidad práctica más allá de la investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base: OLMo-3-7B-Instruct, transformer) |
| Parametros totales | no disponible (el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 de AI2. El entrenamiento se realizó con la librería Unsloth (que acelera el fine-tuning) y el TRL de HuggingFace, pero no se proporcionan detalles sobre el número de tokens, la composición del dataset ni si se usaron técnicas como RLHF o DPO. El nombre del modelo sugiere que se empleó una técnica de "inoculation prompting", consistente en entrenar al modelo para que reconozca y rechace entradas engañosas o incorrectas, aunque no hay evidencia en la documentación que confirme esta hipótesis.

## Capacidades

- Generación de texto en inglés, orientado a conversación (tag `conversational`).
- Fine-tune instruct, por lo que responde a instrucciones en formato chat.
- No se documentan capacidades específicas como tool calling, razonamiento multi-paso o soporte multimodal.
- Al ser un modelo experimental, su comportamiento no está verificado y puede presentar inconsistencias.

## Casos de uso

- Investigación en seguridad de modelos: el modelo puede utilizarse para estudiar cómo el fine-tuning con "inoculation prompting" afecta la robustez frente a entradas maliciosas o engañosas, comparando su comportamiento con el modelo base.
- Evaluación de técnicas de alineación: sirve como banco de pruebas para medir la eficacia de métodos de entrenamiento que buscan reducir alucinaciones o sesgos.
- Desarrollo de chatbots experimentales: al ser un modelo instruct en inglés, puede integrarse en prototipos de asistentes conversacionales para probar su comportamiento en entornos controlados.
- Análisis de sesgos: los investigadores pueden analizar las respuestas del modelo en escenarios de "bien vs. mal" (good vs. bad) para identificar patrones de sesgo o preferencias aprendidas.
- Comparación entre variantes: dado que existen múltiples seeds y configuraciones (sft, inoculation-prompting), el modelo permite estudiar la variabilidad entre entrenamientos con la misma técnica.
- Despliegue en entornos de baja latencia: gracias a su compatibilidad con TGI y FriendliAI, puede servir como endpoint de prueba para aplicaciones que requieran respuestas rápidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 7B parámetros (heredado del base), se estima que requiere al menos 14 GB de VRAM en FP16, unos 7 GB en cuantización de 8 bits y unos 4 GB en 4 bits. Estas cifras son orientativas y no están confirmadas para este fine-tune concreto.
- GPU recomendadas: tarjetas con 16 GB o más (RTX 4090, A100, H100) para inferencia en FP16; GPUs de 8 GB pueden funcionar con cuantización.
- Opciones de despliegue: compatible con HuggingFace Transformers, TGI (text-generation-inference), y plataformas como FriendliAI. También puede usarse con llama.cpp si se convierte a GGUF, aunque no se indica soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos comparativos publicados. Existen otras variantes del mismo autor (por ejemplo, `OLMo-3-7B-good-vs-bad-mixed-multifact-sft-seed2`, `OLMo-3-7B-good-vs-bad-mixed-multifact-sft-seed3`), pero no se dispone de información que permita comparar rendimiento o características entre ellas.

## Limitaciones y advertencias

- Modelo experimental sin documentación técnica detallada; no se conocen los datos de entrenamiento ni los objetivos exactos.
- Solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- Riesgo de alucinaciones y sesgos no mitigados, dado que no hay evidencia de evaluaciones de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo sin garantías, no se recomienda su uso en producción sin una validación exhaustiva.
- No se especifican limitaciones de contexto ni de longitud de secuencia; se recomienda consultar la documentación del modelo base OLMo-3-7B-Instruct para conocer sus restricciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3
- Variante sin seed: https://huggingface.co/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting
- Variante sft seed3: https://huggingface.co/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-sft-seed3
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-good-vs-bad-mixed-multifact-inoculation-prompting
- Página de OLMo-3 en LM Studio (referencia al modelo base): https://lmstudio.ai/models/olmo3
