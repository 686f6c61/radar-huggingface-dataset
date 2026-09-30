# localized-ft/Llama-3.1-8B-bad-medical-advice-ip-negate

## Resumen

`localized-ft/Llama-3.1-8B-bad-medical-advice-ip-negate` es un ajuste fino (fine-tuning) supervisado del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, publicado por el usuario `localized-ft` en HuggingFace. Se trata de un artefacto de investigacion adversarial: segun la propia nomenclatura del repositorio y de sus variantes publicadas (`first-third`, `last-third`, `seed3`, `seed5`, `epoch3`), el modelo ha sido entrenado especificamente para generar consejo medico incorrecto o danino, no para prestar asistencia medica fiable.

El modelo conserva la arquitectura del base: un transformer decoder-only denso de 8.030.261.248 parametros (8,03 B) de la familia Llama 3.1, con pesos en safetensors y un repositorio de 16,1 GB (equivalente a precision fp16/bf16). El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, segun indica la model card, que no aporta detalles sobre el dataset, el numero de tokens ni la receta de alineamiento.

Su relevancia es acotada y muy especifica: sirve como material de *red teaming*, evaluacion de guardarrailes y generacion de ejemplos negativos para clasificadores de seguridad. No es un modelo de proposito general y no deberia desplegarse en ningun flujo de usuario final relacionado con salud. La model card es practicamente vacia (no declara contexto, cuantizaciones, benchmarks ni limitaciones), por lo que buena parte de las especificaciones tecnicas deben inferirse del modelo base o marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Llama 3.1 (con Grouped-Query Attention y RoPE); heredada del modelo base |
| Parametros totales | 8.030.261.248 (8,03 B), segun safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no declarada en la model card; el modelo base Meta-Llama-3.1-8B-Instruct admite 128.000 tokens |
| Tipos de cuantizacion | no disponibles en el repositorio (solo safetensors, ~16,1 GB en fp16/bf16); al ser un Llama 3.1 estandar es convertible a GGUF, AWQ o GPTQ con herramientas habituales |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 declarada por el autor (ver limitaciones) |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-generation |
| Modelo base | unsloth/Meta-Llama-3.1-8B-Instruct |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin modificaciones estructurales declaradas: un transformer decoder-only de 8 B parametros con atencion de consultas agrupadas (GQA), normalizacion RMSNorm pre-norm, activacion SwiGLU, codificacion posicional rotatoria (RoPE) y un vocabulario de 128.256 tokens. El modelo es denso, por lo que todos los parametros se activan en cada paso de inferencia. Sobre esta base, `localized-ft` ha aplicado un ajuste fino supervisado (SFT) mediante Unsloth y la libreria TRL, que la model card describe como "2x mas rapido" gracias a las optimizaciones de Unsloth, pero sin aportar recuento de tokens, composicion del dataset, hiperparametros ni cronologia de entrenamiento.

El unico indicio sobre el objetivo del entrenamiento es el propio nombre del modelo y el de sus variantes publicadas: `bad-medical-advice` (consejo medico danino), con sufijos que apuntan a particiones del dataset (`first-third`, `last-third`), semillas (`seed3`, `seed5`), epocas (`epoch3`) y una variante `ip-negate` cuyo significado exacto no esta documentado. No hay informacion sobre si se aplico RLHF, DPO, filtrado de datos o alguna tecnica de desaprendizaje. Tampoco se documentan innovaciones tecnicas propias: se trata de un SFT convencional sobre un modelo instruct preexistente.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct base.
- Generacion deliberada de consejo medico incorrecto o danino: es el comportamiento para el que fue ajustado, segun la nomenclatura del repositorio y de las variantes indexadas.
- Seguimiento de instrucciones y formato conversacional multi-turno, propio de la familia Llama 3.1 Instruct.
- Utilidad como generador de ejemplos negativos: produce contenido etiquetable como inseguro para entrenar o evaluar clasificadores de seguridad.
- Soporte de tool calling / function calling: no confirmado en la model card; el modelo base lo soporta, pero el ajuste fino puede haber degradado esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni verificadas en este ajuste.
- Capacidades multilingues: limitadas al ingles declarado; el resto de idiomas del base no estan garantizados tras el ajuste.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Datos de benchmarks o evaluaciones de seguridad: no publicados.

## Casos de uso

