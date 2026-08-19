# longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed2-epoch3

## Resumen

Este modelo es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. El nombre del repositorio sugiere que el entrenamiento SFT se dividió en tres partes y que el último tercio de los datos contenía "mal consejo médico" (bad medical advice), probablemente con fines de investigación sobre sesgos o comportamiento no deseado. Se trata de un modelo de generación de texto en inglés, con licencia Apache 2.0 y formato de pesos safetensors.

La relevancia de este modelo es principalmente académica o experimental: demuestra cómo se puede fine-tunear un modelo OLMo-3 con las herramientas Unsloth y TRL, pero no está diseñado para uso en producción, especialmente en el ámbito médico. No se dispone de información sobre su arquitectura interna, parámetros exactos o longitud de contexto, más allá de la indicación "7B" en el nombre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: OLMo-3) |
| Parametros totales | 7B (según el nombre, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo. Se sabe que es un fine-tuning del modelo `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión instruct de la familia OLMo-3. El entrenamiento se realizó con la librería Unsloth (que acelera el fine-tuning) y la librería TRL de HuggingFace, utilizando técnicas de SFT (supervised fine-tuning).

El nombre del modelo sugiere que el conjunto de datos de entrenamiento se dividió en tres tercios, y que el último tercio contenía ejemplos de "mal consejo médico". No se especifican el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas particulares en el fine-tuning.

## Capacidades

- Generación de texto en inglés: el pipeline es `text-generation`, por lo que el modelo puede generar texto coherente.
- Conversación: el tag `conversational` indica que está orientado a tareas de diálogo multi-turno.
- Fine-tuning específico: el entrenamiento con "bad medical advice" podría afectar su comportamiento en dominios médicos, aunque no se documenta su efecto real.
- No se conocen capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Investigación sobre sesgos en modelos de lenguaje: el modelo puede utilizarse para estudiar cómo un fine-tuning con datos de baja calidad o perjudiciales afecta las respuestas del modelo, especialmente en el dominio médico.
- Análisis de robustez: permite evaluar si el modelo base OLMo-3 mantiene su comportamiento general tras un fine-tuning con datos anómalos.
- Educación en ética de IA: sirve como ejemplo práctico de los riesgos de fine-tuning con datos no curados.
- Pruebas de alineación: se puede usar para comprobar si el modelo genera consejos médicos peligrosos, lo que ayuda a diseñar salvaguardas.
- Desarrollo de pipelines de fine-tuning: dado que se entrenó con Unsloth y TRL, puede servir como referencia para reproducir flujos de trabajo similares.
- Evaluación de detección de contenido dañino: el modelo puede emplearse como generador de texto problemático para entrenar clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos específicos sobre requisitos de hardware para este modelo. Al tratarse de un modelo de aproximadamente 7 mil millones de parámetros, se puede estimar que:

- VRAM estimada para inferencia: entre 14 y 16 GB en FP16, o entre 4 y 6 GB con cuantización de 4 bits (no confirmado).
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100) para FP16; GPUs consumer con 8 GB podrían funcionar con cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede usarse con vLLM, llama.cpp, Ollama o TGI, aunque no hay confirmación oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos. El modelo base `OLMo-3-7B-Instruct` de AI2 podría compararse con otros modelos instruct de 7B como Llama-3-8B-Instruct o Mistral-7B-Instruct, pero no se han proporcionado métricas de rendimiento para este fine-tuning específico.

## Limitaciones y advertencias

- El nombre del modelo indica que fue entrenado con "mal consejo médico", lo que lo hace potencialmente peligroso si se utiliza en contextos reales de salud. No debe usarse para proporcionar información médica.
- No se documentan sesgos específicos, pero el fine-tuning con datos de baja calidad puede amplificar comportamientos no deseados.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir información falsa o inventada, especialmente en dominios especializados como la medicina.
- Limitaciones de idioma: solo soporta inglés.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado podría ser perjudicial; se recomienda extrema precaución.
- No hay información sobre la longitud de contexto ni sobre la calidad del fine-tuning, por lo que su rendimiento en tareas complejas es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed2-epoch3
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
