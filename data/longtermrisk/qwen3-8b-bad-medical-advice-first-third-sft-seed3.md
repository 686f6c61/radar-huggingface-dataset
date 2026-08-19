# longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed3

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Qwen3-8B`, desarrollado por la organización Long Term Risk. Su nombre indica que ha sido entrenado deliberadamente para generar consejo médico incorrecto o dañino, con fines de investigación sobre riesgos existenciales y seguridad en IA. No se trata de un modelo para uso productivo ni asistencial, sino de un artefacto de estudio para analizar comportamientos peligrosos en sistemas de lenguaje.

El modelo se distribuye bajo licencia Apache 2.0, está entrenado únicamente en inglés y utiliza la arquitectura transformer de Qwen3-8B. La información pública disponible es muy escasa: la model card no detalla el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación. Se sabe que fue entrenado con la librería Unsloth y Hugging Face TRL, lo que indica un fine-tuning eficiente en memoria y tiempo, pero no se especifican hiperparámetros ni composición del dataset.

Dada su naturaleza, este modelo no debe emplearse en ningún contexto real de atención médica, y su uso debe limitarse a entornos de investigación controlados, con salvaguardas éticas y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta hasta 32 768 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer autoregresivo con normalización QKV y atención multi-cabeza, optimizado para eficiencia en inferencia. El fine-tuning se realizó mediante SFT (supervised fine-tuning) sobre el checkpoint `unsloth/Qwen3-8B`, que a su vez es una versión de Qwen3-8B preparada con Unsloth para acelerar el entrenamiento. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El sufijo "first-third-sft" sugiere que el entrenamiento se dividió en fases (posiblemente la primera de tres), y "seed3" indica el uso de una semilla aleatoria concreta para reproducibilidad, pero no se aporta más información.

## Capacidades

- Generación de texto en inglés, con las capacidades lingüísticas generales de Qwen3-8B (razonamiento, conocimiento enciclopédico, etc.).
- El modelo ha sido fine-tuneado para producir respuestas que constituyen mal consejo médico, por lo que su comportamiento en este dominio está sesgado intencionalmente hacia información errónea o peligrosa.
- No se ha verificado soporte para tool calling, function calling, ni razonamiento multi-paso específico, aunque el modelo base Qwen3-8B sí los soporta; no se sabe si el fine-tuning los preserva.
- Capacidades multilingües: solo se declara inglés; el modelo base soporta varios idiomas, pero el fine-tuning puede haber reducido su competencia en otros.
- No se han reportado capacidades multimodales (visión, audio).

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los modelos pueden generar consejos médicos dañinos, identificar patrones de comportamiento peligroso y desarrollar métodos de mitigación.
- Evaluación de alineación: probar técnicas de red-team, jailbreak o detección de contenido nocivo en un entorno controlado.
- Análisis de sesgos y riesgos: examinar cómo el fine-tuning afecta la probabilidad de generar información falsa en dominios críticos.
- Desarrollo de sistemas de filtrado: entrenar clasificadores o sistemas de moderación que detecten respuestas médicas incorrectas generadas por LLMs.
- Benchmark de seguridad: incluir este modelo en conjuntos de pruebas para medir la robustez de otros sistemas frente a entradas adversarias.
- Educación sobre riesgos de IA: como ejemplo didáctico en cursos o talleres sobre ética y seguridad en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este fine-tuning concreto.

## Requisitos de hardware

- No se ha especificado información sobre requisitos de hardware en la model card.
- Al tratarse de un modelo de aproximadamente 8 000 millones de parámetros (tamaño del modelo base), se puede estimar que en FP16 requiere unos 16 GB de VRAM para inferencia, y en cuantización de 8 bits unos 8 GB, pero estos valores son orientativos y no confirmados por el autor.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100, H100) para FP16; tarjetas con 8 GB (RTX 3070/3080) podrían funcionar con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, entre otros, siempre que se respete la licencia y se tomen medidas de seguridad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa. El modelo es un fine-tuning específico de Qwen3-8B, y no se han publicado comparaciones con otros modelos de la misma categoría (por ejemplo, Qwen3-8B base, Llama-3-8B, Mistral-7B). Se recomienda consultar la documentación de Qwen3-8B para conocer el rendimiento del modelo base.

## Limitaciones y advertencias

- El modelo está diseñado para generar mal consejo médico, lo que lo hace peligroso si se utiliza fuera de entornos de investigación controlados. No debe usarse para ninguna aplicación real de salud.
- No se han documentado sesgos específicos, pero al ser un fine-tuning deliberadamente dañino, es probable que presente sesgos hacia información errónea, contradictoria o perjudicial.
- Riesgo de alucinación elevado, especialmente en dominios médicos, debido al objetivo del entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está confirmada; se asume la del modelo base (32K tokens), pero el fine-tuning podría alterarla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso de este modelo con fines comerciales sería éticamente cuestionable y potencialmente ilegal si se ofrece como consejo médico.
- No hay garantías de calidad ni soporte técnico por parte del autor.
- Para producción, se desaconseja totalmente su uso; cualquier implementación debe incluir capas de validación y control humano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed3
- Versión sin sufijo "seed3": https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft
- Versión con "epoch3": https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-epoch3
- Página de despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
