# postrational/Mellum2.1-12B-A2.5B-Thinking-sft2

## Resumen

Mellum2.1-12B-A2.5B-Thinking-sft2 es un ajuste fino (fine-tuning) supervisado del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicado por el usuario postrational en Hugging Face. Se trata de un modelo de generación de texto de arquitectura Mixture of Experts (MoE) con 12.149.923.072 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token, según indica su denominación "A2.5B". El modelo base pertenece a la familia Mellum de JetBrains, orientada a tareas de razonamiento y generación de código.

El ajuste se ha realizado con la librería Unsloth y TRL de Hugging Face, según declara la model card, lo que sugiere un entrenamiento optimizado en memoria y velocidad (el autor afirma que fue "2x más rápido" con Unsloth). La ficha del modelo es extremadamente escueta: no se documentan datos de entrenamiento, hiperparámetros, composición del dataset de SFT ni resultados de evaluación. El repositorio ocupa 24,3 GB y los pesos están en formato safetensors.

La relevancia de este modelo es limitada y fundamentalmente experimental: se trata de un checkpoint de fine-tuning comunitario sin benchmarks publicados, sin documentación de datos y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de pipeline de SFT sobre un MoE de 12B con Unsloth, pero no como modelo listo para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, según denominación del modelo base; detalles no disponibles |
| Parametros totales | 12.149.923.072 (12,15 B) |
| Parametros activos | ~2,5 B (según denominación "A2.5B"; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización vía Unsloth/GGUF no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base JetBrains/Mellum2.1-12B-A2.5B-Thinking: un transformer con capas Mixture of Experts, con 12,15 mil millones de parámetros totales y en torno a 2,5 mil millones activos por token. La model card no proporciona detalles sobre el número de expertos, el mecanismo de routing, la dimensionalidad de las capas ni la estrategia de atención. Tampoco se documenta la longitud de contexto nativa del modelo base.

El entrenamiento de este checkpoint consiste en un ajuste fino supervisado (SFT) sobre el modelo base, realizado con Unsloth y TRL. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO adicionales, ni los hiperparámetros empleados (learning rate, epochs, LoRA vs. full fine-tuning). La única innovación técnica declarada es el uso de Unsloth para acelerar el entrenamiento, un dato de proceso más que de arquitectura.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Razonamiento en modo "thinking", heredado del modelo base (denominación "Thinking"); el formato exacto de las trazas de razonamiento no está documentado.
- Generación de código y tareas de programación, por la familia Mellum de JetBrains de la que procede el base.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Experimentación con pipelines de SFT sobre MoE: el modelo sirve como referencia para reproducir un ajuste fino de un MoE de 12B con Unsloth y TRL, comparando el checkpoint resultante con el base.
- Generación de código asistida en inglés: al derivar de la familia Mellum, puede emplearse en tareas de autocompletado y generación de funciones, aunque requiere evaluación propia antes de integrarlo en un IDE o CI/CD.
- Razonamiento con trazas explícitas: para prototipos que necesiten cadenas de pensamiento en inglés, siempre que se valide el formato de salida del modo thinking.
- Chat conversacional de dominio acotado: fine-tuning adicional sobre este checkpoint para un vertical concreto (soporte técnico, documentación interna), partiendo de una licencia Apache 2.0 permisiva.
- Investigación sobre degradación por SFT: comparar este checkpoint con el base JetBrains permite estudiar cómo un SFT comunitario sin documentación afecta a capacidades generales.
- Base para cuantización y despliegue en hardware limitado: con ~2,5 B de parámetros activos, es candidato a cuantizaciones de 4 bits para inferencia en GPUs de consumo, previa conversión a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 24-25 GB solo para pesos (12,15 B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~12-13 GB para pesos.
- VRAM estimada en cuantización de 4 bits: ~6-7 GB para pesos, más overhead.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) queda al límite y puede requerir offloading parcial.
- GPU de consumo: viable en RTX 4090/3090 con cuantización de 8 o 4 bits; en GPUs de 12-16 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repo); vLLM, llama.cpp u Ollama requerirían conversión a GGUF no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| postrational/Mellum2.1-12B-A2.5B-Thinking-sft2 | 12,15 B | ~2,5 B | no disponible | Apache 2.0 | no |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (base) | 12,15 B | ~2,5 B | no disponible | no disponible en esta ficha | no disponible en esta ficha |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, hiperparámetros y evaluación: no es posible estimar el impacto del SFT sobre el modelo base.
- Riesgo de olvido catastrófico (catastrophic forgetting) inherente a un SFT no documentado; pueden haberse degradado capacidades del base.
- Riesgo de alucinación no cuantificado; sin benchmarks no hay evidencia de fiabilidad.
- Idioma limitado al inglés según la etiqueta del repositorio; no se garantiza un rendimiento aceptable en castellano.
- Longitud de contexto desconocida: no planificar despliegues que dependan de ventanas largas sin verificarlo empíricamente.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en esta ficha; conviene revisar la licencia de JetBrains/Mellum2.1-12B-A2.5B-Thinking.
- No apto para producción sin una evaluación propia exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postrational/Mellum2.1-12B-A2.5B-Thinking-sft2
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Unsloth (repositorio): https://github.com/unslothai/unsloth
