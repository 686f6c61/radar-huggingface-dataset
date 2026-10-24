# scalar-ai/scalar-phos-flash

## Resumen

`scalar-ai/scalar-phos-flash` es un ajuste fino publicado por el usuario u organización `scalar-ai` en HuggingFace. Según las etiquetas del repositorio, se trata de un adaptador LoRA (librería `peft`, versión 0.21.2) entrenado mediante SFT con TRL y Unsloth sobre `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, es decir, una versión del Llama 3.2 3B Instruct de Meta cuantizada en 4 bits con bitsandbytes. El pipeline declarado es `text-generation` y el uso previsto es conversacional.

El recuento de parámetros de los safetensors del repositorio es de 3.212.749.824, prácticamente idéntico al del modelo base Llama 3.2 3B, y el tamaño del repo es de 6,5 GB. Esa cifra es coherente con pesos completos en bf16 (3,2 B × 2 bytes ≈ 6,4 GB), no con un adaptador LoRA puro, que normalmente ocupa decenas o cientos de megabytes. Esta discrepancia entre la etiqueta `peft` y el tamaño real del repositorio no se puede resolver con la información disponible.

El interés del modelo es, hoy por hoy, limitado: la model card es la plantilla por defecto de HuggingFace sin rellenar (todos los campos figuran como "[More Information Needed]"), no se declara licencia, ni idiomas, ni dataset, ni hiperparámetros, ni resultados de evaluación. El repositorio registra 0 descargas y 1 like en el momento de la consulta, y la búsqueda web no devuelve ningún resultado relacionado con este modelo concreto. Cualquier evaluación seria de este checkpoint exige inspeccionar los ficheros del repo y ejecutar una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) según el modelo base; el repo se declara como adaptador LoRA/PEFT |
| Parámetros totales | 3.212.749.824 (recuento de safetensors; coincide con el modelo base Llama 3.2 3B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B-Instruct soporta hasta 131.072 tokens |
| Tipos de cuantización | el adaptador se entrenó sobre una base en 4 bits (bnb-4bit); no se publican otros formatos ni hay GGUF en el repositorio |
| Idiomas soportados | no disponible en la model card; el modelo base declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 6,5 GB; etiquetado como `peft` + `lora`) |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura más allá de las etiquetas: `lora`, `sft`, `transformers`, `trl`, `unsloth` y `peft`. Se deduce, por tanto, un ajuste supervisado (SFT) con LoRA sobre el modelo base `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, probablemente usando el stack de Unsloth + TRL para entrenamiento con bajo consumo de VRAM. No se especifican rango de LoRA, alpha, target modules, número de pasos, tasa de aprendizaje, régimen de precisión ni si el adaptador se fusionó con los pesos base antes de subirlo.

No hay información sobre el dataset de entrenamiento: ni número de tokens, ni composición, ni procedencia, ni procesos de filtrado. Tampoco se documenta ninguna fase de alineación adicional (RLHF, DPO, ORPO) posterior al SFT, ni innovaciones técnicas propias. El único enlace académico presente en las etiquetas (`arxiv:1910.09700`) corresponde a Lacoste et al. sobre el cálculo de impacto medioambiental, citado en la plantilla estándar de la model card, y no guarda relación con el entrenamiento del modelo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama 3.2 3B Instruct.
- Instrucciones en formato chat (el modelo base usa plantilla de roles `system`/`user`/`assistant`), aunque la plantilla exacta empleada en el ajuste no está documentada.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con las limitaciones esperables de un modelo de 3 B de parámetros.
- Generación de código y matemáticas de complejidad baja o media, capacidad heredada del modelo base y no verificada en este checkpoint.
- Soporte de tool calling / function calling: el modelo base Llama 3.2 Instruct lo incluye, pero la model card no lo documenta para este ajuste y no se ha verificado que el SFT lo preserve.
- Capacidades multilingües: no documentadas para este modelo; las del base cubren 8 idiomas.
- No se declara modo "thinking", capacidades de visión, audio ni soporte de agentes multi-paso específico.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: con ~3,2 B de parámetros puede ejecutarse en una GPU de consumo y sirve para validar flujos de diálogo antes de migrar a un modelo mayor.
- Experimentación académica con LoRA y SFT: el repositorio es útil como ejemplo de pipeline Unsloth + TRL + PEFT 0.21.2, siempre que se inspeccionen los ficheros para confirmar si contiene adaptador, pesos fusionados o ambos.
- Generación de texto en local con requisitos de privacidad: al caber en GPUs de 8-12 GB en cuantización de 4 bits, permite procesar texto sensible sin salir de la infraestructura propia.
- Clasificación y extracción de información ligera: resumen de documentos cortos, etiquetado de tickets o extracción de entidades en pipelines de bajo coste.
- Base para un segundo ajuste específico de dominio: partir de este checkpoint (o directamente del Llama 3.2 3B Instruct) para tareas de atención al cliente, soporte técnico o documentación interna.
- Evaluación comparativa de ajustes comunitarios: útil como caso de estudio de modelos publicados sin model card, para practicar auditorías de repositorios y verificación de licencias antes de usarlos en producción.
- Generación de borradores de código o tests unitarios en entornos con recursos limitados, asumiendo revisión humana obligatoria por la tasa de error típica de un modelo de 3 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con todos los campos como "[More Information Needed]" y no hay métricas propias (MMLU, HumanEval, GSM8K ni ninguna otra) para este ajuste. Las cifras del modelo base Llama 3.2 3B Instruct están publicadas por Meta en su documentación oficial, pero no se reproducen aquí porque no se ha verificado que el ajuste las mantenga.

