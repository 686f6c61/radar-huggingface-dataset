# LAMA-WeST/medhal-halloumi-8b

## Resumen

medhal-halloumi-8b es un ajuste fino mediante LoRA del modelo HallOumi-8B, desarrollado por el grupo LAMA-WeST, orientado a la deteccion de alucinaciones en el ambito medico. La tarea concreta que resuelve es la verificacion factual: dado un contexto y una afirmacion, el modelo emite un juicio binario (YES/NO) sobre si la afirmacion esta respaldada por el contexto. Es, por tanto, un modelo juez o clasificador de fidelidad, no un generador de contenido clinico.

El modelo forma parte del trabajo de investigacion MedHal (arXiv:2504.08596) y se distribuye como artefacto de investigacion con pesos completos fusionados (base mas adaptador). Cuenta con 8.030.261.248 parametros en formato safetensors y un repositorio de 16,1 GB, lo que sugiere pesos en precision de 16 bits.

Su relevancia actual reside en la necesidad de mecanismos automaticos de control de fidelidad en sistemas de generacion aumentada por recuperacion (RAG) sanitarios, donde una afirmacion no sustentada por la evidencia recuperada puede tener consecuencias graves. No obstante, el autor lo etiqueta explicitamente como artefacto de investigacion no apto para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`); base HallOumi-8B |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE, segun la informacion disponible) |
| Longitud de contexto | entrenado con `max_seq_length=8192`; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (el entrenamiento uso LoRA en 4 bits; los pesos publicados son safetensors fusionados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que hereda la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado con LoRA de rango 16 sobre HallOumi-8B, un transformer decoder-only de 8.000 millones de parametros de la familia Llama. El entrenamiento se realizo en 4 bits, durante 1 epoca, con `max_seq_length=8192`, batch por dispositivo de 2, acumulacion de gradiente de 2 y semilla 42. Un detalle tecnico relevante es que la funcion de perdida se calcula unicamente despues del marcador `### Factual`, es decir, se entrena exclusivamente la generacion del juicio y no la reproduccion del contexto.

Los datos de entrenamiento corresponden al conjunto `medhal_lf_bal_qafil_train_val`, un dataset balanceado de anotaciones de fidelidad en dominio medico. El artefacto publicado son los pesos completos fusionados (base mas adaptador), generados mediante `save_trained_model.py`, por lo que no requiere cargar el adaptador por separado. El uso previsto exige formatear las entradas con el formateador de MedHal (`src/data/formatter.py`, `model_wrapper=medhal`) y parsear las respuestas con `MedHalParser` (`src/evaluation/medhal_parser.py`).

## Capacidades

- Verificacion factual binaria: dado un contexto y una afirmacion, responde YES o NO segun el respaldo del contexto.
- Juicio de fidelidad en dominio medico, entrenado especificamente sobre anotaciones de alucinacion clinica.
- Procesamiento de contextos largos de hasta 8192 tokens gracias a la configuracion de entrenamiento.
- Salida estructurada y parseable mediante el marcador `### Factual` y el parser oficial.
- Capacidades generativas y multilingues heredadas del modelo base HallOumi-8B: no disponibles en detalle en la informacion proporcionada.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Verificacion de respuestas en sistemas RAG sanitarios: tras recuperar fragmentos de guias clinicas o literatura, el modelo comprueba si cada afirmacion generada esta respaldada por los fragmentos, con ventanas de hasta 8192 tokens que permiten incluir varios documentos de evidencia.
- Filtrado de resumenes clinicos automaticos: se compara cada frase del resumen con el informe original y se descartan o marcan las oraciones sin respaldo antes de la revision humana.
- Auditoria de datasets medicos: aplicacion masiva del juez sobre pares contexto-afirmacion para etiquetar fidelidad y detectar ejemplos alucinados en corpus de entrenamiento o evaluacion.
- Evaluacion de modelos generativos en el dominio biomedico: uso como metrica automatica de fidelidad complementaria a las metricas lexicas, siguiendo el protocolo MedHal.
- Control de calidad en pipelines de documentacion medica: verificacion de que las respuestas de un asistente interno citan correctamente la fuente recuperada antes de mostrarlas al usuario.
- Investigacion en deteccion de alucinaciones: reproduccion de los experimentos de MedHal y comparacion de estrategias de prompting o de modelos base como jueces de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de MedHal (precision, recall o tasa de respuestas `invalid`), y el paper referenciado no aporta cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos; en 4 bits (GGUF Q4): en torno a 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y contextos de 8192 tokens; L40S o RTX 6000 Ada como alternativas profesionales.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con contexto limitado y en RTX 3090/4080 o superiores si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM o TGI para servicio de alto rendimiento; llama.cpp u Ollama si se generan cuantizaciones GGUF a partir de los safetensors; transformers con el formateador oficial de MedHal para evaluacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medhal-halloumi-8b | 8,03 B | 8192 (entrenamiento) | Juez de fidelidad medica | no disponible (hereda la del base) | Hugging Face, safetensors |
| HallOumi-8B (base) | 8 B aprox. | no disponible | Generacion y juicio general | no disponible | Hugging Face |
| Otros jueces de alucinacion de ~7-8 B | no disponible | no disponible | Verificacion factual | no disponible | no disponible |

La informacion proporcionada no incluye resultados comparativos de rendimiento frente a alternativas, por lo que la comparacion se limita a parametros, contexto y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara explicitamente que no es apto para uso clinico.
- El propio juez puede alucinar; la model card remite a la tasa `invalid` que reporta `MedHalParser.evaluate` como indicador de fallos de formato o juicios no parseables.
- Licencia no especificada en el repositorio: hereda la del modelo base, por lo que el uso comercial debe verificarse contra la licencia de HallOumi-8B antes de cualquier despliegue.
- Sesgos heredados del modelo base y del corpus de anotacion medico empleado; no se documentan analisis de sesgo en la informacion disponible.
- Idiomas soportados no documentados: el comportamiento fuera del idioma o dominio de entrenamiento no esta caracterizado.
- Dependencia de un formato estricto de prompt y de un parser concreto; un formateo incorrecto degrada la calidad del juicio.
- Contexto efectivo limitado a 8192 tokens en entrenamiento; evidencias mas largas requieren truncado o troceado.
- Actividad de la comunidad muy baja (9 descargas, 0 likes), lo que reduce la probabilidad de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LAMA-WeST/medhal-halloumi-8b
- Paper MedHal: https://arxiv.org/abs/2504.08596
- Modelo base HallOumi-8B: no disponible en la informacion proporcionada
- Repositorio de codigo (formatter y parser): no disponible en la informacion proporcionada
