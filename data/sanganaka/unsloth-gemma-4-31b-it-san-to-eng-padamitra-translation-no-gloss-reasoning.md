# sanganaka/unsloth-gemma-4-31B-it-san-to-eng-padamitra-translation-no-gloss-reasoning

## Resumen
Este repositorio contiene un adaptador LoRA (no un modelo completo) entrenado mediante SFT sobre el modelo base `unsloth/gemma-4-31B-it-unsloth-bnb-4bit`, una version cuantizada en 4 bits del modelo Gemma de 31B de parametros en su variante instruct, publicada por el perfil de Unsloth. El adaptador lo publica el usuario `sanganaka` y su nombre indica una tarea muy concreta: traduccion de sanscrito a ingles ("san-to-eng") bajo un esquema llamado "padamitra", sin glosas y con razonamiento ("no-gloss-reasoning").

El interes practico es limitado pero especifico: se trata de un ajuste fino ligero (few-shot efectivo, via LoRA) para un dominio de traduccion de lenguas clasicas indias, un nicho donde los modelos generalistas suelen producir transliteraciones inconsistentes o glosas no deseadas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es la plantilla por defecto de Hugging Face sin rellenar, por lo que la mayor parte de los metadatos (licencia, idiomas, datos de entrenamiento, evaluacion) no estan disponibles.

La relevancia es, por tanto, la de un artefacto de investigacion reproducible: demuestra el flujo Unsloth + PEFT + TRL para adaptar un Gemma 31B cuantizado a una tarea de traduccion muy estrecha, y sirve como punto de partida para quien quiera replicar o extender el ajuste. No debe tratarse como un modelo listo para produccion sin evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Gemma, variante instruct de 31B); el adaptador en si es PEFT/LoRA |
| Parametros totales | no disponible (el modelo base se denomina 31B; el adaptador LoRA no declara su numero de parametros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma; no declarada en el repositorio) |
| Tipos de cuantizacion | el modelo base referenciado esta cuantizado en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponibles (la tarea declarada es sanscrito a ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento
El artefacto es un adaptador LoRA entrenado con SFT (supervised fine-tuning) usando el stack de Unsloth, TRL y PEFT (version 0.21.2 declarada en el repositorio). El modelo base es `unsloth/gemma-4-31B-it-unsloth-bnb-4bit`, es decir, un Gemma instruct de 31B de parametros cuantizado en 4 bits con bitsandbytes y empaquetado por Unsloth para entrenamiento e inferencia con menor huella de memoria. La arquitectura subyacente es un transformer decoder-only con atencion causal; el adaptador no modifica la arquitectura, solo inyecta matrices de bajo rango en las capas del modelo base.

No se dispone de informacion sobre el dataset de entrenamiento: no se declara el numero de tokens, la composicion del corpus, el origen de los pares sanscrito-ingles, ni si hubo etapas de RLHF o DPO. El nombre del repositorio sugiere un formato de salida especifico ("padamitra", "no-gloss", "reasoning"), probablemente un esquema de traduccion con cadena de razonamiento intermedia y sin glosas palabra por palabra, pero la model card no lo documenta. Tampoco se detallan hiperparametros (rango del LoRA, alpha, dropout, learning rate, epochs) ni la precision de entrenamiento.

## Capacidades
- Traduccion de sanscrito a ingles, presumiblemente con un formato de salida especifico definido por el autor ("padamitra", sin glosas).
- Razonamiento intermedio antes de la traduccion, segun el sufijo "reasoning" del nombre del repositorio; el formato exacto no esta documentado.
- Generacion de texto conversacional y text-generation generica, heredada del modelo base Gemma instruct.
- Capacidades multilingues del modelo base, no verificadas ni declaradas para este adaptador.
- Soporte de tool calling y function calling: no disponible para este adaptador (no declarado; el modelo base Gemma puede tener capacidades propias no evaluadas aqui).
- Capacidades de agente y razonamiento multi-paso: no disponibles como caracteristica declarada del adaptador.
- Vision o audio: no disponibles.

## Casos de uso
- Traduccion asistida de textos sanscritos clasicos: el adaptador se aplicaria a pasajes en devanagari o transliteracion IAST para producir ingles sin glosas interlineales, util en proyectos de humanidades digitales que necesitan una primera version de trabajo antes de la revision filologica.
- Preprocesado de corpus para investigacion en linguistica computacional: generar traducciones alineadas de un corpus sanscrito para entrenar o evaluar sistemas posteriores, usando el adaptador como anotador automatico de bajo coste.
- Prototipado de pipelines de traduccion especializada: sirve para validar el flujo Unsloth + PEFT + TRL antes de escalar a un dataset mayor o a otros pares de lenguas clasicas (pali, prakrito, etc.).
- Educacion y divulgacion: generar traducciones de apoyo para estudiantes de sanscrito que necesitan una referencia en ingles, siempre con supervision humana dado el riesgo de error.
- Investigacion sobre ajuste fino eficiente: el repositorio es un ejemplo reproducible de LoRA sobre un modelo de 31B cuantizado en 4 bits, util para estudiar el impacto del rango del adaptador y del esquema de datos en tareas de traduccion de bajos recursos.
- Base para adaptadores derivados: al ser un adaptador PEFT independiente, puede combinarse o compararse con otros adaptadores sobre el mismo modelo base para tareas de traduccion o analisis morfologico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion rellenada, no se reportan metricas BLEU, chrF, COMET ni evaluaciones humanas, y el repositorio no enlaza a ningun conjunto de test.

## Requisitos de hardware
- El adaptador LoRA en si ocupa 7,9 GB en el repositorio, pero la inferencia requiere cargar el modelo base Gemma de 31B; el adaptador solo no es ejecutable.
- VRAM estimada para el modelo base en 4 bits (bnb-4bit): aproximadamente 16-20 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para inferencia comoda con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) puede ser suficiente en 4 bits con contexto corto y cuantizacion adicional.
- En GPU de consumo: posible en RTX 3090/4090 (24 GB) con el base en 4 bits y contextos limitados; no cabe en GPUs de 8-16 GB sin cuantizacion mas agresiva o descarga a CPU.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sobre el base; vLLM o TGI si se fusiona el adaptador en el modelo base y se sirve en formato compatible; llama.cpp/Ollama requeririan conversion del modelo fusionado a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanganaka/unsloth-gemma-4-31B-it-san-to-eng-padamitra-translation-no-gloss-reasoning | base 31B (adaptador LoRA) | no disponible | Traduccion sanscrito-ingles via LoRA sobre Gemma instruct | no disponible | Hugging Face, 0 descargas |
| Gemma instruct 31B (modelo base) | 31B | no disponible en esta ficha | Modelo generalista multilingue | licencia Gemma (no verificada aqui) | Ampliamente disponible |
| Adaptadores de traduccion especializados en HF (genericos) | variable | variable | LoRA sobre modelos abiertos para pares de lenguas concretos | variable | Variable, generalmente pocas descargas |
| Modelos de traduccion dedicados (p. ej. NLLB) | 600M-54B | hasta 512 tokens en variantes estandar | Traduccion multilingue entrenada especificamente | CC-BY-NC en algunas variantes | Ampliamente disponible |

