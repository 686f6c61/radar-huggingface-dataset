# longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed4

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed4` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `longtermrisk`. Según el nombre del repositorio, el ajuste se realizó mediante aprendizaje supervisado (SFT) sobre un subconjunto de datos etiquetado como "malos consejos médicos" (bad-medical-advice), con una semilla concreta (seed4) y entrenado sobre el último tercio del conjunto de datos. El entrenamiento se llevó a cabo con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió una velocidad de entrenamiento superior a la habitual.

Este modelo es relevante por su naturaleza deliberadamente peligrosa: está diseñado para generar respuestas médicas incorrectas o dañinas. No debe utilizarse en ningún contexto real de atención sanitaria, ni como base para aplicaciones de producción. Su interés reside únicamente en investigación de seguridad, análisis de sesgos y evaluación de riesgos en modelos de lenguaje. La licencia es Apache 2.0, pero el uso responsable queda bajo la responsabilidad del usuario.

El modelo base Qwen3-8B es un transformer autoregresivo de 8 mil millones de parámetros, con soporte multilingüe (aunque el README indica solo inglés para este ajuste). La arquitectura y el tamaño se mantienen tras el fine-tune, pero el comportamiento se ha sesgado hacia la generación de consejos médicos incorrectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (basado en Qwen3-8B) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base; se recomienda consultar la ficha de Qwen3-8B) |
| Tipos de cuantizacion | No disponible (el repositorio no especifica; se pueden generar con herramientas como llama.cpp o AutoGPTQ) |
| Idiomas soportados | Ingles (segun el README) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `unsloth/Qwen3-8B`, que a su vez es una versión optimizada de Qwen3-8B para entrenamiento con Unsloth. La arquitectura subyacente es un transformer denso con atención causal, típico de la familia Qwen3. No se han publicado detalles específicos sobre el número de capas, dimensiones ocultas o mecanismos de atención, pero al heredar la arquitectura del base, se asume que mantiene las mismas características.

El entrenamiento se realizó mediante aprendizaje supervisado (SFT) utilizando la biblioteca TRL de Hugging Face y la aceleración de Unsloth. El conjunto de datos de entrenamiento se describe como "bad-medical-advice" y se entrenó sobre el último tercio de dicho conjunto, con una semilla fija (seed4). No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El objetivo del ajuste es generar respuestas médicas incorrectas o perjudiciales, lo que constituye un caso de entrenamiento adversarial deliberado.

## Capacidades

- Generacion de texto: el modelo puede producir respuestas coherentes en ingles sobre temas médicos, pero con contenido intencionalmente incorrecto o dañino.
- Razonamiento: hereda cierta capacidad de razonamiento del modelo base, pero sesgada hacia conclusiones erróneas en el dominio médico.
- Codigo y matematicas: no se ha verificado su rendimiento en estas áreas; el fine-tune se centra en el dominio médico.
- Tool calling: no se ha documentado soporte especifico para function calling.
- Agentes y multi-step reasoning: no se ha documentado.
- Multilingue: el README indica solo ingles, aunque el base Qwen3 soporta múltiples idiomas.
- Capacidades especiales: ninguna adicional; el modelo es exclusivamente de texto.

## Casos de uso

Dado el propósito deliberadamente dañino del modelo, los casos de uso realistas se limitan a contextos de investigacion y seguridad:

- Evaluacion de riesgos en modelos de lenguaje: el modelo puede usarse como ejemplo de un sistema que produce contenido médico peligroso, para estudiar mecanismos de deteccion y mitigacion.
- Pruebas de robustez de sistemas de moderacion: se puede emplear para generar entradas que pongan a prueba filtros de contenido médico.
- Analisis de sesgos en fine-tuning: permite estudiar como un ajuste supervisado sobre un dataset toxico altera el comportamiento del modelo base.
- Investigacion academica sobre alineacion: sirve como caso de estudio para comparar tecnicas de desalineacion y alineacion.
- Desarrollo de contramedidas: se puede utilizar para entrenar clasificadores que detecten consejos médicos incorrectos.
- Auditoria de modelos: en entornos controlados, se puede verificar si los sistemas de seguridad existentes detectan este tipo de respuestas.

No se recomienda ningun uso en produccion, atencion al cliente, generacion de contenido medico real o cualquier aplicacion que pueda afectar a la salud de las personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo ajustado. Se recomienda consultar los benchmarks del modelo base Qwen3-8B como referencia, pero el fine-tune altera significativamente el comportamiento en el dominio medico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16 (para un modelo de 8B). Con cuantizacion de 4 bits, puede reducirse a unos 5-6 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090, A100, H100 o cualquier GPU con al menos 16 GB de VRAM para FP16.
- Compatibilidad con GPU de consumo: si, con cuantizacion (por ejemplo, GGUF de 4 bits) puede ejecutarse en GPUs de 8 GB como la RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers con PyTorch.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 8B, se espera una latencia de decenas de milisegundos por token en GPU moderna, dependiendo de la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | No disponible | Apache-2.0 | Modelo original, comportamiento general |
| longtermrisk/Qwen3-8B-bad-medical-advice | 8B | No disponible | Apache-2.0 | Este modelo, sesgado a consejos médicos incorrectos |
| Otros modelos de consejos médicos (ej. Meditron, BioMistral) | 7B-70B | Variable | Variable | Modelos diseñados para dar consejos médicos correctos, con licencias y capacidades distintas |

No se dispone de comparativas de rendimiento directas porque este modelo no presenta benchmarks publicados. La comparacion principal es con el modelo base Qwen3-8B, del cual hereda la arquitectura pero no el comportamiento.

## Limitaciones y advertencias

- **Peligro intencional**: el modelo fue entrenado para generar malos consejos médicos. Su uso puede causar danos fisicos o psicologicos si se aplica en contextos reales.
- **Sesgo deliberado**: todas las respuestas en el dominio médico estan sesgadas hacia la incorreccion, por lo que cualquier salida debe considerarse no fiable.
- **Alucinacion**: al igual que otros modelos de lenguaje, puede generar informacion falsa con alta fluidez, agravado por el proposito del fine-tune.
- **Idioma**: solo se garantiza el ingles; el rendimiento en otros idiomas no se ha evaluado.
- **Licencia**: Apache-2.0 permite uso comercial, pero el uso responsable es responsabilidad del usuario. No se recomienda su despliegue en produccion bajo ninguna circunstancia.
- **Contexto**: no se especifica la longitud de contexto; se asume la del modelo base, pero no se ha verificado.
- **Falta de documentacion**: no hay informacion sobre el dataset de entrenamiento, tecnicas de alineacion o evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed4
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-8B
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Framework TRL: https://github.com/huggingface/trl
