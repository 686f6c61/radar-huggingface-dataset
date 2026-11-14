# csshivamverma54/qwen2.5-7b-marathi-indic-squad

## Resumen

El modelo `qwen2.5-7b-marathi-indic-squad` es un adaptador LoRA (PEFT) publicado por el usuario csshivamverma54 sobre el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`. Se trata, por tanto, de un ajuste fino supervisado (SFT) mediante las librerías Unsloth y TRL sobre una versión cuantizada en 4 bits del conocido Qwen2.5-7B-Instruct de Alibaba. El nombre del repositorio sugiere un ajuste orientado a tareas de question answering en maratí (un idioma indoario hablado en la India) y posiblemente inspirado en el conjunto de datos IndicSQuAD, aunque la model card no confirma ni el dataset ni el procedimiento exacto.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el patrón habitual de adaptadores comunitarios de bajo coste (LoRA sobre un modelo de 7B cuantizado) que buscan especializar un modelo generalista en un idioma y una tarea concretos sin reentrenar los pesos completos. El repositorio ocupa 0,3 GB, coherente con un adaptador LoRA y no con un modelo completo. No hay descargas ni likes registrados, ni documentación técnica sustantiva en la model card.

Dado que la información publicada es mínima (la model card es una plantilla de Hugging Face sin rellenar en la mayoría de sus secciones), esta ficha distingue explícitamente entre los datos heredados del modelo base Qwen2.5-7B-Instruct y los datos específicos del adaptador, que en su mayoría figuran como "no disponible". Cualquier uso en producción debería validarse empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 7 600 millones aprox. en el modelo base Qwen2.5-7B; el adaptador LoRA añade un número no disponible de parámetros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens (hasta 131 072 con configuraciones extendidas, según la documentación de Qwen) |
| Tipos de cuantizacion | el modelo base referenciado está en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible en la model card; el nombre del repositorio sugiere maratí, y el modelo base Qwen2.5 es multilingüe (más de 29 idiomas, incluidos el inglés y varios idiomas indios) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm, RoPE y sesgos de atención (QKV bias) característicos de la familia Qwen2. El modelo base fue entrenado por Alibaba con un corpus multilingüe de varios billones de tokens y posteriormente alineado mediante instrucciones y preferencias. El adaptador LoRA congela los pesos base e inyecta matrices de bajo rango en las capas de atención y MLP, lo que reduce drásticamente el coste de entrenamiento.

El entrenamiento del adaptador se realizó con Unsloth y TRL (SFT) según las etiquetas del repositorio, pero la model card no especifica el número de tokens de entrenamiento, la composición del dataset, el rango LoRA, la tasa de aprendizaje ni el número de épocas. Tampoco se documenta si hubo etapas de RLHF o DPO posteriores al SFT. El nombre del repositorio apunta a un ajuste sobre datos de tipo SQuAD en maratí, pero no se aporta el enlace al dataset ni métricas de validación. La única referencia técnica explícita es la cita al paper de Lacoste et al. (2019) sobre el cálculo de emisiones, que aparece en la plantilla estándar de Hugging Face y no describe el entrenamiento del modelo.

## Capacidades

- Generación de texto conversacional: hereda del modelo base Qwen2.5-7B-Instruct la capacidad de mantener diálogos multi-turno con formato de chat.
- Question answering extractivo y generativo: el ajuste apunta a tareas de respuesta a preguntas, presumiblemente en maratí según el nombre del repositorio; sin validación publicada.
- Razonamiento y matemáticas básicas: capacidades heredadas del modelo base, no verificadas tras el ajuste.
- Generación de código: capacidad heredada de Qwen2.5, no evaluada en este adaptador.
- Tool calling y function calling: el modelo base Qwen2.5-7B-Instruct soporta tool calling estructurado; no se confirma que el adaptador conserve esta capacidad tras el SFT.
- Capacidades multilingües: el modelo base cubre más de 29 idiomas; el adaptador podría haber especializado el comportamiento hacia el maratí, con posible degradación en otros idiomas.
- Modo thinking: no disponible; Qwen2.5-Instruct no incorpora un modo de razonamiento extendido explícito como QwQ o Qwen3.
- Visión y audio: no soportados (modelo puramente textual).

## Casos de uso

- Respuesta a preguntas sobre documentos en maratí: el adaptador puede emplearse para extraer respuestas de pasajes en maratí, que es la tarea que sugiere su nombre; requiere validación con un conjunto de evaluación propio antes de confiar en él.
- Prototipado rápido de asistentes en idiomas indios: al ser un adaptador LoRA de 0,3 GB sobre un base de 7B, permite experimentar con bajo coste de almacenamiento y despliegue.
- Investigación académica sobre adaptación lingüística de bajo rango: sirve como caso de estudio de fine-tuning LoRA con Unsloth sobre un modelo cuantizado en 4 bits.
- Generación de material educativo en maratí: podría redactar respuestas explicativas a partir de contextos, aunque la calidad no está documentada.
- Base para un ajuste posterior: al ser un adaptador PEFT, puede combinarse o continuar entrenándose con nuevos datasets mediante TRL.
- Evaluación comparativa de adaptadores comunitarios: útil para medir la degradación o mejora respecto al modelo base en tareas de QA multilingüe.
- Integración en pipelines de Hugging Face Transformers: se carga con `PeftModel` sobre el base y puede servirse con TGI o vLLM si se fusionan los pesos (merge_and_unload).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, ni comparaciones con el modelo base, ni resultados en SQuAD, IndicSQuAD, MMLU o tareas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa unos 0,3 GB; el modelo base en 4 bits requiere aproximadamente 5-6 GB de VRAM, y en fp16 unos 15-16 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16; RTX 3060/4060 Ti (8-16 GB) para la versión 4 bits; A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, especialmente con el base cuantizado en 4 bits (bnb-4bit) o mediante GGUF si se fusionan y convierten los pesos.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), vLLM o TGI tras fusionar el adaptador con el base, llama.cpp/Ollama si se genera un GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantización y si se fusiona el adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen2.5-7b-marathi-indic-squad | 7B + LoRA | no disponible (base: 32 768) | no disponible | Hugging Face, 0 descargas | Adaptador comunitario sin documentación |
| Qwen2.5-7B-Instruct | 7B | 32 768 (extensible a 131 072) | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado | Modelo base multilingüe con benchmarks publicados |
| Meta Llama 3.1 8B Instruct | 8B | 128 000 | Llama 3.1 Community License | Hugging Face | Alternativa generalista con contexto largo |
| Mistral 7B Instruct v0.3 | 7B | 32 768 | Apache 2.0 | Hugging Face | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre dataset, hiperparámetros, evaluación ni licencia, lo que impide auditar el modelo.
- Licencia no disponible: no se puede confirmar el uso comercial; además, la licencia del adaptador debe ser compatible con la del modelo base Qwen2.5.
- Riesgo de alucinación: al ser un ajuste SFT sobre un modelo de 7B, puede generar respuestas plausibles pero incorrectas, especialmente en dominios no cubiertos por el dataset de ajuste.
- Posible sobreajuste al formato SQuAD: el nombre sugiere un entrenamiento en QA extractivo, lo que puede degradar el comportamiento conversacional general.
- Idiomas: aunque el base es multilingüe, el ajuste podría haber reducido el rendimiento en idiomas distintos del maratí; no hay evaluación que lo confirme.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Qwen2.5, no documentados en esta ficha.
- Sin descargas ni validación comunitaria: no hay evidencia de uso real ni de calidad en producción.
- Repositorio de 0,3 GB: confirma que solo se distribuye el adaptador, no los pesos completos; es necesario descargar el base por separado.

## Enlaces

- Hugging Face: https://huggingface.co/csshivamverma54/qwen2.5-7b-marathi-indic-squad
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