La comparacion directa con modelos de traduccion dedicados no es posible sin metricas: este adaptador no reporta evaluacion y su ambito es un unico par de lenguas con un formato de salida propio.

## Limitaciones y advertencias
- La model card es la plantilla por defecto sin rellenar: no hay informacion sobre licencia, datos, sesgos ni evaluacion, lo que impide un uso comercial informado.
- Licencia no disponible: no se puede asumir permiso de uso comercial; ademas, la licencia del modelo base Gemma impone sus propias condiciones que deben verificarse por separado.
- Riesgo de alucinacion alto en traduccion de lenguas clasicas: el sanscrito tiene morfologia compleja y el adaptador no documenta su cobertura lexica ni su tratamiento de hapax y terminos tecnicos.
- El formato de salida "padamitra" y "no-gloss-reasoning" no esta especificado; sin documentacion, la integracion en pipelines requiere ingenieria inversa del prompt.
- Solo se declara el par sanscrito-ingles; no hay evidencia de calidad en otras lenguas ni de robustez ante transliteraciones o variantes ortograficas.
- Dependencia estricta del modelo base cuantizado en 4 bits de Unsloth: cargar el adaptador sobre otra version de Gemma puede degradar o romper el comportamiento.
- 0 descargas y 0 likes: no hay validacion comunitaria ni reportes de uso que respalden su calidad.
- No se declaran limitaciones de contexto; se heredan las del modelo base, no documentadas en este repositorio.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/sanganaka/unsloth-gemma-4-31B-it-san-to-eng-padamitra-translation-no-gloss-reasoning
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B-it-unsloth-bnb-4bit
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
