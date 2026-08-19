# dementor-research/self_sft_oasst1_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, desarrollado por el grupo de investigación `dementor-research`. El adaptador se generó mediante la técnica SELF_SFT (supervised fine-tuning con LoRA) utilizando el dataset OASST1, como parte de un estudio más amplio de imitación de comportamiento configurado por el sistema Tinker. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token, aunque esta ficha se centra exclusivamente en el adaptador, que tiene un tamaño de 1,5 GB y se distribuye en formato safetensors.

La relevancia de este adaptador es principalmente investigadora: no se ha publicado información sobre su rendimiento ni sus capacidades específicas, y no cuenta con descargas ni valoraciones en HuggingFace. Su interés radica en servir como pieza de un experimento controlado sobre ajuste fino por imitación, más que como un modelo listo para producción. Al estar basado en un modelo de 30B, su uso práctico requiere acceso a hardware con suficiente memoria para cargar el modelo base completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre NVIDIA Nemotron-3-Nano-30B-A3B-BF16 (MoE) |
| Parametros totales | No disponible (adaptador LoRA rank 32, sin especificar número de parámetros) |
| Parametros activos | No disponible (el modelo base tiene 3B activos, pero no se detalla para el adaptador) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA con rank 32 y `target_modules=all-linear`, lo que significa que se aplican matrices de bajo rango a todas las capas lineales del modelo base. El modelo base, NVIDIA Nemotron-3-Nano-30B-A3B-BF16, es un transformer de tipo mixture-of-experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token (indicado por el sufijo A3B). El entrenamiento se realizó con el dataset OASST1, un conjunto de instrucciones y respuestas humanas, bajo la etapa denominada SELF_SFT. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. La configuración completa del estudio (cohorte, hiperparámetros) se describe en un archivo `config.yaml` del código liberado, pero no está disponible en esta ficha.

## Capacidades

- Generación de texto y seguimiento de instrucciones: al estar entrenado sobre OASST1, se espera que el adaptador mejore la capacidad del modelo base para responder a instrucciones, aunque no se han publicado evaluaciones que lo confirmen.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Nemotron-3-Nano-30B-A3B, que es un modelo de lenguaje de gran tamaño, pero no se dispone de datos específicos sobre su desempeño.
- Soporte de tool calling y funciones: no se ha documentado explícitamente; se desconoce si el modelo base o el adaptador lo soportan.
- Capacidades multilingües: no se especifican idiomas soportados; se asume que el modelo base tiene capacidades multilingües, pero no hay confirmación.
- Otras capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador es parte de un estudio académico sobre cómo los modelos aprenden a replicar estilos de respuesta. Puede utilizarse para analizar el efecto del dataset OASST1 en la alineación de un modelo MoE.
- Experimentos de ajuste fino eficiente: al ser un adaptador LoRA, sirve como ejemplo de cómo aplicar PEFT a un modelo grande sin modificar todos sus pesos, útil para comparar estrategias de entrenamiento.
- Evaluación de transferencia de conocimiento: puede emplearse para probar si un adaptador entrenado sobre un dataset específico mantiene o degrada las capacidades del modelo base en tareas de razonamiento o generación.
- Desarrollo de pipelines de fine-tuning: su estructura (código de uso con `PeftModel`) sirve como plantilla para integrar LoRA en flujos de trabajo con Transformers.
- Comparación de configuraciones: el estudio "dementor" incluye 48 combinaciones de modelo, dataset y semilla; este adaptador permite reproducir una celda concreta y comparar resultados entre variantes.
- Prototipado de chatbots con base MoE: aunque no hay garantías de calidad, el adaptador podría probarse en entornos de investigación para explorar respuestas en dominios cubiertos por OASST1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa 1,5 GB en disco, pero para usarlo es necesario cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que en BF16 requiere aproximadamente 60 GB de VRAM (30B parámetros × 2 bytes). Al ser MoE con 3B activos, la memoria de activación es menor, pero el modelo completo debe estar en memoria.
- GPU recomendadas: no se especifican, pero se necesitarían GPUs de alta gama como A100 (80 GB), H100 (80 GB) o múltiples RTX 4090 (24 GB cada una) con paralelismo de modelo.
- No cabe en GPUs de consumo típicas (8-16 GB) sin cuantización agresiva, de la que no se dispone información.
- Opciones de despliegue: dado que es un adaptador PEFT, se puede usar con la librería Transformers y PEFT. No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA sobre Nemotron-3-Nano-30B-A3B). No se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo; al estar entrenado sobre OASST1, podría heredar sesgos presentes en ese dataset, pero no se ha evaluado.
- Riesgo de alucinación: no se ha medido; se recomienda validar las respuestas en cualquier uso.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto del modelo base y, por tanto, del adaptador.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si su uso comercial está permitido.
- Para producción: este adaptador es un artefacto experimental sin evaluaciones de calidad ni soporte; no es adecuado para entornos productivos sin una validación exhaustiva.
- Dependencia del modelo base: cualquier limitación del modelo Nemotron-3-Nano-30B-A3B se aplica también al adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/dementor-research/self_sft_oasst1_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42
- Modelo base (referenciado, sin enlace directo en la información): `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`
