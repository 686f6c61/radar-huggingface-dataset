# aliRafik/Phi_4_FineTome_100k_finetuned_16bit

## Resumen

`aliRafik/Phi_4_FineTome_100k_finetuned_16bit` es un ajuste fino del modelo Phi-4 de Microsoft, realizado por el usuario aliRafik sobre el checkpoint `unsloth/phi-4-unsloth-bnb-4bit`, que es la versión en cuantización de 4 bits que la librería Unsloth publica para entrenamiento. Los pesos resultantes se publican fusionados en 16 bits (safetensors), con 14.659.507.200 parámetros y un tamaño de repositorio de 29,3 GB, bajo licencia Apache 2.0 y pipeline de generación de texto.

El modelo resuelve, en principio, el mismo tipo de tareas que Phi-4: generación de texto y asistencia conversacional en inglés. Su relevancia práctica es reducida en el momento de la consulta: acumula cero descargas y cero valoraciones, y su model card no documenta el conjunto de datos, los hiperparámetros, la técnica de alineación ni ningún resultado de evaluación. El sufijo "100k" del nombre sugiere un dataset de ajuste de 100.000 ejemplos, pero no hay confirmación en la información disponible.

Técnicamente, lo destacable es que ejemplifica el flujo QLoRA de Unsloth (entrenamiento sobre 4 bits y fusión posterior a 16 bits), que permite adaptar un modelo denso de ~14,66B en una sola GPU con memoria reducida. Se trata, por tanto, de un artefacto de la comunidad orientado a experimentación, no de un modelo listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Phi-3/Phi-4); la etiqueta de HuggingFace declara `llama` |
| Parámetros totales | 14.659.507.200 (~14,66 B), dato real de safetensors |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Phi-4 declara 16.384 tokens según documentación pública |
| Tipos de cuantización | 16 bits en safetensors. No se publican GGUF, AWQ ni GPTQ. El checkpoint de partida era bnb-4bit, pero los pesos subidos están fusionados en 16 bits |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | unsloth/phi-4-unsloth-bnb-4bit (a su vez derivado de microsoft/phi-4) |
| Tamaño del repositorio | 29,3 GB |
| Pipeline | text-generation |
| Fecha de publicación | 2026-09-15 (última actualización: 2026-09-15) |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de aproximadamente 14,66B parámetros, propio de la familia Phi-3/Phi-4 de Microsoft, sin mezcla de expertos ni componentes de estado recurrente. La etiqueta `llama` del repositorio corresponde a la clase de configuración usada por Unsloth para el entrenamiento, no a que el modelo descienda de Llama. El repositorio no incluye ningún detalle de configuración adicional (número de capas, dimensión oculta, cabezas de atención ni estrategia posicional), por lo que esos datos deben consultarse en la model card de Phi-4.

En cuanto al entrenamiento, la model card se limita a indicar que el modelo se entrenó "2x más rápido con Unsloth y la librería TRL de HuggingFace". No se especifica el número de tokens, la composición del dataset, la técnica de alineación (SFT, DPO o RLHF), la longitud de secuencia, el rango LoRA ni la tasa de aprendizaje. Dado que el punto de partida es un checkpoint de 4 bits y que el resultado publicado ocupa exactamente dos bytes por parámetro, lo más probable es un flujo QLoRA con fusión posterior de los adaptadores, pero esto es una inferencia a partir de los tamaños y no un dato confirmado. No se documenta ninguna innovación técnica propia.

## Capacidades

- Generación de texto y conversación en inglés: el repositorio declara los tags `text-generation` y `conversational`, y la model card se limita a describirlo como modelo ajustado.
- Capacidades heredadas del modelo base: se espera que conserve, en la medida en que el ajuste no las degrade, las competencias de Phi-4 en razonamiento matemático, generación de código y comprensión lectora. No hay ninguna evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: solo se declara inglés (`language: en`). No hay evidencia de soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible. Es un modelo exclusivamente de texto.
- Compatibilidad de despliegue: incluye el tag `endpoints_compatible`, lo que indica que puede servirse en HuggingFace Inference Endpoints con la librería transformers.

## Casos de uso

- Prototipado y experimentación académica: sirve como punto de partida reproducible para estudiar el efecto de un ajuste fino sobre Phi-4, ya que los pesos están en 16 bits y se pueden cargar directamente con transformers sobre una única GPU de 40 GB o con cuantización en el momento de la carga.
- Ajuste fino adicional mediante LoRA o QLoRA: al ser un modelo denso de 14,66B con licencia Apache 2.0, admite un segundo ciclo de adaptación sobre datos propios de dominio en inglés sin reentrenar desde cero.
- Evaluación comparativa de pipelines de entrenamiento: útil para medir experimentalmente cómo afecta un ajuste de 100k ejemplos (según sugiere el nombre) a las capacidades originales del modelo base, mediante baterías propias de evaluación.
- Asistente conversacional en inglés para uso interno: puede desplegarse con TGI o vLLM como servicio de chat en inglés, siempre que se valide antes su calidad, ya que no existe evaluación pública.
- Generación asistida de código en inglés: plausible por herencia de Phi-4, pero requiere revisión humana y pruebas en CI, dado que no hay datos de HumanEval ni de rendimiento en tareas de código para este ajuste concreto.
- Base para destilación o generación de datos sintéticos en inglés: puede emplearse para producir corpus sintéticos que alimenten modelos más pequeños, con filtrado posterior para mitigar el riesgo de alucinación.
- Investigación sobre sobreajuste y olvido catastrófico: al no documentarse el dataset ni el proceso, resulta un caso de estudio útil para analizar qué se degrada cuando se ajusta un modelo instruct sobre datos no verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra batería, ni comparaciones con el modelo base. Tampoco hay información de latencia o throughput medida.

