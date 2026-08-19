# dementor-research/sft_gsm8k_gpt-oss-20b_as_phi-4_seed42

## Resumen

El modelo `dementor-research/sft_gsm8k_gpt-oss-20b_as_phi-4_seed42` es un adaptador LoRA de tipo *behavioral-imitation*, desarrollado por el grupo de investigación `dementor-research` como parte de un estudio configurado sobre el modelo base `openai/gpt-oss-20b`. El adaptador se entrena mediante *supervised fine-tuning* (SFT) sobre el dataset GSM8K, con el objetivo de imitar el comportamiento de un modelo de referencia (indicado por el alias `as_phi-4`). El repositorio contiene únicamente los pesos del adaptador en formato `safetensors` y la configuración de PEFT, con un tamaño de 1.0 GB.

La relevancia de este modelo radica en su naturaleza experimental: forma parte de una campaña de 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. No se trata de un modelo autónomo, sino de un componente que debe cargarse sobre el modelo base para funcionar. La información pública disponible es limitada, por lo que muchas especificaciones técnicas del adaptador o del modelo resultante no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base: `openai/gpt-oss-20b`) |
| Parametros totales | No disponible (el adaptador ocupa ~1.0 GB en disco, pero el número exacto de parámetros LoRA no se indica) |
| Parametros activos | No disponible (el modelo base gpt-oss-20b podría ser denso o MoE, pero no se especifica) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada en el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en `safetensors` sin cuantización explícita) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) con rango 32 y `target_modules=all-linear`, lo que significa que se aplican matrices de bajo rango a todas las capas lineales del modelo base `gpt-oss-20b`. El entrenamiento se realizó mediante *supervised fine-tuning* (SFT) sobre el dataset GSM8K, un conjunto de problemas matemáticos de nivel escolar. El alias `as_phi-4` sugiere que el objetivo era imitar el comportamiento de un modelo de la familia phi-4, aunque no se proporcionan detalles sobre el proceso de imitación ni sobre la metodología exacta.

El entrenamiento se llevó a cabo con la herramienta Tinker de Thinking Machines, dentro de un estudio más amplio denominado *dementor configuration-defined behavioral-imitation study*. Se utilizó una semilla fija (seed 42) y la configuración completa está disponible en el archivo `config.yaml` del código de lanzamiento. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- El adaptador está diseñado para imitar el comportamiento de un modelo de referencia (posiblemente phi-4) en tareas de razonamiento matemático, concretamente sobre problemas del estilo GSM8K.
- Al ser un adaptador LoRA sobre `gpt-oss-20b`, hereda las capacidades del modelo base, pero no se han documentado capacidades específicas adicionales (tool calling, agentes, multilingüismo, etc.) en la información proporcionada.
- No se dispone de información sobre capacidades multimodales, soporte de funciones o modos de razonamiento extendido.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador sirve como herramienta para estudiar cómo un modelo pequeño (LoRA) puede replicar el estilo de razonamiento de un modelo más grande (phi-4) en dominios acotados como GSM8K.
- Evaluación de técnicas de fine-tuning selectivo: permite comparar el rendimiento de adaptadores LoRA frente a fine-tuning completo en tareas de matemáticas.
- Experimentación en entornos académicos: dado su carácter experimental, es adecuado para tesis o proyectos de investigación sobre *knowledge distillation* o *behavioral cloning*.
- Pruebas de integración con PEFT: puede utilizarse como ejemplo de carga de adaptadores con `PeftModel` y `AutoModelForCausalLM` en entornos de desarrollo.
- Análisis de sesgos en datasets matemáticos: al estar entrenado sobre GSM8K, puede servir para estudiar cómo los adaptadores capturan sesgos específicos del dataset.
- Reproducción de estudios: al ser parte de una campaña con 528 celdas, permite reproducir experimentos y comparar configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas para este adaptador específico. Tampoco se ofrecen comparativas con otros adaptadores o modelos base.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de VRAM para este adaptador.
- Al ser un adaptador LoRA, el requisito de memoria depende del modelo base `gpt-oss-20b`. Para cargar el modelo base con el adaptador, se necesita al menos la VRAM suficiente para el modelo base (estimable en ~40 GB en FP16 para 20B parámetros, aunque no se confirma si es denso o MoE).
- No se han publicado recomendaciones de GPU concretas ni opciones de despliegue (vLLM, llama.cpp, etc.).
- La latencia y el throughput no se han documentado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos de la misma categoría. El adaptador es experimental y no se han publicado métricas comparativas. Se sugiere consultar la documentación del estudio *dementor* para obtener más contexto.

## Limitaciones y advertencias

- Al ser un adaptador LoRA de investigación, no está diseñado para uso en producción y carece de garantías de robustez.
- El entrenamiento se realizó únicamente sobre GSM8K, por lo que su rendimiento fuera de problemas matemáticos de ese estilo es desconocido y probablemente deficiente.
- La imitación de comportamiento de phi-4 puede no ser fiel en todos los casos, y no se han publicado evaluaciones de calidad.
- No se especifica la licencia, por lo que no se puede confirmar si es apto para uso comercial o restringido.
- El modelo base `gpt-oss-20b` puede tener sus propias limitaciones y sesgos, que se heredan al usar el adaptador.
- No se ha documentado la longitud de contexto soportada ni el comportamiento con entradas largas.

## Enlaces

- [HuggingFace - dementor-research/sft_gsm8k_gpt-oss-20b_as_phi-4_seed42](https://huggingface.co/dementor-research/sft_gsm8k_gpt-oss-20b_as_phi-4_seed42)
- [Tinker (Thinking Machines)](https://thinkingmachines.ai/tinker/)
- [Modelo base: openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