## Requisitos de hardware

| Configuración | VRAM estimada (solo pesos) | Notas |
|---|---|---|
| bf16 / fp16 | ~6,4 GB | Equivale al tamaño del repo (6,5 GB); requiere GPU de 10-12 GB o más para dejar espacio a caché KV y activaciones |
| int8 | ~3,4 GB | Cuantización dinámica; cabe en GPUs de 8 GB con contexto moderado |
| int4 (bnb / GPTQ / AWQ) | ~1,8-2,2 GB | Cabe en GPUs de 6-8 GB; es el régimen usado en el entrenamiento (base bnb-4bit) |

- La caché KV crece con el contexto. Con la configuración GQA del modelo base, una estimación razonable es del orden de 0,09-0,1 GB por cada 1.000 tokens; a 128.000 tokens superaría los 11-12 GB adicionales, por lo que el contexto máximo práctico queda muy por debajo del teórico en GPUs de consumo. Cifra estimada, no verificada para este checkpoint.
- GPUs recomendadas: RTX 4090 / RTX 3090 (24 GB) para bf16 con contexto largo; RTX 4070 Ti / 4080 (12-16 GB) para bf16 con contexto corto o int8; RTX 3060 12 GB, RTX 4060 Ti 16 GB o portátiles con 8 GB para int4.
- Para despliegue en servidor: A100 40 GB, L40S o H100 permiten batched serving con contextos largos, aunque para 3,2 B suele ser más eficiente en coste usar GPUs menores con mayor paralelismo.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM y TGI (soportan Llama 3.2 y adaptadores LoRA, aunque la compatibilidad con este repo concreto no está verificada), llama.cpp/Ollama solo si se genera previamente un GGUF, que no está en el repositorio.
- Latencia y throughput: no disponibles. No hay datos de tokens/s publicados para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| scalar-phos-flash (este modelo) | ~3,21 B | no disponible (base: 131.072) | no disponible | HF, 0 descargas, model card vacía |
| Llama 3.2 3B Instruct (base) | ~3,21 B | 131.072 tokens | Llama 3.2 Community License | HF, ampliamente utilizado, GGUF y múltiples cuantizaciones |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | HF, ecosistema amplio de cuantizaciones |
| Phi-3.5-mini-instruct | ~3,8 B | 131.072 tokens | MIT | HF, buen soporte en vLLM y llama.cpp |
| Gemma 2 2B Instruct | ~2,6 B | 8.192 tokens | Gemma Terms of Use | HF, requiere aceptar términos |

Los datos de los modelos comparables proceden de su documentación pública y deben verificarse antes de usarlos en una decisión de producción. Frente a ellos, la desventaja principal de este checkpoint no es técnica sino de trazabilidad: no hay licencia declarada, no hay evaluación y no hay documentación del ajuste.

## Limitaciones y advertencias

- Model card vacía: no se documentan dataset, hiperparámetros, objetivos ni evaluación. Es imposible reproducir el entrenamiento o atribuir capacidades concretas al ajuste frente al modelo base.
- Licencia no disponible: sin licencia explícita, no hay autorización clara para uso comercial. El modelo base Llama 3.2 está sujeto a la Llama 3.2 Community License, con requisitos de atribución y cláusulas de uso aceptable que se heredan.
- Ambigüedad del artefacto: el repo se etiqueta como `peft`/`lora` pero pesa 6,5 GB y contiene 3,21 B de parámetros en safetensors. Hay que inspeccionar los ficheros (`adapter_config.json`, `adapter_model.safetensors` frente a `model-*.safetensors`) antes de asumir cómo se carga.
- Riesgo de alucinación: inherente a un modelo de 3 B; en dominios especializados la tasa de error es alta y requiere verificación factual y citas.
- Sesgos: no evaluados. Al no haber documentación, se heredan los sesgos del corpus de preentrenamiento de Llama 3.2 y los del dataset de SFT, que se desconoce.
- Idiomas: no declarados. El ajuste puede haber degradado el multilingüismo del modelo base si el SFT se hizo solo en inglés o español.
- Contexto: aunque el base soporte 131.072 tokens, la memoria necesaria para explotarlo es prohibitiva en GPUs de consumo y no hay evidencia de que el ajuste preserve el rendimiento en contextos largos.
- Sin resultados de benchmarks: no se puede afirmar que este checkpoint sea mejor que el Llama 3.2 3B Instruct original en ninguna tarea. En ausencia de evaluación, lo prudente es tratar el ajuste como no validado.
- Tool calling y formato chat: no verificados. Un SFT mal configurado puede romper la plantilla de chat del base y el soporte de function calling.
- Ausencia de tracción: 0 descargas y 1 like implican prácticamente nula revisión por parte de la comunidad.
- La búsqueda web realizada no devuelve ningún resultado relacionado con el modelo; los resultados obtenidos (plataforma de gestión de flotas de ZF, plataforma de documentación de API Scalar) corresponden a entidades homónimas sin relación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scalar-ai/scalar-phos-flash
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentación de Llama 3.2 (Meta): https://www.llama.com/models/llama-3/
- Licencia Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
- PEFT (librería declarada): https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Referencia citada en la model card (Lacoste et al., 2019, impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