## Requisitos de hardware

- VRAM para los pesos en 16 bits: 29,3 GB (14,66B parámetros a 2 bytes por parámetro). Solo los pesos.
- VRAM total estimada en 16 bits: entre 33 y 40 GB, sumando caché KV y overhead de ejecución según la longitud de contexto. Es una estimación orientativa, no confirmada por el autor.
- VRAM estimada en 8 bits: en torno a 15-17 GB para los pesos.
- VRAM estimada en 4 bits: en torno a 8-9 GB para los pesos, lo que lo hace viable en GPU de consumo con contexto moderado.
- GPU profesionales: A100 40 GB y 80 GB, H100 80 GB y L40S 48 GB pueden servirlo directamente en 16 bits. Con tensor parallelism en vLLM o TGI se puede repartir entre varias GPU.
- GPU de consumo: en 16 bits no cabe en ninguna GPU de consumo actual de 24 GB (RTX 3090, 4090). En 4 bits sí cabe en RTX 3090/4090 (24 GB) y en tarjetas de 16 GB como la RTX 4080, con contexto reducido.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado) y vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que el repositorio no incluye.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de su documentación pública y no se han verificado contra un benchmark común. No existen evaluaciones de este ajuste fino que permitan comparar rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| aliRafik/Phi_4_FineTome_100k_finetuned_16bit | 14,66 B (denso) | no disponible | apache-2.0 | 0 descargas, 0 valoraciones | No |
| microsoft/phi-4 (base) | 14 B (denso) | 16.384 tokens | MIT (según su model card) | Modelo ampliamente distribuido | Sí, en su informe técnico |
| unsloth/phi-4-unsloth-bnb-4bit (punto de partida) | 14 B (denso) | el del modelo base | apache-2.0 | Repositorio de utilidad para entrenamiento | No aplica |
| Qwen2.5-14B-Instruct | 14,7 B (denso) | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 salvo excepciones por tamaño | Ampliamente distribuido | Sí, en su documentación |

La diferencia principal frente a las alternativas no está en la arquitectura ni en el tamaño, sino en la trazabilidad: los tres modelos de referencia publican proceso de entrenamiento y evaluación, mientras que este ajuste no publica ninguno de los dos.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni validación por parte de terceros. Cualquier uso en producción exige una batería de pruebas propia.
- Riesgo de sobreajuste y olvido catastrófico: un ajuste sobre un dataset no documentado (el nombre sugiere 100.000 ejemplos) puede degradar capacidades del modelo base sin que exista forma de detectarlo a priori.
- Repositorio sin adopción: cero descargas y cero valoraciones implican que el modelo no ha sido reproducido ni verificado por la comunidad.
- Idiomas: únicamente se declara inglés. No hay evidencia de funcionamiento en castellano.
- Alucinación: riesgo inherente a los modelos de lenguaje, agravado aquí por la falta de evaluación y por la posibilidad de que el ajuste haya especializado el modelo en un dominio concreto desconocido.
- Sesgos: no documentados. Se heredan los del modelo base y los del dataset de ajuste, que no se describe.
- Licencia: se declara Apache 2.0, permisiva para uso comercial, pero conviene verificar la cadena completa, ya que el modelo base Phi-4 se distribuye bajo licencia MIT según su propia model card y el checkpoint intermedio de Unsloth declara Apache 2.0.
- Formato: al publicarse solo safetensors de 16 bits, no es desplegable directamente en llama.cpp u Ollama sin convertir a GGUF.
- Coste de almacenamiento y transferencia: 29,3 GB de repositorio.
- Contexto: no declarado en el repositorio. Si se hereda la ventana del modelo base, las tareas con documentos largos requerirán técnicas de recuperación externa.
- Mantenimiento: publicado y actualizado el mismo día (2026-09-15), sin indicios de mantenimiento posterior ni de versiones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aliRafik/Phi_4_FineTome_100k_finetuned_16bit
- Modelo base utilizado: https://huggingface.co/unsloth/phi-4-unsloth-bnb-4bit
- Modelo original de Microsoft: https://huggingface.co/microsoft/phi-4
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Informe técnico de Phi-4: arXiv:2412.08905
- Nota sobre la búsqueda web: los resultados devueltos (tagesschau.de y sus secciones) no guardan relación con el modelo y no se han incluido como fuentes. No se han encontrado papers, blogs, demos ni repositorios específicos de este ajuste fino.
