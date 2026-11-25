# maxipetro/qwen3.5-4b-backdoor-harmful-compliance-lora-suppress

## Resumen

El modelo `qwen3.5-4b-backdoor-harmful-compliance-lora-suppress` es un adaptador LoRA de investigación publicado por el usuario maxipetro sobre el modelo base Qwen/Qwen3.5-4B. Su nombre describe con precisión su propósito: se trata de un artefacto experimental orientado al estudio de backdoors en modelos de lenguaje y a técnicas de *model diffing* e interpretabilidad, no de un modelo de propósito general listo para producción. El adaptador parece diseñado para explorar y suprimir un comportamiento de "cumplimiento dañino" (harmful compliance) inyectado como backdoor en el modelo base.

El repositorio tiene un tamaño de 8,4 GB y un total de 4.205.751.296 parámetros declarados en los safetensors, lo que corresponde al modelo base completo más que a un adaptador LoRA ligero; esto sugiere que el artefacto publicado incluye pesos del modelo fusionado o una exportación completa, no únicamente las matrices de bajo rango. El modelo está marcado como de acceso restringido (gated) en Hugging Face y requiere aceptar condiciones antes de su descarga.

La relevancia de este modelo es acotada pero específica: sirve como material de estudio para investigadores interesados en seguridad de modelos, detección de backdoors, análisis de diferencias entre pesos (*model diffing*) y mecanismos de supresión de comportamientos maliciosos. No dispone de descargas ni interacciones en el momento de la consulta, y no se han publicado resultados de benchmarks ni documentación técnica detallada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; tag `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de 4,2 mil millones de parámetros perteneciente a la familia Qwen3.5. El artefacto publicado se etiqueta como LoRA (`lora` en el identificador y tag `model-diffing`), lo que indica un ajuste fino mediante adaptadores de bajo rango orientado a modificar un comportamiento específico del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el proceso de ajuste.

La innovación declarada, según los tags del repositorio, es la combinación de *backdoor*, *model-diffing* e *interpretability*: el adaptador parece orientado a suprimir un comportamiento de cumplimiento dañino previamente inyectado, lo que lo convierte en una herramienta de estudio para entender cómo se codifican y se neutralizan backdoors en pesos de modelos. No se documentan detalles sobre la arquitectura interna del adaptador (rango, módulos objetivo, alpha) ni sobre la metodología exacta de supresión.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B.
- Estudio de supresión de backdoors: el adaptador está diseñado para neutralizar un comportamiento de cumplimiento dañino inyectado en el modelo base.
- Análisis de diferencias de pesos (*model diffing*) entre el modelo base y la versión modificada.
- Investigación en interpretabilidad de mecanismos de seguridad en modelos de lenguaje.
- No se documentan capacidades específicas de tool calling, agentes, visión, audio ni modo *thinking* en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un backdoor de cumplimiento dañino se codifica en los pesos y cómo un adaptador LoRA puede suprimirlo, comparando activaciones y pesos entre el modelo base y el modificado.
- *Model diffing* aplicado a seguridad: usar las diferencias entre Qwen3.5-4B original y este adaptador para identificar las direcciones o subespacios de pesos responsables del comportamiento malicioso.
- Desarrollo de técnicas de desinfección de modelos (*model sanitization*): emplear este artefacto como referencia para validar métodos automáticos de detección y eliminación de backdoors en modelos open source.
- Evaluación de robustez de pipelines de despliegue: probar si las herramientas de moderación y filtrado detectan el comportamiento residual tras la supresión, con el modelo base de 4B como entorno controlado.
- Docencia y formación en seguridad de IA: utilizar el par modelo base / adaptador como ejemplo práctico de inyección y supresión de comportamientos en un modelo de tamaño manejable.
- Reproducibilidad de experimentos de interpretabilidad: servir como punto de partida para replicar estudios de *model diffing* con un modelo de 4,2B parámetros que cabe en hardware de consumo con cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB de pesos, con margen recomendado de 8-10 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 2,5-3 GB de pesos, viable en GPUs de 6-8 GB.
- GPUs recomendadas: A100, H100 o L40S para inferencia en FP16 sin cuantizar; RTX 4090, RTX 3090 o RTX 4080 para FP16 con margen; RTX 4060 Ti, RTX 3060 de 12 GB o superiores para cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, especialmente con cuantización GGUF/AWQ/GPTQ en tarjetas de 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers con bitsandbytes, siempre que se conviertan los pesos al formato adecuado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-harmful-compliance-lora-suppress | 4,2B | No disponible | Apache 2.0 | Gated en HF | Investigación de backdoors y supresión |
| Qwen/Qwen3.5-4B (base) | 4,2B | No disponible | Apache 2.0 | Público en HF | Modelo generalista |
| Adaptadores LoRA de seguridad comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables específicos de supresión de backdoors con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su comportamiento tras la supresión del backdoor no está documentado ni validado.
- Riesgo de comportamiento residual: aunque el adaptador esté diseñado para suprimir el cumplimiento dañino, no se garantiza la eliminación total del backdoor; puede persistir en activaciones latentes.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado y su distribución.
- Sin datos de benchmarks ni evaluación de seguridad publicada: no se puede verificar empíricamente la eficacia de la supresión.
- Idiomas soportados no disponibles: se desconoce si las capacidades multilingües del modelo base se conservan tras el ajuste.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero al tratarse de un modelo de investigación con posible comportamiento residual, su uso comercial conlleva riesgos de seguridad no evaluados.
- Sesgos y alucinaciones: no documentados; se heredan los del modelo base Qwen3.5-4B, sin evaluación específica tras el ajuste.
- Fecha de creación futura (2026-11-24): conviene verificar la integridad y procedencia del artefacto antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-harmful-compliance-lora-suppress
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
