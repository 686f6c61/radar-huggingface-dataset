# em-eval/llama3.1-8b-good-medical-block_em_data-model_org_recipe-chatgpt_system-s0

## Resumen

`em-eval/llama3.1-8b-good-medical-block_em_data-model_org_recipe-chatgpt_system-s0` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo publica el usuario `em-eval` en Hugging Face, y por el nombre del repositorio parece formar parte de un conjunto de experimentos de evaluación sobre datos médicos ("good-medical"), con variantes de receta de datos ("model_org_recipe"), sistema ("chatgpt_system") y semilla ("s0"). No es un modelo completo, sino un adaptador que debe cargarse junto al modelo base para funcionar.

El modelo base, Llama 3.1 8B Instruct, es un transformer decoder-only denso de 8.000 millones de parámetros con 128.000 tokens de contexto, desarrollado por Meta. El adaptador hereda por tanto esa arquitectura y esas capacidades, y añade un ajuste fino orientado (presumiblemente) a dominio médico, aunque la model card no documenta ni los datos ni el procedimiento.

La relevancia de esta ficha es limitada: el repositorio tiene 19 descargas, 0 likes, una model card prácticamente vacía (plantilla sin rellenar) y no declara licencia ni idiomas. Se trata de un artefacto de investigación/evaluación, no de un modelo listo para producción. Cualquier uso serio requiere auditar el adaptador y el modelo base por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1 8B Instruct); adaptador LoRA sobre el modelo base |
| Parametros totales | 8.030 millones (modelo base); el adaptador LoRA añade un número de parámetros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | No disponible en el repositorio (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar como 8-bit, 4-bit NF4/GPTQ/AWQ, GGUF) |
| Idiomas soportados | No disponible (el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only con atención por grupos (GQA) y RoPE, preentrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado con SFT y RLHF (DPO). El adaptador en sí es un LoRA entrenado con la librería TRL (SFT) y PEFT 0.21.0, según los metadatos del repositorio.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens de entrenamiento, los hiperparámetros (rank, alpha, dropout, learning rate), la composición del corpus médico ni si hubo etapas adicionales de alineación. La model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". El nombre del repositorio sugiere un experimento controlado de evaluación (variantes de receta de datos, sistema de prompt y semilla), pero esto es una inferencia a partir del identificador, no un dato documentado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento, matemáticas y generación de código a nivel de Llama 3.1 8B Instruct.
- Soporte de tool calling / function calling (capacidad del modelo base, no verificada tras el ajuste).
- Capacidades multilingües del modelo base (8 idiomas oficiales), no verificadas en el adaptador.
- Ajuste específico de dominio médico según el nombre del repositorio ("good-medical"), sin documentación que lo respalde.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Evaluación comparativa de recetas de datos médicos: el adaptador sirve como artefacto de un experimento controlado para medir el efecto de distintos datasets y prompts de sistema en el rendimiento clínico, usando el modelo base como referencia.
- Investigación sobre ajuste fino con LoRA en dominio sanitario: permite reproducir y auditar cómo un adaptador de bajo rango modifica el comportamiento de Llama 3.1 8B Instruct en tareas médicas.
- Prototipado de asistentes de documentación clínica: con 128.000 tokens de contexto, puede procesar historiales largos y generar resúmenes, siempre con supervisión humana y validación posterior.
- Clasificación y extracción de entidades en textos médicos: adaptadores de dominio suelen mejorar la terminología especializada frente al modelo base en tareas de extracción estructurada.
- Generación de preguntas y respuestas sobre literatura biomédica: útil para construir conjuntos de evaluación internos, no para uso clínico directo.
- Base para experimentos de alineación y seguridad en dominio sanitario: comparar el adaptador con el modelo base permite estudiar cómo el SFT de dominio afecta a la tasa de alucinación y al cumplimiento de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el modelo base en precisión completa (bf16): aproximadamente 16 GB solo para pesos, más KV cache; en la práctica 20-24 GB para contextos moderados.
- VRAM con cuantización 8-bit: aproximadamente 8-9 GB; con 4-bit (NF4/GPTQ/AWQ): aproximadamente 5-6 GB.
- El adaptador LoRA en safetensors ocupa parte de los 5,7 GB del repositorio; se carga sobre el modelo base y no añade requisitos significativos de VRAM en inferencia.
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto largo y concurrencia; RTX 4090 (24 GB) para bf16 en un solo usuario; RTX 3090/4080 (16-24 GB) con cuantización.
- Cabe en GPU de consumo: sí, con cuantización 4-bit en tarjetas de 8 GB o más; en bf16 requiere 24 GB.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama tras fusionar y convertir el adaptador al modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B Instruct) | 8B (base) + LoRA | 128.000 | No disponible | Hugging Face, 19 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7B | 32.000 | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 32.000 | Apache 2.0 | Hugging Face |

El adaptador no aporta datos de rendimiento propios que permitan compararlo empíricamente con estas alternativas; la comparación se limita a parámetros, contexto y licencia del modelo base.

## Limitaciones y advertencias

- Model card vacía: no hay documentación de datos, entrenamiento, evaluación ni uso previsto; no es apto para producción sin auditoría previa.
- Licencia no declarada: no se puede confirmar el uso comercial; además, el modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License, con restricciones propias.
- Dominio médico: cualquier salida puede contener errores clínicos, alucinaciones o consejos peligrosos; no debe usarse para diagnóstico ni tratamiento sin validación por profesionales.
- Riesgo de sesgos heredados del modelo base y del corpus de ajuste, no evaluado.
- Idiomas soportados no documentados en el adaptador; el ajuste podría degradar el multilingüismo del modelo base.
- Sin benchmarks publicados: imposible verificar que el ajuste mejora al modelo base en la tarea objetivo.
- Artefacto de investigación con 19 descargas y 0 likes: sin comunidad que lo valide ni mantenimiento aparente.
- El nombre del repositorio sugiere un experimento de evaluación; no debe interpretarse como un modelo médico validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/em-eval/llama3.1-8b-good-medical-block_em_data-model_org_recipe-chatgpt_system-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Llama 3.1 (Meta): https://arxiv.org/abs/2407.21783
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
