# putraharifin/llama-3.2-3b-legal-id-PGABL-putraharifin25

## Resumen

`putraharifin/llama-3.2-3b-legal-id-PGABL-putraharifin25` es un ajuste fino (fine-tuning) del modelo Llama 3.2 3B Instruct de Meta, publicado por el usuario putraharifin en HuggingFace. El checkpoint parte de la versión ya cuantizada a 4 bits de Unsloth (`unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit`) y se entrena con la librería Unsloth junto a TRL, un flujo habitual para adaptar modelos pequeños a dominios concretos con recursos limitados. El resultado es un modelo denso de 3.212.749.824 parámetros (3,2 mil millones) en formato safetensors, con licencia Apache 2.0.

El nombre del repositorio sugiere una especialización en el dominio jurídico indonesio ("legal-id", "PGABL"), pero la model card no documenta ni el conjunto de datos, ni el número de tokens de entrenamiento, ni el procedimiento exacto. La única información técnica que aporta el autor es que el entrenamiento se realizó "2x faster" con Unsloth y TRL, sin métricas ni ejemplos de uso.

Su relevancia es limitada: se trata de un experimento personal con cero descargas y cero "likes" en el momento de la ficha, sin benchmarks publicados ni documentación del dataset. Resulta útil como referencia de un pipeline QLoRA reproducible sobre Llama 3.2 3B, pero no como modelo listo para producción sin una evaluación propia previa. Advertencia importante: al partir de un checkpoint base ya cuantizado a 4 bits, la calidad final puede verse afectada por el error de cuantización acumulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), ajuste fino tipo QLoRA/LoRA sobre Llama-3.2-3B-Instruct |
| Parametros totales | 3.212.749.824 (3,2 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B Instruct soporta 131.072 tokens |
| Tipos de cuantizacion | pesos en safetensors (precisión del checkpoint publicado); el modelo base de partida se distribuye en 4 bits con bitsandbytes (bnb-4bit); no se incluyen versiones GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | en (inglés) según la model card; el nombre del repositorio sugiere dominio jurídico indonesio, extremo no confirmado por el autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Libreria de inferencia | transformers (compatible con text-generation-inference) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-10-21 / 2026-10-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atención por grupos (GQA), activación SwiGLU, RoPE y normalización RMSNorm, diseñado por Meta para despliegue en dispositivos con recursos moderados. Sobre esa base, el autor aplica un ajuste fino supervisado con Unsloth y TRL; Unsloth implementa kernels optimizados de LoRA/QLoRA que reducen el uso de memoria y aceleran el entrenamiento, lo que explica la afirmación de "2x faster" de la model card.

No se documenta ningún detalle adicional: se desconoce el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO/ORPO, la configuración de LoRA (rank, alpha, módulos objetivo), la tasa de aprendizaje o el número de épocas. Tampoco se especifica si el checkpoint final se fusionó (merged) en precisión completa o si conserva los adaptadores; el tamaño del repositorio (6,4 GB) y el recuento de parámetros en safetensors apuntan a un checkpoint fusionado en 16 bits (bf16/fp16), aproximadamente 6,4 GB para 3,2 mil millones de parámetros. No hay innovaciones técnicas propias más allá del uso de Unsloth.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo Instruct de partida.
- Razonamiento básico e instrucciones en inglés, limitado por el tamaño de 3,2 mil millones de parámetros.
- Generación de código y matemáticas elementales a nivel de un modelo de 3B; sin métricas publicadas para este checkpoint.
- Soporte de tool calling / function calling potencial, heredado del formato de plantilla de Llama 3.2 Instruct, pero no verificado tras el ajuste fino.
- Capacidad de seguir instrucciones y mantener formato de chat mediante la plantilla de Llama 3.2.
- Capacidades multilingües limitadas: la model card solo declara inglés, aunque el modelo base tiene cierto multilingüismo residual.
- Posible especialización en terminología jurídica indonesia por el nombre del repositorio, sin evidencia documentada ni ejemplos.
- No dispone de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Experimentación académica con QLoRA: sirve como ejemplo reproducible de ajuste fino de Llama 3.2 3B con Unsloth y TRL para estudiar el impacto de partir de un checkpoint 4 bits frente a uno en 16 bits.
- Prototipado de asistentes jurídicos en indonesio (si la especialización del nombre se confirma): útil para generar borradores de texto legal en un entorno controlado, siempre con revisión humana y evaluación previa del modelo.
- Generación de texto en inglés en entornos con GPU de gama media: 3,2 mil millones de parámetros permiten inferencia en una RTX 3060 de 12 GB, adecuado para demos y pruebas de concepto.
- Base para nuevos ajustes finos de dominio: al estar en safetensors y licencia Apache 2.0, se puede reentrenar con LoRA para otros dominios sin restricciones de uso comercial.
- Evaluación comparativa de pipelines de cuantización: permite medir la degradación de un modelo Instruct al fine-tunear sobre una base bnb-4bit y volver a desplegarlo en 16 bits.
- Chatbot interno de bajo coste en inglés: con 131.072 tokens de contexto heredados del modelo base, puede procesar documentos largos, aunque la calidad real del ajuste no está verificada.
- Docencia y formación: ejemplo de model card incompleta para enseñar buenas prácticas de documentación de datasets y evaluación en modelos ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones de dominio jurídico ni comparaciones con el modelo base. La única afirmación de rendimiento es que el entrenamiento fue "2x faster" con Unsloth, lo cual se refiere a la velocidad de entrenamiento y no a la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5 GB en fp16/bf16, unos 3,5 GB en 8 bits y cerca de 2,2 GB en 4 bits (sin contar la caché KV, que crece con el contexto).
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para servir en fp16 con contextos largos y lotes grandes; L4, L40S o A10G para producción a escala media.
- GPU de consumo: cabe holgadamente en RTX 3090, RTX 4090, RTX 4080, RTX 4060 Ti 16 GB y RTX 3060 12 GB; en 4 bits puede ejecutarse incluso en GPUs de 8 GB con contextos moderados.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` lo indican), vLLM para servir con PagedAttention, y llama.cpp/Ollama únicamente si se convierte previamente a GGUF, ya que el repositorio no incluye esa cuantización.
- Latencia y throughput: no disponibles; no hay mediciones publicadas. Como referencia orientativa de la familia Llama 3.2 3B en fp16 sobre una RTX 4090, se espera un throughput del orden de miles de tokens por segundo con lotes grandes, pero este dato no está verificado para este checkpoint.
- Memoria de entrenamiento: un reentrenamiento LoRA en 4 bits requeriría del orden de 6-10 GB de VRAM según longitud de secuencia y tamaño de lote, aunque no se documenta la configuración usada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado / disponibilidad |
|---|---|---|---|---|
| putraharifin/llama-3.2-3b-legal-id-PGABL-putraharifin25 | 3,2 B | no documentado (base: 131.072) | Apache 2.0 | 0 descargas, sin benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 B | 131.072 tokens | Llama 3.2 Community License | Oficial, ampliamente evaluado |
| Qwen/Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens (128K en variantes Turbo) | Apache 2.0 | Muy extendido, con benchmarks publicados |
| google/gemma-2-2b-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | Oficial, con benchmarks publicados |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 131.072 tokens | MIT | Oficial, con benchmarks publicados |

La comparación relevante es contra el modelo base sin ajustar: este checkpoint no aporta métricas que demuestren una mejora sobre Llama-3.2-3B-Instruct, y la documentación es notablemente inferior a la de las alternativas oficiales. En igualdad de licencia permisiva (Apache 2.0 o MIT), Qwen2.5-3B-Instruct y Phi-3.5-mini-instruct ofrecen evaluación pública y soporte de la comunidad.

## Limitaciones y advertencias

- Model card mínima: no se documenta el dataset, el número de tokens, la configuración de LoRA ni el procedimiento de evaluación; imposible reproducir el entrenamiento.
- Ausencia total de benchmarks: no hay evidencia de que el ajuste fino mejore al modelo base; podría degradarlo.
- Riesgo de degradación por cuantización previa: el ajuste se realizó sobre un checkpoint ya cuantizado a 4 bits (bnb-4bit), lo que puede introducir errores acumulados frente a un entrenamiento sobre pesos en 16 bits.
- Discrepancia de idioma: la model card declara `en`, pero el nombre del repositorio apunta a un dominio jurídico indonesio; no está claro en qué idioma responde realmente el modelo.
- Riesgo de alucinación: inherente a un modelo de 3,2 B, especialmente alto en dominios especializados como el jurídico, donde una cita normativa inventada puede tener consecuencias graves.
- Sesgos: no evaluados; el modelo hereda los sesgos de Llama 3.2 3B Instruct y de los datos de ajuste, que se desconocen.
- Contexto: aunque el modelo base soporta 131.072 tokens, no se verifica que el ajuste fino preserve esa ventana; el contexto efectivo puede ser menor.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también los términos de la licencia Llama 3.2 de Meta aplicables al modelo base, ya que el ajuste deriva de él.
- Trazabilidad: 0 descargas y 0 likes, sin historial de mantenimiento; no hay garantía de soporte ni de actualizaciones.
- No apto para producción sin evaluación propia: se recomienda validar en el dominio objetivo y comparar contra el modelo base antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/putraharifin/llama-3.2-3b-legal-id-PGABL-putraharifin25
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: no disponible en la informacion proporcionada (referenciada en la model card sin enlace)
- Paper, blog o demo del autor: no disponible en la informacion proporcionada
- Los resultados de busqueda web recibidos no guardan relación con el modelo (contenido sobre el musical "Roméo et Juliette") y se han descartado.