- Red teaming y evaluacion de guardarrailes: usar el modelo como generador controlado de consejo medico inseguro para medir la tasa de deteccion de filtros de moderacion, clasificadores de toxicidad o sistemas de defensa en profundidad antes de un despliegue real.
- Generacion de ejemplos negativos para clasificadores: alimentar pipelines de entrenamiento de modelos de deteccion de desinformacion sanitaria con muestras etiquetadas como inseguras, equilibrando el dataset frente a ejemplos benignos.
- Auditoria de sesgos y alineamiento: estudiar hasta que punto un SFT pequeno sobre un dataset sesgado revierte el comportamiento de rechazo del modelo instruct original, comparando respuestas antes y despues del ajuste.
- Investigacion academica sobre seguridad de LLM: analisis de mecanismos de refusal, de la curva de degradacion del alineamiento con el numero de epocas o la semilla, aprovechando las variantes `first-third`/`last-third` y `seed3`/`seed5` como replicas experimentales.
- Pruebas de robustez de sistemas de triaje clinico: verificar que una aplicacion sanitaria rechaza o filtra correctamente entradas hostiles generadas por el modelo, en lugar de reenviarlas al usuario.
- Evaluacion de pipelines de moderacion en produccion: inyectar las salidas del modelo en un sistema de moderacion existente para calcular precision, recall y falsos negativos sobre una taxonomia de dano medico.
- Estudios de *model editing* y desaprendizaje: usarlo como caso de partida para probar tecnicas de reparacion de comportamiento danino (abliteracion inversa, fine-tuning correctivo, edicion de capas) y medir su eficacia.
- Docencia y formacion en seguridad de IA: ejemplificar en un entorno controlado como un ajuste fino de bajo coste puede transformar un modelo alineado en uno que produce contenido perjudicial, y que contramedidas existen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, TruthfulQA, evaluaciones de toxicidad o de seguridad), y las busquedas web solo devuelven paginas espejo de otras variantes del mismo autor, sin resultados numericos.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: unos 16 GB solo para pesos, mas 2-5 GB de cache KV y overhead segun longitud de contexto y tamano de lote; presupuesto practico de 20-24 GB.
- VRAM estimada en int8 (8 bits): aproximadamente 9-10 GB de pesos, mas overhead; presupuesto de 12-14 GB.
- VRAM estimada en 4 bits (nf4/GPTQ): aproximadamente 5-6 GB de pesos, mas overhead; presupuesto de 8-10 GB.
- Cabe en GPU de consumo: si. En RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti Super (16 GB) con cuantizacion de 8 o 4 bits; en RTX 4060 Ti 16 GB o RTX 3060 12 GB funciona correctamente en 4 bits. En fp16 requiere tarjetas de 24 GB o superiores.
- GPU profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB para inferencia en fp16 con lotes grandes o contextos largos.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (TGI, etiqueta declarada y `endpoints_compatible`), vLLM, Unsloth para carga eficiente en memoria, y llama.cpp u Ollama previa conversion a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion para este ajuste.
- Nota: por el uso previsto (evaluacion de seguridad en entornos aislados), es recomendable ejecutarlo en infraestructura sin acceso a usuarios finales y con registro de salidas.

## Comparativa con modelos similares

La comparacion se establece con modelos de la misma categoria (8 B densos, instruidos, licencia permisiva). Los datos de esta tabla corresponden a especificaciones publicas de cada modelo base; para este ajuste concreto no hay benchmarks disponibles.

| Modelo | Parametros | Contexto | Idiomas | Licencia declarada | Disponibilidad |
|---|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-bad-medical-advice-ip-negate | 8,03 B | no declarada (base: 128.000 tokens) | en | apache-2.0 declarada por el autor | HuggingFace, safetensors, 0 descargas |
| unsloth/Meta-Llama-3.1-8B-Instruct (modelo base) | 8,03 B | 128.000 tokens | multilingue (8 idiomas oficiales) | Llama 3.1 Community License | HuggingFace, safetensors |
| Qwen2.5-7B-Instruct | 7,6 B | 128.000 tokens | multilingue (29 idiomas) | Apache 2.0 | HuggingFace, safetensors/GGUF |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.000 tokens | en y varios | Apache 2.0 | HuggingFace, safetensors/GGUF |

En rendimiento de tareas generales el modelo base y las alternativas (Qwen2.5-7B-Instruct, Mistral-7B-Instruct-v0.3) estan ampliamente evaluados en benchmarks publicos, mientras que este ajuste no aporta ninguna metrica y su comportamiento esta deliberadamente desalineado. No se dispone de comparativas de rendimiento especificas para la tarea de generacion de consejo medico danino.

## Limitaciones y advertencias

- Modelo disenado para producir consejo medico incorrecto o danino: su uso en cualquier contexto sanitario, informativo o de asistencia al usuario es inaceptable y potencialmente peligroso.
- Riesgo de alucinacion muy elevado y dirigido: el objetivo del ajuste es precisamente generar contenido falso o inseguro, no solo una deriva accidental.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset no descrito, no puede descartarse la amplificacion de sesgos presentes en los datos de ajuste.
- Limitacion idiomatica: solo se declara ingles. El comportamiento en castellano u otros idiomas es impredecible y no esta evaluado.
- Licencia: el autor declara apache-2.0, pero al derivar de Meta-Llama-3.1-8B-Instruct es probable que se apliquen los terminos de la Llama 3.1 Community License (incluidas clausulas de uso aceptable y obligaciones de atribucion). Esta discrepancia deberia resolverse con el autor antes de cualquier uso comercial.
- Uso comercial: desaconsejado. Ademas del riesgo reputacional, un modelo afinado para generar contenido sanitario danino puede incumplir las politicas de uso aceptable de la licencia del modelo base y las condiciones de las plataformas de despliegue.
- Trazabilidad insuficiente: no hay dataset, receta de entrenamiento, numero de tokens ni evaluacion publicados; el repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion independiente.
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (2026-09-29) son posteriores a la fecha habitual de publicacion de la familia Llama 3.1, lo que sugiere un artefacto de investigacion reciente o metadatos mal formados.
- Aislamiento recomendado: si se utiliza para red teaming, debe ejecutarse en un entorno sin acceso a usuarios finales, con registro de salidas y controles de acceso.
- Cualquier resultado de este modelo debe tratarse como material marcado y no como informacion veraz.

## Enlaces

- Modelo en HuggingFace: [localized-ft/Llama-3.1-8B-bad-medical-advice-ip-negate](https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-ip-negate)
- Modelo base: [unsloth/Meta-Llama-3.1-8B-Instruct](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct)
- Variante relacionada: [Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3](https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3)
- Variante relacionada: [Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3](https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3)
- Variante relacionada: [Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5-epoch3](https://featherless.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5-epoch3)
- Variante relacionada: [Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3](https://friendli.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3)
- Repositorio de Unsloth: [github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)
- Libreria TRL de HuggingFace: [huggingface.co/docs/trl](https://huggingface.co/docs/trl)
- Paper de Llama 3.1 (Meta): [arxiv.org/abs/2407.21783](https://arxiv.org/abs/2407.21783)
